"""Trilha da Thata: marimba clara + house macio, tudo sintetizado aqui (sem samples).

uso: python3 audio_thata.py config.json
config: { "saida", "dur", "estilo": 0..2, "quebras": [s...], "secoes": [[modo, ini_s, fim_s], ...], "fx": [[tipo, s], ...] }
modos: calmo (marimba + pad, sem bateria), cheio (tudo), tenso (pulso grave + tique, menor)
"""
import json, sys
import numpy as np
import soundfile as sf
import audio3 as A
from audio3 import SR, filtro, mixar, reverb, hz, sino, rms_db, pad, bumbo, shaker

BPM = 112
BEAT = 60 / BPM
rng = np.random.default_rng(31)

# progressões claras, subindo (midi)
PROGS = [
    [[50, 57, 61, 64], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 57, 61]],   # Dadd9 Bm7 Gmaj7 A
    [[45, 52, 56, 59], [42, 49, 52, 57], [38, 45, 49, 54], [40, 47, 52, 56]],   # A F#m D E
    [[48, 55, 59, 62], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]],   # Cmaj7 Am7 Fmaj7 G
]


def marimba(m, dur=0.45, vol=0.12):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30) + 0.12 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t * 60)
    return s * np.minimum(1, t / 0.001) * vol


def sub(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / 0.01) * np.exp(-t * 2.5) * 0.28


def aro():
    n = int(0.08 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) * 0.4 + filtro(rng.standard_normal(n), 'bandpass', [1500, 5000])) * np.exp(-t * 70) * 0.22


def tique():
    n = int(0.04 * SR); t = np.arange(n) / SR
    return filtro(rng.standard_normal(n), 'bandpass', [3000, 7000]) * np.exp(-t * 300) * 0.2


