import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { A380Lado, AZ, B747Lado, C, Carimbo, CenaProps, Grade, Ilustracao, Item, JatoTopo, K, L, LJ, MONO, Mini, Painel, Palete, pop, QuadTopo, Riscos, SANS, Seta, T, janela, marca, mix, rad } from './lib';
import { CEU, SVG } from './cenasA';

const lin = (t: number) => t;
const Motor: React.FC<{ x: number; y: number; r: number; g: number; cor?: string }> = ({ x, y, r, g, cor = '#8f99a5' }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="#1a232d" stroke={cor} strokeWidth={r * 0.09} /><circle r={r * 0.82} fill="#0b1118" />
    <g transform={`rotate(${g * 7})`}>{Array.from({ length: 14 }, (_, i) => <path key={i} transform={`rotate(${(i * 360) / 14})`} d={`M0,${-r * 0.2} C${r * 0.16},${-r * 0.45} ${r * 0.14},${-r * 0.7} ${r * 0.02},${-r * 0.8} C${-r * 0.02},${-r * 0.6} ${-r * 0.06},${-r * 0.4} 0,${-r * 0.2} Z`} fill="#aeb9c4" />)}</g>
    <circle r={r * 0.2} fill="#e3e7ec" /><path d={`M0,0 L${r * 0.12},0`} stroke="#39424c" strokeWidth={3} transform={`rotate(${g * 7})`} />
  </g>
);

