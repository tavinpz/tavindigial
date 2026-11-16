import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Teste de 15 s: "Why the B-52 lands sideways". Tudo desenhado em código.
const C = {
  fundo: '#0b1118', terreno: '#141d17', pista: '#252a31', linha: '#e9ecef', aviao: '#d8dde4', aviaoEsc: '#9aa3ad',
  laranja: '#ff8a2a', vermelho: '#ff4d4d', azul: '#5ab0ff', texto: '#f3f5f7', cinza: '#8a94a0',
};
const SANS = '"Inter", sans-serif';
const MONO = '"JetBrains Mono", "Inter", monospace';
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const lerp = (f: number, a: number[], b: number[]) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

// Avião visto de cima, nariz para +x. Unidades locais (comprimento 300).
const AviaoTopo: React.FC<{ s?: number }> = ({ s = 1 }) => {
  const le = (y: number) => 30 - 100 * (Math.abs(y) / 175);
  const pods = [60, 110].flatMap((y) => [y, -y]);
  return (
    <g transform={`scale(${s})`}>
      {/* asas */}
      <path d="M30,-11 L-70,-175 L-95,-175 L-30,-11 Z M30,11 L-70,175 L-95,175 L-30,11 Z" fill={C.aviao} stroke={C.aviaoEsc} strokeWidth={1.5} strokeLinejoin="round" />
      {/* motores (8, em 4 pares) */}
      {pods.map((y) => (
        <g key={y} transform={`translate(${le(y) + 8},${y})`}>
          <rect x={-22} y={-9} width={44} height={8} rx={4} fill="#c3c9d1" stroke={C.aviaoEsc} strokeWidth={1} />
          <rect x={-22} y={1} width={44} height={8} rx={4} fill="#c3c9d1" stroke={C.aviaoEsc} strokeWidth={1} />
        </g>
      ))}
      {/* tanques nas pontas */}
      {[-148, 148].map((y) => <rect key={y} x={-70} y={y - 4} width={40} height={8} rx={4} fill="#c3c9d1" stroke={C.aviaoEsc} strokeWidth={1} />)}
      {/* empenagem */}
      <path d="M-108,-9 L-140,-58 L-158,-58 L-135,-9 Z M-108,9 L-140,58 L-158,58 L-135,9 Z" fill={C.aviao} stroke={C.aviaoEsc} strokeWidth={1.5} strokeLinejoin="round" />
      {/* fuselagem */}
      <path d="M150,0 C150,-8 140,-12 120,-13 L-150,-9 L-160,-3 L-160,3 L-150,9 L120,13 C140,12 150,8 150,0 Z" fill="#e6eaef" stroke={C.aviaoEsc} strokeWidth={1.5} />
      <line x1={-150} y1={0} x2={-60} y2={0} stroke={C.aviaoEsc} strokeWidth={2} />
      <path d="M140,-4 L128,-6 L128,6 L140,4 Z" fill="#3a4654" />
    </g>
  );
};

const Seta: React.FC<{ x: number; y: number; ang: number; len: number; op: number; cor?: string }> = ({ x, y, ang, len, op, cor = C.azul }) => (
  <g transform={`translate(${x},${y}) rotate(${ang})`} opacity={op}>
    <line x1={0} y1={0} x2={len} y2={0} stroke={cor} strokeWidth={4} strokeLinecap="round" />
    <path d={`M${len + 14},0 L${len - 4},-10 L${len - 4},10 Z`} fill={cor} />
  </g>
);

const Rotulo: React.FC<{ x: number; y: number; txt: string; op: number; cor?: string; sub?: string; ancora?: 'start' | 'end' }> = ({ x, y, txt, op, cor = C.laranja, sub, ancora = 'start' }) => (
  <g opacity={op}>
    <text x={x} y={y} fill={cor} fontFamily={MONO} fontSize={32} fontWeight={700} letterSpacing={3} textAnchor={ancora}>{txt}</text>
    {sub && <text x={x} y={y + 36} fill={C.cinza} fontFamily={MONO} fontSize={24} letterSpacing={2} textAnchor={ancora}>{sub}</text>}
  </g>
);

