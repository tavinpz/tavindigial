import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { ASA_SR, C, Carimbo, CenaProps, Chama, Cota, Emenda, Gota, Grade, Ilustracao, Item, JatoTopo, K, L, MONO, Painel, Poca, pop, Riscos, Rot, SANS, Seta, SR71Lado, SR71Topo, T, Termo, janela, marca, mix } from './lib';
import { CeuPatio, FONTES } from './cenas1';

const lin = (t: number) => t;
const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>{children}</svg>;

// ---------- 2. título ----------
export const CenaTitulo: React.FC<CenaProps> = ({ g }) => {
  const s = pop(g, 2);
  return (
    <AbsoluteFill>
      <SVG><Grade /><g transform={`translate(${900 + (g - 90) * 1.2},560) rotate(-14) scale(4.6)`} opacity={0.2}><SR71Topo id="tt" /></g></SVG>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${0.94 + 0.06 * s})`, opacity: s }}>
        <div style={{ fontFamily: MONO, color: C.laranja, fontSize: 30, letterSpacing: 10, marginBottom: 20 }}>CROSSWIND</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, color: C.texto, fontSize: 112, letterSpacing: -3, textAlign: 'center', lineHeight: 1 }}>WHY THE SR-71<br />LEAKED FUEL</div>
        <div style={{ height: 7, width: 760 * L(g, [10, 40], [0, 1]), background: C.laranja, marginTop: 30, borderRadius: 4 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3. onde ele vive: 85.000 pés, Mach 3.2 ----------
export const CenaAltitude: React.FC<CenaProps> = ({ g, D, ts }) => {
  const tMais = marca('altitude', 0, 'More than'), tMph = marca('altitude', 1, 'Over two'), tBala = marca('altitude', 2, 'Faster');
  const alt = L(g, [6, 62], [0, 85]);
  const vel = L(g, [ts[1], ts[1] + 30], [0.45, 1.5]);
  const calor = L(g, [ts[4], ts[4] + 50], [0, 1]);
  const jato = janela(g, tMais, ts[2] - 4);
  const bx = 330 + (g - tBala) * 5.2, sx = 120 + (g - tBala) * 12;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#02050a 0%,#081626 42%,#17385a 78%,#4f7fa6 100%)' }}>
      <SVG>
        <defs><radialGradient id="terra" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#3f6f96" /><stop offset="0.5" stopColor="#1c3d5a" /><stop offset="1" stopColor="#0c1c2b" /></radialGradient></defs>
        {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={random(`ax${i}`) * 1920} cy={random(`ay${i}`) * 330} r={0.8 + random(`ar${i}`) * 1.3} fill="#fff" opacity={0.35 + 0.25 * Math.sin(g / 12 + i)} />)}
        <circle cx={960} cy={4420} r={3640} fill="url(#terra)" />
        <circle cx={960} cy={4420} r={3640} fill="none" stroke="#9fd0ff" strokeWidth={5} opacity={0.35} />
        {Array.from({ length: 16 }, (_, i) => { const x = ((random(`nx${i}`) * 2600 - g * (1.2 + random(`nv${i}`))) % 2600 + 2600) % 2600 - 340; return <ellipse key={i} cx={x} cy={850 + random(`ny${i}`) * 170} rx={120 + random(`nr${i}`) * 160} ry={16 + random(`ns${i}`) * 14} fill="#dfeefc" opacity={0.16} />; })}
        <Riscos g={g} n={46} vel={vel} y0={60} y1={520} k="al" />
        {/* linhas de altitude */}
        <line x1={0} y1={332} x2={1920} y2={332} stroke={C.laranja} strokeWidth={2} strokeDasharray="6 14" opacity={0.5} />
        <g opacity={jato}>
          <line x1={0} y1={650} x2={1920} y2={650} stroke={C.texto} strokeWidth={2} strokeDasharray="6 14" opacity={0.4} />
          <g transform={`translate(${760 + g * 0.5},650) scale(0.62)`}><JatoTopo id="aj" /></g>
          <T x={110} y={628} s={34} mono>AIRLINER · 38,000 FT</T>
        </g>
        <g transform={`translate(${1150 + Math.sin(g / 19) * 8},${332 + Math.sin(g / 13) * 4}) scale(3)`}><SR71Lado id="al" trem={0} pos={1} calor={calor} /></g>
        <T x={110} y={250} s={104} w={900}>{Math.round(alt).toLocaleString('en-US')},000 <tspan fill={C.laranja}>FT</tspan></T>
        <T x={114} y={296} s={26} mono cor={C.cinza} op={janela(g, tMais, 1e9)}>MORE THAN 2× AN AIRLINER</T>
        <g opacity={L(g, [ts[1], ts[1] + 10], [0, 1])}>
          <T x={1812} y={150} s={96} w={900} a="end">MACH <tspan fill={C.laranja}>3.2</tspan></T>
          <T x={1812} y={204} s={40} mono a="end" cor={C.laranja} op={L(g, [tMph, tMph + 10], [0, 1])}>2,000+ MPH</T>
        </g>
        {/* 30 milhas por minuto e a bala */}
        <g opacity={janela(g, ts[2], ts[3] - 4)}>
          <T x={110} y={560} s={64} w={900}>30+ MILES <tspan fill={C.laranja}>EVERY MINUTE</tspan></T>
          <g opacity={L(g, [tBala - 4, tBala + 6], [0, 1])}>
            <line x1={110} y1={700} x2={1810} y2={700} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} />
            <g transform={`translate(${Math.min(1700, bx)},748)`}><path d="M-44,-13 L16,-13 Q50,-10 60,0 Q50,10 16,13 L-44,13 Z" fill="#c9a24a" stroke="#6b5420" strokeWidth={3} /><T x={0} y={52} s={26} mono a="middle" cor={C.cinza}>RIFLE BULLET</T></g>
            <g transform={`translate(${Math.min(1700, sx)},650)`}><g transform="scale(0.85)"><SR71Lado id="ab" trem={0} pos={1} /></g><T x={0} y={-50} s={26} mono a="middle" cor={C.laranja}>SR-71</T></g>
          </g>
        </g>
        <g opacity={L(g, [ts[3], ts[3] + 10], [0, 1])}>
          <T x={110} y={640} s={120} w={900} cor={C.azul}>−70°F</T>
          <T x={114} y={690} s={28} mono cor={C.azul}>OUTSIDE AIR</T>
          {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(random(`fx${i}`) * 2100 - g * 9 * (0.6 + random(`fv${i}`)) + 4200) % 2100 - 90} cy={420 + random(`fy${i}`) * 380} r={2.5} fill={C.azul} opacity={0.5} />)}
        </g>
        <g opacity={L(g, [ts[4] + 6, ts[4] + 18], [0, 1])}>
          <T x={1812} y={640} s={120} w={900} a="end" cor={K.quente}>{Math.round(L(g, [ts[4] + 6, ts[4] + 46], [0, 600]))}°F</T>
          <T x={1808} y={690} s={28} mono a="end" cor={K.quente}>AIRCRAFT SKIN</T>
          <Seta x1={1560} y1={530} x2={1480} y2={380} cor={K.quente} w={4} />
        </g>
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 4. por que esquenta ----------
const hwSR = (lx: number) => (lx > 150 ? -1 : lx > 18 ? (16.5 * (150 - lx)) / 132 : Math.min(77, 16.5 + (18 - lx) / 1.732));
export const CenaCalor: React.FC<CenaProps> = ({ g, D, ts }) => {
  const S = 4.2, cx = 860, cy = 450;
  const tSq = marca('calor', 1, 'And when'), tEx = marca('calor', 3, 'Near the'), tSoft = marca('calor', 4, 'would go'), t85 = marca('calor', 5, 'More than');
  const calor = L(g, [ts[1], ts[2] + 40], [0, 1]);
  const mat = L(g, [ts[4] - 8, ts[4] + 8], [0, 1]);
  const sag = L(g, [tSoft - 20, tSoft + 40], [0, 120]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {Array.from({ length: 190 }, (_, i) => {
          const x = 1980 - ((g * (20 + random(`cv${i}`) * 9) + random(`co${i}`) * 2300) % 2300), y = 40 + random(`cy${i}`) * 820;
          const lx = (x - cx) / S, hw = hwSR(lx) * S, d = Math.abs(y - cy);
          const perto = lx < 168 && lx > -125 && d < hw + 34;
          return <circle key={i} cx={perto ? x + 6 : x} cy={y} r={perto ? 4.2 : 3} fill={perto ? mix(calor, C.azul, K.quente) : C.azul} opacity={perto ? 0.95 : 0.4} />;
        })}
        <g transform={`translate(${cx},${cy}) scale(${S})`} opacity={1 - mat * 0.82}><SR71Topo id="ca" calor={calor} pos={1} /></g>
        <g opacity={1 - mat}>
          <Rot x={110} y={790} txt="MACH 3.2" sub="THE AIR CAN'T GET OUT OF THE WAY" op={janela(g, 6, ts[1] + 4)} tam={40} cor={C.texto} />
          <g opacity={janela(g, ts[1] + 6, ts[2])}>
            {[[1760, 450, 1520, 450], [1600, 250, 1390, 360], [1600, 650, 1390, 540]].map(([a, b, c, d], i) => <Seta key={i} x1={a - 14 * Math.sin(g / 5)} y1={b} x2={c - 14 * Math.sin(g / 5)} y2={d} cor={C.azul} w={6} />)}
            <T x={1812} y={800} s={52} w={900} a="end" op={L(g, [tSq, tSq + 10], [0, 1])}>SQUEEZED AIR = <tspan fill={K.quente}>HOT AIR</tspan></T>
          </g>
          <g opacity={L(g, [ts[2], ts[2] + 10], [0, 1])}>
            <T x={1812} y={170} s={130} w={900} a="end" cor={K.quente}>{Math.round(L(g, [ts[2], ts[2] + 44], [0, 600]))}°F</T>
            <T x={1808} y={216} s={26} mono a="end">AVERAGE SKIN TEMPERATURE</T>
          </g>
          <g opacity={L(g, [ts[3], ts[3] + 10], [0, 1])}>
            <line x1={1272} y1={436} x2={1210} y2={330} stroke={C.laranja} strokeWidth={3} /><circle cx={1272} cy={440} r={9} fill="none" stroke={C.laranja} strokeWidth={3} />
            <T x={1218} y={300} s={56} w={900} a="end" cor={C.laranja}>≈620°F</T><T x={1218} y={254} s={24} mono a="end">COCKPIT WINDOWS</T>
          </g>
          <g opacity={L(g, [tEx, tEx + 10], [0, 1])}>
            <line x1={318} y1={612} x2={260} y2={720} stroke={K.quente} strokeWidth={3} /><circle cx={318} cy={606} r={9} fill="none" stroke={K.quente} strokeWidth={3} />
            <T x={110} y={790} s={56} w={900} cor={K.quente}>≈1,000°F</T><T x={114} y={830} s={24} mono>NEAR THE ENGINE EXHAUSTS</T>
          </g>
        </g>
        {/* alumínio x titânio */}
        <g opacity={mat}>
          <T x={150} y={250} s={54} w={900}>ALUMINUM</T><T x={152} y={290} s={24} mono cor={C.cinza}>MOST AIRPLANES</T>
          {[620, 1500].map((x) => <path key={x} d={`M${x - 26},370 L${x + 26},370 L${x + 14},250 L${x - 14},250 Z`} fill="#27303a" stroke="#56606b" strokeWidth={2} />)}
          <path d={`M620,240 Q1060,${240 + sag} 1500,240`} fill="none" stroke={mix(sag / 120, '#c3cad2', '#ff6a3a')} strokeWidth={36} strokeLinecap="round" />
          {[820, 1060, 1300].map((x, i) => <Chama key={x} x={x} y={420} s={0.55} g={g + i * 7} op={L(g, [ts[4], ts[4] + 12], [0, 1])} />)}
          <Item x={1560} y={250} txt="SOFT" ok={false} op={L(g, [tSoft, tSoft + 10], [0, 1])} tam={46} />
          <g opacity={L(g, [ts[5], ts[5] + 12], [0, 1])}>
            <T x={150} y={570} s={54} w={900} cor={C.laranja}>TITANIUM</T><T x={152} y={610} s={24} mono cor={C.cinza}>SR-71</T>
            {[620, 1500].map((x) => <path key={x} d={`M${x - 26},690 L${x + 26},690 L${x + 14},570 L${x - 14},570 Z`} fill="#27303a" stroke="#56606b" strokeWidth={2} />)}
            <line x1={620} y1={560} x2={1500} y2={560} stroke="#aeb9c4" strokeWidth={36} strokeLinecap="round" />
            {[820, 1060, 1300].map((x, i) => <Chama key={x} x={x} y={740} s={0.55} g={g + i * 5} />)}
            <Item x={1560} y={570} txt="HOLDS" ok op={L(g, [ts[5] + 20, ts[5] + 30], [0, 1])} tam={46} />
          </g>
          <g opacity={L(g, [t85, t85 + 10], [0, 1])}><T x={150} y={760} s={110} w={900} cor={C.laranja}>{Math.round(L(g, [t85, t85 + 30], [0, 85]))}%+</T><T x={154} y={806} s={24} mono>OF THE STRUCTURE</T></g>
        </g>
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 5. o titânio veio do inimigo ----------
const TileTi: React.FC<{ x: number; y: number; s?: number; cor?: string }> = ({ x, y, s = 1, cor = C.laranja }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-190} y={-190} width={380} height={380} rx={26} fill="#0f151c" stroke={cor} strokeWidth={5} />
    <text x={-160} y={-120} fill={C.cinza} fontFamily={MONO} fontSize={44} fontWeight={700}>22</text>
    <text x={0} y={70} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontSize={230} fontWeight={900} letterSpacing={-6}>Ti</text>
    <text x={0} y={150} textAnchor="middle" fill={cor} fontFamily={MONO} fontSize={36} fontWeight={700} letterSpacing={6}>TITANIUM</text>
  </g>
);
const Chave: React.FC<{ x: number; y: number; r: number; cor: string; fill?: string }> = ({ x, y, r, cor, fill = '#9aa4af' }) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}>
    <rect x={-22} y={-290} width={44} height={250} rx={18} fill={fill} stroke={cor} strokeWidth={4} />
    <path d="M-52,-50 A56,56 0 1 0 52,-50 L30,-50 L30,6 L-30,6 L-30,-50 Z" fill={fill} stroke={cor} strokeWidth={4} strokeLinejoin="round" />
  </g>
);
export const CenaTitanio: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('titanio', i, p);
  const tAm = m(0, 'America'), tVery = m(1, 'The very'), tCad = m(3, 'ordinary'), tBrit = m(3, 'brittle'), tNew = m(3, 'Lockheed'), tBut = m(5, 'But it');
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, ts[4] + 4), Dd = janela(g, ts[4] - 4, ts[5] + 4), E = janela(g, ts[5] - 4, 1e9);
  const rota: [number, number][] = [[1340, 400], [1190, 640], [960, 720], [730, 640], [580, 470]];
  const prog = (((g - ts[2]) / 70) % 1 + 1) % 1;
  const pt = (q: number) => { const n = rota.length - 1, i = Math.min(n - 1, Math.floor(q * n)), f = q * n - i; return [rota[i][0] + (rota[i + 1][0] - rota[i][0]) * f, rota[i][1] + (rota[i + 1][1] - rota[i][1]) * f]; };
  const voo = L(g, [tVery, ts[2]], [0, 1], lin);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <g transform={`translate(520,470) scale(${0.96 + 0.04 * pop(g, 4)})`}><TileTi x={0} y={0} /></g>
          <T x={900} y={380} s={30} mono cor={C.cinza}>U.S. SUPPLY · EARLY 1960s</T>
          <rect x={900} y={420} width={820} height={56} rx={14} fill="#0f151c" stroke="#56606b" strokeWidth={3} />
          <rect x={906} y={426} width={808 * L(g, [20, 70], [0, 0.17])} height={44} rx={10} fill={C.vermelho} />
          <line x1={1720} y1={404} x2={1720} y2={492} stroke={C.texto} strokeWidth={4} strokeDasharray="8 8" /><T x={1716} y={540} s={24} mono a="end" cor={C.cinza}>WHAT THE PROGRAM NEEDED</T>
          <T x={900} y={640} s={84} w={900} cor={C.vermelho} op={L(g, [tAm, tAm + 10], [0, 1])}>NOT ENOUGH</T>
        </g>}
        {B > 0 && <g opacity={B}>
          <ellipse cx={960} cy={480} rx={700} ry={330} fill="#0b141d" stroke="#2c3b4a" strokeWidth={3} />
          {[0.3, 0.62, 0.86].map((q) => <ellipse key={q} cx={960} cy={480} rx={700 * q} ry={330} fill="none" stroke="#2c3b4a" strokeWidth={1.5} />)}
          {[-190, 0, 190].map((dy) => <path key={dy} d={`M${960 - 700 * Math.sqrt(1 - (dy / 330) ** 2)},${480 + dy} L${960 + 700 * Math.sqrt(1 - (dy / 330) ** 2)},${480 + dy}`} stroke="#2c3b4a" strokeWidth={1.5} />)}
          <circle cx={580} cy={470} r={16} fill={C.azul} /><circle cx={580} cy={470} r={28 + 6 * Math.sin(g / 6)} fill="none" stroke={C.azul} strokeWidth={3} opacity={0.6} />
          <T x={580} y={420} s={34} mono a="middle" cor={C.azul}>UNITED STATES</T>
          <circle cx={1340} cy={400} r={18} fill={C.vermelho} /><circle cx={1340} cy={400} r={32 + 8 * Math.sin(g / 5)} fill="none" stroke={C.vermelho} strokeWidth={3} opacity={0.7} />
          <T x={1340} y={330} s={38} mono a="middle" cor={C.vermelho}>SOVIET UNION</T>
          <T x={1340} y={282} s={22} mono a="middle" cor={C.texto} op={janela(g, ts[1] + 30, ts[2])}>WORLD'S BIGGEST TITANIUM SUPPLIER</T>
          <g opacity={janela(g, tVery, ts[2] + 6)}>
            <g transform={`translate(${760 + voo * 760},${250 - Math.sin(voo * Math.PI) * 60}) scale(0.7)`}><SR71Topo id="tv" pos={1} /></g>
            {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b], i) => <path key={i} d={`M${1340 + a * 70},${400 + b * 44} l${-a * 22},0 M${1340 + a * 70},${400 + b * 44} l0,${-b * 22}`} stroke={C.texto} strokeWidth={4} />)}
            <T x={1430} y={410} s={24} mono cor={C.texto}>THE TARGET</T>
          </g>
          <g opacity={janela(g, ts[2], 1e9)}>
            <path d={`M${rota.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={C.laranja} strokeWidth={4} strokeDasharray="12 12" strokeDashoffset={-g * 1.5} />
            {rota.slice(1, 4).map(([x, y], i) => <g key={i} opacity={L(g, [ts[2] + 8 + i * 10, ts[2] + 18 + i * 10], [0, 1])}><rect x={x - 62} y={y - 34} width={124} height={68} rx={10} fill="#141c25" stroke="#8f99a5" strokeWidth={3} /><T x={x} y={y + 12} s={30} mono a="middle" cor={C.cinza}>CO. {'ABC'[i]}</T></g>)}
            {[0, 0.5].map((o) => { const [x, y] = pt((prog + o) % 1); return <g key={o}><rect x={x - 20} y={y - 20} width={40} height={40} rx={6} fill="#0f151c" stroke={C.laranja} strokeWidth={3} /><text x={x} y={y + 8} textAnchor="middle" fill={C.texto} fontFamily={SANS} fontWeight={900} fontSize={22}>Ti</text></g>; })}
            <T x={960} y={850} s={40} w={900} a="middle">THIRD PARTIES + <tspan fill={C.laranja}>DUMMY COMPANIES</tspan></T>
          </g>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={150} y={150} s={34} mono cor={C.cinza}>WORKING THE METAL</T>
          <rect x={860} y={520} width={800} height={200} rx={10} fill="#8d98a4" stroke="#d5dbe1" strokeWidth={3} />
          <rect x={860} y={520} width={800} height={40} rx={10} fill="#b9c2cb" opacity={0.6} /><T x={1260} y={780} s={26} mono a="middle" cor={C.cinza}>TITANIUM PLATE</T>
          <g opacity={L(g, [tNew, tNew + 10], [1, 0])}>
            <Chave x={L(g, [tCad - 16, tCad + 6], [1800, 1310])} y={L(g, [tCad - 16, tCad + 6], [200, 540])} r={-34} cor="#5f6975" />
            <T x={1400} y={400} s={30} mono op={L(g, [tCad, tCad + 10], [0, 1])}>CADMIUM-PLATED TOOL</T>
            <g opacity={L(g, [tBrit - 10, tBrit], [0, 1])} stroke={C.vermelho} strokeWidth={5} fill="none" strokeLinejoin="round">
              <g transform="translate(300,0)"><path d="M980,560 L940,610 L990,640 L930,700" /><path d="M990,575 L1060,600 L1040,660 L1110,700" /><path d="M960,590 L880,585 L850,640" /></g>
            </g>
            <Item x={170} y={600} txt="BRITTLE" ok={false} op={L(g, [tBrit, tBrit + 8], [0, 1])} tam={56} />
          </g>
          <g opacity={L(g, [tNew, tNew + 10], [0, 1])}>
            <Chave x={1310} y={540} r={-34} cor={C.laranja} fill="#2b323a" />
            <Item x={170} y={600} txt="NEW TOOLS" ok op={1} tam={56} /><T x={174} y={660} s={24} mono cor={C.cinza}>LOCKHEED MADE ITS OWN</T>
          </g>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          {Array.from({ length: 10 }, (_, i) => {
            const x = 330 + (i % 5) * 180, y = 300 + Math.floor(i / 5) * 190, ruim = i !== 3 && i !== 7, q = L(g, [ts[4] + 14 + i * 6, ts[4] + 22 + i * 6], [0, 1]);
            return <g key={i}><rect x={x} y={y} width={150} height={150} rx={12} fill={ruim ? mix(q, '#8d98a4', '#3a1a1a') : '#8d98a4'} stroke={ruim ? mix(q, '#d5dbe1', C.vermelho) : C.verde} strokeWidth={ruim ? 3 : 3 + 2 * q} />{ruim && <path d={`M${x + 45},${y + 45} L${x + 105},${y + 105} M${x + 105},${y + 45} L${x + 45},${y + 105}`} stroke={C.vermelho} strokeWidth={9} strokeLinecap="round" opacity={q} />}</g>;
          })}
          <T x={1812} y={420} s={170} w={900} a="end" cor={C.vermelho}>{Math.round(L(g, [ts[4] + 14, ts[4] + 70], [0, 80]))}%</T>
          <T x={1808} y={490} s={52} w={900} a="end">REJECTED</T><T x={1806} y={540} s={24} mono a="end" cor={C.cinza}>REPORTEDLY, AT ONE POINT</T>
        </g>}
        {E > 0 && <g opacity={E}>
          <g transform={`translate(560,470) scale(${1 + 0.035 * L(g, [tBut, tBut + 30], [0, 1]) * (1 + Math.sin(g / 7))})`}><TileTi x={0} y={0} cor={mix(L(g, [tBut, tBut + 30], [0, 1]), C.laranja, K.quente)} /></g>
          <Item x={900} y={390} txt="HEAT: SOLVED" ok op={L(g, [ts[5] + 10, ts[5] + 20], [0, 1])} tam={60} />
          <g opacity={L(g, [tBut, tBut + 12], [0, 1])}><T x={900} y={560} s={60} w={900}>BUT ONE <tspan fill={C.laranja}>LAW OF PHYSICS</tspan></T><T x={900} y={640} s={60} w={900}>STILL APPLIES</T></g>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 6. metal quente cresce ----------
export const CenaExpansao: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('expansao', i, p);
  const tW = m(4, 'And one'), tHund = m(3, 'And in flight');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, 1e9);
  const h = L(g, [14, 60], [0, 1]);
  const osc = 0.5 - 0.5 * Math.cos((g - ts[2]) / 16);
  const cresce = L(g, [ts[4], ts[4] + 50], [0, 1]);
  const S = 4;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <rect x={520} y={420} width={760} height={76} rx={8} fill="none" stroke={C.azul} strokeWidth={3} strokeDasharray="12 10" opacity={0.8} />
          <rect x={520} y={420} width={760 + 130 * h} height={76} rx={8} fill={mix(h, '#aeb9c4', '#ff6a3a')} stroke={mix(h, '#e3e8ed', '#ffd27a')} strokeWidth={3} />
          {[640, 800, 960, 1120].map((x, i) => <Chama key={x} x={x} y={590} s={0.6} g={g + i * 5} op={L(g, [6, 18], [0, 1])} />)}
          <Seta x1={1300} y1={380} x2={1300 + 110 * h + 6} y2={380} cor={C.laranja} w={6} op={h} />
          <T x={110} y={330} s={60} w={900}>HEAT IT. <tspan fill={C.laranja}>IT GROWS.</tspan></T>
          <T x={520} y={770} s={24} mono cor={C.cinza}>GROWTH EXAGGERATED</T>
          <g opacity={L(g, [ts[1] + 30, ts[1] + 42], [0, 1])}>
            <Painel x={1210} y={110} w={620} h={250} cor={C.laranja}>
              <T x={1250} y={170} s={26} mono cor={C.cinza}>TITANIUM, PER DEGREE (°F)</T>
              <T x={1250} y={260} s={84} w={900} mono cor={C.laranja}>≈0.000005</T>
              <T x={1250} y={320} s={26} mono>OF ITS OWN LENGTH</T>
            </Painel>
          </g>
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={480} y={220} s={40} mono a="middle">BRIDGE</T><T x={1440} y={220} s={40} mono a="middle">OLD RAILROAD</T>
          {/* ponte */}
          {[230, 480, 730].map((x) => <rect key={x} x={x - 18} y={470} width={36} height={250} fill="#27303a" stroke="#56606b" strokeWidth={2} />)}
          <rect x={150} y={420} width={330 - 22 + 18 * osc} height={50} fill="#8d98a4" stroke="#d5dbe1" strokeWidth={3} />
          <rect x={480 + 22 - 18 * osc} y={420} width={330 - 22 + 18 * osc} height={50} fill="#8d98a4" stroke="#d5dbe1" strokeWidth={3} />
          <circle cx={480} cy={445} r={62} fill="none" stroke={C.laranja} strokeWidth={4} /><T x={480} y={360} s={24} mono a="middle" cor={C.laranja}>EXPANSION JOINT</T>
          {/* trilho */}
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1130 + i * 78} y={400} width={30} height={170} rx={4} fill="#3a2f26" stroke="#5a4a3c" strokeWidth={2} />)}
          {[430, 520].map((y) => <g key={y}><rect x={1100} y={y} width={340 - 16 + 13 * osc} height={20} fill="#aeb9c4" /><rect x={1440 + 16 - 13 * osc} y={y} width={340 - 16 + 13 * osc} height={20} fill="#aeb9c4" /></g>)}
          <circle cx={1440} cy={485} r={92} fill="none" stroke={C.laranja} strokeWidth={4} /><T x={1440} y={640} s={24} mono a="middle" cor={C.laranja}>GAP</T>
          <T x={960} y={830} s={46} w={900} a="middle" cor={mix(osc, C.azul, K.quente)}>{osc > 0.5 ? 'HOT DAY: GAP CLOSES' : 'COLD DAY: GAP OPENS'}</T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <g transform={`translate(960,440) scale(${S})`}><path d={ASA_SR} fill="none" stroke={C.azul} strokeWidth={0.7} strokeDasharray="3 2.4" opacity={cresce} /></g>
          <g transform={`translate(${960 - 600},440) scale(${S * (1 + 0.07 * cresce)},${S * (1 + 0.09 * cresce)}) translate(150,0)`}><SR71Topo id="ex" calor={L(g, [tHund, ts[4] + 40], [0, 1])} /></g>
          <Cota x1={360} x2={1560} y={796} txt="107 FT" op={janela(g, ts[3] + 8, ts[4] + 6)} />
          <g opacity={L(g, [tHund, tHund + 10], [0, 1])}><Termo x={1760} y={760} h={220} frac={L(g, [tHund, tHund + 50], [0.08, 1])} /><T x={1700} y={600} s={26} mono a="end" cor={K.quente}>HUNDREDS OF DEGREES HOTTER</T></g>
          <g opacity={L(g, [ts[4] + 20, ts[4] + 30], [0, 1])}><T x={1812} y={150} s={84} w={900} a="end" cor={C.laranja}>+3 TO 4 IN</T><T x={1808} y={192} s={26} mono a="end">LONGER</T></g>
          <g opacity={L(g, [tW, tW + 10], [0, 1])}><T x={1812} y={290} s={84} w={900} a="end" cor={C.laranja}>+1 TO 2 IN</T><T x={1808} y={332} s={26} mono a="end">WIDER</T></g>
          <g opacity={L(g, [ts[5], ts[5] + 12], [0, 1])}>
            <T x={110} y={750} s={30} mono cor={C.azul}>- - -  ON THE RAMP</T><T x={110} y={796} s={30} mono cor={K.quente}>━━  AT MACH 3</T>
          </g>
          <T x={110} y={850} s={22} mono cor={C.cinza} op={cresce}>GROWTH EXAGGERATED</T>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 7. o dilema de quem constrói ----------
