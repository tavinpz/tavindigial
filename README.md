# Concrete Atlas

Gerador de vídeos do canal Concrete Atlas (megaprojetos, cidades e geografia, em inglês, sem rosto).

## Sessão nova
```
./setup.sh                      # dependências + voz Kokoro (Apache 2.0, uso comercial liberado)
```

## Fazer um vídeo
Passo a passo atual (motor Remotion em `motion/`): `conhecimento/02_producao_e_edicao.md`.
Instruções do projeto no Claude: `PROJETO.md`. Conhecimento (marca, viralização, SEO, ferramentas, políticas, agenda): `conhecimento/`.
A agenda e os textos de cada vídeo ficam em `canal/videos.json` (o `canal/publicacoes.md` é o registro antigo das primeiras datas).

## Estilo
- 1080×1920, 30 fps. Desenha em 2x e reduz (antialias).
- Cores: Navy #091320, Sea #0E2436, Land #1F3244, Amber #F2B33D (números e destaque), Water #3FA7F5, Paper #F4F6F8.
- Títulos em Inter Display Black maiúsculo; legenda em blocos de 3 palavras, números em âmbar.
- Assinatura "CONCRETE ATLAS" com o símbolo no topo.
- Mapas: Natural Earth 1:50m (`dados/ne50.geojson`, domínio público).

## Marca
`marca/` (logo, marca d'água, banner, miniatura de exemplo, folha da marca). Regerar: `python3 motor/brand.py`.
