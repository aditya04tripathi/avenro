# Avenro backend implementation plan

Status: implementation specification only. Prepared 29 October 2026 from the current checkout, the requested NestJS documentation skill, codebase-design, codebase-intelligence, and antislop-code. No phase below has been implemented by this documentation task.

## 1. Start here

Read in this order:

1. `apps/api/.agents/MEMORY.md` for navigation and constraints.
2. [CURRENT_STATE.md](CURRENT_STATE.md) for existing behavior, persistence inventory, and baseline verification.
3. [API_MAP.md](API_MAP.md) for current routes and proposed module/HTTP interfaces.
4. This document, then use the `nestjs-docs` skill and its task-relevant chapters. Every backend implementing/reviewing agent must use this reference and verify examples against installed declarations.

Implement exactly one numbered task at a time. Complete its tests and report its evidence before moving to the next dependency. Do not scaffold every future module or invent functionality to fill a directory. Keep source code free of new comments, including generated-style banners and narrating JSDoc. Use descriptive names, decorators, tests, and documentation to explain behavior. Preserve legal notices and essential existing directives. Antislop-code governs comment hygiene; it is not authorization for unrelated code cleanup.

The goal is a secure, maintainable modular monolith with explicit contracts and verifiable operational behavior. “Enterprise grade” is an acceptance standard, not a reason to add microservices, CQRS, Kafka, Kubernetes, generic repositories, or an abstraction for every dependency.

### Executor handoff prompt

> Read AGENTS.md, apps/api/AGENTS.md, apps/api/.agents/MEMORY.md, and the linked backend documents. Use the `nestjs-docs` skill and require it in every authorized backend agent handoff. Work only on task `<ID>`. Reinspect its owning files because the inventory may be stale. First state its prerequisites, allowed files, intended behavior, and tests. Implement the smallest complete behavior. Do not introduce source comments, touch secrets, edit generated Prisma output, reset data, or deploy. Use the exact @avenro/api package selector. Run targeted tests, formatting, type check, lint, and build as applicable. Report command outcomes and remaining failures. Update the task's progress entry with evidence; never mark an untested task complete. Stop at this task's acceptance gate if prerequisites fail.

When a new model takes over, it must read the recorded progress before changing files. At task handoff, add useful feature suggestions to section 6 with evidence and a validation step; keep them separate from the authorized task. Do not assume that unchecked roadmap work exists in code.

## 2. Product scope and explicit decisions

### Decisions that need recording before schema work

The historical product direction was one workspace equals one project and one access scope. Current schema and README still expose separate Workspace/Project concepts. The target public interface in this plan uses workspace scope only. Recommended compatibility implementation: retain an internal Project record temporarily, create it atomically with the workspace, enforce a one-to-one relation after validating existing data, and resolve it server-side. Workspace membership becomes the sole authorization source; ProjectRole can carry Scrum accountability metadata only. A future consolidation can remove the internal Project if it lowers complexity. Do not publish two independent access scopes.

If existing data contains multiple projects per workspace, do not merge or discard it automatically. Produce a count/conflict report without private content, propose a migration, and obtain a product decision before that migration. The implementation can continue on unrelated foundation tasks. Do not silently replace the earlier product direction with the current schema.

Earlier scope also included hosted 1:1/group calls for up to ten workspace members, scheduled/ad-hoc calls, host-controlled saving of ad-hoc meeting records, and complete ZIP workspace exports including uploads, GitHub references/metadata, and archived history under `archive/`. This plan includes those as explicit implementation phases; provider selection remains a setup decision. No recording or transcription. Import tooling is outside this scope. A migration of Avenro's own schema is still required when its data model changes.

### Release gates

| Release                    | Included phases   | Outcome                                                                                            |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| Foundation                 | 00–04             | Typed documented interface, persistent identity, isolated workspace membership                     |
| Core product               | 05–10             | Backlog/board/sprint, meetings/minutes/actions, calls, files and complete workspace export         |
| Team operations            | 11–15             | Knowledge/governance, notifications, reporting/search, explicit client publication                 |
| Integration and production | 16–18             | GitHub, security/operations checks, staging/cutover evidence                                       |
| Agent integration          | 19                | Avenro MCP server with scoped reads followed by controlled writes                                  |
| Later options              | Deferred register | Custom roles, enterprise identity provisioning, advanced AI/automation and additional integrations |

Security, transactional integrity, validation, DTO documentation, and tests apply from the first exposed endpoint; they are not deferred until the production phase. Call/provider configuration must be available before claiming the core release complete.

### Planning assumptions

- Keep pnpm, TypeScript ESM, Nest 12, Prisma 7, PostgreSQL, Vitest, and the current HTTP adapter unless tested incompatibility justifies change.
- Phase 19 introduces a remote MCP consumer and scoped OAuth authorization; browser sessions remain independent. General-purpose public API keys remain deferred.
- Prefer browser sessions stored in PostgreSQL. Do not add refresh JWTs or public API keys until a real consumer requires them; existing tables are not a requirement to expose those flows.
- Default browser deployment uses a same-origin reverse proxy for Next.js and `/api`. Explicitly configure allowed origins for development and approved split-origin deployment.
- Keep SeaweedFS as the local S3-compatible development target. Production object storage and video/email providers need actual operational configuration; do not fabricate credentials or successful integrations.
- Redis is present in development infrastructure but optional at first. Adopt it for distributed rate limits/queues only when those behaviors are implemented. PostgreSQL outbox jobs can provide the first durable background worker.
- All proposed numeric limits below are starting configuration values, not measured capacities or promises: list default 20/max 100, JSON body default 1 MiB, title max 200, bounded rich text default 100 KiB, file default max 25 MiB, call max 10. Set provider-specific lower limits when needed and test boundary values.

## 3. Architecture and rules every feature follows

### Module layout

Retain existing `src/prisma/`, `src/auth/`, `src/health/`. Add `src/config/`, `src/authorization/`, `src/common/http/`, and `src/openapi/` for implemented shared concerns. Add feature modules directly under `src/` as their phases start. Within each feature use a controller, application command/query implementation, DTO directory, explicit response mapper, and tests. Split a command into its own file only when its behavior warrants it. Nest modules export the smallest necessary interface; Prisma models are persistence details.

Keep controllers thin: receive concrete DTOs, read authenticated actor, invoke one command/query, map allowed response fields. The application command owns authorization-sensitive state checks and transaction boundaries. Workers call the same invariant-preserving commands or internal helpers. Do not depend only on controller guards for data isolation.

A deep module hides complexity such as issue-number allocation, concurrency, and audit writes behind a command like `createIssue(actor, workspaceId, input)`. Callers should not sequence six table writes themselves. Use real adapters at external seams (storage/video/mail) with deterministic failure adapters for tests. Do not build fake persistence that bypasses PostgreSQL isolation semantics.

### Authentication and permissions

Authenticate globally with explicit public routes. Workspace roles: OWNER, ADMIN, MEMBER, VIEWER. Preserve CLIENT only through explicit limited membership semantics and publication queries; do not derive full access from its existing ProjectRole value. If needed, introduce a workspace guest/client classification in the schema rather than reintroducing project-scoped authorization.

| Action                                                          | OWNER | ADMIN                        | MEMBER                                                             | VIEWER | CLIENT               |
| --------------------------------------------------------------- | ----- | ---------------------------- | ------------------------------------------------------------------ | ------ | -------------------- |
| Read internal active workspace records                          | Yes   | Yes                          | Yes                                                                | Yes    | No                   |
| Create/update ordinary work, comments, meetings and actions     | Yes   | Yes                          | Yes                                                                | No     | No                   |
| Configure workflow, manage members/invitations                  | Yes   | Yes, excluding owner changes | No                                                                 | No     | No                   |
| Finalize/amend minutes and accept decisions                     | Yes   | Yes                          | Designated organizer/minute-taker/approver with current membership | No     | No                   |
| Archive workspace, transfer ownership                           | Yes   | No                           | No                                                                 | No     | No                   |
| Export complete workspace, view audit, publish client artefacts | Yes   | Yes                          | No                                                                 | No     | No                   |
| Read explicitly published portal snapshots                      | Yes   | Yes                          | Yes                                                                | Yes    | Published items only |

Specify narrower per-record edit rules in the task tests; Scrum Master/Product Owner are accountabilities, not automatic administration. Suspend/revoke membership with immediate effect. Archived workspace is read-only except authorized restore/export; archived child records are excluded from normal lists. No ordinary endpoint permanently deletes history. Actor ids, timestamps, counters, tenant ids, audit fields and publication state are server controlled.

