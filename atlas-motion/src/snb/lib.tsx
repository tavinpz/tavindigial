import React from 'react';
import { Easing, interpolate, spring } from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';

// Strong Not Big: identidade e personagem do canal (tudo em SVG, sem imagem gerada).
export const K = { fundo: '#0B0B0C', osso: '#F1ECE2', sombra: '#C9C1B1', tinta: '#0B0B0C', verm: '#E3311D', ambar: '#FFB020', verde: '#3DDC84', cinza: '#8B8780', painel: '#17171A' };
export const TIT = '"Anton", "Inter", sans-serif';
export const SANS = '"Inter", sans-serif';
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const L = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const pop = (f: number, ini: number, damping = 13) => Math.min(1.2, Math.max(0, spring({ frame: f - ini, fps: 30, config: { damping, stiffness: 190 } })));
export type Fala = { t: number; d: number; txt: string };
export type CenaProps = { g: number; D: number; ts: number[] };

export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="cel" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={K.osso} /><stop offset="0.66" stopColor={K.osso} /><stop offset="0.66" stopColor={K.sombra} /><stop offset="1" stopColor={K.sombra} /></linearGradient>
    <linearGradient id="celG" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#77736c" /><stop offset="0.66" stopColor="#77736c" /><stop offset="0.66" stopColor="#57534d" /><stop offset="1" stopColor="#57534d" /></linearGradient>
    <filter id="brilho" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7" /></filter>
  </defs>
);

// membro afunilado com barriga de músculo, do ponto (0,0) até (0,len)
const membro = (len: number, w1: number, w2: number, b: number) =>
  `M ${-w1 / 2},0 C ${-(w1 / 2 + b)},${len * 0.28} ${-(w2 / 2 + b * 0.35)},${len * 0.72} ${-w2 / 2},${len} L ${w2 / 2},${len} C ${w2 / 2 + b * 0.35},${len * 0.72} ${w1 / 2 + b},${len * 0.28} ${w1 / 2},0 Z`;

export type Pose = { ombE: number; ombD: number; cotE?: number; cotD?: number; pernaE?: number; pernaD?: number; pe?: 'chao' | 'solto'; punho?: boolean };
type FigP = { x: number; y: number; esc?: number; pose: Pose; vol?: number; cinza?: boolean; tendao?: number; resp?: number; op?: number; cabeca?: number; tronco?: 'v1' | 'ref' };

