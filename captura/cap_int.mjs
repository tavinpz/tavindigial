import { iniciar } from './lib.mjs'
const a = await iniciar()
await a.preparar(() => {
  const agora = new Date().toISOString()
  window.__DB.google_calendar_connections = [{ id: 'g1', google_email: 'agenda@clinicaaurora.com.br', google_name: 'Clínica Aurora', google_picture: '', is_active: true, ativo: true, created_at: agora }]
  window.__FETCH['clinicorp-connect'] = (b) => { window.__DB.clinicorp_accounts = [{ id: 'k1', clinic_name: 'Clínica Aurora — Centro', user_api: b.user_api, subscriber_id: '1', clinic_business_id: '1', ativo: true, connected_at: agora }]; return { ok: true } }
  const un = [{ id: 'u1', nome: 'Clínica Aurora — Centro' }, { id: 'u2', nome: 'Clínica Aurora — Jardins' }]
  window.__FETCH['controle-odonto-connect'] = () => { window.__DB.controle_odonto_accounts = [{ id: 'co1', clinic_name: 'Clínica Aurora', usuario: 'aurora.recepcao', status: 'ativo', ativo: true, unidades: un }]; return { ok: true, unidades: un } }
})
// botao dentro de modal (elemento fixo mais alto)
const caixaModal = (txt) => a.p.evaluate((t) => {
  const bs = [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === t && b.getBoundingClientRect().width > 0)
  const b = bs[bs.length - 1]; if (!b) return null; const r = b.getBoundingClientRect(); return [r.x * 2, r.y * 2, r.width * 2, r.height * 2].map(Math.round)
}, txt)
const clicaModal = async (txt) => { await a.p.evaluate((t) => { const bs = [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === t && b.getBoundingClientRect().width > 0); bs[bs.length - 1]?.click() }, txt); await a.espera(900) }
await a.abrir('/integracoes', 'base')
await a.foto('i1_pagina', { clinicorp: 'Adicionar conta Clinicorp', co: 'Conectar ControleODONTO' })
await a.clicar('Adicionar conta Clinicorp')
await a.foto('i2_clinicorp', {})
await a.digitar('ex: minhaclinica', 'clinicaaurora')
await a.digitar('Token gerado na Clinicorp', 'a8F3k2Lm9Qx7')
await a.foto('i3_clinicorp_preenchido', { usuario: 'ex: minhaclinica' })
a.meta.i3_clinicorp_preenchido.conectar = await caixaModal('Conectar')
await clicaModal('Conectar')
await a.foto('i4_clinicorp_ok', { card: 'Clínica Aurora — Centro' })
await a.clicar('Conectar ControleODONTO')
await a.digitar('thata.ia', 'aurora.recepcao')
await a.p.evaluate(() => { const i = [...document.querySelectorAll('input[type=password]')].pop(); if (i) { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'senha123segura'); i.dispatchEvent(new Event('input', { bubbles: true })) } })
await a.espera(300)
await a.foto('i5_co_preenchido', {})
a.meta.i5_co_preenchido.validar = await caixaModal('Validar acesso')
await clicaModal('Validar acesso')
await a.foto('i6_co_ok', {})
await a.p.keyboard.press('Escape'); await a.espera(300)
await clicaModal('Concluir'); await clicaModal('Fechar')
await a.foto('i7_final', {})
await a.fim('int')
