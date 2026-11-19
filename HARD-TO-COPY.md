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

## Atualização de 18/11/2026 (noite): lote hc002 a hc005
O motor agora serve a qualquer vídeo, sem mexer no `Video.tsx`:
- `ferramentas/htc/htc_comum.py`: `Roteiro(NOMES, grupo)` com `B`, `TRAVA`, `TR` (quadro das 5 travas com os nomes do vídeo) e `salva()`. O roteiro novo é só `hcNNN_roteiro.py`.
- `src/htc/Gen.tsx`: diagramas genéricos guiados pelos dados do roteiro: `barras`, `cadeia`, `linhaT`, `par`, `rosca`, `grade`, `versus`, `pilha`, `comp`. Usar estes antes de desenhar um novo.
- `src/htc/D0N.tsx`: diagramas sob medida de cada vídeo (2 a 5 por vídeo, sempre o do gancho), registrados em `Extras.tsx`.
- `src/htc/Capas.tsx`: capas do hc002 em diante (`HTCThumb` com `v` = "02a", "03b"...), com peças prontas (Chip, Fabrica, Aviao, Grana, Lamina, Cadeado, Placa, Cadeira, Canhao, Estouro, Globo, Chapa, Saleiro, Camadas).
- `ferramentas/htc/`: `mixar.sh` (mixagem), `folha.py` (folha de contato automática: `python3 ferramentas/htc/folha.py htc/vNN /tmp/fNN`), `rev.py` (troca só o visual do `tempos.json` sem narrar de novo, quando o texto não mudou), `painel.py` (copia para o ramo de envio e imprime o SQL do `videos_envio` e os capítulos).
- Tempo medido por vídeo: narração 6 min, folha de contato 2 min, render no GitHub 5 a 15 min (a fila é dividida com outros canais).

Lições do lote:
- 1.250 palavras dão 8 min. Para ter folga acima de 8 min, escrever 1.350 a 1.450.
- Texto de valor comprido estoura a barra (`barras`): rótulo curto, detalhe no `cab`.
- Bloco que começa com `n=0` e fala longa fica vazio na tela: dar um diagrama já na primeira fala.
- Título: o molde puro "Why No One Can Copy X" está saturado de clones com menos de mil views (TSMC tem mais de dez). O que funciona no nicho é nome grande + objeto ou fato estranho (o padrão do hc001).
- Notícia quente vale ouro: a saída do Jensen Huang da Nvidia (12/11/2026) tinha vídeos de 1 milhão de views no radar; o hc003 foi ancorado nela.

## Pautas
| # | Tema | Estado |
|---|---|---|
| 01 | Espelhos da ZEISS, "The Mirror ASML Can't Make" | Feito, no painel (18/11/2026). Números da ASML de 2025 conferidos no 20-F: compras de € 4.406,9 mi, citação do "cease to be able to conduct our business" confirmada |
| 02 | TSMC, "TSMC Is Spending $265 Billion to Copy Itself" (8:51) | Feito, no painel (18/11/2026) |
| 03 | Nvidia / CUDA, "Nvidia Lost Its Founder. It Didn't Lose This." (8:36) | Feito, no painel (18/11/2026). Depende da notícia: se o Jensen voltar ao cargo, rever título e fecho antes de publicar |
| 04 | Laser da TRUMPF, "The Laser ASML Can't Build" (8:15) | Feito, no painel (18/11/2026) |
| 05 | Filme ABF da Ajinomoto, "The Seasoning Company Nvidia Can't Replace" (8:01) | Feito, no painel (18/11/2026) |
| 06+ | A definir | ARM (o Tradeoff Layer fez 320 mil views com "Why Everyone Pays ARM?"), fotorresiste do Japão, wafers da Shin-Etsu, memória HBM da SK Hynix, EDA (Synopsys/Cadence) |

Fontes de cada vídeo: coluna `fontes` da linha em `videos` no painel e o rodapé "SOURCE" de cada bloco no `hcNNN_roteiro.py`.
