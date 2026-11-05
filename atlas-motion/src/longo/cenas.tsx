import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import { K, SET, FT, LW, LH, marco, fmtL, LOC } from './tema';
import type { LProps } from './tema';
import { prog, spr, wob, EO, EIO, lerp, clamp, rnd, fmt } from '../lib/anim';
import { EUA, Estado, Dispersao, Serie } from './eua';
import { Foto, Documento, Contagem, Veredito } from './historia';
import { Gancho, GanchoGas, GanchoRio, GanchoLSS, GanchoQVD } from './gancho';
import { Naval, Calor, Histograma } from './naval';

// ───────────────────────── peças comuns ─────────────────────────
const corDe = (c: string) => SET[c] || c || K.texto;

export const Fundo: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${K.bg2} 0%, ${K.bg} 70%)` }}>
    <AbsoluteFill style={{ opacity: 0.55, backgroundImage: `url(${staticFile('fx/pontos.png')})`, backgroundSize: '36px 36px' }} />
  </AbsoluteFill>
);

const Sobe: React.FC<{ f: number; a?: number; d?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, a = 0, d = 18, children, style }) => {
  const p = prog(f, a, a + d, EO);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 28}px)`, ...style }}>{children}</div>;
};

const Rotulo: React.FC<{ children: React.ReactNode; cor?: string; tam?: number; style?: React.CSSProperties }> = ({ children, cor = K.mudo, tam = 24, style }) => (
  <div style={{ fontFamily: FT.mono, fontWeight: 500, fontSize: tam, letterSpacing: 2, color: cor, ...style }}>{children}</div>
);

const Titulo: React.FC<{ f: number; texto?: string; y?: number }> = ({ f, texto, y = 92 }) =>
  texto ? (
    <div style={{ position: 'absolute', top: y, left: 120, right: 120 }}>
      <Sobe f={f}><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 54, color: K.texto, letterSpacing: -0.5 }}>{texto}</div></Sobe>
      <div style={{ height: 4, width: 120 * prog(f, 4, 26, EO), background: K.sinal, marginTop: 14, borderRadius: 2 }} />
    </div>
  ) : null;

