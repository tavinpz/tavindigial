"""PAWSLATED — brand kit: palette, mascot dog, human, translator UI, logo, sting, render."""
import math
import os
import subprocess

import numpy as np
import skia

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 60
GY = 1180

# ---------------------------------------------------------------- palette
CREAM = "#F3EBDD"
CREAM2 = "#EADFCB"
INK = "#1E1B18"
INK2 = "#3A3530"
CARAMEL = "#D8995A"
CARAMEL_DK = "#B8763E"
CHEST = "#F4DDBB"
LIME = "#C9F03A"
CORAL = "#FF5B4E"
MINT = "#33B07A"
MOUTH = "#5A1F1F"
TONGUE = "#EE8585"


def C(hx, a=255):
    hx = hx.lstrip("#")
    return skia.Color(int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16), int(clamp(a, 0, 255)))


TF = {k: skia.Typeface.MakeFromFile(os.path.join(HERE, f)) for k, f in {
    "black": "InterDisplay-Black.otf", "bold": "InterDisplay-Bold.otf", "med": "Inter-Medium.otf",
    "mono": "JetBrainsMono-Regular.ttf", "monob": "JetBrainsMono-Bold.ttf"}.items()}
_fc = {}


def font(k, size):
    if (k, size) not in _fc:
        f = skia.Font(TF[k], size)
        f.setSubpixel(True)
        f.setEdging(skia.Font.Edging.kAntiAlias)
        _fc[(k, size)] = f
    return _fc[(k, size)]


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


def lerp(a, b, k): return a + (b - a) * k
def lerp2(p, q, k): return (lerp(p[0], q[0], k), lerp(p[1], q[1], k))


def mixc(c1, c2, k):
    a = [int(c1.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    b = [int(c2.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{int(lerp(x, y, clamp(k))):02X}" for x, y in zip(a, b))


def fill(col, a=255):
    return skia.Paint(AntiAlias=True, Color=C(col, a))


def stroke(col, w, a=255):
    return skia.Paint(AntiAlias=True, Color=C(col, a), Style=skia.Paint.kStroke_Style, StrokeWidth=w,
                      StrokeCap=skia.Paint.kRound_Cap, StrokeJoin=skia.Paint.kRound_Join)


def rrect(x, y, w, h, r):
    return skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r)


def tw(s, f, tracking=0):
    return sum(f.measureText(ch) for ch in s) + tracking * max(0, len(s) - 1)


def text(c, s, x, y, f, col, a=255, align="l", tracking=0.0):
    w = tw(s, f, tracking)
    if align == "c":
        x -= w / 2
    elif align == "r":
        x -= w
    p = fill(col, a)
    for ch in s:
        c.drawString(ch, x, y, f, p)
        x += f.measureText(ch) + tracking
    return w


def shadow(c, x, y, rx, ry, a=60):
    p = fill("#000000", a)
    p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 10))
    c.drawOval(skia.Rect.MakeXYWH(x - rx, y - ry, 2 * rx, 2 * ry), p)


# ---------------------------------------------------------------- background
def background(c):
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, 0), (0, H)], [C("#F6F0E5"), C(CREAM), C(CREAM2)], [0, 0.6, 1]))
    c.drawRect(skia.Rect.MakeWH(W, H), p)
    # soft warm spotlight behind the scene
    g = skia.Paint(AntiAlias=True)
    g.setShader(skia.GradientShader.MakeRadial((W / 2, GY - 260), 620, [C("#FFFFFF", 150), C("#FFFFFF", 0)]))
    c.drawRect(skia.Rect.MakeWH(W, H), g)
    # floor
    c.drawRect(skia.Rect.MakeLTRB(0, GY, W, H), fill(CREAM2))
    c.drawLine(70, GY, W - 70, GY, stroke(INK, 3, 60))


