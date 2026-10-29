import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'

// Vídeos curtos do Concrete Atlas: ver, baixar, copiar legendas por plataforma e marcar onde já saiu.
// YouTube e TikTok: postagem à mão (as APIs deles exigem aprovação/auditoria). Instagram: sai pelo painel.
const CANAL = 'concrete-atlas'
const FUSO = 'America/Sao_Paulo'

const fmtDia = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' }) : '—'
const fmtHora = (iso) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }) : ''
const diaChave = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: FUSO })
// datetime-local <-> ISO no fuso de São Paulo (UTC-3, sem horário de verão)
const paraLocal = (iso) => iso ? new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16) : ''
const deLocal = (v) => v ? new Date(`${v}:00-03:00`).toISOString() : null

const IG_TXT = { pendente: 'Não postado', agendado: 'Agendado', processando: 'Instagram processando…', publicado: 'Publicado', erro: 'Erro' }

function Copiar({ texto, rotulo = 'Copiar' }) {
  const { avisar } = usePainel()
  async function copiar() {
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

function Plataformas({ v }) {
  return (
    <span className="v-plats" aria-label="Onde já foi postado">
      <span className={v.yt_postado_em ? 'ok' : ''} title={v.yt_postado_em ? 'YouTube: postado' : 'YouTube: falta'}>YT</span>
      <span className={v.tt_postado_em ? 'ok' : ''} title={v.tt_postado_em ? 'TikTok: postado' : 'TikTok: falta'}>TT</span>
      <span className={v.ig_status === 'publicado' ? 'ok' : v.ig_status === 'agendado' || v.ig_status === 'processando' ? 'meio' : v.ig_status === 'erro' ? 'erro' : ''}
        title={`Instagram: ${IG_TXT[v.ig_status]}`}>IG</span>
    </span>
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

function ConexaoIG() {
  const { avisar } = usePainel()
  const [st, setSt] = useState(null)
  const [form, setForm] = useState(null)
  const [teste, setTeste] = useState('')
  const carregar = async () => { const { data } = await supabase.rpc('instagram_status_canal', { p_canal: CANAL }); setSt(data?.[0] || { conectado: false }) }
  useEffect(() => { carregar() }, [])
  async function testar() {
    setTeste('Testando…')
    const { data, error } = await supabase.functions.invoke('publicar-reels', { body: { verificar: true, canal: CANAL } })
    setTeste(error ? 'Não consegui falar com o servidor.' : data?.ok ? `Conectado como @${data.username}` : `Erro: ${data?.erro}`)
  }
  async function salvar(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('salvar_instagram_canal', { p_canal: CANAL, p_user_id: form.user_id, p_token: form.token })
    if (error) { avisar('Não salvou'); return }
    setForm(null); await carregar(); testar()
  }
  if (!st) return null
  return (
    <div className={`p-ig ${st.conectado ? '' : 'p-ig--off'}`}>
      {st.conectado
        ? <p><strong>Instagram do Concrete Atlas conectado.</strong> Reels agendados saem sozinhos (checagem a cada 5 min). {teste && <span>{teste}</span>}</p>
        : <p><strong>Instagram do Concrete Atlas ainda não conectado.</strong> Até lá, use Baixar ou Compartilhar e poste à mão.</p>}
      <div className="p-acoes">
        {st.conectado && <button className="p-btn" onClick={testar}>Testar conexão</button>}
        <button className="p-btn" onClick={() => setForm(form ? null : { user_id: st.user_id || '', token: '' })}>{st.conectado ? 'Trocar token' : 'Conectar'}</button>
      </div>
      {form && (
        <form className="p-venda" onSubmit={salvar}>
          <label>ID da conta (opcional com token IGAA)<input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="1784…" /></label>
          <label className="p-largo">Token de acesso da conta do canal<input required type="password" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="IGAA…" /></label>
          <div className="p-acoes"><button className="p-btn p-btn--forte">Salvar e testar</button></div>
        </form>
      )}
    </div>
  )
}

function Detalhe({ v, fechar, recarregar }) {
  const { avisar } = usePainel()
  const [legIG, setLegIG] = useState(v.ig_legenda || '')
  const [quando, setQuando] = useState(paraLocal(v.ig_agendado_para || v.publicar_em))
  const [link, setLink] = useState(v.yt_link || '')
  const [ocupado, setOcupado] = useState('')
  const celular = typeof navigator !== 'undefined' && !!navigator.share

  const salvar = async (campos, ok) => {
    const { error } = await supabase.from('videos').update(campos).eq('id', v.id)
    if (error) { avisar('Não salvou'); return false }
    if (ok) avisar(ok)
    recarregar(); return true
  }
  const alternar = (campo) => salvar({ [campo]: v[campo] ? null : new Date().toISOString() }, v[campo] ? 'Desmarcado' : 'Marcado como postado')

  async function publicarAgora() {
    setOcupado('pub')
    await supabase.from('videos').update({ ig_legenda: legIG }).eq('id', v.id)
    const { data, error } = await supabase.functions.invoke('publicar-reels', { body: { id: v.id } })
    setOcupado('')
    avisar(error ? 'Não consegui falar com o servidor' : data?.ok ? (data.publicado ? 'Publicado no Instagram' : data.aviso) : `Erro: ${data?.erro}`)
    recarregar()
  }
  const agendar = () => salvar({ ig_legenda: legIG, ig_status: 'agendado', ig_agendado_para: deLocal(quando), ig_erro: null }, `Agendado para ${fmtDia(deLocal(quando))} ${quando.slice(11)}`)
  const cancelar = () => salvar({ ig_status: 'pendente', ig_agendado_para: null }, 'Agendamento cancelado')
  const posteiIG = () => salvar({ ig_legenda: legIG, ig_status: v.ig_status === 'publicado' ? 'pendente' : 'publicado', ig_postado_em: v.ig_status === 'publicado' ? null : new Date().toISOString() },
    v.ig_status === 'publicado' ? 'Desmarcado' : 'Marcado como postado')

  const baixar = `${v.video_url}?download=${encodeURIComponent(v.arquivo || `${v.id}.mp4`)}`

  return (
    <section className="v-detalhe">
      <div className="p-cab">
        <div>
          <button className="p-voltar" onClick={fechar}>Vídeos</button>
          <h1>#{String(v.numero).padStart(3, '0')} {v.yt_titulo}</h1>
          <p className="p-sub">Postar {fmtDia(v.publicar_em)} às {fmtHora(v.publicar_em)} · {Math.round(v.duracao || 0)} s</p>
        </div>
        <div className="p-acoes">
          <a className="p-btn p-btn--forte" href={baixar}>Baixar vídeo</a>
          {celular && <button className="p-btn" onClick={() => compartilhar(v, '', avisar)}>Compartilhar</button>}
        </div>
      </div>

      <div className="v-grade">
        <div className="v-player">
          {v.video_url ? <video src={v.video_url} poster={v.capa_url || undefined} controls playsInline preload="metadata" /> : <div className="v-semvideo">Arquivo ainda subindo…</div>}
        </div>

        <div className="v-plataformas">
          <article className={`v-plat ${v.yt_postado_em ? 'v-plat--ok' : ''}`}>
            <header><h2>YouTube Shorts</h2>
              <label className="v-check"><input type="checkbox" checked={!!v.yt_postado_em} onChange={() => alternar('yt_postado_em')} /> Postei</label>
            </header>
            <Bloco titulo="Título" texto={v.yt_titulo} linhas={2} />
            <Bloco titulo="Descrição" texto={v.yt_descricao} linhas={4} />
            <Bloco titulo="Comentário para fixar" texto={v.comentario_fixado} linhas={2} />
            <p className="v-dica">No upload: Público = não é para crianças · Conteúdo alterado ou sintético = Sim · agendar para {fmtDia(v.publicar_em)} {fmtHora(v.publicar_em)}.</p>
            <div className="p-acoes">
              <a className="p-btn" href="https://studio.youtube.com" target="_blank" rel="noreferrer">Abrir YouTube Studio</a>
              {celular && <button className="p-btn" onClick={() => compartilhar(v, v.yt_titulo, avisar)}>Mandar para o app (copia o título)</button>}
            </div>
            {v.yt_postado_em && (
              <label className="p-campo v-link">Link do Short (opcional)
                <span><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtube.com/shorts/…" /><button className="p-btn p-btn--mini" onClick={() => salvar({ yt_link: link }, 'Link salvo')}>Salvar</button></span>
              </label>
            )}
          </article>

          <article className={`v-plat ${v.tt_postado_em ? 'v-plat--ok' : ''}`}>
            <header><h2>TikTok</h2>
              <label className="v-check"><input type="checkbox" checked={!!v.tt_postado_em} onChange={() => alternar('tt_postado_em')} /> Postei</label>
            </header>
            <Bloco titulo="Legenda" texto={v.tt_legenda} linhas={3} />
            <p className="v-dica">Marque "Conteúdo gerado por IA" nas opções do post (a voz é sintética).</p>
            <div className="p-acoes">
              <a className="p-btn" href="https://www.tiktok.com/tiktokstudio/upload" target="_blank" rel="noreferrer">Abrir TikTok Studio</a>
              {celular && <button className="p-btn" onClick={() => compartilhar(v, v.tt_legenda, avisar)}>Mandar para o app (copia a legenda)</button>}
            </div>
          </article>

          <article className={`v-plat ${v.ig_status === 'publicado' ? 'v-plat--ok' : ''}`}>
            <header><h2>Instagram Reels</h2>
              <span className={`p-estado p-estado--${v.ig_status === 'publicado' ? 'publicado' : v.ig_status === 'erro' ? 'erro' : v.ig_status === 'pendente' ? '' : 'agendado'}`}>
                {IG_TXT[v.ig_status]}{v.ig_status === 'agendado' ? `, ${fmtDia(v.ig_agendado_para)} ${fmtHora(v.ig_agendado_para)}` : ''}
              </span>
            </header>
            {v.ig_erro && v.ig_status === 'erro' && <p className="p-erro">{v.ig_erro}</p>}
            <label className="p-campo">Legenda <span className="v-cont">{legIG.length}/2200</span>
              <textarea rows={6} value={legIG} onChange={(e) => setLegIG(e.target.value)} maxLength={2200} />
            </label>
            <div className="p-acoes"><Copiar texto={legIG} rotulo="Copiar legenda" />
              {legIG !== (v.ig_legenda || '') && <button className="p-btn p-btn--mini" onClick={() => salvar({ ig_legenda: legIG }, 'Legenda salva')}>Salvar legenda</button>}
            </div>
            {v.ig_status !== 'publicado' && (
              <div className="p-agenda">
                <label className="p-campo">Publicar em<input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} /></label>
                <button className="p-btn p-btn--forte" onClick={agendar} disabled={!quando || !v.video_url}>{v.ig_status === 'agendado' ? 'Reagendar' : 'Agendar'}</button>
              </div>
            )}
            <div className="p-acoes">
              {v.ig_status !== 'publicado' && <button className="p-btn" onClick={publicarAgora} disabled={!!ocupado || !v.video_url || v.ig_status === 'processando'}>{ocupado === 'pub' ? 'Publicando… (até 1 min)' : 'Publicar agora'}</button>}
              {v.ig_status === 'agendado' && <button className="p-btn p-btn--fraco" onClick={cancelar}>Cancelar agendamento</button>}
              {celular && v.ig_status !== 'publicado' && <button className="p-btn" onClick={() => compartilhar(v, legIG, avisar)}>Mandar para o app (copia a legenda)</button>}
              <button className="p-btn p-btn--fraco" onClick={posteiIG}>{v.ig_status === 'publicado' ? 'Desmarcar' : 'Postei à mão'}</button>
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

export default function Videos() {
  const { versao } = usePainel()
  const [lista, setLista] = useState(null)
  const [abertoId, setAbertoId] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  const carregar = async () => {
    const { data } = await supabase.from('videos').select('*').eq('canal', CANAL).order('publicar_em', { ascending: true, nullsFirst: false })
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [versao])

  const hj = hoje()
  const contagem = useMemo(() => {
    const l = lista || []
    const falta = (v) => !v.yt_postado_em || !v.tt_postado_em || v.ig_status !== 'publicado'
    return { total: l.length, completos: l.filter((v) => !falta(v)).length, falta }
  }, [lista])

  if (lista === null) return <p className="p-vazio">Carregando…</p>
  const aberto = lista.find((v) => v.id === abertoId)
  if (aberto) return <Detalhe v={aberto} fechar={() => setAbertoId(null)} recarregar={carregar} />

  const doDia = lista.filter((v) => v.publicar_em && diaChave(v.publicar_em) === hj)
  const visiveis = lista.filter((v) => filtro === 'todos' || (filtro === 'falta' ? contagem.falta(v) : !contagem.falta(v)))

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Vídeos</h1>
          <p className="p-sub">Concrete Atlas · 1 Short por dia às 13h · {contagem.completos} de {contagem.total} já estão nas 3 redes.</p>
        </div>
        <div className="v-filtros" role="group" aria-label="Filtrar">
          {[['todos', 'Todos'], ['falta', 'Falta postar'], ['feitos', 'Postados']].map(([k, t]) => (
            <button key={k} className={`p-btn p-btn--mini ${filtro === k ? 'p-btn--forte' : ''}`} onClick={() => setFiltro(k)}>{t}</button>
          ))}
        </div>
      </div>

      <ConexaoIG />

      {doDia.map((v) => (
        <button key={v.id} className="v-hoje" onClick={() => setAbertoId(v.id)}>
          {v.capa_url && <img src={v.capa_url} alt="" />}
          <span>
            <small>Hoje, {fmtHora(v.publicar_em)}</small>
            <strong>{v.yt_titulo}</strong>
            <Plataformas v={v} />
          </span>
          <em>Abrir</em>
        </button>
      ))}

      {lista.length === 0 ? (
        <div className="p-vazio"><p>Nenhum vídeo ainda.</p></div>
      ) : (
        <div className="v-lista">
          {visiveis.map((v) => {
            const passou = v.publicar_em && diaChave(v.publicar_em) < hj && contagem.falta(v)
            return (
              <button key={v.id} className="v-card" onClick={() => setAbertoId(v.id)}>
                <span className="v-capa">
                  {v.capa_url ? <img src={v.capa_url} alt="" loading="lazy" /> : null}
                  <b>#{String(v.numero).padStart(3, '0')}</b>
                </span>
                <span className="v-info">
                  <small className={passou ? 'v-atrasado' : ''}>{fmtDia(v.publicar_em)} {fmtHora(v.publicar_em)}{passou ? ' · atrasado' : ''}</small>
                  <strong>{v.yt_titulo}</strong>
                  <Plataformas v={v} />
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
