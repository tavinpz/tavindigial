# Tavin Motion — vídeos da Tavin Digital

Motion em código (Remotion 4) com a identidade da Tavin Digital: noite #120E15, elétrico #B600F6, rosa #FEA8FF, Raleway + Urbanist, pattern geométrico da marca.

- `src/marca.tsx`: cores, fontes, Logo, Padrao (pattern animado), Cortina (troca de cena), Titulo cinético, Celular (tela real rolando), Selo, Legenda.
- `src/v/`: um arquivo por vídeo (V1 prévia grátis, V2 link da bio, V3 edição de vídeo, V4 serviços).
- `public/telas/`: capturas reais das páginas de demonstração do site (Playwright, 390×844 @2x).
- `audio.py`: trilha sintetizada 116 bpm + whoosh/impacto + ducking da voz.
- `produzir.py`: renderiza (imagem + áudio) → `saida/`. Voz: Kokoro `pm_alex` (pt-br), declarar como IA.
- `enviar.py`: registra no painel (canal tavin-digital) e sobe pelo branch `envio-videos`.

```bash
npm install
python3 produzir.py V1Previa V2Bio V3Edicao V4Servicos V1Voz
python3 enviar.py && (rodar saida/registro.sql no Supabase) && python3 enviar.py --push
```
Depois do render, normalizar o áudio para -14 LUFS / -1,5 dBTP (ffmpeg loudnorm) antes de enviar.
