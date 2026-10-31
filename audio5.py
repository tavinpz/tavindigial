"""Trilha por seções (cinema): cada trecho tem um clima e os cortes entre eles são parte da história.

uso: python3 audio5.py config.json
config: { "saida", "dur", "secoes": [[clima, ini_s, fim_s], ...], "fx": [[tipo, s], ...] }
climas: noite (pad grave + tique-taque), luxo (drone escuro + pulso + brilho), leve (audio3), keynote (audio4)
fx extras: parada (fita parando), tique, + todos do audio4
"""
import json, sys
import numpy as np
import soundfile as sf
import audio3 as A3
import audio4 as A4
from audio3 import SR, filtro, mixar, reverb, hz, sino, rms_db

rng = np.random.default_rng(21)


def soma(buf, est, em):
    i = int(em * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(est)); buf[i:j] += est[: j - i]


def tique():
    n = int(0.05 * SR); t = np.arange(n) / SR
    return filtro(rng.standard_normal(n), 'bandpass', [2500, 6000]) * np.exp(-t * 300) * 0.25


def noite(dur):
    n = int(dur * SR) + SR; t = np.arange(n) / SR
    out = np.zeros((n, 2))
    acordes = [[45, 52, 57, 64], [41, 48, 57, 60]]
    for k in range(int(dur / 4) + 2):
        mixar(out, A3.pad(acordes[k % 2], 4.6) * 1.4, k * 4.0)
    for k in range(int(dur) + 1):  # tique-taque
        mixar(out, tique() * (1 if k % 2 else 0.7), k + 0.0, pan=0.3)
    for k in range(int(dur / 2) + 1):  # gotas de piano
        m = [76, 79, 81, 84, 79, 76][k % 6]
        mixar(out, sino(hz(m), 2.0, 0.05), k * 2.0 + 0.5, pan=-0.3 if k % 2 else 0.3)
    return out[: int(dur * SR)]


def luxo(dur):
    n = int(dur * SR) + SR; t = np.arange(n) / SR
    out = np.zeros((n, 2))
    drone = sum(np.sin(2 * np.pi * hz(m) * t + i) for i, m in enumerate([33, 40, 45])) * 0.08
    drone *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t)
    out += np.stack([drone, drone], 1)
    for k in range(int(dur / 1.0) + 1):  # pulso lento (batimento)
        mixar(out, A4.bumbo() * 0.9, k * 1.0)
        mixar(out, A4.bumbo() * 0.45, k * 1.0 + 0.22)
    for k in range(int(dur / 0.5) + 1):  # brilho agudo
        if k % 3 == 0: mixar(out, sino(hz([88, 91, 95, 100][k % 4]), 1.6, 0.025), k * 0.5, pan=rng.uniform(-0.6, 0.6))
    ar = filtro(rng.standard_normal(n), 'bandpass', [3000, 9000]) * 0.012 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t))
    out += np.stack([ar, np.roll(ar, 300)], 1)
    return out[: int(dur * SR)]


def parada():
    n = int(0.7 * SR); t = np.arange(n) / SR
    f = 220 * np.exp(-t * 5)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + filtro(rng.standard_normal(n), 'lowpass', 1200) * 0.15
    return s * np.linspace(1, 0, n) ** 0.7


CLIMAS = {'noite': noite, 'luxo': luxo, 'leve': lambda d: A3.trilha(d, 1), 'keynote': lambda d: A4.trilha(d, 0, 0), 'keynote2': lambda d: A4.trilha(d, 2, 0)}
FX = dict(A4.FX, parada=parada, tique=tique)


def main():
    cfg = json.load(open(sys.argv[1]))
    dur = cfg['dur']; n = int(dur * SR)
    mus = np.zeros((n, 2))
    for clima, ini, fim in cfg['secoes']:
        fim = min(fim, dur)
        trecho = CLIMAS[clima](fim - ini + 0.6)
        m = len(trecho); fade = int(0.08 * SR)
        trecho[:fade] *= np.linspace(0, 1, fade)[:, None]
        rabo = int(0.5 * SR); trecho[-rabo:] *= np.linspace(1, 0, rabo)[:, None]
        soma(mus, trecho, ini)
    fx = np.zeros((n, 2))
    for tipo, s in cfg.get('fx', []):
        sinal = FX[tipo]()
        em = s - (len(sinal) / SR if tipo == 'sobe' else 0) - (0.3 if tipo == 'swish' else 0)
        mixar(fx, sinal, em, pan=rng.uniform(-0.25, 0.25) if tipo in ('pop', 'tecla', 'toque', 'vidro') else 0)
    fim = int(1.0 * SR); mus[-fim:] *= np.linspace(1, 0, fim)[:, None]
    mix = reverb(mus * 0.9 + fx * 0.85, mix=0.18)
    mix = filtro(mix.T, 'highpass', 32).T
    mix *= 10 ** ((-17 - rms_db(mix)) / 20)
    mix = 0.95 * np.tanh(mix * 1.1) / np.tanh(1.1)
    sf.write(cfg['saida'], mix.astype(np.float32), SR, subtype='PCM_16')
    print('ok', cfg['saida'])


if __name__ == '__main__':
    main()
