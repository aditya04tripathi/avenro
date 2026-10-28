import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import {
  ErrorFieldDto,
  ErrorResponseDto,
} from '@/common/http/error-response.dto.js';
import { PrismaService } from '@/prisma/prisma.service.js';

import {
  HealthIndicatorDto,
  HealthResponseDto,
} from './health-response.dto.js';

@Controller('health')
@ApiTags('health')
@ApiExtraModels(HealthIndicatorDto, ErrorFieldDto, ErrorResponseDto)
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiOperation({ operationId: 'health_check' })
  @HealthCheck({ swaggerDocumentation: false })
  @Get()
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
