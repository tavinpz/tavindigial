-- 0010: renova o token do Instagram todo dia de manhã (a função só renova de fato a cada 15 dias)
select cron.unschedule('renovar-token-instagram') where exists (select 1 from cron.job where jobname = 'renovar-token-instagram');
select cron.schedule('renovar-token-instagram', '17 7 * * *', $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/publicar-instagram',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{"verificar": true}'::jsonb, timeout_milliseconds := 30000)
  where exists (select 1 from public.app_config where key = 'instagram_token' and coalesce(value, '') <> '');
$$);
