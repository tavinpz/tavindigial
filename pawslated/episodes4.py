"""PAWSLATED 007–011: new formats + new sets.
python3 episodes4.py <num> stills <t|beat[+off]> ...  |  python3 episodes4.py <num> render"""
import math
import sys

import skia

import sets
from engine3 import *
from paw import prog, e_io, e_out, e_back, e_sine, lerp, lerp2, clamp, fill, stroke, rrect, LIME, CORAL, MINT, INK, CREAM
from toon import *
from episodes3 import flops, hops, hearts, CTA_LINES, WIDE, WIDE_END

WHITE = "#FFFFFF"


def speech(c, x, y, text, k, maxw=860, size=46, tail_dx=120, col=INK):
    """Wrapped speech balloon (owner talking)."""
    if k <= 0:
        return
    f = ff(600, size)
    words, lines, cur = text.split(), [], ""
    for w in words:
        nxt = (cur + " " + w).strip()
        if f.measureText(nxt) > maxw - 80 and cur:
            lines.append(cur)
            cur = w
        else:
            cur = nxt
    if cur:
        lines.append(cur)
    if not lines:
        lines = [""]
    lh = size * 1.25
    bw = max(240, max(f.measureText(l) for l in lines) + 80)
    bh = lh * len(lines) + 50
    s = e_back(clamp(k), 1.8)
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    tail = skia.Path().moveTo(tail_dx - 30, bh / 2 - 6).lineTo(tail_dx + 20, bh / 2 + 60).lineTo(tail_dx + 30, bh / 2 - 6).close()
    c.drawRRect(rrect(-bw / 2 + 6, -bh / 2 + 10, bw, bh, 40), fill(INK))
    ink(c, [(rr(-bw / 2, -bh / 2, bw, bh, 40), WHITE), (tail, WHITE)], ol=6)
    for i, l in enumerate(lines):
        if l:
            c.drawTextBlob(skia.TextBlob(l, f), -bw / 2 + 40, -bh / 2 + 25 + lh * (i + 0.8), fill(col))
    c.restore()


def ring(c, x, y, r, k, col):
    if k <= 0:
        return
    s = e_back(clamp(k), 2.2)
    c.drawCircle(x, y, r * s, stroke(INK, 14, 255 * clamp(k * 2)))
    c.drawCircle(x, y, r * s, stroke(col, 8, 255 * clamp(k * 2)))


def typed(msg, t, t0, t1):
    n = int(len(msg) * prog(t, t0, t0 + (t1 - t0) * 0.95))
    return msg[:n]


