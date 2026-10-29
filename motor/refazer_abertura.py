"""Refaz só a cena 0 (gancho) de vídeos já renderizados e monta de novo. Uso: python3 motor/refazer_abertura.py videos/002-panama ..."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cenas as M
for pasta in sys.argv[1:]:
    pasta = os.path.abspath(pasta); spec = json.load(open(os.path.join(pasta, 'spec.json')))
    durs = [d + 0.45 for d in json.load(open(os.path.join(pasta, 'narr.json')))['dur']]
    M.render_cena(pasta, spec, 0, durs[0])
    M.montar(pasta, durs, os.path.join(M.RAIZ, 'saida', spec['arquivo'])); print('ok', spec['arquivo'])
