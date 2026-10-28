import { Controller, Get } from '@nestjs/common';
import { type NestNodeApplication } from '@nestjs/platform-node';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { configureApplication, createNodeAdapter } from '../src/bootstrap.js';

@Controller('shutdown')
class ShutdownController {
  @Get()
  async respond() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { ok: true };
  }
}

@Controller('health')
class HealthRouteController {
  @Get()
  getHealth() {
    return 'ok';
  }
}

describe('HTTP bootstrap (e2e)', () => {
  let app: NestNodeApplication;

  beforeEach(async () => {
    const environment = {
      PORT: '0',
      APP_ORIGIN: 'http://localhost:3000',
      TRUSTED_ORIGINS: 'http://localhost:3000',
      TRUSTED_PROXIES: '',
      SHUTDOWN_GRACE_MS: '1000',
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController, HealthRouteController, ShutdownController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication<NestNodeApplication>(
      createNodeAdapter(environment),
      { bodyParser: false },
    );
    configureApplication(app, environment);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('serves product routes under /api/v1 and returns security headers', async () => {
    await request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!')
      .expect('x-content-type-options', 'nosniff');

    await request(app.getHttpServer()).get('/').expect(404);
    await request(app.getHttpServer()).get('/health').expect(200, 'ok');
    await request(app.getHttpServer()).get('/api/v1/health').expect(404);
  });

  it('allows configured origins and withholds CORS access for other origins', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/api/v1')
      .set('Origin', 'http://localhost:3000')
      .expect(200);
    const forbidden = await request(app.getHttpServer())
      .get('/api/v1')
      .set('Origin', 'https://attacker.example')
      .expect(403);

    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(forbidden.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects JSON bodies above the configured limit', async () => {
    await request(app.getHttpServer())
      .post('/api/v1')
      .send({ value: 'x'.repeat(1024 * 1024) })
      .expect(413);
  });

  it('drains active requests before closing the application', async () => {
    const response = request(app.getHttpServer())
      .get('/api/v1/shutdown')
      .then((result) => result);
    await new Promise((resolve) => setTimeout(resolve, 10));

    const closing = app.close();
    const result = await response;
    await closing;

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true });
  });
});
