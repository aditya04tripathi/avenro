import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { NodeRequest, NodeResponse } from '@nestjs/platform-node';

import { type ErrorResponseDto } from './error-response.dto.js';
import { redactLogContext } from './redact-log-context.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<NodeRequest & { requestId?: string }>();
    const response = http.getResponse<NodeResponse>();
    const requestId = request.requestId ?? 'unavailable';
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const responseCode =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as { code?: unknown }).code
        : undefined;
    const code =
      typeof responseCode === 'string'
        ? responseCode
        : statusCode >= 500
          ? 'INTERNAL_ERROR'
          : `HTTP_${statusCode}`;
    const unboundedMessage =
      statusCode >= 500
        ? 'An unexpected error occurred'
        : getSafeMessage(exception);
    const message = unboundedMessage.slice(0, 300);

    if (statusCode >= 500) {
      this.logger.error(
        'Unexpected HTTP exception',
        undefined,
        redactLogContext({
          requestId,
          method: request.method,
        }),
      );
    }

    const body: ErrorResponseDto = {
      statusCode,
      code,
      message,
      requestId,
    };
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      Array.isArray(
        (exceptionResponse as { fieldErrors?: unknown }).fieldErrors,
      )
    ) {
      body.fieldErrors = (
        exceptionResponse as { fieldErrors: unknown[] }
      ).fieldErrors
        .slice(0, 50)
        .filter(isFieldError) as NonNullable<ErrorResponseDto['fieldErrors']>;
    }
    response.status(statusCode).json(body);
  }
}

function isFieldError(
  value: unknown,
): value is NonNullable<ErrorResponseDto['fieldErrors']>[number] {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const fieldError = value as Record<string, unknown>;
  return (
    typeof fieldError.path === 'string' &&
    fieldError.path.length <= 200 &&
    typeof fieldError.code === 'string' &&
    fieldError.code.length <= 64 &&
    typeof fieldError.message === 'string' &&
    fieldError.message.length <= 200
  );
}

function getSafeMessage(exception: unknown) {
  if (!(exception instanceof HttpException)) {
    return 'Request failed';
  }
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return response;
  }
  if (typeof response === 'object' && response !== null) {
    const message = (response as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return exception.message;
}
