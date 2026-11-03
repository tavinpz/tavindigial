"""LOADBEARING v2 pilot — "Perfectionist vs Builder" (Skia, 60 fps).

python3 pilot.py stills 2 6 11 12.5 14 17   -> PNG checks in frames/
python3 pilot.py video                      -> out/pilot.mp4
"""
import math
import os
import random
import subprocess
import sys

import numpy as np
import skia

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 60
DUR = 18.0
GY = 1380                      # ground line

# ---------------------------------------------------------------- palette
def C(hexs, a=255):
    hexs = hexs.lstrip("#")
    return skia.Color(int(hexs[0:2], 16), int(hexs[2:4], 16), int(hexs[4:6], 16), a)

VOID = "#070708"
CHALK = "#EEEAE2"
BRICK = "#E4DED2"
BRICK_DK = "#BDB6A8"
GRAPH = "#7C7C80"
MOLTEN = "#FF4D00"

TF = {k: skia.Typeface.MakeFromFile(os.path.join(HERE, f)) for k, f in {
    "black": "InterDisplay-Black.otf", "bold": "InterDisplay-Bold.otf",
    "mono": "JetBrainsMono-Regular.ttf", "monob": "JetBrainsMono-Bold.ttf"}.items()}


def font(k, size):
    f = skia.Font(TF[k], size)
    f.setSubpixel(True)
    f.setEdging(skia.Font.Edging.kSubpixelAntiAlias)
    return f


# ---------------------------------------------------------------- easing
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


def lerp(a, b, k):
    return a + (b - a) * k


def lerp2(p, q, k):
    return (lerp(p[0], q[0], k), lerp(p[1], q[1], k))


def bez(p0, p1, p2, k):
    a = lerp2(p0, p1, k)
    b = lerp2(p1, p2, k)
    return lerp2(a, b, k)


# ---------------------------------------------------------------- paints
def fill(col, a=255):
    return skia.Paint(AntiAlias=True, Color=C(col, a))


def stroke(col, w, a=255):
    return skia.Paint(AntiAlias=True, Color=C(col, a), Style=skia.Paint.kStroke_Style,
                      StrokeWidth=w, StrokeCap=skia.Paint.kRound_Cap, StrokeJoin=skia.Paint.kRound_Join)


def text(c, s, x, y, f, col, a=255, align="l", tracking=0.0):
    if tracking:
        w = sum(f.measureText(ch) for ch in s) + tracking * (len(s) - 1)
    else:
        w = f.measureText(s)
    if align == "c":
        x -= w / 2
    elif align == "r":
        x -= w
    p = fill(col, int(a))
    if tracking:
        for ch in s:
            c.drawString(ch, x, y, f, p)
            x += f.measureText(ch) + tracking
    else:
        c.drawString(s, x, y, f, p)
    return w


# ---------------------------------------------------------------- figure
LIMB = 13
UPPER, LOWER = 66, 64


def ik(sh, target, L1=UPPER, L2=LOWER, bend=1):
    dx, dy = target[0] - sh[0], target[1] - sh[1]
    d = clamp(math.hypot(dx, dy), 1, L1 + L2 - 0.5)
    base = math.atan2(dy, dx)
    a = math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    el = (sh[0] + L1 * math.cos(base + bend * a), sh[1] + L1 * math.sin(base + bend * a))
    hand = (sh[0] + d * math.cos(base), sh[1] + d * math.sin(base))
    return el, hand


