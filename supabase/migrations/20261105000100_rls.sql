-- Row level security for the 43 domain tables, Scrum role helpers and constraints.
-- Helpers live in the private schema (not exposed by the API). Every helper is
-- STABLE SECURITY DEFINER with an empty search_path.

create schema if not exists private;

-- Workspace role for the caller: ACTIVE membership, null when the caller's profile
-- is not onboarded or is deleted.
create or replace function private.workspace_role(ws uuid)
returns public.workspace_role
language sql stable security definer set search_path = ''
as $$
  select m.role
  from public.workspace_member m
  join public.profiles p on p.id = m.user_id
  where m.workspace_id = ws
    and m.user_id = auth.uid()
    and m.status = 'ACTIVE'
    and p.onboarded_at is not null
    and p.deleted_at is null
$$;

create or replace function private.is_member(ws uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.workspace_role(ws) is not null $$;

create or replace function private.can_write(ws uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(private.workspace_role(ws) in ('OWNER', 'ADMIN', 'MEMBER'), false) $$;

create or replace function private.is_admin(ws uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(private.workspace_role(ws) in ('OWNER', 'ADMIN'), false) $$;

-- Project roles held by the caller in one project (empty when none).
create or replace function private.project_roles(project uuid)
returns public.project_role[]
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select pm.roles from public.project_membership pm
      where pm.project_id = project
        and pm.user_id = auth.uid()
        and pm.status = 'ACTIVE'),
    '{}'::public.project_role[])
$$;

create or replace function private.has_project_role(project uuid, roles public.project_role[])
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.project_roles(project) && roles $$;

-- Member of the workspace holding a project role that reads the project (not CLIENT only).
create or replace function private.has_project_access(ws uuid, project uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select private.is_member(ws)
    and private.project_roles(project) && array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER', 'VIEWER']::public.project_role[]
$$;

-- A project needs both a Product Owner and a Scrum Master before a sprint can be active.
create or replace function private.project_has_scrum_pair(project uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.project_membership where project_id = project and 'PRODUCT_OWNER' = any(roles))
     and exists (select 1 from public.project_membership where project_id = project and 'SCRUM_MASTER' = any(roles))
$$;

-- Project role rules, enforced on every write to project_membership.
create or replace function private.enforce_project_roles()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.roles is null or cardinality(new.roles) = 0 then
    raise exception 'project membership must hold at least one role';
  end if;
  if cardinality(new.roles) <> (select count(distinct r) from unnest(new.roles) r) then
    raise exception 'project membership roles must not repeat';
  end if;
  if new.roles && array['VIEWER', 'CLIENT']::public.project_role[] and cardinality(new.roles) > 1 then
    raise exception 'VIEWER and CLIENT cannot be combined with other project roles';
  end if;
  if 'PRODUCT_OWNER' = any(new.roles) and exists (
    select 1 from public.project_membership
    where project_id = new.project_id and id <> new.id and 'PRODUCT_OWNER' = any(roles)
  ) then
    raise exception 'a project has at most one PRODUCT_OWNER';
  end if;
  if 'SCRUM_MASTER' = any(new.roles) and exists (
    select 1 from public.project_membership
    where project_id = new.project_id and id <> new.id and 'SCRUM_MASTER' = any(roles)
  ) then
    raise exception 'a project has at most one SCRUM_MASTER';
  end if;
  return new;
end;
$$;

create trigger project_membership_enforce_roles
  before insert or update of roles on public.project_membership
  for each row execute function private.enforce_project_roles();

-- Revoke by default, then grant the helpers to signed-in users only.
revoke usage on schema private from public, anon;
grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

-- Tables: RLS on, no anon grants.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- Write policies for the Scrum matrix (APP_PATTERNS.md#scrum-roles) are per table.

-- Template A: project-scoped tables
create policy "action_item_select" on public.action_item
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "action_item_insert" on public.action_item
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "action_item_update" on public.action_item
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "activity_event_select" on public.activity_event
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));

create policy "board_column_select" on public.board_column
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "board_column_insert" on public.board_column
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));
create policy "board_column_update" on public.board_column
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));

create policy "board_config_select" on public.board_config
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "board_config_insert" on public.board_config
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));
create policy "board_config_update" on public.board_config
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));

