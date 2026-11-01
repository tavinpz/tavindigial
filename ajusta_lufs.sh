#!/bin/bash
# ajusta_lufs.sh arq.mp4 → corrige o volume para -14,5 LUFS (só o áudio; o vídeo é copiado)
f=$1; I=$(ffmpeg -nostats -i "$f" -af ebur128=framelog=quiet -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1)
g=$(python3 -c "print(round(-14.5-($I),2))")
if python3 -c "import sys;sys.exit(0 if abs($g)>0.25 else 1)"; then
  ffmpeg -y -v error -i "$f" -c:v copy -af "volume=${g}dB,alimiter=limit=0.89:level=false" -c:a aac -b:a 192k -movflags +faststart "${f%.mp4}_t.mp4" && mv "${f%.mp4}_t.mp4" "$f"
fi
echo "$f antes $I ganho $g depois $(ffmpeg -nostats -i "$f" -af ebur128=framelog=quiet -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1)"
