import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CANAIS } from './canais'
import Metricas, { fmt, ha } from './Metricas'

// Página "Métricas" do menu: todos os perfis numa tela só, com os números do Instagram e do YouTube.
// Clicar num perfil abre as métricas completas dele.
const pct = (n) => (n == null ? '—' : `${String(Math.round(n * 10) / 10).replace('.', ',')}%`)
const diasAtras = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

function variacao(hist, canal, rede, dias) {
  const l = hist.filter((h) => h.canal === canal && h.rede === rede && h.seguidores != null)
  if (l.length < 2) return null
  const fim = l[l.length - 1]
  const ini = l.find((h) => h.dia >= diasAtras(dias)) || l[0]
  if (ini === fim) return null
  return { n: fim.seguidores - ini.seguidores, desde: ini.dia }
}

function Var({ v }) {
  if (!v) return null
  return <small className={`mc-delta ${v.n > 0 ? 'mc-delta--bom' : v.n < 0 ? 'mc-delta--ruim' : ''}`}>{v.n > 0 ? '+' : ''}{fmt(v.n)} desde {v.desde.split('-').reverse().slice(0, 2).join('/')}</small>
}

function Cartao({ canal, p, hist, abrir }) {
  const ig = p?.instagram, yt = p?.youtube
  const igOk = ig?.conectado && !ig.erro, ytOk = yt?.conectado && !yt.erro
  const d = ig?.d28 || {}
  const engaj = d.reach ? (d.total_interactions / d.reach) * 100 : null
  const liquido7 = ig?.d7?.seguiu != null ? ig.d7.seguiu - (ig.d7.deixou || 0) : null
  return (
    <article className="mg-card" style={{ '--c': canal.cor }}>
      <button type="button" className="mg-cab" onClick={() => abrir(canal, 'ig')}>
        <span className="mc-avatar">{ig?.foto ? <img src={ig.foto} alt="" /> : canal.logo ? <img src={canal.logo} alt="" /> : canal.sigla}</span>
        <span className="mg-nome"><b>{canal.nome}</b><small>{ig?.username ? `@${ig.username}` : 'Instagram não conectado'}</small></span>
        <span className="mg-abrir">Ver tudo</span>
      </button>

      {!p ? <div className="mc-carregando mc-carregando--mini"><span /><span /></div> : (
        <>
          <div className="mg-rede">
            <h3>Instagram {ig?.ultimo_post && <span>último post {ha(ig.ultimo_post)}</span>}</h3>
            {igOk ? (
              <div className="mg-nums">
                <div><b>{fmt(ig.seguidores)}</b><span>seguidores</span>
                  {liquido7 != null ? <small className={`mc-delta ${liquido7 > 0 ? 'mc-delta--bom' : liquido7 < 0 ? 'mc-delta--ruim' : ''}`}>{liquido7 > 0 ? '+' : ''}{fmt(liquido7)} em 7 dias</small> : <Var v={variacao(hist, canal.id, 'instagram', 7)} />}
                </div>
                <div><b>{fmt(d.reach)}</b><span>alcance 28d</span></div>
                <div><b>{fmt(d.views)}</b><span>views 28d</span></div>
                <div><b>{pct(engaj)}</b><span>engajamento</span></div>
              </div>
            ) : <p className="mc-nota">{ig?.erro ? `Erro: ${ig.erro}` : 'Ligue a conta em Integrações, no canal.'}</p>}
          </div>

          <div className="mg-rede">
            <h3>YouTube {yt?.ultimo_video && <span>último vídeo {ha(yt.ultimo_video)}</span>}</h3>
            {ytOk ? (
              <div className="mg-nums">
                <div><b>{yt.inscritos != null ? fmt(yt.inscritos) : (yt.inscritos_txt || '—').replace(/\s*inscritos?/, '')}</b><span>inscritos</span><Var v={variacao(hist, canal.id, 'youtube', 7)} /></div>
                <div><b>{fmt(yt.views_total)}</b><span>views no canal</span></div>
                <div><b>{fmt(yt.videos_28d)}</b><span>vídeos em 28d</span></div>
                <div><b>{fmt(yt.views_28d_novos)}</b><span>views neles</span></div>
              </div>
            ) : <p className="mc-nota">{yt?.erro ? `Erro: ${yt.erro}` : 'Cole o link do canal em Integrações.'}</p>}
          </div>
        </>
      )}
    </article>
  )
}

