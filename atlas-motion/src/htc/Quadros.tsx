import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cota, Defs, Fundo, H, M, MONO, Moldura, P, Rot, SANS, TIT, Titulo, W } from './lib';
import DE from './alemanha.json';

// Hard to Copy: quadros parados do padrão visual (para aprovar antes de animar). props.q escolhe o quadro.

// 1 · Gancho: o espelho do tamanho da Alemanha
const Q1: React.FC = () => {
  const esc = 0.74, ox = 150, oy = 196; // Alemanha: 1000 de altura no json
  const x0 = ox + DE.b[0][0] * esc, x1 = ox + DE.b[1][0] * esc;
  const barras = [{ n: 'BATHROOM MIRROR', v: '5 m', log: 3.7, c: P.fantasma }, { n: 'SPACE TELESCOPE MIRROR', v: '2 cm', log: 1.3, c: P.cinza }, { n: 'EUV CHIP MIRROR', v: '0.1 mm', log: -1, c: P.menta }];
  const bx = 960, bw = 860, by = 700;
  return (
    <g>
      <Moldura fonte="ZEISS SMT (EUV OPTICS)" />
      <g transform={`translate(${ox},${oy}) scale(${esc})`}>
        <path d={DE.d} fill={P.menta} fillOpacity={0.07} stroke={P.menta} strokeWidth={3 / esc} strokeLinejoin="round" />
      </g>
      {/* a superfície do espelho: uma linha reta atravessando o país */}
      <line x1={x0 + 40} y1={oy + 520 * esc} x2={x1 - 40} y2={oy + 520 * esc} stroke={P.osso} strokeWidth={2} strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx={x0 + 190} cy={oy + 520 * esc} r={7} fill={P.ambar} />
      <path d={`M ${x0 + 190},${oy + 520 * esc - 14} L ${x0 + 190},${oy + 380 * esc} L ${x0 + 220},${oy + 380 * esc}`} fill="none" stroke={P.ambar} strokeWidth={2.5} />
      <Rot x={x0 + 232} y={oy + 380 * esc + 8} t="TALLEST BUMP" cor={P.ambar} peso={700} />
      <Cota x1={112} y1={oy} x2={112} y2={oy + 1000 * esc} t="GERMANY · 876 KM" lado={1} />
      <Rot x={bx} y={236} t="SCALE ONE MIRROR UP TO THE SIZE OF GERMANY" cor={P.cinza} tam={24} />
      <text x={bx - 12} y={500} fontFamily={TIT} fontWeight={700} fontSize={300} fill={P.menta} letterSpacing={-12}>0.1<tspan fontSize={150} dx={22} letterSpacing={-4}>mm</tspan></text>
      <text x={bx} y={578} fontFamily={SANS} fontWeight={500} fontSize={38} fill={P.osso}>Its tallest bump would be a tenth of a millimeter.</text>
      <line x1={bx} y1={636} x2={bx + bw} y2={636} stroke={P.linha} strokeWidth={2} />
      {barras.map((b, i) => {
        const y = by + i * 78, l = ((b.log + 1.6) / 5.6) * bw;
        return (
          <g key={i}>
            <Rot x={bx} y={y} t={b.n} cor={i === 2 ? P.osso : P.cinza} tam={20} peso={i === 2 ? 700 : 500} />
            <rect x={bx} y={y + 14} width={l} height={18} rx={2} fill={b.c} />
            <text x={bx + l + 16} y={y + 31} fontFamily={MONO} fontWeight={700} fontSize={26} fill={i === 2 ? P.menta : P.osso}>{b.v}</text>
          </g>
        );
      })}
      <Rot x={bx + bw} y={by - 28} t="SAME SCALING · LOG" cor={P.fantasma} tam={16} anc="end" />
    </g>
  );
};

