import { SessionService, SignInService } from '@nestjs/authentication';
import { ConflictException, Injectable } from '@nestjs/common';

import { AuthRateLimitService } from './auth-rate-limit.service.js';
import { CredentialsService } from './credentials.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly signIn: SignInService,
    private readonly sessions: SessionService,
    private readonly rateLimit: AuthRateLimitService,
  ) {}

  assertRegistrationAllowed(ipAddress: string) {
    return this.rateLimit.assertRegistrationAllowed(ipAddress);
  }

  assertSignInAllowed(ipAddress: string, email: string) {
    return this.rateLimit.assertSignInAllowed(ipAddress, email);
  }

  async register(email: string, password: string, displayName?: string) {
    try {
      await this.credentials.register(email, password, displayName);
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        throw error;
      }
    }

    return { accepted: true };
  }

  async signInWithPassword(email: string, password: string) {
    const user = await this.credentials.verify(email, password);
    if (!user) {
      return null;
    }

    await this.signIn.signIn(user.id, { method: 'password' });
    return user;
  }

  listSessions(userId: string) {
    return this.sessions.list(userId);
  }

  revokeSession(sessionId: string, userId: string) {
    return this.sessions.revoke(sessionId, { userId });
  }

  signOut() {
    return this.signIn.signOut();
  }
}
