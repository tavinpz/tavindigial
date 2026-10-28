-- 3 mensagens no total (abertura, D+3, D+7) e próximo contato depois de mandar o link
create or replace function public.on_envio()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$
begin
  update leads set
    status = case when status in ('novo','na_fila') then 'enviado'::status_lead else status end,
    proximo_contato = case new.etapa
                        when 'abertura'    then now() + interval '3 days'
                        when 'abertura_dm' then now() + interval '3 days'
                        when 'followup_1'  then now() + interval '4 days'
                        when 'resp_link'   then now() + interval '2 days'
                        when 'resp_preco'  then now() + interval '2 days'
                        when 'resp_pensar' then now() + interval '3 days'
                        when 'pos_venda'   then proximo_contato
                        else null end
  where id = new.lead_id;
  return new;
end $function$;
