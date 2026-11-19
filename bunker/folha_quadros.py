import json, sys, glob, os
from PIL import Image, ImageDraw
T=json.load(open('/home/claude/estudio/atlas-motion/public/bunker/v01/tempos.json'))['falas']
modo=sys.argv[1]
if modo=='frames':
    q=float(sys.argv[2]); print(','.join(str(round((f['ini']+q*(f['fim']-f['ini']))*30)) for f in T))
else:
    d=sys.argv[2]; cols=int(sys.argv[3]); rows=int(sys.argv[4]); q=float(sys.argv[5])
    arqs=sorted(glob.glob(d+'/f*.jpg')); W,H=Image.open(arqs[0]).size
    for k in range(0,len(arqs),cols*rows):
        fo=Image.new('RGB',(W*cols,(H+20)*rows),'#000'); dr=ImageDraw.Draw(fo)
        for j,a in enumerate(arqs[k:k+cols*rows]):
            x,y=(j%cols)*W,(j//cols)*(H+20); fo.paste(Image.open(a),(x,y+20)); dr.text((x+4,y+4),T[k+j]['id'] if len(arqs)==len(T) else os.path.basename(a),fill='#fff')
        fo.save(f'{d}/folha_{k//(cols*rows):02d}.jpg',quality=80)
    print(len(arqs))
