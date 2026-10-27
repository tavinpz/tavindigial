import { useState } from 'react'
import Casca, { Ico } from './Casca'

// Nutricionista · layout "editorial": tipografia grande, objetivo que muda o texto, links numerados
const BASE = { nome: 'Dra. Helena Prado' }
const OBJETIVOS = {
  Emagrecer: 'Plano sem cortar o que você gosta, com metas por semana e ajustes no retorno.',
  'Ganhar massa': 'Proteína na medida certa para o seu treino, com cardápio que cabe na rotina.',
  Gestação: 'Acompanhamento do primeiro trimestre ao pós-parto, com exames e suplementação.',
  Intestino: 'Investigação de sintomas e mudanças graduais, sem dieta restritiva.',
}
const LINKS = [
  ['Consulta presencial', 'Vila Madalena · 60 min', 'R$ 280'],
  ['Consulta online', 'Por vídeo, de qualquer lugar', 'R$ 240'],
  ['Plano trimestral', '3 consultas + suporte no WhatsApp', 'R$ 690'],
  ['Receitas no Instagram', 'Pratos rápidos da semana', ''],
]

export default function Nutricionista() {
  const [obj, setObj] = useState('Emagrecer')
  return (
    <Casca id="nutricionista" base={BASE} fontes="family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;700">
      {({ nome, demo }) => (
        <main className="nt">
          <header className="nt-topo">
            <p className="nt-quem"><span className="nt-av" aria-hidden="true">{nome.replace(/^(dra?\.?\s)/i, '').slice(0, 1)}</span>{nome}<small>Nutricionista · CRN-3 00000 (exemplo)</small></p>
            <h1>Comer bem, <em>sem dieta</em> da moda.</h1>
            <svg className="nt-folha" viewBox="0 0 120 120" aria-hidden="true"><path d="M20 100C20 50 50 20 100 20c0 50-30 80-80 80Z" /><path d="M20 100 78 42" /></svg>
          </header>

          <section className="nt-obj">
            <h2>Qual é o seu objetivo?</h2>
            <div className="nt-chips" role="group" aria-label="Objetivo">
              {Object.keys(OBJETIVOS).map((o) => <button key={o} className={o === obj ? 'on' : ''} aria-pressed={o === obj} onClick={() => setObj(o)}>{o}</button>)}
            </div>
            <p className="nt-resposta" key={obj}>{OBJETIVOS[obj]}</p>
            <button className="nt-cta" onClick={() => demo(`abre o WhatsApp para agendar uma consulta com foco em ${obj.toLowerCase()}`)}>
              Agendar consulta · {obj.toLowerCase()} <Ico n="seta" s={18} />
            </button>
          </section>

          <ol className="nt-links">
            {LINKS.map(([t, d, p], i) => (
              <li key={t} style={{ '--d': i }}>
                <button onClick={() => demo(p ? `abre o agendamento de ${t.toLowerCase()}` : 'abre o seu Instagram')}>
                  <span className="nt-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nt-t"><b>{t}</b><small>{d}</small></span>
                  {p && <span className="nt-p">{p}</span>}
                </button>
              </li>
            ))}
          </ol>

          <blockquote className="nt-depo">
            <p>“Perdi 9 kg em 5 meses comendo pão no café. Pela primeira vez não foi sofrido.”</p>
            <cite>Renata, 38 · avaliação de exemplo</cite>
          </blockquote>

          <p className="nt-local"><Ico n="mapa" s={16} /> Vila Madalena, São Paulo · Seg a sex, 8h às 18h</p>
        </main>
      )}
    </Casca>
  )
}
