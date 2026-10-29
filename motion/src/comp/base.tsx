import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, F, W, H } from '../lib/theme';
import { prog, spr, wob, EO, rnd, clamp, fmt } from '../lib/anim';

/** Fundo atmosférico: gradiente profundo, manchas de luz que andam e grade de prancheta */
export const Fundo: React.FC<{ f: number; tom?: string; grade?: boolean }> = ({ f, tom = C.water, grade = true }) => {
  const t = f / 30;
  const x1 = 30 + wob(t * 0.4, 1) * 18, y1 = 30 + wob(t * 0.4, 2) * 12;
  const x2 = 70 + wob(t * 0.35, 3) * 18, y2 = 72 + wob(t * 0.3, 4) * 10;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at ${x1}% ${y1}%, ${tom}22 0%, transparent 70%), radial-gradient(ellipse 60% 40% at ${x2}% ${y2}%, ${C.amber}14 0%, transparent 70%), linear-gradient(180deg, #0b1828 0%, ${C.navy} 45%, ${C.deep} 100%)` }}>
      {grade && (
        <AbsoluteFill style={{ opacity: 0.07, backgroundImage: `linear-gradient(${C.muted} 1px, transparent 1px), linear-gradient(90deg, ${C.muted} 1px, transparent 1px)`, backgroundSize: '72px 72px', backgroundPosition: `${(f * 0.4) % 72}px ${(f * 0.9) % 72}px` }} />
      )}
    </AbsoluteFill>
  );
};

