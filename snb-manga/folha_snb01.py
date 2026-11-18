# Folha de poses do Strong Not Big #01 (Why Farmers Are Stronger Than Gym Guys). Imagem parada para aprovação.
# Uso: python3 folha_snb01.py  -> folha_snb01.png ; python3 folha_snb01.py poses <pasta> -> um PNG transparente por pose
import subprocess, sys
from figura import figura, DEFS, OSSO, TINTA, VERM, AMBAR, CINZA

FUNDO = '#0B0B0C'
P = lambda d, w=8, f=OSSO: f'<path d="{d}" fill="{f}" stroke="{TINTA}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>'
H = lambda d, h='hD': f'<path d="{d}" fill="url(#{h})"/>'
L = lambda d, w=4, op=1: f'<path d="{d}" fill="none" stroke="{TINTA}" stroke-width="{w}" stroke-linecap="round" opacity="{op}"/>'

def saco(cx, cy, w=360, h=300, rot=0, txt='100 LB'):
    """Saco de ração: corpo gordo com as duas orelhas amarradas em cima."""
    x0, x1, y0, y1 = -w / 2, w / 2, -h / 2, h / 2
    corpo = (f"M {x0+26},{y0+18} C {x0+w*.3},{y0+2} {x1-w*.3},{y0+2} {x1-26},{y0+18} C {x1+16},{y0+h*.3} {x1+18},{y1-h*.3} {x1-18},{y1-8} "
             f"C {x1-w*.3},{y1+10} {x0+w*.3},{y1+10} {x0+18},{y1-8} C {x0-18},{y1-h*.3} {x0-16},{y0+h*.3} {x0+26},{y0+18} Z")
    sombra = (f"M {x1-26},{y0+18} C {x1+16},{y0+h*.3} {x1+18},{y1-h*.3} {x1-18},{y1-8} C {x1-w*.3},{y1+10} {x0+w*.3},{y1+10} {x0+18},{y1-8} "
              f"C {x0+w*.35},{y1-30} {x1-w*.3},{y1-34} {x1-58},{y1-70} C {x1-36},{y1-h*.4} {x1-40},{y0+h*.3} {x1-26},{y0+18} Z")
    o = [f'<g transform="translate({cx},{cy}) rotate({rot})">',
         P(f"M {x0+30},{y0+22} L {x0-8},{y0-26} L {x0+70},{y0+8} Z"), P(f"M {x1-30},{y0+22} L {x1+8},{y0-26} L {x1-70},{y0+8} Z"),
         P(corpo), H(sombra),
         L(f"M {x0+40},{y0+34} C {x0+w*.3},{y0+22} {x1-w*.3},{y0+22} {x1-40},{y0+34}", 3, .8),
         L(f"M {x0+34},{y0+h*.36} C {x0+w*.3},{y0+h*.42} {x1-w*.3},{y0+h*.42} {x1-34},{y0+h*.36}", 2, .5),
         f'<text x="0" y="{h*.16:.0f}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="{h*.24:.0f}" fill="{TINTA}">{txt}</text>',
         '</g>']
    return '\n'.join(o)

def kettlebell(cx, cy, r=92):
    """Peso com alça; (cx, cy) é o topo da alça, onde a mão fecha."""
    return '\n'.join([
        f'<path d="M {cx-52},{cy+r*.9} C {cx-70},{cy+10} {cx-40},{cy-6} {cx},{cy-6} C {cx+40},{cy-6} {cx+70},{cy+10} {cx+52},{cy+r*.9}" fill="none" stroke="{TINTA}" stroke-width="40" stroke-linecap="round"/>',
        f'<path d="M {cx-52},{cy+r*.9} C {cx-70},{cy+10} {cx-40},{cy-6} {cx},{cy-6} C {cx+40},{cy-6} {cx+70},{cy+10} {cx+52},{cy+r*.9}" fill="none" stroke="{OSSO}" stroke-width="24" stroke-linecap="round"/>',
        f'<circle cx="{cx}" cy="{cy+r*1.75}" r="{r}" fill="{OSSO}" stroke="{TINTA}" stroke-width="8"/>',
        H(f"M {cx+r*.2},{cy+r*.78} A {r} {r} 0 0 1 {cx-r*.55},{cy+r*2.58} A {r*1.25} {r*1.25} 0 0 0 {cx+r*.2},{cy+r*.78} Z"),
        f'<path d="M {cx-r*.62},{cy+r*1.5} A {r*.7} {r*.7} 0 0 1 {cx-r*.1},{cy+r*1.02}" fill="none" stroke="{TINTA}" stroke-width="3" opacity=".6"/>'])

