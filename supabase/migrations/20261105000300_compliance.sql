-- Compliance data layer: legal versions and acceptances, marketing consent, privacy requests,
-- onboarding, export and account deletion RPCs, and pg_cron retention jobs.

-- Versions of published legal documents. Must match lib/legal/versions.ts.
create table public.legal_documents (
  slug text not null check (slug in ('terms', 'privacy')),
  version text not null,
  published_at timestamptz not null,
  primary key (slug, version)
);

insert into public.legal_documents (slug, version, published_at) values
  ('terms', '2026-11-01', '2026-11-01T00:00:00Z'),
  ('privacy', '2026-11-01', '2026-11-01T00:00:00Z');

create table public.legal_acceptances (
  id uuid primary key default public.uuid_generate_v7(),
  profile_id uuid not null references public.profiles(id),
  document_slug text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  unique (profile_id, document_slug, document_version),
  foreign key (document_slug, document_version) references public.legal_documents (slug, version)
);

create table public.marketing_consents (
  profile_id uuid primary key references public.profiles(id),
  opted_in boolean not null default false,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  source text check (source in ('signup', 'settings', 'unsubscribe_link'))
);

create table public.privacy_requests (
  id uuid primary key default public.uuid_generate_v7(),
  profile_id uuid references public.profiles(id),
  kind text not null check (kind in ('access', 'deletion', 'correction', 'objection')),
  status text not null check (status in ('received', 'in_progress', 'completed', 'rejected')),
  received_at timestamptz not null default now(),
  due_at timestamptz not null default now() + interval '30 days',
  completed_at timestamptz,
  notes text
);

alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.marketing_consents enable row level security;
alter table public.privacy_requests enable row level security;

create policy "legal_documents_select" on public.legal_documents
  for select to anon, authenticated using (true);

create policy "legal_acceptances_select" on public.legal_acceptances
  for select to authenticated using (profile_id = (select auth.uid()));

create policy "marketing_consents_select" on public.marketing_consents
  for select to authenticated using (profile_id = (select auth.uid()));

create policy "privacy_requests_select" on public.privacy_requests
  for select to authenticated using (profile_id = (select auth.uid()));

grant select on public.legal_documents to anon, authenticated;
grant select on public.legal_acceptances, public.marketing_consents, public.privacy_requests to authenticated;

-- Writes go only through the RPCs below. No insert, update or delete policies on these tables.

