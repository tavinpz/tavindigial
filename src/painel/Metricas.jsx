import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CANAIS } from './canais'

// Popup de métricas: tudo o que está conectado, por canal (o que está no ar, views, seguidores, ritmo de postagem).
// Os números de views e "no ar" vêm do banco (o servidor confere YouTube e Instagram a cada 10 min);
// seguidores e total de posts vêm ao vivo da conta do Instagram de cada canal.
const FUSO = 'America/Sao_Paulo'
const DIAS = 14
const fmt = (n) => (n == null ? '—' : Intl.NumberFormat('pt-BR', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n))
const dia = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
const quando = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')

const noAr = (v) => v.ig_status === 'publicado' || v.yt_status === 'postado' || v.tt_status === 'postado'
const programado = (v) => !noAr(v) && (['agendado', 'programado', 'processando'].includes(v.ig_status) || v.yt_status === 'programado' || v.tt_status === 'programado')
const saiuEm = (v) => [v.ig_postado_em, v.yt_postado_em, v.tt_postado_em].filter(Boolean).sort()[0] || null

function resumo(canal, videos, conteudo) {
  const vs = videos.filter((v) => v.canal === canal)
  const cs = canal === 'tavin-digital' ? conteudo.filter((c) => ['carrossel', 'estatico'].includes(c.formato)) : []
  const datas = [...vs.filter(noAr).map(saiuEm), ...cs.filter((c) => c.status === 'publicado').map((c) => c.publicado_em)].filter(Boolean)
  const hoje = new Date()
  const serie = Array.from({ length: DIAS }, (_, i) => {
    const d = new Date(hoje.getTime() - (DIAS - 1 - i) * 86400000)
    const k = dia(d.toISOString())
    return { k, n: datas.filter((x) => dia(x) === k).length }
  })
  const ytViews = vs.reduce((a, v) => a + (v.yt_views || 0), 0)
  const igViews = vs.reduce((a, v) => a + (v.ig_views || 0), 0)
  const top = vs.filter((v) => (v.yt_views || 0) + (v.ig_views || 0) > 0)
    .sort((a, b) => (b.yt_views || 0) + (b.ig_views || 0) - (a.yt_views || 0) - (a.ig_views || 0)).slice(0, 3)
  const proximo = vs.filter(programado).map((v) => [v.ig_agendado_para, v.yt_programado_para, v.tt_programado_para].filter(Boolean).sort()[0]).filter(Boolean).sort()[0]
  const conferido = vs.map((v) => v.conferido_em).filter(Boolean).sort().pop()
  return {
    noAr: vs.filter(noAr).length + cs.filter((c) => c.status === 'publicado').length,
    programados: vs.filter(programado).length + cs.filter((c) => ['agendado', 'publicando'].includes(c.status)).length,
    prontos: vs.filter((v) => v.video_url && !noAr(v) && !programado(v)).length,
    ytViews, igViews, serie, top, proximo, conferido,
    ultimos7: serie.slice(-7).reduce((a, d) => a + d.n, 0),
  }
}

function Barras({ serie, cor }) {
  const max = Math.max(1, ...serie.map((d) => d.n))
  return (
    <div className="mt-barras" aria-label={`Posts por dia nos últimos ${DIAS} dias`}>
      {serie.map((d) => (
        <span key={d.k} title={`${d.k.split('-').reverse().slice(0, 2).join('/')}: ${d.n} post${d.n === 1 ? '' : 's'}`}>
          <i style={{ height: `${(d.n / max) * 100}%`, background: d.n ? cor : undefined }} />
        </span>
      ))}
    </div>
  )
}

