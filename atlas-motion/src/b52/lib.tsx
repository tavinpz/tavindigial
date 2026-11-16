import React from 'react';
import { Easing, interpolate, random, spring } from 'remotion';

// Peças compartilhadas do canal Crosswind.
export const C = {
  fundo: '#081018', fundo2: '#0d1824', terreno: '#16211a', terreno2: '#1b2820', pista: '#2a2f36', linha: '#eef1f4',
  laranja: '#ff8a2a', vermelho: '#ff4d4d', verde: '#4ade80', azul: '#6cc0ff', texto: '#f3f5f7', cinza: '#8f99a5', grade: 'rgba(255,255,255,0.035)',
};
export const SANS = '"Inter", sans-serif';
export const MONO = '"JetBrains Mono", "Inter", monospace';
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const L = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const rad = (d: number) => (d * Math.PI) / 180;
export const pop = (f: number, ini: number, damping = 13) => Math.min(1, Math.max(0, spring({ frame: f - ini, fps: 30, config: { damping, stiffness: 200 } })));
// aparece em ini e some em fim
export const janela = (f: number, ini: number, fim = 1e9, fade = 10) => L(f, [ini, ini + fade], [0, 1]) * L(f, [fim - fade, fim], [1, 0]);

export type Fala = { t: number; d: number; txt: string };
export type CenaProps = { g: number; D: number; ts: number[] };

export const Defs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-asa`} x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stopColor="#f4f6f8" /><stop offset="0.35" stopColor="#d9dee4" /><stop offset="1" stopColor="#aeb6bf" />
    </linearGradient>
    <linearGradient id={`${id}-fus`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#b9c1ca" /><stop offset="0.38" stopColor="#ffffff" /><stop offset="0.6" stopColor="#e3e7ec" /><stop offset="1" stopColor="#99a2ad" />
    </linearGradient>
    <linearGradient id={`${id}-mot`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#c8cfd7" /><stop offset="0.5" stopColor="#eef1f4" /><stop offset="1" stopColor="#8e98a3" />
    </linearGradient>
  </defs>
);

// B-52 visto de cima, nariz para +x, comprimento 300 (envergadura 350)
export const B52Topo: React.FC<{ id: string; sombra?: boolean; trem?: number; mostraTrem?: number }> = ({ id, sombra, trem = 0, mostraTrem = 0 }) => {
  const le = (y: number) => 30 - 100 * (Math.abs(y) / 175);
  const pods = [60, 110].flatMap((y) => [y, -y]);
  const asa = sombra ? '#000' : `url(#${id}-asa)`;
  const fus = sombra ? '#000' : `url(#${id}-fus)`;
  const mot = sombra ? '#000' : `url(#${id}-mot)`;
  const tr = sombra ? 'none' : '#7d8792';
  return (
    <g>
      {!sombra && <Defs id={id} />}
      <path d="M30,-11 L-70,-175 L-95,-175 L-30,-11 Z M30,11 L-70,175 L-95,175 L-30,11 Z" fill={asa} stroke={tr} strokeWidth={1.2} strokeLinejoin="round" />
      {!sombra && [40, 80, 120, 160].flatMap((y) => [y, -y]).map((y) => <line key={y} x1={le(y) - 2} y1={y} x2={le(y) - 22} y2={y} stroke="#8d97a2" strokeWidth={0.8} opacity={0.6} />)}
      {pods.map((y) => (
        <g key={y} transform={`translate(${le(y) + 8},${y})`}>
          <rect x={-22} y={-9} width={44} height={8} rx={4} fill={mot} stroke={tr} strokeWidth={0.8} />
          <rect x={-22} y={1} width={44} height={8} rx={4} fill={mot} stroke={tr} strokeWidth={0.8} />
          {!sombra && <><circle cx={22} cy={-5} r={3} fill="#2b3440" /><circle cx={22} cy={5} r={3} fill="#2b3440" /></>}
        </g>
      ))}
      {[-148, 148].map((y) => <rect key={y} x={-72} y={y - 4} width={42} height={8} rx={4} fill={mot} stroke={tr} strokeWidth={0.8} />)}
      <path d="M-108,-9 L-140,-58 L-158,-58 L-135,-9 Z M-108,9 L-140,58 L-158,58 L-135,9 Z" fill={asa} stroke={tr} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M150,0 C150,-8 140,-12 120,-13 L-150,-9 L-160,-3 L-160,3 L-150,9 L120,13 C140,12 150,8 150,0 Z" fill={fus} stroke={tr} strokeWidth={1.2} />
      {!sombra && <>
        <path d="M-150,0 L-62,0" stroke="#8d97a2" strokeWidth={2.5} />
        <path d="M141,-4 L127,-7 L127,7 L141,4 Z" fill="#26313d" />
        <circle cx={-80} cy={-176} r={2.5} fill="#ff3b3b" /><circle cx={-80} cy={176} r={2.5} fill="#3bff7a" />
      </>}
      {mostraTrem > 0 && <g opacity={mostraTrem}>
        {[[55, 0], [-35, 0]].map(([x]) => [-5, 5].map((yy) => (
          <g key={`${x}${yy}`} transform={`translate(${x},${yy}) rotate(${trem})`}>
            <rect x={-9} y={-3.5} width={18} height={7} rx={2} fill="#141920" stroke={C.laranja} strokeWidth={1.4} />
          </g>
        )))}
        {[-140, 140].map((y) => <rect key={y} x={-60} y={y - 3} width={12} height={6} rx={2} fill="#141920" stroke={C.laranja} strokeWidth={1.4} />)}
      </g>}
    </g>
  );
};