def figure(c, x, pose, col=CHALK, a=255):
    """pose: lean (px), crouch (0..1), handL/handR targets, headdx/headdy, feet spread."""
    crouch = pose.get("crouch", 0)
    hip = (x, GY - 132 + 40 * crouch)
    neck = (x + pose.get("lean", 0), hip[1] - 112 + 6 * crouch)
    head = (neck[0] + pose.get("headdx", 0), neck[1] - 44 + pose.get("headdy", 0))
    p = stroke(col, LIMB, a)
    # legs
    for sgn in (-1, 1):
        foot = (x + sgn * pose.get("spread", 24), GY - 2)
        knee_t = foot
        el, _ = ik(hip, knee_t, 68, 66, bend=-sgn if crouch < 0.05 else (1 if sgn > 0 else -1) * -1)
        c.drawPath(skia.Path().moveTo(*hip).lineTo(*el).lineTo(*foot), p)
    # torso
    c.drawLine(*hip, *neck, p)
    # arms
    sh = (neck[0], neck[1] + 10)
    for key, bend in (("handL", 1), ("handR", -1)):
        tgt = pose.get(key)
        if tgt is None:
            tgt = (sh[0] + (-18 if key == "handL" else 18), sh[1] + 120)
        el, hand = ik(sh, tgt, bend=pose.get(key + "_bend", bend))
        c.drawPath(skia.Path().moveTo(*sh).lineTo(*el).lineTo(*hand), p)
    c.drawCircle(head[0], head[1], 27, fill(col, a))
    return {"sh": sh, "head": head}


def hand_of(x, pose, key):
    crouch = pose.get("crouch", 0)
    hip = (x, GY - 132 + 40 * crouch)
    neck = (x + pose.get("lean", 0), hip[1] - 112 + 6 * crouch)
    sh = (neck[0], neck[1] + 10)
    _, hand = ik(sh, pose[key])
    return hand


# ---------------------------------------------------------------- bricks
BW, BH, GAP = 70, 32, 5


def brick(c, cx, cy, w=BW, h=BH, rot=0.0, sx=1.0, sy=1.0, a=255, shadow=True, col=BRICK):
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.scale(sx, sy)
    r = skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h)
    if shadow:
        sp = fill("#000000", int(150 * a / 255))
        sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6))
        c.drawRRect(skia.RRect.MakeRectXY(r.makeOffset(0, 5), 4, 4), sp)
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, -h / 2), (0, h / 2)], [C(col, a), C(BRICK_DK, a)]))
    c.drawRRect(skia.RRect.MakeRectXY(r, 4, 4), p)
    # top highlight
    c.drawLine(-w / 2 + 5, -h / 2 + 2, w / 2 - 5, -h / 2 + 2, stroke("#FFFFFF", 2, int(90 * a / 255)))
    c.restore()


