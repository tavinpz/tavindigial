import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { CANAIS } from './canais'

// Calendário do mês: tudo o que está programado (e o que já saiu) em todos os canais e redes.
// Página "Calendário" no menu, ou janela aberta pelo botão "Calendário" no topo de cada canal (já filtrada nele).
const FUSO = 'America/Sao_Paulo'
const REDES = { ig: 'Reels', story: 'Stories', yt: 'YouTube', tt: 'TikTok', post: 'Post' }
const SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const diaSP = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
const horaSP = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const canalDe = (id) => CANAIS.find((c) => c.id === id)

function eventos(videos, conteudo) {
  const ev = []
  const add = (v, rede, quando, feito, extra = {}) => quando && ev.push({ id: `${v.id}-${rede}`, canal: v.canal, rede, quando, feito, titulo: v.yt_titulo || v.titulo || v.id, capa: v.capa_url, ...extra })
  for (const v of videos) {
    if (v.ig_status === 'publicado') add(v, 'ig', v.ig_postado_em, true, { soReels: v.ig_feed === false })
    else if (['agendado', 'programado', 'processando'].includes(v.ig_status)) add(v, 'ig', v.ig_agendado_para, false, { soReels: v.ig_feed === false, auto: v.ig_status !== 'programado', erro: null })
    else if (v.ig_status === 'erro' && v.ig_agendado_para) add(v, 'ig', v.ig_agendado_para, false, { erro: v.ig_erro || 'erro' })
    if (v.ig_story) {
      if (v.ig_story_status === 'publicado') add(v, 'story', v.ig_story_postado_em, true)
      else if (v.ig_story_para) add(v, 'story', v.ig_story_para, false, { erro: v.ig_story_status === 'erro' ? v.ig_story_erro : null, auto: true })
    }
    if (v.yt_status === 'postado') add(v, 'yt', v.yt_postado_em, true)
    else if (v.yt_status === 'programado') add(v, 'yt', v.yt_programado_para, false)
    if (v.tt_status === 'postado') add(v, 'tt', v.tt_postado_em, true)
    else if (v.tt_status === 'programado') add(v, 'tt', v.tt_programado_para, false)
  }
  for (const c of conteudo) {
    const base = { id: c.id, canal: 'tavin-digital', titulo: c.titulo || c.formato, capa_url: null }
    if (c.status === 'publicado') add(base, 'post', c.publicado_em, true, { formato: c.formato })
    else if (['agendado', 'publicando'].includes(c.status)) add(base, 'post', c.agendado_para, false, { formato: c.formato, auto: true })
  }
  return ev.sort((a, b) => a.quando.localeCompare(b.quando))
}

function Item({ e, compacto }) {
  const c = canalDe(e.canal)
  return (
    <li className={`cal-item cal-item--${e.rede} ${e.feito ? 'feito' : ''} ${e.erro ? 'erro' : ''}`} style={{ '--c': c?.cor || '#999' }}
      title={`${horaSP(e.quando)} · ${c?.nome || e.canal} · ${REDES[e.rede]}${e.soReels ? ' (fora do feed)' : ''}${e.feito ? ' · saiu' : e.auto ? ' · sai sozinho' : ''}${e.erro ? ` · erro: ${e.erro}` : ''}\n${e.titulo}`}>
      <span className="cal-hora">{horaSP(e.quando)}</span>
      {c?.logo ? <img src={c.logo} alt="" /> : <i className="cal-sigla">{c?.sigla || '?'}</i>}
      <span className="cal-rede">{REDES[e.rede]}{e.feito ? ' ✓' : ''}</span>
      {!compacto && <span className="cal-tit">{e.titulo}{e.soReels ? ' · fora do feed' : ''}</span>}
    </li>
  )
}