/** número que rola até o valor */
const Conta: React.FC<{ f: number; valor: number; a: number; d?: number; dec?: number; pre?: string; suf?: string; tam: number; cor?: string; fonte?: string }> = ({ f, valor, a, d = 40, dec = 0, pre = '', suf = '', tam, cor = K.texto, fonte = FT.disp }) => {
  const p = prog(f, a, a + d, EO);
  return (
    <span style={{ fontFamily: fonte, fontWeight: 700, fontSize: tam, color: cor, fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
      {pre}{fmtL(valor * p, dec)}{suf}
    </span>
  );
};

// ───────────────────────── tabuleiro ─────────────────────────
// casas 0..39 no anel: 0 canto inferior direito, anda para a esquerda (padrão do jogo)
const GRUPO = ['go', 'brown', 'cc', 'brown', 'tax', 'rr', 'lightblue', 'ch', 'lightblue', 'lightblue', 'jail', 'pink', 'util', 'pink', 'pink', 'rr', 'orange', 'cc', 'orange', 'orange',
  'free', 'red', 'ch', 'red', 'red', 'rr', 'yellow', 'yellow', 'util', 'yellow', 'gtj', 'green', 'green', 'cc', 'green', 'rr', 'ch', 'darkblue', 'tax', 'darkblue'];
const CANTO: Record<number, string> = { 0: 'GO', 10: 'JAIL', 20: 'FREE', 30: 'GO TO\nJAIL' };
const TAB = 820, CN = 112, CEL = (TAB - 2 * CN) / 9;

const casaRect = (i: number) => {
  // devolve x,y,w,h e o lado (para a faixa de cor do lado de dentro)
  const lado = Math.floor(i / 10), k = i % 10;
  if (k === 0) {
    const pos = [[TAB - CN, TAB - CN], [0, TAB - CN], [0, 0], [TAB - CN, 0]][lado];
    return { x: pos[0], y: pos[1], w: CN, h: CN, lado: -1 };
  }
  const off = CN + (k - 1) * CEL;
  if (lado === 0) return { x: TAB - off - CEL, y: TAB - CN, w: CEL, h: CN, lado: 0 };
  if (lado === 1) return { x: 0, y: TAB - off - CEL, w: CN, h: CEL, lado: 1 };
  if (lado === 2) return { x: off, y: 0, w: CEL, h: CN, lado: 2 };
  return { x: TAB - CN, y: off, w: CN, h: CEL, lado: 3 };
};
const centro = (i: number) => { const r = casaRect(i); return [r.x + r.w / 2, r.y + r.h / 2]; };

export const Tabuleiro: React.FC<LProps> = ({ c, f, dur, marcos }) => {
  const prob: number[] = c.prob || new Array(40).fill(0.025);
  const foco: number[] = c.foco || [];
  const modo = c.modo;
  const t = f / 30;
  const ent = prog(f, 0, 30, EO);
  const tilt = modo === 'igual' ? lerp(0, 34, ent) : 34;
  const giro = -8 + wob(t * 0.15, 4) * 3 + (modo === 'final' ? lerp(0, 12, prog(f, 0, dur, (x) => x)) : 0);
  const esc = 0.98 + 0.03 * prog(f, 0, dur, (x) => x);
  const calor = modo !== 'igual';
  const pCalor = calor ? prog(f, modo === 'calor' && !c.numero ? marco(marcos, 1) - 10 : 0, (modo === 'calor' && !c.numero ? marco(marcos, 1) : 0) + 50, EO) : 0;
  const maxP = Math.max(...prob);
  const temFoco = foco.length > 0;
  const pFoco = temFoco ? prog(f, 8, 30, EO) : 0;
  const grupoFoco: string | undefined = c.grupo;
  const corCasa = (i: number) => {
    const g = GRUPO[i];
    return SET[g] || (g === 'jail' ? K.sinal : '#3a4256');
  };
  const dim = (i: number) => (temFoco && !foco.includes(i) && GRUPO[i] !== grupoFoco ? lerp(1, 0.28, pFoco) : 1);

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 170, top: (LH - TAB) / 2 - 30, width: TAB, height: TAB, transform: `perspective(2200px) rotateX(${tilt}deg) rotateZ(${giro}deg) scale(${esc * 0.9})`, transformOrigin: '50% 50%' }}>
        <svg width={TAB} height={TAB} style={{ overflow: 'visible' }}>
          <defs>
            <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
          </defs>
          <rect x={-14} y={-14} width={TAB + 28} height={TAB + 28} rx={18} fill={K.painel} stroke={K.linha} strokeWidth={2} />
          <rect x={CN} y={CN} width={TAB - 2 * CN} height={TAB - 2 * CN} fill={K.bg} opacity={0.6} />
          {/* barras de calor para o centro */}
          {calor && prob.map((p, i) => {
            if (i === 30) return null;
            const r = casaRect(i);
            const L = (p / maxP) * (TAB / 2 - CN - 20) * pCalor;
            const cor = i === 10 ? K.sinal : corCasa(i);
            const op = dim(i);
            let x = 0, y = 0, w = 0, h = 0;
            const g = 8;
            if (r.lado === 0) { x = r.x + g; w = r.w - 2 * g; y = r.y - L - 6; h = L; }
            else if (r.lado === 1) { y = r.y + g; h = r.h - 2 * g; x = r.x + r.w + 6; w = L; }
            else if (r.lado === 2) { x = r.x + g; w = r.w - 2 * g; y = r.y + r.h + 6; h = L; }
            else if (r.lado === 3) { y = r.y + g; h = r.h - 2 * g; x = r.x - L - 6; w = L; }
            else {
              // cantos: barra diagonal representada como quadrado crescente
              const s = Math.min(L * 0.75, 150);
              const [cx, cy] = [i === 0 ? r.x - s / 2 - 8 : i === 10 ? r.x + r.w + 8 + s / 2 : r.x + r.w + 8 + s / 2, i === 0 || i === 10 ? r.y - s / 2 - 8 : r.y + r.h + 8 + s / 2];
              return <g key={i} opacity={op}><rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx={6} fill={cor} opacity={0.9} />{i === 10 && <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx={6} fill={cor} filter="url(#brilho)" opacity={0.7 * pCalor} />}</g>;
            }
            return <rect key={i} x={x} y={y} width={Math.max(0, w)} height={Math.max(0, h)} rx={4} fill={cor} opacity={0.85 * op} />;
          })}
          {/* casas */}
          {GRUPO.map((g, i) => {
            const r = casaRect(i);
            const cor = corCasa(i);
            const faixa = SET[g] && g !== 'rr' && g !== 'util';
            const fs = 16;
            let fx = r.x, fy = r.y, fw = r.w, fh = r.h;
            if (r.lado === 0) fh = fs; else if (r.lado === 1) { fx = r.x + r.w - fs; fw = fs; } else if (r.lado === 2) { fy = r.y + r.h - fs; fh = fs; } else if (r.lado === 3) fw = fs;
            const pulso = modo === 'igual' ? 0.5 + 0.5 * Math.sin(t * 3 + i * 0.6) : 0;
            const destac = foco.includes(i) || (grupoFoco && g === grupoFoco);
            return (
              <g key={i} opacity={dim(i)}>
                <rect x={r.x + 1.5} y={r.y + 1.5} width={r.w - 3} height={r.h - 3} rx={4} fill={destac ? '#232c40' : '#1b2131'} stroke={destac ? cor : K.linha} strokeWidth={destac ? 3 : 1.2} />
                {faixa && <rect x={fx + 1.5} y={fy + 1.5} width={fw - 3} height={fh - 3} rx={3} fill={cor} />}
                {(g === 'rr' || g === 'util') && <circle cx={r.x + r.w / 2} cy={r.y + r.h / 2} r={9} fill="none" stroke={cor} strokeWidth={3} />}
                {(g === 'ch' || g === 'cc') && <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 9} textAnchor="middle" fontFamily={FT.disp} fontWeight={700} fontSize={26} fill={K.fraco}>{g === 'ch' ? '?' : '♦'}</text>}
                {modo === 'igual' && <rect x={r.x + 6} y={r.y + 6} width={r.w - 12} height={r.h - 12} rx={3} fill={K.sinal} opacity={0.08 + 0.1 * pulso} />}
                {r.lado === -1 && CANTO[i].split('\n').map((l, k, arr) => (
                  <text key={k} x={r.x + r.w / 2} y={r.y + r.h / 2 + 8 + (k - (arr.length - 1) / 2) * 22} textAnchor="middle" fontFamily={FT.mono} fontWeight={700} fontSize={i === 10 ? 22 : 18} fill={i === 10 ? K.sinal : K.mudo}>{l}</text>
                ))}
              </g>
            );
          })}
          {/* saída da prisão: setas +6 +8 +9 */}
          {modo === 'saida' && [16, 18, 19].map((dest, k) => {
            const p = prog(f, 10 + k * 14, 40 + k * 14, EO);
            const [x0, y0] = centro(10), [x1, y1] = centro(dest);
            const mx = (x0 + x1) / 2 + 60, my = (y0 + y1) / 2 + 40 + k * 18;
            const d = `M${x0},${y0} Q${mx},${my} ${x1},${y1}`;
            return (
              <g key={dest}>
                <path d={d} fill="none" stroke={SET.orange} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                <text x={x1 + 40} y={y1 + 8} fontFamily={FT.mono} fontWeight={700} fontSize={26} fill={SET.orange} opacity={prog(f, 30 + k * 14, 44 + k * 14)}>+{dest - 10}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* textos laterais */}
      {modo === 'igual' && (
        <div style={{ position: 'absolute', left: 1120, top: 360, width: 680, opacity: prog(f, marco(marcos, 1) - 6, marco(marcos, 1) + 12, EO) }}>
          <Conta f={f} valor={2.5} a={marco(marcos, 1)} d={30} dec={1} suf="%" tam={190} cor={K.sinal} />
          <div style={{ fontFamily: FT.disp, fontWeight: 500, fontSize: 44, color: K.texto, marginTop: 4 }}>per square, if only the dice mattered</div>
        </div>
      )}
      {c.frase && (
        <div style={{ position: 'absolute', left: 1120, top: 380, width: 700 }}>
          {String(c.frase).split('\n').map((l: string, k: number) => (
            <Sobe key={k} f={f} a={marco(marcos, k)}><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 64, lineHeight: 1.1, color: k === 0 ? K.sinal : K.texto, marginBottom: 26 }}>{l}</div></Sobe>
          ))}
        </div>
      )}
      {c.numero && (
        <div style={{ position: 'absolute', left: 1080, top: 330, width: 720 }}>
          <Sobe f={f} a={marco(marcos, 1) - 8}>
            <Conta f={f} valor={c.numero.valor} a={marco(marcos, 1) - 4} d={45} dec={c.numero.dec} suf={c.numero.sufixo} tam={190} cor={K.sinal} />
            <div style={{ fontFamily: FT.disp, fontWeight: 500, fontSize: 44, color: K.texto, marginTop: 4 }}>{c.numero.rotulo}</div>
          </Sobe>
          <Sobe f={f} a={marco(marcos, 2)} style={{ marginTop: 48 }}>
            {['Go To Jail square', '2 cards: Chance + Community Chest', 'Three doubles in a row'].map((s, k) => (
              <div key={k} style={{ opacity: prog(f, marco(marcos, 2) + k * 22, marco(marcos, 2) + k * 22 + 14), display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, fontFamily: FT.sans, fontWeight: 600, fontSize: 34, color: K.mudo }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: K.sinal }} />{s}
              </div>
            ))}
          </Sobe>
        </div>
      )}
      {modo === 'saida' && (
        <div style={{ position: 'absolute', left: 1120, top: 300, width: 680 }}>
          <Sobe f={f} a={6}><Rotulo cor={SET.orange} tam={28}>OUT OF JAIL</Rotulo></Sobe>
          {['St. James Place', 'Tennessee Ave', 'New York Ave'].map((s, k) => (
            <Sobe key={k} f={f} a={marco(marcos, 1) + k * 16} style={{ marginTop: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <div style={{ width: 22, height: 64, borderRadius: 5, background: SET.orange }} />
                <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 58, color: K.texto }}>{s}</div>
              </div>
            </Sobe>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ───────────────────────── dados (2..12) ─────────────────────────
export const Dados: React.FC<LProps> = ({ f, marcos }) => {
  const formas = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
  const m1 = marco(marcos, 1);
  const destaque = (s: number) => {
    if (f < m1) return 0.9;
    const k = f - m1;
    if (s === 7) return 1;
    if (s === 6 || s === 8) return k > 40 ? 1 : 0.35;
    if (s === 5 || s === 9) return k > 80 ? 1 : 0.35;
    return 0.25;
  };
  const bw = 104, gap = 22, base = 860, x0 = (LW - (11 * bw + 10 * gap)) / 2;
  return (
    <AbsoluteFill>
      <Titulo f={f} texto="Every roll of two dice, out of 36" />
      {formas.map((n, i) => {
        const s = i + 2;
        const h = n * 82 * prog(f, 6 + i * 3, 36 + i * 3, EO);
        const op = destaque(s);
        const cor = s === 7 ? K.sinal : (s === 6 || s === 8 || s === 5 || s === 9) && f > m1 ? SET.orange : '#5b6680';
        return (
          <div key={s}>
            <div style={{ position: 'absolute', left: x0 + i * (bw + gap), top: base - h, width: bw, height: h, borderRadius: 10, background: cor, opacity: op }} />
            <div style={{ position: 'absolute', left: x0 + i * (bw + gap), top: base - h - 52, width: bw, textAlign: 'center', fontFamily: FT.mono, fontWeight: 700, fontSize: 28, color: K.texto, opacity: op * prog(f, 30 + i * 3, 44 + i * 3) }}>{n}/36</div>
            <div style={{ position: 'absolute', left: x0 + i * (bw + gap), top: base + 18, width: bw, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 46, color: op > 0.5 ? K.texto : K.fraco }}>{s}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: base + 92, textAlign: 'center' }}><Rotulo>SUM OF TWO DICE</Rotulo></div>
    </AbsoluteFill>
  );
};

// ───────────────────────── barras horizontais ─────────────────────────
type Item = { r: string; v: number; cor: string };
const BarrasH: React.FC<{ f: number; itens: Item[]; x: number; y: number; w: number; max: number; rev: (k: number) => number; foco?: string[]; hBar?: number; unid?: string; linhaRef?: number; tamR?: number; dec?: number }> = ({ f, itens, x, y, w, max, rev, foco, hBar = 70, unid = '%', linhaRef, tamR = 36, dec = 1 }) => {
  const rw = 330;
  const bw = w - rw - 140;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w }}>
      {linhaRef !== undefined && (
        <div style={{ position: 'absolute', left: rw + (linhaRef / max) * bw, top: -40, height: itens.length * (hBar + 18) + 50, borderLeft: `3px dashed ${K.sinal}`, opacity: 0.85 }}>
          <div style={{ position: 'absolute', top: -40, left: -100, width: 200, textAlign: 'center', fontFamily: FT.mono, fontWeight: 700, fontSize: 24, color: K.sinal }}>FAIR SHARE {linhaRef}%</div>
        </div>
      )}
      {itens.map((it, k) => {
        const a = rev(k);
        const p = prog(f, a, a + 26, EO);
        const op = foco ? (foco.includes(it.cor) ? 1 : 0.25) : 1;
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', height: hBar, marginBottom: 18, opacity: op * clamp(p * 3) }}>
            <div style={{ width: rw, fontFamily: FT.disp, fontWeight: 700, fontSize: tamR, color: K.texto, textAlign: 'right', paddingRight: 26 }}>{it.r}</div>
            <div style={{ width: (it.v / max) * bw * p, height: hBar - 14, borderRadius: 8, background: corDe(it.cor), boxShadow: `0 0 30px ${corDe(it.cor)}33` }} />
            <div style={{ marginLeft: 18, fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.texto, opacity: p }}>{fmtL(it.v * p, dec)}{unid}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Barras: React.FC<LProps> = ({ c, f, marcos }) => {
  const itens: Item[] = c.itens || [];
  const max = c.max_v ?? Math.max(55, ...itens.map((i) => i.v)) * 1.05;
  const nf = marcos.length;
  // revela: 1ª barra na fala 0, as seguintes distribuídas nas falas seguintes
  const rev = (k: number) => {
    if (c.quando) return marco(marcos, c.quando[k][0]) + c.quando[k][1];
    if (c.foco) return 4 + k * 3;
    if (c.revela === 'cima2') return k === 0 ? 4 : k === 1 ? 24 : marco(marcos, 1) + (k - 2) * 26;
    if (c.revela === 'cima') return k === 0 ? 10 : k === 1 ? marco(marcos, 1) + 10 : marco(marcos, 2) + (k - 2) * 26;
    return 8 + k * 10;
  };
  const yTop = (LH - itens.length * 88) / 2 + 40;
  return (
    <AbsoluteFill>
      <Titulo f={f} texto={c.titulo || (c.so_ref ? 'If every set were equal…' : 'Win rate by starting color set')} />
      {c.so_ref ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center' }}>
          <Conta f={f} valor={25} a={12} d={40} suf="%" tam={260} cor={K.sinal} />
          <Rotulo tam={34}>1 WIN IN EVERY 4 GAMES</Rotulo>
        </div>
      ) : (
        <BarrasH f={f} itens={itens} x={170} y={yTop} w={1580} max={max} rev={rev} foco={c.foco} hBar={itens.length > 6 ? 70 : 96} linhaRef={c.linha_ref} unid={c.unid ?? '%'} dec={c.dec ?? 1} />
      )}
    </AbsoluteFill>
  );
};

// ───────────────────────── top / fundo ─────────────────────────
export const Top: React.FC<LProps> = ({ c, f, marcos }) => {
  const m1 = marco(marcos, 1);
  return (
    <AbsoluteFill>
      <Titulo f={f} texto={c.titulo} />
      <div style={{ position: 'absolute', left: 120, top: 250 }}><Rotulo cor={K.bom}>MOST VISITED</Rotulo></div>
      <BarrasH f={f} itens={c.itens} x={60} y={300} w={980} max={3.4} rev={(k) => 10 + k * 14} hBar={78} tamR={30} />
      <div style={{ position: 'absolute', left: 1080, top: 250, opacity: prog(f, m1 - 6, m1 + 10) }}><Rotulo cor={K.ruim}>LEAST VISITED</Rotulo></div>
      <BarrasH f={f} itens={c.fundo} x={1020} y={300} w={860} max={3.4} rev={(k) => m1 + k * 18} hBar={78} tamR={30} />
    </AbsoluteFill>
  );
};

// ───────────────────────── degraus (retorno por casas) ─────────────────────────
export const Degraus: React.FC<LProps> = ({ c, f, marcos }) => {
  const grupos: string[] = c.grupos;
  const S: Record<string, number[]> = c.series;
  const max = Math.max(...grupos.flatMap((g) => S[g])) * 1.08;
  const nivel = (h: number) => (h === 0 ? 4 : h <= 2 ? marco(marcos, 1) + (h - 1) * 30 : h === 3 ? marco(marcos, 2) + 20 : marco(marcos, 4) + (h - 4) * 30);
  const x0 = 230, y0 = 900, alt = 600, larg = 1520;
  const gw = larg / 6, bw = (gw - 70) / grupos.length;
  const focoLaranja = prog(f, marco(marcos, 3), marco(marcos, 3) + 16);
  const planos = ['red', 'yellow', 'green', 'darkblue'];
  return (
    <AbsoluteFill>
      <Titulo f={f} texto="Rent per opponent turn, per $1,000 invested" />
      {[0, 10, 20, 30, 40].map((v) => (
        <div key={v} style={{ position: 'absolute', left: x0 - 80, top: y0 - (v / max) * alt - 16, width: larg + 80, opacity: 0.6 }}>
          <span style={{ fontFamily: FT.mono, fontSize: 22, color: K.fraco }}>${v}</span>
          <div style={{ position: 'absolute', left: 70, top: 16, width: larg, borderTop: `1px solid ${K.grade}` }} />
        </div>
      ))}
      {[0, 1, 2, 3, 4, 5].map((h) => {
        const a = nivel(h);
        const p = prog(f, a, a + 30, EO);
        return (
          <div key={h}>
            {grupos.map((g, k) => {
              const v = S[g][h];
              const dimOutros = focoLaranja > 0 && g !== 'orange' ? lerp(1, 0.3, focoLaranja) : 1;
              const dimPlano = f > marco(marcos, 4) + 70 && h >= 4 ? (planos.includes(g) ? 1 : 0.35) : 1;
              const hh = (v / max) * alt * p;
              return (
                <div key={g} style={{ position: 'absolute', left: x0 + h * gw + 35 + k * bw, top: y0 - hh, width: bw - 8, height: hh, borderRadius: '6px 6px 0 0', background: SET[g], opacity: dimOutros * dimPlano }}>
                  {g === 'orange' && focoLaranja > 0 && (h === 2 || h === 3) && (
                    <div style={{ position: 'absolute', top: -52, left: -30, width: bw + 52, textAlign: 'center', fontFamily: FT.mono, fontWeight: 700, fontSize: 30, color: SET.orange, opacity: focoLaranja }}>${Math.round(v)}</div>
                  )}
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: x0 + h * gw, top: y0 + 18, width: gw, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 34, color: h === 3 && f > marco(marcos, 2) ? K.sinal : K.texto, opacity: clamp(p * 2) }}>
              {h === 5 ? 'Hotel' : `${h} house${h === 1 ? '' : 's'}`}
            </div>
          </div>
        );
      })}
      {/* selo x2 no 3º degrau */}
      <div style={{ position: 'absolute', left: x0 + 3 * gw + gw / 2 - 90, top: 240, width: 180, textAlign: 'center', opacity: prog(f, marco(marcos, 2) + 40, marco(marcos, 2) + 56, EO), transform: `scale(${0.6 + 0.4 * spr(f, marco(marcos, 2) + 40)})` }}>
        <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 88, color: K.sinal }}>×2</div>
      </div>
      {/* legenda */}
      <div style={{ position: 'absolute', right: 110, top: 200, display: 'flex', gap: 26 }}>
        {grupos.map((g) => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FT.sans, fontWeight: 600, fontSize: 24, color: K.mudo }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: SET[g] }} />{g === 'lightblue' ? 'Light blue' : g === 'darkblue' ? 'Dark blue' : g[0].toUpperCase() + g.slice(1)}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── 10.000 pontos ─────────────────────────
const CORES8 = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue'];
const useLog = (id: string, arq: string) => {
  const [log, setLog] = useState<number[][] | null>(null);
  const [h] = useState(() => delayRender('log'));
  useEffect(() => {
    fetch(staticFile(`l/${id}/${arq}`)).then((r) => r.json()).then((j) => { setLog(j); continueRender(h); });
  }, [h, id, arq]);
  return log;
};

export const Pontos: React.FC<LProps> = ({ c, f, dur, id }) => {
  const log = useLog(id, c.log);
  const ref = useRef<HTMLCanvasElement>(null);
  const cols = 125, rows = 80, s = 9.6, w = cols * s, h = rows * s;
  const n = log ? Math.floor(10000 * prog(f, 20, Math.min(dur - 60, 420), EIO)) : 0;
  const ordem = useMemo(() => {
    // ordem de preenchimento: varredura com leve aleatoriedade por linha
    const o = Array.from({ length: 10000 }, (_, i) => i);
    return o.sort((a, b) => (Math.floor(a / cols) + rnd(a) * 6) - (Math.floor(b / cols) + rnd(b) * 6));
  }, []);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !log) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 10000; i++) {
      const pos = ordem[i];
      const x = (pos % cols) * s, y = Math.floor(pos / cols) * s;
      if (i < n) {
        const row = log[i];
        ctx.fillStyle = SET[CORES8[row[row[4]]]];
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = '#262e40';
        ctx.globalAlpha = 0.7;
      }
      ctx.fillRect(x + 1, y + 1, s - 2.4, s - 2.4);
    }
  }, [log, n, ordem, w, h]);
  const cont = useMemo(() => {
    const k: Record<string, number> = {};
    CORES8.forEach((c) => (k[c] = 0));
    if (log) for (let i = 0; i < n; i++) { const r = log[i]; k[CORES8[r[r[4]]]]++; }
    return k;
  }, [log, n]);
  const ord = [...CORES8].sort((a, b) => cont[b] - cont[a]);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 110, top: 70, display: 'flex', alignItems: 'baseline', gap: 22 }}>
        <Rotulo tam={30} cor={K.mudo}>GAME</Rotulo>
        <span style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 64, color: K.texto, fontVariantNumeric: 'tabular-nums' }}>{fmtL(n)}</span>
        <span style={{ fontFamily: FT.mono, fontSize: 34, color: K.fraco }}>/ 10,000</span>
      </div>
      <canvas ref={ref} width={w} height={h} style={{ position: 'absolute', left: 110, top: 175, width: w, height: h }} />
      <div style={{ position: 'absolute', left: 1400, top: 175, width: 420 }}>
        <Rotulo tam={24}>WINS BY STARTING SET</Rotulo>
        {ord.map((g, k) => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, transform: `translateY(${0}px)` }}>
            <div style={{ width: 26, height: 26, borderRadius: 5, background: SET[g] }} />
            <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 38, color: K.texto, width: 140, fontVariantNumeric: 'tabular-nums' }}>{fmtL(cont[g])}</div>
            <div style={{ height: 14, width: (cont[g] / 2600) * 220, background: SET[g], borderRadius: 7, opacity: 0.8 }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── matriz de duelos ─────────────────────────
export const Matriz: React.FC<LProps> = ({ c, f, marcos }) => {
  const cores: string[] = c.cores;
  const D: Record<string, number> = c.duelos;
  const v = (a: string, b: string) => (D[`${a}|${b}`] !== undefined ? D[`${a}|${b}`] : 1 - D[`${b}|${a}`]);
  const tam = 90, x0 = 800, y0 = 200;
  const m1 = marco(marcos, 1), m2 = marco(marcos, 2);
  const foco = (a: string, b: string) => {
    if (f < m1) return 1;
    if (f < m2) return a === 'orange' ? 1 : 0.22;
    return a === 'lightblue' && b === 'orange' ? 1 : a === 'orange' ? 0.45 : 0.18;
  };
  const corV = (x: number) => {
    // 0 -> azul frio, 0.5 -> cinza, 1 -> amarelo
    const t = clamp((x - 0.5) * 2, -1, 1);
    return t >= 0 ? `rgba(255,210,63,${0.15 + 0.85 * t})` : `rgba(90,140,255,${0.15 + 0.85 * -t})`;
  };
  const nome = (g: string) => (g === 'lightblue' ? 'Light blue' : g === 'darkblue' ? 'Dark blue' : g[0].toUpperCase() + g.slice(1));
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 100, top: 300, width: 440 }}>
        <Sobe f={f}><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 52, color: K.texto, lineHeight: 1.08 }}>Head to head</div></Sobe>
        <Sobe f={f} a={8}><div style={{ fontFamily: FT.sans, fontWeight: 500, fontSize: 30, color: K.mudo, marginTop: 18, lineHeight: 1.35 }}>2 players, 1 set each, 1,000 games per matchup. Row = how often that set wins.</div></Sobe>
      </div>
      {cores.map((a, i) => (
        <div key={a} style={{ position: 'absolute', left: x0 - 190, top: y0 + i * tam + tam / 2 - 18, width: 170, textAlign: 'right', fontFamily: FT.disp, fontWeight: 700, fontSize: 28, color: SET[a], opacity: prog(f, i * 3, i * 3 + 12) }}>{nome(a)}</div>
      ))}
      {cores.map((b, j) => (
        <div key={b} style={{ position: 'absolute', left: x0 + j * tam, top: y0 - 34, width: tam, height: 20, display: 'flex', justifyContent: 'center', opacity: prog(f, j * 3, j * 3 + 12) }}><div style={{ width: tam - 30, height: 12, borderRadius: 6, background: SET[b] }} /></div>
      ))}
      {cores.map((a, i) => cores.map((b, j) => {
        const p = prog(f, 10 + (i + j) * 2, 30 + (i + j) * 2, EO);
        const op = foco(a, b) * p;
        if (a === b) return <div key={a + b} style={{ position: 'absolute', left: x0 + j * tam + 3, top: y0 + i * tam + 3, width: tam - 6, height: tam - 6, borderRadius: 8, background: K.painel, opacity: 0.6 * p }} />;
        const x = v(a, b);
        const grande = f >= m2 && a === 'lightblue' && b === 'orange';
        return (
          <div key={a + b} style={{ position: 'absolute', left: x0 + j * tam + 3, top: y0 + i * tam + 3, width: tam - 6, height: tam - 6, borderRadius: 8, background: corV(x), opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: grande ? `4px solid ${K.texto}` : undefined, transform: grande ? `scale(${1 + 0.12 * spr(f, m2 + 6)})` : undefined }}>
            <span style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 26, color: x > 0.62 ? '#14161c' : K.texto }}>{Math.round(x * 100)}</span>
          </div>
        );
      }))}
    </AbsoluteFill>
  );
};

