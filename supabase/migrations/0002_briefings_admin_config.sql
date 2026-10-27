-- Aplicado no projeto em 27/10/2026 (via MCP). Mantido aqui como registro.
alter table leads add column if not exists telefone_fixo boolean not null default false;

create table briefings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  produto text not null default 'site',
  negocio text not null, responsavel text not null, whatsapp text not null,
  email text, cidade text, endereco text, instagram text, servicos text, horarios text,
  diferenciais text, cores text, referencias text, modelo_escolhido text, observacoes text,
  aceite_termos boolean not null default false,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);
alter table briefings enable row level security;

-- Configuração privada (só edge functions leem). O token de ingestão NÃO fica no repositório.
create table app_config (key text primary key, value text not null, updated_at timestamptz not null default now());
alter table app_config enable row level security;
revoke all on app_config from anon, authenticated;

-- Só e-mails desta tabela acessam o painel
create table admins (email text primary key, created_at timestamptz not null default now());
alter table admins enable row level security;
revoke all on admins from anon, authenticated;

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function is_admin() from public, anon;
grant execute on function is_admin() to authenticated;

do $$
declare t text;
begin
  foreach t in array array['leads','mensagens','envios','eventos','negocios','supressao','conteudo','briefings'] loop
    execute format('drop policy if exists dono on %I', t);
    execute format('create policy dono on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- v_fila_hoje e v_followups recriadas para incluir telefone_fixo (prioridade -1 para fixo)
-- mensagem extra: followup_proposta
