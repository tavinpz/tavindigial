import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { MiniVideo, Previa } from './Previa'
import Metricas from './Metricas'
import { CANAIS } from './canais'

// Vídeos curtos de um canal (Concrete Atlas, Thata…) organizados por situação: em produção → para programar → programado → postado.
// Cada rede (YouTube, TikTok, Instagram) tem a própria situação. O que foi programado vira "postado" sozinho no horário,
// e a cada 30 min o servidor confere no YouTube (feed público) e no Instagram o que já saiu, com link e views.
const FUSO = 'America/Sao_Paulo'

const fmtDia = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' }) : '—'
const fmtHora = (iso) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }) : ''
const fmtQuando = (iso) => iso ? `${fmtDia(iso)} ${fmtHora(iso)}` : ''
const fmtViews = (n) => n == null ? '' : `${Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)} views`
// datetime-local <-> ISO no fuso de São Paulo (UTC-3, sem horário de verão)
const paraLocal = (iso) => iso ? new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16) : ''
const deLocal = (v) => v ? new Date(`${v}:00-03:00`).toISOString() : null
// curto para as fichas: 30/10 13h · 30/10 13:30
const fmtCurto = (iso) => {
  if (!iso) return ''
  const d = new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' })
  const h = fmtHora(iso)
  return `${d} ${h.endsWith(':00') ? h.slice(0, 2) + 'h' : h}`
}
const fmtNum = (n) => Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
// número do vídeo: a coluna numero; sem ela, o número do id (th-v24-… → #024)
const num = (v) => `#${String(v.numero ?? (v.id.match(/v(\d+)/)?.[1] || '')).padStart(3, '0')}`
const baixarUrl = (v) => (v.video_url ? `${v.video_url}?download=${encodeURIComponent(v.arquivo || `${v.id}.mp4`)}` : null)
// mais recente em cima: o último que entrou no painel primeiro
const recente = (a, b) => (b.created_at || '').localeCompare(a.created_at || '') || (parseInt(num(b).slice(1), 10) || 0) - (parseInt(num(a).slice(1), 10) || 0)

// Horário sugerido: o planejado; se já passou, a próxima hora cheia
function sugestao(v) {
  const p = v.publicar_em ? new Date(v.publicar_em).getTime() : 0
  if (p > Date.now()) return v.publicar_em
  const d = new Date(Date.now() + 3600000); d.setMinutes(0, 0, 0)
  return d.toISOString()
}

// Situação de cada rede, num formato só: pendente | programado | postado
const REDES = [
  { k: 'yt', nome: 'YouTube', sigla: 'YT' },
  { k: 'tt', nome: 'TikTok', sigla: 'TikTok' },
  { k: 'ig', nome: 'Insta', sigla: 'Insta' },
]
function situacao(v, k) {
  if (k === 'ig') {
    const s = { pendente: 'pendente', erro: 'pendente', programado: 'programado', agendado: 'programado', processando: 'programado', publicado: 'postado' }[v.ig_status] || 'pendente'
    return {
      s, quando: v.ig_agendado_para, postado: v.ig_postado_em, link: v.ig_link, views: v.ig_views, confirmado: v.ig_confirmado,
      auto: v.ig_status === 'agendado' || v.ig_status === 'processando', processando: v.ig_status === 'processando', erro: v.ig_status === 'erro' ? (v.ig_erro || 'erro') : '',
    }
  }
  return { s: v[`${k}_status`] || 'pendente', quando: v[`${k}_programado_para`], postado: v[`${k}_postado_em`], link: v[`${k}_link`], views: v[`${k}_views`], confirmado: !!v[`${k}_confirmado`] }
}

function campos(k, acao, iso, igAuto) {
  const agora = new Date().toISOString()
  if (acao === 'programar' && iso && iso <= agora) acao = 'postei'
  if (k === 'ig') {
    if (acao === 'programar') return igAuto ? { ig_status: 'agendado', ig_agendado_para: iso, ig_erro: null } : { ig_status: 'programado', ig_agendado_para: iso, ig_erro: null }
    if (acao === 'postei') return { ig_status: 'publicado', ig_postado_em: iso || agora, ig_erro: null }
    return { ig_status: 'pendente', ig_agendado_para: null, ig_postado_em: null, ig_confirmado: false, ig_erro: null }
  }
  if (acao === 'programar') return { [`${k}_status`]: 'programado', [`${k}_programado_para`]: iso, [`${k}_postado_em`]: null }
  if (acao === 'postei') return { [`${k}_status`]: 'postado', [`${k}_postado_em`]: iso || agora }
  return { [`${k}_status`]: 'pendente', [`${k}_programado_para`]: null, [`${k}_postado_em`]: null, ...(k === 'yt' ? { yt_confirmado: false } : {}) }
}

