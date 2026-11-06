#!/usr/bin/env python3
"""Re-renderiza só trechos de quadros de um vídeo Arte já feito em partes e regrava as partes afetadas.
uso: remendo_arte.py <id> a-b [a-b ...]     (quadros globais, inclusivos)
Depois rode render_arte.sh <id> (com a saída antiga removida) para juntar as partes de novo."""
import subprocess, sys, os, shutil
ID = sys.argv[1]
faixas = [tuple(map(int, x.split('-'))) for x in sys.argv[2:]]
PASSO = 2700
P = f'/home/claude/render_tmp/{ID}'
CHROME = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'
os.chdir('/home/claude/atlas-motion')

# divide as faixas por parte
por_parte = {}
for a, b in faixas:
    while a <= b:
        i = a // PASSO
        fim = min(b, (i + 1) * PASSO - 1)
        por_parte.setdefault(i, []).append((a, fim))
        a = fim + 1

for i, fx in sorted(por_parte.items()):
    parte = f'{P}/parte_{i:02d}.mp4'
    S = i * PASSO
    segs = []
    for k, (a, b) in enumerate(fx):
        seg = f'{P}/remendo_{i:02d}_{k}.mp4'
        if not os.path.exists(seg):
            subprocess.run(['npx', 'remotion', 'render', 'src/index.ts', 'Arte', f'{P}/tmp_r.mp4',
                            f'--props={{"id":"{ID}","semAudio":true}}', f'--frames={a}-{b}', '--muted',
                            '--concurrency=2', '--crf=19', '--log=error', f'--browser-executable={CHROME}'], check=True)
            shutil.move(f'{P}/tmp_r.mp4', seg)
        segs.append((a - S, b - S, seg))
    # monta: original até o trecho, trecho novo, original depois... (cada pedaço do original é uma
    # entrada própria, para o ffmpeg não guardar a parte inteira na memória)
    ins, fil, cad, pos = [], [], [], 0
    def entrada(arq):
        ins.extend(['-i', arq]); return len(ins) // 2 - 1
    for k, (la, lb, s) in enumerate(segs):
        if la > pos:
            j = entrada(parte); fil.append(f'[{j}:v]trim=start_frame={pos}:end_frame={la},setpts=PTS-STARTPTS[o{k}]'); cad.append(f'[o{k}]')
        j = entrada(s); fil.append(f'[{j}:v]setpts=PTS-STARTPTS[n{k}]'); cad.append(f'[n{k}]')
        pos = lb + 1
    if pos < 2700:
        j = entrada(parte); fil.append(f'[{j}:v]trim=start_frame={pos},setpts=PTS-STARTPTS[fim]'); cad.append('[fim]')
    fil.append(''.join(cad) + f'concat=n={len(cad)}:v=1:a=0[v]')
    novo = f'{P}/parte_{i:02d}_nova.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ins, '-filter_complex', ';'.join(fil), '-map', '[v]',
                    '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-profile:v', 'high', '-pix_fmt', 'yuvj420p',
                    '-r', '30', '-video_track_timescale', '90000', novo], check=True)
    q = lambda f: subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
                                  'stream=nb_read_frames', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip().strip(',')
    qa, qn = q(parte), q(novo)
    if qa != qn:
        sys.exit(f'ERRO parte {i}: {qa} quadros antes, {qn} depois')
    os.makedirs(f'{P}/velho', exist_ok=True)
    shutil.move(parte, f'{P}/velho/parte_{i:02d}.mp4')
    shutil.move(novo, parte)
    print(f'REMENDO {ID} parte {i} ok ({qa} quadros)', flush=True)
print('REMENDO FIM', flush=True)
