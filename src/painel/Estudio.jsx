import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { Editor, Slide, ConexaoInstagram, gerarESubir, NOVO, NOVO_ESTATICO } from './Conteudo'

// Programação de um canal de marca (Tavin Digital): carrosséis, estáticos e vídeos num quadro só.
// Rascunho → Pronto → Agendado → Publicado. Agendado sai sozinho no Instagram no horário.
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
  const fase = !v.video_url ? 'rascunho' : st === 'publicado' ? 'publicado' : ['agendado', 'processando', 'programado'].includes(st) ? 'agendado' : 'pronto'
  return { chave: `v-${v.id}`, origem: 'video', tipo: 'video', fase, titulo: v.titulo || v.yt_titulo || 'Vídeo', legenda: v.ig_legenda || '', quando: v.ig_agendado_para,
    publicado: v.ig_postado_em, erro: st === 'erro' ? v.ig_erro || 'erro' : '', bruto: v }
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

function Miniatura({ item }) {
  const c = item.bruto
  if (item.origem === 'video') {
    return c.capa_url ? <img src={c.capa_url} alt="" loading="lazy" />
      : c.video_url ? <video src={`${c.video_url}#t=0.5`} muted playsInline preload="metadata" />
        : <span className="e-mini-vazia">vídeo</span>
  }
  if (item.ideiaVideo) return <span className="e-mini-vazia">ideia de vídeo</span>
  if (c.imagens?.[0]) return <img src={c.imagens[0]} alt="" loading="lazy" />
  if (c.slides?.[0]) return <Slide slide={c.slides[0]} i={0} total={c.slides.length} />
  return <span className="e-mini-vazia">sem arte</span>
}

function Cartao({ item, abrir, arrastar, mover, arrastando }) {
  const [pode, setPode] = useState(true)
  return (
    <article className={`e-item e-item--${item.tipo} ${arrastando ? 'e-item--arrastando' : ''}`} draggable={pode}
      onPointerDown={(e) => setPode(!e.target.closest('input, textarea, select'))}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.chave); arrastar(item.chave) }}
      onDragEnd={() => arrastar(null)}>
      <button type="button" className="e-item-cab" onClick={() => abrir(item)}>
        <span className="e-mini"><Miniatura item={item} /></span>
        <span className="e-item-txt">
          <small><b className={`e-tipo e-tipo--${item.tipo}`}>{item.ideiaVideo ? 'Ideia de vídeo' : TIPOS[item.tipo]}</b></small>
          <strong>{item.titulo}</strong>
          {item.fase === 'agendado' && item.quando && <em className="e-quando">{fmtQuando(item.quando)}{item.bruto.ig_status === 'processando' || item.bruto.status === 'publicando' ? ' · publicando…' : ''}</em>}
          {item.fase === 'publicado' && item.publicado && <em className="e-quando e-quando--ok">no ar {fmtDia(item.publicado)}</em>}
          {item.fase !== 'agendado' && item.fase !== 'publicado' && item.quando && <em className="e-quando e-quando--plano">planejado {fmtQuando(item.quando)}</em>}
          {item.erro && <em className="e-erro">Erro: {item.erro}</em>}
        </span>
      </button>
      <select className="v-mover" value="" aria-label="Mover para outra coluna" onChange={(e) => e.target.value && mover(item.chave, e.target.value)}>
        <option value="">Mover para…</option>
        {FASES.filter(([k]) => k !== item.fase).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
      </select>
    </article>
  )
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
    if (v.video_url) await supabase.storage.from('videos').remove([`tavin-digital/${v.id}.mp4`]).catch(() => {})
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
        <div className="v-player">{v.video_url ? <video src={v.video_url} poster={v.capa_url || undefined} controls playsInline preload="metadata" /> : <div className="v-semvideo">Sem arquivo</div>}</div>
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

