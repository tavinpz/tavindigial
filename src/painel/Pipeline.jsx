import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { MiniVideo, Previa } from './Previa'
import Metricas from './Metricas'

// Pipeline padrão de todos os canais: Prontos → Programados → Postados.
// Cada canal (Estudio para a Tavin Digital, Videos para os de vídeo curto) entrega os cartões já no formato abaixo
// e as ações (mover, programar em lote, subir vídeo). O visual, o cabeçalho e as janelas são os mesmos para todos.
//
// As colunas vêm de cada canal (fases): { k, nome, cor, papel: 'fila' | 'programado' | 'postado', opcional?, soltar? }
//   papel 'programado' ordena pelo próximo a sair; 'postado' é recolhível; 'fila' fica com o mais recente em cima.
// item: { chave, fase: k de uma das colunas, titulo, num?, tipo?, video_url?, capa_url?, mini?, quando?, postado?,
//         views?, erro?, redes?: [{ sigla, s }], aviso?, planejado?, programavel, ordem, sub? }

const FUSO = 'America/Sao_Paulo'
const FASES_PADRAO = [
  { k: 'pronto', nome: 'Pronto', cor: '#B600F6', papel: 'fila' },
  { k: 'programado', nome: 'Programado', cor: '#6E56CF', papel: 'programado' },
  { k: 'postado', nome: 'Postado', cor: '#1E9E5A', papel: 'postado' },
]
export const fmtDia = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' }) : '')
export const fmtHora = (iso) => (iso ? new Date(iso).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }) : '')
export const fmtQuando = (iso) => (iso ? `${fmtDia(iso)} ${fmtHora(iso)}` : '')
// curto para os cartões: sex 06/11 12h · sex 06/11 12:30
export const fmtCurto = (iso) => {
  if (!iso) return ''
  const h = fmtHora(iso)
  return `${fmtDia(iso).replace(/\.,?/g, '')} ${h.endsWith(':00') ? `${h.slice(0, 2)}h` : h}`
}
const fmtNum = (n) => Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
// datas no fuso de São Paulo (UTC-3, sem horário de verão)
const diaSP = (iso) => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 10)
const somaDias = (dia, n) => { const d = new Date(`${dia}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const isoSP = (dia, hora) => new Date(`${dia}T${hora}:00-03:00`).toISOString()

const lerLS = (k, padrao) => { try { return localStorage.getItem(k) ?? padrao } catch { return padrao } }
const gravarLS = (k, v) => { try { localStorage.setItem(k, v) } catch { /* sem storage */ } }
// celular: as colunas viram abas (uma por vez)
function useCelular() {
  const q = '(max-width: 760px)'
  const [c, setC] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches)
  useEffect(() => {
    const m = window.matchMedia?.(q)
    if (!m) return undefined
    const f = () => setC(m.matches)
    m.addEventListener?.('change', f)
    return () => m.removeEventListener?.('change', f)
  }, [])
  return c
}

// ── Conexões do canal (Instagram, YouTube). A Tavin Digital usa o Instagram principal; os outros, o do próprio canal ──
export function useConexoes(canal, marca = false) {
  const [ig, setIg] = useState(null)
  const [yt, setYt] = useState(null)
  const carregar = async () => {
    const [a, b] = await Promise.all([
      marca ? supabase.rpc('instagram_status') : supabase.rpc('instagram_status_canal', { p_canal: canal }),
      supabase.rpc('youtube_status_canal', { p_canal: canal }),
    ])
    setIg(a.data?.[0] || { conectado: false })
    setYt(b.data?.[0] || { ref: null })
  }
  useEffect(() => { carregar() }, [canal])
  return { ig, yt, igOk: !!ig?.conectado, ytOk: !!yt?.ref, recarregar: carregar }
}

// Janela (modal) simples: Esc ou clicar fora fecha
function Janela({ titulo, sub, fechar, children, rodape, larga }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', esc)
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = o }
  }, [fechar])
  return createPortal(
    <div className="pl-fundo" onClick={fechar}>
      <div className={`pl-janela ${larga ? 'pl-janela--larga' : ''}`} role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <header className="pl-janela-cab">
          <div><h2>{titulo}</h2>{sub && <p>{sub}</p>}</div>
          <button type="button" className="pl-x" onClick={fechar} aria-label="Fechar">×</button>
        </header>
        <div className="pl-janela-corpo">{children}</div>
        {rodape && <footer className="pl-janela-pe">{rodape}</footer>}
      </div>
    </div>, document.body)
}

// ── Cartão ──
function Miniatura({ item }) {
  if (item.capa_url) return <img src={item.capa_url} alt="" loading="lazy" />
  if (item.video_url) return <video src={`${item.video_url}#t=0.5`} muted playsInline preload="metadata" />
  return item.mini || <span className="pl-mini-vazia">{item.aviso || 'sem arte'}</span>
}

function Status({ item, papel }) {
  if (item.erro) return <em className="pl-st pl-st--erro">Erro: {item.erro}</em>
  if (item.aviso) return <em className="pl-st">{item.aviso}</em>
  if (papel === 'programado' && item.quando) return <em className="pl-st pl-st--prog">◷ {fmtCurto(item.quando)}{item.publicando ? ' · publicando…' : ''}</em>
  if (papel === 'postado') return <em className="pl-st pl-st--ok">✓ {item.postado ? fmtCurto(item.postado).replace(/ \S+$/, '') : 'no ar'}{item.views > 0 ? ` · ${fmtNum(item.views)} views` : ''}</em>
  if (item.planejado) return <em className="pl-st">planejado {fmtCurto(item.planejado)}</em>
  return null
}

function Cartao({ item, fase, papel, fases, abrir, previa, arrastar, arrastando, mover }) {
  const [pode, setPode] = useState(true)
  const arrastavel = pode && item.movel !== false
  return (
    <article className={`pl-card pl-card--${item.tipo || 'video'} ${arrastando ? 'pl-card--arrastando' : ''} ${item.aviso ? 'pl-card--fraco' : ''}`} draggable={arrastavel}
      onPointerDown={(e) => setPode(!e.target.closest('input, select'))}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.chave); arrastar(item.chave) }}
      onDragEnd={() => arrastar(null)}>
      {item.video_url
        ? <MiniVideo className="pl-mini" src={item.video_url} capa={item.capa_url} rotulo={`Ver a prévia de ${item.titulo}`} onClick={() => previa(item.chave)}><Miniatura item={item} /></MiniVideo>
        : <button type="button" className="pl-mini" onClick={() => abrir(item)} aria-label={`Abrir ${item.titulo}`} tabIndex={-1}><Miniatura item={item} /></button>}
      <button type="button" className="pl-txt" onClick={() => abrir(item)}>
        <strong>{item.num && <b className="pl-num">{item.num}</b>}{item.titulo}</strong>
        <span className="pl-linha">
          <Status item={item} papel={papel} />
          {item.redes && (
            <span className="pl-redes" aria-label={item.redes.map((r) => `${r.nome}: ${r.s}`).join(', ')}>
              {item.redes.map((r) => <i key={r.sigla} className={`pl-rede pl-rede--${r.s}`} title={`${r.nome}: ${r.s}`}>{r.sigla}</i>)}
            </span>
          )}
          {item.tipoNome && <span className={`pl-tipo pl-tipo--${item.tipo}`}>{item.tipoNome}</span>}
        </span>
      </button>
      {item.movel !== false && (
        <select className="pl-mover" value="" aria-label="Mover para outra coluna" onChange={(e) => e.target.value && mover(item.chave, e.target.value)}>
          <option value="">Mover…</option>
          {fases.filter((f) => f.k !== fase && f.soltar !== false).map((f) => <option key={f.k} value={f.k}>{f.nome}</option>)}
        </select>
      )}
    </article>
  )
}

