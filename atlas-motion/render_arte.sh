#!/bin/bash
# Renderiza vídeos da composição Arte em partes de 2.700 quadros (90 s), retomando de onde parou
# (tarefa em segundo plano morre em 2 h: é só relançar). Depois junta as partes e coloca o mix.
# uso: ./render_arte.sh <id> [<id> ...]      saída: /home/claude/estudio/saida/<id>.mp4
cd /home/claude/atlas-motion
CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
for ID in "$@"; do
  OUT=/home/claude/estudio/saida/$ID.mp4
  [ -s $OUT ] && continue
  Q=$(python3 -c "import json;print(json.load(open('public/l/$ID/data.json'))['quadros'])")
  P=/home/claude/render_tmp/$ID; mkdir -p $P
  PASSO=2700; i=0; s=0
  : > $P/lista.txt
  while [ $s -lt $Q ]; do
    e=$(( s + PASSO - 1 )); [ $e -ge $Q ] && e=$(( Q - 1 ))
    f=$P/parte_$(printf %02d $i).mp4
    if [ ! -s $f ]; then
      npx remotion render src/index.ts Arte $P/tmp.mp4 --props="{\"id\":\"$ID\",\"semAudio\":true}" --frames=$s-$e --muted --concurrency=2 --crf=19 --log=info --browser-executable=$CHROME > /home/claude/estudio/prog_$ID.log 2>&1 \
        && mv $P/tmp.mp4 $f
    fi
    [ -s $f ] || { echo "ERRO $ID parte $i"; exit 1; }
    echo "file '$f'" >> $P/lista.txt
    echo "PARTE $ID $i ok ($s-$e de $Q) $(date +%T)"
    i=$(( i + 1 )); s=$(( e + 1 ))
  done
  ffmpeg -y -loglevel error -f concat -safe 0 -i $P/lista.txt -i public/l/$ID/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $OUT && echo "OK $ID $(date +%T)"
done
echo FIM
