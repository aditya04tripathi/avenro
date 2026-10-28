import {
  CurrentUser,
  EmailVerificationService,
  OidcService,
  PasswordResetService,
  Public,
} from '@nestjs/authentication';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { NodeRequest } from '@nestjs/platform-node';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import {
  EmailAddressDto,
  EmailTokenDto,
  PasswordResetDto,
} from './dto/email-token.dto.js';
import type { User } from './users.service.js';

@Controller('auth')
@ApiTags('authentication')
export class AuthRecoveryController {
  constructor(
    private readonly emailVerification: EmailVerificationService,
    private readonly passwordReset: PasswordResetService,
    private readonly oidc: OidcService,
    private readonly auth: AuthService,
  ) {}

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'auth_verifyEmail' })
  async verifyEmail(@Body() input: EmailTokenDto) {
    const result = await this.emailVerification.verify(input.token);
    if (!result) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { email: result.email, emailVerified: true };
  }

  @Post('email/verification')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  @ApiOperation({ operationId: 'auth_resendVerification' })
  async resendVerification(
    @CurrentUser() user: User,
    @Req() request: NodeRequest,
  ) {
    await this.auth.assertSignInAllowed(clientAddress(request), user.email);
    if (!user.emailVerified) {
      try {
        await this.emailVerification.send(user);
      } catch {
        throw new ServiceUnavailableException('Email delivery is unavailable');
      }
    }
    return { accepted: true };
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  @ApiOperation({ operationId: 'auth_requestPasswordReset' })
  async requestPasswordReset(
    @Body() input: EmailAddressDto,
    @Req() request: NodeRequest,
  ) {
    await this.auth.assertSignInAllowed(clientAddress(request), input.email);
    this.passwordReset.request(input.email);
    return { accepted: true };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'auth_resetPassword' })
  async resetPassword(@Body() input: PasswordResetDto) {
    const result = await this.passwordReset.reset(input.token, input.password);
    if (!result) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { reset: true };
  }

  @Public()
  @Get('oidc/:provider/login')
  @Redirect()
  @ApiOperation({ operationId: 'auth_startOidc' })
  startOidc(
    @Param('provider') provider: string,
    @Query('redirectTo') redirectTo?: string,
    @Query('link') link?: string,
  ) {
    return this.oidc.start(provider, { redirectTo, link: link === 'true' });
  }

  @Public()
  @Get('oidc/:provider/callback')
  @Redirect()
  @ApiOperation({ operationId: 'auth_finishOidc' })
  finishOidc(
    @Param('provider') provider: string,
    @Query() query: Record<string, string>,
  ) {
    return this.oidc.finish(provider, query);
  }
}

function clientAddress(request: NodeRequest): string {
  const address = request.ip ?? request.socket.remoteAddress ?? 'unknown';
  return address.startsWith('::ffff:') ? address.slice(7) : address;
}
