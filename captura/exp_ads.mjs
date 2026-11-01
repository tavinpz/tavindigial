import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_ads.js', 'utf8')))
await a.abrir('/integracoes')
await a.foto('z0'); await a.botoes()
await a.abrir('/mensagens')
await a.foto('z1'); await a.botoes()
await a.fim('expz')
