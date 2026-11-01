// Kit "tela real": mostra prints da interface publicada da Thata (gerados com dados fictícios) numa janela,
// com câmera (pan/zoom), cursor, clique e destaque. Coordenadas sempre em pixels do print (2880x1800, tela 1440 @2x).
import React from 'react';
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, G, M, lerp, mola, saida } from './kit';

export const IW = 2880, IH = 1800;
export type Cam = [number, number, number, number]; // [quadro, centro x, centro y, escala]
export type Passo = {
  img: string; ini: number; fim: number; cam: Cam[]; iw?: number; ih?: number;
  cursor?: [number, number, number][]; cliques?: number[];
  realce?: { box: number[]; ini: number; fim?: number };
};
export const JX = 40, JY = 470, JW = 1000, JH = 1060; // a janela na tela do vídeo

const camEm = (f: number, cam: Cam[]) => {
  if (cam.length === 1) return { x: cam[0][1], y: cam[0][2], s: cam[0][3] };
  const o = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.bezier(0.65, 0, 0.35, 1) };
  const fs = cam.map((c) => c[0]);
  return { x: interpolate(f, fs, cam.map((c) => c[1]), o), y: interpolate(f, fs, cam.map((c) => c[2]), o), s: interpolate(f, fs, cam.map((c) => c[3]), o) };
};
// ponto do print -> ponto dentro da janela
const naJanela = (px: number, py: number, c: { x: number; y: number; s: number }) => ({ x: JW / 2 + (px - c.x) * c.s, y: JH / 2 + (py - c.y) * c.s });

const Cursor: React.FC<{ x: number; y: number; aperta: number }> = ({ x, y, aperta }) => (
  <svg width={58} height={58} viewBox="0 0 24 24" style={{ position: 'absolute', left: x - 6, top: y - 4, transform: `scale(${1 - aperta * 0.18})`, transformOrigin: '6px 4px', filter: 'drop-shadow(0 6px 10px rgba(11,20,17,.35))', zIndex: 30 }}>
    <path d="M5 3 L5 19 L9.5 14.8 L12.6 21 L15.2 19.8 L12.2 13.7 L18.4 13.4 Z" fill="#0B1411" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

const UmPasso: React.FC<{ p: Passo; ultimo: boolean }> = ({ p, ultimo }) => {
  const f = useCurrentFrame();
  if (f < p.ini - 1 || (!ultimo && f > p.fim + 10)) return null;
  const entra = lerp(f, p.ini, p.ini + 10, 0, 1);
  const o = ultimo ? entra : Math.min(entra, lerp(f, p.fim, p.fim + 10, 1, 0));
  const iw = p.iw || IW, ih = p.ih || IH;
  const c = camEm(f, p.cam);
  // a câmera nunca mostra fora do print (sem faixa vazia)
  if (iw * c.s >= JW) c.x = Math.min(Math.max(c.x, JW / 2 / c.s), iw - JW / 2 / c.s);
  if (ih * c.s >= JH) c.y = Math.min(Math.max(c.y, JH / 2 / c.s), ih - JH / 2 / c.s);
  const s0 = 0.96 + 0.04 * mola(f, p.ini, { damping: 20, stiffness: 140, mass: 0.8 });
  let cur = null as null | { x: number; y: number };
  if (p.cursor && f >= p.cursor[0][0]) {
    const fs = p.cursor.map((k) => k[0]);
    const o2 = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.bezier(0.45, 0, 0.2, 1) };
    cur = naJanela(interpolate(f, fs, p.cursor.map((k) => k[1]), o2), interpolate(f, fs, p.cursor.map((k) => k[2]), o2), c);
  }
  let aperta = 0;
  (p.cliques || []).forEach((t) => { const d = f - t; if (d > -5 && d < 10) aperta = Math.max(aperta, interpolate(d, [-5, 0, 10], [0, 1, 0])); });
  const r = p.realce;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `scale(${s0})` }}>
      <Img src={staticFile(p.img)} style={{ position: 'absolute', left: JW / 2 - c.x * c.s, top: JH / 2 - c.y * c.s, width: iw * c.s, height: ih * c.s }} />
      {r && f >= r.ini && (() => {
        const a = naJanela(r.box[0], r.box[1], c); const w = r.box[2] * c.s, h = r.box[3] * c.s;
        const k = mola(f, r.ini, { damping: 12, stiffness: 160, mass: 0.6 });
        const pul = 1 + Math.sin((f - r.ini) / 6) * 0.04;
        return <div style={{ position: 'absolute', left: a.x - 10, top: a.y - 10, width: w + 20, height: h + 20, borderRadius: Math.min(26, (h + 20) / 2), border: `4px solid ${C.vivo}`,
          boxShadow: '0 0 0 10px rgba(27,195,113,.18), 0 0 40px rgba(27,195,113,.45)', opacity: Math.min(1, k * 1.5) * saida(f, r.fim, 8), transform: `scale(${(1.15 - 0.15 * k) * pul})`, zIndex: 20 }} />;
      })()}
      {(p.cliques || []).map((t, i) => {
        const d = f - t; if (d < 0 || d > 22 || !cur) return null;
        const rr = lerp(d, 0, 22, 14, 70);
        return <div key={i} style={{ position: 'absolute', left: cur.x - rr, top: cur.y - rr, width: rr * 2, height: rr * 2, borderRadius: 999, border: `4px solid ${C.verde}`, opacity: lerp(d, 0, 22, 0.9, 0), zIndex: 29 }} />;
      })}
      {cur && <Cursor x={cur.x} y={cur.y} aperta={aperta} />}
    </div>
  );
};