// ── Integrações ──
function Integracoes({ canal, marca, cx, recarregar, fechar }) {
  const { avisar } = usePainel()
  const { ig, yt } = cx
  const [form, setForm] = useState(null)
  const [igForm, setIgForm] = useState({ user_id: '', token: '' })
  const [ytRef, setYtRef] = useState('')
  const [msg, setMsg] = useState('')
  const [ocupado, setOcupado] = useState(false)
  if (!ig || !yt) return null
  const ytOk = !!yt.ref

  async function testarIG() {
    setMsg('Testando o Instagram…')
    const { data, error } = marca
      ? await supabase.functions.invoke('publicar-instagram', { body: { verificar: true } })
      : await supabase.functions.invoke('publicar-reels', { body: { verificar: true, canal: canal.id } })
    setMsg(error ? 'Não consegui falar com o servidor.' : data?.ok ? `Instagram conectado como @${data.username}` : `Instagram: ${data?.erro}`)
  }
  async function salvarIG(e) {
    e.preventDefault()
    const { error } = marca
      ? await supabase.rpc('salvar_instagram', { p_user_id: igForm.user_id, p_token: igForm.token })
      : await supabase.rpc('salvar_instagram_canal', { p_canal: canal.id, p_user_id: igForm.user_id, p_token: igForm.token })
    if (error) { avisar('Não salvou'); return }
    setForm(null); await cx.recarregar(); testarIG()
  }
  async function conferir() {
    setOcupado(true); setMsg('Conferindo no YouTube e no Instagram…')
    const { data, error } = await supabase.functions.invoke('conferir-postagens', { body: {} })
    setOcupado(false)
    const r = data?.canais?.[canal.id] || data || {}
    setMsg(error ? 'Não consegui falar com o servidor.' : [r.youtube && `YouTube: ${r.youtube}`, r.instagram && `Instagram: ${r.instagram}`].filter(Boolean).join(' · ') || 'Conferido.')
    cx.recarregar(); recarregar()
  }
  async function salvarYT(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('salvar_youtube_canal', { p_canal: canal.id, p_ref: ytRef })
    if (error) { avisar('Não salvou'); return }
    setForm(null); await cx.recarregar(); conferir()
  }

  return (
    <Janela titulo="Integrações" sub={canal.nome} fechar={fechar}
      rodape={<>
        <span className="pl-pe-txt">{msg || (yt.conferido_em ? `Última conferência ${fmtQuando(yt.conferido_em)}` : '')}</span>
        <button className="p-btn" onClick={conferir} disabled={ocupado || (!ytOk && !ig.conectado)}>{ocupado ? 'Conferindo…' : 'Conferir agora'}</button>
      </>}>
      <ul className="pl-integ">
        <li>
          <div className="pl-integ-linha">
            <span className={`pl-ponto ${ig.conectado ? 'on' : ''}`} aria-hidden="true" />
            <div className="pl-integ-txt"><b>Instagram</b><small>Meta · {ig.conectado ? 'conectado, posta sozinho no horário' : 'não conectado'}</small></div>
            <div className="pl-integ-acoes">
              {ig.conectado && <button className="p-btn p-btn--mini p-btn--fraco" onClick={testarIG}>Testar</button>}
              <button className="p-btn p-btn--mini" onClick={() => { setIgForm({ user_id: ig.user_id || '', token: '' }); setForm(form === 'ig' ? null : 'ig') }}>{ig.conectado ? 'Trocar token' : 'Ligar Instagram'}</button>
            </div>
          </div>
          {form === 'ig' && (
            <form className="pl-integ-form" onSubmit={salvarIG}>
              <label className="p-campo">Token da conta<input required type="password" value={igForm.token} onChange={(e) => setIgForm({ ...igForm, token: e.target.value })} placeholder="IGAA…" /></label>
              <label className="p-campo">ID da conta (opcional)<input value={igForm.user_id} onChange={(e) => setIgForm({ ...igForm, user_id: e.target.value })} placeholder="1784…" /></label>
              <button className="p-btn p-btn--forte">Salvar e testar</button>
            </form>
          )}
        </li>
        <li>
          <div className="pl-integ-linha">
            <span className={`pl-ponto ${ytOk ? 'on' : ''}`} aria-hidden="true" />
            <div className="pl-integ-txt"><b>YouTube</b><small>Google · {ytOk ? 'canal ligado, traz o que saiu e as views' : 'não ligado'}</small></div>
            <div className="pl-integ-acoes">
              <button className="p-btn p-btn--mini" onClick={() => { setYtRef(yt.ref || ''); setForm(form === 'yt' ? null : 'yt') }}>{ytOk ? 'Trocar canal' : 'Ligar YouTube'}</button>
            </div>
          </div>
          {form === 'yt' && (
            <form className="pl-integ-form" onSubmit={salvarYT}>
              <label className="p-campo">Link ou @ do canal<input required value={ytRef} onChange={(e) => setYtRef(e.target.value)} placeholder="https://youtube.com/@seucanal" /></label>
              <button className="p-btn p-btn--forte">Salvar e conferir</button>
            </form>
          )}
        </li>
        <li>
          <div className="pl-integ-linha">
            <span className="pl-ponto pl-ponto--manual" aria-hidden="true" />
            <div className="pl-integ-txt"><b>TikTok</b><small>Sem conexão: poste no app. Vira postado no horário programado.</small></div>
          </div>
        </li>
      </ul>
    </Janela>
  )
}

