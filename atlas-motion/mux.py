"""Põe o mix.wav no vídeo já renderizado (sem re-renderizar a imagem)."""
import json, os, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
DEST = '/home/claude/concrete-atlas/saida'
for vid in sys.argv[1:]:
    d = json.load(open(os.path.join(AQUI, 'public', 'v', vid, 'data.json')))
    final = os.path.join(DEST, d['arquivo']); tmp = final + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', final, '-i', os.path.join(AQUI, 'public', 'v', vid, 'mix.wav'), '-map', '0:v:0', '-map', '1:a:0',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, final); print('som ok', vid, flush=True)
