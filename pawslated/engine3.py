"""PAWSLATED v3 engine: narrated (offline TTS), beat-driven timeline, one sticker at a time, word captions,
depth-of-field, vignette. Episodes define SCRIPT + visuals keyed to beats."""
import math
import sys

import numpy as np
import skia

import paw
import tts
from engine import Episode
from paw import W, H, prog, e_io, e_out, e_back, e_sine, lerp, lerp2, clamp, fill, stroke, rrect, CREAM, INK, LIME, CORAL, MINT
from toon import *

sys.path.insert(0, "/home/claude/lb2")
import sound as S  # noqa: E402

CAP_Y = 1500


class Ep3(Episode):
    # SCRIPT: (key, who 'n'|'d', text, pause_after)
    SCRIPT = []
    HI = set()                    # words highlighted lime in captions
    TITLE = [[("YOUR DOG ", "w"), ("YAWNS", "l")], [("WHEN YOU HUG HIM?", "w")]]
    TITLE_SIZE = 76
    LEAD = 0.25
    TAIL = 0.9
    STICKERS = []                 # (beat key or time, word, color, (sx, sy), feature or None, rot)
    CARD_BEAT = "card"
    CTA_BEAT = "cta"
    STING_BEAT = "sting"

    def __init__(self):
        self.build()

    # ---------------------------------------------------------- timeline
    def build(self):
        t = self.LEAD
        self.B, self.audio, self.caps = {}, [], []
        for key, who, text, pause in self.SCRIPT:
            y = tts.say(text, {"d": "dog", "o": "owner"}.get(who, "narrator"))
            d = len(y) / tts.SR
            self.B[key] = (t, t + d)
            self.audio.append((t, y, who))
            if who == "n" and key != self.STING_BEAT:
                self.caps += self.chunk(text, t, d)
            t += d + pause
        self.DUR = round(t + self.TAIL, 2)
        self.T_CARD = self.B[self.CARD_BEAT][0] - 0.1
        self.T_CTA = self.B[self.CTA_BEAT][0]
        self.T_STING = self.B[self.STING_BEAT][0] - 0.25
        self.T_ZIN, self.T_ZOUT = self.zoom_times()

    def zoom_times(self):
        return (1.0, 6.0)

    def set_bg(self, c, t):
        room(c, t)
        sunbeam(c, t)

    @staticmethod
    def chunk(text, t0, d):
        words = text.split()
        groups, cur = [], []
        for w in words:
            cur.append(w)
            if len(cur) == 3 or w[-1] in ",.?!:;":
                groups.append(cur)
                cur = []
        if cur:
            groups.append(cur)
        total = sum(len(" ".join(g)) + 4 for g in groups)
        out, t = [], t0
        for g in groups:
            dd = d * (len(" ".join(g)) + 4) / total
            out.append((t, t + dd, g))
            t += dd
        return out

    def b0(self, k, off=0.0):
        return self.B[k][0] + off

    def b1(self, k, off=0.0):
        return self.B[k][1] + off

    # ---------------------------------------------------------- overlays
    def captions(self, c, t):
        if t >= self.T_CARD - 0.05:
            return
        for t0, t1, words in self.caps:
            if t0 <= t < t1 + 0.05:
                k = e_back(prog(t, t0, t0 + 0.12), 2.4)
                f = ff(700, 70)
                gap = 22
                ws = [f.measureText(w.upper()) + gap for w in words]
                x = W / 2 - (sum(ws) - gap) / 2
                c.save()
                c.translate(W / 2, CAP_Y)
                c.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k)
                c.translate(-W / 2, -CAP_Y)
                for w, wd in zip(words, ws):
                    clean = w.strip(",.?!:;\"").upper()
                    col = LIME if clean in self.HI else "#FFFFFF"
                    toon_text(c, w.upper(), x, CAP_Y, 70, col, ol=9, align="l")
                    x += wd
                c.restore()
                return

    def header(self, c, t):
        kh = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        if kh <= 0:
            return
        kin = e_back(prog(t, 0.0, 0.35), 2.0)
        c.save()
        c.translate(W / 2, 200)
        c.scale(kin, kin)
        c.translate(-W / 2, -200)
        for i, ln in enumerate(self.TITLE):
            self.segs_size(c, ln, 190 + i * 86, self.TITLE_SIZE, 255 * kh)
        c.restore()

    def segs_size(self, c, line, y, size, a):
        f = ff(700, size)
        ws = [f.measureText(s) for s, _ in line]
        x = W / 2 - sum(ws) / 2
        for (s, k), w in zip(line, ws):
            toon_text(c, s, x, y, size, LIME if k == "l" else "#FFFFFF", align="l", a=a)
            x += w

    def sticker_layer(self, c, t, cam):
        evs = []
        for sg in self.STICKERS:
            key = sg[0]
            ts = self.b0(key) if isinstance(key, str) else key
            evs.append((ts,) + tuple(sg[1:]))
        evs.sort(key=lambda e: e[0])
        for i, (ts, word, col, pos, feat, rot) in enumerate(evs):
            nxt = evs[i + 1][0] if i + 1 < len(evs) else self.T_CARD
            lim = self.T_CARD if (ts >= self.T_ZOUT or not feat) else self.T_ZOUT - 0.1
            end = min(nxt, lim) - 0.02
            if not (ts <= t < end + 0.2):
                continue
            k = prog(t, ts, ts + 0.35) * (1 - prog(t, end, end + 0.2))
            pt = cam.pt(*self.feat(*feat)) if feat else None
            tc = INK if col in (LIME, "#FFE14D", "#FFFFFF") else "#FFFFFF"
            sticker(c, pos[0], pos[1], word, k, col, rot, 56, tcol=tc, point=pt)

    def dog_lines(self, c, t):
        for key, who, text, _ in self.SCRIPT:
            if who != "d":
                continue
            t0, t1 = self.B[key]
            if t0 - 0.3 <= t < t1 + 0.6:
                a = 255 * (1 - prog(t, t1 + 0.3, t1 + 0.6))
                # typing synced to the voice
                n_chars = len(text)
                dur = max(0.3, t1 - t0)
                bubble_translator_sync(c, t, t0, f"\"{text}\"", 1420, a, dur)

    # ---------------------------------------------------------- frame
    def blur_amount(self, cam):
        return clamp((cam.z - 1.15) / 1.0) * 7

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        cam = self.cam(t)
        c.save()
        cam.apply(c)
        bl = self.blur_amount(cam)
        if bl > 0.3:
            c.saveLayer(None, skia.Paint(ImageFilter=skia.ImageFilters.Blur(bl, bl)))
        self.set_bg(c, t)
        self.world_bg(c, t)
        if bl > 0.3:
            c.restore()
        sx, sy, s = STAGE
        c.save()
        c.translate(sx, sy)
        c.scale(s, s)
        self.stage(c, t)
        c.restore()
        self.world_fx(c, t)
        c.restore()
        vignette(c)
        self.sticker_layer(c, t, cam)
        self.screen_fx(c, t, cam)
        self.header(c, t)
        self.dog_lines(c, t)
        self.captions(c, t)
        self.card(c, t)
        self.cta(c, t)
        paw.watermark(c, 1 - prog(t, self.T_STING, self.T_STING + 0.3))
        paw.sting(c, t, self.T_STING)
        ko = prog(t, self.DUR - 0.2, self.DUR)
        if ko > 0:
            c.drawRect(skia.Rect.MakeWH(W, H), fill(CREAM, 255 * ko))
        return paw.snapshot(surf)

    def card_item_t(self, i):
        t0, t1 = self.B[self.CARD_BEAT]
        n = len(self.CARD_ITEMS)
        return t0 + (t1 - t0) * 0.82 * i / max(1, n)

    # ---------------------------------------------------------- sound
    def zoom_marks(self):
        return [self.T_ZIN, self.T_ZOUT]

    def sound(self, path):
        m = S.Mix(self.DUR)
        SR = S.SR
        cache = {}

        def pluck(freq, dur=1.2, bright=0.5):
            key = (round(freq, 2), dur, bright)
            if key not in cache:
                n = int(dur * SR)
                N = max(2, int(SR / freq))
                buf = S.rng.uniform(-1, 1, N)
                out = np.zeros(n)
                for i in range(n):
                    out[i] = buf[i % N]
                    buf[i % N] = 0.996 * (bright * buf[i % N] + (1 - bright) * buf[(i + 1) % N])
                cache[key] = out * 0.5
            return cache[key]

        # music bed (quiet under the voice)
        notes = [72, 76, 79, 76, 74, 79, 81, 79, 72, 76, 79, 84, 81, 79, 76, 74]
        beat = 60 / 104 / 2
        tt, i = 0.1, 0
        while tt < self.T_STING - 0.1:
            n_ = notes[i % len(notes)]
            m.add(pluck(S.note(n_), 0.9, 0.5), tt, 0.11, pan=(-0.25 if i % 2 else 0.25), send=0.45)
            if i % 4 == 0:
                m.add(pluck(S.note(n_ - 24), 1.4, 0.6), tt, 0.16, send=0.4)
            tt += beat
            i += 1
        # voices
        for t0, y, who in self.audio:
            m.add(y, t0, 0.95 if who == "n" else 0.9, send=0.06)
        # stickers
        for j, sg in enumerate(self.STICKERS):
            ts = self.b0(sg[0]) if isinstance(sg[0], str) else sg[0]
            up = sg[2] != CORAL
            m.add(pluck(S.note((79 + j * 2) if up else (88 - j * 2)), 0.5, 0.3), ts, 0.28, pan=0.3, send=0.3)
            self.pop(m, ts, 500, 1100, 0.18)
        for zt in self.zoom_marks():
            m.add(S.whoosh(0.3, 500, 2600), zt - 0.05, 0.3, send=0.25)
        for i in range(len(self.CARD_ITEMS)):
            m.add(pluck(S.note(76 + i * 3), 0.6, 0.4), self.card_item_t(i), 0.3, send=0.35)
        m.add(S.whoosh(0.4, 400, 1600), self.T_CARD - 0.05, 0.25, send=0.3)
        m.add(pluck(S.note(84), 0.8, 0.4), self.T_CTA + 0.05, 0.3, send=0.4)
        hit = self.T_STING + paw.STING_HIT
        n = int(0.12 * SR)
        popw = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, n)) / SR) * np.exp(-np.arange(n) / (0.03 * SR))
        m.add(popw, hit, 0.5, send=0.3)
        for i, n_ in enumerate((72, 76, 79)):
            m.add(pluck(S.note(n_), 1.4, 0.5), hit + 0.12 + i * 0.13, 0.4, send=0.5)
        m.add(S.sub_hit(55, 0.8), hit, 0.3, send=0.2)
        self.sfx(m, pluck)
        m.render(path)


