-- Painel de programação da Tavin Digital: o dono sobe vídeos pelo painel (bucket público "videos", pasta do canal)
create policy videos_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'videos' and public.is_admin());
create policy videos_admin_update on storage.objects for update to authenticated using (bucket_id = 'videos' and public.is_admin());
create policy videos_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'videos' and public.is_admin());
create policy videos_admin_select on storage.objects for select to authenticated using (bucket_id = 'videos' and public.is_admin());
