"""LOADBEARING — varied series (016–023): new settings, tools and formats, same character.

python3 varied.py stills EP t1 t2 ...
python3 varied.py render EP
"""
import math
import random
import sys

import numpy as np
import skia
import brand as B
from brand import *
import sound as S

GY = 1240
WATER = "#7FB2E6"
ROCK, ROCK_DK = "#5C5A55", "#34332F"


# ======================================================================
# base
# ======================================================================
class Ep:
    EP = 0
    SLUG = ""
    TITLE = ""
    VERDICT = ("", "")
    DUR = 10.4
    T_TEXT = 7.0
    T_STING = 8.95
    Z = 1.3

    def __init__(self):
        self.rnd = random.Random(self.EP)
        self.setup()

    def setup(self):
        pass

    def pre(self, c, t):
        pass

    def world(self, c, t):
        pass

    def hud(self, c, t, k):
        pass

    def shake(self, t):
        return 0, 0

    def frame_world(self, c, t):
        z = self.Z * (1 + 0.03 * e_sine(prog(t, 0, self.T_TEXT)))
        sx, sy = self.shake(t)
        c.save()
        c.translate(W / 2 + sx, GY - 120 + sy)
        c.scale(z, z)
        c.translate(-W / 2, -(GY - 120))
        self.world(c, t)
        c.restore()

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        B.sky(c)
        self.pre(c, t)
        self.frame_world(c, t)
        kh = 1 - prog(t, self.T_TEXT - 0.3, self.T_TEXT)
        B.title(c, self.TITLE, 300, 255 * kh, size=82)
        self.hud(c, t, kh)
        if t >= self.T_TEXT:
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 180 * e_io(prog(t, self.T_TEXT, self.T_TEXT + .4))))
            B.verdict(c, t, self.T_TEXT + 0.05, self.VERDICT[0], self.VERDICT[1], 420, self.T_STING)
        B.sting(c, t, self.T_STING)
        return B.finish(surf, self.EP, t, self.T_STING, self.DUR)

    def sfx(self, m):
        pass

    def sound(self, path):
        m = S.Mix(self.DUR)
        self.sfx(m)
        S.brand_bed(m, self.DUR, self.T_TEXT)
        S.sonic_logo(m, self.T_STING + B.STING_HIT)
        m.render(path)

    def labels(self, c, t, xl, xr, y, names, subs, cols=(GRAPH, GRAPH)):
        k = e_out(prog(t, 0.0, 0.5)) * (1 - prog(t, self.T_TEXT - .3, self.T_TEXT))
        B.lane_label(c, xl, y, names[0], subs[0], cols[0], 255 * k)
        B.lane_label(c, xr, y, names[1], subs[1], cols[1], 255 * k, hero=True)


def flat(x):
    return GY


def walk_feet(x, ph, gy_fn=flat, stride=22, lift=10):
    s = math.sin(ph)
    a, b = x - stride * s, x + stride * s
    return [(a, gy_fn(a) - 4 - lift * max(0, math.cos(ph))), (b, gy_fn(b) - 4 - lift * max(0, -math.cos(ph)))]


def arm_swing(x, gy, ph, amp=26):
    s = math.sin(ph)
    return {"L": (x - 18 + amp * s, gy - 140), "R": (x + 18 - amp * s, gy - 140)}


def sweat(c, x, y, t, k=1.0):
    for i in range(3):
        ph = (t * 1.6 + i / 3) % 1
        a = 200 * k * math.sin(math.pi * ph)
        c.drawCircle(x + (i - 1) * 16 + 20 * ph * (1 if i % 2 else -1), y + 50 * ph, 4, fill("#9FC2FF", a))


def rot_pt(p, pivot, ang):
    a = math.radians(ang)
    dx, dy = p[0] - pivot[0], p[1] - pivot[1]
    return (pivot[0] + dx * math.cos(a) - dy * math.sin(a), pivot[1] + dx * math.sin(a) + dy * math.cos(a))


def figure_rot(c, pivot, ang, x, gy, pose, hero, face=1):
    c.save()
    c.translate(*pivot)
    c.rotate(ang)
    c.translate(-pivot[0], -pivot[1])
    B.figure(c, x, gy, pose, hero=hero, face=face)
    c.restore()


def glow(c, x, y, r, col, a):
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeRadial((x, y), max(1, r), [C(col, a), C(col, 0)]))
    c.drawCircle(x, y, r, p)


def poly(c, pts, paint):
    path = skia.Path()
    path.moveTo(*pts[0])
    for p in pts[1:]:
        path.lineTo(*p)
    path.close()
    c.drawPath(path, paint)


# ======================================================================
# 016 — THE 100TH HIT (stonecutter)
# ======================================================================
class E016(Ep):
    EP, SLUG = 16, "the-100th-hit"
    TITLE = "THE 100TH HIT."
    VERDICT = ("It wasn't the last hit.", "It was all 100.")
    FX = 300
    STRIKE, BACK = 22, -118

    def setup(self):
        n = 16
        self.hits = [0.75 + 5.25 * (i / (n - 1)) ** 0.8 for i in range(n)]
        self.T_SPLIT = self.hits[-1]
        self.rock = [(472, GY), (480, GY - 150), (520, GY - 238), (600, GY - 272), (690, GY - 256), (760, GY - 204), (796, GY - 112), (802, GY)]
        rnd = random.Random(16)
        self.crack = [(612, GY - 270)]
        y = GY - 270
        while y < GY:
            y = min(GY, y + rnd.uniform(26, 40))
            self.crack.append((612 + rnd.uniform(-22, 22), y))
        self.sparks = [(rnd.uniform(-1, 1), rnd.uniform(0.4, 1.0)) for _ in range(10)]

    def count(self, t):
        n = sum(1 for h in self.hits if t >= h)
        if n == 0:
            return 0
        if n >= len(self.hits):
            return 100
        return int(round(1 + 98 * ((n - 1) / (len(self.hits) - 2)) ** 1.5))

    def angle(self, t):
        prev = 0.2
        for h in self.hits:
            if t < h:
                dur = min(0.46, h - prev)
                k = prog(t, h - dur, h)
                if k < 0.55:
                    return lerp(self.STRIKE, self.BACK, e_io(k / 0.55))
                return lerp(self.BACK, self.STRIKE, e_in((k - 0.55) / 0.45))
            prev = h
        return self.STRIKE

    def halves(self):
        left, right = [], []
        top = self.crack[0]
        for p in self.rock:
            (left if p[0] < top[0] else right).append(p)
        L = [p for p in self.rock if p[0] < 612] + list(reversed(self.crack))
        L = [self.rock[0], self.rock[1], self.rock[2], self.rock[3]] + self.crack + []
        R = self.crack[::-1] + [self.rock[4], self.rock[5], self.rock[6], self.rock[7]]
        L = [(p[0], p[1]) for p in [self.rock[0], self.rock[1], self.rock[2], self.rock[3]]] + self.crack + [(self.crack[-1][0], GY)]
        L = [self.rock[0]] + [self.rock[1], self.rock[2], self.rock[3]] + self.crack
        R = list(reversed(self.crack)) + [self.rock[4], self.rock[5], self.rock[6], self.rock[7]]
        return L, R

    def draw_rock(self, c, pts, dx=0, rot=0, pivot=(0, 0)):
        c.save()
        c.translate(dx, 0)
        c.translate(*pivot)
        c.rotate(rot)
        c.translate(-pivot[0], -pivot[1])
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, GY - 280), (0, GY)], [C("#6E6C66"), C(ROCK_DK)]))
        poly(c, pts, p)
        poly(c, pts, stroke("#9A978F", 3))
        c.restore()

    def world(self, c, t):
        B.lamp(c, 560, 600, 700, GY, 1.0, warm=True)
        B.earth(c, GY)
        B.ground_line(c, GY)
        n = self.count(t)
        if t < self.T_SPLIT:
            self.draw_rock(c, self.rock)
            # hairline that only starts to show near the end
            kc = prog(n, 70, 99)
            if kc > 0:
                pts = self.crack[: max(2, int(len(self.crack) * kc))]
                path = skia.Path()
                path.moveTo(*pts[0])
                for q in pts[1:]:
                    path.lineTo(*q)
                c.drawPath(path, stroke("#1A1916", 2, 200 * kc))
        else:
            k = e_out(prog(t, self.T_SPLIT, self.T_SPLIT + 0.55))
            L, R = self.halves()
            self.draw_rock(c, L, -40 * k, -9 * k, (472, GY))
            self.draw_rock(c, R, 46 * k, 11 * k, (802, GY))
            kg = 1 - prog(t, self.T_SPLIT, self.T_SPLIT + 1.6)
            for dx, sgn in ((-40 * k, -1), (46 * k, 1)):
                path = skia.Path()
                path.moveTo(self.crack[0][0] + dx, self.crack[0][1])
                for q in self.crack[1:]:
                    path.lineTo(q[0] + dx, q[1])
                gp = stroke(MOLTEN, 7, 255 * kg)
                gp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6))
                c.drawPath(path, gp)
                c.drawPath(path, stroke(HOT, 2.5, 255 * kg))
            glow(c, 612, GY - 140, 260, MOLTEN, 110 * kg)
        # sparks
        for h in self.hits:
            ks = prog(t, h, h + 0.32)
            if 0 < ks < 1:
                big = 2.2 if h == self.T_SPLIT else 1.0
                for u, v in self.sparks:
                    x = 476 - 120 * v * ks * big + 30 * u
                    y = GY - 150 + 70 * u - 90 * v * ks * big + 160 * ks * ks
                    c.drawCircle(x, y, 3.2 * (1 - ks) + 0.6, fill(HOT, 255 * (1 - ks)))
        # the stonecutter
        a = self.angle(t)
        x = self.FX
        if t >= self.T_SPLIT + 0.35:
            k = e_back(prog(t, self.T_SPLIT + 0.35, self.T_SPLIT + 0.8), 1.3)
            B.figure(c, x, GY, {"L": lerp2((x - 26, GY - 140), (x - 64, GY - 392), k), "R": lerp2((x + 26, GY - 140), (x + 60, GY - 396), k),
                                "hy": -5 * k}, hero=True)
            # hammer lying on the ground
            c.drawLine(x + 70, GY - 6, x + 170, GY - 10, stroke(WOOD, 7))
            c.drawRRect(rrect(x + 160, GY - 30, 26, 44, 4), fill("#8E8E96"))
            return
        strike = prog(a, self.BACK, self.STRIKE)
        lean = lerp(-8, 16, strike)
        sh = (x + lean, GY - 224 + 10 * strike)
        d = (math.cos(math.radians(a)), math.sin(math.radians(a)))
        hands = {"L": (sh[0] + 62 * d[0], sh[1] + 62 * d[1]), "R": (sh[0] + 80 * d[0], sh[1] + 80 * d[1]), "Lb": -1, "Rb": -1}
        B.figure(c, x, GY, {**hands, "lean": lean, "crouch": 0.15 * strike, "spread": 30, "blink": B.blink_at(t, 3.6), "eyes_dy": 2}, hero=True)
        tip = (sh[0] + 176 * d[0], sh[1] + 176 * d[1])
        c.drawLine(sh[0] + 40 * d[0], sh[1] + 40 * d[1], tip[0], tip[1], stroke(WOOD, 8))
        c.save()
        c.translate(*tip)
        c.rotate(a)
        c.drawRRect(rrect(-12, -26, 28, 52, 5), fill("#8E8E96"))
        c.drawLine(-8, -22, -8, 22, stroke("#B9B9C2", 2))
        c.restore()

    def shake(self, t):
        k = prog(t, self.T_SPLIT, self.T_SPLIT + 0.5)
        if 0 < k < 1:
            return 8 * (1 - k) * math.sin(t * 90), 6 * (1 - k) * math.cos(t * 77)
        return 0, 0

    def hud(self, c, t, k):
        n = self.count(t)
        text(c, f"HIT {n:03d} / 100", W / 2, 380, font("monob", 34), MOLTEN if n == 100 else GRAPH, 255 * k, "c", tracking=6)

    def sfx(self, m):
        for i, h in enumerate(self.hits[:-1]):
            m.add(S.block_knock(1.9 + S.rng.uniform(-.05, .05), 0.5), h, 0.55, pan=-0.1, send=0.3)
            m.add(S.crackle(0.05, 200), h, 0.3, pan=-0.1, send=0.2)
            m.add(S.whoosh(0.2, 300, 900), h - 0.18, 0.12, pan=-0.2, send=0.1)
        h = self.T_SPLIT
        m.add(S.block_knock(1.6, 0.8), h, 0.7, send=0.3)
        m.add(S.snap(), h + 0.02, 1.0, send=0.4)
        m.add(S.crunch(), h + 0.05, 0.6, send=0.3)
        m.add(S.rumble(1.6), h + 0.1, 0.9, send=0.4)
        m.add(S.piano(S.note(81), 2.0), h + 0.3, 0.35, send=0.7)


