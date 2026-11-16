import React from 'react';
import { AbsoluteFill, Easing, interpolate, random } from 'remotion';
import { B52Frente, B52Topo, C, Carimbo, CenaProps, Grade, Item, JatoFrente, JatoTopo, L, MONO, pop, rad, Rot, SANS, Seta, Vento, janela } from './lib';

// ---------- pista em 3D (reutilizada em várias cenas) ----------
type PistaP = {
  f: number; x: number; alt: number; crab: number; tilt: number; rz: number; zoom: number; camX: number; camY?: number;
  fumaca?: number | null; mundo?: React.ReactNode; tela?: React.ReactNode; tremor?: number; aviao?: 'b52' | 'jato'; bordaLuzes?: (i: number) => number;
};
export const Pista3D: React.FC<PistaP> = ({ f, x, alt, crab, tilt, rz, zoom, camX, camY = 0, fumaca = null, mundo, tela, tremor = 0, aviao = 'b52', bordaLuzes }) => {
  const y = 540;
  const pp = (lx: number, ly: number) => ({ x: x + lx * Math.cos(rad(-crab)) - ly * Math.sin(rad(-crab)), y: y + lx * Math.sin(rad(-crab)) + ly * Math.cos(rad(-crab)) });
  const rodas = [pp(40, -12), pp(40, 12), pp(-40, -12), pp(-40, 12)];
  const W = 9000, H = 2600, OX = -1600, OY = -760;
  const Av = aviao === 'b52' ? B52Topo : JatoTopo;
  return (
    <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: '50% 30%', transform: `translateY(${tremor}px)`, background: C.terreno }}>
      <div style={{ position: 'absolute', width: 1920, height: 1080, transformStyle: 'preserve-3d', transformOrigin: '50% 50%', transform: `rotateX(${tilt}deg) rotateZ(${rz}deg) scale(${zoom}) translate(${-camX}px, ${-camY}px)` }}>
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
          {Array.from({ length: 90 }, (_, i) => <rect key={i} x={150 + i * 90} y={410 + random(`m${i}`) * 260} width={40 + random(`n${i}`) * 80} height={2} fill="#000" opacity={0.18} />)}
          <line x1={150} y1={420} x2={W} y2={420} stroke={C.linha} strokeWidth={5} />
          <line x1={150} y1={660} x2={W} y2={660} stroke={C.linha} strokeWidth={5} />
          {Array.from({ length: 60 }, (_, i) => <rect key={i} x={420 + i * 120} y={536} width={64} height={7} fill={C.linha} opacity={0.9} />)}
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={180} y={432 + i * 29} width={80} height={15} fill={C.linha} />)}
          {[0, 1].map((k) => <g key={k}>{[0, 1, 2].map((j) => <rect key={j} x={720 + k * 260} y={450 + j * 22} width={110} height={12} fill={C.linha} opacity={0.85} />)}{[0, 1, 2].map((j) => <rect key={'b' + j} x={720 + k * 260} y={586 + j * 22} width={110} height={12} fill={C.linha} opacity={0.85} />)}</g>)}
          <text x={300} y={565} fill={C.linha} fontFamily={SANS} fontWeight={800} fontSize={74} transform="rotate(90 300 540)">27</text>
          {Array.from({ length: 14 }, (_, i) => {
            const lx = 120 - i * 70, on = Math.floor(f / 2) % 14 === 13 - i;
            return <g key={i}>{[-30, 0, 30].map((dy) => <circle key={dy} cx={lx} cy={540 + dy} r={on ? 26 : 12} fill="url(#luz)" opacity={on ? 1 : 0.55} />)}</g>;
          })}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={160} cy={428 + i * 32} r={10} fill="url(#luz)" />)}
          {/* luzes de borda */}
          {Array.from({ length: 70 }, (_, i) => [404, 676].map((yy) => <circle key={`${i}${yy}`} cx={200 + i * 120} cy={yy} r={9} fill="url(#luz)" opacity={bordaLuzes ? bordaLuzes(i) : 0.7} />))}
          {fumaca !== null && fumaca >= 0 && rodas.map((r, i) => (
            <g key={i}>{Array.from({ length: 5 }, (_, k) => {
              const gg = fumaca - k * 2; if (gg < 0) return null;
              const rr = 14 + gg * 3.2, op = Math.max(0, 0.8 - gg / 28);
              return <circle key={k} cx={r.x - 30 - k * 14 - gg * 1.5} cy={r.y + (random(`s${i}${k}`) - 0.5) * 16} r={rr} fill="url(#fumaca)" opacity={op} />;
            })}</g>
          ))}
          {mundo}
          <g transform={`translate(${x + alt * 0.9},${y + alt * 0.5}) rotate(${-crab})`} opacity={0.5 - alt / 900}><Av id="s" sombra /></g>
        </svg>
        <svg width={600} height={600} viewBox="-300 -300 600 600" style={{ position: 'absolute', left: x - 300, top: y - 300, transform: `translateZ(${alt}px)`, overflow: 'visible' }}>
          <g transform={`rotate(${-crab})`}><Av id="a" /></g>
        </svg>
      </div>
      {tela}
    </AbsoluteFill>
  );
};

