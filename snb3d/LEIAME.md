# Strong Not Big: personagem 3D (teste de 18/11/2026)

`corpo.py` monta um corpo masculino a partir da malha CC0 do MakeHuman (via repositório mpfb2), aplica os alvos de músculo
e renderiza no Blender (módulo `bpy`, Cycles em CPU) com sombra chapada em três tons e traço Freestyle. ~30 s por imagem.

Preparar: `pip install bpy` e `git clone --depth 1 --filter=blob:none --no-checkout https://github.com/makehumancommunity/mpfb2 /home/claude/mh/mpfb`,
depois `git checkout HEAD -- src/mpfb/data/3dobjs/base.obj src/mpfb/data/rigs/standard/rig.default.json src/mpfb/data/targets/macrodetails`.

Uso: `python3 corpo.py -- '{"mix":{"universal-male-young-maxmuscle-averageweight":1.7,"caucasian-male-young":1.0},"saida":"/tmp/a.png"}'`
Opções: `cabelo` (cor), `estilo` (`espetado` ou `curto`), `faixa` (faixa vermelha), `compr`, `n`, `amostras`, `res`.

Falta: esqueleto para posar (rig.default.json + weights.default.json), rosto de anime e mais volume de músculo.