# ======================================================================
# 017 — ROOTS FIRST (bamboo)
# ======================================================================
def make_roots(x, y, seed, depth=330, spread=1.0):
    rnd = random.Random(seed)
    segs = []

    def grow(x, y, ang, length, s0, d):
        steps = max(1, int(length / 12))
        for i in range(steps):
            ang += rnd.uniform(-0.35, 0.35)
            nx, ny = x + 12 * math.cos(ang), y + 12 * math.sin(ang)
            s = s0 + (1 - s0) * (i + 1) / steps
            segs.append((x, y, nx, ny, s, d))
            if d < 3 and rnd.random() < 0.12:
                grow(nx, ny, ang + rnd.choice([-1, 1]) * rnd.uniform(0.5, 1.0) * spread, length * 0.5, s, d + 1)
            x, y = nx, ny

    for k in range(5):
        grow(x, y, math.radians(90 + (k - 2) * 26 * spread), depth * (0.75 + 0.1 * (k % 3)), 0.0, 0)
    return segs


class E017(Ep):
    EP, SLUG = 17, "roots-first"
    TITLE = "ROOTS FIRST."
    VERDICT = ("4 years of nothing?", "Roots first. Then growth.")
    PL, PR = 340, 790          # plants
    FL, FR = 228, 680          # figures
    T_GROW = 4.85

    def setup(self):
        self.rootsR = make_roots(self.PR, GY + 6, 3)
        self.rootsL = make_roots(self.PL, GY + 6, 5, depth=120)
        self.waterR = [0.7 + i * 0.68 for i in range(6)]
        self.waterL = [0.7, 1.38]
        self.segs = 10

    def year(self, t):
        return min(5, 1 + int(4 * prog(t, 0.5, self.T_GROW)))

    def draw_roots(self, c, segs, g, hero):
        for x0, y0, x1, y1, s, d in segs:
            if s > g:
                continue
            col = CHALK if hero else "#6A6862"
            c.drawLine(x0, y0, x1, y1, stroke(col, max(1.2, 4 - d), 200 if hero else 150))
        if hero and g > 0:
            gp = fill(MOLTEN, 70 * g)
            gp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 30))
            c.drawCircle(self.PR, GY + 160, 150 * g, gp)

    def can(self, c, hand, tilt, pouring, t, target_x):
        c.save()
        c.translate(hand[0] + 10, hand[1] + 6)
        c.rotate(tilt)
        c.drawRRect(rrect(-20, -22, 40, 34, 6), fill("#7C8A99"))
        c.drawPath(skia.Path().moveTo(18, -6).lineTo(48, -26).lineTo(52, -20).lineTo(20, 4).close(), fill("#7C8A99"))
        c.restore()
        if pouring:
            sx = hand[0] + 10 + 50 * math.cos(math.radians(tilt)) - (-20) * math.sin(math.radians(tilt))
            for i in range(6):
                ph = (t * 3 + i / 6) % 1
                c.drawCircle(lerp(sx, target_x, ph), lerp(hand[1] - 10, GY - 6, ph * ph), 3.5, fill(WATER, 220))

    def water_pose(self, fx, px, times, t):
        for tw in times:
            if tw <= t < tw + 0.55:
                k = math.sin(math.pi * prog(t, tw, tw + 0.55))
                hand = (fx + 58, GY - 150)
                return {"R": hand, "L": (fx + 30, GY - 140), "lean": 10 * k}, hand, 40 * k, k > 0.4
        return None, None, 0, False

    def world(self, c, t):
        B.lamp(c, 300, 600, 700, GY, 0.5)
        B.lamp(c, 760, 600, 700, GY, 1.0, warm=True)
        B.earth(c, GY)
        gR = prog(t, 0.6, self.T_GROW)
        gL = prog(t, 0.6, 2.2)
        self.draw_roots(c, self.rootsL, gL, False)
        self.draw_roots(c, self.rootsR, gR, True)
        B.ground_line(c, GY)
        for px in (self.PL, self.PR):
            c.drawPath(skia.Path().moveTo(px - 34, GY).quadTo(px, GY - 18, px + 34, GY).close(), fill("#3A342A"))
        # left: digs it up at the end of year 2 (empty hole), right: the bamboo
        if t >= 2.6:
            c.drawOval(skia.Rect.MakeXYWH(self.PL - 30, GY - 6, 60, 14), fill("#050505"))
        kb = prog(t, self.T_GROW, self.T_GROW + 1.2)
        if kb > 0:
            n = kb * self.segs
            seg_h = 64
            for i in range(int(math.ceil(n))):
                f = clamp(n - i)
                y0 = GY - i * seg_h
                h = seg_h * e_back(f, 1.4)
                sway = math.sin(t * 2 + i * 0.4) * i * 0.6
                c.drawRRect(rrect(self.PR - 13 + sway, y0 - h, 26, h - 3, 8), fill("#9FD27A" if i % 2 else "#8CC46A"))
                c.drawLine(self.PR - 15 + sway, y0 - 2, self.PR + 15 + sway, y0 - 2, stroke("#5E8E44", 4))
                if i >= 3 and i % 2 == 1 and f > 0.6:
                    for sgn in (-1, 1):
                        lp = skia.Path().moveTo(self.PR + sway, y0 - h * 0.6)
                        lp.quadTo(self.PR + sway + 40 * sgn, y0 - h * 0.9, self.PR + sway + 70 * sgn, y0 - h * 0.5)
                        lp.quadTo(self.PR + sway + 36 * sgn, y0 - h * 0.62, self.PR + sway, y0 - h * 0.6)
                        c.drawPath(lp, fill("#7DB85C"))
            glow(c, self.PR, GY - 300 * kb, 260, MOLTEN, 60 * kb)
        # figures
        pose, hand, tilt, pour = self.water_pose(self.FL, self.PL, self.waterL, t)
        if pose is None:
            if 2.0 <= t < 2.7:          # digs it up: crouch at the mound
                k = math.sin(math.pi * prog(t, 2.0, 2.7))
                pose = {"crouch": 0.6 * k, "lean": 28 * k, "R": (self.FL + 90, GY - 40 - 60 * k), "L": (self.FL + 70, GY - 50 - 50 * k), "eyes_dy": 5}
            elif t >= 2.7:
                kk = e_io(prog(t, 2.7, 3.2))
                pose = {"sit": kk, "L": (self.FL + 44, GY - 150 + 50 * kk), "R": (self.FL + 58, GY - 152 + 50 * kk),
                        "hy": 12 * kk, "eyes_dy": 6 * kk, "lean": 10 * kk, "hx": 6 * kk}
            else:
                pose = {"L": (self.FL - 26, GY - 140), "R": (self.FL + 26, GY - 140)}
        info = B.figure(c, self.FL, GY, {**pose, "blink": B.blink_at(t, 3.1)}, hero=False)
        if hand:
            self.can(c, hand, tilt, pour, t, self.PL)
        if t >= 2.9:
            h = info["hands"]["R"]
            c.drawRRect(rrect(h[0] - 9, h[1] - 26, 18, 30, 4), fill("#1A1C24"))
            c.drawRRect(rrect(h[0] - 7, h[1] - 24, 14, 24, 3), fill("#9FC2FF", 230))
        pose, hand, tilt, pour = self.water_pose(self.FR, self.PR, self.waterR, t)
        if pose is None:
            if t >= self.T_GROW + 0.9:
                k = e_back(prog(t, self.T_GROW + 0.9, self.T_GROW + 1.3), 1.3)
                pose = {"L": lerp2((self.FR - 26, GY - 140), (self.FR - 64, GY - 392), k), "R": lerp2((self.FR + 26, GY - 140), (self.FR + 60, GY - 396), k), "hy": -5 * k}
            elif t >= self.T_GROW - 0.3:
                pose = {"L": (self.FR - 26, GY - 140), "R": (self.FR + 26, GY - 140), "hy": -8, "hx": 10, "eyes_dy": -5}
            else:
                pose = {"L": (self.FR - 26, GY - 140), "R": (self.FR + 26, GY - 140)}
        B.figure(c, self.FR, GY, {**pose, "blink": B.blink_at(t, 3.7)}, hero=True)
        if hand:
            self.can(c, hand, tilt, pour, t, self.PR)
        kl = 1 - prog(t, self.T_GROW, self.T_GROW + 0.3)
        k = e_out(prog(t, 0, .5)) * kl
        B.lane_label(c, 330, 800, "GAVE UP", "YEAR 2" if t >= 2.0 else "WATERING", GRAPH, 255 * k)
        B.lane_label(c, 780, 800, "KEPT WATERING", f"YEAR {self.year(t)}", GRAPH, 255 * k, hero=True)

    def hud(self, c, t, k):
        y = self.year(t)
        text(c, f"YEAR {y}  ·  {'NOTHING ABOVE GROUND' if y < 5 else 'BOOM.'}", W / 2, 380, font("mono", 28),
             MOLTEN if y == 5 else GRAPH, 255 * k, "c", tracking=5)

    def sfx(self, m):
        for tw in self.waterR:
            m.add(S.bp(S.rng.standard_normal(int(0.5 * S.SR)), 1500, 6000) * 0.25, tw + 0.1, 0.4, pan=0.4, send=0.2)
        for tw in self.waterL:
            m.add(S.bp(S.rng.standard_normal(int(0.5 * S.SR)), 1500, 6000) * 0.25, tw + 0.1, 0.35, pan=-0.4, send=0.2)
        m.add(S.shovel(), 2.1, 0.5, pan=-0.4, send=0.2)
        m.add(S.gravel(), 2.4, 0.4, pan=-0.45, send=0.2)
        m.add(S.whoosh(1.0, 200, 2000), self.T_GROW, 0.5, pan=0.4, send=0.3)
        for i in range(self.segs):
            m.add(S.wood_knock(0.8 + 0.08 * i), self.T_GROW + (i + 0.6) * 1.2 / self.segs, 0.45, pan=0.4, send=0.3)
        m.add(S.piano(S.note(81), 2.0), self.T_GROW + 1.2, 0.35, pan=0.4, send=0.7)


