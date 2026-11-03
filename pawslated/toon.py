"""PAWSLATED — cartoon (TV-show) style kit: inked shapes, room set, dog 'Biscuit', owner, camera, stickers."""
import math

import skia

from paw import (W, H, C, clamp, prog, e_out, e_io, e_back, lerp, lerp2, fill, stroke, rrect, tw, text,
                 INK, LIME, CORAL, MINT, CREAM, CARAMEL, CARAMEL_DK, CHEST, MOUTH, TONGUE, HERE, ik)
import os

OL = 7
GY = 1250                      # floor line (world)
STAGE = (540, GY, 1.25)        # stage origin + scale: characters are drawn in stage units
TFF = {w: skia.Typeface.MakeFromFile(os.path.join(HERE, f"Fredoka-{w}.ttf")) for w in (500, 600, 700)}
_fc = {}

SKIN, SKIN_DK = "#F4C49B", "#E2A57A"
HAIR = "#3B2A22"
SHIRT, SHIRT_DK = "#5B7CFA", "#4763D6"
PANTS = "#2E3A63"
WALL, WALL2 = "#CFE8DA", "#BCDDCB"
WOOD, WOOD_DK = "#EDBE8C", "#D9A270"
RUG, RUG2 = "#F7A48F", "#FBC3B3"
SKY = "#A8DCFF"
SWEAT = "#9AD7FF"
HEART = "#FF5B7A"


def ff(w, size):
    k = (w, size)
    if k not in _fc:
        f = skia.Font(TFF[w], size)
        f.setSubpixel(True)
        f.setEdging(skia.Font.Edging.kAntiAlias)
        _fc[k] = f
    return _fc[k]


# ---------------------------------------------------------------- inked shapes
def oval(cx, cy, rx, ry):
    p = skia.Path()
    p.addOval(skia.Rect.MakeLTRB(cx - rx, cy - ry, cx + rx, cy + ry))
    return p


def rr(x, y, w, h, r):
    p = skia.Path()
    p.addRRect(rrect(x, y, w, h, r))
    return p


def ink(c, items, ol=OL, a=255, lc=INK, weight=True):
    """items: (path, color[, stroke width]). Outline pass (with a heavier offset pass = brush weight on the
    shadow side), then fill pass — shapes in one call merge into one silhouette."""
    passes = [((2.6, 3.4), 2 * ol + 1.5), ((0, 0), 2 * ol)] if weight else [((0, 0), 2 * ol)]
    for (dx, dy), w in passes:
        if dx or dy:
            c.save()
            c.translate(dx, dy)
        for it in items:
            p = it[0]
            c.drawPath(p, stroke(lc, (it[2] + w) if len(it) > 2 else w, a))
        if dx or dy:
            c.restore()
    for it in items:
        p, col = it[0], it[1]
        if len(it) > 2:
            c.drawPath(p, stroke(col, it[2], a))
        else:
            c.drawPath(p, fill(col, a))


def line(c, pts, w=6, col=INK, a=255, curve=None):
    p = skia.Path().moveTo(*pts[0])
    if curve:
        p.quadTo(*curve, *pts[1])
    else:
        for q in pts[1:]:
            p.lineTo(*q)
    c.drawPath(p, stroke(col, w, a))


def shade(c, path, dx, dy, col, a=110):
    """Cel shading: darken the crescent of `path` that a copy shifted by (dx, dy) does not cover."""
    lit = skia.Path(path)
    lit.offset(dx, dy)
    c.save()
    c.clipPath(path, skia.ClipOp.kIntersect, True)
    c.clipPath(lit, skia.ClipOp.kDifference, True)
    c.drawPaint(fill(col, a))
    c.restore()


def soft_shadow(c, x, y, rx, ry, a=55):
    p = fill("#2A3B33", a)
    p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 8))
    c.drawOval(skia.Rect.MakeLTRB(x - rx, y - ry, x + rx, y + ry), p)


