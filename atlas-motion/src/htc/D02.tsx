import React from 'react';
import { P, Rot } from './lib';
import { Ctx, L, Txt, pop, rnd } from './base';

// Hard to Copy #02 (TSMC): diagramas sob medida.

// voo: a lâmina feita no Arizona atravessa o Pacífico para ser encapsulada em Taiwan. Passo 1 Arizona, 2 o avião sai, 3 chega e aparece a distância.
const Voo: React.FC<Ctx> = ({ g, a }) => {
  const cx = 960, cy = 2050, r = 1400, th = 0.46, ax = cx - r * Math.sin(th), tx = cx + r * Math.sin(th), py = cy - r * Math.cos(th), cxy = 300;
  const p = Math.min(1, a(2, 60) * 0.55 + a(3, 44) * 0.45), B = (t: number) => ({ x: (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * tx, y: (1 - t) * (1 - t) * (py - 60) + 2 * (1 - t) * t * cxy + t * t * (py - 60) });
  const pt = B(p), ant = B(Math.max(0, p - 0.01)), ang = (Math.atan2(pt.y - ant.y, pt.x - ant.x) * 180) / Math.PI, e1 = a(1, 12), e3 = a(3, 12, 30);
  let d = ''; for (let t = 0; t <= p + 0.0001; t += 0.02) { const q = B(Math.min(p, t)); d += `${t ? 'L' : 'M'} ${q.x},${q.y} `; }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0E1513" stroke={P.mentaEsc} strokeWidth={4} />
      {Array.from({ length: 60 }, (_, i) => { const an = -0.62 + rnd(i) * 1.24, rr = r - 30 - rnd(i + 70) * 260; return <circle key={i} cx={cx + rr * Math.sin(an)} cy={cy - rr * Math.cos(an)} r={2.5} fill={P.menta} opacity={0.12 + 0.1 * Math.sin(g / 20 + i)} />; })}
      <Rot x={cx} y={py + 80} t="PACIFIC OCEAN" anc="middle" tam={20} cor={P.fantasma} esp={10} />
      {/* Arizona */}
      <g opacity={e1}>
        <line x1={ax} y1={py} x2={ax} y2={py - 50} stroke={P.menta} strokeWidth={4} /><circle cx={ax} cy={py} r={10 + 3 * Math.sin(g / 6)} fill={P.menta} />
        <g transform={`translate(${ax},${py - 150}) scale(${Math.min(1, pop(g, 0) || 1) * (1 - 0.75 * Math.min(1, p * 6))})`} opacity={1 - Math.min(1, p * 5) * 0.0}>
          <circle r={84} fill="#10231B" stroke={P.menta} strokeWidth={5} />
          <clipPath id="waf"><circle r={78} /></clipPath>
          <g clipPath="url(#waf)">{Array.from({ length: 9 }, (_, i) => <g key={i}><line x1={-84} y1={-72 + i * 18} x2={84} y2={-72 + i * 18} stroke={P.menta} strokeWidth={1.5} opacity={0.5} /><line x1={-72 + i * 18} y1={-84} x2={-72 + i * 18} y2={84} stroke={P.menta} strokeWidth={1.5} opacity={0.5} /></g>)}
            <rect x={-200 + ((g * 6) % 400)} y={-90} width={40} height={180} fill={P.osso} opacity={0.14} transform="skewX(-20)" /></g>
        </g>
        <Txt x={ax} y={py + 62} textAnchor="middle" s={44} c={P.menta}>ARIZONA</Txt><Rot x={ax} y={py + 96} t="THE WAFER IS MADE HERE" anc="middle" tam={18} cor={P.osso} />
      </g>
      {/* rota */}
      <path d={`M ${ax},${py - 60} Q ${cx},${cxy} ${tx},${py - 60}`} fill="none" stroke={P.fantasma} strokeWidth={2.5} strokeDasharray="4 12" opacity={a(1, 10, 10)} />
      {p > 0 && <path d={d} fill="none" stroke={P.ambar} strokeWidth={5} strokeLinecap="round" />}
      {p > 0 && p < 1 && (
        <g transform={`translate(${pt.x},${pt.y}) rotate(${ang})`}>
          <circle r={34} fill={P.ambar} opacity={0.18} filter="url(#halo)" />
          <path d="M 34,0 L -18,-9 L -30,-30 L -40,-30 L -34,-7 L -52,-4 L -60,-16 L -66,-16 L -62,0 L -66,16 L -60,16 L -52,4 L -34,7 L -40,30 L -30,30 L -18,9 Z" fill={P.osso} />
        </g>
      )}
      {/* Taiwan */}
      <g opacity={L(g, [0, 14], [0, 1]) * 0.45 + 0.55 * a(3, 12, 30)}>
        <line x1={tx} y1={py} x2={tx} y2={py - 50} stroke={P.ambar} strokeWidth={4} /><circle cx={tx} cy={py} r={10 + 3 * Math.sin(g / 6 + 2)} fill={P.ambar} />
        <Txt x={tx} y={py + 62} textAnchor="middle" s={44} c={P.ambar}>TAIWAN</Txt><Rot x={tx} y={py + 96} t="IT BECOMES A CHIP HERE" anc="middle" tam={18} cor={P.osso} />
      </g>
      <g opacity={e3} transform={`translate(${tx},${py - 150}) scale(${0.7 + 0.3 * e3})`}>
        <rect x={-84} y={-66} width={168} height={132} rx={10} fill={P.painel} stroke={P.ambar} strokeWidth={5} />
        <rect x={-46} y={-36} width={92} height={72} rx={4} fill={P.ambar} opacity={0.9} />
        {Array.from({ length: 7 }, (_, i) => <g key={i}><line x1={-66 + i * 22} y1={-66} x2={-66 + i * 22} y2={-84} stroke={P.ambar} strokeWidth={5} /><line x1={-66 + i * 22} y1={66} x2={-66 + i * 22} y2={84} stroke={P.ambar} strokeWidth={5} /></g>)}
      </g>
      <g opacity={e3}><Txt x={cx} y={cxy + 78} textAnchor="middle" s={96} c={P.ambar} ls={-3}>≈ 11,000 KM</Txt><Rot x={cx} y={cxy + 118} t="ONE WAY · BEFORE IT IS A FINISHED AI CHIP" anc="middle" tam={20} cor={P.ambar} peso={700} /></g>
    </g>
  );
};

