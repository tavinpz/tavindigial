"""Prepara um vídeo para o motor de motion (Remotion em ../atlas-motion).

Para cada pasta videos/NNN-nome gera em atlas-motion/public/v/NNN/:
  data.json  -> spec + tempos das cenas + tempos de cada palavra (legenda karaokê)
  geo_K.json -> recorte do Natural Earth para cada cena de mapa (e para o globo)
  voz.wav    -> narração montada nos tempos certos
O áudio final (voz + efeitos + trilha) é feito por som.py, que lê o mesmo data.json.

Uso: python3 motor/prep_motion.py videos/002-panama [videos/003-suez ...]
"""
import json, math, os, sys
import numpy as np
import soundfile as sf
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
from shapely.geometry import Polygon, MultiPolygon, GeometryCollection


def horario(g):
    """d3-geo espera anel externo no sentido horário; senão pinta o complemento (o mundo todo)."""
    if isinstance(g, Polygon): return orient(g, sign=-1.0)
    if isinstance(g, MultiPolygon): return MultiPolygon([orient(p, sign=-1.0) for p in g.geoms])
    if isinstance(g, GeometryCollection): return MultiPolygon([orient(p, sign=-1.0) for p in g.geoms if isinstance(p, Polygon)])
    return g

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MOTION = os.path.abspath(os.path.join(RAIZ, '..', 'atlas-motion'))
FPS = 30
SR = 24000
GAP = 0.16          # respiro entre falas
INICIO = 0.08       # a voz começa quase no quadro 0 (o gancho precisa de som já)
CAUDA = 0.7         # sobra no fim do vídeo

_cache = {}
def carrega(nome):
    if nome not in _cache:
        _cache[nome] = json.load(open(os.path.join(RAIZ, 'dados', nome)))['features']
    return _cache[nome]


def recorta(bbox, margem=2.6):
    """Recorta países, lagos, ilhas e rios ao redor da caixa (com folga para a câmera abrir)."""
    lon0, lon1, lat0, lat1 = bbox
    w, h = lon1 - lon0, lat1 - lat0
    cx, cy = (lon0 + lon1) / 2, (lat0 + lat1) / 2
    W, H = w * margem, h * margem * 1.4
    caixa = box(max(-180, cx - W / 2), max(-85, cy - H / 2), min(180, cx + W / 2), min(85, cy + H / 2))
    grande = max(w, h) > 14
    tol = max(w, h) / 1400
    saida = []
    paises = carrega('ne50.geojson' if grande else 'ne10.geojson')
    for f in paises:
        g = shape(f['geometry'])
        if not g.intersects(caixa): continue
        g = g.intersection(caixa).simplify(tol, preserve_topology=True)
        if g.is_empty: continue
        saida.append({'k': 'pais', 'a3': f['properties'].get('ADM0_A3'), 'nome': f['properties'].get('NAME'), 'g': mapping(horario(g))})
    if not grande:
        for nome, k in (('ne_10m_lakes.geojson', 'lago'), ('ne_10m_minor_islands.geojson', 'ilha'), ('ne_10m_rivers_lake_centerlines.geojson', 'rio')):
            for f in carrega(nome):
                if f['geometry'] is None: continue
                g = shape(f['geometry'])
                if not g.intersects(caixa): continue
                g = g.intersection(caixa).simplify(tol, preserve_topology=True)
                if g.is_empty: continue
                saida.append({'k': k, 'g': mapping(horario(g) if k != 'rio' else g)})
    return saida


def satelite(bbox, margem, saida):
    """Recorta o Blue Marble (NASA, domínio público) na caixa e reprojeta para Mercator.
    Devolve [lon0, lat0, lon1, lat1] da imagem ou None se a caixa for pequena demais (ficaria borrado)."""
    from PIL import Image
    lon0, lon1, lat0, lat1 = bbox
    if lon1 - lon0 < 12: return None
    w, h = lon1 - lon0, lat1 - lat0
    cx, cy = (lon0 + lon1) / 2, (lat0 + lat1) / 2
    W, H = w * margem, h * margem * 1.4
    a0, a1 = max(-180, cx - W / 2), min(180, cx + W / 2)
    b0, b1 = max(-80, cy - H / 2), min(80, cy + H / 2)
    img = Image.open(os.path.join(MOTION, 'public', 'tex', 'earth-blue-marble.jpg')).convert('RGB')
    arr = np.asarray(img)
    IH, IW = arr.shape[:2]
    ow = int(min(2048, (a1 - a0) / 360 * IW * 1.5))
    merc = lambda lat: np.log(np.tan(np.pi / 4 + np.radians(lat) / 2))
    m0, m1 = merc(b0), merc(b1)
    oh = int(ow * (m1 - m0) / np.radians(a1 - a0))
    ys = m1 - (np.arange(oh) + 0.5) / oh * (m1 - m0)
    lats = np.degrees(2 * np.arctan(np.exp(ys)) - np.pi / 2)
    lons = a0 + (np.arange(ow) + 0.5) / ow * (a1 - a0)
    py = np.clip(((90 - lats) / 180 * IH).astype(int), 0, IH - 1)
    px = np.clip(((lons + 180) / 360 * IW).astype(int), 0, IW - 1)
    out = arr[py[:, None], px[None, :]]
    Image.fromarray(out).save(saida, quality=88)
    return [round(a0, 4), round(b0, 4), round(a1, 4), round(b1, 4)]


