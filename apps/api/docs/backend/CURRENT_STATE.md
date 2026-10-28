# Backend baseline before replacement

Inspected: 29 October 2026. Repository: Avenro. This is a source inventory, not a claim that the application is deployed or production ready. Read this before overwriting backend files.

## Task 01.1 implementation update — 29 October 2026

The API now uses a shared `src/bootstrap.ts` for the production entry point and E2E transport configuration. Product routes use `/api/v1`; health is excluded from that prefix at `/health`, and `/api` has no compatibility alias. Startup validates PostgreSQL `DATABASE_URL`, `PORT`, `APP_ORIGIN`, `TRUSTED_ORIGINS`, and production cookie settings without including values in validation errors. The NodeAdapter applies JSON and urlencoded body limits, security headers, a strict request-origin allowlist, CORS, explicit proxy trust (disabled by default), and a configurable graceful shutdown period.

E2E tests use the NodeAdapter and shared transport configuration without opening a database connection. The built AppModule smoke uses a test-only Prisma provider override; it verifies the emitted module graph, runtime path aliases, HTTP request and shutdown without claiming database connectivity. See task 01.1 in `IMPLEMENTATION_PLAN.md` for command evidence and remaining verification boundaries.

## Task 01.2 implementation update — 29 October 2026

The shared bootstrap now installs strict DTO validation, a stable error response filter, bounded request IDs, JSON logging and safe unexpected-error metadata. Shared HTTP primitives cover bounded cursor pagination, UTC ISO date strings, UUIDv7 identifiers and explicit enums. The E2E harness uses the NodeAdapter and production bootstrap configuration; a typed controller verifies decorator metadata, nested validation, dependency injection, request IDs and safe errors. Disposable PostgreSQL clients can only be constructed from a distinct local `TEST_DATABASE_URL` whose database name begins `avenro_test`; cleanup disconnects without dropping schema or resetting data. No database connection was exercised. Exact evidence and boundaries are in task 01.2 in `IMPLEMENTATION_PLAN.md`.

## Task 02.1 implementation update — 29 October 2026

At the 02.1 checkpoint, the Nest CLI Swagger transformer and peer-compatible `@nestjs/swagger` 12 were configured. The runtime UI and JSON routes share one document factory with build-time JSON generation; the generated document is validated with Swagger Parser from emitted Nest CLI output. Both runtime routes are enabled only by `OPENAPI_ENABLED=true` in `development` or `test`; they are disabled in production and other environments. At that checkpoint Auth had no handlers or registered session flow. Health success and safe 503 error DTOs are concrete; Terminus's automatic Swagger responses are disabled because they emit invalid legacy response shapes and don't match the global error filter. Task 03.1 adds the cookie scheme and auth routes to this contract. See task 02.1 in `IMPLEMENTATION_PLAN.md` for its original evidence and boundaries.

## Task 03.1 implementation update — 29 October 2026

`AuthenticationModule` now registers the library's global guard, configured 14-day absolute and 3-day idle sessions, and the secure `__Host-sid` HttpOnly cookie. `AuthModule` wires `UsersService`, `CredentialsService`, `SessionAuth`, and the Prisma store. `/api/v1/auth/register`, `/sign-in`, `/me`, `/sign-out`, `/sessions`, and `DELETE /sessions/:id` are implemented. Registration is generic and idempotent at the response boundary; login errors are generic; user/session outputs use explicit projections. The Nest library rejects login CSRF, while the shared origin allowlist blocks untrusted origins. Session rotation, idle/absolute expiry, immediate revocation, and sign-out use the installed library services.

The store contract and route flow passed against a fresh local PostgreSQL fixture named `avenro_test_authdbea3798e7`, provisioned from `template0` without reset/drop. The earlier unused fixture `avenro_test_auth_049a0f40a1` was created with an extra underscore, failed the helper's name guard before any connection, and is preserved untouched. Exact verification and the rate-limit acceptance blocker are recorded in task 03.1 in `IMPLEMENTATION_PLAN.md`. The API has no configured authentication limiter or distributed rate-limit store; do not expose these public registration/sign-in routes externally until that dependency and failure policy are implemented and tested.

## Preservation requirements

At the 00.1 baseline inspection, the checkout was on `master` with no commits, and the root files, `apps/`, `packages/`, lockfile, and `.agents/` were untracked. A normal `git diff` could not recover them. This document is not a source backup.

