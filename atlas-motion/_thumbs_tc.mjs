// Capas do Two Childhoods: node _thumbs_tc.mjs $PWD/src/index.ts <public/tc/vNN> <dir> <prefixo>   (lê cfg.thumbs do roteiro.json)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
const [entry, pasta, dir, pre] = process.argv.slice(2);
const CH='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const serveUrl = await bundle({ entryPoint: entry });
fs.mkdirSync(dir, { recursive: true });
for (const p of pasta.split(',')) {
  const th = JSON.parse(fs.readFileSync(`${p}/roteiro.json`)).cfg.thumbs, id = pre || JSON.parse(fs.readFileSync(`${p}/roteiro.json`)).cfg.id;
  for (const v of ['a', 'b', 'c']) {
    const inputProps = { v, c: th[v] };
    const composition = await selectComposition({ serveUrl, id: 'TCThumb', inputProps, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
    await renderStill({ composition, serveUrl, output: `${dir}/${id}-capa3-${v}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
  }
}
console.log('ok');
