import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import Pipeline, { Janela, fmtQuando, fmtCurto, useConexoes } from './Pipeline'
import { CANAIS } from './canais'

// Canais de vídeo longo do YouTube (Ten Thousand Runs, Last State Standing, Quanto Você Dura?…).
// Quadro: Criação → Criado → Rascunho → Revisão → Upload feito → Programado → Publicado (coluna `yt_etapa` em `videos`).
// "Perfil do canal" mostra nome, @, assunto, descrição, palavras-chave, logo e banner para baixar.
const FASES = [
  { k: 'criacao', nome: 'Criação', cor: '#8E8499', papel: 'fila' },
  { k: 'criado', nome: 'Criado', cor: '#B600F6', papel: 'fila' },
  { k: 'rascunho', nome: 'Rascunho', cor: '#3A7BD5', papel: 'fila' },
  { k: 'revisao', nome: 'Revisão', cor: '#E08A00', papel: 'fila' },
  { k: 'upload', nome: 'Upload feito', cor: '#D64545', papel: 'fila' },
  { k: 'programado', nome: 'Programado', cor: '#6E56CF', papel: 'programado' },
  { k: 'publicado', nome: 'Publicado', cor: '#1E9E5A', papel: 'postado' },
]
const NOME_FASE = Object.fromEntries(FASES.map((f) => [f.k, f.nome]))

const num = (v) => `#${String(v.numero ?? 0).padStart(3, '0')}`
const minutos = (s) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}` : '')
const nomeArq = (t, ext) => `${String(t || 'arquivo').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 95)}${ext}`
const comDownload = (url, nome) => (url ? `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(nome)}` : null)
// datetime-local <-> ISO no fuso de São Paulo (UTC-3)
const paraLocal = (iso) => (iso ? new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16) : '')
const deLocal = (v) => (v ? new Date(`${v}:00-03:00`).toISOString() : null)

// Etapa do vídeo: a marcada no painel; o que o YouTube já confirmou (programado/publicado) passa na frente
function etapa(v) {
  if (v.yt_postado_em || v.yt_status === 'postado') return 'publicado'
  const e = v.yt_etapa || (v.video_url ? 'criado' : 'criacao')
  if ((v.yt_status === 'programado' || v.yt_status === 'agendado') && FASES.findIndex((f) => f.k === e) < 5) return 'programado'
  return e
}

function Copiar({ texto, rotulo = 'Copiar' }) {
  const { avisar } = usePainel()
  const [ok, setOk] = useState(false)
  async function copiar(e) {
    e?.preventDefault(); e?.stopPropagation()
    try { await navigator.clipboard.writeText(texto || ''); setOk(true); setTimeout(() => setOk(false), 1500) } catch { avisar('Não consegui copiar') }
  }
  return <button type="button" className={`p-btn p-btn--mini v-copiar ${ok ? 'ok' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={copiar}><span className="v-copiar-rot">{rotulo}</span><span className="v-copiar-ok">Copiado ✓</span></button>
}

function Bloco({ titulo, texto, linhas = 3 }) {
  if (!texto) return null
  return (
    <div className="v-bloco">
      <div className="v-bloco-cab"><span>{titulo}</span><Copiar texto={texto} /></div>
      <p className="v-texto" style={{ maxHeight: `${linhas * 1.45 + 0.2}em` }}>{texto}</p>
    </div>
  )
}

