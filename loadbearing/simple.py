"""LOADBEARING — "clean" series: ~10 s, one idea, simple words. Episodes 006–015.

python3 simple.py stills EP t1 t2 ...    -> check frames
python3 simple.py render EP              -> out/LBxxx_slug.mp4 (+ wav)
"""
import math
import random
import sys

import skia
import brand as B
from brand import *
import sound as S

GY = 1240
LF, RF = 190, 640            # figure roots
LW, RW = 262, 722            # wall left edges


# ======================================================================
# shared base
# ======================================================================
class Clean:
    EP = 0
    SLUG = "x"
    TITLE = ""
    LBL = ("", "")
    VERDICT = ("", "")
    DUR = 9.8
    T_TEXT = 6.4
    T_STING = 8.35

    def __init__(self):
        self.rnd = random.Random(self.EP)
        self.setup()

    def setup(self):
        pass

    # ---- walls -------------------------------------------------------
    def make_wall(self, x0, times, cols=2, sloppy=0.0):
        items = []
        for i, tl in enumerate(times):
            r, k = divmod(i, cols)
            off = (BW / 2 if (r % 2 and cols == 1) else 0)
            x = x0 + k * BW + off + self.rnd.uniform(-1, 1) * 6 * sloppy
            items.append(dict(x=x + BW / 2, y=GY - BH / 2 - r * BH, rot=self.rnd.uniform(-1, 1) * 4 * sloppy,
                              t0=tl - 0.34, land=tl, row=r))
        return items

    def draw_wall(self, c, items, t, fx, face=1, hidden=lambda it, t: False, override=None):
        for it in items:
            if t < it["t0"] or hidden(it, t):
                continue
            if override:
                st = override(it, t)
                if st:
                    block(c, *st)
                    continue
            if t < it["land"]:
                k = prog(t, it["t0"], it["land"])
                p0 = (fx + 46 * face, GY - 236)
                p2 = (it["x"], it["y"])
                p1 = ((p0[0] + p2[0]) / 2, min(p0[1], p2[1]) - 130)
                pos = bez(p0, p1, p2, e_out(k) * .3 + k * .7)
                block(c, pos[0], pos[1], rot=lerp(-30 * face, it["rot"], e_out(k)))
            else:
                sq = math.sin(math.pi * prog(t, it["land"], it["land"] + 0.12))
                block(c, it["x"], it["y"] + 3 * sq, it["rot"], sx=1 + .05 * sq, sy=1 - .1 * sq)

    def toss_pose(self, items, t, fx, face=1, rest=None):
        for it in items:
            if it["t0"] - 0.14 <= t < it["t0"] + 0.04:
                ph = prog(t, it["t0"] - 0.14, it["t0"] + 0.04)
                key, other = ("R", "L") if face > 0 else ("L", "R")
                return {key: lerp2((fx + 40 * face, GY - 130), (fx + 46 * face, GY - 236), e_out(ph)),
                        other: (fx - 10 * face, GY - 176), "lean": 6 * face}
        return rest or {"L": (fx - 26, GY - 140), "R": (fx + 26, GY - 140)}

    def count(self, items, t):
        return sum(1 for it in items if t >= it["land"])

    # ---- hooks for episodes -------------------------------------------
    def scene(self, c, t):
        pass

    def subs(self, t):
        return ("", ""), (GRAPH, GRAPH)

    def hud_extra(self, c, t, k):
        pass

    def sfx(self, m):
        pass

    # ---- frame -------------------------------------------------------
    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        B.sky(c)
        z = 1.3 * (1 + 0.03 * e_sine(prog(t, 0, self.T_TEXT)))
        sx, sy = self.shake(t)
        c.save()
        c.translate(W / 2 + sx, GY - 120 + sy)
        c.scale(z, z)
        c.translate(-W / 2, -(GY - 120))
        B.lamp(c, 320, 600, 700, GY, 0.55)
        B.lamp(c, 788, 600, 700, GY, 1.0, warm=True)
        B.earth(c, GY)
        self.under(c, t)
        B.ground_line(c, GY)
        self.scene(c, t)
        k = e_out(prog(t, 0.0, 0.5)) * (1 - prog(t, self.T_TEXT - .3, self.T_TEXT))
        (sl, sr), (cl, cr) = self.subs(t)
        B.lane_label(c, 320, 800, self.LBL[0], sl, cl, 255 * k)
        B.lane_label(c, 788, 800, self.LBL[1], sr, cr, 255 * k, hero=True)
        c.restore()
        kh = 1 - prog(t, self.T_TEXT - 0.3, self.T_TEXT)
        B.title(c, self.TITLE, 300, 255 * kh, size=82)
        self.hud_extra(c, t, kh)
        if t >= self.T_TEXT:
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 175 * e_io(prog(t, self.T_TEXT, self.T_TEXT + .4))))
            B.verdict(c, t, self.T_TEXT + 0.05, self.VERDICT[0], self.VERDICT[1], 420, self.T_STING)
        B.sting(c, t, self.T_STING)
        return B.finish(surf, self.EP, t, self.T_STING, self.DUR)

    def under(self, c, t):
        pass

    def shake(self, t):
        return 0, 0

    def sound(self, path):
        m = S.Mix(self.DUR)
        self.sfx(m)
        S.brand_bed(m, self.DUR, self.T_TEXT)
        S.sonic_logo(m, self.T_STING + B.STING_HIT)
        m.render(path)

    def knocks(self, m, items, pan, pitch=1.0, weight=1.0, gain=0.55):
        for i, it in enumerate(items):
            m.add(S.whoosh(0.16, 600, 1700), it["t0"], 0.14, pan=pan, send=0.1)
            m.add(S.block_knock(pitch * (0.9 + 0.2 * (i % 7) / 6) + S.rng.uniform(-.03, .03), weight), it["land"], gain, pan=pan, send=0.22)


