# Tavin Digital: máquina de prospecção

Site público, páginas de modelos rastreadas, formulário de briefing e painel de vendas, tudo num app Vite + React com Supabase.

| Rota | O que é |
| --- | --- |
| `/` | Site da Tavin Digital |
| `/m/<nicho>?n=<negócio>&r=<lead_id>` | Página de modelos personalizada (vai no link da mensagem e registra quando abre) |
| `/briefing` | Formulário do cliente que fechou |
| `/termos`, `/privacidade` | Termos de serviço e política de privacidade |
| `/painel` | Painel: fila do dia, follow-ups, funil, leads, briefings, métricas, mensagens, conteúdo |

Nichos com página própria: `odontologia`, `estetica`, `barbearia`, `pet`, `saude`, `alimentacao`, `geral`.

## Deploy no Cloudflare Pages

1. Cloudflare → Workers & Pages → Create → Pages → conecte o repositório `tavinpz/tavindigial`.
2. Build command: `npm run build` · Output directory: `dist` · Framework: Vite.
3. Variáveis de ambiente (opcional, já têm padrão no código): `VITE_WHATSAPP_VENDAS` = seu número de vendas com 55 + DDD.
4. Custom domains → adicione `tavindigital.online`.

O arquivo `public/_redirects` já faz as rotas funcionarem no Pages.

## O que editar

- `src/config.js`: WhatsApp de vendas, CNPJ, link de avaliação do Google, preços, meta diária.
- `src/data/modelos.js`: seus modelos reais (link da demo e print) e o portfólio de clientes.

## Backend (Supabase)

- Tabelas, views e gatilhos: `supabase/migrations/0001_schema.sql` (o banco já está aplicado).
- Edge functions: `track` (abertura da página), `briefing` (formulário), `ingest-leads` (coleta do n8n, protegida por token).
- Acesso ao painel: só e-mails cadastrados na tabela `admins`.

## Coleta de leads (n8n)

Workflow **Tavin Digital · Coleta de leads (Google Maps)**: formulário com nicho + cidade → Apify (Google Maps) → `ingest-leads` → fila **Hoje** do painel.