// ---------- 1. abertura: pouso de lado ----------
export const CenaAbertura: React.FC<CenaProps> = ({ g, D, ts }) => {
  const pouso = ts[4] + 10;
  const crab = L(g, [ts[1] - 6, ts[1] + 18], [0, 18], Easing.out(Easing.back(1.4)));
  const x = interpolate(g, [0, D], [200, 1650], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });
  const alt = L(g, [0, pouso], [230, 0], Easing.in(Easing.quad));
  const tilt = L(g, [0, ts[2], ts[3], D], [62, 48, 40, 52]);
  const rz = L(g, [0, ts[3], D], [-10, 6, -2]);
  const zoom = L(g, [0, ts[2], ts[3], ts[5], D], [0.95, 1.2, 1.0, 1.15, 1.35]);
  const camX = (x - 960) * 0.9;
  const vento = L(g, [ts[1] - 10, ts[1] + 10], [0, 1]) * L(g, [D - 30, D], [1, 0.3]);
  const tremor = g >= pouso && g < pouso + 10 ? (random(`t${g}`) - 0.5) * 10 * (1 - (g - pouso) / 10) : 0;
  const linhas = janela(g, ts[2], ts[3] + 10);
  const y = 540;
  return (
    <Pista3D f={g} x={x} alt={alt} crab={crab} tilt={tilt} rz={rz} zoom={zoom} camX={camX} tremor={tremor} fumaca={g >= pouso ? g - pouso : null}
      mundo={<g opacity={linhas}>
        <line x1={x} y1={y} x2={x + 900} y2={y} stroke={C.texto} strokeWidth={4} strokeDasharray="18 12" />
        <line x1={x} y1={y} x2={x + 900 * Math.cos(rad(-crab))} y2={y + 900 * Math.sin(rad(-crab))} stroke={C.laranja} strokeWidth={4} strokeDasharray="18 12" />
        <Rot x={x + 300} y={y + 60} txt="WHERE IT GOES" cor={C.texto} tam={38} />
        <Rot x={x + 170} y={y - 250} txt="WHERE IT POINTS" tam={38} />
      </g>}
      tela={<>
        <Vento f={g} op={vento} ang={98} />
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <g opacity={janela(g, 10, ts[1] - 4)}>
            <rect x={1300} y={70} width={560} height={2} fill={C.laranja} />
            <Rot x={1860} y={125} txt="B-52 STRATOFORTRESS" cor={C.texto} a="end" tam={36} sub="185 FT WINGSPAN · 8 ENGINES" />
          </g>
          <g opacity={vento}><Rot x={70} y={110} txt="CROSSWIND  ↓" cor={C.azul} tam={34} /></g>
          <g opacity={janela(g, ts[2], ts[3])}>
            <text x={1850} y={930} textAnchor="end" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={120}>{Math.round(crab)}°</text>
            <text x={1850} y={975} textAnchor="end" fill={C.cinza} fontFamily={MONO} fontSize={26} letterSpacing={3}>OFF THE RUNWAY LINE</text>
          </g>
          <g opacity={janela(g, ts[3], ts[4])}>
            <rect x={60} y={300} width={560} height={300} rx={14} fill="rgba(8,12,18,.78)" />
            <Rot x={92} y={352} txt="AN AIRLINER, LIKE THIS:" cor={C.cinza} tam={26} />
            {['TIRES SCRUB', 'GEAR TWISTS', 'PLANE SWERVES'].map((t, i) => {
              const ini = ts[3] + 20 + i * 38;
              return <Item key={t} x={110} y={420 + i * 64} txt={t} ok={false} op={pop(g, ini)} tam={40} />;
            })}
          </g>
          <Carimbo g={g} ini={ts[4]} txt="ON PURPOSE" fim={ts[5]} />
          <g opacity={janela(g, ts[5] + 40, D + 20)}>
            <rect x={560} y={150} width={800} height={110} rx={14} fill="rgba(8,12,18,.8)" />
            <text x={960} y={225} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={60}>WHERE DO THE <tspan fill={C.laranja}>WHEELS</tspan> GO?</text>
          </g>
        </svg>
      </>} />
  );
};

