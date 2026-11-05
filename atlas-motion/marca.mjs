import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [dir] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' };
for (const [id, v] of [['LogoTTR', 'logo'], ['BannerTTR', 'banner']]) {
  const comp = await selectComposition({ serveUrl, id, inputProps: { v }, ...opts });
  await renderStill({ serveUrl, composition: comp, frame: 0, output: `${dir}/ttr_${v}.png`, imageFormat: 'png', inputProps: { v }, timeoutInMilliseconds: 240000, ...opts });
  console.log('ok', v);
}
