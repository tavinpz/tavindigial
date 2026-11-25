# Personagem do Strong Not Big, corpo inteiro, traço de mangá com hachura (variação B). Meio corpo espelhado.
import subprocess, sys
OSSO, TINTA, VERM, AMBAR = '#F4EFE6', '#0B0B0C', '#E3311D', '#FFB020'
def cel(x0, y0, x1, y1):
    w, h = x1 - x0, y1 - y0
    return (f"M {x0},{y0+6} C {x0+w*.3},{y0-5} {x0+w*.78},{y0-3} {x1-2},{y0+h*.22} C {x1+6},{y0+h*.55} {x1+1},{y1-8} {x1-12},{y1} "
            f"C {x0+w*.6},{y1+7} {x0+w*.25},{y1+6} {x0},{y1+2} Z")
def somb(x0, y0, x1, y1):
    x0 -= 14; w, h = x1 - x0, y1 - y0
    return (f"M {x1-2},{y0+h*.22} C {x1+6},{y0+h*.55} {x1+1},{y1-8} {x1-12},{y1} C {x0+w*.6},{y1+7} {x0+w*.3},{y1+6} {x0+w*.18},{y1+1} "
            f"C {x0+w*.55},{y1-9} {x1-16},{y0+h*.72} {x1-9},{y0+h*.3} Z")
ABS = [(8, 342, 94, 394), (8, 404, 92, 454), (8, 464, 88, 514), (8, 524, 80, 628)]
def serr(dx, dy, sombra=False):
    dx += 8
    if sombra: return f"M {172+dx},{350+dy} C {152+dx},{357+dy} {128+dx},{362+dy} {113+dx},{359+dy} C {130+dx},{352+dy} {152+dx},{346+dy} {172+dx},{343+dy} Z"
    return f"M {172+dx},{332+dy} C {152+dx},{336+dy} {130+dx},{344+dy} {113+dx},{359+dy} C {128+dx},{362+dy} {152+dx},{357+dy} {174+dx},{350+dy} Z"
SERR = [(0, 0), (-7, 31), (-15, 61), (-24, 90)]
TRONCO_G = ["M 14,166 C 62,146 126,152 184,168", "M 178,334 C 128,376 52,372 8,334", "M 102,346 C 118,420 112,520 88,624",
            "M 150,446 C 142,506 126,566 110,644", "M 110,644 C 92,704 62,734 40,744", "M 34,44 C 40,100 26,144 8,164"]
TRONCO_F = ["M 28,188 C 82,188 142,198 190,216", "M 20,216 C 70,224 130,238 186,264", "M 16,254 C 66,266 124,282 178,302", "M 78,40 C 80,72 78,96 74,112", "M 164,470 C 158,520 148,560 140,600"]
TRONCO_S = ["M 8,334 C 52,372 128,376 178,334 C 192,316 204,288 206,246 C 186,304 128,332 66,328 C 40,326 18,316 8,298 Z",
            "M 58,30 L 66,104 C 74,114 86,122 100,128 C 74,106 54,76 48,30 Z", "M 102,346 C 118,420 112,520 88,624 C 104,560 110,470 102,402 Z",
            "M 0,150 C 10,160 22,162 30,150 C 24,172 10,176 0,170 Z"] + [somb(*c) for c in ABS]
TRONCO_X = ["M 18,336 C 60,366 128,368 176,334 C 156,346 112,352 66,346 Z", "M 66,104 C 74,114 86,122 100,128 C 84,118 72,104 66,90 Z"]
PERNA = "M 24,900 C 30,1000 40,1120 46,1212 C 36,1262 44,1382 62,1500 L 118,1500 C 142,1382 162,1282 150,1212 C 170,1140 180,1040 176,930 Z"
PERNA_G = ["M 96,968 C 106,1050 100,1140 92,1196", "M 62,1150 C 50,1180 62,1206 78,1200", "M 60,1218 C 84,1236 120,1236 142,1218", "M 132,1252 C 144,1312 134,1382 120,1432"]
PERNA_F = ["M 150,980 C 158,1050 152,1130 142,1190", "M 86,1240 L 80,1470", "M 56,990 C 60,1060 62,1110 60,1150"]
PERNA_S = ["M 176,930 C 180,1040 170,1140 150,1212 C 162,1282 142,1382 118,1500 L 96,1500 C 122,1382 138,1290 128,1216 C 150,1140 158,1040 154,940 Z",
           "M 46,1212 C 36,1262 44,1382 62,1500 L 74,1500 C 60,1382 54,1280 62,1220 Z", "M 60,1218 C 84,1236 120,1236 142,1218 C 120,1248 82,1248 60,1218 Z"]