export default function Estudio({ canal = 'tavin-digital', nome = 'Tavin Digital' }) {
  const { avisar, versao } = usePainel()
  const [conteudo, setConteudo] = useState(null)
  const [videos, setVideos] = useState(null)
  const [aberto, setAberto] = useState(null)
  const [tipo, setTipo] = useState('')
  const [busca, setBusca] = useState('')
  const [verPublicados, setVerPublicados] = useState(false)
  const [visao, setVisao] = useState(() => { try { return localStorage.getItem('e-visao') || 'quadro' } catch { return 'quadro' } })
  const [arr, setArr] = useState(null)
  const [sobre, setSobre] = useState(null)
  const [ocupado, setOcupado] = useState('')
  const arquivo = useRef(null)
  useEffect(() => { try { localStorage.setItem('e-visao', visao) } catch { /* sem storage */ } }, [visao])

  async function carregar() {
    const [a, b] = await Promise.all([
      supabase.from('conteudo').select('*').order('agendado_para', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }),
      supabase.from('videos').select('*').eq('canal', canal).order('created_at', { ascending: true }),
    ])
    setConteudo(a.data || []); setVideos(b.data || [])
  }
  useEffect(() => { carregar() }, [versao])

  const itens = useMemo(() => [...(conteudo || []).map(doConteudo), ...(videos || []).map(doVideo)], [conteudo, videos])
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

  async function subir(file, { titulo, legenda = '', ideia } = {}) {
    if (file.size > 50 * 1024 * 1024) { avisar('O vídeo passa de 50 MB: exporte em 1080p H.264'); return }
    setOcupado('Subindo o vídeo…')
    const id = `td-${Date.now().toString(36)}`
    const caminho = `${canal}/${id}.mp4`
    const up = await supabase.storage.from('videos').upload(caminho, file, { contentType: 'video/mp4', upsert: true, cacheControl: '31536000' })
    if (up.error) { setOcupado(''); avisar(`Não subiu: ${up.error.message}`); return }
    const url = supabase.storage.from('videos').getPublicUrl(caminho).data.publicUrl
    const nomeArq = titulo || file.name.replace(/\.[^.]+$/, '')
    const { data, error } = await supabase.from('videos').insert({ id, canal, titulo: nomeArq, arquivo: `${nomeArq}.mp4`, video_url: url, ig_legenda: legenda }).select().single()
    if (!error && ideia) await supabase.from('conteudo').delete().eq('id', ideia)
    setOcupado('')
    if (error) { avisar('Subiu, mas não registrou'); return }
    avisar('Vídeo no painel'); await carregar(); setAberto(doVideo(data))
  }

  async function mover(chave, alvo) {
    const it = itens.find((i) => i.chave === chave)
    if (!it || it.fase === alvo) return
    const agora = new Date().toISOString()
    try {
      if (it.origem === 'video') {
        if (alvo === 'rascunho') { avisar('Vídeo com arquivo fica em Pronto'); return }
        const quando = it.quando && it.quando > agora ? it.quando : sugerir(it.chave)
        const d = alvo === 'pronto' ? { ig_status: 'pendente', ig_agendado_para: null, ig_erro: null }
          : alvo === 'agendado' ? { ig_status: 'agendado', ig_agendado_para: quando, ig_erro: null }
            : { ig_status: 'publicado', ig_postado_em: agora }
        const { error } = await supabase.from('videos').update(d).eq('id', it.bruto.id)
        if (error) throw error
        avisar(alvo === 'agendado' ? `Agendado: sai sozinho ${fmtQuando(quando)}` : alvo === 'publicado' ? 'Marcado como publicado' : 'Voltou para Pronto')
      } else {
        const c = it.bruto
        if (it.ideiaVideo && (alvo === 'agendado' || alvo === 'publicado')) { avisar('Suba o vídeo primeiro: abra a ideia e clique em Subir o vídeo'); return }
        if (alvo === 'agendado') {
          const minimo = c.formato === 'estatico' ? 1 : 2
          if ((c.slides?.length || 0) < minimo) { avisar('Faltam slides: abra e complete antes de agendar'); return }
          const quando = it.quando && it.quando > agora ? it.quando : sugerir(it.chave)
          setOcupado('Gerando as imagens…')
          const imagens = await gerarESubir(c.id, c.slides)
          const { error } = await supabase.from('conteudo').update({ imagens, status: 'agendado', agendado_para: quando, erro: null }).eq('id', c.id)
          setOcupado('')
          if (error) throw error
          avisar(`Agendado: sai sozinho ${fmtQuando(quando)}`)
        } else {
          const d = alvo === 'publicado' ? { status: 'publicado', publicado_em: agora } : { status: alvo === 'pronto' ? 'pronto' : 'ideia', erro: null }
          const { error } = await supabase.from('conteudo').update(d).eq('id', c.id)
          if (error) throw error
          avisar(alvo === 'publicado' ? 'Marcado como publicado' : `Movido para ${FASES.find(([k]) => k === alvo)[1]}`)
        }
      }
    } catch (e) { setOcupado(''); avisar(`Não moveu: ${e.message || 'erro'}`) }
    carregar()
  }

  // rascunhos de carrossel/estático que já têm data: gera as imagens e agenda todos de uma vez
  const comData = (conteudo || []).filter((c) => ['carrossel', 'estatico'].includes(c.formato) && ['ideia', 'pronto', 'erro'].includes(c.status)
    && c.agendado_para && new Date(c.agendado_para) > new Date() && c.slides?.length >= (c.formato === 'estatico' ? 1 : 2))
  async function agendarComData() {
    for (let k = 0; k < comData.length; k++) {
      const c = comData[k]
      setOcupado(`Gerando ${k + 1} de ${comData.length}…`)
      try {
        const imagens = await gerarESubir(c.id, c.slides)
        const { error } = await supabase.from('conteudo').update({ imagens, status: 'agendado', erro: null }).eq('id', c.id)
        if (error) throw error
      } catch (e) { avisar(`Falhou em "${c.titulo}": ${e.message || 'erro'}`); break }
    }
    setOcupado(''); avisar('Agendados'); carregar()
  }

  if (conteudo === null || videos === null) return <p className="p-vazio">Carregando…</p>
  if (aberto) {
    const fechar = () => setAberto(null)
    if (aberto.origem === 'video') return <EditorVideo key={aberto.chave} item={aberto} fechar={fechar} recarregar={carregar} sugerir={() => sugerir(aberto.chave)} />
    if (aberto.ideiaVideo) return <EditorIdeia item={aberto} fechar={fechar} recarregar={carregar} subir={subir} />
    return <Editor key={aberto.chave} item={aberto.bruto} fechar={fechar} recarregar={carregar} voltar={nome} />
  }

  const q = busca.trim().toLowerCase()
  const filtrados = itens.filter((i) => (!tipo || i.tipo === tipo) && (!q || `${i.titulo} ${i.legenda}`.toLowerCase().includes(q)))
  const conta = (t) => itens.filter((i) => i.fase !== 'publicado' && (!t || i.tipo === t)).length
  const agendados = itens.filter((i) => i.fase === 'agendado' && i.quando).sort((a, b) => a.quando.localeCompare(b.quando))
  const fila = agendados.at(-1)?.quando

  const col = Object.fromEntries(FASES.map(([k]) => [k, []]))
  for (const i of filtrados) col[i.fase].push(i)
  col.agendado.sort((a, b) => (a.quando || '').localeCompare(b.quando || ''))
  col.publicado.sort((a, b) => (b.publicado || '').localeCompare(a.publicado || ''))

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>{nome}</h1>
          <p className="p-sub">
            {col.agendado.length} agendados{fila ? ` (fila até ${fmtDia(fila)})` : ''} · {itens.filter((i) => i.fase === 'pronto').length} prontos · {itens.filter((i) => i.fase === 'rascunho').length} rascunhos
          </p>
        </div>
        <div className="p-acoes">
          {comData.length > 0 && <button className="p-btn p-btn--forte" onClick={agendarComData} disabled={!!ocupado}>{ocupado || `Agendar os ${comData.length} com data marcada`}</button>}
          <button className="p-btn" onClick={() => novo('carrossel')}>Novo carrossel</button>
          <button className="p-btn" onClick={() => novo('estatico')}>Novo estático</button>
          <button className="p-btn p-btn--forte" onClick={() => arquivo.current?.click()} disabled={!!ocupado}>{ocupado || 'Subir vídeo'}</button>
          <input ref={arquivo} type="file" accept="video/mp4,video/quicktime" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) subir(f) }} />
        </div>
      </div>

      <ConexaoInstagram />

      <div className="v-filtros e-filtros" role="toolbar" aria-label="Filtros">
        {[['', 'Tudo'], ['carrossel', 'Carrosséis'], ['estatico', 'Estáticos'], ['video', 'Vídeos']].map(([k, n]) => (
          <button key={k || 'tudo'} type="button" className={tipo === k ? 'on' : ''} aria-pressed={tipo === k} onClick={() => setTipo(k)}>{n} <small>{conta(k)}</small></button>
        ))}
        <input className="e-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar post" aria-label="Buscar post" />
        <span className="e-visao" role="group" aria-label="Visualização">
          <button type="button" className={visao === 'quadro' ? 'on' : ''} onClick={() => setVisao('quadro')}>Quadro</button>
          <button type="button" className={visao === 'agenda' ? 'on' : ''} onClick={() => setVisao('agenda')}>Agenda</button>
        </span>
        <label className="v-filtro-check"><input type="checkbox" checked={verPublicados} onChange={(e) => setVerPublicados(e.target.checked)} /> Mostrar publicados</label>
      </div>
      {ocupado && <p className="v-dica">{ocupado}</p>}

      {visao === 'agenda' ? (
        <Agenda itens={filtrados} abrir={setAberto} verPublicados={verPublicados} />
      ) : (
        <div className="v-pipe e-pipe">
          {FASES.map(([k, n, dica]) => {
            const recolhida = k === 'publicado' && !verPublicados
            return (
              <section key={k} className={`v-coluna e-coluna--${k} ${arr && sobre === k ? 'v-coluna--sobre' : ''}`} aria-label={n}
                onDragOver={(e) => { if (arr) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (sobre !== k) setSobre(k) } }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSobre((x) => (x === k ? null : x)) }}
                onDrop={(e) => { e.preventDefault(); const ch = arr || e.dataTransfer.getData('text/plain'); setArr(null); setSobre(null); if (ch) mover(ch, k) }}>
                <header><h2>{n} <span>{col[k].length}</span></h2><p>{dica}</p></header>
                {recolhida
                  ? col[k].length > 0 && <button className="p-btn p-btn--mini p-btn--fraco" onClick={() => setVerPublicados(true)}>Mostrar os {col[k].length} publicados</button>
                  : col[k].map((i) => <Cartao key={i.chave} item={i} abrir={setAberto} arrastar={(c) => { setArr(c); if (!c) setSobre(null) }} mover={mover} arrastando={arr === i.chave} />)}
                {!recolhida && col[k].length === 0 && <p className="v-vazia">{k === 'pronto' ? 'Nada pronto. Arraste um rascunho para cá quando revisar.' : k === 'agendado' ? 'Nada agendado. Arraste um post pronto para cá.' : 'Vazio.'}</p>}
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}

// Agenda: os próximos 21 dias, um por linha, com os dias livres à mostra
function Agenda({ itens, abrir, verPublicados }) {
  const hoje = diaSP(new Date().toISOString())
  const dias = []
  const d = new Date(`${hoje}T12:00:00Z`)
  if (verPublicados) d.setUTCDate(d.getUTCDate() - 14)
  const total = verPublicados ? 35 : 21
  for (let k = 0; k < total; k++) { dias.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1) }
  const porDia = {}
  for (const i of itens) {
    const ref = i.fase === 'publicado' ? i.publicado : i.quando
    if (!ref || (i.fase === 'publicado' && !verPublicados)) continue
    ;(porDia[diaSP(ref)] ||= []).push(i)
  }
  const semData = itens.filter((i) => !i.quando && i.fase !== 'publicado')
  return (
    <div className="e-agenda">
      <ol>
        {dias.map((dia) => {
          const lista = (porDia[dia] || []).sort((a, b) => (a.quando || a.publicado || '').localeCompare(b.quando || b.publicado || ''))
          const dt = new Date(`${dia}T15:00:00Z`)
          return (
            <li key={dia} className={`${dia === hoje ? 'hoje' : ''} ${lista.length ? '' : 'livre'}`}>
              <span className="e-dia">{dt.toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
              <div className="e-dia-itens">
                {lista.length === 0 ? <span className="e-livre">livre</span> : lista.map((i) => (
                  <button key={i.chave} type="button" className={`e-ag e-ag--${i.fase}`} onClick={() => abrir(i)}>
                    <b className={`e-tipo e-tipo--${i.tipo}`}>{TIPOS[i.tipo]}</b>
                    <span>{fmtHora(i.fase === 'publicado' ? i.publicado : i.quando)} · {i.titulo}</span>
                    <small>{i.fase === 'agendado' ? 'agendado' : i.fase === 'publicado' ? 'no ar' : `${FASES.find(([k]) => k === i.fase)[1].toLowerCase()} (ainda não agendado)`}</small>
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ol>
      {semData.length > 0 && (
        <div className="e-semdata">
          <h3>Sem data ({semData.length})</h3>
          <div className="e-dia-itens">
            {semData.map((i) => (
              <button key={i.chave} type="button" className={`e-ag e-ag--${i.fase}`} onClick={() => abrir(i)}>
                <b className={`e-tipo e-tipo--${i.tipo}`}>{i.ideiaVideo ? 'Ideia' : TIPOS[i.tipo]}</b><span>{i.titulo}</span><small>{FASES.find(([k]) => k === i.fase)[1].toLowerCase()}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
