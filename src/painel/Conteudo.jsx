import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { dataCurta } from './api'
import { usePainel } from './Painel'
import { TIPOS, carregarFontes, desenharSlide, paraJpeg } from './slides'

const ESTADOS = { ideia: 'Rascunho', pronto: 'Pronto', agendado: 'Agendado', publicando: 'Publicando…', publicado: 'Publicado', erro: 'Erro ao publicar' }
const NOVO = [
  { tipo: 'capa', titulo: 'Título que faz parar o dedo', texto: 'Uma linha explicando o que a pessoa ganha lendo.' },
  { tipo: 'texto', titulo: 'Primeiro ponto', texto: 'Explique em 2 ou 3 frases curtas.' },
  { tipo: 'cta', titulo: 'Quer uma página assim para o seu negócio?', texto: 'Pronta em 24 horas. Você vê a prévia antes de pagar.' },
]

// Miniatura: desenha o slide num canvas pequeno (o canvas é 1080x1350, o CSS reduz)
function Slide({ slide, i, total, onCanvas }) {
  const ref = useRef(null)
  useEffect(() => {
    let vivo = true
    carregarFontes().then(() => { if (vivo && ref.current) desenharSlide(ref.current, slide, i, total) })
    onCanvas?.(i, ref.current)
    return () => { vivo = false }
  }, [slide, i, total])
  return <canvas ref={ref} className="p-slide" aria-label={`Slide ${i + 1}: ${slide.titulo}`} />
}

// Gera os JPEGs no navegador e sobe para o Storage público. Devolve as URLs.
async function gerarESubir(id, slides) {
  await carregarFontes()
  const versao = Date.now()
  const urls = []
  for (let i = 0; i < slides.length; i++) {
    const c = document.createElement('canvas')
    desenharSlide(c, slides[i], i, slides.length)
    const blob = await paraJpeg(c)
    const caminho = `${id}/${versao}-${i + 1}.jpg`
    const { error } = await supabase.storage.from('carrosseis').upload(caminho, blob, { contentType: 'image/jpeg', upsert: true })
    if (error) throw error
    urls.push(supabase.storage.from('carrosseis').getPublicUrl(caminho).data.publicUrl)
  }
  return urls
}

function paraLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function Editor({ item, fechar, recarregar }) {
  const { avisar } = usePainel()
  const [titulo, setTitulo] = useState(item.titulo)
  const [legenda, setLegenda] = useState(item.legenda || '')
  const [slides, setSlides] = useState(item.slides?.length ? item.slides : NOVO)
  const [quando, setQuando] = useState(paraLocal(item.agendado_para))
  const [ocupado, setOcupado] = useState('')
  const canvases = useRef([])

  const mudarSlide = (i, campo, valor) => setSlides((s) => s.map((x, j) => (j === i ? { ...x, [campo]: valor } : x)))
  const mover = (i, d) => setSlides((s) => {
    const n = [...s]; const j = i + d
    if (j < 0 || j >= n.length) return s
    ;[n[i], n[j]] = [n[j], n[i]]; return n
  })
  const remover = (i) => setSlides((s) => s.filter((_, j) => j !== i))
  const adicionar = () => setSlides((s) => {
    const n = [...s]; const pos = n.findIndex((x) => x.tipo === 'cta')
    n.splice(pos === -1 ? n.length : pos, 0, { tipo: 'texto', titulo: 'Novo ponto', texto: '' })
    return n
  })

  async function salvar(extra = {}) {
    const { error } = await supabase.from('conteudo').update({ titulo, legenda, slides, formato: 'carrossel', ...extra }).eq('id', item.id)
    if (error) throw error
  }

  async function gerarImagens() {
    await carregarFontes()
    const blobs = []
    for (let i = 0; i < slides.length; i++) {
      const c = document.createElement('canvas')
      desenharSlide(c, slides[i], i, slides.length)
      blobs.push(await paraJpeg(c))
    }
    return blobs
  }

  async function baixar() {
    setOcupado('baixar')
    try {
      const blobs = await gerarImagens()
      blobs.forEach((b, i) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(b); a.download = `${titulo.slice(0, 40) || 'carrossel'}-${i + 1}.jpg`
        a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
      })
    } finally { setOcupado('') }
  }

  async function agendar() {
    if (!quando) { avisar('Escolha o dia e a hora'); return }
    if (slides.length < 2) { avisar('Carrossel precisa de pelo menos 2 slides'); return }
    setOcupado('agendar')
    try {
      const urls = await gerarESubir(item.id, slides)
      await salvar({ imagens: urls, agendado_para: new Date(quando).toISOString(), status: 'agendado', erro: null })
      avisar('Agendado. Publica sozinho no horário.')
      recarregar(); fechar()
    } catch (e) {
      avisar(`Não agendou: ${e.message || 'erro'}`)
    } finally { setOcupado('') }
  }

  async function salvarRascunho() {
    setOcupado('salvar')
    try { await salvar(); avisar('Salvo'); recarregar() } catch { avisar('Não salvou') } finally { setOcupado('') }
  }

  async function publicarAgora() {
    setOcupado('publicar')
    try {
      const urls = await gerarESubir(item.id, slides)
      await salvar({ imagens: urls, status: 'agendado', erro: null, agendado_para: new Date().toISOString() })
      const { data, error } = await supabase.functions.invoke('publicar-instagram', { body: { id: item.id } })
      if (error || !data?.ok) throw new Error(data?.erro || 'falhou')
      avisar('Publicado no Instagram'); recarregar(); fechar()
    } catch (e) {
      avisar(`Não publicou: ${e.message}`); recarregar()
    } finally { setOcupado('') }
  }

  async function marcarPublicado() {
    await salvar({ status: 'publicado', publicado_em: new Date().toISOString() })
    avisar('Marcado como publicado'); recarregar(); fechar()
  }

  async function apagar() {
    if (!confirm('Apagar este carrossel?')) return
    await supabase.from('conteudo').delete().eq('id', item.id)
    recarregar(); fechar()
  }

  return (
    <section>
      <div className="p-cab">
        <div>
          <button className="p-voltar" onClick={fechar}>Carrosséis</button>
          <h1>{titulo || 'Sem título'}</h1>
          <p className="p-sub">{ESTADOS[item.status] || item.status}{item.agendado_para ? `, ${dataCurta(item.agendado_para)}` : ''}</p>
          {item.erro && <p className="p-erro">Último erro: {item.erro}</p>}
        </div>
      </div>

      <div className="p-previas">
        {slides.map((s, i) => <Slide key={i} slide={s} i={i} total={slides.length} onCanvas={(j, c) => { canvases.current[j] = c }} />)}
      </div>

      <div className="p-editor">
        <div className="p-editor-col">
          <label className="p-campo">Nome interno<input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
          <label className="p-campo">Legenda do post<textarea rows={7} value={legenda} onChange={(e) => setLegenda(e.target.value)} /></label>
          <div className="p-agenda">
            <label className="p-campo">Publicar em<input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} /></label>
            <button className="p-btn p-btn--forte" onClick={agendar} disabled={!!ocupado}>{ocupado === 'agendar' ? 'Gerando imagens…' : 'Agendar'}</button>
          </div>
          <div className="p-acoes">
            <button className="p-btn" onClick={salvarRascunho} disabled={!!ocupado}>Salvar rascunho</button>
            <button className="p-btn" onClick={baixar} disabled={!!ocupado}>{ocupado === 'baixar' ? 'Gerando…' : 'Baixar imagens'}</button>
            <button className="p-btn" onClick={publicarAgora} disabled={!!ocupado}>{ocupado === 'publicar' ? 'Publicando…' : 'Publicar agora'}</button>
            <button className="p-btn p-btn--fraco" onClick={marcarPublicado}>Postei à mão</button>
            <button className="p-btn p-btn--fraco" onClick={apagar}>Apagar</button>
          </div>
        </div>

        <ol className="p-slides-form">
          {slides.map((s, i) => (
            <li key={i}>
              <div className="p-slide-cab">
                <strong>Slide {i + 1}</strong>
                <select value={s.tipo} onChange={(e) => mudarSlide(i, 'tipo', e.target.value)}>
                  {Object.entries(TIPOS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                </select>
                <span className="p-slide-mover">
                  <button onClick={() => mover(i, -1)} aria-label="Subir slide" disabled={i === 0}>↑</button>
                  <button onClick={() => mover(i, 1)} aria-label="Descer slide" disabled={i === slides.length - 1}>↓</button>
                  <button onClick={() => remover(i)} aria-label="Remover slide" disabled={slides.length <= 2}>✕</button>
                </span>
              </div>
              <input value={s.titulo} onChange={(e) => mudarSlide(i, 'titulo', e.target.value)} placeholder="Título" />
              <textarea rows={3} value={s.texto || ''} onChange={(e) => mudarSlide(i, 'texto', e.target.value)} placeholder="Texto (opcional)" />
            </li>
          ))}
          <li className="p-slide-novo"><button className="p-btn" onClick={adicionar} disabled={slides.length >= 10}>Adicionar slide</button></li>
        </ol>
      </div>
    </section>
  )
}

