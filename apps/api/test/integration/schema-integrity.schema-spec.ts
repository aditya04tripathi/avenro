import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createDisposableTestDatabase } from '../support/test-database.js';

let database: ReturnType<typeof createDisposableTestDatabase>;

describe('schema integrity constraints', () => {
  beforeAll(() => {
    database = createDisposableTestDatabase();
  });

  afterAll(async () => {
    await database?.cleanup();
  });

  it('rejects a storage object that links a workspace to another workspace project', async () => {
    await expect(
      database.client.$executeRawUnsafe(`
        INSERT INTO "StorageObject" (
          "id", "workspaceId", "projectId", "bucket", "key", "fileName",
          "contentType", "sizeBytes", "uploaderId", "updatedAt"
        )
        SELECT
          'cross-tenant-schema-check', workspace."id", project."id", 'test',
          'cross-tenant-schema-check', 'test.txt', 'text/plain', 1,
          member."userId", CURRENT_TIMESTAMP
        FROM "Workspace" workspace
        JOIN "Project" project ON project."workspaceId" <> workspace."id"
        JOIN "WorkspaceMember" member ON member."workspaceId" = workspace."id"
        LIMIT 1
      `),
    ).rejects.toMatchObject({
      code: 'P2010',
      meta: {
        driverAdapterError: {
          cause: { originalCode: '23503' },
        },
      },
    });
  });
});
