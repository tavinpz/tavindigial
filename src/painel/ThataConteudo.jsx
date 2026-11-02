// Notícias e Legendas da Thata (trazidas do thata.conteudo) em dois botões na página do canal Thata.
// Notícias: lê e muda o status em `noticias_thata` do projeto Supabase do thata.conteudo.
// Legendas: sobe imagem/vídeo, extrai um quadro no navegador e pede a legenda ao webhook do n8n (mesmo do thata.conteudo).
import { useEffect, useRef, useState } from 'react'
import { Janela } from './Pipeline'
import { usePainel } from './Painel'

// Projeto do thata.conteudo (chave publicável, a mesma que já está no site do thata.conteudo)
const TC_URL = 'https://qkxarbktmbxboxxdiahh.supabase.co'
const TC_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGFyYmt0bWJ4Ym94eGRpYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDAzOTEsImV4cCI6MjA5MzY3NjM5MX0.HmDonUfUmJ_ewS7aUJIsSHLYaT3kEWjHdHz4YhpSorw'
const WEBHOOK_LEGENDAS = 'https://n8n-n8n.ivljly.easypanel.host/webhook/thata-legendas'
const H = { apikey: TC_ANON, Authorization: `Bearer ${TC_ANON}` }

async function copiar(texto, avisar) {
  try { await navigator.clipboard.writeText(texto || ''); avisar('Copiado') } catch { avisar('Não consegui copiar') }
}
// **negrito** e quebras de linha, sem HTML
function Texto({ t }) {
  return <p className="tc-texto">{String(t || '').split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>))}</p>
}