PERNA_X = ["M 176,930 C 180,1040 170,1140 150,1212 C 158,1140 166,1040 164,940 Z", "M 118,1500 C 142,1382 162,1282 150,1212 C 152,1290 136,1390 110,1500 Z"]
SHORT = "M 0,726 C 60,746 112,744 150,722 L 184,800 C 210,860 224,920 226,968 L 36,978 L 0,884 Z"
def parte(pose):
    if pose in ('frente', 'abraco', 'semb'):
        sil = ("M 0,30 L 58,30 L 66,104 C 96,128 140,140 190,160 C 250,152 306,196 312,262 C 320,322 314,384 304,444 C 300,504 296,560 290,620 "
               "C 298,690 282,780 254,852 L 216,852 C 208,790 200,712 206,650 C 208,590 208,530 200,462 C 196,430 196,408 194,392 "
               "C 190,440 176,504 150,566 C 138,624 140,684 148,742 L 150,860 L 0,860 Z")
        mao = "M 214,850 L 256,850 C 268,884 268,926 252,956 C 240,968 224,966 214,952 C 204,924 206,884 214,850 Z"
        G = ["M 196,202 C 214,250 204,310 178,334", "M 190,160 C 176,214 194,284 236,326 C 266,340 296,326 310,306", "M 236,326 C 226,388 226,440 234,490",
             "M 280,336 C 290,406 288,478 276,552", "M 206,650 C 230,668 262,664 290,620", "M 214,852 L 256,852"]
        F = ["M 226,172 C 238,216 240,264 230,306", "M 262,182 C 278,226 278,272 266,314", "M 252,366 C 260,416 258,458 252,496", "M 244,690 C 246,750 242,800 236,840",
             "M 226,900 L 224,950", "M 238,902 L 238,956", "M 250,900 L 250,950"]
        S = ["M 312,262 C 310,304 286,330 250,330 C 280,306 294,272 286,214 C 302,232 310,248 312,262 Z",
             "M 304,444 C 300,504 296,560 290,620 C 298,690 282,780 254,852 L 236,852 C 262,780 272,690 266,620 C 274,560 276,484 276,404 C 290,414 300,428 304,444 Z",
             "M 236,326 C 226,388 226,440 234,490 C 214,446 208,404 208,384 C 212,356 222,338 236,326 Z",
             "M 194,392 C 190,440 176,504 150,566 C 138,624 140,684 148,742 L 120,742 C 114,682 118,612 130,562 C 150,502 168,446 176,398 Z",
             "M 190,160 C 176,214 194,284 236,326 C 222,302 206,262 204,220 C 202,196 196,174 190,160 Z", "M 66,104 C 96,128 140,140 190,160 C 146,152 104,142 78,124 Z",
             "M 206,650 C 208,590 208,530 200,462 C 210,510 222,584 226,650 Z"]
        X = ["M 312,262 C 310,296 294,322 268,330 C 286,312 298,290 298,256 Z", "M 194,392 C 191,430 182,482 168,524 C 174,480 178,440 182,404 Z",
             "M 254,852 C 282,780 298,690 290,620 C 284,700 268,790 244,852 Z", "M 120,742 C 114,682 118,612 130,562 C 128,622 128,690 134,742 Z"]
        ante = "M 206,650 C 230,668 262,664 290,620 C 298,690 282,780 254,852 L 216,852 C 208,790 200,712 206,650 Z"
    if pose == 'abraco':  # braços abraçando uma carga na frente do peito: corta o antebraço pendente (ele é desenhado por cima da carga)
        sil = sil.replace("C 298,690 282,780 254,852 L 216,852 C 208,790 200,712 206,650", "C 294,672 236,690 206,650")
        mao = None; G = G[:5]; F = F[:3]; ante = "M 0,0 Z"
    if pose == 'semb':  # tronco sem braços (os braços são desenhados por fora, ex.: cruz de ferro)
        sil = ("M 0,30 L 58,30 L 66,104 C 96,128 140,140 190,160 C 212,200 208,300 194,392 C 190,440 176,504 150,566 C 138,624 140,684 148,742 L 150,860 L 0,860 Z")
        mao = None; G = G[:1]; F = []; S = [S[3], S[5]]; X = [X[1], X[3]]; ante = "M 0,0 Z"
    if pose in ('frente', 'abraco', 'semb'): return sil, mao, G, F, S, X, ante
    if True:  # pendurado na barra
        sil = ("M 0,30 L 58,30 L 66,104 C 96,126 128,130 148,122 C 162,50 174,-50 186,-150 C 194,-250 204,-340 210,-420 L 262,-420 "
               "C 268,-340 280,-250 276,-150 C 290,-50 296,60 290,150 C 280,224 244,334 204,424 C 180,504 160,560 150,604 C 138,652 140,692 148,742 L 150,860 L 0,860 Z")
        mao = "M 204,-486 C 204,-498 214,-504 236,-504 C 258,-504 268,-498 268,-486 L 268,-424 C 268,-414 258,-410 236,-410 C 214,-410 204,-414 204,-424 Z"
        G = ["M 196,202 C 232,196 264,176 286,150", "M 148,122 C 182,168 244,178 290,150", "M 204,424 C 216,344 238,262 270,196",
             "M 186,-150 C 214,-132 250,-134 276,-150", "M 218,-486 L 218,-430", "M 236,-490 L 236,-428", "M 254,-486 L 254,-430", "M 210,-420 L 262,-420"]
        F = ["M 196,90 C 214,20 222,-60 226,-130", "M 250,96 C 262,30 264,-50 258,-130", "M 226,-180 C 232,-260 236,-340 236,-400", "M 250,-180 C 254,-260 252,-340 250,-400",
             "M 176,146 C 204,170 244,172 276,160"]
        S = ["M 276,-150 C 290,-50 296,60 290,150 C 282,150 272,152 262,154 C 270,60 266,-50 254,-150 Z", "M 262,-420 C 268,-340 280,-250 276,-150 L 256,-150 C 258,-250 250,-340 246,-420 Z",
             "M 290,150 C 280,224 244,334 204,424 C 180,504 160,560 150,604 C 138,652 140,692 148,742 L 120,742 C 114,690 118,640 130,596 C 150,540 172,470 190,410 C 226,330 256,230 266,160 Z",
             "M 148,122 C 182,168 244,178 290,150 C 250,196 190,186 152,146 Z", "M 66,104 C 96,126 128,130 148,122 C 120,134 92,128 76,120 Z",
             "M 148,122 C 162,50 174,-50 186,-150 C 188,-60 180,40 168,116 Z"]
        X = ["M 290,150 C 280,224 244,334 204,424 C 230,340 262,240 276,160 Z", "M 276,-150 C 290,-50 296,60 290,150 C 282,60 280,-50 266,-150 Z", "M 120,742 C 114,690 118,640 130,596 C 128,646 128,700 134,742 Z"]
        ante = "M 210,-420 L 262,-420 C 268,-340 280,-250 276,-150 C 250,-134 214,-132 186,-150 C 194,-250 204,-340 210,-420 Z"
    return sil, mao, G, F, S, X, ante
