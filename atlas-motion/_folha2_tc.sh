#!/bin/bash
# Folha de contato resumida de um vídeo: ./_folha2_tc.sh v02  -> /tmp/tc/fl_v02_*.jpg (1 quadro a cada 3 falas + capítulos)
V=$1; D=/tmp/tc/fl_$V; rm -rf $D
FR=$(python3 -c "
import json
T=json.load(open('public/tc/$V/tempos.json')); fr=[]; k=0
for b in T['blocos']:
    if b.get('cap'): fr.append(round(b['ini']*30)+45)
    for f in b['falas']:
        k+=1
        if k%2==0 or b['cena']!='duo': fr.append(round((f['t']+f['d']*0.9)*30))
print(','.join(map(str,sorted(set(fr)))))")
node _folha_tc.mjs $PWD/src/index.ts tc/$V $D $FR 2>&1 | grep "^ok"
python3 -I - <<PY
from PIL import Image, ImageDraw
import glob
fs=sorted(glob.glob('$D/q*.jpg')); per=42
for s in range(0,len(fs),per):
    lot=fs[s:s+per]; cols=6; rows=-(-len(lot)//cols)
    sh=Image.new('RGB',(cols*320,rows*180),'#111')
    for i,f in enumerate(lot): sh.paste(Image.open(f).resize((320,180)),((i%cols)*320,(i//cols)*180))
    sh.save(f'/tmp/tc/fl_${V}_{s//per}.jpg',quality=76)
print(len(fs))
PY
