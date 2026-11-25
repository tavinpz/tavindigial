import React from 'react';
import { Img, staticFile } from 'remotion';
import { K, L, SANS, TIT, pop } from './lib';

// Strong Not Big #06 em diante: objetos de cena, linha do tempo, close de rosto e câmera.
// Tudo opcional dentro do `v` da fala: obj (lista), tl (etapa da linha do tempo), face, zoom/foco, imp (impacto).
type V = Record<string, any>;
const W = 1920, H = 1080;
const ent = (g: number, t0: number) => ({ o: L(g, [t0, t0 + 6], [0, 1]), s: Math.min(1.12, pop(g, t0)) });
const st = (c = K.tinta, w = 6) => ({ fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

// ---------- linha do tempo fixa no topo ----------
export const TL_ETAPAS = ['DAY 1', 'WEEK 1', 'WEEK 3', 'MONTH 1', 'MONTH 6', 'YEAR 1'];
export const Linha: React.FC<{ g: number; tl: number; ini: number }> = ({ g, tl, ini }) => {
  const x0 = 470, x1 = 1450, y = 70, n = TL_ETAPAS.length, px = (i: number) => x0 + ((x1 - x0) * i) / (n - 1);
  const p = L(g, [ini, ini + 24], [Math.max(0, tl - 1), tl]);
  return <g opacity={L(g, [0, 8], [0, 1])}>
    <rect x={x0} y={y - 4} width={x1 - x0} height={8} rx={4} fill="#26262b" />
    <rect x={x0} y={y - 4} width={(px(p) - x0)} height={8} rx={4} fill={K.verm} />
    {TL_ETAPAS.map((e, i) => {
      const ativo = i <= tl, atual = i === tl, r = atual ? 15 + 2 * Math.sin(g / 6) : 10;
      return <g key={e}>
        <circle cx={px(i)} cy={y} r={r} fill={ativo ? K.verm : '#26262b'} stroke={atual ? K.osso : 'none'} strokeWidth={4} />
        <text x={px(i)} y={y + 50} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={atual ? 30 : 24} fill={atual ? K.osso : ativo ? K.cinza : '#4a4a50'} letterSpacing={1.5}>{e}</text>
      </g>;
    })}
  </g>;
};

// ---------- close de rosto ----------
export const Rosto: React.FC<{ g: number; t0: number; f: V }> = ({ g, t0, f }) => {
  const { o } = ent(g, t0), w = f.w || 760, h = (w * 400) / 420;
  const x = f.lado === 'e' ? 40 : W - w - 40, tr = f.treme ? Math.sin(g * 2.3) * 6 * Math.max(0, 1 - (g - t0) / 24) : 0;
  const z = 1 + 0.04 * L(g, [t0, t0 + 90], [0, 1]);
  return <div style={{ position: 'absolute', left: x + tr, top: H - h + 30 + (1 - o) * 120, width: w, height: h, opacity: o, transform: `scale(${z})`, transformOrigin: '50% 100%' }}>
    <Img src={staticFile(`snb/poses/${f.p}.png`)} style={{ width: w, height: h }} />
  </div>;
};

// ---------- objetos ----------
const Balanca: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const { o: op, s } = ent(g, t0), x = o.x ?? 960, y = o.y ?? 760, roda = g - t0 < 22;
  const num = roda ? (60 + ((g * 7.3) % 30)).toFixed(1) + ' KG' : o.n;
  return <g opacity={op} transform={`translate(${x},${y + (1 - Math.min(1, s)) * 30}) scale(1.45)`}>
    <rect x={-230} y={-40} width={460} height={110} rx={34} fill={K.osso} stroke={K.tinta} strokeWidth={7} />
    <rect x={-230} y={42} width={460} height={28} rx={14} fill="#c9c1b1" />
    <rect x={-120} y={-18} width={240} height={64} rx={10} fill="#10241a" stroke={K.tinta} strokeWidth={5} />
    <text x={0} y={30} textAnchor="middle" fontFamily={TIT} fontSize={50} fill={K.verde} letterSpacing={3}>{num}</text>
    {!roda && o.igual && <text x={0} y={-70} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} fill={K.osso} opacity={L(g, [t0 + 24, t0 + 32], [0, 1])}>SAME NUMBER</text>}
  </g>;
};
const Galao: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const x = o.x ?? 860, y = o.y ?? 700, k = o.voa ? L(g, [t0 + 4, t0 + 13], [0, 1], (t) => t) : 0, TOPO = 450;
  const bateu = o.voa && g >= t0 + 13, gx = x + 120 * k, gy = y - (y - TOPO) * k - (bateu ? 0 : 0);
  const rot = o.voa ? (bateu ? -28 + Math.sin(g) * 2 : -28 * k) : 0, tr = bateu ? Math.sin(g * 2.4) * 8 * Math.max(0, 1 - (g - t0 - 13) / 12) : 0;
  return <g>
    {/* armário da cozinha */}
    <g transform={`translate(${tr},0)`}>
      <rect x={x - 340} y={130} width={760} height={170} fill="#1c1c20" stroke="#2f2f35" strokeWidth={6} />
      <path d={`M ${x + 40},130 L ${x + 40},300`} stroke="#2f2f35" strokeWidth={6} />
      <rect x={x - 30} y={260} width={40} height={10} rx={5} fill="#3a3a41" /><rect x={x + 70} y={260} width={40} height={10} rx={5} fill="#3a3a41" />
      <rect x={x - 380} y={y + 150} width={860} height={26} fill="#1c1c20" />
    </g>
    {bateu && <g opacity={L(g, [t0 + 13, t0 + 30], [1, 0])}>{Array.from({ length: 10 }).map((_, i) => { const a = (i / 10) * Math.PI * 2, r1 = 60, r2 = 60 + 70 * L(g, [t0 + 13, t0 + 22], [0, 1]); return <path key={i} d={`M ${gx + r1 * Math.cos(a)},${300 + r1 * Math.sin(a) * 0.6} L ${gx + r2 * Math.cos(a)},${300 + r2 * Math.sin(a) * 0.6}`} {...st(K.verm, 9)} />; })}</g>}
    <g transform={`translate(${gx},${bateu ? TOPO : gy}) rotate(${rot})`}>
      <path d="M -70,-60 L -70,130 Q -70,150 -50,150 L 50,150 Q 70,150 70,130 L 70,-40 L 30,-90 L 30,-120 L -20,-120 L -20,-90 Z" fill={K.osso} stroke={K.tinta} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-28} y={-150} width={66} height={34} rx={6} fill={K.verm} stroke={K.tinta} strokeWidth={6} />
      <path d="M 70,-30 Q 110,-10 110,40 Q 110,80 70,90" {...st(K.tinta, 7)} />
      <rect x={-56} y={10} width={112} height={70} fill="#e8e2d6" stroke={K.tinta} strokeWidth={4} />
      <text x={0} y={60} textAnchor="middle" fontFamily={TIT} fontSize={40} fill={K.tinta}>MILK</text>
    </g>
  </g>;
};
const Sacolas: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => <g>
  {[0, 1, 2].map((i) => {
    const x = (o.x ?? 1250) + i * 250, sobe = L(g, [t0 + i * 5, t0 + 40 + i * 5], [0, 1]), y = 760 - 330 * sobe + Math.sin(g / 9 + i) * 10;
    return <g key={i} transform={`translate(${x},${y}) rotate(${Math.sin(g / 13 + i) * 7}) scale(1.7)`} opacity={L(g, [t0, t0 + 6], [0, 1])}>
      <path d="M -60,-40 L 60,-40 L 72,110 L -72,110 Z" fill="#d9cdb4" stroke={K.tinta} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -30,-40 Q -30,-90 0,-90 Q 30,-90 30,-40" {...st(K.tinta, 7)} />
      <circle cx={-20} cy={-50} r={16} fill={K.verde} stroke={K.tinta} strokeWidth={4} /><rect x={6} y={-80} width={24} height={44} fill={K.verm} stroke={K.tinta} strokeWidth={4} />
      <path d="M -40,180 Q 0,150 40,180" {...st(K.cinza, 4)} opacity={0.5 * sobe} />
    </g>;
  })}
