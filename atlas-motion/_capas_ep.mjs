// uso: node _capas_ep.mjs <N> <saida>   (lê bunker/epNN.json e gera 3 capas)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const out = process.argv[process.argv.length - 1]; const BX = '/usr/bin/google-chrome';
const serveUrl = await bundle({entryPoint: '/home/claude/estudio/atlas-motion/src/index.ts', outDir: '/home/claude/bk/bundle'});
for (const N of process.argv.slice(2, -1)) {
  const EP = JSON.parse(fs.readFileSync(`/home/claude/estudio/bunker/ep${String(N).padStart(2,'0')}.json`, 'utf8'));
  for (const [i, c] of EP.capas.entries()) {
    const inputProps = {v: 'g', g: {...c, teil: EP.n}};
    const comp = await selectComposition({serveUrl, id: 'BunkerThumb', inputProps, browserExecutable: BX});
    await renderStill({composition: comp, serveUrl, output: `${out}/${EP.id.split('-')[0]}-capa-${'abc'[i]}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps, browserExecutable: BX});
  }
}
console.log('ok');
