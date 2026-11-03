"""Foley + score for the LOADBEARING storm pilot. Stereo, 48 kHz.

Everything is synthesised from filtered noise and tuned resonators, then run through a room reverb.
"""
import math
import wave

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(42)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def env(n, a, d, sustain=0.0, rel=None):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / d))
    return e


class Mix:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.dry = np.zeros((self.n, 2))
        self.wet = np.zeros((self.n, 2))   # reverb send

    def add(self, sig, t0, gain=1.0, pan=0.0, send=0.25):
        i0 = int(t0 * SR)
        if i0 >= self.n or i0 + len(sig) <= 0:
            return
        if i0 < 0:
            sig = sig[-i0:]
            i0 = 0
        sig = sig[: self.n - i0]
        l = math.cos((pan + 1) * math.pi / 4)
        r = math.sin((pan + 1) * math.pi / 4)
        s = np.stack([sig * l, sig * r], 1) * gain
        self.dry[i0:i0 + len(sig)] += s
        self.wet[i0:i0 + len(sig)] += s * send

    def render(self, path):
        # stereo room IR: decaying, darkening noise
        n = int(1.9 * SR)
        t = np.arange(n) / SR
        ir = np.stack([lp(rng.standard_normal(n), 5200) * np.exp(-t / 0.55),
                       lp(rng.standard_normal(n), 5200) * np.exp(-t / 0.58)], 1)
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt((ir ** 2).sum(0))
        wet = np.stack([fftconvolve(self.wet[:, k], ir[:, k])[: self.n] for k in range(2)], 1)
        out = self.dry + wet * 0.9
        out = hp(out.T, 28).T
        # gentle glue: soft clip, then peak normalise
        out = np.tanh(out * 1.15) / np.tanh(1.15)
        out /= np.max(np.abs(out)) + 1e-9
        out *= 0.89
        # fade out
        f = int(0.25 * SR)
        out[-f:] *= np.linspace(1, 0, f)[:, None]
        pcm = (out * 32767).astype("<i2")
        with wave.open(path, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())


# ---------------------------------------------------------------- sound objects
def block_knock(pitch=1.0, weight=1.0):
    """Concrete block landing on concrete: click + hollow knock + body thump."""
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    click = hp(noise, 2500) * np.exp(-t / 0.004) * 0.6
    knock = bp(noise, 300 * pitch, 900 * pitch, 2) * np.exp(-t / 0.035) * 2.2
    f0 = 118 * pitch
    body = np.sin(2 * np.pi * f0 * t + 3 * np.exp(-t / 0.01)) * np.exp(-t / 0.07) * 0.9
    grit = bp(noise, 1200, 3500) * np.exp(-t / 0.05) * 0.25
    return (click + knock + body * weight + grit) * 0.9


def whoosh(dur=0.22, f0=500, f1=1800):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 12
    for k in range(steps):
        a, b = k * n // steps, (k + 1) * n // steps
        f = f0 + (f1 - f0) * (k / steps)
        out[a:b] = bp(noise, f * 0.7, f * 1.3)[a:b]
    e = np.sin(np.pi * t / dur) ** 2
    return out * e * 0.35


def shovel():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    scrape = bp(noise, 1800, 6000) * np.exp(-t / 0.09) * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t))
    thud = lp(noise, 300) * np.exp(-t / 0.05) * 1.6
    return scrape * 0.7 + thud


def gravel(count=9, spread=0.18):
    n = int((spread + 0.1) * SR)
    out = np.zeros(n)
    for _ in range(count):
        i = int(rng.uniform(0, spread) * SR)
        m = int(0.03 * SR)
        tt = np.arange(m) / SR
        g = bp(rng.standard_normal(m), 1500, 7000) * np.exp(-tt / 0.006) * rng.uniform(0.2, 0.6)
        out[i:i + m] += g[: n - i]
    return out


def pour(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # thick gurgle: low band noise with random AM + bubbles
    am = lp(rng.standard_normal(n), 9)
    am = 0.5 + 0.5 * am / (np.max(np.abs(am)) + 1e-9)
    gurgle = bp(noise, 120, 520) * am * 2.2
    bub = np.zeros(n)
    for _ in range(int(dur * 22)):
        i = int(rng.uniform(0, dur - 0.06) * SR)
        m = int(0.05 * SR)
        tt = np.arange(m) / SR
        f = rng.uniform(220, 520) * (1 + 2 * tt)
        bub[i:i + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.015) * 0.35
    hiss = hp(noise, 5000) * 0.06            # the hot pour hissing
    e = np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.4)
    return (gurgle + bub + hiss) * e


