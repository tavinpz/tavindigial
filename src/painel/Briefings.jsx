import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { waLink, formatTel } from '../lib/msg'
import { dataCurta } from './api'
import { usePainel } from './Painel'

const ESTADOS = { novo: 'Novo', em_producao: 'Em produção', entregue: 'Entregue' }
const CAMPOS = [
  ['servicos', 'Serviços'], ['horarios', 'Horários'], ['endereco', 'Endereço'], ['diferenciais', 'Diferenciais'],
  ['cores', 'Cores'], ['modelo_escolhido', 'Modelo'], ['referencias', 'Referências'], ['instagram', 'Instagram'],
  ['email', 'E-mail'], ['observacoes', 'Observações'],
]

export default function Briefings() {
  const { abrirLead, avisar, versao } = usePainel()
  const [lista, setLista] = useState(null)
  const [aberto, setAberto] = useState(null)

  async function carregar() {
    const { data } = await supabase.from('briefings').select('*').order('created_at', { ascending: false }).limit(200)
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [versao])

  async function mudar(b, status) {
    await supabase.from('briefings').update({ status }).eq('id', b.id)
    avisar(`Marcado como ${ESTADOS[status].toLowerCase()}`)
    carregar()
  }

  if (lista === null) return <p className="p-vazio">Carregando…</p>

  return (
    <section>
      <div className="p-cab">
        <div><h1>Briefings</h1><p className="p-sub">Clientes que preencheram o formulário. Prazo de entrega: 48 h.</p></div>
      </div>
      {lista.length === 0 ? (
        <div className="p-vazio"><p>Nenhum formulário ainda. O link é <strong>/briefing</strong> no seu site.</p></div>
      ) : (
        <div className="p-lista">
          {lista.map((b) => {
            const horas = Math.round((Date.now() - new Date(b.created_at)) / 3600000)
            const atrasado = b.status !== 'entregue' && horas > 48
            return (
              <article key={b.id} className="p-cartao">
                <div className="p-cartao-topo">
                  <strong className="p-nome-fixo">{b.negocio}</strong>
                  <span className="p-tag">{b.produto === 'bio' ? 'Página de bio' : b.produto === 'site' ? 'Site' : 'Outro'}</span>
                  <span className={`p-tag ${atrasado ? 'p-tag--alerta' : ''}`}>{ESTADOS[b.status] || b.status}{atrasado ? ' · atrasado' : ''}</span>
                </div>
                <p className="p-meta">{b.responsavel} · {formatTel(b.whatsapp)} · {b.cidade || 'sem cidade'} · recebido {dataCurta(b.created_at)}</p>
                <div className="p-acoes p-acoes--quebra">
                  <a className="p-btn p-btn--forte" href={waLink(b.whatsapp, `Oi, ${b.responsavel.split(' ')[0]}! Recebi o formulário da ${b.negocio}. Pode me mandar o logo e as fotos por aqui?`)} target="_blank" rel="noreferrer">Pedir logo e fotos</a>
                  {Object.entries(ESTADOS).filter(([k]) => k !== b.status).map(([k, n]) => (
                    <button key={k} className="p-btn" onClick={() => mudar(b, k)}>{n}</button>
                  ))}
                  {b.lead_id && <button className="p-btn p-btn--fraco" onClick={() => abrirLead(b.lead_id)}>Ver lead</button>}
                  <button className="p-btn p-btn--fraco" onClick={() => setAberto(aberto === b.id ? null : b.id)}>{aberto === b.id ? 'Esconder' : 'Ver respostas'}</button>
                </div>
                {aberto === b.id && (
                  <dl className="p-respostas">
                    {CAMPOS.filter(([k]) => b[k]).map(([k, n]) => (<div key={k}><dt>{n}</dt><dd>{b[k]}</dd></div>))}
                  </dl>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
