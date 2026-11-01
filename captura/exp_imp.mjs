import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_imp.js', 'utf8')))
await a.abrir('/lista')
await a.foto('i0'); await a.botoes()
await a.clicar('Importar'); await a.espera(900)
await a.foto('i1'); await a.botoes()
const inp = await a.p.$('input[type=file]'); await inp.uploadFile('/tmp/shot/pacientes_aurora.csv'); await a.espera(2000)
await a.foto('i2'); await a.botoes()
await a.clicar('Continuar'); await a.espera(1200)
await a.foto('i3'); await a.botoes()
await a.fim('expi')