export function CalendarioConteudo({ canalFixo }) {
  const hoje = diaSP(new Date().toISOString())
  const [mes, setMes] = useState(hoje.slice(0, 7))
  const [rede, setRede] = useState('')
  const [canal, setCanal] = useState(canalFixo || '')
  const [dados, setDados] = useState(null)
  const [dia, setDia] = useState(hoje)

  useEffect(() => {
    Promise.all([
      supabase.from('videos').select('id,canal,titulo,yt_titulo,capa_url,ig_status,ig_agendado_para,ig_postado_em,ig_feed,ig_erro,ig_story,ig_story_para,ig_story_status,ig_story_postado_em,ig_story_erro,yt_status,yt_programado_para,yt_postado_em,tt_status,tt_programado_para,tt_postado_em'),
      supabase.from('conteudo').select('id,titulo,formato,status,agendado_para,publicado_em'),
    ]).then(([v, c]) => setDados(eventos(v.data || [], c.data || [])))
  }, [])

  const filtrados = useMemo(() => (dados || []).filter((e) => (!rede || e.rede === rede || (rede === 'ig' && e.rede === 'post')) && (!canal || e.canal === canal)), [dados, rede, canal])
  const porDia = useMemo(() => filtrados.reduce((m, e) => { const k = diaSP(e.quando); (m[k] ||= []).push(e); return m }, {}), [filtrados])

  const [a, m] = mes.split('-').map(Number)
  const primeiro = new Date(Date.UTC(a, m - 1, 1, 12))
  const inicio = (primeiro.getUTCDay() + 6) % 7
  const diasMes = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const celulas = Array.from({ length: Math.ceil((inicio + diasMes) / 7) * 7 }, (_, i) => {
    const d = i - inicio + 1
    return d >= 1 && d <= diasMes ? `${mes}-${String(d).padStart(2, '0')}` : null
  })
  const mudar = (n) => { const d = new Date(Date.UTC(a, m - 1 + n, 1)); setMes(d.toISOString().slice(0, 7)) }
  const nomeMes = maiuscula(primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }))
  const doMes = filtrados.filter((e) => diaSP(e.quando).startsWith(mes))
  const doDia = porDia[dia] || []
  const canaisComEvento = [...new Set((dados || []).map((e) => e.canal))]

  return (
    <div className="cal">
      <div className="cal-barra">
        <div className="cal-nav">
          <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => mudar(-1)} aria-label="Mês anterior">‹</button>
          <h2>{nomeMes}</h2>
          <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => mudar(1)} aria-label="Próximo mês">›</button>
          {mes !== hoje.slice(0, 7) && <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => { setMes(hoje.slice(0, 7)); setDia(hoje) }}>Hoje</button>}
        </div>
        <div className="cal-filtros">
          <div className="mc-periodo" role="group" aria-label="Rede">
            {[['', 'Tudo'], ['ig', 'Instagram'], ['story', 'Stories'], ['yt', 'YouTube'], ['tt', 'TikTok']].map(([k, r]) => (
              <button key={k} type="button" className={rede === k ? 'on' : ''} aria-pressed={rede === k} onClick={() => setRede(k)}>{r}</button>
            ))}
          </div>
          {!canalFixo && (
            <select value={canal} onChange={(e) => setCanal(e.target.value)} aria-label="Canal">
              <option value="">Todos os canais</option>
              {CANAIS.filter((c) => canaisComEvento.includes(c.id)).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          )}
        </div>
      </div>
      <p className="cal-resumo">{dados ? `${doMes.length} ${doMes.length === 1 ? 'publicação' : 'publicações'} no mês · ${doMes.filter((e) => e.feito).length} já ${doMes.filter((e) => e.feito).length === 1 ? 'saiu' : 'saíram'} · ${doMes.filter((e) => !e.feito && e.auto).length} programadas para sair sozinhas` : 'Carregando…'}</p>

      <div className="cal-corpo">
        <div className="cal-grade" role="grid" aria-label={`Calendário de ${nomeMes}`}>
          {SEMANA.map((s) => <div key={s} className="cal-sem" role="columnheader">{s}</div>)}
          {celulas.map((k, i) => k ? (
            <button key={k} type="button" role="gridcell" className={`cal-dia ${k === hoje ? 'hoje' : ''} ${k === dia ? 'sel' : ''} ${k < hoje ? 'passado' : ''}`} onClick={() => setDia(k)} aria-label={`${k.split('-')[2]}: ${(porDia[k] || []).length} publicações`}>
              <span className="cal-num">{Number(k.split('-')[2])}</span>
              <ul>{(porDia[k] || []).slice(0, 4).map((e) => <Item key={e.id} e={e} compacto />)}</ul>
              {(porDia[k] || []).length > 4 && <span className="cal-mais">+{porDia[k].length - 4}</span>}
            </button>
          ) : <div key={`v${i}`} className="cal-dia cal-dia--vazio" />)}
        </div>

        <aside className="cal-lado">
          <h3>{maiuscula(new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
          {doDia.length ? <ul className="cal-lista">{doDia.map((e) => <Item key={e.id} e={e} />)}</ul> : <p className="cal-nada">Nada programado neste dia.</p>}
        </aside>
      </div>
    </div>
  )
}

// janela aberta pelo botão "Calendário" no topo do canal
export function JanelaCalendario({ canal, fechar }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', esc)
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = o }
  }, [fechar])
  return createPortal(
    <div className="mt-fundo" onClick={fechar}>
      <div className="mt-janela cal-janela" role="dialog" aria-modal="true" aria-label={`Calendário de ${canal.nome}`} onClick={(e) => e.stopPropagation()}>
        <div className="cal-janela-cab"><h2>Calendário · {canal.nome}</h2><button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={fechar}>Fechar</button></div>
        <CalendarioConteudo canalFixo={canal.id} />
      </div>
    </div>, document.body)
}

export default function Calendario() {
  return (
    <section className="cal-pagina">
      <div className="p-cab"><div><h1>Calendário</h1><p className="p-sub">Tudo o que está programado e o que já saiu, em todos os canais e redes.</p></div></div>
      <CalendarioConteudo />
    </section>
  )
}
