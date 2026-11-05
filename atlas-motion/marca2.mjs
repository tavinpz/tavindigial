import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' };
const jobs = [['LogoTTR', 'lss_logo', '/home/claude/last-state-standing/marca'], ['BannerTTR', 'lss_banner', '/home/claude/last-state-standing/marca'], ['LogoTTR', 'qvd_logo', '/home/claude/quanto-voce-dura/marca'], ['BannerTTR', 'qvd_banner', '/home/claude/quanto-voce-dura/marca']];
for (const [id, v, dir] of jobs) {
  const comp = await selectComposition({ serveUrl, id, inputProps: { v }, ...opts });
  await renderStill({ serveUrl, composition: comp, frame: 0, output: `${dir}/${v}.png`, imageFormat: 'png', inputProps: { v }, timeoutInMilliseconds: 240000, ...opts });
  console.log('ok', v);
}
