import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { MODELOS, PORTFOLIO } from '../data/modelos'
import { waVendas } from './Layout'
import Logo from './Logo'
import Padrao from './Padrao'
import { clamp, progresso, semMovimento, useReveal, useScroll } from './fx'
import '../styles/home.css'

const NICHOS = [
  ['estetica', 'Estética'],
  ['odontologia', 'Odonto'],
  ['barbearia', 'Barbearia'],
]

const PUBLICOS = [
  {
    titulo: 'Ainda não tenho site',
    antes: 'Só o perfil do Google',
    dor: 'Quem te encontra vê um endereço e um telefone. Sem foto, sem preço e sem um jeito fácil de marcar.',
    vira: 'A página vira o link do Google e do Instagram, com serviços, avaliações e o botão do WhatsApp.',
  },
  {
    titulo: 'Uso Linktree',
    antes: 'linktr.ee/seunegocio',
    dor: 'A lista de botões é igual à de todo mundo e não conta nada sobre o seu trabalho.',
    vira: 'No lugar dos botões soltos entra uma página com o seu nome, suas cores e tudo que o cliente precisa.',
  },
]

const PASSOS = [
  ['Você manda um oi', 'Diz o nome do negócio no WhatsApp. Em minutos você recebe um modelo com o seu nome.'],
  ['Preenche 3 minutos', 'Serviços, horários, endereço e fotos num formulário curto.'],
  ['Aprova a prévia', 'Vê a página pronta, pede ajuste e só então paga a primeira metade.'],
  ['Está no ar', `Em até ${CONFIG.PRAZO_BIO_HORAS} horas, com o seu domínio. A outra metade só agora.`],
]

const DUVIDAS = [
  ['Preciso pagar antes de ver?', 'Não. Você vê a prévia com a cara do seu negócio primeiro. Paga 50% quando aprovar e 50% quando estiver no ar.'],
  ['Qual a diferença entre a bio animada e o site?', 'A bio é uma página única para o link do Instagram e do Google: agendamento no WhatsApp, serviços, localização e avaliações, tudo animado. O site completo tem várias seções e é feito para aparecer melhor no Google.'],
  ['A mensalidade é obrigatória?', `A hospedagem (${brl(CONFIG.HOSPEDAGEM_BIO)}/mês na bio) mantém a página no ar com domínio, segurança e 1 ajuste por mês. Sem fidelidade.`],
  ['Já tenho Instagram. Por que preciso disso?', 'O Instagram mostra o seu dia a dia. A página mostra o que o cliente precisa para decidir: o que você faz, quanto custa, onde fica e como marcar.'],
  ['Quanto tempo leva?', `Até ${CONFIG.PRAZO_BIO_HORAS} horas para a bio e ${CONFIG.PRAZO_HORAS} horas para o site, depois que você manda as informações e as fotos.`],
]

const FRASE = 'Quem te acha no Google ou no Instagram decide em segundos. Mostre o que você faz, quanto custa e como marcar.'.split(' ')
const DESTAQUE_DE = 10 // a partir desta palavra, em rosa

const ICONE = {
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  seta: 'M5 12h14M13 6l6 6-6 6',
  baixo: 'M12 5v14M6 13l6 6 6-6',
  estrela: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  relogio: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  pin: 'M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
}
const Ico = ({ n, s = 18 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONE[n]} /></svg>
)

// Título palavra a palavra
function Palavras({ texto, destaque = [], inicio = 0 }) {
  const ps = texto.split(' ')
  return ps.map((p, i) => (
    <Fragment key={i}>
      <span className="td-w"><i style={{ transitionDelay: `${inicio + i * 70}ms` }} className={destaque.includes(i) ? 'hl' : undefined}>{p}</i></span>
      {i < ps.length - 1 ? ' ' : ''}
    </Fragment>
  ))
}