# ---------------------------------------------------------------- the dog (mascot)
def dog(c, x, y, s=1.0, st=None, t=0.0):
    """Sitting dog facing left. st keys:
    ears (0 up .. 1 flat back), whale (0..1), yawn (0..1), lick (0..1), turn (0..1 head turned away/up),
    wag (tail wag amplitude 0..1), blink (0/1), lean (body lean px), happy (0..1 squint smile)."""
    st = st or {}
    ears, whale, yawn = st.get("ears", 0), st.get("whale", 0), st.get("yawn", 0)
    lick, turn, wag = st.get("lick", 0), st.get("turn", 0), st.get("wag", 1)
    happy = st.get("happy", 0)
    c.save()
    c.translate(x, y)
    c.scale(s * st.get("fx", 1.0), s)
    shadow(c, -20, -4, 150, 16, 50)
    # tail
    ang = math.radians(-60 + 26 * math.sin(t * 13) * wag)
    tx0, ty0 = 112, -70
    tip = (tx0 + 95 * math.cos(ang), ty0 + 95 * math.sin(ang))
    mid = (tx0 + 70 * math.cos(ang + 0.5), ty0 + 70 * math.sin(ang + 0.5))
    tp = skia.Path().moveTo(tx0, ty0).quadTo(*mid, *tip)
    c.drawPath(tp, stroke(CARAMEL_DK, 24))
    # haunch + back paw
    c.drawCircle(52, -96, 96, fill(CARAMEL))
    c.drawOval(skia.Rect.MakeXYWH(-30, -26, 120, 30), fill(CARAMEL_DK))
    # far front leg
    c.drawRRect(rrect(-58 + st.get("lean", 0) * 0.3, -175, 34, 172, 16), fill(CARAMEL_DK))
    # torso
    c.save()
    c.translate(-14 + st.get("lean", 0) * 0.5, -196)
    c.rotate(-22)
    c.drawOval(skia.Rect.MakeXYWH(-74, -128, 148, 256), fill(CARAMEL))
    c.drawOval(skia.Rect.MakeXYWH(-66, -104, 74, 190), fill(CHEST))
    c.restore()
    # near front leg + paws
    lx = -100 + st.get("lean", 0) * 0.3
    c.drawRRect(rrect(lx, -170, 38, 168, 17), fill(CARAMEL))
    c.drawOval(skia.Rect.MakeXYWH(lx - 18, -22, 64, 24), fill(CARAMEL))
    c.drawOval(skia.Rect.MakeXYWH(-76 + st.get("lean", 0) * 0.3, -20, 56, 20), fill(CARAMEL_DK))
    # ---- head (pivot at the neck)
    hx, hy = -66 + st.get("lean", 0), -322
    c.save()
    c.translate(hx + 24, hy + 50)
    c.rotate(-16 * turn - 8 * yawn)
    c.translate(-(hx + 24), -(hy + 50))
    # collar (brand lime) + tag
    c.save()
    c.translate(hx + 26, hy + 72)
    c.rotate(-18)
    c.drawRRect(rrect(-58, -12, 116, 24, 12), fill(LIME))
    c.restore()
    c.drawCircle(hx - 4, hy + 100, 12, fill(LIME))
    c.drawCircle(hx - 4, hy + 100, 5, fill(INK, 120))
    # ear (behind skull) — rotates back when stressed
    c.save()
    c.translate(hx + 40, hy - 46)
    c.rotate(10 + 55 * ears)
    ear = skia.Path().moveTo(-10, 0).cubicTo(40, -10, 52, 70, 26, 96).cubicTo(10, 110, -18, 92, -16, 60).close()
    c.drawPath(ear, fill(CARAMEL_DK))
    c.restore()
    # skull
    c.drawCircle(hx, hy, 74, fill(CARAMEL))
    c.drawOval(skia.Rect.MakeXYWH(hx - 40, hy - 70, 70, 40), fill("#E6AE70", 140))
    # mouth interior + lower jaw (yawn)
    hinge = (hx - 30, hy + 28)
    jaw = 38 * e_out(clamp(yawn))
    if yawn > 0.02:
        inside = skia.Path().moveTo(*hinge)
        lx2, ly2 = hinge[0] - 104 * math.cos(math.radians(jaw)), hinge[1] + 104 * math.sin(math.radians(jaw))
        inside.lineTo(hinge[0] - 104, hinge[1] - 6).lineTo(lx2, ly2).close()
        c.drawPath(inside, fill(MOUTH))
        c.save()
        c.translate(*hinge)
        c.rotate(-jaw)
        c.drawOval(skia.Rect.MakeXYWH(-96, -6, 70, 26), fill(TONGUE))
        c.restore()
    c.save()
    c.translate(*hinge)
    c.rotate(-jaw)
    c.drawRRect(rrect(-108, -4, 100, 32, 16), fill(CHEST))
    c.restore()
    # upper snout
    c.drawRRect(rrect(hx - 140, hy - 22, 118, 58, 28), fill(CHEST))
    c.drawOval(skia.Rect.MakeXYWH(hx - 156, hy - 22, 36, 30), fill(INK))
    c.drawCircle(hx - 146, hy - 15, 5, fill("#FFFFFF", 110))
    if yawn < 0.1:
        c.drawPath(skia.Path().moveTo(hx - 118, hy + 30).quadTo(hx - 96, hy + 40 + 6 * happy, hx - 70, hy + 30), stroke(INK2, 4))
    # nose-lick tongue flick
    if lick > 0.02 and yawn < 0.1:
        k = math.sin(math.pi * clamp(lick))
        c.drawOval(skia.Rect.MakeXYWH(hx - 150 - 14 * k, hy + 6, 34 + 20 * k, 22), fill(TONGUE))
    # eye (+ whale eye: white crescent, pupil pushed toward the human)
    ex, ey = hx - 40, hy - 18
    if whale > 0.02:
        c.drawOval(skia.Rect.MakeXYWH(ex - 15 - 4 * whale, ey - 12, 32 + 8 * whale, 24), fill("#FFFFFF", 255 * whale))
    blink = st.get("blink", 0)
    if happy > 0.5 or blink:
        c.drawPath(skia.Path().moveTo(ex - 12, ey + 2).quadTo(ex, ey - 8, ex + 12, ey + 2), stroke(INK, 5))
    else:
        c.drawCircle(ex - 9 * whale, ey, 9.5, fill(INK))
        c.drawCircle(ex - 9 * whale + 3, ey - 3, 3, fill("#FFFFFF", 220))
    # brow (worried tilt when stressed)
    stress = max(ears, whale)
    c.drawLine(ex - 14, ey - 22 - 4 * stress, ex + 12, ey - 24 + 6 * stress, stroke(CARAMEL_DK, 5))
    c.restore()
    c.restore()


