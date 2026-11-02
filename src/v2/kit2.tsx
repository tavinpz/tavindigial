// Kit v2 dos vídeos de funcionalidade: a Thata real na versão de celular, em pé, dentro de um aparelho grande.
// Câmera (pan/zoom) dentro da tela, cursor com clique, realce no alvo e "lupa" (o alvo ampliado saltando para fora do aparelho).
// Coordenadas sempre em px do print (390 css @3x = 1170 de largura).
import React from 'react';
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { C, G, M, lerp, mola, saida, Icone } from '../kit';

export const PX = 210, PY0 = 430, PW = 660, PH0 = 1130, BZ = 22, SB = 58; // aparelho no vídeo; SB = barra de status
export const PY = PY0 + SB, PH = PH0 - SB; // área da tela do app
export const IW = 1170;
// geometria da área de tela: celular (padrão) ou janela de computador (pc), para as telas que só ficam boas no desktop
export type Geo = { x: number; y: number; w: number; h: number; iw: number; ih: number };
export const GEO_FONE: Geo = { x: PX, y: PY, w: PW, h: PH, iw: IW, ih: 4800 };
export const QX = 40, QY0 = 520, QW = 1000, QH0 = 1040, QB = 54;
export const GEO_PC: Geo = { x: QX, y: QY0 + QB, w: QW, h: QH0 - QB, iw: 2880, ih: 1800 };
export const geoDe = (t: Tela) => (t.pc ? GEO_PC : GEO_FONE);

export type Cam = [number, number, number, number]; // [quadro, cx, cy, zoom] — zoom 1 = largura inteira do print
export type Tela = {
  img: string; ini: number; fim: number; iw?: number; ih?: number; cam: Cam[];
  cursor?: [number, number, number][]; cliques?: number[];
  realce?: { box: number[]; ini: number; fim: number };
  lupa?: { box: number[]; ini: number; fim: number; lado?: 'cima' | 'baixo'; rotulo?: string };
  mao?: boolean; // ícone de toque no lugar da seta
  pc?: boolean;  // print do computador numa janela
};

const o2 = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const camEm = (f: number, cam: Cam[]) => {
  if (cam.length === 1) return { x: cam[0][1], y: cam[0][2], z: cam[0][3] };
  const e = { ...o2, easing: Easing.bezier(0.65, 0, 0.35, 1) };
  const fs = cam.map((c) => c[0]);
  return { x: interpolate(f, fs, cam.map((c) => c[1]), e), y: interpolate(f, fs, cam.map((c) => c[2]), e), z: interpolate(f, fs, cam.map((c) => c[3]), e) };
};
// estado da câmera já com o limite (nunca mostra fora do print)
export const estado = (t: Tela, f: number) => {
  const g = geoDe(t);
  const iw = t.iw || g.iw, ih = t.ih || g.ih;
  const c = camEm(f, t.cam);
  const s = (g.w / iw) * c.z;
  let x = c.x, y = c.y;
  if (iw * s >= g.w) x = Math.min(Math.max(x, g.w / 2 / s), iw - g.w / 2 / s); else x = iw / 2;
  if (ih * s >= g.h) y = Math.min(Math.max(y, g.h / 2 / s), ih - g.h / 2 / s); else y = ih / 2;
  return { x, y, s, g, iw, ih };
};
type Est = ReturnType<typeof estado>;
// ponto do print -> ponto no vídeo
export const noVideo = (px: number, py: number, e: Est) => ({ x: e.g.x + e.g.w / 2 + (px - e.x) * e.s, y: e.g.y + e.g.h / 2 + (py - e.y) * e.s });

