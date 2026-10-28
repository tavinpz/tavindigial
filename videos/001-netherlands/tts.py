import soundfile as sf, json, sys, os
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from kokoro_onnx import Kokoro
k = Kokoro(os.path.join(RAIZ, 'modelo/kokoro-v1.0.onnx'), os.path.join(RAIZ, 'modelo/voices-v1.0.bin'))
LINES = [
 "A quarter of the Netherlands sits below sea level. So why isn't it underwater?",
 "Because the Dutch live behind walls. Dikes hold the sea higher than the land behind them.",
 "On the night of January 31st, 1953, a storm surge smashed through those walls.",
 "One thousand eight hundred and thirty six people died. Over thirteen hundred square kilometers went under the sea.",
 "The answer was the Delta Works: thirteen dams and storm barriers, built over almost forty years.",
 "The last piece guards Rotterdam. Two giant gates that swing shut on their own when the sea rises.",
 "Today, the heart of the country is built to survive a storm expected once in ten thousand years.",
]
voz = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
dur = []
for i, t in enumerate(LINES):
    a, sr = k.create(t, voice=voz, speed=1.08, lang='en-us')
    sf.write(f'v{i}.wav', a, sr); dur.append(len(a) / sr)
json.dump({'dur': dur, 'lines': LINES}, open('narr.json', 'w'))
print([round(d, 2) for d in dur], round(sum(dur), 1))
