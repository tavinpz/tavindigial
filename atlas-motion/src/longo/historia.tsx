import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { K, FT, LW, LH, marco, fmtL, LOC } from './tema';
import type { LProps } from './tema';
import { prog, spr, wob, EO, EIO, lerp, clamp, fmt } from '../lib/anim';

/** painel de sobrevivência no canto */
const Hud: React.FC<{ f: number; hud: Record<string, number>; relogio?: string }> = ({ f, hud, relogio }) => {
  const ent = prog(f, 4, 22, EO);
  return (
    <div style={{ position: 'absolute', left: 60, top: 60, width: 500, padding: '22px 26px', borderRadius: 16, background: 'rgba(12,10,8,0.78)', border: '1px solid rgba(233,196,106,0.35)', opacity: ent, transform: `translateX(${(1 - ent) * -30}px)` }}>
      {relogio && <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: K.sinal, marginBottom: 14 }}>{relogio}</div>}
      {Object.entries(hud).map(([k, v], i) => {
        const p = prog(f, 10 + i * 6, 40 + i * 6, EO);
        const cor = v > 55 ? '#7bc47f' : v > 25 ? '#e9c46a' : '#e5484d';
        const pisca = v <= 25 ? 0.6 + 0.4 * Math.abs(Math.sin(f / 6)) : 1;
        return (
          <div key={k} style={{ marginTop: i ? 12 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FT.sans, fontWeight: 600, fontSize: 22, color: '#efe6d6' }}><span>{k}</span><span style={{ fontFamily: FT.mono }}>{Math.round(v * p)}</span></div>
            <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)', marginTop: 6 }}><div style={{ height: '100%', width: `${v * p}%`, borderRadius: 5, background: cor, opacity: pisca }} /></div>
          </div>
        );
      })}
    </div>
  );
};

/** foto de época com movimento de câmera, tom antigo, legenda e crédito */
export const Foto: React.FC<LProps> = ({ c, f, dur, id }) => {
  const p = clamp(f / Math.max(1, dur));
  let esc = 1.06, tx = 0, ty = 0;
  if (c.zoom === 'entra') esc = lerp(1.04, 1.16, p);
  else if (c.zoom === 'sai') esc = lerp(1.18, 1.04, p);
  else if (c.zoom === 'sobe') { esc = 1.12; ty = lerp(40, -40, p); }
  tx = wob(f / 30 * 0.2, 3) * 6;
  const src = staticFile(`l/${id}/${c.arq}`);
  return (
    <AbsoluteFill style={{ background: '#0c0a08', overflow: 'hidden' }}>
      {c.moldura ? (
        <>
          <Img src={src} style={{ position: 'absolute', inset: -60, width: LW + 120, height: LH + 120, objectFit: 'cover', filter: 'blur(28px) sepia(0.5) brightness(0.45)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 1240, height: 760, transform: `translate(-50%, -50%) scale(${esc}) rotate(${-1 + p * 1.5}deg)`, background: '#efe6d6', padding: 18, boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.35) contrast(1.05)' }} />
          </div>
        </>
      ) : (
        <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: LW, height: LH, objectFit: 'cover', transform: `translate(${tx}px, ${ty}px) scale(${esc})`, filter: 'sepia(0.45) contrast(1.08) brightness(0.92)' }} />
      )}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 45%, transparent 45%, rgba(0,0,0,0.65) 100%), linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 30%)' }} />
      {c.hud && <Hud f={f} hud={c.hud} relogio={c.relogio} />}
      {!c.hud && c.relogio && <div style={{ position: 'absolute', left: 60, top: 60, fontFamily: FT.mono, fontWeight: 700, fontSize: 26, color: K.sinal }}>{c.relogio}</div>}
      {c.legenda && <div style={{ position: 'absolute', right: 60, top: 96, maxWidth: 900, textAlign: 'right', fontFamily: FT.sans, fontWeight: 600, fontSize: 24, color: '#efe6d6', opacity: prog(f, 20, 36), textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>{c.legenda}</div>}
      {c.credito && <div style={{ position: 'absolute', right: 60, bottom: 30, fontFamily: FT.mono, fontSize: 18, color: 'rgba(239,230,214,0.6)' }}>{c.credito}</div>}
    </AbsoluteFill>
  );
};

