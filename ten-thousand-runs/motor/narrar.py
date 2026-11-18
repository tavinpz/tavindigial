"""Voz Kokoro por fala: videos/<pasta>/voz/fNNN.wav + narr.json (pula falas já geradas com o mesmo texto)."""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

MOD = '/home/claude/concrete-atlas/modelo'
CADEIA = ('highpass=f=70,equalizer=f=140:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser=i=0.4,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3')

def narrar(pasta):
    spec = json.load(open(os.path.join(pasta, 'spec.json')))
    falas = [f for b in spec['blocos'] for f in b['falas']]
    os.makedirs(os.path.join(pasta, 'voz'), exist_ok=True)
    narr_p = os.path.join(pasta, 'narr.json')
    velho = json.load(open(narr_p)) if os.path.exists(narr_p) else {'lines': [], 'dur': []}
    piper = spec.get('motor') == 'piper'
    if piper:
        sys.path.insert(0, '/home/claude/estudio-longo/vozes')
        import voz_piper
    else:
        k = Kokoro(os.path.join(MOD, 'kokoro-v1.0.onnx'), os.path.join(MOD, 'voices-v1.0.bin'))
    dur = []
    for i, f in enumerate(falas):
        arq = os.path.join(pasta, 'voz', f'f{i:03d}.wav')
        if i < len(velho['lines']) and velho['lines'][i] == f and os.path.exists(arq):
            dur.append(velho['dur'][i]); continue
        if piper:
            a, sr = voz_piper.falar(f, spec.get('voz', 'm'), spec.get('velocidade', 1.0))
        else:
            v = spec.get('voz', 'am_michael')
            if v == 'cw':  # voz do Crosswind aprovada pelo Tavin: Michael 60% + Fenrir 40%
                v = k.get_voice_style('am_michael') * 0.6 + k.get_voice_style('am_fenrir') * 0.4
            a, sr = k.create(f, voice=v, speed=spec.get('velocidade', 1.0), lang=spec.get('lang', 'en-us'))
            idx = np.where(np.abs(a) > 0.01)[0]
            if len(idx): a = a[max(0, idx[0] - 240):idx[-1] + 600]
        sf.write(arq, a, sr)
        if spec.get('tratar', True):  # mesmo tratamento de voz do Crosswind (EQ, de-esser, compressor), sem loudnorm por fala
            tmp = arq + '.t.wav'
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', arq, '-af', CADEIA, '-ar', str(sr), tmp], check=True)
            os.replace(tmp, arq); a, sr = sf.read(arq, dtype='float32')
        dur.append(len(a) / sr)
        print(i, round(dur[-1], 1), flush=True)
    json.dump({'lines': falas, 'dur': dur}, open(narr_p, 'w'))
    print('total', round(sum(dur) / 60, 2), 'min')

if __name__ == '__main__':
    narrar(os.path.abspath(sys.argv[1]))