# ======================================================================
# 018 — KEEP THE FIRE (big once vs a log every night)
# ======================================================================
def flame(c, x, y, I, t, seed=0):
    if I <= 0.03:
        return
    h = 50 + 230 * min(I, 1.6)
    w = 34 + 60 * min(I, 1.4)
    glow(c, x, y - h * 0.4, 150 + 260 * min(I, 1.4), MOLTEN, 80 * min(1, I))
    for layer, (col, sc) in enumerate(((MOLTEN, 1.0), ("#FF8A1F", 0.72), ("#FFD27A", 0.42))):
        hh, ww = h * sc, w * sc
        tip = (x + 10 * math.sin(t * 7 + seed + layer), y - hh)
        p = skia.Path()
        p.moveTo(x - ww / 2, y)
        p.cubicTo(x - ww * 0.7, y - hh * 0.4, tip[0] - ww * 0.25 + 6 * math.sin(t * 11 + seed), y - hh * 0.75, *tip)
        p.cubicTo(tip[0] + ww * 0.25 + 6 * math.sin(t * 9 + seed), y - hh * 0.75, x + ww * 0.7, y - hh * 0.4, x + ww / 2, y)
        p.close()
        c.drawPath(p, fill(col, 235))
    for i in range(int(4 + 6 * min(I, 1.4))):
        ph = (t * 0.9 + i * 0.137 + seed) % 1
        ex = x + math.sin(i * 3.1 + t * 2) * w * 0.6 * ph
        c.drawCircle(ex, y - h * 0.6 - 160 * ph, 2.4 * (1 - ph) + 0.5, fill(HOT, 230 * (1 - ph)))


