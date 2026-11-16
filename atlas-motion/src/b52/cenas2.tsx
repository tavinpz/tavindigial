import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, spring } from 'remotion';
import { B52Topo, C, Carimbo, CenaProps, Grade, Item, JatoTopo, L, MONO, pop, rad, Rot, SANS, Seta, Vento, janela } from './lib';
import { Pista3D } from './cenas1';

// ---------- 6. onde ficam as rodas ----------
const Truck: React.FC<{ x: number; y: number; ang?: number; op?: number; s?: number }> = ({ x, y, ang = 0, op = 1, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`} opacity={op}>
    <rect x={-16} y={-13} width={32} height={26} rx={6} fill="rgba(255,138,42,.18)" stroke={C.laranja} strokeWidth={2.2} />
    <rect x={-12} y={-10} width={24} height={7} rx={3} fill="#141920" stroke="#dfe5eb" strokeWidth={1} />
    <rect x={-12} y={3} width={24} height={7} rx={3} fill="#141920" stroke="#dfe5eb" strokeWidth={1} />
  </g>
);

export const CenaLayout: React.FC<CenaProps> = ({ g, D, ts }) => {
  const esq = L(g, [0, 20], [0, 1]);
  const dir = L(g, [ts[3] - 15, ts[3] + 5], [0, 1]);
  const triA = janela(g, ts[1] + 20, D + 30);
  const bomba = janela(g, ts[3] + 20, D + 30);
  const fantasma = janela(g, ts[3] + 40, ts[4] + 10);
  const pf = (i: number) => pop(g, ts[4] + 30 + i * 14);
  const outr = janela(g, ts[5], D + 30);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        <line x1={960} y1={140} x2={960} y2={1000} stroke="#fff" strokeOpacity={0.08} strokeWidth={2} />
        {/* avião comercial */}
        <g opacity={esq} transform="translate(480,520) rotate(-90) scale(1.7)">
          <JatoTopo id="lj" />
          <g opacity={triA}>
            <path d="M107,0 L-5,-26 L-5,26 Z" fill="rgba(74,222,128,.12)" stroke={C.verde} strokeWidth={2} strokeDasharray="6 5" />
          </g>
          <Truck x={107} y={0} s={0.7} op={L(g, [ts[1], ts[1] + 10], [0, 1])} />
          <Truck x={-5} y={-26} op={L(g, [ts[1] + 6, ts[1] + 16], [0, 1])} />
          <Truck x={-5} y={26} op={L(g, [ts[1] + 12, ts[1] + 22], [0, 1])} />
        </g>
        <Rot x={480} y={150} txt="AIRLINER" cor={C.texto} a="middle" tam={36} sub="TRICYCLE GEAR" />
        <g opacity={janela(g, ts[2], D + 30)}><Rot x={480} y={880} txt="WIDE STANCE = STABLE" cor={C.verde} a="middle" tam={30} /></g>
        {/* B-52 */}
        <g opacity={dir} transform="translate(1440,520) rotate(-90) scale(1.7)">
          <B52Topo id="lb" />
          <g opacity={bomba}>
            <rect x={-38} y={-8} width={98} height={16} rx={3} fill="rgba(255,77,77,.25)" stroke={C.vermelho} strokeWidth={1.6} />
          </g>
          <g opacity={fantasma}>
            {[-26, 26].map((y) => <g key={y} transform={`translate(10,${y})`}><circle r={11} fill="none" stroke={C.vermelho} strokeWidth={1.6} strokeDasharray="3 3" /><path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke={C.vermelho} strokeWidth={2} /></g>)}
          </g>
          {[[78, -4], [78, 4], [-50, -4], [-50, 4]].map(([x, y], i) => <Truck key={i} x={x} y={y} s={0.75} op={pf(i)} />)}
          <g opacity={outr}>
            {[-140, 140].map((y) => <g key={y}><Truck x={-55} y={y} s={0.45} /><circle cx={-55} cy={y} r={16 + 3 * Math.sin(g / 4)} fill="none" stroke={C.laranja} strokeWidth={1.6} /></g>)}
          </g>
        </g>
        <g opacity={dir}><Rot x={1440} y={150} txt="B-52" cor={C.texto} a="middle" tam={36} sub={g >= ts[4] ? 'BICYCLE GEAR' : 'THIN WINGS'} /></g>
        <g opacity={bomba}><Rot x={1440 + 150} y={480} txt="BOMB BAY" cor={C.vermelho} tam={28} /></g>
        <g opacity={janela(g, ts[4] + 60, D + 30)}><Rot x={1440} y={880} txt="4 TRUCKS × 2 WHEELS, IN A LINE" cor={C.laranja} a="middle" tam={30} /></g>
        <g opacity={outr}><Rot x={1440} y={925} txt="+ OUTRIGGERS NEAR THE WINGTIPS" cor={C.cinza} a="middle" tam={24} /></g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 7. pousa e decola reto (vista lateral) ----------
const JatoLado: React.FC<{ cx: number; solo: number; pitch: number }> = ({ cx, solo, pitch }) => (
  <g transform={`rotate(${-pitch} ${cx - 20} ${solo})`}>
    <path d={`M${cx - 300},${solo - 120} L${cx + 230},${solo - 120} Q${cx + 300},${solo - 118} ${cx + 310},${solo - 92} Q${cx + 300},${solo - 66} ${cx + 230},${solo - 62} L${cx - 260},${solo - 62} Z`} fill="#dfe5eb" stroke="#7d8792" strokeWidth={2} />
    <path d={`M${cx - 300},${solo - 120} L${cx - 330},${solo - 250} L${cx - 280},${solo - 250} L${cx - 200},${solo - 120} Z`} fill="#c9d0d8" stroke="#7d8792" strokeWidth={2} />
    <ellipse cx={cx - 10} cy={solo - 66} rx={110} ry={9} fill="#b3bcc6" />
    <rect x={cx - 10} y={solo - 72} width={70} height={30} rx={14} fill="#c9d0d8" stroke="#7d8792" strokeWidth={1.5} />
    <path d={`M${cx + 268},${solo - 112} L${cx + 292},${solo - 106} L${cx + 292},${solo - 98} L${cx + 262},${solo - 100} Z`} fill="#26313d" />
    <line x1={cx + 230} y1={solo - 62} x2={cx + 230} y2={solo - 16} stroke="#8b95a1" strokeWidth={6} /><circle cx={cx + 230} cy={solo - 12} r={12} fill="#14191f" />
    <line x1={cx - 20} y1={solo - 62} x2={cx - 20} y2={solo - 20} stroke="#8b95a1" strokeWidth={8} /><circle cx={cx - 20} cy={solo - 18} r={18} fill="#14191f" />
  </g>
);
const B52Lado: React.FC<{ cx: number; solo: number; pitch: number; alt?: number; asa?: number }> = ({ cx, solo, pitch, alt = 0, asa = 0 }) => (
  <g transform={`translate(0 ${-alt}) rotate(${-pitch} ${cx} ${solo})`}>
    <path d={`M${cx - 330},${solo - 110} L${cx + 250},${solo - 112} Q${cx + 320},${solo - 110} ${cx + 330},${solo - 86} Q${cx + 320},${solo - 60} ${cx + 250},${solo - 58} L${cx - 300},${solo - 66} Z`} fill="#dfe5eb" stroke="#7d8792" strokeWidth={2} />
    <path d={`M${cx - 330},${solo - 110} L${cx - 320},${solo - 300} L${cx - 270},${solo - 300} L${cx - 190},${solo - 110} Z`} fill="#c9d0d8" stroke="#7d8792" strokeWidth={2} />
    <g transform={`rotate(${-asa} ${cx + 40} ${solo - 110})`}>
      <path d={`M${cx - 80},${solo - 106} L${cx + 130},${solo - 116} L${cx + 136},${solo - 108} L${cx - 80},${solo - 100} Z`} fill="#b3bcc6" stroke="#7d8792" strokeWidth={1.5} />
    </g>
    {[60, -40].map((o) => <g key={o}><line x1={cx + o + 30} y1={solo - 108} x2={cx + o + 30} y2={solo - 90} stroke="#8b95a1" strokeWidth={5} /><rect x={cx + o} y={solo - 92} width={90} height={22} rx={10} fill="#8f99a5" stroke="#4d5660" strokeWidth={2} /></g>)}
    <path d={`M${cx + 290},${solo - 104} L${cx + 314},${solo - 98} L${cx + 314},${solo - 90} L${cx + 284},${solo - 92} Z`} fill="#26313d" />
    {[150, -130].map((o) => <g key={o}><line x1={cx + o} y1={solo - 62} x2={cx + o} y2={solo - 20} stroke="#8b95a1" strokeWidth={8} /><circle cx={cx + o - 12} cy={solo - 16} r={16} fill="#14191f" /><circle cx={cx + o + 12} cy={solo - 16} r={16} fill="#14191f" /></g>)}
  </g>
);

export const CenaAtitude: React.FC<CenaProps> = ({ g, D, ts }) => {
  const rot = L(g, [ts[1] + 10, ts[1] + 50], [0, 11]);
  const altJ = L(g, [ts[1] + 50, ts[2] + 30], [0, 120]);
  const tenta = g >= ts[1] + 10 && g < ts[2] ? Math.sin(Math.min(1, (g - ts[1] - 10) / 30) * Math.PI) * 1.2 : 0;
  const altB = L(g, [ts[2] + 10, ts[2] + 60], [0, 120]);
  const asa = L(g, [ts[3] + 10, ts[3] + 40], [0, 6]);
  const naso = g >= ts[3] ? L(g, [ts[3] + 50, ts[3] + 80], [0, -1.2]) : 0;
  const baixa = L(g, [ts[3] - 10, ts[3] + 20], [0, 1]);
  const scroll = (g * 14) % 200;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        <g opacity={1 - baixa}>
          <line x1={0} y1={470} x2={1920} y2={470} stroke="#3c4855" strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 200 - scroll} y={472} width={100} height={4} fill="#3c4855" />)}
          <g transform={`translate(0 ${-altJ})`}><JatoLado cx={900} solo={470} pitch={rot} /></g>
          <Rot x={70} y={110} txt="AIRLINER" cor={C.texto} tam={34} sub="ROTATES NOSE UP" />
          <g opacity={L(g, [ts[1] + 30, ts[1] + 45], [0, 1])}><path d={`M${1180},${470} A280,280 0 0 0 ${1180 - 280 + 280 * Math.cos(rad(11))},${470 - 280 * Math.sin(rad(11))}`} stroke={C.verde} strokeWidth={4} fill="none" /><Rot x={1300} y={440} txt="~10°" cor={C.verde} tam={34} /></g>
        </g>
        <g transform={`translate(0 ${-baixa * 360})`}>
          <line x1={0} y1={920} x2={1920} y2={920} stroke="#3c4855" strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 200 - scroll} y={922} width={100} height={4} fill="#3c4855" />)}
          <B52Lado cx={920} solo={920} pitch={tenta + naso} alt={altB} asa={asa} />
          <Rot x={70} y={600} txt="B-52" cor={C.texto} tam={34} sub={g >= ts[2] ? 'LIFTS OFF FLAT' : 'CAN’T ROTATE'} />
          {g >= ts[1] + 20 && g < ts[2] + 10 && <g opacity={pop(g, ts[1] + 20)}><Item x={1300} y={640} txt="NO ROOM TO PITCH UP" ok={false} op={1} tam={34} /></g>}
          <g opacity={janela(g, ts[3] + 30, D + 30)}>
            <line x1={880} y1={920 - 110 - altB} x2={1180} y2={920 - 110 - altB} stroke={C.cinza} strokeWidth={2} strokeDasharray="10 8" />
            <line x1={880} y1={920 - 110 - altB} x2={880 + 300 * Math.cos(rad(asa))} y2={920 - 110 - altB - 300 * Math.sin(rad(asa))} stroke={C.laranja} strokeWidth={3} strokeDasharray="10 8" />
            <Rot x={1200} y={920 - 140 - altB} txt="WING SET AT A STEEP ANGLE" cor={C.laranja} tam={28} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 8. o problema todo junto ----------
export const CenaErro: React.FC<CenaProps> = ({ g, D, ts }) => {
  const toque = ts[3] + 10;
  const x = interpolate(g, [0, D], [520, 1300]);
  const crab = 18;
  const tremor = g >= toque && g < toque + 40 ? (random(`e${g}`) - 0.5) * 18 * (1 - (g - toque) / 40) : 0;
  const forca = L(g, [toque, toque + 15], [0, 1]);
  return (
    <AbsoluteFill style={{ transform: `translate(${tremor}px, ${tremor * 0.5}px)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <rect width={1920} height={1080} fill={C.terreno} />
        <rect x={0} y={400} width={1920} height={280} fill="#2a2f36" />
        <line x1={0} y1={410} x2={1920} y2={410} stroke={C.linha} strokeWidth={4} /><line x1={0} y1={670} x2={1920} y2={670} stroke={C.linha} strokeWidth={4} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 130} y={537} width={70} height={6} fill={C.linha} opacity={0.8} />)}
        {g >= toque && [-10, 10].map((dy) => <path key={dy} d={`M${x - 320},${540 + dy + 60} L${x - 60},${540 + dy}`} stroke="#0e1114" strokeWidth={9} opacity={0.7 * forca} />)}
        <g transform={`translate(${x},540) rotate(${-crab}) scale(${L(g, [0, toque], [1.9, 1.6])})`}>
          <B52Topo id="er" mostraTrem={1} trem={0} />
        </g>
        <g opacity={forca}>
          {[[-1, 0], [1, 0]].map(([s], i) => <Seta key={i} x1={x + s * 70} y1={540 + 30} x2={x + s * 70} y2={540 + 170} cor={C.vermelho} w={9} />)}
          <Rot x={x} y={800} txt="SIDE LOAD" cor={C.vermelho} a="middle" tam={52} />
        </g>
      </svg>
      <Vento f={g} op={0.8} ang={98} n={30} />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={janela(g, ts[2] - 5, ts[3] + 5)}>
          <rect x={60} y={80} width={760} height={210} rx={16} fill="rgba(8,12,18,.88)" />
          <Item x={100} y={160} txt="LOWER A WING" ok={false} op={pop(g, ts[2] + 4)} tam={40} />
          <Item x={100} y={240} txt="KICK THE NOSE STRAIGHT" ok={false} op={pop(g, ts[2] + 50)} tam={40} />
        </g>
        <g opacity={janela(g, toque - 5, D + 30)}><Rot x={70} y={110} txt="WHEELS LOCKED STRAIGHT" cor={C.texto} tam={34} sub="TOUCHDOWN AT 100+ MPH" /></g>
        <g opacity={janela(g, 0, ts[2] - 5)}><Rot x={70} y={110} txt="HEAVY BOMBER · STRONG CROSSWIND" cor={C.texto} tam={34} /></g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 9. a solução: o controle na cabine ----------
