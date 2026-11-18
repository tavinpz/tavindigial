"""Clue (Cluedo clássico): 6 suspeitos, 6 armas, 9 cômodos. 3 cartas no envelope, 18 distribuídas.
Simula 10.000 jogos por estratégia de anotação, com 3, 4 e 6 jogadores. Mede quantas rodadas o jogador 0 leva
até ter CERTEZA do envelope. Sem tabuleiro: todo jogador pode sugerir qualquer cômodo a cada vez (versão "sem dado"),
o que mede só a qualidade da dedução. Mesmas cartas (mesma semente) para as três estratégias.

Estratégias (só o que o jogador 0 anota):
  basica   - risca só as cartas que mostram para ele.
  passes   - também anota quem NÃO tinha nenhuma das três cartas de uma sugestão (de qualquer jogador).
  completa - também anota "fulano mostrou UMA destas três para outra pessoa" e cruza tudo (contagem de mãos).
"""
import json, random
from statistics import mean, median

SUS, ARM, COM = 6, 6, 9
CAT = [list(range(0, 6)), list(range(6, 12)), list(range(12, 21))]
N = 10000


class Nota:
    def __init__(s, np, eu, mao, tamanhos, nivel):
        s.np, s.nivel, s.tam = np, nivel, tamanhos
        s.dono = [None] * 21          # índice do jogador, ou 'E' (envelope)
        s.nao = [set() for _ in range(21)]  # jogadores que certamente NÃO têm a carta
        s.clausulas = []              # (jogador, {cartas}) : tem pelo menos uma
        for c in range(21):
            if c in mao: s.dono[c] = eu
            else: s.nao[c].add(eu)

    def pos(s, c):  # possíveis donos
        if s.dono[c] is not None: return {s.dono[c]}
        return ({p for p in range(s.np) if p not in s.nao[c]} | {'E'}) - s.nao_env(c)

    def nao_env(s, c):
        for cat in CAT:
            if c in cat and any(s.dono[x] == 'E' for x in cat if x != c): return {'E'}
        return set()

    def fixa(s, c, d):
        if s.dono[c] is None: s.dono[c] = d; return True
        return False

    def propaga(s):
        mudou = True
        while mudou:
            mudou = False
            for c in range(21):
                if s.dono[c] is None:
                    p = s.pos(c)
                    if len(p) == 1: mudou |= s.fixa(c, p.pop())
            for cat in CAT:  # envelope: exatamente uma por categoria
                if not any(s.dono[x] == 'E' for x in cat):
                    cand = [x for x in cat if 'E' in s.pos(x)]
                    if len(cand) == 1: mudou |= s.fixa(cand[0], 'E')
            if s.nivel == 'completa':
                for p in range(s.np):  # contagem de mãos
                    tem = [c for c in range(21) if s.dono[c] == p]
                    talvez = [c for c in range(21) if s.dono[c] is None and p not in s.nao[c]]
                    if len(tem) == s.tam[p] and talvez:
                        for c in talvez: s.nao[c].add(p)
                        mudou = True
                    elif talvez and len(tem) + len(talvez) == s.tam[p]:
                        for c in talvez: mudou |= s.fixa(c, p)
                novas = []
                for p, cs in s.clausulas:
                    if any(s.dono[c] == p for c in cs): continue
                    vivas = {c for c in cs if s.dono[c] is None and p not in s.nao[c]}
                    if len(vivas) == 1: mudou |= s.fixa(vivas.pop(), p)
                    else: novas.append((p, vivas))
                s.clausulas = novas

    def resolvido(s):
        return all(any(s.dono[x] == 'E' for x in cat) for cat in CAT)

    def palpite(s, rng):
        out = []
        for cat in CAT:
            env = [x for x in cat if s.dono[x] == 'E']
            if env: out.append(env[0]); continue
            cand = [x for x in cat if 'E' in s.pos(x)]
            out.append(rng.choice(cand))
        return out


def jogo(np, nivel, seed):
    rng = random.Random(seed)
    env = [rng.choice(cat) for cat in CAT]
    resto = [c for c in range(21) if c not in env]
    rng.shuffle(resto)
    maos = [set(resto[i::np]) for i in range(np)]
    tam = [len(m) for m in maos]
    n0 = Nota(np, 0, maos[0], tam, nivel)
    n0.propaga()
    # os outros jogadores sugerem cartas que eles mesmos não têm (aleatórias), só para gerar informação
    rodada = 0
    while rodada < 200:
        rodada += 1
        for p in range(np):
            if p == 0:
                sug = n0.palpite(rng)
            else:
                sug = [rng.choice([x for x in cat if x not in maos[p]]) for cat in CAT]
            for k in range(1, np):
                q = (p + k) % np
                tem = [c for c in sug if c in maos[q]]
                if not tem:
                    if nivel != 'basica':
                        for c in sug: n0.nao[c].add(q)
                    continue
                if q == 0: break
                mostrada = rng.choice(tem)
                if p == 0: n0.fixa(mostrada, q)
                elif nivel == 'completa': n0.clausulas.append((q, set(sug)))
                break
            else:
                if p == 0:  # ninguém mostrou: o que ele não tem está no envelope
                    for c in sug:
                        if c not in maos[0]: n0.fixa(c, 'E')
            n0.propaga()
            if n0.resolvido():
                assert [next(x for x in cat if n0.dono[x] == 'E') for cat in CAT] == env
                return rodada
    return rodada


if __name__ == '__main__':
    R = {}
    for np in (3, 4, 6):
        for nivel in ('basica', 'passes', 'completa'):
            r = [jogo(np, nivel, s) for s in range(N)]
            R[f'{np}_{nivel}'] = {'media': round(mean(r), 2), 'mediana': median(r), 'ate5': round(sum(x <= 5 for x in r) / N, 4),
                                  'ate10': round(sum(x <= 10 for x in r) / N, 4), 'max': max(r), 'hist': [sum(x == k for x in r) for k in range(1, 31)]}
            print(np, nivel, R[f'{np}_{nivel}']['media'], R[f'{np}_{nivel}']['mediana'], R[f'{np}_{nivel}']['ate5'], R[f'{np}_{nivel}']['max'], flush=True)
    json.dump(R, open('/home/claude/estudio-longo/ten-thousand-runs/sim/clue.json', 'w'), indent=1)


# --- estratégia "isca": usar cartas da própria mão em duas categorias para testar uma só (truque clássico) ---
def _palpite_isca(s, rng):
    abertas = [i for i, cat in enumerate(CAT) if not any(s.dono[x] == 'E' for x in cat)]
    alvo = max(abertas, key=lambda i: len([x for x in CAT[i] if 'E' in s.pos(x)])) if abertas else 0
    out = []
    for i, cat in enumerate(CAT):
        if i == alvo:
            out.append(rng.choice([x for x in cat if 'E' in s.pos(x)])); continue
        env = [x for x in cat if s.dono[x] == 'E']
        prop = [x for x in cat if s.dono[x] == s.eu]
        out.append(prop[0] if prop else (env[0] if env else rng.choice([x for x in cat if 'E' in s.pos(x)])))
    return out


def jogo_isca(np_, seed):
    velho_init, velho_palp = Nota.__init__, Nota.palpite
    def ini(self, np, eu, mao, t, n): velho_init(self, np, eu, mao, t, n); self.eu = eu
    Nota.__init__, Nota.palpite = ini, _palpite_isca
    try: return jogo(np_, 'completa', seed)
    finally: Nota.__init__, Nota.palpite = velho_init, velho_palp
