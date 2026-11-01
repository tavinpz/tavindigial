// node narra.mjs <Comp> → imprime as falas do vídeo (src/narra.ts) em JSON; [] se não tiver narração
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const comp = process.argv[2];
const out = execSync('npx --yes esbuild src/narra.ts --bundle --platform=node --format=esm --log-level=error', { encoding: 'utf8' });
const tmp = path.resolve('.narra_tmp.mjs'); fs.writeFileSync(tmp, out);
const m = await import('file://' + tmp + '?' + Date.now()); fs.unlinkSync(tmp);
console.log(JSON.stringify(m.NARRA[comp] || []));
