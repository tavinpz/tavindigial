import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { dataCurta } from './api'
import { usePainel } from './Painel'

const NICHOS = ['estetica', 'barbearia', 'pet', 'saude', 'odontologia', 'alimentacao', 'tatuagem', 'geral']
const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`)

// Coleta de leads pela API oficial do Google Places: automática às 7h e busca manual quando quiser
export default function Coleta() {
  const { avisar } = usePainel()
  const [st, setSt] = useState(null)
  const [termos, setTermos] = useState([])
  const [bairros, setBairros] = useState('')
  const [buscas, setBuscas] = useState([])
  const [chave, setChave] = useState('')
  const [rodando, setRodando] = useState('')
  const [resultado, setResultado] = useState(null)
  const [manual, setManual] = useState({ termo: '', nicho: 'estetica', bairros: '', min_avaliacoes: 5, paginas: 3 })
  const [novoTermo, setNovoTermo] = useState({ termo: '', nicho: 'estetica', min_avaliacoes: 5 })
  const [conf, setConf] = useState({ dia: '', mes: '' })

  async function carregar() {
    const [s, t, b, h] = await Promise.all([
      supabase.rpc('coleta_status'),
      supabase.from('v_coleta_termos').select('*').order('taxa', { ascending: false, nullsFirst: false }),
      supabase.from('coleta_bairros').select('bairro').eq('ativo', true).order('id'),
      supabase.from('coleta_buscas').select('*').order('feita_em', { ascending: false }).limit(40),
    ])
    const x = s.data?.[0] || { google_conectado: false }
    setSt(x); setConf({ dia: x.buscas_dia ?? 30, mes: x.limite_mes ?? 950 })
    setTermos(t.data || []); setBairros((b.data || []).map((r) => r.bairro).join('\n')); setBuscas(h.data || [])
  }
  useEffect(() => { carregar() }, [])

  async function chamar(body, rotulo) {
    setRodando(rotulo); setResultado(null)
    const { data, error } = await supabase.functions.invoke('coletar-leads', { body })
    setRodando('')
    if (error || !data?.ok) { avisar(data?.erro || 'A coleta não respondeu. Tente de novo.'); setResultado({ erro: data?.erro || 'Sem resposta do servidor' }); return null }
    setResultado(data); carregar()
    return data
  }

  async function salvarChave(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('salvar_config', { p_key: 'google_places_key', p_value: chave })
    if (error) return avisar('Não salvou a chave')
    setChave('')
    const r = await chamar({ verificar: true }, 'Testando a chave…')
    if (r) avisar('Chave do Google funcionando')
  }

  async function salvarLimites() {
    await supabase.rpc('salvar_config', { p_key: 'coleta_buscas_dia', p_value: String(conf.dia) })
    await supabase.rpc('salvar_config', { p_key: 'coleta_limite_mes', p_value: String(conf.mes) })
    avisar('Limites salvos'); carregar()
  }

  async function rodarManual(e) {
    e.preventDefault()
    const r = await chamar({ ...manual, bairros: manual.bairros.split('\n') }, 'Buscando…')
    if (r) avisar(`${r.qualificados} leads novos na fila`)
  }

  async function alternarTermo(t) {
    await supabase.from('coleta_termos').update({ ativo: !t.ativo }).eq('id', t.id); carregar()
  }

  async function addTermo(e) {
    e.preventDefault()
    if (!novoTermo.termo.trim()) return
    const { error } = await supabase.from('coleta_termos').insert({ ...novoTermo, termo: novoTermo.termo.trim().toLowerCase() })
    if (error) return avisar('Esse termo já existe')
    setNovoTermo({ ...novoTermo, termo: '' }); carregar()
  }

  async function salvarBairros() {
    const lista = [...new Set(bairros.split('\n').map((b) => b.trim()).filter(Boolean))]
    await supabase.from('coleta_bairros').update({ ativo: false }).eq('cidade', 'São Paulo, SP')
    await supabase.from('coleta_bairros').upsert(lista.map((bairro) => ({ cidade: 'São Paulo, SP', bairro, ativo: true })), { onConflict: 'cidade,bairro' })
    avisar(`${lista.length} bairros na rotação`); carregar()
  }

  if (!st) return <p className="p-vazio">Carregando…</p>
  const usoPct = Math.min(100, Math.round(((st.paginas_mes || 0) / (st.limite_mes || 950)) * 100))

  return (
    <section className="p-coleta-pg">
      <div className="p-cab">
        <div>
          <h1>Coleta de leads</h1>
          <p className="p-sub">Busca no Google Maps pela API oficial do Google. Só entra na fila quem não tem site ou usa link fraco, sem repetir ninguém.</p>
        </div>
      </div>

      {!st.google_conectado ? (
        <article className="p-painel p-coleta-chave">
          <header><h2>Conectar a API do Google</h2></header>
          <ol className="p-passos">
            <li>Abra <a href="https://console.cloud.google.com/apis/library/places.googleapis.com" target="_blank" rel="noreferrer">Places API (New) no Google Cloud</a> e clique em <b>Ativar</b> (pede um cartão de cobrança no projeto).</li>
            <li>Em <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Credenciais</a>, clique em <b>Criar credenciais → Chave de API</b>.</li>
            <li>Na chave, em <b>Restrições de API</b>, deixe só a <b>Places API (New)</b>. Copie e cole aqui.</li>
          </ol>
          <form className="p-ig-form" onSubmit={salvarChave}>
            <input type="password" value={chave} onChange={(e) => setChave(e.target.value)} placeholder="AIza…" aria-label="Chave da API do Google" />
            <button className="p-btn p-btn--forte" disabled={!chave.trim() || !!rodando}>Salvar e testar</button>
          </form>
          <p className="p-meta">O Google cobra por busca (cada uma traz até 20 negócios), não por negócio: as primeiras 1.000 buscas do mês são grátis. O painel para em {st.limite_mes} para não passar disso.</p>
        </article>
      ) : (
        <article className="p-painel">
          <header><h2>Coleta automática</h2><span>todo dia às 7h</span></header>
          <p className="p-meta">Escolhe sozinha termo + bairro ainda não buscados, começando pelos termos que mais trazem negócio sem site ou com link fraco. {st.ultima ? `Última busca ${dataCurta(st.ultima)}.` : 'Ainda não rodou.'}</p>
          <div className="p-uso">
            <div className="p-barra"><div style={{ width: `${usoPct}%` }} /></div>
            <small>{st.paginas_mes || 0} de {st.limite_mes} buscas usadas neste mês (1.000 grátis)</small>
          </div>
          <div className="p-coleta-conf">
            <label>Buscas por dia<input type="number" min="1" max="200" value={conf.dia} onChange={(e) => setConf({ ...conf, dia: e.target.value })} /></label>
            <label>Teto do mês<input type="number" min="1" max="10000" value={conf.mes} onChange={(e) => setConf({ ...conf, mes: e.target.value })} /></label>
            <button className="p-btn" onClick={salvarLimites}>Salvar</button>
          </div>
          <div className="p-acoes">
            <button className="p-btn p-btn--forte" disabled={!!rodando} onClick={() => chamar({ auto: true }, 'Rodando a coleta do dia…')}>Rodar a coleta do dia agora</button>
            <button className="p-btn p-btn--fraco" disabled={!!rodando} onClick={() => chamar({ verificar: true }, 'Testando…').then((r) => r && avisar('Chave funcionando'))}>Testar chave</button>
          </div>
        </article>
      )}

      {rodando && <p className="p-aviso-fixo">{rodando} (pode levar até 1 minuto)</p>}
      {resultado && (
        <article className={`p-painel ${resultado.erro ? 'p-painel--erro' : ''}`}>
          {resultado.erro ? <p><b>Erro:</b> {resultado.erro}</p> : resultado.buscas != null ? (
            <p><b>{resultado.qualificados} leads novos na fila</b> · {resultado.buscas} buscas · {resultado.paginas} páginas · {resultado.novos} negócios que ainda não estavam no painel</p>
          ) : <p><b>Chave funcionando.</b></p>}
        </article>
      )}

      <div className="p-dash">
        <div className="p-dash-col">
          <article className="p-painel">
            <header><h2>Buscar agora</h2></header>
            <form className="p-venda" onSubmit={rodarManual}>
              <label className="p-largo">O que buscar<input required value={manual.termo} onChange={(e) => setManual({ ...manual, termo: e.target.value })} placeholder="nail designer" /></label>
              <label>Nicho<select value={manual.nicho} onChange={(e) => setManual({ ...manual, nicho: e.target.value })}>{NICHOS.map((n) => <option key={n}>{n}</option>)}</select></label>
              <label>Mín. avaliações<input type="number" min="0" value={manual.min_avaliacoes} onChange={(e) => setManual({ ...manual, min_avaliacoes: e.target.value })} /></label>
              <label className="p-largo">Bairros (um por linha; vazio = cidade toda)<textarea rows={4} value={manual.bairros} onChange={(e) => setManual({ ...manual, bairros: e.target.value })} placeholder={'Moema\nPinheiros'} /></label>
              <label>Páginas por bairro<select value={manual.paginas} onChange={(e) => setManual({ ...manual, paginas: Number(e.target.value) })}><option value={1}>1 (20 negócios)</option><option value={2}>2 (40)</option><option value={3}>3 (60)</option></select></label>
              <div className="p-acoes"><button className="p-btn p-btn--forte" disabled={!st.google_conectado || !!rodando}>Buscar</button></div>
            </form>
          </article>

          <article className="p-painel">
            <header><h2>Bairros na rotação</h2><span>{bairros.split('\n').filter(Boolean).length}</span></header>
            <textarea className="p-texto" rows={8} value={bairros} onChange={(e) => setBairros(e.target.value)} aria-label="Bairros, um por linha" />
            <div className="p-acoes"><button className="p-btn" onClick={salvarBairros}>Salvar bairros</button></div>
          </article>
        </div>

        <div className="p-dash-col">
          <article className="p-painel">
            <header><h2>Termos</h2><span>quanto cada um rende</span></header>
            <div className="p-tabela-wrap"><table className="p-tabela">
              <thead><tr><th>Termo</th><th>Buscas</th><th>Bons</th><th>Rende</th><th /></tr></thead>
              <tbody>{termos.map((t) => (
                <tr key={t.id} className={t.ativo ? '' : 'p-off'}>
                  <td>{t.termo} <small>{t.nicho}</small></td><td>{t.buscas}</td><td>{t.qualificados}</td><td>{pct(t.taxa)}</td>
                  <td><button className="p-btn p-btn--fraco p-btn--mini" onClick={() => alternarTermo(t)}>{t.ativo ? 'Pausar' : 'Ativar'}</button></td>
                </tr>
              ))}</tbody>
            </table></div>
            <form className="p-ig-form" onSubmit={addTermo}>
              <input value={novoTermo.termo} onChange={(e) => setNovoTermo({ ...novoTermo, termo: e.target.value })} placeholder="Novo termo (ex.: lash designer)" aria-label="Novo termo" />
              <select className="p-select" value={novoTermo.nicho} onChange={(e) => setNovoTermo({ ...novoTermo, nicho: e.target.value })} aria-label="Nicho">{NICHOS.map((n) => <option key={n}>{n}</option>)}</select>
              <button className="p-btn">Adicionar</button>
            </form>
            <p className="p-meta">"Rende" é a parte dos negócios encontrados que não tem site ou usa link fraco. Quem rende mais ganha mais buscas no dia.</p>
          </article>

          <article className="p-painel">
            <header><h2>Últimas buscas</h2></header>
            {buscas.length === 0 ? <p className="p-meta">Nenhuma ainda.</p> : (
              <div className="p-tabela-wrap"><table className="p-tabela">
                <thead><tr><th>Quando</th><th>Busca</th><th>Pág.</th><th>Novos bons</th></tr></thead>
                <tbody>{buscas.map((b) => (
                  <tr key={b.id}>
                    <td>{dataCurta(b.feita_em)}</td>
                    <td>{b.termo}{b.bairro ? ` · ${b.bairro}` : ''} <small>{b.origem}</small>{b.erro && <small className="p-erro-txt"> {b.erro}</small>}</td>
                    <td>{b.paginas}</td><td>{b.origem === 'apify' ? '—' : b.qualificados}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