### Persistence and concurrency

Use scoped unique keys/foreign keys where supported to prevent mixed workspace/project/resource links. Every find/update/delete uses workspace scope, including child comments, searches, jobs, exports, and direct ids. Explicitly map expected Prisma unique/FK failures to safe 409/400 responses; log unexpected exceptions with redaction. Never expose query text or connection details.

Use interactive transactions for domain state plus activity/audit/outbox. Keep external network calls outside transactions. Use bounded transaction timeouts and retries only for recognized serialization/deadlock conflicts. Allocate issue numbers atomically with the internal project counter and insert the issue in the same transaction. Preserve number/key uniqueness in the database. Add a revision integer to mutable collaborative records and condition writes on expectedRevision; stale changes return 409. Use deterministic locks/constraints for reorder operations, finalization, owner transfer, and sprint start.

Require `Idempotency-Key` for invitation acceptance, action-to-issue conversion, sprint completion, export requests, and retry-prone external commands. Scope stored keys by actor, workspace, operation and key; hash canonical input. Concurrent same-input requests return one result; a reused key with different input returns 409. Persist the result reference with the domain transaction and define expiry/cleanup. Membership is rechecked on replay; old responses must not bypass revocation. This is retry safety, not a claim of exactly-once external delivery.

### HTTP conventions

Use `/api/v1` for product routes; keep health separate. Domain errors use one ErrorResponseDto: `statusCode`, stable `code`, safe `message`, `requestId`, optional bounded `fieldErrors` containing path/code/message. No stacks or tokens. Preserve status and relevant headers such as Retry-After. Correlate incoming trace context and generate a bounded request id when absent; never log arbitrary unvalidated header content.

Lists return resource-specific `{ items, nextCursor }` DTO classes. Use a stable composite sort such as createdAt/id; an opaque cursor includes the sort position and is validated against filter/scope. Limit is 1–100 with default 20. Allowlist sorting/filter keys. Dates are UTC ISO 8601; retain IANA workspace timezone for display and recurrence. UUID validation must accept the uuid(7) ids in the schema. Serialize BigInt storage sizes as decimal strings and document that representation.

## 4. DTO-driven dynamic Swagger: mandatory design

“Dynamic” means the OpenAPI document is generated from registered controllers, runtime DTO classes and decorator/compiler metadata for each build/start. It does not mean querying production data for schema definitions or dynamically permitting arbitrary fields. The generated JSON is a derived build artefact. Do not hand-maintain a parallel OpenAPI YAML contract.

The `nestjs-docs` skill’s `openapi/introduction.txt` chapter describes document generation and UI setup. Use one shared document factory for runtime docs and CI export. UI and JSON routes must be enabled/disabled or access-protected together. Use stable operationIds and explicit endpoint success/error metadata. Document the actual session-cookie security scheme and CSRF/origin requirements; do not advertise bearer authentication before implementing it.

The CLI plugin described in the `nestjs-docs` skill’s `openapi/cli-plugin.txt` chapter can infer property metadata and validation constraints. Add a peer-compatible `@nestjs/swagger` version, then configure `nest-cli.json` with `compilerOptions.plugins` containing:

```json
{
  "name": "@nestjs/swagger",
  "options": {
    "dtoFileNameSuffix": [".dto.ts"],
    "classValidatorShim": true,
    "introspectComments": false
  }
}
```

Keep existing compiler options. DTO files use `.dto.ts`; define concrete request, query, params, and response classes. Import runtime DTOs as values. Use `PartialType`, `PickType`, `OmitType`, `IntersectionType` from `@nestjs/swagger` where appropriate. Never derive an update DTO from a response DTO containing server-controlled fields. Avoid automatically allowing explicit null through PartialType when the column is non-null; use its supported skip-null option or explicit optional validators and test null separately.

The `nestjs-docs` skill’s `application/validation.txt` chapter separates runtime validators from documentation. Configure global ValidationPipe with whitelist, forbidNonWhitelisted and transform enabled; keep implicit conversion off and use explicit conversion for numeric query fields. Reject string booleans unless parsed deliberately. Add validators to all request fields, nested `ValidateNested` plus `Type`, bounded arrays and string sizes. Swagger properties are not runtime validation.

Use explicit ApiProperty/ApiPropertyOptional only for information inference cannot express reliably: semantic descriptions, examples, nullability, date-time/UUID formats, external/public enums, unions, lazy circular references, sensitive writeOnly inputs and readOnly outputs. Define concrete pagination response DTOs or register generic models with explicit schema references. Never expose Prisma entity classes or generated Prisma input types as public DTOs. Response DTOs do not automatically remove fields: use explicit select/projection and mappers; test actual response bodies for secrets and conformance.

### Worked slice: create issue

Files: `src/issues/dto/create-issue.dto.ts`, `update-issue.dto.ts`, `issue-response.dto.ts`, `issue-list-response.dto.ts`, `src/issues/issues.controller.ts`, application command, mapper, and tests.

CreateIssueDto contains bounded title, description, type, priority, optional assigneeId, parentId, sprintId and bounded acceptanceCriteria/labels. Do not accept key, number, workspaceId, projectId, reporterId, createdBy, archivedAt, or revision as create inputs. Initial workflow status is resolved by server configuration. Validate every linked id within scope. UpdateIssueDto derives only writable fields; transition/move have separate DTOs with expectedRevision. Responses expose public id/key/title/type/priority/workflowStatusId/revision/timestamps and allowed details, never raw relations by default.

For `POST W/issues`, bind `@Body() input: CreateIssueDto`, declare `Promise<IssueResponseDto>`, add ApiTags, a stable ApiOperation operationId such as `issues_create`, ApiCreatedResponse referencing IssueResponseDto, and ApiBadRequestResponse/ApiUnauthorizedResponse/ApiForbiddenResponse/ApiNotFoundResponse/ApiConflictResponse referencing ErrorResponseDto where applicable. Every typed child object must also resolve to a concrete schema. The route invokes one authorized transactional command and its mapper.

After build, changing CreateIssueDto's title limit must change the generated schema constraint and the request rejection boundary in tests. Removing an implemented endpoint must remove its path from generation. Adding a new DTO property without documentation support must fail contract coverage, rather than silently producing `{}`.

### Runtime and test compiler trap

Vitest/Vite does not automatically execute the Nest CLI Swagger transformer and may not preserve all Nest decorator metadata. Do not trust an OpenAPI test that imports source through an incompatible transform. Implement contract tests against `nest build` output, loading emitted AppModule and the shared document factory, or run the exact equivalent verified transformer. Use the same policy/bootstrap configuration for main, E2E, and generation. Ensure OpenAPI generation initializes metadata and app routes without binding a public port. Stub infrastructure only for document export, and assert that its controller/module set matches production configuration; never use that stub for database behavior tests.

Gate: run the built API using NodeAdapter; load the UI and JSON specification; verify all DTO properties, required fields, enums, arrays, nullable fields, nested schemas, parameters, statuses, cookies, and errors. Check NodeAdapter compatibility with Swagger UI/static assets and authentication cookie behavior before standardizing the integration. If unsupported, record the failure and make an explicit tested adapter decision. Do not silently switch to Express or copy Express request/response code.

### CI contract gates

Add scripts `openapi:generate` and `test:contract` only when implemented. Generate `artifacts/openapi.json` from the build and validate it with a maintained OpenAPI validator selected after checking existing tooling. Verify unique stable operationIds; no unresolved refs; no empty schemas for structured payloads; every implemented public route documented; every protected route has correct security; every documented payload matches runtime responses. Deliberately change a DTO in a temporary test fixture to prove drift detection. Compare against the last released specification for breaking changes, not merely the current working file. Generate frontend types from this artefact later; do not share Prisma models with Next.js.

## 5. Ordered implementation tasks

Each task below names prerequisites, files, ordered work and an acceptance gate. New dependency installation requires a real implemented use, current peer compatibility, and an updated workspace lockfile. Do not upgrade the entire stack as part of a feature.

### 00.1 Preserve and settle scope

Prerequisite: none. Files: backend docs and a private snapshot outside shared source.

1. Reinspect checkout/status and create/verify the private source snapshot described in CURRENT_STATE.
2. Record actual Node/pnpm/installed dependency versions. Inventory databases without exposing URLs, credentials or row content.
3. Record the one-workspace/one-project decision, old membership mapping, call provider selection criteria and export contents. If no data exists, say how that was verified; do not assume it from a fresh checkout.
4. Choose compatibility or consolidation for the internal Project schema. Recommend compatibility first to reduce migration risk. Enumerate field/membership conflicts requiring human resolution before data-changing migration.
5. Add a progress record using section 8. No source reset/deletion. After preservation, establish a source-controlled baseline only when committing is authorized; do not treat these documents as a recoverable copy of the implementation.