// ── Notícias ──
const FILTROS = [['pendente', 'Pendentes'], ['aprovada', 'Aprovadas'], ['postada', 'Postadas'], ['rejeitada', 'Rejeitadas'], ['all', 'Todas']]
const ACOES = {
  pendente: [['aprovada', 'Aprovar', true], ['rejeitada', 'Rejeitar']],
  aprovada: [['postada', 'Marcar como postada', true], ['pendente', 'Voltar pra pendente']],
  postada: [['aprovada', 'Voltar pra aprovada']],
  rejeitada: [['pendente', 'Voltar pra pendente']],
}
function Noticias({ fechar }) {
  const { avisar } = usePainel()
  const [filtro, setFiltro] = useState('pendente')
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState('')
  const carregar = async () => {
    setLista(null); setErro('')
    try {
      let url = `${TC_URL}/rest/v1/noticias_thata?order=score_final.desc.nullslast,created_at.desc&limit=50`
      if (filtro !== 'all') url += `&status=eq.${filtro}`
      const r = await fetch(url, { headers: H })
      if (!r.ok) throw new Error(`Supabase ${r.status}`)
      setLista(await r.json())
    } catch (e) { setErro(e.message); setLista([]) }
  }
  useEffect(() => { carregar() }, [filtro]) // eslint-disable-line react-hooks/exhaustive-deps
  async function status(id, novo) {
    const corpo = { status: novo }
    if (novo === 'postada') corpo.postada_em = new Date().toISOString()
    const r = await fetch(`${TC_URL}/rest/v1/noticias_thata?id=eq.${id}`, { method: 'PATCH', headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(corpo) })
    if (!r.ok) { avisar(`Não salvou (${r.status})`); return }
    avisar(`Marcada como ${novo}`); carregar()
  }
  return (
    <Janela titulo="Notícias" sub="Pautas do dia já com o ângulo da Thata" fechar={fechar} larga>
      <div className="tc-filtros">
        {FILTROS.map(([k, n]) => <button key={k} type="button" className={`tc-pill ${filtro === k ? 'on' : ''}`} onClick={() => setFiltro(k)}>{n}</button>)}
      </div>
      {lista === null && <p className="p-vazio">Carregando…</p>}
      {erro && <p className="p-vazio">Não carregou: {erro}</p>}
      {lista?.length === 0 && !erro && <p className="p-vazio">Nenhuma notícia {filtro !== 'all' ? `${FILTROS.find((f) => f[0] === filtro)[1].toLowerCase()}` : ''} agora.</p>}
      <div className="tc-lista">
        {(lista || []).map((n) => {
          const st = n.status || 'pendente'
          const quando = n.publicada_em ? new Date(n.publicada_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
          return (
            <article key={n.id} className="tc-noticia">
              <header>
                <span className="tc-fonte">{n.fonte_publicacao || n.fonte || '—'}{quando && ` · ${quando}`}</span>
                <span className="tc-nota" title="Nota final">{n.score_final ?? '—'}</span>
                <span className={`tc-st tc-st--${st}`}>{st}</span>
              </header>
              {n.titulo_post && <h3>{n.titulo_post}</h3>}
              {n.headline && <p className="tc-headline">{n.headline}</p>}
              {n.descricao_post && <Texto t={n.descricao_post} />}
              <p className="tc-orig">{n.titulo_original}{n.url_original && <> · <a href={n.url_original} target="_blank" rel="noreferrer">ver original</a></>}</p>
              {(n.angulo_thata || n.canal_sugerido) && <p className="tc-meta">{n.angulo_thata && <><b>Ângulo:</b> {n.angulo_thata} </>}{n.canal_sugerido && <><b>Canal:</b> {n.canal_sugerido}</>}</p>}
              <div className="tc-acoes">
                {n.descricao_post && <button type="button" className="p-btn p-btn--mini" onClick={() => copiar(n.descricao_post, avisar)}>Copiar descrição</button>}
                {(ACOES[st] || []).map(([novo, rot, forte]) => <button key={novo} type="button" className={`p-btn p-btn--mini ${forte ? 'p-btn--forte' : ''}`} onClick={() => status(n.id, novo)}>{rot}</button>)}
              </div>
            </article>
          )
        })}
      </div>
    </Janela>
  )
}

// ── Legendas ──
function quadroDe(arquivo) {
  // imagem ou vídeo → JPEG de até 1280px em base64 (o que vai para a IA)
  return new Promise((ok, falha) => {
    const desenhar = (el, w, h) => {
      const k = Math.min(1280 / w, 1280 / h, 1)
      const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k)
      c.getContext('2d').drawImage(el, 0, 0, c.width, c.height)
      return c.toDataURL('image/jpeg', 0.85)
    }
    const url = URL.createObjectURL(arquivo)
    if (arquivo.type.startsWith('image/')) {
      const img = new Image()
      img.onload = () => { ok(desenhar(img, img.width, img.height)); URL.revokeObjectURL(url) }
      img.onerror = () => falha(new Error('Não consegui abrir a imagem'))
      img.src = url
    } else if (arquivo.type.startsWith('video/')) {
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata'
      const t = setTimeout(() => falha(new Error('O vídeo demorou demais para abrir (use MP4 H.264)')), 30000)
      v.onloadedmetadata = () => { v.currentTime = Math.min(1, v.duration * 0.1) }
      v.onseeked = () => { clearTimeout(t); try { ok(desenhar(v, v.videoWidth, v.videoHeight)) } catch { falha(new Error('Não consegui tirar um quadro do vídeo')) } URL.revokeObjectURL(url) }
      v.onerror = () => { clearTimeout(t); falha(new Error('Não consegui ler esse vídeo')) }
      v.src = url
    } else falha(new Error('Use PNG, JPG, WEBP ou MP4'))
  })
}

