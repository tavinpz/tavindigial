import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_camp.js', 'utf8')))
await a.abrir('/campanhas', 'base', 1440, 1000)
await a.clicar('Nova Campanha'); await a.clicar('WhatsApp')
await a.digitar('Ex: Prospecção Clínica Ortopedia Q1', 'Reativação de pacientes')
await a.opcao('Selecione uma instância')
await a.foto('e1'); await a.botoes()
await a.clicar('Continuar para Contatos'); await a.espera(600)
await a.foto('e2'); await a.botoes()
await a.fim('exp')
