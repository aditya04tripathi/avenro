import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service.js';

export interface User {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

const normalizeEmail = (email: string): string =>
  email.trim().normalize('NFC').toLowerCase();

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    email: string,
    options: {
      passwordHash?: string | null;
      emailVerified?: boolean;
      displayName?: string;
    } = {},
  ): Promise<User> {
    const normalized = normalizeEmail(email);
    const created = await this.prisma.user.create({
      data: {
        email: normalized,
        displayName: options.displayName || normalized.split('@')[0],
        passwordHash: options.passwordHash ?? null,
        emailVerified: options.emailVerified ?? false,
      },
    });

    return {
      id: created.id,
      email: created.email,
      displayName: created.displayName,
      emailVerified: created.emailVerified,
    };
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!found) {
      return null;
    }

    return {
      id: found.id,
      email: found.email,
      displayName: found.displayName,
      emailVerified: found.emailVerified,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!found) {
      return null;
    }

    return {
      id: found.id,
      email: found.email,
      displayName: found.displayName,
      emailVerified: found.emailVerified,
    };
  }

  async findCredentials(
    email: string,
  ): Promise<{ user: User; passwordHash: string | null } | null> {
    const found = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!found) {
      return null;
    }

    return {
      user: {
        id: found.id,
        email: found.email,
        displayName: found.displayName,
        emailVerified: found.emailVerified,
      },
      passwordHash: found.passwordHash,
    };
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateEmail(id: string, email: string): Promise<User | null> {
    const normalized = normalizeEmail(email);
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: normalized,
        emailVerified: false,
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      emailVerified: updated.emailVerified,
    };
  }

  async markEmailVerified(id: string, email: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    const result = await this.prisma.user.updateMany({
      where: {
        id,
        email: normalized,
      },
      data: {
        emailVerified: true,
      },
    });

    return result.count > 0;
  }
}
