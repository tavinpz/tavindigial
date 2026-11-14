import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Fonts } from './PickPals';

/* Pick Pals v3: 2D ilustrado com rig (cabeça, orelhas, braços e pernas "rubber hose", boca por visema) */
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/* membro curvo: ombro -> mão, com dobra (bend) */
const Limb: React.FC<{ x: number; y: number; ang: number; len: number; bend?: number; w: number; fill: string; line: string; end?: React.ReactNode }> = ({
  x, y, ang, len, bend = 0.3, w, fill, line, end,
}) => {
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.sin(a) * len, ey = y + Math.cos(a) * len;
  const mx = (x + ex) / 2 + Math.cos(a) * len * bend, my = (y + ey) / 2 - Math.sin(a) * len * bend;
  const d = `M${x} ${y} Q ${mx} ${my} ${ex} ${ey}`;
  return (
    <g>
      <path d={d} stroke={line} strokeWidth={w + 12} fill="none" strokeLinecap="round" />
      <path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" />
      <g transform={`translate(${ex} ${ey})`}>{end}</g>
    </g>
  );
};

export type Face = { mouth?: number; viseme?: 'smile' | 'grin' | 'o' | 'frown' | 'sick' | 'wow'; look?: [number, number]; blink?: number; brow?: number; happyEyes?: boolean };

