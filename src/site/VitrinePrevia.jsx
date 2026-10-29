import { useState } from 'react'
import SitePrevia from './SitePrevia'
import '../styles/previa.css'

// Na página inicial: a pessoa digita o nome do negócio e vê a página dela nascer, nicho por nicho
const NICHOS = [
  ['estetica', 'Estética', 'Salão de beleza', 'Studio Aurora', 4.9, 231],
  ['nail', 'Unhas', 'Manicure e pedicure', 'Ateliê Rosé', 5, 128],
  ['barbearia', 'Barbearia', 'Barbearia', 'Navalha 13', 4.8, 412],
  ['pet', 'Pet shop', 'Pet shop', 'Patas & Cia', 4.9, 540],
  ['tatuagem', 'Tatuagem', 'Estúdio de tatuagem', 'Tinta Crua', 5, 190],
  ['odontologia', 'Odontologia', 'Dentista', 'Clínica Sorriso', 4.8, 486],
]

export default function VitrinePrevia() {
  const [i, setI] = useState(0)
  const [nome, setNome] = useState('')
  const [id, rotulo, categoria, exemplo, nota, aval] = NICHOS[i]
  const [aviso, setAviso] = useState('')
  const avisar = (o) => { setAviso(`Na página de verdade, este botão ${o}.`); clearTimeout(window.__vpAviso); window.__vpAviso = setTimeout(() => setAviso(''), 3200) }
  return (
    <section className="vp td-bloco td-claro" id="sua-pagina" aria-labelledby="vp-t">
      <div className="td-sec vp-grade">
        <div className="vp-texto">
          <p className="vp-para">Teste agora</p>
          <h2 id="vp-t">Digite o nome do seu negócio e veja a sua página.</h2>
          <label className="vp-campo">
            <span>Nome do negócio</span>
            <input value={nome} onChange={(e) => setNome(e.target.value.slice(0, 40))} placeholder={exemplo} autoComplete="organization" />
          </label>
          <div className="vp-nichos" role="tablist" aria-label="Tipo de negócio">
            {NICHOS.map(([k, t], n) => (
              <button key={k} type="button" role="tab" aria-selected={i === n} className={i === n ? 'on' : ''} onClick={() => setI(n)}>{t}</button>
            ))}
          </div>
          <p className="vp-obs">Com os seus serviços, fotos, preços e o endereço no mapa. Você vê a prévia pronta antes de pagar.</p>
        </div>
        <div className="vp-cel">
          <div className="vp-tela">
            <SitePrevia key={id} nome={nome.trim() || exemplo} nicho={id === 'nail' ? 'estetica' : id} categoria={categoria} bairro="São Paulo" cidade="" nota={nota} avaliacoes={aval} aviso={avisar} />
          </div>
          <p className={`vp-aviso ${aviso ? 'on' : ''}`} role="status" aria-live="polite">{aviso}</p>
        </div>
      </div>
    </section>
  )
}