def steady(t0, t1, n):
    return [t0 + (t1 - t0) * i / max(1, n - 1) for i in range(n)]


def bubble(c, x, y, word, k=1.0, col=CHALK):
    """Speech bubble with one word."""
    if k <= 0:
        return
    f = font("monob", 22)
    w = f.measureText(word) + 34
    c.save()
    c.translate(x, y)
    s = e_back(clamp(k), 1.6)
    c.scale(s, s)
    c.drawRRect(rrect(-w / 2, -24, w, 44, 14), fill("#1C1C22", 235))
    c.drawRRect(rrect(-w / 2, -24, w, 44, 14), stroke(col, 2, 200))
    c.drawPath(skia.Path().moveTo(-10, 20).lineTo(-22, 36).lineTo(4, 20).close(), fill("#1C1C22", 235))
    text(c, word, 0, 6, f, col, 255, "c", tracking=1)
    c.restore()


def phone(c, hand, t):
    c.drawRRect(rrect(hand[0] - 9, hand[1] - 26, 18, 30, 4), fill("#1A1C24"))
    c.drawRRect(rrect(hand[0] - 7, hand[1] - 24, 14, 24, 3), fill("#9FC2FF", 230))
    g = fill("#9FC2FF", 60)
    g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 22))
    c.drawCircle(hand[0], hand[1] - 30, 46, g)


SIT_PHONE = lambda fx, k=1.0: {"sit": k, "L": (fx + 44, GY - 150 + 50 * k), "R": (fx + 58, GY - 152 + 50 * k),
                               "hy": 12 * k, "eyes_dy": 6 * k, "lean": 10 * k, "hx": 6 * k}
HIPS = lambda fx: {"L": (fx - 34, GY - 128), "R": (fx + 34, GY - 128), "hy": -4}


# ======================================================================
# 006 — ACTION FIRST
# ======================================================================
class E006(Clean):
    EP, SLUG = 6, "action-first"
    TITLE = "MOTIVATION COMES AFTER."
    LBL = ("WAITING", "STARTED")
    VERDICT = ("Don't wait to feel ready.", "Start. It comes after.")

    def setup(self):
        self.R = self.make_wall(RW, steady(0.9, 5.6, 12))

    def mot(self, side, t):
        if side == "L":
            return 0.12 + 0.05 * math.sin(t * 2.3)
        return clamp(self.count(self.R, t) / 12) * 0.95 + 0.03

    def scene(self, c, t):
        lp = SIT_PHONE(LF, e_io(prog(t, 0.1, 0.6)))
        info = B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 3.1)}, hero=False)
        if t > 0.4:
            phone(c, info["hands"]["R"], t)
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.8 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)
        for side, x in (("L", 320), ("R", 788)):
            m = self.mot(side, t)
            B.meter(c, x - 120, 880, 240, m, "MOTIVATION", f"{int(m * 100):3d}%", MOLTEN if side == "R" else GRAPH)

    def subs(self, t):
        return ("0 BLOCKS", f"{self.count(self.R, t)} BLOCKS"), (GRAPH, MOLTEN if t > 5.6 else GRAPH)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)


