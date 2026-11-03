"""More backgrounds for 012–021 (world coords, floor line GY). Same toon look as sets.py: flat fills, dark set lines."""
import math

import skia

from paw import W, H, C, clamp, lerp, fill, stroke, rrect, mixc, INK, LIME, CORAL
from toon import GY, ink, rr, oval, line, room
from sets import SL, _sky, cloud, bedroom, hallway, park


def _tint(c, col, a):
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, H + 900), fill(col, a))


def _glow(c, x, y, r, col, a):
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((x, y), r, [C(col, int(a)), C(col, 0)]))
    c.drawCircle(x, y, r, g)


# ---------------------------------------------------------------- bathroom
def bathroom(c, t):
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, GY), fill("#E3F4FA"))
    # big square tiles up to the dado line
    for r in range(12):
        for k in range(-8, 18):
            x, y = k * 110, GY - 600 + r * 110
            if y < GY:
                c.drawRRect(rrect(x + 4, y + 4, 102, 102, 8), fill("#FFFFFF"))
                c.drawRRect(rrect(x + 4, y + 4, 102, 102, 8), stroke("#BFE3EE", 3))
    c.drawRect(skia.Rect.MakeLTRB(-700, GY - 620, W + 700, GY - 600), fill("#7FC8D9"))
    line(c, [(-700, GY - 620), (W + 700, GY - 620)], 5, SL)
    # mirror + shelf with toothbrush cup (right)
    ink(c, [(rr(690, 300, 280, 320, 140), "#FFFFFF")], ol=5, lc=SL)
    c.drawRRect(rrect(712, 322, 236, 276, 118), fill("#C6ECF7"))
    for i in range(3):
        c.drawLine(760 + 40 * i, 360 + 30 * i, 820 + 40 * i, 300 + 30 * i + 40, stroke("#FFFFFF", 10))
    ink(c, [(rr(690, 640, 280, 22, 8), "#F2B05E")], ol=4, lc=SL)
    ink(c, [(rr(740, 586, 44, 56, 10), "#FF8FB1")], ol=4, lc=SL)
    line(c, [(752, 590), (744, 548)], 6, "#5BB8FF")
    line(c, [(772, 590), (782, 552)], 6, "#8BD15B")
    # sink pedestal
    ink(c, [(rr(770, 760, 140, GY - 760, 30), "#FFFFFF")], ol=5, lc=SL)
    ink(c, [(rr(690, 700, 300, 90, 44), "#FFFFFF")], ol=5, lc=SL)
    ink(c, [(rr(826, 660, 28, 50, 8), "#C9CED6")], ol=4, lc=SL)
    # towel ring + towel (left wall)
    c.drawCircle(150, 440, 46, stroke(SL, 8))
    towel = skia.Path().moveTo(104, 470).lineTo(196, 470).lineTo(206, 760).lineTo(94, 760).close()
    ink(c, [(towel, "#FFB3C7")], ol=5, lc=SL)
    for y in (700, 724):
        c.drawLine(98, y, 202, y, stroke("#FF8FB1", 8))
    # bathtub (far left, behind)
    ink(c, [(rr(-420, 860, 560, GY - 860, 60), "#FFFFFF")], ol=5, lc=SL)
    c.drawRRect(rrect(-400, 880, 520, 26, 13), fill("#D7F0F8"))
    for i in range(5):          # bubbles over the rim
        bx = -330 + 90 * i + 10 * math.sin(t * 1.3 + i)
        ink(c, [(oval(bx, 862 - 8 * (i % 2), 34, 26), "#FFFFFF")], ol=4, lc="#9CCFE0")
    # toilet paper roll on its holder
    ink(c, [(rr(250, 610, 70, 14, 7), "#C9CED6")], ol=4, lc=SL)
    ink(c, [(oval(285, 660, 44, 44), "#FFFFFF")], ol=5, lc=SL)
    c.drawCircle(285, 660, 12, fill("#D9D2C5"))
    tail = skia.Path().moveTo(241, 660).lineTo(241, 760).lineTo(286, 772).lineTo(330, 760).lineTo(329, 660).close()
    ink(c, [(tail, "#FFFFFF")], ol=4, lc=SL)
    # floor: small hex-ish tiles
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#BFE3EE"))
    for r in range(10):
        for k in range(-10, 24):
            x = k * 70 + (35 if r % 2 else 0)
            y = GY + 20 + r * 60
            c.drawCircle(x, y, 26, fill("#D3EEF6"))
    ink(c, [(oval(560, GY + 140, 380, 80), "#7FC8A9")], ol=5, lc=SL)
    c.drawOval(skia.Rect.MakeLTRB(240, GY + 90, 880, GY + 190), stroke("#A9DCC5", 10))
    line(c, [(-700, GY), (W + 700, GY)], 6, SL)


