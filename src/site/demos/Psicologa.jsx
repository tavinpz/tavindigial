import { useEffect, useRef, useState } from 'react'
import Casca, { Ico } from './Casca'

// Psicóloga · layout "calma": respiração guiada interativa, temas, como funciona, agendamento
const BASE = { nome: 'Marina Alves' }
const FASES = [['Inspire', 4], ['Segure', 4], ['Solte', 6]]
const TEMAS = ['Ansiedade', 'Relacionamentos', 'Luto', 'Autoestima', 'Carreira', 'Burnout']

function Respiro() {
  const [ativo, setAtivo] = useState(false)
  const [fase, setFase] = useState(0)
  const [ciclos, setCiclos] = useState(0)
  const t = useRef(null)
  useEffect(() => {
    if (!ativo) return
    const [, seg] = FASES[fase]
    t.current = setTimeout(() => {
      const prox = (fase + 1) % FASES.length
      if (prox === 0) setCiclos((c) => c + 1)
      setFase(prox)
    }, seg * 1000)
    return () => clearTimeout(t.current)
  }, [ativo, fase])
  useEffect(() => { if (ciclos >= 4) { setAtivo(false); setCiclos(0); setFase(0) } }, [ciclos])
  const [nomeFase, seg] = FASES[fase]
  return (
    <section className="ps-resp">
      <div className={`ps-bola ${ativo ? `f${fase}` : ''}`} style={{ '--seg': `${seg}s` }}>
        <span>{ativo ? nomeFase : 'Respire comigo'}</span>
      </div>
      <button className="ps-resp-btn" onClick={() => { setAtivo((a) => !a); setFase(0); setCiclos(0) }}>
        {ativo ? 'Parar' : 'Começar 1 minuto de respiração'}
      </button>
    </section>
  )
}

export default function Psicologa() {
  return (
    <Casca id="psicologa" base={BASE} fontes="family=Lora:ital,wght@0,500;1,500&family=Nunito+Sans:wght@400;600;800">
      {({ nome, demo, local }) => (
        <main className="ps">
          <header className="ps-topo">
            <div className="ps-av" aria-hidden="true"><span /></div>
            <h1>{nome}</h1>
            <p className="ps-cargo">Psicóloga clínica · CRP 06/000000 (exemplo)</p>
            <p className="ps-frase">Um espaço seguro para entender o que você sente, no seu ritmo.</p>
            <div className="ps-modos"><span><Ico n="video" s={16} /> Online</span><span><Ico n="casa" s={16} /> Presencial em {local('Pinheiros')}</span></div>
          </header>

          <Respiro />

          <section className="ps-temas">
            <h2>Posso te ajudar com</h2>
            <div>{TEMAS.map((t, i) => <span key={t} style={{ '--d': i }}>{t}</span>)}</div>
          </section>

          <section className="ps-passos">
            <h2>Como funciona</h2>
            <ol>
              <li><b>Primeira conversa</b><span>Para nos conhecermos e você tirar dúvidas.</span></li>
              <li><b>Sessões semanais</b><span>50 minutos, online ou presencial.</span></li>
              <li><b>No seu tempo</b><span>Sem prazo fixo e com sigilo profissional.</span></li>
            </ol>
          </section>

          <button className="ps-cta" onClick={() => demo('abre o WhatsApp para agendar a primeira conversa')}>
            <Ico n="calendario" s={20} /> Agendar primeira conversa
          </button>
          <button className="ps-link" onClick={() => demo('abre o seu Instagram')}><Ico n="insta" s={18} /> Textos sobre saúde emocional</button>

          <p className="ps-aviso">Em crise ou risco imediato, ligue 188 (CVV) ou procure o pronto-socorro mais próximo.</p>
        </main>
      )}
    </Casca>
  )
}
