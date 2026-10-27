-- 0007: conectar o Instagram pelo painel e publicar os carrosséis agendados a cada 15 minutos

-- O dono cola o token no painel; ele vai direto para app_config (sem RLS de leitura para ninguém)
create or replace function public.salvar_instagram(p_user_id text, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'sem permissão'; end if;
  insert into app_config(key, value, updated_at) values
    ('instagram_user_id', trim(p_user_id), now()),
    ('instagram_token', trim(p_token), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

-- O painel só sabe se está conectado e quando o token foi salvo, nunca o token em si
create or replace function public.instagram_status()
returns table (conectado boolean, user_id text, salvo_em timestamptz)
language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from app_config where key = 'instagram_token' and coalesce(value, '') <> ''),
    (select value from app_config where key = 'instagram_user_id'),
    (select updated_at from app_config where key = 'instagram_token')
  where public.is_admin();
$$;

revoke all on function public.salvar_instagram(text, text) from public, anon;
revoke all on function public.instagram_status() from public, anon;
grant execute on function public.salvar_instagram(text, text) to authenticated;
grant execute on function public.instagram_status() to authenticated;

-- Agendador: chama a função de publicação a cada 15 minutos
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule('publicar-carrosseis') where exists (select 1 from cron.job where jobname = 'publicar-carrosseis');
select cron.schedule(
  'publicar-carrosseis',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/publicar-instagram',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  )
  where exists (select 1 from public.conteudo where status = 'agendado' and agendado_para <= now())
    and exists (select 1 from public.app_config where key = 'instagram_token');
  $$
);
