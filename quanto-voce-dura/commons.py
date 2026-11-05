"""Busca e baixa imagens do Wikimedia Commons com licença, autor e data (para crédito na descrição)."""
import json, sys, time, urllib.parse, urllib.request
UA = 'QuantoVoceDura-research/1.0 (https://tavindigital.online; history video research)'
API = 'https://commons.wikimedia.org/w/api.php'

def get(params):
    params = {**params, 'format': 'json', 'maxlag': '5'}
    req = urllib.request.Request(API + '?' + urllib.parse.urlencode(params), headers={'User-Agent': UA})
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception as e:
            time.sleep(3 * (i + 1))
    return {}

def membros(cat, tipo='file'):
    d = get({'action': 'query', 'list': 'categorymembers', 'cmtitle': f'Category:{cat}', 'cmtype': tipo, 'cmlimit': '100'})
    return [m['title'] for m in d.get('query', {}).get('categorymembers', [])]

def busca(q, n=30):
    d = get({'action': 'query', 'list': 'search', 'srsearch': q, 'srnamespace': '6', 'srlimit': str(n)})
    return [m['title'] for m in d.get('query', {}).get('search', [])]

def info(titulos):
    out = []
    for i in range(0, len(titulos), 40):
        d = get({'action': 'query', 'titles': '|'.join(titulos[i:i + 40]), 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': '1920'})
        for p in d.get('query', {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [{}])[0]
            em = ii.get('extmetadata', {})
            g = lambda k: (em.get(k, {}).get('value') or '')[:200]
            out.append({'titulo': p['title'], 'url': ii.get('thumburl') or ii.get('url'), 'w': ii.get('width'), 'h': ii.get('height'),
                        'licenca': g('LicenseShortName'), 'autor': g('Artist'), 'data': g('DateTimeOriginal'), 'desc': g('ImageDescription')})
        time.sleep(1)
    return out

if __name__ == '__main__':
    modo, *args = sys.argv[1:]
    if modo == 'cat': print('\n'.join(membros(args[0])))
    elif modo == 'busca': print('\n'.join(busca(' '.join(args))))
