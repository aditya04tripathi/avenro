import {
  BadRequestException,
  ConsoleLogger,
  RequestMethod,
  type Type,
  type ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  type NestNodeApplication,
  NodeAdapter,
  type NodeAdapterOptions,
  type NodeRequest,
  type NodeResponse,
} from '@nestjs/platform-node';

import { HttpExceptionFilter } from './common/http/http-exception.filter.js';
import { requestIdMiddleware } from './common/http/request-id.middleware.js';
import {
  parseShutdownGraceMs,
  parseTrustedOrigins,
  parseTrustedProxies,
} from './config/environment.js';
import { configureOpenApi } from './openapi/openapi.js';

export async function createApplication<T>(
  module: Type<T>,
  environment = process.env,
) {
  const adapter = createNodeAdapter(environment);
  const app = await NestFactory.create<NestNodeApplication>(module, adapter, {
    bodyParser: false,
    logger: new ConsoleLogger({ json: true }),
  });

  configureApplication(app, environment);
  return app;
}

export function createNodeAdapter(environment = process.env) {
  return new GracefulNodeAdapter(
    parseShutdownGraceMs(environment.SHUTDOWN_GRACE_MS),
    { trustProxy: parseTrustedProxies(environment.TRUSTED_PROXIES) },
  );
}

class GracefulNodeAdapter extends NodeAdapter {
  constructor(
    private readonly gracePeriodMs: number,
    options: NodeAdapterOptions,
  ) {
    super(options);
  }

  override beforeClose() {
    super.beforeClose();
    const server = this.getHttpServer();

    if (!server.listening) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => server.closeAllConnections(),
        this.gracePeriodMs,
      );
      timeout.unref();
      server.close((error) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

export function configureApplication(
  app: NestNodeApplication,
  environment = process.env,
) {
  const trustedOrigins = parseTrustedOrigins(environment.TRUSTED_ORIGINS ?? '');
  const port = Number(environment.PORT ?? 3001);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });
  app.use(requestIdMiddleware);
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', {
    extended: true,
    limit: '1mb',
    parameterLimit: 100,
  });
  const localEnvironment =
    environment.NODE_ENV === 'development' || environment.NODE_ENV === 'test';

  app.useSecurityHeaders({
    contentSecurityPolicy: {
      directives: {
        'upgrade-insecure-requests': localEnvironment ? false : true,
      },
    },
    strictTransportSecurity: !localEnvironment,
  });
  app.use((request: NodeRequest, response: NodeResponse, next: () => void) => {
    const origin = request.headers.origin;
    if (
      origin !== undefined &&
      (Array.isArray(origin) || !trustedOrigins.includes(origin))
    ) {
      response.statusCode = 403;
      response.end();
      return;
    }
    next();
  });
  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: false },
      validationError: { target: false, value: false },
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed',
          fieldErrors: flattenValidationErrors(errors),
        }),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  configureOpenApi(app, environment);

  const server = app.getHttpServer();
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;

  return { port, trustedOrigins };
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Array<{ path: string; code: string; message: string }> {
  return errors.flatMap((error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const ownErrors = Object.entries(error.constraints ?? {}).map(
      ([code, message]) => ({ path, code, message }),
    );
    return [
      ...ownErrors,
      ...flattenValidationErrors(error.children ?? [], path),
    ];
  });
}