# ---------------------------------------------------------------- human (faceless ink figure)
def ik(sh, target, L1, L2, bend=1):
    dx, dy = target[0] - sh[0], target[1] - sh[1]
    d = clamp(math.hypot(dx, dy), 1, L1 + L2 - 0.5)
    base = math.atan2(dy, dx)
    a = math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    el = (sh[0] + L1 * math.cos(base + bend * a), sh[1] + L1 * math.sin(base + bend * a))
    return el, (sh[0] + d * math.cos(base), sh[1] + d * math.sin(base))


def human_body(c, x, y, pose):
    """Faceless ink person kneeling on the heels. pose: d (+1 faces right, -1 faces left), lean (px toward d).
    Returns (near_shoulder, far_shoulder)."""
    d, lean = pose.get("d", 1), pose.get("lean", 0)
    hip = (x, y - 100)
    knee = (x + d * 78, y - 16)
    foot = (x - d * 30, y - 12)
    neck = (x + d * (30 + lean), hip[1] - 168 + 0.22 * lean)
    head = (neck[0] + d * (2 + 0.12 * lean), neck[1] - 44)
    c.drawPath(skia.Path().moveTo(*foot).lineTo(*knee).lineTo(*hip), stroke(INK, 30))
    # torso as a tapered stroke
    tor = skia.Path().moveTo(hip[0] - 26, hip[1] + 6).lineTo(hip[0] + 26, hip[1] + 6)
    tor.lineTo(neck[0] + 24, neck[1] + 10).lineTo(neck[0] - 24, neck[1] + 10).close()
    pf = fill(INK)
    c.drawPath(tor, pf)
    c.drawCircle(hip[0], hip[1] + 6, 26, pf)
    c.drawCircle(neck[0], neck[1] + 12, 25, pf)
    c.drawLine(neck[0], neck[1] + 10, head[0], head[1] + 20, stroke(INK, 34))
    c.drawCircle(*head, 44, pf)
    return (neck[0], neck[1] + 22)


def arm(c, sh, target, bend=-1, L=(104, 100), w=21):
    el, hand = ik(sh, target, L[0], L[1], bend)
    c.drawPath(skia.Path().moveTo(*sh).lineTo(*el).lineTo(*hand), stroke(INK, w))
    c.drawCircle(hand[0], hand[1], w * 0.68, fill(INK))
    return hand


# ---------------------------------------------------------------- UI
def highlight_title(c, lines, y, a=255, hi_word=None, size=84):
    """Ink headline; one word sits on a lime marker stroke."""
    f = font("black", size)
    for i, line in enumerate(lines):
        w = tw(line, f, -1)
        x = W / 2 - w / 2
        yy = y + i * size * 1.06
        if hi_word and hi_word in line:
            pre = line[:line.index(hi_word)]
            hx = x + tw(pre, f, -1) - 10
            hw = tw(hi_word, f, -1) + 20
            c.save()
            c.rotate(-1.2)
            c.drawRRect(rrect(hx, yy - size * 0.74, hw, size * 0.84, 12), fill(LIME, a))
            c.restore()
        text(c, line, x, yy, f, INK, a, "l", tracking=-1)


