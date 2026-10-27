-- 0005: o painel mostra quando foi a última coleta e quantos leads entraram nas últimas 24h
create or replace view public.v_resumo with (security_invoker = true) as
with lim as (
  select (date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as hoje,
         now() - interval '7 days' as semana,
         (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as mes
),
abordados as (
  select distinct en.lead_id from envios en, lim where en.etapa = 'abertura' and en.enviado_em >= lim.semana
)
select
  (select count(*) from envios en, lim where en.enviado_em >= lim.hoje) as envios_hoje,
  (select count(*) from envios en, lim where en.etapa = 'abertura' and en.enviado_em >= lim.hoje) as aberturas_hoje,
  (select count(*) from abordados) as abordados_7d,
  (select count(distinct e.lead_id) from eventos e join abordados a using (lead_id) where e.tipo = 'abriu_pagina') as abriram_7d,
  (select count(distinct e.lead_id) from eventos e join abordados a using (lead_id) where e.tipo in ('respondeu','pediu_preco')) as responderam_7d,
  (select count(distinct e.lead_id) from eventos e join abordados a using (lead_id) where e.tipo = 'saiu') as sairam_7d,
  (select count(distinct l.whatsapp) from leads l
     where l.status in ('novo','na_fila') and l.tipo_site <> 'site_ok' and l.whatsapp is not null
       and not exists (select 1 from supressao s where s.whatsapp = l.whatsapp)
       and not exists (select 1 from leads o where o.whatsapp = l.whatsapp and o.id <> l.id and o.status not in ('novo','na_fila'))) as fila,
  (select count(*) from v_followups) as followups_pendentes,
  (select coalesce(sum(n.valor), 0) from negocios n, lim where n.status = 'ganho' and coalesce(n.fechado_em, n.created_at) >= lim.mes) as vendido_mes,
  (select count(*) from negocios n, lim where n.status = 'ganho' and coalesce(n.fechado_em, n.created_at) >= lim.mes) as vendas_mes,
  (select coalesce(sum(n.valor_mensal), 0) from negocios n where n.status = 'ganho' and n.recorrente and n.ativo) as mrr,
  (select max(l.created_at) from leads l where l.origem_dado = 'google_maps_apify') as ultima_coleta,
  (select count(*) from leads l where l.origem_dado = 'google_maps_apify' and l.created_at >= now() - interval '24 hours') as leads_24h;
