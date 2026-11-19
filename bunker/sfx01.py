# Som do vídeo 1 do Bunker: voz + ambiente + efeitos sintetizados, tudo a partir do tempos.json.
# Uso: python3 bunker/sfx01.py atlas-motion/public/bunker/v01   (gera mix.wav e mix.m4a com a duração exata do vídeo)
import json, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import lfilter, butter

D = sys.argv[1]
v, sr = sf.read(D + "/voz.wav"); T = json.load(open(D + "/tempos.json"))
QUADROS = round(T["dur"] * 30) + 75
n = int(QUADROS / 30 * sr); t = np.arange(n) / sr
rng = np.random.default_rng(7)
F = {q["id"]: q for q in T["falas"]}
blocos = []
for q in T["falas"]:
    b = q["id"].rsplit("_", 1)[0]
    if not blocos or blocos[-1][0] != b: blocos.append([b, q["ini"], q["fim"]])
    blocos[-1][2] = q["fim"]
ini = lambda i: F[i]["ini"]
at = lambda i, q: F[i]["ini"] + q * (F[i]["fim"] - F[i]["ini"])
fx = np.zeros(n)

def lp(x, fc): b, a = butter(2, fc / (sr / 2)); return lfilter(b, a, x)
def bp(x, f1, f2): b, a = butter(2, [f1 / (sr / 2), f2 / (sr / 2)], btype="band"); return lfilter(b, a, x)
def poe(x, t0, g=1.0):
    i = int(t0 * sr)
    if i < 0 or i >= n: return
    m = min(len(x), n - i); fx[i:i + m] += x[:m] * g
def env(d, a=0.01, r=None):
    k = np.arange(int(d * sr)) / sr; r = r or d
    return k, np.minimum(1, k / a) * np.minimum(1, (d - k) / r)
def ruido(d): return rng.standard_normal(int(d * sr))

def pop(t0, fq=640, g=0.10):
    k, _ = env(0.09); poe(np.sin(2 * np.pi * fq * k * (1 + 2 * k)) * np.exp(-k * 45), t0, g)
def whoosh(t0, g=0.06):
    k, e = env(0.45, 0.2, 0.25); poe(bp(ruido(0.45), 300, 2500) * e, t0 - 0.2, g)
def baque(t0, g=0.5, fq=52):
    k, _ = env(0.5); poe(np.sin(2 * np.pi * fq * k) * np.exp(-k * 9) + lp(ruido(0.5), 300) * np.exp(-k * 20) * 0.5, t0, g)
def coracao(t0, t1, bpm=70, g=0.35):
    p = 60 / bpm; x = t0
    while x < t1:
        for o, gg in ((0, 1), (0.16, 0.7)):
            k, _ = env(0.2); poe(np.sin(2 * np.pi * 50 * k) * np.exp(-k * 18), x + o, g * gg)
        x += p
def bip(t0, fq=880, g=0.06, d=0.16):
    k, e = env(d, 0.005, 0.05); poe(np.sin(2 * np.pi * fq * k) * e, t0, g)
def sino(t0, notas=(660, 880, 1320), g=0.07):
    for j, fq in enumerate(notas):
        k, _ = env(0.9); poe(np.sin(2 * np.pi * fq * k) * np.exp(-k * 5), t0 + j * 0.09, g)
def clique(t0, g=0.08):
    k, _ = env(0.03); poe(bp(ruido(0.03), 1500, 5000) * np.exp(-k * 120), t0, g)
def trecho(t0, t1, sinal, g, fade=0.4):
    i0, i1 = max(0, int(t0 * sr)), min(n, int(t1 * sr)); m = min(i1 - i0, len(sinal))
    if m <= 0: return
    k = np.arange(m) / sr; e = np.minimum(1, k / fade) * np.minimum(1, (m / sr - k) / fade)
    fx[i0:i0 + m] += sinal[:m] * e * g

# 1) ambiente do bunker: zumbido elétrico + ar parado
amb = 0.010 * np.sin(2 * np.pi * 50 * t) + 0.006 * np.sin(2 * np.pi * 100 * t) + 0.5 * lp(rng.standard_normal(n), 180) * 0.05
fx += amb * np.minimum(1, t / 0.5)

