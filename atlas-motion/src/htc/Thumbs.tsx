import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/inter/900.css';
import DE from './alemanha.json';
import { CAPAS } from './Capas';

// Hard to Copy: thumbnails 1280×720 (props.v = a | b | c).
// Padrão tirado das capas que mais renderam no nicho (Tradeoff Layer, nov/2026): fundo claro e saturado, traço preto grosso,
// 1 ou 2 palavras gigantes com contorno e sombra, um objeto concreto e um sinal simples (X vermelho, "?", seta). Sem logotipo e sem rosto.
const W = 1280, H = 720, TINTA = '#101418', F = '"Inter", sans-serif';
const K = { ceu: '#2F7BE8', ceu2: '#7DB8FF', creme: '#FFF4DC', verm: '#F0392B', amar: '#FFD23F', menta: '#39D98A', branco: '#FFFFFF', azulP: '#1B4FB8' };

// palavra gigante: contorno preto grosso + sombra deslocada
const Pal: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; rot?: number; anc?: 'start' | 'middle' | 'end' }> = ({ x, y, t, s = 170, c = K.branco, rot = -4, anc = 'start' }) => (
  <g transform={`rotate(${rot} ${x} ${y})`} fontFamily={F} fontWeight={900} fontSize={s} letterSpacing={-s * 0.03} textAnchor={anc} fontStyle="italic">
    <text x={x + s * 0.05} y={y + s * 0.06} fill={TINTA} stroke={TINTA} strokeWidth={s * 0.17} strokeLinejoin="round">{t}</text>
    <text x={x} y={y} fill={c} stroke={TINTA} strokeWidth={s * 0.15} strokeLinejoin="round" paintOrder="stroke">{t}</text>
  </g>
);
const Raios: React.FC<{ cx: number; cy: number; c1: string; c2: string }> = ({ cx, cy, c1, c2 }) => (
  <g><rect width={W} height={H} fill={c1} />{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, b = a + Math.PI / 12; return <path key={i} d={`M ${cx},${cy} L ${cx + Math.cos(a) * 1800},${cy + Math.sin(a) * 1800} L ${cx + Math.cos(b) * 1800},${cy + Math.sin(b) * 1800} Z`} fill={c2} opacity={0.55} />; })}</g>
);
// o espelho: disco brilhante em perspectiva, com base
const Espelho: React.FC<{ cx: number; cy: number; k?: number }> = ({ cx, cy, k = 1 }) => (
  <g transform={`translate(${cx},${cy}) scale(${k})`} stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
    <path d="M -70,150 L 70,150 L 110,215 L -110,215 Z" fill="#8A97A8" /><rect x={-22} y={70} width={44} height={90} fill="#B9C4D2" />
    <ellipse cx={0} cy={0} rx={230} ry={150} fill="#5B6B7E" />
    <ellipse cx={-8} cy={-8} rx={205} ry={128} fill={K.menta} />
    <ellipse cx={-8} cy={-8} rx={205} ry={128} fill="#D8FFF0" opacity={0.55} stroke="none" />
    <path d="M -150,-50 Q -60,-120 60,-110" fill="none" stroke={K.branco} strokeWidth={22} strokeLinecap="round" />
    <path d="M -165,10 Q -150,-10 -130,-22" fill="none" stroke={K.branco} strokeWidth={16} strokeLinecap="round" />
    <g transform="translate(150,-120)" fill={K.amar} strokeWidth={7}><path d="M 0,-58 L 14,-14 L 58,0 L 14,14 L 0,58 L -14,14 L -58,0 L -14,-14 Z" /></g>
  </g>
);
const Planta: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = -7 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} strokeLinejoin="round">
    <rect x={-210} y={-150} width={420} height={300} rx={10} fill={K.azulP} stroke={TINTA} strokeWidth={9} />
    {Array.from({ length: 7 }, (_, i) => <line key={'v' + i} x1={-210 + (i + 1) * 52.5} y1={-150} x2={-210 + (i + 1) * 52.5} y2={150} stroke={K.branco} strokeWidth={2} opacity={0.3} />)}
    {Array.from({ length: 5 }, (_, i) => <line key={'h' + i} x1={-210} y1={-150 + (i + 1) * 50} x2={210} y2={-150 + (i + 1) * 50} stroke={K.branco} strokeWidth={2} opacity={0.3} />)}
    <ellipse cx={0} cy={-6} rx={130} ry={82} fill="none" stroke={K.branco} strokeWidth={6} strokeDasharray="14 10" /><line x1={-130} y1={100} x2={130} y2={100} stroke={K.branco} strokeWidth={5} /><line x1={-130} y1={88} x2={-130} y2={112} stroke={K.branco} strokeWidth={5} /><line x1={130} y1={88} x2={130} y2={112} stroke={K.branco} strokeWidth={5} />
    <path d="M -150,-110 L 150,110 M 150,-110 L -150,110" stroke={TINTA} strokeWidth={62} strokeLinecap="round" /><path d="M -150,-110 L 150,110 M 150,-110 L -150,110" stroke={K.verm} strokeWidth={42} strokeLinecap="round" />
  </g>
);

