import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { nichoSlug, nomeCurto, comArtigo } from '../lib/msg'
import { callFn, quandoHumano } from '../lib/fn'
import { Header, Footer, waVendas } from './Layout'
import { Celular } from './Telas'
import '../styles/previa.css'

// Qual demonstração mostrar para cada tipo de negócio
function demoDe(nicho, categoria = '', nome = '') {
  const t = `${categoria} ${nome}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const slug = nichoSlug(nicho, categoria)
  if (slug === 'estetica') return /unha|nail|manicure|esmalt/.test(t) ? 'nail' : 'estetica'
  if (slug === 'saude') return /nutri/.test(t) ? 'nutricionista' : /psic/.test(t) ? 'psicologa' : /academ|pilates|crossfit|fitness|treino/.test(t) ? 'academia' : 'estetica'
  return { odontologia: 'odontologia', barbearia: 'barbearia', pet: 'pet', tatuagem: 'tatuagem', alimentacao: 'hamburgueria' }[slug] || 'estetica'
}

// Página do link curto que vai na mensagem: /p/<nome>-<código>
// Uma prévia só, com o nome do negócio, e a resposta a um toque (sem catálogo, sem preço na cara)
export default function Previa() {
  const { codigo = '' } = useParams()
  const c = (codigo.match(/([0-9a-f]{8})$/i) || [])[1]?.toLowerCase()
  const [lead, setLead] = useState(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!c) { setErro(true); return }
    callFn('previa', { c }).then((r) => (r.ok && r.data?.ok ? setLead(r.data) : setErro(true))).catch(() => setErro(true))
  }, [c])

  const nome = lead ? nomeCurto(lead.nome) : ''
  const demo = lead ? demoDe(lead.nicho, lead.categoria, lead.nome) : 'estetica'
  const slug = lead ? nichoSlug(lead.nicho, lead.categoria) : 'geral'

  useEffect(() => {
    if (!lead) return
    document.title = `Prévia da página · ${nome}`
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex'
    document.head.appendChild(meta)
    const parar = quandoHumano(() => callFn('track', { r: lead.r, pagina: 'p', modelo: demo }).catch(() => {}))
    return () => { meta.remove(); parar() }
  }, [lead, nome, demo])

  if (erro) return <Navigate to="/m/geral" replace />
  if (!lead) return <main className="pv pv--carregando" aria-busy="true"><p>Carregando a prévia…</p></main>

  const n = encodeURIComponent(nome)
  // nota, avaliações e bairro de verdade dentro da prévia
  const extras = [lead.nota != null && `g=${lead.nota}`, lead.avaliacoes && `a=${lead.avaliacoes}`, lead.bairro && `b=${encodeURIComponent(lead.bairro)}`].filter(Boolean).join('&')
  const demoSrc = `/demo/${demo}?n=${n}${extras ? `&${extras}` : ''}`
  const verTela = `${demoSrc}&r=${lead.r}`
  const marcar = (o) => callFn('track', { r: lead.r, pagina: 'p', modelo: `resposta-${o}` }).catch(() => {})
  const de = comArtigo(nome, 'da')
  const respostas = [
    ['gostei', 'Gostei, pode montar', `Oi, Tavin! Vi a prévia ${de} e gostei. Pode montar!`],
    ['mudar', 'Quero mudar algumas coisas', `Oi! Vi a prévia ${de}. Queria mudar: `],
    ['preco', 'Quanto fica?', `Oi! Vi a prévia ${de}. Quanto fica?`],
  ]
  const nota = lead.nota != null ? String(lead.nota).replace('.', ',') : null

  return (
    <>
      <Header escuro />
      <main className="pv">
        <section className="pv-topo">
          <div className="s-wrap pv-grade">
            <div className="pv-texto">
              <p className="pv-para">Prévia feita para</p>
              <h1>{nome}</h1>
              {nota && <p className="pv-nota">★ {nota}{lead.avaliacoes ? ` · ${lead.avaliacoes} avaliações no Google` : ''}</p>}
              <p className="pv-sub">
                Montei esta página com o nome {de} para você ver como fica. Toque nos botões: eles funcionam de verdade, inclusive o agendamento pelo WhatsApp.
              </p>
              <a className="s-btn pv-cheia" href={verTela} target="_blank" rel="noreferrer" onClick={() => marcar('tela-cheia')}>Abrir a prévia em tela cheia</a>
            </div>
            <a className="pv-cel" href={verTela} target="_blank" rel="noreferrer" onClick={() => marcar('celular')} aria-label={`Abrir a prévia ${de} em tela cheia`}>
              <Celular src={demoSrc} vivo={false} titulo={`Prévia ${de}`} />
              <span className="pv-toque">Toque para abrir</span>
            </a>
          </div>
        </section>

        <section className="pv-resp" aria-labelledby="pv-resp-t">
          <div className="s-wrap">
            <h2 id="pv-resp-t">E aí, o que achou?</h2>
            <p>Responda com um toque, direto no WhatsApp:</p>
            <div className="pv-botoes">
              {respostas.map(([k, t, msg], i) => (
                <a key={k} className={`s-btn ${i ? 's-btn--linha' : ''}`} href={waVendas(msg)} target="_blank" rel="noreferrer" onClick={() => marcar(k)}>{t}</a>
              ))}
            </div>
            <ul className="pv-lista">
              <li>Com o nome, as cores, as fotos e os serviços {de}</li>
              <li>Agendamento direto no seu WhatsApp, avaliações do Google e mapa</li>
              <li>No ar em até 24 horas, e você só paga depois de aprovar</li>
            </ul>
            <p className="pv-mais"><a href={`/m/${slug}?n=${n}&r=${lead.r}`} onClick={() => marcar('outros')}>Prefere outro estilo? Ver outros modelos</a></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
