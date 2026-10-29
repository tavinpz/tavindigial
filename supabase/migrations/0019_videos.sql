-- 0019: vídeos curtos (Concrete Atlas) — ver no painel, copiar legendas, marcar onde já foi postado
-- e publicar Reels no Instagram da conta do canal (separada do @tavindigital)

create table if not exists public.videos (
  id text primary key,                         -- ex.: 'ca-001'
  canal text not null default 'concrete-atlas',
  numero int,
  titulo text not null,
  arquivo text,
  video_url text,
  capa_url text,
  duracao numeric,
  publicar_em timestamptz,                     -- dia/hora planejados
  yt_titulo text, yt_descricao text, yt_postado_em timestamptz, yt_link text,
  tt_legenda text, tt_postado_em timestamptz,
  ig_legenda text,
  ig_status text not null default 'pendente' check (ig_status in ('pendente','agendado','processando','publicado','erro')),
  ig_agendado_para timestamptz, ig_container_id text, ig_postado_em timestamptz, ig_media_id text, ig_erro text,
  comentario_fixado text,
  fontes text[],
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;
create policy videos_admin on public.videos for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.videos_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger videos_touch before update on public.videos for each row execute function public.videos_touch();

alter publication supabase_realtime add table public.videos;

-- Envio dos arquivos: o Claude registra caminho + sha256 de cada arquivo; a função receber-video só
-- entrega um link de upload para quem mandar exatamente esse par (nenhuma senha fica no repositório)
create table if not exists public.videos_envio (
  caminho text primary key,
  sha256 text not null,
  usado_em timestamptz,
  created_at timestamptz not null default now()
);
alter table public.videos_envio enable row level security;   -- sem policy: só o service role lê

-- Arquivos dos vídeos e capas (o Instagram precisa de URL pública para baixar o vídeo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4','image/jpeg'])
on conflict (id) do nothing;

-- Instagram de cada canal: o token só entra pelo painel, nunca sai
create or replace function public.salvar_instagram_canal(p_canal text, p_user_id text, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'sem permissão'; end if;
  if p_canal !~ '^[a-z0-9-]+$' then raise exception 'canal inválido'; end if;
  insert into app_config(key, value, updated_at) values
    ('ig_' || p_canal || '_user_id', trim(coalesce(p_user_id, '')), now()),
    ('ig_' || p_canal || '_token', trim(p_token), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

create or replace function public.instagram_status_canal(p_canal text)
returns table (conectado boolean, user_id text, salvo_em timestamptz)
language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from app_config where key = 'ig_' || p_canal || '_token' and coalesce(value, '') <> ''),
    (select value from app_config where key = 'ig_' || p_canal || '_user_id'),
    (select updated_at from app_config where key = 'ig_' || p_canal || '_token')
  where public.is_admin();
$$;

revoke all on function public.salvar_instagram_canal(text, text, text) from public, anon;
revoke all on function public.instagram_status_canal(text) from public, anon;
grant execute on function public.salvar_instagram_canal(text, text, text) to authenticated;
grant execute on function public.instagram_status_canal(text) to authenticated;

-- Agendador dos Reels: a cada 5 min, só quando há algo vencido ou processando
select cron.schedule(
  'publicar-reels',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/publicar-reels',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 140000
  )
  where exists (select 1 from public.videos where (ig_status = 'agendado' and ig_agendado_para <= now()) or ig_status = 'processando');
  $$
);
