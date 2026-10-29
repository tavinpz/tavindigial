import { useEffect, useMemo, useRef, useState } from 'react'
import { nichoSlug, slugDominio } from '../lib/msg'
import ArtePrevia from './ArtePrevia'

// O "site" da prévia: a página de verdade do negócio, com o nome, a nota, as avaliações e o bairro do Google.
// Cada tipo de negócio tem a sua cara (cores, letras e serviços de exemplo).
const TEMAS = {
  estetica: {
    fontes: 'family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;700',
    titulo: "'Fraunces', serif", texto: "'Manrope', sans-serif",
    cor: { fundo: '#F3E7E1', papel: '#FFFAF7', tinta: '#3B2A2E', suave: '#8A6F72', acento: '#B76E79', sobreAcento: '#FFFFFF', linha: '#E6D3CC' },
    chamada: 'Cuidado com hora marcada, do jeito que você merece.',
    servicos: ['Limpeza de pele', 'Design de sobrancelha', 'Extensão de cílios', 'Drenagem linfática', 'Massagem relaxante', 'Depilação'],
    duracoes: ['60 min', '40 min', '2 h', '50 min', '60 min', '30 min'],
  },
  nail: {
    fontes: 'family=Playfair+Display:wght@500;700&family=Manrope:wght@400;600;700',
    titulo: "'Playfair Display', serif", texto: "'Manrope', sans-serif",
    cor: { fundo: '#FBEFF2', papel: '#FFFFFF', tinta: '#3A1F2B', suave: '#8E6474', acento: '#A3345A', sobreAcento: '#FFFFFF', linha: '#F0D5DE' },
    chamada: 'Unhas impecáveis, com horário que cabe na sua semana.',
    servicos: ['Manicure', 'Pedicure', 'Esmaltação em gel', 'Alongamento', 'Spa dos pés', 'Nail art'],
    duracoes: ['45 min', '50 min', '60 min', '2 h', '40 min', '30 min'],
  },
  barbearia: {
    fontes: 'family=Oswald:wght@500;700&family=Barlow:wght@400;600;700',
    titulo: "'Oswald', sans-serif", texto: "'Barlow', sans-serif",
    cor: { fundo: '#14201B', papel: '#1C2B24', tinta: '#F1EBDD', suave: '#A9B3A8', acento: '#C9A04A', sobreAcento: '#14201B', linha: '#2E4037' },
    chamada: 'Corte na régua e barba alinhada, sem fila.',
    servicos: ['Corte', 'Barba', 'Corte + barba', 'Pigmentação', 'Sobrancelha', 'Hidratação'],
    duracoes: ['40 min', '30 min', '1 h', '45 min', '15 min', '30 min'],
  },
  pet: {
    fontes: 'family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700',
    titulo: "'Baloo 2', sans-serif", texto: "'Nunito', sans-serif",
    cor: { fundo: '#FFF6E2', papel: '#FFFFFF', tinta: '#23343B', suave: '#6A7A80', acento: '#0E7C7B', sobreAcento: '#FFFFFF', linha: '#F3E2BC' },
    chamada: 'Seu pet cheiroso e feliz, com horário marcado.',
    servicos: ['Banho', 'Banho e tosa', 'Tosa higiênica', 'Hidratação', 'Corte de unhas', 'Leva e traz'],
    duracoes: ['1 h', '2 h', '40 min', '30 min', '15 min', 'combinar'],
  },
  tatuagem: {
    fontes: 'family=Archivo+Black&family=Space+Grotesk:wght@400;500;700',
    titulo: "'Archivo Black', sans-serif", texto: "'Space Grotesk', sans-serif",
    cor: { fundo: '#0F0E10', papel: '#1A181C', tinta: '#F4F1EC', suave: '#A59FA8', acento: '#E5383B', sobreAcento: '#FFFFFF', linha: '#2D2A30' },
    chamada: 'Arte na pele, do primeiro rascunho à cicatrização.',
    servicos: ['Fine line', 'Blackwork', 'Colorida', 'Flash do dia', 'Piercing', 'Orçamento'],
    duracoes: ['2 a 4 h', '3 a 6 h', '3 a 6 h', '1 a 2 h', '30 min', '15 min'],
  },
  odontologia: {
    fontes: 'family=Manrope:wght@400;600;800',
    titulo: "'Manrope', sans-serif", texto: "'Manrope', sans-serif",
    cor: { fundo: '#EEF7F6', papel: '#FFFFFF', tinta: '#11302E', suave: '#5D7573', acento: '#0B8A86', sobreAcento: '#FFFFFF', linha: '#D3E8E6' },
    chamada: 'Seu sorriso em boas mãos, com consulta marcada em minutos.',
    servicos: ['Avaliação', 'Limpeza', 'Clareamento', 'Restauração', 'Ortodontia', 'Implantes'],
    duracoes: ['30 min', '40 min', '1 h', '40 min', '30 min', '1 h'],
  },
  saude: {
    fontes: 'family=DM+Serif+Display&family=DM+Sans:wght@400;600;700',
    titulo: "'DM Serif Display', serif", texto: "'DM Sans', sans-serif",
    cor: { fundo: '#EEF3EE', papel: '#FFFFFF', tinta: '#1F3329', suave: '#62746A', acento: '#2F6B4F', sobreAcento: '#FFFFFF', linha: '#D6E2D8' },
    chamada: 'Atendimento atencioso, com horário que respeita a sua rotina.',
    servicos: ['Consulta', 'Retorno', 'Avaliação inicial', 'Plano de acompanhamento', 'Atendimento on-line', 'Exames'],
    duracoes: ['50 min', '30 min', '1 h', 'mensal', '50 min', '20 min'],
  },
  alimentacao: {
    fontes: 'family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;600;700',
    titulo: "'Bricolage Grotesque', sans-serif", texto: "'DM Sans', sans-serif",
    cor: { fundo: '#FFF1E4', papel: '#FFFFFF', tinta: '#2B1A12', suave: '#80665A', acento: '#E4572E', sobreAcento: '#FFFFFF', linha: '#F4DCC8' },
    chamada: 'Peça em poucos toques e receba quentinho.',
    servicos: ['Cardápio do dia', 'Combos', 'Lanches', 'Bebidas', 'Sobremesas', 'Retirada no balcão'],
    duracoes: ['', '', '', '', '', ''],
  },
  geral: {
    fontes: 'family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;600;700',
    titulo: "'Bricolage Grotesque', sans-serif", texto: "'DM Sans', sans-serif",
    cor: { fundo: '#EEF0FB', papel: '#FFFFFF', tinta: '#161A33', suave: '#5E6380', acento: '#3B4FD8', sobreAcento: '#FFFFFF', linha: '#D9DDF3' },
    chamada: 'Atendimento rápido, com horário marcado pelo WhatsApp.',
    servicos: ['Atendimento', 'Orçamento', 'Visita técnica', 'Serviço completo', 'Manutenção', 'Retorno'],
    duracoes: ['30 min', '15 min', '1 h', '2 h', '1 h', '30 min'],
  },
}

