"""Confere se cada fala cabe na janela (com aceleração até 1.22x). uso: python3 checa_voz.py G1 G2 ..."""
import sys, json, subprocess
from kokoro_onnx import Kokoro
import produzir3 as P
m = '/home/claude/concrete-atlas/modelo'; k = Kokoro(f'{m}/kokoro-v1.0.onnx', f'{m}/voices-v1.0.bin')
for comp in sys.argv[1:]:
    r = subprocess.run(['node', 'narra.mjs', comp], cwd=P.AQUI, capture_output=True, text=True)
    for ini, lim, texto, *_ in json.loads(r.stdout.strip().splitlines()[-1]):
        a, sr = k.create(texto, voice=P.VOZES['n'], speed=1.0, lang='pt-br')
        d, cabe = len(a) / sr, (lim - ini) / P.FPS
        if d / 1.22 > cabe + 0.05: print(f'{comp} ESTOURA {d/1.22:.2f}s > {cabe:.2f}s  [{ini}] {texto}')
        elif d > cabe: print(f'{comp} acelera {d/cabe:.2f}x  [{ini}] {texto}')
    print(comp, 'ok', flush=True)