Gate: reproducible baseline and recoverable existing source; unresolved destructive migration decisions explicitly block only dependent migration steps.

### 01.1 Reproducible boot, config and transport

Prerequisite: 00.1. Files: `src/main.ts`, new `src/bootstrap.ts`, `src/config/*`, `src/app.module.ts`, package/build configs, `.env.example`, root `.gitignore`, tests.

1. Extract shared application setup so main, E2E and documentation generation use the same adapter, prefix, validation and filters. Do not listen inside an imported helper.
2. Validate required environment on startup: database URL, port, application origin, trusted origins, production cookie settings. Validate optional feature configuration only when that feature is enabled. Add safe placeholders to .env.example; leave .env untouched.
3. Choose `/api/v1`, document old `/api` compatibility/removal, and add separate health routing. Remove starter Hello World only after its replacement checks exist.
4. Enable shutdown hooks; close database/workers/transport on SIGTERM with a configured grace period. Configure body limits, headers, CORS allowlist and explicit proxy trust using adapter-supported APIs.
5. Exclude secrets, build output, generated client, test artefacts and local exports from version control. Preserve lockfiles and migrations. Smoke-test NodeNext aliases and production `node dist/main.js`; use relative imports or verified runtime alias resolution if emitted `@/` imports fail.

Gate: invalid configuration fails safely; built app starts and terminates using NodeAdapter in a controlled test environment; forbidden origin/body limit tests pass. Never print secret config values.

### 01.2 Shared HTTP contract and test harness

Prerequisite: 01.1. Files: `src/common/http/*`, `test/support/*`, Vitest configs, `test/app.e2e-spec.ts`.

1. Add ErrorResponseDto, pagination/query primitives and explicit enum/date/id handling. Implement global validation and safe exception mapping.
2. Add request correlation and structured log redaction for cookies, authorization, passwords, reset/invitation/OIDC tokens, signed URLs and sensitive bodies. Do not log all request bodies.
3. Replace starter E2E with the real adapter/bootstrap. Prove DI/decorator metadata works in the test compilation path; use built output if needed.
4. Provide disposable test PostgreSQL configuration with explicit test-only name/URL guard and cleanup. Never let test cleanup target an arbitrary DATABASE_URL.

Gate: malformed/nested/extra/null inputs, oversized bodies, dates, uuid(7), pagination boundaries, request ids and redacted unexpected errors behave as documented.

### 02.1 Install the DTO/OpenAPI pipeline

Prerequisite: 01.2. Files: `nest-cli.json`, `src/openapi/*`, DTO classes, package/lockfile, contract tests.

1. Implement section 4 with a compatible Swagger package and CLI plugin.
2. Implement runtime UI/JSON and build-time JSON generation from one shared factory. Gate both documentation endpoints by configuration and access policy.
3. Add concrete health/error/initial auth DTOs as available; do not describe non-existent feature endpoints as implemented.
4. Add generated-schema validation and runtime contract checks. Cover plugin metadata in the build path.

Gate: built NodeAdapter docs load; field constraints change when DTOs change; JSON/UI exposure policy is tested; no parallel hand-written schema.

### 02.2 Repair schema integrity and migration workflow

Prerequisite: 00.1 decision, 01.2. Files: schema, new migration, `prisma7.config.ts`, package scripts, `test/integration/schema*`.

1. Configure explicit custom Prisma config in scripts. Keep existing migration immutable if applied; do not rewrite history to match the plan.
2. Enforce the selected workspace/internal-project relation and authoritative membership source. Use an additive migration and conflict-check/backfill step before removing old columns.
3. Add tenant-consistent composite keys/FKs for each child relation. Test issue-parent/epic/sprint, agenda/meeting, decision/minutes, action/source and file links with mixed tenant fixtures.
4. Add revision fields where concurrent commands need them. Resolve workflow status authority and introduce relational board/status links. Migrate legacy enum states explicitly.
5. Add only immediately required join tables and command-idempotency/outbox models. Later task-specific tables are added in their own migrations.
6. Review cascade behavior, indexes for scoped lists, active-owner and active-sprint constraints. Partial indexes/check constraints may require reviewed SQL migrations.

Gate: migrations apply from empty database and a restored previous-schema fixture; cross-tenant associations fail at DB level where modeled; no data lost; generated client compiles. Migration status against production remains a release task.

### 03.1 Wire persistent email/password authentication

Prerequisite: 01.2, 02.1, 02.2. Files: existing auth files, `auth/stores/*`, `auth/providers/*`, DTOs/tests.

1. Inspect installed `@nestjs/authentication` declarations and matching docs. Register AuthenticationModule, UsersService, CredentialsService, session credential provider, and database storage through the library's documented registry. Do not copy API names from a different version.
2. Implement SessionStore methods: getSession, createSession, touchSession, deleteSession, listUserSessions, deleteUserSessions. Map optional Prisma null fields to undefined as the interface requires. Store hash ids only.
3. `touchSession` is conditional monotonic update, never upsert; deleting returns whether this caller won. Use the library `authenticationStoreContract()` suite with actual PostgreSQL and inspect required setup in its installed testing declarations.
4. Add register/sign-in/me/sign-out/session list/revoke handlers with DTOs and explicit field projections. Preserve email normalization and password rehash behavior; catch concurrent unique violations.
5. Enforce secure HttpOnly session cookies, expiry/idle timeout, rotation and immediate revocation. Configure CSRF/origin checks using supported APIs for the installed core/adapter, including public login routes. Never treat CORS alone as CSRF protection.
6. Add distributed-safe authentication rate limits before external exposure; use Redis when running multiple replicas and test failure policy. Avoid user enumeration in login/reset flows.

Gate: register, valid/invalid login, missing user, parallel register, expiry, rotation/revocation races, sign-out and cross-origin mutation tests pass. Public user/session responses contain no hashes/tokens. Protected routes deny unauthenticated access by default.

### 03.2 Verification, recovery and Google identity

Prerequisite: 03.1 and configured email/OIDC test provider. Files: auth handlers/stores/DTOs, new provider-account schema, `notifications/mail*` adapter.

1. Implement purpose-bound single-use expiring email tokens with atomic consumption. Generic request acknowledgement; expire/revoke sessions on password reset as policy specifies and test immediate effect.
2. Add email verification bound to current normalized email, preserving markEmailVerified's conditional semantics. Rate limit resend.
3. Add Google OIDC with state/nonce/PKCE, exact callback allowlist, verified issuer/audience and provider-subject identity mapping. Unverified/matching email alone cannot link an existing account. Require explicit authenticated linking or verified recovery.
4. Persist pending OIDC state for multiple replicas; never use process memory in production. Handle rejected/expired callback and mail outage without token leakage.

Gate: replay/expired/wrong-purpose tokens fail; email change invalidates old verification; account linking attacks fail; provider sandbox sign-in works. Without actual provider configuration, mark integration blocked, not complete.

### 04.1 Workspace authorization, membership and invitations

Prerequisite: 03.1, 02.2, and the mail adapter/token delivery portion of 03.2. Google setup does not block workspace implementation. Files: `authorization/*`, `workspaces/*`, `jobs/*`, DTOs, schema/migration as needed.

1. Implement global authentication plus shared workspace policy. Resolve actor from credentials and active membership on each command; body ids never select actor.
2. Create workspace, owner membership, internal project/default workflow and audit in one transaction. Add list/read/update/archive/restore endpoints.
3. Add invitations with hashed one-use token, expiry and target normalized email. Create durable email outbox entry with the invite transaction. Implement the first minimal leased PostgreSQL outbox dispatcher here so invitations are actually delivered; phase 13 expands this worker. Use the configured mail adapter with retry/deduplication tests. Accept atomically with token consumption and membership; never allow an admin to invite an OWNER.
4. Add membership role/suspend/remove commands and atomic ownership transfer. Lock the owner record; no last-owner removal or self-escalation. Revocation affects in-flight follow-up commands according to transaction policy.
5. Implement the permission matrix and invisible-resource 404 policy consistently for direct ids, lists and nested links.

Gate: every role/action combination, concurrent owner change, double invite acceptance, suspension and cross-workspace reads/writes are tested with real database fixtures. No child feature starts before this gate.

### 05.1 Issues, backlog, comments and dependency links

Prerequisite: 04.1. Files: `issues/*`, DTOs, transaction/mapping tests, necessary migrations.

