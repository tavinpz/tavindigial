"""PAWSLATED 012–021: same narrated toon format as 007–011, new topics, new sets.
python3 episodes5.py <num> stills <t|beat[+off]> ...  |  python3 episodes5.py <num> render"""
import math
import sys

import skia

import sets
import sets2
from engine3 import *
from paw import prog, e_io, e_out, e_back, e_sine, lerp, lerp2, clamp, fill, stroke, rrect, LIME, CORAL, MINT, INK, CREAM, W, H
from toon import *
from episodes3 import flops, hops, hearts, CTA_LINES, WIDE, WIDE_END
from episodes4 import speech, ring, typed

WHITE = "#FFFFFF"
YEL = "#FFE14D"


def zzz(c, x, y, t, a=255):
    """Floating Z's (sleep), screen/world coords."""
    for i in range(3):
        k = ((t * 0.7) + i / 3) % 1
        s = 40 + 26 * i
        f = ff(700, s)
        c.drawTextBlob(skia.TextBlob("Z", f), x + 40 * i + 14 * math.sin(t * 2 + i), y - 70 * i - 40 * k, stroke(INK, 12, a * (1 - k)))
        c.drawTextBlob(skia.TextBlob("Z", f), x + 40 * i + 14 * math.sin(t * 2 + i), y - 70 * i - 40 * k, fill(WHITE, a * (1 - k)))


def clock_pill(c, t, k, txt, suffix="", x=540, y=470):
    s = e_back(clamp(k), 2.4)
    if s <= 0:
        return
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    f = ff(700, 70)
    fs = ff(600, 34)
    w = f.measureText(txt) + (fs.measureText(suffix) + 10 if suffix else 0) + 170
    c.drawRRect(rrect(-w / 2 + 4, -56, w, 124, 40), fill(INK))
    ink(c, [(rr(-w / 2, -66, w, 124, 40), WHITE)], ol=6)
    cx = -w / 2 + 68
    ink(c, [(oval(cx, -4, 40, 40), YEL)], ol=5)
    ang = t * 6
    line(c, [(cx, -4), (cx + 26 * math.cos(ang), -4 + 26 * math.sin(ang))], 6, INK)
    line(c, [(cx, -4), (cx + 16 * math.cos(ang / 12), -4 + 16 * math.sin(ang / 12))], 7, INK)
    tx = cx + 62
    c.drawTextBlob(skia.TextBlob(txt, f), tx, 22, fill(INK))
    if suffix:
        c.drawTextBlob(skia.TextBlob(suffix, fs), tx + f.measureText(txt) + 10, 22, fill("#6B625A"))
    c.restore()


def droplets(c, t, t0, t1, cx, cy, n=10, col="#7FD3FF"):
    """Water flying off the dog (world coords)."""
    for i in range(n):
        for rep in range(3):
            ts = t0 + (i * 0.13 + rep * 0.5) % max(0.3, (t1 - t0))
            k = prog(t, ts, ts + 0.5)
            if 0 < k < 1:
                a = math.radians(200 + (i * 37) % 140)
                d = 120 + 180 * k
                x, y = cx + d * math.cos(a), cy + d * math.sin(a) + 260 * k * k
                ink(c, [(oval(x, y, 11, 15), col)], ol=3, a=255 * (1 - k), lc="#1F4E6E", weight=False)


# =============================================================================================== quiz base (from 009)
class Quiz(Ep3):
    OPTS = []
    RIGHT = set()
    ANS = "ans"

    def cam(self, t):
        quiz = prog(t, self.b0("opts", -0.3), self.b0("opts")) * (1 - prog(t, self.b0("why"), self.b0("why", 0.4)))
        return Cam.mix(Cam(560, 960, 1.08), Cam(540, 720, 0.9), e_io(quiz))

    def zoom_times(self):
        return (99.0, 99.0)

    def zoom_marks(self):
        return [self.b0(self.ANS)]

    def screen_fx(self, c, t, cam):
        self.quiz_fx(c, t)

    def quiz_fx(self, c, t):
        t0 = self.b0("opts")
        tans = self.b0(self.ANS)
        tend = self.b0("why", 0.3)
        if t < t0 - 0.1 or t > tend + 0.3:
            return
        fade = 1 - prog(t, tend, tend + 0.3)
        d = self.B["opts"][1] - t0
        for i, (L, txt) in enumerate(self.OPTS):
            ts = t0 + d * i / 3
            k = e_back(prog(t, ts, ts + 0.3), 2.0) * fade
            if k <= 0:
                continue
            y = 420 + i * 130
            right = L in self.RIGHT
            rev = prog(t, tans, tans + 0.25)
            col = WHITE if rev <= 0 else (MINT if right else "#CFCFCF")
            c.save()
            c.translate(W / 2, y + 54)
            c.scale(k, k)
            c.rotate((-1.5, 1.2, -1)[i])
            c.translate(-W / 2, -(y + 54))
            c.drawRRect(rrect(126, y + 10, 840, 108, 40), fill(INK))
            ink(c, [(rr(120, y, 840, 108, 40), col)], ol=6)
            ink(c, [(oval(196, y + 54, 38, 38), YEL)], ol=5)
            c.drawTextBlob(skia.TextBlob(L, ff(700, 50)), 196 - ff(700, 50).measureText(L) / 2, y + 72, fill(INK))
            size = 48
            while ff(600, size).measureText(txt) > 600 and size > 34:
                size -= 2
            c.drawTextBlob(skia.TextBlob(txt, ff(600, size)), 262, y + 72, fill(INK if (rev <= 0 or right) else "#7A7A7A"))
            if rev > 0:
                cx = 900
                if right:
                    line(c, [(cx - 26, y + 54), (cx - 6, y + 76)], 12, INK)
                    line(c, [(cx - 6, y + 76), (cx + 30, y + 30)], 12, INK)
                else:
                    line(c, [(cx - 22, y + 32), (cx + 22, y + 76)], 12, CORAL)
                    line(c, [(cx + 22, y + 32), (cx - 22, y + 76)], 12, CORAL)
            c.restore()
        c0, c1 = self.B["count"]
        for j, n in enumerate(("3", "2", "1")):
            ts = c1 - 1.15 + 0.38 * j
            k = prog(t, ts, ts + 0.12) * (1 - prog(t, ts + 0.3, ts + 0.38))
            if k > 0:
                qmark(c, 880, 1080, k, n, 240, LIME, (-6, 4, -2)[j])
        kc = prog(t, c0, c0 + 0.3) * (1 - prog(t, tans, tans + 0.2))
        if kc > 0:
            sticker(c, 540, 1270, "COMMENT A, B OR C", kc, WHITE, 2, 40, tcol=INK)

    def quiz_sfx(self, m, pluck):
        c0, c1 = self.B["count"]
        for j in range(3):
            m.add(pluck(S.note(72), 0.4, 0.3), c1 - 1.15 + 0.38 * j, 0.4, send=0.2)
        m.add(pluck(S.note(84), 1.0, 0.4), self.b0(self.ANS), 0.45, send=0.5)
        m.add(pluck(S.note(88), 1.0, 0.4), self.b0(self.ANS, 0.08), 0.4, send=0.5)


def sniff_noise(m, tt, g=0.25):
    for i in range(3):
        n = int(0.07 * S.SR)
        m.add(S.bp(S.rng.standard_normal(n), 1500, 4500) * np.sin(np.pi * np.arange(n) / n) * 0.5, tt + 0.11 * i, g, send=0.1)


