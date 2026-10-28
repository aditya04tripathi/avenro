import {
  parseShutdownGraceMs,
  parseTrustedProxies,
  validateEnvironment,
} from './environment.js';

describe('validateEnvironment', () => {
  const validEnvironment = {
    DATABASE_URL: 'postgresql://user:password@localhost:5432/avenro',
    PORT: '3001',
    APP_ORIGIN: 'http://localhost:3000',
    TRUSTED_ORIGINS: 'http://localhost:3000',
    NODE_ENV: 'test',
  };

  it('accepts valid required configuration', () => {
    expect(validateEnvironment(validEnvironment)).toEqual(validEnvironment);
  });

  it('reports missing or malformed values without echoing their contents', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DATABASE_URL: 'postgresql://private-user:private-password@db/private',
        PORT: '0',
        APP_ORIGIN: 'not-an-origin',
      }),
    ).toThrow(/PORT must be an integer.*APP_ORIGIN must be an HTTP origin/);

    try {
      validateEnvironment({
        ...validEnvironment,
        DATABASE_URL: 'sensitive-value',
      });
    } catch (error) {
      expect(String(error)).not.toContain('sensitive-value');
    }
  });

  it('requires secure cookie configuration in production', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, NODE_ENV: 'production' }),
    ).toThrow(/Production requires COOKIE_SECURE=true/);
  });
});

describe('parseTrustedProxies', () => {
  it('disables proxy trust unless explicit addresses are configured', () => {
    expect(parseTrustedProxies(undefined)).toBe(false);
    expect(parseTrustedProxies(' 10.0.0.0/8, 127.0.0.1 ')).toEqual([
      '10.0.0.0/8',
      '127.0.0.1',
    ]);
  });
});

describe('parseShutdownGraceMs', () => {
  it('uses a safe default and validates configured grace periods', () => {
    expect(parseShutdownGraceMs(undefined)).toBe(10_000);
    expect(parseShutdownGraceMs('2500')).toBe(2500);
    expect(() => parseShutdownGraceMs('120001')).toThrow(
      'SHUTDOWN_GRACE_MS must be an integer between 0 and 120000',
    );
  });
});
