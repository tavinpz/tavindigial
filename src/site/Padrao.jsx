import { FORMAS, gerarPadrao } from '../lib/padrao'

// Pattern da marca em SVG (decorativo)
export default function Padrao({ colunas = 4, linhas = 6, semente = 7, className = '' }) {
  return (
    <svg className={className} viewBox={`0 0 ${colunas} ${linhas}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {gerarPadrao(colunas, linhas, semente).map((c) => (
        <g key={`${c.col}-${c.lin}`} transform={`translate(${c.col} ${c.lin})`}>
          <rect width="1.01" height="1.01" fill={c.fundo} />
          <path d={FORMAS[c.forma]} fill={c.cor} transform={`rotate(${c.giro} 0.5 0.5)`} />
        </g>
      ))}
    </svg>
  )
}
