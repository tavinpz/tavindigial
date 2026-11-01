import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_eq.js', 'utf8')))
await a.abrir('/configuracoes')
await a.botoes()
await a.clicar('Equipe'); await a.espera(1200)
await a.foto('q1'); await a.botoes()
await a.fim('expq')