def punho(lado):
    """Mão fechada por cima da alça do peso (lado = 1 direita da tela, -1 esquerda)."""
    return (f'<g transform="scale({lado},1)">' + P("M 222,850 L 302,850 C 314,880 314,930 300,956 C 284,972 240,972 224,956 C 212,930 212,880 222,850 Z", 7)
            + L("M 222,896 C 250,902 276,902 304,896", 3) + L("M 240,900 L 240,962", 2.5, .8) + L("M 262,902 L 262,966", 2.5, .8) + L("M 284,900 L 284,962", 2.5, .8) + '</g>')

def antebracos_abraco():
    """Antebraços por cima da carga, mãos travadas no meio (desenha um lado e espelha)."""
    o = []
    for e in (False, True):
        t = 'transform="scale(-1,1)"' if e else ''
        tubo = "M 292,618 C 304,662 282,696 238,694 C 170,688 96,662 40,628 C 22,612 22,576 44,566 C 104,574 176,588 236,598 C 260,598 280,604 292,618 Z"
        o.append(f'<g {t}>' + P(tubo) + H("M 238,694 C 170,688 96,662 40,628 C 100,650 176,668 244,668 C 272,664 288,646 292,618 C 304,662 282,696 238,694 Z")
                 + L("M 226,610 C 170,606 110,596 60,584", 2, .7) + L("M 244,636 C 190,636 130,626 76,608", 2, .7)
                 + P("M 48,632 C 14,640 -14,620 -12,590 C -10,566 16,554 46,562 C 58,580 58,612 48,632 Z", 7)
                 + L("M 10,572 L 6,626", 3) + L("M 28,566 L 26,632", 3) + '</g>')
    return '\n'.join(o)