# ======================================================================
# 007 — STOP STARTING OVER
# ======================================================================
class E007(Clean):
    EP, SLUG = 7, "stop-starting-over"
    TITLE = "STOP STARTING OVER."
    LBL = ("RESTART", "KEEP GOING")
    VERDICT = ("Day 1 again?", "Keep going.")

    def setup(self):
        self.cycles = [(0.8, 2.2), (2.6, 4.0), (4.4, 5.8)]      # build, then kick
        self.L = []
        for a, b in self.cycles:
            items = self.make_wall(LW, steady(a, a + 0.9, 4), sloppy=0.6)
            for it in items:
                it["kick"] = b
                it["vx"] = self.rnd.uniform(-300, -80)
                it["vy"] = -self.rnd.uniform(200, 500)
                it["w"] = self.rnd.uniform(-500, 500)
            self.L += items
        self.R = self.make_wall(RW, steady(0.8, 5.8, 14))

    def kicked(self, it, t):
        dt = t - it["kick"]
        if dt < 0:
            return None
        if dt > 0.7:
            return "gone"
        x = it["x"] + it["vx"] * dt
        y = it["y"] + it["vy"] * dt + 0.5 * 2600 * dt * dt
        return (x, min(y, GY - BH / 2), it["w"] * dt, 255 * (1 - prog(dt, 0.45, 0.7)))

    def scene(self, c, t):
        def ov(it, t):
            k = self.kicked(it, t)
            if k is None:
                return None
            if k == "gone":
                return (0, 0, 0, 0)
            return k
        self.draw_wall(c, self.L, t, LF, override=ov)
        lp = self.toss_pose(self.L, t, LF)
        for a, b in self.cycles:
            if b - 0.25 <= t < b + 0.3:            # frustrated swipe
                k = math.sin(math.pi * prog(t, b - 0.25, b + 0.3))
                lp = {"R": (LF + 60 + 40 * k, GY - 170), "L": (LF - 30, GY - 150), "lean": 14 * k, "sad": True}
        B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 3.3)}, hero=False)
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 6.0 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.9)}, hero=True)

    def subs(self, t):
        n = sum(1 for a, b in self.cycles if t >= a)
        day = f"DAY 1  ·  TRY {max(1, n)}"
        return (day, f"DAY {1 + int(89 * prog(t, 0.8, 5.8))}"), (MOLTEN if n > 1 else GRAPH, GRAPH)

    def sfx(self, m):
        self.knocks(m, self.L, -0.4, 1.1, 0.8, 0.45)
        self.knocks(m, self.R, 0.4)
        for a, b in self.cycles:
            m.add(S.crunch() * 0.6, b, 0.5, pan=-0.45, send=0.3)


# ======================================================================
# 008 — SAME 6 HOURS
# ======================================================================
class E008(Clean):
    EP, SLUG = 8, "same-6-hours"
    TITLE = "SAME 6 HOURS."
    LBL = ("SCROLLING", "BUILDING")
    VERDICT = ("Same time.", "Different life.")

    def setup(self):
        self.R = self.make_wall(RW, steady(0.8, 5.7, 14))

    def scene(self, c, t):
        lp = SIT_PHONE(LF, e_io(prog(t, 0.1, 0.6)))
        info = B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 2.9)}, hero=False)
        if t > 0.4:
            phone(c, info["hands"]["R"], t)
            # scrolling: little cards flicking up off the phone
            h = info["hands"]["R"]
            for i in range(3):
                ph = (t * 2.2 + i / 3) % 1
                c.drawRRect(rrect(h[0] - 10, h[1] - 40 - 80 * ph, 20, 14, 3), fill("#9FC2FF", 160 * (1 - ph)))
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.9 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        return ("0 BLOCKS", f"{self.count(self.R, t)} BLOCKS"), (GRAPH, MOLTEN if t > 5.7 else GRAPH)

    def hud_extra(self, c, t, k):
        mins = int(360 * prog(t, 0.5, 5.8))
        text(c, f"{mins // 60:02d}:{mins % 60:02d} h", W / 2, 372, font("mono", 30), GRAPH, 255 * k, "c", tracking=6)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)
        tt = 0.6
        while tt < 6.0:
            m.add(S.whoosh(0.08, 2500, 4000), tt, 0.12, pan=-0.45, send=0.05)   # thumb flicks
            tt += 0.45


