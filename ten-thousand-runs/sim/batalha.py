"""Batalha Naval (Battleship) — 10.000 partidas por estratégia.
Tabuleiro 10x10, navios 5,4,3,3,2 (regras Hasbro). Navios podem encostar, não sobrepor.
Atiradores: aleatorio, caca (hunt/target), paridade (hunt/target só nas casas pretas), densidade (probabilidade).
Defensores: aleatorio, bordas, centro, colados."""
import json, os, sys
import numpy as np

N = 10
NAVIOS = [5, 4, 3, 3, 2]
AQUI = os.path.dirname(os.path.abspath(__file__))


def todas(L):
    out = []
    for r in range(N):
        for c in range(N - L + 1):
            m = np.zeros(N * N, bool); m[[r * N + c + k for k in range(L)]] = True; out.append(m)
    for r in range(N - L + 1):
        for c in range(N):
            m = np.zeros(N * N, bool); m[[(r + k) * N + c for k in range(L)]] = True; out.append(m)
    return np.array(out)


MASC = {L: todas(L) for L in set(NAVIOS)}
MASCF = {L: m.astype(np.float32) for L, m in MASC.items()}
BORDA = np.zeros(N * N, bool)
for i in range(N * N):
    r, c = divmod(i, N)
    BORDA[i] = r in (0, N - 1) or c in (0, N - 1)
CENTRO = np.zeros(N * N, bool)
for i in range(N * N):
    r, c = divmod(i, N)
    CENTRO[i] = 2 <= r <= 7 and 2 <= c <= 7


def posicionar(rng, modo='aleatorio'):
    """devolve lista de máscaras, uma por navio"""
    while True:
        ocup = np.zeros(N * N, bool); navios = []
        ok = True
        for L in NAVIOS:
            M = MASC[L]
            val = ~(M & ocup).any(1)
            if modo == 'bordas':
                val &= (M & ~BORDA).sum(1) == 0
                if not val.any():  # navio grande sem lugar só na borda: aceita o que encostar mais
                    val = ~(M & ocup).any(1)
            elif modo == 'centro':
                val &= (M & ~CENTRO).sum(1) == 0
            elif modo == 'colados' and navios:
                viz = np.zeros(N * N, bool)
                for i in np.flatnonzero(ocup):
                    r, c = divmod(i, N)
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        if 0 <= r + dr < N and 0 <= c + dc < N: viz[(r + dr) * N + c + dc] = True
                val &= (M & viz).any(1)
            idx = np.flatnonzero(val)
            if not len(idx): ok = False; break
            m = M[rng.choice(idx)]
            ocup |= m; navios.append(m)
        if ok: return navios


def vizinhos(i):
    r, c = divmod(i, N)
    return [(r + dr) * N + c + dc for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)) if 0 <= r + dr < N and 0 <= c + dc < N]


def jogar(rng, estrategia, navios, registrar=False):
    tiro = np.zeros(N * N, bool); acerto = np.zeros(N * N, bool)
    vivo = [True] * len(navios); afundado = np.zeros(N * N, bool)
    ocup = np.zeros(N * N, bool)
    for m in navios: ocup |= m
    pilha = []
    paridade = rng.integers(2)
    seq = []
    tiros = 0
    while any(vivo):
        alvo = None
        if estrategia == 'aleatorio':
            alvo = rng.choice(np.flatnonzero(~tiro))
        elif estrategia in ('caca', 'paridade'):
            while pilha and tiro[pilha[-1]]: pilha.pop()
            if pilha: alvo = pilha.pop()
            else:
                livres = np.flatnonzero(~tiro)
                if estrategia == 'paridade':
                    par = [i for i in livres if (i // N + i % N) % 2 == paridade]
                    if par: livres = par
                alvo = rng.choice(livres)
        else:  # densidade
            pend = acerto & ~afundado
            dens = np.zeros(N * N, np.float32)
            for k, L in enumerate(NAVIOS):
                if not vivo[k]: continue
                M = MASC[L]
                val = ~(M & ((tiro & ~acerto) | afundado)).any(1)
                if pend.any():
                    cob = (M[val] & pend).sum(1)
                    if cob.any():
                        dens += (MASCF[L][val] * (cob[:, None] * 50.0 + 1)).sum(0)
                        continue
                dens += MASCF[L][val].sum(0)
            dens[tiro] = -1
            if pend.any():
                # prioriza vizinhos de acertos pendentes
                pass
            mx = dens.max()
            alvo = rng.choice(np.flatnonzero(dens == mx))
        tiro[alvo] = True; tiros += 1
        h = bool(ocup[alvo])
        if h:
            acerto[alvo] = True
            for k, m in enumerate(navios):
                if vivo[k] and m[alvo] and (acerto[m]).all():
                    vivo[k] = False; afundado |= m
            if estrategia in ('caca', 'paridade'):
                pilha.extend([v for v in vizinhos(alvo) if not tiro[v]])
        if registrar: seq.append([int(alvo), int(h)])
    return (tiros, seq) if registrar else tiros


def rodar(n=10000, semente=7):
    rng = np.random.default_rng(semente)
    res = {}
    for est in ('aleatorio', 'caca', 'paridade', 'densidade'):
        t = [jogar(rng, est, posicionar(rng)) for _ in range(n)]
        res[est] = t
        a = np.array(t)
        print(est, 'média', a.mean().round(1), 'mediana', np.median(a), 'min', a.min(), 'max', a.max(), flush=True)
    # defesa contra o melhor atirador
    defesa = {}
    nd = n // 2
    for modo in ('aleatorio', 'bordas', 'centro', 'colados'):
        t = [jogar(rng, 'densidade', posicionar(rng, modo)) for _ in range(nd)]
        defesa[modo] = t
        print('defesa', modo, np.mean(t).round(1), flush=True)
    # duelos: quem afunda tudo primeiro; quem começa ganha empate (alterna quem começa)
    duelos = {}
    ests = list(res)
    for i, a in enumerate(ests):
        for b in ests[i + 1:]:
            A = np.array(res[a]); B = np.array(res[b])[rng.permutation(n)]
            comeca_a = rng.integers(2, size=n).astype(bool)
            ganha_a = np.where(comeca_a, A <= B, A < B)
            duelos[f'{a}|{b}'] = float(ganha_a.mean())
            print('duelo', a, b, round(ganha_a.mean() * 100, 1), flush=True)
    # mapas de calor do 1º tiro e partidas de exemplo
    exemplo = {}
    for est in ('aleatorio', 'caca', 'paridade', 'densidade'):
        r2 = np.random.default_rng(2024)
        nav = posicionar(r2)
        t, seq = jogar(r2, est, nav, registrar=True)
        exemplo[est] = {'tiros': t, 'seq': seq, 'navios': [np.flatnonzero(m).tolist() for m in nav]}
    dens0 = np.zeros(N * N)
    for L in NAVIOS: dens0 += MASCF[L].sum(0)
    out = {'n': n, 'res': {k: v for k, v in res.items()}, 'defesa': defesa, 'duelos': duelos, 'exemplo': exemplo, 'dens0': dens0.tolist()}
    json.dump(out, open(os.path.join(AQUI, 'batalha.json'), 'w'))


if __name__ == '__main__':
    rodar(int(sys.argv[1]) if len(sys.argv) > 1 else 10000)