const Eyes: React.FC<Face & { dx: number; y: number; r: number; line: string }> = ({ dx, y, r, look = [0, 0], blink = 1, brow = 0, happyEyes, line, viseme }) => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * dx} ${y})`}>
        {happyEyes ? (
          <path d={`M${-r * 0.8} ${r * 0.2} Q 0 ${-r * 0.9} ${r * 0.8} ${r * 0.2}`} stroke={line} strokeWidth={r * 0.32} fill="none" strokeLinecap="round" />
        ) : (
          <g transform={`scale(1 ${Math.max(0.08, blink)})`}>
            <ellipse rx={r * (viseme === 'wow' ? 0.95 : 0.82)} ry={r * (viseme === 'wow' ? 1.15 : 1)} fill="#2A1E36" />
            <ellipse cx={look[0] * r * 0.18} cy={look[1] * r * 0.18} rx={r * 0.62} ry={r * 0.78} fill="#4B3566" opacity={0.55} />
            <circle cx={look[0] * r * 0.25 + r * 0.25} cy={look[1] * r * 0.25 - r * 0.32} r={r * 0.3} fill="#fff" />
            <circle cx={look[0] * r * 0.25 - r * 0.28} cy={look[1] * r * 0.25 + r * 0.35} r={r * 0.13} fill="#fff" opacity={0.9} />
          </g>
        )}
        {/* sobrancelha */}
        <path d={`M${-r * 0.7} ${-r * 1.45 - brow * 8 + (viseme === 'sick' ? -sd * 8 : 0)} Q 0 ${-r * 1.75 - brow * 14} ${r * 0.7} ${-r * 1.45 - brow * 8}`}
          transform={`rotate(${sd * (viseme === 'frown' || viseme === 'sick' ? -14 : 4)})`} stroke={line} strokeWidth={r * 0.22} fill="none" strokeLinecap="round" />
      </g>
    ))}
  </g>
);

const Mouth: React.FC<{ y: number; w: number; f: Face; line: string }> = ({ y, w, f, line }) => {
  const m = cl(f.mouth || 0);
  const v = f.viseme || 'smile';
  if (m > 0.08 || v === 'o' || v === 'wow') {
    const ow = v === 'o' || v === 'wow' ? w * 0.42 : w * (0.55 + m * 0.25);
    const oh = v === 'o' || v === 'wow' ? w * 0.48 : w * (0.18 + m * 0.5);
    return (
      <g transform={`translate(0 ${y})`}>
        <path d={`M${-ow / 2} 0 Q 0 ${-oh * 0.25} ${ow / 2} 0 Q ${ow * 0.45} ${oh} 0 ${oh} Q ${-ow * 0.45} ${oh} ${-ow / 2} 0 Z`} fill="#7A2238" stroke={line} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cy={oh * 0.72} rx={ow * 0.25} ry={oh * 0.18} fill="#FF8FA6" />
        {m > 0.3 && <rect x={-ow * 0.28} y={-1} width={ow * 0.56} height={oh * 0.18} rx={4} fill="#fff" />}
      </g>
    );
  }
  if (v === 'grin') return <path transform={`translate(0 ${y})`} d={`M${-w / 2} 0 Q 0 ${w * 0.55} ${w / 2} 0 Q 0 ${w * 0.18} ${-w / 2} 0 Z`} fill="#7A2238" stroke={line} strokeWidth={6} strokeLinejoin="round" />;
  if (v === 'frown') return <path transform={`translate(0 ${y + 12})`} d={`M${-w * 0.35} 0 Q 0 ${-w * 0.25} ${w * 0.35} 0`} stroke={line} strokeWidth={7} fill="none" strokeLinecap="round" />;
  if (v === 'sick') return <path transform={`translate(0 ${y + 8})`} d={`M${-w * 0.4} 0 q ${w * 0.1} -12 ${w * 0.2} 0 t ${w * 0.2} 0 t ${w * 0.2} 0 t ${w * 0.2} 0`} stroke={line} strokeWidth={7} fill="none" strokeLinecap="round" />;
  return <path transform={`translate(0 ${y})`} d={`M${-w * 0.38} 0 Q 0 ${w * 0.32} ${w * 0.38} 0`} stroke={line} strokeWidth={7} fill="none" strokeLinecap="round" />;
};

/* ---------- BO: coelhinho de macacão ---------- */
export type BoT = Face & { x: number; y: number; s?: number; t: number; armL?: number; armR?: number; walk?: number; headTilt?: number; bounce?: number; sick?: number; holdR?: React.ReactNode; flip?: boolean };
export const BoBunny: React.FC<BoT> = (p) => {
  const { x, y, s = 1, t, armL = 0, armR = 0, walk = 0, headTilt = 0, bounce = 0, sick = 0, holdR, flip } = p;
  const fur = sick > 0 ? mixHex('#FFF3E2', '#D9F2B4', sick) : '#FFF3E2';
  const line = '#5B3A55';
  const breathe = Math.sin(t * 2.4) * 0.012;
  const step = Math.sin(walk * Math.PI * 2);
  const earW = Math.sin(t * 3.1) * 4 + bounce * 10;
  const hand = <circle r={19} fill={fur} stroke={line} strokeWidth={6} />;
  return (
    <g transform={`translate(${x} ${y - Math.abs(step) * 14 * (walk ? 1 : 0)}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cy={6} rx={110} ry={18} fill="#3A2340" opacity={0.16} />
      {/* pernas */}
      <Limb x={-34} y={-120} ang={step * 22} len={92} bend={-0.15} w={40} fill="#3E7BEA" line={line} end={<ellipse cx={-6} cy={6} rx={34} ry={20} fill="#FF6B5E" stroke={line} strokeWidth={6} />} />
      <Limb x={34} y={-120} ang={-step * 22} len={92} bend={0.15} w={40} fill="#3E7BEA" line={line} end={<ellipse cx={6} cy={6} rx={34} ry={20} fill="#FF6B5E" stroke={line} strokeWidth={6} />} />
      <g transform={`translate(0 -150) scale(${1 + breathe} ${1 - breathe})`}>
        {/* braço de trás */}
        <Limb x={-58} y={-78} ang={-18 - armL * 135} len={92} bend={0.3} w={30} fill={fur} line={line} end={hand} />
        {/* corpo: camiseta + macacão */}
        <path d="M-70 -95 Q -90 30 -62 52 L 62 52 Q 90 30 70 -95 Q 0 -128 -70 -95 Z" fill="#FFC83A" stroke={line} strokeWidth={7} strokeLinejoin="round" />
        <path d="M-66 -40 L 66 -40 Q 80 30 62 52 L -62 52 Q -80 30 -66 -40 Z" fill="#3E7BEA" stroke={line} strokeWidth={7} strokeLinejoin="round" />
        <path d="M-50 -40 L -44 -92 M50 -40 L 44 -92" stroke="#3E7BEA" strokeWidth={14} strokeLinecap="round" />
        <circle cx={-46} cy={-46} r={7} fill="#FFC83A" stroke={line} strokeWidth={3} /><circle cx={46} cy={-46} r={7} fill="#FFC83A" stroke={line} strokeWidth={3} />
        {/* bolso com folhinha (assinatura) */}
        <rect x={-26} y={-16} width={52} height={40} rx={10} fill="#5B94F2" stroke={line} strokeWidth={5} />
        <path d="M0 14 C -2 0 4 -6 14 -10 C 14 4 8 12 0 14 Z" fill={C.mint} stroke={line} strokeWidth={3} />
        {/* rabinho */}
        <circle cx={-70} cy={20} r={18} fill={fur} stroke={line} strokeWidth={6} />
        {/* cabeça */}
        <g transform={`translate(0 -110) rotate(${headTilt})`}>
          {/* orelhas */}
          <g transform={`rotate(${-12 - earW})`}><path d="M-60 -120 C -96 -250 -40 -300 -26 -220 C -20 -180 -28 -150 -30 -118 Z" fill={fur} stroke={line} strokeWidth={7} strokeLinejoin="round" />
            <path d="M-50 -132 C -74 -228 -44 -258 -36 -206 C -32 -178 -36 -156 -38 -132 Z" fill="#FFB3C4" /></g>
          <g transform={`rotate(${14 + earW * 0.8})`}><path d="M60 -120 C 96 -250 40 -300 26 -220 C 20 -180 28 -150 30 -118 Z" fill={fur} stroke={line} strokeWidth={7} strokeLinejoin="round" />
            <path d="M50 -132 C 74 -228 44 -258 36 -206 C 32 -178 36 -156 38 -132 Z" fill="#FFB3C4" /></g>
          <path d="M0 -150 C 92 -150 128 -80 120 -20 C 112 44 62 70 0 70 C -62 70 -112 44 -120 -20 C -128 -80 -92 -150 0 -150 Z" fill={fur} stroke={line} strokeWidth={8} />
          <ellipse cx={-34} cy={-104} rx={44} ry={20} fill="#fff" opacity={0.55} transform="rotate(-18 -34 -104)" />
          {/* topete */}
          <path d="M-14 -150 C -10 -176 10 -180 18 -164 C 8 -168 2 -160 -2 -150 Z" fill={fur} stroke={line} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={-80} cy={10} rx={26} ry={15} fill="#FF8FB1" opacity={0.6} />
          <ellipse cx={80} cy={10} rx={26} ry={15} fill="#FF8FB1" opacity={0.6} />
          <Eyes {...p} dx={44} y={-34} r={30} line={line} />
          <path d="M-9 4 Q 0 -2 9 4 Q 4 14 0 14 Q -4 14 -9 4 Z" fill="#FF7A9A" stroke={line} strokeWidth={4} />
          <Mouth y={24} w={58} f={p} line={line} />
        </g>
        {/* braço da frente */}
        <Limb x={58} y={-78} ang={18 + armR * 135} len={92} bend={-0.3} w={30} fill={fur} line={line} end={<g>{holdR}{hand}</g>} />
      </g>
    </g>
  );
};