function Nav({ escuro, compacto }) {
  return (
    <nav className={`td-nav ${escuro ? 'escuro' : ''} ${compacto ? 'on' : ''}`} aria-label="Principal">
      <div className="td-nav-in">
        <Link to="/" className="td-nav-logo" aria-label="Tavin Digital"><Logo /></Link>
        <div className="td-nav-l">
          <a href="#ao-vivo">Ao vivo</a>
          <a href="#modelos">Modelos</a>
          <a href="#preco">Preço</a>
          <a href="#duvidas">Dúvidas</a>
        </div>
        <a className="td-btn td-btn--nav td-btn--sm" href={waVendas('Oi! Quero ver a prévia da minha página.')} target="_blank" rel="noreferrer">Quero a minha</a>
      </div>
    </nav>
  )
}

// Celular com a bio funcionando de verdade: endireita conforme rola, troca de nicho por toque ou deslize
function Palco() {
  const palco = useRef(null)
  const [p, setP] = useState(0)
  const [nicho, setNicho] = useState(0)
  const toque = useRef(null)

  useScroll(() => setP(semMovimento() ? 1 : progresso(palco.current, 1, 0.35)))

  const trocar = (d) => setNicho((n) => (n + d + NICHOS.length) % NICHOS.length)
  const inicio = (e) => { toque.current = e.touches?.[0]?.clientX ?? null }
  const fim = (e) => {
    if (toque.current == null) return
    const dx = (e.changedTouches?.[0]?.clientX ?? toque.current) - toque.current
    if (Math.abs(dx) > 40) trocar(dx < 0 ? 1 : -1)
    toque.current = null
  }

  const giro = (1 - p) * 26
  const escala = 0.86 + p * 0.14
  const abre = p * 46

  return (
    <section className="td-palco" id="ao-vivo" data-tema="escuro" ref={palco} onTouchStart={inicio} onTouchEnd={fim}>
      <div className="td-sec td-palco-in">
        <div className="td-palco-cena" style={{ '--abre': `${abre}px` }}>
          <Padrao className="td-tile t1" colunas={2} linhas={2} semente={3} />
          <Padrao className="td-tile t2" colunas={1} linhas={3} semente={9} />
          <Padrao className="td-tile t3" colunas={2} linhas={1} semente={14} />
          <Padrao className="td-tile t4" colunas={1} linhas={1} semente={21} />

          <div className="td-cel" style={{ transform: `perspective(1400px) rotateX(${giro}deg) scale(${escala})` }}>
            <span className="td-cel-ilha" aria-hidden="true" />
            <iframe key={NICHOS[nicho][0]} src={`/demo/${NICHOS[nicho][0]}`} title={`Exemplo de bio animada: ${NICHOS[nicho][1]}`} loading="lazy" />
          </div>

          <span className={`td-chip c1 ${p > 0.55 ? 'on' : ''}`}><Ico n="zap" s={14} /> Agenda no WhatsApp</span>
          <span className={`td-chip c2 ${p > 0.7 ? 'on' : ''}`}><Ico n="estrela" s={14} /> 4,9 no Google</span>
          <span className={`td-chip c3 ${p > 0.85 ? 'on' : ''}`}><i className="td-vivo" /> Aberto agora</span>
        </div>

        <div className="td-troca" role="group" aria-label="Trocar o exemplo">
          {NICHOS.map(([id, nome], i) => (
            <button key={id} className={i === nicho ? 'ativa' : ''} aria-pressed={i === nicho} onClick={() => setNicho(i)}>{nome}</button>
          ))}
        </div>
        <p className="td-dica">Role e toque dentro do celular. Deslize para o lado para trocar de nicho.</p>
      </div>
    </section>
  )
}

