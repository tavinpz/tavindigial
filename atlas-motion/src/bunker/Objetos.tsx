import React from 'react';
import { Easing, interpolate } from 'remotion';
import { Lata } from './Teste';

// Objetos do bunker usados no vídeo 1 (tudo desenhado em SVG, nada de terceiros).
export const W = 1920, H = 1080, CHAO = 800;
export const AB = 'Arial Black, Arial, sans-serif';
export const GIZ = 'Comic Sans MS, Chalkboard SE, Arial, sans-serif';
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const ip = (f: number, a: number, b: number, c: number, d: number, e?: (n: number) => number) =>
  interpolate(f, [a, b], [c, d], { ...cl, easing: e });
export const pop = (f: number, a: number, dur = 10) => ip(f, a, a + dur, 0, 1, Easing.out(Easing.back(1.8)));
export const CORES = ['#d8453b', '#3f9b5a', '#e2b33c', '#3b78c2', '#c7652c'];

export const Etq: React.FC<{ x: number; y: number; s?: number; t: string; cor?: string; borda?: string; fs?: number; w?: number; rot?: number; fundo?: string }> = ({
  x, y, s = 1, t, cor = '#22303a', borda = '#3a2a1e', fs = 78, w, rot = -3, fundo = '#f3ead8',
}) => {
  if (s <= 0.01) return null;
  const ww = w ?? Math.max(170, t.length * fs * 0.66 + 70);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-ww / 2 + 5} y={-fs * 0.72 + 7} width={ww} height={fs * 1.44} rx={12} fill="#000" opacity={0.35} />
      <rect x={-ww / 2} y={-fs * 0.72} width={ww} height={fs * 1.44} rx={12} fill={fundo} stroke={borda} strokeWidth={6} />
      <text x={0} y={fs * 0.35} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={fs} fill={cor}>{t}</text>
    </g>
  );
};

export const Nao: React.FC<{ x: number; y: number; s: number; children?: React.ReactNode }> = ({ x, y, s, children }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={84} fill="#000" opacity={0.35} transform="translate(4 7)" />
    <circle r={80} fill="#f3ead8" stroke="#d63b2f" strokeWidth={13} />
    {children}
    <line x1={-56} y1={56} x2={56} y2={-56} stroke="#d63b2f" strokeWidth={13} strokeLinecap="round" />
  </g>
);
export const ISol = () => <g><circle r={22} fill="#f2b632" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x={-4} y={-46} width={8} height={16} rx={4} fill="#f2b632" transform={`rotate(${a})`} />)}</g>;
export const IDucha = () => <g><path d="M-30 -30 Q-30 -46 -10 -46 L8 -46" stroke="#2f3a45" strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M-8 -28 Q10 -52 28 -28 Z" fill="#2f3a45" />{[-2, 10, 22].map((x, i) => <rect key={x} x={x - 3} y={-14 + i * 4} width={6} height={18} rx={3} fill="#4aa3e0" />)}{[4, 16].map((x) => <rect key={x} x={x - 3} y={16} width={6} height={18} rx={3} fill="#4aa3e0" />)}</g>;
export const ITomada = () => <g><circle r={40} fill="#e9eef0" stroke="#2f3a45" strokeWidth={7} /><circle cx={-14} cy={0} r={6} fill="#2f3a45" /><circle cx={14} cy={0} r={6} fill="#2f3a45" /><rect x={-4} y={-40} width={8} height={10} fill="#2f3a45" /><rect x={-4} y={30} width={8} height={10} fill="#2f3a45" /></g>;

export const Prateleira: React.FC<{ f: number; t0?: number; sorted?: boolean; falta?: number }> = ({ f, t0 = -999, sorted = false, falta = -1 }) => (
  <g>
    {[310, 480, 650].map((y) => (
      <g key={y}><rect x={120} y={y} width={760} height={22} rx={4} fill="url(#madeira)" /><rect x={120} y={y + 22} width={760} height={12} fill="#000" opacity={0.3} /></g>
    ))}
    {[140, 500, 860].map((x) => <rect key={x} x={x - 9} y={180} width={18} height={620} fill="url(#acoEscuro)" />)}
    {[310, 480, 650].map((y, r) => Array.from({ length: 13 }).map((_, i) => (r * 13 + i === falta ? null : (
      <Lata key={`${r}${i}`} x={166 + i * 56} y={y} cor={sorted ? CORES[Math.floor((r * 13 + i) / 8) % 5] : CORES[(i + r * 2) % 5]} s={pop(f, t0 + 10 + r * 4 + i * 1.3, 8)} />
    ))))}
  </g>
);

export const Barris: React.FC = () => (
  <g>
    {[1290, 1480].map((x) => (
      <g key={x} transform={`translate(${x} ${CHAO + 40})`}>
        <ellipse cx={0} cy={6} rx={100} ry={18} fill="#000" opacity={0.4} filter="url(#suave2)" />
        <rect x={-84} y={-300} width={168} height={300} rx={22} fill="url(#barril)" />
        {[-230, -150, -70].map((y) => <rect key={y} x={-88} y={y} width={176} height={14} rx={7} fill="#0f3257" opacity={0.75} />)}
        <rect x={-66} y={-290} width={22} height={280} rx={11} fill="#fff" opacity={0.2} />
        <ellipse cx={0} cy={-300} rx={84} ry={15} fill="#5aa6e6" stroke="#123f6e" strokeWidth={4} />
      </g>
    ))}
  </g>
);

