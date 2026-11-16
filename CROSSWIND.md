# Crosswind: guia de produção

Este é o guia para produzir os próximos vídeos do canal Crosswind ("Aviation engineering, explained"). Cada vídeo longo é feito numa conversa nova.
O **#01, "Why the B-52 Lands Sideways"**, é a régua de qualidade. O Tavin aprovou o vídeo e a voz, e disse: "a voz é boa demais". Nenhum vídeo novo pode ficar abaixo dele.

Código do #01, para estudar e reaproveitar: `atlas-motion/src/b52/` (lib.tsx, cenas1.tsx, cenas2.tsx, Crosswind01.tsx, Thumbs.tsx) e `atlas-motion/public/b52/roteiro.json`.

---

## 0. Regras do Tavin (valem sempre)

- Responder em português, de forma direta. O vídeo é em inglês.
- **Avisar o Tavin a cada marco**: roteiro pronto, teste pronto, cada parte renderizada, upload feito. Ele reclamou quando ficou sem notícia. Nunca prometer horário sem medir; o render real foi de ~74 min por parte.
- **Antes do render longo, mostrar um teste curto** (15 a 30 s, com voz) e esperar aprovação.
- Nunca rodar dois renders ao mesmo tempo. Para matar um processo, usar o PID (nada de `pkill` com padrão).
- Não usar ElevenLabs. Não contornar bloqueios de rede.
- O repositório `tavinpz/tavindigial` é público: não colocar token, senha, métricas privadas nem transcrições.
- Supabase (projeto Ecoom) só via MCP. Nunca expor a chave da API do YouTube.

## 1. Preparar o ambiente (conversa nova = máquina nova)

```bash
git clone -b estudio-longo https://github.com/tavinpz/tavindigial /home/claude/estudio-longo
git clone -b envio-videos  https://github.com/tavinpz/tavindigial /home/claude/envio-wt   # só para subir no painel
cd /home/claude/estudio-longo/atlas-motion && npm ci
pip install --break-system-packages kokoro-onnx scipy
mkdir -p /home/claude/tts && cd /home/claude/tts
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
- Render (Remotion): `--browser-executable=/opt/pw-browsers/chromium-*/chrome-linux64/chrome --gl=swangle`. Conferir o caminho com `ls /opt/pw-browsers`. Sem isso, o Remotion tenta baixar o Chrome e é bloqueado.
- Edge TTS e Hugging Face são bloqueados. GitHub funciona.

## 2. Pautas

| # | Título de trabalho | Observação |
|---|---|---|
| 02 | Why the SR-71 Leaked Fuel on the Ground | **Já foi prometido no final do #01.** Fazer primeiro. |
| 03 | Why the A380 Failed but the 747 Didn't | Comparação de dois gigantes. Mais negócio e engenharia. |

Próximas boas: ideias na linha "por que esse avião é estranho" (A-10 construído em volta do canhão, U-2 com rodinhas que caem na decolagem, V-22, Concorde com nariz que abaixa).
Meta de duração: **8 a 10 min**. O #01 ficou com 6:10; o próximo deve ser mais longo, mas sem enrolação.

## 3. Roteiro que prende (o mais importante)

Fórmula do #01, que funcionou:

1. **Gancho em 5 s com a cena estranha acontecendo.** No #01: "This is a B-52 landing in a crosswind. And it's coming in... completely sideways."
2. **Contraste com o normal.** "If an airliner touched down like this, it would be in serious trouble…" Mostrar o que daria errado.
3. **Prometer a resposta sem entregar.** "And the reason goes all the way back to one decision Boeing made in the late 1940s. Where to put the wheels."
4. **Ensinar o básico em 30–40 s** (física simples, com números concretos: "140 knots, 20 knot crosswind, about eight degrees").
5. **Uma virada a cada 30–40 s.** Cada bloco termina abrindo o próximo: "But here's the catch." / "That layout has a strange side effect." / "Now put it all together."
6. **Clímax = a solução**, revelada só depois que o problema ficou claro ("Boeing's answer was brilliantly simple.").
7. **Recompensas extras depois do clímax**: como fica visto de fora, o outro avião que tentou, linha do tempo até hoje.
8. **Final em loop**: retomar a imagem do começo com o novo entendimento e anunciar o próximo vídeo pelo nome.

Regras de texto:
- Frases curtas e faladas: "it's", "here's", "that's". Números por extenso ("twenty degrees") para a voz ler bem.
- Uma ideia por fala. Cada fala vira uma linha de legenda e um momento visual.
- Fatos sempre de fonte (2 a 3 fontes boas). O que for incerto é dito como incerto ("reportedly"). Animação simplificada recebe o rótulo "ILLUSTRATION".
- Não alongar com repetição. Para chegar a 8+ min, escolher um tema com mais camadas: mais "por quê", mais viradas.

Formato do `roteiro.json`: lista de blocos `{ "cena": "nome", "falas": ["...", "..."] }`. Usar 12 a 18 blocos, e cada bloco vira uma cena visual.

## 4. Voz (não mudar)

`python3 atlas-motion/narrar_cw.py atlas-motion/public/<pasta>`
- Usa a mistura Kokoro 60% am_michael + 40% am_fenrir, velocidade 1.0, com a cadeia de EQ e compressão do #01.
- Gera `voz_longo.wav` e `tempos.json`, com o início e a duração de cada fala. É o `tempos.json` que sincroniza as cenas.
- Ouvir trechos antes de seguir. Se uma palavra sair errada (sigla, número), reescrever a fala por extenso ("S R seventy one" se "SR-71" soar mal) e rodar de novo.

## 5. Visual: o padrão do #01

Tudo é desenhado em SVG/CSS no Remotion. Sem imagens da internet e sem fotos de pessoas.

**Identidade (reaproveitar `lib.tsx`):**
- Cores `C`: fundo azul-noite `#081018`, laranja `#ff8a2a` (destaque e marca), vermelho `#ff4d4d` (erro/perigo), verde `#4ade80` (certo), azul `#6cc0ff` (ar/vento), texto `#f3f5f7`.
- Fontes: Inter (títulos, legenda) e JetBrains Mono (rótulos técnicos, números, carimbos).
- Aviões em SVG com gradiente metálico (`Defs`), sombra e detalhes (motores, trem, cockpit). Vistas de cima, de frente e de lado. Para um avião novo (SR-71, A380, 747), criar `SR71Topo`, `SR71Lado` etc. no mesmo estilo: gradientes de `Defs`, contorno fino, sombra. Já existe um `SR71` simples em cenas2.tsx (cartão final); refazer com mais detalhe.
- Peças prontas: `Rot` (rótulo com subtítulo), `Seta`, `Grade` (fundo quadriculado), `Vento` (partículas), `Carimbo` (OFF THE TABLE, CLASSIFIED), `Item` (lista ✓/✗), `Pista3D` (câmera 3D em CSS com fumaça, faíscas e luzes).

