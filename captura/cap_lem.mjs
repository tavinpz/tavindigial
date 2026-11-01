import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_cad.js', 'utf8') + '\n' + fs.readFileSync('dados_agd.js', 'utf8')))
await a.abrir('/cadencias', 'base', 1440, 1000)
await a.clicar('Nova Cadência'); await a.clicar('Lembrete Agend.')
const ta = await a.p.$('textarea'); await ta.type('Oi, {{nome}}! Sua consulta está confirmada para {{data_evento}} às {{hora_evento}}. Até lá!', { delay: 1 })
await a.foto('r1_confirma', { ta: 'Oi, {{nome}}', add: 'Adicionar Lembrete' })
await a.clicar('Adicionar Lembrete'); await a.espera(300); await a.clicar('Adicionar Lembrete'); await a.espera(400)
await a.p.evaluate(() => {
  const ss = [...document.querySelectorAll('select')].filter((x) => [...x.options].some((o) => /antes/.test(o.textContent)))
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
  const pega = (s, re) => { const o = [...s.options].find((o) => re.test(o.textContent)); if (o) { set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })) } }
  if (ss[0]) pega(ss[0], /24|1 dia/); if (ss[1]) pega(ss[1], /^2h|2 h/)
})
await a.espera(300)
const tas = await a.p.$$('textarea[placeholder^="Digite a mensagem do lembrete"]')
if (tas[0]) await tas[0].type('Oi, {{nome}}! Amanhã é a sua consulta, às {{hora_evento}}. Posso confirmar?', { delay: 1 })
const lig = await a.p.$$('button'); const ligs = []; for (const b of lig) if ((await b.evaluate((e) => e.innerText.trim())) === 'Ligação da assistente') ligs.push(b)
if (ligs[1]) await ligs[1].click(); await a.espera(500)
await a.p.evaluate(() => window.scrollTo(0, 420)); await a.espera(400)
await a.foto('r2_lembretes', {})
await a.abrir('/agenda-do-dia', 'base', 1440, 1000)
await a.foto('a1_dia', { resumo: 'consultas hoje' })
await a.p.evaluate(() => window.scrollTo(0, 340)); await a.espera(400)
await a.foto('a2_silencio', { silencio: 'Em silêncio desde o lembrete' })
const bts = await a.p.$$('button'); let alvo = null
for (const b of bts) { const t = await b.evaluate((e) => e.innerText.trim()); if (t === 'Cobrar agora') { const y = await b.evaluate((e) => e.getBoundingClientRect().y); if (y > 300) { alvo = b; break } } }
// o terceiro "Cobrar agora" e o da Carla (em silencio)
const todos = []; for (const b of bts) { if ((await b.evaluate((e) => e.innerText.trim())) === 'Cobrar agora') todos.push(b) }
const carla = todos[2]; const r = await carla.evaluate((e) => { const b = e.getBoundingClientRect(); return [b.x * 2, b.y * 2, b.width * 2, b.height * 2].map(Math.round) }); a.meta.a2_silencio.cobrar = r
await carla.click(); await a.espera(900)
await a.foto('a3_modal', {}); await a.botoes()
await a.fim('lem')
