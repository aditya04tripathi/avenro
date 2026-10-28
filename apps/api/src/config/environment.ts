export type RuntimeEnvironment = NodeJS.ProcessEnv;

const databaseProtocols = new Set(['postgres:', 'postgresql:']);
const sameSiteValues = new Set(['strict', 'lax', 'none']);

function isOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin === value
    );
  } catch {
    return false;
  }
}

export function validateEnvironment(environment: RuntimeEnvironment) {
  const errors: string[] = [];
  const databaseUrl = environment.DATABASE_URL?.trim();
  const port = environment.PORT?.trim();
  const appOrigin = environment.APP_ORIGIN?.trim();
  const trustedOrigins =
    environment.TRUSTED_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  if (!databaseUrl) {
    errors.push('DATABASE_URL is required');
  } else {
    try {
      if (!databaseProtocols.has(new URL(databaseUrl).protocol)) {
        errors.push('DATABASE_URL must use PostgreSQL');
      }
    } catch {
      errors.push('DATABASE_URL must be a valid PostgreSQL URL');
    }
  }

  if (
    !port ||
    !/^\d+$/.test(port) ||
    Number(port) < 1 ||
    Number(port) > 65535
  ) {
    errors.push('PORT must be an integer between 1 and 65535');
  }

  if (!appOrigin || !isOrigin(appOrigin)) {
    errors.push('APP_ORIGIN must be an HTTP origin');
  }

  if (
    trustedOrigins.length === 0 ||
    trustedOrigins.some((origin) => !isOrigin(origin))
  ) {
    errors.push('TRUSTED_ORIGINS must contain comma-separated HTTP origins');
  }

  if (
    appOrigin &&
    trustedOrigins.length > 0 &&
    !trustedOrigins.includes(appOrigin)
  ) {
    errors.push('TRUSTED_ORIGINS must include APP_ORIGIN');
  }

  if (environment.NODE_ENV === 'production') {
    const sameSite = environment.COOKIE_SAME_SITE?.toLowerCase();
    if (
      environment.COOKIE_SECURE !== 'true' ||
      !sameSite ||
      !sameSiteValues.has(sameSite)
    ) {
      errors.push(
        'Production requires COOKIE_SECURE=true and a valid COOKIE_SAME_SITE',
      );
    }
    if (sameSite === 'none' && environment.COOKIE_SECURE !== 'true') {
      errors.push('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
  }

  return environment;
}

export function parseTrustedProxies(
  value: string | undefined,
): string[] | false {
  if (!value?.trim()) {
    return false;
  }

  return value
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);
}

export function parseTrustedOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function parseShutdownGraceMs(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return 10_000;
  }

  const milliseconds = Number(value);
  if (
    !Number.isInteger(milliseconds) ||
    milliseconds < 0 ||
    milliseconds > 120_000
  ) {
    throw new Error(
      'SHUTDOWN_GRACE_MS must be an integer between 0 and 120000',
    );
  }

  return milliseconds;
}
