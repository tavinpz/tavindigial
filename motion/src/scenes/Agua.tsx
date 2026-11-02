/* Cenas de "engenharia contra o mar" (lote 021–025): cada estrutura com desenho próprio.
 * Regras comuns: no quadro 0 da cena de abertura (gancho) a imagem já está completa; a cena final repete a abertura (loop). */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, H } from '../lib/theme';
import { prog, spr, EO, EIO, clamp, wob, lerp, rnd, fmt } from '../lib/anim';
import { Fundo, Titulo, Poeira, Choque, Odometro } from '../comp/base';
import type { CenaProps } from '../lib/types';

const rad = (g: number) => (g * Math.PI) / 180;
const pol = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** linha de onda entre xa e xb na altura y0 */
const onda = (y0: number, xa: number, xb: number, f: number, amp = 6, k = 0.03, vel = 0.25) => {
  let d = `M${xa},${y0}`;
  for (let x = xa; x <= xb + 12; x += 12) d += `L${x},${(y0 + Math.sin(x * k + f * vel) * amp + Math.sin(x * k * 0.43 - f * vel * 0.4) * amp * 0.6).toFixed(1)}`;
  return d;
};

/** etiqueta (pílula) */
const Pilula: React.FC<{ x: number; y: number; texto: string; cor?: string; fundo?: string; s?: number; tam?: number; ancora?: 'l' | 'c' | 'r' }> = ({ x, y, texto, cor = C.white, fundo = 'rgba(6,14,24,0.86)', s = 1, tam = 42, ancora = 'l' }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${ancora === 'c' ? '-50%' : ancora === 'r' ? '-100%' : '0'}, -50%) scale(${s})`, transformOrigin: ancora === 'r' ? '100% 50%' : ancora === 'c' ? '50% 50%' : '0 50%', opacity: clamp(s * 2), padding: '6px 22px 8px', borderRadius: 12, background: fundo, color: cor, fontFamily: F.cond, fontWeight: 900, fontSize: tam, letterSpacing: 2, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{texto}</div>
);

/** selo grande que bate na tela */
const Selo: React.FC<{ f: number; ini: number; x: number; y: number; texto: string; cor?: string; tam?: number }> = ({ f, ini, x, y, texto, cor = C.amber, tam = 64 }) => {
  if (f < ini) return null;
  const s = spr(f, ini, { damping: 9, stiffness: 260, mass: 0.7 });
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${2.2 - 1.2 * s}) rotate(${(1 - s) * -6}deg)`, opacity: clamp(s * 3), padding: '8px 28px 10px', borderRadius: 14, background: cor, color: C.navy, fontFamily: F.cond, fontWeight: 900, fontSize: tam, letterSpacing: 2, whiteSpace: 'nowrap', boxShadow: `0 0 50px ${cor}88, 0 12px 40px rgba(0,0,0,0.6)` }}>{texto}</div>
  );
};

/** chuva diagonal (tempestade) */
const Chuva: React.FC<{ f: number; n?: number; op?: number }> = ({ f, n = 70, op = 0.35 }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {Array.from({ length: n }).map((_, k) => {
      const vel = 38 + rnd(k) * 22;
      const y = ((f * vel + rnd(k + 5) * H * 1.3) % (H * 1.3)) - 200;
      const x = rnd(k + 11) * (W + 300) - 150 + y * 0.18;
      return <line key={k} x1={x} y1={y} x2={x + 14} y2={y + 70} stroke="#cfe6ff" strokeOpacity={op * (0.4 + rnd(k + 2) * 0.6)} strokeWidth={2} />;
    })}
  </svg>
);

const camera = (f: number, dur: number, zoom = 0.08) => {
  const t = f / 30;
  return `scale(${1 + zoom * prog(f, 0, Math.max(30, dur), (x) => x)}) translate(${wob(t * 0.6, 1) * 5}px, ${wob(t * 0.5, 2) * 5}px)`;
};

const atrasoTitulo = (c: any) => (c.gancho ? 84 : -3);

/* =====================================================================
 * MAESLANTKERING — vista de cima (fechado / gira) e corte lateral (afunda)
 * ===================================================================== */
const MY0 = 690, MY1 = 1170, MMID = (MY0 + MY1) / 2;
const PIV: [number, number] = [840, 610];
const MR = Math.hypot(840 - 520, MMID - 4 - 610);
const A_E = Math.atan2(MMID - 4 - 610, 520 - 840) * (180 / Math.PI); // ponta do meio do rio
const A_B = Math.atan2(MY0 - 610 - 10, -Math.sqrt(MR * MR - (MY0 - 610 - 10) ** 2)) * (180 / Math.PI); // ponta na margem
const ROT_ABERTO = 35;

/** pontos do portão de cima girado `rot` graus (0 = fechado) */
const arcoPortao = (rot: number, raio = MR, n = 18, a0 = A_E, a1 = A_B): [number, number][] =>
  Array.from({ length: n + 1 }).map((_, i) => {
    const a = rad(lerp(a0, a1, i / n) + rot);
    return [PIV[0] + Math.cos(a) * raio, PIV[1] + Math.sin(a) * raio];
  });
const espelha = (p: [number, number][]): [number, number][] => p.map(([x, y]) => [x, 2 * MMID - y]);

const Doca: React.FC<{ cheia: number; f: number }> = ({ cheia, f }) => {
  const fora = arcoPortao(ROT_ABERTO, MR + 34, 18, A_E - 4, A_B + 1);
  const dentro = arcoPortao(ROT_ABERTO, MR - 34, 18, A_E - 4, A_B + 1).reverse();
  const p = [...fora, ...dentro];
  const cor = `rgb(${Math.round(lerp(88, 22, cheia))},${Math.round(lerp(95, 82, cheia))},${Math.round(lerp(102, 132, cheia))})`;
  return (
    <>
      {[p, espelha(p)].map((q, k) => (
        <g key={k}>
          <polygon points={pol(q)} fill={cor} stroke="#6f7d89" strokeWidth={3} />
          {cheia > 0.05 && cheia < 1 && <polygon points={pol(q)} fill="none" stroke="#e6f6ff" strokeOpacity={0.6} strokeWidth={3} strokeDasharray="8 12" strokeDashoffset={-f * 2} />}
        </g>
      ))}
    </>
  );
};

