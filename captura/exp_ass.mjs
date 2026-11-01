import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_ass.js', 'utf8')))
await a.abrir('/assistentes')
await a.foto('a0'); await a.botoes()
const ed = await a.p.evaluateHandle(() => [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Editar')[0])
await ed.evaluate((b) => b.click()); await a.espera(2500)
await a.foto('a1'); await a.botoes()
for (const t of ['Negócio', 'Fluxo da conversa', 'Regras e objeções', 'Automações']) { await a.clicar(t); await a.espera(1500); await a.foto('a_' + t.slice(0, 5)) }
await a.fim('expa')