const A: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={940} cy={420} c1={K.ceu} c2={K.ceu2} />
    <Planta x={290} y={540} k={0.9} />
    <Espelho cx={950} cy={440} k={1.18} />
    <Pal x={40} y={212} t="CAN'T COPY" s={160} />
    <Pal x={60} y={338} t="THIS" s={128} c={K.amar} rot={-4} />
  </svg>
);

const B: React.FC = () => {
  const esc = 0.6, ox = 40, oy = 70;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Raios cx={420} cy={380} c1={K.creme} c2="#FFE3A8" />
      <g transform={`translate(${ox + 10},${oy + 12}) scale(${esc})`}><path d={DE.d} fill={TINTA} stroke={TINTA} strokeWidth={26} strokeLinejoin="round" /></g>
      <g transform={`translate(${ox},${oy}) scale(${esc})`}><path d={DE.d} fill={K.menta} stroke={TINTA} strokeWidth={15} strokeLinejoin="round" /></g>
      <circle cx={ox + 300} cy={oy + 320} r={22} fill={K.verm} stroke={TINTA} strokeWidth={8} />
      <path d={`M ${ox + 330},${oy + 300} Q 520,200 640,250`} fill="none" stroke={TINTA} strokeWidth={14} strokeLinecap="round" />
      <path d="M 640,250 l -44,-4 l 22,-36 Z" fill={TINTA} stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
      <Pal x={610} y={440} t="0.1 mm" s={172} c={K.verm} rot={-3} />
      <Pal x={630} y={575} t="TALLEST BUMP" s={72} c={K.branco} rot={-3} />
      <Pal x={50} y={150} t="A MIRROR THIS BIG" s={74} c={K.amar} rot={-3} />
    </svg>
  );
};

const C: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={900} cy={430} c1="#13264F" c2="#1F3F82" />
    <Espelho cx={930} cy={430} k={1.2} />
    <g transform="translate(250,470) rotate(-8)" stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-190 + i * 8} y={40 - i * 46} width={380} height={56} rx={8} fill={i % 2 ? '#2FBF71' : '#39D98A'} />)}
      <circle cx={0} cy={-70} r={34} fill={K.creme} /><text x={0} y={-50} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={TINTA} stroke="none">$</text>
    </g>
    <text x={560} y={520} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={300} fill={TINTA} stroke={TINTA} strokeWidth={46} strokeLinejoin="round">?</text>
    <text x={552} y={510} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={300} fill={K.amar} stroke={TINTA} strokeWidth={30} strokeLinejoin="round" paintOrder="stroke">?</text>
    <Pal x={40} y={208} t="NOT FOR SALE" s={138} c={K.verm} />
  </svg>
);

export const HTCThumb: React.FC<{ v: string }> = ({ v }) => { const N = CAPAS[v]; return <AbsoluteFill style={{ background: '#000' }}>{N ? <N /> : v === 'b' ? <B /> : v === 'c' ? <C /> : <A />}</AbsoluteFill>; };