// Cena 1: pista vista de cima (0 a 175)
const CenaPista: React.FC<{ f: number }> = ({ f }) => {
  const crab = lerp(f, [62, 100], [0, 18]);
  const x = interpolate(f, [0, 175], [520, 1120], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });
  const y = 540 + lerp(f, [0, 150], [-6, 0]);
  const alt = lerp(f, [0, 150], [70, 0]);
  const zoom = lerp(f, [0, 175], [1.0, 1.35]);
  const vento = lerp(f, [70, 92], [0, 1]) * lerp(f, [122, 132], [1, 0.25]);
  const linhas = lerp(f, [128, 146], [0, 1]);
  const scroll = (f * 9) % 120;
  const carimbo = spring({ frame: f - 130, fps: 30, config: { damping: 12, stiffness: 180 } });
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <g transform={`translate(${960 - (x - 960) * 0.6},540) scale(${zoom}) translate(-960,-540)`}>
        <rect x={-2000} y={-1000} width={6000} height={3000} fill={C.terreno} />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-2000} y1={-1000 + i * 80} x2={4000} y2={-1000 + i * 80} stroke="#ffffff" strokeOpacity={0.025} />)}
        <rect x={-2000} y={410} width={6000} height={260} fill={C.pista} />
        <line x1={-2000} y1={420} x2={4000} y2={420} stroke={C.linha} strokeWidth={4} />
        <line x1={-2000} y1={660} x2={4000} y2={660} stroke={C.linha} strokeWidth={4} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1000 + i * 120 - scroll * 0} y={537} width={60} height={6} fill={C.linha} opacity={0.85} />)}
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={200} y={432 + i * 29} width={70} height={14} fill={C.linha} opacity={0.9} />)}
        <text x={330} y={560} fill={C.linha} opacity={0.9} fontFamily={SANS} fontWeight={800} fontSize={64} transform="rotate(90 330 540)">27</text>
        {/* linhas de trajetória e de nariz */}
        <g opacity={linhas}>
          <line x1={x} y1={y} x2={x + 700} y2={y} stroke={C.texto} strokeWidth={3} strokeDasharray="14 10" />
          <line x1={x} y1={y} x2={x + 700 * Math.cos((-crab * Math.PI) / 180)} y2={y + 700 * Math.sin((-crab * Math.PI) / 180)} stroke={C.laranja} strokeWidth={3} strokeDasharray="14 10" />
          <Rotulo x={x + 260} y={y + 48} txt="WHERE IT GOES" op={1} cor={C.texto} />
          <Rotulo x={x + 140} y={y - 250} txt="WHERE IT POINTS" op={1} />
        </g>
        {/* sombra e avião */}
        <g transform={`translate(${x + alt * 0.6},${y + alt}) rotate(${-crab})`} opacity={0.35}>
          <g style={{ filter: 'blur(6px)' }}><AviaoTopo s={1} /></g>
        </g>
        <g transform={`translate(${x},${y}) rotate(${-crab})`}><AviaoTopo s={1 + alt / 900} /></g>
      </g>
      {/* vento (fixo na tela) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const fx = (f * 14 + i * 380) % 1900;
        return <Seta key={i} x={40 + i * 360 + (fx % 120) * 0.0} y={150 + ((f * 6 + i * 50) % 120)} ang={90} len={90} op={vento * 0.9} />;
      })}
      <Rotulo x={80} y={110} txt="CROSSWIND" op={vento} cor={C.azul} />
      <g opacity={lerp(f, [8, 22], [0, 1]) * lerp(f, [60, 70], [1, 0])}>
        <Rotulo x={1840} y={110} txt="B-52 STRATOFORTRESS" op={1} cor={C.texto} sub="185 FT WINGSPAN · 8 ENGINES" ancora="end" />
      </g>
      {/* ângulo */}
      <g opacity={lerp(f, [88, 100], [0, 1]) * lerp(f, [126, 134], [1, 0])}>
        <text x={1840} y={980} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={700} fontSize={84}>{Math.round(crab)}°</text>
        <text x={1840} y={1020} textAnchor="end" fill={C.cinza} fontFamily={MONO} fontSize={22} letterSpacing={3}>OFF THE RUNWAY</text>
      </g>
      <g opacity={Math.min(1, carimbo)} transform={`translate(960,250) scale(${interpolate(carimbo, [0, 1], [1.6, 1])}) rotate(-4)`}>
        <rect x={-300} y={-60} width={600} height={110} rx={10} fill="none" stroke={C.vermelho} strokeWidth={6} />
        <text x={0} y={18} textAnchor="middle" fill={C.vermelho} fontFamily={SANS} fontWeight={900} fontSize={58} letterSpacing={4}>NOT A MISTAKE</text>
      </g>
    </svg>
  );
};

