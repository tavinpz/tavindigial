import { useEffect, useMemo, useState } from 'react'
import { nichoSlug } from '../lib/msg'

// O "site" da prévia: a página de verdade do negócio, com o nome, a nota, as avaliações e o bairro do Google.
// Cada tipo de negócio tem a sua cara (cores, letras e serviços de exemplo).
const TEMAS = {
  estetica: {
    fontes: 'family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;700',
    titulo: "'Fraunces', serif", texto: "'Manrope', sans-serif",
    cor: { fundo: '#F3E7E1', papel: '#FFFAF7', tinta: '#3B2A2E', suave: '#8A6F72', acento: '#B76E79', sobreAcento: '#FFFFFF', linha: '#E6D3CC' },
    chamada: 'Cuidado com hora marcada, do jeito que você merece.',
    servicos: ['Limpeza de pele', 'Design de sobrancelha', 'Extensão de cílios', 'Drenagem linfática', 'Massagem relaxante', 'Depilação'],
  },
  nail: {
    fontes: 'family=Playfair+Display:wght@500;700&family=Manrope:wght@400;600;700',
    titulo: "'Playfair Display', serif", texto: "'Manrope', sans-serif",
    cor: { fundo: '#FBEFF2', papel: '#FFFFFF', tinta: '#3A1F2B', suave: '#8E6474', acento: '#A3345A', sobreAcento: '#FFFFFF', linha: '#F0D5DE' },
    chamada: 'Unhas impecáveis, com horário que cabe na sua semana.',
    servicos: ['Manicure', 'Pedicure', 'Esmaltação em gel', 'Alongamento', 'Spa dos pés', 'Nail art'],
  },
  barbearia: {
    fontes: 'family=Oswald:wght@500;700&family=Barlow:wght@400;600;700',
    titulo: "'Oswald', sans-serif", texto: "'Barlow', sans-serif",
    cor: { fundo: '#14201B', papel: '#1C2B24', tinta: '#F1EBDD', suave: '#A9B3A8', acento: '#C9A04A', sobreAcento: '#14201B', linha: '#2E4037' },
    chamada: 'Corte na régua e barba alinhada, sem fila.',
    servicos: ['Corte', 'Barba', 'Corte + barba', 'Pigmentação', 'Sobrancelha', 'Hidratação'],
  },
  pet: {
    fontes: 'family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700',
    titulo: "'Baloo 2', sans-serif", texto: "'Nunito', sans-serif",
    cor: { fundo: '#FFF6E2', papel: '#FFFFFF', tinta: '#23343B', suave: '#6A7A80', acento: '#0E7C7B', sobreAcento: '#FFFFFF', linha: '#F3E2BC' },
    chamada: 'Seu pet cheiroso e feliz, com horário marcado.',
    servicos: ['Banho', 'Banho e tosa', 'Tosa higiênica', 'Hidratação', 'Corte de unhas', 'Leva e traz'],
  },
  tatuagem: {
    fontes: 'family=Archivo+Black&family=Space+Grotesk:wght@400;500;700',
    titulo: "'Archivo Black', sans-serif", texto: "'Space Grotesk', sans-serif",
    cor: { fundo: '#0F0E10', papel: '#1A181C', tinta: '#F4F1EC', suave: '#A59FA8', acento: '#E5383B', sobreAcento: '#FFFFFF', linha: '#2D2A30' },
    chamada: 'Arte na pele, do primeiro rascunho à cicatrização.',
    servicos: ['Fine line', 'Blackwork', 'Colorida', 'Flash do dia', 'Piercing', 'Orçamento'],
  },
  odontologia: {
    fontes: 'family=Manrope:wght@400;600;800',
    titulo: "'Manrope', sans-serif", texto: "'Manrope', sans-serif",
    cor: { fundo: '#EEF7F6', papel: '#FFFFFF', tinta: '#11302E', suave: '#5D7573', acento: '#0B8A86', sobreAcento: '#FFFFFF', linha: '#D3E8E6' },
    chamada: 'Seu sorriso em boas mãos, com consulta marcada em minutos.',
    servicos: ['Avaliação', 'Limpeza', 'Clareamento', 'Restauração', 'Ortodontia', 'Implantes'],
  },
  saude: {
    fontes: 'family=DM+Serif+Display&family=DM+Sans:wght@400;600;700',
    titulo: "'DM Serif Display', serif", texto: "'DM Sans', sans-serif",
    cor: { fundo: '#EEF3EE', papel: '#FFFFFF', tinta: '#1F3329', suave: '#62746A', acento: '#2F6B4F', sobreAcento: '#FFFFFF', linha: '#D6E2D8' },
    chamada: 'Atendimento atencioso, com horário que respeita a sua rotina.',
    servicos: ['Consulta', 'Retorno', 'Avaliação inicial', 'Plano de acompanhamento', 'Atendimento on-line', 'Exames'],
  },
  alimentacao: {
    fontes: 'family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;600;700',
    titulo: "'Bricolage Grotesque', sans-serif", texto: "'DM Sans', sans-serif",
    cor: { fundo: '#FFF1E4', papel: '#FFFFFF', tinta: '#2B1A12', suave: '#80665A', acento: '#E4572E', sobreAcento: '#FFFFFF', linha: '#F4DCC8' },
    chamada: 'Peça em poucos toques e receba quentinho.',
    servicos: ['Cardápio do dia', 'Combos', 'Lanches', 'Bebidas', 'Sobremesas', 'Retirada no balcão'],
  },
  geral: {
    fontes: 'family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;600;700',
    titulo: "'Bricolage Grotesque', sans-serif", texto: "'DM Sans', sans-serif",
    cor: { fundo: '#EEF0FB', papel: '#FFFFFF', tinta: '#161A33', suave: '#5E6380', acento: '#3B4FD8', sobreAcento: '#FFFFFF', linha: '#D9DDF3' },
    chamada: 'Atendimento rápido, com horário marcado pelo WhatsApp.',
    servicos: ['Atendimento', 'Orçamento', 'Visita técnica', 'Serviço completo', 'Manutenção', 'Retorno'],
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

export default function SitePrevia({ nome, nicho, categoria, bairro, cidade, nota, avaliacoes, aviso }) {
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
  const notaTxt = nota != null ? String(nota).replace('.', ',') : null
  const estrelas = nota != null ? Math.round(Number(nota)) : 5
  const local = [bairro, cidade].filter(Boolean).join(', ')
  const d = dias[dia]
  const pedido = `${servico} · ${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} · ${hora}`
  const demo = (o) => aviso(o)

  const estilo = {
    '--sp-fundo': T.cor.fundo, '--sp-papel': T.cor.papel, '--sp-tinta': T.cor.tinta, '--sp-suave': T.cor.suave,
    '--sp-acento': T.cor.acento, '--sp-sobre': T.cor.sobreAcento, '--sp-linha': T.cor.linha,
    '--sp-titulo': T.titulo, '--sp-texto': T.texto,
  }

  return (
    <div className={`sp sp--${id}`} style={estilo}>
      <header className="sp-barra">
        <span className="sp-mono" aria-hidden="true">{iniciais(nome)}</span>
        <strong>{nome}</strong>
        <button type="button" onClick={() => demo('o WhatsApp de vocês abre com o pedido pronto')}>Agendar</button>
      </header>

      <section className="sp-hero" data-mono={iniciais(nome)}>
        <p className="sp-kicker">{[categoria, bairro].filter(Boolean).join(' · ')}</p>
        <h1>{nome}</h1>
        <p className="sp-chamada">{T.chamada}</p>
        {notaTxt && (
          <p className="sp-nota"><span aria-hidden="true">{'★'.repeat(estrelas)}</span> <b>{notaTxt}</b> · {avaliacoes} avaliações no Google</p>
        )}
        <div className="sp-acoes">
          <a href="#sp-agenda" className="sp-btn">Agendar horário</a>
          <a href="#sp-servicos" className="sp-btn sp-btn--linha">Ver serviços</a>
        </div>
      </section>

      <section className="sp-sec" id="sp-servicos">
        <h2>Serviços</h2>
        <p className="sp-obs">Exemplos: na página de vocês entram os seus serviços e preços.</p>
        <div className="sp-servicos" role="radiogroup" aria-label="Escolha o serviço">
          {T.servicos.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={servico === s} className={servico === s ? 'on' : ''} onClick={() => setServico(s)}>
              <span>{s}</span><i aria-hidden="true">{servico === s ? '✓' : '+'}</i>
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
          <button type="button" className="sp-btn" onClick={() => demo(`o pedido "${pedido}" chega pronto no WhatsApp de vocês`)}>Enviar pelo WhatsApp</button>
        </div>
      </section>

      {notaTxt && (
        <section className="sp-sec sp-aval">
          <div className="sp-aval-num"><b>{notaTxt}</b><span aria-hidden="true">{'★'.repeat(estrelas)}</span></div>
          <p><b>{avaliacoes} clientes</b> avaliaram {nome} no Google.</p>
          <button type="button" className="sp-link" onClick={() => demo('abre as avaliações de vocês no Google')}>Ver avaliações no Google</button>
        </section>
      )}

      <section className="sp-sec sp-onde">
        <h2>Onde estamos</h2>
        {local && <p>{local}</p>}
        <div className="sp-acoes">
          <button type="button" className="sp-btn sp-btn--linha" onClick={() => demo('abre o mapa com o endereço de vocês')}>Como chegar</button>
          <button type="button" className="sp-btn sp-btn--linha" onClick={() => demo('abre o Instagram de vocês')}>Instagram</button>
        </div>
      </section>

      <footer className="sp-rodape">
        <strong>{nome}</strong>
        <small>Página feita pela Tavin Digital</small>
      </footer>
    </div>
  )
}
