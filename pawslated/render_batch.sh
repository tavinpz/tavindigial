#!/bin/bash
cd /home/claude/pawslated
run() { for n in "$@"; do python3 episodes5.py $n render 2>&1 | grep -v Fontconfig | sed "s/^/[$n] /"; done; }
run 12 14 16 18 20 &
run 13 15 17 19 21 &
wait
echo ALL DONE
