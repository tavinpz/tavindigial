# Two Childhoods: guia de produção (início em 18/11/2026)

Canal no painel: `two-childhoods`. Pautas: tc001 (smart x trying), tc002 (fear x respect), tc003 (rescued x allowed to fail).
Vídeo-modelo: "Parents Who Yell vs Parents Who Ask: The Whole Life" (Which One Are You, id _UvjEWaIwug, 8:03).
Ambiente, voz, render, painel: ver `CROSSWIND.md`. Fila de 20 máquinas: repo `tavinpz/render-videos` (`fila/<id>.txt`, linha 2 = "<Composição> <pasta em public>").

## Estado
- Padrão visual: 5 imagens paradas enviadas ao Tavin em 18/11 (aguardando aprovação). Código em `atlas-motion/src/tc/` (`lib.tsx`, `Stills.tsx`), composição `TCStill` (props k = a..e). Gerar: `node _stills_tc.mjs $PWD/src/index.ts /tmp/tc a,b,c,d,e`.
- Roteiro do #01: `atlas-motion/public/tc/v01/roteiro.md` (aguardando aprovação). Fontes conferidas listadas no fim do arquivo.
- Falta: roteiro.json com o que aparece em cada fala, motor do vídeo (`TCVideo`), voz (ainda não escolhida: levar 2 opções Kokoro no teste curto), som, teste curto com som, render na fila, 3 thumbs, painel.

## Padrão visual (próprio, não copiar o modelo)
- Duas cores trocadas, tiradas da logo: Casa A = fundo âmbar #F2B441 com desenho marinho #17304B; Casa B = o inverso. Creme #FBF3E4 para balões, legenda e cartões. Coral #E5533D só para alerta (palavra-chave, carimbo, número ruim).
- Personagem = o peão da logo (cabeça redonda + corpo trapezoidal), que cresce com a idade (`ALTURA`). Criança cheia, adulto ao lado dela claro com contorno. Olhos = dois pontos que mudam de direção; emoção por inclinação e olhar.
- Fontes: Alfa Slab One (títulos, números), Inter 800/900 (legenda, balões), JetBrains Mono (aviso).
- Assinaturas: selo AGE na emenda com a cor trocada em cada metade; título partido na emenda (`Partido`: "AGE" marinho | "16" âmbar); contagem em risquinhos por casa (`Topo conta`); linha da vida com os peões 6/16/30/60 nos cartões de capítulo.
- Estudo real = cartão de fundo creme (`CenaD`), com autores, ano, revista, amostra e os peões contando a porcentagem. História = aviso fixo "ILLUSTRATED STORY · BASED ON PUBLISHED RESEARCH".
- Legenda: tarja creme embaixo, palavra-chave com marca-texto âmbar. Nada de desenho abaixo de y=900.

## Regras de conteúdo
- A vida inteira é dramatização: dizer isso no vídeo. Estudo só com número conferido na fonte primária; dizer também quando a ciência discorda (no #01: Li & Bates 2019 não replicou).
- CTAs: comentário no meio (escolha entre as duas casas), compartilhar depois do pico emocional, inscrição no final com o próximo vídeo pelo nome.
- Título batido: conferir no YouTube antes do render. Em 18/11 o tema do #01 existia só como explicação solta (clipes antigos da Dweck com 689 mil e 1,2 mi; canais pequenos recentes), nada no formato "vs / whole life".
