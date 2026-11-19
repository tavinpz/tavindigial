import sys, json, numpy as np, soundfile as sf
modelo = sys.argv[1]; saida = sys.argv[2]; vel = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
d = f"/home/claude/tts/vits-piper-de_DE-{modelo}"
import glob
from piper import PiperVoice, SynthesisConfig
onnx = glob.glob(d + "/*.onnx")[0]
voz = PiperVoice.load(onnx, config_path=onnx + ".json")
def gerar(txt):
    cs = list(voz.synthesize(txt, syn_config=SynthesisConfig(length_scale=1.0 / vel)))
    return np.concatenate([c.audio_float_array for c in cs]).astype(np.float32), cs[0].sample_rate
falas = json.load(open("/home/claude/tts/falas.json"))
sr = None; partes = []; tempos = []; t = 0.0
for f in falas:
    x, sr = gerar(f["t"])
    # corta silêncio das pontas
    idx = np.where(np.abs(x) > 0.01)[0]
    if len(idx): x = x[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
    pausa = np.zeros(int(f.get("pausa", 0.35) * sr), dtype=np.float32)
    tempos.append({"id": f["id"], "ini": round(t, 3), "fim": round(t + len(x) / sr, 3), "t": f["t"]})
    partes += [x, pausa]; t += (len(x) + len(pausa)) / sr
y = np.concatenate(partes); y = y / max(1e-6, np.max(np.abs(y))) * 0.89
sf.write(saida + "/voz.wav", y, sr)
fps = 30; n = int(np.ceil(len(y) / sr * fps)); env = []
for i in range(n):
    s = y[int(i * sr / fps): int((i + 1) * sr / fps)]
    env.append(round(float(np.sqrt(np.mean(s ** 2))) if len(s) else 0.0, 4))
m = max(env) or 1
json.dump({"dur": round(len(y) / sr, 3), "falas": tempos, "boca": [round(e / m, 3) for e in env]}, open(saida + "/tempos.json", "w"), ensure_ascii=False)
print(round(len(y) / sr, 2), [(q["id"], q["ini"], q["fim"]) for q in tempos])
