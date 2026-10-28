import { useEffect, useRef, useState } from 'react'
import { igHandle, formatTel, ehCelular } from '../lib/msg'
import { registrarEnvio, registrarEvento } from './api'
import { usePainel } from './Painel'
import { abrirCanal, dicaDm, etapaNoCanal, mensagemPara } from './envio'

// Intervalo mínimo entre envios: rajada rápida é o que faz Instagram e WhatsApp tratarem como spam
const INTERVALO = { instagram: 120, whatsapp: 60 }

// Modo rajada: um lead por vez. Enter copia o texto e abre a conversa, e o próximo já fica pronto.
export default function Rajada({ lista: listaAoVivo, canal, feitos, meta, onFeito, fechar }) {
  const { mensagens, avisar, abrirLead } = usePainel()
  const [i, setI] = useState(0)
  // A fila congela ao abrir: o painel atualiza sozinho e a ordem não pode mudar no meio da rajada
  const [base] = useState(listaAoVivo)
  const [saiu, setSaiu] = useState(() => new Set())
  const lista = base.filter((l) => !saiu.has(l.id))
  const tirar = (id) => setSaiu((s) => new Set(s).add(id))
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const dm = canal === 'instagram'
  const [liberaEm, setLiberaEm] = useState(0)
  const [agora, setAgora] = useState(Date.now())
  const falta = Math.max(0, Math.ceil((liberaEm - agora) / 1000))
  useEffect(() => {
    if (!falta) return
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [falta])
  const lead = lista[i]
  const etapa = etapaNoCanal('abertura', canal)
  const msg = lead ? mensagemPara(mensagens, lead, etapa) : null
  useEffect(() => { setTexto(msg?.texto || '') }, [lead?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const proximo = () => setI((n) => n + 1)

  async function enviar() {
    if (!lead || !texto || ocupado || falta) return
    abrirCanal(canal, lead, texto) // antes de qualquer await: o navegador só abre dentro do clique/tecla
    setOcupado(true)
    try {
      await registrarEnvio({ lead, mensagem: msg.modelo, etapa, texto, canal })
      setLiberaEm(Date.now() + INTERVALO[canal] * 1000); setAgora(Date.now())
      if (dm) avisar(dicaDm(lead))
      tirar(lead.id); onFeito(lead.id) // sai da lista: o próximo sobe para a mesma posição
    } catch { avisar('Abriu a conversa, mas não registrou. Tente de novo.') } finally { setOcupado(false) }
  }

  async function descartar() {
    if (!lead) return
    try { await registrarEvento(lead.id, 'perdeu', { motivo: 'descartado na rajada' }); tirar(lead.id); onFeito(lead.id, 'descartado') } catch { avisar('Não deu certo') }
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
          <textarea className="p-texto" rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="p-btn p-btn--forte p-btn--grande p-rajada-ir" onClick={enviar} disabled={ocupado || !texto || falta > 0}>
            {falta > 0 ? `Próximo em ${Math.floor(falta / 60)}:${String(falta % 60).padStart(2, '0')}` : <>{dm ? 'Copiar e abrir DM' : 'Abrir no WhatsApp'} <kbd>Enter</kbd></>}
          </button>
          {falta > 0 && <p className="p-meta">Espaçar os envios evita que {dm ? 'o Instagram esconda suas DMs' : 'o WhatsApp marque o número como spam'}. Use o tempo para curtir um post do próximo.</p>}
          <div className="p-acoes">
            <button className="p-btn" onClick={proximo}>Pular <kbd>S</kbd></button>
            <button className="p-btn p-btn--fraco" onClick={descartar}>Descartar <kbd>D</kbd></button>
          </div>
          {dm && <p className="p-meta">{ehCelular()
            ? 'Abre a conversa no app: segure, cole, envie e volte para cá. O próximo já está pronto.'
            : 'Abre o perfil numa aba só do Instagram: clique em "Enviar mensagem", cole (Ctrl+V), envie e volte para cá. O próximo já está pronto.'}</p>}
        </>
      )}
    </div>
  )
}
