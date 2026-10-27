-- 0003: follow-ups depois das respostas, métricas no horário de Brasília e resumo único para o painel

-- Agenda do próximo contato conforme a mensagem enviada
create or replace function public.on_envio()
returns trigger language plpgsql set search_path = public as $$
begin
  update leads set
    status = case when new.etapa = 'abertura' and status in ('novo','na_fila')
                  then 'enviado'::status_lead else status end,
    proximo_contato = case new.etapa
                        when 'abertura'    then now() + interval '2 days'
                        when 'followup_1'  then now() + interval '3 days'
                        when 'resp_preco'  then now() + interval '2 days'  -- pediu preço e sumiu: cutucar
                        when 'resp_pensar' then now() + interval '3 days'  -- "vou pensar": cutucar
                        when 'pos_venda'   then proximo_contato            -- mantém o upsell de 30 dias
                        else null end
  where id = new.lead_id;
  return new;
end $$;

-- Follow-ups também para quem respondeu e parou de falar
create or replace view public.v_followups with (security_invoker = true) as
select l.*,
  (select max(e.enviado_em) from envios e where e.lead_id = l.id) as ultimo_envio,
  (select count(*) from envios e where e.lead_id = l.id) as total_envios
from leads l
where l.proximo_contato <= now()
  and l.status in ('enviado','abriu','respondeu','proposta','ganho')
  and not exists (select 1 from supressao s where s.whatsapp = l.whatsapp)
order by l.proximo_contato;

-- Funil só com quem já recebeu mensagem
create or replace view public.v_funil with (security_invoker = true) as
select l.nicho, l.cidade,
  count(distinct en.lead_id) as enviados,
  count(distinct ev.lead_id) filter (where ev.tipo = 'abriu_pagina') as abriram,
  count(distinct ev.lead_id) filter (where ev.tipo in ('respondeu','pediu_preco')) as responderam,
  count(distinct ev.lead_id) filter (where ev.tipo = 'pediu_preco') as pediram_preco,
  count(distinct ev.lead_id) filter (where ev.tipo = 'pagou') as pagaram,
  count(distinct ev.lead_id) filter (where ev.tipo = 'saiu') as sairam
from leads l
join envios en on en.lead_id = l.id
left join eventos ev on ev.lead_id = l.id
group by l.nicho, l.cidade;

-- A/B: "respondeu" conta também quem já chegou pedindo preço
create or replace view public.v_ab with (security_invoker = true) as
select m.etapa, m.variante, m.publico,
  count(distinct en.lead_id) as enviados,
  count(distinct ev.lead_id) filter (where ev.tipo = 'abriu_pagina') as abriram,
  count(distinct ev.lead_id) filter (where ev.tipo in ('respondeu','pediu_preco')) as responderam,
  count(distinct ev.lead_id) filter (where ev.tipo = 'pagou') as pagaram
from envios en
join mensagens m on m.id = en.mensagem_id
left join eventos ev on ev.lead_id = en.lead_id
group by m.etapa, m.variante, m.publico;

-- Receita por mês de Brasília
drop view if exists public.v_receita;
create view public.v_receita with (security_invoker = true) as
select (date_trunc('month', coalesce(fechado_em, created_at) at time zone 'America/Sao_Paulo'))::date as mes,
  coalesce(sum(valor) filter (where status = 'ganho'), 0) as receita_avulsa,
  coalesce(sum(valor_mensal) filter (where status = 'ganho' and recorrente and ativo), 0) as mrr_ativo
from negocios
group by 1
order by 1 desc;

-- Números do topo do painel, todos calculados aqui (dia e mês de Brasília)
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
  (select count(*) from leads l
     where l.status in ('novo','na_fila') and l.tipo_site <> 'site_ok' and l.whatsapp is not null
       and not exists (select 1 from supressao s where s.whatsapp = l.whatsapp)) as fila,
  (select count(*) from v_followups) as followups_pendentes,
  (select coalesce(sum(n.valor), 0) from negocios n, lim where n.status = 'ganho' and coalesce(n.fechado_em, n.created_at) >= lim.mes) as vendido_mes,
  (select count(*) from negocios n, lim where n.status = 'ganho' and coalesce(n.fechado_em, n.created_at) >= lim.mes) as vendas_mes,
  (select coalesce(sum(n.valor_mensal), 0) from negocios n where n.status = 'ganho' and n.recorrente and n.ativo) as mrr;

grant select on public.v_resumo, public.v_receita to authenticated;
revoke all on public.v_resumo, public.v_receita from anon;
