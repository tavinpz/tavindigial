import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Fonts } from './PickPals';
import { BoBunny, CoachKiwi } from './Toon';

const INK = C.ink;
const Title: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => (
  <g transform={`translate(${x} ${y})`}>
    <text textAnchor="middle" dominantBaseline="middle" fontFamily="Fredoka" fontWeight={700} fontSize={size} strokeLinejoin="round" paintOrder="stroke" stroke={INK} strokeWidth={size * 0.2}>
      <tspan fill={C.sun}>Pick </tspan><tspan fill={C.mint}>Pals</tspan>
    </text>
  </g>
);
const Dots: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <>{Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(i * 263) % w} cy={(i * 151) % h} r={10 + (i % 4) * 8} fill="#fff" opacity={0.22} />)}</>
);

export const PPBrand: React.FC<{ v: 'logo' | 'banner' }> = ({ v }) => {
  if (v === 'logo')
    return (
      <AbsoluteFill><Fonts />
        <svg width={800} height={800} viewBox="0 0 800 800">
          <defs><radialGradient id="lg" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#8FD3FF" /><stop offset="1" stopColor="#3E9BFF" /></radialGradient></defs>
          <rect width={800} height={800} fill="url(#lg)" />
          <Dots w={800} h={800} />
          <BoBunny x={400} y={1010} s={2.05} t={0.3} viseme="grin" look={[0, 0]} armR={0.9} armL={0.05} />
          <g transform="translate(400 690) rotate(-4)">
            <rect x={-250} y={-66} width={500} height={132} rx={66} fill="#fff" stroke={INK} strokeWidth={10} />
            <Title x={0} y={6} size={96} />
          </g>
        </svg>
      </AbsoluteFill>
    );
  // banner YouTube 2560x1440; área segura em todos os aparelhos: 1546x423 no centro
  return (
    <AbsoluteFill><Fonts />
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7CC8FF" /><stop offset="1" stopColor="#B49BFF" /></linearGradient></defs>
        <rect width={2560} height={1440} fill="url(#bg)" />
        <Dots w={2560} h={1440} />
        <rect y={1010} width={2560} height={430} fill="#F3C48E" />
        <rect y={990} width={2560} height={24} fill="#fff" />
        {/* área segura: x 507–2053, y 508–931 */}
        <BoBunny x={700} y={1330} s={1.55} t={0.4} viseme="grin" look={[0.6, -0.3]} armR={0.95} armL={0.1} />
        <CoachKiwi x={1880} y={1330} s={1.35} t={0.2} flip viseme="smile" wing={0.3} point={0.4} />
        <Title x={1290} y={650} size={180} />
        <g transform="translate(1290 840)">
          <rect x={-450} y={-44} width={900} height={88} rx={44} fill="#fff" stroke={INK} strokeWidth={8} />
          <text textAnchor="middle" dominantBaseline="middle" y={4} fontFamily="Fredoka" fontWeight={700} fontSize={46} fill={INK}>Which one is right? New video every day!</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
