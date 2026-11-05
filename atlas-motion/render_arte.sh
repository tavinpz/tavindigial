#!/bin/bash
# renderiza testes da composição Arte, um de cada vez, e coloca o mix
cd /home/claude/atlas-motion
for ID in "$@"; do
  OUT=/home/claude/estudio/saida/$ID.mp4
  [ -s $OUT ] && continue
  npx remotion render src/index.ts Arte /tmp/claude-0/${ID}_v.mp4 --props="{\"id\":\"$ID\",\"semAudio\":true}" --muted --concurrency=2 --crf=19 --log=info --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome 2>&1 > /home/claude/estudio/prog_$ID.log 2>&1
  ffmpeg -y -loglevel error -i /tmp/claude-0/${ID}_v.mp4 -i public/l/$ID/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $OUT && echo "OK $ID $(date +%T)"
done
echo FIM
