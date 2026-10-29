# Atlas Motion — motor de animação do Concrete Atlas

Motion graphics em código (Remotion 4 + React + three.js + d3-geo). Cada Short sai de um `spec.json`
(em `concrete-atlas/videos/NNN-nome/`) com as falas e as cenas.

## O que tem em cada vídeo
- **Globo 3D na abertura** (texturas NASA Blue Marble, domínio público) girando e mergulhando no local, com o gancho batendo na tela no quadro 0.
- **Mapas com câmera viva**: zoom contínuo, leve rotação e "câmera na mão"; país em destaque com relevo 3D e brilho; satélite real nos mapas grandes; rotas que se desenham com cometa e brilho; pinos com pulso; HUD de coordenadas e escala.
- **Números em odômetro** (cada dígito rola), raios de luz, poeira e onda de choque no impacto.
- **Barras 3D isométricas**, **cortes laterais** (água com ondas, tuneladora girando, navio/trem que anda com a câmera seguindo), **linha do tempo** com ano rolando, **listas**, **comportas**, **salão 3D do G-Cans**.
- Transições zoom-through / whip / sobe com desfoque de movimento, flash curto no corte.
- Legenda karaokê (a palavra falada acende em âmbar), marcas d'água, barra de progresso, grão de filme e vinheta.
- Som: trilha sintetizada (100 bpm, Am–F–C–G) com ducking sob a voz, whoosh em cada corte, impacto nos números, tique no contador, pop nos pinos, riser antes da chamada final. Tudo normalizado a −14 LUFS.

## Fluxo
```bash
cd concrete-atlas
python3 motor/cenas.py videos/NNN-nome narrar    # (motor antigo) gera a voz Kokoro: v*.wav + narr.json
python3 motor/prep_motion.py videos/NNN-nome      # tempos, palavras, recortes de mapa e satélite
python3 motor/som.py NNN                          # trilha + efeitos + voz -> mix.wav
cd ../atlas-motion
python3 render.py NNN                             # 3D à parte (swangle) + vídeo (swiftshader) -> concrete-atlas/saida
node quadros.mjs NNN /tmp/q 0 120 400             # quadros soltos para revisar
```

## Tipos de cena (`tipo`)
`mapa` (bbox, destaque, pins, rota/rotas, estilo_rota, lacuna, enxame, numero, escuro, zoom, gancho) ·
`numero` (valor, decimais, prefixo, sufixo, label, nota, cor, fundo, segundo) · `barras` (itens, unidade, decimais) ·
`perfil` (yrange, agua, terreno, tunel, pocos, cotas, rotulos, caminho, nivel_mar) · `linha` (eventos) · `lista` (itens) ·
`secao` (circulos) · `comportas` (sobe, inicio) · `portoes` · `salao` (rotulos) · `cta`.

## Desempenho (2 CPUs, sem GPU)
- 2D: ~0,37 s por quadro. Globo 3D: ~2,3 s por quadro (60 quadros). Um Short de 35 s leva ~10 min.

## Instalação
```bash
cd motion && npm install
mkdir -p public/tex && cp node_modules/three-globe/example/img/{earth-blue-marble.jpg,earth-night.jpg,earth-topology.png,earth-water.png,night-sky.png} public/tex/
```
`render.py` e `quadros.mjs` usam o Chromium em /opt/pw-browsers (ajuste `browserExecutable` em `remotion.config.ts` e `quadros.mjs` se mudar de máquina).
