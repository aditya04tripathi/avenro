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

  it('requires complete optional mail and Google provider credentials', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        RESEND_API_KEY: 'private-key',
      }),
    ).toThrow(/RESEND_API_KEY and MAIL_FROM must be configured together/);
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        GOOGLE_CLIENT_ID: 'private-client-id',
      }),
    ).toThrow(
      /GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together/,
    );
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
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        COOKIE_SECURE: 'true',
        COOKIE_SAME_SITE: 'lax',
      }),
    ).toThrow(/AUTH_RATE_LIMIT_HMAC_KEY/);

    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        COOKIE_SECURE: 'true',
        COOKIE_SAME_SITE: 'lax',
        AUTH_RATE_LIMIT_HMAC_KEY: 'too-short',
      }),
    ).toThrow(/AUTH_RATE_LIMIT_HMAC_KEY/);
  });

  it('accepts production auth rate-limit and cookie secrets when configured', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        COOKIE_SECURE: 'true',
        COOKIE_SAME_SITE: 'lax',
        AUTH_RATE_LIMIT_HMAC_KEY: 'a'.repeat(32),
      }),
    ).not.toThrow();
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
