# Phase 02 — Collapse the monorepo into one Next.js project

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 01 is committed.

Skills: `karpathy-guidelines`, `antislop-code`.

Steps:
1. `git mv apps/web/<every tracked file> .` (app, actions, components, hooks, lib, public, configs). Merge `apps/web/.gitignore` and `.prettierignore` into root files. Delete `apps/web/.prettierrc` if `prettier.config.mjs` supersedes it (check which one Prettier loads first; keep exactly one).
2. Move `assets/brand` and `assets/images` to `./assets/` (they already sit there; delete `assets/package.json`). Replace every `@avenro/assets/<path>` import with `@/assets/<path>`; root `tsconfig.json` `paths` `@/*` → `./*` covers it.
3. Inline `packages/prettier-config`, `packages/eslint-config/next.js`, `packages/typescript-config/base.json` into root `prettier.config.mjs`, `eslint.config.mjs`, `tsconfig.json`. Remove `workspace:*` dev deps.
4. Write a single root `package.json` (name `avenro`, private, `packageManager` kept) from `apps/web/package.json`; scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `db:start` (`supabase start`), `db:stop`, `db:reset` (`supabase db reset`, local only), `db:types`, `db:test` (`supabase test db`), `check:compliance` (phase 13).
5. Delete `apps/`, `packages/`, `pnpm-workspace.yaml`, `artifacts/openapi.json`, `.agents/skills/prisma-composer-core-concepts`, and the Postgres/Redis/SeaweedFS services in `docker-compose.yml` (file is rewritten in phase 06). Move `apps/api/prisma/extract/*` to `supabase/_extract/` first.
6. `next.config.ts`: drop the `turbopack.root` monorepo override and the unused `images.remotePatterns`.
7. Update root `AGENTS.md`: remove the API import order, Prisma and backend handoff sections; add the Next.js agent-rules block from `apps/web/AGENTS.md`; add a Supabase section (migrations in `supabase/migrations`, types via `pnpm db:types`, never edit generated types, RLS required on every table).
8. Update `README.md` stack line from Firebase to Next.js + Supabase; do not rewrite the feature roadmap.
9. Remove dependencies not imported anywhere outside `components/ui/` only if the matching `components/ui` file is deleted too. Default: keep them; unused components do not reach the client bundle. Do remove `@shadcn/react` if nothing imports it (`trail grep "@shadcn/react"`). Keep `shadcn` (globals.css imports `shadcn/tailwind.css`).
10. `rm -rf node_modules apps/web/node_modules && pnpm install`, regenerate the lockfile.
11. Old Docker data (owner approved deleting it on 5 Nov 2026). Run this step before step 5 edits `docker-compose.yml`, and only once phase 01's `domain.sql` is committed: stop the old stack with `docker compose down` from the repo root, run `docker volume ls --filter name=avenro`, and remove exactly the three volumes whose names end in `postgres_data`, `seaweedfs_data`, `redis_data` with `docker volume rm <name>`. Paste the `docker volume ls` output before and after into the commit message. Remove nothing else.

Acceptance: `pnpm build`, `pnpm lint`, `pnpm typecheck` pass at root; `git ls-files | grep -E '^(apps|packages)/'` is empty; marketing page renders at `pnpm dev`.

## Blockers

- Acceptance `pnpm lint` fails with 4 pre-existing product errors, same rules as before the move (`apps/web` used identical config): `components/avenro-logo.tsx:37` and `components/ui/carousel.tsx:97` and `hooks/use-mobile.ts:14` (`react-hooks/set-state-in-effect`); `components/marketing/faqs.tsx:81` (`react/no-unescaped-entities`). Fix in phase 07 (faqs copy) and phase 11 (logo, hooks, carousel a11y). Not fixed here: rule 7 forbids editing `components/ui` outside phase 11.
- `pnpm build`, `pnpm typecheck`, `pnpm format`, `pnpm dev` (HTTP 200 on `/`) pass.