const Placas: React.FC<{ g: number; folga: number; calor: number; dobra?: number }> = ({ g, folga, calor, dobra = 0 }) => {
  const w = 330, x0 = 960 - (4 * w + 3 * folga) / 2, cor = mix(calor, '#8d98a4', '#e0572c');
  return (
    <g transform={`translate(${dobra > 0 ? Math.sin(g * 1.9) * 2.5 * Math.min(1, dobra / 20) : 0},0)`}>
      {[0, 1, 2, 3].map((i) => {
        const x = x0 + i * (w + folga), b = dobra * (i % 2 ? 1 : -1);
        return dobra > 0
          ? <path key={i} d={`M${x},500 Q${x + w / 2},${500 + b * 2} ${x + w},500`} fill="none" stroke={cor} strokeWidth={64} />
          : <rect key={i} x={x} y={468} width={w} height={64} rx={6} fill={cor} stroke={mix(calor, '#e3e8ed', '#ffd27a')} strokeWidth={3} />;
      })}
      <rect x={x0 - 40} y={540} width={4 * w + 3 * folga + 80} height={26} rx={6} fill="#27303a" stroke="#56606b" strokeWidth={2} />
    </g>
  );
};
export const CenaDilema: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('dilema', i, p);
  const tMach = m(1, 'then at'), tBuck = m(2, 'The skin'), tStr = m(3, 'made a'), tNot = m(4, 'Not at');
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, ts[4] + 4), Dd = janela(g, ts[4] - 4, 1e9);
  const temp = L(g, [tMach, tMach + 60], [70, 600]);
  const dobra = L(g, [tBuck - 8, tBuck + 30], [0, 34]);
  const frio = L(g, [tNot, tNot + 40], [0, 1]);
  const tD = Math.round(600 - 530 * frio);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade fundo="#07121d" />
        {A > 0 && <g opacity={A}>
          <g transform="translate(960,470) scale(4.4)"><path d={ASA_SR} fill="none" stroke={C.azul} strokeWidth={0.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - L(g, [4, 80], [0, 1])} /></g>
          <T x={110} y={130} s={34} mono cor={C.azul}>DRAWING BOARD · BURBANK</T>
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>SKIN PANELS · CLOSE-UP</T>
          <Placas g={g} folga={0} calor={(temp - 70) / 530} dobra={dobra} />
          <T x={1812} y={170} s={120} w={900} a="end" cor={mix((temp - 70) / 530, C.azul, K.quente)}>{Math.round(temp)}°F</T>
          <Item x={150} y={330} txt="PERFECT FIT ON THE GROUND" ok op={janela(g, ts[1] + 16, tMach + 20)} tam={44} />
          <g opacity={janela(g, tMach + 20, ts[2] + 6)}>
            {[0, 1, 2].map((i) => <g key={i}><Seta x1={960 - 330 + i * 330 - 90} y1={400} x2={960 - 330 + i * 330 - 12 - 6 * Math.sin(g / 4)} y2={400} cor={C.vermelho} w={6} /><Seta x1={960 - 330 + i * 330 + 90} y1={400} x2={960 - 330 + i * 330 + 12 + 6 * Math.sin(g / 4)} y2={400} cor={C.vermelho} w={6} /></g>)}
            <T x={960} y={700} s={48} w={900} a="middle" cor={C.vermelho}>NOWHERE TO GROW</T>
          </g>
          <Carimbo g={g} ini={tBuck} txt="BUCKLED" x={960} y={760} fim={ts[3] + 4} tam={72} />
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <Painel x={380} y={230} w={1160} h={440} cor={C.laranja}>
            <T x={440} y={310} s={28} mono cor={C.cinza}>LOCKHEED · ADVANCED DEVELOPMENT PROJECTS</T>
            <T x={440} y={440} s={130} w={900}>SKUNK WORKS</T>
            <T x={440} y={510} s={34} mono cor={C.laranja}>KELLY JOHNSON'S TEAM</T>
            <T x={440} y={610} s={54} w={900} op={L(g, [tStr, tStr + 10], [0, 1])}>A <tspan fill={C.laranja}>STRANGE</tspan> DECISION</T>
          </Painel>
          <g transform={`translate(${960 + (g - ts[3]) * 0.8},770)`}><rect x={-420} y={-30} width={840} height={60} rx={6} fill="#e9e2cf" stroke="#8a826c" strokeWidth={2} /><rect x={-300 + Math.sin(g / 20) * 60} y={-12} width={520} height={24} fill="#f7f2e4" stroke="#8a826c" strokeWidth={2} />{Array.from({ length: 40 }, (_, i) => <line key={i} x1={-400 + i * 20} y1={-30} x2={-400 + i * 20} y2={i % 5 ? -20 : -14} stroke="#3b372c" strokeWidth={2} />)}<rect x={40} y={-36} width={70} height={72} rx={6} fill="rgba(180,220,255,.25)" stroke="#56606b" strokeWidth={3} /></g>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <Placas g={g} folga={26 * frio} calor={1 - frio} />
          <T x={960} y={250} s={150} w={900} a="middle" cor={mix(frio, K.quente, C.azul)}>{tD}°F</T>
          <Item x={620} y={720} txt="BUILT TO FIT HOT" ok op={janela(g, ts[4] + 30, tNot + 6)} tam={54} />
          <g opacity={L(g, [tNot + 30, tNot + 42], [0, 1])}><T x={960} y={720} s={54} w={900} a="middle">ROOM TEMPERATURE: <tspan fill={C.laranja}>GAPS</tspan></T></g>
          <T x={110} y={130} s={34} mono cor={C.cinza}>SKIN PANELS · CLOSE-UP</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 8. montado frouxo, de propósito ----------
const Onda: React.FC<{ x0: number; x1: number; y: number; amp: number; n: number; cor: string; w?: number; dash?: string; op?: number }> = ({ x0, x1, y, amp, n, cor, w = 16, dash, op = 1 }) => (
  <path d={`M${x0},${y} ` + Array.from({ length: 121 }, (_, i) => `L${x0 + ((x1 - x0) * i) / 120},${y - amp * Math.sin((i / 120) * n * 2 * Math.PI)}`).join(' ')} fill="none" stroke={cor} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} opacity={op} />
);
const Trimotor: React.FC = () => (
  <g>
    <rect x={-250} y={-150} width={470} height={26} rx={8} fill="#b9c2cb" stroke="#6f7984" strokeWidth={3} />
    <path d="M-170,-124 L170,-124 L210,-60 L240,-40 L240,10 L60,40 L-300,10 L-330,-20 L-300,-50 Z" fill="#aeb9c4" stroke="#6f7984" strokeWidth={3} strokeLinejoin="round" />
    {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-290} y1={-42 + i * 3.6} x2={200 - i * 4} y2={-112 + i * 6.6} stroke="#6f7984" strokeWidth={1} opacity={0.6} />)}
    <path d="M-300,-50 L-360,-150 L-320,-150 L-250,-50 Z" fill="#aeb9c4" stroke="#6f7984" strokeWidth={3} />
    {[60, 110, 160].map((x) => <rect key={x} x={x - 18} y={-100} width={30} height={26} rx={4} fill="#22303d" />)}
    <circle cx={258} cy={-14} r={30} fill="#3a424c" stroke="#6f7984" strokeWidth={3} /><rect x={286} y={-90} width={8} height={150} rx={4} fill="#22303d" />
    <circle cx={40} cy={-70} r={24} fill="#3a424c" stroke="#6f7984" strokeWidth={3} /><rect x={64} y={-130} width={7} height={120} rx={3} fill="#22303d" />
    <line x1={110} y1={30} x2={130} y2={90} stroke="#6f7984" strokeWidth={8} /><circle cx={132} cy={104} r={30} fill="#14191f" stroke="#8f99a5" strokeWidth={4} />
    <circle cx={-300} cy={30} r={12} fill="#14191f" stroke="#8f99a5" strokeWidth={3} />
  </g>
);
const TANQ: [number, number, number, number][] = [[42, 70, -5.5, 5.5], [6, 40, -7.5, 7.5], [-34, 4, -8, 8], [-74, -36, -8, 8], [-112, -76, -7, 7]];
export const Tanques: React.FC<{ n: number; op?: number; num?: boolean }> = ({ n, op = 1, num }) => (
  <g opacity={op}>
    {TANQ.map(([a, b, c, d], i) => i < n && <g key={i}><rect x={a} y={c} width={b - a} height={d - c} rx={2} fill={K.fuel} opacity={0.75} stroke={K.fuel2} strokeWidth={0.5} />{num && <text x={(a + b) / 2} y={3} textAnchor="middle" fill="#1a1206" fontFamily={MONO} fontWeight={800} fontSize={8}>{i + 1}</text>}</g>)}
    {n > 5 && [-1, 1].map((s) => <g key={s}><path d={`M-28,${s * 11} L-112,${s * 11} L-112,${s * 26} L-52,${s * 26} Z`} fill={K.fuel} opacity={0.75} stroke={K.fuel2} strokeWidth={0.5} />{num && <text x={-84} y={s * 18.5 + 3} textAnchor="middle" fill="#1a1206" fontFamily={MONO} fontWeight={800} fontSize={8}>6</text>}</g>)}
  </g>
);
export const CenaFolgas: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('folgas', i, p);
  const tOn = m(0, 'On purpose'), tRid = m(1, 'with ridges'), tFord = m(2, 'Ford'), tKept = m(3, 'and the wing');
  const A = Math.max(janela(g, -20, ts[1] + 4), janela(g, ts[4] - 4, 1e9)), B = janela(g, ts[1] - 4, ts[2] + 4), Cc = janela(g, ts[2] - 4, ts[3] + 4), Dd = janela(g, ts[3] - 4, ts[4] + 4);
  const fim = g >= ts[4] - 4;
  const h = L(g, [ts[3] + 10, ts[3] + 60], [0, 1]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <g transform={`translate(1100,480) scale(${4.0 + 0.25 * L(g, fim ? [ts[4], D] : [0, ts[1]], [0, 1], lin)})`}>
            <SR71Topo id="fo" costuras={fim ? 0.3 : 0.55 + 0.45 * Math.sin(g / 5)} />
            {fim && <Tanques n={6} op={0.45 + 0.4 * Math.sin(g / 5)} />}
          </g>
          {!fim && <><T x={110} y={130} s={64} w={900}>LOOSE.</T><T x={110} y={200} s={64} w={900} cor={C.laranja} op={L(g, [tOn, tOn + 8], [0, 1])}>ON PURPOSE.</T><T x={114} y={830} s={28} mono cor={K.fuel}>GAPS BETWEEN THE PANELS</T></>}
          {fim && <><T x={110} y={120} s={48} w={900}>ONE PLACE WHERE</T><T x={110} y={176} s={48} w={900}>LOOSE IS A</T><T x={110} y={232} s={48} w={900} cor={C.vermelho}>PROBLEM</T><T x={1660} y={330} s={220} w={900} cor={C.laranja} op={0.7 + 0.3 * Math.sin(g / 4)}>?</T></>}
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>WING SKIN · CUT THROUGH</T>
          <T x={110} y={220} s={84} w={900}>CORRUGATED</T>
          <Onda x0={160} x1={1760} y={460} amp={48} n={9} cor="#39424c" w={44} />
          <Onda x0={160} x1={1760} y={460} amp={48} n={9} cor="#aeb9c4" w={26} />
          <g opacity={L(g, [tRid, tRid + 10], [0, 1])}>
            <Painel x={1240} y={640} w={570} h={210}>
              <g transform="translate(1400,745) scale(1.15)"><SR71Topo id="fm" />{[14, 18, 22].flatMap((y) => [y, -y]).map((y) => <line key={y} x1={-20} y1={y} x2={-112} y2={y} stroke={C.laranja} strokeWidth={1.4} />)}</g>
              <T x={1590} y={730} s={24} mono cor={C.laranja}>RIDGES RUN</T><T x={1590} y={766} s={24} mono cor={C.laranja}>FRONT → BACK</T>
            </Painel>
            <T x={160} y={740} s={46} w={900}>ROOM TO GROW, <tspan fill={C.verde}>WITHOUT TEARING</tspan></T>
          </g>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={960} y={150} s={52} w={900} a="middle" op={L(g, [ts[2] + 20, ts[2] + 30], [0, 1])}>“A MACH 3 <tspan fill={C.laranja}>FORD TRIMOTOR</tspan>”</T>
          <Painel x={130} y={230} w={800} h={560}><g transform={`translate(${560 + Math.sin(g / 15) * 8},${560 + Math.sin(g / 9) * 5}) scale(1)`} opacity={L(g, [tFord - 20, tFord - 6], [0, 1])}><Trimotor /></g><T x={170} y={300} s={30} mono cor={C.cinza}>1920s · CORRUGATED TIN AIRLINER</T></Painel>
          <Painel x={990} y={230} w={800} h={560} cor={C.laranja}><g transform="translate(1410,540) scale(2.3)"><SR71Topo id="fc" costuras={0.4} /></g><T x={1030} y={300} s={30} mono cor={C.laranja}>1960s · MACH 3</T></Painel>
          <T x={960} y={850} s={28} mono a="middle" cor={C.cinza}>HOW OTHER ENGINEERS JOKED ABOUT IT</T>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>WING SKIN · HEATING UP</T>
          {[240, 1680].map((x) => <rect key={x} x={x - 30} y={420} width={60} height={240} rx={8} fill="#27303a" stroke="#56606b" strokeWidth={3} />)}
          <Onda x0={240} x1={1680} y={540} amp={30} n={11} cor={C.azul} w={3} dash="10 10" op={h} />
          <Onda x0={240} x1={1680} y={540} amp={30 + 22 * h} n={11} cor={mix(h, '#aeb9c4', '#ff6a3a')} w={20} />
          <T x={1812} y={170} s={110} w={900} a="end" cor={mix(h, C.azul, K.quente)}>{Math.round(70 + 530 * h)}°F</T>
          <Item x={300} y={790} txt="RIDGES GET DEEPER" ok op={L(g, [ts[3] + 40, ts[3] + 50], [0, 1])} tam={44} />
          <Item x={1040} y={790} txt="WING KEEPS ITS SHAPE" ok op={L(g, [tKept, tKept + 10], [0, 1])} tam={44} />
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 9. os tanques ----------
export const CenaTanques: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('tanques', i, p);
  const tSkin = m(1, 'The skin'), tSix = m(1, 'Six main'), tGal = m(2, 'about twelve'), tHalf = m(2, 'More than'), tSeal = m(3, 'And no'), tDrip = m(4, 'Drip by');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, ts[4] + 4), Dd = janela(g, ts[4] - 4, ts[5] + 4), E = janela(g, ts[5] - 4, 1e9);
  const ciclo = (g - ts[3]) / 26, quente = 0.5 - 0.5 * Math.cos(ciclo), voos = Math.max(1, Math.floor(ciclo / (2 * Math.PI)) + 1);
  const trinca = L(g, [tSeal, tSeal + 120], [0, 1]);
  const S = 4.4;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {(A > 0 || B > 0) && <g opacity={Math.max(A, B * 0.12)}>
          <g transform={`translate(1040,470) scale(${S - 0.6 + 0.15 * L(g, [0, ts[2]], [0, 1], lin)})`}>
            <SR71Topo id="tq" />
            <Tanques n={g < tSix ? (g > 8 ? 6 : 0) : 6} op={g < tSix ? 0.5 * L(g, [8, 30], [0, 1]) : 1} num={g >= tSix && g < ts[2] - 4} />
          </g>
        </g>}
        {A > 0 && <g opacity={A}>
          <T x={110} y={130} s={60} w={900} op={L(g, [2, 12], [0, 1])}>THE FUEL TANKS</T>
          <T x={110} y={184} s={30} mono cor={K.fuel} op={L(g, [tSkin, tSkin + 10], [0, 1])}>THE SKIN IS THE TANK</T>
          <T x={114} y={830} s={30} mono op={L(g, [tSix, tSix + 10], [0, 1])}>SIX MAIN TANKS</T>
          <g opacity={L(g, [ts[1] + 20, ts[1] + 32], [0, 1])} transform="translate(50,24)">
            <Painel x={1270} y={560} w={560} h={300}>
              <T x={1410} y={610} s={20} mono a="middle" cor={C.cinza}>MOST AIRPLANES</T><T x={1690} y={610} s={20} mono a="middle" cor={K.fuel}>SR-71</T>
              <rect x={1310} y={640} width={200} height={110} rx={10} fill="none" stroke="#aeb9c4" strokeWidth={5} /><rect x={1332} y={660} width={156} height={70} rx={22} fill={K.fuel} opacity={0.8} stroke="#3a2f20" strokeWidth={4} />
              <rect x={1590} y={640} width={200} height={110} rx={10} fill={K.fuel} fillOpacity={0.8} stroke="#aeb9c4" strokeWidth={5} />
              <T x={1410} y={800} s={20} mono a="middle" cor={C.cinza}>TANK INSIDE</T><T x={1690} y={800} s={20} mono a="middle" cor={K.fuel}>FUEL ON THE SKIN</T>
            </Painel>
          </g>
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={960} y={330} s={170} w={900} a="middle" cor={C.laranja}>{Math.round(L(g, [ts[2] + 10, ts[2] + 50], [0, 80]))},000 LB</T>
          <T x={960} y={420} s={56} w={900} a="middle" op={L(g, [tGal, tGal + 10], [0, 1])}>≈ 12,000 GALLONS OF FUEL</T>
          <g opacity={L(g, [tHalf - 10, tHalf], [0, 1])}>
            <T x={360} y={580} s={26} mono cor={C.cinza}>TAKEOFF WEIGHT</T>
            <rect x={360} y={600} width={1200} height={70} rx={14} fill="#1a232d" stroke="#56606b" strokeWidth={3} />
            <rect x={366} y={606} width={1188 * L(g, [tHalf, tHalf + 40], [0, 0.57])} height={58} rx={10} fill={K.fuel} />
            <line x1={960} y1={590} x2={960} y2={690} stroke={C.texto} strokeWidth={4} strokeDasharray="8 8" /><T x={960} y={730} s={24} mono a="middle" cor={C.cinza}>HALF</T>
            <T x={960} y={820} s={56} w={900} a="middle" op={L(g, [tHalf + 30, tHalf + 40], [0, 1])}>MORE THAN HALF WAS <tspan fill={K.fuel}>FUEL</tspan></T>
          </g>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>ONE SEAM · CLOSE-UP</T>
          <g transform="translate(960,520) scale(1.5) translate(-960,-520)"><Emenda g={g} x={560} y={520} w={800} folga={4 + 20 * (1 - quente)} calor={quente} id="em1" /></g>
          <g opacity={L(g, [tSeal - 10, tSeal + 4], [0, 1])}>
            <rect x={960 - 50} y={492} width={100} height={30} rx={14} fill="#cdb891" stroke="#7d6c4a" strokeWidth={2} />
            <g stroke="#3b2f1a" strokeWidth={3} fill="none" opacity={trinca}><path d="M952,500 L962,512 L955,524" /><path d="M972,500 L966,510 L976,524" opacity={trinca > 0.5 ? 1 : 0} /><path d="M940,502 L946,514 L938,522" opacity={trinca > 0.75 ? 1 : 0} /></g>
            <T x={960} y={460} s={26} mono a="middle" cor="#cdb891">SEALANT</T>
          </g>
          <T x={1812} y={170} s={120} w={900} a="end" cor={mix(quente, C.azul, K.quente)}>{Math.round(-70 + 670 * quente)}°F</T>
          <T x={1808} y={220} s={28} mono a="end" cor={C.cinza}>FLIGHT #{voos}</T>
          <Item x={150} y={300} txt="RUBBER LINER" ok={false} op={L(g, [ts[3] + 24, ts[3] + 34], [0, 1])} tam={46} />
          <Item x={150} y={380} txt="1960s SEALANTS" ok={false} op={L(g, [tSeal + 40, tSeal + 50], [0, 1])} tam={46} />
          <T x={960} y={800} s={44} w={900} a="middle" op={L(g, [tSeal + 90, tSeal + 100], [0, 1])}>FREEZING COLD ⇄ <tspan fill={K.quente}>600°F</tspan>, EVERY FLIGHT</T>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>ON THE GROUND · SEAMS RELAXED</T>
          <g transform="translate(960,420) scale(1.4) translate(-960,-420)"><Emenda g={g - ts[4]} x={560} y={420} w={800} folga={22} fuel={1} id="em2" /></g>
          <ellipse cx={960} cy={756} rx={Math.max(0, Math.min(190, (g - ts[4]) * 1.3))} ry={14} fill="#17130f" stroke={K.fuel} strokeWidth={2} />
          <T x={1812} y={170} s={110} w={900} a="end" cor={C.azul}>70°F</T>
          <T x={110} y={640} s={64} w={900} cor={K.fuel} op={L(g, [tDrip, tDrip + 10], [0, 1])}>DRIP BY DRIP</T>
        </g>}
        {E > 0 && <g opacity={E}>
          <CeuPatio g={g} />
          <ellipse cx={930} cy={772} rx={720} ry={16} fill="#000" opacity={0.38} />
          {FONTES.map((lx, k) => <Poca key={k} x={960 + lx * 5 + (k % 2 ? 14 : -8)} y={776 + (k % 3) * 9} rx={130 + (k % 3) * 26} f={g} k={k} />)}
          <g transform="translate(960,577.5) scale(5)"><SR71Lado id="tl" /></g>
          {FONTES.map((lx, k) => <Gota key={k} g={g} ini={k * 5} x={960 + lx * 5} y0={577.5 + (lx < -5 ? 11 : 8.5) * 5} yg={772} per={26 + (k * 7) % 13} esc={1.25} />)}
          <T x={110} y={150} s={64} w={900}>THAT'S THE <tspan fill={K.fuel}>PUDDLE</tspan></T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};
