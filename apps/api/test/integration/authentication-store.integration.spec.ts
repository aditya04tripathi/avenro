import {
  AuthenticationStorage,
  type EmailTokenRecord,
  type OidcTransaction,
  type SessionRecord,
} from '@nestjs/authentication';
import { authenticationStoreContract } from '@nestjs/authentication/testing';

import { randomUUID } from 'node:crypto';

import { PrismaAuthenticationStore } from '../../src/auth/prisma-authentication.store.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';
import { createDisposableTestDatabase } from '../support/test-database.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
const contractCases = authenticationStoreContract(
  async () => {
    if (!database) {
      throw new Error('Test database was not initialized');
    }

    const storage = new AuthenticationStorage();
    const store = new PrismaAuthenticationStore(
      database.client as unknown as PrismaService,
      storage,
    );

    return {
      sessions: new ContractSessionStore(store, database.client),
    };
  },
  { contracts: ['sessions'], concurrent: true },
);

let database: ReturnType<typeof createDisposableTestDatabase> | undefined;

describe.skipIf(!databaseUrl)('PostgreSQL authentication session store', () => {
  beforeAll(() => {
    database = createDisposableTestDatabase();
  });

  afterAll(async () => {
    await database?.cleanup();
  });

  for (const contract of contractCases) {
    it(contract.name, contract.run);
  }
});

class ContractSessionStore {
  constructor(
    private readonly store: PrismaAuthenticationStore,
    private readonly prisma: ReturnType<
      typeof createDisposableTestDatabase
    >['client'],
  ) {}

  getSession(id: string) {
    return this.store.getSession(id);
  }

  async createSession(record: SessionRecord) {
    await this.prisma.user.upsert({
      where: { id: record.userId },
      create: {
        id: record.userId,
        email: `${record.userId}@authentication-contract.invalid`,
      },
      update: {},
      select: { id: true },
    });
    await this.store.createSession(record);
  }

  touchSession(id: string, lastActiveAt: Date) {
    return this.store.touchSession(id, lastActiveAt);
  }

  deleteSession(id: string) {
    return this.store.deleteSession(id);
  }

  listUserSessions(userId: string) {
    return this.store.listUserSessions(userId);
  }

  deleteUserSessions(userId: string) {
    return this.store.deleteUserSessions(userId);
  }
}

describe.skipIf(!databaseUrl)('PostgreSQL authentication token stores', () => {
  let tokenDatabase: ReturnType<typeof createDisposableTestDatabase>;
  let tokenStore: PrismaAuthenticationStore;

  beforeAll(() => {
    tokenDatabase = createDisposableTestDatabase();
    tokenStore = new PrismaAuthenticationStore(
      tokenDatabase.client as unknown as PrismaService,
      new AuthenticationStorage(),
    );
  });

  afterAll(async () => {
    await tokenDatabase?.cleanup();
  });

  it('consumes email tokens atomically and only for their purpose', async () => {
    const userId = randomUUID();
    const tokenId = randomUUID();
    const now = new Date();
    const email = `${userId}@token-test.invalid`;
    await tokenDatabase.client.user.create({
      data: { id: userId, email },
      select: { id: true },
    });
    const token: EmailTokenRecord = {
      id: tokenId,
      purpose: 'password-reset',
      userId,
      email,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 60_000),
    };
    await tokenStore.saveEmailToken(token);

    await expect(
      tokenStore.consumeEmailToken(tokenId, 'email-verification'),
    ).resolves.toBeUndefined();
    const consumed = await Promise.all([
      tokenStore.consumeEmailToken(tokenId, 'password-reset'),
      tokenStore.consumeEmailToken(tokenId, 'password-reset'),
    ]);
    expect(consumed.filter(Boolean)).toHaveLength(1);
    expect(consumed.find(Boolean)).toMatchObject(token);
  });

  it('consumes a persisted OIDC transaction exactly once', async () => {
    const transaction: OidcTransaction = {
      state: randomUUID(),
      provider: 'google',
      nonce: randomUUID(),
      codeVerifier: randomUUID(),
      redirectTo: '/settings',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    };
    await tokenStore.saveOidcState(transaction);

    const consumed = await Promise.all([
      tokenStore.consumeOidcState(transaction.state),
      tokenStore.consumeOidcState(transaction.state),
    ]);
    expect(consumed.filter(Boolean)).toHaveLength(1);
    expect(consumed.find(Boolean)).toEqual(transaction);
  });
});
