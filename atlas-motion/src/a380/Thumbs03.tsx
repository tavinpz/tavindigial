import React from 'react';
import { AbsoluteFill } from 'remotion';
import { A380Lado, AZ, B747Lado, C, MONO, Palete, SANS } from './lib';

// Thumbnails do Crosswind #03 (1280x720). v = 'a' | 'b' | 'c'
const Tx: React.FC<{ x: number; y: number; s: number; cor?: string; a?: 'start' | 'middle' | 'end'; mono?: boolean; children: React.ReactNode }> = ({ x, y, s, cor = '#fff', a = 'start', mono, children }) => (
  <text x={x} y={y} textAnchor={a} fill={cor} fontFamily={mono ? MONO : SANS} fontWeight={mono ? 800 : 900} fontSize={s} letterSpacing={mono ? 0 : -2} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={14} strokeLinejoin="round">{children}</text>
);
export const Thumb03: React.FC<{ v: string }> = ({ v }) => (
  <AbsoluteFill style={{ background: C.fundo }}>
    <svg viewBox="0 0 1280 720" width={1280} height={720}>
      <defs>
        <radialGradient id="vin3" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient>
        <linearGradient id="ceu3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1a2c" /><stop offset="1" stopColor="#2f5578" /></linearGradient>
        <linearGradient id="win3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a1f06" /><stop offset="1" stopColor="#a8591a" /></linearGradient>
        <linearGradient id="lose3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b2238" /><stop offset="1" stopColor="#123a5c" /></linearGradient>
      </defs>
      {v === 'a' && <>
        <rect width={1280} height={720} fill="url(#ceu3)" />
        <g transform="translate(180,480) scale(5.4)"><B747Lado id="t3a" nariz={1} trem={0} corcunda={1} />{[0, 1, 2].map((i) => <Palete key={i} x={146 + i * 19} y={15} w={16} h={13} />)}</g>
        <rect width={1280} height={720} fill="url(#vin3)" />
        <Tx x={46} y={126} s={112}>SAVED BY</Tx><Tx x={46} y={246} s={128} cor={C.laranja}>THE HUMP</Tx>
      </>}
      {v === 'b' && <>
        <rect width={1280} height={360} fill="url(#lose3)" /><rect y={360} width={1280} height={360} fill="url(#win3)" />
        <g transform="translate(340,215) scale(2.05)"><A380Lado id="t3b" trem={0} /></g>
        <g transform="translate(340,575) scale(2.05)"><B747Lado id="t3c" trem={0} corcunda={1} /></g>
        <line x1={0} y1={360} x2={1280} y2={360} stroke="#000" strokeWidth={10} />
        <rect width={1280} height={720} fill="url(#vin3)" />
        <Tx x={1240} y={270} s={190} a="end" mono cor="#ff4d4d">251</Tx><Tx x={1240} y={630} s={150} a="end" mono cor={C.laranja}>1,574</Tx>
        <Tx x={46} y={86} s={64} cor="#cfe8ff">NEWER. BIGGER.</Tx><Tx x={46} y={446} s={64}>OLDER. SMALLER.</Tx>
      </>}
      {v === 'c' && <>
        <rect width={1280} height={720} fill="url(#ceu3)" />
        <g transform="translate(600,440) scale(3.9)"><A380Lado id="t3d" trem={0} /></g>
        <path d="M940,170 L1220,450 M1220,170 L940,450" stroke="#ff4d4d" strokeWidth={46} strokeLinecap="round" /><path d="M940,170 L1220,450 M1220,170 L940,450" stroke="#000" strokeWidth={62} strokeLinecap="round" opacity={0} />
        <rect width={1280} height={720} fill="url(#vin3)" />
        <Tx x={46} y={126} s={116}>TOO BIG?</Tx><Tx x={46} y={690} s={84} mono cor={C.laranja}>€25 BILLION</Tx>
      </>}
    </svg>
  </AbsoluteFill>
);
