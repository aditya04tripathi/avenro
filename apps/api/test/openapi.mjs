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
  '/api/v1/auth/email/verification',
  '/api/v1/auth/email/verify',
  '/api/v1/auth/me',
  '/api/v1/auth/oidc/{provider}/callback',
  '/api/v1/auth/oidc/{provider}/login',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/register',
  '/api/v1/auth/sessions',
  '/api/v1/auth/sessions/{id}',
  '/api/v1/auth/sign-in',
  '/api/v1/auth/sign-out',
  '/health',
]);
assert.deepEqual(operationIds.sort(), [
  'application_getHello',
  'auth_finishOidc',
  'auth_getMe',
  'auth_listSessions',
  'auth_register',
  'auth_requestPasswordReset',
  'auth_resendVerification',
  'auth_resetPassword',
  'auth_revokeSession',
  'auth_signIn',
  'auth_signOut',
  'auth_startOidc',
  'auth_verifyEmail',
  'health_check',
]);
const responseStatuses = Object.fromEntries(
  Object.entries(document.paths).map(([path, pathItem]) => [
    path,
    Object.fromEntries(
      Object.entries(pathItem).map(([method, operation]) => [
        method,
        Object.keys(operation.responses).sort(),
      ]),
    ),
  ]),
);
assert.deepEqual(responseStatuses, {
  '/api/v1': { get: ['200'] },
  '/api/v1/auth/email/verification': { post: ['202'] },
  '/api/v1/auth/email/verify': { post: ['200'] },
  '/api/v1/auth/me': { get: ['200'] },
  '/api/v1/auth/oidc/{provider}/callback': { get: ['302'] },
  '/api/v1/auth/oidc/{provider}/login': { get: ['302'] },
  '/api/v1/auth/password/forgot': { post: ['202'] },
  '/api/v1/auth/password/reset': { post: ['200'] },
  '/api/v1/auth/register': { post: ['202'] },
  '/api/v1/auth/sessions': { get: ['200'] },
  '/api/v1/auth/sessions/{id}': { delete: ['204', '404'] },
  '/api/v1/auth/sign-in': { post: ['200', '401'] },
  '/api/v1/auth/sign-out': { post: ['204'] },
  '/health': { get: ['200', '503'] },
});
for (const path of [
  '/api/v1/auth/oidc/{provider}/login',
  '/api/v1/auth/oidc/{provider}/callback',
]) {
  assert.equal(
    document.paths[path].get.responses['302'].headers.Location.schema.format,
    'uri',
  );
}
assert.deepEqual(document.paths['/api/v1/auth/me'].get.security, [
  { sessionCookie: [] },
]);
assert.deepEqual(
  document.paths['/api/v1/auth/email/verification'].post.security,
  [{ sessionCookie: [] }],
);
assert.deepEqual(document.paths['/api/v1/auth/sessions'].get.security, [
  { sessionCookie: [] },
]);
assert.deepEqual(document.paths['/api/v1/auth/sessions/{id}'].delete.security, [
  { sessionCookie: [] },
]);
assert.equal(document.paths['/api/v1/auth/register'].post.security, undefined);
assert.equal(
  document.components.securitySchemes.sessionCookie.name,
  '__Host-sid',
);
const registerSchema = document.components.schemas.RegisterDto;
assert.deepEqual([...registerSchema.required].sort(), ['email', 'password']);
assert.equal(registerSchema.properties.email.maxLength, 254);
assert.equal(registerSchema.properties.password.minLength, 12);
assert.equal(registerSchema.properties.password.maxLength, 1024);

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
    const invalidRegistration = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'contract@example.com',
        password: 'x'.repeat(1025),
      }),
    });
    assert.equal(invalidRegistration.status, 400);
    assert.ok(
      (await invalidRegistration.json()).fieldErrors.some(
        (fieldError) => fieldError.path === 'password',
      ),
    );
    const uiResponse = await fetch(`${baseUrl}/api/v1/docs`);
    assert.equal(uiResponse.status, 200);
    assert.equal(uiResponse.url, `${baseUrl}/api/v1/docs/`);
    assert.equal(
      uiResponse.headers
        .get('content-security-policy')
        .includes('upgrade-insecure-requests'),
      false,
    );
    assert.equal(uiResponse.headers.has('strict-transport-security'), false);
    const uiHtml = await uiResponse.text();
    assert.match(uiHtml, /Swagger UI/);
    const assets = [
      ...uiHtml.matchAll(/(?:href|src)="([^"]*swagger-ui[^"]*)"/g),
    ].map((match) => match[1]);
    assert.ok(assets.length >= 4);
    for (const asset of assets) {
      assert.equal(
        (await fetch(new URL(asset, uiResponse.url))).status,
        200,
        `Swagger UI asset did not load: ${asset}`,
      );
    }
    const assetResponse = await fetch(
      `${baseUrl}/api/v1/docs/swagger-ui-init.js`,
    );
    assert.equal(assetResponse.status, 200);
    const jsonResponse = await fetch(`${baseUrl}/api/v1/docs-json`);
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
      assert.equal((await fetch(`${baseUrl}/api/v1/docs`)).status, 404);
      assert.equal((await fetch(`${baseUrl}/api/v1/docs-json`)).status, 404);
    } finally {
      await gatedApp.close();
    }
  }
}

process.stdout.write(
  `OpenAPI ${mode === '--generate' ? 'generation' : 'built runtime contract'} passed\n`,
);