# =============================================================================================== 007 WHAT HE HEARS (kitchen)
class Hears(Ep3):
    NUM, SLUG = 7, "hears"
    DX, HX, DOG_FACE = -200, 200, -1
    TITLE = [[("WHAT HE ", "w"), ("HEARS", "l")], [("WHEN YOU TALK", "w")]]
    HI = {"HEARS", "89", "WORDS", "200", "COME", "DOWN", "ROLL", "TRANSLATE"}
    SCRIPT = [("hook", "n", "What you say to your dog, versus what he actually hears.", 0.2),
              ("you", "o", "Okay buddy, I'm going to work now. Be a good boy, don't chew the couch, and later we'll go for a walk.", 0.3),
              ("hears", "n", "What he hears:", 0.15),
              ("blah", "d", "Blah blah blah... blah blah... WALK?!", 0.3),
              ("sci", "n", "But he knows more than you think: about 89 words on average. Some dogs, over 200.", 0.3),
              ("dog2", "d", "Walk! Treat! Ball! I know them all!", 0.35),
              ("card", "n", "The words that got the most reactions? Commands, like come, down, and roll over.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HE KNOWS", "w")], [("~89 ", "l"), ("WORDS", "w")]]
    CARD_ITEMS = [("Come", "the number one classic", {"perk": 1}),
                  ("Down", "lie down, please", {"soft": 1}),
                  ("Roll over", "the party trick", {"happy": 1, "grin": 0.6})]
    FACT = "Dogs responded to 89 words on average, from 15 up to 215."
    SOURCE = "Reid et al., Dalhousie University (2021)"

    def __init__(self):
        super().__init__()
        self.STICKERS = [("you", "YOU SAY", WHITE, (540, 440), None, -3),
                         ("hears", "HE HEARS", LIME, (540, 440), None, 3),
                         ("sci", "89 WORDS", MINT, (300, 560), None, -4)]
        self.T_WALK = self.b1("blah", -0.9)

    def set_bg(self, c, t):
        sets.kitchen(c, t)

    def zoom_times(self):
        return (self.b0("hears"), self.b0("sci"))

    def zoom_marks(self):
        return [self.T_ZIN, self.T_ZOUT]

    def dog_state(self, t):
        b0, b1 = self.B["blah"]
        tilt = 0
        if b0 <= t < self.T_WALK:            # head tilts side to side with every "blah"
            tilt = 9 * math.sin((t - b0) * 6)
        walk = e_io(prog(t, self.T_WALK, self.T_WALK + 0.2))
        st = {"fx": -1, "wag": 0.3 + 1.0 * walk, "blink": 1 if (t % 3.2) < 0.07 else 0, "soft": 0.4,
              "rot": tilt + 10 * walk * (1 - prog(t, self.b0("sci"), self.b0("sci", 0.3))), "perk": walk,
              "ear_swing": flops(t, [(self.T_WALK, 22)] + [(self.b0("sci", 0.4 + 0.6 * i), 14) for i in range(4)]),
              "hop": hops(t, [self.b0("sci", 0.4 + 0.6 * i) for i in range(4)] + [self.b0("dog2", 0.6 * i) for i in range(3)], 60)}
        if t > self.T_WALK:
            st.update(happy=1, grin=1.0)
        if self.b0("you") < t < self.b0("hears"):
            st.update(happy=0, grin=0, soft=0.8, pdx=-4)
        return st

    def stage(self, c, t):
        x = self.HX
        talking = self.b0("you") < t < self.b1("you")
        face = "talk" if talking else ("laugh" if t > self.b0("sci") else "look")
        sh, shf = owner_body(c, x, 6, face, t, gaze=(-4, 0), talk=1.0)
        owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)
        wave = math.sin(t * 5) * 30 if talking else 0
        owner_arm(c, sh, (x - 130, -230 + wave) if talking else (x - 76, -92), bend=-1)

    def screen_fx(self, c, t, cam):
        t0, t1 = self.B["you"]
        k = prog(t, t0 - 0.2, t0) * (1 - prog(t, t1 + 0.2, t1 + 0.4))
        if k > 0:
            speech(c, 540, 680, typed(self.SCRIPT[1][2], t, t0, t1) or " ", k, 900, 44, 200)
        kk = prog(t, self.T_WALK, self.T_WALK + 0.3) * (1 - prog(t, self.T_ZOUT - 0.2, self.T_ZOUT))
        if kk > 0:
            qmark(c, 820, 640, kk, "!", 140, "#FFE14D", 10)
            qmark(c, 900, 760, kk, "!", 100, "#FFE14D", -8)

    def sfx(self, m, pluck):
        for i in range(4):
            self.boing(m, self.b0("sci", 0.4 + 0.6 * i), 0.14)
        m.add(pluck(S.note(88), 0.8, 0.4), self.T_WALK, 0.4, send=0.4)


