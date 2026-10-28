import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthRateLimitService } from './auth-rate-limit.service.js';
import { AuthRateLimitStore } from './auth-rate-limit.store.js';
import { AuthRecoveryController } from './auth-recovery.controller.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CredentialsService } from './credentials.service.js';
import { PrismaAccountLinker } from './prisma-account-linker.provider.js';
import { PrismaAuthenticationRateLimitStore } from './prisma-authentication-rate-limit.store.js';
import { PrismaAuthenticationStore } from './prisma-authentication.store.js';
import { SessionAuth } from './session-auth.provider.js';
import {
  TransactionalEmailProvider,
  TransactionalPasswordResetProvider,
} from './transactional-email.provider.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, AuthRecoveryController],
  providers: [
    AuthService,
    UsersService,
    CredentialsService,
    PrismaAuthenticationStore,
    PrismaAuthenticationRateLimitStore,
    {
      provide: AuthRateLimitStore,
      useExisting: PrismaAuthenticationRateLimitStore,
    },
    AuthRateLimitService,
    SessionAuth,
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [PrismaAccountLinker]
      : []),
    ...(process.env.RESEND_API_KEY && process.env.MAIL_FROM
      ? [TransactionalEmailProvider, TransactionalPasswordResetProvider]
      : []),
  ],
})
export class AuthModule {}
