-- Quem respondeu e ainda está esperando a sua resposta (nenhum envio depois da resposta)
create or replace view public.v_responderam with (security_invoker = true) as
select l.*, r.ultima_resposta, r.tipo as tipo_resposta,
  (select e.canal from envios e where e.lead_id = l.id order by e.enviado_em desc limit 1) as ultimo_canal,
  (select count(*) from envios e where e.lead_id = l.id) as total_envios
from leads l
join lateral (
  select v.created_at as ultima_resposta, v.tipo from eventos v
  where v.lead_id = l.id and v.tipo in ('respondeu', 'pediu_preco')
  order by v.created_at desc limit 1
) r on true
where l.status = 'respondeu'
  and not exists (select 1 from envios e where e.lead_id = l.id and e.enviado_em > r.ultima_resposta)
order by r.ultima_resposta;
