import React from 'react';
import tempos from '../../public/a380/tempos.json';
import { C, Defs, K } from '../sr71/lib';

export * from '../sr71/lib';

// Peças do Crosswind #03 (A380 x 747). Aviões brancos, no padrão do #01.
// quadro (relativo ao início do bloco) em que a fala i começa; com `palavra`, o quadro aproximado em que ela é dita
export const marca = (cena: string, i: number, palavra?: string) => {
  const b = (tempos as any).blocos.find((x: any) => x.cena === cena);
  const f = b.falas[i];
  let t = f.t;
  if (palavra) {
    const k = f.txt.toLowerCase().indexOf(palavra.toLowerCase());
    if (k >= 0) t += (f.d * k) / (f.txt.length + 1);
  }
  return Math.round((t - b.ini) * 30);
};
export const AZ = '#3d8bd6'; // cor do A380 nas comparações
export const LJ = C.laranja; // cor do 747

const TR = '#7d8792';
// Quadrimotor visto de cima. Nariz para +x, comprimento 300. v: '747' | '380'
export const QuadTopo: React.FC<{ id: string; v: '747' | '380'; sombra?: boolean; cor?: string }> = ({ id, v, sombra, cor }) => {
  const g = v === '380' ? { fw: 14, lx: 46, tx: -56, ty: 163, tc: 20, kx: -50, ky: 62, rx: -36, mot: [58, 106], mw: 36, mh: 14, sy: 74 } : { fw: 11.5, lx: 40, tx: -64, ty: 136, tc: 17, kx: -46, ky: 52, rx: -30, mot: [52, 92], mw: 30, mh: 11, sy: 62 };
  const asa = sombra ? '#000' : `url(#${id}-asa)`, fus = sombra ? '#000' : `url(#${id}-fus)`, mot = sombra ? '#000' : `url(#${id}-mot)`, tr = sombra ? 'none' : TR;
  const le = (y: number) => g.lx + ((g.tx - g.lx) * (y - g.fw)) / (g.ty - g.fw);
  const W = (s: number) => `M${g.lx},${s * g.fw} L${g.tx},${s * g.ty} L${g.tx - g.tc},${s * g.ty} L${g.kx},${s * g.ky} L${g.rx},${s * g.fw} Z`;
  return (
    <g>
      {!sombra && <Defs id={id} />}
      <path d={W(1) + ' ' + W(-1)} fill={asa} stroke={tr} strokeWidth={1.2} strokeLinejoin="round" />
      {g.mot.flatMap((y) => [y, -y]).map((y) => <g key={y}><rect x={le(Math.abs(y)) + 4} y={y - g.mh / 2} width={g.mw} height={g.mh} rx={g.mh / 2} fill={mot} stroke={tr} strokeWidth={0.8} />{!sombra && <circle cx={le(Math.abs(y)) + 4 + g.mw} cy={y} r={g.mh * 0.3} fill="#2b3440" />}</g>)}
      <path d={`M-108,-${g.fw} L-140,-${g.sy} L-154,-${g.sy} L-132,-${g.fw} Z M-108,${g.fw} L-140,${g.sy} L-154,${g.sy} L-132,${g.fw} Z`} fill={asa} stroke={tr} strokeWidth={1.2} strokeLinejoin="round" />
      <path d={`M150,0 C150,-${g.fw * 0.7} 138,-${g.fw} 114,-${g.fw} L-130,-${g.fw * 0.8} L-158,-3 L-158,3 L-130,${g.fw * 0.8} L114,${g.fw} C138,${g.fw} 150,${g.fw * 0.7} 150,0 Z`} fill={fus} stroke={tr} strokeWidth={1.2} />
      {!sombra && <>
        <path d="M-158,0 L-100,0" stroke="#8d97a2" strokeWidth={2.5} />
        <path d={`M144,-${g.fw * 0.42} L132,-${g.fw * 0.62} L132,${g.fw * 0.62} L144,${g.fw * 0.42} Z`} fill="#26313d" />
        {cor && <path d={`M110,0 L-120,0`} stroke={cor} strokeWidth={3} opacity={0.9} />}
        {v === '747' && <path d={`M128,-7 C100,-8.5 78,-8 60,-4 L60,4 C78,8 100,8.5 128,7 Z`} fill="#fff" stroke={cor ?? TR} strokeWidth={1} opacity={0.9} />}
      </>}
    </g>
  );
};

