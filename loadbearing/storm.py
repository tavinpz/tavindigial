"""LOADBEARING v2 pilot — "SHORTCUT vs FOUNDATION" (the storm test).

python3 storm.py stills 2 4.5 8.5 10.4 11.2 12.6 14.5 16.2
python3 storm.py video
"""
import math
import os
import random
import subprocess
import sys

import numpy as np
import skia
import brand as B

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 60
DUR = 17.2
GY = 1240                      # the line (floor)

# ---------------------------------------------------------------- palette
def C(hx, a=255):
    hx = hx.lstrip("#")
    return skia.Color(int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16), int(clamp(a, 0, 255)))


VOID, NIGHT = "#060608", "#0B0C10"
CHALK = "#F1EEE8"
BLOCK, BLOCK_TOP, BLOCK_DK = "#D9D3C6", "#F2EEE6", "#A9A295"
EARTH, EARTH2 = "#0E0D0C", "#16140F"
GRAPH = "#77777C"
MOLTEN = "#FF4D00"
HOT = "#FFB15C"

TF = {k: skia.Typeface.MakeFromFile(os.path.join(HERE, f)) for k, f in {
    "black": "InterDisplay-Black.otf", "bold": "InterDisplay-Bold.otf",
    "mono": "JetBrainsMono-Regular.ttf", "monob": "JetBrainsMono-Bold.ttf"}.items()}


def font(k, size):
    f = skia.Font(TF[k], size)
    f.setSubpixel(True)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    return f


# ---------------------------------------------------------------- math
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def prog(t, a, b):
    return clamp((t - a) / (b - a)) if b > a else float(t >= b)


def e_out(x):  return 1 - (1 - x) ** 3
def e_in(x):   return x ** 3
def e_io(x):   return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def e_sine(x): return -(math.cos(math.pi * x) - 1) / 2
def e_back(x, s=1.7):
    x -= 1
    return x * x * ((s + 1) * x + s) + 1