create policy "change_request_select" on public.change_request
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "change_request_insert" on public.change_request
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "change_request_update" on public.change_request
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "client_portal_item_select" on public.client_portal_item
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id) or (status = 'PUBLISHED' and private.has_project_role(project_id, array['CLIENT']::public.project_role[])));
create policy "client_portal_item_insert" on public.client_portal_item
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "client_portal_item_update" on public.client_portal_item
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "decision_select" on public.decision
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "decision_insert" on public.decision
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "decision_update" on public.decision
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "document_folder_select" on public.document_folder
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "document_folder_insert" on public.document_folder
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "document_folder_update" on public.document_folder
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "document_version_select" on public.document_version
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "document_version_insert" on public.document_version
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "document_version_update" on public.document_version
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "issue_select" on public.issue
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "issue_insert" on public.issue
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "issue_update" on public.issue
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "issue_comment_select" on public.issue_comment
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "issue_comment_insert" on public.issue_comment
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "issue_comment_update" on public.issue_comment
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "issue_dependency_select" on public.issue_dependency
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "issue_dependency_insert" on public.issue_dependency
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "issue_dependency_update" on public.issue_dependency
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "meeting_select" on public.meeting
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "meeting_insert" on public.meeting
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "meeting_update" on public.meeting
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "meeting_agenda_item_select" on public.meeting_agenda_item
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "meeting_agenda_item_insert" on public.meeting_agenda_item
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "meeting_agenda_item_update" on public.meeting_agenda_item
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "meeting_minutes_select" on public.meeting_minutes
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "meeting_minutes_insert" on public.meeting_minutes
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "meeting_minutes_update" on public.meeting_minutes
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "meeting_minutes_version_select" on public.meeting_minutes_version
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "meeting_minutes_version_insert" on public.meeting_minutes_version
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "meeting_minutes_version_update" on public.meeting_minutes_version
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "milestone_select" on public.milestone
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "milestone_insert" on public.milestone
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "milestone_update" on public.milestone
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "project_document_select" on public.project_document
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "project_document_insert" on public.project_document
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "project_document_update" on public.project_document
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "project_goal_select" on public.project_goal
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "project_goal_insert" on public.project_goal
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "project_goal_update" on public.project_goal
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "project_key_reservation_select" on public.project_key_reservation
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));

create policy "project_status_update_select" on public.project_status_update
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "project_status_update_insert" on public.project_status_update
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "project_status_update_update" on public.project_status_update
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "requirement_select" on public.requirement
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "requirement_insert" on public.requirement
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));
create policy "requirement_update" on public.requirement
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER']::public.project_role[]));

create policy "retrospective_select" on public.retrospective
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "retrospective_insert" on public.retrospective
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));
create policy "retrospective_update" on public.retrospective
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));

create policy "retrospective_feedback_select" on public.retrospective_feedback
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "retrospective_feedback_insert" on public.retrospective_feedback
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "retrospective_feedback_update" on public.retrospective_feedback
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "risk_select" on public.risk
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "risk_insert" on public.risk
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "risk_update" on public.risk
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "saved_filter_select" on public.saved_filter
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "saved_filter_insert" on public.saved_filter
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "saved_filter_update" on public.saved_filter
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "sprint_select" on public.sprint
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "sprint_insert" on public.sprint
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]) and (status <> 'ACTIVE' or private.project_has_scrum_pair(project_id)));
create policy "sprint_update" on public.sprint
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]) and (status <> 'ACTIVE' or private.project_has_scrum_pair(project_id)))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]) and (status <> 'ACTIVE' or private.project_has_scrum_pair(project_id)));

create policy "sprint_scope_change_select" on public.sprint_scope_change
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "sprint_scope_change_insert" on public.sprint_scope_change
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));
create policy "sprint_scope_change_update" on public.sprint_scope_change
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));

create policy "sprint_snapshot_select" on public.sprint_snapshot
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));

create policy "stakeholder_select" on public.stakeholder
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "stakeholder_insert" on public.stakeholder
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER']::public.project_role[]));
create policy "stakeholder_update" on public.stakeholder
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER']::public.project_role[]));

create policy "storage_object_select" on public.storage_object
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "storage_object_insert" on public.storage_object
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));
create policy "storage_object_update" on public.storage_object
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['PRODUCT_OWNER', 'SCRUM_MASTER', 'DEVELOPER']::public.project_role[]));

create policy "workflow_status_select" on public.workflow_status
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "workflow_status_insert" on public.workflow_status
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));
create policy "workflow_status_update" on public.workflow_status
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));

create policy "workflow_transition_select" on public.workflow_transition
  for select to authenticated
  using (private.has_project_access(workspace_id, project_id));
