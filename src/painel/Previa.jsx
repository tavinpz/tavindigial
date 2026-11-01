import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Prévia de vídeo nos quadros.
//   MiniVideo: a miniatura do cartão. Com o mouse em cima, o vídeo aparece tocando (sem som) ao lado;
//              clicar abre a prévia grande, já tocando com som.
//   Previa: a janela da prévia. Setas do teclado (ou os botões) passam para o vídeo anterior/seguinte, Esc fecha.

const temHover = () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

export function MiniVideo({ src, capa, onClick, rotulo, className = '', children }) {
  const ref = useRef(null)
  const timer = useRef(0)
  const [pos, setPos] = useState(null)
  const sair = () => { clearTimeout(timer.current); setPos(null) }
  const entrar = () => {
    if (!src || !temHover()) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const w = 216, h = Math.round((w * 16) / 9)
      const x = r.right + 14 + w < window.innerWidth ? r.right + 14 : Math.max(8, r.left - 14 - w)
      const y = Math.min(Math.max(8, r.top + r.height / 2 - h / 2), window.innerHeight - h - 8)
      setPos({ x, y, w, h })
    }, 250)
  }
  useEffect(() => {
    if (!pos) return undefined
    window.addEventListener('scroll', sair, true)
    return () => window.removeEventListener('scroll', sair, true)
  }, [pos])
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <button ref={ref} type="button" className={`pv-mini ${className}`} aria-label={rotulo}
        onClick={(e) => { e.stopPropagation(); sair(); onClick?.() }}
        onMouseEnter={entrar} onMouseLeave={sair} onDragStart={sair}>
        {children}
        {src && <span className="pv-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg></span>}
      </button>
      {pos && createPortal(
        <div className="pv-flutua" style={{ left: pos.x, top: pos.y, width: pos.w, height: pos.h }} aria-hidden="true">
          <video src={src} poster={capa || undefined} autoPlay muted loop playsInline />
        </div>, document.body)}
    </>
  )
}

// lista: [{ id, video_url, capa_url, titulo, sub, baixar }] na ordem do quadro
export function Previa({ lista, id, setId, abrirFicha }) {
  const i = lista.findIndex((v) => v.id === id)
  const v = lista[i]
  const ir = (d) => { const n = lista[i + d]; if (n) setId(n.id) }
  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') setId(null)
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); ir(1) }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); ir(-1) }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })
  useEffect(() => {
    const o = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = o }
  }, [])
  if (!v) return null
  return createPortal(
    <div className="pv-fundo" onClick={() => setId(null)}>
      <div className="pv-janela" role="dialog" aria-modal="true" aria-label={`Prévia: ${v.titulo}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pv-seta pv-seta--ant" onClick={() => ir(-1)} disabled={i <= 0} aria-label="Vídeo anterior">‹</button>
        <video key={v.id} className="pv-video" src={v.video_url} poster={v.capa_url || undefined} autoPlay controls playsInline />
        <button type="button" className="pv-seta pv-seta--seg" onClick={() => ir(1)} disabled={i >= lista.length - 1} aria-label="Próximo vídeo">›</button>
        <div className="pv-info">
          <small>{i + 1} de {lista.length}{v.sub ? ` · ${v.sub}` : ''}</small>
          <strong>{v.titulo}</strong>
          <div className="pv-acoes">
            {abrirFicha && <button type="button" className="p-btn p-btn--mini p-btn--forte" onClick={() => { setId(null); abrirFicha(v.id) }}>Abrir ficha</button>}
            {v.baixar && <a className="p-btn p-btn--mini" href={v.baixar}>Baixar</a>}
            <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => setId(null)}>Fechar</button>
          </div>
        </div>
      </div>
    </div>, document.body)
}
