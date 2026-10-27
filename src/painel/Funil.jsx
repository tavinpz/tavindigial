import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS, tempoAtras } from './api'
import { usePainel } from './Painel'

// Só quem precisa de você. Quem só recebeu a mensagem fica em Hoje (follow-ups).
const COLUNAS = ['abriu', 'respondeu', 'proposta', 'ganho', 'recorrente']

export default function Funil() {
  const { abrirLead } = usePainel()
  const [leads, setLeads] = useState(null)

  useEffect(() => {
    supabase
      .from('leads')
      .select('id,nome,status,bairro,tipo_site,updated_at,proximo_contato')
      .in('status', COLUNAS)
      .order('updated_at', { ascending: false })
      .limit(600)
      .then(({ data }) => setLeads(data || []))
  }, [])

  if (leads === null) return <p className="p-vazio">Carregando…</p>

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Conversas</h1>
          <p className="p-sub">Quem abriu a página, respondeu ou está fechando. Clique para registrar o próximo passo.</p>
        </div>
      </div>
      <div className="p-kanban">
        {COLUNAS.map((c) => {
          const daColuna = leads.filter((l) => l.status === c)
          return (
            <div key={c} className="p-coluna">
              <h2>{STATUS[c]} <span>{daColuna.length}</span></h2>
              {daColuna.slice(0, 80).map((l) => (
                <button key={l.id} className="p-mini" onClick={() => abrirLead(l.id)}>
                  <strong>{l.nome}</strong>
                  <small>{[l.bairro, `há ${tempoAtras(l.updated_at)}`].filter(Boolean).join(' · ')}</small>
                </button>
              ))}
              {daColuna.length === 0 && <p className="p-coluna-vazia">Ninguém aqui ainda.</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
