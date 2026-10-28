import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/generated/prisma/client.js';

export function getDisposableTestDatabaseUrl(
  environment: NodeJS.ProcessEnv = process.env,
) {
  if (environment.NODE_ENV !== 'test') {
    throw new Error('Disposable database access requires NODE_ENV=test');
  }

  const testUrl = environment.TEST_DATABASE_URL;
  if (!testUrl || testUrl === environment.DATABASE_URL) {
    throw new Error('A distinct TEST_DATABASE_URL is required');
  }

  let parsed: URL;
  try {
    parsed = new URL(testUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid PostgreSQL URL');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('TEST_DATABASE_URL must use PostgreSQL');
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
    throw new Error('TEST_DATABASE_URL must target a local database');
  }
  if (!/^\/avenro_test(?:_[a-z0-9]+)?$/.test(parsed.pathname)) {
    throw new Error(
      'TEST_DATABASE_URL database name must start with avenro_test',
    );
  }
  if (parsed.search || parsed.hash) {
    throw new Error(
      'TEST_DATABASE_URL must not contain query or fragment data',
    );
  }

  const productionUrl = environment.DATABASE_URL;
  if (productionUrl) {
    try {
      const production = new URL(productionUrl);
      const sameTarget =
        ['postgres:', 'postgresql:'].includes(production.protocol) &&
        production.hostname === parsed.hostname &&
        (production.port || '5432') === (parsed.port || '5432') &&
        production.pathname === parsed.pathname;
      if (sameTarget) {
        throw new Error('TEST_DATABASE_URL must not target DATABASE_URL');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('must not target')) {
        throw error;
      }
    }
  }

  return testUrl;
}

export function createDisposableTestDatabase(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const connectionString = getDisposableTestDatabaseUrl(environment);
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  return {
    client,
    async cleanup() {
      await client.$disconnect();
    },
  };
}
