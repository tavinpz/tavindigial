import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { SITES, DIAS_SEMANA, foto } from '../data/sites'
import { waLink } from '../lib/msg'
import { callFn, quandoHumano } from '../lib/fn'
import '../styles/sites.css'

// ── utilidades ──
const agoraSP = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
const hhmm = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`
const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}` : `${m} min`)
const semMovimento = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function statusAgora(horario) {
  const d = agoraSP()
  const h = d.getHours() + d.getMinutes() / 60
  const hoje = horario[d.getDay()]
  if (hoje && h >= hoje[0] && h < hoje[1]) return { aberto: true, texto: `Aberto agora · fecha às ${hhmm(hoje[1])}` }
  for (let i = 0; i < 7; i++) {
    const dia = (d.getDay() + i) % 7
    const f = horario[dia]
    if (!f) continue
    if (i === 0 && h < f[0]) return { aberto: false, texto: `Fechado · abre hoje às ${hhmm(f[0])}` }
    if (i > 0) return { aberto: false, texto: `Fechado · abre ${i === 1 ? 'amanhã' : DIAS_SEMANA[dia].toLowerCase()} às ${hhmm(f[0])}` }
  }
  return { aberto: false, texto: 'Fechado' }
}

// "Ocupado" estável por dia e hora, para a agenda parecer de verdade
const ocupado = (chave) => { let x = 0; for (const c of chave) x = (x * 31 + c.charCodeAt(0)) % 997; return x % 5 === 0 || x % 7 === 0 }

function useFonte(familias) {
  useEffect(() => {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = `https://fonts.googleapis.com/css2?${familias}&display=swap`
    document.head.appendChild(l)
    return () => l.remove()
  }, [familias])
}

// Revela os blocos quando entram na tela (uma vez)
function useRevelar(raiz) {
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const alvos = el.querySelectorAll('[data-rev]')
    if (semMovimento() || !('IntersectionObserver' in window)) { alvos.forEach((a) => a.classList.add('vis')); return }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    alvos.forEach((a) => io.observe(a))
    return () => io.disconnect()
  }, [raiz])
}

