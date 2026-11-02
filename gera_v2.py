"""Registra os roteiros v2 (src/v2/roteiros/*.json): narração (src/narra.ts), efeitos (src/fx.ts), Root e lote3.json.
uso: python3 gera_v2.py [ID ...]   (sem IDs = todos)
"""
import glob, json, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(AQUI, 'src', 'v2', 'roteiros')


def carrega(cid):
    return json.load(open(os.path.join(R, f'{cid}.json')))


def tempos(r):
    t, out = 0, []
    for c in r['cenas']:
        out.append(t); t += c['dur']
    return out, t


def narra_de(r):
    ini, _ = tempos(r)
    linhas = []
    for c, a in zip(r['cenas'], ini):
        if c.get('falas'):
            for x, y, t in c['falas']: linhas.append([a + x, a + y, t])
        elif c.get('fala'):
            linhas.append([a + 4, a + c['dur'] - 4, c['fala']])
    return linhas


def fx_de(r):
    ini, tot = tempos(r)
    fx = [['sobe', 2]]
    for k, (c, a) in enumerate(zip(r['cenas'], ini)):
        if k > 0 and c['tipo'] != 'fecho': fx.append(['swish', a])
        for t in c.get('telas', []) or []:
            for q in t.get('cliques', []) or []: fx.append(['tecla', a + q])
            if t.get('realce'): fx.append(['pop', a + t['realce']['ini']])
            if t.get('lupa'): fx.append(['pop', a + t['lupa']['ini']])
        if c['tipo'] == 'beneficios': fx.append(['chime', a + 12])
        if c['tipo'] == 'compara': fx.append(['chime', a + 10])
        if c['tipo'] == 'fecho': fx.append(['logo', a + 14])
    fx.sort(key=lambda x: x[1])
    return fx


def secoes(r):
    ini, tot = tempos(r)
    p_fim = next((a + c['dur'] for c, a in zip(r['cenas'], ini) if c['tipo'] == 'problema'), 0)
    f_ini = next((a for c, a in zip(r['cenas'], ini) if c['tipo'] == 'fecho'), tot)
    return [['calmo', 0, p_fim], ['cheio', p_fim, f_ini], ['calmo', f_ini, tot]], [p_fim, f_ini]


def registra(cid):
    r = carrega(cid)
    _, tot = tempos(r)
    # narra.ts
    p = os.path.join(AQUI, 'src', 'narra.ts'); s = open(p).read()
    s = re.sub(rf"\n  {cid}: \[\n.*?\n  \],", '', s, flags=re.S)
    linhas = ''.join(f"    [{a}, {b}, {json.dumps(t, ensure_ascii=False).replace(chr(39), chr(92) + chr(39)).replace(chr(34), chr(39))}],\n" for a, b, t in narra_de(r))
    s = s.rstrip().rstrip('};').rstrip() + f'\n  {cid}: [\n{linhas}  ],\n' + '};\n'
    open(p, 'w').write(s)
    # fx.ts
    p = os.path.join(AQUI, 'src', 'fx.ts'); x = open(p).read()
    x = re.sub(rf"const {cid} = \(\): L => \[.*?\];\n", '', x, flags=re.S)
    fx = ', '.join(f"['{a}', {b}]" for a, b in fx_de(r))
    x = x.replace("\nexport const FX", f"const {cid} = (): L => [{fx}];\n\nexport const FX", 1)
    m = re.search(r"export const FX: Record<string, \(p\?: any\) => L> = \{ (.*?) \};", x)
    nomes = [n.strip() for n in m.group(1).split(',')]
    if cid not in nomes: nomes.append(cid)
    x = x[:m.start()] + "export const FX: Record<string, (p?: any) => L> = { " + ', '.join(nomes) + " };" + x[m.end():]
    open(p, 'w').write(x)
    # Root.tsx
    p = os.path.join(AQUI, 'src', 'Root.tsx'); t = open(p).read()
    if "from './v2/Func2'" not in t:
        t = t.replace("const V = {", "import { Func2 } from './v2/Func2';\nconst V = {", 1)
    t = re.sub(rf'\n    <Composition id="{cid}" component={{Func2}} durationInFrames={{\d+}} {{\.\.\.V}} />', '', t)
    t = t.replace("  </>\n);", f'    <Composition id="{cid}" component={{Func2}} durationInFrames={{{tot}}} {{...V}} />\n  </>\n);', 1)
    open(p, 'w').write(t)
    # lote3.json
    L = json.load(open(os.path.join(AQUI, 'lote3.json')))
    sec, qb = secoes(r)
    L[cid] = {'arq': r['arq'], 'audio': 'audio_thata.py', 'estilo': r.get('estilo', 1), 'secoes': sec, 'quebras': qb}
    json.dump(L, open(os.path.join(AQUI, 'lote3.json'), 'w'), indent=1, ensure_ascii=False)
    print('ok', cid, tot, f'{tot / 30:.1f}s')


def indice():
    ids = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(R, '*.json')))
    imp = ''.join(f"import {i} from './roteiros/{i}.json';\n" for i in ids)
    open(os.path.join(AQUI, 'src', 'v2', 'roteiros.ts'), 'w').write(
        "// gerado pelo gera_v2.py\nimport type { Roteiro } from './Func2';\n" + imp +
        "export const ROTEIROS: Record<string, Roteiro> = { " + ', '.join(f'{i}: {i} as unknown as Roteiro' for i in ids) + " };\n")
    return ids


if __name__ == '__main__':
    ids = indice()
    for cid in (sys.argv[1:] or ids): registra(cid)
