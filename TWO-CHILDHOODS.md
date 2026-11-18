# Two Childhoods: guia de produção (início em 18/11/2026)

Canal no painel: `two-childhoods`. Pautas: tc001 (smart x trying), tc002 (fear x respect), tc003 (rescued x allowed to fail).
Vídeo-modelo: "Parents Who Yell vs Parents Who Ask: The Whole Life" (Which One Are You, id _UvjEWaIwug, 8:03).
Ambiente, voz, render, painel: ver `CROSSWIND.md`. Fila de 20 máquinas: repo `tavinpz/render-videos` (`fila/<id>.txt`, linha 2 = "<Composição> <pasta em public>").

## Estado
- **#01 (tc001) FEITO em 18/11/2026: 8:37**, no painel (vídeo 40,7 MB + 3 capas, linha `tc001-praised-smart` preenchida). Aguardando o Tavin aprovar esta primeira versão antes do tc002/tc003.
- Padrão visual aprovado pelo Tavin em 18/11 ("visualmente gostei muito").
- Voz: Kokoro `af_heart`, velocidade 0.9 (escolha minha, ainda não confirmada por ele).

## Como produzir um vídeo (medido no #01)
1. Roteiro em `atlas-motion/tcNN_roteiro.py` (copiar `tc01_roteiro.py`): blocos com `cena` (duo, estudo, texto, vida, honesto, trocas, fim), `idade`, `cap` (cartão de capítulo, com `pre` de silêncio) e, em cada fala, o estado da tela em `v`. Gera `public/tc/vNN/roteiro.json`. Meta: 8 a 12 min, ~1.350+ palavras.
2. Voz: `python3 narrar_tc.py public/tc/vNN af_heart 0.9` -> `voz_longo.wav` + `tempos.json` (~2 min).
3. Som: `python3 sfx_tc.py public/tc/vNN` -> `sfx.wav`, `mix.wav`, `mix.m4a` (-15,7 LUFS no #01).
4. Conferir: `node _folha_tc.mjs $PWD/src/index.ts tc/vNN /tmp/q auto` (um quadro por fala) e olhar tudo.
5. Fila: copiar `src/tc/*`, `public/tc/vNN/{tempos.json,mix.m4a}` para o `render-videos`, registrar em `src/Root.tsx` se faltar, criar `fila/tcNNN.txt` com "20" e "TCVideo tc/vNN", push. 8:37 saiu em 4 min 33 s. O vídeo vem no ramo `saida-tcNNN` (já com bitrate para caber nos 50 MB do painel).
6. Thumbs: composição `TCThumb` (v = a, b, c) em `src/tc/Thumbs.tsx`.
7. Painel: como no `CROSSWIND.md` seção 9 (videos_envio + ramo envio-videos + update da linha em `videos`).
- Render local também é viável: ~10 quadros/s em 2 núcleos (8:37 em ~26 min), para uma versão em qualidade máxima.
- Áudio (wav/m4a) não vai para este repo (está no .gitignore); o mix.m4a fica só no render-videos.

## Padrão visual (versão 2, 18/11/2026)
O Tavin reprovou a versão 1 (tudo em amarelo e azul chapados: "ruim para o olho") e pediu mais tonalidades, sombra e algo mais real. Gostou do roteiro e das animações.
- Casa A = parede amarela quente com luz; Casa B = parede azul clara. Piso de madeira, rodapé, tapete, planta, janela com céu (dia) ou lua e estrelas (a partir dos 22 anos), cortinas, móveis de madeira com sombra, livros coloridos, troféus dourados.
- Personagens = o peão da logo humanizado (`Peao tipo="sam" | "pai" | "filho"`): pele, cabelo, bochecha, boca que muda com o humor (feliz, triste, neutro), roupa colorida com sombreado e sombra no chão. Sam usa sempre coral nas duas casas; pai/mãe da Casa A de verde, da Casa B de roxo; grisalho e óculos aos 60.
- Cartões (capítulo, texto, resumo): amarelo quente | azul médio com luz e bolinhas; texto marinho à esquerda e branco à direita, com sombra.
- Estudo real = cartão creme. Pictogramas de gráfico usam `Peao tipo="icone"`.
- Capas: seguir a fórmula da capa que deu certo no vídeo-modelo (174 mil views): etiqueta AGE 6 → AGE 60 (ou 30), causa à esquerda, consequência à direita, frase curta embaixo de cada lado, uma palavra em vermelho. Ver `src/tc/Thumbs.tsx`.

## Regras de conteúdo
- A vida inteira é dramatização: dizer isso no vídeo. Estudo só com número conferido na fonte primária; dizer também quando a ciência discorda (no #01: Li & Bates 2019 não replicou).
- CTAs: comentário no meio (escolha entre as duas casas), compartilhar depois do pico emocional, inscrição no final com o próximo vídeo pelo nome.
- Título batido: conferir no YouTube antes do render. Em 18/11 o tema do #01 existia só como explicação solta (clipes antigos da Dweck com 689 mil e 1,2 mi; canais pequenos recentes), nada no formato "vs / whole life".