class Builder:
    """Right lane: tosses bricks into a running-bond wall."""
    X = 640                    # figure root
    WX = 742                   # wall left edge
    PILE = (585, GY - 16)

    def __init__(self):
        rnd = random.Random(4)
        self.bricks = []
        rows = 10
        for r in range(rows):
            y = GY - BH / 2 - r * (BH + GAP) - 1
            if r % 2 == 0:
                xs = [(self.WX + i * (BW + GAP) + BW / 2, BW) for i in range(3)]
            else:
                hw = (BW - GAP) / 2
                xs = [(self.WX + hw / 2, hw)] + [(self.WX + hw + GAP + i * (BW + GAP) + BW / 2, BW) for i in range(2)] \
                    + [(self.WX + hw + GAP + 2 * (BW + GAP) + hw / 2, hw)]
            for x, w in xs:
                self.bricks.append(dict(x=x + rnd.uniform(-1.5, 1.5), y=y, w=w,
                                        rot=rnd.uniform(-1.6, 1.6)))
        # schedule: accelerating rhythm
        t, n = 1.25, len(self.bricks)
        for i, b in enumerate(self.bricks):
            dur = lerp(0.62, 0.40, e_sine(i / (n - 1)))
            b["t0"] = t
            b["dur"] = dur
            b["land"] = t + dur * 0.92
            t += dur * (0.72 if i < 6 else 0.62)
        self.done = self.bricks[-1]["land"]
        self.wall_top = self.bricks[-1]["y"] - BH / 2

    def count(self, t):
        return sum(1 for b in self.bricks if t >= b["land"])

    def pose(self, t):
        rest = {"handL": (self.X - 30, GY - 140), "handR": (self.X + 34, GY - 150), "spread": 26}
        active = [b for b in self.bricks if b["t0"] <= t < b["t0"] + b["dur"] * 0.62]
        if t >= self.done + 0.25:   # celebration
            k = e_back(prog(t, self.done + 0.25, self.done + 0.7), 1.3)
            nk = 1 - prog(t, 12.9, 13.4)
            up_l = (self.X - 70, GY - 400)
            up_r = (self.X + 60, GY - 405)
            return {"handL": lerp2(rest["handL"], up_l, k * nk), "handR": lerp2(rest["handR"], up_r, k * nk),
                    "headdy": -6 * k * nk, "spread": 26}
        if not active:
            return rest
        b = active[-1]
        ph = (t - b["t0"]) / b["dur"]
        pick = (self.PILE[0] + 4, self.PILE[1] - 18)
        rel = self.release_point(b)
        if ph < 0.30:          # reach down to the pile
            k = e_io(ph / 0.30)
            hand = lerp2(rest["handR"], pick, k)
            crouch = 0.55 * k
            lean = -26 * k
        elif ph < 0.62:        # swing up and release
            k = e_io((ph - 0.30) / 0.32)
            hand = lerp2(pick, rel, k)
            crouch = 0.55 * (1 - k)
            lean = lerp(-26, 10, k)
        else:
            hand, crouch, lean = rel, 0, 10
        return {"handL": (self.X - 30, GY - 150 + 30 * crouch), "handR": hand, "handR_bend": 1,
                "crouch": crouch, "lean": lean, "spread": 26 + 8 * crouch,
                "headdx": 6 if ph > 0.3 else -4}

    def release_point(self, b):
        tgt_y = b["y"]
        return (self.X + 70, clamp(tgt_y - 40, GY - 360, GY - 170))

    def draw(self, c, t):
        # pile
        for i in range(3):
            brick(c, self.PILE[0] - 6 + (i % 2) * 8, GY - BH / 2 - i * (BH + 2) - 1, rot=(i - 1) * 2)
        pose = self.pose(t)
        # bricks: landed + in flight
        flying = []
        for b in self.bricks:
            if t >= b["land"]:
                k = prog(t, b["land"], b["land"] + 0.14)
                sy = 1 - 0.12 * math.sin(math.pi * k)
                sx = 1 + 0.05 * math.sin(math.pi * k)
                brick(c, b["x"], b["y"] + (BH / 2) * (1 - sy), b["w"], rot=b["rot"], sx=sx, sy=sy)
            elif t >= b["t0"]:
                flying.append(b)
        for b in flying:
            ph = (t - b["t0"]) / b["dur"]
            if ph < 0.30:
                continue  # still on the pile
            if ph < 0.62:
                hpos = hand_of(self.X, pose, "handR") if pose.get("handR") else self.release_point(b)
                brick(c, hpos[0] + 8, hpos[1] - 6, b["w"], rot=-10 + 10 * prog(ph, .3, .62))
            else:
                k = (ph - 0.62) / (0.92 - 0.62)
                k = clamp(k)
                p0 = self.release_point(b)
                p0 = (p0[0] + 8, p0[1] - 6)
                p2 = (b["x"], b["y"])
                p1 = ((p0[0] + p2[0]) / 2, min(p0[1], p2[1]) - 110)
                pos = bez(p0, p1, p2, e_out(k) * 0.35 + k * 0.65)
                brick(c, pos[0], pos[1], b["w"], rot=lerp(-25, b["rot"], e_out(k)))
        # dust on landing
        for b in self.bricks:
            kd = prog(t, b["land"], b["land"] + 0.45)
            if 0 < kd < 1:
                for j in range(5):
                    ang = math.pi * (0.1 + 0.2 * j)
                    r = 8 + 30 * e_out(kd)
                    x = b["x"] + math.cos(ang) * r * (1 if j % 2 else -1) * 1.4
                    y = b["y"] + BH / 2 - 4 - math.sin(ang) * r * 0.35
                    c.drawCircle(x, y, 3.2 * (1 - kd) + 0.8, fill(GRAPH, int(200 * (1 - kd))))
        # flag on top when done
        if t >= self.done + 0.1:
            k = e_out(prog(t, self.done + 0.1, self.done + 0.5))
            fx = self.WX + 1.5 * (BW + GAP) + 0
            base = self.wall_top - 1
            top = base - 120 * k
            c.drawLine(fx, base, fx, top, stroke(CHALK, 5))
            if k > 0.6:
                kf = e_back(prog(t, self.done + 0.35, self.done + 0.75), 1.4)
                wave = math.sin(t * 7) * 4
                path = skia.Path().moveTo(fx + 2, top + 2).lineTo(fx + 2 + 70 * kf, top + 18 + wave).lineTo(fx + 2, top + 38)
                path.close()
                c.drawPath(path, fill(MOLTEN))
        figure(c, self.X, pose)


