// node fx.mjs <Comp> <props-json>  → imprime a lista de efeitos [[tipo, quadro], ...] do vídeo
import path from 'path';
import fs from 'fs';
const [comp, props] = process.argv.slice(2);
// os efeitos ficam em src/fx.ts (funções puras), importadas aqui via esbuild do bundler seria pesado; usamos tsx simples
const { execSync } = await import('child_process');
const out = execSync(`npx --yes esbuild src/fx.ts --bundle --platform=node --format=esm --log-level=error`, { encoding: 'utf8' });
const tmp = path.resolve('.fx_tmp.mjs'); fs.writeFileSync(tmp, out);
const m = await import('file://' + tmp + '?' + Date.now());
fs.unlinkSync(tmp);
console.log(JSON.stringify(m.FX[comp](JSON.parse(props || '{}'))));