class E018(Ep):
    EP, SLUG = 18, "keep-the-fire"
    TITLE = "KEEP THE FIRE."
    VERDICT = ("Motivation burns out.", "Habits keep burning.")
    XL, XR = 350, 790
    FL, FR = 210, 640

    def setup(self):
        self.T_PILE = 0.9
        self.logs = [0.7 + i * 0.66 for i in range(9)]

    def IL(self, t):
        if t < self.T_PILE:
            return 0.2
        k = prog(t, self.T_PILE, self.T_PILE + 0.35)
        peak = lerp(0.2, 1.7, e_out(k))
        return peak * math.exp(-max(0, t - self.T_PILE - 0.35) / 1.1)

    def IR(self, t):
        n = sum(1 for tl in self.logs if t >= tl)
        base = 0.28 + 0.065 * n
        bump = sum(0.12 * math.exp(-(t - tl) / 0.4) for tl in self.logs if t >= tl)
        return min(0.95, base + bump)

    def logpile(self, c, x, n, burnt=0.0):
        col = mixc(WOOD, "#262220", burnt)
        dk = mixc(WOOD_DK, "#161412", burnt)
        for i in range(n):
            r = i // 3
            k = i % 3
            yy = GY - 8 - r * 13
            xx = x + (k - 1) * 30 + (r % 2) * 10
            c.save()
            c.translate(xx, yy)
            c.rotate(((i * 37) % 30) - 15)
            c.drawRRect(rrect(-38, -7, 76, 14, 6), fill(col))
            c.drawCircle(36, 0, 6, fill(dk))
            c.restore()

    def world(self, c, t):
        B.earth(c, GY)
        B.ground_line(c, GY)
        IL, IR = self.IL(t), self.IR(t)
        # cold blue tint creeping over the left lane as the fire dies
        self.logpile(c, self.XL, 12 if t >= self.T_PILE + 0.2 else 2, burnt=prog(t, 2.0, 5.0))
        self.logpile(c, self.XR, 2 + sum(1 for tl in self.logs if t >= tl + 0.3))
        flame(c, self.XL, GY - 18, IL, t, 1.3)
        flame(c, self.XR, GY - 18, IR, t, 4.1)
        # smoke when the left fire is out
        ks = prog(t, 4.2, 6.5)
        if ks > 0:
            for i in range(5):
                ph = (t * 0.35 + i / 5) % 1
                p = fill("#5E5C58", 70 * ks * (1 - ph))
                p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 14))
                c.drawCircle(self.XL + 20 * math.sin(t + i), GY - 40 - 220 * ph, 14 + 30 * ph, p)
        # big pile throw
        kp = prog(t, self.T_PILE - 0.35, self.T_PILE + 0.15)
        if 0 < kp < 1:
            for i in range(6):
                pos = bez((self.FL + 60, GY - 240), (self.FL + 120, GY - 380), (self.XL + (i - 3) * 14, GY - 20), e_in(kp))
                c.save()
                c.translate(pos[0] + i * 4, pos[1] - i * 6)
                c.rotate(30 * kp + i * 20)
                c.drawRRect(rrect(-36, -7, 72, 14, 6), fill(WOOD))
                c.restore()
        # grey pose
        if t < self.T_PILE + 0.2:
            k = prog(t, self.T_PILE - 0.6, self.T_PILE)
            pose = {"L": (self.FL + 20, GY - 250 * k - 140 * (1 - k)), "R": (self.FL + 60, GY - 260 * k - 140 * (1 - k)), "lean": 10 * k}
        elif t < 3.4:
            pose = {"L": (self.FL - 34, GY - 128), "R": (self.FL + 34, GY - 128), "hy": -4}       # proud
        else:
            kk = e_io(prog(t, 3.4, 3.9))
            shiver = 2 * math.sin(t * 40) * prog(t, 4.2, 4.6)
            pose = {"sit": kk, "L": (self.FL + 30 + shiver, GY - 110), "R": (self.FL + 54 + shiver, GY - 112), "hy": 10 * kk, "eyes_dy": 5,
                    "sad": True, "hipdx": shiver}
        B.figure(c, self.FL, GY, {**pose, "blink": B.blink_at(t, 3.2)}, hero=False)
        # orange pose: tosses one log, then warms hands
        pose = {"L": (self.FR + 70, GY - 170), "R": (self.FR + 84, GY - 160), "hy": 2}
        for tl in self.logs:
            if tl - 0.35 <= t < tl:
                k = prog(t, tl - 0.35, tl)
                pose = {"R": lerp2((self.FR + 40, GY - 120), (self.FR + 70, GY - 220), e_out(k)), "L": (self.FR - 10, GY - 160), "lean": 8}
                pos = bez((self.FR + 70, GY - 230), (self.FR + 110, GY - 300), (self.XR, GY - 26), k)
                c.save()
                c.translate(*pos)
                c.rotate(200 * k)
                c.drawRRect(rrect(-34, -7, 68, 14, 6), fill(WOOD))
                c.restore()
        B.figure(c, self.FR, GY, {**pose, "blink": B.blink_at(t, 3.7)}, hero=True)
        n = sum(1 for tl in self.logs if t >= tl)
        self.labels(c, t, 330, 780, 760, ("ALL AT ONCE", "A LOG A NIGHT"),
                    ("12 LOGS  ·  NIGHT 1" if t < 3.0 else "OUT", f"{n} LOGS"), (MOLTEN if t >= 3.0 else GRAPH, GRAPH))

    def hud(self, c, t, k):
        night = 1 + int(29 * prog(t, 0.6, 6.3))
        text(c, f"NIGHT {night:02d}", W / 2, 380, font("mono", 30), GRAPH, 255 * k, "c", tracking=6)

    def sfx(self, m):
        tt = 0.0
        while tt < self.T_TEXT:
            for x, I, pan in ((0, self.IL(tt), -0.45), (1, self.IR(tt), 0.45)):
                if I > 0.05:
                    m.add(S.crackle(0.3, 60 + 220 * I), tt + S.rng.uniform(0, 0.1), 0.18 + 0.35 * min(I, 1.4), pan=pan, send=0.2)
            tt += 0.24
        m.add(S.whoosh(0.6, 200, 1400), self.T_PILE - 0.3, 0.6, pan=-0.4, send=0.3)
        m.add(S.sub_hit(50, 0.8), self.T_PILE, 0.6, pan=-0.4, send=0.3)
        for i in range(6):
            m.add(S.wood_knock(0.9 + 0.1 * i), self.T_PILE + 0.02 * i, 0.3, pan=-0.45, send=0.2)
        for tl in self.logs:
            m.add(S.wood_knock(1.0 + S.rng.uniform(-.05, .05)), tl, 0.5, pan=0.45, send=0.25)
        m.add(S.wind(3.0) * 0.6, 4.0, 0.4, pan=-0.5, send=0.3)


# ======================================================================
# 019 — BUSY ISN'T PROGRESS (treadmill vs road, split top/bottom)
# ======================================================================
class E019(Ep):
    EP, SLUG = 19, "busy-isnt-progress"
    TITLE = "BUSY ISN'T PROGRESS."
    VERDICT = ("Running in place goes nowhere.", "Slow forward gets there.")
    TOP_Y, BOT_Y = 860, 1460
    SPEED = 150          # px/s scroll for the walker
    T_ARRIVE = 5.9

    def frame_world(self, c, t):
        dp = stroke(GRAPH, 2, 90)
        dp.setPathEffect(skia.DashPathEffect.Make([10, 12], 0))
        c.drawLine(60, 1030, W - 60, 1030, dp)
        z = 1.0 + 0.02 * e_sine(prog(t, 0, self.T_TEXT))
        for gy, fn, clip in ((self.TOP_Y, self.top, (440, 1030)), (self.BOT_Y, self.bottom, (1030, H))):
            c.save()
            c.clipRect(skia.Rect.MakeLTRB(0, clip[0], W, clip[1]))
            c.translate(W / 2, gy)
            c.scale(z, z)
            c.translate(-W / 2, 0)
            fn(c, t)
            c.restore()

    def top(self, c, t):
        B.lamp(c, 520, -380, -280, 0, 0.6)
        B.earth(c, 0, bottom=300)
        B.ground_line(c, 0)
        x0, x1 = 360, 680
        c.drawRRect(rrect(x0, -30, x1 - x0, 30, 10), fill("#2A2A31"))
        off = (t * 600) % 40
        for i in range(10):
            xx = x0 + 10 + ((i * 40 - off) % (x1 - x0 - 20))
            c.drawLine(xx, -28, xx + 18, -28, stroke("#55555E", 3))
        c.drawLine(x1 - 30, -30, x1 - 60, -230, stroke("#3E3E46", 8))
        c.drawRRect(rrect(x1 - 110, -262, 80, 40, 6), fill("#2A2A31"))
        text(c, "20 km/h", x1 - 70, -236, font("monob", 16), MOLTEN, 255, "c")
        x = 500
        ph = t * 15
        pose = {**arm_swing(x, -30, ph, 34), "feet": walk_feet(x, ph, lambda _x: -30, stride=30, lift=16), "lean": 12,
                "blink": B.blink_at(t, 3.0), "eyes_dy": 2}
        info = B.figure(c, x, -30, pose, hero=False)
        if t > 2.0:
            sweat(c, info["head"][0], info["head"][1] - 10, t, prog(t, 2.0, 3.0))
        k = e_out(prog(t, 0, .5)) * (1 - prog(t, self.T_TEXT - .3, self.T_TEXT))
        B.lane_label(c, 205, -230, "RUNNING", "IN PLACE  ·  0.0 km", GRAPH, 255 * k)

    def bottom(self, c, t):
        B.lamp(c, 420, -380, -280, 0, 1.0, warm=True)
        B.earth(c, 0, bottom=500)
        B.ground_line(c, 0)
        s = self.SPEED * min(t, self.T_ARRIVE)
        for i in range(-2, 40):
            xx = 120 + i * 150 - s
            if -40 < xx < W + 40:
                c.drawLine(xx, 0, xx, 14, stroke(GRAPH, 2, 160))
                if i % 4 == 0 and i > 0:
                    text(c, f"{i // 4} km", xx, 42, font("mono", 16), GRAPH, 180, "c", tracking=2)
        flag_x = 440 + 110 + self.SPEED * self.T_ARRIVE - s
        if flag_x < W + 60:
            c.drawLine(flag_x, 0, flag_x, -250, stroke("#6A6A72", 5))
            reached = t >= self.T_ARRIVE
            kf = e_back(prog(t, self.T_ARRIVE, self.T_ARRIVE + 0.5), 1.5) if reached else 0
            wave = math.sin(t * 6) * 5
            path = skia.Path().moveTo(flag_x + 2, -250).lineTo(flag_x + 2 + 86 * (0.6 + 0.4 * kf), -228 + wave).lineTo(flag_x + 2, -204).close()
            c.drawPath(path, fill(MOLTEN if reached else "#3A3A40"))
            if reached:
                glow(c, flag_x + 40, -228, 120, MOLTEN, 120 * kf)
        x = 440
        if t < self.T_ARRIVE:
            ph = t * 6.5
            pose = {**arm_swing(x, 0, ph, 18), "feet": walk_feet(x, ph, lambda _x: 0, stride=20, lift=8), "lean": 4}
        else:
            k = e_back(prog(t, self.T_ARRIVE, self.T_ARRIVE + 0.4), 1.3)
            pose = {"L": lerp2((x - 26, -140), (x - 62, -390), k), "R": lerp2((x + 26, -140), (x + 58, -394), k), "hy": -5 * k}
        B.figure(c, x, 0, {**pose, "blink": B.blink_at(t, 3.7)}, hero=True)
        km = 4.8 * prog(t, 0, self.T_ARRIVE)
        k = e_out(prog(t, 0, .5)) * (1 - prog(t, self.T_TEXT - .3, self.T_TEXT))
        B.lane_label(c, 205, -230, "WALKING", f"FORWARD  ·  {km:.1f} km",
                     MOLTEN if t >= self.T_ARRIVE else GRAPH, 255 * k, hero=True)

    def sfx(self, m):
        m.add(S.hydraulic(self.T_TEXT, True) * 0.5, 0, 0.35, pan=-0.3, send=0.1)
        period = math.pi / 15
        tt = 0.1
        while tt < self.T_TEXT:
            m.add(S.footstep(), tt, 0.35, pan=-0.35, send=0.1)
            tt += period
        tt = 0.2
        while tt < self.T_ARRIVE:
            m.add(S.footstep() * 1.2, tt, 0.55, pan=0.35, send=0.2)
            tt += math.pi / 6.5
        m.add(S.piano(S.note(81), 2.0), self.T_ARRIVE + 0.05, 0.4, pan=0.3, send=0.7)


