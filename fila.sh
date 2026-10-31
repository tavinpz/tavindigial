#!/bin/bash
# renderiza em ordem o que aparecer em fila.txt (uma id por linha); para com a linha FIM
cd /home/claude/thata-motion; touch fila.txt feitos.txt
while pgrep -f "python3 produzir3.py E1 C1" >/dev/null; do sleep 5; done
while true; do
  prox=$(grep -vxF -f feitos.txt fila.txt | head -1)
  if [ "$prox" = "FIM" ]; then echo "FILA FIM"; exit 0; fi
  if [ -z "$prox" ]; then sleep 10; continue; fi
  python3 produzir3.py $prox 2>&1 | grep -E "^OK|^ERRO"
  echo "$prox" >> feitos.txt
done
