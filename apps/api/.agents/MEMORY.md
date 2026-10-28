# Avenro API local intelligence

Updated 29 October 2026. User-requested repository intelligence, not production telemetry and not a replacement for inspecting source.

## Read first

- [Implementation plan](../docs/backend/IMPLEMENTATION_PLAN.md): ordered tasks, prerequisites, exact file targets, DTO/OpenAPI contract, gates and progress ledger.
- [Current state](../docs/backend/CURRENT_STATE.md): preservation requirements, 46-model inventory, existing auth behavior and verification results.
- [API map](../docs/backend/API_MAP.md): connected module graph, existing routes, proposed module interfaces and endpoint matrix.

Paths above resolve from `apps/api/.agents/`. Root and API AGENTS instructions remain authoritative. No new source comments. Keep diffs small. Use the repository Prettier/import sorting. Never manually edit generated Prisma output.

## References and later-stage work

Every backend implementing/reviewing agent must use the `nestjs-docs` skill and relevant chapters, then check installed declarations. Require this skill in authorized backend handoffs.

Plan phase 19 adds Avenro MCP after core staging gates: protocol/OAuth transport, curated DTO-backed reads, then scoped idempotent writes. This is planned work, distinct from Observe MCP. Section 6 records feature suggestions; add evidence and validation without expanding the authorized task.

## Verified baseline

The package is `@avenro/api`. Nest core/common installed 12.3.1; NodeAdapter 12.3.2; authentication library 0.1.2; Prisma 7.10.1. ESM/NodeNext and `.js` import suffixes. Current main serves `/api` on PORT or 3001 using NodeAdapter, not the default Express adapter.

AppModule imports global config, Prisma, health and skeletal auth. Only GET `/api` (Hello World) and GET `/api/health` have handlers. Health pings BASE_URL/api and Prisma. AuthController has no endpoints; AuthService is empty. UsersService/CredentialsService contain real helper code but are not registered in AuthModule. No Swagger dependency/DTO/plugin/bootstrap exists. Schema and one large migration are persistence assets, not implemented feature endpoints.

Unit suite (one Hello World test), build, TypeScript check and lint passed during baseline inspection. E2E/DB/provider/runtime startup were not verified. Source E2E uses default adapter and `/`, unlike main. Build success does not prove runtime alias resolution, DB availability or contract generation.

## Task 01.1 current implementation

- `src/main.ts` loads dotenv and starts the application through `src/bootstrap.ts`; main and E2E share the NodeAdapter factory and HTTP setup. Future docs generation should call the same bootstrap configuration helper.
- Product routes use `/api/v1`; health is at `/health`; `/api` has no compatibility alias. Environment validation requires a PostgreSQL URL, port, app origin and trusted origins, and requires secure cookie settings in production.
- The adapter enforces a 1 MiB JSON/urlencoded body limit, security headers, an explicit request-origin allowlist and CORS. Proxy trust is disabled by default and can be scoped through `TRUSTED_PROXIES`. `SHUTDOWN_GRACE_MS` defaults to 10 seconds and bounds active-request drain before forced connection closure.
- E2E behavior and the built AppModule/alias smoke are recorded under task 01.1 in `docs/backend/IMPLEMENTATION_PLAN.md`. The built smoke overrides Prisma and does not verify database connectivity or the configured API database target.

## Constraints and unresolved decisions

- All root project assets were untracked; `master` had no commits. Private source snapshot required before replacement. Docs do not back up source or secrets.
- Root README still proposes Firebase; current backend is Nest/Prisma/PostgreSQL. Do not follow Firebase instructions for new backend work.
- Earlier product direction: workspace equals project and is sole access scope. Current schema separates them. Target public paths use workspace only; task 00.1 resolves internal compatibility/data migration before destructive change.
- Earlier scope includes up-to-ten-member hosted calls and complete ZIP exports, no recording/transcription/import tooling. Provider setup is not implemented.
- Prisma config filename is `prisma7.config.ts`; pass `--config prisma7.config.ts` from API package commands until scripts are fixed. Existing migration name `init_auth` misleadingly contains the full domain.
- Scalar tenant ids and id arrays alone do not enforce related-row scope. Repair constraints before exposing CRUD.
- Issue enum status and configurable WorkflowStatus conflict; choose one authoritative persisted workflow state.
- Existing session tables are not library store adapters. Need persistent storage, registration and contract tests.
- Root Compose has local PostgreSQL/Redis/SeaweedFS only. No production hardening, provider connectivity, CI, deployment or Observe telemetry was verified. Do not run account-linking or deployment without scoped authorization.
- Do not read/copy .env values into docs or logs. No database reset, migration-history rewrite, volume deletion or production deploy is authorized by the documentation task.

## Useful commands

From repository root: `pnpm --filter @avenro/api test`, `pnpm --filter @avenro/api build`, `pnpm --filter @avenro/api lint`, `pnpm --filter @avenro/api exec tsc --noEmit -p tsconfig.build.json`. E2E requires a guarded disposable database and matching bootstrap. New contract/integration scripts are planned, not currently available.

## Update policy

Update this file and the linked current map when actual implementation changes. Record exact verification evidence in the plan progress ledger. Keep historical source facts distinct from proposed architecture. Do not mark planned features implemented because their Prisma models exist. This is local repository documentation requested by the user; do not edit global generated memory files.
