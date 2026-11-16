import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { ASA_SR, C, Carimbo, CenaProps, Chama, Cota, Emenda, Gota, Grade, Ilustracao, Item, JatoTopo, K, L, MONO, Painel, Poca, pop, Riscos, Rot, SANS, Seta, SR71Lado, SR71Topo, T, Termo, janela, marca, mix, rad } from './lib';
import { CeuPatio, FONTES, Pessoa } from './cenas1';
import { Tanques } from './cenas2';

const lin = (t: number) => t;
const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>{children}</svg>;
const CEU = 'linear-gradient(180deg,#02050a 0%,#081626 50%,#17385a 100%)';
const Patio: React.FC<{ g: number; id: string; pingos?: boolean; raio?: number }> = ({ g, id, pingos = true, raio = 130 }) => (
  <g>
    <CeuPatio g={g} />
    <ellipse cx={930} cy={772} rx={720} ry={16} fill="#000" opacity={0.38} />
    {FONTES.map((lx, k) => <Poca key={k} x={960 + lx * 5 + (k % 2 ? 14 : -8)} y={776 + (k % 3) * 9} rx={raio + (k % 3) * 26} f={g} k={k} />)}
    <g transform="translate(960,577.5) scale(5)"><SR71Lado id={id} /></g>
    {pingos && FONTES.map((lx, k) => <Gota key={k} g={g + 40} ini={k * 5} x={960 + lx * 5} y0={577.5 + (lx < -5 ? 11 : 8.5) * 5} yg={772} per={26 + (k * 7) % 13} esc={1.25} />)}
  </g>
);

