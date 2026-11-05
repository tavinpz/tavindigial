import React from 'react';
import { AbsoluteFill } from 'remotion';
import { K, FT, LW, LH, marco, fmtL } from './tema';
import type { LProps } from './tema';
import { prog, spr, EO, EIO, lerp, clamp } from '../lib/anim';

const N = 10;
const LETRAS = 'ABCDEFGHIJ';
const AGUA = '#0f2236';

/** um tabuleiro 10x10 com tiros até `n` (pode ser fracionário para animar o último) */
const Tabuleiro: React.FC<{ x: number; y: number; tam: number; seq: number[][]; navios: number[][]; n: number; mostrar?: boolean; calor?: number[]; f: number; cor?: string; rotulos?: boolean }> = ({ x, y, tam, seq, navios, n, mostrar, calor, f, cor = K.sinal, rotulos = true }) => {
  const cel = tam / N;
  const feitos = seq.slice(0, Math.floor(n));
  const acertos = new Set(feitos.filter((s) => s[1]).map((s) => s[0]));
  const tirados = new Set(feitos.map((s) => s[0]));
  const afundados = navios.filter((nv) => nv.every((i) => acertos.has(i)));
  const maxC = calor ? Math.max(...calor) : 1;
  const minC = calor ? Math.min(...calor) : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: tam, height: tam }}>
      <div style={{ position: 'absolute', inset: 0, background: AGUA, borderRadius: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }} />
      {calor && calor.map((v, i) => {
        const t = maxC > minC ? (v - minC) / (maxC - minC) : 0;
        return <div key={'c' + i} style={{ position: 'absolute', left: (i % N) * cel + 2, top: Math.floor(i / N) * cel + 2, width: cel - 4, height: cel - 4, borderRadius: 6, background: `rgba(255,${Math.round(210 - 150 * t)},${Math.round(63 - 40 * t)},${0.08 + 0.85 * t * t})` }} />;
      })}
      {Array.from({ length: N + 1 }, (_, k) => (
        <React.Fragment key={k}>
          <div style={{ position: 'absolute', left: k * cel - 1, top: 0, width: 2, height: tam, background: 'rgba(120,170,220,0.18)' }} />
          <div style={{ position: 'absolute', top: k * cel - 1, left: 0, height: 2, width: tam, background: 'rgba(120,170,220,0.18)' }} />
        </React.Fragment>
      ))}
      {rotulos && Array.from({ length: N }, (_, k) => (
        <React.Fragment key={'r' + k}>
          <div style={{ position: 'absolute', left: k * cel, top: -36, width: cel, textAlign: 'center', fontFamily: FT.mono, fontSize: 20, color: K.fraco }}>{k + 1}</div>
          <div style={{ position: 'absolute', top: k * cel + cel / 2 - 12, left: -34, fontFamily: FT.mono, fontSize: 20, color: K.fraco }}>{LETRAS[k]}</div>
        </React.Fragment>
      ))}
      {/* navios: aparecem se `mostrar` ou quando afundam */}
      {navios.map((nv, k) => {
        const afund = afundados.includes(nv);
        if (!mostrar && !afund) return null;
        const r0 = Math.min(...nv.map((i) => Math.floor(i / N))), r1 = Math.max(...nv.map((i) => Math.floor(i / N)));
        const c0 = Math.min(...nv.map((i) => i % N)), c1 = Math.max(...nv.map((i) => i % N));
        return <div key={'n' + k} style={{ position: 'absolute', left: c0 * cel + cel * 0.12, top: r0 * cel + cel * 0.12, width: (c1 - c0 + 1) * cel - cel * 0.24, height: (r1 - r0 + 1) * cel - cel * 0.24, borderRadius: cel * 0.4, background: afund ? 'rgba(255,93,93,0.25)' : 'rgba(170,185,205,0.55)', border: afund ? `3px solid ${K.ruim}` : '3px solid rgba(220,230,240,0.7)' }} />;
      })}
      {feitos.map(([i, h], k) => {
        const idade = n - k;
        const s = clamp(idade / 0.6);
        const cx = (i % N) * cel + cel / 2, cy = Math.floor(i / N) * cel + cel / 2;
        if (h) {
          return (
            <React.Fragment key={'t' + k}>
              {idade < 3 && <div style={{ position: 'absolute', left: cx - cel, top: cy - cel, width: cel * 2, height: cel * 2, borderRadius: '50%', border: `3px solid ${K.ruim}`, opacity: 1 - idade / 3, transform: `scale(${0.4 + idade / 3})` }} />}
              <div style={{ position: 'absolute', left: cx - cel * 0.28, top: cy - cel * 0.28, width: cel * 0.56, height: cel * 0.56, borderRadius: '50%', background: K.ruim, boxShadow: `0 0 ${cel * 0.4}px ${K.ruim}`, transform: `scale(${s})` }} />
            </React.Fragment>
          );
        }
        return <div key={'t' + k} style={{ position: 'absolute', left: cx - cel * 0.13, top: cy - cel * 0.13, width: cel * 0.26, height: cel * 0.26, borderRadius: '50%', background: 'rgba(230,238,246,0.75)', transform: `scale(${s})` }} />;
      })}
      {/* mira no último tiro */}
      {feitos.length > 0 && n < seq.length && (() => {
        const i = seq[Math.min(seq.length - 1, Math.floor(n))][0];
        const cx = (i % N) * cel + cel / 2, cy = Math.floor(i / N) * cel + cel / 2;
        return <div style={{ position: 'absolute', left: cx - cel / 2, top: cy - cel / 2, width: cel, height: cel, border: `3px solid ${cor}`, borderRadius: 8, opacity: 0.9 }} />;
      })()}
    </div>
  );
};

