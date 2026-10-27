import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CONFIG, brl } from '../../config'
import { waLink } from '../../lib/msg'
import { callFn } from '../../lib/fn'
import '../../styles/demos.css'

// Horário de Brasília, de onde quer que a pessoa abra
export function abertoAgora({ dias, abre, fecha }) {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const h = d.getHours() + d.getMinutes() / 60
  return dias.includes(d.getDay()) && h >= abre && h < fecha
}

export const semMovimento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function useFonte(familias) {
  useEffect(() => {
    if (!familias) return
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = `https://fonts.googleapis.com/css2?${familias}&display=swap`
    document.head.appendChild(l)
    return () => l.remove()
  }, [familias])
}

// Tudo que toda demo tem: nome do lead (?n=), rastreio (?r=), aviso dos botões e rodapé de venda.
// O conteúdo de cada demo vem por render prop: children({ nome, demo, quero, nomeLead })
export default function Casca({ id, base, fontes, className = '', children }) {
  const [qs] = useSearchParams()
  const nomeLead = (qs.get('n') || '').slice(0, 60).trim()
  const r = qs.get('r') || ''
  const nome = nomeLead || base.nome
  const [aviso, setAviso] = useState('')
  useFonte(fontes)

  useEffect(() => {
    document.title = `${nome} · demonstração`
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex'
    document.head.appendChild(meta)
    if (r) callFn('track', { r, pagina: `demo/${id}`, modelo: id }).catch(() => {})
    return () => meta.remove()
  }, [nome, r, id])

  const quero = waLink(CONFIG.WHATSAPP_VENDAS, `Oi! Vi a demonstração ${base.nome} e quero uma página assim${nomeLead ? ` para a ${nomeLead}` : ''}.`)
  const demo = (acao) => {
    setAviso(`Na página da ${nome}, este botão ${acao}.`)
    clearTimeout(window.__dxAviso)
    window.__dxAviso = setTimeout(() => setAviso(''), 4200)
  }

  return (
    <div className={`dx dx--${id} ${className}`}>
      <p className="dx-selo">{nomeLead ? `Demonstração feita para ${nomeLead}` : 'Demonstração Tavin Digital'}</p>
      {children({ nome, demo, quero, nomeLead })}
      <footer className="dx-rodape">
        <a className="dx-quero" href={quero} target="_blank" rel="noreferrer">
          Quero uma página assim · {brl(CONFIG.PRECO_BIO)} em {CONFIG.PRAZO_BIO_HORAS}h
        </a>
        <small>Feito por <a href={CONFIG.SITE_URL} target="_blank" rel="noreferrer">Tavin Digital</a></small>
      </footer>
      {aviso && (
        <div className="dx-aviso" role="status">
          <p>{aviso}</p>
          <a href={quero} target="_blank" rel="noreferrer">Quero a minha</a>
        </div>
      )}
    </div>
  )
}

// Ícones de traço (24x24)
const P = {
  whats: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z',
  mapa: 'M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  insta: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.2-1.4h.01',
  estrela: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z',
  seta: 'M9 6l6 6-6 6',
  mais: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  check: 'M20 6 9 17l-5-5',
  relogio: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  carro: 'M5 17h14M6 17l1.5-6h9L18 17M8 17v2M16 17v2M7 11l1-4h8l1 4',
  casa: 'M4 11l8-7 8 7v9H4z',
  lista: 'M5 6h14M5 12h14M5 18h9',
  calendario: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
  coracao: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  tesoura: 'M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 7l12 10M8 17 20 7',
  gota: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  video: 'M3 7h12v10H3zM15 10l6-3v10l-6-3',
  sacola: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
}
export const Ico = ({ n, s = 20, cheio = false }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true" className="dx-ico">
    <path d={P[n]} fill={cheio ? 'currentColor' : 'none'} stroke={cheio ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
