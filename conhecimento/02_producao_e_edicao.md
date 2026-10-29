# 02 · Produção e edição

## Preparar a sessão
```bash
git clone -b concrete-atlas --single-branch https://github.com/tavinpz/tavindigial concrete-atlas
cd concrete-atlas && ./setup.sh   # voz Kokoro, Remotion em motion/, texturas do globo, link ../atlas-motion
```
Precisa de ffmpeg e do Chromium do Playwright (o ambiente na nuvem do Claude já tem). Os vídeos prontos ficam em `saida/` (fora do git) e no painel.

## Fazer um Short
1. Copie uma pasta parecida de `videos/` para `videos/NNN-tema/` e edite o `spec.json`:
   - `arquivo` (`concrete_atlas_short_NNN_tema.mp4`), `titulo`, `falas` (1 fala = 1 cena), `cenas`.
   - A cena 0 tem `gancho`: a frase de impacto que aparece já no quadro 0, sobre o globo 3D.
2. Voz: `python3 motor/cenas.py videos/NNN-tema narrar` → `v*.wav` + `narr.json`.
3. Tempos e mapas: `python3 motor/prep_motion.py videos/NNN-tema`.
4. Som: `python3 motor/som.py NNN` (trilha + whoosh + impacto + voz, normalizado a −14 LUFS).
5. Conferir quadros antes do render: `cd ../atlas-motion && node quadros.mjs NNN /tmp/q 0 120 400 …` e olhar as imagens.
6. Render: `python3 render.py NNN` (~10 min por Short de 35–45 s em 2 CPUs) → `saida/`.
7. Painel: `python3 motor/enviar_painel.py ca-0NN` (gera a cópia de entrega H.264 CRF 21 ≤ 9 Mbps e a capa, e sobe pelo branch `envio-videos`; o script explica o resto).

Se um render ou envio for interrompido (limite de tempo da sessão), rode de novo só os que faltam, em blocos menores.

## Tipos de cena
`mapa` (bbox, destaque, pins, rota/rotas, estilo_rota, lacuna, enxame, numero, escuro, zoom, gancho) · `numero` (valor, prefixo, sufixo, label, nota, cor, fundo, segundo) · `barras` · `perfil` (corte lateral: terreno, água, túnel, poços, cotas, caminho, nível do mar) · `linha` (linha do tempo) · `lista` · `secao` · `comportas` · `portoes` · `salao` (3D) · `cta`.
Detalhes e o que cada efeito faz: `motion/README.md`.

## Regras de edição para reter (o que já aplicamos)
- **0–1 s:** o gancho na tela e na voz ao mesmo tempo. Nada de logo, "hoje vamos ver" ou contexto antes.
- **Corte a cada 2–4 s** (nova cena, zoom, número subindo). Nunca mais de ~5 s de imagem parada.
- **Números em âmbar e em odômetro**: o número é o "momento" do vídeo.
- **Pergunta no meio** ("comment your guess before I tell you…"): segura até a resposta e puxa comentário.
- **Final = resposta**: depois de responder, chamada de ~3 s e logo; o vídeo recomeça em loop. Nada de enrolação no fim.
- Duração alvo: **30–50 s**. Pode ir até 3 min (Shorts aceitam desde out/2024), mas só se a história segurar.
- Legenda grande dentro da área segura (fora dos 20% de baixo e da coluna da direita, onde ficam os botões do Shorts).
- Som: trilha baixa sob a voz, whoosh nos cortes, impacto nos números. Voz sempre clara.
- Cada vídeo com pelo menos 3 tipos de cena diferentes e uma composição que não se repita no anterior (proteção contra "conteúdo inautêntico").

## Checklist antes de subir
- [ ] Todos os números conferidos em fonte aberta e listados na descrição.
- [ ] Gancho legível no quadro 0 (é a prévia no feed).
- [ ] Nenhum texto cortado nem coberto pelos botões do app.
- [ ] Mapa e nomes de lugares corretos (fronteiras sensíveis: neutro).
- [ ] Áudio sem estouro, voz inteligível.
- [ ] Título, descrição, legendas TikTok/Instagram e comentário fixado prontos no `videos.json`.

## Vídeos longos (a partir do mês 2)
- 6–12 min, 16:9, sobre o tema de um Short que foi bem (o Short vira "trailer").
- Estrutura: promessa nos primeiros 30 s, capítulos claros, um "momento" a cada ~60 s (mapa novo, número, comparação), final que puxa para o próximo vídeo.
- Miniatura no estilo de `marca/miniatura_exemplo.png`: um elemento grande, no máximo 3–4 palavras, contraste âmbar/navy.
- O motor atual é vertical; para longos, adaptar as composições do Remotion para 1920×1080 (mesmo estilo).