const janelas = (x0: number, x1: number, y: number, passo = 6) => Array.from({ length: Math.floor((x0 - x1) / passo) }, (_, i) => <rect key={`${y}${i}`} x={x0 - i * passo} y={y} width={2.6} height={3.2} rx={1} fill="#22303d" />);
const Roda: React.FC<{ x: number; y: number; r: number; topo: number }> = ({ x, y, r, topo }) => <g><line x1={x} y1={topo} x2={x} y2={y} stroke="#8b95a1" strokeWidth={2.4} /><circle cx={x} cy={y} r={r} fill="#14191f" stroke="#8b95a1" strokeWidth={1.2} /><circle cx={x} cy={y} r={r * 0.4} fill="#c9d0d7" /></g>;
const Pod: React.FC<{ id: string; x: number; y: number; w: number; h: number }> = ({ id, x, y, w, h }) => <g><path d={`M${x - 4},${y - h} L${x + 6},${y - h} L${x + 2},${y - h / 2} L${x - 8},${y - h / 2} Z`} fill="#9aa4af" /><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={`url(#${id}-mot)`} stroke={TR} strokeWidth={0.9} /><rect x={x + w / 2 - 5} y={y - h / 2 + 1} width={4} height={h - 2} rx={2} fill="#2b3440" /></g>;

// Boeing 747 de lado. Nariz para +x, comprimento 300, solo em y = +39. nariz: 0..1 (porta de carga aberta)
export const B747Lado: React.FC<{ id: string; nariz?: number; trem?: number; corcunda?: number; faixa?: string; carga?: boolean }> = ({ id, nariz = 0, trem = 1, corcunda = 0, faixa = LJ, carga }) => (
  <g>
    <Defs id={id} />
    {trem > 0 && <g opacity={trem}><Roda x={104} y={34} r={5} topo={14} /><Roda x={-4} y={33} r={6} topo={14} /><Roda x={-24} y={33} r={6} topo={14} /></g>}
    <path d="M-100,-17 L-138,-68 L-153,-68 L-140,-12 Z" fill={`url(#${id}-fus)`} stroke={TR} strokeWidth={1.1} strokeLinejoin="round" />
    {faixa && <path d="M-118,-40 L-138,-68 L-153,-68 L-147,-40 Z" fill={faixa} opacity={0.9} />}
    <path d="M112,-15 L134,-15 L128,-22 C124,-26 122,-27 118,-27 L70,-27 C60,-27 54,-17 46,-17 L-95,-17 L-150,-9 L-150,-4 L-100,12 L-60,17 L112,17 Z" fill={`url(#${id}-fus)`} stroke={TR} strokeWidth={1.1} strokeLinejoin="round" />
    {(nariz > 0 || carga) && <path d="M112,-14 L112,16 L60,16 L60,-14 Z" fill="#0d1218" opacity={Math.min(1, nariz * 3)} />}
    {faixa && <path d="M112,3 L-96,3 L-140,-3" fill="none" stroke={faixa} strokeWidth={2.2} opacity={0.9} />}
    {janelas(108, -92, -4)}{janelas(112, 72, -21, 5.5)}
    <path d="M131,-17.5 L125,-23 L119,-23 L119,-17.5 Z" fill="#1e2833" />
    {corcunda > 0 && <path d="M134,-15 L128,-22 C124,-26 122,-27 118,-27 L70,-27 C60,-27 54,-17 46,-17" fill="none" stroke={C.laranja} strokeWidth={3.2} opacity={corcunda} strokeLinecap="round" />}
    <path d="M-118,-9 L-152,-13 L-152,-9 L-126,-4 Z" fill={`url(#${id}-asa)`} stroke={TR} strokeWidth={0.9} />
    <path d="M34,7 L-72,15 L-88,15 L-30,12 Z" fill={`url(#${id}-asa)`} stroke={TR} strokeWidth={0.9} strokeLinejoin="round" />
    <Pod id={id} x={12} y={24} w={30} h={12} /><Pod id={id} x={-36} y={26} w={30} h={12} />
    {/* nariz: porta de carga que levanta */}
    <g transform={`rotate(${-68 * nariz} 112 -15)`}>
      <path d="M112,-15 L134,-15 C144,-10 150,-2 150,4 C148,9 142,12 138,13 L112,17 Z" fill={`url(#${id}-fus)`} stroke={TR} strokeWidth={1.1} strokeLinejoin="round" />
      {faixa && <path d="M146,3 L112,3" stroke={faixa} strokeWidth={2.2} opacity={0.9} />}
    </g>
  </g>
);

