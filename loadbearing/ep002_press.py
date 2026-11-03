"""LOADBEARING №002 — THE PRESS. Same pressure, different build."""
import math
import random
import sys

import skia
import brand as B
from brand import *
import sound as S

GY = 1240
EP = 2


class Press:
    DUR = 16.9
    LF, RF = 150, 915              # figures
    LP, RP = 335, 725              # press centres
    T_DESC0, T_CONTACT = 5.6, 7.1
    T_MAX = 9.3
    T_RET0, T_RET1 = 9.9, 10.8
    T_TEXT = 12.7
    T_STING = 15.25
    ROWS = 7
    TOP = GY - 470                 # press beam

    def __init__(self):
        rnd = random.Random(2)
        self.L, self.R = [], []
        t = 1.0
        for r in range(self.ROWS):
            for k in range(2):
                x = self.LP - BW / 2 + k * BW + (r % 2) * 6 - 3 + rnd.uniform(-4, 4)
                self.L.append(dict(x=x, y=GY - BH / 2 - r * BH, rot=rnd.uniform(-3.5, 3.5), t0=t, land=t + 0.32, row=r))
                t += 0.13
        self.L_done = self.L[-1]["land"]
        t = 1.0
        for r in range(self.ROWS):
            for k in range(2):
                x = self.RP - BW / 2 + k * BW
                self.R.append(dict(x=x, y=GY - BH / 2 - r * BH, rot=0, t0=t, land=t + 0.42, row=r))
                t += 0.29
        self.R_done = self.R[-1]["land"]
        self.stack_top = GY - self.ROWS * BH
        # crush timing: top row breaks first
        self.row_break = {r: self.T_CONTACT + 0.25 + (self.ROWS - 1 - r) * 0.26 for r in range(self.ROWS)}
        self.shards = []
        for r in range(self.ROWS):
            for k in range(7):
                side = -1 if k % 2 else 1
                self.shards.append(dict(t0=self.row_break[r], x=self.LP + rnd.uniform(-60, 60), y=GY - BH / 2 - r * BH,
                                        vx=side * rnd.uniform(120, 520), vy=-rnd.uniform(80, 420), w=rnd.uniform(-600, 600),
                                        s=rnd.uniform(10, 22)))

    # --- plate positions
    def plate_y(self, t, side):
        rest = self.TOP + 70
        contact = self.stack_top - 10
        if t < self.T_DESC0:
            y = rest
        elif t < self.T_CONTACT:
            y = lerp(rest, contact, e_io(prog(t, self.T_DESC0, self.T_CONTACT)))
        else:
            y = contact
            if side == "L":
                broken = sum(1 for r, tb in self.row_break.items() if t >= tb)
                # step down as each row gives way (with a little ease into each step)
                y = contact + BH * broken
                if broken < self.ROWS:
                    nxt = self.row_break[self.ROWS - 1 - broken]
                    y += BH * 0.18 * e_in(prog(t, nxt - 0.2, nxt))
                y = min(y, GY - 22)
            else:
                y += 3 * e_io(prog(t, self.T_CONTACT, self.T_MAX))
                if self.T_MAX - 0.4 < t < self.T_RET0:
                    y += 1.6 * math.sin(t * 95)          # motor stalls, plate shudders
        if t >= self.T_RET0:
            y = lerp(y, rest, e_io(prog(t, self.T_RET0, self.T_RET1)))
        return y

    def pressure(self, t):
        return 50 * prog(t, self.T_CONTACT, self.T_MAX) ** 0.8 * (1 - e_io(prog(t, self.T_RET0, self.T_RET1)))

    def draw_press(self, c, x, t, side):
        col = "#3B3B42"
        hi = "#55555E"
        c.drawRRect(rrect(x - 110, GY - 14, 220, 14, 3), fill(col))        # base plate
        for dx in (-96, 96):
            c.drawRRect(rrect(x + dx - 9, self.TOP, 18, GY - self.TOP - 14, 4), fill(col))
            c.drawLine(x + dx - 4, self.TOP + 8, x + dx - 4, GY - 22, stroke(hi, 2))
        c.drawRRect(rrect(x - 120, self.TOP - 10, 240, 46, 6), fill(col))  # top beam
        c.drawRRect(rrect(x - 30, self.TOP + 36, 60, 30, 6), fill("#2E2E35"))  # cylinder
        py = self.plate_y(t, side)
        c.drawRect(skia.Rect.MakeXYWH(x - 9, self.TOP + 62, 18, py - (self.TOP + 62)), fill("#9C9CA6"))  # rod
        c.drawRRect(rrect(x - 84, py - 16, 168, 18, 4), fill("#4A4A53"))
        c.drawLine(x - 80, py - 14, x + 80, py - 14, stroke("#6A6A74", 2))
        # pressure dial on the beam
        p = self.pressure(t) / 50
        cx, cy = x, self.TOP + 13
        c.drawCircle(cx, cy, 19, fill("#14141A"))
        c.drawCircle(cx, cy, 19, stroke("#6A6A74", 2))
        c.drawArc(skia.Rect.MakeXYWH(cx - 14, cy - 14, 28, 28), 300, 60, False, stroke(MOLTEN, 3))
        ang = math.radians(150 + 240 * p + (2 * math.sin(t * 60) if p > 0.95 else 0))
        c.drawLine(cx, cy, cx + 13 * math.cos(ang), cy + 13 * math.sin(ang), stroke(CHALK if side == "R" else "#B0B0B0", 2.5))
        return py

    def draw_stack(self, c, items, t, side, fig_x, face):
        for it in items:
            if t < it["t0"]:
                continue
            if side == "L" and t >= self.row_break[it["row"]]:
                continue
            if t < it["land"]:
                k = prog(t, it["t0"], it["land"])
                p0 = (fig_x + 46 * face, GY - 236)
                p2 = (it["x"] + BW / 2, it["y"])
                p1 = ((p0[0] + p2[0]) / 2, min(p0[1], p2[1]) - 150)
                pos = bez(p0, p1, p2, e_out(k) * .3 + k * .7)
                block(c, pos[0], pos[1], rot=lerp(-35 * face, it["rot"], e_out(k)))
                continue
            sq = math.sin(math.pi * prog(t, it["land"], it["land"] + 0.12))
            dy = 0
            tint = None
            if side == "R" and t > self.T_CONTACT:
                comp = 3 * e_io(prog(t, self.T_CONTACT, self.T_MAX)) * (1 - prog(t, self.T_RET0, self.T_RET1))
                dy = comp * (it["row"] / self.ROWS)
                glow = math.sin(math.pi * prog(t, self.T_CONTACT, self.T_RET1))
                tint = mixc(BLOCK, "#FFC9A6", 0.35 * glow)
            # stress cracks on the left top row just before it breaks
            block(c, it["x"] + BW / 2, it["y"] + dy + 3 * sq, it["rot"], sx=1 + .05 * sq, sy=1 - .1 * sq, tint=tint)
            if side == "L" and t >= self.T_CONTACT:
                tb = self.row_break[it["row"]]
                kc = prog(t, tb - 0.25, tb)
                if kc > 0:
                    x0 = it["x"] + 12
                    yy = it["y"] - 10
                    path = skia.Path().moveTo(x0, yy).lineTo(x0 + 14 * kc, yy + 10 * kc).lineTo(x0 + 8 * kc, yy + 20 * kc).lineTo(x0 + 30 * kc, yy + 24 * kc)
                    c.drawPath(path, stroke(MOLTEN, 2.5, 255 * kc))
        # load path chevrons through the right stack while it holds
        if side == "R":
            kg = prog(t, self.T_CONTACT, self.T_CONTACT + 0.4) * (1 - prog(t, self.T_RET0, self.T_RET0 + 0.4))
            if kg > 0:
                for i in range(3):
                    ph = (t * 1.4 + i / 3) % 1
                    y = lerp(self.stack_top + 10, GY + 60, ph)
                    a = 230 * kg * math.sin(math.pi * ph)
                    for dx in (-26, 26):
                        c.drawPath(skia.Path().moveTo(self.RP + dx - 12, y - 8).lineTo(self.RP + dx, y + 4).lineTo(self.RP + dx + 12, y - 8), stroke(MOLTEN, 4, a))

    def draw_shards(self, c, t):
        for s in self.shards:
            dt = t - s["t0"]
            if dt < 0 or dt > 3:
                continue
            x = s["x"] + s["vx"] * dt
            y = s["y"] + s["vy"] * dt + 0.5 * 2400 * dt * dt
            rot = s["w"] * dt
            floor = GY - s["s"] * 0.4
            if y > floor:
                # settle on the floor (no second bounce, keeps the rubble neat)
                tland = (-s["vy"] + math.sqrt(max(0, s["vy"] ** 2 + 2 * 2400 * (floor - s["y"])))) / 2400
                x = s["x"] + s["vx"] * (tland + 0.25 * (1 - math.exp(-(dt - tland) * 6)))
                y = floor
                rot = s["w"] * tland
            x = clamp(x, self.LP - 210, self.LP + 210)
            c.save()
            c.translate(x, y)
            c.rotate(rot)
            sz = s["s"]
            c.drawPath(skia.Path().moveTo(-sz / 2, sz / 3).lineTo(0, -sz / 2).lineTo(sz / 2, sz / 4).close(), fill(BLOCK_DK))
            c.restore()
        # dust
        for r, tb in self.row_break.items():
            k = prog(t, tb, tb + 0.7)
            if 0 < k < 1:
                p = fill("#6B665C", 90 * (1 - k))
                p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 14))
                for dx in (-110, 110):
                    c.drawCircle(self.LP + dx * e_out(k), GY - BH / 2 - r * BH, 20 + 40 * k, p)

    def poses(self, t):
        # left (grey): fast tossing, then relaxes, then devastated
        lp = {"L": (self.LF - 26, GY - 140), "R": (self.LF + 26, GY - 140)}
        for it in self.L:
            if it["t0"] - 0.12 <= t < it["t0"] + 0.05:
                ph = prog(t, it["t0"] - 0.12, it["t0"] + 0.05)
                lp = {"L": (self.LF - 10, GY - 180), "R": lerp2((self.LF + 40, GY - 130), (self.LF + 46, GY - 236), e_out(ph)), "lean": 6}
        if self.L_done + 0.2 < t < self.T_CONTACT:          # leans back, hands behind head
            k = e_io(prog(t, self.L_done + 0.2, self.L_done + 0.7))
            lp = {"L": lerp2((self.LF - 26, GY - 140), (self.LF - 16, GY - 262), k), "R": lerp2((self.LF + 26, GY - 140), (self.LF + 18, GY - 262), k),
                  "Lb": -1, "Rb": 1, "lean": -8 * k, "hy": -4 * k}
        if self.T_CONTACT <= t < self.row_break[0] + 0.5:   # hands up in alarm
            lp = {"L": (self.LF - 40, GY - 250), "R": (self.LF + 50, GY - 255), "hy": -4, "eyes_dy": -4}
        if t >= self.row_break[0] + 0.5:
            k = e_io(prog(t, self.row_break[0] + 0.5, self.row_break[0] + 1.1))
            lp = {"sit": k, "L": (self.LF + 30, GY - 96), "R": (self.LF + 60, GY - 92), "hy": 10 * k, "eyes_dy": 4 * k, "lean": 14 * k, "sad": True}
        # right (orange): steady tossing, then watches the press, then hands on hips
        rp = {"L": (self.RF - 26, GY - 140), "R": (self.RF + 26, GY - 140)}
        for it in self.R:
            if it["t0"] - 0.2 <= t < it["t0"] + 0.05:
                ph = prog(t, it["t0"] - 0.2, it["t0"] + 0.05)
                rp = {"R": (self.RF + 10, GY - 180), "L": lerp2((self.RF - 40, GY - 130), (self.RF - 46, GY - 236), e_out(ph)), "lean": -6}
        if t >= self.T_CONTACT:
            k = e_io(prog(t, self.T_RET1, self.T_RET1 + 0.5))
            rp = {"L": (self.RF - 34, GY - 128), "R": (self.RF + 34, GY - 128), "hy": -4 * k, "hx": -6}
        return lp, rp

    def frame(self, t):
        surf = skia.Surface(W, H)
        c = surf.getCanvas()
        B.sky(c)
        z = 1.12 * (1 + 0.03 * e_sine(prog(t, 0, self.T_TEXT)))
        sx = sy = 0
        for tb in self.row_break.values():
            k = prog(t, tb, tb + 0.18)
            if 0 < k < 1:
                sx += 5 * (1 - k) * math.sin(t * 90)
                sy += 4 * (1 - k) * math.cos(t * 77)
        c.save()
        c.translate(W / 2 + sx, GY - 120 + sy)
        c.scale(z, z)
        c.translate(-W / 2, -(GY - 120))
        B.lamp(c, self.LP, 440, 590, GY, 0.75)
        B.lamp(c, self.RP, 440, 590, GY, 1.0, warm=True)
        B.earth(c, GY)
        # footing under the right press only (the year of work)
        c.drawRect(skia.Rect.MakeXYWH(self.RP - 120, GY, 240, 120), fill("#3A3730"))
        c.drawRect(skia.Rect.MakeXYWH(self.RP - 120, GY, 240, 120), stroke("#5A564C", 2))
        B.ground_line(c, GY)
        self.draw_press(c, self.LP, t, "L")
        self.draw_press(c, self.RP, t, "R")
        self.draw_stack(c, self.L, t, "L", self.LF, 1)
        self.draw_stack(c, self.R, t, "R", self.RF, -1)
        self.draw_shards(c, t)
        lp, rp = self.poses(t)
        B.figure(c, self.LF, GY, {**lp, "blink": B.blink_at(t, 3.3)}, hero=False, face=1)
        B.figure(c, self.RF, GY, {**rp, "blink": B.blink_at(t, 4.1, .7)}, hero=True, face=-1)
        # lane labels
        k = e_out(prog(t, 0.2, 0.9)) * (1 - prog(t, self.T_TEXT - .4, self.T_TEXT))
        dl = 1 + int(6 * prog(t, 1.0, self.L_done))
        dr = 1 + int(364 * e_sine(prog(t, 1.0, self.R_done)))
        tb0 = self.row_break[self.ROWS - 1]
        subl = f"BUILT IN {dl} DAYS" if t < tb0 else f"FAILED AT {int(round(self.pressure(tb0)))} T"
        subr = f"BUILT IN {dr} DAYS" if t < self.T_MAX else "HELD 50 T"
        B.lane_label(c, self.LP, 690, "FAST", subl, MOLTEN if subl.startswith("FAILED") else GRAPH, 255 * k)
        B.lane_label(c, self.RP, 690, "SOLID", subr, MOLTEN if t >= self.T_MAX else GRAPH, 255 * k, hero=True)
        c.restore()

        kh = 1 - prog(t, self.T_TEXT - 0.4, self.T_TEXT)
        B.title(c, "SAME PRESSURE.", 300, 255 * kh)
        km = prog(t, self.T_DESC0 - 0.3, self.T_DESC0) * kh
        if km > 0:
            p = self.pressure(t)
            B.meter(c, 340, 370, 400, p / 50, "PRESSURE", f"{p:4.1f} T", MOLTEN, 255 * km)
        else:
            text(c, "DAY 001 → 365", 540, 366, font("mono", 28), GRAPH, 255 * kh * prog(t, .3, 1), "c", tracking=6)
        if t >= self.T_TEXT:
            B.verdict(c, t, self.T_TEXT + 0.1, "Pressure doesn't break you.", "It shows how you were built.", 400, self.T_STING)
        B.sting(c, t, self.T_STING)
        return B.finish(surf, EP, t, self.T_STING, self.DUR)

    def sound(self, path):
        m = S.Mix(self.DUR)
        for it in self.L:
            m.add(S.whoosh(0.16, 700, 1900), it["t0"], 0.18, pan=-0.4, send=0.1)
            m.add(S.block_knock(1.15 + S.rng.uniform(-.06, .06), 0.8), it["land"], 0.5, pan=-0.45, send=0.2)
        for i, it in enumerate(self.R):
            m.add(S.whoosh(0.2, 500, 1500), it["t0"], 0.18, pan=0.4, send=0.1)
            m.add(S.block_knock(0.85 + 0.15 * i / len(self.R), 1.25), it["land"], 0.6, pan=0.45, send=0.22)
            m.add(S.trowel(0.25), it["land"] + 0.05, 0.25, pan=0.45, send=0.15)
        m.add(S.hydraulic(self.T_CONTACT - self.T_DESC0 + 0.2), self.T_DESC0, 0.55, send=0.2)
        m.add(S.block_knock(0.6, 1.6), self.T_CONTACT, 0.55, pan=-0.3, send=0.3)
        m.add(S.block_knock(0.55, 1.6), self.T_CONTACT + 0.02, 0.55, pan=0.3, send=0.3)
        m.add(S.hydraulic(self.T_MAX - self.T_CONTACT + 0.6, True), self.T_CONTACT, 0.75, send=0.25)
        for r, tb in self.row_break.items():
            m.add(S.crunch(), tb, 0.75, pan=-0.45, send=0.3)
            m.add(S.gravel(10, 0.4), tb + 0.25, 0.5, pan=-0.6, send=0.2)
        m.add(S.strain(self.T_MAX - self.T_CONTACT), self.T_CONTACT, 0.6, pan=0.45, send=0.3)
        m.add(S.sub_hit(38, 0.9), self.T_MAX, 0.5, pan=0.4, send=0.3)       # the motor stalls
        m.add(S.hiss(1.0), self.T_RET0, 0.6, pan=0.0, send=0.3)
        m.add(S.hydraulic(self.T_RET1 - self.T_RET0, False), self.T_RET0, 0.35, send=0.2)
        S.brand_bed(m, self.DUR, self.T_TEXT)
        S.sonic_logo(m, self.T_STING + B.STING_HIT)
        m.render(path)


SCENE = Press()
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        B.stills(SCENE, [float(x) for x in sys.argv[2:]], "e2")
        print(B.sheet("e2", 7))
    else:
        SCENE.sound("out/ep002.wav")
        B.render(SCENE, "out/LB002_the-press.mp4", "out/ep002.wav")
