"""Short de exemplo: How the Netherlands holds back the sea. 1080x1920, 30 fps.
Cada cena vira um mp4; depois concat + áudio. Desenha em 2x e reduz (antialias)."""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

D = os.path.dirname(os.path.abspath(__file__))
W, H, S, FPS = 1080, 1920, 2, 30
WW, HH = W * S, H * S
FD = '/usr/share/fonts/opentype/inter/'
def F(peso, tam): return ImageFont.truetype(FD + peso, int(tam * S))
BG = (9, 19, 30); SEA = (14, 36, 54); LAND = (31, 50, 68); BORDER = (52, 78, 100)
AMBER = (242, 179, 61); WATER = (63, 167, 245); RED = (240, 90, 70); WHITE = (244, 246, 248); MUTED = (150, 168, 184)

narr = json.load(open(os.path.join(D, 'narr.json')))
DUR = [d + 0.45 for d in narr['dur']]
LINES = narr['lines']

# ---------- mapa ----------
geo = json.load(open(os.path.join(D, '..', '..', 'dados', 'ne50.geojson')))
def polys(feat):
    g = feat['geometry']
    return [p[0] for p in g['coordinates']] if g['type'] == 'MultiPolygon' else [g['coordinates'][0]]
PAISES = [(f['properties'].get('ADM0_A3'), polys(f)) for f in geo['features']]

def mapa(lon0, lon1, lat0, lat1, destaque='NLD', alfa_dest=1.0):
    """Mapa em 2x preenchendo a tela inteira para a caixa lon/lat (centraliza mantendo proporção)."""
    img = Image.new('RGB', (WW, HH), SEA); d = ImageDraw.Draw(img)
    latm = math.radians((lat0 + lat1) / 2); k = math.cos(latm)
    sx = WW / ((lon1 - lon0) * k); sy = HH / (lat1 - lat0); s = max(sx, sy)
    cx, cy = (lon0 + lon1) / 2, (lat0 + lat1) / 2
    def P(lon, lat): return (WW / 2 + (lon - cx) * k * s, HH / 2 - (lat - cy) * s)
    for a3, ps in PAISES:
        for p in ps:
            xy = [P(*c) for c in p]
            if a3 == destaque:
                cor = tuple(int(LAND[i] + (AMBER[i] - LAND[i]) * alfa_dest) for i in range(3))
                d.polygon(xy, fill=cor, outline=None)
            else:
                d.polygon(xy, fill=LAND, outline=BORDER, width=2)
    return img, P

def zoom(img, z, fx=0.5, fy=0.5):
    """Recorta em torno de (fx,fy) com zoom z e devolve no tamanho cheio."""
    w, h = WW / z, HH / z; x0 = fx * WW - w / 2; y0 = fy * HH - h / 2
    x0 = max(0, min(WW - w, x0)); y0 = max(0, min(HH - h, y0))
    return img.resize((WW, HH), Image.BICUBIC, box=(x0, y0, x0 + w, y0 + h))

ease = lambda t: 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, t)))
def fade(t, a, b): return max(0.0, min(1.0, (t - a) / (b - a)))

def texto(d, xy, s, fonte, cor=WHITE, anc='mm', alfa=1.0, sombra=True):
    if alfa <= 0: return
    c = tuple(int(BG[i] + (cor[i] - BG[i]) * alfa) for i in range(3))
    if sombra: d.text((xy[0] + 3 * S, xy[1] + 3 * S), s, font=fonte, fill=(0, 0, 0), anchor=anc)
    d.text(xy, s, font=fonte, fill=c, anchor=anc)

def escurecer(img, a):
    return Image.blend(img, Image.new('RGB', img.size, BG), a)

# ---------- legenda (palavras em blocos) ----------
FCAP = F('InterDisplay-ExtraBold.otf', 64)
def blocos(frase, n=3):
    w = frase.replace(',', ',').split(); return [' '.join(w[i:i + n]) for i in range(0, len(w), n)]
def legenda(d, cena, t):
    bs = blocos(LINES[cena]); tot = sum(len(b) for b in bs); dur = narr['dur'][cena]
    acc = 0
    for b in bs:
        ini = acc / tot * dur; acc += len(b); fim = acc / tot * dur
        if ini <= t < fim + (0.4 if b == bs[-1] else 0):
            pal = b.upper()
            bb = d.textbbox((W * S / 2, 1530 * S), pal, font=FCAP, anchor='mm')
            pad = 22 * S
            d.rounded_rectangle((bb[0] - pad, bb[1] - pad * 0.7, bb[2] + pad, bb[3] + pad * 0.7), radius=18 * S, fill=(0, 0, 0))
            d.text((W * S / 2, 1530 * S), pal, font=FCAP, fill=AMBER if any(ch.isdigit() for ch in pal) else WHITE, anchor='mm')
            return

