import { HttpException, HttpStatus } from '@nestjs/common';

import { AuthRateLimitService } from './auth-rate-limit.service.js';

describe('AuthRateLimitService', () => {
  it('stops account-specific checks after the shared IP limit is reached', async () => {
    const store = { consume: vi.fn().mockResolvedValue(false) };
    const service = new AuthRateLimitService(store as never);

    await expect(
      service.assertSignInAllowed('192.0.2.10', 'person@example.com'),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    } satisfies Partial<HttpException>);
    expect(store.consume).toHaveBeenCalledTimes(1);
    expect(store.consume).toHaveBeenCalledWith(
      'sign-in-ip',
      '192.0.2.10',
      60,
      15 * 60,
    );
  });

  it('applies the account limit after the shared IP limit', async () => {
    const store = {
      consume: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
    };
    const service = new AuthRateLimitService(store as never);

    await expect(
      service.assertSignInAllowed('192.0.2.10', ' PERSON@EXAMPLE.COM '),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    } satisfies Partial<HttpException>);
    expect(store.consume).toHaveBeenNthCalledWith(
      2,
      'sign-in-email',
      'person@example.com',
      8,
      15 * 60,
    );
  });
});
