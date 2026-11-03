"""LOADBEARING №005 — THE CRACK. Same tiny crack; one fixes it on day one."""
import math
import random
import sys

import skia
import brand as B
from brand import *
import sound as S

EP = 5
GY = 1240
COLS, ROWS = 4, 9


def make_crack(x, y, seed, direction):
    """Tree of segments: list of (x0, y0, x1, y1, s_birth, depth)."""
    rnd = random.Random(seed)
    segs = []

    def grow(x, y, ang, length, s0, depth, budget):
        steps = int(length / 14)
        for i in range(steps):
            ang += rnd.uniform(-0.45, 0.45)
            nx, ny = x + 14 * math.cos(ang), y + 14 * math.sin(ang)
            s = s0 + (1 - s0) * (i + 1) / steps * 0.9
            segs.append((x, y, nx, ny, s, depth))
            if depth < 2 and rnd.random() < 0.16 and budget > 0:
                grow(nx, ny, ang + rnd.choice([-1, 1]) * rnd.uniform(0.6, 1.1), length * 0.45, s, depth + 1, budget - 1)
            x, y = nx, ny

    grow(x, y, math.radians(100 + 20 * direction), 260, 0.0, 0, 6)
    grow(x, y, math.radians(-75 - 25 * direction), 170, 0.05, 0, 4)
    segs.sort(key=lambda s: s[4])
    return segs


