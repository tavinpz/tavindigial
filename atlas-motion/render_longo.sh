#!/bin/bash
# uso: ./render_longo.sh ttr001 /caminho/saida.mp4
cd /home/claude/atlas-motion
npx remotion render src/index.ts Longo "$2" --props="{\"id\":\"$1\"}" --concurrency=2 --crf=20 --audio-codec=aac --audio-bitrate=192k --timeout=240000 --log=error --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome 2>&1 | grep -v -iE "memory|docker|lower amount" | tail -5
echo FIM $?
