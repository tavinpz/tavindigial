#!/usr/bin/env bash
# Prepara uma sessão nova: dependências + modelo de voz (Kokoro, Apache 2.0)
set -e
cd "$(dirname "$0")"
pip install -q --break-system-packages kokoro-onnx soundfile pillow numpy
mkdir -p modelo
[ -f modelo/kokoro-v1.0.onnx ] || curl -sSL -o modelo/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f modelo/voices-v1.0.bin ] || curl -sSL -o modelo/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
which ffmpeg >/dev/null || echo "Falta o ffmpeg"
echo "Pronto."
