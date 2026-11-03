"""Extra backgrounds (world coords, same floor line GY) so every episode doesn't happen in the same room."""
import math

import skia

from paw import W, H, C, clamp, lerp, fill, stroke, rrect, mixc, INK, LIME, CORAL
from toon import GY, ink, rr, oval, line

SL = "#2B2B3A"   # set line colour


def _sky(c, top, bot, y0=-600, y1=GY):
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, y0), (0, y1)], [C(top), C(bot)]))
    c.drawRect(skia.Rect.MakeLTRB(-700, y0, W + 700, y1), p)


def cloud(c, x, y, s=1.0, a=255):
    p = skia.Path()
    for dx, dy, r in ((0, 0, 40), (40, -18, 50), (88, 0, 40), (44, 14, 40)):
        p.addCircle(x + dx * s, y + dy * s, r * s)
    ink(c, [(p, "#FFFFFF")], ol=4, a=a, lc="#7FA8C9", weight=False)


# ---------------------------------------------------------------- kitchen
def kitchen(c, t):
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, GY), fill("#FFF1D6"))
    # subway tiles behind the counter
    for r in range(8):
        for k in range(-8, 20):
            x = k * 90 + (45 if r % 2 else 0)
            y = 560 + r * 40
            c.drawRRect(rrect(x + 3, y + 3, 84, 34, 6), fill("#FFFFFF"))
            c.drawRRect(rrect(x + 3, y + 3, 84, 34, 6), stroke("#E8D9BC", 3))
    # upper cabinets
    for x in (-160, 120, 400, 680, 960):
        ink(c, [(rr(x, 150, 250, 330, 18), "#7FC8A9")], ol=5, lc=SL)
        c.drawRRect(rrect(x + 22, 172, 206, 286, 10), stroke("#5FAE8C", 5))
        c.drawRRect(rrect(x + 110, 400, 30, 10, 5), fill("#E8E2D6"))
    # counter + lower cabinets
    ink(c, [(rr(-700, 880, W + 1400, 40, 10), "#F2B05E")], ol=5, lc=SL)
    for x in (-160, 120, 400, 680, 960):
        ink(c, [(rr(x, 920, 250, GY - 920, 10), "#8ED1B4")], ol=5, lc=SL)
        c.drawRRect(rrect(x + 110, 960, 30, 10, 5), fill("#E8E2D6"))
    # fruit bowl + kettle on the counter
    ink(c, [(oval(250, 860, 40, 34), "#FF8A5B"), (oval(300, 856, 36, 36), "#FFD24D"), (oval(275, 830, 30, 30), "#8BD15B")], ol=4, lc=SL)
    ink(c, [(skia.Path().moveTo(200, 870).quadTo(280, 930, 360, 870).close(), "#5BB8FF")], ol=5, lc=SL)
    kx = 20
    ink(c, [(rr(kx, 770, 120, 110, 40), "#FF5B4E"), (rr(kx + 50, 742, 20, 30, 8), SL)], ol=5, lc=SL)
    c.drawPath(skia.Path().moveTo(kx + 110, 800).quadTo(kx + 160, 780, kx + 150, 740), stroke(SL, 8))
    for i in range(3):
        k = (t * 0.6 + i / 3) % 1
        c.drawCircle(kx + 50 + 10 * math.sin(t * 3 + i), 740 - 90 * k, 10 + 8 * k, fill("#FFFFFF", 160 * (1 - k)))
    # hanging lamp
    c.drawLine(540, -700, 540, 80, stroke(SL, 5))
    ink(c, [(skia.Path().moveTo(470, 140).quadTo(540, 40, 610, 140).close(), "#FFD24D")], ol=5, lc=SL)
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((540, 150), 520, [C("#FFF3B0", 110), C("#FFF3B0", 0)]))
    c.drawCircle(540, 150, 520, g)
    # floor: checker tiles
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#F6E7D2"))
    for r in range(8):
        for k in range(-8, 20):
            if (r + k) % 2 == 0:
                y0 = GY + r * 90
                c.drawRect(skia.Rect.MakeLTRB(k * 90, y0, k * 90 + 90, y0 + 90), fill("#E7CFAF"))
    line(c, [(-700, GY), (W + 700, GY)], 6, SL)