class Perfectionist:
    """Left lane: one brick, adjusted forever."""
    X = 180
    BX = 300

    def __init__(self):
        self.t_place = 1.5
        # adjust cycles (start, kind)
        self.cycles = [(2.2, "adjust"), (4.4, "adjust"), (6.6, "discard"), (8.9, "adjust"), (11.1, "adjust")]

    def count(self, t):
        if t < self.t_place + 0.5:
            return 0
        for s, kind in self.cycles:
            if kind == "discard" and s + 0.55 <= t < s + 1.55:
                return 0
        return 1

    def state(self, t):
        """Brick transform + pose."""
        rest = {"handL": (self.X - 24, GY - 142), "handR": (self.X + 26, GY - 146), "spread": 24}
        bx, by, rot, lift, alpha = self.BX, GY - BH / 2 - 1, 0.0, 0.0, 255
        pose = dict(rest)
        level = 0.0
        if t < self.t_place:
            return pose, None, 0
        # initial placement
        kp = prog(t, self.t_place, self.t_place + 0.5)
        if kp < 1:
            y = lerp(GY - 220, by, e_in(kp))
            pose = {"handR": (bx - 10, y - 10), "handL": rest["handL"], "crouch": 0.4 * kp, "lean": 18, "spread": 24}
            return pose, (bx, y, -6 * (1 - kp), 255), 0
        for s, kind in self.cycles:
            if s <= t < s + 2.1:
                ph = t - s
                if kind == "adjust":
                    # reach, lift, rotate, set, level check
                    reach = e_io(prog(ph, 0, 0.35))
                    up = math.sin(math.pi * prog(ph, 0.35, 0.95))
                    lift = 16 * up
                    rot = 3.5 * math.sin(math.pi * prog(ph, 0.35, 0.95) * 2)
                    hand = lerp2(rest["handR"], (bx - 6, by - BH / 2 - lift), reach)
                    if ph > 1.0:
                        hand = lerp2((bx - 6, by - BH / 2), rest["handR"], e_io(prog(ph, 1.0, 1.4)))
                    level = math.sin(math.pi * prog(ph, 0.95, 2.05))
                    pose = {"handR": hand, "handL": rest["handL"], "crouch": 0.45 * reach * (1 - prog(ph, 1.0, 1.4)),
                            "lean": 20 * reach, "spread": 24, "headdy": 10 * level, "headdx": 8 * level}
                else:  # discard: toss it back over the shoulder, place a new one
                    if ph < 0.55:
                        k = e_io(ph / 0.55)
                        hand = lerp2(rest["handR"], (bx - 6, by - BH / 2), k)
                        pose = {"handR": hand, "handL": rest["handL"], "crouch": 0.45 * k, "lean": 20 * k, "spread": 24}
                    elif ph < 1.05:
                        k = (ph - 0.55) / 0.5
                        p0 = (bx - 6, by - 8)
                        p2 = (-80, GY - 60)
                        pos = bez(p0, (120, GY - 420), p2, e_in(k) * 0.4 + k * 0.6)
                        pose = {"handR": lerp2((bx - 6, by - BH / 2), (self.X - 40, GY - 330), e_out(k)),
                                "handL": rest["handL"], "spread": 24, "lean": -10}
                        return pose, (pos[0], pos[1], -260 * k, 255), 0
                    elif ph < 1.55:
                        pose = {"handR": lerp2((self.X - 40, GY - 330), rest["handR"], e_io((ph - 1.05) / .5)),
                                "handL": rest["handL"], "spread": 24}
                        return pose, None, 0
                    else:
                        k = prog(ph, 1.55, 2.05)
                        y = lerp(GY - 200, by, e_in(k))
                        pose = {"handR": (bx - 10, y - 10), "handL": rest["handL"], "crouch": 0.4 * k, "lean": 18, "spread": 24}
                        return pose, (bx, y, 0, 255), 0
                break
        if t >= 12.6:   # look up at the tower
            k = e_io(prog(t, 12.6, 13.2))
            pose = {"handL": rest["handL"], "handR": rest["handR"], "spread": 24, "headdx": 10 * k, "headdy": -10 * k}
        return pose, (bx, by - lift, rot, alpha), level

    def draw(self, c, t):
        pose, b, level = self.state(t)
        if b is not None:
            brick(c, b[0], b[1], rot=b[2], col="#F2EEE6")
        if level > 0.02 and b is not None:
            # spirit level hovering on the brick, bubble searching for the centre
            a = int(255 * clamp(level * 1.6))
            lx, ly = b[0], b[1] - BH / 2 - 14
            c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(lx - 52, ly - 9, 104, 18), 6, 6), stroke(CHALK, 3, a))
            c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(lx - 18, ly - 5, 36, 10), 5, 5), stroke(GRAPH, 2, a))
            bub = lx + 12 * math.sin(t * 9.0) * (1 - 0.6 * level)
            c.drawCircle(bub, ly, 4, fill(MOLTEN if abs(bub - lx) > 4 else CHALK, a))
        figure(c, self.X, pose)


