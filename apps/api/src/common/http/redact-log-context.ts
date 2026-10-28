const sensitiveKey =
  /authorization|cookie|password|secret|token|signed.?url|signature|body|credential|assertion/i;

export function redactLogContext(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactLogContext);
  }
  if (value === null || typeof value !== 'object') {
    return typeof value === 'string' ? redactSignedUrl(value) : value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      sensitiveKey.test(key) ? '[REDACTED]' : redactLogContext(entry),
    ]),
  );
}

function redactSignedUrl(value: string) {
  try {
    const url = new URL(value);
    if ([...url.searchParams.keys()].some((key) => sensitiveKey.test(key))) {
      return `${url.origin}${url.pathname}?[REDACTED]`;
    }
  } catch {}
  return value;
}
