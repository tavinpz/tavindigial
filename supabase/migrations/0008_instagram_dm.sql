-- 0008: prospecção também por DM do Instagram (fila própria, mensagens próprias, contagem por canal)

alter table public.leads add column if not exists ig_checado_em timestamptz;

-- Abertura por DM também conta como primeiro contato e agenda o follow-up
create or replace function public.on_envio()
returns trigger language plpgsql set search_path = public as $$
begin
  update leads set
    status = case when new.etapa in ('abertura','abertura_dm') and status in ('novo','na_fila')
                  then 'enviado'::status_lead else status end,
    proximo_contato = case new.etapa
                        when 'abertura'    then now() + interval '2 days'
                        when 'abertura_dm' then now() + interval '2 days'
                        when 'followup_1'  then now() + interval '3 days'
                        when 'resp_preco'  then now() + interval '2 days'
                        when 'resp_pensar' then now() + interval '3 days'
                        when 'pos_venda'   then proximo_contato
                        else null end
  where id = new.lead_id;
  return new;
end $$;

-- Fila de DM: quem tem Instagram, ainda não foi chamado e não pediu para sair
create or replace view public.v_fila_dm with (security_invoker = true) as
select l.*,
  ((case l.tipo_site when 'site_falso' then 3 when 'sem_site' then 2 else 0 end)::numeric
    + least(coalesce(l.avaliacoes, 0)::numeric / 50, 3)
    + (case when coalesce(l.nota, 0) >= 4.5 then 1 else 0 end)) as prioridade
from leads l
where l.status in ('novo','na_fila')
  and l.tipo_site <> 'site_ok'
  and l.instagram is not null
  and (l.whatsapp is null or not exists (select 1 from supressao s where s.whatsapp = l.whatsapp))
  and (l.whatsapp is null or not exists (select 1 from leads o where o.whatsapp = l.whatsapp and o.id <> l.id and o.status not in ('novo','na_fila')))
order by prioridade desc, l.created_at
limit 60;

-- Follow-ups sabem por qual canal foi o último contato
-- (l.* mudou com a coluna nova: recria a view e o resumo que depende dela)
drop view if exists public.v_followups cascade;
create view public.v_followups with (security_invoker = true) as
select l.*,
  (select max(e.enviado_em) from envios e where e.lead_id = l.id) as ultimo_envio,
  (select count(*) from envios e where e.lead_id = l.id) as total_envios,
  (select e.canal from envios e where e.lead_id = l.id order by e.enviado_em desc limit 1) as ultimo_canal
from leads l
where l.proximo_contato <= now()
  and l.status in ('enviado','abriu','respondeu','proposta','ganho')
  and (l.whatsapp is null or not exists (select 1 from supressao s where s.whatsapp = l.whatsapp))
order by l.proximo_contato;

-- Mensagens de abertura por DM (A/B)
insert into public.mensagens (etapa, publico, variante, texto, ativo)
select * from (values
  ('abertura_dm', 'todos', 'A', 'Oi, tudo bem? Achei vocês no Google ({negocio}): {avaliacoes} avaliações, nota {nota}. Só que o link de vocês lá abre {destino}, e quem procura não vê serviços, preços nem um jeito rápido de marcar. Fiz alguns modelos de página animada pra negócios como o seu: {link}. Se curtir um, deixo o de vocês no ar em 24h por R$ 147.', true),
  ('abertura_dm', 'todos', 'B', 'Oi! Curti o trabalho de vocês aqui no Insta. Fiz alguns modelos de página animada pra usar no link da bio, com serviços, preços e agendamento no WhatsApp: {link}. Quer que eu monte uma prévia com a cara de vocês? Sem compromisso.', true)
) v(etapa, publico, variante, texto, ativo)
where not exists (select 1 from public.mensagens m where m.etapa = 'abertura_dm');

-- Abrir o Instagram a cada 10 min para quem ainda não foi verificado
select cron.unschedule('enriquecer-instagram') where exists (select 1 from cron.job where jobname = 'enriquecer-instagram');
select cron.schedule('enriquecer-instagram', '*/10 * * * *', $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/enriquecer-instagram',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{}'::jsonb, timeout_milliseconds := 60000)
  where exists (select 1 from public.leads where instagram is null and ig_checado_em is null and site_raw is not null
                and tipo_site <> 'site_ok' and status in ('novo','na_fila'));
$$);

-- Resumo com contagem por canal
create view public.v_resumo with (security_invoker = true) as
with lim as (
  select (date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as hoje,
         now() - interval '7 days' as semana,
         (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as mes
),
abordados as (
  select distinct en.lead_id from envios en, lim where en.etapa in ('abertura','abertura_dm') and en.enviado_em >= lim.semana
)
select
  (select count(*) from envios en, lim where en.enviado_em >= lim.hoje) as envios_hoje,
  (select count(*) from envios en, lim where en.etapa in ('abertura','abertura_dm') and en.enviado_em >= lim.hoje) as aberturas_hoje,
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
  (select count(*) from leads l where l.origem_dado = 'google_maps_apify' and l.created_at >= now() - interval '24 hours') as leads_24h,
  (select count(*) from envios en, lim where en.canal = 'whatsapp' and en.enviado_em >= lim.hoje) as envios_hoje_wa,
  (select count(*) from envios en, lim where en.canal = 'instagram' and en.enviado_em >= lim.hoje) as envios_hoje_dm,
  (select count(*) from v_fila_dm) as fila_dm;

grant select on public.v_resumo, public.v_followups, public.v_fila_dm to authenticated;
revoke all on public.v_resumo, public.v_followups, public.v_fila_dm from anon;