// ───────────────────────── comparação de custo ─────────────────────────
export const Comparacao: React.FC<LProps> = ({ c, f, marcos }) => {
  const max = Math.max(c.a.valor, c.b.valor);
  const lado = (o: any, k: number, a: number) => {
    const p = prog(f, a, a + 40, EO);
    return (
      <div style={{ position: 'absolute', left: 200 + k * 800, top: 260, width: 700 }}>
        <Sobe f={f} a={a - 6}><div style={{ display: 'flex', alignItems: 'center', gap: 20 }}><div style={{ width: 30, height: 30, borderRadius: 6, background: SET[o.cor] || o.cor }} /><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 52, color: K.texto }}>{o.nome}</div></div></Sobe>
        <div style={{ marginTop: 30 }}><Conta f={f} valor={o.valor} a={a} pre={c.sem_cifrao ? '' : '$'} tam={150} cor={SET[o.cor] || o.cor} /></div>
        <div style={{ marginTop: 26, height: 40, width: Math.max(8, 640 * (o.valor / max) * p), borderRadius: 10, background: SET[o.cor] || o.cor }} />
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {lado(c.a, 0, 10)}
      {lado(c.b, 1, marco(marcos, 1))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center' }}><Sobe f={f} a={14}><Rotulo tam={30}>{c.rotulo.toUpperCase()}</Rotulo></Sobe></div>
    </AbsoluteFill>
  );
};

