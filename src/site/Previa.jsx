import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { nichoSlug, nomeCurto, comArtigo, slugDominio, waLink } from '../lib/msg'
import { callFn, quandoHumano } from '../lib/fn'
import { waVendas } from './Layout'
import Logo from './Logo'
import SitePrevia, { temaDe } from './SitePrevia'
import '../styles/previa.css'

// Página do link curto que vai na mensagem: /p/<nome>-<código>
// O lead vê a página DELE (nome, nota, avaliações e bairro do Google), e responde com um toque.
export default function Previa() {
  const { codigo = '' } = useParams()
  const c = (codigo.match(/([0-9a-f]{8})$/i) || [])[1]?.toLowerCase()
  const [lead, setLead] = useState(null)
  const [erro, setErro] = useState(false)
  const [toast, setToast] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    if (!c) { setErro(true); return }
    callFn('previa', { c }).then((r) => (r.ok && r.data?.ok ? setLead(r.data) : setErro(true))).catch(() => setErro(true))
  }, [c])

  const nome = lead ? nomeCurto(lead.nome) : ''
  const tema = lead ? temaDe(lead.nicho, lead.categoria, lead.nome) : 'geral'

  useEffect(() => {
    if (!lead) return
    document.title = `${nome} · prévia da página`
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex'
    document.head.appendChild(meta)
    const parar = quandoHumano(() => callFn('track', { r: lead.r, pagina: 'p', modelo: tema }).catch(() => {}))
    return () => { meta.remove(); parar() }
  }, [lead, nome, tema])

  if (erro) return <Navigate to="/m/geral" replace />
  if (!lead) return <main className="pv-carregando" aria-busy="true"><p>Carregando a prévia…</p></main>

  const marcar = (o) => callFn('track', { r: lead.r, pagina: 'p', modelo: `resposta-${o}` }).catch(() => {})
  const de = comArtigo(nome, 'da')
  const aviso = (o) => {
    setToast(`Na página de verdade, este botão ${o}.`)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 3600)
    marcar(`toque-${tema}`)
  }
  // a resposta vai para o mesmo WhatsApp que falou com o lead
  const para = (t) => (lead.wa ? waLink(lead.wa, t) : waVendas(t))
  const resp = {
    gostei: para(`Oi, Gustavo! Vi a prévia ${de} e gostei. Pode montar!`),
    preco: para(`Oi, Gustavo! Vi a prévia ${de}. Quanto fica?`),
    mudar: para(`Oi, Gustavo! Vi a prévia ${de}. Queria mudar: `),
  }
  const ig = lead.instagram ? String(lead.instagram).replace(/^@/, '') : ''
  const feito = [
    ['Nome', nome],
    lead.nota != null && ['Nota do Google', `${String(lead.nota).replace('.', ',')} de 5`],
    lead.avaliacoes && ['Avaliações', `${lead.avaliacoes} clientes`],
    (lead.endereco || lead.bairro) && ['Endereço no mapa', lead.bairro || 'Google Maps'],
    ig && ['Instagram', `@${ig}`],
    ['Endereço do site', `${slugDominio(nome)}.com.br`],
  ].filter(Boolean)
  const slug = nichoSlug(lead.nicho, lead.categoria)
  const n = encodeURIComponent(nome)

  return (
    <div className="pv2">
      <aside className="pv2-lado" aria-label="Sobre esta prévia">
        <a href="/" className="pv2-logo" aria-label="Tavin Digital"><Logo /></a>
        <p className="pv2-para">Prévia feita para</p>
        <h1>{nome}</h1>
        <p className="pv2-sub">Montei esta página para vocês com os dados reais do Google. Toque, escolha um serviço e um horário: é assim que o cliente vai agendar.</p>
        <div className="pv2-feito">
          <p>O que já está na página</p>
          <ul>{feito.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul>
        </div>
        <div className="pv2-botoes">
          <a className="pv2-btn" href={resp.gostei} target="_blank" rel="noreferrer" onClick={() => marcar('gostei')}>Gostei, pode montar</a>
          <a className="pv2-btn pv2-btn--linha" href={resp.mudar} target="_blank" rel="noreferrer" onClick={() => marcar('mudar')}>Quero mudar algumas coisas</a>
          <a className="pv2-btn pv2-btn--linha" href={resp.preco} target="_blank" rel="noreferrer" onClick={() => marcar('preco')}>Quanto fica?</a>
        </div>
        <p className="pv2-nota-fim">Com as suas fotos, cores e serviços, no ar em até 24 horas. Você só paga depois de aprovar.</p>
        <a className="pv2-outros" href={`/m/${slug}?n=${n}&r=${lead.r}`} onClick={() => marcar('outros')}>Prefere outro estilo? Ver outros modelos</a>
      </aside>

      <main className="pv2-palco">
        <div className="pv2-tela">
          <SitePrevia nome={nome} nicho={lead.nicho} categoria={lead.categoria} bairro={lead.bairro} cidade={lead.cidade} endereco={lead.endereco} instagram={lead.instagram} nota={lead.nota} avaliacoes={lead.avaliacoes} aviso={aviso} />
        </div>
      </main>

      <div className="pv2-barra" role="region" aria-label="Responder sobre a prévia">
        <p>Prévia {de}, feita por Gustavo · <b>Tavin Digital</b></p>
        <div>
          <a className="pv2-btn" href={resp.gostei} target="_blank" rel="noreferrer" onClick={() => marcar('gostei')}>Gostei, pode montar</a>
          <a className="pv2-btn pv2-btn--linha" href={resp.preco} target="_blank" rel="noreferrer" onClick={() => marcar('preco')}>Quanto fica?</a>
        </div>
      </div>

      <div className={`pv2-toast ${toast ? 'on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
