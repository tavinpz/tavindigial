import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import Pipeline, { useConexoes } from './Pipeline'
import { CANAIS } from './canais'
import BotoesThata from './ThataConteudo'

// Vídeos curtos de um canal (Thata, Concrete Atlas, Zerando…): em produção → para programar → upload feito → programado → postado.
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
// O arquivo baixa com o título do YouTube no nome: o YouTube usa o nome do arquivo como título no upload.
// Só saem os caracteres que o sistema não aceita em nome de arquivo (/ \ : * ? " < > |).
export const nomeArquivo = (v) => `${String(v.yt_titulo || v.titulo || v.id).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 95) || v.id}.mp4`
const baixarUrl = (v) => (v.video_url ? `${v.video_url}?download=${encodeURIComponent(nomeArquivo(v))}` : null)
// Baixa vários de uma vez (o Chrome pede uma vez para "permitir vários downloads")
export async function baixarVarios(lista, avisar) {
  const urls = lista.map(baixarUrl).filter(Boolean)
  avisar?.(`Baixando ${urls.length} ${urls.length === 1 ? 'vídeo' : 'vídeos'} com o título no nome…`)
  for (const u of urls) {
    const f = document.createElement('iframe')
    f.style.display = 'none'; f.src = u
    document.body.appendChild(f)
    setTimeout(() => f.remove(), 120000)
    await new Promise((r) => setTimeout(r, 900))
  }
}

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
// TikTok só conta para canais com @ do TikTok cadastrado (o painel não posta no TikTok: é marcação manual)
const temTT = (canalId) => !!CANAIS.find((c) => c.id === canalId)?.tiktok
const redesDe = (v) => REDES.filter((r) => r.k !== 'tt' || temTT(v.canal))
// canais com a conta do YouTube conectada: o painel sobe o vídeo e o YouTube publica no horário
const YT_AUTO = new Set()
function situacao(v, k) {
  if (k === 'ig') {
    const s = { pendente: 'pendente', erro: 'pendente', programado: 'programado', agendado: 'programado', processando: 'programado', publicado: 'postado' }[v.ig_status] || 'pendente'
    return {
      s, quando: v.ig_agendado_para, postado: v.ig_postado_em, link: v.ig_link, views: v.ig_views, confirmado: v.ig_confirmado,
      auto: v.ig_status === 'agendado' || v.ig_status === 'processando', processando: v.ig_status === 'processando', erro: v.ig_status === 'erro' ? (v.ig_erro || 'erro') : '',
    }
  }
  if (k === 'yt') {
    const bruto = v.yt_status || 'pendente'
    const s = bruto === 'agendado' ? 'programado' : bruto === 'erro' || bruto === 'cancelar' || bruto === 'subir' ? 'pendente' : bruto
    return {
      s, quando: v.yt_programado_para, postado: v.yt_postado_em, link: v.yt_link, views: v.yt_views, confirmado: !!v.yt_confirmado,
      auto: bruto === 'agendado' || (bruto === 'programado' && !!v.yt_id), enviando: bruto === 'agendado' && !v.yt_id,
      subindo: bruto === 'subir', noYT: !!v.yt_id && bruto !== 'postado',
      erro: bruto === 'erro' ? (v.yt_erro || 'erro') : bruto === 'agendado' && v.yt_erro ? v.yt_erro : '',
    }
  }
  return { s: v[`${k}_status`] || 'pendente', quando: v[`${k}_programado_para`], postado: v[`${k}_postado_em`], link: v[`${k}_link`], views: v[`${k}_views`], confirmado: !!v[`${k}_confirmado`] }
}

