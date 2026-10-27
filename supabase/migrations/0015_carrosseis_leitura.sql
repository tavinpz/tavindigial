-- 0015: o upload das imagens do carrossel precisa também de leitura (sem ela o Storage devolve 400)
drop policy if exists carrosseis_admin_select on storage.objects;
create policy carrosseis_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'carrosseis' and public.is_admin());
