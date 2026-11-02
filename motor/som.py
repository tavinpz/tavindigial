"""Desenho de som do Concrete Atlas: trilha sintetizada + efeitos (whoosh, impacto, tique, pop)
casados com os tempos das animações do motor de motion, mixados com a voz e normalizados a -14 LUFS.

Uso: python3 motor/som.py 002 [003 ...]   (lê atlas-motion/public/v/NNN/data.json e voz.wav)
Gera atlas-motion/public/v/NNN/mix.wav
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal as ss

MOTION = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'atlas-motion'))
SR = 48000
FPS = 30
T_TRANS = 8
rng = np.random.default_rng(7)


def env_ar(n, a, r):
    """envelope ataque/decay exponencial (a e r em amostras)"""
    e = np.ones(n)
    a = max(1, int(a)); e[:a] = np.linspace(0, 1, a)
    k = np.arange(n - a)
    e[a:] = np.exp(-k / max(1, r))
    return e


def lp(x, fc, ordem=2):
    sos = ss.butter(ordem, min(fc, SR / 2 * 0.95), 'low', fs=SR, output='sos'); return ss.sosfilt(sos, x)


def hp(x, fc, ordem=2):
    sos = ss.butter(ordem, fc, 'high', fs=SR, output='sos'); return ss.sosfilt(sos, x)


def bp_varrida(x, f0, f1, blocos=60):
    """passa-faixa que varre de f0 a f1 (em blocos, com ganho suave)"""
    n = len(x); out = np.zeros(n); tam = n // blocos + 1
    for b in range(blocos):
        s = b * tam; e = min(n, s + tam + 256)
        if s >= n: break
        fc = f0 * (f1 / f0) ** (b / max(1, blocos - 1))
        sos = ss.butter(2, [fc * 0.6, min(SR / 2 * 0.95, fc * 1.6)], 'band', fs=SR, output='sos')
        y = ss.sosfilt(sos, x[max(0, s - 2048):e])[min(2048, s):]
        seg = y[:min(tam, n - s)]
        out[s:s + len(seg)] += seg
    return out


def whoosh(dur=0.55, sobe=True):
    n = int(dur * SR); x = rng.normal(0, 1, n)
    y = bp_varrida(x, 300, 4500) if sobe else bp_varrida(x, 3500, 250)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t ** 0.8) ** 2
    y = y * e
    pan = np.linspace(-0.7, 0.7, n)
    return np.stack([y * (1 - pan) / 2, y * (1 + pan) / 2], 1) / (np.abs(y).max() + 1e-9)


def impacto(forca=1.0):
    n = int(1.3 * SR); t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    ruido = lp(rng.normal(0, 1, n), 2500) * np.exp(-t * 28) * 0.6
    cauda = lp(rng.normal(0, 1, n), 700) * np.exp(-t * 4) * 0.15
    y = np.tanh((sub * 1.4 + ruido + cauda) * 1.6) * forca
    return np.stack([y, y], 1) / (np.abs(y).max() + 1e-9)


def tique(tom=3200):
    n = int(0.035 * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * tom * t) * np.exp(-t * 180) + hp(rng.normal(0, 1, n), 4000) * np.exp(-t * 400) * 0.4
    return np.stack([y, y], 1) / (np.abs(y).max() + 1e-9)


def pop(f0=700, f1=1300):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 60))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
    return np.stack([y, y], 1) / (np.abs(y).max() + 1e-9)


def riser(dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp_varrida(rng.normal(0, 1, n), 200, 6000, 80)
    f = 180 * (8 ** (t / dur))
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    e = (t / dur) ** 2.2
    y = (x / (np.abs(x).max() + 1e-9) + tom) * e
    return np.stack([y, y], 1) / (np.abs(y).max() + 1e-9)


def sino():
    n = int(1.6 * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t * d) * a for fr, d, a in ((880, 3, 1), (1320, 4, 0.5), (1760, 6, 0.3), (2640, 8, 0.15)))
    return np.stack([y, y], 1) / (np.abs(y).max() + 1e-9)


def nota(midi): return 440 * 2 ** ((midi - 69) / 12)


def trilha(total):
    """Trilha cinematográfica tensa a 100 bpm: pad, baixo pulsante, pulso grave e chimbal discreto."""
    n = int(total * SR); t = np.arange(n) / SR
    beat = 0.6
    acordes = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]  # Am F C G
    pad = np.zeros(n); baixo = np.zeros(n); hat = np.zeros(n); kick = np.zeros(n)
    comp = beat * 8
    k = 0
    while k * comp < total:
        a = acordes[k % 4]; s = int(k * comp * SR); e = min(n, int((k + 1) * comp * SR + 0.8 * SR))
        tt = np.arange(e - s) / SR
        env = np.minimum(1, tt / 1.0) * np.minimum(1, np.maximum(0, (comp + 0.8 - tt) / 0.8))
        for m in a:
            for det in (-0.12, 0.12):
                fr = nota(m - 12) * 2 ** (det / 12)
                pad[s:e] += (np.sin(2 * np.pi * fr * tt) + 0.35 * np.sin(4 * np.pi * fr * tt) + 0.15 * np.sin(6 * np.pi * fr * tt)) * env
        # baixo em colcheias
        raiz = nota(a[0] - 24)
        for c in range(16):
            cs = s + int(c * beat / 2 * SR); ce = min(n, cs + int(beat / 2 * SR))
            if cs >= n: break
            ct = np.arange(ce - cs) / SR
            saw = 2 * ((ct * raiz) % 1) - 1
            baixo[cs:ce] += saw * np.exp(-ct * 9) * (1.0 if c % 2 == 0 else 0.7)
            # chimbal nos contratempos
            if c % 2 == 1:
                hn = min(len(ct), int(0.05 * SR))
                hat[cs:cs + hn] += rng.normal(0, 1, hn) * np.exp(-np.arange(hn) / SR * 90)
        for b in range(8):
            if b % 4 == 0:
                bs = s + int(b * beat * SR); be = min(n, bs + int(0.5 * SR))
                if bs >= n: break
                bt = np.arange(be - bs) / SR
                kick[bs:be] += np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-bt * 30)) / SR) * np.exp(-bt * 7)
        k += 1
    pad = lp(pad, 1400) * 0.10
    baixo = lp(baixo, 380, 4) * 0.22
    hat = hp(hat, 7000) * 0.05
    kick = kick * 0.30
    m = pad + baixo + hat + kick
    # largura estéreo
    esq = m + lp(np.roll(pad, 600), 1400) * 0.4
    dir_ = m + lp(np.roll(pad, 1100), 1400) * 0.4
    return np.stack([esq, dir_], 1)


def soma(buf, som, t, ganho):
    s = int(t * SR)
    if s < 0: som = som[-s:]; s = 0
    e = min(len(buf), s + len(som))
    if e > s: buf[s:e] += som[:e - s] * ganho


# efeitos das cenas de água (scenes/Agua.tsx): (quadro dentro da cena, som, ganho), casados com as animações
SFX_CENAS = {
    'maeslant': lambda c, dur: ([(dur * 0.34, 'riser', 0.3), (dur * 0.88, 'impacto', 0.75)] if c.get('modo') == 'gira' else
                                [(10, 'whoosh_longo', 0.3), (dur * 0.62, 'impacto', 0.65)] if c.get('modo') == 'afunda' else
                                [(4, 'whoosh_longo', 0.25)]),
    'tamisa': lambda c, dur: ([(6 + k * 7, 'pop', 0.3) for k in range(10)] + [(84, 'impacto', 0.6)] if c.get('modo') == 'constroi' else
                              [(dur * 0.12, 'riser', 0.3), (dur * 0.55, 'impacto', 0.65)] if c.get('modo') == 'sobe' else
                              [(6, 'whoosh_longo', 0.3)]),
    'dique': lambda c, dur: ([(10, 'whoosh_longo', 0.3), (30, 'pop', 0.25), (60, 'pop', 0.25)] if c.get('modo') == 'constroi' else
                             [(8 + k * 4, 'pop', 0.22) for k in range(5)] + [(40, 'whoosh_longo', 0.3)] if c.get('modo') == 'comportas' else
                             [(6, 'whoosh_longo', 0.25)]),
    'barragem': lambda c, dur: ([(k, 'tique', 0.22) for k in range(14, 14 + 9 * 8, 8)] + [(14 + 9 * 8, 'impacto', 0.8)] if c.get('modo') == 'piscina' else
                                [(6 + k * 5, 'pop', 0.25) for k in range(9)] if c.get('modo') == 'portoes' else
                                [(20, 'riser', 0.25), (60, 'whoosh_longo', 0.35)] if c.get('modo') == 'corte' else
                                [(4, 'whoosh_longo', 0.25)]),
    'polder': lambda c, dur: [(10 + k * 6, 'pop', 0.18) for k in range(8)] + [(dur * 0.6, 'impacto', 0.5)],
}


def eventos(d):
    """lista (tempo_s, nome, ganho) a partir dos tempos das cenas — espelha as animações do motor."""
    ev = []
    cenas, tempos = d['cenas'], d['tempos']
    c0 = cenas[0]
    globo = c0['tipo'] == 'mapa' and c0.get('gancho') and not c0.get('sem_globo')
    ev.append((0.0, 'impacto', 0.9))
    if c0.get('gancho') and '\n' in c0['gancho']:
        ev.append((5 / FPS, 'impacto', 0.75))
    if globo:
        ev.append((0.9, 'whoosh_desce', 0.55))
    for i, (c, tp) in enumerate(zip(cenas, tempos)):
        t0 = tp['ini']; dur = (tp['fim'] - tp['ini']) * FPS
        if i > 0:
            ev.append((t0 - T_TRANS / FPS - 0.12, 'whoosh', 0.6))
        if c.get('lembrete'):
            ev.append((t0 + 12 / FPS, 'pop', 0.45))
        if c['tipo'] == 'mapa':
            base = (40 if (i == 0 and globo) else 0) + 6
            for k, _ in enumerate(c.get('pins', [])):
                ev.append((t0 + (base + 10 + k * 9) / FPS, 'pop', 0.35))
            if c.get('rota') or c.get('rotas'):
                ev.append((t0 + (base + 8) / FPS, 'whoosh_longo', 0.3))
            if c.get('numero'):
                ev.append((t0 + (base + 18 + 26) / FPS, 'impacto', 0.7))
            if c.get('lacuna'):
                ev.append((t0 + (base + 36) / FPS, 'impacto', 0.6))
            if i == 0 and c.get('titulo'):
                ev.append((t0 + 84 / FPS, 'pop', 0.25))
        elif c['tipo'] == 'numero':
            for k in range(0, 34, 3): ev.append((t0 + (-3 + k) / FPS, 'tique', 0.18 * (1 - k / 40)))
            ev.append((t0 + 31 / FPS, 'impacto', 0.8))
            if c.get('segundo'):
                ini = round(dur * 0.42)
                for k in range(0, 34, 3): ev.append((t0 + (ini + k) / FPS, 'tique', 0.15))
                ev.append((t0 + (ini + 34) / FPS, 'impacto', 0.7))
        elif c['tipo'] == 'barras':
            for k in range(len(c['itens'])):
                ev.append((t0 + (-2 + k * 8) / FPS, 'pop', 0.3))
            ev.append((t0 + (-2 + (len(c['itens']) - 1) * 8 + 22) / FPS, 'impacto', 0.45))
        elif c['tipo'] == 'linha':
            n = len(c['eventos'])
            for k in range(n):
                tk = 10 if n == 1 else 10 + k * (dur - 40) / (n - 1)
                ev.append((t0 + tk / FPS, 'impacto', 0.45)); ev.append((t0 + tk / FPS, 'tique', 0.3))
        elif c['tipo'] == 'lista':
            n = len(c['itens'])
            for k in range(n): ev.append((t0 + (-2 + k * (dur - 26) / n) / FPS, 'whoosh_curto', 0.45))
        elif c['tipo'] == 'perfil':
            ev.append((t0 + 0.1, 'whoosh_longo', 0.25))
            for k, _ in enumerate(c.get('cotas', [])): ev.append((t0 + (50 + k * 10) / FPS, 'impacto', 0.4))
        elif c['tipo'] == 'comportas':
            if c.get('sobe') is not False: ev.append((t0 + (c.get('inicio', 0.6) * 30) / FPS, 'riser', 0.35))
        elif c['tipo'] == 'portoes':
            ev.append((t0 + 30 / FPS, 'riser', 0.3)); ev.append((t0 + min(dur - 30, 140) / FPS, 'impacto', 0.75))
        elif c['tipo'] == 'secao':
            for k in range(len(c['circulos'])): ev.append((t0 + (8 + k * 10) / FPS, 'pop', 0.35))
        elif c['tipo'] == 'salao':
            ev.append((t0 + 22 / FPS, 'impacto', 0.55)); ev.append((t0 + 52 / FPS, 'impacto', 0.45))
        elif c['tipo'] == 'palpite':
            ev.append((t0 + 0.0, 'pop', 0.5))
            for k in range(len(c.get('opcoes', []))): ev.append((t0 + (8 + k * 6) / FPS, 'whoosh_curto', 0.35))
            fim = (dur - 26) if c.get('revelar') else (dur - 4)
            ini_c = 24
            for k in range(3): ev.append((t0 + (ini_c + k * (fim - ini_c) / 3) / FPS, 'tique', 0.45))
            if c.get('revelar'): ev.append((t0 + fim / FPS, 'sino', 0.4)); ev.append((t0 + fim / FPS, 'impacto', 0.5))
        elif c['tipo'] == 'altura':
            for k in range(len(c['itens'])): ev.append((t0 + (-2 + k * 9) / FPS, 'riser', 0.18))
            ev.append((t0 + (26 + (len(c['itens']) - 1) * 9) / FPS, 'impacto', 0.55))
        elif c['tipo'] in SFX_CENAS:
            for q, nome, ganho in SFX_CENAS[c['tipo']](c, dur): ev.append((t0 + q / FPS, nome, ganho))
        elif c['tipo'] == 'cta':
            ev.append((t0 - 1.2, 'riser', 0.35))
            ev.append((t0 + 2 / FPS, 'sino', 0.35)); ev.append((t0 + 44 / FPS, 'pop', 0.5))
    return ev


def mixa(vid):
    pasta = os.path.join(MOTION, 'public', 'v', vid)
    d = json.load(open(os.path.join(pasta, 'data.json')))
    voz, sr = sf.read(os.path.join(pasta, 'voz.wav'), dtype='float64')
    if sr != SR: voz = ss.resample_poly(voz, SR, sr)
    total = d['quadros'] / FPS
    n = int(total * SR) + SR // 10
    voz = np.pad(voz, (0, max(0, n - len(voz))))[:n]
    voz = voz / (np.abs(voz).max() + 1e-9) * 0.7
    voz2 = np.stack([voz, voz], 1)

    mus = trilha(total + 0.1)[:n]
    mus = np.pad(mus, ((0, n - len(mus)), (0, 0)))
    # ducking pela voz
    envv = ss.filtfilt(*ss.butter(1, 6, fs=SR), np.abs(voz))
    duck = 1 - 0.55 * np.clip(envv / (envv.max() * 0.25 + 1e-9), 0, 1)
    mus = mus * duck[:, None]
    # respiro antes da chamada final: música some 0,4 s e volta
    t_cta = d['tempos'][-1]['ini']
    s0, s1 = int((t_cta - 0.45) * SR), int(t_cta * SR)
    g = np.ones(n); g[s0:s1] = np.linspace(1, 0.05, s1 - s0); g[s1:s1 + int(0.25 * SR)] = np.linspace(0.05, 1, min(int(0.25 * SR), n - s1))
    mus = mus * g[:, None]
    # entrada da música e saída
    fade_out = int(0.8 * SR); mus[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
    mus = mus / (np.abs(mus).max() + 1e-9) * 0.30

    fx = np.zeros((n, 2))
    bib = {'impacto': impacto(), 'whoosh': whoosh(0.55), 'whoosh_desce': whoosh(0.9, False), 'whoosh_longo': whoosh(1.4), 'whoosh_curto': whoosh(0.32),
           'tique': tique(), 'pop': pop(), 'riser': riser(1.3), 'sino': sino()}
    for t, nome, ganho in eventos(d):
        soma(fx, bib[nome], t, ganho * 0.55)
    mix = voz2 + mus + fx
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
    bruto = os.path.join(pasta, 'mix_bruto.wav')
    sf.write(bruto, mix.astype(np.float32), SR)
    saida = os.path.join(pasta, 'mix.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', bruto, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), saida], check=True)
    os.remove(bruto)
    print(vid, 'mix ok', f'{total:.1f}s', len(eventos(d)), 'efeitos')


if __name__ == '__main__':
    for v in sys.argv[1:]: mixa(v)
