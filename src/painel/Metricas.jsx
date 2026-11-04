import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

// Métricas de UM perfil (abre pelo botão "Métricas" no topo do canal ou pela página Métricas do menu).
// Tudo vem da função "metricas" (Instagram Graph API + YouTube Data API, com 15 min de cache) e do histórico diário.
const FUSO = 'America/Sao_Paulo'
export const fmt = (n) => (n == null || Number.isNaN(n) ? '—' : Intl.NumberFormat('pt-BR', { notation: Math.abs(n) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n))
const pct = (n) => (n == null ? '—' : `${String(Math.round(n * 10) / 10).replace('.', ',')}%`)
const diaSP = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
const dm = (k) => k.split('-').reverse().slice(0, 2).join('/')
const quando = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')
const data = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: 'short' }) : '')
export const ha = (iso) => {
  if (!iso) return ''
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 2) return 'agora'
  if (m < 60) return `há ${m} min`
  if (m < 1440) return `há ${Math.round(m / 60)} h`
  const d = Math.round(m / 1440)
  return d === 1 ? 'ontem' : `há ${d} dias`
}
const dur = (s) => (s == null ? '' : s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)
const soma = (l, k) => l.reduce((a, x) => a + (Number(x[k]) || 0), 0)
const media = (l, k) => { const v = l.map((x) => x[k]).filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }

const TIPO = { AD: 'Anúncios', REEL: 'Reels', STORY: 'Stories', POST: 'Posts', CAROUSEL_CONTAINER: 'Carrosséis', IGTV: 'Vídeos', LIVE: 'Lives' }
const QUEM = { FOLLOWER: 'Seguidores', NON_FOLLOWER: 'Não seguidores' }
const GENERO = { M: 'Homens', F: 'Mulheres', U: 'Não informado' }
let paises = null
try { paises = new Intl.DisplayNames(['pt-BR'], { type: 'region' }) } catch { /* navegador antigo */ }
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const FAIXAS = [[0, 6, 'Madrugada'], [6, 9, '6h–9h'], [9, 12, '9h–12h'], [12, 15, '12h–15h'], [15, 18, '15h–18h'], [18, 21, '18h–21h'], [21, 24, '21h–24h']]

// ── peças ──
export function Delta({ atual, antes, inverso }) {
  if (atual == null || antes == null || antes === 0) return null
  const d = ((atual - antes) / antes) * 100
  if (Math.abs(d) < 0.5) return <small className="mc-delta">= igual ao período anterior</small>
  const sobe = d > 0
  return <small className={`mc-delta ${sobe !== !!inverso ? 'mc-delta--bom' : 'mc-delta--ruim'}`}>{sobe ? '▲' : '▼'} {pct(Math.abs(d))} <span>vs período anterior</span></small>
}

export function Num({ v, rotulo, sub, txt, children }) {
  return <div className="mc-num"><b>{txt ?? fmt(v)}</b><span>{rotulo}</span>{sub && <small>{sub}</small>}{children}</div>
}

// Barras verticais de uma série (cor do perfil). Passar o mouse mostra o valor na linha de cima.
function Barras({ serie, cor, unidade, titulo, total = true }) {
  const [sel, setSel] = useState(null)
  if (!serie?.length) return null
  const max = Math.max(1, ...serie.map((d) => d.n))
  const d = sel != null ? serie[sel] : null
  const rot = (x) => x.r ?? dm(x.k)
  return (
    <figure className="mc-graf">
      <figcaption>
        <span>{titulo}</span>
        <b aria-live="polite">{d ? `${rot(d)}: ${fmt(d.n)} ${unidade}` : total ? `${fmt(soma(serie, 'n'))} no período` : ''}</b>
      </figcaption>
      <div className="mc-barras" style={{ gridTemplateColumns: `repeat(${serie.length}, 1fr)` }} onMouseLeave={() => setSel(null)}>
        {serie.map((x, i) => (
          <span key={x.k} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onBlur={() => setSel(null)} tabIndex={0}
            aria-label={`${rot(x)}: ${x.n} ${unidade}`} className={sel === i ? 'on' : ''}>
            <i style={{ height: `${(x.n / max) * 100}%`, background: x.n ? cor : undefined }} />
          </span>
        ))}
      </div>
      <div className="mc-eixo"><span>{rot(serie[0])}</span><span>{rot(serie[serie.length - 1])}</span></div>
    </figure>
  )
}