def lerp(a, b, k):  return a + (b - a) * k
def lerp2(p, q, k): return (lerp(p[0], q[0], k), lerp(p[1], q[1], k))
def mixc(c1, c2, k):
    a = [int(c1.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    b = [int(c2.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{int(lerp(x, y, clamp(k))):02X}" for x, y in zip(a, b))


def bez(p0, p1, p2, k):
    return lerp2(lerp2(p0, p1, k), lerp2(p1, p2, k), k)


def fill(col, a=255):
    return skia.Paint(AntiAlias=True, Color=C(col, a))


def stroke(col, w, a=255):
    return skia.Paint(AntiAlias=True, Color=C(col, a), Style=skia.Paint.kStroke_Style, StrokeWidth=w,
                      StrokeCap=skia.Paint.kRound_Cap, StrokeJoin=skia.Paint.kRound_Join)


def text(c, s, x, y, f, col, a=255, align="l", tracking=0.0):
    w = sum(f.measureText(ch) for ch in s) + tracking * (len(s) - 1)
    if align == "c":
        x -= w / 2
    elif align == "r":
        x -= w
    p = fill(col, a)
    for ch in s:
        c.drawString(ch, x, y, f, p)
        x += f.measureText(ch) + tracking
    return w


# ---------------------------------------------------------------- the builder (mascot)
LIMB = 14


def ik(sh, target, L1, L2, bend=1):
    dx, dy = target[0] - sh[0], target[1] - sh[1]
    d = clamp(math.hypot(dx, dy), 1, L1 + L2 - 0.5)
    base = math.atan2(dy, dx)
    a = math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    el = (sh[0] + L1 * math.cos(base + bend * a), sh[1] + L1 * math.sin(base + bend * a))
    return el, (sh[0] + d * math.cos(base), sh[1] + d * math.sin(base))


def skeleton(x, gy, pose):
    cr = pose.get("crouch", 0)
    sit = pose.get("sit", 0)
    hip = (x, gy - 128 + 44 * cr + 70 * sit)
    neck = (x + pose.get("lean", 0), hip[1] - 108)
    head = (neck[0] + pose.get("hx", 0), neck[1] - 46 + pose.get("hy", 0))
    sh = (neck[0], neck[1] + 12)
    return hip, neck, head, sh


def builder(c, x, gy, pose, a=255, face=1):
    """White figure, orange hard hat, two eyes. face=+1 looks right, -1 left."""
    hip, neck, head, sh = skeleton(x, gy, pose)
    p = stroke(CHALK, LIMB, a)
    sit = pose.get("sit", 0)
    for sgn in (-1, 1):
        if sit > 0.5:
            foot = (x + sgn * 30 + 70 * face, gy - 4)
            knee = (x + sgn * 16 + 45 * face, hip[1] - 30)
        else:
            foot = (x + sgn * pose.get("spread", 24), gy - 4)
            knee, _ = ik(hip, foot, 66, 66, bend=(1 if sgn * face > 0 else -1) * -1)
        c.drawPath(skia.Path().moveTo(*hip).lineTo(*knee).lineTo(*foot), p)
    c.drawLine(*hip, *neck, p)
    hands = {}
    for key, bend in (("L", 1), ("R", -1)):
        tgt = pose.get(key) or (sh[0] + (-20 if key == "L" else 20), sh[1] + 118)
        el, hand = ik(sh, tgt, 62, 60, bend=pose.get(key + "b", bend))
        c.drawPath(skia.Path().moveTo(*sh).lineTo(*el).lineTo(*hand), p)
        hands[key] = hand
    # head
    hx, hy = head
    c.drawCircle(hx, hy, 29, fill(CHALK, a))
    # eyes
    ex = hx + 9 * face
    ey = hy + 3 + pose.get("eyes_dy", 0)
    blink = pose.get("blink", 0)
    for dx in (-8, 8):
        c.drawOval(skia.Rect.MakeXYWH(ex + dx - 3.2, ey - 5 * (1 - blink) - 0.8, 6.4, 10 * (1 - blink) + 1.6), fill(VOID, a))
    # hard hat: dome + brim
    hat = skia.Path()
    hat.addArc(skia.Rect.MakeXYWH(hx - 31, hy - 37, 62, 56), 180, 180)
    hat.close()
    c.drawPath(hat, fill(MOLTEN, a))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(hx - 36 + 4 * face, hy - 13, 72, 8), 4, 4), fill(MOLTEN, a))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(hx - 3, hy - 40, 6, 26), 3, 3), fill("#FF7A3D", a))
    return hands


# ---------------------------------------------------------------- blocks (2.5D)
BW, BH, DEP = 66, 36, 11


def block(c, cx, cy, rot=0.0, a=255, sx=1, sy=1, hot=0.0):
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.scale(sx, sy)
    w, h = BW, BH
    # shadow
    sp = fill("#000000", 120 * a / 255)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 5))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 2, -h / 2 + 6, w, h), sp)
    # top face (depth)
    top = skia.Path().moveTo(-w / 2, -h / 2).lineTo(-w / 2 + DEP, -h / 2 - DEP * 0.6) \
        .lineTo(w / 2 + DEP, -h / 2 - DEP * 0.6).lineTo(w / 2, -h / 2).close()
    c.drawPath(top, fill(BLOCK_TOP, a))
    side = skia.Path().moveTo(w / 2, -h / 2).lineTo(w / 2 + DEP, -h / 2 - DEP * 0.6) \
        .lineTo(w / 2 + DEP, h / 2 - DEP * 0.6).lineTo(w / 2, h / 2).close()
    c.drawPath(side, fill(BLOCK_DK, a))
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, -h / 2), (0, h / 2)], [C(BLOCK, a), C("#BFB8AA", a)]))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), p)
    # two cores (concrete block look)
    for dx in (-15, 15):
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(dx - 9, -7, 18, 14), 3, 3), fill("#B3AC9E", a * 0.7))
    c.restore()


