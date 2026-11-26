# Poses novas do Strong Not Big #06 (What If You Got Twice as Strong...): expressões, barra dobrando e closes de rosto.
# Uso: python3 folha_snb06.py            -> folha_snb06.png (folha para conferir)
#      python3 folha_snb06.py poses <pasta> -> PNG transparente por pose (mesma tela das poses do #01)
import subprocess, sys, os, math
from figura import figura, DEFS, OSSO, TINTA, VERM, AMBAR, CINZA
from folha_snb01 import halter_barra, P, H, L

def barra_dobrada(y, larg=560, cur=110):
    """Barra com anilhas, dobrando nas pontas (o meio fica nas mãos)."""
    f = lambda x: y + cur * (abs(x) / larg) ** 2          # curva da barra
    o = [f'<path d="M {-larg},{f(larg)} Q 0,{y - cur} {larg},{f(larg)}" fill="none" stroke="{TINTA}" stroke-width="30" stroke-linecap="round"/>',
         f'<path d="M {-larg},{f(larg)} Q 0,{y - cur} {larg},{f(larg)}" fill="none" stroke="{OSSO}" stroke-width="16" stroke-linecap="round"/>']
    # a curva quadrática acima não passa por f(x); recalculo as anilhas sobre a própria curva Q
    def q(t):
        x0, y0, x1, y1, x2, y2 = -larg, f(larg), 0, y - cur, larg, f(larg)
        return ((1-t)**2*x0 + 2*(1-t)*t*x1 + t*t*x2, (1-t)**2*y0 + 2*(1-t)*t*y1 + t*t*y2,
                math.degrees(math.atan2(2*(1-t)*(y1-y0) + 2*t*(y2-y1), 2*(1-t)*(x1-x0) + 2*t*(x2-x1))))
    for t, hh in ((0.04, 150), (0.085, 190), (0.13, 190), (0.87, 190), (0.915, 190), (0.96, 150)):
        x, yy, a = q(t)
        o.append(f'<g transform="translate({x:.1f},{yy:.1f}) rotate({a:.1f})"><rect x="-20" y="{-hh/2}" width="40" height="{hh}" rx="12" fill="{OSSO}" stroke="{TINTA}" stroke-width="7"/>'
                 + H(f"M 2,{-hh/2+8} L 18,{-hh/2+12} L 18,{hh/2-12} L 2,{hh/2-8} Z") + '</g>')
    for s in (-1, 1):  # linhas de tensão
        o.append(f'<path d="M {s*300},{y-150} l {s*40},-40 M {s*340},{y-110} l {s*50},-20 M {s*260},{y-170} l {s*16},-50" stroke="{VERM}" stroke-width="9" stroke-linecap="round"/>')
    return '\n'.join(o)

def pose(nome):
    if nome.startswith('heroi_') and nome.split('_')[1] in ('choque', 'deboche', 'esforco', 'dor'):
        return figura('frente', exp=nome.split('_')[1])
    if nome == 'heroi_barra_dobra': return barra_dobrada(-452) + figura('pendurado', pe='chao', exp='deboche')
    if nome == 'heroi_barra_dobra_ambar': return barra_dobrada(-452) + figura('pendurado', True, pe='chao', exp='deboche')
    if nome == 'heroi_barra':       return halter_barra(-452) + figura('pendurado', pe='chao', exp='esforco')
    if nome == 'heroi_barra_dor':   return halter_barra(-452) + figura('pendurado', True, pe='chao', exp='dor')
    if nome == 'academia_choque':   return figura('frente', larg=1.24, cor=CINZA, reto=True, exp='choque')
    if nome == 'pai_choque':        return figura('frente', larg=1.12, roupa='macacao', cor=CINZA, exp='choque').replace('#2A2A2E', '#CFC8B8')
    if nome.startswith('rosto_academia_'): return figura('frente', larg=1.24, cor=CINZA, reto=True, exp=nome.split('_')[2])
    if nome.startswith('rosto_'):   return figura('frente', exp=nome.split('_')[1])
    raise SystemExit(nome)

CORPO = ['heroi_barra_dobra_ambar', 'heroi_choque', 'heroi_deboche', 'heroi_esforco', 'heroi_dor', 'heroi_barra_dobra', 'heroi_barra', 'heroi_barra_dor', 'academia_choque', 'pai_choque']
ROSTO = ['rosto_choque', 'rosto_deboche', 'rosto_esforco', 'rosto_dor', 'rosto_academia_choque']

def svg_pose(nome):
    if nome.startswith('rosto_'):   # close: cabeça e ombros, tela 600 x 620 em volta da cabeça
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-210 -295 420 400" width="420" height="400">{DEFS}{pose(nome)}</svg>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1300 2260" width="1300" height="2260">{DEFS}<g transform="translate(650,650)">{pose(nome)}</g></svg>'

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'poses':
        d = sys.argv[2]
        for n in CORPO + ROSTO:
            open(f'{d}/{n}.svg', 'w').write(svg_pose(n))
            arg = ['-w', '1100'] if n.startswith('rosto_') else ['-h', '1500']
            subprocess.run(['rsvg-convert', *arg, f'{d}/{n}.svg', '-o', f'{d}/{n}.png'], check=True); os.remove(f'{d}/{n}.svg')
        print('poses ok'); sys.exit()
    W, Hh = 3600, 2500
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hh}" width="{W}" height="{Hh}">{DEFS}<rect width="{W}" height="{Hh}" fill="#0B0B0C"/>']
    for i, n in enumerate(CORPO):
        x, y = 200 + i * 400, 330
        o.append(f'<g transform="translate({x},{y}) scale(0.42)">{pose(n)}</g>')
        o.append(f'<text x="{x}" y="1340" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="30" fill="{OSSO}">{n}</text>')
    for i, n in enumerate(ROSTO):
        x, y = 360 + i * 720, 1950
        o.append(f'<g transform="translate({x},{y}) scale(1.4)">{pose(n)}</g>')
        o.append(f'<text x="{x}" y="2460" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="30" fill="{OSSO}">{n}</text>')
    o.append('</svg>')
    open('folha_snb06.svg', 'w').write('\n'.join(o)); subprocess.run(['rsvg-convert', '-w', '2400', 'folha_snb06.svg', '-o', 'folha_snb06.png'], check=True); print('ok')
