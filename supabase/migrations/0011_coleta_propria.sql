-- 0011: coleta própria pela API oficial do Google Places (sem Apify e sem n8n)
-- Plano: termos x bairros. Todo dia às 7h a função escolhe as combinações ainda não buscadas,
-- começando pelos termos que mais trazem negócio sem site ou com link fraco, dentro de um teto de buscas.

create table if not exists public.coleta_termos (
  id bigint generated always as identity primary key,
  nicho text not null,
  termo text not null unique,
  min_avaliacoes int not null default 5,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.coleta_bairros (
  id bigint generated always as identity primary key,
  cidade text not null default 'São Paulo, SP',
  bairro text not null,
  ativo boolean not null default true,
  unique (cidade, bairro)
);
create table if not exists public.coleta_buscas (
  id bigint generated always as identity primary key,
  termo text not null,
  nicho text not null,
  bairro text,
  cidade text not null,
  origem text not null default 'auto',
  paginas int not null default 0,
  retornados int not null default 0,
  novos int not null default 0,
  qualificados int not null default 0,
  erro text,
  feita_em timestamptz not null default now()
);
create index if not exists coleta_buscas_feita on public.coleta_buscas (feita_em desc);
create index if not exists coleta_buscas_combo on public.coleta_buscas (termo, bairro, cidade);

alter table public.coleta_termos enable row level security;
alter table public.coleta_bairros enable row level security;
alter table public.coleta_buscas enable row level security;
drop policy if exists dono on public.coleta_termos;
drop policy if exists dono on public.coleta_bairros;
drop policy if exists dono on public.coleta_buscas;
create policy dono on public.coleta_termos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy dono on public.coleta_bairros for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy dono on public.coleta_buscas for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.coleta_termos (nicho, termo, min_avaliacoes) values
  ('estetica', 'nail designer', 5),  ('barbearia', 'barbearia', 10),  ('estetica', 'design de sobrancelha', 5),  ('pet', 'pet shop banho e tosa', 10),  ('tatuagem', 'estúdio de tatuagem', 5),  ('estetica', 'clínica de estética', 10),  ('saude', 'studio de pilates', 5),  ('alimentacao', 'hamburgueria', 10),  ('estetica', 'salão de beleza', 10),  ('saude', 'personal trainer', 3),  ('odontologia', 'dentista', 10),  ('estetica', 'extensão de cílios', 5),  ('saude', 'nutricionista', 5),  ('saude', 'psicólogo', 3),  ('estetica', 'micropigmentação', 5),  ('alimentacao', 'confeitaria', 10)
on conflict (termo) do nothing;
insert into public.coleta_bairros (bairro) values
  ('Vila Mariana'),  ('Santana'),  ('Mooca'),  ('Itaim Bibi'),  ('Perdizes'),  ('Santo Amaro'),  ('Lapa'),  ('Butantã'),  ('Ipiranga'),  ('Vila Madalena'),  ('Brooklin'),  ('Saúde'),  ('Penha'),  ('Tucuruvi'),  ('Jardins'),  ('Campo Belo'),  ('Aclimação'),  ('Pompeia'),  ('Vila Prudente'),  ('Jabaquara'),  ('Moema'),  ('Pinheiros'),  ('Tatuapé'),  ('Liberdade'),  ('Bela Vista'),  ('Consolação'),  ('Vila Formosa'),  ('Casa Verde'),  ('Freguesia do Ó'),  ('Morumbi'),  ('Cambuci'),  ('Barra Funda'),  ('Água Rasa'),  ('Carrão'),  ('Vila Matilde'),  ('Vila Leopoldina'),  ('Alto da Lapa'),  ('Cidade Ademar'),  ('Campo Limpo'),  ('Vila Guilherme')
on conflict do nothing;

-- Rendimento de cada termo: quantos negócios bons (sem site ou link fraco) cada busca traz
create or replace view public.v_coleta_termos with (security_invoker = true) as
select t.*,
  count(b.id) as buscas,
  coalesce(sum(b.retornados), 0) as retornados,
  coalesce(sum(b.qualificados), 0) as qualificados,
  case when sum(b.retornados) > 0 then round(sum(b.qualificados)::numeric / sum(b.retornados), 3) end as taxa,
  max(b.feita_em) as ultima_busca
from public.coleta_termos t
left join public.coleta_buscas b on b.termo = t.termo
group by t.id;

-- Configuração do painel: só chaves conhecidas, e o valor da chave do Google nunca volta para a tela
create or replace function public.salvar_config(p_key text, p_value text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'sem permissão'; end if;
  if p_key not in ('google_places_key', 'coleta_buscas_dia', 'coleta_limite_mes') then raise exception 'chave inválida'; end if;
  insert into app_config(key, value, updated_at) values (p_key, trim(p_value), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

create or replace function public.coleta_status()
returns table (google_conectado boolean, buscas_dia int, limite_mes int, paginas_mes bigint, ultima timestamptz)
language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from app_config where key = 'google_places_key' and coalesce(value, '') <> ''),
    coalesce((select value from app_config where key = 'coleta_buscas_dia')::int, 30),
    coalesce((select value from app_config where key = 'coleta_limite_mes')::int, 950),
    (select coalesce(sum(paginas), 0) from coleta_buscas where feita_em >= date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'),
    (select max(feita_em) from coleta_buscas)
  where public.is_admin();
$$;
revoke all on function public.salvar_config(text, text) from public, anon;
revoke all on function public.coleta_status() from public, anon;
grant execute on function public.salvar_config(text, text) to authenticated;
grant execute on function public.coleta_status() to authenticated;
grant select on public.v_coleta_termos to authenticated;
revoke all on public.v_coleta_termos from anon;

-- "Última coleta" no painel conta as duas origens
create or replace view public.v_resumo with (security_invoker = true) as
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
  (select max(l.created_at) from leads l where l.origem_dado in ('google_maps_apify','google_places')) as ultima_coleta,
  (select count(*) from leads l where l.origem_dado in ('google_maps_apify','google_places') and l.created_at >= now() - interval '24 hours') as leads_24h,
  (select count(*) from envios en, lim where en.canal = 'whatsapp' and en.enviado_em >= lim.hoje) as envios_hoje_wa,
  (select count(*) from envios en, lim where en.canal = 'instagram' and en.enviado_em >= lim.hoje) as envios_hoje_dm,
  (select count(*) from v_fila_dm) as fila_dm;


-- Coleta automática todo dia às 7h (Brasília) = 10h UTC, só com a chave do Google salva
select cron.unschedule('coletar-leads') where exists (select 1 from cron.job where jobname = 'coletar-leads');
select cron.schedule('coletar-leads', '0 10 * * *', $$
  select net.http_post(
    url := 'https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/coletar-leads',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ingest-token', (select value from public.app_config where key = 'ingest_token')),
    body := '{"auto": true}'::jsonb, timeout_milliseconds := 300000)
  where exists (select 1 from public.app_config where key = 'google_places_key' and coalesce(value, '') <> '');
$$);

-- Buscas que o Apify já fez hoje: entram no histórico para não repetir a mesma combinação
insert into public.coleta_buscas (termo, nicho, bairro, cidade, origem, paginas)
select t, n, b, 'São Paulo, SP', 'apify', 0 from (values
  ('nail designer','estetica','Moema'), ('nail designer','estetica','Tatuapé'),
  ('design de sobrancelha','estetica','Pinheiros'), ('design de sobrancelha','estetica','Santana'),
  ('extensão de cílios','estetica','Vila Mariana'), ('extensão de cílios','estetica','Mooca'),
  ('salão de beleza','estetica','Penha'), ('salão de beleza','estetica','Lapa'),
  ('estúdio de tatuagem','tatuagem','Pinheiros'), ('estúdio de tatuagem','tatuagem','Vila Mariana'),
  ('estúdio de tatuagem','tatuagem','Tatuapé'), ('estúdio de tatuagem','tatuagem','Santana'),
  ('pet shop banho e tosa','pet','Moema'), ('pet shop banho e tosa','pet','Mooca'),
  ('pet shop banho e tosa','pet','Perdizes'), ('pet shop banho e tosa','pet','Ipiranga')
) v(t, n, b)
where not exists (select 1 from public.coleta_buscas where origem = 'apify');