# ======================================================================
# 009 — GO SMALL
# ======================================================================
class E009(Clean):
    EP, SLUG = 9, "go-small"
    TITLE = "GO SMALL."
    LBL = ("TOO BIG", "SMALL STEPS")
    VERDICT = ("Big goals.", "Small steps.")
    GX = 290           # giant block centre

    def setup(self):
        self.R = self.make_wall(RW, steady(0.8, 5.7, 14))
        self.tries = [0.8, 2.4, 4.0]

    def scene(self, c, t):
        # the giant block on the left never moves (it rocks a bit when pushed)
        rock = 0
        for a in self.tries:
            rock += 1.4 * math.sin(math.pi * prog(t, a + 0.3, a + 1.1))
        c.save()
        c.translate(self.GX + 40, GY)
        c.rotate(-rock)
        block(c, 0, -110, w=200, h=220)
        c.restore()
        text(c, "THE WHOLE GOAL", self.GX + 40, GY - 240, font("mono", 18), GRAPH, 200, "c", tracking=3)
        lp = {"L": (LF - 26, GY - 140), "R": (LF + 26, GY - 140)}
        for a in self.tries:
            if a <= t < a + 1.3:
                k = math.sin(math.pi * prog(t, a, a + 1.3))
                lp = {"L": (LF + 60 + 20 * k, GY - 150), "R": (LF + 64 + 20 * k, GY - 110), "lean": 30 * k, "crouch": 0.35 * k,
                      "spread": 34, "hy": 6, "eyes_dy": 3}
        if t >= 5.4:
            lp = {**SIT_PHONE(LF, e_io(prog(t, 5.4, 5.9))), "sad": True}
            lp["L"], lp["R"] = (LF + 30, GY - 96), (LF + 60, GY - 92)
        B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 3.1)}, hero=False)
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.9 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        n = sum(1 for a in self.tries if t >= a + 1.1)
        return (f"TRY {max(1, n)}  ·  MOVED 0", f"{self.count(self.R, t)} BLOCKS"), (GRAPH, MOLTEN if t > 5.7 else GRAPH)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)
        for a in self.tries:
            m.add(S.strain(1.0), a + 0.1, 0.5, pan=-0.45, send=0.3)
            m.add(S.block_knock(0.5, 1.6), a + 0.7, 0.4, pan=-0.45, send=0.3)


# ======================================================================
# 010 — EXCUSES DON'T BUILD
# ======================================================================
class E010(Clean):
    EP, SLUG = 10, "excuses"
    TITLE = "EXCUSES DON'T BUILD."
    LBL = ("EXCUSES", "BLOCKS")
    VERDICT = ("Excuses don't build walls.", "Blocks do.")
    WORDS = ["TIRED", "BUSY", "MONDAY", "LATER", "RAIN", "NO TIME", "TOMORROW"]

    def setup(self):
        self.R = self.make_wall(RW, steady(0.8, 5.7, 14))
        self.bt = steady(0.9, 5.4, len(self.WORDS))
        self.bpos = [(LW + 40 + (i % 2) * 70 + self.rnd.uniform(-10, 10), GY - 60 - i * 62) for i in range(len(self.WORDS))]

    def scene(self, c, t):
        lp = {"L": (LF - 26, GY - 140), "R": (LF + 26, GY - 140)}
        for i, tb in enumerate(self.bt):
            if tb - 0.2 <= t < tb + 0.25:
                k = math.sin(math.pi * prog(t, tb - 0.2, tb + 0.25))
                lp = {"L": (LF - 40 - 20 * k, GY - 170 - 30 * k), "R": (LF + 44 + 20 * k, GY - 170 - 30 * k), "hy": -5 * k}
        B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 3.0)}, hero=False)
        for i, (w, tb) in enumerate(zip(self.WORDS, self.bt)):
            k = prog(t, tb, tb + 0.3)
            if k > 0:
                x, y = self.bpos[i]
                y += 4 * math.sin(t * 2 + i)
                bubble(c, x + 40, y, w, k, GRAPH)
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.9 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        n = sum(1 for tb in self.bt if t >= tb)
        return (f"{n} EXCUSES", f"{self.count(self.R, t)} BLOCKS"), (GRAPH, MOLTEN if t > 5.7 else GRAPH)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)
        for tb in self.bt:
            m.add(S.piano(S.note(52), 0.6) * 0.5, tb, 0.35, pan=-0.45, send=0.4)   # a dull "boop" per excuse