def translator(c, t, t0, msg, y=1420, a=255, done_hold=None):
    """Ink device bar: 'DOG → HUMAN' label + typed message."""
    k = e_back(prog(t, t0 - 0.25, t0 + 0.05), 1.4)
    if k <= 0 or a <= 0:
        return
    bw, bh = 900, 170
    x0 = W / 2 - bw / 2
    c.save()
    c.translate(W / 2, y + bh / 2)
    c.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k)
    c.translate(-W / 2, -(y + bh / 2))
    sp = fill("#000000", 70 * a / 255)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18))
    c.drawRRect(rrect(x0, y + 14, bw, bh, 44), sp)
    c.drawRRect(rrect(x0, y, bw, bh, 44), fill(INK, a))
    # label
    c.drawCircle(x0 + 58, y + 46, 9, fill(LIME, a * (0.6 + 0.4 * math.sin(t * 9))))
    text(c, "DOG  →  HUMAN", x0 + 80, y + 54, font("monob", 24), LIME, a, "l", tracking=4)
    # typed text
    n = int(len(msg) * prog(t, t0 + 0.1, t0 + 0.1 + 0.045 * len(msg)))
    shown = msg[:n]
    f = font("bold", 46)
    while tw(msg, f) > bw - 110 and f.getSize() > 30:
        f = font("bold", int(f.getSize()) - 2)
    text(c, shown, x0 + 56, y + 122, f, CREAM, a)
    if n < len(msg) or int(t * 3) % 2 == 0:
        cx = x0 + 56 + tw(shown, f) + 6
        c.drawRect(skia.Rect.MakeXYWH(cx, y + 86, 4, 44), fill(LIME, a))
    c.restore()


def callout(c, x, y, word, k, col=CORAL):
    """Small label that pops next to the dog with a dot + leader line."""
    if k <= 0:
        return
    s = e_back(clamp(k), 1.8)
    f = font("monob", 24)
    w = tw(word, f, 2) + 40
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    c.drawRRect(rrect(-w / 2, -26, w, 48, 24), fill(col))
    text(c, word, 0, 7, f, "#FFFFFF", 255, "c", tracking=2)
    c.restore()


def meter(c, x, y, w, k, label, col):
    f = font("monob", 22)
    text(c, label, x, y, f, INK2, 230, "l", tracking=3)
    text(c, f"{int(100 * k)}%", x + w, y, f, col, 255, "r", tracking=1)
    c.drawRRect(rrect(x, y + 14, w, 14, 7), fill(INK, 30))
    c.drawRRect(rrect(x, y + 14, max(14, w * clamp(k)), 14, 7), fill(col))


# ---------------------------------------------------------------- logo
def logo(c, x, y, s=1.0, a=255, dots_t=None):
    """Speech bubble with two dog ears — 'your dog is typing…'."""
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    ink = fill(INK, a)
    # floppy ears hanging off the top corners
    for sx in (-1, 1):
        ear = skia.Path().moveTo(sx * 58, -66).cubicTo(sx * 120, -78, sx * 138, 0, sx * 118, 34)
        ear.cubicTo(sx * 106, 52, sx * 84, 40, sx * 86, 10).close()
        c.drawPath(ear, fill(INK2, a))
    c.drawRRect(rrect(-100, -70, 200, 130, 64), ink)
    c.drawPath(skia.Path().moveTo(-44, 52).lineTo(-70, 92).lineTo(-6, 56).close(), ink)
    for i, dx in enumerate((-44, 0, 44)):
        bob = 0 if dots_t is None else 8 * max(0, math.sin(dots_t * 7 - i * 0.9))
        c.drawCircle(dx, -6 - bob, 14, fill(LIME, a))
    c.restore()


def watermark(c, a=1.0):
    y = H - 150
    logo(c, W / 2 - 92, y - 8, 0.2, 230 * a)
    text(c, "@pawslated", W / 2 - 64, y, font("monob", 24), INK2, 200 * a, "l", tracking=2)


def sting(c, t, t0):
    k = e_io(prog(t, t0, t0 + 0.35))
    if k <= 0:
        return
    c.drawRect(skia.Rect.MakeWH(W, H), fill(CREAM, 255 * k))
    kl = e_back(prog(t, t0 + 0.15, t0 + 0.6), 1.8)
    if kl > 0:
        logo(c, W / 2, 880, 1.9 * kl, 255, dots_t=t)
    kw = e_out(prog(t, t0 + 0.55, t0 + 1.0))
    text(c, "PAWSLATED", W / 2, 1110 + 12 * (1 - kw), font("black", 74), INK, 255 * kw, "c", tracking=6)
    text(c, "your dog, translated.", W / 2, 1170 + 12 * (1 - kw), font("med", 34), INK2, 255 * kw, "c")


STING_HIT = 0.32


# ---------------------------------------------------------------- render
def render(scene, out_mp4, wav):
    tmp = out_mp4 + ".v.tmp.mp4"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", tmp]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(int(scene.DUR * FPS)):
        p.stdin.write(scene.frame(i / FPS).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("encode failed")
    fin = out_mp4 + ".tmp.mp4"
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", fin])
    if r.returncode != 0:
        raise SystemExit("mux failed")
    os.replace(fin, out_mp4)
    os.remove(tmp)


def snapshot(surf):
    return surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[:, :, :3]