// 2 · A luz: cada espelho come 30%
const Q2: React.FC = () => {
  const n = 10, xa = 330, xb = 1500, yt = 470, yb = 800;
  const pts: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < n; i++) pts.push({ x: xa + (i * (xb - xa)) / (n - 1), y: i % 2 ? yb : yt, r: Math.pow(0.7, i + 1) });
  const ini = { x: 150, y: yb - 40 }, fim = { x: 1690, y: yt + 30 };
  const seg = [ini, ...pts, fim];
  return (
    <g>
      <Moldura trava={1} nome="THE LIGHT" fonte="ZEISS SMT · UP TO 70% REFLECTED PER MIRROR. 10 MIRRORS SHOWN FOR THE MATH." />
      <Titulo x={M} y={220} linhas={['Every mirror eats *30%* of the light.']} tam={88} cor={P.ambar} />
      <text x={M} y={286} fontFamily={SANS} fontWeight={500} fontSize={34} fill={P.cinza}>EUV light is absorbed by air and by glass. No lenses. Only mirrors, in a vacuum.</text>
      {seg.slice(0, -1).map((a, i) => {
        const b = seg[i + 1], r = i === 0 ? 1 : pts[i - 1].r;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={P.luz} strokeWidth={2 + 26 * r} strokeLinecap="round" opacity={0.35 + 0.65 * Math.sqrt(r)} />;
      })}
      {pts.map((p, i) => {
        const cima = i % 2 === 0, s = cima ? -1 : 1;
        return (
          <g key={i}>
            <path d={`M ${p.x - 62},${p.y + s * 4} Q ${p.x},${p.y + s * 22} ${p.x + 62},${p.y + s * 4} L ${p.x + 62},${p.y + s * 30} L ${p.x - 62},${p.y + s * 30} Z`} fill="url(#hach)" stroke="none" />
            <path d={`M ${p.x - 62},${p.y + s * 4} Q ${p.x},${p.y + s * 22} ${p.x + 62},${p.y + s * 4}`} fill="none" stroke={P.menta} strokeWidth={4} strokeLinecap="round" />
            <text x={p.x} y={p.y + s * 74 + (cima ? 0 : 20)} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={i === n - 1 ? P.ambar : P.osso}>{(p.r * 100).toFixed(p.r < 0.1 ? 1 : 0)}%</text>
          </g>
        );
      })}
      <circle cx={ini.x} cy={ini.y} r={36} fill={P.luz} opacity={0.25} filter="url(#halo)" /><circle cx={ini.x} cy={ini.y} r={13} fill={P.luz} />
      <Rot x={ini.x} y={ini.y + 62} t="100%" cor={P.luz} tam={26} anc="middle" peso={700} />
      <Rot x={ini.x} y={ini.y + 92} t="SOURCE" cor={P.cinza} tam={18} anc="middle" />
      <rect x={fim.x - 6} y={fim.y - 70} width={12} height={140} rx={3} fill={P.osso} />
      <Rot x={fim.x + 26} y={fim.y - 44} t="CHIP" cor={P.cinza} tam={18} />
      <text x={fim.x + 22} y={fim.y + 22} fontFamily={TIT} fontWeight={700} fontSize={64} fill={P.ambar} letterSpacing={-2}>2.8%</text>
      <Rot x={fim.x + 26} y={fim.y + 56} t="ARRIVES" cor={P.ambar} tam={18} peso={700} />
    </g>
  );
};