def meio(pose, esp, destaque, pe, calca=None, bota=None):
    t = 'transform="scale(-1,1)"' if esp else ''
    sil, mao, G, F, S, X, ante = parte(pose); cid = f'c{pose}'
    foot = "M 58,1500 L 122,1500 C 142,1520 162,1540 166,1556 C 150,1568 80,1568 54,1562 C 50,1540 52,1520 58,1500 Z" if pe == 'chao' else "M 58,1500 L 122,1500 C 126,1560 110,1612 90,1622 C 70,1612 54,1560 58,1500 Z"
    o = [f'<g {t}>']
    P = lambda d, w=8.5, f=OSSO: f'<path d="{d}" fill="{f}" stroke="{TINTA}" stroke-width="{w}" stroke-linejoin="round"/>'
    H = lambda d, h='hD': f'<path d="{d}" fill="url(#{h})"/>'
    Lg = lambda d, w=4.4, op=1: f'<path d="{d}" fill="none" stroke="{TINTA}" stroke-width="{w}" stroke-linecap="round" opacity="{op}"/>'
    o.append('<g transform="translate(0,900) scale(1.24,0.93) translate(0,-900)">')
    o += [P(foot, 8.5, bota or OSSO), P(PERNA, 8.5, calca or OSSO)] + [H(d) for d in PERNA_S] + [H(d, 'hX') for d in PERNA_X] + [Lg(d) for d in PERNA_G] + [Lg(d, 2, .75) for d in PERNA_F]
    o.append('</g>')
    o.append(f'<path d="{sil}" fill="{OSSO}"/>')
    o.append(f'<clipPath id="{cid}{int(esp)}"><path d="{sil}"/></clipPath><g clip-path="url(#{cid}{int(esp)})">')
    o += [H(d) for d in TRONCO_S + S] + [H(d, 'hX') for d in TRONCO_X + X]
    if destaque: o.append(f'<path d="{ante}" fill="{AMBAR}" opacity=".78" style="mix-blend-mode:multiply"/>')
    o.append('</g>')
    o += [f'<path d="{cel(*c)}" fill="none" stroke="{TINTA}" stroke-width="4" stroke-linejoin="round"/>' for c in ABS]
    for s in SERR: o += [P(serr(*s), 3.4), H(serr(*s, True))]
    o += [Lg(d) for d in TRONCO_G + G] + [Lg(d, 2, .75) for d in TRONCO_F + F]
    o.append(f'<path d="{sil.replace("M 0,30 L 58,30", "M 58,30").replace(" L 0,860 Z", "")}" fill="none" stroke="{TINTA}" stroke-width="8.5" stroke-linejoin="round" stroke-linecap="round"/>')
    if mao: o.append(P(mao))
    o.append('</g>'); return '\n'.join(o)
