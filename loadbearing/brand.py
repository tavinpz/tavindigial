"""LOADBEARING brand kit — shared by every episode.

Rules baked in here (so every video looks like the same show):
  * night construction site, hanging work lamps, the glowing ground line, earth cut-away below it
  * ORANGE hard hat = the one who builds right (glows). GREY hard hat = the other one (dim).
  * two-line lane labels (NAME / sub), an engineering meter, elegant watermark, same outro sting + sonic logo
"""
import math
import os
import subprocess

import numpy as np
import skia

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 60

# ---------------------------------------------------------------- palette
VOID = "#060608"
CHALK = "#F1EEE8"
DIMFIG = "#8E8C88"           # the grey-hat figure
GREYHAT = "#5E5D5A"
BLOCK, BLOCK_TOP, BLOCK_DK = "#D9D3C6", "#F2EEE6", "#A9A295"
EARTH2 = "#16140F"
GRAPH = "#77777C"
MOLTEN = "#FF4D00"
HOT = "#FFB15C"
WOOD, WOOD_DK = "#C9A57A", "#8E6E48"


def C(hx, a=255):
    hx = hx.lstrip("#")
    return skia.Color(int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16), int(clamp(a, 0, 255)))


TF = {k: skia.Typeface.MakeFromFile(os.path.join(HERE, f)) for k, f in {
    "black": "InterDisplay-Black.otf", "bold": "InterDisplay-Bold.otf",
    "mono": "JetBrainsMono-Regular.ttf", "monob": "JetBrainsMono-Bold.ttf"}.items()}
_fc = {}


def font(k, size):
    key = (k, size)
    if key not in _fc:
        f = skia.Font(TF[k], size)
        f.setSubpixel(True)
        f.setEdging(skia.Font.Edging.kAntiAlias)
        _fc[key] = f
    return _fc[key]


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


def bez(p0, p1, p2, k):
    return lerp2(lerp2(p0, p1, k), lerp2(p1, p2, k), k)