const Seta: React.FC<{ x: number; y: number; aperta: number }> = ({ x, y, aperta }) => (
  <svg width={70} height={70} viewBox="0 0 24 24" style={{ position: 'absolute', left: x - 8, top: y - 5, transform: `scale(${1 - aperta * 0.2})`, transformOrigin: '8px 5px', filter: 'drop-shadow(0 8px 14px rgba(11,20,17,.4))', zIndex: 80 }}>
    <path d="M5 3 L5 19 L9.5 14.8 L12.6 21 L15.2 19.8 L12.2 13.7 L18.4 13.4 Z" fill="#0B1411" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

// uma tela (print) dentro do aparelho
const UmaTela: React.FC<{ t: Tela; prox?: Tela }> = ({ t }) => {
  const f = useCurrentFrame();
  if (f < t.ini - 1 || f > t.fim + 9) return null;
  const o = Math.min(lerp(f, t.ini, t.ini + 8, 0, 1), lerp(f, t.fim, t.fim + 8, 1, 0));
  const e = estado(t, f);
  const { iw, ih, g } = e;
  const r = t.realce;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <Img src={staticFile(t.img)} style={{ position: 'absolute', left: g.w / 2 - e.x * e.s, top: g.h / 2 - e.y * e.s, width: iw * e.s, height: ih * e.s }} />
      {r && f >= r.ini && f <= r.fim + 8 && (() => {
        const a = { x: g.w / 2 + (r.box[0] - e.x) * e.s, y: g.h / 2 + (r.box[1] - e.y) * e.s };
        const w = r.box[2] * e.s, h = r.box[3] * e.s;
        const k = mola(f, r.ini, { damping: 12, stiffness: 170, mass: 0.6 });
        const pul = 1 + Math.sin((f - r.ini) / 5) * 0.025;
        return <div style={{ position: 'absolute', left: a.x - 9, top: a.y - 9, width: w + 18, height: h + 18, borderRadius: Math.min(30, (h + 18) / 2), border: `5px solid ${C.vivo}`,
          boxShadow: '0 0 0 12px rgba(27,195,113,.2), 0 0 50px rgba(27,195,113,.5)', opacity: Math.min(1, k * 1.5) * saida(f, r.fim + 8, 8), transform: `scale(${(1.2 - 0.2 * k) * pul})` }} />;
      })()}
    </div>
  );
};

// cursor + cliques + lupa: desenhados por cima do aparelho (fora do recorte da tela)
const Interacao: React.FC<{ t: Tela }> = ({ t }) => {
  const f = useCurrentFrame();
  if (f < t.ini || f > t.fim + 2) return null;
  const e = estado(t, f);
  let cur: null | { x: number; y: number } = null;
  if (t.cursor && f >= t.cursor[0][0]) {
    const fs = t.cursor.map((k) => k[0]);
    const ez = { ...o2, easing: Easing.bezier(0.45, 0, 0.2, 1) };
    cur = noVideo(interpolate(f, fs, t.cursor.map((k) => k[1]), ez), interpolate(f, fs, t.cursor.map((k) => k[2]), ez), e);
  }
  let aperta = 0;
  (t.cliques || []).forEach((c) => { const d = f - c; if (d > -5 && d < 10) aperta = Math.max(aperta, interpolate(d, [-5, 0, 10], [0, 1, 0])); });
  const L = t.lupa;
  return (
    <>
      {(t.cliques || []).map((c, i) => {
        const d = f - c; if (d < 0 || d > 24 || !cur) return null;
        const rr = lerp(d, 0, 24, 16, 90);
        return <div key={i} style={{ position: 'absolute', left: cur.x - rr, top: cur.y - rr, width: rr * 2, height: rr * 2, borderRadius: 999, border: `5px solid ${C.verde}`, opacity: lerp(d, 0, 24, 0.95, 0), zIndex: 79 }} />;
      })}
      {L && f >= L.ini && f <= L.fim + 8 && <Lupa t={t} e={e} />}
      {cur && (t.mao
        ? <div style={{ position: 'absolute', left: cur.x - 30, top: cur.y - 30, width: 60, height: 60, borderRadius: 99, background: 'rgba(11,20,17,.28)', border: '4px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,.3)', transform: `scale(${1 - aperta * 0.25})`, zIndex: 80 }} />
        : <Seta x={cur.x} y={cur.y} aperta={aperta} />)}
    </>
  );
};

