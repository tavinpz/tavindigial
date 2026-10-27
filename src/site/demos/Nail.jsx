import { useState } from 'react'
import Casca, { Ico } from './Casca'

// Nail designer · layout "galeria": escolha a cor e veja nas unhas, serviços em trilho, galeria
const BASE = { nome: 'Ateliê Rosé' }
const CORES = [
  // [nome, cor, cor do texto no botão]
  ['Nude rosé', '#E8B4AE', '#3B2129'], ['Vermelho cereja', '#B3122E', '#fff'], ['Lilás', '#B9A3E3', '#2A1D45'], ['Verde oliva', '#7D8B4A', '#fff'],
  ['Chocolate', '#5A3A2E', '#fff'], ['Azul noite', '#1F2A55', '#fff'], ['Coral', '#FF7F6A', '#3B1510'], ['Francesinha', '#F6EDE6', '#3B2129'],
]
const SERVICOS = [
  ['Esmaltação em gel', '1h', 'R$ 90'], ['Alongamento em fibra', '2h30', 'R$ 220'],
  ['Manutenção', '1h30', 'R$ 140'], ['Cílios fio a fio', '2h', 'R$ 180'], ['Design de sobrancelha', '40 min', 'R$ 60'],
]
// "Fotos" da galeria desenhadas com gradientes
const GALERIA = [
  'linear-gradient(135deg,#E8B4AE,#F6EDE6)', 'radial-gradient(circle at 30% 30%,#B3122E,#5A0B1A)',
  'linear-gradient(160deg,#B9A3E3 0 50%,#F6EDE6 50%)', 'repeating-linear-gradient(45deg,#1F2A55 0 10px,#2E3B70 10px 20px)',
  'radial-gradient(circle at 70% 60%,#FF7F6A,#E8B4AE)', 'linear-gradient(180deg,#F6EDE6 0 62%,#E8B4AE 62%)',
]

// Mão estilizada: 5 unhas que recebem a cor escolhida
const Unhas = ({ cor, frances }) => (
  <svg viewBox="0 0 260 180" className="nl-unhas" aria-hidden="true">
    {[[30, 70, 34, 64, -12], [78, 40, 36, 72, -5], [128, 30, 38, 76, 0], [178, 42, 36, 72, 5], [224, 78, 32, 60, 14]].map(([x, y, w, h, r], i) => (
      <g key={i} transform={`rotate(${r} ${x} ${y + h})`}>
        <rect x={x - w / 2 - 6} y={y + 10} width={w + 12} height={h + 70} rx={(w + 12) / 2} className="nl-dedo" />
        <rect x={x - w / 2} y={y} width={w} height={h} rx={w / 2} fill={frances ? '#F2D9D2' : cor} className="nl-unha" />
        {frances && <path d={`M${x - w / 2} ${y + w / 2.2}a${w / 2} ${w / 2} 0 0 1 ${w} 0`} fill="#FFFFFF" />}
        <rect x={x - w / 4} y={y + 8} width={w / 5} height={h * 0.45} rx={w / 10} fill="#fff" opacity=".45" />
      </g>
    ))}
  </svg>
)

export default function Nail() {
  const [cor, setCor] = useState(CORES[0])
  return (
    <Casca id="nail" base={BASE} fontes="family=Cormorant+Garamond:ital,wght@0,500;1,500;1,600&family=Manrope:wght@400;600;800">
      {({ nome, demo }) => (
        <main className="nl" style={{ '--cor': cor[0] === 'Francesinha' ? '#E8C9C0' : cor[1], '--cor-tx': cor[2] }}>
          <header className="nl-topo">
            <p className="nl-sobre">Unhas, cílios e sobrancelhas · Tatuapé</p>
            <h1>{nome}</h1>
            <p className="nl-frase">Atendimento com hora marcada, café e playlist boa.</p>
          </header>

          <section className="nl-provador">
            <Unhas cor={cor[1]} frances={cor[0] === 'Francesinha'} />
            <h2>Escolha a sua cor</h2>
            <div className="nl-cores" role="radiogroup" aria-label="Cor do esmalte">
              {CORES.map((c) => (
                <button key={c[0]} role="radio" aria-checked={c[0] === cor[0]} aria-label={c[0]} title={c[0]}
                  className={c[0] === cor[0] ? 'on' : ''} style={{ '--c': c[1] }} onClick={() => setCor(c)} />
              ))}
            </div>
            <p className="nl-nome-cor" key={cor[0]}>{cor[0]}</p>
            <button className="nl-cta" onClick={() => demo(`abre o WhatsApp pedindo um horário com a cor ${cor[0].toLowerCase()}`)}>
              <Ico n="whats" s={20} cheio /> Quero essa cor
            </button>
          </section>

          <section className="nl-servicos">
            <h2>Serviços</h2>
            <div className="nl-trilho">
              {SERVICOS.map(([t, d, p], i) => (
                <button key={t} style={{ '--d': i }} onClick={() => demo(`agenda ${t.toLowerCase()} pelo WhatsApp`)}>
                  <b>{t}</b><small><Ico n="relogio" s={14} /> {d}</small><span>{p}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="nl-galeria" aria-label="Trabalhos recentes">
            {GALERIA.map((g, i) => <button key={i} style={{ background: g, '--d': i }} aria-label={`Trabalho ${i + 1}`} onClick={() => demo('abre o seu Instagram com os trabalhos')} />)}
          </section>

          <p className="nl-local"><Ico n="mapa" s={16} /> Tatuapé, São Paulo · <Ico n="estrela" s={14} cheio /> 5,0 no Google</p>
        </main>
      )}
    </Casca>
  )
}
