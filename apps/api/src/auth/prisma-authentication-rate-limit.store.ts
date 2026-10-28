import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createHmac } from 'node:crypto';

import { PrismaService } from '@/prisma/prisma.service.js';

import { AuthRateLimitStore } from './auth-rate-limit.store.js';

@Injectable()
export class PrismaAuthenticationRateLimitStore implements AuthRateLimitStore {
  private readonly key: string | undefined;
  private nextCleanupAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.key = config.get<string>('AUTH_RATE_LIMIT_HMAC_KEY');
  }

  async consume(
    scope: string,
    identity: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    if (
      !this.key ||
      Buffer.byteLength(this.key, 'utf8') < 32 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      !Number.isSafeInteger(windowSeconds) ||
      windowSeconds < 1
    ) {
      throw new ServiceUnavailableException(
        'Authentication rate limiter unavailable',
      );
    }

    const keyHash = createHmac('sha256', this.key)
      .update(scope)
      .update('\0')
      .update(identity)
      .digest('hex');

    try {
      const rows = await this.prisma.$queryRaw<
        Array<{ attemptCount: number }>
      >`INSERT INTO "authentication_rate_limits" ("keyHash", "windowStart", "attemptCount", "expiresAt")
        VALUES (
          ${keyHash},
          to_timestamp(floor(extract(epoch from clock_timestamp()) / ${windowSeconds}) * ${windowSeconds}),
          1,
          to_timestamp(floor(extract(epoch from clock_timestamp()) / ${windowSeconds}) * ${windowSeconds}) + (${windowSeconds} * interval '1 second')
        )
        ON CONFLICT ("keyHash") DO UPDATE SET
          "windowStart" = GREATEST("authentication_rate_limits"."windowStart", EXCLUDED."windowStart"),
          "attemptCount" = CASE
            WHEN "authentication_rate_limits"."windowStart" < EXCLUDED."windowStart" THEN 1
            ELSE LEAST("authentication_rate_limits"."attemptCount" + 1, ${limit + 1})
          END,
          "expiresAt" = GREATEST("authentication_rate_limits"."expiresAt", EXCLUDED."expiresAt")
        RETURNING "attemptCount"`;
      const row = rows[0];
      if (!row) {
        throw new Error('Rate-limit counter did not return a row');
      }

      await this.cleanupExpiredCounters();
      return row.attemptCount <= limit;
    } catch {
      throw new ServiceUnavailableException(
        'Authentication rate limiter unavailable',
      );
    }
  }

  private async cleanupExpiredCounters(): Promise<void> {
    if (Date.now() < this.nextCleanupAt) {
      return;
    }
    this.nextCleanupAt = Date.now() + 60_000;

    await this.prisma.$executeRaw`WITH expired AS (
      SELECT "keyHash"
      FROM "authentication_rate_limits"
      WHERE "expiresAt" <= clock_timestamp()
      ORDER BY "expiresAt"
      LIMIT 100
      FOR UPDATE SKIP LOCKED
    )
    DELETE FROM "authentication_rate_limits" AS limits
    USING expired
    WHERE limits."keyHash" = expired."keyHash"`;
  }
}