create or replace function private.current_legal_version(p_slug text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select version from public.legal_documents
  where slug = p_slug and published_at <= now()
  order by published_at desc
  limit 1;
$$;

-- Sign-up metadata drives onboarding. Missing or false age_confirmed leaves the profile un-onboarded.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_terms text := v_meta ->> 'terms_version';
  v_privacy text := v_meta ->> 'privacy_version';
  v_age boolean := coalesce(v_meta ->> 'age_confirmed', '') = 'true';
  v_marketing boolean := coalesce(v_meta ->> 'marketing_opt_in', '') = 'true';
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  if v_age
    and v_terms = private.current_legal_version('terms')
    and v_privacy = private.current_legal_version('privacy') then
    update public.profiles
    set onboarded_at = now(), age_confirmed_at = now()
    where id = new.id;

    insert into public.legal_acceptances (profile_id, document_slug, document_version)
    values (new.id, 'terms', v_terms), (new.id, 'privacy', v_privacy);

    insert into public.marketing_consents (profile_id, opted_in, opted_in_at, source)
    values (new.id, v_marketing, case when v_marketing then now() end, 'signup');
  end if;

  return new;
end;
$$;

create or replace function public.complete_onboarding(
  p_terms_version text,
  p_privacy_version text,
  p_age_confirmed boolean default false,
  p_marketing_opt_in boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if not coalesce(p_age_confirmed, false) then
    raise exception 'age_required';
  end if;
  if p_terms_version <> private.current_legal_version('terms')
    or p_privacy_version <> private.current_legal_version('privacy') then
    raise exception 'stale_legal_version';
  end if;

  update public.profiles
  set onboarded_at = coalesce(onboarded_at, now()),
      age_confirmed_at = coalesce(age_confirmed_at, now())
  where id = uid;

  insert into public.legal_acceptances (profile_id, document_slug, document_version)
  values (uid, 'terms', p_terms_version), (uid, 'privacy', p_privacy_version)
  on conflict do nothing;

  insert into public.marketing_consents (profile_id, opted_in, opted_in_at, opted_out_at, source)
  values (
    uid,
    coalesce(p_marketing_opt_in, false),
    case when coalesce(p_marketing_opt_in, false) then now() end,
    case when coalesce(p_marketing_opt_in, false) then null else now() end,
    'signup'
  )
  on conflict (profile_id) do nothing;
end;
$$;

create or replace function public.accept_current_terms()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  insert into public.legal_acceptances (profile_id, document_slug, document_version)
  values
    (uid, 'terms', private.current_legal_version('terms')),
    (uid, 'privacy', private.current_legal_version('privacy'))
  on conflict do nothing;
end;
$$;

create or replace function public.set_marketing_consent(p_opted_in boolean, p_source text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_source not in ('signup', 'settings', 'unsubscribe_link') then
    raise exception 'invalid_source';
  end if;

  insert into public.marketing_consents (profile_id, opted_in, opted_in_at, opted_out_at, source)
  values (
    uid,
    p_opted_in,
    case when p_opted_in then now() end,
    case when p_opted_in then null else now() end,
    p_source
  )
  on conflict (profile_id) do update
  set opted_in = excluded.opted_in,
      opted_in_at = case when excluded.opted_in then now() else public.marketing_consents.opted_in_at end,
      opted_out_at = case when excluded.opted_in then public.marketing_consents.opted_out_at else now() end,
      source = excluded.source;
end;
$$;

-- Every table with a foreign key to profiles(id) is exported, filtered to the caller.
-- The column list comes from pg_constraint, so new tables are included without editing this function.
create or replace function public.export_my_data()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  result jsonb;
  fk record;
  table_rows jsonb;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  result := jsonb_build_object(
    'profile', (select to_jsonb(p) from public.profiles p where p.id = uid)
  );

  for fk in
    select cl.relname::text as tbl, a.attname::text as col, c.conrelid::regclass::text as qualified
    from pg_constraint c
    join pg_class cl on cl.oid = c.conrelid
    join pg_namespace n on n.oid = cl.relnamespace
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and c.confrelid = 'public.profiles'::regclass
      and c.conrelid <> 'public.profiles'::regclass
      and cardinality(c.conkey) = 1
      and n.nspname = 'public'
  loop
    execute format(
      'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from %s t where t.%I = $1',
      fk.qualified,
      fk.col
    )
    into table_rows
    using uid;

    if table_rows <> '[]'::jsonb then
      result := result || jsonb_build_object(fk.tbl || '.' || fk.col, table_rows);
    end if;
  end loop;

  return result;
end;
$$;

-- Deletes the caller's account data. The auth.users row is removed separately by the Auth admin API (phase 10).
-- Sole-member workspaces are archived, and the caller's ACTIVE OWNER row is kept and scrubbed.
-- The owner invariant (require_workspace_owner_membership) forbids removing that row while
-- workspace.owner_id still points at the caller.
create or replace function public.prepare_account_deletion()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  ws record;
  successor uuid;
  kept_workspaces uuid[] := '{}';
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  -- Refuse when the caller is the only ACTIVE OWNER of a workspace that has other active members.
  if exists (
    select 1
    from public.workspace_member me
    where me.user_id = uid
      and me.status = 'ACTIVE'
      and me.role = 'OWNER'
      and exists (
        select 1 from public.workspace_member o
        where o.workspace_id = me.workspace_id and o.user_id <> uid and o.status = 'ACTIVE'
      )
      and not exists (
        select 1 from public.workspace_member o
        where o.workspace_id = me.workspace_id and o.user_id <> uid
          and o.status = 'ACTIVE' and o.role = 'OWNER'
      )
  ) then
    raise exception 'sole_owner';
  end if;

  -- Sole-member workspaces: archive, drop the caller's other rows, scrub the owner row.
  for ws in
    select w.id
    from public.workspace w
    join public.workspace_member me on me.workspace_id = w.id
    where me.user_id = uid and me.status = 'ACTIVE'
      and not exists (
        select 1 from public.workspace_member o
        where o.workspace_id = w.id and o.user_id <> uid and o.status = 'ACTIVE'
      )
  loop
    delete from public.workspace_member
    where workspace_id = ws.id and user_id = uid and status <> 'ACTIVE';

    update public.workspace
    set status = 'ARCHIVED', archived_at = now(), archived_by = 'account_deletion',
        updated_at = now(), updated_by = uid
    where id = ws.id;

    update public.workspace_member
    set email = '', display_name = 'Deleted user', updated_at = now()
    where workspace_id = ws.id and user_id = uid;

    kept_workspaces := kept_workspaces || ws.id;
  end loop;

  -- Every other membership of the caller goes.
  delete from public.workspace_member
  where user_id = uid and not (workspace_id = any(kept_workspaces));

  update public.profiles
  set display_name = 'Deleted user', photo_url = null, deleted_at = now(), updated_at = now()
  where id = uid;

  delete from public.marketing_consents where profile_id = uid;

  insert into public.privacy_requests (profile_id, kind, status, completed_at)
  values (uid, 'deletion', 'completed', now());

  -- Re-check the owner invariant now, not at commit, so a failure surfaces inside this call.
  set constraints all immediate;

  return 'deleted';
end;
$$;

-- Retention jobs. Each is a named SECURITY DEFINER function so pgTAP can call it directly.
create or replace function private.retention_unconfirmed_users()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  stale_ids uuid[];
  removed integer;
begin
  select coalesce(array_agg(id), '{}') into stale_ids
  from auth.users
  where email_confirmed_at is null and created_at < now() - interval '7 days';

  delete from public.profiles where id = any(stale_ids);
  delete from auth.users where id = any(stale_ids);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function private.retention_notifications()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.notification where created_at < now() - interval '90 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function private.retention_webhook_deliveries()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.webhook_delivery where received_at < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function private.retention_deleted_profile_records()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_ids uuid[];
  removed integer;
begin
  select coalesce(array_agg(id), '{}') into old_ids
  from public.profiles
  where deleted_at < now() - interval '3 years';

  delete from public.legal_acceptances where profile_id = any(old_ids);
  delete from public.privacy_requests where profile_id = any(old_ids);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function private.retention_activity_logs()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer := 0;
  batch integer;
begin
  delete from public.activity_event where occurred_at < now() - interval '2 years';
  get diagnostics batch = row_count;
  removed := removed + batch;

  delete from public.audit_event where occurred_at < now() - interval '2 years';
  get diagnostics batch = row_count;
  return removed + batch;
end;
$$;

revoke all on function private.current_legal_version(text) from public, anon, authenticated;
revoke all on function private.retention_unconfirmed_users() from public, anon, authenticated;
revoke all on function private.retention_notifications() from public, anon, authenticated;
revoke all on function private.retention_webhook_deliveries() from public, anon, authenticated;
revoke all on function private.retention_deleted_profile_records() from public, anon, authenticated;
revoke all on function private.retention_activity_logs() from public, anon, authenticated;

revoke all on function public.complete_onboarding(text, text, boolean, boolean) from public, anon;
revoke all on function public.accept_current_terms() from public, anon;
revoke all on function public.set_marketing_consent(boolean, text) from public, anon;
revoke all on function public.export_my_data() from public, anon;
revoke all on function public.prepare_account_deletion() from public, anon;
grant execute on function public.complete_onboarding(text, text, boolean, boolean) to authenticated;
grant execute on function public.accept_current_terms() to authenticated;
grant execute on function public.set_marketing_consent(boolean, text) to authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.prepare_account_deletion() to authenticated;

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('retention-unconfirmed-users', '0 3 * * *', 'select private.retention_unconfirmed_users()');
select cron.schedule('retention-notifications', '10 3 * * *', 'select private.retention_notifications()');
select cron.schedule('retention-webhook-deliveries', '20 3 * * *', 'select private.retention_webhook_deliveries()');
select cron.schedule('retention-deleted-profile-records', '30 3 * * *', 'select private.retention_deleted_profile_records()');
select cron.schedule('retention-activity-logs', '40 3 * * *', 'select private.retention_activity_logs()');
