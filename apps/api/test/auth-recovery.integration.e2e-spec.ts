import type { NestNodeApplication } from '@nestjs/platform-node';
import { Test } from '@nestjs/testing';

import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { configureApplication, createNodeAdapter } from '../src/bootstrap.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createDisposableTestDatabase } from './support/test-database.js';

const databaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)('persistent email recovery routes', () => {
  let app: NestNodeApplication;
  let database: ReturnType<typeof createDisposableTestDatabase>;
  let sentMessages: string[];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    process.env.RESEND_API_KEY = 'test-only-resend-key';
    process.env.MAIL_FROM = 'Avenro <no-reply@example.test>';
    process.env.AUTH_RATE_LIMIT_HMAC_KEY =
      'test-only-auth-rate-limit-key-32-bytes';
    process.env.APP_ORIGIN ??= 'http://localhost:3000';
    process.env.TRUSTED_ORIGINS ??= process.env.APP_ORIGIN;
    process.env.PORT ??= '3001';
    process.env.NODE_ENV = 'test';

    sentMessages = [];
    fetchMock = vi.fn(async (_input: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { text: string };
      sentMessages.push(body.text);
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { AppModule } = await import('../src/app.module.js');
    database = createDisposableTestDatabase();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(database.client)
      .compile();
    app = moduleFixture.createNestApplication<NestNodeApplication>(
      createNodeAdapter(process.env),
      { bodyParser: false },
    );
    configureApplication(app, process.env);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await database?.cleanup();
    vi.unstubAllGlobals();
  });

  it('verifies the current address and revokes sessions after password reset', async () => {
    const email = `recovery-${randomUUID()}@example.test`;
    const oldPassword = 'a long previous password';
    const newPassword = 'a long replacement password';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: oldPassword })
      .expect(202, { accepted: true });
    await vi.waitFor(() => expect(sentMessages).toHaveLength(1));
    const verificationToken = getToken(sentMessages[0]);

    const signIn = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password: oldPassword })
      .expect(200);
    const cookie = signIn.headers['set-cookie'][0].split(';', 1)[0];

    fetchMock.mockImplementationOnce(
      async () => new Response(null, { status: 503 }),
    );
    const mailFailure = await request(app.getHttpServer())
      .post('/api/v1/auth/email/verification')
      .set('Cookie', cookie)
      .expect(503);
    expect(JSON.stringify(mailFailure.body)).not.toContain('token');

    await request(app.getHttpServer())
      .post('/api/v1/auth/email/verify')
      .send({ token: verificationToken })
      .expect(200, { email, emailVerified: true });
    await request(app.getHttpServer())
      .post('/api/v1/auth/email/verify')
      .send({ token: verificationToken })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/password/forgot')
      .send({ email })
      .expect(202, { accepted: true });
    await vi.waitFor(() => expect(sentMessages).toHaveLength(2));
    const resetToken = getToken(sentMessages[1]);

    await request(app.getHttpServer())
      .post('/api/v1/auth/password/reset')
      .send({ token: resetToken, password: newPassword })
      .expect(200, { reset: true });
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/password/reset')
      .send({ token: resetToken, password: newPassword })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password: newPassword })
      .expect(200);

    const changedAddress = `changed-${randomUUID()}@example.test`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: changedAddress, password: oldPassword })
      .expect(202);
    await vi.waitFor(() => expect(sentMessages).toHaveLength(3));
    const oldAddressToken = getToken(sentMessages[2]);
    await database.client.user.update({
      where: { email: changedAddress },
      data: { email: `updated-${changedAddress}`, emailVerified: false },
      select: { id: true },
    });
    await request(app.getHttpServer())
      .post('/api/v1/auth/email/verify')
      .send({ token: oldAddressToken })
      .expect(400);
  });
});

function getToken(message: string | undefined): string {
  if (!message) {
    throw new Error('Expected an email message');
  }
  const token = new URL(message.split(' ').at(-1)!).searchParams.get('token');
  if (!token) {
    throw new Error('Expected an email token');
  }
  return token;
}