// rede = null: as 3 juntas; 'yt' | 'tt' | 'ig': só aquela rede (filtro do quadro)
function etapa(v, rede = null) {
  if (!v.video_url) return 'producao'
  const ss = (rede ? [rede] : REDES.map((r) => r.k)).map((k) => situacao(v, k).s)
  // saiu em qualquer rede (YouTube, Insta ou TikTok) = já está no ar: vai sozinho para Postado
  if (ss.includes('postado')) return 'postado'
  if (ss.includes('pendente')) return v.subido_em ? 'subido' : 'programar'
  if (ss.includes('programado')) return 'programado'
  return 'postado'
}

function useSalvar(v, recarregar) {
  const { avisar } = usePainel()
  return async (dados, ok) => {
    const { error } = await supabase.from('videos').update(dados).eq('id', v.id)
    if (error) { avisar('Não salvou'); return false }
    if (ok) avisar(ok)
    recarregar(); return true
  }
}

function Copiar({ texto, rotulo = 'Copiar' }) {
  const { avisar } = usePainel()
  async function copiar(e) {
    e?.stopPropagation()
    try { await navigator.clipboard.writeText(texto || ''); avisar('Copiado') } catch { avisar('Não consegui copiar') }
  }
  return <button type="button" className="p-btn p-btn--mini" onClick={copiar}>{rotulo}</button>
}

function Bloco({ titulo, texto, linhas = 3 }) {
  return (
    <div className="v-bloco">
      <div className="v-bloco-cab"><span>{titulo}</span><Copiar texto={texto} /></div>
      <p className="v-texto" style={{ WebkitLineClamp: linhas }}>{texto}</p>
    </div>
  )
}

// Celular: manda o arquivo direto para o app (TikTok, Instagram, YouTube) pelo menu de compartilhar
async function compartilhar(v, legenda, avisar) {
  try {
    if (legenda) await navigator.clipboard.writeText(legenda).catch(() => {})
    const blob = await (await fetch(v.video_url)).blob()
    const arq = new File([blob], `${v.id}.mp4`, { type: 'video/mp4' })
    if (navigator.canShare?.({ files: [arq] })) {
      await navigator.share({ files: [arq], title: v.yt_titulo })
      return
    }
    avisar('Este aparelho não compartilha arquivo: use Baixar')
  } catch (e) { if (e?.name !== 'AbortError') avisar('Não consegui abrir o compartilhar') }
}

function textoRede(st, curto) {
  if (st.s === 'postado') return { classe: 'ok', icone: '✓', txt: curto ? (st.views != null ? `▶ ${fmtNum(st.views)}` : fmtCurto(st.postado).replace(/ .*/, '')) : <>Postado {fmtQuando(st.postado)}{st.views != null && <b> · {fmtViews(st.views)}</b>}</> }
  if (st.s === 'programado') return { classe: 'prog', icone: '◷', txt: st.processando ? 'processando…' : curto ? fmtCurto(st.quando) : <>{st.auto ? 'Painel posta' : 'Programado'} {fmtQuando(st.quando)}</> }
  if (st.erro) return { classe: 'erro', icone: '!', txt: curto ? 'erro' : `Erro: ${st.erro}` }
  return { classe: 'falta', icone: '', txt: curto ? 'falta' : 'Falta programar' }
}

