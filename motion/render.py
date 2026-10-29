"""Renderiza um Short do Concrete Atlas.

1. Camadas 3D (globo de abertura e salão do G-Cans) são pré-renderizadas à parte com WebGL por software (swangle).
2. O vídeo inteiro é renderizado com composição rápida (swiftshader), usando essas camadas como vídeo.
3. Sai com o áudio mixado (voz + trilha + efeitos, -14 LUFS) direto em concrete-atlas/saida.

uso: python3 render.py 002 [003 ...]
"""
import json, os, subprocess, sys, time

AQUI = os.path.dirname(os.path.abspath(__file__))
DEST = '/home/claude/concrete-atlas/saida'


def remotion(args, gl):
    cmd = ['npx', 'remotion', 'render', 'src/index.ts', *args, f'--gl={gl}', '--concurrency=2', '--timeout=240000', '--log=error']
    r = subprocess.run(cmd, cwd=AQUI, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-1500:] + r.stdout[-500:])


def render(vid):
    pasta = os.path.join(AQUI, 'public', 'v', vid)
    d = json.load(open(os.path.join(pasta, 'data.json')))
    t0 = time.time()
    c0 = d['cenas'][0]
    if c0['tipo'] == 'mapa' and c0.get('gancho') and not os.path.exists(os.path.join(pasta, 'globo.mp4')):
        alvo = c0.get('globo') or [(c0['bbox'][2] + c0['bbox'][3]) / 2, (c0['bbox'][0] + c0['bbox'][1]) / 2]
        remotion(['Globo3D', os.path.join(pasta, 'globo.mp4'), f'--props={json.dumps({"lat": alvo[0], "lon": alvo[1]})}', '--crf=12', '--muted'], 'swangle')
        print(f'  {vid} globo ok {time.time() - t0:.0f}s', flush=True)
    for c, t in zip(d['cenas'], d['tempos']):
        if c['tipo'] == 'salao' and not os.path.exists(os.path.join(pasta, 'salao.mp4')):
            dur = round(t['fim'] * 30) - round(t['ini'] * 30)
            remotion(['Salao3D', os.path.join(pasta, 'salao.mp4'), f'--props={json.dumps({"dur": dur, "n": dur + 8})}', '--crf=14', '--muted'], 'swangle')
            print(f'  {vid} salão ok {time.time() - t0:.0f}s', flush=True)
    final = os.path.join(DEST, d['arquivo'])
    remotion(['Short', final, f'--props={json.dumps({"id": vid, "pre3d": True})}', '--crf=18', '--audio-codec=aac', '--audio-bitrate=192k'], 'swiftshader')
    print(f'OK {vid} -> {os.path.basename(final)} ({time.time() - t0:.0f}s)', flush=True)


if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    for v in sys.argv[1:]:
        try:
            render(v)
        except Exception as e:
            print('ERRO', v, str(e)[-1200:], flush=True)
