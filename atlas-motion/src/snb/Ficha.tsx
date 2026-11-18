import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Defs, Figura, K, SANS, TIT } from './lib';

// Ficha do personagem do Strong Not Big: poses paradas para aprovar antes de animar.
export const SNBFicha: React.FC = () => (
  <AbsoluteFill style={{ background: K.fundo }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}><Defs />
      <text x={70} y={86} fontFamily={TIT} fontSize={54} fill={K.osso} letterSpacing={2}>STRONG NOT BIG <tspan fill={K.verm}>· CHARACTER v3</tspan></text>
      <Figura x={300} y={300} esc={1.08} pose={{ ombE: 9, ombD: 9, cotE: 8, cotD: 8, pe: 'chao' }} />
      <rect x={560} y={182} width={420} height={14} rx={7} fill={K.osso} />
      <Figura x={770} y={398} esc={1.0} pose={{ ombE: 168, ombD: 168, cotE: 2, cotD: 2, pernaE: 2, pernaD: 2, pe: 'solto', punho: true }} tendao={0.85} />
      <Figura x={1190} y={300} esc={1.08} pose={{ ombE: 82, ombD: 82, cotE: 118, cotD: 118, pe: 'chao', punho: true }} />
      <g transform="translate(1630,560)"><clipPath id="busto"><rect x={-250} y={-420} width={500} height={860} /></clipPath><g clipPath="url(#busto)"><Figura x={0} y={120} esc={2.9} pose={{ ombE: 9, ombD: 9, pe: 'chao' }} /></g></g>
      {[['front', 300], ['dead hang', 770], ['flex', 1190], ['close-up', 1630]].map(([t, x]) => <text key={t as string} x={x as number} y={1050} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={K.cinza}>{t}</text>)}
    </svg>
  </AbsoluteFill>
);