# =============================================================================================== 008 HAPPY vs STRESSED (park, split screen)
class HappyStressed(Ep3):
    NUM, SLUG = 8, "happy-vs-stressed"
    DX, HX, DOG_FACE = 0, 0, 1
    TITLE = [[("HAPPY", "l"), (" OR ", "w"), ("STRESSED", "w"), ("?", "w")]]
    TITLE_SIZE = 84
    HI = {"HAPPY", "STRESSED", "TAIL", "EARS", "MOUTH", "EYES", "SAVE", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Happy dog, or stressed dog? Here's how to tell.", 0.25),
              ("tail", "n", "The tail. A slow, loose wag, versus a stiff, fast one.", 0.15),
              ("ears", "n", "The ears. Relaxed, versus pinned back.", 0.15),
              ("mouth", "n", "The mouth. A big goofy smile, versus closed and tight.", 0.15),
              ("eyes", "n", "And the eyes. Soft, versus wide and tense.", 0.3),
              ("dog1", "d", "Left me: pet me! Right me: give me a minute.", 0.3),
              ("save", "n", "Look for a few signs together, not just one. Save this so you never forget.", 0.3),
              ("card", "n", "Tail, ears, mouth, eyes. Check all four.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HAPPY ", "l"), ("vs", "w")], [("STRESSED", "w")]]
    CARD_ITEMS = [("Tail", "slow + loose  vs  stiff + fast", {"happy": 1}),
                  ("Ears", "relaxed  vs  pinned back", {"ears": 1}),
                  ("Mouth", "goofy smile  vs  closed + tight", {"grin": 1, "happy": 1}),
                  ("Eyes", "soft  vs  wide + tense", {"whale": 1, "ears": 0.6})]
    FACT = "No single sign tells you everything. Look for several together."
    SOURCE = "American Kennel Club (AKC)"
    S = 0.85
    LX, RX = -229, 229
    ROWS = {"tail": ((150, -150), "slow, loose wag", "stiff, fast wag"),
            "ears": ((-10, -360), "relaxed", "pinned back"),
            "mouth": ((-165, -300), "goofy smile", "closed + tight"),
            "eyes": ((-118, -382), "soft", "wide + tense")}

    def zoom_times(self):
        return (99.0, 99.0)

    def zoom_marks(self):
        return []

    def cam(self, t):
        return Cam(540, 985 - 10 * e_sine(prog(t, 0, self.T_CARD)), 1.1 + 0.03 * e_sine(prog(t, 0, self.T_CARD)), 540, 930)

    def set_bg(self, c, t):
        sets.park(c, t)

    def happy_st(self, t):
        return {"fx": -1, "happy": 1, "grin": 1.0, "soft": 1, "wag": 1.0, "wagf": 0.45, "tailang": 34,
                "blink": 0, "ear_swing": 0}

    def stressed_st(self, t):
        return {"fx": 1, "ears": 1, "whale": 0.8, "wag": 0.35, "wagf": 1.9, "tailang": -14, "lines": 1, "sweat": 0.6,
                "rot": -6, "blink": 1 if (t % 2.7) < 0.06 else 0}

    def stage(self, c, t):
        dog(c, self.LX, 0, self.S, self.happy_st(t), t)
        dog(c, self.RX, 0, self.S, self.stressed_st(t), t)

    def feat_world(self, side, lx, ly):
        x = self.LX if side == 0 else self.RX
        fx = -1 if side == 0 else 1
        return stage_to_world(x + fx * self.S * lx, self.S * ly)

    def screen_fx(self, c, t, cam):
        if t >= self.T_CARD:
            return
        # panel tints, divider and labels
        a = 255 * (1 - prog(t, self.T_CARD - 0.3, self.T_CARD))
        c.drawRect(skia.Rect.MakeLTRB(0, 300, W / 2, 1380), fill(MINT, 26))
        c.drawRect(skia.Rect.MakeLTRB(W / 2, 300, W, 1380), fill(CORAL, 26))
        c.drawRRect(rrect(W / 2 - 7, 330, 14, 1020, 7), fill(INK, a))
        c.drawRRect(rrect(W / 2 - 3, 334, 6, 1012, 3), fill(WHITE, a))
        k0 = prog(t, 0.3, 0.6)
        sticker(c, 270, 400, "HAPPY", k0, MINT, -4, 50)
        sticker(c, 810, 400, "STRESSED", k0, CORAL, 4, 50)
        keys = ["tail", "ears", "mouth", "eyes"]
        for i, key in enumerate(keys):
            t0 = self.b0(key)
            t1 = self.b0(keys[i + 1]) if i + 1 < 4 else self.b0("save")
            k = prog(t, t0, t0 + 0.35) * (1 - prog(t, t1 - 0.1, t1 + 0.1))
            if k <= 0:
                continue
            (lx, ly), lt, rt = self.ROWS[key]
            for side, col, txt in ((0, MINT, lt), (1, CORAL, rt)):
                px, py = cam.pt(*self.feat_world(side, lx, ly))
                ring(c, px, py, 58, k, col)
                sticker(c, 270 if side == 0 else 810, 1290, txt, k, col, -3 if side == 0 else 3, 40)

    def sfx(self, m, pluck):
        for i, key in enumerate(["tail", "ears", "mouth", "eyes"]):
            m.add(pluck(S.note(79 + 3 * i), 0.5, 0.35), self.b0(key), 0.3, pan=-0.3, send=0.3)
            m.add(pluck(S.note(70 - 2 * i), 0.5, 0.35), self.b0(key, 0.25), 0.3, pan=0.3, send=0.3)


