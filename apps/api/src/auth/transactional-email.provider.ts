import {
  AuthenticationRegistry,
  EmailVerificationHandler,
  type EmailVerificationLink,
  type PasswordResetAccount,
  PasswordResetHandler,
  type PasswordResetLink,
} from '@nestjs/authentication';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class TransactionalEmailProvider extends EmailVerificationHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('emailVerification', this);
  }

  async send(link: EmailVerificationLink | PasswordResetLink): Promise<void> {
    await this.deliver(link, 'Verify your email');
  }

  sendPasswordReset(link: PasswordResetLink): Promise<void> {
    return this.deliver(link, 'Reset your password');
  }

  private async deliver(
    link: EmailVerificationLink | PasswordResetLink,
    subject: string,
  ): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('MAIL_FROM');
    if (!apiKey || !from) {
      throw new ServiceUnavailableException('Email delivery is unavailable');
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [link.email],
        subject,
        text: `${subject}: ${link.url}`,
      }),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException('Email delivery is unavailable');
    }
  }

  async markVerified(userId: string, email: string): Promise<boolean> {
    const result = await this.prisma.user.updateMany({
      where: { id: userId, email: email.trim().normalize('NFC').toLowerCase() },
      data: { emailVerified: true },
    });
    return result.count === 1;
  }

  isVerified(user: unknown): boolean {
    return Boolean(
      user &&
      typeof user === 'object' &&
      'emailVerified' in user &&
      user.emailVerified,
    );
  }
}

@Injectable()
export class TransactionalPasswordResetProvider extends PasswordResetHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: TransactionalEmailProvider,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('passwordReset', this);
  }

  findUser(email: string): Promise<PasswordResetAccount | null> {
    return this.prisma.user.findUnique({
      where: { email: email.trim().normalize('NFC').toLowerCase() },
      select: { id: true, email: true, passwordHash: true },
    });
  }

  send(link: PasswordResetLink): Promise<void> {
    return this.mailer.sendPasswordReset(link);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
