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
  v_name text := left(btrim(coalesce(v_meta ->> 'display_name', '')), 50);
begin
  insert into public.profiles (id, display_name)
  values (new.id, v_name)
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

revoke execute on function public.handle_new_user() from public, anon, authenticated;