def expressao(exp):
    """Camada de expressão desenhada por cima do rosto (mesmas coordenadas de cabeca(), antes da escala)."""
    if not exp: return ''
    O, T = OSSO, TINTA
    tapa = f'<path d="M -24,4 L 24,4 L 24,28 L -24,28 Z" fill="{O}"/>'   # cobre a boca neutra
    lin = lambda d, w=5: f'<path d="{d}" fill="none" stroke="{T}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
    esp = lambda x: x.replace('M ', 'M -').replace(' L ', ' L -').replace(' C ', ' C -').replace(' Q ', ' Q -').replace(', ', ',').replace(' ', ' ')
    def par(d, w=5):
        return lin(d, w) + f'<g transform="scale(-1,1)">{lin(d, w)}</g>'
    olho_br = lambda: ''.join(f'<ellipse cx="{s*33}" cy="-76" rx="16" ry="14" fill="{O}" stroke="{T}" stroke-width="3.5"/><circle cx="{s*31}" cy="-74" r="5" fill="{T}"/>' for s in (-1, 1))
    if exp == 'choque':
        return (olho_br() + par('M 12,-118 C 28,-132 50,-130 64,-114', 6) + tapa
                + f'<ellipse cx="0" cy="17" rx="13" ry="17" fill="{T}"/><ellipse cx="0" cy="25" rx="7" ry="5" fill="#7a2a22"/>')
    if exp == 'deboche':
        return (tapa + lin('M -20,16 Q 0,20 22,4', 4.6) + lin('M 22,4 q 5,-2 6,-7', 3)
                + lin('M -12,-118 C -28,-130 -48,-128 -62,-114', 6) + par('M 14,-70 C 30,-74 48,-72 60,-64', 5))
    if exp == 'esforco':
        dentes = ''.join(f'<path d="M {x},6 L {x},26" stroke="{T}" stroke-width="2.4"/>' for x in (-12, -4, 4, 12))
        return (par('M 8,-56 L 62,-82', 7) + tapa + f'<rect x="-22" y="5" width="44" height="22" rx="5" fill="{O}" stroke="{T}" stroke-width="3.6"/>'
                + f'<path d="M -22,16 L 22,16" stroke="{T}" stroke-width="2.4"/>' + dentes
                + f'<path d="M 82,-122 C 90,-108 94,-98 88,-90 C 82,-84 74,-90 76,-100 C 78,-108 80,-114 82,-122 Z" fill="#cfe9ff" stroke="{T}" stroke-width="2.5"/>')
    if exp == 'dor':
        return (par('M 16,-84 L 46,-74 L 16,-64', 6) + par('M 10,-112 L 60,-100', 6) + tapa
                + f'<path d="M -26,6 Q 0,0 26,6 L 22,28 Q 0,34 -22,28 Z" fill="{T}"/><path d="M -22,8 Q 0,3 22,8 L 21,13 Q 0,9 -21,13 Z" fill="{O}"/>')
    return ''
