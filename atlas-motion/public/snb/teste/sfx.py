# Trilha e efeitos do teste do Strong Not Big, sintetizados (sem arquivo de terceiros).
import json, wave, numpy as np
SR = 48000
T = json.load(open('public/snb/teste/tempos.json')); N = int((T['total'] + 0.5) * SR)
out = np.zeros(N); rng = np.random.default_rng(7)
def poe(x, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(x))
    if i < N: out[i:j] += x[: j - i] * g
def env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def hit(f0=52, d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    f = f0 * (1 + 2.2 * np.exp(-t * 26)); corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    estalo = rng.standard_normal(n) * np.exp(-t * 70) * 0.5
    return corpo + estalo
def whoosh(d=0.55):
    n = int(d * SR); r = rng.standard_normal(n); t = np.arange(n) / SR
    k = np.fft.rfft(r); fr = np.fft.rfftfreq(n, 1 / SR); k *= np.exp(-((fr - 1800) / 1500) ** 2); r = np.fft.irfft(k, n)
    return r / np.abs(r).max() * np.sin(np.pi * t / d) ** 2
def tick(f=1900, d=0.035):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 110)
def blip(f=660, d=0.16):
    n = int(d * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * env(n, 0.004, 0.05)
# cama grave que muda a cada bloco + pulso leve
t = np.arange(N) / SR
for b, raiz in zip(T['blocos'], [55.0, 49.0, 61.74]):
    m = (t >= b['ini'] - 0.3) & (t < b['fim'] + 0.6); tt = t[m]
    cama = (np.sin(2 * np.pi * raiz * tt) + 0.55 * np.sin(2 * np.pi * raiz * 1.5 * tt) + 0.3 * np.sin(2 * np.pi * raiz * 2 * tt + 0.6 * np.sin(2 * np.pi * 0.2 * tt)))
    borda = np.minimum(1, (tt - tt[0]) / 0.5) * np.minimum(1, (tt[-1] - tt) / 0.5)
    out[m] += cama * borda * 0.085
for k in np.arange(0.6, T['total'], 60 / 96):
    poe(hit(46, 0.35), k, 0.10)
B = {b['cena']: b for b in T['blocos']}
g0, e0, p0 = B['gancho']['ini'], B['estudo']['ini'], B['promessa']['ini']
t2g = B['gancho']['falas'][1]['t']; t2e = B['estudo']['falas'][1]['t']; t2p = B['promessa']['falas'][1]['t']
poe(hit(60, 0.7), g0 + 22 / 30, 0.55); poe(blip(520), g0 + 30 / 30, 0.18)
poe(whoosh(0.6), t2g - 0.25, 0.42); poe(blip(700), t2g + 26 / 30, 0.2)
ts = t2g + 16 / 30; passo = 0.16
while ts < t2g + 100 / 30: poe(tick(), ts, 0.16); ts += passo; passo = max(0.05, passo * 0.94)
poe(blip(990, 0.3), t2g + 100 / 30, 0.3)
poe(whoosh(0.5), e0 - 0.25, 0.4)
for ts in np.arange(e0 + 4 / 30, e0 + 66 / 30, 0.045): poe(tick(1400 + rng.uniform(-200, 300), 0.02), ts, 0.10)
poe(hit(70, 0.5), e0 + 66 / 30, 0.4)
poe(whoosh(0.35), t2e - 0.3, 0.3); poe(hit(55, 0.8), t2e + 4 / 30, 0.6); poe(blip(440, 0.2), t2e + 62 / 30, 0.22)
poe(whoosh(0.5), p0 - 0.25, 0.4); poe(hit(60, 0.7), p0 + 26 / 30, 0.5); poe(blip(620), p0 + 56 / 30, 0.18)
sobe = whoosh(0.9)[::-1] * np.linspace(0.2, 1, int(0.9 * SR)); poe(sobe, t2p - 0.9, 0.45)
poe(hit(42, 1.6), t2p, 0.95); poe(hit(84, 0.5), t2p, 0.3)
out = np.tanh(out * 1.3) * 0.8
w = wave.open('public/snb/teste/sfx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('sfx ok', round(N / SR, 1))
