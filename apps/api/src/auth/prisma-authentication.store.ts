import { Injectable } from '@nestjs/common';
import {
  AuthenticationStorage,
  type EmailTokenPurpose,
  type EmailTokenRecord,
  type EmailTokenStore,
  type MagicLinkRecord,
  type MagicLinkStore,
  type RefreshTokenRecord,
  type RefreshTokenStore,
  type SessionRecord,
  type SessionStore,
} from '@nestjs/authentication';

import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/prisma/prisma.service.js';

type WithoutNulls<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

function withoutNulls<T extends object>(row: T): WithoutNulls<T> {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== null),
  ) as WithoutNulls<T>;
}

@Injectable()
export class PrismaAuthenticationStore
  implements SessionStore, RefreshTokenStore, MagicLinkStore, EmailTokenStore
{
  private readonly maxPending: number = 100_000;

  constructor(
    private readonly prisma: PrismaService,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({
      sessions: this,
      refreshTokens: this,
      magicLinks: this,
      emailTokens: this,
    });
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.prisma.session.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!row) {
      return undefined;
    }

    const { user, mfa, ...session } = row;
    return {
      ...withoutNulls(session),
      mfa: (mfa as 'pending' | 'verified') ?? undefined,
      metadata: (session.metadata as Record<string, unknown>) ?? undefined,
      extra: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        },
      },
    };
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.prisma.session.create({
      data: {
        id: record.id,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        lastActiveAt: record.lastActiveAt,
        mfa: record.mfa ?? null,
        metadata: (record.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });

    await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lte: record.createdAt },
      },
    });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        id,
        lastActiveAt: { lt: lastActiveAt },
      },
      data: { lastActiveAt },
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    const deleted = await this.prisma.session.deleteMany({
      where: { id },
    });

    return deleted.count > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.prisma.session.findMany({
      where: { userId },
    });

    return rows.map((row) => ({
      ...withoutNulls(row),
      mfa: (row.mfa as 'pending' | 'verified') ?? undefined,
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    }));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const row = await this.prisma.refreshToken.findUnique({
      where: { id },
    });

    if (!row) {
      return undefined;
    }

    const { revoked: _, claims, usedAt, ...token } = row;
    return {
      ...withoutNulls(token),
      usedAt: usedAt ?? undefined,
      claims: (claims as Record<string, unknown>) ?? undefined,
    };
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: record.id,
        familyId: record.familyId,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        familyExpiresAt: record.familyExpiresAt,
        usedAt: record.usedAt ?? null,
        claims: (record.claims as Prisma.InputJsonValue) ?? undefined,
      },
    });

    await this.prisma.refreshToken.deleteMany({
      where: {
        familyExpiresAt: { lte: record.createdAt },
      },
    });
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    const updated = await this.prisma.refreshToken.updateMany({
      where: {
        id,
        usedAt: null,
      },
      data: {
        usedAt: at,
      },
    });

    return updated.count === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revoked: true },
    });
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const found = await this.prisma.refreshToken.findFirst({
      where: {
        familyId,
        revoked: true,
      },
      select: { id: true },
    });

    return found !== null;
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async saveMagicLink(record: MagicLinkRecord): Promise<void> {
    await this.prisma.magicLink.create({
      data: {
        id: record.id,
        email: record.email,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        redirectTo: record.redirectTo ?? null,
      },
    });

    await this.trimMagicLinks(record.createdAt);
  }

  async consumeMagicLink(id: string): Promise<MagicLinkRecord | undefined> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        createdAt: Date;
        expiresAt: Date;
        redirectTo: string | null;
      }>
    >`DELETE FROM "magic_links" WHERE "id" = ${id} RETURNING "id", "email", "createdAt", "expiresAt", "redirectTo"`;

    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      email: row.email,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      redirectTo: row.redirectTo ?? undefined,
    };
  }

  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.prisma.emailToken.create({
      data: {
        id: record.id,
        purpose: record.purpose,
        userId: record.userId,
        email: record.email,
        fingerprint: record.fingerprint ?? null,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      },
    });

    await this.trimEmailTokens(record.createdAt);
  }

  async consumeEmailToken(
    id: string,
    purpose: EmailTokenPurpose,
  ): Promise<EmailTokenRecord | undefined> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        purpose: string;
        userId: string;
        email: string;
        fingerprint: string | null;
        createdAt: Date;
        expiresAt: Date;
      }>
    >`DELETE FROM "email_tokens" WHERE "id" = ${id} AND "purpose" = ${purpose} RETURNING "id", "purpose", "userId", "email", "fingerprint", "createdAt", "expiresAt"`;

    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      purpose: row.purpose as EmailTokenPurpose,
      userId: row.userId,
      email: row.email,
      fingerprint: row.fingerprint ?? undefined,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    };
  }

  async deleteUserEmailTokens(
    userId: string,
    purpose: EmailTokenPurpose,
  ): Promise<void> {
    await this.prisma.emailToken.deleteMany({
      where: { userId, purpose },
    });
  }

  private async trimMagicLinks(now: Date): Promise<void> {
    await this.prisma.magicLink.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    const cutoff = await this.prisma.magicLink.findMany({
      select: { expiresAt: true },
      orderBy: { expiresAt: 'desc' },
      take: 1,
      skip: this.maxPending,
    });

    if (cutoff.length > 0 && cutoff[0]) {
      await this.prisma.magicLink.deleteMany({
        where: {
          expiresAt: { lte: cutoff[0].expiresAt },
        },
      });
    }
  }

  private async trimEmailTokens(now: Date): Promise<void> {
    await this.prisma.emailToken.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    const cutoff = await this.prisma.emailToken.findMany({
      select: { expiresAt: true },
      orderBy: { expiresAt: 'desc' },
      take: 1,
      skip: this.maxPending,
    });

    if (cutoff.length > 0 && cutoff[0]) {
      await this.prisma.emailToken.deleteMany({
        where: {
          expiresAt: { lte: cutoff[0].expiresAt },
        },
      });
    }
  }
}