export const Caixote: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={110} ry={16} fill="#000" opacity={0.4} filter="url(#suave2)" />
    <rect x={-92} y={-130} width={184} height={130} rx={8} fill="url(#madeira)" stroke="#4b2f1f" strokeWidth={5} />
    <line x1={-92} y1={-130} x2={92} y2={0} stroke="#4b2f1f" strokeWidth={8} /><line x1={92} y1={-130} x2={-92} y2={0} stroke="#4b2f1f" strokeWidth={8} />
  </g>
);

// Lâmpada de manivela (Kurbellampe)
export const Kurbel: React.FC<{ x: number; y: number; s?: number; glow?: number; f: number; gira?: boolean }> = ({ x, y, s = 1, glow = 1, f, gira = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-76} r={150} fill="#ffd77a" opacity={0.42 * glow} filter="url(#brilho)" />
    <rect x={-34} y={-30} width={68} height={30} rx={6} fill="#33403f" />
    <rect x={-26} y={-112} width={52} height={84} rx={14} fill="#fff1bf" stroke="#e7b540" strokeWidth={6} opacity={0.55 + 0.45 * glow} />
    <path d="M-30 -112 Q0 -150 30 -112" stroke="#33403f" strokeWidth={9} fill="none" />
    <g transform={`translate(40 -16) rotate(${gira ? f * 14 : 20})`}><line x1={0} y1={0} x2={26} y2={0} stroke="#1f2928" strokeWidth={7} /><circle cx={26} cy={0} r={7} fill="#d8453b" /></g>
  </g>
);

export const Lousa: React.FC<{ x?: number; y?: number; children?: React.ReactNode }> = ({ x = 1010, y = 150, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={8} y={12} width={790} height={560} rx={14} fill="#000" opacity={0.4} filter="url(#suave2)" />
    <rect width={790} height={560} rx={14} fill="url(#madeira)" />
    <rect x={24} y={24} width={742} height={512} rx={6} fill="#27473c" />
    <rect x={24} y={24} width={742} height={512} rx={6} filter="url(#manchas)" opacity={0.35} />
    <g fontFamily={GIZ} fontWeight={700} fill="#f2f0e4">{children}</g>
    <rect x={60} y={536} width={670} height={20} rx={5} fill="#5d3c1f" />
    <rect x={600} y={524} width={60} height={14} rx={4} fill="#f2f0e4" />
  </g>
);

// Quadro claro (prancheta) para planos e listas
export const Quadro: React.FC<{ x: number; y: number; w?: number; h?: number; titulo?: string; s?: number; children?: React.ReactNode }> = ({ x, y, w = 760, h = 540, titulo, s = 1, children }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
    <rect x={8} y={12} width={w} height={h} rx={16} fill="#000" opacity={0.4} filter="url(#suave2)" />
    <rect width={w} height={h} rx={16} fill="#8a5a2c" />
    <rect x={18} y={18} width={w - 36} height={h - 36} rx={8} fill="#f3ead8" />
    <rect x={w / 2 - 70} y={-16} width={140} height={44} rx={10} fill="url(#aco)" stroke="#39444a" strokeWidth={4} />
    {titulo && <text x={w / 2} y={96} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={54} fill="#22303a" letterSpacing={3}>{titulo}</text>}
    {titulo && <rect x={60} y={116} width={w - 120} height={6} rx={3} fill="#22303a" opacity={0.5} />}
    {children}
  </g>
);
export const Certo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle r={34} fill="#3f9b5a" /><path d="M-16 0 L-5 13 L17 -14" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
);

// Medidor digital de CO2
export const Visor: React.FC<{ x: number; y: number; s?: number; rotulo?: string; valor: string; cor?: string }> = ({ x, y, s = 1, rotulo = 'CO₂', valor, cor = '#ff4a36' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-146} y={-94} width={300} height={200} rx={18} fill="#000" opacity={0.4} filter="url(#suave2)" />
    <rect x={-150} y={-100} width={300} height={200} rx={18} fill="url(#acoEscuro)" stroke="#11191a" strokeWidth={6} />
    <rect x={-128} y={-50} width={256} height={120} rx={8} fill="#0b1114" />
    <text x={-124} y={-62} fontFamily={AB} fontWeight={900} fontSize={30} fill="#d5dedf" letterSpacing={2}>{rotulo}</text>
    <circle cx={118} cy={-74} r={10} fill={cor} style={{ filter: `drop-shadow(0 0 8px ${cor})` }} />
    <text x={0} y={36} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={84} fill={cor} style={{ filter: `drop-shadow(0 0 10px ${cor})` }}>{valor}</text>
  </g>
);