# ======================================================================
# 020 — EASY ROAD, HARD ROAD
# ======================================================================
TERRAIN = [(-60, GY + 250), (250, GY + 250), (340, GY + 215), (440, GY + 120), (540, GY + 60), (640, GY - 10), (700, GY - 90),
           (780, GY - 190), (845, GY - 260), (1160, GY - 260)]


def ty(x):
    for (x0, y0), (x1, y1) in zip(TERRAIN, TERRAIN[1:]):
        if x0 <= x <= x1:
            return lerp(y0, y1, (x - x0) / (x1 - x0))
    return TERRAIN[-1][1] if x > TERRAIN[-1][0] else TERRAIN[0][1]


class E020(Ep):
    EP, SLUG = 20, "two-roads"
    TITLE = "EASY ROAD. HARD ROAD."
    VERDICT = ("Easy now, hard later.", "Hard now, easy later.")
    T_TOP = 5.6

    def pre(self, c, t):
        pass

    def world(self, c, t):
        # sunrise behind the summit
        ks = prog(t, 4.6, 6.6)
        if ks > 0:
            glow(c, 900, GY - 270, 120 + 520 * e_out(ks), MOLTEN, 150 * ks)
            glow(c, 900, GY - 270, 60 + 160 * ks, HOT, 200 * ks)
        path = skia.Path()
        path.moveTo(*TERRAIN[0])
        for p in TERRAIN[1:]:
            path.lineTo(*p)
        path.lineTo(1160, H)
        path.lineTo(-60, H)
        path.close()
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, GY - 260), (0, H)], [C("#1B1914"), C(VOID)]))
        c.drawPath(path, p)
        top = skia.Path()
        top.moveTo(*TERRAIN[0])
        for q in TERRAIN[1:]:
            top.lineTo(*q)
        c.drawPath(top, stroke(CHALK, 3, 230))
        g = stroke(CHALK, 9, 40)
        g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6))
        c.drawPath(top, g)
        # dead end sign
        sx = 236
        c.drawLine(sx, GY + 250, sx, GY + 140, stroke("#6A6A72", 5))
        c.drawRRect(rrect(sx - 62, GY + 134, 124, 40, 5), fill("#2A2A31"))
        text(c, "DEAD END", sx, GY + 161, font("monob", 18), MOLTEN, 230, "c", tracking=2)
        # flag on the summit
        if t >= self.T_TOP + 0.3:
            kf = e_back(prog(t, self.T_TOP + 0.3, self.T_TOP + 0.8), 1.5)
            fx = 905
            c.drawLine(fx, GY - 260, fx, GY - 260 - 200 * kf, stroke("#6A6A72", 5))
            wave = math.sin(t * 6) * 5
            c.drawPath(skia.Path().moveTo(fx + 2, GY - 260 - 200 * kf).lineTo(fx + 80, GY - 240 - 200 * kf + wave).lineTo(fx + 2, GY - 220 - 200 * kf).close(), fill(MOLTEN))
        # grey: quick and happy downhill, then the dead end
        if t < 0.5:
            xg = 520
        else:
            xg = lerp(520, 290, e_io(prog(t, 0.5, 2.9)))
        if t < 2.9:
            ph = t * 10
            pose = {**arm_swing(xg, ty(xg), ph, 22), "feet": walk_feet(xg, ph, ty), "hy": -3}
            B.figure(c, xg, ty(xg), {**pose, "blink": B.blink_at(t, 3.0)}, hero=False, face=-1)
        else:
            kk = e_io(prog(t, 3.6, 4.1))
            pose = {"L": (xg - 30, ty(xg) - 140), "R": (xg + 26, ty(xg) - 140), "sad": t > 3.2, "hy": 6, "eyes_dy": 4}
            if kk > 0:
                pose = {"sit": kk, "L": (xg - 20, ty(xg) - 100), "R": (xg - 46, ty(xg) - 100), "hy": 10 * kk, "eyes_dy": 5, "sad": True}
            B.figure(c, xg, ty(xg), {**pose, "blink": B.blink_at(t, 3.0)}, hero=False, face=-1)
        # orange: slow climb
        xo = lerp(560, 860, e_sine(prog(t, 0.7, self.T_TOP))) if t >= 0.7 else 560
        if t < self.T_TOP:
            ph = t * 6
            pose = {**arm_swing(xo, ty(xo), ph, 14), "feet": walk_feet(xo, ph, ty, stride=18, lift=12), "lean": 18 if t > 0.7 else 0,
                    "hy": 4, "eyes_dy": 2}
            info = B.figure(c, xo, ty(xo), {**pose, "blink": B.blink_at(t, 3.7)}, hero=True)
            if t > 2.0:
                sweat(c, info["head"][0], info["head"][1] - 6, t, 0.8)
        else:
            k = e_back(prog(t, self.T_TOP, self.T_TOP + 0.4), 1.3)
            y = ty(xo)
            B.figure(c, xo, y, {"L": lerp2((xo - 26, y - 140), (xo - 62, y - 390), k), "R": lerp2((xo + 26, y - 140), (xo + 58, y - 394), k),
                                "hy": -5 * k, "blink": B.blink_at(t, 3.7)}, hero=True)
        k = e_out(prog(t, 0, .5)) * (1 - prog(t, self.T_TEXT - .3, self.T_TEXT))
        B.lane_label(c, 270, 740, "EASY ROAD", "FUN NOW" if t < 2.9 else "DEAD END", MOLTEN if t >= 2.9 else GRAPH, 255 * k)
        B.lane_label(c, 560, 740, "HARD ROAD", "THE TOP" if t >= self.T_TOP else "TOUGH NOW", MOLTEN if t >= self.T_TOP else GRAPH, 255 * k, hero=True)

    def sfx(self, m):
        tt = 0.5
        while tt < 2.9:
            m.add(S.footstep() * 0.8, tt, 0.4, pan=-0.4, send=0.15)
            tt += math.pi / 10
        tt = 0.8
        while tt < self.T_TOP:
            m.add(S.footstep() * 1.3, tt, 0.55, pan=0.35, send=0.2)
            tt += math.pi / 6
        m.add(S.strain(2.0), 2.4, 0.3, pan=0.4, send=0.3)
        m.add(S.wind(self.T_TEXT) * 0.4, 0, 0.35, send=0.3)
        m.add(S.piano(S.note(52), 1.2), 3.0, 0.35, pan=-0.5, send=0.5)
        m.add(S.whoosh(0.8, 300, 1600), self.T_TOP, 0.4, pan=0.4, send=0.4)
        m.add(S.piano(S.note(81), 2.4), self.T_TOP + 0.1, 0.4, pan=0.4, send=0.7)
        m.add(S.piano(S.note(88), 2.0), self.T_TOP + 0.3, 0.3, pan=0.4, send=0.7)