# ---------------------------------------------------------------- backyard with fence (k: 0 day → 1 sunset)
def backyard(c, t, k=0.0):
    _sky(c, mixc("#8FD3F7", "#FF9E6E", k), mixc("#E1F5FF", "#FFE0A8", k))
    sun_y = 280 + 360 * k
    c.drawCircle(220, sun_y, 80, fill(mixc("#FFE88A", "#FFB35C", k)))
    _glow(c, 220, sun_y, 200, mixc("#FFE88A", "#FFB35C", k), 90)
    for i, (x, y, s) in enumerate(((620, 200, 0.9), (880, 330, 0.7))):
        cloud(c, x + 25 * math.sin(t * 0.25 + i), y, s, 255 - 80 * k)
    # house wall + window (right)
    ink(c, [(rr(640, 360, 600, GY - 360, 6), mixc("#F7D9A8", "#E8B48A", k))], ol=5, lc=SL)
    for y in range(400, GY, 46):
        c.drawLine(640, y, 1240, y, stroke(mixc("#EFCB94", "#D9A27C", k), 4))
    ink(c, [(rr(760, 520, 220, 220, 14), "#FFFFFF")], ol=5, lc=SL)
    c.drawRRect(rrect(778, 538, 184, 184, 8), fill(mixc("#BDE7FF", "#FFD6A0", k)))
    c.drawRect(skia.Rect.MakeXYWH(864, 538, 12, 184), fill("#FFFFFF"))
    c.drawRect(skia.Rect.MakeXYWH(778, 624, 184, 12), fill("#FFFFFF"))
    # picket fence
    for x in range(-700, 660, 70):
        p = skia.Path().moveTo(x, GY).lineTo(x, GY - 300).lineTo(x + 25, GY - 330).lineTo(x + 50, GY - 300).lineTo(x + 50, GY).close()
        ink(c, [(p, "#FFFFFF")], ol=4, lc=SL)
    ink(c, [(rr(-700, GY - 250, 1360, 24, 6), "#FFFFFF"), (rr(-700, GY - 110, 1360, 24, 6), "#FFFFFF")], ol=4, lc=SL)
    # bush + garden hose
    bush = skia.Path()
    for dx, dy, r in ((0, 0, 70), (70, -20, 80), (140, 0, 70)):
        bush.addCircle(500 + dx, GY - 70 + dy, r)
    ink(c, [(bush, "#4FB477")], ol=5, lc=SL)
    for x, y in ((520, GY - 110), (600, GY - 140), (650, GY - 80)):
        c.drawCircle(x, y, 10, fill("#FF8FB1"))
    ink(c, [(oval(1000, GY - 40, 80, 40), "#7FD49C")], ol=5, lc=SL)
    c.drawOval(skia.Rect.MakeLTRB(940, GY - 66, 1060, GY - 14), stroke("#4FB477", 8))
    # lawn
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill(mixc("#8FD16F", "#7FB862", k)))
    for i, y in enumerate((GY + 80, GY + 200, GY + 360, GY + 560)):
        c.drawRect(skia.Rect.MakeLTRB(-700, y, W + 700, y + 40 + 10 * i), fill(mixc("#83C764", "#74AA57", k)))
    for i in range(46):
        x = (i * 131) % 1300 - 100
        y = GY + 30 + (i * 67) % 620
        line(c, [(x, y), (x - 6, y - 18)], 4, "#5FA64A")
        line(c, [(x + 8, y), (x + 12, y - 16)], 4, "#5FA64A")
    line(c, [(-700, GY), (W + 700, GY)], 5, "#5FA64A")
    if k > 0.05:
        _tint(c, "#FF8A4E", 40 * k)