# ---------- cenas ----------
M0, P0 = mapa(1.2, 8.8, 49.3, 55.6)
M2, P2 = mapa(-1.0, 8.5, 48.6, 58.6, alfa_dest=0.0)
M4, P4 = mapa(2.9, 5.6, 51.15, 52.35)
FBIG = F('InterDisplay-Black.otf', 230); FMED = F('InterDisplay-Bold.otf', 58); FSM = F('Inter-SemiBold.otf', 40)

def cena0(t, d, base):
    z = 1.0 + 0.07 * ease(t / DUR[0])
    a = ease(fade(t, 0.2, 1.4))
    M, _ = mapa(1.2, 8.8, 49.3, 55.6, alfa_dest=a) if a < 1 else (M0, None)
    img = zoom(M, z, 0.5, 0.56)
    d = ImageDraw.Draw(img)
    texto(d, (W * S / 2, 300 * S), '1/4', FBIG, AMBER, alfa=ease(fade(t, 0.6, 1.4)))
    texto(d, (W * S / 2, 450 * S), 'OF THE COUNTRY', FMED, WHITE, alfa=ease(fade(t, 0.9, 1.6)))
    texto(d, (W * S / 2, 520 * S), 'IS BELOW SEA LEVEL', FMED, WHITE, alfa=ease(fade(t, 1.1, 1.8)))
    return img, d

def cena1(t, d, base):
    img = Image.new('RGB', (WW, HH), BG); d = ImageDraw.Draw(img)
    nivel = 980 * S; chao = 1150 * S; dx = 470 * S  # dique no centro
    onda = math.sin(t * 2.4) * 10 * S
    sobe = ease(fade(t, 0.3, 2.2))
    agua = nivel + (120 * S) * (1 - sobe)
    # mar à esquerda
    d.polygon([(0, agua + onda), (dx - 120 * S, agua - onda * 0.5), (dx - 120 * S, 1400 * S), (0, 1400 * S)], fill=WATER)
    # terreno à direita, abaixo do mar
    d.rectangle((dx, chao, WW, 1400 * S), fill=(46, 92, 60))
    d.rectangle((0, 1400 * S, WW, HH), fill=(28, 40, 52))
    # dique
    d.polygon([(dx - 180 * S, 1400 * S), (dx - 40 * S, nivel - 90 * S), (dx + 60 * S, nivel - 90 * S), (dx + 200 * S, 1400 * S)], fill=(92, 110, 80))
    # casas
    for i, x in enumerate([700, 820, 940]):
        x *= S; y = chao
        d.rectangle((x - 34 * S, y - 60 * S, x + 34 * S, y), fill=WHITE)
        d.polygon([(x - 44 * S, y - 60 * S), (x, y - 100 * S), (x + 44 * S, y - 60 * S)], fill=RED)
    # linha do nível do mar
    a = ease(fade(t, 1.2, 2.2))
    if a > 0:
        for x in range(0, WW, 40 * S):
            d.line((x, nivel, x + 22 * S, nivel), fill=AMBER, width=5 * S)
        texto(d, (60 * S, nivel - 50 * S), 'SEA LEVEL', FSM, AMBER, anc='lm', alfa=a)
        texto(d, (1020 * S, chao + 120 * S), 'LAND', FSM, WHITE, anc='rm', alfa=a)
        d.line((1000 * S, nivel + 12 * S, 1000 * S, chao - 12 * S), fill=AMBER, width=4 * S)
    texto(d, (W * S / 2, 330 * S), 'THE SEA IS', FMED, WHITE, alfa=ease(fade(t, 0.2, 0.9)))
    texto(d, (W * S / 2, 420 * S), 'HIGHER THAN', FMED, WHITE, alfa=ease(fade(t, 0.4, 1.1)))
    texto(d, (W * S / 2, 510 * S), 'THE LAND', FMED, AMBER, alfa=ease(fade(t, 0.6, 1.3)))
    return img, d