const I = {
  estrela: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  pin: 'M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  relogio: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  zap: 'M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12Z',
  seta: 'M5 12h14M13 6l6 6-6 6',
  check: 'm5 12 4 4 10-10',
  mais: 'M12 5v14M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  x: 'M6 6l12 12M18 6 6 18',
  cal: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
}
const Ico = ({ n, s = 18, cheio }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill={cheio ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={I[n]} /></svg>
)
const Estrelas = ({ n = 5, s = 14 }) => <span className="sd-estrelas" aria-hidden="true">{Array.from({ length: n }, (_, i) => <Ico key={i} n="estrela" s={s} cheio />)}</span>

// ── seções ──
function Heroi({ site, nome, status, irAgendar }) {
  const ref = useRef(null)
  const [y, setY] = useState(0)
  useEffect(() => {
    if (semMovimento()) return
    let raf = 0
    const fn = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setY(Math.min(window.scrollY, 900))) }
    window.addEventListener('scroll', fn, { passive: true })
    return () => { window.removeEventListener('scroll', fn); cancelAnimationFrame(raf) }
  }, [])
  const h = site.heroi
  const selo = (
    <p className="sd-heroi-selo">
      <span className={`sd-ponto ${status.aberto ? 'on' : ''}`} />{status.texto}
    </p>
  )
  const acoes = (
    <div className="sd-heroi-acoes">
      <button className="sd-btn sd-btn--forte" onClick={irAgendar}>Agendar horário</button>
      <a className="sd-btn sd-btn--linha" href="#servicos">Ver serviços e preços</a>
    </div>
  )
  const nota = (
    <p className="sd-heroi-nota"><Estrelas /> <b>{String(site.nota.toFixed(1)).replace('.', ',')}</b> no Google · {site.avaliacoes} avaliações</p>
  )

  if (site.layout === 'cheio') {
    return (
      <header className="sd-heroi sd-heroi--cheio" ref={ref}>
        <img className="sd-heroi-foto" src={foto(h.foto, 2000)} alt="" style={{ transform: `translate3d(0, ${y * 0.25}px, 0) scale(1.08)` }} />
        <div className="sd-heroi-veu" />
        <div className="sd-wrap sd-heroi-in">
          {selo}
          <h1><span className="sd-nome-grande">{nome}</span><span className="sd-heroi-tit">{h.titulo}</span></h1>
          <p className="sd-heroi-sub">{h.sub}</p>
          {acoes}
          {nota}
        </div>
      </header>
    )
  }
  if (site.layout === 'arco') {
    return (
      <header className="sd-heroi sd-heroi--arco" ref={ref}>
        <div className="sd-wrap sd-heroi-grade">
          <div className="sd-heroi-texto">
            {selo}
            <h1>{h.titulo}</h1>
            <p className="sd-heroi-sub">{h.sub}</p>
            {acoes}
            {nota}
          </div>
          <div className="sd-heroi-fotos">
            <img className="sd-arco" src={foto(h.foto, 1100)} alt="Tratamento facial na clínica" style={{ transform: `translate3d(0, ${y * -0.06}px, 0)` }} />
            <img className="sd-redondo" src={foto(h.foto2, 500)} alt="" style={{ transform: `translate3d(0, ${y * 0.08}px, 0)` }} />
          </div>
        </div>
      </header>
    )
  }
  if (site.layout === 'cartao') {
    return (
      <header className="sd-heroi sd-heroi--cartao" ref={ref}>
        <div className="sd-wrap sd-heroi-grade">
          <div className="sd-heroi-texto">
            {selo}
            <h1>{h.titulo}</h1>
            <p className="sd-heroi-sub">{h.sub}</p>
            {acoes}
            {site.urgencia && <a className="sd-urgencia" href="#agendar" onClick={irAgendar}><Ico n="zap" s={16} />{site.urgencia}</a>}
          </div>
          <div className="sd-heroi-fotos">
            <img className="sd-foto-cartao" src={foto(h.foto, 1100)} alt="Dentista conversando com paciente no consultório" />
            <div className="sd-flutua f1"><Estrelas s={12} /><b>{String(site.nota.toFixed(1)).replace('.', ',')}</b><small>{site.avaliacoes} avaliações no Google</small></div>
            <div className="sd-flutua f2"><b>Avaliação gratuita</b><small>com raio-x digital</small></div>
          </div>
        </div>
      </header>
    )
  }
  // bolha (pet)
  return (
    <header className="sd-heroi sd-heroi--bolha" ref={ref}>
      <div className="sd-wrap sd-heroi-grade">
        <div className="sd-heroi-texto">
          {selo}
          <h1>{h.titulo}</h1>
          <p className="sd-heroi-sub">{h.sub}</p>
          {acoes}
          {nota}
        </div>
        <div className="sd-heroi-fotos">
          <span className="sd-blob" aria-hidden="true" />
          <img className="sd-foto-bolha" src={foto(h.foto, 1000)} alt="Cachorro de bandana depois do banho" style={{ transform: `translate3d(0, ${y * -0.05}px, 0) rotate(-2deg)` }} />
          <span className="sd-adesivo">Fotos no<br />WhatsApp</span>
        </div>
      </div>
    </header>
  )
}