// Conexão com o Instagram: o token vai direto para o banco (o painel nunca lê de volta)
function ConexaoInstagram() {
  const { avisar } = usePainel()
  const [st, setSt] = useState(null)
  const [form, setForm] = useState(null)
  const [teste, setTeste] = useState('')

  async function carregar() {
    const { data } = await supabase.rpc('instagram_status')
    setSt(data?.[0] || { conectado: false })
  }
  useEffect(() => { carregar() }, [])

  async function testar() {
    setTeste('Testando…')
    const { data, error } = await supabase.functions.invoke('publicar-instagram', { body: { verificar: true } })
    setTeste(error ? 'Não consegui falar com o servidor.' : data?.ok ? `Conectado como @${data.username}` : `Erro do Instagram: ${data?.erro}`)
  }

  async function salvar(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('salvar_instagram', { p_user_id: form.user_id, p_token: form.token })
    if (error) { avisar('Não salvou'); return }
    setForm(null); await carregar(); testar()
  }

  if (!st) return null
  return (
    <div className={`p-ig ${st.conectado ? '' : 'p-ig--off'}`}>
      {st.conectado ? (
        <p><strong>Instagram conectado.</strong> Os agendados saem sozinhos (checagem a cada 15 min). {teste && <span>{teste}</span>}</p>
      ) : (
        <p><strong>Instagram ainda não conectado.</strong> Até lá, use “Baixar imagens” e poste à mão.</p>
      )}
      <div className="p-acoes">
        {st.conectado && <button className="p-btn" onClick={testar}>Testar conexão</button>}
        <button className="p-btn" onClick={() => setForm(form ? null : { user_id: st.user_id || '', token: '' })}>{st.conectado ? 'Trocar token' : 'Conectar'}</button>
      </div>
      {form && (
        <form className="p-venda" onSubmit={salvar}>
          <label>ID da conta do Instagram<input required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="1784…" /></label>
          <label className="p-largo">Token de acesso<input required type="password" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="IGAA… ou EAA…" /></label>
          <div className="p-acoes"><button className="p-btn p-btn--forte">Salvar e testar</button></div>
        </form>
      )}
    </div>
  )
}

export default function Conteudo() {
  const { avisar } = usePainel()
  const [lista, setLista] = useState(null)
  const [aberto, setAberto] = useState(null)

  async function carregar() {
    const { data } = await supabase.from('conteudo').select('*').eq('formato', 'carrossel')
      .order('agendado_para', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [])

  async function novo() {
    const { data, error } = await supabase.from('conteudo').insert({ formato: 'carrossel', titulo: 'Novo carrossel', slides: NOVO, status: 'ideia' }).select().single()
    if (error) { avisar('Não criou'); return }
    await carregar(); setAberto(data)
  }

  const prontosParaAgendar = (lista || []).filter((c) => c.status === 'ideia' && c.agendado_para && new Date(c.agendado_para) > new Date())
  const [lote, setLote] = useState('')
  async function agendarTodos() {
    for (let k = 0; k < prontosParaAgendar.length; k++) {
      const c = prontosParaAgendar[k]
      setLote(`Gerando ${k + 1} de ${prontosParaAgendar.length}…`)
      try {
        const urls = await gerarESubir(c.id, c.slides)
        await supabase.from('conteudo').update({ imagens: urls, status: 'agendado', erro: null }).eq('id', c.id)
      } catch (e) { avisar(`Falhou em "${c.titulo}": ${e.message || 'erro'}`); break }
    }
    setLote(''); avisar('Carrosséis agendados'); carregar()
  }

  if (aberto) return <Editor item={aberto} fechar={() => setAberto(null)} recarregar={carregar} />
  if (lista === null) return <p className="p-vazio">Carregando…</p>

  const agendados = lista.filter((c) => c.status === 'agendado').length

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Carrosséis</h1>
          <p className="p-sub">{agendados} agendados. Edite o texto, escolha o dia e clique em Agendar: as imagens são geradas e o post sai sozinho no horário.</p>
        </div>
        <div className="p-acoes">
          {prontosParaAgendar.length > 0 && (
            <button className="p-btn p-btn--forte" onClick={agendarTodos} disabled={!!lote}>{lote || `Agendar os ${prontosParaAgendar.length} rascunhos`}</button>
          )}
          <button className="p-btn" onClick={novo}>Novo carrossel</button>
        </div>
      </div>
      <ConexaoInstagram />
      {lista.length === 0 ? (
        <div className="p-vazio"><p>Nenhum carrossel ainda.</p></div>
      ) : (
        <div className="p-carrosseis">
          {lista.map((c) => (
            <button key={c.id} className="p-carrossel" onClick={() => setAberto(c)}>
              {c.slides?.[0] && <Slide slide={c.slides[0]} i={0} total={c.slides.length} />}
              <span className="p-carrossel-info">
                <strong>{c.titulo}</strong>
                <small className={`p-estado p-estado--${c.status}`}>
                  {c.status === 'agendado' && new Date(c.agendado_para) < new Date(Date.now() - 6 * 3600 * 1000)
                    ? 'Passou do horário: abra e escolha outra data'
                    : <>{ESTADOS[c.status] || c.status}{c.agendado_para && c.status !== 'publicado' ? `, ${dataCurta(c.agendado_para)}` : ''}</>}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
