"""Pick Pals: narração (Kokoro), efeitos e trilha sintetizados, mix e data.json com os tempos de cada fala."""
import hashlib, json, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

SR = 48000
EP = sys.argv[1] if len(sys.argv) > 1 else 'ep001'
sys.path.insert(0, os.path.dirname(__file__))
SCRIPT = __import__(EP).SCRIPT  # (key, quem, texto, pausa_depois)
OUT = f'/home/claude/atlas-motion/public/pp/{EP}'
CACHE = '/home/claude/pickpals/cache'
os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)
_k = None


def say(text, who):
    global _k
    key = hashlib.md5(f'{who}|{text}'.encode()).hexdigest()[:16]
    p = f'{CACHE}/{key}.wav'
    if not os.path.exists(p):
        if _k is None:
            from kokoro_onnx import Kokoro
            _k = Kokoro('/home/claude/tts/kokoro-v1.0.onnx', '/home/claude/tts/voices-v1.0.bin')
        voice, speed = {'n': ('af_heart', 0.98), 'b': ('am_puck', 1.0), 'k': ('am_michael', 1.04)}[who]
        s, sr = _k.create(text, voice=voice, speed=speed, lang='en-us')
        s = np.asarray(s, dtype=np.float64)
        if who == 'b':   # Bo: voz de personagem, mais aguda
            s = resample_poly(s, 20, 26)
        elif who == 'k':  # Coach Kiwi: grave amigável, um pouco acima
            s = resample_poly(s, 23, 25)
        s = resample_poly(s, SR, 24000)
        idx = np.where(np.abs(s) > 0.01)[0]
        s = s[max(0, idx[0] - 200): idx[-1] + 1200] if len(idx) else s
        sf.write(p, s, SR)
    return sf.read(p)[0]


# ---------- efeitos sintetizados
def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def tone(f, d, r=0.2, h=(1,), a=0.004):
    n = int(d * SR); t = np.arange(n) / SR
    w = sum(np.sin(2 * np.pi * f * (i + 1) * t) * g for i, g in enumerate(h))
    return w * env(n, a, r)


