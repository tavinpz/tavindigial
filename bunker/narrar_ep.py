# Narra um episódio do Bunker a partir de bunker/epNN.json e grava voz.wav + tempos.json (com as diretivas visuais) em atlas-motion/public/bunker/vNN.
# Uso: python3 bunker/narrar_ep.py 2
import sys, json, glob, os, numpy as np, soundfile as sf
from piper import PiperVoice, SynthesisConfig
N = int(sys.argv[1]); R = os.path.dirname(os.path.abspath(__file__))
EP = json.load(open(f"{R}/ep{N:02d}.json")); out = f"{R}/../atlas-motion/public/bunker/{EP['pasta']}"; os.makedirs(out, exist_ok=True)
onnx = glob.glob("/home/claude/tts/vits-piper-de_DE-thorsten-high/*.onnx")[0]
voz = PiperVoice.load(onnx, config_path=onnx + ".json")
def gerar(txt):
    cs = list(voz.synthesize(txt, syn_config=SynthesisConfig(length_scale=1.0 / 0.92)))
    return np.concatenate([c.audio_float_array for c in cs]).astype(np.float32), cs[0].sample_rate
partes = []; falas = []; blocos = []; t = 0.0; sr = None; pal = 0
for b in EP["blocos"]:
    blocos.append({"id": b["id"], "cap": b["cap"], "tenso": b.get("tenso", 0), "ini": round(t, 3)})
    for i, f in enumerate(b["falas"]):
        txt = f[0]; v = dict(f[1]) if len(f) > 1 else None; pal += len(txt.split())
        x, sr = gerar(txt)
        idx = np.where(np.abs(x) > 0.01)[0]
        if len(idx): x = x[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
        pausa = 0.95 if i == len(b["falas"]) - 1 else 0.52 if len(txt) <= 14 else 0.4
        q = {"id": f"{b['id']}_{i + 1}", "ini": round(t, 3), "fim": round(t + len(x) / sr, 3), "t": txt}
        if v:
            if "d" in v: q["d"] = v.pop("d")
            q["v"] = v
        falas.append(q); partes += [x, np.zeros(int(pausa * sr), dtype=np.float32)]; t += len(x) / sr + int(pausa * sr) / sr
y = np.concatenate(partes); y = y / max(1e-6, np.max(np.abs(y))) * 0.89
sf.write(out + "/voz.wav", y, sr)
n = int(np.ceil(len(y) / sr * 30)); env = []
for i in range(n):
    s = y[int(i * sr / 30): int((i + 1) * sr / 30)]; env.append(float(np.sqrt(np.mean(s ** 2))) if len(s) else 0.0)
m = max(env) or 1; dur = len(y) / sr
json.dump({"teil": N, "dur": round(dur, 3), "total": (round(dur * 30) + 75) / 30, "blocos": blocos, "falas": falas, "boca": [round(e / m, 3) for e in env]}, open(out + "/tempos.json", "w"), ensure_ascii=False)
print(f"ep{N}: {len(falas)} falas, {pal} palavras, {int(dur)//60}:{int(dur)%60:02d}")