def camadas(dur, estilo):
    prog = PROGS[estilo % len(PROGS)]
    n = int(dur * SR) + SR * 3
    calmo = np.zeros((n, 2)); bat = np.zeros((n, 2)); tenso = np.zeros((n, 2))
    arp = [0, 2, 3, 1, 3, 2, 1, 3]
    for c in range(int(dur / (BEAT * 4)) + 2):
        t0 = c * BEAT * 4; ac = prog[c % 4]
        mixar(calmo, pad(ac, BEAT * 4 + 0.6) * 0.7, t0)
        for k in range(16):
            if k % 2 == 0 or k in (3, 11):
                m = ac[arp[(k // 2) % 8]] + 12
                mixar(calmo, marimba(m, vol=0.12 if k % 4 == 0 else 0.085), t0 + k * BEAT / 4, pan=-0.35 if (k // 2) % 2 else 0.35)
        for b in range(4):
            tb = t0 + b * BEAT
            mixar(bat, bumbo() * 0.9, tb)
            if b in (1, 3): mixar(bat, aro(), tb, pan=0.08)
            mixar(bat, shaker() * 0.8, tb + BEAT / 2, pan=0.3)
            mixar(bat, sub(ac[0] - 12, BEAT * 0.9), tb + BEAT / 2)
        # tenso: grave em menor + tique de relógio
        for b in range(4):
            mixar(tenso, sub(ac[0] - 13, BEAT * 0.95) * 1.2, t0 + b * BEAT)
            mixar(tenso, tique(), t0 + b * BEAT + BEAT / 2, pan=0.25)
    t = np.arange(n) / SR
    pump = 1 - 0.32 * np.exp(-((t % BEAT) / BEAT) * 8)
    calmo *= pump[:, None]
    return calmo, bat, tenso


def fx_msg():
    out = np.zeros(int(0.5 * SR))
    a = sino(hz(83), 0.4, 0.16); b = sino(hz(90), 0.45, 0.14)
    out[: len(a)] += a; k = int(0.07 * SR); out[k:k + len(b)] += b[: len(out) - k]
    return out


def fx_tom():  # toque de chamada genérico (duas notas, 2 pulsos)
    out = np.zeros(int(1.4 * SR))
    for k in range(2):
        for j, m in enumerate((81, 85)):
            s = sino(hz(m), 0.35, 0.12); i = int((k * 0.55 + j * 0.12) * SR)
            out[i:i + len(s)] += s[: len(out) - i]
    return out


def fx_erro():
    n = int(0.45 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 110 * t) + 0.5 * np.sin(2 * np.pi * 116 * t)) * np.exp(-t * 7) * 0.3


def fx_rebobina():
    s = A.fx_sobe(1.0)
    return s[::-1].copy() * 1.2


import audio4 as A4
FX = dict(A4.FX, msg=fx_msg, tom=fx_tom, erro=fx_erro, rebobina=fx_rebobina)


def faixa(n, secoes, modo):
    g = np.zeros(n)
    for m, a, b in secoes:
        if m != modo: continue
        i, j = int(a * SR), min(n, int(b * SR))
        if i >= n: continue
        r = int(0.25 * SR)
        e = np.ones(j - i); k = min(r, len(e) // 2)
        e[:k] = np.linspace(0, 1, k); e[len(e) - k:] = np.linspace(1, 0, k)
        g[i:j] = np.maximum(g[i:j], e)
    return g[:, None]


def main():
    cfg = json.load(open(sys.argv[1]))
    dur = cfg['dur']; n = int(dur * SR)
    calmo, bat, tenso = (x[:n] for x in camadas(dur, cfg.get('estilo', 0)))
    sec = cfg.get('secoes') or [['cheio', 0, dur]]
    gc, gb, gt = faixa(n, sec, 'calmo'), faixa(n, sec, 'cheio'), faixa(n, sec, 'tenso')
    mus = calmo * np.maximum(gc, gb) + bat * gb + tenso * gt
    for q in cfg.get('quebras', []):
        a, b = int((q - BEAT * 0.75) * SR), int(q * SR)
        if 0 <= a < n: mus[a:min(b, n)] *= 0.05
    fx = np.zeros((n, 2))
    for tipo, s in cfg.get('fx', []):
        sinal = FX[tipo]()
        em = s - (len(sinal) / SR if tipo == 'sobe' else 0) - (0.3 if tipo == 'swish' else 0)
        mixar(fx, sinal, em, pan=rng.uniform(-0.25, 0.25) if tipo in ('pop', 'tecla', 'toque', 'msg') else 0)
    voz = None
    if cfg.get('voz'):
        v, vsr = sf.read(cfg['voz'])
        if v.ndim > 1: v = v.mean(axis=1)
        if vsr != SR: v = np.interp(np.arange(int(len(v) * SR / vsr)) / SR, np.arange(len(v)) / vsr, v)
        v = np.pad(v, (0, max(0, n - len(v))))[:n]
        # voz suave: corta grave e chiado, compressão leve, um pouco de sala
        v = filtro(v[None, :], 'highpass', 90)[0]
        v = filtro(v[None, :], 'lowpass', 9500)[0]
        v = np.tanh(v * 2.2) / np.tanh(2.2)
        # abaixa a trilha e os efeitos enquanto a voz fala (ataque rápido, volta suave)
        env = np.abs(v); janela = int(0.12 * SR)
        env = np.convolve(env, np.ones(janela) / janela, mode='same')
        fala = (env > 0.01).astype(float)
        sol = int(0.35 * SR); fala = np.convolve(fala, np.ones(sol) / sol, mode='same').clip(0, 1)
        duck = 1 - 0.68 * fala
        mus *= duck[:, None]; fx *= (1 - 0.35 * fala)[:, None]
        voz = np.stack([v, v], axis=1)
    mus[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
    fim = int(1.2 * SR); mus[-fim:] *= np.linspace(1, 0, fim)[:, None] ** 1.5
    mix = reverb(mus * 0.9 + fx * 0.85, mix=0.18)
    mix = filtro(mix.T, 'highpass', 32).T
    if voz is not None:
        voz = voz * 10 ** ((-21 - rms_db(voz[np.abs(voz[:, 0]) > 0.003] if (np.abs(voz[:, 0]) > 0.003).any() else voz)) / 20)
        mix = mix * 10 ** ((-30 - rms_db(mix)) / 20) + reverb(voz, mix=0.06)
    mix *= 10 ** ((-17 - rms_db(mix)) / 20)
    mix = 0.95 * np.tanh(mix * 1.1) / np.tanh(1.1)
    sf.write(cfg['saida'], mix.astype(np.float32), SR, subtype='PCM_16')
    print('ok', cfg['saida'])


if __name__ == '__main__':
    main()