# ======================================================================
# 021 — FIX THE LEAKS (tank with holes)
# ======================================================================
class E021(Ep):
    EP, SLUG = 21, "fix-the-leaks"
    TITLE = "FIX THE LEAKS."
    VERDICT = ("Don't work harder.", "Fix the leaks first.")
    TL, TR = (262, 422), (650, 810)        # tank x ranges
    TH = 250
    HOLES = [(0.18, "PHONE"), (0.42, "LATE NIGHTS"), (0.66, "EXCUSES")]
    FL, FR = 182, 570

    def setup(self):
        self.poursL = [0.8, 2.3, 3.8, 5.0]
        self.patches = [0.6, 1.05, 1.5]
        self.poursR = [2.0, 2.85, 3.7, 4.55]
        dt = 1 / 120
        n = int(self.DUR / dt) + 2
        self.lv = {"L": np.zeros(n), "R": np.zeros(n)}
        for side in ("L", "R"):
            L = 0.0
            for i in range(n):
                t = i * dt
                pours = self.poursL if side == "L" else self.poursR
                rate = (0.55 if side == "L" else 0.32)
                inflow = sum(rate for p in pours if p + 0.15 <= t < p + 0.75)
                out = 0.0
                for j, (h, _) in enumerate(self.HOLES):
                    open_ = side == "L" or t < self.patches[j]
                    if open_ and L > h:
                        out += 0.32 * math.sqrt(L - h)
                L = clamp(L + (inflow - out) * dt, 0, 1)
                self.lv[side][i] = L
        self.dt = dt

    def level(self, side, t):
        return float(self.lv[side][min(len(self.lv[side]) - 1, int(t / self.dt))])

    def tank(self, c, xr, L, side, t):
        x0, x1 = xr
        top = GY - self.TH
        c.drawRRect(rrect(x0, top, x1 - x0, self.TH, 8), fill("#15161B"))
        if L > 0.002:
            wy = GY - self.TH * L
            p = skia.Paint(AntiAlias=True)
            p.setShader(skia.GradientShader.MakeLinear([(0, wy), (0, GY)], [C(WATER, 230), C("#3F6E9E", 230)]))
            c.save()
            c.clipRRect(rrect(x0, top, x1 - x0, self.TH, 8))
            wave = skia.Path().moveTo(x0, wy)
            for i in range(9):
                xx = x0 + (x1 - x0) * (i + 1) / 9
                wave.lineTo(xx, wy + 3 * math.sin(t * 6 + i))
            wave.lineTo(x1, GY).lineTo(x0, GY).close()
            c.drawPath(wave, p)
            c.restore()
        c.drawRRect(rrect(x0, top, x1 - x0, self.TH, 8), stroke(CHALK, 3, 220))
        for j, (h, word) in enumerate(self.HOLES):
            hy = GY - self.TH * h
            patched = side == "R" and t >= self.patches[j]
            if patched:
                c.drawRRect(rrect(x1 - 8, hy - 9, 18, 18, 4), fill(MOLTEN))
                continue
            c.drawCircle(x1, hy, 6, fill("#050505"))
            if L > h + 0.005:
                strength = math.sqrt(L - h)
                for i in range(10):
                    ph = (t * 2.5 + i / 10) % 1
                    vx = 120 + 220 * strength
                    xx = x1 + vx * ph * 0.5
                    yy = hy + 0.5 * 900 * (ph * 0.5) ** 2
                    if yy < GY:
                        c.drawCircle(xx, yy, 3.2, fill(WATER, 220))
            if side == "L":
                text(c, word, x1 + 16, hy + 6, font("monob", 17), GRAPH, 220, "l", tracking=1)

    def bucket_pose(self, fx, pours, t, big):
        for p in pours:
            if p - 0.35 <= t < p + 0.85:
                k = prog(t, p - 0.35, p + 0.15)
                tilt = 70 * e_io(prog(t, p, p + 0.3)) * (1 - prog(t, p + 0.7, p + 0.85))
                hand = lerp2((fx + 40, GY - 120), (fx + 74, GY - self.TH - 40), e_out(k))
                if t > p + 0.7:
                    hand = lerp2(hand, (fx + 40, GY - 120), prog(t, p + 0.7, p + 0.85))
                return {"R": hand, "L": (hand[0] - 22, hand[1] + 8), "lean": 12 * k}, hand, tilt, (p + 0.1 <= t < p + 0.72)
        return None, None, 0, False

    def draw_bucket(self, c, hand, tilt, big):
        c.save()
        c.translate(hand[0] + 16, hand[1] + 4)
        c.rotate(tilt)
        s = 1.25 if big else 0.8
        c.scale(s, s)
        c.drawPath(skia.Path().moveTo(-20, -22).lineTo(20, -22).lineTo(15, 20).lineTo(-15, 20).close(), fill("#8C8C96"))
        c.drawArc(skia.Rect.MakeXYWH(-20, -40, 40, 36), 180, 180, False, stroke("#8C8C96", 2.5))
        c.restore()

    def world(self, c, t):
        B.lamp(c, 340, 600, 700, GY, 0.55)
        B.lamp(c, 770, 600, 700, GY, 1.0, warm=True)
        B.earth(c, GY)
        B.ground_line(c, GY)
        LL, LR = self.level("L", t), self.level("R", t)
        self.tank(c, self.TL, LL, "L", t)
        self.tank(c, self.TR, LR, "R", t)
        if LR > 0.97:
            glow(c, sum(self.TR) / 2, GY - self.TH / 2, 220, MOLTEN, 90 * prog(t, 5.0, 5.6))
        for side, fx, pours, big in (("L", self.FL, self.poursL, True), ("R", self.FR, self.poursR, False)):
            pose, hand, tilt, pouring = self.bucket_pose(fx, pours, t, big)
            if pose is None:
                pose = {"L": (fx - 26, GY - 140), "R": (fx + 26, GY - 140)}
                if side == "R":
                    for pt in self.patches:            # hammering a patch on each hole
                        if pt - 0.3 <= t < pt + 0.1:
                            j = self.patches.index(pt)
                            hy = GY - self.TH * self.HOLES[j][0]
                            k = math.sin(math.pi * prog(t, pt - 0.3, pt + 0.1))
                            pose = {"R": (self.TR[1] - 10 - 6 * k, hy - 20 * k), "L": (fx + 40, GY - 150), "lean": 20,
                                    "crouch": 0.5 if hy > GY - 120 else 0.1}
                            fx_ = fx
                    if t >= 5.4:
                        pose = {"L": (fx - 34, GY - 128), "R": (fx + 34, GY - 128), "hy": -4}
                elif t >= 5.6:
                    pose = {"L": (fx - 26, GY - 140), "R": (fx + 26, GY - 140), "sad": True, "hy": 6}
            if side == "R" and any(pt - 0.3 <= t < pt + 0.1 for pt in self.patches):
                x_fig = self.TR[1] + 70
                info = B.figure(c, x_fig, GY, {**{k_: v for k_, v in pose.items() if k_ not in ("R", "L")},
                                                 "L": (x_fig - 40, pose["R"][1] + 10), "R": (x_fig - 50, pose["R"][1]), "blink": 0}, hero=True, face=-1)
                h = info["hands"]["R"]
                c.drawLine(h[0], h[1], h[0] - 40, h[1] - 6, stroke(WOOD, 6))
                c.drawRRect(rrect(h[0] - 52, h[1] - 18, 16, 26, 3), fill("#8E8E96"))
                continue
            info = B.figure(c, fx, GY, {**pose, "blink": B.blink_at(t, 3.4 if side == "L" else 3.8)}, hero=side == "R")
            if hand:
                self.draw_bucket(c, hand, tilt, big)
                if pouring:
                    sx = hand[0] + 30
                    for i in range(7):
                        ph = (t * 3.4 + i / 7) % 1
                        tx = (self.TL if side == "L" else self.TR)
                        target = GY - self.TH * (LL if side == "L" else LR)
                        c.drawCircle(lerp(sx, sx + 20, ph), lerp(hand[1], target, ph * ph), 5 if big else 3.5, fill(WATER, 220))
        self.labels(c, t, 342, 770, 760, ("WORKING HARDER", "FIXED THE LEAKS"),
                    (f"FULL {int(100 * LL)}%", f"FULL {int(100 * LR)}%"), (GRAPH, MOLTEN if LR > 0.97 else GRAPH))

    def sfx(self, m):
        for p in self.poursL:
            m.add(S.pour(0.7), p + 0.1, 0.6, pan=-0.45, send=0.2)
        for p in self.poursR:
            m.add(S.pour(0.65) * 0.7, p + 0.1, 0.5, pan=0.45, send=0.2)
        for pt in self.patches:
            m.add(S.block_knock(1.9, 0.4), pt, 0.5, pan=0.5, send=0.2)
            m.add(S.block_knock(1.9, 0.4), pt + 0.12, 0.35, pan=0.5, send=0.2)
        n = int(self.T_TEXT * S.SR)
        trickle = S.bp(S.rng.standard_normal(n), 2500, 7000) * 0.12
        m.add(trickle, 0.6, 0.5, pan=-0.5, send=0.2)
        m.add(S.piano(S.note(81), 2.0), 5.4, 0.35, pan=0.4, send=0.7)