/** documento da lei, como um papel oficial */
export const Documento: React.FC<LProps> = ({ c, f, marcos }) => {
  const m2 = marco(marcos, 2);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 1180, padding: '60px 80px', background: '#efe6d6', color: '#2a2118', borderRadius: 6, boxShadow: '0 30px 90px rgba(0,0,0,0.6)', transform: `rotate(${-1.2 + prog(f, 0, 30) * 0.8}deg) translateY(${(1 - prog(f, 0, 24, EO)) * 60}px)`, opacity: prog(f, 0, 14) }}>
        <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 26, letterSpacing: 3 }}>{c.data}</div>
        <div style={{ fontFamily: '"Georgia", serif', fontWeight: 700, fontSize: 64, lineHeight: 1.1, marginTop: 14 }}>{c.titulo}</div>
        <div style={{ height: 3, background: '#2a2118', margin: '26px 0', opacity: 0.5 }} />
        {c.itens.map((t: string, k: number) => {
          const a = m2 + k * 28;
          return <div key={k} style={{ fontFamily: '"Georgia", serif', fontSize: 40, marginTop: 14, opacity: prog(f, a, a + 12), transform: `translateX(${(1 - prog(f, a, a + 16, EO)) * 20}px)` }}>— {t}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** saldo: números em sequência, um por fala */
export const Contagem: React.FC<LProps> = ({ c, f, marcos }) => {
  const quando = c.quando ? c.quando.map(([k, d]: [number, number]) => marco(marcos, k) + d) : [marco(marcos, 1), marco(marcos, 1) + 60, marco(marcos, 2), marco(marcos, 3)];
  return (
    <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 220 }}>
      <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 30, color: K.sinal, letterSpacing: 3, opacity: prog(f, 0, 14) }}>{c.cabecalho || '16 DE NOVEMBRO DE 1904 · ESTADO DE SÍTIO'}</div>
      {c.itens.map((it: any, k: number) => {
        const a = quando[k];
        const p = prog(f, a, a + 30, EO);
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 30, marginTop: 30, opacity: clamp(p * 3) }}>
            <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 110, color: k === 3 ? '#e5484d' : K.texto, width: 300, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtL(it.v * p)}</div>
            <div style={{ fontFamily: FT.disp, fontWeight: 500, fontSize: 52, color: K.mudo }}>{it.r}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** veredito final: três caminhos */
export const Veredito: React.FC<LProps> = ({ c, f, marcos }) => (
  <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 180, paddingRight: 180 }}>
    <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 80, color: K.sinal, opacity: prog(f, 0, 14) }}>Quanto você dura?</div>
    {c.linhas.map((l: any, k: number) => {
      const a = marco(marcos, k + 1);
      const p = prog(f, a, a + 18, EO);
      const cor = k === 0 ? '#7bc47f' : k === 1 ? '#e5484d' : '#e9c46a';
      return (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 40, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
          <div style={{ width: 16, height: 90, borderRadius: 8, background: cor }} />
          <div>
            <div style={{ fontFamily: FT.sans, fontWeight: 600, fontSize: 32, color: K.mudo }}>{l.r}</div>
            <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 60, color: K.texto }}>{l.v}</div>
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);

/** legenda grande de vídeo longo: blocos de até 5 palavras, palavra falada acesa, números em destaque */
type Pw = { w: string; t0: number; t1: number; b: number };
export const LegendaLonga: React.FC<{ f: number; pal: Pw[] }> = ({ f, pal }) => {
  const t = f / 30;
  // monta blocos (cache simples por referência)
  const bl = (pal as any)._bl || ((pal as any)._bl = (() => {
    const out: { ws: Pw[]; t0: number; t1: number }[] = [];
    let cur: Pw[] = [];
    const fecha = () => { if (cur.length) { out.push({ ws: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1 }); cur = []; } };
    pal.forEach((p) => {
      if (cur.length && cur[0].b !== p.b) fecha();
      cur.push(p);
      const letras = cur.reduce((s, x) => s + x.w.length, 0);
      if (/[.?!:;]$/.test(p.w) || (/,$/.test(p.w) && cur.length >= 3) || cur.length >= 5 || letras > 26) fecha();
    });
    fecha();
    return out;
  })());
  const i = bl.findIndex((b: any, k: number) => t >= b.t0 - 0.05 && t < (bl[k + 1] ? Math.min(bl[k + 1].t0 - 0.05, b.t1 + 0.5) : b.t1 + 0.5));
  if (i < 0) return null;
  const b = bl[i];
  const g = f - (b.t0 - 0.05) * 30;
  const s = spr(g, 0, { damping: 13, stiffness: 320, mass: 0.6 });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 74, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px', maxWidth: 1500, padding: '10px 28px', borderRadius: 14, background: 'rgba(8,8,10,0.62)', transform: `translateY(${(1 - s) * 18}px) scale(${0.9 + 0.1 * s})`, opacity: clamp(s * 2.5) }}>
        {b.ws.map((w: Pw, k: number) => {
          const agora = t >= w.t0 - 0.03 && t < w.t1;
          const dito = t >= w.t0 - 0.03;
          const num = /\d/.test(w.w);
          return <span key={k} style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: num ? 64 : 54, lineHeight: 1.15, color: agora || (num && dito) ? K.sinal : dito ? '#f4f1ea' : 'rgba(244,241,234,0.5)', transform: `scale(${agora ? 1.06 : 1})`, display: 'inline-block' }}>{w.w.replace(/[,.:;]$/, '')}</span>;
        })}
      </div>
    </div>
  );
};
