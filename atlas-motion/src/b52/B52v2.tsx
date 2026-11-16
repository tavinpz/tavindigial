import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame } from 'remotion';

// Versão 2 do teste "Why the B-52 lands sideways": câmera 3D, avião com volume, fumaça, faíscas, cartão final.
const C = {
  fundo: '#081018', terreno: '#16211a', terreno2: '#1b2820', pista: '#2a2f36', linha: '#eef1f4',
  laranja: '#ff8a2a', vermelho: '#ff4d4d', azul: '#6cc0ff', texto: '#f3f5f7', cinza: '#8f99a5',
};
const SANS = '"Inter", sans-serif';
const MONO = '"JetBrains Mono", "Inter", monospace';
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const L = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
const rad = (d: number) => (d * Math.PI) / 180;

// ---------- avião visto de cima (nariz para +x, comprimento 300) ----------
const Defs: React.FC<{ id: string }> = ({ id }) => (
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
    <radialGradient id={`${id}-sombra`}><stop offset="0" stopColor="#000" stopOpacity="0.55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
  </defs>
);

const AviaoTopo: React.FC<{ id: string; sombra?: boolean }> = ({ id, sombra }) => {
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
      {!sombra && [40, 80, 120, 160].flatMap((y) => [y, -y]).map((y) => (
        <line key={y} x1={le(y) - 2} y1={y} x2={le(y) - 22} y2={y} stroke="#8d97a2" strokeWidth={0.8} opacity={0.6} />
      ))}
      {!sombra && <path d="M-40,-60 L-75,-150 M-40,60 L-75,150" stroke="#8d97a2" strokeWidth={1} opacity={0.5} />}
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
        <line x1={60} y1={-12} x2={60} y2={12} stroke="#8d97a2" strokeWidth={0.8} opacity={0.6} />
        <line x1={-100} y1={-10} x2={-100} y2={10} stroke="#8d97a2" strokeWidth={0.8} opacity={0.6} />
        <circle cx={-80} cy={-176} r={2.5} fill="#ff3b3b" /><circle cx={-80} cy={176} r={2.5} fill="#3bff7a" />
      </>}
    </g>
  );
};

const Rot: React.FC<{ x: number; y: number; txt: string; op: number; cor?: string; sub?: string; a?: 'start' | 'end' | 'middle'; tam?: number }> = ({ x, y, txt, op, cor = C.laranja, sub, a = 'start', tam = 34 }) => (
  <g opacity={op}>
    <text x={x} y={y} fill={cor} fontFamily={MONO} fontSize={tam} fontWeight={700} letterSpacing={3} textAnchor={a} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.35} strokeWidth={6}>{txt}</text>
    {sub && <text x={x} y={y + tam + 4} fill={C.cinza} fontFamily={MONO} fontSize={tam * 0.7} letterSpacing={2} textAnchor={a}>{sub}</text>}
  </g>
);

// Rajadas de vento em tela
const Vento: React.FC<{ f: number; op: number; ang: number; n?: number }> = ({ f, op, ang, n = 46 }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: op }}>
    {Array.from({ length: n }, (_, i) => {
      const sp = 26 + random(`v${i}`) * 30, len = 80 + random(`l${i}`) * 160;
      const d = ((f * sp + random(`o${i}`) * 3000) % 2600) - 400;
      const base = random(`b${i}`) * 2400 - 240;
      const dx = Math.cos(rad(ang)), dy = Math.sin(rad(ang));
      const px = ang > 45 && ang < 135 ? base : d, py = ang > 45 && ang < 135 ? d : base * 0.45;
      return <line key={i} x1={px} y1={py} x2={px + dx * len} y2={py + dy * len} stroke="#cfe8ff" strokeWidth={1.4 + random(`w${i}`) * 1.4} strokeLinecap="round" opacity={0.18 + random(`a${i}`) * 0.3} />;
    })}
  </svg>
);