# ======================================================================
# 011 — NO ONE JUMPS TO THE TOP
# ======================================================================
class E011(Clean):
    EP, SLUG = 11, "no-one-jumps"
    TITLE = "NO ONE JUMPS TO THE TOP."
    LBL = ("JUMPING", "STEPS")
    VERDICT = ("No one jumps to the top.", "Build the steps.")
    LEDGE_H = 4 * BH + 8
    SX = 590           # stairs start
    FX = 548           # orange figure root

    def setup(self):
        # stairs: 4 rising columns of blocks next to the ledge (built left→right)
        self.steps = []
        times = steady(0.8, 4.4, 10)
        i = 0
        for col in range(4):
            for r in range(col + 1):
                if i < len(times):
                    self.steps.append(dict(x=self.SX + col * BW + BW / 2, y=GY - BH / 2 - r * BH, rot=0, t0=times[i] - 0.34, land=times[i], row=r))
                    i += 1
        self.jumps = [0.8, 2.2, 3.6]
        self.T_CLIMB0, self.T_CLIMB1 = 4.7, 5.9

    def ledge(self, c, x0, x1):
        top = GY - self.LEDGE_H
        c.drawRect(skia.Rect.MakeLTRB(x0, top, x1, GY), fill("#24232A"))
        c.drawLine(x0, top, x1, top, stroke(CHALK, 3, 220))
        text(c, "TOP", (x0 + x1) / 2, top + 34, font("mono", 18), GRAPH, 200, "c", tracking=4)
        return top

    def scene(self, c, t):
        top = self.ledge(c, LW + 110, LW + 250)
        self.ledge(c, self.SX + 4 * BW, self.SX + 4 * BW + 92)
        # grey: jump, slam into the wall, fall back, finally sits
        x, y, pose = LF + 40, GY, {"L": (LF + 14, GY - 140), "R": (LF + 66, GY - 140)}
        for a in self.jumps:
            if a <= t < a + 1.2:
                ph = (t - a) / 1.2
                if ph < 0.25:   # crouch
                    pose = {"crouch": 0.6 * ph / 0.25, "L": (x - 30, GY - 120), "R": (x + 20, GY - 120)}
                elif ph < 0.75:
                    k = (ph - 0.25) / 0.5
                    y = GY - 170 * math.sin(math.pi * k)
                    pose = {"L": (x + 10, y - 290), "R": (x + 40, y - 290), "Lb": -1, "Rb": 1, "eyes_dy": -5}
                else:
                    pose = {"crouch": 0.5 * (1 - prog(ph, 0.75, 1)), "L": (x - 30, GY - 130), "R": (x + 20, GY - 130), "sad": True}
        if t >= 4.9:
            pose = {**SIT_PHONE(x, e_io(prog(t, 4.9, 5.4))), "sad": True}
            pose["L"], pose["R"] = (x + 30, GY - 96), (x + 60, GY - 92)
        B.figure(c, x, y, {**pose, "blink": B.blink_at(t, 3.0)}, hero=False)
        # orange: builds the stairs, then climbs them to the top
        self.draw_wall(c, self.steps, t, self.FX)
        if t < self.T_CLIMB0:
            rp = self.toss_pose(self.steps, t, self.FX)
            B.figure(c, self.FX, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)
        else:
            k = prog(t, self.T_CLIMB0, self.T_CLIMB1)
            n = k * 5
            i = min(4, int(n))
            f = n - i
            def pos(j):
                if j == 0:
                    return (self.FX, GY)
                return (self.SX + (j - 1) * BW + BW / 2, GY - j * BH)
            p0, p1 = pos(i), pos(min(5, i + 1)) if i < 4 else (self.SX + 4 * BW + 46, GY - self.LEDGE_H)
            px = lerp(p0[0], p1[0], e_io(f))
            py = lerp(p0[1], p1[1], e_io(f)) - 18 * math.sin(math.pi * f)
            if k >= 1:
                ka = e_back(prog(t, self.T_CLIMB1, self.T_CLIMB1 + 0.4), 1.3)
                rp = {"L": lerp2((px - 26, py - 140), (px - 62, py - 390), ka), "R": lerp2((px + 26, py - 140), (px + 58, py - 394), ka)}
            else:
                rp = {"L": (px - 20, py - 150), "R": (px + 30, py - 150), "feet": [(px - 14, py - 4), (px + 22, py - 4 - 20 * math.sin(math.pi * f))]}
            B.figure(c, px, py, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        n = sum(1 for a in self.jumps if t >= a + 0.9)
        up = t >= self.T_CLIMB1
        return (f"{n} JUMPS", "ON TOP" if up else f"{self.count(self.steps, t)} BLOCKS"), (GRAPH, MOLTEN if up else GRAPH)

    def sfx(self, m):
        self.knocks(m, self.steps, 0.4)
        for a in self.jumps:
            m.add(S.whoosh(0.4, 400, 1300), a + 0.3, 0.3, pan=-0.45, send=0.2)
            m.add(S.footstep() * 1.5, a + 0.9, 0.7, pan=-0.45, send=0.25)
        for j in range(5):
            m.add(S.footstep(), self.T_CLIMB0 + (j + 1) * (self.T_CLIMB1 - self.T_CLIMB0) / 5, 0.6, pan=0.45, send=0.2)
        m.add(S.piano(S.note(81), 2.0), self.T_CLIMB1 + 0.05, 0.3, pan=0.4, send=0.7)


# ======================================================================
# 012 — 1 BLOCK A DAY
# ======================================================================
class E012(Clean):
    EP, SLUG = 12, "one-block-a-day"
    TITLE = "1 BLOCK A DAY."
    LBL = ("SOMEDAY", "EVERY DAY")
    VERDICT = ("1 a day.", "365 a year.")

    def setup(self):
        # accelerating rhythm: the days fly by
        times = [0.8 + 5.0 * (i / 15) ** 0.75 for i in range(16)]
        self.R = self.make_wall(RW, times)

    def scene(self, c, t):
        lp = SIT_PHONE(LF, e_io(prog(t, 0.1, 0.6)))
        lp["L"], lp["R"] = (LF + 26, GY - 110), (LF + 48, GY - 112)
        lp["blink"] = 1 if t > 1.0 else 0            # dozing off: eyes closed
        B.figure(c, LF, GY, lp, hero=False)
        for i in range(3):                            # "z z z"
            ph = (t * 0.7 + i / 3) % 1
            text(c, "z", LF + 50 + 30 * ph, GY - 260 - 90 * ph, font("monob", 26 + 10 * ph), GRAPH, 220 * math.sin(math.pi * ph), "c")
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.9 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        return ("0 BLOCKS", "+1 EVERY DAY"), (GRAPH, MOLTEN if t > 5.8 else GRAPH)

    def day(self, t):
        return 1 + int(364 * prog(t, 0.8, 5.8) ** 1.2)

    def hud_extra(self, c, t, k):
        text(c, f"DAY {self.day(t):03d}", W / 2, 372, font("mono", 30), GRAPH, 255 * k, "c", tracking=6)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)


