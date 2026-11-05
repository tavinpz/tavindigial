import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: { gl: 'swiftshader' } };
for (const tipo of ['escuro', 'feltro', 'velho']) {
  const comp = await selectComposition({ serveUrl, id: 'TexArte', inputProps: { tipo }, ...opts });
  await renderStill({ serveUrl, composition: comp, frame: 0, output: `public/arte/tex/${tipo}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps: { tipo }, ...opts });
  console.log('ok', tipo);
}
