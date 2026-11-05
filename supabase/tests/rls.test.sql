-- RLS and Scrum role checks. Runs with `pnpm db:test` against the local CLI stack.
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

-- Fixtures (run as the postgres role, which bypasses RLS)
insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-000000000001', 'owner@test.local'),
  ('a0000000-0000-4000-8000-000000000002', 'stranger@test.local'),
  ('a0000000-0000-4000-8000-000000000003', 'master@test.local'),
  ('a0000000-0000-4000-8000-000000000004', 'developer@test.local'),
  ('a0000000-0000-4000-8000-000000000005', 'viewer@test.local'),
  ('a0000000-0000-4000-8000-000000000006', 'client@test.local'),
  ('a0000000-0000-4000-8000-000000000007', 'admin@test.local'),
  ('a0000000-0000-4000-8000-000000000008', 'newbie@test.local');

update public.profiles set onboarded_at = now();

set constraints all deferred;

insert into public.workspace (id, name, slug, owner_id, created_by, updated_by) values
  ('b0000000-0000-4000-8000-000000000001', 'One', 'one', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000002', 'Two', 'two', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002');

insert into public.workspace_member (workspace_id, user_id, email, display_name, role, status) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'owner@test.local', 'Owner', 'OWNER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'master@test.local', 'Master', 'MEMBER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'developer@test.local', 'Dev', 'MEMBER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'viewer@test.local', 'Viewer', 'VIEWER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000007', 'admin@test.local', 'Admin', 'ADMIN', 'ACTIVE'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'client@test.local', 'Client', 'VIEWER', 'ACTIVE'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'stranger@test.local', 'Stranger', 'OWNER', 'ACTIVE');

insert into public.project (id, workspace_id, name, key, lead_id, created_by, updated_by) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Core', 'AVN', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001');

insert into public.project_membership (workspace_id, project_id, user_id, roles, created_by, updated_by) values
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', array['PRODUCT_OWNER']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', array['SCRUM_MASTER']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', array['DEVELOPER']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', array['DEVELOPER']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', array['CLIENT']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001');

insert into public.workflow_status (id, workspace_id, project_id, name, category, rank, color, created_by, updated_by) values
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'To do', 'BACKLOG', 'a', '#64748b', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001');

insert into public.issue (id, workspace_id, project_id, key, number, type, title, rank, reporter_id, workflow_status_id, created_by, updated_by) values
  ('e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'AVN-1', 1, 'STORY', 'First', 'a', 'a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001');

insert into public.notification (workspace_id, recipient_id, type, title, body) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'test', 'For developer', 'hi');

set constraints all immediate;

-- 1. anon reads nothing
set local role anon;
select throws_ok('select count(*) from public.issue', '42501', null, 'anon cannot read issue');
reset role;

-- 2. non-member reads nothing
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select is((select count(*)::int from public.issue), 0, 'non-member of workspace one reads no issue');
reset role;

-- 3. VIEWER reads but cannot insert
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
select is((select count(*)::int from public.issue), 1, 'workspace VIEWER with project DEVELOPER role reads issue');
select throws_ok($$insert into public.issue (workspace_id, project_id, key, number, type, title, rank, reporter_id, workflow_status_id, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'AVN-9', 9, 'TASK', 'nope', 'b', 'a0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005')$$, '42501', null, 'workspace VIEWER cannot insert issue');
reset role;

-- 4. CLIENT cannot read issue
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
select is((select count(*)::int from public.issue), 0, 'CLIENT project role cannot read issue');
reset role;

-- 5. DEVELOPER creates an issue
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
select lives_ok($$insert into public.issue (workspace_id, project_id, key, number, type, title, rank, reporter_id, workflow_status_id, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'AVN-2', 2, 'TASK', 'dev task', 'c', 'a0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004')$$, 'DEVELOPER creates an issue');

-- 6. DEVELOPER cannot start a sprint
select throws_ok($$insert into public.sprint (workspace_id, project_id, name, status, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Dev sprint', 'ACTIVE', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004')$$, '42501', null, 'DEVELOPER cannot start a sprint');
reset role;

-- 7. SCRUM_MASTER starts a sprint
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select lives_ok($$insert into public.sprint (workspace_id, project_id, name, status, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Sprint 1', 'ACTIVE', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003')$$, 'SCRUM_MASTER starts a sprint');
reset role;

-- 8. PRODUCT_OWNER cannot edit workflow
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select throws_ok($$insert into public.workflow_status (workspace_id, project_id, name, category, rank, color, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Blocked', 'ACTIVE', 'b', '#64748b', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001')$$, '42501', null, 'PRODUCT_OWNER cannot edit workflow');
-- 9. user A (owner) cannot read user B's notification
select is((select count(*)::int from public.notification), 0, 'owner cannot read another user notification');
reset role;

-- 10. admin manages members
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-000000000007","role":"authenticated"}', true);
select lives_ok($$insert into public.workspace_member (workspace_id, user_id, email, display_name, role, status) values ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000008', 'newbie@test.local', 'Newbie', 'MEMBER', 'ACTIVE')$$, 'admin adds a workspace member');
reset role;

-- 11. second PRODUCT_OWNER is rejected
select throws_ok($$insert into public.project_membership (workspace_id, project_id, user_id, roles, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000008', array['PRODUCT_OWNER']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001')$$, 'P0001', 'a project has at most one PRODUCT_OWNER', 'second PRODUCT_OWNER is rejected');

-- 12. VIEWER combined with DEVELOPER is rejected
select throws_ok($$insert into public.project_membership (workspace_id, project_id, user_id, roles, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000008', array['VIEWER', 'DEVELOPER']::public.project_role[], 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001')$$, 'P0001', 'VIEWER and CLIENT cannot be combined with other project roles', 'VIEWER with DEVELOPER is rejected');

-- 13. workspace without an active owner membership is rejected
set constraints all immediate;
select throws_ok($$insert into public.workspace (id, name, slug, owner_id, created_by, updated_by) values ('b0000000-0000-4000-8000-000000000009', 'Ghost', 'ghost', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000008')$$, 'P0001', 'workspace must have exactly one active owner membership', 'workspace without owner membership is rejected');
set constraints all deferred;

-- 14. every table in public has row level security
select is((select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity), 0, 'every public table has RLS');

-- 15. the profile trigger creates a row for each auth user
select is((select count(*)::int from public.profiles where id = 'a0000000-0000-4000-8000-000000000008'), 1, 'auth user gets a profile row');

select * from finish();
rollback;
