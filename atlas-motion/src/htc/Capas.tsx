import React from 'react';
import '@fontsource/inter/900.css';

// Hard to Copy: capas 1280×720 do hc002 em diante (HTCThumb com v = "02a", "03b"...).
// Padrão tirado das capas que mais renderam no nicho (Tradeoff Layer, conferido de novo em 18/11/2026): fundo claro e saturado,
// traço preto grosso, 1 a 3 palavras gigantes com contorno e sombra, um objeto concreto e um sinal simples (X, "?", seta, rachadura).
// Sem logotipo e sem rosto. Cada capa de um mesmo vídeo usa composição diferente das outras.
export const W = 1280, H = 720, TINTA = '#101418', F = '"Inter", sans-serif';
export const K = { ceu: '#2F7BE8', ceu2: '#7DB8FF', creme: '#FFF4DC', creme2: '#FFE3A8', verm: '#F0392B', amar: '#FFD23F', menta: '#39D98A', branco: '#FFFFFF', azulP: '#1B4FB8', noite: '#13264F', noite2: '#1F3F82', verde: '#1FA868', verde2: '#39D98A', roxo: '#6B3FD9', roxo2: '#9A78FF', laranja: '#FF8A2A', cinza: '#B9C4D2', cinzaE: '#5B6B7E' };
const S = { stroke: TINTA, strokeWidth: 9, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export const Pal: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; rot?: number; anc?: 'start' | 'middle' | 'end' }> = ({ x, y, t, s = 170, c = K.branco, rot = -4, anc = 'start' }) => (
  <g transform={`rotate(${rot} ${x} ${y})`} fontFamily={F} fontWeight={900} fontSize={s} letterSpacing={-s * 0.03} textAnchor={anc} fontStyle="italic">
    <text x={x + s * 0.05} y={y + s * 0.06} fill={TINTA} stroke={TINTA} strokeWidth={s * 0.17} strokeLinejoin="round">{t}</text>
    <text x={x} y={y} fill={c} stroke={TINTA} strokeWidth={s * 0.15} strokeLinejoin="round" paintOrder="stroke">{t}</text>
  </g>
);
export const Raios: React.FC<{ cx: number; cy: number; c1: string; c2: string }> = ({ cx, cy, c1, c2 }) => (
  <g><rect width={W} height={H} fill={c1} />{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, b = a + Math.PI / 12; return <path key={i} d={`M ${cx},${cy} L ${cx + Math.cos(a) * 1800},${cy + Math.sin(a) * 1800} L ${cx + Math.cos(b) * 1800},${cy + Math.sin(b) * 1800} Z`} fill={c2} opacity={0.55} />; })}</g>
);
const G: React.FC<{ x: number; y: number; k?: number; rot?: number; children: React.ReactNode }> = ({ x, y, k = 1, rot = 0, children }) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} {...S}>{children}</g>;
export const Xis: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (<g transform={`translate(${x},${y}) scale(${k})`}><path d="M -90,-90 L 90,90 M 90,-90 L -90,90" stroke={TINTA} strokeWidth={62} strokeLinecap="round" /><path d="M -90,-90 L 90,90 M 90,-90 L -90,90" stroke={K.verm} strokeWidth={42} strokeLinecap="round" /></g>);
export const Interroga: React.FC<{ x: number; y: number; s?: number; c?: string; rot?: number }> = ({ x, y, s = 300, c = K.amar, rot = 8 }) => (<g transform={`rotate(${rot} ${x} ${y})`} fontFamily={F} fontWeight={900} fontSize={s} textAnchor="middle"><text x={x + 8} y={y + 10} fill={TINTA} stroke={TINTA} strokeWidth={s * 0.16} strokeLinejoin="round">?</text><text x={x} y={y} fill={c} stroke={TINTA} strokeWidth={s * 0.1} strokeLinejoin="round" paintOrder="stroke">?</text></g>);
// chip quadrado com pinos e um "miolo" colorido
export const Chip: React.FC<{ x: number; y: number; k?: number; rot?: number; c?: string; t?: string }> = ({ x, y, k = 1, rot = 0, c = K.menta, t }) => (
  <G x={x} y={y} k={k} rot={rot}>
    {Array.from({ length: 6 }, (_, i) => <g key={i} strokeWidth={8}><rect x={-112 + i * 38} y={-150} width={18} height={40} fill={K.amar} /><rect x={-112 + i * 38} y={110} width={18} height={40} fill={K.amar} /><rect x={-150} y={-112 + i * 38} width={40} height={18} fill={K.amar} /><rect x={110} y={-112 + i * 38} width={40} height={18} fill={K.amar} /></g>)}
    <rect x={-120} y={-120} width={240} height={240} rx={18} fill="#2B3442" /><rect x={-78} y={-78} width={156} height={156} rx={10} fill={c} />
    <path d="M -60,-40 Q -20,-70 30,-62" fill="none" stroke={K.branco} strokeWidth={12} opacity={0.8} />
    {t && <text x={0} y={22} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={TINTA} stroke="none">{t}</text>}
  </G>
);
// fábrica: galpão com telhado dente de serra e chaminés
export const Fabrica: React.FC<{ x: number; y: number; k?: number; c?: string }> = ({ x, y, k = 1, c = K.cinza }) => (
  <G x={x} y={y} k={k}>
    <rect x={150} y={-250} width={44} height={170} fill={K.cinzaE} /><rect x={220} y={-210} width={44} height={130} fill={K.cinzaE} />
    <path d="M -260,150 L -260,-60 L -130,-150 L -130,-60 L 0,-150 L 0,-60 L 130,-150 L 130,-60 L 290,-60 L 290,150 Z" fill={c} />
    {[-210, -80, 50, 180].map((wx) => <rect key={wx} x={wx} y={10} width={70} height={56} fill={K.amar} strokeWidth={7} />)}
    <rect x={-40} y={86} width={90} height={64} fill={K.cinzaE} strokeWidth={7} />
  </G>
);
// avião de carga visto de lado
export const Aviao: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = -12 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <path d="M -30,10 L -140,110 L -80,110 L 60,20 Z" fill={K.cinza} /><path d="M -150,-20 L -200,-110 L -150,-110 L -90,-26 Z" fill={K.verm} />
    <path d="M -220,-10 Q -220,-44 -150,-44 L 150,-44 Q 240,-30 250,0 Q 240,34 150,40 L -150,40 Q -220,34 -220,-10 Z" fill={K.branco} />
    <path d="M 160,-30 Q 215,-22 228,-4 L 170,-4 Z" fill="#3BA7FF" strokeWidth={6} />
    {[-110, -50, 10, 70].map((wx) => <circle key={wx} cx={wx} cy={-8} r={11} fill="#3BA7FF" strokeWidth={5} />)}
    <path d="M 10,24 L -90,150 L -20,150 L 110,30 Z" fill={K.cinza} />
  </G>
);
// maço de dinheiro com cifrão
export const Grana: React.FC<{ x: number; y: number; k?: number; rot?: number; n?: number }> = ({ x, y, k = 1, rot = -8, n = 4 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    {Array.from({ length: n }, (_, i) => <rect key={i} x={-190 + i * 8} y={40 - i * 46} width={380} height={56} rx={8} fill={i % 2 ? '#2FBF71' : '#39D98A'} />)}
    <circle cx={0} cy={40 - (n - 1) * 46 + 28} r={34} fill={K.creme} strokeWidth={7} /><text x={0} y={40 - (n - 1) * 46 + 48} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={TINTA} stroke="none">$</text>
  </G>
);
// lâmina de silício (disco quadriculado)
export const Lamina: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = 0 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <ellipse cx={0} cy={0} rx={200} ry={200} fill="#8FD3FF" />
    <clipPath id={`lam${x}${y}`}><ellipse cx={0} cy={0} rx={186} ry={186} /></clipPath>
    <g clipPath={`url(#lam${x}${y})`} strokeWidth={5}>{Array.from({ length: 9 }, (_, i) => <g key={i}><line x1={-200} y1={-160 + i * 40} x2={200} y2={-160 + i * 40} /><line x1={-160 + i * 40} y1={-200} x2={-160 + i * 40} y2={200} /></g>)}<path d="M -200,-60 L 40,-200 L 110,-200 L -200,-10 Z" fill={K.branco} opacity={0.55} stroke="none" /></g>
  </G>
);
// planta (blueprint) riscada com X vermelho
export const PlantaX: React.FC<{ x: number; y: number; k?: number; rot?: number; children?: React.ReactNode }> = ({ x, y, k = 1, rot = -7, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} strokeLinejoin="round">
    <rect x={-210} y={-150} width={420} height={300} rx={10} fill={K.azulP} stroke={TINTA} strokeWidth={9} />
    {Array.from({ length: 7 }, (_, i) => <line key={'v' + i} x1={-210 + (i + 1) * 52.5} y1={-150} x2={-210 + (i + 1) * 52.5} y2={150} stroke={K.branco} strokeWidth={2} opacity={0.3} />)}
    {Array.from({ length: 5 }, (_, i) => <line key={'h' + i} x1={-210} y1={-150 + (i + 1) * 50} x2={210} y2={-150 + (i + 1) * 50} stroke={K.branco} strokeWidth={2} opacity={0.3} />)}
    <g fill="none" stroke={K.branco} strokeWidth={6} strokeDasharray="14 10">{children}</g>
    <Xis x={0} y={0} k={1.25} />
  </g>
);

