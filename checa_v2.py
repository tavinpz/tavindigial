"""Confere nos roteiros v2 se cliques, realces e lupas caem dentro do que a câmera mostra."""
import json, sys, glob, os
PW, PH = 660, 1130 - 58
QW, QH = 1000, 1040 - 54
def cam_em(f, cam):
    if len(cam) == 1: return cam[0][1:]
    fs = [c[0] for c in cam]
    if f <= fs[0]: return cam[0][1:]
    if f >= fs[-1]: return cam[-1][1:]
    for a, b in zip(cam, cam[1:]):
        if a[0] <= f <= b[0]:
            t = (f - a[0]) / (b[0] - a[0]); t = t * t * (3 - 2 * t)
            return [a[i] + (b[i] - a[i]) * t for i in (1, 2, 3)]
def vis(t, f, pc):
    w, h = (QW, QH) if pc else (PW, PH)
    iw = t.get('iw', 2880 if pc else 1170); ih = t.get('ih', 1800 if pc else 4800)
    x, y, z = cam_em(f, t['cam']); s = w / iw * z
    if iw * s >= w: x = min(max(x, w / 2 / s), iw - w / 2 / s)
    if ih * s >= h: y = min(max(y, h / 2 / s), ih - h / 2 / s)
    return x - w / 2 / s, y - h / 2 / s, x + w / 2 / s, y + h / 2 / s
def interp(f, ks):
    fs = [k[0] for k in ks]
    if f <= fs[0]: return ks[0][1:]
    if f >= fs[-1]: return ks[-1][1:]
    for a, b in zip(ks, ks[1:]):
        if a[0] <= f <= b[0]:
            t = (f - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
for p in sorted(glob.glob('src/v2/roteiros/*.json')):
    if len(sys.argv) > 1 and os.path.basename(p)[:-5] not in sys.argv[1:]: continue
    r = json.load(open(p))
    for ci, c in enumerate(r['cenas']):
        for ti, t in enumerate(c.get('telas', []) or []):
            pc = bool(c.get('pc'))
            for q in t.get('cliques', []) or []:
                px, py = interp(q, t['cursor']); x0, y0, x1, y1 = vis(t, q, pc)
                if not (x0 <= px <= x1 and y0 <= py <= y1): print(r['id'], f'cena {ci} tela {ti}: clique {q} em ({px:.0f},{py:.0f}) fora de ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f})')
            for k in ('realce', 'lupa'):
                if not t.get(k): continue
                b = t[k]['box']; f = t[k]['ini'] + 4; x0, y0, x1, y1 = vis(t, f, pc)
                cx, cy = b[0] + b[2] / 2, b[1] + b[3] / 2
                if not (x0 <= cx <= x1 and y0 <= cy <= y1) or b[1] < y0 - 40 or b[1] + b[3] > y1 + 40:
                    print(r['id'], f'cena {ci} tela {ti}: {k} {b} parcialmente fora da vista ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f}) no quadro {f}')
print('conferido')
