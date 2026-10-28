import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthRateLimitService } from './auth-rate-limit.service.js';
import { AuthRateLimitStore } from './auth-rate-limit.store.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CredentialsService } from './credentials.service.js';
import { PrismaAuthenticationRateLimitStore } from './prisma-authentication-rate-limit.store.js';
import { PrismaAuthenticationStore } from './prisma-authentication.store.js';
import { SessionAuth } from './session-auth.provider.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
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
  ],
})
export class AuthModule {}
