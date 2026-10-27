import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { preencher } from '../lib/msg'
import { ETAPAS } from './api'
import { usePainel } from './Painel'

const PUBLICOS = { sem_site: 'Sem site', site_falso: 'Link fraco', todos: 'Todos' }

// A ordem do funil: quando cada mensagem é usada
const GRUPOS = [
  { titulo: 'Primeira mensagem no WhatsApp', canal: 'whatsapp', etapas: ['abertura'],
    quando: 'Vai para quem nunca foi chamado. Metade dos leads recebe a A e metade a B; o Início mostra qual responde mais.' },
  { titulo: 'Primeira mensagem no Instagram', canal: 'instagram', etapas: ['abertura_dm'],
    quando: 'Vai na DM. Sem SAIR no fim: no Instagram a pessoa só ignora ou bloqueia.' },
  { titulo: 'Follow-ups', canal: 'whatsapp', etapas: ['followup_1', 'followup_2', 'followup_proposta'],
    quando: 'Aparecem sozinhos em Prospectar: o 1º dois dias depois da abertura, o 2º três dias depois do 1º. O de proposta, dois dias depois de quem pediu preço.' },
  { titulo: 'Respostas prontas', canal: 'whatsapp', etapas: ['resp_preco', 'resp_pensar', 'resp_ja_tenho'],
    quando: 'Você escolhe na ficha do lead quando ele responde.' },
  { titulo: 'Depois da venda', canal: 'whatsapp', etapas: ['pos_venda', 'upsell_30d'],
    quando: 'Quando a página vai ao ar e 30 dias depois, para pedir avaliação, indicação e oferecer o próximo serviço.' },
]

// Lead de exemplo para a prévia
const EXEMPLO = { id: 'exemplo', nome: 'Studio Rosé', nicho: 'estetica', avaliacoes: 128, nota: 4.9, site_raw: 'https://linktr.ee/studiorose' }

const VARIAVEIS = [
  ['{negocio}', 'nome do negócio'], ['{avaliacoes}', 'número de avaliações'], ['{nota}', 'nota no Google'],
  ['{destino}', 'para onde o link deles leva hoje'], ['{link}', 'página de modelos com o nome deles'], ['{link_avaliacao}', 'link para avaliar a Tavin'],
]

function Item({ m, canal }) {
  const { recarregarMensagens, avisar } = usePainel()
  const [texto, setTexto] = useState(m.texto)
  const mudou = texto !== m.texto
  const lead = m.publico === 'sem_site' ? { ...EXEMPLO, site_raw: null } : EXEMPLO
  const previa = preencher(texto, lead)

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
    <article className={`p-msg ${m.ativo ? '' : 'p-inativo'}`}>
      <header className="p-msg-topo">
        <strong>{ETAPAS[m.etapa] || m.etapa}</strong>
        {m.publico !== 'todos' && <span className="p-tag">{PUBLICOS[m.publico]}</span>}
        <span className="p-tag">Variante {m.variante}</span>
        {!m.ativo && <span className="p-tag p-tag--alerta">Pausada</span>}
      </header>
      <div className="p-msg-corpo">
        <label className="p-msg-editar">
          <span>Texto</span>
          <textarea className="p-texto" rows={Math.min(16, Math.max(5, texto.split('\n').length + 3))} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <small>{previa.length} caracteres</small>
        </label>
        <div className="p-msg-previa" aria-label="Como chega para o cliente">
          <span>Como chega no {canal === 'instagram' ? 'Instagram' : 'WhatsApp'}</span>
          <div className={`p-bolha p-bolha--${canal}`}>{previa}</div>
        </div>
      </div>
      <div className="p-acoes">
        <button className="p-btn p-btn--forte" disabled={!mudou} onClick={salvar}>Salvar</button>
        {mudou && <button className="p-btn p-btn--fraco" onClick={() => setTexto(m.texto)}>Desfazer</button>}
        <button className="p-btn" onClick={duplicar}>Criar variante</button>
        <button className="p-btn p-btn--fraco" onClick={alternar}>{m.ativo ? 'Pausar' : 'Ativar'}</button>
      </div>
    </article>
  )
}

export default function Mensagens() {
  const { mensagens } = usePainel()
  const ordem = (m) => `${m.publico === 'site_falso' ? 0 : m.publico === 'sem_site' ? 1 : 2}${m.variante}`

  return (
    <section className="p-msgs">
      <div className="p-cab">
        <div>
          <h1>Textos das mensagens</h1>
          <p className="p-sub">Na ordem do funil. A prévia ao lado mostra como a mensagem chega para um negócio de exemplo.</p>
        </div>
      </div>

      <div className="p-vars" aria-label="Variáveis">
        {VARIAVEIS.map(([v, d]) => <span key={v}><code>{v}</code> {d}</span>)}
      </div>

      {GRUPOS.map((g, i) => {
        const itens = mensagens.filter((m) => g.etapas.includes(m.etapa))
          .sort((a, b) => g.etapas.indexOf(a.etapa) - g.etapas.indexOf(b.etapa) || ordem(a).localeCompare(ordem(b)))
        if (!itens.length) return null
        return (
          <div key={g.titulo} className="p-grupo">
            <h2><span className="p-grupo-n">{i + 1}</span>{g.titulo}</h2>
            <p className="p-meta">{g.quando}</p>
            <div className="p-msg-lista">{itens.map((m) => <Item key={m.id} m={m} canal={g.canal} />)}</div>
          </div>
        )
      })}
    </section>
  )
}
