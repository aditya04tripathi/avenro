import { Test } from '@nestjs/testing';

import 'reflect-metadata';

import { configureApplication, createNodeAdapter } from '../dist/bootstrap.js';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:5432/avenro_test';
process.env.PORT = '3001';
process.env.APP_ORIGIN = 'http://localhost:3000';
process.env.TRUSTED_ORIGINS = 'http://localhost:3000';
process.env.TRUSTED_PROXIES = '';
process.env.SHUTDOWN_GRACE_MS = '1000';
process.env.NODE_ENV = 'test';

const [{ AppModule }, { PrismaService }] = await Promise.all([
  import('../dist/app.module.js'),
  import('../dist/prisma/prisma.service.js'),
]);

const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(PrismaService)
  .useValue({ $connect: async () => {}, $disconnect: async () => {} })
  .compile();
const app = moduleFixture.createNestApplication(
  createNodeAdapter(process.env),
  {
    bodyParser: false,
  },
);

configureApplication(app, process.env);
await app.init();
await app.listen(0, '127.0.0.1');

try {
  const address = app.getHttpServer().address();
  if (!address || typeof address === 'string') {
    throw new Error('No bound TCP address');
  }

  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1`);
  if (
    response.status !== 200 ||
    (await response.text()) !== 'Hello World!' ||
    response.headers.get('x-content-type-options') !== 'nosniff'
  ) {
    throw new Error(`Unexpected built app response: ${response.status}`);
  }
} finally {
  await app.close();
}

process.stdout.write(
  'Built AppModule NodeAdapter startup, request, and shutdown passed\n',
);