# ---------------------------------------------------------------- the two towers
G = 2600.0     # gravity px/s^2


class Tower:
    def __init__(self, x0, base_y, cols, rows, t0, gap_fn, seed, sloppy):
        rnd = random.Random(seed)
        self.items = []
        t = t0
        lean = 0.0
        for r in range(rows):
            lean -= rnd.uniform(0.4, 2.8) * sloppy
            for k in range(cols):
                off = (BW / 2 if r % 2 else 0) - (BW / 4 if cols == 2 and r % 2 else 0)
                x = x0 + k * BW + (r % 2) * (BW / 2) * (0 if cols == 1 else 0.5) + lean
                y = base_y - BH / 2 - r * BH
                rot = rnd.uniform(-2.6, 2.6) * sloppy
                d = gap_fn(len(self.items))
                self.items.append(dict(x=x, y=y, rot=rot, t0=t, land=t + d * 0.9, dur=d))
                t += d * 0.55
        self.end = self.items[-1]["land"]
        self.top = self.items[-1]["y"] - BH / 2
        self.base = (sum(i["x"] for i in self.items[:cols]) / cols, base_y)

    def landed(self, t):
        return sum(1 for i in self.items if i["land"] <= t)


def toss_origin(fig_x, gy):
    return (fig_x + 46, gy - 236)