function Servicos({ site, porte, setPorte, escolher }) {
  const [cat, setCat] = useState(site.categorias[0])
  const lista = site.servicos.filter((s) => s.cat === cat)
  const mult = site.portes ? site.portes.find((p) => p[0] === porte)[3] : 1
  const preco = (s) => (s.preco === 0 ? 'Grátis' : `${s.apartir ? 'a partir de ' : ''}${brl(Math.round((s.porte ? s.preco * mult : s.preco) / 5) * 5)}${s.unidade ? ` ${s.unidade}` : ''}`)
  return (
    <section className="sd-sec" id="servicos">
      <div className="sd-wrap">
        <div className="sd-cab" data-rev>
          <h2>Serviços e preços</h2>
          <p>Valores de {new Date().getFullYear()}. Toque em um serviço para agendar.</p>
        </div>
        <div className="sd-abas" role="tablist" aria-label="Categorias" data-rev>
          {site.categorias.map((c) => (
            <button key={c} role="tab" aria-selected={c === cat} className={c === cat ? 'ativa' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        {site.portes && (
          <div className="sd-portes" role="radiogroup" aria-label="Porte do pet" data-rev>
            <span>Porte:</span>
            {site.portes.map(([id, n, kg]) => (
              <button key={id} role="radio" aria-checked={porte === id} className={porte === id ? 'ativa' : ''} onClick={() => setPorte(id)}>
                <b>{n}</b><small>{kg}</small>
              </button>
            ))}
          </div>
        )}
        <ul className="sd-servicos" key={cat}>
          {lista.map((s, i) => (
            <li key={s.nome} style={{ '--i': i }}>
              <button className={`sd-servico ${s.destaque ? 'destaque' : ''}`} onClick={() => escolher(s.nome)}>
                <span className="sd-servico-nome">{s.nome}{s.destaque && <em>Mais pedido</em>}</span>
                <span className="sd-servico-desc">{s.desc}{s.min ? ` · ${dur(s.min)}` : ''}</span>
                <span className="sd-servico-preco">{preco(s)}</span>
                <span className="sd-servico-ir">Agendar <Ico n="seta" s={15} /></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Agendar({ site, nome, servico, setServico, porte, demo }) {
  const dias = useMemo(() => {
    const base = agoraSP()
    const out = []
    for (let i = 0; out.length < 8 && i < 14; i++) {
      const d = new Date(base); d.setDate(base.getDate() + i)
      if (site.horario[d.getDay()]) out.push(d)
    }
    return out
  }, [site])
  const agora = agoraSP()
  const slots = (d, sv, pessoa) => {
    const faixa = site.horario[d.getDay()]
    const out = []
    for (let h = faixa[0]; h + (sv.min || 30) / 60 <= faixa[1]; h += 0.5) {
      const passou = d.toDateString() === agora.toDateString() && h <= agora.getHours() + agora.getMinutes() / 60 + 0.5
      out.push({ h, livre: !passou && !ocupado(`${site.id}${d.toDateString()}${h}${pessoa}`) })
    }
    return out
  }
  const padrao = site.servicos.find((x) => x.destaque) || site.servicos[0]
  // abre no primeiro dia que ainda tem pelo menos 3 horários livres (à noite, "hoje" já passou)
  const [dia, setDia] = useState(() => Math.max(0, dias.findIndex((x) => slots(x, padrao, site.equipe[0]).filter((y) => y.livre).length >= 3)))
  const [hora, setHora] = useState(null)
  const [quem, setQuem] = useState(site.equipe[0])
  const [cliente, setCliente] = useState('')
  const s = site.servicos.find((x) => x.nome === servico) || padrao
  const d = dias[dia]
  const horarios = slots(d, s, quem)
  useEffect(() => { setHora(null) }, [dia, servico, quem])

  const zero = new Date(agora); zero.setHours(0, 0, 0, 0)
  const rotDia = (x) => { const n = Math.round((new Date(x).setHours(0, 0, 0, 0) - zero) / 86400000); return n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : DIAS_SEMANA[x.getDay()].slice(0, 3) }
  const porteTxt = site.portes ? ` (porte ${site.portes.find((p) => p[0] === porte)[1].toLowerCase()})` : ''
  const msg = hora == null ? '' : `Olá, ${nome}! ${cliente ? `Aqui é ${cliente}. ` : ''}Quero agendar ${s.nome}${porteTxt} ${rotDia(d) === 'Hoje' ? 'hoje' : rotDia(d) === 'Amanhã' ? 'amanhã' : `${DIAS_SEMANA[d.getDay()].toLowerCase()}, ${d.getDate()}/${d.getMonth() + 1}`}, às ${hhmm(hora)}${site.equipe.length > 1 ? ` com ${quem}` : ''}. Pode confirmar?`

  return (
    <section className="sd-sec sd-agendar" id="agendar">
      <div className="sd-wrap sd-agendar-grade">
        <div className="sd-cab" data-rev>
          <h2>Agende em 30 segundos</h2>
          <p>Escolha o serviço, o dia e o horário. A confirmação chega no seu WhatsApp.</p>
          <ul className="sd-garantias">
            <li><Ico n="check" s={16} />Sem cadastro e sem senha</li>
            <li><Ico n="check" s={16} />Remarque pelo WhatsApp quando precisar</li>
          </ul>
        </div>
        <div className="sd-agenda" data-rev>
          <label className="sd-campo">
            <span>Serviço</span>
            <select value={s.nome} onChange={(e) => setServico(e.target.value)}>
              {site.servicos.filter((x) => x.min > 0).map((x) => <option key={x.nome}>{x.nome}</option>)}
            </select>
          </label>
          {site.equipe.length > 1 && (
            <div className="sd-campo">
              <span>Com quem</span>
              <div className="sd-chips">{site.equipe.map((p) => <button key={p} className={p === quem ? 'ativa' : ''} onClick={() => setQuem(p)}>{p}</button>)}</div>
            </div>
          )}
          <div className="sd-campo">
            <span>Dia</span>
            <div className="sd-dias">
              {dias.map((x, i) => (
                <button key={x.toDateString()} className={i === dia ? 'ativa' : ''} onClick={() => setDia(i)}>
                  <small>{rotDia(x)}</small><b>{x.getDate()}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="sd-campo">
            <span>Horário <small>({dur(s.min)})</small></span>
            <div className="sd-horas">
              {horarios.map(({ h, livre }) => (
                <button key={h} disabled={!livre} className={hora === h ? 'ativa' : ''} onClick={() => setHora(h)}>{hhmm(h)}</button>
              ))}
              {!horarios.some((x) => x.livre) && <p className="sd-vazio">Sem horários livres neste dia. Escolha outro.</p>}
            </div>
          </div>
          <label className="sd-campo">
            <span>Seu nome</span>
            <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Opcional" />
          </label>
          <button className="sd-btn sd-btn--forte sd-btn--cheio" disabled={hora == null} onClick={() => demo(msg)}>
            {hora == null ? 'Escolha um horário' : `Confirmar ${hhmm(hora)} pelo WhatsApp`}
          </button>
        </div>
      </div>
    </section>
  )
}

function Sobre({ site }) {
  const s = site.sobre
  return (
    <section className="sd-sec sd-sobre">
      <div className="sd-wrap sd-sobre-grade">
        <img src={foto(s.foto, 1100)} alt="" loading="lazy" data-rev />
        <div data-rev>
          <h2>{s.titulo}</h2>
          <p>{s.texto}</p>
          <ul className="sd-pontos">{s.pontos.map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}</ul>
        </div>
      </div>
    </section>
  )
}

function Galeria({ site }) {
  const [aberta, setAberta] = useState(null)
  return (
    <section className="sd-sec sd-galeria-sec">
      <div className="sd-wrap">
        <div className="sd-cab sd-cab--linha" data-rev>
          <h2>Por dentro</h2>
          <a href="#" onClick={(e) => e.preventDefault()}>{site.instagram}</a>
        </div>
        <div className="sd-galeria">
          {site.galeria.map((id, i) => (
            <button key={id} className={`g${i}`} onClick={() => setAberta(id)} data-rev style={{ '--d': `${i * 60}ms` }} aria-label="Ampliar foto">
              <img src={foto(id, 700)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      {aberta && (
        <div className="sd-lupa" role="dialog" aria-label="Foto ampliada" onClick={() => setAberta(null)}>
          <img src={foto(aberta, 1600)} alt="" />
          <button aria-label="Fechar"><Ico n="x" s={22} /></button>
        </div>
      )}
    </section>
  )
}

function Plano({ site, irAgendar }) {
  const p = site.plano
  return (
    <section className="sd-sec sd-plano-sec">
      <div className="sd-wrap">
        <div className="sd-plano" data-rev>
          <div>
            <h2>{p.titulo}</h2>
            <p>{p.texto}</p>
          </div>
          <div className="sd-plano-preco">
            <b>{brl(p.preco)}</b><small>{p.mensal || site.id === 'barbearia' ? 'por mês' : 'no pacote'}</small>
            <button className="sd-btn sd-btn--forte" onClick={irAgendar}>Quero esse</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Depoimentos({ site }) {
  return (
    <section className="sd-sec">
      <div className="sd-wrap">
        <div className="sd-cab" data-rev>
          <h2>Quem já veio</h2>
          <p><Estrelas /> <b>{String(site.nota.toFixed(1)).replace('.', ',')}</b> de média em {site.avaliacoes} avaliações no Google</p>
        </div>
        <div className="sd-depo">
          {site.depoimentos.map((d, i) => (
            <figure key={d.nome} data-rev style={{ '--d': `${i * 90}ms` }}>
              <Estrelas s={13} />
              <blockquote>{d.texto}</blockquote>
              <figcaption><b>{d.nome}</b><small>{d.quando}</small></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Local({ site, status }) {
  const hoje = agoraSP().getDay()
  const ordem = [1, 2, 3, 4, 5, 6, 0]
  return (
    <section className="sd-sec" id="onde">
      <div className="sd-wrap sd-local">
        <div data-rev>
          <h2>Onde fica</h2>
          <p className="sd-end"><Ico n="pin" />{site.endereco}</p>
          <p className={`sd-status ${status.aberto ? 'on' : ''}`}><span className={`sd-ponto ${status.aberto ? 'on' : ''}`} />{status.texto}</p>
          <table className="sd-horario">
            <tbody>
              {ordem.map((d) => (
                <tr key={d} className={d === hoje ? 'hoje' : ''}>
                  <th>{DIAS_SEMANA[d]}</th>
                  <td>{site.horario[d] ? `${hhmm(site.horario[d][0])} às ${hhmm(site.horario[d][1])}` : 'Fechado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="sd-btn sd-btn--linha" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapa)}`} target="_blank" rel="noreferrer">Como chegar</a>
        </div>
        <div className="sd-mapa" data-rev>
          <iframe title={`Mapa: ${site.endereco}`} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(site.mapa)}&z=15&output=embed`} />
        </div>
      </div>
    </section>
  )
}

function Duvidas({ site }) {
  return (
    <section className="sd-sec">
      <div className="sd-wrap sd-faq-grade">
        <div className="sd-cab" data-rev><h2>Dúvidas</h2></div>
        <div className="sd-faq" data-rev>
          {site.faq.map(([p, r]) => (
            <details key={p}><summary>{p}<Ico n="mais" s={18} /></summary><p>{r}</p></details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function SiteDemo() {
  const { id } = useParams()
  const [qs] = useSearchParams()
  const site = SITES[id]
  const nomeLead = (qs.get('n') || '').slice(0, 60).trim()
  const r = qs.get('r') || ''
  const raiz = useRef(null)
  const [servico, setServico] = useState(null)
  const [porte, setPorte] = useState('P')
  const [compacto, setCompacto] = useState(false)
  const [menu, setMenu] = useState(false)
  const [pedido, setPedido] = useState('')
  // dentro das prévias (notebook/celular da vitrine) o aviso de demonstração só atrapalha
  const [faixa, setFaixa] = useState(() => { try { return window.self === window.top } catch { return false } })
  const [status, setStatus] = useState(() => (site ? statusAgora(site.horario) : null))

  useFonte(site?.fontes || '')
  useRevelar(raiz)

  useEffect(() => {
    if (!site) return
    const nome = nomeLead || site.nome
    document.title = `${nome} · demonstração`
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex'
    document.head.appendChild(meta)
    const parar = r ? quandoHumano(() => callFn('track', { r, pagina: `site/${id}`, modelo: `site-${id}` }).catch(() => {})) : () => {}
    const fn = () => setCompacto(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    const t = setInterval(() => setStatus(statusAgora(site.horario)), 60000)
    return () => { meta.remove(); parar(); window.removeEventListener('scroll', fn); clearInterval(t) }
  }, [site, nomeLead, r, id])

  if (!site) return <Navigate to="/m/geral" replace />
  const nome = nomeLead || site.nome
  const quero = waLink(CONFIG.WHATSAPP_VENDAS, `Oi! Vi o site de demonstração (${site.nome}) e quero um assim${nomeLead ? ` para a ${nomeLead}` : ''}.`)
  const irAgendar = (e) => { e?.preventDefault?.(); setMenu(false); document.getElementById('agendar')?.scrollIntoView({ behavior: semMovimento() ? 'auto' : 'smooth' }) }
  const escolher = (nomeServico) => { setServico(nomeServico); irAgendar() }
  const c = site.cores

  return (
    <div className={`sd sd--${site.id} sd--${site.layout}`} ref={raiz}
      style={{ '--f': c.fundo, '--s': c.superficie, '--t': c.texto, '--sv': c.suave, '--a': c.acento, '--at': c.acentoTexto, '--l': c.linha, '--sol': c.sol || c.acento }}>
      {faixa && (
        <div className="sd-faixa">
          <span>{nomeLead ? `Demonstração feita para ${nomeLead}` : 'Site de demonstração · Tavin Digital'}</span>
          <a href={quero} target="_blank" rel="noreferrer">Quero um site assim · {brl(CONFIG.PRECO_SITE)}</a>
          <button aria-label="Fechar aviso" onClick={() => setFaixa(false)}><Ico n="x" s={14} /></button>
        </div>
      )}

      <nav className={`sd-nav ${compacto ? 'on' : ''} ${faixa ? 'com-faixa' : ''}`}>
        <div className="sd-wrap sd-nav-in">
          <a className="sd-marca" href="#topo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{nome}</a>
          <div className={`sd-links ${menu ? 'aberto' : ''}`}>
            <a href="#servicos" onClick={() => setMenu(false)}>Serviços</a>
            <a href="#agendar" onClick={irAgendar}>Agendar</a>
            <a href="#onde" onClick={() => setMenu(false)}>Onde fica</a>
          </div>
          <button className="sd-btn sd-btn--forte sd-btn--sm" onClick={irAgendar}>Agendar</button>
          <button className="sd-hamb" aria-label="Menu" onClick={() => setMenu((m) => !m)}><Ico n={menu ? 'x' : 'menu'} s={22} /></button>
        </div>
      </nav>

      <main id="topo">
        <Heroi site={site} nome={nome} status={status} irAgendar={irAgendar} />
        <div className="sd-prova">
          <div className="sd-wrap sd-prova-in">
            <span><Estrelas s={13} /> {String(site.nota.toFixed(1)).replace('.', ',')} · {site.avaliacoes} avaliações</span>
            <span><Ico n="relogio" s={16} />Desde {site.desde}</span>
            <span><Ico n="pin" s={16} />{site.bairro}, {site.cidade}</span>
            <span><Ico n="cal" s={16} />Agenda online</span>
          </div>
        </div>
        <Servicos site={site} porte={porte} setPorte={setPorte} escolher={escolher} />
        <Agendar site={site} nome={nome} servico={servico} setServico={setServico} porte={porte} demo={setPedido} />
        <Sobre site={site} />
        <Galeria site={site} />
        <Plano site={site} irAgendar={irAgendar} />
        <Depoimentos site={site} />
        <Local site={site} status={status} />
        <Duvidas site={site} />
      </main>

      <footer className="sd-rodape">
        <div className="sd-wrap sd-rodape-in">
          <div><b className="sd-marca">{nome}</b><p>{site.endereco}</p></div>
          <p className="sd-feito">Site feito pela <a href="/" target="_blank" rel="noreferrer">Tavin Digital</a></p>
        </div>
      </footer>

      <div className="sd-barra">
        <a className="sd-btn sd-btn--linha" href="#onde">Como chegar</a>
        <button className="sd-btn sd-btn--forte" onClick={irAgendar}>Agendar horário</button>
      </div>

      {pedido && (
        <div className="sd-modal" role="dialog" aria-modal="true" aria-label="Pedido pronto" onClick={() => setPedido('')}>
          <div className="sd-modal-in" onClick={(e) => e.stopPropagation()}>
            <button className="sd-modal-x" aria-label="Fechar" onClick={() => setPedido('')}><Ico n="x" s={20} /></button>
            <span className="sd-modal-ok"><Ico n="check" s={22} /></span>
            <h3>Pedido pronto</h3>
            <p>No site de vocês, este botão abre o WhatsApp do negócio com a mensagem já escrita:</p>
            <div className="sd-zap">{pedido}</div>
            <p className="sd-modal-pe">O cliente só aperta enviar. Você recebe o pedido organizado, com serviço, dia e horário.</p>
            <a className="sd-btn sd-btn--forte sd-btn--cheio" href={quero} target="_blank" rel="noreferrer">Quero um site assim para o meu negócio</a>
          </div>
        </div>
      )}
    </div>
  )
}
