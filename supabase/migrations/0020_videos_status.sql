-- 0020: vídeos organizados por situação (para programar → programado → postado) nas 3 redes,
-- com virada automática para "postado" no horário programado e conferência no YouTube/Instagram.

alter table public.videos
  add column if not exists yt_status text not null default 'pendente' check (yt_status in ('pendente','programado','postado')),
  add column if not exists yt_programado_para timestamptz,
  add column if not exists yt_views int,
  add column if not exists yt_confirmado boolean not null default false,
  add column if not exists tt_status text not null default 'pendente' check (tt_status in ('pendente','programado','postado')),
  add column if not exists tt_programado_para timestamptz,
  add column if not exists tt_link text,
  add column if not exists ig_link text,
  add column if not exists ig_views int,
  add column if not exists ig_confirmado boolean not null default false,
  add column if not exists conferido_em timestamptz;

update public.videos set yt_status = 'postado' where yt_postado_em is not null and yt_status = 'pendente';
update public.videos set tt_status = 'postado' where tt_postado_em is not null and tt_status = 'pendente';

-- Instagram: 'agendado' = o painel publica sozinho pela API; 'programado' = você programou no próprio app
alter table public.videos drop constraint if exists videos_ig_status_check;
alter table public.videos add constraint videos_ig_status_check
  check (ig_status in ('pendente','programado','agendado','processando','publicado','erro'));

-- Passou o horário programado: conta como postado (YouTube e TikTok publicam sozinhos no horário).
-- A conferência no YouTube/Instagram depois confirma, traz o link e as views.
create or replace function public.videos_virar_postados() returns void
language sql security definer set search_path = public as $$
  update videos set yt_status = 'postado', yt_postado_em = coalesce(yt_postado_em, yt_programado_para)
   where yt_status = 'programado' and yt_programado_para <= now();
  update videos set tt_status = 'postado', tt_postado_em = coalesce(tt_postado_em, tt_programado_para)
   where tt_status = 'programado' and tt_programado_para <= now();
  update videos set ig_status = 'publicado', ig_postado_em = coalesce(ig_postado_em, ig_agendado_para)
   where ig_status = 'programado' and ig_agendado_para <= now();
$$;
revoke all on function public.videos_virar_postados() from public, anon, authenticated;
grant execute on function public.videos_virar_postados() to service_role;

-- YouTube do canal: link ou @ do canal; a função conferir-postagens descobre o ID sozinha
create or replace function public.salvar_youtube_canal(p_canal text, p_ref text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'sem permissão'; end if;
  if p_canal !~ '^[a-z0-9-]+$' then raise exception 'canal inválido'; end if;
  insert into app_config(key, value, updated_at) values ('yt_' || p_canal || '_ref', trim(p_ref), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  delete from app_config where key = 'yt_' || p_canal || '_channel_id';
end $$;

create or replace function public.youtube_status_canal(p_canal text)
returns table (ref text, channel_id text, conferido_em timestamptz)
language sql stable security definer set search_path = public as $$
  select (select value from app_config where key = 'yt_' || p_canal || '_ref'),
         (select value from app_config where key = 'yt_' || p_canal || '_channel_id'),
         (select max(conferido_em) from videos where canal = p_canal)
  where public.is_admin();
$$;
revoke all on function public.salvar_youtube_canal(text, text) from public, anon;
revoke all on function public.youtube_status_canal(text) from public, anon;
grant execute on function public.salvar_youtube_canal(text, text) to authenticated;
grant execute on function public.youtube_status_canal(text) to authenticated;

-- a cada 5 min: vira os programados que já passaram do horário
select cron.schedule('videos-virar-postados', '*/5 * * * *', $$ select public.videos_virar_postados(); $$);

-- a cada 30 min: confere no YouTube (feed público do canal) e no Instagram o que já saiu, com link e views
select cron.schedule(
  'conferir-postagens',
  '7,37 * * * *',
  $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/conferir-postagens',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  )
  where exists (select 1 from public.app_config where key like 'yt\_%\_ref' or key like 'ig\_%\_token');
  $$
);
