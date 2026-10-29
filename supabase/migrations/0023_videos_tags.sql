-- Tags do YouTube por vídeo, separadas por vírgula (o painel mostra com botão Copiar)
alter table public.videos add column if not exists yt_tags text;
comment on column public.videos.yt_tags is 'Tags do YouTube separadas por vírgula (campo Tags do upload)';
