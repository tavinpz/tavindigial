import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
const [entry, comp, frames, dir, pasta] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: entry });
const CH = '/usr/bin/google-chrome', inputProps = { pasta: pasta || 'htc/v01' };
const composition = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable: CH });
let k = 0;
for (const f of frames.split(',').map(Number)) await renderStill({ composition, serveUrl, inputProps, output: `${dir}/q${String(k++).padStart(3, '0')}_${f}.png`, frame: f, scale: 0.33, browserExecutable: CH });
console.log('ok', k);
