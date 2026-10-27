-- 0012: coleta com dois motores. Google (com chave) e Apify (reserva, pelo webhook do n8n, sem agendamento lá).
create or replace function public.salvar_config(p_key text, p_value text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'sem permissão'; end if;
  if p_key not in ('google_places_key', 'coleta_buscas_dia', 'coleta_limite_mes', 'coleta_motor', 'coleta_apify_buscas_dia') then raise exception 'chave inválida'; end if;
  if p_key = 'coleta_motor' and p_value not in ('auto', 'google', 'apify') then raise exception 'motor inválido'; end if;
  insert into app_config(key, value, updated_at) values (p_key, trim(p_value), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

drop function if exists public.coleta_status();
create function public.coleta_status()
returns table (google_conectado boolean, motor text, buscas_dia int, apify_buscas_dia int, limite_mes int, paginas_mes bigint, ultima timestamptz)
language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from app_config where key = 'google_places_key' and coalesce(value, '') <> ''),
    coalesce((select value from app_config where key = 'coleta_motor'), 'auto'),
    coalesce((select value from app_config where key = 'coleta_buscas_dia')::int, 30),
    coalesce((select value from app_config where key = 'coleta_apify_buscas_dia')::int, 6),
    coalesce((select value from app_config where key = 'coleta_limite_mes')::int, 950),
    (select coalesce(sum(paginas), 0) from coleta_buscas where feita_em >= date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'),
    (select max(feita_em) from coleta_buscas)
  where public.is_admin();
$$;
revoke all on function public.coleta_status() from public, anon;
grant execute on function public.coleta_status() to authenticated;

-- 7h todo dia, com ou sem chave do Google (sem chave, vai pelo Apify)
select cron.unschedule('coletar-leads') where exists (select 1 from cron.job where jobname = 'coletar-leads');
select cron.schedule('coletar-leads', '0 10 * * *', $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/coletar-leads',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{"auto": true}'::jsonb, timeout_milliseconds := 300000);
$$);