// Ações de uma rede: programar (com horário), já postei, cancelar, abrir post
function Editor({ v, k, nome, recarregar, igOk, fechar }) {
  const st = situacao(v, k)
  const salvar = useSalvar(v, recarregar)
  const [quando, setQuando] = useState(paraLocal(st.quando || sugestao(v)))
  const fazer = async (acao, extra = {}) => {
    const iso = deLocal(quando)
    const c = campos(k, acao, acao === 'postei' ? null : iso, extra.auto)
    const ok = c[`${k}_status`] === 'postado' || c.ig_status === 'publicado' ? `${nome}: postado` : acao === 'desfazer' ? `${nome}: voltou para pendente` : `${nome}: programado para ${fmtQuando(iso)}`
    if (await salvar(c, ok)) fechar()
  }
  return (
    <div className="v-rede-acoes" onClick={(e) => e.stopPropagation()}>
      <strong className="v-ed-tit">{nome}{st.erro ? ` · ${st.erro}` : ''}</strong>
      {st.s === 'postado' ? (
        <div className="v-rede-botoes">
          {st.link && <a className="p-btn p-btn--mini" href={st.link} target="_blank" rel="noreferrer">Abrir post</a>}
          <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => fazer('desfazer')}>Não foi postado</button>
        </div>
      ) : st.processando ? (
        <p className="v-dica">O Instagram está processando; sai sozinho em alguns minutos.</p>
      ) : (
        <>
          <label className="v-quando">{st.s === 'programado' ? 'Horário' : 'Programei para'}
            <input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} />
          </label>
          <div className="v-rede-botoes">
            {k === 'ig' && igOk && (
              <button className="p-btn p-btn--mini p-btn--forte" disabled={!quando || !v.video_url} onClick={() => fazer('programar', { auto: true })}>
                {st.auto ? 'Mudar horário' : 'Painel posta sozinho'}
              </button>
            )}
            <button className={`p-btn p-btn--mini ${k === 'ig' && igOk ? '' : 'p-btn--forte'}`} disabled={!quando} onClick={() => fazer('programar', { auto: false })}>
              {st.s === 'programado' && !st.auto ? 'Mudar horário' : k === 'ig' && igOk ? 'Programei no app' : 'Programei'}
            </button>
            <button className="p-btn p-btn--mini" onClick={() => fazer('postei')}>Já postei</button>
            {st.s === 'programado' && <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => fazer('desfazer')}>Cancelar</button>}
          </div>
        </>
      )}
    </div>
  )
}

