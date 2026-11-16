import React from 'react';
import { AbsoluteFill } from 'remotion';
import { B52Frente, B52Topo, C, JatoTopo, MONO, SANS, rad } from './lib';

// Thumbnails do Crosswind #01 (1280x720). v = 'a' | 'b' | 'c'
const Pista: React.FC = () => (
  <>
    <rect width={1280} height={720} fill="#16211a" />
    <rect x={-100} y={250} width={1500} height={240} fill="#2b3037" />
    <line x1={-100} y1={258} x2={1400} y2={258} stroke="#eef1f4" strokeWidth={5} />
    <line x1={-100} y1={482} x2={1400} y2={482} stroke="#eef1f4" strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 120 - 20} y={366} width={64} height={8} fill="#eef1f4" />)}
  </>
);

export const Thumb: React.FC<{ v: string }> = ({ v }) => (
  <AbsoluteFill style={{ background: C.fundo }}>
    <svg viewBox="0 0 1280 720" width={1280} height={720}>
      <defs><radialGradient id="vin" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient></defs>
      {v === 'a' && <>
        <Pista />
        <g transform="translate(520,370) rotate(-20) scale(2.15)"><B52Topo id="ta" /></g>
        <line x1={520} y1={370} x2={1250} y2={370} stroke="#fff" strokeWidth={6} strokeDasharray="22 14" />
        <line x1={520} y1={370} x2={520 + 760 * Math.cos(rad(-20))} y2={370 + 760 * Math.sin(rad(-20))} stroke={C.laranja} strokeWidth={6} strokeDasharray="22 14" />
        <path d={`M900,370 A380,380 0 0 0 ${520 + 380 * Math.cos(rad(-20))},${370 + 380 * Math.sin(rad(-20))}`} stroke={C.laranja} strokeWidth={10} fill="none" />
        <rect width={1280} height={720} fill="url(#vin)" />
        <text x={1240} y={690} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={190} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14}>20°</text>
        <text x={50} y={120} fill="#fff" fontFamily={SANS} fontWeight={900} fontSize={104} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14}>ON PURPOSE</text>
      </>}
      {v === 'b' && <>
        <defs><linearGradient id="ceuT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07111c" /><stop offset="1" stopColor="#2c3f52" /></linearGradient><radialGradient id="fT"><stop offset="0" stopColor="#fff3c4" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" /></radialGradient></defs>
        <rect width={1280} height={720} fill="url(#ceuT)" />
        <rect y={620} width={1280} height={100} fill="#151b22" />
        <g transform="translate(-320,-230) scale(1.0)"><B52Frente cx={960} solo={850} incl={-5.4} /></g>
        <circle cx={60} cy={622} r={70} fill="none" stroke={C.vermelho} strokeWidth={10} />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={60 + Math.cos(i * 0.7) * (40 + (i % 4) * 22)} cy={600 - Math.abs(Math.sin(i * 0.7)) * (30 + (i % 3) * 25)} r={7} fill="url(#fT)" />)}
        <rect width={1280} height={720} fill="url(#vin)" />
        <text x={1240} y={130} textAnchor="end" fill="#fff" fontFamily={SANS} fontWeight={900} fontSize={110} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14}>IT CAN'T</text>
        <text x={1240} y={250} textAnchor="end" fill={C.laranja} fontFamily={SANS} fontWeight={900} fontSize={110} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14}>TILT</text>
      </>}
      {v === 'c' && <>
        <Pista />
        <line x1={640} y1={0} x2={640} y2={720} stroke="#000" strokeWidth={10} />
        <g transform="translate(330,370) scale(1.45)"><JatoTopo id="tc1" /></g>
        <g transform="translate(980,370) rotate(-20) scale(1.35)"><B52Topo id="tc2" /></g>
        <rect width={1280} height={720} fill="url(#vin)" />
        <g transform="translate(330,640)"><circle r={48} fill="rgba(74,222,128,.2)" stroke={C.verde} strokeWidth={7} /><path d="M-22,0 L-6,16 L24,-18" stroke={C.verde} strokeWidth={9} fill="none" strokeLinecap="round" /></g>
        <text x={980} y={680} textAnchor="middle" fill={C.laranja} fontFamily={SANS} fontWeight={900} fontSize={150} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14}>?!</text>
        <text x={640} y={120} textAnchor="middle" fill="#fff" fontFamily={SANS} fontWeight={900} fontSize={96} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14}>WHY SIDEWAYS?</text>
      </>}
    </svg>
  </AbsoluteFill>
);