# ---------------------------------------------------------------- extra drawing
def vignette(c):
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((W / 2, H * 0.48), H * 0.72, [C("#000000", 0), C("#000000", 0), C("#1A2A22", 70)], [0, 0.62, 1]))
    c.drawRect(skia.Rect.MakeWH(W, H), g)


def sunbeam(c, t):
    p = skia.Path().moveTo(740, 480).lineTo(1010, 480).lineTo(820, GY + 200).lineTo(330, GY + 200).close()
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeLinear([(870, 480), (580, GY + 200)], [C("#FFFFFF", 70), C("#FFFFFF", 0)]))
    c.drawPath(p, g)
    for i in range(6):     # dust motes
        x = 700 + 180 * math.sin(t * 0.3 + i * 1.7)
        y = 620 + 120 * i + 30 * math.sin(t * 0.5 + i)
        c.drawCircle(x, y, 3, fill("#FFFFFF", 120))


def bubble_translator_sync(c, t, t0, msg, y, a, dur):
    k = e_back(prog(t, t0 - 0.3, t0), 1.8)
    if k <= 0.01 or a <= 0:
        return
    bw, bh = 960, 200
    x0 = W / 2 - bw / 2
    c.save()
    c.translate(W / 2, y + bh / 2)
    c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k)
    c.translate(-W / 2, -(y + bh / 2))
    c.drawRRect(rrect(x0 + 6, y + 12, bw, bh, 50), fill(INK, a))
    panel = rr(x0, y, bw, bh, 50)
    tailp = skia.Path().moveTo(x0 + 220, y + 4).lineTo(x0 + 250, y - 46).lineTo(x0 + 300, y + 4).close()
    ink(c, [(panel, "#FFFFFF"), (tailp, "#FFFFFF")], ol=6, a=a)
    ink(c, [(rr(x0 + 40, y - 26, 300, 52, 26), LIME)], ol=5, a=a)
    f0 = ff(700, 30)
    c.drawTextBlob(skia.TextBlob("DOG", f0), x0 + 70, y + 10, fill(INK, a))
    ax = x0 + 78 + f0.measureText("DOG")
    c.drawPath(skia.Path().moveTo(ax, y).lineTo(ax + 40, y).moveTo(ax + 28, y - 10).lineTo(ax + 40, y).lineTo(ax + 28, y + 10), stroke(INK, 5, a))
    c.drawTextBlob(skia.TextBlob("HUMAN", f0), ax + 52, y + 10, fill(INK, a))
    n = int(len(msg) * prog(t, t0, t0 + dur * 0.92))
    shown = msg[:n]
    size = 60
    while ff(700, size).measureText(msg) > bw - 100 and size > 34:
        size -= 2
    f = ff(700, size)
    c.drawTextBlob(skia.TextBlob(shown or " ", f), x0 + 50, y + 130, fill(INK, a))
    if n < len(msg) or int(t * 3) % 2 == 0:
        cx = x0 + 50 + f.measureText(shown) + 6
        c.drawRRect(rrect(cx, y + 84, 6, 60, 3), fill(CORAL, a))
    c.restore()