def cabeca(exp=None):
    meia = "M 0,-150 C 42,-152 68,-124 68,-80 C 69,-50 64,-22 52,2 C 42,20 22,34 0,38 Z"
    cab = "M 0,-166 C 50,-170 82,-134 76,-84 C 74,-70 72,-62 70,-54 C 64,-80 52,-98 34,-102 C 20,-94 8,-100 0,-106 Z"
    olho = "M 0,-106 C 8,-100 20,-94 34,-102 C 52,-98 64,-80 70,-54 L 66,-46 C 42,-60 20,-62 0,-60 Z"
    o = []
    for e in (False, True):
        t = 'transform="scale(-1,1)"' if e else ''
        o.append(f'<g {t}><path d="M 66,-84 C 80,-86 84,-60 76,-42 C 72,-36 68,-36 66,-40 Z" fill="{OSSO}" stroke="{TINTA}" stroke-width="5"/>'
                 f'<path d="{meia}" fill="{OSSO}"/><path d="{olho}" fill="url(#hX)"/><path d="{olho}" fill="url(#hD)"/>'
                 f'<path d="M 52,2 C 42,20 22,34 0,38 L 0,26 C 18,22 34,12 44,-2 Z" fill="url(#hD)"/>'
                 f'<path d="{meia.replace("M 0,-150", "M 4,-150").replace(" Z", "")}" fill="none" stroke="{TINTA}" stroke-width="7" stroke-linecap="round"/>'
                 f'<path d="{cab}" fill="#2A2A2E"/><path d="{cab.replace("M 0,-166", "M 3,-166").replace(" C 20,-94 8,-100 0,-106 Z", " C 20,-94 8,-100 3,-105")}" fill="none" stroke="{OSSO}" stroke-width="3" stroke-linejoin="round"/>'
                 f'<path d="M 10,-150 C 24,-140 30,-124 30,-108 M 34,-152 C 48,-140 56,-122 58,-102 M 54,-146 C 66,-130 70,-110 70,-90" fill="none" stroke="{OSSO}" stroke-width="2" opacity=".5"/>'
                 f'<path d="M 8,-62 C 24,-68 46,-64 60,-52" fill="none" stroke="{TINTA}" stroke-width="6" stroke-linecap="round"/></g>')
    o.append(f'<path d="M 2,-30 L -5,-10 L 4,-8" fill="none" stroke="{TINTA}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
             f'<path d="M -18,12 L 16,12" fill="none" stroke="{TINTA}" stroke-width="4.4" stroke-linecap="round"/><path d="M -8,22 L 8,22" stroke="{TINTA}" stroke-width="2.4" opacity=".7"/>')
    o.append(expressao(exp))
    return '<g transform="translate(0,34) scale(1.42) translate(0,-34)">' + '\n'.join(o) + '</g>'
CINZA, CINZA_E = '#4A4A52', '#2E2E34'
def chapeu():
    return (f'<ellipse cx="0" cy="-196" rx="212" ry="40" fill="{OSSO}" stroke="{TINTA}" stroke-width="8"/>'
            f'<path d="M -212,-196 C -150,-150 150,-150 212,-196 C 150,-166 -150,-166 -212,-196 Z" fill="url(#hD)"/>'
            f'<path d="M -112,-206 C -116,-290 -84,-340 0,-342 C 84,-340 116,-290 112,-206 C 60,-190 -60,-190 -112,-206 Z" fill="{OSSO}" stroke="{TINTA}" stroke-width="8" stroke-linejoin="round"/>'
            f'<path d="M -112,-232 C -60,-214 60,-214 112,-232 L 112,-206 C 60,-190 -60,-190 -112,-206 Z" fill="{VERM}" stroke="{TINTA}" stroke-width="5"/>'
            f'<path d="M 40,-336 C 92,-320 112,-270 110,-236 C 86,-226 70,-224 56,-222 C 70,-262 64,-306 40,-336 Z" fill="url(#hD)"/>'
            f'<path d="M -70,-330 C -40,-300 -30,-262 -34,-226 M -20,-338 C 4,-304 10,-262 6,-222" fill="none" stroke="{TINTA}" stroke-width="2" opacity=".6"/>')
