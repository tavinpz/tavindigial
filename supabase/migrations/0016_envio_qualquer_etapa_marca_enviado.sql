-- 0016: qualquer mensagem mandada para quem ainda estava na fila tira o lead da fila (não só a abertura)
create or replace function public.on_envio()
returns trigger language plpgsql set search_path = public as $$
begin
  update leads set
    status = case when status in ('novo','na_fila') then 'enviado'::status_lead else status end,
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

update leads l set status = 'enviado'
where l.status in ('novo','na_fila') and exists (select 1 from envios e where e.lead_id = l.id);