</g>;
const Cadeado: React.FC<{ x: number; y: number; aberto: number; s?: number }> = ({ x, y, aberto, s = 1 }) => <g transform={`translate(${x},${y}) scale(${s})`}>
  <path d={`M -38,-10 L -38,${-60 - 26 * aberto} Q -38,${-108 - 26 * aberto} 0,${-108 - 26 * aberto} Q 38,${-108 - 26 * aberto} 38,${-60 - 26 * aberto} L 38,${-10 - 46 * aberto}`} {...st(aberto > 0.5 ? K.verde : K.osso, 16)} />
  <rect x={-64} y={-14} width={128} height={110} rx={16} fill={aberto > 0.5 ? K.verde : K.verm} stroke={K.tinta} strokeWidth={6} />
  <circle cx={0} cy={30} r={12} fill={K.tinta} /><rect x={-5} y={30} width={10} height={36} fill={K.tinta} />
</g>;
const Cadeados: React.FC<{ g: number; t0: number; o: V; ini: number[] }> = ({ g, t0, o }) => {
  const n = o.n || 3, ab = o.ab || 0, x0 = (o.x ?? 960) - ((n - 1) * 230) / 2, y = o.y ?? 560;
  return <g>{Array.from({ length: n }).map((_, i) => {
    const e = ent(g, t0 + i * 6), abre = i < ab ? (i === ab - 1 && o.novo ? L(g, [t0 + 10, t0 + 22], [0, 1]) : 1) : 0;
    return <g key={i} opacity={e.o}><Cadeado x={x0 + i * 230} y={y} aberto={abre} s={1.15 * Math.min(1, e.s)} />
      {o.rot && o.rot[i] && <text x={x0 + i * 230} y={y + 170} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={i < ab ? K.verde : K.osso}>{o.rot[i]}</text>}</g>;
  })}</g>;
};
// cabo de guerra: 10 trabalhadores numa corda; os "on" levantam e puxam
const Corda: React.FC<{ g: number; t0: number; o: V; antes: number }> = ({ g, t0, o, antes }) => {
  const n = 10, on = o.on ?? 0.4, y = o.y ?? 640;
  return <g opacity={L(g, [t0, t0 + 8], [0, 1])}>
    <path d={`M 230,${y} L 1690,${y}`} {...st('#b08a55', 14)} />
    <rect x={1640} y={y - 70} width={120} height={140} rx={16} fill={K.painel} stroke={K.cinza} strokeWidth={4} />
    <text x={1700} y={y + 14} textAnchor="middle" fontFamily={TIT} fontSize={44} fill={K.osso}>BAR</text>
    {Array.from({ length: n }).map((_, i) => {
      const x = 300 + i * 132, era = i < Math.round(antes * n), eh = i < Math.round(on * n);
      const k = eh ? (era ? 1 : L(g, [t0 + 6 + i * 3, t0 + 16 + i * 3], [0, 1])) : 0, puxa = k * (6 + 3 * Math.sin(g / 4 + i));
      const cor = eh ? K.osso : '#4a4a50', hy = y - 150 + 70 * (1 - k);
      return <g key={i} transform={`translate(${x - puxa},0)`}>
        <circle cx={-k * 18} cy={hy - 30} r={26} fill={cor} />
        <path d={`M ${-k * 18},${hy} L 0,${y + 60 - 30 * (1 - k)}`} {...st(cor, 14)} />
        <path d={`M ${-k * 10},${hy + 30} L 30,${y}`} {...st(cor, 10)} opacity={k > 0.2 ? 1 : 0.3} />
        <path d={`M 0,${y + 60 - 30 * (1 - k)} L ${-30 - 20 * k},${y + 150} M 0,${y + 60 - 30 * (1 - k)} L ${40 - 30 * (1 - k)},${y + 150}`} {...st(cor, 12)} />
      </g>;
    })}
    <text x={960} y={y + 250} textAnchor="middle" fontFamily={TIT} fontSize={70} fill={K.osso} letterSpacing={2}>{Math.round(on * 100)}<tspan fill={K.cinza} fontSize={44}> / 100 PULLING</tspan></text>
  </g>;
};
const Cartao: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const { o: op, s } = ent(g, t0), x = o.x ?? 960, y = o.y ?? 470, w = o.w || 1180, l: string[] = o.l || [];
  return <g opacity={op} transform={`translate(${x},${y}) scale(${0.92 + 0.08 * Math.min(1, s)})`}>
    <rect x={-w / 2} y={-130} width={w} height={150 + l.length * 70} fill={K.painel} stroke="#2c2c31" strokeWidth={3} />
    <rect x={-w / 2} y={-130} width={12} height={150 + l.length * 70} fill={K.verm} />
    <text x={-w / 2 + 50} y={-60} fontFamily={SANS} fontWeight={800} fontSize={30} fill={K.cinza} letterSpacing={3}>STUDY</text>
    <text x={-w / 2 + 50} y={4} fontFamily={TIT} fontSize={66} fill={K.osso} letterSpacing={2}>{o.tit}</text>
    {l.map((t, i) => <text key={i} x={-w / 2 + 50} y={78 + i * 66} fontFamily={SANS} fontWeight={700} fontSize={42} fill={K.osso} opacity={L(g, [t0 + 10 + i * 8, t0 + 18 + i * 8], [0, 1])}>{t}</text>)}
  </g>;
};
// força × tamanho do músculo nas 8 semanas (forma qualitativa do Moritani & deVries 1979)
const Grafico: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0 }) => {
  const x0 = 380, x1 = 1540, y0 = 860, y1 = 250, p = L(g, [t0 + 6, t0 + 70], [0, 1], (t) => t);
  const X = (w: number) => x0 + ((x1 - x0) * w) / 8, Y = (v: number) => y0 - (y0 - y1) * v;
  const forca = (w: number) => 0.95 * (1 - Math.exp(-w / 2.6)), musc = (w: number) => w < 3 ? 0.03 * w : 0.09 + 0.09 * (w - 3);
  const pts = (fn: (w: number) => number) => Array.from({ length: 41 }).map((_, i) => i / 5).filter((w) => w <= 8 * p).map((w) => `${X(w)},${Y(fn(w))}`).join(' ');
  return <g opacity={L(g, [t0, t0 + 8], [0, 1])}>
    <rect x={X(0)} y={y1 - 20} width={X(4) - X(0)} height={y0 - y1 + 20} fill={K.verm} opacity={0.08} />
    <text x={(X(0) + X(4)) / 2} y={y1 + 20} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={K.verm} letterSpacing={2} opacity={L(g, [t0 + 40, t0 + 50], [0, 1])}>MOSTLY NERVOUS SYSTEM</text>
    <path d={`M ${x0},${y1 - 20} L ${x0},${y0} L ${x1},${y0}`} {...st(K.cinza, 4)} />
    {[0, 2, 4, 6, 8].map((w) => <text key={w} x={X(w)} y={y0 + 50} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={K.cinza}>{`WK ${w}`}</text>)}
    <polyline points={pts(forca)} {...st(K.verm, 12)} /><polyline points={pts(musc)} {...st(K.osso, 10)} />
    <text x={X(8) + 20} y={Y(forca(8)) + 10} fontFamily={TIT} fontSize={44} fill={K.verm} opacity={p}>STRENGTH</text>
    <text x={X(8) + 20} y={Y(musc(8)) + 10} fontFamily={TIT} fontSize={44} fill={K.osso} opacity={p}>MUSCLE</text>
  </g>;
};
// cubo × quadrado: dobra o tamanho → peso ×8, força ×4
const Cubo: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0 }) => {
  const k = 1 + L(g, [t0 + 20, t0 + 60], [0, 1]), base = 150;
  const cubo = (x: number, a: number) => { const d = a * 0.35; return <g><path d={`M ${x},${780 - a} l ${d},${-d} l ${a},0 l 0,${a} l ${-d},${d} Z`} fill="#c9c1b1" stroke={K.tinta} strokeWidth={6} /><rect x={x} y={780 - a} width={a} height={a} fill={K.osso} stroke={K.tinta} strokeWidth={6} /></g>; };
  return <g opacity={L(g, [t0, t0 + 8], [0, 1])}>
    {cubo(420, base * k)}
    <rect x={1230} y={780 - base * k} width={base * k} height={base * k} fill={K.verm} stroke={K.tinta} strokeWidth={6} />
    <text x={420 + base * k * 0.6} y={880} textAnchor="middle" fontFamily={TIT} fontSize={56} fill={K.osso}>WEIGHT X{Math.round(Math.pow(k, 3) * 10) / 10}</text>
    <text x={1230 + base * k / 2} y={880} textAnchor="middle" fontFamily={TIT} fontSize={56} fill={K.verm}>STRENGTH X{Math.round(Math.pow(k, 2) * 10) / 10}</text>
    <text x={960} y={300} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={K.cinza} letterSpacing={2}>{k > 1.05 ? `TWICE AS BIG` : 'SAME SHAPE'}</text>
  </g>;
};
const Cerebro: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const x = o.x ?? 960, y = o.y ?? 400, pul = 0.6 + 0.4 * Math.sin(g / 5), lin = L(g, [t0 + 10, t0 + 30], [0, 1]);
  return <g opacity={L(g, [t0, t0 + 8], [0, 1])}>
    <circle cx={x} cy={y} r={190} fill={K.ambar} opacity={0.12 * pul} />
    <path d={`M ${x - 150},${y + 30} C ${x - 200},${y - 80} ${x - 90},${y - 170} ${x},${y - 140} C ${x + 90},${y - 170} ${x + 200},${y - 80} ${x + 150},${y + 30} C ${x + 160},${y + 110} ${x + 40},${y + 130} ${x},${y + 90} C ${x - 40},${y + 130} ${x - 160},${y + 110} ${x - 150},${y + 30} Z`} fill={K.osso} stroke={K.tinta} strokeWidth={8} />
    <path d={`M ${x},${y - 140} L ${x},${y + 90} M ${x - 110},${y - 60} q 40,30 0,60 M ${x + 110},${y - 60} q -40,30 0,60 M ${x - 60},${y - 110} q 20,40 -10,70 M ${x + 60},${y - 110} q -20,40 10,70`} {...st(K.tinta, 5)} />
    {[-1, 1].map((s) => <g key={s}>
      <path d={`M ${x + s * 150},${y + 40} Q ${x + s * 380},${y + 160} ${x + s * 520},${y + 330}`} {...st(K.ambar, 10)} strokeDasharray="1600" strokeDashoffset={1600 * (1 - lin)} />
      <circle cx={x + s * 560} cy={y + 380} r={70} fill={o.lado === s ? K.cinza : K.ambar} stroke={K.tinta} strokeWidth={6} opacity={lin} />
      <text x={x + s * 560} y={y + 394} textAnchor="middle" fontFamily={TIT} fontSize={40} fill={K.tinta} opacity={lin}>{s < 0 ? 'LEFT' : 'RIGHT'}</text>
    </g>)}
  </g>;
};
// motor + corda + roda: frouxa, firme ou rompe
const Motor: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const e = o.estado || 'frouxa', y = 560, rompe = e === 'rompe' && g >= t0 + 6;
  const vel = e === 'firme' ? 0.22 : e === 'frouxa' ? 0.06 : rompe ? 0 : 0.2, ang = (g * vel * 57.3) % 360;
  const sag = e === 'frouxa' ? 110 : 0;
  return <g opacity={L(g, [t0, t0 + 8], [0, 1])}>
    <rect x={260} y={y - 140} width={330} height={280} rx={24} fill="#2a2a30" stroke={K.osso} strokeWidth={6} />
    <text x={425} y={y + 20} textAnchor="middle" fontFamily={TIT} fontSize={58} fill={K.osso}>{o.motor || 'MUSCLE'}</text>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={290 + i * 75} y={y - 180 + (i % 2) * 8 + Math.sin(g * 0.8 + i) * 4} width={40} height={44} fill="#3a3a41" stroke={K.osso} strokeWidth={4} />)}
    {!rompe ? <path d={`M 590,${y} Q 960,${y + sag + Math.sin(g / 6) * (sag ? 10 : 2)} 1330,${y}`} {...st(o.cor || K.ambar, 18)} />
      : <g>
        <path d={`M 590,${y} Q 760,${y + 40} ${880 - 20 * L(g, [t0 + 6, t0 + 14], [0, 1])},${y + 120 * L(g, [t0 + 6, t0 + 20], [0, 1])}`} {...st(K.verm, 18)} />
        <path d={`M 1330,${y} Q 1160,${y + 40} ${1040 + 20 * L(g, [t0 + 6, t0 + 14], [0, 1])},${y + 120 * L(g, [t0 + 6, t0 + 20], [0, 1])}`} {...st(K.verm, 18)} />
        <circle cx={960} cy={y} r={160 * L(g, [t0 + 6, t0 + 14], [0, 1])} fill={K.verm} opacity={L(g, [t0 + 6, t0 + 20], [0.5, 0])} />
      </g>}
    <text x={960} y={y - 60} textAnchor="middle" fontFamily={TIT} fontSize={52} fill={rompe ? K.verm : K.ambar}>{rompe ? 'SNAP' : (o.corda || 'TENDON')}</text>
    <g transform={`translate(1460,${y}) rotate(${ang})`}>
      <circle r={130} fill="#2a2a30" stroke={K.osso} strokeWidth={8} />
      {[0, 60, 120].map((a) => <path key={a} d="M -120,0 L 120,0" transform={`rotate(${a})`} {...st(K.osso, 8)} />)}
      <circle r={26} fill={K.osso} />
    </g>
    <text x={1460} y={y + 210} textAnchor="middle" fontFamily={TIT} fontSize={52} fill={K.osso}>{o.roda || 'BONE'}</text>
  </g>;
};
const Enquete: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const r = o.marca;
  return <g>{[['MUSCLE', 560], ['BRAIN', 1360]].map(([t, x], i) => {
    const e = ent(g, t0 + i * 6), certo = r && t === r, apaga = r && t !== r;
    return <g key={t as string} opacity={e.o * (apaga ? 0.35 : 1)} transform={`translate(${x},470) scale(${(0.9 + 0.1 * Math.min(1, e.s)) * (certo ? 1 + 0.06 * L(g, [t0, t0 + 10], [0, 1]) : 1)})`}>
      <rect x={-300} y={-170} width={600} height={340} rx={30} fill={certo ? '#12281b' : K.painel} stroke={certo ? K.verde : '#2c2c31'} strokeWidth={certo ? 8 : 4} />
      <text x={0} y={40} textAnchor="middle" fontFamily={TIT} fontSize={130} fill={certo ? K.verde : K.osso} letterSpacing={3}>{t}</text>
      {certo && <text x={0} y={130} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} fill={K.verde}>✓ RIGHT</text>}
    </g>;
  })}
    {!r && <g opacity={L(g, [t0 + 14, t0 + 22], [0, 1])} transform={`translate(960,${800 + Math.sin(g / 6) * 4})`}>
      <path d="M -330,-60 L 330,-60 Q 360,-60 360,-30 L 360,40 Q 360,70 330,70 L -200,70 L -250,120 L -250,70 L -330,70 Q -360,70 -360,40 L -360,-30 Q -360,-60 -330,-60 Z" fill={K.osso} stroke={K.tinta} strokeWidth={6} />
      <text x={0} y={24} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={50} fill={K.tinta}>COMMENT 1 WORD</text>
    </g>}
    <text x={960} y={400} textAnchor="middle" fontFamily={TIT} fontSize={90} fill={K.cinza} opacity={L(g, [t0 + 6, t0 + 14], [0, 1])}>OR</text>
  </g>;
};
const Inscrever: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const x = o.x ?? 1350, y = o.y ?? 560, e = ent(g, t0), click = g >= t0 + 26, cx = L(g, [t0 + 8, t0 + 24], [x + 360, x + 60]), cy = L(g, [t0 + 8, t0 + 24], [y + 240, y + 30]);
  return <g opacity={e.o}>
    <g transform={`translate(${x},${y}) scale(${(0.9 + 0.1 * Math.min(1, e.s)) * (click ? 1 - 0.06 * L(g, [t0 + 26, t0 + 30], [1, 0]) : 1)})`}>
      <rect x={-260} y={-70} width={520} height={140} rx={70} fill={click ? '#2c2c31' : K.verm} />
      <text x={-30} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={60} fill={K.osso}>{click ? 'SUBSCRIBED' : 'SUBSCRIBE'}</text>
      <g transform={`translate(190,0) rotate(${click ? Math.sin(g * 1.4) * 14 * Math.max(0, 1 - (g - t0 - 26) / 30) : 0})`}>
        <path d="M -24,20 L -24,-6 Q -24,-34 0,-34 Q 24,-34 24,-6 L 24,20 L 32,28 L -32,28 Z" fill={K.osso} /><circle cx={0} cy={38} r={8} fill={K.osso} />
      </g>
    </g>
    <path transform={`translate(${cx},${cy})`} d="M 0,0 L 0,64 L 16,48 L 30,78 L 42,72 L 28,44 L 50,44 Z" fill={K.osso} stroke={K.tinta} strokeWidth={4} />
  </g>;
};
const Calend: React.FC<{ g: number; t0: number; o: V }> = ({ g, t0, o }) => {
  const x = o.x ?? 1350, y = o.y ?? 470, n = o.paginas || 6, k = L(g, [t0 + 4, t0 + 40], [0, n], (t) => t), i = Math.floor(k);
  const rot: string[] = o.rot || ['DAY 1', 'DAY 30'];
  return <g opacity={L(g, [t0, t0 + 6], [0, 1])} transform={`translate(${x},${y})`}>
    <rect x={-200} y={-200} width={400} height={400} rx={20} fill={K.osso} stroke={K.tinta} strokeWidth={8} />
    <rect x={-200} y={-200} width={400} height={100} rx={20} fill={K.verm} stroke={K.tinta} strokeWidth={8} />
    <text x={0} y={70} textAnchor="middle" fontFamily={TIT} fontSize={110} fill={K.tinta}>{i >= n ? rot[1] : rot[0]}</text>
    {i < n && <path d={`M -200,${-100 + (k - i) * 300} L 200,${-100 + (k - i) * 300}`} {...st(K.cinza, 6)} opacity={0.6} />}
  </g>;
};

