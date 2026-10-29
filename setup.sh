#!/usr/bin/env bash
# Prepara uma sessão nova: dependências + modelo de voz (Kokoro, Apache 2.0)
set -e
cd "$(dirname "$0")"
pip install -q --break-system-packages kokoro-onnx soundfile pillow numpy
mkdir -p modelo
[ -f modelo/kokoro-v1.0.onnx ] || curl -sSL -o modelo/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f modelo/voices-v1.0.bin ] || curl -sSL -o modelo/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
which ffmpeg >/dev/null || echo "Falta o ffmpeg"
# motor de animação (Remotion) e o link ../atlas-motion que os scripts do motor usam
if [ ! -d motion/node_modules ]; then (cd motion && npm install --silent); fi
mkdir -p motion/public/tex saida
for f in earth-blue-marble.jpg earth-night.jpg earth-topology.png earth-water.png night-sky.png; do
  [ -f motion/public/tex/$f ] || cp motion/node_modules/three-globe/example/img/$f motion/public/tex/
done
[ -f motion/public/tex/clouds.png ] || cp motion/node_modules/three-globe/example/clouds/clouds.png motion/public/tex/
[ -e ../atlas-motion ] || ln -s "$PWD/motion" ../atlas-motion
echo "Pronto."
