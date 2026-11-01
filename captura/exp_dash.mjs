import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_dash.js', 'utf8')))
await a.abrir('/dashboard', 'base', 1440, 1000)
await a.espera(1500)
await a.foto('x0'); await a.botoes()
await a.p.evaluate(() => { const el = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 100 && /auto|scroll/.test(getComputedStyle(e).overflowY)).sort((x, y) => y.scrollHeight - x.scrollHeight)[0]; (el || document.scrollingElement).scrollTop = 900 }); await a.espera(900)
await a.foto('x1')
await a.fim('expx')
