-- De qual WhatsApp saiu cada mensagem (web = aba do WhatsApp Web, app = app do computador)
alter table public.envios add column if not exists origem text check (origem in ('web', 'app'));

-- Os números de cada um (a prévia manda a resposta do lead para o mesmo número que falou com ele)
insert into public.app_config(key, value, updated_at) values ('wa_numero_web', '5527992886950', now())
on conflict (key) do nothing;

create or replace function public.numeros_whatsapp()
returns table (web text, app text)
language sql stable security definer set search_path = public as $$
  select (select value from app_config where key = 'wa_numero_web'), (select value from app_config where key = 'wa_numero_app')
  where public.is_admin();
$$;
revoke all on function public.numeros_whatsapp() from public, anon;
grant execute on function public.numeros_whatsapp() to authenticated;