// 3 · O revestimento: um espelho feito de cem camadas
const Q3: React.FC = () => {
  const cx = 610, cy = 610, R = 290, nc = 22, hc = (2 * R) / nc;
  return (
    <g>
      <Moldura trava={2} nome="THE COATING" fonte="ZEISS SMT · FRAUNHOFER IOF" />
      <Titulo x={M} y={220} linhas={["It's not one mirror. It's *a hundred*."]} tam={88} />
      <clipPath id="lupa"><circle cx={cx} cy={cy} r={R} /></clipPath>
      <g clipPath="url(#lupa)">
        <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill={P.painel} />
        {Array.from({ length: nc }, (_, i) => <rect key={i} x={cx - R} y={cy - R + 96 + i * hc} width={2 * R} height={hc - 3} fill={i % 2 ? P.mentaEsc : P.menta} opacity={i % 2 ? 0.9 : 0.85} />)}
        {/* raio entra, um pouco volta em cada camada, e as voltas se somam */}
        <line x1={cx - 250} y1={cy - R} x2={cx - 30} y2={cy - R + 96 + 7 * hc} stroke={P.luz} strokeWidth={7} strokeLinecap="round" />
        {[0, 2, 4, 6].map((k, i) => { const y = cy - R + 96 + k * hc, x = cx - 250 + ((y - (cy - R)) / (96 + 7 * hc)) * 220; return <line key={k} x1={x} y1={y} x2={x + (y - (cy - R)) * 0.62} y2={cy - R} stroke={P.luz} strokeWidth={5 - i * 0.8} strokeLinecap="round" opacity={0.95 - i * 0.14} />; })}
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={P.osso} strokeWidth={4} />
      {/* de onde vem o zoom: o perfil do espelho inteiro */}
      <path d="M 120,410 Q 240,446 360,410" fill="none" stroke={P.menta} strokeWidth={4} strokeLinecap="round" />
      <path d="M 120,410 Q 240,446 360,410 L 360,440 L 120,440 Z" fill="url(#hach)" />
      <circle cx={240} cy={428} r={11} fill="none" stroke={P.osso} strokeWidth={2.5} />
      <line x1={248} y1={436} x2={cx - R * 0.72} y2={cy - R * 0.7} stroke={P.osso} strokeWidth={2} strokeDasharray="3 8" />
      <Rot x={120} y={380} t="THE MIRROR SURFACE" tam={18} />
      {/* legendas à direita */}
      <path d={`M ${cx + R + 30},${cy - R + 96} h 22 v ${nc * hc - 96 - 3} h -22`} fill="none" stroke={P.ambar} strokeWidth={2.5} />
      <text x={cx + R + 78} y={cy - 4} fontFamily={TIT} fontWeight={700} fontSize={128} fill={P.ambar} letterSpacing={-5}>100</text>
      <Rot x={cx + R + 84} y={cy - 122} t="UP TO" cor={P.ambar} tam={22} peso={700} />
      <text x={cx + R + 300} y={cy - 46} fontFamily={SANS} fontWeight={600} fontSize={36} fill={P.osso}>alternating</text>
      <text x={cx + R + 300} y={cy - 2} fontFamily={SANS} fontWeight={600} fontSize={36} fill={P.osso}>layers.</text>
      <g transform={`translate(${cx + R + 82},${cy + 70})`}>
        <rect width={34} height={22} fill={P.menta} /><Rot x={50} y={19} t="MOLYBDENUM" cor={P.osso} tam={22} peso={700} />
        <rect y={40} width={34} height={22} fill={P.mentaEsc} /><Rot x={50} y={59} t="SILICON" cor={P.osso} tam={22} peso={700} />
        <Rot x={0} y={118} t="EACH LAYER: A FEW NANOMETERS THICK" tam={22} />
        <Rot x={0} y={154} t="EACH ONE BOUNCES BACK A LITTLE LIGHT." tam={22} />
        <Rot x={0} y={190} t="STACKED RIGHT, THE BOUNCES ADD UP: 70%." cor={P.luz} tam={22} peso={700} />
      </g>
    </g>
  );
};

// 4 · A medição: a máquina que só existe para conferir o espelho
const Q4: React.FC = () => {
  const e = 96, x = 230, chao = 880, cw = 10 * e, ch = 5 * e, y = chao - ch - 30;
  return (
    <g>
      <Moldura trava={4} nome="THE MEASUREMENT" fonte="ZEISS SMT (HIGH-NA EUV METROLOGY)" />
      <Titulo x={M} y={220} linhas={["You can't polish what you *can't measure*."]} tam={84} />
      <line x1={M} y1={chao} x2={W - M} y2={chao} stroke={P.fantasma} strokeWidth={2.5} />
      {/* câmara de vácuo em corte */}
      <rect x={x} y={y} width={cw} height={ch} rx={ch / 2.6} fill={P.menta} fillOpacity={0.05} stroke={P.menta} strokeWidth={4} />
      {[0.2, 0.4, 0.6, 0.8].map((k) => <line key={k} x1={x + cw * k} y1={y + (k === 0.2 || k === 0.8 ? 22 : 2)} x2={x + cw * k} y2={y + ch - (k === 0.2 || k === 0.8 ? 22 : 2)} stroke={P.menta} strokeWidth={2} opacity={0.3} />)}
      {[x + cw * 0.22, x + cw * 0.78].map((px) => <path key={px} d={`M ${px - 44},${chao} L ${px - 24},${y + ch - 12} L ${px + 24},${y + ch - 12} L ${px + 44},${chao} Z`} fill={P.painel} stroke={P.menta} strokeWidth={3} />)}
      {/* o espelho lá dentro (≈1 m) e o feixe de medição */}
      <path d={`M ${x + cw * 0.74},${y + ch / 2 - 50} q -22,50 0,100`} fill="none" stroke={P.osso} strokeWidth={6} strokeLinecap="round" />
      <rect x={x + cw * 0.74 + 4} y={y + ch / 2 - 56} width={20} height={112} fill="url(#hachC)" />
      <path d={`M ${x + cw * 0.2},${y + ch / 2} L ${x + cw * 0.74 - 12},${y + ch / 2 - 44} M ${x + cw * 0.2},${y + ch / 2} L ${x + cw * 0.74 - 12},${y + ch / 2 + 44} M ${x + cw * 0.2},${y + ch / 2} L ${x + cw * 0.74 - 14},${y + ch / 2}`} stroke={P.luz} strokeWidth={2.5} fill="none" opacity={0.85} />
      <rect x={x + cw * 0.14} y={y + ch / 2 - 34} width={60} height={68} rx={6} fill={P.painel} stroke={P.osso} strokeWidth={3} />
      <Rot x={x + cw * 0.74 + 40} y={y + ch / 2 - 62} t="THE MIRROR" cor={P.osso} tam={18} peso={700} />
      <Rot x={x + cw * 0.74 + 40} y={y + ch / 2 - 36} t="≈ 1 M WIDE" tam={18} />
      <Cota x1={x} y1={y - 34} x2={x + cw} y2={y - 34} t="10 M" />
      <Cota x1={x - 40} y1={y} x2={x - 40} y2={y + ch} t="5 M" />
      {/* pessoa em escala (1,75 m) */}
      <g transform={`translate(${x + cw + 78},${chao})`} fill={P.osso}>
        <circle cx={0} cy={-1.75 * e + 13} r={13} />
        <path d={`M -19,${-1.75 * e + 34} Q 0,${-1.75 * e + 24} 19,${-1.75 * e + 34} L 15,-78 L 11,0 L 2,0 L 0,-70 L -2,0 L -11,0 L -15,-78 Z`} />
      </g>
      <Rot x={x + cw + 78} y={chao + 34} t="1.75 M" tam={18} anc="middle" />
      {/* números */}
      <g transform={`translate(${x + cw + 190},${y + 60})`}>
        <text fontFamily={TIT} fontWeight={700} fontSize={104} fill={P.ambar} letterSpacing={-4}>150 t</text>
        <Rot x={4} y={40} t="THE WEIGHT OF THE MEASURING MACHINE" tam={20} />
        <text y={176} fontFamily={TIT} fontWeight={700} fontSize={104} fill={P.ambar} letterSpacing={-4}>100,000+</text>
        <Rot x={4} y={216} t="PARTS" tam={20} />
        <text y={300} fontFamily={SANS} fontWeight={600} fontSize={32} fill={P.osso}>Built for one job:</text>
        <text y={344} fontFamily={SANS} fontWeight={600} fontSize={32} fill={P.osso}>checking a single mirror.</text>
      </g>
    </g>
  );
};

