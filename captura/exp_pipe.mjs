import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_pipe.js', 'utf8')))
await a.abrir('/pipeline', 'base', 2200, 1000)
await a.foto('e0'); 
// raio da coluna Agendamento
const raios = await a.p.$$('button'); console.log('n botoes', raios.length)
await a.p.evaluate(() => { document.querySelectorAll('.pip-auto-btn')[1].click() })
await a.espera(800); await a.foto('e1'); await a.botoes()
await a.p.keyboard.press('Escape'); await a.espera(300)
await a.abrir('/pipeline', 'base', 2200, 1000)
await a.clicar('Ana P.'); await a.espera(1200); await a.foto('e2'); await a.botoes()
await a.fim('exp')