// teto: rivais no mercado, vizinhos na mesma fábrica. Passo 1 a fábrica, 2 os pares de rivais, 3 o número.
const Teto: React.FC<Ctx> = ({ g, a, q }) => {
  const x = 170, w = 1060, yt = 330, yb = 870, pares = [['APPLE', 'QUALCOMM'], ['NVIDIA', 'AMD']], e = a(1, 14);
  return (
    <g>
      <g opacity={e}>
        <path d={`M ${x - 40},${yt + 90} L ${x + w / 2},${yt} L ${x + w + 40},${yt + 90}`} fill="none" stroke={P.menta} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
        <rect x={x} y={yt + 90} width={w} height={yb - yt - 90} fill={P.menta} fillOpacity={0.05} stroke={P.menta} strokeWidth={4} />
        <Rot x={x + w / 2} y={yt + 70} t="ONE COMPANY'S FABS" anc="middle" cor={P.menta} peso={700} tam={22} />
      </g>
      {pares.map((pr, i) => { const p = a(2, 12, i * 12), s = pop(g, q(2) + i * 12), y = yt + 150 + i * 190; return (
        <g key={i} opacity={p} transform={`translate(0,${(1 - Math.min(1, s)) * 30})`}>
          {pr.map((nm, k) => <g key={nm}><rect x={x + 50 + k * 520} y={y} width={440} height={140} rx={10} fill={P.painel} stroke={P.osso} strokeWidth={3} /><Txt x={x + 270 + k * 520} y={y + 88} textAnchor="middle" s={nm.length > 6 ? 58 : 68}>{nm}</Txt></g>)}
          <circle cx={x + w / 2} cy={y + 70} r={34} fill={P.fundo} stroke={P.verm} strokeWidth={4} /><Txt x={x + w / 2} y={y + 82} textAnchor="middle" s={30} c={P.verm}>VS</Txt>
        </g>); })}
      <g opacity={a(2, 10, 30)}><Rot x={x + w / 2} y={yb - 26} t="THEIR SECRET DESIGNS · SAME FABS · SAME TIME" anc="middle" tam={20} cor={P.osso} /></g>
      <g opacity={a(3, 10)} transform={`translate(1310,${520 + (1 - Math.min(1, pop(g, q(3)))) * 30})`}>
        <Txt s={210} c={P.ambar} ls={-8} y={60}>78%</Txt><Rot x={6} y={112} t="OF TSMC'S 2025 REVENUE" tam={22} cor={P.ambar} peso={700} /><Rot x={6} y={144} t="CAME FROM 10 CUSTOMERS" tam={22} cor={P.ambar} peso={700} />
      </g>
    </g>
  );
};

export const D02: Record<string, React.FC<any>> = { voo: Voo, teto: Teto };
