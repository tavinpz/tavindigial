-- 0021: acompanhamento da prospecção — cada lead já chamado, com quantos dias faz o último envio,
-- qual foi a última mensagem e quando é o próximo passo (busca por nome ou número no painel)
create or replace view public.v_acompanhamento with (security_invoker = true) as
select l.id, l.nome, l.whatsapp, l.instagram, l.categoria, l.bairro, l.nicho, l.tipo_site, l.status, l.proximo_contato,
       e.primeiro_envio, e.ultimo_envio, e.total_envios, u.etapa as ultima_etapa, u.canal as ultimo_canal,
       r.ultima_resposta
from public.leads l
join lateral (select min(enviado_em) primeiro_envio, max(enviado_em) ultimo_envio, count(*) total_envios
              from public.envios where lead_id = l.id) e on e.total_envios > 0
left join lateral (select etapa, canal from public.envios where lead_id = l.id order by enviado_em desc limit 1) u on true
left join lateral (select max(created_at) ultima_resposta from public.eventos
                   where lead_id = l.id and tipo in ('respondeu', 'pediu_preco')) r on true
where l.status in ('enviado', 'abriu', 'respondeu', 'proposta');

grant select on public.v_acompanhamento to authenticated;
