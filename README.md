# Concrete Atlas

Gerador de vídeos do canal Concrete Atlas (megaprojetos, cidades e geografia, em inglês, sem rosto).

## Sessão nova
```
./setup.sh                      # dependências + voz Kokoro (Apache 2.0, uso comercial liberado)
```

## Fazer um vídeo
1. Copie uma pasta de `videos/` (ex.: `001-netherlands`) para `videos/NNN-tema`.
2. Em `tts.py`, troque as falas (`LINES`). Voz padrão: `am_michael`, velocidade 1.08.
3. Rode `python3 tts.py` → gera `v0.wav…` e `narr.json` (duração de cada fala).
4. Em `render.py`, ajuste as cenas (uma função por fala). Confira quadros: `python3 render.py quadros`.
5. Renderize: `python3 render.py 0,1,2,...` → `c0.mp4…`
6. Monte: `python3 motor/montar.py videos/NNN-tema concrete_atlas_short_NNN.mp4`

## Estilo
- 1080×1920, 30 fps. Desenha em 2x e reduz (antialias).
- Cores: Navy #091320, Sea #0E2436, Land #1F3244, Amber #F2B33D (números e destaque), Water #3FA7F5, Paper #F4F6F8.
- Títulos em Inter Display Black maiúsculo; legenda em blocos de 3 palavras, números em âmbar.
- Assinatura "CONCRETE ATLAS" com o símbolo no topo.
- Mapas: Natural Earth 1:50m (`dados/ne50.geojson`, domínio público).

## Marca
`marca/` (logo, marca d'água, banner, miniatura de exemplo, folha da marca). Regerar: `python3 motor/brand.py`.