# 2) cama de tom por bloco (notas graves longas; blocos tensos ganham dissonância)
tons = {"gancho": (55, 82.4, 110, 1), "plano": (65.4, 98, 130.8, 0), "comida": (73.4, 110, 146.8, 0), "agua": (65.4, 98, 130.8, 0), "energia": (82.4, 123.5, 164.8, 0),
        "noite1": (55, 82.4, 116.5, 1), "rotina": (73.4, 110, 146.8, 0), "cabeca": (61.7, 92.5, 123.5, 1), "comentario": (65.4, 98, 130.8, 0), "problema": (55, 82.4, 116.5, 1),
        "explica": (58.3, 87.3, 110, 1), "investiga": (51.9, 77.8, 110, 1), "revela": (65.4, 98, 130.8, 0), "resolve": (73.4, 110, 146.8, 0), "armadilha": (82.4, 123.5, 164.8, 0), "fecho": (65.4, 98, 130.8, 0)}
for i, (b, a, z) in enumerate(blocos):
    fim = blocos[i + 1][1] if i + 1 < len(blocos) else n / sr
    f1, f2, f3, tenso = tons[b]; m = int((fim - a + 0.6) * sr); k = np.arange(m) / sr
    pad = np.sin(2 * np.pi * f1 * k) * 0.5 + np.sin(2 * np.pi * f2 * k + 1) * 0.3 + np.sin(2 * np.pi * f3 * k + 2) * 0.22 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * k))
    if tenso: pad += np.sin(2 * np.pi * f3 * 1.06 * k) * 0.12 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * k))
    trecho(a - 0.3, fim + 0.3, pad, 0.045 if tenso else 0.035, 1.2)
    if i: whoosh(a - 0.3)

# 3) porta: batida, volante e trava
baque(20 / 30, 0.6, 46)
k, _ = env(1.6); poe(lp(ruido(1.6), 2500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * k))) * np.exp(-k * 1.4), 26 / 30, 0.07)
baque(62 / 30, 0.35, 70)
pop(ini("gancho_2") + 62 / 30, 440)
for i in range(13): pop(ini("gancho_3") + (4 + i * 1.3) / 30, 700 + i * 25, 0.04)
for q in (0.02, 0.36, 0.7):
    k, _ = env(0.16); poe(np.sign(np.sin(2 * np.pi * 150 * k)) * np.exp(-k * 22), at("gancho_4", q), 0.07)
baque(ini("gancho_7") + 0.5, 0.25, 60)

# 4) estalos quando um objeto ou número entra em cena
for i, q, fq in [("plano_2", 0.02, 600), ("plano_2", 0.34, 660), ("plano_2", 0.66, 720), ("plano_3", 0.02, 600), ("plano_3", 0.2, 640), ("plano_3", 0.42, 680), ("plano_3", 0.62, 720),
                 ("plano_4", 0.12, 520), ("plano_6", 0.0, 600), ("plano_6", 0.34, 660), ("plano_6", 0.66, 720), ("plano_7", 0.3, 300),
                 ("comida_2", 0.05, 520), ("comida_5", 0.02, 900), ("comida_5", 0.42, 900), ("comida_6", 0.2, 1100), ("comida_7", 0.05, 600), ("comida_9", 0.42, 420), ("comida_9", 0.5, 440), ("comida_9", 0.72, 520),
                 ("comida_11", 0.0, 600), ("comida_11", 0.34, 660), ("comida_11", 0.62, 720), ("comida_13", 0.3, 700),
                 ("agua_2", 0.02, 520), ("agua_3", 0.3, 600), ("agua_4", 0.05, 640), ("agua_4", 0.5, 560), ("agua_4", 0.72, 600), ("agua_5", 0.1, 300), ("agua_6", 0.12, 600), ("agua_6", 0.36, 640), ("agua_6", 0.62, 680),
                 ("energia_2", 0.05, 300), ("energia_3", 0.08, 520), ("energia_3", 0.42, 600), ("energia_4", 0.15, 660),
                 ("rotina_2", 0.3, 300), ("rotina_5", 0.0, 600), ("rotina_5", 0.5, 520), ("rotina_8", 0.66, 520), ("rotina_8", 0.78, 660),
                 ("cabeca_2", 0.0, 500), ("cabeca_4", 0.0, 600), ("cabeca_4", 0.45, 400), ("cabeca_6", 0.0, 600), ("cabeca_6", 0.26, 660), ("cabeca_6", 0.66, 720), ("cabeca_7", 0.55, 800),
                 ("comentario_2", 0.1, 600), ("comentario_2", 0.2, 660), ("comentario_2", 0.3, 720), ("comentario_3", 0.02, 800),
                 ("explica_4", 0.45, 900), ("explica_5", 0.15, 900), ("explica_5", 0.6, 1000), ("explica_6", 0.02, 900), ("explica_6", 0.4, 900), ("explica_7", 0.5, 1100),
                 ("explica_8", 0.0, 500), ("explica_9", 0.0, 440), ("explica_10", 0.0, 380), ("explica_11", 0.0, 320), ("explica_12", 0.05, 700), ("explica_13", 0.1, 500),
                 ("investiga_2", 0.02, 600), ("investiga_2", 0.4, 660), ("investiga_2", 0.62, 720), ("investiga_5", 0.05, 300),
                 ("revela_3", 0.42, 600), ("revela_3", 0.58, 660), ("revela_3", 0.78, 720),
                 ("armadilha_4", 0.02, 500), ("armadilha_4", 0.24, 600), ("armadilha_4", 0.44, 660), ("armadilha_4", 0.72, 760), ("armadilha_7", 0.0, 600), ("armadilha_7", 0.3, 600), ("armadilha_7", 0.62, 600), ("armadilha_14", 0.4, 300),
                 ("fecho_2", 0.22, 700), ("fecho_2", 0.5, 760), ("fecho_2", 0.78, 820), ("fecho_6", 0.52, 700), ("fecho_6", 0.68, 760), ("fecho_6", 0.84, 820), ("fecho_9", 0.05, 500)]:
    pop(at(i, q), fq)
