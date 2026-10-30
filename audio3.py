"""Trilha "leve" (estilo vídeo de produto: pads quentes, pluck, percussão suave) + efeitos de interface + voz.

Tudo sintetizado aqui, sem samples de terceiros. Saída estéreo com reverb.
uso: python3 audio3.py config.json
config: { "saida", "dur", "estilo": 0..2, "voz": caminho|null,
          "fx": [[tipo, segundo], ...]  tipos: toque, tecla, swish, pop, chime, logo, sobe }
"""
import json, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 100
BEAT = 60 / BPM
rng = np.random.default_rng(5)


def hz(m):  # nota midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)


# progressões (midi) — acordes com 7ª/9ª, soam "produto premium"
PROGS = [
    [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]],   # Fmaj7 Em7 Dm7 Cmaj7
    [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 62], [55, 59, 62, 66]],   # Am7 Fmaj7 Cadd9 G(maj7)
    [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]],   # Dm7 G7 Cmaj7 Am7
]


def filtro(x, tipo, f, ordem=2):
    sos = butter(ordem, f, btype=tipo, fs=SR, output='sos')
    return sosfilt(sos, x)


def env(n, a=0.005, d=0.3, s=0.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-t / d))


def mixar(buf, sinal, em, pan=0.0):
    """buf estéreo (n,2); pan -1..1"""
    i = int(em * SR)
    if i >= len(buf) or i + len(sinal) <= 0: return
    if i < 0: sinal = sinal[-i:]; i = 0
    j = min(len(buf), i + len(sinal))
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[i:j, 0] += sinal[: j - i] * l * 1.414
    buf[i:j, 1] += sinal[: j - i] * r * 1.414


def reverb(x, dur=2.4, mix=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 3.2)
        ir = filtro(ir, 'lowpass', 5500)
        ir /= np.sqrt(np.sum(ir ** 2))
        out[:, c] = fftconvolve(x[:, c], ir)[: len(x)]
    return x * (1 - mix) + out * mix * 1.6


# ── instrumentos ──
def pad(midis, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for m in midis:
        for det in (-0.08, 0.0, 0.08):
            f = hz(m + det)
            s += np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t) + 0.06 * np.sin(2 * np.pi * 3 * f * t)
    a = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.6).clip(0, 1)
    return filtro(s * a, 'lowpass', 2800) * 0.02


def pluck(m, dur=0.7, vol=0.09):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9) + 0.2 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 14)
    return s * np.minimum(1, t / 0.003) * vol