// ───────────────────────── número grande ─────────────────────────
export const Numero: React.FC<LProps> = ({ c, f }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: c.sem_icones ? 'none' : 'flex', gap: 26, marginBottom: 40 }}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{ width: 120, height: 120, borderRadius: 18, border: `4px solid ${corDe(c.cor)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: prog(f, 4 + k * 6, 16 + k * 6), transform: `translateY(${(1 - spr(f, 4 + k * 6)) * 30}px)` }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', border: `6px solid ${corDe(c.cor)}` }} />
        </div>
      ))}
    </div>
    <Conta f={f} valor={c.valor} a={24} d={45} dec={c.dec} pre={c.prefixo || ''} suf={c.sufixo} tam={260} cor={K.texto} />
    <Sobe f={f} a={34}><Rotulo tam={34} style={{ textAlign: 'center' }}>{c.rotulo.toUpperCase()}</Rotulo></Sobe>
  </AbsoluteFill>
);

// ───────────────────────── teste A/B ─────────────────────────
export const Teste: React.FC<LProps> = ({ c, f, marcos }) => {
  const itens = [c.a, c.b, c.c].filter(Boolean);
  const max = 30;
  const qd: [number, number][] = c.quando || itens.map((_: any, k: number) => [0, 10 + k * 30]);
  const quando = (k: number) => marco(marcos, qd[k][0]) + qd[k][1];
  const bw = 300, gap = 120, x0 = (LW - (itens.length * bw + (itens.length - 1) * gap)) / 2, base = 880, alt = 560;
  return (
    <AbsoluteFill>
      <Titulo f={f} texto={c.titulo} />
      <div style={{ position: 'absolute', left: x0 - 60, width: itens.length * bw + (itens.length - 1) * gap + 120, top: base - (25 / max) * alt, borderTop: `3px dashed ${K.fraco}`, opacity: prog(f, 10, 30) }}>
        <span style={{ position: 'absolute', left: -150, top: -14, fontFamily: FT.mono, fontSize: 22, color: K.fraco }}>25%</span>
      </div>
      {itens.map((it: any, k: number) => {
        const a = Math.max(8, quando(k));
        const p = prog(f, a, a + 36, EO);
        const melhor = it.v === Math.max(...itens.map((i: any) => i.v));
        const cor = c.cores ? (c.cores[k] === 'bom' ? K.bom : c.cores[k] === 'ruim' ? K.ruim : '#7c8aa8') : melhor ? K.bom : '#7c8aa8';
        const h = (it.v / max) * alt * p;
        return (
          <div key={k}>
            <div style={{ position: 'absolute', left: x0 + k * (bw + gap), top: base - h, width: bw, height: h, borderRadius: '12px 12px 0 0', background: cor, opacity: 0.9 }} />
            <div style={{ position: 'absolute', left: x0 + k * (bw + gap), top: base - h - 90, width: bw, textAlign: 'center', opacity: p }}><Conta f={f} valor={it.v} a={a} d={36} dec={1} suf="%" tam={70} /></div>
            <div style={{ position: 'absolute', left: x0 + k * (bw + gap) - 30, top: base + 22, width: bw + 60, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 34, color: K.texto, opacity: clamp(p * 2) }}>{it.r}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ───────────────────────── textos / cartões ─────────────────────────
export const Abertura: React.FC<LProps> = ({ c, f, marcos }) => {
  const linhas = String(c.texto).split('\n');
  const m1 = marco(marcos, 1);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, opacity: lerp(0.9, 0.25, prog(f, m1 - 10, m1 + 10)) }}>
        <Tabuleiro c={{ tipo: 'tabuleiro', modo: 'calor', prob: new Array(40).fill(0.025).map((_, i) => 0.02 + 0.012 * rnd(i)) }} f={f + 60} dur={600} marcos={[0, 0]} id="" />
      </div>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {linhas.map((l, k) => {
          const a = m1 - 4 + k * 8;
          const s = spr(f, a, { damping: 14, stiffness: 200 });
          return (
            <div key={k} style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 132, lineHeight: 1.0, letterSpacing: -2, color: k === linhas.length - 1 ? K.sinal : K.texto, opacity: clamp(s * 2), transform: `translateY(${(1 - s) * 40}px)`, textShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>{l}</div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Contador: React.FC<LProps> = ({ c, f, marcos }) => {
  const m1 = marco(marcos, 1);
  const p = prog(f, m1 - 4, m1 + 70, EIO);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Sobe f={f} a={6}><Rotulo tam={30}>{c.sub.toUpperCase()}</Rotulo></Sobe>
      <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 250, color: K.texto, fontVariantNumeric: 'tabular-nums', letterSpacing: -6, marginTop: 10 }}>{fmtL(c.alvo * p)}</div>
      <div style={{ width: 900, height: 10, borderRadius: 5, background: K.painel, overflow: 'hidden', marginTop: 10 }}><div style={{ height: '100%', width: `${p * 100}%`, background: K.sinal }} /></div>
      <Sobe f={f} a={m1 + 60}><Rotulo tam={36} cor={K.sinal} style={{ marginTop: 28 }}>{c.rotulo}</Rotulo></Sobe>
    </AbsoluteFill>
  );
};

export const Promessa: React.FC<LProps> = ({ c, f, marcos }) => (
  <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 220 }}>
    {c.itens.map((t: string, k: number) => {
      const a = marco(marcos, k);
      const passou = f > marco(marcos, 3);
      return (
        <Sobe key={k} f={f} a={a} style={{ display: 'flex', alignItems: 'center', gap: 34, marginBottom: 44, opacity: passou ? 0.35 : undefined }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, border: `3px solid ${K.sinal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FT.mono, fontWeight: 700, fontSize: 36, color: K.sinal }}>{k + 1}</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 64, color: K.texto, letterSpacing: -1 }}>{t}</div>
        </Sobe>
      );
    })}
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: prog(f, marco(marcos, 3), marco(marcos, 3) + 16, EO) }}>
      <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 60, color: K.sinal }}>…and it all comes down to one square.</div>
    </div>
  </AbsoluteFill>
);

