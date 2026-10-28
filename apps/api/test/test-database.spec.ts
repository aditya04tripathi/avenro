import {
  createDisposableTestDatabase,
  getDisposableTestDatabaseUrl,
} from './support/test-database.js';

describe('disposable PostgreSQL guard', () => {
  const validEnvironment = {
    NODE_ENV: 'test',
    TEST_DATABASE_URL: 'postgresql://test:test@localhost:5432/avenro_test_http',
    DATABASE_URL: 'postgresql://app:secret@db.example/production',
  } as NodeJS.ProcessEnv;

  it('accepts an explicitly named local test database', () => {
    expect(getDisposableTestDatabaseUrl(validEnvironment)).toBe(
      validEnvironment.TEST_DATABASE_URL,
    );
  });

  it('refuses production URLs, non-test mode and arbitrary database names', () => {
    expect(() =>
      getDisposableTestDatabaseUrl({
        ...validEnvironment,
        NODE_ENV: 'production',
      }),
    ).toThrow();
    expect(() =>
      getDisposableTestDatabaseUrl({
        ...validEnvironment,
        TEST_DATABASE_URL: validEnvironment.DATABASE_URL,
      }),
    ).toThrow();
    expect(() =>
      getDisposableTestDatabaseUrl({
        ...validEnvironment,
        TEST_DATABASE_URL: 'postgres://test:test@localhost/prod',
      }),
    ).toThrow();
    expect(() =>
      getDisposableTestDatabaseUrl({
        ...validEnvironment,
        TEST_DATABASE_URL: 'postgres://test:test@remote/avenro_test',
      }),
    ).toThrow();
  });

  it('refuses a test URL that resolves to the configured database target', () => {
    expect(() =>
      getDisposableTestDatabaseUrl({
        ...validEnvironment,
        DATABASE_URL: 'postgresql://app:other@localhost:5432/avenro_test_http',
      }),
    ).toThrow('TEST_DATABASE_URL must not target DATABASE_URL');
  });

  it('closes the Prisma client created from the guarded test URL', async () => {
    const database = createDisposableTestDatabase(validEnvironment);
    await expect(database.cleanup()).resolves.toBeUndefined();
  });
});
