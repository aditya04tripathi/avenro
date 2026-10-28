import {
  AuthenticationRegistry,
  type OAuthTokens,
  OidcAccountResolver,
  type OidcProfile,
  type OidcResolveContext,
} from '@nestjs/authentication';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class PrismaAccountLinker extends OidcAccountResolver {
  constructor(
    private readonly prisma: PrismaService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('oidc', this);
  }

  async resolveUser(
    profile: OidcProfile,
    _tokens: OAuthTokens,
    { linkTo }: OidcResolveContext,
  ): Promise<{ id: string } | null> {
    const existingIdentity = await this.prisma.providerAccount.findUnique({
      where: {
        provider_subject: {
          provider: profile.provider,
          subject: profile.subject,
        },
      },
      select: { userId: true },
    });

    if (linkTo) {
      if (existingIdentity && existingIdentity.userId !== linkTo.id) {
        throw new ConflictException('Identity belongs to another account');
      }
      if (!existingIdentity) {
        await this.prisma.providerAccount.create({
          data: {
            provider: profile.provider,
            subject: profile.subject,
            userId: linkTo.id,
          },
        });
      }
      return { id: linkTo.id };
    }

    if (existingIdentity) {
      return { id: existingIdentity.userId };
    }
    if (!profile.email || !profile.emailVerified) {
      return null;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email.trim().normalize('NFC').toLowerCase() },
      select: { id: true, emailVerified: true },
    });
    if (existingUser && !existingUser.emailVerified) {
      throw new ForbiddenException(
        'Verify this address or sign in and link the provider from your account',
      );
    }

    const user = existingUser
      ? { id: existingUser.id }
      : await this.prisma.user.create({
          data: {
            email: profile.email.trim().normalize('NFC').toLowerCase(),
            displayName: profile.name ?? '',
            photoUrl: profile.picture,
            emailVerified: true,
          },
          select: { id: true },
        });
    await this.prisma.providerAccount.create({
      data: {
        provider: profile.provider,
        subject: profile.subject,
        userId: user.id,
      },
    });
    return user;
  }
}
