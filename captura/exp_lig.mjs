import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_lig.js', 'utf8')))
await a.abrir('/ligacoes')
await a.foto('l0'); await a.botoes()
await a.clicar('Mariana Costa'); await a.espera(1200)
await a.foto('l1'); await a.botoes()
await a.p.evaluate(() => window.scrollTo(0, 2000)); await a.espera(500)
await a.foto('l2')
await a.fim('expl')
