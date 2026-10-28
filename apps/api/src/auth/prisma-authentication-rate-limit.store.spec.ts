import { ServiceUnavailableException } from '@nestjs/common';

import { PrismaAuthenticationRateLimitStore } from './prisma-authentication-rate-limit.store.js';

describe('PrismaAuthenticationRateLimitStore', () => {
  it('fails closed when its HMAC key is absent', async () => {
    const prisma = { $queryRaw: vi.fn() };
    const config = { get: vi.fn().mockReturnValue(undefined) };
    const store = new PrismaAuthenticationRateLimitStore(
      prisma as never,
      config as never,
    );

    await expect(
      store.consume('sign-in-ip', '192.0.2.1', 5, 60),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('fails closed when the shared database counter is unavailable', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('offline')),
    };
    const config = { get: vi.fn().mockReturnValue('x'.repeat(32)) };
    const store = new PrismaAuthenticationRateLimitStore(
      prisma as never,
      config as never,
    );

    await expect(
      store.consume('sign-in-ip', '192.0.2.1', 5, 60),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
