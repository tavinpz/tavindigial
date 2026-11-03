"""LOADBEARING №004 — THE WEIGHT. What are you carrying up the stairs?"""
import math
import random
import sys

import skia
import brand as B
from brand import *
import sound as S

EP = 4
GY = 1330
SW, SH = 50, 50          # step width / height
NSTEP = 8
BOXW, BOXH = 74, 34


class Weight:
    DUR = 15.8
    T_TEXT = 12.0
    T_STING = 14.2
    LANES = {"L": 30, "R": 550}      # x of the first step of each staircase (screen)

    def __init__(self):
        # hero (right): drops a box at each of the first 3 steps, then climbs faster
        self.R_steps = [1.0, 2.0, 3.0, 4.0, 4.9, 5.8, 6.7, 7.6, 8.5]   # arrival time on step i (0 = ground)
        self.R_drops = [(1.5, 2), (2.5, 1), (3.5, 0)]                 # (time, box index) — top box first
        # grey (left): climbs ever slower, boxes keep landing on him
        self.L_steps = [1.0, 2.3, 4.1, 6.6]
        self.L_adds = [2.9, 4.8, 6.0, 7.2, 8.0]
        self.T_STUCK = 8.4
        self.T_SIT = 9.4
        self.labels = ["EXCUSES", "OPINIONS", "REGRET", "LATER", "FEAR", "WHAT IF", "PAST"]
        self.T_TOP = self.R_steps[-1] + 0.1

    def step_xy(self, lane, i):
        x0 = self.LANES[lane]
        return (x0 + SW * (i + 0.5) - SW / 2 + 26, GY - SH * i)

    def pos_on_stairs(self, lane, steps, t):
        """Figure root position (x, ground y) with a little hop between steps."""
        i = sum(1 for s in steps if t >= s) - 1
        i = max(0, i)
        x, y = self.step_xy(lane, i)
        if i + 1 < len(steps):
            ts, tn = steps[i], steps[i + 1]
            dur = min(0.45, tn - ts)
            k = prog(t, tn - dur, tn)
            if k > 0:
                x2, y2 = self.step_xy(lane, i + 1)
                x = lerp(x, x2, e_io(k))
                y = lerp(y, y2, e_io(k)) - 22 * math.sin(math.pi * k)
                return x, y, k
        return x, y, 0

    def draw_stairs(self, c, lane, top_lit=False):
        x0 = self.LANES[lane]
        path = skia.Path().moveTo(x0, GY)
        for i in range(NSTEP):
            path.lineTo(x0 + SW * i, GY - SH * (i + 1))
            path.lineTo(x0 + SW * (i + 1), GY - SH * (i + 1))
        top_w = 96
        path.lineTo(x0 + SW * NSTEP + top_w, GY - SH * NSTEP)
        path.lineTo(x0 + SW * NSTEP + top_w, GY)
        path.close()
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, GY - SH * NSTEP), (0, GY)], [C("#26252A"), C("#141418")]))
        c.drawPath(path, p)
        # step nosings (chalk)
        for i in range(NSTEP):
            c.drawLine(x0 + SW * i, GY - SH * (i + 1), x0 + SW * (i + 1), GY - SH * (i + 1), stroke(CHALK, 3, 200))
            c.drawLine(x0 + SW * i, GY - SH * i, x0 + SW * i, GY - SH * (i + 1), stroke(CHALK, 2, 70))
        c.drawLine(x0 + SW * NSTEP, GY - SH * NSTEP, x0 + SW * NSTEP + top_w, GY - SH * NSTEP, stroke(CHALK, 3, 220))
        text(c, "TOP", x0 + SW * NSTEP + top_w / 2, GY - SH * NSTEP + 40, font("mono", 18), GRAPH, 180, "c", tracking=4)

    def box(self, c, x, y, label, rot=0, a=255):
        c.save()
        c.translate(x, y)
        c.rotate(rot)
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, -BOXH / 2), (0, BOXH / 2)], [C("#BC9264", a), C("#8C6842", a)]))
        c.drawRRect(rrect(-BOXW / 2, -BOXH / 2, BOXW, BOXH, 4), p)
        c.drawLine(-BOXW / 2 + 4, -BOXH / 2 + 2, BOXW / 2 - 4, -BOXH / 2 + 2, stroke("#E0B988", 2, a * 0.7))
        c.drawLine(0, -BOXH / 2, 0, -BOXH / 2 + 9, stroke("#6E5232", 2, a))
        text(c, label, 0, 6, font("monob", 12), "#3B2A17", a, "c", tracking=1)
        c.restore()

    def pile_on_back(self, c, info, labels, face, sway=0.0, a=255):
        sh = info["sh"]
        for i, lab in enumerate(labels):
            bx = sh[0] - 34 * face + sway * i * 3
            by = sh[1] + 22 - BOXH * (i + 0.5) - 4 * i
            self.box(c, bx, by, lab, rot=sway * i * 1.5 + (i % 2) * 2 - 1, a=a)

    def tumble(self, c, lane, start_step, t0, t, label, start_xy):
        """A dropped box bounces down the stairs, step by step, then slides off."""
        dt = t - t0
        if dt < 0:
            return
        seg = 0.22
        n = int(dt / seg)
        k = (dt % seg) / seg
        step = start_step - n
        if step >= 0:
            if n == 0:
                p0 = start_xy
            else:
                sx, sy = self.step_xy(lane, step + 1)
                p0 = (sx - 30, sy - BOXH / 2)
            ex, ey = self.step_xy(lane, step)
            p2 = (ex - 30, ey - BOXH / 2)
            p1 = ((p0[0] + p2[0]) / 2, min(p0[1], p2[1]) - 40)
            pos = bez(p0, p1, p2, k)
            rot = -(n * 90 + 90 * k) * 0.6
        else:
            ex, ey = self.step_xy(lane, 0)
            slide = (dt - seg * (start_step + 1)) * 260
            pos = (ex - 30 - slide - 20, GY - BOXH / 2 + 2)
            rot = -(start_step + 1) * 54
            if pos[0] < -80:
                return
        self.box(c, pos[0], pos[1], label, rot=rot)

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        B.sky(c)
        z = 1.0 + 0.03 * e_sine(prog(t, 0, self.T_TEXT))
        c.save()
        c.translate(W / 2, GY - 300)
        c.scale(z, z)
        c.translate(-W / 2, -(GY - 300))
        topL = self.step_xy("L", NSTEP)
        topR = self.step_xy("R", NSTEP)
        B.lamp(c, topL[0] + 30, 520, 640, GY - SH * NSTEP, 0.45)
        B.lamp(c, topR[0] + 30, 520, 640, GY - SH * NSTEP, 1.0 if t > self.T_TOP else 0.7, warm=True)
        B.earth(c, GY)
        B.ground_line(c, GY)
        self.draw_stairs(c, "L")
        self.draw_stairs(c, "R")

        # ---- hero (right)
        x, y, hop = self.pos_on_stairs("R", self.R_steps, t)
        n_drop = sum(1 for td, _ in self.R_drops if t >= td)
        carrying = self.labels[:3][: 3 - n_drop]
        if t >= self.T_TOP:
            k = e_back(prog(t, self.T_TOP, self.T_TOP + 0.5), 1.3) * (1 - prog(t, self.T_TEXT - .2, self.T_TEXT + .3))
            pose = {"L": lerp2((x - 26, y - 140), (x - 62, y - 392), k), "R": lerp2((x + 26, y - 140), (x + 58, y - 396), k), "hy": -5 * k}
        else:
            lean = 10 + 8 * len(carrying)
            pose = {"L": (x - 20, y - 160 - 20 * hop), "R": (x + 30, y - 150), "lean": lean * 0.6, "crouch": 0.12 * len(carrying) + 0.3 * hop,
                    "feet": [(x - 16, y - 4), (x + 22 + 20 * hop, y - 4 - SH * hop * 0.8)]}
        info = B.figure(c, x, y, {**pose, "blink": B.blink_at(t, 4.0, .5)}, hero=True)
        self.pile_on_back(c, info, carrying, 1)
        for td, idx in self.R_drops:
            if t >= td:
                i_step = sum(1 for s in self.R_steps if td >= s) - 1
                sh = info["sh"]
                sx, sy = self.step_xy("R", i_step)
                self.tumble(c, "R", i_step, td, t, self.labels[idx], (sx - 40, sy - 230))

        # ---- grey (left): the pile grows
        x, y, hop = self.pos_on_stairs("L", self.L_steps, t)
        n_add = sum(1 for ta in self.L_adds if t >= ta + 0.35)
        labels = self.labels[:3] + self.labels[3:3 + n_add][:4]
        stuck = prog(t, self.T_STUCK, self.T_STUCK + 0.6)
        sit = e_io(prog(t, self.T_SIT, self.T_SIT + 0.6))
        sway = math.sin(t * 3.2) * (0.6 + 1.4 * stuck)
        pose = {"L": (x - 20, y - 150 + 30 * stuck), "R": (x + 26, y - 146 + 30 * stuck), "lean": 18 + 6 * len(labels) * (1 - sit),
                "crouch": min(0.75, 0.12 * len(labels) + 0.3 * hop) * (1 - sit), "sit": sit, "hy": 8 + 6 * stuck, "eyes_dy": 5,
                "sad": t > self.T_STUCK, "feet": None if sit > 0.5 else [(x - 16, y - 4), (x + 22 + 20 * hop, y - 4 - SH * hop * 0.8)]}
        info = B.figure(c, x, y, {**pose, "blink": B.blink_at(t, 3.0)}, hero=False)
        self.pile_on_back(c, info, labels, 1, sway)
        for j, ta in enumerate(self.L_adds):   # a new box falls onto the pile
            k = prog(t, ta, ta + 0.35)
            if 0 < k < 1:
                sh = info["sh"]
                target_y = sh[1] + 22 - BOXH * (3 + j + 0.5) - 4 * (3 + j)
                self.box(c, sh[0] - 34, lerp(-60, target_y, e_in(k)), self.labels[3 + j] if 3 + j < len(self.labels) else "MORE", rot=20 * (1 - k))
        c.restore()

        # ---- HUD
        kh = 1 - prog(t, self.T_TEXT - 0.4, self.T_TEXT)
        B.title(c, "WHAT ARE YOU CARRYING?", 300, 255 * kh)
        kg_r = 3 - n_drop
        kg_l = len(labels)
        for lane, name, sub, kg, hero in (("L", "HOLDING ON", f"STEP {max(0, sum(1 for s in self.L_steps if t >= s) - 1)} / {NSTEP}", kg_l, False),
                                           ("R", "LETTING GO", f"STEP {max(0, sum(1 for s in self.R_steps if t >= s) - 1)} / {NSTEP}", kg_r, True)):
            cx = self.LANES[lane] + 210
            B.lane_label(c, cx, 470, name, sub, MOLTEN if (hero and t >= self.T_TOP) else GRAPH, 255 * kh, hero=hero)
            B.meter(c, cx - 150, 560, 300, kg / 7, "LOAD", f"{kg * 18:3d} kg", MOLTEN if not hero and kg > 4 else (CHALK if hero else GRAPH), 255 * kh * prog(t, .4, 1))
        if t >= self.T_TEXT:
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 170 * e_io(prog(t, self.T_TEXT, self.T_TEXT + .5))))
            B.verdict(c, t, self.T_TEXT + 0.1, "You don't need more strength.", "You need less weight.", 420, self.T_STING)
        B.sting(c, t, self.T_STING)
        return B.finish(surf, EP, t, self.T_STING, self.DUR)

    def sound(self, path):
        m = S.Mix(self.DUR)
        for i, s in enumerate(self.R_steps[1:]):
            m.add(S.footstep(), s, 0.6, pan=0.4, send=0.2)
        for td, _ in self.R_drops:
            for b in range(6):
                m.add(S.block_knock(1.4 + S.rng.uniform(-.1, .1), 0.5) * (0.9 ** b), td + 0.22 * (b + 1), 0.4 * (0.85 ** b), pan=0.4 - 0.08 * b, send=0.25)
            m.add(S.whoosh(0.25, 800, 2200), td, 0.2, pan=0.4, send=0.1)
        m.add(S.whoosh(0.7, 300, 900), self.T_TOP, 0.35, pan=0.4, send=0.4)
        m.add(S.piano(S.note(81), 2.2), self.T_TOP + 0.1, 0.35, pan=0.4, send=0.7)
        for s in self.L_steps[1:]:
            m.add(S.footstep() * 1.3, s, 0.7, pan=-0.4, send=0.2)
            m.add(S.strain(0.6), s - 0.4, 0.25, pan=-0.4, send=0.2)
        for ta in self.L_adds:
            m.add(S.block_knock(0.75, 1.3), ta + 0.35, 0.55, pan=-0.45, send=0.25)
        m.add(S.strain(1.2), self.T_STUCK, 0.4, pan=-0.4, send=0.3)
        m.add(S.footstep() * 1.6, self.T_SIT + 0.5, 0.6, pan=-0.4, send=0.3)
        S.brand_bed(m, self.DUR, self.T_TEXT)
        S.sonic_logo(m, self.T_STING + B.STING_HIT)
        m.render(path)


SCENE = Weight()
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        B.stills(SCENE, [float(x) for x in sys.argv[2:]], "e4")
        print(B.sheet("e4", 7))
