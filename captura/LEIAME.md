# Captura das telas reais da Thata (dados fictícios)

- `harness/`: copiar para `thata.saas/.harness_video` e rodar `npx vite --config .harness_video/vite.config.mjs --port 5199` dentro do repositório da Thata. Ele monta as páginas reais com Supabase, login e n8n de mentira.
- `cap_*.mjs`: um script por funcionalidade (puppeteer). `dados_*.js` é o banco fictício de cada um. Saída em `/tmp/shot/out`; os PNGs usados nos vídeos ficam em `public/telas/`.
- `lib.mjs`: abrir, clicar, digitar, foto (salva as caixas dos alvos em px do print).
