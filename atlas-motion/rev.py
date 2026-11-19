# Atualiza só o visual (campo v) do tempos.json a partir do roteiro.json, sem narrar de novo. Vale quando o texto das falas não mudou.
# Uso: python3 rev.py public/htc/vNN
import json, sys
P = sys.argv[1].rstrip('/'); R = json.load(open(f'{P}/roteiro.json')); T = json.load(open(f'{P}/tempos.json'))
assert len(R) == len(T['blocos'])
for b, t in zip(R, T['blocos']):
    assert len(b['falas']) == len(t['falas']), b['cena']
    t['fonte'] = b.get('fonte'); t['nome'] = b.get('nome'); t['trava'] = b.get('trava')
    for f, g in zip(b['falas'], t['falas']):
        assert f['txt'] == g['txt'], f['txt']; g['v'] = f.get('v', {})
json.dump(T, open(f'{P}/tempos.json', 'w'), indent=1); print('visual atualizado')