// Cena 2: vista de frente, asa longa demais para inclinar (175 a 300)
const CenaFrente: React.FC<{ f: number }> = ({ f }) => {
  const g = f - 175;
  const dim = lerp(g, [10, 40], [0, 1]);
  const incl = lerp(g, [45, 68], [0, -5.2]) + lerp(g, [92, 112], [0, 5.2]);
  const bate = g >= 66 && g < 100 ? 1 : 0;
  const pulso = spring({ frame: g - 66, fps: 30, config: { damping: 9 } });
  const vento = lerp(g, [30, 45], [0, 1]) * lerp(g, [100, 115], [1, 0]);
  const solo = 820, cx = 960;
  const meia = 600;
  const tipY = 700;
  const ponta = { x: cx - meia * Math.cos((incl * Math.PI) / 180), y: solo - 0 };
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <rect width={1920} height={1080} fill={C.fundo} />
      {Array.from({ length: 24 }, (_, i) => <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={1080} stroke="#fff" strokeOpacity={0.03} />)}
      {Array.from({ length: 14 }, (_, i) => <line key={'h' + i} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke="#fff" strokeOpacity={0.03} />)}
      <line x1={0} y1={solo} x2={1920} y2={solo} stroke={C.linha} strokeWidth={3} />
      <rect x={0} y={solo} width={1920} height={260} fill="#10171f" />
      <g transform={`rotate(${incl} ${cx} ${solo})`}>
        {/* asas com caimento */}
        <path d={`M${cx},612 Q${cx - 300},622 ${cx - meia},${tipY} L${cx - meia},${tipY + 12} Q${cx - 300},636 ${cx},628 Z`} fill={C.aviao} stroke={C.aviaoEsc} strokeWidth={2} />
        <path d={`M${cx},612 Q${cx + 300},622 ${cx + meia},${tipY} L${cx + meia},${tipY + 12} Q${cx + 300},636 ${cx},628 Z`} fill={C.aviao} stroke={C.aviaoEsc} strokeWidth={2} />
        {/* motores pendurados */}
        {[-1, 1].flatMap((sgn) => [190, 360].map((d) => {
          const px = cx + sgn * d, py = 612 + (d / meia) ** 2 * (tipY - 612) + 30;
          return (
            <g key={sgn * d}>
              <line x1={px} y1={py - 30} x2={px} y2={py - 8} stroke={C.aviaoEsc} strokeWidth={6} />
              <ellipse cx={px - 17} cy={py + 8} rx={17} ry={19} fill="#c3c9d1" stroke={C.aviaoEsc} strokeWidth={2} />
              <ellipse cx={px + 17} cy={py + 8} rx={17} ry={19} fill="#c3c9d1" stroke={C.aviaoEsc} strokeWidth={2} />
              <circle cx={px - 17} cy={py + 8} r={8} fill="#2b3440" /><circle cx={px + 17} cy={py + 8} r={8} fill="#2b3440" />
            </g>
          );
        }))}
        {/* rodas de apoio nas pontas */}
        {[-1, 1].map((sgn) => (
          <g key={sgn}>
            <line x1={cx + sgn * (meia - 40)} y1={tipY + 4} x2={cx + sgn * (meia - 40)} y2={solo - 14} stroke={C.aviaoEsc} strokeWidth={5} />
            <circle cx={cx + sgn * (meia - 40)} cy={solo - 12} r={12} fill="#1f262e" stroke={C.aviaoEsc} strokeWidth={2} />
          </g>
        ))}
        {/* fuselagem e trem principal */}
        <line x1={cx - 30} y1={690} x2={cx - 30} y2={solo - 22} stroke={C.aviaoEsc} strokeWidth={8} />
        <line x1={cx + 30} y1={690} x2={cx + 30} y2={solo - 22} stroke={C.aviaoEsc} strokeWidth={8} />
        {[-50, -14, 14, 50].map((d) => <rect key={d} x={cx + d - 14} y={solo - 44} width={28} height={44} rx={8} fill="#1f262e" stroke={C.aviaoEsc} strokeWidth={2} />)}
        <ellipse cx={cx} cy={652} rx={58} ry={66} fill="#e6eaef" stroke={C.aviaoEsc} strokeWidth={2} />
        <path d={`M${cx - 28},620 Q${cx},600 ${cx + 28},620 L${cx + 24},634 Q${cx},622 ${cx - 24},634 Z`} fill="#3a4654" />
        <path d={`M${cx - 6},590 L${cx - 4},380 L${cx + 4},380 L${cx + 6},590 Z`} fill={C.aviao} stroke={C.aviaoEsc} strokeWidth={2} />
      </g>
      {/* cota da envergadura */}
      <g opacity={dim * lerp(g, [40, 50], [1, 0.35])}>
        <line x1={cx - meia * dim} y1={300} x2={cx + meia * dim} y2={300} stroke={C.laranja} strokeWidth={3} />
        <line x1={cx - meia} y1={285} x2={cx - meia} y2={315} stroke={C.laranja} strokeWidth={3} opacity={dim > 0.98 ? 1 : 0} />
        <line x1={cx + meia} y1={285} x2={cx + meia} y2={315} stroke={C.laranja} strokeWidth={3} opacity={dim > 0.98 ? 1 : 0} />
        <text x={cx} y={270} textAnchor="middle" fill={C.laranja} fontFamily={MONO} fontWeight={700} fontSize={44}>185 FT</text>
        <text x={cx} y={355} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={22} letterSpacing={3}>56 METERS, TIP TO TIP</text>
      </g>
      {/* vento */}
      {[0, 1, 2].map((i) => <Seta key={i} x={60 + ((g * 16 + i * 140) % 260)} y={470 + i * 70} ang={0} len={110} op={vento} />)}
      <Rotulo x={60} y={440} txt="CROSSWIND" op={vento} cor={C.azul} />
      {/* batida da ponta */}
      <g opacity={bate}>
        <circle cx={ponta.x + 40} cy={solo - 6} r={30 + pulso * 60} fill="none" stroke={C.vermelho} strokeWidth={5} opacity={1 - pulso * 0.6} />
        <Rotulo x={ponta.x + 40} y={solo + 90} txt="WINGTIP STRIKE" op={1} cor={C.vermelho} />
      </g>
    </svg>
  );
};

