// uso: node quadros_arte.mjs <saida_dir> <id>=f1,f2,... [<id>=...]   (composição Arte, escala 0.5)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [out, ...pedidos] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: { gl: 'swiftshader' } };
for (const p of pedidos) {
  const [id, lista] = p.split('=');
  const comp = await selectComposition({ serveUrl, id: 'Arte', inputProps: { id, semAudio: true }, ...opts });
  for (const f of lista.split(',')) {
    const t = Date.now();
    try { await renderStill({ serveUrl, composition: comp, frame: Number(f), output: `${out}/${id}_${String(f).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 78, inputProps: { id, semAudio: true }, scale: 0.5, timeoutInMilliseconds: 240000, ...opts });
    console.log(id, f, Date.now() - t, 'ms'); } catch (e) { console.log('ERRO', id, f, String(e.message || e).slice(0, 600)); }
  }
}
