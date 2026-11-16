import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
const [entry, comp, frames, dir] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: entry });
const CH='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const composition = await selectComposition({ serveUrl, id: comp, inputProps: {}, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
for (const f of frames.split(',').map(Number)) {
  await renderStill({ composition, serveUrl, output: `${dir}/q${String(f).padStart(5,'0')}.png`, frame: f, scale: 0.33, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
}
console.log('ok');
