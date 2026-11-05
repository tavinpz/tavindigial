#!/bin/bash
# fila de renders: espera o Rio terminar, depois renderiza cada id que tiver data.json e ainda não tiver saída
until [ -s /home/claude/quanto-voce-dura/qvd001_rio1904.mp4 ]; do sleep 30; done
for par in "lss002:/home/claude/last-state-standing/lss002_casa.mp4" "ttr002:/home/claude/ten-thousand-runs/saida/ttr002_batalha.mp4"; do
  id=${par%%:*}; out=${par#*:}
  [ -s "$out" ] && continue
  until [ -s public/l/$id/mix.wav ]; do sleep 30; done
  ./render_partes.sh $id $out
done
echo FILA_OK
