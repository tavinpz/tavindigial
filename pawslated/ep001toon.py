"""PAWSLATED №001 (cartoon version) — "Your dog yawns when you hug him?"

python3 ep001toon.py stills 0.6 2.0 4.2 7.0 8.6 11.0 12.5
python3 ep001toon.py render
"""
import math
import sys

import numpy as np
import skia

import paw
from paw import W, H, prog, e_io, e_out, e_back, e_sine, lerp, lerp2, clamp, fill, stroke, rrect, CREAM, INK, LIME, CORAL, MINT
from toon import *
import ep001

sys.path.insert(0, "/home/claude/lb2")
import sound as S  # noqa: E402

DX, HX = -90, 190      # stage x of dog and owner


class Toon(ep001.Yawn):
    SIGNS = [(1.25, "EARS BACK", "ears"), (1.85, "WHALE EYE", "whale"), (2.45, "NOSE LICK", "lick"),
             (3.05, "HEAD TURN", "turn"), (3.65, "YAWN", "yawn")]
    GOOD = [(7.6, "TAIL WAG"), (8.2, "COMES TO YOU")]
    T_ZIN, T_ZOUT = 1.02, 6.42
    T_FLIP = 7.05
    HEARTS = [8.15, 8.45, 8.8, 9.1]

    # ------------------------------------------------------------ state
    def dstate(self, t):
        st = ep001.Yawn.dog_state(self, t)
        st.pop("lean", None)
        let = self.T_LET
        relax = e_io(prog(t, let + 0.2, let + 0.9))
        stress = e_io(prog(t, 1.2, 1.6)) * (1 - relax)
        st["lines"] = stress
        st["sweat"] = e_io(prog(t, 2.9, 3.3)) * (1 - relax)
        st["rot"] = 12 * st.get("turn", 0) + 12 * st.get("yawn", 0)
        # ear physics: flop on hug start, on release and on the turn
        sw = 0
        for t0, amp in ((self.T_HUG0 + 0.2, 16), (let + 0.3, 22), (self.T_FLIP + 0.2, 26)):
            if t > t0:
                d = t - t0
                sw += amp * math.exp(-d * 4.5) * math.sin(d * 18)
        st["ear_swing"] = sw
        # squash on the squeeze, hop on the turn
        st["squash"] = 1.2 * math.sin(math.pi * prog(t, self.T_HUG1 - 0.15, self.T_HUG1 + 0.25))
        k = prog(t, self.T_FLIP - 0.1, self.T_FLIP + 0.45)
        st["hop"] = 70 * math.sin(math.pi * k) if 0 < k < 1 else 0
        if 0 < k < 0.12 or 0.88 < k < 1:
            st["squash"] = 1.4
        kf = e_io(prog(t, self.T_FLIP, self.T_FLIP + 0.25))
        fx = math.cos(math.pi * kf)
        st["fx"] = fx if abs(fx) > 0.05 else 0.05
        if t > self.T_FLIP + 0.1:
            st["wag"] = 1.0
            st["happy"] = 1.0
            st["lean"] = -12 * e_io(prog(t, self.T_FLIP + 0.5, self.T_FLIP + 0.9))
        return st

    def cam(self, t):
        wide = Cam(540, 940, 1.0)
        wide2 = Cam(560, 960, 1.1)
        close = Cam(318, 800, 2.05, 560, 1010)
        drift = Cam(0, 0, 1)
        if t < self.T_ZIN:
            c = Cam.mix(wide, Cam(530, 930, 1.06), e_sine(prog(t, 0, self.T_ZIN)))
        elif t < self.T_ZOUT:
            c = Cam.mix(Cam(530, 930, 1.06), close, e_io(prog(t, self.T_ZIN, self.T_ZIN + 0.26)))
            c.fx += 10 * math.sin(t * 0.9)
            c.z *= 1 + 0.03 * prog(t, self.T_ZIN + 0.3, self.T_ZOUT)
        else:
            c = Cam.mix(close, wide2, e_io(prog(t, self.T_ZOUT, self.T_ZOUT + 0.3)))
        # tiny shake on the squeeze
        sh = 6 * math.sin(math.pi * prog(t, self.T_HUG1 - 0.1, self.T_HUG1 + 0.2)) * math.sin(t * 70)
        c.fx += sh
        return c

    # ------------------------------------------------------------ scene
    def stage(self, c, t):
        sx, sy, s = STAGE
        c.save()
        c.translate(sx, sy)
        c.scale(s, s)
        hug = e_io(prog(t, self.T_HUG0, self.T_HUG1)) * (1 - e_io(prog(t, self.T_LET, self.T_LET + 0.45)))
        squeeze = 6 * math.sin(math.pi * prog(t, self.T_HUG1 - 0.15, self.T_HUG1 + 0.3)) * hug
        pet = e_io(prog(t, self.T_FLIP + 0.6, self.T_FLIP + 1.0))
        hx = HX + 110 * e_io(prog(t, self.T_LET, self.T_LET + 0.5))
        lean = 8 + 86 * hug + 12 * pet
        st = self.dstate(t)
        face = "happy" if (hug > 0.3 or pet > 0.5) else "open"
        sh, shf = owner_body(c, hx, lean, face, t)
        knee = (hx - 84, -64)
        far_t = lerp2((knee[0] + 30, knee[1] - 4), (DX - 26, -292 + squeeze), hug)
        owner_arm(c, shf, far_t, bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, DX, 0, 1.0, st, t)
        if hug > 0.02:
            near_t = lerp2(knee, (DX - 86, -214 + squeeze), hug)
        else:
            chin = (DX + 196, -284 + 8 * math.sin(t * 11) * pet)     # scratches under the chin
            near_t = lerp2(knee, chin, pet)
        owner_arm(c, sh, near_t, bend=-1)
        c.restore()
        return st

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        cam = self.cam(t)
        c.save()
        cam.apply(c)
        room(c, t)
        st = self.stage(c, t)
        # hearts float up from the dog after he comes over
        for i, th in enumerate(self.HEARTS):
            k = prog(t, th, th + 1.3)
            if 0 < k < 1:
                hx, hy = stage_to_world(DX + 40 + 50 * math.sin(i * 2.1 + k * 4), -470 - 220 * e_out(k))
                heart(c, hx, hy, 1.1 * e_back(clamp(k * 4), 2.0), 255 * (1 - prog(k, 0.7, 1)))
        c.restore()

        # stress stickers in the close-up, pinned to the features
        fade = 1 - prog(t, self.T_ZOUT - 0.2, self.T_ZOUT + 0.05)
        anchors = {
            "ears": ((790, 560), (-40, -420), 5),
            "whale": ((250, 560), (-118, -382), -6),
            "lick": ((250, 1190), (-212, -350), 4),
            "turn": ((860, 790), (-20, -330), -5),
            "yawn": ((560, 1300), (-150, -300), 3),
        }
        for ts, word, key in self.SIGNS:
            k = prog(t, ts, ts + 0.35)
            if k <= 0 or fade <= 0:
                continue
            pos, feat, rot = anchors[key]
            fxw, fyw = stage_to_world(DX + feat[0], feat[1])
            # head rotation is small; good enough to pin to the unrotated feature
            pt = cam.pt(fxw, fyw)
            sticker(c, pos[0], pos[1], word, k * fade if k >= 1 else k * fade, CORAL, rot, 44, point=pt)
        gfade = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        for i, (ts, word) in enumerate(self.GOOD):
            k = prog(t, ts, ts + 0.35)
            if k > 0 and gfade > 0:
                sticker(c, (300, 790)[i], (640, 560)[i], word, k * gfade, MINT, (-5, 4)[i], 44)

        # hook
        kh = 1 - prog(t, self.T_CARD - 0.3, self.T_CARD)
        if kh > 0:
            kin = e_back(prog(t, 0.0, 0.35), 2.0)
            c.save()
            c.translate(W / 2, 240)
            c.scale(kin, kin)
            c.translate(-W / 2, -240)
            f = ff(700, 84)
            w1, w2 = f.measureText("YOUR DOG "), f.measureText("YAWNS")
            x0 = W / 2 - (w1 + w2) / 2
            toon_text(c, "YOUR DOG ", x0, 200, 84, "#FFFFFF", align="l", a=255 * kh)
            toon_text(c, "YAWNS", x0 + w1, 200, 84, LIME, align="l", a=255 * kh)
            toon_text(c, "WHEN YOU HUG HIM?", W / 2, 296, 84, "#FFFFFF", a=255 * kh)
            c.restore()
            # stress meter
            stress = 0.12 + 0.8 * e_io(prog(t, 1.0, 4.4)) - 0.7 * e_io(prog(t, self.T_LET + 0.3, self.T_LET + 1.6))
            col = CORAL if stress > 0.5 else ("#F5B342" if stress > 0.3 else MINT)
            mx, my, mw = 300, 360, 480
            toon_text(c, "STRESS", mx - 20, my + 34, 36, "#FFFFFF", ol=7, align="r", a=255 * kh, shadow=False)
            ink(c, [(rr(mx, my, mw, 44, 22), "#FFFFFF")], ol=6, a=255 * kh)
            c.drawRRect(rrect(mx + 6, my + 6, max(32, (mw - 12) * clamp(stress)), 32, 16), fill(col, 255 * kh))
            c.drawRRect(rrect(mx + 14, my + 10, max(16, (mw - 28) * clamp(stress)), 8, 4), fill("#FFFFFF", 110 * kh))

        # translator
        a1 = 255 * (1 - prog(t, self.T_MSG2 - 0.5, self.T_MSG2 - 0.2))
        if t < self.T_MSG2 - 0.2:
            bubble_translator(c, t, self.T_MSG1, "\"I'm not tired. This is too much.\"", 1440, a1)
        a2 = 255 * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        if t >= self.T_MSG2 - 0.3:
            bubble_translator(c, t, self.T_MSG2, "\"Better. Let me come to you.\"", 1440, a2)

        self.card(c, t)
        # CTA
        kt = e_back(prog(t, self.T_CTA, self.T_CTA + 0.4), 2.0) * (1 - prog(t, self.T_STING - 0.1, self.T_STING + 0.2))
        if kt > 0:
            c.save()
            c.translate(W / 2, 1580)
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
        f = ff(700, 92)
        w1 = f.measureText("WANTS ")
        w2 = f.measureText("SPACE")
        toon_text(c, "4 SIGNS HE", W / 2, y0, 92, "#FFFFFF", a=255 * kc)
        x0 = W / 2 - (w1 + w2) / 2
        toon_text(c, "WANTS ", x0, y0 + 104, 92, "#FFFFFF", align="l", a=255 * kc)
        toon_text(c, "SPACE", x0 + w1, y0 + 104, 92, LIME, align="l", a=255 * kc)
        items = [("Yawning", "when he's not tired", {"yawn": 1.0}),
                 ("Nose lick", "a quick tongue flick", {"lick": 0.5}),
                 ("Whale eye", "the white of the eye shows", {"whale": 1.0, "ears": 0.6}),
                 ("Head turn", "looks away from you", {"turn": 1.0, "rot": 14})]
        for i, (a, b, ist) in enumerate(items):
            k = e_back(prog(t, self.T_CARD + 0.3 + i * 0.32, self.T_CARD + 0.65 + i * 0.32), 2.0)
            if k <= 0:
                continue
            y = 520 + i * 200
            c.save()
            c.translate(W / 2, y + 80)
            c.scale(k, k)
            c.rotate((-1.5, 1.2, -1, 1.5)[i])
            c.translate(-W / 2, -(y + 80))
            c.drawRRect(rrect(96, y + 10, 900, 160, 44), fill(INK))
            ink(c, [(rr(90, y, 900, 160, 44), "#FFFFFF")], ol=6)
            # icon: Biscuit's head showing that sign
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
            toon_text(c, a, 290, y + 80, 56, "#FFFFFF", ol=7, align="l", shadow=False)
            c.drawTextBlob(skia.TextBlob(b, ff(500, 36)), 292, y + 128, fill("#5A514A"))
            c.restore()
        ks = prog(t, self.T_CARD + 1.8, self.T_CARD + 2.2)
        f2 = ff(600, 34)
        msg = "81% of dogs in hug photos showed stress signs."
        c.drawTextBlob(skia.TextBlob(msg, f2), W / 2 - f2.measureText(msg) / 2, 1360, fill(INK, 255 * ks))
        f3 = ff(500, 26)
        src = "Coren (2016), via AKC"
        c.drawTextBlob(skia.TextBlob(src, f3), W / 2 - f3.measureText(src) / 2, 1404, fill("#6B625A", 255 * ks))

    # ------------------------------------------------------------ extra cartoon sfx
    def extra_sfx(self, m, pluck):
        SR = S.SR
        m.add(S.whoosh(0.3, 500, 2600), self.T_ZIN - 0.05, 0.4, send=0.25)
        m.add(S.whoosh(0.3, 400, 2000), self.T_ZOUT - 0.05, 0.35, send=0.25)
        # boing on the hop
        n = int(0.45 * SR)
        tt = np.arange(n) / SR
        f = 180 + 220 * tt / 0.45 + 30 * np.sin(2 * np.pi * 14 * tt)
        boing = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6)
        m.add(boing, self.T_FLIP - 0.05, 0.32, send=0.3)
        # heart pops
        for i, th in enumerate(self.HEARTS):
            n = int(0.09 * SR)
            pop = np.sin(2 * np.pi * np.cumsum(np.linspace(600 + 120 * i, 1400 + 120 * i, n)) / SR) * np.exp(-np.arange(n) / (0.025 * SR))
            m.add(pop, th + 0.05, 0.35, pan=0.2, send=0.3)
        # sweat drop "bloop"
        n = int(0.16 * SR)
        bl = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 350, n)) / SR) * np.exp(-np.arange(n) / (0.05 * SR))
        m.add(bl, 3.0, 0.3, send=0.3)
        # good stickers: bright pluck
        for ts, _ in self.GOOD:
            m.add(pluck(S.note(84), 0.6, 0.35), ts, 0.38, send=0.35)


SC = Toon()
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        from PIL import Image
        ims = []
        for s in sys.argv[2:]:
            im = Image.fromarray(SC.frame(float(s)))
            im.save(f"frames/t_{float(s):05.2f}.png")
            ims.append(im.resize((360, 640)))
        sh = Image.new("RGB", (366 * len(ims), 640), (60, 60, 60))
        for i, im in enumerate(ims):
            sh.paste(im, (i * 366, 0))
        sh.save("frames/sheet.png")
        print("ok")
    else:
        SC.sound("out/pw001t.wav", extra=SC.extra_sfx)
        paw.render(SC, "out/PAWSLATED_001_cartoon.mp4", "out/pw001t.wav")
        print("done")