/* ---------- COACH KIWI: pássaro adulto, alto ---------- */
export type KiT = Face & { x: number; y: number; s?: number; t: number; wing?: number; point?: number; headTilt?: number; flip?: boolean };
export const CoachKiwi: React.FC<KiT> = (p) => {
  const { x, y, s = 1, t, wing = 0, point = 0, headTilt = 0, flip } = p;
  const line = '#4A2E1C', body = '#B9834E', belly = '#E5B98A';
  const breathe = Math.sin(t * 2.1) * 0.012;
  const m = cl(p.mouth || 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cy={6} rx={140} ry={20} fill="#3A2340" opacity={0.16} />
      {/* pernas finas com 3 dedos */}
      {[-40, 40].map((lx, i) => (
        <g key={i}>
          <path d={`M${lx} -150 L ${lx + (i ? 6 : -6)} -6`} stroke={line} strokeWidth={22} strokeLinecap="round" />
          <path d={`M${lx} -150 L ${lx + (i ? 6 : -6)} -6`} stroke="#F5B731" strokeWidth={12} strokeLinecap="round" />
          <path d={`M${lx + (i ? 6 : -6)} -4 l -34 4 M${lx + (i ? 6 : -6)} -4 l 34 4 M${lx + (i ? 6 : -6)} -4 l 0 8`} stroke="#F5B731" strokeWidth={10} strokeLinecap="round" />
        </g>
      ))}
      <g transform={`translate(0 -150) scale(${1 + breathe} ${1 - breathe})`}>
        {/* corpo em pera */}
        <path d="M0 -330 C 90 -330 130 -250 140 -160 C 152 -50 110 20 0 20 C -110 20 -152 -50 -140 -160 C -130 -250 -90 -330 0 -330 Z" fill={body} stroke={line} strokeWidth={8} />
        <path d="M0 -180 C 70 -180 96 -110 90 -60 C 84 -10 50 4 0 4 C -50 4 -84 -10 -90 -60 C -96 -110 -70 -180 0 -180 Z" fill={belly} />
        {/* textura de penas */}
        {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${-100 + (i % 3) * 24} ${-250 + Math.floor(i / 3) * 60} q 12 10 24 0`} stroke={line} strokeWidth={4} fill="none" opacity={0.35} />)}
        {/* asa esquerda (de trás) */}
        <g transform={`translate(-120 -170) rotate(${20 + wing * 30})`}><path d="M0 0 C -40 30 -50 110 -10 140 C 10 100 20 50 0 0 Z" fill={body} stroke={line} strokeWidth={7} strokeLinejoin="round" /></g>
        {/* apito no cordão */}
        <path d="M-60 -215 Q 0 -120 60 -215" stroke="#fff" strokeWidth={5} fill="none" />
        <g transform="translate(10 -140) rotate(-12)"><rect x={-26} y={-14} width={52} height={28} rx={12} fill={C.grape} stroke={line} strokeWidth={5} /><circle cx={-12} cy={0} r={6} fill="#2a1a40" /></g>
        {/* cabeça (parte de cima do corpo) */}
        <g transform={`translate(0 -250) rotate(${headTilt})`}>
          <ellipse cx={-36} cy={-30} rx={34} ry={14} fill="#fff" opacity={0.3} transform="rotate(-20 -36 -30)" />
          <Eyes {...p} dx={38} y={-4} r={20} line={line} />
          {/* bico longo curvo, abre com a fala */}
          <g transform="translate(18 26)">
            <path d={`M-10 -8 C 60 -12 140 10 196 54 C 140 30 70 18 -6 14 Z`} fill="#F5B731" stroke={line} strokeWidth={6} strokeLinejoin="round" />
            <g transform={`rotate(${m * 14})`}><path d="M-6 12 C 70 22 136 40 186 62 C 130 52 64 44 -4 30 Z" fill="#E09A14" stroke={line} strokeWidth={6} strokeLinejoin="round" /></g>
          </g>
          {/* boné */}
          <g transform="translate(0 -62) rotate(-5)">
            <path d="M-92 18 C -92 -60 -40 -84 4 -84 C 60 -84 96 -54 96 14 Z" fill={C.mint} stroke={line} strokeWidth={7} strokeLinejoin="round" />
            <path d="M60 6 C 120 0 168 12 178 28 C 130 34 90 30 54 24 Z" fill="#2FBF92" stroke={line} strokeWidth={6} strokeLinejoin="round" />
            <path d="M-10 -82 L -6 14" stroke="#2FBF92" strokeWidth={5} />
            <circle cx={2} cy={-86} r={10} fill="#fff" stroke={line} strokeWidth={4} />
          </g>
        </g>
        {/* asa direita (da frente), aponta/acena */}
        <g transform={`translate(118 -150) rotate(${-10 - wing * 40 - point * 60})`}>
          <path d="M0 0 C 40 30 52 110 12 146 C -8 104 -18 50 0 0 Z" fill={body} stroke={line} strokeWidth={7} strokeLinejoin="round" />
          <path d="M8 120 l 10 26 M -2 118 l 2 28 M 18 112 l 16 22" stroke={line} strokeWidth={5} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

function mixHex(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * cl(t)).toString(16).padStart(2, '0')).join('');
}

/* ---------- cenário ilustrado ---------- */
export const RoomBG: React.FC<{ w?: number; h?: number; wall?: string; wall2?: string; floorY?: number; px?: number }> = ({ w = 1080, h = 1920, wall = '#BEE4FF', wall2 = '#E8F6FF', floorY = 1250, px = 0 }) => (
  <g>
    <defs>
      <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={wall2} /><stop offset="1" stopColor={wall} /></linearGradient>
      <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3C48E" /><stop offset="1" stopColor="#E7A96B" /></linearGradient>
      <radialGradient id="sunG" cx="0.75" cy="0.2" r="0.7"><stop offset="0" stopColor="#FFF6D6" stopOpacity="0.9" /><stop offset="1" stopColor="#FFF6D6" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={w} height={h} fill="url(#wallG)" />
    {/* papel de parede: estrelinhas */}
    {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={((i * 157) % (w + 100)) + px * 0.2} cy={(i * 97) % floorY} r={5} fill="#fff" opacity={0.55} />)}
    {/* janela */}
    <g transform={`translate(${w * 0.74 + px * 0.3} ${floorY - 760})`}>
      <rect x={-150} y={-150} width={300} height={300} rx={28} fill="#FFFFFF" stroke="#7FA9C9" strokeWidth={8} />
      <rect x={-130} y={-130} width={260} height={260} rx={18} fill="#CFF0FF" />
      <circle cx={-50} cy={-50} r={34} fill="#FFD95A" />
      <ellipse cx={50} cy={40} rx={70} ry={26} fill="#fff" />
      <path d="M0 -130 v260 M-130 0 h260" stroke="#fff" strokeWidth={14} />
    </g>
    <rect width={w} height={h} fill="url(#sunG)" />
    {/* prateleira com brinquedos */}
    <g transform={`translate(${w * 0.18 + px * 0.3} ${floorY - 620})`}>
      <rect x={-130} y={0} width={260} height={18} rx={9} fill="#D99A5B" />
      <rect x={-100} y={-70} width={50} height={70} rx={8} fill={C.tomato} /><rect x={-40} y={-90} width={40} height={90} rx={8} fill={C.grape} />
      <circle cx={50} cy={-34} r={34} fill={C.sun} /><path d="M100 0 l 20 -60 l 20 60 z" fill={C.mint} />
    </g>
    {/* chão */}
    <rect y={floorY} width={w} height={h - floorY} fill="url(#floorG)" />
    <rect y={floorY - 26} width={w} height={26} fill="#fff" />
    <ellipse cx={w * 0.45 + px * 0.5} cy={floorY + 150} rx={420} ry={80} fill="#FFE08A" opacity={0.9} />
  </g>
);

/* ---------- prancha de teste ---------- */
export const ToonTest: React.FC = () => (
  <AbsoluteFill style={{ background: '#fff' }}><Fonts />
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <RoomBG />
      <CoachKiwi x={790} y={1330} s={1.15} t={0.4} wing={0.2} point={0.3} viseme="smile" mouth={0.5} flip />
      <BoBunny x={320} y={1360} s={1.15} t={0.2} armR={0.75} armL={0.05} viseme="grin" look={[0.6, -0.2]} />
      <text x={510} y={320} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={96} fill="#FFC83A" stroke="#2B2747" strokeWidth={16} paintOrder="stroke">Bo &amp; Coach Kiwi</text>
    </svg>
  </AbsoluteFill>
);
