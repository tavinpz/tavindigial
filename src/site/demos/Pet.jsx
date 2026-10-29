import { useMemo, useState } from 'react'
import Casca, { Ico, abertoAgora } from './Casca'

// Pet shop · layout "app": cartão de herói, escolha do pet, serviços que se marcam e barra de abas
const BASE = { nome: 'Patas & Cia' }
const HORARIO = { dias: [1, 2, 3, 4, 5, 6], abre: 8, fecha: 19 }
const SERVICOS = {
  cao: [
    ['Banho', 'a partir de R$ 55', 'gota'], ['Banho e tosa', 'a partir de R$ 95', 'tesoura'],
    ['Hidratação', 'R$ 35', 'coracao'], ['Leva e traz', 'R$ 15', 'carro'],
  ],
  gato: [
    ['Banho felino', 'a partir de R$ 70', 'gota'], ['Tosa higiênica', 'R$ 60', 'tesoura'],
    ['Corte de unhas', 'R$ 25', 'coracao'], ['Leva e traz', 'R$ 15', 'carro'],
  ],
}

const Pata = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="42" rx="14" ry="12" /><ellipse cx="14" cy="27" rx="6" ry="8" /><ellipse cx="25" cy="16" rx="6" ry="8" />
    <ellipse cx="39" cy="16" rx="6" ry="8" /><ellipse cx="50" cy="27" rx="6" ry="8" />
  </svg>
)

export default function Pet() {
  const [pet, setPet] = useState('cao')
  const [marcados, setMarcados] = useState(() => new Set(['Banho e tosa']))
  const aberta = useMemo(() => abertoAgora(HORARIO), [])
  const lista = SERVICOS[pet]
  const escolhidos = lista.filter(([n]) => marcados.has(n))
  const alternar = (n) => setMarcados((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x })

  return (
    <Casca id="pet" base={BASE} fontes="family=Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800">
      {({ nome, demo, local, nota, aval }) => (
        <main className="pt">
          <header className="pt-heroi">
            <div className="pt-patas" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <Pata key={i} className={`pt-pata p${i}`} />)}</div>
            <span className={`pt-status ${aberta ? 'on' : ''}`}><i />{aberta ? 'Aberto agora' : 'Fechado agora'}</span>
            <h1>{nome}</h1>
            <p>Banho, tosa e carinho em {local('Perdizes')}. Seu pet volta cheiroso e feliz.</p>
            <div className="pt-selos"><span><Ico n="estrela" s={14} cheio /> {nota('4,9')} · {aval('540')} avaliações</span><span><Ico n="carro" s={14} /> Leva e traz</span></div>
          </header>

          <section className="pt-sec" id="pt-servicos">
            <h2>Quem vem hoje?</h2>
            <div className="pt-pets" role="group" aria-label="Tipo de pet">
              {[['cao', 'Cachorro'], ['gato', 'Gato']].map(([k, t]) => (
                <button key={k} className={pet === k ? 'on' : ''} aria-pressed={pet === k} onClick={() => { setPet(k); setMarcados(new Set([SERVICOS[k][1][0]])) }}>
                  <Pata className="pt-mini" /> {t}
                </button>
              ))}
            </div>
            <div className="pt-grade">
              {lista.map(([n, preco, ico], i) => (
                <button key={n} className={`pt-tile ${marcados.has(n) ? 'on' : ''}`} style={{ '--d': i }} aria-pressed={marcados.has(n)} onClick={() => alternar(n)}>
                  <span className="pt-tile-ico"><Ico n={ico} s={22} /></span>
                  <b>{n}</b><small>{preco}</small>
                  <span className="pt-check"><Ico n="check" s={14} /></span>
                </button>
              ))}
            </div>
          </section>

          <button className="pt-cta" onClick={() => demo(`abre o WhatsApp pedindo ${escolhidos.map(([n]) => n.toLowerCase()).join(' + ') || 'um horário'} para o seu ${pet === 'cao' ? 'cachorro' : 'gato'}`)}>
            <Ico n="whats" s={22} cheio />
            {escolhidos.length ? `Agendar ${escolhidos.length} ${escolhidos.length > 1 ? 'serviços' : 'serviço'}` : 'Agendar no WhatsApp'}
          </button>

          <section className="pt-sec pt-info" id="pt-agenda">
            <div><Ico n="relogio" /><span><b>Seg a sáb</b><small>8h às 19h</small></span></div>
            <div><Ico n="mapa" /><span><b>{local('Perdizes')}</b><small>Rua de exemplo, 123</small></span></div>
            <button onClick={() => demo('abre a rota no Google Maps')}><Ico n="seta" /></button>
          </section>

          <blockquote className="pt-depo">
            <p>“A Mel volta toda arrumada e com lacinho. O leva e traz salva a minha semana.”</p>
            <cite>Fernanda, tutora da Mel · avaliação de exemplo</cite>
          </blockquote>

          <nav className="pt-abas" aria-label="Atalhos">
            <a href="#pt-servicos"><Ico n="casa" s={20} /><span>Início</span></a>
            <a href="#pt-servicos"><Ico n="lista" s={20} /><span>Serviços</span></a>
            <button onClick={() => demo('abre a agenda no WhatsApp')}><Ico n="calendario" s={20} /><span>Agenda</span></button>
            <button onClick={() => demo('abre o seu Instagram')}><Ico n="insta" s={20} /><span>Fotos</span></button>
          </nav>
        </main>
      )}
    </Casca>
  )
}
