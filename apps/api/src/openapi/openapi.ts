import type { INestApplication } from '@nestjs/common';
import type { NodeRequest, NodeResponse } from '@nestjs/platform-node';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

export function isOpenApiEnabled(environment = process.env) {
  return (
    environment.OPENAPI_ENABLED === 'true' &&
    (environment.NODE_ENV === 'development' || environment.NODE_ENV === 'test')
  );
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const configuration = new DocumentBuilder()
    .setTitle('Avenro API')
    .setDescription('The Avenro HTTP API contract.')
    .setVersion('1.0.0')
    .addCookieAuth(
      '__Host-sid',
      { type: 'apiKey', in: 'cookie' },
      'sessionCookie',
    )
    .build();

  return SwaggerModule.createDocument(app, configuration, {
    autoTagControllers: false,
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey}_${methodKey}`,
  });
}

export function configureOpenApi(
  app: INestApplication,
  environment = process.env,
) {
  if (!isOpenApiEnabled(environment)) {
    return false;
  }

  app.use((request: NodeRequest, response: NodeResponse, next: () => void) => {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost');
    if (request.method !== 'GET' || requestUrl.pathname !== '/api/v1/docs') {
      next();
      return;
    }

    response.statusCode = 308;
    response.setHeader(
      'Location',
      `${requestUrl.pathname}/${requestUrl.search}`,
    );
    response.end();
  });

  SwaggerModule.setup('docs', app, () => createOpenApiDocument(app), {
    jsonDocumentUrl: 'docs-json',
    raw: ['json'],
    ui: true,
    useGlobalPrefix: true,
  });
  return true;
}