def figura(pose, destaque=False, larg=1.0, roupa='short', cor=None, chap=False, pe=None, reto=False, exp=None):
    """roupa: 'short' (cor = VERM por padrão) ou 'macacao' (calça comprida + peitilho + alças). larg alarga o corpo sem mexer na cabeça."""
    cor = cor or VERM; esc = {VERM: '#9E1F10', CINZA: CINZA_E}.get(cor, '#9E1F10')
    pe = pe or ('solto' if pose == 'pendurado' else 'chao'); mac = roupa == 'macacao'
    calca, bota = (cor, '#2A2A2E') if mac else (None, None)
    SH = SHORT.replace('C 210,860 224,920 226,968', 'C 204,860 218,920 220,968') if reto else SHORT  # barra do short sem abrir (corpo largo)
    o = [f'<g transform="scale({larg},1)">', f'<path d="M -58,30 L 58,30 L 62,60 L -62,60 Z" fill="{OSSO}"/>', meio(pose, False, destaque, pe, calca, bota), meio(pose, True, destaque, pe, calca, bota)]
    o.append(f'<path d="M 0,180 L 0,334 M 0,344 L 0,640" stroke="{TINTA}" stroke-width="4.4" stroke-linecap="round"/><path d="M -5,566 q 5,8 10,0" fill="none" stroke="{TINTA}" stroke-width="3"/>')
    for e in (False, True):
        t = 'transform="scale(-1,1)"' if e else ''
        o.append(f'<g {t}><path d="{SH}" fill="{cor}"/><path d="M 108,762 C 126,830 130,900 124,972" fill="none" stroke="{esc}" stroke-width="5"/>'
                 f'<path d="M 150,722 L 184,800 C 210,860 {"218,920 220,968 L 182,971" if reto else "224,920 226,968 L 186,971"} C 188,900 178,820 136,740 Z" fill="{esc}" opacity=".8"/>'
                 f'<path d="{SH.replace("M 0,726 C", "M 2,726 C").replace(" L 0,884 Z", " L 0,884")}" fill="none" stroke="{TINTA}" stroke-width="8" stroke-linejoin="round"/>'
                 f'<path d="M 0,752 C 60,772 112,770 156,748" fill="none" stroke="{TINTA}" stroke-width="4"/>')
        if mac:  # peitilho e alça do macacão
            o.append(f'<path d="M 0,404 L 96,404 C 104,500 118,620 150,724 C 112,744 60,746 0,728 Z" fill="{cor}" stroke="{TINTA}" stroke-width="7" stroke-linejoin="round"/>'
                     f'<path d="M 96,404 C 104,500 118,620 150,724 L 122,734 C 96,620 84,500 78,404 Z" fill="{esc}" opacity=".8"/>'
                     f'<path d="M 62,410 C 74,320 96,230 128,150 L 164,162 C 132,240 108,330 96,410 Z" fill="{cor}" stroke="{TINTA}" stroke-width="7" stroke-linejoin="round"/>'
                     f'<circle cx="78" cy="428" r="11" fill="{OSSO}" stroke="{TINTA}" stroke-width="4"/>'
                     f'<path d="M 0,520 L 52,520 L 52,590 C 36,604 16,606 0,606" fill="none" stroke="{TINTA}" stroke-width="4"/>')
        o.append('</g>')
    o.append('</g>'); o.append(cabeca(exp))
    if chap: o.append(chapeu())
    return '\n'.join(o)
DEFS = f'''<defs>
<pattern id="hD" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)"><line x1="0" y1="0" x2="0" y2="7" stroke="{TINTA}" stroke-width="2.3"/></pattern>
<pattern id="hX" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="8" stroke="{TINTA}" stroke-width="2.2"/></pattern>
</defs>'''
if __name__ == '__main__':
    e = 0.54
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1280" width="1920" height="1280">{DEFS}<rect width="1920" height="1280" fill="#0B0B0C"/>
<g transform="translate(520,290) scale({e})">{figura('frente')}</g>
<rect x="1010" y="{350 - 472 * e:.0f}" width="740" height="16" rx="8" fill="{OSSO}"/>
<g transform="translate(1380,350) scale({e})">{figura('pendurado', True)}</g>
</svg>'''
    open('figura.svg', 'w').write(svg); subprocess.run(['rsvg-convert', '-w', '1920', 'figura.svg', '-o', 'figura.png'], check=True); print('ok')
