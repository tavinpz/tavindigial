import { useEffect, useRef, useState } from 'react'
import { igHandle, formatTel } from '../lib/msg'
import { registrarEnvio, registrarEvento } from './api'
import { usePainel } from './Painel'
import { abrirCanal, etapaNoCanal, mensagemPara } from './envio'

// Modo rajada: um lead por vez. Enter copia o texto e abre a conversa, e o próximo já fica pronto.
export default function Rajada({ lista, canal, feitos, meta, onFeito, fechar }) {
  const { mensagens, avisar, abrirLead } = usePainel()
  const [i, setI] = useState(0)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const dm = canal === 'instagram'
  const lead = lista[i]
  const etapa = etapaNoCanal('abertura', canal)
  const msg = lead ? mensagemPara(mensagens, lead, etapa) : null
  useEffect(() => { setTexto(msg?.texto || '') }, [lead?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const proximo = () => setI((n) => n + 1)

  async function enviar() {
    if (!lead || !texto || ocupado) return
    abrirCanal(canal, lead, texto) // antes de qualquer await: o navegador só abre dentro do clique/tecla
    setOcupado(true)
    try {
      await registrarEnvio({ lead, mensagem: msg.modelo, etapa, texto, canal })
      onFeito(lead.id) // sai da lista: o próximo sobe para a mesma posição
    } catch { avisar('Abriu a conversa, mas não registrou. Tente de novo.') } finally { setOcupado(false) }
  }

  async function descartar() {
    if (!lead) return
    try { await registrarEvento(lead.id, 'perdeu', { motivo: 'descartado na rajada' }); onFeito(lead.id, 'descartado') } catch { avisar('Não deu certo') }
  }

  // Atalhos: Enter envia, S pula, D descarta, Esc sai (fora da caixa de texto)
  const acoes = useRef({})
  acoes.current = { enviar, pular: proximo, descartar, fechar }
  useEffect(() => {
    const tecla = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return
      if (e.key === 'Enter') { e.preventDefault(); acoes.current.enviar() }
      else if (e.key === 's' || e.key === 'S') acoes.current.pular()
      else if (e.key === 'd' || e.key === 'D') acoes.current.descartar()
      else if (e.key === 'Escape') acoes.current.fechar()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [])

  const pct = Math.min(100, Math.round((feitos / meta) * 100))

  return (
    <div className="p-rajada" role="dialog" aria-label="Modo rajada">
      <div className="p-rajada-topo">
        <div>
          <strong>Rajada {dm ? 'de DMs' : 'no WhatsApp'}</strong>
          <small>{feitos}/{meta} hoje · {Math.max(0, lista.length - i)} na fila</small>
        </div>
        <button className="p-btn p-btn--fraco" onClick={fechar}>Sair</button>
      </div>
      <div className="p-barra"><div style={{ width: `${pct}%` }} /></div>

      {!lead ? (
        <p className="p-rajada-fim"><strong>Fila acabou.</strong> {feitos >= meta ? 'Meta do dia batida.' : 'Atualize a página para puxar mais.'}</p>
      ) : (
        <>
          <button className="p-rajada-lead" onClick={() => abrirLead(lead.id)}>
            <b>{lead.nome}</b>
            <span>{dm ? `@${igHandle(lead.instagram)}` : formatTel(lead.whatsapp)} · {[lead.categoria, lead.bairro].filter(Boolean).join(' · ')}</span>
          </button>
          <textarea className="p-texto" rows={5} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="p-btn p-btn--forte p-btn--grande p-rajada-ir" onClick={enviar} disabled={ocupado || !texto}>
            {dm ? 'Copiar e abrir DM' : 'Abrir no WhatsApp'} <kbd>Enter</kbd>
          </button>
          <div className="p-acoes">
            <button className="p-btn" onClick={proximo}>Pular <kbd>S</kbd></button>
            <button className="p-btn p-btn--fraco" onClick={descartar}>Descartar <kbd>D</kbd></button>
          </div>
          {dm && <p className="p-meta">Na DM: cola (Ctrl+V ou segurar e colar no celular), envia e volta para esta aba. O próximo já está pronto.</p>}
        </>
      )}
    </div>
  )
}
