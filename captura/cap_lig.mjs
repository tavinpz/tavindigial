import { iniciar } from './lib.mjs'
import fs from 'fs'
const a = await iniciar()
await a.preparar(new Function(fs.readFileSync('dados_lig.js', 'utf8')))
await a.abrir('/ligacoes')
await a.foto('k1_lista', { metricas: 'TOTAL DE LIGAÇÕES', mariana: 'Mariana Costa' })
await a.clicar('Mariana Costa'); await a.espera(1500)
await a.foto('k2_detalhe', { resultado: 'RESULTADO', gravacao: 'GRAVAÇÃO DA CHAMADA' })
// rola o painel de detalhe até a transcrição
await a.p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.innerText.includes('Detalhes da Chamada')); const el = els.sort((x, y) => x.innerText.length - y.innerText.length)[0]; if (el) el.scrollTop = 520; else window.scrollTo(0, 520) }); await a.espera(600)
await a.foto('k3_transcricao', { analise: 'Análise', fala: 'Pode. Minha filha' })
await a.clicar('Análise'); await a.espera(800)
await a.foto('k4_analise', { resumo: 'RESUMO AUTOMÁTICO' })
await a.fim('lig')
