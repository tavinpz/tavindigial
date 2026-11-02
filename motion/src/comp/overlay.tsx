import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W } from '../lib/theme';
import { prog, spr, wob, EO, clamp } from '../lib/anim';
import { Logo } from './base';
import type { Palavra } from '../lib/types';

/** Gancho: linhas batem na tela no quadro 0 com tremida e flash; somem por volta de 2,6 s */
export const Gancho: React.FC<{ f: number; texto: string; sai?: number; y?: number }> = ({ f, texto, sai = 74, y = 690 }) => {
  const linhas = texto.toUpperCase().split('\n');
  const saida = prog(f, sai, sai + 10, EO);
  if (saida >= 1) return null;
  const batidas = linhas.map((_, i) => -8 + i * 13);
  // tremida que decai após cada batida
  let sx = 0, sy = 0;
  batidas.forEach((b) => {
    const d = f - b;
    if (d >= 0 && d < 12) {
      const k = (1 - d / 12) * 14;
      sx += Math.sin(d * 2.9) * k;
      sy += Math.cos(d * 3.7) * k * 0.7;
    }
  });
  const flash = batidas.reduce((m, b) => Math.max(m, f >= Math.max(1, b) && f < b + 4 ? (1 - (f - b) / 4) * 0.14 : 0), 0);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <div style={{ position: 'absolute', left: 0, width: W, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: `translate(${sx}px, ${sy - saida * 120}px) scale(${1 - saida * 0.25})`, opacity: 1 - saida, filter: saida > 0 ? `blur(${saida * 10}px)` : undefined }}>
        {linhas.map((l, i) => {
          const s = spr(f, batidas[i], { damping: 11, stiffness: 260, mass: 0.7 });
          const esc = 2.3 - 1.3 * s;
          const destaque = i === linhas.length - 1;
          return (
            <div key={i} style={{ opacity: clamp(s * 3), transform: `scale(${esc}) rotate(${(1 - s) * (i % 2 ? 4 : -4)}deg)`, filter: s < 0.85 ? `blur(${(1 - s) * 8}px)` : undefined }}>
              <div style={{ fontFamily: F.cond, fontWeight: 900, fontSize: Math.min(176, 1500 / Math.max(6, l.length)), lineHeight: 1, letterSpacing: 1, padding: '6px 26px 10px', color: destaque ? C.navy : C.white, background: destaque ? C.amber : 'rgba(5,12,21,0.82)', borderRadius: 14, boxShadow: destaque ? `0 0 60px ${C.amber}88, 0 12px 40px rgba(0,0,0,0.6)` : '0 12px 40px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Legenda karaokê: blocos de até 3 palavras, palavra falada em âmbar */
type Bloco = { ws: Palavra[]; t0: number; t1: number };
export const blocos = (pal: Palavra[]): Bloco[] => {
  const out: Bloco[] = [];
  let cur: Palavra[] = [];
  const fecha = () => { if (cur.length) { out.push({ ws: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1 }); cur = []; } };
  pal.forEach((p, i) => {
    if (cur.length && cur[0].cena !== p.cena) fecha();
    cur.push(p);
    const fim = /[,.?!:;]$/.test(p.w);
    const letras = cur.reduce((s, x) => s + x.w.length, 0);
    if (fim || cur.length >= 3 || letras > 14) fecha();
  });
  fecha();
  return out;
};

export const Legenda: React.FC<{ f: number; bl: Bloco[]; y?: number }> = ({ f, bl, y = 1318 }) => {
  const t = f / 30;
  const i = bl.findIndex((b, k) => t >= b.t0 - 0.04 && t < (bl[k + 1] && bl[k + 1].ws[0].cena === b.ws[0].cena ? bl[k + 1].t0 - 0.04 : b.t1 + 0.35));
  if (i < 0) return null;
  const b = bl[i];
  const g = f - (b.t0 - 0.04) * 30;
  const s = spr(g, 0, { damping: 12, stiffness: 320, mass: 0.6 });
  return (
    <div style={{ position: 'absolute', left: 90, width: W - 180, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 24px', transform: `translateY(${(1 - s) * 30}px) scale(${0.82 + 0.18 * s})`, opacity: clamp(s * 2.5) }}>
      {b.ws.map((w, k) => {
        const ativo = t >= w.t0 - 0.03;
        const agora = t >= w.t0 - 0.03 && t < w.t1;
        const num = /\d/.test(w.w);
        return (
          <span key={k} style={{ fontFamily: F.cond, fontWeight: 800, fontSize: 82, lineHeight: 1.05, textTransform: 'uppercase', color: agora || (num && ativo) ? C.amber : ativo ? C.white : 'rgba(244,246,248,0.55)', WebkitTextStroke: '12px rgba(0,0,0,0.92)', paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,0.7)', transform: `scale(${agora ? 1.04 : 1})`, display: 'inline-block' }}>{w.w.replace(/[,.:;]$/, '')}</span>
        );
      })}
    </div>
  );
};

/** Marcas d'água: selo da marca, texto lateral, @ do canal e barra de progresso */
export const Marcas: React.FC<{ f: number; total: number }> = ({ f, total }) => {
  const t = f / 30;
  const p = clamp(f / total);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 7, width: W * p, background: `linear-gradient(90deg, ${C.amber2}, ${C.amber})`, boxShadow: `0 0 14px ${C.amber}` }} />
      <div style={{ position: 'absolute', top: 128, left: 44, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.92 }}>
        <Logo tam={58} style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }} />
        <div style={{ fontFamily: F.cond, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: C.white, textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>CONCRETE ATLAS</div>
      </div>
      <div style={{ position: 'absolute', left: 22, top: 1180, transformOrigin: '0 0', transform: 'rotate(-90deg)', fontFamily: F.cond, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: C.white, opacity: 0.34, whiteSpace: 'nowrap' }}>CONCRETE ATLAS • ORIGINAL MAP ANIMATION</div>
      <div style={{ position: 'absolute', width: W, top: 1452 + wob(t * 0.5, 2) * 4, textAlign: 'center', fontFamily: F.cond, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: C.white, opacity: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>@ConcreteAtlas</div>
    </AbsoluteFill>
  );
};
