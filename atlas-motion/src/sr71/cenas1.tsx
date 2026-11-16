import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { C, Carimbo, CenaProps, Gota, Grade, Ilustracao, Item, JatoFrente, K, L, MONO, Patio, Poca, pop, Rot, SANS, Seta, SR71Lado, SR71Topo, janela, marca } from './lib';

// ---------- peças da cena de pátio ----------
export const Pessoa: React.FC<{ x: number; y: number; fase: number; op?: number }> = ({ x, y, fase, op = 1 }) => {
  const a = Math.sin(fase) * 13, b = -a;
  return (
    <g opacity={op} transform={`translate(${x},${y})`}>
      <line x1={0} y1={-34} x2={a} y2={0} stroke="#d9741f" strokeWidth={9} strokeLinecap="round" />
      <line x1={0} y1={-34} x2={b} y2={0} stroke="#f08a2c" strokeWidth={9} strokeLinecap="round" />
      <rect x={-10} y={-70} width={20} height={40} rx={8} fill="#ff9a3a" stroke="#7a3a0c" strokeWidth={1.5} />
      <line x1={0} y1={-62} x2={b * 0.8} y2={-36} stroke="#f08a2c" strokeWidth={7} strokeLinecap="round" />
      <circle cx={0} cy={-82} r={11} fill="#f3f5f7" stroke="#6f7984" strokeWidth={1.5} />
      <path d="M2,-86 L10,-84 L10,-78 L2,-77 Z" fill="#1b2a38" />
    </g>
  );
};

export const FONTES = [-100, -78, -55, -10, 12, 34]; // pontos de gotejamento ao longo da barriga (x local do avião)
export const CeuPatio: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <defs>
      <linearGradient id="ceuP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.ceu1} /><stop offset="0.72" stopColor={K.ceu2} /><stop offset="1" stopColor="#5a4a3c" /></linearGradient>
      <linearGradient id="chaoP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#66707a" /><stop offset="0.25" stopColor="#4a525b" /><stop offset="1" stopColor="#262c33" /></linearGradient>
      <radialGradient id="luzP"><stop offset="0" stopColor="#fff2cf" /><stop offset="0.3" stopColor="#ffc56a" stopOpacity="0.7" /><stop offset="1" stopColor="#ffb02e" stopOpacity="0" /></radialGradient>
    </defs>
    <rect x={-400} y={-300} width={2720} height={1070} fill="url(#ceuP)" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-300 + random(`sx${i}`) * 2500} cy={random(`sy${i}`) * 420} r={0.8 + random(`sr${i}`) * 1.4} fill="#fff" opacity={0.25 + 0.3 * Math.sin(g / 14 + i)} />)}
    {/* hangares e postes ao fundo */}
    <g opacity={0.9}>
      <path d="M-200,760 L-200,668 Q-20,610 160,668 L160,760 Z" fill="#101820" />
      <path d="M1330,760 L1330,690 L1520,660 L1710,690 L1710,760 Z" fill="#0f171f" />
      <rect x={1760} y={640} width={420} height={120} fill="#101820" />
      {[250, 620, 1180, 1600, 2050].map((x, i) => <g key={x}><rect x={x - 2} y={610} width={4} height={150} fill="#0d141b" /><circle cx={x} cy={608} r={34} fill="url(#luzP)" opacity={0.75 + 0.12 * Math.sin(g / 9 + i)} /></g>)}
    </g>
    <rect x={-400} y={760} width={2720} height={520} fill="url(#chaoP)" />
    {Array.from({ length: 15 }, (_, i) => { const x = -300 + i * 190; return <line key={i} x1={x} y1={760} x2={960 + (x - 960) * 3.2} y2={1280} stroke="#20262c" strokeWidth={2.5} opacity={0.7} />; })}
    {[800, 866, 990].map((y) => <line key={y} x1={-400} y1={y} x2={2320} y2={y} stroke="#20262c" strokeWidth={2.5} opacity={0.6} />)}
  </g>
);

