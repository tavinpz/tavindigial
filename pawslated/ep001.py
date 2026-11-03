"""PAWSLATED №001 — "Your dog yawns when you hug him?"

python3 ep001.py stills 0.5 2.5 3.8 5.5 7.2 9.8 12.0 13.4
python3 ep001.py render
"""
import math
import sys

import numpy as np
import skia

from paw import *

sys.path.insert(0, "/home/claude/lb2")
import sound as S  # noqa: E402


class Yawn:
    DUR = 14.6
    DX, HX = 545, 795          # dog x, human x (human kneels behind the dog, facing left)
    T_HUG0, T_HUG1 = 0.35, 0.95
    SIGNS = [(1.25, "EARS BACK", "ears"), (1.85, "WHALE EYE", "whale"), (2.45, "NOSE LICK", "lick"),
             (3.05, "HEAD TURN", "turn"), (3.65, "YAWN", "yawn")]
    T_MSG1 = 4.7
    T_LET = 6.6               # human lets go
    T_MSG2 = 7.5
    T_CARD = 9.6
    T_CTA = 12.0
    T_STING = 13.0

    GOOD = [(7.5, "TAIL WAG"), (8.1, "LEANS IN")]

    def dog_state(self, t):
        st = {"wag": 1.0 - prog(t, 0.9, 1.3), "blink": 1 if (t % 3.3) < 0.08 else 0}
        k = lambda a: e_io(prog(t, a, a + 0.35))
        relax = e_io(prog(t, self.T_LET + 0.2, self.T_LET + 0.9))
        st["ears"] = k(1.25) * (1 - relax)
        st["whale"] = k(1.85) * (1 - relax)
        st["lick"] = prog(t, 2.45, 2.85) if t < 2.9 else 0
        st["turn"] = k(3.05) * (1 - relax)
        y0 = 3.65
        st["yawn"] = math.sin(math.pi * prog(t, y0, y0 + 1.1)) ** 0.7 if y0 <= t < y0 + 1.1 else 0
        # after release: cartoon turn toward the human, wag, lean in for a pet
        kf = e_io(prog(t, self.T_LET + 0.55, self.T_LET + 0.8))
        st["fx"] = math.cos(math.pi * kf) if abs(math.cos(math.pi * kf)) > 0.04 else 0.04
        if t >= self.T_LET + 0.6:
            st["wag"] = e_io(prog(t, self.T_LET + 0.6, self.T_LET + 1.0))
            st["happy"] = 1.0 if t > self.T_LET + 1.0 else 0
            st["lean"] = -20 * e_io(prog(t, self.T_LET + 1.3, self.T_LET + 1.8))
        return st

    def scene(self, c, t):
        dx, hx = self.DX, self.HX
        hug = e_io(prog(t, self.T_HUG0, self.T_HUG1)) * (1 - e_io(prog(t, self.T_LET, self.T_LET + 0.5)))
        squeeze = 5 * math.sin(math.pi * prog(t, self.T_HUG1 - 0.1, self.T_HUG1 + 0.35)) * hug
        pet = e_io(prog(t, self.T_LET + 1.3, self.T_LET + 1.8))
        lean = 10 + 78 * hug
        hx = hx + 80 * e_io(prog(t, self.T_LET, self.T_LET + 0.6))
        sh = human_body(c, hx, GY, {"d": -1, "lean": lean})
        st = self.dog_state(t)
        L = (114, 110)
        knee = (hx - 70, GY - 40)
        if hug > 0.02:   # far arm: behind the dog's neck
            arm(c, (sh[0] - 6, sh[1] - 4), lerp2(knee, (dx - 14, GY - 292 + squeeze), hug), bend=-1, L=L, w=19)
        else:
            arm(c, (sh[0] - 6, sh[1] - 4), (knee[0] + 20, knee[1] - 6), bend=-1, L=L, w=19)
        dog(c, dx, GY, 1.0, st, t)
        if hug > 0.02:   # near arm: wraps the chest
            arm(c, sh, lerp2(knee, (dx - 70, GY - 214 + squeeze), hug), bend=-1, L=L)
        else:            # rests, then pets the head once the dog leans in
            palm = (dx + 196, GY - 284 + 4 * math.sin(t * 5) * pet)   # open hand under the chin
            arm(c, sh, lerp2((knee[0] - 10, knee[1]), palm, e_io(prog(t, self.T_LET + 0.8, self.T_LET + 1.3))), bend=-1, L=L)

    def to_screen(self, x, y, z):
        return (W / 2 + (x - W / 2) * z, GY + (y - GY) * z)

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        background(c)
        z = 1.3 + 0.05 * e_sine(prog(t, 0, self.T_CARD))
        c.save()
        c.translate(W / 2, GY)
        c.scale(z, z)
        c.translate(-W / 2, -GY)
        self.scene(c, t)
        c.restore()
        # sign checklist (left column, clear of the dog's face)
        fade = 1 - prog(t, self.T_LET, self.T_LET + 0.4)
        f = font("monob", 24)
        for i, (ts, word, key) in enumerate(self.SIGNS):
            k = prog(t, ts, ts + 0.3)
            if k > 0 and fade > 0:
                callout(c, 44 + (tw(word, f, 2) + 40) / 2, 610 + i * 72, word, k * fade if k >= 1 else k)
        gfade = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        for i, (ts, word) in enumerate(self.GOOD):
            k = prog(t, ts, ts + 0.3)
            if k > 0 and gfade > 0:
                callout(c, 44 + (tw(word, f, 2) + 40) / 2, 610 + i * 72, word, k * gfade if k >= 1 else k, MINT)

        # hook
        kh = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        if kh > 0:
            highlight_title(c, ["YOUR DOG YAWNS", "WHEN YOU HUG HIM?"], 250, 255 * kh, "YAWNS", 84)
        # stress meter
        if kh > 0:
            stress = 0.12 + 0.78 * e_io(prog(t, 1.0, 4.4)) - 0.68 * e_io(prog(t, self.T_LET + 0.3, self.T_LET + 1.6))
            col = CORAL if stress > 0.5 else (INK2 if stress > 0.3 else MINT)
            meter(c, W / 2 - 200, 470, 400, stress, "STRESS", col)
        # translator
        a1 = 255 * (1 - prog(t, self.T_MSG2 - 0.5, self.T_MSG2 - 0.2))
        if t < self.T_MSG2 - 0.2:
            translator(c, t, self.T_MSG1, "\"I'm not tired. This is too much.\"", 1400, a1)
        a2 = 255 * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        if t >= self.T_MSG2 - 0.3:
            translator(c, t, self.T_MSG2, "\"Better. Let me come to you.\"", 1400, a2)

        # summary card
        kc = e_out(prog(t, self.T_CARD, self.T_CARD + 0.45))
        if kc > 0:
            c.drawRect(skia.Rect.MakeWH(W, H), fill(CREAM, 235 * kc))
            y0 = 360 + 60 * (1 - kc)
            highlight_title(c, ["4 SIGNS HE", "WANTS SPACE"], y0, 255 * kc, "SPACE", 88)
            items = [("YAWNING", "when he's not tired"), ("NOSE LICK", "a quick tongue flick"),
                     ("WHALE EYE", "the white of the eye shows"), ("HEAD TURN", "looks away from you")]
            for i, (a, b) in enumerate(items):
                k = e_back(prog(t, self.T_CARD + 0.35 + i * 0.35, self.T_CARD + 0.7 + i * 0.35), 1.6)
                if k <= 0:
                    continue
                y = 640 + i * 168
                c.save()
                c.translate(W / 2, y + 62)
                c.scale(k, k)
                c.translate(-W / 2, -(y + 62))
                c.drawRRect(rrect(110, y, 860, 128, 36), fill("#FFFFFF", 235))
                c.drawCircle(184, y + 64, 34, fill(CORAL))
                text(c, str(i + 1), 184, y + 78, font("black", 40), "#FFFFFF", 255, "c")
                text(c, a, 246, y + 62, font("black", 44), INK, 255)
                text(c, b, 246, y + 104, font("med", 30), INK2, 255)
                c.restore()
            ks = prog(t, self.T_CARD + 1.9, self.T_CARD + 2.3)
            text(c, "81% of dogs in hug photos showed stress signs.", W / 2, 1360, font("bold", 34), INK, 255 * ks, "c")
            text(c, "Coren (2016), via AKC", W / 2, 1408, font("mono", 24), INK2, 200 * ks, "c", tracking=1)
        # CTA
        kt = e_back(prog(t, self.T_CTA, self.T_CTA + 0.4), 1.5) * (1 - prog(t, self.T_STING - 0.1, self.T_STING + 0.2))
        if kt > 0:
            c.save()
            c.translate(W / 2, 1560)
            c.scale(kt, kt)
            parts = [("Comment ", font("bold", 42), CREAM, 0), ("TRANSLATE", font("black", 44), LIME, 2),
                     (" for 30 more", font("bold", 42), CREAM, 0)]
            ws = [tw(a, f_, tr) for a, f_, _, tr in parts]
            tot = sum(ws)
            c.drawRRect(rrect(-tot / 2 - 56, -62, tot + 112, 124, 62), fill(INK))
            xx = -tot / 2
            for (a, f_, col, tr), w_ in zip(parts, ws):
                text(c, a, xx, 15, f_, col, 255, "l", tracking=tr)
                xx += w_
            c.restore()
        watermark(c, 1 - prog(t, self.T_STING, self.T_STING + 0.3))
        sting(c, t, self.T_STING)
        ko = prog(t, self.DUR - 0.25, self.DUR)
        if ko > 0:
            c.drawRect(skia.Rect.MakeWH(W, H), fill(CREAM, 255 * ko))
        return snapshot(surf)

    # ------------------------------------------------------------ sound
    def sound(self, path, extra=None):
        m = S.Mix(self.DUR)
        SR = S.SR

        def pluck(freq, dur=1.2, bright=0.5):
            n = int(dur * SR)
            N = max(2, int(SR / freq))
            buf = S.rng.uniform(-1, 1, N)
            out = np.zeros(n)
            for i in range(n):
                out[i] = buf[i % N]
                buf[i % N] = 0.996 * (bright * buf[i % N] + (1 - bright) * buf[(i + 1) % N]) if True else 0
            return out * 0.5

        # warm plucked loop (pentatonic), quiet bed under the whole video
        notes = [72, 76, 79, 76, 74, 79, 81, 79, 72, 76, 79, 84, 81, 79, 76, 74]
        beat = 60 / 104 / 2
        cache = {}
        tt, i = 0.15, 0
        while tt < self.T_STING - 0.2:
            n_ = notes[i % len(notes)]
            if n_ not in cache:
                cache[n_] = pluck(S.note(n_), 0.9, 0.5)
            m.add(cache[n_], tt, 0.22, pan=(-0.25 if i % 2 else 0.25), send=0.45)
            if i % 4 == 0:
                if n_ - 24 not in cache:
                    cache[n_ - 24] = pluck(S.note(n_ - 24), 1.4, 0.6)
                m.add(cache[n_ - 24], tt, 0.28, send=0.4)
            tt += beat
            i += 1
        # hug: cloth rustle + soft squeeze
        n = int(0.5 * SR)
        rust = S.bp(S.rng.standard_normal(n), 1200, 5000) * np.sin(np.pi * np.arange(n) / n) * 0.5
        m.add(rust, self.T_HUG0, 0.5, send=0.2)
        m.add(rust * 0.7, self.T_LET, 0.45, send=0.2)
        # each stress sign: a little "tick" pluck going down in pitch (tension)
        for j, (ts, word, key) in enumerate(self.SIGNS):
            m.add(pluck(S.note(88 - j * 3), 0.5, 0.3), ts, 0.4, pan=0.3, send=0.3)
        # nose lick: wet click
        n = int(0.08 * SR)
        lick = S.bp(S.rng.standard_normal(n), 2000, 6000) * np.exp(-np.arange(n) / (0.01 * SR))
        m.add(lick, 2.5, 0.6, send=0.15)
        # yawn: breathy formant sweep
        n = int(1.1 * SR)
        tt_ = np.arange(n) / SR
        f0 = 160 - 60 * (tt_ / 1.1)
        saw = 2 * ((np.cumsum(f0) / SR) % 1) - 1
        voice = S.bp(saw, 400, 1600) * 0.6 + S.bp(S.rng.standard_normal(n), 300, 2500) * 0.25
        env = np.sin(np.pi * tt_ / 1.1) ** 1.5
        m.add(voice * env, 3.65, 0.55, send=0.35)
        # typing clicks for the translator
        for t0, msg in ((self.T_MSG1, "\"I'm not tired. This is too much.\""), (self.T_MSG2, "\"Better. Let me come to you.\"")):
            for k in range(len(msg)):
                if msg[k] != " ":
                    n = int(0.015 * SR)
                    clk = S.hp(S.rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / (0.002 * SR))
                    m.add(clk, t0 + 0.1 + 0.045 * k, 0.18, pan=S.rng.uniform(-0.2, 0.2), send=0.05)
        # tail wag swishes after release
        tt = self.T_LET + 0.7
        while tt < self.T_CARD:
            m.add(S.whoosh(0.12, 900, 2400), tt, 0.12, pan=0.35, send=0.1)
            tt += math.pi / 13
        # card chips pop
        for i in range(4):
            m.add(pluck(S.note(76 + i * 3), 0.6, 0.4), self.T_CARD + 0.4 + i * 0.35, 0.45, send=0.35)
        m.add(S.whoosh(0.4, 400, 1600), self.T_CARD - 0.05, 0.3, send=0.3)
        m.add(pluck(S.note(84), 0.8, 0.4), self.T_CTA + 0.05, 0.4, send=0.4)
        # sting: bubble pop + three rising plucks (the sonic logo)
        hit = self.T_STING + STING_HIT
        n = int(0.12 * SR)
        pop = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, n)) / SR) * np.exp(-np.arange(n) / (0.03 * SR))
        m.add(pop, hit, 0.6, send=0.3)
        for i, n_ in enumerate((72, 76, 79)):
            m.add(pluck(S.note(n_), 1.4, 0.5), hit + 0.12 + i * 0.13, 0.45, send=0.5)
        m.add(S.sub_hit(55, 0.8), hit, 0.35, send=0.2)
        if extra:
            extra(m, pluck)
        m.render(path)


SC = Yawn()
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        from PIL import Image
        ims = []
        for s in sys.argv[2:]:
            im = Image.fromarray(SC.frame(float(s)))
            im.save(f"frames/y_{float(s):05.2f}.png")
            ims.append(im.resize((270, 480)))
        sh = Image.new("RGB", (276 * len(ims), 480), (60, 60, 60))
        for i, im in enumerate(ims):
            sh.paste(im, (i * 276, 0))
        sh.save("frames/sheet.png")
        print("ok")
    else:
        SC.sound("out/pw001.wav")
        render(SC, "out/PAWSLATED_001_yawn.mp4", "out/pw001.wav")
        print("done")
