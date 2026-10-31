"""Lote 3 ("leve"): imagem (Remotion) + trilha suave/efeitos de interface/voz -> saida/*.mp4 (-14 LUFS).

uso: python3 produzir3.py L1 L2 ...
Vídeos só com música: os efeitos vêm de FX_<comp> exportado no .tsx (lidos via fx_<comp>.json gerado pelo node).
Vídeos com voz: as falas definem a duração de cada parte (props.dur) e a legenda (props.falas).
"""
import json, math, os, subprocess, sys
import numpy as np
import soundfile as sf

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, 'saida'); os.makedirs(SAIDA, exist_ok=True)
FPS = 30
V = json.load(open(os.path.join(AQUI, 'lote3.json')))
_k = None


def voz(cfg, comp):
    global _k
    from kokoro_onnx import Kokoro
    if _k is None:
        m = '/home/claude/concrete-atlas/modelo'; _k = Kokoro(f'{m}/kokoro-v1.0.onnx', f'{m}/voices-v1.0.bin')
    dur, falas, partes, t = [], [], [], 0.0
    for base, texto in zip(cfg['dur'], cfg['falas']):
        a, sr = _k.create(texto, voice='pm_alex', speed=cfg.get('vel', 1.1), lang='pt-br')
        n = max(base, math.ceil((len(a) / sr + 0.55) * FPS))
        ini = t + 0.15
        partes.append((ini, a, sr)); falas.append({'ini': round(ini, 3), 'fim': round(ini + len(a) / sr, 3), 'texto': texto})
        dur.append(n); t += n / FPS
    buf = np.zeros(int(t * 48000) + 48000)
    for ini, a, sr in partes:
        a = np.interp(np.arange(int(len(a) * 48000 / sr)) / 48000, np.arange(len(a)) / sr, a)
        i = int(ini * 48000); buf[i:i + len(a)] += a
    caminho = os.path.join(SAIDA, f'voz_{comp}.wav'); sf.write(caminho, buf, 48000)
    return dur, falas, caminho


def fx_de(comp, props):
    # pede ao próprio projeto a lista de efeitos (em quadros) já com as durações finais
    r = subprocess.run(['node', 'fx.mjs', comp, json.dumps(props)], cwd=AQUI, capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError(r.stderr[-1500:])
    return json.loads(r.stdout.strip().splitlines()[-1])


def render(comp):
    cfg = V[comp]
    props, vz = {}, None
    if cfg.get('falas'):
        dur, falas, vz = voz(cfg, comp); props = {'dur': dur, 'falas': falas}
    mudo = os.path.join(SAIDA, f'{comp}_mudo.mp4')
    r = subprocess.run(['npx', 'remotion', 'render', 'src/index.ts', comp, mudo, f'--props={json.dumps(props)}', '--crf=17', '--muted',
                        '--gl=' + cfg.get('gl', 'swiftshader'), '--concurrency=2', '--timeout=300000', '--log=error'], cwd=AQUI, capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError(r.stderr[-1500:])
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mudo], capture_output=True, text=True).stdout)
    fx = [[t, q / FPS] for t, q in fx_de(comp, props)]
    wav = os.path.join(SAIDA, f'{comp}.wav')
    conf = {'saida': wav, 'dur': total, 'fx': fx, 'voz': vz, 'estilo': cfg.get('estilo', 0), 'quebras': [q / FPS for q in cfg.get('quebras', [])], 'intro': cfg.get('intro', 1), 'secoes': [[c, a / FPS, b / FPS] for c, a, b in cfg.get('secoes', [])]}
    json.dump(conf, open(os.path.join(SAIDA, f'{comp}.json'), 'w'))
    subprocess.run(['python3', os.path.join(AQUI, cfg.get('audio', 'audio3.py')), os.path.join(SAIDA, f'{comp}.json')], check=True, cwd=AQUI)
    final = os.path.join(SAIDA, cfg['arq'])
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mudo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
                    '-maxrate', '9M', '-bufsize', '18M', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-14.5:TP=-2:LRA=11,aresample=48000,alimiter=limit=0.78:level=false',
                    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', final], check=True)
    os.remove(mudo)
    print('OK', comp, final, f'{total:.1f}s', flush=True)


if __name__ == '__main__':
    for c in sys.argv[1:]:
        try: render(c)
        except Exception as e: print('ERRO', c, str(e)[-1500:], flush=True)