export const Cama: React.FC<{ x: number; y: number; s?: number; olhos?: number; children?: React.ReactNode }> = ({ x, y, s = 1, olhos = 0, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={310} ry={20} fill="#000" opacity={0.45} filter="url(#suave2)" />
    <rect x={-262} y={-74} width={524} height={74} fill="#0a0f0f" />
    <g opacity={olhos}>
      <ellipse cx={40} cy={-34} rx={9} ry={7} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 8px #c8ff5a)' }} />
      <ellipse cx={72} cy={-34} rx={9} ry={7} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 8px #c8ff5a)' }} />
    </g>
    <rect x={-276} y={-74} width={22} height={74} fill="#5e3d20" /><rect x={254} y={-74} width={22} height={74} fill="#5e3d20" />
    <rect x={-300} y={-216} width={26} height={216} rx={6} fill="url(#madeira)" />
    <rect x={-282} y={-104} width={564} height={32} rx={6} fill="url(#madeira)" />
    <rect x={-272} y={-146} width={548} height={46} rx={16} fill="#d9d4c4" />
    <ellipse cx={-200} cy={-158} rx={66} ry={26} fill="#f4efe2" stroke="#c9c2ae" strokeWidth={3} />
    {children}
    <path d="M-120 -150 Q-110 -196 -40 -190 L250 -176 Q280 -170 278 -140 L278 -112 L-120 -112 Z" fill="#62784a" />
    <path d="M-120 -150 Q-110 -196 -40 -190 L-30 -112 L-120 -112 Z" fill="#8ea06f" />
    {[20, 110, 200].map((dx) => <line key={dx} x1={dx} y1={-184} x2={dx + 6} y2={-114} stroke="#4c5f38" strokeWidth={4} />)}
  </g>
);

export const Mesa: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={240} ry={16} fill="#000" opacity={0.4} filter="url(#suave2)" />
    <rect x={-200} y={-150} width={20} height={150} fill="#5e3d20" /><rect x={180} y={-150} width={20} height={150} fill="#5e3d20" />
    <rect x={-230} y={-176} width={460} height={28} rx={6} fill="url(#madeira)" />
    {children}
  </g>
);

// Bateria (a "Gisela")
export const Bateria: React.FC<{ x: number; y: number; s?: number; nivel?: number; gisela?: number; f?: number }> = ({ x, y, s = 1, nivel = 0.6, gisela = 0, f = 0 }) => {
  const cor = nivel < 0.2 ? '#e0402f' : nivel < 0.5 ? '#e2b33c' : '#4fbf6a';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={140} ry={16} fill="#000" opacity={0.4} filter="url(#suave2)" />
      <rect x={-70} y={-196} width={34} height={22} rx={4} fill="#c9432f" /><rect x={36} y={-196} width={34} height={22} rx={4} fill="#22303a" />
      <rect x={-120} y={-178} width={240} height={178} rx={14} fill="#2b3840" stroke="#11191a" strokeWidth={6} />
      <rect x={-120} y={-178} width={240} height={34} rx={14} fill="#3f505a" />
      <rect x={-92} y={-64} width={184} height={36} rx={8} fill="#0b1114" />
      <rect x={-86} y={-58} width={172 * Math.max(0.03, Math.min(1, nivel))} height={24} rx={5} fill={cor} style={{ filter: `drop-shadow(0 0 6px ${cor})` }} />
      <path d="M8 -132 L-14 -100 L2 -100 L-8 -76 L18 -110 L2 -110 Z" fill="#f4c64d" opacity={gisela > 0.5 ? 0 : 1} />
      {gisela > 0.01 && (
        <g>
          <g opacity={gisela}>
            {[-34, 34].map((ex) => <g key={ex}><ellipse cx={ex} cy={-106} rx={15} ry={f % 110 < 4 ? 2 : 17} fill="#fff" /><circle cx={ex + 3} cy={-104} r={f % 110 < 4 ? 0 : 7} fill="#170d07" /></g>)}
            <path d="M-16 -80 Q0 -70 16 -80" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
          <g transform={`translate(0 -230) rotate(-5) scale(${gisela})`}>
            <rect x={-116} y={-34} width={232} height={68} rx={10} fill="#f3ead8" stroke="#3a2a1e" strokeWidth={5} />
            <text x={0} y={19} textAnchor="middle" fontFamily={GIZ} fontWeight={700} fontSize={50} fill="#22303a">Gisela</text>
          </g>
        </g>
      )}
    </g>
  );
};

