import json, numpy as np, soundfile as sf, subprocess, sys
D = sys.argv[1]; v, sr = sf.read(D + "/voz.wav"); T = json.load(open(D + "/tempos.json"))
n = int((T["dur"] + 0.8) * sr); out = np.zeros(n); out[:len(v)] += v
rng = np.random.default_rng(4); t = np.arange(n) / sr
def lp(x, k):
    y = np.zeros_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def poe(x, ini, g=1.0):
    i = int(ini * sr); m = min(len(x), n - i)
    if m > 0: out[i:i + m] += x[:m] * g
f = {q["id"]: q for q in T["falas"]}
# zumbido do bunker
out += (0.012 * np.sin(2 * np.pi * 50 * t) + 0.008 * np.sin(2 * np.pi * 100 * t) + 0.01 * lp(rng.standard_normal(n), 0.02)) * np.minimum(1, t / 0.5)
# porta batendo (quadro 20) e volante
d = np.arange(int(0.9 * sr)) / sr
poe(np.sin(2 * np.pi * 46 * d) * np.exp(-d * 6) * 0.9 + lp(rng.standard_normal(len(d)), 0.08) * np.exp(-d * 14) * 0.8, 20 / 30, 0.55)
d = np.arange(int(1.6 * sr)) / sr
poe(lp(rng.standard_normal(len(d)), 0.25) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * d))) * np.exp(-d * 1.4), 26 / 30, 0.08)
d = np.arange(int(0.25 * sr)) / sr
poe(np.sin(2 * np.pi * 70 * d) * np.exp(-d * 18), 62 / 30, 0.4)
# estalos: latas, etiquetas, proibidos
def pop(ini, fq=620, g=0.12):
    d = np.arange(int(0.09 * sr)) / sr; poe(np.sin(2 * np.pi * fq * d * (1 + 2 * d)) * np.exp(-d * 45), ini, g)
for i in range(13): pop(f["b1"]["ini"] + (10 + i * 1.3) / 30, 700 + i * 25, 0.05)
pop(f["b1"]["ini"] + 34 / 30, 520); pop(f["b1"]["ini"] + 62 / 30, 440); pop(f["b1"]["ini"] + 92 / 30, 880, 0.08)
for k in (2, 24, 46):
    d = np.arange(int(0.16 * sr)) / sr; poe(np.sign(np.sin(2 * np.pi * 150 * d)) * np.exp(-d * 22), f["b2"]["ini"] + k / 30, 0.09)
for k in (12, 30, 56): pop(f["c2"]["ini"] + k / 30, 1500, 0.04)
# luz piscando
i0 = int(f["d0"]["ini"] * sr); i1 = int((f["d1"]["ini"] + 0.66) * sr)
bz = np.sign(np.sin(2 * np.pi * 100 * t[i0:i1])) * (rng.random(i1 - i0) > 0.5) ; out[i0:i1] += lp(bz, 0.3) * 0.05
# alarme e coração
a0 = f["d2"]["ini"]
for k in range(8):
    d = np.arange(int(0.16 * sr)) / sr; poe(np.sin(2 * np.pi * 880 * d) * np.minimum(1, d * 80) * np.exp(-d * 9), a0 + k * 0.67, 0.07)
    d = np.arange(int(0.22 * sr)) / sr; poe(np.sin(2 * np.pi * 52 * d) * np.exp(-d * 16), a0 + k * 0.67 + 0.3, 0.5)
out = np.tanh(out * 1.15) * 0.92
sf.write(D + "/mix.wav", out, sr)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", D + "/mix.wav", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", D + "/mix.m4a"], check=True)
print("ok", round(n / sr, 2))