// Avião comercial genérico (bimotor), nariz para +x, comprimento 300
export const JatoTopo: React.FC<{ id: string; sombra?: boolean; trem?: number }> = ({ id, sombra, trem = 0 }) => {
  const asa = sombra ? '#000' : `url(#${id}-asa)`;
  const fus = sombra ? '#000' : `url(#${id}-fus)`;
  const mot = sombra ? '#000' : `url(#${id}-mot)`;
  const tr = sombra ? 'none' : '#7d8792';
  return (
    <g>
      {!sombra && <Defs id={id} />}
      <path d="M40,-14 L-35,-140 L-58,-140 L-25,-14 Z M40,14 L-35,140 L-58,140 L-25,14 Z" fill={asa} stroke={tr} strokeWidth={1.2} strokeLinejoin="round" />
      {[-55, 55].map((y) => <rect key={y} x={8 - Math.abs(y) * 0.35} y={y - 8} width={40} height={16} rx={7} fill={mot} stroke={tr} strokeWidth={0.8} />)}
      <path d="M-105,-12 L-138,-62 L-152,-62 L-130,-12 Z M-105,12 L-138,62 L-152,62 L-130,12 Z" fill={asa} stroke={tr} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M150,0 C150,-11 138,-16 115,-17 L-140,-12 L-158,-3 L-158,3 L-140,12 L115,17 C138,16 150,11 150,0 Z" fill={fus} stroke={tr} strokeWidth={1.2} />
      {!sombra && <>
        <path d="M-158,0 L-100,0" stroke="#8d97a2" strokeWidth={2.5} />
        <path d="M143,-6 L130,-9 L130,9 L143,6 Z" fill="#26313d" />
      </>}
      {trem > 0 && <g opacity={trem}>
        <rect x={100} y={-3} width={14} height={6} rx={2} fill="#141920" stroke={C.laranja} strokeWidth={1.4} />
        {[-26, 26].map((y) => <rect key={y} x={-14} y={y - 4} width={18} height={8} rx={2} fill="#141920" stroke={C.laranja} strokeWidth={1.4} />)}
      </g>}
    </g>
  );
};

