-- 0006: carrosséis do @tavindigital (texto dos slides, imagens geradas e publicação automática)
alter table public.conteudo
  add column if not exists slides jsonb not null default '[]'::jsonb,   -- [{tipo:'capa'|'texto'|'cta', titulo, texto}]
  add column if not exists imagens text[] not null default '{}',         -- URLs públicas dos JPEGs (Storage)
  add column if not exists publicado_em timestamptz,
  add column if not exists ig_media_id text,
  add column if not exists erro text;

-- Bucket público: o Instagram precisa baixar as imagens por URL na hora de publicar
insert into storage.buckets (id, name, public)
values ('carrosseis', 'carrosseis', true)
on conflict (id) do update set public = true;

drop policy if exists "carrosseis_admin_insert" on storage.objects;
drop policy if exists "carrosseis_admin_update" on storage.objects;
drop policy if exists "carrosseis_admin_delete" on storage.objects;
create policy "carrosseis_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'carrosseis' and public.is_admin());
create policy "carrosseis_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'carrosseis' and public.is_admin());
create policy "carrosseis_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'carrosseis' and public.is_admin());