# =============================================================================================== 012 QUIZ: follows you to the bathroom
class Bathroom(Quiz):
    NUM, SLUG = 12, "bathroom-quiz"
    DX, HX, DOG_FACE = -40, 220, -1
    TITLE = [[("WHY DOES HE ", "w"), ("FOLLOW", "l")], [("YOU TO THE BATHROOM?", "w")]]
    TITLE_SIZE = 68
    HI = {"BATHROOM", "B", "C", "FAMILY", "SMELLS", "PANICS", "NORMAL", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Why does your dog follow you to the bathroom? Pick one.", 0.2),
              ("opts", "n", "A: he wants the toilet paper. B: he wants to be near you. C: it smells amazing in here.", 0.3),
              ("count", "n", "Lock in your answer. Three, two, one.", 0.3),
              ("ans", "n", "It's B and C!", 0.2),
              ("why", "n", "You're his family, so he stays close. And to his nose, a bathroom is full of interesting smells.", 0.3),
              ("dog1", "d", "Where you go, I go. Also... what is that smell?", 0.35),
              ("card", "n", "Following you around is normal. Panicking every time you leave is different.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("WHY HE ", "w"), ("FOLLOWS", "l")], [("YOU", "w")]]
    CARD_ITEMS = [("You're family", "he likes to stay close", {"happy": 1, "soft": 1}),
                  ("Great smells", "a bathroom is a nose party", {"perk": 1}),
                  ("Calm when you leave", "a normal velcro dog", {"soft": 1, "happy": 1}),
                  ("Panics when you leave", "talk to your vet", {"ears": 1, "whale": 0.6})]
    FACT = "Clingy is normal. Panic when you're gone is not."
    SOURCE = "Joan Merriam, Whole Dog Journal"
    OPTS = [("A", "He wants the toilet paper"), ("B", "He wants to be near you"), ("C", "It smells amazing in here")]
    RIGHT = {"B", "C"}

    def __init__(self):
        super().__init__()
        self.STICKERS = [("ans", "B + C!", LIME, (280, 1250), None, -4)]

    def set_bg(self, c, t):
        sets2.bathroom(c, t)

    def sniffing(self, t):
        return self.b0("why", 1.2) < t < self.b1("dog1", 0.2)

    def dog_state(self, t):
        sn = self.sniffing(t)
        st = {"fx": -1, "happy": 1, "soft": 0.6, "wag": 0.9, "perk": 0.3, "pdx": 6, "blink": 1 if (t % 3.3) < 0.07 else 0,
              "ear_swing": flops(t, [(self.b0("ans"), 18), (self.b0("dog1"), 14)])}
        if t < self.b0("opts"):          # hook: head tilts, looking up at you
            st.update(rot=8 * e_io(prog(t, 0.5, 0.9)), pdy=-6)
        if sn:
            st.update(perk=1, rot=-6 + 5 * math.sin(t * 16), lean=-10, happy=0, grin=0, pdx=-4, pdy=4)
        if self.b0("ans") < t < self.b0("why"):
            st.update(grin=1, hop=hops(t, [self.b0("ans", 0.05)], 50))
        return st

    def stage(self, c, t):
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)

    def world_fx(self, c, t):
        if self.sniffing(t):
            x, y = stage_to_world(self.DX + 210, -360)
            for i in range(3):
                k = ((t * 1.8) + i / 3) % 1
                c.drawPath(skia.Path().moveTo(x + 30 * k, y - 20 * i).quadTo(x + 60 * k, y - 30 - 20 * i, x + 90 * k + 20, y - 20 * i),
                           stroke("#7FB0C9", 7, 220 * (1 - k)))
        kq = prog(t, self.b0("dog1", 1.0), self.b0("dog1", 1.3)) * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        if kq > 0:
            x, y = stage_to_world(self.DX + 60, -560)
            qmark(c, x, y, kq, "?", 120, YEL, 8)

    def sfx(self, m, pluck):
        self.quiz_sfx(m, pluck)
        for tt in (self.b0("why", 1.3), self.b0("why", 2.1), self.b0("dog1", 0.9)):
            sniff_noise(m, tt)


# =============================================================================================== 013 ZOOMIES after a bath (backyard at sunset)
class Zoomies(Ep3):
    NUM, SLUG = 13, "zoomies"
    DX, HX, DOG_FACE = -60, 200, -1
    TITLE = [[("WHY HE GOES ", "w"), ("CRAZY", "l")], [("AFTER A BATH", "w")]]
    HI = {"CRAZY", "BATH", "ZOOMIES", "FRENETIC", "RANDOM", "ACTIVITY", "PERIODS", "ENERGY", "NORMAL", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog goes crazy right after a bath?", 0.2),
              ("name", "n", "That's the zoomies. The official name: frenetic random activity periods.", 0.15),
              ("zoom", "d", "Wheee! Can't stop! Won't stop!", 0.9),
              ("why", "n", "It's a burst of energy. Often after something stressful, like a bath, or after a long day inside.", 0.3),
              ("dog2", "d", "Okay. I'm done. I'm good.", 0.35),
              ("card", "n", "It's totally normal. Just clear the way so he doesn't crash into anything.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("ZOOMIES ", "l"), ("ARE", "w")], [("NORMAL", "w")]]
    CARD_ITEMS = [("After a bath", "letting the stress out", {"grin": 1, "happy": 1}),
                  ("After a long day in", "too much saved-up energy", {"perk": 1}),
                  ("In the evening", "especially puppies", {"happy": 1, "grin": 0.6}),
                  ("Clear the path", "no furniture, no stairs", {"soft": 1})]
    FACT = "\"A completely normal behavior.\""
    SOURCE = "American Kennel Club (AKC) on FRAPs"

    def __init__(self):
        super().__init__()
        self.STICKERS = [("hook", "JUST HAD A BATH", "#7FD3FF", (300, 560), None, -4),
                         ("name", "FRAPs", LIME, (780, 560), None, 4)]
        self.Z0, self.Z1 = self.b0("zoom", -0.3), self.b1("zoom", 0.75)

    def set_bg(self, c, t):
        sets2.backyard(c, t, 0.55)

    def zoom_times(self):
        return (self.b0("dog2", -0.2), self.b0("card", -0.4))

    def cam(self, t):
        close = Cam(*stage_to_world(0 + 110, -360), 1.75, 540, 1010)
        return cam_keys(t, [(0, Cam(540, 940, 1.02), 0), (self.Z0, Cam(540, 930, 0.92), 0.4), (self.Z1, Cam(540, 940, 1.02), 0.4),
                            (self.T_ZIN, close, 0.4), (self.T_ZOUT, WIDE_END, 0.3)])

    def run(self, t):
        """(x, facing, speed) while zooming."""
        k = prog(t, self.Z0, self.Z1)
        if k <= 0:
            return self.DX, -1, 0
        if k >= 1:
            settle = e_io(prog(t, self.Z1, self.Z1 + 0.4))
            return lerp(self.DX, 0, settle), -1, 0
        w = 2 * math.pi * 1.6
        ph = (t - self.Z0) * w
        x = self.DX * math.cos(ph) + 190 * math.sin(ph) * e_io(clamp(k * 4)) * (1 - e_io(prog(k, 0.85, 1)))
        v = -self.DX * w * math.sin(ph) + 190 * w * math.cos(ph)
        return x, (-1 if v > 0 else 1), abs(v)

    def dog_state(self, t):
        x, face, v = self.run(t)
        wet = 1 - prog(t, self.Z0 - 0.3, self.Z0)
        shake = math.sin(t * 40) * 9 * (prog(t, 0.3, 0.6) * (1 - prog(t, 1.6, 1.9)))
        zoom = self.Z0 < t < self.Z1
        st = {"fx": face, "happy": 1, "soft": 0.4, "wag": 0.6, "rot": shake, "sweat": 0.5 * wet, "blink": 1 if (t % 3.1) < 0.07 else 0,
              "ear_swing": flops(t, [(0.4, 20), (1.0, 20), (self.Z0, 24), (self.Z1, 22)]) + (16 * math.sin(t * 22) if zoom else 0)}
        if zoom:
            st.update(grin=1, wag=2.2, lean=-24, hop=hops(t, [self.Z0 + 0.22 * i for i in range(30)], 46, 0.22), perk=0.6)
        elif t > self.Z1:
            st.update(grin=1.0, wag=1.0, squint=0.3 * (1 - prog(t, self.b0("dog2", 1.0), self.b0("dog2", 1.3))), soft=1,
                      hop=hops(t, [self.Z1 + 0.05], 40))
        return st

    def stage(self, c, t):
        x, face, v = self.run(t)
        st = self.dog_state(t)
        if self.Z0 < t < self.Z1:        # speed lines behind him
            for i in range(5):
                yy = -80 - 70 * i
                L = 120 + 60 * ((i * 7) % 3)
                x0 = x + face * (170 + 20 * i)
                line(c, [(x0, yy), (x0 + face * L, yy)], 9, "#FFFFFF", 200)
        dog(c, x, 0, 1.0, st, t)

    def world_fx(self, c, t):
        x, face, v = self.run(t)
        hx, hy = stage_to_world(x, -300)
        droplets(c, t, 0.2, self.Z0 + 0.5, hx, hy, 12)
        if self.Z0 < t < self.Z1:
            for i in range(4):          # dust puffs at the paws
                k = ((t * 3) + i / 4) % 1
                px, py = stage_to_world(x + face * (60 + 140 * k), -10)
                c.drawCircle(px, py - 30 * k, 26 + 20 * k, fill("#FFFFFF", 150 * (1 - k)))

    def screen_fx(self, c, t, cam):
        kb = prog(t, self.Z0, self.Z0 + 0.25) * (1 - prog(t, self.Z0 + 1.6, self.Z0 + 1.9))
        burst(c, 780, 700, "ZOOM!", kb)
        kb2 = prog(t, self.Z0 + 2.0, self.Z0 + 2.25) * (1 - prog(t, self.Z1 - 0.4, self.Z1 - 0.1))
        burst(c, 300, 760, "WHEE!", kb2, 84, LIME)

    def sfx(self, m, pluck):
        for i in range(10):          # shake splash
            n = int(0.06 * S.SR)
            m.add(S.hp(S.rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / (0.012 * S.SR)), 0.35 + 0.12 * i, 0.22, send=0.2)
        m.add(S.whoosh(0.5, 300, 2400), self.Z0, 0.4, send=0.3)
        tt = self.Z0
        while tt < self.Z1:
            n = int(0.05 * S.SR)
            m.add(S.lp(S.rng.standard_normal(n), 700) * np.exp(-np.arange(n) / (0.01 * S.SR)), tt, 0.3, send=0.1)
            tt += 0.11
        for k in range(3):
            m.add(S.whoosh(0.35, 500, 2600), self.Z0 + 0.6 + 0.62 * k, 0.25, send=0.3)
        self.boing(m, self.Z1 + 0.05, 0.2)


# =============================================================================================== 014 TAIL TRANSLATOR (stormy evening)
class Tail(Ep3):
    NUM, SLUG = 14, "tail-talk"
    DX, HX, DOG_FACE = -110, 300, -1
    TITLE = [[("WHAT HIS ", "w"), ("TAIL", "l")], [("IS SAYING", "w")]]
    TITLE_SIZE = 84
    HI = {"TAIL", "HIGH", "MIDDLE", "LOW", "TUCKED", "SCARED", "SAFE", "THUNDER", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog's tail is talking. Here's how to read it.", 0.2),
              ("high", "n", "Held high: he's alert, or excited.", 0.25),
              ("mid", "n", "Loose, in the middle: he's relaxed.", 0.25),
              ("storm", "n", "But then... thunder.", 0.6),
              ("low", "n", "Held low, or tucked between his legs: he's scared or stressed.", 0.3),
              ("dog1", "d", "I don't like this. Stay with me?", 0.3),
              ("help", "n", "Stay close, stay calm, and help him feel safe.", 0.3),
              ("dog2", "d", "Better. Thank you.", 0.35),
              ("card", "n", "High, middle, low. And always read his whole body, not just the tail.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("READ HIS ", "w"), ("TAIL", "l")]]
    CARD_ITEMS = [("High", "alert or excited", {"perk": 1}),
                  ("Loose, middle", "relaxed", {"happy": 1, "soft": 1}),
                  ("Low or tucked", "scared or stressed", {"ears": 1, "whale": 0.6})]
    FACT = "A low or tucked tail commonly signals fear, stress or discomfort."
    SOURCE = "American Kennel Club (AKC)"
    LEVELS = {"high": 0, "mid": 1, "low": 2}

    def __init__(self):
        super().__init__()
        self.T_THUNDER = self.b0("storm", 0.75)
        self.STICKERS = [("high", "HIGH", LIME, (330, 640), (112, -76), -5),
                         ("mid", "LOOSE", MINT, (330, 640), (112, -76), -5),
                         ("low", "TUCKED", CORAL, (330, 640), (40, -30), -5),
                         ("help", "SAFE", MINT, (800, 600), None, 4)]

    def flash(self, t):
        v = 0
        for tt in (self.T_THUNDER, self.T_THUNDER + 0.22, self.b0("low", 1.8)):
            v = max(v, prog(t, tt, tt + 0.04) * (1 - prog(t, tt + 0.08, tt + 0.3)))
        return v

    def set_bg(self, c, t):
        sets2.storm(c, t, self.flash(t), prog(t, self.b0("storm"), self.b0("storm", 0.5)) * 0.8 + 0.2)

    def zoom_times(self):
        return (self.b0("low", -0.1), self.b0("help"))

    def cam(self, t):
        close = Cam(*stage_to_world(self.DX + 20, -250), 1.32, 540, 980)
        c = cam_keys(t, [(0, Cam(540, 940, 1.02), 0), (self.T_ZIN, close, 0.35), (self.T_ZOUT, Cam(600, 950, 1.06), 0.4)])
        sh = self.flash(t)
        c.fx += 10 * sh * math.sin(t * 90)
        return c

    def level(self, t):
        """0 high · 1 mid · 2 low (smooth)."""
        if t < self.b0("high"):
            return 1.0
        v = 0.0
        v = lerp(1.0, 0.0, e_io(prog(t, self.b0("high"), self.b0("high", 0.3))))
        v = lerp(v, 1.0, e_io(prog(t, self.b0("mid"), self.b0("mid", 0.3))))
        v = lerp(v, 2.0, e_io(prog(t, self.T_THUNDER, self.T_THUNDER + 0.25)))
        v = lerp(v, 1.3, e_io(prog(t, self.b0("dog2"), self.b0("dog2", 0.6))))
        return v

    def dog_state(self, t):
        lv = self.level(t)
        scared = clamp(lv - 1)
        excited = clamp(1 - lv)
        calm = prog(t, self.b0("help", 0.6), self.b0("help", 1.6))
        st = {"fx": -1, "tailang": 45 * excited - 75 * scared * (1 - calm) - 20 * calm, "wag": 0.25 + 0.75 * (1 - abs(lv - 1)) - 0.2 * scared,
              "wagf": 1.0 + 0.8 * excited, "perk": excited, "happy": 1 - scared, "soft": (1 - abs(lv - 1)), "blink": 1 if (t % 3.2) < 0.07 else 0,
              "ears": scared * (1 - 0.6 * calm), "whale": 0.7 * scared * (1 - calm), "lines": scared * (1 - calm), "rot": -10 * scared * (1 - calm),
              "sweat": 0.6 * scared * (1 - calm), "pdx": 4 + (-10 * scared), "lean": -22 * calm,
              "ear_swing": flops(t, [(self.b0("high"), 14), (self.T_THUNDER, 26)])}
        if t > self.b0("dog2"):
            st.update(happy=1, soft=1, squint=0.3)
        return st

    def stage(self, c, t):
        k = e_io(prog(t, self.b0("help", -0.2), self.b0("help", 0.5)))
        if k > 0:
            x = self.HX + 260 * (1 - k)
            sh, shf = owner_body(c, x, 26 * k, "happy", t, gaze=(-4, 4))
            owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        st = self.dog_state(t)
        dog(c, self.DX, 0, 1.0, st, t)
        sc = clamp(self.level(t) - 1) * (1 - prog(t, self.b0("help", 0.6), self.b0("help", 1.6)))
        if sc > 0.05:          # the tucked tail peeking between the legs
            c.save()
            c.translate(self.DX, 0)
            c.scale(-1, 1)
            p = skia.Path().moveTo(30, -20).cubicTo(0, -10 - 10 * sc, -40, -30, -60 * sc, -60 * sc).cubicTo(-30, -18, 0, -2, 30, -6).close()
            ink(c, [(p, CARAMEL_DK)], ol=5, a=255 * clamp(sc * 2), lc="#3A2416")
            c.restore()
        if k > 0:
            stroke_t = math.sin(t * 3) * 0.5 + 0.5
            owner_arm(c, sh, (self.DX - 10 + 50 * stroke_t, -290 + 10 * stroke_t), bend=-1)

    def screen_fx(self, c, t, cam):
        # tail gauge (right edge)
        k = e_back(prog(t, self.b0("high", -0.3), self.b0("high")), 2.0) * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        if k <= 0:
            return
        gx, gy, gh = 96, 560, 480
        c.save()
        c.translate(gx, gy + gh / 2)
        c.scale(k, k)
        c.translate(-gx, -(gy + gh / 2))
        c.drawRRect(rrect(gx - 44 + 5, gy + 8, 88, gh, 44), fill(INK))
        ink(c, [(rr(gx - 44, gy, 88, gh, 44), WHITE)], ol=6)
        segs = [(LIME, "HIGH"), (MINT, "MID"), (CORAL, "LOW")]
        for i, (col, lab) in enumerate(segs):
            y0 = gy + 16 + i * (gh - 32) / 3
            c.drawRRect(rrect(gx - 30, y0 + 4, 60, (gh - 32) / 3 - 8, 26), fill(col))
            f = ff(700, 24)
            c.drawTextBlob(skia.TextBlob(lab, f), gx - f.measureText(lab) / 2, y0 + (gh - 32) / 6 + 10, fill(INK))
        lv = self.level(t)
        my = gy + 16 + (lv + 0.5) * (gh - 32) / 3
        tri = skia.Path().moveTo(gx + 74, my - 24).lineTo(gx + 40, my).lineTo(gx + 74, my + 24).close()
        ink(c, [(tri, YEL)], ol=5)
        c.restore()

    def sfx(self, m, pluck):
        # rain bed
        n = int(self.DUR * S.SR)
        rain = S.hp(S.lp(S.rng.standard_normal(n), 6000), 1500) * 0.06
        env = np.clip((np.arange(n) / S.SR - self.b0("storm", -0.3)) / 0.6, 0, 1) * (1 - 0.6 * np.clip((np.arange(n) / S.SR - self.T_STING) / 0.4, 0, 1))
        m.add(rain * (0.35 + 0.65 * env), 0.0, 1.0, send=0.2)
        for tt, g in ((self.T_THUNDER, 1.0), (self.b0("low", 1.8), 0.6)):
            nn = int(2.2 * S.SR)
            th = S.lp(S.rng.standard_normal(nn), 180) * np.exp(-np.arange(nn) / (0.6 * S.SR)) * 3.0
            m.add(th, tt, 0.6 * g, send=0.5)
            m.add(S.sub_hit(42, 1.2), tt, 0.4 * g, send=0.3)


# =============================================================================================== 015 SPIN before lying down (long ago vs today, split)
class Spin(Ep3):
    NUM, SLUG = 15, "spin"
    DX, HX, DOG_FACE = 0, 0, 1
    TITLE = [[("WHY HE ", "w"), ("SPINS", "l")], [("BEFORE LYING DOWN", "w")]]
    TITLE_SIZE = 74
    HI = {"SPIN", "SPINS", "GRASS", "NEST", "DANGER", "BUMPY", "THREE", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Why does your dog spin before lying down?", 0.2),
              ("then", "n", "Long ago, wild dogs slept in tall grass.", 0.1),
              ("spin", "n", "Spinning flattened it into a little nest, and let them check for danger.", 0.3),
              ("now", "n", "Your couch has no grass. He still does it.", 0.1),
              ("dog1", "d", "Spin, spin, spin... perfect.", 0.4),
              ("sci", "n", "In one test, dogs on a bumpy carpet were almost three times more likely to circle than on a smooth floor.", 0.3),
              ("card", "n", "It's instinct. He's making the bed, dog style.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("MAKING ", "w"), ("THE BED", "l")]]
    CARD_ITEMS = [("Flatten the grass", "an old nest trick", {"soft": 1}),
                  ("Check for danger", "one last look around", {"perk": 1}),
                  ("Bumpy bed?", "more spins", {"happy": 1, "grin": 0.6})]
    FACT = "Bumpy carpet: 55% circled. Smooth floor: 19%."
    SOURCE = "Stanley Coren, Psychology Today (2016)"
    S = 0.85
    LX, RX = -229, 229

    def zoom_times(self):
        return (99.0, 99.0)

    def zoom_marks(self):
        return []

    def cam(self, t):
        return Cam(540, 985 - 10 * e_sine(prog(t, 0, self.T_CARD)), 1.1 + 0.03 * e_sine(prog(t, 0, self.T_CARD)), 540, 930)

    def spin_win(self, side):
        return (self.b0("spin", -0.2), self.b1("spin", 0.1)) if side == 0 else (self.b0("now", 1.2), self.b1("dog1", -0.3))

    def lay_t(self, side):
        return self.spin_win(side)[1]

    def flat(self, t):
        a, b = self.spin_win(0)
        return e_io(prog(t, a + 0.3, b))

    def set_bg(self, c, t):
        c.save()
        c.clipRect(skia.Rect.MakeLTRB(-700, -700, 540, H + 900))
        sets2.wild_grass(c, t, self.flat(t))
        c.restore()
        c.save()
        c.clipRect(skia.Rect.MakeLTRB(540, -700, W + 700, H + 900))
        room(c, t)
        x, _ = stage_to_world(self.RX, 0)
        sets2.dog_bed(c, x, GY + 6, 0.95)
        c.restore()

    def spin_st(self, t, side):
        a, b = self.spin_win(side)
        k = prog(t, a, b)
        st = {"happy": 1, "soft": 0.6, "wag": 0.6, "blink": 1 if ((t + side) % 3.3) < 0.07 else 0}
        base = -1.0 if side == 0 else 1.0
        fx, dx = base, 0.0
        if 0 < k < 1:
            ph = 2 * math.pi * 3 * e_io(k)
            fx = base * math.cos(ph)
            dx = 36 * math.sin(ph)
            st.update(perk=0.7, hop=hops(t, [a + (b - a) * i / 6 for i in range(6)], 24, 0.25), wag=1.2)
        lay = prog(t, b, b + 0.25)
        if lay > 0:
            st.update(squash=1.4 * e_out(lay) - 0.5 * prog(t, b + 0.25, b + 0.5) * 0, squint=1 if t > b + 0.4 else 0, soft=1,
                      wag=0.1, rot=-8 * lay)
        st["fx"] = fx if abs(fx) > 0.06 else (0.06 if fx >= 0 else -0.06)
        return st, dx, lay

    def stage(self, c, t):
        for side, x in ((0, self.LX), (1, self.RX)):
            st, dx, lay = self.spin_st(t, side)
            dog(c, x + dx, 26 * lay, self.S, st, t)

    def world_fx(self, c, t):
        for side, x in ((0, self.LX), (1, self.RX)):
            st, dx, lay = self.spin_st(t, side)
            if lay > 0 and t < self.T_CARD:
                wx, wy = stage_to_world(x + (60 if side == 0 else -120), -400)
                zzz(c, wx, wy, t, 255 * prog(t, self.lay_t(side) + 0.4, self.lay_t(side) + 0.8))

    def screen_fx(self, c, t, cam):
        if t >= self.T_CARD:
            return
        a = 255 * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        c.drawRRect(rrect(W / 2 - 7, 330, 14, 1020, 7), fill(INK, a))
        c.drawRRect(rrect(W / 2 - 3, 334, 6, 1012, 3), fill(WHITE, a))
        sticker(c, 270, 400, "LONG AGO", prog(t, self.b0("then"), self.b0("then", 0.3)), YEL, -4, 46, tcol=INK)
        sticker(c, 810, 400, "TODAY", prog(t, self.b0("now"), self.b0("now", 0.3)), LIME, 4, 46, tcol=INK)
        # the stat: two bars
        k = prog(t, self.b0("sci", 0.2), self.b0("sci", 0.6)) * (1 - prog(t, self.T_CARD - 0.4, self.T_CARD - 0.1))
        if k > 0:
            s = e_back(clamp(k), 2.0)
            c.save()
            c.translate(540, 560)
            c.scale(s, s)
            c.drawRRect(rrect(-424, -84, 860, 236, 40), fill(INK))
            ink(c, [(rr(-430, -94, 860, 236, 40), WHITE)], ol=6)
            for i, (lab, pct, col) in enumerate((("BUMPY", 55, CORAL), ("SMOOTH", 19, MINT))):
                y = -40 + i * 100
                f = ff(700, 36)
                c.drawTextBlob(skia.TextBlob(lab, f), -400, y + 14, fill(INK))
                grow = e_out(prog(t, self.b0("sci", 0.5 + 0.4 * i), self.b0("sci", 1.3 + 0.4 * i)))
                bw = 470 * pct / 55 * grow
                ink(c, [(rr(-180, y - 26, max(30, bw), 56, 28), col)], ol=5)
                txt = f"{int(round(pct * grow))}%"
                c.drawTextBlob(skia.TextBlob(txt, ff(700, 40)), -180 + max(30, bw) + 16, y + 16, fill(INK))
            c.restore()

    def sfx(self, m, pluck):
        for side in (0, 1):
            a, b = self.spin_win(side)
            for i in range(6):
                self.rustle(m, a + (b - a) * i / 6, 0.25, 0.25 if side == 0 else 0.15)
            m.add(S.whoosh(0.3, 300, 900), b, 0.3, send=0.2)
            self.pop(m, b + 0.05, 300, 500, 0.3)
        for i in range(2):
            m.add(pluck(S.note(76 + 5 * i), 0.6, 0.4), self.b0("sci", 0.5 + 0.4 * i), 0.3, send=0.35)


# =============================================================================================== 016 SLEEPS ON YOUR CLOTHES (bedroom at night)
class Clothes(Ep3):
    NUM, SLUG = 16, "clothes"
    DX, HX, DOG_FACE = -150, 250, -1
    TITLE = [[("WHY HE SLEEPS ON ", "w")], [("YOUR ", "w"), ("CLOTHES", "l")]]
    TITLE_SIZE = 76
    HI = {"CLOTHES", "SCENT", "CLOSER", "SMELL", "T-SHIRT", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog sleeps on your dirty clothes?", 0.2),
              ("owner", "o", "Hey! Those are my... okay, those are dirty.", 0.3),
              ("think", "n", "You think he's being gross.", 0.15),
              ("means", "n", "What he really means:", 0.15),
              ("dog1", "d", "They smell like you. It's like a hug when you're gone.", 0.35),
              ("why", "n", "Your clothes carry your scent. He wants to smell like you, to feel closer to you.", 0.3),
              ("card", "n", "Leaving for the day? Give him an old T-shirt you've worn.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HE LOVES ", "w")], [("YOUR ", "w"), ("SMELL", "l")]]
    CARD_ITEMS = [("Your scent", "your clothes hold it", {"perk": 1}),
                  ("Feels closer", "smelling like you", {"happy": 1, "soft": 1}),
                  ("Tip", "leave him a worn T-shirt", {"happy": 1, "grin": 0.6})]
    FACT = "Your dog wants to smell like you, to feel closer to you."
    SOURCE = "American Kennel Club (AKC)"

    def __init__(self):
        super().__init__()
        self.STICKERS = [("think", "YOU SEE: GROSS", CORAL, (300, 560), None, -5),
                         ("means", "HE MEANS: LOVE", MINT, (330, 560), None, -4)]
        self.T_IN = self.b0("owner", -0.4)

    def set_bg(self, c, t):
        sets2.bedroom_night(c, t, e_io(prog(t, self.T_IN - 0.2, self.T_IN + 0.2)))

    def world_bg(self, c, t):
        x, _ = stage_to_world(self.DX, 0)
        sets2.laundry(c, x - 40, GY + 26, 1.7)

    def zoom_times(self):
        return (self.b0("dog1", -0.1), self.b0("why", 0.2))

    def asleep(self, t):
        return t < self.T_IN + 0.3

    def dog_state(self, t):
        sl = self.asleep(t)
        st = {"fx": -1, "soft": 1, "happy": 1, "wag": 0.2, "blink": 1 if (t % 3.6) < 0.08 else 0,
              "ear_swing": flops(t, [(self.T_IN + 0.3, 22)])}
        if sl:
            st.update(squint=1, rot=-14 + 3 * math.sin(t * 1.5), squash=0.6, wag=0.05)
        else:
            st.update(rot=-4, perk=0.3, pdx=6, squash=0.3)
            if self.b0("dog1") < t < self.b1("why"):
                st.update(squint=0.4, grin=0.4, wag=0.8, rot=-10 + 3 * math.sin(t * 2))
        return st

    def stage(self, c, t):
        k = e_io(prog(t, self.T_IN, self.T_IN + 0.5))
        if k > 0:
            x = self.HX + 220 * (1 - k)
            talking = self.b0("owner") < t < self.b1("owner")
            face = "open" if t < self.b0("owner", 0.9) else ("talk" if talking else "happy")
            sh, shf = owner_body(c, x, 10, face, t, gaze=(-4, 2), talk=1.0 if talking else 0)
            owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.DX, 30, 1.0, self.dog_state(t), t)
        if k > 0:
            point = self.b0("owner") < t < self.b0("owner", 1.2)
            owner_arm(c, sh, (x - 190, -300) if point else (x - 76, -92), bend=-1)

    def world_fx(self, c, t):
        x, _ = stage_to_world(self.DX, 0)
        # a sleeve and a sock draped over his paws
        c.save()
        c.translate(x + 40, GY + 4)
        ink(c, [(skia.Path().moveTo(-150, 10).cubicTo(-120, -40, -40, -50, 20, -20).cubicTo(-20, 6, -100, 20, -150, 10).close(), "#5BB8FF")], ol=5, lc=sets.SL)
        c.restore()
        if self.asleep(t):
            hx, hy = stage_to_world(self.DX + 40, -420)
            zzz(c, hx, hy, t, 255 * (1 - prog(t, self.T_IN, self.T_IN + 0.3)))
        b = self.b0("dog1")
        hearts(c, t, [b + 0.2, b + 0.6, b + 1.0, b + 1.4], self.DX + 140)

    def screen_fx(self, c, t, cam):
        t0, t1 = self.B["owner"]
        k = prog(t, t0 - 0.2, t0) * (1 - prog(t, t1 + 0.2, t1 + 0.4))
        if k > 0:
            speech(c, 640, 600, typed(self.SCRIPT[1][2], t, t0, t1) or " ", k, 760, 46, 200)

    def sfx(self, m, pluck):
        n = int(0.4 * S.SR)
        click = S.hp(S.rng.standard_normal(int(0.02 * S.SR)), 2000) * 0.6
        m.add(click, self.T_IN - 0.1, 0.5)
        sniff_noise(m, self.b0("dog1", 0.2), 0.2)
        b = self.b0("dog1")
        for th in (0.2, 0.6, 1.0, 1.4):
            self.pop(m, b + th + 0.05, 700, 1500, 0.22)


# =============================================================================================== 017 WHO'S A GOOD BOY (porch, voice comedy)
class GoodBoy(Ep3):
    NUM, SLUG = 17, "good-boy"
    DX, HX, DOG_FACE = -130, 290, -1
    TITLE = [[("WHO'S A ", "w"), ("GOOD BOY", "l"), ("?!", "w")]]
    TITLE_SIZE = 84
    HI = {"VOICE", "HIGH-PITCHED", "SILLY", "GOOD", "BOY", "DOG", "WORDS", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Does your dog care how you talk to him? Watch.", 0.25),
              ("flat", "f", "Hello, dog. You are a good dog.", 0.35),
              ("meh", "d", "...Okay.", 0.45),
              ("hi", "h", "Who's a good boy? You are! Yes you are!", 0.3),
              ("dog2", "d", "ME! I'M THE GOOD BOY!", 0.35),
              ("sci", "n", "In a study, adult dogs chose to spend more time with people who used the silly, high-pitched voice, with dog words like good boy.", 0.3),
              ("card", "n", "Silly voice, plus dog words. That's his favorite combo.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HIS FAVORITE", "w")], [("VOICE", "l")]]
    CARD_ITEMS = [("High-pitched", "the silly, happy voice", {"perk": 1}),
                  ("Dog words", "good boy, walk, treat", {"happy": 1, "grin": 0.6}),
                  ("Both together", "he picks that person", {"happy": 1, "grin": 1})]
    FACT = "Adult dogs preferred people using dog-directed speech."
    SOURCE = "Benjamin & Slocombe (2018), Animal Cognition"

    def __init__(self):
        super().__init__()
        self.STICKERS = [("flat", "BORING VOICE", "#CFCFCF", (300, 560), None, -4),
                         ("hi", "SILLY VOICE", LIME, (300, 560), None, -4)]
        self.T_HI = self.b0("hi", 0.2)

    def set_bg(self, c, t):
        sets2.porch(c, t)

    def zoom_times(self):
        return (self.b0("meh", -0.1), self.b0("hi"))

    def cam(self, t):
        close = Cam(*self.head_focus(), 1.8, 540, 1000)
        return cam_keys(t, [(0, Cam(540, 940, 1.02), 0), (self.T_ZIN, close, 0.3), (self.T_ZOUT, Cam(560, 950, 1.04), 0.3),
                            (self.b0("sci"), WIDE_END, 0.4)])

    def dog_state(self, t):
        st = {"fx": -1, "blink": 1 if (t % 3.2) < 0.07 else 0, "pdx": 4}
        if t < self.T_HI:
            bored = prog(t, self.b0("flat", 0.4), self.b0("flat", 1.0))
            st.update(soft=1, wag=0.4 * (1 - bored) + 0.02, squint=0.45 * bored, rot=-6 * bored, ears=0.15 * bored, happy=1 - bored)
        else:
            st.update(happy=1, grin=1, perk=1, wag=2.2, wagf=1.3, rot=8,
                      hop=hops(t, [self.T_HI + 0.3 + 0.45 * i for i in range(8)], 70),
                      ear_swing=flops(t, [(self.T_HI + 0.3 + 0.45 * i, 22) for i in range(8)]))
            if t > self.b0("sci", 0.4):
                st.update(hop=0, grin=0.6, wag=1.0, soft=1, rot=4)
        return st

    def stage(self, c, t):
        x = self.HX
        talking = (self.b0("flat") < t < self.b1("flat")) or (self.b0("hi") < t < self.b1("hi"))
        hi = t > self.b0("hi")
        face = ("laugh" if hi else "look") if not talking else ("talk" if not hi else "laugh")
        sh, shf = owner_body(c, x, 10 + (14 if hi else 0), face, t, gaze=(-4, 0), talk=1.0 if talking else 0)
        owner_arm(c, shf, (x - 70, -96) if not hi else (x - 60, -340 + 20 * math.sin(t * 9)), bend=-1 if not hi else 1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)
        owner_arm(c, sh, (x - 76, -92) if not hi else (x - 170, -330 + 24 * math.sin(t * 9 + 1)), bend=-1)

    def world_fx(self, c, t):
        b = self.b0("dog2")
        hearts(c, t, [b - 0.4, b, b + 0.4, b + 0.8, b + 1.2], self.DX + 100)

    def screen_fx(self, c, t, cam):
        for key, size, col in (("flat", 44, "#6B625A"), ("hi", 52, CORAL)):
            t0, t1 = self.B[key]
            k = prog(t, t0 - 0.2, t0) * (1 - prog(t, t1 + 0.2, t1 + 0.4))
            if k > 0:
                speech(c, 620, 640, typed(dict((s[0], s[2]) for s in self.SCRIPT)[key], t, t0, t1) or " ", k, 820, size, 220, col)
        # voice meter: flat line vs spiky wave
        for key, amp in (("flat", 6), ("hi", 70)):
            t0, t1 = self.B[key]
            k = prog(t, t0, t0 + 0.2) * (1 - prog(t, t1 + 0.2, t1 + 0.4))
            if k <= 0:
                continue
            s = e_back(clamp(k), 2.0)
            c.save()
            c.translate(800, 960)
            c.scale(s, s)
            c.drawRRect(rrect(-176, -70, 360, 150, 40), fill(INK))
            ink(c, [(rr(-180, -80, 360, 150, 40), WHITE)], ol=6)
            p = skia.Path()
            for i in range(41):
                xx = -150 + 300 * i / 40
                env = math.sin(math.pi * i / 40)
                yy = -5 + amp * env * math.sin(i * 1.3 + t * 18) * (0.6 + 0.4 * math.sin(t * 7 + i))
                p.moveTo(xx, yy) if i == 0 else p.lineTo(xx, yy)
            c.drawPath(p, stroke(LIME if key == "hi" else "#B9B2A8", 9))
            c.restore()

    def sfx(self, m, pluck):
        for i in range(8):
            self.boing(m, self.T_HI + 0.3 + 0.45 * i, 0.16)
        b = self.b0("dog2")
        for th in (-0.4, 0, 0.4, 0.8, 1.2):
            self.pop(m, b + th + 0.05, 700, 1500, 0.22)
        m.add(pluck(S.note(60), 0.9, 0.3), self.b0("meh"), 0.35, send=0.4)


# =============================================================================================== 018 DOORBELL: wrong vs right (hallway)
class Doorbell(Ep3):
    NUM, SLUG = 18, "doorbell"
    DX, HX, DOG_FACE = -190, 250, -1
    TITLE = [[("HE GOES ", "w"), ("WILD", "l")], [("AT THE DOORBELL?", "w")]]
    TITLE_SIZE = 76
    HI = {"WILD", "DOORBELL", "BELL", "TREAT", "MAT", "SPOT", "CUE", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog goes wild when the doorbell rings?", 0.6),
              ("bark", "d", "WOOF! WOOF! Someone's here! WOOF!", 0.2),
              ("yell", "o", "Quiet! Quiet! Stop it!", 0.2),
              ("wrong", "n", "Yelling doesn't teach him what to do instead.", 0.3),
              ("right", "n", "Instead, ring the bell and give him a treat. Then teach him to go to his mat.", 0.3),
              ("step", "n", "Soon, the doorbell itself means: go to your spot.", 0.9),
              ("dog2", "d", "Ding dong? Mat. Treat. Easy.", 0.35),
              ("card", "n", "Bell, treat, mat. Practice a little every day.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("THE DOORBELL", "w")], [("FIX", "l")]]
    CARD_ITEMS = [("Bell = treat", "make the sound a good thing", {"happy": 1}),
                  ("Go to your mat", "reward him for staying", {"soft": 1}),
                  ("Bell = mat", "the bell becomes the cue", {"perk": 1, "happy": 1})]
    FACT = "Consistency is key. Keep a treat jar by the door."
    SOURCE = "American Kennel Club (AKC)"

    def __init__(self):
        super().__init__()
        self.T_BELL1 = self.b0("hook", 2.0) if self.b1("hook") > self.b0("hook", 2.0) else self.b1("hook", 0.05)
        self.T_BELL2 = self.b1("step", 0.1)
        self.T_RIGHT = self.b0("right")
        self.STICKERS = [("yell", "WRONG", CORAL, (300, 560), None, -6),
                         ("right", "RIGHT", MINT, (300, 560), None, -6),
                         (self.b0("right", 1.6), "TREAT", YEL, (780, 620), None, 4),
                         (self.b0("right", 3.2), "MAT", LIME, (300, 1250), None, -4)]

    def set_bg(self, c, t):
        sets.hallway(c, t, 0.0)

    def world_bg(self, c, t):
        k = e_back(prog(t, self.b0("right", 3.0), self.b0("right", 3.4)), 1.8)
        if k > 0:
            x, _ = stage_to_world(self.DX, 0)
            sets2.doormat(c, x, GY + 34, 1.1 * k)

    def zoom_times(self):
        return (self.b0("bark", -0.1), self.b0("yell", -0.1))

    def cam(self, t):
        close = Cam(*self.head_focus(), 1.6, 540, 1000)
        return cam_keys(t, [(0, Cam(560, 940, 1.02), 0), (self.T_ZIN, close, 0.25), (self.T_ZOUT, Cam(560, 950, 1.04), 0.35)])

    def barking(self, t):
        return (self.T_BELL1 < t < self.b1("yell", 0.4)) and t < self.T_RIGHT

    def dog_state(self, t):
        st = {"fx": -1, "blink": 1 if (t % 3.2) < 0.07 else 0, "wag": 0.5, "pdx": 6}
        if self.barking(t):
            bark = max(0.0, math.sin((t - self.T_BELL1) * 13))
            st.update(yawn=0.55 * bark, hard=0.6, perk=1, lines=1, hop=hops(t, [self.T_BELL1 + 0.48 * i for i in range(12)], 40, 0.3),
                      ear_swing=flops(t, [(self.T_BELL1 + 0.48 * i, 18) for i in range(12)]), wag=1.6, wagf=1.6, rot=8)
        elif t > self.T_RIGHT:
            st.update(soft=1, happy=1, wag=0.9)
            treat = self.b0("right", 1.4) < t < self.b0("right", 2.4)
            if treat:
                st.update(grin=0.6, lean=-20)
            if t > self.T_BELL2:
                st.update(perk=0.8, happy=1, grin=0.5, ear_swing=flops(t, [(self.T_BELL2, 18)]))
        return st

    def dog_x(self, t):
        return self.DX

    def stage(self, c, t):
        x = self.HX
        angry = self.b0("yell", -0.1) < t < self.b0("wrong", 0.6)
        talking = self.b0("yell") < t < self.b1("yell")
        face = "angry" if angry else ("happy" if t > self.T_RIGHT else "look")
        sh, shf = owner_body(c, x, 16 if angry else 8, "talk" if talking else face, t, gaze=(-4, 0), talk=1.0 if talking else 0)
        owner_arm(c, shf, (x - 40, -360) if angry else (x - 70, -96), bend=1 if angry else -1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.dog_x(t), 0, 1.0, self.dog_state(t), t)
        treat = self.b0("right", 1.3) < t < self.b0("right", 2.5)
        if angry:
            tgt = (x - 120, -380 + 20 * math.sin(t * 14))
        elif treat:
            tgt = (self.DX + 230, -300)
        else:
            tgt = (x - 76, -92)
        hand = owner_arm(c, sh, tgt, bend=-1)
        if treat:
            px, py = tgt
            bone = skia.Path()
            bone.addRRect(rrect(px - 20, py - 8, 40, 16, 8))
            for bx, by in ((px - 20, py - 8), (px - 20, py + 8), (px + 20, py - 8), (px + 20, py + 8)):
                bone.addCircle(bx, by, 9)
            ink(c, [(bone, "#F2D3A2")], ol=4)

    def screen_fx(self, c, t, cam):
        for tb, word in ((self.T_BELL1, "DING DONG!"), (self.T_BELL2, "DING DONG!")):
            kb = prog(t, tb, tb + 0.2) * (1 - prog(t, tb + 0.9, tb + 1.1))
            burst(c, 780, 520, word, kb, 70)
        if self.barking(t) and t > self.T_BELL1 + 1.0:
            for i, tt in enumerate((self.T_BELL1 + 1.1, self.T_BELL1 + 1.6, self.T_BELL1 + 2.2, self.T_BELL1 + 2.8)):
                k = prog(t, tt, tt + 0.15) * (1 - prog(t, tt + 0.45, tt + 0.6))
                qmark(c, (260, 820, 330, 760)[i], (760, 800, 860, 720)[i], k, "WOOF!", 70, WHITE, (-8, 6, -4, 8)[i])

    def sfx(self, m, pluck):
        def dingdong(tt, g=0.45):
            for j, (f, d) in enumerate(((S.note(76), 0.0), (S.note(72), 0.42))):
                n = int(1.2 * S.SR)
                ar = np.arange(n) / S.SR
                y = (np.sin(2 * np.pi * f * ar) + 0.3 * np.sin(4 * np.pi * f * ar)) * np.exp(-ar * 3)
                m.add(y * 0.6, tt + d, g, send=0.5)
        dingdong(self.T_BELL1)
        dingdong(self.T_BELL2)
        for i in range(8):
            self.boing(m, self.T_BELL1 + 0.48 * i, 0.1)
        self.pop(m, self.b0("right", 3.0), 300, 600, 0.3)
        m.add(pluck(S.note(84), 0.8, 0.4), self.b0("right", 1.5), 0.35, send=0.4)


# =============================================================================================== 019 WHILE YOU SLEEP (bedroom night, time-lapse)
class Night(Ep3):
    NUM, SLUG = 19, "while-you-sleep"
    DX, HX, DOG_FACE = 120, 230, 1
    TITLE = [[("WHAT HE DOES", "w")], [("WHILE YOU ", "w"), ("SLEEP", "l")]]
    TITLE_SIZE = 76
    HI = {"SLEEP", "TWELVE", "FOURTEEN", "HOURS", "NAPS", "TRANSLATE"}
    SCRIPT = [("hook", "n", "What your dog does while you sleep.", 0.25),
              ("t1", "d", "Eleven PM. Bedtime. Goodnight, human.", 0.45),
              ("t2", "d", "Two AM. Was that a noise? Nope. Back to sleep.", 0.45),
              ("t3", "d", "Four AM. Big stretch. Quick snack check.", 0.45),
              ("t4", "d", "Six fifty nine. Is she awake? She looks awake.", 0.45),
              ("wake", "n", "Seven AM.", 0.25),
              ("dog2", "d", "GOOD MORNING! Walk? Walk? WALK?", 0.35),
              ("sci", "n", "Most dogs sleep twelve to fourteen hours a day, in lots of short naps, not one long night like you.", 0.3),
              ("card", "n", "Twelve to fourteen hours. Short naps. And he's always first up.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HE SLEEPS", "w")], [("12–14 HOURS", "l")]]
    CARD_ITEMS = [("12–14 hours", "a day, for most dogs", {"squint": 1, "soft": 1}),
                  ("Short naps", "not one long sleep", {"squint": 1, "happy": 1}),
                  ("Puppies", "sleep even more", {"squint": 1, "soft": 1, "happy": 1})]
    FACT = "Most dogs sleep 12 to 14 hours a day."
    SOURCE = "American Kennel Club (AKC)"
    CLOCK = {"t1": ("11:00", "PM"), "t2": ("2:00", "AM"), "t3": ("4:00", "AM"), "t4": ("6:59", "AM"), "wake": ("7:00", "AM")}

    def __init__(self):
        super().__init__()
        self.STICKERS = []
        self.T_ALARM = self.b0("wake")

    def lamp(self, t):
        return e_io(prog(t, self.T_ALARM, self.T_ALARM + 0.3))

    def set_bg(self, c, t):
        sets2.bedroom_night(c, t, self.lamp(t))

    def world_bg(self, c, t):
        # the owner asleep in bed: head on the pillow, under the blanket
        up = self.lamp(t)
        ink(c, [(rr(40, 790, 190, 90, 40), "#FFE3EC")], ol=5, lc=sets.SL)
        hx, hy = 130, 836 - 20 * up
        ink(c, [(oval(hx, hy, 56, 52), SKIN)], ol=5, lc=OWL)
        hair = skia.Path().moveTo(hx - 60, hy).cubicTo(hx - 64, hy - 70, hx + 50, hy - 80, hx + 58, hy - 10).cubicTo(hx + 30, hy - 30, hx - 20, hy - 30, hx - 60, hy).close()
        ink(c, [(hair, HAIR)], ol=5, lc=OWL)
        if up < 0.5:
            line(c, [(hx - 30, hy + 8), (hx - 12, hy + 12)], 5, OWL)
            line(c, [(hx + 8, hy + 12), (hx + 26, hy + 8)], 5, OWL)
        else:
            c.drawCircle(hx - 20, hy + 8, 7, fill(OWL))
            c.drawCircle(hx + 18, hy + 8, 7, fill(OWL))
        blanket = skia.Path().moveTo(-130, 880).cubicTo(40, 846, 220, 866, 370, 880).lineTo(380, 1010).cubicTo(200, 1030, 0, 1020, -130, 1010).close()
        ink(c, [(blanket, "#7C8CF8")], ol=5, lc=sets.SL)

    def zoom_times(self):
        return (self.b0("t4", -0.1), self.b0("wake", 0.1))

    def cam(self, t):
        close = Cam(*self.head_focus(), 1.85, 540, 1000)
        return cam_keys(t, [(0, Cam(540, 930, 1.02), 0), (self.T_ZIN, close, 0.5), (self.T_ZOUT, Cam(560, 940, 1.04), 0.3)])

    def phase(self, t):
        cur = None
        for key in ("t1", "t2", "t3", "t4", "wake"):
            if t >= self.b0(key, -0.15):
                cur = key
        return cur

    def sleeping(self, t):
        if t < self.b0("t1", 0.9):
            return False
        if self.b0("t2") < t < self.b0("t2", 1.9):
            return False
        if self.b0("t3") < t < self.b1("t3", 0.2):
            return False
        if t > self.b0("t4", -0.1):
            return False
        return True

    def dog_state(self, t):
        sl = self.sleeping(t)
        st = {"fx": 1, "soft": 1, "happy": 0.6, "wag": 0.1, "blink": 1 if (t % 3.4) < 0.08 else 0}
        if sl:
            st.update(squint=1, squash=0.8, rot=-12 + 2 * math.sin(t * 1.4))
        ph = self.phase(t)
        if ph == "t2" and not sl:
            st.update(perk=1, ears=0, pdx=-10 * math.sin(t * 3), rot=6, ear_swing=flops(t, [(self.b0("t2"), 20)]))
        if ph == "t3" and not sl:
            k = prog(t, self.b0("t3"), self.b0("t3", 1.0))
            st.update(squash=-0.6 * math.sin(math.pi * k), yawn=0.8 * math.sin(math.pi * k), perk=0.5,
                      hop=hops(t, [self.b0("t3", 1.5)], 30), rot=-6)
        if ph == "t4":
            st.update(perk=0.8, pdx=-8, pdy=-2, rot=8, wag=0.6, happy=0, soft=0.2, hard=0.3)
        if ph == "wake" or t > self.b0("dog2", -0.2):
            st.update(happy=1, grin=1, perk=1, wag=2.2, squash=0, hop=hops(t, [self.b0("wake", 0.4) + 0.42 * i for i in range(8)], 70),
                      ear_swing=flops(t, [(self.b0("wake", 0.4) + 0.42 * i, 22) for i in range(8)]))
            if t > self.b0("sci", 0.5):
                st.update(hop=0, grin=0.4, wag=0.8)
        return st

    def stage(self, c, t):
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)

    def world_fx(self, c, t):
        if self.sleeping(t):
            hx, hy = stage_to_world(self.DX - 40, -420)
            zzz(c, hx, hy, t)
        if self.phase(t) == "t3" and self.b0("t3", 1.3) < t < self.b1("t3", 0.2):
            qmark(c, *stage_to_world(self.DX - 120, -560), prog(t, self.b0("t3", 1.3), self.b0("t3", 1.6)), "?", 110, YEL, -6)

    def screen_fx(self, c, t, cam):
        ph = self.phase(t)
        if ph and t < self.b0("sci"):
            txt, suf = self.CLOCK[ph]
            k = prog(t, self.b0(ph, -0.15), self.b0(ph, 0.1))
            if ph == "wake":      # ringing
                c.save()
                c.translate(540, 470)
                c.rotate(6 * math.sin(t * 40) * (1 - prog(t, self.b0("wake", 0.8), self.b0("wake", 1.0))))
                c.translate(-540, -470)
                clock_pill(c, t, k, txt, suf)
                c.restore()
            else:
                clock_pill(c, t, k, txt, suf)

    def sfx(self, m, pluck):
        for key in ("t2", "t3", "t4"):
            m.add(S.whoosh(0.5, 300, 1800), self.b0(key, -0.2), 0.22, send=0.4)
        # alarm beeps
        for i in range(6):
            n = int(0.09 * S.SR)
            ar = np.arange(n) / S.SR
            m.add(np.sin(2 * np.pi * 1760 * ar) * 0.4, self.T_ALARM + 0.15 * i, 0.3, send=0.2)
        for k in range(6):
            self.boing(m, self.b0("wake", 0.4) + 0.42 * k, 0.16)
        m.add(pluck(S.note(55), 1.0, 0.3), self.b0("t2", 0.1), 0.25, send=0.4)


# =============================================================================================== 020 QUIZ: why he kicks the grass (backyard day)
class Kick(Quiz):
    NUM, SLUG = 20, "kick-quiz"
    DX, HX, DOG_FACE = -40, 220, 1
    TITLE = [[("WHY DOES HE ", "w"), ("KICK", "l")], [("THE GRASS AFTER?", "w")]]
    TITLE_SIZE = 72
    HI = {"KICK", "B", "SCENT", "GLANDS", "PAWS", "MESSAGE", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Why does your dog kick the grass after he goes potty? Pick one.", 0.2),
              ("opts", "n", "A: he's cleaning his paws. B: he's leaving his scent. C: he's covering it up.", 0.3),
              ("count", "n", "Lock in your answer. Three, two, one.", 0.3),
              ("ans", "n", "It's B!", 0.2),
              ("why", "n", "His paws have scent glands. Every kick leaves his smell, and a mark, for other dogs to find.", 0.3),
              ("dog1", "d", "Biscuit was here. Tell everyone.", 0.35),
              ("card", "n", "It's normal. He's leaving a message.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HE'S LEAVING", "w")], [("A ", "w"), ("MESSAGE", "l")]]
    CARD_ITEMS = [("Scent glands", "in his paw pads", {"perk": 1}),
                  ("A visible mark", "scratches in the grass", {"happy": 1}),
                  ("A message", "for other dogs", {"happy": 1, "grin": 0.6})]
    FACT = "Dogs have scent glands in their paw pads and between their toes."
    SOURCE = "VCA Animal Hospitals"
    OPTS = [("A", "He's cleaning his paws"), ("B", "He's leaving his scent"), ("C", "He's covering it up")]
    RIGHT = {"B"}

    def __init__(self):
        super().__init__()
        self.STICKERS = [("ans", "B!", LIME, (280, 1250), None, -4),
                         (self.b0("why", 0.2), "SCENT GLANDS", MINT, (780, 1240), (40, -10), 4)]

    def set_bg(self, c, t):
        sets2.backyard(c, t, 0.0)

    def kick_windows(self):
        return [(0.3, 1.9), (self.b0("why", 1.4), self.b1("dog1", 0.3))]

    def kicking(self, t):
        for a, b in self.kick_windows():
            if a <= t < b:
                return 0.5 + 0.5 * math.sin((t - a) * 14)
        return 0.0

    def dog_state(self, t):
        kk = self.kicking(t)
        st = {"fx": 1, "happy": 1, "soft": 0.4, "wag": 0.9, "perk": 0.5, "blink": 1 if (t % 3.3) < 0.07 else 0,
              "ear_swing": flops(t, [(0.3, 14), (self.b0("ans"), 16)])}
        if kk > 0:
            st.update(squash=0.5 * kk, rot=-4 + 4 * kk, grin=0.7, perk=1, lean=-8 * kk)
        if self.b0("ans") < t < self.b0("why"):
            st.update(grin=1, hop=hops(t, [self.b0("ans", 0.05)], 50))
        return st

    def stage(self, c, t):
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)

    def world_fx(self, c, t):
        for a, b in self.kick_windows():
            if not (a <= t < b + 1.0):
                continue
            for i in range(int((b - a) / 0.12)):
                ts = a + i * 0.12
                k = prog(t, ts, ts + 0.8)
                if 0 < k < 1:
                    x0, y0 = stage_to_world(self.DX + 120, -14)
                    vx = 260 + (i * 53) % 220
                    vy = -(340 + (i * 37) % 200)
                    x = x0 + vx * k
                    y = y0 + vy * k + 620 * k * k
                    col = ("#8A5A35", "#5FA64A", "#A8743F")[i % 3]
                    ink(c, [(oval(x, y, 12 + 4 * (i % 3), 9 + 3 * (i % 2)), col)], ol=3, a=255 * (1 - prog(k, 0.7, 1)), lc=sets.SL, weight=False)
        kk = prog(t, self.b0("why", 1.6), self.b0("why", 2.0)) * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        if kk > 0:          # scratch marks on the lawn
            x0, y0 = stage_to_world(self.DX + 220, 30)
            for j in range(3):
                line(c, [(x0 + 30 * j, y0), (x0 + 30 * j + 60, y0 - 16)], 8, "#6E4A2A", 255 * kk)

    def sfx(self, m, pluck):
        self.quiz_sfx(m, pluck)
        for a, b in self.kick_windows():
            tt = a
            while tt < b:
                self.rustle(m, tt, 0.15, 0.3)
                tt += 0.45


# =============================================================================================== 021 WHY HE LEANS ON YOU (instant replay, evening sofa)
class Lean(Ep3):
    NUM, SLUG = 21, "lean"
    DX, HX, DOG_FACE = -90, 300, -1
    TITLE = [[("WHY HE ", "w"), ("LEANS", "l")], [("ON YOU", "w")]]
    TITLE_SIZE = 84
    HI = {"LEANS", "SLOW", "MOTION", "PICKS", "PRESSES", "STAYS", "AFFECTION", "HUG", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog leans his whole body on you?", 0.45),
              ("again", "n", "Watch that again. In slow motion.", 0.2),
              ("slow", "n", "He picks you. He presses in. And he doesn't move.", 0.3),
              ("dog1", "d", "You're my person. This is a hug.", 0.35),
              ("why", "n", "One vet calls it affection-seeking, plain and simple. Dogs love close contact, and you're his favorite spot.", 0.3),
              ("card", "n", "Leaning is a dog hug. So lean back.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("IT'S A ", "w"), ("DOG HUG", "l")]]
    CARD_ITEMS = [("Affection", "plain and simple", {"happy": 1, "soft": 1}),
                  ("Close contact", "dogs love to cuddle", {"happy": 1, "squint": 0.4}),
                  ("He picked you", "you're his favorite spot", {"soft": 1, "grin": 0.4})]
    FACT = "\"Affection-seeking behavior, plain and simple.\""
    SOURCE = "Dr. Patty Khuly, veterinarian, via Vetstreet"

    def __init__(self):
        super().__init__()
        self.R0 = self.b0("again", 0.1)
        self.R1 = self.R0 + 0.7
        self.S1 = self.b1("slow", 0.2)
        self.STICKERS = [(self.b0("slow", 0.1), "PICKS YOU", LIME, (300, 1240), None, -4),
                         (self.b0("slow", 1.1), "PRESSES IN", LIME, (780, 1240), None, 4),
                         (self.b0("slow", 2.2), "STAYS PUT", LIME, (300, 1240), None, -4)]

    def vt(self, t):
        """Visual time: normal → rewind → slow-mo → normal."""
        if t < self.R0:
            return t
        if t < self.R1:
            return lerp(self.R0, 0.3, e_io(prog(t, self.R0, self.R1)))
        if t < self.S1:
            return 0.3 + (t - self.R1) * (2.2 / max(0.5, self.S1 - self.R1))
        return 2.5 + (t - self.S1)

    def replay(self, t):
        return self.R0 <= t < self.S1

    def set_bg(self, c, t):
        sets2.lounge(c, self.vt(t))

    def zoom_times(self):
        return (self.b0("dog1", -0.2), self.b0("why", 0.3))

    def cam(self, t):
        mid = stage_to_world((self.DX + self.HX) / 2 - 20, -300)
        close = Cam(mid[0], mid[1], 1.5, 540, 980)
        return cam_keys(t, [(0, Cam(560, 940, 1.04), 0), (self.R1, Cam(mid[0], mid[1] + 40, 1.25, 540, 960), 0.3),
                            (self.T_ZIN, close, 0.3), (self.T_ZOUT, WIDE_END, 0.35)])

    def lean_k(self, v):
        return e_io(prog(v, 0.6, 1.6))

    def dog_state(self, t):
        v = self.vt(t)
        k = self.lean_k(v)
        st = {"fx": -1, "happy": 1, "soft": 0.6 + 0.4 * k, "wag": 0.5 + 0.4 * k, "lean": -40 * k, "rot": 12 * k,
              "squint": 0.45 * prog(v, 1.6, 2.0), "blink": 1 if (v % 3.3) < 0.07 else 0, "ear_swing": flops(v, [(0.6, 14)])}
        return st

    def dog_x(self, t):
        v = self.vt(t)
        return self.DX + 60 * self.lean_k(v)

    def stage(self, c, t):
        v = self.vt(t)
        k = self.lean_k(v)
        x = self.HX
        sh, shf = owner_body(c, x, 8 + 6 * k, "happy" if k > 0.5 else "look", v, gaze=(-4, 2))
        owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.dog_x(t), 0, 1.0, self.dog_state(t), v)
        hug = e_io(prog(v, 1.4, 2.0))
        owner_arm(c, sh, lerp2((x - 76, -92), (self.dog_x(t) - 40, -300 + 8 * math.sin(v * 3)), hug), bend=-1)

    def world_fx(self, c, t):
        b = self.b0("dog1")
        hearts(c, t, [b + 0.1, b + 0.5, b + 0.9, b + 1.3], self.DX + 120)

    def screen_fx(self, c, t, cam):
        if not self.replay(t):
            return
        a = prog(t, self.R0, self.R0 + 0.15) * (1 - prog(t, self.S1 - 0.15, self.S1))
        c.drawRect(skia.Rect.MakeWH(W, H), fill("#1E2550", 40 * a))
        for y in range(0, H, 8):             # scanlines
            c.drawRect(skia.Rect.MakeXYWH(0, y, W, 3), fill("#000000", 26 * a))
        if t < self.R1:
            jy = (t * 2400) % H
            c.drawRect(skia.Rect.MakeXYWH(0, jy, W, 40), fill("#FFFFFF", 50 * a))
        label = "REWIND" if t < self.R1 else "SLOW-MO 0.25x"
        f = ff(700, 40)
        x0, y0 = 70, 330
        c.drawRRect(rrect(x0 + 4, y0 + 6, f.measureText(label) + 80, 70, 35), fill(INK, 255 * a))
        ink(c, [(rr(x0, y0, f.measureText(label) + 80, 70, 35), WHITE if t < self.R1 else LIME)], ol=5, a=255 * a)
        if t < self.R1:
            for j in range(2):
                tx = x0 + 22 + 16 * j
                c.drawPath(skia.Path().moveTo(tx + 16, y0 + 21).lineTo(tx, y0 + 35).lineTo(tx + 16, y0 + 49).close(), fill(INK, 255 * a))
        else:
            c.drawCircle(x0 + 34, y0 + 35, 11, fill(CORAL, 255 * a * (1 if int(t * 3) % 2 else 0.3)))
        c.drawTextBlob(skia.TextBlob(label, f), x0 + 56, y0 + 49, fill(INK, 255 * a))

    def sfx(self, m, pluck):
        n = int((self.R1 - self.R0) * S.SR)
        ar = np.arange(n) / S.SR
        rew = np.sin(2 * np.pi * np.cumsum(np.linspace(900, 2600, n)) / S.SR) * 0.25 + S.hp(S.rng.standard_normal(n), 3000) * 0.08
        m.add(rew, self.R0, 0.35, send=0.2)
        m.add(S.sub_hit(50, 0.6), self.R1, 0.2, send=0.2)
        b = self.b0("dog1")
        for th in (0.1, 0.5, 0.9, 1.3):
            self.pop(m, b + th + 0.05, 700, 1500, 0.22)


EPISODES = {12: Bathroom, 13: Zoomies, 14: Tail, 15: Spin, 16: Clothes, 17: GoodBoy, 18: Doorbell, 19: Night, 20: Kick, 21: Lean}

if __name__ == "__main__":
    ep = EPISODES[int(sys.argv[1])]()
    sys.argv = sys.argv[1:]
    main3(ep)
