# Torso em traço de mangá (hachura), desenhado em código. Meio corpo direito, espelhado.
import subprocess, sys
OSSO, TINTA, VERM = '#F4EFE6', '#0B0B0C', '#E3311D'
SIL = ("M 0,40 L 50,40 L 56,112 C 82,140 132,150 184,170 C 238,166 288,204 295,266 C 301,322 293,382 285,442 "
       "C 283,502 279,562 270,650 L 204,650 C 205,586 203,522 196,452 C 192,422 190,402 186,382 "
       "C 182,432 172,502 151,562 C 141,622 143,682 151,742 L 153,850 L 0,850 Z")
def cel(x0, y0, x1, y1, baixo=0):
    w, h = x1 - x0, y1 - y0
    return (f"M {x0},{y0+6} C {x0+w*.3},{y0-5} {x0+w*.78},{y0-3} {x1-2},{y0+h*.22} C {x1+6},{y0+h*.55} {x1+1},{y1-8} {x1-12},{y1} "
            f"C {x0+w*.6},{y1+7+baixo} {x0+w*.25},{y1+6+baixo} {x0},{y1+2} Z")
def somb(x0, y0, x1, y1):
    x0 = x0 - 14
    w, h = x1 - x0, y1 - y0
    return (f"M {x1-2},{y0+h*.22} C {x1+6},{y0+h*.55} {x1+1},{y1-8} {x1-12},{y1} C {x0+w*.6},{y1+7} {x0+w*.3},{y1+6} {x0+w*.18},{y1+1} "
            f"C {x0+w*.55},{y1-9} {x1-16},{y0+h*.72} {x1-9},{y0+h*.3} Z")
ABS = [(8, 334, 90, 394), (8, 404, 86, 456), (8, 466, 82, 516), (8, 526, 74, 628)]
SOMBRAS = [
 "M 8,328 C 50,364 124,366 169,328 C 182,312 192,286 194,250 C 176,300 124,326 64,322 C 38,320 18,312 8,296 Z",
 "M 295,266 C 293,302 270,324 238,322 C 264,302 278,272 272,222 C 286,238 293,252 295,266 Z",
 "M 285,442 C 283,502 279,562 270,650 L 244,650 C 257,566 263,482 263,402 C 274,412 281,426 285,442 Z",
 "M 224,320 C 216,382 216,432 224,482 C 207,442 201,402 201,382 C 205,352 213,332 224,320 Z",
 "M 186,382 C 182,432 172,502 151,562 C 141,622 143,682 151,742 L 127,742 C 121,682 123,612 134,562 C 150,502 164,442 170,392 Z",
 "M 50,40 L 56,112 C 62,120 72,128 84,134 C 62,112 46,82 42,40 Z",
 "M 98,344 C 110,422 106,522 86,622 C 100,560 104,470 98,400 Z",
] + [somb(*c) for c in ABS]
ESCURO = [
 "M 20,330 C 60,356 124,356 168,326 C 150,336 110,342 66,338 Z",
 "M 244,650 C 257,566 263,482 263,402 C 268,470 262,560 256,650 Z",
 "M 127,742 C 121,682 123,612 134,562 C 132,620 132,690 138,742 Z",
 "M 295,266 C 293,296 278,316 256,322 C 272,306 282,286 282,256 Z",
 "M 186,382 C 183,420 176,470 164,512 C 168,470 172,430 174,396 Z",
]
SERR = [(0, 0), (-7, 31), (-15, 61), (-24, 90)]
def serr(dx, dy): return f"M {172+dx},{332+dy} C {152+dx},{336+dy} {130+dx},{344+dy} {113+dx},{359+dy} C {128+dx},{362+dy} {152+dx},{357+dy} {174+dx},{350+dy} Z"
LINHAS_G = [  # separações de músculo, traço médio
 "M 14,168 C 60,150 120,160 178,176",
 "M 186,206 C 203,254 193,306 169,328", "M 169,328 C 124,366 50,364 8,328",
 "M 184,172 C 171,222 187,282 224,320 C 252,332 278,320 293,302",
 "M 224,320 C 216,382 216,432 224,482", "M 263,332 C 272,402 270,472 259,544",
 "M 98,342 C 110,422 106,522 86,622", "M 151,442 C 141,502 125,562 109,642", "M 109,642 C 91,702 61,752 31,790",
 "M 30,60 C 35,110 23,150 8,170",
]
SOMBRAS += ["M 184,172 C 171,222 187,282 224,320 C 214,300 200,262 198,222 C 196,200 190,184 184,172 Z", "M 56,112 C 82,140 132,150 184,170 C 140,160 96,150 70,132 Z", "M 204,650 C 205,586 203,522 196,452 C 204,500 216,580 220,650 Z"]
LINHAS_F = ["M 216,184 C 226,224 228,268 220,304", "M 250,196 C 262,236 262,276 252,310", "M 238,360 C 246,410 244,452 238,490",
            "M 60,196 C 96,206 140,216 176,236", "M 40,236 C 80,250 130,262 172,280", "M 70,60 C 72,90 70,112 66,126"]
