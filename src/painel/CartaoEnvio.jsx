import { useMemo, useState } from 'react'
import { preencher, waLink, varianteDe, formatTel } from '../lib/msg'
import { escolherMensagem, variantesDe, registrarEnvio, registrarEvento, linkMaps, ETAPAS, tempoAtras, STATUS } from './api'
import { usePainel } from './Painel'

const hostDe = (site) => {
  if (!site) return ''
  try { return new URL(site.startsWith('http') ? site : `https://${site}`).hostname.replace(/^www\./, '') } catch { return '' }
}

// Um lead + a mensagem pronta + o botão que abre o WhatsApp e grava o envio
export default function CartaoEnvio({ lead, etapa, onFeito, mostrarStatus = false }) {
  const { mensagens, abrirLead, avisar } = usePainel()
  const publico = lead.tipo_site === 'site_falso' ? 'site_falso' : 'sem_site'
  const variantes = variantesDe(mensagens, etapa, publico)
  const [variante, setVariante] = useState(() => {
    const v = varianteDe(lead.id)
    return variantes.includes(v) ? v : variantes[0] || 'A'
  })
  const modelo = useMemo(() => escolherMensagem(mensagens, etapa, publico, variante), [mensagens, etapa, publico, variante])
  const [texto, setTexto] = useState(() => (modelo ? preencher(modelo.texto, lead) : ''))
  const [ocupado, setOcupado] = useState(false)

  const trocarVariante = (v) => {
    setVariante(v)
    const m = escolherMensagem(mensagens, etapa, publico, v)
    if (m) setTexto(preencher(m.texto, lead))
  }

  async function enviar() {
    if (!lead.whatsapp || !texto) return
    window.open(waLink(lead.whatsapp, texto), '_blank', 'noopener')
    setOcupado(true)
    try {
      await registrarEnvio({ lead, mensagem: modelo, etapa, texto })
      avisar(`Envio registrado: ${lead.nome}`)
      onFeito?.(lead.id)
    } catch {
      avisar('Abriu o WhatsApp, mas não registrou o envio. Tente de novo.')
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
        {[lead.categoria, lead.bairro, lead.nota != null && `★ ${String(lead.nota).replace('.', ',')} (${lead.avaliacoes})`, formatTel(lead.whatsapp)]
          .filter(Boolean).join(' · ')}
        {lead.ultimo_envio && ` · último envio há ${tempoAtras(lead.ultimo_envio)}`}
      </p>
      <p className="p-links">
        {maps && <a href={maps} target="_blank" rel="noreferrer">Google Maps</a>}
        {lead.instagram && <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">Instagram</a>}
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
        <textarea className="p-texto" value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} />
      ) : (
        <p className="p-erro">Nenhuma mensagem ativa para “{ETAPAS[etapa] || etapa}”. Crie em Mensagens.</p>
      )}

      <div className="p-acoes">
        <button className="p-btn p-btn--forte" onClick={enviar} disabled={ocupado || !lead.whatsapp || !texto}>Enviar no WhatsApp</button>
        <button className="p-btn" onClick={copiar} disabled={!texto}>Copiar</button>
        <button className="p-btn p-btn--fraco" onClick={() => onFeito?.(lead.id, 'pular')}>Pular</button>
        <button className="p-btn p-btn--fraco" onClick={descartar} disabled={ocupado}>Descartar</button>
      </div>
    </article>
  )
}
