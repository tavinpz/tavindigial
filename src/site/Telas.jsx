import { useEffect, useRef, useState } from 'react'
import '../styles/vitrine.css'

// Só carrega o site de verdade quando a moldura chega perto da tela (economiza dados no celular)
function usePerto(ref, margem = '300px') {
  const [perto, setPerto] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || perto) return
    if (!('IntersectionObserver' in window)) { setPerto(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPerto(true); io.disconnect() } }, { rootMargin: margem })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, perto, margem])
  return perto
}

// Escala um iframe de largura fixa (ex.: 1280px) para caber na moldura, mantendo o layout de desktop
function useEscala(ref, largura) {
  const [escala, setEscala] = useState(0.3)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setEscala(el.clientWidth / largura)
    medir()
    const ro = 'ResizeObserver' in window ? new ResizeObserver(medir) : null
    ro?.observe(el)
    window.addEventListener('resize', medir)
    return () => { ro?.disconnect(); window.removeEventListener('resize', medir) }
  }, [ref, largura])
  return escala
}

export function Navegador({ src, dominio, largura = 1280, altura = 800, vivo = false, className = '', titulo = 'Prévia do site' }) {
  const caixa = useRef(null)
  const perto = usePerto(caixa)
  const escala = useEscala(caixa, largura)
  const [pronto, setPronto] = useState(false)
  return (
    <div className={`tv-nav ${className}`}>
      <div className="tv-nav-barra" aria-hidden="true">
        <i /><i /><i />
        <span className="tv-url">{dominio}</span>
      </div>
      <div className={`tv-nav-tela ${pronto ? 'pronto' : ''}`} ref={caixa} style={{ aspectRatio: `${largura} / ${altura}` }}>
        {perto && (
          <iframe src={src} title={titulo} loading="lazy" tabIndex={vivo ? 0 : -1} onLoad={() => setPronto(true)}
            style={{ width: largura, height: altura, transform: `scale(${escala})`, pointerEvents: vivo ? 'auto' : 'none' }} />
        )}
      </div>
    </div>
  )
}

export function Celular({ src, vivo = true, className = '', titulo = 'Prévia no celular', largura = 390, altura = 844 }) {
  const caixa = useRef(null)
  const perto = usePerto(caixa)
  const escala = useEscala(caixa, largura)
  const [pronto, setPronto] = useState(false)
  return (
    <div className={`tv-cel ${className}`}>
      <span className="tv-cel-ilha" aria-hidden="true" />
      <div className={`tv-cel-tela ${pronto ? 'pronto' : ''}`} ref={caixa} style={{ aspectRatio: `${largura} / ${altura}` }}>
        {perto && (
          <iframe src={src} title={titulo} loading="lazy" tabIndex={vivo ? 0 : -1} onLoad={() => setPronto(true)}
            style={{ width: largura, height: altura, transform: `scale(${escala})`, pointerEvents: vivo ? 'auto' : 'none' }} />
        )}
      </div>
    </div>
  )
}
