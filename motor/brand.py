"""Kit de marca do Concrete Atlas: logo, marca d'água, banner, miniatura de exemplo e folha da marca."""
import json, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, '..', 'marca'); os.makedirs(OUT, exist_ok=True)
FD = '/usr/share/fonts/opentype/inter/'
def F(p, t): return ImageFont.truetype(FD + p, int(t))
NAVY = (9, 19, 32); SEA = (14, 36, 54); LAND = (31, 50, 68); BORDER = (52, 78, 100)
AMBER = (242, 179, 61); WATER = (63, 167, 245); WHITE = (244, 246, 248); MUTED = (150, 168, 184)

def marca(tam, fundo=True):
    """Símbolo: arco de ponte âmbar sobre a linha do horizonte, com grade de globo ao fundo."""
    S = 4; W = tam * S
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    if fundo: d.ellipse((0, 0, W - 1, W - 1), fill=NAVY)
    c = W / 2; R = W * 0.40
    # grade de globo (meridianos e paralelos) em azul-mar
    for k in (-0.6, -0.3, 0.3, 0.6):
        rx = R * abs(k)
        d.ellipse((c - rx, c - R, c + rx, c + R), outline=SEA + (255,), width=int(W * 0.012))
    d.line((c, c - R, c, c + R), fill=SEA + (255,), width=int(W * 0.012))
    for k in (-0.55, -0.25, 0.25, 0.55):
        y = c + R * k; hw = math.sqrt(max(0, R * R - (R * k) ** 2))
        d.line((c - hw, y, c + hw, y), fill=SEA + (255,), width=int(W * 0.012))
    d.ellipse((c - R, c - R, c + R, c + R), outline=BORDER + (255,), width=int(W * 0.014))
    # arco da ponte
    ar = R * 0.62; esp = W * 0.075; base = c + R * 0.30
    d.arc((c - ar, base - ar, c + ar, base + ar), start=180, end=360, fill=AMBER + (255,), width=int(esp))
    # tabuleiro (linha do horizonte)
    d.rounded_rectangle((c - R * 0.86, base - esp * 0.10, c + R * 0.86, base + esp * 0.62), radius=esp * 0.3, fill=WHITE + (255,))
    # pilares
    for x in (c - ar + esp / 2, c + ar - esp / 2):
        d.rectangle((x - esp / 2, base, x + esp / 2, base + R * 0.28), fill=AMBER + (255,))
    return img.resize((tam, tam), Image.LANCZOS)

# ---------- logo e marca d'água ----------
marca(800).save(os.path.join(OUT, 'logo_800.png'))
marca(150).save(os.path.join(OUT, 'marca_dagua_150.png'))

# ---------- mapa-múndi de fundo ----------
geo = json.load(open(os.path.join(D, '..', 'dados', 'ne50.geojson')))
def mundo(W, H, lon0=-170, lon1=190, lat0=-58, lat1=80, cor=LAND):
    img = Image.new('RGB', (W, H), SEA); d = ImageDraw.Draw(img)
    sx = W / (lon1 - lon0); sy = H / (lat1 - lat0)
    P = lambda lon, lat: ((lon - lon0) * sx, (lat1 - lat) * sy)
    for f in geo['features']:
        g = f['geometry']; ps = [p[0] for p in g['coordinates']] if g['type'] == 'MultiPolygon' else [g['coordinates'][0]]
        for p in ps: d.polygon([P(*c) for c in p], fill=cor)
    return img, P

# megaprojetos conhecidos (lon, lat) para os pontos do banner
OBRAS = [(4.1, 51.9), (-79.9, 9.1), (32.3, 30.6), (113.9, 22.3), (55.1, 25.1), (111.0, 30.8), (139.7, 35.7), (12.6, 55.7), (-114.7, 36.0), (3.4, 6.4), (106.8, -6.2), (-47.9, -15.8)]

# ---------- banner 2560x1440 (área segura central 1546x423) ----------
W, H = 2560, 1440
bg, P = mundo(W, H)
bg = Image.blend(bg, Image.new('RGB', (W, H), NAVY), 0.45)
d = ImageDraw.Draw(bg)
for lon, lat in OBRAS:
    x, y = P(lon, lat)
    for r, a in ((26, 70), (14, 140)):
        d.ellipse((x - r, y - r, x + r, y + r), fill=tuple(int(NAVY[i] + (AMBER[i] - NAVY[i]) * a / 255) for i in range(3)))
    d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=AMBER)