# ======================================================================
# 022 — THE 5 AM TEST (alarm, snooze)
# ======================================================================
class E022(Ep):
    EP, SLUG = 22, "the-5am-test"
    TITLE = "THE 5 AM TEST."
    VERDICT = ("Win the morning.", "Win the day.")
    BL, BR = (150, 470), (610, 930)
    TOPB = GY - 80
    RINGS = [0.6, 1.9, 3.2]
    T_FF0, T_FF1 = 4.0, 4.7

    def setup(self):
        self.T_UP = 0.95
        self.T_STAND = 1.45
        self.T_DOWN = 1.85
        self.ticks = [(2.6, "UP ✓"), (3.5, "TRAINED ✓"), (4.4, "READ ✓"), (5.3, "PLANNED ✓")]

    def clock_text(self, side, t):
        if side == "R":
            m = 0 + int(85 * prog(t, 0.6, 5.6))
            return f"{5 + m // 60:02d}:{m % 60:02d}", t < self.T_UP
        if t < self.T_FF0:
            n = sum(1 for r in self.RINGS if t >= r)
            mins = 9 * max(0, n - 1)
            ringing = any(r <= t < r + 0.45 for r in self.RINGS)
            return f"05:{mins:02d}", ringing
        m = int(lerp(18, 162, e_io(prog(t, self.T_FF0, self.T_FF1))))
        return f"{5 + m // 60:02d}:{m % 60:02d}", self.T_FF1 <= t < self.T_FF1 + 0.6

    def bed(self, c, xr):
        x0, x1 = xr
        c.drawRRect(rrect(x0, self.TOPB, x1 - x0, 44, 8), fill("#2A2C36"))
        c.drawRect(skia.Rect.MakeXYWH(x0, self.TOPB + 40, 14, 40), fill("#202229"))
        c.drawRect(skia.Rect.MakeXYWH(x1 - 14, self.TOPB + 40, 14, 40), fill("#202229"))
        c.drawRRect(rrect(x0 - 6, self.TOPB - 70, 16, 150, 6), fill("#202229"))
        c.drawRRect(rrect(x0 + 14, self.TOPB - 24, 80, 26, 12), fill("#C9CED8"))

    def clock(self, c, x, y, s, ringing, t, late=False):
        wob = 4 * math.sin(t * 60) if ringing else 0
        c.save()
        c.translate(x + wob, y)
        c.drawRRect(rrect(-70, -30, 140, 60, 10), fill("#121318"))
        c.drawRRect(rrect(-70, -30, 140, 60, 10), stroke("#3A3A44", 2))
        text(c, s, 0, 13, font("monob", 34), MOLTEN if (ringing or late) else CHALK, 255, "c", tracking=2)
        c.restore()
        if ringing:
            for i in range(3):
                r = 80 + i * 18 + 10 * math.sin(t * 20)
                c.drawArc(skia.Rect.MakeXYWH(x - r, y - r * 0.6, 2 * r, 1.2 * r), -40, 80, False, stroke(MOLTEN, 3, 160 - i * 40))

    def blanket(self, c, xr, k=1.0):
        x0, x1 = xr
        c.drawRRect(rrect(x0 + 96 + (1 - k) * 200, self.TOPB - 40, (x1 - x0 - 100) * k, 46, 18), fill("#3A3F55"))

    def world(self, c, t):
        c.drawRect(skia.Rect.MakeLTRB(100, GY - 600, 980, GY), fill("#0D0E13"))
        # window behind orange (sunrise)
        ks = prog(t, 2.0, 5.0)
        wx, wy = 830, GY - 470
        c.save()
        c.clipRect(skia.Rect.MakeXYWH(wx - 80, wy - 70, 160, 140))
        c.drawRect(skia.Rect.MakeXYWH(wx - 80, wy - 70, 160, 140), fill("#0A0C14"))
        glow(c, wx, wy + 70, 40 + 160 * ks, MOLTEN, 220 * ks)
        glow(c, wx, wy + 70, 20 + 60 * ks, HOT, 255 * ks)
        c.restore()
        c.drawRect(skia.Rect.MakeXYWH(wx - 80, wy - 70, 160, 140), stroke("#3A3A44", 6))
        c.drawLine(wx, wy - 70, wx, wy + 70, stroke("#3A3A44", 4))
        B.lamp(c, 310, 600, 700, GY, 0.35 + 0.3 * (t > 4.8))
        B.lamp(c, 640, 600, 700, GY, 0.25 + 0.7 * prog(t, 0.9, 1.3), warm=True)
        B.earth(c, GY)
        B.ground_line(c, GY, 100, 980)
        for xr in (self.BL, self.BR):
            self.bed(c, xr)
        # clocks on the wall
        sL, rL = self.clock_text("L", t)
        sR, rR = self.clock_text("R", t)
        self.clock(c, 250, GY - 360, sL, rL, t, late=t >= self.T_FF1)
        self.clock(c, 700, GY - 360, sR, rR, t)
        # ---- grey: snooze x3, then wakes up late
        feet = (self.BL[1] - 26, self.TOPB - 12)
        if t < self.T_FF1 + 0.1:
            pose = {"L": (feet[0] - 150, feet[1] + 30), "R": (feet[0] - 140, feet[1] + 34), "blink": 1}
            for r in self.RINGS:
                if r + 0.1 <= t < r + 0.55:
                    k = math.sin(math.pi * prog(t, r + 0.1, r + 0.55))
                    tgt = lerp2((feet[0] - 150, feet[1] + 30), (250, GY - 340), k)
                    local = rot_pt(tgt, feet, 90)
                    pose = {"R": local, "L": rot_pt((feet[0] - 150, feet[1] + 30), feet, 90), "blink": 1 if k < 0.6 else 0}
            if not any(r + 0.1 <= t < r + 0.55 for r in self.RINGS):
                pose = {k_: rot_pt(v, feet, 90) if k_ in ("L", "R") else v for k_, v in pose.items()}
            figure_rot(c, feet, -90, feet[0], feet[1], pose, False)
            self.blanket(c, self.BL)
            for i in range(3):
                ph = (t * 0.7 + i / 3) % 1
                text(c, "z", self.BL[0] + 60 + 30 * ph, self.TOPB - 70 - 90 * ph, font("monob", 24 + 10 * ph), GRAPH, 200 * math.sin(math.pi * ph), "c")
        else:
            k = e_out(prog(t, self.T_FF1 + 0.1, self.T_FF1 + 0.4))
            x = lerp(feet[0], self.BL[1] + 40, k)
            y = lerp(feet[1] + 12, GY, k) - 50 * math.sin(math.pi * k)
            B.figure(c, x, y, {"L": (x - 50, y - 250), "R": (x + 10, y - 270), "eyes_dy": -5, "sad": True, "blink": 0}, hero=False, face=-1)
            self.blanket(c, self.BL, 1 - 0.6 * k)
        # ---- orange: up at the first ring
        feet = (self.BR[1] - 26, self.TOPB - 12)
        if t < self.T_UP:
            pose = {k_: rot_pt(v, feet, 90) for k_, v in (("L", (feet[0] - 150, feet[1] + 30)), ("R", (feet[0] - 140, feet[1] + 34)))}
            figure_rot(c, feet, -90, feet[0], feet[1], {**pose, "blink": 1 if t < 0.65 else 0}, True)
            self.blanket(c, self.BR)
        elif t < self.T_STAND:
            k = e_io(prog(t, self.T_UP, self.T_STAND))
            figure_rot(c, feet, -90 * (1 - k), feet[0], feet[1], {"blink": 0}, True)
            self.blanket(c, self.BR, 1 - 0.7 * k)
        else:
            self.blanket(c, self.BR, 0.3)
            if t < self.T_DOWN:
                k = e_io(prog(t, self.T_STAND, self.T_DOWN))
                x = lerp(feet[0], self.BR[1] - 120, k)
                y = lerp(feet[1] + 12, GY, k) - 40 * math.sin(math.pi * k)
                B.figure(c, x, y, {"blink": 0}, hero=True, face=-1)
            else:
                x = self.BR[1] - 120
                phase = None
                for j, (tk, _) in enumerate(self.ticks):
                    if tk - 0.8 <= t < tk:
                        phase = j
                if phase == 0:            # stretch
                    k = math.sin(math.pi * prog(t, self.ticks[0][0] - 0.8, self.ticks[0][0]))
                    pose = {"L": (x - 40, GY - 140 - 250 * k), "R": (x + 40, GY - 140 - 250 * k), "hy": -6 * k}
                elif phase == 1:          # jog in place
                    ph = t * 14
                    pose = {**arm_swing(x, GY, ph, 30), "feet": walk_feet(x, ph, stride=10, lift=22)}
                elif phase == 2:          # read
                    pose = {"L": (x - 34, GY - 190), "R": (x - 4, GY - 196), "hy": 8, "eyes_dy": 5, "hx": -4}
                elif phase == 3:          # write the plan
                    k = math.sin(t * 20) * 4
                    pose = {"L": (x - 40, GY - 180), "R": (x - 20 + k, GY - 172), "hy": 8, "eyes_dy": 5, "hx": -4}
                else:
                    pose = {"L": (x - 34, GY - 128), "R": (x + 34, GY - 128), "hy": -4}
                info = B.figure(c, x, GY, {**pose, "blink": B.blink_at(t, 3.7)}, hero=True, face=-1)
                if phase in (2, 3):
                    h = info["hands"]["L"]
                    c.drawRRect(rrect(h[0] - 8, h[1] - 30, 46, 34, 3), fill(CHALK if phase == 2 else "#C9CED8"))
                    c.drawLine(h[0] + 15, h[1] - 30, h[0] + 15, h[1] + 4, stroke(GRAPH, 2))
        # checklist next to orange
        for j, (tk, word) in enumerate(self.ticks):
            k = prog(t, tk, tk + 0.25)
            if k > 0:
                text(c, word, 640, GY - 640 + j * 40, font("monob", 22), MOLTEN, 255 * k, "l", tracking=2)
        self.labels(c, t, 310, 770, 1325, ("SNOOZE", "UP AT 5"),
                    (f"SNOOZED {min(3, sum(1 for r in self.RINGS if t >= r + 0.3))}x" + ("  ·  LATE" if t >= self.T_FF1 else ""),
                     f"{sum(1 for tk, _ in self.ticks if t >= tk)} DONE"),
                    (MOLTEN if t >= self.T_FF1 else GRAPH, MOLTEN if t >= self.ticks[-1][0] else GRAPH))

    def sfx(self, m):
        def beeps(t0, n=3):
            for i in range(n):
                nn = int(0.09 * S.SR)
                tt = np.arange(nn) / S.SR
                m.add(np.sin(2 * np.pi * 2100 * tt) * 0.35 * np.minimum(1, (0.09 - tt) / 0.01), t0 + i * 0.14, 0.45, send=0.2)
        for r in self.RINGS:
            beeps(r)
            m.add(S.footstep() * 1.4, r + 0.33, 0.5, pan=-0.45, send=0.2)   # slap the snooze
        m.add(S.whoosh(0.7, 2000, 300), self.T_FF0, 0.35, pan=-0.4, send=0.3)
        beeps(self.T_FF1, 5)
        m.add(S.footstep() * 1.6, self.T_FF1 + 0.4, 0.6, pan=-0.45, send=0.2)
        m.add(S.whoosh(0.4, 300, 1200), self.T_UP, 0.3, pan=0.4, send=0.2)
        m.add(S.footstep() * 1.3, self.T_DOWN, 0.55, pan=0.4, send=0.2)
        for tk, _ in self.ticks:
            m.add(S.piano(S.note(76), 0.8) * 0.6, tk, 0.4, pan=0.4, send=0.5)
        tt = self.ticks[1][0] - 0.8
        while tt < self.ticks[1][0]:
            m.add(S.footstep(), tt, 0.35, pan=0.4, send=0.1)
            tt += math.pi / 14
        m.add(S.paper(0.3), self.ticks[2][0] - 0.7, 0.4, pan=0.4, send=0.1)


