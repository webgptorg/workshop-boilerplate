insert into storage.buckets (id, name, public, file_size_limit)
values ('recordings', 'recordings', false, 26214400);

-- Never use a public bucket or share signed recording URLs. Each account owns its prefix.
create policy recording_read on storage.objects for select to authenticated
    using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy recording_insert on storage.objects for insert to authenticated
    with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy recording_delete on storage.objects for delete to authenticated
    using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