// 5 · O casamento: o único cliente é dono de um quarto do único fornecedor
const Q5: React.FC = () => {
  const ax = 150, bx = 1130, y = 400, cw = 520, ch = 250;
  const Caixa: React.FC<{ x: number; nome: string; sub: string; papel: string }> = ({ x, nome, sub, papel }) => (
    <g>
      <rect x={x} y={y} width={cw} height={ch} rx={10} fill={P.painel} stroke={P.menta} strokeWidth={3.5} />
      <Rot x={x + 34} y={y + 52} t={papel} tam={18} />
      <text x={x + 34} y={y + 142} fontFamily={TIT} fontWeight={700} fontSize={84} fill={P.osso} letterSpacing={-3}>{nome}</text>
      <Rot x={x + 34} y={y + 198} t={sub} cor={P.menta} tam={22} peso={700} />
    </g>
  );
  const fl = [{ dy: 62, t: '24.9% STAKE · €1 BN (2016)', dir: 1 }, { dy: 138, t: '€4.41 BN OF OPTICS IN 2025', dir: 1 }, { dy: 214, t: '€1.91 BN IN LOANS, END 2025', dir: 1 }];
  const anos = [{ a: '2023', v: 3.33 }, { a: '2024', v: 3.95 }, { a: '2025', v: 4.41 }];
  return (
    <g>
      <Moldura trava={5} nome="THE MARRIAGE" fonte="ASML ANNUAL REPORT 2025 · ASML/ZEISS ANNOUNCEMENT, NOV 2016" />
      <Titulo x={M} y={210} linhas={['The customer owns *a quarter*', 'of its only supplier.']} tam={80} />
      <Caixa x={ax} nome="ASML" sub="VELDHOVEN · NETHERLANDS" papel="BUILDS THE MACHINE" />
      <Caixa x={bx} nome="ZEISS SMT" sub="OBERKOCHEN · GERMANY" papel="BUILDS EVERY MIRROR IN IT" />
      {fl.map((f, i) => (
        <g key={i}>
          <line x1={ax + cw + 14} y1={y + f.dy} x2={bx - 18} y2={y + f.dy} stroke={P.ambar} strokeWidth={3} markerEnd="url(#setaA)" />
          <Rot x={(ax + cw + bx) / 2} y={y + f.dy - 14} t={f.t} cor={P.ambar} tam={18} anc="middle" peso={700} esp={0.5} />
        </g>
      ))}
      {/* compras de ótica por ano */}
      <Rot x={ax} y={746} t="WHAT ASML PAYS ZEISS SMT EACH YEAR" tam={20} />
      {anos.map((a, i) => (
        <g key={i} transform={`translate(${ax},${782 + i * 54})`}>
          <Rot x={0} y={26} t={a.a} cor={P.osso} tam={22} peso={700} />
          <rect x={92} y={4} width={a.v * 150} height={30} rx={2} fill={i === 2 ? P.ambar : P.fantasma} />
          <text x={92 + a.v * 150 + 16} y={28} fontFamily={MONO} fontWeight={700} fontSize={24} fill={i === 2 ? P.ambar : P.osso}>€{a.v.toFixed(2)} bn</text>
        </g>
      ))}
      <g transform={`translate(${bx},772)`}>
        <text fontFamily={SANS} fontWeight={600} fontSize={30} fill={P.osso}><tspan x={0}>Without Zeiss, ASML says it would</tspan><tspan x={0} dy={42}>"effectively cease" to do business.</tspan></text>
        <Rot x={0} y={96} t="THERE IS NO SECOND SUPPLIER." cor={P.menta} tam={22} peso={700} />
      </g>
    </g>
  );
};

