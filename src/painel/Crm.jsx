import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../config'
import { COLUNAS, EVENTOS, STATUS, moverEtapa, tempoAtras } from './api'
import { usePainel } from './Painel'

const POR_COLUNA = 60

// Quadro arrastável: segure e arraste (no celular, toque longo). Toque rápido abre o lead.
export default function Crm() {
  const { abrirLead, avisar, versao } = usePainel()
  const [leads, setLeads] = useState(null)
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState(null)
  const [arrastando, setArrastando] = useState(null)
  const quadro = useRef(null)
  const drag = useRef(null)

  const carregar = useCallback(async () => {
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

  async function soltar(lead, para) {
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
      soltar(d.lead, para)
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

  function inicio(e, lead) {
    if (e.button !== undefined && e.button !== 0) return
    const d = { lead, el: e.currentTarget, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, ativo: false, moveu: false, toque: e.pointerType === 'touch' }
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
          <p className="p-sub">Arraste o card para mudar de etapa. No celular, segure o card um instante antes de arrastar. Toque rápido abre o lead.</p>
        </div>
        <input className="p-busca" type="search" placeholder="Buscar negócio" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar no CRM" />
      </div>

      <div className="p-quadro" ref={quadro}>
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
                      onPointerDown={(e) => inicio(e, l)} onContextMenu={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') abrirLead(l.id) }}
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
