import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Popup de métricas de UM canal (abre pelo botão "Métricas" no topo do painel do canal).
// Instagram e YouTube vêm ao vivo da conta daquele canal; "No painel" vem do banco (o que está no ar, programado, pronto).
const FUSO = 'America/Sao_Paulo'
const fmt = (n) => (n == null ? '—' : Intl.NumberFormat('pt-BR', { notation: Math.abs(n) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n))
const diaSP = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
const dm = (k) => k.split('-').reverse().slice(0, 2).join('/')
const quando = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')
const data = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: 'short' }) : '')

const noAr = (v) => v.ig_status === 'publicado' || v.yt_status === 'postado' || v.tt_status === 'postado'
const programado = (v) => !noAr(v) && (['agendado', 'programado', 'processando'].includes(v.ig_status) || v.yt_status === 'programado' || v.tt_status === 'programado')
const saiuEm = (v) => [v.ig_postado_em, v.yt_postado_em, v.tt_postado_em].filter(Boolean).sort()[0] || null

function resumoPainel(canal, videos, conteudo, dias) {
  const cs = canal === 'tavin-digital' ? conteudo.filter((c) => ['carrossel', 'estatico'].includes(c.formato)) : []
  const datas = [...videos.filter(noAr).map(saiuEm), ...cs.filter((c) => c.status === 'publicado').map((c) => c.publicado_em)].filter(Boolean)
  const serie = Array.from({ length: dias }, (_, i) => {
    const k = diaSP(new Date(Date.now() - (dias - 1 - i) * 86400000).toISOString())
    return { k, n: datas.filter((x) => diaSP(x) === k).length }
  })
  const proximo = videos.filter(programado).map((v) => [v.ig_agendado_para, v.yt_programado_para, v.tt_programado_para].filter(Boolean).sort()[0])
    .concat(cs.filter((c) => c.status === 'agendado').map((c) => c.agendado_para)).filter(Boolean).sort()[0]
  return {
    noAr: videos.filter(noAr).length + cs.filter((c) => c.status === 'publicado').length,
    programados: videos.filter(programado).length + cs.filter((c) => ['agendado', 'publicando'].includes(c.status)).length,
    prontos: videos.filter((v) => v.video_url && !noAr(v) && !programado(v)).length + cs.filter((c) => c.status === 'pronto').length,
    noPeriodo: serie.reduce((a, d) => a + d.n, 0),
    serie, proximo,
    conferido: videos.map((v) => v.conferido_em).filter(Boolean).sort().pop(),
  }
}

// Barras de uma série só (cor do canal). Passar o mouse mostra o valor do dia na linha de cima.
function Barras({ serie, cor, unidade, titulo }) {
  const [sel, setSel] = useState(null)
  const max = Math.max(1, ...serie.map((d) => d.n))
  const total = serie.reduce((a, d) => a + d.n, 0)
  const d = sel != null ? serie[sel] : null
  return (
    <figure className="mc-graf">
      <figcaption>
        <span>{titulo}</span>
        <b aria-live="polite">{d ? `${dm(d.k)}: ${fmt(d.n)} ${unidade}` : `${fmt(total)} no período`}</b>
      </figcaption>
      <div className="mc-barras" style={{ gridTemplateColumns: `repeat(${serie.length}, 1fr)` }} onMouseLeave={() => setSel(null)}>
        {serie.map((x, i) => (
          <span key={x.k} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onBlur={() => setSel(null)} tabIndex={0}
            aria-label={`${dm(x.k)}: ${x.n} ${unidade}`} className={sel === i ? 'on' : ''}>
            <i style={{ height: `${(x.n / max) * 100}%`, background: x.n ? cor : undefined }} />
          </span>
        ))}
      </div>
      <div className="mc-eixo"><span>{dm(serie[0].k)}</span><span>{dm(serie[serie.length - 1].k)}</span></div>
    </figure>
  )
}

function Num({ v, rotulo, sub }) {
  return <div className="mc-num"><b>{fmt(v)}</b><span>{rotulo}</span>{sub && <small>{sub}</small>}</div>
}

