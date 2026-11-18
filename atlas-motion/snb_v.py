# Copia o visual (v, et, fonte) do roteiro.json para o tempos.json sem narrar de novo. Uso: python3 snb_v.py public/snb/v01
import json, sys
p = sys.argv[1]; r = json.load(open(f'{p}/roteiro.json')); t = json.load(open(f'{p}/tempos.json'))
assert len(r) == len(t['blocos'])
for a, b in zip(r, t['blocos']):
    assert len(a['falas']) == len(b['falas']), a['cena']
    b['et'], b['fonte'] = a.get('et'), a.get('fonte')
    for x, y in zip(a['falas'], b['falas']): assert x['txt'] == y['txt']; y['v'] = x.get('v', {})
json.dump(t, open(f'{p}/tempos.json', 'w'), indent=1, ensure_ascii=False); print('ok', t['total'])