# =============================================================================================== 009 QUIZ: why does he lick you? (bedroom)
class LickQuiz(Ep3):
    NUM, SLUG = 9, "lick-quiz"
    DX, HX, DOG_FACE = -130, 220, -1
    TITLE = [[("WHY DOES HE ", "w"), ("LICK", "l")], [("YOUR FACE?", "w")]]
    HI = {"LICK", "B", "C", "SALTY", "GREETING", "AFFECTION", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Why does your dog lick you? Pick one.", 0.2),
              ("opts", "n", "A: he's cleaning you. B: he loves you. C: you taste salty.", 0.3),
              ("count", "n", "Lock in your answer. Three, two, one.", 0.3),
              ("ans", "n", "It's B and C!", 0.2),
              ("why", "n", "Licking is a greeting and a sign of affection. And human skin is slightly salty, especially after a workout.", 0.3),
              ("dog1", "d", "You taste like fries. I love you!", 0.35),
              ("card", "n", "He might also lick you right after you eat, or just to say hi.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("WHY HE ", "w"), ("LICKS", "l")], [("YOU", "w")]]
    CARD_ITEMS = [("I love you", "licking is affection", {"happy": 1}),
                  ("You're salty", "especially after a workout", {"lick": 0.5}),
                  ("Hi! Hi! Hi!", "a happy greeting", {"perk": 1, "grin": 0.6, "happy": 1}),
                  ("Is that food?", "you just ate something", {"lick": 0.5, "perk": 0.5})]
    FACT = "\"Licking can be a sign of affection.\""
    SOURCE = "Dr. Mary Burch, American Kennel Club"
    OPTS = [("A", "He's cleaning you"), ("B", "He loves you"), ("C", "You taste salty")]

    def __init__(self):
        super().__init__()
        self.STICKERS = [("ans", "B + C!", LIME, (280, 1250), None, -4)]

    def set_bg(self, c, t):
        sets.bedroom(c, t)

    def zoom_times(self):
        return (99.0, 99.0)

    def zoom_marks(self):
        return [self.b0("ans")]

    def cam(self, t):
        quiz = prog(t, self.b0("opts", -0.3), self.b0("opts")) * (1 - prog(t, self.b0("why"), self.b0("why", 0.4)))
        base = Cam(560, 960, 1.08)
        q = Cam(540, 720, 0.9)
        c = Cam.mix(base, q, e_io(quiz))
        return c

    def licking(self, t):
        v = 0
        for a, b in ((0.3, 1.6), (self.b0("why"), self.b1("dog1", 0.5))):
            if a <= t < b:
                v = max(v, 0.5 + 0.5 * math.sin((t - a) * 9))
        return v

    def dog_state(self, t):
        lk = self.licking(t)
        st = {"fx": -1, "happy": 1, "wag": 1.2, "lean": -36 * min(1, lk * 3), "reach": lk, "perk": 0.4,
              "ear_swing": flops(t, [(0.3, 16), (self.b0("why"), 18)]), "rot": 6 * lk}
        if lk < 0.05:
            st.update(reach=0, grin=0.6)
        return st

    def stage(self, c, t):
        x = self.HX
        lk = self.licking(t)
        sh, shf = owner_body(c, x, 6 - 8 * lk, "laugh" if lk > 0.1 else "look", t, gaze=(-4, 0))
        owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)
        owner_arm(c, sh, (x - 76, -92) if lk < 0.1 else (x - 150, -240), bend=-1)

    def world_fx(self, c, t):
        b = self.b0("dog1")
        hearts(c, t, [b, b + 0.35, b + 0.7, b + 1.0], self.DX + 120)

    def screen_fx(self, c, t, cam):
        t0 = self.b0("opts")
        tans = self.b0("ans")
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
            right = L in ("B", "C")
            rev = prog(t, tans, tans + 0.25)
            col = WHITE if rev <= 0 else (MINT if right else "#CFCFCF")
            c.save()
            c.translate(W / 2, y + 54)
            c.scale(k, k)
            c.rotate((-1.5, 1.2, -1)[i])
            c.translate(-W / 2, -(y + 54))
            c.drawRRect(rrect(126, y + 10, 840, 108, 40), fill(INK))
            ink(c, [(rr(120, y, 840, 108, 40), col)], ol=6)
            ink(c, [(oval(196, y + 54, 38, 38), "#FFE14D")], ol=5)
            c.drawTextBlob(skia.TextBlob(L, ff(700, 50)), 196 - ff(700, 50).measureText(L) / 2, y + 72, fill(INK))
            c.drawTextBlob(skia.TextBlob(txt, ff(600, 48)), 262, y + 72, fill(INK if (rev <= 0 or right) else "#7A7A7A"))
            if rev > 0:
                mark = "✓" if right else "✗"
                cx = 900
                if right:
                    line(c, [(cx - 26, y + 54), (cx - 6, y + 76)], 12, INK)
                    line(c, [(cx - 6, y + 76), (cx + 30, y + 30)], 12, INK)
                else:
                    line(c, [(cx - 22, y + 32), (cx + 22, y + 76)], 12, CORAL)
                    line(c, [(cx + 22, y + 32), (cx - 22, y + 76)], 12, CORAL)
            c.restore()
        # countdown
        c0, c1 = self.B["count"]
        for j, n in enumerate(("3", "2", "1")):
            ts = c1 - 1.15 + 0.38 * j
            k = prog(t, ts, ts + 0.12) * (1 - prog(t, ts + 0.3, ts + 0.38))
            if k > 0:
                qmark(c, 880, 1080, k, n, 240, LIME, (-6, 4, -2)[j])
        kc = prog(t, c0, c0 + 0.3) * (1 - prog(t, tans, tans + 0.2))
        if kc > 0:
            sticker(c, 540, 1270, "COMMENT A, B OR C", kc, WHITE, 2, 40, tcol=INK)

    def sfx(self, m, pluck):
        c0, c1 = self.B["count"]
        for j in range(3):
            m.add(pluck(S.note(72), 0.4, 0.3), c1 - 1.15 + 0.38 * j, 0.4, send=0.2)
        m.add(pluck(S.note(84), 1.0, 0.4), self.b0("ans"), 0.45, send=0.5)
        m.add(pluck(S.note(88), 1.0, 0.4), self.b0("ans", 0.08), 0.4, send=0.5)
        n = int(0.25 * S.SR)
        slurp = S.bp(S.rng.standard_normal(n), 800, 3000) * np.sin(np.pi * np.arange(n) / n) * 0.6
        for tt in (0.4, 0.9, self.b0("why", 0.1), self.b0("why", 0.8), self.b0("dog1", 0.2)):
            m.add(slurp, tt, 0.3, send=0.2)
        b = self.b0("dog1")
        for th in (b, b + 0.35, b + 0.7, b + 1.0):
            self.pop(m, th + 0.05, 700, 1500, 0.28)


# =============================================================================================== 010 WHILE YOU'RE GONE (hallway, time-lapse)
class Gone(Ep3):
    NUM, SLUG = 10, "while-youre-gone"
    DX, HX, DOG_FACE = -150, 230, -1
    TITLE = [[("WHAT YOUR DOG ", "w")], [("THINKS ", "w"), ("WHEN YOU LEAVE", "l")]]
    TITLE_SIZE = 72
    HI = {"LEAVE", "TWO", "HOURS", "THIRTY", "INTENSELY", "TRANSLATE"}
    SCRIPT = [("hook", "n", "What your dog thinks after you leave.", 0.25),
              ("t1", "d", "Minute one. She'll be right back.", 0.45),
              ("t2", "d", "Thirty minutes. Okay, any second now.", 0.45),
              ("t3", "d", "Two hours. Is she ever coming back?", 0.45),
              ("t4", "d", "Four hours. I'll just wait here. Forever.", 0.45),
              ("back", "n", "And then...", 0.35),
              ("dog2", "d", "YOU'RE BACK! Best day ever!", 0.35),
              ("sci", "n", "And he really can tell. In one study, dogs greeted their owners much more intensely after two hours alone than after thirty minutes.", 0.3),
              ("card", "n", "Thirty minutes gets a normal hello. Two hours or more gets the big one.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("HE KNOWS", "w")], [("YOU WERE ", "w"), ("GONE", "l")]]
    CARD_ITEMS = [("30 minutes", "a normal hello", {"happy": 1}),
                  ("2 hours", "a BIG hello", {"grin": 1, "happy": 1}),
                  ("4 hours", "the same big hello", {"grin": 1, "happy": 1, "perk": 1})]
    FACT = "Dogs greeted owners more intensely after 2 hours than after 30 minutes."
    SOURCE = "Rehn & Keeling (2011), Applied Animal Behaviour Science"
    CLOCK = {"t1": "0:01", "t2": "0:30", "t3": "2:00", "t4": "4:00"}

    def __init__(self):
        super().__init__()
        self.STICKERS = []
        self.T_OPEN = self.b0("back", 0.25)

    def night(self, t):
        return 0.15 * prog(t, self.b0("t2"), self.b0("t2", 0.4)) + 0.35 * prog(t, self.b0("t3"), self.b0("t3", 0.4)) + 0.5 * prog(t, self.b0("t4"), self.b0("t4", 0.4))

    def set_bg(self, c, t):
        sets.hallway(c, t, self.night(t))
        k = e_io(prog(t, self.T_OPEN, self.T_OPEN + 0.5))
        if k > 0:      # door swings open: light spills in
            dx, dy, dw, dh = 640, 420, 340, GY - 420
            c.drawRect(skia.Rect.MakeXYWH(dx, dy, dw, dh), fill("#FFF4D6"))
            g = skia.Paint(AntiAlias=True)
            g.setShader(skia.GradientShader.MakeRadial((dx + dw / 2, dy + dh / 2), 700, [C("#FFF4D6", int(160 * k)), C("#FFF4D6", 0)]))
            c.drawCircle(dx + dw / 2, dy + dh / 2, 700, g)
            ww = dw * (1 - 0.82 * k)
            ink(c, [(rr(dx + dw - ww, dy, ww, dh, 6), "#B87444")], ol=5, lc=sets.SL)

    def zoom_times(self):
        return (self.b0("t3"), self.b0("back"))

    def cam(self, t):
        close = Cam(*self.head_focus(), 1.9, 540, 1000)
        c = cam_keys(t, [(0, Cam(560, 930, 1.02), 0), (self.T_ZIN, close, 0.6), (self.T_ZOUT, Cam(600, 940, 1.04), 0.3)])
        return c

    def dog_x(self, t):
        return self.DX + 200 * e_io(prog(t, self.T_OPEN + 0.4, self.T_OPEN + 1.2))

    def dog_state(self, t):
        sad = 0.0
        for key, v in (("t2", 0.2), ("t3", 0.6), ("t4", 1.0)):
            if t >= self.b0(key):
                sad = v
        sad *= 1 - prog(t, self.T_OPEN, self.T_OPEN + 0.3)
        st = {"fx": -1, "ears": 0.35 * sad, "rot": -16 * sad, "soft": 1 - sad, "pdx": -4, "pdy": 6 * sad, "turn": 0.3 * sad,
              "wag": max(0.05, 0.6 - sad), "blink": 1 if (t % 3.4) < 0.08 else 0,
              "ear_swing": flops(t, [(self.T_OPEN, 24), (self.T_OPEN + 0.9, 18)]),
              "hop": hops(t, [self.T_OPEN + 0.4, self.T_OPEN + 0.95, self.T_OPEN + 1.5, self.T_OPEN + 2.05], 70)}
        if t > self.T_OPEN:
            st.update(happy=1, grin=1, wag=1.5, perk=0.8, rot=8, soft=0)
        return st

    def stage(self, c, t):
        k = e_io(prog(t, self.T_OPEN + 0.2, self.T_OPEN + 0.7))
        if k > 0:
            x = self.HX + 120 * (1 - k)
            sh, shf = owner_body(c, x, 10, "laugh", t, gaze=(-4, 0))
            owner_arm(c, shf, (x - 110, -330), bend=1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.dog_x(t), 0, 1.0, self.dog_state(t), t)
        if k > 0:
            owner_arm(c, sh, (x - 170, -300), bend=-1)

    def world_fx(self, c, t):
        hearts(c, t, [self.T_OPEN + 0.6, self.T_OPEN + 0.9, self.T_OPEN + 1.3, self.T_OPEN + 1.7], self.DX + 220)

    def screen_fx(self, c, t, cam):
        cur = None
        for key in ("t1", "t2", "t3", "t4"):
            if t >= self.b0(key, -0.15):
                cur = key
        if cur and t < self.T_OPEN:
            k = prog(t, self.b0(cur, -0.15), self.b0(cur, 0.1))
            s = e_back(clamp(k), 2.4)
            c.save()
            c.translate(540, 470)
            c.scale(s, s)
            c.drawRRect(rrect(-176, -56, 360, 124, 40), fill(INK))
            ink(c, [(rr(-180, -66, 360, 124, 40), "#FFFFFF")], ol=6)
            ink(c, [(oval(-112, -4, 40, 40), "#FFE14D")], ol=5)
            ang = t * 6
            line(c, [(-112, -4), (-112 + 26 * math.cos(ang), -4 + 26 * math.sin(ang))], 6, INK)
            line(c, [(-112, -4), (-112 + 16 * math.cos(ang / 12), -4 + 16 * math.sin(ang / 12))], 7, INK)
            txt = self.CLOCK[cur]
            f = ff(700, 70)
            c.drawTextBlob(skia.TextBlob(txt, f), -50, 22, fill(INK))
            c.drawTextBlob(skia.TextBlob("h", ff(600, 34)), -50 + f.measureText(txt) + 6, 22, fill("#6B625A"))
            c.restore()
        kb = prog(t, 0.2, 0.5) * (1 - prog(t, self.b0("t1", -0.2), self.b0("t1")))
        if kb > 0:
            sticker(c, 800, 560, "BYE! BE GOOD!", kb, WHITE, 4, 40, tcol=INK)

    def sfx(self, m, pluck):
        n = int(0.3 * S.SR)
        thud = S.lp(S.rng.standard_normal(n), 300) * np.exp(-np.arange(n) / (0.04 * S.SR))
        m.add(thud, self.b0("t1", -0.25), 0.8, send=0.3)          # door shuts
        for key in ("t2", "t3", "t4"):
            m.add(S.whoosh(0.5, 300, 1800), self.b0(key, -0.2), 0.25, send=0.4)
            for i in range(4):
                n = int(0.03 * S.SR)
                m.add(S.hp(S.rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / (0.004 * S.SR)), self.b0(key, -0.2 + 0.06 * i), 0.25)
        m.add(S.creak(0.6) if hasattr(S, "creak") else thud, self.T_OPEN, 0.4, send=0.3)
        for k in range(4):
            self.boing(m, self.T_OPEN + 0.35 + 0.55 * k, 0.2)
        for th in (0.6, 0.9, 1.3, 1.7):
            self.pop(m, self.T_OPEN + th, 700, 1500, 0.25)


# =============================================================================================== 011 WRONG vs RIGHT: head pats (evening living room)
class HeadPat(Ep3):
    NUM, SLUG = 11, "head-pat"
    DX, HX, DOG_FACE = -90, 150, 1
    TITLE = [[("STOP PATTING ", "w")], [("HIS ", "w"), ("HEAD", "l")]]
    TITLE_SIZE = 84
    HI = {"STOP", "HEAD", "DUCKS", "EARS", "LICKS", "CHEST", "CHIN", "LOW", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Stop patting your dog on the head.", 0.25),
              ("wrong", "n", "Most dogs don't love it. Watch him.", 0.1),
              ("duck", "n", "He ducks, his ears go back, he licks his lips.", 0.3),
              ("dog1", "d", "Please... not the head.", 0.3),
              ("right", "n", "Instead, get low, let him come to you, and scratch his chest or chin.", 0.3),
              ("dog2", "d", "Oh yes. Right there!", 0.35),
              ("card", "n", "Get low. Let him sniff. Chest or chin, not the top of the head.", 0.3)] + CTA_LINES
    CARD_TITLE = [[("PET HIM", "w")], [("THE ", "w"), ("RIGHT", "l"), (" WAY", "w")]]
    CARD_ITEMS = [("Get low", "don't loom over him", {"soft": 1}),
                  ("Let him sniff", "he comes to you", {"perk": 1}),
                  ("Chest or chin", "not the top of the head", {"happy": 1, "grin": 0.6})]
    FACT = "Most dogs prefer chin or chest scratches to head pats."
    SOURCE = "Meg Marrs, dog behaviour expert, via Reader's Digest"

    def __init__(self):
        super().__init__()
        self.STICKERS = [("hook", "WRONG", CORAL, (300, 560), None, -6),
                         ("duck", "DUCKS", CORAL, (790, 600), (-62, -446), 4),
                         (self.b0("duck", 0.9), "EARS BACK", CORAL, (790, 600), (-40, -420), 4),
                         (self.b0("duck", 1.8), "LIP LICK", CORAL, (300, 1240), (-200, -320), -4),
                         ("right", "RIGHT", MINT, (300, 560), None, -6)]
        self.T_FLIP = self.b0("right", 0.8)

    def set_bg(self, c, t):
        sets.evening(c, t, lambda cc, tt: (room(cc, tt), sunbeam(cc, tt)))

    def zoom_times(self):
        return (self.b0("duck", -0.15), self.b0("right"))

    def cam(self, t):
        close = Cam(318, 820, 1.9, 560, 1010)
        return cam_keys(t, [(0, WIDE, 0), (0.0, Cam(540, 940, 1.05), self.T_ZIN), (self.T_ZIN, close, 0.28), (self.T_ZOUT, WIDE_END, 0.35)])

    def patting(self, t):
        return 0.3 < t < self.b0("right", 0.2)

    def dog_state(self, t):
        pat = self.patting(t)
        k = lambda key, off=0.0: e_io(prog(t, self.b0(key, off), self.b0(key, off + 0.3)))
        bob = (math.sin(t * 10) * 0.5 + 0.5) if pat else 0
        st = {"fx": 1, "wag": 0.15, "blink": 1 if (t % 3.2) < 0.07 else 0}
        if pat:
            st.update(rot=-10 - 8 * bob, ears=0.4 + 0.6 * k("duck", 0.9), whale=0.6 * k("duck", 0.3), lines=k("wrong"),
                      lick=prog(t, self.b0("duck", 1.8), self.b0("duck", 2.2)) if t < self.b0("duck", 2.3) else 0)
            st["squash"] = 0.6 * bob
        kf = e_io(prog(t, self.T_FLIP, self.T_FLIP + 0.25))
        fx = math.cos(math.pi * kf)
        st["fx"] = fx if abs(fx) > 0.05 else 0.05
        st["ear_swing"] = flops(t, [(self.b0("right", 0.3), 18), (self.T_FLIP + 0.2, 24)])
        if t > self.T_FLIP + 0.1:
            st.update(happy=1, wag=1.2, soft=1, lean=-14 * e_io(prog(t, self.T_FLIP + 0.5, self.T_FLIP + 0.9)), rot=10)
        return st

    def stage(self, c, t):
        pat = self.patting(t)
        back = e_io(prog(t, self.b0("right", 0.1), self.b0("right", 0.6)))
        x = self.HX + 110 * back
        lean = (80 if pat else 0) * (1 - back) + 6
        face = "happy" if t > self.T_FLIP + 0.4 else "open"
        sh, shf = owner_body(c, x, lean, face, t, gaze=(-4, 4))
        owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.DX, 0, 1.0, self.dog_state(t), t)
        if pat:
            bob = (math.sin(t * 10) * 0.5 + 0.5)
            tgt = (self.DX - 70, -470 + 30 * bob)
        else:
            sc = e_io(prog(t, self.T_FLIP + 0.5, self.T_FLIP + 1.0))
            tgt = lerp2((x - 76, -92), (self.DX + 150, -236 + 10 * math.sin(t * 11)), sc)
        owner_arm(c, sh, tgt, bend=-1)

    def world_fx(self, c, t):
        b = self.b0("dog2")
        hearts(c, t, [b - 0.2, b + 0.2, b + 0.6, b + 1.0], self.DX + 60)

    def screen_fx(self, c, t, cam):
        pass

    def sfx(self, m, pluck):
        for i in range(int((self.b0("right") - 0.4) * 10 / (2 * math.pi)) + 1):
            tt = 0.3 + (math.pi / 2 + 2 * math.pi * i) / 10
            if tt < self.b0("right"):
                n = int(0.05 * S.SR)
                m.add(S.lp(S.rng.standard_normal(n), 900) * np.exp(-np.arange(n) / (0.01 * S.SR)), tt, 0.35, send=0.1)
        self.boing(m, self.T_FLIP - 0.05, 0.2)
        b = self.b0("dog2")
        for th in (b - 0.2, b + 0.2, b + 0.6, b + 1.0):
            self.pop(m, th + 0.05, 700, 1500, 0.25)


EPISODES = {7: Hears, 8: HappyStressed, 9: LickQuiz, 10: Gone, 11: HeadPat}

if __name__ == "__main__":
    ep = EPISODES[int(sys.argv[1])]()
    sys.argv = sys.argv[1:]
    main3(ep)
