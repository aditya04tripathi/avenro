import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class ErrorFieldDto {
  path!: string;

  code!: string;

  message!: string;
}

@ApiExtraModels(ErrorFieldDto)
export class ErrorResponseDto {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  requestId!: string;

  @ApiPropertyOptional({ type: ErrorFieldDto, isArray: true })
  fieldErrors?: ErrorFieldDto[];
}
