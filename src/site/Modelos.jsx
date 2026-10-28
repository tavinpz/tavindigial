import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { MODELOS, modelosDoNicho, NOMES_NICHO } from '../data/modelos'
import { SITES, ORDEM_SITES, RESUMO_SITES } from '../data/sites'
import { slugDominio, comArtigo } from '../lib/msg'
import { callFn, quandoHumano } from '../lib/fn'
import { Header, Footer, Dominio, waVendas } from './Layout'
import { Celular, Navegador } from './Telas'

// Qual site completo aparece primeiro para cada nicho
const RESUMO = RESUMO_SITES
const SITE_DO_NICHO = { estetica: 'estetica', odontologia: 'odontologia', barbearia: 'barbearia', pet: 'pet', saude: 'estetica', tatuagem: 'barbearia', alimentacao: 'barbearia', geral: 'barbearia' }

// Página que vai no link da mensagem: /m/<nicho>?n=<nome do negócio>&r=<id do lead>
export default function Modelos() {
  const { nicho = 'geral' } = useParams()
  const [qs] = useSearchParams()
  const nome = (qs.get('n') || '').slice(0, 80)
  const r = qs.get('r') || ''
  const slug = NOMES_NICHO[nicho] ? nicho : 'geral'
  // bios do nicho primeiro, depois as outras
  const bios = useMemo(() => {
    const todas = MODELOS.filter((m) => m.tipo === 'bio' && m.url)
    const doNicho = modelosDoNicho(slug).filter((m) => m.tipo === 'bio' && m.url)
    return [...doNicho, ...todas.filter((m) => !doNicho.includes(m))]
  }, [slug])
  const principal = SITE_DO_NICHO[slug] || 'barbearia'
  const sites = [principal, ...ORDEM_SITES.filter((s) => s !== principal)].map((id) => SITES[id])

  useEffect(() => {
    document.title = nome ? `Modelos para ${nome} · Tavin Digital` : 'Modelos de site · Tavin Digital'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    const parar = r ? quandoHumano(() => callFn('track', { r, pagina: `m/${slug}` }).catch(() => {})) : () => {}
    return () => { meta.remove(); parar() }
  }, [nome, r, slug])

  // previa: só o nome (sem rastreio). abrir: nome + rastreio do lead
  const url = (base, rastrear) => {
    const q = new URLSearchParams()
    if (nome) q.set('n', nome)
    if (rastrear && r) q.set('r', r)
    const s = q.toString()
    return s ? `${base}?${s}` : base
  }
  const marcar = (modelo) => { if (r) callFn('track', { r, pagina: `m/${slug}`, modelo }).catch(() => {}) }
  const quero = (titulo, tipo) => waVendas(`Oi! Vi os modelos e quero ${tipo === 'site' ? 'o site' : 'a página'} ${titulo}${nome ? ` para ${comArtigo(nome)}` : ''}.`)
  const dominio = nome ? `${slugDominio(nome)}.com.br` : null
  const briefing = `/briefing${r ? `?r=${encodeURIComponent(r)}` : ''}`
  const [destaque, ...outros] = sites
  // no computador o celular da prévia é mexível; no celular, mexer nele prenderia a rolagem da página
  const mexivel = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (min-width: 721px)').matches
  const titulo = (s) => (nome ? `Modelo ${s.curto}` : s.nome)
  const dominioDe = (s) => `${slugDominio(nome || s.nome)}.com.br`

  return (
    <>
      <Header escuro />
      <main className="mv">
        <section className="mv-topo">
          <div className="s-wrap">
            {nome ? <p className="mv-para">Separei estes modelos para</p> : <p className="mv-para">Modelos para {NOMES_NICHO[slug]}</p>}
            <h1>{nome || 'Escolha o seu site'}</h1>
            <p className="mv-sub">
              Os modelos abaixo funcionam de verdade: toque, role e teste a agenda. Eu monto o seu com nome, cores, fotos e serviços{nome ? ` ${comArtigo(nome, 'da')}` : ''}, e você só paga depois de aprovar.
            </p>
            {dominio && <Dominio antes="linktr.ee/…" depois={dominio} />}
            <nav className="mv-atalhos" aria-label="Tipos de modelo">
              <a href="#sites">Site completo · {brl(CONFIG.PRECO_SITE)}</a>
              <a href="#bios">Página para a bio · {brl(CONFIG.PRECO_BIO)}</a>
            </nav>
          </div>
        </section>

        <section className="mv-sec" id="sites">
          <div className="s-wrap">
            <article className="mv-destaque">
              <div className="mv-palco">
                <Navegador className="mv-palco-nav" src={url(`/site/${destaque.id}`, false)} dominio={dominioDe(destaque)} titulo={`Site ${destaque.nome} no computador`} />
                <Celular className="mv-palco-cel" vivo={mexivel} src={url(`/site/${destaque.id}`, false)} titulo={`Site ${destaque.nome} no celular`} />
              </div>
              <div className="mv-destaque-info">
                <p className="mv-preco">Site completo por {brl(CONFIG.PRECO_SITE)}, no ar em até {CONFIG.PRAZO_HORAS} horas</p>
                <h3>{titulo(destaque)}</h3>
                <p>{RESUMO[destaque.id]}</p>
                <ul>
                  <li>O cliente escolhe serviço, dia e horário, e o pedido chega pronto no seu WhatsApp</li>
                  <li>Mostra se está aberto agora, com o horário da semana</li>
                  <li>Preços, fotos, avaliações do Google e mapa</li>
                </ul>
                {mexivel && <p className="mv-dica">Role a tela do celular ao lado para ver o site inteiro.</p>}
                <div className="mv-acoes">
                  <a className="s-btn" href={url(`/site/${destaque.id}`, true)} target="_blank" rel="noreferrer" onClick={() => marcar(`site-${destaque.id}`)}>
                    {nome ? `Abrir com o nome ${comArtigo(nome, 'da')}` : 'Abrir o site'}
                  </a>
                  <a className="s-btn s-btn--linha" href={quero(destaque.nome, 'site')} target="_blank" rel="noreferrer" onClick={() => marcar(`site-${destaque.id}-quero`)}>Quero este</a>
                </div>
              </div>
            </article>

            <div className="mv-outros">
              {outros.map((s) => (
                <article key={s.id} className="mv-site">
                  <a href={url(`/site/${s.id}`, true)} target="_blank" rel="noreferrer" onClick={() => marcar(`site-${s.id}`)} aria-label={`Abrir o site ${s.nome}`}>
                    <Navegador src={url(`/site/${s.id}`, false)} dominio={dominioDe(s)} titulo={`Site ${s.nome}`} />
                  </a>
                  <div className="mv-site-info">
                    <div><h3>{titulo(s)}</h3><p>{RESUMO[s.id]}</p></div>
                    <a className="mv-link" href={url(`/site/${s.id}`, true)} target="_blank" rel="noreferrer" onClick={() => marcar(`site-${s.id}`)}>Abrir o site</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mv-sec mv-sec--bios" id="bios">
          <div className="s-wrap">
            <header className="mv-cab">
              <h2>Página para o link da bio</h2>
              <p>Uma página só, animada, para colocar no Instagram e no Google no lugar do Linktree. {brl(CONFIG.PRECO_BIO)}, no ar em até {CONFIG.PRAZO_BIO_HORAS} horas.</p>
            </header>
            <div className="mv-bios">
              {bios.map((m) => (
                <a key={m.id} className="mv-bio" href={url(m.url, true)} target="_blank" rel="noreferrer" onClick={() => marcar(m.id)}>
                  <span className="mv-bio-tela" style={{ '--c': m.cor }}><img src={m.imagem} alt={`Página ${m.titulo}`} loading="lazy" /></span>
                  <b>{m.titulo}</b>
                  <small>{m.destaque}</small>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mv-como">
          <div className="s-wrap">
            <h2>Como funciona</h2>
            <ol>
              <li><b>Escolha o modelo</b><span>e me chame no WhatsApp. Tiro dúvidas na hora.</span></li>
              <li><b>Mande as informações</b><span>num formulário de 3 minutos: serviços, horários, fotos.</span></li>
              <li><b>Aprove a prévia</b><span>pronta com a sua cara. Paga 50% ao aprovar e 50% quando estiver no ar.</span></li>
            </ol>
            <p className="mv-letra">Hospedagem e domínio: {brl(CONFIG.HOSPEDAGEM_BIO)}/mês na página da bio e {brl(CONFIG.HOSPEDAGEM_SITE)}/mês no site completo, sem fidelidade.</p>
            <div className="mv-acoes">
              <Link className="s-btn" to={briefing}>Já quero começar</Link>
              <a className="s-btn s-btn--linha" href={waVendas(`Oi! Tenho uma dúvida sobre o site${nome ? ` ${comArtigo(nome, 'da')}` : ''}.`)} target="_blank" rel="noreferrer">Tirar uma dúvida</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
