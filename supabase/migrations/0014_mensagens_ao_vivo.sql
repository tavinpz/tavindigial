-- 0014: textos das mensagens também ao vivo (editou num aparelho, o outro já usa o texto novo)
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mensagens') then
    alter publication supabase_realtime add table public.mensagens;
  end if;
end $$;
