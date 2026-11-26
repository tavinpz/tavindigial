import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/anton/400.css';
import { B52Topo, B52Frente } from './lib';
import { SR71Lado, SR71Topo } from '../sr71/lib';
import { B747Lado, A380Lado } from '../a380/lib';

// Capas v3 do Crosswind (26/11): molde do INGENIUM (canal novo de aviação, "China's New 6th Gen Fighter" 1,9 mi):
// fundo claro de prancheta com grade, avião inteiro pintado de vermelho, 1 a 3 palavras pretas gigantes e
// uma anotação técnica fina. Um padrão só para o canal.
const AN = 'Anton, Impact, sans-serif';
const MONO = '"JetBrains Mono", monospace';
const T: React.FC<{ x: number; y: number; s: number; t: string; a?: 'start' | 'middle' | 'end'; cor?: string }> = ({ x, y, s, t, a = 'start', cor = '#111' }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={AN} fontSize={s} fill={cor} letterSpacing={-1}>{t}</text>
);
const Nota: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: string; a?: 'start' | 'end' }> = ({ x1, y1, x2, y2, t, a = 'start' }) => (
  <g>
    <circle cx={x1} cy={y1} r={7} fill="#111" />
    <path d={`M${x1} ${y1} L${x2} ${y2} H${x2 + (a === 'start' ? 200 : -200)}`} stroke="#111" strokeWidth={3} fill="none" />
    <text x={x2 + (a === 'start' ? 6 : -6)} y={y2 - 12} textAnchor={a} fontFamily={MONO} fontWeight={800} fontSize={26} fill="#d41f17">{t}</text>
  </g>
);
const Prancheta: React.FC = () => (
  <g>
    <defs>
      <pattern id="gr3" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#d9e0e8" strokeWidth={1.5} /></pattern>
      <radialGradient id="vin3c" cx="0.5" cy="0.5" r="0.8"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.16" /></radialGradient>
      <filter id="verm" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.21 0.52 0.08 0 0.42  0.07 0.17 0.03 0 0.02  0.06 0.15 0.02 0 0.02  0 0 0 1 0" />
      </filter>
      <filter id="somb3"><feGaussianBlur stdDeviation="10" /></filter>
    </defs>
    <rect width={1280} height={720} fill="#f6f8fa" />
    <rect width={1280} height={720} fill="url(#gr3)" />
    <rect width={1280} height={720} fill="url(#vin3c)" />
  </g>
);
// Avião vermelho com sombra suave no papel
const Verm: React.FC<{ tr: string; children: React.ReactNode }> = ({ tr, children }) => (
  <g>
    <g transform={`translate(14 22)`} opacity={0.22} filter="url(#somb3)"><g transform={tr} style={{ filter: 'brightness(0)' }}>{children}</g></g>
    <g transform={tr} filter="url(#verm)">{children}</g>
  </g>
);

const CFG: Record<string, () => React.ReactElement> = {
  // #01 B-52 — "This Bomber Lands Crooked On Purpose"
  '1a': () => (<>
    <rect x={-50} y={330} width={1400} height={240} fill="#c9cfd6" />
    {Array.from({ length: 11 }, (_, i) => <rect key={i} x={i * 130 - 20} y={445} width={70} height={10} fill="#fff" />)}
    <Verm tr="translate(760,450) rotate(-20) scale(1.85)"><B52Topo id="v3a" /></Verm>
    <path d="M760 450 L1260 450" stroke="#111" strokeWidth={4} strokeDasharray="16 12" />
    <path d={`M1060 450 A300 300 0 0 0 ${760 + 300 * Math.cos(-0.349)} ${450 + 300 * Math.sin(-0.349)}`} stroke="#d41f17" strokeWidth={8} fill="none" />
    <T x={40} y={150} s={150} t="CROOKED." />
    <T x={46} y={232} s={74} t="ON PURPOSE" cor="#d41f17" />
    <text x={1240} y={690} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={30} fill="#111">NOSE 20° OFF THE RUNWAY</text>
  </>),
  '1b': () => (<>
    <Verm tr="translate(-180,20) scale(0.85)"><B52Frente cx={960} solo={800} incl={-5.4} /></Verm>
    <T x={640} y={150} s={150} t="IT CAN'T TILT" a="middle" />
    <Nota x1={128} y1={662} x2={150} y2={470} t="WINGTIP WHEELS" a="start" />
  </>),
  // #02 SR-71 — "Leaked Fuel Before Every Flight"
  '2a': () => (<>
    <Verm tr="translate(660,400) scale(4.0)"><SR71Lado id="v3b" /></Verm>
    {[[380, 520, 1.4], [520, 560, 1.9], [690, 530, 1.5], [820, 575, 1.2]].map(([x, y, s], i) => (
      <path key={i} transform={`translate(${x},${y}) scale(${s * 1.3})`} d="M0,-30 C14,-6 13,14 0,14 C-13,14 -14,-6 0,-30 Z" fill="#111" />
    ))}
    <ellipse cx={620} cy={650} rx={360} ry={26} fill="#111" opacity={0.85} />
    <T x={40} y={150} s={150} t="IT LEAKS." />
    <Nota x1={900} y1={420} x2={980} y2={250} t="ON PURPOSE" />
  </>),
  '2b': () => (<>
    <Verm tr="translate(150,410) scale(3.0,2.95) translate(150,0)"><SR71Topo id="v3c" /></Verm>
    <T x={1240} y={150} s={150} t="MACH 3.2" a="end" />
    <Nota x1={820} y1={420} x2={900} y2={610} t="SEALS ONLY AT 600°F" />
  </>),
  // #03 747 x A380 — "The 747 Was Saved by Its Hump. The A380 Had No Plan B"
  '3a': () => (<>
    <Verm tr="translate(240,590) scale(4.5)"><B747Lado id="v3d" trem={0} corcunda={1} /></Verm>
    <T x={40} y={150} s={150} t="THE HUMP" />
    <T x={46} y={232} s={74} t="SAVED IT" cor="#d41f17" />
    <Nota x1={640} y1={400} x2={780} y2={260} t="WHY IT'S UP THERE" />
  </>),
  '3b': () => (<>
    <g transform="translate(360,250) scale(2.2)" style={{ filter: 'grayscale(1) brightness(1.05)' }}><A380Lado id="v3e" trem={0} /></g>
    <Verm tr="translate(360,560) scale(2.2)"><B747Lado id="v3f" trem={0} corcunda={1} /></Verm>
    <T x={1240} y={130} s={120} t="NO PLAN B" a="end" />
    <text x={1240} y={330} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={34} fill="#111">A380 · 251 BUILT</text>
    <text x={1240} y={650} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={34} fill="#d41f17">747 · 1,574 BUILT</text>
  </>),
};

export const CWThumbV3: React.FC<{ v?: string }> = ({ v = '1a' }) => (
  <AbsoluteFill style={{ background: '#f6f8fa' }}>
    <svg viewBox="0 0 1280 720" width={1280} height={720}>
      <Prancheta />
      {(CFG[v] || CFG['1a'])()}
    </svg>
  </AbsoluteFill>
);
