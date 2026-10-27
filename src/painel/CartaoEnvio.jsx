import { useEffect, useMemo, useState } from 'react'
import { preencher, varianteDe, formatTel, igPerfil } from '../lib/msg'
import { escolherMensagem, variantesDe, registrarEnvio, registrarEvento, linkMaps, ETAPAS, tempoAtras, STATUS } from './api'
import { usePainel } from './Painel'
import { abrirCanal, canalDe, etapaNoCanal } from './envio'

const hostDe = (site) => {
  if (!site) return ''
  try { return new URL(site.startsWith('http') ? site : `https://${site}`).hostname.replace(/^www\./, '') } catch { return '' }
}

// Um lead + a mensagem pronta + o botão que abre o WhatsApp e grava o envio
export default function CartaoEnvio({ lead, etapa: etapaBase, canal: canalPedido, onFeito, mostrarStatus = false }) {
  const { mensagens, abrirLead, avisar } = usePainel()
  const canal = canalPedido || canalDe(lead)
  const etapa = etapaNoCanal(etapaBase, canal)
  const dm = canal === 'instagram'
  const publico = lead.tipo_site === 'site_falso' ? 'site_falso' : 'sem_site'
  const variantes = variantesDe(mensagens, etapa, publico)
  // Cada lead cai sempre na mesma variante (A/B), a não ser que você troque na mão
  const preferida = varianteDe(lead.id)
  const [escolhida, setEscolhida] = useState(null)
  const variante = escolhida || (variantes.includes(preferida) ? preferida : variantes[0] || 'A')
  const modelo = useMemo(() => escolherMensagem(mensagens, etapa, publico, variante), [mensagens, etapa, publico, variante])
  const [texto, setTexto] = useState('')
  const [editado, setEditado] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  // Preenche (ou repreenche) o texto quando o modelo muda, sem apagar o que você editou
  useEffect(() => {
    if (!editado) setTexto(modelo ? preencher(modelo.texto, lead) : '')
  }, [modelo, lead, editado])

  const trocarVariante = (v) => { setEscolhida(v); setEditado(false) }

  const podeEnviar = dm ? !!lead.instagram : !!lead.whatsapp

  async function enviar() {
    if (!podeEnviar || !texto) return
    abrirCanal(canal, lead, texto)
    setOcupado(true)
    try {
      await registrarEnvio({ lead, mensagem: modelo, etapa, texto, canal })
      avisar(dm ? `Texto copiado. Cole na DM de ${lead.instagram}` : `Envio registrado: ${lead.nome}`)
      onFeito?.(lead.id)
    } catch {
      avisar(`Abriu o ${dm ? 'Instagram' : 'WhatsApp'}, mas não registrou o envio. Tente de novo.`)
    } finally {
      setOcupado(false)
    }
  }

  async function descartar() {
    setOcupado(true)
    try {
      await registrarEvento(lead.id, 'perdeu', { motivo: 'descartado no painel', etapa })
      onFeito?.(lead.id, 'descartado')
    } finally { setOcupado(false) }
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(texto); avisar('Texto copiado') } catch { avisar('Não deu para copiar') }
  }

  const maps = linkMaps(lead)
  const tag = lead.tipo_site !== 'site_falso' ? 'Sem site' : hostDe(lead.site_raw) || 'Link de bio'

  return (
    <article className="p-cartao">
      <div className="p-cartao-topo">
        <button className="p-nome" onClick={() => abrirLead(lead.id)}>{lead.nome}</button>
        <span className={`p-tag ${lead.tipo_site === 'site_falso' ? 'p-tag--falso' : ''}`}>{tag}</span>
        {lead.telefone_fixo && <span className="p-tag p-tag--alerta" title="Número fixo: confira se tem WhatsApp">Fixo</span>}
        {mostrarStatus && <span className="p-tag">{STATUS[lead.status]}</span>}
      </div>
      <p className="p-meta">
        {[lead.categoria, lead.bairro, lead.nota != null && `★ ${String(lead.nota).replace('.', ',')} (${lead.avaliacoes})`, dm ? null : formatTel(lead.whatsapp)]
          .filter(Boolean).join(' · ')}
        {lead.ultimo_envio && ` · último envio há ${tempoAtras(lead.ultimo_envio)}`}
      </p>
      <p className="p-links">
        {maps && <a href={maps} target="_blank" rel="noreferrer">Google Maps</a>}
        {lead.instagram && <a href={igPerfil(lead.instagram)} target="_blank" rel="noreferrer">{lead.instagram.startsWith('@') ? lead.instagram : `@${lead.instagram}`}</a>}
        {lead.site_raw && <a href={lead.site_raw.startsWith('http') ? lead.site_raw : `https://${lead.site_raw}`} target="_blank" rel="noreferrer">Link atual</a>}
      </p>

      <div className="p-msg-cab">
        <span>{ETAPAS[etapa] || etapa}</span>
        {variantes.length > 1 && (
          <div className="p-variantes" role="group" aria-label="Variante da mensagem">
            {variantes.map((v) => (
              <button key={v} className={v === variante ? 'ativa' : ''} onClick={() => trocarVariante(v)}>{v}</button>
            ))}
          </div>
        )}
      </div>
      {modelo ? (
        <textarea className="p-texto" value={texto} onChange={(e) => { setTexto(e.target.value); setEditado(true) }} rows={5} />
      ) : (
        <p className="p-erro">Nenhuma mensagem ativa para “{ETAPAS[etapa] || etapa}”. Crie em Mensagens.</p>
      )}

      <div className="p-acoes">
        <button className="p-btn p-btn--forte" onClick={enviar} disabled={ocupado || !podeEnviar || !texto}>{dm ? 'Copiar e abrir DM' : 'Enviar no WhatsApp'}</button>
        <button className="p-btn" onClick={copiar} disabled={!texto}>Copiar</button>
        <button className="p-btn p-btn--fraco" onClick={() => onFeito?.(lead.id, 'pular')}>Pular</button>
        <button className="p-btn p-btn--fraco" onClick={descartar} disabled={ocupado}>Descartar</button>
      </div>
    </article>
  )
}
