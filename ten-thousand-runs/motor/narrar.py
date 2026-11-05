"""Voz Kokoro por fala: videos/<pasta>/voz/fNNN.wav + narr.json (pula falas já geradas com o mesmo texto)."""
import json, os, sys
import soundfile as sf
from kokoro_onnx import Kokoro

MOD = '/home/claude/concrete-atlas/modelo'

def narrar(pasta):
    spec = json.load(open(os.path.join(pasta, 'spec.json')))
    falas = [f for b in spec['blocos'] for f in b['falas']]
    os.makedirs(os.path.join(pasta, 'voz'), exist_ok=True)
    narr_p = os.path.join(pasta, 'narr.json')
    velho = json.load(open(narr_p)) if os.path.exists(narr_p) else {'lines': [], 'dur': []}
    piper = spec.get('motor') == 'piper'
    if piper:
        sys.path.insert(0, '/home/claude/zerando')
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
            a, sr = k.create(f, voice=spec.get('voz', 'am_michael'), speed=spec.get('velocidade', 1.0), lang=spec.get('lang', 'en-us'))
        sf.write(arq, a, sr); dur.append(len(a) / sr)
        print(i, round(dur[-1], 1), flush=True)
    json.dump({'lines': falas, 'dur': dur}, open(narr_p, 'w'))
    print('total', round(sum(dur) / 60, 2), 'min')

if __name__ == '__main__':
    narrar(os.path.abspath(sys.argv[1]))