def mixc(c1, c2, k):
    a = [int(c1.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    b = [int(c2.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{int(lerp(x, y, clamp(k))):02X}" for x, y in zip(a, b))


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


def rrect(x, y, w, h, r):
    return skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r)


# ---------------------------------------------------------------- the character
LIMB = 14


def ik(sh, target, L1, L2, bend=1):
    dx, dy = target[0] - sh[0], target[1] - sh[1]
    d = clamp(math.hypot(dx, dy), 1, L1 + L2 - 0.5)
    base = math.atan2(dy, dx)
    a = math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    el = (sh[0] + L1 * math.cos(base + bend * a), sh[1] + L1 * math.sin(base + bend * a))
    return el, (sh[0] + d * math.cos(base), sh[1] + d * math.sin(base))


def hat(c, x, y, s=1.0, col=MOLTEN, a=255):
    """The mark: a hard hat. (x, y) = centre of the brim."""
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    p = skia.Path()
    p.addArc(skia.Rect.MakeXYWH(-31, -34, 62, 56), 180, 180)
    p.close()
    c.drawPath(p, fill(col, a))
    c.drawRRect(rrect(-40, -8, 80, 9, 4.5), fill(col, a))
    c.drawRRect(rrect(-3, -36, 6, 26, 3), fill(mixc(col, "#FFFFFF", 0.25), a))
    c.restore()


def figure(c, x, gy, pose, hero=True, a=255, face=1):
    """hero=True: chalk body + orange hat. hero=False: grey body + grey hat."""
    body = CHALK if hero else DIMFIG
    hcol = MOLTEN if hero else GREYHAT
    cr = pose.get("crouch", 0)
    sit = pose.get("sit", 0)
    hip = (x + pose.get("hipdx", 0), gy - 128 + 44 * cr + 70 * sit)
    neck = (hip[0] + pose.get("lean", 0), hip[1] - 108)
    head = (neck[0] + pose.get("hx", 0), neck[1] - 46 + pose.get("hy", 0))
    sh = (neck[0], neck[1] + 12)
    p = stroke(body, LIMB, a)
    feet = pose.get("feet")
    for i, sgn in enumerate((-1, 1)):
        if sit > 0.5:
            foot = (x + sgn * 30 + 70 * face, gy - 4)
            knee = (x + sgn * 16 + 45 * face, hip[1] - 30)
        else:
            foot = feet[i] if feet else (x + sgn * pose.get("spread", 24), gy - 4)
            knee, _ = ik(hip, foot, 66, 66, bend=-1 if (sgn * face > 0) else 1)
        c.drawPath(skia.Path().moveTo(*hip).lineTo(*knee).lineTo(*foot), p)
    c.drawLine(*hip, *neck, p)
    hands = {}
    for key, bend in (("L", 1), ("R", -1)):
        tgt = pose.get(key) or (sh[0] + (-20 if key == "L" else 20), sh[1] + 118)
        el, hand = ik(sh, tgt, 62, 60, bend=pose.get(key + "b", bend))
        c.drawPath(skia.Path().moveTo(*sh).lineTo(*el).lineTo(*hand), p)
        hands[key] = hand
    hx, hy = head
    c.drawCircle(hx, hy, 29, fill(body, a))
    ex, ey = hx + 9 * face, hy + 3 + pose.get("eyes_dy", 0)
    blink = pose.get("blink", 0)
    for dx in (-8, 8):
        c.drawOval(skia.Rect.MakeXYWH(ex + dx - 3.2, ey - 5 * (1 - blink) - 0.8, 6.4, 10 * (1 - blink) + 1.6), fill(VOID, a))
    if pose.get("sad"):
        c.drawLine(ex - 13, ey - 11, ex - 4, ey - 14, stroke(VOID, 3, a))
        c.drawLine(ex + 13, ey - 11, ex + 4, ey - 14, stroke(VOID, 3, a))
    hat(c, hx + 2 * face, hy - 6, 0.92, hcol, a)
    return {"hands": hands, "head": head, "sh": sh}


def blink_at(t, period, phase=0):
    return 1 if ((t + phase) % period) < 0.08 else 0


# ---------------------------------------------------------------- props
BW, BH, DEP = 66, 36, 11


def block(c, cx, cy, rot=0.0, a=255, sx=1, sy=1, w=BW, h=BH, tint=None):
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.scale(sx, sy)
    base = tint or BLOCK
    sp = fill("#000000", 110 * a / 255)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 5))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 2, -h / 2 + 6, w, h), sp)
    top = skia.Path().moveTo(-w / 2, -h / 2).lineTo(-w / 2 + DEP, -h / 2 - DEP * .6).lineTo(w / 2 + DEP, -h / 2 - DEP * .6).lineTo(w / 2, -h / 2).close()
    c.drawPath(top, fill(mixc(base, "#FFFFFF", 0.45), a))
    side = skia.Path().moveTo(w / 2, -h / 2).lineTo(w / 2 + DEP, -h / 2 - DEP * .6).lineTo(w / 2 + DEP, h / 2 - DEP * .6).lineTo(w / 2, h / 2).close()
    c.drawPath(side, fill(mixc(base, "#000000", 0.25), a))
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, -h / 2), (0, h / 2)], [C(base, a), C(mixc(base, "#000000", 0.13), a)]))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), p)
    if w > 40:
        for dx in (-w * 0.23, w * 0.23):
            c.drawRRect(rrect(dx - 9, -7, 18, 14, 3), fill(mixc(base, "#000000", 0.18), a * 0.7))
    c.restore()


def plank(c, cx, cy, w=58, h=16, rot=0, a=255):
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, -h / 2), (0, h / 2)], [C(WOOD, a), C(WOOD_DK, a)]))
    c.drawRRect(rrect(-w / 2, -h / 2, w, h, 3), p)
    c.drawLine(-w / 2 + 6, -1, w / 2 - 10, 1, stroke(WOOD_DK, 1.5, a * 0.6))
    c.restore()


# ---------------------------------------------------------------- environment
def sky(c, storm=0.0):
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, 0), (0, H)], [C("#05060A"), C("#10121A"), C(VOID)], [0, 0.62, 1]))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), p)
    # a few faint stars
    for i in range(46):
        x = (i * 241.7) % W
        y = (i * 137.3) % 900 + 40
        c.drawCircle(x, y, 1.2 + (i % 3) * 0.4, fill("#FFFFFF", (40 + (i * 37) % 60) * (1 - storm)))


