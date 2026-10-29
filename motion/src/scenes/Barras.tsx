import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W } from '../lib/theme';
import { prog, spr, EO, clamp, wob, fmt } from '../lib/anim';
import { Fundo, Titulo, Poeira } from '../comp/base';
import type { CenaProps } from '../lib/types';

/** Barras 3D isométricas que crescem com mola, contador no topo */
export const Barras: React.FC<CenaProps> = ({ c, f, dur }) => {
  const itens: [string, number, boolean][] = c.itens;
  const n = itens.length;
  const mx = Math.max(...itens.map((i) => i[1]));
  const base = 1140, alt = 560;
  const bw = n === 2 ? 230 : n === 3 ? 180 : 150;
  const prof = 46;
  const gap = (W - 160 - n * bw) / (n + 1);
  const t = f / 30;
  const orbita = wob(t * 0.5, 4) * 6;
  return (
    <AbsoluteFill>
      <Fundo f={f} />
      <Poeira f={f} n={24} cor={C.muted} />
      {/* chão em perspectiva */}
      <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d3247" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0a1622" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`40,${base} ${W - 40},${base} ${W + 200},${base + 260} -200,${base + 260}`} fill="url(#chao)" />
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <line key={k} x1={70} x2={W - 70} y1={base - alt * k} y2={base - alt * k} stroke={C.muted} strokeOpacity={0.1 * prog(f, 0, 20)} strokeDasharray="6 10" />
        ))}
        <line x1={50} x2={(W - 50) * prog(f, 0, 18, EO)} y1={base} y2={base} stroke={C.muted} strokeOpacity={0.6} strokeWidth={3} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${orbita}px)` }}>
        {itens.map(([lab, v, dest], i) => {
          const ini = -2 + i * 8;
          const s = spr(f, ini, { damping: 14, stiffness: 90, mass: 1.1 });
          const h = Math.max(6, (v / mx) * alt * s);
          const x = 80 + gap * (i + 1) + bw * i;
          const cor = dest ? C.amber : '#4f6d88';
          const lado = dest ? '#b97412' : '#344b61';
          const topo = dest ? '#ffd88a' : '#7b97b1';
          const val = v * prog(f, ini, ini + 30, EO);
          const dx = prof + orbita * 0.6, dy = -prof * 0.62;
          return (
            <React.Fragment key={i}>
              <svg width={W} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                {dest && <rect x={x - 20} y={base - h - 20} width={bw + 40} height={h + 20} fill={C.amber} opacity={0.18 * s} style={{ filter: 'blur(24px)' }} />}
                <polygon points={`${x + bw},${base} ${x + bw + dx},${base + dy} ${x + bw + dx},${base - h + dy} ${x + bw},${base - h}`} fill={lado} />
                <polygon points={`${x},${base - h} ${x + dx},${base - h + dy} ${x + bw + dx},${base - h + dy} ${x + bw},${base - h}`} fill={topo} />
                <defs>
                  <linearGradient id={`fr${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor={cor} />
                    <stop offset="1" stopColor={dest ? '#e79d25' : '#456279'} />
                  </linearGradient>
                </defs>
                <rect x={x} y={base - h} width={bw} height={h} fill={`url(#fr${i})`} />
                {/* brilho que sobe pela barra */}
                
                <rect x={x + 10} y={base - h + 10} width={6} height={Math.max(0, h - 20)} fill="#fff" opacity={0.18} />
              </svg>
              <div style={{ position: 'absolute', left: x - 40, width: bw + 80 + prof, top: base - h - 112, textAlign: 'center', opacity: clamp(s * 2), fontFamily: F.cond, fontWeight: 900, fontSize: n > 2 ? 70 : 84, color: dest ? C.amber : C.white, textShadow: dest ? `0 0 30px ${C.amber}88` : '0 4px 16px rgba(0,0,0,0.7)', whiteSpace: 'nowrap' }}>
                {fmt(val, c.decimais || 0)}
                <span style={{ fontSize: n > 2 ? 34 : 40, fontWeight: 700, marginLeft: 4 }}>{(c.unidade || '').trim()}</span>
              </div>
              <div style={{ position: 'absolute', left: x - 30, width: bw + 60 + prof * 0.5, top: base + 26, textAlign: 'center', opacity: prog(f, ini + 6, ini + 18), fontFamily: F.cond, fontWeight: 700, fontSize: n > 2 ? 34 : 40, lineHeight: 1.05, color: dest ? C.white : C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{lab}</div>
            </React.Fragment>
          );
        })}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};
