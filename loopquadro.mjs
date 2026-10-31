import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const url = await bundle({ entryPoint: path.resolve('src/index.ts') });
const props = { semCelular: true };
const c = await selectComposition({ serveUrl: url, id: 'R3', inputProps: props, browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: { gl: 'swangle' } });
await renderStill({ composition: c, serveUrl: url, output: 'public/telas/r3_loop.png', frame: 0, inputProps: props, browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: { gl: 'swangle' } });
console.log('ok');
