// node quadros.mjs <Comp> <saida> <frame...> [--props=json]  → PNGs reduzidos + uma folha com todos
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [comp, saida, ...resto] = process.argv.slice(2);
const props = JSON.parse((resto.find((a) => a.startsWith('--props=')) || '--props={}').slice(8));
const frames = resto.filter((a) => !a.startsWith('--')).map(Number);
const url = await bundle({ entryPoint: path.resolve('src/index.ts') });
const c = await selectComposition({ serveUrl: url, id: comp, inputProps: props, browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
for (const f of frames) {
  await renderStill({ composition: c, serveUrl: url, output: `${saida}/${comp}_${String(f).padStart(4, '0')}.png`, frame: f, inputProps: props, scale: 0.5, browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
}
console.log('ok', frames.length);
