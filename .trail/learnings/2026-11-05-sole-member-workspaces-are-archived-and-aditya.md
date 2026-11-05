---
title: "Sole-member workspaces are archived and the owner row scrubbed on account deletion, not purged"
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 11, tokens: 96817 }
id: l-9c1fa6d2
scope: repo
status: active
src: agent
touches:
  - docs/legal/data-retention.md
  - docs/plans/supabase-migration/04-compliance-data.md
  - lib/legal/versions.ts
  - lib/supabase/database.types.ts
  - supabase/migrations/20261105000300_compliance.sql
  - supabase/tests/compliance.test.sql
---

## Decided
When an account is deleted, a workspace where the user is the only member is archived, not hard-deleted. The user's owner row stays, with name and email scrubbed. The owner chose this over permanent purge. Other memberships are removed.

## Tried and ruled out
Hard-purging sole-member workspaces with a purge function. Dropped after the owner picked keep-and-scrub. Handing ownership to another owner was also dropped: the schema allows only one ACTIVE owner per workspace, so that branch can never run.

## Watch out
In the code: `prepare_account_deletion` in `supabase/migrations/20261105000300_compliance.sql`. The owner-membership constraint trigger forbids removing the owner row while the workspace still names that user as owner, so the row must stay. Auth user removal happens in the Auth admin API (phase 10), not in this function.