// Antes e depois arrastável
function AntesDepois() {
  const caixa = useRef(null)
  const [pos, setPos] = useState(50)
  const [mexeu, setMexeu] = useState(false)
  const arrastando = useRef(false)

  // dica de movimento quando aparece na tela, até a pessoa tocar
  useEffect(() => {
    if (semMovimento()) return
    const el = caixa.current
    if (!el || !('IntersectionObserver' in window)) return
    let t = []
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      ;[[200, 28], [1100, 72], [2000, 50]].forEach(([ms, v]) => t.push(setTimeout(() => setPos((atual) => (mexeu ? atual : v)), ms)))
    }, { threshold: 0.5 })
    io.observe(el)
    return () => { io.disconnect(); t.forEach(clearTimeout) }
  }, [mexeu])

  const mover = (clientX) => {
    const r = caixa.current.getBoundingClientRect()
    setPos(clamp(((clientX - r.left) / r.width) * 100, 4, 96))
  }
  const down = (e) => { arrastando.current = true; setMexeu(true); caixa.current.setPointerCapture?.(e.pointerId); mover(e.clientX) }
  const move = (e) => { if (arrastando.current) mover(e.clientX) }
  const up = () => { arrastando.current = false }
  const tecla = (e) => {
    if (e.key === 'ArrowLeft') { setMexeu(true); setPos((v) => clamp(v - 5, 4, 96)) }
    if (e.key === 'ArrowRight') { setMexeu(true); setPos((v) => clamp(v + 5, 4, 96)) }
  }

  return (
    <div className="td-ad" data-mexeu={mexeu ? '1' : '0'} ref={caixa} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={{ '--pos': `${pos}%` }} data-r>
      <div className="td-ad-antes" aria-hidden="true">
        <div className="td-lt">
          <span className="td-lt-av" />
          <b>@seunegocio</b>
          {['Instagram', 'WhatsApp', 'Localização', 'Promoções', 'Site'].map((t) => <span key={t} className="td-lt-btn">{t}</span>)}
        </div>
      </div>
      <div className="td-ad-depois">
        <img src="/modelos/bio-estetica.webp" alt="Página animada de uma clínica de estética feita pela Tavin" draggable="false" />
      </div>
      <span className="td-ad-rot l">Linktree</span>
      <span className="td-ad-rot r">Tavin</span>
      <div className="td-ad-alca" role="slider" tabIndex={0} aria-label="Comparar antes e depois" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)} onKeyDown={tecla}>
        <span><Ico n="seta" s={14} /></span>
      </div>
    </div>
  )
}

// Faixa de nichos correndo (contorno e preenchido alternados)
const LISTA_NICHOS = ['Barbearias', 'Clínicas de estética', 'Dentistas', 'Salões', 'Pet shops', 'Nutricionistas', 'Estúdios']
function Nichos() {
  const itens = [...LISTA_NICHOS, ...LISTA_NICHOS]
  return (
    <div className="td-nichos" aria-label={`Para ${LISTA_NICHOS.join(', ').toLowerCase()}`}>
      <div className="td-nichos-in" aria-hidden="true">
        {itens.map((n, i) => <span key={i} className={i % 2 ? 'cheio' : ''}>{n}</span>)}
      </div>
    </div>
  )
}

// Frase que acende palavra por palavra conforme o scroll
function Frase() {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useScroll(() => setN(semMovimento() ? FRASE.length : Math.round(progresso(ref.current, 0.85, 0.3) * FRASE.length)))
  return (
    <section className="td-frase" data-tema="escuro">
      <div className="td-sec" ref={ref}>
        <h2>
          {FRASE.map((w, i) => (
            <span key={i}><u data-on={i < n ? '1' : '0'} className={i >= DESTAQUE_DE ? 'hl' : undefined}>{w}</u>{i < FRASE.length - 1 ? ' ' : ''}</span>
          ))}
        </h2>
      </div>
    </section>
  )
}

function Passos() {
  const ref = useRef(null)
  const [p, setP] = useState(0)
  useScroll(() => setP(semMovimento() ? 1 : progresso(ref.current, 0.75, 0.25)))
  return (
    <ol className="td-passos" ref={ref} style={{ '--p': p }}>
      {PASSOS.map(([t, d], i) => (
        <li key={t} className={p * PASSOS.length > i + 0.2 ? 'on' : ''}>
          <span className="td-passo-n">{i + 1}</span>
          <div><h3>{t}</h3><p>{d}</p></div>
        </li>
      ))}
    </ol>
  )
}