// B-52 de frente: centro (cx, solo). meia = meia envergadura em px. Escala 1 => meia 620
export const B52Frente: React.FC<{ cx: number; solo: number; incl?: number; esc?: number; destaque?: { motores?: number; pontas?: number } }> = ({ cx, solo, incl = 0, esc = 1, destaque = {} }) => {
  const meia = 620, tipY = solo - 118;
  const Y = (v: number) => solo - (830 - v); // geometria original desenhada com solo=830
  return (
    <g transform={`rotate(${incl} ${cx} ${solo}) translate(${cx} ${solo}) scale(${esc}) translate(${-cx} ${-solo})`}>
      <defs>
        <linearGradient id="asaF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#9aa4af" /></linearGradient>
        <radialGradient id="fusF" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#d3d9e0" /><stop offset="1" stopColor="#8b95a1" /></radialGradient>
        <radialGradient id="motF" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#f2f4f6" /><stop offset="1" stopColor="#8b95a1" /></radialGradient>
      </defs>
      <ellipse cx={cx} cy={solo + 6} rx={meia * 0.9} ry={10} fill="#000" opacity={0.35} />
      {[-1, 1].map((s) => <path key={s} d={`M${cx},${Y(618)} Q${cx + s * 300},${Y(628)} ${cx + s * meia},${tipY} L${cx + s * meia},${tipY + 13} Q${cx + s * 300},${Y(644)} ${cx},${Y(634)} Z`} fill="url(#asaF)" stroke="#7d8792" strokeWidth={1.5} />)}
      {[-1, 1].flatMap((s) => [195, 370].map((d, k) => {
        const px = cx + s * d, py = Y(618) + (d / meia) ** 2 * (tipY - Y(618)) + 34;
        const hl = destaque.motores ?? 0;
        return (
          <g key={s * d}>
            <path d={`M${px - 6},${py - 34} L${px + 6},${py - 34} L${px + 4},${py - 8} L${px - 4},${py - 8} Z`} fill="#9aa4af" />
            {[-18, 18].map((o) => <g key={o}><circle cx={px + o} cy={py + 8} r={19} fill="url(#motF)" stroke={hl > 0 ? C.laranja : '#6f7984'} strokeWidth={hl > 0 ? 3 * hl : 1.5} /><circle cx={px + o} cy={py + 8} r={10} fill="#1b222b" /><circle cx={px + o} cy={py + 8} r={3} fill="#5c6670" /></g>)}
            {hl > 0 && <text x={px} y={py + 62} textAnchor="middle" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={24} opacity={hl}>{(s < 0 ? (1 - k) * 2 : 4 + k * 2) + 1}·{(s < 0 ? (1 - k) * 2 : 4 + k * 2) + 2}</text>}
          </g>
        );
      }))}
      {[-1, 1].map((s) => (
        <g key={s}>
          <line x1={cx + s * (meia - 40)} y1={tipY + 4} x2={cx + s * (meia - 40)} y2={solo - 14} stroke="#8b95a1" strokeWidth={5} />
          <circle cx={cx + s * (meia - 40)} cy={solo - 12} r={12} fill="#14191f" stroke={(destaque.pontas ?? 0) > 0 ? C.laranja : '#8b95a1'} strokeWidth={(destaque.pontas ?? 0) > 0 ? 4 : 2} />
          {(destaque.pontas ?? 0) > 0 && <circle cx={cx + s * (meia - 40)} cy={solo - 12} r={30 + 8 * Math.sin((destaque.pontas ?? 0) * 6)} fill="none" stroke={C.laranja} strokeWidth={3} opacity={destaque.pontas} />}
        </g>
      ))}
      {[-30, 30].map((o) => <line key={o} x1={cx + o} y1={Y(690)} x2={cx + o} y2={solo - 22} stroke="#8b95a1" strokeWidth={9} />)}
      {[-52, -16, 16, 52].map((d) => <rect key={d} x={cx + d - 14} y={solo - 46} width={28} height={46} rx={9} fill="#14191f" stroke="#8b95a1" strokeWidth={2} />)}
      <ellipse cx={cx} cy={Y(656)} rx={60} ry={68} fill="url(#fusF)" stroke="#7d8792" strokeWidth={1.5} />
      <path d={`M${cx - 30},${Y(622)} Q${cx},${Y(600)} ${cx + 30},${Y(622)} L${cx + 25},${Y(638)} Q${cx},${Y(624)} ${cx - 25},${Y(638)} Z`} fill="#1e2833" />
      <path d={`M${cx - 7},${Y(594)} L${cx - 4},${Y(372)} L${cx + 4},${Y(372)} L${cx + 7},${Y(594)} Z`} fill="url(#asaF)" stroke="#7d8792" strokeWidth={1.5} />
    </g>
  );
};

