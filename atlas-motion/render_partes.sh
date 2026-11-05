#!/bin/bash
# Renderiza um vídeo longo em partes de 90 s (sem áudio), junta e coloca o mix.
# uso: ./render_partes.sh <id> <saida.mp4>
set -u
ID=$1; OUT=$2
cd /home/claude/atlas-motion
Q=$(python3 -c "import json;print(json.load(open('public/l/$ID/data.json'))['quadros'])")
P=/home/claude/render_tmp/$ID; mkdir -p $P
PASSO=2700
i=0; s=0
: > $P/lista.txt
while [ $s -lt $Q ]; do
  e=$(( s + PASSO - 1 )); [ $e -ge $Q ] && e=$(( Q - 1 ))
  f=$P/parte_$(printf %02d $i).mp4
  if [ ! -s $f ]; then
    npx remotion render src/index.ts Longo $f --props="{\"id\":\"$ID\"}" --frames=$s-$e --muted --concurrency=2 --crf=19 --log=error --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome 2>&1 | grep -v -iE "memory|docker|lower amount" | tail -3
  fi
  echo "file '$f'" >> $P/lista.txt
  # prévia com áudio de cada parte já pronta
  ffmpeg -y -loglevel error -i $f -ss $(python3 -c "print($s/30)") -t $(python3 -c "print(($e-$s+1)/30)") -i public/l/$ID/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $P/previa_$(printf %02d $i).mp4
  echo "PARTE $i ok ($s-$e de $Q)"
  i=$(( i + 1 )); s=$(( e + 1 ))
done
ffmpeg -y -loglevel error -f concat -safe 0 -i $P/lista.txt -i public/l/$ID/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $OUT
echo "FIM $OUT"
