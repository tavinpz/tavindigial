"""Trilha + efeitos sintetizados para os vídeos da Tavin Digital (tudo gerado aqui, sem samples de terceiros).

uso: python3 audio.py <saida.wav> <duracao_s> <cortes_s separados por vírgula> [voz.wav] [inicio_voz_s ...]
- batida 116 bpm (kick, palmas, chimbal, baixo e acordes curtos), whoosh em cada corte, impacto no último corte
- com voz: a trilha abaixa sozinha enquanto a voz fala (ducking) e o conjunto sai em ~-14 LUFS
"""
import sys
import numpy as np
import soundfile as sf

SR = 48000
BPM = 116
BEAT = 60 / BPM
rng = np.random.default_rng(7)


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


def kick(n=int(0.35 * SR)):
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    fase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(fase) * env(n, 0.001, 0.16) * 0.95


def palma(n=int(0.22 * SR)):
    r = rng.standard_normal(n)
    r = np.diff(np.concatenate([[0], r]))  # brilho
    e = env(n, 0.001, 0.06)
    return r * e * 0.35


def chimbal(n=int(0.06 * SR)):
    r = rng.standard_normal(n)
    r = np.diff(np.diff(np.concatenate([[0, 0], r])))
    return r * env(n, 0.0005, 0.018) * 0.09


def nota(f, dur, forma='saw', vol=0.2, d=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if forma == 'saw':
        s = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 9))
    else:
        s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    return s * env(n, 0.004, d) * vol


def lowpass(x, corte):
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def lowpass_rapido(x, corte):
    # filtro de 1 polo via convolução com resposta exponencial truncada (rápido o bastante)
    a = np.exp(-2 * np.pi * corte / SR)
    h = (1 - a) * a ** np.arange(int(SR * 0.01))
    return np.convolve(x, h)[: len(x)]


def mixar(buf, sinal, em):
    i = int(em * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sinal))
    buf[i:j] += sinal[: j - i]


# Lá menor: Am – F – C – G
ACORDES = [(220.0, [220.0, 261.63, 329.63]), (174.61, [174.61, 220.0, 261.63]), (130.81, [196.0, 261.63, 329.63]), (196.0, [196.0, 246.94, 293.66])]


def trilha(dur):
    buf = np.zeros(int(dur * SR) + SR)
    nb = int(dur / BEAT) + 2
    for b in range(nb):
        t = b * BEAT
        mixar(buf, kick(), t)
        if b % 2 == 1: mixar(buf, palma(), t)
        mixar(buf, chimbal(), t + BEAT / 2)
        if b % 4 == 3: mixar(buf, chimbal() * 0.7, t + BEAT * 0.75)
        raiz, acorde = ACORDES[(b // 4) % 4]
        # baixo em colcheias
        for k in range(2):
            mixar(buf, lowpass_rapido(nota(raiz / 2, BEAT / 2, 'saw', 0.16, 0.12), 600), t + k * BEAT / 2)
        # acorde curto (stab) nos tempos 1 e 2,5 do compasso
        if b % 4 in (0, 2):
            off = 0 if b % 4 == 0 else BEAT / 2
            stab = sum(nota(f * 2, BEAT * 0.9, 'saw', 0.05, 0.11) for f in acorde)
            mixar(buf, lowpass_rapido(stab, 2600), t + off)
    return buf[: int(dur * SR)]


def whoosh(dur=0.42):
    n = int(dur * SR)
    r = rng.standard_normal(n)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t) ** 2
    # varre do grave ao agudo filtrando cada pedaço
    saida = np.zeros(n)
    passos = 12
    for k in range(passos):
        a, b = k * n // passos, (k + 1) * n // passos
        corte = 400 + 5000 * (k / passos) ** 2
        saida[a:b] = lowpass_rapido(r[a:b], corte)
    return saida * e * 0.5


def impacto():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 50 * t) * np.exp(-t * 4) * 0.8 + lowpass_rapido(rng.standard_normal(n), 900) * np.exp(-t * 9) * 0.4
    return s


def lufs_aprox(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) - 0.7


def main():
    saida, dur = sys.argv[1], float(sys.argv[2])
    cortes = [float(c) for c in sys.argv[3].split(',') if c]
    voz = sys.argv[4] if len(sys.argv) > 4 else None
    musica = trilha(dur)
    fx = np.zeros_like(musica)
    for c in cortes:
        mixar(fx, whoosh(), max(0, c - 0.36))
    if cortes:
        mixar(fx, impacto(), cortes[-1])
    # entrada e saída suaves
    n = len(musica)
    musica[: int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))
    musica[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR))
    if voz:
        v, sr = sf.read(voz)
        if v.ndim > 1: v = v.mean(axis=1)
        if sr != SR:
            v = np.interp(np.arange(int(len(v) * SR / sr)) / SR, np.arange(len(v)) / sr, v)
        voz_buf = np.zeros(n); voz_buf[: min(n, len(v))] = v[:n]
        # ducking: envelope da voz suavizado
        env_v = lowpass_rapido(np.abs(voz_buf), 6)
        env_v = env_v / (env_v.max() + 1e-9)
        ganho = 1 - 0.72 * np.clip(env_v * 3, 0, 1)
        voz_buf *= 10 ** ((-14 - lufs_aprox(voz_buf[voz_buf != 0]) + 1.5) / 20)
        mix = musica * 0.42 * ganho + fx * 0.6 + voz_buf
    else:
        mix = musica * 0.8 + fx * 0.7
    alvo = -15
    mix *= 10 ** ((alvo - lufs_aprox(mix)) / 20)
    mix = 0.95 * np.tanh(mix * 1.1) / np.tanh(1.1)  # limitador suave
    sf.write(saida, np.stack([mix, mix], axis=1).astype(np.float32), SR, subtype='PCM_16')
    print('ok', saida, f'{lufs_aprox(mix):.1f} dB')


if __name__ == '__main__':
    main()
