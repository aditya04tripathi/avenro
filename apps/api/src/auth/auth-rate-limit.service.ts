import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { AuthRateLimitStore } from './auth-rate-limit.store.js';
import { normalizeEmail } from './users.service.js';

@Injectable()
export class AuthRateLimitService {
  constructor(private readonly store: AuthRateLimitStore) {}

  async assertRegistrationAllowed(ipAddress: string): Promise<void> {
    const allowed = await this.consume(
      'registration-ip',
      ipAddress,
      5,
      60 * 60,
    );
    if (!allowed) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertSignInAllowed(ipAddress: string, email: string): Promise<void> {
    const ipAllowed = await this.consume('sign-in-ip', ipAddress, 60, 15 * 60);
    if (!ipAllowed) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const emailAllowed = await this.consume(
      'sign-in-email',
      normalizeEmail(email),
      8,
      15 * 60,
    );
    if (!emailAllowed) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async consume(
    scope: string,
    identity: string,
    limit: number,
    windowSeconds: number,
  ) {
    try {
      return await this.store.consume(scope, identity, limit, windowSeconds);
    } catch {
      throw new ServiceUnavailableException(
        'Authentication rate limiter unavailable',
      );
    }
  }
}
