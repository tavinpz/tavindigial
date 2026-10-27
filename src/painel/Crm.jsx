import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG, brl } from '../config'
import { formatTel } from '../lib/msg'
import { COLUNAS, EVENTOS, STATUS, moverEtapa, registrarEnvio, registrarEvento, tempoAtras } from './api'
import { usePainel } from './Painel'
import { abrirCanal, etapaNoCanal, mensagemPara, separarFilas } from './envio'

// Colunas de quem ainda não foi chamado: arrastar para "Enviado" já abre a conversa com o texto pronto
const CHAMAR = { chamar_wa: 'whatsapp', chamar_dm: 'instagram' }

const POR_COLUNA = 60

// Quadro arrastável: segure e arraste (no celular, toque longo). Toque rápido abre o lead.
export default function Crm() {
  const { abrirLead, avisar, versao, mensagens } = usePainel()
  const [leads, setLeads] = useState(null)
  const [fila, setFila] = useState({ wa: [], dm: [] })
  const [feitos, setFeitos] = useState({ whatsapp: 0, instagram: 0 })
  const [extra, setExtra] = useState({ wa: 0, dm: 0 })
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState(null)
  const [arrastando, setArrastando] = useState(null)
  const quadro = useRef(null)
  const drag = useRef(null)

  const carregar = useCallback(async () => {
    const [fw, fd, rs] = await Promise.all([
      supabase.from('v_fila_hoje').select('*'),
      supabase.from('v_fila_dm').select('*'),
      supabase.from('v_resumo').select('envios_hoje_wa,envios_hoje_dm').single(),
    ])
    setFila(separarFilas(fw.data || [], fd.data || [], CONFIG.META_DM))
    setFeitos({ whatsapp: rs.data?.envios_hoje_wa || 0, instagram: rs.data?.envios_hoje_dm || 0 })
    const { data } = await supabase
      .from('leads')
      .select('id,nome,status,bairro,nicho,tipo_site,updated_at,proximo_contato,eventos(tipo,meta,created_at),negocios(valor,valor_mensal,status)')
      .in('status', COLUNAS.map(([k]) => k))
      .order('updated_at', { ascending: false })
      .order('created_at', { referencedTable: 'eventos', ascending: false })
      .limit(1, { referencedTable: 'eventos' })
      .limit(800)
    setLeads(data || [])
  }, [])
  useEffect(() => { carregar() }, [carregar, versao])

  const tirarDaFila = (id) => setFila((f) => ({ wa: f.wa.filter((l) => l.id !== id), dm: f.dm.filter((l) => l.id !== id) }))

  // Saindo de "Chamar": tudo que abre janela roda ANTES do primeiro await (o navegador só deixa dentro do gesto)
  async function chamar(lead, de, para) {
    const canal = CHAMAR[de]
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
    if (para !== 'enviado') return avisar('Arraste para “Enviado” para chamar, ou para “Perdido” para descartar.')
    const etapa = etapaNoCanal('abertura', canal)
    const { modelo, texto } = mensagemPara(mensagens, lead, etapa)
    if (!texto) return avisar('Não há mensagem ativa de abertura. Crie em Mensagens.')
    abrirCanal(canal, lead, texto)
    tirarDaFila(lead.id)
    setLeads((ls) => [{ ...lead, status: 'enviado', updated_at: new Date().toISOString(), eventos: [] }, ...ls])
    setFeitos((f) => ({ ...f, [canal]: f[canal] + 1 }))
    try {
      await registrarEnvio({ lead, mensagem: modelo, etapa, texto, canal })
      avisar(canal === 'instagram' ? `Texto copiado. Cole na DM de ${lead.instagram}` : `Enviado: ${lead.nome}`)
    } catch {
      avisar('Abriu a conversa, mas não registrou o envio. Arraste de novo.')
      carregar()
    }
  }

  async function soltar(lead, para, de) {
    if (CHAMAR[de]) return chamar(lead, de, para)
    if (CHAMAR[para]) return avisar('Quem já foi chamado não volta para a fila.')
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

  const filtro = busca.trim().toLowerCase()
  const visiveis = filtro ? leads.filter((l) => l.nome.toLowerCase().includes(filtro)) : leads

  return (
    <section className="p-crm">
      <div className="p-cab">
        <div>
          <h1>CRM</h1>
          <p className="p-sub">Arraste de “Chamar” para “Enviado” e a conversa abre com a mensagem pronta (na DM, o texto já vai copiado: é só colar). No celular, segure o card um instante antes de arrastar.</p>
        </div>
        <input className="p-busca" type="search" placeholder="Buscar negócio" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar no CRM" />
      </div>

      <div className="p-quadro" ref={quadro}>
        {[['chamar_wa', 'Chamar no WhatsApp', 'wa', CONFIG.META_WHATS], ['chamar_dm', 'Chamar no Instagram', 'dm', CONFIG.META_DM]].map(([col, nome, k, meta]) => {
          const canal = CHAMAR[col]
          const falta = Math.max(0, meta - feitos[canal]) + extra[k]
          const lista = fila[k].filter((l) => !filtro || l.nome.toLowerCase().includes(filtro))
          const mostrar = lista.slice(0, falta)
          return (
            <div key={col} className={`p-col p-col--chamar p-col--${col} ${alvo === col && arrastando ? 'alvo' : ''}`} data-coluna={col}>
              <h2><span>{nome}</span><b>{feitos[canal]}/{meta}</b></h2>
              <div className="p-col-cards">
                {mostrar.map((l) => (
                  <div key={l.id} className={`p-card p-card--chamar ${arrastando === l.id ? 'saindo' : ''}`} role="button" tabIndex={0}
                    onPointerDown={(e) => inicio(e, l, col)} onContextMenu={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') abrirLead(l.id) }}
                    aria-label={`${l.nome}, ainda não chamado. Enter abre o lead.`}>
                    <strong>{l.nome}</strong>
                    <small>{[l.nicho || l.categoria, l.bairro].filter(Boolean).join(' · ')}</small>
                    <span className={`p-card-canal p-card-canal--${canal}`}>{canal === 'instagram' ? l.instagram : formatTel(l.whatsapp)}</span>
                    <em>{l.tipo_site === 'site_falso' ? 'Link fraco' : 'Sem site'}{l.avaliacoes ? ` · ${l.avaliacoes} avaliações` : ''}</em>
                  </div>
                ))}
                {mostrar.length === 0 && (
                  <p className="p-col-vazia">{lista.length ? 'Meta do dia batida' : canal === 'instagram' ? 'Ninguém com Instagram na fila' : 'Fila vazia'}</p>
                )}
                {lista.length > mostrar.length && (
                  <button className="p-col-mais p-col-mais--btn" onClick={() => setExtra((x) => ({ ...x, [k]: x[k] + 5 }))}>
                    Mostrar mais 5 ({lista.length - mostrar.length} na fila)
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {COLUNAS.map(([col, nome]) => {
          const daColuna = visiveis.filter((l) => l.status === col)
          const soma = col === 'ganho' || col === 'recorrente'
            ? daColuna.reduce((s, l) => s + (l.negocios || []).filter((n) => n.status === 'ganho').reduce((a, n) => a + Number(n.valor || 0), 0), 0) : 0
          return (
            <div key={col} className={`p-col p-col--${col} ${alvo === col && arrastando ? 'alvo' : ''}`} data-coluna={col}>
              <h2><span>{nome}</span><b>{daColuna.length}</b></h2>
              {soma > 0 && <p className="p-col-soma">{brl(soma)} fechados</p>}
              <div className="p-col-cards">
                {daColuna.slice(0, POR_COLUNA).map((l) => {
                  const ev = l.eventos?.[0]
                  return (
                    <div key={l.id} className={`p-card ${arrastando === l.id ? 'saindo' : ''}`} role="button" tabIndex={0}
                      onPointerDown={(e) => inicio(e, l, l.status)} onContextMenu={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') abrirLead(l.id) }}
                      aria-label={`${l.nome}, ${STATUS[l.status]}. Enter abre o lead.`}>
                      <strong>{l.nome}</strong>
                      <small>{[l.nicho, l.bairro].filter(Boolean).join(' · ')}</small>
                      {ev && (
                        <span className={`p-card-ev ev-${ev.tipo}`}>
                          {EVENTOS[ev.tipo] || ev.tipo}{ev.meta?.resumo ? `: “${ev.meta.resumo}”` : ''}
                        </span>
                      )}
                      <em>há {tempoAtras(l.updated_at)}</em>
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
    </section>
  )
}
