import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
const [entry, dir, ks] = process.argv.slice(2);
const CH='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const serveUrl = await bundle({ entryPoint: entry });
for (const k of ks.split(',')) {
  const composition = await selectComposition({ serveUrl, id: 'TCStill', inputProps: { k }, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
  await renderStill({ composition, serveUrl, output: `${dir}/tc_${k}.png`, inputProps: { k }, browserExecutable: CH, chromiumOptions:{gl:'swangle'} });
}
console.log('ok');
