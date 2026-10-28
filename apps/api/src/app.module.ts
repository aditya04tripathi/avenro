import { AuthenticationModule, google } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnvironment } from './config/environment.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d',
        cookie: { secure: true, sameSite: 'lax', path: '/' },
        trustedOrigins: (process.env.TRUSTED_ORIGINS ?? '')
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      },
      ...(process.env.RESEND_API_KEY && process.env.MAIL_FROM
        ? {
            emailVerification: {
              url: `${process.env.APP_ORIGIN}/verify-email`,
              ttl: '24h',
            },
            passwordReset: {
              url: `${process.env.APP_ORIGIN}/reset-password`,
              ttl: '1h',
            },
          }
        : {}),
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            oidc: {
              callbackUrl: `${process.env.APP_ORIGIN}/api/v1/auth/oidc/:provider/callback`,
              providers: {
                google: google({
                  clientId: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                }),
              },
            },
          }
        : {}),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
