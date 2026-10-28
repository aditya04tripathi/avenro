import {
  AuthenticationStorage,
  type SessionRecord,
} from '@nestjs/authentication';
import { authenticationStoreContract } from '@nestjs/authentication/testing';

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
