// uso: node _stills_ep.mjs <pasta bunker/vNN> <saida> <quadros,...> [escala]   (REBUNDLE=0 reaproveita o bundle)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
const [,, pasta, outDir, framesArg, scale='0.25'] = process.argv; const BX = '/usr/bin/google-chrome';
let serveUrl = '/home/claude/bk/bundle';
if (process.env.REBUNDLE !== '0') serveUrl = await bundle({entryPoint: '/home/claude/estudio/atlas-motion/src/index.ts', outDir: serveUrl});
const comp = await selectComposition({serveUrl, id: 'BunkerEp', inputProps: {pasta}, browserExecutable: BX});
fs.mkdirSync(outDir, {recursive: true});
const browser = await openBrowser('chrome', {browserExecutable: BX, chromiumOptions: {gl: 'swiftshader'}});
for (const fr of framesArg.split(',').map(Number)) {
  try { await renderStill({composition: comp, serveUrl, frame: fr, output: `${outDir}/f${String(fr).padStart(5,'0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, scale: Number(scale), inputProps: comp.props, puppeteerInstance: browser, browserExecutable: BX, timeoutInMilliseconds: 240000}); }
  catch (e) { console.log('ERRO', fr, String(e.message || e).slice(0, 300)); }
}
await browser.close({silent: true}); console.log('ok', comp.durationInFrames);