# ---------------------------------------------------------------- logo (provisional: 3 bricks)
def mark(c, cx, cy, s=1.0, k=1.0):
    """Three-brick mark, top brick Molten = the one you lay today."""
    w, h, g = 92 * s, 40 * s, 8 * s
    rows = [(cx - (w + g) / 2, cy + h + g, CHALK), (cx + (w + g) / 2, cy + h + g, CHALK), (cx, cy, MOLTEN)]
    for i, (x, y, col) in enumerate(rows):
        kk = e_back(prog(k, i * 0.25, i * 0.25 + 0.5), 1.4)
        if kk <= 0:
            continue
        yy = y - 60 * s * (1 - kk)
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x - w / 2, yy - h / 2, w, h), 5 * s, 5 * s),
                    fill(col, int(255 * clamp(kk * 1.5))))


# ---------------------------------------------------------------- scene
BUILDER = Builder()
PERF = Perfectionist()
T_VERDICT = 13.4
T_LOGO = 16.1


def background(c, t):
    c.clear(C(VOID))
    # two soft spotlights on the lanes
    for x, k in ((270, 1.0), (810, 1.0)):
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeRadial((x, GY - 200), 560, [C("#18181B", 255), C(VOID, 0)]))
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), p)
    # floor reflection band
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, GY), (0, GY + 260)], [C("#141416"), C(VOID, 0)]))
    c.drawRect(skia.Rect.MakeXYWH(0, GY, W, 260), p)


