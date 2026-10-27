import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG } from '../config'
import { enviosHoje } from './api'
import CartaoEnvio from './CartaoEnvio'

export default function Hoje() {
  const [leads, setLeads] = useState(null)
  const [feitos, setFeitos] = useState(0)
  const [ocultos, setOcultos] = useState(() => new Set())
  const [filtro, setFiltro] = useState('todos')
  const [erro, setErro] = useState('')

  async function carregar() {
    setErro('')
    const { data, error } = await supabase.from('v_fila_hoje').select('*')
    if (error) { setErro(error.message); setLeads([]); return }
    setLeads(data || [])
    setFeitos(await enviosHoje())
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
          <p className="p-sub">Os de maior chance primeiro: Linktree e muitas avaliações no topo.</p>
        </div>
        <div className="p-meta-dia" aria-label={`${feitos} de ${CONFIG.META_DIARIA} envios hoje`}>
          <strong>{feitos}<span>/{CONFIG.META_DIARIA}</span></strong>
          <div className="p-barra"><div style={{ width: `${pct}%` }} /></div>
          <small>envios hoje</small>
        </div>
      </div>

      <div className="p-filtros" role="group" aria-label="Filtrar fila">
        {[['todos', 'Todos'], ['site_falso', 'Linktree / Instagram'], ['sem_site', 'Sem site']].map(([v, n]) => (
          <button key={v} className={filtro === v ? 'ativa' : ''} onClick={() => setFiltro(v)}>{n}</button>
        ))}
        <button onClick={carregar}>Atualizar</button>
      </div>

      {erro && <p className="p-erro">{erro}</p>}
      {visiveis.length === 0 ? (
        <div className="p-vazio">
          <p><strong>Fila vazia.</strong> Rode a coleta no n8n (nicho + cidade) para trazer novos leads.</p>
        </div>
      ) : (
        <div className="p-lista">
          {visiveis.map((l) => <CartaoEnvio key={l.id} lead={l} etapa="abertura" onFeito={concluir} />)}
        </div>
      )}
    </section>
  )
}