# ---------------------------------------------------------------- front porch (day)
def porch(c, t):
    _sky(c, "#9ED8F7", "#E6F6FF")
    cloud(c, 120 + 20 * math.sin(t * 0.2), 200, 0.9)
    cloud(c, 820 + 20 * math.sin(t * 0.25 + 1), 150, 0.7)
    # house front
    ink(c, [(rr(-700, 300, W + 1400, GY - 300, 0), "#FFE6C2")], ol=5, lc=SL)
    for y in range(330, GY, 52):
        c.drawLine(-700, y, W + 700, y, stroke("#F5D5A8", 5))
    # front door with wreath
    dx, dy, dw, dh = 620, 470, 330, GY - 470 - 90
    ink(c, [(rr(dx - 28, dy - 28, dw + 56, dh + 28, 10), "#FFFFFF")], ol=5, lc=SL)
    ink(c, [(rr(dx, dy, dw, dh, 8), "#3FA27A")], ol=5, lc=SL)
    for px, py, pw, ph in ((dx + 36, dy + 220, 110, 200), (dx + 184, dy + 220, 110, 200), (dx + 36, dy + 460, 110, 200), (dx + 184, dy + 460, 110, 200)):
        if py + ph < dy + dh:
            c.drawRRect(rrect(px, py, pw, ph, 8), stroke("#2E7E5E", 6))
    c.drawCircle(dx + dw / 2, dy + 110, 64, stroke("#4FB477", 22))
    for a in range(8):
        aa = a * math.pi / 4
        c.drawCircle(dx + dw / 2 + 64 * math.cos(aa), dy + 110 + 64 * math.sin(aa), 9, fill(CORAL))
    ink(c, [(oval(dx + 46, dy + dh / 2 + 40, 16, 16), "#FFD24D")], ol=4, lc=SL)
    # porch light
    ink(c, [(rr(dx - 120, dy + 60, 50, 80, 14), "#FFE88A")], ol=4, lc=SL)
    # window (left) with flower box
    ink(c, [(rr(60, 480, 320, 300, 12), "#FFFFFF")], ol=5, lc=SL)
    c.drawRRect(rrect(80, 500, 280, 260, 8), fill("#BDE7FF"))
    c.drawRect(skia.Rect.MakeXYWH(214, 500, 12, 260), fill("#FFFFFF"))
    c.drawRect(skia.Rect.MakeXYWH(80, 624, 280, 12), fill("#FFFFFF"))
    ink(c, [(rr(50, 780, 340, 60, 10), "#C98B4E")], ol=5, lc=SL)
    for i in range(6):
        x = 80 + 55 * i
        c.drawCircle(x, 770 - 10 * (i % 2), 22, fill("#4FB477"))
        c.drawCircle(x + 6, 760 - 10 * (i % 2), 12, fill(("#FF8FB1", "#FFD24D", "#FFFFFF")[i % 3]))
    # porch deck
    c.drawRect(skia.Rect.MakeLTRB(-700, GY - 90, W + 700, GY), fill("#C98B4E"))
    line(c, [(-700, GY - 90), (W + 700, GY - 90)], 5, SL)
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#B5794A"))
    for y in (GY + 70, GY + 170, GY + 300, GY + 470):
        line(c, [(-700, y), (W + 700, y)], 4, "#9A6238")
    ink(c, [(rr(640, GY + 20, 300, 64, 14), "#E9505A")], ol=5, lc=SL)
    c.drawTextBlob(skia.TextBlob("WELCOME", skia.Font(None, 28)), 730, GY + 62, fill("#FFE6C2"))
    line(c, [(-700, GY), (W + 700, GY)], 6, SL)


