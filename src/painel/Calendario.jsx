import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Calendário do canal: o que está programado e o que já saiu, mês a mês, dentro da página de cada canal.
// Clique num dia para ver tudo daquele dia e programar um vídeo pronto para ele.
const FUSO = 'America/Sao_Paulo'
const REDES = {
  ig: { nome: 'Reels', cor: '#D62F8C' },
  story: { nome: 'Stories', cor: '#F28C28' },
  yt: { nome: 'YouTube', cor: '#E02424' },
  tt: { nome: 'TikTok', cor: '#16131A' },
  post: { nome: 'Post', cor: '#7A3FF2' },
}
const SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HORAS = ['07:30', '09:00', '12:00', '17:30', '19:00', '21:00']
const diaSP = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
const horaSP = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const somaDias = (dia, n) => { const d = new Date(`${dia}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
// dia (AAAA-MM-DD) + hora de Brasília → ISO
const isoSP = (dia, hora) => new Date(`${dia}T${hora}:00-03:00`).toISOString()

function eventos(videos, conteudo) {
  const ev = []
  const add = (v, rede, quando, feito, extra = {}) => quando && ev.push({ id: `${v.id}-${rede}`, rede, quando, feito, titulo: v.yt_titulo || v.titulo || v.id, capa: v.capa_url, ...extra })
  for (const v of videos) {
    if (v.ig_status === 'publicado') add(v, 'ig', v.ig_postado_em, true, { soReels: v.ig_feed === false })
    else if (['agendado', 'programado', 'processando'].includes(v.ig_status)) add(v, 'ig', v.ig_agendado_para, false, { soReels: v.ig_feed === false, auto: v.ig_status !== 'programado' })
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
    const base = { id: c.id, titulo: c.titulo || c.formato, capa_url: null }
    if (c.status === 'publicado') add(base, 'post', c.publicado_em, true, { formato: c.formato })
    else if (['agendado', 'publicando'].includes(c.status)) add(base, 'post', c.agendado_para, false, { formato: c.formato, auto: true })
  }
  return ev.sort((a, b) => a.quando.localeCompare(b.quando))
}

function Item({ e, completo }) {
  const r = REDES[e.rede]
  const estado = e.erro ? `erro: ${e.erro}` : e.feito ? 'saiu' : e.auto ? 'sai sozinho' : 'programado (você posta)'
  return (
    <li className={`cal-item ${e.feito ? 'feito' : ''} ${e.erro ? 'erro' : ''}`} style={{ '--c': r.cor }} title={`${horaSP(e.quando)} · ${r.nome}${e.soReels ? ' (fora do feed)' : ''} · ${estado}\n${e.titulo}`}>
      <span className="cal-hora">{horaSP(e.quando)}</span>
      <span className="cal-rede">{r.nome}{e.feito ? ' ✓' : e.erro ? ' !' : ''}</span>
      {completo && <>
        {e.capa && <img src={e.capa} alt="" loading="lazy" />}
        <span className="cal-tit">{e.titulo}</span>
        <small className="cal-estado">{estado}{e.soReels ? ' · fora do feed' : ''}</small>
      </>}
    </li>
  )
}

// Programar um vídeo pronto num dia escolhido
function Programar({ dia, itens, programar, depois }) {
  const [sel, setSel] = useState(itens[0]?.chave || '')
  const [hora, setHora] = useState('12:00')
  const [indo, setIndo] = useState(false)
  useEffect(() => { if (!itens.some((i) => i.chave === sel)) setSel(itens[0]?.chave || '') }, [itens, sel])
  if (!itens.length) return <p className="cal-nada">Nenhum vídeo pronto para programar. Suba um vídeo ou termine os que estão em produção.</p>
  const quando = isoSP(dia, hora)
  const passou = new Date(quando).getTime() < Date.now()
  async function ir() {
    const item = itens.find((i) => i.chave === sel)
    if (!item) return
    setIndo(true)
    await programar([{ item, quando }])
    setIndo(false)
    depois()
  }
  return (
    <div className="cal-prog">
      <label className="cal-prog-campo">
        <span>Vídeo</span>
        <select value={sel} onChange={(e) => setSel(e.target.value)}>
          {itens.map((i) => <option key={i.chave} value={i.chave}>{i.num ? `${i.num} · ` : ''}{i.titulo}</option>)}
        </select>
      </label>
      <div className="cal-prog-campo">
        <span>Horário (Brasília)</span>
        <div className="cal-horas" role="group" aria-label="Horário">
          {HORAS.map((h) => <button key={h} type="button" className={hora === h ? 'on' : ''} aria-pressed={hora === h} onClick={() => setHora(h)}>{h}</button>)}
          <input type="time" value={hora} onChange={(e) => e.target.value && setHora(e.target.value)} aria-label="Outro horário" />
        </div>
      </div>
      <button type="button" className="p-btn p-btn--forte" disabled={indo || passou || !sel} onClick={ir}>
        {indo ? 'Programando…' : passou ? 'Esse horário já passou' : `Programar para ${dia.split('-').reverse().slice(0, 2).join('/')} às ${hora}`}
      </button>
    </div>
  )
}

export function CalendarioConteudo({ canal, itens = [], programar }) {
  const hoje = diaSP(new Date().toISOString())
  const [mes, setMes] = useState(hoje.slice(0, 7))
  const [rede, setRede] = useState('')
  const [dados, setDados] = useState(null)
  const [dia, setDia] = useState(hoje)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    Promise.all([
      supabase.from('videos').select('id,canal,titulo,yt_titulo,capa_url,ig_status,ig_agendado_para,ig_postado_em,ig_feed,ig_erro,ig_story,ig_story_para,ig_story_status,ig_story_postado_em,ig_story_erro,yt_status,yt_programado_para,yt_postado_em,tt_status,tt_programado_para,tt_postado_em').eq('canal', canal.id),
      canal.id === 'tavin-digital' ? supabase.from('conteudo').select('id,titulo,formato,status,agendado_para,publicado_em') : Promise.resolve({ data: [] }),
    ]).then(([v, c]) => setDados(eventos(v.data || [], c.data || [])))
  }, [canal.id, versao, itens])

  const filtrados = useMemo(() => (dados || []).filter((e) => !rede || e.rede === rede || (rede === 'ig' && e.rede === 'post')), [dados, rede])
  const porDia = useMemo(() => filtrados.reduce((m, e) => { const k = diaSP(e.quando); (m[k] ||= []).push(e); return m }, {}), [filtrados])
  const redesUsadas = useMemo(() => new Set((dados || []).map((e) => e.rede)), [dados])

  const [a, m] = mes.split('-').map(Number)
  const primeiro = `${mes}-01`
  const recuo = (new Date(`${primeiro}T12:00:00Z`).getUTCDay() + 6) % 7
  const diasMes = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const semanas = Math.ceil((recuo + diasMes) / 7)
  const celulas = Array.from({ length: semanas * 7 }, (_, i) => somaDias(primeiro, i - recuo))
  const mudar = (n) => { const d = new Date(Date.UTC(a, m - 1 + n, 1)); setMes(d.toISOString().slice(0, 7)) }
  const nomeMes = maiuscula(new Date(`${primeiro}T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }))
  const doMes = filtrados.filter((e) => diaSP(e.quando).startsWith(mes))
  const doDia = porDia[dia] || []
  const prontos = itens.filter((i) => i.programavel)
  const escolher = (k) => { setDia(k); if (!k.startsWith(mes)) setMes(k.slice(0, 7)) }

  return (
    <div className="cal">
      <div className="cal-barra">
        <div className="cal-nav">
          <button type="button" className="cal-seta" onClick={() => mudar(-1)} aria-label="Mês anterior">‹</button>
          <h2>{nomeMes}</h2>
          <button type="button" className="cal-seta" onClick={() => mudar(1)} aria-label="Próximo mês">›</button>
          {(mes !== hoje.slice(0, 7) || dia !== hoje) && <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => { setMes(hoje.slice(0, 7)); setDia(hoje) }}>Hoje</button>}
        </div>
        <div className="cal-filtros" role="group" aria-label="Rede">
          {[['', 'Tudo'], ...Object.entries(REDES).filter(([k]) => redesUsadas.has(k)).map(([k, r]) => [k, r.nome])].map(([k, nome]) => (
            <button key={k} type="button" className={rede === k ? 'on' : ''} aria-pressed={rede === k} onClick={() => setRede(k)} style={k ? { '--c': REDES[k].cor } : undefined}>
              {k && <i aria-hidden="true" />}{nome}
            </button>
          ))}
        </div>
      </div>
      <p className="cal-resumo">{dados ? `${doMes.length} ${doMes.length === 1 ? 'publicação' : 'publicações'} no mês · ${doMes.filter((e) => e.feito).length} já ${doMes.filter((e) => e.feito).length === 1 ? 'saiu' : 'saíram'} · ${doMes.filter((e) => !e.feito && e.auto).length} saem sozinhas` : 'Carregando…'}</p>

      <div className="cal-corpo">
        <div className="cal-grade" role="grid" aria-label={`Calendário de ${nomeMes}`}>
          {SEMANA.map((s) => <div key={s} className="cal-sem" role="columnheader">{s}</div>)}
          {celulas.map((k) => {
            const lista = porDia[k] || []
            const fora = !k.startsWith(mes)
            return (
              <button key={k} type="button" role="gridcell"
                className={`cal-dia ${k === hoje ? 'hoje' : ''} ${k === dia ? 'sel' : ''} ${k < hoje ? 'passado' : ''} ${fora ? 'fora' : ''} ${lista.length ? 'tem' : ''}`}
                onClick={() => escolher(k)} aria-label={`${Number(k.slice(8))}/${k.slice(5, 7)}: ${lista.length} publicações`}>
                <span className="cal-num">{Number(k.slice(8))}</span>
                {lista.length > 0 && <ul>{lista.slice(0, 3).map((e) => <Item key={e.id} e={e} />)}</ul>}
                {lista.length > 3 && <span className="cal-mais">+{lista.length - 3}</span>}
                <span className="cal-pontos" aria-hidden="true">{lista.slice(0, 4).map((e) => <i key={e.id} style={{ '--c': REDES[e.rede].cor }} />)}</span>
              </button>
            )
          })}
        </div>

        <aside className="cal-lado">
          <h3>{maiuscula(new Date(`${dia}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }))}</h3>
          {doDia.length ? <ul className="cal-lista">{doDia.map((e) => <Item key={e.id} e={e} completo />)}</ul> : <p className="cal-nada">Nada neste dia.</p>}
          {programar && dia >= hoje && (
            <section className="cal-lado-prog">
              <h4>Programar neste dia</h4>
              <Programar dia={dia} itens={prontos} programar={programar} depois={() => setVersao((x) => x + 1)} />
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