def sweep(f0, f1, d, r=0.08):
    n = int(d * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    return np.sin(ph) * env(n, 0.002, r)


rng = np.random.default_rng(7)
FX = {
    'pop': sweep(300, 900, 0.12, 0.05) * 0.8,
    'pop2': sweep(500, 1300, 0.1, 0.04) * 0.7,
    'tick': tone(1800, 0.06, 0.015, (1, .3)) * 0.6,
    'ding': (tone(1318, 1.2, 0.5, (1, .4, .2)) + tone(1976, 1.2, 0.35, (1, .3))) * 0.35,
    'yes': np.concatenate([tone(f, 0.12, 0.12, (1, .5, .25)) for f in (784, 988, 1175)] + [tone(1568, 0.6, 0.3, (1, .5, .2))]) * 0.4,
    'no': np.concatenate([tone(330, 0.22, 0.18, (1, .6, .3, .2)), tone(262, 0.45, 0.3, (1, .6, .3, .2))]) * 0.35,
    'whoosh': (lambda n: rng.normal(0, 1, n) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.25)(int(0.35 * SR)),
    'munch': np.concatenate([rng.normal(0, 1, int(.07 * SR)) * env(int(.07 * SR), .002, .03) * .5, np.zeros(int(.06 * SR))] * 3),
    'boing': (lambda n: np.sin(2 * np.pi * np.cumsum(220 + 120 * np.sin(np.linspace(0, 18, n)) * np.exp(-np.linspace(0, 4, n))) / SR) * env(n, .003, .25) * .5)(int(.6 * SR)),
    'sparkle': sum(np.pad(tone(f, 0.35, 0.12, (1, .3)), (int(i * 0.06 * SR), int(1.2*SR)))[:int(1.2 * SR)] for i, f in enumerate([2093, 2637, 3136, 2637, 3520, 4186])) * 0.18,
    'scratch': (lambda n: (rng.normal(0, 1, n) * 0.5 + np.sin(2 * np.pi * np.cumsum(np.linspace(900, 120, n)) / SR)) * env(n, .002, .12) * .6)(int(.35 * SR)),
    'slam': (sweep(120, 50, 0.35, 0.15) + rng.normal(0, 1, int(.35 * SR)) * env(int(.35 * SR), .001, .04) * .3) * 0.9,
}


# ---------- trilha: loop alegre (baixo + marimba), 112 bpm
def music(dur):
    bpm = 112; beat = 60 / bpm; n = int(dur * SR); out = np.zeros(n)
    prog = [(48, 64, 67, 72), (43, 62, 67, 71), (45, 64, 69, 72), (41, 65, 69, 72)]  # C G Am F
    mf = lambda m: 440 * 2 ** ((m - 69) / 12)
    i = 0; t = 0.0
    while t < dur:
        ch = prog[(i // 8) % 4]
        bass = ch[0] if i % 2 == 0 else ch[0] + 7
        seg = tone(mf(bass), beat * 0.9, 0.18, (1, .5, .2)) * 0.32
        s = int(t * SR); out[s:s + len(seg)] += seg[:max(0, n - s)]
        for k, m in enumerate(ch[1:]):  # arpejo de marimba em colcheias
            tt = t + (k * 0.5 * beat if i % 2 == 0 else (k * 0.5 + 0.25) * beat)
            seg = tone(mf(m + 12 * (i % 4 == 3)), 0.3, 0.09, (1, 0, .25)) * 0.14
            s = int(tt * SR)
            if s < n: out[s:s + len(seg)] += seg[:n - s]
        t += beat; i += 1
    return out


def main():
    t = 0.2
    beats, voz = {}, []
    for key, who, text, pause in SCRIPT:
        y = say(text, who)
        d = len(y) / SR
        beats[key] = {'t0': round(t, 3), 't1': round(t + d, 3), 'txt': text, 'who': who}
        voz.append((t, y))
        t += d + pause
    dur = t + 0.6
    n = int(dur * SR)
    nq = int(np.ceil(dur * 30))
    boca = [0.0] * nq; quem = [''] * nq
    for (key, who, text, pause), (t0, y) in zip(SCRIPT, voz):
        hop = SR // 30
        for i in range(0, len(y) // hop):
            q = int(t0 * 30) + i
            if q < nq:
                r = float(np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2)))
                boca[q] = max(boca[q], r); quem[q] = who
    m = max(boca) or 1
    boca = [round(min(1, (b / m) ** 0.6 * 1.25), 2) for b in boca]
    vtrack = np.zeros(n)
    for t0, y in voz:
        s = int(t0 * SR); vtrack[s:s + len(y)] += y[:n - s]
    # efeitos marcados pelo episódio
    fxtrack = np.zeros(n)
    for when, name, gain in __import__(EP).FX(beats):
        s = int(when * SR); y = FX[name] * gain
        if s < n: fxtrack[s:s + len(y)] += y[:n - s]
    m = music(dur)
    # ducking: trilha abaixa quando há voz, some na contagem
    envv = np.convolve((np.abs(vtrack) > 0.02).astype(float), np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
    duck = 1 - 0.55 * np.clip(envv * 3, 0, 1)
    for a, b in __import__(EP).SILENCIO(beats):
        s0, s1 = int(a * SR), int(b * SR)
        duck[s0:s1] *= 0.15
    mix = vtrack * 1.0 + fxtrack + m * duck * 0.55
    mix = mix / max(1e-6, np.max(np.abs(mix))) * 0.89
    sf.write(f'{OUT}/audio.wav', np.stack([mix, mix], 1), SR)
    json.dump({'dur': round(dur, 3), 'quadros': nq, 'beats': beats, 'boca': boca, 'quem': ''.join(q or '-' for q in quem)}, open(f'{OUT}/data.json', 'w'), indent=1)
    print('ok', EP, round(dur, 2), 's')
    for k, b in beats.items(): print(k, b['t0'], b['t1'])


if __name__ == '__main__':
    main()