export const Objetos: React.FC<{ g: number; lista: V[]; desde: (n: number) => number; antes: (n: number) => V | undefined }> = ({ g, lista, desde, antes }) => <>
  {lista.map((o, n) => {
    const t0 = desde(n), k = o.t + n;
    switch (o.t) {
      case 'balanca': return <Balanca key={k} g={g} t0={t0} o={o} />;
      case 'galao': return <Galao key={k} g={g} t0={t0} o={o} />;
      case 'sacolas': return <Sacolas key={k} g={g} t0={t0} o={o} />;
      case 'cadeados': return <Cadeados key={k} g={g} t0={t0} o={o} ini={[]} />;
      case 'corda': return <Corda key={k} g={g} t0={t0} o={o} antes={antes(n)?.t === 'corda' ? (antes(n)?.on ?? 0.4) : (o.de ?? o.on ?? 0.4)} />;
      case 'cartao': return <Cartao key={k} g={g} t0={t0} o={o} />;
      case 'grafico': return <Grafico key={k} g={g} t0={t0} o={o} />;
      case 'cubo': return <Cubo key={k} g={g} t0={t0} o={o} />;
      case 'cerebro': return <Cerebro key={k} g={g} t0={t0} o={o} />;
      case 'motor': return <Motor key={k} g={g} t0={t0} o={o} />;
      case 'enquete': return <Enquete key={k} g={g} t0={t0} o={o} />;
      case 'inscrever': return <Inscrever key={k} g={g} t0={t0} o={o} />;
      case 'calend': return <Calend key={k} g={g} t0={t0} o={o} />;
      default: return null;
    }
  })}
</>;
export { W as LARG, H as ALT };