ZEE = P2(3.9, 51.5)
def cena2(t, d, base):
    img = zoom(M2, 1.0 + 0.05 * ease(t / DUR[2]), 0.5, 0.5); d = ImageDraw.Draw(img)
    # tempestade: seta curva do noroeste para a Zelândia
    p = ease(fade(t, 0.4, 3.6))
    a0 = P2(0.5, 58.3); ctrl = P2(1.2, 53.6)
    pts = []
    for i in range(int(60 * p) + 1):
        u = i / 60
        x = (1 - u) ** 2 * a0[0] + 2 * (1 - u) * u * ctrl[0] + u ** 2 * ZEE[0]
        y = (1 - u) ** 2 * a0[1] + 2 * (1 - u) * u * ctrl[1] + u ** 2 * ZEE[1]
        pts.append((x, y))
    if len(pts) > 1:
        d.line(pts, fill=WATER, width=26 * S, joint='curve')
        x1, y1 = pts[-1]; x0, y0 = pts[-2]; ang = math.atan2(y1 - y0, x1 - x0)
        L = 60 * S
        d.polygon([(x1 + math.cos(ang) * L, y1 + math.sin(ang) * L), (x1 + math.cos(ang + 2.4) * L, y1 + math.sin(ang + 2.4) * L), (x1 + math.cos(ang - 2.4) * L, y1 + math.sin(ang - 2.4) * L)], fill=WATER)
    if t > 3.4:
        for k in range(3):
            r = ((t - 3.4) * 140 + k * 70) % 210 * S
            d.ellipse((ZEE[0] - r, ZEE[1] - r, ZEE[0] + r, ZEE[1] + r), outline=RED, width=6 * S)
    texto(d, (W * S / 2, 300 * S), 'JAN 31, 1953', FMED, AMBER, alfa=ease(fade(t, 0.1, 0.8)))
    texto(d, (W * S / 2, 380 * S), 'NORTH SEA STORM SURGE', FSM, WHITE, alfa=ease(fade(t, 0.3, 1.0)))
    return img, d

def num(v, casas=0): return f'{v:,.0f}'
def cena3(t, d, base):
    img = escurecer(zoom(M4, 1.05, 0.5, 0.5), 0.55); d = ImageDraw.Draw(img)
    c1 = ease(fade(t, 0.2, 2.2)); c2 = ease(fade(t, 2.6, 4.6))
    texto(d, (W * S / 2, 520 * S), num(1836 * c1), FBIG, RED, alfa=fade(t, 0.1, 0.4))
    texto(d, (W * S / 2, 680 * S), 'LIVES LOST', FMED, WHITE, alfa=fade(t, 0.3, 0.8))
    texto(d, (W * S / 2, 960 * S), num(1365 * c2) + ' km²', F('InterDisplay-Black.otf', 150), WATER, alfa=fade(t, 2.5, 2.8))
    texto(d, (W * S / 2, 1090 * S), 'UNDER SEAWATER', FMED, WHITE, alfa=fade(t, 2.7, 3.2))
    return img, d

def cena4(t, d, base):
    img = escurecer(zoom(M4, 1.0 + 0.08 * ease(t / DUR[4]), 0.5, 0.55), 0.35); d = ImageDraw.Draw(img)
    a = ease(fade(t, 0.2, 1.0))
    texto(d, (W * S / 2, 300 * S), 'THE DELTA WORKS', FMED, AMBER, alfa=a)
    texto(d, (W * S / 2, 520 * S), str(int(round(13 * ease(fade(t, 0.6, 2.4))))), FBIG, WHITE, alfa=a)
    texto(d, (W * S / 2, 680 * S), 'DAMS AND STORM BARRIERS', FMED, WHITE, alfa=ease(fade(t, 0.8, 1.5)))
    # linha do tempo 1958 -> 1997
    p = ease(fade(t, 2.4, 5.4)); x0, x1, y = 140 * S, 940 * S, 1150 * S
    d.rounded_rectangle((x0, y - 10 * S, x1, y + 10 * S), radius=10 * S, fill=(40, 60, 80))
    d.rounded_rectangle((x0, y - 10 * S, x0 + (x1 - x0) * p, y + 10 * S), radius=10 * S, fill=AMBER)
    texto(d, (x0, y + 60 * S), '1958', FSM, WHITE, anc='lm', alfa=fade(t, 2.3, 2.7))
    texto(d, (x1, y + 60 * S), '1997', FSM, WHITE, anc='rm', alfa=fade(t, 5.0, 5.4))
    return img, d

