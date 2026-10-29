import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { waLink } from '../lib/msg'
import { callFn, quandoHumano } from '../lib/fn'
import '../styles/bio.css'
import { DEMOS } from './demos'

// Negócios fictícios usados nas demonstrações. O ?n= troca o nome pelo do lead.
const TEMAS = {
  estetica: {
    nome: 'Lumi Estética',
    frase: 'Pele, contorno e bem-estar com hora marcada.',
    bairro: 'Moema, São Paulo',
    cta: 'Agendar avaliação',
    fontes: 'family=Italiana&family=Jost:wght@400;500;600',
    destaques: ['Skincare', 'Harmonização', 'Drenagem', 'Peeling', 'Laser'],
    servicos: [['Limpeza de pele profunda', 'R$ 180'], ['Toxina botulínica', 'a partir de R$ 890'], ['Preenchimento labial', 'R$ 1.200'], ['Drenagem linfática', 'R$ 150']],
    horario: { dias: [1, 2, 3, 4, 5, 6], abre: 9, fecha: 20, texto: 'Seg a sáb · 9h às 20h' },
    nota: '4,9', avaliacoes: 312,
    depoimentos: [['Saí outra pessoa. Atendimento cuidadoso do começo ao fim.', 'Carolina M.'], ['Agendei pelo link em 1 minuto e fui atendida no mesmo dia.', 'Juliana R.']],
  },
  odontologia: {
    nome: 'Sorriso Prime',
    frase: 'Odontologia sem susto, do check-up ao implante.',
    bairro: 'Vila Mariana, São Paulo',
    cta: 'Marcar consulta',
    fontes: 'family=Plus+Jakarta+Sans:wght@400;600;800',
    destaques: ['Clareamento', 'Implantes', 'Alinhadores', 'Check-up', 'Urgência'],
    servicos: [['Avaliação + limpeza', 'R$ 180'], ['Clareamento a laser', 'R$ 650'], ['Alinhador invisível', 'consulte'], ['Implante unitário', 'a partir de R$ 2.900']],
    horario: { dias: [1, 2, 3, 4, 5, 6], abre: 8, fecha: 19, texto: 'Seg a sex · 8h às 19h · Sáb até 13h' },
    nota: '4,8', avaliacoes: 486,
    depoimentos: [['Tinha pavor de dentista. Aqui foi tranquilo, explicaram tudo.', 'Rafael T.'], ['Clareamento ficou natural e o preço foi o combinado.', 'Bianca S.']],
  },
  barbearia: {
    nome: 'Navalha 13',
    frase: 'Corte na régua, barba no capricho, cerveja gelada.',
    bairro: 'Pinheiros, São Paulo',
    cta: 'Reservar horário',
    fontes: 'family=Bebas+Neue&family=Barlow:wght@400;600;700',
    destaques: ['Corte', 'Barba', 'Pigmentação', 'Sobrancelha', 'Platinado'],
    servicos: [['Corte', 'R$ 60'], ['Barba com toalha quente', 'R$ 45'], ['Corte + barba', 'R$ 95'], ['Pigmentação', 'R$ 40']],
    horario: { dias: [2, 3, 4, 5, 6], abre: 10, fecha: 21, texto: 'Ter a sáb · 10h às 21h' },
    nota: '4,9', avaliacoes: 728,
    depoimentos: [['Melhor degradê da região. Saio sempre no horário.', 'Diego A.'], ['Ambiente top e o barbeiro manja muito de barba.', 'Lucas P.']],
  },
}

const iniciais = (nome) => nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

function abertoAgora({ dias, abre, fecha }) {
  // Sempre no horário de Brasília, de onde quer que a pessoa abra
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const h = d.getHours() + d.getMinutes() / 60
  return dias.includes(d.getDay()) && h >= abre && h < fecha
}

