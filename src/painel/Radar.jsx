import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Aba "Radar": oportunidades de canal novo, tiradas da varredura do YouTube (tabelas radar_* no Supabase).
// Cada cartão = um tipo de vídeo, quanto ele pode pagar e os canais novos que já provam o formato.
const mil = (n) => (n == null ? '—' : n >= 1e6 ? `${String(Math.round(n / 1e5) / 10).replace('.', ',')} mi` : n >= 1e3 ? `${Math.round(n / 1e3)} mil` : String(n))
const usd = (n) => (n >= 1000 ? `US$ ${String(Math.round(n / 100) / 10).replace('.', ',')} mil` : `US$ ${Math.round(n)}`)
const ganho = (views, a, b) => (views ? `${usd((views * a) / 1000)} a ${usd((views * b) / 1000)}` : '—')
const data = (s) => (s ? s.split('-').reverse().join('/') : '—')
const canalUrl = (id) => `https://www.youtube.com/channel/${encodeURIComponent(id)}`
const videoUrl = (id) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`

function Ideia({ i }) {
  return (
    <article className="rd-ideia">
      <header className="rd-ideia-cab">
        <span className="rd-num">{i.ordem}</span>
        <div>
          <h2>{i.titulo}</h2>
          <p className="p-sub">{i.idioma} · {i.duracao} · {i.publico}</p>
        </div>
      </header>

      <p className="rd-tipo"><b>O vídeo:</b> {i.tipo_video}</p>

      <div className="rd-nums">
        <div><b>{i.canais_novos ?? '—'}</b><span>canais novos já pegaram</span></div>
        <div><b>{mil(i.mediana_tipica)}</b><span>views num vídeo típico</span><small>≈ {ganho(i.mediana_tipica, i.rpm_min, i.rpm_max)} por vídeo</small></div>
        <div><b>{mil(i.melhor_mediana)}</b><span>views no canal líder</span><small>≈ {ganho(i.melhor_mediana, i.rpm_min, i.rpm_max)} por vídeo</small></div>
        <div><b>US$ {i.rpm_min}–{i.rpm_max}</b><span>a cada mil views (estimado)</span></div>
      </div>

      <div className="rd-cols">
        <div>
          <h3>Por que agora</h3>
          <p>{i.por_que}</p>
          <h3>Como a gente faz</h3>
          <p>{i.como_fazemos}</p>
          <h3>5 primeiros vídeos</h3>
          <ol className="rd-pilotos">{(i.pilotos || []).map((t) => <li key={t}>{t}</li>)}</ol>
          <p className="rd-risco"><b>Risco:</b> {i.risco}</p>
        </div>
        <div>
          <h3>Canais para estudar</h3>
          <ul className="rd-refs">
            {(i.referencias || []).map((r) => (
              <li key={r.id}>
                <a href={canalUrl(r.id)} target="_blank" rel="noreferrer"><b>{r.nome}</b></a>
                <span className="p-sub"> · criado em {data(r.criado)} · {mil(r.inscritos)} inscritos · vídeo típico {mil(r.mediana)}</span>
                {r.top_video && (
                  <a className="rd-top" href={videoUrl(r.top_video)} target="_blank" rel="noreferrer">▶ {r.top_titulo} <span>({mil(r.top_views)})</span></a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export default function Radar() {
  const [d, setD] = useState(null)
  const [erro, setErro] = useState('')
  const [formato, setFormato] = useState('')
  const [verTodos, setVerTodos] = useState(false)

  useEffect(() => {
    supabase.rpc('radar_painel').then(({ data: r, error }) => {
      if (error) setErro(error.message)
      else if (!r) setErro('Sem acesso ao radar.')
      else setD(r)
    })
  }, [])

  const formatos = useMemo(() => [...new Set((d?.canais || []).map((c) => c.formato))].sort(), [d])
  const lista = useMemo(() => (d?.canais || []).filter((c) => !formato || c.formato === formato), [d, formato])

  if (erro) return <div className="p-vazio"><p>Não carregou o radar: {erro}</p></div>
  if (!d) return <div className="p-vazio"><p>Carregando o radar…</p></div>
  const s = d.resumo || {}

  return (
    <div className="rd">
      <div className="p-cab">
        <div>
          <h1>Radar de canais</h1>
          <p className="p-sub">
            {mil(s.videos)} vídeos longos do último mês, de {mil(s.canais)} canais. {mil(s.canais_novos)} canais foram criados desde maio/2026 e {s.oportunidades} deles já pegaram (3+ vídeos longos, vídeo típico acima de 30 mil views). Varredura de {data(s.varredura)}.
          </p>
        </div>
      </div>

      <p className="rd-intro">As 5 apostas abaixo são formatos que <b>não envelhecem</b> (o vídeo continua rendendo por anos) e que <b>estão no hype agora</b> (vários canais criados nos últimos meses já pegaram com eles). Todos dá para fazer 100% em código. Estão em ordem de quanto valem para nós.</p>

      {(d.ideias || []).map((i) => <Ideia key={i.ordem} i={i} />)}

      <section className="rd-todos">
        <button type="button" className="p-btn" onClick={() => setVerTodos((v) => !v)}>{verTodos ? 'Esconder' : 'Ver'} todos os canais novos que pegaram ({(d.canais || []).length})</button>
        {verTodos && (
          <>
            <div className="rd-filtro">
              <select value={formato} onChange={(e) => setFormato(e.target.value)} aria-label="Formato">
                <option value="">Todos os formatos</option>
                {formatos.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <span className="p-sub">{lista.length} canais</span>
            </div>
            <div className="rd-tab-wrap">
              <table className="p-tabela">
                <thead><tr><th>Canal</th><th>Formato</th><th>Criado</th><th>País</th><th className="rd-n">Vídeo típico</th><th className="rd-n">Inscritos</th><th>Vídeo que mais pegou</th></tr></thead>
                <tbody>
                  {lista.map((c) => (
                    <tr key={c.canal_id}>
                      <td><a href={canalUrl(c.canal_id)} target="_blank" rel="noreferrer">{c.nome}</a></td>
                      <td>{c.formato}{c.producao === 'parcial' ? ' (parcial)' : ''}</td>
                      <td>{data(c.criado_em)}</td>
                      <td>{c.pais}</td>
                      <td className="rd-n">{mil(c.mediana_longo)}</td>
                      <td className="rd-n">{mil(c.inscritos)}</td>
                      <td>{c.top_video ? <a href={videoUrl(c.top_video)} target="_blank" rel="noreferrer">{c.top_titulo} ({mil(c.top_views)})</a> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      <p className="p-sub rd-nota">"Vídeo típico" é a mediana: o vídeo do meio entre os últimos longos do canal. Ganho por vídeo = views × valor por mil views; o valor por mil é estimativa de mercado para o tema e o idioma, não dado do canal.</p>
    </div>
  )
}
