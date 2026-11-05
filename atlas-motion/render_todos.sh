#!/bin/bash
# Renderiza os Shorts do Concrete Atlas com o motor de motion.
# uso: ./render_todos.sh 001 002 ...   (sem argumentos = todos os que têm data.json)
cd "$(dirname "$0")"
DEST=/home/claude/concrete-atlas/saida
mkdir -p "$DEST" saida
ids=("$@")
[ ${#ids[@]} -eq 0 ] && ids=($(ls public/v))
for id in "${ids[@]}"; do
  arq=$(python3 -c "import json;print(json.load(open('public/v/$id/data.json'))['arquivo'])")
  inicio=$(date +%s)
  npx remotion render src/index.ts Short "saida/$id.mp4" --props="{\"id\":\"$id\"}" --gl=swangle --concurrency=2 --crf=18 --timeout=240000 --log=error \
    2>&1 | grep -v -i "memory\|docker\|cgroup" | grep -v '^\s*$'
  if [ -s "saida/$id.mp4" ]; then
    cp "saida/$id.mp4" "$DEST/$arq"
    echo "OK $id -> $arq ($(( $(date +%s) - inicio ))s)"
  else
    echo "FALHOU $id"
  fi
done
