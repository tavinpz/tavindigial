import React from 'react';
import { Cota, P, Rot, SANS } from './lib';
import { Ctx, L, Txt, pop, rnd } from './base';

// Hard to Copy #05 (filme ABF da Ajinomoto): diagramas sob medida. Menta = o filme (a peça original), âmbar = o cobre.

// pote: o tempero e o chip. Passo 1 o pote, 2 o chip, 3 a ligação entre os dois.
const Pote: React.FC<Ctx> = ({ g, a, q }) => {
  const jx = 480, cx = 1400, y = 540, e2 = a(2, 12), e3 = a(3, 16), s2 = pop(g, q(2));
  return (
    <g>
      <g transform={`translate(${jx},${y}) rotate(${Math.sin(g / 30) * 2})`}>
        <rect x={-120} y={-150} width={240} height={330} rx={40} fill={P.osso} fillOpacity={0.06} stroke={P.osso} strokeWidth={5} />
        <path d="M -104,-150 Q -104,-250 0,-256 Q 104,-250 104,-150 Z" fill="#3A1614" stroke={P.verm} strokeWidth={5} />
        {[[-40, -214], [0, -226], [40, -214], [-20, -190], [20, -190]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={7} fill={P.verm} />)}
        <rect x={-92} y={-60} width={184} height={130} rx={8} fill={P.painel} stroke={P.osso} strokeWidth={3} /><Txt x={0} y={24} textAnchor="middle" s={70}>MSG</Txt>
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-100 + rnd(i) * 200} cy={96 + rnd(i + 50) * 70} r={3.5} fill={P.osso} opacity={0.5} />)}
        {Array.from({ length: 6 }, (_, i) => { const t = ((g * 2 + i * 23) % 90) / 90; return <circle key={i} cx={-30 + rnd(i + 9) * 60 + Math.sin(t * 5 + i) * 8} cy={-270 - t * 90} r={3.5} fill={P.osso} opacity={0.7 * (1 - t)} />; })}
      </g>
      <Rot x={jx} y={y + 240} t="SEASONING" anc="middle" tam={24} cor={P.osso} peso={700} />
      <g opacity={e2} transform={`translate(${cx},${y}) scale(${0.7 + 0.3 * Math.min(1, s2 || 0.001)})`}>
        {Array.from({ length: 9 }, (_, i) => <g key={i} stroke={P.ambar} strokeWidth={6}><line x1={-160 + i * 40} y1={-190} x2={-160 + i * 40} y2={-216} /><line x1={-160 + i * 40} y1={190} x2={-160 + i * 40} y2={216} /><line x1={-190} y1={-160 + i * 40} x2={-216} y2={-160 + i * 40} /><line x1={190} y1={-160 + i * 40} x2={216} y2={-160 + i * 40} /></g>)}
        <rect x={-190} y={-190} width={380} height={380} rx={18} fill={P.painel} stroke={P.osso} strokeWidth={5} /><rect x={-110} y={-110} width={220} height={220} rx={8} fill="#10231B" stroke={P.menta} strokeWidth={4} />
        <Txt x={0} y={22} textAnchor="middle" s={64} c={P.menta}>AI</Txt>
        <rect x={-260 + ((g * 9) % 520)} y={-190} width={50} height={380} fill={P.osso} opacity={0.05} />
      </g>
      <g opacity={e2}><Rot x={cx} y={y + 270} t="AN AI CHIP" anc="middle" tam={24} cor={P.osso} peso={700} /></g>
      <g opacity={e3}>
        <path d={`M ${jx + 150},${y} L ${jx + 150 + (cx - 240 - jx - 150) * e3},${y}`} stroke={P.menta} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-g * 2} markerEnd="url(#setaM)" fill="none" />
        <Txt x={(jx + cx) / 2 - 40} y={y - 40} textAnchor="middle" s={46} c={P.menta}>SAME COMPANY</Txt>
        <text x={(jx + cx) / 2 - 40} y={y + 60} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill={P.osso}>makes a film inside the chip package</text>
      </g>
    </g>
  );
};

