create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  language text not null default 'en' check (language in ('en', 'cs')),
  theme text not null default 'light' check (theme in ('light', 'dark', 'system'))
);

create table public.app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  constraint valid_state check (
    jsonb_typeof(state) = 'object'
    and state ->> 'version' = '1'
    and state #>> '{user,id}' = user_id::text
    and jsonb_typeof(state -> 'workspaces') = 'array'
    and jsonb_typeof(state -> 'meetings') = 'array'
    and jsonb_typeof(state -> 'todos') = 'array'
  )
);

create function public.create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name, language)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80),
    case when new.raw_user_meta_data ->> 'language' = 'cs' then 'cs' else 'en' end
  );
  return new;
end;
$$;

create trigger create_profile_after_signup after insert on auth.users
for each row execute function public.create_profile();

create function public.update_profile_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger update_profile_email_after_change after update of email on auth.users
for each row execute function public.update_profile_email();

revoke all on function public.create_profile() from public, anon, authenticated;
revoke all on function public.update_profile_email() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.app_states enable row level security;

create policy "Read own profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Read own state" on public.app_states for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Create own state" on public.app_states for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Update own state" on public.app_states for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.profiles, public.app_states from anon;
grant select on public.profiles to authenticated;
grant update (name, language, theme) on public.profiles to authenticated;
grant select, insert, update on public.app_states to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('recordings', 'recordings', false, 26214400)
on conflict (id) do nothing;

create policy "Read own recordings" on storage.objects for select to authenticated
using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload own recordings" on storage.objects for insert to authenticated
with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete own recordings" on storage.objects for delete to authenticated
using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);

create table public.ai_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0)
);
alter table public.ai_quotas enable row level security;
revoke all on public.ai_quotas from anon, authenticated;

create function public.consume_ai_quota() returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  allowed_count integer;
begin
  if current_user_id is null then return false; end if;
  insert into public.ai_quotas (user_id, window_started_at, request_count)
  values (current_user_id, now(), 1)
  on conflict (user_id) do update set
    window_started_at = case when public.ai_quotas.window_started_at < now() - interval '1 minute' then now() else public.ai_quotas.window_started_at end,
    request_count = case when public.ai_quotas.window_started_at < now() - interval '1 minute' then 1 else public.ai_quotas.request_count + 1 end
  returning request_count into allowed_count;
  return allowed_count <= 30;
end;
$$;
revoke all on function public.consume_ai_quota() from public, anon;
grant execute on function public.consume_ai_quota() to authenticated;
