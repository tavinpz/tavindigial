// Composição genérica dos vídeos de funcionalidade v2. O roteiro (src/v2/roteiros/<id>.json) define as cenas;
// os tempos absolutos saem da soma das durações. A narração (narra.ts) e os efeitos são gerados pelo gera_v2.py.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Fundo, Titulo, Fecho, Narrada, Marca, Selo, lerp, mola, usaTema } from '../kit';
import { Aparelho, Tela, TopoPasso } from './kit2';
import { Visual, Compara, Beneficios, Lado } from './cenas';
import { ROTEIROS } from './roteiros';

export type Cena =
  | { tipo: 'problema'; dur: number; titulo: string; visual: string; txt?: string[]; num?: number; fala: string }
  | { tipo: 'solucao'; dur: number; titulo: string; selo: string; icone?: string; fala: string; telas?: Tela[]; pc?: boolean }
  | { tipo: 'passo'; dur: number; n: string; titulo: string; fala: string; falas?: [number, number, string][]; telas: Tela[]; pc?: boolean }
  | { tipo: 'compara'; dur: number; titulo: string; fala: string; a: Lado; b: Lado }
  | { tipo: 'beneficios'; dur: number; titulo: string; fala: string; itens: [string, string, string?][] }
  | { tipo: 'fecho'; dur: number; frase: string; fala: string };
export type Roteiro = { id: string; tema?: 'claro' | 'escuro'; total?: number; cenas: Cena[] };

export const inicios = (r: Roteiro) => { let t = 0; return r.cenas.map((c) => { const a = t; t += c.dur; return a; }); };
export const duracao = (r: Roteiro) => r.cenas.reduce((t, c) => t + c.dur, 0);

export const Func2: React.FC = () => {
  const { id } = useVideoConfig();
  const r = ROTEIROS[id];
  usaTema(r.tema || 'claro');
  const f = useCurrentFrame();
  const ini = inicios(r);
  const passos = r.cenas.filter((c) => c.tipo === 'passo').length;
  // aparelho: do primeiro 'solucao'/'passo' até o fim do último 'passo' contíguo
  const comTela = r.cenas.map((c, i) => (c.tipo === 'solucao' || c.tipo === 'passo') ? i : -1).filter((i) => i >= 0);
  const blocos: { a: number; b: number; telas: Tela[]; pc: boolean }[] = [];
  comTela.forEach((i) => {
    const c = r.cenas[i] as any;
    const telas: Tela[] = (c.telas || []).map((t: Tela) => ({ ...t, pc: !!c.pc, ini: t.ini + ini[i], fim: t.fim + ini[i], cam: t.cam.map((k) => [k[0] + ini[i], k[1], k[2], k[3]]),
      cursor: t.cursor?.map((k) => [k[0] + ini[i], k[1], k[2]]), cliques: t.cliques?.map((k) => k + ini[i]),
      realce: t.realce && { ...t.realce, ini: t.realce.ini + ini[i], fim: t.realce.fim + ini[i] }, lupa: t.lupa && { ...t.lupa, ini: t.lupa.ini + ini[i], fim: t.lupa.fim + ini[i] } }));
    const ult = blocos[blocos.length - 1];
    if (ult && ult.b === ini[i] && ult.pc === !!c.pc) { ult.b = ini[i] + c.dur; ult.telas.push(...telas); } else blocos.push({ a: ini[i], b: ini[i] + c.dur, telas, pc: !!c.pc });
  });
  const fechoIni = ini[r.cenas.findIndex((c) => c.tipo === 'fecho')] ?? duracao(r);
  const comAparelho = blocos.some((b) => f >= b.a && f < b.b);
  let np = 0;
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {r.cenas.map((c, i) => {
        const a = ini[i], b = a + c.dur;
        if (c.tipo === 'passo') np++;
        if (f < a - 2 || f > b + 20) return null;
        if (c.tipo === 'problema') return <React.Fragment key={i}>
          <div style={{ position: 'absolute', top: 130, left: 60, right: 60 }}><Titulo t={c.titulo} ini={a + 2} fim={b} tam={74} alinhar="left" linha={1.08} /></div>
          <Visual v={c.visual} ini={a} fim={b} txt={c.txt} num={c.num} />
        </React.Fragment>;
        if (c.tipo === 'solucao') return <React.Fragment key={i}>
          {f < b && <div style={{ position: 'absolute', top: 120, left: 60, right: 60 }}>
            <div style={{ opacity: Math.min(1, mola(f, a) * 2), display: 'flex', alignItems: 'center', gap: 22 }}><Marca tam={44} /><Selo t={c.selo} icone={c.icone} tam={28} /></div>
            <div style={{ marginTop: 22 }}><Titulo t={c.titulo} ini={a + 6} fim={b} tam={60} alinhar="left" linha={1.08} /></div>
          </div>}
        </React.Fragment>;
        if (c.tipo === 'passo') return <TopoPasso key={i} n={c.n} t={c.titulo} ini={a} fim={b} total={passos} />;
        if (c.tipo === 'compara') return <React.Fragment key={i}>
          <div style={{ position: 'absolute', top: 130, left: 60, right: 60 }}><Titulo t={c.titulo} ini={a + 2} fim={b} tam={66} alinhar="left" linha={1.08} /></div>
          <Compara a={c.a} b={c.b} ini={a} fim={b} />
        </React.Fragment>;
        if (c.tipo === 'beneficios') return <React.Fragment key={i}>
          <div style={{ position: 'absolute', top: 130, left: 60, right: 60 }}><Titulo t={c.titulo} ini={a + 2} fim={b} tam={70} alinhar="left" linha={1.08} /></div>
          <Beneficios itens={c.itens} ini={a} fim={b} />
        </React.Fragment>;
        if (c.tipo === 'fecho') return <div key={i} style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, a, a + 12, 0, 1) }}><Fecho ini={a + 6} frase={c.frase} /></div>;
        return null;
      })}
      {blocos.map((b, i) => <Aparelho key={i} telas={b.telas} ini={b.a} fim={b.b} pc={b.pc} />)}
      {comAparelho && <div style={{ position: 'absolute', top: 1598, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 20, color: C.fg3 }}>tela real da Thata · dados fictícios</div>}
      <Narrada id={id} y={1650} tam={44} ate={fechoIni} />
    </AbsoluteFill>
  );
};
