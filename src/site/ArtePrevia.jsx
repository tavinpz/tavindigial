// Arte do topo da prévia, desenhada para cada tipo de negócio (SVG, usa as cores do tema)
const A = 'var(--sp-acento)'
const T = 'var(--sp-tinta)'
const P = 'var(--sp-papel)'

function Estetica() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <linearGradient id="es-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={A} stopOpacity=".55" /><stop offset="1" stopColor={A} stopOpacity=".12" /></linearGradient>
      </defs>
      <path d="M110 300V150a90 90 0 0 1 180 0v150z" fill="url(#es-g)" />
      <path d="M128 300V152a72 72 0 0 1 144 0v148" fill="none" stroke={P} strokeWidth="1.5" opacity=".9" />
      <g fill="none" stroke={T} strokeWidth="2.2" strokeLinecap="round" opacity=".85" className="sp-arte-traco">
        <path d="M150 190c20-26 80-26 100 0" />
        <path d="M150 190c20 22 80 22 100 0" />
        <circle cx="200" cy="190" r="13" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 158 + i * 14; return <path key={i} d={`M${x} ${178 - Math.sin((i / 6) * Math.PI) * 8}l${(i - 3) * 2} -14`} /> })}
      </g>
      <g fill={P} opacity=".9">{[[70, 80, 5], [330, 110, 4], [300, 50, 3], [90, 210, 3], [340, 230, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="sp-arte-brilho" style={{ animationDelay: `${i * 0.5}s` }} />)}</g>
    </svg>
  )
}

function Nail() {
  const cores = ['#A3345A', '#E7A1B0', '#C9A04A', '#3A1F2B', '#F4D9C6']
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <circle cx="320" cy="60" r="90" fill={A} opacity=".12" />
      {cores.map((c, i) => (
        <g key={c} transform={`translate(${70 + i * 58} ${100 + Math.abs(2 - i) * 18}) rotate(${(i - 2) * 6})`}>
          <g className="sp-arte-sobe" style={{ animationDelay: `${i * 0.08}s` }}>
            <rect x="0" y="0" width="40" height="120" rx="20" fill={P} stroke={T} strokeOpacity=".12" />
            <rect x="5" y="6" width="30" height="46" rx="15" fill={c} />
            <rect x="11" y="12" width="6" height="20" rx="3" fill="#fff" opacity=".45" />
          </g>
        </g>
      ))}
    </svg>
  )
}

function Barbearia() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <clipPath id="bb-c"><rect x="172" y="40" width="56" height="220" rx="28" /></clipPath>
        <pattern id="bb-p" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="56" height="56" fill="#F1EBDD" /><rect width="18" height="56" fill={A} /><rect x="28" width="10" height="56" fill="#8B2E2E" />
        </pattern>
      </defs>
      <circle cx="200" cy="150" r="130" fill={A} opacity=".07" />
      <rect x="160" y="22" width="80" height="22" rx="8" fill={A} />
      <rect x="160" y="256" width="80" height="22" rx="8" fill={A} />
      <g clipPath="url(#bb-c)"><rect x="140" y="-40" width="140" height="380" fill="url(#bb-p)" className="sp-arte-poste" /></g>
      <rect x="172" y="40" width="56" height="220" rx="28" fill="none" stroke="#fff" strokeOpacity=".25" />
      <g stroke={A} strokeWidth="2" opacity=".5"><path d="M60 150h70M270 150h70" /><path d="M75 135l-15 15 15 15M325 135l15 15-15 15" fill="none" /></g>
    </svg>
  )
}

function Pet() {
  const pata = (x, y, s, r, d) => (
    <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={A}>
      <g className="sp-arte-sobe" style={{ animationDelay: `${d}s` }}>
        <ellipse cx="0" cy="12" rx="16" ry="13" /><circle cx="-15" cy="-8" r="6" /><circle cx="-5" cy="-16" r="6" /><circle cx="6" cy="-16" r="6" /><circle cx="16" cy="-8" r="6" />
      </g>
    </g>
  )
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <circle cx="200" cy="160" r="110" fill={A} opacity=".1" />
      <path d="M140 180c0-40 30-70 60-70s60 30 60 70" fill="none" stroke={T} strokeWidth="2" opacity=".2" />
      {[[90, 220, 1.1, -20, 0], [150, 160, 0.9, -10, 0.15], [210, 110, 1, 5, 0.3], [270, 70, 0.8, 15, 0.45], [320, 120, 0.7, 25, 0.6]].map((p) => pata(...p))}
      <g transform="translate(250 220) rotate(-20)" fill="#F2A516"><rect x="-34" y="-7" width="68" height="14" rx="7" /><circle cx="-34" cy="-7" r="9" /><circle cx="-34" cy="7" r="9" /><circle cx="34" cy="-7" r="9" /><circle cx="34" cy="7" r="9" /></g>
    </svg>
  )
}