/** partida (ou corrida de duas) tiro a tiro; `lados`: [{nome, seq, navios, cor}] */
export const Naval: React.FC<LProps> = ({ c, f, dur, marcos }) => {
  const lados: any[] = c.lados;
  const a0 = c.de_fala !== undefined ? marco(marcos, c.de_fala) : 12;
  const a1 = c.ate_fala !== undefined ? marco(marcos, c.ate_fala) : dur - 30;
  const dois = lados.length > 1;
  const tam = dois ? 640 : 720;
  return (
    <AbsoluteFill>
      {c.titulo && <div style={{ position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 54, color: K.texto, opacity: prog(f, 0, 12) }}>{c.titulo}</div>}
      {lados.map((L, k) => {
        const total = L.seq.length;
        const maxT = Math.max(...lados.map((l) => l.seq.length));
        // todos atiram no mesmo ritmo: o mais rápido termina antes
        const n = clamp((f - a0) / Math.max(1, a1 - a0)) * maxT;
        const nn = Math.min(total, n);
        const acabou = n >= total;
        const x = dois ? (k === 0 ? 170 : LW - 170 - tam) : 230;
        const y = dois ? 150 : 150;
        const aE = a0 + (total / maxT) * (a1 - a0);
        const s = spr(f, aE, { damping: 10, stiffness: 260 });
        return (
          <React.Fragment key={k}>
            <Tabuleiro x={x} y={y} tam={tam} seq={L.seq} navios={L.navios} n={nn} mostrar={c.mostrar} f={f} cor={L.cor || K.sinal} />
            <div style={{ position: 'absolute', left: dois ? x : x + tam + 120, top: dois ? y + tam + 26 : y + 40, width: dois ? tam : 720, display: 'flex', flexDirection: dois ? 'row' : 'column', justifyContent: 'space-between', alignItems: dois ? 'baseline' : 'flex-start' }}>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: dois ? 40 : 56, color: L.cor || K.texto }}>{L.nome}</div>
              <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: dois ? 44 : 120, color: acabou ? (L.cor || K.sinal) : K.texto, fontVariantNumeric: 'tabular-nums', marginTop: dois ? 0 : 10 }}>{Math.floor(nn)}<span style={{ fontSize: dois ? 26 : 40, color: K.mudo }}> {LOCtiros(Math.floor(nn))}</span></div>
            </div>
            {acabou && <div style={{ position: 'absolute', left: x + tam / 2, top: y + tam / 2, transform: `translate(-50%, -50%) rotate(-8deg) scale(${2.4 - 1.4 * s})`, opacity: clamp(s * 2), border: `10px solid ${L.cor || K.sinal}`, borderRadius: 16, padding: '4px 30px', fontFamily: FT.disp, fontWeight: 700, fontSize: 84, color: L.cor || K.sinal, background: 'rgba(13,16,22,0.7)', whiteSpace: 'nowrap' }}>{total} SHOTS</div>}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
const LOCtiros = (n: number) => (n === 1 ? 'shot' : 'shots');

/** mapa de calor: onde os navios podem estar */
export const Calor: React.FC<LProps> = ({ c, f, marcos }) => {
  const p = prog(f, 10, 50, EIO);
  const vals: number[] = c.valores.map((v: number) => v * p);
  const m1 = marco(marcos, c.fala_destaque ?? 1);
  return (
    <AbsoluteFill>
      <Tabuleiro x={230} y={150} tam={720} seq={[]} navios={[]} n={0} calor={vals.map((v) => v + 0.0001)} f={f} />
      {c.destaque && (
        <div style={{ position: 'absolute', left: 230 + (c.destaque[1] * 72), top: 150 + (c.destaque[0] * 72), width: c.destaque[3] * 72, height: c.destaque[2] * 72, border: `5px dashed ${K.sinal}`, borderRadius: 12, opacity: prog(f, m1, m1 + 14) }} />
      )}
      <div style={{ position: 'absolute', left: 1110, top: 230, width: 700 }}>
        <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 64, color: K.texto, lineHeight: 1.05, opacity: prog(f, 0, 12) }}>{c.titulo}</div>
        {(c.linhas || []).map((l: string, k: number) => {
          const a = marco(marcos, k + 1);
          return <div key={k} style={{ fontFamily: FT.sans, fontWeight: 600, fontSize: 38, color: k === (c.linhas.length - 1) ? K.sinal : K.mudo, marginTop: 30, opacity: prog(f, a, a + 14), transform: `translateY(${(1 - prog(f, a, a + 18, EO)) * 20}px)` }}>{l}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** histograma de tiros até vencer, uma série por fala */
export const Histograma: React.FC<LProps> = ({ c, f, marcos }) => {
  const L = 200, T = 190, W = 1520, H = 590;
  const x0 = c.xr[0], x1 = c.xr[1];
  const px = (v: number) => L + ((v - x0) / (x1 - x0)) * W;
  const ymax = c.ymax;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 110, top: 60, fontFamily: FT.disp, fontWeight: 700, fontSize: 50, color: K.texto, opacity: prog(f, 0, 14) }}>{c.titulo}</div>
      <svg width={LW} height={LH} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={L} x2={L + W} y1={T + H} y2={T + H} stroke={K.linha} strokeWidth={2} />
        {c.xt.map((v: number) => <text key={v} x={px(v)} y={T + H + 40} textAnchor="middle" fontFamily={FT.mono} fontSize={24} fill={K.mudo}>{v}</text>)}
        <text x={L + W / 2} y={T + H + 86} textAnchor="middle" fontFamily={FT.mono} fontSize={24} fill={K.mudo}>{c.xl}</text>
        {c.series.map((s: any, k: number) => {
          const a = marco(marcos, s.fala ?? k);
          const p = prog(f, a, a + 30, EO);
          if (p <= 0) return null;
          const bw = W / (x1 - x0 + 1);
          const media = px(s.media);
          return (
            <g key={k}>
              {s.cont.map((v: number, i: number) => {
                const xv = x0 + i;
                const h = (v / ymax) * H * p;
                return <rect key={i} x={px(xv) - bw / 2 + 1} y={T + H - h} width={bw - 2} height={h} fill={s.cor} opacity={0.75} rx={2} />;
              })}
              <line x1={media} x2={media} y1={T + H} y2={T + 20} stroke={s.cor} strokeWidth={3} strokeDasharray="8 8" opacity={p} />
              <text x={media} y={T + 6 + (s.y_rot || 0)} textAnchor="middle" fontFamily={FT.disp} fontWeight={700} fontSize={36} fill={s.cor} opacity={p}>{s.nome}</text>
              <text x={media} y={T + 40 + (s.y_rot || 0)} textAnchor="middle" fontFamily={FT.mono} fontWeight={700} fontSize={24} fill={K.texto} opacity={p}>avg {fmtL(s.media, 0)}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