Before replacement, create a private filesystem snapshot of the checkout, including untracked files and required local configuration; keep secrets outside shared documentation. Verify that the snapshot can be opened. Record the current dependency lockfile and database migration history. If data matters, take and restore-test a database backup before schema migration. Do not run `git clean`, delete migrations, reset the database, remove Docker volumes, or overwrite environment files. Source rewrite authorization does not authorize data destruction or production deployment.

The document-only task did not change application source, database schema, dependencies, or infrastructure configuration. Build output may be regenerated by verification commands.

## Runtime and tooling

| Item              | Observed implementation                                                                    | Replacement guidance                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Workspace         | pnpm monorepo; root `package.json`, `pnpm-workspace.yaml`, shared config under `packages/` | Preserve workspace dependencies and pnpm lockfile                                                                         |
| Package selector  | `apps/api/package.json` names package `@avenro/api`                                        | Use `pnpm --filter @avenro/api`; the shorter selector in AGENTS is not the exact package name                             |
| Nest              | Manifest ranges start at 12.0.1; installed common/core are 12.3.1                          | Verify installed versions and peer requirements before adopting documentation examples                                    |
| HTTP adapter      | `src/main.ts`: `NestNodeApplication`, `NodeAdapter` from `@nestjs/platform-node` 12.3.2    | Keep unless a compatibility test proves a change is required; Express-specific middleware is not automatically compatible |
| Boot              | `NestFactory.create`, global prefix `/api`, `PORT` or 3001                                 | No current `/v1` prefix                                                                                                   |
| Configuration     | `ConfigModule.forRoot({ isGlobal: true })`                                                 | No central environment validation                                                                                         |
| Database          | Prisma 7.10.1, PostgreSQL adapter; PostgreSQL 17 in Compose                                | Keep PostgreSQL/Prisma                                                                                                    |
| TypeScript        | ESM, NodeNext, ES2023, decorator metadata, `@/*` paths, `.js` import suffixes              | Preserve runtime import correctness; `tsc` does not rewrite aliases                                                       |
| Build             | `nest build`; build tsconfig limits root to `src`                                          | Smoke-test emitted imports and exact `dist/main.js` entry                                                                 |
| Tests             | Vitest 4.1.12; separate unit and E2E configs, Supertest                                    | Preserve framework; repair adapter/bootstrap mismatch before expanding E2E                                                |
| Formatting        | Prettier, shared config, Trivago import sorting                                            | Format changed files using API config                                                                                     |
| API documentation | No `@nestjs/swagger` dependency, DTO files, Swagger setup, or CLI plugin                   | Must implement from the plan                                                                                              |
| Environment       | `.env` and `.env.example` exist                                                            | Secret `.env` contents were not read or copied                                                                            |
| Git exclusions    | Root `.gitignore` only excludes `node_modules/`                                            | Add explicit secret/build/generated exclusions in an implementation task before first commit                              |

## Existing modules and exact behavior

