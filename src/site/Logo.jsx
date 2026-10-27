// Monograma T + "TAVÍN" espaçado, como na identidade do Behance
export default function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M2 4H30V8H26V13H22V8H18V27L16 30L14 27V8H10V13H6V8H2Z" fill="currentColor" />
      </svg>
      <span className="logo-nome">TAVÍN</span>
      <span className="logo-sub">digital</span>
    </span>
  )
}
