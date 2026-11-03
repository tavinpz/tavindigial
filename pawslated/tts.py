"""Offline narration (Kokoro). Narrator = af_heart; the dog = am_puck pitched up (cartoon)."""
import hashlib
import os

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

MODEL = "/home/claude/tts/kokoro-v1.0.onnx"
VOICES = "/home/claude/tts/voices-v1.0.bin"
CACHE = "/home/claude/pawslated/tts_cache"
SR = 48000
_k = None


def _kokoro():
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro
        _k = Kokoro(MODEL, VOICES)
    return _k


def say(text, who="narrator"):
    """Returns mono float array at 48 kHz (trimmed)."""
    os.makedirs(CACHE, exist_ok=True)
    key = hashlib.md5(f"{who}|{text}".encode()).hexdigest()[:16]
    path = os.path.join(CACHE, key + ".wav")
    if not os.path.exists(path):
        voice, speed = {"narrator": ("af_heart", 1.06), "dog": ("am_puck", 1.0), "owner": ("af_bella", 1.0)}[who]
        s, sr = _kokoro().create(text, voice=voice, speed=speed, lang="en-us")
        s = np.asarray(s, dtype=np.float64)
        if who == "dog":      # cartoon dog: pitch + tempo up ~16%
            s = resample_poly(s, 25, 29)
            sr = 24000
        y = resample_poly(s, 2, 1)
        # trim silence
        env = np.abs(y) > 0.01
        if env.any():
            a, b = np.argmax(env), len(env) - np.argmax(env[::-1])
            y = y[max(0, a - 400): min(len(y), b + 1200)]
        y = y / (np.max(np.abs(y)) + 1e-9) * 0.9
        sf.write(path, y, SR)
    y, _ = sf.read(path)
    return y