// Jato comercial de frente (asa baixa, motores sob a asa)
export const JatoFrente: React.FC<{ cx: number; solo: number; incl?: number }> = ({ cx, solo, incl = 0 }) => {
  const fy = solo - 150; // centro da fuselagem
  return (
    <g transform={`rotate(${incl} ${cx} ${solo})`}>
      <defs>
        <linearGradient id="jasa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#9aa4af" /></linearGradient>
        <radialGradient id="jfus" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#d3d9e0" /><stop offset="1" stopColor="#8b95a1" /></radialGradient>
      </defs>
      <ellipse cx={cx} cy={solo + 5} rx={300} ry={8} fill="#000" opacity={0.35} />
      {[-1, 1].map((s) => <path key={s} d={`M${cx},${fy + 30} L${cx + s * 340},${fy - 18} L${cx + s * 340},${fy - 8} L${cx},${fy + 46} Z`} fill="url(#jasa)" stroke="#7d8792" strokeWidth={1.5} />)}
      {[-1, 1].map((s) => <path key={'w' + s} d={`M${cx + s * 340},${fy - 18} L${cx + s * 352},${fy - 52} L${cx + s * 346},${fy - 52} L${cx + s * 336},${fy - 16} Z`} fill="url(#jasa)" />)}
      {[-1, 1].map((s) => <g key={'m' + s}><circle cx={cx + s * 130} cy={fy + 52} r={30} fill="url(#jfus)" stroke="#6f7984" strokeWidth={1.5} /><circle cx={cx + s * 130} cy={fy + 52} r={17} fill="#1b222b" /></g>)}
      {[-1, 1].map((s) => <g key={'t' + s}><line x1={cx + s * 70} y1={fy + 40} x2={cx + s * 70} y2={solo - 20} stroke="#8b95a1" strokeWidth={8} /><rect x={cx + s * 70 - 22} y={solo - 40} width={44} height={40} rx={9} fill="#14191f" stroke="#8b95a1" strokeWidth={2} /></g>)}
      <line x1={cx} y1={fy + 60} x2={cx} y2={solo - 16} stroke="#8b95a1" strokeWidth={6} />
      <rect x={cx - 12} y={solo - 30} width={24} height={30} rx={7} fill="#14191f" stroke="#8b95a1" strokeWidth={2} />
      <circle cx={cx} cy={fy} r={66} fill="url(#jfus)" stroke="#7d8792" strokeWidth={1.5} />
      <path d={`M${cx - 34},${fy - 24} Q${cx},${fy - 44} ${cx + 34},${fy - 24} L${cx + 28},${fy - 10} Q${cx},${fy - 26} ${cx - 28},${fy - 10} Z`} fill="#1e2833" />
      <path d={`M${cx - 7},${fy - 64} L${cx - 4},${fy - 230} L${cx + 4},${fy - 230} L${cx + 7},${fy - 64} Z`} fill="url(#jasa)" stroke="#7d8792" strokeWidth={1.5} />
    </g>
  );
};

export const Rot: React.FC<{ x: number; y: number; txt: string; op?: number; cor?: string; sub?: string; a?: 'start' | 'end' | 'middle'; tam?: number }> = ({ x, y, txt, op = 1, cor = C.laranja, sub, a = 'start', tam = 34 }) => (
  <g opacity={op}>
    <text x={x} y={y} fill={cor} fontFamily={MONO} fontSize={tam} fontWeight={700} letterSpacing={3} textAnchor={a} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.4} strokeWidth={6}>{txt}</text>
    {sub && <text x={x} y={y + tam + 6} fill={C.cinza} fontFamily={MONO} fontSize={tam * 0.68} letterSpacing={2} textAnchor={a} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.4} strokeWidth={5}>{sub}</text>}
  </g>
);