// Personagem fixo do canal. Origem na linha dos ombros. vol = volume (1 magro definido, 1.6 grandão).
export const Figura: React.FC<FigP> = ({ x, y, esc = 1, pose, vol = 1, cinza, tendao = 0, resp = 0, op = 1, cabeca = 0, tronco = 'v1' }) => {
  const P = cinza ? 'url(#celG)' : 'url(#cel)';
  const st = { fill: P, stroke: K.tinta, strokeWidth: 4.5, strokeLinejoin: 'round' as const };
  const ln = { fill: 'none', stroke: K.tinta, strokeWidth: 3, strokeLinecap: 'round' as const, opacity: cinza ? 0.55 : 0.85 };
  const oW = 84 * (0.9 + 0.22 * vol), cint = 46 * (0.55 + 0.45 * vol * vol), quad = 58 * (0.75 + 0.25 * vol);
  const braco = (lado: 1 | -1, omb: number, cot: number) => (
    <g transform={`translate(${lado * oW},14) rotate(${-lado * omb})`}>
      <path d={membro(112, 54 * vol, 37 * vol, 7 * vol)} {...st} />
      <g transform={`translate(0,108) rotate(${-lado * cot})`}>
        <path d={membro(104, 43 * vol, 25 * vol, 9 * vol)} {...st} />
        {/* tendões do antebraço: acendem em âmbar */}
        {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 9 * vol},18 Q ${k * 7 * vol},60 ${k * 4},98`} fill="none" stroke={tendao > 0.02 ? K.ambar : K.tinta} strokeWidth={tendao > 0.02 ? 4.5 : 2} strokeLinecap="round" opacity={tendao > 0.02 ? tendao : 0.35} />)}
        {tendao > 0.02 && <path d={membro(104, 43 * vol, 25 * vol, 9 * vol)} fill={K.ambar} opacity={0.35 * tendao} filter="url(#brilho)" />}
        {pose.punho
          ? <rect x={-17 * vol} y={96} width={34 * vol} height={30} rx={11} {...st} />
          : <path d={`M ${-12},100 Q ${-17},122 ${-9},138 L 9,138 Q 17,122 12,100 Z`} {...st} />}
      </g>
      <ellipse cx={-lado * 2} cy={4} rx={31 * vol} ry={27 * vol} fill={P} />
      <path d={`M ${lado * 22 * vol},${-16} Q ${-lado * 38 * vol},${-26 * vol} ${-lado * 33 * vol},${14}`} {...ln} strokeWidth={4.5} opacity={1} />
      <path d={`M ${-17 * vol},30 Q 0,${44} ${17 * vol},30`} {...ln} />
      <path d={`M ${-lado * 4},50 Q ${-lado * 12 * vol},78 ${-lado * 3},100`} {...ln} opacity={0.5} />
    </g>
  );
  const perna = (lado: 1 | -1, ang: number) => (
    <g transform={`translate(${lado * 30 * (0.8 + 0.2 * vol)},206) rotate(${-lado * ang})`}>
      <path d={membro(150, quad * 1.18, 46 * (0.8 + 0.2 * vol), 8 * vol)} {...st} />
      <path d={`M ${lado * 6},20 Q ${lado * 16},80 ${lado * 6},132`} {...ln} opacity={0.45} />
      <g transform="translate(0,146)">
        <path d={membro(140, 46 * (0.8 + 0.2 * vol), 24, 11 * vol)} {...st} />
        {pose.pe === 'solto'
          ? <path d="M -11,134 Q -15,170 -3,186 L 6,186 Q 15,168 11,134 Z" {...st} />
          : <path d={`M ${-lado * 13},132 L ${lado * 13},132 L ${lado * 34},156 Q ${lado * 36},166 ${lado * 22},166 L ${-lado * 14},166 Z`} {...st} />}
        <path d="M -9,10 Q 0,18 9,10" {...ln} />
      </g>
    </g>
  );
  const cor = cinza ? '#3a3835' : K.verm;
  return (
    <g transform={`translate(${x},${y}) scale(${esc})`} opacity={op}>
      {perna(-1, pose.pernaE ?? 4)}{perna(1, pose.pernaD ?? 4)}
      {/* tronco */}
      <g transform={`scale(${1 + resp * 0.012},${1 - resp * 0.004})`}>
        <path d={`M ${-oW - 6},0 Q ${-oW * 0.7},-15 -17,-12 L 17,-12 Q ${oW * 0.7},-15 ${oW + 6},0 L ${oW * 1.02},64 Q ${cint * 1.45},118 ${cint},170 L ${quad * 1.02},216 L ${-quad * 1.02},216 L ${-cint},170 Q ${-cint * 1.45},118 ${-oW * 1.02},64 Z`} {...st} />
        {cinza
          ? <path d={`M ${-oW * 0.62},-6 Q 0,34 ${oW * 0.62},-6 L ${oW * 0.86},70 Q ${cint * 1.2},122 ${cint},170 L ${quad},214 L ${-quad},214 L ${-cint},170 Q ${-cint * 1.2},122 ${-oW * 0.86},70 Z`} fill="#2a2927" stroke={K.tinta} strokeWidth={3} />
          : tronco === 'ref' ? <>
            {/* tronco em traço fino, no estilo da referência: peitoral, abdômen orgânico em 4 fileiras, serrátil e linha em V */}
            {[-1, 1].map((l) => <g key={l} transform={`scale(${l},1)`}>
              <path d={`M 6,6 C 28,0 54,2 ${oW * 0.78},10`} {...ln} />
              <path d={`M 2,66 C 20,84 52,86 ${oW * 0.86},58`} {...ln} strokeWidth={3.4} />
              <path d={`M ${oW * 0.86},58 C ${oW * 0.9},44 ${oW * 0.84},30 ${oW * 0.74},22`} {...ln} opacity={0.5} />
              <circle cx={oW * 0.46} cy={62} r={2.6} fill={K.tinta} opacity={0.75} />
              {[0, 1, 2, 3].map((i) => { const y = 78 + i * 23, w = 30 - i * 2.5; return <path key={i} d={`M 3,${y} C ${w * 0.5},${y - 5} ${w},${y - 2} ${w + 1},${y + 9} C ${w + 1},${y + 19} ${w * 0.55},${y + 21} 3,${y + 19}`} {...ln} strokeWidth={2.4} />; })}
              {[0, 1, 2].map((i) => <path key={i} d={`M ${oW * 0.88 - i * 9},${82 + i * 19} q -12,3 -17,12`} {...ln} strokeWidth={2.2} opacity={0.7} />)}
              <path d={`M ${cint + 16},106 C ${cint + 10},134 ${cint + 3},154 ${cint - 2},172`} {...ln} strokeWidth={2} opacity={0.5} />
              <path d={`M ${cint - 4},176 L 14,212`} {...ln} strokeWidth={2.4} opacity={0.65} />
            </g>)}
            <path d="M 0,14 L 0,172" {...ln} strokeWidth={2.6} />
            <path d="M -3,176 q 3,5 6,0" {...ln} strokeWidth={2} />
          </> : <>
            <path d={`M ${-oW * 0.82},56 Q ${-oW * 0.42},88 -4,62`} {...ln} /><path d={`M ${oW * 0.82},56 Q ${oW * 0.42},88 4,62`} {...ln} />
            <path d="M 0,22 L 0,172" {...ln} />
            {[98, 126, 152].map((yy, i) => <path key={i} d={`M ${-26 + i * 2},${yy} Q 0,${yy + 5} ${26 - i * 2},${yy}`} {...ln} />)}
            <path d={`M ${-oW * 0.72},6 Q ${-oW * 0.38},15 -8,8`} {...ln} /><path d={`M ${oW * 0.72},6 Q ${oW * 0.38},15 8,8`} {...ln} />
            {[0, 1, 2].map((i) => <React.Fragment key={i}><path d={`M ${-cint - 14 + i * 3},${92 + i * 20} l 13,6`} {...ln} /><path d={`M ${cint + 14 - i * 3},${92 + i * 20} l -13,6`} {...ln} /></React.Fragment>)}
          </>}
      </g>
      {/* short */}
      <path d={`M ${-quad * 1.06},186 L ${quad * 1.06},186 L ${quad * 1.3},298 L 9,300 L 0,262 L -9,300 L ${-quad * 1.3},298 Z`} fill={cor} stroke={K.tinta} strokeWidth={4.5} strokeLinejoin="round" />
      {!cinza && <><path d={`M ${quad * 0.86},190 L ${quad * 1.06},296`} stroke={K.osso} strokeWidth={5} opacity={0.9} /><path d={`M ${-quad * 0.86},190 L ${-quad * 1.06},296`} stroke={K.osso} strokeWidth={5} opacity={0.9} /></>}
      <path d={`M ${-quad * 1.06},186 L ${quad * 1.06},186`} stroke={K.tinta} strokeWidth={8} />
      {braco(-1, pose.ombE, pose.cotE ?? 6)}{braco(1, pose.ombD, pose.cotD ?? 6)}
      {!cinza && <><path d={`M -19,-10 Q ${-oW * 0.5},-16 ${-oW * 0.8},-4`} {...ln} /><path d={`M 19,-10 Q ${oW * 0.5},-16 ${oW * 0.8},-4`} {...ln} /></>}
      {/* pescoço e cabeça */}
      <path d={`M ${-15 * (0.8 + 0.2 * vol)},-44 L ${15 * (0.8 + 0.2 * vol)},-44 L ${19 * vol},-8 L ${-19 * vol},-8 Z`} {...st} />
      <g transform={`translate(0,-80) rotate(${cabeca})`}>
        <path d="M -33,-6 Q -35,-44 0,-46 Q 35,-44 33,-6 Q 32,26 14,40 Q 0,48 -14,40 Q -32,26 -33,-6 Z" {...st} />
        <path d="M -33,-8 Q -36,-47 0,-49 Q 36,-47 33,-8 Q 20,-26 0,-26 Q -20,-26 -33,-8 Z" fill={cinza ? '#2a2927' : '#3b3a3d'} stroke={K.tinta} strokeWidth={3.5} />
        <path d="M -36,-4 q -7,6 -2,18" {...st} /><path d="M 36,-4 q 7,6 2,18" {...st} />
        <path d="M -22,-10 L -8,-7" {...ln} strokeWidth={4.5} /><path d="M 22,-10 L 8,-7" {...ln} strokeWidth={4.5} />
        <ellipse cx={-14} cy={0} rx={4} ry={3.2} fill={K.tinta} /><ellipse cx={14} cy={0} rx={4} ry={3.2} fill={K.tinta} />
        <path d="M 0,2 L -3,16 L 3,17" {...ln} /><path d="M -9,28 Q 0,31 9,27" {...ln} />
      </g>
    </g>
  );
};

// Texto curto que entra com mola. Palavras em MAIÚSCULA saem na cor de destaque.
export const Frase: React.FC<{ g: number; ini: number; fim?: number; x: number; y: number; txt: string; tam?: number; cor?: string; dest?: string; a?: 'start' | 'middle' | 'end'; fam?: string }> = ({ g, ini, fim = 1e9, x, y, txt, tam = 64, cor = K.osso, dest = K.verm, a = 'start', fam = SANS }) => {
  const s = pop(g, ini); const o = L(g, [ini, ini + 5], [0, 1]) * L(g, [fim - 8, fim], [1, 0]);
  if (o <= 0) return null;
  return (
    <text x={x} y={y + (1 - Math.min(1, s)) * 26} textAnchor={a} fontFamily={fam} fontWeight={800} fontSize={tam} fill={cor} opacity={o} letterSpacing={fam === TIT ? 1.5 : -0.5}>
      {txt.split(' ').map((p, i) => <tspan key={i} fill={p.length > 1 && p === p.toUpperCase() && /[A-Z]/.test(p) ? dest : cor}>{p + ' '}</tspan>)}
    </text>
  );
};

export const Etiqueta: React.FC<{ g: number; ini: number; txt: string; x?: number; y?: number }> = ({ g, ini, txt, x = 110, y = 96 }) => {
  const o = L(g, [ini, ini + 10], [0, 1]); const w = txt.length * 19.5 + 44;
  return (
    <g opacity={o} transform={`translate(${x - (1 - o) * 30},${y})`}>
      <rect x={0} y={-36} width={w} height={54} fill={K.painel} /><rect x={0} y={-36} width={7} height={54} fill={K.verm} />
      <text x={26} y={2} fontFamily={SANS} fontWeight={800} fontSize={29} fill={K.osso} letterSpacing={1.5}>{txt}</text>
    </g>
  );
};

export const Fonte: React.FC<{ g: number; ini: number; txt: string }> = ({ g, ini, txt }) => (
  <text x={960} y={1010} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={27} fill={K.cinza} opacity={L(g, [ini, ini + 12], [0, 1])}>{txt}</text>
);

// Anel de tempo: p de 0 a 1, rótulo no centro
export const Anel: React.FC<{ cx: number; cy: number; r: number; p: number; rot: string; sub?: string; op?: number }> = ({ cx, cy, r, p, rot, sub, op = 1 }) => {
  const c = 2 * Math.PI * r;
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#26262a" strokeWidth={20} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={K.verde} strokeWidth={20} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 34} textAnchor="middle" fontFamily={TIT} fontSize={104} fill={K.osso} letterSpacing={2}>{rot}</text>
      {sub && <text x={cx} y={cy + 84} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} fill={K.cinza}>{sub}</text>}
    </g>
  );
};
