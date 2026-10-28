import { ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('returns the same registration acknowledgement for an existing address', async () => {
    const credentials = {
      register: vi.fn().mockRejectedValue(new ConflictException()),
    };
    const service = new AuthService(
      credentials as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.register('person@example.com', 'a-long-password'),
    ).resolves.toEqual({ accepted: true });
  });

  it('keeps invalid credentials indistinguishable at the service boundary', async () => {
    const credentials = { verify: vi.fn().mockResolvedValue(null) };
    const service = new AuthService(
      credentials as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.signInWithPassword('missing@example.com', 'incorrect'),
    ).resolves.toBeNull();
  });
});