export const Capitulo: React.FC<LProps> = ({ c, f }) => {
  const s = spr(f, 4, { damping: 16, stiffness: 160 });
  return (
    <AbsoluteFill style={{ alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 220 }}>
      <Rotulo tam={34} cor={K.sinal} style={{ opacity: prog(f, 0, 12) }}>{LOC.parte} {c.n}</Rotulo>
      <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 140, color: K.texto, letterSpacing: -3, opacity: clamp(s * 2), transform: `translateX(${(1 - s) * -60}px)` }}>{c.titulo}</div>
      <div style={{ height: 6, width: 260 * prog(f, 10, 34, EO), background: K.sinal, borderRadius: 3, marginTop: 18 }} />
    </AbsoluteFill>
  );
};

export const Texto: React.FC<LProps> = ({ c, f }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    {c.linhas.map((l: string, k: number) => (
      <Sobe key={k} f={f} a={6 + k * 22}><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: k === 0 ? 110 : 72, color: k === 0 ? K.sinal : K.texto, letterSpacing: -1, textAlign: 'center' }}>{l}</div></Sobe>
    ))}
  </AbsoluteFill>
);

export const Regra: React.FC<LProps> = ({ c, f }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ border: `3px solid ${K.sinal}`, borderRadius: 26, padding: '60px 90px', background: K.painel, transform: `scale(${0.9 + 0.1 * spr(f, 2)})`, opacity: prog(f, 0, 12), maxWidth: 1400 }}>
      <Rotulo tam={32} cor={K.sinal}>RULE #{c.n}</Rotulo>
      <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 80, color: K.texto, marginTop: 16, letterSpacing: -1, lineHeight: 1.1 }}>{c.texto}</div>
    </div>
  </AbsoluteFill>
);