# faixa central escura para o texto
faixa = Image.new('L', (W, H), 0); fd = ImageDraw.Draw(faixa)
fd.rectangle((0, 470, W, 970), fill=200); faixa = faixa.filter(ImageFilter.GaussianBlur(60))
bg = Image.composite(Image.new('RGB', (W, H), NAVY), bg, faixa); d = ImageDraw.Draw(bg)
m = marca(220); bg.paste(m, (W // 2 - 700, H // 2 - 110), m)
d.text((W // 2 - 440, H // 2 - 40), 'CONCRETE ATLAS', font=F('InterDisplay-Black.otf', 132), fill=WHITE, anchor='lm')
d.text((W // 2 - 434, H // 2 + 70), 'How the world builds against nature', font=F('InterDisplay-SemiBold.otf', 52), fill=AMBER, anchor='lm')
bg.save(os.path.join(OUT, 'banner_2560x1440.png'))

# ---------- miniatura de exemplo 1280x720 ----------
W, H = 1280, 720
th = Image.new('RGB', (W, H), NAVY); d = ImageDraw.Draw(th)
# recorte do mapa da Holanda à direita
lon0, lon1, lat0, lat1 = 2.5, 7.6, 50.6, 53.8
mw, mh = 620, 720; sx = mw / ((lon1 - lon0) * math.cos(math.radians(52.2))); s = max(sx, mh / (lat1 - lat0))
mp = Image.new('RGB', (mw, mh), SEA); md = ImageDraw.Draw(mp)
cx, cy = (lon0 + lon1) / 2, (lat0 + lat1) / 2; k = math.cos(math.radians(52.2))
for f in geo['features']:
    g = f['geometry']; ps = [p[0] for p in g['coordinates']] if g['type'] == 'MultiPolygon' else [g['coordinates'][0]]
    a3 = f['properties'].get('ADM0_A3')
    for p in ps:
        md.polygon([(mw / 2 + (lo - cx) * k * s, mh / 2 - (la - cy) * s) for lo, la in p], fill=AMBER if a3 == 'NLD' else LAND)
th.paste(mp, (W - mw, 0))
d = ImageDraw.Draw(th)
d.rectangle((W - mw - 6, 0, W - mw, H), fill=AMBER)
d.text((60, 250), 'BELOW', font=F('InterDisplay-Black.otf', 128), fill=WHITE, anchor='lm')
d.text((60, 385), 'THE SEA', font=F('InterDisplay-Black.otf', 128), fill=AMBER, anchor='lm')
d.text((64, 520), 'and still dry', font=F('InterDisplay-SemiBold.otf', 54), fill=MUTED, anchor='lm')
m = marca(90); th.paste(m, (60, 40), m)
th.save(os.path.join(OUT, 'miniatura_exemplo.png'))

# ---------- folha da marca ----------
W, H = 1600, 1000
sh = Image.new('RGB', (W, H), (244, 246, 248)); d = ImageDraw.Draw(sh)
d.text((70, 80), 'Concrete Atlas', font=F('InterDisplay-Black.otf', 72), fill=NAVY, anchor='lm')
d.text((72, 140), 'Brand kit · faceless explainers about megaprojects, cities and geography', font=F('Inter-Medium.otf', 28), fill=(80, 96, 110), anchor='lm')
m = marca(300); sh.paste(m, (70, 210), m)
m2 = marca(96); sh.paste(m2, (400, 214), m2)
d.text((400, 340), 'Profile 800 px · watermark 150 px', font=F('Inter-Medium.otf', 22), fill=(80, 96, 110), anchor='lm')
cores = [('Navy', NAVY, '#091320'), ('Sea', SEA, '#0E2436'), ('Land', LAND, '#1F3244'), ('Amber', AMBER, '#F2B33D'), ('Water', WATER, '#3FA7F5'), ('Paper', WHITE, '#F4F6F8')]
for i, (n, c, hx) in enumerate(cores):
    x = 70 + i * 245; y = 560
    d.rounded_rectangle((x, y, x + 220, y + 150), radius=16, fill=c, outline=(200, 208, 214))
    d.text((x, y + 180), n, font=F('Inter-Bold.otf', 26), fill=NAVY, anchor='lm')
    d.text((x, y + 214), hx, font=F('Inter-Medium.otf', 22), fill=(80, 96, 110), anchor='lm')
d.text((70, 880), 'TITLES: INTER DISPLAY BLACK, UPPERCASE', font=F('InterDisplay-Black.otf', 34), fill=NAVY, anchor='lm')
d.text((70, 930), 'Body and captions: Inter Display ExtraBold · numbers in Amber · water in Water blue', font=F('Inter-Medium.otf', 26), fill=(80, 96, 110), anchor='lm')
sh.save(os.path.join(OUT, 'folha_da_marca.png'))
print('ok', os.listdir(OUT))