/** Grão de filme + vinheta (por cima de tudo) */
export const Grao: React.FC<{ f: number }> = ({ f }) => (
  <>
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile(`fx/grain${f % 4}.png`)})`, backgroundPosition: `${(rnd(f) * 512) | 0}px ${(rnd(f + 9) * 512) | 0}px`, opacity: 0.075, mixBlendMode: 'overlay' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 48%, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
  </>
);

/** Título da cena: entra por máscara, com barra âmbar que cresce */
export const Titulo: React.FC<{ f: number; titulo?: string; sub?: string; atraso?: number; y?: number }> = ({ f, titulo, sub, atraso = 0, y = 250 }) => {
  if (!titulo) return null;
  const g = f - atraso;
  if (g < -1) return null;
  const a = prog(g, 0, 14, EO);
  const b = prog(g, 6, 20, EO);
  const bar = prog(g, 2, 22, EO);
  return (
    <div style={{ position: 'absolute', top: y, left: 0, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ overflow: 'hidden', padding: '0 30px' }}>
        <div style={{ transform: `translateY(${(1 - a) * 110}%)`, fontFamily: F.cond, fontWeight: 800, fontSize: 84, lineHeight: 1.0, letterSpacing: 1, color: C.white, textTransform: 'uppercase', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{titulo}</div>
      </div>
      <div style={{ height: 6, width: 150 * bar, background: C.amber, borderRadius: 3, marginTop: 14, boxShadow: `0 0 18px ${C.amber}` }} />
      {sub && (
        <div style={{ marginTop: 14, opacity: b, transform: `translateY(${(1 - b) * 16}px)`, fontFamily: F.sans, fontWeight: 600, fontSize: 36, color: C.muted, textShadow: '0 3px 14px rgba(0,0,0,0.9)', textAlign: 'center', padding: '0 60px' }}>{sub}</div>
      )}
    </div>
  );
};

/** Contador estilo odômetro: cada dígito rola em coluna */
export const Odometro: React.FC<{ f: number; valor: number; dec?: number; prefixo?: string; sufixo?: string; ini: number; fim: number; tam: number; cor: string; glow?: boolean }> = ({ f, valor, dec = 0, prefixo = '', sufixo = '', ini, fim, tam, cor, glow = true }) => {
  const final = fmt(valor, dec);
  const p = prog(f, ini, fim, EO);
  const digitos = final.split('').filter((ch) => /\d/.test(ch)).length;
  let di = 0;
  const lh = tam * 1.0;
  const sombra = glow ? `0 0 ${tam * 0.25}px ${cor}88, 0 0 ${tam * 0.06}px ${cor}` : 'none';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', fontFamily: F.cond, fontWeight: 900, fontSize: tam, lineHeight: `${lh}px`, color: cor, textShadow: sombra, fontVariantNumeric: 'tabular-nums' }}>
      {prefixo && <span style={{ fontSize: tam * (prefixo.length > 2 ? 0.55 : 0.8), marginRight: tam * 0.04, lineHeight: `${lh}px` }}>{prefixo}</span>}
      {final.split('').map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} style={{ width: ch === ',' ? tam * 0.2 : tam * 0.24, textAlign: 'center' }}>{ch}</span>;
        const d = parseInt(ch, 10);
        const voltas = digitos - di - 1; // menos significativo gira mais
        di++;
        const alvo = d + 10 * Math.min(3, voltas + 1);
        const pos = alvo * p;
        const vel = Math.abs(alvo * (prog(f + 1, ini, fim, EO) - p));
        return (
          <span key={i} style={{ display: 'inline-block', height: lh, overflow: 'hidden', width: tam * 0.5, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: -(pos % 10) * lh, filter: vel > 0.15 ? `blur(${Math.min(6, vel * 5)}px)` : undefined }}>
              {Array.from({ length: 11 }).map((_, k) => (
                <span key={k} style={{ display: 'block', height: lh, textAlign: 'center' }}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
      {sufixo && <span style={{ fontSize: tam * (sufixo.trim().length > 2 ? 0.42 : 0.62), marginLeft: tam * 0.05, lineHeight: `${lh * 0.98}px` }}>{sufixo}</span>}
    </div>
  );
};

/** Partículas de poeira subindo (dá vida ao fundo) */
export const Poeira: React.FC<{ f: number; n?: number; cor?: string }> = ({ f, n = 40, cor = C.amber }) => (
  <AbsoluteFill>
    {Array.from({ length: n }).map((_, i) => {
      const x = rnd(i) * W;
      const vel = 0.6 + rnd(i + 50) * 1.6;
      const y = H - ((f * vel + rnd(i + 99) * H) % (H + 100));
      const s = 2 + rnd(i + 7) * 4;
      const a = 0.15 + rnd(i + 3) * 0.45;
      return <div key={i} style={{ position: 'absolute', left: x + wob(f / 30 + i, i) * 20, top: y, width: s, height: s, borderRadius: s, background: cor, opacity: a, boxShadow: `0 0 ${s * 3}px ${cor}` }} />;
    })}
  </AbsoluteFill>
);

/** Raios de luz girando atrás de números */
export const Raios: React.FC<{ f: number; cor: string; y?: number; forca?: number }> = ({ f, cor, y = 42, forca = 1 }) => (
  <AbsoluteFill style={{ opacity: 0.22 * forca, background: `repeating-conic-gradient(from ${f * 0.35}deg at 50% ${y}%, ${cor}55 0deg 4deg, transparent 4deg 18deg)`, maskImage: `radial-gradient(circle at 50% ${y}%, black 0%, transparent 62%)`, WebkitMaskImage: `radial-gradient(circle at 50% ${y}%, black 0%, transparent 62%)` }} />
);

/** Onda de choque (anel que expande) */
export const Choque: React.FC<{ f: number; ini: number; x: number; y: number; cor: string; tam?: number }> = ({ f, ini, x, y, cor, tam = 700 }) => {
  const p = prog(f, ini, ini + 22, EO);
  if (f < ini || p >= 1) return null;
  const r = tam * p;
  return <div style={{ position: 'absolute', left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: '50%', border: `${8 * (1 - p) + 1}px solid ${cor}`, opacity: 1 - p, boxShadow: `0 0 40px ${cor}` }} />;
};

export const Logo: React.FC<{ tam: number; style?: React.CSSProperties }> = ({ tam, style }) => <Img src={staticFile('logo.png')} style={{ width: tam, height: tam, ...style }} />;

export { clamp, spr };