// Cartão: as 3 redes lado a lado; clicar numa abre as ações embaixo
function Redes({ v, recarregar, igOk }) {
  const [aberto, abrir] = useState(null)
  const r = REDES.find((x) => x.k === aberto)
  return (
    <div className="v-redes-wrap">
      <ul className="v-chips">
        {REDES.map(({ k, nome, sigla }) => {
          const st = situacao(v, k), t = textoRede(st, true)
          return (
            <li key={k}>
              <button type="button" className={`v-chip v-chip--${t.classe} ${aberto === k ? 'on' : ''}`} aria-expanded={aberto === k}
                onClick={(e) => { e.stopPropagation(); abrir(aberto === k ? null : k) }} title={`${nome}: ${typeof t.txt === 'string' ? t.txt : ''}`}>
                <span className="v-chip-nome"><i aria-hidden="true">{t.icone}</i>{sigla}</span>
                <span className="v-chip-txt">{t.txt}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {r && <Editor key={r.k} v={v} k={r.k} nome={r.nome} recarregar={recarregar} igOk={igOk} fechar={() => abrir(null)} />}
    </div>
  )
}

// Detalhe: uma linha por rede, com o texto completo
function Rede({ v, k, nome, recarregar, igOk, aberto, abrir }) {
  const st = situacao(v, k), t = textoRede(st, false)
  return (
    <li className={`v-rede v-rede--${t.classe}`}>
      <button type="button" className="v-rede-linha" aria-expanded={aberto} onClick={() => abrir(aberto ? null : k)}>
        <span className="v-rede-nome"><i aria-hidden="true">{t.icone}</i>{nome}</span>
        <span className="v-rede-txt">{t.txt}</span>
        {st.confirmado && <span className="v-conf" title="Confirmado direto na rede">conferido</span>}
        <span className="v-rede-mudar">{aberto ? 'Fechar' : 'Mudar'}</span>
      </button>
      {aberto && <Editor v={v} k={k} nome={nome} recarregar={recarregar} igOk={igOk} fechar={() => abrir(null)} />}
    </li>
  )
}

// Arrastar o cartão para outra coluna muda as 3 redes de uma vez (sem abrir rede por rede)
function dadosMover(v, alvo, igOk, rede = null) {
  let d = {}
  const sug = sugestao(v)
  if (alvo === 'programar') d.subido_em = null
  if (alvo === 'subido') d.subido_em = v.subido_em || new Date().toISOString()
  for (const r of REDES.filter((x) => !rede || x.k === rede)) {
    const st = situacao(v, r.k)
    if (st.processando) continue
    if ((alvo === 'programar' || alvo === 'subido') && st.s !== 'pendente') d = { ...d, ...campos(r.k, 'desfazer') }
    // o que já está no ar não volta a ser programado
    if (alvo === 'programado' && st.s === 'pendente') d = { ...d, ...campos(r.k, 'programar', sug, igOk) }
    if (alvo === 'postado' && st.s !== 'postado') d = { ...d, ...campos(r.k, 'postei', null) }
  }
  return d
}

function Cartao({ v, abrir, previa, recarregar, igOk, fase, arrastar, mover, arrastando }) {
  const salvar = useSalvar(v, recarregar)
  const [pode, setPode] = useState(true)
  const pendentes = REDES.filter((r) => situacao(v, r.k).s === 'pendente')
  const sug = sugestao(v)
  const views = (v.yt_views || 0) + (v.ig_views || 0)
  async function programarTudo(e) {
    e.stopPropagation()
    let dados = {}
    for (const r of pendentes) dados = { ...dados, ...campos(r.k, 'programar', sug, igOk) }
    await salvar(dados, `Programado para ${fmtQuando(sug)}`)
  }
  return (
    <article className={`v-item v-item--${fase} ${arrastando ? 'v-item--arrastando' : ''}`}
      draggable={fase !== 'producao' && pode}
      onPointerDown={(e) => setPode(!e.target.closest('input, textarea, select'))}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', v.id); arrastar(v.id) }}
      onDragEnd={() => arrastar(null)}>
      <div className="v-item-cab">
        <MiniVideo src={v.video_url} capa={v.capa_url} rotulo={v.video_url ? `Ver a prévia de ${v.yt_titulo || v.titulo}` : `Abrir ${num(v)}`}
          onClick={() => (v.video_url ? previa(v.id) : abrir(v.id))}>
          {v.capa_url ? <img src={v.capa_url} alt="" loading="lazy" /> : <span className="v-item-sem">{num(v)}</span>}
        </MiniVideo>
        <button type="button" className="v-item-txt" onClick={() => abrir(v.id)}>
          <small>{num(v)}{fase === 'programar' || fase === 'subido' || fase === 'producao' ? ` · sugestão ${fmtQuando(sug)}` : ''}{fase === 'subido' && v.subido_em ? ` · subiu ${fmtCurto(v.subido_em)}` : ''}</small>
          <strong>{v.yt_titulo}</strong>
          {fase === 'producao' && <em className="v-subindo">renderizando ou subindo o arquivo</em>}
          {fase === 'postado' && views > 0 && <em className="v-views">{fmtViews(views)}</em>}
        </button>
      </div>
      {fase !== 'producao' && <Redes v={v} recarregar={recarregar} igOk={igOk} />}
      {(fase === 'programar' || fase === 'subido') && pendentes.length > 1 && (
        <button type="button" className="v-tudo" onClick={programarTudo}>
          Programei {pendentes.length === 3 ? 'as 3' : pendentes.map((r) => r.nome).join(' e ')} nesse horário
        </button>
      )}
      {fase !== 'producao' && (
        <select className="v-mover" value="" aria-label="Mover para outra coluna" onChange={(e) => e.target.value && mover(v.id, e.target.value)}>
          <option value="">Mover para…</option>
          {FASES.filter(([k]) => k !== 'producao' && k !== fase).map(([k, nome]) => <option key={k} value={k}>{nome}</option>)}
        </select>
      )}
    </article>
  )
}

const FASES = [
  ['producao', 'Em produção', 'O vídeo ainda está sendo feito.'],
  ['programar', 'Para programar', 'Baixe e faça o upload. Arraste para "Upload feito".'],
  ['subido', 'Upload feito', 'Já subiu: falta programar ou publicar.'],
  ['programado', 'Programado', 'Vira "postado" sozinho no horário.'],
  ['postado', 'Postado', 'Já está no ar em pelo menos uma rede. Vem pra cá sozinho, com link e views.'],
]

function Quadro({ lista, abrir, recarregar, igOk, rede, verPostados, setVerPostados }) {
  const { avisar } = usePainel()
  const [verTodos, setVerTodos] = useState(null)
  const [arr, setArr] = useState(null)
  const [sobre, setSobre] = useState(null)
  const [local, setLocal] = useState({})
  const [previaId, setPreviaId] = useState(null)
  const fase = (v) => local[v.id] || etapa(v, rede)
  const onde = rede ? REDES.find((r) => r.k === rede).nome : 'nas 3 redes'
  async function mover(id, alvo) {
    const v = lista.find((x) => x.id === id)
    if (!v || !v.video_url || alvo === 'producao' || fase(v) === alvo) return
    const d = dadosMover(v, alvo, igOk, rede)
    if (!Object.keys(d).length) return
    setLocal((l) => ({ ...l, [id]: alvo }))
    const { error } = await supabase.from('videos').update(d).eq('id', id)
    avisar(error ? 'Não salvou' : alvo === 'programado'
      ? `${num(v)} programado ${rede ? `no ${onde}` : onde} para ${fmtQuando(sugestao(v))}${igOk && (!rede || rede === 'ig') ? ' · Insta: o painel posta sozinho' : ''}`
      : alvo === 'postado' ? `${num(v)} marcado como postado ${rede ? `no ${onde}` : onde}`
      : alvo === 'subido' ? `${num(v)}: upload feito` : `${num(v)} voltou para Para programar`)
    await recarregar()
    setLocal((l) => { const n = { ...l }; delete n[id]; return n })
  }
  const col = { producao: [], programar: [], subido: [], programado: [], postado: [] }
  for (const v of lista) col[fase(v)].push(v)
  const proximo = (v) => Math.min(...REDES.map((r) => situacao(v, r.k)).filter((s) => s.s === 'programado').map((s) => new Date(s.quando).getTime()))
  const ultimo = (v) => Math.max(...REDES.map((r) => new Date(situacao(v, r.k).postado || 0).getTime()))
  // mais recente em cima em todas as colunas; em Programado, o próximo a sair fica em cima
  col.producao.sort(recente)
  col.programar.sort(recente)
  col.subido.sort((a, b) => (b.subido_em || '').localeCompare(a.subido_em || '') || recente(a, b))
  col.programado.sort((a, b) => proximo(a) - proximo(b) || recente(a, b))
  col.postado.sort((a, b) => ultimo(b) - ultimo(a) || recente(a, b))
  const nome = (v) => v.yt_titulo || v.titulo || num(v)
  const fila = FASES.flatMap(([k]) => col[k]).filter((v) => v.video_url)
    .map((v) => ({ id: v.id, video_url: v.video_url, capa_url: v.capa_url, titulo: nome(v), sub: `${num(v)} · ${FASES.find(([k]) => k === fase(v))[1]}`, baixar: baixarUrl(v) }))
  return (
    <div className="v-pipe">
      {FASES.filter(([k]) => k !== 'producao' || col.producao.length).map(([k, nome, dica]) => {
        const limite = k === 'postado' ? 6 : k === 'programar' ? 7 : 99
        const recolhida = k === 'postado' && !verPostados
        const itens = recolhida ? [] : verTodos === k ? col[k] : col[k].slice(0, limite)
        return (
          <section key={k} className={`v-coluna v-coluna--${k} ${arr && sobre === k ? 'v-coluna--sobre' : ''}`} aria-label={nome}
            onDragOver={(e) => { if (arr && k !== 'producao') { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (sobre !== k) setSobre(k) } }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSobre((x) => (x === k ? null : x)) }}
            onDrop={(e) => { e.preventDefault(); const id = arr || e.dataTransfer.getData('text/plain'); setArr(null); setSobre(null); if (id) mover(id, k) }}>
            <header><h2>{nome} <span>{col[k].length}</span></h2><p>{dica}</p></header>
            {recolhida && col[k].length > 0 && <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => setVerPostados(true)}>Mostrar os {col[k].length} postados</button>}
            {col[k].length === 0 && <p className="v-vazia">{k === 'programar' ? 'Tudo programado. Hora de fazer mais vídeos.' : 'Nenhum ainda.'}</p>}
            {itens.map((v) => <Cartao key={v.id} v={v} abrir={abrir} previa={setPreviaId} recarregar={recarregar} igOk={igOk} fase={k} arrastar={(id) => { setArr(id); if (!id) setSobre(null) }} mover={mover} arrastando={arr === v.id} />)}
            {!recolhida && col[k].length > limite && (
              <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => setVerTodos(verTodos === k ? null : k)}>{verTodos === k ? 'Mostrar menos' : `Ver mais ${col[k].length - limite}`}</button>
            )}
          </section>
        )
      })}
      {previaId && <Previa lista={fila} id={previaId} setId={setPreviaId} abrirFicha={abrir} />}
    </div>
  )
}

function Conexoes({ canal, ig, yt, recarregarCx, recarregar }) {
  const { avisar } = usePainel()
  const [aberto, setAberto] = useState(null)
  const [igForm, setIgForm] = useState({ user_id: '', token: '' })
  const [ytRef, setYtRef] = useState('')
  const [msg, setMsg] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function testarIG() {
    setMsg('Testando o Instagram…')
    const { data, error } = await supabase.functions.invoke('publicar-reels', { body: { verificar: true, canal } })
    setMsg(error ? 'Não consegui falar com o servidor.' : data?.ok ? `Instagram conectado como @${data.username}` : `Instagram: ${data?.erro}`)
  }
  async function salvarIG(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('salvar_instagram_canal', { p_canal: canal, p_user_id: igForm.user_id, p_token: igForm.token })
    if (error) { avisar('Não salvou'); return }
    setAberto(null); await recarregarCx(); testarIG()
  }
  async function conferir() {
    setOcupado(true); setMsg('Conferindo no YouTube e no Instagram…')
    const { data, error } = await supabase.functions.invoke('conferir-postagens', { body: {} })
    setOcupado(false)
    const r = data?.canais?.[canal] || data || {}
    setMsg(error ? 'Não consegui falar com o servidor.' : [r.youtube && `YouTube: ${r.youtube}`, r.instagram && `Instagram: ${r.instagram}`].filter(Boolean).join(' · '))
    recarregarCx(); recarregar()
  }
  async function salvarYT(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('salvar_youtube_canal', { p_canal: canal, p_ref: ytRef })
    if (error) { avisar('Não salvou'); return }
    setAberto(null); await recarregarCx(); conferir()
  }
  if (!ig || !yt) return null
  const ytOk = !!yt.ref
  return (
    <div className="v-cx">
      <div className="v-cx-linha">
        <span className={`v-cx-item ${ig.conectado ? 'on' : ''}`}>
          <b>Instagram</b> {ig.conectado ? 'conectado: o painel posta os Reels no horário' : 'não conectado: poste pelo app'}
        </span>
        <span className="v-cx-item"><b>TikTok</b> poste no app; vira postado sozinho no horário que você programou</span>
        <span className={`v-cx-item ${ytOk ? 'on' : ''}`} title="O link do canal serve só para o painel perceber sozinho o que já foi ao ar e trazer as views. Não posta nada.">
          <b>YouTube</b> {ytOk ? 'link salvo (só para marcar postado e trazer views; o YouTube está com isso instável, então arraste para Postado)' : 'opcional: o link só serve para marcar sozinho o que já foi ao ar'}
        </span>
        <span className="v-cx-acoes">
          <button className="p-btn p-btn--mini" onClick={conferir} disabled={ocupado || (!ytOk && !ig.conectado)}>{ocupado ? 'Conferindo…' : 'Conferir agora'}</button>
          <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => { setYtRef(yt.ref || ''); setAberto(aberto === 'yt' ? null : 'yt') }}>{ytOk ? 'Trocar canal' : 'Ligar YouTube'}</button>
          <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => { setIgForm({ user_id: ig.user_id || '', token: '' }); setAberto(aberto === 'ig' ? null : 'ig') }}>{ig.conectado ? 'Trocar token' : 'Ligar Instagram'}</button>
        </span>
      </div>
      {msg && <p className="v-cx-msg">{msg}{yt.conferido_em && !ocupado ? ` · última conferência ${fmtHora(yt.conferido_em)}` : ''}</p>}
      {aberto === 'yt' && (
        <form className="v-cx-form" onSubmit={salvarYT}>
          <label className="p-campo">Link ou @ do canal no YouTube
            <input required value={ytRef} onChange={(e) => setYtRef(e.target.value)} placeholder="https://youtube.com/@seucanal" />
          </label>
          <button className="p-btn p-btn--forte">Salvar e conferir</button>
        </form>
      )}
      {aberto === 'ig' && (
        <form className="v-cx-form" onSubmit={salvarIG}>
          <label className="p-campo">Token da conta do canal
            <input required type="password" value={igForm.token} onChange={(e) => setIgForm({ ...igForm, token: e.target.value })} placeholder="IGAA…" />
          </label>
          <label className="p-campo">ID da conta (opcional)
            <input value={igForm.user_id} onChange={(e) => setIgForm({ ...igForm, user_id: e.target.value })} placeholder="1784…" />
          </label>
          <button className="p-btn p-btn--forte">Salvar e testar</button>
        </form>
      )}
    </div>
  )
}

