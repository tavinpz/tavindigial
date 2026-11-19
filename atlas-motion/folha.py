# Folha de contato do Hard to Copy: escolhe quadros (fim de cada fala que muda a tela), renderiza em 1/3 e monta folhas 4x3.
# Uso: python3 folha.py htc/vNN /tmp/saida   (rodar da raiz do render-videos)
import json, subprocess, sys, os, glob
from PIL import Image, ImageDraw
pasta, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
T = json.load(open(f'public/{pasta}/tempos.json')); qs = [2]; rot = ['q0']
for b in T['blocos']:
    fs = b['falas']
    for i, f in enumerate(fs):
        prox = fs[i + 1]['t'] if i + 1 < len(fs) else b['fim'] - 0.5
        muda = i == len(fs) - 1 or any(k in (fs[i + 1].get('v') or {}) for k in ('d', 'n', 'it', 'ab', 'l2', 't'))
        if muda: qs.append(int((prox - 0.12) * 30)); rot.append(f"{b['cena']}#{i}")
for f in glob.glob(f'{out}/q*.png'): os.remove(f)
subprocess.run(['node', '_stills_htc.mjs', os.getcwd() + '/src/index.ts', 'HTCVideo', ','.join(map(str, qs)), out, pasta], check=True)
arqs = sorted(glob.glob(f'{out}/q*.png')); W, H = Image.open(arqs[0]).size
for k in range(0, len(arqs), 12):
    folha = Image.new('RGB', (W * 4, (H + 22) * 3), '#000'); d = ImageDraw.Draw(folha)
    for j, a in enumerate(arqs[k:k + 12]):
        x, y = (j % 4) * W, (j // 4) * (H + 22); folha.paste(Image.open(a), (x, y + 22)); d.text((x + 6, y + 4), f"{rot[k + j]}  f{qs[k + j]}", fill='#fff')
    folha.save(f'{out}/folha_{k // 12:02d}.jpg', quality=82)
print(len(arqs), 'quadros', len(range(0, len(arqs), 12)), 'folhas')
