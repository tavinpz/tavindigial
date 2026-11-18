#!/bin/bash
# teste curto: ./teste_arte.sh <id> <quadro_ini> <quadro_fim>  -> /home/claude/estudio/teste/<id>_teste.mp4 (com som)
cd /home/claude/atlas-motion
ID=$1; A=${2:-0}; B=${3:-1349}
CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
OUT=/home/claude/estudio/teste/${ID}_teste.mp4
npx remotion render src/index.ts Arte /home/claude/estudio/teste/${ID}_v.mp4 --props="{\"id\":\"$ID\",\"semAudio\":true}" --frames=$A-$B --muted --concurrency=2 --crf=21 --browser-executable=$CHROME > /home/claude/estudio/teste/${ID}.log 2>&1 || { echo ERRO; tail -5 /home/claude/estudio/teste/${ID}.log; exit 1; }
ffmpeg -y -loglevel error -i /home/claude/estudio/teste/${ID}_v.mp4 -ss $(python3 -c "print($A/30)") -t $(python3 -c "print(($B-$A+1)/30)") -i public/l/$ID/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest $OUT && echo OK $OUT
