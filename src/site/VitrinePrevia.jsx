import { useEffect, useState } from 'react'
import { CONFIG, brl } from '../config'
import SitePrevia from './SitePrevia'
import '../styles/previa.css'

// Vitrine da home (seção Modelos): a pessoa digita o nome do negócio, escolhe o tipo
// e vê a página dela nascer, no site completo ou na página da bio (o melhor modelo do nicho).
// [id, rótulo, nicho da prévia, categoria, exemplo, nota, avaliações, modelo da bio]
const NICHOS = [
  ['estetica', 'Estética', 'estetica', 'Salão de beleza', 'Studio Aurora', 4.9, 231, 'estetica'],
  ['nail', 'Unhas', 'estetica', 'Manicure e pedicure', 'Ateliê Rosé', 5, 128, 'nail'],
  ['barbearia', 'Barbearia', 'barbearia', 'Barbearia', 'Navalha 13', 4.8, 412, 'barbearia'],
  ['pet', 'Pet shop', 'pet', 'Pet shop', 'Patas & Cia', 4.9, 540, 'pet'],
  ['tatuagem', 'Tatuagem', 'tatuagem', 'Estúdio de tatuagem', 'Tinta Crua', 5, 190, 'tatuagem'],
  ['odontologia', 'Odontologia', 'odontologia', 'Dentista', 'Sorriso Prime', 4.8, 486, 'odontologia'],
  ['hamburgueria', 'Hamburgueria', 'alimentacao', 'Hamburgueria', 'Brasa 77', 4.7, 1320, 'hamburgueria'],
  ['academia', 'Academia', 'saude', 'Academia', 'Pulse Studio', 4.9, 302, 'academia'],
  ['nutri', 'Nutrição', 'saude', 'Nutricionista', 'Helena Prado', 5, 96, 'nutricionista'],
  ['psico', 'Psicologia', 'saude', 'Psicóloga', 'Marina Alves', 5, 74, 'psicologa'],
]

export default function VitrinePrevia() {
  const [i, setI] = useState(0)
  const [tipo, setTipo] = useState('site')
  const [nome, setNome] = useState('')
  const [nomeBio, setNomeBio] = useState('')
  const [aviso, setAviso] = useState('')
  const [id, rotulo, nicho, categoria, exemplo, nota, aval, bio] = NICHOS[i]
  const mostrado = nome.trim() || exemplo

  // a página da bio recarrega só quando a pessoa para de digitar
  useEffect(() => { const t = setTimeout(() => setNomeBio(nome.trim()), 600); return () => clearTimeout(t) }, [nome])
  const q = new URLSearchParams({ e: '1', g: String(nota), a: String(aval), b: 'São Paulo' })
  if (nomeBio) q.set('n', nomeBio)

  const avisar = (o) => { setAviso(`Na página de verdade, este botão ${o}.`); clearTimeout(window.__vpAviso); window.__vpAviso = setTimeout(() => setAviso(''), 3200) }

  return (
    <div className="td-sec vp-grade" id="sua-pagina">
      <div className="vp-texto">
        <h2 className="td-h2">Digite o nome do seu negócio e veja a sua página.</h2>
        <label className="vp-campo">
          <span>Nome do negócio</span>
          <input value={nome} onChange={(e) => setNome(e.target.value.slice(0, 40))} placeholder={exemplo} autoComplete="organization" />
        </label>
        <div className="vp-nichos" role="tablist" aria-label="Tipo de negócio">
          {NICHOS.map(([k, t], n) => (
            <button key={k} type="button" role="tab" aria-selected={i === n} className={i === n ? 'on' : ''} onClick={() => setI(n)}>{t}</button>
          ))}
        </div>
        <div className="vp-tipo" role="radiogroup" aria-label="Tipo de página">
          <button type="button" role="radio" aria-checked={tipo === 'site'} className={tipo === 'site' ? 'on' : ''} onClick={() => setTipo('site')}>
            <b>Site completo</b><small>Agenda, serviços, avaliações e mapa · {brl(CONFIG.PRECO_SITE)}</small>
          </button>
          <button type="button" role="radio" aria-checked={tipo === 'bio'} className={tipo === 'bio' ? 'on' : ''} onClick={() => setTipo('bio')}>
            <b>Página da bio</b><small>Uma página animada no lugar do Linktree · {brl(CONFIG.PRECO_BIO)}</small>
          </button>
        </div>
        <p className="vp-obs">Toque nos botões do celular: funcionam de verdade. A sua sai com as suas fotos, cores e serviços, e você só paga depois de aprovar.</p>
      </div>
      <div className="vp-cel">
        <div className="vp-tela">
          {tipo === 'site'
            ? <SitePrevia key={id} nome={mostrado} nicho={nicho} categoria={categoria} bairro="São Paulo" cidade="" nota={nota} avaliacoes={aval} aviso={avisar} />
            : <iframe key={`${bio}-${nomeBio}`} className="vp-frame" src={`/demo/${bio}?${q}`} title={`Página da bio de ${mostrado}, modelo ${rotulo}`} />}
        </div>
        <p className={`vp-aviso ${aviso ? 'on' : ''}`} role="status" aria-live="polite">{aviso}</p>
      </div>
    </div>
  )
}