// o alvo ampliado saltando para fora do aparelho, ligado ao ponto original
const Lupa: React.FC<{ t: Tela; e: Est }> = ({ t, e }) => {
  const f = useCurrentFrame();
  const L = t.lupa!;
  const pad = 18;
  const [bx, by, bw, bh] = [L.box[0] - pad, L.box[1] - pad, L.box[2] + pad * 2, L.box[3] + pad * 2];
  const k = Math.min(1.75 * e.s, 940 / bw, 330 / bh);
  const lw = bw * k, lh = bh * k;
  const alvo = noVideo(L.box[0] + L.box[2] / 2, L.box[1] + L.box[3] / 2, e);
  const cima = L.lado ? L.lado === 'cima' : alvo.y > 1000;
  const cx = Math.min(Math.max(alvo.x, 70 + lw / 2), 1010 - lw / 2);
  const dy = (L.box[3] * e.s) / 2 + 70;
  let top = cima ? alvo.y - dy - lh : alvo.y + dy;
  top = Math.min(Math.max(top, 400), 1600 - lh);
  const s = mola(f, L.ini, { damping: 13, stiffness: 150, mass: 0.7 });
  const o = Math.min(1, s * 1.6) * saida(f, L.fim + 8, 8);
  const { iw, ih } = e;
  const ligY = cima ? top + lh : top;
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, zIndex: 70, opacity: o }}>
        <line x1={alvo.x} y1={alvo.y} x2={cx} y2={ligY} stroke={C.vivo} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-f * 1.5} />
        <circle cx={alvo.x} cy={alvo.y} r={12} fill={C.vivo} />
      </svg>
      <div style={{ position: 'absolute', left: cx - lw / 2, top, width: lw, height: lh, borderRadius: 28, overflow: 'hidden', background: '#fff', zIndex: 71, opacity: o,
        border: `5px solid ${C.vivo}`, boxShadow: '0 30px 70px -20px rgba(11,20,17,.55), 0 0 0 12px rgba(27,195,113,.16)',
        transform: `scale(${0.4 + 0.6 * s}) translateY(${(1 - s) * (cima ? 60 : -60)}px)`, transformOrigin: `${alvo.x - (cx - lw / 2)}px ${cima ? lh : 0}px` }}>
        <Img src={staticFile(t.img)} style={{ position: 'absolute', left: -bx * k, top: -by * k, width: iw * k, height: ih * k }} />
      </div>
      {L.rotulo && <div style={{ position: 'absolute', left: cx - lw / 2, top: cima ? top - 62 : top + lh + 14, zIndex: 72, opacity: o, fontFamily: G, fontWeight: 600, fontSize: 30, color: '#fff', background: C.ink, padding: '8px 20px', borderRadius: 99 }}>{L.rotulo}</div>}
    </>
  );
};

// o aparelho com as telas; entra subindo e sai descendo
export const Aparelho: React.FC<{ telas: Tela[]; ini: number; fim: number; pc?: boolean }> = ({ telas, ini, fim, pc }) => {
  const f = useCurrentFrame();
  if (f < ini - 1 || f > fim + 20) return null;
  const s = mola(f, ini, { damping: 17, stiffness: 110, mass: 0.9 });
  const sai = lerp(f, fim, fim + 14, 0, 1, Easing.bezier(0.55, 0, 0.8, 0.2));
  const dy = (1 - s) * 900 + sai * 1100;
  if (pc) return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${dy}px)`, opacity: 1 - sai }}>
      <div style={{ position: 'absolute', left: QX, top: QY0, width: QW, height: QH0, borderRadius: 34, overflow: 'hidden', background: '#fff', border: `2px solid ${C.linha}`,
        boxShadow: '0 50px 100px -40px rgba(11,20,17,.4), 0 100px 160px -70px rgba(21,167,99,.4)' }}>
        <div style={{ height: QB, display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px', borderBottom: `1.5px solid ${C.linha}`, background: '#FBFDFC' }}>
          {['#FF6058', '#FFBD2E', '#28C940'].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '6px 26px', borderRadius: 99, background: '#EEF3F1', fontFamily: M, fontSize: 20, color: C.fg2 }}>thata.online · no computador</div></div>
          <div style={{ width: 62 }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: QB, width: QW, height: QH0 - QB, overflow: 'hidden', background: '#EEF5F2' }}>{telas.map((t, i) => <UmaTela key={i} t={t} />)}</div>
      </div>
      {telas.map((t, i) => <Interacao key={'i' + i} t={t} />)}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${dy}px)`, opacity: 1 - sai }}>
      <div style={{ position: 'absolute', left: PX - BZ, top: PY0 - BZ, width: PW + BZ * 2, height: PH0 + BZ * 2, borderRadius: 86, background: '#0B1411',
        boxShadow: `0 0 0 3px ${C.linha2}, 0 60px 120px -40px rgba(11,20,17,.5), 0 120px 200px -80px rgba(21,167,99,.45)` }} />
      <div style={{ position: 'absolute', left: PX, top: PY0, width: PW, height: PH0, borderRadius: 66, overflow: 'hidden', background: '#FBFDFC' }}>
        <div style={{ position: 'absolute', left: 0, top: SB, width: PW, height: PH, overflow: 'hidden' }}>{telas.map((t, i) => <UmaTela key={i} t={t} />)}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SB, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 54px 0', fontFamily: G, fontWeight: 600, fontSize: 24, color: C.ink }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ width: 30, height: 14, borderRadius: 4, border: `2px solid ${C.ink}`, position: 'relative' }}><span style={{ position: 'absolute', inset: 2, right: 6, background: C.ink, borderRadius: 1 }} /></span></span>
        </div>
        <div style={{ position: 'absolute', top: 12, left: '50%', width: 150, height: 40, marginLeft: -75, background: '#05090A', borderRadius: 99, zIndex: 9 }} />
      </div>
      {telas.map((t, i) => <Interacao key={'i' + i} t={t} />)}
    </div>
  );
};

