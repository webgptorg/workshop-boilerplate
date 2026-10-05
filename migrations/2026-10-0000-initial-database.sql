-- Supabase owns auth.users/auth.identities and their vendor-defined names.
-- Application names are quoted so PostgreSQL preserves PascalCase/camelCase.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table public."User" (
  "id" uuid constraint "userIdConstraint" primary key
    constraint "userAuthIdConstraint" references auth.users(id) on delete cascade,
  "email" varchar(254) not null constraint "userEmailConstraint" unique,
  "name" varchar(80) not null default '',
  "language" varchar(2) not null default 'en' constraint "userLanguageConstraint" check ("language" in ('en', 'cs')),
  "theme" varchar(6) not null default 'light' constraint "userThemeConstraint" check ("theme" in ('light', 'dark', 'system')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- A versioned snapshot preserves the existing domain model and atomically saves
-- workspaces, memberships, meetings, transcripts, recordings' metadata and todos.
create function private."isBoundedAppData"("data" jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select jsonb_typeof("data") = 'object'
    and octet_length("data"::text) <= 20971520
    and not exists (
      select 1 from jsonb_path_query("data", '$.** ? (@.type() == "string")') as item
      where char_length(item #>> '{}') > 200000
    );
$$;

create table public."AppData" (
  "userId" uuid constraint "appDataUserIdConstraint" primary key
    constraint "appDataUserReferenceConstraint" references public."User"("id") on delete cascade,
  "data" jsonb not null,
  "revision" integer not null default 1 constraint "appDataRevisionConstraint" check ("revision" > 0),
  "updatedAt" timestamptz not null default now(),
  constraint "appDataSizeConstraint" check (private."isBoundedAppData"("data")),
  constraint "appDataIdentityConstraint" check (("data" #>> '{user,id}') is not null and ("data" #>> '{user,id}') = "userId"::text),
  constraint "appDataVersionConstraint" check (("data" ->> 'version') is not null and ("data" ->> 'version') = '1')
);

alter table public."User" enable row level security;
alter table public."AppData" enable row level security;
revoke all on public."User", public."AppData" from anon, authenticated;
grant select on public."User" to authenticated;
grant update ("name", "language", "theme") on public."User" to authenticated;
grant select, insert, update on public."AppData" to authenticated;

create policy "userSelectPolicy" on public."User" for select to authenticated using ((select auth.uid()) = "id");
create policy "userUpdatePolicy" on public."User" for update to authenticated
  using ((select auth.uid()) = "id") with check ((select auth.uid()) = "id");
create policy "appDataSelectPolicy" on public."AppData" for select to authenticated using ((select auth.uid()) = "userId");
create policy "appDataInsertPolicy" on public."AppData" for insert to authenticated with check ((select auth.uid()) = "userId");
create policy "appDataUpdatePolicy" on public."AppData" for update to authenticated
  using ((select auth.uid()) = "userId") with check ((select auth.uid()) = "userId");

create function private."syncAuthUser"() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public."User" ("id", "email", "name")
  values (new.id, lower(new.email), left(coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 80))
  on conflict ("id") do update set "email" = excluded."email", "updatedAt" = now();
  return new;
end;
$$;
create trigger "userInsertTrigger" after insert or update of email on auth.users
  for each row execute function private."syncAuthUser"();
-- Preserve existing Supabase accounts without touching existing application tables.
insert into public."User" ("id", "email", "name")
select id, lower(email), left(coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1)), 80)
from auth.users where email is not null;

create function private."validateAppData"() returns trigger
language plpgsql security definer set search_path = '' as $$
declare "accountEmail" varchar(254);
begin
  if tg_op = 'UPDATE' and (new."userId" <> old."userId" or new."revision" <> old."revision" + 1) then
    raise exception 'Invalid revision' using errcode = '40001';
  end if;
  if tg_op = 'INSERT' and new."revision" <> 1 then
    raise exception 'Invalid initial revision' using errcode = '40001';
  end if;
  select "email" into "accountEmail" from public."User" where "id" = new."userId";
  if (new."data" #>> '{user,email}') is distinct from "accountEmail" then
    raise exception 'Account email cannot be replaced by a backup' using errcode = '23514';
  end if;
  new."updatedAt" = now();
  update public."User" set
    "name" = new."data" #>> '{user,name}',
    "language" = new."data" #>> '{user,language}',
    "theme" = new."data" #>> '{user,theme}', "updatedAt" = now()
  where "id" = new."userId";
  return new;
end;
$$;
create trigger "appDataUpdateTrigger" before insert or update on public."AppData"
  for each row execute function private."validateAppData"();

create function public."saveAppData"("state" jsonb, "expectedRevision" integer) returns integer
language plpgsql security invoker set search_path = '' as $$
declare "nextRevision" integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if "expectedRevision" = 0 then
    insert into public."AppData" ("userId", "data") values (auth.uid(), "state")
      on conflict ("userId") do nothing returning "revision" into "nextRevision";
  else
    update public."AppData" set "data" = "state", "revision" = "revision" + 1
      where "userId" = auth.uid() and "revision" = "expectedRevision"
      returning "revision" into "nextRevision";
  end if;
  if "nextRevision" is null then raise exception 'Workspace changed on another device' using errcode = '40001'; end if;
  return "nextRevision";
end;
$$;
revoke all on function public."saveAppData"(jsonb, integer) from public, anon;
grant execute on function public."saveAppData"(jsonb, integer) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
-- CHECK functions need EXECUTE permission but the private schema is not exposed
-- through PostgREST, and no table access is granted in that schema.
grant usage on schema private to authenticated;
grant execute on function private."isBoundedAppData"(jsonb) to authenticated;

-- Explicit opt-in in production; enabled by the development migration runner.
-- Never reset a password if this account already exists.
do $$
declare "testUserId" uuid;
begin
  if current_setting('app.isTestUserEnabled', true) = 'true' then
    select id into "testUserId" from auth.users where lower(email) = 'test@ptbk.io';
    if "testUserId" is null then
      "testUserId" = gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change, reauthentication_token
      ) values (
        '00000000-0000-0000-0000-000000000000', "testUserId", 'authenticated', 'authenticated',
        'test@ptbk.io', extensions.crypt('password123', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"name":"Alex Morgan"}', now(), now(),
        '', '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
      values (gen_random_uuid(), "testUserId", "testUserId"::text,
        jsonb_build_object('sub', "testUserId"::text, 'email', 'test@ptbk.io', 'email_verified', true, 'phone_verified', false),
        'email', now(), now());
    end if;
  end if;
end;
$$;
notify pgrst, 'reload schema';
