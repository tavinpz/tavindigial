// uso: node quadros.mjs <id> <saida_dir> f1 f2 f3 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [id, out, ...fr] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: { gl: 'swiftshader' } };
const comp = await selectComposition({ serveUrl, id: 'Short', inputProps: { id, semAudio: true, pre3d: true }, ...opts });
for (const f of fr) {
  const t = Date.now();
  await renderStill({ serveUrl, composition: comp, frame: Number(f), output: `${out}/q${id}_${f}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, inputProps: { id, semAudio: true, pre3d: true }, scale: 0.5, timeoutInMilliseconds: 240000, ...opts });
  console.log(f, Date.now() - t, 'ms');
}