def baixo(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return s * env(n, 0.01, 0.5, 0.35) * np.minimum(1, (dur - t) / 0.05).clip(0, 1) * 0.1


def bumbo():
    n = int(0.4 * SR); t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.3


def estalo():
    n = int(0.25 * SR); t = np.arange(n) / SR
    r = filtro(rng.standard_normal(n), 'bandpass', [1200, 6000]) * np.exp(-t * 28)
    return r * 0.22


def shaker():
    n = int(0.08 * SR); t = np.arange(n) / SR
    return filtro(rng.standard_normal(n), 'highpass', 7000) * np.minimum(1, t / 0.01) * np.exp(-t * 60) * 0.1


def trilha(dur, estilo=0):
    prog = PROGS[estilo % len(PROGS)]
    n = int(dur * SR) + SR * 3
    mus = np.zeros((n, 2)); bat = np.zeros((n, 2))
    compassos = int(dur / (BEAT * 4)) + 2
    padrao = [0, 2, 3, 1, 2, 3, 1, 2]  # arpejo em colcheias
    for c in range(compassos):
        t0 = c * BEAT * 4
        ac = prog[c % 4]
        mixar(mus, pad(ac, BEAT * 4 + 0.6), t0)
        mixar(mus, baixo(ac[0] - 12, BEAT * 1.9), t0)
        mixar(mus, baixo(ac[0] - 12, BEAT * 1.9), t0 + BEAT * 2)
        if c >= 1 or dur < 10:
            for k, idx in enumerate(padrao):
                m = ac[idx] + 12
                mixar(mus, pluck(m, vol=0.11 if k % 2 else 0.135), t0 + k * BEAT / 2, pan=(-0.45 if k % 2 == 0 else 0.45))
        for b in range(4):
            tb = t0 + b * BEAT
            if b in (0, 2): mixar(bat, bumbo(), tb)
            if b in (1, 3) and c >= 1: mixar(bat, estalo(), tb, pan=0.1)
            for h in range(2):
                mixar(bat, shaker() * (1.0 if h else 0.6), tb + h * BEAT / 2, pan=0.3)
    # "pump" suave da batida no pad
    t = np.arange(n) / SR
    fase = (t % BEAT) / BEAT
    pump = 1 - 0.28 * np.exp(-fase * 7)
    mus *= pump[:, None]
    mix = mus + bat
    return mix[: int(dur * SR)]


# ── efeitos de interface ──
def fx_toque():
    n = int(0.06 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 140) * 0.5 + filtro(rng.standard_normal(n), 'highpass', 3000) * np.exp(-t * 200) * 0.25
    return s * 0.7


def fx_tecla():
    n = int(0.035 * SR); t = np.arange(n) / SR
    f = 3200 + rng.uniform(-500, 500)
    return (filtro(rng.standard_normal(n), 'bandpass', [f * 0.6, f * 1.4]) * np.exp(-t * 260)) * 0.32


def fx_swish(dur=0.55):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    r = rng.standard_normal(n)
    a = filtro(r, 'bandpass', [500, 2500]); b = filtro(r, 'bandpass', [2500, 9000])
    mistura = a * (1 - t) + b * t
    return mistura * np.sin(np.pi * t) ** 2.2 * 0.22


def fx_pop():
    n = int(0.16 * SR); t = np.arange(n) / SR
    f = 380 + 700 * (1 - np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26) * 0.32


def sino(f, dur=1.6, vol=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    parc = [(1, 1, 3.0), (2.0, 0.45, 5), (2.76, 0.3, 7), (5.4, 0.12, 11)]
    s = sum(a * np.sin(2 * np.pi * f * p * t) * np.exp(-t * d) for p, a, d in parc)
    return s * np.minimum(1, t / 0.002) * vol


def fx_chime():
    out = np.zeros(int(1.9 * SR))
    a = sino(hz(88)); b = sino(hz(95))
    out[: len(a)] += a; k = int(0.11 * SR); out[k:k + len(b)] += b[: len(out) - k]
    return out * 0.8


def fx_logo():
    n = int(2.2 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (42 + 30 * np.exp(-t * 12)) * t) * np.exp(-t * 2.6) * 0.5
    brilho = sum(sino(hz(m), 2.2, 0.08) for m in (84, 88, 91, 96))
    return boom + brilho[:n]


def fx_sobe(dur=1.4):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    r = rng.standard_normal(n)
    out = np.zeros(n)
    for k in range(14):
        a, b = k * n // 14, (k + 1) * n // 14
        out[a:b] = filtro(r[a:b], 'bandpass', [300 + 300 * k, 900 + 700 * k])
    return out * t ** 2.4 * 0.18


FX = {'toque': fx_toque, 'tecla': fx_tecla, 'swish': fx_swish, 'pop': fx_pop, 'chime': fx_chime, 'logo': fx_logo, 'sobe': fx_sobe}


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def main():
    cfg = json.load(open(sys.argv[1]))
    dur = cfg['dur']
    mus = trilha(dur, cfg.get('estilo', 0))
    n = len(mus)
    fx = np.zeros((n, 2))
    for tipo, s in cfg.get('fx', []):
        sinal = FX[tipo]()
        em = s - (len(sinal) / SR if tipo == 'sobe' else 0) - (0.3 if tipo == 'swish' else 0)
        mixar(fx, sinal, em, pan=rng.uniform(-0.25, 0.25) if tipo in ('pop', 'tecla', 'toque') else 0)
    # entrada e saída da música
    mus[: int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]
    fim = int(1.4 * SR); mus[-fim:] *= np.linspace(1, 0, fim)[:, None] ** 1.5
    if cfg.get('voz'):
        v, sr = sf.read(cfg['voz'])
        if v.ndim > 1: v = v.mean(axis=1)
        vb = np.zeros(n); vb[: min(n, len(v))] = v[:n]
        vb = filtro(vb, 'highpass', 90)
        envv = filtro(np.abs(vb), 'lowpass', 5); envv /= envv.max() + 1e-9
        ganho = 1 - 0.62 * np.clip(envv * 3, 0, 1)
        vb *= 10 ** ((-16 - rms_db(vb[np.abs(vb) > 1e-4])) / 20)
        seco = mus * 0.55 * ganho[:, None] + fx * 0.8
        mix = reverb(seco, mix=0.2) + np.stack([vb, vb], axis=1) + reverb(np.stack([vb, vb], axis=1), 1.0, 0.06) * 0.0
    else:
        mix = reverb(mus * 0.9 + fx * 0.8, mix=0.22)
    mix = filtro(mix.T, 'highpass', 35).T
    mix *= 10 ** ((-17 - rms_db(mix)) / 20)
    mix = 0.95 * np.tanh(mix * 1.1) / np.tanh(1.1)
    sf.write(cfg['saida'], mix.astype(np.float32), SR, subtype='PCM_16')
    print('ok', cfg['saida'])


if __name__ == '__main__':
    main()
