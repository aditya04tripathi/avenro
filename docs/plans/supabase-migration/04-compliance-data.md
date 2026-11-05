# Phase 04 — Compliance data layer

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 03 is committed.

Skills: `karpathy-guidelines`, `antislop-code`.

Migration `<ts>_compliance.sql`:
1. `legal_documents(slug text, version text, published_at timestamptz, primary key(slug, version))`; seed `terms`, `privacy` with version `2026-11-01` (must equal `lib/legal/versions.ts`).
2. `legal_acceptances(id, profile_id → profiles, document_slug, document_version, accepted_at, primary key id, unique(profile_id, document_slug, document_version))`. No IP address, no user agent (data minimisation; not needed to prove acceptance).
3. `marketing_consents(profile_id pk → profiles, opted_in boolean not null default false, opted_in_at, opted_out_at, source text check in ('signup','settings','unsubscribe_link'))`.
4. `privacy_requests(id, profile_id null, kind check in ('access','deletion','correction','objection'), status check in ('received','in_progress','completed','rejected'), received_at, due_at default received_at + interval '30 days', completed_at, notes)`.
5. Extend `handle_new_user()`: read `raw_user_meta_data` keys `terms_version`, `privacy_version`, `age_confirmed` (boolean), `marketing_opt_in` (boolean). When all three of terms/privacy/age are present and match the current `legal_documents`, set `onboarded_at`, `age_confirmed_at`, insert two `legal_acceptances` and the `marketing_consents` row. Otherwise create the profile un-onboarded (only possible when someone calls the Auth API directly, bypassing the form; such users must finish in `/auth/complete-profile` before any access). Never store the birth year.
6. RPCs (`SECURITY DEFINER`, `search_path = ''`, check `auth.uid()`): `complete_onboarding(terms_version, privacy_version)`, `accept_current_terms()`, `set_marketing_consent(opted_in, source)`, `export_my_data() returns jsonb` (profile, acceptances, consent, memberships and every row the user authored, found via FK columns pointing to `profiles`; list the columns from `domain-columns.txt`), `prepare_account_deletion() returns text` (refuses with `sole_owner` if the user is the only ACTIVE OWNER of a workspace that has other active members; otherwise archives sole-member workspaces, removes memberships, scrubs the profile to `display_name = 'Deleted user'`, `photo_url = null`, `deleted_at = now()`, deletes marketing consent, inserts a completed `privacy_requests` row).
7. `create extension if not exists pg_cron;` then retention jobs (defaults; owner confirms in owner actions): daily delete `auth.users` unconfirmed for 7 days (and their profiles); delete `notification` rows older than 90 days; delete `webhook_delivery` older than 30 days; delete `legal_acceptances` and `privacy_requests` of profiles deleted more than 3 years ago; `activity_event`/`audit_event` older than 2 years. Put each job's SQL in a named `SECURITY DEFINER` function (`private.retention_*`) and schedule the function, so pgTAP can call it directly and prove it deletes from `auth.users` with the job's privileges. Write the same table into `docs/legal/data-retention.md`.
8. pgTAP tests for the trigger (complete metadata onboards; missing age leaves un-onboarded), `prepare_account_deletion` (sole owner refused), `export_my_data` returns only the caller's data.

Acceptance: `pnpm db:reset && pnpm db:test` passes; regenerate types.

## Amendment 2 (5 Nov 2026) — overrides earlier steps where they conflict

retention table adds `trial_claims` (2 years, fraud prevention), `stripe_events` (90 days), and deletion of lapsed workspaces 30 days after read-only.

## Blockers

Blocked at step 6, `prepare_account_deletion()`. Nothing else in phase 04 was written: no migration, no tests, no types, no retention jobs. Phase 04 is not committed as done.

- Step 6 says: for sole-member workspaces, archive them and remove memberships. The schema forbids this. `workspace_member_owner_membership_required` (`supabase/migrations/20261105000000_domain_schema.sql:2517`, deferred constraint trigger on `workspace_member` INSERT/DELETE/UPDATE, function `require_workspace_owner_membership`) raises `workspace must have exactly one active owner membership` at commit unless `workspace.owner_id` has an ACTIVE `OWNER` membership in that workspace.
- A sole member is the owner, so removing their membership fails. Reassigning `owner_id` is impossible because no other owner exists.
- Proven 5 Nov 2026 on the local stack in a rolled-back transaction: insert workspace, insert OWNER membership, delete that membership, then `set constraints all immediate` → `ERROR: workspace must have exactly one active owner membership`.

Owner decision needed (pick one; agent must not choose):

1. Relax the invariant for `ARCHIVED` workspaces (trigger skips them, or the owner membership may be removed once archived). Changes phase 03 schema.
2. Keep the owner membership row for archived sole-owner workspaces and only scrub its `email` and `display_name`. Breaks "removes memberships" for that row.
3. Hard-delete sole-member workspaces with their data. Destructive; needs explicit owner approval per README rule 5.

Other gaps found, not blockers:

- `domain-columns.txt` (named in step 6 for `export_my_data`) does not exist. Export can be built from the FK list in the schema instead.
- `lib/legal/versions.ts` does not exist. Phase 08 creates it, so the `2026-11-01` seed check waits for phase 08.

### Resolution (orchestrator, 5 Nov 2026)

Use option 3, limited to the account owner's own erasure request:
- Add `private.purge_workspace(ws uuid)` (`SECURITY DEFINER`, `search_path = ''`). It deletes every row with that `workspace_id` in FK-dependency order, children first: build the order from `pg_constraint` foreign keys, write it out explicitly in the function, and delete `workspace` last. The owner trigger allows this, because `require_workspace_owner_membership()` returns early once the `workspace` row is gone. Phase 13 reuses this function for lapsed workspaces.
- In `prepare_account_deletion()`: for each workspace where the caller is the only ACTIVE member, call `private.purge_workspace` instead of archiving. Workspaces with other active members keep the `sole_owner` refusal when the caller is their only ACTIVE OWNER. For other workspaces, just remove the caller's memberships.
- pgTAP: a sole-member workspace and all its child rows are gone after `prepare_account_deletion()`; a shared workspace where the caller is not the owner keeps its data and loses only the caller's membership.
- Phase 10's deletion dialog must say "Workspaces where you are the only member are permanently deleted with all their content." (Phase 10's Amendment 2 bullet already cancels their subscriptions first.)

Other gaps:
- `domain-columns.txt` was removed with `supabase/_extract/` in phase 03. Build the `export_my_data()` column list from `information_schema` / `pg_constraint` foreign keys that reference `public.profiles(id)`.
- Create `lib/legal/versions.ts` now, with `TERMS_VERSION` and `PRIVACY_VERSION` both `"2026-11-01"`, so the seed check works. Phase 08 keeps it.