// Cena 3: trem de pouso que gira (300 a 450)
const CenaTrem: React.FC<{ f: number }> = ({ f }) => {
  const g = f - 300;
  const ang = lerp(g, [28, 80], [0, 20]);
  const brilho = lerp(g, [8, 24], [0, 1]);
  const scroll = (g * 22) % 200;
  const fim = spring({ frame: g - 92, fps: 30, config: { damping: 13 } });
  const trucks = [[260, -34], [260, 34], [-180, -34], [-180, 34]];
  const zoom = lerp(g, [0, 150], [1.0, 1.12]);
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <rect width={1920} height={1080} fill={C.pista} />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-200 + i * 200 - scroll} y={536} width={110} height={8} fill={C.linha} opacity={0.5} />)}
      <line x1={0} y1={120} x2={1920} y2={120} stroke={C.linha} strokeWidth={5} opacity={0.6} />
      <line x1={0} y1={960} x2={1920} y2={960} stroke={C.linha} strokeWidth={5} opacity={0.6} />
      <g transform={`translate(960,540) scale(${zoom})`}>
        {/* direção do movimento */}
        <Seta x={-760} y={330} ang={0} len={380} op={lerp(g, [40, 60], [0, 1])} cor={C.texto} />
        <Rotulo x={-760} y={300} txt="TRAVEL" op={lerp(g, [40, 60], [0, 1])} cor={C.texto} />
        <g transform={`rotate(${-ang})`}>
          {/* fuselagem grande em corte */}
          <path d="M780,0 C780,-40 730,-62 640,-64 L-700,-56 L-780,-20 L-780,20 L-700,56 L640,64 C730,62 780,40 780,0 Z" fill="#e6eaef" fillOpacity={0.14} stroke={C.aviao} strokeWidth={3} />
          <line x1={-780} y1={0} x2={900} y2={0} stroke={C.laranja} strokeWidth={3} strokeDasharray="16 12" opacity={lerp(g, [30, 45], [0, 1])} />
          <path d="M120,-64 L-200,-560 L-330,-560 L-120,-62 Z M120,64 L-200,560 L-330,560 L-120,62 Z" fill="none" stroke={C.aviaoEsc} strokeWidth={2} strokeDasharray="10 8" opacity={0.22} />
          {trucks.map(([tx, ty]) => (
            <g key={`${tx}${ty}`} transform={`translate(${tx},${ty}) rotate(${ang})`}>
              <rect x={-60} y={-22} width={120} height={44} rx={10} fill="none" stroke={C.laranja} strokeWidth={4} opacity={brilho} style={{ filter: `drop-shadow(0 0 ${12 * brilho}px ${C.laranja})` }} />
              <rect x={-40} y={-19} width={80} height={16} rx={7} fill="#1b2128" stroke={C.aviao} strokeWidth={2} />
              <rect x={-40} y={3} width={80} height={16} rx={7} fill="#1b2128" stroke={C.aviao} strokeWidth={2} />
              <line x1={0} y1={-24} x2={0} y2={24} stroke={C.aviao} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* arco do ângulo */}
        <g opacity={lerp(g, [30, 45], [0, 1])}>
          <line x1={0} y1={0} x2={880} y2={0} stroke={C.texto} strokeWidth={3} strokeDasharray="16 12" />
          <path d={`M520,0 A520,520 0 0 0 ${520 * Math.cos((ang * Math.PI) / 180)},${-520 * Math.sin((ang * Math.PI) / 180)}`} fill="none" stroke={C.laranja} strokeWidth={5} />
        </g>
      </g>
      <rect x={50} y={40} width={620} height={110} rx={10} fill={C.pista} opacity={0.92 * brilho} />
      <Rotulo x={80} y={90} txt="CROSSWIND CRAB SYSTEM" op={brilho} sub="ALL 4 MAIN GEAR TRUCKS STEER" />
      <g opacity={lerp(g, [32, 44], [0, 1])} transform={`translate(1840,${1010 - fim * 10}) scale(${1 + fim * 0.25})`}>
        <text x={0} y={0} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={120} style={{ transformOrigin: 'right bottom' }}>{Math.round(ang)}°</text>
      </g>
    </svg>
  );
};

