"""Voz Piper (offline). falar(texto, voz, velocidade) -> (audio float32, sample_rate).
voz "m" = pt_BR-faber-medium. velocidade < 1 deixa a fala mais lenta (length_scale = 1/velocidade).
"""
import os
import numpy as np
from piper import PiperVoice, SynthesisConfig

VOZES = {'m': 'pt_BR-faber-medium', 'cadu': 'pt_BR-cadu-medium'}
# ajuste de estabilidade aprovado pelo Tavin (menos variação aleatória = menos tropeço)
AJUSTE = {'pt_BR-cadu-medium': {'noise_scale': 0.45, 'noise_w_scale': 0.5}}
PASTA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vozes')
_cache = {}


def falar(texto, voz='m', velocidade=1.0):
    nome = VOZES.get(voz, voz)
    if nome not in _cache:
        _cache[nome] = PiperVoice.load(os.path.join(PASTA, nome + '.onnx'))
    v = _cache[nome]
    cfg = SynthesisConfig(length_scale=1.0 / float(velocidade), **AJUSTE.get(nome, {}))
    partes = [c.audio_float_array for c in v.synthesize(texto, syn_config=cfg)]
    a = np.concatenate(partes).astype(np.float32) if partes else np.zeros(1, np.float32)
    return a, v.config.sample_rate
