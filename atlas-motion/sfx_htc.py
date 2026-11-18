# Trilha e efeitos do Hard to Copy, sintetizados a partir do tempos.json (sem arquivo de terceiros).
# Uso: python3 sfx_htc.py public/htc/v01 -> sfx.wav (48k). Os efeitos seguem o que muda na tela em cada fala (campo v).
import json, sys, wave, numpy as np
P = sys.argv[1].rstrip('/'); SR = 48000
T = json.load(open(f'{P}/tempos.json')); N = int((T['total'] + 0.5) * SR)
out = np.zeros(N); rng = np.random.default_rng(11)
def poe(x, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: out[i:j] += x[: j - i] * g
def env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def hit(f0=52, d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    f = f0 * (1 + 2.2 * np.exp(-t * 26)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) + rng.standard_normal(n) * np.exp(-t * 70) * 0.4
def whoosh(d=0.55, fc=1800):
    n = int(d * SR); r = rng.standard_normal(n); t = np.arange(n) / SR
    k = np.fft.rfft(r); fr = np.fft.rfftfreq(n, 1 / SR); k *= np.exp(-((fr - fc) / 1500) ** 2); r = np.fft.irfft(k, n)
    return r / np.abs(r).max() * np.sin(np.pi * t / d) ** 2
def tick(f=1900, d=0.035):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 110)
def blip(f=660, d=0.18):
    n = int(d * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)) * env(n, 0.004, 0.06)
def trava(d=0.5):   # "clique" metálico de fechadura para os cartões LOCK
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 60) + np.sin(2 * np.pi * 3470 * t) * np.exp(-t * 45) * 0.6 + rng.standard_normal(n) * np.exp(-t * 120) * 0.6) * 0.6
RAIZES = [55.0, 49.0, 58.27, 51.91, 46.25, 61.74]
t = np.arange(N) / SR; J = lambda x: json.dumps(x, sort_keys=True)
for bi, b in enumerate(T['blocos']):
    raiz = RAIZES[(b.get('trava') or 0) % len(RAIZES)] * (1 if bi % 2 else 1.0)
    ini = b['ini']; fim = b['fim'] if bi < len(T['blocos']) - 1 else T['total']
    m = (t >= ini - 0.3) & (t < fim + 0.6); tt = t[m]
    cama = np.sin(2 * np.pi * raiz * tt) + 0.5 * np.sin(2 * np.pi * raiz * 1.5 * tt) + 0.28 * np.sin(2 * np.pi * raiz * 2 * tt + 0.6 * np.sin(2 * np.pi * 0.2 * tt)) + 0.12 * np.sin(2 * np.pi * raiz * 4 * tt + 2 * np.sin(2 * np.pi * 0.11 * tt))
    out[m] += cama * np.minimum(1, (tt - tt[0]) / 0.5) * np.minimum(1, (tt[-1] - tt) / 0.5) * 0.08
    if bi: poe(whoosh(0.5), ini - 0.25, 0.35)
    s = {}; ant = {}
    for fi, f in enumerate(b['falas']):
        s = {**s, **(f.get('v') or {})}; s = {k: x for k, x in s.items() if x is not None}
        t0 = f['t']; d = s.get('d'); novo = d != ant.get('d') or J(s.get('it')) != J(ant.get('it')); n, na = s.get('n', 0), (ant.get('n', 0) if not novo else 0)
        if d == 'big' and (novo or s.get('t') != ant.get('t')):
            if 'LOCK' in (s.get('rot') or ''): poe(trava(), t0, 0.9); poe(hit(42, 1.4), t0 + 0.05, 0.8)
            else: poe(hit(50, 1.0), t0, 0.7)
        elif d == 'check' and n > na:
            ok = s['it'][n - 1][1]; poe(blip(740 if ok else 220, 0.22 if ok else 0.4), t0 + 0.1, 0.25 if ok else 0.4)
            if not ok: poe(hit(46, 0.8), t0 + 0.1, 0.5)
        elif d == 'nums' and n > na:
            for ts in np.arange(t0, t0 + 0.35, 0.04): poe(tick(1400 + rng.uniform(-200, 300), 0.02), ts, 0.10)
            poe(hit(64, 0.6), t0 + 0.3, 0.5)
        elif d == 'travas' and (s.get('ab', 0) > ant.get('ab', 0) or (n > na and n == 3) or s.get('at') != ant.get('at')): poe(trava(), t0, 0.7); poe(blip(520 + 70 * s.get('ab', 0)), t0 + 0.05, 0.18)
        elif d == 'feixe' and n > na:
            k = {1: 1, 2: 1, 3: 2, 4: 7}.get(n, 1); dur = {1: 0.5, 2: 0.6, 3: 3.0, 4: 2.3}.get(n, 1)
            for q in range(k): poe(blip(880 * (0.94 ** (q + (0 if n < 4 else 3))), 0.12), t0 + 0.25 + q * dur / k, 0.2)
            if n == 4: poe(hit(44, 1.3), t0 + 2.3, 0.8)
        elif d == 'duas' and n > na: poe(hit(46 if n == 2 else 60, 1.2 if n == 2 else 0.6), t0, 0.8 if n == 2 else 0.4)
        elif d == 'cta' and (novo or n > na): poe(blip(660, 0.2), t0, 0.25); poe(blip(990, 0.25), t0 + 0.12, 0.2)
        elif d == 'polir' and n == 4 and na < 4: poe(hit(40, 1.3), t0 + 0.1, 0.9)
        elif d == 'gota' and n > na: poe(hit(70, 0.5), t0 + 0.05, 0.4); poe(whoosh(0.3, 3500), t0, 0.15)
        elif d == 'camadas' and n == 8 and na < 8: poe(hit(40, 1.2), t0 + 0.6, 0.7); poe(blip(200, 0.5), t0 + 0.6, 0.3)
        elif d == 'linha' and n == 4 and na < 4: poe(hit(44, 1.2), t0 + 0.2, 0.8)
        elif novo and d: poe(whoosh(0.3), t0 - 0.05, 0.2)
        elif n > na: poe(blip(540 + 50 * (n % 6), 0.14), t0 + 0.05, 0.16)
        if s.get('k') and s.get('k') != ant.get('k'): poe(tick(1200, 0.05), t0 + 0.02, 0.12)
        if d == 'gota' and n >= 1:   # o laser batendo nas gotas (um pulso a cada 16 quadros)
            prox = b['falas'][fi + 1]['t'] if fi + 1 < len(b['falas']) else fim
            for ts in np.arange(np.ceil((t0 - ini) / (16 / 30)) * (16 / 30) + round(ini * 30) / 30, prox, 16 / 30): poe(tick(2600, 0.03), ts, 0.07)
        ant = s
for k in np.arange(0.6, T['total'], 60 / 92): poe(hit(46, 0.35), k, 0.075)
out = np.tanh(out * 1.3) * 0.8
w = wave.open(f'{P}/sfx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('sfx ok', round(N / SR, 1))
