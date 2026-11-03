import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { preencher } from '../lib/msg'
import { ETAPAS } from './api'
import { usePainel } from './Painel'

const PUBLICOS = { sem_site: 'Sem site', site_falso: 'Link fraco', todos: 'Todos' }

// A ordem do funil: quando cada mensagem é usada e onde ela aparece no painel
const GRUPOS = [
  { id: 'abertura', titulo: '1ª mensagem · WhatsApp', canal: 'whatsapp', etapas: ['abertura'],
    quando: 'No CRM, coluna "Chamar no WhatsApp": botões Web / App (ou arrastando para "Enviado"). Sem link: só uma pergunta para a pessoa responder.' },
  { id: 'dm', titulo: '1ª mensagem · Instagram', canal: 'instagram', etapas: ['abertura_dm'],
    quando: 'No CRM, coluna "Chamar no Instagram": botão "Copiar e abrir DM". Sem link na primeira mensagem.' },
  { id: 'followups', titulo: 'Follow-ups', canal: 'whatsapp', etapas: ['followup_1', 'followup_2', 'followup_proposta'],
    quando: 'No CRM, coluna "Enviado", grupo "Follow-up hoje": botões Web / App. O 1º sai 3 dias depois da 1ª mensagem; o último, 4 dias depois do 1º.' },
  { id: 'respostas', titulo: 'Respostas', canal: 'whatsapp', etapas: ['resp_link', 'resp_preco', 'resp_pensar', 'resp_ja_tenho', 'resp_sem_interesse'],
    quando: 'No CRM, botão "Respondeu" em qualquer card (na coluna "Respondeu": "Mandar link / responder"). Você escolhe o que ele respondeu e a versão A, B, C ou D.' },
  { id: 'venda', titulo: 'Depois da venda', canal: 'whatsapp', etapas: ['pos_venda', 'upsell_30d'],
    quando: 'Quando a página vai ao ar e 30 dias depois: pedir avaliação, indicação e oferecer o próximo serviço.' },
]

// Lead de exemplo para a prévia
const EXEMPLO = { id: 'exemplo', nome: 'Studio Rosé', nicho: 'estetica', avaliacoes: 128, nota: 4.9, site_raw: 'https://linktr.ee/studiorose' }

const VARIAVEIS = [
  ['{negocio}', 'nome do negócio'], ['{avaliacoes}', 'número de avaliações'], ['{nota}', 'nota no Google'],
  ['{destino}', 'para onde o link deles leva hoje'], ['{link}', 'página de modelos com o nome deles'], ['{link_avaliacao}', 'link para avaliar a Tavin'],
]

function Item({ m, canal }) {
  const { recarregarMensagens, avisar, mensagens } = usePainel()
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
    // próxima letra livre nesta etapa (A, B, C, D → E)
    const usadas = new Set(mensagens.filter((x) => x.etapa === m.etapa && x.publico === m.publico).map((x) => x.variante))
    let proxima = 'A'
    while (usadas.has(proxima)) proxima = String.fromCharCode(proxima.charCodeAt(0) + 1)
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

// Uma etapa: abas com as versões (A, B, C…) e um editor por vez
function Etapa({ etapa, itens, canal }) {
  const ordem = (m) => `${m.publico === 'site_falso' ? 0 : m.publico === 'sem_site' ? 1 : 2}${m.variante}`
  const lista = [...itens].sort((a, b) => ordem(a).localeCompare(ordem(b)))
  const [sel, setSel] = useState(lista[0]?.id)
  const atual = lista.find((m) => m.id === sel) || lista[0]
  return (
    <section className="mg-etapa">
      <div className="mg-etapa-cab">
        <h3>{ETAPAS[etapa] || etapa}</h3>
        <div className="mg-vers" role="tablist" aria-label={`Versões de ${ETAPAS[etapa] || etapa}`}>
          {lista.map((m) => (
            <button key={m.id} role="tab" aria-selected={atual?.id === m.id} className={`${atual?.id === m.id ? 'ativa' : ''} ${m.ativo ? '' : 'pausada'}`} onClick={() => setSel(m.id)}>
              {m.publico !== 'todos' ? `${PUBLICOS[m.publico]} ` : ''}{m.variante}
            </button>
          ))}
        </div>
      </div>
      {atual && <Item key={atual.id} m={atual} canal={canal} />}
    </section>
  )
}

export default function Mensagens() {
  const { mensagens } = usePainel()
  const [aba, setAba] = useState(() => { try { return localStorage.getItem('mg-aba') || 'respostas' } catch { return 'respostas' } })
  useEffect(() => { try { localStorage.setItem('mg-aba', aba) } catch { /* sem storage */ } }, [aba])
  const g = GRUPOS.find((x) => x.id === aba) || GRUPOS[0]
  const conta = (gr) => mensagens.filter((m) => gr.etapas.includes(m.etapa) && m.ativo).length

  return (
    <section className="p-msgs">
      <div className="p-cab">
        <div>
          <h1>Textos das mensagens</h1>
          <p className="p-sub">Escolha a etapa em cima e a versão (A, B, C…) ao lado do nome. A prévia mostra como chega para um negócio de exemplo.</p>
        </div>
      </div>

      <div className="mg-abas" role="tablist" aria-label="Etapas do funil">
        {GRUPOS.map((x) => (
          <button key={x.id} role="tab" aria-selected={aba === x.id} className={aba === x.id ? 'ativa' : ''} onClick={() => setAba(x.id)}>
            {x.titulo} <b>{conta(x)}</b>
          </button>
        ))}
      </div>

      <p className="mg-onde"><strong>Onde aparece:</strong> {g.quando}</p>

      {g.etapas.map((e) => {
        const itens = mensagens.filter((m) => m.etapa === e)
        return itens.length ? <Etapa key={e} etapa={e} itens={itens} canal={g.canal} /> : null
      })}

      <details className="p-vars-det">
        <summary>Variáveis que você pode usar no texto</summary>
        <div className="p-vars" aria-label="Variáveis">
          {VARIAVEIS.map(([v, d]) => <span key={v}><code>{v}</code> {d}</span>)}
        </div>
      </details>
    </section>
  )
}
