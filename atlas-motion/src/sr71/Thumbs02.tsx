import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ASA_SR, C, K, MONO, SANS, SR71Lado, SR71Topo } from './lib';

// Thumbnails do Crosswind #02 (1280x720). v = 'a' | 'b' | 'c'
const Tx: React.FC<{ x: number; y: number; s: number; cor?: string; a?: 'start' | 'middle' | 'end'; mono?: boolean; children: React.ReactNode }> = ({ x, y, s, cor = '#fff', a = 'start', mono, children }) => (
  <text x={x} y={y} textAnchor={a} fill={cor} fontFamily={mono ? MONO : SANS} fontWeight={mono ? 800 : 900} fontSize={s} letterSpacing={mono ? 0 : -2} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14} strokeLinejoin="round">{children}</text>
);
const Pingo: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => <path transform={`translate(${x},${y}) scale(${s})`} d="M0,-30 C14,-6 13,14 0,14 C-13,14 -14,-6 0,-30 Z" fill={K.fuel} stroke="#000" strokeWidth={2.5} />;
export const Thumb02: React.FC<{ v: string }> = ({ v }) => (
  <AbsoluteFill style={{ background: C.fundo }}>
    <svg viewBox="0 0 1280 720" width={1280} height={720}>
      <defs>
        <radialGradient id="vin2" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient>
        <linearGradient id="ceu2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1420" /><stop offset="0.75" stopColor="#2c4054" /><stop offset="1" stopColor="#a8683a" /></linearGradient>
        <linearGradient id="chao2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#75808b" /><stop offset="1" stopColor="#39414a" /></linearGradient>
        <linearGradient id="frio2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b2238" /><stop offset="1" stopColor="#123a5c" /></linearGradient>
        <linearGradient id="quente2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a0f08" /><stop offset="1" stopColor="#a8361a" /></linearGradient>
      </defs>
      {v === 'a' && <>
        <rect width={1280} height={500} fill="url(#ceu2)" /><rect y={500} width={1280} height={220} fill="url(#chao2)" />
        <ellipse cx={560} cy={560} rx={470} ry={46} fill="#17130f" stroke={K.fuel} strokeWidth={5} /><ellipse cx={470} cy={552} rx={220} ry={12} fill={K.fuel2} opacity={0.55} />
        <g transform="translate(640,348) scale(4.15)"><SR71Lado id="t2a" /></g>
        {[[330, 470, 1.5], [520, 440, 1.9], [700, 480, 1.4], [600, 520, 1.2], [420, 520, 1.1]].map(([x, y, s], i) => <Pingo key={i} x={x} y={y} s={s} />)}
        <rect width={1280} height={720} fill="url(#vin2)" />
        <Tx x={46} y={128} s={124}>BUILT TO</Tx><Tx x={46} y={250} s={150} cor={C.laranja}>LEAK</Tx>
        <Tx x={1236} y={690} s={62} a="end" mono cor="#fff">MACH 3.2</Tx>
      </>}
      {v === 'b' && <>
        <rect width={1280} height={720} fill="#060c14" />
        {Array.from({ length: 26 }, (_, i) => <line key={i} x1={(i * 197) % 1280} y1={30 + ((i * 131) % 660)} x2={((i * 197) % 1280) + 180} y2={30 + ((i * 131) % 660)} stroke="#cfe8ff" strokeWidth={3} opacity={0.14} />)}
        <g transform="translate(560,400) scale(2.7)"><path d={ASA_SR} fill="none" stroke={C.azul} strokeWidth={2} strokeDasharray="5 4" /></g>
        <g transform="translate(155,400) scale(3.0,2.95) translate(150,0)"><SR71Topo id="t2b" calor={1} pos={1} /></g>
        <line x1={965} y1={310} x2={965} y2={490} stroke={C.azul} strokeWidth={6} /><line x1={1055} y1={310} x2={1055} y2={490} stroke={C.laranja} strokeWidth={6} /><path d="M975,330 L1045,330 M1030,318 L1045,330 L1030,342" stroke="#fff" strokeWidth={6} fill="none" />
        <rect width={1280} height={720} fill="url(#vin2)" />
        <Tx x={46} y={126} s={116}>IT GROWS</Tx>
        <Tx x={1240} y={690} s={150} a="end" mono cor={C.laranja}>+4 IN</Tx>
      </>}
      {v === 'c' && <>
        <rect width={640} height={720} fill="url(#frio2)" /><rect x={640} width={640} height={720} fill="url(#quente2)" />
        <g transform="translate(320,395) rotate(-90) scale(1.72)"><SR71Topo id="t2c" costuras={1} /></g>
        <g transform="translate(960,395) rotate(-90) scale(1.84)"><SR71Topo id="t2d" calor={1} pos={1} /></g>
        {[[250, 520, 1.7], [330, 590, 2.1], [400, 510, 1.5]].map(([x, y, s], i) => <Pingo key={i} x={x} y={y} s={s} />)}
        <line x1={640} y1={0} x2={640} y2={720} stroke="#000" strokeWidth={10} />
        <rect width={1280} height={720} fill="url(#vin2)" />
        <Tx x={320} y={690} s={92} a="middle" mono cor={C.azul}>70°F</Tx><Tx x={960} y={690} s={92} a="middle" mono cor={C.laranja}>600°F</Tx>
        <Tx x={640} y={104} s={96} a="middle">WHY IT LEAKS</Tx>
        <g transform="translate(1170,330)"><circle r={52} fill="rgba(74,222,128,.25)" stroke={C.verde} strokeWidth={8} /><path d="M-24,0 L-7,18 L26,-20" stroke={C.verde} strokeWidth={10} fill="none" strokeLinecap="round" /></g>
      </>}
    </svg>
  </AbsoluteFill>
);
