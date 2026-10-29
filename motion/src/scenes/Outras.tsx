import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, COR } from '../lib/theme';
import { prog, spr, EO, EIO, clamp, wob, lerp, rnd } from '../lib/anim';
import { Fundo, Titulo, Poeira, Choque, Logo, Raios } from '../comp/base';
import type { CenaProps } from '../lib/types';

/* ---------------- linha do tempo ---------------- */
export const Linha: React.FC<CenaProps> = ({ c, f, dur }) => {
  const ev: [number, string][] = c.eventos;
  const n = ev.length;
  const a0 = ev[0][0], a1 = ev[n - 1][0];
  const span = Math.max(1, a1 - a0);
  const x0 = 110, x1 = 970, y = 1010;
  const X = (ano: number) => lerp(x0 + 40, x1 - 40, (ano - a0) / span);
  const tEv = ev.map((_, k) => (n === 1 ? 10 : 10 + (k * (dur - 40)) / (n - 1)));
  // posição da cabeça (por trechos)
  let ano = a0;
  let k0 = 0;
  for (let k = 0; k < n - 1; k++) {
    if (f >= tEv[k]) {
      k0 = k;
      ano = lerp(ev[k][0], ev[k + 1][0], prog(f, Math.max(tEv[k] + 4, tEv[k + 1] - 16), tEv[k + 1], EIO));
    }
  }
  if (f >= tEv[n - 1]) { ano = a1; k0 = n - 1; }
  const atual = ev.reduce((m, e, k) => (f >= tEv[k] ? k : m), 0);
  const hx = X(ano);
  const t = f / 30;
  const reg = prog(f, 0, 16, EO);
  const passo = span <= 12 ? 1 : span <= 40 ? 1 : span <= 120 ? 5 : 10;
  const ticks: number[] = [];
  for (let a = Math.ceil((a0 - 2) / passo) * passo; a <= a1 + 2; a += passo) ticks.push(a);
  const trocou = f - tEv[atual];
  const sLab = spr(trocou, 0, { damping: 12, stiffness: 200 });
  return (
    <AbsoluteFill>
      <Fundo f={f} />
      <Raios f={f} cor={C.amber} y={33} forca={0.6} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${wob(t * 0.6, 1) * 6}px, ${wob(t * 0.5, 2) * 5}px)` }}>
        <div style={{ position: 'absolute', width: W, top: 470, textAlign: 'center', fontFamily: F.cond, fontWeight: 900, fontSize: 250, lineHeight: 1, color: C.amber, textShadow: `0 0 60px ${C.amber}77`, fontVariantNumeric: 'tabular-nums', transform: `scale(${0.6 + 0.4 * spr(f, 2)})` }}>{Math.round(ano)}</div>
        <div style={{ position: 'absolute', width: W, top: 735, textAlign: 'center', opacity: clamp(sLab * 2), transform: `translateY(${(1 - sLab) * 30}px)` }}>
          {ev[atual][1].split('\n').map((l, i) => (
            <div key={i} style={{ fontFamily: F.cond, fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: C.white, textTransform: 'uppercase', letterSpacing: 2 }}>{l}</div>
          ))}
        </div>
        <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <line x1={x0} x2={lerp(x0, x1, reg)} y1={y} y2={y} stroke="#2c4359" strokeWidth={10} strokeLinecap="round" />
          {ticks.map((a, i) => {
            const x = X(a);
            if (x < x0 || x > x1) return null;
            const grande = a % (passo * 5) === 0 || ev.some((e) => e[0] === a);
            return <line key={i} x1={x} x2={x} y1={y + 16} y2={y + (grande ? 44 : 28)} stroke={C.muted} strokeOpacity={0.5 * prog(f, i * 0.3, i * 0.3 + 10)} strokeWidth={grande ? 3 : 2} />;
          })}
          <line x1={x0} x2={hx} y1={y} y2={y} stroke={C.amber} strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.amber})` }} />
          {ev.map(([a], k) => {
            const s = spr(f, tEv[k], { damping: 9, stiffness: 240 });
            if (f < tEv[k]) return <circle key={k} cx={X(a)} cy={y} r={12} fill="#2c4359" />;
            return <circle key={k} cx={X(a)} cy={y} r={12 + 12 * s} fill={C.amber} stroke={C.navy} strokeWidth={6} />;
          })}
          <circle cx={hx} cy={y} r={14} fill="#fff" style={{ filter: `drop-shadow(0 0 14px ${C.amber}) drop-shadow(0 0 4px #fff)` }} />
        </svg>
        {ev.map(([a], k) => {
          const s = spr(f, tEv[k] + 2, { damping: 12, stiffness: 200 });
          if (f < tEv[k]) return null;
          return (
            <div key={k} style={{ position: 'absolute', left: clamp(X(a) - 80, 30, W - 190), width: 160, top: y + 58, textAlign: 'center', transform: `translateY(${(1 - s) * 20}px)`, opacity: clamp(s * 2), fontFamily: F.cond, fontWeight: 800, fontSize: 44, color: k === atual ? C.amber : C.muted }}>{a}</div>
          );
        })}
        {ev.map((_, k) => <Choque key={k} f={f} ini={tEv[k]} x={X(ev[k][0])} y={y} cor={C.amber} tam={300} />)}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};

