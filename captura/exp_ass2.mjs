import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_ass.js', 'utf8')))
await a.abrir('/assistentes')
const ed = await a.p.evaluateHandle(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Editar')[2])
await ed.evaluate((b) => b.click()); await a.espera(2500)
await a.foto('t1')
await a.clicar('Fluxo da conversa'); await a.espera(1800); await a.foto('t3'); await a.botoes()
await a.clicar('Regras e objeções'); await a.espera(1200)
await a.p.evaluate(() => { const el = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.innerText.includes('Limites e restrições')).sort((x, y) => x.innerText.length - y.innerText.length)[0]; if (el) el.scrollTop = 600 }); await a.espera(500)
await a.foto('t4')
await a.fim('expa2')
