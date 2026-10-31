"""Trilha "keynote" (120 bpm, minimalista e marcada) + quebras de silêncio antes dos impactos + efeitos.

uso: python3 audio4.py config.json
config: { "saida", "dur", "estilo": 0..2, "quebras": [s], "fx": [[tipo, s], ...], "intro": compassos só com pad }
tipos de fx: os do audio3 + grave, brilho, vidro
"""
import json, sys
import numpy as np
import soundfile as sf
import audio3 as A
from audio3 import SR, filtro, mixar, reverb, hz, sino, rms_db

BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(9)
PROGS = [
    [[57, 60, 64, 71], [53, 57, 60, 67], [48, 55, 60, 64], [55, 59, 62, 69]],   # Am(add9) F C G
    [[50, 57, 60, 65], [46, 53, 58, 62], [53, 57, 60, 64], [48, 55, 62, 64]],   # Dm Bb F C
    [[52, 59, 62, 67], [48, 55, 60, 64], [55, 62, 67, 71], [50, 57, 62, 66]],   # Em C G D
]


def bumbo():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t * 32)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = filtro(rng.standard_normal(n), 'highpass', 2500) * np.exp(-t * 400) * 0.25
    return (corpo + click) * 0.4


def palma():
    n = int(0.3 * SR); t = np.arange(n) / SR
    r = filtro(rng.standard_normal(n), 'bandpass', [900, 5000])
    e = sum(np.exp(-np.clip(t - k * 0.011, 0, None) * 70) * (t >= k * 0.011) for k in range(3)) + np.exp(-t * 18) * 0.4
    return r * e * 0.2


def chimbal(aberto=False):
    n = int((0.18 if aberto else 0.05) * SR); t = np.arange(n) / SR
    return filtro(rng.standard_normal(n), 'highpass', 8000) * np.exp(-t * (14 if aberto else 90)) * 0.16


def stab(midis, dur=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for m in midis:
        for d in (-0.07, 0.07):
            f = hz(m + 12 + d)
            s += sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7))
    s = filtro(s, 'lowpass', 3800)
    return s * np.minimum(1, t / 0.004) * np.exp(-t * 11) * 0.055


def baixo(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 5))
    return filtro(s, 'lowpass', 500) * np.minimum(1, t / 0.005) * np.exp(-t * 5) * np.minimum(1, (dur - t) / 0.02).clip(0, 1) * 0.12


def trilha(dur, estilo=0, intro=1):
    prog = PROGS[estilo % len(PROGS)]
    n = int(dur * SR) + SR * 3
    mus = np.zeros((n, 2)); bat = np.zeros((n, 2))
    ritmo = [0, 0.75, 1.5, 2.5, 3.0]
    for c in range(int(dur / (BEAT * 4)) + 2):
        t0 = c * BEAT * 4; ac = prog[c % 4]
        mixar(mus, A.pad(ac, BEAT * 4 + 0.6) * 0.9, t0)
        for b in range(16):  # chimbal em semicolcheias
            mixar(bat, chimbal(b % 4 == 2) * (1.0 if b % 2 == 0 else 0.55), t0 + b * BEAT / 4, pan=0.25)
        if c < intro: continue
        for b in range(4):
            mixar(bat, bumbo(), t0 + b * BEAT)
            if b in (1, 3): mixar(bat, palma(), t0 + b * BEAT, pan=-0.05)
        for k in range(8):
            mixar(mus, baixo(ac[0] - 12, BEAT / 2 * 0.9), t0 + k * BEAT / 2 + (BEAT / 4 if k % 2 else 0) * 0)
        for r in ritmo:
            mixar(mus, stab(ac[1:]), t0 + r * BEAT, pan=0.2 if r % 1 else -0.2)
    t = np.arange(n) / SR
    pump = 1 - 0.35 * np.exp(-((t % BEAT) / BEAT) * 8)
    mus *= pump[:, None]
    return (mus + bat)[: int(dur * SR)]


def fx_grave():
    n = int(1.6 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 9)) * t) * np.exp(-t * 2.2) * 0.75
    s += filtro(rng.standard_normal(n), 'lowpass', 600) * np.exp(-t * 10) * 0.25
    return s


def fx_brilho():
    n = int(1.2 * SR); t = np.arange(n) / SR
    s = sum(sino(hz(m), 1.2, 0.05)[:n] * (t >= k * 0.05) for k, m in enumerate([84, 88, 91, 95, 100]))
    return s


def fx_vidro():
    return sino(hz(100), 0.6, 0.18) + sino(hz(107), 0.6, 0.08)


FX = dict(A.FX, grave=fx_grave, brilho=fx_brilho, vidro=fx_vidro)


def main():
    cfg = json.load(open(sys.argv[1]))
    dur = cfg['dur']
    mus = trilha(dur, cfg.get('estilo', 0), cfg.get('intro', 1))
    n = len(mus)
    # quebras: silêncio de meio tempo antes do impacto
    for q in cfg.get('quebras', []):
        a, b = int((q - BEAT * 0.75) * SR), int(q * SR)
        if 0 <= a < n:
            j = min(b, n)
            mus[a:j] *= 0.06
    fx = np.zeros((n, 2))
    for tipo, s in cfg.get('fx', []):
        sinal = FX[tipo]()
        em = s - (len(sinal) / SR if tipo == 'sobe' else 0) - (0.3 if tipo == 'swish' else 0)
        mixar(fx, sinal, em, pan=rng.uniform(-0.25, 0.25) if tipo in ('pop', 'tecla', 'toque', 'vidro') else 0)
    fim = int(1.2 * SR); mus[-fim:] *= np.linspace(1, 0, fim)[:, None] ** 1.5
    mix = reverb(mus * 0.9 + fx * 0.85, mix=0.16)
    mix = filtro(mix.T, 'highpass', 32).T
    mix *= 10 ** ((-17 - rms_db(mix)) / 20)
    mix = 0.95 * np.tanh(mix * 1.1) / np.tanh(1.1)
    sf.write(cfg['saida'], mix.astype(np.float32), SR, subtype='PCM_16')
    print('ok', cfg['saida'])


if __name__ == '__main__':
    main()
