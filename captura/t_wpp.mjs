import { iniciar } from './lib.mjs'
const a = await iniciar()
await a.abrir('/whatsapp', 'base')
await a.foto('w0')
await a.fim('w_test')
