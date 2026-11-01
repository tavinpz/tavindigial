import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_msg.js', 'utf8')))
await a.abrir('/mensagens')
await a.foto('m0'); await a.botoes()
await a.clicar('Mariana Costa'); await a.espera(1200)
await a.foto('m1'); await a.botoes()
await a.clicar('Pausar IA'); await a.espera(800)
await a.foto('m2'); await a.botoes()
await a.fim('expm')
