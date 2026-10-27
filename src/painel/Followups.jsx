import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CartaoEnvio from './CartaoEnvio'

const etapaDo = (l) => {
  if (l.status === 'proposta' || l.status === 'respondeu') return 'followup_proposta'
  if (l.status === 'ganho') return 'upsell_30d'
  return (l.total_envios || 0) <= 1 ? 'followup_1' : 'followup_2'
}

export default function Followups() {
  const [leads, setLeads] = useState(null)
  const [ocultos, setOcultos] = useState(() => new Set())

  useEffect(() => {
    supabase.from('v_followups').select('*').then(({ data }) => {
      // quem abriu a página e não respondeu vem primeiro
      const ord = (data || []).sort((a, b) => (b.status === 'abriu') - (a.status === 'abriu'))
      setLeads(ord)
    })
  }, [])

  if (leads === null) return <p className="p-vazio">Carregando…</p>
  const visiveis = leads.filter((l) => !ocultos.has(l.id))

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Follow-ups de hoje</h1>
          <p className="p-sub">2 dias depois da abertura, depois o último contato. Quem pediu preço e sumiu volta aqui em 2 dias. Quem abriu a página aparece primeiro.</p>
        </div>
        <div className="p-meta-dia"><strong>{visiveis.length}</strong><small>pendentes</small></div>
      </div>
      {visiveis.length === 0 ? (
        <div className="p-vazio"><p><strong>Nada pendente.</strong> Os follow-ups aparecem aqui sozinhos no dia certo.</p></div>
      ) : (
        <div className="p-lista">
          {visiveis.map((l) => (
            <CartaoEnvio key={l.id} lead={l} etapa={etapaDo(l)} mostrarStatus onFeito={(id) => setOcultos((s) => new Set(s).add(id))} />
          ))}
        </div>
      )}
    </section>
  )
}