// Perfil do canal: tudo o que vai no YouTube Studio → Personalização, com os arquivos para baixar
export function PerfilCanal({ c, fechar }) {
  const p = c.perfil || {}
  const abs = (u) => (u && u.startsWith('/') ? `${window.location.origin}${u}` : u)
  return (
    <Janela titulo={`Perfil do canal · ${c.nome}`} sub="YouTube Studio → Personalização: copie cada campo e suba o logo e o banner" fechar={fechar} larga>
      <div className="yl-perfil">
        {c.banner && <img className="yl-banner" src={c.banner} alt={`Banner do ${c.nome}`} />}
        <div className="yl-perfil-topo">
          {c.logo && <img className="yl-logo" src={c.logo} alt={`Logo do ${c.nome}`} />}
          <div>
            <h3>{c.nome}</h3>
            <p className="p-sub">{[p.handle, p.idioma, p.pais, p.categoria].filter(Boolean).join(' · ')}</p>
            <div className="p-acoes">
              {c.logo && <a className="p-btn p-btn--mini" href={abs(c.logo)} download={`${c.id}-logo.png`}>Baixar logo (800×800)</a>}
              {c.banner && <a className="p-btn p-btn--mini" href={abs(c.banner)} download={`${c.id}-banner.jpg`}>Baixar banner (2560×1440)</a>}
            </div>
          </div>
        </div>
        <Bloco titulo="Nome do canal" texto={c.nome} linhas={1} />
        <Bloco titulo="Identificador (@)" texto={p.handle} linhas={1} />
        <Bloco titulo="Descrição do canal" texto={p.descricao} linhas={7} />
        <Bloco titulo="Palavras-chave do canal" texto={p.palavras} linhas={2} />
        <Bloco titulo="Assunto (para nós)" texto={p.assunto} linhas={3} />
        <p className="v-dica">Criar como canal de marca · verificar o telefone (libera vídeo longo, thumbnail própria e "Testar e comparar") · país: {p.pais || '—'} · categoria: {p.categoria || '—'}.</p>
      </div>
    </Janela>
  )
}

