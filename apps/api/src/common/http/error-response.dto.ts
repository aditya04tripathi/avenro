export class ErrorResponseDto {
  statusCode!: number;
  code!: string;
  message!: string;
  requestId!: string;
  fieldErrors?: Array<{ path: string; code: string; message: string }>;
}