# ---------------------------------------------------------------- room set (world coords)
def room(c, t):
    c.drawRect(skia.Rect.MakeLTRB(-600, -600, W + 600, GY), fill(WALL))
    # wallpaper dots
    for row in range(0, 22):
        for col in range(-6, 18):
            x = col * 90 + (45 if row % 2 else 0)
            y = row * 90 - 520
            if y < GY - 260:
                c.drawCircle(x, y, 6, fill(WALL2))
    # wainscot
    c.drawRect(skia.Rect.MakeLTRB(-600, GY - 250, W + 600, GY), fill(WALL2))
    c.drawRect(skia.Rect.MakeLTRB(-600, GY - 262, W + 600, GY - 246), fill("#FFFFFF"))
    line(c, [(-600, GY - 262), (W + 600, GY - 262)], 5)
    line(c, [(-600, GY - 246), (W + 600, GY - 246)], 5)
    # window (right)
    wx, wy, ww, wh = 730, 470, 280, 330
    ink(c, [(rr(wx, wy, ww, wh, 22), "#FFFFFF")])
    c.drawRRect(rrect(wx + 20, wy + 20, ww - 40, wh - 40, 12), fill(SKY))
    cx = wx + 110 + 18 * math.sin(t * 0.4)
    for dx, r in ((0, 26), (30, 34), (64, 24)):
        c.drawCircle(cx + dx, wy + 120, r, fill("#FFFFFF"))
    c.drawRect(skia.Rect.MakeXYWH(wx + ww / 2 - 7, wy + 20, 14, wh - 40), fill("#FFFFFF"))
    c.drawRect(skia.Rect.MakeXYWH(wx + 20, wy + wh / 2 - 7, ww - 40, 14), fill("#FFFFFF"))
    c.drawRRect(rrect(wx + 20, wy + 20, ww - 40, wh - 40, 12), stroke(INK, 5))
    ink(c, [(rr(wx - 16, wy + wh - 6, ww + 32, 26, 10), "#FFFFFF")])
    # picture frame with a bone (left)
    fx, fy = 70, 560
    ink(c, [(rr(fx, fy, 200, 160, 14), "#F6D365")])
    c.drawRRect(rrect(fx + 18, fy + 18, 164, 124, 8), fill("#FFF6E0"))
    c.save()
    c.translate(fx + 100, fy + 80)
    c.rotate(-20)
    ink(c, [(rr(-44, -10, 88, 20, 10), "#FFFFFF"), (oval(-46, -10, 14, 14), "#FFFFFF"), (oval(-46, 10, 14, 14), "#FFFFFF"),
            (oval(46, -10, 14, 14), "#FFFFFF"), (oval(46, 10, 14, 14), "#FFFFFF")], ol=4)
    c.restore()
    # floor
    c.drawRect(skia.Rect.MakeLTRB(-600, GY, W + 600, H + 900), fill(WOOD))
    for i, y in enumerate((GY + 60, GY + 150, GY + 270, GY + 430, GY + 640)):
        line(c, [(-600, y), (W + 600, y)], 4, WOOD_DK)
        off = (i % 2) * 160
        for x in range(-600 + off, W + 600, 330):
            line(c, [(x, y - (y - (GY if i == 0 else (GY + 60, GY + 150, GY + 270, GY + 430)[i - 1]))), (x, y)], 4, WOOD_DK)
    line(c, [(-600, GY), (W + 600, GY)], 6)
    # rug
    ink(c, [(oval(560, GY + 120, 470, 92), RUG)])
    c.drawOval(skia.Rect.MakeLTRB(560 - 400, GY + 120 - 64, 560 + 400, GY + 120 + 64), stroke(RUG2, 12))
    c.drawOval(skia.Rect.MakeLTRB(560 - 330, GY + 120 - 42, 560 + 330, GY + 120 + 42), stroke(RUG2, 8))
    # plant (far right)
    px, py = 1010, GY
    for ang, ln in ((-35, 230), (-10, 280), (15, 250), (-60, 170), (40, 190)):
        a = math.radians(ang - 90 + 3 * math.sin(t * 1.3 + ang))
        tip = (px + ln * math.cos(a), py - 120 + ln * math.sin(a))
        mid = (px + ln * 0.5 * math.cos(a) - 30, py - 120 + ln * 0.5 * math.sin(a))
        leaf = skia.Path().moveTo(px, py - 110).quadTo(*mid, *tip).quadTo(mid[0] + 60, mid[1] + 10, px, py - 110).close()
        ink(c, [(leaf, "#4FB477")], ol=5)
    ink(c, [(skia.Path().moveTo(px - 70, py - 140).lineTo(px + 70, py - 140).lineTo(px + 52, py).lineTo(px - 52, py).close(), "#E8875C")], ol=6)


# ---------------------------------------------------------------- the dog (Biscuit), facing left, stage units
DL = "#3A2416"            # dog line colour (dark brown, not black)
FUR_HI = "#E9B579"
FUR_SH = "#A8662F"


def brow(c, x1, y1, x2, y2, w=11, col=CARAMEL_DK):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L * w, dx / L * w
    p = skia.Path().moveTo(x1, y1).quadTo(mx + nx, my + ny, x2, y2).quadTo(mx - nx * 0.2, my - ny * 0.2, x1, y1).close()
    c.drawPath(p, fill(col))


def tail_path(t0, ang, wag_t):
    pts = []
    for i in range(13):
        u = i / 12
        a = ang + 0.55 * u + 0.12 * math.sin(wag_t + u * 2)
        r = 112 * u
        pts.append((t0[0] + r * math.cos(a), t0[1] + r * math.sin(a), 20 * (1 - u) + 7))
    left, right = [], []
    for i, (x, y, w) in enumerate(pts):
        x2, y2, _ = pts[min(i + 1, 12)] if i < 12 else pts[11]
        dx, dy = (x2 - x, y2 - y) if i < 12 else (x - x2, y - y2)
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L * w, dx / L * w
        left.append((x + nx, y + ny))
        right.append((x - nx, y - ny))
    p = skia.Path().moveTo(*left[0])
    for q in left[1:]:
        p.lineTo(*q)
    tip = pts[-1]
    p.quadTo(tip[0] + 14 * math.cos(ang + 0.55), tip[1] + 14 * math.sin(ang + 0.55), *right[-1])
    for q in reversed(right[:-1]):
        p.lineTo(*q)
    p.close()
    return p