# ---------------------------------------------------------------- stormy evening living room (flash 0..1)
def storm(c, t, flash=0.0, dark=1.0):
    room(c, t)
    # paint the window as a rainy night sky
    wx, wy, ww, wh = 730, 470, 280, 330
    sky = mixc("#2A3366", "#E8EEFF", flash)
    c.drawRRect(rrect(wx + 20, wy + 20, ww - 40, wh - 40, 12), fill(sky))
    for i in range(14):
        x = wx + 30 + (i * 37 + t * 900) % (ww - 60)
        y = wy + 30 + (i * 53 + t * 1400) % (wh - 80)
        c.drawLine(x, y, x - 8, y + 30, stroke("#9FB2FF", 4, 200))
    if flash > 0.2:
        bolt = skia.Path().moveTo(wx + 150, wy + 30).lineTo(wx + 120, wy + 140).lineTo(wx + 160, wy + 140).lineTo(wx + 110, wy + 280)
        c.drawPath(bolt, stroke("#FFF8B0", 10, 255 * flash))
    c.drawRect(skia.Rect.MakeXYWH(wx + ww / 2 - 7, wy + 20, 14, wh - 40), fill("#FFFFFF"))
    c.drawRect(skia.Rect.MakeXYWH(wx + 20, wy + wh / 2 - 7, ww - 40, 14), fill("#FFFFFF"))
    c.drawRRect(rrect(wx + 20, wy + 20, ww - 40, wh - 40, 12), stroke(INK, 5))
    # dusk tint + warm lamp
    _tint(c, "#1E2550", 95 * dark)
    lx, ly = 120, 900
    ink(c, [(rr(lx - 6, ly - 300, 12, 300 + (GY - ly), 4), SL), (skia.Path().moveTo(lx - 70, ly - 300).lineTo(lx + 70, ly - 300).lineTo(lx + 44, ly - 400).lineTo(lx - 44, ly - 400).close(), "#FFE3A6")], ol=4, lc=SL)
    _glow(c, lx, ly - 330, 600, "#FFE9A8", 120)
    if flash > 0:
        _tint(c, "#F4F6FF", 150 * flash)


# ---------------------------------------------------------------- bedroom at night (moonlight, laundry pile optional)
def bedroom_night(c, t, lamp=0.0):
    bedroom(c, t)
    _tint(c, "#1B2152", 150)
    # moon in the poster spot -> window
    ink(c, [(rr(690, 410, 250, 300, 14), "#FFFFFF")], ol=5, lc=SL)
    c.drawRRect(rrect(708, 428, 214, 264, 8), fill("#27306A"))
    c.drawCircle(860, 500, 44, fill("#FFF4C2"))
    c.drawCircle(878, 488, 40, fill("#27306A"))
    for i, (sx, sy) in enumerate(((740, 470), (780, 620), (900, 640), (820, 450))):
        a = 150 + 100 * math.sin(t * 2 + i * 1.7)
        c.drawCircle(sx, sy, 4, fill("#FFFFFF", a))
    c.drawRect(skia.Rect.MakeXYWH(809, 428, 12, 264), fill("#FFFFFF"))
    c.drawRect(skia.Rect.MakeXYWH(708, 554, 214, 12), fill("#FFFFFF"))
    _glow(c, 815, 900, 520, "#AFC3FF", 60)
    if lamp > 0:
        _glow(c, 495, 860, 420, "#FFE9A8", 150 * lamp)


def laundry(c, x, y, s=1.0):
    """Pile of clothes, world coords (base at y)."""
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    pieces = [(skia.Path().moveTo(-240, 0).cubicTo(-230, -70, -120, -110, -20, -90).cubicTo(80, -110, 200, -80, 240, 0).close(), "#5BB8FF"),
              (skia.Path().moveTo(-200, -30).cubicTo(-170, -120, -60, -140, 20, -110).cubicTo(-10, -60, -120, -20, -200, -30).close(), "#FF8A5B"),
              (skia.Path().moveTo(-10, -100).cubicTo(60, -150, 170, -120, 200, -50).cubicTo(130, -40, 40, -50, -10, -100).close(), "#8BD15B"),
              (skia.Path().moveTo(-120, -10).cubicTo(-60, -60, 60, -60, 120, -10).close(), "#FFD24D")]
    ink(c, pieces, ol=5, lc=SL)
    c.drawPath(skia.Path().moveTo(-150, -70).quadTo(-110, -90, -70, -76), stroke("#E0703E", 5))
    c.drawPath(skia.Path().moveTo(40, -100).quadTo(90, -120, 140, -96), stroke("#5FA64A", 5))
    c.restore()