// ---------- 10. no ar, ele se veda ----------
export const CenaSelar: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('selar', i, p);
  const tM = m(1, 'The metal'), tG = m(1, 'The gaps'), tSeal = m(2, 'and the tanks'), tIts = m(3, "It's what");
  const heat = L(g, [ts[1], ts[2] + 10], [0, 1]);
  const fimOp = L(g, [ts[3] - 6, ts[3] + 8], [0, 1]);
  return (
    <AbsoluteFill style={{ background: CEU }}>
      <SVG>
        <Riscos g={g} n={54} vel={L(g, [0, ts[2]], [0.3, 1.7])} y0={40} y1={420} k="se" />
        <g transform={`translate(${1000 + Math.sin(g / 17) * 8},${250 + Math.sin(g / 11) * 4 - L(g, [0, 50], [-30, 0])}) rotate(${L(g, [0, 60], [-5, 0])}) scale(3.3)`}><SR71Lado id="se" trem={L(g, [10, 40], [1, 0])} pos={1} calor={heat} /></g>
        <T x={110} y={130} s={84} w={900}>MACH <tspan fill={C.laranja}>{L(g, [10, ts[2] + 20], [0.3, 3.2]).toFixed(1)}</tspan></T>
        <T x={1812} y={130} s={84} w={900} a="end" cor={mix(heat, C.azul, K.quente)}>{Math.round(70 + 530 * heat)}°F</T>
        <g opacity={1 - fimOp}>
          <Item x={150} y={520} txt="SKIN HEATS UP" ok op={L(g, [ts[1] + 4, ts[1] + 12], [0, 1])} tam={46} />
          <Item x={150} y={610} txt="METAL GROWS" ok op={L(g, [tM, tM + 8], [0, 1])} tam={46} />
          <Item x={150} y={700} txt="GAPS CLOSE" ok op={L(g, [tG, tG + 8], [0, 1])} tam={46} />
          <g transform="translate(1230,560) scale(1.25) translate(-1230,-560)"><Emenda g={g} x={900} y={560} w={660} folga={22 * (1 - heat)} calor={heat} fuel={1} id="em3" /></g>
          <T x={1230} y={400} s={24} mono a="middle" cor={C.cinza}>ONE SEAM · CLOSE-UP</T>
          <Carimbo g={g} ini={tSeal} txt="SEALED" cor={C.verde} x={1230} y={770} fim={ts[3] + 2} tam={64} />
        </g>
        <g opacity={fimOp}>
          <rect x={0} y={380} width={1920} height={520} fill="#04080e" opacity={0.78} />
          <T x={960} y={560} s={110} w={900} a="middle">NOT A <tspan fill={C.laranja}>FLAW</tspan></T>
          <T x={960} y={680} s={46} w={900} a="middle" op={L(g, [tIts, tIts + 10], [0, 1])}>A MACH 3 AIRPLANE, <tspan fill={K.fuel}>STANDING STILL</tspan></T>
        </g>
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 11. o combustível que apaga fósforo ----------
const Calorzinho: React.FC<{ x: number; y: number; txt: string; frio: number; g: number; px: number; py: number }> = ({ x, y, txt, frio, g, px, py }) => (
  <g>
    <line x1={x} y1={y + 46} x2={px} y2={py} stroke={mix(frio, K.quente, C.azul)} strokeWidth={3} strokeDasharray="6 8" />
    <circle cx={x} cy={y} r={46} fill="#0f151c" stroke={mix(frio, K.quente, C.azul)} strokeWidth={5} />
    {[-16, 0, 16].map((d) => <path key={d} d={`M${x + d},${y + 20} q-9,-10 0,-20 q9,-10 0,-20`} fill="none" stroke={mix(frio, K.quente, C.azul)} strokeWidth={5} strokeLinecap="round" opacity={1 - frio * 0.6} transform={`translate(0,${Math.sin(g / 4 + d) * 2 * (1 - frio)})`} />)}
    <T x={x} y={y - 64} s={26} mono a="middle">{txt}</T>
    <T x={x} y={y + 96} s={22} mono a="middle" cor={C.azul} op={frio}>COOLED</T>
  </g>
);
export const CenaFosforo: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('fosforo', i, p);
  const tHow = m(0, 'How is'), tMade = m(1, 'and it was'), tDrop = m(2, 'drop a lit'), tOut = m(2, 'and the match'), tCool = m(3, 'In flight');
  const tC = [m(3, 'the cockpit'), m(3, 'the sensors'), m(3, 'and the hydraulics')], tBurn = m(3, 'before it'), tHyd = m(3, 'The engines even');
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, ts[2] + 4), Cc = janela(g, ts[2] - 4, ts[3] + 30), Dd = janela(g, ts[3] + 26, ts[4] + 4), E = janela(g, ts[4] - 4, 1e9);
  const cai = L(g, [tDrop + 8, tDrop + 34], [0, 1], (t) => t * t), my = 200 + 480 * cai;
  const apaga = L(g, [tDrop + 36, tDrop + 52], [1, 0]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <Patio g={g} id="fa" />
          {[0, 1].map((i) => <Pessoa key={i} x={1480 + i * 70} y={800 + i * 8} fase={0.4 + i} />)}
          <g transform={`translate(250,250) scale(${0.8 + 0.05 * Math.sin(g / 5)})`}><path d="M0,-150 L150,110 L-150,110 Z" fill="rgba(255,77,77,.14)" stroke={C.vermelho} strokeWidth={10} strokeLinejoin="round" /><text x={0} y={80} textAnchor="middle" fill={C.vermelho} fontFamily={SANS} fontWeight={900} fontSize={170}>!</text></g>
          <T x={430} y={250} s={56} w={900} op={L(g, [tHow, tHow + 10], [0, 1])}>HOW IS THAT <tspan fill={C.vermelho}>NOT A DISASTER?</tspan></T>
        </g>}
        {B > 0 && <g opacity={B}>
          <g transform={`translate(520,500) scale(${0.95 + 0.05 * pop(g, ts[1] + 2)})`}>
            <rect x={-170} y={-250} width={340} height={500} rx={34} fill="#232b34" stroke="#8f99a5" strokeWidth={5} />
            {[-150, 0, 150].map((y) => <rect key={y} x={-178} y={y - 9} width={356} height={18} rx={8} fill="#39434e" stroke="#8f99a5" strokeWidth={3} />)}
            <text x={0} y={-48} textAnchor="middle" fill={K.fuel} fontFamily={SANS} fontWeight={900} fontSize={120}>JP-7</text>
            <text x={0} y={96} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={26} letterSpacing={4}>JET PROPELLANT 7</text>
          </g>
          <T x={860} y={330} s={64} w={900}>NOT NORMAL</T><T x={860} y={404} s={64} w={900}>JET FUEL</T>
          <Item x={880} y={540} txt="MADE FOR THE BLACKBIRD" ok op={L(g, [tMade, tMade + 10], [0, 1])} tam={46} />
          <Item x={880} y={630} txt="VERY HARD TO IGNITE" ok op={L(g, [tMade + 40, tMade + 50], [0, 1])} tam={46} />
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>REPORTEDLY</T>
          <ellipse cx={960} cy={720} rx={560} ry={70} fill="#17130f" stroke={K.fuel} strokeWidth={3} />
          <ellipse cx={860 + Math.sin(g / 20) * 30} cy={708} rx={240} ry={16} fill={K.fuel2} opacity={0.35} />
          <T x={960} y={830} s={30} mono a="middle" cor={K.fuel}>PUDDLE OF JP-7</T>
          {g >= tDrop && <g transform={`translate(960,${my}) rotate(${-30 + 50 * cai})`}>
            <rect x={-6} y={0} width={12} height={150} rx={4} fill="#d8b98a" stroke="#7d6c4a" strokeWidth={2} /><ellipse cx={0} cy={0} rx={12} ry={16} fill={apaga > 0.2 ? '#7a2a1a' : '#2a2a2a'} />
            <Chama x={0} y={-20} s={0.9 * apaga} g={g} op={apaga} />
          </g>}
          {cai >= 1 && [0, 1, 2].map((i) => { const q = L(g, [tDrop + 40 + i * 8, tDrop + 90 + i * 8], [0, 1]); return <circle key={i} cx={960 + Math.sin(i * 2 + q * 4) * 30} cy={640 - q * 260} r={18 + q * 44} fill="#9aa4af" opacity={(1 - q) * 0.45} />; })}
          {cai >= 1 && [0, 1].map((r) => { const q = L(g, [tDrop + 34 + r * 8, tDrop + 60 + r * 8], [0, 1]); return <ellipse key={r} cx={960} cy={690} rx={30 + q * 150} ry={5 + q * 20} fill="none" stroke={K.fuel2} strokeWidth={3} opacity={1 - q} />; })}
          <Item x={1180} y={330} txt="THE MATCH GOES OUT" ok op={L(g, [tOut + 14, tOut + 24], [0, 1])} tam={50} />
          <T x={110} y={330} s={56} w={900} op={L(g, [ts[3], ts[3] + 10], [0, 1])}>IT <tspan fill={C.laranja}>HAD</tspan> TO BE THAT STABLE</T>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <T x={110} y={120} s={50} w={900}>THE FUEL WAS ALSO THE <tspan fill={C.azul}>COOLANT</tspan></T>
          <g transform="translate(960,560) scale(3.9)"><SR71Topo id="fd" pos={L(g, [tBurn, tBurn + 14], [0, 1])} /><Tanques n={6} op={0.8} /></g>
          <path d="M1340,560 L700,560 M900,560 L820,700 L460,700 M900,560 L820,420 L460,420" fill="none" stroke={K.fuel2} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={g * 2.2} strokeLinecap="round" />
          <Calorzinho x={1340} y={300} txt="COCKPIT" g={g} px={1340} py={548} frio={L(g, [tC[0], tC[0] + 24], [0, 1])} />
          <Calorzinho x={1130} y={300} txt="SENSORS" g={g} px={1130} py={548} frio={L(g, [tC[1], tC[1] + 24], [0, 1])} />
          <Calorzinho x={920} y={300} txt="HYDRAULICS" g={g} px={920} py={548} frio={L(g, [tC[2], tC[2] + 24], [0, 1])} />
          <g opacity={L(g, [tBurn, tBurn + 10], [0, 1])}><T x={110} y={470} s={30} mono cor={K.quente}>THEN BURNED</T><Seta x1={250} y1={490} x2={380} y2={540} cor={K.quente} w={4} /></g>
          <g opacity={L(g, [tHyd, tHyd + 10], [0, 1])}><T x={110} y={836} s={36} w={900}>ENGINE HYDRAULIC FLUID, TOO</T><Seta x1={420} y1={800} x2={520} y2={722} cor={C.laranja} w={4} /></g>
        </g>}
        {E > 0 && <g opacity={E}>
          <ellipse cx={960} cy={720} rx={560} ry={70} fill="#17130f" stroke={K.fuel} strokeWidth={3} />
          {Array.from({ length: 9 }, (_, i) => { const q = ((g + i * 9) % 30) / 30; return <circle key={i} cx={700 + i * 64 + Math.sin(i * 3) * 20} cy={650 - q * 60} r={4} fill={C.laranja} opacity={(1 - q) * 0.9} />; })}
          <T x={960} y={330} s={84} w={900} a="middle">HOW DO YOU <tspan fill={C.laranja}>LIGHT IT?</tspan></T>
          <T x={960} y={520} s={200} w={900} a="middle" cor={C.laranja} op={0.7 + 0.3 * Math.sin(g / 4)}>?</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 12. TEB ----------
const Pluma: React.FC<{ x: number; y: number; len: number; h: number; verde?: number; g: number }> = ({ x, y, len, h, verde = 0, g }) => len <= 0 ? null : (
  <g>
    <path d={`M${x},${y - h} L${x - len},${y + Math.sin(g / 2) * 4} L${x},${y + h} Z`} fill={mix(verde, '#ff8a2a', '#39e07a')} opacity={0.75} />
    <path d={`M${x},${y - h * 0.55} L${x - len * 0.62},${y} L${x},${y + h * 0.55} Z`} fill={mix(verde, '#fff1c9', '#eafff2')} />
    {verde < 0.5 && Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={x - 40 - (i * len) / 7} cy={y} rx={len / 26} ry={h * (0.42 - i * 0.06)} fill="#fff" opacity={0.55 + 0.2 * Math.sin(g / 2 + i)} />)}
  </g>
);
export const CenaTeb: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('teb', i, p);
  const tTeb = m(0, 'T E B'), tStart = m(2, 'to start'), tAb = m(2, 'and another'), tGreen = m(2, "That's the"), tUse = m(3, 'Use them');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, 1e9);
  const boom = L(g, [ts[1] + 26, ts[1] + 40], [0, 1]);
  const v1 = L(g, [tStart, tStart + 5, tStart + 22], [0, 1, 0]), v2 = L(g, [tAb + 16, tAb + 21, tAb + 40], [0, 1, 0]);
  const motor = L(g, [tStart + 8, tStart + 30], [0, 0.35]), ab = L(g, [tAb + 24, tAb + 50], [0, 1]);
  const usados = Math.floor(L(g, [ts[3] + 16, tUse + 40], [0, 16], lin));
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <T x={150} y={330} s={84} w={900} op={L(g, [6, 16], [0, 1])}>TRIETHYLBORANE</T>
          <T x={150} y={560} s={230} w={900} cor="#39e07a" op={L(g, [tTeb, tTeb + 8], [0, 1])}>TEB</T>
          <g opacity={L(g, [ts[1] - 6, ts[1] + 6], [0, 1])}>
            <rect x={1180} y={610} width={360} height={60} rx={10} fill="#232b34" stroke="#8f99a5" strokeWidth={4} /><rect x={1330} y={540} width={60} height={80} fill="#232b34" stroke="#8f99a5" strokeWidth={4} />
            <circle cx={1360} cy={L(g, [ts[1] + 6, ts[1] + 26], [520, 420])} r={16 * (1 - boom)} fill="#9df5c0" />
            <Chama x={1360} y={420} s={3.2 * boom * (0.92 + 0.08 * Math.sin(g / 2))} g={g} verde op={boom} />
            <T x={1360} y={760} s={30} mono a="middle" cor="#39e07a" op={boom}>IGNITES ON CONTACT WITH AIR</T>
          </g>
        </g>}
        {B > 0 && <g opacity={B} transform={`translate(${Math.sin(g * 2.3) * 2 * ab},0)`}>
          <Pluma x={1085} y={480} len={90 + 150 * (motor / 0.35) + 620 * ab} h={46} verde={Math.max(v1, v2)} g={g} />
          <g transform="translate(2280,471) scale(9)"><SR71Lado id="tb" trem={0} /></g>
          <circle cx={1040} cy={480} r={90 + 80 * Math.max(v1, v2)} fill="#39e07a" opacity={Math.max(v1, v2) * 0.55} style={{ filter: 'blur(20px)' }} />
          <g opacity={L(g, [tStart - 10, tStart], [0, 1])}><T x={110} y={150} s={34} mono cor="#39e07a">TEB SHOT #1 · ENGINE START</T></g>
          <g opacity={L(g, [tAb + 6, tAb + 16], [0, 1])}><T x={110} y={206} s={34} mono cor="#39e07a">TEB SHOT #2 · AFTERBURNER</T></g>
          <T x={110} y={800} s={72} w={900} op={L(g, [tGreen, tGreen + 10], [0, 1])}>THE <tspan fill="#39e07a">GREEN</tspan> FLASH</T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={150} y={200} s={34} mono cor={C.cinza}>TEB ON BOARD · PER ENGINE</T>
          {Array.from({ length: 16 }, (_, i) => { const vazio = i < usados; return <g key={i}><rect x={150 + (i % 8) * 118} y={260 + Math.floor(i / 8) * 150} width={96} height={120} rx={14} fill={vazio ? '#111820' : 'rgba(57,224,122,.22)'} stroke={vazio ? '#3a4652' : '#39e07a'} strokeWidth={4} />{!vazio && <rect x={164 + (i % 8) * 118} y={300 + Math.floor(i / 8) * 150} width={68} height={66} rx={8} fill="#39e07a" opacity={0.85} />}</g>; })}
          <T x={1812} y={420} s={230} w={900} a="end" cor={usados >= 16 ? C.vermelho : '#39e07a'}>{16 - usados}</T>
          <T x={1808} y={480} s={34} mono a="end">SHOTS LEFT (ABOUT 16 TOTAL)</T>
          <Carimbo g={g} ini={tUse + 44} txt="NO RELIGHT" x={960} y={720} tam={76} />
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 13. o mito do reabastecimento ----------
export const CenaMito: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('mito', i, p);
  const tEmpty = m(1, 'take off'), tRef = m(1, 'and refuel'), tP = m(2, 'It did take'), tTk = m(2, 'And it did'), tSay = m(3, 'say the leaks'), tLose = m(3, 'It simply'), tAgain = m(4, 'Again');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, ts[4] + 4), Dd = janela(g, ts[4] - 4, 1e9);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <Painel x={150} y={150} w={1620} h={700} cor={C.laranja}>
            <T x={210} y={230} s={34} mono cor={C.laranja}>THE FAMOUS STORY</T>
            <text x={1640} y={330} fill={C.laranja} fontFamily={SANS} fontWeight={900} fontSize={260} opacity={0.25}>”</text>
            <T x={960} y={330} s={60} w={900} a="middle" op={janela(g, 14, ts[1] - 2)}>YOU'VE PROBABLY <tspan fill={C.laranja}>HEARD THIS ONE</tspan></T>
            <g opacity={L(g, [24, 40], [0, 1]) * (g < ts[1] ? 0.55 : 1)} transform={`translate(0,${g < ts[1] ? 60 : L(g, [ts[1], ts[1] + 10], [60, 0])})`}><g transform="translate(620,470) scale(2.6)"><SR71Lado id="mi" /></g></g>
            <g opacity={L(g, [ts[1] - 4, ts[1] + 8], [0, 1])}>
              {[-100, -70, -40, -10, 20, 50].map((lx, k) => <Gota key={k} g={g} ini={ts[1] + k * 3} x={620 + lx * 2.6} y0={470 + 26} yg={610} per={12 + (k % 3) * 3} esc={1.4} />)}
              <ellipse cx={600} cy={618} rx={Math.max(0, Math.min(330, (g - ts[1]) * 3))} ry={18} fill="#17130f" stroke={K.fuel} strokeWidth={2} />
              <T x={250} y={720} s={46} w={900}>“IT LEAKED SO BADLY…”</T>
            </g>
            <g opacity={L(g, [tEmpty, tEmpty + 10], [0, 1])}>
              <path d="M1240,520 A130,130 0 0 1 1500,520" fill="none" stroke="#8f99a5" strokeWidth={10} /><path d="M1240,520 A130,130 0 0 1 1262,455" fill="none" stroke={C.vermelho} strokeWidth={10} />
              <line x1={1370} y1={520} x2={1370 - 110 * Math.cos(rad(18 + 4 * Math.sin(g / 5)))} y2={520 - 110 * Math.sin(rad(18 + 4 * Math.sin(g / 5)))} stroke={C.texto} strokeWidth={7} strokeLinecap="round" />
              <T x={1232} y={570} s={30} mono a="middle" cor={C.vermelho}>E</T><T x={1510} y={570} s={30} mono a="middle">F</T>
              <T x={1370} y={640} s={30} mono a="middle">“ALMOST EMPTY”</T>
            </g>
            <T x={1000} y={720} s={40} w={900} op={L(g, [tRef, tRef + 10], [0, 1])}>“…IT HAD TO REFUEL RIGHT AWAY”</T>
          </Painel>
        </g>}
        {B > 0 && <AbsFundo />}
        {B > 0 && <g opacity={B}>
          <Riscos g={g} n={40} vel={0.8} k="mi" />
          <T x={110} y={140} s={72} w={900}>HALF OF THAT IS <tspan fill={C.verde}>TRUE</tspan></T>
          <line x1={1210} y1={430} x2={1010} y2={560} stroke="#c3cad2" strokeWidth={6} opacity={L(g, [tTk, tTk + 14], [0, 1])} />
          <g transform={`translate(${1400 + Math.sin(g / 15) * 6},${400 + Math.sin(g / 10) * 4}) scale(1.7)`} opacity={L(g, [tTk - 10, tTk], [0, 1])}><JatoTopo id="mt" /></g>
          <g transform={`translate(${860 + Math.sin(g / 13) * 6},${580 + Math.sin(g / 9) * 4}) scale(1.6)`}><SR71Topo id="ms" pos={0.6} /></g>
          <T x={1400} y={720} s={26} mono a="middle" cor={C.cinza} op={L(g, [tTk, tTk + 10], [0, 1])}>TANKER</T>
          <Item x={150} y={300} txt="PARTIAL FUEL AT TAKEOFF" ok op={L(g, [tP, tP + 10], [0, 1])} tam={40} />
          <Item x={150} y={380} txt="TANKER, MINUTES LATER" ok op={L(g, [tTk, tTk + 10], [0, 1])} tam={40} />
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={960} y={330} s={34} mono a="middle" cor={C.cinza}>THE REASON?</T>
          <T x={960} y={470} s={110} w={900} a="middle">“BECAUSE OF THE LEAKS”</T>
          <Carimbo g={g} ini={tSay + 16} txt="MYTH" x={1400} y={290} tam={96} />
          <Painel x={460} y={600} w={1000} h={200} op={L(g, [ts[3] + 10, ts[3] + 22], [0, 1])}>
            <T x={960} y={670} s={26} mono a="middle" cor={C.laranja}>ACCORDING TO COL. RICHARD GRAHAM, SR-71 PILOT</T>
            <T x={960} y={750} s={46} w={900} a="middle" op={L(g, [tLose, tLose + 10], [0, 1])}>IT DIDN'T LOSE THAT MUCH FUEL</T>
          </Painel>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <T x={860} y={380} s={40} mono a="middle" cor={C.cinza}>THE REAL REASON</T>
          <T x={860} y={560} s={220} w={900} a="middle" cor={K.quente}>HEAT.</T>
          <T x={860} y={700} s={90} w={900} a="middle" op={L(g, [tAgain, tAgain + 6], [0, 1])}>AGAIN.</T>
          <Termo x={1500} y={640} h={320} frac={L(g, [ts[4], ts[4] + 50], [0.1, 1])} />
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};
const AbsFundo: React.FC = () => <rect width={1920} height={1080} fill="#06101a" opacity={0.6} />;

