import { useState } from 'react'
import Casca, { Ico } from './Casca'

// Estúdio de tatuagem · layout "brutalista": flashes que se desenham, montador de orçamento
const BASE = { nome: 'Tinta Crua' }
const FLASHES = [
  ['Sol', 'M50 30a20 20 0 1 0 0 40 20 20 0 1 0 0-40ZM50 8v12M50 80v12M8 50h12M80 50h12M20 20l9 9M71 71l9 9M80 20l-9 9M29 71l-9 9'],
  ['Olho', 'M10 50Q50 15 90 50Q50 85 10 50ZM50 36a14 14 0 1 0 0 28 14 14 0 1 0 0-28ZM50 46a4 4 0 1 0 0 8 4 4 0 1 0 0-8Z'],
  ['Adaga', 'M50 8 58 22 54 62H46L42 22ZM30 62h40M46 62v10h8V62M50 72v20'],
  ['Lua', 'M64 14A36 36 0 1 0 64 86A28 28 0 1 1 64 14ZM78 30l3 6 6 1-5 4 1 6-5-3-6 3 1-6-4-4 6-1Z'],
  ['Cobra', 'M14 80c20 0 20-20 36-20s16 20 36 0M86 60c-8-14-24-14-30-4M20 30c10-12 30-12 34 4s-20 20-14 30'],
  ['Rosa', 'M50 26c10 0 16 8 12 16-4 8-16 8-20 0s0-16 8-16ZM42 42c-8 4-10 16 0 20s20 4 22-6M50 62v30M50 76c-8-4-14-2-18 4M50 82c8-4 14-2 18 2'],
]
const OPC = {
  tamanho: ['Até 5 cm', '5 a 12 cm', 'Fechamento'],
  local: ['Braço', 'Perna', 'Costas', 'Outro'],
  cor: ['Preto', 'Colorido'],
}

export default function Tatuagem() {
  const [flash, setFlash] = useState(null)
  const [orc, setOrc] = useState({ tamanho: OPC.tamanho[1], local: OPC.local[0], cor: OPC.cor[0] })
  const resumo = `${flash ? `flash ${flash}, ` : ''}${orc.tamanho.toLowerCase()}, ${orc.local.toLowerCase()}, ${orc.cor.toLowerCase()}`
  return (
    <Casca id="tatuagem" base={BASE} fontes="family=Unbounded:wght@600;800&family=Space+Grotesk:wght@400;500;700">
      {({ nome, demo }) => (
        <main className="tt">
          <header className="tt-topo">
            <span className="tt-selo" aria-hidden="true">
              <svg viewBox="0 0 100 100"><defs><path id="tt-c" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" /></defs>
                <text><textPath href="#tt-c" textLength="236" lengthAdjust="spacing">AGENDA ABERTA · NOVEMBRO ·</textPath></text></svg>
            </span>
            <h1>{nome.split(' ').map((p, i) => <span key={i}>{p}</span>)}</h1>
            <p>Fineline, blackwork e flash autoral. Vila Madalena.</p>
          </header>

          <section className="tt-flash">
            <h2>Flash disponível <small>toque para escolher</small></h2>
            <div className="tt-grade">
              {FLASHES.map(([n, d], i) => (
                <button key={n} className={flash === n ? 'on' : ''} aria-pressed={flash === n} style={{ '--d': i }} onClick={() => setFlash(flash === n ? null : n)}>
                  <svg viewBox="0 0 100 100" aria-hidden="true"><path d={d} pathLength="1" /></svg>
                  <span>{String(i + 1).padStart(2, '0')} · {n}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="tt-orc">
            <h2>Monte seu orçamento</h2>
            {Object.entries(OPC).map(([k, ops]) => (
              <div key={k} className="tt-linha" role="group" aria-label={k}>
                <span>{k}</span>
                <div>{ops.map((o) => <button key={o} className={orc[k] === o ? 'on' : ''} aria-pressed={orc[k] === o} onClick={() => setOrc({ ...orc, [k]: o })}>{o}</button>)}</div>
              </div>
            ))}
            <p className="tt-resumo">{resumo}</p>
            <button className="tt-cta" onClick={() => demo(`manda no WhatsApp o pedido de orçamento: ${resumo}`)}>
              Pedir orçamento <Ico n="seta" s={18} />
            </button>
          </section>

          <div className="tt-links">
            <button onClick={() => demo('abre o portfólio no Instagram')}><Ico n="insta" /> Portfólio</button>
            <button onClick={() => demo('abre a rota no Google Maps')}><Ico n="mapa" /> Vila Madalena</button>
          </div>
          <p className="tt-cuidados">Maiores de 18 anos · sinal de 30% para reservar · retoque grátis em 30 dias</p>
        </main>
      )}
    </Casca>
  )
}