export function temaDe(nicho, categoria = '', nome = '') {
  const t = `${categoria} ${nome}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const slug = nichoSlug(nicho, categoria)
  if (slug === 'estetica' && /unha|nail|manicure|esmalt/.test(t)) return 'nail'
  return TEMAS[slug] ? slug : 'geral'
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const HORAS = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30']
const iniciais = (nome) => nome.split(/\s+/).filter((p) => p.length > 2 || /^[A-Z]/.test(p)).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || nome.slice(0, 2).toUpperCase()

// Número que sobe quando aparece na tela (nota do Google)
function useSobe(alvo, casas = 1) {
  const ref = useRef(null)
  const [v, setV] = useState(alvo)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    setV(0)
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const passo = (t) => { const p = Math.min(1, (t - t0) / 900); setV(alvo * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(passo) }
      raf = requestAnimationFrame(passo)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [alvo])
  return [ref, Number(v).toFixed(casas).replace('.', ',')]
}

export default function SitePrevia({ nome, nicho, categoria, bairro, cidade, endereco, instagram, nota, avaliacoes, aviso }) {
  const id = temaDe(nicho, categoria, nome)
  const T = TEMAS[id]
  useEffect(() => {
    const l = document.createElement('link')
    l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${T.fontes}&display=swap`
    document.head.appendChild(l)
    return () => l.remove()
  }, [T.fontes])

  // próximos 6 dias com atendimento (sem domingo)
  const dias = useMemo(() => {
    const r = []; const d = new Date()
    while (r.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) r.push(new Date(d)) }
    return r
  }, [])
  const [servico, setServico] = useState(T.servicos[0])
  const [dia, setDia] = useState(0)
  const [hora, setHora] = useState(HORAS[3])
  const [folha, setFolha] = useState(false)
  const temNota = nota != null && !Number.isNaN(Number(nota))
  const notaTxt = temNota ? String(nota).replace('.', ',') : null
  const [refNota, notaSobe] = useSobe(temNota ? Number(nota) : 0, Number.isInteger(Number(nota)) ? 0 : 1)
  const estrelas = temNota ? Math.round(Number(nota)) : 5
  const local = [bairro, cidade].filter(Boolean).join(', ')
  const dominio = `${slugDominio(nome)}.com.br`
  const ig = instagram ? String(instagram).replace(/^@/, '') : ''
  const d = dias[dia]
  const quando = `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  const pedido = `${servico} · ${quando} · ${hora}`
  const demo = (o) => aviso(o)
  const mapa = endereco ? `https://maps.google.com/maps?q=${encodeURIComponent(`${nome}, ${endereco}`)}&z=15&output=embed` : null

  const estilo = {
    '--sp-fundo': T.cor.fundo, '--sp-papel': T.cor.papel, '--sp-tinta': T.cor.tinta, '--sp-suave': T.cor.suave,
    '--sp-acento': T.cor.acento, '--sp-sobre': T.cor.sobreAcento, '--sp-linha': T.cor.linha,
    '--sp-titulo': T.titulo, '--sp-texto': T.texto,
  }
  const entra = (i) => ({ className: 'sp-in', style: { '--i': i } })

  return (
    <div className={`sp sp--${id}`} style={estilo}>
      <div className="sp-dominio" aria-label={`Endereço da página: ${dominio}`}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="7" width="10" height="7" rx="2" fill="currentColor" /></svg>
        <span>{dominio}</span>
      </div>
      <header className="sp-barra">
        <span className="sp-mono" aria-hidden="true">{iniciais(nome)}</span>
        <strong>{nome}</strong>
        <button type="button" onClick={() => setFolha(true)}>Agendar</button>
      </header>

      <section className="sp-hero">
        <div {...entra(0)} className="sp-in sp-arte">
          <ArtePrevia tema={id} />
          {(categoria || bairro) && <span className="sp-selo">{[categoria, bairro].filter(Boolean).join(' · ')}</span>}
        </div>
        <h1 {...entra(1)}>{nome}</h1>
        <p {...entra(2)} className="sp-in sp-chamada">{T.chamada}</p>
        {notaTxt && (
          <p {...entra(3)} className="sp-in sp-nota"><span aria-hidden="true">{'★'.repeat(estrelas)}</span> <b>{notaTxt}</b> · {avaliacoes} avaliações no Google</p>
        )}
        <div {...entra(4)} className="sp-in sp-acoes">
          <a href="#sp-agenda" className="sp-btn">Agendar horário</a>
          <a href="#sp-servicos" className="sp-btn sp-btn--linha">Ver serviços</a>
        </div>
      </section>

      <section className="sp-sec" id="sp-servicos">
        <h2>Serviços</h2>
        <p className="sp-obs">Exemplos: na página de vocês entram os seus serviços, fotos e preços.</p>
        <div className="sp-servicos" role="radiogroup" aria-label="Escolha o serviço">
          {T.servicos.map((s, i) => (
            <button key={s} type="button" role="radio" aria-checked={servico === s} className={servico === s ? 'on' : ''} onClick={() => setServico(s)}>
              <span className="sp-serv-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="sp-serv-t"><b>{s}</b>{T.duracoes?.[i] && <small>{T.duracoes[i]}</small>}</span>
              <i aria-hidden="true">{servico === s ? '✓' : '+'}</i>
            </button>
          ))}
        </div>
      </section>

      <section className="sp-sec sp-agenda" id="sp-agenda">
        <h2>Escolha o dia e o horário</h2>
        <div className="sp-dias" role="radiogroup" aria-label="Dia">
          {dias.map((x, i) => (
            <button key={i} type="button" role="radio" aria-checked={dia === i} className={dia === i ? 'on' : ''} onClick={() => setDia(i)}>
              <small>{DIAS[x.getDay()]}</small><b>{x.getDate()}</b>
            </button>
          ))}
        </div>
        <div className="sp-horas" role="radiogroup" aria-label="Horário">
          {HORAS.map((h) => <button key={h} type="button" role="radio" aria-checked={hora === h} className={hora === h ? 'on' : ''} onClick={() => setHora(h)}>{h}</button>)}
        </div>
        <div className="sp-pedido">
          <small>Seu pedido</small>
          <b>{pedido}</b>
          <button type="button" className="sp-btn" onClick={() => setFolha(true)}>Enviar pelo WhatsApp</button>
        </div>
      </section>

      {notaTxt && (
        <section className="sp-sec sp-aval" ref={refNota}>
          <div className="sp-aval-num"><b>{notaSobe}</b><span aria-hidden="true">{'★'.repeat(estrelas)}</span></div>
          <p><b>{avaliacoes} clientes</b> avaliaram {nome} no Google.</p>
          <button type="button" className="sp-link" onClick={() => demo('abre as avaliações de vocês no Google')}>Ver avaliações no Google</button>
        </section>
      )}

      {ig && (
        <section className="sp-sec sp-ig">
          <span className="sp-ig-foto" aria-hidden="true"><span>{iniciais(nome)}</span></span>
          <div><b>@{ig}</b><small>Novidades, resultados e horários livres</small></div>
          <button type="button" className="sp-btn sp-btn--linha" onClick={() => demo(`abre o Instagram @${ig}`)}>Seguir</button>
        </section>
      )}

      <section className="sp-sec sp-onde">
        <h2>Onde estamos</h2>
        {(endereco || local) && <p>{endereco || local}</p>}
        {mapa && <div className="sp-mapa"><iframe src={mapa} title={`Mapa: ${nome}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
        <div className="sp-acoes">
          <button type="button" className="sp-btn sp-btn--linha" onClick={() => demo('abre a rota no Google Maps ou no Waze')}>Como chegar</button>
        </div>
      </section>

      <footer className="sp-rodape">
        <strong>{nome}</strong>
        <small>{dominio} · © {new Date().getFullYear()}</small>
        <small>Página feita pela Tavin Digital</small>
      </footer>

      {folha && (
        <div className="sp-folha-fundo" onClick={() => setFolha(false)}>
          <div className="sp-folha" role="dialog" aria-label="Como o pedido chega no WhatsApp" onClick={(e) => e.stopPropagation()}>
            <p className="sp-folha-tit">É assim que o pedido chega no WhatsApp de vocês</p>
            <div className="sp-wa">
              <div className="sp-wa-topo"><span className="sp-mono" aria-hidden="true">{iniciais(nome)}</span><b>{nome}</b></div>
              <div className="sp-wa-chat">
                <div className="sp-wa-bolha">Olá! Vim pela página de vocês e quero agendar:<br /><b>{servico}</b><br />{quando} às {hora}<br />Pode confirmar? 😊<small>agora ✓✓</small></div>
              </div>
            </div>
            <p className="sp-folha-txt">O cliente escolhe e o pedido já chega pronto, sem aquela troca de mensagens para achar um horário.</p>
            <button type="button" className="sp-btn" onClick={() => setFolha(false)}>Entendi</button>
          </div>
        </div>
      )}
    </div>
  )
}
