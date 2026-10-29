import { useEffect, useRef, useState } from 'react'
import { igHandle, formatTel, ehCelular } from '../lib/msg'
import { registrarEnvio, registrarEvento, ETAPAS, tempoAtras } from './api'
import { usePainel } from './Painel'
import { DESTINOS_WA, abrirCanal, canalDe, dicaDm, etapaNoCanal, mensagemPara, outroDestino } from './envio'

// Espera entre um envio e outro (segundos). Mais rápido = mais risco de o número/conta ser marcado como spam.
const PADRAO = { abertura: { whatsapp: 20, instagram: 90 }, followup: { whatsapp: 10, instagram: 45 } }
const OPCOES = [0, 10, 20, 40, 60, 90, 120]
const chaveInt = (tipo, canal) => `rajada-int-${tipo}-${canal}`
const lerInt = (tipo, canal) => {
  try {
    const bruto = localStorage.getItem(chaveInt(tipo, canal))
    const v = Number(bruto)
    return bruto !== null && OPCOES.includes(v) ? v : PADRAO[tipo][canal]
  } catch { return PADRAO[tipo][canal] }
}

// Modo rajada: um lead por vez. Enter abre a conversa com o texto pronto e o próximo já fica na tela.
// Serve para a primeira mensagem (tipo 'abertura') e para follow-ups e respostas (tipo 'followup').
export default function Rajada({ lista: listaAoVivo, canal: canalFixo, etapaDe, tipo = 'abertura', titulo, feitos, meta, destino, onFeito, fechar, marcarResposta = false }) {
  const { mensagens, avisar, abrirLead } = usePainel()
  const [i, setI] = useState(0)
  // A fila congela ao abrir: o painel atualiza sozinho e a ordem não pode mudar no meio da rajada
  const [base] = useState(listaAoVivo)
  const [saiu, setSaiu] = useState(() => new Set())
  const lista = base.filter((l) => !saiu.has(l.id))
  const tirar = (id) => setSaiu((s) => new Set(s).add(id))
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [feitosAqui, setFeitosAqui] = useState(0)
  // depois do último, volta para os que foram pulados
  const idx = lista.length ? Math.min(i, lista.length - 1) : 0
  const lead = lista[idx]
  const canal = canalFixo || (lead ? canalDe(lead) : 'whatsapp')
  const dm = canal === 'instagram'
  const [intervalo, setIntervalo] = useState(() => lerInt(tipo, canal))
  useEffect(() => { setIntervalo(lerInt(tipo, canal)) }, [tipo, canal])
  const [liberaEm, setLiberaEm] = useState(0)
  const [agora, setAgora] = useState(Date.now())
  const falta = Math.max(0, Math.ceil((liberaEm - agora) / 1000))
  useEffect(() => {
    if (!falta) return
    const t = setInterval(() => setAgora(Date.now()), 500)
    return () => clearInterval(t)
  }, [falta])
  const etapa = lead ? etapaNoCanal(etapaDe ? etapaDe(lead) : 'abertura', canal) : 'abertura'
  const msg = lead ? mensagemPara(mensagens, lead, etapa) : null
  useEffect(() => { setTexto(msg?.texto || '') }, [lead?.id, etapa]) // eslint-disable-line react-hooks/exhaustive-deps

  const proximo = () => setI(() => (idx + 1 < lista.length ? idx + 1 : 0))
  const anterior = () => setI(() => Math.max(0, idx - 1))

  function mudarIntervalo(v) {
    setIntervalo(v)
    try { localStorage.setItem(chaveInt(tipo, canal), String(v)) } catch { /* sem storage */ }
    if (!v) setLiberaEm(0)
  }

  async function enviar(dest) {
    if (!lead || !texto || ocupado || falta) return
    abrirCanal(canal, lead, texto, dest) // antes de qualquer await: o navegador só abre dentro do clique/tecla
    setOcupado(true)
    try {
      await registrarEnvio({ lead, mensagem: msg.modelo, etapa, texto, canal })
      setLiberaEm(Date.now() + intervalo * 1000); setAgora(Date.now())
      setFeitosAqui((n) => n + 1)
      if (dm) avisar(dicaDm(lead))
      tirar(lead.id); onFeito(lead.id) // sai da lista: o próximo sobe para a mesma posição
    } catch { avisar('Abriu a conversa, mas não registrou. Tente de novo.') } finally { setOcupado(false) }
  }

  async function descartar() {
    if (!lead) return
    try { await registrarEvento(lead.id, 'perdeu', { motivo: 'descartado na rajada' }); tirar(lead.id); onFeito(lead.id, 'descartado') } catch { avisar('Não deu certo') }
  }

  async function respondeu() {
    if (!lead || !marcarResposta) return
    try {
      await registrarEvento(lead.id, 'respondeu', { origem: 'rajada', etapa })
      avisar(`${lead.nome} foi para "Responderam"`)
      tirar(lead.id); onFeito(lead.id, 'respondeu')
    } catch { avisar('Não deu certo') }
  }

  // Atalhos (fora da caixa de texto): Enter envia, L envia pelo outro WhatsApp, S pula, A volta, R respondeu, D descarta, Esc sai
  const acoes = useRef({})
  acoes.current = { enviar, outro: () => enviar(outroDestino(destino)), pular: proximo, voltar: anterior, respondeu, descartar, fechar }
  useEffect(() => {
    const tecla = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (e.key === 'Enter') { e.preventDefault(); acoes.current.enviar() }
      else if (k === 'l') acoes.current.outro()
      else if (k === 's' || e.key === 'ArrowRight') acoes.current.pular()
      else if (k === 'a' || e.key === 'ArrowLeft') acoes.current.voltar()
      else if (k === 'r') acoes.current.respondeu()
      else if (k === 'd') acoes.current.descartar()
      else if (e.key === 'Escape') acoes.current.fechar()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [])

  const total = meta ? feitos : feitosAqui
  const pct = meta ? Math.min(100, Math.round((feitos / meta) * 100)) : Math.round((feitosAqui / Math.max(1, base.length)) * 100)
  const celular = ehCelular()

  return (
    <div className="p-rajada" role="dialog" aria-label={titulo || 'Modo rajada'}>
      <div className="p-rajada-topo">
        <div>
          <strong>{titulo || `Rajada ${dm ? 'de DMs' : 'no WhatsApp'}`}</strong>
          <small>{meta ? `${total}/${meta} hoje` : `${feitosAqui} enviados`} · {lista.length} na fila{lista.length ? ` · ${idx + 1} de ${lista.length}` : ''}</small>
        </div>
        <label className="p-rajada-int">Espera
          <select value={intervalo} onChange={(e) => mudarIntervalo(Number(e.target.value))}>
            {OPCOES.map((v) => <option key={v} value={v}>{v ? `${v} s` : 'nenhuma'}</option>)}
          </select>
        </label>
        <button className="p-btn p-btn--fraco" onClick={fechar}>Sair <kbd>Esc</kbd></button>
      </div>
      <div className="p-barra"><div style={{ width: `${pct}%` }} /></div>

      {!lead ? (
        <p className="p-rajada-fim"><strong>Fila acabou.</strong> {meta && feitos >= meta ? 'Meta do dia batida.' : `${feitosAqui} enviados nesta rajada.`}</p>
      ) : (
        <>
          <button className="p-rajada-lead" onClick={() => abrirLead(lead.id)}>
            <b>{lead.nome}</b>
            <span>{dm ? `@${igHandle(lead.instagram)}` : formatTel(lead.whatsapp)} · {[lead.categoria, lead.bairro].filter(Boolean).join(' · ')}</span>
            <span className="p-rajada-etapa">
              {ETAPAS[etapa] || etapa}
              {lead.ultimo_envio ? ` · último envio há ${tempoAtras(lead.ultimo_envio)}` : ''}
              {lead.total_envios ? ` · ${lead.total_envios} ${lead.total_envios === 1 ? 'mensagem' : 'mensagens'} até agora` : ''}
            </span>
          </button>
          <textarea className="p-texto" rows={7} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div className="p-rajada-botoes">
            <button className="p-btn p-btn--forte p-btn--grande p-rajada-ir" onClick={() => enviar()} disabled={ocupado || !texto || falta > 0}>
              {falta > 0 ? `Próximo em ${falta} s` : <>{dm ? 'Copiar e abrir DM' : `Abrir no ${DESTINOS_WA[destino]}`} <kbd>Enter</kbd></>}
            </button>
            {!dm && !celular && (
              <button className="p-btn p-btn--grande" onClick={() => enviar(outroDestino(destino))} disabled={ocupado || !texto || falta > 0}>
                {DESTINOS_WA[outroDestino(destino)]} <kbd>L</kbd>
              </button>
            )}
          </div>
          <div className="p-acoes">
            <button className="p-btn" onClick={anterior} disabled={idx === 0}>Voltar <kbd>A</kbd></button>
            <button className="p-btn" onClick={proximo}>Pular <kbd>S</kbd></button>
            {marcarResposta && <button className="p-btn" onClick={respondeu}>Respondeu <kbd>R</kbd></button>}
            <button className="p-btn p-btn--fraco" onClick={descartar}>Descartar <kbd>D</kbd></button>
          </div>
          {!dm && !celular && destino === 'web' && (
            <p className="p-meta">Abre sempre na mesma aba "WhatsApp Web" do painel, com o texto pronto: dê Enter lá e volte aqui (Ctrl+Tab ou Cmd+Option+→). Deixe o painel e o WhatsApp lado a lado para ir mais rápido.</p>
          )}
          {dm && <p className="p-meta">{celular
            ? 'Abre a conversa no app: segure, cole, envie e volte para cá. O próximo já está pronto.'
            : 'Abre o perfil numa aba só do Instagram: clique em "Enviar mensagem", cole (Ctrl+V), envie e volte para cá. O próximo já está pronto.'}</p>}
        </>
      )}
    </div>
  )
}