/* ---------------- lista ---------------- */
export const Lista: React.FC<CenaProps> = ({ c, f, dur }) => {
  const itens: string[] = c.itens;
  const n = itens.length;
  const sequencia = /how|steps|works/i.test(c.titulo || '');
  const tk = itens.map((_, k) => -2 + (k * (dur - 26)) / n);
  const h = n > 3 ? 150 : 170, gap = 30;
  const top = 560 + (4 - n) * 50;
  const t = f / 30;
  return (
    <AbsoluteFill>
      <Fundo f={f} />
      <Poeira f={f} n={26} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${wob(t * 0.6, 1) * 5}px, ${wob(t * 0.5, 2) * 5}px)` }}>
        {sequencia && (
          <div style={{ position: 'absolute', left: 140, top: top + h / 2, width: 6, height: (n - 1) * (h + gap) * prog(f, tk[0], tk[n - 1] + 10, EIO), background: C.amber, borderRadius: 3, boxShadow: `0 0 12px ${C.amber}` }} />
        )}
        {itens.map((it, k) => {
          const s = spr(f, tk[k], { damping: 13, stiffness: 170 });
          if (f < tk[k]) return null;
          const yy = top + k * (h + gap);
          const atual = k === itens.reduce((m, _, i) => (f >= tk[i] ? i : m), 0);
          return (
            <div key={k} style={{ position: 'absolute', left: 90, width: W - 180, top: yy, height: h, display: 'flex', alignItems: 'center', gap: 30, transform: `translateX(${(1 - s) * 420}px) rotate(${(1 - s) * 3}deg)`, opacity: clamp(s * 2) }}>
              <div style={{ width: 100, height: 100, flex: '0 0 100px', borderRadius: 50, background: atual ? C.amber : '#1d3348', border: `4px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.cond, fontWeight: 900, fontSize: 56, color: atual ? C.navy : C.amber, boxShadow: atual ? `0 0 34px ${C.amber}` : 'none' }}>{sequencia ? k + 1 : '✕'}</div>
              <div style={{ flex: 1, height: h - 20, display: 'flex', alignItems: 'center', padding: '0 30px', background: atual ? 'rgba(242,179,61,0.14)' : 'rgba(8,18,30,0.78)', border: `2px solid ${atual ? C.amber : '#24384b'}`, borderRadius: 18, fontFamily: F.cond, fontWeight: 800, fontSize: it.length > 22 ? 46 : 54, lineHeight: 1.05, color: C.white, textTransform: 'uppercase', letterSpacing: 1 }}>{it}</div>
            </div>
          );
        })}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};

