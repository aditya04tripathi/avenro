import type { NestNodeApplication } from '@nestjs/platform-node';
import { Test } from '@nestjs/testing';

import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { AuthRateLimitStore } from '../src/auth/auth-rate-limit.store.js';
import { configureApplication, createNodeAdapter } from '../src/bootstrap.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createDisposableTestDatabase } from './support/test-database.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
const rateLimitKey = process.env.AUTH_RATE_LIMIT_HMAC_KEY;
const skipPersistentAuth = !databaseUrl || !rateLimitKey;

describe.skipIf(skipPersistentAuth)('persistent authentication routes', () => {
  let app: NestNodeApplication;
  let database: ReturnType<typeof createDisposableTestDatabase>;

  beforeAll(async () => {
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
  });

  it('registers, signs in, rotates, lists, revokes and signs out without exposing secrets', async () => {
    const parallelEmail = `parallel-${randomUUID()}@example.com`;
    const parallelRegistrations = await Promise.all([
      request(app.getHttpServer()).post('/api/v1/auth/register').send({
        email: parallelEmail,
        password: 'a long password that is not exposed',
      }),
      request(app.getHttpServer()).post('/api/v1/auth/register').send({
        email: parallelEmail,
        password: 'a long password that is not exposed',
      }),
    ]);
    expect(parallelRegistrations.map((response) => response.status)).toEqual([
      202, 202,
    ]);
    expect(
      await database.client.user.count({ where: { email: parallelEmail } }),
    ).toBe(1);

    const email = `auth-${randomUUID()}@example.com`;
    const password = 'a long password that is not exposed';
    const registration = { email, password, displayName: 'Auth Test' };
    const created = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registration)
      .expect(202, { accepted: true });
    expect(JSON.stringify(created.body)).not.toContain(password);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registration)
      .expect(202, created.body);

    const invalid = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password: 'incorrect password' })
      .expect(401);
    expect(invalid.body).toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect',
    });
    expect(invalid.headers['set-cookie']).toBeUndefined();
    const missingUser = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email: `missing-${randomUUID()}@example.com`, password })
      .expect(401);
    expect(missingUser.body).toMatchObject({
      code: invalid.body.code,
      message: invalid.body.message,
      statusCode: invalid.body.statusCode,
    });

    const firstSignIn = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password })
      .expect(200);
    expect(firstSignIn.body).toEqual({
      id: expect.any(String),
      email,
      displayName: 'Auth Test',
      emailVerified: false,
    });
    const userId = firstSignIn.body.id as string;
    expect(JSON.stringify(firstSignIn.body)).not.toMatch(/passwordHash|token/i);
    const firstCookie = firstSignIn.headers['set-cookie'][0].split(';', 1)[0];
    expect(firstSignIn.headers['set-cookie'][0]).toMatch(
      /^__Host-sid=.*; Path=\/; HttpOnly; Secure; SameSite=Lax$/,
    );

    const rotatedSignIn = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .set('Cookie', firstCookie)
      .send({ email, password })
      .expect(200);
    const rotatedCookie = rotatedSignIn.headers['set-cookie'][0].split(
      ';',
      1,
    )[0];
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', firstCookie)
      .expect(401);

    const secondBrowserSignIn = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password })
      .expect(200);
    const secondBrowserCookie = secondBrowserSignIn.headers[
      'set-cookie'
    ][0].split(';', 1)[0];
    const sessions = await request(app.getHttpServer())
      .get('/api/v1/auth/sessions')
      .set('Cookie', rotatedCookie)
      .expect(200);
    expect(sessions.body).toHaveLength(2);
    expect(
      sessions.body.filter((session: { current: boolean }) => session.current),
    ).toHaveLength(1);
    expect(JSON.stringify(sessions.body)).not.toMatch(
      /passwordHash|token|metadata/i,
    );

    const otherSession = sessions.body.find(
      (session: { current: boolean }) => !session.current,
    );
    await request(app.getHttpServer())
      .delete('/api/v1/auth/sessions/not-a-session-hash')
      .set('Cookie', rotatedCookie)
      .expect(400);
    await request(app.getHttpServer())
      .delete(`/api/v1/auth/sessions/${otherSession.id}`)
      .set('Cookie', rotatedCookie)
      .expect(204);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', secondBrowserCookie)
      .expect(401);

    await database.client.session.updateMany({
      where: {
        userId,
        id: sessions.body.find(
          (session: { current: boolean }) => session.current,
        ).id,
      },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', rotatedCookie)
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/sign-out')
      .set('Cookie', rotatedCookie)
      .expect(204);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', rotatedCookie)
      .expect(401);
  });

  it('rejects cross-origin public mutations', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('Origin', 'https://attacker.example')
      .send({
        email: `csrf-${randomUUID()}@example.com`,
        password: 'a long password that is not exposed',
      })
      .expect(403);
  });

  it('fails closed when the distributed rate-limit store is unavailable', async () => {
    const store = app.get(AuthRateLimitStore);
    const consume = vi
      .spyOn(store, 'consume')
      .mockRejectedValue(new Error('rate-limit store unavailable'));

    try {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          email: `outage-${randomUUID()}@example.com`,
          password: 'incorrect password',
        })
        .expect(503);
      expect(response.body).toMatchObject({
        statusCode: 503,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      });
    } finally {
      consume.mockRestore();
    }
  });

  it('limits repeated sign-in attempts for the same account', async () => {
    const email = `throttle-${randomUUID()}@example.com`;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({ email, password: 'incorrect password' })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email, password: 'incorrect password' })
      .expect(429);
  });
});
