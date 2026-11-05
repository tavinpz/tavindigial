"""Efeitos físicos discretos da direção de arte nova (papel, carimbo, fita, dados, máquina de escrever, placa
de preço, recibo). Tudo sintetizado: sem amostras de terceiros. Estéreo, SR do som.py do Concrete Atlas."""
import sys
import numpy as np
sys.path.insert(0, '/home/claude/concrete-atlas/motor')
import som as S  # noqa: E402

SR = S.SR
rng = np.random.default_rng(23)


def _st(y, pan=0.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.stack([y * (1 - pan) / 2 + y * 0.25, y * (1 + pan) / 2 + y * 0.25], 1)


def papel(dur=0.32):
    """folha deslizando e assentando na mesa"""
    n = int(dur * SR); x = rng.normal(0, 1, n)
    y = S.bp_varrida(x, 1800, 5200, 20) * np.sin(np.pi * np.linspace(0, 1, n) ** 0.6) ** 2
    bate = S.lp(rng.normal(0, 1, int(0.05 * SR)), 900) * S.env_ar(int(0.05 * SR), 10, 300)
    out = np.zeros(n + len(bate)); out[:n] += y * 0.6; out[n - 200:n - 200 + len(bate)] += bate * 1.4
    return _st(out, rng.uniform(-0.4, 0.4))


def carimbo():
    """batida surda de carimbo de borracha"""
    n = int(0.35 * SR); t = np.arange(n) / SR
    corpo = np.sin(2 * np.pi * (95 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 16)
    clique = S.hp(rng.normal(0, 1, n), 1500) * np.exp(-t * 90)
    return _st(corpo * 1.0 + clique * 0.35)


def fita():
    """adesivo / fita sendo colada: rasgo curto"""
    n = int(0.22 * SR); x = rng.normal(0, 1, n)
    y = S.bp_varrida(x, 2500, 7000, 12) * (np.abs(np.sin(np.linspace(0, 9 * np.pi, n))) ** 3) * np.linspace(1, 0.3, n)
    return _st(y, 0.2)


def dados(n_bat=7):
    """dados rolando no feltro"""
    tot = int(0.9 * SR); out = np.zeros(tot)
    t0 = 0
    for k in range(n_bat):
        m = int(0.03 * SR); c = S.bp_varrida(rng.normal(0, 1, m), 2200, 3000, 4) * S.env_ar(m, 5, 180)
        s = int(t0 * SR)
        if s + m < tot: out[s:s + m] += c * (1 - k / n_bat * 0.6)
        t0 += 0.05 + 0.09 * (k / n_bat) ** 1.5 + rng.uniform(0, 0.03)
    return _st(S.lp(out, 6000), -0.2)


def tecla():
    m = int(0.045 * SR); t = np.arange(m) / SR
    y = S.hp(rng.normal(0, 1, m), 1200) * np.exp(-t * 140) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 80) * 0.5
    return _st(y, rng.uniform(-0.3, 0.3))


def maquina(n=10, cps=12):
    """máquina de escrever: sequência de teclas"""
    tot = int((n / cps + 0.2) * SR); out = np.zeros((tot, 2))
    for k in range(n):
        S.soma(out, tecla(), k / cps + rng.uniform(-0.01, 0.01), 0.7 + rng.uniform(-0.2, 0.2))
    return out


def virar(n=4):
    """placa de dígitos virando (flap)"""
    tot = int((n * 0.17 + 0.2) * SR); out = np.zeros((tot, 2))
    for k in range(n):
        m = int(0.04 * SR); t = np.arange(m) / SR
        c = S.bp_varrida(rng.normal(0, 1, m), 900, 1400, 3) * np.exp(-t * 110)
        S.soma(out, _st(c), k * 0.17, 0.8)
    return out


def recibo(dur=1.0):
    """impressora térmica"""
    n = int(dur * SR); t = np.arange(n) / SR
    y = (S.bp_varrida(rng.normal(0, 1, n), 2400, 2600, 6) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * t)))) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.3
    return _st(y)


def eventos(v, dur_s):
    """lista de (segundos desde o início da cena, som, ganho) para um visual"""
    tp = v['tipo']; ev = [(0.05, 'papel', 0.20)]
    if tp in ('data', 'documento') and v.get('canal') == 'qvd':
        ev.append((0.25, 'maquina', 0.18))
    if tp in ('carimbo',) or v.get('carimbo') or v.get('selo'):
        ev.append((dur_s * (v.get('selo_em', 0.55 if tp in ('documento', 'data') else 0.4)) + 0.05, 'carimbo', 0.32))
    if tp in ('numero', 'rank', 'titulo'):
        ev.append((0.12, 'carimbo', 0.30))
    if tp in ('data', 'mapa', 'galoes', 'pessoas', 'icones', 'ano', 'leque', 'nota-rasgada') or v.get('sticker') or v.get('pergunta'):
        ev.append((0.55, 'fita', 0.16))
    if tp == 'bomba': ev.append((0.25, 'virar', 0.22))
    if tp == 'contador': ev.append((0.2, 'virar', 0.16)); ev.append((max(0.8, dur_s - 0.6), 'carimbo', 0.25))
    if tp == 'conta': ev.append((0.1, 'recibo', 0.14))
    if tp == 'dados': ev.append((0.05, 'dados', 0.35))
    if tp == 'ficha': ev += [(dur_s * (0.12 + i * 0.26) + 0.05, 'carimbo', 0.22) for i in range(3)]
    if tp == 'bolso': ev += [(0.4, 'carimbo', 0.3), (dur_s * 0.5 + 0.05, 'carimbo', 0.3)]
    if tp == 'mesa': ev += [(0.2 * i, 'papel', 0.16) for i in range(5)]
    return ev


BIB = {'papel': papel, 'carimbo': carimbo, 'fita': fita, 'dados': dados, 'maquina': maquina, 'virar': virar, 'recibo': recibo}
