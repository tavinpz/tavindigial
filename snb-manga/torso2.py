# Torso em traço de mangá (hachura), desenhado em código. Meio corpo direito, espelhado.
import subprocess, sys
OSSO, TINTA, VERM = '#F4EFE6', '#0B0B0C', '#E3311D'
SIL = ("M 0,30 L 58,30 L 66,104 C 96,128 140,140 190,160 C 250,152 306,196 312,262 C 320,322 314,384 304,444 "
       "C 300,504 292,570 280,650 L 208,650 C 210,590 208,530 200,462 C 196,430 196,408 194,392 "
       "C 190,440 176,504 150,566 C 138,624 140,684 148,742 L 150,850 L 0,850 Z")
PEITO = "M 4,186 C 60,170 136,176 196,202 C 214,250 204,310 178,334 C 128,376 52,372 4,334 Z"
def cel(x0, y0, x1, y1, baixo=0):
    w, h = x1 - x0, y1 - y0
    return (f"M {x0},{y0+6} C {x0+w*.3},{y0-5} {x0+w*.78},{y0-3} {x1-2},{y0+h*.22} C {x1+6},{y0+h*.55} {x1+1},{y1-8} {x1-12},{y1} "
            f"C {x0+w*.6},{y1+7+baixo} {x0+w*.25},{y1+6+baixo} {x0},{y1+2} Z")
def somb(x0, y0, x1, y1):
    x0 = x0 - 14
    w, h = x1 - x0, y1 - y0
    return (f"M {x1-2},{y0+h*.22} C {x1+6},{y0+h*.55} {x1+1},{y1-8} {x1-12},{y1} C {x0+w*.6},{y1+7} {x0+w*.3},{y1+6} {x0+w*.18},{y1+1} "
            f"C {x0+w*.55},{y1-9} {x1-16},{y0+h*.72} {x1-9},{y0+h*.3} Z")
ABS = [(8, 342, 94, 394), (8, 404, 92, 454), (8, 464, 88, 514), (8, 524, 80, 628)]
SOMBRAS = [
 "M 8,334 C 52,372 128,376 178,334 C 192,316 204,288 206,246 C 186,304 128,332 66,328 C 40,326 18,316 8,298 Z",
 "M 312,262 C 310,304 286,330 250,330 C 280,306 294,272 286,214 C 302,232 310,248 312,262 Z",
 "M 304,444 C 300,504 292,570 280,650 L 250,650 C 266,566 274,484 276,404 C 290,414 300,428 304,444 Z",
 "M 236,326 C 226,388 226,440 234,490 C 214,446 208,404 208,384 C 212,356 222,338 236,326 Z",
 "M 194,392 C 190,440 176,504 150,566 C 138,624 140,684 148,742 L 120,742 C 114,682 118,612 130,562 C 150,502 168,446 176,398 Z",
 "M 58,30 L 66,104 C 74,114 86,122 100,128 C 74,106 54,76 48,30 Z",
 "M 102,346 C 118,420 112,520 88,624 C 104,560 110,470 102,402 Z",
 "M 190,160 C 176,214 194,284 236,326 C 222,302 206,262 204,220 C 202,196 196,174 190,160 Z",
 "M 66,104 C 96,128 140,140 190,160 C 146,152 104,142 78,124 Z",
 "M 208,650 C 210,590 208,530 200,462 C 210,510 224,584 228,650 Z",
 "M 0,150 C 10,160 22,162 30,150 C 24,172 10,176 0,170 Z",
] + [somb(*c) for c in ABS]
ESCURO = [
 "M 18,336 C 60,366 128,368 176,334 C 156,346 112,352 66,346 Z",
 "M 312,262 C 310,296 294,322 268,330 C 286,312 298,290 298,256 Z",
 "M 194,392 C 191,430 182,482 168,524 C 174,480 178,440 182,404 Z",
 "M 250,650 C 266,566 274,484 276,404 C 282,474 274,566 266,650 Z",
 "M 120,742 C 114,682 118,612 130,562 C 128,622 128,690 134,742 Z",
 "M 66,104 C 74,114 86,122 100,128 C 84,118 72,104 66,90 Z",
]
SERR = [(0, 0), (-7, 31), (-15, 61), (-24, 90)]
def serr(dx, dy):
    dx += 8
    return f"M {172+dx},{332+dy} C {152+dx},{336+dy} {130+dx},{344+dy} {113+dx},{359+dy} C {128+dx},{362+dy} {152+dx},{357+dy} {174+dx},{350+dy} Z"