| Files relative to `apps/api`                  | Implemented                                                                                                                              | Missing or unsafe assumption                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/app.module.ts`                           | Imports HealthModule, global ConfigModule, PrismaModule, configured AuthenticationModule, AuthModule; registers AppController/AppService | No workspace authorization, or Observe registration                                               |
| `src/app.controller.ts`, `src/app.service.ts` | Root controller returns `Hello World!`, reachable at `/api` under production bootstrap                                                   | Starter response, not product functionality                                                       |
| `src/prisma/prisma.module.ts`                 | Provides and exports PrismaService                                                                                                       | Not globally exported to arbitrary feature modules                                                |
| `src/prisma/prisma.service.ts`                | Extends generated PrismaClient; `PrismaPg` uses required DATABASE_URL; connects/disconnects in lifecycle hooks                           | No application shutdown hooks in main, pool/timeouts/transaction policy not explicitly configured |
| `src/health/health.module.ts`                 | Imports Terminus, HttpModule, PrismaModule                                                                                               | Infrastructure check only                                                                         |
| `src/health/health.controller.ts`             | GET health combines HTTP ping to `${BASE_URL}/api` and Prisma ping                                                                       | Self-HTTP probe depends on BASE_URL and transport; no separate liveness/readiness                 |
| `src/auth/auth.module.ts`                     | Registers AuthController, AuthService, UsersService, CredentialsService, SessionAuth and PrismaAuthenticationStore                       | Distributed authentication rate limiting is absent                                                |
| `src/auth/auth.controller.ts`                 | Register/sign-in/me/sign-out/session list/revoke routes; cookie security metadata                                                        | Public register/sign-in are not rate limited; no recovery, verification or OIDC flow              |
| `src/auth/auth.service.ts`                    | Registration, password sign-in, current sessions, revocation and sign-out                                                                | No authentication throttling                                                                      |
| `src/auth/auth-types.ts`                      | Augments library AuthenticationTypes with User and sessionExtra user                                                                     | Type declaration alone enables no runtime authentication                                          |
| `src/auth/users.service.ts`                   | Prisma-backed projected user lookups/create/update plus email normalization                                                              | Recovery and verification routes are later work                                                   |
| `src/auth/credentials.service.ts`             | Hashes registration passwords, maps unique races, verifies missing and present users, upgrades hashes                                    | Registration/sign-in require a distributed rate limiter before external exposure                  |

### Behavior worth carrying forward

UsersService normalizes emails with trim, NFC normalization, and lowercase before storage/lookups. `create` accepts optional passwordHash, emailVerified, displayName; displayName defaults to the email local part. Public User contains exactly id, email, displayName, emailVerified. Credential lookup returns the hash separately. Email change resets verification; markEmailVerified updates only when both current id and normalized email match. Preserve these semantics in tests, including no public hash leakage. Do not treat TypeScript's User interface as a runtime response DTO.

CredentialsService uses the installed library PasswordHasher, verifies even when the record/hash is missing, and rehashes on successful verification when needed. Preserve the library's missing-user timing behavior; do not implement ad hoc crypto. Registration hashes before insert and maps the database unique constraint so concurrent duplicate attempts share the generic acknowledgement.

## Persistence inventory

`prisma/schema.prisma` contains **46 models**, using `uuid(7)` for domain ids. Two migrations now exist: the immutable initial migration and additive schema-integrity migration. `prisma7.config.ts` sets the schema, migration path, and DATABASE_URL. This custom filename must be supplied explicitly to Prisma CLI commands until package scripts reliably do so. The client generator writes `src/generated/prisma`; the ERD generator writes `prisma/erd.svg`. Generation may need the ERD toolchain as well as Prisma. Never hand-edit generated files.

`prisma/migrations/20261028144312_init_auth/migration.sql` plus `migration_lock.toml` remains immutable; `20261029120000_schema_integrity` adds relational integrity. Despite its name, the initial migration creates domain tables and enums across the product, not only authentication. Local named test database results are recorded per task; they do not establish production state.

| Area                   | Models present in schema and initial migration                                                     | Implemented HTTP behavior |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------- |
| Identity               | User, Session, RefreshToken, MagicLink, EmailToken, ApiKey                                         | None                      |
| Tenancy                | Workspace, WorkspaceMember, WorkspaceInvitation, ProjectKeyReservation, Project, ProjectMembership | None                      |
| Work                   | Issue, IssueDependency, IssueComment, BoardConfig, WorkflowStatus                                  | None                      |
| Scrum/planning         | Sprint, SprintScopeChange, SprintSnapshot, ProjectGoal, ProjectStatusUpdate, Milestone             | None                      |
| Meetings               | Meeting, MeetingAgendaItem, MeetingMinutes, MeetingMinutesVersion                                  | None                      |
| Outcomes               | Decision, ActionItem                                                                               | None                      |
| Knowledge              | DocumentFolder, ProjectDocument, DocumentVersion, Requirement                                      | None                      |
| Improvement/governance | Retrospective, RetrospectiveFeedback, Risk, Stakeholder, ChangeRequest                             | None                      |
| Communication          | ActivityEvent, AuditEvent, Notification, SavedFilter                                               | None                      |
| External/storage       | Integration, WebhookDelivery, ClientPortalItem, StorageObject                                      | None                      |

Session maps to `sessions`, RefreshToken to `refresh_tokens`, MagicLink to `magic_links`, EmailToken to `email_tokens`, ApiKey to `api_keys`. Task 03.1 implements the library's session store contract; the other tables remain storage foundations only. Session ids store SHA-256 token hashes, not raw browser credentials.

### Schema concerns to address before feature controllers

1. Workspace and Project are separate with separate memberships. Earlier product direction used one workspace as one project and the sole access scope. The current README and schema conflict with that direction. Resolve explicitly using phase 00; do not infer a changed product decision from schema alone.
2. Many project child rows carry a scalar workspaceId but only relate to Project by projectId. Separate valid foreign keys do not prove that all supplied ids belong together. Add composite tenant constraints or remove redundant tenant columns, then enforce scoped queries too.
3. Issue.status is a fixed enum while WorkflowStatus is configurable and BoardConfig.columnIds is a string array. No relation binds an issue to a workflow status. Pick the workflow status relation as the authoritative state and migrate deliberately.
4. participantIds, approverIds, linkedRecordIds, linkedIssueIds, and several issue-id arrays have no relational integrity. Convert relationships requiring referential guarantees to scoped join tables. Keep historical snapshot arrays only when immutable snapshots intentionally retain old identifiers.
5. Json fields for attendance, filters, snapshots, settings, and audit metadata have no runtime schemas. Define bounded payloads and typed DTOs; avoid accepting arbitrary JSON on public write endpoints.
6. Decision has supersession links but no DecisionVersion model. Minutes/document version tables exist, but immutable behavior is not implemented.
7. Most editable records lack optimistic concurrency revisions. Sprint exclusivity, issue counters, ranking, owner transfer, and finalization need transactional constraints/locking.
8. Cascading deletes could remove history. Use archive commands and reviewed retention/purge rules instead of exposing generic hard-delete endpoints.
9. No outbox, command-idempotency table, call/provider identity mapping, export-job state, or retrospective vote uniqueness model exists.
10. CLIENT is a ProjectRole but public/client access and published snapshots are not enforced. Scrum accountabilities must not silently grant administrative powers.

## Infrastructure and frontend

Root `docker-compose.yml` defines PostgreSQL, Redis 7, and SeaweedFS. PostgreSQL exposes both configurable 5432 and hardcoded 51214; Redis exposes 6379; SeaweedFS exposes 9333, 8080, 8888, 8333, uses `latest`, and checks executable version rather than actual S3 readiness. These are development definitions, not production hardening. Redis and SeaweedFS have no application integration in inspected API source. Do not delete their volumes.

No backend Dockerfile or root `.github/` CI directory was found. No deployed environment, restore drill, production workload, email provider, Observe configuration, or external integration was verified.

`apps/web/app/page.tsx` is a starter page. No frontend API integration or authentication flow was found in the inspected web files. Root README is a broad feature proposal and still names Firebase/Firestore as the stack. API README is Nest starter documentation. Neither establishes implemented product behavior.

## Verification actually run on this baseline

| Command from repository root                                         | Result                       | Limit                                                                |
| -------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `pnpm --filter @avenro/api test`                                     | Passed: one test in one file | Checks AppController Hello World only                                |
| `pnpm --filter @avenro/api build`                                    | Passed                       | Compilation is not startup, DB connectivity, or Swagger verification |
| `pnpm --filter @avenro/api exec tsc --noEmit -p tsconfig.build.json` | Passed                       | Does not verify emitted alias resolution                             |
| `pnpm --filter @avenro/api lint`                                     | Passed                       | Not security or functional coverage                                  |

E2E, live server boot, Prisma migration status, database integration, external providers, browser behavior, restore, and deployment were not run. Existing `test/app.e2e-spec.ts` creates the default Nest application and checks `/`; it does not exercise NodeAdapter plus `/api` from main. It also imports AppModule and therefore depends on database setup. Treat it as a starter test requiring replacement, not evidence of parity.

## Task 02.2 current implementation

- `prisma/schema.prisma` enforces one internal project per workspace, tenant-consistent composite relations, WorkspaceMember-backed project-role membership, relational workflow transitions and board columns, workflow-backed issue status, and revision fields.
- `20261029120000_schema_integrity` is additive and leaves the existing init migration unchanged. Its aggregate-only preflight checks conflicts before DDL/data changes; it backfills missing internal projects and workspace-owner memberships, maps legacy issue states, and preserves legacy board column ids.
- Prisma CLI scripts load `prisma7.config.ts`. Under `NODE_ENV=test`, only `TEST_DATABASE_URL` is selected; the shared test database helper restricts connections to named local `avenro_test*` databases.
- Clean `template0` install and a self-created previous-schema fixture both migrated successfully. A schema integration test verifies a mixed-workspace/project StorageObject insert fails at the composite FK. See the 02.2 ledger for exact commands and scope limits.
- The `.env` `DATABASE_URL` currently points to local `template1`, not `avenro`; no migration or query was made to either application database during task 02.2.
