import { RequestMethod, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  type NestNodeApplication,
  NodeAdapter,
  type NodeAdapterOptions,
  type NodeRequest,
  type NodeResponse,
} from '@nestjs/platform-node';

import {
  parseShutdownGraceMs,
  parseTrustedOrigins,
  parseTrustedProxies,
} from './config/environment.js';

export async function createApplication<T>(
  module: Type<T>,
  environment = process.env,
) {
  const adapter = createNodeAdapter(environment);
  const app = await NestFactory.create<NestNodeApplication>(module, adapter, {
    bodyParser: false,
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
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', {
    extended: true,
    limit: '1mb',
    parameterLimit: 100,
  });
  app.useSecurityHeaders();
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

  const server = app.getHttpServer();
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;

  return { port, trustedOrigins };
}
