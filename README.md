# PAWSLATED · página do link da bio

Página estática (sem build): cadastro de e-mail → download do PDF grátis → oferta de $9, tudo na mesma página.

- E-mails vão para `pawslated_inscritos` no Supabase (projeto Ecoom), via RPC `pawslated_inscrever`.
- No topo do `<script>` de `index.html`: `CHECKOUT_URL` (link do checkout de $9) e `AFFILIATE_URL` (HopLink do ClickBank). Vazios = botão vira lista de espera / bloco de afiliado escondido.

Deploy no Cloudflare Pages: Create project → Connect to Git → este repo, ramo `pawslated-site` → framework "None", build command vazio, output directory `/`.