# ======================================================================
# 023 — FIND THE LEVER
# ======================================================================
class E023(Ep):
    EP, SLUG = 23, "find-the-lever"
    TITLE = "FIND THE LEVER."
    VERDICT = ("Don't just push harder.", "Find the lever.")
    RL = (350, GY - 82, 82)        # grey's rock (x, y, r)
    FULCRUM = 770
    PLANK = (600, 860)

    def setup(self):
        self.T_PLACE0, self.T_PLACE1 = 0.7, 2.0
        self.T_PRESS0, self.T_PRESS1 = 2.5, 3.3
        self.T_ROLL = 3.5

    def lever_angle(self, t):
        return -17 * e_io(prog(t, self.T_PRESS0, self.T_PRESS1))

    def boulder(self, c, x, y, r, rot=0):
        c.save()
        c.translate(x, y)
        c.rotate(rot)
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeRadial((-r * 0.3, -r * 0.4), r * 1.4, [C("#77746D"), C(ROCK_DK)]))
        path = skia.Path()
        for i in range(12):
            a = i / 12 * math.tau
            rr = r * (0.92 + 0.08 * math.sin(i * 2.7))
            (path.moveTo if i == 0 else path.lineTo)(rr * math.cos(a), rr * math.sin(a))
        path.close()
        c.drawPath(path, p)
        c.drawPath(path, stroke("#9A978F", 3))
        c.drawLine(-r * 0.3, -r * 0.1, r * 0.1, r * 0.2, stroke("#3A3934", 3))
        c.restore()

    def world(self, c, t):
        B.lamp(c, 330, 600, 700, GY, 0.55)
        B.lamp(c, 760, 600, 700, GY, 1.0, warm=True)
        B.earth(c, GY)
        B.ground_line(c, GY)
        # grey pushes the rock with bare hands
        x, y, r = self.RL
        wig = 1.5 * math.sin(t * 9) * (1 if t < 5.4 else 0)
        self.boulder(c, x, y, r, wig)
        fx = x - r - 74
        if t < 5.4:
            k = 0.5 + 0.5 * math.sin(t * 3)
            pose = {"L": (x - r + 4, y - 30), "R": (x - r + 2, y + 6), "lean": 34, "crouch": 0.3 + 0.1 * k, "spread": 40, "hy": 6, "eyes_dy": 2}
        else:
            kk = e_io(prog(t, 5.4, 5.9))
            pose = {"sit": kk, "L": (fx + 30, GY - 100), "R": (fx + 58, GY - 96), "hy": 10, "eyes_dy": 5, "sad": True, "lean": 10 * kk}
        info = B.figure(c, fx, GY, {**pose, "blink": B.blink_at(t, 3.2)}, hero=False)
        if 1.0 < t < 5.4:
            sweat(c, info["head"][0], info["head"][1] - 6, t, 0.9)
        # orange: fulcrum + plank + rock
        fx_ = self.FULCRUM
        c.drawPath(skia.Path().moveTo(fx_ - 26, GY).lineTo(fx_, GY - 40).lineTo(fx_ + 26, GY).close(), fill("#8E8E96"))
        a = self.lever_angle(t)
        rock_r = 80
        # rock: sits at the right end, lifted by the lever, then rolls away to the right
        tip_local = (self.PLANK[1] - fx_ - 20, -48)
        tip = rot_pt((fx_ + tip_local[0], GY - 48), (fx_, GY - 48), a)
        rx, ry = 872, GY - rock_r
        if t >= self.T_PRESS0:
            rx, ry = tip[0] + 10, tip[1] - rock_r + 6
        if t >= self.T_ROLL:
            k = prog(t, self.T_ROLL, self.T_ROLL + 1.6)
            rx = rx + 420 * e_in(k)
            ry = min(GY - rock_r, ry + 300 * k * k)
        self.boulder(c, rx, ry, rock_r, 260 * prog(t, self.T_ROLL, self.T_ROLL + 1.6))
        # plank: carried in, then set on the fulcrum
        if t < self.T_PLACE0:
            pass
        elif t < self.T_PLACE1:
            k = e_io(prog(t, self.T_PLACE0, self.T_PLACE1))
            cx = lerp(560, (self.PLANK[0] + self.PLANK[1]) / 2, k)
            cy = lerp(GY - 230, GY - 48, k)
            c.save()
            c.translate(cx, cy)
            c.rotate(lerp(-20, 0, k))
            c.drawRRect(rrect(-130, -9, 260, 18, 4), fill(WOOD))
            c.restore()
        else:
            c.save()
            c.translate(fx_, GY - 48)
            c.rotate(a)
            c.drawRRect(rrect(self.PLANK[0] - fx_, -9, self.PLANK[1] - self.PLANK[0], 18, 4), fill(WOOD))
            c.drawLine(self.PLANK[0] - fx_ + 6, -2, self.PLANK[1] - fx_ - 10, 0, stroke(WOOD_DK, 1.5))
            c.restore()
        # orange figure
        ox = 520
        if t < self.T_PLACE0:
            pose = {"L": (ox - 26, GY - 140), "R": (ox + 26, GY - 140), "hx": 8}
        elif t < self.T_PLACE1:
            k = e_io(prog(t, self.T_PLACE0, self.T_PLACE1))
            cx = lerp(560, (self.PLANK[0] + self.PLANK[1]) / 2, k)
            cy = lerp(GY - 230, GY - 48, k)
            pose = {"L": (cx - 60, cy), "R": (cx - 20, cy), "lean": 20 * k, "crouch": 0.5 * k}
        elif t < self.T_PRESS1 + 0.2:
            end = rot_pt((self.PLANK[0] + 14, GY - 56), (fx_, GY - 48), a)
            k = prog(t, self.T_PLACE1, self.T_PRESS0)
            pose = {"L": end, "R": (end[0] + 18, end[1] + 2), "lean": 24, "crouch": 0.25, "hy": 4}
        else:
            k = e_back(prog(t, self.T_PRESS1 + 0.2, self.T_PRESS1 + 0.6), 1.3)
            pose = {"L": lerp2((ox - 26, GY - 140), (ox - 62, GY - 390), k), "R": lerp2((ox + 26, GY - 140), (ox + 58, GY - 394), k), "hy": -5 * k}
        B.figure(c, ox, GY, {**pose, "blink": B.blink_at(t, 3.7)}, hero=True)
        moved = t >= self.T_PRESS1
        self.labels(c, t, 330, 760, 760, ("PUSHING HARDER", "FOUND A LEVER"),
                    ("100% EFFORT", "MOVED IT ✓" if moved else "20% EFFORT"),
                    (GRAPH, MOLTEN if moved else GRAPH))

    def sfx(self, m):
        m.add(S.strain(5.0), 0.3, 0.55, pan=-0.45, send=0.3)
        tt = 0.5
        while tt < 5.4:
            m.add(S.trowel(0.35) * 0.7, tt, 0.3, pan=-0.45, send=0.2)      # rock scraping
            tt += 0.9
        m.add(S.wood_knock(0.8), self.T_PLACE1, 0.6, pan=0.3, send=0.3)
        m.add(S.creak(self.T_PRESS1 - self.T_PRESS0), self.T_PRESS0, 0.6, pan=0.35, send=0.3)
        m.add(S.rumble(1.8), self.T_ROLL, 0.8, pan=0.6, send=0.3)
        m.add(S.piano(S.note(81), 2.0), self.T_PRESS1 + 0.25, 0.35, pan=0.4, send=0.7)


EPISODES = {cls.EP: cls for cls in (E016, E017, E018, E019, E020, E021, E022, E023)}

if __name__ == "__main__":
    mode, ep = sys.argv[1], int(sys.argv[2])
    sc = EPISODES[ep]()
    if mode == "stills":
        B.stills(sc, [float(x) for x in sys.argv[3:]], f"v{ep}")
        print(B.sheet(f"v{ep}", 8))
    else:
        name = f"LB{ep:03d}_{sc.SLUG}"
        sc.sound(f"out/{name}.wav")
        B.render(sc, f"out/{name}.mp4", f"out/{name}.wav")
        print("done", name)
