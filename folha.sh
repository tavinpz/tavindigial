#!/bin/bash
# uso: ./folha.sh COMP f1 f2 ... → $FOLHA_DIR/COMP_folha.jpg (padrão /tmp/thata-folhas)
S=${FOLHA_DIR:-/tmp/thata-folhas}; mkdir -p $S; C=$1; shift
rm -f $S/${C}_0*.png; node quadros.mjs $C $S "$@" >/dev/null 2>&1 || { echo erro; exit 1; }
python3 -c "
from PIL import Image;import glob
fs=sorted(glob.glob('$S/${C}_0*.png'));im=[Image.open(f) for f in fs];w,h=im[0].size;n=len(im);c=min(5,n);r=(n+c-1)//c
s=Image.new('RGB',(w*c,h*r),'white')
for i,x in enumerate(im): s.paste(x,((i%c)*w,(i//c)*h))
s.save('$S/${C}_folha.jpg',quality=82)"; echo ok
