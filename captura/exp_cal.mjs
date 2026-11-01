import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_cal.js', 'utf8')))
await a.abrir('/calendario')
await a.foto('c0')
await a.p.evaluate(() => { const b = [...document.querySelectorAll('button')]; const m = b.find((x) => x.innerText.trim() === 'Mês'); m.nextElementSibling ? 0 : 0; const i = b.indexOf(m); b[i + 1].click() }); await a.espera(1000)
await a.foto('c2'); await a.botoes()
await a.p.keyboard.press('Escape'); await a.espera(400)
await a.clicar('Editar'); await a.espera(1200)
await a.foto('c3'); await a.botoes()
await a.fim('expc')
