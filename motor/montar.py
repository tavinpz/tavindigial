"""Junta as cenas (c0.mp4, c1.mp4...) e a narração (v0.wav, v1.wav...) de uma pasta de vídeo.
Uso: python3 motor/montar.py videos/001-netherlands nome_final.mp4"""
import json, os, subprocess, sys
pasta, saida = sys.argv[1], sys.argv[2]
os.chdir(pasta)
n = json.load(open('narr.json')); dur = [d + 0.45 for d in n['dur']]; k = len(dur)
open('lista.txt', 'w').write(''.join(f"file 'c{i}.mp4'\n" for i in range(k)))
ins, filt, t = [], [], 0
for i, d in enumerate(dur):
    ins += ['-i', f'v{i}.wav']; ms = int((t + 0.12) * 1000); filt.append(f'[{i}:a]adelay={ms}|{ms}[a{i}]'); t += d
f = ';'.join(filt) + ';' + ''.join(f'[a{i}]' for i in range(k)) + f'amix=inputs={k}:normalize=0,apad,atrim=0:{t:.2f}[out]'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ins, '-filter_complex', f, '-map', '[out]', '-ar', '48000', 'narr.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-c', 'copy', 'video.tmp.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video.tmp.mp4', '-i', 'narr.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', 'final.tmp.mp4'], check=True)
os.replace('final.tmp.mp4', saida); print('ok', saida)