// a janela com barra de navegador e os passos dentro
export const Janela: React.FC<{ passos: Passo[]; ini?: number; fim?: number; url?: string }> = ({ passos, ini = 0, fim = 486, url = 'thata.online' }) => {
  const f = useCurrentFrame();
  const e = mola(f, ini, { damping: 18, stiffness: 120, mass: 0.9 });
  return (
    <div style={{ position: 'absolute', left: JX, top: JY - 56, width: JW, height: JH + 56, borderRadius: 40, background: '#fff', overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(11,20,17,.06), 0 40px 80px -30px rgba(11,20,17,.35), 0 90px 140px -60px rgba(21,167,99,.35)', border: `1.5px solid ${C.linha}`,
      opacity: Math.min(1, e * 2) * saida(f, fim, 10), transform: `translateY(${(1 - e) * 90}px)` }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 26px', borderBottom: `1.5px solid ${C.linha}`, background: '#FBFDFC' }}>
        {['#FF6058', '#FFBD2E', '#28C940'].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '6px 26px', borderRadius: 99, background: '#EEF3F1', fontFamily: M, fontSize: 20, color: C.fg2 }}>{url}</div>
        </div>
        <div style={{ width: 62 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 56, width: JW, height: JH, overflow: 'hidden', background: '#EEF5F2' }}>
        {passos.map((p, i) => <UmPasso key={i} p={p} ultimo={i === passos.length - 1} />)}
      </div>
    </div>
  );
};

// selo do passo + título curto, em cima da janela
export const Etapa: React.FC<{ n: string; t: string; ini: number; fim: number }> = ({ n, t, ini, fim }) => {
  const f = useCurrentFrame();
  if (f < ini - 2 || f > fim + 2) return null;
  const s = mola(f, ini, { damping: 16, stiffness: 160, mass: 0.7 });
  const o = Math.min(1, s * 2) * saida(f, fim, 8);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 150, opacity: o, transform: `translateY(${(1 - s) * 30}px)` }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 22px 10px 12px', borderRadius: 99, background: C.ink, color: '#fff', fontFamily: M, fontSize: 26 }}>
        <span style={{ width: 40, height: 40, borderRadius: 99, background: C.vivo, color: '#06100C', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 700, fontSize: 24 }}>{n}</span>passo {n}
      </div>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 64, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1.08, marginTop: 22 }}>{t}</div>
    </div>
  );
};
