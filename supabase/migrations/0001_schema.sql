-- =============================================================
-- Máquina de Prospecção — schema v1 (Supabase / Postgres 15+)
-- Rodar inteiro no SQL Editor de um projeto NOVO (não é a Thata).
-- =============================================================

create extension if not exists pgcrypto;

-- ---------- Tipos ----------
create type tipo_site   as enum ('sem_site', 'site_falso', 'site_ok');
create type status_lead as enum ('novo', 'na_fila', 'enviado', 'abriu', 'respondeu',
                                 'proposta', 'ganho', 'perdido', 'recorrente', 'nao_contatar');
create type canal       as enum ('whatsapp', 'instagram', 'email');
create type tipo_evento as enum ('abriu_pagina', 'respondeu', 'pediu_preco',
                                 'proposta_enviada', 'pagou', 'perdeu', 'saiu');

-- ---------- Leads ----------
create table leads (
  id              uuid primary key default gen_random_uuid(),
  place_id        text unique,                 -- id do Google Places (evita duplicado)
  nome            text not null,
  categoria       text,
  nicho           text not null,               -- ex.: 'odontologia'
  cidade          text not null,
  bairro          text,
  endereco        text,
  telefone        text,
  whatsapp        text,                        -- só dígitos, com 55
  site_raw        text,                        -- o que estava no campo de site do Google
  tipo_site       tipo_site not null,
  instagram       text,
  avaliacoes      int default 0,
  nota            numeric(2,1),
  origem_dado     text not null default 'google_places',  -- LGPD: de onde veio o dado
  status          status_lead not null default 'novo',
  proximo_contato timestamptz,
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on leads (status);
create index on leads (proximo_contato);
create index on leads (nicho, cidade);
create index on leads (whatsapp);

-- ---------- Biblioteca de mensagens (1 clique) ----------
create table mensagens (
  id        uuid primary key default gen_random_uuid(),
  etapa     text not null,       -- abertura | followup_1 | followup_2 | resp_preco | resp_pensar | resp_ja_tenho | pos_venda | upsell_30d
  variante  text not null default 'A',
  publico   text not null default 'todos',  -- sem_site | site_falso | todos
  texto     text not null,       -- variáveis: {negocio} {avaliacoes} {nota} {link} {link_avaliacao}
  ativo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Envios (cada clique em "enviar" grava aqui) ----------
create table envios (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  mensagem_id   uuid references mensagens(id),
  etapa         text not null,
  canal         canal not null default 'whatsapp',
  texto_enviado text not null,
  enviado_em    timestamptz not null default now()
);
create index on envios (lead_id);

-- ---------- Eventos (abriu a página, respondeu, pagou...) ----------
create table eventos (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  tipo       tipo_evento not null,
  meta       jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on eventos (lead_id, tipo);

-- ---------- Negócios (o dinheiro) ----------
create table negocios (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references leads(id) on delete set null,
  produto      text not null,          -- site_297 | bio_197 | hospedagem | google | conteudo | ia_whatsapp
  valor        numeric(10,2) default 0,
  valor_mensal numeric(10,2) default 0,
  recorrente   boolean not null default false,
  ativo        boolean not null default true,
  status       text not null default 'proposta',  -- proposta | ganho | perdido
  fechado_em   timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------- Lista de supressão (pediu SAIR = nunca mais) ----------
create table supressao (
  whatsapp   text primary key,
  motivo     text,
  created_at timestamptz not null default now()
);

-- ---------- Calendário de conteúdo do Instagram da marca ----------
create table conteudo (
  id            uuid primary key default gen_random_uuid(),
  formato       text not null,         -- post | reel | story | carrossel
  titulo        text not null,
  legenda       text,
  midia_url     text,
  lead_id       uuid references leads(id) on delete set null,  -- case de cliente (com permissão)
  agendado_para timestamptz,
  status        text not null default 'ideia',  -- ideia | pronto | agendado | publicado
  created_at    timestamptz not null default now()
);

-- =============================================================
-- Automação: o status e o próximo contato se atualizam sozinhos
-- =============================================================

create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger trg_leads_updated before update on leads
  for each row execute function touch_updated_at();

-- Cada envio agenda o próximo follow-up
create function on_envio() returns trigger language plpgsql as $$
begin
  update leads set
    status = case when new.etapa = 'abertura' and status in ('novo','na_fila')
                  then 'enviado'::status_lead else status end,
    proximo_contato = case new.etapa
                        when 'abertura'   then now() + interval '2 days'
                        when 'followup_1' then now() + interval '3 days'
                        else null end
  where id = new.lead_id;
  return new;
end $$;
create trigger trg_envio after insert on envios
  for each row execute function on_envio();

-- Cada evento move o lead no funil
create function on_evento() returns trigger language plpgsql as $$
begin
  if new.tipo = 'saiu' then
    insert into supressao (whatsapp, motivo)
      select whatsapp, 'pediu para sair' from leads
      where id = new.lead_id and whatsapp is not null
    on conflict do nothing;
    update leads set status = 'nao_contatar', proximo_contato = null where id = new.lead_id;
  elsif new.tipo = 'abriu_pagina' then
    update leads set status = 'abriu' where id = new.lead_id and status in ('na_fila','enviado');
  elsif new.tipo in ('respondeu','pediu_preco') then
    update leads set status = 'respondeu', proximo_contato = null
    where id = new.lead_id and status not in ('proposta','ganho','recorrente');
  elsif new.tipo = 'proposta_enviada' then
    update leads set status = 'proposta', proximo_contato = now() + interval '1 day' where id = new.lead_id;
  elsif new.tipo = 'pagou' then
    update leads set status = 'ganho', proximo_contato = now() + interval '30 days' where id = new.lead_id;  -- upsell D+30
  elsif new.tipo = 'perdeu' then
    update leads set status = 'perdido', proximo_contato = null where id = new.lead_id;
  end if;
  return new;
end $$;
create trigger trg_evento after insert on eventos
  for each row execute function on_evento();

-- =============================================================
-- Views que o painel lê
-- =============================================================

-- Quem chamar hoje: maior prioridade primeiro, sem quem pediu SAIR
create view v_fila_hoje with (security_invoker = true) as
select l.*,
  (case l.tipo_site when 'site_falso' then 3 when 'sem_site' then 2 else 0 end)
  + least(coalesce(l.avaliacoes, 0)::numeric / 50, 3)
  + (case when coalesce(l.nota, 0) >= 4.5 then 1 else 0 end) as prioridade
from leads l
where l.status in ('novo','na_fila')
  and l.tipo_site <> 'site_ok'
  and l.whatsapp is not null
  and not exists (select 1 from supressao s where s.whatsapp = l.whatsapp)
order by prioridade desc, l.created_at
limit 60;

-- Follow-ups vencidos
create view v_followups with (security_invoker = true) as
select l.*,
  (select max(e.enviado_em) from envios e where e.lead_id = l.id) as ultimo_envio,
  (select count(*)          from envios e where e.lead_id = l.id) as total_envios
from leads l
where l.proximo_contato <= now()
  and l.status in ('enviado','abriu','proposta','ganho')
  and not exists (select 1 from supressao s where s.whatsapp = l.whatsapp)
order by l.proximo_contato;

-- Funil por nicho e cidade
create view v_funil with (security_invoker = true) as
select l.nicho, l.cidade,
  count(distinct en.lead_id)                                          as enviados,
  count(distinct ev.lead_id) filter (where ev.tipo = 'abriu_pagina')  as abriram,
  count(distinct ev.lead_id) filter (where ev.tipo = 'respondeu')     as responderam,
  count(distinct ev.lead_id) filter (where ev.tipo = 'pediu_preco')   as pediram_preco,
  count(distinct ev.lead_id) filter (where ev.tipo = 'pagou')         as pagaram,
  count(distinct ev.lead_id) filter (where ev.tipo = 'saiu')          as sairam
from leads l
left join envios  en on en.lead_id = l.id
left join eventos ev on ev.lead_id = l.id
group by l.nicho, l.cidade;

-- Teste A/B das mensagens
create view v_ab with (security_invoker = true) as
select m.etapa, m.variante, m.publico,
  count(distinct en.lead_id)                                          as enviados,
  count(distinct ev.lead_id) filter (where ev.tipo = 'abriu_pagina')  as abriram,
  count(distinct ev.lead_id) filter (where ev.tipo = 'respondeu')     as responderam,
  count(distinct ev.lead_id) filter (where ev.tipo = 'pagou')         as pagaram
from envios en
join mensagens m on m.id = en.mensagem_id
left join eventos ev on ev.lead_id = en.lead_id
group by m.etapa, m.variante, m.publico;

-- Receita: avulsa no mês + MRR ativo
create view v_receita with (security_invoker = true) as
select
  date_trunc('month', coalesce(fechado_em, created_at)) as mes,
  sum(valor)        filter (where status = 'ganho')                           as receita_avulsa,
  sum(valor_mensal) filter (where status = 'ganho' and recorrente and ativo)  as mrr_ativo
from negocios
group by 1
order by 1 desc;

-- =============================================================
-- Segurança: só você (usuário autenticado) lê e escreve.
-- O rastreio do link usa a service role numa edge function.
-- =============================================================
alter table leads     enable row level security;
alter table mensagens enable row level security;
alter table envios    enable row level security;
alter table eventos   enable row level security;
alter table negocios  enable row level security;
alter table supressao enable row level security;
alter table conteudo  enable row level security;

create policy dono on leads     for all to authenticated using (true) with check (true);
create policy dono on mensagens for all to authenticated using (true) with check (true);
create policy dono on envios    for all to authenticated using (true) with check (true);
create policy dono on eventos   for all to authenticated using (true) with check (true);
create policy dono on negocios  for all to authenticated using (true) with check (true);
create policy dono on supressao for all to authenticated using (true) with check (true);
create policy dono on conteudo  for all to authenticated using (true) with check (true);

-- =============================================================
-- Mensagens prontas (edite à vontade no painel)
-- {link} = sua página de modelos com ?n={negocio}&r={lead_id}
-- =============================================================
insert into mensagens (etapa, variante, publico, texto) values
('abertura','A','sem_site',
 'Oi! Vi a {negocio} no Google: {avaliacoes} avaliações, nota {nota}. Só que quem procura vocês lá não encontra site. Separei alguns modelos que fiz pra negócios como o seu: {link}. Se algum te agradar, deixo o da {negocio} no ar em 48h por R$ 297. Se não fizer sentido, responde SAIR que não te chamo mais.'),
('abertura','B','sem_site',
 'Oi! Vi a {negocio} no Google: {avaliacoes} avaliações, nota {nota}. Muito bem avaliada, mas sem site pra quem procura vocês lá. Fiz alguns modelos pra negócios como o seu: {link}. Posso montar uma prévia com o nome e as cores da {negocio}? Se não fizer sentido, responde SAIR.'),
('abertura','A','site_falso',
 'Oi! Vi que o link da {negocio} no Google leva pra um Linktree. Funciona, mas perde cliente no caminho. Fiz alguns modelos de página de verdade, com WhatsApp e agendamento direto: {link}. Se curtir um, deixo o de vocês no ar em 48h por R$ 297. Se não fizer sentido, responde SAIR.'),
('abertura','B','site_falso',
 'Oi! Vi que o link da {negocio} leva pra um Linktree. Fiz alguns modelos de página com agendamento direto no WhatsApp: {link}. Quer que eu monte uma prévia com a cara da {negocio}? Se não fizer sentido, responde SAIR.'),
('followup_1','A','todos',
 'Oi! Conseguiu ver os modelos? Se quiser, monto uma prévia com o nome e as cores da {negocio}, sem compromisso.'),
('followup_2','A','todos',
 'Última mensagem por aqui, prometo. Se um dia quiser o site da {negocio}, é só me chamar. Abraço!'),
('resp_preco','A','todos',
 'Fica R$ 297, no ar em até 48h: página completa com WhatsApp, mapa, horários e seus serviços. Domínio e hospedagem ficam R$ 59/mês, sem fidelidade. 50% pra começar e 50% quando você aprovar. Te mando o formulário rápido pra começar?'),
('resp_pensar','A','todos',
 'Tranquilo! Pra facilitar: faço a prévia da {negocio} sem custo, e você só paga se aprovar. Quer que eu faça?'),
('resp_ja_tenho','A','todos',
 'Faz sentido! Se mudar de ideia, os modelos ficam aqui: {link}. Sucesso pra {negocio}!'),
('pos_venda','A','todos',
 'Site no ar! Duas coisas rápidas: 1) se puder deixar uma avaliação da Tavin Digital no Google, ajuda demais: {link_avaliacao}. 2) Conhece mais alguém que precisa? Indicou e fechou, você ganha 1 mês de hospedagem grátis.'),
('upsell_30d','A','todos',
 'Oi! O site da {negocio} completou 1 mês. Vi que vocês têm {avaliacoes} avaliações no Google. Dá pra aumentar isso com um pedido automático de avaliação depois de cada atendimento. Quer que eu te mostre como funciona?');