# ======================================================================
# 013 — TALK LESS
# ======================================================================
class E013(Clean):
    EP, SLUG = 13, "talk-less"
    TITLE = "TALK LESS."
    LBL = ("TALKING", "BUILDING")
    VERDICT = ("Talk less.", "Build more.")
    WORDS = ["BIG PLANS", "SOON", "WATCH ME", "NEXT YEAR", "TRUST ME", "ANY DAY"]

    def setup(self):
        self.R = self.make_wall(RW, steady(0.8, 5.7, 14))
        self.bt = steady(0.8, 5.2, len(self.WORDS))

    def scene(self, c, t):
        lp = {"L": (LF - 26, GY - 140), "R": (LF + 26, GY - 140)}
        cur = None
        for i, tb in enumerate(self.bt):
            if tb <= t < tb + 0.75:
                cur = (i, prog(t, tb, tb + 0.25) * (1 - prog(t, tb + 0.6, tb + 0.75)))
                k = math.sin(math.pi * prog(t, tb, tb + 0.75))
                lp = {"L": (LF - 30, GY - 150), "R": (LF + 60 + 20 * k, GY - 200 - 40 * k), "hy": -4 * k}   # big gesture
        B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 3.0)}, hero=False)
        if cur:
            bubble(c, LF + 110, GY - 330, self.WORDS[cur[0]], cur[1])
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.9 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        n = sum(1 for tb in self.bt if t >= tb)
        return (f"{n} PROMISES", f"{self.count(self.R, t)} BLOCKS"), (GRAPH, MOLTEN if t > 5.7 else GRAPH)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)
        for tb in self.bt:
            for j in range(4):   # "blah blah": short muffled syllables
                m.add(S.piano(S.note(48 + (j * 3) % 7), 0.25) * 0.6, tb + j * 0.11, 0.3, pan=-0.45, send=0.2)