// Linha (histórico de seguidores/inscritos). Eixo começa perto do mínimo para a variação aparecer.
function Linha({ pontos, cor, titulo, unidade }) {
  const [sel, setSel] = useState(null)
  if (!pontos || pontos.length < 2) return null
  const W = 600, H = 120, P = 6
  const ns = pontos.map((p) => p.n), min = Math.min(...ns), max = Math.max(...ns), faixa = Math.max(1, max - min)
  const x = (i) => P + (i / (pontos.length - 1)) * (W - P * 2)
  const y = (n) => H - P - ((n - min) / faixa) * (H - P * 2)
  const d = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.n).toFixed(1)}`).join(' ')
  const s = sel != null ? pontos[sel] : null
  const ganho = ns[ns.length - 1] - ns[0]
  return (
    <figure className="mc-graf">
      <figcaption><span>{titulo}</span><b aria-live="polite">{s ? `${dm(s.k)}: ${fmt(s.n)} ${unidade}` : `${ganho >= 0 ? '+' : ''}${fmt(ganho)} desde ${dm(pontos[0].k)}`}</b></figcaption>
      <svg className="mc-linha-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${titulo}: de ${fmt(ns[0])} para ${fmt(ns[ns.length - 1])}`}
        onMouseLeave={() => setSel(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSel(Math.max(0, Math.min(pontos.length - 1, Math.round(((e.clientX - r.left) / r.width) * (pontos.length - 1))))) }}>
        <path d={`${d} L${x(pontos.length - 1)} ${H} L${x(0)} ${H} Z`} fill={cor} opacity=".12" />
        <path d={d} fill="none" stroke={cor} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {s && <line x1={x(sel)} x2={x(sel)} y1="0" y2={H} stroke="currentColor" opacity=".25" vectorEffect="non-scaling-stroke" />}
        {s && <circle cx={x(sel)} cy={y(s.n)} r="4" fill={cor} stroke="var(--branco)" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="mc-eixo"><span>{dm(pontos[0].k)}</span><span>{dm(pontos[pontos.length - 1].k)}</span></div>
    </figure>
  )
}

// Barras horizontais com % do total (de onde vêm as views, público, interações)
function Partes({ titulo, itens, cor, nota }) {
  if (!itens?.length) return null
  const total = soma(itens, 'n') || 1
  const max = Math.max(...itens.map((i) => i.n), 1)
  return (
    <div className="mc-partes">
      <h4>{titulo}</h4>
      <ul>
        {itens.map((i) => (
          <li key={i.k}>
            <span className="mc-partes-nome">{i.r ?? i.k}</span>
            <span className="mc-partes-trilho"><i style={{ width: `${(i.n / max) * 100}%`, background: cor }} /></span>
            <span className="mc-partes-n"><b>{fmt(i.n)}</b> {pct((i.n / total) * 100)}</span>
          </li>
        ))}
      </ul>
      {nota && <p className="mc-nota">{nota}</p>}
    </div>
  )
}

// Média de views por dia da semana e por faixa de horário (dos posts listados)
function MelhorHora({ itens, cor, chave }) {
  const comNum = itens.filter((p) => p[chave] != null && p.quando)
  if (comNum.length < 6) return null
  const porDia = SEMANA.map((r, i) => {
    const l = comNum.filter((p) => new Date(new Date(p.quando).toLocaleString('en-US', { timeZone: FUSO })).getDay() === i)
    return { k: `d${i}`, r, n: Math.round(media(l, chave) || 0), q: l.length }
  })
  const hora = (iso) => new Date(new Date(iso).toLocaleString('en-US', { timeZone: FUSO })).getHours()
  const porHora = FAIXAS.map(([a, b, r]) => {
    const l = comNum.filter((p) => { const h = hora(p.quando); return h >= a && h < b })
    return { k: r, r, n: Math.round(media(l, chave) || 0), q: l.length }
  }).filter((x) => x.q)
  const top = (l) => l.filter((x) => x.q).sort((a, b) => b.n - a.n)[0]
  const td = top(porDia), th = top(porHora)
  return (
    <div className="mc-dupla">
      <div>
        <Barras serie={porDia} cor={cor} unidade={`${chave === 'views' ? 'views' : 'de alcance'} em média`} titulo="Média por dia da semana" total={false} />
        {td && <p className="mc-nota">Melhor dia: <b>{td.r}</b> ({td.q} posts, {fmt(td.n)} em média)</p>}
      </div>
      <div>
        <Barras serie={porHora} cor={cor} unidade={`${chave === 'views' ? 'views' : 'de alcance'} em média`} titulo="Média por horário da postagem" total={false} />
        {th && <p className="mc-nota">Melhor horário: <b>{th.r}</b> ({th.q} posts)</p>}
      </div>
    </div>
  )
}