// sub: o substrato embaixo do chip. Passo 1 chip e placa não se encaixam, 2 o substrato no meio, 3 zoom nas camadas (cobre e filme), 4 furos a laser, 5 destaque do filme.
const Sub: React.FC<Ctx> = ({ g, a }) => {
  const lx = 430, e1 = a(1, 12), e2 = a(2, 14), zoom = a(3, 20), nc = 7, feitas = a(3, 70, 12) * nc, furos = a(4, 14), dest = a(5, 12), zx = 1010, zy = 330, zw = 760, zh = 500, hc = zh / nc;
  return (
    <g>
      <g opacity={a(0, 10)}>
        <rect x={lx - 90} y={380} width={180} height={64} rx={6} fill="#10231B" stroke={P.osso} strokeWidth={4} /><Rot x={lx + 120} y={420} t="THE CHIP" tam={22} cor={P.osso} peso={700} />
        <rect x={lx - 300} y={720} width={600} height={50} rx={6} fill={P.painel} stroke={P.cinza} strokeWidth={4} /><Rot x={lx + 320} y={754} t="THE BOARD" tam={22} cor={P.cinza} peso={700} />
      </g>
      <g opacity={e1 * (1 - e2)}>
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={lx - 78 + i * 13} y1={446} x2={lx - 78 + i * 13} y2={470} stroke={P.ambar} strokeWidth={3} />)}
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={lx - 240 + i * 120} y1={696} x2={lx - 240 + i * 120} y2={720} stroke={P.ambar} strokeWidth={9} />)}
        <Rot x={lx} y={590} t="TOO SMALL  ↔  TOO BIG" anc="middle" tam={24} cor={P.verm} peso={700} />
      </g>
      <g opacity={e2}>
        <path d={`M ${lx - 200},${470} h 400 v 226 h -400 Z`} fill={P.menta} fillOpacity={0.08} stroke={P.menta} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${lx - 72 + i * 18},446 L ${lx - 72 + i * 18},500 L ${lx - 184 + i * 46},660 L ${lx - 184 + i * 46},720`} fill="none" stroke={P.ambar} strokeWidth={3} strokeDasharray={320} strokeDashoffset={320 * (1 - a(2, 30, i * 2))} />)}
        <Rot x={lx + 220} y={590} t="THE SUBSTRATE" tam={22} cor={P.menta} peso={700} />
      </g>
      <g opacity={zoom}>
        <rect x={lx + 120} y={560} width={60} height={60} fill="none" stroke={P.osso} strokeWidth={3} /><line x1={lx + 180} y1={560} x2={zx} y2={zy} stroke={P.osso} strokeWidth={2} strokeDasharray="3 8" /><line x1={lx + 180} y1={620} x2={zx} y2={zy + zh} stroke={P.osso} strokeWidth={2} strokeDasharray="3 8" />
        <clipPath id="zs"><rect x={zx} y={zy} width={zw} height={zh} rx={10} /></clipPath>
        <rect x={zx} y={zy} width={zw} height={zh} rx={10} fill={P.painel} />
        <g clipPath="url(#zs)">
          {Array.from({ length: nc }, (_, i) => { const k = nc - 1 - i; if (k >= feitas) return null; const y = zy + i * hc, p = Math.min(1, feitas - k); return (
            <g key={i} opacity={p}>
              <rect x={zx} y={y + 14} width={zw} height={hc - 14} fill={P.menta} opacity={0.2 + 0.25 * dest + (dest > 0 ? 0.06 * Math.sin(g / 6 + i) : 0)} />
              {Array.from({ length: 9 }, (_, j) => <rect key={j} x={zx + 20 + j * 84 + (i % 2) * 30} y={y} width={50 + rnd(i * 9 + j) * 24} height={14} fill={P.ambar} opacity={0.95 - 0.5 * dest} />)}
              {furos > 0 && [1, 4, 7].map((j) => <rect key={j} x={zx + 36 + j * 84 + (i % 2) * 30} y={y + 14} width={18} height={(hc - 14) * furos} fill={P.ambar} opacity={0.95 - 0.5 * dest} />)}
            </g>); })}
        </g>
        <rect x={zx} y={zy} width={zw} height={zh} rx={10} fill="none" stroke={P.osso} strokeWidth={4} />
        <g transform={`translate(${zx},${zy + zh + 44})`}>
          <rect width={34} height={14} y={-12} fill={P.ambar} /><Rot x={48} y={2} t="COPPER WIRING" tam={20} cor={P.osso} peso={700} /><rect x={300} width={34} height={22} y={-18} fill={P.menta} opacity={0.5} /><Rot x={348} y={2} t="INSULATION: THE FILM" tam={20} cor={P.menta} peso={700} />
        </g>
        <g opacity={furos}><Rot x={zx + zw} y={zy - 16} t="HOLES DRILLED BY LASER CONNECT THE FLOORS" anc="end" tam={18} cor={P.ambar} peso={700} /></g>
      </g>
      {void Cota}{void L}
    </g>
  );
};

// tinta: a tinta líquida de antes contra o filme. Passo 1 a tinta é espalhada, 2 os defeitos, 3 o filme.
const Tinta: React.FC<Ctx> = ({ g, a }) => {
  const xa = 190, xb = 1730, y1 = 500, y2 = 800, p1 = a(1, 40), def = a(2, 12), p3 = a(3, 30);
  let d = `M ${xa},${y1}`; const ate = xa + (xb - xa) * p1; for (let x = xa; x <= ate; x += 10) d += ` L ${x},${y1 - 64 - Math.sin(x / 60) * 20 - Math.sin(x / 23 + 1) * 10}`; d += ` L ${ate},${y1} Z`;
  return (
    <g>
      <rect x={xa} y={y1} width={xb - xa} height={44} fill={P.painel} stroke={P.cinza} strokeWidth={3} /><path d={d} fill="url(#hachC)" stroke={P.cinza} strokeWidth={4} strokeDasharray="12 8" />
      <Rot x={xa} y={y1 - 124} t="BEFORE · LIQUID INK, SPREAD ON AND DRIED" tam={24} cor={P.cinza} peso={700} />
      <g opacity={def}>
        {[430, 820, 1260, 1540].map((x, i) => <g key={i}><circle cx={x} cy={y1 - 34} r={12 + (i % 2) * 5} fill={P.fundo} stroke={P.verm} strokeWidth={3} /></g>)}
        {[['SLOW TO DRY', 430], ['PICKS UP DUST', 880], ['NOT PERFECTLY FLAT', 1400]].map(([t, x], i) => <Rot key={i} x={x as number} y={y1 + 90} t={t as string} anc="middle" tam={24} cor={P.verm} peso={700} />)}
      </g>
      <g opacity={Math.min(1, p3 * 4)}>
        <rect x={xa} y={y2} width={xb - xa} height={44} fill={P.painel} stroke={P.cinza} strokeWidth={3} /><rect x={xa} y={y2 - 60} width={(xb - xa) * p3} height={60} fill={P.menta} opacity={0.55} /><line x1={xa} y1={y2 - 60} x2={xa + (xb - xa) * p3} y2={y2 - 60} stroke={P.menta} strokeWidth={5} />
        <g transform={`translate(${xa + (xb - xa) * p3},${y2 - 60})`} opacity={p3 < 1 ? 1 : 0}><circle r={34} cy={-34} fill={P.painel} stroke={P.osso} strokeWidth={4} /><circle r={8} cy={-34} fill={P.osso} /></g>
        <Rot x={xa} y={y2 - 90} t="AFTER · A SOLID FILM, PRESSED ON" tam={24} cor={P.menta} peso={700} /><g opacity={L(p3, [0.8, 1], [0, 1])}><Rot x={xb} y={y2 + 86} t="FLAT · CLEAN · THE SAME EVERY TIME" anc="end" tam={24} cor={P.menta} peso={700} /></g>
      </g>
      {void g}
    </g>
  );
};

export const D05: Record<string, React.FC<any>> = { pote: Pote, sub: Sub, tinta: Tinta };