1. Implement create/read/list/update/archive/duplicate following the worked DTO slice. Allocate number/key transactionally; preserve reservations on archival. Parent/epic/assignee/sprint must be valid in scope.
2. Implement list filters, personal work projection and exact key lookup. Index the actual query patterns. Bound text, labels and rich-text structure; sanitize supported rendering/export surfaces.
3. Implement ranking with a concrete first algorithm: fixed-scale integer order values, serialized moves per workspace and transactional rebalance when gaps run out. If using existing string rank, define one encoding/comparator and migrate deliberately; never sort numeric strings lexicographically.
4. Add expectedRevision update/move/transition and append activity/audit with change allowlist.
5. Add comments with author/admin edit/archive rules; dependency relations prohibit self-links, duplicates and blocking cycles. Fetch links both ways without storing two inconsistent copies.

Gate: parallel creates yield unique keys; stale edits lose safely; repeated moves preserve a deterministic order; illegal parent/cycle/mixed-scope links fail; archived issues disappear from ordinary board/list; actual responses conform to DTOs.

### 06.1 Workflow, boards and sprint lifecycle

Prerequisite: 05.1. Files: `boards/*`, `sprints/*`, schema constraints, DTOs/tests.

1. Implement configurable statuses/categories and board columns from relational status ids. Issue stores one authoritative workflowStatusId; map legacy enum explicitly. Define allowed transitions and disallow deleting in-use status.
2. Add Scrum/Kanban board projections and filtered reads. Mutation calls issue transition/move commands; board controller never writes Issue directly.
3. Create/update/start/cancel/complete sprints. Enforce at most one active sprint for the workspace/internal project with database protection and transactional command checks.
4. At start, store commitment snapshot; log scope additions/removals with timestamp. Complete atomically: final snapshot, explicit unfinished-work target, issue moves, audit and idempotency result. Validate target sprint scope/state.
5. Provide progress summary from defined done categories. Preserve historical goal/estimates/commitment snapshots; later edits must not rewrite past metrics.

Gate: simultaneous start/complete requests cannot create two active sprints or duplicate rollover; concurrent scope changes produce consistent snapshots; invalid date ranges/closed sprint changes reject; metric fixtures match manual expected totals.

### 07.1 Meetings, agenda, attendance and authoritative minutes

Prerequisite: 06.1. Files: `meetings/*`, `minutes/*`, DTOs and attendance/version migrations.

1. Schedule meetings with type, timezone-safe instants, organizer, linked sprint and bounded participants. Seed planning/daily/review/retrospective templates as explicit application defaults, not duplicated controller logic.
2. Implement agenda ordering and participant/attendance relational records; validate attendance/apologies against membership and meeting policy. Add meeting lifecycle commands with allowed transitions.
3. Enforce one authoritative minutes stream per meeting. Draft updates use revision. Finalize checks current authority and commits immutable version, finalization actor/time and audit atomically.
4. Amendment creates a new version linked to the finalized predecessor; never overwrite old snapshot. Expose draft/latest/version reads with explicit permissions.
5. Define rich-text payload schema and size bounds. Reject unsafe links/content on entry or sanitization before each supported output; do not claim DTO validation alone prevents XSS.

Gate: concurrent finalization creates one authoritative version; finalized edits fail; amendment preserves prior content/attendance; wrong-workspace agenda/sprint/participants fail; four Scrum templates round-trip.

### 08.1 Decisions, actions and meeting-to-work traceability

Prerequisite: 07.1, 05.1. Files: `decisions/*`, `actions/*`, version/update/link schema and tests.

1. Create scoped decisions/actions from meetings/minutes or standalone. Validate source relationships agree, including meeting/minutes/decision linkage. Add explicit decision acceptance/supersession and action completion/reopen rules.
2. Add DecisionVersion or immutable superseding records with revision policy; acceptance records rationale and authorized approvers. History is append-only.
3. Add action update timeline, owner/due date/status filters and overdue projection. Assignee must be active in workspace at assignment time.
4. Convert action to issue transactionally and idempotently: create one issue, save linkedIssueId, add lineage/activity/audit, return existing authorized result on same-key retry.
5. Query bidirectional traceability from relations; do not synchronize duplicate linked-id arrays.

Gate: failure after issue insert rolls back the entire conversion; concurrent conversion produces one linked issue; old decision/minutes versions remain readable; no lineage points outside the workspace.

### 09.1 Hosted audio/video calls

Prerequisite: 04.1, 07.1 and selected configured provider. Files: `calls/*`, provider adapter, Call/CallParticipant/provider-state migrations and DTOs.

1. Select an existing hosted WebRTC provider using documented server SDK, browser support, room limits, pricing and privacy requirements. Record the choice before adding its dependency; building a media server is outside this plan.
2. Persist call id, workspace, host, optional meeting, provider room id, scheduled/ad-hoc status and lifecycle timestamps. Avoid storing raw join credentials.
3. Create/join grants on the server after current membership checks. Limit room attendance to ten with provider enforcement plus transactional local reservation, expiry and reconciliation; a count-before-insert check is insufficient.
4. Host can end a call. Saving an ad-hoc call as a meeting requires host authorization and an idempotent command. Do not persist transcript/recording; do not automatically save ad-hoc minutes.
5. Verify provider webhook signatures/replays, reconcile disconnects and ensure membership removal blocks new grants; revoke active access when provider supports it and document its tested revocation limit.

Gate: real two-browser call, scheduled and ad-hoc flows, host end/save, denied outsider, eleventh participant rejection, expired grant, duplicate webhook and provider outage tests pass. Backend-only token tests do not prove media works.

### 10.1 Files and complete workspace ZIP export

Prerequisite: 08.1; export call records after 09.1. Files: `storage/*`, `exports/*`, `jobs/*`, migrations/DTOs.

1. Add S3-compatible storage adapter with opaque tenant-prefixed keys and private buckets. Prepare upload only after authorization, validate declared size/MIME, then verify actual object metadata/content on completion. Enforce quotas, filename safety and short URL lifetime. Do not proxy arbitrary user URLs or permit public-read ACLs.
2. Quarantine uploads and scan risky files using an actual selected scanning capability before serving them; if none exists, block those file classes rather than pretending a scan happened. Download rechecks membership and object scope; existing signed URL lifetime is a known revocation bound.
3. Add durable ExportJob state, request idempotency, cancellation, snapshot marker and outbox job. Capture a consistent record snapshot; stream ZIP rather than buffering an entire workspace in RAM.
4. ZIP contains manifest/schema version, core records, relationships, versions/activity/history, authorized uploaded file bytes, and GitHub links/metadata. Put archived/historical records under `archive/`. Exclude secrets, password/session tokens, signed URLs and integration credentials. Include checksums and attachment failure report; never silently label a partial ZIP complete.
5. Prevent path traversal/duplicate ZIP entries; no names from raw filenames without canonicalization. Enforce output size/time limits, expiry and secure cleanup. Recheck authorization before work and download; unavailable provider files have explicit failed/partial status.

Gate: inspect extracted fixture ZIP against database/file fixtures, including archive and checksums; large export stays within measured memory budget; repeated job delivery does not create duplicate success records; revoked member cannot request/download; cleanup/cancel/storage failure tests pass.

### 11.1 Documents and requirements

Prerequisite: 08.1, 10.1. Files: `documents/*`, `requirements/*`, DTOs and scoped relational links.

1. Implement folders/documents with cycle-safe hierarchy, draft/publish/archive and immutable revisions. Use bounded structured rich text and existing storage links.
2. Implement functional/nonfunctional requirement keys, status/priority, source document and issue relationships. Reject cross-scope links and invalid status transitions.
3. Provide scoped search/list/version reads with explicit response projection. Start with PostgreSQL search; do not add a search cluster.

Gate: revision immutability, folder cycle/move, publication authority, linked issue/source consistency, sanitization and search isolation tests pass.

### 12.1 Retrospectives, goals and governance

Prerequisite: 06.1, 08.1, 11.1. Files: separate `retrospectives/*`, `governance/*`, `planning/*` modules as behavior grows; migrations/DTOs.

1. Implement retrospective templates, open/close, feedback and follow-up actions. Anonymous response/audit/export projections must not reveal author via nested relations or metadata; document any retained identity and who can inspect it. Add unique voter/feedback relation and atomic vote updates rather than trusting voteCount.
2. Add risks with bounded probability/impact and mitigation/review dates; stakeholders with least-required personal data; change request propose/review/approve/reject/implement commands.
3. Add goals, milestones, status updates, Definition of Done/Ready and capacity records. Use relational scope-safe links, revision checks and audit. Do not turn free-text approval into authorization.
4. Reuse action commands for improvement follow-up across sprints rather than adding a second action system.