// ── Títulos ──
export const Chip: React.FC<{ t: string; cor?: string; fundo?: string; tam?: number; icone?: string }> = ({ t, cor = '#fff', fundo = C.ink, tam = 28, icone }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${tam * 0.4}px ${tam * 0.85}px ${tam * 0.4}px ${tam * 0.5}px`, borderRadius: 99, background: fundo, color: cor, fontFamily: M, fontSize: tam, fontWeight: 500 }}>
    {icone ? <span style={{ width: tam * 1.5, height: tam * 1.5, borderRadius: 99, background: C.vivo, display: 'grid', placeItems: 'center' }}><Icone n={icone} tam={tam * 0.95} cor="#06100C" traco={2.4} /></span> : null}{t}
  </div>
);

// título do passo: selo "passo n" + frase
export const TopoPasso: React.FC<{ n: string; t: string; ini: number; fim: number; total?: number }> = ({ n, t, ini, fim, total }) => {
  const f = useCurrentFrame();
  if (f < ini - 2 || f > fim + 2) return null;
  const s = mola(f, ini, { damping: 16, stiffness: 160, mass: 0.7 });
  const o = Math.min(1, s * 2) * saida(f, fim, 8);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 120, opacity: o, transform: `translateY(${(1 - s) * 30}px)` }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 24px 10px 12px', borderRadius: 99, background: C.ink, color: '#fff', fontFamily: M, fontSize: 27 }}>
        <span style={{ width: 44, height: 44, borderRadius: 99, background: C.vivo, color: '#06100C', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 700, fontSize: 26 }}>{n}</span>
        {total ? `passo ${n} de ${total}` : `passo ${n}`}
      </div>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 62, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1.08, marginTop: 20 }}>{t.split('*').map((p, i) => <span key={i} style={{ color: i % 2 ? C.verde : C.ink }}>{p}</span>)}</div>
    </div>
  );
};

// ── Logos (desenhados, animados) ──
export const MetaLogo: React.FC<{ tam?: number; ini: number }> = ({ tam = 200, ini }) => {
  const f = useCurrentFrame();
  const p = lerp(f, ini, ini + 36, 0, 1, Easing.bezier(0.45, 0, 0.2, 1));
  const L = 260;
  return (
    <svg width={tam * 1.6} height={tam} viewBox="0 0 160 100">
      <defs><linearGradient id="mg" x1="0" x2="1"><stop offset="0" stopColor="#0064E1" /><stop offset="0.6" stopColor="#0081FB" /><stop offset="1" stopColor="#0099FF" /></linearGradient></defs>
      <path d="M20 70 C20 30 40 18 55 30 C70 42 90 82 108 82 C126 82 140 66 140 50 C140 30 126 20 112 26 C98 32 76 70 60 78 C44 86 20 86 20 70 Z" fill="none" stroke="url(#mg)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
    </svg>
  );
};
export const WhatsLogo: React.FC<{ tam?: number; ini: number }> = ({ tam = 160, ini }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, { damping: 11, stiffness: 140, mass: 0.7 });
  return (
    <div style={{ width: tam, height: tam, borderRadius: tam * 0.28, background: 'linear-gradient(150deg,#3BE07A,#0FA958)', display: 'grid', placeItems: 'center', transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, boxShadow: '0 30px 60px -24px rgba(15,169,88,.7)' }}>
      <svg width={tam * 0.62} height={tam * 0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z" /><path d="M9 8.5c0 3 2.5 6 6 6.5l1.2-1.4-1.8-1-1 .8c-1-.5-2-1.5-2.5-2.5l.8-1-1-1.8z" fill="#fff" stroke="none" />
      </svg>
    </div>
  );
};
