-- 0013: o painel escuta mudanças nessas tabelas e atualiza sozinho (celular e computador sempre iguais).
-- A RLS continua valendo: só o admin recebe as mudanças.
do $$
declare t text;
begin
  foreach t in array array['leads','envios','eventos','negocios','briefings','conteudo','coleta_buscas'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