// ---------- 2. título ----------
export const CenaTitulo: React.FC<CenaProps> = ({ g }) => {
  const lin = L(g, [10, 40], [0, 1]);
  const s = pop(g, 2);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        <g transform={`translate(${960 + (g - 90) * 1.2},${560}) rotate(-18) scale(2.2)`} opacity={0.13}><B52Topo id="tt" /></g>
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${0.94 + 0.06 * s})`, opacity: s }}>
        <div style={{ fontFamily: MONO, color: C.laranja, fontSize: 30, letterSpacing: 10, marginBottom: 20 }}>CROSSWIND</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, color: C.texto, fontSize: 112, letterSpacing: -3, textAlign: 'center', lineHeight: 1 }}>WHY THE B-52<br />LANDS SIDEWAYS</div>
        <div style={{ height: 7, width: 760 * lin, background: C.laranja, marginTop: 30, borderRadius: 4 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3. o que o vento cruzado faz (vetores) ----------
export const CenaVetor: React.FC<CenaProps> = ({ g, D, ts }) => {
  // fases: 0 ar | 1 massa de ar anda | 2 nariz reto, deriva | 3 vira o nariz | 4 vetores | 5 crabbing | 6 8° | 7 17°
  const ventoOn = L(g, [ts[1], ts[1] + 20], [0, 1]);
  const vv = 1.6 * ventoOn; // velocidade do ar para baixo (px/quadro)
  const pistaOp = L(g, [ts[2] - 10, ts[2] + 10], [0, 1]);
  const ang = ts[7] && g >= ts[7] ? L(g, [ts[7], ts[7] + 30], [8.2, 16.6]) : g >= ts[6] ? L(g, [ts[6], ts[6] + 30], [crabAt(ts, ts[6]), 8.2]) : crabAt(ts, g);
  // deriva só na fase 2
  const deriva = g < ts[3] ? L(g, [ts[2], ts[3]], [0, 170], Easing.in(Easing.quad)) : L(g, [ts[3], ts[4]], [170, 0]);
  const avx = 760, avy = 540 + deriva;
  const vet = janela(g, ts[4], D + 30);
  const hx = 460, wy = hx * Math.tan(rad(ang));
  const k = ts[7] && g >= ts[7] ? 40 : g >= ts[6] ? 20 : 0;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Grade />
        {/* partículas do ar */}
        {Array.from({ length: 140 }, (_, i) => {
          const px = random(`px${i}`) * 1920, py = ((random(`py${i}`) * 1080 + g * vv * (0.8 + random(`pv${i}`) * 0.4)) % 1120) - 20;
          return <circle key={i} cx={px} cy={py} r={3.2} fill={C.azul} opacity={0.5} />;
        })}
        <g opacity={pistaOp}>
          <rect x={0} y={470} width={1920} height={140} fill="#262b31" opacity={0.9} />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 130} y={537} width={70} height={6} fill={C.linha} opacity={0.8} />)}
          <line x1={0} y1={474} x2={1920} y2={474} stroke={C.linha} strokeWidth={3} /><line x1={0} y1={606} x2={1920} y2={606} stroke={C.linha} strokeWidth={3} />
        </g>
        {/* trajetória com deriva */}
        <g opacity={janela(g, ts[2] + 10, ts[4])}>
          <path d={`M200,540 Q500,540 ${avx},${avy}`} stroke={C.vermelho} strokeWidth={4} fill="none" strokeDasharray="14 10" />
          <Rot x={avx - 40} y={avy + 120} txt="DRIFTING OFF CENTERLINE" cor={C.vermelho} tam={30} a="middle" op={L(g, [ts[2] + 30, ts[2] + 45], [0, 1]) * (g < ts[3] ? 1 : 0)} />
        </g>
        <g transform={`translate(${avx},${avy}) rotate(${-ang}) scale(1.5)`}><B52Topo id="vt" /></g>
        {/* vetores */}
        <g opacity={vet} transform={`translate(${avx + 300},${540})`}>
          <Seta x1={0} y1={0} x2={hx} y2={-wy} cor={C.laranja} w={9} />
          <Seta x1={hx} y1={-wy} x2={hx} y2={0} cor={C.azul} w={9} />
          <Seta x1={0} y1={0} x2={hx} y2={0} cor={C.texto} w={9} dash="16 10" />
          <Rot x={hx * 0.3} y={-wy * 0.5 - 50} txt="HEADING" tam={34} />
          <Rot x={hx + 28} y={-wy / 2 + 12} txt="WIND" cor={C.azul} tam={34} />
          <Rot x={hx * 0.5} y={70} txt="TRACK" cor={C.texto} tam={34} a="middle" />
          <path d={`M110,0 A110,110 0 0 0 ${110 * Math.cos(rad(ang))},${-110 * Math.sin(rad(ang))}`} stroke={C.laranja} strokeWidth={4} fill="none" />
        </g>
        <g opacity={janela(g, ts[5], ts[6])}>
          <rect x={1220} y={150} width={600} height={140} rx={16} fill="rgba(8,12,18,.85)" stroke={C.laranja} strokeWidth={2} />
          <text x={1520} y={238} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={72} letterSpacing={2}>CRABBING</text>
        </g>
        <g opacity={janela(g, ts[6], D + 30)}>
          <rect x={1300} y={130} width={540} height={300} rx={16} fill="rgba(8,12,18,.85)" />
          <Rot x={1340} y={190} txt="APPROACH  140 KT" cor={C.texto} tam={32} />
          <Rot x={1340} y={250} txt={`CROSSWIND  ${k} KT`} cor={C.azul} tam={32} />
          <text x={1340} y={380} fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={110}>≈{Math.round(ang)}°</text>
        </g>
        <g opacity={ventoOn * L(g, [ts[4], ts[4] + 10], [1, 0.4])}><Rot x={70} y={110} txt="THE AIR ITSELF IS MOVING  ↓" cor={C.azul} tam={32} /></g>
        <g opacity={janela(g, 0, ts[1])}><Rot x={70} y={110} txt="AIRPLANES FLY THROUGH THE AIR" cor={C.texto} tam={32} /></g>
      </svg>
    </AbsoluteFill>
  );
};
function crabAt(ts: number[], g: number) {
  return L(g, [ts[3], ts[3] + 40], [0, 12]);
}

// ---------- 4. como um avião comercial faz ----------
export const CenaComercial: React.FC<CenaProps> = ({ g, D, ts }) => {
  const frente = g >= ts[4] - 10;
  const decrab = L(g, [ts[3] + 10, ts[3] + 60], [12, 0]);
  const crab = g < ts[1] ? 12 : g < ts[3] ? 12 : decrab;
  const bank = L(g, [ts[3] + 40, ts[3] + 80], [0, -5]);
  const topoOp = 1 - L(g, [ts[4] - 10, ts[4] + 5], [0, 1]);
  const x = interpolate(g, [0, ts[4]], [500, 1250], { extrapolateRight: 'clamp' });
  const ex = L(g, [ts[4], ts[4] + 30], [0, 1]);
  return (
    <AbsoluteFill>
      {!frente || topoOp > 0 ? (
        <AbsoluteFill style={{ opacity: topoOp }}>
          <Pista3D f={g} x={x} alt={L(g, [0, ts[4]], [160, 20])} crab={crab} tilt={46} rz={L(g, [0, ts[4]], [-6, 4])} zoom={1.15} camX={(x - 960) * 0.9} aviao="jato"
            tela={<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              <g opacity={janela(g, 6, ts[1])}><Rot x={70} y={110} txt="A TYPICAL AIRLINER" cor={C.texto} tam={34} sub="CRABBED ON APPROACH" /></g>
              <g opacity={janela(g, ts[2], ts[3] + 10)}>
                <rect x={1260} y={140} width={600} height={260} rx={16} fill="rgba(8,12,18,.85)" />
                <Item x={1300} y={230} txt="ROLL FORWARD" ok={true} op={pop(g, ts[2] + 6)} />
                <Item x={1300} y={330} txt="SLIDE SIDEWAYS" ok={false} op={pop(g, ts[2] + 26)} />
              </g>
              <g opacity={janela(g, ts[3], ts[4])}>
                <rect x={60} y={70} width={720} height={200} rx={16} fill="rgba(8,12,18,.85)" />
                <Item x={100} y={150} txt="1. RUDDER: NOSE STRAIGHT" ok={null} op={pop(g, ts[3] + 8)} tam={36} />
                <Item x={100} y={220} txt="2. LOWER THE UPWIND WING" ok={null} op={pop(g, ts[3] + 50)} tam={36} />
              </g>
            </svg>} />
        </AbsoluteFill>
      ) : null}
      {frente && (
        <AbsoluteFill style={{ opacity: 1 - topoOp }}>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
            <defs><linearGradient id="ceuC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07111c" /><stop offset="1" stopColor="#2c3f52" /></linearGradient></defs>
            <rect width={1920} height={1080} fill="url(#ceuC)" />
            <rect y={840} width={1920} height={240} fill="#151b22" />
            <line x1={0} y1={840} x2={1920} y2={840} stroke="#3c4855" strokeWidth={2} />
            <JatoFrente cx={960} solo={840} incl={L(g, [ts[4] + 10, ts[4] + 40], [0, -5])} />
            <g opacity={ex}>
              <line x1={600} y1={840} x2={600} y2={690} stroke={C.verde} strokeWidth={4} />
              <line x1={580} y1={690} x2={620} y2={690} stroke={C.verde} strokeWidth={4} />
              <line x1={580} y1={840} x2={620} y2={840} stroke={C.verde} strokeWidth={4} />
              <Rot x={570} y={770} txt="PLENTY OF CLEARANCE" cor={C.verde} tam={30} a="end" />
              <Rot x={70} y={110} txt="5° OF BANK" cor={C.texto} tam={36} />
            </g>
            <g opacity={janela(g, ts[5], D + 30)}>
              <rect x={560} y={150} width={800} height={110} rx={14} fill="rgba(8,12,18,.85)" />
              <text x={960} y={225} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={60}>NOW TRY IT ON A <tspan fill={C.laranja}>B-52</tspan></text>
            </g>
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------- 5. B-52 de frente ----------
export const CenaFrente: React.FC<CenaProps> = ({ g, D, ts }) => {
  const solo = 840, cx = 960, meia = 620;
  const dim = L(g, [10, 40], [0, 1]);
  const incl = g < ts[4] ? 0 : g < ts[5] ? L(g, [ts[4] + 10, ts[4] + 40], [0, -2]) : g < ts[6] ? L(g, [ts[5] + 6, ts[5] + 30], [-2, -5.4], Easing.in(Easing.quad)) : L(g, [ts[6], ts[6] + 25], [-5.4, 0]);
  const T = ts[5] + 30;
  const bate = g >= T && g < ts[6] + 10;
  const pulso = L(g, [T, T + 22], [0, 1], Easing.out(Easing.quad));
  const tremor = g >= T && g < T + 12 ? (random(`q${g}`) - 0.5) * 16 * (1 - (g - T) / 12) : 0;
  const zoomPonta = L(g, [ts[3], ts[3] + 30, ts[5] - 10, ts[5] + 10], [1, 1.9, 1.9, 1.15]);
  const foco = L(g, [ts[3], ts[3] + 30, ts[5] - 10, ts[5] + 10], [0, 1, 1, 0.4]);
  const ponta = cx - meia + 40;
  const motores = janela(g, ts[1], ts[2]);
  const pontas = janela(g, ts[2], ts[3] + 30);
  return (
    <AbsoluteFill style={{ transform: `translate(${tremor}px, ${tremor * 0.6}px)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <linearGradient id="ceuF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07111c" /><stop offset="0.75" stopColor="#1a2c40" /><stop offset="1" stopColor="#2c3f52" /></linearGradient>
          <radialGradient id="faisca"><stop offset="0" stopColor="#fff3c4" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#ceuF)" />
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={random(`e${i}`) * 1920} cy={random(`f${i}`) * 420} r={random(`g${i}`) * 1.4 + 0.3} fill="#fff" opacity={0.35} />)}
        <g transform={`translate(960 540) scale(${zoomPonta}) translate(${-(960 + (ponta + 80 - 960) * foco)} ${-(540 + (solo - 60 - 540) * foco)})`}>
          <rect x={-2000} y={solo} width={6000} height={500} fill="#151b22" />
          <path d={`M760,${solo} L1160,${solo} L1760,1080 L160,1080 Z`} fill="#2a2f36" />
          <line x1={-2000} y1={solo} x2={4000} y2={solo} stroke="#3c4855" strokeWidth={2} />
          <B52Frente cx={cx} solo={solo} incl={incl} destaque={{ motores, pontas }} />
          {/* folga até o chão */}
          <g opacity={janela(g, ts[3] + 20, ts[5])}>
            <line x1={ponta - 70} y1={solo - 118} x2={ponta - 70} y2={solo} stroke={C.laranja} strokeWidth={3} />
            <line x1={ponta - 85} y1={solo - 118} x2={ponta - 55} y2={solo - 118} stroke={C.laranja} strokeWidth={3} />
            <line x1={ponta - 85} y1={solo} x2={ponta - 55} y2={solo} stroke={C.laranja} strokeWidth={3} />
          </g>
          <g opacity={janela(g, ts[4] + 20, ts[5] + 10)}>
            <Seta x1={ponta - 120} y1={solo - 150} x2={ponta - 120} y2={solo - 150 + 60} cor={C.vermelho} w={4} />
            <Rot x={ponta - 135} y={solo - 165} txt="2° = SEVERAL FEET" cor={C.vermelho} tam={20} a="middle" />
          </g>
          {bate && <g>
            <circle cx={ponta} cy={solo - 4} r={30 + pulso * 110} fill="none" stroke={C.vermelho} strokeWidth={6} opacity={1 - pulso * 0.7} />
            {Array.from({ length: 22 }, (_, i) => {
              const a = rad(-170 + random(`p${i}`) * 140), v = 6 + random(`v${i}`) * 16, gg = g - T;
              return <circle key={i} cx={ponta + Math.cos(a) * v * gg} cy={solo - 4 + Math.sin(a) * v * gg + 0.6 * gg * gg} r={3 + random(`r${i}`) * 3} fill="url(#faisca)" opacity={Math.max(0, 1 - gg / 20)} />;
            })}
          </g>}
        </g>
        <g opacity={dim * L(g, [ts[1] - 10, ts[1]], [1, 0])}>
          <line x1={cx - meia * dim} y1={250} x2={cx + meia * dim} y2={250} stroke={C.laranja} strokeWidth={4} />
          {dim > 0.98 && [-1, 1].map((s) => <line key={s} x1={cx + s * meia} y1={230} x2={cx + s * meia} y2={270} stroke={C.laranja} strokeWidth={4} />)}
          <text x={cx} y={215} textAnchor="middle" fill={C.laranja} fontFamily={MONO} fontWeight={800} fontSize={58}>185 FT</text>
          <g opacity={L(g, [45, 60], [0, 1])}>
            <line x1={cx - meia * 0.86} y1={300} x2={cx + meia * 0.86} y2={300} stroke={C.cinza} strokeWidth={3} />
            <text x={cx} y={345} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={28} letterSpacing={2}>FUSELAGE LENGTH: 159 FT</text>
          </g>
        </g>
        <g opacity={motores}><Rot x={70} y={110} txt="8 ENGINES · 4 PODS" cor={C.laranja} tam={38} /></g>
        <g opacity={pontas}><Rot x={70} y={110} txt="WINGTIP WHEELS (OUTRIGGERS)" cor={C.laranja} tam={38} /></g>
        <g opacity={bate ? 1 : 0}><Rot x={70} y={110} txt="WINGTIP / POD STRIKE" cor={C.vermelho} tam={40} /></g>
        <Carimbo g={g} ini={ts[6]} txt="OFF THE TABLE" y={220} fim={D + 20} />
      </svg>
    </AbsoluteFill>
  );
};
