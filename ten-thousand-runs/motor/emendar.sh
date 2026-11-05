#!/bin/bash
# Troca a abertura: novo gancho + vídeo original a partir do início da Parte 1 (com 0,2 s de cross-fade no áudio).
# uso: emendar.sh gancho.mp4 original.mp4 segundo_de_corte saida.mp4
G=$1; O=$2; T=$3; S=$4
ffmpeg -y -loglevel error -i "$G" -ss "$T" -i "$O" -filter_complex "[0:v]fps=30,format=yuv420p,setsar=1[v0];[1:v]fps=30,format=yuv420p,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v];[0:a][1:a]acrossfade=d=0.2[a]" -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 19 -c:a aac -b:a 192k -movflags +faststart "$S"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$S"