// Número que sobe até o preço quando aparece
function Contador({ valor }) {
  const ref = useRef(null)
  const [v, setV] = useState(valor)
  useEffect(() => {
    if (semMovimento() || !('IntersectionObserver' in window)) return
    setV(0)
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const passo = (t) => {
        const k = clamp((t - t0) / 1100)
        setV(Math.round(valor * (1 - Math.pow(1 - k, 3))))
        if (k < 1) requestAnimationFrame(passo)
      }
      requestAnimationFrame(passo)
    }, { threshold: 0.6 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [valor])
  return <span ref={ref}>{v}</span>
}

export default function Home() {
  useReveal('.td')
  const [escuro, setEscuro] = useState(true)
  const [compacto, setCompacto] = useState(false)
  const [barra, setBarra] = useState(false)
  const [pronto, setPronto] = useState(false)
  const heroi = useRef(null)
  const final = useRef(null)

  useEffect(() => {
    document.title = 'Tavin Digital · Sua página pronta em 24 horas'
    document.documentElement.classList.add('td-raiz')
    const t = setTimeout(() => setPronto(true), 40)
    return () => { clearTimeout(t); document.documentElement.classList.remove('td-raiz') }
  }, [])

  // Nav inverte sobre seções escuras; barra do celular aparece depois do herói e some no final
  useScroll(() => {
    const y = 40
    const sob = [...document.querySelectorAll('.td [data-tema="escuro"]')].some((s) => {
      const r = s.getBoundingClientRect()
      return r.top <= y && r.bottom >= y
    })
    setEscuro(sob)
    setCompacto(window.scrollY > 24)
    const hb = heroi.current?.getBoundingClientRect().bottom ?? 0
    const ft = final.current?.getBoundingClientRect().top ?? 9999
    setBarra(hb < 0 && ft > window.innerHeight * 0.8)
  })

  const vitrine = MODELOS.filter((m) => m.url)

  // luz que acompanha o dedo/mouse no herói (sem re-render)
  const luz = (e) => {
    const el = heroi.current
    if (!el) return
    const t = e.touches?.[0] || e
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((t.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((t.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div className={`td ${pronto ? 'pronto' : ''}`}>
      <div className="td-atmo" aria-hidden="true"><i className="a1" /><i className="a2" /><i className="a3" /></div>
      <div className="td-grao" aria-hidden="true" />
      <Nav escuro={escuro} compacto={compacto} />

      <main>
        <section className="td-heroi" data-tema="escuro" ref={heroi} onPointerMove={luz} onTouchMove={luz}>
          <div className="td-sec">
            <p className="td-pilula" data-r><b><i className="td-vivo" /> Prévia grátis</b> Você só paga se aprovar</p>
            <h1 className="td-h1">
              <Palavras texto="Uma página com a sua cara." inicio={150} />
              <em><Palavras texto="Pronta amanhã." destaque={[0, 1]} inicio={520} /></em>
            </h1>
            <p className="td-lede" data-r style={{ transitionDelay: '700ms' }}>
              Para quem ainda não tem site ou só tem um Linktree: serviços, preços, avaliações e agendamento no WhatsApp numa página animada.
            </p>
            <div className="td-cta" data-r style={{ transitionDelay: '820ms' }}>
              <a className="td-btn td-btn--p td-btn--lg" href={waVendas('Oi! Quero ver a prévia da minha página.')} target="_blank" rel="noreferrer">Quero a minha prévia</a>
              <a className="td-btn td-btn--s td-btn--lg" href="#ao-vivo">Ver funcionando <Ico n="baixo" s={16} /></a>
            </div>
            <p className="td-mini" data-r style={{ transitionDelay: '920ms' }}>{brl(CONFIG.PRECO_BIO)} · pronta em {CONFIG.PRAZO_BIO_HORAS}h · sem fidelidade</p>
          </div>
        </section>

        <Palco />

        <Nichos />

        <Frase />

        <section className="td-bloco td-claro r-t" id="antes-depois">
          <div className="td-sec td-ad-grade">
            <div data-r>
              <p className="td-sobre">Arraste para comparar</p>
              <h2 className="td-h2">O mesmo negócio. <em>Outra impressão.</em></h2>
              <p className="td-lede td-lede--claro">À esquerda, o Linktree igual ao de todo mundo. À direita, uma página com nome, cores, serviços e avaliações. Qual você chamaria primeiro?</p>
            </div>
            <AntesDepois />
          </div>
        </section>


        <section className="td-bloco td-claro">
          <div className="td-sec">
            <h2 className="td-h2" data-r>Serve para quem está em uma destas situações</h2>
            <div className="td-publicos">
              {PUBLICOS.map((p, i) => (
                <article key={p.titulo} className="td-publico" data-r style={{ transitionDelay: `${i * 120}ms` }}>
                  <span className="td-publico-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.titulo}</h3>
                  <p className="td-publico-antes">{p.antes}</p>
                  <p>{p.dor}</p>
                  <div className="td-publico-vira"><b>Com a Tavin</b><p>{p.vira}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="td-bloco td-claro td-modelos" id="modelos">
          <div className="td-sec">
            <div className="td-hd2" data-r>
              <h2 className="td-h2">Escolha um modelo. <em>A gente coloca a sua cara.</em></h2>
              <p>Toque para abrir: é exatamente o que o seu cliente vai ver, com o seu nome, cores e serviços.</p>
            </div>
          </div>
          <div className="td-trilho" data-r>
            {vitrine.map((m) => (
              <a key={m.id} className="td-modelo" href={m.url} target="_blank" rel="noreferrer">
                <img src={m.imagem} alt={`Modelo ${m.titulo}`} loading="lazy" />
                <span className="td-modelo-info">
                  <b>{m.titulo}</b>
                  <small>{m.destaque}</small>
                  <span className="td-modelo-ver">Ver ao vivo <Ico n="seta" s={14} /></span>
                </span>
              </a>
            ))}
          </div>
          <div className="td-sec"><p className="td-mais" data-r><Link to="/m/geral">Ver todos os modelos</Link></p></div>
        </section>

        {PORTFOLIO.length > 0 && (
          <section className="td-bloco td-claro">
            <div className="td-sec">
              <h2 className="td-h2" data-r>Páginas que já estão no ar</h2>
              <div className="td-trilho td-trilho--sec">
                {PORTFOLIO.map((p) => (
                  <a key={p.cliente} className="td-modelo" href={p.url} target="_blank" rel="noreferrer">
                    {p.imagem && <img src={p.imagem} alt={`Página de ${p.cliente}`} loading="lazy" />}
                    <span className="td-modelo-info"><b>{p.cliente}</b><small>{p.antes ? `Antes: ${p.antes}` : p.tipo}</small></span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="td-bloco td-claro r-b" id="como-funciona">
          <div className="td-sec td-passos-grade">
            <div data-r>
              <h2 className="td-h2">Do primeiro “oi” à <em>página no ar.</em></h2>
              <p className="td-lede td-lede--claro">Sem reunião, sem briefing de uma hora. Tudo pelo WhatsApp.</p>
            </div>
            <Passos />
          </div>
        </section>

        <section className="td-bloco td-preco" id="preco" data-tema="escuro">
          <div className="td-sec">
            <div className="td-hd2" data-r>
              <h2 className="td-h2">Preço fechado. <em>Sem surpresa.</em></h2>
              <p>Você vê a prévia antes de pagar qualquer coisa. Hospedagem sem fidelidade.</p>
            </div>
            <div className="td-precos">
              <article className="td-plano td-plano--forte" data-r>
                <div className="td-plano-in">
                  <h3>Bio animada</h3>
                  <p className="td-valor"><small>R$</small><Contador valor={CONFIG.PRECO_BIO} /></p>
                  <p className="td-mensal">+ {brl(CONFIG.HOSPEDAGEM_BIO)}/mês de hospedagem e domínio</p>
                  <ul>
                    <li>Substitui o Linktree com a sua marca e animações</li>
                    <li>Agendamento direto no WhatsApp</li>
                    <li>Serviços, preços, localização e avaliações</li>
                    <li>Pronta em até {CONFIG.PRAZO_BIO_HORAS} horas</li>
                    <li>1 ajuste por mês sem custo</li>
                  </ul>
                  <a className="td-btn td-btn--p td-btn--lg" href={waVendas('Oi! Quero a bio animada.')} target="_blank" rel="noreferrer">Quero a bio animada</a>
                </div>
              </article>
              <article className="td-plano" data-r style={{ transitionDelay: '120ms' }}>
                <div className="td-plano-in">
                  <h3>Site completo</h3>
                  <p className="td-valor"><small>R$</small>{CONFIG.PRECO_SITE}</p>
                  <p className="td-mensal">+ {brl(CONFIG.HOSPEDAGEM_SITE)}/mês de hospedagem e domínio</p>
                  <ul>
                    <li>Várias seções: sobre, serviços, fotos, equipe</li>
                    <li>Feito para aparecer no Google</li>
                    <li>WhatsApp, mapa e horários</li>
                    <li>Pronto em até {CONFIG.PRAZO_HORAS} horas</li>
                  </ul>
                  <a className="td-btn td-btn--s td-btn--lg" href={waVendas('Oi! Quero o site completo.')} target="_blank" rel="noreferrer">Quero o site completo</a>
                </div>
              </article>
            </div>
            <p className="td-garantia" data-r><b>Você só paga se aprovar.</b> Metade depois de ver a prévia, metade quando estiver no ar.</p>
          </div>
        </section>

        <section className="td-bloco td-escuro" id="duvidas" data-tema="escuro">
          <div className="td-sec td-faq">
            <h2 className="td-h2" data-r>Dúvidas comuns</h2>
            <div>
              {DUVIDAS.map(([p, r]) => (
                <details key={p} data-r><summary>{p}<span aria-hidden="true" /></summary><p>{r}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="td-final" data-tema="escuro" ref={final}>
          <div className="td-faixa" aria-hidden="true">
            <div className="td-faixa-in">
              <Padrao colunas={12} linhas={1} semente={5} />
              <Padrao colunas={12} linhas={1} semente={5} />
            </div>
          </div>
          <div className="td-sec">
            <h2 className="td-h2 td-h2--xl" data-r>Seu negócio já é bom. <em>Falta a página mostrar.</em></h2>
            <p className="td-lede" data-r>Mande o nome do seu negócio no WhatsApp. A gente responde com a sua página de exemplo.</p>
            <div className="td-cta" data-r>
              <a className="td-btn td-btn--p td-btn--lg" href={waVendas('Oi! Quero ver a prévia da minha página.')} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
              <Link className="td-btn td-btn--s td-btn--lg" to="/briefing">Já quero começar</Link>
            </div>
          </div>
          <footer className="td-rodape">
            <div className="td-sec">
              <Logo />
              <span>© {new Date().getFullYear()} {CONFIG.RAZAO_SOCIAL}{CONFIG.CNPJ ? ` · CNPJ ${CONFIG.CNPJ}` : ''} · {CONFIG.CIDADE}</span>
              <nav aria-label="Rodapé">
                <a href={`https://instagram.com/${CONFIG.INSTAGRAM}`} target="_blank" rel="noreferrer">@{CONFIG.INSTAGRAM}</a>
                <Link to="/termos">Termos</Link>
                <Link to="/privacidade">Privacidade</Link>
              </nav>
            </div>
          </footer>
        </section>
      </main>

      <div className={`td-barra ${barra ? 'on' : ''}`}>
        <a className="td-btn td-btn--p td-btn--lg" href={waVendas('Oi! Quero ver a prévia da minha página.')} target="_blank" rel="noreferrer">
          Quero a minha página · {brl(CONFIG.PRECO_BIO)}
        </a>
      </div>
    </div>
  )
}
