---
title: Migration plan counts 38 domain tables but the Prisma schema has 43
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 2, tokens: 81443 }
id: l-f6072a01
scope: repo
status: active
src: agent
touches:
  - docs/plans/supabase-migration/01-schema-extract.md
  - apps/api/prisma/schema.prisma
  - docs/plans/supabase-migration/README.md
---

## Decided
- Phase 01 stopped at the schema count check and was recorded as a blocker, not worked around. The owner decides whether all 43 domain models port or which five drop.

## Tried and ruled out
- Assuming the 38 count and dropping the extra five by guess. Not done: the plan names no list, so any choice would be invented.

## Watch out
- In the code: `apps/api/prisma/schema.prisma` has 51 `model` blocks: 43 domain (including `User`) plus 8 auth (`Session`, `AuthenticationRateLimit`, `RefreshToken`, `MagicLink`, `EmailToken`, `OidcLogin`, `ProviderAccount`, `ApiKey`).
- In the code: `docs/plans/supabase-migration/README.md` says 38 domain and 46 total; phase 01 acceptance says 38 `CREATE TABLE`. Both are wrong against the schema until the owner confirms.
- The migrated throwaway DB matches the schema (43 + 8 + `_prisma_migrations`), so the count is not a migration artifact.
