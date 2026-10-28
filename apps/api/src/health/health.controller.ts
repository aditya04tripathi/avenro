import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { PrismaService } from '@/prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'web',
          this.configService.getOrThrow<string>('APP_ORIGIN'),
        ),
      () => this.prisma.pingCheck('database', this.prismaService),
    ]);
  }
}