// Bicicleta ergométrica que carrega a bateria. Com `pernas`, desenha as pernas pedalando (o tronco é o Ben sem pernas).
export const Bici: React.FC<{ x: number; y: number; s?: number; ang?: number; pernas?: boolean }> = ({ x, y, s = 1, ang = 0, pernas = false }) => {
  const Cx = 40, Cy = -92, R = 36;
  const hip = { x: -20, y: -268 }, l = 114;
  const perna = (a: number, cor: string, bota: string) => {
    const px = Cx + Math.cos(a) * R, py = Cy + Math.sin(a) * R - 10;
    const dx = px - hip.x, dy = py - hip.y, d = Math.min(2 * l - 1, Math.hypot(dx, dy));
    const base = Math.atan2(dy, dx), al = Math.acos(d / (2 * l));
    const kx = hip.x + Math.cos(base - al) * l, ky = hip.y + Math.sin(base - al) * l;
    return (
      <g>
        <path d={`M${hip.x} ${hip.y} L${kx} ${ky} L${px} ${py}`} stroke={cor} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x={px - 26} y={py - 12} width={66} height={30} rx={12} fill={bota} />
      </g>
    );
  };
  const ped = (a: number) => {
    const px = Cx + Math.cos(a) * R, py = Cy + Math.sin(a) * R;
    return <g><line x1={Cx} y1={Cy} x2={px} y2={py} stroke="#1f2928" strokeWidth={9} strokeLinecap="round" /><rect x={px - 22} y={py - 5} width={44} height={10} rx={4} fill="#11191a" /></g>;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={40} cy={6} rx={230} ry={16} fill="#000" opacity={0.4} filter="url(#suave2)" />
      {pernas && perna(ang + Math.PI, '#24344a', '#4b2f1f')}
      {ped(ang + Math.PI)}
      <rect x={-150} y={-14} width={400} height={14} rx={6} fill="#22303a" />
      <g transform={`translate(160 -86) rotate(${(ang * 180) / Math.PI * 1.6})`}>
        <circle r={76} fill="#1b2326" stroke="#8a979a" strokeWidth={10} />
        {[0, 60, 120].map((a) => <rect key={a} x={-70} y={-3} width={140} height={6} fill="#5d696b" transform={`rotate(${a})`} />)}
        <circle r={14} fill="#c9432f" />
      </g>
      <g stroke="#c9432f" strokeWidth={16} strokeLinecap="round" fill="none">
        <line x1={-20} y1={-250} x2={Cx} y2={Cy} /><line x1={Cx} y1={Cy} x2={160} y2={-86} /><line x1={160} y1={-86} x2={116} y2={-282} /><line x1={-8} y1={-205} x2={126} y2={-232} />
        <line x1={-110} y1={-10} x2={Cx} y2={Cy} />
      </g>
      <rect x={-62} y={-270} width={84} height={20} rx={10} fill="#11191a" />
      <path d="M96 -290 L146 -278" stroke="#11191a" strokeWidth={14} strokeLinecap="round" />
      <circle cx={Cx} cy={Cy} r={16} fill="#8a979a" stroke="#1f2928" strokeWidth={5} />
      {ped(ang)}
      {pernas && perna(ang, '#2b3c53', '#5b3b27')}
    </g>
  );
};
export const Cabo: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
  <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 46} ${x2} ${y2}`} stroke="#11191a" strokeWidth={8} fill="none" strokeLinecap="round" />
);

// Planta do bunker vista de cima
export const Planta: React.FC<{ x: number; y: number; s?: number; d6?: number; d4?: number; d25?: number; hl?: number }> = ({ x, y, s = 1, d6 = 0, d4 = 0, d25 = 0, hl = -1 }) => {
  const item = (i: number, rx: number, ry: number, rw: number, rh: number, nome: string) => (
    <g opacity={hl === -1 || hl >= i ? 1 : 0.25}>
      <rect x={rx} y={ry} width={rw} height={rh} rx={6} fill={hl === i ? '#f4c64d' : '#dfeaf5'} opacity={hl === i ? 0.95 : 0.2} stroke="#fff" strokeWidth={4} />
      <text x={rx + rw / 2} y={ry + rh / 2 + 13} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={36} fill={hl === i ? '#16324d' : '#fff'}>{nome}</text>
    </g>
  );
  return s <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-450 -310)`}>
      <rect x={8} y={12} width={900} height={620} rx={10} fill="#000" opacity={0.4} filter="url(#suave2)" />
      <rect width={900} height={620} rx={10} fill="#1d4f7c" />
      {Array.from({ length: 22 }).map((_, i) => <line key={`v${i}`} x1={i * 42} y1={0} x2={i * 42} y2={620} stroke="#fff" strokeWidth={1} opacity={0.12} />)}
      {Array.from({ length: 15 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 42} x2={900} y2={i * 42} stroke="#fff" strokeWidth={1} opacity={0.12} />)}
      <text x={40} y={56} fontFamily={AB} fontWeight={900} fontSize={30} fill="#fff" opacity={0.8} letterSpacing={4}>BUNKER · GRUNDRISS</text>
      <rect x={110} y={90} width={660} height={420} fill="none" stroke="#fff" strokeWidth={12} />
      <rect x={758} y={250} width={24} height={100} fill="#1d4f7c" /><circle cx={770} cy={300} r={44} fill="none" stroke="#fff" strokeWidth={6} /><text x={770} y={242} textAnchor="middle" fontFamily={AB} fontSize={24} fill="#fff">TÜR</text>
      {item(0, 134, 114, 250, 120, 'Bett')}
      {item(1, 360, 290, 170, 120, 'Tisch')}
      {item(2, 134, 428, 380, 60, 'Regal')}
      {item(3, 620, 114, 126, 110, 'WC')}
      <path d="M604 114 q12 20 0 40 q-12 20 0 40 q12 20 0 40" stroke="#fff" strokeWidth={5} fill="none" opacity={hl === -1 || hl >= 3 ? 1 : 0.25} />
      <g opacity={d6}><line x1={110} y1={552} x2={770} y2={552} stroke="#f4c64d" strokeWidth={6} /><path d="M110 538 v28 M770 538 v28" stroke="#f4c64d" strokeWidth={6} /><rect x={370} y={524} width={140} height={58} rx={8} fill="#f4c64d" /><text x={440} y={568} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={44} fill="#16324d">6 m</text></g>
      <g opacity={d4}><line x1={826} y1={90} x2={826} y2={510} stroke="#f4c64d" strokeWidth={6} /><path d="M812 90 h28 M812 510 h28" stroke="#f4c64d" strokeWidth={6} /><rect x={760} y={390} width={132} height={58} rx={8} fill="#f4c64d" /><text x={826} y={434} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={44} fill="#16324d">4 m</text></g>
      <g opacity={d25}><rect x={20} y={250} width={84} height={150} rx={8} fill="#f4c64d" /><path d="M62 262 v126 M48 276 l14 -14 l14 14 M48 374 l14 14 l14 -14" stroke="#16324d" strokeWidth={5} fill="none" /><rect x={8} y={404} width={170} height={58} rx={8} fill="#f4c64d" /><text x={93} y={448} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={40} fill="#16324d">2,5 m</text></g>
    </g>
  );
};