// ---------- 1. gancho: o SR-71 vazando no pátio ----------
export const CenaRampa: React.FC<CenaProps> = ({ g, D, ts }) => {
  const tFast = marca('rampa', 0, 'The fastest');
  const tSobe = marca('rampa', 4, 'climbs in');
  const tLiga = marca('rampa', 4, 'starts the');
  const tBuilt = marca('rampa', 5, 'built to leak');
  const tRazao = marca('rampa', 5, 'And the reason');
  const tTres = marca('rampa', 5, 'three times');
  const tGround = marca('rampa', 3, 'ground it');
  const tFire = marca('rampa', 3, 'A fuel leak');
  const tNobody = marca('rampa', 3, 'and nobody');

  const opA = L(g, [ts[1] - 8, ts[1] + 6], [1, 0]);
  const opLado = Math.max(janela(g, ts[1] - 8, ts[3] + 8, 14), janela(g, ts[4] - 10, tRazao + 8, 14));
  const opC = janela(g, ts[3] - 6, ts[4] + 2, 12);
  const opE = L(g, [tRazao - 6, tRazao + 10], [0, 1]);

  // câmera da vista lateral
  const z = g < ts[3] + 10 ? 1 + 0.2 * L(g, [ts[1], ts[3]], [0, 1]) : 1 + 0.05 * L(g, [ts[4], tRazao], [0, 1]);
  const camX = g < ts[3] + 10 ? 860 : 960;
  const poca = (k: number) => Math.min(150 + (k % 3) * 28, Math.max(0, (g - ts[1] - 14 - k * 5) * 0.34));
  const mach = L(g, [tFast + 4, tFast + 30], [0, 3.2]);
  // tripulação
  const px = L(g, [ts[4] - 4, tSobe + 4], [470, 1345], (t) => t);
  const sobe = L(g, [tSobe + 2, tSobe + 20], [0, 1]);
  const verde = L(g, [tLiga + 12, tLiga + 16, tLiga + 30], [0, 1, 0]);
  const motor = L(g, [tLiga + 14, tLiga + 36], [0, 0.4]);
  const tremor = motor > 0 ? Math.sin(g * 2.1) * 1.4 * (motor / 0.4) : 0;
  const calorE = L(g, [tTres - 10, tTres + 60], [0, 1]);

  return (
    <AbsoluteFill style={{ background: C.fundo }}>
      {/* A: vista de cima no pátio */}
      {opA > 0 && <AbsoluteFill style={{ opacity: opA }}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
          <defs><filter id="blurS"><feGaussianBlur stdDeviation="9" /></filter></defs>
          <g transform={`translate(960,470) scale(${1 + 0.07 * L(g, [0, ts[1]], [0, 1], (t) => t)}) rotate(${-0.8 * L(g, [0, ts[1]], [0, 1], (t) => t)}) translate(-960,-470)`}>
            <Patio />
            <path d="M-300,880 C400,860 900,700 2300,640" fill="none" stroke="#d8b23a" strokeWidth={7} opacity={0.55} />
            {/* manchas de combustível aparecendo debaixo do avião */}
            {[[700, 560, 70], [820, 330, 58], [640, 420, 46], [900, 600, 50], [760, 250, 40]].map(([x, y, r], i) => {
              const s = L(g, [50 + i * 16, 150 + i * 16], [0, 1]);
              return <g key={i} opacity={s}><ellipse cx={x} cy={y} rx={r * (0.5 + 0.5 * s)} ry={r * 0.55 * (0.5 + 0.5 * s)} fill="#1a1612" opacity={0.7} /><ellipse cx={x} cy={y} rx={r * (0.5 + 0.5 * s)} ry={r * 0.55 * (0.5 + 0.5 * s)} fill="none" stroke={K.fuel} strokeWidth={2} opacity={0.6} /></g>;
            })}
            <g transform="translate(978,496) rotate(-7) scale(3.6)" opacity={0.42} filter="url(#blurS)"><SR71Topo id="rs" sombra /></g>
            <g transform="translate(960,470) rotate(-7) scale(3.6)"><SR71Topo id="ra" /></g>
          </g>
          <Rot x={110} y={104} txt="SR-71 BLACKBIRD" sub="LOCKHEED · FIRST FLIGHT 1964" op={pop(g, 10)} tam={44} />
          <g opacity={L(g, [tFast, tFast + 10], [0, 1])}>
            <text x={1812} y={150} textAnchor="end" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={112} letterSpacing={-3} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.45} strokeWidth={10}>MACH <tspan fill={C.laranja}>{mach.toFixed(1)}</tspan></text>
            <text x={1812} y={196} textAnchor="end" fill={C.texto} fontFamily={MONO} fontSize={26} letterSpacing={4} opacity={L(g, [tFast + 26, tFast + 38], [0, 1])} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.5} strokeWidth={6}>FASTEST CREWED JET EVER BUILT</text>
          </g>
        </svg>
      </AbsoluteFill>}

      {/* B/D: vista de lado, pingando */}
      {opLado > 0 && <AbsoluteFill style={{ opacity: opLado, transform: `translateY(${tremor}px)` }}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
          <g transform={`translate(${camX},720) scale(${z}) translate(${-camX},-720)`}>
            <CeuPatio g={g} />
            <ellipse cx={930} cy={772} rx={720} ry={16} fill="#000" opacity={0.38} />
            {FONTES.map((lx, k) => <Poca key={k} x={960 + lx * 5 + (k % 2 ? 14 : -8)} y={776 + (k % 3) * 9} rx={poca(k)} f={g} k={k} />)}
            <g transform="translate(960,577.5) scale(5)"><SR71Lado id="rl" verde={verde} pos={motor} /></g>
            {FONTES.map((lx, k) => <Gota key={k} g={g} ini={ts[1] + 4 + k * 7} x={960 + lx * 5} y0={577.5 + (lx < -5 ? 11 : 8.5) * 5} yg={772} per={26 + (k * 7) % 13} esc={1.25} />)}
            {/* tripulação atravessando as poças */}
            {g >= ts[4] - 6 && g < tSobe + 24 && <g>
              {[0, 1].map((i) => {
                const x = px - i * 74, y = 800 + i * 10 - sobe * 150;
                const naPoca = x > 440 && x < 1180 && sobe === 0;
                return <g key={i}>
                  {naPoca && [0, 1].map((r) => { const q = ((g * 0.09 + r * 0.5 + i * 0.3) % 1); return <ellipse key={r} cx={x} cy={y + 2} rx={10 + q * 34} ry={2 + q * 7} fill="none" stroke={K.fuel2} strokeWidth={2} opacity={(1 - q) * 0.8} />; })}
                  <Pessoa x={x} y={y} fase={g * 0.42 + i * 1.6} op={1 - sobe} />
                </g>;
              })}
            </g>}
          </g>
          <g opacity={janela(g, ts[2] + 14, ts[3] + 2)}>
            <Rot x={96} y={700} txt="JP-7 FUEL" sub="WINGS + BELLY" tam={34} />
            <Seta x1={300} y1={718} x2={372} y2={776} cor={C.laranja} w={4} />
          </g>
          <Rot x={110} y={104} txt="ON THE RAMP" sub="ENGINES OFF · SKIN COLD" op={janela(g, ts[1] + 6, ts[3] + 2)} tam={36} cor={C.texto} />
          <Carimbo g={g} ini={ts[5] + 6} txt="NOTHING IS BROKEN" cor={C.verde} x={600} y={210} fim={tRazao + 4} tam={52} />
          <Carimbo g={g} ini={tBuilt} txt="BUILT TO LEAK" cor={C.laranja} x={1330} y={330} fim={tRazao + 4} tam={64} />
          <Ilustracao />
        </svg>
      </AbsoluteFill>}

      {/* C: em qualquer outro avião */}
      {opC > 0 && <AbsoluteFill style={{ opacity: opC }}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
          <Grade />
          <g transform={`translate(640,560) scale(${1 + 0.05 * L(g, [ts[3], ts[4]], [0, 1], (t) => t)}) translate(-640,-560)`}>
            <rect x={120} y={770} width={1040} height={6} fill="#2c3743" />
            <JatoFrente cx={640} solo={770} />
            <Poca x={770} y={782} rx={Math.min(120, Math.max(0, (g - ts[3] - 8) * 1.1))} f={g} />
            <Gota g={g} ini={ts[3] + 4} x={770} y0={672} yg={778} per={22} esc={1.3} />
          </g>
          <Rot x={150} y={150} txt="ANY OTHER AIRPLANE" sub="FUEL LEAK ON THE RAMP" op={pop(g, ts[3] + 4)} tam={38} cor={C.texto} />
          <Carimbo g={g} ini={tGround} txt="GROUNDED" x={640} y={380} tam={84} />
          <g opacity={L(g, [tFire, tFire + 10], [0, 1])} transform={`translate(1490,330) scale(${0.9 + 0.1 * pop(g, tFire)})`}>
            <path d="M0,-150 L150,110 L-150,110 Z" fill="rgba(255,77,77,.12)" stroke={C.vermelho} strokeWidth={10} strokeLinejoin="round" />
            <path d={`M0,${-70 - 6 * Math.sin(g / 3)} C40,-20 62,10 46,48 C36,76 -36,76 -46,48 C-58,18 -22,6 -18,-22 C-6,-10 4,-34 0,${-70 - 6 * Math.sin(g / 3)} Z`} fill={C.laranja} />
            <path d="M0,0 C18,18 22,36 12,50 C4,60 -12,60 -16,48 C-22,32 -6,22 0,0 Z" fill="#ffe1a6" />
          </g>
          <Item x={1260} y={560} txt="FIRE RISK" ok={false} op={L(g, [tFire + 8, tFire + 18], [0, 1])} tam={46} />
          <Item x={1260} y={650} txt="NOT GOING ANYWHERE" ok={false} op={L(g, [tNobody, tNobody + 10], [0, 1])} tam={46} />
        </svg>
      </AbsoluteFill>}

      {/* E: a três vezes a velocidade do som */}
      {opE > 0 && <AbsoluteFill style={{ opacity: opE, background: 'linear-gradient(180deg,#04080e,#0b1826 60%,#13283a)' }}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
          {Array.from({ length: 70 }, (_, i) => {
            const sp = 60 + random(`ev${i}`) * 70, len = 120 + random(`el${i}`) * 260;
            const x = 2300 - ((g * sp + random(`eo${i}`) * 3000) % 2900), y = random(`ey${i}`) * 900;
            return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="#cfe8ff" strokeWidth={1.2 + random(`ew${i}`) * 1.6} strokeLinecap="round" opacity={0.1 + random(`ea${i}`) * 0.25} />;
          })}
          <g transform={`translate(${1010 + Math.sin(g / 17) * 6},${545 + Math.sin(g / 11) * 4})`}>
            {[-1, 1].map((s) => <line key={s} x1={510} y1={0} x2={510 - 700} y2={s * 248} stroke={C.azul} strokeWidth={3} strokeDasharray="14 12" opacity={0.55 * L(g, [tTres - 4, tTres + 14], [0, 1])} />)}
            <g transform="scale(3.4)"><SR71Topo id="re" calor={calorE} pos={1} /></g>
          </g>
          <g opacity={L(g, [tTres - 6, tTres + 6], [0, 1])}>
            <text x={110} y={160} fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={112} letterSpacing={-3}>MACH <tspan fill={C.laranja}>{L(g, [tTres - 6, tTres + 24], [0, 3]).toFixed(1)}</tspan></text>
            <text x={114} y={206} fill={C.cinza} fontFamily={MONO} fontSize={26} letterSpacing={5}>3× THE SPEED OF SOUND</text>
          </g>
          <Ilustracao />
        </svg>
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};

// ---------- cena provisória (as demais cenas entram depois do teste aprovado) ----------
export const CenaProvisoria: React.FC<CenaProps> = ({ g }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <Grade />
      <g transform={`translate(${900 + g * 0.5},500) rotate(-12) scale(3)`} opacity={0.5}><SR71Topo id="pv" /></g>
    </svg>
  </AbsoluteFill>
);
