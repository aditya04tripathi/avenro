---
title: Sole-owner account deletion cannot remove the owner membership under the workspace invariant
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 2, tokens: 77633 }
id: l-96c540b3
scope: repo
status: active
src: agent
touches:
  - docs/plans/supabase-migration/04-compliance-data.md
  - supabase/migrations/20261105000000_domain_schema.sql
---

## Decided
Phase 04 stops at `prepare_account_deletion`. The plan's "archive sole-member workspaces and remove memberships" is not implementable as written. The owner must choose a fix before any deletion RPC is built.

## Tried and ruled out
Deleting the owner's `workspace_member` row for a sole-member workspace. It fails at commit. Reassigning `owner_id` is impossible because no other owner exists.

## Watch out
In the code: `supabase/migrations/20261105000000_domain_schema.sql` line 2517, trigger `workspace_member_owner_membership_required` (deferred, on INSERT/DELETE/UPDATE of `workspace_member`), function `require_workspace_owner_membership`. Repro in a rolled-back transaction: insert workspace, insert OWNER membership, delete it, `set constraints all immediate`, which raises "workspace must have exactly one active owner membership".
Options for the owner: relax the invariant for ARCHIVED workspaces, keep and scrub the owner row, or hard-delete (needs approval).
