# Trilha e efeitos do Two Childhoods, sintetizados a partir do tempos.json (nada de terceiros).
# Uso: python3 sfx_tc.py public/tc/v01 -> sfx.wav (48k) e mix.wav / mix.m4a (voz por cima, trilha abaixando na fala)
import json, subprocess, sys, wave, numpy as np
P = sys.argv[1].rstrip('/'); SR = 48000
T = json.load(open(f'{P}/tempos.json')); N = int((T['total'] + 0.5) * SR)
out = np.zeros(N); rng = np.random.default_rng(11)
def poe(x, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: out[i:j] += x[: j - i] * g
def tom(f, d, a=0.004, r=0.25, h2=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + h2 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)) * np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def whoosh(d=0.5):
    n = int(d * SR); r = rng.standard_normal(n); t = np.arange(n) / SR
    k = np.fft.rfft(r); fr = np.fft.rfftfreq(n, 1 / SR); k *= np.exp(-((fr - 1500) / 1300) ** 2); r = np.fft.irfft(k, n)
    return r / np.abs(r).max() * np.sin(np.pi * t / d) ** 2
def pop(f=520): n = int(0.09 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * (1 + 0.6 * np.exp(-t * 60)) * t) * np.exp(-t * 38)
def baque(): n = int(0.4 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(70 * (1 + 2 * np.exp(-t * 30))) / SR) * np.exp(-t * 9) + rng.standard_normal(n) * np.exp(-t * 80) * 0.4
def tick(): n = int(0.03 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 120)
C4, D4, E4, F4, G4, A4, B3, A3, G3, F3, E3 = 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 246.94, 220.0, 196.0, 174.61, 164.81
PROG = {'duo': [[C4, E4, G4], [A3, C4, E4], [F3, A3, C4], [G3, B3, D4]], 'estudo': [[A3, C4, E4], [F3, A3, C4]], 'outro': [[F3, A3, C4], [C4, E4, G4], [G3, B3, D4], [A3, C4, E4]]}
BEAT = 60 / 84; BAR = BEAT * 4
def cama(ac, d):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f in ac:
        for det in (0.997, 1.003): x += np.sin(2 * np.pi * f / 2 * det * t + rng.uniform(0, 6))
    return x / 6 * np.minimum(1, t / 0.9) * np.minimum(1, (d - t) / 0.9)
J = lambda x: json.dumps(x, sort_keys=True)
for bi, b in enumerate(T['blocos']):
    ini, fim = b['ini'], b['fim']; tipo = b['cena'] if b['cena'] in PROG else 'outro'; pr = PROG[tipo]
    pre = b.get('pre', 0) if b.get('cap') else 0
    if bi: poe(whoosh(0.5), ini - 0.2, 0.32)
    if pre:  # cartão de capítulo: três notas subindo + baque suave
        for k, f in enumerate([C4, E4, G4]): poe(tom(f * 2, 0.9, r=0.35), ini + 0.1 + k * 0.16, 0.16)
        poe(baque(), ini + 0.12, 0.3)
    t = ini + pre; k = 0
    while t < fim - 0.2:
        ac = pr[k % len(pr)]; d = min(BAR, fim - t) + 0.9
        poe(cama(ac, d), t, 0.10 if tipo == 'duo' else 0.075)
        if tipo != 'estudo':  # dedilhado leve
            for q in range(8):
                tq = t + q * BEAT / 2
                if tq < fim - 0.3: poe(tom(ac[[0, 1, 2, 1, 0, 2, 1, 2][q]] * 2, 0.6, r=0.16), tq, 0.055 if q % 2 else 0.075)
        else:
            for q in range(4):
                if t + q * BEAT < fim - 0.3: poe(tom(ac[0], 0.5, r=0.12, h2=0.1), t + q * BEAT, 0.06)
        t += BAR; k += 1
    s = {}; ant = {}
    for fi, f in enumerate(b['falas']):
        s = {**s, **(f.get('v') or {})}; s = {x: y for x, y in s.items() if y is not None}; t0 = f['t']
        for ch in ('ba', 'bb'):
            if s.get(ch) and J(s.get(ch)) != J(ant.get(ch)): poe(pop(480 if ch == 'ba' else 620), t0, 0.3)
        for ch in ('oa', 'ob'):
            if J(s.get(ch)) != J(ant.get(ch)) and any('carimbo' in o for o in (s.get(ch) or [])) and not any('carimbo' in o and o in (ant.get(ch) or []) for o in s[ch]): poe(baque(), t0, 0.5)
            elif s.get(ch) and J(s.get(ch)) != J(ant.get(ch)): poe(pop(700), t0, 0.18)
        for ch in ('ca', 'cb'):
            if s.get(ch) and s.get(ch) != ant.get(ch): poe(tick(), t0 + 0.05, 0.35); poe(tick(), t0 + 0.14, 0.25)
        if s.get('big') and J(s.get('big')) != J(ant.get('big')): poe(baque(), t0, 0.45); poe(tom(G4, 1.2, r=0.5), t0, 0.12)
        if s.get('dir') and J(s.get('dir')) != J(ant.get('dir')):
            d = s['dir']
            if d['k'] == 'num': [poe(tick(), ts, 0.14) for ts in np.arange(t0, t0 + 0.85, 0.05)]
            elif d['k'] == 'rows' and d.get('n'):
                r = d['rows'][d['n'] - 1]
                for i in range(r[1]): poe(tick(), t0 + 0.2 + i * 0.066, 0.16)
                poe(tom(E4 * 2 if r[4] == 'mar' else A3, 0.9, r=0.3), t0 + 0.3 + r[1] * 0.066, 0.2)
            else: poe(pop(560), t0, 0.22)
        if s.get('rod') and s.get('rod') != ant.get('rod'): poe(baque(), t0, 0.35)
        if s.get('n') and s.get('n') != ant.get('n'): poe(pop(520 + 60 * s['n']), t0, 0.25)
        if s.get('chips') and not ant.get('chips'): poe(pop(520), t0, 0.25); poe(pop(660), t0 + 0.73, 0.25)
        ant = dict(s)
out = np.tanh(out * 1.4) / 1.4
w = wave.open(f'{P}/sfx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{P}/voz_longo.wav', '-i', f'{P}/sfx.wav', '-filter_complex',
  '[0:a]aresample=48000,apad,asplit=2[v][v2];[1:a]volume=0.6[s];[s][v]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=300[sd];[sd][v2]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]',
  '-map', '[a]', '-ar', '48000', '-ac', '2', f'{P}/mix.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{P}/mix.wav', '-c:a', 'aac', '-b:a', '256k', f'{P}/mix.m4a'], check=True)
print('ok', round(T['total'], 1))
