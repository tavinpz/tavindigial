import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { A380Lado, AZ, B747Lado, C, Carimbo, CenaProps, Cota, Grade, Ilustracao, Item, JatoTopo, K, L, LJ, MONO, Mini, Painel, Palete, pop, QuadTopo, Riscos, Rot, SANS, Seta, T, janela, marca, mix } from './lib';
import { CeuPatio } from '../sr71/cenas1';

const lin = (t: number) => t;
export const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>{children}</svg>;
export const CEU = 'linear-gradient(180deg,#02050a 0%,#081626 50%,#17385a 100%)';
const Cam: React.FC<{ z: number; cx?: number; cy?: number; children: React.ReactNode }> = ({ z, cx = 960, cy = 700, children }) => <g transform={`translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
const Sombra: React.FC<{ rx?: number }> = ({ rx = 700 }) => <ellipse cx={940} cy={772} rx={rx} ry={16} fill="#000" opacity={0.38} />;

// ---------- 1. gancho ----------
export const CenaGigante: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('gigante', i, p);
  const tBig = m(0, 'The biggest'), tRoom = m(1, 'Room for'), tSh = m(1, 'Some of'), tAfter = m(3, 'after only'), tStop = m(3, 'Airbus stopped'), tOld = m(4, 'Older'), tSm = m(4, 'Smaller'), tAns = m(6, 'The answer'), tHump = m(6, 'The hump');
  const A = janela(g, -20, ts[4] + 4, 12), B = janela(g, ts[4] - 4, ts[6] + 4, 12), Cc = janela(g, ts[6] - 4, tAns + 4, 12), Dd = janela(g, tAns - 4, 1e9, 12);
  return (
    <AbsoluteFill style={{ background: C.fundo }}>
      <SVG>
        {A > 0 && <g opacity={A}>
          <Cam z={1 + 0.07 * L(g, [0, ts[4]], [0, 1], lin)}><CeuPatio g={g} /><Sombra /><g transform="translate(1010,579.4) scale(4.2)"><A380Lado id="g1" /></g></Cam>
          <Rot x={110} y={104} txt="AIRBUS A380" sub="FIRST FLIGHT 2005" op={pop(g, 8)} tam={44} />
          <T x={1812} y={110} s={44} w={900} a="end" op={janela(g, tBig, ts[1])}>BIGGEST PASSENGER AIRPLANE <tspan fill={C.laranja}>EVER BUILT</tspan></T>
          <g opacity={janela(g, ts[1] + 4, ts[2])}>
            <T x={1812} y={110} s={56} w={900} a="end">2 FULL <tspan fill={C.laranja}>DECKS</tspan></T>
            <Seta x1={1500} y1={140} x2={1340} y2={500} cor={C.laranja} w={4} /><Seta x1={1560} y1={140} x2={1430} y2={560} cor={C.laranja} w={4} />
          </g>
          <g opacity={janela(g, tRoom, ts[3])}><T x={110} y={856} s={84} w={900} cor={C.laranja}>{Math.round(L(g, [tRoom, tRoom + 30], [0, 500]))}+ <tspan fill={C.texto} fontSize={44}>PASSENGERS</tspan></T></g>
          <T x={1812} y={850} s={30} mono a="end" cor={C.azul} op={janela(g, tSh, ts[3])}>SHOWERS ON BOARD (SOME)</T>
          <Carimbo g={g} ini={ts[2] + 6} txt="PASSENGERS LOVED IT" cor={C.verde} x={1380} y={250} fim={ts[3] + 2} tam={50} />
          <g opacity={janela(g, tAfter, 1e9)}><T x={1812} y={150} s={130} w={900} a="end" cor={C.vermelho}>{Math.round(L(g, [tAfter, tAfter + 30], [0, 251]))}</T><T x={1808} y={196} s={28} mono a="end">BUILT</T></g>
          <Carimbo g={g} ini={tStop} txt="ENDED · 2021" x={900} y={270} fim={ts[4] + 4} tam={64} />
        </g>}
        {B > 0 && <g opacity={B}>
          <Cam z={1 + 0.07 * L(g, [ts[4], ts[6]], [0, 1], lin)}><CeuPatio g={g + 300} /><Sombra rx={660} /><g transform="translate(960,588.4) scale(4.4)"><B747Lado id="g2" /></g></Cam>
          <Rot x={110} y={104} txt="BOEING 747" sub="DESIGNED IN THE 1960s" op={pop(g, ts[4] + 8)} tam={44} />
          <Item x={110} y={860} txt="OLDER." ok={null} op={L(g, [tOld, tOld + 8], [0, 1])} tam={60} /><Item x={390} y={860} txt="SMALLER." ok={null} op={L(g, [tSm, tSm + 8], [0, 1])} tam={60} />
          <g opacity={L(g, [ts[5], ts[5] + 10], [0, 1])}><T x={1812} y={150} s={130} w={900} a="end" cor={C.laranja}>{Math.round(L(g, [ts[5] + 10, ts[5] + 70], [0, 1574])).toLocaleString('en-US')}</T><T x={1808} y={196} s={28} mono a="end">BUILT · MORE THAN 50 YEARS</T></g>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <Grade />
          <T x={200} y={330} s={40} mono cor={AZ}>A380</T><rect x={420} y={280} width={1300 * (251 / 1574) * L(g, [ts[6], ts[6] + 30], [0, 1])} height={70} rx={10} fill={AZ} /><T x={420 + 1300 * (251 / 1574) + 24} y={332} s={50} w={900}>251</T>
          <T x={200} y={530} s={40} mono cor={LJ}>747</T><rect x={420} y={480} width={1300 * L(g, [ts[6] + 10, ts[6] + 60], [0, 1])} height={70} rx={10} fill={LJ} /><T x={1712} y={620} s={50} w={900} a="end">1,574</T>
          <T x={960} y={780} s={60} w={900} a="middle">WHY DID THE <tspan fill={LJ}>OLD GIANT</tspan> WIN?</T>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <Grade />
          <g transform={`translate(${160 - 70 * L(g, [tAns, D], [0, 1], lin)},${690 + 10 * L(g, [tAns, D], [0, 1], lin)}) scale(${8.2 + 0.6 * L(g, [tAns, D], [0, 1], lin)})`}><B747Lado id="g3" corcunda={L(g, [tHump - 10, tHump], [0, 1]) * (0.7 + 0.3 * Math.sin(g / 4))} trem={0} /></g>
          <T x={110} y={150} s={110} w={900} op={L(g, [tHump, tHump + 8], [0, 1])}>THE <tspan fill={C.laranja}>HUMP</tspan></T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 2. título ----------
export const CenaTitulo: React.FC<CenaProps> = ({ g }) => {
  const s = pop(g, 2);
  return (
    <AbsoluteFill>
      <SVG><Grade /><g transform={`translate(${900 + (g - 90) * 1.2},560) rotate(-14) scale(3.2)`} opacity={0.16}><QuadTopo id="tt" v="747" /></g></SVG>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${0.94 + 0.06 * s})`, opacity: s }}>
        <div style={{ fontFamily: MONO, color: C.laranja, fontSize: 30, letterSpacing: 10, marginBottom: 20 }}>CROSSWIND</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, color: C.texto, fontSize: 104, letterSpacing: -3, textAlign: 'center', lineHeight: 1 }}>WHY THE A380 FAILED<br />BUT THE 747 DIDN'T</div>
        <div style={{ height: 7, width: 900 * L(g, [10, 40], [0, 1]), background: C.laranja, marginTop: 30, borderRadius: 4 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3. o 747 nasce ----------
export const CenaNascimento: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('nascimento', i, p);
  const tFirst = m(1, 'The first'), tLarg = m(2, "It's still"), tAlm = m(4, 'almost nobody');
  const J = (i: number) => janela(g, i === 0 ? -20 : ts[i] - 4, (ts[i + 1] ?? 1e9) + 4);
  const q = L(g, [ts[3] + 10, ts[4] - 10], [0, 1]), cres = L(g, [10, ts[1] - 20], [0, 1]);
  const linha = (n: number) => Array.from({ length: n + 1 }, (_, i) => `${i ? 'L' : 'M'}${360 + (i / 60) * 1200},${760 - 70 - 380 * Math.pow(i / 60, 2.2)}`).join(' ');
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {J(0) > 0 && <g opacity={J(0)}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>AIR TRAVEL · 1960s</T>
          <line x1={360} y1={760} x2={1580} y2={760} stroke="#56606b" strokeWidth={4} /><line x1={360} y1={760} x2={360} y2={260} stroke="#56606b" strokeWidth={4} />
          <path d={linha(Math.round(60 * cres))} fill="none" stroke={C.laranja} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={360 + cres * 1200} cy={760 - 70 - 380 * Math.pow(cres, 2.2)} r={14} fill={C.laranja} />
          <T x={1560} y={250} s={60} w={900} a="end" op={L(g, [50, 62], [0, 1])}>PASSENGERS: <tspan fill={C.laranja}>BOOMING</tspan></T>
          <T x={370} y={820} s={24} mono cor={C.cinza}>1960</T><T x={1560} y={820} s={24} mono a="end" cor={C.cinza}>1969</T>
        </g>}
        {J(1) > 0 && <g opacity={J(1)}>
          <g transform="translate(430,500) scale(0.95)"><JatoTopo id="n1" /></g><T x={430} y={720} s={26} mono a="middle" cor={C.cinza}>EARLIER JETLINERS</T>
          <g transform={`translate(1180,490) scale(${2.1 + 0.1 * L(g, [ts[1], ts[2]], [0, 1], lin)})`}><QuadTopo id="n2" v="747" cor={LJ} /></g>
          <T x={110} y={140} s={64} w={900}>FAR <tspan fill={C.laranja}>BIGGER</tspan></T>
          <g opacity={L(g, [tFirst, tFirst + 10], [0, 1])}>
            <Painel x={110} y={200} w={520} h={170}>
              {[0, 1, 2].map((b) => Array.from({ length: b === 1 ? 4 : 3 }, (_, i) => <rect key={`${b}${i}`} x={150 + (b === 0 ? 0 : b === 1 ? 150 : 340) + i * 34} y={240} width={26} height={34} rx={6} fill="#aeb9c4" />))}
              {[264, 454].map((x) => <rect key={x} x={x - 6} y={232} width={28} height={50} fill={C.laranja} opacity={0.35 + 0.25 * Math.sin(g / 5)} />)}
              <T x={370} y={340} s={30} mono a="middle" cor={C.laranja}>FIRST WITH 2 AISLES</T>
            </Painel>
          </g>
        </g>}
        {J(2) > 0 && <g opacity={J(2)}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>EVERETT, WASHINGTON</T>
          <g transform={`translate(960,520) scale(${1 + 0.05 * L(g, [ts[2], ts[3]], [0, 1], lin)}) translate(-960,-520)`}>
            <path d="M260,330 L1660,330 L1740,400 L1740,760 L180,760 L180,400 Z" fill="#141c25" stroke="#8f99a5" strokeWidth={4} />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={230 + i * 250} y={450} width={210} height={310} fill="#0b1118" stroke="#56606b" strokeWidth={3} />)}
            {[0, 1, 2, 3, 4, 5].map((i) => <g key={i} transform={`translate(${335 + i * 250},650) scale(0.52)`} opacity={L(g, [ts[2] + 20 + i * 8, ts[2] + 32 + i * 8], [0, 1])}><B747Lado id={`nf${i}`} faixa="" /></g>)}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={300 + i * 180} y={356} width={90} height={18} fill="#ffd37a" opacity={0.5 + 0.2 * Math.sin(g / 8 + i)} />)}
          </g>
          <T x={960} y={850} s={46} w={900} a="middle" op={L(g, [tLarg, tLarg + 10], [0, 1])}>LARGEST BUILDING IN THE WORLD, <tspan fill={C.laranja}>BY VOLUME</tspan></T>
        </g>}
        {J(3) > 0 && <g opacity={J(3)}>
          <path d="M440,640 Q960,220 1480,640" fill="none" stroke="#3a4652" strokeWidth={5} strokeDasharray="10 12" />
          <path d="M440,640 Q960,220 1480,640" fill="none" stroke={C.laranja} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} />
          {[[440, 'NEW YORK'], [1480, 'LONDON']].map(([x, n]) => <g key={n as string}><circle cx={x as number} cy={640} r={16} fill={C.texto} /><T x={x as number} y={710} s={40} mono a="middle">{n}</T></g>)}
          <g transform={`translate(${440 + 1040 * q},${640 - 840 * q * (1 - q)}) rotate(${-38 + 76 * q}) scale(0.62)`}><QuadTopo id="n3" v="747" cor={LJ} /></g>
          <T x={960} y={190} s={64} w={900} a="middle">JANUARY <tspan fill={C.laranja}>1970</tspan></T><T x={960} y={240} s={28} mono a="middle" cor={C.cinza}>FIRST PASSENGER FLIGHT</T>
        </g>}
        {J(4) > 0 && <g opacity={J(4)}>
          <g transform="translate(960,560) scale(4)" opacity={0.3}><B747Lado id="n4" trem={0} /></g>
          <T x={960} y={330} s={40} mono a="middle" cor={C.cinza}>INSIDE BOEING</T>
          <T x={960} y={480} s={110} w={900} a="middle" op={L(g, [tAlm, tAlm + 10], [0, 1])}>“NOT THE <tspan fill={C.vermelho}>FUTURE</tspan>”</T>
        </g>}
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 4. o futuro era supersônico ----------
const Delta: React.FC = () => (
  <g>
    <path d="M150,0 C120,-3 80,-6 30,-10 L-110,-70 L-128,-70 L-118,-9 L-150,-4 L-150,4 L-118,9 L-128,70 L-110,70 L30,10 C80,6 120,3 150,0 Z" fill="#e3e7ec" stroke="#7d8792" strokeWidth={1.2} strokeLinejoin="round" />
    <path d="M150,0 L-140,0" stroke="#8d97a2" strokeWidth={5} /><path d="M132,-2 L118,-3.4 L118,3.4 L132,2 Z" fill="#26313d" />
  </g>
);
export const CenaSupersonico: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('supersonico', i, p);
  const tRep = m(1, 'And many'), tFre = m(2, 'the seven forty');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, 1e9);
  const sai = L(g, [ts[2] + 20, tFre], [0, 1]), entra = L(g, [tFre, tFre + 70], [0, 1]);
  return (
    <AbsoluteFill style={{ background: CEU }}>
      <SVG>
        {A > 0 && <g opacity={A}>
          <Riscos g={g} n={60} vel={1.6} k="ss" y0={60} y1={620} />
          <g transform={`translate(${1040 + Math.sin(g / 15) * 10},${400 + Math.sin(g / 10) * 5}) scale(2.9)`}><Delta /></g>
          <T x={110} y={140} s={72} w={900}>THE FUTURE: <tspan fill={C.laranja}>SUPERSONIC</tspan></T>
          <g opacity={L(g, [ts[1] + 20, ts[1] + 32], [0, 1])}>
            <Painel x={260} y={610} w={1400} h={230}>
              <T x={300} y={680} s={28} mono cor={LJ}>747</T><rect x={470} y={650} width={260 * L(g, [ts[1] + 30, ts[1] + 60], [0, 1])} height={40} rx={8} fill={LJ} /><T x={750} y={682} s={26} mono cor={C.cinza} op={L(g, [tRep + 60, tRep + 70], [0, 1])}>A FEW YEARS</T>
              <T x={300} y={780} s={28} mono>SUPERSONIC</T><rect x={730} y={750} width={880 * L(g, [tRep, tRep + 60], [0, 1])} height={40} rx={8} fill="#e3e7ec" />
            </Painel>
          </g>
        </g>}
        {B > 0 && <g opacity={B}>
          <rect width={1920} height={1080} fill={C.fundo} opacity={0.75} />
          <g transform="translate(960,470) scale(4.2)"><B747Lado id="s1" trem={0} carga /></g>
          {Array.from({ length: 6 }, (_, i) => <g key={i} opacity={1 - sai} transform={`translate(${700 + i * 80},${380 - sai * 160 - i * 6 * sai})`}><circle r={12} fill="#aeb9c4" cy={-22} /><rect x={-12} y={-8} width={24} height={30} rx={8} fill="#aeb9c4" /></g>)}
          {Array.from({ length: 6 }, (_, i) => <g key={i} opacity={entra} transform={`translate(${680 + i * 90},${760 - 270 * L(entra, [i * 0.1, 0.4 + i * 0.1], [0, 1])}) scale(3)`}><Palete x={0} y={0} /></g>)}
          <T x={110} y={140} s={56} w={900}>WHEN PASSENGERS <tspan fill={C.cinza}>MOVE ON…</tspan></T>
          <T x={110} y={850} s={56} w={900} op={L(g, [tFre, tFre + 10], [0, 1])}>…TURN IT INTO A <tspan fill={C.laranja}>FREIGHTER</tspan></T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <rect width={1920} height={1080} fill={C.fundo} opacity={0.9} />
          <T x={960} y={470} s={130} w={900} a="middle">ONE <tspan fill={C.laranja}>ASSUMPTION</tspan></T>
          <T x={960} y={570} s={44} mono a="middle" cor={C.cinza}>SHAPED THE WHOLE AIRPLANE</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 5. por que existe a corcunda ----------
export const CenaCorcunda: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('corcunda', i, p);
  const tSw = m(0, 'So the nose'), tCant = m(1, "And you can't"), tUp = m(2, 'up, above'), tNot = m(3, "It's not"), tBack = m(4, 'The backup');
  const abre = g < ts[1] ? L(g, [tSw, tSw + 50], [0, 1]) : g < tUp + 60 ? L(g, [ts[1], ts[1] + 30], [1, 0]) : L(g, [tUp + 60, tUp + 100], [0, 1]);
  const sobe = L(g, [tUp, tUp + 40], [0, 1]);
  const S = 5.4, px = 520, py = 560;
  const cx = px + 128 * S, cyBaixo = py + 0 * S, cyAlto = py - 20 * S;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        <g transform={`translate(${px},${py}) scale(${S})`}>
          <B747Lado id="c1" nariz={abre} trem={0} corcunda={L(g, [tUp + 30, tUp + 50], [0, 1])} />
          {Array.from({ length: 4 }, (_, i) => { const q = L(g, [tSw + 40 + i * 16, tSw + 90 + i * 16], [0, 1]); return g < ts[1] + 30 && q > 0 ? <Palete key={i} x={205 - q * (110 + i * 17)} y={15} /> : null; })}
          {g >= tUp + 70 && Array.from({ length: 4 }, (_, i) => { const q = L(g, [tUp + 90 + i * 16, tUp + 140 + i * 16], [0, 1]); return q > 0 ? <Palete key={'b' + i} x={205 - q * (110 + i * 17)} y={15} /> : null; })}
        </g>
        {/* cabine: no nariz (problema) e depois em cima */}
        <g opacity={L(g, [ts[1], ts[1] + 10], [0, 1]) * L(g, [tNot + 60, tNot + 80], [1, 0.0])} transform={`translate(${cx},${cyBaixo + (cyAlto - cyBaixo) * sobe})`}>
          <rect x={-58} y={-34} width={116} height={68} rx={12} fill="rgba(13,20,28,.9)" stroke={sobe > 0.9 ? C.verde : C.vermelho} strokeWidth={5} />
          <circle cx={-22} cy={-6} r={11} fill="#aeb9c4" /><rect x={-34} y={6} width={24} height={20} rx={6} fill="#aeb9c4" /><circle cx={22} cy={-6} r={11} fill="#aeb9c4" /><rect x={10} y={6} width={24} height={20} rx={6} fill="#aeb9c4" />
        </g>
        <T x={110} y={140} s={56} w={900} op={janela(g, 6, ts[1])}>LOAD CARGO <tspan fill={C.laranja}>THROUGH THE FRONT</tspan></T>
        <g opacity={janela(g, ts[1] + 4, ts[2])}><T x={110} y={140} s={56} w={900}>BUT THE <tspan fill={C.vermelho}>COCKPIT</tspan> IS IN THE NOSE</T><Carimbo g={g} ini={tCant} txt="IN THE WAY" x={1500} y={300} fim={ts[2]} tam={56} /></g>
        <g opacity={janela(g, ts[2] + 4, ts[3])}><T x={110} y={140} s={56} w={900}>MOVE THE COCKPIT <tspan fill={C.verde}>UP</tspan></T><Seta x1={cx + 120} y1={cyBaixo + 20} x2={cx + 120} y2={cyAlto - 20} cor={C.verde} w={7} op={L(g, [tUp - 6, tUp + 6], [0, 1])} /></g>
        <g opacity={janela(g, ts[3] + 4, ts[4])}><T x={110} y={150} s={100} w={900}>THE <tspan fill={C.laranja}>HUMP</tspan></T><T x={114} y={210} s={34} mono cor={C.cinza} op={L(g, [tNot, tNot + 10], [0, 1])}>NOT LUXURY. A CARGO DOOR.</T></g>
        <g opacity={janela(g, ts[4] + 4, 1e9)}>
          <Carimbo g={g} ini={ts[4] + 30} txt="SUPERSONIC: CANCELLED" x={620} y={180} tam={50} />
          <T x={110} y={860} s={52} w={900} op={L(g, [tBack, tBack + 10], [0, 1])}>THE BACKUP PLAN BECAME <tspan fill={C.laranja}>THE ICON</tspan></T>
        </g>
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 6. por que quatro motores ----------
const AER: [number, number][] = [[330, 300], [300, 520], [380, 720], [1600, 330], [1640, 560], [1560, 740]];
export const CenaQuatro: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('quatro', i, p);
  const tFail = m(1, 'in case'), tLong = m(2, 'So long'), tBig = m(4, 'Then it');
  const mapa = janela(g, -20, ts[3] + 4), um = janela(g, ts[3] - 4, ts[4] + 4), fim = janela(g, ts[4] - 4, 1e9);
  const tw = L(g, [ts[2] - 30, ts[2] + 40], [0, 1]), qd = L(g, [tLong, tLong + 100], [0, 1], lin);
  return (
    <AbsoluteFill>
      <SVG>
        {mapa > 0 && <g opacity={mapa}>
          <rect width={1920} height={1080} fill="#071624" />
          <path d="M0,0 L420,0 L470,200 L400,420 L470,640 L420,900 L380,1080 L0,1080 Z" fill="#16211a" stroke="#2c4034" strokeWidth={3} /><path d="M1920,0 L1520,0 L1490,240 L1540,460 L1470,700 L1500,1080 L1920,1080 Z" fill="#16211a" stroke="#2c4034" strokeWidth={3} />
          <T x={960} y={110} s={30} mono a="middle" cor="#2f5674">O C E A N</T>
          {AER.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={190 * L(g, [ts[1] + i * 4, ts[1] + 24 + i * 4], [0, 1])} fill={C.azul} fillOpacity={0.07} stroke={C.azul} strokeWidth={3} strokeDasharray="10 10" opacity={L(g, [tLong, tLong + 20], [1, 0.35])} /><circle cx={x} cy={y} r={10} fill={C.texto} /></g>)}
          <g opacity={janela(g, ts[1] + 10, tLong - 4)}><T x={960} y={210} s={56} w={900} a="middle">TWIN ENGINES: <tspan fill={C.azul}>60 MINUTES</tspan></T><T x={960} y={256} s={26} mono a="middle" cor={C.cinza} op={L(g, [tFail, tFail + 10], [0, 1])}>FROM AN AIRPORT, IN CASE ONE FAILS</T></g>
          <g opacity={janela(g, ts[2] - 30, tLong + 30)}>
            <rect x={560} y={230} width={800} height={600} rx={30} fill={C.vermelho} opacity={0.1 * tw} /><T x={960} y={830} s={34} mono a="middle" cor={C.vermelho} op={tw}>OUT OF REACH</T>
            <g transform={`translate(${330 + 190 * tw},${520}) scale(0.5)`}><JatoTopo id="q1" /></g>
            <Carimbo g={g} ini={ts[2] + 44} txt="✗" x={600} y={520} fim={tLong + 30} tam={70} />
          </g>
          <g opacity={L(g, [tLong - 6, tLong + 6], [0, 1])}>
            <path d="M300,520 L1640,560" stroke={C.laranja} strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
            <g transform={`translate(${300 + 1340 * qd},${520 + 40 * qd}) rotate(1.7) scale(0.62)`}><QuadTopo id="q2" v="747" cor={LJ} /></g>
            <T x={960} y={230} s={56} w={900} a="middle">3 OR 4 ENGINES: <tspan fill={C.laranja}>STRAIGHT ACROSS</tspan></T>
          </g>
        </g>}
        {um > 0 && <g opacity={um}><Grade />
          <g transform={`translate(1200,520) scale(${2.3 + 0.15 * L(g, [ts[3], ts[4]], [0, 1], lin)})`}><QuadTopo id="q3" v="747" cor={LJ} /></g>
          <T x={110} y={140} s={48} w={900}>LOTS OF PEOPLE,</T><T x={110} y={196} s={48} w={900}>A LONG WAY:</T><T x={110} y={290} s={84} w={900} cor={C.laranja}>ONE CHOICE</T>
        </g>}
        {fim > 0 && <g opacity={fim}><Grade />
          <T x={960} y={300} s={40} mono a="middle" cor={C.cinza}>BOEING OWNED THAT MARKET FOR</T>
          <T x={960} y={480} s={190} w={900} a="middle" cor={LJ}>{Math.round(L(g, [ts[4] + 6, ts[4] + 50], [0, 30]))} YEARS</T>
          <T x={960} y={680} s={84} w={900} a="middle" op={L(g, [tBig, tBig + 8], [0, 1])}>AIRBUS: <tspan fill={AZ}>GO BIGGER</tspan></T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 7. a aposta da Airbus ----------
export const CenaAposta: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('aposta', i, p);
  const tOut = m(0, 'The biggest'), tBut = m(1, 'But you'), tBet = m(4, 'It was');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[4] + 4), Cc = janela(g, ts[4] - 4, 1e9);
  const troca = L(g, [tBut, tBut + 40], [0, 1]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>A MAJOR AIRPORT · 1990s</T>
          <rect x={160} y={300} width={1600} height={90} fill="#262b31" /><line x1={160} y1={345} x2={1760} y2={345} stroke={C.linha} strokeWidth={4} strokeDasharray="50 40" />
          <rect x={160} y={470} width={1600} height={50} fill="#1d2228" />
          {Array.from({ length: 11 }, (_, i) => <Mini key={i} x={((250 + i * 140 + g * 0.5) % 1540) + 190} y={495} cor="#c3cad2" s={0.8} />)}
          <Mini x={((g * 9) % 2000) + 60} y={345} cor="#fff" s={1} />
          <Carimbo g={g} ini={tOut} txt="OUT OF ROOM" x={1400} y={200} fim={ts[1] + 4} tam={56} />
          <g opacity={L(g, [ts[1], ts[1] + 10], [0, 1])}>
            <Item x={200} y={640} txt="ADD RUNWAYS" ok={false} op={1} tam={50} />
            <Item x={200} y={740} txt="MORE PEOPLE PER FLIGHT" ok op={L(g, [tBut, tBut + 10], [0, 1])} tam={50} />
            {[0, 1, 2].map((i) => <Mini key={i} x={1230 + i * 90 - troca * (i - 1) * -60} y={720} cor="#c3cad2" s={1 - troca * 0.2} op={1 - troca} />)}
            <Mini x={1320} y={720} cor={AZ} s={2.4 * troca + 0.01} op={troca} />
          </g>
        </g>}
        {B > 0 && <g opacity={B}>
          <g transform={`translate(950,470) scale(${2.2 + 0.08 * L(g, [ts[2], ts[4]], [0, 1], lin)})`}><QuadTopo id="a1" v="380" cor={AZ} /></g>
          <T x={110} y={120} s={52} w={900}>DECEMBER <tspan fill={AZ}>2000</tspan></T><T x={114} y={166} s={28} mono cor={C.cinza}>AIRBUS LAUNCHES THE A380</T>
          <g opacity={L(g, [ts[3] + 30, ts[3] + 42], [0, 1])}>
            <line x1={1440} y1={105} x2={1440} y2={835} stroke={C.laranja} strokeWidth={4} /><line x1={1420} y1={105} x2={1460} y2={105} stroke={C.laranja} strokeWidth={4} /><line x1={1420} y1={835} x2={1460} y2={835} stroke={C.laranja} strokeWidth={4} />
            <T x={1480} y={470} s={100} w={900} cor={C.laranja}>≈80 M</T><T x={1484} y={516} s={28} mono>WINGSPAN</T>
          </g>
          <T x={114} y={830} s={30} mono cor={AZ} op={L(g, [ts[3], ts[3] + 10], [0, 1])}>DOUBLE DECK, NOSE TO TAIL</T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={960} y={280} s={36} mono a="middle" cor={C.cinza}>FORECAST: VERY LARGE AIRPLANES</T>
          <T x={960} y={480} s={220} w={900} a="middle" cor={AZ}>≈{Math.round(L(g, [ts[4] + 10, ts[4] + 60], [0, 1200])).toLocaleString('en-US')}</T>
          <T x={960} y={680} s={64} w={900} a="middle" op={L(g, [tBet, tBet + 10], [0, 1])}>THE BIGGEST <tspan fill={C.laranja}>BET</tspan> IN ITS HISTORY</T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 8. não cabia nos aeroportos ----------
export const CenaAeroportos: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('aeroportos', i, p);
  const tFit = m(0, "The airplane"), tWid = m(1, 'widen'), tBr = m(1, 'with boarding'), t900 = m(2, 'more than'), tOnly = m(3, 'could only');
  const A = janela(g, -20, ts[1] + 4), B = janela(g, ts[1] - 4, ts[2] + 4), Cc = janela(g, ts[2] - 4, ts[3] + 4), Dd = janela(g, ts[3] - 4, 1e9);
  const pte = L(g, [tBr, tBr + 40], [0, 1]), larg = L(g, [tWid, tWid + 40], [0, 1]);
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <rect x={160} y={110} width={1600} height={110} fill="#1a232d" stroke="#56606b" strokeWidth={3} /><T x={960} y={178} s={30} mono a="middle" cor={C.cinza}>TERMINAL</T>
          {[380, 720, 1200, 1540].map((x) => <line key={x} x1={x} y1={220} x2={x} y2={840} stroke="#d8b23a" strokeWidth={5} strokeDasharray="20 14" />)}
          {[550, 1370].map((x) => <g key={x} transform={`translate(${x},520) rotate(-90) scale(0.9)`}><JatoTopo id={'ae' + x} /></g>)}
          <g transform={`translate(960,${560 + L(g, [0, 50], [260, 0])}) rotate(-90) scale(1.75)`}><QuadTopo id="ae1" v="380" cor={AZ} /></g>
          {[-1, 1].map((s) => <rect key={s} x={960 + s * 240 - (s > 0 ? 0 : 50)} y={560} width={50} height={130} fill={C.vermelho} opacity={L(g, [50, 60], [0, 1]) * (0.35 + 0.25 * Math.sin(g / 4))} />)}
          <Carimbo g={g} ini={tFit + 6} txt="DIDN'T FIT" x={1500} y={360} tam={64} />
        </g>}
        {B > 0 && <g opacity={B}>
          <rect x={0} y={770} width={1920} height={30 + 40 * larg} fill="#262b31" /><rect x={0} y={770} width={1920} height={30} fill="#30353d" />
          {larg > 0 && <><Seta x1={300} y1={790} x2={300} y2={800 + 40 * larg + 6} cor={C.laranja} w={5} /><T x={340} y={850} s={30} mono cor={C.laranja}>WIDER TAXIWAYS</T></>}
          <g transform="translate(700,573) scale(4.2)"><A380Lado id="ae2" /></g>
          <rect x={1480} y={300} width={440} height={470} fill="#141c25" stroke="#56606b" strokeWidth={3} />{[0, 1, 2].map((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={1530 + j * 120} y={350 + i * 110} width={70} height={50} fill="#ffd37a" opacity={0.35} />))}
          <path d="M1480,600 L1250,585 L1250,620 L1480,640 Z" fill="#8f99a5" stroke="#56606b" strokeWidth={3} />
          <path d={`M1480,480 L${1480 - 250 * pte},${480 + 36 * pte} L${1480 - 250 * pte},${515 + 36 * pte} L1480,520 Z`} fill={C.laranja} stroke="#7a3a0c" strokeWidth={3} opacity={pte > 0 ? 1 : 0} />
          <T x={110} y={140} s={60} w={900}>AIRPORTS HAD TO <tspan fill={C.laranja}>REBUILD</tspan></T>
          <T x={1240} y={440} s={28} mono a="end" cor={C.laranja} op={L(g, [tBr + 30, tBr + 40], [0, 1])}>BRIDGE TO THE UPPER DECK</T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={960} y={250} s={36} mono a="middle" cor={C.cinza}>UNITED STATES ALONE</T>
          {Array.from({ length: 18 }, (_, i) => <g key={i} opacity={L(g, [ts[2] + 10 + i * 3, ts[2] + 18 + i * 3], [0, 1])}><circle cx={420 + (i % 9) * 135} cy={330 + Math.floor(i / 9) * 90} r={22} fill={AZ} /><path d={`M${408 + (i % 9) * 135},${330 + Math.floor(i / 9) * 90} h24 M${420 + (i % 9) * 135},${318 + Math.floor(i / 9) * 90} v24`} stroke="#fff" strokeWidth={4} /></g>)}
          <T x={960} y={530} s={34} mono a="middle">18 AIRPORTS</T>
          <T x={960} y={720} s={170} w={900} a="middle" cor={C.laranja} op={L(g, [t900 - 6, t900 + 6], [0, 1])}>${Math.round(L(g, [t900, t900 + 40], [0, 900]))}M+</T>
          <T x={960} y={790} s={30} mono a="middle" cor={C.cinza}>PLANNED, TO GET READY FOR ONE AIRPLANE</T>
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          {Array.from({ length: 70 }, (_, i) => { const on = random(`ap${i}`) < 0.2; return <circle key={i} cx={200 + random(`ax${i}`) * 1520} cy={250 + random(`ay${i}`) * 480} r={on ? 14 : 8} fill={on ? AZ : '#2c3743'} opacity={on ? 0.6 + 0.4 * Math.sin(g / 6 + i) : 1} />; })}
          <T x={110} y={150} s={60} w={900}>ONLY WHERE AN AIRPORT</T><T x={110} y={216} s={60} w={900} cor={AZ} op={L(g, [tOnly, tOnly + 10], [0, 1])}>HAD BEEN REBUILT</T>
          <g transform={`translate(${300 + (g - ts[3]) * 4},800) scale(0.5)`}><QuadTopo id="ae3" v="380" cor={AZ} /></g>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

// ---------- 9. os fios ----------
export const CenaFios: React.FC<CenaProps> = ({ g, D, ts }) => {
  const m = (i: number, p: string) => marca('fios', i, p);
  const tHund = m(1, 'About a'), tNot = m(2, 'And the teams'), tCm = m(3, 'In places'), tHand = m(4, 'The first'), tCost = m(5, 'and cost');
  const A = janela(g, -20, ts[2] + 4), B = janela(g, ts[2] - 4, ts[3] + 4), Cc = janela(g, ts[3] - 4, ts[5] + 4), Dd = janela(g, ts[5] - 4, 1e9);
  const des = L(g, [ts[1], ts[1] + 120], [0, 1]);
  const PAIS: [number, number, string, number][] = [[520, 330, 'FRANCE', 5], [1400, 330, 'GERMANY', 4], [520, 690, 'U.K.', 5], [1400, 690, 'SPAIN', 4]];
  const puxa = Math.sin(g / 3) * 6;
  return (
    <AbsoluteFill>
      <SVG>
        <Grade />
        {A > 0 && <g opacity={A}>
          <g transform="translate(960,520) scale(4.6)"><g opacity={0.3}><A380Lado id="f1" trem={0} faixa="" /></g>
            {Array.from({ length: 16 }, (_, i) => { const y = -16 + (i % 8) * 4.4, a = 120 - (i % 5) * 8, b = -120 + (i % 3) * 14; return <path key={i} d={`M${a},${y} L${a - 40},${y + ((i * 7) % 5) - 2} L${(a + b) / 2},${y + ((i * 3) % 7) - 3} L${b + 30},${y + ((i * 5) % 6) - 3} L${b},${y}`} fill="none" stroke={i % 3 ? C.laranja : C.azul} strokeWidth={0.7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - L(des, [i * 0.04, 0.4 + i * 0.04], [0, 1])} opacity={0.9} />; })}
          </g>
          <T x={110} y={840} s={84} w={900} op={L(g, [2, 12], [0, 1])}>THE <tspan fill={C.laranja}>WIRING</tspan></T>
          <g opacity={L(g, [ts[1], ts[1] + 10], [0, 1])}><T x={1812} y={150} s={110} w={900} a="end" cor={C.laranja}>{Math.round(L(g, [ts[1], ts[1] + 60], [0, 530]))} KM</T><T x={1808} y={196} s={28} mono a="end">OF WIRES, IN EACH AIRPLANE</T></g>
          <T x={1808} y={840} s={44} w={900} a="end" op={L(g, [tHund, tHund + 10], [0, 1])}>≈100,000 WIRES</T>
        </g>}
        {B > 0 && <g opacity={B}>
          <T x={960} y={140} s={52} w={900} a="middle">DESIGNED IN <tspan fill={AZ}>4 COUNTRIES</tspan></T>
          {[[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]].map(([a, b], i) => { const ruim = PAIS[a][3] !== PAIS[b][3], q = L(g, [tNot + 20, tNot + 40], [0, 1]); return <line key={i} x1={PAIS[a][0]} y1={PAIS[a][1]} x2={PAIS[b][0]} y2={PAIS[b][1]} stroke={ruim ? mix(q, '#56606b', C.vermelho) : '#56606b'} strokeWidth={5} strokeDasharray={ruim && q > 0.5 ? '14 12' : undefined} />; })}
          {PAIS.map(([x, y, n, v], i) => <g key={n} opacity={L(g, [ts[2] + 6 + i * 8, ts[2] + 16 + i * 8], [0, 1])}>
            <rect x={x - 170} y={y - 70} width={340} height={140} rx={18} fill="#0f151c" stroke="#8f99a5" strokeWidth={3} /><T x={x} y={y - 12} s={40} w={900} a="middle">{n}</T>
            <g opacity={L(g, [tNot, tNot + 12], [0, 1])}><rect x={x - 110} y={y + 8} width={220} height={44} rx={10} fill={v === 5 ? AZ : C.laranja} /><text x={x} y={y + 40} textAnchor="middle" fill="#081018" fontFamily={MONO} fontWeight={800} fontSize={26}>SOFTWARE V{v}</text></g>
          </g>)}
          <T x={960} y={850} s={44} w={900} a="middle" op={L(g, [tNot + 30, tNot + 42], [0, 1])}>SAME SOFTWARE. <tspan fill={C.vermelho}>DIFFERENT VERSIONS.</tspan></T>
        </g>}
        {Cc > 0 && <g opacity={Cc}>
          <T x={110} y={130} s={34} mono cor={C.cinza}>ON THE ASSEMBLY LINE</T>
          <path d={`M0,560 C300,${520 + puxa} 600,${600 - puxa} ${1010},560`} fill="none" stroke="#39424c" strokeWidth={54} strokeLinecap="round" /><path d={`M0,560 C300,${520 + puxa} 600,${600 - puxa} ${1010},560`} fill="none" stroke={C.laranja} strokeWidth={38} strokeLinecap="round" />
          <rect x={1000} y={528} width={60} height={64} rx={8} fill="#aeb9c4" stroke="#56606b" strokeWidth={3} />{[540, 560, 580].map((y) => <rect key={y} x={1060} y={y - 4} width={22} height={8} fill="#e3e7ec" />)}
          <rect x={1250} y={480} width={150} height={160} rx={14} fill="#232b34" stroke="#8f99a5" strokeWidth={4} />{[540, 560, 580].map((y) => <circle key={y} cx={1262} cy={y} r={7} fill="#0b0f14" stroke="#8f99a5" strokeWidth={2} />)}<T x={1325} y={690} s={24} mono a="middle" cor={C.cinza}>CONNECTOR</T>
          <rect x={1084} y={470} width={164} height={180} fill={C.vermelho} opacity={0.12 + 0.08 * Math.sin(g / 4)} />
          <Cota x1={1084} x2={1248} y={730} txt="TOO SHORT" cor={C.vermelho} op={L(g, [ts[3] + 60, ts[3] + 72], [0, 1])} s={30} />
          <T x={1812} y={170} s={84} w={900} a="end" cor={C.vermelho} op={L(g, [tCm, tCm + 10], [0, 1])}>A FEW CM</T>
          <T x={110} y={330} s={52} w={900} op={janela(g, ts[4], ts[5])}>YOU CAN'T <tspan fill={C.vermelho}>STRETCH</tspan> A CABLE</T>
          <Carimbo g={g} ini={tHand + 10} txt="REWIRED BY HAND" x={560} y={820} fim={ts[5] + 4} tam={56} />
        </g>}
        {Dd > 0 && <g opacity={Dd}>
          <T x={960} y={470} s={230} w={900} a="middle" cor={C.vermelho}>+2 YEARS</T>
          <T x={960} y={620} s={72} w={900} a="middle" op={L(g, [tCost, tCost + 10], [0, 1])}>AND <tspan fill={C.laranja}>BILLIONS</tspan></T>
        </g>}
        <Ilustracao />
      </SVG>
    </AbsoluteFill>
  );
};

export const CenaProvisoria: React.FC<CenaProps> = ({ g }) => (
  <AbsoluteFill><SVG><Grade /><g transform={`translate(${900 + g * 0.5},500) rotate(-12) scale(2.4)`} opacity={0.5}><QuadTopo id="pv" v="380" /></g></SVG></AbsoluteFill>
);