export const Regras: React.FC<LProps> = ({ c, f, marcos }) => {
  const quando = c.quando ? c.quando.map(([k, d]: [number, number]) => marco(marcos, k) + d) : [marco(marcos, 1), marco(marcos, 1) + 40, marco(marcos, 2), marco(marcos, 3)];
  return (
    <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 260 }}>
      <Sobe f={f}><Rotulo tam={30} cor={K.sinal}>{c.titulo_regras || 'THE EXPERIMENT'}</Rotulo></Sobe>
      {c.itens.map((t: string, k: number) => (
        <Sobe key={k} f={f} a={quando[k]} style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 40 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: k === 3 ? K.ruim : K.sinal }} />
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 64, color: K.texto }}>{t}</div>
        </Sobe>
      ))}
    </AbsoluteFill>
  );
};

export const Lista: React.FC<LProps> = ({ c, f, marcos }) => (
  <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 220 }}>
    <Sobe f={f}><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 60, color: K.mudo, marginBottom: 40 }}>{c.titulo}</div></Sobe>
    {c.itens.map((t: string, k: number) => (
      <Sobe key={k} f={f} a={marco(marcos, k + 1)} style={{ display: 'flex', alignItems: 'center', gap: 34, marginBottom: 34 }}>
        <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 54, color: K.sinal, width: 70 }}>{k + 1}</div>
        <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 66, color: K.texto, letterSpacing: -1 }}>{t}</div>
      </Sobe>
    ))}
  </AbsoluteFill>
);

