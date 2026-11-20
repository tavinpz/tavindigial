import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import Pipeline, { Janela, fmtQuando, fmtCurto, useConexoes } from './Pipeline'
import { CANAIS } from './canais'

// Canais de vídeo longo do YouTube (Ten Thousand Runs, Last State Standing, Quanto Você Dura?…).
// Quadro: Rascunho → Revisão → Upload feito → Programado → Publicado (coluna `yt_etapa` em `videos`).
// "Perfil do canal" mostra nome, @, assunto, descrição, palavras-chave, logo e banner para baixar.
const FASES = [
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
  const e = v.yt_etapa && !['criacao', 'criado'].includes(v.yt_etapa) ? v.yt_etapa : 'rascunho'
  if ((v.yt_status === 'programado' || v.yt_status === 'agendado') && FASES.findIndex((f) => f.k === e) < 3) return 'programado'
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


// Configuração do canal (canais.perfil.configuracao): texto com seções em CAIXA ALTA ("GRADE", "EM CADA VÍDEO"…)
function secoesCfg(cfg) {
  const out = []
  for (const linha of String(cfg || '').split('\n')) {
    const t = linha.trim()
    if (!t) continue
    if (!/^[-\d]/.test(t) && t === t.toUpperCase() && /[A-ZÀ-Ú]/.test(t)) out.push({ titulo: t, linhas: [] })
    else if (out.length) out.at(-1).linhas.push(t.replace(/^-\s*/, ''))
    else out.push({ titulo: 'GERAL', linhas: [t.replace(/^-\s*/, '')] })
  }
  return out
}
const cap = (t) => t.charAt(0) + t.slice(1).toLowerCase()
const ehVideo = (t) => /^EM CADA V[ÍI]DEO/.test(t)
const ehGrade = (t) => /^GRADE/.test(t)
const ehRegra = (t) => /^(REGRAS|SEGURAN)/.test(t)
const gradeDo = (c) => secoesCfg(c?.perfil?.configuracao).find((x) => ehGrade(x.titulo))?.linhas.join(' ') || ''

// Faixa com o essencial do canal: para quem é, idioma, categoria e quando postar
export function ResumoCanal({ c }) {
  const p = c?.perfil || {}
  const g = gradeDo(c)
  const itens = [['Público-alvo', p.pais], ['Idioma', p.idioma], ['Categoria', p.categoria], ['Quando postar', g]].filter(([, v]) => v)
  if (!itens.length) return null
  return (
    <dl className="yl-resumo">
      {itens.map(([k, v]) => <div key={k} className={k === 'Quando postar' ? 'yl-resumo-grade' : ''}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}

function Lista({ titulo, linhas }) {
  if (!linhas?.length) return null
  return (
    <div className="yl-cfg-sec">
      <h4>{titulo}</h4>
      <ul>{linhas.map((l, k) => <li key={k}>{l}</li>)}</ul>
    </div>
  )
}

// Passo a passo do upload no YouTube Studio, na ordem das telas, com os campos deste canal
export function ConfigVideo({ c }) {
  const p = c?.perfil || {}
  const idioma = p.idioma || '—'
  const doCanal = secoesCfg(p.configuracao).filter((x) => ehVideo(x.titulo)).flatMap((x) => x.linhas)
  return (
    <div className="yl-cfg">
      <Lista titulo="1. Detalhes" linhas={[
        'Título: o da versão 1 do teste A/B.',
        'Descrição: colar a do painel (capítulos, fontes e avisos).',
        'Thumbnail: "Testar e comparar" → modo "Título e thumbnail" → capa 1 com título 1, capa 2 com título 2, capa 3 com título 3.',
        'Playlist: a playlist única do canal.',
        'Público: "Não, não é conteúdo para crianças". Restrição de idade: não.',
      ]} />
      <Lista titulo="2. Mostrar mais" linhas={[
        'Promoção paga: deixar desmarcado.',
        'Conteúdo alterado ou sintético: seguir a regra do canal (abaixo).',
        'Tags: as do painel.',
        `Idioma do vídeo e do título/descrição: ${idioma}. Certificação de legendas: nenhuma.`,
        'Data e local da gravação: em branco.',
        'Licença: padrão do YouTube. Permitir incorporação: sim. Publicar no feed de inscrições e notificar: sim.',
        'Remixar Shorts: permitir vídeo e áudio (os cortes podem trazer público).',
        `Categoria: ${p.categoria || '—'}.`,
        'Comentários: ativados, com "Reter comentários potencialmente inadequados". Ordenar por "Mais votados". Mostrar o número de curtidas: sim.',
      ]} />
      <Lista titulo="3. Elementos do vídeo" linhas={[
        'Tela final nos últimos 5 a 20 s: botão de inscrição + o vídeo anterior da série (ou "Melhor para o espectador").',
        'Card no meio do vídeo apontando para o vídeo anterior, quando existir.',
      ]} />
      <Lista titulo="4. Verificações" linhas={['Esperar "Nenhum problema encontrado" antes de programar.']} />
      <Lista titulo="5. Visibilidade" linhas={['Programar no dia e horário que estão no painel (horário de Brasília). Subir com antecedência para o HD processar.']} />
      <Lista titulo="Depois de publicar" linhas={['Fixar o comentário do painel.', 'Não trocar título nem capa antes de 3 a 4 dias (o teste A/B precisa desse tempo).', 'Não mandar o link para família e grupos.']} />
      <Lista titulo="Regra deste canal" linhas={doCanal} />
    </div>
  )
}

// Configuração do canal, separada: o que fazer uma vez × regras
function ConfigCanal({ c }) {
  const secs = secoesCfg(c?.perfil?.configuracao)
  if (!secs.length) return <p className="v-dica">Este canal ainda não tem a configuração escrita.</p>
  const uma = secs.filter((x) => !ehVideo(x.titulo) && !ehGrade(x.titulo) && !ehRegra(x.titulo))
  const regras = secs.filter((x) => ehRegra(x.titulo))
  return (
    <div className="yl-cfg">
      {uma.map((x) => <Lista key={x.titulo} titulo={cap(x.titulo)} linhas={x.linhas} />)}
      {regras.map((x) => <Lista key={x.titulo} titulo={cap(x.titulo)} linhas={x.linhas} />)}
    </div>
  )
}

// Teste A/B: cada capa com o título que vai junto, pronto para copiar
function TesteAB({ v, titulo, capas, titulos }) {
  const n = Math.max(capas.length, titulos.length)
  if (!n) return null
  const pares = Array.from({ length: Math.min(n, 3) }, (_, k) => ({ capa: capas[k], titulo: titulos[k] || titulos[0] || titulo }))
  return (
    <section className="yl-ab">
      <header>
        <h2>Teste A/B · {pares.length} versões</h2>
        <p className="v-dica">Studio → Thumbnail → "Testar e comparar" → "Título e thumbnail". Capa N com título N. Não mexer por 3–4 dias.</p>
      </header>
      <div className="yl-ab-lista">
        {pares.map((par, k) => (
          <article key={k} className="yl-ab-item">
            <span className="yl-ab-n">Versão {k + 1}{k === 0 ? ' · principal' : ''}</span>
            {par.capa ? <img src={par.capa.url} alt={`Capa da versão ${k + 1}`} loading="lazy" /> : <div className="yl-ab-sem">Sem capa</div>}
            <p className="yl-ab-tit">{par.titulo}</p>
            <div className="p-acoes">
              <Copiar texto={par.titulo} rotulo={`Copiar título ${k + 1}`} />
              {par.capa && <a className="p-btn p-btn--mini" href={comDownload(par.capa.url, `${v.id}-capa-${k + 1}.jpg`)}>Baixar capa {k + 1}</a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// Perfil do canal: tudo o que vai no YouTube Studio → Personalização, com os arquivos para baixar
export function PerfilCanal({ c, fechar }) {
  const p = c.perfil || {}
  const abs = (u) => (u && u.startsWith('/') ? `${window.location.origin}${u}` : u)
  // Arquivo no Storage (outro domínio): o navegador ignora o atributo download e abre a imagem. O ?download= força baixar.
  const ext = (u, padrao) => ((u || '').split('?')[0].match(/\.(png|jpe?g|webp|svg)$/i) || [])[1] || padrao
  const baixarArq = (u, nome) => (/\/storage\/v1\/object\//.test(u || '') ? comDownload(u, nome) : abs(u))
  return (
    <Janela titulo={`Perfil do canal · ${c.nome}`} sub="Tudo do canal: copie cada campo para o YouTube, Instagram e TikTok" fechar={fechar} larga>
      <div className="yl-perfil">
        {c.banner && <img className="yl-banner" src={c.banner} alt={`Banner do ${c.nome}`} />}
        <div className="yl-perfil-topo">
          {c.logo && <img className="yl-logo" src={c.logo} alt={`Logo do ${c.nome}`} />}
          <div>
            <h3>{c.nome}</h3>
            <p className="p-sub">{[p.handle, p.idioma, p.pais, p.categoria].filter(Boolean).join(' · ')}</p>
            <div className="p-acoes">
              {c.logo && <a className="p-btn p-btn--mini" href={baixarArq(c.logo, `${c.id}-logo.${ext(c.logo, 'png')}`)} download={`${c.id}-logo.${ext(c.logo, 'png')}`}>Baixar logo (800×800)</a>}
              {c.banner && <a className="p-btn p-btn--mini" href={baixarArq(c.banner, `${c.id}-banner.${ext(c.banner, 'jpg')}`)} download={`${c.id}-banner.${ext(c.banner, 'jpg')}`}>Baixar banner (2560×1440)</a>}
            </div>
          </div>
        </div>
        <ResumoCanal c={c} />
        <details className="yl-dobra" open>
          <summary>Configurar o canal (uma vez)</summary>
          <ConfigCanal c={c} />
        </details>
        <details className="yl-dobra" open>
          <summary>Configurar cada vídeo no YouTube Studio</summary>
          <ConfigVideo c={c} />
        </details>
        <h4 className="yl-copiar-cab">Textos para copiar</h4>
        <Bloco titulo="Nome do canal" texto={c.nome} linhas={1} />
        <Bloco titulo="Identificador (@)" texto={p.handle} linhas={1} />
        <Bloco titulo="Descrição do canal" texto={p.descricao} linhas={7} />
        <Bloco titulo="Palavras-chave do canal" texto={p.palavras} linhas={2} />
        {p.bio && <Bloco titulo="Bio (Instagram e TikTok)" texto={p.bio} linhas={3} />}
        <Bloco titulo="Assunto (para nós)" texto={p.assunto} linhas={3} />
        {p.formato && <Bloco titulo="Formato dos vídeos" texto={p.formato} linhas={3} />}
        {p.dinheiro && <Bloco titulo="Como o canal ganha dinheiro" texto={p.dinheiro} linhas={3} />}
        {(p.criado || p.historia) && <Bloco titulo="Desde a criação" texto={[p.criado && `Criado em: ${p.criado}`, p.historia].filter(Boolean).join('\n')} linhas={3} />}
        {['instagram', 'youtube', 'tiktok'].some((r) => c[r]) && (
          <p className="v-dica">Redes: {[c.instagram && `Instagram ${c.instagram}`, c.youtube && `YouTube ${c.youtube}`, c.tiktok && `TikTok ${c.tiktok}`].filter(Boolean).join(' · ')}</p>
        )}
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
          <ResumoCanal c={c} />
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
          <TesteAB v={v} titulo={titulo} capas={capas} titulos={titulos} />
        </div>

        <div className="v-plataformas">
          <article className="v-plat">
            <header><h2>YouTube</h2></header>
            <Bloco titulo="Título (versão 1)" texto={titulos[0] || titulo} linhas={2} />
            <Bloco titulo="Descrição (com capítulos e fontes)" texto={v.yt_descricao} linhas={8} />
            <Bloco titulo="Tags (campo Tags, em Mostrar mais)" texto={v.yt_tags} linhas={2} />
            <Bloco titulo="Comentário para fixar" texto={v.comentario_fixado} linhas={2} />
            <details className="yl-dobra">
              <summary>Configuração deste vídeo no Studio</summary>
              <ConfigVideo c={c} />
            </details>
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
    aviso: v.video_url ? '' : 'Em produção',
    tipoNome: v.duracao ? minutos(v.duracao) : '',
    programavel: ['rascunho', 'revisao', 'upload'].includes(e),
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

  // Subir vídeo pelo painel: arquivo e capa no bucket "videos" e o cartão novo em Rascunho
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
      id, canal, numero, titulo, yt_titulo: titulo, arquivo: `${titulo}.mp4`, yt_etapa: 'rascunho',
      video_url: pasta.getPublicUrl(`${canal}/${id}.mp4`).data.publicUrl, capa_url: capaUrl, duracao,
    })
    if (error) { avisar('Subiu, mas não registrou'); return false }
    avisar('Vídeo em Rascunho'); await carregar(); return true
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
        cx={cx} subir={subir} recarregar={carregar} />
      {perfil && <PerfilCanal c={info} fechar={() => setPerfil(false)} />}
    </>
  )
}

export { fmtCurto }