# ======================================================================
# 014 — DON'T QUIT NOW (digging for the gem)
# ======================================================================
class E014(Clean):
    EP, SLUG = 14, "dont-quit-now"
    TITLE = "DON'T QUIT NOW."
    LBL = ("QUIT", "KEPT DIGGING")
    VERDICT = ("You were this close.", "Keep digging.")
    DEPTH = 250                       # gem depth below the line
    SHW = 110                         # shaft width

    def setup(self):
        self.xl, self.xr = 320, 788   # shaft centres
        self.T_QUIT = 4.0
        self.T_GEM = 5.4

    def depth(self, side, t):
        if side == "L":
            return (self.DEPTH - 50) * prog(t, 0.6, self.T_QUIT)
        return self.DEPTH * prog(t, 0.6, self.T_GEM)

    def under(self, c, t):
        for side, x in (("L", self.xl), ("R", self.xr)):
            d = self.depth(side, t)
            if d > 1:
                c.drawRect(skia.Rect.MakeXYWH(x - self.SHW / 2, GY, self.SHW, d), fill("#050505"))
                c.drawRect(skia.Rect.MakeXYWH(x - self.SHW / 2, GY, self.SHW, d), stroke("#3A362E", 2))
            # the gem waits under both
            gy = GY + self.DEPTH + 22
            found = side == "R" and t >= self.T_GEM
            glow = 0.55 + 0.45 * math.sin(t * 3) if not found else 1.0
            g = fill(MOLTEN, (150 if found else 80) * glow)
            g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 24 if found else 14))
            c.drawCircle(x, gy, 50 if found else 30, g)
            c.drawPath(skia.Path().moveTo(x, gy - 24).lineTo(x + 20, gy).lineTo(x, gy + 24).lineTo(x - 20, gy).close(), fill(MOLTEN if found else "#A6421A"))
        # "70 cm" gap callout on the left
        if t >= self.T_QUIT:
            k = prog(t, self.T_QUIT, self.T_QUIT + 0.3)
            y0 = GY + self.DEPTH - 50
            c.drawLine(self.xl + 74, y0, self.xl + 74, GY + self.DEPTH + 4, stroke(MOLTEN, 2, 255 * k))
            text(c, "THIS CLOSE", self.xl + 86, y0 + 34, font("monob", 20), MOLTEN, 255 * k, "l", tracking=2)

    def dig_pose(self, x, d, t):
        ph = (t * 1.8) % 1
        dig = math.sin(ph * math.pi * 2) * 0.5 + 0.5
        return {"L": (x + 20 + 20 * dig, GY + d - 130 + 40 * dig), "R": (x + 50 + 30 * dig, GY + d - 70 + 30 * dig),
                "crouch": 0.35 + 0.25 * dig, "lean": 18 * dig, "hy": 8, "eyes_dy": 5}

    def scene(self, c, t):
        # left: digs, then climbs out and walks away
        if t < self.T_QUIT:
            d = self.depth("L", t)
            B.figure(c, self.xl - 20, GY + d, self.dig_pose(self.xl - 20, d, t), hero=False)
        else:
            k = e_io(prog(t, self.T_QUIT, self.T_QUIT + 0.6))
            x = lerp(self.xl - 20, self.xl - 140, k)
            y = GY + (self.DEPTH - 50) * (1 - k)
            B.figure(c, x, y, {"L": (x - 26, y - 140), "R": (x + 26, y - 140), "sad": True, "hy": 6}, hero=False, face=-1)
        # right: keeps digging until the gem
        if t < self.T_GEM:
            d = self.depth("R", t)
            B.figure(c, self.xr - 20, GY + d, self.dig_pose(self.xr - 20, d, t), hero=True)
        else:
            y = GY + self.DEPTH
            ka = e_back(prog(t, self.T_GEM, self.T_GEM + 0.4), 1.3)
            x = self.xr - 30
            B.figure(c, x, y, {"L": lerp2((x - 26, y - 140), (x - 60, y - 390), ka), "R": lerp2((x + 26, y - 140), (x + 56, y - 394), ka)}, hero=True)

    def subs(self, t):
        dl = int(9.3 * prog(t, 0.6, self.T_QUIT) * 10) / 10
        dr = int(10 * prog(t, 0.6, self.T_GEM) * 10) / 10
        return (f"{dl:.1f} m", "FOUND IT" if t >= self.T_GEM else f"{dr:.1f} m"), (GRAPH, MOLTEN if t >= self.T_GEM else GRAPH)

    def sfx(self, m):
        for side, end, pan in (("L", self.T_QUIT, -0.45), ("R", self.T_GEM, 0.45)):
            tt = 0.75
            while tt < end:
                m.add(S.shovel(), tt, 0.45, pan=pan, send=0.25)
                m.add(S.gravel(6, 0.12), tt + 0.12, 0.35, pan=pan, send=0.2)
                tt += 1 / 1.8
        m.add(S.footstep(), self.T_QUIT + 0.3, 0.5, pan=-0.5, send=0.2)
        m.add(S.footstep(), self.T_QUIT + 0.6, 0.4, pan=-0.6, send=0.2)
        m.add(S.block_knock(1.8, 0.4), self.T_GEM, 0.6, pan=0.45, send=0.3)
        m.add(S.piano(S.note(81), 2.2), self.T_GEM + 0.05, 0.45, pan=0.4, send=0.7)
        m.add(S.piano(S.note(88), 2.0), self.T_GEM + 0.2, 0.3, pan=0.4, send=0.7)