# ---------------------------------------------------------------- park
def park(c, t):
    _sky(c, "#7EC8F2", "#D8F1FF")
    sx = 880
    c.drawCircle(sx, 260, 70, fill("#FFE88A"))
    c.drawCircle(sx, 260, 110, fill("#FFE88A", 70))
    for i, (x, y, s) in enumerate(((120, 220, 1.0), (560, 140, 0.8), (900, 420, 0.7))):
        cloud(c, x + 20 * math.sin(t * 0.2 + i), y, s)
    # far hills
    hill = skia.Path().moveTo(-700, GY - 260).cubicTo(-200, GY - 420, 300, GY - 300, 600, GY - 360).cubicTo(900, GY - 420, 1300, GY - 300, 1800, GY - 340).lineTo(1800, GY).lineTo(-700, GY).close()
    c.drawPath(hill, fill("#9BD38A"))
    hill2 = skia.Path().moveTo(-700, GY - 150).cubicTo(-100, GY - 260, 500, GY - 140, 900, GY - 220).cubicTo(1200, GY - 270, 1500, GY - 180, 1800, GY - 200).lineTo(1800, GY).lineTo(-700, GY).close()
    c.drawPath(hill2, fill("#7CC46E"))
    # trees
    for tx, ty, s in ((40, GY - 40, 1.0), (980, GY - 60, 1.15), (700, GY - 200, 0.6)):
        ink(c, [(rr(tx - 18 * s, ty - 260 * s, 36 * s, 260 * s, 12), "#9A6A3E")], ol=5, lc=SL)
        crown = skia.Path()
        for dx, dy, r in ((0, -300, 110), (-80, -240, 80), (80, -240, 85), (0, -200, 90)):
            crown.addCircle(tx + dx * s, ty + dy * s, r * s)
        ink(c, [(crown, "#4FB477")], ol=5, lc=SL)
        c.drawCircle(tx - 30 * s, ty - 330 * s, 26 * s, fill("#7FD49C"))
    # bench
    ink(c, [(rr(760, GY - 150, 240, 22, 8), "#C98B4E"), (rr(760, GY - 110, 240, 22, 8), "#C98B4E"),
            (rr(780, GY - 120, 18, 120, 6), "#6E4A2A"), (rr(960, GY - 120, 18, 120, 6), "#6E4A2A")], ol=4, lc=SL)
    # grass
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#8FD16F"))
    for i, y in enumerate((GY + 70, GY + 180, GY + 330, GY + 520)):
        c.drawRect(skia.Rect.MakeLTRB(-700, y, W + 700, y + 40 + 10 * i), fill("#83C764"))
    for i in range(40):
        x = (i * 137) % 1300 - 100
        y = GY + 30 + (i * 71) % 600
        line(c, [(x, y), (x - 6, y - 18)], 4, "#5FA64A")
        line(c, [(x + 8, y), (x + 12, y - 16)], 4, "#5FA64A")
    for x, y, col in ((180, GY + 420, "#FFFFFF"), (900, GY + 300, "#FFD24D"), (620, GY + 560, "#FF8FB1")):
        for k in range(5):
            a = k * 2 * math.pi / 5
            c.drawCircle(x + 10 * math.cos(a), y + 10 * math.sin(a), 8, fill(col))
        c.drawCircle(x, y, 6, fill("#FFB02E"))
    line(c, [(-700, GY), (W + 700, GY)], 5, "#5FA64A")


# ---------------------------------------------------------------- hallway with front door (k: 0 day → 1 night)
def hallway(c, t, k=0.0):
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, GY), fill("#F7E3C4"))
    for x in range(-700, W + 700, 60):
        c.drawRect(skia.Rect.MakeLTRB(x, -700, x + 26, GY), fill("#F2D9B4"))
    c.drawRect(skia.Rect.MakeLTRB(-700, GY - 200, W + 700, GY), fill("#E9C99E"))
    line(c, [(-700, GY - 200), (W + 700, GY - 200)], 5, SL)
    # door (right)
    dx, dy, dw, dh = 640, 420, 340, GY - 420
    ink(c, [(rr(dx - 26, dy - 26, dw + 52, dh + 26, 10), "#FFFFFF")], ol=5, lc=SL)
    ink(c, [(rr(dx, dy, dw, dh, 8), "#C9844E")], ol=5, lc=SL)
    for px, py, pw, ph in ((dx + 34, dy + 160, 120, 230), (dx + 186, dy + 160, 120, 230), (dx + 34, dy + 430, 120, 300), (dx + 186, dy + 430, 120, 300)):
        c.drawRRect(rrect(px, py, pw, ph, 8), stroke("#A96A38", 6))
    # door window shows the sky
    sky = mixc(mixc("#A8DCFF", "#FF9E6E", clamp(k * 2)), "#2C3366", clamp(k * 2 - 1))
    ink(c, [(rr(dx + 60, dy + 40, dw - 120, 90, 40), sky)], ol=5, lc=SL)
    if k > 0.6:
        for i in range(4):
            c.drawCircle(dx + 90 + 50 * i, dy + 70 + 12 * (i % 2), 3, fill("#FFFFFF", 220 * (k - 0.6) / 0.4))
    ink(c, [(oval(dx + 46, dy + dh / 2 + 30, 16, 16), "#FFD24D")], ol=4, lc=SL)
    # coat hooks + coat, key bowl
    ink(c, [(rr(120, 470, 300, 22, 8), "#C9844E")], ol=4, lc=SL)
    coat = skia.Path().moveTo(180, 490).cubicTo(130, 560, 120, 760, 150, 820).lineTo(260, 820).cubicTo(280, 740, 260, 560, 210, 490).close()
    ink(c, [(coat, "#FF8A5B")], ol=5, lc=SL)
    ink(c, [(skia.Path().moveTo(330, 492).cubicTo(300, 540, 300, 640, 340, 660).cubicTo(380, 640, 380, 540, 350, 492).close(), "#7FC8A9")], ol=5, lc=SL)
    # doormat
    ink(c, [(rr(650, GY + 30, 320, 60, 14), "#D9A05B")], ol=5, lc=SL)
    # floor
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#D9A877"))
    for y in (GY + 80, GY + 200, GY + 360, GY + 560):
        line(c, [(-700, y), (W + 700, y)], 4, "#C4925F")
    ink(c, [(rr(650, GY + 30, 320, 60, 14), "#B5734A")], ol=5, lc=SL)
    c.drawTextBlob(skia.TextBlob("HOME", skia.Font(None, 30)), 770, GY + 70, fill("#F7E3C4"))
    line(c, [(-700, GY), (W + 700, GY)], 6, SL)
    # evening tint over the whole set
    if k > 0.05:
        c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, H + 900), fill(mixc("#FF9E6E", "#1E2550", clamp(k * 2 - 1)), 70 * k))


