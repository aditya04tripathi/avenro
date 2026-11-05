-- Compliance data layer: onboarding trigger, RPCs, export, account deletion, retention jobs.
-- Runs with `pnpm db:test` against the local CLI stack.
begin;
create extension if not exists pgtap with schema extensions;
select plan(31);

-- Fixtures (run as the postgres role, which bypasses RLS)
set constraints all deferred;

insert into auth.users (id, email, created_at, email_confirmed_at, raw_user_meta_data) values
  ('c0000000-0000-4000-8000-000000000001', 'solo@test.local', now(), now(), '{"terms_version":"2026-11-01","privacy_version":"2026-11-01","age_confirmed":true,"marketing_opt_in":true}'),
  ('c0000000-0000-4000-8000-000000000002', 'sole-owner@test.local', now(), now(), '{}'),
  ('c0000000-0000-4000-8000-000000000003', 'member@test.local', now(), now(), '{}'),
  ('c0000000-0000-4000-8000-000000000004', 'co-owner-a@test.local', now(), now(), '{}'),
  ('c0000000-0000-4000-8000-000000000005', 'co-owner-b@test.local', now(), now(), '{}'),
  ('c0000000-0000-4000-8000-000000000006', 'onboard@test.local', now(), now(), '{"terms_version":"2026-11-01","privacy_version":"2026-11-01","age_confirmed":true,"marketing_opt_in":false}'),
  ('c0000000-0000-4000-8000-000000000007', 'teen@test.local', now(), now(), '{"terms_version":"2026-11-01","privacy_version":"2026-11-01"}'),
  ('c0000000-0000-4000-8000-000000000008', 'stale@test.local', now() - interval '8 days', null, '{}');

insert into public.workspace (id, name, slug, owner_id, created_by, updated_by) values
  ('b0000000-0000-4000-8000-0000000000a1', 'Solo', 'solo-ws', 'c0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-0000000000a2', 'Shared', 'shared-ws', 'c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002');

insert into public.workspace_member (workspace_id, user_id, email, display_name, role, status) values
  ('b0000000-0000-4000-8000-0000000000a1', 'c0000000-0000-4000-8000-000000000001', 'solo@test.local', 'Solo', 'OWNER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-0000000000a2', 'c0000000-0000-4000-8000-000000000002', 'sole-owner@test.local', 'SoleOwner', 'OWNER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-0000000000a2', 'c0000000-0000-4000-8000-000000000003', 'member@test.local', 'Member', 'MEMBER', 'ACTIVE');

insert into public.project (id, workspace_id, name, key, lead_id, created_by, updated_by) values
  ('d0000000-0000-4000-8000-0000000000a2', 'b0000000-0000-4000-8000-0000000000a2', 'Shared project', 'SHR', 'c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002');

insert into public.notification (id, workspace_id, recipient_id, type, title, body, created_at) values
  ('e0000000-0000-4000-8000-0000000000a1', 'b0000000-0000-4000-8000-0000000000a2', 'c0000000-0000-4000-8000-000000000003', 'test', 'old', 'old', now() - interval '120 days');

set constraints all immediate;

-- 1-2. Seed and trigger onboarding
select is((select count(*)::int from public.legal_documents where version = '2026-11-01'), 2, 'legal documents seeded at 2026-11-01');
select isnt((select onboarded_at from public.profiles where id = 'c0000000-0000-4000-8000-000000000006'), null, 'complete metadata onboards the user');
select is((select count(*)::int from public.legal_acceptances where profile_id = 'c0000000-0000-4000-8000-000000000006'), 2, 'trigger records terms and privacy acceptance');

-- 3-5. Marketing consent default, missing age
select is((select opted_in from public.marketing_consents where profile_id = 'c0000000-0000-4000-8000-000000000006'), false, 'unticked marketing stays opted out');
select is((select onboarded_at from public.profiles where id = 'c0000000-0000-4000-8000-000000000007'), null, 'missing age leaves the user un-onboarded');
select is((select count(*)::int from public.legal_acceptances where profile_id = 'c0000000-0000-4000-8000-000000000007'), 0, 'missing age records no acceptance');