# ======================================================================
# 015 — EYES ON YOUR WALL
# ======================================================================
class E015(Clean):
    EP, SLUG = 15, "eyes-on-your-wall"
    TITLE = "EYES ON YOUR WALL."
    LBL = ("COMPARING", "FOCUSED")
    VERDICT = ("Stop watching their wall.", "Build yours.")

    def setup(self):
        self.R = self.make_wall(RW, steady(0.8, 5.7, 14))
        self.L = self.make_wall(LW, steady(1.0, 5.0, 6), sloppy=1.0)
        for i, it in enumerate(self.L):
            it["falls"] = i in (2, 4, 5)
            it["vx"] = self.rnd.uniform(-220, -60)

    def scene(self, c, t):
        def ov(it, t):
            if it.get("falls") and t >= it["land"] + 0.25:
                dt = t - it["land"] - 0.25
                x = it["x"] + it["vx"] * dt
                y = min(GY - BH / 2, it["y"] + 0.5 * 2600 * dt * dt)
                return (x, y, it["rot"] - 120 * min(dt, 0.5), 255 * (1 - prog(dt, 0.6, 0.9)))
            return None
        self.draw_wall(c, self.L, t, LF, override=ov)
        lp = self.toss_pose(self.L, t, LF)
        lp = {**lp, "hx": 12, "hy": -4, "eyes_dy": -2}     # always looking over at the other wall
        B.figure(c, LF, GY, {**lp, "blink": B.blink_at(t, 3.0)}, hero=False, face=1)
        # dotted "looking" line from his eyes to the other wall
        k = 0.5 + 0.5 * math.sin(t * 4)
        dp = stroke(GRAPH, 2, 120 * k)
        dp.setPathEffect(skia.DashPathEffect.Make([6, 10], t * 40))
        c.drawLine(LF + 30, GY - 290, RW + 20, GY - 300, dp)
        self.draw_wall(c, self.R, t, RF)
        rp = self.toss_pose(self.R, t, RF) if t < 5.9 else HIPS(RF)
        B.figure(c, RF, GY, {**rp, "blink": B.blink_at(t, 3.7)}, hero=True)

    def subs(self, t):
        nl = sum(1 for it in self.L if t >= it["land"] and not (it.get("falls") and t >= it["land"] + 0.25))
        return (f"{nl} BLOCKS", f"{self.count(self.R, t)} BLOCKS"), (GRAPH, MOLTEN if t > 5.7 else GRAPH)

    def sfx(self, m):
        self.knocks(m, self.R, 0.4)
        self.knocks(m, self.L, -0.4, 1.1, 0.8, 0.4)
        for it in self.L:
            if it.get("falls"):
                m.add(S.block_knock(0.7, 1.3), it["land"] + 0.55, 0.45, pan=-0.6, send=0.3)


EPISODES = {cls.EP: cls for cls in (E006, E007, E008, E009, E010, E011, E012, E013, E014, E015)}

if __name__ == "__main__":
    mode, ep = sys.argv[1], int(sys.argv[2])
    sc = EPISODES[ep]()
    if mode == "stills":
        B.stills(sc, [float(x) for x in sys.argv[3:]], f"c{ep}")
        print(B.sheet(f"c{ep}", 8))
    else:
        name = f"LB{ep:03d}_{sc.SLUG}"
        sc.sound(f"out/{name}.wav")
        B.render(sc, f"out/{name}.mp4", f"out/{name}.wav")
        print("done", name)
