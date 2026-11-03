import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'

// Jogos de navegador: números que chegam de dentro de cada jogo (rastreador próprio, todos os portais)
// + receita do mês digitada (os portais não têm API pública).
const PORTAIS = { crazygames: 'CrazyGames', poki: 'Poki', itch: 'itch.io', playgama: 'Playgama', gamedistribution: 'GameDistribution', gamemonetize: 'GameMonetize', y8: 'Y8', telegram: 'Telegram', tavindigital: 'Teste (link nosso)', local: 'Teste local', outro: 'Outros' }
const STATUS = { ideia: 'Ideia', teste: 'Em teste', publicado: 'No ar', pausado: 'Pausado' }
const fmt = (n) => (n == null ? '—' : Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(n))
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—')
const tempo = (s) => (s == null ? '—' : s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}min ${Math.round(s % 60)}s`)
const mesAtual = () => new Date().toISOString().slice(0, 7) + '-01'
const NOMES_FASE = { 'planet-drop': ['Asteroide', 'Lua', 'Mercúrio', 'Marte', 'Vênus', 'Terra', 'Netuno', 'Urano', 'Saturno', 'Júpiter', 'Sol'] }

function Barras({ serie }) {
  if (!serie.length) return null
  const max = Math.max(1, ...serie.map((d) => d.n))
  return (
    <div className="jg-barras" role="img" aria-label="Sessões por dia">
      {serie.map((d) => <span key={d.k} title={`${d.k.split('-').reverse().slice(0, 2).join('/')}: ${d.n} sessões, ${d.j} jogaram`}><i style={{ height: `${(d.n / max) * 100}%` }} /><b style={{ height: `${(d.j / max) * 100}%` }} /></span>)}
    </div>
  )
}

function Cartao({ jogo, linhas, dias, receita, salvarReceita, salvarLinks }) {
  const [fases, setFases] = useState([])
  const [editar, setEditar] = useState(false)
  const [links, setLinks] = useState(jogo.links || {})
  const [rec, setRec] = useState({ portal: 'crazygames', valor: '' })
  useEffect(() => { supabase.rpc('jogos_fases', { p_jogo: jogo.id, p_dias: dias }).then(({ data }) => setFases(data || [])) }, [jogo.id, dias])
  const t = linhas.reduce((a, l) => ({
    aberturas: a.aberturas + Number(l.aberturas), jogaram: a.jogaram + Number(l.jogaram), partidas: a.partidas + Number(l.partidas),
    jogadores: a.jogadores + Number(l.jogadores), voltaram: a.voltaram + Number(l.voltaram),
    tempo: a.tempo + (Number(l.tempo_medio_s) || 0) * Number(l.jogaram), melhor: Math.max(a.melhor, l.melhor_fase || 0),
  }), { aberturas: 0, jogaram: 0, partidas: 0, jogadores: 0, voltaram: 0, tempo: 0, melhor: 0 })
  const tempoMedio = t.jogaram ? t.tempo / t.jogaram : null
  const nomesFase = NOMES_FASE[jogo.id] || []
  const totalFases = fases.reduce((a, f) => a + Number(f.sessoes), 0) || 1
  const recMes = receita.filter((r) => r.jogo === jogo.id && r.mes === mesAtual())
  return (
    <article className="jg-card">
      <header className="jg-cab">
        <div>
          <h2>{jogo.nome}</h2>
          <span className={`jg-status jg-status--${jogo.status}`}>{STATUS[jogo.status]}</span>
        </div>
        <div className="jg-links">
          <a href={`/jogos/${jogo.id}/`} target="_blank" rel="noreferrer" className="p-btn p-btn--mini">Jogar</a>
          {Object.entries(jogo.links || {}).filter(([, u]) => u).map(([p, u]) => <a key={p} href={u} target="_blank" rel="noreferrer" className="p-btn p-btn--mini p-btn--fraco">{PORTAIS[p] || p}</a>)}
          <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => setEditar(!editar)}>{editar ? 'Fechar' : 'Links e receita'}</button>
        </div>
      </header>

      {editar && (
        <div className="jg-editar">
          <div className="jg-editar-links">
            {['crazygames', 'itch', 'playgama', 'gamedistribution', 'poki'].map((p) => (
              <label key={p} className="p-campo">{PORTAIS[p]}<input value={links[p] || ''} onChange={(e) => setLinks({ ...links, [p]: e.target.value })} placeholder="link do jogo no portal" /></label>
            ))}
            <button type="button" className="p-btn p-btn--mini" onClick={() => salvarLinks(jogo.id, links)}>Salvar links</button>
          </div>
          <form className="jg-receita" onSubmit={(e) => { e.preventDefault(); salvarReceita(jogo.id, rec.portal, rec.valor); setRec({ ...rec, valor: '' }) }}>
            <label className="p-campo">Receita deste mês
              <span className="jg-receita-linha">
                <select value={rec.portal} onChange={(e) => setRec({ ...rec, portal: e.target.value })}>{['crazygames', 'playgama', 'gamedistribution', 'poki', 'itch', 'outro'].map((p) => <option key={p} value={p}>{PORTAIS[p]}</option>)}</select>
                <input type="number" step="0.01" min="0" value={rec.valor} onChange={(e) => setRec({ ...rec, valor: e.target.value })} placeholder="€ 0,00" required />
                <button className="p-btn p-btn--mini">Salvar</button>
              </span>
            </label>
          </form>
        </div>
      )}

      <div className="jg-nums">
        <div><b>{fmt(t.aberturas)}</b><span>abriram</span></div>
        <div><b>{pct(t.jogaram, t.aberturas)}</b><span>começaram a jogar</span></div>
        <div><b>{tempo(tempoMedio)}</b><span>tempo médio jogando</span></div>
        <div><b>{t.jogaram ? fmt(Math.round((t.partidas / t.jogaram) * 10) / 10) : '—'}</b><span>partidas por pessoa</span></div>
        <div><b>{pct(t.voltaram, t.jogadores)}</b><span>voltaram outro dia</span></div>
        <div><b>{recMes.length ? `€ ${fmt(recMes.reduce((a, r) => a + Number(r.valor), 0))}` : '—'}</b><span>receita do mês</span></div>
      </div>

      {linhas.length > 0 && (
        <table className="jg-tabela">
          <thead><tr><th>Portal</th><th>Abriram</th><th>Jogaram</th><th>Tempo médio</th><th>Partidas</th><th>Voltaram</th></tr></thead>
          <tbody>{linhas.sort((a, b) => b.aberturas - a.aberturas).map((l) => (
            <tr key={l.portal}><td>{PORTAIS[l.portal] || l.portal}</td><td>{fmt(Number(l.aberturas))}</td><td>{pct(Number(l.jogaram), Number(l.aberturas))}</td><td>{tempo(Number(l.tempo_medio_s))}</td><td>{fmt(Number(l.partidas))}</td><td>{pct(Number(l.voltaram), Number(l.jogadores))}</td></tr>
          ))}</tbody>
        </table>
      )}

      {fases.length > 0 && (
        <div className="jg-fases">
          <h3>Até onde as pessoas chegam</h3>
          <ul>{fases.map((f) => (
            <li key={f.fase}><span>{nomesFase[f.fase] || `Fase ${f.fase}`}</span><span className="jg-trilho"><i style={{ width: `${(Number(f.sessoes) / totalFases) * 100}%` }} /></span><b>{pct(Number(f.sessoes), totalFases)}</b></li>
          ))}</ul>
          <p className="jg-nota">Onde a maioria para é onde o jogo fica difícil ou chato. É ali que se mexe primeiro.</p>
        </div>
      )}
      {!linhas.length && <p className="p-vazio">Ainda ninguém jogou no período. Os números aparecem assim que alguém abrir o jogo em qualquer portal.</p>}
    </article>
  )
}

export default function Jogos() {
  const { avisar } = usePainel() || { avisar: () => {} }
  const [dias, setDias] = useState(7)
  const [jogos, setJogos] = useState(null)
  const [resumo, setResumo] = useState([])
  const [porDia, setPorDia] = useState([])
  const [receita, setReceita] = useState([])

  async function carregar() {
    const [j, r, d, rc] = await Promise.all([
      supabase.from('jogos').select('*').order('criado_em'),
      supabase.rpc('jogos_resumo', { p_dias: dias }),
      supabase.rpc('jogos_por_dia', { p_dias: Math.max(dias, 14) }),
      supabase.from('jogo_receita').select('*'),
    ])
    setJogos(j.data || []); setResumo(r.data || []); setPorDia(d.data || []); setReceita(rc.data || [])
  }
  useEffect(() => { carregar() }, [dias])

  const serie = useMemo(() => {
    const m = {}
    for (const d of porDia) { m[d.dia] ||= { k: d.dia, n: 0, j: 0 }; m[d.dia].n += Number(d.sessoes); m[d.dia].j += Number(d.jogaram) }
    return Object.values(m).sort((a, b) => a.k.localeCompare(b.k))
  }, [porDia])
  const totalRec = receita.filter((r) => r.mes === mesAtual()).reduce((a, r) => a + Number(r.valor), 0)

  async function salvarReceita(jogo, portal, valor) {
    const { error } = await supabase.from('jogo_receita').upsert({ jogo, portal, mes: mesAtual(), valor: Number(valor), atualizado_em: new Date().toISOString() }, { onConflict: 'jogo,portal,mes' })
    if (error) avisar('Não salvou'); else { avisar('Receita salva'); carregar() }
  }
  async function salvarLinks(id, links) {
    const status = Object.values(links).some(Boolean) ? 'publicado' : undefined
    const { error } = await supabase.from('jogos').update({ links, ...(status ? { status } : {}) }).eq('id', id)
    if (error) avisar('Não salvou'); else { avisar('Links salvos'); carregar() }
  }

  if (!jogos) return <p className="p-vazio">Carregando…</p>
  return (
    <section className="jg">
      <div className="p-cab">
        <div><h1>Jogos</h1><p className="p-sub">{jogos.length} {jogos.length === 1 ? 'jogo' : 'jogos'}{totalRec ? ` · € ${fmt(totalRec)} este mês` : ''} · números de dentro dos jogos, de todos os portais</p></div>
        <div className="mc-periodo" role="group" aria-label="Período">
          {[1, 7, 14, 28].map((d) => <button key={d} type="button" className={dias === d ? 'on' : ''} aria-pressed={dias === d} onClick={() => setDias(d)}>{d === 1 ? 'Hoje' : `${d} dias`}</button>)}
        </div>
      </div>
      {serie.length > 0 && (
        <div className="jg-geral">
          <span>Sessões por dia <small>(clara: abriram · escura: jogaram)</small></span>
          <Barras serie={serie} />
        </div>
      )}
      {jogos.map((j) => <Cartao key={j.id} jogo={j} linhas={resumo.filter((r) => r.jogo === j.id)} dias={dias} receita={receita} salvarReceita={salvarReceita} salvarLinks={salvarLinks} />)}
    </section>
  )
}