def mao_close(destaque=True):
    """Close: antebraço entrando pela esquerda, mão fechada na alça de um balde pesado. Caixa ~ -60..1000 x -140..900."""
    ante = "M -60,120 C 60,84 200,92 330,150 C 420,190 520,214 620,226 L 628,392 C 540,404 440,420 330,452 C 200,486 60,496 -60,480 Z"
    o = [P(ante)]
    if destaque: o.append(f'<path d="{ante}" fill="{AMBAR}" opacity=".8" style="mix-blend-mode:multiply"/>')
    o += [H("M -60,480 C 60,496 200,486 330,452 C 440,420 540,404 628,392 L 626,330 C 540,346 450,356 340,382 C 210,414 70,424 -60,404 Z"),
          H("M 330,452 C 440,420 540,404 628,392 L 627,362 C 540,376 440,396 340,424 C 300,436 270,446 240,452 Z", 'hX'),
          H("M -60,120 C 60,84 200,92 330,150 C 250,134 150,132 60,150 C 10,160 -30,176 -60,190 Z"),
          L("M -60,236 C 80,196 230,206 360,252 C 450,278 540,288 622,290", 5), L("M -60,330 C 90,316 250,330 380,330 C 470,328 560,322 624,318", 3.4, .9),
          L("M 30,160 C 150,138 270,164 380,206", 2, .7), L("M 0,270 C 130,250 260,268 380,290", 2, .7), L("M 60,380 C 180,384 300,372 420,352", 2, .7),
          L("M 470,236 C 520,250 570,254 618,254", 2, .7), L("M 620,226 C 606,280 608,340 628,392", 5)]
    # balde pendurado na alça
    o += [f'<path d="M 744,476 C 700,560 640,630 548,690 M 744,476 C 790,560 850,630 942,690" fill="none" stroke="{OSSO}" stroke-width="9" stroke-linecap="round"/>',
          P("M 520,690 L 970,690 L 920,900 L 570,900 Z"), H("M 800,690 L 970,690 L 920,900 L 830,900 Z"), H("M 880,690 L 970,690 L 920,900 L 890,900 Z", 'hX'),
          f'<ellipse cx="745" cy="690" rx="225" ry="34" fill="{OSSO}" stroke="{TINTA}" stroke-width="8"/>', H("M 540,690 A 205 24 0 0 1 950,690 A 205 30 0 0 0 540,690 Z"),
          L("M 536,760 L 954,760", 3, .7)]
    o += [f'<rect x="716" y="150" width="56" height="330" rx="26" fill="{OSSO}" stroke="{TINTA}" stroke-width="8"/>', H("M 750,160 L 772,176 L 772,456 L 750,470 Z")]
    # dorso da mão, tendões, dedos fechados sobre a alça e polegar
    o += [P("M 620,226 C 680,196 760,188 820,206 C 846,214 856,236 852,262 L 846,410 C 842,440 814,452 780,448 C 720,442 668,420 628,392 Z"),
          H("M 628,392 C 668,420 720,442 780,448 C 814,452 842,440 846,410 L 848,372 C 800,392 720,388 640,356 Z"),
          L("M 636,262 C 680,256 730,256 770,262", 2, .7), L("M 636,306 C 680,304 730,308 768,318", 2, .7), L("M 640,346 C 684,350 730,358 766,370", 2, .7)]
    for y in (206, 264, 322, 378):
        o += [P(f"M 756,{y} C 800,{y-14} 856,{y-8} 872,{y+14} C 882,{y+32} 870,{y+50} 848,{y+54} C 812,{y+58} 778,{y+56} 756,{y+50} Z", 6),
              L(f"M 808,{y+2} C 816,{y+18} 816,{y+36} 808,{y+52}", 2.5, .8), H(f"M 848,{y+54} C 870,{y+50} 882,{y+32} 872,{y+14} C 868,{y+34} 858,{y+46} 836,{y+52} Z")]
    o += [P("M 636,214 C 690,196 748,204 786,232 C 802,250 794,274 770,276 C 724,274 678,262 640,252 Z", 6), L("M 660,226 C 700,222 740,232 768,252", 2.5, .7)]
    return '\n'.join(o)

def halter_barra(y, larg=560):
    o = [f'<rect x="{-larg}" y="{y-9}" width="{2*larg}" height="18" rx="9" fill="{OSSO}" stroke="{TINTA}" stroke-width="5"/>']
    for s in (-1, 1):
        for k, (dx, hh) in enumerate(((larg - 150, 190), (larg - 100, 190), (larg - 52, 150))):
            x = s * dx
            o.append(f'<rect x="{x-20}" y="{y-hh/2}" width="40" height="{hh}" rx="12" fill="{OSSO}" stroke="{TINTA}" stroke-width="7"/>')
            o.append(H(f"M {x+2},{y-hh/2+8} L {x+18},{y-hh/2+12} L {x+18},{y+hh/2-12} L {x+2},{y+hh/2-8} Z"))
    return '\n'.join(o)

