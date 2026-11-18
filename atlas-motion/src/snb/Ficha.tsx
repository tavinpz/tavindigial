import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Defs, Figura, K, SANS, TIT } from './lib';

// Ficha de comparação: personagem v1 como está x v1 com o tronco no traço da referência.
const Par: React.FC<{ x: number; t: 'v1' | 'ref'; rot: string }> = ({ x, t, rot }) => (
  <g>
    <text x={x + 380} y={120} textAnchor="middle" fontFamily={TIT} fontSize={50} fill={K.osso} letterSpacing={2}>{rot}</text>
    <Figura x={x + 190} y={330} esc={1.12} tronco={t} pose={{ ombE: 8, ombD: 8, pe: 'chao' }} />
    <rect x={x + 400} y={196} width={360} height={14} rx={7} fill={K.osso} />
    <Figura x={x + 580} y={203 + 200} esc={1.0} tronco={t} pose={{ ombE: 168, ombD: 168, cotE: 2, cotD: 2, pernaE: 2, pernaD: 2, pe: 'solto', punho: true }} tendao={0.85} />
  </g>
);
export const SNBFicha: React.FC = () => (
  <AbsoluteFill style={{ background: K.fundo }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}><Defs />
      <Par x={90} t="v1" rot="1 · PRIMEIRA VERSÃO" />
      <line x1={960} y1={60} x2={960} y2={1020} stroke="#2a2a2e" strokeWidth={3} />
      <Par x={1010} t="ref" rot="2 · TRONCO DA REFERÊNCIA" />
      <text x={960} y={1060} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={24} fill={K.cinza}>mesmo personagem, só muda o desenho do peitoral e do abdômen</text>
    </svg>
  </AbsoluteFill>
);
