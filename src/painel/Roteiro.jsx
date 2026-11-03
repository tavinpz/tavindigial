import { useState } from 'react'
import { ehCelular } from '../lib/msg'
import { registrarEnvio, registrarEvento } from './api'
import { usePainel } from './Painel'
import { abrirCanal, mensagemPara } from './envio'

const FUSO = 'America/Sao_Paulo'
const dia = (iso) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' })

// O roteiro inteiro, na ordem: cada passo com o texto pronto, as versões e os botões
const PASSOS = [
  { n: '01', etapa: 'abertura', titulo: 'Mensagem 01 · primeira mensagem', quando: 'Para quem nunca foi chamado. Sem link: só uma pergunta.' },
  { n: '02', etapa: 'resp_link', titulo: 'Mensagem 02 · mandar o link', quando: 'Quando ele responder "pode mandar" ou "quero ver".', evento: 'respondeu' },
  { n: 'F1', etapa: 'followup_1', titulo: 'Follow-up 1', quando: '3 dias depois da mensagem 01, se não respondeu.' },
  { n: 'F2', etapa: 'followup_2', titulo: 'Follow-up 2 · último', quando: '4 dias depois do follow-up 1. Depois dele, encerra.' },
  { n: 'R', etapa: 'resp_preco', titulo: 'Resposta · perguntou o preço', quando: 'Quando ele perguntar quanto custa.', evento: 'pediu_preco' },
  { n: 'R', etapa: 'resp_pensar', titulo: 'Resposta · vai pensar', quando: 'Quando ele disser que vai pensar.', evento: 'respondeu' },
  { n: 'R', etapa: 'resp_ja_tenho', titulo: 'Resposta · já tem site', quando: 'Quando ele disser que já tem site.', evento: 'respondeu' },
  { n: 'R', etapa: 'resp_sem_interesse', titulo: 'Resposta · sem interesse', quando: 'Quando ele disser que não tem interesse ou disponibilidade. Uma resposta só, sem insistir; depois mova para Perdido.', evento: 'respondeu' },
  { n: 'P', etapa: 'followup_proposta', titulo: 'Follow-up da proposta', quando: '2 dias depois do link ou do preço, se não fechou.' },
  { n: 'V', etapa: 'pos_venda', titulo: 'Pós-venda', quando: 'Quando a página for ao ar: pedir avaliação e indicação.' },
  { n: 'V', etapa: 'upsell_30d', titulo: 'Upsell · 30 dias', quando: '30 dias depois da venda.' },
]

// Qual passo abrir primeiro, pelo momento do lead
function passoAtual(lead, enviados) {
  if (['novo', 'na_fila', 'arquivado'].includes(lead.status)) return 'abertura'
  if (lead.status === 'respondeu') return enviados.has('resp_link') ? 'followup_proposta' : 'resp_link'
  if (lead.status === 'proposta') return 'followup_proposta'
  if (lead.status === 'ganho' || lead.status === 'recorrente') return enviados.has('pos_venda') ? 'upsell_30d' : 'pos_venda'
  if (!enviados.has('followup_1')) return 'followup_1'
  return 'followup_2'
}

