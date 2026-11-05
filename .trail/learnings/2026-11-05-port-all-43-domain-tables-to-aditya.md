---
title: "Port all 43 domain tables to Supabase, do not drop any"
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 4, tokens: 59121 }
id: l-d91b04b6
scope: repo
status: active
src: agent
touches:
  - apps/api/prisma/extract/domain-columns.txt
  - apps/api/prisma/extract/domain.sql
  - docs/plans/supabase-migration/01-schema-extract.md
  - docs/plans/supabase-migration/README.md
---

## Decided
- The owner chose to port all 43 domain models (including User) to Supabase SQL. The 8 auth-storage models are not ported, since Supabase Auth replaces them.
- Migration phase 01 was re-run on that basis and the count check was corrected to 43 tables.

## Tried and ruled out
- Dropping five domain models to match the older 38-table plan. Ruled out by the owner: the plan named no five, and the choice was not made from the code.

## Watch out
- In the code: `docs/plans/supabase-migration/README.md` (schema scope row and model counts) and `docs/plans/supabase-migration/01-schema-extract.md` (acceptance, Blockers section) record this decision.
- In the code: phase 01 output is `apps/api/prisma/extract/domain.sql` and `domain-columns.txt`. Phase 03 moves it.
- The README decisions table still assumes OAuth in places; the owner removed Google OAuth and later said no OIDC, SSO or social login. Phases 03 to 05 have not been updated yet.
