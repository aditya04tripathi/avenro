# Phase 01 — Extract the exact database schema from Prisma

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 00 is committed.

Must run before phase 02 deletes `apps/api`. Skills: `karpathy-guidelines`. Read `apps/api/AGENTS.md` and `apps/api/.agents/MEMORY.md` (root AGENTS rule). No Nest or Prisma source is modified, so the `nestjs-docs` skill is not needed beyond that rule; use it if listed.

Steps:
1. Start a throwaway Postgres 17: `docker run --rm -d --name avenro-schema-extract -e POSTGRES_PASSWORD=extract -p 55432:5432 postgres:17-alpine`.
2. Apply the four existing migrations to it: from `apps/api`, `DATABASE_URL=postgresql://postgres:extract@127.0.0.1:55432/postgres pnpm exec prisma migrate deploy --config prisma7.config.ts`. If the config refuses a non-`avenro_test` URL under `NODE_ENV=test`, run with `NODE_ENV=development`.
3. Rename everything to snake_case inside the throwaway DB. Generate the statements with SQL, review, then execute:
   - snake function: `lower(regexp_replace(regexp_replace(name, '([a-z0-9])([A-Z])', '\1_\2', 'g'), '([A-Z]+)([A-Z][a-z])', '\1_\2', 'g'))`.
   - Generate `ALTER TABLE public.%I RENAME TO %I`, `ALTER TABLE … RENAME COLUMN`, and `ALTER TYPE public.%I RENAME TO %I` from `pg_class`/`information_schema.columns`/`pg_type` (schema `public`, skip `_prisma_migrations`).
   - Rename table `user` (from `User`) to `profiles`.
4. Drop the replaced auth tables: `sessions`, `authentication_rate_limits`, `refresh_tokens`, `magic_links`, `email_tokens`, `oidc_logins`, `provider_accounts`, `api_keys`, and `_prisma_migrations`.
5. On `profiles`: drop `password_hash`, `email_verified`, `email` (Supabase `auth.users` owns them; this is data minimisation). Add `deleted_at timestamptz`, `onboarded_at timestamptz`, `age_confirmed_at timestamptz`. Keep `id`, `display_name`, `photo_url`, `created_at`, `updated_at`.
6. Rewrite the body of `require_workspace_owner_membership()` by hand: column/table names inside plpgsql bodies are not renamed by step 3. Diff the old body against the new one line by line.
7. Prisma generated ids client-side (`uuid(7)`), so `id` columns have no default. Add `public.uuid_generate_v7()` (plpgsql, `SET search_path = ''`) and set it as the default on every `id uuid`/`id text` primary key. If ids are `text`, convert to `uuid` with `USING id::uuid` in the throwaway DB (tables are empty) and confirm FKs convert with them.
8. `updated_at` had Prisma `@updatedAt` (client-side). Add one trigger function `public.set_updated_at()` and a `BEFORE UPDATE` trigger on every table with an `updated_at` column.
9. Dump: `pg_dump --schema-only --no-owner --no-privileges --schema=public` into `apps/api/prisma/extract/domain.sql` (temporary location, moved in phase 03). Also save a column inventory `domain-columns.txt` from `information_schema.columns`.
10. Stop the container.

Acceptance: `domain.sql` has 38 `CREATE TABLE` statements (37 domain + `profiles`), all names snake_case, the two constraint triggers, the partial unique indexes, no auth tables, no `_prisma_migrations`. Grep finds no `"[A-Z]` quoted identifier.

Do not: run against the owner's `avenro` database; edit `schema.prisma`.

## Blockers

- Acceptance count contradicts the code (found 5 Nov 2026 during step 3, before any rename). `apps/api/prisma/schema.prisma` has 51 `model` blocks: 43 domain models (including `User`) plus 8 auth-storage models (`Session`, `AuthenticationRateLimit`, `RefreshToken`, `MagicLink`, `EmailToken`, `OidcLogin`, `ProviderAccount`, `ApiKey`). The migrated throwaway DB has the same 43 + 8 + `_prisma_migrations`. The README and this phase expect 38 domain tables and 46 models. Acceptance requires 38 `CREATE TABLE` (37 domain + `profiles`). This cannot pass as written.
- Five domain models are unaccounted for by the README decision table: the list is in `schema.prisma`, not guessed here. The owner must confirm whether all 43 domain models port to Supabase (and update the README counts) or which five are dropped.
- Steps 3 to 10 were not executed past inspection. Throwaway container `avenro-schema-extract` was stopped. No file in the repo changed except this section.