-- 6-8. RPCs: age gate, onboarding after age, marketing toggle
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000007","role":"authenticated"}', true);
select throws_ok($$select public.complete_onboarding('2026-11-01', '2026-11-01', false, false)$$, 'P0001', 'age_required', 'age gate blocks onboarding');
select lives_ok($$select public.complete_onboarding('2026-11-01', '2026-11-01', true, true)$$, 'complete_onboarding with age confirmed');
select is((select count(*)::int from public.legal_acceptances where profile_id = 'c0000000-0000-4000-8000-000000000007'), 2, 'complete_onboarding records both acceptances');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
select lives_ok($$select public.set_marketing_consent(true, 'settings')$$, 'set_marketing_consent runs for the caller');
select is((select count(*)::int from public.legal_acceptances where profile_id = 'c0000000-0000-4000-8000-000000000007'), 0, 'RLS hides another user acceptances');
reset role;

-- 9-10. Export returns only the caller's data
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select ok((select public.export_my_data()) ? 'workspace_member.user_id', 'export includes the caller membership rows');
select ok(position('c0000000-0000-4000-8000-000000000002' in (select public.export_my_data())::text) = 0, 'export excludes other users data');
reset role;

-- 11. Sole-owner refusal
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select throws_ok($$select public.prepare_account_deletion()$$, 'P0001', 'sole_owner', 'only owner of a shared workspace is refused');
reset role;

-- 12-16. Sole-member workspace is archived and the owner row scrubbed
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is((select public.prepare_account_deletion()), 'deleted', 'sole-member account deletion completes');
reset role;
select is((select status::text from public.workspace where id = 'b0000000-0000-4000-8000-0000000000a1'), 'ARCHIVED', 'sole-member workspace archived');
select is((select display_name from public.profiles where id = 'c0000000-0000-4000-8000-000000000001'), 'Deleted user', 'profile scrubbed');
select is((select display_name || '|' || email from public.workspace_member where workspace_id = 'b0000000-0000-4000-8000-0000000000a1' and user_id = 'c0000000-0000-4000-8000-000000000001'), 'Deleted user|', 'owner membership scrubbed, kept for invariant');
select is((select count(*)::int from public.marketing_consents where profile_id = 'c0000000-0000-4000-8000-000000000001'), 0, 'marketing consent deleted');

-- 17-18. Shared workspace: non-owner member leaves, data stays
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"c0000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select is((select public.prepare_account_deletion()), 'deleted', 'non-owner member deletion completes');
reset role;
select is((select count(*)::int from public.workspace_member where user_id = 'c0000000-0000-4000-8000-000000000003'), 0, 'non-owner membership removed');
select is((select count(*)::int from public.project where workspace_id = 'b0000000-0000-4000-8000-0000000000a2'), 1, 'shared workspace data kept');

-- Privacy request log
select is((select count(*)::int from public.privacy_requests where profile_id = 'c0000000-0000-4000-8000-000000000001' and kind = 'deletion' and status = 'completed'), 1, 'completed deletion request logged');

-- 24-25. Retention: unconfirmed users and old notifications
select ok((select private.retention_unconfirmed_users()) >= 1, 'retention removes stale unconfirmed users');
select is((select count(*)::int from auth.users where id = 'c0000000-0000-4000-8000-000000000008'), 0, 'stale unconfirmed user removed from auth.users');
select ok((select private.retention_notifications()) >= 1, 'notification retention removes old rows');
select is((select count(*)::int from public.notification where id = 'e0000000-0000-4000-8000-0000000000a1'), 0, 'old notification removed');

-- 26-27. Retention: deleted profile records older than 3 years
update public.profiles set deleted_at = now() - interval '4 years' where id = 'c0000000-0000-4000-8000-000000000006';
select lives_ok('select private.retention_deleted_profile_records()', 'deleted-profile retention runs');
select is((select count(*)::int from public.legal_acceptances where profile_id = 'c0000000-0000-4000-8000-000000000006'), 0, 'acceptances of profiles deleted over 3 years ago removed');

-- 28-29. Retention runs and cron schedule
select lives_ok('select private.retention_webhook_deliveries()', 'webhook retention runs');
select is((select count(*)::int from cron.job where jobname like 'retention-%'), 5, 'five retention jobs scheduled');

select * from finish();
rollback;
