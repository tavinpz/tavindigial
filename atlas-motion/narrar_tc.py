# Narração do Two Childhoods (Kokoro local). Uso: python3 narrar_tc.py public/tc/v01 [voz] [velocidade]
# Lê roteiro.json e gera voz_longo.wav (48k, tratada) e tempos.json. Bloco pode ter `pre` (silêncio antes, para o cartão de capítulo) e `gap` (respiro depois).
import json, subprocess, sys, wave
import numpy as np
from kokoro_onnx import Kokoro
pasta = sys.argv[1].rstrip('/'); VOZ = sys.argv[2] if len(sys.argv) > 2 else 'af_heart'; VEL = float(sys.argv[3]) if len(sys.argv) > 3 else 0.9
TTS = '/home/claude/tts'
k = Kokoro(f'{TTS}/kokoro-v1.0.onnx', f'{TTS}/voices-v1.0.bin')
if '+' in VOZ:  # mistura "voz1:0.6+voz2:0.4"
    voz = sum(k.get_voice_style(n.split(':')[0]) * float(n.split(':')[1]) for n in VOZ.split('+'))
else: voz = VOZ
rot = json.load(open(f'{pasta}/roteiro.json'))
sr = 24000; t = 0.5; partes = [np.zeros(int(sr * 0.5))]; blocos = []
for b in rot:
    ini = t; pre = b.get('pre', 0)
    if pre: partes.append(np.zeros(int(sr * pre))); t += pre
    falas = []
    for fl in b['falas']:
        txt = fl['txt']
        a, sr = k.create(txt, voice=voz, speed=VEL, lang='en-us')
        idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 240):idx[-1] + 600]
        falas.append({'t': round(t, 3), 'd': round(len(a) / sr, 3), 'txt': txt, 'v': fl.get('v', {}), 'dest': fl.get('dest', [])}); partes.append(a); t += len(a) / sr
        pausa = (0.5 if txt.rstrip('"').endswith(('.', '?')) else 0.22) + fl.get('p', 0)
        partes.append(np.zeros(int(sr * pausa))); t += pausa
    gap = b.get('gap', 0.45); partes.append(np.zeros(int(sr * gap))); t += gap
    blocos.append({**{x: b[x] for x in b if x != 'falas'}, 'ini': round(ini, 3), 'fim': round(t, 3), 'falas': falas})
partes.append(np.zeros(int(sr * 5.0))); t += 5.0  # cauda para o cartão final
cru = f'{pasta}/voz_cru.wav'
w = wave.open(cru, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((np.clip(np.concatenate(partes), -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
json.dump({'total': round(t, 3), 'blocos': blocos}, open(f'{pasta}/tempos.json', 'w'), indent=1)
CADEIA = ('highpass=f=80,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3400:t=q:w=1.2:g=2,deesser=i=0.4,'
          'acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=3,aecho=0.8:0.4:24|40:0.07|0.04,loudnorm=I=-16:TP=-1.5')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', cru, '-af', CADEIA, '-ar', '48000', f'{pasta}/voz_longo.wav'], check=True)
print('total', round(t, 1), 's =', f'{int(t//60)}:{int(t%60):02d}')
for b in blocos: print(f"{b.get('id',''):<10} {b['cena']:<8} {b['ini']:7.1f} {b['fim']:7.1f}")
