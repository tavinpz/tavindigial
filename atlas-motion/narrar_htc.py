# Narração do Hard to Copy.
# Uso: python3 narrar_snb.py public/snb/v01 [velocidade]  -> lê roteiro.json, gera voz_longo.wav (48k, tratada) e tempos.json
# Cada fala pode ser texto puro ou {txt, p (pausa extra em s), v (o que aparece na tela, copiado para o tempos.json)}.
# Requisitos: pip install --break-system-packages kokoro-onnx ; modelo em /home/claude/tts (ver CROSSWIND.md)
import json, subprocess, sys, wave
import numpy as np
from kokoro_onnx import Kokoro

pasta = sys.argv[1].rstrip('/'); VEL = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
TTS = '/home/claude/tts'
k = Kokoro(f'{TTS}/kokoro-v1.0.onnx', f'{TTS}/voices-v1.0.bin')
voz = k.get_voice_style('am_michael') * 0.6 + k.get_voice_style('am_fenrir') * 0.4  # 1ª versão do Hard to Copy: a mistura aprovada no Crosswind (trocar aqui se o Tavin escolher outra)

rot = json.load(open(f'{pasta}/roteiro.json'))
sr = 24000; t = 0.6; partes = [np.zeros(int(sr * 0.6))]; blocos = []
for bi, b in enumerate(rot):
    falas = []; ini = t
    for fl in b['falas']:
        fl = fl if isinstance(fl, dict) else {'txt': fl}; txt = fl['txt']
        a, sr = k.create(txt, voice=voz, speed=VEL, lang='en-us')
        idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 240):idx[-1] + 600]
        falas.append({'t': round(t, 3), 'd': round(len(a) / sr, 3), 'txt': txt, 'v': fl.get('v', {})}); partes.append(a); t += len(a) / sr
        pausa = (0.42 if txt.endswith(('.', '?')) else 0.25) + fl.get('p', 0)
        partes.append(np.zeros(int(sr * pausa))); t += pausa
    extra = 0.5  # respiro entre blocos
    partes.append(np.zeros(int(sr * extra))); t += extra
    blocos.append({'cena': b['cena'], 'trava': b.get('trava'), 'nome': b.get('nome'), 'fonte': b.get('fonte'), 'ini': round(ini, 3), 'fim': round(t, 3), 'falas': falas})
partes.append(np.zeros(int(sr * 4.0))); t += 4.0  # cauda para o cartão final

cru = f'{pasta}/voz_cru.wav'
w = wave.open(cru, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((np.clip(np.concatenate(partes), -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
json.dump({'total': round(t, 3), 'blocos': blocos}, open(f'{pasta}/tempos.json', 'w'), indent=1)

CADEIA = ('highpass=f=70,equalizer=f=140:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser=i=0.4,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3,aecho=0.8:0.5:28|46:0.10|0.06,'
          'loudnorm=I=-16:TP=-1.5')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', cru, '-af', CADEIA, '-ar', '48000', f'{pasta}/voz_longo.wav'], check=True)
print('total', round(t, 1), 's')
for b in blocos: print(f"{b['cena']:<12} {b['ini']:7.1f} {b['fim']:7.1f}")
