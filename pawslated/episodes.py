"""PAWSLATED episodes 002–006.   python3 episodes.py <num> stills 0.5 2 ...  |  python3 episodes.py <num> render"""
import math
import sys

import skia

from engine import *
from paw import prog, e_io, e_out, e_back, lerp, lerp2, clamp, fill, stroke, LIME, CORAL, MINT, INK
from toon import *


def hops(t, times, h=60, d=0.42):
    v = 0
    for t0 in times:
        k = prog(t, t0, t0 + d)
        if 0 < k < 1:
            v = max(v, h * math.sin(math.pi * k))
    return v


def ear_flops(t, events):
    s = 0
    for t0, amp in events:
        if t > t0:
            d = t - t0
            s += amp * math.exp(-d * 4.5) * math.sin(d * 18)
    return s


# =============================================================================================== 002 STARE
class Stare(Episode):
    NUM, SLUG = 2, "stare"
    DX, HX = -230, 190
    HOOK = [[("YOUR DOG ", "w"), ("STARES", "l")], [("AT YOU?", "w")]]
    HOOK_SIZE = 92
    METER = ("LOVE", "good")
    SIGNS = [(1.25, "SOFT EYES", MINT, (770, 610), (-118, -382), 4),
             (1.85, "RELAXED EARS", MINT, (290, 650), (-30, -360), -5),
             (2.45, "SLOW BLINK", MINT, (800, 760), (-112, -372), -4),
             (3.05, "LOOSE MOUTH", MINT, (800, 1300), (-160, -296), 3)]
    MSG1 = "\"I'm not hungry. I just love you.\""
    MSG2 = "\"See? Now you feel it too.\""
    CARD_TITLE = [[("WHEN HE ", "w"), ("STARES", "l")], [("IT MEANS...", "w")]]
    CARD_ITEMS = [("I love you", "soft eyes, loose face", {"soft": 1, "happy": 0}),
                  ("What's next?", "waiting for a cue: walk, food", {"perk": 1}),
                  ("Can I have some?", "eyes glued to your plate", {"lick": 0.5}),
                  ("Back off", "hard stare + stiff body = give space", {"hard": 1})]
    FACT = "Long eye contact at least doubled dogs' oxytocin, the love hormone."
    SOURCE = "Nagasawa et al., Science (2015)"
    T_LOOK = 6.7

    def meter_value(self, t):
        return 0.2 + 0.45 * e_io(prog(t, 1.2, 4.0)) + 0.35 * e_io(prog(t, self.T_LOOK + 0.3, self.T_LOOK + 1.2))

    def dog_state(self, t):
        bl = 2.5 <= t < 2.85
        st = {"fx": -1, "soft": e_io(prog(t, 1.1, 1.5)), "pdx": -4, "wag": 0.3 + 0.7 * prog(t, self.T_LOOK + 0.4, self.T_LOOK + 0.8),
              "blink": 1 if (bl or (t % 3.4) < 0.07) else 0, "grin": 0.35 * e_io(prog(t, 3.0, 3.3)) * (1 - prog(t, 4.0, 4.3)),
              "ear_swing": ear_flops(t, [(1.85, 10), (self.T_LOOK + 0.5, 14)]), "rot": -3 * e_io(prog(t, 1.85, 2.2))}
        if t > self.T_LOOK + 0.6:
            st.update(happy=1, rot=4, soft=0)
        return st

    def stage(self, c, t):
        look = e_io(prog(t, self.T_LOOK, self.T_LOOK + 0.4))
        x = self.HX
        face = "open" if look < 0.5 else ("look" if t < self.T_LOOK + 0.9 else "happy")
        nod = 16 * (1 - look)
        sh, shf = owner_body(c, x, 6, face, t, gaze=(lerp(-2, -5, look), lerp(8, 0, look)), nod=nod)
        ph = lerp2((x - 112, -214), (x - 70, -96), look)
        owner_arm(c, shf, (ph[0] + 16, ph[1] + 10), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        self.draw_dog(c, t)
        hand = owner_arm(c, sh, ph, bend=-1)
        phone(c, hand[0] - 16, hand[1] - 20, -20 + 70 * look, 1.0)

    def world_bg(self, c, t):
        k = prog(t, self.T_LOOK + 0.5, self.T_LOOK + 1.0) * (1 - prog(t, self.T_CARD - 0.4, self.T_CARD))
        if k > 0:
            gx, gy = stage_to_world(-20, -330)
            glow(c, gx, gy, 560, k)

    def world_fx(self, c, t):
        for i, th in enumerate((7.4, 7.7, 8.0, 8.3, 8.6, 8.9)):
            kk = prog(t, th, th + 1.4)
            if 0 < kk < 1:
                hx, hy = stage_to_world(-30 + 70 * math.sin(i * 2.3 + kk * 4), -430 - 240 * e_out(kk))
                heart(c, hx, hy, (1.2 if i % 2 else 0.9) * e_back(clamp(kk * 4), 2.0), 255 * (1 - prog(kk, 0.7, 1)))

    def sfx(self, m, pluck):
        for th in (7.4, 7.7, 8.0, 8.3, 8.6, 8.9):
            self.pop(m, th + 0.05, 700, 1500)
        self.rustle(m, self.T_LOOK, 0.4, 0.35)
        m.add(pluck(S.note(91), 1.2, 0.4), self.T_LOOK + 0.5, 0.35, send=0.5)


# =============================================================================================== 003 GUILTY
class Guilty(Episode):
    NUM, SLUG = 3, "guilty"
    DX, HX = -230, 200
    HOOK = [[("YOUR DOG LOOKS", "w")], [("GUILTY", "l"), ("?", "w")]]
    HOOK_SIZE = 96
    METER = ("STRESS", "bad")
    SIGNS = [(1.25, "EARS BACK", CORAL, (300, 640), (-40, -420), -5),
             (1.85, "LOOKS AWAY", CORAL, (780, 620), (-112, -382), 4),
             (2.45, "LIP LICK", CORAL, (840, 1290), (-200, -320), 4),
             (3.05, "HEAD LOW", CORAL, (260, 1300), (-62, -280), -4)]
    MSG1 = "\"I'm not guilty. I just see you're mad.\""
    MSG2 = "\"Calm voice? Okay... we're good.\""
    CARD_TITLE = [[("THAT LOOK", "w")], [("IS ", "w"), ("FEAR", "l")]]
    CARD_ITEMS = [("Ears back", "pinned flat to the head", {"ears": 1}),
                  ("Looking away", "eyes dodge yours", {"pdx": 10, "pdy": -4, "ears": 0.6}),
                  ("Lip lick", "a quick tongue flick", {"lick": 0.5, "ears": 0.5}),
                  ("Head low", "trying to look small", {"rot": -14, "ears": 0.8, "whale": 0.6})]
    FACT = "Dogs looked MOST guilty when scolded for something they didn't do."
    SOURCE = "Horowitz (2009), via Scientific American"
    T_CALM = 6.6

    def dog_x(self, t):
        return self.DX + 70 * e_io(prog(t, self.T_CALM + 0.9, self.T_CALM + 1.3))

    def dog_state(self, t):
        relax = e_io(prog(t, self.T_CALM + 0.2, self.T_CALM + 0.8))
        k = lambda a: e_io(prog(t, a, a + 0.3))
        st = {"fx": -1, "ears": (0.4 + 0.6 * k(1.25)) * (1 - relax), "pdx": (4 + 8 * k(1.85)) * (1 - relax), "pdy": -5 * (1 - relax),
              "whale": 0.5 * k(1.85) * (1 - relax), "lick": prog(t, 2.45, 2.85) if t < 2.9 else 0,
              "rot": (-6 - 10 * k(3.05)) * (1 - relax), "wag": 0.15, "lines": k(1.2) * (1 - relax), "sweat": k(2.0) * (1 - relax),
              "blink": 1 if (t % 3.3) < 0.07 else 0, "ear_swing": ear_flops(t, [(self.T_CALM + 0.4, 18), (self.T_CALM + 1.0, 14)]),
              "hop": hops(t, [self.T_CALM + 0.9], 50, 0.42)}
        if t > self.T_CALM + 0.7:
            st.update(happy=1, wag=1)
        return st

    def draw_dog(self, c, t, st=None):
        dog(c, self.dog_x(t), 0, 1.0, st or self.dog_state(t), t)

    def stage(self, c, t):
        calm = e_io(prog(t, self.T_CALM, self.T_CALM + 0.45))
        x = self.HX
        face = "angry" if calm < 0.5 else ("open" if t < self.T_CALM + 1.0 else "happy")
        shoe(c, 40, 40, 0.9, True, 6)
        fluff(c, 150, 36, 1.0, t)
        fluff(c, -60, 50, 0.8, t + 1)
        pet = e_io(prog(t, self.T_CALM + 1.4, self.T_CALM + 1.8))
        sh, shf = owner_body(c, x, 10, face, t, gaze=(-3, 4 * (1 - calm)))
        owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        self.draw_dog(c, t)
        shake = 6 * math.sin(t * 22) * (1 - calm)
        point = (x - 200, -120 + shake)
        rest = (x - 76, -92)
        dx = self.dog_x(t)
        chin = (dx + 196, -284 + 8 * math.sin(t * 11))     # chin scratch
        tgt = lerp2(lerp2(point, rest, calm), chin, pet)
        hand = owner_arm(c, sh, tgt, bend=-1)
        if calm < 0.6:   # pointing finger
            line(c, [hand, (hand[0] - 34, hand[1] + 14)], 14, SKIN)
            c.drawPath(skia.Path().moveTo(*hand).lineTo(hand[0] - 34, hand[1] + 14), stroke(INK, 3))

    def screen_fx(self, c, t, cam):
        # angry speech scribble from the owner in the wide shot
        k = prog(t, 0.2, 0.5) * (1 - prog(t, self.T_ZIN - 0.1, self.T_ZIN))
        if k > 0:
            ox, oy = cam.pt(*stage_to_world(self.HX - 60, -520))
            sticker(c, ox + 40, oy - 30, "WHO DID THIS?!", k, "#FFFFFF", 4, 40, tcol=INK)

    def sfx(self, m, pluck):
        self.boing(m, self.T_CALM + 0.85, 0.25)
        self.rustle(m, self.T_CALM, 0.4, 0.3)
        n = int(0.08 * S.SR)
        lick = S.bp(S.rng.standard_normal(n), 2000, 6000) * np.exp(-np.arange(n) / (0.01 * S.SR))
        m.add(lick, 2.5, 0.6, send=0.15)
        for i in range(3):
            m.add(pluck(S.note(55 - i), 0.5, 0.6), 0.25 + i * 0.18, 0.35, send=0.2)   # stern "who did this"


# =============================================================================================== 004 HEAD TILT
class Tilt(Episode):
    NUM, SLUG = 4, "tilt"
    DX, HX = -230, 190
    HOOK = [[("WHY DOES YOUR DOG", "w")], [("TILT", "l"), (" HIS HEAD?", "w")]]
    HOOK_SIZE = 84
    METER = ("FOCUS", "good")
    SIGNS = [(1.6, "HEAD TILT", LIME, (200, 780), (-90, -420), -5),
             (2.2, "EARS UP", LIME, (230, 1290), (-30, -360), 4),
             (2.8, "EYES ON YOU", LIME, (820, 1290), (-118, -382), -3)]
    MSG1 = "\"Wait... did you say WALK?!\""
    MSG2 = "\"I KNOW that word!!\""
    CARD_TITLE = [[("WHY HE ", "w"), ("TILTS", "l")]]
    CARD_ITEMS = [("He knows that word", "walk, treat, ball, park...", {"rot": 16, "perk": 1}),
                  ("He's focusing", "trying to get what you mean", {"soft": 1, "perk": 0.5}),
                  ("A sound means something", "the doorbell, the treat bag", {"perk": 1, "pdx": -6})]
    FACT = "Dogs that knew many toy names tilted almost every time they heard one."
    SOURCE = "Sommese et al., Animal Cognition (2021)"
    T_LEASH = 6.6

    def meter_value(self, t):
        return 0.2 + 0.7 * e_io(prog(t, 1.4, 3.2)) + 0.1 * prog(t, self.T_LEASH, self.T_LEASH + 0.6)

    def dog_state(self, t):
        tilt = e_io(prog(t, 1.55, 1.8)) * (1 - e_io(prog(t, self.T_LEASH, self.T_LEASH + 0.3)))
        tilt2 = e_io(prog(t, 3.4, 3.6)) * (1 - e_io(prog(t, self.T_LEASH, self.T_LEASH + 0.3)))   # tilts to the other side
        st = {"fx": -1, "rot": 18 * tilt - 30 * tilt2, "perk": e_io(prog(t, 2.15, 2.4)), "soft": e_io(prog(t, 2.75, 3.0)), "pdx": -4,
              "wag": 0.2, "blink": 1 if (t % 3.3) < 0.07 else 0,
              "ear_swing": ear_flops(t, [(1.6, 16), (3.4, 18), (self.T_LEASH + 0.3, 22), (self.T_LEASH + 0.9, 20)]),
              "hop": hops(t, [self.T_LEASH + 0.25, self.T_LEASH + 0.85, self.T_LEASH + 1.45, self.T_LEASH + 2.05], 70)}
        if t > self.T_LEASH + 0.2:
            st.update(happy=1, wag=1.4, grin=0.8, perk=0.6)
        return st

    def stage(self, c, t):
        lift = e_back(prog(t, self.T_LEASH, self.T_LEASH + 0.35), 1.6)
        x = self.HX
        talking = 0.2 < t < 1.6
        face = "talk" if talking else ("laugh" if t > self.T_LEASH + 0.3 else "look")
        sh, shf = owner_body(c, x, 8, face, t, gaze=(-4, 0), talk=1.0)
        owner_arm(c, shf, (x - 70, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        self.draw_dog(c, t)
        tgt = lerp2((x - 76, -92), (x - 40, -500 + 6 * math.sin(t * 8)), clamp(lift))
        hand = owner_arm(c, sh, tgt, bend=-1)
        if lift > 0.05:
            leash(c, hand, t)

    def screen_fx(self, c, t, cam):
        # owner's speech bubble
        k = prog(t, 0.15, 0.4) * (1 - prog(t, 3.3, 3.6))
        if k > 0:
            bx, by = (770, 620) if t < self.T_ZIN + 0.1 else (800, 560)
            msg = "Wanna go for a..." if t < 1.3 else "WALK?"
            s = e_back(clamp(k), 2.0)
            c.save()
            c.translate(bx, by)
            c.scale(s, s)
            f = ff(700, 50 if t < 1.3 else 78)
            w = f.measureText(msg) + 70
            tail = skia.Path().moveTo(20, 40).lineTo(70, 110).lineTo(70, 40).close()
            ink(c, [(rr(-w / 2, -60, w, 120, 60), "#FFFFFF"), (tail, "#FFFFFF")], ol=6)
            c.drawTextBlob(skia.TextBlob(msg, f), -w / 2 + 35, f.getSize() * 0.36, fill(CORAL if t >= 1.3 else INK))
            c.restore()
        # question marks over the head
        for i, (t0, qx, qy, r) in enumerate(((1.7, 440, 690, -12), (2.0, 570, 620, 10), (3.5, 760, 640, 14))):
            kk = prog(t, t0, t0 + 0.3) * (1 - prog(t, self.T_ZOUT - 0.2, self.T_ZOUT))
            if kk > 0:
                qmark(c, qx + 10 * math.sin(t * 3 + i), qy, kk, "?", 120 if i == 1 else 100, LIME, r)
        for i, t0 in enumerate((self.T_LEASH + 0.3, self.T_LEASH + 0.9)):
            kk = prog(t, t0, t0 + 0.3) * (1 - prog(t, self.T_CARD - 0.4, self.T_CARD))
            if kk > 0:
                qx, qy = cam.pt(*stage_to_world(self.DX + 60 + (i * 2 - 1) * 90, -560))
                qmark(c, qx, qy, kk, "!", 110, "#FFE14D", (i * 2 - 1) * 10)

    def sfx(self, m, pluck):
        for i in range(4):
            m.add(pluck(S.note(79 - 2 * i), 0.4, 0.4), 0.25 + 0.17 * i, 0.3, send=0.2)    # "wanna go for a..."
        m.add(pluck(S.note(86), 0.8, 0.4), 1.3, 0.45, send=0.4)
        for t0 in (1.7, 2.0, 3.5):
            m.add(pluck(S.note(81), 0.4, 0.3), t0, 0.3, pan=-0.3, send=0.3)
        for k in range(4):
            self.boing(m, self.T_LEASH + 0.2 + 0.6 * k, 0.22)
        n = int(0.4 * S.SR)
        jingle = S.hp(S.rng.standard_normal(n), 5000) * np.exp(-np.arange(n) / (0.08 * S.SR))
        m.add(jingle, self.T_LEASH, 0.25, send=0.4)


# =============================================================================================== 005 PAW
class Paw(Episode):
    NUM, SLUG = 5, "paw"
    DX, HX = -200, 240
    T_ZOUT = 3.6
    T_MSG1 = 4.6
    T_PAW = 3.95
    T_LOOK = 6.6
    HOOK = [[("YOU'RE SAD AND HE", "w")], [("PUTS HIS ", "w"), ("PAW", "l"), (" ON YOU?", "w")]]
    HOOK_SIZE = 76
    METER = ("LOVE", "good")
    SIGNS = [(1.25, "EYES ON YOU", MINT, (780, 620), (-118, -382), 4),
             (1.85, "SOFT EARS", MINT, (280, 650), (-30, -360), -5),
             (2.45, "WORRIED BROW", MINT, (800, 1290), (-118, -428), 3),
             (4.25, "PAW ON YOU", MINT, (330, 1210), (-258, -100), -3, "all")]
    MSG1 = "\"I'm here. You're not alone.\""
    MSG2 = "\"There you are. I love you.\""
    CARD_TITLE = [[("A ", "w"), ("PAW", "l"), (" ON YOU", "w")], [("CAN MEAN...", "w")]]
    CARD_ITEMS = [("I love you", "his version of a hug", {"happy": 1}),
                  ("Notice me", "he wants your attention", {"perk": 1}),
                  ("I'm hungry", "dinner time?", {"lick": 0.5}),
                  ("Let me out", "potty break, please", {"perk": 0.5, "pdx": 8})]
    FACT = "\"It can mean 'I love you.'\""
    SOURCE = "Dr. Mary Burch, American Kennel Club"

    def meter_value(self, t):
        return 0.15 + 0.35 * e_io(prog(t, 1.2, 3.0)) + 0.2 * prog(t, self.T_PAW, self.T_PAW + 0.5) + 0.3 * e_io(prog(t, self.T_LOOK + 0.4, self.T_LOOK + 1.2))

    def dog_state(self, t):
        st = {"fx": -1, "soft": e_io(prog(t, 1.2, 1.5)), "pdx": -3, "pdy": 4, "wag": 0.15, "blink": 1 if (t % 3.6) < 0.07 else 0,
              "ears": 0.25 * e_io(prog(t, 1.8, 2.1)), "turn": 0.45 * e_io(prog(t, 2.4, 2.7)) * (1 - prog(t, self.T_LOOK, self.T_LOOK + 0.5)),
              "paw": 1.0 * e_back(prog(t, self.T_PAW, self.T_PAW + 0.4), 1.4), "rot": -5,
              "ear_swing": ear_flops(t, [(self.T_PAW, 10), (self.T_LOOK + 0.6, 14)])}
        if t > self.T_LOOK + 0.6:
            st.update(happy=1, wag=1, rot=6, ears=0, turn=0)
        return st

    def stage(self, c, t):
        look = e_io(prog(t, self.T_LOOK, self.T_LOOK + 0.45))
        x = self.HX
        face = "sad" if look < 0.5 else ("look" if t < self.T_LOOK + 0.8 else "happy")
        sh, shf = owner_body(c, x, 4, face, t, gaze=(lerp(-1, -5, look), lerp(7, 2, look)), nod=20 * (1 - look), kr=72)
        owner_arm(c, shf, (x - 60, -98), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        self.draw_dog(c, t)
        pawtip = (self.DX + 258, -100)
        tgt = lerp2((x - 90, -96), (pawtip[0] + 8, pawtip[1] - 14), e_io(prog(t, self.T_LOOK + 0.5, self.T_LOOK + 1.0)))
        owner_arm(c, sh, tgt, bend=-1)

    def world_fx(self, c, t):
        for i, th in enumerate((7.5, 7.8, 8.1, 8.5, 8.9)):
            kk = prog(t, th, th + 1.4)
            if 0 < kk < 1:
                hx, hy = stage_to_world(-40 + 70 * math.sin(i * 2.3 + kk * 4), -440 - 240 * e_out(kk))
                heart(c, hx, hy, (1.2 if i % 2 else 0.9) * e_back(clamp(kk * 4), 2.0), 255 * (1 - prog(kk, 0.7, 1)))

    def world_bg(self, c, t):
        k = prog(t, self.T_LOOK + 0.6, self.T_LOOK + 1.1) * (1 - prog(t, self.T_CARD - 0.4, self.T_CARD))
        if k > 0:
            glow(c, *stage_to_world(-20, -320), 540, k)

    def sfx(self, m, pluck):
        m.add(pluck(S.note(64), 1.6, 0.5), 0.3, 0.3, send=0.6)          # sad low note
        self.rustle(m, self.T_PAW, 0.35, 0.4)
        m.add(pluck(S.note(88), 1.0, 0.4), self.T_PAW + 0.3, 0.4, send=0.5)
        for th in (7.5, 7.8, 8.1, 8.5, 8.9):
            self.pop(m, th + 0.05)


# =============================================================================================== 006 SNEEZE
class Sneeze(Episode):
    NUM, SLUG = 6, "sneeze"
    DX, HX = -220, 200
    HOOK = [[("YOUR DOG ", "w"), ("SNEEZES", "l")], [("WHEN YOU PLAY?", "w")]]
    HOOK_SIZE = 88
    METER = ("FUN", "good")
    T_SN = 2.75          # the sneeze
    T_TOSS = 6.6
    SIGNS = [(1.25, "BIG GRIN", MINT, (790, 640), (-160, -300), 4),
             (1.85, "BOUNCY", MINT, (270, 660), (-40, -420), -5),
             (3.15, "PLAY SNEEZE", MINT, (800, 1300), (-212, -366), -3)]
    MSG1 = "\"Relax. It's just a game!\""
    MSG2 = "\"Again! AGAIN!\""
    CARD_TITLE = [[("HE'S JUST", "w")], [("PLAYING", "l")]]
    CARD_ITEMS = [("Play sneeze", "\"don't worry, this is fun\"", {"squint": 1}),
                  ("Goofy grin", "mouth open, tongue out", {"grin": 1, "happy": 1}),
                  ("Bouncy moves", "hops, wiggles, zoomies", {"happy": 1, "perk": 0.6})]
    FACT = "\"Sneezing is a way of communicating playfulness.\""
    SOURCE = "American Kennel Club (AKC)"

    def meter_value(self, t):
        return 0.35 + 0.35 * e_io(prog(t, 1.0, 2.6)) + 0.3 * prog(t, self.T_SN, self.T_SN + 0.3)

    def dog_x(self, t):
        return self.DX - 120 * e_io(prog(t, self.T_TOSS + 0.6, self.T_TOSS + 1.6))

    def dog_state(self, t):
        wind = e_io(prog(t, self.T_SN - 0.45, self.T_SN))
        snap = prog(t, self.T_SN, self.T_SN + 0.12)
        rec = e_io(prog(t, self.T_SN + 0.25, self.T_SN + 0.7))
        st = {"fx": -1, "happy": 1, "grin": 1.0 * (1 - wind) + 1.0 * rec, "wag": 1.2, "perk": 0.5,
              "hop": hops(t, [0.2, 0.75, 1.3, 1.85, 4.5, 5.1], 34, 0.38)}
        if self.T_SN - 0.45 < t < self.T_SN + 0.6:
            st["squint"] = 1 if t < self.T_SN + 0.35 else 0
            st["rot"] = 14 * wind * (1 - snap) - 12 * snap * (1 - rec)
            st["happy"] = 0 if t < self.T_SN + 0.35 else 1
        st["ear_swing"] = ear_flops(t, [(self.T_SN, 26), (self.T_TOSS + 0.4, 20)] + [(h + 0.3, 8) for h in (0.2, 0.75, 1.3, 1.85)])
        kf = e_io(prog(t, self.T_TOSS + 0.35, self.T_TOSS + 0.6))
        fx = -math.cos(math.pi * kf)
        st["fx"] = fx if abs(fx) > 0.05 else 0.05
        if t > self.T_TOSS + 0.3:
            st["hop"] = hops(t, [self.T_TOSS + 0.4, self.T_TOSS + 1.0, self.T_TOSS + 1.6], 60, 0.45)
        return st

    def draw_dog(self, c, t, st=None):
        dog(c, self.dog_x(t), 0, 1.0, st or self.dog_state(t), t)

    def stage(self, c, t):
        x = self.HX
        toss = prog(t, self.T_TOSS, self.T_TOSS + 0.35)
        sh, shf = owner_body(c, x, 16, "laugh" if (t < 1.0 or t > self.T_SN + 0.2) else "look", t, gaze=(-4, 0))
        owner_arm(c, shf, (x - 66, -96), bend=-1, col=SHIRT_DK, skin=SKIN_DK)
        self.draw_dog(c, t)
        wig = 18 * math.sin(t * 9) * (1 - toss)
        held = (x - 190, -250 + wig)
        up = (x - 60, -470)
        tgt = lerp2(held, up, e_out(toss)) if t < self.T_TOSS + 0.35 else lerp2(up, (x - 76, -92), e_io(prog(t, self.T_TOSS + 0.4, self.T_TOSS + 0.8)))
        hand = owner_arm(c, sh, tgt, bend=-1)
        if t < self.T_TOSS + 0.2:
            rope_toy(c, hand, (hand[0] - 70, hand[1] + 90 + wig * 0.5), t)
        else:   # rope flies off to the left
            k = prog(t, self.T_TOSS + 0.2, self.T_TOSS + 1.2)
            if k < 1:
                rx = lerp(x - 60, -700, k)
                ry = -470 - 260 * math.sin(math.pi * k)
                c.save()
                c.translate(rx, ry)
                c.rotate(-720 * k)
                rope_toy(c, (-40, 0), (40, 0), t)
                c.restore()

    def world_fx(self, c, t):
        k = prog(t, self.T_SN, self.T_SN + 0.6)
        if 0 < k < 1:
            nx, ny = self.feat(-215, -362)
            for i in range(14):
                a = math.radians(-50 + 100 * ((i * 37) % 14) / 14)
                d = 40 + 300 * e_out(k) * (0.6 + 0.4 * ((i * 53) % 7) / 7)
                ink(c, [(oval(nx + d * math.cos(a), ny + d * math.sin(a) + 120 * k * k, 9, 9), SWEAT)], ol=3, a=255 * (1 - k))

    def screen_fx(self, c, t, cam):
        k = prog(t, self.T_SN, self.T_SN + 0.25) * (1 - prog(t, self.T_SN + 0.9, self.T_SN + 1.1))
        if k > 0:
            burst(c, 800, 1225, "ACHOO!", k, 92)
        kk = prog(t, self.T_TOSS + 0.6, self.T_TOSS + 0.9) * (1 - prog(t, self.T_CARD - 0.4, self.T_CARD))
        if kk > 0:
            qx, qy = cam.pt(*stage_to_world(self.dog_x(t), -600))
            qmark(c, qx, qy, kk, "!", 110, "#FFE14D", -8)

    def sfx(self, m, pluck):
        SR = S.SR
        # wind-up "ah... ah..." (rising formant) + "CHOO" noise burst
        n = int(0.45 * SR)
        tt = np.arange(n) / SR
        f0 = 260 + 160 * tt / 0.45
        saw = 2 * ((np.cumsum(f0) / SR) % 1) - 1
        m.add(S.bp(saw, 500, 2200) * np.sin(np.pi * tt / 0.45) * 0.35, self.T_SN - 0.45, 0.4, send=0.3)
        n = int(0.25 * SR)
        choo = S.bp(S.rng.standard_normal(n), 1500, 7000) * np.exp(-np.arange(n) / (0.06 * SR))
        m.add(choo, self.T_SN, 0.75, send=0.3)
        m.add(S.sub_hit(70, 0.3), self.T_SN, 0.3, send=0.1)
        for h in (0.2, 0.75, 1.3, 1.85, 4.5, 5.1):
            self.boing(m, h, 0.12)
        m.add(S.whoosh(0.6, 600, 2400), self.T_TOSS + 0.2, 0.35, send=0.3)
        for k in range(3):
            self.boing(m, self.T_TOSS + 0.35 + 0.6 * k, 0.2)


EPISODES = {2: Stare, 3: Guilty, 4: Tilt, 5: Paw, 6: Sneeze}

if __name__ == "__main__":
    ep = EPISODES[int(sys.argv[1])]()
    sys.argv = sys.argv[1:]
    main(ep)