function campos(k, acao, iso, igAuto, v = null) {
  const agora = new Date().toISOString()
  if (k === 'yt' && igAuto && acao === 'programar') return { yt_status: 'agendado', yt_programado_para: iso && iso > agora ? iso : agora, yt_postado_em: null, yt_erro: null, yt_tentativas: 0 }
  // já subiu pelo painel: cancelar tira do ar no YouTube (fica privado)
  if (k === 'yt' && acao === 'desfazer' && v?.yt_id && v.yt_status !== 'postado') return { yt_status: 'cancelar', yt_erro: null }
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
  // a coluna segue o YouTube e o Instagram juntos: só vai para Programado quando os dois estão programados (ou já no ar),
  // e para Postado quando os dois saíram. O TikTok aparece só no selo do cartão. Cada rede tem seu selo (IG ◷ / IG ✓).
  const ss = (rede ? [rede] : ['yt', 'ig']).map((k) => situacao(v, k).s)
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

// Copia sem mexer na página: o próprio botão mostra "Copiado ✓" (mesma largura, nada pula)
function Copiar({ texto, rotulo = 'Copiar' }) {
  const { avisar } = usePainel()
  const [ok, setOk] = useState(false)
  async function copiar(e) {
    e?.preventDefault(); e?.stopPropagation()
    try { await navigator.clipboard.writeText(texto || ''); setOk(true); setTimeout(() => setOk(false), 1500) } catch { avisar('Não consegui copiar') }
  }
  return <button type="button" className={`p-btn p-btn--mini v-copiar ${ok ? 'ok' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={copiar}><span className="v-copiar-rot">{rotulo}</span><span className="v-copiar-ok">Copiado ✓</span></button>
}

// Texto inteiro numa caixa de altura fixa: rola e seleciona à vontade, sem expandir nem empurrar a página
function Bloco({ titulo, texto, linhas = 3 }) {
  return (
    <div className="v-bloco">
      <div className="v-bloco-cab"><span>{titulo}</span><Copiar texto={texto} /></div>
      <p className="v-texto" style={{ maxHeight: `${linhas * 1.45 + 0.2}em` }}>{texto}</p>
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
  if (st.erro) return { classe: 'erro', icone: '!', txt: curto ? 'erro' : `Erro: ${st.erro}` }
  if (st.s === 'programado') return { classe: 'prog', icone: '◷', txt: st.processando ? 'processando…' : curto ? fmtCurto(st.quando) : <>{st.enviando ? 'Subindo no YouTube, sai' : st.auto ? 'Painel posta' : 'Programado'} {fmtQuando(st.quando)}</> }
  if (st.subindo) return { classe: 'falta', icone: '↑', txt: curto ? 'subindo' : 'Indo para o YouTube como privado' }
  if (st.noYT) return { classe: 'falta', icone: '', txt: curto ? 'privado' : 'Privado no YouTube, falta programar' }
  return { classe: 'falta', icone: '', txt: curto ? 'falta' : 'Falta programar' }
}

// Ações de uma rede: programar (com horário), já postei, cancelar, abrir post
function Editor({ v, k, nome, recarregar, igOk, fechar }) {
  const st = situacao(v, k)
  const salvar = useSalvar(v, recarregar)
  const [quando, setQuando] = useState(paraLocal(st.quando || sugestao(v)))
  const fazer = async (acao, extra = {}) => {
    const iso = deLocal(quando)
    const c = campos(k, acao, acao === 'postei' ? null : iso, extra.auto, v)
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
            {((k === 'ig' && igOk) || (k === 'yt' && YT_AUTO.has(v.canal))) && (
              <button className="p-btn p-btn--mini p-btn--forte" disabled={!quando || !v.video_url} onClick={() => fazer('programar', { auto: true })}>
                {st.auto ? 'Mudar horário' : k === 'yt' ? 'Painel sobe e programa' : 'Painel posta sozinho'}
              </button>
            )}
            <button className={`p-btn p-btn--mini ${(k === 'ig' && igOk) || (k === 'yt' && YT_AUTO.has(v.canal)) ? '' : 'p-btn--forte'}`} disabled={!quando} onClick={() => fazer('programar', { auto: false })}>
              {st.s === 'programado' && !st.auto ? 'Mudar horário' : k === 'ig' && igOk ? 'Programei no app' : k === 'yt' && YT_AUTO.has(v.canal) ? 'Programei no Studio' : 'Programei'}
            </button>
            <button className="p-btn p-btn--mini" onClick={() => fazer('postei')}>Já postei</button>
            {st.s === 'programado' && <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => fazer('desfazer')}>Cancelar</button>}
          </div>
        </>
      )}
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

// Arrastar o cartão para outra coluna muda as 3 redes de uma vez (sem abrir rede por rede).
// quando: horário escolhido (Programar tudo); sem ele, a sugestão do vídeo.
function dadosMover(v, alvo, igOk, rede = null, quando = null) {
  let d = {}
  const sug = quando || sugestao(v)
  if (alvo === 'programar') d.subido_em = null
  if (alvo === 'subido') d.subido_em = v.subido_em || new Date().toISOString()
  for (const r of redesDe(v).filter((x) => !rede || x.k === rede)) {
    const st = situacao(v, r.k)
    if (st.processando) continue
    if ((alvo === 'programar' || alvo === 'subido') && st.s !== 'pendente') d = { ...d, ...campos(r.k, 'desfazer', null, false, v) }
    // o que já está no ar não volta a ser programado
    if (alvo === 'programado' && st.s === 'pendente') d = { ...d, ...campos(r.k, 'programar', sug, r.k === 'yt' ? YT_AUTO.has(v.canal) : igOk, v) }
    if (alvo === 'postado' && st.s !== 'postado') d = { ...d, ...campos(r.k, 'postei', null) }
  }
  return d
}

function Detalhe({ v, fechar, recarregar, igOk, voltar = 'Vídeos', mover, vizinhos }) {
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
          <button className="p-voltar" onClick={fechar}>{voltar}</button>
          <h1>{num(v)} {v.yt_titulo}</h1>
          <p className="p-sub">Sugestão: {fmtQuando(sugestao(v))} · {Math.round(v.duracao || 0)} s</p>
          {mover && v.video_url && (
            <div className="v-etapas" role="group" aria-label="Mudar de coluna">
              {FASES.filter((f) => f.k !== 'producao').map((f) => {
                const atual = etapa(v) === f.k
                return <button key={f.k} type="button" className={atual ? 'on' : ''} aria-pressed={atual} style={{ '--c': f.cor }} disabled={atual} onClick={() => mover(paraItem(v), f.k)}>{f.nome}</button>
              })}
            </div>
          )}
        </div>
        <div className="p-acoes">
          {vizinhos?.anterior && <button className="p-btn p-btn--fraco" onClick={vizinhos.anterior} aria-label="Vídeo anterior">‹</button>}
          {vizinhos?.proximo && <button className="p-btn p-btn--fraco" onClick={vizinhos.proximo} aria-label="Próximo vídeo">›</button>}
          {v.video_url && <a className="p-btn p-btn--forte" href={baixar} title={nomeArquivo(v)}>Baixar com o título</a>}
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

          {temTT(v.canal) && <article className={`v-plat v-plat--${situacao(v, 'tt').s}`}>
            <header><h2>TikTok</h2></header>
            {rede('tt', 'TikTok')}
            <Bloco titulo="Legenda" texto={v.tt_legenda} linhas={3} />
            <p className="v-dica">Marque "Conteúdo gerado por IA" nas opções do post (a voz é sintética).</p>
            <div className="p-acoes">
              <a className="p-btn" href="https://www.tiktok.com/tiktokstudio/upload" target="_blank" rel="noreferrer">Abrir TikTok Studio</a>
              {celular && v.video_url && <button className="p-btn" onClick={() => compartilhar(v, v.tt_legenda, avisar)}>Mandar para o app (copia a legenda)</button>}
            </div>
          </article>}

          <article className={`v-plat v-plat--${igSt.s}`}>
            <header><h2>Instagram Reels</h2></header>
            {rede('ig', 'Insta')}
            <div className="v-ig-opcoes">
              <label className="v-check"><input type="checkbox" checked={v.ig_feed !== false} disabled={igSt.s === 'postado' || igSt.processando}
                onChange={(e) => salvar({ ig_feed: e.target.checked }, e.target.checked ? 'Vai para o feed e a aba Reels' : 'Só na aba Reels, fora do feed')} />
                Mostrar também no feed <small>(desmarcado: fica só na aba Reels)</small></label>
              <label className="v-check"><input type="checkbox" checked={!!v.ig_story} disabled={v.ig_story_status === 'publicado' || v.ig_story_status === 'processando'}
                onChange={(e) => salvar({ ig_story: e.target.checked }, e.target.checked ? 'Também vai para os Stories' : 'Sem Stories')} />
                Postar também nos Stories <small>(sai junto com o Reel)</small></label>
              {v.ig_story && v.ig_story_status !== 'pendente' && (
                <p className={`v-dica ${v.ig_story_status === 'erro' ? 'v-dica--erro' : ''}`}>Stories: {v.ig_story_status === 'publicado' ? 'publicado' : v.ig_story_status === 'processando' ? 'processando…' : `erro: ${v.ig_story_erro || ''}`}</p>
              )}
            </div>
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

// Colunas do quadro (mesmas de antes; "Em produção" só aparece quando tem vídeo nela)
const FASES = [
  { k: 'producao', nome: 'Em produção', cor: '#8E8499', papel: 'fila', opcional: true, soltar: false },
  { k: 'programar', nome: 'Para programar', cor: '#B600F6', papel: 'fila' },
  { k: 'subido', nome: 'Upload feito', cor: '#E08A00', papel: 'fila' },
  { k: 'programado', nome: 'Programado', cor: '#6E56CF', papel: 'programado' },
  { k: 'postado', nome: 'Postado', cor: '#1E9E5A', papel: 'postado' },
]

// Cartão do quadro a partir de uma linha de `videos`
const SIGLAS = { yt: 'YT', tt: 'TT', ig: 'IG' }
const NOMES = { yt: 'YouTube', tt: 'TikTok', ig: 'Instagram' }
function paraItem(v) {
  const e = etapa(v)
  const sts = redesDe(v).map((r) => ({ k: r.k, ...situacao(v, r.k) }))
  const redes = sts.map((st) => ({
    sigla: SIGLAS[st.k], nome: NOMES[st.k], s: st.s,
    dica: st.s === 'programado' ? `programado${st.quando ? ` para ${fmtCurto(st.quando)}` : ''}${st.auto ? ' (sai sozinho)' : ''}` : st.s === 'postado' ? 'postado' : 'ainda não programado',
  }))
  const prog = sts.filter((st) => st.s === 'programado' && st.quando).map((st) => st.quando).sort()
  const post = sts.map((st) => st.postado).filter(Boolean).sort()
  return {
    chave: v.id, bruto: v,
    fase: e,
    titulo: v.yt_titulo || v.titulo || num(v), num: num(v),
    video_url: v.video_url, capa_url: v.capa_url, baixar: baixarUrl(v),
    quando: prog[0] || null, postado: post.at(-1) || null,
    views: (v.yt_views || 0) + (v.ig_views || 0),
    erro: sts.find((st) => st.erro)?.erro || '',
    publicando: v.ig_status === 'processando',
    // nas 3 pendentes não precisa mostrar as redes; quando uma já andou, mostra
    redes: redes.every((r) => r.s === 'pendente') ? null : redes,
    aviso: e === 'producao' ? 'Em produção' : '',
    programavel: e === 'programar' || e === 'subido',
    movel: !!v.video_url,
    // mais recente em cima (em Upload feito, o último que subiu)
    ordem: `${e === 'subido' ? v.subido_em || '' : ''}${v.created_at || ''}${String(v.numero ?? 0).padStart(6, '0')}`,
  }
}

export default function Videos({ canal = 'concrete-atlas', nome = 'Concrete Atlas' }) {
  const { versao, avisar } = usePainel()
  const [lista, setLista] = useState(null)
  const [abertoId, setAbertoId] = useState(null)
  const info = CANAIS.find((c) => c.id === canal) || { id: canal, nome, cor: '#888', sigla: nome.slice(0, 2).toUpperCase(), tipo: 'shorts' }
  const cx = useConexoes(canal)
  if (cx.ytAuto) YT_AUTO.add(canal); else YT_AUTO.delete(canal)

  const carregar = async () => {
    const { data } = await supabase.from('videos').select('*').eq('canal', canal).order('publicar_em', { ascending: true, nullsFirst: false })
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [versao])
  const itens = useMemo(() => (lista || []).map(paraItem), [lista])

  if (lista === null) return <p className="p-vazio">Carregando…</p>
  const igOk = cx.igOk
  const aberto = lista.find((v) => v.id === abertoId)
  const ordemLista = itens.map((i) => i.chave)
  const pos = ordemLista.indexOf(abertoId)
  const vizinhos = {
    anterior: pos > 0 ? () => setAbertoId(ordemLista[pos - 1]) : null,
    proximo: pos >= 0 && pos < ordemLista.length - 1 ? () => setAbertoId(ordemLista[pos + 1]) : null,
  }
  const paraSubir = lista.filter((v) => v.video_url && etapa(v) === 'programar')

  if (aberto) return <Detalhe v={aberto} fechar={() => setAbertoId(null)} recarregar={carregar} igOk={igOk} voltar={nome} mover={mover} vizinhos={vizinhos} />

  async function mover(item, alvo) {
    const v = item.bruto
    if (!v.video_url || alvo === 'producao') return
    const d = dadosMover(v, alvo, igOk)
    if (!Object.keys(d).length) return
    const { error } = await supabase.from('videos').update(d).eq('id', v.id)
    avisar(error ? 'Não salvou' : alvo === 'programado' ? `${num(v)} programado para ${fmtQuando(sugestao(v))}`
      : alvo === 'postado' ? `${num(v)} marcado como postado` : alvo === 'subido' ? `${num(v)}: upload feito` : `${num(v)} voltou para Para programar`)
    await carregar()
  }

  // Programar tudo: cada vídeo recebe o seu horário nas redes que ainda faltam
  async function programar(lote, progresso) {
    let ok = 0
    for (let k = 0; k < lote.length; k++) {
      const { item, quando } = lote[k]
      progresso?.(k + 1, lote.length)
      const d = dadosMover(item.bruto, 'programado', igOk, null, quando)
      if (!Object.keys(d).length) continue
      const { error } = await supabase.from('videos').update(d).eq('id', item.bruto.id)
      if (!error) ok++
    }
    avisar(ok === lote.length ? `${ok} programados` : `${ok} de ${lote.length} programados`)
    await carregar()
  }

  // Subir vídeo: arquivo e capa no bucket "videos" (canal/id.mp4 e canal/id.jpg) e a linha nova em Prontos
  async function subir(file, { titulo, capa, duracao }) {
    const numero = Math.max(0, ...lista.map((v) => v.numero || 0)) + 1
    const id = `${(info.sigla || canal.slice(0, 2)).toLowerCase()}-v${numero}-${Date.now().toString(36)}`
    const pasta = supabase.storage.from('videos')
    const up = await pasta.upload(`${canal}/${id}.mp4`, file, { contentType: 'video/mp4', upsert: true, cacheControl: '31536000' })
    if (up.error) { avisar(`Não subiu: ${up.error.message}`); return false }
    let capaUrl = null
    if (capa) {
      const c = await pasta.upload(`${canal}/${id}.jpg`, capa, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
      if (!c.error) capaUrl = pasta.getPublicUrl(`${canal}/${id}.jpg`).data.publicUrl
    }
    const { error } = await supabase.from('videos').insert({
      id, canal, numero, titulo, yt_titulo: titulo, arquivo: `${titulo}.mp4`,
      video_url: pasta.getPublicUrl(`${canal}/${id}.mp4`).data.publicUrl, capa_url: capaUrl, duracao,
    })
    if (error) { avisar('Subiu, mas não registrou'); return false }
    avisar('Vídeo em Para programar'); await carregar(); return true
  }

  return (
    <Pipeline canal={info} fases={FASES} itens={itens} mover={mover} programar={programar} subir={subir} abrir={(i) => i && setAbertoId(i.chave)}
      cx={cx} recarregar={carregar} extra={<>
        {paraSubir.length > 0 && <button className="p-btn" onClick={() => baixarVarios(paraSubir, avisar)} title="Baixa os vídeos de Para programar com o título do YouTube no nome do arquivo">Baixar {paraSubir.length} para subir</button>}
        {canal === 'thata' ? <BotoesThata /> : null}
      </>} />
  )
}
