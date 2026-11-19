import React from 'react';
import { MONO, P, Rot } from './lib';
import { Ctx, L, Txt, rnd } from './base';

// Hard to Copy #03 (Nvidia / CUDA): diagramas sob medida.

// codigo: o chip gráfico e as duas formas de falar com ele. Passo 0 o chip desenha jogos, 1 milhares de núcleos, 2 o jeito antigo (disfarçar a conta de imagem), 3 CUDA, 4 código comum rodando em todos os núcleos.
const VELHO = ['// the old way: fake a picture', 'tex = pack_numbers_as_texture(data)', 'draw_fullscreen_quad(shader)', 'result = read_pixels_back()'];
const NOVO = ['// with CUDA: ordinary code', '__global__ void add(float *a, float *b) {', '    int i = threadIdx.x;', '    a[i] = a[i] + b[i];', '}', 'add<<<blocks, threads>>>(a, b);'];
const Codigo: React.FC<Ctx> = ({ g, a, q }) => {
  const gx = 130, gy = 340, cols = 19, lin = 9, px = 42, e1 = a(1, 30), e4 = a(4, 40), velho = a(2, 12), cuda = a(3, 10), novo = a(4, 10), rx = 1010, rw = 800;
  const Painel: React.FC<{ x: number; y: number; w: number; h: number; t: string; ls: string[]; ini: number; cor: string; tam: number }> = ({ x, y, w, h, t, ls, ini, cor, tam }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#0C1110" stroke={cor} strokeWidth={3} /><rect x={x} y={y} width={w} height={50} rx={12} fill={cor} opacity={0.14} />
      {[0, 1, 2].map((k) => <circle key={k} cx={x + 28 + k * 26} cy={y + 25} r={8} fill={cor} opacity={0.6} />)}
      <Rot x={x + w - 22} y={y + 33} t={t} anc="end" tam={20} cor={cor} peso={700} />
      {ls.map((l, i) => { const n = Math.floor(L(g, [ini + i * 14, ini + i * 14 + 16], [0, l.length], undefined)); return n <= 0 ? null : <text key={i} x={x + 32} y={y + 108 + i * (tam * 1.6)} fontFamily={MONO} fontWeight={500} fontSize={tam} fill={l.trim().startsWith('//') ? P.cinza : P.osso} xmlSpace="preserve">{l.slice(0, n)}</text>; })}
    </g>
  );
  return (
    <g>
      <Rot x={gx} y={gy - 24} t="ONE GRAPHICS CHIP · THOUSANDS OF TINY CORES" tam={20} cor={P.osso} />
      <rect x={gx - 18} y={gy - 10} width={cols * px + 22} height={lin * px + 6} rx={12} fill={P.painel} stroke={P.fantasma} strokeWidth={3} />
      {Array.from({ length: cols * lin }, (_, i) => { const cx = i % cols, cy = Math.floor(i / cols), on = (cx + cy * 2) / (cols + lin * 2) < e1, mint = (cx + cy * 2) / (cols + lin * 2) < e4;
        return <rect key={i} x={gx + cx * px} y={gy + cy * px} width={28} height={28} rx={4} fill={mint ? P.menta : on ? P.luz : P.fantasma} opacity={mint ? 0.75 + 0.25 * Math.sin(g / 5 + i) : on ? 0.5 + 0.4 * Math.sin(g / 4 + rnd(i) * 20) : 0.5} />; })}
      <g opacity={(1 - a(1, 10)) * a(0, 10)}><Txt x={gx} y={gy + lin * px + 62} s={40} c={P.cinza}>Built to draw video games.</Txt></g>
      <g opacity={a(1, 10) * (1 - e4)}><Txt x={gx} y={gy + lin * px + 62} s={40} c={P.luz}>Thousands of small calculations at once.</Txt></g>
      <g opacity={e4}><Txt x={gx} y={gy + lin * px + 62} s={40} c={P.menta}>Your code, on every core at once.</Txt></g>
      <g opacity={velho * (1 - cuda)}><Painel x={rx} y={330} w={rw} h={330} t="BEFORE 2006 · THE OLD WAY" ls={VELHO} ini={q(2) + 8} cor={P.cinza} tam={30} />
        <Txt x={rx} y={730} s={36} c={P.cinza}>Disguise the math as a picture.</Txt></g>
      <g opacity={cuda} transform={`translate(${(1 - cuda) * 40},0)`}>
        <rect x={rx} y={320} width={330} height={104} rx={10} fill={P.menta} /><Txt x={rx + 165} y={396} textAnchor="middle" s={76} c={P.fundo}>CUDA</Txt>
        <Rot x={rx + 360} y={362} t="ANNOUNCED 2006" tam={22} cor={P.menta} peso={700} /><Rot x={rx + 360} y={398} t="FREE TO DOWNLOAD" tam={22} cor={P.osso} />
      </g>
      <g opacity={novo}><Painel x={rx} y={460} w={rw} h={410} t="WITH CUDA" ls={NOVO} ini={q(4) + 6} cor={P.menta} tam={27} /></g>
    </g>
  );
};

export const D03: Record<string, React.FC<any>> = { codigo: Codigo };