class Crack:
    DUR = 15.4
    LW, RW = 236, 598               # wall left edges
    LF, RF = 142, 942
    T_CRACK = 1.4
    T_FIX0, T_FIX1 = 2.3, 3.4
    T_CRACK2 = 5.6                  # a second small crack on the right — fixed again, faster
    T_FIX2a, T_FIX2b = 6.1, 6.8
    T_FALL = 9.1
    T_TEXT = 11.7
    T_STING = 13.85

    def __init__(self):
        self.ww = COLS * BW
        self.blocks = {}
        for side, x0 in (("L", self.LW), ("R", self.RW)):
            bl = []
            for r in range(ROWS):
                off = (BW / 2) * (r % 2)
                for k in range(COLS + (1 if r % 2 else 0)):
                    x = x0 + k * BW - off
                    w = BW
                    if r % 2 and k == 0:
                        x, w = x0, BW / 2
                    elif r % 2 and k == COLS:
                        w = BW / 2
                    bl.append(dict(x=x + w / 2, y=GY - BH / 2 - r * BH, w=w, r=r))
            self.blocks[side] = bl
        self.cL = (self.LW + 120, GY - BH * 5.6)
        self.cR = (self.RW + self.ww - 120, GY - BH * 5.6)
        self.crackL = make_crack(*self.cL, 3, 1)
        self.crackR = make_crack(*self.cR, 3, -1)
        self.crackR2 = make_crack(self.RW + self.ww - 90, GY - BH * 2.4, 9, -1)
        # left wall: blocks near the crack fall at T_FALL
        rnd = random.Random(7)
        for b in self.blocks["L"]:
            d = math.hypot(b["x"] - self.cL[0], b["y"] - self.cL[1])
            b["falls"] = b["r"] >= 3 and (d < 170 or b["x"] < self.LW + 130)
            b["delay"] = rnd.uniform(0, 0.25) + (ROWS - b["r"]) * 0.03
            b["vx"] = rnd.uniform(-260, -40)
            b["w_ang"] = rnd.uniform(-300, 200)

    def growth_L(self, t):
        if t < self.T_CRACK:
            return 0
        return 0.06 + 0.94 * e_in(prog(t, self.T_CRACK + 1.4, self.T_FALL)) ** 0.8

    def crack_mm(self, g):
        return 0.2 + 40 * g ** 2.2

    def draw_crack(self, c, segs, g, glow=True, a=255):
        if g <= 0:
            return
        x0w = self.LW if segs is self.crackL else self.RW
        c.save()
        c.clipRect(skia.Rect.MakeXYWH(x0w + 2, GY - ROWS * BH + 2, self.ww - 4, ROWS * BH - 4))
        tip = None
        for x0, y0, x1, y1, s, d in segs:
            if s > g:
                break
            w = (5.2 - d * 1.6) * (0.45 + 1.1 * g)
            c.drawLine(x0, y0, x1, y1, stroke("#0A0908", max(1.4, w), a))
            if d == 0 and g > 0.25:
                c.drawLine(x0, y0, x1, y1, stroke(MOLTEN, 1.6, a * prog(g, 0.25, 0.8) * 0.8))
            tip = (x1, y1)
        if glow and tip:
            gp = fill(MOLTEN, 200 * a / 255)
            gp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6))
            c.drawCircle(tip[0], tip[1], 5, gp)
        c.restore()

    def draw_wall(self, c, side, t):
        for b in self.blocks[side]:
            x, y, rot = b["x"], b["y"], 0
            if side == "L" and b["falls"] and t >= self.T_FALL + b["delay"]:
                dt = t - self.T_FALL - b["delay"]
                x = b["x"] + b["vx"] * dt
                y = b["y"] + 0.5 * 2600 * dt * dt
                rot = b["w_ang"] * dt
                floor = GY - BH / 2
                if y > floor:
                    tl = math.sqrt(2 * (floor - b["y"]) / 2600)
                    x = b["x"] + b["vx"] * (tl + 0.2 * (1 - math.exp(-(dt - tl) * 5)))
                    y = floor
                    rot = b["w_ang"] * tl
                    rot = rot + (round(rot / 90) * 90 - rot) * clamp((dt - tl) * 4)
                x = max(x, 40)
            elif side == "L" and t >= self.T_FALL - 0.8:      # shudder before it goes
                x += 1.5 * math.sin(t * 70 + b["x"]) * prog(t, self.T_FALL - 0.8, self.T_FALL)
            block(c, x, y, rot, w=b["w"])

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        B.sky(c)
        z = 1.15 * (1 + 0.03 * e_sine(prog(t, 0, self.T_TEXT)))
        sx = sy = 0
        kshake = prog(t, self.T_FALL + 0.35, self.T_FALL + 1.0)
        if 0 < kshake < 1:
            sx, sy = 7 * (1 - kshake) * math.sin(t * 85), 6 * (1 - kshake) * math.cos(t * 73)
        c.save()
        c.translate(W / 2 + sx, GY - 120 + sy)
        c.scale(z, z)
        c.translate(-W / 2, -(GY - 120))
        B.lamp(c, self.LW + self.ww / 2, 520, 640, GY, 0.55)
        B.lamp(c, self.RW + self.ww / 2, 520, 640, GY, 1.0, warm=True)
        B.earth(c, GY)
        B.ground_line(c, GY)
        self.draw_wall(c, "R", t)
        self.draw_wall(c, "L", t)

        # ---- right: crack appears, gets patched on day one
        gR = 0.06 if t >= self.T_CRACK else 0
        fixed = prog(t, self.T_FIX0 + 0.3, self.T_FIX1)
        if fixed < 1:
            self.draw_crack(c, self.crackR, gR, glow=t < self.T_FIX0 + 0.3)
        self.draw_patch(c, self.crackR, 0.06, fixed, t, self.T_FIX1)
        if t >= self.T_CRACK2:
            f2 = prog(t, self.T_FIX2a + 0.15, self.T_FIX2b)
            if f2 < 1:
                self.draw_crack(c, self.crackR2, 0.05)
            self.draw_patch(c, self.crackR2, 0.05, f2, t, self.T_FIX2b)
        # ---- left: the crack grows
        gL = self.growth_L(t)
        if t < self.T_FALL + 0.2:
            self.draw_crack(c, self.crackL, gL, a=255 * (1 - prog(t, self.T_FALL, self.T_FALL + 0.2)))
        # crack size callouts
        k = prog(t, self.T_CRACK, self.T_CRACK + 0.3)
        if k > 0 and t < self.T_FALL:
            mm = self.crack_mm(gL)
            x0, y0 = self.cL
            c.drawLine(x0 + 8, y0 - 8, x0 + 60, y0 - 60, stroke(MOLTEN, 2, 220 * k))
            text(c, f"{mm:4.1f} mm", x0 + 66, y0 - 60, font("monob", 22), MOLTEN, 255 * k, "l", tracking=1)
        if k > 0 and t < self.T_FIX1 + 0.5:
            x0, y0 = self.cR
            lab = "0.2 mm" if t < self.T_FIX1 else "FIXED"
            c.drawLine(x0 - 8, y0 - 8, x0 - 60, y0 - 60, stroke(MOLTEN if t < self.T_FIX1 else CHALK, 2, 220 * k))
            text(c, lab, x0 - 66, y0 - 60, font("monob", 22), MOLTEN if t < self.T_FIX1 else CHALK, 255 * k * (1 - prog(t, self.T_FIX1 + 0.2, self.T_FIX1 + 0.5)), "r", tracking=1)

        self.draw_figures(c, t)
        # dust of the collapse
        kd = prog(t, self.T_FALL + 0.3, self.T_FALL + 2.0)
        if 0 < kd < 1:
            for j in range(18):
                u = (j * 0.618) % 1
                p = fill("#6B665C", 80 * (1 - kd))
                p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 16))
                c.drawCircle(lerp(60, 470, u), GY - 20 - 70 * e_out(kd) * u, 20 + 60 * e_out(kd) * (0.5 + u), p)

        kl = e_out(prog(t, 0.2, 0.9)) * (1 - prog(t, self.T_TEXT - .4, self.T_TEXT))
        B.lane_label(c, self.LW + self.ww / 2, 780, "LATER", "IGNORED" if t < self.T_FALL else "COLLAPSED", MOLTEN if t >= self.T_FALL else GRAPH, 255 * kl)
        B.lane_label(c, self.RW + self.ww / 2, 780, "NOW", "FIXED ON DAY 1" if t >= self.T_FIX1 else "—", MOLTEN if t >= self.T_FIX1 else GRAPH, 255 * kl, hero=True)
        c.restore()

        kh = 1 - prog(t, self.T_TEXT - 0.4, self.T_TEXT)
        B.title(c, "IT STARTS SMALL.", 300, 255 * kh)
        day = 1 + int(199 * e_sine(prog(t, self.T_CRACK, self.T_FALL)))
        text(c, f"DAY {day:03d}", W / 2, 366, font("mono", 28), MOLTEN if t >= self.T_FALL else GRAPH, 255 * kh, "c", tracking=6)
        if t >= self.T_TEXT:
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 170 * e_io(prog(t, self.T_TEXT, self.T_TEXT + .5))))
            B.verdict(c, t, self.T_TEXT + 0.1, "Small cracks don't stay small.", "Fix it on day one.", 420, self.T_STING)
        B.sting(c, t, self.T_STING)
        return B.finish(surf, EP, t, self.T_STING, self.DUR)

    def draw_patch(self, c, segs, g, k, t, t_done):
        """Mortar smear following the crack as the trowel passes."""
        if k <= 0:
            return
        pts = [(x0, y0, x1, y1) for x0, y0, x1, y1, s, d in segs if s <= g]
        n = int(len(pts) * k)
        fade = 1 - 0.75 * prog(t, t_done + 0.2, t_done + 1.2)
        for x0, y0, x1, y1 in pts[:n]:
            c.drawLine(x0, y0, x1, y1, stroke("#CFC8BA", 9, 255 * fade))

    def trowel_tip(self, segs, g, k):
        pts = [(x1, y1) for x0, y0, x1, y1, s, d in segs if s <= g]
        if not pts:
            return None
        return pts[min(len(pts) - 1, int(len(pts) * k))]

    def draw_figures(self, c, t):
        # right (orange): patches the crack with a trowel, twice
        rf = self.RF
        pose = {"L": (rf - 26, GY - 140), "R": (rf + 26, GY - 140)}
        for a, b0, segs, g in ((self.T_FIX0, self.T_FIX1, self.crackR, 0.06), (self.T_FIX2a, self.T_FIX2b, self.crackR2, 0.05)):
            if a - 0.4 <= t < b0 + 0.3:
                tip = self.trowel_tip(segs, g, prog(t, a + 0.3, b0))
                reach = e_io(prog(t, a - 0.4, a)) * (1 - e_io(prog(t, b0, b0 + 0.3)))
                hand = lerp2((rf - 26, GY - 140), (tip[0] + 22, tip[1] + 6), reach)
                pose = {"L": hand, "R": (rf + 20, GY - 150), "lean": -24 * reach, "crouch": 0.25 * reach if tip[1] > GY - 150 else 0,
                        "hy": 4, "eyes_dy": 3}
                if reach > 0.3:
                    c.save()
                    c.translate(hand[0] - 8, hand[1])
                    c.rotate(-30)
                    c.drawPath(skia.Path().moveTo(0, 0).lineTo(-30, -12).lineTo(-30, 12).close(), fill("#B8B8C0"))
                    c.restore()
        if t >= self.T_FALL + 0.6:
            k = e_io(prog(t, self.T_FALL + 0.6, self.T_FALL + 1.1))
            pose = {"L": (rf - 34, GY - 128), "R": (rf + 34, GY - 128), "hy": -4 * k, "hx": -8 * k}
        B.figure(c, rf, GY, {**pose, "blink": B.blink_at(t, 3.8, .6)}, hero=True, face=-1)

        # left (grey): notices, shrugs, scrolls the phone; jumps up when it falls
        lf = self.LF
        phone = False
        pose = {"L": (lf - 26, GY - 140), "R": (lf + 26, GY - 140)}
        if self.T_CRACK + 0.2 <= t < self.T_CRACK + 1.3:
            k = math.sin(math.pi * prog(t, self.T_CRACK + 0.2, self.T_CRACK + 1.3))
            pose = {"L": (lf - 50, GY - 170 - 40 * k), "R": (lf + 54, GY - 170 - 40 * k), "hy": -8 * k, "hx": 4}  # shrug
        elif self.T_CRACK + 1.3 <= t < self.T_FALL:
            sit = e_io(prog(t, self.T_CRACK + 1.3, self.T_CRACK + 1.9))
            pose = {"sit": sit, "L": (lf + 44, GY - 150 + 50 * sit), "R": (lf + 58, GY - 152 + 50 * sit), "hy": 12 * sit, "eyes_dy": 6 * sit,
                    "lean": 10 * sit, "hx": 6 * sit}
            phone = sit > 0.6
        elif t >= self.T_FALL:
            k = e_out(prog(t, self.T_FALL, self.T_FALL + 0.35))
            pose = {"L": (lf - 60, GY - 230), "R": (lf - 10, GY - 260), "lean": -14 * k, "hy": -6, "eyes_dy": -5, "sad": t > self.T_FALL + 1.2}
        info = B.figure(c, lf, GY, {**pose, "blink": B.blink_at(t, 3.2)}, hero=False)
        if phone:
            h = info["hands"]["R"]
            c.drawRRect(rrect(h[0] - 9, h[1] - 26, 18, 30, 4), fill("#1A1C24"))
            c.drawRRect(rrect(h[0] - 7, h[1] - 24, 14, 24, 3), fill("#9FC2FF", 230))
            g = fill("#9FC2FF", 60)
            g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 22))
            c.drawCircle(h[0], h[1] - 30, 46, g)

    def sound(self, path):
        m = S.Mix(self.DUR)
        m.add(S.crackle(0.12, 120), self.T_CRACK, 0.5, pan=-0.4, send=0.3)
        m.add(S.crackle(0.12, 120), self.T_CRACK + 0.01, 0.5, pan=0.4, send=0.3)
        m.add(S.trowel(self.T_FIX1 - self.T_FIX0), self.T_FIX0 + 0.2, 0.7, pan=0.45, send=0.2)
        m.add(S.block_knock(1.6, 0.3), self.T_FIX1, 0.3, pan=0.45, send=0.2)
        m.add(S.crackle(0.1, 100), self.T_CRACK2, 0.35, pan=0.45, send=0.3)
        m.add(S.trowel(self.T_FIX2b - self.T_FIX2a), self.T_FIX2a + 0.1, 0.6, pan=0.45, send=0.2)
        # the left crack creaks louder and more often as it grows
        tt = self.T_CRACK + 1.5
        while tt < self.T_FALL:
            g = self.growth_L(tt)
            m.add(S.crackle(0.08 + 0.25 * g, 80 + 300 * g), tt, 0.25 + 0.6 * g, pan=-0.45, send=0.3)
            tt += lerp(0.9, 0.18, g)
        m.add(S.strain(1.0), self.T_FALL - 1.0, 0.5, pan=-0.45, send=0.3)
        m.add(S.snap(), self.T_FALL, 1.1, pan=-0.45, send=0.35)
        for b in self.blocks["L"]:
            if b["falls"]:
                tl = self.T_FALL + b["delay"] + math.sqrt(2 * ((GY - BH / 2) - b["y"]) / 2600)
                m.add(S.block_knock(S.rng.uniform(0.7, 1.0), 1.4), tl, 0.5, pan=S.rng.uniform(-0.8, -0.2), send=0.3)
        m.add(S.rumble(2.0), self.T_FALL + 0.3, 1.0, pan=-0.4, send=0.4)
        S.brand_bed(m, self.DUR, self.T_TEXT)
        S.sonic_logo(m, self.T_STING + B.STING_HIT)
        m.render(path)


SCENE = Crack()
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        B.stills(SCENE, [float(x) for x in sys.argv[2:]], "e5")
        print(B.sheet("e5", 7))
