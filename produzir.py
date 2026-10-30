"""Renderiza os vídeos da Tavin Digital: imagem (Remotion) + trilha/efeitos/voz (audio.py) -> saida/*.mp4

uso: python3 produzir.py V1Previa V2Bio V3Edicao V4Servicos V1Voz
"""
import json, math, os, subprocess, sys
import numpy as np
import soundfile as sf

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, 'saida'); os.makedirs(SAIDA, exist_ok=True)
FPS = 30
DUR = {'V1Previa': [90, 120, 240, 90, 120, 120], 'V2Bio': [90, 150, 180, 120, 150], 'V3Edicao': [90, 210, 180, 150], 'V4Servicos': [90, 300, 150, 120]}
ARQ = {'V1Previa': 'tavin_01_previa_gratis.mp4', 'V1Voz': 'tavin_01_previa_gratis_com_voz.mp4', 'V2Bio': 'tavin_02_link_da_bio.mp4',
       'V3Edicao': 'tavin_03_edicao_de_video.mp4', 'V4Servicos': 'tavin_04_servicos.mp4'}
FALAS_V1 = [
    'Eu faço a página do seu negócio antes de você pagar.',
    'Você me manda só o nome.',
    'E eu monto tudo: os seus serviços com preço, a agenda pelo WhatsApp, a nota do Google e como chegar.',
    'Pra qualquer tipo de negócio.',
    'Gostou? Aí sim você paga. Página da bio por cento e quarenta e sete reais. Site completo, quatrocentos e noventa e sete.',
    'Comenta prévia, ou me chama no direct.',
]


def voz_v1():
    from kokoro_onnx import Kokoro
    m = '/home/claude/concrete-atlas/modelo'
    k = Kokoro(f'{m}/kokoro-v1.0.onnx', f'{m}/voices-v1.0.bin')
    dur, partes, falas = [], [], []
    t = 0.0
    for base, texto in zip(DUR['V1Previa'], FALAS_V1):
        a, sr = k.create(texto, voice='pm_alex', speed=1.1, lang='pt-br')
        n = max(base, math.ceil((len(a) / sr + 0.55) * FPS))
        ini = t + 0.15
        partes.append((ini, a, sr)); falas.append({'ini': round(ini, 3), 'fim': round(ini + len(a) / sr, 3), 'texto': texto})
        dur.append(n); t += n / FPS
    buf = np.zeros(int(t * 48000) + 48000)
    for ini, a, sr in partes:
        a = np.interp(np.arange(int(len(a) * 48000 / sr)) / 48000, np.arange(len(a)) / sr, a)
        i = int(ini * 48000); buf[i:i + len(a)] += a
    caminho = os.path.join(SAIDA, 'voz_v1.wav'); sf.write(caminho, buf, 48000)
    return dur, falas, caminho


def render(comp):
    voz = None; props = {}
    if comp == 'V1Voz':
        dur, falas, voz = voz_v1(); props = {'dur': dur, 'falas': falas}; id_ = 'V1Previa'
    else:
        dur = DUR[comp]; props = {'dur': dur}; id_ = comp
    mudo = os.path.join(SAIDA, f'{comp}_mudo.mp4')
    cmd = ['npx', 'remotion', 'render', 'src/index.ts', id_, mudo, f'--props={json.dumps(props)}', '--crf=17', '--muted',
           '--gl=swiftshader', '--concurrency=2', '--timeout=240000', '--log=error']
    r = subprocess.run(cmd, cwd=AQUI, capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError(r.stderr[-1500:])
    total = sum(dur) / FPS
    cortes = []; t = 0
    for d in dur[:-1]: t += d; cortes.append(t / FPS)
    wav = os.path.join(SAIDA, f'{comp}.wav')
    subprocess.run(['python3', os.path.join(AQUI, 'audio.py'), wav, f'{total:.3f}', ','.join(f'{c:.3f}' for c in cortes)] + ([voz] if voz else []), check=True)
    final = os.path.join(SAIDA, ARQ[comp])
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mudo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', '-shortest', final], check=True)
    os.remove(mudo)
    print('OK', comp, final, f'{total:.1f}s', flush=True)


if __name__ == '__main__':
    for c in sys.argv[1:]:
        try: render(c)
        except Exception as e: print('ERRO', c, str(e)[-1500:], flush=True)
