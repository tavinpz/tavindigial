import React from 'react';
import { Easing, interpolate, spring } from 'remotion';

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
    <linearGradient id="celM" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={K.sombra} /><stop offset="0.34" stopColor={K.sombra} /><stop offset="0.34" stopColor={K.osso} /><stop offset="1" stopColor={K.osso} /></linearGradient>
    <linearGradient id="celGM" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#57534d" /><stop offset="0.34" stopColor="#57534d" /><stop offset="0.34" stopColor="#77736c" /><stop offset="1" stopColor="#77736c" /></linearGradient>
    <filter id="brilho" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7" /></filter>
  </defs>
);

export type Pose = { ombE: number; ombD: number; cotE?: number; cotD?: number; pernaE?: number; pernaD?: number; pe?: 'chao' | 'solto'; punho?: boolean };
type FigP = { x: number; y: number; esc?: number; pose: Pose; vol?: number; cinza?: boolean; tendao?: number; resp?: number; op?: number; cabeca?: number };

// Personagem fixo do canal (v2: anatomia desenhada). Origem na linha dos ombros, luz vindo da esquerda.
// vol = volume (1 magro definido, 1.6 grandão). Os membros são desenhados para o lado direito da tela e espelhados.
export const Figura: React.FC<FigP> = ({ x, y, esc = 1, pose, vol = 1, cinza, tendao = 0, resp = 0, op = 1, cabeca = 0 }) => {
  const P = cinza ? 'url(#celG)' : 'url(#cel)', PM = cinza ? 'url(#celGM)' : 'url(#celM)';
  const SH = cinza ? '#4b4843' : K.sombra;
  const st = (m: boolean) => ({ fill: m ? PM : P, stroke: K.tinta, strokeWidth: 4.5, strokeLinejoin: 'round' as const });
  const ln = { fill: 'none', stroke: K.tinta, strokeWidth: 2.6, strokeLinecap: 'round' as const, opacity: cinza ? 0.5 : 0.8 };
  const fino = { fill: 'none', stroke: K.tinta, strokeWidth: 1.6, strokeLinecap: 'round' as const, opacity: cinza ? 0.3 : 0.45 };
  const v = vol, oW = 86 * (0.88 + 0.22 * v), cint = 44 * (0.5 + 0.5 * v * v), hip = 54 * (0.75 + 0.25 * v);
  const braco = (lado: 1 | -1, omb: number, cot: number) => {
    const m = lado === -1;
    return (
      <g transform={`translate(${lado * oW},12) rotate(${-lado * omb}) scale(${lado},1)`}>
        <path d={`M ${-25 * v},6 C ${-33 * v},38 ${-30 * v},72 ${-20 * v},116 L ${20 * v},116 C ${28 * v},84 ${32 * v},48 ${26 * v},4 Z`} {...st(m)} />
        <path d={`M ${-4 * v},30 C ${-12 * v},56 ${-10 * v},88 ${-3 * v},108`} {...ln} />
        <path d={`M ${14 * v},52 C ${18 * v},72 ${16 * v},92 ${11 * v},108`} {...fino} />
        <g transform={`translate(0,112) rotate(${-cot})`}>
          <path d={`M ${-21 * v},-2 C ${-30 * v},26 ${-22 * v},70 ${-13},108 L ${13},108 C ${20 * v},70 ${33 * v},30 ${21 * v},-4 Z`} {...st(m)} />
          <path d={`M ${11 * v},8 C ${16 * v},40 ${9 * v},74 5,100`} {...ln} opacity={0.5} />
          {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 9 * v - 3},24 Q ${k * 7 * v - 2},64 ${k * 4},102`} fill="none" stroke={tendao > 0.02 ? K.ambar : K.tinta} strokeWidth={tendao > 0.02 ? 4.5 : 1.6} strokeLinecap="round" opacity={tendao > 0.02 ? tendao : 0.35} />)}
          {tendao > 0.02 && <path d={`M ${-21 * v},-2 C ${-30 * v},26 ${-22 * v},70 -13,108 L 13,108 C ${20 * v},70 ${33 * v},30 ${21 * v},-4 Z`} fill={K.ambar} opacity={0.32 * tendao} filter="url(#brilho)" />}
          {pose.punho
            ? <g><rect x={-20} y={96} width={40} height={32} rx={12} {...st(m)} />{[-9, 0, 9].map((k) => <path key={k} d={`M ${k},99 L ${k},122`} {...ln} strokeWidth={2} />)}<path d="M -20,118 Q -27,108 -19,100" {...ln} /></g>
            : <g><path d="M -13,106 L 13,106 L 15,130 C 15,152 9,164 3,166 L -8,166 C -15,152 -15,130 -13,106 Z" {...st(m)} /><path d="M -13,112 C -24,120 -24,140 -15,148" {...st(m)} strokeWidth={3.5} />{[-5, 1, 7].map((k) => <path key={k} d={`M ${k},140 L ${k},162`} {...fino} opacity={0.6} />)}</g>}
        </g>
        <ellipse cx={0} cy={113} rx={17 * v} ry={9} fill={m ? PM : P} />
        <path d={`M ${12 * v},56 C ${22 * v},46 ${30 * v},32 ${31 * v},12 C ${25 * v},34 ${16 * v},44 ${8 * v},50 Z`} fill={K.tinta} opacity={0.85} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${16 * v - i * 5},${70 + i * 9} l ${7 * v},-9`} {...fino} opacity={0.7} />)}
        {/* deltoide */}
        <path d={`M ${-24 * v},-10 C ${-6 * v},-27 ${27 * v},-22 ${31 * v},6 C ${33 * v},28 ${25 * v},44 ${13 * v},54 C ${7 * v},36 ${-10 * v},20 ${-24 * v},12 Z`} {...st(m)} />
        <path d={`M ${4 * v},-14 C ${10 * v},6 ${13 * v},28 ${13 * v},46`} {...fino} /><path d={`M ${17 * v},-10 C ${22 * v},8 ${22 * v},26 ${18 * v},42`} {...fino} />
      </g>
    );
  };
  const perna = (lado: 1 | -1, ang: number) => {
    const m = lado === -1; const q = 0.78 + 0.22 * v;
    return (
      <g transform={`translate(${lado * 31 * q},208) rotate(${-lado * ang}) scale(${lado},1)`}>
        <path d={`M ${-30 * q},0 C ${-36 * q},50 ${-28 * q},120 -20,166 L 20,166 C ${30 * q},120 ${41 * q},60 ${34 * q},0 Z`} {...st(m)} />
        <path d={`M ${5 * q},18 C ${11 * q},70 7,120 3,150`} {...ln} opacity={0.55} />
        <path d={`M ${23 * q},34 C ${29 * q},80 25,120 18,150`} {...fino} />
        <path d="M -16,118 C -23,138 -13,158 -4,150" {...ln} opacity={0.6} />
        <g transform="translate(0,168)">
          <path d={`M ${-19 * q},0 C ${-29 * q},34 -22,96 -11,156 L 11,156 C 18,104 ${31 * q},40 ${20 * q},0 Z`} {...st(m)} />
          <path d={`M ${12 * q},22 C ${19 * q},60 12,96 8,118`} {...ln} opacity={0.5} /><path d="M -3,24 L -3,128" {...fino} />
          {pose.pe === 'solto'
            ? <path d="M -11,152 C -15,186 -9,208 0,212 C 9,208 13,186 11,152 Z" {...st(m)} />
            : <g><path d="M -13,152 L 13,152 L 20,170 C 34,176 36,190 26,192 L -14,192 C -20,186 -18,166 -13,152 Z" {...st(m)} />{[8, 15, 22].map((k) => <path key={k} d={`M ${k},184 L ${k + 1},191`} {...fino} opacity={0.6} />)}</g>}
          <ellipse cx={0} cy={0} rx={17 * q} ry={8} fill={m ? PM : P} /><path d="M -11,-6 Q 0,-14 11,-6" {...ln} opacity={0.7} /><path d="M -9,8 Q 0,15 9,8" {...ln} opacity={0.7} />
        </g>
      </g>
    );
  };
  const short = cinza ? ['#3a3835', '#2b2927'] : [K.verm, '#B02513'];
  const tronco = `M ${-oW - 2},2 C ${-oW * 0.72},-16 -30,-18 -18,-14 L 18,-14 C 30,-18 ${oW * 0.72},-16 ${oW + 2},2 C ${oW + 10},40 ${oW + 2},74 ${oW - 8},96 C ${oW - 22},128 ${cint + 6},150 ${cint},176 L ${hip},222 L ${-hip},222 L ${-cint},176 C ${-(cint + 6)},150 ${-(oW - 22)},128 ${-(oW - 8)},96 C ${-(oW + 2)},74 ${-(oW + 10)},40 ${-oW - 2},2 Z`;
  const peito = (l: 1 | -1) => (
    <g transform={`scale(${l},1)`}>
      <path d={`M 3,30 C 22,22 60,22 ${oW - 12},36 C ${oW - 6},58 ${oW - 22},78 50,84 C 30,90 10,84 3,74 Z`} fill={l === 1 ? P : PM} stroke={K.tinta} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M 6,76 C 26,88 54,86 ${oW - 16},66 C ${oW - 20},80 50,92 30,92 C 16,92 8,85 6,76 Z`} fill={cinza ? SH : K.tinta} opacity={0.88} />
      {l === 1 && !cinza && <path d={`M ${oW - 10},98 C ${oW - 22},128 ${cint + 6},150 ${cint},176 L ${cint - 9},176 C ${cint - 4},150 ${oW - 34},128 ${oW - 24},100 Z`} fill={K.tinta} opacity={0.8} />}
      {l === 1 && !cinza && [0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${cint - 12 + i * 2},${168 - i * 14} l -12,9`} {...fino} opacity={0.75} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M ${oW - 20 - i * 5},${100 + i * 17} q -10,2 -16,10`} {...ln} />)}
      <path d={`M ${cint + 13},112 C ${cint + 8},140 ${cint + 2},158 ${cint - 2},176`} {...fino} />
      <path d={`M ${cint - 2},182 L 13,218`} {...ln} opacity={0.5} />
      <path d={`M 8,2 C 30,-5 56,-3 ${oW - 10},5`} {...ln} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${esc})`} opacity={op}>
      {perna(-1, pose.pernaE ?? 4)}{perna(1, pose.pernaD ?? 4)}
      <g transform={`scale(${1 + resp * 0.012},${1 - resp * 0.004})`}>
        <path d="M -44,-8 C -28,-22 -20,-34 -15,-46 L 15,-46 C 20,-34 28,-22 44,-8 Z" {...st(false)} />
        <path d={tronco} {...st(false)} />
        {cinza
          ? <path d={`M ${-oW * 0.6},-8 Q 0,34 ${oW * 0.6},-8 L ${oW - 6},96 C ${oW - 22},128 ${cint + 6},150 ${cint},176 L ${hip},220 L ${-hip},220 L ${-cint},176 C ${-(cint + 6)},150 ${-(oW - 22)},128 ${-(oW - 6)},96 Z`} fill="#2a2927" stroke={K.tinta} strokeWidth={3} />
          : <>
            {peito(-1)}{peito(1)}
            <path d="M 0,26 L 0,94" {...ln} />
            {[0, 1, 2].map((i) => [-1, 1].map((l) => (
              <g key={`${i}${l}`}><rect x={l === 1 ? 3 : -27 + i} y={97 + i * 26} width={24 - i} height={23} rx={9} fill={l === 1 ? P : K.osso} stroke={K.tinta} strokeWidth={1.8} opacity={0.95} /></g>
            )))}
            <path d="M 0,176 q 0,8 0,12" {...ln} /><ellipse cx={0} cy={184} rx={3} ry={4} fill={K.tinta} opacity={0.7} />
          </>}
      </g>
      {/* short com cós, listra e dobras */}
      <path d={`M ${-hip * 1.08},190 L ${hip * 1.08},190 L ${hip * 1.42},318 L 10,322 L 0,268 L -10,322 L ${-hip * 1.42},318 Z`} fill={short[0]} stroke={K.tinta} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${hip * 0.5},194 L ${hip * 1.08},190 L ${hip * 1.42},318 L ${hip * 0.72},320 Z`} fill={short[1]} opacity={0.85} />
      {!cinza && <><path d={`M ${hip * 0.9},198 L ${hip * 1.22},314`} stroke={K.osso} strokeWidth={5} opacity={0.9} /><path d={`M ${-hip * 0.9},198 L ${-hip * 1.22},314`} stroke={K.osso} strokeWidth={5} opacity={0.9} /></>}
      <path d={`M ${-hip * 1.08},192 L ${hip * 1.08},192`} stroke={K.tinta} strokeWidth={9} /><path d={`M ${-hip * 1.02},192 L ${hip * 1.02},192`} stroke={short[1]} strokeWidth={4} />
      <path d="M -4,198 q -3,14 -7,20 M 4,198 q 3,14 7,20" {...ln} opacity={0.6} />
      <path d={`M ${-hip * 0.5},230 q 8,30 2,60 M ${hip * 0.4},236 q -6,30 0,56`} {...fino} opacity={0.5} />
      {braco(-1, pose.ombE, pose.cotE ?? 6)}{braco(1, pose.ombD, pose.cotD ?? 6)}
      {/* pescoço */}
      <path d="M -20,-56 L 20,-56 L 25,-10 L -25,-10 Z" {...st(false)} /><path d="M -14,-46 L -5,-10 M 14,-46 L 5,-10" {...fino} />
      <path d="M -20,-44 Q 0,-28 20,-44 L 20,-56 L -20,-56 Z" fill={cinza ? SH : K.tinta} opacity={0.88} />
      {/* cabeça */}
      <g transform={`translate(0,-94) rotate(${cabeca}) scale(1.14)`}>
        <path d="M -31,-8 q -8,4 -4,20 q 3,8 8,6 Z" {...st(false)} strokeWidth={3.5} /><path d="M 31,-8 q 8,4 4,20 q -3,8 -8,6 Z" {...st(false)} strokeWidth={3.5} />
        <path d="M -29,-12 C -31,-40 -18,-50 0,-50 C 18,-50 31,-40 29,-12 C 29,6 24,20 13,34 L 4,44 Q 0,46 -4,44 L -13,34 C -24,20 -29,6 -29,-12 Z" {...st(false)} />
        {cinza
          ? <path d="M -33,-10 C -40,-52 -16,-66 2,-63 C 28,-66 40,-44 33,-10 C 29,-28 23,-36 12,-38 C 4,-30 -10,-40 -18,-34 C -26,-30 -30,-22 -33,-10 Z" fill="#262523" stroke={K.tinta} strokeWidth={3.5} strokeLinejoin="round" />
          : <>
            <path d="M -34,-6 L -41,-30 L -34,-28 L -44,-54 L -31,-47 L -31,-74 L -17,-57 L -10,-84 L -1,-59 L 10,-86 L 16,-59 L 32,-76 L 30,-49 L 45,-56 L 35,-30 L 42,-28 L 34,-6 L 28,-26 L 20,-13 L 12,-30 L 4,-11 L -6,-30 L -14,-13 L -22,-28 Z" fill="#141416" stroke={K.osso} strokeWidth={2.6} strokeLinejoin="round" />
            {[[-36, -50, -26, -34], [-25, -66, -18, -44], [-8, -74, -4, -48], [11, -76, 12, -48], [28, -66, 24, -42], [38, -48, 31, -32]].map((q, i) => <path key={i} d={`M ${q[0]},${q[1]} L ${q[2]},${q[3]}`} stroke={K.osso} strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />)}
          </>}
        <path d="M -26,-17 L -7,-9" stroke={K.tinta} strokeWidth={5.5} strokeLinecap="round" /><path d="M 26,-17 L 7,-9" stroke={K.tinta} strokeWidth={5.5} strokeLinecap="round" />
        <path d="M -23,-4 L -8,-2 L -10,5 Q -16,7 -21,3 Z" fill="#fff" stroke={K.tinta} strokeWidth={1.6} /><path d="M 23,-4 L 8,-2 L 10,5 Q 16,7 21,3 Z" fill="#fff" stroke={K.tinta} strokeWidth={1.6} />
        <path d="M -24,-5 L -7,-2.5" stroke={K.tinta} strokeWidth={4} strokeLinecap="round" /><path d="M 24,-5 L 7,-2.5" stroke={K.tinta} strokeWidth={4} strokeLinecap="round" />
        <circle cx={-14} cy={0.5} r={3.6} fill={K.tinta} /><circle cx={14} cy={0.5} r={3.6} fill={K.tinta} /><circle cx={-13} cy={-0.5} r={1} fill="#fff" /><circle cx={15} cy={-0.5} r={1} fill="#fff" />
        <path d="M -1,8 L 2,15 L -2,16" {...ln} strokeWidth={2.2} /><path d="M -8,27 L 5,27 L 9,25" {...ln} strokeWidth={2.8} /><path d="M -3,33 L 3,33" {...fino} />
        {!cinza && <path d="M 29,-12 C 29,6 24,20 13,34 L 9,38 C 18,22 21,6 20,-14 Z" fill={K.tinta} opacity={0.82} />}
        {!cinza && [0, 1, 2].map((i) => <path key={i} d={`M ${-22 + i * 3},${12 + i * 5} l 7,5`} {...fino} opacity={0.6} />)}
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
