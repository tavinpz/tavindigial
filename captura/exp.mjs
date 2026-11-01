// uso: node exp.mjs rota "clique1|clique2|..."  -> fotos e1..en + botoes de cada tela
import { iniciar } from './lib.mjs'
import fs from 'fs'
const [rota, seq = '', extra = ''] = process.argv.slice(2)
const a = await iniciar()
if (extra) await a.preparar(new Function(fs.readFileSync(extra, 'utf8')))
await a.abrir(rota, 'base', 1440, +(process.env.H || 1000))
await a.foto('e0'); await a.botoes()
let i = 1
for (const c of seq.split('|').filter(Boolean)) { await a.clicar(c); await a.espera(500); await a.foto('e' + i++); await a.botoes() }
await a.fim('exp')