// ── Programar tudo: escolhe os prontos, o início, quantos por dia e os horários ──
const FREQS = [['1', '1 por dia'], ['2', '2 por dia'], ['3', '3 por dia'], ['2d', 'Dia sim, dia não']]
const HORAS = { 1: ['12:00'], 2: ['12:00', '18:00'], 3: ['09:00', '13:00', '19:00'] }

function ProgramarTudo({ itens, fila, programar, fechar }) {
  const [ordem, setOrdem] = useState('antigo')
  const lista = useMemo(() => [...itens].sort((a, b) => (ordem === 'antigo' ? a.ordem.localeCompare(b.ordem) : b.ordem.localeCompare(a.ordem))), [itens, ordem])
  const [sel, setSel] = useState(() => new Set(itens.map((i) => i.chave)))
  const amanha = somaDias(diaSP(new Date().toISOString()), 1)
  const [inicio, setInicio] = useState(() => (fila && diaSP(fila) >= amanha ? somaDias(diaSP(fila), 1) : amanha))
  const [freq, setFreq] = useState('1')
  const [horas, setHoras] = useState(HORAS[1])
  const [manter, setManter] = useState(true)
  const [ocupado, setOcupado] = useState('')
  const porDia = freq === '2d' ? 1 : Number(freq)
  const trocarFreq = (f) => { setFreq(f); const n = f === '2d' ? 1 : Number(f); setHoras((h) => (h.length === n ? h : HORAS[n])) }
  const agora = Date.now()
  const comPlano = lista.some((i) => i.planejado && new Date(i.planejado).getTime() > agora)

  // distribui os escolhidos, na ordem, pelos horários a partir do início (pula horário que já passou)
  const plano = useMemo(() => {
    const escolhidos = lista.filter((i) => sel.has(i.chave))
    const fixos = new Map(), resto = []
    for (const i of escolhidos) {
      if (manter && i.planejado && new Date(i.planejado).getTime() > agora + 600000) fixos.set(i.chave, i.planejado)
      else resto.push(i)
    }
    const hs = [...horas].filter(Boolean).sort()
    const passo = freq === '2d' ? 2 : 1
    const slots = []
    for (let d = 0, dia = inicio; slots.length < resto.length && d < 400 && hs.length && dia; d++, dia = somaDias(dia, passo)) {
      for (const h of hs) {
        const iso = isoSP(dia, h)
        if (new Date(iso).getTime() > agora + 600000 && slots.length < resto.length) slots.push(iso)
      }
    }
    const m = new Map(fixos)
    resto.forEach((i, k) => slots[k] && m.set(i.chave, slots[k]))
    return m
  }, [lista, sel, inicio, horas, freq, manter])

  const n = sel.size
  const ultimo = [...plano.values()].sort().at(-1)
  async function confirmar() {
    const lote = lista.filter((i) => plano.has(i.chave)).map((i) => ({ item: i, quando: plano.get(i.chave) }))
    if (!lote.length) return
    setOcupado('Programando…')
    await programar(lote, (k, total) => setOcupado(`Programando ${k} de ${total}…`))
    setOcupado(''); fechar()
  }
  const todos = n === lista.length
  return (
    <Janela titulo="Programar tudo" sub={fila ? `A fila atual vai até ${fmtDia(fila)}` : 'Nada programado ainda'} fechar={ocupado ? () => {} : fechar} larga
      rodape={<>
        <span className="pl-pe-txt">{n ? `${n} ${n === 1 ? 'post' : 'posts'}${ultimo ? `, até ${fmtDia(ultimo)}` : ''}` : 'Escolha ao menos um'}</span>
        <button className="p-btn p-btn--fraco" onClick={fechar} disabled={!!ocupado}>Cancelar</button>
        <button className="p-btn p-btn--forte" onClick={confirmar} disabled={!n || !!ocupado || plano.size < n}>{ocupado || `Programar ${n}`}</button>
      </>}>
      <div className="pl-prog-cfg">
        <label className="p-campo">Começar em<input type="date" value={inicio} min={diaSP(new Date().toISOString())} onChange={(e) => setInicio(e.target.value)} /></label>
        <label className="p-campo">Frequência
          <select value={freq} onChange={(e) => trocarFreq(e.target.value)}>{FREQS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
        </label>
        <div className="p-campo">{porDia > 1 ? 'Horários' : 'Horário'}
          <span className="pl-horas">
            {Array.from({ length: porDia }, (_, k) => (
              <input key={k} type="time" value={horas[k] || ''} aria-label={`Horário ${k + 1}`} onChange={(e) => setHoras((h) => { const x = [...h]; x[k] = e.target.value; return x })} />
            ))}
          </span>
        </div>
      </div>
      {comPlano && <label className="pl-check"><input type="checkbox" checked={manter} onChange={(e) => setManter(e.target.checked)} /> Manter as datas já planejadas</label>}
      <div className="pl-prog-barra">
        <label className="pl-check"><input type="checkbox" checked={todos} onChange={() => setSel(todos ? new Set() : new Set(lista.map((i) => i.chave)))} /> Todos ({lista.length})</label>
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordem">
          <option value="antigo">Mais antigos primeiro</option>
          <option value="novo">Mais novos primeiro</option>
        </select>
      </div>
      <ol className="pl-prog-lista">
        {lista.map((i) => {
          const on = sel.has(i.chave)
          return (
            <li key={i.chave} className={on ? 'on' : ''}>
              <label>
                <input type="checkbox" checked={on} onChange={() => setSel((s) => { const x = new Set(s); if (x.has(i.chave)) x.delete(i.chave); else x.add(i.chave); return x })} />
                <span className="pl-prog-mini"><Miniatura item={i} /></span>
                <span className="pl-prog-tit">{i.num && <b className="pl-num">{i.num}</b>}{i.titulo}</span>
                <span className="pl-prog-quando">{on ? fmtCurto(plano.get(i.chave)) || '—' : ''}</span>
              </label>
            </li>
          )
        })}
      </ol>
    </Janela>
  )
}

// ── Subir vídeo: arquivo + título; a capa sai do primeiro quadro do vídeo ──
function capaDoVideo(url) {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url
    const fim = (r) => { v.removeAttribute('src'); v.load(); resolve(r) }
    const t = setTimeout(() => fim({ capa: null, duracao: null }), 15000)
    v.onloadedmetadata = () => { v.currentTime = Math.min(0.5, (v.duration || 1) / 2) }
    v.onseeked = () => {
      try {
        const c = document.createElement('canvas')
        const esc = Math.min(1, 720 / (v.videoWidth || 720))
        c.width = Math.round((v.videoWidth || 720) * esc); c.height = Math.round((v.videoHeight || 1280) * esc)
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
        const duracao = Number.isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : null
        c.toBlob((b) => { clearTimeout(t); fim({ capa: b, duracao }) }, 'image/jpeg', 0.85)
      } catch { clearTimeout(t); fim({ capa: null, duracao: null }) }
    }
    v.onerror = () => { clearTimeout(t); fim({ capa: null, duracao: null }) }
  })
}

