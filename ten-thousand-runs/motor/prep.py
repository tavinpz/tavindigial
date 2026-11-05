"""Monta o vídeo longo: tempos das falas e das cenas, voz única, trilha+efeitos e data.json para o Remotion (composição Longo).
uso: python3 motor/prep.py videos/001-monopoly
"""
import json, os, shutil, subprocess, sys
import numpy as np
import soundfile as sf
import scipy.signal as ss

sys.path.insert(0, '/home/claude/concrete-atlas/motor')
import som as SOM  # trilha e efeitos do Concrete Atlas (sintetizados, sem direitos de terceiros)
import prep_motion as PM  # tempos de cada palavra (legenda)

MOTION = '/home/claude/atlas-motion'
FPS = 30
SR = SOM.SR
GAP = 0.32      # pausa entre falas do mesmo bloco
GAP_B = 0.75    # pausa entre blocos (troca de cena)
LEAD = 0.45     # a cena aparece um pouco antes da fala
CAUDA = 2.5


def prepara(pasta):
    pasta = os.path.abspath(pasta)
    spec = json.load(open(os.path.join(pasta, 'spec.json')))
    narr = json.load(open(os.path.join(pasta, 'narr.json')))
    falas = [f for b in spec['blocos'] for f in b['falas']]
    assert narr['lines'] == falas, 'narr.json desatualizado: rode narrar.py'
    vid = spec['id']
    dest = os.path.join(MOTION, 'public', 'l', vid)
    os.makedirs(dest, exist_ok=True)

    t = 0.6
    k = 0
    blocos, faixas = [], []
    palavras = []
    for bi, b in enumerate(spec['blocos']):
        if bi:
            t += GAP_B - GAP
        ini_b = max(0.0, t - LEAD) if bi else 0.0
        marcos = []
        for f in b['falas']:
            a, sr = sf.read(os.path.join(pasta, 'voz', f'f{k:03d}.wav'), dtype='float32')
            if a.ndim > 1: a = a.mean(axis=1)
            marcos.append(round((t - ini_b) * FPS))
            if spec.get('legenda'):
                for w in PM.palavras(f, t, a, sr):
                    w['b'] = bi; palavras.append(w)
            faixas.append((t, a, sr))
            t += len(a) / sr + spec.get('gap', GAP)
            k += 1
        blocos.append({'cena': b['cena'], 'ini': round(ini_b * FPS), 'marcos': marcos})
    total = t - spec.get('gap', GAP) + spec.get('cauda', CAUDA)
    quadros = int(round(total * FPS))
    for i, b in enumerate(blocos):
        b['fim'] = blocos[i + 1]['ini'] if i + 1 < len(blocos) else quadros

    # voz
    n = int(np.ceil(total * SR)) + SR
    voz = np.zeros(n, dtype=np.float64)
    for t0, a, sr in faixas:
        if sr != SR: a = ss.resample_poly(a, SR, sr)
        s = int(t0 * SR); voz[s:s + len(a)] += a[: n - s]
    voz = voz / (np.abs(voz).max() + 1e-9) * 0.72

    # trilha com ducking + efeitos nas trocas de cena
    mus = SOM.trilha(total + 0.2)[:n]
    mus = np.pad(mus, ((0, max(0, n - len(mus))), (0, 0)))[:n]
    envv = ss.filtfilt(*ss.butter(1, 5, fs=SR), np.abs(voz))
    duck = 1 - 0.6 * np.clip(envv / (envv.max() * 0.25 + 1e-9), 0, 1)
    mus = mus * duck[:, None]
    fo = int(2.0 * SR); mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
    mus = mus / (np.abs(mus).max() + 1e-9) * 0.22
    fx = np.zeros((n, 2))
    bib = {'whoosh': SOM.whoosh(0.5), 'impacto': SOM.impacto(0.8), 'riser': SOM.riser(1.2), 'pop': SOM.pop(), 'tique': SOM.tique()}
    for i, b in enumerate(blocos):
        tb = b['ini'] / FPS
        tp = b['cena']['tipo']
        if i:
            SOM.soma(fx, bib['whoosh'], tb - 0.15, 0.22)
        if tp == 'capitulo':
            SOM.soma(fx, bib['riser'], tb - 1.1, 0.18); SOM.soma(fx, bib['impacto'], tb + 0.12, 0.3)
        if tp in ('numero', 'contador', 'regra'):
            SOM.soma(fx, bib['impacto'], tb + 0.5, 0.22)
        if tp.startswith('gancho'):
            for k, m in enumerate(b['marcos']):
                SOM.soma(fx, bib['impacto'], tb + m / FPS + 0.05, 0.4 if k in (0, 2, 4) else 0.25)
                if k: SOM.soma(fx, bib['whoosh'], tb + m / FPS - 0.2, 0.3)
        if tp in ('barras', 'top', 'teste'):
            for m in b['marcos']:
                SOM.soma(fx, bib['pop'], tb + m / FPS + 0.3, 0.12)
    mix = np.stack([voz, voz], 1) + mus + fx
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
    bruto = os.path.join(dest, 'mix_bruto.wav')
    sf.write(bruto, mix.astype(np.float32), SR)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', bruto, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), os.path.join(dest, 'mix.wav')], check=True)
    os.remove(bruto)

    for b in spec['blocos']:
        if b['cena'].get('arq') and spec.get('arquivo'):
            shutil.copy(os.path.join(spec['arquivo'], b['cena']['arq']), dest)
        if b['cena'].get('log'):
            shutil.copy(os.path.join('/home/claude/ten-thousand-runs/sim', b['cena']['log']), dest)
    # números por extenso -> algarismos na legenda (a voz continua por extenso)
    trocas = sorted(spec.get('numeros', {}).items(), key=lambda kv: -len(kv[0].split()))
    if trocas and palavras:
        limpo = lambda w: w.lower().strip(',.?!:;')
        out, i = [], 0
        while i < len(palavras):
            feito = False
            for frase, dig in trocas:
                ws = frase.split()
                seg = palavras[i:i + len(ws)]
                if len(seg) == len(ws) and all(limpo(a['w']) == b for a, b in zip(seg, ws)) and len({x['b'] for x in seg}) == 1:
                    fim = seg[-1]['w']
                    pont = fim[len(fim.rstrip(',.?!:;')):]
                    out.append({'w': dig + pont, 't0': seg[0]['t0'], 't1': seg[-1]['t1'], 'b': seg[0]['b']})
                    i += len(ws); feito = True; break
            if not feito:
                out.append(palavras[i]); i += 1
        palavras[:] = out
    caps = [{'n': b['cena']['n'], 'ini': b['ini']} for b in blocos if b['cena']['tipo'] == 'capitulo']
    dados = {'id': vid, 'quadros': quadros, 'titulo': spec['titulo'], 'canal': spec.get('marca', 'TEN THOUSAND RUNS'), 'acento': spec.get('acento'), 'icone': spec.get('icone', 'grade'), 'lang': spec.get('lang', 'en-us'), 'blocos': blocos, 'capitulos': caps, 'palavras': palavras}
    json.dump(dados, open(os.path.join(dest, 'data.json'), 'w'))
    # capítulos para a descrição do YouTube
    caps_txt = ['0:00 ' + 'Intro'] + [f"{int(c['ini'] / FPS // 60)}:{int(c['ini'] / FPS % 60):02d} " + [b for b in spec['blocos'] if b['cena'].get('n') == c['n'] and b['cena']['tipo'] == 'capitulo'][0]['cena']['titulo'] for c in caps]
    open(os.path.join(pasta, 'capitulos.txt'), 'w').write('\n'.join(caps_txt) + '\n')
    print(vid, f'{total / 60:.2f} min', quadros, 'quadros', len(blocos), 'cenas')
    print('\n'.join(caps_txt))


if __name__ == '__main__':
    prepara(sys.argv[1])
