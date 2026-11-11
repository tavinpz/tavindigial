import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG, brl } from '../config'
import { formatTel } from '../lib/msg'
import { COLUNAS, EVENTOS, STATUS, moverEtapa, registrarEnvio, registrarEvento, tempoAtras } from './api'
import { usePainel } from './Painel'
import { abrirCanal, canalDe, dicaDm, etapaNoCanal, mensagemPara, separarFilas } from './envio'
import DestinoWa from './DestinoWa'
import Responder from './Responder'
import { diasDesde, haDias, proximoPasso } from './Acompanhamento'
import { BANDEIRA, JanelaBusca, JanelaEmail, bomHorario, horaLocal, iniciarEmails } from './Gringa'

// Busca: nome, @ ou número (com ou sem 55, com ou sem traço/parênteses)
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
function bateBusca(l, q) {
  const bruto = q.trim()
  if (!bruto) return true
  const dig = bruto.replace(/\D/g, '')
  if (dig.length >= 4 && dig.length >= bruto.replace(/[\s()+\-.]/g, '').length) {
    const w = String(l.whatsapp || '').replace(/\D/g, '')
    const alvo = dig.startsWith('55') && dig.length >= 12 ? dig.slice(2) : dig
    return w.includes(alvo)
  }
  const t = semAcento(bruto.replace(/^@/, ''))
  return semAcento(l.nome).includes(t) || semAcento(l.instagram).includes(t)
}

// Dentro de "Enviado": primeiro quem tem follow-up hoje, depois por dia da última mensagem
const GRUPO_ENVIADO = [['fup', 'Follow-up hoje'], ['d0', 'Enviados hoje'], ['d1', 'Ontem'], ['d2', 'Há 2 dias'], ['d3', 'Há 3 dias ou mais']]
function grupoEnviado(a) {
  if (!a) return 'd3'
  if (a.proximo_contato && new Date(a.proximo_contato) <= new Date()) return 'fup'
  const d = diasDesde(a.ultimo_envio)
  return d <= 0 ? 'd0' : d === 1 ? 'd1' : d === 2 ? 'd2' : 'd3'
}
const etapaFollowup = (a) => (a.status === 'proposta' ? 'followup_proposta' : (a.total_envios || 0) <= 1 ? 'followup_1' : 'followup_2')

// Colunas de quem ainda não foi chamado: arrastar para "1º contato" já abre a conversa com o texto pronto
const CHAMAR = { chamar_wa: 'whatsapp', chamar_dm: 'instagram', chamar_gringa: 'whatsapp', chamar_email: 'email' }

// "Enviado" vira 3 colunas pelo número de mensagens: 1º contato → Follow-up 1 → Follow-up 2 (o último)
const SEQUENCIA = [['contato1', '1º contato'], ['fup1', 'Follow-up 1'], ['fup2', 'Follow-up 2']]
const QUADRO = [...SEQUENCIA, ...COLUNAS.filter(([k]) => k !== 'enviado')]
const statusDa = (col) => (SEQUENCIA.some(([k]) => k === col) ? 'enviado' : col)
function colunaDo(l, a) {
  if (l.status !== 'enviado') return l.status
  const n = a?.total_envios || 0
  return n <= 1 ? 'contato1' : n === 2 ? 'fup1' : 'fup2'
}
const CAMPOS_LEAD = 'id,nome,status,bairro,nicho,categoria,cidade,tipo_site,site_raw,whatsapp,instagram,avaliacoes,nota,updated_at,proximo_contato,mercado,pais,fuso,email,email_status,idioma,wa_status,qualificado'
const dataDia = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

const POR_COLUNA = 60

// Melhores oportunidades de gringo primeiro: negócio estabelecido, sem site bom, nicho que paga, EUA (dólar)
const NICHO_RICO = /dent|odont|est[eé]tic|m[eé]dic|clinic|cl[ií]nic|spa|advog|law|contab|account|imobil|real.?estate|constru|contractor|remodel|roof|clean|limpeza|auto|mec[aâ]n|sal[aã]o|salon|barb|nail|restaur|bakery|padaria/i
export function pontosGringo(l) {
  let p = Math.min(30, Math.round(Math.log10((l.avaliacoes || 0) + 1) * 15))
  if (l.nota >= 4.5) p += 10; else if (l.nota >= 4) p += 5
  if (l.tipo_site !== 'site_ok') p += 20
  if (l.instagram) p += 8
  if (l.email) p += 6
  if (l.pais === 'US') p += 15
  if (NICHO_RICO.test(`${l.categoria || ''} ${l.nicho || ''} ${l.nome || ''}`)) p += 10
  if (l.wa_status === 'ok') p += 5
  // o perfil que mais respondeu até agora: casa de comida em Portugal, sem site, com celular
  if (l.pais === 'PT' && /restaurante|cafeteria|padaria/.test(l.nicho || '') && l.wa_status === 'ok' && l.tipo_site !== 'site_ok') p += 25
  if (l.qualificado) p += 30
  if (REDE.test(l.nome || '')) p -= 100
  return p
}
const REDE = /pingo doce|continente|mcdonald|burger king|starbucks|telepizza|\bh3\b|vitaminas|padaria portuguesa|ogi by|kfc|pizza hut|domino|subway|lidl|aldi|celeiro/i
const TOP = 60
const temWhats = (l) => l.whatsapp && !['sem', 'fixo'].includes(l.wa_status)