function SubirVideo({ canal, subir, fechar }) {
  const { avisar } = usePainel()
  const [arq, setArq] = useState(null)
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [ocupado, setOcupado] = useState('')
  const entrada = useRef(null)
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])
  function escolher(f) {
    if (!f) return
    if (!/^video\/(mp4|quicktime)$/.test(f.type) && !/\.(mp4|mov)$/i.test(f.name)) { avisar('Escolha um arquivo .mp4'); return }
    if (f.size > 50 * 1024 * 1024) { avisar('O vídeo passa de 50 MB: exporte em 1080p H.264'); return }
    setArq(f); setUrl(URL.createObjectURL(f))
    if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim())
  }
  async function enviar(e) {
    e.preventDefault()
    if (!arq) { entrada.current?.click(); return }
    setOcupado('Preparando a capa…')
    const { capa, duracao } = await capaDoVideo(url)
    setOcupado('Subindo o vídeo…')
    const ok = await subir(arq, { titulo: titulo.trim() || arq.name.replace(/\.[^.]+$/, ''), capa, duracao })
    setOcupado('')
    if (ok) fechar()
  }
  const mb = arq ? (arq.size / 1048576).toFixed(1).replace('.', ',') : ''
  return (
    <Janela titulo="Subir vídeo" sub={`Entra no quadro de ${canal.nome}, pronto para programar`} fechar={ocupado ? () => {} : fechar}
      rodape={<>
        <span className="pl-pe-txt">{ocupado || (arq ? `${arq.name} · ${mb} MB` : 'MP4 até 50 MB')}</span>
        <button className="p-btn p-btn--fraco" type="button" onClick={fechar} disabled={!!ocupado}>Cancelar</button>
        <button className="p-btn p-btn--forte" type="submit" form="pl-subir" disabled={!!ocupado || !arq}>{ocupado ? 'Subindo…' : 'Subir'}</button>
      </>}>
      <form id="pl-subir" className="pl-subir" onSubmit={enviar}>
        <label className={`pl-arquivo ${url ? 'pl-arquivo--com' : ''}`}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); escolher(e.dataTransfer.files?.[0]) }}>
          {url ? <video src={url} muted playsInline controls preload="metadata" /> : <span><b>Escolher arquivo</b><small>ou arraste o MP4 para cá</small></span>}
          <input ref={entrada} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" onChange={(e) => { escolher(e.target.files?.[0]); e.target.value = '' }} />
        </label>
        <div className="pl-subir-campos">
          <label className="p-campo">Título<input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome do vídeo" required /></label>
          {url && <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => entrada.current?.click()}>Trocar arquivo</button>}
        </div>
      </form>
    </Janela>
  )
}