function Legendas({ fechar }) {
  const { avisar } = usePainel()
  const [quadro, setQuadro] = useState(null)
  const [nome, setNome] = useState('')
  const [lendo, setLendo] = useState(false)
  const [contexto, setContexto] = useState('')
  const [versoes, setVersoes] = useState([])
  const [gerando, setGerando] = useState('')
  const [ajustes, setAjustes] = useState({})
  const [arrastando, setArrastando] = useState(false)
  const input = useRef(null)

  async function escolher(arq) {
    if (!arq) return
    if (arq.size > 200 * 1024 * 1024) { avisar('Arquivo acima de 200 MB'); return }
    setLendo(true)
    try { setQuadro(await quadroDe(arq)); setNome(arq.name); setVersoes([]) } catch (e) { avisar(e.message) }
    setLendo(false)
  }
  async function gerar(chave, extra = {}) {
    if (!quadro) return
    setGerando(chave)
    try {
      const r = await fetch(WEBHOOK_LEGENDAS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_base64: quadro, media_type: 'image/jpeg', contexto_user: contexto.trim(), legenda_anterior: extra.anterior || null, ajuste_pedido: extra.ajuste || null }) })
      if (!r.ok) throw new Error(`webhook ${r.status}`)
      const d = await r.json()
      if (!d.legenda) throw new Error(d.erro || 'resposta sem legenda')
      setVersoes((vs) => [{ n: vs.length + 1, legenda: d.legenda, porque: d.raciocinio_curto || '', ajuste: extra.ajuste || '', hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }, ...vs])
    } catch (e) { avisar(`Não gerou: ${e.message}`) }
    setGerando('')
  }

  return (
    <Janela titulo="Legendas" sub="Sobe uma imagem ou vídeo; a IA olha o conteúdo e escreve no tom da Thata" fechar={fechar} larga>
      {!quadro ? (
        <label className={`tc-drop ${arrastando ? 'on' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true) }} onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); escolher(e.dataTransfer.files?.[0]) }}>
          <input ref={input} type="file" accept="image/*,video/*" hidden onChange={(e) => escolher(e.target.files?.[0])} />
          <strong>{lendo ? 'Lendo o arquivo…' : 'Arraste aqui ou clique para escolher'}</strong>
          <span>PNG, JPG, WEBP ou MP4 · até 200 MB · o vídeo vira um quadro aqui mesmo no navegador</span>
        </label>
      ) : (
        <div className="tc-leg">
          <div className="tc-previa">
            <img src={quadro} alt="" />
            <span>{nome}</span>
            <button type="button" className="p-btn p-btn--mini" onClick={() => { setQuadro(null); setVersoes([]); setContexto('') }}>Trocar arquivo</button>
          </div>
          <div className="tc-leg-lado">
            <label className="p-campo">Contexto (opcional)
              <textarea rows={3} value={contexto} onChange={(e) => setContexto(e.target.value)} placeholder="Ex.: post de lançamento, foco em clínicas odontológicas, CTA para o link da bio" />
            </label>
            <button type="button" className="p-btn p-btn--forte" onClick={() => gerar('nova')} disabled={!!gerando}>{gerando === 'nova' ? 'Gerando…' : versoes.length ? 'Gerar nova legenda' : 'Gerar legenda'}</button>
            {versoes.map((v, i) => (
              <article key={v.n} className="tc-versao">
                <header><b>Versão {v.n}</b> <span>{v.hora}</span>{v.ajuste && <em> · ajuste: “{v.ajuste}”</em>}</header>
                <Texto t={v.legenda} />
                {v.porque && <p className="tc-porque">{v.porque}</p>}
                <div className="tc-acoes">
                  <button type="button" className="p-btn p-btn--mini p-btn--forte" onClick={() => copiar(v.legenda, avisar)}>Copiar</button>
                  <button type="button" className="p-btn p-btn--mini" onClick={() => gerar(`outra${i}`, { anterior: v.legenda })} disabled={!!gerando}>{gerando === `outra${i}` ? 'Gerando…' : 'Outra versão'}</button>
                </div>
                <form className="tc-ajuste" onSubmit={(e) => { e.preventDefault(); const a = (ajustes[v.n] || '').trim(); if (a) { gerar(`aj${i}`, { anterior: v.legenda, ajuste: a }); setAjustes((s) => ({ ...s, [v.n]: '' })) } }}>
                  <input value={ajustes[v.n] || ''} onChange={(e) => setAjustes((s) => ({ ...s, [v.n]: e.target.value }))} placeholder="Ajuste: “mais curta”, “tira o CTA”, “tom mais formal”…" />
                  <button type="submit" className="p-btn p-btn--mini" disabled={!!gerando}>{gerando === `aj${i}` ? '…' : 'Aplicar'}</button>
                </form>
              </article>
            ))}
          </div>
        </div>
      )}
    </Janela>
  )
}

// Os dois botões do topo da página da Thata
export default function BotoesThata() {
  const [aberta, setAberta] = useState(null)
  return (
    <>
      <button type="button" className="p-btn" onClick={() => setAberta('noticias')}>Notícias</button>
      <button type="button" className="p-btn" onClick={() => setAberta('legendas')}>Legendas</button>
      {aberta === 'noticias' && <Noticias fechar={() => setAberta(null)} />}
      {aberta === 'legendas' && <Legendas fechar={() => setAberta(null)} />}
    </>
  )
}