def arred(o):
    if isinstance(o, float): return round(o, 4)
    if isinstance(o, (list, tuple)): return [arred(x) for x in o]
    if isinstance(o, dict): return {k: arred(v) for k, v in o.items()}
    return o


def trechos_de_fala(a, sr):
    """Início/fim da fala e silêncios internos (>= 90 ms) de um wav."""
    env = np.abs(a)
    jan = int(sr * 0.01)
    n = len(env) // jan
    e = env[:n * jan].reshape(n, jan).max(axis=1)
    lim = max(0.02, e.max() * 0.06)
    voz = e > lim
    idx = np.where(voz)[0]
    if len(idx) == 0: return 0, len(a) / sr, []
    on, off = idx[0] * 0.01, (idx[-1] + 1) * 0.01
    pausas = []
    i = idx[0]
    while i < idx[-1]:
        if not voz[i]:
            j = i
            while j < idx[-1] and not voz[j]: j += 1
            if (j - i) >= 9: pausas.append(((i) * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return on, off, pausas


def palavras(frase, t0, a, sr):
    """Tempo de cada palavra: divide por frases (pontuação) casando com as maiores pausas."""
    on, off, pausas = trechos_de_fala(a, sr)
    ws = frase.split()
    # grupos por pontuação
    grupos, cur = [], []
    for w in ws:
        cur.append(w)
        if w[-1] in ',.?!:;': grupos.append(cur); cur = []
    if cur: grupos.append(cur)
    k = len(grupos) - 1
    maiores = sorted(sorted(pausas, key=lambda p: p[1] - p[0], reverse=True)[:k])
    if len(maiores) < k:  # menos pausas que vírgulas: junta grupos
        grupos = [ws]; maiores = []
    limites = [on] + [x for p in maiores for x in p] + [off]
    out = []
    for gi, g in enumerate(grupos):
        g0, g1 = limites[2 * gi], limites[2 * gi + 1]
        pesos = [len(w.strip(',.?!:;')) + 1.6 + (1.2 if any(c.isdigit() for c in w) else 0) for w in g]
        tot = sum(pesos); acc = 0
        for w, p in zip(g, pesos):
            ini = g0 + (g1 - g0) * acc / tot; acc += p
            fim = g0 + (g1 - g0) * acc / tot
            out.append({'w': w, 't0': round(t0 + ini, 3), 't1': round(t0 + fim, 3)})
    return out


def prepara(pasta):
    pasta = os.path.abspath(pasta)
    vid = os.path.basename(pasta).split('-')[0]
    spec = json.load(open(os.path.join(pasta, 'spec.json')))
    narr = json.load(open(os.path.join(pasta, 'narr.json')))
    assert narr['lines'] == spec['falas'], 'narr.json desatualizado: rode o motor antigo para gerar a voz'
    dest = os.path.join(MOTION, 'public', 'v', vid)
    os.makedirs(dest, exist_ok=True)

    t = INICIO
    cenas, words = [], []
    faixas = []
    for i, fala in enumerate(spec['falas']):
        a, sr = sf.read(os.path.join(pasta, f'v{i}.wav'), dtype='float32')
        if a.ndim > 1: a = a.mean(axis=1)
        d = len(a) / sr
        ini = 0.0 if i == 0 else t
        words_i = palavras(fala, t, a, sr)
        for w in words_i: w['cena'] = i
        if spec['cenas'][i]['tipo'] != 'cta': words += words_i
        faixas.append((t, a, sr))
        t += d + GAP
        cenas.append({'ini': round(ini, 3), 'fala': round(faixas[-1][0], 3), 'dur_fala': round(d, 3)})
    total = t - GAP + CAUDA
    for i, c in enumerate(cenas):
        fim = cenas[i + 1]['ini'] if i + 1 < len(cenas) else total
        c['fim'] = round(fim, 3)

    # recortes de mapa
    geos = {}
    for i, c in enumerate(spec['cenas']):
        bb = c.get('bbox') or c.get('fundo')
        if c['tipo'] in ('mapa', 'numero') and bb:
            nome = f'geo_{i}.json'
            json.dump(arred(recorta(bb, 5.0 if i == 0 else 3.6)), open(os.path.join(dest, nome), 'w'), separators=(',', ':'))
            geos[i] = nome
            sat = satelite(bb, 5.0 if i == 0 else 3.6, os.path.join(dest, f'sat_{i}.jpg'))
            if sat: c['_sat'] = {'arq': f'sat_{i}.jpg', 'b': sat}

    # voz montada
    n = int(math.ceil(total * SR))
    voz = np.zeros(n, dtype=np.float32)
    for t0, a, sr in faixas:
        if sr != SR:
            import scipy.signal as ss
            a = ss.resample_poly(a, SR, sr).astype(np.float32)
        s = int(t0 * SR); voz[s:s + len(a)] += a[:max(0, n - s)]
    sf.write(os.path.join(dest, 'voz.wav'), voz, SR)

    data = {'id': vid, 'fps': FPS, 'total': round(total, 3), 'quadros': int(math.ceil(total * FPS)),
            'titulo': spec['titulo'], 'arquivo': spec['arquivo'], 'cenas': spec['cenas'], 'tempos': cenas, 'palavras': words, 'geo': geos}
    json.dump(data, open(os.path.join(dest, 'data.json'), 'w'), ensure_ascii=False, indent=0)
    print(vid, f'{total:.1f}s', len(words), 'palavras', 'geo:', list(geos))
    return data


if __name__ == '__main__':
    for p in sys.argv[1:]: prepara(p)
