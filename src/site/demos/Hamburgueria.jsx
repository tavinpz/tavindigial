import { useMemo, useState } from 'react'
import { brl } from '../../config'
import Casca, { Ico, abertoAgora } from './Casca'

// Hamburgueria · layout "cardápio": abas por categoria, itens com +/–, carrinho que monta o pedido
const BASE = { nome: 'Brasa 77' }
const HORARIO = { dias: [0, 2, 3, 4, 5, 6], abre: 18, fecha: 23.5 }
const CARDAPIO = {
  Burgers: [
    ['Smash Clássico', 'Pão brioche, 2 smash 80g, cheddar, picles e molho da casa', 34, ['#E9A23B', '#7A3B1E', '#F2C14E']],
    ['Brasa Bacon', 'Blend 160g na brasa, bacon crocante, cebola caramelizada', 42, ['#E9A23B', '#5C2A14', '#C0392B']],
    ['Veggie da Horta', 'Burger de grão-de-bico, rúcula, tomate e maionese verde', 36, ['#E9A23B', '#6B8E23', '#E74C3C']],
  ],
  Combos: [
    ['Combo Smash', 'Smash Clássico + fritas + refri lata', 49, ['#E9A23B', '#7A3B1E', '#F2C14E']],
    ['Combo Duplo', '2 Brasa Bacon + fritas grandes + 2 refris', 99, ['#E9A23B', '#5C2A14', '#C0392B']],
  ],
  Porções: [
    ['Fritas rústicas', 'Com páprica defumada e maionese da casa', 22, ['#F2C14E', '#E9A23B', '#F2C14E']],
    ['Onion rings', '12 anéis empanados na cerveja', 26, ['#E9A23B', '#C98A2B', '#E9A23B']],
  ],
  Bebidas: [
    ['Refrigerante lata', 'Coca, Guaraná ou Sprite', 7, ['#C0392B', '#C0392B', '#C0392B']],
    ['Limonada da casa', 'Com hortelã, 500ml', 12, ['#9ACD32', '#F4F1BB', '#9ACD32']],
  ],
}

// Ilustração de lanche em camadas (cores mudam por item)
const Lanche = ({ cores: [pao, carne, extra] }) => (
  <svg viewBox="0 0 64 56" className="hb-lanche" aria-hidden="true">
    <path d="M8 24c0-12 11-19 24-19s24 7 24 19z" fill={pao} />
    <circle cx="22" cy="14" r="1.4" fill="#FFF3D6" /><circle cx="32" cy="10" r="1.4" fill="#FFF3D6" /><circle cx="42" cy="15" r="1.4" fill="#FFF3D6" />
    <path d="M6 27h52l-4 5H10z" fill={extra} />
    <rect x="7" y="31" width="50" height="8" rx="4" fill={carne} />
    <path d="M8 41h48c0 5-4 9-9 9H17c-5 0-9-4-9-9z" fill={pao} />
  </svg>
)

export default function Hamburgueria() {
  const cats = Object.keys(CARDAPIO)
  const [cat, setCat] = useState(cats[0])
  const [carrinho, setCarrinho] = useState({})
  const aberta = useMemo(() => abertoAgora(HORARIO), [])
  const itens = Object.values(CARDAPIO).flat()
  const qtd = Object.values(carrinho).reduce((a, b) => a + b, 0)
  const total = Object.entries(carrinho).reduce((s, [n, q]) => s + q * (itens.find((i) => i[0] === n)?.[2] || 0), 0)
  const mudar = (n, d) => setCarrinho((c) => { const v = Math.max(0, (c[n] || 0) + d); const x = { ...c, [n]: v }; if (!v) delete x[n]; return x })

  return (
    <Casca id="hamburgueria" base={BASE} fontes="family=Archivo+Black&family=Archivo:wght@400;600;800">
      {({ nome, demo, local, nota }) => (
        <main className="hb">
          <header className="hb-topo">
            <div className="hb-brasas" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
            <p className="hb-tag">Smash burger na brasa · {local('Pinheiros')}</p>
            <h1>{nome}</h1>
            <div className="hb-chips">
              <span className={aberta ? 'on' : ''}><i />{aberta ? 'Aberto agora' : 'Abre às 18h'}</span>
              <span><Ico n="relogio" s={14} /> 30 a 40 min</span>
              <span><Ico n="estrela" s={14} cheio /> {nota('4,8')}</span>
            </div>
          </header>

          <nav className="hb-cats" aria-label="Categorias">
            {cats.map((c) => <button key={c} className={c === cat ? 'on' : ''} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
          </nav>

          <ul className="hb-itens" key={cat}>
            {CARDAPIO[cat].map(([n, desc, preco, cores], i) => (
              <li key={n} className="hb-item" style={{ '--d': i }}>
                <Lanche cores={cores} />
                <div className="hb-item-txt"><b>{n}</b><p>{desc}</p><span>{brl(preco)}</span></div>
                <div className="hb-qtd">
                  {carrinho[n] ? <>
                    <button aria-label={`Tirar ${n}`} onClick={() => mudar(n, -1)}><Ico n="menos" s={16} /></button>
                    <output>{carrinho[n]}</output>
                  </> : null}
                  <button className="hb-mais" aria-label={`Adicionar ${n}`} onClick={() => mudar(n, 1)}><Ico n="mais" s={16} /></button>
                </div>
              </li>
            ))}
          </ul>

          <div className="hb-info">
            <button onClick={() => demo('abre a rota no Google Maps')}><Ico n="mapa" /> Retirar no balcão</button>
            <button onClick={() => demo('abre o seu Instagram')}><Ico n="insta" /> @brasa77</button>
          </div>

          <div className={`hb-carrinho ${qtd ? 'on' : ''}`} aria-live="polite">
            <button onClick={() => demo(`abre o WhatsApp com o pedido pronto: ${Object.entries(carrinho).map(([n, q]) => `${q}x ${n}`).join(', ')}`)}>
              <span className="hb-bolha">{qtd}</span>
              <span>Pedir no WhatsApp</span>
              <b>{brl(total)}</b>
            </button>
          </div>
        </main>
      )}
    </Casca>
  )
}