// Corte do terreno: 3 m de terra, porta de aço e o tubo de ar
export const Corte: React.FC<{ x: number; y: number; s?: number; terra?: number; marder?: number; f?: number }> = ({ x, y, s = 1, terra = 1, marder = 0, f = 0 }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-450 -310)`}>
    <rect x={8} y={12} width={900} height={620} rx={10} fill="#000" opacity={0.4} filter="url(#suave2)" />
    <clipPath id="corteClip"><rect width={900} height={620} rx={10} /></clipPath>
    <g clipPath="url(#corteClip)">
      <rect width={900} height={130} fill="#9fd0ef" />
      <circle cx={770} cy={62} r={34} fill="#ffe08a" />
      <rect y={130} width={900} height={490} fill="#6b4a2f" />
      <rect y={130} width={900} height={22} fill="#5d9a4a" />
      {Array.from({ length: 46 }).map((_, i) => <circle key={i} cx={(i * 97) % 900} cy={170 + ((i * 53) % 180)} r={4 + (i % 4) * 2} fill="#4a321f" opacity={0.6} />)}
      <rect x={110} y={376} width={620} height={200} fill="#8a979a" />
      <rect x={130} y={396} width={580} height={164} fill="#33403f" />
      <rect x={130} y={396} width={580} height={164} fill="url(#luzTeto)" opacity={0.7} />
      <rect x={190} y={130} width={90} height={266} fill="#8a979a" /><rect x={204} y={150} width={62} height={246} fill="#1b2326" />
      {[190, 240, 290, 340].map((yy) => <line key={yy} x1={210} y1={yy} x2={260} y2={yy} stroke="#b9c4c6" strokeWidth={5} />)}
      <rect x={176} y={112} width={118} height={26} rx={6} fill="url(#aco)" stroke="#39444a" strokeWidth={4} />
      <rect x={596} y={100} width={34} height={296} fill="#a8683a" stroke="#5e3620" strokeWidth={3} />
      <path d="M582 100 h62 l-10 -20 h-42 Z" fill="#5e3620" />
      <rect x={380} y={470} width={36} height={56} rx={10} fill="#e27a2a" /><circle cx={398} cy={452} r={20} fill="#f0b98a" />
      {marder > 0.01 && (
        <g opacity={marder}>
          <circle cx={613} cy={250} r={46 + Math.sin(f / 5) * 8} fill="none" stroke="#ff4a36" strokeWidth={8} />
          <ellipse cx={613} cy={254} rx={15} ry={28} fill="#5c402c" /><circle cx={613} cy={224} r={13} fill="#5c402c" /><ellipse cx={613} cy={242} rx={8} ry={10} fill="#f1e9da" />
        </g>
      )}
    </g>
    <g opacity={terra}>
      <line x1={470} y1={152} x2={470} y2={376} stroke="#f4c64d" strokeWidth={7} /><path d="M452 152 h36 M452 376 h36" stroke="#f4c64d" strokeWidth={7} />
      <rect x={380} y={228} width={180} height={70} rx={10} fill="#f4c64d" /><text x={470} y={280} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={50} fill="#3a2a1e">3 m</text>
    </g>
  </g>
);

// Marta (Steinmarder) de lado: corpo comprido, peito branco, cauda peluda
export const Marder: React.FC<{ x: number; y: number; k?: number; flip?: boolean; anda?: number; come?: number; brilho?: number }> = ({ x, y, k = 1, flip = false, anda, come = 0, brilho = 0 }) => {
  const sw = anda === undefined ? 0 : Math.sin(anda) * 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <ellipse cx={0} cy={2} rx={130} ry={10} fill="#000" opacity={0.4} filter="url(#suave2)" />
      <path d="M-84 -56 Q-170 -108 -236 -52 Q-250 -30 -226 -22 Q-160 -4 -86 -34 Z" fill="#3f2b1e" />
      <path d="M-110 -58 Q-170 -88 -222 -50" stroke="#6e4f38" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
      {[-78, -52, 40, 66].map((lx, i) => <rect key={lx} x={lx} y={-26} width={17} height={28} rx={7} fill="#33221a" transform={`rotate(${i % 2 ? sw : -sw} ${lx + 8} -26)`} />)}
      <ellipse cx={-8} cy={-50} rx={100} ry={34} fill="#5c402c" />
      <ellipse cx={-20} cy={-66} rx={70} ry={12} fill="#7a583e" opacity={0.6} />
      <g transform={`rotate(${come * 22} 70 -56)`}>
        <ellipse cx={74} cy={-46} rx={30} ry={26} fill="#f1e9da" />
        <circle cx={90} cy={-104} r={14} fill="#5c402c" /><circle cx={90} cy={-104} r={7} fill="#d9b9a0" />
        <circle cx={116} cy={-106} r={14} fill="#5c402c" /><circle cx={116} cy={-106} r={7} fill="#d9b9a0" />
        <ellipse cx={110} cy={-76} rx={40} ry={30} fill="#5c402c" />
        <ellipse cx={142} cy={-68} rx={20} ry={14} fill="#73533b" />
        <circle cx={160} cy={-70} r={7} fill="#170d07" />
        <circle cx={120} cy={-84} r={8} fill={brilho > 0.5 ? '#d9ff7a' : '#170d07'} style={brilho > 0.5 ? { filter: 'drop-shadow(0 0 8px #c8ff5a)' } : undefined} /><circle cx={123} cy={-87} r={2.6} fill="#fff" />
        <path d="M150 -62 l26 -6 M150 -58 l26 4" stroke="#170d07" strokeWidth={2} opacity={0.6} />
      </g>
    </g>
  );
};
export const MarderCara: React.FC<{ s?: number; brilho?: number }> = ({ s = 1, brilho = 0 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-70 96 Q-74 30 -30 22 L30 22 Q74 30 70 96 Z" fill="#4f3625" />
    <path d="M-34 96 Q-40 44 0 36 Q40 44 34 96 Z" fill="#f4eee0" />
    <path d="M-58 -30 L-50 -66 L-24 -44 Z" fill="#4f3625" /><path d="M-50 -38 L-47 -56 L-33 -44 Z" fill="#d9b9a0" />
    <path d="M58 -30 L50 -66 L24 -44 Z" fill="#4f3625" /><path d="M50 -38 L47 -56 L33 -44 Z" fill="#d9b9a0" />
    <path d="M-54 -22 Q-56 -52 0 -54 Q56 -52 54 -22 Q46 26 0 44 Q-46 26 -54 -22 Z" fill="#5c402c" />
    <path d="M-22 4 Q0 -10 22 4 Q16 34 0 42 Q-16 34 -22 4 Z" fill="#8a6a50" />
    {[-25, 25].map((ex) => <g key={ex}><ellipse cx={ex} cy={-12} rx={10} ry={9} fill={brilho > 0.5 ? '#d9ff7a' : '#170d07'} style={brilho > 0.5 ? { filter: 'drop-shadow(0 0 10px #c8ff5a)' } : undefined} /><circle cx={ex + 3} cy={-15} r={3} fill="#fff" /></g>)}
    <path d="M-8 28 Q0 22 8 28 Q4 38 0 38 Q-4 38 -8 28 Z" fill="#170d07" />
    <path d="M-22 26 l-40 -8 M-22 32 l-40 6 M22 26 l40 -8 M22 32 l40 6" stroke="#f4eee0" strokeWidth={2} opacity={0.7} />
  </g>
);
export const Ninho: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <g opacity={o}>
    {[[-80, 60, 18], [-40, 70, -30], [10, 74, 10], [60, 66, 40], [90, 50, -20], [-96, 40, 60]].map(([lx, ly, r], i) => <ellipse key={i} cx={lx} cy={ly} rx={30} ry={11} fill={i % 2 ? '#7a5a2a' : '#8f6a2e'} transform={`rotate(${r} ${lx} ${ly})`} />)}
    {[[-60, 44], [0, 52], [56, 40], [-100, 70], [100, 74]].map(([wx, wy], i) => <circle key={i} cx={wx} cy={wy} r={20} fill="#efe6c8" opacity={0.95} />)}
    <g transform="translate(70 20) rotate(24)"><rect x={-40} y={-12} width={80} height={24} rx={3} fill="#f7f7f2" stroke="#9fb0b3" strokeWidth={2} />{[-28, -14, 0, 14, 28].map((v) => <line key={v} x1={v} y1={-12} x2={v} y2={12} stroke="#9fb0b3" strokeWidth={2} />)}</g>
  </g>
);

// Duto de ventilação com grade, parafusos, ventilador, ninho, olhos e fluxo de ar
export const Duto: React.FC<{ x: number; y: number; s?: number; f: number; paraf?: number; treme?: number; grade?: boolean; luzIn?: number; olhos?: number; cara?: number; ninho?: number; ar?: number; fita?: number; filtro?: number; cano?: boolean }> = ({
  x, y, s = 1, f, paraf = 4, treme = -1, grade = true, luzIn = 0, olhos = 0, cara = 0, ninho = 0, ar = 0, fita = -1, filtro = 0, cano = true,
}) => {
  const cantos = [[-112, -80], [112, -80], [112, 80], [-112, 80]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {cano && <g><rect x={-40} y={-600} width={80} height={510} fill="url(#acoEscuro)" /><rect x={-48} y={-330} width={96} height={20} rx={5} fill="#39403f" /><rect x={-30} y={-600} width={12} height={510} fill="#fff" opacity={0.12} /></g>}
      <rect x={-130} y={-96} width={260} height={192} rx={12} fill="#0a1011" stroke="#4a585b" strokeWidth={8} />
      <clipPath id="dutoClip"><rect x={-124} y={-90} width={248} height={180} rx={8} /></clipPath>
      <g clipPath="url(#dutoClip)">
        <rect x={-130} y={-96} width={260} height={192} fill="#57493a" opacity={luzIn * 0.85} />
        <ellipse cx={0} cy={0} rx={90} ry={70} fill="#05090a" opacity={luzIn * 0.7} />
        <g transform={`rotate(${f * 23})`} opacity={0.55 - cara * 0.5}>{[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={-36} rx={16} ry={38} fill="#4a585b" transform={`rotate(${a})`} />)}<circle r={12} fill="#6d7b7e" /></g>
        <Ninho o={ninho} />
        {cara > 0.01 && <g opacity={cara} transform="translate(0 -6)"><MarderCara s={0.92} brilho={luzIn > 0.5 ? 0 : 1} /></g>}
        <g opacity={olhos}>
          <ellipse cx={-28} cy={-12} rx={13} ry={9} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 10px #c8ff5a)' }} />
          <ellipse cx={28} cy={-12} rx={13} ry={9} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 10px #c8ff5a)' }} />
        </g>
        {filtro > 0.01 && <g opacity={filtro}><rect x={-118} y={-84} width={236} height={168} fill="#f4f4ee" />{Array.from({ length: 15 }).map((_, i) => <line key={i} x1={-110 + i * 16} y1={-84} x2={-110 + i * 16} y2={84} stroke="#a9b8ba" strokeWidth={3} />)}</g>}
      </g>
      {grade && (
        <g>
          {[-64, -32, 0, 32, 64].map((by) => <rect key={by} x={-112} y={by - 7} width={224} height={14} rx={6} fill="#2d3839" stroke="#55656a" strokeWidth={1.5} />)}
          <rect x={-128} y={-94} width={256} height={188} rx={10} fill="none" stroke="#6d7b7e" strokeWidth={10} />
          {cantos.map(([cx, cy], i) => i >= 4 - paraf ? (
            <g key={i} transform={`translate(${cx + (treme === i ? Math.sin(f * 2.3) * 3 : 0)} ${cy}) rotate(${treme === i ? Math.sin(f * 1.7) * 30 : 30})`}><circle r={11} fill="#c9d3d8" stroke="#39444a" strokeWidth={3} /><rect x={-8} y={-2} width={16} height={4} fill="#39444a" /></g>
          ) : <circle key={i} cx={cx} cy={cy} r={6} fill="#05090a" />)}
        </g>
      )}
      {fita >= 0 && (
        <path d={fita < 0.5 ? 'M0 96 Q4 140 0 190' : `M0 96 Q${-50 + Math.sin(f / 2) * 14} ${120 + Math.cos(f / 3) * 8} ${-110 + Math.sin(f / 2.4) * 18} ${128 + Math.sin(f / 1.9) * 16}`} stroke="#e0402f" strokeWidth={12} fill="none" strokeLinecap="round" />
      )}
      {ar > 0.01 && Array.from({ length: 7 }).map((_, i) => {
        const ph = ((f * 5 + i * 47) % 200) / 200;
        return <path key={i} d={`M${-130 - ph * 260} ${-70 + i * 23} q-40 ${i % 2 ? 14 : -14} -90 0`} stroke="#cfeaff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={ar * (1 - ph) * 0.8} />;
      })}
    </g>
  );
};
export const GradeSolta: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[-64, -32, 0, 32, 64].map((by) => <rect key={by} x={-112} y={by - 7} width={224} height={14} rx={6} fill="#2d3839" stroke="#55656a" strokeWidth={1.5} />)}
    <rect x={-128} y={-94} width={256} height={188} rx={10} fill="none" stroke="#6d7b7e" strokeWidth={10} />
  </g>
);

// Armadilha: caixa apoiada num graveto, com corda e isca
export const Armadilha: React.FC<{ x: number; y: number; caixa?: number; graveto?: number; corda?: number; isca?: number; caida?: number; cordaAte?: [number, number]; tensa?: boolean }> = ({ x, y, caixa = 1, graveto = 1, corda = 1, isca = 1, caida = 0, cordaAte = [-700, -150], tensa = false }) => {
  const ang = -34 * (1 - caida);
  const dx = caida * 190;
  return (
    <g transform={`translate(${x} ${y})`}>
      {corda > 0.01 && caida < 0.05 && <path d={tensa ? `M-96 -70 L${cordaAte[0]} ${cordaAte[1]}` : `M-96 -70 Q${cordaAte[0] / 2} ${40} ${cordaAte[0]} ${cordaAte[1]}`} stroke="#d9c79a" strokeWidth={5} fill="none" opacity={corda} />}
      {isca > 0.01 && (
        <g transform={`translate(20 -4) scale(${isca})`}>
          <ellipse cx={0} cy={0} rx={36} ry={11} fill="#c9d3d8" stroke="#6d7b7e" strokeWidth={3} /><rect x={30} y={-4} width={70} height={8} rx={4} fill="#c9d3d8" stroke="#6d7b7e" strokeWidth={2} />
          {[-14, 4, 18].map((rx, i) => <rect key={rx} x={rx - 9} y={-16 - (i % 2) * 5} width={20} height={16} rx={4} fill="#f0c35a" stroke="#c9432f" strokeWidth={3} />)}
        </g>
      )}
      {graveto > 0.01 && caida < 0.05 && <rect x={-104} y={-140} width={12} height={140} rx={5} fill="#8a5a2c" transform={`scale(${graveto})`} />}
      {caixa > 0.01 && (
        <g transform={`translate(${dx} 0) translate(130 0) rotate(${ang}) translate(-130 0) scale(${caixa})`}>
          <rect x={-130} y={-150} width={260} height={150} rx={6} fill="url(#madeira)" stroke="#4b2f1f" strokeWidth={6} opacity={0.96} />
          {[-80, -30, 20, 70].map((sx) => <line key={sx} x1={sx} y1={-150} x2={sx} y2={0} stroke="#4b2f1f" strokeWidth={4} opacity={0.6} />)}
          <rect x={-130} y={-150} width={260} height={18} fill="#4b2f1f" opacity={0.5} />
        </g>
      )}
    </g>
  );
};

export const Garrafa: React.FC<{ x: number; y: number; s?: number; cor?: string }> = ({ x, y, s = 1, cor = '#4aa3e0' }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={-108} width={20} height={20} rx={4} fill="#2f6fa8" />
    <path d="M-24 -84 Q-24 -92 -10 -92 L10 -92 Q24 -92 24 -84 L24 -6 Q24 0 18 0 L-18 0 Q-24 0 -24 -6 Z" fill={cor} opacity={0.9} stroke="#1f5f9e" strokeWidth={3} />
    <rect x={-16} y={-80} width={8} height={66} rx={4} fill="#fff" opacity={0.4} />
  </g>
);
export const Saco: React.FC<{ x: number; y: number; s?: number; t: string }> = ({ x, y, s = 1, t }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-66 0 Q-78 -70 -58 -138 Q0 -156 58 -138 Q78 -70 66 0 Z" fill="#d9c79a" stroke="#8a7446" strokeWidth={4} />
    <path d="M-40 -140 Q0 -170 40 -140" stroke="#8a7446" strokeWidth={8} fill="none" />
    <text x={0} y={-56} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={38} fill="#5a4320">{t}</text>
  </g>
);
export const Balde: React.FC<{ x: number; y: number; s?: number; t: string }> = ({ x, y, s = 1, t }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-78 -150 L78 -150 L64 0 L-64 0 Z" fill="#e9eef0" stroke="#8d989a" strokeWidth={4} />
    <rect x={-86} y={-168} width={172} height={24} rx={8} fill="#c9432f" />
    <rect x={-58} y={-112} width={116} height={64} rx={6} fill="#f4c64d" /><text x={0} y={-66} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={34} fill="#3a2a1e">{t}</text>
  </g>
);
export const Prato: React.FC<{ x: number; y: number; s?: number; t?: string; children?: React.ReactNode }> = ({ x, y, s = 1, t, children }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={96} ry={20} fill="#eef2f2" stroke="#8d989a" strokeWidth={4} /><ellipse cx={0} cy={-2} rx={62} ry={11} fill="#dfe6e6" />
    {children}
    {t && <g><rect x={-104} y={36} width={208} height={48} rx={8} fill="#22303a" /><text x={0} y={71} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={29} fill="#f3ead8">{t}</text></g>}
  </g>
);
export const Livros: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {['#3b78c2', '#d8453b', '#3f9b5a', '#e2b33c', '#7a4fa0'].map((c, i) => <g key={i}><rect x={-80 + (i % 2) * 10} y={-30 - i * 30} width={170} height={28} rx={4} fill={c} /><rect x={-80 + (i % 2) * 10} y={-30 - i * 30} width={18} height={28} fill="#000" opacity={0.25} /></g>)}
  </g>
);
export const Riscos: React.FC<{ x: number; y: number; n: number; s?: number; novo?: number }> = ({ x, y, n, s = 1, novo = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, i) => <line key={i} x1={i * 44} y1={i === n - 1 ? 100 - 100 * novo : 0} x2={i * 44 + 6} y2={100} stroke="#f2f0e4" strokeWidth={12} strokeLinecap="round" opacity={0.92} />)}
  </g>
);
export const Chave: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x={-14} y={-20} width={28} height={74} rx={12} fill="#e2b33c" stroke="#8a6a14" strokeWidth={3} /><rect x={-5} y={-110} width={10} height={92} fill="#c9d3d8" /><rect x={-8} y={-118} width={16} height={12} fill="#8a979a" /></g>
);