type Marca = { t: number; d: number; txt: string };
const DESTAQUE = ['sideways.', 'mistake.', 'so', 'long,', 'wheels', 'turn', 'twenty', 'degrees.'];

const Legenda: React.FC<{ f: number; marcas: Marca[] }> = ({ f, marcas }) => {
  const t = f / 30;
  const m = marcas.find((x) => t >= x.t - 0.05 && t < x.t + x.d + 0.15);
  if (!m) return null;
  const palavras = m.txt.split(' ');
  const prog = (t - m.t) / m.d;
  return (
    <div style={{ position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: -0.5, textShadow: '0 4px 18px rgba(0,0,0,.85)' }}>
      {palavras.map((p, i) => {
        const on = prog >= i / palavras.length - 0.02;
        const dest = DESTAQUE.includes(p);
        return <span key={i} style={{ color: dest ? C.laranja : C.texto, opacity: on ? 1 : 0.25, marginRight: 14 }}>{p}</span>;
      })}
    </div>
  );
};

export const B52: React.FC<{ marcas: Marca[] }> = ({ marcas }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t1 = lerp(f, [168, 182], [0, 1]);
  const t2 = lerp(f, [292, 306], [0, 1]);
  return (
    <AbsoluteFill style={{ background: C.fundo }}>
      {f < 184 && <AbsoluteFill style={{ opacity: 1 - t1, transform: `scale(${1 + t1 * 0.08})` }}><CenaPista f={f} /></AbsoluteFill>}
      {f >= 166 && f < 308 && <AbsoluteFill style={{ opacity: Math.min(t1, 1 - t2), transform: `scale(${1.06 - t1 * 0.06})` }}><CenaFrente f={f} /></AbsoluteFill>}
      {f >= 290 && <AbsoluteFill style={{ opacity: t2, transform: `scale(${1.06 - t2 * 0.06})` }}><CenaTrem f={f} /></AbsoluteFill>}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: 'overlay' }}><Img src={staticFile(`fx/grain${f % 4}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
      <Legenda f={f} marcas={marcas} />
      <AbsoluteFill style={{ background: '#000', opacity: lerp(f, [0, 8], [1, 0]) + lerp(f, [durationInFrames - 10, durationInFrames], [0, 1]) }} />
      <Audio src={staticFile('b52/voz.wav')} />
    </AbsoluteFill>
  );
};
