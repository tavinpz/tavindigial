import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG } from '../config'
import { dataCurta } from './api'
import CartaoEnvio from './CartaoEnvio'

const coletaAtrasada = (iso) => !iso || Date.now() - new Date(iso).getTime() > 30 * 3600 * 1000

export default function Hoje() {
  const [leads, setLeads] = useState(null)
  const [feitos, setFeitos] = useState(0)
  const [ocultos, setOcultos] = useState(() => new Set())
  const [filtro, setFiltro] = useState('todos')
  const [erro, setErro] = useState('')
  const [resumo, setResumo] = useState(null)

  async function carregar() {
    setErro('')
    const { data, error } = await supabase.from('v_fila_hoje').select('*')
    if (error) { setErro(error.message); setLeads([]); return }
    setLeads(data || [])
    const { data: r } = await supabase.from('v_resumo').select('envios_hoje,fila,ultima_coleta,leads_24h').single()
    setResumo(r)
    setFeitos(r?.envios_hoje || 0)
  }
  useEffect(() => { carregar() }, [])

  const concluir = (id, modo) => {
    setOcultos((s) => new Set(s).add(id))
    if (!modo) setFeitos((n) => n + 1) // só conta envio de verdade (não pular nem descartar)
  }

  if (leads === null) return <p className="p-vazio">Carregando a fila…</p>

  const visiveis = leads.filter((l) => !ocultos.has(l.id) && (filtro === 'todos' || l.tipo_site === filtro))
  const pct = Math.min(100, Math.round((feitos / CONFIG.META_DIARIA) * 100))

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Quem chamar hoje</h1>
          <p className="p-sub">Os de maior chance primeiro: link fraco (Linktree, Instagram, app de agenda) e muitas avaliações no topo.</p>
        </div>
        <div className="p-meta-dia" aria-label={`${feitos} de ${CONFIG.META_DIARIA} envios hoje`}>
          <strong>{feitos}<span>/{CONFIG.META_DIARIA}</span></strong>
          <div className="p-barra"><div style={{ width: `${pct}%` }} /></div>
          <small>envios hoje</small>
        </div>
      </div>

      {resumo && (
        <p className={`p-coleta ${coletaAtrasada(resumo.ultima_coleta) ? 'p-coleta--alerta' : ''}`}>
          {resumo.ultima_coleta
            ? <>Última coleta: {dataCurta(resumo.ultima_coleta)} · {resumo.leads_24h} leads novos em 24h · {resumo.fila} números na fila.</>
            : <>Nenhuma coleta ainda.</>}
          {coletaAtrasada(resumo.ultima_coleta) && ' A coleta automática das 7h não trouxe nada há mais de 30 horas: abra o n8n e veja o erro.'}
        </p>
      )}

      <div className="p-filtros" role="group" aria-label="Filtrar fila">
        {[['todos', 'Todos'], ['site_falso', 'Link fraco'], ['sem_site', 'Sem site']].map(([v, n]) => (
          <button key={v} className={filtro === v ? 'ativa' : ''} onClick={() => setFiltro(v)}>{n}</button>
        ))}
        <button onClick={carregar}>Atualizar</button>
      </div>

      {erro && <p className="p-erro">{erro}</p>}
      {visiveis.length === 0 ? (
        <div className="p-vazio">
          <p><strong>Fila vazia.</strong> A coleta automática roda todo dia às 7h. Para buscar agora, use “Nova coleta de leads” no menu.</p>
        </div>
      ) : (
        <div className="p-lista">
          {visiveis.map((l) => <CartaoEnvio key={l.id} lead={l} etapa="abertura" onFeito={concluir} />)}
        </div>
      )}
    </section>
  )
}
