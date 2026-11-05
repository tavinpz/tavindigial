// uso: node capas.mjs <saida_prefixo> a b c
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [pre, ...vs] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' };
for (const v of vs) {
  const comp = await selectComposition({ serveUrl, id: 'Capa', inputProps: { v }, ...opts });
  await renderStill({ serveUrl, composition: comp, frame: 0, output: `${pre}_${v}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps: { v }, ...opts });
  console.log('ok', v);
}