**Moldura em todo quadro (`Crosswind01.tsx`, copiar):**
- Transição de 12 quadros entre blocos (crossfade com leve zoom).
- Vinheta, tom azul/laranja em soft-light e grão (`public/fx/grain0-3.png`, opacidade 0.06).
- Legenda grande embaixo (Inter 800, 54 px): no máximo 7 palavras por vez, palavras surgindo conforme a fala, **palavras-chave em laranja** (lista `DEST`).
- Fade do preto no início.

**Regras de cena (o que fez o #01 ficar bom):**
- **Algo se move sempre.** Nada de tela parada mais de 2 s: câmera lenta (zoom/pan), partículas, setas crescendo.
- **Cada fala ganha um evento visual sincronizado** (`ts[i]` = quadro em que a fala i começa no bloco). Quando a voz diz o número, ele aparece.
- Números grandes e animados (contadores, ângulos desenhados com arco, barras comparativas como 185 FT × 159 FT).
- Comparação lado a lado (o normal ✓ × o estranho ?!).
- Momentos de impacto: faíscas, tremor, carimbo vermelho, com efeito sonoro casado.
- Rótulos nunca em cima da legenda: tudo acima de ~y=880 (em 1080). Rótulos nunca saindo da tela nem se sobrepondo.

**Checagem visual obrigatória antes do render:**
`node _stills_cw.mjs $PWD/src/index.ts <Composicao> f1,f2,... /pasta` gera quadros em 1/3 do tamanho. Montar uma folha de contato com 2 a 3 quadros por cena e olhar tudo.
No #01, essa checagem pegou: rótulos fora da tela, texto em cima da legenda, rodas viradas erradas, datas sobrepostas, desenho ruim do SR-71. Corrigir tudo antes do render longo.

## 6. Som

`cw01/sfx.py` é o modelo. Copiar para a pasta do vídeo e trocar os nomes das cenas e os momentos. Ele gera `sfx.wav` 48k a partir do `tempos.json`, com:
- acordes graves que mudam a cada bloco;
- pulso a 90 bpm nas partes calmas;
- vento nas cenas de pista;
- whoosh em cada transição;
- "hit" nos momentos de impacto, chiado de pneu e ticks.

Mixagem final (voz por cima, trilha abaixando quando há fala):
```bash
ffmpeg -i video.mp4 -i voz_longo.wav -i sfx.wav -filter_complex "[1:a]aresample=48000,asplit=2[v][v2];[2:a]volume=0.55[s];[s][v]sidechaincompress=threshold=0.05:ratio=4:release=250[sd];[sd][v2]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest final.mp4
```
Alvo: cerca de −16 LUFS (o #01 deu −15,6).

## 7. Render (máquina de 2 núcleos)

- Composição 1920×1080, 30 fps, `durationInFrames = ceil(tempos.total*30)`. Registrar em `src/Root.tsx`.
- Usar `--muted --crf=18 --concurrency=2`. Velocidade medida: cerca de 3700 quadros em 74 min.
- **Tarefas em segundo plano duram no máximo 2 h**, então renderizar em partes de ~3700 quadros (`--frames=0-3699`, `3700-7399`…), uma de cada vez. Juntar com `ffmpeg -f concat -c copy` e depois fazer a mixagem.
- Mandar cada parte pronta para o Tavin, já com som (cortar voz/sfx com `-ss/-t`), para ele acompanhar.

## 8. Thumbnails e títulos

- Composição `CWThumb` (1280×720, ver `Thumbs.tsx`). Fazer 3 opções, cada uma com **uma imagem forte + 2 a 3 palavras gigantes** (Inter 900, contorno preto) e um número ou símbolo em laranja.
  No #01: A "ON PURPOSE 20°", B "IT CAN'T TILT", C "WHY SIDEWAYS?" com o comparativo ✓/?!.
- `npx remotion still src/index.ts CWThumb out.jpg --props='{"v":"a"}' --image-format=jpeg --jpeg-quality=92 --browser-executable=... --gl=swangle`
- 3 títulos: curiosidade + nome do avião, sem mentir. Exemplo: "Why the B-52 Lands Sideways (On Purpose)".

## 9. Subir no painel

1. Arquivo do painel **≤ 50 MB**: o projeto Supabase recusa acima disso, mesmo com o bucket em 500 MB.
   `ffmpeg -i final.mp4 -c:v libx264 -preset medium -b:v 880k -maxrate 1400k -bufsize 2800k -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart painel.mp4` (≈44 MB para 6 min; para 9 min, usar ~600k).
2. O arquivo em qualidade máxima vai direto para o Tavin (SendUserFile): é esse que ele sobe no YouTube.
3. Registrar via MCP: `insert into videos_envio (caminho, sha256) values ('crosswind/cw002-....mp4','<sha256>')`, junto com as 3 thumbs (`crosswind/cw002-thumb-a.jpg` …).
   Cada registro vale uma vez. Se falhar, usar outro nome de arquivo (apagar um registro pede confirmação do Tavin).
4. Copiar os arquivos para `envio-wt/envio/crosswind/`, fazer commit e push na branch `envio-videos`. A Action `subir-videos` envia os arquivos. Acompanhar com `gh run watch`.
   Conferir com `select name from storage.objects where bucket_id='videos' and name like 'crosswind/%'`. O curl da sandbox dá 403 nas URLs públicas, o que é normal.
5. Inserir a linha em `videos`, copiando o formato da `cw001-b52-sideways`:
   `id`, `canal='crosswind'`, `numero`, `titulo`, `arquivo`, `video_url`, `capa_url`, `duracao`, `yt_titulo`, `yt_titulos` (3), `capas` (3, com nome "Opção A · TEXTO"), `yt_descricao` (gancho + capítulos tirados do tempos.json + chamada para o próximo + "Illustrations are simplified animations, not to scale."), `yt_tags`, `comentario_fixado` (curiosidade + pergunta), `fontes`, `subido_em=now()`.
   Não mexer em `yt_status` e `yt_programado_para`.

## 10. Checklist final (não entregar sem isso)

- [ ] Gancho nos primeiros 5 s, com uma virada a cada 30–40 s
- [ ] Fatos conferidos em 2 a 3 fontes
- [ ] Voz Michael + Fenrir sem palavra estranha
- [ ] Folha de contato revisada: nada fora da tela, nada em cima da legenda
- [ ] Teste curto aprovado pelo Tavin
- [ ] Partes enviadas conforme ficaram prontas
- [ ] Final com loudness ~−16 LUFS e 3 quadros conferidos
- [ ] 3 thumbs + 3 títulos + descrição com capítulos
- [ ] Painel: vídeo ≤ 50 MB, thumbs e linha em `videos`
- [ ] Código commitado na branch `estudio-longo` (sem wav/mp4/png, que estão no .gitignore)
