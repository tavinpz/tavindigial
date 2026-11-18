// Folha de contato do Two Childhoods: node _folha_tc.mjs $PWD/src/index.ts <pasta> <dir> [quadros separados por vírgula | "auto"]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
const [entry, pasta, dir, lista = 'auto'] = process.argv.slice(2);
const CH='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const T = JSON.parse(fs.readFileSync(`public/${pasta}/tempos.json`));
let fr = [];
if (lista === 'auto') for (const b of T.blocos) { if (b.cap) fr.push(Math.round(b.ini*30)+40); for (const f of b.falas) fr.push(Math.round((f.t + f.d*0.85)*30)); }
else fr = lista.split(',').map(Number);
const serveUrl = await bundle({ entryPoint: entry });
const composition = await selectComposition({ serveUrl, id: 'TCVideo', inputProps: { pasta }, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
fs.mkdirSync(dir, { recursive: true });
for (const f of fr) await renderStill({ composition, serveUrl, output: `${dir}/q${String(f).padStart(5,'0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, frame: f, scale: 0.25, inputProps: { pasta, tempos: T }, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
console.log('ok', fr.length);