function Tatuagem() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <g fill="none" stroke={A} strokeWidth="2" className="sp-arte-gira" style={{ transformOrigin: '200px 150px' }}>
        <circle cx="200" cy="150" r="110" strokeDasharray="4 10" />
      </g>
      <circle cx="200" cy="150" r="84" fill="none" stroke="#F4F1EC" strokeWidth="1.5" opacity=".35" />
      {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2; return <path key={i} d={`M${200 + Math.cos(a) * 92} ${150 + Math.sin(a) * 92}L${200 + Math.cos(a) * 104} ${150 + Math.sin(a) * 104}`} stroke="#F4F1EC" strokeOpacity=".4" strokeWidth="2" /> })}
      <path d="M200 70l14 60h-28z" fill={A} />
      <rect x="188" y="130" width="24" height="12" rx="2" fill="#F4F1EC" />
      <path d="M196 142h8l-4 92z" fill="#F4F1EC" opacity=".85" />
      <path d="M150 210c20 12 80 12 100 0" stroke={A} strokeWidth="3" fill="none" strokeLinecap="round" className="sp-arte-traco" />
    </svg>
  )
}

function Odontologia() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <circle cx="200" cy="150" r="120" fill={A} opacity=".1" />
      <path d="M200 70c-30-22-80-12-80 34 0 34 18 50 24 96 4 30 26 30 30 0l8-40c3-14 33-14 36 0l8 40c4 30 26 30 30 0 6-46 24-62 24-96 0-46-50-56-80-34z" fill={P} stroke={A} strokeWidth="3" />
      <path d="M150 112c10-18 32-20 44-12" fill="none" stroke={A} strokeWidth="3" strokeLinecap="round" opacity=".5" />
      {[[300, 80], [96, 210], [320, 200]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 14}l4 10 10 4-10 4-4 10-4-10-10-4 10-4z`} fill={A} className="sp-arte-brilho" style={{ animationDelay: `${i * 0.6}s` }} />)}
    </svg>
  )
}

function Saude() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <path d="M60 240c40-120 140-170 280-160-20 120-120 190-280 160z" fill={A} opacity=".18" />
      <path d="M80 230C150 170 230 120 320 92" fill="none" stroke={A} strokeWidth="2.5" strokeLinecap="round" className="sp-arte-traco" />
      {[0, 1, 2, 3, 4].map((i) => { const x = 120 + i * 45; const y = 205 - i * 26; return <path key={i} d={`M${x} ${y}c-4-24 14-38 30-40-2 22-12 36-30 40z`} fill={A} opacity=".6" className="sp-arte-sobe" style={{ animationDelay: `${i * 0.1}s` }} /> })}
      <circle cx="300" cy="200" r="34" fill={P} stroke={A} strokeWidth="2" />
      <path d="M300 186v28M286 200h28" stroke={A} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function Alimentacao() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <circle cx="200" cy="170" r="120" fill={A} opacity=".1" />
      <path d="M100 180h200a100 70 0 0 1-200 0z" fill={A} />
      <rect x="92" y="170" width="216" height="14" rx="7" fill={T} opacity=".85" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${165 + i * 35} 150c-12-16 12-24 0-42`} fill="none" stroke={T} strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" className="sp-arte-vapor" style={{ animationDelay: `${i * 0.4}s` }} />)}
    </svg>
  )
}

function Geral() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <rect x="90" y="60" width="150" height="150" rx="32" fill={A} opacity=".85" className="sp-arte-sobe" />
      <circle cx="270" cy="170" r="70" fill={A} opacity=".25" className="sp-arte-sobe" style={{ animationDelay: '.1s' }} />
      <path d="M160 230l40-70 40 70z" fill={T} opacity=".12" className="sp-arte-sobe" style={{ animationDelay: '.2s' }} />
    </svg>
  )
}

const ARTES = { estetica: Estetica, nail: Nail, barbearia: Barbearia, pet: Pet, tatuagem: Tatuagem, odontologia: Odontologia, saude: Saude, alimentacao: Alimentacao, geral: Geral }
export default function ArtePrevia({ tema }) {
  const C = ARTES[tema] || Geral
  return <C />
}
