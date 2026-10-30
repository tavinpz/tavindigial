"""Trilha v2 (120 bpm, casa com os cortes de 15 quadros) + efeitos por evento + voz com ducking.

uso: python3 audio2.py config.json
config: { "saida", "dur", "cortes": [s], "pops": [s], "riser": s, "voz": caminho|null, "estilo": 0..3 }
"""
import json, sys
import numpy as np
import soundfile as sf
import audio as A

SR = A.SR
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(11)

PROGS = [
    [(110.0, [220.0, 261.63, 329.63]), (87.31, [174.61, 220.0, 261.63]), (130.81, [261.63, 329.63, 392.0]), (98.0, [196.0, 246.94, 293.66])],   # Am F C G
    [(73.42, [293.66, 349.23, 440.0]), (116.54, [233.08, 293.66, 349.23]), (87.31, [349.23, 440.0, 523.25]), (130.81, [261.63, 329.63, 392.0])],  # Dm Bb F C
    [(82.41, [329.63, 392.0, 493.88]), (130.81, [261.63, 329.63, 392.0]), (98.0, [293.66, 392.0, 493.88]), (146.83, [293.66, 369.99, 440.0])],  # Em C G D
]


def trilha(dur, estilo=0):
    prog = PROGS[estilo % len(PROGS)]
    buf = np.zeros(int(dur * SR) + SR)
    for b in range(int(dur / BEAT) + 2):
        t = b * BEAT
        A.mixar(buf, A.kick() * 1.05, t)
        if b % 2 == 1: A.mixar(buf, A.palma() * 1.1, t)
        A.mixar(buf, A.chimbal() * 1.2, t + BEAT / 2)
        A.mixar(buf, A.chimbal() * 0.5, t + BEAT * 0.25)
        A.mixar(buf, A.chimbal() * 0.5, t + BEAT * 0.75)
        raiz, acorde = prog[(b // 4) % 4]
        for k in range(4):  # baixo em semicolcheias com "pump"
            A.mixar(buf, A.lowpass_rapido(A.nota(raiz, BEAT / 4, 'saw', 0.13 * (0.6 if k == 0 else 1), 0.07), 700), t + k * BEAT / 4)
        if b % 2 == 0:
            stab = sum(A.nota(f, BEAT * 0.45, 'saw', 0.045, 0.09) for f in acorde)
            A.mixar(buf, A.lowpass_rapido(stab, 3000), t + BEAT / 2)
        if b % 8 == 0:  # pad longo de fundo
            pad = sum(A.nota(f / 2, BEAT * 8, 'sin', 0.03, 3.5) for f in acorde)
            A.mixar(buf, pad, t)
    return buf[: int(dur * SR)]


def pop():
    n = int(0.09 * SR); t = np.arange(n) / SR
    f = 900 + 1400 * np.exp(-t * 60)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * 0.35


def riser(dur=1.6):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    r = rng.standard_normal(n)
    out = np.zeros(n)
    for k in range(16):
        a, b = k * n // 16, (k + 1) * n // 16
        out[a:b] = A.lowpass_rapido(r[a:b], 300 + 7000 * (k / 16) ** 2)
    tom = np.sin(2 * np.pi * np.cumsum(200 + 900 * t ** 2) / SR) * 0.15
    return (out * 0.45 + tom) * t ** 2


def main():
    cfg = json.load(open(sys.argv[1]))
    dur = cfg['dur']
    musica = trilha(dur, cfg.get('estilo', 0))
    fx = np.zeros_like(musica)
    A.mixar(fx, A.impacto() * 0.9, 0.0)  # entra batendo no gancho
    for c in cfg.get('cortes', []):
        A.mixar(fx, A.whoosh(), max(0, c - 0.36))
    for p in cfg.get('pops', []):
        A.mixar(fx, pop(), p)
    if cfg.get('riser'):
        r = riser(); A.mixar(fx, r, max(0, cfg['riser'] - len(r) / SR)); A.mixar(fx, A.impacto(), cfg['riser'])
    n = len(musica)
    musica[-int(0.9 * SR):] *= np.linspace(1, 0, int(0.9 * SR))
    if cfg.get('voz'):
        v, sr = sf.read(cfg['voz'])
        if v.ndim > 1: v = v.mean(axis=1)
        vb = np.zeros(n); vb[: min(n, len(v))] = v[:n]
        env = A.lowpass_rapido(np.abs(vb), 6); env /= env.max() + 1e-9
        ganho = 1 - 0.7 * np.clip(env * 3, 0, 1)
        vb *= 10 ** ((-13 - A.lufs_aprox(vb[vb != 0])) / 20)
        mix = musica * 0.45 * ganho + fx * 0.55 + vb
    else:
        mix = musica * 0.85 + fx * 0.7
    mix *= 10 ** ((-16 - A.lufs_aprox(mix)) / 20)
    mix = 0.9 * np.tanh(mix * 1.2) / np.tanh(1.2)
    sf.write(cfg['saida'], np.stack([mix, mix], axis=1).astype(np.float32), SR, subtype='PCM_16')
    print('ok', cfg['saida'])


if __name__ == '__main__':
    main()
