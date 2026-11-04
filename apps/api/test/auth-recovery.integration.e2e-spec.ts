import { InMemoryMailTransport, MailTransport } from '@nestjs/mail';
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
  let mailTransport: InMemoryMailTransport;

  beforeAll(async () => {
    process.env.SMTP_HOST = 'smtp.zoho.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'avenro@adityatripathi.dev';
    process.env.SMTP_PASSWORD = 'test-only-password';
    process.env.MAIL_FROM = 'avenro@adityatripathi.dev';
    process.env.AUTH_RATE_LIMIT_HMAC_KEY =
      'test-only-auth-rate-limit-key-32-bytes';
    process.env.APP_ORIGIN ??= 'http://localhost:3000';
    process.env.TRUSTED_ORIGINS ??= process.env.APP_ORIGIN;
    process.env.PORT ??= '3001';
    process.env.NODE_ENV = 'test';

    mailTransport = new InMemoryMailTransport();

    const { AppModule } = await import('../src/app.module.js');
    database = createDisposableTestDatabase();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailTransport)
      .useValue(mailTransport)
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
  });

  it('verifies the current address and revokes sessions after password reset', async () => {
    const email = `recovery-${randomUUID()}@example.test`;
    const oldPassword = 'a long previous password';
    const newPassword = 'a long replacement password';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: oldPassword })
      .expect(202, { accepted: true });
    await vi.waitFor(() => expect(mailTransport.mails).toHaveLength(1));
    const verificationToken = getToken(mailTransport.mails[0]?.text);

    const signIn = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password: oldPassword })
      .expect(200);
    const cookie = signIn.headers['set-cookie'][0].split(';', 1)[0];

    mailTransport.failNext(new Error('SMTP unavailable'));
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
    await vi.waitFor(() => expect(mailTransport.mails).toHaveLength(2));
    const resetToken = getToken(mailTransport.mails[1]?.text);

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
    await vi.waitFor(() => expect(mailTransport.mails).toHaveLength(3));
    const oldAddressToken = getToken(mailTransport.mails[2]?.text);
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