/* ---------------- seção de túneis ---------------- */
export const Secao: React.FC<CenaProps> = ({ c, f }) => {
  const circ: [string, number, string][] = c.circulos;
  const n = circ.length;
  const passo = W / (n + 1);
  const t = f / 30;
  const z = 1 + 0.06 * prog(f, 0, 150, (x) => x);
  return (
    <AbsoluteFill>
      <Fundo f={f} grade={false} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z}) translate(${wob(t * 0.6, 1) * 5}px, ${wob(t * 0.5, 2) * 5}px)` }}>
        <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="giz" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a8f86" />
              <stop offset="1" stopColor="#4c5148" />
            </linearGradient>
            <radialGradient id="tun" cx="0.5" cy="0.45" r="0.6">
              <stop offset="0" stopColor="#25384a" />
              <stop offset="1" stopColor="#070d14" />
            </radialGradient>
          </defs>
          <rect x={0} y={640} width={W} height={600} fill="url(#giz)" opacity={prog(f, 0, 14)} />
          {Array.from({ length: 14 }).map((_, k) => (
            <path key={k} d={`M0,${660 + k * 42} Q270,${650 + k * 42 + 10 * Math.sin(k * 2)} 540,${660 + k * 42} T1080,${660 + k * 42}`} stroke="#000" strokeOpacity={0.12} strokeWidth={2} fill="none" />
          ))}
          <rect x={0} y={560} width={W} height={80} fill="#1f5f96" opacity={prog(f, 0, 14)} />
          <text x={34} y={612} fill="#cfe9ff" fontFamily={F.cond} fontWeight={700} fontSize={32} letterSpacing={3} opacity={prog(f, 8, 20)}>SEA</text>
          {circ.map(([, r], k) => {
            const s = spr(f, 8 + k * 10, { damping: 11, stiffness: 160 });
            const x = passo * (k + 1), y = 930, rr = r * 0.95 * s;
            const cor = COR[circ[k][2]] || C.amber;
            return (
              <g key={k}>
                <circle cx={x} cy={y} r={rr + 16} fill="#2b2f2a" />
                <circle cx={x} cy={y} r={rr} fill="url(#tun)" stroke={cor} strokeWidth={10} style={{ filter: `drop-shadow(0 0 16px ${cor})` }} />
                {circ[k][0].toLowerCase() === 'rail' && s > 0.6 && (
                  <g opacity={prog(f, 22 + k * 10, 34 + k * 10)}>
                    <rect x={x - rr * 0.5} y={y - rr * 0.55} width={rr} height={rr * 1.0} rx={rr * 0.18} fill="#dfe6ec" />
                    <rect x={x - rr * 0.38} y={y - rr * 0.42} width={rr * 0.76} height={rr * 0.34} rx={6} fill="#1b2c3c" />
                    <circle cx={x - rr * 0.28} cy={y + rr * 0.22} r={rr * 0.08} fill="#ffe7a8" />
                    <circle cx={x + rr * 0.28} cy={y + rr * 0.22} r={rr * 0.08} fill="#ffe7a8" />
                    <rect x={x - rr * 0.7} y={y + rr * 0.48} width={rr * 1.4} height={8} fill="#7a8794" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        {circ.map(([lab, r], k) => {
          const s = spr(f, 16 + k * 10, { damping: 12, stiffness: 180 });
          const x = passo * (k + 1);
          return <div key={k} style={{ position: 'absolute', left: x - 150, width: 300, top: 930 + r + 50, textAlign: 'center', opacity: clamp(s * 2), transform: `translateY(${(1 - s) * 20}px)`, fontFamily: F.cond, fontWeight: 800, fontSize: 46, letterSpacing: 2, color: COR[circ[k][2]] || C.white, textTransform: 'uppercase', textShadow: '0 3px 12px rgba(0,0,0,0.9)' }}>{lab}</div>;
        })}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};

/* ---------------- comportas do MOSE (corte) ---------------- */
export const Comportas: React.FC<CenaProps> = ({ c, f, dur }) => {
  const sobe = c.sobe === false ? 0 : prog(f, (c.inicio ?? 0.6) * 30, (c.inicio ?? 0.6) * 30 + 75, EIO);
  const ar = c.sobe === false ? 0 : prog(f, (c.inicio ?? 0.6) * 30 - 10, (c.inicio ?? 0.6) * 30 + 50, EIO);
  const t = f / 30;
  const fundo = 1180, lag = 880;
  const mar = lerp(880, 790, c.sobe === false ? 0 : prog(f, 0, dur * 0.8, EIO));
  const piv: [number, number] = [600, fundo - 30];
  const L = 360, esp = 54;
  const ang = 46 * sobe; // graus; 0 = deitada apontando para o mar (esquerda)
  const z = 1.0 + 0.08 * prog(f, 0, dur, (x) => x);
  const onda = (y0: number, xa: number, xb: number) => {
    let d = `M${xa},${y0}`;
    for (let x = xa; x <= xb; x += 12) d += `L${x},${y0 + Math.sin(x * 0.03 + f * 0.25) * 5 + Math.sin(x * 0.013 - f * 0.1) * 3}`;
    return d;
  };
  return (
    <AbsoluteFill>
      <Fundo f={f} grade={false} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z}) translate(${wob(t * 0.6, 1) * 5}px, ${wob(t * 0.5, 2) * 5}px)`, transformOrigin: '50% 50%' }}>
        <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="cm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3aa0ec" /><stop offset="1" stopColor="#0b3558" /></linearGradient>
            <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b86c8" /><stop offset="1" stopColor="#0b3558" /></linearGradient>
          </defs>
          {/* mar à esquerda (sobe com a maré), laguna à direita */}
          <path d={`${onda(mar, -40, piv[0])} L${piv[0]},${fundo} L-40,${fundo} Z`} fill="url(#cm)" />
          <path d={`${onda(lag, piv[0], 1120)} L1120,${fundo} L${piv[0]},${fundo} Z`} fill="url(#cl)" />
          <path d={onda(mar, -40, piv[0])} stroke="#cdeeff" strokeWidth={3} fill="none" />
          <path d={onda(lag, piv[0], 1120)} stroke="#cdeeff" strokeWidth={3} fill="none" />
          {/* leito e caixa de concreto */}
          <rect x={-40} y={fundo} width={1160} height={500} fill="#3a3326" />
          <rect x={piv[0] - L - 30} y={fundo - 24} width={L + 90} height={70} fill="#585f66" />
          {/* comporta */}
          <g transform={`translate(${piv[0]} ${piv[1]}) rotate(${ang})`}>
            <rect x={-L} y={-esp / 2} width={L} height={esp} rx={6} fill="#1d2833" stroke={C.amber} strokeWidth={6} />
            <rect x={-L + 6} y={-esp / 2 + 6} width={(L - 12) * (1 - ar)} height={esp - 12} fill={C.water} opacity={0.85} />
            <rect x={-L + 6 + (L - 12) * (1 - ar)} y={-esp / 2 + 6} width={(L - 12) * ar} height={esp - 12} fill="#e8eef3" opacity={0.85} />
            {ar > 0 && ar < 1 && Array.from({ length: 10 }).map((_, k) => {
              const bx = -((f * 6 + k * 37) % (L - 20)) - 10;
              return <circle key={k} cx={bx} cy={Math.sin(k * 3 + f * 0.3) * 12} r={5 + (k % 3) * 2} fill="none" stroke="#fff" strokeWidth={2} opacity={0.8} />;
            })}
          </g>
          <circle cx={piv[0]} cy={piv[1]} r={22} fill="#fff" stroke={C.navy} strokeWidth={6} />
          {/* tubo de ar */}
          {c.sobe !== false && <path d={`M1040,${fundo + 60} L${piv[0] + 40},${fundo + 60} L${piv[0] + 40},${piv[1] + 10}`} stroke="#e8eef3" strokeWidth={10} fill="none" strokeDasharray="1 0" opacity={prog(f, 0, 12)} />}
          {c.sobe !== false && ar < 1 && Array.from({ length: 6 }).map((_, k) => {
            const u = ((f * 0.02 + k / 6) % 1);
            const x = lerp(1040, piv[0] + 40, u);
            return <circle key={k} cx={x} cy={fundo + 60} r={7} fill="#fff" opacity={ar > 0 ? 0.9 : 0.5} />;
          })}
        </svg>
        <div style={{ position: 'absolute', left: 60, top: fundo + 90, fontFamily: F.cond, fontWeight: 800, fontSize: 48, letterSpacing: 3, color: C.white, opacity: 0.9 }}>SEA</div>
        <div style={{ position: 'absolute', right: 60, top: fundo + 90, fontFamily: F.cond, fontWeight: 800, fontSize: 48, letterSpacing: 3, color: C.white, opacity: 0.9 }}>LAGOON</div>
        {(() => {
          const s = spr(f, 18, { damping: 12, stiffness: 180 });
          const txt = c.sobe === false ? 'FULL OF WATER' : sobe > 0.95 ? 'GATE UP' : 'AIR IN';
          return <div style={{ position: 'absolute', left: 150, top: fundo - 250 - sobe * 170, padding: '8px 22px', borderRadius: 12, background: c.sobe === false ? C.water : C.amber, color: C.navy, fontFamily: F.cond, fontWeight: 900, fontSize: 46, letterSpacing: 2, transform: `scale(${s})`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{txt}</div>;
        })()}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};

/* ---------------- portões de Roterdã (vista de cima) ---------------- */
export const Portoes: React.FC<CenaProps> = ({ c, f, dur }) => {
  const t = f / 30;
  const y0 = 760, y1 = 1180;
  const fecha = prog(f, 30, Math.min(dur - 30, 140), EIO);
  const z = 1.0 + 0.1 * prog(f, 0, dur, (x) => x);
  const L = (y1 - y0) / 2 - 4;
  return (
    <AbsoluteFill>
      <Fundo f={f} grade={false} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z}) translate(${wob(t * 0.6, 1) * 5}px, ${wob(t * 0.5, 2) * 5}px)` }}>
        <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs><linearGradient id="rio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1f7fc8" /><stop offset="1" stopColor="#134f80" /></linearGradient></defs>
          <rect x={-60} y={y0 - 320} width={1200} height={320} fill="#1f3a2c" />
          <rect x={-60} y={y1} width={1200} height={320} fill="#1f3a2c" />
          <rect x={-60} y={y0} width={1200} height={y1 - y0} fill="url(#rio)" />
          {Array.from({ length: 22 }).map((_, k) => {
            const x = ((f * (2.5 + rnd(k) * 2) + rnd(k + 9) * 1300) % 1300) - 100;
            const yy = y0 + 30 + rnd(k + 3) * (y1 - y0 - 60);
            const bloqueado = fecha > 0.98 && x > 560;
            return bloqueado ? null : <line key={k} x1={x} x2={x + 60} y1={yy} y2={yy} stroke="#bfe6ff" strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" />;
          })}
          {/* docas secas */}
          <rect x={600} y={y0 - 44} width={L + 60} height={44} fill="#2d4a3a" stroke="#4e6b5a" />
          <rect x={600} y={y1} width={L + 60} height={44} fill="#2d4a3a" stroke="#4e6b5a" />
          {[[620, y0, 1], [620, y1, -1]].map(([px, py, sg], k) => {
            const a = (sg * 90 * fecha * Math.PI) / 180; // 0 = deitado ao longo da margem (para a cidade)
            const pts: string[] = [];
            for (let i = 0; i <= 20; i++) {
              const u = i / 20, r = L * u;
              const bojo = Math.sin(Math.PI * u) * 46 * fecha;
              pts.push(`${px + Math.cos(a) * r - bojo},${py + Math.sin(a) * r - sg * 22 * (1 - fecha)}`);
            }
            return (
              <g key={k}>
                <polyline points={pts.join(' ')} fill="none" stroke={C.amber} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${C.amber}aa)` }} />
                <circle cx={px} cy={py - sg * 22 * (1 - fecha)} r={22} fill="#fff" stroke={C.navy} strokeWidth={5} />
              </g>
            );
          })}
          {fecha > 0.95 && [0, 1, 2].map((k) => {
            const p = ((f * 0.03 + k / 3) % 1);
            const x = lerp(120, 470, p);
            const yy = y0 + 110 + k * 100;
            return <polygon key={k} points={`${x},${yy - 26} ${x + 60},${yy} ${x},${yy + 26}`} fill={C.red} opacity={0.85 * (1 - p)} />;
          })}
        </svg>
        <div style={{ position: 'absolute', left: 50, top: (y0 + y1) / 2 - 32, fontFamily: F.cond, fontWeight: 800, fontSize: 52, letterSpacing: 3, color: C.white }}>SEA</div>
        <div style={{ position: 'absolute', right: 40, top: (y0 + y1) / 2 - 32, fontFamily: F.cond, fontWeight: 800, fontSize: 52, letterSpacing: 3, color: C.white }}>CITY</div>
        {(() => {
          const s = spr(f, Math.min(dur - 30, 140) - 4, { damping: 10, stiffness: 200 });
          return <div style={{ position: 'absolute', left: 300, width: 480, top: y0 - 170, textAlign: 'center', padding: '8px 0', borderRadius: 12, background: C.amber, color: C.navy, fontFamily: F.cond, fontWeight: 900, fontSize: 46, letterSpacing: 2, transform: `scale(${s})` }}>SHUT AUTOMATICALLY</div>;
        })()}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};

