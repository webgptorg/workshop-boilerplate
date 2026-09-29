-- Auth owns identities and password hashes. Application data belongs to immutable Auth IDs.
create table public.account_data (
    user_id uuid primary key references auth.users(id) on delete cascade,
    payload jsonb not null,
    revision integer not null default 1 check (revision > 0),
    updated_at timestamptz not null default now(),
    constraint account_payload_object check (jsonb_typeof(payload) = 'object'),
    constraint account_payload_owner check (
        payload #>> '{user,id}' is not null and payload #>> '{user,id}' = user_id::text
    ),
    constraint account_payload_size check (octet_length(payload::text) <= 20971520)
);
alter table public.account_data enable row level security;
alter table public.account_data force row level security;
revoke all on public.account_data from public, anon, authenticated;
grant select, insert, update on public.account_data to authenticated;
create policy account_read on public.account_data for select to authenticated
    using ((select auth.uid()) = user_id);
create policy account_insert on public.account_data for insert to authenticated
    with check ((select auth.uid()) = user_id);
create policy account_update on public.account_data for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function minute_private.check_account_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
    if TG_OP = 'INSERT' then
        if NEW.revision <> 1 then raise exception 'Initial revision must be 1'; end if;
    elsif NEW.user_id <> OLD.user_id or NEW.revision <> OLD.revision + 1 then
        raise exception 'Invalid account revision';
    end if;
    NEW.updated_at := now();
    return NEW;
end;
$$;
revoke all on function minute_private.check_account_revision() from public, anon, authenticated;
create trigger account_revision before insert or update on public.account_data
    for each row execute function minute_private.check_account_revision();

-- A shared, database-backed limit for the paid AI endpoints across server instances.
create table minute_private.ai_usage (
    user_id uuid primary key references auth.users(id) on delete cascade,
    window_start timestamptz not null,
    request_count integer not null
);
alter table minute_private.ai_usage enable row level security;
revoke all on minute_private.ai_usage from public, anon, authenticated;
create function public.consume_ai_request() returns boolean
language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
    if auth.uid() is null then return false; end if;
    insert into minute_private.ai_usage as usage (user_id, window_start, request_count)
    values (auth.uid(), date_trunc('minute', now()), 1)
    on conflict (user_id) do update set
        window_start = excluded.window_start,
        request_count = case when usage.window_start = excluded.window_start
            then usage.request_count + 1 else 1 end
    returning request_count into current_count;
    return current_count <= 30;
end;
$$;
revoke all on function public.consume_ai_request() from public, anon;
grant execute on function public.consume_ai_request() to authenticated;