def lamp(c, x, y_cable, y_lamp, gy, on=1.0, warm=False):
    """A hanging work lamp with its light cone and a pool on the ground."""
    col = "#FFE2B8" if warm else "#FFFFFF"
    c.drawLine(x, y_cable, x, y_lamp - 18, stroke("#3A3A40", 3))
    shade = skia.Path().moveTo(x - 46, y_lamp).lineTo(x - 18, y_lamp - 22).lineTo(x + 18, y_lamp - 22).lineTo(x + 46, y_lamp).close()
    c.drawPath(shade, fill("#2C2C33"))
    c.drawOval(skia.Rect.MakeXYWH(x - 30, y_lamp - 6, 60, 12), fill(col, 255 * on))
    cone = skia.Paint(AntiAlias=True)
    cone.setShader(skia.GradientShader.MakeLinear([(0, y_lamp), (0, gy)], [C(col, 48 * on), C(col, 14 * on)]))
    cone.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 24))
    c.drawPath(skia.Path().moveTo(x - 40, y_lamp).lineTo(x + 40, y_lamp).lineTo(x + 230, gy).lineTo(x - 230, gy).close(), cone)
    pool = skia.Paint(AntiAlias=True)
    pool.setShader(skia.GradientShader.MakeRadial((x, gy), 260, [C(col, 46 * on), C(col, 0)]))
    c.drawOval(skia.Rect.MakeXYWH(x - 260, gy - 50, 520, 100), pool)


def earth(c, gy, x0=0, x1=W, bottom=H):
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, gy), (0, bottom)], [C(EARTH2), C(VOID)]))
    c.drawRect(skia.Rect.MakeLTRB(x0, gy, x1, bottom), p)
    for i in range(7):
        y = gy + 64 + i * 58
        if y < bottom:
            c.drawLine(x0, y, x1, y + (i % 2) * 5, stroke("#1F1C16", 2, 150 - i * 18))


def ground_line(c, gy, x0=40, x1=W - 40, a=235):
    c.drawLine(x0, gy, x1, gy, stroke(CHALK, 3, a))
    g = stroke(CHALK, 9, 40 * a / 255)
    g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6))
    c.drawLine(x0, gy, x1, gy, g)


# ---------------------------------------------------------------- HUD
def title(c, s, y=300, a=255, size=74):
    f = font("black", size)
    while f.measureText(s) > 960 and size > 40:
        size -= 2
        f = font("black", size)
    text(c, s, W / 2, y, f, CHALK, a, "c", tracking=-1)


def lane_label(c, x, y, name, sub, sub_col=GRAPH, a=255, hero=False):
    text(c, name, x, y, font("monob", 28), CHALK if hero else GRAPH, a, "c", tracking=6)
    text(c, sub, x, y + 38, font("mono", 22), sub_col, a, "c", tracking=4)


def meter(c, x, y, w, k, label, value, col=MOLTEN, a=255):
    """Engineering gauge: label left, value right, bar with ticks."""
    text(c, label, x, y, font("mono", 20), GRAPH, a, "l", tracking=4)
    text(c, value, x + w, y, font("monob", 22), col, a, "r", tracking=2)
    y += 16
    c.drawRRect(rrect(x, y, w, 8, 4), fill("#24242A", a))
    if k > 0:
        c.drawRRect(rrect(x, y, max(8, w * clamp(k)), 8, 4), fill(col, a))
    for i in range(11):
        tx = x + w * i / 10
        c.drawLine(tx, y + 13, tx, y + (19 if i % 5 == 0 else 16), stroke(GRAPH, 2, a * 0.7))


def verdict(c, t, t0, l1, l2, y=420, t_out=None):
    f = font("bold", 80)
    size = 80
    while max(f.measureText(l1), f.measureText(l2)) > 960 and size > 44:
        size -= 2
        f = font("bold", size)
    out = 1 - prog(t, t_out - 0.3, t_out) if t_out else 1
    k1 = e_out(prog(t, t0, t0 + 0.6))
    k2 = e_out(prog(t, t0 + 0.65, t0 + 1.25))
    text(c, l1, W / 2, y + 18 * (1 - k1), f, CHALK, 255 * k1 * out, "c", tracking=-1)
    text(c, l2, W / 2, y + size * 1.2 + 18 * (1 - k2), f, MOLTEN, 255 * k2 * out, "c", tracking=-1)


def watermark(c, ep, a=1.0):
    """Elegant mark: tiny hat + spaced wordmark + episode, bottom centre."""
    y = H - 168
    hat(c, W / 2, y - 26, 0.36, MOLTEN, 210 * a)
    text(c, "LOADBEARING", W / 2, y + 10, font("mono", 19), "#B9B6B0", 150 * a, "c", tracking=9)
    text(c, f"№ {ep:03d}", W / 2, y + 38, font("mono", 15), GRAPH, 120 * a, "c", tracking=5)


