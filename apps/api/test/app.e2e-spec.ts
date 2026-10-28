import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { type NestNodeApplication } from '@nestjs/platform-node';
import { Test, TestingModule } from '@nestjs/testing';

import { Type } from 'class-transformer';
import { IsString, Matches, ValidateNested } from 'class-validator';
import request from 'supertest';
import { vi } from 'vitest';

import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { configureApplication, createNodeAdapter } from '../src/bootstrap.js';
import { PaginationQueryDto } from '../src/common/http/pagination-query.dto.js';
import {
  IsExplicitEnum,
  IsUtcDateString,
  IsUuid7,
} from '../src/common/http/query-primitives.js';

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

enum ProbeKind {
  SAMPLE = 'sample',
}

class ProbeNestedDto {
  @IsString()
  @Matches(/^ok$/)
  value!: string;
}

class ProbeBodyDto {
  @IsUuid7()
  id!: string;

  @IsExplicitEnum(ProbeKind)
  kind!: ProbeKind;

  @IsUtcDateString()
  occurredAt!: string;

  @ValidateNested()
  @Type(() => ProbeNestedDto)
  nested!: ProbeNestedDto;
}

class ProbeDependency {
  value() {
    return 'injected';
  }
}

@Controller('contract')
class ContractController {
  constructor(private readonly dependency: ProbeDependency) {}

  @Get()
  read(@Query() query: PaginationQueryDto) {
    return {
      limit: query.limit,
      cursor: query.cursor ?? null,
      dependency: this.dependency.value(),
    };
  }

  @Post()
  write(@Body() body: ProbeBodyDto) {
    return body;
  }

  @Get('error')
  fail() {
    throw new Error('password=secret resetToken=do-not-expose');
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
      controllers: [
        AppController,
        HealthRouteController,
        ShutdownController,
        ContractController,
      ],
      providers: [AppService, ProbeDependency],
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
      .set('X-Request-Id', 'oversized_body')
      .send({ value: 'x'.repeat(1024 * 1024) })
      .expect(413)
      .expect('x-request-id', 'oversized_body');
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

  it('validates nested DTOs and proves dependency metadata in the HTTP compilation path', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/contract?limit=100')
      .expect(200, { limit: 100, cursor: null, dependency: 'injected' });

    const valid = {
      id: '018f47a2-6f7b-7cc1-98b5-9f6c312f7ad4',
      kind: ProbeKind.SAMPLE,
      occurredAt: '2026-10-29T12:00:00Z',
      nested: { value: 'ok' },
    };
    await request(app.getHttpServer())
      .post('/api/v1/contract')
      .send(valid)
      .expect(201, valid);

    await request(app.getHttpServer())
      .post('/api/v1/contract')
      .send({ ...valid, nested: { value: 'bad', extra: true } })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('VALIDATION_FAILED');
        expect(
          body.fieldErrors.map((error: { path: string }) => error.path),
        ).toContain('nested.value');
      });
    await request(app.getHttpServer())
      .post('/api/v1/contract')
      .send({ ...valid, extra: true })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/contract')
      .send({ ...valid, nested: null })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/contract')
      .send({ ...valid, occurredAt: '2026-10-29T12:00:00+11:00' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/contract')
      .send({ ...valid, id: 'not-a-uuid', kind: 'unknown' })
      .expect(400)
      .expect(({ body }) => {
        expect(
          body.fieldErrors.map((error: { path: string }) => error.path),
        ).toEqual(expect.arrayContaining(['id', 'kind']));
      });
  });

  it('enforces pagination bounds and correlates valid or generated request ids', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/contract')
      .expect(200, { limit: 20, cursor: null, dependency: 'injected' });

    const accepted = await request(app.getHttpServer())
      .get('/api/v1/contract?limit=1')
      .set('X-Request-Id', 'client_request-1')
      .expect(200);
    expect(accepted.headers['x-request-id']).toBe('client_request-1');

    await request(app.getHttpServer())
      .get('/api/v1/contract?limit=0')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/contract?limit=101')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/contract?limit=')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/contract')
      .set('X-Request-Id', 'invalid id')
      .expect(({ headers }) => {
        expect(headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
      });
  });

  it('returns and logs no unexpected exception details', async () => {
    const errorLog = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    try {
      await request(app.getHttpServer())
        .get('/api/v1/contract/error')
        .set('X-Request-Id', 'error_case_1')
        .expect(500)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            requestId: 'error_case_1',
          });
          expect(JSON.stringify(body)).not.toContain('do-not-expose');
        });
      expect(errorLog).toHaveBeenCalledOnce();
      expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
        'do-not-expose',
      );
      expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
        'password=secret',
      );
    } finally {
      errorLog.mockRestore();
    }
  });
});
