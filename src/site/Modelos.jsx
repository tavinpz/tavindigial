import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { modelosDoNicho, NOMES_NICHO } from '../data/modelos'
import { slugDominio, comArtigo } from '../lib/msg'
import { callFn, quandoHumano } from '../lib/fn'
import { Header, Footer, Dominio, Previa, waVendas } from './Layout'

// Página que vai no link da mensagem: /m/<nicho>?n=<nome do negócio>&r=<id do lead>
export default function Modelos() {
  const { nicho = 'geral' } = useParams()
  const [qs] = useSearchParams()
  const nome = (qs.get('n') || '').slice(0, 80)
  const r = qs.get('r') || ''
  const slug = NOMES_NICHO[nicho] ? nicho : 'geral'
  const modelos = useMemo(() => modelosDoNicho(slug), [slug])

  useEffect(() => {
    document.title = nome ? `Modelos para ${nome} · Tavin Digital` : 'Modelos de site · Tavin Digital'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    const parar = r ? quandoHumano(() => callFn('track', { r, pagina: `m/${slug}` }).catch(() => {})) : () => {}
    return () => { meta.remove(); parar() }
  }, [nome, r, slug])

  const aoVivo = (m) => {
    if (!m.url || !m.url.startsWith('/demo')) return m.url
    const q = new URLSearchParams()
    if (nome) q.set('n', nome)
    if (r) q.set('r', r)
    const qs2 = q.toString()
    return qs2 ? `${m.url}?${qs2}` : m.url
  }
  const quero = (m) => waVendas(`Oi! Vi os modelos e quero o ${m.titulo}${nome ? ` para ${comArtigo(nome)}` : ''}.`)
  const marcarClique = (m) => {
    if (r) callFn('track', { r, pagina: `m/${slug}`, modelo: m.id }).catch(() => {})
  }

  const dominio = `${slugDominio(nome)}.com.br`
  const briefing = `/briefing${r ? `?r=${encodeURIComponent(r)}` : ''}`

  return (
    <>
      <Header />
      <main>
        <section className="s-pers">
          <div className="s-wrap">
            {nome && <Dominio antes="linktr.ee/…" depois={dominio} />}
            <h1>{nome ? `Modelos de site para ${comArtigo(nome)}` : `Modelos de site para ${NOMES_NICHO[slug]}`}</h1>
            <p>
              Abra um modelo no celular. Eu coloco o nome, as cores e os serviços{nome ? ` ${comArtigo(nome, 'da')}` : ''} e deixo a página no ar em até {CONFIG.PRAZO_BIO_HORAS} horas,
              por {brl(CONFIG.PRECO_BIO)}. Você só paga se aprovar.
            </p>
          </div>
        </section>

        <section className="s-sec" style={{ borderTop: 0 }}>
          <div className="s-wrap">
            <div className="s-grade">
              {modelos.map((m) => (
                <article key={m.id} className="s-modelo">
                  <Previa modelo={m} nome={nome} />
                  <div className="info">
                    <h3>{m.titulo}</h3>
                    <span className="tipo">{m.tipo === 'bio' ? `Bio animada · ${brl(CONFIG.PRECO_BIO)}` : `Site completo · ${brl(CONFIG.PRECO_SITE)}`}</span>
                    <span className="tipo">{m.destaque}</span>
                    <div className="acoes">
                      {m.url && <a className="s-btn s-btn--linha" href={aoVivo(m)} target="_blank" rel="noreferrer">{nome && m.url.startsWith('/demo') ? `Ver com o nome da ${nome}` : 'Ver ao vivo'}</a>}
                      <a className="s-btn" href={quero(m)} onClick={() => marcarClique(m)} target="_blank" rel="noreferrer">Quero este modelo</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="s-garantia">
              <strong>Como funciona:</strong> você escolhe o modelo, manda as informações em 3 minutos e vê a prévia pronta.
              Paga 50% quando aprovar e 50% quando estiver no ar. Hospedagem e domínio: {brl(CONFIG.HOSPEDAGEM_BIO)}/mês, sem fidelidade.
              Quer mais seções e aparecer no Google? O site completo sai por {brl(CONFIG.PRECO_SITE)}.
            </p>
            <div className="s-acoes" style={{ marginTop: 24 }}>
              <Link className="s-btn" to={briefing}>Já quero começar</Link>
              <a className="s-btn s-btn--linha" href={waVendas(`Oi! Tenho uma dúvida sobre o site${nome ? ` ${comArtigo(nome, 'da')}` : ''}.`)} target="_blank" rel="noreferrer">
                Tirar uma dúvida
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
