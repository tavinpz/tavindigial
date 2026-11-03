"""python3 sheets.py <num> beat[+off] ... -> frames/sheet_<num>.png (contact sheet for review)"""
import sys
from PIL import Image
import episodes5
n = int(sys.argv[1]); ep = episodes5.EPISODES[n]()
ims = []
for s in sys.argv[2:]:
    tt = float(s) if s[0].isdigit() else ep.b0(s.split("+")[0], float(s.split("+")[1]) if "+" in s else 0.3)
    ims.append(Image.fromarray(ep.frame(tt)).resize((360, 640)))
sh = Image.new("RGB", (366 * len(ims), 640), (60, 60, 60))
for i, im in enumerate(ims):
    sh.paste(im, (i * 366, 0))
sh.save(f"frames/sheet_{n}.png")
print("ok", n)