def meio(esp):
    t = 'transform="scale(-1,1)"' if esp else ''
    h1 = 'hE' if esp else 'hD'
    o = [f'<g {t}>', f'<path d="{SIL}" fill="{OSSO}"/>', f'<g clip-path="url(#clip)">']
    o += [f'<path d="{d}" fill="url(#{h1})"/>' for d in SOMBRAS]
    o += [f'<path d="{d}" fill="url(#hX)"/>' for d in ESCURO]
    o.append('</g>')
    for c in ABS: o.append(f'<path d="{cel(*c)}" fill="none" stroke="{TINTA}" stroke-width="4" stroke-linejoin="round"/>')
    for s in SERR: o.append(f'<path d="{serr(*s)}" fill="{OSSO}" stroke="{TINTA}" stroke-width="3.4" stroke-linejoin="round"/>'); 
    for s in SERR: o.append(f'<path d="M {172+s[0]},{350+s[1]} C {152+s[0]},{357+s[1]} {128+s[0]},{362+s[1]} {113+s[0]},{359+s[1]} C {130+s[0]},{352+s[1]} {152+s[0]},{346+s[1]} {172+s[0]},{343+s[1]} Z" fill="url(#{h1})"/>')
    o += [f'<path d="{d}" fill="none" stroke="{TINTA}" stroke-width="4.4" stroke-linecap="round"/>' for d in LINHAS_G]
    o += [f'<path d="{d}" fill="none" stroke="{TINTA}" stroke-width="2" stroke-linecap="round" opacity=".75"/>' for d in LINHAS_F]
    o.append(f'<path d="{SIL.replace("M 0,40 L 50,40", "M 50,40").replace(" L 0,850 Z", "")}" fill="none" stroke="{TINTA}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>')
    o.append('</g>'); return '\n'.join(o)
fundo = sys.argv[1] if len(sys.argv) > 1 else '#0B0B0C'
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
<defs>
<pattern id="hD" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)"><line x1="0" y1="0" x2="0" y2="7" stroke="{TINTA}" stroke-width="2.3"/></pattern>
<pattern id="hE" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)"><line x1="0" y1="0" x2="0" y2="7" stroke="{TINTA}" stroke-width="2.3"/></pattern>
<pattern id="hX" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="8" stroke="{TINTA}" stroke-width="2.2"/></pattern>
<clipPath id="clip"><path d="{SIL}"/></clipPath>
</defs>
<rect width="1080" height="1350" fill="{fundo}"/>
<g transform="translate(540,130) scale(1.32)">
{meio(False)}
{meio(True)}
<path d="M 0,178 L 0,322 M 0,334 L 0,640" stroke="{TINTA}" stroke-width="4.4" stroke-linecap="round"/>
<path d="M -5,566 q 5,8 10,0" fill="none" stroke="{TINTA}" stroke-width="3"/>
<path d="M -153,720 C -80,742 80,742 153,720 L 158,850 L -158,850 Z" fill="{VERM}" stroke="{TINTA}" stroke-width="7" stroke-linejoin="round"/>
<path d="M -153,744 C -80,766 80,766 153,744" fill="none" stroke="{TINTA}" stroke-width="4"/>
</g></svg>'''
open('torso.svg', 'w').write(svg)
subprocess.run(['rsvg-convert', '-w', '1080', 'torso.svg', '-o', 'torso.png'], check=True); print('ok')
