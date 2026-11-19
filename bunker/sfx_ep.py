# Som de um episódio do Bunker (genérico): voz + ambiente + efeitos conforme as diretivas do tempos.json.
# Uso: python3 bunker/sfx_ep.py atlas-motion/public/bunker/v02
import json, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import lfilter, butter
D = sys.argv[1]; v, sr = sf.read(D + "/voz.wav"); T = json.load(open(D + "/tempos.json"))
n = int(T["total"] * sr); rng = np.random.default_rng(7 + T["teil"]); tt = np.arange(n) / sr; fx = np.zeros(n)
def lp(x, fc): b, a = butter(2, fc / (sr / 2)); return lfilter(b, a, x)
def bp(x, f1, f2): b, a = butter(2, [f1 / (sr / 2), f2 / (sr / 2)], btype="band"); return lfilter(b, a, x)
def poe(x, t0, g=1.0):
    i = int(t0 * sr)
    if 0 <= i < n: m = min(len(x), n - i); fx[i:i + m] += x[:m] * g
def K(d): return np.arange(int(d * sr)) / sr
def pop(t0, fq=640, g=0.09): k = K(0.09); poe(np.sin(2 * np.pi * fq * k * (1 + 2 * k)) * np.exp(-k * 45), t0, g)
def whoosh(t0, g=0.06): k = K(0.45); e = np.minimum(1, k / 0.2) * np.minimum(1, (0.45 - k) / 0.25); poe(bp(rng.standard_normal(len(k)), 300, 2500) * e, t0 - 0.2, g)
def baque(t0, g=0.45, fq=52): k = K(0.5); poe(np.sin(2 * np.pi * fq * k) * np.exp(-k * 9) + lp(rng.standard_normal(len(k)), 300) * np.exp(-k * 20) * 0.5, t0, g)
def bip(t0, fq=880, g=0.06): k = K(0.16); poe(np.sin(2 * np.pi * fq * k) * np.minimum(1, k / 0.005) * np.minimum(1, (0.16 - k) / 0.05), t0, g)
def sino(t0, notas=(523, 659, 784), g=0.06):
    for j, fq in enumerate(notas): k = K(0.9); poe(np.sin(2 * np.pi * fq * k) * np.exp(-k * 5), t0 + j * 0.09, g)
def clique(t0, g=0.05): k = K(0.03); poe(bp(rng.standard_normal(len(k)), 1500, 5000) * np.exp(-k * 120), t0, g)
def trecho(t0, t1, sinal, g, fade=0.4):
    i0, i1 = max(0, int(t0 * sr)), min(n, int(t1 * sr)); m = min(i1 - i0, len(sinal))
    if m <= 0: return
    k = np.arange(m) / sr; fx[i0:i0 + m] += sinal[:m] * np.minimum(1, k / fade) * np.minimum(1, (m / sr - k) / fade) * g
def coracao(t0, t1, bpm=84, g=0.26):
    x = t0
    while x < t1:
        for o, gg in ((0, 1), (0.16, 0.7)): k = K(0.2); poe(np.sin(2 * np.pi * 50 * k) * np.exp(-k * 18), x + o, g * gg)
        x += 60 / bpm
fx += (0.010 * np.sin(2 * np.pi * 50 * tt) + 0.006 * np.sin(2 * np.pi * 100 * tt) + 0.025 * lp(rng.standard_normal(n), 180)) * np.minimum(1, tt / 0.5)
TONS = [(65.4, 98, 130.8), (73.4, 110, 146.8), (82.4, 123.5, 164.8), (61.7, 92.5, 123.5)]
B = T["blocos"]
for i, b in enumerate(B):
    fim = B[i + 1]["ini"] if i + 1 < len(B) else n / sr
    f1, f2, f3 = (55, 82.4, 116.5) if b["tenso"] else TONS[i % 4]; k = K(fim - b["ini"] + 0.6)
    pad = np.sin(2 * np.pi * f1 * k) * 0.5 + np.sin(2 * np.pi * f2 * k + 1) * 0.3 + np.sin(2 * np.pi * f3 * k + 2) * 0.22 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * k))
    if b["tenso"]: pad += np.sin(2 * np.pi * f3 * 1.06 * k) * 0.12 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * k))
    trecho(b["ini"] - 0.3, fim + 0.3, pad, 0.045 if b["tenso"] else 0.035, 1.2)
    if i: whoosh(b["ini"] - 0.3)
