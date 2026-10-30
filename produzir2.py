"""Lote 2 (V5–V10): imagem (Remotion) + trilha 120 bpm/efeitos/voz -> saida/*.mp4 com áudio a -14 LUFS.

uso: python3 produzir2.py V5 V6 V7 V8 V9 V10
"""
import json, math, os, subprocess, sys
import numpy as np
import soundfile as sf

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, 'saida'); os.makedirs(SAIDA, exist_ok=True)
FPS = 30
V = {
    'V5': dict(dur=[105, 90, 150, 105, 120], arq='tavin_05_direct_sem_resposta.mp4', estilo=0,
               pops={0: [14, 26, 38, 50], 2: [30, 70, 110], 3: [18, 46]},
               falas=['Cada quanto custa que fica sem resposta é um cliente a menos.', 'Ele não espera. Ele vai pro próximo da lista.',
                      'Com uma página, ele vê serviços, preços e horários sem precisar te perguntar nada.', 'E chega no seu WhatsApp pronto pra marcar.',
                      'Peça a prévia grátis da sua página. Me chama no direct.']),
    'V6': dict(dur=[60, 105, 75, 120, 105], arq='tavin_06_concorrente_parece_melhor.mp4', estilo=1, pops={1: [14, 30], 3: [34, 46, 58, 75, 83, 91, 99]}),
    'V7': dict(dur=[90, 150, 105, 90, 105], arq='tavin_07_no_ar_em_24h.mp4', estilo=2, pops={1: [10, 40, 70, 100], 3: [30, 45, 60]}),
    'V8': dict(dur=[90, 105, 75, 105, 90, 120], arq='tavin_08_motion_para_sua_marca.mp4', estilo=1, pops={2: [0, 15, 30, 45, 60], 3: [8, 36, 64], 4: [18, 34, 50]}),
    'V9': dict(dur=[90, 120, 135, 105, 105], arq='tavin_09_post_bonito_nao_vende.mp4', estilo=2, pops={1: [22, 42, 62], 2: [10, 22, 34]},
               falas=['Post bonito não paga boleto.', 'O que vende é o post que explica o que você faz, pra quem é e como marcar.',
                      'A gente cria carrosséis, artes e Reels com a sua marca.', 'Todo mês. Você aprova e a gente programa.',
                      'Me chama no direct e pede um exemplo com a sua marca.']),
    'V10': dict(dur=[90, 75, 165, 105, 105], arq='tavin_10_google_sem_avaliacoes.mp4', estilo=0, pops={2: [16, 28, 40, 52, 66]},
                falas=['Nota quatro vírgula um, e só nove avaliações. O cliente nem clica.', 'Ele escolhe quem passa mais confiança.',
                       'A gente deixa o seu perfil do Google completo, com fotos, horários e serviços, e automatiza o pedido de avaliação depois de cada atendimento.',
                       'E deixa o seu negócio pronto pra ser recomendado, até pelas IAs.', 'Me chama no direct e arruma o seu Google com a gente.']),
}
_k = None


def voz(cfg, comp):
    global _k
    from kokoro_onnx import Kokoro
    if _k is None:
        m = '/home/claude/concrete-atlas/modelo'; _k = Kokoro(f'{m}/kokoro-v1.0.onnx', f'{m}/voices-v1.0.bin')
    dur, falas, partes, t = [], [], [], 0.0
    for base, texto in zip(cfg['dur'], cfg['falas']):
        a, sr = _k.create(texto, voice='pm_alex', speed=1.12, lang='pt-br')
        n = max(base, math.ceil((len(a) / sr + 0.6) * FPS / 15) * 15)  # sempre múltiplo de uma batida
        ini = t + 0.12
        partes.append((ini, a, sr)); falas.append({'ini': round(ini, 3), 'fim': round(ini + len(a) / sr, 3), 'texto': texto})
        dur.append(n); t += n / FPS
    buf = np.zeros(int(t * 48000) + 48000)
    for ini, a, sr in partes:
        a = np.interp(np.arange(int(len(a) * 48000 / sr)) / 48000, np.arange(len(a)) / sr, a)
        i = int(ini * 48000); buf[i:i + len(a)] += a
    caminho = os.path.join(SAIDA, f'voz_{comp}.wav'); sf.write(caminho, buf, 48000)
    return dur, falas, caminho


def render(comp):
    cfg = V[comp]
    vz = None; props = {'dur': cfg['dur']}
    dur = cfg['dur']
    if cfg.get('falas'):
        dur, falas, vz = voz(cfg, comp); props = {'dur': dur, 'falas': falas}
    mudo = os.path.join(SAIDA, f'{comp}_mudo.mp4')
    r = subprocess.run(['npx', 'remotion', 'render', 'src/index.ts', comp, mudo, f'--props={json.dumps(props)}', '--crf=16', '--muted',
                        '--gl=swiftshader', '--concurrency=2', '--timeout=240000', '--log=error'], cwd=AQUI, capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError(r.stderr[-1500:])
    inicios = np.cumsum([0] + dur[:-1]) / FPS
    pops = [inicios[c] + f / FPS for c, fs in cfg.get('pops', {}).items() for f in fs]
    wav = os.path.join(SAIDA, f'{comp}.wav')
    conf = {'saida': wav, 'dur': sum(dur) / FPS, 'cortes': list(inicios[1:]), 'pops': pops, 'riser': float(inicios[-1]), 'voz': vz, 'estilo': cfg['estilo']}
    json.dump(conf, open(os.path.join(SAIDA, f'{comp}.json'), 'w'), default=float)
    subprocess.run(['python3', os.path.join(AQUI, 'audio2.py'), os.path.join(SAIDA, f'{comp}.json')], check=True, cwd=AQUI)
    final = os.path.join(SAIDA, cfg['arq'])
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mudo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', final], check=True)
    os.remove(mudo)
    print('OK', comp, final, f'{sum(dur) / FPS:.1f}s', flush=True)


if __name__ == '__main__':
    for c in sys.argv[1:]:
        try: render(c)
        except Exception as e: print('ERRO', c, str(e)[-1500:], flush=True)
