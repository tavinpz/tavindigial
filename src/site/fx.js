// Efeitos da home sem biblioteca: revelação por IntersectionObserver e
// um único listener de scroll com requestAnimationFrame para a página toda.
import { useEffect, useRef } from 'react'

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const semMovimento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function useReveal(raiz = '.td') {
  useEffect(() => {
    const els = document.querySelectorAll(`${raiz} [data-r]`)
    if (!('IntersectionObserver' in window) || semMovimento()) { els.forEach((e) => e.classList.add('vis')); return }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    els.forEach((e) => io.observe(e))
    const t = setTimeout(() => els.forEach((e) => {
      const r = e.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) e.classList.add('vis')
    }), 1500)
    return () => { clearTimeout(t); io.disconnect() }
  }, [raiz])
}

const assinantes = new Set()
let agendado = false
function bombear() {
  if (agendado) return
  agendado = true
  requestAnimationFrame(() => { agendado = false; assinantes.forEach((fn) => { try { fn() } catch { /* segue */ } }) })
}

export function useScroll(cb) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    const fn = () => ref.current()
    if (assinantes.size === 0) {
      window.addEventListener('scroll', bombear, { passive: true })
      window.addEventListener('resize', bombear, { passive: true })
    }
    assinantes.add(fn)
    fn()
    return () => {
      assinantes.delete(fn)
      if (assinantes.size === 0) {
        window.removeEventListener('scroll', bombear)
        window.removeEventListener('resize', bombear)
      }
    }
  }, [])
}

// Progresso (0..1) de um elemento atravessando a tela
export function progresso(el, inicio = 0.9, fim = 0.3) {
  if (!el) return 0
  const r = el.getBoundingClientRect()
  const h = window.innerHeight
  return clamp((h * inicio - r.top) / (h * (inicio - fim)))
}
