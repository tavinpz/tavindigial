import { iniciar } from './lib.mjs'
const a = await iniciar()
await a.abrir('/campanhas', 'base', 1440, 1500)
const h = await a.achar('Nova Campanha')
console.log(await h.evaluate((e) => e && e.tagName + ' ' + e.outerHTML.slice(0, 120)))
await h.asElement().click(); await a.espera(1500)
await a.botoes()
await a.fim('dbg')
