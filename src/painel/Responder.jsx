import { useEffect, useState } from 'react'
import { formatTel, igHandle, ehCelular } from '../lib/msg'
import { registrarEnvio, registrarEvento } from './api'
import { usePainel } from './Painel'
import { abrirCanal, mensagemPara } from './envio'

// O que o lead respondeu → qual mensagem vai de volta
const RESPOSTAS = [
  ['resp_link', 'Pediu o link', 'respondeu'],
  ['resp_preco', 'Perguntou o preço', 'pediu_preco'],
  ['resp_pensar', 'Vai pensar', 'respondeu'],
  ['resp_ja_tenho', 'Já tem site', 'respondeu'],
]

// Janela de resposta: escolhe o tipo de resposta, mostra o texto pronto (com o link dele) para copiar ou enviar
export default function Responder({ lead, canal: canalPedido, inicial = 'resp_link', fechar, depois }) {
  const { mensagens, avisar } = usePainel()
  const canal = canalPedido || (lead.whatsapp ? 'whatsapp' : 'instagram')
  const [tipo, setTipo] = useState(inicial)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [variante, setVariante] = useState(null)
  const msg = mensagemPara(mensagens, lead, tipo, variante)
  useEffect(() => { setVariante(null) }, [tipo])
  useEffect(() => { setTexto(msg.texto || '') }, [tipo, lead.id, msg.variante]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') fechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [fechar])

  async function registrar() {
    const ev = RESPOSTAS.find(([k]) => k === tipo)[2]
    if (['enviado', 'abriu', 'novo', 'na_fila'].includes(lead.status) || ev === 'pediu_preco') await registrarEvento(lead.id, ev, { origem: 'crm', etapa: tipo })
    await registrarEnvio({ lead, mensagem: msg.modelo, etapa: tipo, texto, canal })
  }

  async function enviar(destino) {
    if (!texto) return
    abrirCanal(canal, lead, texto, destino) // antes do await: o navegador só abre dentro do clique
    setOcupado(true)
    try { await registrar(); avisar(`Resposta registrada: ${lead.nome}`); depois?.(); fechar() } catch { avisar('Abriu a conversa, mas não registrou. Tente de novo.') } finally { setOcupado(false) }
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(texto) } catch { avisar('Não consegui copiar'); return }
    setOcupado(true)
    try { await registrar(); avisar('Copiado e registrado. É só colar na conversa.'); depois?.(); fechar() } catch { avisar('Copiado, mas não registrou.') } finally { setOcupado(false) }
  }

  const celular = ehCelular()
  return (
    <div className="rp-fundo" onClick={fechar}>
      <div className="rp" role="dialog" aria-label={`Responder ${lead.nome}`} onClick={(e) => e.stopPropagation()}>
        <div className="rp-topo">
          <div>
            <strong>{lead.nome}</strong>
            <small>{canal === 'instagram' ? `@${igHandle(lead.instagram)}` : formatTel(lead.whatsapp)}</small>
          </div>
          <button type="button" className="p-btn p-btn--fraco p-btn--mini" onClick={fechar}>Fechar</button>
        </div>
        <p className="rp-pergunta">O que ele respondeu?</p>
        <div className="rp-tipos" role="radiogroup" aria-label="Tipo de resposta">
          {RESPOSTAS.map(([k, t]) => (
            <button key={k} type="button" role="radio" aria-checked={tipo === k} className={tipo === k ? 'ativa' : ''} onClick={() => setTipo(k)}>{t}</button>
          ))}
        </div>
        {msg.variantes.length > 1 && (
          <div className="rp-var" role="group" aria-label="Versão da mensagem">
            <span>Versão</span>
            {msg.variantes.map((v) => (
              <button key={v} type="button" aria-pressed={msg.variante === v} className={msg.variante === v ? 'ativa' : ''} onClick={() => setVariante(v)}>{v}</button>
            ))}
          </div>
        )}
        {msg.modelo ? (
          <textarea className="p-texto rp-texto" rows={9} value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Mensagem de resposta" />
        ) : (
          <p className="p-erro">Não há texto ativo para essa resposta. Crie em Textos das mensagens.</p>
        )}
        <div className="rp-acoes">
          <button type="button" className="p-btn p-btn--forte" onClick={copiar} disabled={ocupado || !texto}>Copiar</button>
          {canal === 'whatsapp' && !celular && <>
            <button type="button" className="p-btn" onClick={() => enviar('web')} disabled={ocupado || !texto}>Enviar no Web</button>
            <button type="button" className="p-btn" onClick={() => enviar('app')} disabled={ocupado || !texto}>Enviar no App</button>
          </>}
          {(canal === 'instagram' || celular) && <button type="button" className="p-btn" onClick={() => enviar()} disabled={ocupado || !texto}>{canal === 'instagram' ? 'Copiar e abrir DM' : 'Abrir WhatsApp'}</button>}
        </div>
        <p className="p-meta">Copiar ou enviar já registra a resposta e o lead vai para "Respondeu".</p>
      </div>
    </div>
  )
}