/* ---------------- chamada final ---------------- */
export const Cta: React.FC<CenaProps> = ({ f, c }) => {
  const s = spr(f, 2, { damping: 10, stiffness: 140 });
  const nome = prog(f, 8, 26, EO);
  const lin = prog(f, 16, 30, EO);
  const b = spr(f, 20, { damping: 9, stiffness: 200 });
  const toque = 44;
  const clicou = f >= toque;
  const cur = prog(f, 26, toque, EIO);
  const pulso = clicou ? 1 + 0.05 * (1 - spr(f, toque, { damping: 6, stiffness: 300 })) : 1 + 0.03 * Math.sin(f * 0.3);
  return (
    <AbsoluteFill>
      <Fundo f={f} />
      <Raios f={f} cor={C.amber} y={34} forca={s} />
      <Poeira f={f} n={40} />
      {[0, 1, 2].map((k) => {
        const ph = ((f / 50 + k / 3) % 1);
        const r = 200 + ph * 260;
        return <div key={k} style={{ position: 'absolute', left: 540 - r, top: 640 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `2px solid ${C.amber}`, opacity: (1 - ph) * 0.5 * s }} />;
      })}
      <div style={{ position: 'absolute', left: 540 - 170, top: 640 - 170, transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, filter: `drop-shadow(0 0 40px ${C.amber}66)` }}>
        <Logo tam={340} />
      </div>
      <div style={{ position: 'absolute', width: W, top: 850, textAlign: 'center', fontFamily: F.cond, fontWeight: 900, fontSize: 104, letterSpacing: lerp(30, 4, nome), color: C.white, opacity: nome, textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>CONCRETE ATLAS</div>
      <div style={{ position: 'absolute', width: W, top: 975, textAlign: 'center', fontFamily: F.sans, fontWeight: 600, fontSize: 42, color: C.amber, opacity: lin, transform: `translateY(${(1 - lin) * 20}px)` }}>{c.linha || 'A new megaproject every day'}</div>
      {c.pergunta && <div style={{ position: 'absolute', width: W, top: 1240, textAlign: 'center', opacity: prog(f, 50, 62), transform: `translateY(${(1 - prog(f, 50, 62, EO)) * 20}px)`, fontFamily: F.cond, fontWeight: 800, fontSize: 46, color: C.white, padding: '0 80px' }}>💬 {c.pergunta}</div>}
      <div style={{ position: 'absolute', left: 540 - 230, top: 1080, width: 460, height: 120, borderRadius: 60, background: clicou ? '#2b3e52' : C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, transform: `scale(${b * pulso})`, boxShadow: clicou ? 'none' : `0 0 50px ${C.red}88`, fontFamily: F.cond, fontWeight: 900, fontSize: 60, letterSpacing: 3, color: '#fff' }}>
        {clicou ? 'FOLLOWING ✓' : 'FOLLOW'}
      </div>
      <Choque f={f} ini={toque} x={540} y={1140} cor={C.white} tam={500} />
      {f > 24 && (
        <svg width={90} height={110} style={{ position: 'absolute', left: lerp(860, 600, cur), top: lerp(1420, 1150, cur) + (clicou ? 8 * (1 - prog(f, toque, toque + 8)) : 0), opacity: prog(f, 24, 30) * (1 - prog(f, toque + 20, toque + 30)), filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
          <path d="M8,4 L8,78 L28,60 L42,94 L56,88 L42,56 L68,56 Z" fill="#fff" stroke="#0a0f15" strokeWidth={5} strokeLinejoin="round" />
        </svg>
      )}
    </AbsoluteFill>
  );
};