def cam_keys(t, keys):
    """keys: [(t_start, Cam, move_duration)] — eases from the previous cam to each new one."""
    cur = keys[0][1]
    for i in range(1, len(keys)):
        ts, cm, d = keys[i]
        if t < ts:
            break
        cur = Cam.mix(cur, cm, e_io(prog(t, ts, ts + d)))
    return cur


def main3(ep):
    if sys.argv[1] == "stills":
        from PIL import Image
        ims = []
        for s in sys.argv[2:]:
            tt = float(s) if s[0].isdigit() else ep.b0(s.split("+")[0], float(s.split("+")[1]) if "+" in s else 0.3)
            im = Image.fromarray(ep.frame(tt))
            im.save(f"frames/{ep.SLUG}_{tt:05.2f}.png")
            ims.append(im.resize((360, 640)))
        sh = Image.new("RGB", (366 * len(ims), 640), (60, 60, 60))
        for i, im in enumerate(ims):
            sh.paste(im, (i * 366, 0))
        sh.save("frames/sheet.png")
        print("ok", ep.DUR, {k: (round(a, 2), round(b, 2)) for k, (a, b) in ep.B.items()})
    else:
        wav = f"out/{ep.SLUG}_v3.wav"
        ep.sound(wav)
        paw.render(ep, f"out/PAWSLATED_{ep.NUM:03d}_{ep.SLUG}_v3.mp4", wav)
        print("done", ep.DUR)
