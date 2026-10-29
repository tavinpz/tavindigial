"""Refaz cenas específicas e monta de novo. Uso: python3 motor/refazer.py videos/006-gotthard 4 [5 ...]"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cenas as M
pasta = os.path.abspath(sys.argv[1]); idx = [int(i) for i in sys.argv[2:]]
spec = json.load(open(os.path.join(pasta, 'spec.json')))
durs = [d + 0.45 for d in json.load(open(os.path.join(pasta, 'narr.json')))['dur']]
for i in idx: M.render_cena(pasta, spec, i, durs[i])
M.montar(pasta, durs, os.path.join(M.RAIZ, 'saida', spec['arquivo'])); print('ok', spec['arquivo'])
