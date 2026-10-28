import { Test } from '@nestjs/testing';

import SwaggerParser from '@apidevtools/swagger-parser';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import 'reflect-metadata';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:5432/avenro_test';
process.env.PORT = '3001';
process.env.APP_ORIGIN = 'http://localhost:3000';
process.env.TRUSTED_ORIGINS = 'http://localhost:3000';
process.env.TRUSTED_PROXIES = '';
process.env.SHUTDOWN_GRACE_MS = '1000';
process.env.NODE_ENV = 'test';

const [{ AppModule }, { PrismaService }, bootstrap, openapi] =
  await Promise.all([
    import('../dist/app.module.js'),
    import('../dist/prisma/prisma.service.js'),
    import('../dist/bootstrap.js'),
    import('../dist/openapi/openapi.js'),
  ]);
const { configureApplication, createNodeAdapter } = bootstrap;
const { createOpenApiDocument, isOpenApiEnabled } = openapi;

assert.equal(
  isOpenApiEnabled({ OPENAPI_ENABLED: 'true', NODE_ENV: 'test' }),
  true,
);
assert.equal(
  isOpenApiEnabled({ OPENAPI_ENABLED: 'false', NODE_ENV: 'test' }),
  false,
);
assert.equal(
  isOpenApiEnabled({ OPENAPI_ENABLED: 'true', NODE_ENV: 'production' }),
  false,
);
assert.equal(
  isOpenApiEnabled({ OPENAPI_ENABLED: 'true', NODE_ENV: 'staging' }),
  false,
);

async function createTestApplication(environment) {
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ $connect: async () => {}, $disconnect: async () => {} })
    .compile();
  const app = moduleFixture.createNestApplication(
    createNodeAdapter(environment),
    {
      bodyParser: false,
    },
  );
  configureApplication(app, environment);
  await app.init();
  return app;
}

const mode = process.argv[2];
if (mode !== '--generate' && mode !== '--verify') {
  throw new Error('Expected --generate or --verify');
}

const documentEnvironment = { ...process.env, OPENAPI_ENABLED: 'true' };
const documentApp = await createTestApplication(documentEnvironment);
const document = createOpenApiDocument(documentApp);
await SwaggerParser.validate(structuredClone(document));

const operationIds = Object.values(document.paths)
  .flatMap((pathItem) => Object.values(pathItem ?? {}))
  .filter((operation) => typeof operation === 'object' && operation !== null)
  .map((operation) => operation.operationId);
assert.equal(new Set(operationIds).size, operationIds.length);
assert.deepEqual(Object.keys(document.paths).sort(), [
  '/api/v1',
  '/api/v1/auth/me',
  '/api/v1/auth/register',
  '/api/v1/auth/sessions',
  '/api/v1/auth/sessions/{id}',
  '/api/v1/auth/sign-in',
  '/api/v1/auth/sign-out',
  '/health',
]);
assert.deepEqual(operationIds.sort(), [
  'application_getHello',
  'auth_getMe',
  'auth_listSessions',
  'auth_register',
  'auth_revokeSession',
  'auth_signIn',
  'auth_signOut',
  'health_check',
]);
assert.deepEqual(document.paths['/api/v1/auth/me'].get.security, [
  { sessionCookie: [] },
]);
assert.equal(document.paths['/api/v1/auth/register'].post.security, undefined);
assert.equal(document.components.securitySchemes.sessionCookie.name, '__Host-sid');

const errorFieldSchema = document.components?.schemas?.ErrorFieldDto;
assert.deepEqual(Object.keys(errorFieldSchema.properties).sort(), [
  'code',
  'message',
  'path',
]);
assert.deepEqual([...errorFieldSchema.required].sort(), [
  'code',
  'message',
  'path',
]);
const errorResponseSchema = document.components.schemas.ErrorResponseDto;
assert.deepEqual(Object.keys(errorResponseSchema.properties).sort(), [
  'code',
  'fieldErrors',
  'message',
  'requestId',
  'statusCode',
]);
assert.equal(
  errorResponseSchema.properties.fieldErrors.items.$ref,
  '#/components/schemas/ErrorFieldDto',
);
const healthResponseSchema = document.components.schemas.HealthResponseDto;
assert.deepEqual(Object.keys(healthResponseSchema.properties).sort(), [
  'details',
  'error',
  'info',
  'status',
]);
assert.deepEqual(healthResponseSchema.properties.status.enum, ['ok']);
assert.equal(
  document.paths['/health'].get.responses['200'].content['application/json']
    .schema.$ref,
  '#/components/schemas/HealthResponseDto',
);
assert.equal(
  document.paths['/api/v1'].get.responses['200'].content['application/json']
    .schema.type,
  'string',
);
const healthErrorSchema =
  document.paths['/health'].get.responses['503'].content['application/json']
    .schema;
assert.equal(healthErrorSchema.$ref, '#/components/schemas/ErrorResponseDto');

if (mode === '--generate') {
  const outputPath = resolve('artifacts/openapi.json');
  await mkdir(resolve('artifacts'), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await documentApp.close();
} else {
  await documentApp.listen(0, '127.0.0.1');
  try {
    const address = documentApp.getHttpServer().address();
    assert.ok(address && typeof address !== 'string');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const uiResponse = await fetch(`${baseUrl}/docs`);
    assert.equal(uiResponse.status, 200);
    assert.match(await uiResponse.text(), /Swagger UI/);
    const assetResponse = await fetch(`${baseUrl}/docs/swagger-ui-init.js`);
    assert.equal(assetResponse.status, 200);
    const jsonResponse = await fetch(`${baseUrl}/docs-json`);
    assert.equal(jsonResponse.status, 200);
    assert.deepEqual(await jsonResponse.json(), document);
  } finally {
    await documentApp.close();
  }

  for (const environment of [
    { ...process.env, OPENAPI_ENABLED: 'false' },
    { ...process.env, NODE_ENV: 'production', OPENAPI_ENABLED: 'true' },
  ]) {
    const gatedApp = await createTestApplication(environment);
    await gatedApp.listen(0, '127.0.0.1');
    try {
      const address = gatedApp.getHttpServer().address();
      assert.ok(address && typeof address !== 'string');
      const baseUrl = `http://127.0.0.1:${address.port}`;
      assert.equal((await fetch(`${baseUrl}/docs`)).status, 404);
      assert.equal((await fetch(`${baseUrl}/docs-json`)).status, 404);
    } finally {
      await gatedApp.close();
    }
  }
}

process.stdout.write(
  `OpenAPI ${mode === '--generate' ? 'generation' : 'built runtime contract'} passed\n`,
);