function Detalhe({ v, fechar, recarregar, igOk }) {
  const { avisar } = usePainel()
  const salvar = useSalvar(v, recarregar)
  const [legIG, setLegIG] = useState(v.ig_legenda || '')
  const [ocupado, setOcupado] = useState(false)
  const celular = typeof navigator !== 'undefined' && !!navigator.share
  const [aberto, abrir] = useState(null)

  async function publicarAgora() {
    setOcupado(true)
    await supabase.from('videos').update({ ig_legenda: legIG }).eq('id', v.id)
    const { data, error } = await supabase.functions.invoke('publicar-reels', { body: { id: v.id } })
    setOcupado(false)
    avisar(error ? 'Não consegui falar com o servidor' : data?.ok ? (data.publicado ? 'Publicado no Instagram' : data.aviso) : `Erro: ${data?.erro}`)
    recarregar()
  }
  const baixar = baixarUrl(v)
  const rede = (k, nome) => (
    <ul className="v-redes v-redes--detalhe"><Rede v={v} k={k} nome={nome} recarregar={recarregar} igOk={igOk} aberto={aberto === k} abrir={abrir} /></ul>
  )
  const igSt = situacao(v, 'ig')

  return (
    <section className="v-detalhe">
      <div className="p-cab">
        <div>
          <button className="p-voltar" onClick={fechar}>Vídeos</button>
          <h1>{num(v)} {v.yt_titulo}</h1>
          <p className="p-sub">Sugestão: {fmtQuando(sugestao(v))} · {Math.round(v.duracao || 0)} s</p>
        </div>
        <div className="p-acoes">
          {v.video_url && <a className="p-btn p-btn--forte" href={baixar}>Baixar vídeo</a>}
          {celular && v.video_url && <button className="p-btn" onClick={() => compartilhar(v, '', avisar)}>Compartilhar</button>}
        </div>
      </div>

      <div className="v-grade">
        <div className="v-player">
          {v.video_url ? <video src={v.video_url} poster={v.capa_url || undefined} controls autoPlay playsInline preload="auto" /> : <div className="v-semvideo">Vídeo ainda em produção…</div>}
        </div>

        <div className="v-plataformas">
          <article className={`v-plat v-plat--${situacao(v, 'yt').s}`}>
            <header><h2>YouTube Shorts</h2></header>
            {rede('yt', 'YouTube')}
            <Bloco titulo="Título" texto={v.yt_titulo} linhas={2} />
            <Bloco titulo="Descrição" texto={v.yt_descricao} linhas={4} />
            {v.yt_tags && <Bloco titulo="Tags (campo Tags, em Mostrar mais)" texto={v.yt_tags} linhas={2} />}
            <Bloco titulo="Comentário para fixar" texto={v.comentario_fixado} linhas={2} />
            <p className="v-dica">No upload: não é para crianças · Conteúdo alterado ou sintético = Sim · Programar para {fmtQuando(sugestao(v))}.</p>
            <div className="p-acoes">
              <a className="p-btn" href="https://studio.youtube.com" target="_blank" rel="noreferrer">Abrir YouTube Studio</a>
              {celular && v.video_url && <button className="p-btn" onClick={() => compartilhar(v, v.yt_titulo, avisar)}>Mandar para o app (copia o título)</button>}
            </div>
          </article>

          <article className={`v-plat v-plat--${situacao(v, 'tt').s}`}>
            <header><h2>TikTok</h2></header>
            {rede('tt', 'TikTok')}
            <Bloco titulo="Legenda" texto={v.tt_legenda} linhas={3} />
            <p className="v-dica">Marque "Conteúdo gerado por IA" nas opções do post (a voz é sintética).</p>
            <div className="p-acoes">
              <a className="p-btn" href="https://www.tiktok.com/tiktokstudio/upload" target="_blank" rel="noreferrer">Abrir TikTok Studio</a>
              {celular && v.video_url && <button className="p-btn" onClick={() => compartilhar(v, v.tt_legenda, avisar)}>Mandar para o app (copia a legenda)</button>}
            </div>
          </article>

          <article className={`v-plat v-plat--${igSt.s}`}>
            <header><h2>Instagram Reels</h2></header>
            {rede('ig', 'Insta')}
            <label className="p-campo">Legenda <span className="v-cont">{legIG.length}/2200</span>
              <textarea rows={6} value={legIG} onChange={(e) => setLegIG(e.target.value)} maxLength={2200} />
            </label>
            <div className="p-acoes">
              <Copiar texto={legIG} rotulo="Copiar legenda" />
              {legIG !== (v.ig_legenda || '') && <button className="p-btn p-btn--mini" onClick={() => salvar({ ig_legenda: legIG }, 'Legenda salva')}>Salvar legenda</button>}
              {igOk && igSt.s !== 'postado' && !igSt.processando && v.video_url && (
                <button className="p-btn p-btn--mini" onClick={publicarAgora} disabled={ocupado}>{ocupado ? 'Publicando… (até 1 min)' : 'Publicar agora'}</button>
              )}
              {celular && igSt.s !== 'postado' && v.video_url && <button className="p-btn p-btn--mini" onClick={() => compartilhar(v, legIG, avisar)}>Mandar para o app</button>}
            </div>
          </article>

          {v.fontes?.length > 0 && (
            <details className="v-fontes"><summary>Fontes dos fatos</summary>
              <ul>{v.fontes.map((f) => <li key={f}><a href={f} target="_blank" rel="noreferrer">{f.replace(/^https?:\/\//, '')}</a></li>)}</ul>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Videos({ canal = 'concrete-atlas', nome = 'Concrete Atlas' }) {
  const { versao } = usePainel()
  const [lista, setLista] = useState(null)
  const [abertoId, setAbertoId] = useState(null)
  const [ig, setIg] = useState(null)
  const [yt, setYt] = useState(null)
  const [rede, setRede] = useState(() => { try { return localStorage.getItem(`v-rede-${canal}`) || '' } catch { return '' } })
  const [verPostados, setVerPostados] = useState(false)
  const [metricas, setMetricas] = useState(false)
  const infoCanal = CANAIS.find((c) => c.id === canal) || { id: canal, nome, cor: '#888', sigla: nome.slice(0, 2).toUpperCase(), tipo: 'shorts' }
  useEffect(() => { try { localStorage.setItem(`v-rede-${canal}`, rede) } catch { /* sem storage */ } }, [rede, canal])

  const carregar = async () => {
    const { data } = await supabase.from('videos').select('*').eq('canal', canal).order('publicar_em', { ascending: true, nullsFirst: false })
    setLista(data || [])
  }
  const carregarCx = async () => {
    const [a, b] = await Promise.all([
      supabase.rpc('instagram_status_canal', { p_canal: canal }),
      supabase.rpc('youtube_status_canal', { p_canal: canal }),
    ])
    setIg(a.data?.[0] || { conectado: false })
    setYt(b.data?.[0] || { ref: null })
  }
  useEffect(() => { carregar() }, [versao])
  useEffect(() => { carregarCx() }, [])

  const resumo = useMemo(() => {
    const l = lista || []
    const n = { producao: 0, programar: 0, subido: 0, programado: 0, postado: 0 }
    let ate = 0, views = 0
    for (const v of l) {
      n[etapa(v)]++
      views += (v.yt_views || 0) + (v.ig_views || 0)
      for (const r of REDES) { const s = situacao(v, r.k); if (s.s === 'programado') ate = Math.max(ate, new Date(s.quando).getTime()) }
    }
    return { n, ate: ate ? new Date(ate).toISOString() : null, views }
  }, [lista])

  if (lista === null) return <p className="p-vazio">Carregando…</p>
  const igOk = !!ig?.conectado
  const aberto = lista.find((v) => v.id === abertoId)
  if (aberto) return <Detalhe v={aberto} fechar={() => setAbertoId(null)} recarregar={carregar} igOk={igOk} />

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>{nome}</h1>
          <p className="p-sub">
            Vídeos curtos · {resumo.n.postado} postados · {resumo.n.programado} programados{resumo.ate ? ` (fila até ${fmtDia(resumo.ate)})` : ''} · {resumo.n.programar} para programar{resumo.n.subido ? ` · ${resumo.n.subido} com upload feito` : ''}
            {resumo.views > 0 ? ` · ${fmtViews(resumo.views)} no YouTube e Insta` : ''}
          </p>
          <p className="p-sub">Arraste o cartão entre as colunas. Clique na capa para ver o vídeo; no título, abre a ficha. {rede ? `Filtrando ${REDES.find((r) => r.k === rede).nome}: o arrastar muda só essa rede.` : 'Sem filtro, as 3 redes mudam juntas.'}</p>
        </div>
        <div className="p-acoes">
          <button className="p-btn p-btn--forte" onClick={() => setMetricas(true)}>Métricas de {nome}</button>
        </div>
      </div>
      {metricas && <Metricas canal={infoCanal} fechar={() => setMetricas(false)} />}

      <Conexoes canal={canal} ig={ig} yt={yt} recarregarCx={carregarCx} recarregar={carregar} />

      <div className="v-filtros" role="toolbar" aria-label="Filtros do quadro">
        <span>Rede</span>
        {[['', 'Todas'], ...REDES.map((r) => [r.k, r.k === 'yt' ? 'YouTube' : r.nome === 'Insta' ? 'Instagram' : r.nome])].map(([k, n]) => (
          <button key={k || 'todas'} type="button" className={rede === k ? 'on' : ''} aria-pressed={rede === k} onClick={() => setRede(k)}>{n}</button>
        ))}
        <label className="v-filtro-check"><input type="checkbox" checked={verPostados} onChange={(e) => setVerPostados(e.target.checked)} /> Mostrar postados</label>
      </div>

      {lista.length === 0
        ? <div className="p-vazio"><p>Nenhum vídeo ainda.</p></div>
        : <Quadro lista={lista} abrir={setAbertoId} recarregar={carregar} igOk={igOk} rede={rede || null} verPostados={verPostados} setVerPostados={setVerPostados} />}
    </section>
  )
}