// ---------- 14. o motivo real: nitrogênio ----------
const TanqueCorte: React.FC<{ g: number; nivel: number; n2: number; fumos: number; ar: number }> = ({ g, nivel, n2, fumos, ar }) => {
  const X = 520, Y = 240, W = 880, H = 460, yN = Y + H - (H - 16) * nivel;
  const pts = (k: string, cor: string, op: number, r = 7) => op <= 0 ? null : Array.from({ length: 70 }, (_, i) => {
    const x = X + 30 + random(`${k}x${i}`) * (W - 60) + Math.sin(g / 9 + i) * 8, yy = Y + 26 + random(`${k}y${i}`) * (H - 50) + Math.cos(g / 7 + i * 2) * 8;
    return yy < yN - 14 ? <circle key={i} cx={x} cy={yy} r={r} fill={cor} opacity={op * (0.5 + 0.4 * random(`${k}o${i}`))} /> : null;
  });
  return (
    <g>
      <defs><clipPath id="tqc"><rect x={X + 8} y={Y + 8} width={W - 16} height={H - 16} rx={40} /></clipPath></defs>
      <rect x={X} y={Y} width={W} height={H} rx={48} fill="#0c1218" stroke="#aeb9c4" strokeWidth={8} />
      <g clipPath="url(#tqc)">
        <path d={`M${X},${yN} ${Array.from({ length: 23 }, (_, i) => `L${X + (W * i) / 22},${yN + Math.sin(g / 8 + i) * 5}`).join(' ')} L${X + W},${Y + H} L${X},${Y + H} Z`} fill={K.fuel} opacity={0.82} />
        {pts('fu', K.quente, fumos)}{pts('ar', '#b7c1cc', ar, 6)}{pts('n2', C.azul, n2)}
      </g>
      <T x={X + 40} y={Y + H - 34} s={30} mono cor="#3a2a10">JP-7</T>
    </g>
  );
};
const MiniTanque: React.FC<{ x: number; y: number; op: number }> = ({ x, y, op }) => <path opacity={op} transform={`translate(${x},${y})`} d="M30,0 L22,-3 L4,-3 L-8,-26 L-13,-26 L-7,-3 L-22,-2 L-27,-11 L-30,-11 L-28,0 L-30,11 L-27,11 L-22,2 L-7,3 L-13,26 L-8,26 L4,3 L22,3 Z" fill="#c3cad2" />;
export const CenaNitrogenio: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('nitrogenio', i, p);
  const tIgn = m(0, 'could ignite'), tCant = m(1, 'A gas'), tFill = m(2, 'fill the tanks'), tPush = m(2, 'pushing'), tLet = m(2, 'and let'), tSafe = m(3, 'and safer'), t56 = m(4, 'Fifty six'), t32 = m(4, 'for thirty');
  const tanque = janela(g, -20, ts[3] + 4), cards = janela(g, ts[3] - 4, ts[4] + 4), frota = janela(g, ts[4] - 4, 1e9);
  const f2 = g >= ts[2];
  const nivel = !f2 ? 0.42 : g < tLet ? L(g, [tFill, tPush + 40], [0.42, 1]) : L(g, [tLet, ts[3]], [1, 0.5]);
  const n2 = !f2 ? L(g, [ts[1], ts[1] + 30], [0, 1]) : L(g, [tLet, tLet + 20], [0, 1]);
  const fumos = !f2 ? L(g, [ts[1], ts[1] + 30], [1, 0]) : 0;
  const ar = f2 && g < tLet ? 1 : 0;
  const mach = L(g, [6, ts[0] + 70], [2.0, 2.6]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {tanque > 0 && <g opacity={tanque}>
          <TanqueCorte g={g} nivel={nivel} n2={n2} fumos={fumos} ar={ar} />
          {!f2 && <T x={110} y={130} s={34} mono cor={C.cinza}>ONE FUEL TANK · CUT THROUGH</T>}
          {!f2 && <>
            <T x={110} y={310} s={64} w={900} cor={mach >= 2.6 ? C.vermelho : C.texto}>MACH</T><T x={110} y={440} s={130} w={900} cor={mach >= 2.6 ? C.vermelho : C.laranja}>{mach.toFixed(1)}</T>
            <g opacity={janela(g, 30, ts[1] + 4)}><T x={1460} y={330} s={34} mono cor={K.quente}>HOT FUMES</T><T x={1460} y={376} s={34} mono cor={K.quente}>+ AIR</T><Seta x1={1450} y1={320} x2={1330} y2={330} cor={K.quente} w={4} /></g>
            <g opacity={janela(g, tIgn, ts[1] + 4)} transform={`translate(960,${330 + Math.sin(g) * 3}) scale(${0.8 + 0.3 * Math.abs(Math.sin(g / 3))})`}><path d="M0,-60 L14,-16 L58,-22 L22,6 L40,50 L0,22 L-40,50 L-22,6 L-58,-22 L-14,-16 Z" fill="#ffe1a6" stroke={C.laranja} strokeWidth={5} /></g>
            <g opacity={L(g, [ts[1] + 10, ts[1] + 22], [0, 1])}><T x={1460} y={330} s={60} w={900} cor={C.azul}>NITROGEN</T><Item x={1480} y={420} txt="CAN'T BURN" ok op={L(g, [tCant, tCant + 10], [0, 1])} tam={44} /></g>
          </>}
          {f2 && <>
            <g opacity={janela(g, tFill - 10, tLet)}><path d={`M300,120 L640,120 L640,${250}`} fill="none" stroke="#c3cad2" strokeWidth={14} strokeLinejoin="round" /><path d={`M300,120 L640,120 L640,250`} fill="none" stroke={K.fuel} strokeWidth={6} strokeDasharray="16 14" strokeDashoffset={-g * 3} /><T x={110} y={104} s={26} mono>FROM THE TANKER</T></g>
            <g opacity={janela(g, tPush, tLet)}><rect x={1270} y={196} width={30} height={50} fill="#aeb9c4" /><Seta x1={1285} y1={190} x2={1285} y2={100 - 8 * Math.sin(g / 4)} cor="#b7c1cc" w={6} /><T x={1320} y={130} s={26} mono cor="#b7c1cc">AIR PUSHED OUT</T></g>
            <T x={110} y={330} s={27} mono cor={g < tPush ? C.laranja : C.cinza}>1 · FILL TO THE TOP</T>
            <T x={110} y={390} s={27} mono cor={g >= tPush && g < tLet ? C.laranja : C.cinza} op={L(g, [tPush, tPush + 8], [0.25, 1])}>2 · AIR GOES OUT</T>
            <T x={110} y={450} s={27} mono cor={g >= tLet ? C.azul : C.cinza} op={L(g, [tLet, tLet + 8], [0.25, 1])}>3 · NITROGEN IN</T>
            <T x={1460} y={330} s={60} w={900} cor={C.azul} op={L(g, [tLet, tLet + 10], [0, 1])}>N₂</T>
            <T x={1460} y={600} s={90} w={900} cor={K.fuel}>{Math.round(nivel * 100)}%</T><T x={1464} y={640} s={24} mono cor={C.cinza}>FUEL</T>
          </>}
        </g>}
        {cards > 0 && <g opacity={cards}>
          <T x={960} y={200} s={52} w={900} a="middle">A LIGHTER TAKEOFF ALSO MEANT</T>
          <Painel x={200} y={280} w={700} h={480}>
            <circle cx={550} cy={470} r={110} fill="#0c0e11" stroke="#9aa4af" strokeWidth={10} /><circle cx={550} cy={470} r={46} fill="#c9d0d7" />{Array.from({ length: 12 }, (_, i) => <line key={i} x1={550 + 80 * Math.cos(i * 0.52 + g / 12)} y1={470 + 80 * Math.sin(i * 0.52 + g / 12)} x2={550 + 104 * Math.cos(i * 0.52 + g / 12)} y2={470 + 104 * Math.sin(i * 0.52 + g / 12)} stroke="#39424c" strokeWidth={6} />)}
            <Item x={270} y={690} txt="KINDER TO THE TIRES" ok op={L(g, [ts[3] + 30, ts[3] + 40], [0, 1])} tam={40} />
          </Painel>
          <Painel x={1020} y={280} w={700} h={480}>
            <g transform="translate(1370,470) scale(2.2)"><SR71Topo id="nc" pos={1} /><path d="M-133,30 L-150,36 L-133,42 Z" fill="#0d0f12" /><rect x={-170} y={28} width={40} height={16} fill="rgba(13,20,28,.92)" /><path d="M-150,26 L-136,46 M-136,26 L-150,46" stroke={C.vermelho} strokeWidth={2.5} /></g>
            <Item x={1090} y={690} txt="SAFER IF AN ENGINE QUITS" ok op={L(g, [tSafe, tSafe + 10], [0, 1])} tam={40} />
          </Painel>
        </g>}
        {frota > 0 && <g opacity={frota}>
          <T x={150} y={170} s={34} mono cor={C.cinza}>KC-135Q TANKERS</T>
          {Array.from({ length: 56 }, (_, i) => <MiniTanque key={i} x={185 + (i % 14) * 68} y={250 + Math.floor(i / 14) * 76} op={L(g, [ts[4] + 6 + i * 1.6, ts[4] + 12 + i * 1.6], [0, 1])} />)}
          <T x={150} y={640} s={150} w={900} cor={C.laranja} op={L(g, [t56, t56 + 8], [0, 1])}>{Math.round(L(g, [t56, t56 + 26], [0, 56]))}</T>
          <T x={380} y={640} s={56} w={900} op={L(g, [t56, t56 + 8], [0, 1])}>TANKERS</T>
          <g opacity={L(g, [t32 - 6, t32 + 4], [0, 1])}>
            <T x={1240} y={170} s={34} mono cor={C.cinza}>BLACKBIRDS BUILT</T>
            {Array.from({ length: 32 }, (_, i) => <g key={i} transform={`translate(${1290 + (i % 8) * 70},${250 + Math.floor(i / 8) * 76}) scale(0.2)`}><path d={ASA_SR} fill="#2a313a" stroke={C.laranja} strokeWidth={5} /></g>)}
            <T x={1240} y={640} s={150} w={900} cor={C.laranja}>32</T><T x={1450} y={640} s={56} w={900}>BLACKBIRDS</T>
          </g>
          <T x={150} y={780} s={44} w={900}>A WHOLE FLEET, FOR <tspan fill={C.laranja}>ONE AIRPLANE</tspan></T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 15. o calor decidiu tudo ----------
export const CenaPreto: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('preto', i, p);
  const tCol = m(0, 'Even its'), tRad = m(1, 'A dark'), t50 = m(1, 'and it took'), tQ = m(2, 'It was quartz'), tTemp = m(3, 'It was set by'), tHot = m(4, 'got too hot');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, 1e9);
  const mach = L(g, [ts[3] + 6, ts[4] + 50], [1.6, 3.3]) + (g > ts[4] + 50 ? Math.sin(g / 3) * 0.03 : 0);
  const ang = (q: number) => rad(180 + (q / 3.6) * 180);
  const cx = 640, cy = 700, R = 330;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <g transform={`translate(1160,500) scale(${3.6 + 0.15 * L(g, [0, ts[2]], [0, 1], lin)})`}><SR71Topo id="pr" /></g>
          <g opacity={L(g, [tRad, tRad + 12], [0, 1])}>
            {Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2 + 0.2, q = ((g * 0.02 + i * 0.37) % 1), r0 = 170 + q * 130; return <path key={i} d={`M${1160 + Math.cos(a) * r0 * 1.7},${500 + Math.sin(a) * r0} q${-Math.sin(a) * 10},${Math.cos(a) * 10} ${Math.cos(a) * 18},${Math.sin(a) * 18} q${Math.sin(a) * 10},${-Math.cos(a) * 10} ${Math.cos(a) * 18},${Math.sin(a) * 18}`} fill="none" stroke={K.quente} strokeWidth={5} strokeLinecap="round" opacity={(1 - q) * 0.85} />; })}
          </g>
          <T x={110} y={130} s={56} w={900}>HEAT DECIDED</T><T x={110} y={196} s={56} w={900}>ALMOST <tspan fill={C.laranja}>EVERYTHING</tspan></T>
          <g opacity={L(g, [tCol, tCol + 8], [0, 1])}><rect x={110} y={250} width={90} height={90} rx={14} fill="#0b0f1c" stroke="#aeb9c4" strokeWidth={3} /><T x={220} y={290} s={28} mono>BLUE-BLACK</T><T x={220} y={330} s={28} mono>PAINT</T></g>
          <g opacity={L(g, [t50, t50 + 10], [0, 1])}><T x={110} y={760} s={130} w={900} cor={C.azul}>−{Math.round(L(g, [t50, t50 + 30], [0, 50]))}°F</T><T x={114} y={810} s={26} mono cor={C.azul}>UP TO, OFF THE SKIN</T></g>
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>THE WINDSHIELD</T>
          <g transform="translate(520,500)">
            <path d="M-300,160 L-250,-150 L-10,-200 L-10,160 Z" fill="rgba(127,180,216,.28)" stroke="#aeb9c4" strokeWidth={10} strokeLinejoin="round" />
            <path d="M300,160 L250,-150 L10,-200 L10,160 Z" fill="rgba(127,180,216,.28)" stroke="#aeb9c4" strokeWidth={10} strokeLinejoin="round" />
            <path d={`M-230,${-100 + ((g * 3) % 200)} L-60,${-150 + ((g * 3) % 200)}`} stroke="#fff" strokeWidth={8} opacity={0.25} />
            <path d="M-340,160 L340,160 L300,220 L-300,220 Z" fill="#1a1e24" stroke={K.borda} strokeWidth={4} />
          </g>
          <g opacity={L(g, [tQ, tQ + 10], [0, 1])}>
            <rect x={1100} y={330} width={560} height={150} rx={8} fill="rgba(127,180,216,.35)" stroke="#cfe8ff" strokeWidth={5} />
            {[0.33, 0.66].map((q) => <line key={q} x1={1100} y1={330 + 150 * q} x2={1660} y2={330 + 150 * q} stroke="#cfe8ff" strokeWidth={2} opacity={0.5} />)}
            <line x1={1720} y1={330} x2={1720} y2={480} stroke={C.laranja} strokeWidth={4} /><line x1={1700} y1={330} x2={1740} y2={330} stroke={C.laranja} strokeWidth={4} /><line x1={1700} y1={480} x2={1740} y2={480} stroke={C.laranja} strokeWidth={4} />
            <T x={1380} y={620} s={110} w={900} a="middle" cor={C.laranja}>≈2 IN</T><T x={1380} y={680} s={34} mono a="middle">QUARTZ</T>
            <T x={1380} y={290} s={24} mono a="middle" cor={C.cinza}>GLASS · CUT THROUGH</T>
          </g>
          <Item x={150} y={820} txt="ORDINARY GLASS" ok={false} op={L(g, [ts[2] + 30, ts[2] + 40], [0, 1])} tam={44} />
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>TOP SPEED</T>
          <path d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`} fill="none" stroke="#39434e" strokeWidth={36} />
          <path d={`M${cx + R * Math.cos(ang(3.3))},${cy + R * Math.sin(ang(3.3))} A${R},${R} 0 0 1 ${cx + R},${cy}`} fill="none" stroke={C.vermelho} strokeWidth={36} />
          {[0, 1, 2, 3].map((q) => <g key={q}><line x1={cx + (R - 30) * Math.cos(ang(q))} y1={cy + (R - 30) * Math.sin(ang(q))} x2={cx + (R + 30) * Math.cos(ang(q))} y2={cy + (R + 30) * Math.sin(ang(q))} stroke={C.texto} strokeWidth={6} /><T x={cx + (R - 80) * Math.cos(ang(q))} y={cy + (R - 80) * Math.sin(ang(q)) + 14} s={40} mono a="middle">{q}</T></g>)}
          <line x1={cx} y1={cy} x2={cx + (R - 50) * Math.cos(ang(mach))} y2={cy + (R - 50) * Math.sin(ang(mach))} stroke={C.laranja} strokeWidth={12} strokeLinecap="round" /><circle cx={cx} cy={cy} r={26} fill={C.laranja} />
          <T x={cx} y={cy + 110} s={84} w={900} a="middle">MACH <tspan fill={mach > 3.25 ? C.vermelho : C.laranja}>{mach.toFixed(1)}</tspan></T>
          <Termo x={1380} y={700} h={380} frac={L(mach, [1.6, 3.3], [0.25, 1])} />
          <T x={1450} y={400} s={30} mono>ENGINE</T><T x={1450} y={444} s={30} mono>INLET AIR</T>
          <T x={1100} y={220} s={52} w={900} op={L(g, [tTemp, tTemp + 10], [0, 1])}>SET BY <tspan fill={K.quente}>TEMPERATURE</tspan></T>
          <Item x={1100} y={300} txt="ENGINE POWER" ok={false} op={L(g, [ts[3] + 60, ts[3] + 70], [0, 1])} tam={40} />
          <Carimbo g={g} ini={tHot} txt="TOO HOT" x={1560} y={640} tam={72} />
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 16. recordes e linha do tempo ----------
export const CenaLegado: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('legado', i, p);
  const t32 = m(1, 'Thirty two'), tRec = m(2, 'Two thousand'), tStill = m(2, 'For a crewed'), tNot = m(4, 'not one'), tAcc = m(4, 'Accelerate'), tNasa = m(5, 'NASA');
  const J = (i: number) => janela(g, ts[i] - 4, (ts[i + 1] ?? 1e9) + 4);
  const anos: [number, string, number][] = [[260, '1964', ts[1]], [800, '1976', ts[2]], [1340, '1990s', ts[5]], [1640, '1999', tNasa]];
  const acel = L(g, [tAcc, tAcc + 50], [0, 1]);
  const q = L(g, [ts[3] + 6, ts[4] - 10], [0, 1]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {/* linha do tempo fixa */}
        <line x1={200} y1={820} x2={1720} y2={820} stroke="#3a4652" strokeWidth={6} />
        {anos.map(([x, a, t]) => <g key={a} opacity={L(g, [t, t + 10], [0.25, 1])}><circle cx={x} cy={820} r={g >= t ? 14 : 9} fill={g >= t ? C.laranja : '#3a4652'} /><T x={x} y={780} s={36} mono a="middle" cor={g >= t ? C.texto : C.cinza}>{a}</T></g>)}
        {J(0) > 0 && <g opacity={J(0)}>
          <T x={960} y={280} s={72} w={900} a="middle">DESIGNED WITH <tspan fill={C.laranja}>SLIDE RULES</tspan></T>
          <g transform={`translate(960,480) scale(1.6)`}><rect x={-420} y={-30} width={840} height={60} rx={6} fill="#e9e2cf" stroke="#8a826c" strokeWidth={2} /><rect x={-300 + Math.sin(g / 14) * 90} y={-12} width={520} height={24} fill="#f7f2e4" stroke="#8a826c" strokeWidth={2} />{Array.from({ length: 40 }, (_, i) => <line key={i} x1={-400 + i * 20} y1={-30} x2={-400 + i * 20} y2={i % 5 ? -20 : -14} stroke="#3b372c" strokeWidth={2} />)}<rect x={40 + Math.sin(g / 10) * 120} y={-36} width={70} height={72} rx={6} fill="rgba(180,220,255,.25)" stroke="#56606b" strokeWidth={3} /></g>
        </g>}
        {J(1) > 0 && <g opacity={J(1)}>
          <T x={150} y={260} s={34} mono cor={C.cinza}>FIRST FLIGHT</T><T x={150} y={360} s={96} w={900}>DECEMBER <tspan fill={C.laranja}>1964</tspan></T>
          <g opacity={L(g, [t32 - 4, t32 + 6], [0, 1])}>
            {Array.from({ length: 32 }, (_, i) => <g key={i} transform={`translate(${1180 + (i % 8) * 84},${250 + Math.floor(i / 8) * 86}) scale(0.24)`} opacity={L(g, [t32 + i, t32 + i + 6], [0, 1])}><path d={ASA_SR} fill="#2a313a" stroke={C.laranja} strokeWidth={5} /></g>)}
            <T x={150} y={560} s={96} w={900} cor={C.laranja}>32 <tspan fill={C.texto}>BUILT</tspan></T>
          </g>
        </g>}
        {J(2) > 0 && <g opacity={J(2)}>
          <T x={960} y={220} s={34} mono a="middle" cor={C.cinza}>SPEED RECORD · 1976</T>
          <T x={960} y={470} s={250} w={900} a="middle" cor={C.laranja}>{Math.round(L(g, [tRec, tRec + 70], [0, 2193])).toLocaleString('en-US')}</T>
          <T x={960} y={570} s={64} w={900} a="middle">MILES AN HOUR</T>
          <Item x={690} y={680} txt="STILL STANDS" ok op={L(g, [tStill + 20, tStill + 30], [0, 1])} tam={56} />
          <Riscos g={g} n={30} vel={1.4} k="lg" y0={120} y1={700} op={0.6} />
        </g>}
        {J(3) > 0 && <g opacity={J(3)}>
          <path d="M440,600 Q960,180 1480,600" fill="none" stroke="#3a4652" strokeWidth={5} strokeDasharray="10 12" />
          <path d="M440,600 Q960,180 1480,600" fill="none" stroke={C.laranja} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} />
          {[[440, 'NEW YORK'], [1480, 'LONDON']].map(([x, n]) => <g key={n as string}><circle cx={x as number} cy={600} r={16} fill={C.texto} /><T x={x as number} y={670} s={40} mono a="middle">{n}</T></g>)}
          <g transform={`translate(${440 + 1040 * q},${600 - 840 * q * (1 - q)}) rotate(${-38 + 76 * q}) scale(0.9)`}><SR71Topo id="la" pos={1} /></g>
          <T x={960} y={240} s={84} w={900} a="middle">UNDER <tspan fill={C.laranja}>2 HOURS</tspan></T>
        </g>}
        {J(4) > 0 && <g opacity={J(4)}>
          <Riscos g={g} n={40} vel={1 + acel} k="l4" y0={150} y1={680} />
          <g transform={`translate(${900 + 500 * acel + Math.sin(g / 12) * 6},420) scale(2.6)`}><SR71Lado id="lb" trem={0} pos={1 + acel * 0.4} /></g>
          <g transform={`translate(${L(g, [ts[4] + 30, tAcc], [-100, 380]) - 700 * acel},470)`}><path d="M60,0 L30,-10 L-70,-10 L-90,-26 L-100,-26 L-92,-10 L-92,10 L-100,26 L-90,26 L-70,10 L30,10 Z" fill="#c3cad2" stroke="#56606b" strokeWidth={2} /><path d={`M-92,-7 L${-150 - 20 * Math.sin(g)},0 L-92,7 Z`} fill={C.laranja} /></g>
          <T x={110} y={170} s={110} w={900} op={L(g, [tNot, tNot + 8], [0, 1])}><tspan fill={C.laranja}>0</tspan> SHOT DOWN</T>
          <Carimbo g={g} ini={tAcc} txt="ACCELERATE" cor={C.laranja} x={600} y={640} tam={80} />
        </g>}
        {J(5) > 0 && <g opacity={J(5)}>
          <g transform={`translate(${1100 + (g - ts[5]) * 0.6},540) scale(3.4)`} opacity={0.28}><SR71Topo id="lc" /></g>
          <T x={150} y={250} s={64} w={900}>U.S. AIR FORCE: RETIRED, <tspan fill={C.laranja}>1990s</tspan></T>
          <T x={150} y={350} s={64} w={900} op={L(g, [tNasa, tNasa + 10], [0, 1])}>NASA: LAST FLIGHT, <tspan fill={C.laranja}>OCT 1999</tspan></T>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 17. final ----------
const Quadri: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <path d="M40,-14 L-45,-150 L-70,-150 L-25,-14 Z M40,14 L-45,150 L-70,150 L-25,14 Z" fill="#c9d0d7" stroke="#7d8792" strokeWidth={1.2} />
    {[-52, 52, -100, 100].map((y) => <rect key={y} x={14 - Math.abs(y) * 0.52} y={y - 7} width={34} height={14} rx={6} fill="#e3e7ec" stroke="#7d8792" strokeWidth={0.8} />)}
    <path d="M-105,-12 L-138,-62 L-152,-62 L-130,-12 Z M-105,12 L-138,62 L-152,62 L-130,12 Z" fill="#c9d0d7" stroke="#7d8792" strokeWidth={1.2} />
    <path d="M150,0 C150,-13 138,-18 115,-19 L-140,-13 L-158,-3 L-158,3 L-140,13 L115,19 C138,18 150,13 150,0 Z" fill="#f1f3f5" stroke="#7d8792" strokeWidth={1.2} />
    <path d="M143,-6 L130,-9 L130,9 L143,6 Z" fill="#26313d" />
  </g>
);
export const CenaFinal: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('final', i, p);
  const tMus = m(0, 'In museums'), tNot = m(1, "it's not"), tA380 = m(3, 'The A three'), tWhy = m(3, 'Why');
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, ts[3] + 4), card = L(g, [ts[3] - 4, ts[3] + 14], [0, 1]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <defs><linearGradient id="musP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101822" /><stop offset="1" stopColor="#1f2a36" /></linearGradient><linearGradient id="musC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4652" /><stop offset="1" stopColor="#141b23" /></linearGradient></defs>
          <g transform={`translate(960,720) scale(${1 + 0.06 * L(g, [0, ts[1]], [0, 1], lin)}) translate(-960,-720)`}>
            <rect x={-200} y={-200} width={2320} height={970} fill="url(#musP)" />
            {[200, 560, 920, 1280, 1640].map((x) => <rect key={x} x={x} y={-200} width={14} height={970} fill="#0c1218" />)}
            {[380, 960, 1540].map((x, i) => <path key={x} d={`M${x - 30},-60 L${x + 30},-60 L${x + 330},770 L${x - 330},770 Z`} fill="#fff3d6" opacity={0.055 + 0.01 * Math.sin(g / 20 + i)} />)}
            <rect x={-200} y={770} width={2320} height={500} fill="url(#musC)" />
            <ellipse cx={930} cy={782} rx={700} ry={16} fill="#000" opacity={0.45} />
            <Poca x={700} y={786} rx={Math.min(70, 30 + g * 0.12)} f={g} />
            <g transform="translate(960,587.5) scale(5)"><SR71Lado id="fm" /></g>
            <Gota g={g} ini={20} x={700} y0={640} yg={782} per={64} esc={1.25} />
            {[260, 620, 980, 1340, 1700].map((x) => <g key={x}><rect x={x - 5} y={800} width={10} height={86} fill="#b08a3c" /><circle cx={x} cy={798} r={10} fill="#d8b23a" /></g>)}
            {[260, 620, 980, 1340].map((x) => <path key={x} d={`M${x},806 Q${x + 180},860 ${x + 360},806`} fill="none" stroke="#8c1c24" strokeWidth={7} />)}
          </g>
          <T x={110} y={130} s={60} w={900}>STILL <tspan fill={K.fuel}>LEAKING</tspan></T>
          <T x={114} y={180} s={28} mono cor={C.cinza} op={L(g, [tMus, tMus + 10], [0, 1])}>IN MUSEUMS, DECADES LATER (REPORTEDLY)</T>
        </g>}
        {B > 0 && card < 1 && <g opacity={B}>
          <g transform={`translate(960,720) scale(${1 + 0.07 * L(g, [ts[1], ts[3]], [0, 1], lin)}) translate(-960,-720)`}><Patio g={g} id="fp" /></g>
          <T x={110} y={140} s={64} w={900} op={L(g, [tNot, tNot + 10], [0, 1])}>NOT A WORN OUT AIRPLANE</T>
          <T x={110} y={230} s={72} w={900} cor={C.laranja} op={L(g, [ts[2] + 10, ts[2] + 22], [0, 1])}>WAITING TO GET HOT</T>
        </g>}
        {card > 0 && <g opacity={card}>
          <rect width={1920} height={1080} fill={C.fundo} opacity={0.92} />
          <rect x={150} y={230} width={980} height={600} rx={22} fill="#0f151c" stroke={C.laranja} strokeWidth={3} />
          <text x={190} y={300} fill={C.laranja} fontFamily={MONO} fontSize={28} letterSpacing={6}>NEXT</text>
          <g transform={`translate(${430 + Math.sin(g / 14) * 5},480) rotate(-90) scale(0.95)`}><Quadri id="q1" /></g>
          <g transform={`translate(${850 + Math.sin(g / 11) * 5},480) rotate(-90) scale(1.12)`} opacity={L(g, [tA380 - 6, tA380 + 6], [0.15, 1])}><Quadri id="q2" /></g>
          <T x={430} y={700} s={40} mono a="middle">747</T><T x={850} y={700} s={40} mono a="middle" cor={C.laranja} op={L(g, [tA380 - 6, tA380 + 6], [0.15, 1])}>A380</T>
          <T x={640} y={520} s={150} w={900} a="middle" cor={C.laranja} op={L(g, [tWhy, tWhy + 6], [0, 1])}>?</T>
          <T x={190} y={780} s={42} w={900}>WHY THE A380 FAILED BUT THE 747 DIDN'T</T>
          <rect x={1190} y={330} width={580} height={400} rx={22} fill="#0f151c" stroke="#2c3743" strokeWidth={3} />
          <text x={1480} y={520} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={56}>CROSSWIND</text>
          <text x={1480} y={580} textAnchor="middle" fill={C.cinza} fontFamily={MONO} fontSize={24} letterSpacing={3}>SUBSCRIBE FOR MORE</text>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};