// Quadro arrastável: segure e arraste (no celular, toque longo). Toque rápido abre o lead.
export default function Crm() {
  const { abrirLead, avisar, versao, mensagens } = usePainel()
  const [leads, setLeads] = useState(null)
  const [pipe, setPipe] = useState(() => { try { return localStorage.getItem('crm-pipe') === 'gringa' ? 'gringa' : 'br' } catch { return 'br' } })
  const gringa = pipe === 'gringa'
  useEffect(() => { try { localStorage.setItem('crm-pipe', pipe) } catch { /* sem storage */ } }, [pipe])
  const [janela, setJanela] = useState(null)
  const [emails, setEmails] = useState({})
  const [fila, setFila] = useState({ wa: [], dm: [], gr: [], em: [] })
  const [feitos, setFeitos] = useState({ whatsapp: 0, instagram: 0 })
  const [acomp, setAcomp] = useState({})
  const [responder, setResponder] = useState(null)
  const [extra, setExtra] = useState({ wa: 0, dm: 0, gr: 0, em: 0 })
  const VISIVEIS = 40
  const [busca, setBusca] = useState('')
  const [gfiltro, setGfiltro] = useState({ pais: 'todos', idioma: 'todos', qual: true })
  const [brutos, setBrutos] = useState([])
  const [alvo, setAlvo] = useState(null)
  const [arrastando, setArrastando] = useState(null)
  const quadro = useRef(null)
  const drag = useRef(null)

  const pedido = useRef(0)
  const carregar = useCallback(async () => {
    if (drag.current?.ativo) { setTimeout(() => carregar(), 1200); return } // espera soltar o card
    const meu = ++pedido.current
    let q = supabase.from('leads').select(`${CAMPOS_LEAD},eventos(tipo,meta,created_at),negocios(valor,valor_mensal,status)`).in('status', COLUNAS.map(([k]) => k))
    q = gringa ? q.neq('mercado', 'br') : q.eq('mercado', 'br')
    const [rs, ac, ld, f1, f2, f3] = await Promise.all([
      supabase.from('v_resumo').select('envios_hoje_wa,envios_hoje_dm').single(),
      supabase.from('v_acompanhamento').select('*').limit(3000),
      q.order('updated_at', { ascending: false }).order('created_at', { referencedTable: 'eventos', ascending: false }).limit(1, { referencedTable: 'eventos' }).limit(800),
      ...(gringa ? [
        supabase.from('leads').select(`${CAMPOS_LEAD},telefone,created_at`).neq('mercado', 'br').in('status', ['novo', 'na_fila']).order('created_at', { ascending: false }).limit(2000),
        supabase.from('email_envios').select('lead_id,passo,status,enviar_em,enviado_em,erro').in('status', ['pendente', 'enviado', 'erro']).limit(5000),
        supabase.from('supressao').select('whatsapp'),
      ] : [supabase.from('v_fila_hoje').select('*'), supabase.from('v_fila_dm').select('*'), Promise.resolve({ data: [] })]),
    ])
    if (meu !== pedido.current) return // chegou uma resposta mais nova no meio do caminho
    if (ld.error || !ld.data || f1.error || f2.error) return // falha de rede: mantém o que está na tela
    if (gringa) {
      const mapa = {}
      for (const e of f2.data || []) {
        const m = (mapa[e.lead_id] ||= { enviados: 0, prox: null, erro: null })
        if (e.status === 'enviado') m.enviados++
        else if (e.status === 'erro') m.erro = e.erro
        else if (!m.prox || e.passo < m.prox.passo) m.prox = e
      }
      const bloq = new Set((f3.data || []).map((s) => s.whatsapp))
      setBrutos((f1.data || []).filter((l) => !(l.whatsapp && bloq.has(l.whatsapp))))
      setEmails(mapa)
    } else {
      setFila({ ...separarFilas(f1.data || [], f2.data || [], CONFIG.META_DM), gr: [], em: [] })
    }
    setFeitos({ whatsapp: rs.data?.envios_hoje_wa || 0, instagram: rs.data?.envios_hoje_dm || 0 })
    setAcomp(Object.fromEntries((ac.data || []).map((a) => [a.id, a])))
    setLeads(ld.data)
  }, [gringa])
  useEffect(() => { carregar() }, [carregar, versao])

  // Filas de gringo: filtros de país e idioma, e as melhores oportunidades no topo
  useEffect(() => {
    if (!gringa) return
    const novos = brutos.filter((l) => (!gfiltro.qual || l.qualificado) && (gfiltro.pais === 'todos' || l.pais === gfiltro.pais) && (gfiltro.idioma === 'todos' || (l.idioma || 'pt') === gfiltro.idioma))
    const ordem = (a, b) => (pontosGringo(b) - pontosGringo(a)) || (Number(bomHorario(b.fuso)) - Number(bomHorario(a.fuso)))
    setFila({
      wa: [],
      gr: novos.filter(temWhats).sort(ordem),
      dm: novos.filter((l) => l.instagram).sort(ordem),
      em: novos.filter((l) => l.email && l.email_status !== 'invalido').sort((a, b) => (Number(!!emails[a.id]) - Number(!!emails[b.id])) || ordem(a, b)),
    })
  }, [gringa, brutos, gfiltro, emails])

  async function semWhatsapp(lead) {
    setBrutos((b) => b.map((x) => (x.id === lead.id ? { ...x, wa_status: 'sem' } : x)))
    const { error } = await supabase.from('leads').update({ wa_status: 'sem' }).eq('id', lead.id)
    avisar(error ? 'Não consegui marcar. Tente de novo.' : `${lead.nome} saiu do WhatsApp${lead.instagram ? ' e segue no Instagram' : ''}${lead.email ? ' e no e-mail' : ''}.`)
  }
  async function trocarIdioma(lead) {
    const idioma = lead.idioma === 'en' ? 'pt' : 'en'
    setBrutos((b) => b.map((x) => (x.id === lead.id ? { ...x, idioma } : x)))
    const { error } = await supabase.from('leads').update({ idioma }).eq('id', lead.id)
    avisar(error ? 'Não consegui trocar o idioma.' : `${lead.nome}: mensagens em ${idioma === 'en' ? 'inglês' : 'português'}.`)
  }

  const tirarDaFila = (id) => (setBrutos((b) => b.filter((l) => l.id !== id)), setFila((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.filter((l) => l.id !== id)]))))

  async function comecarEmails(lista) {
    const ids = lista.filter((l) => !emails[l.id]).map((l) => l.id)
    if (!ids.length) return avisar('Esses já estão na sequência de e-mail.')
    const r = await iniciarEmails(ids)
    if (!r.ok) return avisar(r.erro || 'Não consegui agendar os e-mails.')
    avisar(`${r.leads} ${r.leads === 1 ? 'lead entrou' : 'leads entraram'} na sequência. O 1º e-mail sai no horário comercial de lá.`)
    carregar()
  }

  // Saindo de "Chamar": tudo que abre janela roda ANTES do primeiro await (o navegador só deixa dentro do gesto)
  async function chamar(lead, de, para, destino) {
    const canal = CHAMAR[de]
    if (CHAMAR[para] && (gringa || para === 'chamar_email')) return avisar('Para mudar de canal, abra o lead.')
    if (CHAMAR[para]) { // trocar de canal
      const novo = CHAMAR[para]
      if (novo === 'instagram' && !lead.instagram) return avisar('Esse negócio não tem Instagram. Cole o @ na ficha do lead.')
      if (novo === 'whatsapp' && !lead.whatsapp) return avisar('Esse negócio não tem WhatsApp.')
      setFila((f) => {
        const sem = { wa: f.wa.filter((l) => l.id !== lead.id), dm: f.dm.filter((l) => l.id !== lead.id) }
        return novo === 'instagram' ? { ...sem, dm: [lead, ...sem.dm] } : { ...sem, wa: [lead, ...sem.wa] }
      })
      return
    }
    if (para === 'perdido') {
      tirarDaFila(lead.id)
      try { await registrarEvento(lead.id, 'perdeu', { motivo: 'descartado no CRM' }); avisar(`${lead.nome} descartado`) } catch { avisar('Não consegui descartar. Tente de novo.'); carregar() }
      return
    }
    if (statusDa(para) !== 'enviado') return avisar('Arraste para “1º contato” para chamar, ou para “Perdido” para descartar.')
    if (canal === 'email') return comecarEmails([lead])
    const etapa = etapaNoCanal('abertura', canal)
    const { modelo, texto } = mensagemPara(mensagens, lead, etapa)
    if (!texto) return avisar('Não há mensagem ativa de abertura. Crie em Mensagens.')
    abrirCanal(canal, lead, texto, destino)
    tirarDaFila(lead.id)
    const agora = new Date().toISOString()
    setLeads((ls) => [{ ...lead, status: 'enviado', updated_at: agora, eventos: [] }, ...ls])
    setAcomp((a) => ({ ...a, [lead.id]: { id: lead.id, status: 'enviado', ultimo_envio: agora, primeiro_envio: agora, total_envios: 1, ultima_etapa: etapa, ultimo_canal: canal, proximo_contato: new Date(Date.now() + 3 * 86400000).toISOString() } }))
    setFeitos((f) => ({ ...f, [canal]: f[canal] + 1 }))
    try {
      await registrarEnvio({ lead, mensagem: modelo, etapa, texto, canal })
      avisar(canal === 'instagram' ? dicaDm(lead) : `Enviado: ${lead.nome}`)
    } catch {
      avisar('Abriu a conversa, mas não registrou o envio. Arraste de novo.')
      carregar()
    }
  }

  // Follow-up direto do card: abre a conversa com o texto certo e registra
  async function mandarFollowup(lead, destino) {
    const a = acomp[lead.id] || {}
    const canal = a.ultimo_canal || canalDe(lead)
    const etapa = etapaNoCanal(etapaFollowup({ ...a, status: lead.status }), canal)
    const { modelo, texto } = mensagemPara(mensagens, lead, etapa)
    if (!texto) return avisar('Não há mensagem ativa para esse follow-up. Crie em Textos das mensagens.')
    abrirCanal(canal, lead, texto, destino)
    try {
      await registrarEnvio({ lead, mensagem: modelo, etapa, texto, canal })
      avisar(canal === 'instagram' ? dicaDm(lead) : `Follow-up enviado: ${lead.nome}`)
      carregar()
    } catch { avisar('Abriu a conversa, mas não registrou. Tente de novo.') }
  }
  const canalDoLead = (lead) => (lead.whatsapp && acomp[lead.id]?.ultimo_canal !== 'instagram' ? 'whatsapp' : lead.instagram ? 'instagram' : lead.email ? 'email' : 'whatsapp')
  const abrirConversa = (lead, destino) => abrirCanal(canalDoLead(lead), lead, '', destino)
  // botões dentro do card não podem iniciar o arrastar
  const parar = (e) => e.stopPropagation()

  async function soltar(lead, para, de) {
    if (CHAMAR[de]) return chamar(lead, de, para)
    if (CHAMAR[para]) return avisar('Quem já foi chamado não volta para a fila.')
    if (para) para = statusDa(para)
    if (!para || para === lead.status) return
    if (para === 'ganho') { abrirLead(lead.id, { pagar: true }); return }
    const antes = lead.status
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status: para, updated_at: new Date().toISOString() } : l)))
    try {
      await moverEtapa(lead.id, para)
      avisar(`${lead.nome} → ${STATUS[para]}`)
    } catch {
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status: antes } : l)))
      avisar('Não consegui mover. Tente de novo.')
    }
  }

  // ── arrastar com ponteiro (mouse, caneta e toque) ──
  const colunaEm = (x, y) => document.elementFromPoint(x, y)?.closest('[data-coluna]')?.dataset.coluna || null

  // handlers estáveis (o mesmo objeto para add/removeEventListener) que chamam a versão mais nova
  const atual = useRef({})
  const ouvintes = useRef(null)
  if (!ouvintes.current) {
    ouvintes.current = {
      move: (e) => atual.current.mover(e),
      // no toque, o navegador pode cancelar o ponteiro ao tentar rolar: aí quem manda é o touchend
      up: (e) => { if (e.type === 'pointercancel' && drag.current?.ativo && drag.current.toque) return; atual.current.fim(e) },
      toque: (e) => {
        const d = drag.current
        if (!d?.ativo) return
        e.preventDefault()
        const t = e.touches[0]
        if (t) atual.current.mover({ clientX: t.clientX, clientY: t.clientY })
      },
      solta: () => { const d = drag.current; if (d?.ativo && d.toque) atual.current.fim({ type: 'pointerup', clientX: d.x, clientY: d.y }) },
    }
  }
  const O = ouvintes.current

  function fim(e) {
    const d = drag.current
    if (!d) return
    clearTimeout(d.timer)
    window.removeEventListener('pointermove', O.move)
    window.removeEventListener('pointerup', O.up)
    window.removeEventListener('pointercancel', O.up)
    document.removeEventListener('touchmove', O.toque)
    document.removeEventListener('touchend', O.solta)
    cancelAnimationFrame(d.raf)
    d.fantasma?.remove()
    if (d.ativo) {
      const para = e.type === 'pointercancel' ? null : colunaEm(e.clientX, e.clientY)
      if (para !== d.de) soltar(d.lead, para, d.de)
    } else if (e.type === 'pointerup' && !d.moveu) {
      abrirLead(d.lead.id)
    }
    drag.current = null
    setArrastando(null); setAlvo(null)
  }

  function ativar(d) {
    d.ativo = true
    const r = d.el.getBoundingClientRect()
    const f = d.el.cloneNode(true)
    f.classList.add('p-fantasma')
    Object.assign(f.style, { width: `${r.width}px`, left: `${r.left}px`, top: `${r.top}px` })
    document.body.appendChild(f)
    d.fantasma = f
    d.dx = d.x - r.left; d.dy = d.y - r.top
    setArrastando(d.lead.id)
    navigator.vibrate?.(12)
    // rolagem automática perto das bordas
    const passo = () => {
      const q = quadro.current
      if (q && d.ativo) {
        const qr = q.getBoundingClientRect()
        if (d.x < qr.left + 50) q.scrollLeft -= 12
        else if (d.x > qr.right - 50) q.scrollLeft += 12
        if (d.y < 70) window.scrollBy(0, -10)
        else if (d.y > window.innerHeight - 70) window.scrollBy(0, 10)
      }
      d.raf = requestAnimationFrame(passo)
    }
    d.raf = requestAnimationFrame(passo)
  }

  function mover(e) {
    const d = drag.current
    if (!d) return
    const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0)
    d.x = e.clientX; d.y = e.clientY
    if (!d.ativo) {
      if (dist > 8) {
        d.moveu = true
        if (d.toque) { clearTimeout(d.timer); fim({ type: 'cancelar' }); return } // era rolagem
        ativar(d)
      } else return
    }
    d.fantasma.style.transform = `translate(${e.clientX - d.dx - parseFloat(d.fantasma.style.left)}px, ${e.clientY - d.dy - parseFloat(d.fantasma.style.top)}px) rotate(2deg)`
    setAlvo(colunaEm(e.clientX, e.clientY))
  }

  function inicio(e, lead, de) {
    if (e.button !== undefined && e.button !== 0) return
    const d = { lead, de, el: e.currentTarget, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, ativo: false, moveu: false, toque: e.pointerType === 'touch' }
    drag.current = d
    window.addEventListener('pointermove', O.move)
    window.addEventListener('pointerup', O.up)
    window.addEventListener('pointercancel', O.up)
    document.addEventListener('touchmove', O.toque, { passive: false })
    document.addEventListener('touchend', O.solta)
    if (d.toque) d.timer = setTimeout(() => { if (drag.current === d && !d.moveu) ativar(d) }, 280)
  }

  atual.current = { mover, fim }

  if (leads === null) return <p className="p-vazio">Carregando…</p>

  const filtro = busca.trim()
  const visiveis = filtro ? leads.filter((l) => bateBusca(l, filtro)) : leads
  const achados = filtro ? visiveis.length + Object.values(fila).reduce((s, l) => s + l.filter((x) => bateBusca(x, filtro)).length, 0) : 0
  const FILAS = gringa
    ? [['chamar_gringa', 'Chamar no WhatsApp', 'gr', null], ['chamar_dm', 'Chamar no Instagram', 'dm', null], ['chamar_email', 'E-mail automático', 'em', null]]
    : [['chamar_wa', 'Chamar no WhatsApp', 'wa', CONFIG.META_WHATS], ['chamar_dm', 'Chamar no Instagram', 'dm', CONFIG.META_DM]]
  const semEmail = fila.em.filter((l) => !emails[l.id])
  const linhaEmail = (l) => {
    const e = emails[l.id]
    if (!e) return null
    if (e.erro && !e.prox) return <span className="crm-email crm-email--erro">E-mail com erro</span>
    if (e.prox) return <span className="crm-email">✉ {e.prox.passo}º e-mail {new Date(e.prox.enviar_em) <= new Date() ? 'na fila de hoje' : `em ${dataDia(e.prox.enviar_em)}`}</span>
    return <span className="crm-email">✉ {e.enviados} e-mail{e.enviados > 1 ? 's' : ''} enviados</span>
  }
  const local = (l) => (gringa && l.fuso ? <span className={`crm-hora ${bomHorario(l.fuso) ? '' : 'crm-hora--fora'}`}>{BANDEIRA[l.pais] || ''} {horaLocal(l.fuso)} lá</span> : null)

  return (
    <section className={`p-crm ${gringa ? 'p-crm--gringa' : ''}`}>
      <div className="p-cab">
        <div>
          <div className="crm-titulo">
            <h1>CRM</h1>
            <div className="crm-pipes" role="tablist" aria-label="Funil">
              <button type="button" role="tab" aria-selected={!gringa} className={`crm-pipe crm-pipe--br ${!gringa ? 'on' : ''}`} onClick={() => setPipe('br')}>Brasil</button>
              <button type="button" role="tab" aria-selected={gringa} className={`crm-pipe crm-pipe--gringa ${gringa ? 'on' : ''}`} onClick={() => setPipe('gringa')}>Gringos <small>EUA · Portugal</small></button>
            </div>
          </div>
          {gringa && (
            <div className="crm-gfiltros" role="group" aria-label="Filtrar gringos">
              {[['todos', 'Todos'], ['US', '🇺🇸 EUA'], ['PT', '🇵🇹 Portugal']].map(([v, t]) => (
                <button key={v} type="button" className={`crm-chip ${gfiltro.pais === v ? 'on' : ''}`} aria-pressed={gfiltro.pais === v} onClick={() => setGfiltro((f) => ({ ...f, pais: v }))}>{t}</button>
              ))}
              <span className="crm-gsep" aria-hidden="true" />
              <button type="button" className={`crm-chip ${gfiltro.qual ? 'on' : ''}`} aria-pressed={gfiltro.qual} onClick={() => setGfiltro((f) => ({ ...f, qual: !f.qual }))}>★ Só qualificados</button>
              <span className="crm-gsep" aria-hidden="true" />
              {[['todos', 'Qualquer idioma'], ['pt', 'Português'], ['en', 'Inglês']].map(([v, t]) => (
                <button key={v} type="button" className={`crm-chip ${gfiltro.idioma === v ? 'on' : ''}`} aria-pressed={gfiltro.idioma === v} onClick={() => setGfiltro((f) => ({ ...f, idioma: v }))}>{t}</button>
              ))}
            </div>
          )}
          <p className="p-sub">{gringa
            ? <>EUA e Portugal, com as <b>melhores oportunidades no topo</b>. Número sem WhatsApp? Toque em <b>Sem Whats</b> e o lead segue no Instagram ou no e-mail. O selo <b>PT/EN</b> no card troca o idioma das mensagens.</>
            : <>Em cada card: <b>Web</b> abre na sua aba do WhatsApp Web, <b>App</b> abre no WhatsApp do computador. Lead respondeu? Clique em <b>Respondeu</b> e a mensagem certa (com o link) aparece pronta para copiar.</>}</p>
        </div>
        <div className="crm-ferr">
          {gringa && <div className="crm-ferr-gringa">
            <button type="button" className="p-btn" onClick={() => setJanela('busca')}>Buscar leads</button>
            <button type="button" className="p-btn" onClick={() => setJanela('email')}>E-mail automático</button>
          </div>}
          <div className="crm-busca">
            <input className="p-busca" type="search" placeholder="Buscar nome, número ou @" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar no CRM por nome, número ou @" />
            {filtro && <small>{achados ? `${achados} encontrado${achados > 1 ? 's' : ''}` : 'Ninguém com esse nome ou número'}</small>}
          </div>
          <DestinoWa rotulo="Ao arrastar, abrir no" />
        </div>
      </div>

      <div className="p-quadro" ref={quadro}>
        {FILAS.map(([col, nome, k, meta]) => {
          const canal = CHAMAR[col]
          const lista = fila[k].filter((l) => bateBusca(l, filtro))
          const mostrar = lista.slice(0, VISIVEIS + extra[k])
          const bateu = meta && feitos[canal] >= meta
          return (
            <div key={col} className={`p-col p-col--chamar p-col--${col} ${alvo === col && arrastando ? 'alvo' : ''}`} data-coluna={col}>
              <h2><span>{nome}</span><b>{lista.length}</b></h2>
              {meta ? <p className={`p-col-meta ${bateu ? 'feita' : ''}`}>Hoje {feitos[canal]}/{meta}{bateu ? ' · meta batida' : ''}</p>
                : col === 'chamar_email' ? (
                  <p className="p-col-meta">
                    {semEmail.length ? <button type="button" className="crm-btn crm-btn--forte" onClick={() => comecarEmails(semEmail)}>Começar e-mails para {semEmail.length}</button> : 'Todos com e-mail já estão na sequência'}
                  </p>
                ) : <p className="p-col-meta">Melhores oportunidades primeiro</p>}
              <div className="p-col-cards">
                {mostrar.map((l) => (
                  <div key={l.id} className={`p-card p-card--chamar ${arrastando === l.id ? 'saindo' : ''}`} role="button" tabIndex={0}
                    onPointerDown={(e) => inicio(e, l, col)} onContextMenu={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') abrirLead(l.id) }}
                    aria-label={`${l.nome}, ainda não chamado. Enter abre o lead.`}>
                    <strong>{gringa && pontosGringo(l) >= TOP && <span className="crm-top" title="Boa oportunidade">Top</span>}{l.nome}</strong>
                    {gringa && l.nota != null && <small className="crm-nota">★ {String(l.nota).replace('.', ',')}{l.avaliacoes ? ` · ${l.avaliacoes} avaliações` : ''}</small>}
                    <small>{[l.categoria || l.nicho, gringa ? l.cidade : l.bairro].filter(Boolean).join(' · ')}</small>
                    {local(l)}
                    <span className={`p-card-canal p-card-canal--${canal}`}>{canal === 'instagram' ? l.instagram : canal === 'email' ? l.email : gringa ? `+${l.whatsapp}` : formatTel(l.whatsapp)}</span>
                    <em>{l.tipo_site === 'site_ok' ? 'Tem site' : l.tipo_site === 'site_falso' ? 'Link fraco' : 'Sem site'}{l.avaliacoes ? ` · ${l.avaliacoes} avaliações` : ''}{gringa && canal === 'whatsapp' && l.email ? ' · tem e-mail' : ''}</em>
                    {linhaEmail(l)}
                    <span className="crm-botoes" onPointerDown={parar}>
                      {gringa && <button type="button" className="crm-idioma" title="Trocar o idioma das mensagens" onClick={(e) => { parar(e); trocarIdioma(l) }}>{l.idioma === 'en' ? 'EN' : 'PT'}</button>}
                      {canal === 'email' ? (
                        emails[l.id] ? null : <button type="button" className="crm-btn crm-btn--forte" onClick={(e) => { parar(e); comecarEmails([l]) }}>Começar e-mails</button>
                      ) : canal === 'whatsapp' ? <>
                        {gringa && <button type="button" className="crm-btn crm-btn--leve" onClick={(e) => { parar(e); semWhatsapp(l) }}>Sem Whats</button>}
                        <span className="crm-rot">1ª mensagem:</span>
                        <button type="button" className="crm-btn crm-btn--forte" onClick={(e) => { parar(e); chamar(l, col, 'enviado', 'web') }}>Web</button>
                        <button type="button" className="crm-btn" onClick={(e) => { parar(e); chamar(l, col, 'enviado', 'app') }}>App</button>
                      </> : (
                        <button type="button" className="crm-btn crm-btn--forte" onClick={(e) => { parar(e); chamar(l, col, 'enviado') }}>Copiar e abrir DM</button>
                      )}
                    </span>
                  </div>
                ))}
                {mostrar.length === 0 && (
                  <p className="p-col-vazia">{canal === 'instagram' ? 'Ninguém com Instagram na fila' : gringa ? 'Fila vazia: clique em “Buscar leads”' : 'Fila vazia'}</p>
                )}
                {lista.length > mostrar.length && (
                  <button className="p-col-mais p-col-mais--btn" onClick={() => setExtra((x) => ({ ...x, [k]: x[k] + 40 }))}>
                    Mostrar mais ({lista.length - mostrar.length} restantes)
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {QUADRO.map(([col, nome]) => {
          let daColuna = visiveis.filter((l) => colunaDo(l, acomp[l.id]) === col)
          const comDias = statusDa(col) === 'enviado' || col === 'abriu'
          const paraHoje = comDias ? daColuna.filter((l) => grupoEnviado(acomp[l.id]) === 'fup').length : 0
          if (comDias) {
            const ordem = Object.fromEntries(GRUPO_ENVIADO.map(([g], i) => [g, i]))
            daColuna = [...daColuna].sort((a, b) => (ordem[grupoEnviado(acomp[a.id])] - ordem[grupoEnviado(acomp[b.id])])
              || String(acomp[b.id]?.ultimo_envio || '').localeCompare(String(acomp[a.id]?.ultimo_envio || '')))
          }
          const soma = col === 'ganho' || col === 'recorrente'
            ? daColuna.reduce((s, l) => s + (l.negocios || []).filter((n) => n.status === 'ganho').reduce((a, n) => a + Number(n.valor || 0), 0), 0) : 0
          return (
            <div key={col} className={`p-col p-col--${statusDa(col)} p-col--${col} ${alvo === col && arrastando ? 'alvo' : ''}`} data-coluna={col}>
              <h2><span>{nome}</span><b>{daColuna.length}</b></h2>
              {soma > 0 && <p className="p-col-soma">{brl(soma)} fechados</p>}
              {paraHoje > 0 && <p className="p-col-meta p-col-meta--hoje">{paraHoje} para mandar hoje</p>}
              <div className="p-col-cards">
                {daColuna.slice(0, POR_COLUNA).map((l, i, arr) => {
                  const ev = l.eventos?.[0]
                  const a = acomp[l.id]
                  const g = comDias ? grupoEnviado(a) : null
                  const novoGrupo = comDias && (i === 0 || grupoEnviado(acomp[arr[i - 1].id]) !== g)
                  const nGrupo = novoGrupo ? daColuna.filter((x) => grupoEnviado(acomp[x.id]) === g).length : 0
                  const prox = a ? proximoPasso({ ...a, status: l.status }) : null
                  return (
                    <div key={l.id} className="crm-item">
                    {novoGrupo && <p className={`crm-grupo crm-grupo--${g}`}>{GRUPO_ENVIADO.find(([k]) => k === g)[1]} <b>{nGrupo}</b></p>}
                    <div className={`p-card ${g === 'fup' ? 'p-card--fup' : ''} ${arrastando === l.id ? 'saindo' : ''}`} role="button" tabIndex={0}
                      onPointerDown={(e) => inicio(e, l, l.status)} onContextMenu={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') abrirLead(l.id) }}
                      aria-label={`${l.nome}, ${STATUS[l.status]}. Enter abre o lead.`}>
                      <strong>{l.nome}</strong>
                      {!a && <small>{[l.nicho, gringa ? l.cidade : l.bairro].filter(Boolean).join(' · ')}</small>}
                      {local(l)}
                      {ev && (
                        <span className={`p-card-ev ev-${ev.tipo}`}>
                          {EVENTOS[ev.tipo] || ev.tipo}{ev.meta?.resumo ? `: “${ev.meta.resumo}”` : ''}
                        </span>
                      )}
                      {a ? (
                        <span className="crm-dias">
                          {(a.total_envios || 0) <= 1 ? '1ª msg' : `${a.total_envios} msgs`} {haDias(a.ultimo_envio)}{a.ultimo_canal === 'instagram' ? ' · DM' : a.ultimo_canal === 'email' ? ' · e-mail' : ''}
                          {prox && !prox.fim && a.ultimo_canal !== 'email' && !['ganho', 'recorrente', 'perdido'].includes(col) && (
                            <b className={prox.urgente ? 'crm-prox--hoje' : ''}> → {prox.txt.toLowerCase()} {prox.quando.replace(/ \(.*\)$/, '')}</b>
                          )}
                        </span>
                      ) : <em>há {tempoAtras(l.updated_at)}</em>}
                      {gringa && linhaEmail(l)}
                      {['enviado', 'abriu', 'respondeu', 'proposta'].includes(statusDa(col)) && (l.whatsapp || l.instagram || l.email) && (
                        <span className="crm-botoes" onPointerDown={parar}>
                          {canalDoLead(l) === 'email' ? (
                            <a className="crm-btn" href={`mailto:${l.email}`} onClick={parar}>Abrir e-mail</a>
                          ) : canalDoLead(l) === 'whatsapp' ? <>
                            <span className="crm-rot">{g === 'fup' ? 'Follow-up:' : 'Conversa:'}</span>
                            <button type="button" className={`crm-btn ${g === 'fup' ? 'crm-btn--forte' : ''}`} onClick={(e) => { parar(e); g === 'fup' ? mandarFollowup(l, 'web') : abrirConversa(l, 'web') }}>Web</button>
                            <button type="button" className="crm-btn" onClick={(e) => { parar(e); g === 'fup' ? mandarFollowup(l, 'app') : abrirConversa(l, 'app') }}>App</button>
                          </> : (
                            <button type="button" className={`crm-btn ${g === 'fup' ? 'crm-btn--forte' : ''}`} onClick={(e) => { parar(e); g === 'fup' ? mandarFollowup(l) : abrirConversa(l) }}>{g === 'fup' ? 'Follow-up na DM' : 'Abrir DM'}</button>
                          )}
                          <button type="button" className={`crm-btn crm-btn--resp ${col === 'respondeu' ? 'crm-btn--forte' : ''}`} onClick={(e) => { parar(e); setResponder({ lead: l, canal: canalDoLead(l) }) }}>
                            {col === 'respondeu' ? 'Mandar link / responder' : 'Respondeu'}
                          </button>
                        </span>
                      )}
                    </div>
                    </div>
                  )
                })}
                {daColuna.length > POR_COLUNA && <p className="p-col-mais">+ {daColuna.length - POR_COLUNA} (use a busca)</p>}
                {daColuna.length === 0 && <p className="p-col-vazia">Solte aqui</p>}
              </div>
            </div>
          )
        })}
      </div>
      {responder && <Responder lead={responder.lead} canal={responder.canal} fechar={() => setResponder(null)} depois={carregar} />}
      {janela === 'busca' && <JanelaBusca fechar={() => setJanela(null)} depois={carregar} />}
      {janela === 'email' && <JanelaEmail fechar={() => setJanela(null)} />}
    </section>
  )
}
