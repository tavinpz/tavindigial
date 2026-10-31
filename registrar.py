"""uso: python3 registrar.py ID Arquivo DUR_CONST arq.mp4 estilo 'secoes-json' 'quebras-json' 'fx-ts'  → Root, fx.ts e lote3.json"""
import json, sys, re
cid, mod, dur, arq, estilo, sec, queb, fx = sys.argv[1:9]
r = open('src/Root.tsx').read()
if f'id="{cid}"' not in r:
    r = r.replace("const V = {", f"import {{ {cid}, {dur} }} from './{mod}';\nconst V = {{", 1)
    r = r.replace("  </>\n);", f'    <Composition id="{cid}" component={{{cid}}} durationInFrames={{{dur}}} {{...V}} />\n  </>\n);', 1)
    open('src/Root.tsx', 'w').write(r)
x = open('src/fx.ts').read()
x = re.sub(rf"const {cid} = \(\): L => \[.*?\];\n", '', x, flags=re.S)
x = x.replace("\nexport const FX", f"const {cid} = (): L => [{fx}];\n\nexport const FX", 1)
m = re.search(r"export const FX: Record<string, \(p\?: any\) => L> = \{ (.*?) \};", x)
nomes = [n.strip() for n in m.group(1).split(',')]
if cid not in nomes: nomes.append(cid)
x = x[:m.start()] + "export const FX: Record<string, (p?: any) => L> = { " + ', '.join(nomes) + " };" + x[m.end():]
open('src/fx.ts', 'w').write(x)
L = json.load(open('lote3.json'))
L[cid] = {'arq': arq, 'audio': 'audio_thata.py', 'estilo': int(estilo), 'secoes': json.loads(sec), 'quebras': json.loads(queb)}
json.dump(L, open('lote3.json', 'w'), indent=1, ensure_ascii=False)
print('ok', cid)
