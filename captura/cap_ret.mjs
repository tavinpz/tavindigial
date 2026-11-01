import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_ret.js', 'utf8')))
await a.abrir('/retornos', 'base', 1440, 1000)
await a.foto('t1_mes', { novo: '+ Novo retorno de procedimento' }); await a.botoes()
await a.clicar('+ Novo retorno de procedimento'); await a.espera(700)
await a.digitar('Ex.: Limpeza, Manutenção do aparelho', 'Revisão do implante')
await a.clicar('1 ano', 'button'); await a.espera(400)
await a.foto('t2_novo', { nome: 'Revisão do implante', ano: '1 ano' })
await a.clicar('Cancelar', 'button'); await a.espera(400)
await a.clicar('‹', 'button'); await a.espera(1200)
await a.foto('t3_outubro', {}); await a.botoes()
await a.fim('ret')
