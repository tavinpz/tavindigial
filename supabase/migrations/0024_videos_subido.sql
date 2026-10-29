-- Coluna "Upload feito" do quadro de vídeos: o upload já foi feito, falta programar/publicar
alter table public.videos add column if not exists subido_em timestamptz;
comment on column public.videos.subido_em is 'Quando o Tavin fez o upload (coluna Upload feito do painel), antes de programar';