def sting(c, t, t0, gy=980):
    """Outro: black, the hat drops onto a line and settles; wordmark fades in."""
    kb = e_io(prog(t, t0, t0 + 0.35))
    if kb <= 0:
        return
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 255 * kb))
    kd = prog(t, t0 + 0.25, t0 + 0.75)
    if kd > 0:
        y = lerp(-120, gy, e_in(kd)) if kd < 1 else gy
        kb2 = prog(t, t0 + 0.75, t0 + 1.05)
        if kb2 > 0:
            y = gy - 26 * math.sin(math.pi * kb2) * (1 - kb2 * 0.5)
        sq = math.sin(math.pi * prog(t, t0 + 0.75, t0 + 0.85)) * 0.12
        c.save()
        c.translate(W / 2, y)
        c.scale(1 + sq, 1 - sq)
        hat(c, 0, 0, 3.0)
        c.restore()
    kl = e_out(prog(t, t0 + 0.7, t0 + 1.1))
    c.drawLine(W / 2 - 240 * kl, gy + 30, W / 2 + 240 * kl, gy + 30, stroke(CHALK, 3, 200 * kl))
    kw = e_out(prog(t, t0 + 0.95, t0 + 1.4))
    text(c, "LOADBEARING", W / 2, gy + 110 + 12 * (1 - kw), font("black", 54), CHALK, 255 * kw, "c", tracking=15)


STING_HIT = 0.75   # seconds after sting start when the hat lands (sonic logo cue)


# ---------------------------------------------------------------- finishing + render
def finish(surf, ep, t, t_sting, dur):
    c = surf.getCanvas()
    img = surf.makeImageSnapshot()
    # bloom at quarter resolution (fast)
    small = skia.Surface(W // 4, H // 4)
    sc = small.getCanvas()
    sc.scale(0.25, 0.25)
    sc.drawImage(img, 0, 0)
    sm = small.makeImageSnapshot()
    bp = skia.Paint()
    bp.setImageFilter(skia.ImageFilters.Blur(6, 6))
    bp.setBlendMode(skia.BlendMode.kScreen)
    bp.setAlphaf(0.5)
    c.save()
    c.scale(4, 4)
    c.drawImage(sm, 0, 0, skia.SamplingOptions(skia.FilterMode.kLinear), bp)
    c.restore()
    vg = skia.Paint(AntiAlias=True)
    vg.setShader(skia.GradientShader.MakeRadial((W / 2, H * 0.55), H * 0.72, [C("#000000", 0), C("#000000", 175)], [0.55, 1.0]))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), vg)
    watermark(c, ep, 1 - prog(t, t_sting, t_sting + 0.3))
    ko = prog(t, dur - 0.25, dur)
    if ko > 0:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fill(VOID, 255 * ko))
    return surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[:, :, :3]


def render(scene, out_mp4, wav_path):
    tmp = out_mp4 + ".v.tmp.mp4"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", tmp]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(int(scene.DUR * FPS)):
        p.stdin.write(scene.frame(i / FPS).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("encode failed")
    fin = out_mp4 + ".tmp.mp4"
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-i", wav_path, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", fin])
    if r.returncode != 0:
        raise SystemExit("mux failed")
    os.replace(fin, out_mp4)
    os.remove(tmp)


def stills(scene, times, prefix):
    from PIL import Image
    for s in times:
        Image.fromarray(scene.frame(float(s))).save(os.path.join(HERE, "frames", f"{prefix}_{float(s):05.2f}.png"))


def sheet(prefix, cols=6):
    import glob
    from PIL import Image
    fs = sorted(glob.glob(os.path.join(HERE, "frames", f"{prefix}_*.png")), key=lambda f: float(f.rsplit("_", 1)[1][:-4]))
    ims = [Image.open(f).resize((270, 480)) for f in fs]
    rows = (len(ims) + cols - 1) // cols
    sh = Image.new("RGB", (276 * min(cols, len(ims)), 486 * rows), (50, 50, 50))
    for i, im in enumerate(ims):
        sh.paste(im, ((i % cols) * 276, (i // cols) * 486))
    out = os.path.join(HERE, "frames", f"sheet_{prefix}.png")
    sh.save(out)
    return out