def dog_head(c, st, t):
    """Head in head-local coords (same frame as the body; pivot handled by caller)."""
    ears, whale, yawn = st.get("ears", 0), st.get("whale", 0), st.get("yawn", 0)
    lick, happy = st.get("lick", 0), st.get("happy", 0)
    stress = max(ears, whale, st.get("turn", 0))
    # collar + bone tag
    c.save()
    c.translate(-46, -268)
    c.rotate(-14)
    band = skia.Path().moveTo(-72, -12).cubicTo(-30, -22, 30, -22, 72, -12).lineTo(72, 14).cubicTo(30, 6, -30, 6, -72, 14).close()
    ink(c, [(band, LIME)], ol=5, lc=DL)
    for k in range(5):
        c.drawCircle(-50 + 25 * k, 1, 3.2, fill("#8DB21E"))
    c.restore()
    c.save()
    c.translate(-84, -236)
    c.rotate(-20 + 6 * math.sin(t * 3))
    bone = skia.Path()
    bone.addRRect(rrect(-14, -6, 28, 12, 6))
    for bx, by in ((-14, -6), (-14, 6), (14, -6), (14, 6)):
        bone.addCircle(bx, by, 7)
    ink(c, [(bone, "#FFD84D")], ol=3.5, lc=DL)
    c.restore()
    # lower jaw + mouth interior
    hinge = (-96, -302)
    grin = st.get("grin", 0)
    op = max(yawn, 0.42 * grin)
    jaw = 46 * e_out(clamp(op))
    if op > 0.02:
        jp = (hinge[0] - 112 * math.cos(math.radians(jaw)), hinge[1] + 112 * math.sin(math.radians(jaw)))
        inside = skia.Path().moveTo(*hinge).lineTo(-206, -314).quadTo(-200, (-314 + jp[1]) / 2, jp[0], jp[1]).close()
        ink(c, [(inside, MOUTH)], ol=5, lc=DL)
        c.save()
        c.clipPath(inside, skia.ClipOp.kIntersect, True)
        c.translate(*hinge)
        c.rotate(-jaw * 0.85)
        c.drawOval(skia.Rect.MakeXYWH(-104, -6, 80, 34), fill(TONGUE))
        c.drawLine(-64, 4, -64, 20, stroke("#D86A6A", 3))
        c.restore()
        # little fangs
        c.drawPath(skia.Path().moveTo(-196, -314).lineTo(-188, -298).lineTo(-182, -313).close(), fill("#FFFFFF"))
        if grin > 0.3:
            c.save()
            c.translate(*hinge)
            c.rotate(-jaw * 0.85)
            tg = skia.Path().moveTo(-84, 8).cubicTo(-98, 44 + 30 * grin, -50, 62 + 30 * grin, -40, 12).close()
            ink(c, [(tg, TONGUE)], ol=4, lc=DL)
            c.drawLine(-64, 18, -62, 42 + 20 * grin, stroke("#D86A6A", 4))
            c.restore()
    c.save()
    c.translate(*hinge)
    c.rotate(-jaw)
    jawp = skia.Path().moveTo(6, -8).cubicTo(-30, -14, -96, -12, -114, 0).cubicTo(-122, 18, -96, 30, -56, 28).cubicTo(-18, 26, 6, 16, 6, -8).close()
    ink(c, [(jawp, CHEST)], ol=5, lc=DL)
    c.restore()
    # skull + cheek tuft + muzzle (one silhouette)
    skull = skia.Path().moveTo(-150, -404).cubicTo(-140, -452, -60, -464, -6, -432).cubicTo(40, -402, 46, -322, 12, -286)
    skull.cubicTo(-20, -258, -70, -262, -96, -296).cubicTo(-112, -322, -132, -380, -150, -404).close()
    tuft = skia.Path().moveTo(-34, -300).lineTo(-18, -258).lineTo(-6, -284).lineTo(12, -262).lineTo(14, -292).lineTo(30, -280).lineTo(24, -312).close()
    muzzle = skia.Path().moveTo(-118, -404).cubicTo(-160, -412, -208, -400, -228, -372).cubicTo(-242, -350, -232, -318, -206, -308)
    muzzle.cubicTo(-170, -298, -122, -300, -96, -306).cubicTo(-80, -332, -90, -390, -118, -404).close()
    ink(c, [(tuft, CARAMEL), (skull, CARAMEL), (muzzle, CHEST)], ol=6.5, lc=DL)
    shade(c, skull, -20, -22, FUR_SH, 95)
    c.save()
    c.clipPath(skull, skia.ClipOp.kIntersect, True)
    c.drawOval(skia.Rect.MakeXYWH(-120, -452, 110, 52), fill(FUR_HI, 220))      # forehead light
    c.restore()
    c.drawPath(skia.Path().moveTo(-56, -330).quadTo(-34, -304, -50, -276), stroke(FUR_SH, 5))   # cheek
    for wx, wy in ((-182, -332), (-168, -340), (-170, -324), (-156, -330)):
        c.drawCircle(wx, wy, 3, fill("#D9B98F"))
    # nose
    nose = skia.Path().moveTo(-238, -372).cubicTo(-238, -392, -196, -394, -190, -376).cubicTo(-186, -358, -202, -346, -216, -346).cubicTo(-230, -346, -238, -358, -238, -372).close()
    ink(c, [(nose, "#2A1A12")], ol=2.5, lc=DL, weight=False)
    c.drawOval(skia.Rect.MakeXYWH(-228, -386, 18, 9), fill("#FFFFFF", 170))
    c.drawCircle(-226, -362, 3, fill("#000000", 160))
    # mouth when closed
    if op < 0.08:
        if happy > 0.5:
            line(c, [(-204, -304), (-128, -300)], 6, DL, curve=(-166, -272))
        elif stress > 0.3:
            p = skia.Path().moveTo(-198, -300)
            for i in range(1, 7):
                p.lineTo(-198 + i * 11, -300 + (5 if i % 2 else -3))
            c.drawPath(p, stroke(DL, 5))
        else:
            line(c, [(-200, -302), (-130, -298)], 6, DL, curve=(-166, -284))
        line(c, [(-212, -346), (-206, -306)], 5, DL)       # philtrum
    reach = st.get("reach", 0)
    if reach > 0.02:
        k = reach
        tg = skia.Path().moveTo(-200, -302).cubicTo(-240 - 40 * k, -300 - 10 * k, -250 - 60 * k, -340 - 40 * k, -214 - 50 * k, -350 - 30 * k).cubicTo(-196 - 30 * k, -340, -180, -310, -170, -300)
        ink(c, [(tg, TONGUE)], ol=4, lc=DL)
        c.drawLine(-200, -306, -224 - 40 * k, -330 - 20 * k, stroke("#D86A6A", 3))
    if lick > 0.02 and op < 0.08:
        k = math.sin(math.pi * clamp(lick))
        tg = skia.Path().moveTo(-202, -302).cubicTo(-218 - 18 * k, -312 - 50 * k, -172 - 10 * k, -332 - 50 * k, -172, -300)
        ink(c, [(tg, TONGUE)], ol=4, lc=DL)
    # eye
    ex, ey = -118, -382
    sq = st.get("squint", 0)
    closed = yawn > 0.35 or st.get("blink", 0) or sq > 0.5
    if sq > 0.3:
        for i in range(3):
            line(c, [(-152 + i * 16, -388 + 4 * i), (-142 + i * 16, -376 + 4 * i)], 4, FUR_SH)
    if happy > 0.5 and yawn < 0.35:
        line(c, [(ex - 22, ey + 6), (ex + 22, ey + 6)], 7, DL, curve=(ex, ey - 22))
    elif closed:
        line(c, [(ex - 22, ey), (ex + 22, ey)], 7, DL, curve=(ex, ey + 12))
        if yawn > 0.35 or sq > 0.5:
            line(c, [(ex + 26, ey - 12), (ex + 38, ey - 20)], 5, DL)
            line(c, [(ex + 26, ey + 10), (ex + 38, ey + 16)], 5, DL)
    else:
        rx, ry = 23 + 6 * whale, 29 + 3 * whale
        eyep = oval(ex, ey, rx, ry)
        ink(c, [(eyep, "#FFFFFF")], ol=3.5, lc=DL, weight=False)
        px = ex - 6 + 18 * whale + st.get("pdx", 0)
        py = ey + 2 + st.get("pdy", 0)
        soft = st.get("soft", 0)
        c.save()
        c.clipPath(eyep, skia.ClipOp.kIntersect, True)
        c.drawCircle(px, py, 15 + 3 * soft - 2 * whale, fill("#5A3417"))
        c.drawCircle(px, py, 15 + 3 * soft - 2 * whale, stroke("#2A170A", 2))
        c.drawCircle(px, py + 1, 8.5 + 1.5 * soft, fill("#120A05"))
        c.drawCircle(px - 5, py - 7, 5 + 1.5 * soft, fill("#FFFFFF"))
        c.drawCircle(px + 5, py + 5, 2.2, fill("#FFFFFF"))
        c.drawRect(skia.Rect.MakeLTRB(ex - rx, ey - ry, ex + rx, ey - ry + 7), fill("#D9D4CC"))   # lid shadow
        c.restore()
        hard = st.get("hard", 0)
        lid = 0
        if hard > 0.05:
            lid = hard
            ly1, ly2 = ey - ry * (1 - 0.9 * hard), ey - ry * (1 - 0.5 * hard)
        elif stress > 0.2:
            lid = stress
            ly1, ly2 = ey - ry * (0.75 - 0.15 * stress), ey - ry * (0.75 - 0.6 * stress)
        if lid:
            c.save()
            c.clipPath(eyep, skia.ClipOp.kIntersect, True)
            c.drawPath(skia.Path().moveTo(ex - rx - 2, ly1).lineTo(ex + rx + 2, ly2).lineTo(ex + rx + 2, ey - ry - 6)
                       .lineTo(ex - rx - 2, ey - ry - 6).close(), fill(CARAMEL))
            line(c, [(ex - rx - 2, ly1), (ex + rx + 2, ly2)], 5, DL)
            c.restore()
            c.drawPath(eyep, stroke(DL, 3.5))
    # brow (tapered)
    by = ey - 50
    hard = st.get("hard", 0)
    pk = st.get("perk", 0)
    brow(c, ex - 26, by - 12 * stress + 16 * hard - 8 * pk, ex + 24, by + 8 * stress - 8 * hard - 8 * pk, 9)
    if happy > 0.2:
        c.drawOval(skia.Rect.MakeXYWH(-164, -338, 44, 20), fill(HEART, 100 * happy))
    # floppy ear with a fold
    c.save()
    c.translate(-26 + 6 * pk, -428 - 12 * pk)
    c.rotate(10 + 3.5 * math.sin(t * 2.6 + 1) + st.get("ear_swing", 0) - 82 * ears - 34 * pk)
    ear = skia.Path().moveTo(-36, 0).cubicTo(-62, 50, -58, 132, -22, 168).cubicTo(-6, 182, 26, 176, 36, 152).cubicTo(48, 110, 46, 50, 32, -2).close()
    ink(c, [(ear, CARAMEL_DK)], ol=6, lc=DL)
    shade(c, ear, -12, -6, "#8E5A2C", 120)
    c.drawPath(skia.Path().moveTo(8, 24).cubicTo(18, 70, 14, 120, 2, 150), stroke("#9C6131", 5))
    c.restore()