const PortaoTopo: React.FC<{ rot: number; espelho?: boolean; brilho?: number }> = ({ rot, espelho, brilho = 1 }) => {
  let arco = arcoPortao(rot);
  let piv: [number, number] = PIV;
  if (espelho) { arco = espelha(arco); piv = [PIV[0], 2 * MMID - PIV[1]]; }
  const idx = [0, 5, 9, 13, 18];
  return (
    <g>
      {/* treliça: do pivô até o portão */}
      {idx.map((i, k) => <line key={k} x1={piv[0]} y1={piv[1]} x2={arco[i][0]} y2={arco[i][1]} stroke="#d9891c" strokeWidth={k === 0 || k === 4 ? 10 : 5} strokeLinecap="round" />)}
      {[0.35, 0.65].map((u, k) => {
        const a = [lerp(piv[0], arco[0][0], u), lerp(piv[1], arco[0][1], u)], b = [lerp(piv[0], arco[18][0], u), lerp(piv[1], arco[18][1], u)];
        return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#d9891c" strokeWidth={5} />;
      })}
      <polyline points={pol(arco)} fill="none" stroke={C.amber} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${16 * brilho}px ${C.amber}cc)` }} />
      <polyline points={pol(arco)} fill="none" stroke="#fff3d6" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      {/* rótula (ball joint) */}
      <circle cx={piv[0]} cy={piv[1]} r={26} fill="#fff" stroke={C.navy} strokeWidth={6} />
    </g>
  );
};

const MaeslantTopo: React.FC<CenaProps & { rot: number; cheia: number; tempestade: number }> = ({ c, f, dur, rot, cheia, tempestade }) => {
  // linha do portão em cada y (para separar mar agitado de rio calmo)
  const arco = arcoPortao(rot);
  const fechado = rot < 3;
  const xPortao = (y: number) => {
    const a = y <= MMID ? arco : espelha(arco);
    let best = a[0][0], dm = 1e9;
    a.forEach(([x, yy]) => { const d = Math.abs(yy - y); if (d < dm) { dm = d; best = x; } });
    return best;
  };
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="mrio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0f4f86" /><stop offset="1" stopColor="#1f86d0" /></linearGradient>
        <linearGradient id="mmar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0a2c4c" /><stop offset="1" stopColor="#134f80" /></linearGradient>
      </defs>
      {/* margens */}
      <rect x={-80} y={-80} width={W + 160} height={MY0 + 80} fill="#1c3527" />
      <rect x={-80} y={MY1} width={W + 160} height={H} fill="#1c3527" />
      {/* porto (quadras) */}
      {Array.from({ length: 10 }).map((_, k) => {
        const x = 900 + (k % 2) * 80, y = k < 5 ? 470 - (k >> 1) * 70 : 1260 + ((k - 5) >> 1) * 70;
        return <rect key={k} x={x} y={y} width={64} height={48} fill="#2a4a39" stroke="#3b5f4b" strokeWidth={2} />;
      })}
      <line x1={-80} x2={W + 80} y1={MY0} y2={MY0} stroke="#4e6b5a" strokeWidth={6} />
      <line x1={-80} x2={W + 80} y1={MY1} y2={MY1} stroke="#4e6b5a" strokeWidth={6} />
      {/* rio */}
      <rect x={-80} y={MY0} width={W + 160} height={MY1 - MY0} fill="url(#mrio)" />
      {/* mar agitado do lado de fora quando fechado */}
      {fechado && (
        <path d={`M-80,${MY0} ${Array.from({ length: 21 }).map((_, i) => { const y = lerp(MY0, MY1, i / 20); return `L${xPortao(y) - 6},${y}`; }).join(' ')} L-80,${MY1} Z`} fill="url(#mmar)" opacity={0.55 + 0.45 * tempestade} />
      )}
      {/* correnteza / ondas */}
      {Array.from({ length: 26 }).map((_, k) => {
        const yy = MY0 + 26 + rnd(k + 3) * (MY1 - MY0 - 52);
        const lim = fechado ? xPortao(yy) - 40 : W + 100;
        const vel = (tempestade > 0 ? 7 : 3) + rnd(k) * 3;
        const x = ((f * vel + rnd(k + 9) * 1300) % 1300) - 140;
        if (x > lim) return null;
        const comp = tempestade > 0 ? 70 + rnd(k + 1) * 50 : 50;
        return <line key={k} x1={x} x2={Math.min(x + comp, lim)} y1={yy} y2={yy} stroke="#d8f0ff" strokeOpacity={0.35 + 0.35 * tempestade} strokeWidth={tempestade > 0 ? 5 : 4} strokeLinecap="round" />;
      })}
      {/* espuma batendo no portão */}
      {fechado && tempestade > 0 && Array.from({ length: 16 }).map((_, k) => {
        const y = lerp(MY0 + 20, MY1 - 20, k / 15);
        const x = xPortao(y) - 30;
        const ph = (f * 0.09 + rnd(k)) % 1;
        return <circle key={k} cx={x - ph * 40} cy={y + Math.sin(k + f * 0.2) * 6} r={6 + ph * 16} fill="#e9f7ff" opacity={(1 - ph) * 0.7 * tempestade} />;
      })}
      <Doca cheia={cheia} f={f} />
      <PortaoTopo rot={rot} />
      <PortaoTopo rot={rot} espelho />
    </svg>
  );
};

/** corte lateral: o portão oco enche de água e afunda no leito de pedra */
const MaeslantCorte: React.FC<CenaProps> = ({ c, f, dur }) => {
  const nivel = 900, leito = 1250, px = 20; // 20 px por metro
  const enche = prog(f, dur * 0.08, dur * 0.6, EIO);
  const desce = prog(f, dur * 0.3, dur * 0.62, EIO);
  const surge = prog(f, dur * 0.62, dur * 0.95, EIO);
  const altura = 22 * px, larg = 150;
  const base = lerp(1050, leito, desce);
  const topo = base - altura;
  const gx = 470;
  const mar = nivel - 3 * px * surge;
  const dentro = lerp(base - 30, topo + 70, enche);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="mcA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b8fd8" /><stop offset="1" stopColor="#0b3558" /></linearGradient>
        <linearGradient id="mcB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f7cc2" /><stop offset="1" stopColor="#0b3558" /></linearGradient>
      </defs>
      {/* água: mar à esquerda (sobe), rio à direita */}
      <path d={`${onda(mar, -40, gx, f, 7)} L${gx},${leito} L-40,${leito} Z`} fill="url(#mcA)" />
      <path d={`${onda(nivel, gx + larg, 1120, f, 4)} L1120,${leito} L${gx + larg},${leito} Z`} fill="url(#mcB)" />
      <path d={onda(mar, -40, gx, f, 7)} stroke="#d6f1ff" strokeWidth={4} fill="none" />
      <path d={onda(nivel, gx + larg, 1120, f, 4)} stroke="#d6f1ff" strokeWidth={3} fill="none" />
      {desce < 0.98 && <rect x={gx} y={nivel - 2} width={larg} height={leito - nivel} fill="url(#mcB)" />}
      {/* leito com pedra britada */}
      <rect x={-40} y={leito} width={1160} height={400} fill="#3a3326" />
      {Array.from({ length: 30 }).map((_, k) => <circle key={k} cx={gx - 120 + rnd(k) * (larg + 240)} cy={leito + 8 + rnd(k + 4) * 26} r={6 + rnd(k + 8) * 8} fill="#6b6455" />)}
      <rect x={gx - 130} y={leito - 6} width={larg + 260} height={14} fill="#7b7464" />
      {/* portão oco */}
      <rect x={gx} y={topo} width={larg} height={altura} rx={8} fill="#1d2833" stroke={C.amber} strokeWidth={8} />
      <rect x={gx + 14} y={dentro} width={larg - 28} height={Math.max(0, base - 14 - dentro)} fill={C.water} opacity={0.9} />
      <rect x={gx + 14} y={topo + 14} width={larg - 28} height={Math.max(0, dentro - topo - 14)} fill="#e8eef3" opacity={0.25} />
      {/* setas de água entrando */}
      {enche > 0 && enche < 1 && [0, 1, 2].map((k) => {
        const ph = (f * 0.06 + k / 3) % 1;
        const y = lerp(base - 60, dentro + 20, ph);
        return <polygon key={k} points={`${gx + larg / 2 - 22},${y + 20} ${gx + larg / 2 + 22},${y + 20} ${gx + larg / 2},${y - 14}`} fill="#fff" opacity={0.9 * (1 - ph)} />;
      })}
      {/* pressão do mar */}
      {surge > 0.2 && [0, 1, 2].map((k) => {
        const ph = (f * 0.04 + k / 3) % 1;
        const x = lerp(80, gx - 80, ph), y = 1000 + k * 70;
        return <polygon key={k} points={`${x},${y - 24} ${x + 54},${y} ${x},${y + 24}`} fill={C.red} opacity={0.85 * (1 - ph)} />;
      })}
    </svg>
  );
};

export const Maeslant: React.FC<CenaProps> = (p) => {
  const { c, f, dur } = p;
  const modo = c.modo || 'fechado';
  const t = f / 30;
  if (modo === 'afunda') {
    const desce = prog(f, dur * 0.3, dur * 0.62, EIO);
    return (
      <AbsoluteFill>
        <Fundo f={f} grade={false} />
        <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.06) }}>
          <MaeslantCorte {...p} />
          <div style={{ position: 'absolute', left: 50, top: 1170, fontFamily: F.cond, fontWeight: 800, fontSize: 46, letterSpacing: 3, color: C.white }}>SEA</div>
          <div style={{ position: 'absolute', right: 50, top: 1170, fontFamily: F.cond, fontWeight: 800, fontSize: 46, letterSpacing: 3, color: C.white }}>RIVER</div>
          <Pilula x={680} y={640} texto={desce < 0.5 ? 'FLOATING' : 'WATER IN'} s={spr(f, 6)} fundo={desce < 0.5 ? 'rgba(6,14,24,0.86)' : C.water} cor={desce < 0.5 ? C.white : C.navy} />
          <Pilula x={680} y={1225} texto="STONE BED" s={spr(f, 14)} tam={34} />
          <Selo f={f} ini={Math.round(dur * 0.63)} x={760} y={830} texto="SEALED" />
        </div>
        <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
      </AbsoluteFill>
    );
  }
  let rot = 0, cheia = 1, tempestade = 1;
  if (modo === 'gira') {
    cheia = prog(f, dur * 0.06, dur * 0.3, EIO);
    rot = ROT_ABERTO * (1 - prog(f, dur * 0.32, dur * 0.88, EIO));
    tempestade = prog(f, dur * 0.85, dur, EO);
  }
  const fechou = modo === 'gira' ? Math.round(dur * 0.88) : -999;
  return (
    <AbsoluteFill>
      <Fundo f={f} grade={false} />
      <div style={{ position: 'absolute', inset: 0, transform: camera(f + (c.gancho ? 30 : 0), dur, 0.07) }}>
        <MaeslantTopo {...p} rot={rot} cheia={cheia} tempestade={tempestade} />
        <Pilula x={50} y={MMID} texto="NORTH SEA" s={c.gancho ? 1 : spr(f, 4)} />
        <Pilula x={W - 50} y={MMID} texto="ROTTERDAM" s={c.gancho ? 1 : spr(f, 8)} ancora="r" />
        {modo === 'gira' && (
          <>
            <div style={{ position: 'absolute', left: 60, top: 560, transform: `scale(${spr(f, 4)})`, transformOrigin: '0 50%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '6px 20px 10px', borderRadius: 14, background: C.red, color: '#fff', fontFamily: F.cond, fontWeight: 900, boxShadow: `0 0 40px ${C.red}88` }}>
                <span style={{ fontSize: 46 }}>SURGE</span>
                <Odometro f={f} valor={3} prefixo="+" sufixo=" M" ini={4} fim={34} tam={70} cor="#fff" glow={false} />
              </div>
            </div>
            <Pilula x={330} y={470} texto={cheia < 0.95 ? 'DOCKS FLOOD' : rot > 2 ? 'GATES FLOAT OUT' : 'CLOSED'} s={spr(f, 10)} fundo={rot <= 2 ? C.amber : 'rgba(6,14,24,0.86)'} cor={rot <= 2 ? C.navy : C.white} tam={40} ancora="c" />
            <Choque f={f} ini={fechou} x={520} y={MMID} cor={C.amber} tam={700} />
          </>
        )}
        {c.final && (
          <>
            <Selo f={f} ini={8} x={260} y={520} texto="2 GATES" />
            <Selo f={f} ini={22} x={560} y={520} texto="2 HOURS" cor={C.white} />
          </>
        )}
      </div>
      {tempestade > 0 && modo !== 'gira' && <Chuva f={f} op={0.28} />}
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={atrasoTitulo(c)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
 * THAMES BARRIER — vista de frente (pilares com cascos de aço) e corte do portão setorial
 * ===================================================================== */
const VAOS = [0.06, 0.06, 0.12, 0.12, 0.12, 0.12, 0.06, 0.06, 0.06, 0.06]; // larguras relativas dos 10 vãos
const TX0 = 50, TX1 = 1030, TAGUA = 1010, TLEITO = 1250;
const pilares = () => {
  const tot = VAOS.reduce((a, b) => a + b, 0) + 0.05 * 9;
  const esc = (TX1 - TX0) / tot;
  const out: { x: number; w: number }[] = [];
  const vaos: { x0: number; x1: number }[] = [];
  let x = TX0;
  VAOS.forEach((v, i) => {
    vaos.push({ x0: x, x1: x + v * esc });
    x += v * esc;
    if (i < VAOS.length - 1) { out.push({ x, w: 0.05 * esc }); x += 0.05 * esc; }
  });
  return { pil: out, vaos };
};

const Casco: React.FC<{ x: number; w: number; y: number; s?: number }> = ({ x, w, y, s = 1 }) => {
  // casco de aço inox em forma de concha sobre o pilar
  const hw = w * 2.3, h = 104 * s;
  return (
    <g>
      <defs>
        <linearGradient id="inox" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d8a96" /><stop offset="0.45" stopColor="#eef3f7" /><stop offset="0.7" stopColor="#b5c1cc" /><stop offset="1" stopColor="#6c7a87" />
        </linearGradient>
      </defs>
      <path d={`M${x + w / 2 - hw / 2},${y} C${x + w / 2 - hw / 2},${y - h * 0.9} ${x + w / 2 - hw * 0.15},${y - h * 1.15} ${x + w / 2 + hw * 0.1},${y - h} C${x + w / 2 + hw * 0.4},${y - h * 0.85} ${x + w / 2 + hw / 2},${y - h * 0.4} ${x + w / 2 + hw / 2},${y} Z`} fill="url(#inox)" stroke="#2b3a48" strokeWidth={2} />
      {[0.25, 0.5, 0.75].map((u, k) => <path key={k} d={`M${x + w / 2 - hw / 2 + hw * u},${y} C${x + w / 2 - hw / 2 + hw * u},${y - h * 0.7} ${x + w / 2 - hw * 0.1 + hw * u * 0.3},${y - h * 1.05} ${x + w / 2 + hw * 0.1},${y - h}`} stroke="#5d6b78" strokeWidth={2} fill="none" opacity={0.7} />)}
    </g>
  );
};

const Horizonte: React.FC<{ f: number; y: number }> = ({ f, y }) => {
  // silhueta genérica de cidade ao fundo
  const torres = Array.from({ length: 34 }).map((_, k) => {
    const x = k * 34 - 20 + rnd(k) * 14;
    const h = 60 + rnd(k + 7) * 140 + (k > 12 && k < 20 ? 120 : 0);
    return { x, w: 22 + rnd(k + 3) * 26, h };
  });
  return (
    <g opacity={0.9}>
      {torres.map((t, k) => (
        <g key={k}>
          <rect x={t.x} y={y - t.h} width={t.w} height={t.h} fill={k % 3 ? '#132638' : '#16304a'} />
          {Array.from({ length: Math.floor(t.h / 26) }).map((_, j) => (rnd(k * 13 + j) > 0.55 ? <rect key={j} x={t.x + 5} y={y - t.h + 10 + j * 26} width={t.w - 10} height={5} fill="#f2b33d" opacity={0.25 + 0.2 * Math.sin(f * 0.05 + j + k)} /> : null))}
        </g>
      ))}
    </g>
  );
};

export const Tamisa: React.FC<CenaProps> = ({ c, f, dur }) => {
  const modo = c.modo || 'frente';
  const t = f / 30;
  if (modo === 'sobe' || modo === 'navio') {
    // corte do portão setorial: disco no pilar, braços e chapa curva
    const P: [number, number] = [560, 1000];
    const R = 260;
    const ang = modo === 'sobe' ? 90 * prog(f, dur * 0.12, dur * 0.55, EIO) : 0; // 0 = deitado no leito; 90 = em pé
    const arco = Array.from({ length: 21 }).map((_, i) => {
      const a = rad(lerp(45, 135, i / 20) + ang);
      return [P[0] + Math.cos(a) * R, P[1] + Math.sin(a) * R] as [number, number];
    });
    const normal = 930, mar = modo === 'sobe' ? lerp(normal, 860, prog(f, dur * 0.55, dur * 0.95, EIO)) : normal;
    const leito = 1270;
    const xNavio = lerp(-380, 1180, prog(f, 0, dur, (x) => x));
    const andares = 5, alturaPortao = arco[20][1] - arco[0][1];
    const ergueu = modo === 'sobe' ? Math.round(dur * 0.55) : -999;
    return (
      <AbsoluteFill>
        <Fundo f={f} grade={false} />
        <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.06) }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="taA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b8fd8" /><stop offset="1" stopColor="#0b3558" /></linearGradient>
            </defs>
            {/* água: mar à esquerda do portão quando ergue */}
            <path d={`${onda(mar, -40, ang > 60 ? P[0] - R : 1120, f, 6)} L${ang > 60 ? P[0] - R : 1120},${leito} L-40,${leito} Z`} fill="url(#taA)" />
            {ang > 60 && <path d={`${onda(normal, P[0] - R, 1120, f, 4)} L1120,${leito} L${P[0] - R},${leito} Z`} fill="url(#taA)" opacity={0.92} />}
            <path d={onda(mar, -40, ang > 60 ? P[0] - R : 1120, f, 6)} stroke="#d6f1ff" strokeWidth={4} fill="none" />
            {/* leito e soleira de concreto */}
            <path d={`M-40,${leito} L${P[0] - R - 30},${leito} L${P[0] - R - 30},${P[1] + R * 0.68} Q${P[0]},${P[1] + R + 40} ${P[0] + R + 30},${P[1] + R * 0.68} L${P[0] + R + 30},${leito} L1120,${leito} L1120,1700 L-40,1700 Z`} fill="#4a4f55" />
            <rect x={-40} y={leito + 60} width={1160} height={400} fill="#3a3326" />
            {/* disco do pilar */}
            <circle cx={P[0]} cy={P[1]} r={R + 26} fill="none" stroke="#c9d3dc" strokeOpacity={0.35} strokeWidth={3} strokeDasharray="10 10" />
            <circle cx={P[0]} cy={P[1]} r={70} fill="#9aa6b1" stroke="#e6ecf1" strokeWidth={6} />
            {[0, 20].map((i) => <line key={i} x1={P[0]} y1={P[1]} x2={arco[i][0]} y2={arco[i][1]} stroke="#c9d3dc" strokeWidth={14} strokeLinecap="round" />)}
            <polyline points={pol(arco)} fill="none" stroke={C.amber} strokeWidth={30} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${C.amber}aa)` }} />
            {/* navio passando por cima */}
            {modo === 'navio' && (
              <g transform={`translate(${xNavio} ${normal + 4})`}>
                <path d="M0,-40 L300,-40 L270,30 L30,30 Z" fill="#c94b3a" />
                <rect x={40} y={-80} width={200} height={40} fill="#e6ecf1" />
                <rect x={180} y={-130} width={50} height={50} fill="#e6ecf1" />
                <rect x={196} y={-170} width={18} height={40} fill="#2b3a48" />
              </g>
            )}
            {/* prédio de 5 andares para escala */}
            {modo === 'sobe' && (() => {
              const hs = prog(f, dur * 0.55, dur * 0.75, EO);
              const h = Math.abs(alturaPortao) * hs;
              const bx = 760, bw = 180, base = P[1] + R * 0.71;
              return (
                <g opacity={hs}>
                  <rect x={bx} y={base - h} width={bw} height={h} fill="#55728d" />
                  {Array.from({ length: andares }).map((_, k) => <rect key={k} x={bx + 14} y={base - h + 14 + (k * (h - 20)) / andares} width={bw - 28} height={Math.max(0, (h - 20) / andares - 14)} fill="#2b4157" />)}
                </g>
              );
            })()}
          </svg>
          {modo === 'sobe' && (
            <>
              <div style={{ position: 'absolute', left: 0, width: W, top: 520, display: 'flex', justifyContent: 'center' }}>
                <Odometro f={f} valor={3300} sufixo=" t" ini={0} fim={34} tam={170} cor={C.amber} />
              </div>
              <Pilula x={850} y={Math.min(1180, P[1] + R * 0.71 + 40)} texto="5 FLOORS" s={spr(f, dur * 0.6)} tam={36} ancora="c" />
              <Choque f={f} ini={ergueu} x={P[0] - R} y={P[1]} cor={C.amber} tam={600} />
            </>
          )}
          {modo === 'navio' && <Pilula x={P[0]} y={610} texto="GATE DOWN · SHIPS PASS" s={spr(f, 8)} tam={40} ancora="c" />}
          <div style={{ position: 'absolute', left: 40, top: 760, fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.white, opacity: 0.85 }}>NORTH SEA ←</div>
          <div style={{ position: 'absolute', right: 40, top: 760, fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.white, opacity: 0.85 }}>→ LONDON</div>
        </div>
        <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
      </AbsoluteFill>
    );
  }
  // ---------- frente ----------
  const { pil, vaos } = pilares();
  const constroi = modo === 'constroi';
  const ergue = constroi ? prog(f, 70, 100, EIO) : 1;
  const tempestade = constroi ? 0 : 1;
  const topoPortao = 905;
  const mar = constroi ? TAGUA : 965;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0a1522 0%, #12263a 46%, #0b1828 60%, #050c15 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, transform: camera(f + (c.gancho ? 30 : 0), dur, 0.07) }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="tfA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f6fae" /><stop offset="1" stopColor="#071a2c" /></linearGradient>
            <linearGradient id="tfP" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4b5965" /><stop offset="0.5" stopColor="#8796a3" /><stop offset="1" stopColor="#45525d" /></linearGradient>
          </defs>
          <Horizonte f={f} y={880} />
          {/* rio ao fundo */}
          <rect x={-40} y={870} width={1160} height={60} fill="#0d2a44" />
          {/* portões erguidos nos vãos */}
          {vaos.map((v, i) => {
            const s = constroi ? spr(f, 6 + i * 7, { damping: 12, stiffness: 160 }) : 1;
            const topo = lerp(TLEITO, topoPortao, ergue * s);
            return <rect key={i} x={v.x0} y={topo} width={v.x1 - v.x0} height={TLEITO - topo} fill="#22323f" stroke={C.amber} strokeWidth={4} opacity={clamp(s * 2)} />;
          })}
          {/* pilares com cascos */}
          {pil.map((p, i) => {
            const s = constroi ? spr(f, 2 + i * 7, { damping: 11, stiffness: 170 }) : 1;
            const y = lerp(1400, 850, s);
            return (
              <g key={i} opacity={clamp(s * 2)}>
                <rect x={p.x} y={y} width={p.w} height={TLEITO + 60 - y} fill="url(#tfP)" />
                <Casco x={p.x} w={p.w} y={y} />
              </g>
            );
          })}
          {/* água do lado de cá (mar) batendo */}
          <path d={`${onda(mar, -40, 1120, f, tempestade ? 12 : 5, 0.025, tempestade ? 0.35 : 0.2)} L1120,1700 L-40,1700 Z`} fill="url(#tfA)" opacity={0.93} />
          <path d={onda(mar, -40, 1120, f, tempestade ? 12 : 5, 0.025, tempestade ? 0.35 : 0.2)} stroke="#d6f1ff" strokeWidth={4} fill="none" />
          {tempestade > 0 && Array.from({ length: 22 }).map((_, k) => {
            const ph = (f * 0.07 + rnd(k)) % 1;
            const x = rnd(k + 4) * W;
            return <circle key={k} cx={x} cy={mar - 10 - ph * 70} r={5 + ph * 14} fill="#eaf7ff" opacity={(1 - ph) * 0.6} />;
          })}
          {/* cota de 520 m */}
          {constroi && (() => {
            const q = prog(f, 80, 104, EO);
            const y = 650;
            return (
              <g opacity={q}>
                <line x1={TX0} x2={lerp(TX0, TX1, q)} y1={y} y2={y} stroke={C.amber} strokeWidth={6} />
                <line x1={TX0} x2={TX0} y1={y - 24} y2={y + 24} stroke={C.amber} strokeWidth={6} />
                {q > 0.98 && <line x1={TX1} x2={TX1} y1={y - 24} y2={y + 24} stroke={C.amber} strokeWidth={6} />}
              </g>
            );
          })()}
        </svg>
        {constroi && (
          <>
            <div style={{ position: 'absolute', left: 0, width: W, top: 560, display: 'flex', justifyContent: 'center', opacity: prog(f, 84, 96) }}>
              <Odometro f={f} valor={520} sufixo=" M" ini={84} fim={110} tam={120} cor={C.amber} />
            </div>
            <Pilula x={W / 2} y={1190} texto={`${Math.min(10, Math.max(0, Math.floor((f - 2) / 7) + 1))} / 10 GATES`} s={spr(f, 4)} ancora="c" />
            <Choque f={f} ini={84} x={540} y={900} cor={C.amber} />
          </>
        )}
        {c.final && <Selo f={f} ini={10} x={W / 2} y={640} texto="125 KM² PROTECTED" tam={58} />}
      </div>
      {tempestade > 0 && <Chuva f={f} op={0.3} />}
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={atrasoTitulo(c)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
 * AFSLUITDIJK — em perspectiva (estrada sobre o dique), construção vista de cima e comportas em corte
 * ===================================================================== */
export const Dique: React.FC<CenaProps> = ({ c, f, dur }) => {
  const modo = c.modo || 'hero';
  const t = f / 30;
  if (modo === 'constroi') {
    // vista de cima: duas frentes de dique avançando, a lacuna fecha e a correnteza aperta
    const p = prog(f, 4, dur - 6, EIO) * 0.93;
    const yD = 960, hD = 120;
    const gapMeio = 540, gap = lerp(520, 22, p);
    const xa = gapMeio - gap / 2, xb = gapMeio + gap / 2;
    const trab = Math.round(10000 * prog(f, 0, dur * 0.6, EO));
    return (
      <AbsoluteFill>
        <Fundo f={f} grade={false} />
        <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.1) }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <rect x={-40} y={420} width={1160} height={yD - 420} fill="#0e3556" />
            <rect x={-40} y={yD + hD} width={1160} height={600} fill="#124a78" />
            <rect x={-40} y={yD} width={1160} height={hD} fill="#124a78" />
            {/* ondas */}
            {Array.from({ length: 30 }).map((_, k) => {
              const y = 440 + rnd(k) * (yD - 460);
              const x = ((f * 2 + rnd(k + 2) * 1200) % 1200) - 60;
              return <line key={k} x1={x} x2={x + 46} y1={y} y2={y} stroke="#cfeaff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />;
            })}
            {/* correnteza pela lacuna */}
            {Array.from({ length: 10 }).map((_, k) => {
              const ph = (f * (0.05 + p * 0.06) + k / 10) % 1;
              const x = gapMeio + (rnd(k) - 0.5) * gap * 0.7;
              return <line key={k} x1={x} x2={x} y1={lerp(yD - 120, yD + hD + 140, ph)} y2={lerp(yD - 60, yD + hD + 200, ph)} stroke="#e8f6ff" strokeOpacity={0.8 * (1 - ph)} strokeWidth={6} strokeLinecap="round" />;
            })}
            {/* frentes do dique */}
            {[[-40, xa], [xb, 1120]].map(([a, b], k) => (
              <g key={k}>
                <rect x={a} y={yD} width={b - a} height={hD} fill="#7b6a4a" />
                <rect x={a} y={yD + 18} width={b - a} height={hD - 36} fill="#3f6b3a" />
                <rect x={a} y={yD + hD / 2 - 6} width={b - a} height={12} fill="#2f3a44" />
                <line x1={a} x2={b} y1={yD} y2={yD} stroke="#a89470" strokeWidth={4} />
              </g>
            ))}
            {/* barcaças despejando */}
            {[xa - 60, xb + 20, xa - 180, xb + 140].map((x, k) => (
              <g key={k} transform={`translate(${x} ${yD - 70 - (k % 2) * 40 + Math.sin(f * 0.1 + k) * 4})`}>
                <rect x={0} y={0} width={70} height={30} rx={6} fill="#c9a26b" stroke="#2b2b2b" strokeWidth={2} />
                {Array.from({ length: 3 }).map((_, j) => {
                  const ph = (f * 0.08 + j / 3 + k * 0.2) % 1;
                  return <circle key={j} cx={35 + (j - 1) * 14} cy={30 + ph * 50} r={5} fill="#a8875a" opacity={1 - ph} />;
                })}
              </g>
            ))}
          </svg>
          <Pilula x={40} y={690} texto="NORTH SEA" tam={38} />
          <Pilula x={40} y={1180} texto="ZUIDERZEE" tam={38} />
          <div style={{ position: 'absolute', left: 0, width: W, top: 520, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '8px 28px', borderRadius: 16, background: 'rgba(6,14,24,0.9)', border: `3px solid ${C.amber}`, transform: `scale(${spr(f, 2)})` }}>
              <span style={{ fontFamily: F.cond, fontWeight: 900, fontSize: 84, color: C.amber, fontVariantNumeric: 'tabular-nums' }}>{fmt(trab)}</span>
              <span style={{ fontFamily: F.cond, fontWeight: 800, fontSize: 48, color: C.white, letterSpacing: 2 }}>WORKERS</span>
            </div>
          </div>
        </div>
        <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
      </AbsoluteFill>
    );
  }
  if (modo === 'comportas') {
    // corte: lago (mais alto) à direita, mar na maré baixa à esquerda; a comporta sobe e a água escoa
    const sobe = prog(f, 10, 40, EIO);
    const lago = 900, mar = 1010, fundoY = 1240;
    const dx0 = 430, dx1 = 650;
    const n = Math.min(25, Math.floor(25 * prog(f, 6, dur * 0.7, EO)));
    return (
      <AbsoluteFill>
        <Fundo f={f} grade={false} />
        <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.06) }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <defs><linearGradient id="dqA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b8fd8" /><stop offset="1" stopColor="#0b3558" /></linearGradient></defs>
            <path d={`${onda(mar, -40, dx0, f, 5)} L${dx0},${fundoY} L-40,${fundoY} Z`} fill="url(#dqA)" />
            <path d={`${onda(lago, dx1, 1120, f, 3)} L1120,${fundoY} L${dx1},${fundoY} Z`} fill="url(#dqA)" />
            <path d={onda(mar, -40, dx0, f, 5)} stroke="#d6f1ff" strokeWidth={3} fill="none" />
            <path d={onda(lago, dx1, 1120, f, 3)} stroke="#d6f1ff" strokeWidth={3} fill="none" />
            {/* corpo do dique com galeria */}
            <polygon points={pol([[dx0 - 120, fundoY], [dx0, 760], [dx1, 760], [dx1 + 140, fundoY]])} fill="#5a5f63" />
            <rect x={dx0 - 40} y={1080} width={dx1 - dx0 + 120} height={110} fill="#1d6fae" />
            {/* comporta */}
            <rect x={dx0 + 60} y={lerp(1080, 880, sobe)} width={40} height={130} fill={C.amber} stroke="#fff3d6" strokeWidth={4} />
            {/* escoamento */}
            {sobe > 0.2 && Array.from({ length: 12 }).map((_, k) => {
              const ph = (f * 0.05 + k / 12) % 1;
              const x = lerp(dx1 + 60, -20, ph);
              const y = 1100 + (k % 4) * 24 + (x < dx0 - 40 ? (dx0 - 40 - x) * 0.12 : 0);
              return <line key={k} x1={x} x2={x + 50} y1={y} y2={y} stroke="#e8f6ff" strokeOpacity={0.85 * sobe} strokeWidth={6} strokeLinecap="round" />;
            })}
            <rect x={-40} y={fundoY} width={1160} height={500} fill="#3a3326" />
          </svg>
          <div style={{ position: 'absolute', left: 40, top: 1190, fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.white }}>SEA · LOW TIDE</div>
          <div style={{ position: 'absolute', right: 40, top: 1190, fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.white }}>LAKE</div>
          {/* 25 comportas acendendo */}
          <div style={{ position: 'absolute', left: 90, width: W - 180, top: 560, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            {Array.from({ length: 25 }).map((_, k) => (
              <div key={k} style={{ width: 52, height: 60, borderRadius: 8, background: k < n ? C.amber : '#1d3348', boxShadow: k < n ? `0 0 16px ${C.amber}` : 'none', border: '3px solid #0a1520' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', left: 0, width: W, top: 420, textAlign: 'center', fontFamily: F.cond, fontWeight: 900, fontSize: 120, color: C.amber, textShadow: `0 0 40px ${C.amber}88`, opacity: prog(f, 0, 10) }}>{n}</div>
        </div>
        <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
      </AbsoluteFill>
    );
  }
  // ---------- hero: estrada sobre o dique, mar agitado à esquerda e lago calmo à direita ----------
  const hz = 760, VPx = 600;
  const baseY = 1560;
  const bordas = { mar: -140, mE: 330, rE: 410, rD: 670, lD: 780, lago: 1220 }; // x na base (y = baseY)
  const X = (xBase: number, y: number) => lerp(VPx, xBase, (y - hz) / (baseY - hz));
  const corte = (xb: number) => [[VPx, hz], [xb, baseY]];
  const anda = (f * 0.018) % 1; // câmera andando sobre o dique
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #0e1c2c 0%, #1d3550 ${hz / 19.2 - 6}%, #2a4866 ${hz / 19.2}%, #0b1828 ${hz / 19.2 + 0.1}%)` }} />
      <div style={{ position: 'absolute', inset: 0, transform: camera(f + (c.gancho ? 30 : 0), dur, 0.05) }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="dmar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b7891" /><stop offset="0.12" stopColor="#2c4a63" /><stop offset="0.6" stopColor="#173750" /><stop offset="1" stopColor="#0d2840" /></linearGradient>
            <linearGradient id="dlago" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9cc8e6" /><stop offset="0.1" stopColor="#5aa3d8" /><stop offset="0.55" stopColor="#2a7ec0" /><stop offset="1" stopColor="#14568c" /></linearGradient>
            <linearGradient id="dceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0e1c2c" /><stop offset="1" stopColor="#3a5a7a" /></linearGradient>
          </defs>
          {/* nuvens */}
          {Array.from({ length: 7 }).map((_, k) => (
            <ellipse key={k} cx={((k * 210 + f * (0.4 + k * 0.08)) % 1500) - 200} cy={480 + k * 38} rx={260} ry={34} fill="#9fb6cc" opacity={0.08} style={{ filter: 'blur(8px)' }} />
          ))}
          {/* mar (esquerda) e lago (direita) */}
          <polygon points={pol([[-200, hz], [VPx, hz], [X(bordas.mE, 1960), 1960], [-200, 1960]])} fill="url(#dmar)" />
          <polygon points={pol([[VPx, hz], [1300, hz], [1300, baseY + 400], [bordas.lD, baseY + 400]])} fill="url(#dlago)" />
          {/* ondas do mar em perspectiva, andando contra o dique */}
          {Array.from({ length: 70 }).map((_, k) => {
            const z = (rnd(k) + anda * 0.8) % 1;
            const y = hz + 6 + z * z * (baseY - hz + 200);
            const esc = (y - hz) / (baseY - hz);
            const lim = X(bordas.mE, y) - 6;
            const x = -60 + rnd(k + 9) * (lim + 60) + ((f * 1.6 * esc) % 80);
            if (x > lim) return null;
            return <line key={k} x1={x} x2={Math.min(lim, x + 26 + 90 * esc)} y1={y} y2={y} stroke="#e4f4ff" strokeOpacity={0.2 + 0.5 * esc} strokeWidth={1 + 5 * esc} strokeLinecap="round" />;
          })}
          {/* espuma batendo no talude do lado do mar */}
          {Array.from({ length: 20 }).map((_, k) => {
            const z = (k / 20 + anda) % 1;
            const y = hz + z * z * (baseY - hz);
            const esc = (y - hz) / (baseY - hz);
            const ph = (f * 0.08 + rnd(k)) % 1;
            return <circle key={k} cx={X(bordas.mE, y) - 6 - ph * 30 * esc} cy={y - ph * 40 * esc} r={(4 + ph * 18) * esc + 1} fill="#f2fbff" opacity={(1 - ph) * 0.75} />;
          })}
          {/* brilho do lago */}
          {Array.from({ length: 30 }).map((_, k) => {
            const z = (rnd(k + 40) + anda * 0.5) % 1;
            const y = hz + 4 + z * z * (baseY - hz + 200);
            const esc = (y - hz) / (baseY - hz);
            const x0 = X(bordas.lD, y) + 10;
            const x = x0 + rnd(k + 3) * (1300 - x0);
            return <line key={k} x1={x} x2={x + 20 + 50 * esc} y1={y} y2={y} stroke="#e8f6ff" strokeOpacity={0.12 + 0.25 * esc} strokeWidth={1 + 3 * esc} strokeLinecap="round" />;
          })}
          {/* talude de pedra (mar), estrada e talude de grama (lago) */}
          <polygon points={pol([[VPx, hz], [X(bordas.mE, 1960), 1960], [X(bordas.rE, 1960), 1960]])} fill="#3d4146" />
          <polygon points={pol([[VPx, hz], [X(bordas.rE, 1960), 1960], [X(bordas.rD, 1960), 1960]])} fill="#2b3036" />
          <polygon points={pol([[VPx, hz], [X(bordas.rD, 1960), 1960], [X(bordas.lD, 1960), 1960]])} fill="#3f6b3a" />
          {/* faixas da estrada andando */}
          {Array.from({ length: 14 }).map((_, k) => {
            const z0 = (k / 14 + anda) % 1, z1 = Math.min(1, z0 + 0.03);
            const y0 = hz + z0 * z0 * (baseY - hz), y1 = hz + z1 * z1 * (baseY - hz);
            const m = (bordas.rE + bordas.rD) / 2;
            const e0 = (y0 - hz) / (baseY - hz), e1 = (y1 - hz) / (baseY - hz);
            return <polygon key={k} points={pol([[X(m, y0) - 3 * e0, y0], [X(m, y0) + 3 * e0, y0], [X(m, y1) + 4 * e1, y1], [X(m, y1) - 4 * e1, y1]])} fill="#e6c36a" opacity={0.9} />;
          })}
          <line x1={VPx} y1={hz} x2={bordas.rE + 6} y2={baseY} stroke="#cfd6dc" strokeWidth={3} opacity={0.6} />
          <line x1={VPx} y1={hz} x2={bordas.rD - 6} y2={baseY} stroke="#cfd6dc" strokeWidth={3} opacity={0.6} />
          {/* postes */}
          {Array.from({ length: 8 }).map((_, k) => {
            const z = (k / 8 + anda) % 1;
            const y = hz + z * z * (baseY - hz);
            const esc = (y - hz) / (baseY - hz);
            const x = X(bordas.rD + 20, y);
            return (
              <g key={k}>
                <line x1={x} x2={x} y1={y} y2={y - 150 * esc} stroke="#9aa6b1" strokeWidth={1 + 4 * esc} />
                <circle cx={x - 12 * esc} cy={y - 150 * esc} r={2 + 6 * esc} fill="#ffe7a8" style={{ filter: 'drop-shadow(0 0 6px #ffd37a)' }} />
              </g>
            );
          })}
          {/* névoa no horizonte */}
          <rect x={-200} y={hz - 30} width={1500} height={70} fill="#8fb0cc" opacity={0.18} style={{ filter: 'blur(14px)' }} />
        </svg>
        <Pilula x={60} y={1260} texto="NORTH SEA" s={c.gancho ? 1 : spr(f, 4)} tam={40} />
        <Pilula x={W - 60} y={1260} texto="FRESHWATER LAKE" s={c.gancho ? 1 : spr(f, 8)} tam={40} ancora="r" fundo="rgba(9,50,86,0.9)" />
        {c.final && (
          <>
            <Selo f={f} ini={6} x={W / 2} y={560} texto="32 KM" />
            <Selo f={f} ini={18} x={W / 2} y={680} texto="CLOSED IN 1932" cor={C.white} tam={50} />
          </>
        )}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={atrasoTitulo(c)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
 * MARINA BARRAGE — vista de cima da baía, piscina olímpica, portões e corte com bombas
 * ===================================================================== */
const Predios: React.FC<{ f: number; lista: [number, number, number, number, number][] }> = ({ f, lista }) => (
  <>
    {lista.map(([x, y, w, h, alt], k) => (
      <g key={k}>
        {/* sombra e lateral (altura) */}
        <polygon points={pol([[x + w, y], [x + w + alt * 0.5, y - alt * 0.35], [x + w + alt * 0.5, y + h - alt * 0.35], [x + w, y + h]])} fill="#0e1e2e" />
        <polygon points={pol([[x, y], [x + alt * 0.5, y - alt * 0.35], [x + w + alt * 0.5, y - alt * 0.35], [x + w, y]])} fill="#2c4660" />
        <rect x={x} y={y} width={w} height={h} fill="#22405c" stroke="#3d6283" strokeWidth={2} />
        {Array.from({ length: Math.floor(h / 16) }).map((_, j) => Array.from({ length: Math.floor(w / 16) }).map((__, i) => (rnd(k * 31 + j * 7 + i) > 0.45 ? <rect key={`${j}-${i}`} x={x + 6 + i * 16} y={y + 6 + j * 16} width={7} height={6} fill="#ffd27a" opacity={0.35 + 0.35 * Math.sin(f * 0.05 + k + i + j)} /> : null)))}
      </g>
    ))}
  </>
);

export const Barragem: React.FC<CenaProps> = ({ c, f, dur }) => {
  const modo = c.modo || 'hero';
  const t = f / 30;
  if (modo === 'piscina') {
    // piscina olímpica em perspectiva esvaziando; cronômetro até 9 s
    const p = prog(f, 14, 14 + 72, (x) => x);
    const seg = 9 * p;
    const x0 = 140, x1 = 940, yT = 820, yB = 1080, prof = 170;
    const nivel = lerp(yT + 10, yT + prof - 6, p);
    return (
      <AbsoluteFill>
        <Fundo f={f} grade={false} />
        <Poeira f={f} n={20} cor={C.water} />
        <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.06) }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            {/* deck */}
            <polygon points={pol([[x0 - 60, yT - 40], [x1 + 60, yT - 40], [x1 + 120, yB + 60], [x0 - 120, yB + 60]])} fill="#c8ced3" />
            {/* caixa da piscina (paredes internas) */}
            <polygon points={pol([[x0, yT], [x1, yT], [x1 + 40, yB], [x0 - 40, yB]])} fill="#2a7fb8" />
            <polygon points={pol([[x0 - 40, yB], [x1 + 40, yB], [x1 + 40, yB + prof * 0.6], [x0 - 40, yB + prof * 0.6]])} fill="#e9eef2" />
            {/* água (volume diminuindo) */}
            {p < 1 && (
              <>
                <polygon points={pol([[x0 - 40, yB], [x1 + 40, yB], [x1 + 40, yB + prof * 0.6 * (1 - p)], [x0 - 40, yB + prof * 0.6 * (1 - p)]])} fill="#3fa7f5" opacity={0.95} />
                <polygon points={pol([[x0 + (nivel - yT) * 0.04, nivel], [x1 - (nivel - yT) * 0.04, nivel], [x1 + 40, yB], [x0 - 40, yB]])} fill="#3fa7f5" opacity={0.92 * (1 - p * 0.6)} />
              </>
            )}
            {/* raias */}
            {Array.from({ length: 9 }).map((_, k) => {
              const u = (k + 1) / 10;
              return <line key={k} x1={lerp(x0, x1, u)} y1={yT} x2={lerp(x0 - 40, x1 + 40, u)} y2={yB} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={4} strokeDasharray="18 12" />;
            })}
            {/* ralo */}
            {p > 0 && p < 1 && [0, 1, 2, 3].map((k) => {
              const ph = (f * 0.08 + k / 4) % 1;
              return <circle key={k} cx={540} cy={yB + prof * 0.3} r={10 + ph * 60} fill="none" stroke="#fff" strokeWidth={3} opacity={(1 - ph) * 0.6} />;
            })}
          </svg>
          <Pilula x={W / 2} y={1180} texto="50 M × 25 M" s={spr(f, 6)} tam={38} ancora="c" />
          <div style={{ position: 'absolute', left: 0, width: W, top: 470, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, transform: `scale(${spr(f, 0) * (p >= 1 ? 1 + 0.06 * (1 - spr(f, 86, { damping: 7, stiffness: 300 })) : 1)})` }}>
            <span style={{ fontFamily: F.cond, fontWeight: 900, fontSize: 230, lineHeight: 1, color: p >= 1 ? C.amber : C.white, fontVariantNumeric: 'tabular-nums', textShadow: p >= 1 ? `0 0 60px ${C.amber}aa` : '0 8px 30px rgba(0,0,0,0.6)' }}>{seg.toFixed(1)}</span>
            <span style={{ fontFamily: F.cond, fontWeight: 900, fontSize: 110, lineHeight: 1.3, color: p >= 1 ? C.amber : C.white }}>s</span>
          </div>
          <Choque f={f} ini={86} x={540} y={580} cor={C.amber} />
        </div>
        <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
      </AbsoluteFill>
    );
  }
  if (modo === 'portoes' || modo === 'corte') {
    const corte = modo === 'corte';
    const leito = 1260;
    const mar = corte ? lerp(960, 870, prog(f, 0, dur * 0.6, EIO)) : 900;
    const res = corte ? 930 : 960;
    const n = 9;
    const x0 = 80, x1 = 1000;
    const vao = (x1 - x0) / n;
    if (!corte) {
      // frente: 9 portões entre pilares, mar batendo na frente
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0b1828 0%, #13304a 42%, #0b1828 60%, #050c15 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.07) }}>
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              <rect x={-40} y={760} width={1160} height={60} fill="#2c6f6a" opacity={0.7} />
              {Array.from({ length: n }).map((_, k) => {
                const s = spr(f, 6 + k * 5, { damping: 11, stiffness: 190 });
                return (
                  <g key={k}>
                    <rect x={x0 + k * vao + 10} y={830} width={vao - 20} height={240} fill={s > 0.5 ? '#22323f' : '#1a2733'} stroke={C.amber} strokeWidth={5 * s} />
                    <text x={x0 + k * vao + vao / 2} y={980} textAnchor="middle" fill={C.amber} fontFamily={F.cond} fontWeight={900} fontSize={54} opacity={s}>{k + 1}</text>
                  </g>
                );
              })}
              {Array.from({ length: n + 1 }).map((_, k) => <rect key={k} x={x0 + k * vao - 12} y={790} width={24} height={500} fill="#9aa6b1" />)}
              <rect x={x0 - 30} y={780} width={x1 - x0 + 60} height={22} fill="#c9d3dc" />
              <path d={`${onda(mar + 140, -40, 1120, f, 10, 0.025, 0.3)} L1120,1700 L-40,1700 Z`} fill="#0f4a78" opacity={0.95} />
              <path d={onda(mar + 140, -40, 1120, f, 10, 0.025, 0.3)} stroke="#d6f1ff" strokeWidth={4} fill="none" />
              {Array.from({ length: 16 }).map((_, k) => {
                const ph = (f * 0.07 + rnd(k)) % 1;
                return <circle key={k} cx={rnd(k + 3) * W} cy={mar + 130 - ph * 60} r={5 + ph * 12} fill="#eaf7ff" opacity={(1 - ph) * 0.55} />;
              })}
            </svg>
            <Pilula x={W / 2} y={1330} texto="SEA STAYS OUT" s={spr(f, 52)} ancora="c" fundo={C.amber} cor={C.navy} />
          </div>
          <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
        </AbsoluteFill>
      );
    }
    // corte: mar (maré alta) à esquerda, reservatório com chuva à direita, bombas empurrando a água para o mar
    const dx0 = 440, dx1 = 640;
    const bombas = Math.min(7, Math.floor(prog(f, 50, 50 + 7 * 6, (x) => x) * 7 + (f >= 50 ? 1 : 0)));
    return (
      <AbsoluteFill>
        <Fundo f={f} grade={false} />
        <div style={{ position: 'absolute', inset: 0, transform: camera(f, dur, 0.06) }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <defs><linearGradient id="bcA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b8fd8" /><stop offset="1" stopColor="#0b3558" /></linearGradient></defs>
            <path d={`${onda(mar, -40, dx0, f, 7)} L${dx0},${leito} L-40,${leito} Z`} fill="url(#bcA)" />
            <path d={`${onda(res, dx1, 1120, f, 3)} L1120,${leito} L${dx1},${leito} Z`} fill="url(#bcA)" opacity={0.95} />
            <path d={onda(mar, -40, dx0, f, 7)} stroke="#d6f1ff" strokeWidth={4} fill="none" />
            <path d={onda(res, dx1, 1120, f, 3)} stroke="#d6f1ff" strokeWidth={3} fill="none" />
            {/* barragem */}
            <polygon points={pol([[dx0 - 40, leito], [dx0, 820], [dx1, 820], [dx1 + 40, leito]])} fill="#5a5f63" />
            <rect x={dx0 - 6} y={820} width={30} height={200} fill={C.amber} />
            {/* casa de bombas: tubo e jato */}
            <path d={`M${dx1 + 20},1180 L${dx1 - 60},1180 L${dx1 - 60},790 L${dx0 - 30},790 L${dx0 - 60},860`} stroke="#c9d3dc" strokeWidth={34} fill="none" strokeLinejoin="round" />
            {f > 50 && Array.from({ length: 10 }).map((_, k) => {
              const ph = (f * 0.05 + k / 10) % 1;
              const pts: [number, number][] = [[dx1 + 20, 1180], [dx1 - 60, 1180], [dx1 - 60, 790], [dx0 - 30, 790], [dx0 - 60, 860]];
              const seg = ph * 4, i = Math.min(3, Math.floor(seg)), u = seg - i;
              const [x, y] = [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)];
              return <circle key={k} cx={x} cy={y} r={9} fill="#fff" opacity={0.9} />;
            })}
            {f > 50 && Array.from({ length: 8 }).map((_, k) => {
              const ph = (f * 0.06 + k / 8) % 1;
              return <circle key={k} cx={dx0 - 70 - ph * 120} cy={870 + ph * ph * 90} r={8 + ph * 6} fill="#e8f6ff" opacity={1 - ph} />;
            })}
            <rect x={-40} y={leito} width={1160} height={500} fill="#3a3326" />
          </svg>
          <Chuva f={f} n={50} op={0.45} />
          <div style={{ position: 'absolute', left: 40, top: 1190, fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.white }}>SEA · HIGH TIDE</div>
          <div style={{ position: 'absolute', right: 40, top: 1190, fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.white }}>RESERVOIR</div>
          <div style={{ position: 'absolute', left: 0, width: W, top: 560, display: 'flex', justifyContent: 'center', gap: 16, opacity: prog(f, 44, 52) }}>
            {Array.from({ length: 7 }).map((_, k) => (
              <div key={k} style={{ width: 92, height: 92, borderRadius: 46, border: `5px solid ${C.amber}`, background: k < bombas ? C.amber : 'rgba(6,14,24,0.85)', display: 'grid', placeItems: 'center', fontFamily: F.cond, fontWeight: 900, fontSize: 52, color: k < bombas ? C.navy : C.amber, boxShadow: k < bombas ? `0 0 24px ${C.amber}` : 'none', transform: `rotate(${k < bombas ? f * 6 : 0}deg)` }}>✣</div>
            ))}
          </div>
          <Pilula x={W / 2} y={720} texto="7 PUMPS" s={spr(f, 54)} ancora="c" fundo={C.amber} cor={C.navy} />
        </div>
        <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
      </AbsoluteFill>
    );
  }
  // ---------- hero: baía vista de cima, barragem na boca, mar agitado do lado de fora ----------
  const yDam = 800, hDam = 46;
  const doce = c.final ? 1 : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: '#050c15' }} />
      <div style={{ position: 'absolute', inset: 0, transform: camera(f + (c.gancho ? 30 : 0), dur, 0.07) }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="bmar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06213a" /><stop offset="1" stopColor="#0d3a5e" /></linearGradient>
            <radialGradient id="bres" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stopColor="#3fa7f5" /><stop offset="1" stopColor="#1a5e98" /></radialGradient>
          </defs>
          {/* mar (em cima) */}
          <rect x={-60} y={-60} width={W + 120} height={yDam + 60} fill="url(#bmar)" />
          {Array.from({ length: 40 }).map((_, k) => {
            const y = 380 + rnd(k) * (yDam - 400);
            const x = ((f * (2.5 + rnd(k + 4) * 2) + rnd(k + 9) * 1300) % 1300) - 120;
            return <path key={k} d={`M${x},${y} q20,-10 40,0 q20,10 40,0`} stroke="#d8f0ff" strokeOpacity={0.35} strokeWidth={4} fill="none" />;
          })}
          {/* terra: margens da baía */}
          <path d={`M-60,${yDam - 10} L250,${yDam - 10} C230,1000 200,1150 260,1400 L-60,1400 Z`} fill="#16283a" />
          <path d={`M${W + 60},${yDam - 10} L820,${yDam - 10} C860,1000 900,1150 820,1400 L${W + 60},1400 Z`} fill="#16283a" />
          <rect x={-60} y={1400} width={W + 120} height={600} fill="#16283a" />
          {/* reservatório */}
          <path d={`M250,${yDam + hDam} L820,${yDam + hDam} C860,1000 900,1150 820,1400 L260,1400 C200,1150 230,1000 250,${yDam + hDam} Z`} fill="url(#bres)" opacity={0.85 + 0.15 * doce} />
          {Array.from({ length: 20 }).map((_, k) => {
            const x = 300 + rnd(k) * 480, y = 880 + rnd(k + 3) * 480;
            return <line key={k} x1={x + Math.sin(f * 0.05 + k) * 10} x2={x + 30 + Math.sin(f * 0.05 + k) * 10} y1={y} y2={y} stroke="#e8f6ff" strokeOpacity={0.22} strokeWidth={3} strokeLinecap="round" />;
          })}
          {/* barragem com 9 portões e casa de bombas */}
          <rect x={240} y={yDam} width={590} height={hDam} fill="#c9d3dc" />
          {Array.from({ length: 9 }).map((_, k) => <rect key={k} x={262 + k * 56} y={yDam + 8} width={44} height={hDam - 16} fill={C.amber} style={{ filter: `drop-shadow(0 0 8px ${C.amber})` }} />)}
          <rect x={780} y={yDam - 40} width={90} height={hDam + 60} rx={8} fill="#e6ecf1" stroke="#2b3a48" strokeWidth={3} />
          {/* espuma batendo na barragem */}
          {Array.from({ length: 18 }).map((_, k) => {
            const ph = (f * 0.08 + rnd(k)) % 1;
            return <circle key={k} cx={250 + rnd(k + 2) * 580} cy={yDam - 6 - ph * 50} r={5 + ph * 16} fill="#eef9ff" opacity={(1 - ph) * 0.6} />;
          })}
          {/* cidade (genérica) nas margens */}
          <Predios f={f} lista={[[40, 900, 80, 60, 120], [140, 980, 60, 90, 180], [30, 1080, 110, 70, 90], [150, 1150, 70, 70, 220], [40, 1250, 90, 60, 150], [900, 880, 90, 60, 200], [880, 990, 70, 80, 140], [960, 1090, 90, 70, 240], [870, 1200, 80, 70, 110], [300, 1440, 120, 60, 160], [460, 1450, 90, 70, 260], [600, 1440, 110, 60, 180], [740, 1460, 80, 60, 120]]} />
        </svg>
        <Pilula x={W / 2} y={700} texto="THE SEA" s={c.gancho ? 1 : spr(f, 4)} ancora="c" />
        <Pilula x={W / 2} y={1130} texto="FRESH WATER" s={c.gancho ? 1 : spr(f, 8)} ancora="c" fundo="rgba(9,50,86,0.9)" />
        {c.final && <Selo f={f} ini={8} x={W / 2} y={980} texto="DRINKING WATER" tam={60} />}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={atrasoTitulo(c)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
 * PÓLDER — cidade que nasce no antigo fundo do mar (Almere)
 * ===================================================================== */
export const Polder: React.FC<CenaProps> = ({ c, f, dur }) => {
  const t = f / 30;
  const seca = prog(f, -4, 18, EO);
  const cresce = prog(f, 12, dur * 0.75, EIO);
  const cx = 560, cy = 950;
  const quadras = Array.from({ length: 90 }).map((_, k) => {
    const gx = (k % 10) - 4.5, gy = Math.floor(k / 10) - 4;
    const d = Math.hypot(gx, gy * 1.2) + rnd(k) * 1.2;
    return { x: cx + gx * 78 + (gy % 2) * 10, y: cy + gy * 70, d, alt: 10 + rnd(k + 5) * 40 };
  });
  const dMax = 7.5;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: '#050c15' }} />
      <div style={{ position: 'absolute', inset: 0, transform: `${camera(f, dur, 0.12)} rotate(${-6 + wob(t * 0.3, 2)}deg)` }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {/* parcelas do pólder */}
          {Array.from({ length: 12 }).map((_, i) => Array.from({ length: 16 }).map((__, j) => (
            <rect key={`${i}-${j}`} x={-200 + i * 130} y={200 + j * 110} width={124} height={104} fill={['#2f4a2a', '#3b5a2f', '#4a5a2e', '#36502c'][(i * 7 + j * 3) % 4]} />
          )))}
          {/* canais retos */}
          {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-200} y={420 + i * 220} width={1600} height={8} fill="#2f86c6" opacity={0.8} />)}
          <rect x={-200} y={1260} width={1600} height={26} fill="#3a3f44" />
          {/* mar que se retira */}
          {seca < 1 && <rect x={-300} y={0} width={1700} height={2000} fill="#1d6fae" opacity={1 - seca} />}
          {/* quadras crescendo do centro */}
          {quadras.map((q, k) => {
            const on = clamp((cresce * dMax - q.d) * 1.5);
            if (on <= 0) return null;
            const a = q.alt * on;
            return (
              <g key={k}>
                <polygon points={pol([[q.x + 60, q.y], [q.x + 60 + a * 0.5, q.y - a * 0.4], [q.x + 60 + a * 0.5, q.y + 48 - a * 0.4], [q.x + 60, q.y + 48]])} fill="#0e1e2e" opacity={0.8} />
                <rect x={q.x} y={q.y} width={60} height={48} fill={k % 9 === 0 ? '#c9a26b' : '#8e9aa6'} opacity={0.95} />
                <polygon points={pol([[q.x, q.y], [q.x + a * 0.5, q.y - a * 0.4], [q.x + 60 + a * 0.5, q.y - a * 0.4], [q.x + 60, q.y]])} fill={k % 9 === 0 ? '#e6c88f' : '#c9d3dc'} />
              </g>
            );
          })}
        </svg>
      </div>
      <Pilula x={W / 2} y={490} texto={cresce < 0.15 ? 'OLD SEABED' : 'A NEW CITY'} s={spr(f, 4)} ancora="c" fundo={cresce < 0.15 ? 'rgba(6,14,24,0.86)' : C.amber} cor={cresce < 0.15 ? C.white : C.navy} />
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};
