// uso: node capas_arte.mjs lista.json   (lista: [{ "saida": "/caminho/x.jpg", "props": {...} }])  -> jpg 1280x720
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const lista = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' };
for (const { saida, props, comp = 'ArteCapa', escala = 2 / 3 } of lista) {
  const c = await selectComposition({ serveUrl, id: comp, inputProps: props, ...opts });
  await renderStill({ serveUrl, composition: c, frame: 0, output: saida, imageFormat: 'jpeg', jpegQuality: 90, scale: escala, inputProps: props, ...opts });
  console.log('ok', saida);
}
