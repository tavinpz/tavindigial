import sys, json, glob, os
from PIL import Image, ImageDraw, ImageFont
feat=sys.argv[1]; H=int(sys.argv[2]) if len(sys.argv)>2 else 3600; Y0=int(sys.argv[3]) if len(sys.argv)>3 else 0; SO=sys.argv[4].split(',') if len(sys.argv)>4 else None
fs=[f for f in sorted(glob.glob(f'/home/claude/thata-motion/public/telas2/{feat}/*.jpg')) if not SO or os.path.basename(f)[:-4] in SO]
F=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',60)
ims=[]
for f in fs:
    i=Image.open(f).crop((0,Y0,1170,Y0+H)); d=ImageDraw.Draw(i)
    for y in range(0,H,300):
        d.line((0,y,60,y),fill='red',width=8); d.text((70,y-30),str(y+Y0),fill='red',font=F)
    for x in range(0,1170,300): d.line((x,0,x,40),fill='blue',width=8)
    d.text((300,H-90),os.path.basename(f)[:-4],fill='blue',font=F)
    i.thumbnail((300,int(300*H/1170))); ims.append(i)
W=Image.new('RGB',(302*len(ims),ims[0].size[1]),'white')
for k,i in enumerate(ims): W.paste(i,(302*k,0))
W.save(f'/tmp/shot/ref_{feat}.jpg',quality=72)
print(len(ims), W.size)