# ---------------------------------------------------------------- cozy evening living room with a sofa
def lounge(c, t, dim=0.0):
    room(c, t)
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, H + 900), fill("#FF9E5E", 40))
    # sofa behind the characters
    back = rr(-300, 760, 1500, 330, 70)
    seat = rr(-300, 1010, 1500, 150, 40)
    ink(c, [(back, "#6E7DE8"), (seat, "#5F6ED9")], ol=6, lc=SL)
    for x in (100, 520):
        c.drawRRect(rrect(x, 800, 360, 200, 50), stroke("#5765CC", 7))
    ink(c, [(rr(-120, 820, 190, 170, 50), "#FFD24D"), (rr(860, 830, 180, 160, 50), "#FF8FB1")], ol=5, lc=SL)
    for x in (-200, 1100):
        ink(c, [(rr(x - 20, GY - 90, 40, 90, 8), "#3A2E5E")], ol=4, lc=SL)
    lx, ly = 980, 760
    _glow(c, lx, ly - 200, 520, "#FFE9A8", 120)
    if dim > 0:
        _tint(c, "#1E2550", 60 * dim)


# ---------------------------------------------------------------- split-screen halves for "long ago vs today"
def wild_grass(c, t, flat=0.0):
    """Dusk field with tall grass (flat: 0 tall → 1 trampled, around stage x≈-229)."""
    _sky(c, "#FFB27A", "#FFE6B8")
    c.drawCircle(300, 760, 90, fill("#FFD36E"))
    _glow(c, 300, 760, 260, "#FFD36E", 110)
    hill = skia.Path().moveTo(-700, GY - 200).cubicTo(-200, GY - 330, 300, GY - 240, 600, GY - 300).lineTo(1800, GY - 260).lineTo(1800, GY).lineTo(-700, GY).close()
    c.drawPath(hill, fill("#C9A66B"))
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#B98F55"))
    cx = 540 - 229 * 1.25
    for i in range(70):
        x = -60 + (i * 47) % 700
        base = GY + 20 + (i * 29) % 160
        d = abs(x - cx)
        f = flat * clamp(1 - d / 260)
        h = (180 + (i * 37) % 120) * (1 - 0.85 * f)
        sway = 10 * math.sin(t * 1.6 + i)
        lean = (40 if x > cx else -40) * f
        c.drawPath(skia.Path().moveTo(x - 7, base).quadTo(x + sway + lean * 0.5, base - h * 0.6, x + sway + lean, base - h).quadTo(x + sway * 0.5 + lean * 0.4, base - h * 0.5, x + 7, base).close(),
                   fill(("#D9B86A", "#C9A44F", "#E6C77E")[i % 3]))
    line(c, [(-700, GY), (W + 700, GY)], 5, "#8F6A3A")


def dog_bed(c, x, y, s=1.0, col="#FF8A5B"):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    ink(c, [(oval(0, 0, 300, 70), col)], ol=6, lc=SL)
    c.drawOval(skia.Rect.MakeLTRB(-230, -40, 230, 40), fill("#FFE3C9"))
    c.drawOval(skia.Rect.MakeLTRB(-230, -40, 230, 40), stroke(SL, 4))
    c.restore()


def doormat(c, x, y, s=1.0):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    ink(c, [(rr(-230, -30, 460, 70, 24), "#7FC8A9")], ol=6, lc=SL)
    c.drawRRect(rrect(-200, -16, 400, 42, 16), stroke("#A9DCC5", 6))
    c.restore()