def dog(c, x, y, s=1.0, st=None, t=0.0):
    st = st or {}
    wag = st.get("wag", 1)
    lean = st.get("lean", 0)
    sq = st.get("squash", 0)
    c.save()
    c.translate(x, y - st.get("hop", 0))
    soft_shadow(c, 0, st.get("hop", 0) / s, 170 * (1 - 0.002 * st.get("hop", 0)), 20)
    br = 1 + 0.011 * math.sin(t * 2.3)
    c.scale(s * st.get("fx", 1.0) * (1 + 0.07 * sq), s * (1 - 0.07 * sq) * br)
    L = lambda px, py: (px + lean * 0.4 * clamp(-py / 320), py)
    # tail (bushy, tapered)
    wf = st.get("wagf", 1.0)
    ang = math.radians(-62 + st.get("tailang", 0) + 30 * math.sin(t * 14 * wf) * wag)
    tp = tail_path((112, -76), ang, t * 14 * wf)
    ink(c, [(tp, CARAMEL_DK)], ol=6, lc=DL)
    # far front leg (behind body)
    def leg(x0):
        p = skia.Path().moveTo(x0 - 6, -205).cubicTo(x0 - 14, -140, x0 - 4, -70, x0 - 2, -24).lineTo(x0 + 40, -24)
        p.cubicTo(x0 + 40, -80, x0 + 44, -150, x0 + 50, -205).close()
        pawp = skia.Path().moveTo(x0 - 10, -30).cubicTo(x0 - 24, 4, x0 + 50, 6, x0 + 50, -14).cubicTo(x0 + 46, -34, x0, -38, x0 - 10, -30).close()
        return p, pawp
    fl, fp = leg(-70 + lean * 0.3)
    ink(c, [(fl, CARAMEL_DK), (fp, CARAMEL_DK)], ol=6, lc=DL)
    # body silhouette
    body = skia.Path().moveTo(*L(-40, -318)).cubicTo(*L(30, -300), *L(100, -236), *L(128, -150)).cubicTo(150, -84, 150, -20, 108, -6)
    body.lineTo(-70, -6).cubicTo(*L(-108, -10), *L(-134, -110), *L(-130, -196)).cubicTo(*L(-126, -262), *L(-98, -314), *L(-40, -318)).close()
    thigh = skia.Path().moveTo(0, -140).cubicTo(20, -200, 130, -204, 140, -112).cubicTo(148, -40, 112, -8, 50, -8).cubicTo(10, -8, -14, -60, 0, -140).close()
    ink(c, [(body, CARAMEL)], ol=6.5, lc=DL)
    shade(c, body, -18, -14, FUR_SH, 85)
    # chest fluff
    chest = skia.Path().moveTo(*L(-114, -282)).cubicTo(*L(-84, -302), *L(-44, -292), *L(-32, -262)).lineTo(*L(-36, -204))
    for px, py in ((-50, -172), (-58, -190), (-72, -150), (-84, -178), (-100, -140), (-110, -182)):
        chest.lineTo(*L(px, py))
    chest.cubicTo(*L(-124, -222), *L(-124, -262), *L(-114, -282)).close()
    c.save()
    c.clipPath(body, skia.ClipOp.kIntersect, True)
    c.drawPath(chest, fill(CHEST))
    for px, py in ((-96, -240), (-70, -226), (-84, -206)):
        line(c, [L(px, py), L(px - 6, py + 16)], 4, "#E2C49C")
    c.restore()
    # thigh + back paw
    ink(c, [(thigh, CARAMEL)], ol=6, lc=DL)
    shade(c, thigh, -22, -20, FUR_SH, 110)
    bp = skia.Path().moveTo(-30, -2).cubicTo(-42, -32, 30, -42, 66, -26).cubicTo(82, -12, 72, 2, 30, 2).close()
    ink(c, [(bp, CARAMEL)], ol=5.5, lc=DL)
    for tx in (-10, 8):
        line(c, [(tx, -14), (tx + 2, -2)], 4, DL)
    # near front leg
    pw = st.get("paw", 0)
    lx = -124 + lean * 0.3
    c.save()
    c.translate(lx + 23, -186)
    c.rotate(62 * pw)
    c.translate(-(lx + 23), 186)
    nl, npaw = leg(lx)
    ink(c, [(nl, CARAMEL), (npaw, CARAMEL)], ol=6, lc=DL)
    shade(c, nl, -12, 0, FUR_SH, 100)
    for dx in (8, 22):
        line(c, [(lx + dx, -20), (lx + dx + 1, -4)], 4, DL)
    c.restore()
    # head
    hx = lean
    c.save()
    c.translate(-50 + hx, -270)
    c.rotate(st.get("rot", 0) + 1.4 * math.sin(t * 1.9))
    c.translate(50, 270)
    dog_head(c, st, t)
    sw = st.get("sweat", 0)
    if sw > 0:
        dy = 30 * sw
        drop = skia.Path().moveTo(30, -470 + dy).cubicTo(20, -448 + dy, 10, -430 + dy, 30, -424 + dy).cubicTo(50, -430 + dy, 40, -448 + dy, 30, -470 + dy).close()
        m2 = skia.Matrix()
        m2.setScale(1.6, 1.6, 30, -440 + dy)
        drop.transform(m2)
        ink(c, [(drop, SWEAT)], ol=4, a=255 * min(1, sw * 3), lc="#1F4E6E")
    sl = st.get("lines", 0)
    if sl > 0:
        for i, (ax, ay, bx, by) in enumerate(((-150, -480, -160, -515), (-110, -490, -110, -530), (-70, -480, -58, -514))):
            k = clamp(sl * 3 - i * 0.4)
            j = 3 * math.sin(t * 40 + i)
            line(c, [(ax + j, ay), (lerp(ax, bx, k) + j, lerp(ay, by, k))], 7, INK, 255 * min(1, k * 2))
    c.restore()
    c.restore()


