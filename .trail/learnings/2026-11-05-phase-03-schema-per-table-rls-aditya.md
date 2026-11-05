---
title: "Phase 03 schema: per-table RLS with Scrum roles enforced in SQL, client access needs a workspace row"
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 20, tokens: 177474 }
id: l-f9a4f49d
scope: repo
status: active
src: agent
touches:
  - lib/supabase/database.types.ts
  - package.json
  - pnpm-lock.yaml
  - supabase/.gitignore
  - supabase/config.toml
  - supabase/migrations/20261105000000_domain_schema.sql
  - supabase/migrations/20261105000100_rls.sql
  - supabase/migrations/20261105000200_auth_profile.sql
  - supabase/seed.sql
---

## Decided
- RLS is written per table from a map of who may write each table (Scrum matrix). Readers use helpers in the private schema: workspace role, project roles, and has_project_access.
- Project roles are checked by a trigger on project_membership: at least one role, no duplicates, VIEWER/CLIENT alone, at most one PRODUCT_OWNER and one SCRUM_MASTER per project.
- A sprint can only be set ACTIVE when the project has both a PO and an SM.
- CLIENT users get a workspace_member row (role VIEWER) too, because the composite foreign key on project_membership needs it. Client access itself comes only from the CLIENT project role.

## Tried and ruled out
- Running the dump as-is failed: `CREATE SCHEMA public` already exists in Supabase, so that line is dropped.
- Column-level rules (only the PO sets backlog priority) are not enforceable in table-level RLS; they move to RPCs in phase 16.

## Watch out
- In the code: supabase/migrations/20261105000000_domain_schema.sql, supabase/migrations/20261105000100_rls.sql, supabase/tests/rls.test.sql (16 cases, `pnpm db:test`).
- Fixtures that insert workflow_status need a color value, and project_membership needs the matching workspace_member row, or inserts fail.
