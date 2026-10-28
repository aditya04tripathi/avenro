import { ForbiddenException } from '@nestjs/common';

import { PrismaAccountLinker } from './prisma-account-linker.provider.js';

describe('PrismaAccountLinker', () => {
  const profile = {
    provider: 'google',
    subject: 'provider-subject',
    email: 'person@example.com',
    emailVerified: true,
    claims: {},
  };

  it('refuses matching an unverified local address', async () => {
    const prisma = {
      providerAccount: { findUnique: vi.fn().mockResolvedValue(null) },
      user: {
        findUnique: vi
          .fn()
          .mockResolvedValue({ id: 'user-1', emailVerified: false }),
      },
    };
    const linker = new PrismaAccountLinker(
      prisma as never,
      { registerHandler: vi.fn() } as never,
    );

    await expect(
      linker.resolveUser(profile, {} as never, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.providerAccount.create).toBeUndefined();
  });

  it('refuses an unverified provider email without looking up local accounts', async () => {
    const prisma = {
      providerAccount: { findUnique: vi.fn().mockResolvedValue(null) },
      user: { findUnique: vi.fn() },
    };
    const linker = new PrismaAccountLinker(
      prisma as never,
      { registerHandler: vi.fn() } as never,
    );

    await expect(
      linker.resolveUser({ ...profile, emailVerified: false }, {} as never, {}),
    ).resolves.toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('links provider identities only to the explicitly authenticated account', async () => {
    const create = vi.fn().mockResolvedValue({});
    const prisma = {
      providerAccount: {
        findUnique: vi.fn().mockResolvedValue(null),
        create,
      },
      user: { findUnique: vi.fn() },
    };
    const linker = new PrismaAccountLinker(
      prisma as never,
      { registerHandler: vi.fn() } as never,
    );

    await expect(
      linker.resolveUser(profile, {} as never, { linkTo: { id: 'user-2' } }),
    ).resolves.toEqual({ id: 'user-2' });
    expect(create).toHaveBeenCalledWith({
      data: {
        provider: 'google',
        subject: 'provider-subject',
        userId: 'user-2',
      },
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