// Airbus A380 de lado. Nariz para +x, comprimento 300, solo em y = +43
export const A380Lado: React.FC<{ id: string; trem?: number; faixa?: string; fantasma?: boolean }> = ({ id, trem = 1, faixa = AZ, fantasma }) => fantasma ? (
  <g fill="none" stroke={AZ} strokeWidth={1.2} strokeDasharray="5 4">
    <path d="M150,6 C147,-2 142,-8 134,-12 C126,-17 116,-21 100,-21 L-90,-21 L-150,-10 L-150,-5 L-95,15 L-50,19 L110,19 C128,18 142,14 150,6 Z" /><path d="M-92,-21 L-132,-86 L-150,-86 L-140,-14" />
  </g>
) : (
  <g>
    <Defs id={id} />
    {trem > 0 && <g opacity={trem}><Roda x={108} y={38} r={5} topo={16} /><Roda x={-4} y={37} r={6} topo={16} /><Roda x={-21} y={37} r={6} topo={16} /><Roda x={-38} y={37} r={6} topo={16} /></g>}
    <path d="M-92,-21 L-132,-86 L-150,-86 L-140,-14 Z" fill={`url(#${id}-fus)`} stroke={TR} strokeWidth={1.1} strokeLinejoin="round" />
    {faixa && <path d="M-112,-52 L-132,-86 L-150,-86 L-145,-52 Z" fill={faixa} opacity={0.9} />}
    <path d="M150,6 C147,-2 142,-8 134,-12 C126,-17 116,-21 100,-21 L-90,-21 L-150,-10 L-150,-5 L-95,15 L-50,19 L110,19 C128,18 142,14 150,6 Z" fill={`url(#${id}-fus)`} stroke={TR} strokeWidth={1.1} strokeLinejoin="round" />
    {faixa && <path d="M146,10 L-96,10 L-146,-6" fill="none" stroke={faixa} strokeWidth={2.2} opacity={0.9} />}
    {janelas(116, -94, -12)}{janelas(124, -100, 2)}
    <path d="M140,-4 L133,-9.5 L126,-9.5 L126,-4 Z" fill="#1e2833" />
    <path d="M-116,-10 L-152,-15 L-152,-11 L-124,-5 Z" fill={`url(#${id}-asa)`} stroke={TR} strokeWidth={0.9} />
    <path d="M44,9 L-78,18 L-96,18 L-36,14 Z" fill={`url(#${id}-asa)`} stroke={TR} strokeWidth={0.9} strokeLinejoin="round" />
    <Pod id={id} x={20} y={28} w={36} h={15} /><Pod id={id} x={-34} y={30} w={36} h={15} />
  </g>
);

// silhueta simples para contagens (vista de cima, ~60 px de comprimento)
export const Mini: React.FC<{ x: number; y: number; cor: string; op?: number; s?: number }> = ({ x, y, cor, op = 1, s = 1 }) => <path opacity={op} transform={`translate(${x},${y}) scale(${s})`} d="M30,0 L22,-3 L4,-3 L-8,-26 L-13,-26 L-7,-3 L-22,-2 L-27,-11 L-30,-11 L-28,0 L-30,11 L-27,11 L-22,2 L-7,3 L-13,26 L-8,26 L4,3 L22,3 Z" fill={cor} />;

// palete de carga
export const Palete: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 14, h = 11 }) => <g><rect x={x - w / 2} y={y - h} width={w} height={h} rx={1} fill="#c9a24a" stroke="#6b5420" strokeWidth={0.8} /><line x1={x - w / 2} y1={y - h / 2} x2={x + w / 2} y2={y - h / 2} stroke="#6b5420" strokeWidth={0.6} /></g>;