def cena5(t, d, base):
    img = Image.new('RGB', (WW, HH), BG); d = ImageDraw.Draw(img)
    # canal visto de cima
    y0, y1 = 760 * S, 1260 * S
    d.rectangle((0, y0 - 220 * S, WW, y0), fill=(46, 92, 60)); d.rectangle((0, y1, WW, y1 + 220 * S), fill=(46, 92, 60))
    d.rectangle((0, y0, WW, y1), fill=WATER)
    for k in range(6):
        x = ((t * 160 + k * 200) % (WW / S + 200) - 100) * S
        d.line((x, y0 + (80 + k * 60) * S, x + 70 * S, y0 + (80 + k * 60) * S), fill=(120, 200, 255), width=4 * S)
    # portões como duas portas curvas: abertas ao longo da margem, fecham atravessando o canal
    fecha = ease(fade(t, 1.4, 4.2))
    meio = (y0 + y1) / 2; L = (y1 - y0) / 2 - 6 * S
    for piv, alvo in (((620 * S, y0), 90), ((620 * S, y1), 270)):
        a = math.radians(180 + (alvo - 180) * fecha)
        pts = []
        for i in range(21):
            u = i / 20; r = L * u
            bojo = math.sin(math.pi * u) * 46 * S  # curva para o lado do mar
            x = piv[0] + math.cos(a) * r - bojo; y = piv[1] + math.sin(a) * r
            pts.append((x, y))
        d.line(pts, fill=AMBER, width=30 * S, joint='curve')
        d.ellipse((piv[0] - 22 * S, piv[1] - 22 * S, piv[0] + 22 * S, piv[1] + 22 * S), fill=WHITE)
    texto(d, (W * S / 2, 300 * S), 'MAESLANTKERING', FMED, AMBER, alfa=ease(fade(t, 0.1, 0.8)))
    texto(d, (W * S / 2, 380 * S), 'ROTTERDAM', FSM, WHITE, alfa=ease(fade(t, 0.3, 1.0)))
    texto(d, (110 * S, (y0 + y1) / 2), 'SEA', FSM, WHITE, anc='lm', alfa=0.9)
    texto(d, (970 * S, (y0 + y1) / 2), 'CITY', FSM, WHITE, anc='rm', alfa=0.9)
    return img, d

def cena6(t, d, base):
    img = escurecer(zoom(M0, 1.12 - 0.06 * ease(t / DUR[6]), 0.5, 0.56), 0.6); d = ImageDraw.Draw(img)
    texto(d, (W * S / 2, 470 * S), '1 IN', FMED, WHITE, alfa=ease(fade(t, 0.2, 0.8)))
    texto(d, (W * S / 2, 640 * S), '10,000', FBIG, AMBER, alfa=ease(fade(t, 0.4, 1.0)))
    texto(d, (W * S / 2, 800 * S), 'YEAR STORM', FMED, WHITE, alfa=ease(fade(t, 0.6, 1.2)))
    texto(d, (W * S / 2, 1140 * S), 'Full story on the channel', FSM, MUTED, alfa=ease(fade(t, DUR[6] - 2.4, DUR[6] - 1.6)))
    return img, d

import importlib.util
_sp = importlib.util.spec_from_file_location('brand_marca', os.path.join(D, '..', '..', 'motor', 'marca_simbolo.py'))
_m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
LOGO = _m.marca(64 * S)
FTAG = F('InterDisplay-ExtraBold.otf', 30)
CENAS = [cena0, cena1, cena2, cena3, cena4, cena5, cena6]

def render(i, frames_only=None):
    dur = DUR[i]; n = int(round(dur * FPS))
    out = os.path.join(D, f'c{i}.mp4'); tmp = os.path.join(D, f'c{i}.tmp.mp4')
    if frames_only is None:
        p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                              '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
    alvo = range(n) if frames_only is None else frames_only
    for f in alvo:
        t = f / FPS
        img, d = CENAS[i](t, None, None)
        d = ImageDraw.Draw(img)
        legenda(d, i, t)
        # assinatura do canal no topo
        img.paste(LOGO, (int(W * S / 2 - 150 * S), int(96 * S)), LOGO)
        d.text((W * S / 2 - 76 * S, 128 * S), 'CONCRETE ATLAS', font=FTAG, fill=WHITE, anchor='lm')
        # fade de entrada/saída curto entre cenas
        a = min(fade(t, 0, 0.18), fade(dur - t, 0, 0.18))
        if a < 1: img = Image.blend(Image.new('RGB', img.size, BG), img, a)
        small = img.reduce(S)
        if frames_only is None: p.stdin.write(small.tobytes())
        else: small.save(os.path.join(D, f'q{i}_{f}.png'))
    if frames_only is None:
        p.stdin.close(); p.wait()
        if p.returncode == 0: os.replace(tmp, out)

if __name__ == '__main__':
    if sys.argv[1] == 'quadros':
        for i, f in [(0, 60), (1, 75), (2, 115), (3, 150), (4, 170), (5, 140), (6, 100)]:
            render(i, [f])
    else:
        for i in map(int, sys.argv[1].split(',')): render(i)