def sizzle(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    crackle = np.zeros(n)
    for _ in range(int(dur * 120)):
        i = int(rng.uniform(0, dur) * SR)
        if i < n:
            crackle[i] += rng.uniform(-1, 1)
    crackle = hp(crackle, 3000) + hp(rng.standard_normal(n), 6000) * 0.05
    return crackle * np.exp(-t / (dur * 0.5)) * 0.5


def rain(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    bed = hp(lp(noise, 9000), 1500) * 0.18
    drops = np.zeros(n)
    for _ in range(int(dur * 260)):
        i = int(rng.uniform(0, dur) * SR)
        if i < n:
            drops[i] += rng.uniform(0.2, 1)
    drops = bp(drops, 2000, 8000) * 0.5
    e = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 1.0)
    return (bed + drops) * e


def wind(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    slow = lp(rng.standard_normal(n), 0.8)
    slow = 0.4 + 0.6 * (slow - slow.min()) / (np.ptp(slow) + 1e-9)
    gust = lp(noise, 420) * slow * 1.4 + bp(noise, 500, 900) * slow ** 2 * 0.4
    e = np.minimum(1, t / 1.0) * np.minimum(1, (dur - t) / 1.2)
    return gust * e


def thunder():
    n = int(3.2 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    crack = hp(noise, 900) * np.exp(-t / 0.03) * 1.0
    roll_env = np.exp(-t / 1.1) * (0.6 + 0.4 * lp(rng.standard_normal(n), 3) * 4)
    roll = lp(noise, 160, 4) * np.clip(roll_env, 0, None) * 6
    return crack + roll


def creak(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 70 + 25 * np.sin(2 * np.pi * 0.9 * t) + 30 * (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    grain = (np.sin(2 * np.pi * 18 * t) > 0.2).astype(float)
    sig = bp(saw, 150, 1200) * grain * (t / dur) ** 1.5
    return sig * 0.55


def snap():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    return hp(noise, 1200) * np.exp(-t / 0.02) * 1.3 + lp(noise, 200) * np.exp(-t / 0.15) * 2.0


def rumble(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    return lp(noise, 120, 4) * np.exp(-t / (dur * 0.35)) * 7


def sub_hit(f=44, d=1.4):
    n = int(d * 1.5 * SR)
    t = np.arange(n) / SR
    fs = f * (1 + 1.2 * np.exp(-t / 0.05))
    return np.sin(2 * np.pi * np.cumsum(fs) / SR) * np.exp(-t / d) * 1.2


def piano(freq, d=2.6):
    n = int(d * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for h, amp in ((1, 1.0), (2, 0.45), (3, 0.22), (4, 0.1), (5, 0.05)):
        s += amp * np.sin(2 * np.pi * freq * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (0.9 + 0.6 * h))
    hammer = bp(rng.standard_normal(n), 2000, 6000) * np.exp(-t / 0.004) * 0.05
    return (s + hammer) * np.minimum(1, t / 0.004) * 0.35


def pad(freqs, dur, attack=1.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.25, 0.25):
            ph = 2 * np.pi * (f + det) * t
            s += np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    s = lp(s, 1400)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / 1.0)
    return s * e * 0.06


def note(n):
    return 440 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- the score
def build(scene, dur, path, music=True):
    ev = scene.events()
    m = Mix(dur)

    # builder side: left = shortcut (panned left), right = foundation
    for t, k in ev["landL"]:
        m.add(block_knock(pitch=1.0 + 0.25 * k + rng.uniform(-0.04, 0.04), weight=0.9), t, 0.55, pan=-0.45, send=0.22)
    for t, k in ev["landR"]:
        m.add(block_knock(pitch=0.85 + 0.2 * k + rng.uniform(-0.03, 0.03), weight=1.2), t, 0.62, pan=0.45, send=0.22)
    for t in ev["toss"]:
        m.add(whoosh(0.2, 600, 1600), t, 0.25, pan=rng.uniform(-0.4, 0.4), send=0.1)
    for t in ev["dig"]:
        m.add(shovel(), t, 0.55, pan=0.5, send=0.2)
        m.add(gravel(), t + 0.45, 0.6, pan=0.65, send=0.15)
    p0, p1 = ev["pour"]
    m.add(pour(p1 - p0 + 0.3), p0, 0.75, pan=0.45, send=0.3)
    m.add(sizzle(2.2), p1 - 0.3, 0.5, pan=0.45, send=0.2)
    m.add(sub_hit(55, 0.6), p1, 0.35, pan=0.3, send=0.2)       # footing sets

    s0, s1 = ev["storm"]
    m.add(rain(s1 - s0), s0, 0.9, pan=0.0, send=0.15)
    m.add(wind(s1 - s0), s0, 0.75, pan=-0.1, send=0.2)
    m.add(thunder(), ev["thunder"], 1.1, pan=0.15, send=0.45)
    c0, c1 = ev["creak"]
    m.add(creak(c1 - c0), c0, 0.7, pan=-0.45, send=0.3)
    m.add(snap(), ev["snap"], 1.3, pan=-0.45, send=0.3)
    for t in sorted(ev["hits"]):
        m.add(block_knock(pitch=rng.uniform(0.7, 1.0), weight=1.5), t, 0.8, pan=rng.uniform(-0.8, -0.2), send=0.3)
    m.add(rumble(2.4), ev["snap"] + 0.25, 1.2, pan=-0.4, send=0.4)

    brand_bed(m, dur, ev["text"])
    sonic_logo(m, ev["logo"])
    m.render(path)


# ---------------------------------------------------------------- brand sound + new foley
def sonic_logo(m, t):
    """Same in every episode: the hard hat lands (hollow plastic knock + sub) then a two-note motif."""
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    knock = bp(rng.standard_normal(n), 500, 1400) * np.exp(-tt / 0.03) * 1.6 \
        + np.sin(2 * np.pi * 210 * tt) * np.exp(-tt / 0.06) * 0.8
    m.add(knock, t, 0.7, send=0.3)
    m.add(sub_hit(46, 0.9), t, 0.55, send=0.2)
    m.add(gravel(5, 0.08), t + 0.02, 0.25, send=0.2)
    m.add(piano(note(69), 2.8), t + 0.18, 0.5, pan=-0.15, send=0.65)
    m.add(piano(note(76), 2.8), t + 0.42, 0.45, pan=0.15, send=0.65)


def brand_bed(m, dur, t_text, chord_a=(45, 52, 57), chord_b=(41, 48, 57, 60)):
    m.add(pad([note(n) for n in chord_a], t_text + 0.5, 2.0), 0.0, 0.8, send=0.5)
    m.add(pad([note(n) for n in chord_b], dur - t_text, 0.8), t_text, 0.55, send=0.5)
    for i, n_ in enumerate((57, 64, 69, 72)):
        m.add(piano(note(n_)), t_text + 0.05 + i * 0.09, 0.4, pan=-0.2 + 0.13 * i, send=0.6)
    for i, n_ in enumerate((53, 60, 65, 69)):
        m.add(piano(note(n_)), t_text + 0.75 + i * 0.09, 0.4, pan=-0.2 + 0.13 * i, send=0.6)
    m.add(sub_hit(41, 1.6), t_text, 0.42, send=0.35)


def wood_knock(pitch=1.0):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    return (bp(noise, 700 * pitch, 2200 * pitch) * np.exp(-t / 0.02) * 1.6
            + np.sin(2 * np.pi * 260 * pitch * t) * np.exp(-t / 0.05) * 0.7
            + hp(noise, 3000) * np.exp(-t / 0.003) * 0.4)


def footstep():
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 400) * np.exp(-t / 0.03) * 1.8 + bp(rng.standard_normal(n), 1500, 4000) * np.exp(-t / 0.01) * 0.2


def paper(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    cr = np.zeros(n)
    for _ in range(int(dur * 260)):
        i = int(rng.uniform(0, dur) * SR)
        if i < n:
            cr[i] += rng.uniform(-1, 1)
    return (bp(cr, 1800, 9000) * 1.6 + bp(rng.standard_normal(n), 2500, 6000) * 0.08) * np.sin(np.pi * t / dur) ** 0.5


def hydraulic(dur, rise=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 52 + (28 if rise else -10) * (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    hum = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * 0.35
    whine = np.sin(2 * np.pi * np.cumsum(420 + 260 * (t / dur)) / SR) * 0.035
    e = np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.2)
    return (lp(hum, 600) + whine + bp(rng.standard_normal(n), 200, 800) * 0.05) * e


def hiss(dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 3500) * np.exp(-t / (dur * 0.4)) * np.minimum(1, t / 0.02) * 0.5


def crunch():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = lp(noise, 260) * np.exp(-t / 0.09) * 2.4 + bp(noise, 900, 4500) * np.exp(-t / 0.05) * 1.0
    for _ in range(14):
        i = int(rng.uniform(0, 0.25) * SR)
        m_ = int(0.02 * SR)
        tt = np.arange(m_) / SR
        out[i:i + m_] += bp(rng.standard_normal(m_), 2000, 8000) * np.exp(-tt / 0.004) * rng.uniform(0.3, 0.9)
    return out


def crackle(dur=0.25, density=180):
    n = int(dur * SR)
    t = np.arange(n) / SR
    cr = np.zeros(n)
    for _ in range(int(dur * density)):
        i = int(rng.uniform(0, dur) * SR)
        if i < n:
            cr[i] += rng.uniform(-1, 1)
    return (hp(cr, 2500) * 1.4 + lp(rng.standard_normal(n), 180) * 0.6) * np.exp(-t / (dur * 0.6))


def trowel(dur=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1500, 5000) * np.sin(np.pi * t / dur) * 0.6 + lp(rng.standard_normal(n), 300) * np.exp(-t / 0.05) * 0.6


def strain(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 90 + 60 * (t / dur) + 8 * np.sin(2 * np.pi * 5 * t)
    return bp(np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * rng.standard_normal(n), 120, 900) * (t / dur) * 0.4
