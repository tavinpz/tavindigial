import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

// Aba "Radar": canais novos que estão pegando no YouTube, achados pela varredura automática (tabelas radar_* no Supabase).
// Roda sozinho: busca nova todo dia (cron radar-buscar) e um ciclo a cada 10 min que puxa dados e calcula a mediana.
const mil = (n) => (n == null ? '—' : n >= 1e6 ? `${String(Math.round(n / 1e5) / 10).replace('.', ',')} mi` : n >= 1e3 ? `${Math.round(n / 1e3)} mil` : String(n))
const usd = (n) => (n >= 1000 ? `US$ ${String(Math.round(n / 100) / 10).replace('.', ',')} mil` : `US$ ${Math.round(n)}`)
const ganho = (views, a, b) => (views ? `${usd((views * a) / 1000)} a ${usd((views * b) / 1000)}` : '—')
const data = (s) => (s ? s.slice(0, 10).split('-').reverse().join('/') : '—')
const ha = (iso) => {
  if (!iso) return 'nunca'
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  return m < 60 ? `há ${m} min` : m < 1440 ? `há ${Math.round(m / 60)} h` : `há ${Math.round(m / 1440)} dias`
}
const canalUrl = (id) => `https://www.youtube.com/channel/${encodeURIComponent(id)}`
const videoUrl = (id) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
const IDIOMA = { en: 'Inglês', es: 'Espanhol', de: 'Alemão', fr: 'Francês', pl: 'Polonês', pt: 'Português' }
const capaUrl = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`
const minutos = (s) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '')

// Capas dos vídeos mais vistos do canal (vêm prontas do radar_painel, sem chamada nova ao YouTube).
function Capas({ videos }) {
  const ref = useRef(null)
  const arrasto = useRef(null)
  if (!videos?.length) return null
  // Arrastar com o mouse (no celular o dedo já rola sozinho).
  const desce = (e) => { if (e.pointerType === 'mouse') arrasto.current = { x: e.clientX, s: ref.current.scrollLeft, andou: false } }
  const move = (e) => {
    const a = arrasto.current
    if (!a) return
    const dx = e.clientX - a.x
    if (Math.abs(dx) > 4) a.andou = true
    ref.current.scrollLeft = a.s - dx
  }
  const solta = () => { const a = arrasto.current; arrasto.current = null; if (a?.andou) ref.current.dataset.arrastou = '1' }
  const clique = (e) => { if (ref.current.dataset.arrastou) { e.preventDefault(); delete ref.current.dataset.arrastou } }
  return (
    <div className="rd-capas" ref={ref} onPointerDown={desce} onPointerMove={move} onPointerUp={solta} onPointerLeave={solta} onClickCapture={clique}>
      {videos.map((v) => (
        <a key={v.id} className="rd-capa" href={videoUrl(v.id)} target="_blank" rel="noreferrer" title={v.t} draggable={false}>
          <span className="rd-capa-img"><img src={capaUrl(v.id)} alt="" loading="lazy" draggable={false} />{v.s ? <em>{minutos(v.s)}</em> : null}</span>
          <span className="rd-capa-tit">{v.t}</span>
          <span className="rd-capa-views">{mil(v.v)} views{v.d ? ` · ${data(v.d)}` : ''}</span>
        </a>
      ))}
    </div>
  )
}

function Cartao({ c }) {
  return (
    <article className="rd-card">
      <div className="rd-card-topo">
        <a className="rd-card-nome" href={canalUrl(c.canal_id)} target="_blank" rel="noreferrer">{c.nome}</a>
        <span className="rd-card-meta">{c.dias} dias de vida · {IDIOMA[c.idioma] || c.idioma || '—'} · {c.pais}</span>
      </div>
      <div className="rd-card-nums">
        <div><b>{mil(c.mediana_longo)}</b><span>vídeo típico</span></div>
        <div><b>{mil(c.max_longo)}</b><span>maior vídeo</span></div>
        <div><b>{c.n_longos}</b><span>longos</span></div>
      </div>
      <div className="rd-card-tags"><span className="rd-formato">{c.formato}</span><Chip c={c.complexidade} /></div>
      {c.videos?.length ? <Capas videos={c.videos} />
        : c.top_video && <a className="rd-card-video" href={videoUrl(c.top_video)} target="_blank" rel="noreferrer">▶ {c.top_titulo}</a>}
    </article>
  )
}

function Aposta({ i }) {
  return (
    <details className="rd-aposta">
      <summary>
        <span className="rd-num">{i.ordem}</span>
        <span className="rd-aposta-tit"><b>{i.titulo}</b><small>{i.idioma} · {i.duracao} · típico {mil(i.mediana_tipica)} views ≈ {ganho(i.mediana_tipica, i.rpm_min, i.rpm_max)} por vídeo</small></span>
        <Chip c={i.complexidade} />
      </summary>
      <div className="rd-aposta-corpo">
        <p><b>O vídeo:</b> {i.tipo_video}</p>
        <p><b>Por que agora:</b> {i.por_que}</p>
        <p><b>Como a gente faz:</b> {i.como_fazemos} {i.tempo && i.tempo !== '—' ? `Tempo: ${i.tempo}.` : ''}</p>
        {i.nota && <p className="rd-cinza">{i.nota}</p>}
        <div className="rd-aposta-cols">
          <div>
            <h4>5 primeiros vídeos</h4>
            <ol>{(i.pilotos || []).map((t) => <li key={t}>{t}</li>)}</ol>
          </div>
          <div className="rd-col-cheia">
            <h4>Canais para estudar</h4>
            <ul className="rd-canais-capas">{(i.referencias || []).map((r) => (
              <li key={r.id}><a href={canalUrl(r.id)} target="_blank" rel="noreferrer">{r.nome}</a> <span className="rd-cinza">· típico {mil(r.mediana)}</span>
                {r.videos?.length ? <Capas videos={r.videos} />
                  : r.top_video && <a className="rd-card-video" href={videoUrl(r.top_video)} target="_blank" rel="noreferrer">▶ {r.top_titulo} ({mil(r.top_views)})</a>}</li>
            ))}</ul>
          </div>
        </div>
      </div>
    </details>
  )
}

const ORDEM_FAZER = { 'fácil': 0, 'média': 1, 'difícil': 2, 'não dá': 3 }
const mediana = (xs) => {
  const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2)
  return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0
}

function Nicho({ n, i, onVer }) {
  return (
    <details className="rd-aposta">
      <summary>
        <span className="rd-num">{i + 1}</span>
        <span className="rd-aposta-tit"><b>{n.formato}</b>
          <small>{n.canais.length} canais novos · típico {mil(n.tipico)} views{n.rpm_min != null ? ` ≈ ${ganho(n.tipico, n.rpm_min, n.rpm_max)} por vídeo` : ''}</small></span>
        <Chip c={n.complexidade} />
      </summary>
      <div className="rd-aposta-corpo">
        {n.o_video && <p><b>O vídeo:</b> {n.o_video}</p>}
        {n.nota && <p><b>Como a gente faz:</b> {n.nota} {n.tempo && n.tempo !== '—' ? `Tempo: ${n.tempo}.` : ''}</p>}
        {n.rpm_min != null && <p className="rd-cinza">Valor estimado: US$ {n.rpm_min} a {n.rpm_max} por mil views.</p>}
        <div>
          <h4>Canais novos que estão pegando</h4>
          <ul className="rd-nicho-lista rd-canais-capas">{n.canais.slice(0, 6).map((c) => (
            <li key={c.canal_id}><a href={canalUrl(c.canal_id)} target="_blank" rel="noreferrer">{c.nome}</a> <span className="rd-cinza">· {c.dias} dias · típico {mil(c.mediana_longo)} · {IDIOMA[c.idioma] || c.idioma || '—'} · {c.pais}</span>
              {c.videos?.length ? <Capas videos={c.videos} />
                : c.top_video && <a className="rd-card-video" href={videoUrl(c.top_video)} target="_blank" rel="noreferrer">▶ {c.top_titulo}</a>}</li>
          ))}</ul>
        </div>
        <button type="button" className="rd-ver" onClick={() => onVer(n.formato)}>Ver só esse nicho na tabela</button>
      </div>
    </details>
  )
}

export default function Radar() {
  const [d, setD] = useState(null)
  const [erro, setErro] = useState('')
  const [f, setF] = useState({ busca: '', formato: '', fazer: 'fazivel', idioma: '', idade: '150', views: '20000' })
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }))

  useEffect(() => {
    supabase.rpc('radar_painel').then(({ data: r, error }) => {
      if (error) setErro(error.message)
      else if (!r) setErro('Sem acesso ao radar.')
      else setD(r)
    })
  }, [])

  const canais = d?.canais || []
  const formatos = useMemo(() => [...new Set(canais.map((c) => c.formato))].sort(), [canais])
  const filtrados = useMemo(() => {
    const t = f.busca.trim().toLowerCase()
    return canais.filter((c) =>
      (!t || `${c.nome} ${c.top_titulo || ''} ${c.formato}`.toLowerCase().includes(t))
      && (!f.formato || c.formato === f.formato)
      && (f.fazer === 'todos' || (f.fazer === 'fazivel' ? c.complexidade !== 'não dá' : f.fazer === 'facil' ? ['fácil', 'média'].includes(c.complexidade) : true))
      && (!f.idioma || c.idioma === f.idioma)
      && c.dias <= Number(f.idade)
      && c.mediana_longo >= Number(f.views))
  }, [canais, f])
  const explodindo = useMemo(() => filtrados.filter((c) => c.mediana_longo >= 100000 && c.dias <= 120).slice(0, 12), [filtrados])
  const nichos = useMemo(() => {
    const info = Object.fromEntries((d?.formatos || []).map((x) => [x.formato, x]))
    const g = {}
    filtrados.forEach((c) => { if (c.formato && c.formato !== 'Sem rótulo') (g[c.formato] ||= []).push(c) })
    return Object.entries(g).map(([formato, cs]) => ({ ...(info[formato] || {}), formato, complexidade: info[formato]?.complexidade || cs[0].complexidade, canais: cs, tipico: mediana(cs.map((c) => c.mediana_longo)) }))
      .sort((a, b) => (ORDEM_FAZER[a.complexidade] ?? 4) - (ORDEM_FAZER[b.complexidade] ?? 4) || (b.canais.length >= 2) - (a.canais.length >= 2) || b.tipico * (b.rpm_max || 1) - a.tipico * (a.rpm_max || 1))
  }, [filtrados, d])
  const verNicho = (formato) => { setF((v) => ({ ...v, formato })); document.getElementById('rd-tabela')?.scrollIntoView({ behavior: 'smooth' }) }

  if (erro) return <div className="p-vazio"><p>Não carregou o radar: {erro}</p></div>
  if (!d) return <div className="p-vazio"><p>Carregando o radar…</p></div>
  const s = d.resumo || {}, st = d.status || {}

  return (
    <div className="rd">
      <header className="rd-cab">
        <div>
          <h1>Radar de canais</h1>
          <p className="rd-cinza">{mil(s.canais)} canais vistos em {mil(s.videos)} vídeos longos. {mil(s.canais_novos)} foram criados nos últimos meses.</p>
        </div>
        <div className="rd-status" title="Busca nova todo dia às 06:13; a cada 10 minutos o radar puxa os dados dos canais e recalcula as views.">
          <span className="rd-ponto" /> Atualiza sozinho · último ciclo {ha(st.ultimo_ciclo)} · {mil(st.na_fila)} canais na fila
        </div>
      </header>

      <div className="rd-filtros">
        <input type="search" value={f.busca} onChange={set('busca')} placeholder="Buscar canal ou assunto" aria-label="Buscar" />
        <select value={f.fazer} onChange={set('fazer')} aria-label="Dá para fazer">
          <option value="fazivel">Tira o que não dá para fazer</option>
          <option value="facil">Só fácil e média</option>
          <option value="todos">Todos</option>
        </select>
        <select value={f.formato} onChange={set('formato')} aria-label="Formato">
          <option value="">Todos os formatos</option>
          {formatos.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={f.idioma} onChange={set('idioma')} aria-label="Idioma">
          <option value="">Todos os idiomas</option>
          {Object.entries(IDIOMA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={f.idade} onChange={set('idade')} aria-label="Idade do canal">
          <option value="30">Canal com até 30 dias</option>
          <option value="60">Até 60 dias</option>
          <option value="90">Até 90 dias</option>
          <option value="150">Até 150 dias</option>
        </select>
        <select value={f.views} onChange={set('views')} aria-label="Vídeo típico mínimo">
          <option value="20000">Vídeo típico 20 mil+</option>
          <option value="50000">50 mil+</option>
          <option value="100000">100 mil+</option>
          <option value="300000">300 mil+</option>
        </select>
      </div>

      <section>
        <div className="rd-sec-cab">
          <h2>Explodindo agora</h2>
          <span className="rd-cinza">Canais com até 120 dias e vídeo típico acima de 100 mil views</span>
        </div>
        {explodindo.length ? <div className="rd-grade">{explodindo.map((c) => <Cartao key={c.canal_id} c={c} />)}</div>
          : <p className="p-vazio">Nenhum canal explodindo com esses filtros.</p>}
      </section>

      <section>
        <div className="rd-sec-cab">
          <h2>Nichos em alta</h2>
          <span className="rd-cinza">Canais novos agrupados por tipo de vídeo. Os que dá para fazer vêm primeiro. Clique para abrir.</span>
        </div>
        {nichos.length ? <div className="rd-apostas">{nichos.map((n, i) => <Nicho key={n.formato} n={n} i={i} onVer={verNicho} />)}</div>
          : <p className="p-vazio">Nenhum nicho com esses filtros.</p>}
      </section>

      <section id="rd-tabela">
        <div className="rd-sec-cab">
          <h2>Todos os canais novos que estão pegando</h2>
          <span className="rd-cinza">{filtrados.length} canais</span>
        </div>
        <div className="rd-tab-wrap">
          <table className="rd-tabela">
            <thead><tr><th>Canal</th><th className="rd-n">Dias</th><th className="rd-n">Vídeo típico</th><th className="rd-n">Maior</th><th className="rd-n">Longos</th><th>Formato</th><th>Fazer</th><th>Idioma</th><th>Vídeo que mais pegou</th></tr></thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.canal_id}>
                  <td><a href={canalUrl(c.canal_id)} target="_blank" rel="noreferrer">{c.nome}</a></td>
                  <td className="rd-n">{c.dias}</td>
                  <td className="rd-n"><b>{mil(c.mediana_longo)}</b></td>
                  <td className="rd-n">{mil(c.max_longo)}</td>
                  <td className="rd-n">{c.n_longos}</td>
                  <td>{c.formato}</td>
                  <td><Chip c={c.complexidade} /></td>
                  <td>{IDIOMA[c.idioma] || c.idioma || '—'}</td>
                  <td className="rd-top-cel">{c.top_video ? <a href={videoUrl(c.top_video)} target="_blank" rel="noreferrer">{c.top_titulo}</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="rd-sec-cab">
          <h2>Minhas 5 apostas</h2>
          <span className="rd-cinza">Formatos que não envelhecem e estão no hype. Clique para abrir.</span>
        </div>
        <div className="rd-apostas">{(d.ideias || []).map((i) => <Aposta key={i.ordem} i={i} />)}</div>
      </section>

      <p className="rd-cinza rd-nota">"Vídeo típico" é a mediana dos últimos vídeos longos do canal (o do meio), o que separa canal consistente de viral isolado. "Fazer" é minha avaliação de quanto dá para fazer em código com qualidade. Ganho por vídeo usa um valor estimado por mil views para o tema e o idioma.</p>
    </div>
  )
}