class Scene:
    LX, RX = 205, 632            # figure roots
    LT, RT = 292, 742            # tower left edges
    T_BUILD_L = 1.05
    T_DIG0, T_DIG1 = 1.0, 4.0
    T_POUR0, T_POUR1 = 4.0, 5.3
    T_BUILD_R = 5.45
    T_STORM = 9.6
    T_FLASH = 10.05
    T_SNAP = 10.95
    T_CALM = 12.6
    T_TEXT = 13.25
    T_LOGO = 15.55
    PIT_W, PIT_D = 180, 230

    def __init__(self):
        rows = 12
        self.L = Tower(self.LT, GY, 2, rows, self.T_BUILD_L, lambda i: lerp(0.34, 0.24, i / 22), 3, 1.0)
        self.R = Tower(self.RT, GY, 2, rows, self.T_BUILD_R, lambda i: lerp(0.40, 0.30, i / 22), 8, 0.18)
        self.rnd = random.Random(11)
        self._sim_collapse()
        self.dirt = [(self.rnd.uniform(0, 1), self.rnd.uniform(-1, 1)) for _ in range(90)]
        self.rain = [(self.rnd.uniform(-200, W + 200), self.rnd.uniform(0, H), self.rnd.uniform(0.7, 1.3)) for _ in range(220)]

    # --- storm sway of the left tower (rotation about its base)
    def sway(self, t):
        k = prog(t, self.T_STORM, self.T_SNAP)
        return -9.0 * e_in(k) * (0.6 + 0.4 * math.sin((t - self.T_STORM) * 9))

    def _sim_collapse(self):
        """Pre-simulate every block of the left tower after the snap (simple rigid bodies)."""
        bx, by = self.L.base
        ang0 = math.radians(self.sway(self.T_SNAP))
        self.traj = []
        dt = 1 / 240
        for i, it in enumerate(self.L.items):
            dx, dy = it["x"] - bx, it["y"] - by
            x = bx + dx * math.cos(ang0) - dy * math.sin(ang0)
            y = by + dx * math.sin(ang0) + dy * math.cos(ang0)
            h = (by - it["y"]) / (BH * 11)
            vx = -260 * h - self.rnd.uniform(40, 220) * h
            vy = -self.rnd.uniform(0, 140) * h
            w = self.rnd.uniform(-380, 120) * (0.4 + h)
            rot = it["rot"] + math.degrees(ang0)
            delay = (1 - h) * 0.12 + self.rnd.uniform(0, 0.05)
            pts, bounced, tt = [], 0, 0.0
            while tt < 3.0:
                if tt >= delay:
                    vy += G * dt
                    x += vx * dt
                    y += vy * dt
                    rot += w * dt
                    floor = GY - BH / 2 + 2
                    if y > floor:
                        y = floor
                        if bounced < 2 and abs(vy) > 120:
                            vy = -vy * 0.28
                            vx *= 0.55
                            w *= -0.4
                            bounced += 1
                            if bounced == 1:
                                it.setdefault("hits", []).append(self.T_SNAP + tt)
                        else:
                            vy, vx, w = 0, vx * 0.85, w * 0.7
                            rot = rot + (round(rot / 90) * 90 - rot) * 0.08
                    x = max(x, 40)
                pts.append((x, y, rot))
                tt += dt
            self.traj.append(pts)

    def block_state_L(self, it, i, t):
        if t < self.T_SNAP:
            bx, by = self.L.base
            a = math.radians(self.sway(t))
            dx, dy = it["x"] - bx, it["y"] - by
            return (bx + dx * math.cos(a) - dy * math.sin(a), by + dx * math.sin(a) + dy * math.cos(a),
                    it["rot"] + math.degrees(a))
        pts = self.traj[i]
        j = min(len(pts) - 1, int((t - self.T_SNAP) * 240))
        return pts[j]

    # ------------------------------------------------------------ draw
    def draw_ground(self, c, t):
        # earth cross-section under the line
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, GY), (0, H)], [C(EARTH2), C(VOID)]))
        c.drawRect(skia.Rect.MakeXYWH(0, GY, W, H - GY), p)
        for i in range(7):
            y = GY + 70 + i * 62
            c.drawLine(0, y, W, y + (i % 2) * 6, stroke("#1C1A16", 2, 160 - i * 18))
        # the pit on the right
        kd = e_io(prog(t, self.T_DIG0, self.T_DIG1))
        px = self.RT - 18
        pw = self.PIT_W
        depth = self.PIT_D * kd
        if depth > 1:
            c.drawRect(skia.Rect.MakeXYWH(px, GY, pw, depth), fill("#050505"))
            c.drawRect(skia.Rect.MakeXYWH(px, GY, pw, depth), stroke("#3A362E", 2))
        # rebar before the pour
        kr = prog(t, self.T_DIG1 - 0.25, self.T_DIG1 + 0.1)
        if kr > 0 and depth > 10:
            for i in range(5):
                x = px + 22 + i * (pw - 44) / 4
                c.drawLine(x, GY + depth - 10, x, GY + depth - 10 - (depth - 20) * kr, stroke("#8C8578", 3))
        # pour: molten concrete rising, cooling to grey
        kp = prog(t, self.T_POUR0, self.T_POUR1)
        if kp > 0:
            lvl = self.PIT_D * e_io(kp)
            cool = prog(t, self.T_POUR1 - 0.2, self.T_POUR1 + 1.8)
            col = mixc(MOLTEN, "#8F887B", cool)
            r = skia.Rect.MakeXYWH(px + 1, GY + self.PIT_D - lvl, pw - 2, lvl)
            gp = skia.Paint(AntiAlias=True)
            gp.setShader(skia.GradientShader.MakeLinear([(0, GY), (0, GY + self.PIT_D)],
                                                        [C(mixc(HOT, "#A39C8E", cool)), C(col)]))
            c.drawRect(r, gp)
            if cool < 1:   # surface shimmer
                yy = GY + self.PIT_D - lvl
                c.drawLine(px + 2, yy, px + pw - 2, yy, stroke(HOT, 3, 255 * (1 - cool)))
        # load path glow in the footing when the storm hits the right tower
        kg = prog(t, self.T_FLASH, self.T_FLASH + 0.4) * (1 - prog(t, self.T_CALM, self.T_CALM + 0.8))
        if kg > 0:
            for i in range(3):
                ph = ((t * 1.6 + i / 3) % 1)
                y = lerp(GY - 300, GY + self.PIT_D - 20, ph)
                x = self.RT + BW
                gp = fill(MOLTEN, 220 * kg * math.sin(math.pi * ph))
                gp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 4))
                c.drawPath(skia.Path().moveTo(x - 16, y - 10).lineTo(x, y + 6).lineTo(x + 16, y - 10), stroke(MOLTEN, 5, 230 * kg * math.sin(math.pi * ph)))
        # dirt pile (right of pit)
        pile = 46 * kd
        if pile > 1:
            path = skia.Path().moveTo(self.RT + pw - 14, GY).quadTo(self.RT + pw + 30, GY - pile * 1.7, self.RT + pw + 80, GY).close()
            c.drawPath(path, fill("#4A4234"))
        # the line
        lp = stroke(CHALK, 3, 235)
        c.drawLine(40, GY, px, GY, lp)
        c.drawLine(px + pw, GY, W - 40, GY, lp)
        if t > self.T_POUR1:
            c.drawLine(px, GY, px + pw, GY, stroke(CHALK, 3, 235 * prog(t, self.T_POUR1, self.T_POUR1 + 0.6)))

    def draw_dirt(self, c, t):
        # shovelfuls of dirt flying out of the pit
        if not (self.T_DIG0 < t < self.T_DIG1 + 0.6):
            return
        period = 0.6
        for n in range(int((self.T_DIG1 - self.T_DIG0) / period)):
            ts = self.T_DIG0 + 0.3 + n * period
            k = prog(t, ts, ts + 0.5)
            if 0 < k < 1:
                for j, (u, v) in enumerate(self.dirt[n * 9:(n + 1) * 9]):
                    p0 = (self.RX + 60, GY - 30)
                    p2 = (self.RT + self.PIT_W + 10 + u * 50, GY - 6)
                    p1 = (lerp(p0[0], p2[0], .5), GY - 160 - 40 * v)
                    pos = bez(p0, p1, p2, k)
                    c.drawCircle(pos[0] + v * 8, pos[1], 4 + 2 * u, fill("#6B604C", 255))

    def left_pose(self, t):
        rest = {"L": (self.LX - 26, GY - 140), "R": (self.LX + 26, GY - 140)}
        if t >= self.T_SNAP + 0.9:                     # sits in the rubble
            k = e_io(prog(t, self.T_SNAP + 0.9, self.T_SNAP + 1.6))
            return {"sit": k, "L": (self.LX + 30, GY - 96 + 0 * k), "R": (self.LX + 60, GY - 92), "hy": 10 * k,
                    "eyes_dy": 4 * k, "lean": 14 * k}
        if t >= self.T_STORM:                           # looks up, worried
            k = e_io(prog(t, self.T_STORM, self.T_STORM + 0.5))
            return {"L": (self.LX - 40, GY - 160), "R": (self.LX + 10, GY - 210 * k - 130 * (1 - k)), "hy": -6 * k,
                    "eyes_dy": -5 * k}
        for it in self.L.items:
            if it["t0"] <= t < it["t0"] + it["dur"] * 0.45:
                ph = (t - it["t0"]) / (it["dur"] * 0.45)
                up = toss_origin(self.LX, GY)
                hand = lerp2((self.LX + 40, GY - 130), up, e_out(ph))
                return {"L": (self.LX - 10, GY - 170 - 50 * ph), "R": hand, "lean": 8 * ph, "eyes_dy": -4}
        if self.T_BUILD_L <= t < self.L.end + 0.3:
            return {"L": (self.LX - 10, GY - 160), "R": (self.LX + 40, GY - 150), "eyes_dy": -4}
        if self.L.end + 0.3 <= t < self.T_STORM:      # proud: hands on hips
            return {"L": (self.LX - 34, GY - 128), "R": (self.LX + 34, GY - 128), "hy": -3}
        return rest

    def right_pose(self, t):
        rest = {"L": (self.RX - 26, GY - 140), "R": (self.RX + 26, GY - 140)}
        if self.T_DIG0 <= t < self.T_DIG1:              # shovel cycle
            ph = ((t - self.T_DIG0) / 0.6) % 1
            dig = math.sin(ph * math.pi * 2) * 0.5 + 0.5
            return {"L": (self.RX + 30 + 30 * dig, GY - 120 + 50 * dig), "R": (self.RX + 70 + 40 * dig, GY - 60 + 40 * dig),
                    "crouch": 0.35 + 0.25 * dig, "lean": 26 * dig, "hy": 8, "eyes_dy": 5}
        if self.T_POUR0 <= t < self.T_POUR1 + 0.3:      # watches the pour
            return {"L": (self.RX - 30, GY - 120), "R": (self.RX + 30, GY - 120), "hy": 8, "hx": 6, "eyes_dy": 6}
        for it in self.R.items:
            if it["t0"] <= t < it["t0"] + it["dur"] * 0.45:
                ph = (t - it["t0"]) / (it["dur"] * 0.45)
                hand = lerp2((self.RX + 40, GY - 130), toss_origin(self.RX, GY), e_out(ph))
                return {"L": (self.RX - 10, GY - 170 - 40 * ph), "R": hand, "lean": 6 * ph}
        if t >= self.T_STORM:                            # steady, hands on hips
            k = e_io(prog(t, self.T_CALM, self.T_CALM + 0.6))
            return {"L": (self.RX - 34, GY - 128), "R": (self.RX + 34, GY - 128), "hy": -4 * k}
        return rest

    def draw_shovel(self, c, hands, t):
        if not (self.T_DIG0 <= t < self.T_DIG1):
            return
        a, b = hands["L"], hands["R"]
        ux, uy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(ux, uy) or 1
        ux, uy = ux / L, uy / L
        tip = (b[0] + ux * 70, b[1] + uy * 70)
        c.drawLine(a[0] - ux * 30, a[1] - uy * 30, tip[0], tip[1], stroke("#8C8578", 6))
        c.save()
        c.translate(*tip)
        c.rotate(math.degrees(math.atan2(uy, ux)))
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-4, -15, 34, 30), 6, 6), fill("#9A9384"))
        c.restore()

    def draw_tower(self, c, tower, t, which):
        for i, it in enumerate(tower.items):
            if t < it["t0"] + it["dur"] * 0.45:
                continue
            if t < it["land"]:      # flying in from the hands
                fig = self.LX if which == "L" else self.RX
                p0 = toss_origin(fig, GY)
                p2 = (it["x"] + BW / 2, it["y"])
                p1 = (lerp(p0[0], p2[0], .5), min(p0[1], p2[1]) - 140)
                k = prog(t, it["t0"] + it["dur"] * 0.45, it["land"])
                pos = bez(p0, p1, p2, e_out(k) * 0.3 + k * 0.7)
                block(c, pos[0], pos[1], rot=lerp(-30, it["rot"], e_out(k)))
                continue
            kq = prog(t, it["land"], it["land"] + 0.13)
            sq = math.sin(math.pi * kq)
            if which == "L":
                x, y, r = self.block_state_L(it, i, t)
                block(c, x + BW / 2 * (1 if t < self.T_SNAP else 0), y + 3 * sq, r, sx=1 + 0.05 * sq, sy=1 - 0.1 * sq)
            else:
                wob = math.sin((t - self.T_STORM) * 11) * 0.7 * prog(t, self.T_STORM, self.T_FLASH) * (1 - prog(t, self.T_CALM - 0.6, self.T_CALM))
                bx, by = tower.base
                a = math.radians(wob)
                dx, dy = it["x"] - bx, it["y"] - by
                x = bx + dx * math.cos(a) - dy * math.sin(a)
                y = by + dx * math.sin(a) + dy * math.cos(a)
                block(c, x + BW / 2, y + 3 * sq, it["rot"] + wob, sx=1 + 0.05 * sq, sy=1 - 0.1 * sq)

    def draw_dust(self, c, t):
        for it in self.L.items + self.R.items:
            kd = prog(t, it["land"], it["land"] + 0.4)
            if 0 < kd < 1 and t < self.T_SNAP:
                for j in range(4):
                    s = -1 if j % 2 else 1
                    r = 6 + 26 * e_out(kd)
                    c.drawCircle(it["x"] + BW / 2 + s * (BW / 2 + r * 0.5), it["y"] + BH / 2 - 2 - r * 0.2 * j,
                                 2.4 * (1 - kd) + 0.8, fill("#8A857A", 200 * (1 - kd)))
        # collapse dust cloud
        kc = prog(t, self.T_SNAP + 0.3, self.T_SNAP + 2.2)
        if 0 < kc < 1:
            for j in range(26):
                u = (j * 0.618) % 1
                x = lerp(60, 470, u)
                r = 18 + 70 * e_out(kc) * (0.5 + u)
                p = fill("#6B665C", 70 * (1 - kc))
                p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18))
                c.drawCircle(x, GY - 20 - 60 * e_out(kc) * u, r, p)

    def draw_storm(self, c, t):
        ks = prog(t, self.T_STORM - 0.3, self.T_STORM + 0.6) * (1 - prog(t, self.T_CALM, self.T_CALM + 0.9))
        if ks <= 0:
            return
        # darken
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill("#02030A", 110 * ks))
        # rain
        rp = stroke("#9FA7B8", 2, 110 * ks)
        for x, y, s in self.rain:
            yy = (y + t * 1900 * s) % (H + 200) - 100
            xx = x - (yy * 0.22)
            if yy < GY:
                c.drawLine(xx, yy, xx - 9 * s, yy + 38 * s, rp)
        # lightning flash
        kf = prog(t, self.T_FLASH, self.T_FLASH + 0.35)
        if 0 < kf < 1:
            flick = 1 if (kf < 0.12 or 0.22 < kf < 0.3) else 0.35
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill("#D9E2FF", 150 * (1 - kf) * flick))

    def draw_labels(self, c, t):
        k = e_out(prog(t, 0.2, 0.9)) * (1 - prog(t, self.T_TEXT - 0.4, self.T_TEXT))
        deep = int(6 * prog(t, self.T_DIG0, self.T_POUR1))
        B.lane_label(c, 300, 760, "SHORTCUT", "0 m DEEP", GRAPH, 255 * k)
        B.lane_label(c, 760, 760, "FOUNDATION", f"{deep} m DEEP", MOLTEN if deep else GRAPH, 255 * k, hero=True)

    def draw_hud(self, c, t):
        k = 1 - prog(t, self.T_TEXT - 0.4, self.T_TEXT)
        B.title(c, "WHO'S STILL STANDING?", 300, 255 * k)
        d = 1 + int(179 * e_sine(prog(t, 1.0, self.T_STORM)))
        label = f"DAY {d:03d}" if t < self.T_STORM else "DAY 180  ·  THE STORM"
        text(c, label, 540, 366, font("mono", 28), MOLTEN if t >= self.T_STORM else GRAPH, 255 * k, "c", tracking=6)
        # wind meter during the storm
        kw = prog(t, self.T_STORM - 0.2, self.T_STORM + 0.4) * (1 - prog(t, self.T_CALM, self.T_CALM + 0.5)) * k
        if kw > 0:
            wind = e_io(prog(t, self.T_STORM, self.T_SNAP))
            B.meter(c, 340, 430, 400, wind, "WIND LOAD", f"{int(140 * wind):3d} km/h", MOLTEN, 255 * kw)

    def draw_end(self, c, t):
        if t >= self.T_TEXT:
            B.verdict(c, t, self.T_TEXT + 0.1, "Fast gets seen.", "Deep gets to stay.", 400, self.T_LOGO)
        B.sting(c, t, self.T_LOGO)

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        storm = prog(t, self.T_STORM - .3, self.T_STORM + .6) * (1 - prog(t, self.T_CALM, self.T_CALM + .9))
        B.sky(c, storm)

        # camera: gentle push-in, shake on the collapse
        z = 1.28 * (1 + 0.035 * e_sine(prog(t, 0, self.T_TEXT)))
        sx = sy = 0
        ks = prog(t, self.T_SNAP + 0.25, self.T_SNAP + 1.0)
        if 0 < ks < 1:
            sx = 9 * (1 - ks) * math.sin(t * 83)
            sy = 7 * (1 - ks) * math.cos(t * 71)
        kf = prog(t, self.T_FLASH, self.T_FLASH + 0.2)
        if 0 < kf < 1:
            sx += 4 * (1 - kf) * math.sin(t * 120)
        c.save()
        c.translate(W / 2 + sx, GY - 120 + sy)
        c.scale(z, z)
        c.translate(-W / 2, -(GY - 120))

        flick = 0.35 if (self.T_FLASH < t < self.T_FLASH + 0.5 and int(t * 30) % 3 == 0) else 1.0
        B.lamp(c, 300, 560, 700, GY, (1 - 0.55 * storm) * flick)
        B.lamp(c, 760, 560, 700, GY, (1 - 0.25 * storm) * flick, warm=True)
        self.draw_ground(c, t)
        self.draw_tower(c, self.R, t, "R")
        self.draw_tower(c, self.L, t, "L")
        self.draw_dust(c, t)
        self.draw_dirt(c, t)
        lp = self.left_pose(t)
        if t >= self.T_SNAP + 0.9:
            lp["sad"] = True
        B.figure(c, self.LX, GY, {**lp, "blink": B.blink_at(t, 3.7)}, hero=False)
        info = B.figure(c, self.RX, GY, {**self.right_pose(t), "blink": B.blink_at(t, 4.3, 1.1)}, hero=True)
        self.draw_shovel(c, info["hands"], t)
        self.draw_labels(c, t)
        c.restore()

        self.draw_storm(c, t)
        self.draw_hud(c, t)
        self.draw_end(c, t)
        return B.finish(surf, 1, t, self.T_LOGO, DUR)

    # ------------------------------------------------------------ sound cues
    def events(self):
        ev = {"landL": [], "landR": [], "toss": [], "dig": [], "hits": [], "pour": (self.T_POUR0, self.T_POUR1),
              "storm": (self.T_STORM - 0.3, self.T_CALM + 0.9), "thunder": self.T_FLASH, "creak": (self.T_STORM + 0.4, self.T_SNAP),
              "snap": self.T_SNAP, "text": self.T_TEXT, "logo": self.T_LOGO + B.STING_HIT}
        for i, it in enumerate(self.L.items):
            ev["landL"].append((it["land"], i / len(self.L.items)))
            ev["toss"].append(it["t0"] + it["dur"] * 0.45)
            ev["hits"] += it.get("hits", [])
        for i, it in enumerate(self.R.items):
            ev["landR"].append((it["land"], i / len(self.R.items)))
            ev["toss"].append(it["t0"] + it["dur"] * 0.45)
        n = int((self.T_DIG1 - self.T_DIG0) / 0.6)
        ev["dig"] = [self.T_DIG0 + 0.3 + i * 0.6 for i in range(n)]
        return ev


SCENE = Scene()

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "stills":
        from PIL import Image
        for s in sys.argv[2:]:
            Image.fromarray(SCENE.frame(float(s))).save(os.path.join(HERE, "frames", f"s_{float(s):05.2f}.png"))
        print("ok")
    elif mode == "video":
        out = os.path.join(HERE, "out", "storm_video.tmp.mp4")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
               "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17",
               "-pix_fmt", "yuv420p", out]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(int(DUR * FPS)):
            p.stdin.write(SCENE.frame(i / FPS).tobytes())
        p.stdin.close()
        sys.exit(p.wait())