// ---------- cena 1: aproximação em 3D ----------
const POUSO = 152;
const CenaPista: React.FC<{ f: number }> = ({ f }) => {
  const crab = L(f, [90, 112], [0, 18], Easing.out(Easing.back(1.4)));
  const x = interpolate(f, [0, 175], [340, 1180], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });
  const y = 540;
  const alt = L(f, [0, POUSO], [190, 0], Easing.in(Easing.quad));
  const tilt = L(f, [0, 170], [58, 46]);
  const rz = L(f, [0, 170], [-8, 4]);
  const zoom = L(f, [0, 170], [1.0, 1.28]);
  const camX = (x - 960) * 0.85;
  const linhas = L(f, [128, 144], [0, 1]);
  const carimbo = spring({ frame: f - 128, fps: 30, config: { damping: 11, stiffness: 190 } });
  const vento = L(f, [78, 96], [0, 1]) * L(f, [150, 165], [1, 0.4]);
  const tremor = f >= POUSO && f < POUSO + 10 ? (random(`t${f}`) - 0.5) * 10 * (1 - (f - POUSO) / 10) : 0;
  const pp = (lx: number, ly: number) => ({ x: x + lx * Math.cos(rad(-crab)) - ly * Math.sin(rad(-crab)), y: y + lx * Math.sin(rad(-crab)) + ly * Math.cos(rad(-crab)) });
  const rodas = [pp(40, -12), pp(40, 12), pp(-40, -12), pp(-40, 12)];
  const W = 5200, H = 2600, OX = -1600, OY = -760;
  return (
    <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: '50% 30%', transform: `translateY(${tremor}px)` }}>
      <div style={{ position: 'absolute', width: 1920, height: 1080, transformStyle: 'preserve-3d', transformOrigin: '50% 50%', transform: `rotateX(${tilt}deg) rotateZ(${rz}deg) scale(${zoom}) translateX(${-camX}px)` }}>
        <svg width={W} height={H} viewBox={`${OX} ${OY} ${W} ${H}`} style={{ position: 'absolute', left: OX, top: OY }}>
          <defs>
            <pattern id="grama" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill={C.terreno} /><rect width="30" height="30" fill={C.terreno2} opacity={0.5} /><rect x="30" y="30" width="30" height="30" fill={C.terreno2} opacity={0.35} /></pattern>
            <linearGradient id="asfalto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#30353d" /><stop offset="0.5" stopColor="#262b31" /><stop offset="1" stopColor="#30353d" /></linearGradient>
            <radialGradient id="luz"><stop offset="0" stopColor="#fff7d6" /><stop offset="0.35" stopColor="#ffd37a" stopOpacity="0.8" /><stop offset="1" stopColor="#ffb02e" stopOpacity="0" /></radialGradient>
            <radialGradient id="fumaca"><stop offset="0" stopColor="#e8ecf0" stopOpacity="0.85" /><stop offset="1" stopColor="#e8ecf0" stopOpacity="0" /></radialGradient>
          </defs>
          <rect x={OX} y={OY} width={W} height={H} fill="url(#grama)" />
          <rect x={OX} y={300} width={W} height={50} fill="#1d2620" />
          <rect x={150} y={410} width={W} height={260} fill="url(#asfalto)" />
          {Array.from({ length: 60 }, (_, i) => <rect key={i} x={150 + i * 90} y={410 + random(`m${i}`) * 260} width={40 + random(`n${i}`) * 80} height={2} fill="#000" opacity={0.18} />)}
          <line x1={150} y1={420} x2={W} y2={420} stroke={C.linha} strokeWidth={5} />
          <line x1={150} y1={660} x2={W} y2={660} stroke={C.linha} strokeWidth={5} />
          {Array.from({ length: 40 }, (_, i) => <rect key={i} x={420 + i * 120} y={536} width={64} height={7} fill={C.linha} opacity={0.9} />)}
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={180} y={432 + i * 29} width={80} height={15} fill={C.linha} />)}
          {[0, 1].map((k) => <g key={k}>{[0, 1, 2].map((j) => <rect key={j} x={720 + k * 260} y={450 + j * 22 + (k ? 0 : 0)} width={110} height={12} fill={C.linha} opacity={0.85} />)}{[0, 1, 2].map((j) => <rect key={'b' + j} x={720 + k * 260} y={586 + j * 22} width={110} height={12} fill={C.linha} opacity={0.85} />)}</g>)}
          <text x={300} y={565} fill={C.linha} fontFamily={SANS} fontWeight={800} fontSize={74} transform="rotate(90 300 540)">27</text>
          {/* luzes de aproximação com o "coelho" correndo */}
          {Array.from({ length: 14 }, (_, i) => {
            const lx = 120 - i * 70;
            const on = Math.floor(f / 2) % 14 === 13 - i;
            return <g key={i}>{[-30, 0, 30].map((dy) => <circle key={dy} cx={lx} cy={540 + dy} r={on ? 26 : 12} fill="url(#luz)" opacity={on ? 1 : 0.55} />)}</g>;
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={160} cy={428 + i * 32} r={10} fill="url(#luz)" />)}
          {/* marcas de pneu e fumaça no toque */}
          {f >= POUSO && rodas.map((r, i) => (
            <g key={i}>
              {Array.from({ length: 5 }, (_, k) => {
                const g = f - POUSO - k * 2; if (g < 0) return null;
                const rr = 14 + g * 3.2, op = Math.max(0, 0.8 - g / 28);
                return <circle key={k} cx={r.x - 30 - k * 14 - g * 1.5} cy={r.y + (random(`s${i}${k}`) - 0.5) * 16} r={rr} fill="url(#fumaca)" opacity={op} />;
              })}
            </g>
          ))}
          <g opacity={linhas}>
            <line x1={x} y1={y} x2={x + 900} y2={y} stroke={C.texto} strokeWidth={4} strokeDasharray="18 12" />
            <line x1={x} y1={y} x2={x + 900 * Math.cos(rad(-crab))} y2={y + 900 * Math.sin(rad(-crab))} stroke={C.laranja} strokeWidth={4} strokeDasharray="18 12" />
            <Rot x={x + 300} y={y + 60} txt="WHERE IT GOES" op={1} cor={C.texto} tam={38} />
            <Rot x={x + 170} y={y - 250} txt="WHERE IT POINTS" op={1} tam={38} />
          </g>
          {/* sombra no chão: se aproxima do avião conforme ele desce */}
          <g transform={`translate(${x + alt * 0.9},${y + alt * 0.5}) rotate(${-crab})`} opacity={0.5 - alt / 900}>
            <AviaoTopo id="s1" sombra />
          </g>
        </svg>
        {/* avião flutuando acima do chão (camada 3D) */}
        <svg width={600} height={600} viewBox="-300 -300 600 600" style={{ position: 'absolute', left: x - 300, top: y - 300, transform: `translateZ(${alt}px)`, overflow: 'visible' }}>
          <g transform={`rotate(${-crab})`}><AviaoTopo id="a1" /></g>
        </svg>
      </div>
      <Vento f={f} op={vento} ang={98} />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={L(f, [6, 20], [0, 1]) * L(f, [70, 82], [1, 0])}>
          <rect x={1300} y={70} width={560} height={2} fill={C.laranja} />
          <Rot x={1860} y={125} txt="B-52 STRATOFORTRESS" op={1} cor={C.texto} a="end" tam={36} sub="185 FT WINGSPAN · 8 ENGINES" />
        </g>
        <g opacity={vento}><Rot x={70} y={110} txt="CROSSWIND  ↓" op={1} cor={C.azul} tam={34} /></g>
        <g opacity={L(f, [100, 110], [0, 1]) * L(f, [124, 130], [1, 0])}>
          <text x={1850} y={930} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={110}>{Math.round(crab)}°</text>
          <text x={1850} y={975} textAnchor="end" fill={C.cinza} fontFamily={MONO} fontSize={26} letterSpacing={3}>OFF THE RUNWAY LINE</text>
        </g>
        <g opacity={Math.min(1, carimbo) * L(f, [158, 166], [1, 0])} transform={`translate(960,200) scale(${interpolate(carimbo, [0, 1], [1.7, 1])}) rotate(-4)`}>
          <rect x={-330} y={-66} width={660} height={120} rx={12} fill="rgba(20,4,4,.55)" stroke={C.vermelho} strokeWidth={7} />
          <text x={0} y={20} textAnchor="middle" fill={C.vermelho} fontFamily={SANS} fontWeight={900} fontSize={64} letterSpacing={5}>NOT A MISTAKE</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- cena 2: vista de frente ----------
const CenaFrente: React.FC<{ f: number }> = ({ f }) => {
  const g = f - 165;
  const dim = L(g, [8, 34], [0, 1]);
  const incl = L(g, [44, 64], [0, -5.4], Easing.in(Easing.quad)) + L(g, [86, 104], [0, 5.4]);
  const T = 64;
  const bate = g >= T && g < 100;
  const pulso = L(g, [T, T + 22], [0, 1], Easing.out(Easing.quad));
  const tremor = g >= T && g < T + 12 ? (random(`q${g}`) - 0.5) * 16 * (1 - (g - T) / 12) : 0;
  const vento = L(g, [26, 40], [0, 1]) * L(g, [96, 110], [1, 0]);
  const push = L(g, [0, 118], [1.0, 1.08]);
  const solo = 830, cx = 960, meia = 620, tipY = 712;
  const ponta = cx - meia + 40;
  return (
    <AbsoluteFill style={{ transform: `translate(${tremor}px, ${tremor * 0.6}px) scale(${push})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07111c" /><stop offset="0.75" stopColor="#1a2c40" /><stop offset="1" stopColor="#2c3f52" /></linearGradient>
          <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e252d" /><stop offset="1" stopColor="#0b0f14" /></linearGradient>
          <linearGradient id="asaF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#9aa4af" /></linearGradient>
          <radialGradient id="fusF" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#d3d9e0" /><stop offset="1" stopColor="#8b95a1" /></radialGradient>
          <radialGradient id="motF" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#f2f4f6" /><stop offset="1" stopColor="#8b95a1" /></radialGradient>
          <radialGradient id="faisca"><stop offset="0" stopColor="#fff3c4" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#ceu)" />
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={random(`e${i}`) * 1920} cy={random(`f${i}`) * 420} r={random(`g${i}`) * 1.4 + 0.3} fill="#fff" opacity={0.35} />)}
        <rect x={0} y={solo} width={1920} height={250} fill="url(#chao)" />
        {/* pista em perspectiva */}
        <path d={`M760,${solo} L1160,${solo} L1760,1080 L160,1080 Z`} fill="#2a2f36" />
        <path d={`M955,${solo} L965,${solo} L985,1080 L935,1080 Z`} fill={C.linha} opacity={0.5} />
        {Array.from({ length: 9 }, (_, i) => { const t = i / 8; const yy = solo + t * 250; const half = 200 + t * 600; return <g key={i}><circle cx={cx - half} cy={yy} r={3 + t * 4} fill="#ffd37a" /><circle cx={cx + half} cy={yy} r={3 + t * 4} fill="#ffd37a" /></g>; })}
        <line x1={0} y1={solo} x2={1920} y2={solo} stroke="#3c4855" strokeWidth={2} />
        <g transform={`rotate(${incl} ${cx} ${solo})`}>
          <ellipse cx={cx} cy={solo + 6} rx={meia * 0.9} ry={10} fill="#000" opacity={0.35} />
          <path d={`M${cx},618 Q${cx - 300},628 ${cx - meia},${tipY} L${cx - meia},${tipY + 13} Q${cx - 300},644 ${cx},634 Z`} fill="url(#asaF)" stroke="#7d8792" strokeWidth={1.5} />
          <path d={`M${cx},618 Q${cx + 300},628 ${cx + meia},${tipY} L${cx + meia},${tipY + 13} Q${cx + 300},644 ${cx},634 Z`} fill="url(#asaF)" stroke="#7d8792" strokeWidth={1.5} />
          {[-1, 1].flatMap((s) => [195, 370].map((d) => {
            const px = cx + s * d, py = 618 + (d / meia) ** 2 * (tipY - 618) + 34;
            return (
              <g key={s * d}>
                <path d={`M${px - 6},${py - 34} L${px + 6},${py - 34} L${px + 4},${py - 8} L${px - 4},${py - 8} Z`} fill="#9aa4af" />
                {[-18, 18].map((o) => <g key={o}><circle cx={px + o} cy={py + 8} r={19} fill="url(#motF)" stroke="#6f7984" strokeWidth={1.5} /><circle cx={px + o} cy={py + 8} r={10} fill="#1b222b" /><circle cx={px + o} cy={py + 8} r={3} fill="#5c6670" /></g>)}
              </g>
            );
          }))}
          {[-1, 1].map((s) => (
            <g key={s}>
              <line x1={cx + s * (meia - 40)} y1={tipY + 4} x2={cx + s * (meia - 40)} y2={solo - 14} stroke="#8b95a1" strokeWidth={5} />
              <circle cx={cx + s * (meia - 40)} cy={solo - 12} r={12} fill="#14191f" stroke="#8b95a1" strokeWidth={2} />
            </g>
          ))}
          {[-30, 30].map((o) => <line key={o} x1={cx + o} y1={690} x2={cx + o} y2={solo - 22} stroke="#8b95a1" strokeWidth={9} />)}
          {[-52, -16, 16, 52].map((d) => <rect key={d} x={cx + d - 14} y={solo - 46} width={28} height={46} rx={9} fill="#14191f" stroke="#8b95a1" strokeWidth={2} />)}
          <ellipse cx={cx} cy={656} rx={60} ry={68} fill="url(#fusF)" stroke="#7d8792" strokeWidth={1.5} />
          <path d={`M${cx - 30},622 Q${cx},600 ${cx + 30},622 L${cx + 25},638 Q${cx},624 ${cx - 25},638 Z`} fill="#1e2833" />
          <path d={`M${cx - 7},594 L${cx - 4},372 L${cx + 4},372 L${cx + 7},594 Z`} fill="url(#asaF)" stroke="#7d8792" strokeWidth={1.5} />
        </g>
        {/* cota */}
        <g opacity={dim * L(g, [40, 52], [1, 0.3])}>
          <line x1={cx - meia * dim} y1={290} x2={cx + meia * dim} y2={290} stroke={C.laranja} strokeWidth={4} />
          {dim > 0.98 && [-1, 1].map((s) => <line key={s} x1={cx + s * meia} y1={270} x2={cx + s * meia} y2={310} stroke={C.laranja} strokeWidth={4} />)}
          {dim > 0.98 && [-1, 1].map((s) => <line key={'d' + s} x1={cx + s * meia} y1={310} x2={cx + s * meia} y2={tipY - 10} stroke={C.laranja} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />)}
          <text x={cx} y={255} textAnchor="middle" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={58}>185 FT</text>
          <text x={cx} y={350} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={26} letterSpacing={3}>56 METERS, TIP TO TIP</text>
        </g>
        {bate && <g>
          <circle cx={ponta} cy={solo - 4} r={30 + pulso * 110} fill="none" stroke={C.vermelho} strokeWidth={6} opacity={1 - pulso * 0.7} />
          {Array.from({ length: 22 }, (_, i) => {
            const a = rad(-170 + random(`p${i}`) * 140), v = 6 + random(`v${i}`) * 16, gg = g - T;
            const px = ponta + Math.cos(a) * v * gg, py = solo - 4 + Math.sin(a) * v * gg + 0.6 * gg * gg;
            return <circle key={i} cx={px} cy={py} r={3 + random(`r${i}`) * 3} fill="url(#faisca)" opacity={Math.max(0, 1 - gg / 20)} />;
          })}
          <Rot x={ponta + 30} y={solo - 150} txt="WINGTIP STRIKE" op={1} cor={C.vermelho} tam={40} />
        </g>}
        <g opacity={vento}><Rot x={70} y={460} txt="CROSSWIND  →" op={1} cor={C.azul} tam={34} /></g>
      </svg>
      <Vento f={f} op={vento * 0.8} ang={4} n={34} />
    </AbsoluteFill>
  );
};

// ---------- cena 3: trem que gira ----------
const CenaTrem: React.FC<{ f: number }> = ({ f }) => {
  const g = f - 283;
  const ang = L(g, [16, 66], [0, 20]);
  const brilho = L(g, [4, 18], [0, 1]);
  const scroll = (g * 26) % 220;
  const bate = spring({ frame: g - 68, fps: 30, config: { damping: 10 } });
  const trucks = [[260, -34], [260, 34], [-180, -34], [-180, 34]];
  const tilt = L(g, [0, 160], [30, 38]);
  const zoom = L(g, [0, 160], [0.98, 1.1]);
  return (
    <AbsoluteFill style={{ background: '#0c1117' }}>
      <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: '50% 20%' }}>
        <div style={{ position: 'absolute', width: 1920, height: 1080, transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) scale(${zoom})` }}>
          <svg width={3200} height={1800} viewBox="-1600 -900 3200 1800" style={{ position: 'absolute', left: -640, top: -360 }}>
            <defs>
              <linearGradient id="asf3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#30353d" /><stop offset="0.5" stopColor="#272c32" /><stop offset="1" stopColor="#30353d" /></linearGradient>
              <radialGradient id="glow3"><stop offset="0" stopColor={C.laranja} stopOpacity="0.55" /><stop offset="1" stopColor={C.laranja} stopOpacity="0" /></radialGradient>
            </defs>
            <rect x={-1600} y={-620} width={3200} height={1240} fill="url(#asf3)" />
            {Array.from({ length: 80 }, (_, i) => <rect key={i} x={((random(`x${i}`) * 3400 - scroll * 1) % 3400) - 1700} y={random(`y${i}`) * 1200 - 600} width={30 + random(`k${i}`) * 90} height={2} fill="#000" opacity={0.2} />)}
            {Array.from({ length: 18 }, (_, i) => <rect key={i} x={-1700 + i * 220 - scroll} y={-5} width={120} height={10} fill={C.linha} opacity={0.55} />)}
            <line x1={-1600} y1={-600} x2={1600} y2={-600} stroke={C.linha} strokeWidth={6} opacity={0.6} />
            <line x1={-1600} y1={600} x2={1600} y2={600} stroke={C.linha} strokeWidth={6} opacity={0.6} />
            {/* rastro dos pneus: sempre alinhado com a pista */}
            {trucks.map(([tx, ty], i) => {
              const px = tx * Math.cos(rad(-ang)) - ty * Math.sin(rad(-ang)), py = tx * Math.sin(rad(-ang)) + ty * Math.cos(rad(-ang));
              return <g key={i} opacity={L(g, [30, 60], [0, 0.55])}>
                <rect x={-1600} y={py - 18} width={1600 + px - 40} height={10} fill="#11151a" />
                <rect x={-1600} y={py + 6} width={1600 + px - 40} height={10} fill="#11151a" />
              </g>;
            })}
            <g transform={`rotate(${-ang})`}>
              <path d="M780,0 C780,-40 730,-62 640,-64 L-700,-56 L-780,-20 L-780,20 L-700,56 L640,64 C730,62 780,40 780,0 Z" fill="#dfe5eb" fillOpacity={0.12} stroke="#e6eaef" strokeWidth={3} />
              <path d="M120,-64 L-200,-560 L-330,-560 L-120,-62 Z M120,64 L-200,560 L-330,560 L-120,62 Z" fill="#dfe5eb" fillOpacity={0.05} stroke="#9aa4af" strokeWidth={2} strokeDasharray="10 8" opacity={0.35} />
              <line x1={-780} y1={0} x2={1100} y2={0} stroke={C.laranja} strokeWidth={4} strokeDasharray="18 12" opacity={L(g, [18, 30], [0, 1])} />
              {trucks.map(([tx, ty]) => (
                <g key={`${tx}${ty}`} transform={`translate(${tx},${ty}) rotate(${ang})`}>
                  <circle r={90} fill="url(#glow3)" opacity={brilho} />
                  <rect x={-58} y={-30} width={116} height={60} rx={12} fill="none" stroke={C.laranja} strokeWidth={4} opacity={brilho} />
                  <rect x={-42} y={-21} width={84} height={17} rx={7} fill="#141920" stroke="#dfe5eb" strokeWidth={2} />
                  <rect x={-42} y={4} width={84} height={17} rx={7} fill="#141920" stroke="#dfe5eb" strokeWidth={2} />
                  <line x1={0} y1={-26} x2={0} y2={26} stroke="#dfe5eb" strokeWidth={3} />
                </g>
              ))}
            </g>
            <g opacity={L(g, [18, 30], [0, 1])}>
              <line x1={0} y1={0} x2={1100} y2={0} stroke={C.texto} strokeWidth={4} strokeDasharray="18 12" />
              <path d={`M560,0 A560,560 0 0 0 ${560 * Math.cos(rad(ang))},${-560 * Math.sin(rad(ang))}`} fill="none" stroke={C.laranja} strokeWidth={7} />
            </g>
          </svg>
        </div>
      </AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect x={50} y={44} width={700} height={120} rx={12} fill="#0c1117" opacity={0.85 * brilho} />
        <Rot x={80} y={100} txt="CROSSWIND CRAB SYSTEM" op={brilho} tam={36} sub="ALL 4 MAIN GEAR TRUCKS STEER" />
        <g opacity={L(g, [30, 46], [0, 1])}>
          <Rot x={80} y={1000} txt="TRAVEL  →" op={1} cor={C.texto} tam={32} />
        </g>
        <g opacity={L(g, [18, 30], [0, 1])} transform={`translate(1850,${1000}) scale(${1 + Math.max(0, bate) * 0.18})`}>
          <text x={0} y={0} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={150} style={{ filter: `drop-shadow(0 0 ${24 * Math.min(1, Math.max(0, bate))}px ${C.laranja})` }}>{Math.round(ang)}°</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- cartão final ----------
const Final: React.FC<{ f: number }> = ({ f }) => {
  const g = f - 398;
  const op = L(g, [0, 12], [0, 1]);
  const lin = L(g, [8, 30], [0, 1]);
  return (
    <AbsoluteFill style={{ background: `rgba(6,10,15,${0.86 * op})`, alignItems: 'center', justifyContent: 'center', opacity: op }}>
      <div style={{ fontFamily: MONO, color: C.laranja, fontSize: 28, letterSpacing: 8, marginBottom: 18 }}>ENGINEERING, EXPLAINED</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, color: C.texto, fontSize: 92, letterSpacing: -2, textAlign: 'center', lineHeight: 1.02 }}>WHY THE B-52<br />LANDS SIDEWAYS</div>
      <div style={{ height: 6, width: 640 * lin, background: C.laranja, marginTop: 28, borderRadius: 3 }} />
    </AbsoluteFill>
  );
};

type Marca = { t: number; d: number; txt: string };
const DEST = ['B-52', 'sideways.', 'mistake.', 'long,', 'wheels', 'turn', 'twenty', 'degrees.'];
const Legenda: React.FC<{ f: number; marcas: Marca[] }> = ({ f, marcas }) => {
  const t = f / 30;
  const m = marcas.find((x) => t >= x.t - 0.05 && t < x.t + x.d + 0.2);
  if (!m || f > 395) return null;
  const ps = m.txt.split(' ');
  return (
    <div style={{ position: 'absolute', bottom: 64, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: -0.5, textShadow: '0 4px 22px rgba(0,0,0,.9)' }}>
      {ps.map((p, i) => {
        const ini = (m.t + (m.d * i) / ps.length) * 30;
        const s = spring({ frame: f - ini, fps: 30, config: { damping: 14, stiffness: 220 } });
        const dest = DEST.some((d) => p.startsWith(d.replace(/[.,]/g, '')));
        return <span key={i} style={{ display: 'inline-block', marginRight: 15, color: dest ? C.laranja : C.texto, opacity: 0.2 + 0.8 * Math.min(1, s), transform: `translateY(${(1 - Math.min(1, s)) * 14}px) scale(${0.92 + 0.08 * Math.min(1, s)})` }}>{p}</span>;
      })}
    </div>
  );
};

export const B52v2: React.FC<{ marcas: Marca[] }> = ({ marcas }) => {
  const f = useCurrentFrame();
  const t1 = L(f, [158, 172], [0, 1]);
  const t2 = L(f, [276, 290], [0, 1]);
  const flash = Math.max(L(f, [158, 162], [0, 0.35]) * L(f, [162, 172], [1, 0]), L(f, [276, 280], [0, 0.35]) * L(f, [280, 290], [1, 0]));
  return (
    <AbsoluteFill style={{ background: C.fundo, overflow: 'hidden' }}>
      {f < 174 && <AbsoluteFill style={{ opacity: 1 - t1, transform: `scale(${1 + t1 * 0.12})` }}><CenaPista f={f} /></AbsoluteFill>}
      {f >= 156 && f < 292 && <AbsoluteFill style={{ opacity: Math.min(t1, 1 - t2), transform: `scale(${1.1 - t1 * 0.1})` }}><CenaFrente f={f} /></AbsoluteFill>}
      {f >= 274 && <AbsoluteFill style={{ opacity: t2, transform: `scale(${1.1 - t2 * 0.1})` }}><CenaTrem f={f} /></AbsoluteFill>}
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,.6) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,60,90,.10), rgba(255,140,40,.06))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay' }}><Img src={staticFile(`fx/grain${f % 4}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
      {f >= 398 && <Final f={f} />}
      <Legenda f={f} marcas={marcas} />
      <AbsoluteFill style={{ background: '#000', opacity: L(f, [0, 10], [1, 0]) + L(f, [440, 450], [0, 1]) }} />
      <Audio src={staticFile('b52/voz2.wav')} />
    </AbsoluteFill>
  );
};
