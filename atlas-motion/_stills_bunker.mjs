import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
const [,, outDir, framesArg, scale='0.5'] = process.argv;
const entry = '/home/claude/estudio/atlas-motion/src/index.ts';
const e = fs.existsSync(entry) ? entry : entry.replace('.ts','.tsx');
let serveUrl = '/home/claude/bk/bundle';
if (process.env.REBUNDLE !== '0') serveUrl = await bundle({entryPoint: e, outDir: '/home/claude/bk/bundle'});
const BX0 = 1;
const comp = await selectComposition({serveUrl, id: 'Bunker01', browserExecutable: process.env.BX || '/usr/bin/google-chrome'});
fs.mkdirSync(outDir, {recursive: true});
const BX = process.env.BX || '/usr/bin/google-chrome';
const browser = await openBrowser('chrome', {browserExecutable: BX, chromiumOptions: {gl: 'swiftshader'}});
for (const fr of framesArg.split(',').map(Number)) {
  await renderStill({composition: comp, serveUrl, frame: fr, output: `${outDir}/f${String(fr).padStart(5,'0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 82, scale: Number(scale), puppeteerInstance: browser, browserExecutable: BX, timeoutInMilliseconds: 240000});
}
await browser.close({silent: true});
console.log('ok', comp.durationInFrames);