for i in ("comida_5", "comida_6", "explica_4", "explica_5", "explica_6", "explica_7"):  # giz na lousa
    k, e = env(0.5, 0.05, 0.2); poe(bp(ruido(0.5), 2500, 6000) * e * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 9 * k))), at(i, 0.05), 0.02)
sino(ini("comida_12") + 0.1, (523, 659, 784))

# 5) bicicleta: giro da roda (energia 4 a 6 e problema 6)
def bici(t0, t1, g=0.05):
    m = int((t1 - t0) * sr); k = np.arange(m) / sr
    trecho(t0, t1, bp(rng.standard_normal(m), 400, 1800) * (0.55 + 0.45 * np.sin(2 * np.pi * 2.9 * k)), g, 0.5)
bici(ini("energia_4"), F["energia_6"]["fim"] + 0.3); bici(ini("problema_6"), at("problema_6", 0.45), 0.04)
baque(ini("energia_8") + 0.1, 0.3, 60)

# 6) primeira noite: silêncio, ventilador, coração, arranhão
m = int((F["noite1_8"]["fim"] - ini("noite1_1") + 1) * sr); k = np.arange(m) / sr
trecho(ini("noite1_1"), F["noite1_8"]["fim"] + 1, bp(rng.standard_normal(m), 150, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 11 * k)), 0.03, 1.0)
coracao(ini("noite1_4"), F["noite1_5"]["fim"], 62, 0.3)
def arranhao(t0, g=0.09):
    for j in range(3):
        k, e = env(0.22, 0.02, 0.1); poe(bp(ruido(0.22), 1800, 5200) * e * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * k))), t0 + j * 0.3, g)
arranhao(ini("noite1_5") + 1.2, 0.06); arranhao(at("noite1_6", 0.1)); arranhao(at("noite1_6", 0.7), 0.07); arranhao(ini("revela_4") + 0.3, 0.07)

# 7) sintomas e CO2: pulso de dor, alarme do medidor, coração acelerando
for i in ("problema_2", "problema_6"):
    for j in range(4): baque(at(i, 0.1) + j * 0.6, 0.12, 80)
for j in range(3): bip(at("problema_9", 0.15) + j * 0.35, 880, 0.07)
bip(at("problema_10", 0.25), 660, 0.05, 0.3)
coracao(ini("explica_11"), F["explica_14"]["fim"], 96, 0.3)
baque(at("explica_14", 0.35), 0.5, 48)

