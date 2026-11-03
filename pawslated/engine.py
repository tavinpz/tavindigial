"""PAWSLATED episode engine (cartoon style). Each episode sets the script + overrides stage()/world_fx()/sfx()."""
import math
import sys

import numpy as np
import skia

import paw
from paw import W, H, prog, e_io, e_out, e_back, e_sine, lerp, lerp2, clamp, fill, stroke, rrect, CREAM, INK, LIME, CORAL, MINT
from toon import *

sys.path.insert(0, "/home/claude/lb2")
import sound as S  # noqa: E402

AMBER = "#F5B342"


class Episode:
    DUR = 14.6
    SLUG = "ep"
    NUM = 0
    T_ZIN, T_ZOUT = 1.0, 6.4
    T_MSG1, T_MSG2 = 4.3, 7.5
    T_CARD, T_CTA, T_STING = 9.6, 12.0, 13.0
    DX, HX = -150, 200          # stage x of dog / owner
    DOG_FACE = -1               # -1: dog faces right (toward owner); 1: faces left
    HOOK = [[("YOUR DOG ", "w"), ("YAWNS", "l")], [("WHEN YOU HUG HIM?", "w")]]
    HOOK_SIZE = 84
    METER = ("STRESS", "bad")   # ("LOVE", "good")
    # (time, word, color, (screen x, y), feature in dog-local coords or None, rot)
    SIGNS = []
    MSG1 = ""
    MSG2 = ""
    CARD_TITLE = [[("4 SIGNS HE", "w")], [("WANTS ", "w"), ("SPACE", "l")]]
    CARD_ITEMS = []             # (title, subtitle, head_state)
    FACT = ""
    SOURCE = ""
    CLOSE_Z = 2.0

    # ---------------------------------------------------------- hooks
    def meter_value(self, t):
        return 0.15 + 0.75 * e_io(prog(t, 1.0, 4.2)) - 0.65 * e_io(prog(t, 6.9, 8.2))

    def dog_state(self, t):
        return {"wag": 0.4, "fx": self.DOG_FACE, "blink": 1 if (t % 3.1) < 0.08 else 0}

    def stage(self, c, t):
        pass

    def world_fx(self, c, t):
        pass

    def world_bg(self, c, t):
        pass

    def screen_fx(self, c, t, cam):
        pass

    def sfx(self, m, pluck):
        pass

    # ---------------------------------------------------------- helpers
    def feat(self, lx, ly):
        """dog-local feature → world."""
        return stage_to_world(self.DX + self.DOG_FACE * lx, ly)

    def head_focus(self):
        x, y = self.feat(-120, -350)
        return x, y

    def cam(self, t):
        fx, fy = self.head_focus()
        wide = Cam(540, 930, 1.0)
        wide_end = Cam(540, 950, 1.06)
        close = Cam(fx, fy, self.CLOSE_Z, 540, 1010)
        if t < self.T_ZIN:
            c = Cam.mix(wide, Cam(540, 940, 1.05), e_sine(prog(t, 0, self.T_ZIN)))
        elif t < self.T_ZOUT:
            c = Cam.mix(Cam(540, 940, 1.05), close, e_io(prog(t, self.T_ZIN, self.T_ZIN + 0.26)))
            c.fx += 8 * math.sin(t * 0.9)
            c.z *= 1 + 0.03 * prog(t, self.T_ZIN + 0.3, self.T_ZOUT)
        else:
            c = Cam.mix(close, wide_end, e_io(prog(t, self.T_ZOUT, self.T_ZOUT + 0.3)))
        return c

    def draw_dog(self, c, t, st=None):
        dog(c, self.DX, 0, 1.0, st or self.dog_state(t), t)

    # ---------------------------------------------------------- frame
    def segs(self, c, line, y, size, a, x_center=W / 2):
        f = ff(700, size)
        ws = [f.measureText(s) for s, _ in line]
        x = x_center - sum(ws) / 2
        for (s, k), w in zip(line, ws):
            toon_text(c, s, x, y, size, LIME if k == "l" else "#FFFFFF", align="l", a=a)
            x += w

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        cam = self.cam(t)
        c.save()
        cam.apply(c)
        room(c, t)
        self.world_bg(c, t)
        sx, sy, s = STAGE
        c.save()
        c.translate(sx, sy)
        c.scale(s, s)
        self.stage(c, t)
        c.restore()
        self.world_fx(c, t)
        c.restore()

        # stickers
        fade_close = 1 - prog(t, self.T_ZOUT - 0.2, self.T_ZOUT + 0.05)
        fade_all = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        for sg in self.SIGNS:
            ts, word, col, pos, feat, rot = sg[:6]
            until = sg[6] if len(sg) > 6 else None
            k = prog(t, ts, ts + 0.35)
            fade = fade_all if until == "all" else fade_close
            if until not in (None, "all"):
                fade = 1 - prog(t, until - 0.2, until)
            if k <= 0 or fade <= 0:
                continue
            pt = cam.pt(*self.feat(*feat)) if feat else None
            tc = INK if col in (LIME, "#FFE14D") else "#FFFFFF"
            sticker(c, pos[0], pos[1], word, k * fade, col, rot, 44, tcol=tc, point=pt)
        self.screen_fx(c, t, cam)

        # hook + meter
        kh = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        if kh > 0:
            kin = e_back(prog(t, 0.0, 0.35), 2.0)
            c.save()
            c.translate(W / 2, 240)
            c.scale(kin, kin)
            c.translate(-W / 2, -240)
            for i, ln in enumerate(self.HOOK):
                self.segs(c, ln, 200 + i * 96, self.HOOK_SIZE, 255 * kh)
            c.restore()
            label, kind = self.METER
            v = clamp(self.meter_value(t))
            if kind == "bad":
                col = CORAL if v > 0.5 else (AMBER if v > 0.3 else MINT)
            else:
                col = "#FF5B7A" if v > 0.5 else (AMBER if v > 0.3 else "#9AA5B1")
            mx, my, mw = 300, 360, 480
            toon_text(c, label, mx - 20, my + 34, 36, "#FFFFFF", ol=7, align="r", a=255 * kh, shadow=False)
            ink(c, [(rr(mx, my, mw, 44, 22), "#FFFFFF")], ol=6, a=255 * kh)
            c.drawRRect(rrect(mx + 6, my + 6, max(32, (mw - 12) * v), 32, 16), fill(col, 255 * kh))
            c.drawRRect(rrect(mx + 14, my + 10, max(16, (mw - 28) * v), 8, 4), fill("#FFFFFF", 110 * kh))
            if kind == "good":
                heart(c, mx + mw + 44, my + 24, 0.9 + 0.12 * v * math.sin(t * 10), 255 * kh)

        # translator
        a1 = 255 * (1 - prog(t, self.T_MSG2 - 0.5, self.T_MSG2 - 0.2))
        if t < self.T_MSG2 - 0.2:
            bubble_translator(c, t, self.T_MSG1, self.MSG1, 1440, a1)
        a2 = 255 * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        if t >= self.T_MSG2 - 0.3:
            bubble_translator(c, t, self.T_MSG2, self.MSG2, 1440, a2)

        self.card(c, t)
        self.cta(c, t)
        paw.watermark(c, 1 - prog(t, self.T_STING, self.T_STING + 0.3))
        paw.sting(c, t, self.T_STING)
        ko = prog(t, self.DUR - 0.25, self.DUR)
        if ko > 0:
            c.drawRect(skia.Rect.MakeWH(W, H), fill(CREAM, 255 * ko))
        return paw.snapshot(surf)

    def card(self, c, t):
        kc = e_out(prog(t, self.T_CARD, self.T_CARD + 0.4))
        if kc <= 0:
            return
        c.drawRect(skia.Rect.MakeWH(W, H), fill("#FFF6E6", 245 * kc))
        for row in range(0, 24):
            for col in range(0, 14):
                c.drawCircle(col * 90 + (45 if row % 2 else 0), row * 90, 6, fill("#F6E5C8", 255 * kc))
        y0 = 250 + 60 * (1 - kc)
        for i, ln in enumerate(self.CARD_TITLE):
            self.segs(c, ln, y0 + i * 104, 92, 255 * kc)
        n = len(self.CARD_ITEMS)
        step = 200 if n >= 4 else 220
        top = 520 if n >= 4 else 560
        for i, (a, b, ist) in enumerate(self.CARD_ITEMS):
            ti = self.card_item_t(i)
            k = e_back(prog(t, ti, ti + 0.35), 2.0)
            if k <= 0:
                continue
            y = top + i * step
            c.save()
            c.translate(W / 2, y + 80)
            c.scale(k, k)
            c.rotate((-1.5, 1.2, -1, 1.5)[i % 4])
            c.translate(-W / 2, -(y + 80))
            c.drawRRect(rrect(96, y + 10, 900, 160, 44), fill(INK))
            ink(c, [(rr(90, y, 900, 160, 44), "#FFFFFF")], ol=6)
            ix, iy = 190, y + 80
            ink(c, [(oval(ix, iy, 66, 66), "#FFE3A6")], ol=5)
            c.save()
            clip = skia.Path()
            clip.addCircle(ix, iy, 62)
            c.clipPath(clip, doAntiAlias=True)
            c.translate(ix, iy)
            c.scale(0.5, 0.5)
            c.translate(118, 330)
            c.rotate(ist.get("rot", 0) * 0.5)
            dog_head(c, ist, 0.0)
            c.restore()
            size = 56
            while ff(700, size).measureText(a) > 660 and size > 36:
                size -= 2
            toon_text(c, a, 290, y + 80, size, "#FFFFFF", ol=7, align="l", shadow=False)
            c.drawTextBlob(skia.TextBlob(b, ff(500, 36)), 292, y + 128, fill("#5A514A"))
            c.restore()
        tf = self.card_item_t(n - 1) + 0.4
        ks = prog(t, tf, tf + 0.4)
        yb = top + n * step + 40
        size = 36
        while ff(600, size).measureText(self.FACT) > 960 and size > 24:
            size -= 1
        f2 = ff(600, size)
        c.drawTextBlob(skia.TextBlob(self.FACT, f2), W / 2 - f2.measureText(self.FACT) / 2, yb, fill(INK, 255 * ks))
        f3 = ff(500, 28)
        c.drawTextBlob(skia.TextBlob(self.SOURCE, f3), W / 2 - f3.measureText(self.SOURCE) / 2, yb + 46, fill("#6B625A", 255 * ks))

    def card_item_t(self, i):
        return self.T_CARD + 0.3 + i * 0.32

    def cta(self, c, t):
        kt = e_back(prog(t, self.T_CTA, self.T_CTA + 0.4), 2.0) * (1 - prog(t, self.T_STING - 0.1, self.T_STING + 0.2))
        if kt <= 0:
            return
        c.save()
        c.translate(W / 2, 1600)
        c.rotate(-2)
        c.scale(kt, kt)
        f1, f2 = ff(600, 46), ff(700, 50)
        parts = [("Comment ", f1, "#FFFFFF"), ("TRANSLATE", f2, LIME), (" for 30 more", f1, "#FFFFFF")]
        ws = [f_.measureText(a) for a, f_, _ in parts]
        tot = sum(ws)
        c.drawRRect(rrect(-tot / 2 - 50 + 6, -60 + 10, tot + 100, 120, 60), fill(INK))
        ink(c, [(rr(-tot / 2 - 50, -60, tot + 100, 120, 60), CORAL)], ol=6)
        xx = -tot / 2
        for (a, f_, col), w_ in zip(parts, ws):
            blob = skia.TextBlob(a, f_)
            c.drawTextBlob(blob, xx, 17, stroke(INK, 10))
            c.drawTextBlob(blob, xx, 17, fill(col))
            xx += w_
        c.restore()

    # ---------------------------------------------------------- sound
    def sound(self, path):
        m = S.Mix(self.DUR)
        SR = S.SR
        cache = {}

        def pluck(freq, dur=1.2, bright=0.5):
            key = (round(freq, 2), dur, bright)
            if key in cache:
                return cache[key]
            n = int(dur * SR)
            N = max(2, int(SR / freq))
            buf = S.rng.uniform(-1, 1, N)
            out = np.zeros(n)
            for i in range(n):
                out[i] = buf[i % N]
                buf[i % N] = 0.996 * (bright * buf[i % N] + (1 - bright) * buf[(i + 1) % N])
            cache[key] = out * 0.5
            return cache[key]

        notes = [72, 76, 79, 76, 74, 79, 81, 79, 72, 76, 79, 84, 81, 79, 76, 74]
        beat = 60 / 104 / 2
        tt, i = 0.15, 0
        while tt < self.T_STING - 0.2:
            n_ = notes[i % len(notes)]
            m.add(pluck(S.note(n_), 0.9, 0.5), tt, 0.22, pan=(-0.25 if i % 2 else 0.25), send=0.45)
            if i % 4 == 0:
                m.add(pluck(S.note(n_ - 24), 1.4, 0.6), tt, 0.28, send=0.4)
            tt += beat
            i += 1
        for j, sg in enumerate(self.SIGNS):
            up = sg[2] != CORAL
            m.add(pluck(S.note((76 + j * 3) if up else (88 - j * 3)), 0.5, 0.3), sg[0], 0.4, pan=0.3, send=0.3)
        for t0, msg in ((self.T_MSG1, self.MSG1), (self.T_MSG2, self.MSG2)):
            for k in range(len(msg)):
                if msg[k] != " ":
                    n = int(0.015 * SR)
                    clk = S.hp(S.rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / (0.002 * SR))
                    m.add(clk, t0 + 0.1 + 0.045 * k, 0.18, pan=S.rng.uniform(-0.2, 0.2), send=0.05)
        m.add(S.whoosh(0.3, 500, 2600), self.T_ZIN - 0.05, 0.4, send=0.25)
        m.add(S.whoosh(0.3, 400, 2000), self.T_ZOUT - 0.05, 0.35, send=0.25)
        for i in range(len(self.CARD_ITEMS)):
            m.add(pluck(S.note(76 + i * 3), 0.6, 0.4), self.T_CARD + 0.35 + i * 0.32, 0.45, send=0.35)
        m.add(S.whoosh(0.4, 400, 1600), self.T_CARD - 0.05, 0.3, send=0.3)
        m.add(pluck(S.note(84), 0.8, 0.4), self.T_CTA + 0.05, 0.4, send=0.4)
        hit = self.T_STING + paw.STING_HIT
        n = int(0.12 * SR)
        pop = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, n)) / SR) * np.exp(-np.arange(n) / (0.03 * SR))
        m.add(pop, hit, 0.6, send=0.3)
        for i, n_ in enumerate((72, 76, 79)):
            m.add(pluck(S.note(n_), 1.4, 0.5), hit + 0.12 + i * 0.13, 0.45, send=0.5)
        m.add(S.sub_hit(55, 0.8), hit, 0.35, send=0.2)
        self.sfx(m, pluck)
        m.render(path)

    # ---------------------------------------------------------- sfx helpers
    @staticmethod
    def pop(m, t, f0=600, f1=1400, g=0.35):
        n = int(0.09 * S.SR)
        p = np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / S.SR) * np.exp(-np.arange(n) / (0.025 * S.SR))
        m.add(p, t, g, pan=0.2, send=0.3)

    @staticmethod
    def boing(m, t, g=0.3):
        n = int(0.45 * S.SR)
        tt = np.arange(n) / S.SR
        f = 180 + 220 * tt / 0.45 + 30 * np.sin(2 * np.pi * 14 * tt)
        m.add(np.sin(2 * np.pi * np.cumsum(f) / S.SR) * np.exp(-tt * 6), t, g, send=0.3)

    @staticmethod
    def rustle(m, t, dur=0.5, g=0.45):
        n = int(dur * S.SR)
        m.add(S.bp(S.rng.standard_normal(n), 1200, 5000) * np.sin(np.pi * np.arange(n) / n) * 0.5, t, g, send=0.2)


def main(ep):
    if sys.argv[1] == "stills":
        from PIL import Image
        ims = []
        for s in sys.argv[2:]:
            im = Image.fromarray(ep.frame(float(s)))
            im.save(f"frames/{ep.SLUG}_{float(s):05.2f}.png")
            ims.append(im.resize((360, 640)))
        sh = Image.new("RGB", (366 * len(ims), 640), (60, 60, 60))
        for i, im in enumerate(ims):
            sh.paste(im, (i * 366, 0))
        sh.save("frames/sheet.png")
        print("ok")
    else:
        wav = f"out/{ep.SLUG}.wav"
        ep.sound(wav)
        paw.render(ep, f"out/PAWSLATED_{ep.NUM:03d}_{ep.SLUG}.mp4", wav)
        print("done")