function Detalhe({ v, c, fechar, recarregar, mover, vizinhos }) {
  const { avisar } = usePainel()
  const [nota, setNota] = useState(v.notas || '')
  const [quando, setQuando] = useState(paraLocal(v.yt_programado_para || v.publicar_em))
  const e = etapa(v)
  const titulo = v.yt_titulo || v.titulo
  const salvar = async (dados, ok) => {
    const { error } = await supabase.from('videos').update(dados).eq('id', v.id)
    avisar(error ? 'Não salvou' : ok); recarregar()
  }
  const capas = Array.isArray(v.capas) && v.capas.length ? v.capas : v.capa_url ? [{ url: v.capa_url, nome: 'Capa' }] : []
  const titulos = Array.isArray(v.yt_titulos) ? v.yt_titulos : []
  return (
    <section className="v-detalhe">
      <div className="p-cab">
        <div>
          <button className="p-voltar" onClick={fechar}>{c.nome}</button>
          <h1>{num(v)} {titulo}</h1>
          <p className="p-sub">{NOME_FASE[e]}{v.duracao ? ` · ${minutos(v.duracao)}` : ''}{v.yt_programado_para ? ` · programado para ${fmtQuando(v.yt_programado_para)}` : ''}</p>
          <div className="v-etapas" role="group" aria-label="Mudar de etapa">
            {FASES.map((f) => (
              <button key={f.k} type="button" className={e === f.k ? 'on' : ''} aria-pressed={e === f.k} style={{ '--c': f.cor }} disabled={e === f.k}
                onClick={() => mover({ bruto: v }, f.k)}>{f.nome}</button>
            ))}
          </div>
        </div>
        <div className="p-acoes">
          {vizinhos?.anterior && <button className="p-btn p-btn--fraco" onClick={vizinhos.anterior} aria-label="Vídeo anterior">‹</button>}
          {vizinhos?.proximo && <button className="p-btn p-btn--fraco" onClick={vizinhos.proximo} aria-label="Próximo vídeo">›</button>}
          {v.video_url && <a className="p-btn p-btn--forte" href={comDownload(v.video_url, nomeArq(titulo, '.mp4'))}>Baixar vídeo</a>}
          <a className="p-btn" href="https://studio.youtube.com" target="_blank" rel="noreferrer">Abrir YouTube Studio</a>
        </div>
      </div>

      <div className="v-grade v-grade--longo">
        <div className="v-player v-player--longo">
          {v.video_url ? <video src={v.video_url} poster={capas[0]?.url} controls playsInline preload="metadata" /> : <div className="v-semvideo">Vídeo ainda em produção…</div>}
          {capas.length > 0 && (
            <div className="yl-capas">
              <strong>Thumbnails {capas.length > 1 ? '(suba todas no "Testar e comparar": até 3)' : ''}</strong>
              <div className="yl-capas-lista">
                {capas.map((cp, k) => (
                  <figure key={cp.url}>
                    <img src={cp.url} alt={`Thumbnail ${k + 1}`} loading="lazy" />
                    <figcaption>{cp.nome || `Opção ${String.fromCharCode(65 + k)}`}<a className="p-btn p-btn--mini" href={comDownload(cp.url, `${v.id}-thumb-${String.fromCharCode(97 + k)}.jpg`)}>Baixar</a></figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="v-plataformas">
          <article className="v-plat">
            <header><h2>YouTube</h2></header>
            <Bloco titulo="Título" texto={titulo} linhas={2} />
            {titulos.length > 1 && <Bloco titulo='Títulos para o "Testar e comparar"' texto={titulos.join('\n')} linhas={3} />}
            <Bloco titulo="Descrição (com capítulos e fontes)" texto={v.yt_descricao} linhas={8} />
            <Bloco titulo="Tags (campo Tags, em Mostrar mais)" texto={v.yt_tags} linhas={2} />
            <Bloco titulo="Comentário para fixar" texto={v.comentario_fixado} linhas={2} />
            <p className="v-dica">No upload: não é para crianças · Conteúdo alterado ou sintético: Não (dados reais; só a voz é sintética) · Categoria: {c.perfil?.categoria || 'Educação'}.</p>
            <label className="v-quando">Programar para
              <input type="datetime-local" value={quando} onChange={(ev) => setQuando(ev.target.value)} />
            </label>
            <div className="p-acoes">
              <button className="p-btn p-btn--mini p-btn--forte" disabled={!quando} onClick={() => salvar({ yt_etapa: 'programado', yt_programado_para: deLocal(quando) }, `Programado para ${fmtQuando(deLocal(quando))}`)}>Programei no Studio</button>
              <button className="p-btn p-btn--mini" onClick={() => salvar({ yt_etapa: 'publicado', yt_postado_em: v.yt_postado_em || new Date().toISOString() }, 'Marcado como publicado')}>Já publiquei</button>
            </div>
          </article>
          <article className="v-plat">
            <header><h2>Notas</h2></header>
            <label className="p-campo">O que mudar, o que foi revisado
              <textarea rows={4} value={nota} onChange={(ev) => setNota(ev.target.value)} />
            </label>
            {nota !== (v.notas || '') && <button className="p-btn p-btn--mini" onClick={() => salvar({ notas: nota }, 'Nota salva')}>Salvar nota</button>}
          </article>
          {v.fontes?.length > 0 && (
            <details className="v-fontes"><summary>Fontes dos fatos</summary>
              <ul>{v.fontes.map((f) => <li key={f}>{/^https?:/.test(f) ? <a href={f} target="_blank" rel="noreferrer">{f.replace(/^https?:\/\//, '')}</a> : f}</li>)}</ul>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}

function paraItem(v) {
  const e = etapa(v)
  return {
    chave: v.id, bruto: v, fase: e, tipo: 'longo',
    titulo: v.yt_titulo || v.titulo || num(v), num: num(v),
    video_url: v.video_url, capa_url: (Array.isArray(v.capas) && v.capas[0]?.url) || v.capa_url,
    baixar: comDownload(v.video_url, nomeArq(v.yt_titulo || v.titulo, '.mp4')),
    quando: e === 'programado' ? v.yt_programado_para : null, postado: v.yt_postado_em,
    views: v.yt_views || 0, erro: v.yt_erro || '',
    aviso: e === 'criacao' ? 'Em produção' : '',
    tipoNome: v.duracao ? minutos(v.duracao) : '',
    programavel: ['criado', 'rascunho', 'revisao', 'upload'].includes(e),
    movel: true,
    ordem: `${String(v.numero ?? 0).padStart(6, '0')}${v.created_at || ''}`,
  }
}

export default function YouTubeLongo({ canal, nome }) {
  const { versao, avisar } = usePainel()
  const [lista, setLista] = useState(null)
  const [abertoId, setAbertoId] = useState(null)
  const [perfil, setPerfil] = useState(false)
  const info = CANAIS.find((c) => c.id === canal) || { id: canal, nome, cor: '#888', sigla: nome.slice(0, 2).toUpperCase(), tipo: 'longo' }
  const cx = useConexoes(canal)

  const carregar = async () => {
    const { data } = await supabase.from('videos').select('*').eq('canal', canal).order('numero', { ascending: true, nullsFirst: false })
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [versao, canal])
  const itens = useMemo(() => (lista || []).map(paraItem), [lista])

  async function mover(item, alvo) {
    const v = item.bruto
    const d = { yt_etapa: alvo }
    if (alvo === 'publicado') d.yt_postado_em = v.yt_postado_em || new Date().toISOString()
    else { d.yt_postado_em = null; if (v.yt_status === 'postado') d.yt_status = null }
    if (alvo === 'programado' && !v.yt_programado_para) d.yt_programado_para = v.publicar_em || null
    if (alvo === 'upload' && !v.subido_em) d.subido_em = new Date().toISOString()
    const { error } = await supabase.from('videos').update(d).eq('id', v.id)
    avisar(error ? 'Não salvou' : `${num(v)} em ${NOME_FASE[alvo]}`)
    await carregar()
  }

  async function programar(lote, progresso) {
    let ok = 0
    for (let k = 0; k < lote.length; k++) {
      const { item, quando } = lote[k]
      progresso?.(k + 1, lote.length)
      const { error } = await supabase.from('videos').update({ yt_etapa: 'programado', yt_programado_para: quando }).eq('id', item.bruto.id)
      if (!error) ok++
    }
    avisar(ok === lote.length ? `${ok} programados` : `${ok} de ${lote.length} programados`)
    await carregar()
  }

  // Subir vídeo pelo painel: arquivo e capa no bucket "videos" e o cartão novo em Criado
  async function subir(file, { titulo, capa, duracao }) {
    const numero = Math.max(0, ...lista.map((v) => v.numero || 0)) + 1
    const id = `${(info.sigla || canal.slice(0, 3)).toLowerCase()}${String(numero).padStart(3, '0')}-${Date.now().toString(36)}`
    const pasta = supabase.storage.from('videos')
    const up = await pasta.upload(`${canal}/${id}.mp4`, file, { contentType: 'video/mp4', upsert: true, cacheControl: '31536000' })
    if (up.error) { avisar(`Não subiu: ${up.error.message}`); return false }
    let capaUrl = null
    if (capa) {
      const c = await pasta.upload(`${canal}/${id}.jpg`, capa, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
      if (!c.error) capaUrl = pasta.getPublicUrl(`${canal}/${id}.jpg`).data.publicUrl
    }
    const { error } = await supabase.from('videos').insert({
      id, canal, numero, titulo, yt_titulo: titulo, arquivo: `${titulo}.mp4`, yt_etapa: 'criado',
      video_url: pasta.getPublicUrl(`${canal}/${id}.mp4`).data.publicUrl, capa_url: capaUrl, duracao,
    })
    if (error) { avisar('Subiu, mas não registrou'); return false }
    avisar('Vídeo em Criado'); await carregar(); return true
  }

  if (lista === null) return <p className="p-vazio">Carregando…</p>
  const aberto = lista.find((v) => v.id === abertoId)
  const ordem = itens.map((i) => i.chave)
  const pos = ordem.indexOf(abertoId)
  const vizinhos = {
    anterior: pos > 0 ? () => setAbertoId(ordem[pos - 1]) : null,
    proximo: pos >= 0 && pos < ordem.length - 1 ? () => setAbertoId(ordem[pos + 1]) : null,
  }
  if (aberto) return <Detalhe v={aberto} c={info} fechar={() => setAbertoId(null)} recarregar={carregar} mover={mover} vizinhos={vizinhos} />

  return (
    <>
      <Pipeline canal={info} fases={FASES} itens={itens} mover={mover} programar={programar} abrir={(i) => i && setAbertoId(i.chave)}
        cx={cx} subir={subir} recarregar={carregar} extra={<button className="p-btn" onClick={() => setPerfil(true)}>Perfil do canal</button>} />
      {perfil && <PerfilCanal c={info} fechar={() => setPerfil(false)} />}
    </>
  )
}

export { fmtCurto }