// 6 · O mapa do vídeo: cinco travas, a última escondida
const Q6: React.FC = () => {
  const it = [{ n: 'THE LIGHT', s: 'Absorbed by air and glass', e: 2 }, { n: 'THE COATING', s: '100 layers, nanometers thick', e: 2 }, { n: 'THE SHAPE', s: 'Germany-sized, 0.1 mm bump', e: 1 }, { n: 'THE MEASUREMENT', s: '', e: 0 }, { n: '? ? ?', s: 'Not technology at all', e: 0 }];
  const x = 1010, y0 = 250, p = 142;
  return (
    <g>
      <Moldura trava={3} nome="THE SHAPE" />
      <Titulo x={M} y={420} linhas={['Five locks.', 'The last one', "*isn't technology*."]} tam={104} />
      {/* original x cópia: a assinatura do canal */}
      <g transform={`translate(${M},790)`}>
        <path d="M 0,0 Q 190,34 380,0" fill="none" stroke={P.menta} strokeWidth={5} strokeLinecap="round" />
        <Rot x={0} y={62} t="THE ORIGINAL" cor={P.menta} tam={20} peso={700} />
        <path d="M 440,0 q 24,14 48,5 t 46,10 t 50,-4 t 46,9 t 48,-8 t 50,6 t 46,-11 t 46,-7" fill="none" stroke={P.cinza} strokeWidth={4} strokeDasharray="10 9" strokeLinecap="round" />
        <Rot x={440} y={62} t="THE COPY" cor={P.cinza} tam={20} peso={700} />
      </g>
      {it.map((t, i) => {
        const y = y0 + i * p, feito = t.e === 2, atual = t.e === 1, cor = feito ? P.menta : atual ? P.ambar : P.fantasma;
        return (
          <g key={i} opacity={t.e === 0 ? 0.75 : 1}>
            <rect x={x} y={y} width={814} height={p - 22} rx={10} fill={atual ? '#1B1A12' : P.painel} stroke={cor} strokeWidth={atual ? 4 : 2.5} strokeDasharray={t.e === 0 ? '10 9' : undefined} />
            <text x={x + 44} y={y + 80} fontFamily={TIT} fontWeight={700} fontSize={64} fill={cor} letterSpacing={-2}>{i + 1}</text>
            <text x={x + 122} y={y + (t.s ? 58 : 76)} fontFamily={TIT} fontWeight={700} fontSize={44} fill={t.e === 0 ? P.cinza : P.osso} letterSpacing={-1}>{t.n}</text>
            {t.s && <text x={x + 122} y={y + 96} fontFamily={SANS} fontWeight={500} fontSize={26} fill={P.cinza}>{t.s}</text>}
            <Rot x={x + 780} y={y + 68} t={feito ? 'OPEN' : atual ? 'NOW' : 'LOCKED'} cor={cor} tam={20} anc="end" peso={700} />
          </g>
        );
      })}
    </g>
  );
};

const QS = [Q1, Q2, Q3, Q4, Q5, Q6];
export const HTCQuadro: React.FC<{ q: number }> = ({ q }) => {
  const Q = QS[(q || 1) - 1];
  return (
    <AbsoluteFill style={{ background: P.fundo }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><Defs /><Fundo /><Q /></svg>
    </AbsoluteFill>
  );
};
