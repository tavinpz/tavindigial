"""Baixa do Commons usando miniaturas em larguras padrão (as originais costumam dar 429)."""
import json, os, re, sys, time, urllib.request, urllib.parse
UA = 'QuantoVoceDura-research/1.0 (https://tavindigital.online; history video research)'
PAD = [3840, 1920, 1280, 960, 500, 330, 250]
pasta = sys.argv[1]
for i in json.load(open(pasta + '/info.json')):
    nome = i.get('arq')
    if not nome or os.path.exists(f'{pasta}/{nome}'): continue
    u = i['url'].split('?')[0].replace('thumb.wikimedia.org', 'upload.wikimedia.org')
    m = re.match(r'https://upload\.wikimedia\.org/wikipedia/commons/(?:thumb/)?([0-9a-f]/[0-9a-f]{2}/[^/]+)', u)
    if not m: print('url?', nome, u); continue
    cam, arquivo = m.group(1), m.group(1).split('/')[-1]
    larg = next((w for w in PAD if w < (i.get('w') or 9999) and w <= 1920), None)
    url = f'https://upload.wikimedia.org/wikipedia/commons/thumb/{cam}/{larg}px-{arquivo}' if larg else u
    for t in range(6):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read()
            open(f'{pasta}/{nome}', 'wb').write(data); print('ok', nome, larg, flush=True); break
        except Exception as e:
            print('erro', nome, str(e)[:40], flush=True); time.sleep(240)
    time.sleep(3)
print('FIM')
