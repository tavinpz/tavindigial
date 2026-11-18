"""Risk (regras clássicas): ataque até 3 dados, defesa até 2, pares do maior ao menor, empate é da defesa.
Simula 10.000 vezes cada caso e confere com a conta exata (cadeia de Markov). Gera sim/risk.json."""
import json, random, itertools
from functools import lru_cache
random.seed(2026)
N = 10000

def rola(a, d):
    A = sorted((random.randint(1, 6) for _ in range(a)), reverse=True)
    D = sorted((random.randint(1, 6) for _ in range(d)), reverse=True)
    pa = pd = 0
    for x, y in zip(A, D):
        if x > y: pd += 1
        else: pa += 1
    return pa, pd  # perdas do ataque, perdas da defesa

def exato(a, d):
    out = {}
    for A in itertools.product(range(1, 7), repeat=a):
        for D in itertools.product(range(1, 7), repeat=d):
            As, Ds = sorted(A, reverse=True), sorted(D, reverse=True)
            pa = sum(1 for x, y in zip(As, Ds) if x <= y); pd = min(a, d) - pa
            out[(pa, pd)] = out.get((pa, pd), 0) + 1
    t = 6 ** (a + d)
    return {k: v / t for k, v in out.items()}

R = {'rolagem': {}, 'batalha': {}, 'sim_batalha': {}}
for a, d in [(3, 2), (3, 1), (2, 2), (2, 1), (1, 2), (1, 1)]:
    ex = exato(a, d)
    sim = {}
    for _ in range(N):
        k = rola(a, d); sim[k] = sim.get(k, 0) + 1
    R['rolagem'][f'{a}v{d}'] = {'exato': {f'{k[0]}-{k[1]}': round(v, 4) for k, v in ex.items()}, 'sim': {f'{k[0]}-{k[1]}': v / N for k, v in sim.items()},
                                'perda_ataque': round(sum(k[0] * v for k, v in ex.items()), 4), 'perda_defesa': round(sum(k[1] * v for k, v in ex.items()), 4)}

EX = {(a, d): exato(a, d) for a in (1, 2, 3) for d in (1, 2)}

@lru_cache(None)
def vence(A, D):
    """A = exércitos no território atacante (1 fica), D = defensores. Ataca sempre com o máximo até vencer ou sobrar 1."""
    if D == 0: return 1.0
    if A <= 1: return 0.0
    a, d = min(3, A - 1), min(2, D)
    return sum(p * vence(A - pa, D - pd) for (pa, pd), p in EX[(a, d)].items())

def simula_batalha(A, D):
    w = 0
    for _ in range(N):
        x, y = A, D
        while y > 0 and x > 1:
            pa, pd = rola(min(3, x - 1), min(2, y)); x -= pa; y -= pd
        w += y == 0
    return w / N

for D in range(1, 21):
    for A in range(2, 41):
        R['batalha'][f'{A}v{D}'] = round(vence(A, D), 4)
for A, D in [(2, 1), (3, 1), (4, 2), (5, 5), (6, 5), (10, 10), (11, 10), (20, 20), (21, 20), (8, 5), (10, 5), (7, 3), (4, 3), (3, 2), (31, 30), (40, 30)]:
    R['sim_batalha'][f'{A}v{D}'] = simula_batalha(A, D)
# quantos exércitos para 80% / 90% de chance contra D defensores
R['precisa'] = {D: {p: next(A for A in range(2, 200) if vence(A, D) >= p) for p in (0.5, 0.8, 0.9)} for D in (1, 2, 3, 5, 10, 20)}
json.dump(R, open('/home/claude/estudio-longo/ten-thousand-runs/sim/risk.json', 'w'), indent=1)
for k, v in R['rolagem'].items(): print(k, v['exato'], 'perdas A/D', v['perda_ataque'], v['perda_defesa'])
print({k: (v, round(vence(*map(int, k.split("v"))), 4)) for k, v in R['sim_batalha'].items()})
print(R['precisa'])
