-- 0009: filas sem teto de 60 (estoque grande para chamar), arquivar e apagar leads

-- Arquivado: some de todas as filas e do CRM, mas fica guardado (e não volta na próxima coleta)
alter type public.status_lead add value if not exists 'arquivado';

-- Apagado: some de vez. Guardamos só o place_id para a coleta não trazer o mesmo negócio de novo
create table if not exists public.leads_apagados (
  place_id text primary key,
  apagado_em timestamptz not null default now()
);
alter table public.leads_apagados enable row level security;
drop policy if exists dono on public.leads_apagados;
create policy dono on public.leads_apagados for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.on_lead_apagado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.place_id is not null then
    insert into leads_apagados(place_id) values (old.place_id) on conflict do nothing;
  end if;
  return old;
end $$;
drop trigger if exists on_lead_apagado on public.leads;
create trigger on_lead_apagado before delete on public.leads for each row execute function public.on_lead_apagado();

-- Filas sem o teto de 60 (v_fila_hoje é recriada: l.* ganhou ig_checado_em)
drop view if exists public.v_fila_hoje;
create view public.v_fila_hoje with (security_invoker = true) as
select * from (
  select distinct on (l.whatsapp) l.*,
    ((case l.tipo_site when 'site_falso' then 3 when 'sem_site' then 2 else 0 end)::numeric
      + least(coalesce(l.avaliacoes, 0)::numeric / 50, 3)
      + (case when coalesce(l.nota, 0) >= 4.5 then 1 else 0 end)
      - (case when l.telefone_fixo then 1 else 0 end)) as prioridade
  from leads l
  where l.status in ('novo','na_fila')
    and l.tipo_site <> 'site_ok'
    and l.whatsapp is not null
    and not exists (select 1 from supressao s where s.whatsapp = l.whatsapp)
    and not exists (select 1 from leads o where o.whatsapp = l.whatsapp and o.id <> l.id and o.status not in ('novo','na_fila'))
  order by l.whatsapp,
    ((case l.tipo_site when 'site_falso' then 3 when 'sem_site' then 2 else 0 end)::numeric
      + least(coalesce(l.avaliacoes, 0)::numeric / 50, 3)
      + (case when coalesce(l.nota, 0) >= 4.5 then 1 else 0 end)) desc,
    l.created_at
) f
order by f.prioridade desc, f.created_at
limit 3000;

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
limit 3000;

grant select on public.v_fila_hoje, public.v_fila_dm to authenticated;
revoke all on public.v_fila_hoje, public.v_fila_dm from anon;
