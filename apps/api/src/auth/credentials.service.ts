import { PasswordHasher } from '@nestjs/authentication';
import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '@/generated/prisma/client.js';

import type { User } from './users.service.js';
import { UsersService } from './users.service.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(password);
    try {
      return await this.usersService.create(email, {
        passwordHash,
        displayName,
        emailVerified: false,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async verify(email: string, password: string): Promise<User | null> {
    const found = await this.usersService.findCredentials(email);
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );

    if (!valid || !found?.passwordHash) {
      return null;
    }

    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      const upgradedHash = await this.passwordHasher.hash(password);
      await this.usersService.updatePasswordHash(found.user.id, upgradedHash);
    }

    return found.user;
  }
}