export default function MetricasGeral() {
  const [perfis, setPerfis] = useState({})
  const [hist, setHist] = useState([])
  const [atualizando, setAtualizando] = useState(false)
  const [aberto, setAberto] = useState(null)
  const [semChave, setSemChave] = useState(false)

  async function carregar(forcar = false) {
    const [r, h, k] = await Promise.all([
      supabase.functions.invoke('metricas', { body: { acao: 'resumo', canais: CANAIS.map((c) => c.id), forcar } }),
      supabase.from('metricas_diarias').select('canal,rede,dia,seguidores,views_total').gte('dia', diasAtras(40)).order('dia'),
      supabase.rpc('youtube_chave_status'),
    ])
    setPerfis(r.data?.perfis || {})
    setHist(h.data || [])
    setSemChave(!k.data?.[0]?.tem_chave)
  }
  useEffect(() => { carregar() }, [])
  async function atualizar() { setAtualizando(true); await carregar(true); setAtualizando(false) }

  const totais = useMemo(() => {
    const ps = Object.values(perfis)
    const ig = ps.map((p) => p.instagram).filter((x) => x?.conectado && !x.erro)
    const yt = ps.map((p) => p.youtube).filter((x) => x?.conectado && !x.erro)
    const s = (l, f) => l.reduce((a, x) => a + (Number(f(x)) || 0), 0)
    return {
      seguidores: s(ig, (x) => x.seguidores), alcance: s(ig, (x) => x.d28?.reach), views: s(ig, (x) => x.d28?.views),
      interacoes: s(ig, (x) => x.d28?.total_interactions), novos7: s(ig, (x) => (x.d7?.seguiu || 0) - (x.d7?.deixou || 0)),
      inscritos: s(yt, (x) => x.inscritos), ytViews: s(yt, (x) => x.views_total), nIg: ig.length, nYt: yt.length,
    }
  }, [perfis])
  const carregado = Object.keys(perfis).length > 0
  const gerado = Object.values(perfis).map((p) => p.gerado_em).filter(Boolean).sort()[0]
  const ranking = CANAIS.map((c) => ({ c, n: perfis[c.id]?.instagram?.d28?.reach || 0 })).filter((x) => x.n).sort((a, b) => b.n - a.n)
  const maxR = Math.max(1, ...ranking.map((x) => x.n))

  return (
    <section className="mg">
      <header className="p-cab mg-topo">
        <div>
          <h1>Métricas</h1>
          <p>Todos os perfis, direto do Instagram e do YouTube{gerado ? ` · atualizado ${ha(gerado)}` : ''}</p>
        </div>
        <button className="p-btn" onClick={atualizar} disabled={atualizando || !carregado}>{atualizando ? 'Atualizando…' : 'Atualizar agora'}</button>
      </header>

      <div className="mc-nums mg-total">
        <div className="mc-num"><b>{carregado ? fmt(totais.seguidores) : '…'}</b><span>seguidores no Instagram ({totais.nIg} perfis)</span>{carregado && <small>{totais.novos7 >= 0 ? '+' : ''}{fmt(totais.novos7)} em 7 dias</small>}</div>
        <div className="mc-num"><b>{carregado ? fmt(totais.alcance) : '…'}</b><span>contas alcançadas em 28 dias</span></div>
        <div className="mc-num"><b>{carregado ? fmt(totais.views) : '…'}</b><span>views no Instagram em 28 dias</span></div>
        <div className="mc-num"><b>{carregado ? fmt(totais.interacoes) : '…'}</b><span>interações em 28 dias</span></div>
        <div className="mc-num"><b>{carregado ? fmt(totais.inscritos) : '…'}</b><span>inscritos no YouTube ({totais.nYt} canais)</span></div>
      </div>

      {semChave && carregado && (
        <p className="mc-aviso">YouTube ainda pelo feed público (sem inscritos exatos nem views totais). Cole a chave da API do YouTube em qualquer canal, em <b>Integrações → YouTube</b>, e todos passam a ter os números completos.</p>
      )}

      {ranking.length > 1 && (
        <div className="mc-partes mg-ranking">
          <h4>Alcance no Instagram em 28 dias, por perfil</h4>
          <ul>
            {ranking.map(({ c, n }) => (
              <li key={c.id}>
                <span className="mc-partes-nome">{c.nome}</span>
                <span className="mc-partes-trilho"><i style={{ width: `${(n / maxR) * 100}%`, background: c.cor }} /></span>
                <span className="mc-partes-n"><b>{fmt(n)}</b></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mg-grade">
        {CANAIS.map((c) => <Cartao key={c.id} canal={c} p={perfis[c.id]} hist={hist} abrir={(canal, aba) => setAberto({ canal, aba })} />)}
      </div>

      {aberto && <Metricas canal={aberto.canal} abaInicial={aberto.aba} fechar={() => setAberto(null)} />}
    </section>
  )
}
