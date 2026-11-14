import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
const jobs = JSON.parse(process.argv[2]);
const serveUrl = await bundle({ entryPoint: '/home/claude/atlas-motion/src/index.ts' });
const CH = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
for (const [comp, id, frame, out] of jobs) {
  const inputProps = { id, semAudio: true };
  const composition = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable: CH });
  await renderStill({ composition, serveUrl, output: out, frame, inputProps, browserExecutable: CH });
  console.log('ok', out);
}
