import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ETAPAS } from './api'
import { usePainel } from './Painel'

const PUBLICOS = { sem_site: 'Sem site', site_falso: 'Linktree / Instagram', todos: 'Todos' }

function Item({ m }) {
  const { recarregarMensagens, avisar } = usePainel()
  const [texto, setTexto] = useState(m.texto)
  const mudou = texto !== m.texto

  async function salvar() {
    await supabase.from('mensagens').update({ texto }).eq('id', m.id)
    avisar('Mensagem salva'); recarregarMensagens()
  }
  async function alternar() {
    await supabase.from('mensagens').update({ ativo: !m.ativo }).eq('id', m.id)
    recarregarMensagens()
  }
  async function duplicar() {
    const proxima = String.fromCharCode(m.variante.charCodeAt(0) + 1)
    await supabase.from('mensagens').insert({ etapa: m.etapa, variante: proxima, publico: m.publico, texto: m.texto })
    avisar(`Variante ${proxima} criada`); recarregarMensagens()
  }

  return (
    <article className={`p-cartao ${m.ativo ? '' : 'p-inativo'}`}>
      <div className="p-cartao-topo">
        <strong className="p-nome-fixo">Variante {m.variante}</strong>
        <span className="p-tag">{PUBLICOS[m.publico] || m.publico}</span>
        {!m.ativo && <span className="p-tag p-tag--alerta">Pausada</span>}
      </div>
      <textarea className="p-texto" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} />
      <div className="p-acoes">
        <button className="p-btn p-btn--forte" disabled={!mudou} onClick={salvar}>Salvar</button>
        <button className="p-btn" onClick={duplicar}>Criar variante</button>
        <button className="p-btn p-btn--fraco" onClick={alternar}>{m.ativo ? 'Pausar' : 'Ativar'}</button>
      </div>
    </article>
  )
}

export default function Mensagens() {
  const { mensagens } = usePainel()
  const etapas = Object.keys(ETAPAS).filter((e) => mensagens.some((m) => m.etapa === e))

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Mensagens</h1>
          <p className="p-sub">Variáveis: {'{negocio} {avaliacoes} {nota} {link} {link_avaliacao}'}. A variante que responde mais aparece em Métricas.</p>
        </div>
      </div>
      {etapas.map((e) => (
        <div key={e} className="p-grupo">
          <h2>{ETAPAS[e]}</h2>
          <div className="p-lista">{mensagens.filter((m) => m.etapa === e).map((m) => <Item key={m.id} m={m} />)}</div>
        </div>
      ))}
    </section>
  )
}
