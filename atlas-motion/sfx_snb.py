# Trilha e efeitos do Strong Not Big, sintetizados a partir do tempos.json (sem arquivo de terceiros).
# Uso: python3 sfx_snb.py public/snb/v01  -> sfx.wav (48k). Os efeitos seguem o que entra na tela em cada fala (campo v).
import json, sys, wave, numpy as np
P = sys.argv[1].rstrip('/'); SR = 48000
T = json.load(open(f'{P}/tempos.json')); N = int((T['total'] + 0.5) * SR)
out = np.zeros(N); rng = np.random.default_rng(7)
def poe(x, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: out[i:j] += x[: j - i] * g
def env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def hit(f0=52, d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    f = f0 * (1 + 2.2 * np.exp(-t * 26)); corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    return corpo + rng.standard_normal(n) * np.exp(-t * 70) * 0.5
def whoosh(d=0.55):
    n = int(d * SR); r = rng.standard_normal(n); t = np.arange(n) / SR
    k = np.fft.rfft(r); fr = np.fft.rfftfreq(n, 1 / SR); k *= np.exp(-((fr - 1800) / 1500) ** 2); r = np.fft.irfft(k, n)
    return r / np.abs(r).max() * np.sin(np.pi * t / d) ** 2
def tick(f=1900, d=0.035):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 110)
def blip(f=660, d=0.16):
    n = int(d * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * env(n, 0.004, 0.05)
def passo():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 70 * t) * np.exp(-t * 40) + rng.standard_normal(n) * np.exp(-t * 90) * 0.25
RAIZES = [55.0, 49.0, 61.74, 51.91, 46.25, 58.27]
t = np.arange(N) / SR
for bi, b in enumerate(T['blocos']):
    raiz = RAIZES[bi % len(RAIZES)]; ini = b['ini']; fim = b['fim'] if bi < len(T['blocos']) - 1 else T['total']
    m = (t >= ini - 0.3) & (t < fim + 0.6); tt = t[m]
    cama = np.sin(2 * np.pi * raiz * tt) + 0.55 * np.sin(2 * np.pi * raiz * 1.5 * tt) + 0.3 * np.sin(2 * np.pi * raiz * 2 * tt + 0.6 * np.sin(2 * np.pi * 0.2 * tt))
    out[m] += cama * np.minimum(1, (tt - tt[0]) / 0.5) * np.minimum(1, (tt[-1] - tt) / 0.5) * 0.085
    if bi: poe(whoosh(0.5), ini - 0.25, 0.4)
    s = {}; ant = {}
    for fi, f in enumerate(b['falas']):
        s = {**s, **(f.get('v') or {})}; s = {k: x for k, x in s.items() if x is not None}
        t0 = f['t']; prox = b['falas'][fi + 1]['t'] if fi + 1 < len(b['falas']) else fim
        J = lambda x: json.dumps(x, sort_keys=True)
        if s.get('big') and s.get('big') != ant.get('big'):
            forte = any(w in s['big'] for w in ('NO ', 'NOT', 'FIRST', 'ZERO', '%', 'BOTH', 'RESULT', 'HARD WORK', 'SAME SIZE', 'BOTTLENECK'))
            poe(hit(60 if not forte else 44, 0.7 if not forte else 1.3), t0, 0.5 if not forte else 0.85)
            if forte: poe(hit(88, 0.4), t0, 0.25)
            if s.get('sub'): poe(blip(560), t0 + 0.2, 0.14)
        if s.get('num') and J(s.get('num')) != J(ant.get('num')):
            dur = min(34, 10 + len(str(s['num']['ate'])) * 6) / 30
            for ts in np.arange(t0, t0 + dur, 0.045): poe(tick(1400 + rng.uniform(-200, 300), 0.02), ts, 0.10)
            poe(hit(70, 0.5), t0 + dur, 0.45)
        if s.get('lista'):
            L, La = s['lista'], ant.get('lista') or {}
            if J(L.get('it')) != J(La.get('it')):
                if L.get('auto'):
                    for n in range(len(L['it'])): poe(blip(520 + 60 * n), t0 + n * f['d'] * 0.92 / len(L['it']), 0.2)
                elif L.get('n'): poe(blip(520), t0, 0.2)
            elif L.get('n', 0) != La.get('n', 0): poe(blip(520 + 60 * L.get('n', 0)), t0, 0.2)
        if s.get('cart'):
            C, Ca = s['cart']['it'], (ant.get('cart') or {}).get('it') or [['', '', ''], ['', '', '']]
            if [c[0] for c in C] != [c[0] for c in Ca]: poe(hit(64, 0.5), t0, 0.4); poe(hit(64, 0.5), t0 + 7 / 30, 0.3)
            for c, ca in zip(C, Ca):
                if c[2] and c[2] != ca[2]: poe(blip(880 if 'DROPPED' not in c[2] else 300, 0.28), t0, 0.3); poe(hit(50, 0.6), t0, 0.35)
                elif c[1] and c[1] != ca[1] and c[0] == ca[0]: poe(blip(480), t0, 0.14)
        if s.get('rank') and J(s.get('rank')) != J(ant.get('rank')):
            for n in range(len(s['rank']['it'])): poe(hit(55 if n == 0 else 66, 0.8 if n == 0 else 0.5), t0 + (8 + n * 22) / 30, 0.6 if n == 0 else 0.3)
        if s.get('barras'):
            Bq, Ba = s['barras'], ant.get('barras') or {}
            if J(Bq.get('it')) != J(Ba.get('it')):
                for n in range(len(Bq['it'])):
                    sobe = whoosh(0.7)[::-1] * np.linspace(0.2, 1, int(0.7 * SR)); poe(sobe, t0 + n * 0.4, 0.22); poe(hit(66, 0.4), t0 + n * 0.4 + 0.72, 0.3)
            if Bq.get('nota') and Bq.get('nota') != Ba.get('nota'): poe(hit(44, 1.2), max(t0, t0 if Ba.get('it') else t0 + 1.0), 0.8)
        if s.get('anel') and not ant.get('anel'):
            for ts in np.arange(t0 + 10 / 30, prox, 1.0): poe(tick(1500, 0.05), ts, 0.3)
            poe(blip(990, 0.3), prox - 0.05, 0.25)
        if (s.get('mao') and not ant.get('mao')) or [x['p'] for x in s.get('figs') or []] != [x['p'] for x in ant.get('figs') or []]: poe(whoosh(0.28), t0 - 0.08, 0.2)
        if s.get('brilho') and s.get('brilho') != ant.get('brilho'): poe(blip(330, 0.5), t0, 0.22)
        if any(x.get('treme') for x in s.get('figs') or []) and not any(x.get('treme') for x in ant.get('figs') or []): poe(hit(40, 1.0), t0 + 0.05, 0.7)
        if any(x.get('anda') for x in s.get('figs') or []):   # passos casados com o balanço da figura (um a cada 16,34 quadros do bloco)
            per = 5.2 * np.pi / 30; k = np.ceil((t0 - round(ini * 30) / 30) / per)
            while round(ini * 30) / 30 + k * per < prox: poe(passo(), round(ini * 30) / 30 + k * per, 0.3); k += 1
        # chaves do #06 em diante (Extra.tsx): objetos, impacto, close de rosto, linha do tempo
        fv = f.get('v') or {}
        if fv.get('imp'): poe(hit(40, 1.1), t0, 0.8); poe(hit(90, 0.35), t0, 0.3)
        if s.get('face') and J(s.get('face')) != J(ant.get('face')): poe(whoosh(0.3), t0 - 0.06, 0.3)
        if s.get('tl') is not None and s.get('tl') != ant.get('tl'): poe(blip(740, 0.22), t0 + 0.1, 0.18)
        if (s.get('zoom') or 1) != (ant.get('zoom') or 1): poe(whoosh(0.6), t0 - 0.05, 0.16)
        for n, o in enumerate(s.get('obj') or []):
            oa = (ant.get('obj') or [None] * 9)[n] if n < len(ant.get('obj') or []) else None
            if J(o) == J(oa): continue
            tt = o.get('t')
            poe(whoosh(0.32), t0 - 0.05, 0.2)
            if tt == 'galao' and o.get('voa'): poe(whoosh(0.3)[::-1], t0 + 4 / 30, 0.4); poe(hit(48, 0.9), t0 + 13 / 30, 0.9); poe(hit(120, 0.3), t0 + 13 / 30, 0.4)
            if tt == 'balanca':
                for k in range(6): poe(tick(1200 + 80 * k, 0.03), t0 + k * 0.11, 0.18)
                poe(blip(990, 0.25), t0 + 0.75, 0.25)
            if tt == 'cadeados':
                for k in range(o.get('n', 3)): poe(hit(70, 0.3), t0 + k * 0.2, 0.25)
                if o.get('novo'): poe(tick(2600, 0.05), t0 + 0.4, 0.5); poe(blip(880, 0.3), t0 + 0.45, 0.3)
            if tt == 'corda':
                n = int(0.9 * SR); r = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3); poe(np.convolve(r, np.ones(60) / 60, 'same') * 6, t0 + 0.2, 0.25)
                poe(hit(58, 0.6), t0 + 0.5, 0.35)
            if tt == 'motor' and o.get('estado') == 'rompe':
                n = int(0.25 * SR); poe(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 18), t0 + 6 / 30, 0.9); poe(hit(36, 1.5), t0 + 6 / 30, 1.0)
            if tt == 'enquete':
                poe(blip(600), t0, 0.25); poe(blip(760), t0 + 0.2, 0.25)
                if o.get('marca'): poe(blip(880, 0.35), t0 + 0.1, 0.35); poe(blip(1320, 0.35), t0 + 0.25, 0.25)
            if tt == 'inscrever': poe(tick(2200, 0.04), t0 + 26 / 30, 0.6); poe(blip(1480, 0.6), t0 + 28 / 30, 0.3)
            if tt == 'calend':
                for k in range(6): poe(tick(900, 0.05), t0 + (4 + k * 6) / 30, 0.25)
            if tt in ('cartao', 'grafico', 'cubo', 'cerebro'): poe(hit(62, 0.5), t0 + 0.05, 0.35)
            if tt == 'sacolas': poe(whoosh(1.2)[::-1], t0, 0.25)
        ant = s
for k in np.arange(0.6, T['total'], 60 / 96): poe(hit(46, 0.35), k, 0.09)
out = np.tanh(out * 1.3) * 0.8
w = wave.open(f'{P}/sfx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('sfx ok', round(N / SR, 1))