export const Fim: React.FC<LProps> = ({ c, f }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Sobe f={f}><div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 100, color: K.texto, letterSpacing: -2, textAlign: 'center' }}>{c.pergunta}</div></Sobe>
    <div style={{ display: 'flex', gap: 22, marginTop: 50 }}>
      {(c.faixa_cores || CORES8.map((g) => SET[g])).map((g: string, k: number) => <div key={k} style={{ width: 90, height: 26, borderRadius: 8, background: g, opacity: prog(f, 10 + k * 4, 22 + k * 4), transform: `translateY(${(1 - spr(f, 10 + k * 4)) * 30}px)` }} />)}
    </div>
    <Sobe f={f} a={60} style={{ marginTop: 60 }}><Rotulo tam={32} cor={K.sinal}>{c.cta || 'SUBSCRIBE FOR THE NEXT SIMULATION'}</Rotulo></Sobe>
  </AbsoluteFill>
);

export const TIPOS_LONGO: Record<string, React.FC<LProps>> = {
  abertura: Abertura, contador: Contador, promessa: Promessa, capitulo: Capitulo, tabuleiro: Tabuleiro, dados: Dados, top: Top, texto: Texto,
  degraus: Degraus, regra: Regra, regras: Regras, barras: Barras, pontos: Pontos, matriz: Matriz, comparacao: Comparacao, numero: Numero,
  teste: Teste, lista: Lista, fim: Fim, eua: EUA, estado: Estado, dispersao: Dispersao, serie: Serie, foto: Foto, gancho: Gancho, gancho_gas: GanchoGas, gancho_rio: GanchoRio, gancho_lss: GanchoLSS, gancho_qvd: GanchoQVD, naval: Naval, calor: Calor, histograma: Histograma, documento: Documento, contagem: Contagem, veredito: Veredito,
};
