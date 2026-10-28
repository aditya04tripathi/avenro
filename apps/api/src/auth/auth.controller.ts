import {
  CurrentSession,
  CurrentUser,
  Public,
  type SessionRecord,
} from '@nestjs/authentication';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { NodeRequest } from '@nestjs/platform-node';
import {
  ApiAcceptedResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import {
  AuthSessionDto,
  AuthUserDto,
  RegistrationAcceptedDto,
} from './dto/auth-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RevokeSessionParamsDto } from './dto/revoke-session-params.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import type { User } from './users.service.js';

@Controller('auth')
@ApiTags('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ operationId: 'auth_register' })
  @ApiAcceptedResponse({ type: RegistrationAcceptedDto })
  async register(@Body() input: RegisterDto, @Req() request: NodeRequest) {
    await this.authService.assertRegistrationAllowed(clientAddress(request));
    return this.authService.register(
      input.email,
      input.password,
      input.displayName,
    );
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'auth_signIn' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse()
  async signIn(@Body() input: SignInDto, @Req() request: NodeRequest) {
    await this.authService.assertSignInAllowed(
      clientAddress(request),
      input.email,
    );
    const user = await this.authService.signInWithPassword(
      input.email,
      input.password,
    );
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
    }
    return user;
  }

  @Get('me')
  @ApiCookieAuth('sessionCookie')
  @ApiOperation({ operationId: 'auth_getMe' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUser() user: User) {
    return user;
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @ApiCookieAuth('sessionCookie')
  @ApiOperation({ operationId: 'auth_signOut' })
  @ApiNoContentResponse()
  async signOut() {
    await this.authService.signOut();
  }

  @Get('sessions')
  @ApiCookieAuth('sessionCookie')
  @ApiOperation({ operationId: 'auth_listSessions' })
  @ApiOkResponse({ type: AuthSessionDto, isArray: true })
  async sessions(
    @CurrentUser('id') userId: string,
    @CurrentSession() session: SessionRecord,
  ) {
    const rows = await this.authService.listSessions(userId);
    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      lastActiveAt: row.lastActiveAt,
      current: row.id === session.id,
    }));
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('sessionCookie')
  @ApiOperation({ operationId: 'auth_revokeSession' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async revokeSession(
    @CurrentUser('id') userId: string,
    @CurrentSession() session: SessionRecord,
    @Param() params: RevokeSessionParamsDto,
  ) {
    const sessionId = params.id;
    if (sessionId === session.id) {
      await this.authService.signOut();
      return;
    }
    const revoked = await this.authService.revokeSession(sessionId, userId);
    if (!revoked) {
      throw new NotFoundException();
    }
  }
}

function clientAddress(request: NodeRequest): string {
  const address = request.ip ?? request.socket.remoteAddress ?? 'unknown';
  return address.startsWith('::ffff:') ? address.slice(7) : address;
}