// ── Quadro + cabeçalho ──
export default function Pipeline({ canal, fases = FASES_PADRAO, itens, mover, programar, subir, abrir, cx, recarregar, marca = false, extra = null, ocupado = '' }) {
  const [verPostados, setVerPostados] = useState(() => lerLS('pl-postados', '0') === '1')
  const [aba, setAba] = useState(null)
  const [janela, setJanela] = useState(null)
  const [previa, setPrevia] = useState(null)
  const [arr, setArr] = useState(null)
  const [sobre, setSobre] = useState(null)
  const [local, setLocal] = useState({})
  const [verTodos, setVerTodos] = useState({})
  const celular = useCelular()
  useEffect(() => gravarLS('pl-postados', verPostados ? '1' : '0'), [verPostados])

  const fase = (i) => local[i.chave] || i.fase
  const deFase = (k) => fases.find((f) => f.k === k)
  async function moverAqui(chave, alvo) {
    const it = itens.find((i) => i.chave === chave)
    if (!it || it.movel === false || fase(it) === alvo || deFase(alvo)?.soltar === false) return
    setLocal((l) => ({ ...l, [chave]: alvo }))
    await mover(it, alvo)
    setLocal((l) => { const x = { ...l }; delete x[chave]; return x })
  }

  const col = Object.fromEntries(fases.map((f) => [f.k, []]))
  for (const i of itens) col[fase(i)]?.push(i)
  for (const f of fases) {
    if (f.papel === 'programado') col[f.k].sort((a, b) => (a.quando || '').localeCompare(b.quando || '') || b.ordem.localeCompare(a.ordem))
    else if (f.papel === 'postado') col[f.k].sort((a, b) => (b.postado || '').localeCompare(a.postado || '') || b.ordem.localeCompare(a.ordem))
    else col[f.k].sort((a, b) => (!!a.aviso - !!b.aviso) || b.ordem.localeCompare(a.ordem)) // mais recente em cima
  }
  const visiveis = fases.filter((f) => !f.opcional || col[f.k].length)
  const abaAtual = visiveis.some((f) => f.k === aba) ? aba : (visiveis.find((f) => f.papel === 'fila' && !f.opcional) || visiveis[0]).k
  const fila = fases.filter((f) => f.papel === 'programado').flatMap((f) => col[f.k]).map((i) => i.quando).filter(Boolean).sort().at(-1)
  const programaveis = itens.filter((i) => i.programavel && deFase(fase(i))?.papel === 'fila')
  const listaPrevia = visiveis.flatMap((f) => col[f.k]).filter((i) => i.video_url)
    .map((i) => ({ id: i.chave, video_url: i.video_url, capa_url: i.capa_url, titulo: `${i.num ? `${i.num} ` : ''}${i.titulo}`, sub: deFase(fase(i))?.nome, baixar: i.baixar }))

  return (
    <section className="pl" style={{ '--c': canal.cor }}>
      <header className="pl-cab">
        <div className="pl-quem">
          {canal.logo ? <img src={canal.logo} alt="" /> : <span className="pl-sigla">{canal.sigla}</span>}
          <div>
            <h1>{canal.nome}</h1>
            {fila && <p>Fila até {fmtCurto(fila).replace(/ \S+$/, '')}</p>}
          </div>
        </div>
        <div className="pl-acoes">
          <button className="p-btn" onClick={() => setJanela('metricas')}>Métricas</button>
          <button className="p-btn" onClick={() => setJanela('integ')}>
            <span className={`pl-ponto ${cx.igOk ? 'on' : ''}`} aria-hidden="true" />Integrações
          </button>
          {extra}
          <button className="p-btn" onClick={() => setJanela('subir')}>Subir vídeo</button>
          <button className="p-btn p-btn--forte" onClick={() => setJanela('programar')} disabled={!programaveis.length}>Programar tudo</button>
        </div>
      </header>
      {ocupado && <p className="pl-ocupado" role="status">{ocupado}</p>}

      <div className="pl-abas" role="tablist" aria-label="Colunas">
        {visiveis.map((f) => (
          <button key={f.k} type="button" role="tab" aria-selected={abaAtual === f.k} className={abaAtual === f.k ? 'on' : ''} onClick={() => setAba(f.k)}>{f.nome} <small>{col[f.k].length}</small></button>
        ))}
      </div>

      <div className="pl-quadro">
        {visiveis.map((f) => {
          const { k, nome: n } = f
          const recolhida = f.papel === 'postado' && !verPostados && !celular
          const limite = f.papel === 'postado' ? 6 : f.papel === 'fila' ? 8 : 99
          const lista = recolhida ? [] : verTodos[k] ? col[k] : col[k].slice(0, limite)
          return (
            <section key={k} style={{ '--cor': f.cor }} className={`pl-col pl-col--${f.papel} ${abaAtual === k ? 'pl-col--ativa' : ''} ${arr && sobre === k ? 'pl-col--sobre' : ''}`} aria-label={n}
              onDragOver={(e) => { if (arr && f.soltar !== false) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (sobre !== k) setSobre(k) } }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSobre((x) => (x === k ? null : x)) }}
              onDrop={(e) => { e.preventDefault(); const ch = arr || e.dataTransfer.getData('text/plain'); setArr(null); setSobre(null); if (ch) moverAqui(ch, k) }}>
              <header className="pl-col-cab">
                <h2>{n}</h2>
                <span className="pl-col-n">{col[k].length}</span>
              </header>
              {recolhida && col[k].length > 0 && <button type="button" className="pl-col-btn pl-col-abrir" onClick={() => setVerPostados(true)}>Mostrar os {col[k].length}</button>}
              {lista.map((i) => (
                <Cartao key={i.chave} item={i} fase={k} papel={f.papel} fases={visiveis} abrir={abrir} previa={setPrevia} mover={moverAqui} arrastando={arr === i.chave}
                  arrastar={(c) => { setArr(c); if (!c) setSobre(null) }} />
              ))}
              {col[k].length === 0 && <p className="pl-vazia">{f.papel === 'fila' ? 'Vazio.' : f.papel === 'programado' ? 'Nada programado.' : 'Nada postado ainda.'}</p>}
              {!recolhida && col[k].length > limite && (
                <button type="button" className="pl-col-btn pl-col-mais" onClick={() => setVerTodos((v) => ({ ...v, [k]: !v[k] }))}>{verTodos[k] ? 'Mostrar menos' : `Ver mais ${col[k].length - limite}`}</button>
              )}
              {f.papel === 'postado' && verPostados && !celular && col[k].length > 0 && <button type="button" className="pl-col-btn pl-col-mais" onClick={() => setVerPostados(false)}>Recolher</button>}
            </section>
          )
        })}
      </div>

      {previa && <Previa lista={listaPrevia} id={previa} setId={setPrevia} abrirFicha={(ch) => abrir(itens.find((i) => i.chave === ch))} />}
      {janela === 'metricas' && <Metricas canal={canal} fechar={() => setJanela(null)} />}
      {janela === 'integ' && <Integracoes canal={canal} marca={marca} cx={cx} recarregar={recarregar} fechar={() => setJanela(null)} />}
      {janela === 'programar' && <ProgramarTudo itens={programaveis} fila={fila} programar={programar} fechar={() => setJanela(null)} />}
      {janela === 'subir' && <SubirVideo canal={canal} subir={subir} fechar={() => setJanela(null)} />}
    </section>
  )
}
