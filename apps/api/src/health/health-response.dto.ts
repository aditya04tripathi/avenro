import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class HealthIndicatorDto {
  @ApiProperty({ enum: ['up', 'down'] })
  status!: 'up' | 'down';
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok'] })
  status!: 'ok';

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorDto) },
  })
  info!: Record<string, HealthIndicatorDto>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorDto) },
  })
  error!: Record<string, HealthIndicatorDto>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthIndicatorDto) },
  })
  details!: Record<string, HealthIndicatorDto>;
}
