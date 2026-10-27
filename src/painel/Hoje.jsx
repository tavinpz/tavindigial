import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG } from '../config'
import { dataCurta } from './api'
import CartaoEnvio from './CartaoEnvio'
import { usePainel } from './Painel'

const coletaAtrasada = (iso) => !iso || Date.now() - new Date(iso).getTime() > 30 * 3600 * 1000

// Qual mensagem de follow-up cada lead recebe
const etapaDo = (l) => {
  if (l.status === 'proposta' || l.status === 'respondeu') return 'followup_proposta'
  if (l.status === 'ganho') return 'upsell_30d'
  return (l.total_envios || 0) <= 1 ? 'followup_1' : 'followup_2'
}

// Uma tela para o dia inteiro: primeiro os follow-ups, depois as primeiras mensagens
export default function Hoje() {
  const { irPara } = usePainel()
  const [dados, setDados] = useState(null)
  const [feitos, setFeitos] = useState(0)
  const [ocultos, setOcultos] = useState(() => new Set())
  const [filtro, setFiltro] = useState('todos')
  const [erro, setErro] = useState('')

  async function carregar() {
    setErro('')
    const [fila, follow, resumo, brief] = await Promise.all([
      supabase.from('v_fila_hoje').select('*'),
      supabase.from('v_followups').select('*'),
      supabase.from('v_resumo').select('envios_hoje,ultima_coleta,leads_24h').single(),
      supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
    ])
    if (fila.error) setErro(fila.error.message)
    // quem abriu a página e não respondeu vem primeiro
    const fups = (follow.data || []).sort((a, b) => (b.status === 'abriu') - (a.status === 'abriu'))
    setDados({ fila: fila.data || [], fups, resumo: resumo.data || {}, briefings: brief.count || 0 })
    setFeitos(resumo.data?.envios_hoje || 0)
    setOcultos(new Set())
  }
  useEffect(() => { carregar() }, [])

  const concluir = (id, modo) => {
    setOcultos((s) => new Set(s).add(id))
    if (!modo) setFeitos((n) => n + 1) // só conta envio de verdade (não pular nem descartar)
  }

  if (dados === null) return <p className="p-vazio">Carregando…</p>

  const { resumo } = dados
  const fups = dados.fups.filter((l) => !ocultos.has(l.id))
  const novos = dados.fila.filter((l) => !ocultos.has(l.id) && (filtro === 'todos' || l.tipo_site === filtro))
  const pct = Math.min(100, Math.round((feitos / CONFIG.META_DIARIA) * 100))
  const atrasada = coletaAtrasada(resumo.ultima_coleta)

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Hoje</h1>
          <p className={`p-coleta ${atrasada ? 'p-coleta--alerta' : ''}`}>
            {resumo.ultima_coleta
              ? `Última coleta ${dataCurta(resumo.ultima_coleta)}, ${resumo.leads_24h} leads novos em 24h.`
              : 'Nenhuma coleta ainda.'}
            {atrasada && ' A coleta das 7h não trouxe nada há mais de 30 horas: veja o erro no n8n.'}
          </p>
        </div>
        <div className="p-meta-dia" aria-label={`${feitos} de ${CONFIG.META_DIARIA} envios hoje`}>
          <strong>{feitos}<span>/{CONFIG.META_DIARIA}</span></strong>
          <div className="p-barra"><div style={{ width: `${pct}%` }} /></div>
          <small>envios hoje</small>
        </div>
      </div>

      {erro && <p className="p-erro">{erro}</p>}

      {dados.briefings > 0 && (
        <button className="p-aviso" onClick={() => irPara('briefings')}>
          {dados.briefings === 1 ? '1 cliente mandou o formulário.' : `${dados.briefings} clientes mandaram o formulário.`} Ver briefing
        </button>
      )}

      {fups.length > 0 && (
        <>
          <h2 className="p-h2">Follow-ups <span className="p-conta">{fups.length}</span></h2>
          <div className="p-lista">
            {fups.map((l) => <CartaoEnvio key={l.id} lead={l} etapa={etapaDo(l)} mostrarStatus onFeito={concluir} />)}
          </div>
        </>
      )}

      <div className="p-h2-linha">
        <h2 className="p-h2">Primeira mensagem <span className="p-conta">{novos.length}</span></h2>
        <div className="p-filtros" role="group" aria-label="Filtrar">
          {[['todos', 'Todos'], ['site_falso', 'Link fraco'], ['sem_site', 'Sem site']].map(([v, n]) => (
            <button key={v} className={filtro === v ? 'ativa' : ''} onClick={() => setFiltro(v)}>{n}</button>
          ))}
          <button onClick={carregar}>Atualizar</button>
        </div>
      </div>
      {novos.length === 0 ? (
        <div className="p-vazio"><p><strong>Fila vazia.</strong> A coleta roda sozinha todo dia às 7h. Para buscar agora, use “Nova coleta de leads” no menu.</p></div>
      ) : (
        <div className="p-lista">
          {novos.map((l) => <CartaoEnvio key={l.id} lead={l} etapa="abertura" onFeito={concluir} />)}
        </div>
      )}
    </section>
  )
}
