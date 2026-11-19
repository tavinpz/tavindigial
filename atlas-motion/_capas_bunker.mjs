import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const out = process.argv[2]; const BX = '/usr/bin/google-chrome';
const serveUrl = await bundle({entryPoint: '/home/claude/estudio/atlas-motion/src/index.ts', outDir: '/home/claude/bk/bundle'});
for (const v of ['a','b','c']) {
  const comp = await selectComposition({serveUrl, id: 'BunkerThumb', inputProps: {v}, browserExecutable: BX});
  await renderStill({composition: comp, serveUrl, output: `${out}/bunker01-thumb-${v}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps: {v}, browserExecutable: BX});
}
console.log('ok');