Gate: anonymous identity leakage checks, vote races, approval permissions, state transitions, invalid ranges/dates and retrospective follow-up behavior pass.

### 13.1 Durable delivery and notifications

Prerequisite: transactional outbox from 02.2 and invitation mail from 04.1. Files: `jobs/*`, `notifications/*`, preferences schema/DTOs.

1. Expand the PostgreSQL outbox dispatcher introduced in 04.1: transactionally claim with lease/skip-locked behavior, bounded batch, attempts/backoff, dead-letter status and safe manual retry. Track processed event/recipient keys for deduplication.
2. Add notification inbox/read/read-all, assignments/membership/mentions/reminders and announcements. Validate mention targets and recipient membership; do not email confidential records to revoked users.
3. Configure notification preferences and a controllable clock. Recurrence/reminders use workspace timezone with explicit DST policy; jobs must not duplicate across replicas.
4. Add external mail adapter with bounded retries/timeouts. If selecting BullMQ later, keep outbox as the database-to-queue handoff and consumers idempotent. Do not dual-write DB and Redis without recovery.

Gate: crash between claim/send/ack, duplicated events, multiple workers, expired lease, dead letters, DST changes and revoked recipients are tested. External email can repeat after provider timeout unless provider offers idempotency; document this limit.

### 14.1 Search, calendar, reports and realtime updates

Prerequisite: 05–13 as relevant. Files: `search/*`, `calendar/*`, `reporting/*`, `saved-filters/*`, optional `realtime/*`, DTOs/index migrations.

1. Implement workspace-wide lexical search and saved allowlisted filters. Shared filters cannot expand the caller's permissions. Bound query length, date window and cost.
2. Calendar combines authorized meetings/sprint dates/milestones/action deadlines. Reporting defines burndown/burnup, commitment/completion, velocity, cycle/lead time and cumulative flow from immutable events/snapshots. Document done/reopen/scope change rules and UTC boundaries.
3. Add realtime invalidation events using authenticated SSE for board/work updates unless bidirectional behavior requires WebSockets. Send scoped ids/revisions and let clients refetch authorized DTOs. No process-local-only fanout claim for multi-replica deployments; choose a shared transport when deploying replicas.
4. Recheck access at connection and on membership changes; implement heartbeat, reconnect cursor, bounded replay and slow-client policy. Do not put session secrets in URL query strings.

Gate: known metric fixtures match expected values; archived/foreign/private records never appear; revoked streams close; disconnect/reconnect recovers missed work; query plans measured on a declared dataset.

### 15.1 Explicit client portal publication

Prerequisite: 04.1, 07–11. Files: `client-portal/*`, publication DTOs/projections and schema as needed.

1. Publish allowlisted immutable snapshot fields from authorized source records, with source version and publisher/time. No generic sourceCollection lookup accepting arbitrary table names.
2. CLIENT/guest reads only published snapshots in its workspace. Private source edits do not silently leak; republish is explicit. Withdrawal immediately removes subsequent reads and generated links within documented URL expiry.
3. Protect attachments separately; don't publish all source attachments by inheritance. Audit publish/withdraw and owner/admin access.

Gate: guessing source ids, unpublished/withdrawn snapshots, source changes, nested fields and attachments cannot expose internal content.

### 16.1 GitHub and external integration seam

Prerequisite: 08.1, 10.1, 13.1. Files: `integrations/github/*`, `webhooks/*`, DTOs, persistence.

1. Start with optional GitHub references/metadata needed for traceability/export; define a supported GitHub App installation model before ingesting private data.
2. Store secret references/encrypted material outside public settings; least-privilege installation permissions, revocation and repository authorization on every operation. Guard outbound HTTP against SSRF with fixed provider endpoints.
3. Verify raw-body webhook signatures before parsing/processing; bound payload size, persist provider delivery id uniquely and enqueue atomically. Replay acknowledges existing delivery without duplicating effects.
4. Process metadata asynchronously with rate limits/backoff, app-installation scope and audit. Scope completion evidence rules explicitly; never declare work done merely because a PR exists.

Gate: invalid signature/replay/out-of-order/revoked installation/rate limit/private repository isolation tests and provider sandbox delivery pass. Public API keys/automation are separate deferred products.

### 17.1 Operational hardening and production evidence

Prerequisite: all release features under consideration. Files: health/bootstrap/config, logging/metrics, deployment files, CI, operational docs.

1. Replace self-HTTP health with liveness that checks process and readiness that checks required DB and enabled critical dependencies. Bound timeouts; no public detailed infrastructure errors.
2. Add structured request/job logs, traces and bounded-label metrics: latency/error rates, DB pool pressure, outbox age, job failures, auth anomalies and storage/video failures. API AGENTS designates NestJS Observe for production telemetry. Register only with configured credentials; do not run an account-linking command or claim telemetry exists without verification. Prefer supported OTEL export if the deployment requires it and record the decision.
3. Define draft measurable release targets: for a declared fixture of 10 workspaces with 10,000 issues each, 50 concurrent clients, p95 ordinary list/read under 500 ms and no unexpected 5xx during a 15-minute run. Exclude external media/export duration, measure them separately. These are proposed gates, not achieved numbers; tune with evidence.
4. Propose availability SLO 99.9%, RPO 24 hours and RTO 4 hours for approval before service commitments. Configure backups and perform a timed restore to a separate environment; record actual loss window/recovery time. Do not label these targets achieved without drills.
5. Add production container with supported pinned Node version, non-root user, minimal runtime artefacts and exact built entry. Separate migration credentials from runtime least-privilege DB role. Run migrations as deployment step, not every web process start.
6. Harden Compose/deployment: no public database/Redis/admin ports, actual service readiness, pinned SeaweedFS image, storage auth, TLS, secrets management, resource limits and network access controls. Preserve development data volumes.
7. CI runs frozen lock install, generation, formatting check, lint, typecheck, unit/integration/E2E/contract tests and build. Add dependency/secret checks; scope security scanning to authorized code/targets and review findings.

Gate: health failure/shutdown/drain tests; representative load evidence; telemetry visible with redacted test event; restore drill; clean environment deployment smoke test. A compile-only check is insufficient.

### 18.1 Staging, frontend contract and controlled release

Prerequisite: 17.1 and release scope gates. Files: generated contract integration, release/operations documentation; deployment changes only when explicitly authorized.

1. Generate frontend types from approved OpenAPI build artefact; verify login cookie/CSRF and one complete workspace-to-meeting-to-action-to-issue journey from browser to persisted database and back.
2. Run complete staging smoke matrix including two-workspace denial, invite/revoke, sprint rollover, immutable minutes, provider call, ZIP export and client publication as included in release scope.
3. Perform expand/backfill/validate/contract migrations against restored data; record rollback/forward-repair method and compatibility window. Avoid irreversible down migrations as the default recovery strategy.
4. Prepare concrete release artefacts, environment checklist and migration plan. Production deploy requires explicit user authorization. After authorized deployment, verify readiness, contract version, telemetry and a safe smoke journey; monitor rollback triggers.
5. Reconcile README's Firebase claims and API starter README with tested implementation. Update CURRENT_STATE/API_MAP/local intelligence to reflect actual completed work, preserving historical baseline separately if needed.

Gate: signed-off evidence for each release requirement, restorable data, known provider limits, and observed post-deploy checks. This planning task does not grant production permission.

### 19.1 Later-stage MCP protocol, identity and transport

Prerequisite: 17.1 and staging/contract evidence from 18.1; production deployment is not a prerequisite. Files: `src/mcp/mcp.module.ts`, transport/authorization adapters under `src/mcp/`, config, contract tests, and grant persistence migrations as needed. This is Avenro's own MCP server for assistant clients, distinct from Observe MCP.