F = T["falas"]; ant = None
for i, q in enumerate(F):
    p = q.get("v")
    if not p: continue
    t0 = q["ini"]; fimD = next((x["ini"] for x in F[i + 1:] if x.get("v")), n / sr); c = p.get("c"); o = p.get("o"); dur = q["fim"] - q["ini"]
    novo = (c, o) != ant; ant = (c, o)
    if novo and c in ("obj", "estoque", "agua", "cama", "duto"): pop(t0 + 0.1, 560)
    if p.get("t"): pop(t0 + 0.4, 760, 0.07)
    if c in ("lista", "lousa"):
        for x in (p.get("q") or [0.1]):
            if 0 <= x <= 1: pop(t0 + x * dur, 700)
    if c == "escuro" and novo: baque(t0 + 0.05, 0.45, 44)
    if c == "escuro" and p.get("k") and novo:
        for j in range(8): clique(t0 - 0.9 + j * 0.11, 0.06)
    if c == "bici":
        m = int((fimD - t0) * sr); k = np.arange(m) / sr; trecho(t0, fimD, bp(rng.standard_normal(m), 400, 1800) * (0.55 + 0.45 * np.sin(2 * np.pi * 2.9 * k)), 0.045, 0.5)
    if c == "duto" and p.get("ar"):
        m = int((fimD - t0) * sr); k = np.arange(m) / sr; trecho(t0, fimD, bp(rng.standard_normal(m), 400, 2500) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.8 * k)), 0.04, 0.5)
    if o == "visor": bip(t0 + 0.5, 880 if p.get("cor") != "g" else 660)
    if o in ("marder", "filhotes") and novo:
        for j in range(5): clique(t0 + 0.2 + j * 0.13, 0.04)
    if o in ("gota", "vazio") or (c == "agua" and p.get("vz")):
        for j in range(int((fimD - t0) / 0.7)): pop(t0 + 0.3 + j * 0.7, 1500 + (j % 3) * 200, 0.025)
    if o == "cabo" and novo:
        k = K(0.3); poe(bp(rng.standard_normal(len(k)), 2000, 7000) * np.exp(-k * 14), t0 + 0.3, 0.09)
    if o == "coracao" or p.get("h") == "m" and c == "escuro": coracao(t0, min(fimD, t0 + 6))
    if c == "placar": sino(t0 + 0.3, (784, 587, 392), 0.07)
    if c == "pergunta": pop(t0 + 0.2, 900, 0.08)
    if c == "fim": sino(t0 + 0.3, (392, 523, 659, 784), 0.07)
    if c == "cama" and p.get("zz"):
        for j in range(int((fimD - t0) / 2.2)): k = K(1.0); poe(lp(rng.standard_normal(len(k)), 400) * np.sin(np.pi * k) ** 2, t0 + 0.3 + j * 2.2, 0.05)
voz = np.zeros(n); voz[:min(n, len(v))] = v[:n]
duck = 1 - 0.45 * np.clip(lp(np.abs(voz), 6) / 0.08, 0, 1); out = voz + fx * duck
fade = int(0.6 * sr); out[-fade:] *= np.linspace(1, 0, fade); out = np.tanh(out * 1.1) * 0.93
sf.write(D + "/mix.wav", out, sr)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", D + "/mix.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-t", f"{T['total']:.3f}", "-c:a", "aac", "-b:a", "192k", D + "/mix.m4a"], check=True)
print("ok", D, round(T["total"], 2))