export const Seta: React.FC<{ x1: number; y1: number; x2: number; y2: number; cor?: string; w?: number; op?: number; dash?: string }> = ({ x1, y1, x2, y2, cor = C.texto, w = 5, op = 1, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 10 + w * 2.6;
  return (
    <g opacity={op}>
      <line x1={x1} y1={y1} x2={x2 - Math.cos(a) * h * 0.7} y2={y2 - Math.sin(a) * h * 0.7} stroke={cor} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
      <path d={`M${x2},${y2} L${x2 - Math.cos(a - 0.45) * h},${y2 - Math.sin(a - 0.45) * h} L${x2 - Math.cos(a + 0.45) * h},${y2 - Math.sin(a + 0.45) * h} Z`} fill={cor} />
    </g>
  );
};

export const Grade: React.FC<{ fundo?: string }> = ({ fundo = C.fundo }) => (
  <>
    <rect width={1920} height={1080} fill={fundo} />
    {Array.from({ length: 25 }, (_, i) => <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={1080} stroke="#fff" strokeOpacity={0.03} />)}
    {Array.from({ length: 14 }, (_, i) => <line key={'h' + i} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke="#fff" strokeOpacity={0.03} />)}
  </>
);

// Rajadas de vento em tela (ang 0 = para a direita, 90 = para baixo)
export const Vento: React.FC<{ f: number; op: number; ang: number; n?: number }> = ({ f, op, ang, n = 46 }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: op, pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => {
      const sp = 26 + random(`v${i}`) * 30, len = 80 + random(`l${i}`) * 160;
      const d = ((f * sp + random(`o${i}`) * 3000) % 2600) - 400;
      const base = random(`b${i}`) * 2400 - 240;
      const dx = Math.cos(rad(ang)), dy = Math.sin(rad(ang));
      const vert = ang > 45 && ang < 135;
      const px = vert ? base : d, py = vert ? d : base * 0.45;
      return <line key={i} x1={px} y1={py} x2={px + dx * len} y2={py + dy * len} stroke="#cfe8ff" strokeWidth={1.4 + random(`w${i}`) * 1.4} strokeLinecap="round" opacity={0.16 + random(`a${i}`) * 0.28} />;
    })}
  </svg>
);

export const Carimbo: React.FC<{ g: number; ini: number; txt: string; cor?: string; x?: number; y?: number; fim?: number; tam?: number }> = ({ g, ini, txt, cor = C.vermelho, x = 960, y = 200, fim = 1e9, tam = 64 }) => {
  const s = spring({ frame: g - ini, fps: 30, config: { damping: 11, stiffness: 190 } });
  if (g < ini) return null;
  const w = txt.length * tam * 0.72 + 80;
  return (
    <g opacity={Math.min(1, s) * L(g, [fim - 8, fim], [1, 0])} transform={`translate(${x},${y}) scale(${interpolate(s, [0, 1], [1.7, 1])}) rotate(-4)`}>
      <rect x={-w / 2} y={-tam * 1.05} width={w} height={tam * 1.9} rx={12} fill="rgba(20,4,4,.55)" stroke={cor} strokeWidth={7} />
      <text x={0} y={tam * 0.32} textAnchor="middle" fill={cor} fontFamily={SANS} fontWeight={900} fontSize={tam} letterSpacing={5}>{txt}</text>
    </g>
  );
};

// Cartão de texto em tela (lista de itens com check ou X)
export const Item: React.FC<{ x: number; y: number; txt: string; ok: boolean | null; op: number; tam?: number }> = ({ x, y, txt, ok, op, tam = 40 }) => (
  <g opacity={op} transform={`translate(${x},${y})`}>
    {ok !== null && <g transform={`translate(0,${-tam * 0.35})`}>
      <circle r={tam * 0.6} fill={ok ? 'rgba(74,222,128,.15)' : 'rgba(255,77,77,.15)'} stroke={ok ? C.verde : C.vermelho} strokeWidth={3} />
      {ok ? <path d={`M${-tam * 0.28},0 L${-tam * 0.06},${tam * 0.22} L${tam * 0.3},${-tam * 0.22}`} stroke={C.verde} strokeWidth={5} fill="none" strokeLinecap="round" />
        : <path d={`M${-tam * 0.22},${-tam * 0.22} L${tam * 0.22},${tam * 0.22} M${tam * 0.22},${-tam * 0.22} L${-tam * 0.22},${tam * 0.22}`} stroke={C.vermelho} strokeWidth={5} strokeLinecap="round" />}
    </g>}
    <text x={ok !== null ? tam * 1.1 : 0} y={0} fill={C.texto} fontFamily={SANS} fontWeight={800} fontSize={tam} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.4} strokeWidth={6}>{txt}</text>
  </g>
);
