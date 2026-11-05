"""escolhe partidas de exemplo perto da mediana, no mesmo tabuleiro, e monta histogramas"""
import json, numpy as np
from batalha import posicionar, jogar
d = json.load(open('batalha.json'))
alvo = {'aleatorio': 97, 'caca': 66, 'paridade': 62, 'densidade': 44}
rng = np.random.default_rng(11)
nav = posicionar(rng)
ex = {}
for est, t in alvo.items():
    for s in range(3000):
        r = np.random.default_rng(1000 + s)
        n, seq = jogar(r, est, nav, registrar=True)
        if n == t: ex[est] = {'seq': seq, 'navios': [np.flatnonzero(m).tolist() for m in nav]}; break
    print(est, est in ex)
# defesa: densidade contra navios na borda, perto de 51
rb = np.random.default_rng(5)
navb = posicionar(rb, 'bordas')
for s in range(3000):
    r = np.random.default_rng(5000 + s)
    n, seq = jogar(r, 'densidade', navb, registrar=True)
    if n == 52: ex['borda'] = {'seq': seq, 'navios': [np.flatnonzero(m).tolist() for m in navb]}; break
print('borda', 'borda' in ex)
hist = {}
for k, v in d['res'].items():
    c = np.bincount(np.array(v), minlength=101)[17:101]
    hist[k] = {'cont': (c / len(v) * 100).round(3).tolist(), 'media': float(np.mean(v))}
json.dump({'ex': ex, 'hist': hist, 'dens0': d['dens0'], 'defesa': {k: float(np.mean(v)) for k, v in d['defesa'].items()}, 'duelos': d['duelos'],
           'cem': float((np.array(d['res']['aleatorio']) == 100).mean())}, open('batalha_video.json', 'w'))
