# Captura das telas reais da Thata (dados fictícios)

- `harness/`: copiar para `thata.saas/.harness_video` e rodar `npx vite --config .harness_video/vite.config.mjs --port 5199` dentro do repositório da Thata. Ele monta as páginas reais com Supabase, login e n8n de mentira.
- `cap_*.mjs`: um script por funcionalidade (puppeteer). `dados_*.js` é o banco fictício de cada um. Saída em `/tmp/shot/out`; os PNGs usados nos vídeos ficam em `public/telas/`.
- `lib.mjs`: abrir, clicar, digitar, foto (salva as caixas dos alvos em px do print).

## v2 (vídeos verticais, nov/2026)
- `MOB=1` (opcional `MOBH=900`) nos scripts `cap_*.mjs` captura a versão celular (390 css, dpr 3); os `*_m.mjs` têm os seletores que funcionam no layout mobile.
- `ref.py <feat> [altura] [y0] [nomes]` monta a folha com régua (px da imagem) usada para escrever as coordenadas dos roteiros em `src/v2/roteiros/*.json`.
- Fluxo: `python3 gera_v2.py Gn && python3 checa_v2.py Gn && python3 checa_voz.py Gn && FOLHA_DIR=/tmp/thata-folhas ./folha.sh Gn <quadros>` e depois `printf "Gn\n" >> fila.txt`.
