import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const out = process.argv[2]; const BX = '/usr/bin/google-chrome';
const serveUrl = await bundle({entryPoint: '/home/claude/estudio/atlas-motion/src/index.ts', outDir: '/home/claude/bk/bundle'});
for (const [id, nome, tipo] of [['BunkerLogo','logo','logo'],['BunkerBanner','banner','banner']]) {
  const comp = await selectComposition({serveUrl, id, inputProps: {tipo}, browserExecutable: BX});
  await renderStill({composition: comp, serveUrl, output: `${out}/${nome}.jpg`, imageFormat: 'jpeg', jpegQuality: 90, inputProps: {tipo}, browserExecutable: BX});
}
console.log('ok');
