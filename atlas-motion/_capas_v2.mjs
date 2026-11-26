import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const [,, id, out, ...vs] = process.argv; const BX = '/usr/bin/google-chrome';
const serveUrl = await bundle({entryPoint: process.cwd() + '/src/index.ts', outDir: '/tmp/bundle-capas'});
for (const v of vs) {
  const comp = await selectComposition({serveUrl, id, inputProps: {v}, browserExecutable: BX});
  await renderStill({composition: comp, serveUrl, output: `${out}/${v}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps: {v}, browserExecutable: BX});
}
console.log('ok');