# ---------------------------------------------------------------- bedroom
def bedroom(c, t):
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, GY), fill("#DCD3F5"))
    for r in range(22):
        for k in range(-6, 18):
            if (r + k) % 3 == 0:
                x, y = k * 90 + (45 if r % 2 else 0), r * 90 - 520
                if y < GY - 40:
                    c.drawPath(skia.Path().moveTo(x, y - 8).lineTo(x + 3, y - 2).lineTo(x + 9, y).lineTo(x + 3, y + 2).lineTo(x, y + 8).lineTo(x - 3, y + 2).lineTo(x - 9, y).lineTo(x - 3, y - 2).close(), fill("#C8BDF0"))
    # poster
    ink(c, [(rr(700, 420, 230, 280, 10), "#FFFFFF")], ol=5, lc=SL)
    c.drawRect(skia.Rect.MakeXYWH(720, 440, 190, 240), fill("#FFB3C7"))
    c.drawCircle(815, 540, 60, fill("#FFE88A"))
    c.drawPath(skia.Path().moveTo(720, 680).lineTo(790, 590).lineTo(840, 640).lineTo(880, 600).lineTo(910, 680).close(), fill("#8ED1B4"))
    # bed (left) with blanket + pillows
    ink(c, [(rr(-200, 820, 560, 70, 20), "#A97B5A"), (rr(-200, 700, 60, 300, 20), "#A97B5A")], ol=5, lc=SL)
    ink(c, [(rr(-160, 860, 520, 120, 30), "#FFFFFF")], ol=5, lc=SL)
    blanket = skia.Path().moveTo(-120, 880).cubicTo(60, 850, 220, 870, 370, 880).lineTo(380, 1010).cubicTo(200, 1030, 0, 1020, -120, 1010).close()
    ink(c, [(blanket, "#7C8CF8")], ol=5, lc=SL)
    for x in (-40, 60, 160, 260):
        c.drawCircle(x, 950, 14, fill("#AFB8FF"))
    ink(c, [(rr(-150, 800, 170, 90, 40), "#FFE3EC")], ol=5, lc=SL)
    # nightstand + lamp
    ink(c, [(rr(420, 960, 150, 160, 12), "#C98B4E"), (rr(470, 880, 50, 80, 10), "#FFFFFF")], ol=5, lc=SL)
    ink(c, [(skia.Path().moveTo(440, 900).lineTo(550, 900).lineTo(525, 820).lineTo(465, 820).close(), "#FFD24D")], ol=5, lc=SL)
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((495, 860), 300, [C("#FFF3B0", 120), C("#FFF3B0", 0)]))
    c.drawCircle(495, 860, 300, g)
    c.drawRect(skia.Rect.MakeLTRB(-700, GY, W + 700, H + 900), fill("#C9B49A"))
    ink(c, [(oval(560, GY + 130, 430, 90), "#8ED1B4")], ol=5, lc=SL)
    c.drawOval(skia.Rect.MakeLTRB(200, GY + 70, 920, GY + 190), stroke("#B7E6D1", 10))
    line(c, [(-700, GY), (W + 700, GY)], 6, SL)


# ---------------------------------------------------------------- warm evening living room
def evening(c, t, base):
    base(c, t)
    c.drawRect(skia.Rect.MakeLTRB(-700, -700, W + 700, H + 900), fill("#FF9E5E", 45))
    lx, ly = 100, 900
    ink(c, [(rr(lx - 6, ly - 300, 12, 300 + (GY - ly), 4), SL), (skia.Path().moveTo(lx - 70, ly - 300).lineTo(lx + 70, ly - 300).lineTo(lx + 44, ly - 400).lineTo(lx - 44, ly - 400).close(), "#FFE3A6")], ol=4, lc=SL)
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((lx, ly - 330), 560, [C("#FFE9A8", 120), C("#FFE9A8", 0)]))
    c.drawCircle(lx, ly - 330, 560, g)
