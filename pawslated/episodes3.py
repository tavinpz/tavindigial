"""PAWSLATED v3 (narrated) episodes.   python3 episodes3.py <num> stills <t|beat[+off]> ...  |  python3 episodes3.py <num> render"""
import math
import sys

from engine3 import *
from paw import prog, e_io, e_out, e_back, lerp, lerp2, clamp, LIME, CORAL, MINT, INK
from toon import *

WIDE = Cam(540, 940, 1.0)
WIDE_B = Cam(530, 930, 1.06)
WIDE_END = Cam(560, 960, 1.1)


def flops(t, events):
    s = 0
    for t0, amp in events:
        if t > t0:
            d = t - t0
            s += amp * math.exp(-d * 4.5) * math.sin(d * 18)
    return s


def hops(t, times, h=60, d=0.42):
    v = 0
    for t0 in times:
        k = prog(t, t0, t0 + d)
        if 0 < k < 1:
            v = max(v, h * math.sin(math.pi * k))
    return v


def hearts(c, t, times, sx, sy=-460):
    for i, th in enumerate(times):
        kk = prog(t, th, th + 1.4)
        if 0 < kk < 1:
            hx, hy = stage_to_world(sx + 60 * math.sin(i * 2.3 + kk * 4), sy - 230 * e_out(kk))
            heart(c, hx, hy, (1.2 if i % 2 else 0.9) * e_back(clamp(kk * 4), 2.0), 255 * (1 - prog(kk, 0.7, 1)))