create policy "workflow_transition_insert" on public.workflow_transition
  for insert to authenticated
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));
create policy "workflow_transition_update" on public.workflow_transition
  for update to authenticated
  using (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]))
  with check (private.can_write(workspace_id) and private.has_project_role(project_id, array['SCRUM_MASTER']::public.project_role[]));

-- Special tables
create policy "audit_event_select" on public.audit_event
  for select to authenticated
  using (private.is_admin(workspace_id));

-- integration, webhook_delivery: RLS on, no policies (server only)

create policy "notification_select" on public.notification
  for select to authenticated
  using (recipient_id = (select auth.uid()) and private.is_member(workspace_id));
create policy "notification_update" on public.notification
  for update to authenticated
  using (recipient_id = (select auth.uid()) and private.is_member(workspace_id))
  with check (recipient_id = (select auth.uid()) and private.is_member(workspace_id));

create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or exists (
    select 1 from public.workspace_member me
    join public.workspace_member other on other.workspace_id = me.workspace_id
    where me.user_id = (select auth.uid()) and me.status = 'ACTIVE'
      and other.user_id = profiles.id and other.status = 'ACTIVE'));
create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "project_select" on public.project
  for select to authenticated
  using (private.is_admin(workspace_id) or private.has_project_access(workspace_id, id) or private.has_project_role(id, array['CLIENT']::public.project_role[]));
create policy "project_insert" on public.project
  for insert to authenticated
  with check (private.is_admin(workspace_id));
create policy "project_update" on public.project
  for update to authenticated
  using (private.is_admin(workspace_id))
  with check (private.is_admin(workspace_id));

create policy "project_membership_select" on public.project_membership
  for select to authenticated
  using (private.is_member(workspace_id));
create policy "project_membership_insert" on public.project_membership
  for insert to authenticated
  with check (private.is_admin(workspace_id));
create policy "project_membership_update" on public.project_membership
  for update to authenticated
  using (private.is_admin(workspace_id))
  with check (private.is_admin(workspace_id));
create policy "project_membership_delete" on public.project_membership
  for delete to authenticated
  using (private.is_admin(workspace_id));

create policy "workspace_select" on public.workspace
  for select to authenticated
  using (private.is_member(id));
create policy "workspace_insert" on public.workspace
  for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "workspace_update" on public.workspace
  for update to authenticated
  using (private.is_admin(id))
  with check (private.is_admin(id));

create policy "workspace_member_select" on public.workspace_member
  for select to authenticated
  using (private.is_member(workspace_id));
create policy "workspace_member_insert" on public.workspace_member
  for insert to authenticated
  with check (private.is_admin(workspace_id) or (user_id = (select auth.uid()) and role = 'OWNER' and exists (select 1 from public.workspace w where w.id = workspace_id and w.owner_id = (select auth.uid()))));
create policy "workspace_member_update" on public.workspace_member
  for update to authenticated
  using (private.is_admin(workspace_id))
  with check (private.is_admin(workspace_id));
create policy "workspace_member_delete" on public.workspace_member
  for delete to authenticated
  using (private.is_admin(workspace_id));

create policy "workspace_invitation_select" on public.workspace_invitation
  for select to authenticated
  using (private.is_admin(workspace_id));
create policy "workspace_invitation_insert" on public.workspace_invitation
  for insert to authenticated
  with check (private.is_admin(workspace_id));
create policy "workspace_invitation_update" on public.workspace_invitation
  for update to authenticated
  using (private.is_admin(workspace_id))
  with check (private.is_admin(workspace_id));
create policy "workspace_invitation_delete" on public.workspace_invitation
  for delete to authenticated
  using (private.is_admin(workspace_id));

-- Storage: bucket workspace-files, first path segment is the workspace id
create policy "workspace_files_select" on storage.objects for select to authenticated
  using (bucket_id = 'workspace-files' and private.is_member(case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then (storage.foldername(name))[1]::uuid end));
create policy "workspace_files_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'workspace-files' and private.can_write(case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then (storage.foldername(name))[1]::uuid end));
create policy "workspace_files_update" on storage.objects for update to authenticated
  using (bucket_id = 'workspace-files' and private.can_write(case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then (storage.foldername(name))[1]::uuid end))
  with check (bucket_id = 'workspace-files' and private.can_write(case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then (storage.foldername(name))[1]::uuid end));
create policy "workspace_files_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'workspace-files' and private.can_write(case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then (storage.foldername(name))[1]::uuid end));
