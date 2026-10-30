import sys, glob
from PIL import Image
Q, comp = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(f'{Q}/{comp}_*.png')); ims = [Image.open(f).resize((270, 480)) for f in fs]
cols = 5; rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 275, rows * 485), 'white')
for k, i in enumerate(ims): sheet.paste(i, ((k % cols) * 275, (k // cols) * 485))
sheet.save(f'{Q}/folha_{comp}.png')