const Icone = ({ tipo }) => {
  const p = {
    whats: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm4.6 12.6c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.4Z',
    lista: 'M5 6h14M5 12h14M5 18h9',
    mapa: 'M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    insta: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.2-1.4h.01',
    estrela: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z',
    seta: 'M9 6l6 6-6 6',
  }[tipo]
  const cheio = tipo === 'whats' || tipo === 'estrela'
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="b-icone">
      <path d={p} fill={cheio ? 'currentColor' : 'none'} stroke={cheio ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function useFonte(familias) {
  useEffect(() => {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = `https://fonts.googleapis.com/css2?${familias}&display=swap`
    document.head.appendChild(l)
    return () => l.remove()
  }, [familias])
}

// /demo/:id → demos com layout próprio (pasta demos) ou o layout clássico com tema
export default function BioDemo() {
  const { id } = useParams()
  const Extra = DEMOS[id]
  if (Extra) return <Suspense fallback={null}><Extra /></Suspense>
  return <Classico />
}

function Classico() {
  const { id } = useParams()
  const [qs] = useSearchParams()
  const base = TEMAS[id]
  // dados reais do negócio vindos da prévia (nota, avaliações e bairro do Google)
  const g = qs.get('g'), av = qs.get('a'), bairro = (qs.get('b') || '').slice(0, 40)
  const tema = base && {
    ...base,
    ...(g && /^\d([.,]\d)?$/.test(g) ? { nota: g.replace('.', ',') } : {}),
    ...(av && /^\d{1,5}$/.test(av) ? { avaliacoes: av } : {}),
    ...(bairro ? { bairro: base.bairro && base.bairro.includes(',') ? `${bairro}, ${base.bairro.split(',').pop().trim()}` : bairro } : {}),
  }
  const nomeLead = (qs.get('n') || '').slice(0, 60).trim()
  const r = qs.get('r') || ''
  const nome = nomeLead || tema?.nome || ''
  const [aberto, setAberto] = useState(null)
  const [aviso, setAviso] = useState('')
  const avatar = useRef(null)

  useFonte(tema?.fontes || 'family=Jost')

  useEffect(() => {
    if (!tema) return
    document.title = `${nome} · demonstração`
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex'
    document.head.appendChild(meta)
    const parar = r ? quandoHumano(() => callFn('track', { r, pagina: `demo/${id}`, modelo: id }).catch(() => {})) : () => {}
    return () => { meta.remove(); parar() }
  }, [tema, nome, r, id])

  // Inclina o avatar seguindo o dedo/mouse (desligado com movimento reduzido)
  useEffect(() => {
    const el = avatar.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mover = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14
      const y = (e.clientY / window.innerHeight - 0.5) * -14
      el.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`
    }
    window.addEventListener('pointermove', mover)
    return () => window.removeEventListener('pointermove', mover)
  }, [tema])

  const aberta = useMemo(() => (tema ? abertoAgora(tema.horario) : false), [tema])
  if (!tema) return <Navigate to="/m/geral" replace />

  const quero = waLink(CONFIG.WHATSAPP_VENDAS, `Oi! Vi a demonstração ${tema.nome} e quero uma página assim${nomeLead ? ` para a ${nomeLead}` : ''}.`)
  const demo = (acao) => {
    setAviso(`Na página da ${nome}, este botão ${acao}.`)
    clearTimeout(window.__bioAviso)
    window.__bioAviso = setTimeout(() => setAviso(''), 4200)
  }
  // Cada palavra fica inteira na linha; as letras entram uma a uma
  const palavras = nome.split(/\s+/).filter(Boolean).reduce((acc, texto) => {
    const inicio = acc.length ? acc[acc.length - 1].inicio + acc[acc.length - 1].texto.length + 1 : 0
    return [...acc, { texto, inicio }]
  }, [])

  return (
    <div className={`bio bio--${id}`}>
      <div className="b-fundo" aria-hidden="true"><span /><span /><span /><span /></div>

      <main className="b-pagina">
        <p className="b-selo">{nomeLead ? `Demonstração feita para ${nomeLead}` : 'Demonstração Tavin Digital'}</p>

        <header className="b-topo">
          <div className="b-avatar-wrap">
            <div className="b-avatar" ref={avatar}>
              <span>{iniciais(nome)}</span>
            </div>
          </div>
          <h1 className={`b-nome ${nome.length > 24 ? 'b-nome--xl' : nome.length > 14 ? 'b-nome--l' : ''}`} aria-label={nome}>
            {palavras.map((p, w) => (
              <span key={w} className="b-palavra" aria-hidden="true">
                {Array.from(p.texto).map((c, i) => <span key={i} style={{ '--i': p.inicio + i }}>{c}</span>)}
              </span>
            ))}
          </h1>
          <p className="b-frase">{tema.frase}</p>
          <p className="b-status">
            <span className={`b-ponto ${aberta ? 'b-ponto--on' : ''}`} />
            {aberta ? 'Aberto agora' : 'Fechado agora'} · {tema.bairro}
          </p>
        </header>

        <div className="b-faixa" aria-hidden="true">
          <div>{[...tema.destaques, ...tema.destaques, ...tema.destaques].map((d, i) => <span key={i}>{d}</span>)}</div>
        </div>

        <nav className="b-links" aria-label="Links">
          <button className="b-link b-link--forte" style={{ '--d': 0 }} onClick={() => demo('abre o WhatsApp com a mensagem de agendamento pronta')}>
            <Icone tipo="whats" />
            <span className="b-txt"><strong>{tema.cta}</strong><small>Resposta rápida no WhatsApp</small></span>
            <Icone tipo="seta" />
          </button>

          <div className={`b-bloco ${aberto === 'servicos' ? 'b-bloco--aberto' : ''}`} style={{ '--d': 1 }}>
            <button className="b-link" aria-expanded={aberto === 'servicos'} onClick={() => setAberto(aberto === 'servicos' ? null : 'servicos')}>
              <Icone tipo="lista" />
              <span className="b-txt"><strong>Serviços e preços</strong><small>{tema.servicos.length} serviços</small></span>
              <Icone tipo="seta" />
            </button>
            <div className="b-gaveta"><div>
              <ul className="b-servicos">
                {tema.servicos.map(([s, p]) => <li key={s}><span>{s}</span><b>{p}</b></li>)}
              </ul>
            </div></div>
          </div>

          <div className={`b-bloco ${aberto === 'avaliacoes' ? 'b-bloco--aberto' : ''}`} style={{ '--d': 2 }}>
            <button className="b-link" aria-expanded={aberto === 'avaliacoes'} onClick={() => setAberto(aberto === 'avaliacoes' ? null : 'avaliacoes')}>
              <Icone tipo="estrela" />
              <span className="b-txt"><strong>{tema.nota} no Google</strong><small>{tema.avaliacoes} avaliações</small></span>
              <Icone tipo="seta" />
            </button>
            <div className="b-gaveta"><div>
              {tema.depoimentos.map(([t, a]) => (
                <blockquote key={a} className="b-depo"><p>{t}</p><cite>{a}</cite></blockquote>
              ))}
              <p className="b-nota-demo">Avaliações de exemplo. Na sua página entram as reais do seu Google.</p>
            </div></div>
          </div>

          <button className="b-link" style={{ '--d': 3 }} onClick={() => demo('abre a rota no Google Maps')}>
            <Icone tipo="mapa" />
            <span className="b-txt"><strong>Como chegar</strong><small>{tema.bairro}</small></span>
            <Icone tipo="seta" />
          </button>

          <button className="b-link" style={{ '--d': 4 }} onClick={() => demo('abre o seu Instagram')}>
            <Icone tipo="insta" />
            <span className="b-txt"><strong>Instagram</strong><small>Antes e depois, novidades e promoções</small></span>
            <Icone tipo="seta" />
          </button>
        </nav>

        <p className="b-horario">{tema.horario.texto}</p>

        <footer className="b-rodape">
          <a className="b-quero" href={quero} target="_blank" rel="noreferrer">
            Quero uma página assim · {brl(CONFIG.PRECO_BIO)} em {CONFIG.PRAZO_BIO_HORAS}h
          </a>
          <small>Feito por <a href={CONFIG.SITE_URL} target="_blank" rel="noreferrer">Tavin Digital</a></small>
        </footer>
      </main>

      {aviso && (
        <div className="b-aviso" role="status">
          <p>{aviso}</p>
          <a href={quero} target="_blank" rel="noreferrer">Quero a minha</a>
        </div>
      )}
    </div>
  )
}