# =============================================================================================== 001 YAWN
class Yawn3(Ep3):
    NUM, SLUG = 1, "yawn"
    DX, HX = -90, 190
    DOG_FACE = 1
    TITLE = [[("YOUR DOG ", "w"), ("YAWNS", "l")], [("WHEN YOU HUG HIM?", "w")]]
    HI = {"YAWNS", "YAWN", "SPACE", "TRANSLATE", "EARS", "EYES", "NOSE", "HEAD", "TOO", "MUCH"}
    SCRIPT = [
        ("hook", "n", "Your dog yawns when you hug him?", 0.25),
        ("not", "n", "That's not a sleepy yawn.", 0.2),
        ("watch", "n", "Watch closely.", 0.1),
        ("ears", "n", "His ears pin back,", 0.05),
        ("whale", "n", "you can see the whites of his eyes,", 0.05),
        ("lick", "n", "he licks his nose,", 0.05),
        ("turn", "n", "and he turns his head away.", 0.3),
        ("dog1", "d", "I'm not tired. This is too much!", 0.3),
        ("let", "n", "So let go, and let him come to you.", 0.3),
        ("dog2", "d", "Better. Thank you!", 0.35),
        ("card", "n", "Yawning, nose licking, whale eye, looking away. Four signs he needs space.", 0.3),
        ("cta", "n", "Comment translate, and I'll send you thirty more.", 0.25),
        ("sting", "n", "Your dog, translated.", 0.4),
    ]
    STICKERS = [("not", "YAWN", CORAL, (560, 1250), (-150, -300), 3),
                ("ears", "EARS BACK", CORAL, (790, 560), (-40, -420), 5),
                ("whale", "WHALE EYE", CORAL, (270, 560), (-118, -382), -6),
                ("lick", "NOSE LICK", CORAL, (280, 1190), (-212, -350), 4),
                ("turn", "HEAD TURN", CORAL, (830, 820), (-20, -330), -5)]
    CARD_TITLE = [[("4 SIGNS HE", "w")], [("WANTS ", "w"), ("SPACE", "l")]]
    CARD_ITEMS = [("Yawning", "when he's not tired", {"yawn": 1.0}),
                  ("Nose lick", "a quick tongue flick", {"lick": 0.5}),
                  ("Whale eye", "the white of the eye shows", {"whale": 1.0, "ears": 0.6}),
                  ("Head turn", "looks away from you", {"turn": 1.0, "rot": 14})]
    FACT = "81% of dogs in hug photos showed stress signs."
    SOURCE = "Coren (2016), via AKC"

    def zoom_times(self):
        return (self.b0("not", -0.15), self.b0("let", -0.1))

    def cam(self, t):
        close = Cam(318, 800, 2.05, 560, 1010)
        c = cam_keys(t, [(0, WIDE, 0), (0.0, WIDE_B, self.T_ZIN), (self.T_ZIN, close, 0.28), (self.T_ZOUT, WIDE_END, 0.35)])
        if self.T_ZIN + 0.3 < t < self.T_ZOUT:
            c.z *= 1 + 0.04 * prog(t, self.T_ZIN + 0.3, self.T_ZOUT)
            c.fx += 10 * math.sin(t * 0.9)
        hug1 = 0.45
        c.fx += 6 * math.sin(math.pi * prog(t, hug1 - 0.1, hug1 + 0.2)) * math.sin(t * 70)
        return c

    def dog_state(self, t):
        let = self.b0("let", 0.3)
        relax = e_io(prog(t, let + 0.2, let + 0.8))
        k = lambda key, off=0.0: e_io(prog(t, self.b0(key, off), self.b0(key, off + 0.3)))
        y0 = self.b0("hook", 0.95)
        st = {"fx": 1, "wag": 1.0 - prog(t, 0.5, 0.9), "blink": 1 if (t % 3.3) < 0.08 else 0,
              "ears": max(0.25 * k("hook", 0.5), k("ears")) * (1 - relax), "whale": k("whale") * (1 - relax),
              "lick": prog(t, self.b0("lick", 0.05), self.b0("lick", 0.45)) if t < self.b0("lick", 0.5) else 0,
              "turn": k("turn") * (1 - relax),
              "yawn": math.sin(math.pi * prog(t, y0, y0 + 1.3)) ** 0.7 if y0 <= t < y0 + 1.3 else 0,
              "lines": k("ears") * (1 - relax), "sweat": k("whale") * (1 - relax)}
        st["rot"] = 12 * st["turn"] + 12 * st["yawn"]
        flip = self.b0("let", 1.1)
        st["ear_swing"] = flops(t, [(0.3, 16), (let + 0.3, 22), (flip + 0.2, 26)])
        st["squash"] = 1.2 * math.sin(math.pi * prog(t, 0.3, 0.7))
        kk = prog(t, flip - 0.1, flip + 0.45)
        st["hop"] = 70 * math.sin(math.pi * kk) if 0 < kk < 1 else 0
        if 0 < kk < 0.12 or 0.88 < kk < 1:
            st["squash"] = 1.4
        kf = e_io(prog(t, flip, flip + 0.25))
        fx = math.cos(math.pi * kf)
        st["fx"] = fx if abs(fx) > 0.05 else 0.05
        if t > flip + 0.1:
            st.update(wag=1.0, happy=1.0, lean=-12 * e_io(prog(t, flip + 0.5, flip + 0.9)))
        return st

    def stage(self, c, t):
        let = self.b0("let", 0.3)
        flip = self.b0("let", 1.1)
        hug = e_io(prog(t, 0.0, 0.45)) * (1 - e_io(prog(t, let, let + 0.45)))
        squeeze = 6 * math.sin(math.pi * prog(t, 0.3, 0.75)) * hug
        pet = e_io(prog(t, flip + 0.6, flip + 1.0))
        hx = self.HX + 110 * e_io(prog(t, let, let + 0.5))
        lean = 8 + 86 * hug + 12 * pet
        st = self.dog_state(t)
        face = "happy" if (hug > 0.3 or pet > 0.5) else "open"
        sh, shf = owner_body(c, hx, lean, face, t)
        knee = (hx - 84, -64)
        owner_arm(c, shf, lerp2((knee[0] + 30, knee[1] - 4), (self.DX - 26, -292 + squeeze), hug), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        dog(c, self.DX, 0, 1.0, st, t)
        if hug > 0.02:
            tgt = lerp2(knee, (self.DX - 86, -214 + squeeze), hug)
        else:
            tgt = lerp2(knee, (self.DX + 196, -284 + 8 * math.sin(t * 11) * pet), pet)
        owner_arm(c, sh, tgt, bend=-1)

    def world_fx(self, c, t):
        b = self.b0("dog2")
        hearts(c, t, [b - 0.2, b + 0.15, b + 0.5, b + 0.9], self.DX + 40)

    def sfx(self, m, pluck):
        self.rustle(m, 0.0, 0.5, 0.4)
        self.rustle(m, self.b0("let", 0.3), 0.45, 0.35)
        y0 = self.b0("hook", 0.95)
        n = int(1.2 * S.SR)
        tt = np.arange(n) / S.SR
        f0 = 170 - 70 * (tt / 1.2)
        saw = 2 * ((np.cumsum(f0) / S.SR) % 1) - 1
        voice = S.bp(saw, 400, 1600) * 0.6 + S.bp(S.rng.standard_normal(n), 300, 2500) * 0.25
        m.add(voice * np.sin(np.pi * tt / 1.2) ** 1.5, y0, 0.32, send=0.35)
        n = int(0.08 * S.SR)
        m.add(S.bp(S.rng.standard_normal(n), 2000, 6000) * np.exp(-np.arange(n) / (0.01 * S.SR)), self.b0("lick", 0.1), 0.5, send=0.15)
        self.boing(m, self.b0("let", 1.05), 0.25)
        b = self.b0("dog2")
        for th in (b - 0.2, b + 0.15, b + 0.5, b + 0.9):
            self.pop(m, th + 0.05, 700, 1500, 0.28)


# =============================================================================================== ports of 002–006
import episodes as V2


class WarpMix:
    def __init__(self, m, f):
        self.m, self.f = m, f

    def add(self, y, t, *a, **k):
        self.m.add(y, self.f(t), *a, **k)


class Port(Ep3):
    V2 = None

    def __init__(self):
        v = self.v2 = self.V2()
        self.NUM, self.SLUG = v.NUM, v.SLUG
        self.DX, self.HX, self.DOG_FACE, self.CLOSE_Z = v.DX, v.HX, v.DOG_FACE, v.CLOSE_Z
        self.TITLE = v.HOOK
        if not self.CARD_ITEMS:
            self.CARD_ITEMS = v.CARD_ITEMS
        self.CARD_TITLE, self.FACT, self.SOURCE = v.CARD_TITLE, v.FACT, v.SOURCE
        super().__init__()
        self.A = sorted(self.anchors() + [(0.0, 0.0), (self.T_CARD, v.T_CARD), (self.DUR + 5, v.T_CARD + 5 + (self.DUR - self.T_CARD))])

    def warp(self, t):
        A = self.A
        for (a0, b0), (a1, b1) in zip(A, A[1:]):
            if t <= a1:
                return b0 + (b1 - b0) * (t - a0) / max(1e-6, a1 - a0)
        return A[-1][1]

    def unwarp(self, u):
        A = self.A
        for (a0, b0), (a1, b1) in zip(A, A[1:]):
            if u <= b1:
                return a0 + (a1 - a0) * (u - b0) / max(1e-6, b1 - b0)
        return A[-1][0]

    def stage(self, c, t):
        self.v2.stage(c, self.warp(t))

    def world_bg(self, c, t):
        self.v2.world_bg(c, self.warp(t))

    def world_fx(self, c, t):
        self.v2.world_fx(c, self.warp(t))

    def screen_fx(self, c, t, cam):
        self.v2.screen_fx(c, self.warp(t), cam)

    def sfx(self, m, pluck):
        self.v2.sfx(WarpMix(m, self.unwarp), pluck)


CTA_LINES = [("cta", "n", "Comment translate, and I'll send you thirty more.", 0.25), ("sting", "n", "Your dog, translated.", 0.4)]


class Stare3(Port):
    V2 = V2.Stare
    HI = {"STARES", "SOFT", "RELAXED", "SLOWLY", "LOOSE", "DOUBLE", "LOVE", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog stares at you like this?", 0.25),
              ("food", "n", "No, he doesn't want your food.", 0.2),
              ("eyes", "n", "Look at his eyes. They're soft,", 0.05),
              ("ears", "n", "his ears are relaxed,", 0.05),
              ("blink", "n", "and he blinks slowly.", 0.05),
              ("mouth", "n", "Even his mouth is loose.", 0.3),
              ("dog1", "d", "I'm not hungry. I just love you.", 0.3),
              ("sci", "n", "Scientists found that when you look back, his love hormone can double.", 0.3),
              ("dog2", "d", "See? Now you feel it too.", 0.35),
              ("card", "n", "Soft eyes mean love. Watching your every move? He wants a walk or food. A hard stare with a stiff body means: give him space.", 0.3)] + CTA_LINES
    STICKERS = [("eyes", "SOFT EYES", MINT, (770, 610), (-118, -382), 4),
                ("ears", "RELAXED EARS", MINT, (290, 650), (-30, -360), -5),
                ("blink", "SLOW BLINK", MINT, (800, 760), (-112, -372), -4),
                ("mouth", "LOOSE MOUTH", MINT, (800, 1270), (-160, -296), 3)]
    CARD_ITEMS = [("I love you", "soft eyes, loose face", {"soft": 1}),
                  ("What's next?", "waiting for a walk or food", {"perk": 1}),
                  ("Back off", "hard stare + stiff body", {"hard": 1})]

    def zoom_times(self):
        return (self.b0("eyes", -0.25), self.b0("sci"))

    def anchors(self):
        return [(self.b0("eyes", -0.25), 1.0), (self.b0("eyes"), 1.25), (self.b0("ears"), 1.85), (self.b0("blink"), 2.45),
                (self.b0("mouth"), 3.05), (self.b0("dog1"), 4.3), (self.b0("sci"), 6.4), (self.b0("sci", 1.6), 6.7), (self.b0("dog2"), 7.5)]


class Guilty3(Port):
    V2 = V2.Guilty
    HI = {"GUILTY", "EARS", "AWAY", "LICK", "LOW", "FEAR", "CALM", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog looks guilty?", 0.2),
              ("not", "n", "He's not. Watch.", 0.15),
              ("ears", "n", "Ears pinned back,", 0.05),
              ("away", "n", "eyes looking away,", 0.05),
              ("lick", "n", "a quick lip lick,", 0.05),
              ("low", "n", "head down low. That's fear, not guilt.", 0.3),
              ("dog1", "d", "I'm not guilty. I just see you're mad.", 0.3),
              ("sci", "n", "In one study, dogs looked the most guilty when they were scolded for something they didn't even do.", 0.25),
              ("calm", "n", "So skip the scolding. Use a calm voice.", 0.3),
              ("dog2", "d", "Calm voice? Okay, we're good!", 0.35),
              ("card", "n", "Ears back, looking away, lip licking, head low. That look is fear.", 0.3)] + CTA_LINES
    STICKERS = [("ears", "EARS BACK", CORAL, (300, 640), (-40, -420), -5),
                ("away", "LOOKS AWAY", CORAL, (780, 620), (-112, -382), 4),
                ("lick", "LIP LICK", CORAL, (830, 1270), (-200, -320), 4),
                ("low", "HEAD LOW", CORAL, (270, 1270), (-62, -280), -4)]

    def zoom_times(self):
        return (self.b0("ears", -0.25), self.b0("sci"))

    def anchors(self):
        return [(self.b0("ears", -0.25), 1.0), (self.b0("ears"), 1.25), (self.b0("away"), 1.85), (self.b0("lick"), 2.45),
                (self.b0("low"), 3.05), (self.b0("dog1"), 4.3), (self.b0("sci"), 6.4), (self.b0("calm"), 6.6), (self.b0("dog2", -0.2), 7.5)]


class Tilt3(Port):
    V2 = V2.Tilt
    HI = {"TILT", "WORD", "EARS", "EYES", "BRAIN", "WALK", "TRANSLATE"}
    SCRIPT = [("owner", "o", "Wanna go for a... walk?", 0.15),
              ("hook", "n", "Why does your dog tilt his head like that?", 0.2),
              ("word", "n", "He heard a word he knows.", 0.1),
              ("ears", "n", "His ears go up,", 0.05),
              ("eyes", "n", "his eyes lock on you,", 0.05),
              ("focus", "n", "and his brain is working hard.", 0.3),
              ("dog1", "d", "Wait. Did you say walk?!", 0.3),
              ("sci", "n", "In one study, dogs that knew lots of toy names tilted their heads almost every time they heard one.", 0.3),
              ("dog2", "d", "I know that word!", 0.35),
              ("card", "n", "He tilts when he hears a word he knows, when he's focusing, or when a sound means something.", 0.3)] + CTA_LINES
    STICKERS = [("word", "HEAD TILT", LIME, (200, 780), (-90, -420), -5),
                ("ears", "EARS UP", LIME, (230, 1270), (-30, -360), 4),
                ("eyes", "EYES ON YOU", LIME, (820, 1270), (-118, -382), -3)]

    def zoom_times(self):
        return (self.b0("hook", 0.1), self.b0("sci"))

    def anchors(self):
        return [(self.b0("owner"), 0.15), (self.b1("owner", -0.45), 1.3), (self.b0("hook", 0.65), 1.55),
                (self.b0("word"), 1.7), (self.b0("ears"), 2.15), (self.b0("eyes"), 2.75), (self.b0("focus"), 3.4),
                (self.b0("dog1"), 4.3), (self.b0("sci"), 6.4), (self.b0("sci", 0.2), 6.6), (self.b0("dog2"), 7.5)]


def _tilt_init(self):
    Port.__init__(self)
    self.v2.T_ZIN = self.warp(self.T_ZIN)


Tilt3.__init__ = _tilt_init


class Paw3(Port):
    V2 = V2.Paw
    HI = {"SAD", "PAW", "WATCHING", "SOFT", "WORRIED", "LOVE", "TRANSLATE"}
    SCRIPT = [("hook", "n", "You're sad, and your dog puts his paw on you?", 0.25),
              ("eyes", "n", "He's been watching you.", 0.05),
              ("ears", "n", "Soft ears,", 0.05),
              ("brow", "n", "a worried little brow.", 0.2),
              ("paw", "n", "Then, the paw.", 0.3),
              ("dog1", "d", "I'm here. You're not alone.", 0.3),
              ("mean", "n", "The American Kennel Club says a paw on you can mean: I love you.", 0.3),
              ("dog2", "d", "There you are. I love you.", 0.35),
              ("card", "n", "A paw can also mean: notice me, I'm hungry, or let me out.", 0.3)] + CTA_LINES

    def __init__(self):
        super().__init__()
        self.STICKERS = [("eyes", "EYES ON YOU", MINT, (780, 620), (-118, -382), 4),
                         ("ears", "SOFT EARS", MINT, (280, 650), (-30, -360), -5),
                         ("brow", "WORRIED BROW", MINT, (800, 1270), (-118, -428), 3),
                         (self.b0("paw", 0.65), "PAW ON YOU", MINT, (330, 1210), (-258, -100), -3)]

    def zoom_times(self):
        return (self.b0("eyes", -0.25), self.b0("paw"))

    def anchors(self):
        return [(self.b0("eyes", -0.25), 1.0), (self.b0("eyes"), 1.25), (self.b0("ears"), 1.85), (self.b0("brow"), 2.45),
                (self.b0("paw"), 3.6), (self.b0("paw", 0.35), 3.95), (self.b0("dog1"), 4.6), (self.b0("mean"), 6.6), (self.b0("dog2"), 7.5)]


class Sneeze3(Port):
    V2 = V2.Sneeze
    HI = {"SNEEZES", "GRIN", "BOUNCY", "SIGNAL", "PLAYING", "GAME", "TRANSLATE"}
    SCRIPT = [("hook", "n", "Your dog sneezes when you play?", 0.2),
              ("grin", "n", "Look at that big goofy grin,", 0.05),
              ("bouncy", "n", "the bouncy body...", 1.0),
              ("signal", "n", "That sneeze is a signal.", 0.05),
              ("dog1", "d", "Relax, it's just a game!", 0.3),
              ("akc", "n", "The American Kennel Club says sneezing is how dogs show they're playing.", 0.3),
              ("dog2", "d", "Again! Again!", 0.35),
              ("card", "n", "Play sneezes, goofy grins, bouncy moves. He's just playing.", 0.3)] + CTA_LINES
    STICKERS = [("grin", "BIG GRIN", MINT, (790, 640), (-160, -300), 4),
                ("bouncy", "BOUNCY", MINT, (270, 660), (-40, -420), -5),
                ("signal", "PLAY SNEEZE", MINT, (290, 1270), (-212, -366), -3)]

    def zoom_times(self):
        return (self.b0("grin", -0.25), self.b0("akc"))

    def anchors(self):
        return [(self.b0("grin", -0.25), 1.0), (self.b0("grin"), 1.25), (self.b0("bouncy"), 1.85), (self.b1("bouncy", 0.2), 2.3),
                (self.b1("bouncy", 0.65), 2.75), (self.b0("signal"), 3.15), (self.b0("dog1"), 4.3), (self.b0("akc"), 6.4),
                (self.b0("akc", 0.2), 6.6), (self.b0("dog2"), 7.5)]


EPISODES = {1: Yawn3, 2: Stare3, 3: Guilty3, 4: Tilt3, 5: Paw3, 6: Sneeze3}


if __name__ == "__main__":
    ep = EPISODES[int(sys.argv[1])]()
    sys.argv = sys.argv[1:]
    main3(ep)