const C02a: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={900} cy={430} c1={K.ceu} c2={K.ceu2} />
    <rect x={0} y={600} width={W} height={120} fill="#E9B872" stroke={TINTA} strokeWidth={9} />
    <Fabrica x={930} y={450} k={1.12} c={K.branco} />
    <PlantaX x={290} y={520} k={0.9}><path d="M -150,90 L -150,-10 L -90,-60 L -90,-10 L -30,-60 L -30,-10 L 30,-60 L 30,-10 L 150,-10 L 150,90 Z" /></PlantaX>
    <Pal x={40} y={200} t="$265 BILLION" s={150} c={K.amar} />
    <Pal x={56} y={318} t="STILL BEHIND" s={104} />
  </svg>
);
const C02b: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={640} cy={760} c1={K.creme} c2={K.creme2} />
    <path d="M -40,720 Q 640,470 1320,720 Z" fill="#3BA7FF" stroke={TINTA} strokeWidth={9} />
    <path d="M 170,560 Q 640,120 1110,560" fill="none" stroke={TINTA} strokeWidth={12} strokeDasharray="6 30" strokeLinecap="round" />
    <g stroke={TINTA} strokeWidth={9}><circle cx={170} cy={572} r={26} fill={K.menta} /><circle cx={1110} cy={572} r={26} fill={K.verm} /></g>
    <Lamina x={640} y={440} k={0.62} rot={-10} />
    <Aviao x={650} y={300} k={1.0} rot={4} />
    <Pal x={640} y={150} t="11,000 KM" s={150} c={K.verm} rot={-2} anc="middle" />
    <Pal x={640} y={690} t="TO FINISH ONE CHIP" s={76} rot={0} anc="middle" />
  </svg>
);
const C02c: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={380} cy={420} c1={K.verde} c2={K.verde2} />
    <Chip x={330} y={440} k={1.25} rot={-8} c={K.amar} />
    <g transform="translate(330,440) rotate(-8)"><text x={0} y={28} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={84} fill={TINTA}>2nm</text></g>
    <g transform="translate(980,520)" stroke={TINTA} strokeWidth={9} strokeLinejoin="round"><rect x={-190} y={-40} width={380} height={170} rx={14} fill={K.branco} /><path d="M -130,-40 L -130,-130 Q 0,-250 130,-130 L 130,-40" fill="none" strokeWidth={40} /><path d="M -130,-40 L -130,-130 Q 0,-250 130,-130 L 130,-40" fill="none" stroke={K.cinza} strokeWidth={22} /><circle cx={0} cy={30} r={26} fill={TINTA} /><rect x={-10} y={30} width={20} height={56} fill={TINTA} /></g>
    <Pal x={560} y={175} t="NEVER LEAVES" s={84} rot={-3} />
    <Pal x={660} y={300} t="TAIWAN" s={140} c={K.amar} rot={-3} />
  </svg>
);

