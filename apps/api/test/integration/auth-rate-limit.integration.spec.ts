import { randomUUID } from 'node:crypto';

import { PrismaAuthenticationRateLimitStore } from '../../src/auth/prisma-authentication-rate-limit.store.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';
import { createDisposableTestDatabase } from '../support/test-database.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
const rateLimitKey = process.env.AUTH_RATE_LIMIT_HMAC_KEY;

describe.skipIf(!databaseUrl || !rateLimitKey)(
  'PostgreSQL authentication rate-limit store',
  () => {
    let database: ReturnType<typeof createDisposableTestDatabase> | undefined;
    let replicaDatabase:
      ReturnType<typeof createDisposableTestDatabase> | undefined;
    let stores: PrismaAuthenticationRateLimitStore[];

    beforeAll(() => {
      database = createDisposableTestDatabase();
      replicaDatabase = createDisposableTestDatabase();
      const config = { get: () => rateLimitKey } as never;
      stores = [
        new PrismaAuthenticationRateLimitStore(
          database.client as unknown as PrismaService,
          config,
        ),
        new PrismaAuthenticationRateLimitStore(
          replicaDatabase.client as unknown as PrismaService,
          config,
        ),
      ];
    });

    afterAll(async () => {
      await database?.cleanup();
      await replicaDatabase?.cleanup();
    });

    it('enforces the boundary atomically across concurrent requests', async () => {
      const identity = randomUUID();
      const outcomes = await Promise.all(
        Array.from({ length: 40 }, (_, index) =>
          stores[index % stores.length].consume('concurrency', identity, 7, 60),
        ),
      );

      expect(outcomes.filter(Boolean)).toHaveLength(7);
      expect(outcomes.filter((allowed) => !allowed)).toHaveLength(33);
    });

    it('resets only after the next database-time window begins', async () => {
      const identity = randomUUID();
      const windowSeconds = 2;
      if (!database) {
        throw new Error('Test database was not initialized');
      }
      const boundary = await database.client.$queryRaw<
        Array<{ delayMs: number }>
      >`SELECT GREATEST(50, ceil(((floor(extract(epoch from clock_timestamp()) / ${windowSeconds}) + 1) * ${windowSeconds} - extract(epoch from clock_timestamp())) * 1000)::integer + 50) AS "delayMs"`;
      const untilBoundary = boundary?.[0]?.delayMs ?? 2_000;
      await new Promise((resolve) => setTimeout(resolve, untilBoundary));

      await expect(
        stores[0].consume('boundary', identity, 1, windowSeconds),
      ).resolves.toBe(true);
      await expect(
        stores[1].consume('boundary', identity, 1, windowSeconds),
      ).resolves.toBe(false);
      await new Promise((resolve) =>
        setTimeout(resolve, windowSeconds * 1000 + 50),
      );
      await expect(
        stores[0].consume('boundary', identity, 1, windowSeconds),
      ).resolves.toBe(true);
    });
  },
);
