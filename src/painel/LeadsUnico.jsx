import { useState } from 'react'
import Prospectar from './Prospectar'
import Leads from './Leads'

// Prospectar e a lista de leads numa página só (um item no menu), trocando por uma chave no topo.
export default function LeadsUnico() {
  const [aba, setAba] = useState(() => { try { return localStorage.getItem('p-leads-aba') || 'prospectar' } catch { return 'prospectar' } })
  const trocar = (a) => { setAba(a); try { localStorage.setItem('p-leads-aba', a) } catch { /* sem storage */ } }
  return (
    <>
      <div className="lu-troca" role="tablist" aria-label="Leads">
        <button type="button" role="tab" aria-selected={aba === 'prospectar'} className={aba === 'prospectar' ? 'on' : ''} onClick={() => trocar('prospectar')}>Prospectar</button>
        <button type="button" role="tab" aria-selected={aba === 'lista'} className={aba === 'lista' ? 'on' : ''} onClick={() => trocar('lista')}>Todos os leads</button>
      </div>
      {aba === 'prospectar' ? <Prospectar /> : <Leads />}
    </>
  )
}