function Formatos({ posts }) {
  const grupos = Object.entries(posts.reduce((g, p) => ((g[p.tipo] ||= []).push(p), g), {}))
  if (grupos.length < 2) return null
  return (
    <div className="mc-tabela-rolagem">
      <table className="mc-tabela">
        <caption>Desempenho por formato (últimos {posts.length} posts)</caption>
        <thead><tr><th scope="col">Formato</th><th scope="col">Posts</th><th scope="col">Views média</th><th scope="col">Alcance médio</th><th scope="col">Engajamento</th><th scope="col">Salvos + compart.</th></tr></thead>
        <tbody>
          {grupos.sort((a, b) => (media(b[1], 'views') || 0) - (media(a[1], 'views') || 0)).map(([t, l]) => (
            <tr key={t}><th scope="row">{t}</th><td>{l.length}</td><td>{fmt(Math.round(media(l, 'views') ?? NaN))}</td><td>{fmt(Math.round(media(l, 'alcance') ?? NaN))}</td><td>{pct(media(l, 'engaj'))}</td><td>{fmt(soma(l, 'salvos') + soma(l, 'compart'))}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ORDENS_IG = [['quando', 'Mais recentes'], ['views', 'Mais views'], ['alcance', 'Mais alcance'], ['engaj', 'Mais engajamento'], ['salvos', 'Mais salvos'], ['compart', 'Mais compartilhados'], ['comentarios', 'Mais comentados']]

function PostsIG({ posts, cor }) {
  const [ordem, setOrdem] = useState('quando')
  const [tipo, setTipo] = useState('')
  const tipos = [...new Set(posts.map((p) => p.tipo))]
  const lista = useMemo(() => posts.filter((p) => !tipo || p.tipo === tipo)
    .sort((a, b) => (ordem === 'quando' ? String(b.quando).localeCompare(String(a.quando)) : (b[ordem] ?? -1) - (a[ordem] ?? -1))), [posts, ordem, tipo])
  const melhor = posts.reduce((m, x) => ((x.views ?? x.alcance ?? -1) > (m?.views ?? m?.alcance ?? -1) ? x : m), null)
  return (
    <>
      <div className="mc-sub">
        <h4>Posts <span>{lista.length} de {posts.length}</span></h4>
        <div className="mc-filtros">
          {tipos.length > 1 && (
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Formato">
              <option value="">Todos os formatos</option>{tipos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
            {ORDENS_IG.map(([k, r]) => <option key={k} value={k}>{r}</option>)}
          </select>
        </div>
      </div>
      <ul className="mc-posts" style={{ '--c': cor }}>
        {lista.map((x) => (
          <li key={x.id} className={melhor?.id === x.id && posts.length > 1 ? 'mc-post--melhor' : ''}>
            <a href={x.link} target="_blank" rel="noreferrer" title={x.legenda}>
              <span className="mc-capa">{x.capa ? <img src={x.capa} alt="" loading="lazy" /> : <em>{x.tipo}</em>}</span>
              <span className="mc-post-txt">
                <small>{x.tipo} · {data(x.quando)}{melhor?.id === x.id && posts.length > 1 ? ' · o melhor' : ''}</small>
                <strong>{x.legenda || 'Sem legenda'}</strong>
                <span className="mc-post-nums">
                  {x.views != null && <span><b>{fmt(x.views)}</b> views</span>}
                  {x.alcance != null && <span><b>{fmt(x.alcance)}</b> alcance</span>}
                  <span><b>{fmt(x.curtidas)}</b> curtidas</span>
                  <span><b>{fmt(x.comentarios)}</b> coment.</span>
                  {x.salvos != null && <span><b>{fmt(x.salvos)}</b> salvos</span>}
                  {x.compart != null && <span><b>{fmt(x.compart)}</b> compart.</span>}
                  {x.engaj != null && <span><b>{pct(x.engaj)}</b> engaj.</span>}
                  {x.tempo_medio != null && <span><b>{String(x.tempo_medio).replace('.', ',')}s</b> assistidos</span>}
                  {x.pulos != null && <span><b>{pct(x.pulos)}</b> pularam</span>}
                  {x.seguiu > 0 && <span><b>{fmt(x.seguiu)}</b> seguiram</span>}
                  {x.visitas > 0 && <span><b>{fmt(x.visitas)}</b> visitas</span>}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

// ── Instagram ──
function Instagram({ ig, dias, cor, hist }) {
  if (!ig) return <Carregando />
  if (!ig.conectado) return <p className="mc-vazio">Instagram não conectado. Ligue a conta em Integrações, no topo do canal, para ver seguidores, alcance e o desempenho de cada post.</p>
  if (ig.erro) return <p className="mc-vazio mc-vazio--erro">O Instagram respondeu com erro: {ig.erro}. Se o token venceu, troque em Integrações.</p>
  const p = ig.periodo || {}, a = ig.anterior || {}
  const liquido = p.seguiu != null ? (p.seguiu || 0) - (p.deixou || 0) : null
  const engaj = p.reach ? (p.total_interactions / p.reach) * 100 : null
  const engajAntes = a.reach ? (a.total_interactions / a.reach) * 100 : null
  const posts = ig.posts || []
  const historico = (hist || []).filter((h) => h.rede === 'instagram' && h.seguidores != null).map((h) => ({ k: h.dia, n: h.seguidores }))
  const tipoViews = (ig.por_tipo?.views || []).map((x) => ({ ...x, r: TIPO[x.k] || x.k }))
  const anuncio = tipoViews.find((x) => x.k === 'AD')?.n || 0
  const totalViews = soma(tipoViews, 'n')
  const quem = (ig.alcance_quem || []).map((x) => ({ ...x, r: QUEM[x.k] || x.k }))
  const naoSeg = quem.find((x) => x.k === 'NON_FOLLOWER')?.n
  const pub = ig.publico
  const chaveHora = posts.some((x) => x.views != null) ? 'views' : 'alcance'
  return (
    <>
      <div className="mc-nums">
        <Num v={ig.perfil?.seguidores} rotulo="seguidores" sub={liquido != null ? `${liquido >= 0 ? '+' : ''}${fmt(liquido)} em ${dias} dias` : null}>{p.seguiu != null && <small className="mc-delta">{fmt(p.seguiu)} entraram · {fmt(p.deixou)} saíram</small>}</Num>
        <Num v={p.reach} rotulo="contas alcançadas"><Delta atual={p.reach} antes={a.reach} /></Num>
        <Num v={p.views} rotulo="visualizações"><Delta atual={p.views} antes={a.views} /></Num>
        <Num v={p.total_interactions} rotulo="interações"><Delta atual={p.total_interactions} antes={a.total_interactions} /></Num>
        <Num txt={pct(engaj)} rotulo="engajamento (interações ÷ alcance)"><Delta atual={engaj} antes={engajAntes} /></Num>
        <Num v={p.profile_views} rotulo="visitas ao perfil"><Delta atual={p.profile_views} antes={a.profile_views} /></Num>
        <Num v={p.accounts_engaged} rotulo="contas que interagiram"><Delta atual={p.accounts_engaged} antes={a.accounts_engaged} /></Num>
        <Num v={(p.profile_links_taps || 0) + (p.website_clicks || 0)} rotulo="cliques no link da bio" />
      </div>
      {ig.sem_insights && <p className="mc-aviso">A conta não liberou os números de alcance (falta a permissão de insights no token). Gere o token com "instagram_business_manage_insights".</p>}
      {anuncio > 0 && totalViews > 0 && (
        <p className="mc-aviso"><b>{pct((anuncio / totalViews) * 100)} das views vieram de anúncio</b> ({fmt(anuncio)} de {fmt(totalViews)}). Orgânico no período: {fmt(totalViews - anuncio)} views.</p>
      )}

      <div className="mc-dupla">
        <Barras serie={(ig.alcance_dia || []).map((d) => ({ k: d.dia, n: d.n }))} cor={cor} unidade="de alcance" titulo="Alcance por dia" />
        <Barras serie={(ig.seguidores_dia || []).map((d) => ({ k: d.dia, n: d.n }))} cor={cor} unidade="seguidores novos" titulo="Seguidores novos por dia" />
      </div>
      {historico.length >= 2
        ? <Linha pontos={historico} cor={cor} titulo="Seguidores ao longo do tempo" unidade="seguidores" />
        : <p className="mc-nota">A curva de seguidores ao longo do tempo começa hoje: o painel guarda o número uma vez por dia.</p>}

      <div className="mc-dupla">
        <Partes titulo="De onde vieram as views" itens={tipoViews} cor={cor} />
        <Partes titulo="Quem foi alcançado" itens={quem} cor={cor}
          nota={naoSeg != null && p.reach ? `${pct((naoSeg / (soma(quem, 'n') || 1)) * 100)} do alcance foi de quem ainda não te segue.` : null} />
        <Partes titulo="Interações por formato" itens={(ig.por_tipo?.interacoes || []).map((x) => ({ ...x, r: TIPO[x.k] || x.k }))} cor={cor} />
        <Partes titulo="Tipo de interação" cor={cor} itens={[['Curtidas', p.likes], ['Compartilhamentos', p.shares], ['Salvos', p.saves], ['Comentários', p.comments]].filter(([, n]) => n != null).map(([k, n]) => ({ k, n }))} />
      </div>

      <h4 className="mc-titulo">Quem te segue</h4>
      {pub ? (
        <div className="mc-dupla">
          <Partes titulo="Idade" itens={[...(pub.idade || [])].sort((x, y) => x.k.localeCompare(y.k))} cor={cor} />
          <Partes titulo="Gênero" itens={(pub.genero || []).map((x) => ({ ...x, r: GENERO[x.k] || x.k }))} cor={cor} />
          <Partes titulo="Cidades" itens={(pub.cidade || []).slice(0, 6).map((x) => ({ ...x, r: x.k.split(',')[0] }))} cor={cor} />
          <Partes titulo="Países" itens={(pub.pais || []).slice(0, 5).map((x) => ({ ...x, r: paises?.of(x.k) || x.k }))} cor={cor} />
        </div>
      ) : <p className="mc-nota">O Instagram só mostra idade, gênero e cidade de quem segue a partir de 100 seguidores.</p>}

      {posts.length > 0 && (
        <>
          <h4 className="mc-titulo">O que funciona</h4>
          <Formatos posts={posts} />
          <MelhorHora itens={posts} cor={cor} chave={chaveHora} />
          <PostsIG posts={posts} cor={cor} />
        </>
      )}
    </>
  )
}

// ── YouTube ──
const ORDENS_YT = [['quando', 'Mais recentes'], ['views', 'Mais views'], ['engaj', 'Mais engajamento'], ['curtidas', 'Mais curtidas'], ['comentarios', 'Mais comentados']]

function YouTube({ yt, dias, cor, hist }) {
  const [ordem, setOrdem] = useState('quando')
  const [mais, setMais] = useState(false)
  if (!yt) return <Carregando />
  if (!yt.conectado) return <p className="mc-vazio">YouTube não ligado. Em Integrações, cole o link do canal.</p>
  if (yt.erro) return <p className="mc-vazio mc-vazio--erro">O YouTube respondeu com erro: {yt.erro}</p>
  const vids = yt.videos || []
  const desde = Date.now() - dias * 86400000
  const novos = vids.filter((v) => v.quando && new Date(v.quando).getTime() >= desde)
  const h = (hist || []).filter((x) => x.rede === 'youtube')
  const hIns = h.filter((x) => x.seguidores != null).map((x) => ({ k: x.dia, n: x.seguidores }))
  const hViews = h.filter((x) => x.views_total != null).map((x) => ({ k: x.dia, n: Number(x.views_total) }))
  const dentro = (l) => l.filter((x) => new Date(`${x.k}T12:00:00`).getTime() >= desde - 86400000)
  const insP = dentro(hIns), viewsP = dentro(hViews)
  const ganhoIns = insP.length >= 2 ? insP[insP.length - 1].n - insP[0].n : null
  const viewsPeriodo = viewsP.length >= 2 ? viewsP[viewsP.length - 1].n - viewsP[0].n : null
  const viewsDia = hViews.slice(1).map((x, i) => ({ k: x.k, n: Math.max(0, x.n - hViews[i].n) }))
  const ultimos = vids.slice(0, 20)
  const shorts = vids.filter((v) => v.short === true), longos = vids.filter((v) => v.short === false)
  const lista = [...vids].sort((a, b) => (ordem === 'quando' ? String(b.quando).localeCompare(String(a.quando)) : (b[ordem] ?? -1) - (a[ordem] ?? -1)))
  const visiveis = mais ? lista : lista.slice(0, 12)
  return (
    <>
      {yt.sem_chave && (
        <p className="mc-aviso">Sem a chave da API do YouTube o painel só enxerga os 15 vídeos mais recentes, sem inscritos exatos nem comentários. Cole a chave em <b>Integrações → YouTube</b> (vale para todos os canais).</p>
      )}
      {yt.erro_api && <p className="mc-aviso mc-vazio--erro">A chave do YouTube deu erro ({yt.erro_api}). Mostrando o feed público por enquanto.</p>}
      <div className="mc-nums">
        <Num v={yt.inscritos} txt={yt.inscritos == null ? (yt.inscritos_txt || '—') : undefined} rotulo="inscritos"
          sub={ganhoIns != null ? `${ganhoIns >= 0 ? '+' : ''}${fmt(ganhoIns)} em ${dias} dias` : yt.inscritos_ocultos ? 'o canal esconde o número' : null} />
        {yt.views_total != null && <Num v={yt.views_total} rotulo="views no canal (total)" sub={viewsPeriodo != null ? `+${fmt(viewsPeriodo)} em ${dias} dias` : null} />}
        {yt.total_videos != null && <Num v={yt.total_videos} rotulo="vídeos no canal" />}
        <Num v={novos.length} rotulo={`vídeos postados em ${dias} dias`} sub={novos.length ? `${fmt(soma(novos, 'views'))} views neles` : null} />
        <Num v={Math.round(media(ultimos, 'views') ?? NaN)} rotulo={`views por vídeo (últimos ${ultimos.length})`} />
        <Num txt={pct(media(ultimos.filter((v) => v.views), 'engaj'))} rotulo="engajamento (curtidas + coment. ÷ views)" />
      </div>
      {viewsDia.length >= 2 && <Barras serie={viewsDia} cor={cor} unidade="views" titulo="Views do canal por dia" />}
      {hIns.length >= 2
        ? <Linha pontos={hIns} cor={cor} titulo="Inscritos ao longo do tempo" unidade="inscritos" />
        : !yt.sem_chave && <p className="mc-nota">A curva de inscritos e de views por dia começa hoje: o painel guarda os números uma vez por dia.</p>}
      {ultimos.length > 1 && (
        <Barras serie={[...ultimos].reverse().map((v) => ({ k: v.id, r: data(v.quando), n: v.views || 0 }))} cor={cor} unidade="views" titulo={`Views dos últimos ${ultimos.length} vídeos (do mais antigo ao mais novo)`} total={false} />
      )}
      {shorts.length > 0 && longos.length > 0 && (
        <p className="mc-linha">Shorts: {shorts.length} vídeos, {fmt(Math.round(media(shorts, 'views')))} views em média · Longos: {longos.length} vídeos, {fmt(Math.round(media(longos, 'views')))} views em média</p>
      )}
      <MelhorHora itens={vids.slice(0, 60)} cor={cor} chave="views" />
      {vids.length > 0 && (
        <>
          <div className="mc-sub">
            <h4>Vídeos <span>{vids.length} lidos</span></h4>
            <div className="mc-filtros">
              <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">{ORDENS_YT.map(([k, r]) => <option key={k} value={k}>{r}</option>)}</select>
            </div>
          </div>
          <ul className="mc-posts mc-posts--yt">
            {visiveis.map((v) => (
              <li key={v.id}>
                <a href={v.link} target="_blank" rel="noreferrer" title={v.titulo}>
                  <span className="mc-capa mc-capa--yt">{v.capa ? <img src={v.capa} alt="" loading="lazy" /> : null}{v.duracao != null && <em className="mc-dur">{dur(v.duracao)}</em>}</span>
                  <span className="mc-post-txt">
                    <small>{v.short ? 'short' : v.short === false ? 'vídeo' : 'vídeo'} · {data(v.quando)}</small>
                    <strong>{v.titulo}</strong>
                    <span className="mc-post-nums">
                      <span><b>{fmt(v.views)}</b> views</span>
                      {v.curtidas != null && <span><b>{fmt(v.curtidas)}</b> curtidas</span>}
                      {v.comentarios != null && <span><b>{fmt(v.comentarios)}</b> coment.</span>}
                      {v.engaj != null && <span><b>{pct(v.engaj)}</b> engaj.</span>}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {lista.length > 12 && <button type="button" className="p-btn p-btn--mini p-btn--fraco mc-mais" onClick={() => setMais(!mais)}>{mais ? 'Mostrar menos' : `Ver todos os ${lista.length}`}</button>}
        </>
      )}
    </>
  )
}

// ── O que o painel acompanha ──
const noAr = (v) => v.ig_status === 'publicado' || v.yt_status === 'postado' || v.tt_status === 'postado'
const programado = (v) => !noAr(v) && (['agendado', 'programado', 'processando'].includes(v.ig_status) || v.yt_status === 'programado' || v.tt_status === 'programado')
const saiuEm = (v) => [v.ig_postado_em, v.yt_postado_em, v.tt_postado_em].filter(Boolean).sort()[0] || null

function NoPainel({ canal, dias, cor }) {
  const [videos, setVideos] = useState(null)
  const [conteudo, setConteudo] = useState([])
  useEffect(() => {
    Promise.all([
      supabase.from('videos').select('id,video_url,ig_status,ig_postado_em,ig_agendado_para,ig_views,yt_status,yt_postado_em,yt_programado_para,yt_views,tt_status,tt_postado_em,tt_programado_para,conferido_em').eq('canal', canal.id),
      canal.id === 'tavin-digital' ? supabase.from('conteudo').select('id,formato,status,publicado_em,agendado_para') : Promise.resolve({ data: [] }),
    ]).then(([v, c]) => { setVideos(v.data || []); setConteudo(c.data || []) })
  }, [canal.id])
  if (!videos) return <Carregando />
  const cs = canal.id === 'tavin-digital' ? conteudo.filter((c) => ['carrossel', 'estatico'].includes(c.formato)) : []
  const n = Math.min(dias, 28)
  const datas = [...videos.filter(noAr).map(saiuEm), ...cs.filter((c) => c.status === 'publicado').map((c) => c.publicado_em)].filter(Boolean)
  const serie = Array.from({ length: n }, (_, i) => {
    const k = diaSP(new Date(Date.now() - (n - 1 - i) * 86400000).toISOString())
    return { k, n: datas.filter((x) => diaSP(x) === k).length }
  })
  const proximo = videos.filter(programado).map((v) => [v.ig_agendado_para, v.yt_programado_para, v.tt_programado_para].filter(Boolean).sort()[0])
    .concat(cs.filter((c) => c.status === 'agendado').map((c) => c.agendado_para)).filter(Boolean).sort()[0]
  const progs = videos.filter(programado).length + cs.filter((c) => ['agendado', 'publicando'].includes(c.status)).length
  const prontos = videos.filter((v) => v.video_url && !noAr(v) && !programado(v)).length + cs.filter((c) => c.status === 'pronto').length
  const conferido = videos.map((v) => v.conferido_em).filter(Boolean).sort().pop()
  return (
    <>
      <div className="mc-nums">
        <Num v={videos.filter(noAr).length + cs.filter((c) => c.status === 'publicado').length} rotulo="no ar" />
        <Num v={soma(serie, 'n')} rotulo={`postados em ${n} dias`} />
        <Num v={progs} rotulo="programados" sub={proximo ? `próximo ${quando(proximo)}` : null} />
        <Num v={prontos} rotulo="prontos para programar" />
      </div>
      <Barras serie={serie} cor={cor} unidade="posts" titulo="Posts por dia" />
      <p className="mc-rodape">
        {progs ? `${progs} na fila: dá ${progs === 1 ? '1 dia' : `${progs} dias`} de postagem se for 1 por dia.` : 'Fila vazia.'}
        {conferido ? ` Conferido nas redes ${quando(conferido)}.` : ''}
        {canal.tipo === 'shorts' ? ' TikTok não abre os números: lá vale o horário programado.' : ''}
      </p>
    </>
  )
}

function Carregando() {
  return <div className="mc-carregando" role="status"><span /><span /><span /><span /><p>Buscando os números nas redes…</p></div>
}

// ── janela ──
const ABAS = [['ig', 'Instagram'], ['yt', 'YouTube'], ['tt', 'TikTok'], ['painel', 'No painel']]
// cada rede com a sua cor e o seu ícone, para não confundir os números de uma com os da outra
const REDE = {
  ig: { cor: '#D62F8C', d: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01', txt: 'Números do Instagram' },
  yt: { cor: '#E02424', d: 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9l5 3-5 3z', txt: 'Números do YouTube' },
  tt: { cor: '#0E0E10', d: 'M14 3v11a4 4 0 1 1-4-4M14 3c0 3 2 5 5 5', txt: 'Números do TikTok' },
  painel: { cor: '#6E56CF', d: 'M3 3v18h18M7 15l4-4 3 3 6-7', txt: 'O que saiu pelo painel (todas as redes)' },
}
const IcoRede = ({ k }) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={REDE[k].d} /></svg>

// TikTok: o perfil público é lido de hora em hora (seguidores, curtidas e quantidade de vídeos).
// Views por vídeo só com o app oficial do TikTok (Display API), que precisa de aprovação.
function TikTok({ hist, dias, cor, handle }) {
  const h = (hist || []).filter((x) => x.rede === 'tiktok')
  if (!handle) return <p className="mc-vazio">TikTok não ligado. Em Integrações → TikTok, coloque o @ do perfil.</p>
  if (!h.length) return <p className="mc-vazio">@{handle.replace('@', '')} ligado. Os primeiros números chegam na próxima hora cheia.</p>
  const desde = Date.now() - dias * 86400000
  const serie = (k) => h.filter((x) => x[k] != null).map((x) => ({ k: x.dia, n: Number(x[k]) }))
  const seg = serie('seguidores'), curt = serie('views_total'), vids = serie('posts')
  const dentro = (l) => l.filter((x) => new Date(`${x.k}T12:00:00`).getTime() >= desde - 86400000)
  const ganho = (l) => { const d = dentro(l); return d.length >= 2 ? d[d.length - 1].n - d[0].n : null }
  const ult = h[h.length - 1]
  const curtDia = curt.slice(1).map((x, i) => ({ k: x.k, n: Math.max(0, x.n - curt[i].n) }))
  const mais = (n) => (n == null ? null : `${n >= 0 ? '+' : ''}${fmt(n)} em ${dias} dias`)
  return (
    <>
      <div className="mc-nums">
        <Num v={ult.seguidores} rotulo="seguidores" sub={mais(ganho(seg))} />
        <Num v={ult.views_total} rotulo="curtidas no perfil (total)" sub={mais(ganho(curt))} />
        <Num v={ult.posts} rotulo="vídeos publicados" sub={mais(ganho(vids))} />
      </div>
      <Linha pontos={dentro(seg)} cor={cor} titulo="Seguidores" unidade="seguidores" />
      {curtDia.length > 1 && <Barras serie={dentro(curtDia).slice(-dias)} cor={cor} unidade="curtidas" titulo="Curtidas ganhas por dia" />}
      <p className="mc-rodape">Perfil <a href={`https://www.tiktok.com/@${handle.replace('@', '')}`} target="_blank" rel="noreferrer">@{handle.replace('@', '')}</a>. O TikTok não mostra views por vídeo no perfil público: para ter isso, o caminho é o app oficial do TikTok (Display API), que pede aprovação.</p>
    </>
  )
}

export default function Metricas({ canal, fechar = () => {}, abaInicial, embutido = false }) {
  const [dias, setDias] = useState(28)
  const [aba, setAba] = useState(abaInicial || 'ig')
  const [conta, setConta] = useState(null)
  const [hist, setHist] = useState([])
  const [atualizando, setAtualizando] = useState(false)

  async function carregar(d = dias, forcar = false) {
    if (!forcar) setConta(null)
    const { data: r, error } = await supabase.functions.invoke('metricas', { body: { acao: 'canal', canal: canal.id, dias: d, forcar } })
    const falha = { conectado: true, erro: 'não consegui falar com o servidor' }
    setConta(error || !r?.ok ? { instagram: falha, youtube: falha } : r)
    const { data: h } = await supabase.from('metricas_diarias').select('rede,dia,seguidores,posts,views_total')
      .eq('canal', canal.id).gte('dia', new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)).order('dia')
    setHist(h || [])
  }
  async function atualizar() { setAtualizando(true); await carregar(dias, true); setAtualizando(false) }
  useEffect(() => { carregar() }, [canal.id])
  useEffect(() => {
    if (embutido) return undefined
    const esc = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', esc)
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = o }
  }, [fechar, embutido])

  const ig = conta?.instagram, yt = conta?.youtube
  const trocar = (d) => { setDias(d); carregar(d) }

  const corpo = (
      <div className={`mt-janela mc${embutido ? ' mc--embutido' : ''}`} role={embutido ? 'region' : 'dialog'} aria-modal={embutido ? undefined : true} aria-label={`Métricas de ${canal.nome}`} onClick={(e) => e.stopPropagation()} style={{ '--c': canal.cor }}>
        <header className="mc-cab">
          <span className="mc-avatar">{ig?.perfil?.foto ? <img src={ig.perfil.foto} alt="" /> : canal.logo ? <img src={canal.logo} alt="" /> : canal.sigla}</span>
          <div className="mc-quem">
            <h2>{canal.nome}</h2>
            <p>
              {ig?.perfil?.username ? <a href={`https://instagram.com/${ig.perfil.username}`} target="_blank" rel="noreferrer">@{ig.perfil.username}</a> : 'Métricas do perfil'}
              {yt?.conectado && !yt.erro && yt.link ? <> · <a href={yt.link} target="_blank" rel="noreferrer">{yt.nome || 'canal'} no YouTube</a></> : ''}
              {conta?.gerado_em ? <> · atualizado {ha(conta.gerado_em)}</> : ''}
            </p>
          </div>
          <div className="mc-acoes">
            <div className="mc-periodo" role="group" aria-label="Período">
              {[7, 14, 28].map((d) => <button key={d} type="button" className={dias === d ? 'on' : ''} aria-pressed={dias === d} onClick={() => trocar(d)}>{d} dias</button>)}
            </div>
            <button className="p-btn p-btn--mini" onClick={atualizar} disabled={atualizando || !conta}>{atualizando ? 'Atualizando…' : 'Atualizar'}</button>
            {!embutido && <button className="p-btn p-btn--mini p-btn--fraco" onClick={fechar}>Fechar</button>}
          </div>
        </header>

        <div className="mc-abas" role="tablist" aria-label="Rede">
          {ABAS.map(([k, r]) => (
            <button key={k} type="button" role="tab" aria-selected={aba === k} className={aba === k ? 'on' : ''} style={{ '--r': REDE[k].cor }} onClick={() => setAba(k)}>
              <IcoRede k={k} />{r}
              {k === 'ig' && ig?.perfil?.seguidores != null && <small>{fmt(ig.perfil.seguidores)}</small>}
              {k === 'yt' && yt?.inscritos != null && <small>{fmt(yt.inscritos)}</small>}
              {k === 'tt' && (() => { const t = hist.filter((x) => x.rede === 'tiktok').at(-1); return t?.seguidores != null ? <small>{fmt(t.seguidores)}</small> : null })()}
            </button>
          ))}
        </div>

        <section className={`mc-bloco mc-bloco--rede mc-bloco--${aba}`} role="tabpanel" style={{ '--r': REDE[aba].cor }}>
          <p className="mc-rede"><IcoRede k={aba} />{REDE[aba].txt}</p>
          {aba === 'ig' && <Instagram ig={ig} dias={dias} cor={canal.cor} hist={hist} />}
          {aba === 'yt' && <YouTube yt={yt} dias={dias} cor={canal.cor} hist={hist} />}
          {aba === 'tt' && <TikTok hist={hist} dias={dias} cor={canal.cor} handle={canal.tiktok} />}
          {aba === 'painel' && <NoPainel canal={canal} dias={dias} cor={canal.cor} />}
        </section>
        <p className="mc-rodape mc-rodape--fim">Os números vêm direto do Instagram, do YouTube e do perfil público do TikTok e ficam guardados por 15 minutos. "Atualizar" busca de novo agora.</p>
      </div>
  )
  if (embutido) return corpo
  return createPortal(<div className="mt-fundo" onClick={fechar}>{corpo}</div>, document.body)
}
