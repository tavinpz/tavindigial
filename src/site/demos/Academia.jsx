import { useEffect, useState } from 'react'
import Casca, { Ico } from './Casca'

// Studio fitness · layout "energia": grade de aulas por dia com vagas, planos e aula experimental
const BASE = { nome: 'Pulse Studio' }
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const AULAS = {
  Seg: [['06:30', 'Funcional', 'Bia', 9, 12], ['12:00', 'HIIT 30', 'Léo', 4, 10], ['19:00', 'Pilates solo', 'Carol', 11, 12]],
  Ter: [['07:00', 'Mobilidade', 'Carol', 5, 12], ['18:30', 'Funcional', 'Bia', 12, 12], ['20:00', 'Box fit', 'Léo', 6, 14]],
  Qua: [['06:30', 'Funcional', 'Bia', 7, 12], ['12:00', 'HIIT 30', 'Léo', 2, 10], ['19:00', 'Pilates solo', 'Carol', 8, 12]],
  Qui: [['07:00', 'Mobilidade', 'Carol', 3, 12], ['18:30', 'Funcional', 'Bia', 10, 12], ['20:00', 'Box fit', 'Léo', 13, 14]],
  Sex: [['06:30', 'Funcional', 'Bia', 6, 12], ['18:00', 'HIIT 30', 'Léo', 9, 10]],
  Sáb: [['09:00', 'Treino em dupla', 'Todos', 8, 16], ['10:30', 'Alongamento', 'Carol', 4, 12]],
}
const PLANOS = [['Avulsa', 'R$ 45', 'por aula'], ['2x na semana', 'R$ 249', 'por mês'], ['Livre', 'R$ 349', 'por mês']]

export default function Academia() {
  const hoje = DIAS[Math.max(0, Math.min(5, new Date().getDay() - 1))]
  const [dia, setDia] = useState(hoje)
  const [cheio, setCheio] = useState(false)
  useEffect(() => { setCheio(false); const t = setTimeout(() => setCheio(true), 60); return () => clearTimeout(t) }, [dia])

  return (
    <Casca id="academia" base={BASE} fontes="family=Big+Shoulders+Display:wght@700;900&family=Inter+Tight:wght@400;600;800">
      {({ nome, demo }) => (
        <main className="ac">
          <header className="ac-topo">
            <h1>{nome.split(' ').map((p, i) => <span key={i} style={{ '--i': i }}>{p}</span>)}</h1>
            <p>Funcional, HIIT e pilates em turmas pequenas. Perdizes.</p>
            <button className="ac-exp" onClick={() => demo('abre o WhatsApp para marcar a aula experimental grátis')}>
              <span className="ac-pulso" aria-hidden="true" />Aula experimental grátis
            </button>
          </header>

          <div className="ac-faixa" aria-hidden="true"><div>{Array.from({ length: 3 }, () => ['Funcional', 'HIIT', 'Pilates', 'Box fit', 'Mobilidade']).flat().map((t, i) => <span key={i}>{t}</span>)}</div></div>

          <section className="ac-grade">
            <h2>Aulas da semana</h2>
            <div className="ac-dias" role="tablist" aria-label="Dia da semana">
              {DIAS.map((d) => <button key={d} role="tab" aria-selected={d === dia} className={d === dia ? 'on' : ''} onClick={() => setDia(d)}>{d}</button>)}
            </div>
            <ul className="ac-aulas" key={dia}>
              {AULAS[dia].map(([h, aula, prof, ocup, tot], i) => {
                const lotada = ocup >= tot
                return (
                  <li key={h} style={{ '--d': i }}>
                    <time>{h}</time>
                    <div className="ac-aula">
                      <b>{aula}</b><small>com {prof} · {lotada ? 'turma cheia' : `${tot - ocup} vagas`}</small>
                      <span className="ac-barra"><i style={{ width: cheio ? `${(ocup / tot) * 100}%` : 0 }} /></span>
                    </div>
                    <button disabled={lotada} onClick={() => demo(`reserva a aula de ${aula.toLowerCase()} de ${dia.toLowerCase()} às ${h} pelo WhatsApp`)}>{lotada ? 'Lista' : 'Reservar'}</button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="ac-planos">
            {PLANOS.map(([t, p, u], i) => (
              <button key={t} className={i === 1 ? 'destaque' : ''} onClick={() => demo(`abre o WhatsApp para assinar o plano ${t.toLowerCase()}`)}>
                {i === 1 && <em>Mais escolhido</em>}<span>{t}</span><b>{p}</b><small>{u}</small>
              </button>
            ))}
          </section>

          <p className="ac-local"><Ico n="mapa" s={16} /> Perdizes, São Paulo · Seg a sáb</p>
        </main>
      )}
    </Casca>
  )
}