LINHAS_G = [
 "M 14,166 C 62,146 126,152 184,168",
 "M 196,202 C 214,250 204,310 178,334", "M 178,334 C 128,376 52,372 8,334",
 "M 190,160 C 176,214 194,284 236,326 C 266,340 296,326 310,306",
 "M 236,326 C 226,388 226,440 234,490", "M 280,336 C 290,406 288,478 276,552",
 "M 102,346 C 118,420 112,520 88,624", "M 150,446 C 142,506 126,566 110,644", "M 110,644 C 92,704 62,754 32,792",
 "M 34,44 C 40,100 26,144 8,164",
]
LINHAS_F = ["M 226,172 C 238,216 240,264 230,306", "M 262,182 C 278,226 278,272 266,314", "M 252,366 C 260,416 258,458 252,496",
            "M 28,188 C 82,188 142,198 190,216", "M 20,216 C 70,224 130,238 186,264", "M 16,254 C 66,266 124,282 178,302", "M 78,40 C 80,72 78,96 74,112",
            "M 292,470 C 290,520 284,580 278,630", "M 164,470 C 158,520 148,560 140,600"]
DEST = sys.argv[2] if len(sys.argv) > 2 else ''
def meio(esp):
    t = 'transform="scale(-1,1)"' if esp else ''
    h1 = 'hE' if esp else 'hD'
    o = [f'<g {t}>', f'<path d="{SIL}" fill="{OSSO}"/>', f'<g clip-path="url(#clip)">']
    o += [f'<path d="{d}" fill="url(#{h1})"/>' for d in SOMBRAS]
    o += [f'<path d="{d}" fill="url(#hX)"/>' for d in ESCURO]
    o.append('</g>')
    if DEST == 'peito': o.append(f'<path d="{PEITO}" fill="{VERM}" opacity=".62" style="mix-blend-mode:multiply"/>')
    for c in ABS: o.append(f'<path d="{cel(*c)}" fill="none" stroke="{TINTA}" stroke-width="4" stroke-linejoin="round"/>')
    for s in SERR: o.append(f'<path d="{serr(*s)}" fill="{OSSO}" stroke="{TINTA}" stroke-width="3.4" stroke-linejoin="round"/>'); 
    for s in [(q[0] + 8, q[1]) for q in SERR]: o.append(f'<path d="M {172+s[0]},{350+s[1]} C {152+s[0]},{357+s[1]} {128+s[0]},{362+s[1]} {113+s[0]},{359+s[1]} C {130+s[0]},{352+s[1]} {152+s[0]},{346+s[1]} {172+s[0]},{343+s[1]} Z" fill="url(#{h1})"/>')
    o += [f'<path d="{d}" fill="none" stroke="{TINTA}" stroke-width="4.4" stroke-linecap="round"/>' for d in LINHAS_G]
    o += [f'<path d="{d}" fill="none" stroke="{TINTA}" stroke-width="2" stroke-linecap="round" opacity=".75"/>' for d in LINHAS_F]
    o.append(f'<path d="{SIL.replace("M 0,30 L 58,30", "M 58,30").replace(" L 0,850 Z", "")}" fill="none" stroke="{TINTA}" stroke-width="8.5" stroke-linejoin="round" stroke-linecap="round"/>')
    o.append('</g>'); return '\n'.join(o)
OUT = sys.argv[3] if len(sys.argv) > 3 else 't2'
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
<path d="M 0,180 L 0,334 M 0,344 L 0,640" stroke="{TINTA}" stroke-width="4.4" stroke-linecap="round"/>
<path d="M -5,566 q 5,8 10,0" fill="none" stroke="{TINTA}" stroke-width="3"/>
<path d="M -150,722 C -80,744 80,744 150,722 L 156,850 L -156,850 Z" fill="{VERM}" stroke="{TINTA}" stroke-width="7" stroke-linejoin="round"/>
<path d="M -151,746 C -80,768 80,768 151,746" fill="none" stroke="{TINTA}" stroke-width="4"/>
</g></svg>'''
open(OUT + '.svg', 'w').write(svg)
subprocess.run(['rsvg-convert', '-w', '1080', OUT + '.svg', '-o', OUT + '.png'], check=True); print('ok')