function Instagram({ ig, dias, cor }) {
  if (!ig) return <p className="mc-vazio">Carregando o Instagram…</p>
  if (!ig.conectado) return <p className="mc-vazio">Instagram não conectado. Ligue a conta em "Ligar Instagram" no topo deste painel para ver seguidores, alcance e o desempenho de cada post.</p>
  if (ig.erro) return <p className="mc-vazio mc-vazio--erro">O Instagram respondeu com erro: {ig.erro}. Se o token venceu, troque em "Trocar token".</p>
  const p = ig.periodo || {}
  const liquido = p.seguiu != null ? (p.seguiu || 0) - (p.deixou || 0) : null
  const posts = ig.posts || []
  const melhor = posts.reduce((m, x) => ((x.alcance ?? x.views ?? -1) > (m?.alcance ?? m?.views ?? -1) ? x : m), null)
  const ganhos = (ig.seguidores_dia || []).filter((d) => d.n)
  return (
    <>
      <div className="mc-nums">
        <Num v={ig.perfil?.seguidores} rotulo="seguidores" sub={liquido != null ? `${liquido >= 0 ? '+' : ''}${fmt(liquido)} em ${dias} dias` : null} />
        <Num v={p.reach} rotulo="contas alcançadas" />
        <Num v={p.views} rotulo="visualizações" />
        <Num v={p.total_interactions} rotulo="interações" />
        <Num v={p.profile_views} rotulo="visitas ao perfil" />
        <Num v={p.accounts_engaged} rotulo="contas que interagiram" />
      </div>
      {!ig.sem_insights && (
        <p className="mc-linha">
          {fmt(p.likes)} curtidas · {fmt(p.comments)} comentários · {fmt(p.shares)} compartilhamentos · {fmt(p.saves)} salvos
          {p.profile_links_taps != null ? ` · ${fmt(p.profile_links_taps)} toques no link da bio` : ''}
          {p.seguiu != null ? ` · ${fmt(p.seguiu)} seguiram, ${fmt(p.deixou)} deixaram de seguir` : ''}
        </p>
      )}
      {ig.sem_insights && <p className="mc-aviso">A conta não liberou os números de alcance (falta a permissão de insights no token). Seguidores e posts aparecem; para o resto, gere o token com "instagram_business_manage_insights".</p>}
      {ig.alcance_dia?.length > 1 && <Barras serie={ig.alcance_dia.map((d) => ({ k: d.dia, n: d.n }))} cor={cor} unidade="de alcance" titulo="Alcance por dia" />}
      {ganhos.length > 0 && <Barras serie={ig.seguidores_dia.map((d) => ({ k: d.dia, n: d.n }))} cor={cor} unidade="seguidores novos" titulo="Seguidores novos por dia" />}
      {posts.length > 0 && (
        <>
          <h4 className="mc-sub">Posts recentes <span>{ig.perfil?.posts != null ? `${fmt(ig.perfil.posts)} no perfil` : ''}</span></h4>
          <ul className="mc-posts">
            {posts.map((x) => (
              <li key={x.id} className={melhor?.id === x.id && posts.length > 1 ? 'mc-post--melhor' : ''}>
                <a href={x.link} target="_blank" rel="noreferrer" title={x.legenda}>
                  <span className="mc-capa">{x.capa ? <img src={x.capa} alt="" loading="lazy" /> : <em>{x.tipo}</em>}</span>
                  <span className="mc-post-txt">
                    <small>{x.tipo} · {data(x.quando)}{melhor?.id === x.id && posts.length > 1 ? ' · melhor alcance' : ''}</small>
                    <strong>{x.legenda || 'Sem legenda'}</strong>
                    <span className="mc-post-nums">
                      {x.views != null && <span><b>{fmt(x.views)}</b> views</span>}
                      {x.alcance != null && <span><b>{fmt(x.alcance)}</b> alcance</span>}
                      <span><b>{fmt(x.curtidas)}</b> curtidas</span>
                      <span><b>{fmt(x.comentarios)}</b> coment.</span>
                      {x.salvos != null && <span><b>{fmt(x.salvos)}</b> salvos</span>}
                      {x.compart != null && <span><b>{fmt(x.compart)}</b> compart.</span>}
                      {x.tempo_medio != null && <span><b>{String(x.tempo_medio).replace('.', ',')}s</b> assistidos em média</span>}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function YouTube({ yt }) {
  if (!yt) return <p className="mc-vazio">Carregando o YouTube…</p>
  if (!yt.conectado) return <p className="mc-vazio">YouTube não ligado. Em "Ligar YouTube", cole o link do canal: o painel passa a trazer views e inscritos.</p>
  if (yt.erro) return <p className="mc-vazio mc-vazio--erro">O YouTube respondeu com erro: {yt.erro}</p>
  const top = [...(yt.videos || [])].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
  return (
    <>
      <div className="mc-nums">
        <Num v={null} rotulo="inscritos" sub={yt.inscritos || 'o YouTube não mostrou'} />
        <Num v={yt.views} rotulo={`views nos últimos ${yt.videos?.length || 0} vídeos`} />
        <Num v={yt.videos?.reduce((a, v) => a + (v.curtidas || 0), 0)} rotulo="curtidas nesses vídeos" />
      </div>
      {top.length > 0 && (
        <ol className="mc-top">
          {top.map((v) => (
            <li key={v.link}><a href={v.link} target="_blank" rel="noreferrer">{v.titulo}</a><span>{fmt(v.views)} views · {data(v.quando)}</span></li>
          ))}
        </ol>
      )}
    </>
  )
}

export default function Metricas({ canal, fechar }) {
  const [dias, setDias] = useState(28)
  const [videos, setVideos] = useState(null)
  const [conteudo, setConteudo] = useState([])
  const [conta, setConta] = useState(null)
  const [atualizando, setAtualizando] = useState(false)

  async function carregarPainel() {
    const [v, c] = await Promise.all([
      supabase.from('videos').select('id,canal,video_url,ig_status,ig_postado_em,ig_agendado_para,ig_views,yt_status,yt_postado_em,yt_programado_para,yt_views,tt_status,tt_postado_em,tt_programado_para,conferido_em').eq('canal', canal.id),
      canal.id === 'tavin-digital' ? supabase.from('conteudo').select('id,formato,status,publicado_em,agendado_para') : Promise.resolve({ data: [] }),
    ])
    setVideos(v.data || []); setConteudo(c.data || [])
  }
  async function carregarConta(d = dias) {
    setConta(null)
    const { data: r, error } = await supabase.functions.invoke('conferir-postagens', { body: { conta: canal.id, dias: d } })
    setConta(error || !r?.ok ? { instagram: { conectado: true, erro: 'não consegui falar com o servidor' }, youtube: { conectado: true, erro: 'não consegui falar com o servidor' } } : r)
  }
  async function atualizar() {
    setAtualizando(true)
    await supabase.functions.invoke('conferir-postagens', { body: {} })
    await Promise.all([carregarPainel(), carregarConta()])
    setAtualizando(false)
  }
  useEffect(() => { carregarPainel(); carregarConta() }, [canal.id])
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', esc)
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = o }
  }, [fechar])

  const painel = useMemo(() => (videos ? resumoPainel(canal.id, videos, conteudo, Math.min(dias, 28)) : null), [videos, conteudo, dias, canal.id])
  const views = (videos || []).reduce((a, v) => a + (v.yt_views || 0) + (v.ig_views || 0), 0)
  const ig = conta?.instagram, yt = conta?.youtube
  const trocar = (d) => { setDias(d); carregarConta(d) }

  return (
    <div className="mt-fundo" onClick={fechar}>
      <div className="mt-janela mc" role="dialog" aria-modal="true" aria-label={`Métricas de ${canal.nome}`} onClick={(e) => e.stopPropagation()} style={{ '--c': canal.cor }}>
        <header className="mc-cab">
          <span className="mc-avatar">{ig?.perfil?.foto ? <img src={ig.perfil.foto} alt="" /> : canal.sigla}</span>
          <div className="mc-quem">
            <h2>{canal.nome}</h2>
            <p>{ig?.perfil?.username ? <a href={`https://instagram.com/${ig.perfil.username}`} target="_blank" rel="noreferrer">@{ig.perfil.username}</a> : 'Métricas do canal'}
              {yt?.conectado && yt.nome ? <> · <a href={yt.link} target="_blank" rel="noreferrer">{yt.nome} no YouTube</a></> : ''}</p>
          </div>
          <div className="mc-acoes">
            <div className="mc-periodo" role="group" aria-label="Período">
              {[7, 14, 28].map((d) => <button key={d} type="button" className={dias === d ? 'on' : ''} aria-pressed={dias === d} onClick={() => trocar(d)}>{d} dias</button>)}
            </div>
            <button className="p-btn p-btn--mini" onClick={atualizar} disabled={atualizando}>{atualizando ? 'Atualizando…' : 'Atualizar'}</button>
            <button className="p-btn p-btn--mini p-btn--fraco" onClick={fechar}>Fechar</button>
          </div>
        </header>

        <section className="mc-bloco">
          <h3>Instagram <span>últimos {dias} dias</span></h3>
          <Instagram ig={ig} dias={dias} cor={canal.cor} />
        </section>

        <section className="mc-bloco">
          <h3>YouTube <span>vídeos mais recentes do canal</span></h3>
          <YouTube yt={yt} />
        </section>

        <section className="mc-bloco">
          <h3>No painel <span>o que o painel acompanha deste canal</span></h3>
          {!painel ? <p className="mc-vazio">Carregando…</p> : (
            <>
              <div className="mc-nums">
                <Num v={painel.noAr} rotulo="no ar" />
                <Num v={painel.noPeriodo} rotulo={`postados em ${Math.min(dias, 28)} dias`} />
                <Num v={painel.programados} rotulo="programados" />
                <Num v={painel.prontos} rotulo="prontos para programar" />
                <Num v={views} rotulo="views registradas" />
              </div>
              <Barras serie={painel.serie} cor={canal.cor} unidade="posts" titulo="Posts por dia" />
              <p className="mc-rodape">
                {painel.proximo ? `Próximo post: ${quando(painel.proximo)}` : 'Nada programado'}
                {painel.conferido ? ` · conferido nas redes ${quando(painel.conferido)}` : ''}
                {canal.tipo === 'shorts' ? ' · TikTok não abre os números: lá vale o horário programado' : ''}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
