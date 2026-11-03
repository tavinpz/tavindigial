"""LOADBEARING №003 — THE BRIDGE. Perfect plan vs one plank a day (split top/bottom)."""
import math
import random
import sys

import skia
import brand as B
from brand import *
import sound as S

EP = 3
GAP0, GAP1 = 360, 720              # chasm in lane coords
FLAG_X = 905


class Bridge:
    DUR = 16.0
    TOP_Y, BOT_Y = 830, 1440        # ground line of each lane (screen)
    SC = 0.95
    T_P0 = 1.2
    N = 15
    STEP = 0.52
    T_TEXT = 12.4
    T_STING = 14.45

    def __init__(self):
        self.pw = (GAP1 - GAP0) / self.N
        self.planks = [dict(t=self.T_P0 + i * self.STEP + 0.32, x=GAP0 + self.pw * (i + 0.5)) for i in range(self.N)]
        self.T_BUILT = self.planks[-1]["t"]
        self.T_WALK0, self.T_WALK1 = self.T_BUILT + 0.35, self.T_BUILT + 2.1
        self.T_FLAG = self.T_WALK1 + 0.1
        self.crumples = [1.4 + i * 1.55 for i in range(7)]
        rnd = random.Random(5)
        self.pile = [(rnd.uniform(-70, 40), rnd.uniform(0, 1), rnd.uniform(9, 13)) for _ in range(len(self.crumples))]

    # ------------------------------------------------------------ helpers
    def lane_bg(self, c, gy_local_bottom=520):
        """Cliffs with earth cross-section and the chasm. Local coords: ground y = 0."""
        # chasm glow from below
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, 0), (0, gy_local_bottom)], [C("#0B0C11"), C("#020203")]))
        c.drawRect(skia.Rect.MakeLTRB(GAP0, 0, GAP1, gy_local_bottom), p)
        for x0, x1 in ((-200, GAP0), (GAP1, W + 200)):
            B.earth(c, 0, x0, x1, gy_local_bottom)
            B.ground_line(c, 0, x0, x1)
            # cliff faces
            xe = x1 if x0 < 0 else x0
            c.drawLine(xe, 0, xe, gy_local_bottom, stroke("#2A2721", 3))

    def walk_feet(self, x, ph):
        s = math.sin(ph)
        return [(x - 22 * s, -4 - 9 * max(0, math.cos(ph))), (x + 22 * s, -4 - 9 * max(0, -math.cos(ph)))]

    # ------------------------------------------------------------ top lane: the planner (grey)
    def draw_top(self, c, t):
        self.lane_bg(c)
        fx = 220
        n_done = sum(1 for tc in self.crumples if t >= tc + 0.75)
        # paper balls pile
        for i in range(n_done):
            dx, u, r = self.pile[i]
            c.drawCircle(fx - 70 + dx, -r - 2 * (i // 3) * 0 - 2, r, fill("#C9CED8"))
            c.drawCircle(fx - 70 + dx - r * .3, -r * 1.2, r * .35, fill("#AEB4C0"))
        pose = {"L": (fx + 40, -170), "R": (fx + 80, -172), "hy": 8, "eyes_dy": 5}
        paper = True
        ball = None
        for i, tc in enumerate(self.crumples):
            ph = t - tc
            if 0 <= ph < 0.75:
                if ph < 0.25:   # crumple
                    k = ph / 0.25
                    pose = {"L": (fx + 50 + 10 * k, -170), "R": (fx + 70 - 10 * k, -170), "hy": 6, "sad": True}
                    paper = False
                    ball = (fx + 60, -172, 1)
                else:           # toss over the shoulder
                    k = (ph - 0.25) / 0.5
                    p0 = (fx + 60, -172)
                    p2 = (fx - 70 + self.pile[i][0], -self.pile[i][2])
                    pos = bez(p0, (fx - 10, -320), p2, k)
                    pose = {"L": (fx - 20, -250 + 60 * k), "R": (fx + 40, -150), "lean": -6, "hy": -3}
                    paper = ph > 0.55
                    ball = (pos[0], pos[1], 1)
                break
        if t >= self.T_FLAG:  # the planner glances up at nothing, still on a fresh sheet
            pose = {"L": (fx + 40, -170), "R": (fx + 80, -172), "hy": 4, "eyes_dy": 3, "sad": True}
        B.figure(c, fx, 0, {**pose, "blink": B.blink_at(t, 3.1)}, hero=False)
        if paper:
            # the "perfect plan": a blueprint sheet in his hands
            px, py = fx + 62, -186
            c.save()
            c.translate(px, py)
            c.rotate(-8)
            c.drawRRect(rrect(-34, -24, 68, 48, 3), fill("#2E5B9A"))
            for j in range(4):
                c.drawLine(-26, -14 + j * 9, 26 - (j % 2) * 14, -14 + j * 9, stroke("#9CC3F5", 1.5, 200))
            c.drawRect(skia.Rect.MakeXYWH(-26, -18, 52, 36), stroke("#9CC3F5", 1.2, 140))
            c.restore()
        if ball:
            c.drawCircle(ball[0], ball[1], 11, fill("#C9CED8"))
        # empty goal on the far side
        self.draw_flag(c, t, False)

    # ------------------------------------------------------------ bottom lane: the builder (orange)
    def draw_bottom(self, c, t):
        self.lane_bg(c)
        laid = [p for p in self.planks if t >= p["t"]]
        # rope rails over the laid section
        if laid:
            xe = laid[-1]["x"] + self.pw / 2
            sag = 10
            for yoff in (-70,):
                path = skia.Path().moveTo(GAP0 - 10, yoff).quadTo((GAP0 + xe) / 2, yoff + sag, xe, yoff)
                c.drawPath(path, stroke("#B49A74", 3))
            for p in laid:
                c.drawLine(p["x"] - self.pw / 2 + 2, 0, p["x"] - self.pw / 2 + 2, -70, stroke("#7A6448", 2))
        for i, p in enumerate(self.planks):
            if t >= p["t"]:
                k = prog(t, p["t"], p["t"] + 0.12)
                sq = math.sin(math.pi * k)
                plank(c, p["x"], 6 + 3 * sq, w=self.pw - 2, h=14, rot=0)
        # figure
        ph_walk = 0
        if t < self.T_P0:
            fx = GAP0 - 70
            pose = {"L": (fx - 24, -140), "R": (fx + 24, -140)}
        elif t < self.T_BUILT + 0.2:
            i = min(self.N - 1, int((t - self.T_P0) / self.STEP))
            ph = ((t - self.T_P0) / self.STEP) % 1
            edge = GAP0 + self.pw * i
            fx = edge - 52
            if ph < 0.25:        # shuffle forward
                fx = lerp(edge - 52 - self.pw, edge - 52, e_io(ph / 0.25)) if i > 0 else fx
                pose = {"L": (fx - 20, -150), "R": (fx + 30, -150), "feet": self.walk_feet(fx, ph * 12)}
            else:                # crouch and set the plank
                k = math.sin(math.pi * prog(ph, 0.25, 0.9))
                hand = (lerp(fx + 30, edge + self.pw / 2, k), lerp(-150, -18, k))
                pose = {"crouch": 0.7 * k, "lean": 34 * k, "R": hand, "L": (hand[0] - 30, hand[1] + 4), "hy": 10 * k, "eyes_dy": 5 * k}
                if k > 0.15 and ph < 0.62:
                    plank(c, hand[0] + 8, hand[1] + 4, w=self.pw - 2, h=14, rot=-14 * (1 - k))
        elif t < self.T_WALK0:
            fx = GAP1 - 52
            pose = {"L": (fx - 24, -140), "R": (fx + 24, -140), "hy": -4}
        elif t < self.T_WALK1:
            k = e_io(prog(t, self.T_WALK0, self.T_WALK1))
            fx = lerp(GAP1 - 52, FLAG_X - 70, k)
            ph_walk = t * 11
            pose = {"L": (fx - 30 + 14 * math.sin(ph_walk), -140), "R": (fx + 30 - 14 * math.sin(ph_walk), -140),
                    "feet": self.walk_feet(fx, ph_walk), "hy": -2}
        else:
            fx = FLAG_X - 70
            k = e_back(prog(t, self.T_FLAG, self.T_FLAG + 0.45), 1.3) * (1 - prog(t, self.T_TEXT - 0.2, self.T_TEXT + 0.3))
            pose = {"L": lerp2((fx - 26, -140), (fx - 66, -392), k), "R": lerp2((fx + 26, -140), (fx + 62, -396), k), "hy": -6 * k}
        self.draw_flag(c, t, True)
        B.figure(c, fx, 0, {**pose, "blink": B.blink_at(t, 3.9, .4)}, hero=True)

    def draw_flag(self, c, t, hero):
        x = FLAG_X
        c.drawLine(x, 0, x, -250, stroke("#6A6A72", 5))
        reached = hero and t >= self.T_FLAG
        k = e_back(prog(t, self.T_FLAG, self.T_FLAG + 0.5), 1.5) if reached else 0
        wave = math.sin(t * 6) * 5
        col = MOLTEN if reached else "#3A3A40"
        top = -250
        path = skia.Path().moveTo(x + 2, top).lineTo(x + 2 + 86 * (0.55 + 0.45 * k), top + 22 + wave).lineTo(x + 2, top + 46).close()
        c.drawPath(path, fill(col))
        if reached:
            g = fill(MOLTEN, 120 * k)
            g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 30))
            c.drawCircle(x + 40, top + 22, 70, g)
        text(c, "THE GOAL", x, 46, font("mono", 20), GRAPH, 200, "c", tracking=4)

    # ------------------------------------------------------------ frame
    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        B.sky(c)
        # divider between the two worlds
        dp = stroke(GRAPH, 2, 90)
        dp.setPathEffect(skia.DashPathEffect.Make([10, 12], 0))
        c.drawLine(60, 1000, W - 60, 1000, dp)

        z = self.SC * (1 + 0.025 * e_sine(prog(t, 0, self.T_TEXT)))
        for gy, fn in ((self.TOP_Y, self.draw_top), (self.BOT_Y, self.draw_bottom)):
            c.save()
            c.clipRect(skia.Rect.MakeLTRB(0, gy - 400 if gy == self.TOP_Y else 1000, W, 1000 if gy == self.TOP_Y else H))
            c.translate(W / 2, gy)
            c.scale(z, z)
            c.translate(-W / 2, 0)
            B.lamp(c, 220 if fn == self.draw_top else 520, -440, -330, 0, 0.6 if fn == self.draw_top else 1.0, warm=fn != self.draw_top)
            fn(c, t)
            c.restore()

        k = e_out(prog(t, 0.2, 0.9)) * (1 - prog(t, self.T_TEXT - .4, self.T_TEXT))
        day = 1 + int(239 * e_sine(prog(t, self.T_P0, self.T_BUILT)))
        n_plans = sum(1 for tc in self.crumples if t >= tc + 0.25)
        n_planks = sum(1 for p in self.planks if t >= p["t"])
        planks_shown = int(n_planks * 16)
        B.lane_label(c, W / 2, 470, "THE PERFECT PLAN", f"PLANS {n_plans + 1:02d}  ·  PLANKS 0", GRAPH, 255 * k)
        B.lane_label(c, W / 2, 1060, "ONE PLANK A DAY", f"PLANKS {planks_shown:03d}" + ("  ·  CROSSED" if t >= self.T_FLAG else ""),
                     MOLTEN if t >= self.T_FLAG else GRAPH, 255 * k, hero=True)
        kh = 1 - prog(t, self.T_TEXT - 0.4, self.T_TEXT)
        B.title(c, "SAME GAP.", 300, 255 * kh)
        text(c, f"DAY {day:03d}", W / 2, 366, font("mono", 28), GRAPH, 255 * kh, "c", tracking=6)
        if t >= self.T_TEXT:
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 170 * e_io(prog(t, self.T_TEXT, self.T_TEXT + .5))))
            B.verdict(c, t, self.T_TEXT + 0.1, "Plans don't cross gaps.", "Planks do.", 880, self.T_STING)
        B.sting(c, t, self.T_STING)
        return B.finish(surf, EP, t, self.T_STING, self.DUR)

    def sound(self, path):
        m = S.Mix(self.DUR)
        m.add(S.wind(self.DUR) * 0.35, 0, 0.5, send=0.3)              # the chasm breathes
        for i, p in enumerate(self.planks):
            m.add(S.wood_knock(1.0 + 0.2 * i / self.N + S.rng.uniform(-.04, .04)), p["t"], 0.7, pan=0.1, send=0.3)
            m.add(S.footstep(), p["t"] - 0.32, 0.25, pan=0.1, send=0.15)
        for k in range(int((self.T_WALK1 - self.T_WALK0) * 11 / math.pi)):
            m.add(S.wood_knock(1.6) * 0.4, self.T_WALK0 + k * math.pi / 11, 0.45, pan=0.2, send=0.25)
        m.add(S.whoosh(0.5, 300, 1200), self.T_FLAG, 0.4, pan=0.3, send=0.3)
        m.add(S.piano(S.note(81), 2.0), self.T_FLAG + 0.05, 0.35, pan=0.3, send=0.7)
        for tc in self.crumples:
            if tc < self.T_TEXT:
                m.add(S.paper(0.28), tc, 0.55, pan=-0.2, send=0.2)
                m.add(S.whoosh(0.3, 400, 1100), tc + 0.3, 0.18, pan=-0.3, send=0.1)
                m.add(S.paper(0.08), tc + 0.75, 0.35, pan=-0.35, send=0.15)
        S.brand_bed(m, self.DUR, self.T_TEXT)
        S.sonic_logo(m, self.T_STING + B.STING_HIT)
        m.render(path)


SCENE = Bridge()
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        B.stills(SCENE, [float(x) for x in sys.argv[2:]], "e3")
        print(B.sheet("e3", 7))