function Canal({ c, r, perfil, yt }) {
  return (
    <section className="mt-canal">
      <header className="mt-canal-cab">
        <span className="p-canal-sigla" style={{ '--c': c.cor }} aria-hidden="true">{c.sigla}</span>
        <h3>{c.nome}</h3>
        <div className="mt-conexoes">
          <span className={`mt-cx ${perfil?.conectado ? 'on' : ''}`}>Instagram{perfil?.username ? ` @${perfil.username}` : ''}</span>
          <span className={`mt-cx ${yt ? 'on' : ''}`}>YouTube</span>
          {c.tipo === 'shorts' && <span className="mt-cx">TikTok (pelo horário)</span>}
        </div>
      </header>
      <div className="mt-nums">
        <div><b>{fmt(r.noAr)}</b><span>no ar</span></div>
        <div><b>{fmt(r.programados)}</b><span>programados</span></div>
        <div><b>{fmt(r.prontos)}</b><span>prontos</span></div>
        <div><b>{perfil?.seguidores != null ? fmt(perfil.seguidores) : '—'}</b><span>seguidores no Insta</span></div>
        <div><b>{fmt(r.igViews)}</b><span>views no Insta</span></div>
        <div><b>{fmt(r.ytViews)}</b><span>views no YouTube</span></div>
      </div>
      <div className="mt-ritmo">
        <div className="mt-ritmo-cab"><span>Posts por dia · últimos {DIAS} dias</span><b>{r.ultimos7} nos últimos 7</b></div>
        <Barras serie={r.serie} cor={c.cor} />
      </div>
      {r.top.length > 0 && (
        <ol className="mt-top">
          {r.top.map((v) => (
            <li key={v.id}>
              <span className="mt-top-tit">{v.titulo || v.yt_titulo || v.id}</span>
              <span className="mt-top-num">{fmt((v.yt_views || 0) + (v.ig_views || 0))} views</span>
              {v.ig_link && <a href={v.ig_link} target="_blank" rel="noreferrer">Insta</a>}
              {v.yt_link && <a href={v.yt_link} target="_blank" rel="noreferrer">YouTube</a>}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-rodape">
        {r.proximo ? `Próximo post: ${quando(r.proximo)}` : 'Nada programado'}
        {r.conferido && ` · conferido nas redes ${quando(r.conferido)}`}
        {perfil?.erro && ` · Instagram: ${perfil.erro}`}
      </p>
    </section>
  )
}

export default function Metricas({ fechar }) {
  const [videos, setVideos] = useState(null)
  const [conteudo, setConteudo] = useState([])
  const [perfis, setPerfis] = useState({})
  const [yts, setYts] = useState({})
  const [conferindo, setConferindo] = useState(false)
  const [msg, setMsg] = useState('')

  async function carregar() {
    const [v, c] = await Promise.all([
      supabase.from('videos').select('id,canal,titulo,yt_titulo,video_url,ig_status,ig_postado_em,ig_agendado_para,ig_views,ig_link,yt_status,yt_postado_em,yt_programado_para,yt_views,yt_link,tt_status,tt_postado_em,tt_programado_para,conferido_em'),
      supabase.from('conteudo').select('id,formato,status,publicado_em,agendado_para'),
    ])
    setVideos(v.data || []); setConteudo(c.data || [])
  }
  async function carregarContas() {
    const ids = CANAIS.map((c) => c.id)
    const { data } = await supabase.functions.invoke('conferir-postagens', { body: { perfil: true, canais: ids } })
    setPerfis(data?.perfis || {})
    const ys = await Promise.all(ids.map((id) => supabase.rpc('youtube_status_canal', { p_canal: id })))
    setYts(Object.fromEntries(ids.map((id, i) => [id, !!ys[i].data?.[0]?.ref])))
  }
  async function conferir() {
    setConferindo(true); setMsg('Conferindo no YouTube e no Instagram…')
    const { error } = await supabase.functions.invoke('conferir-postagens', { body: {} })
    await Promise.all([carregar(), carregarContas()])
    setConferindo(false); setMsg(error ? 'Não consegui falar com o servidor.' : 'Atualizado agora.')
  }
  useEffect(() => { carregar(); carregarContas() }, [])
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc)
  }, [fechar])

  const res = useMemo(() => (videos ? Object.fromEntries(CANAIS.map((c) => [c.id, resumo(c.id, videos, conteudo)])) : null), [videos, conteudo])
  const total = res && Object.values(res).reduce((a, r) => ({ noAr: a.noAr + r.noAr, programados: a.programados + r.programados, views: a.views + r.ytViews + r.igViews, semana: a.semana + r.ultimos7 }), { noAr: 0, programados: 0, views: 0, semana: 0 })
  const seguidores = Object.values(perfis).reduce((a, p) => a + (p?.seguidores || 0), 0)

  return (
    <div className="mt-fundo" onClick={fechar}>
      <div className="mt-janela" role="dialog" aria-modal="true" aria-label="Métricas" onClick={(e) => e.stopPropagation()}>
        <header className="mt-cab">
          <div>
            <h2>Métricas</h2>
            <p>Tudo o que está conectado, por canal.</p>
          </div>
          <div className="mt-cab-acoes">
            <button className="p-btn p-btn--mini" onClick={conferir} disabled={conferindo}>{conferindo ? 'Conferindo…' : 'Conferir agora'}</button>
            <button className="p-btn p-btn--mini p-btn--fraco" onClick={fechar} aria-label="Fechar">Fechar</button>
          </div>
        </header>
        {msg && <p className="mt-msg">{msg}</p>}
        {!res ? <p className="p-vazio">Carregando…</p> : (
          <>
            <div className="mt-geral">
              <div><b>{fmt(total.noAr)}</b><span>posts no ar</span></div>
              <div><b>{fmt(total.semana)}</b><span>postados nos últimos 7 dias</span></div>
              <div><b>{fmt(total.programados)}</b><span>programados</span></div>
              <div><b>{fmt(total.views)}</b><span>views somadas</span></div>
              <div><b>{seguidores ? fmt(seguidores) : '—'}</b><span>seguidores no Insta</span></div>
            </div>
            {CANAIS.map((c) => <Canal key={c.id} c={c} r={res[c.id]} perfil={perfis[c.id]} yt={yts[c.id]} />)}
          </>
        )}
      </div>
    </div>
  )
}