def frame(t):
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    background(c, t)

    # slow cinematic push-in
    z = 1 + 0.035 * e_sine(prog(t, 0, 13.0))
    c.save()
    c.translate(W / 2, GY - 250)
    c.scale(z, z)
    c.translate(-W / 2, -(GY - 250))

    kin = e_out(prog(t, 0, 0.8))
    # ground + divider
    c.drawLine(60 + (1 - kin) * 480, GY, 1020 - (1 - kin) * 480, GY, stroke(CHALK, 3, 230))
    dp = stroke(GRAPH, 2, int(110 * kin))
    dp.setPathEffect(skia.DashPathEffect.Make([10, 12], 0))
    c.drawLine(540, GY - 700, 540, GY + 170, dp)

    PERF.draw(c, t)
    BUILDER.draw(c, t)

    # counters under each lane
    lab = font("mono", 24)
    big = font("black", 92)
    for x, name, n, col in ((270, "PERFECTIONIST", PERF.count(t), CHALK), (810, "BUILDER", BUILDER.count(t), CHALK)):
        text(c, name, x, GY + 62, lab, GRAPH, 255 * kin, "c", tracking=4)
        pop = 0
        if name == "BUILDER":
            for b in BUILDER.bricks:
                kp = prog(t, b["land"], b["land"] + 0.12)
                if 0 < kp < 1:
                    pop = math.sin(math.pi * kp)
        c.save()
        c.translate(x, GY + 168)
        c.scale(1 + 0.08 * pop, 1 + 0.08 * pop)
        text(c, str(n), 0, 0, big, col, 255 * kin, "c")
        c.restore()
        text(c, "bricks", x, GY + 206, font("mono", 22), GRAPH, 200 * kin, "c", tracking=3)
    c.restore()

    # top: hook + day counter (HUD, not zoomed)
    text(c, "SAME 100 DAYS.", 540, 330, font("black", 88), CHALK, 255, "c", tracking=-1)
    day = int(lerp(1, 100, e_sine(prog(t, 1.2, BUILDER.done)))) if t >= 1.2 else 1
    text(c, f"DAY {day:03d}", 540, 400, font("mono", 30), GRAPH, 255, "c", tracking=6)
    # progress bar of the 100 days
    kb = prog(t, 1.2, BUILDER.done)
    c.drawLine(390, 432, 690, 432, stroke("#2A2A2E", 4))
    if kb > 0:
        c.drawLine(390, 432, lerp(390, 690, e_sine(kb)), 432, stroke(CHALK, 4))

    # verdict
    kv = e_io(prog(t, T_VERDICT, T_VERDICT + 0.5))
    if kv > 0:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, int(205 * kv)))
        f = font("bold", 74)
        k1 = e_out(prog(t, T_VERDICT + 0.25, T_VERDICT + 0.85))
        k2 = e_out(prog(t, T_VERDICT + 0.95, T_VERDICT + 1.55))
        text(c, "Perfect is one brick.", 540, 930 + 20 * (1 - k1), f, CHALK, 255 * k1, "c", tracking=-0.5)
        text(c, "Done is a wall.", 540, 1030 + 20 * (1 - k2), f, MOLTEN, 255 * k2, "c", tracking=-0.5)

    # logo end card
    kl = e_io(prog(t, T_LOGO, T_LOGO + 0.4))
    if kl > 0:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, int(255 * kl)))
        mark(c, 540, 860, 1.25, prog(t, T_LOGO + 0.2, T_LOGO + 1.0))
        kw = e_out(prog(t, T_LOGO + 0.8, T_LOGO + 1.3))
        text(c, "LOADBEARING", 540, 1060 + 14 * (1 - kw), font("black", 58), CHALK, 255 * kw, "c", tracking=16)
        # fade out last frames
    ko = prog(t, DUR - 0.35, DUR)
    if ko > 0:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, int(255 * ko)))

    img = surf.makeImageSnapshot()
    return img.toarray(colorType=skia.kRGBA_8888_ColorType)[:, :, :3]


# ---------------------------------------------------------------- events for sound
def events():
    ev = {"land": [], "toss": [], "pick": [], "scrape": [], "tick": [], "discard": [], "place": []}
    for i, b in enumerate(BUILDER.bricks):
        ev["land"].append((b["land"], i / len(BUILDER.bricks)))
        ev["toss"].append(b["t0"] + b["dur"] * 0.62)
        ev["pick"].append(b["t0"] + b["dur"] * 0.30)
    ev["place"].append(PERF.t_place + 0.5)
    for s, kind in PERF.cycles:
        if kind == "adjust":
            ev["scrape"] += [s + 0.4, s + 0.9]
            ev["tick"] += [s + 1.15, s + 1.45, s + 1.75]
        else:
            ev["discard"].append(s + 1.05)
            ev["place"].append(s + 2.05)
    ev["flag"] = BUILDER.done + 0.45
    ev["verdict"] = T_VERDICT + 0.3
    ev["logo"] = T_LOGO + 0.6
    return ev


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "stills":
        from PIL import Image
        for s in sys.argv[2:]:
            Image.fromarray(frame(float(s))).save(os.path.join(HERE, "frames", f"p_{float(s):05.2f}.png"))
        print("ok")
    elif mode == "video":
        out = os.path.join(HERE, "out", "pilot_video.tmp.mp4")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
               "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17",
               "-pix_fmt", "yuv420p", out]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(int(DUR * FPS)):
            p.stdin.write(frame(i / FPS).tobytes())
        p.stdin.close()
        sys.exit(p.wait())
