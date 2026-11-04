import { AuthenticationModule } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule, SmtpTransport } from '@nestjs/mail';

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
    MailModule.forRoot({
      transport:
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD &&
        process.env.MAIL_FROM
          ? new SmtpTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT),
              secure: Number(process.env.SMTP_PORT) === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              },
            })
          : new SmtpTransport({
              host: '127.0.0.1',
              port: 1025,
              secure: false,
            }),
      from: process.env.MAIL_FROM?.trim() || 'Avenro <noreply@example.test>',
      retry: false,
    }),
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
      emailVerification: {
        url: `${process.env.APP_ORIGIN ?? 'http://localhost:3000'}/verify-email`,
        ttl: '24h',
      },
      passwordReset: {
        url: `${process.env.APP_ORIGIN ?? 'http://localhost:3000'}/reset-password`,
        ttl: '1h',
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
