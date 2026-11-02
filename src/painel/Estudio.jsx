import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { Editor, Slide, gerarESubir, NOVO, NOVO_ESTATICO } from './Conteudo'
import Pipeline, { useConexoes } from './Pipeline'
import { CANAIS } from './canais'

// Programação de um canal de marca (Tavin Digital): carrosséis, estáticos e vídeos num quadro só.
// Pronto → Agendado → Publicado. Agendado sai sozinho no Instagram no horário.
// Rascunho continua existindo no banco, mas aparece na coluna Pronto (não tem mais coluna própria).
const FUSO = 'America/Sao_Paulo'
const HORA_PADRAO = 12 // horário do post quando você arrasta sem escolher data
const TIPOS = { carrossel: 'Carrossel', estatico: 'Estático', video: 'Vídeo' }
const FASES = [
  ['rascunho', 'Rascunho', 'Ideias e posts em edição.'],
  ['pronto', 'Pronto', 'Revisado. Arraste para Agendado.'],
  ['agendado', 'Agendado', 'Sai sozinho no Instagram no horário.'],
  ['publicado', 'Publicado', 'Já está no ar.'],
]
const fmtDia = (iso) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
const fmtQuando = (iso) => (iso ? `${fmtDia(iso)} ${fmtHora(iso)}` : '')
const diaSP = (iso) => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 10)
const paraLocal = (iso) => (iso ? new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16) : '')
const deLocal = (v) => (v ? new Date(`${v}:00-03:00`).toISOString() : null)

// Junta as duas tabelas num formato só
function doConteudo(c) {
  const tipo = c.formato === 'estatico' ? 'estatico' : c.formato === 'reel' ? 'video' : 'carrossel'
  const fase = c.status === 'publicado' ? 'publicado' : ['agendado', 'publicando'].includes(c.status) ? 'agendado'
    : c.status === 'pronto' || c.status === 'erro' ? 'pronto' : 'rascunho'
  return { chave: `c-${c.id}`, origem: 'conteudo', tipo, fase, titulo: c.titulo || 'Sem título', legenda: c.legenda || '', quando: c.agendado_para,
    publicado: c.publicado_em, erro: c.status === 'erro' ? c.erro : '', ideiaVideo: c.formato === 'reel', bruto: c }
}
function doVideo(v) {
  const st = v.ig_status
  // no ar no Insta ou no YouTube = Publicado (o servidor confere sozinho a cada 10 min)
  const noAr = st === 'publicado' || v.yt_status === 'postado' || v.tt_status === 'postado'
  const fase = !v.video_url ? 'rascunho' : noAr ? 'publicado' : ['agendado', 'processando', 'programado'].includes(st) ? 'agendado' : 'pronto'
  return { chave: `v-${v.id}`, origem: 'video', tipo: 'video', fase, titulo: v.titulo || v.yt_titulo || 'Vídeo', legenda: v.ig_legenda || '', quando: v.ig_agendado_para,
    publicado: v.ig_postado_em || v.yt_postado_em || v.tt_postado_em, erro: st === 'erro' ? v.ig_erro || 'erro' : '', bruto: v }
}