// ---------- 10. motores ultrapassados ----------
export const CenaMotores: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('motores', i, p);
  const tWorse = m(0, 'But what'), tNoth = m(1, 'Nothing'), t15 = m(2, 'fifteen'), t787 = m(3, 'The seven'), tOut = m(4, 'out of date');
  const J = (i: number) => janela(g, i === 0 ? -20 : ts[i] - 4, (ts[i + 1] ?? 1e9) + 4);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {J(0) > 0 && <g opacity={J(0)}>
          <g transform="translate(960,560) scale(3.6)" opacity={0.35}><A380Lado id="m0" trem={0} /></g>
          <T x={960} y={300} s={56} w={900} a="middle">THE DELAY WAS <tspan fill={C.vermelho}>PAINFUL</tspan></T>
          <T x={960} y={400} s={72} w={900} a="middle" op={L(g, [tWorse, tWorse + 10], [0, 1])}>THE <tspan fill={C.laranja}>ENGINES</tspan> WERE WORSE</T>
        </g>}
        {J(1) > 0 && <g opacity={J(1)}>
          <Motor x={520} y={500} r={250} g={g} />
          <T x={920} y={300} s={34} mono cor={C.cinza}>WHEN AIRBUS CHOSE</T>
          <Item x={940} y={430} txt="BEST AVAILABLE" ok op={L(g, [ts[1] + 30, ts[1] + 40], [0, 1])} tam={64} />
          <T x={920} y={560} s={44} w={900} op={L(g, [tNoth, tNoth + 10], [0, 1])}>NOTHING BETTER ON THE HORIZON</T>
        </g>}
        {J(2) > 0 && <g opacity={J(2)}>
          <T x={110} y={140} s={56} w={900}>3 YEARS <tspan fill={C.laranja}>LATER</tspan></T><T x={114} y={186} s={26} mono cor={C.cinza}>BEFORE THE FIRST A380 WAS DELIVERED</T>
          <T x={260} y={380} s={30} mono cor={AZ}>A380 ENGINES</T><rect x={260} y={400} width={1300} height={80} rx={12} fill={AZ} /><T x={1580} y={458} s={40} mono>FUEL</T>
          <T x={260} y={590} s={30} mono cor={C.verde}>NEW ENGINE DESIGNS</T><rect x={260} y={610} width={1300 * (1 - 0.15 * L(g, [t15 - 20, t15 + 20], [0, 1]))} height={80} rx={12} fill={C.verde} />
          <rect x={260 + 1300 * 0.85} y={610} width={1300 * 0.15} height={80} rx={12} fill="none" stroke={C.verde} strokeWidth={3} strokeDasharray="10 8" />
          <T x={1812} y={830} s={130} w={900} a="end" cor={C.verde} op={L(g, [t15 - 10, t15], [0, 1])}>≈−{Math.round(L(g, [t15 - 10, t15 + 20], [0, 15]))}%</T>
        </g>}
        {J(3) > 0 && <g opacity={J(3)}>
          <g transform={`translate(1100,500) scale(${1.9 + 0.1 * L(g, [ts[3], ts[4]], [0, 1], lin)})`}><JatoTopo id="m3" />{[-55, 55].map((y) => <circle key={y} cx={10} cy={y} r={20 + 3 * Math.sin(g / 4)} fill="none" stroke={C.verde} strokeWidth={3} />)}</g>
          <T x={110} y={140} s={60} w={900}>NOT FOR THE <tspan fill={AZ}>A380</tspan></T>
          <T x={110} y={250} s={84} w={900} cor={C.verde} op={L(g, [t787, t787 + 10], [0, 1])}>BOEING 787</T><T x={114} y={296} s={28} mono cor={C.cinza} op={L(g, [t787, t787 + 10], [0, 1])}>NEWER · SMALLER · TWO ENGINES</T>
        </g>}
        {J(4) > 0 && <g opacity={J(4)}>
          <g transform="translate(960,560) scale(4.2)"><A380Lado id="m4" trem={0} /></g>
          <Carimbo g={g} ini={tOut} txt="OUT OF DATE" x={960} y={240} tam={90} />
          <T x={960} y={840} s={44} w={900} a="middle" op={L(g, [tOut + 30, tOut + 42], [0, 1])}>BEFORE ITS FIRST PASSENGER</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 11. os bimotores ganham o oceano ----------
const AER: [number, number][] = [[330, 300], [300, 520], [380, 720], [1600, 330], [1640, 560], [1560, 740]];
export const CenaGemeos: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('gemeos', i, p);
  const tGone = m(0, 'It was gone'), tHours = m(1, 'for hours'), tLong = m(2, 'the long way'), tKm = m(2, 'More than'), tFour = m(3, 'instead of');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, 1e9);
  const raio = 190 + 560 * L(g, [ts[1], tHours + 20], [0, 1]);
  const cruza = L(g, [tHours, ts[2]], [0, 1], lin);
  const v = L(g, [ts[2] + 30, tKm + 30], [0, 1], lin);
  return (
    <AbsoluteFill>
      <SVG>
        {A > 0 && <g opacity={A}>
          <rect width={1920} height={1080} fill="#071624" />
          <path d="M0,0 L420,0 L470,200 L400,420 L470,640 L420,900 L380,1080 L0,1080 Z" fill="#16211a" stroke="#2c4034" strokeWidth={3} /><path d="M1920,0 L1520,0 L1490,240 L1540,460 L1470,700 L1500,1080 L1920,1080 Z" fill="#16211a" stroke="#2c4034" strokeWidth={3} />
          {AER.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={raio} fill={C.azul} fillOpacity={0.05} stroke={C.azul} strokeWidth={3} strokeDasharray="10 10" /><circle cx={x} cy={y} r={10} fill={C.texto} /></g>)}
          <g opacity={janela(g, 6, ts[1] + 4)}><T x={960} y={220} s={64} w={900} a="middle">THE <tspan fill={C.azul}>60 MINUTE</tspan> RULE</T><Carimbo g={g} ini={tGone} txt="GONE" x={960} y={360} fim={ts[1] + 4} tam={84} /></g>
          <g opacity={L(g, [ts[1] + 10, ts[1] + 22], [0, 1])}>
            <T x={960} y={220} s={60} w={900} a="middle">TWINS: <tspan fill={C.verde}>HOURS</tspan> FROM AN AIRPORT</T>
            <path d="M300,520 L1640,560" stroke={C.verde} strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
            <g transform={`translate(${300 + 1340 * cruza},${520 + 40 * cruza}) rotate(1.7) scale(0.6)`}><JatoTopo id="ge1" /></g>
          </g>
        </g>}
        {B > 0 && <g opacity={B}>
          <Grade fundo="#071624" />
          {[0.25, 0.5, 0.75].map((q) => <line key={q} x1={0} y1={170 + 620 * q} x2={1920} y2={170 + 620 * q} stroke="#17324a" strokeWidth={2} />)}
          <T x={110} y={130} s={34} mono cor={C.cinza}>2005 · TWIN-ENGINE BOEING 777</T>
          <path d="M1480,520 L600,440" stroke={C.cinza} strokeWidth={4} strokeDasharray="8 12" opacity={0.5} /><T x={1040} y={450} s={22} mono a="middle" cor={C.cinza}>THE SHORT WAY</T>
          <path d={`M1480,520 C1700,620 1840,640 1920,640`} fill="none" stroke={C.verde} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - L(v, [0, 0.25], [0, 1])} />
          <path d={`M0,640 C300,640 440,560 600,440`} fill="none" stroke={C.verde} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - L(v, [0.25, 1], [0, 1])} />
          {[[1480, 520, 'HONG KONG'], [600, 440, 'LONDON']].map(([x, y, n]) => <g key={n as string}><circle cx={x as number} cy={y as number} r={15} fill={C.texto} /><T x={x as number} y={(y as number) - 34} s={34} mono a="middle">{n}</T></g>)}
          <T x={1812} y={130} s={30} mono a="end" cor={C.verde} op={L(g, [tLong, tLong + 10], [0, 1])}>THE LONG WAY AROUND →</T>
          <T x={960} y={800} s={110} w={900} a="middle" cor={C.verde} op={L(g, [tKm, tKm + 8], [0, 1])}>{Math.round(L(g, [tKm, tKm + 40], [0, 21602])).toLocaleString('en-US')} KM</T>
          <T x={960} y={850} s={28} mono a="middle">NON-STOP · TWO ENGINES</T>
        </g>}
        {Cc > 0 && <g opacity={Cc}><Grade />
          <T x={480} y={220} s={50} w={900} a="middle" cor={C.verde}>2 ENGINES</T>{[380, 580].map((x) => <Motor key={x} x={x} y={430} r={90} g={g} cor={C.verde} />)}
          <g opacity={L(g, [tFour - 6, tFour + 6], [0, 1])}><T x={1400} y={220} s={50} w={900} a="middle" cor={C.vermelho}>4 ENGINES</T>{[1100, 1300, 1500, 1700].map((x) => <Motor key={x} x={x} y={430} r={90} g={g} cor={C.vermelho} />)}</g>
          <T x={960} y={700} s={44} mono a="middle" cor={C.cinza}>TO FEED AND MAINTAIN</T>
          <T x={960} y={820} s={64} w={900} a="middle" op={L(g, [tFour + 50, tFour + 62], [0, 1])}>FOR AN AIRLINE, THAT CHANGES <tspan fill={C.laranja}>EVERYTHING</tspan></T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 12. hub x voo direto ----------
const NOS = (cx: number, cy: number, r: number, n: number) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI - 1.2), cy + r * 0.82 * Math.sin((i / n) * 2 * Math.PI - 1.2)] as [number, number]);
export const CenaRede: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('rede', i, p);
  const t9 = m(2, 'nine routes'), t45 = m(2, 'forty five'), tStr = m(3, 'They want'), tSm = m(4, 'Smaller');
  const E = NOS(520, 500, 300, 9), M2 = NOS(1400, 500, 300, 10);
  const pares: [number, number][] = []; for (let a = 0; a < 10; a++) for (let b = a + 1; b < 10; b++) pares.push([a, b]);
  const dir = L(g, [ts[2] + 6, ts[2] + 20], [0, 1]), malha = L(g, [t45 - 30, t45 + 10], [0, 1]);
  const esq = g < ts[2] ? 440 : 0;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        <g transform={`translate(${esq * (1 - L(g, [ts[2] - 10, ts[2] + 14], [0, 1]))},0)`}>
          {E.map(([x, y], i) => <g key={i}><line x1={520} y1={500} x2={x} y2={y} stroke={g >= ts[3] && (i === 1 || i === 5) ? C.vermelho : AZ} strokeWidth={g >= ts[3] && (i === 1 || i === 5) ? 8 : 5} opacity={L(g, [ts[1] + i * 3, ts[1] + 12 + i * 3], [0, 1])} /><circle cx={x} cy={y} r={15} fill={C.texto} /></g>)}
          {E.map(([x, y], i) => { const q = ((g * 0.012 + i * 0.23) % 1); return g > ts[1] + 30 && g < ts[3] ? <Mini key={'m' + i} x={520 + (x - 520) * q} y={500 + (y - 500) * q} cor={AZ} s={0.55} /> : null; })}
          <circle cx={520} cy={500} r={34} fill={AZ} stroke="#fff" strokeWidth={4} /><T x={520} y={440} s={28} mono a="middle" cor={AZ}>HUB</T>
          <T x={520} y={130} s={44} w={900} a="middle">BUILT FOR <tspan fill={AZ}>HUBS</tspan></T>
          <g opacity={L(g, [t9 - 6, t9 + 6], [0, 1])}><T x={520} y={860} s={64} w={900} a="middle" cor={AZ}>9 ROUTES</T></g>
        </g>
        <g opacity={dir}>
          {pares.map(([a, b], i) => <line key={i} x1={M2[a][0]} y1={M2[a][1]} x2={M2[b][0]} y2={M2[b][1]} stroke={g >= ts[3] && a === 1 && b === 5 ? C.verde : C.laranja} strokeWidth={g >= ts[3] && a === 1 && b === 5 ? 8 : 2.5} opacity={(g >= ts[3] && a === 1 && b === 5 ? 1 : 0.55) * L(malha, [i / 60, i / 60 + 0.25], [0, 1])} />)}
          {M2.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill={C.texto} />)}
          {g >= ts[4] && pares.filter((_, i) => i % 5 === 0).map(([a, b], i) => { const q = ((g * 0.014 + i * 0.31) % 1); return <Mini key={i} x={M2[a][0] + (M2[b][0] - M2[a][0]) * q} y={M2[a][1] + (M2[b][1] - M2[a][1]) * q} cor="#fff" s={0.42} />; })}
          <T x={1400} y={130} s={44} w={900} a="middle">EVERY CITY, <tspan fill={C.laranja}>DIRECT</tspan></T>
          <g opacity={L(g, [t45 - 6, t45 + 6], [0, 1])}><T x={1400} y={860} s={64} w={900} a="middle" cor={C.laranja}>{Math.round(L(g, [t45 - 6, t45 + 20], [9, 45]))} ROUTES</T></g>
        </g>
        <g opacity={janela(g, ts[3] + 6, ts[4] + 4)}>
          <rect x={560} y={440} width={800} height={130} rx={18} fill="rgba(8,12,18,.9)" stroke={C.verde} strokeWidth={3} />
          <T x={960} y={526} s={56} w={900} a="middle" op={L(g, [tStr, tStr + 8], [0, 1])}>STRAIGHT <tspan fill={C.verde}>THERE</tspan>, PLEASE</T>
          <T x={520} y={760} s={28} mono a="middle" cor={C.vermelho}>CONNECT</T><T x={1400} y={760} s={28} mono a="middle" cor={C.verde}>NON-STOP</T>
        </g>
        <g opacity={L(g, [tSm, tSm + 10], [0, 1])}><rect x={500} y={440} width={920} height={130} rx={18} fill="rgba(8,12,18,.92)" stroke={C.laranja} strokeWidth={3} /><T x={960} y={526} s={46} w={900} a="middle">SMALLER PLANES · <tspan fill={C.laranja}>MORE ROUTES</tspan> · NO STOP</T></g>
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 13. só dá lucro cheio ----------
export const CenaCheio: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('cheio', i, p);
  const tFull = m(0, 'It only'), tMost = m(1, 'On most'), t123 = m(2, 'Emirates took'), tHalf = m(2, 'Almost half'), tProg = m(4, 'The program'), tNev = m(4, 'and it never');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[4] + 4), Cc = janela(g, ts[4] - 4, 1e9);
  const oc = g < tMost ? L(g, [10, tFull + 30], [0.3, 1]) : L(g, [tMost, tMost + 50], [1, 0.6]);
  const n123 = Math.round(L(g, [t123, t123 + 50], [0, 123]));
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>ONE A380 · ≈500 SEATS</T>
          {Array.from({ length: 500 }, (_, i) => { const on = random(`se${i}`) < oc; return <rect key={i} x={130 + (i % 40) * 26 + (i % 40 > 9 ? 22 : 0) + (i % 40 > 29 ? 22 : 0)} y={220 + Math.floor(i / 40) * 40 + (Math.floor(i / 40) > 5 ? 40 : 0)} width={18} height={26} rx={5} fill={on ? AZ : '#1e2833'} />; })}
          <rect x={1400} y={220} width={90} height={540} rx={14} fill="#111820" stroke="#56606b" strokeWidth={3} />
          <rect x={1408} y={228 + 524 * (1 - oc)} width={74} height={524 * oc} rx={10} fill={oc > 0.82 ? C.verde : C.vermelho} />
          <line x1={1380} y1={228 + 524 * 0.18} x2={1560} y2={228 + 524 * 0.18} stroke={C.texto} strokeWidth={4} strokeDasharray="10 8" /><T x={1580} y={228 + 524 * 0.18 + 10} s={26} mono>BREAK-EVEN</T>
          <T x={1580} y={500} s={110} w={900} cor={oc > 0.82 ? C.verde : C.vermelho}>{Math.round(oc * 100)}%</T><T x={1584} y={546} s={28} mono cor={C.cinza}>FULL</T>
          <T x={130} y={850} s={52} w={900} op={L(g, [tFull, tFull + 10], [0, 1])}>{g < tMost + 20 ? <>IT ONLY PAYS WHEN IT'S <tspan fill={C.verde}>FULL</tspan></> : <>ON MOST ROUTES: <tspan fill={C.vermelho}>NOT FULL</tspan></>}</T>
        </g>}
        {B > 0 && <g opacity={B}>
          {Array.from({ length: 251 }, (_, i) => <Mini key={i} x={170 + (i % 28) * 58} y={270 + Math.floor(i / 28) * 62} cor={i < n123 ? AZ : '#3a4652'} s={0.72} op={L(g, [ts[2] + i * 0.12, ts[2] + 8 + i * 0.12], [0, 1])} />)}
          <T x={110} y={150} s={84} w={900}><tspan fill={AZ}>{n123}</tspan> OF 251</T><T x={114} y={196} s={30} mono cor={AZ}>EMIRATES</T>
          <T x={1812} y={150} s={64} w={900} a="end" op={L(g, [tHalf, tHalf + 10], [0, 1])}>ALMOST <tspan fill={AZ}>HALF</tspan></T>
          <T x={1808} y={196} s={28} mono a="end" cor={C.cinza} op={L(g, [ts[3], ts[3] + 10], [0, 1])}>THE ONLY AIRLINE THAT KEPT ORDERING</T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={960} y={300} s={36} mono a="middle" cor={C.cinza}>EMIRATES CUTS ITS LAST ORDER</T>
          <T x={960} y={470} s={200} w={900} a="middle">2019</T>
          <Carimbo g={g} ini={ts[4] + 60} txt="THE END" x={1480} y={450} tam={80} />
          <T x={960} y={680} s={110} w={900} a="middle" cor={C.vermelho} op={L(g, [tProg, tProg + 10], [0, 1])}>≈€{Math.round(L(g, [tProg, tProg + 40], [0, 25]))} BILLION</T>
          <T x={960} y={770} s={44} w={900} a="middle" op={L(g, [tNev, tNev + 10], [0, 1])}>NEVER EARNED BACK</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 14. a virada: o 747 de passageiros também perdeu ----------
export const CenaVirada: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('virada', i, p);
  const tTw = m(2, 'Airlines wanted'), tBefore = m(3, 'years before');
  const J = (i: number) => janela(g, i === 0 ? -20 : ts[i] - 4, (ts[i + 1] ?? 1e9) + 4);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {J(0) > 0 && <g opacity={J(0)}><T x={960} y={520} s={90} w={900} a="middle">WHAT MOST PEOPLE <tspan fill={C.laranja}>MISS</tspan></T></g>}
        {J(1) > 0 && <g opacity={J(1)}>
          <g transform="translate(700,560) scale(2.2)"><QuadTopo id="v1" v="747" cor={LJ} /></g>
          <g transform={`translate(${900 + (g - ts[1]) * 9},260) scale(0.9)`}><JatoTopo id="v2" /></g>
          <T x={110} y={140} s={64} w={900}>THE 747 <tspan fill={C.vermelho}>LOST</tspan> THAT SAME FIGHT</T>
        </g>}
        {J(2) > 0 && <g opacity={J(2)}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>NEWEST PASSENGER 747</T>
          <T x={520} y={560} s={380} w={900} a="middle" cor={C.vermelho}>{Math.round(L(g, [ts[2] + 6, ts[2] + 40], [0, 36]))}</T><T x={520} y={640} s={40} mono a="middle">SOLD</T>
          {Array.from({ length: 36 }, (_, i) => <Mini key={i} x={1000 + (i % 9) * 92} y={300 + Math.floor(i / 9) * 100} cor={LJ} s={1.1} op={L(g, [ts[2] + 6 + i, ts[2] + 12 + i], [0, 1])} />)}
          <T x={1370} y={800} s={44} w={900} a="middle" op={L(g, [tTw, tTw + 10], [0, 1])}>AIRLINES WANTED <tspan fill={C.verde}>TWINS</tspan></T>
        </g>}
        {J(3) > 0 && <g opacity={J(3)}>
          <T x={110} y={140} s={52} w={900}>AS A <tspan fill={C.laranja}>PASSENGER</tspan> AIRPLANE</T>
          <line x1={300} y1={760} x2={1700} y2={760} stroke="#3a4652" strokeWidth={5} />{[['2012', 300], ['2017', 880], ['2021', 1340], ['2022', 1460]].map(([a, x]) => <g key={a as string}><line x1={x as number} y1={748} x2={x as number} y2={772} stroke={C.texto} strokeWidth={4} /><T x={x as number} y={820} s={30} mono a="middle">{a}</T></g>)}
          <T x={300} y={380} s={30} mono cor={LJ}>747 · PASSENGER VERSION</T><rect x={300} y={400} width={580 * L(g, [ts[3] + 10, ts[3] + 50], [0, 1])} height={70} rx={10} fill={LJ} /><T x={900} y={450} s={34} w={900} cor={C.vermelho} op={L(g, [ts[3] + 50, ts[3] + 60], [0, 1])}>FINISHED</T>
          <T x={300} y={560} s={30} mono cor={AZ}>A380</T><rect x={300} y={580} width={1040 * L(g, [tBefore - 30, tBefore + 20], [0, 1])} height={70} rx={10} fill={AZ} />
        </g>}
        {J(4) > 0 && <g opacity={J(4)}>
          {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${((i * 520 + g * 3) % 2080) - 80},560) scale(1.5)`}><B747Lado id={`v4${i}`} /></g>)}
          <rect x={0} y={625} width={1920} height={10} fill="#39424c" />
          <T x={960} y={280} s={72} w={900} a="middle">STILL BUILDING THEM IN <tspan fill={C.laranja}>2022?</tspan></T>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 15. a corcunda salvou o 747 ----------
export const CenaCarga: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('carga', i, p);
  const tLift = m(1, 'Lift the'), tStr = m(1, 'straight in'), tHund = m(2, 'More than'), t44 = m(3, 'All but'), tOrd = m(4, 'It even'), tNev = m(4, 'never built');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, ts[4] + 4), Dd = janela(g, ts[4] - 4, 1e9);
  const abre = L(g, [tLift, tLift + 40], [0, 1]), entra = L(g, [tLift + 50, tStr + 60], [0, 1]);
  const S = 5.4, px = 520, py = 560;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <g transform={`translate(${px - 40 * L(g, [0, ts[2]], [0, 1], lin)},${py}) scale(${S})`}>
            <B747Lado id="cg1" nariz={abre} trem={0} corcunda={0.6 + 0.4 * Math.sin(g / 5)} />
            <g transform={`translate(${250 - 180 * entra},8)`}><rect x={-45} y={-7} width={90} height={12} rx={3} fill="#8d98a4" stroke="#d5dbe1" strokeWidth={0.8} />{[-30, 0, 30].map((x) => <rect key={x} x={x - 6} y={5} width={12} height={4} fill="#c9a24a" />)}</g>
          </g>
          <T x={110} y={150} s={84} w={900} op={L(g, [2, 10], [0, 1])}>BECAUSE OF THE <tspan fill={C.laranja}>HUMP</tspan></T>
          <T x={110} y={850} s={48} w={900} op={L(g, [tStr, tStr + 10], [0, 1])}>LONG, HEAVY, AWKWARD: <tspan fill={C.laranja}>STRAIGHT IN</tspan></T>
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>THE LAST 747 MODEL</T>
          <T x={520} y={540} s={300} w={900} a="middle" cor={C.laranja}>{Math.round(L(g, [tHund, tHund + 40], [0, 100]))}+</T><T x={520} y={620} s={40} mono a="middle">BUILT AS FREIGHTERS</T>
          {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`translate(${1090 + (i % 3) * 260},${280 + Math.floor(i / 3) * 140}) scale(0.72)`} opacity={L(g, [ts[2] + 10 + i * 5, ts[2] + 20 + i * 5], [0, 1])}><B747Lado id={`cb${i}`} nariz={i % 4 === 1 ? 0.8 : 0} trem={0} /></g>)}
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>747s STILL FLYING · END OF 2022</T>
          {Array.from({ length: 448 }, (_, i) => { const pax = i >= 404; return <circle key={i} cx={140 + (i % 32) * 37} cy={220 + Math.floor(i / 32) * 40} r={12} fill={pax ? '#e3e7ec' : LJ} opacity={L(g, [ts[3] + i * 0.1, ts[3] + 6 + i * 0.1], [0, 1]) * (g >= t44 && !pax ? 0.75 : 1)} stroke={pax && g >= t44 ? '#fff' : 'none'} strokeWidth={3} />; })}
          <T x={1400} y={330} s={84} w={900} cor={LJ}>≈450</T><T x={1404} y={376} s={28} mono>STILL FLYING</T>
          <g opacity={L(g, [t44, t44 + 10], [0, 1])}><T x={1400} y={560} s={64} w={900}>ALL BUT <tspan fill="#fff">44</tspan></T><T x={1404} y={610} s={34} w={900} cor={LJ}>HAULING CARGO</T></g>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <g transform="translate(960,560) scale(4.2)"><A380Lado id="cd" fantasma /></g>
          <T x={110} y={140} s={56} w={900}>THE <tspan fill={AZ}>A380 FREIGHTER</tspan></T>
          <Item x={130} y={770} txt="PLANNED" ok op={L(g, [ts[4] + 20, ts[4] + 30], [0, 1])} tam={44} /><Item x={130} y={846} txt="ORDERED" ok op={L(g, [tOrd, tOrd + 10], [0, 1])} tam={44} />
          <Carimbo g={g} ini={tNev} txt="NEVER BUILT" x={1080} y={500} tam={96} />
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 16. a diferença real ----------
export const CenaIronia: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('ironia', i, p);
  const tItens = [m(1, 'Giant hubs'), m(1, 'full airplanes'), m(1, 'four engines')], tWhen = m(1, 'When that'), tSec = m(2, 'So they'), t50 = m(3, 'kept it alive');
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, 1e9);
  const morto = L(g, [tWhen, tWhen + 20], [0, 1]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}><T x={960} y={520} s={100} w={900} a="middle">THE REAL <tspan fill={C.laranja}>DIFFERENCE</tspan></T></g>}
        {B > 0 && <g opacity={B}>
          <line x1={960} y1={120} x2={960} y2={860} stroke="#2c3743" strokeWidth={4} />
          <g transform="translate(480,400) scale(2.2)" opacity={1 - morto * 0.55}><A380Lado id="i1" trem={0} /></g>
          <T x={480} y={130} s={44} w={900} a="middle">DESIGNED FOR <tspan fill={AZ}>ONE FUTURE</tspan></T>
          {['GIANT HUBS', 'FULL AIRPLANES', 'FOUR ENGINES'].map((t, i) => <Item key={t} x={250} y={570 + i * 84} txt={t} ok={morto > 0.5 ? false : null} op={L(g, [tItens[i], tItens[i] + 8], [0, 1])} tam={44} />)}
          <g opacity={L(g, [ts[2] - 4, ts[2] + 8], [0, 1])}>
            <g transform="translate(1440,400) scale(2.2)"><B747Lado id="i2" trem={0} nariz={L(g, [tSec, tSec + 40], [0, 1])} corcunda={1} /></g>
            <T x={1440} y={130} s={44} w={900} a="middle">DESIGNED BY PEOPLE WHO</T><T x={1440} y={182} s={44} w={900} a="middle" cor={LJ}>EXPECTED TO BE WRONG</T>
            <Item x={1160} y={570} txt="PASSENGERS" ok op={1} tam={44} /><Item x={1160} y={654} txt="A SECOND JOB: CARGO" ok op={L(g, [tSec, tSec + 10], [0, 1])} tam={44} />
          </g>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <g transform={`translate(${200 - 40 * L(g, [ts[3], D], [0, 1], lin)},700) scale(8)`}><B747Lado id="i3" trem={0} corcunda={0.7 + 0.3 * Math.sin(g / 4)} /></g>
          <T x={110} y={150} s={56} w={900}>THE STRANGE PART</T>
          <T x={1812} y={300} s={150} w={900} a="end" cor={C.laranja} op={L(g, [t50 - 6, t50 + 6], [0, 1])}>{Math.round(L(g, [t50, t50 + 40], [0, 50]))} YEARS</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 17. hoje ----------
export const CenaHoje: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('hoje', i, p);
  const tNum = m(0, 'Number one'), tFr = m(0, 'A freighter'), tStill = m(1, 'but the'), tFav = m(1, "and it's");
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, 1e9);
  return (
    <AbsoluteFill style={{ background: CEU }}>
      <SVG>
        <Riscos g={g} n={46} vel={1} k="hj" y0={60} y1={800} />
        {A > 0 && <g opacity={A}>
          <g transform={`translate(${980 + Math.sin(g / 16) * 8},${500 + Math.sin(g / 11) * 5}) scale(4)`}><B747Lado id="h1" trem={0} /></g>
          <T x={110} y={140} s={56} w={900}>JANUARY <tspan fill={C.laranja}>2023</tspan> · THE LAST 747</T>
          <T x={110} y={850} s={110} w={900} cor={C.laranja} op={L(g, [tNum, tNum + 8], [0, 1])}>No. {Math.round(L(g, [tNum, tNum + 50], [0, 1574])).toLocaleString('en-US')}</T>
          <T x={1812} y={850} s={56} w={900} a="end" op={L(g, [tFr, tFr + 8], [0, 1])}>A <tspan fill={C.laranja}>FREIGHTER</tspan></T>
        </g>}
        {B > 0 && <g opacity={B}>
          <g transform={`translate(${980 + Math.sin(g / 16) * 8},${540 + Math.sin(g / 11) * 5}) scale(3.6)`}><A380Lado id="h2" trem={0} /></g>
          <T x={110} y={140} s={56} w={900}>THE A380: <tspan fill={C.cinza}>PRODUCTION ENDED</tspan></T>
          <Item x={130} y={850} txt="STILL FLYING" ok op={L(g, [tStill, tStill + 10], [0, 1])} tam={60} />
          <T x={1812} y={850} s={44} w={900} a="end" cor={AZ} op={L(g, [tFav, tFav + 10], [0, 1])}>STILL A PASSENGER FAVORITE</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 18. final ----------
const U2: React.FC = () => (
  <g>
    <path d="M30,-8 L-10,-150 L-30,-150 L-20,-8 Z M30,8 L-10,150 L-30,150 L-20,8 Z" fill="#2a313a" stroke="#8a95a1" strokeWidth={1.2} strokeLinejoin="round" />
    <path d="M-80,-6 L-92,-40 L-104,-40 L-98,-6 Z M-80,6 L-92,40 L-104,40 L-98,6 Z" fill="#2a313a" stroke="#8a95a1" strokeWidth={1.2} />
    <path d="M100,0 C96,-6 80,-8 60,-8 L-90,-6 L-110,-2 L-110,2 L-90,6 L60,8 C80,8 96,6 100,0 Z" fill="#3a424c" stroke="#8a95a1" strokeWidth={1.2} /><path d="M84,-3 L72,-5 L72,5 L84,3 Z" fill="#7fb4d8" />
  </g>
);
export const CenaFinal: React.FC<CenaProps> = ({ g, D, ts }) => {
  const card = L(g, [ts[3] - 4, ts[3] + 14], [0, 1]);
  const m = (i: number, p: string) => marca('final', i, p), tCar = m(3, 'that a sports'), tU2 = m(3, 'The U two');
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {card < 1 && <g>
          <g transform="translate(1180,300) scale(2.7)" opacity={g >= ts[2] ? 0.35 : 1}><A380Lado id="fz1" trem={0} /></g>
          <g transform="translate(1180,640) scale(2.7)" opacity={g >= ts[2] ? 1 : 0.35}><B747Lado id="fz2" trem={0} corcunda={g >= ts[2] ? 0.7 + 0.3 * Math.sin(g / 4) : 0} nariz={L(g, [ts[2] + 20, ts[2] + 60], [0, 0.9])} /></g>
          <T x={110} y={260} s={52} w={900} op={janela(g, 6, ts[1])}>NOT <tspan fill={C.cinza}>TOO BIG</tspan></T>
          <T x={110} y={300} s={64} w={900} op={janela(g, ts[1], ts[2])}>ONLY <tspan fill={AZ}>ONE THING</tspan></T>
          <T x={110} y={640} s={64} w={900} op={L(g, [ts[2], ts[2] + 10], [0, 1])}>SAVED BY A <tspan fill={C.laranja}>HUMP</tspan></T>
        </g>}
        {card > 0 && <g opacity={card}>
          <rect width={1920} height={1080} fill={C.fundo} opacity={0.94} />
          <rect x={150} y={230} width={980} height={600} rx={22} fill="#0f151c" stroke={C.laranja} strokeWidth={3} />
          <text x={190} y={300} fill={C.laranja} fontFamily={MONO} fontSize={28} letterSpacing={6}>NEXT</text>
          <rect x={150} y={560} width={980} height={70} fill="#262b31" /><line x1={150} y1={595} x2={1130} y2={595} stroke={C.linha} strokeWidth={3} strokeDasharray="40 30" />
          <g transform={`translate(${700 + Math.sin(g / 12) * 6},470) scale(1.5)`}><U2 /></g>
          <g transform={`translate(${L(g, [tCar, tCar + 60], [180, 520])},596)`} opacity={L(g, [tCar - 6, tCar + 6], [0, 1])}><rect x={-34} y={-15} width={68} height={30} rx={10} fill={C.vermelho} /><rect x={-8} y={-11} width={22} height={22} rx={5} fill="#1e2833" /></g>
          <T x={190} y={760} s={46} w={900} op={L(g, [tU2 - 10, tU2], [0, 1])}>WHY A CAR CHASES THE U-2</T>
          <rect x={1190} y={330} width={580} height={400} rx={22} fill="#0f151c" stroke="#2c3743" strokeWidth={3} />
          <text x={1480} y={520} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={56}>CROSSWIND</text>
          <text x={1480} y={580} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={24} letterSpacing={3}>SUBSCRIBE FOR MORE</text>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};
