// Símbolo oficial da Tavin Digital (PNG usado como máscara: pega a cor do texto em volta) + nome
export default function Logo({ className = '', nome = true }) {
  return (
    <span className={`logo ${className}`}>
      <span className="logo-marca" aria-hidden="true" />
      {nome && <span className="logo-nome">TAVÍN</span>}
      {nome && <span className="logo-sub">digital</span>}
    </span>
  )
}