// Próximo dia livre no horário padrão (não empilha dois posts no mesmo dia)
function proximoHorario(itens, ignorar) {
  const ocupados = new Set(itens.filter((i) => i.fase === 'agendado' && i.quando && i.chave !== ignorar).map((i) => diaSP(i.quando)))
  const d = new Date(Date.now() - 3 * 3600000) // "agora" em São Paulo
  if (d.getUTCHours() >= HORA_PADRAO - 1) d.setUTCDate(d.getUTCDate() + 1)
  for (let k = 0; k < 60; k++) {
    const dia = d.toISOString().slice(0, 10)
    if (!ocupados.has(dia)) return new Date(`${dia}T${String(HORA_PADRAO).padStart(2, '0')}:00:00-03:00`).toISOString()
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return new Date(Date.now() + 86400000).toISOString()
}


// Vídeo: player, legenda, data e publicação
function EditorVideo({ item, fechar, recarregar, sugerir }) {
  const { avisar } = usePainel()
  const v = item.bruto
  const [titulo, setTitulo] = useState(item.titulo)
  const [legenda, setLegenda] = useState(item.legenda)
  const [quando, setQuando] = useState(paraLocal(item.quando || sugerir()))
  const [ocupado, setOcupado] = useState('')
  const salvar = async (extra = {}, ok) => {
    const { error } = await supabase.from('videos').update({ titulo, ig_legenda: legenda, ...extra }).eq('id', v.id)
    if (error) { avisar('Não salvou'); return false }
    if (ok) avisar(ok)
    recarregar(); return true
  }
  async function agendar() {
    if (!quando) { avisar('Escolha o dia e a hora'); return }
    if (await salvar({ ig_status: 'agendado', ig_agendado_para: deLocal(quando), ig_erro: null }, `Agendado: sai sozinho ${fmtQuando(deLocal(quando))}`)) fechar()
  }
  async function publicarAgora() {
    setOcupado('pub')
    await salvar()
    const { data, error } = await supabase.functions.invoke('publicar-reels', { body: { id: v.id } })
    setOcupado('')
    avisar(error ? 'Não consegui falar com o servidor' : data?.ok ? (data.publicado ? 'Publicado no Instagram' : data.aviso) : `Erro: ${data?.erro}`)
    recarregar()
  }
  async function apagar() {
    if (!confirm('Apagar este vídeo do painel?')) return
    await supabase.from('videos').delete().eq('id', v.id)
    if (v.video_url) await supabase.storage.from('videos').remove([`${v.canal || 'tavin-digital'}/${v.id}.mp4`, `${v.canal || 'tavin-digital'}/${v.id}.jpg`]).catch(() => {})
    recarregar(); fechar()
  }
  const baixar = v.video_url ? `${v.video_url}?download=${encodeURIComponent(v.arquivo || `${v.id}.mp4`)}` : null
  return (
    <section className="v-detalhe">
      <div className="p-cab">
        <div>
          <button className="p-voltar" onClick={fechar}>Tavin Digital</button>
          <h1>{titulo}</h1>
          <p className="p-sub">Vídeo · {item.fase === 'agendado' ? `agendado ${fmtQuando(item.quando)}` : FASES.find(([k]) => k === item.fase)[1]}</p>
          {item.erro && <p className="p-erro">Último erro: {item.erro}</p>}
        </div>
        <div className="p-acoes">{baixar && <a className="p-btn p-btn--forte" href={baixar}>Baixar vídeo</a>}</div>
      </div>
      <div className="v-grade">
        <div className="v-player">{v.video_url ? <video src={v.video_url} poster={v.capa_url || undefined} controls autoPlay playsInline preload="auto" /> : <div className="v-semvideo">Sem arquivo</div>}</div>
        <div className="p-editor-col">
          <label className="p-campo">Nome interno<input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
          <label className="p-campo">Legenda do Reel <span className="v-cont">{legenda.length}/2200</span>
            <textarea rows={8} value={legenda} maxLength={2200} onChange={(e) => setLegenda(e.target.value)} />
          </label>
          {v.notas && <p className="v-dica">{v.notas}</p>}
          <div className="p-agenda">
            <label className="p-campo">Publicar em<input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} /></label>
            <button className="p-btn p-btn--forte" onClick={agendar} disabled={!v.video_url}>{item.fase === 'agendado' ? 'Mudar horário' : 'Agendar'}</button>
          </div>
          <div className="p-acoes">
            <button className="p-btn" onClick={() => salvar({}, 'Salvo')}>Salvar</button>
            <button className="p-btn" onClick={async () => { try { await navigator.clipboard.writeText(legenda); avisar('Legenda copiada') } catch { avisar('Não consegui copiar') } }}>Copiar legenda</button>
            {item.fase !== 'publicado' && v.video_url && <button className="p-btn" onClick={publicarAgora} disabled={!!ocupado}>{ocupado ? 'Publicando… (até 1 min)' : 'Publicar agora'}</button>}
            {item.fase === 'agendado' && <button className="p-btn p-btn--fraco" onClick={() => salvar({ ig_status: 'pendente', ig_agendado_para: null }, 'Desagendado').then((ok) => ok && fechar())}>Desagendar</button>}
            {item.fase !== 'publicado' && <button className="p-btn p-btn--fraco" onClick={() => salvar({ ig_status: 'publicado', ig_postado_em: new Date().toISOString() }, 'Marcado como publicado').then((ok) => ok && fechar())}>Postei à mão</button>}
            <button className="p-btn p-btn--fraco" onClick={apagar}>Apagar</button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Ideia de vídeo (ainda sem arquivo): texto + subir o arquivo quando ficar pronto
function EditorIdeia({ item, fechar, recarregar, subir }) {
  const { avisar } = usePainel()
  const c = item.bruto
  const [titulo, setTitulo] = useState(item.titulo)
  const [notas, setNotas] = useState(item.legenda)
  const salvar = async () => { await supabase.from('conteudo').update({ titulo, legenda: notas }).eq('id', c.id); avisar('Salvo'); recarregar() }
  return (
    <section>
      <div className="p-cab"><div><button className="p-voltar" onClick={fechar}>Tavin Digital</button><h1>{titulo}</h1><p className="p-sub">Ideia de vídeo · sem arquivo ainda</p></div></div>
      <div className="p-editor-col e-ideia">
        <label className="p-campo">Nome<input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
        <label className="p-campo">Roteiro / legenda<textarea rows={8} value={notas} onChange={(e) => setNotas(e.target.value)} /></label>
        <div className="p-acoes">
          <button className="p-btn" onClick={salvar}>Salvar</button>
          <label className="p-btn p-btn--forte e-subir">Subir o vídeo (.mp4)
            <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => e.target.files?.[0] && subir(e.target.files[0], { titulo, legenda: notas, ideia: c.id })} />
          </label>
          <button className="p-btn p-btn--fraco" onClick={async () => { if (!confirm('Apagar esta ideia?')) return; await supabase.from('conteudo').delete().eq('id', c.id); recarregar(); fechar() }}>Apagar</button>
        </div>
      </div>
    </section>
  )
}


// Colunas do quadro (as de antes, sem Rascunho)
const COLUNAS = [
  { k: 'pronto', nome: 'Pronto', cor: '#B600F6', papel: 'fila' },
  { k: 'agendado', nome: 'Agendado', cor: '#6E56CF', papel: 'programado' },
  { k: 'publicado', nome: 'Publicado', cor: '#1E9E5A', papel: 'postado' },
]
const FASE_PIPE = { rascunho: 'pronto', pronto: 'pronto', agendado: 'agendado', publicado: 'publicado' }
function paraItem(i) {
  const c = i.bruto
  const video = i.origem === 'video'
  const minimo = c.formato === 'estatico' ? 1 : 2
  const faltaSlide = !video && !i.ideiaVideo && (c.slides?.length || 0) < minimo
  const agendado = i.fase === 'agendado'
  return {
    chave: i.chave, bruto: i, fase: FASE_PIPE[i.fase], titulo: i.titulo,
    tipo: i.tipo, tipoNome: i.ideiaVideo ? 'Ideia' : TIPOS[i.tipo],
    video_url: video ? c.video_url : null, capa_url: video ? c.capa_url : null,
    baixar: video && c.video_url ? `${c.video_url}?download=${encodeURIComponent(c.arquivo || `${c.id}.mp4`)}` : null,
    mini: i.ideiaVideo ? <span className="pl-mini-vazia">ideia</span> : c.imagens?.[0] ? <img src={c.imagens[0]} alt="" loading="lazy" /> : c.slides?.[0] ? <Slide slide={c.slides[0]} i={0} total={c.slides.length} /> : null,
    quando: agendado ? i.quando : null,
    planejado: !agendado && i.fase !== 'publicado' && i.quando ? i.quando : null,
    postado: i.publicado, erro: i.erro,
    publicando: c.ig_status === 'processando' || c.status === 'publicando',
    aviso: i.ideiaVideo ? 'Falta o vídeo' : faltaSlide ? 'Faltam slides' : '',
    programavel: (i.fase === 'pronto' || i.fase === 'rascunho') && !i.ideiaVideo && !faltaSlide && (!video || !!c.video_url),
    movel: !i.ideiaVideo,
    ordem: c.created_at || '',
  }
}

// "Novo post": carrossel ou estático (só na Tavin Digital)
function NovoPost({ novo }) {
  const ref = useRef(null)
  const escolher = (f) => { ref.current?.removeAttribute('open'); novo(f) }
  // fecha ao clicar fora
  useEffect(() => {
    const fora = (e) => { if (ref.current?.open && !ref.current.contains(e.target)) ref.current.removeAttribute('open') }
    document.addEventListener('click', fora)
    return () => document.removeEventListener('click', fora)
  }, [])
  return (
    <details className="pl-menu" ref={ref}>
      <summary className="p-btn">Novo post</summary>
      <div className="pl-menu-lista">
        <button type="button" onClick={() => escolher('carrossel')}>Carrossel</button>
        <button type="button" onClick={() => escolher('estatico')}>Estático</button>
      </div>
    </details>
  )
}

export default function Estudio({ canal = 'tavin-digital', nome = 'Tavin Digital' }) {
  const { avisar, versao } = usePainel()
  const [conteudo, setConteudo] = useState(null)
  const [videos, setVideos] = useState(null)
  const [aberto, setAberto] = useState(null)
  const [ocupado, setOcupado] = useState('')
  const info = CANAIS.find((c) => c.id === canal) || { id: canal, nome, cor: '#B600F6', sigla: 'TD', tipo: 'marca' }
  const cx = useConexoes(canal, true)

  async function carregar() {
    const [a, b] = await Promise.all([
      supabase.from('conteudo').select('*').order('agendado_para', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }),
      supabase.from('videos').select('*').eq('canal', canal).order('created_at', { ascending: true }),
    ])
    setConteudo(a.data || []); setVideos(b.data || [])
  }
  useEffect(() => { carregar() }, [versao])

  const itens = useMemo(() => [...(conteudo || []).map(doConteudo), ...(videos || []).map(doVideo)], [conteudo, videos])
  const cartoes = useMemo(() => itens.map(paraItem), [itens])
  const sugerir = (ignorar) => proximoHorario(itens, ignorar)

  // reabre o item com os dados novos depois de salvar
  useEffect(() => { if (aberto) { const n = itens.find((i) => i.chave === aberto.chave); if (n && n !== aberto) setAberto(n) } }, [itens])

  async function novo(formato) {
    const ultimo = (conteudo || []).filter((c) => c.formato === formato).at(-1)
    const fundo = ultimo?.slides?.[0]?.fundo === 'claro' ? 'escuro' : 'claro'
    const base = formato === 'estatico' ? NOVO_ESTATICO : NOVO
    const slides = base.map((s, k) => (k === 0 ? { ...s, fundo } : s))
    const { data, error } = await supabase.from('conteudo').insert({ formato, titulo: formato === 'estatico' ? 'Novo estático' : 'Novo carrossel', slides, status: 'ideia' }).select().single()
    if (error) { avisar('Não criou'); return }
    await carregar(); setAberto(doConteudo(data))
  }

  // Sobe o vídeo (e a capa, se veio) para o bucket "videos" em canal/id.mp4 e registra em Prontos.
  // Vindo de uma ideia (EditorIdeia), apaga a ideia e abre o vídeo.
  async function subir(file, { titulo, legenda = '', ideia, capa = null, duracao = null } = {}) {
    if (file.size > 50 * 1024 * 1024) { avisar('O vídeo passa de 50 MB: exporte em 1080p H.264'); return false }
    if (ideia) setOcupado('Subindo o vídeo…')
    const id = `td-${Date.now().toString(36)}`
    const pasta = supabase.storage.from('videos')
    const caminho = `${canal}/${id}.mp4`
    const up = await pasta.upload(caminho, file, { contentType: 'video/mp4', upsert: true, cacheControl: '31536000' })
    if (up.error) { setOcupado(''); avisar(`Não subiu: ${up.error.message}`); return false }
    let capaUrl = null
    if (capa) {
      const c = await pasta.upload(`${canal}/${id}.jpg`, capa, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
      if (!c.error) capaUrl = pasta.getPublicUrl(`${canal}/${id}.jpg`).data.publicUrl
    }
    const url = pasta.getPublicUrl(caminho).data.publicUrl
    const nomeArq = titulo || file.name.replace(/\.[^.]+$/, '')
    const { data, error } = await supabase.from('videos').insert({ id, canal, titulo: nomeArq, arquivo: `${nomeArq}.mp4`, video_url: url, capa_url: capaUrl, duracao, ig_legenda: legenda }).select().single()
    if (!error && ideia) await supabase.from('conteudo').delete().eq('id', ideia)
    setOcupado('')
    if (error) { avisar('Subiu, mas não registrou'); return false }
    avisar('Vídeo em Pronto'); await carregar()
    if (ideia) setAberto(doVideo(data))
    return true
  }

  // Agenda um item num horário: vídeo vai para a fila do Instagram; carrossel/estático gera as imagens antes
  async function agendar(it, quando) {
    if (it.origem === 'video') {
      const { error } = await supabase.from('videos').update({ ig_status: 'agendado', ig_agendado_para: quando, ig_erro: null }).eq('id', it.bruto.id)
      if (error) throw error
      return
    }
    const c = it.bruto
    const imagens = await gerarESubir(c.id, c.slides)
    const { error } = await supabase.from('conteudo').update({ imagens, status: 'agendado', agendado_para: quando, erro: null }).eq('id', c.id)
    if (error) throw error
  }

  async function mover(cartao, alvo) {
    const it = cartao.bruto
    const agora = new Date().toISOString()
    try {
      if (alvo === 'agendado') {
        if (it.ideiaVideo) { avisar('Suba o vídeo primeiro: abra a ideia e clique em Subir o vídeo'); return }
        if (it.origem !== 'video') {
          const minimo = it.bruto.formato === 'estatico' ? 1 : 2
          if ((it.bruto.slides?.length || 0) < minimo) { avisar('Faltam slides: abra e complete antes de programar'); return }
          setOcupado('Gerando as imagens…')
        }
        const quando = it.quando && it.quando > agora ? it.quando : sugerir(it.chave)
        await agendar(it, quando)
        setOcupado('')
        avisar(`Agendado: sai sozinho ${fmtQuando(quando)}`)
      } else if (it.origem === 'video') {
        const d = alvo === 'pronto' ? { ig_status: 'pendente', ig_agendado_para: null, ig_erro: null } : { ig_status: 'publicado', ig_postado_em: agora }
        const { error } = await supabase.from('videos').update(d).eq('id', it.bruto.id)
        if (error) throw error
        avisar(alvo === 'publicado' ? 'Marcado como publicado' : 'Voltou para Pronto')
      } else {
        if (it.ideiaVideo && alvo === 'publicado') { avisar('Suba o vídeo primeiro'); return }
        // voltar para Pronto mantém o rascunho como rascunho
        const d = alvo === 'publicado' ? { status: 'publicado', publicado_em: agora } : { status: it.fase === 'rascunho' ? 'ideia' : 'pronto', erro: null }
        const { error } = await supabase.from('conteudo').update(d).eq('id', it.bruto.id)
        if (error) throw error
        avisar(alvo === 'publicado' ? 'Marcado como publicado' : 'Voltou para Pronto')
      }
    } catch (e) { setOcupado(''); avisar(`Não moveu: ${e.message || 'erro'}`) }
    await carregar()
  }

  // Programar tudo: um horário para cada post escolhido, na ordem
  async function programar(lote, progresso) {
    let ok = 0
    for (let k = 0; k < lote.length; k++) {
      const { item, quando } = lote[k]
      progresso?.(k + 1, lote.length)
      try { await agendar(item.bruto, quando); ok++ } catch (e) { avisar(`Falhou em "${item.titulo}": ${e.message || 'erro'}`); break }
    }
    if (ok) avisar(ok === lote.length ? `${ok} agendados` : `${ok} de ${lote.length} agendados`)
    await carregar()
  }

  if (conteudo === null || videos === null) return <p className="p-vazio">Carregando…</p>
  if (aberto) {
    const fechar = () => setAberto(null)
    if (aberto.origem === 'video') return <EditorVideo key={aberto.chave} item={aberto} fechar={fechar} recarregar={carregar} sugerir={() => sugerir(aberto.chave)} />
    if (aberto.ideiaVideo) return <EditorIdeia item={aberto} fechar={fechar} recarregar={carregar} subir={subir} />
    return <Editor key={aberto.chave} item={aberto.bruto} fechar={fechar} recarregar={carregar} voltar={nome} />
  }

  return (
    <Pipeline canal={info} fases={COLUNAS} itens={cartoes} mover={mover} programar={programar} subir={subir} abrir={(c) => c && setAberto(c.bruto)}
      cx={cx} recarregar={carregar} marca extra={<NovoPost novo={novo} />} ocupado={ocupado} />
  )
}