1. Read the official [SDK documentation](https://modelcontextprotocol.io/docs/sdk). Select a maintained TypeScript SDK release, record its exact protocol revision and supported client versions, and test integration with the built Nest NodeAdapter. Prefer a direct SDK adapter; adopt a Nest integration package only for required verified behavior.
2. Add feature-gated `/mcp` using [Streamable HTTP](https://modelcontextprotocol.io/specification/latest/basic/transports), separate from REST versioning and existing application SSE. Implement the lifecycle, capabilities, metadata/version handling and cancellation required by the selected revision. Test older-client compatibility explicitly; do not assume all revisions use the same initialization/session model. Local stdio remains optional until a real consumer needs it.
3. Follow the [MCP authorization specification](https://modelcontextprotocol.io/specification/latest/basic/authorization): choose an OAuth authorization-server provider, implement protected-resource discovery metadata and intended clients' consent flow, and validate issuer, audience/resource, expiry and scopes. Use authorization code with PKCE where applicable. Existing browser login is not a complete OAuth authorization server; use the selected provider rather than implementing cryptography or a new identity system.
4. Define scopes `workspaces:read`, `issues:read`, `meetings:read`, `actions:read`, then `issues:write` and `actions:write`. Bind grants to actor, client and approved workspace set. Every invocation checks granted scopes AND workspace grant AND current membership. Revocation must apply to subsequent requests without depending on connection lifetime.
5. Apply TLS, origin/host validation, payload/time/concurrency limits and rate limiting. Follow [MCP security guidance](https://modelcontextprotocol.io/specification/latest/basic/security_best_practices) for consent, metadata-fetch SSRF and token handling. Reject foreign-audience tokens and use separately authorized downstream credentials. Keep tokens out of URLs/logs/results.

Gate: disabled endpoint is inaccessible; client discovery/request flow works on the built adapter; expired, wrong-audience and insufficient-scope tokens fail; revoked membership/grants and cross-workspace requests fail. Record interoperability with one SDK client and one intended assistant client. Missing provider configuration is a blocker, not a mocked production pass.

### 19.2 Curated read tools and DTO contract parity

Prerequisite: 19.1 and the underlying implemented domain queries. Files: `src/mcp/tools/*`, `src/mcp/contracts/*`, projection/validation helpers and integration tests.

1. Start with `list_workspaces`, `search_issues`, `get_issue`, `get_meeting_minutes` and `list_action_items`. Each invokes the same authorized application query as REST and returns bounded public DTO projections with source ids/revisions. Input ids are selectors; verified credentials determine the actor. Implement pagination and explicit truncation.
2. Register this tool allowlist explicitly; do not expose all controllers/tables. Give each tool descriptions, limits, required scopes, input/output schemas and accurate read-only/idempotency hints using the selected [tools specification](https://modelcontextprotocol.io/specification/latest/server/tools). Hints do not enforce authorization. Start with tools only; resources/prompts need their own requirement.
3. Extract shared DTO validation invoked by both transports: HTTP ValidationPipe does not automatically run for SDK handlers. Convert selected generated OpenAPI DTO schemas into SDK-compatible JSON Schema through a tested adapter, resolving references, nested fields, enums and nullability. Add only transport-specific envelope fields. Document/test constraints the converter cannot express. Reject unknown keys consistently.
4. Validate actual structured results and generate a versioned tool catalog from the explicit registry. CI checks DTO-to-tool schema parity and boundary values through both transports. Swagger documents REST; the tool catalog documents MCP. Describing `/mcp` in Swagger alone is insufficient.
5. Treat issue/minutes/document content as untrusted data with source context, never instructions that trigger other tools. Test prompt-injection content, redaction and permission errors. Reuse application response projections, not raw Prisma records.

Gate: intended client discovers exactly the allowlisted tools; actual results match output schemas; DTO changes update contracts or fail CI; real PostgreSQL fixtures prove scoped reads and revocation. No secrets/private source content leak through nested results, search, links or errors.

### 19.3 Controlled MCP writes and release gate

Prerequisite: 19.2 and verified domain transaction/idempotency commands. Files: MCP write handlers, grant/approval policy, audit context, tests and client/operator docs.

1. Initially add only `create_issue`, `update_issue` and `create_action_item`. Require corresponding write scope, current membership, DTO validation, idempotency key and expectedRevision for updates. Call existing application commands; never create MCP-specific persistence logic. Administrative/destructive/publication tools remain outside the initial allowlist.
2. Ordinary writes run within explicit user-granted scope and policy. Before adding elevated tools, define preview and consent behavior. Any required operation approval must be a server-side record bound to actor/client/workspace/operation/input hash/revision/expiry. A model-supplied `confirmed: true` is not approval.
3. Audit actor/client/tool/workspace/request id and safe change metadata; redact confidential payloads. Cancellation after commit does not undo writes; authorized same-key retry returns the prior result. Test concurrent retries, changed-input replay, stale revisions, revocation and cancellation after commit.
4. Apply staging load, monitoring, redaction and graceful-shutdown gates to MCP. Add `test:mcp` only when implemented. Publish supported clients/protocol versions, scope descriptions, catalog version and grant revocation instructions. Keep writes disabled until their gates pass.

Gate: real client performs scoped read/write and REST observes the same persisted result; duplicate calls cause one mutation; unauthorized calls cause none; contract parity passes. Production release requires the explicit deployment authorization and verification of 18.1. All phase 19 tasks begin NOT STARTED.

## 6. Deferred scope register

| Capability                                                  | Planned treatment                                                                                   | Activation condition                                     |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Custom roles, SSO, SCIM, enterprise MFA policy              | Separate identity/policy phase with tenant policy tests and account recovery design                 | Real organization requirements and provider decision     |
| Public REST tokens/refresh JWT mobile flow                  | Add scoped revocable credential model, audience, rotation/replay checks and own DTO/security scheme | Actual mobile/integration consumer                       |
| Bulk edits, prioritization scoring, custom fields/templates | Explicit bounded bulk commands with per-item policy and atomic/partial outcome contract             | Core workflows stable and requirements specified         |
| Portfolio, cross-workspace reporting/resource plans         | Permission-safe read projections, never implicit shared tenant access                               | Product explicitly changes single-workspace scope        |
| PDF minutes/evidence reports                                | Durable export job, selected rendering tool, sanitized content and attachment policy                | ZIP and immutable minutes working                        |
| External calendar sync/recurring templates/digests          | Provider cursor/idempotency, recurrence/DST and recipient privacy tests                             | Provider and conflict policy selected                    |
| Advanced workflow designer, Gantt, saved views/widgets      | Backend persists validated configuration and scoped projections; UI owns rendering                  | Concrete interface requirements                          |
| Jira/CSV migration or imports                               | Excluded by earlier scope; do not build                                                             | New explicit user request                                |
| Slack/Teams/GitLab/marketplace                              | Provider-specific signed webhook and credential adapter                                             | Selected integration, permissions and support owner      |
| Recording, transcription, AI summaries/refinement/search    | Excluded from current scope; add consent/data retention/provider/evaluation design if requested     | Explicit product decision and representative evaluations |
| Concurrent document editing                                 | Separate conflict model/presence/persistence design                                                 | Real simultaneous editing requirement                    |

Do not mistake this register for completed or scheduled features. The core feature inventory in API_MAP covers the intended REST surface; frontend-only interaction details do not require separate endpoints by default.

### Feature suggestions during implementation

At each completed task, suggest up to three additions when observed friction, a domain invariant or an operational gap supports them. Record the problem, evidence/assumption, smallest feature, dependencies, success measure, cost/risk and proposed phase. Deduplicate this register; use SUGGESTED / ACCEPTED / DEFERRED / REJECTED. Suggestions do not authorize implementation or expand the current task. If no useful opportunity appears, do not invent one.

These initial proposals are hypotheses, not validated demand:

| Status    | Feature/problem                               | Smallest useful version                                                           | Dependencies / validation / main risk                                    |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| SUGGESTED | Workspace access review for stale access      | Owner report of active members, pending invitations and remote-agent grants       | After 04/19; find/revoke seeded stale grants; protect member/device data |
| SUGGESTED | Traceability gap report for missing follow-up | Accepted decisions without actions and overdue unowned actions, linked to sources | After 08/14; match seeded gaps; define exclusions to avoid noise         |
| SUGGESTED | Conflict recovery after stale edits           | Safe latest revision and conflicting field names in a 409 response                | After 05–08; two-client edit fixture; prevent private field leakage      |
| SUGGESTED | Agent activity view for delegated changes     | Filter audit by OAuth client/tool and link to records/grant revocation            | After 19.3; attribute every fixture write once; redact payloads          |
| SUGGESTED | Export verification report                    | Record/file totals, missing attachments and checksum failures                     | After 10; detect intentionally corrupted attachment; bound scan cost     |
| SUGGESTED | Workflow change preview                       | Show affected issues and required reassignment before status change               | After 06; preview matches same-revision commit; expire stale previews    |

## 7. Commands and verification policy

Run from repository root unless stated otherwise. These are implementation instructions, not claims of completed execution.

```bash
pnpm install --frozen-lockfile
pnpm --filter @avenro/api exec prisma validate --config prisma7.config.ts
pnpm --filter @avenro/api exec prisma generate --config prisma7.config.ts
pnpm --filter @avenro/api exec tsc --noEmit -p tsconfig.build.json
pnpm --filter @avenro/api lint
pnpm --filter @avenro/api test
pnpm --filter @avenro/api build
pnpm --filter @avenro/api test:e2e
```

Validate/generate require configuration/environment appropriate to their operation; generators may emit ERD assets. Do not use them to conceal a missing migration. On a disposable verified development database only, create migrations using `pnpm --filter @avenro/api exec prisma migrate dev --config prisma7.config.ts --name <task-name>`. Inspect SQL before applying to valuable data. Production uses reviewed `prisma migrate deploy --config prisma7.config.ts` in an authorized deployment step. Never run migrate reset/db push with force-reset as a repair shortcut.

For source changes use the package format script or scope the same formatter to changed files. The current `pnpm --filter @avenro/api format` writes all src/test TypeScript and can change unrelated files; inspect diffs and keep the task focused. For these documentation files use:

```bash
pnpm --filter @avenro/api exec prettier --config prettier.config.mjs --write docs/backend/*.md .agents/MEMORY.md
pnpm --filter @avenro/api exec prettier --config prettier.config.mjs --check docs/backend/*.md .agents/MEMORY.md
```

Add integration, contract, load and security scripts only when their implementation exists, then record exact invocations here. Do not run nonexistent proposed commands and report them as passed. For every command report exit status, environment class and what behavior it proves. An unavailable external dependency is a blocker with a concrete reason, not a passing test.

## 8. Progress ledger and completion rules

All tasks start **NOT STARTED**. Baseline unit/build/type/lint passes belong to CURRENT_STATE, not completion of the planned tasks. When implementation begins, append one record per task here:

| Field     | Required content                                               |
| --------- | -------------------------------------------------------------- |
| Task      | Exact id, e.g. 03.1                                            |
| State     | NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED                 |
| Source    | Files and commit or private snapshot reference                 |
| Decisions | Scope/adapter/schema choices and reason                        |
| Migration | Filename, test database class, rollback/forward repair outcome |
| Evidence  | Exact commands, exit results, tested behavior and fixture      |
| Contract  | DTO/schema changes and breaking-change decision                |
| Remaining | Specific failures, provider setup, risks and next task         |

A task is VERIFIED only when its acceptance gate passes and results are recorded. Do not mark a phase complete based on generated files, installed dependencies, placeholders, mocks alone, or a green starter test. Release readiness requires all included feature gates plus 17.1 and 18.1 evidence. Phase 19 requires its own gates before an agent-integration release; earlier releases need not wait for MCP. Standards compliance/certification is outside the claims of this implementation plan.

### 00.1 Preserve and settle scope — 29 October 2026

**Task:** 00.1 Preserve and settle scope.

**State:** VERIFIED for baseline preservation and scope decisions. External database contents and migration conflicts remain unresolved and block only dependent migration work.

**Source:** Rechecked `/Users/aditya/Developer/personal/avenro`: `master`, no commits, and root files plus `.agents/` and `apps/` remain untracked. No application source files were changed. Private snapshot: `/Users/aditya/.codex/private-snapshots/avenro-00.1-20261029/source-before-00.1.tar.gz`, file mode 0600 in a mode 0700 snapshot directory. `tar -tzf` fully read the archive and listed 845 entries; SHA-256 is `8a9d0299286347b527268d04eac94a4061c3ecc4849443d50f809b32f6cc318e`. `.git` and `node_modules` were excluded; project files, generated local files and configuration (including `.env`, without reading or printing it) were archived.

**Decisions:** Preserve the historical product rule: one workspace is one project and the sole public access scope. Use compatibility first: retain internal `Project` records, resolve one project server-side, create it atomically with each new workspace, and make active `WorkspaceMember` the authorization source. `ProjectRole` is not equivalent to `WorkspaceRole`; keep Scrum accountability separate from permissions. Treat legacy `CLIENT` as a restricted guest classification only after explicit policy definition. Calls remain in scope for scheduled/ad-hoc 1:1 or group sessions of up to ten workspace members, with host-controlled saving of ad-hoc meeting records and no recording/transcription. Provider is not selected; evaluate browser/SDK support, ten-person enforcement, room lifecycle and webhook/revocation support, security/privacy and data region, reliability/support, pricing/limits, and operational fit before selection. Workspace ZIP scope includes workspace product records and relationships, uploads, GitHub references/metadata, and archived history under `archive/`; exclude credentials, provider secrets and live signed URLs. Include a manifest and checksums as part of the later export design.

**Migration:** No schema or database migration ran. Schema has separate `WorkspaceMember` and `ProjectMembership`; the former has `WorkspaceRole`, email/display-name snapshots, joined/invited fields and membership status, while the latter has project/workspace/user ids, `ProjectRole[]`, status and audit fields. No automatic role equivalence is safe. Before backfill, report project-count-per-workspace, membership/status/role disagreements, workspace/project id mismatches, owner-vs-lead differences, and creator/audit attribution conflicts without row content; require a product decision for conflicts and never merge/discard multiple projects automatically. The local Compose `avenro` database was verified to have 0 user tables and no `_prisma_migrations` table. This does not establish the configured API target or the contents of any external/production database.

**Evidence:**

- `git status --short` and `git rev-parse --show-toplevel` — confirmed checkout and untracked state.
- Snapshot creation plus `tar -tzf ... >/dev/null` — exit 0. Checksum and file modes are recorded above.
- `node --version` — `v26.8.1`; `pnpm --version` — `10.17.0`; package selector — `@avenro/api`.
- `pnpm --filter @avenro/api list --depth 0 --json` — exit 0. Installed runtime dependencies: `@nestjs/authentication` 0.1.2, `@nestjs/axios` 12.0.1, `@nestjs/common` 12.3.1, `@nestjs/config` 12.0.1, `@nestjs/core` 12.3.1, `@nestjs/mail` 0.0.1, `@nestjs/mapped-types` 12.0.0, `@nestjs/platform-express` 12.3.1, `@nestjs/platform-node` 12.3.2, `@nestjs/terminus` 12.1.0, `@prisma/adapter-pg` and `@prisma/client` 7.10.1, `class-transformer` 0.5.1, `class-validator` 0.15.1, `reflect-metadata` 0.2.2, `rxjs` 7.8.2. Installed dev dependencies: Mermaid CLI 12.0.0, Nest CLI/schematics 12.0.11, Nest Mau 0.2.9, Nest testing 12.3.1, Trivago import sorter 6.0.2, `@types/express` 5.0.6, `@types/node` 24.19.2, `@types/supertest` 7.2.1, Vitest coverage 4.1.12, dotenv 18.0.9, ESLint 9.39.5, Prettier 3.9.10, Prisma CLI 7.10.1, Prisma ERD generators 3.2.1 and 1.7.1, Puppeteer 25.16.0, source-map-support 0.5.21, Supertest 7.3.1, TypeScript 6.0.3, Vite 8.3.5, Vitest 4.1.12.
- `docker compose ps --services --status running` — Avenro PostgreSQL, Redis and SeaweedFS running. `docker ps --format '{{.Names}} {{.Image}} {{.Status}}'` — also found separate `lumenpath` and `flip-ledger` Supabase stacks.
- Read-only catalog queries with `docker exec ... psql ... SELECT datname ...` found `avenro` and `postgres` in Avenro PostgreSQL, and `_supabase`, `postgres`, `storage_vectors` in each Supabase PostgreSQL container. Read-only catalog summaries found 0 base tables and no `_prisma_migrations` in `avenro-postgres/avenro`, 105 base tables in `supabase_db_lumenpath/postgres`, and 65 in `supabase_db_flip-ledger/postgres`. The Avenro migration-history query could not return rows because `_prisma_migrations` is absent. No credentials, connection URLs, table rows or row contents were read or emitted.
- `pnpm --filter @avenro/api exec prettier --config prettier.config.mjs --write docs/backend/IMPLEMENTATION_PLAN.md` — exit 0. The corresponding `--check` command — exit 0.

**Contract:** No application contract or dependencies changed. No source test, type check, lint or build was applicable to this documentation-only task.

**Remaining:** The API's configured database target was not resolved because secret environment values were not inspected; no claim is made about Supabase or production Avenro data. Before 02.2, inspect a sanitized database identity and schema/count inventory through a safe path, then prepare the project/membership conflict report and obtain human decisions for ambiguous mappings. Provider selection remains a setup decision. No commit or source-controlled baseline was created because commit authorization was not part of this task.

### 01.1 Reproducible boot, config and transport — 29 October 2026

**Task:** 01.1 Reproducible boot, config and transport.

**State:** VERIFIED. The acceptance gate passed in unit, E2E and built-runtime checks. Database connectivity and production deployment remain outside this evidence.

**Source:** `src/main.ts`, new `src/bootstrap.ts`, `src/config/environment.ts` and its tests, `src/app.module.ts`, `src/health/health.controller.ts`, `test/app.e2e-spec.ts`, new `test/built-smoke.mjs`, `package.json`, `.env.example`, root `.gitignore`, this plan, `CURRENT_STATE.md`, `API_MAP.md`, and `.agents/MEMORY.md`. Existing auth files were restored from the verified 00.1 private snapshot after the required package-wide formatter touched their formatting; no unrelated source changes are retained.

**Decisions:** Product routes use `/api/v1`; health is excluded at `/health`, and `/api` has no compatibility alias. `ConfigModule` validates a PostgreSQL URL, integer port, application origin and trusted origins; production requires secure cookie settings. Validation errors contain variable names and safe descriptions, never values. Requests carrying an Origin outside the allowlist receive 403; requests without Origin remain usable for non-browser clients. CORS uses the same origin allowlist and credentials. The NodeAdapter has explicit proxy trust disabled by default, 1 MiB JSON/urlencoded limits, Nest security headers, HTTP timeouts, and a configurable drain period (`SHUTDOWN_GRACE_MS`, default 10 seconds, capped at 120 seconds) before remaining connections are closed. The main, E2E and future docs generation paths share adapter/bootstrap configuration. Dotenv loads before application imports.

**Migration:** None. No database or migration command ran. Lockfile and migrations are not excluded by `.gitignore`.

**Evidence:**

- `pnpm --filter @avenro/api format` — exit 0. The four unrelated auth files reformatted by this package-wide command were restored from the private 00.1 snapshot.
- `pnpm --filter @avenro/api test` — exit 0; 6 tests passed, covering required environment validation, value redaction, production cookie requirements, proxy defaults, and shutdown-grace bounds.
- `pnpm --filter @avenro/api test:e2e` — exit 0; 4 tests passed on NodeAdapter, covering `/api/v1`, `/health` exclusion, allowlisted and denied origins (403), security headers, 1 MiB JSON limit (413), and active-request drain before close.
- `pnpm --filter @avenro/api exec tsc --noEmit -p tsconfig.build.json` — exit 0.
- `pnpm --filter @avenro/api lint` — exit 0.
- `pnpm --filter @avenro/api build` — exit 0.
- `pnpm --filter @avenro/api test:built-smoke` — exit 0; emitted AppModule and runtime imports started on NodeAdapter, served `/api/v1`, returned security headers, and shut down. The Prisma provider was replaced with a test value; this does not verify database connectivity.
- `git check-ignore -v .env apps/api/.env apps/api/dist/main.js apps/api/src/generated/prisma/client.js apps/api/artifacts/openapi.json` — confirmed secrets, build output, generated client, and artifacts are ignored. `git check-ignore pnpm-lock.yaml apps/api/prisma/migrations/migration_lock.toml` — confirmed lockfile and migrations remain eligible for version control.

**Contract:** No DTO or OpenAPI contract exists yet. The starter route now sits at `/api/v1`; the prior `/api` route is removed. Health is served at `/health`. No OpenAPI generation path exists yet; it must use the shared bootstrap helper when introduced.

**Remaining:** The health endpoint's APP_ORIGIN and database probes were not invoked. Proxy trust parsing/defaults were tested, but forwarded IP/protocol behavior through a real trusted proxy was not. Real database, production cookie settings, external origins, and production startup were not exercised. No .env file was read or changed; no database reset, deployment, or commit occurred.

### 01.2 Shared HTTP contract and test harness — 29 October 2026

**Task:** 01.2 Shared HTTP contract and test harness.

**State:** VERIFIED. The shared contract and acceptance scenarios passed unit, NodeAdapter E2E, type, lint, build, and built-runtime checks. No database connection was made.

**Source:** `src/bootstrap.ts`, `src/common/http/*`, `test/app.e2e-spec.ts`, `test/support/test-database.ts`, and `test/test-database.spec.ts`. Commits: `68849f9` (HTTP contract/bootstrap and E2E) and `23c2678` (guarded disposable database client).

**Decisions:** Global validation transforms only explicitly decorated query inputs, forbids extra properties, rejects nulls and unknown nested values, and maps validation errors to bounded path/code/message items. Error responses use `statusCode`, stable `code`, safe `message`, and `requestId`; unexpected errors never return exception details and are logged with only request ID and method using JSON logger configuration. Request IDs accept only 1–64 ASCII letters, digits, underscores, or hyphens; invalid or absent values receive a generated UUID. Shared primitives provide limit 1–100 (default 20), bounded cursor text, UTC ISO timestamps, UUIDv7 and explicit enum validation. Test PostgreSQL clients require `NODE_ENV=test`, a distinct URL on localhost/loopback, a database named `avenro_test` or `avenro_test_*`, and a target distinct from `DATABASE_URL`; cleanup disconnects without dropping schemas or resetting data.

**Migration:** None. No database URL value was read or printed; no database connection, schema operation, reset, migration, or deployment ran.

**Evidence:**

- `pnpm --filter @avenro/api format` — exit 0. Package formatting touched four unrelated auth files; those formatter-only changes were restored before committing.
- `pnpm --filter @avenro/api test` — exit 0; 11 tests passed across 4 files, including URL guard, target comparison, Prisma client disconnect, recursive log redaction, and environment behavior.
- `pnpm --filter @avenro/api test:e2e` — exit 0; 7 tests passed using the shared NodeAdapter/bootstrap. Coverage includes 1 MiB body rejection (413), origin/security headers, drain behavior, decorator/DI metadata through constructor injection, nested/extra/null validation, UUIDv7, enum and UTC date handling, pagination default and 1/100 boundaries, request ID propagation/generation, and safe unexpected-error response/log payload.
- `pnpm --filter @avenro/api exec tsc --noEmit -p tsconfig.build.json` — exit 0.
- `pnpm --filter @avenro/api lint` — exit 0.
- `pnpm --filter @avenro/api build` — exit 0.
- `pnpm --filter @avenro/api test:built-smoke` — exit 0; emitted AppModule started and served a request through NodeAdapter, then shut down.
- Scoped commit script `/tmp/avenro-01-2-source-commits.sh` — exit 0; created `68849f9` and `23c2678` with named paths only.

**Contract:** Added `ErrorResponseDto`, `PaginationQueryDto`, and validators for explicit enums, UTC ISO dates, and UUIDv7. Validation and unexpected exceptions share the safe error envelope; oversized bodies retain the NodeAdapter's 413 response and include a correlated response header. No product endpoint DTOs or OpenAPI pipeline were added.

**Remaining:** E2E contract controllers are test fixtures, not product routes. The disposable database helper's URL guard and disconnect cleanup were tested without opening a database connection; PostgreSQL connectivity and schema behavior remain unverified. Real production startup, DB target, provider integrations, and deployment were not exercised. No secrets were read, no data was reset, and no deployment occurred.

## 9. Reference index

Use the `nestjs-docs` skill and its task-relevant chapters, discovered through the available skill catalog. The local corpus spans Nest 11–12 and may include features newer than an installed package. Installed declarations, package peers and runtime tests decide whether an example is usable. Read codebase-design for module/interface/seam discipline and antislop-code for comment hygiene.

| Task concern              | Local NestJS chapter under the skill directory                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Modules and DI            | `overview/modules.txt`, `fundamentals/custom-providers.txt`                                                |
| DTO and runtime input     | `application/validation.txt`, `application/serialization.txt`                                              |
| Swagger contracts         | `openapi/introduction.txt`, `cli-plugin.txt`, `types-and-parameters.txt`, `operations.txt`, `security.txt` |
| Identity                  | `security/authentication.txt`, `authorization.txt`                                                         |
| Prisma                    | `data/prisma.txt`, installed Prisma config/types                                                           |
| Config/lifecycle          | `application/configuration.txt`, `fundamentals/lifecycle-events.txt`                                       |
| Reliability               | `reliability/idempotency.txt`, `outbox.txt`, `locks.txt`                                                   |
| Production testing/health | `fundamentals/testing.txt`, `reliability/terminus.txt`                                                     |

The design choices and acceptance thresholds in this document are Avenro proposals. They are not promises or endorsements made by the referenced framework documentation.
