#!/bin/bash
# Mixagem do Hard to Copy: voz por cima, trilha abaixa quando há fala. Uso: ./mixar.sh public/htc/vNN  -> mix.m4a
P=$1
ffmpeg -y -v error -i $P/voz_longo.wav -i $P/sfx.wav -filter_complex "[0:a]aresample=48000,asplit=2[v][v2];[1:a]volume=0.55[s];[s][v]sidechaincompress=threshold=0.05:ratio=4:release=250[sd];[sd][v2]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]" -map "[a]" -c:a aac -b:a 192k $P/mix.m4a
ffmpeg -v info -i $P/mix.m4a -af ebur128=framelog=quiet -f null - 2>&1 | grep -E "I:|Duration" | head -3
