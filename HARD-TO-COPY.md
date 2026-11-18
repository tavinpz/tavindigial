# Hard to Copy: guia de produção

Canal em inglês, só vídeo longo (8 a 15 min), feito em código. Cada vídeo responde por que ninguém consegue copiar uma empresa, máquina ou peça.
O **#01, "The Mirror ASML Can't Make" (hc001, 10:27)**, é a régua. O Tavin aprovou o visual, a voz e o vídeo em 18/11/2026 e pediu mais 4.

## Onde está tudo
- Motor: `tavinpz/render-videos`, `src/htc/` (`lib.tsx` identidade, `Video.tsx` motor e diagramas, `Thumbs.tsx` capas, `Quadros.tsx` quadros parados). Cópia em `atlas-motion/src/htc/` deste ramo.
- Scripts: `render-videos/ferramentas/htc/` (`hc001_roteiro.py`, `narrar_htc.py`, `sfx_htc.py`). Cópia em `atlas-motion/`.
- Dados do vídeo: `render-videos/public/htc/v01/` (`roteiro.json`, `tempos.json`, `mix.m4a`). Vídeo novo = pasta nova (`v02`...).

## Fluxo (medido no #01: ~10 min de máquina, fora roteiro e diagramas novos)
1. Conferir por busca e pelo radar (`radar_longos`) se o título já está batido. O canal UCN3uao_fCmgmdtpak6HH2ZQ clonou o molde "Why No One Can Copy X" (ZEISS, ASML, NVIDIA, LEGO, Rolex...) e não passou de mil views: fugir desse título puro.
2. Fatos na fonte primária (site da empresa, relatório anual, SEC), com tabela de fonte por fato. O que vier de fonte secundária é marcado.
3. Roteiro em `hcNNN_roteiro.py`: blocos com falas; cada fala leva `v` (d = diagrama, n = passo, k = frase de apoio, tit = título). Siglas com hífen para a voz soletrar (A-S-M-L, E-U-V); nomes difíceis pela fonética (Oberkoken, Frownhofer).
4. `python3 narrar_htc.py <pasta>` (Kokoro 60% am_michael + 40% am_fenrir, a mistura do Crosswind) e `python3 sfx_htc.py <pasta>`; mixagem com o ffmpeg do CROSSWIND.md, saída `mix.m4a`.
5. Folha de contato: `node _stills_htc.mjs $PWD/src/index.ts HTCVideo <quadros> <dir> htc/vNN` e olhar tudo (texto sobreposto, quadro vazio).
6. Render: `fila/hcNNN.txt` com `20` e `HTCVideo htc/vNN`, commit e push no `render-videos`. Sai no ramo `saida-hcNNN` em ~5 min. Fazer `git fetch` + `rebase` antes do push: outras conversas usam a mesma fila.
7. Painel: registrar em `videos_envio`, copiar para `envio/hard-to-copy/` no ramo `envio-videos`, push, e atualizar a linha em `videos` (formato da `hc001-zeiss-mirrors`).

## Regras do Tavin para este canal
- O início tem que prender: a imagem estranha já no quadro 0 (no #01, o espelho que vira a Alemanha), sem checklist parado e sem preto.
- Estrutura que ele aprovou: gancho + 5 "travas" (LOCK 1/5...), a última escondida até ~70% e fora da tecnologia; pedido de comentário no meio, de compartilhar depois da virada, de inscrição no fim.
- Capas: olhar as que mais renderam no nicho antes de fazer. Padrão do Tradeoff Layer (ASML 43x a média do canal): fundo claro e saturado, traço preto grosso, 1 ou 2 palavras gigantes com contorno e sombra, um objeto concreto e um sinal simples (X vermelho, "?"). Nós fazemos sem rosto de pessoa real e sem logotipo.
- No vídeo: menta = o original, tracejado cinza = a cópia, âmbar = medida e número, violeta = luz. Empresa aparece só como texto.

## Pautas
| # | Tema | Estado |
|---|---|---|
| 01 | Espelhos da ZEISS | Feito, no painel (18/11/2026) |
| 02 | TSMC | Pauta no painel; tema batido, conferir ângulo |
| 03 | Nvidia / CUDA | Pauta no painel; o título atual é idêntico ao do canal clone, trocar |
| 04, 05 | A definir | Outros elos da cadeia de chips (laser da TRUMPF, ARM, fotorresiste, wafers) |