def head_world(dx, st=None):
    """Approx world position of the dog's eye/head for camera framing (stage → world)."""
    sx, sy, s = STAGE
    return (sx + s * (dx - 110), sy + s * -360)


# ---------------------------------------------------------------- owner (cartoon person), facing left, stage units
OWL = "#1E2140"          # owner line colour


def tapered(a, b, wa, wb, bulge=0.0):
    """Organic limb from a to b with widths wa→wb (rounded ends)."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L
    m = ((a[0] + b[0]) / 2 + nx * bulge, (a[1] + b[1]) / 2 + ny * bulge)
    wm = (wa + wb) / 2 * 1.06
    p = skia.Path().moveTo(a[0] + nx * wa, a[1] + ny * wa)
    p.quadTo(m[0] + nx * wm, m[1] + ny * wm, b[0] + nx * wb, b[1] + ny * wb)
    p.quadTo(b[0] + dx / L * wb * 1.3, b[1] + dy / L * wb * 1.3, b[0] - nx * wb, b[1] - ny * wb)
    p.quadTo(m[0] - nx * wm, m[1] - ny * wm, a[0] - nx * wa, a[1] - ny * wa)
    p.quadTo(a[0] - dx / L * wa * 1.3, a[1] - dy / L * wa * 1.3, a[0] + nx * wa, a[1] + ny * wa)
    p.close()
    return p


def owner_body(c, x, lean, face="happy", t=0.0, gaze=(0, 0), nod=0.0, talk=0.0, kr=0.0):
    """Kneeling on the heels, facing left. face: happy | open | look | angry | sad | talk | laugh. Returns shoulders (near, far)."""
    hip = (x, -112)
    knee = (x - 92 - kr, -36 - 0.2 * kr)
    foot = (x + 44 - 0.5 * kr, -26)
    neck = (x - 28 - lean, -304 + 0.3 * lean - 3 * math.sin(t * 2.2))
    # legs: thigh + shin as one silhouette, sneaker
    thigh = tapered(hip, knee, 38, 30, -6)
    shin = tapered(knee, foot, 28, 22, 4)
    sole = skia.Path().moveTo(foot[0] - 6, foot[1] - 18).cubicTo(foot[0] + 30, foot[1] - 30, foot[0] + 66, foot[1] - 14, foot[0] + 62, foot[1] + 10)
    sole.lineTo(foot[0] - 4, foot[1] + 12).close()
    ink(c, [(thigh, PANTS), (shin, PANTS)], ol=6, lc=OWL)
    c.drawPath(skia.Path().moveTo(knee[0] + 18, knee[1] - 20).quadTo(knee[0] + 40, knee[1] - 30, knee[0] + 60, knee[1] - 34), stroke("#3E4C80", 5))
    ink(c, [(sole, "#FFFFFF")], ol=5, lc=OWL)
    c.drawRect(skia.Rect.MakeLTRB(foot[0] - 4, foot[1] + 2, foot[0] + 62, foot[1] + 12), fill(CORAL))
    # torso: organic shirt along the hip→neck axis
    ax, ay = neck[0] - hip[0], neck[1] - hip[1]
    L = math.hypot(ax, ay)
    ux, uy = ax / L, ay / L
    nx, ny = -uy, ux
    P = lambda k, w: (hip[0] + ax * k + nx * w, hip[1] + ay * k + ny * w)
    tor = skia.Path().moveTo(*P(-0.06, 62)).cubicTo(*P(0.35, 70), *P(0.7, 66), *P(0.96, 44)).quadTo(*P(1.08, 0), *P(0.96, -46))
    tor.cubicTo(*P(0.7, -64), *P(0.35, -64), *P(-0.06, -58)).quadTo(*P(-0.12, 0), *P(-0.06, 62)).close()
    ink(c, [(tor, SHIRT)], ol=6.5, lc=OWL)
    shade(c, tor, -16, 10, SHIRT_DK, 150)
    for k0, k1, w in ((0.25, 0.55, 30), (0.45, 0.75, -24)):         # fabric folds
        c.drawPath(skia.Path().moveTo(*P(k0, w)).quadTo(*P((k0 + k1) / 2, w * 0.6), *P(k1, w * 0.9)), stroke(SHIRT_DK, 4))
    c.drawPath(skia.Path().moveTo(*P(0.0, 60)).quadTo(*P(-0.03, 0), *P(0.0, -56)), stroke(SHIRT_DK, 5))   # hem
    # head
    hc = (neck[0] - 10 - 0.18 * lean, neck[1] - 74)
    c.save()
    c.translate(neck[0], neck[1])
    c.rotate(-nod)
    c.translate(-neck[0], -neck[1])
    neckp = tapered((neck[0] - 4, neck[1] + 20), (hc[0] + 4, hc[1] + 40), 20, 18)
    ink(c, [(neckp, SKIN_DK)], ol=5, lc=OWL)
    hx, hy = hc
    back_hair = skia.Path().moveTo(hx - 40, hy - 50).cubicTo(hx + 10, hy - 92, hx + 82, hy - 62, hx + 80, hy - 4)
    back_hair.cubicTo(hx + 78, hy + 38, hx + 56, hy + 66, hx + 30, hy + 74).cubicTo(hx + 10, hy + 40, hx - 20, hy - 10, hx - 40, hy - 50).close()
    bun = oval(hx + 44, hy - 70, 30, 27)
    ink(c, [(back_hair, HAIR), (bun, HAIR)], ol=6, lc=OWL)
    c.drawPath(skia.Path().moveTo(hx + 30, hy - 84).quadTo(hx + 52, hy - 74, hx + 58, hy - 52), stroke("#5A4237", 4))
    face_p = skia.Path().moveTo(hx - 62, hy - 6).cubicTo(hx - 64, hy - 52, hx - 20, hy - 70, hx + 22, hy - 54)
    face_p.cubicTo(hx + 56, hy - 40, hx + 58, hy + 30, hx + 30, hy + 56).cubicTo(hx + 4, hy + 74, hx - 40, hy + 70, hx - 54, hy + 40)
    face_p.cubicTo(hx - 62, hy + 30, hx - 70, hy + 22, hx - 66, hy + 12).quadTo(hx - 58, hy + 6, hx - 62, hy - 6).close()   # nose bump
    ear = oval(hx + 30, hy + 10, 14, 18)
    ink(c, [(ear, SKIN), (face_p, SKIN)], ol=5.5, lc=OWL)
    shade(c, face_p, -14, -6, SKIN_DK, 90)
    c.drawPath(skia.Path().moveTo(hx + 26, hy + 2).quadTo(hx + 34, hy + 10, hx + 28, hy + 20), stroke(SKIN_DK, 4))
    fringe = skia.Path().moveTo(hx - 66, hy - 10).cubicTo(hx - 50, hy - 74, hx + 30, hy - 82, hx + 62, hy - 30)
    fringe.cubicTo(hx + 30, hy - 40, hx, hy - 30, hx - 20, hy - 24).cubicTo(hx - 34, hy - 26, hx - 52, hy - 18, hx - 66, hy - 10).close()
    ink(c, [(fringe, HAIR)], ol=4, lc=OWL, weight=False)
    c.drawPath(skia.Path().moveTo(hx - 30, hy - 56).quadTo(hx, hy - 66, hx + 30, hy - 50), stroke("#5A4237", 4))
    ex, ey = hx - 30, hy + 6
    my = ey + 32
    # brows
    bcol = HAIR
    if face == "angry":
        line(c, [(ex - 16, ey - 24), (ex + 14, ey - 12)], 7, bcol)
    elif face == "sad":
        line(c, [(ex - 16, ey - 14), (ex + 14, ey - 26)], 6, bcol)
    else:
        line(c, [(ex - 14, ey - 20), (ex + 14, ey - 22)], 6, bcol, curve=(ex, ey - 28))
    if face in ("happy", "laugh"):
        line(c, [(ex - 12, ey + 2), (ex + 12, ey + 2)], 6, OWL, curve=(ex, ey - 14))
    elif (t % 3.7) < 0.09:
        line(c, [(ex - 10, ey + 1), (ex + 10, ey + 1)], 5, OWL)
    else:
        gx, gy = gaze
        ink(c, [(oval(ex + gx * 0.4, ey, 10, 12), "#FFFFFF")], ol=2.5, lc=OWL, weight=False)
        c.drawCircle(ex + gx, ey + gy + 1, 7, fill("#3A2A22"))
        c.drawCircle(ex + gx - 2, ey + gy - 2, 2.6, fill("#FFFFFF"))
    line(c, [(hx - 66, hy + 12), (hx - 56, hy + 18)], 4, SKIN_DK)      # nostril line
    if face == "angry":
        line(c, [(ex - 16, my + 6), (ex + 10, my + 6)], 6, OWL, curve=(ex - 3, my - 8))
    elif face == "sad":
        line(c, [(ex - 16, my + 6), (ex + 10, my + 6)], 6, OWL, curve=(ex - 3, my - 6))
        ty = ey + 12 + 30 * ((t * 0.8) % 1)
        tx = ex + 10
        drop = skia.Path().moveTo(tx, ty - 14).cubicTo(tx - 8, ty, tx - 4, ty + 8, tx, ty + 8).cubicTo(tx + 4, ty + 8, tx + 8, ty, tx, ty - 14).close()
        ink(c, [(drop, SWEAT)], ol=3, lc="#1F4E6E")
    elif face in ("talk", "laugh"):
        h = 8 + (16 * abs(math.sin(t * 13)) if face == "talk" else 20) * (talk if face == "talk" else 1)
        ink(c, [(oval(ex - 4, my + 4, 14, h * 0.6 + 3), MOUTH)], ol=3.5, lc=OWL, weight=False)
    elif face == "happy":
        line(c, [(ex - 18, my - 2), (ex + 12, my)], 6, OWL, curve=(ex - 4, my + 16))
    else:
        line(c, [(ex - 16, my), (ex + 10, my)], 6, OWL, curve=(ex - 3, my + 8))
    if face != "angry":
        c.drawOval(skia.Rect.MakeXYWH(ex - 2, ey + 14, 28, 13), fill(HEART, 85))
    c.restore()
    sh = (neck[0] - 4, neck[1] + 30)
    return sh, (sh[0] + 14, sh[1] - 4)


def owner_arm(c, sh, target, bend=-1, L=(124, 118), col=SHIRT, skin=SKIN):
    el, hand = ik(sh, target, L[0], L[1], bend)
    upper = tapered(sh, el, 24, 19)
    fore = tapered(el, hand, 17, 14)
    dx, dy = hand[0] - el[0], hand[1] - el[1]
    Ln = math.hypot(dx, dy) or 1
    ux, uy = dx / Ln, dy / Ln
    palm = oval(hand[0] + ux * 6, hand[1] + uy * 6, 22, 22)
    thumb = oval(hand[0] + ux * 6 - uy * 18, hand[1] + uy * 6 + ux * 18, 9, 9)
    ink(c, [(fore, skin), (palm, skin), (thumb, skin)], ol=5.5, lc=OWL)
    ink(c, [(upper, col)], ol=5.5, lc=OWL)
    return hand


# ---------------------------------------------------------------- camera
class Cam:
    def __init__(self, fx, fy, z, ax=540, ay=960):
        self.fx, self.fy, self.z, self.ax, self.ay = fx, fy, z, ax, ay

    def apply(self, c):
        c.translate(self.ax, self.ay)
        c.scale(self.z, self.z)
        c.translate(-self.fx, -self.fy)

    def pt(self, x, y):
        return (self.ax + (x - self.fx) * self.z, self.ay + (y - self.fy) * self.z)

    @staticmethod
    def mix(a, b, k):
        return Cam(lerp(a.fx, b.fx, k), lerp(a.fy, b.fy, k), math.exp(lerp(math.log(a.z), math.log(b.z), k)), lerp(a.ax, b.ax, k), lerp(a.ay, b.ay, k))


def stage_to_world(x, y):
    sx, sy, s = STAGE
    return (sx + s * x, sy + s * y)


# ---------------------------------------------------------------- UI (cartoon)
def toon_text(c, s, x, y, size, col="#FFFFFF", outline=INK, ol=8, align="c", a=255, w=700, shadow=True):
    f = ff(w, size)
    width = f.measureText(s)
    if align == "c":
        x -= width / 2
    elif align == "r":
        x -= width
    blob = skia.TextBlob(s, f)
    if shadow:
        c.drawTextBlob(blob, x + 4, y + 7, stroke(outline, 2 * ol, a))
    c.drawTextBlob(blob, x, y, stroke(outline, 2 * ol, a))
    c.drawTextBlob(blob, x, y, fill(col, a))
    return width


def sticker(c, x, y, word, k, col=CORAL, rot=-4, size=40, tcol="#FFFFFF", point=None):
    """Bouncy cartoon sticker label; optional pointer toward point."""
    if k <= 0:
        return
    s = e_back(clamp(k), 2.2)
    f = ff(700, size)
    w = f.measureText(word) + 52
    h = size + 34
    if point is not None and s > 0.3:
        c.drawLine(x, y, point[0], point[1], stroke(INK, 6, 255 * clamp(k * 2)))
        c.drawCircle(point[0], point[1], 9, fill(INK, 255 * clamp(k * 2)))
        c.drawCircle(point[0], point[1], 4, fill("#FFFFFF", 255 * clamp(k * 2)))
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    c.drawRRect(rrect(-w / 2 + 4, -h / 2 + 7, w, h, h / 2), fill(INK))
    ink(c, [(rr(-w / 2, -h / 2, w, h, h / 2), col)], ol=5)
    c.drawTextBlob(skia.TextBlob(word, f), -w / 2 + 26, size * 0.36, fill(tcol))
    c.restore()


def heart(c, x, y, s, a=255):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    p = skia.Path().moveTo(0, 18).cubicTo(-40, -8, -26, -40, 0, -22).cubicTo(26, -40, 40, -8, 0, 18).close()
    ink(c, [(p, HEART)], ol=4, a=a)
    c.drawOval(skia.Rect.MakeXYWH(-20, -26, 12, 8), fill("#FFFFFF", 150 * a / 255))
    c.restore()


def bubble_translator(c, t, t0, msg, y, a=255):
    """Cartoon speech panel: lime header tab 'DOG → HUMAN' + typed line, pointing up at the dog."""
    if t < t0 - 0.25 or a <= 0:
        return
    k = e_back(prog(t, t0 - 0.25, t0 + 0.05), 1.8)
    if k <= 0.01:
        return
    bw, bh = 940, 190
    x0 = W / 2 - bw / 2
    c.save()
    c.translate(W / 2, y + bh / 2)
    c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k)
    c.translate(-W / 2, -(y + bh / 2))
    c.drawRRect(rrect(x0 + 6, y + 12, bw, bh, 50), fill(INK, a))
    panel = rr(x0, y, bw, bh, 50)
    tailp = skia.Path().moveTo(x0 + 220, y + 4).lineTo(x0 + 250, y - 46).lineTo(x0 + 300, y + 4).close()
    ink(c, [(panel, "#FFFFFF"), (tailp, "#FFFFFF")], ol=6, a=a)
    # tab
    ink(c, [(rr(x0 + 40, y - 26, 300, 52, 26), LIME)], ol=5, a=a)
    f0 = ff(700, 30)
    c.drawTextBlob(skia.TextBlob("DOG", f0), x0 + 70, y + 10, fill(INK, a))
    ax = x0 + 78 + f0.measureText("DOG")
    c.drawPath(skia.Path().moveTo(ax, y).lineTo(ax + 40, y).moveTo(ax + 28, y - 10).lineTo(ax + 40, y).lineTo(ax + 28, y + 10), stroke(INK, 5, a))
    c.drawTextBlob(skia.TextBlob("HUMAN", f0), ax + 52, y + 10, fill(INK, a))
    n = int(len(msg) * prog(t, t0 + 0.1, t0 + 0.1 + 0.045 * len(msg)))
    shown = msg[:n]
    size = 54
    while ff(600, size).measureText(msg) > bw - 100 and size > 34:
        size -= 2
    f = ff(600, size)
    c.drawTextBlob(skia.TextBlob(shown or " ", f), x0 + 50, y + 122, fill(INK, a))
    if n < len(msg) or int(t * 3) % 2 == 0:
        cx = x0 + 50 + f.measureText(shown) + 6
        c.drawRRect(rrect(cx, y + 80, 6, 54, 3), fill(CORAL, a))
    c.restore()


# ---------------------------------------------------------------- props + cartoon marks
def shoe(c, x, y, s=1.0, chewed=True, rot=0):
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    body = skia.Path().moveTo(-90, 0).lineTo(-90, -40).quadTo(-80, -70, -40, -70).lineTo(-10, -70).quadTo(10, -40, 60, -34)
    body.quadTo(96, -28, 96, 0).close()
    ink(c, [(body, "#E9505A")], ol=6)
    c.drawRect(skia.Rect.MakeLTRB(-92, -14, 98, 0), fill("#FFFFFF"))
    line(c, [(-92, -14), (98, -14)], 5)
    for i in range(3):
        line(c, [(-30 + i * 18, -60 + i * 4), (-14 + i * 18, -56 + i * 4)], 5, "#FFFFFF")
    if chewed:   # bite marks
        for bx, by in ((60, -34), (78, -26), (44, -38)):
            c.drawCircle(bx, by, 9, fill(WOOD))
            c.drawCircle(bx, by, 9, stroke(INK, 4))
    c.restore()


def fluff(c, x, y, s=1.0, t=0.0):
    for i, (dx, dy, r) in enumerate(((0, 0, 18), (24, -6, 14), (-22, -4, 12), (8, -18, 12))):
        ink(c, [(oval(x + dx * s, y + dy * s + 2 * math.sin(t * 2 + i), r * s, r * 0.8 * s), "#FFFFFF")], ol=3)


def phone(c, x, y, rot=0, s=1.0):
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    ink(c, [(rr(-20, -36, 40, 72, 10), "#2B2B33")], ol=4)
    c.drawRRect(rrect(-14, -28, 28, 54, 5), fill("#8FD3FF"))
    c.restore()


def leash(c, hand, t):
    end = (hand[0] - 70 + 10 * math.sin(t * 6), hand[1] + 210)
    p = skia.Path().moveTo(*hand).cubicTo(hand[0] - 10, hand[1] + 90, hand[0] - 80, hand[1] + 120 + 6 * math.sin(t * 6), *end)
    c.drawPath(p, stroke(INK, 16))
    c.drawPath(p, stroke(CORAL, 9))
    loop = skia.Path()
    loop.addOval(skia.Rect.MakeLTRB(hand[0] - 22, hand[1] - 62, hand[0] + 22, hand[1] + 4))
    c.drawPath(loop, stroke(INK, 16))
    c.drawPath(loop, stroke(CORAL, 9))
    ink(c, [(oval(end[0], end[1] + 12, 13, 17), "#C9CED6")], ol=4)


def rope_toy(c, a, b, t):
    p = skia.Path().moveTo(*a).quadTo((a[0] + b[0]) / 2, max(a[1], b[1]) + 40 + 10 * math.sin(t * 8), *b)
    ink(c, [(p, "#F2E3C6", 18)], ol=5)
    for q, col in ((a, "#FF8A5B"), (b, "#5BB8FF")):
        ink(c, [(oval(q[0], q[1], 20, 16), col)], ol=5)


def qmark(c, x, y, k, ch="?", size=110, col=LIME, rot=0):
    if k <= 0:
        return
    s = e_back(clamp(k), 2.4)
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    toon_text(c, ch, 0, size * 0.36, size, col, ol=9)
    c.restore()


def burst(c, x, y, word, k, size=96, col="#FFE14D"):
    """Comic-book burst with a word (ACHOO!)."""
    if k <= 0:
        return
    s = e_back(clamp(k), 2.6)
    c.save()
    c.translate(x, y)
    c.rotate(-8)
    c.scale(s, s)
    p = skia.Path()
    n = 14
    for i in range(2 * n):
        r = (230 if i % 2 == 0 else 160) * (1 + 0.04 * math.sin(i * 7.1))
        a = math.pi * i / n
        q = (r * math.cos(a), 0.62 * r * math.sin(a))
        p.moveTo(*q) if i == 0 else p.lineTo(*q)
    p.close()
    ink(c, [(p, col)], ol=7)
    toon_text(c, word, 0, size * 0.36, size, CORAL, ol=8, shadow=False)
    c.restore()


def glow(c, x, y, r, k, col=HEART):
    if k <= 0:
        return
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((x, y), r, [C(col, int(120 * k)), C(col, 0)]))
    c.drawCircle(x, y, r, g)
