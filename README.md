# Estúdio de canais (LOADBEARING + PAWSLATED)

Código que gera os vídeos dos canais de shorts do painel (tavindigital.online/painel).
Tudo é desenhado em código (Python + Skia), com som procedural. O PAWSLATED também tem narração offline (Kokoro TTS).

## Setup em uma sessão nova (cloud)

```bash
cd /home/claude
git clone -b estudio-canais https://github.com/tavinpz/tavindigial estudio
ln -s /home/claude/estudio/loadbearing /home/claude/lb2          # os scripts usam esses caminhos
ln -s /home/claude/estudio/pawslated  /home/claude/pawslated
git clone https://github.com/tavinpz/tavindigial tavindigial       # painel + ramo envio-videos (upload)
pip install --break-system-packages skia-python numpy scipy soundfile pillow kokoro-onnx
# voz (só PAWSLATED) — modelos ficam no GitHub, não no HuggingFace (bloqueado no sandbox)
mkdir -p /home/claude/tts && cd /home/claude/tts
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
ffmpeg precisa estar instalado (já vem no ambiente).

## PAWSLATED (pawslated/)
- `paw.py` paleta, logo, sting, render (1080x1920, 60 fps, ffmpeg).
- `toon.py` kit de desenho: cachorro Biscuit (`dog`, `dog_head`, estados: ears, whale, yawn, lick, turn, perk, soft, hard, grin, squint, paw, reach, happy, lean, fx, hop, squash, wag/wagf/tailang, lines, sweat, ear_swing), dona (`owner_body`, `owner_arm`), sala (`room`), câmera (`Cam`), stickers, coração, tradutor.
- `sets.py` cenários: kitchen, park, hallway(k dia→noite), bedroom, evening.
- `engine3.py` motor narrado: SCRIPT de falas (n = narradora af_heart, d = cachorro am_puck agudo, o = dona af_bella) → linha do tempo por "beats", legenda palavra a palavra, 1 sticker por vez, tradutor DOG → HUMAN, card final, CTA, sting.
- `tts.py` narração offline (cache em tts_cache/).
- `episodes3.py` 001–006 · `episodes4.py` 007–011 (formatos novos) · `episodes5.py` 012–021 (quiz banheiro, zoomies, rabo, giro, roupas, voz, campainha, madrugada, chute na grama, encostar). Cenários novos em `sets2.py`. Vozes extras da dona: `f` (entediada) e `h` (voz fininha).
- `sheets.py N beat+off ...` → frames/sheet_N.png (folha de conferência) · `render_batch.sh` renderiza 012–021 em 2 filas.
- `pdf_translator.py` → out/The-Dog-Translator.pdf (PDF grátis, 30 sinais, desenhado com o mesmo kit).
- `site/` página do link da bio: cadastro (RPC `pawslated_inscrever` no Supabase Ecoom, tabela `pawslated_inscritos`), download do PDF e oferta de $9 na mesma página. Configurar `CHECKOUT_URL` e `AFFILIATE_URL` no topo do script. `episodes.py`/`engine.py` são a base v2 usada pelos ports.
- Render: `python3 episodes4.py 9 stills 1.0 opts+3.0` (quadros em frames/) · `python3 episodes4.py 9 render` → out/PAWSLATED_009_lick-quiz_v3.mp4
- Publicar: `python3 publish_pw.py 7 8 9` (copia mp4 + capa para tavindigial/envio/pawslated, gera out/pw_register.sql e out/pw_videos.sql) → rodar o register SQL no Supabase (Ecoom) → `git push origin envio-videos` no clone do tavindigial (a Action sobe para o Storage) → inserir/atualizar a linha em `videos` (canal 'pawslated').

## LOADBEARING (loadbearing/)
- `brand.py` kit (paleta VOID/CHALK/MOLTEN, boné laranja, figura, sting) · `sound.py` foley procedural (também usado pelo PAWSLATED).
- `simple.py` (E006–E015) · `varied.py` (E016–E023) · `publish.py prepare <eps>` (mesmo fluxo de upload, pasta envio/ = loadbearing/).
- `episodes.json` títulos, legendas, tags, datas.

## Upload (ramo envio-videos)
`.github/workflows/subir-videos.yml`: `envio/<arquivo>` → `loadbearing/<arquivo>`; `envio/<canal>/<arquivo>` → `<canal>/<arquivo>` no bucket `videos`.
Cada arquivo precisa estar registrado antes em `videos_envio (caminho, sha256)`.
