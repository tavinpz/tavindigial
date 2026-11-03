import skia, storm
from storm import C, fill, text, font, MOLTEN, CHALK, VOID, GRAPH
W,H=1600,1000
s=skia.Surface(W,H); c=s.getCanvas(); c.clear(C("#0A0A0C"))
def hat(c,x,y,k):
    c.save(); c.translate(x,y); c.scale(k,k)
    p=skia.Path(); p.addArc(skia.Rect.MakeXYWH(-31,-34,62,56),180,180); p.close()
    c.drawPath(p,fill(MOLTEN))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-40,-8,80,9),4.5,4.5),fill(MOLTEN)); c.restore()
cells=[(0,0),(800,0),(0,500),(800,500)]
for (x,y) in cells:
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x+20,y+20,760,460),18,18),fill("#111114"))
# 1 hard hat
hat(c,400,230,2.6); text(c,"LOADBEARING",400,360,font("black",40),CHALK,255,"c",11)
text(c,"1 · CAPACETE",60,460,font("mono",20),GRAPH,255)
# 2 mascot head
c.drawCircle(1200,250,74,fill(CHALK)); hat(c,1200,236,2.35)
for dx in (-16,16): c.drawOval(skia.Rect.MakeXYWH(1200+18+dx-6,262-11,12,22),fill(VOID))
text(c,"LOADBEARING",1200,400,font("black",40),CHALK,255,"c",11)
text(c,"2 · CABEÇA DO PERSONAGEM",860,460,font("mono",20),GRAPH,255)
# 3 wordmark only, orange underline under BEARING
w=text(c,"LOAD",90,755,font("black",78),CHALK,255,"l",3)
w2=text(c,"BEARING",90+w+6,755,font("black",78),MOLTEN,255,"l",3)
text(c,"3 · SÓ O NOME",60,960,font("mono",20),GRAPH,255)
# 4 three blocks
bw,bh,g=110,48,10
for (bx,by,col) in [(1200-(bw+g)/2,700+bh+g,CHALK),(1200+(bw+g)/2,700+bh+g,CHALK),(1200,700,MOLTEN)]:
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(bx-bw/2,by-bh/2,bw,bh),6,6),fill(col))
text(c,"LOADBEARING",1200,870,font("black",40),CHALK,255,"c",11)
text(c,"4 · TRÊS BLOCOS",860,960,font("mono",20),GRAPH,255)
from PIL import Image
Image.fromarray(s.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[:,:,:3]).save("out/logo-options.png")
