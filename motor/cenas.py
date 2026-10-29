"""Motor de Shorts do Concrete Atlas.

Cada vídeo é uma pasta com spec.json:
{
  "titulo": "...", "voz": "am_michael", "velocidade": 1.08,
  "falas": ["linha 1", ...],                 # 1 fala = 1 cena
  "cenas": [{"tipo": "mapa", ...}, ...]       # tipos abaixo
}
Uso:  python3 motor/cenas.py videos/002-panama            (narração + render + montagem)
      python3 motor/cenas.py videos/002-panama quadros    (só quadros de conferência)
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(RAIZ, 'motor'))
from marca_simbolo import marca  # noqa: E402

W, H, S, FPS = 1080, 1920, 2, 30
WW, HH = W * S, H * S
FD = '/usr/share/fonts/opentype/inter/'
_fontes = {}
def F(peso, tam):
    k = (peso, tam)
    if k not in _fontes: _fontes[k] = ImageFont.truetype(FD + peso, int(tam * S))
    return _fontes[k]
BG = (9, 19, 30); SEA = (14, 36, 54); LAND = (31, 50, 68); BORDER = (52, 78, 100)
AMBER = (242, 179, 61); WATER = (63, 167, 245); RED = (240, 90, 70); WHITE = (244, 246, 248); MUTED = (150, 168, 184)
GREEN = (46, 92, 60); ROCK = (92, 104, 118)
CORES = {'amber': AMBER, 'red': RED, 'water': WATER, 'white': WHITE}

ease = lambda t: 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))
def fade(t, a, b): return max(0.0, min(1.0, (t - a) / (b - a))) if b > a else float(t >= a)
def mix(c, a): return tuple(int(BG[i] + (c[i] - BG[i]) * a) for i in range(3))

def texto(d, xy, s, fonte, cor=WHITE, anc='mm', alfa=1.0, sombra=True):
    if alfa <= 0: return
    if sombra: d.text((xy[0] + 3 * S, xy[1] + 3 * S), s, font=fonte, fill=(0, 0, 0), anchor=anc)
    d.text(xy, s, font=fonte, fill=mix(cor, alfa), anchor=anc)

def titulos(d, t, titulo=None, sub=None, y=300):
    """Título e subtítulo sobre um cartão escuro (legível em cima de qualquer mapa)."""
    if not titulo and not sub: return
    a = ease(fade(t, 0.1, 0.7))
    if a < 0.03: return
    ft, fs = F('InterDisplay-Bold.otf', 58), F('Inter-SemiBold.otf', 38)
    larg = max(d.textlength(titulo.upper(), font=ft) if titulo else 0, d.textlength(sub.upper(), font=fs) if sub else 0)
    y1 = (y + (76 if sub else 0)) * S
    d.rounded_rectangle((WW / 2 - larg / 2 - 40 * S, y * S - 50 * S, WW / 2 + larg / 2 + 40 * S, y1 + 42 * S), radius=26 * S, fill=mix((5, 10, 16), a * 0.92))
    if titulo: texto(d, (WW / 2, y * S), titulo.upper(), ft, AMBER, alfa=a, sombra=False)
    if sub: texto(d, (WW / 2, (y + 76) * S), sub.upper(), fs, WHITE, alfa=ease(fade(t, 0.3, 0.9)), sombra=False)

# ---------------- mapas ----------------
_geo = {}
def geo(det='50'):
    """Natural Earth 1:50m para mapas amplos; 1:10m para mapas de perto."""
    if det not in _geo:
        g = json.load(open(os.path.join(RAIZ, 'dados', f'ne{det}.geojson')))
        lst = []
        for f in g['features']:
            gg = f['geometry']
            ps = [p[0] for p in gg['coordinates']] if gg['type'] == 'MultiPolygon' else [gg['coordinates'][0]]
            lst.append((f['properties'].get('ADM0_A3'), ps))
        _geo[det] = lst
    return _geo[det]

_cache = {}
def mapa(bbox, destaque=(), conter=False):
    """Mapa 2x que preenche a tela para a caixa [lon0, lon1, lat0, lat1]. Devolve (imagem, projeção)."""
    k = (tuple(bbox), tuple(destaque), conter)
    if k in _cache: return _cache[k]
    lon0, lon1, lat0, lat1 = bbox
    img = Image.new('RGB', (WW, HH), SEA); d = ImageDraw.Draw(img)
    kx = math.cos(math.radians((lat0 + lat1) / 2))
    s = (min if conter else max)(WW / ((lon1 - lon0) * kx), HH / (lat1 - lat0))
    cx, cy = (lon0 + lon1) / 2, (lat0 + lat1) / 2
    P = lambda lon, lat: (WW / 2 + (lon - cx) * kx * s, HH / 2 - (lat - cy) * s)
    det = '10' if (lon1 - lon0) < 12 else '50'
    for a3, ps in geo(det):
        for p in ps:
            xs = [c[0] for c in p]; ys = [c[1] for c in p]
            if max(xs) < lon0 - 30 or min(xs) > lon1 + 30 or max(ys) < lat0 - 30 or min(ys) > lat1 + 30: continue
            d.polygon([P(*c) for c in p], fill=AMBER if a3 in destaque else LAND, outline=None if a3 in destaque else BORDER, width=2)
    _cache[k] = (img, P)
    return img, P

def zoom(img, z, fx=0.5, fy=0.5):
    w, h = WW / z, HH / z; x0 = max(0, min(WW - w, fx * WW - w / 2)); y0 = max(0, min(HH - h, fy * HH - h / 2))
    return img.resize((WW, HH), Image.BICUBIC, box=(x0, y0, x0 + w, y0 + h))

def escurecer(img, a): return Image.blend(img, Image.new('RGB', img.size, BG), a)

_fundo = None
def fundo():
    """Fundo das cenas sem mapa: mapa-múndi quase invisível + grade de pontos, como papel de atlas."""
    global _fundo
    if _fundo is None:
        img = Image.new('RGB', (WW, HH), BG); d = ImageDraw.Draw(img)
        lon0, lon1, lat0, lat1 = -40, 70, -10, 75
        sx = WW / (lon1 - lon0); sy = sx * 1.25
        for a3, ps in geo('50'):
            for p in ps:
                if max(c[0] for c in p) < lon0 or min(c[0] for c in p) > lon1: continue
                d.polygon([((c[0] - lon0) * sx, 520 * S + (lat1 - c[1]) * sy) for c in p], fill=(14, 27, 40))
        for x in range(0, WW, 60 * S):
            for y in range(0, HH, 60 * S):
                d.ellipse((x - 2 * S, y - 2 * S, x + 2 * S, y + 2 * S), fill=(24, 38, 52))
        _fundo = img
    return _fundo.copy()

def seta(d, pts, cor, larg):
    if len(pts) < 2: return
    d.line(pts, fill=cor, width=larg, joint='curve')
    (x0, y0), (x1, y1) = pts[-2], pts[-1]; a = math.atan2(y1 - y0, x1 - x0); L = larg * 2.3
    d.polygon([(x1 + math.cos(a) * L, y1 + math.sin(a) * L), (x1 + math.cos(a + 2.4) * L, y1 + math.sin(a + 2.4) * L), (x1 + math.cos(a - 2.4) * L, y1 + math.sin(a - 2.4) * L)], fill=cor)

def interp(pts, n=80):
    """Pontos densos ao longo de uma polilinha (para animar o traçado)."""
    seg = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(seg) or 1
    out = []
    for k in range(n + 1):
        alvo = tot * k / n; acc = 0
        for i, L in enumerate(seg):
            if acc + L >= alvo or i == len(seg) - 1:
                u = 0 if L == 0 else (alvo - acc) / L
                out.append((pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u)); break
            acc += L
    return out

def gancho(img, t, c):
    """Frase de impacto nos 3 primeiros segundos: aparece no quadro 0, sem esperar."""
    if not c.get('gancho'): return img
    a = 1.0 - fade(t, 2.4, 2.9)
    if a <= 0: return img
    img = Image.blend(img, Image.new('RGB', img.size, BG), 0.45 * a); d = ImageDraw.Draw(img)
    linhas = c['gancho'].upper().split('\n')
    tam = 132
    while tam > 70 and max(ImageDraw.Draw(img).textlength(l, font=F('InterDisplay-Black.otf', tam)) for l in linhas) > 900 * S: tam -= 6
    alt = tam * S * 1.12; y0 = 860 * S - (len(linhas) - 1) * alt / 2
    larg = max(d.textlength(l, font=F('InterDisplay-Black.otf', tam)) for l in linhas)
    pad = 46 * S
    d.rounded_rectangle((WW / 2 - larg / 2 - pad, y0 - alt / 2 - pad * 0.7, WW / 2 + larg / 2 + pad, y0 + (len(linhas) - 0.5) * alt + pad * 0.5),
                        radius=34 * S, fill=mix((5, 10, 16), a))
    for i, l in enumerate(linhas):
        pop = 1 + 0.06 * (1 - fade(t, 0, 0.25))
        texto(d, (WW / 2, y0 + i * alt), l, F('InterDisplay-Black.otf', int(tam * pop)), AMBER if i == len(linhas) - 1 else WHITE, alfa=a, sombra=False)
    return img

def cena_mapa(t, dur, c):
    base, P = mapa(c['bbox'], c.get('destaque', []), c.get('conter', False))
    img = zoom(base, 1.0 + c.get('zoom', 0.06) * ease(t / dur), c.get('fx', 0.5), c.get('fy', 0.5))
    if c.get('escuro'): img = escurecer(img, c['escuro'])
    # a projeção vale para o mapa sem zoom; o zoom leve é tratado como aproximado nos pontos
    z = 1.0 + c.get('zoom', 0.06) * ease(t / dur); fx, fy = c.get('fx', 0.5), c.get('fy', 0.5)
    w, h = WW / z, HH / z; x0 = max(0, min(WW - w, fx * WW - w / 2)); y0 = max(0, min(HH - h, fy * HH - h / 2))
    Q = lambda lon, lat: ((P(lon, lat)[0] - x0) * z, (P(lon, lat)[1] - y0) * z)
    d = ImageDraw.Draw(img)
    rotas = c.get('rotas') or ([c['rota']] if c.get('rota') else [])
    for r in rotas:
        pts = interp([Q(*p) for p in r]); p = ease(fade(t, 0.3, min(dur * 0.75, 3.2)))
        seta(d, pts[:max(2, int(len(pts) * p))], WATER, c.get('largura_rota', 20) * S)
    if c.get('lacuna'):
        a, b = Q(*c['lacuna'][0]), Q(*c['lacuna'][1]); al = fade(t, 0.6, 1.2)
        if al > 0:
            n = 9
            for k in range(n):
                if k % 2: continue
                u0, u1 = k / n, (k + 1) / n
                d.line(((a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0), (a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1)), fill=mix(RED, al), width=14 * S)
    if c.get('enxame'):
        e = c['enxame']; cx, cy = Q(e['lon'], e['lat']); n = int(e['n'] * ease(fade(t, 0.3, dur - 0.6)))
        for k in range(n):
            ang = k * 2.39996; r = (e.get('raio', 160) * S) * math.sqrt(k / e['n'])
            x, y = cx + math.cos(ang) * r, cy + math.sin(ang) * r
            d.ellipse((x - 6 * S, y - 6 * S, x + 6 * S, y + 6 * S), fill=AMBER)
    for i, pin in enumerate(c.get('pins', [])):
        lon, lat = pin[0], pin[1]; lab = pin[2] if len(pin) > 2 else ''
        x, y = Q(lon, lat); a = ease(fade(t, 0.4 + i * 0.35, 0.9 + i * 0.35))
        if a <= 0: continue
        r = 16 * S
        for onda in range(2):
            fase = ((t * 0.9 + onda * 0.5) % 1.0); rr = r * (1.3 + 2.6 * fase)
            d.ellipse((x - rr, y - rr, x + rr, y + rr), outline=mix(RED, a * (1 - fase)), width=4 * S)
        d.ellipse((x - r, y - r, x + r, y + r), fill=mix(RED, a))
        if lab:
            lado = pin[3] if len(pin) > 3 else 'r'
            dx = 50 * S if lado == 'r' else -50 * S
            texto(d, (x + dx, y), lab.upper(), F('InterDisplay-ExtraBold.otf', 40), WHITE, anc='lm' if lado == 'r' else 'rm', alfa=a)
    if c.get('numero'):
        texto(d, (WW / 2, 520 * S), c['numero'], F('InterDisplay-Black.otf', 200), CORES.get(c.get('cor', 'amber')), alfa=ease(fade(t, 0.4, 1.0)))
    titulos(d, t - (2.6 if c.get('gancho') else 0), c.get('titulo'), c.get('sub'))
    return img

def fmt(v, dec=0):
    s = f'{v:,.{dec}f}'
    return s

def cena_numero(t, dur, c):
    if c.get('fundo'):
        base, _ = mapa(c['fundo'], c.get('destaque', []))
        img = escurecer(zoom(base, 1.05 + 0.04 * ease(t / dur)), 0.6)
    else:
        img = fundo()
    d = ImageDraw.Draw(img)
    fim = min(2.2, dur * 0.6)
    v = c['valor'] * ease(fade(t, 0.3, fim))
    s = c.get('prefixo', '') + fmt(v, c.get('decimais', 0)) + c.get('sufixo', '')
    tam = c.get('tamanho', 210 if len(s) <= 7 else 150 if len(s) <= 11 else 112)
    pop = 1 + 0.12 * math.sin(math.pi * fade(t, fim, fim + 0.35))
    cor = CORES.get(c.get('cor', 'amber'))
    # halo atrás do número
    r = 330 * S * ease(fade(t, 0.1, 0.8))
    d.ellipse((WW / 2 - r, 860 * S - r, WW / 2 + r, 860 * S + r), fill=mix(tuple(int(v2 * 0.25) for v2 in cor), 1))
    texto(d, (WW / 2, 860 * S), s, F('InterDisplay-Black.otf', int(tam * pop)), cor, alfa=fade(t, 0.05, 0.3))
    texto(d, (WW / 2, 1040 * S), c.get('label', '').upper(), F('InterDisplay-Bold.otf', 56), WHITE, alfa=ease(fade(t, 0.4, 1.0)))
    if c.get('nota'): texto(d, (WW / 2, 1120 * S), c['nota'], F('Inter-SemiBold.otf', 36), MUTED, alfa=ease(fade(t, 0.8, 1.4)))
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_barras(t, dur, c):
    img = fundo(); d = ImageDraw.Draw(img)
    itens = c['itens']; mx = max(i[1] for i in itens)
    x0, x1 = 90 * S, 990 * S; y = (760 - 60 * (len(itens) - 2)) * S; passo = 210 * S
    for k, it in enumerate(itens):
        lab, val = it[0], it[1]; dest = it[2] if len(it) > 2 else False
        a = ease(fade(t, 0.3 + k * 0.4, 1.6 + k * 0.4))
        cor = AMBER if dest else (70, 96, 122)
        texto(d, (x0, y + k * passo - 46 * S), lab.upper(), F('InterDisplay-Bold.otf', 40), WHITE, anc='lm', alfa=fade(t, 0.2 + k * 0.4, 0.6 + k * 0.4))
        larg = (x1 - x0) * (val / mx) * a
        d.rounded_rectangle((x0, y + k * passo, x0 + max(larg, 1), y + k * passo + 70 * S), radius=14 * S, fill=cor)
        if a > 0.05:
            s = fmt(val * a, c.get('decimais', 0)) + c.get('unidade', '')
            texto(d, (x0 + larg + 20 * S if larg < (x1 - x0) * 0.7 else x0 + larg - 20 * S, y + k * passo + 35 * S), s, F('InterDisplay-ExtraBold.otf', 44),
                  WHITE if larg >= (x1 - x0) * 0.7 else WHITE, anc='lm' if larg < (x1 - x0) * 0.7 else 'rm', alfa=a)
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_perfil(t, dur, c):
    """Corte lateral: terreno, água, túnel, poços, cotas e um marcador que anda."""
    img = fundo(); d = ImageDraw.Draw(img)
    y0p, y1p = c['yrange']; top, bot = 640 * S, 1380 * S; L, R = 0, WW
    X = lambda x: L + (R - L) * x
    Y = lambda y: bot - (y - y0p) / (y1p - y0p) * (bot - top)
    rev = ease(fade(t, 0.1, 1.0))
    if c.get('agua'):
        pts = [(X(x), Y(y)) for x, y in c['agua']]
        d.polygon(pts + [(R, bot + 200 * S), (L, bot + 200 * S)], fill=mix(WATER, rev))
    if c.get('terreno'):
        pts = [(X(x), Y(y)) for x, y in c['terreno']]
        d.polygon(pts + [(R, bot + 200 * S), (L, bot + 200 * S)], fill=mix(c.get('cor_terreno') and tuple(c['cor_terreno']) or ROCK, rev))
    for x in c.get('pocos', []):
        a = fade(t, 0.8, 1.4)
        d.rectangle((X(x) - 26 * S, Y(0), X(x) + 26 * S, Y(c.get('prof_pocos', -50))), fill=mix((30, 40, 52), a), outline=mix(WATER, a), width=4 * S)
    if c.get('tunel'):
        pts = interp([(X(x), Y(y)) for x, y in c['tunel']], 120); p = ease(fade(t, 0.6, min(dur * 0.7, 3.0)))
        d.line(pts[:max(2, int(len(pts) * p))], fill=AMBER, width=22 * S, joint='curve')
    if c.get('nivel_mar') is not None:
        yy = Y(c['nivel_mar']); a = fade(t, 1.0, 1.6)
        for x in range(0, WW, 40 * S): d.line((x, yy, x + 22 * S, yy), fill=mix(WHITE, a), width=4 * S)
        texto(d, (30 * S, yy - 34 * S), 'SEA LEVEL', F('Inter-SemiBold.otf', 32), WHITE, anc='lm', alfa=a)
    for k, (x, ya, yb, lab) in enumerate(c.get('cotas', [])):
        a = ease(fade(t, 1.2 + k * 0.5, 1.8 + k * 0.5))
        if a <= 0: continue
        xx = X(x); d.line((xx, Y(ya), xx, Y(yb)), fill=mix(AMBER, a), width=6 * S)
        for yy in (Y(ya), Y(yb)): d.line((xx - 22 * S, yy, xx + 22 * S, yy), fill=mix(AMBER, a), width=6 * S)
        texto(d, (xx + 36 * S, (Y(ya) + Y(yb)) / 2), lab, F('InterDisplay-Black.otf', 64), AMBER, anc='lm', alfa=a)
    for k, (x, y, lab) in enumerate(c.get('rotulos', [])):
        texto(d, (X(x), Y(y)), lab.upper(), F('InterDisplay-ExtraBold.otf', 36), WHITE, alfa=ease(fade(t, 0.8 + k * 0.3, 1.3 + k * 0.3)))
    if c.get('caminho'):
        pts = interp([(X(x), Y(y)) for x, y in c['caminho']], 200); p = ease(fade(t, 0.8, dur - 0.4))
        x, y = pts[min(len(pts) - 1, int(len(pts) * p))]
        d.rounded_rectangle((x - 46 * S, y - 34 * S, x + 46 * S, y - 4 * S), radius=8 * S, fill=WHITE)
        d.rectangle((x - 20 * S, y - 58 * S, x + 14 * S, y - 34 * S), fill=RED)
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_linha(t, dur, c):
    img = fundo(); d = ImageDraw.Draw(img)
    ev = c['eventos']; x0, x1, y = 120 * S, 960 * S, 900 * S; n = len(ev)
    p = ease(fade(t, 0.2, min(dur - 0.5, 0.6 + n * 0.8)))
    d.rounded_rectangle((x0, y - 8 * S, x1, y + 8 * S), radius=8 * S, fill=(40, 60, 80))
    d.rounded_rectangle((x0, y - 8 * S, x0 + (x1 - x0) * p, y + 8 * S), radius=8 * S, fill=AMBER)
    for k, (ano, lab) in enumerate(ev):
        u = k / max(1, n - 1); x = x0 + (x1 - x0) * u
        if p + 0.06 < u: continue
        a = ease(fade(p, u - 0.06, u)) if u > 0 else 1.0  # o último evento também aparece por inteiro
        d.ellipse((x - 22 * S, y - 22 * S, x + 22 * S, y + 22 * S), fill=AMBER, outline=BG, width=6 * S)
        cima = k % 2 == 0
        texto(d, (x, y - 90 * S if cima else y + 90 * S), str(ano), F('InterDisplay-Black.otf', 72), WHITE, alfa=a)
        for j, linha in enumerate(lab.upper().split('\n')):
            yy = (y - 170 * S - (len(lab.split('\n')) - 1 - j) * 44 * S) if cima else (y + 165 * S + j * 44 * S)
            fl = F('Inter-SemiBold.otf', 34); w2 = d.textlength(linha, font=fl) / 2
            texto(d, (min(max(x, w2 + 40 * S), WW - w2 - 40 * S), yy), linha, fl, MUTED, alfa=a)
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_comportas(t, dur, c):
    img = Image.new('RGB', (WW, HH), BG); d = ImageDraw.Draw(img)
    fundo = 1240 * S; nivel0, nivel1 = 960 * S, 860 * S
    sobe = ease(fade(t, c.get('inicio', 0.6), c.get('inicio', 0.6) + 2.4)) if c.get('sobe', True) else 0.0
    mar = nivel0 - (nivel0 - nivel1) * sobe
    d.rectangle((0, mar, WW * 0.5, fundo), fill=WATER)                       # lado do mar
    d.rectangle((WW * 0.5, nivel0, WW, fundo), fill=(40, 120, 190))          # lagoa
    d.rectangle((0, fundo, WW, HH), fill=(40, 52, 64))
    piv = (WW * 0.5 + 20 * S, fundo); L = 330 * S
    ang = math.radians(180 - 50 * sobe)  # deitada (180°) até 50° de inclinação
    ex, ey = piv[0] + math.cos(ang) * L, piv[1] - math.sin(math.radians(50 * sobe)) * L
    d.line((piv, (ex, ey)), fill=AMBER, width=40 * S)
    d.ellipse((piv[0] - 26 * S, piv[1] - 26 * S, piv[0] + 26 * S, piv[1] + 26 * S), fill=WHITE)
    texto(d, (WW * 0.25, 1320 * S), 'SEA', F('Inter-SemiBold.otf', 38), WHITE, alfa=0.9)
    texto(d, (WW * 0.75, 1320 * S), 'LAGOON', F('Inter-SemiBold.otf', 38), WHITE, alfa=0.9)
    if sobe > 0.05:
        for k in range(3):
            bx = piv[0] - 120 * S + k * 70 * S; by = fundo - 40 * S - ((t * 220 + k * 90) % 260) * S
            d.ellipse((bx - 10 * S, by - 10 * S, bx + 10 * S, by + 10 * S), outline=WHITE, width=4 * S)
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_secao(t, dur, c):
    img = Image.new('RGB', (WW, HH), BG); d = ImageDraw.Draw(img)
    d.rectangle((0, 700 * S, WW, 1300 * S), fill=(52, 64, 78))
    circ = c['circulos']; n = len(circ); passo = WW / (n + 1)
    for k, (lab, r, cor) in enumerate(circ):
        a = ease(fade(t, 0.3 + k * 0.45, 0.9 + k * 0.45)); x = passo * (k + 1); y = 1000 * S; rr = r * S * (0.6 + 0.4 * a)
        if a <= 0: continue
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=mix(BG, a), outline=mix(CORES.get(cor, AMBER), a), width=10 * S)
        texto(d, (x, y + rr + 70 * S), lab.upper(), F('InterDisplay-Bold.otf', 36), WHITE, alfa=a)
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_salao(t, dur, c):
    """Salão de pilares em perspectiva (G-Cans)."""
    img = Image.new('RGB', (WW, HH), (14, 20, 28)); d = ImageDraw.Draw(img)
    hz = 1000 * S; cx = WW / 2
    d.polygon([(0, 1480 * S), (WW, 1480 * S), (cx + 60 * S, hz), (cx - 60 * S, hz)], fill=(30, 38, 48))
    rev = ease(fade(t, 0.2, 2.2))
    for fila in range(6, 0, -1):
        prof = fila / 6; esc = 1 - prof * 0.82
        yb = hz + (1480 * S - hz) * esc; alt = 760 * S * esc; larg = 70 * S * esc
        for col in (-3, -2, -1, 1, 2, 3):
            if fila / 6 > rev + 0.15: continue
            x = cx + col * 300 * S * esc
            tom = int(110 + 70 * esc)
            d.rectangle((x - larg / 2, yb - alt, x + larg / 2, yb), fill=(tom, tom + 6, tom + 12))
    d.rectangle((0, 0, WW, 260 * S), fill=(14, 20, 28))
    for k, (lab, x, y) in enumerate(c.get('rotulos', [])):
        texto(d, (x * S, y * S), lab, F('InterDisplay-Black.otf', 64), AMBER, alfa=ease(fade(t, 0.8 + k * 0.5, 1.3 + k * 0.5)))
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

def cena_lista(t, dur, c):
    img = fundo(); d = ImageDraw.Draw(img)
    for k, item in enumerate(c['itens']):
        a = ease(fade(t, 0.3 + k * 0.7, 0.8 + k * 0.7)); y = (640 + k * 200) * S
        if a <= 0: continue
        dx = (1 - a) * 80 * S
        d.rounded_rectangle((90 * S + dx, y, 990 * S + dx, y + 160 * S), radius=24 * S, fill=mix((24, 40, 56), a))
        d.rounded_rectangle((90 * S + dx, y, 104 * S + dx, y + 160 * S), radius=7 * S, fill=mix(AMBER, a))
        texto(d, (140 * S + dx, y + 80 * S), item.upper(), F('InterDisplay-ExtraBold.otf', 44), WHITE, anc='lm', alfa=a, sombra=False)
    titulos(d, t, c.get('titulo'), c.get('sub'))
    return img

_logo_grande = None
def cena_cta(t, dur, c):
    global _logo_grande
    if _logo_grande is None: _logo_grande = marca(300 * S)
    img = fundo(); d = ImageDraw.Draw(img)
    a = ease(fade(t, 0.1, 0.7)); esc = 0.85 + 0.15 * a
    lg = _logo_grande.resize((int(300 * S * esc), int(300 * S * esc)), Image.LANCZOS)
    alpha = lg.split()[3].point(lambda v: int(v * a))
    img.paste(lg, (int(WW / 2 - lg.width / 2), int(560 * S - lg.height / 2)), alpha)
    texto(d, (WW / 2, 830 * S), 'CONCRETE ATLAS', F('InterDisplay-Black.otf', 84), WHITE, alfa=a)
    texto(d, (WW / 2, 930 * S), c.get('linha', 'A new megaproject every day'), F('InterDisplay-SemiBold.otf', 44), AMBER, alfa=ease(fade(t, 0.4, 1.0)))
    b = ease(fade(t, 0.7, 1.2)); pulso = 1 + 0.04 * math.sin(t * 6)
    if b > 0:
        bw, bh = 440 * S * pulso, 110 * S * pulso
        d.rounded_rectangle((WW / 2 - bw / 2, 1080 * S - bh / 2, WW / 2 + bw / 2, 1080 * S + bh / 2), radius=bh / 2, fill=mix(RED, b))
        texto(d, (WW / 2, 1080 * S), 'FOLLOW', F('InterDisplay-Black.otf', 56), WHITE, alfa=b, sombra=False)
    return img

TIPOS = {'mapa': cena_mapa, 'numero': cena_numero, 'barras': cena_barras, 'perfil': cena_perfil, 'linha': cena_linha,
         'comportas': cena_comportas, 'secao': cena_secao, 'salao': cena_salao, 'lista': cena_lista, 'cta': cena_cta}

# ---------------- legenda e assinatura ----------------
def blocos(frase, n=3):
    w = frase.split(); return [' '.join(w[i:i + n]) for i in range(0, len(w), n)]

def legenda(d, frase, dur_fala, t):
    bs = blocos(frase); tot = sum(len(b) for b in bs); acc = 0
    for b in bs:
        ini = acc / tot * dur_fala; acc += len(b); fim = acc / tot * dur_fala
        if ini <= t < fim + (0.4 if b == bs[-1] else 0):
            pal = b.upper(); pop = 1 + 0.14 * (1 - fade(t, ini, ini + 0.12)); fonte = F('InterDisplay-ExtraBold.otf', int(64 * pop))
            bb = d.textbbox((WW / 2, 1530 * S), pal, font=fonte, anchor='mm'); pad = 22 * S
            d.rounded_rectangle((bb[0] - pad, bb[1] - pad * 0.7, bb[2] + pad, bb[3] + pad * 0.7), radius=18 * S, fill=(0, 0, 0))
            d.text((WW / 2, 1530 * S), pal, font=fonte, fill=AMBER if any(ch.isdigit() for ch in pal) else WHITE, anchor='mm')
            return

_marcas = None
def marcas_dagua():
    """Camada 1x com as marcas do canal: assinatura no topo, faixa vertical lateral e @ acima da legenda."""
    global _marcas
    if _marcas is None:
        lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
        lg = marca(64); lay.paste(lg, (W // 2 - 150, 96), lg)
        d.text((W // 2 - 76, 128), 'CONCRETE ATLAS', font=ImageFont.truetype(FD + 'InterDisplay-ExtraBold.otf', 30), fill=WHITE + (255,), anchor='lm')
        # faixa vertical na lateral esquerda
        tira = Image.new('RGBA', (900, 40), (0, 0, 0, 0)); td = ImageDraw.Draw(tira)
        td.text((450, 20), 'CONCRETE ATLAS  •  ORIGINAL MAP ANIMATION', font=ImageFont.truetype(FD + 'Inter-SemiBold.otf', 22), fill=(244, 246, 248, 95), anchor='mm')
        tira = tira.rotate(90, expand=True); lay.paste(tira, (14, H // 2 - 450), tira)
        # @ do canal acima da legenda
        d.text((W // 2, 1440), '@ConcreteAtlas', font=ImageFont.truetype(FD + 'Inter-SemiBold.otf', 30), fill=(244, 246, 248, 140), anchor='mm')
        # vinheta suave nas bordas
        vin = Image.new('L', (W, H), 0); vd = ImageDraw.Draw(vin)
        for k in range(24):
            a = int(110 * (1 - k / 24) ** 2.2)
            vd.rectangle((k * 6, k * 9, W - k * 6, H - k * 9), outline=a, width=6)
        sombra = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sombra.putalpha(vin)
        _marcas = Image.alpha_composite(sombra, lay)
    return _marcas

# ---------------- narração, render, montagem ----------------
def narrar(pasta, spec):
    import soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(RAIZ, 'modelo/kokoro-v1.0.onnx'), os.path.join(RAIZ, 'modelo/voices-v1.0.bin'))
    dur = []
    for i, frase in enumerate(spec['falas']):
        a, sr = k.create(frase, voice=spec.get('voz', 'am_michael'), speed=spec.get('velocidade', 1.08), lang='en-us')
        sf.write(os.path.join(pasta, f'v{i}.wav'), a, sr); dur.append(len(a) / sr)
    json.dump({'dur': dur, 'lines': spec['falas']}, open(os.path.join(pasta, 'narr.json'), 'w'))
    return dur

def quadro(spec, i, t, dur):
    c = spec['cenas'][i]
    img = TIPOS[c['tipo']](t, dur, c)
    img = gancho(img, t, c)
    d = ImageDraw.Draw(img)
    if c['tipo'] != 'cta': legenda(d, spec['falas'][i], dur - 0.45, t)
    # transição: só entre cenas (o primeiro quadro do vídeo já aparece cheio, para o gancho)
    a = min(fade(t, 0, 0.18) if i > 0 else 1.0, fade(dur - t, 0, 0.18) if i < len(spec['cenas']) - 1 else 1.0)
    if a < 1: img = Image.blend(Image.new('RGB', img.size, BG), img, a)
    small = img.reduce(S).convert('RGBA')
    return Image.alpha_composite(small, marcas_dagua()).convert('RGB')

def render_cena(pasta, spec, i, dur):
    out = os.path.join(pasta, f'c{i}.mp4'); tmp = os.path.join(pasta, f'c{i}.tmp.mp4')
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
    for f in range(int(round(dur * FPS))):
        p.stdin.write(quadro(spec, i, f / FPS, dur).tobytes())
    p.stdin.close(); p.wait()
    if p.returncode != 0: raise SystemExit(f'ffmpeg falhou na cena {i}')
    os.replace(tmp, out)

def montar(pasta, durs, saida):
    k = len(durs)
    open(os.path.join(pasta, 'lista.txt'), 'w').write(''.join(f"file 'c{i}.mp4'\n" for i in range(k)))
    ins, filt, t = [], [], 0
    for i, d in enumerate(durs):
        ins += ['-i', os.path.join(pasta, f'v{i}.wav')]; ms = int((t + 0.12) * 1000); filt.append(f'[{i}:a]adelay={ms}|{ms}[a{i}]'); t += d
    f = ';'.join(filt) + ';' + ''.join(f'[a{i}]' for i in range(k)) + f'amix=inputs={k}:normalize=0,apad,atrim=0:{t:.2f}[out]'
    narr = os.path.join(pasta, 'narr.wav'); vid = os.path.join(pasta, 'video.tmp.mp4'); tmp = saida + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ins, '-filter_complex', f, '-map', '[out]', '-ar', '48000', narr], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(pasta, 'lista.txt'), '-c', 'copy', vid], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vid, '-i', narr, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '160k', '-shortest', tmp], check=True)
    os.replace(tmp, saida)

def main():
    pasta = os.path.abspath(sys.argv[1]); modo = sys.argv[2] if len(sys.argv) > 2 else 'tudo'
    spec = json.load(open(os.path.join(pasta, 'spec.json')))
    assert len(spec['falas']) == len(spec['cenas']), 'falas e cenas precisam ter o mesmo tamanho'
    nj = os.path.join(pasta, 'narr.json')
    if os.path.exists(nj) and json.load(open(nj)).get('lines') == spec['falas']:
        falas = json.load(open(nj))['dur']
    else:
        falas = narrar(pasta, spec)
    durs = [d + 0.45 for d in falas]
    if modo == 'narrar':  # só a voz, para o motor de motion (prep_motion.py)
        print('voz ok', round(sum(falas), 1), 's'); return
    if modo == 'quadros':
        frames = []
        for i, dur in enumerate(durs):
            frames.append(quadro(spec, i, min(dur - 0.3, dur * 0.75), dur).resize((270, 480)))
        folha = Image.new('RGB', (280 * len(frames), 480), (255, 255, 255))
        for i, fr in enumerate(frames): folha.paste(fr, (i * 280, 0))
        folha.save(os.path.join(pasta, 'quadros.png')); print('quadros ok'); return
    for i, dur in enumerate(durs): render_cena(pasta, spec, i, dur)
    os.makedirs(os.path.join(RAIZ, 'saida'), exist_ok=True)
    saida = os.path.join(RAIZ, 'saida', spec['arquivo'])
    montar(pasta, durs, saida); print('ok', saida, round(sum(durs), 1), 's')

if __name__ == '__main__':
    main()