function Passo({ p, lead, envio, aberto, abrir, depois }) {
  const { mensagens, avisar } = usePainel()
  const dm = !lead.whatsapp && !!lead.instagram
  const etapa = p.etapa === 'abertura' && dm ? 'abertura_dm' : p.etapa
  const [variante, setVariante] = useState(null)
  const msg = mensagemPara(mensagens, lead, etapa, variante)
  const [editado, setEditado] = useState(null)
  const texto = editado ?? msg.texto
  const [ocupado, setOcupado] = useState(false)
  const celular = ehCelular()

  async function registrar(canal) {
    if (p.evento && (['novo', 'na_fila', 'enviado', 'abriu'].includes(lead.status) || p.evento === 'pediu_preco')) {
      await registrarEvento(lead.id, p.evento, { origem: 'ficha', etapa })
    }
    await registrarEnvio({ lead, mensagem: msg.modelo, etapa: canal === 'instagram' && p.etapa === 'abertura' ? 'abertura_dm' : etapa, texto, canal })
  }
  async function enviar(canal, destino) {
    if (!texto) return
    abrirCanal(canal, lead, texto, destino) // antes do await: o navegador só abre dentro do clique
    setOcupado(true)
    try { await registrar(canal); avisar(`${p.titulo.split(' · ')[0]} registrada`); depois() } catch { avisar('Abriu a conversa, mas não registrou. Tente de novo.') } finally { setOcupado(false) }
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(texto) } catch { avisar('Não consegui copiar'); return }
    setOcupado(true)
    try { await registrar(lead.whatsapp ? 'whatsapp' : 'instagram'); avisar('Copiado e registrado'); depois() } catch { avisar('Copiado, mas não registrou') } finally { setOcupado(false) }
  }

  return (
    <li className={`rt-passo ${aberto ? 'aberto' : ''} ${envio ? 'feito' : ''}`}>
      <button type="button" className="rt-cab" aria-expanded={aberto} onClick={() => abrir(aberto ? null : p.etapa)}>
        <span className="rt-n" aria-hidden="true">{envio ? '✓' : p.n}</span>
        <span className="rt-tit">
          <strong>{p.titulo}</strong>
          <small>{envio ? `Enviada em ${dia(envio.enviado_em)}${envio.canal === 'instagram' ? ' na DM' : ''}` : p.quando}</small>
        </span>
        <i aria-hidden="true">{aberto ? '−' : '+'}</i>
      </button>
      {aberto && (
        <div className="rt-corpo">
          {envio && <p className="rt-quando">{p.quando}</p>}
          {msg.variantes.length > 1 && (
            <div className="rp-var" role="group" aria-label="Versão">
              <span>Versão</span>
              {msg.variantes.map((v) => (
                <button key={v} type="button" aria-pressed={msg.variante === v} className={msg.variante === v ? 'ativa' : ''} onClick={() => { setVariante(v); setEditado(null) }}>{v}</button>
              ))}
            </div>
          )}
          {msg.modelo
            ? <textarea className="p-texto" rows={7} value={texto} onChange={(e) => setEditado(e.target.value)} aria-label={p.titulo} />
            : <p className="p-erro">Sem texto ativo para esta etapa. Crie em Textos das mensagens.</p>}
          <div className="rt-botoes">
            <button type="button" className="p-btn p-btn--forte" onClick={copiar} disabled={ocupado || !texto}>Copiar</button>
            {lead.whatsapp && !celular && <>
              <button type="button" className="p-btn" onClick={() => enviar('whatsapp', 'web')} disabled={ocupado || !texto}>Enviar no Web</button>
              <button type="button" className="p-btn" onClick={() => enviar('whatsapp', 'app')} disabled={ocupado || !texto}>Enviar no App</button>
            </>}
            {lead.whatsapp && celular && <button type="button" className="p-btn" onClick={() => enviar('whatsapp')} disabled={ocupado || !texto}>Abrir WhatsApp</button>}
            {lead.instagram && <button type="button" className="p-btn" onClick={() => enviar('instagram')} disabled={ocupado || !texto}>Copiar e abrir DM</button>}
          </div>
        </div>
      )}
    </li>
  )
}

export default function Roteiro({ lead, envios, depois }) {
  const ultimo = {}
  for (const e of envios) if (!ultimo[e.etapa] || e.enviado_em > ultimo[e.etapa].enviado_em) ultimo[e.etapa] = e
  if (ultimo.abertura_dm && !ultimo.abertura) ultimo.abertura = ultimo.abertura_dm
  const feitos = new Set(Object.keys(ultimo))
  const [aberto, abrir] = useState(() => passoAtual(lead, feitos))
  return (
    <section className="rt">
      <h3>Roteiro <small>clique num passo para ver o texto · copiar ou enviar já registra</small></h3>
      <ol className="rt-lista">
        {PASSOS.map((p) => <Passo key={p.etapa} p={p} lead={lead} envio={ultimo[p.etapa]} aberto={aberto === p.etapa} abrir={abrir} depois={depois} />)}
      </ol>
    </section>
  )
}