// cadeado
export const Cadeado: React.FC<{ x: number; y: number; k?: number; rot?: number; c?: string }> = ({ x, y, k = 1, rot = 0, c = K.amar }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
    <path d="M -110,-40 L -110,-120 Q 0,-240 110,-120 L 110,-40" fill="none" strokeWidth={46} /><path d="M -110,-40 L -110,-120 Q 0,-240 110,-120 L 110,-40" fill="none" stroke={K.cinza} strokeWidth={26} />
    <rect x={-170} y={-40} width={340} height={230} rx={22} fill={c} /><circle cx={0} cy={50} r={30} fill={TINTA} /><rect x={-11} y={50} width={22} height={70} rx={6} fill={TINTA} />
  </g>
);
// placa de vídeo com duas ventoinhas
export const Placa: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = -6 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <rect x={-300} y={110} width={520} height={34} fill={K.amar} strokeWidth={7} />{Array.from({ length: 12 }, (_, i) => <line key={i} x1={-280 + i * 42} y1={112} x2={-280 + i * 42} y2={142} strokeWidth={5} />)}
    <rect x={-330} y={-130} width={660} height={240} rx={22} fill="#2B3442" /><rect x={-330} y={-130} width={660} height={46} rx={18} fill={K.menta} />
    {[-150, 150].map((fx) => <g key={fx}><circle cx={fx} cy={10} r={96} fill="#11161D" /><circle cx={fx} cy={10} r={26} fill={K.cinza} />{Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${fx},10 Q ${fx + 60 * Math.cos(i * 0.9 + 0.5)},${10 + 60 * Math.sin(i * 0.9 + 0.5)} ${fx + 88 * Math.cos(i * 0.9)},${10 + 88 * Math.sin(i * 0.9)}`} fill="none" stroke={K.cinza} strokeWidth={12} />)}</g>)}
    <rect x={330} y={-150} width={26} height={300} fill={K.cinza} />
  </G>
);
// cadeira de escritório vazia
export const Cadeira: React.FC<{ x: number; y: number; k?: number; c?: string }> = ({ x, y, k = 1, c = '#2B3442' }) => (
  <G x={x} y={y} k={k}>
    <path d="M -110,-260 Q 0,-300 110,-260 L 124,-20 Q 0,10 -124,-20 Z" fill={c} /><path d="M -70,-220 Q 0,-240 70,-220" fill="none" stroke={K.cinzaE} strokeWidth={10} />
    <rect x={-150} y={-10} width={300} height={62} rx={24} fill={c} /><rect x={-18} y={52} width={36} height={90} fill={K.cinza} />
    <path d="M 0,140 L -150,190 M 0,140 L 150,190 M 0,140 L 0,200" fill="none" strokeWidth={22} /><path d="M 0,140 L -150,190 M 0,140 L 150,190 M 0,140 L 0,200" fill="none" stroke={K.cinza} strokeWidth={10} />
    {[-150, 0, 150].map((cx) => <circle key={cx} cx={cx} cy={206} r={20} fill={TINTA} />)}
    <path d="M -150,-60 L -190,-60 L -190,20 M 150,-60 L 190,-60 L 190,20" fill="none" strokeWidth={24} /><path d="M -150,-60 L -190,-60 L -190,20 M 150,-60 L 190,-60 L 190,20" fill="none" stroke={K.cinzaE} strokeWidth={10} />
  </G>
);
// corrente (elos) entre dois pontos
export const Corrente: React.FC<{ x1: number; y1: number; x2: number; y2: number; n?: number }> = ({ x1, y1, x2, y2, n = 6 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 40, ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + (i % 2 ? 25 : -25);
    return <g key={i} transform={`translate(${x},${y}) rotate(${ang})`}><rect x={-46} y={-24} width={92} height={48} rx={24} fill="none" stroke={TINTA} strokeWidth={30} /><rect x={-46} y={-24} width={92} height={48} rx={24} fill="none" stroke={K.cinza} strokeWidth={13} /></g>; })}</g>
);
// etiqueta de preço
export const Etiqueta: React.FC<{ x: number; y: number; k?: number; rot?: number; t: string; c?: string }> = ({ x, y, k = 1, rot = 12, t, c = K.verm }) => (
  <G x={x} y={y} k={k} rot={rot}><path d="M -210,0 L -120,-100 L 210,-100 L 210,100 L -120,100 Z" fill={c} /><circle cx={-130} cy={0} r={22} fill={K.creme} /><text x={50} y={46} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={130} fill={K.branco} stroke={TINTA} strokeWidth={10} paintOrder="stroke">{t}</text></G>
);

const C03a: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={420} cy={450} c1={K.roxo} c2={K.roxo2} />
    <Placa x={400} y={470} k={0.95} rot={-8} />
    <Corrente x1={640} y1={430} x2={930} y2={470} n={5} />
    <Cadeado x={1030} y={480} k={0.95} rot={6} />
    <Pal x={36} y={176} t="NOBODY LEAVES" s={128} />
    <Pal x={60} y={290} t="HERE'S WHY" s={92} c={K.amar} />
  </svg>
);
const C03b: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={900} cy={420} c1={K.creme} c2={K.creme2} />
    <rect x={0} y={600} width={W} height={120} fill="#D9C7A0" stroke={TINTA} strokeWidth={9} />
    <Cadeira x={960} y={400} k={1.1} c={K.verde} />
    <Interroga x={960} y={330} s={230} c={K.verm} rot={6} />
    <Pal x={40} y={210} t="FOUNDER" s={150} c={K.verm} rot={-3} />
    <Pal x={48} y={350} t="GONE." s={150} c={K.verm} rot={-3} />
    <Pal x={48} y={520} t="MOAT: STILL" s={88} rot={-3} />
    <Pal x={48} y={620} t="THERE" s={88} rot={-3} />
  </svg>
);
const C03c: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={860} cy={440} c1={K.noite} c2={K.noite2} />
    <Chip x={900} y={440} k={1.3} rot={8} c={K.menta} />
    <Etiqueta x={560} y={520} k={0.95} rot={-14} t="$0" />
    <Pal x={40} y={190} t="FREE" s={190} c={K.amar} rot={-4} />
    <Pal x={470} y={190} t="IS THE TRAP" s={104} rot={-4} />
  </svg>
);

// estouro (estrela de impacto)
export const Estouro: React.FC<{ x: number; y: number; k?: number; c?: string; c2?: string }> = ({ x, y, k = 1, c = K.amar, c2 = K.branco }) => { const pts = (r1: number, r2: number) => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, r = i % 2 ? r1 : r2; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' '); return (
  <g transform={`translate(${x},${y}) scale(${k})`} stroke={TINTA} strokeWidth={9} strokeLinejoin="round"><polygon points={pts(110, 190)} fill={c} /><polygon points={pts(60, 110)} fill={c2} strokeWidth={6} /></g>); };
// emissor de laser (caixa com bocal) e feixe
export const Canhao: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = 0 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <rect x={-200} y={-90} width={330} height={180} rx={20} fill="#2B3442" /><rect x={-200} y={-90} width={330} height={44} rx={16} fill={K.verm} />
    <rect x={130} y={-46} width={70} height={92} fill={K.cinza} /><rect x={200} y={-30} width={36} height={60} fill={K.cinzaE} />
    {[-140, -80, -20].map((cx) => <circle key={cx} cx={cx} cy={30} r={18} fill={K.amar} strokeWidth={6} />)}
    <path d="M -150,90 L -180,160 L -90,160 L -60,90 Z M 30,90 L 0,160 L 90,160 L 120,90 Z" fill={K.cinzaE} />
  </G>
);
export const Feixe: React.FC<{ x1: number; y1: number; x2: number; y2: number; c?: string; l?: number }> = ({ x1, y1, x2, y2, c = K.verm, l = 30 }) => (<g strokeLinecap="round"><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={TINTA} strokeWidth={l + 20} /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={l} /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.branco} strokeWidth={l * 0.3} /></g>);
// globo simples
export const Globo: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <G x={x} y={y} k={k}><circle r={190} fill="#3BA7FF" /><ellipse rx={80} ry={190} fill="none" strokeWidth={7} /><line x1={-190} y1={0} x2={190} y2={0} strokeWidth={7} /><path d="M -165,-95 Q 0,-50 165,-95 M -165,95 Q 0,50 165,95" fill="none" strokeWidth={7} /></G>
);
// chapa de aço cortada
export const Chapa: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = -6 }) => (
  <G x={x} y={y} k={k} rot={rot}><path d="M -240,-60 L 240,-100 L 260,60 L -220,100 Z" fill={K.cinza} /><path d="M -200,-30 L 200,-64" fill="none" stroke={K.branco} strokeWidth={10} opacity={0.7} /><path d="M 10,-90 L 30,82" stroke={TINTA} strokeWidth={22} /><path d="M 10,-90 L 30,82" stroke={K.laranja} strokeWidth={8} /></G>
);

const C04a: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={1010} cy={450} c1="#C81E1E" c2="#F0392B" />
    <Feixe x1={330} y1={470} x2={960} y2={452} c={K.amar} l={34} />
    <Canhao x={230} y={470} k={0.95} rot={-2} />
    <Estouro x={1020} y={450} k={1.05} />
    <circle cx={1020} cy={450} r={34} fill={K.cinza} stroke={TINTA} strokeWidth={9} />
    <Pal x={40} y={170} t="50,000 SHOTS" s={136} c={K.amar} />
    <Pal x={60} y={282} t="A SECOND" s={96} />
    <Pal x={60} y={680} t="NEVER MISSES" s={84} rot={-2} />
  </svg>
);
const C04b: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={950} cy={420} c1={K.creme} c2={K.creme2} />
    <Globo x={950} y={430} k={1.25} />
    <g stroke={TINTA} strokeWidth={9} strokeLinejoin="round"><path d="M 990,300 q -70,-150 0,-170 q 70,20 0,170 Z" fill={K.verm} /><circle cx={990} cy={190} r={22} fill={K.branco} /></g>
    <Pal x={40} y={230} t="ONLY 1" s={210} c={K.verm} rot={-4} />
    <Pal x={50} y={380} t="COMPANY" s={120} rot={-4} />
    <Pal x={50} y={530} t="MAKES THIS LASER" s={72} c={K.amar} rot={-4} />
  </svg>
);
const C04c: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={640} cy={430} c1={K.noite} c2={K.noite2} />
    <Chapa x={300} y={500} k={1.05} />
    <Estouro x={320} y={420} k={0.42} c={K.laranja} />
    <path d="M 560,470 L 760,470" stroke={TINTA} strokeWidth={46} strokeLinecap="round" /><path d="M 560,470 L 760,470" stroke={K.amar} strokeWidth={26} strokeLinecap="round" /><path d="M 740,410 L 840,470 L 740,530 Z" fill={K.amar} stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
    <Chip x={1040} y={470} k={1.05} rot={6} c={K.menta} t="AI" />
    <Pal x={40} y={170} t="IT CUT STEEL." s={128} rot={-3} />
    <Pal x={420} y={300} t="NOW: AI CHIPS" s={104} c={K.amar} rot={-3} />
  </svg>
);

// saleiro / pote de tempero
export const Saleiro: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = -10 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <rect x={-130} y={-120} width={260} height={330} rx={44} fill={K.branco} /><path d="M -112,-120 Q -112,-240 0,-246 Q 112,-240 112,-120 Z" fill={K.verm} />
    {[[-44, -196], [0, -210], [44, -196], [-22, -168], [22, -168]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={10} fill={TINTA} stroke="none" />)}
    <rect x={-98} y={-40} width={196} height={130} rx={10} fill={K.amar} strokeWidth={7} /><text x={0} y={52} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={84} fill={TINTA} stroke="none">MSG</text>
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-60 + i * 22 + (i % 2) * 6} cy={-300 - (i % 3) * 34} r={8} fill={K.branco} strokeWidth={5} />)}
  </G>
);
// pilha de camadas (o filme entre o cobre)
export const Camadas: React.FC<{ x: number; y: number; k?: number; n?: number }> = ({ x, y, k = 1, n = 5 }) => (
  <G x={x} y={y} k={k}>{Array.from({ length: n }, (_, i) => <g key={i}><rect x={-230} y={120 - i * 70} width={460} height={42} rx={6} fill={K.menta} /><rect x={-230} y={162 - i * 70} width={460} height={28} rx={4} fill={K.laranja} /></g>)}</G>
);

const C05a: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={640} cy={430} c1={K.ceu} c2={K.ceu2} />
    <Saleiro x={260} y={480} k={0.92} rot={-12} />
    <path d="M 470,470 L 690,470" stroke={TINTA} strokeWidth={46} strokeLinecap="round" /><path d="M 470,470 L 690,470" stroke={K.amar} strokeWidth={26} strokeLinecap="round" /><path d="M 670,410 L 770,470 L 670,530 Z" fill={K.amar} stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
    <Chip x={1000} y={470} k={1.15} rot={6} c={K.menta} t="AI" />
    <Pal x={36} y={150} t="MSG MAKER" s={128} c={K.amar} rot={-3} />
    <Pal x={440} y={270} t="INSIDE AI CHIPS" s={100} rot={-3} />
  </svg>
);
const C05b: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={900} cy={420} c1={K.creme} c2={K.creme2} />
    <Chip x={980} y={330} k={0.85} rot={0} c={K.roxo2} t="AI" />
    <Camadas x={980} y={520} k={0.9} n={3} />
    <Pal x={40} y={240} t="95%" s={260} c={K.verm} rot={-4} />
    <Pal x={50} y={390} t="ONE FOOD" s={110} rot={-4} />
    <Pal x={50} y={510} t="COMPANY" s={110} rot={-4} />
    <Pal x={50} y={640} t="UNDER EVERY AI CHIP" s={60} c={K.amar} rot={-2} />
  </svg>
);
const C05c: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={380} cy={450} c1={K.verde} c2={K.verde2} />
    <Saleiro x={330} y={500} k={1.0} rot={8} />
    <Interroga x={620} y={560} s={260} c={K.amar} rot={10} />
    <Pal x={520} y={180} t="NVIDIA NEEDS" s={88} rot={-3} />
    <Pal x={700} y={330} t="THIS?" s={170} c={K.amar} rot={-3} />
    <Chip x={1060} y={520} k={0.72} rot={-8} c={K.menta} />
  </svg>
);

export const CAPAS: Record<string, React.FC> = { '02a': C02a, '02b': C02b, '02c': C02c, '03a': C03a, '03b': C03b, '03c': C03c, '04a': C04a, '04b': C04b, '04c': C04c, '05a': C05a, '05b': C05b, '05c': C05c };
