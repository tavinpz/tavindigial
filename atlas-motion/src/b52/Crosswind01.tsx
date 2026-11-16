import React from 'react';
import { AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame } from 'remotion';
import { C, CenaProps, Fala, L, SANS } from './lib';
import { CenaAbertura, CenaComercial, CenaFrente, CenaTitulo, CenaVetor } from './cenas1';
import { CenaAtitude, CenaC5, CenaCabine, CenaErro, CenaFinal, CenaLayout, CenaLinha, CenaRolagem, CenaTrem } from './cenas2';

// Crosswind #01: "Why the B-52 lands sideways". Cenas sincronizadas pelas marcas da narração (tempos.json).
const CENAS: Record<string, React.FC<CenaProps>> = {
  pista: CenaAbertura, titulo: CenaTitulo, vetor: CenaVetor, comercial: CenaComercial, frente: CenaFrente,
  layout: CenaLayout, atitude: CenaAtitude, erro: CenaErro, cabine: CenaCabine, trem: CenaTrem,
  rolagem: CenaRolagem, c5: CenaC5, linha: CenaLinha, final: CenaFinal,
};
type Bloco = { cena: string; ini: number; fim: number; falas: Fala[] };
export type Tempos = { total: number; blocos: Bloco[] };

const DEST = ['B-52', 'sideways', 'purpose', 'wheels', 'crabbing', 'crab', 'twenty', 'eight', 'seventeen', 'straighten', 'thin', 'bomb', 'bicycle', 'flat', 'secret', 'C-5A', '2050s', 'century', 'SR-71', 'designed', 'simple'];
const Legenda: React.FC<{ f: number; falas: Fala[] }> = ({ f, falas }) => {
  const t = f / 30;
  const m = falas.find((x) => t >= x.t - 0.05 && t < x.t + x.d + 0.25);
  if (!m) return null;
  const ps = m.txt.split(' ');
  // quebra em pedaços de até ~7 palavras, mostrando o pedaço atual
  const pedacos: number[][] = [];
  for (let i = 0; i < ps.length; i += 7) pedacos.push([i, Math.min(ps.length, i + 7)]);
  if (pedacos.length > 1 && pedacos[pedacos.length - 1][1] - pedacos[pedacos.length - 1][0] < 3) { const u = pedacos.pop()!; pedacos[pedacos.length - 1][1] = u[1]; }
  const tot = ps.reduce((s, p) => s + p.length + 1, 0);
  let acc = 0; const iniP = ps.map((p) => { const v = acc; acc += p.length + 1; return m.t + (m.d * v) / tot; });
  const atual = [...pedacos].reverse().find((pc) => t >= iniP[pc[0]] - 0.05) ?? pedacos[0];
  return (
    <div style={{ position: 'absolute', bottom: 58, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 54, letterSpacing: -0.5, textShadow: '0 4px 22px rgba(0,0,0,.95), 0 0 2px #000', padding: '0 160px', boxSizing: 'border-box' }}>
      {ps.slice(atual[0], atual[1]).map((p, j) => {
        const i = atual[0] + j;
        const s = Math.min(1, spring({ frame: f - iniP[i] * 30, fps: 30, config: { damping: 14, stiffness: 220 } }));
        const dest = DEST.some((d) => p.replace(/[.,!?…]/g, '').toLowerCase() === d.toLowerCase());
        return <span key={i} style={{ display: 'inline-block', marginRight: 14, color: dest ? C.laranja : C.texto, opacity: 0.22 + 0.78 * s, transform: `translateY(${(1 - s) * 12}px)` }}>{p}</span>;
      })}
    </div>
  );
};

export const Crosswind01: React.FC<{ tempos: Tempos }> = ({ tempos }) => {
  const f = useCurrentFrame();
  const X = 12; // quadros de transição
  const falas = tempos.blocos.flatMap((b) => b.falas);
  return (
    <AbsoluteFill style={{ background: C.fundo, overflow: 'hidden' }}>
      {tempos.blocos.map((b, i) => {
        const ini = Math.round(b.ini * 30), fim = Math.round(b.fim * 30);
        if (f < ini - X || f > fim + X) return null;
        const Comp = CENAS[b.cena];
        const op = i === 0 ? L(f, [fim - X, fim + X], [1, 0]) : L(f, [ini - X, ini + X], [0, 1]) * (i === tempos.blocos.length - 1 ? 1 : L(f, [fim - X, fim + X], [1, 0]));
        const sc = 1 + 0.06 * (1 - L(f, [ini - X, ini + X], [0, 1])) * (i ? 1 : 0);
        const ts = b.falas.map((x) => Math.round(x.t * 30) - ini);
        return <AbsoluteFill key={i} style={{ opacity: op, transform: `scale(${sc})` }}><Comp g={f - ini} D={fim - ini} ts={ts} /></AbsoluteFill>;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,.6) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,60,90,.10), rgba(255,140,40,.06))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: 'overlay' }}><Img src={staticFile(`fx/grain${f % 4}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
      <Legenda f={f} falas={falas} />
      <AbsoluteFill style={{ background: '#000', opacity: L(f, [0, 10], [1, 0]) }} />
      <Audio src={staticFile('b52/voz_longo.wav')} />
    </AbsoluteFill>
  );
};
