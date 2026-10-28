import { redactLogContext } from './redact-log-context.js';

describe('redactLogContext', () => {
  it('redacts sensitive fields recursively and signed URL query parameters', () => {
    expect(
      redactLogContext({
        authorization: 'Bearer private',
        headers: { cookie: 'session=private' },
        password: 'private',
        resetToken: 'private',
        signedUrl: 'https://files.example/object?signature=private',
        details: [{ body: { email: 'person@example.com' } }],
      }),
    ).toEqual({
      authorization: '[REDACTED]',
      headers: { cookie: '[REDACTED]' },
      password: '[REDACTED]',
      resetToken: '[REDACTED]',
      signedUrl: '[REDACTED]',
      details: [{ body: '[REDACTED]' }],
    });
  });
});
