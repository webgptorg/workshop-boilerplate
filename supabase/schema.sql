-- Run once in the Supabase SQL editor. The server keeps the service-role key private.
create table if not exists public.notes_rooms (
  id text primary key,
  state text not null,
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes_rooms enable row level security;
-- No public table policies: all persistence goes through the Next.js API.
revoke all on public.notes_rooms from anon, authenticated;
grant all on public.notes_rooms to service_role;

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notes_rooms' and schemaname = 'public'
  ) then
    alter publication supabase_realtime add table public.notes_rooms;
  end if;
end $$;