# ---- poses: cada uma devolve SVG com origem no meio dos ombros (como figura()) -------------------------------------------------
def pose(nome):
    if nome == 'fazendeiro':      return figura('frente', roupa='macacao', chap=True)
    if nome == 'academia':        return figura('frente', larg=1.24, cor=CINZA, reto=True)
    if nome == 'fazendeiro_saco': return figura('abraco', roupa='macacao', chap=True) + saco(0, 470, 420, 330) + antebracos_abraco()
    if nome == 'academia_saco':   return f'<g transform="scale(1.24,1)">' + '</g>' + figura('abraco', larg=1.24, cor=CINZA, reto=True) + saco(0, 470, 420, 330) + f'<g transform="scale(1.24,1)">{antebracos_abraco()}</g>'
    if nome == 'academia_largou': return figura('frente', larg=1.24, cor=CINZA, reto=True) + saco(0, 1440, 440, 300, rot=-7)
    if nome == 'academia_barra':  return halter_barra(-452) + figura('pendurado', larg=1.24, cor=CINZA, reto=True, pe='chao')
    if nome == 'farmer_carry':    return figura('frente', True) + kettlebell(-262, 912, 84) + kettlebell(262, 912, 84) + punho(1) + punho(-1)
    if nome == 'suitcase_carry':  return figura('frente') + kettlebell(262, 912, 96) + punho(1)
    if nome == 'bear_hug':        return figura('abraco') + saco(0, 470, 400, 330, txt='') + antebracos_abraco()
    raise SystemExit(nome)

FOLHA = [('fazendeiro', 'THE FARMER'), ('academia', 'THE GYM GUY'), ('fazendeiro_saco', 'FARMER + SACK'), ('academia_saco', 'GYM GUY + SACK'),
         ('academia_largou', 'PUTS IT DOWN'), ('academia_barra', 'GYM GUY WINS THE BARBELL'), ('farmer_carry', "1 · FARMER'S CARRY"),
         ('suitcase_carry', '2 · SUITCASE CARRY'), ('bear_hug', '3 · BEAR HUG CARRY')]

def svg_pose(nome, w=1100, h=2100, e=1.0):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{DEFS}'
            f'<g transform="translate({w/2},{560 if nome != "academia_barra" else 640}) scale({e})">{pose(nome)}</g></svg>')

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'poses':
        d = sys.argv[2]
        for n, _ in FOLHA:
            open(f'{d}/{n}.svg', 'w').write(svg_pose(n)); subprocess.run(['rsvg-convert', '-h', '1400', f'{d}/{n}.svg', '-o', f'{d}/{n}.png'], check=True)
        open(f'{d}/mao_close.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -140 1000 900" width="1000" height="900">{DEFS}{mao_close()}</svg>')
        subprocess.run(['rsvg-convert', '-w', '1400', f'{d}/mao_close.svg', '-o', f'{d}/mao_close.png'], check=True); print('poses ok'); sys.exit()
    W, Hh, cw, ch, e = 3000, 2560, 600, 1160, 0.5
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hh}" width="{W}" height="{Hh}">{DEFS}<rect width="{W}" height="{Hh}" fill="{FUNDO}"/>']
    for i, (n, rot) in enumerate(FOLHA):
        col, lin = i % 5, i // 5
        x, y = cw / 2 + col * cw, 250 + lin * (ch + 100)
        if n == 'academia_barra': y += 90
        o.append(f'<g transform="translate({x},{y}) scale({e})">{pose(n)}</g>')
        o.append(f'<text x="{x}" y="{lin*(ch+100)+ch+40}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="34" fill="{OSSO}">{rot}</text>')
    o.append(f'<g transform="translate(2440,1560) scale(0.54)">{mao_close()}</g>')
    o.append(f'<text x="2700" y="{ch+100+ch+40}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="34" fill="{OSSO}">CLOSE · HAND AND FOREARM</text>')
    o.append('</svg>')
    open('folha_snb01.svg', 'w').write('\n'.join(o)); subprocess.run(['rsvg-convert', '-w', '3000', 'folha_snb01.svg', '-o', 'folha_snb01.png'], check=True); print('ok')