export const CenaCabine: React.FC<CenaProps> = ({ g, D, ts }) => {
  const rumo = L(g, [ts[3] + 10, ts[3] + 60], [250, 270]);
  const cx = 1240, cy = 560, R = 300;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade fundo="#0a0f15" />
        <g opacity={janela(g, 0, ts[1] - 5)}>
          <text x={960} y={560} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={96}>BRILLIANTLY <tspan fill={C.laranja}>SIMPLE</tspan></text>
        </g>
        <g opacity={janela(g, ts[1] - 5, ts[2] - 5)}>
          <text x={960} y={520} textAnchor="middle" fill={C.cinza} fontFamily={SANS} fontWeight={800} fontSize={54}>CAN'T LINE UP THE AIRPLANE?</text>
          <text x={960} y={620} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={84}>LINE UP THE <tspan fill={C.laranja}>WHEELS</tspan></text>
        </g>
        <g opacity={janela(g, ts[2] - 5, D + 30)}>
          <Rot x={120} y={200} txt="CROSSWIND CRAB SYSTEM" tam={44} sub="SET BEFORE LANDING" />
          <g opacity={L(g, [ts[3] - 5, ts[3] + 10], [0, 1])}>
            <circle cx={cx} cy={cy} r={R + 30} fill="#121921" stroke="#2c3743" strokeWidth={6} />
            <g transform={`rotate(${-rumo} ${cx} ${cy})`}>
              {Array.from({ length: 72 }, (_, i) => {
                const a = rad(i * 5 - 90), l = i % 2 ? 14 : 30;
                return <line key={i} x1={cx + Math.cos(a) * R} y1={cy + Math.sin(a) * R} x2={cx + Math.cos(a) * (R - l)} y2={cy + Math.sin(a) * (R - l)} stroke={C.texto} strokeWidth={i % 6 ? 2 : 4} opacity={0.8} />;
              })}
              {Array.from({ length: 12 }, (_, i) => {
                const a = rad(i * 30 - 90); const n = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'][i];
                return <text key={i} x={cx + Math.cos(a) * (R - 64)} y={cy + Math.sin(a) * (R - 64) + 14} textAnchor="middle" fill={C.texto} fontFamily={MONO} fontWeight={700} fontSize={38} transform={`rotate(${i * 30} ${cx + Math.cos(a) * (R - 64)} ${cy + Math.sin(a) * (R - 64)})`}>{n}</text>;
              })}
            </g>
            <path d={`M${cx},${cy - R - 40} L${cx - 22},${cy - R - 80} L${cx + 22},${cy - R - 80} Z`} fill={C.laranja} />
            <circle cx={cx} cy={cy} r={60} fill="#1b242e" stroke="#3a4654" strokeWidth={4} />
            <rect x={120} y={430} width={520} height={220} rx={16} fill="#0f151c" stroke="#2c3743" strokeWidth={3} />
            <text x={150} y={490} fill={C.cinza} fontFamily={MONO} fontSize={28} letterSpacing={3}>RUNWAY HEADING</text>
            <text x={150} y={610} fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={120}>{String(Math.round(rumo)).padStart(3, '0')}°</text>
            <text x={120} y={720} fill={C.cinza} fontFamily={MONO} fontSize={22} letterSpacing={2}>ILLUSTRATION</text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 10. o trem gira (reaproveita a v2) ----------
export const CenaTrem: React.FC<CenaProps> = ({ g, D, ts }) => {
  const ang = L(g, [16, 70], [0, 20]);
  const brilho = L(g, [4, 18], [0, 1]);
  const scroll = (g * 26) % 220;
  const bate = spring({ frame: g - 72, fps: 30, config: { damping: 10 } });
  const trucks = [[260, -34], [260, 34], [-180, -34], [-180, 34]];
  const tilt = L(g, [0, D], [30, 40]);
  const zoom = L(g, [0, D], [0.98, 1.12]);
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
            {Array.from({ length: 80 }, (_, i) => <rect key={i} x={((random(`x${i}`) * 3400 - scroll) % 3400) - 1700} y={random(`y${i}`) * 1200 - 600} width={30 + random(`k${i}`) * 90} height={2} fill="#000" opacity={0.2} />)}
            {Array.from({ length: 18 }, (_, i) => <rect key={i} x={-1700 + i * 220 - scroll} y={-5} width={120} height={10} fill={C.linha} opacity={0.55} />)}
            <line x1={-1600} y1={-600} x2={1600} y2={-600} stroke={C.linha} strokeWidth={6} opacity={0.6} />
            <line x1={-1600} y1={600} x2={1600} y2={600} stroke={C.linha} strokeWidth={6} opacity={0.6} />
            {trucks.map(([tx, ty], i) => {
              const py = tx * Math.sin(rad(-ang)) + ty * Math.cos(rad(-ang)), px = tx * Math.cos(rad(-ang)) - ty * Math.sin(rad(-ang));
              return <g key={i} opacity={L(g, [30, 60], [0, 0.55])}><rect x={-1600} y={py - 18} width={1600 + px - 40} height={10} fill="#11151a" /><rect x={-1600} y={py + 6} width={1600 + px - 40} height={10} fill="#11151a" /></g>;
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
        <rect x={50} y={44} width={720} height={120} rx={12} fill="#0c1117" opacity={0.85 * brilho} />
        <Rot x={80} y={100} txt="ALL 4 MAIN GEAR TRUCKS" op={brilho} tam={36} sub="SWIVEL UP TO 20° EITHER WAY" />
        <g opacity={janela(g, ts[1], D + 30)}>
          <rect x={1170} y={44} width={700} height={170} rx={12} fill="#0c1117" opacity={0.85} />
          <Rot x={1200} y={105} txt="FUSELAGE → INTO THE WIND" tam={30} />
          <Rot x={1200} y={170} txt="WHEELS → DOWN THE RUNWAY" cor={C.texto} tam={30} />
        </g>
        <g opacity={janela(g, ts[2], D + 30)}><Item x={80} y={1010} txt="WINGS LEVEL" ok={true} op={pop(g, ts[2] + 10)} tam={40} /></g>
        <g opacity={L(g, [18, 30], [0, 1])} transform={`translate(1850,1000) scale(${1 + Math.max(0, Math.min(1, bate)) * 0.18})`}>
          <text x={0} y={0} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={150}>{Math.round(ang)}°</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 11. rolando de lado, decolagem e o caso das luzes ----------
export const CenaRolagem: React.FC<CenaProps> = ({ g, D, ts }) => {
  const fase4 = g >= ts[4];
  const x = fase4 ? interpolate(g, [ts[4], D], [900, 1700]) : interpolate(g, [0, ts[4]], [300, 3200]);
  const decola = L(g, [ts[2] + 30, ts[3]], [0, 200], Easing.in(Easing.quad));
  const alt = fase4 ? 0 : decola;
  const tilt = fase4 ? 50 : L(g, [0, ts[2], ts[3]], [66, 62, 52]);
  const rz = fase4 ? 8 : L(g, [0, ts[3]], [-12, 6]);
  const secreto = janela(g, ts[3], ts[4]);
  const quebra = (i: number) => {
    const lx = 200 + i * 120;
    if (!fase4) return 0.7;
    return lx < x - 60 && lx > 900 ? 0.05 : 0.7;
  };
  return (
    <AbsoluteFill>
      <Pista3D f={g} x={x} alt={alt} crab={18} tilt={tilt} rz={rz} zoom={fase4 ? 1.5 : 1.2} camX={(x - 960) * 0.95} camY={fase4 ? 130 : 0} bordaLuzes={quebra}
        mundo={<>
          <g opacity={janela(g, ts[1], ts[2])}>
            <line x1={x} y1={540} x2={x + 700 * Math.cos(rad(-18))} y2={540 + 700 * Math.sin(rad(-18))} stroke={C.laranja} strokeWidth={4} strokeDasharray="18 12" />
            <circle cx={x + 700 * Math.cos(rad(-18))} cy={540 + 700 * Math.sin(rad(-18))} r={26} fill="none" stroke={C.laranja} strokeWidth={4} />
            <Rot x={x + 700 * Math.cos(rad(-18))} y={540 + 700 * Math.sin(rad(-18)) - 44} txt="GRASS" a="middle" tam={34} />
          </g>
          {fase4 && Array.from({ length: 6 }, (_, k) => {
            const lx = x - 80 - k * 120, gg = g - ts[4] - 20;
            return gg > 0 ? <circle key={k} cx={lx - (lx % 120) + 80} cy={676} r={18 + (gg % 12) * 2} fill="none" stroke={C.vermelho} strokeWidth={3} opacity={Math.max(0, 1 - (gg % 12) / 12)} /> : null;
          })}
        </>}
        tela={<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <g opacity={janela(g, ts[2], ts[3])}><Rot x={70} y={110} txt="TAKEOFF: STILL CRABBED" cor={C.texto} tam={36} /></g>
          <rect width={1920} height={1080} fill="#000" opacity={secreto * 0.6} />
          <g opacity={secreto}>
            <rect x={560} y={330} width={800} height={420} rx={8} fill="#e9e4d6" transform="rotate(-2 960 540)" />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={620} y={420 + i * 44} width={500 + random(`d${i}`) * 160} height={18} fill="#1b1b1b" opacity={0.85} transform="rotate(-2 960 540)" />)}
          </g>
          <Carimbo g={g} ini={ts[3] + 12} txt="CLASSIFIED" y={540} fim={ts[4]} tam={80} />
          <g opacity={janela(g, ts[4], D + 30)}><Rot x={70} y={110} txt="AIR SHOW, ENGLAND" cor={C.texto} tam={36} sub="WING OVER THE RUNWAY EDGE (REPORTED)" /></g>
        </svg>} />
    </AbsoluteFill>
  );
};

// ---------- 12. o C-5 ----------
const C5Topo: React.FC = () => (
  <g>
    <path d="M30,-16 L-60,-150 L-82,-150 L-24,-16 Z M30,16 L-60,150 L-82,150 L-24,16 Z" fill="#cfd6de" stroke="#7d8792" strokeWidth={1.2} />
    {[-55, -105, 55, 105].map((y) => <rect key={y} x={8 - Math.abs(y) * 0.6} y={y - 7} width={38} height={14} rx={6} fill="#e6eaef" stroke="#7d8792" strokeWidth={0.8} />)}
    <path d="M150,0 C150,-14 138,-20 110,-21 L-130,-17 L-160,-6 L-160,6 L-130,17 L110,21 C138,20 150,14 150,0 Z" fill="#eef1f4" stroke="#7d8792" strokeWidth={1.2} />
    <path d="M-140,-5 L-175,-60 L-188,-60 L-165,-5 Z M-140,5 L-175,60 L-188,60 L-165,5 Z" fill="#cfd6de" stroke="#7d8792" strokeWidth={1.2} />
    <path d="M142,-6 L130,-9 L130,9 L142,6 Z" fill="#26313d" />
  </g>
);
export const CenaC5: React.FC<CenaProps> = ({ g, D, ts }) => {
  const a1 = L(g, [10, 50], [0, 12]);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        <g transform={`translate(520,560) rotate(${-90 - a1}) scale(1.6)`}><C5Topo /></g>
        <g transform={`translate(1400,560) rotate(${-90 - a1}) scale(1.4)`} opacity={L(g, [ts[2] - 10, ts[2] + 10], [0.25, 1])}><B52Topo id="c5b" /></g>
        <Rot x={520} y={150} txt="C-5A GALAXY" cor={C.texto} a="middle" tam={38} sub="CROSSWIND GEAR POSITIONING" />
        <Rot x={1400} y={150} txt="B-52" cor={C.texto} a="middle" tam={38} sub="CROSSWIND CRAB SYSTEM" />
        <g opacity={janela(g, ts[2], D + 30)}>
          <Item x={360} y={890} txt="LATER REMOVED" ok={false} op={pop(g, ts[2] + 4)} tam={40} />
          <Item x={1240} y={890} txt="STILL FLYING WITH IT" ok={true} op={pop(g, ts[2] + 40)} tam={40} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 13. linha do tempo ----------
export const CenaLinha: React.FC<CenaProps> = ({ g, D, ts }) => {
  const x0 = 200, x1 = 1720, a0 = 1950, a1 = 2060;
  const X = (a: number) => x0 + ((a - a0) / (a1 - a0)) * (x1 - x0);
  const ano = Math.round(L(g, [ts[1], ts[2] + 60], [1950, 2050], Easing.inOut(Easing.quad)));
  const marcos = [
    { a: 1952, t: 'FIRST FLIGHT', ini: ts[1] },
    { a: 1955, t: 'ENTERS SERVICE', ini: ts[1] + 30 },
    { a: 2026, t: 'TODAY', ini: ts[2] },
    { a: 2050, t: 'B-52J, NEW ENGINES', ini: ts[2] + 40 },
  ];
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        <line x1={x0} y1={620} x2={x1} y2={620} stroke="#2c3743" strokeWidth={8} strokeLinecap="round" />
        <line x1={x0} y1={620} x2={X(Math.max(1950, Math.min(ano, 2058)))} y2={620} stroke={C.laranja} strokeWidth={8} strokeLinecap="round" />
        {[1950, 1970, 1990, 2010, 2030, 2050].map((a) => <g key={a}><line x1={X(a)} y1={605} x2={X(a)} y2={635} stroke="#3a4654" strokeWidth={3} /><text x={X(a)} y={680} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={24}>{a}</text></g>)}
        {marcos.map((m, i) => {
          const p = pop(g, m.ini);
          return <g key={m.a} opacity={p} transform={`translate(${X(m.a)},620)`}>
            <circle r={14} fill={C.laranja} />
            <line x1={0} y1={-20} x2={0} y2={i % 2 ? -190 : -110} stroke={C.laranja} strokeWidth={2} />
            <text x={m.a === 1952 ? -12 : m.a === 1955 ? 12 : 0} y={i % 2 ? -205 : -125} textAnchor={m.a === 1952 ? 'end' : m.a === 1955 ? 'start' : 'middle'} fill={C.texto} fontFamily={MONO} fontWeight={700} fontSize={28}>{m.a === 2050 ? '2050s' : m.a}</text>
            <text x={m.a === 1952 ? -12 : m.a === 1955 ? 12 : 0} y={i % 2 ? -238 : -158} textAnchor={m.a === 1952 ? 'end' : m.a === 1955 ? 'start' : 'middle'} fill={C.cinza} fontFamily={MONO} fontSize={22} letterSpacing={2}>{m.t}</text>
          </g>;
        })}
        <text x={960} y={260} textAnchor="middle" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={140} opacity={L(g, [ts[1] - 10, ts[1] + 5], [0, 1])}>{ano >= 2050 ? '2050s' : ano}</text>
        <g opacity={janela(g, ts[3], D + 30)}>
          <rect x={560} y={780} width={800} height={150} rx={16} fill="rgba(8,12,18,.88)" stroke={C.laranja} strokeWidth={2} />
          <text x={960} y={880} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={76}>~100 YEARS</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 14. fim ----------
const SR71: React.FC = () => (
  <g>
    <path d="M230,0 L150,-6 L60,-14 L10,-22 L-60,-90 L-150,-96 L-150,96 L-60,90 L10,22 L60,14 L150,6 Z" fill="#1c2026" stroke="#5a636e" strokeWidth={2} strokeLinejoin="round" />
    {[-48, 48].map((y) => <g key={y}><rect x={-170} y={y - 12} width={210} height={24} rx={12} fill="#262b32" stroke="#5a636e" strokeWidth={1.5} /><path d={`M40,${y - 12} L70,${y} L40,${y + 12} Z`} fill="#3a424c" /></g>)}
    {[-48, 48].map((y) => <path key={'f' + y} d={`M-110,${y} L-160,${y + Math.sign(y) * 26} L-172,${y + Math.sign(y) * 26} L-140,${y}`} fill="#2e343c" stroke="#5a636e" strokeWidth={1.5} />)}
    <path d="M150,-4 L120,-5 L120,5 L150,4 Z" fill="#45505c" />
  </g>
);
export const CenaFinal: React.FC<CenaProps> = ({ g, D, ts }) => {
  const fimTela = ts[2];
  const card = L(g, [fimTela, fimTela + 20], [0, 1]);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        <g opacity={1 - card * 0.85} transform={`translate(${960 + g * 0.6},540) rotate(-18) scale(2.2)`}><B52Topo id="fn" /></g>
        <g opacity={janela(g, ts[1], fimTela)}>
          <text x={960} y={900} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={70}>EXACTLY AS <tspan fill={C.laranja}>DESIGNED</tspan></text>
        </g>
        <g opacity={card}>
          <rect x={150} y={250} width={900} height={560} rx={22} fill="#0f151c" stroke={C.laranja} strokeWidth={3} />
          <text x={190} y={320} fill={C.laranja} fontFamily={MONO} fontSize={28} letterSpacing={6}>NEXT</text>
          <g transform="translate(600,520) rotate(-10) scale(1.5)"><SR71 /></g>
          <text x={190} y={760} fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={46}>WHY THE SR-71 LEAKED FUEL</text>
          <rect x={1190} y={330} width={560} height={400} rx={22} fill="#0f151c" stroke="#2c3743" strokeWidth={3} />
          <text x={1470} y={520} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={56}>CROSSWIND</text>
          <text x={1470} y={580} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={24} letterSpacing={3}>SUBSCRIBE FOR MORE</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