# 8) duto: ventilador, parafusos, grade caindo, olhos
m = int((F["investiga_9"]["fim"] - ini("investiga_1")) * sr); k = np.arange(m) / sr
trecho(ini("investiga_1"), F["investiga_9"]["fim"], bp(rng.standard_normal(m), 150, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 11 * k)), 0.035, 0.8)
coracao(ini("investiga_7"), F["investiga_12"]["fim"] + 0.5, 104, 0.28)
for i, q in (("investiga_8", 0.2), ("investiga_8", 0.5), ("investiga_9", 0.62)):
    for j in range(5): clique(at(i, q) - 0.4 + j * 0.08)
    pop(at(i, q), 1300, 0.05)
for j in range(8): clique(at("investiga_8", 0.75) + j * 0.12, 0.05)
tq = ini("investiga_10") + 16 / 30
k, _ = env(0.9); poe((np.sin(2 * np.pi * 410 * k) + np.sin(2 * np.pi * 977 * k) * 0.6 + np.sin(2 * np.pi * 1630 * k) * 0.4) * np.exp(-k * 7) + bp(ruido(0.9), 800, 4000) * np.exp(-k * 25), tq, 0.16)
k, _ = env(0.5); poe((np.sin(2 * np.pi * 410 * k) + np.sin(2 * np.pi * 977 * k) * 0.6) * np.exp(-k * 12), tq + 0.28, 0.07)
clique(at("investiga_11", 0.45), 0.1)
te = at("investiga_12", 0.42)
k, e = env(2.0, 0.02, 1.6); poe((np.sin(2 * np.pi * 43 * k) + np.sin(2 * np.pi * 61.5 * k) * 0.7) * e, te, 0.5); poe(bp(ruido(2.0), 3000, 7000) * e, te, 0.03)

# 9) revelação e conserto
k, _ = env(0.35); poe(np.sin(2 * np.pi * (300 + 500 * k) * k) * np.exp(-k * 8), ini("revela_2") - 0.05, 0.12)  # "boing" de alívio
def fauch(t0, g=0.12):
    k, e = env(0.6, 0.05, 0.4); poe(bp(ruido(0.6), 2500, 7000) * e, t0, g)
fauch(ini("resolve_4") + 0.1)
for j in range(6): clique(at("resolve_4", 0.52) + j * 0.09, 0.07)
for q in (0.3, 0.42, 0.54, 0.66, 0.78): baque(at("resolve_3", q) + 14 / 30, 0.08, 120)
for j in range(4): clique(at("resolve_5", 0.55) + j * 0.12)
m = int((F["resolve_8"]["fim"] + 0.8 - ini("resolve_7")) * sr); k = np.arange(m) / sr
trecho(ini("resolve_7") - 0.1, F["resolve_8"]["fim"] + 0.8, bp(rng.standard_normal(m), 500, 3000) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.8 * k)), 0.06, 0.5)
bip(at("resolve_9", 0.5), 660, 0.05, 0.25)
sino(at("resolve_10", 0.4))

# 10) armadilha
for j in range(10): clique(ini("armadilha_9") + j * 0.16, 0.035)
k, e = env(0.25, 0.02, 0.1); poe(np.sin(2 * np.pi * (500 + 900 * k) * k) * e, at("armadilha_10", 0.3), 0.06)
baque(at("armadilha_11", 0.25) + 7 / 30, 0.45, 70)
for j in range(8): clique(at("armadilha_12", 0.62) + j * 0.14, 0.035)
sino(ini("armadilha_13") + 0.3, (784, 587, 392), 0.08)

# 11) fecho
sino(ini("fecho_1") + 0.1, (523, 659, 784), 0.05)
fauch(at("fecho_8", 0.5), 0.05)
baque(ini("fecho_10") + 0.05, 0.5, 44)
sino(ini("fecho_11") + 0.3, (392, 523, 659, 784), 0.07)

# mixagem: efeitos abaixam um pouco enquanto há fala
voz = np.zeros(n); voz[:min(n, len(v))] = v[:n]
nivel = lp(np.abs(voz), 6); duck = 1 - 0.45 * np.clip(nivel / 0.08, 0, 1)
out = voz + fx * duck
fade = int(0.6 * sr); out[-fade:] *= np.linspace(1, 0, fade)
out = np.tanh(out * 1.1) * 0.93
sf.write(D + "/mix.wav", out, sr)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", D + "/mix.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-t", f"{QUADROS / 30:.3f}", "-c:a", "aac", "-b:a", "192k", D + "/mix.m4a"], check=True)
print("ok", QUADROS, round(n / sr, 2))
