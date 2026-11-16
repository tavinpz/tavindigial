import React from 'react';
import { random } from 'remotion';
import tempos from '../../public/sr71/tempos.json';
import { C, L, MONO } from '../b52/lib';

export * from '../b52/lib';

// Peças do Crosswind #02 (SR-71). Mesma identidade do #01, com o avião preto.
export const K = {
  preto: '#14181d', preto2: '#2a313a', borda: '#8a95a1', fuel: '#ffb347', fuel2: '#ffd89a',
  concreto: '#4a525b', concreto2: '#566069', quente: '#ff5a2a', ceu1: '#070d15', ceu2: '#22303e',
};

// quadro (relativo ao início do bloco) em que a fala i começa; com `palavra`, o quadro aproximado em que ela é dita
export const marca = (cena: string, i: number, palavra?: string) => {
  const b = (tempos as any).blocos.find((x: any) => x.cena === cena);
  const f = b.falas[i];
  let t = f.t;
  if (palavra) {
    const k = f.txt.toLowerCase().indexOf(palavra.toLowerCase());
    if (k >= 0) t += (f.d * k) / (f.txt.length + 1);
  }
  return Math.round((t - b.ini) * 30);
};

export const DefsSR: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-fus`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#161a1f" /><stop offset="0.42" stopColor="#4a535e" /><stop offset="0.5" stopColor="#5b6570" /><stop offset="0.58" stopColor="#3b434d" /><stop offset="1" stopColor="#14181c" />
    </linearGradient>
    <linearGradient id={`${id}-asa`} x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stopColor="#39414b" /><stop offset="0.5" stopColor="#262c34" /><stop offset="1" stopColor="#181c21" />
    </linearGradient>
    <linearGradient id={`${id}-nac`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1a1e23" /><stop offset="0.4" stopColor="#566069" /><stop offset="0.62" stopColor="#353c45" /><stop offset="1" stopColor="#121519" />
    </linearGradient>
    <linearGradient id={`${id}-lado`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#59636e" /><stop offset="0.35" stopColor="#333a43" /><stop offset="1" stopColor="#111418" />
    </linearGradient>
    <linearGradient id={`${id}-hot`} x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stopColor="#ffd27a" /><stop offset="0.25" stopColor="#ff7a2a" /><stop offset="0.7" stopColor="#d6361f" /><stop offset="1" stopColor="#ff6a2a" />
    </linearGradient>
    <radialGradient id={`${id}-vidro`} cx="0.35" cy="0.3" r="0.9"><stop offset="0" stopColor="#7fb4d8" /><stop offset="1" stopColor="#12202c" /></radialGradient>
  </defs>
);

export const ASA_SR = 'M150,0 C136,1 126,3 112,5.5 L80,9.5 L45,13 L18,16.5 L-81.6,74 Q-90,78.5 -100,77 L-112,70 L-121,44 L-123,12 L-150,2 L-150,-2 L-123,-12 L-121,-44 L-112,-70 L-100,-77 Q-90,-78.5 -81.6,-74 L18,-16.5 L45,-13 L80,-9.5 L112,-5.5 C126,-3 136,-1 150,0 Z';
const FUS_SR = 'M150,0 C140,0.6 128,2 112,3.4 L60,6.6 L0,8.4 L-90,7.6 L-128,5 L-150,1.4 L-150,-1.4 L-128,-5 L-90,-7.6 L0,-8.4 L60,-6.6 L112,-3.4 C128,-2 140,-0.6 150,0 Z';

// SR-71 visto de cima. Nariz para +x, comprimento 300, envergadura 155.
// calor: 0..1 (pele aquecida) · costuras: 0..1 (emendas em destaque) · cresce: 0..1 (afasta os painéis)
export const SR71Topo: React.FC<{ id: string; sombra?: boolean; calor?: number; costuras?: number; pos?: number }> = ({ id, sombra, calor = 0, costuras = 0, pos = 0 }) => {
  if (sombra) return <g><path d={ASA_SR} fill="#000" />{[-36, 36].map((y) => <rect key={y} x={-128} y={y - 9} width={128} height={18} rx={9} fill="#000" />)}</g>;
  const tr = K.borda;
  return (
    <g>
      <DefsSR id={id} />
      <path d={ASA_SR} fill={`url(#${id}-asa)`} stroke={tr} strokeWidth={0.9} strokeLinejoin="round" />
      {/* corrugado e linhas de painel */}
      {[18, 24, 46, 52, 58, 64, 70].flatMap((y) => [y, -y]).map((y) => {
        const a = Math.abs(y), xl = 18 - (a - 16.5) * 1.732 - 5;
        return <line key={y} x1={xl} y1={y} x2={a > 44 ? -116 + (74 - a) * 0.15 : -120} y2={y} stroke="#7a8590" strokeWidth={0.35} opacity={0.5} />;
      })}
      {[-20, -60, -95].map((x) => <path key={x} d={`M${x},-${Math.min(74, 16.5 + (18 - x) / 1.732) - 2} L${x},${Math.min(74, 16.5 + (18 - x) / 1.732) - 2}`} stroke="#7a8590" strokeWidth={0.4} opacity={0.45} />)}
      {/* faixas vermelhas de "no step" */}
      {[-1, 1].map((s) => <path key={s} d={`M-30,${s * 13} L-112,${s * 13} L-112,${s * 25} L-45,${s * 25}`} fill="none" stroke="#b3262a" strokeWidth={0.7} opacity={0.75} />)}
      {costuras > 0 && <g opacity={costuras} stroke={K.fuel} strokeWidth={1.1} fill="none" strokeLinecap="round">
        {[20, 48, 60].flatMap((y) => [y, -y]).map((y) => <line key={y} x1={-18 - Math.abs(y) * 0.9} y1={y} x2={-112} y2={y} />)}
        {[-40, -78].map((x) => { const h = Math.min(73, 16.5 + (18 - x) / 1.732) - 3; return <path key={x} d={`M${x},${-h} L${x},-46 M${x},-26 L${x},26 M${x},46 L${x},${h}`} />; })}
      </g>}
      {/* calor na pele */}
      {calor > 0 && <g style={{ mixBlendMode: 'screen' }}>
        <path d={ASA_SR} fill={`url(#${id}-hot)`} opacity={calor * 0.32} />
        <path d={ASA_SR} fill="none" stroke="#ff8a2a" strokeWidth={5} opacity={calor * 0.35} style={{ filter: 'blur(3px)' }} />
        <path d={ASA_SR} fill="none" stroke="#ffd27a" strokeWidth={1.4} opacity={calor * 0.9} />
      </g>}
      <path d={FUS_SR} fill={`url(#${id}-fus)`} stroke={tr} strokeWidth={0.6} />
      {/* naceles */}
      {[-36, 36].map((y) => (
        <g key={y}>
          <path d={`M-4,${y - 8} C-40,${y - 10.5} -90,${y - 10} -126,${y - 7.5} L-126,${y + 7.5} C-90,${y + 10} -40,${y + 10.5} -4,${y + 8} Z`} fill={`url(#${id}-nac)`} stroke={tr} strokeWidth={0.8} />
          <rect x={-8} y={y - 8} width={5} height={16} rx={2} fill="#0b0d10" stroke={tr} strokeWidth={0.5} />
          <path d={`M-5,${y - 5.4} L14,${y} L-5,${y + 5.4} Z`} fill="#6c7782" stroke={tr} strokeWidth={0.5} />
          <rect x={-133} y={y - 7} width={8} height={14} rx={2} fill="#0d0f12" stroke="#59626c" strokeWidth={0.6} />
          {[-4.5, -1.5, 1.5, 4.5].map((d) => <line key={d} x1={-133} y1={y + d} x2={-126} y2={y + d} stroke="#4a525b" strokeWidth={0.4} />)}
          {/* deriva inclinada para dentro */}
          <path d={`M-70,${y} L-104,${y - Math.sign(y) * 7.5} L-121,${y - Math.sign(y) * 7.5} L-116,${y} Z`} fill="#3d4650" stroke={tr} strokeWidth={0.6} />
          {calor > 0 && <path d={`M-5,${y - 5.4} L14,${y} L-5,${y + 5.4} Z`} fill="#ff9a3a" opacity={calor * 0.7} />}
        </g>
      ))}
      {calor > 0 && <path d="M150,0 C140,0.6 128,2 112,3.4 L96,4.4 L96,-4.4 L112,-3.4 C128,-2 140,-0.6 150,0 Z" fill="#ffb347" opacity={calor * 0.8} style={{ mixBlendMode: 'screen' }} />}
      {/* cabines */}
      <path d="M104,-2.6 L92,-3.6 L92,3.6 L104,2.6 Z" fill={`url(#${id}-vidro)`} stroke="#0b0d10" strokeWidth={0.5} />
      <path d="M88,-3.4 L80,-3.6 L80,3.6 L88,3.4 Z" fill={`url(#${id}-vidro)`} stroke="#0b0d10" strokeWidth={0.5} />
      <line x1={76} y1={0} x2={-140} y2={0} stroke="#79838e" strokeWidth={0.5} opacity={0.6} />
      {pos > 0 && [-36, 36].map((y) => <g key={'p' + y} opacity={pos}>
        <path d={`M-133,${y - 6} L${-150 - 40 * pos},${y} L-133,${y + 6} Z`} fill="#ff9a3a" opacity={0.85} />
        <path d={`M-133,${y - 3.4} L${-146 - 20 * pos},${y} L-133,${y + 3.4} Z`} fill="#fff1c9" />
      </g>)}
    </g>
  );
};

// SR-71 de lado. Nariz para +x, comprimento 300. Solo em y = +36.5 quando trem = 1.
export const SR71Lado: React.FC<{ id: string; trem?: number; calor?: number; pos?: number; verde?: number }> = ({ id, trem = 1, calor = 0, pos = 0, verde = 0 }) => {
  const tr = K.borda;
  const FUS = 'M150,2 C132,-1 112,-5 96,-7 L90,-12.5 C84,-14.5 74,-14.8 66,-12.5 L56,-9 L-40,-9.5 L-128,-5 L-150,0 L-128,4 L-40,8.5 L60,8.5 L112,6.5 C130,5 142,3.5 150,2 Z';
  const roda = (x: number, r: number, compr: number) => (
    <g opacity={trem}>
      <line x1={x} y1={7} x2={x} y2={compr} stroke="#aab3bd" strokeWidth={2.2} />
      <line x1={x + 6} y1={8} x2={x} y2={compr - 6} stroke="#7d8792" strokeWidth={1.2} />
      <circle cx={x} cy={36.5 - r} r={r} fill="#0c0e11" stroke="#9aa4af" strokeWidth={1} />
      <circle cx={x} cy={36.5 - r} r={r * 0.42} fill="#c9d0d7" />
    </g>
  );
  return (
    <g>
      <DefsSR id={id} />
      {roda(-27, 6.2, 27)}
      <path d={FUS} fill={`url(#${id}-lado)`} stroke={tr} strokeWidth={0.8} strokeLinejoin="round" />
      {calor > 0 && <path d={FUS} fill={`url(#${id}-hot)`} opacity={calor * 0.5} style={{ mixBlendMode: 'screen' }} />}
      <path d="M146,2.4 L112,3 L40,3.6 L10,3.2" stroke="#9aa4af" strokeWidth={0.5} fill="none" opacity={0.8} />
      <path d="M89,-11.6 C84,-13.4 78,-13.6 75,-12.6 L75,-8.6 L89,-8.2 Z" fill={`url(#${id}-vidro)`} stroke="#0b0d10" strokeWidth={0.5} />
      <path d="M72,-12.4 C69,-12.8 66,-12.4 63,-11 L63,-8.8 L72,-8.6 Z" fill={`url(#${id}-vidro)`} stroke="#0b0d10" strokeWidth={0.5} />
      {[40, 0, -50, -95].map((x) => <line key={x} x1={x} y1={-9} x2={x} y2={8} stroke="#6f7984" strokeWidth={0.35} opacity={0.6} />)}
      {/* asa de perfil */}
      <path d="M18,1 L-121,2.2 L-121,4.2 L10,4 Z" fill="#1b1f25" stroke={tr} strokeWidth={0.5} />
      {/* deriva */}
      <path d="M-66,-8 L-97,-40 L-117,-40 L-113,-8 Z" fill={`url(#${id}-lado)`} stroke={tr} strokeWidth={0.8} strokeLinejoin="round" />
      <line x1={-101} y1={-38} x2={-106} y2={-9} stroke="#6f7984" strokeWidth={0.4} />
      {/* nacele do lado de cá */}
      <path d="M-4,-7 C-40,-9.6 -90,-9.2 -126,-6.6 L-126,8.6 C-90,11.2 -40,11.6 -4,9 Z" fill={`url(#${id}-nac)`} stroke={tr} strokeWidth={0.8} />
      <rect x={-8} y={-7} width={5} height={16} rx={2} fill="#0b0d10" stroke={tr} strokeWidth={0.5} />
      <path d="M-5,-4.4 L15,1 L-5,6.4 Z" fill="#6c7782" stroke={tr} strokeWidth={0.5} />
      <rect x={-133} y={-6} width={8} height={14} rx={2} fill="#0d0f12" stroke="#59626c" strokeWidth={0.6} />
      {[-70, -30].map((x) => <line key={x} x1={x} y1={-9} x2={x} y2={11} stroke="#6f7984" strokeWidth={0.35} opacity={0.6} />)}
      {verde > 0 && <g opacity={verde}><ellipse cx={-146} cy={1} rx={22} ry={9} fill="#5dff9a" opacity={0.75} /><ellipse cx={-140} cy={1} rx={10} ry={5} fill="#eafff2" /></g>}
      {pos > 0 && <g opacity={pos}>
        <path d={`M-133,-5 L${-150 - 70 * pos},1 L-133,7 Z`} fill="#ff8a2a" opacity={0.8} />
        <path d={`M-133,-2.6 L${-146 - 36 * pos},1 L-133,4.6 Z`} fill="#fff1c9" />
      </g>}
      {roda(62, 4.6, 30)}
      {roda(-33, 6.4, 26)}
    </g>
  );
};

// Laje de concreto do pátio vista de cima (com juntas e manchas)
export const Patio: React.FC<{ w?: number; h?: number; ox?: number; oy?: number }> = ({ w = 2600, h = 1700, ox = -340, oy = -310 }) => (
  <g>
    <rect x={ox} y={oy} width={w} height={h} fill={K.concreto} />
    {Array.from({ length: 60 }, (_, i) => <ellipse key={i} cx={ox + random(`px${i}`) * w} cy={oy + random(`py${i}`) * h} rx={40 + random(`pr${i}`) * 160} ry={20 + random(`ps${i}`) * 70} fill={random(`pc${i}`) > 0.5 ? '#000' : '#fff'} opacity={0.035} />)}
    {Array.from({ length: Math.ceil(w / 260) + 1 }, (_, i) => <line key={'v' + i} x1={ox + i * 260} y1={oy} x2={ox + i * 260} y2={oy + h} stroke="#2c3238" strokeWidth={3} opacity={0.75} />)}
    {Array.from({ length: Math.ceil(h / 260) + 1 }, (_, i) => <line key={'h' + i} x1={ox} y1={oy + i * 260} x2={ox + w} y2={oy + i * 260} stroke="#2c3238" strokeWidth={3} opacity={0.75} />)}
  </g>
);

// Gota que cai de (x, y0) até o chão (yg), em ciclo, e a onda que ela faz
export const Gota: React.FC<{ g: number; ini: number; x: number; y0: number; yg: number; per: number; esc?: number }> = ({ g, ini, x, y0, yg, per, esc = 1 }) => {
  if (g < ini) return null;
  const ph = ((g - ini) % per) / per, q = Math.min(1, ph / 0.55);
  const y = y0 + (yg - y0) * q * q;
  const r = L(ph, [0.55, 1], [0, 1]);
  return (
    <g>
      {q < 1 && <path d={`M${x},${y - 11 * esc} C${x + 5 * esc},${y - 2 * esc} ${x + 4.5 * esc},${y + 5 * esc} ${x},${y + 5 * esc} C${x - 4.5 * esc},${y + 5 * esc} ${x - 5 * esc},${y - 2 * esc} ${x},${y - 11 * esc} Z`} fill={K.fuel} stroke="#fff3d6" strokeWidth={0.8} />}
      {ph < 0.12 && <circle cx={x} cy={y0} r={3.5 * esc} fill={K.fuel2} />}
      {q >= 1 && <ellipse cx={x} cy={yg + 3} rx={(8 + 30 * r) * esc} ry={(2 + 7 * r) * esc} fill="none" stroke={K.fuel2} strokeWidth={2} opacity={1 - r} />}
    </g>
  );
};

// Poça de combustível no chão (vista de lado, achatada)
export const Poca: React.FC<{ x: number; y: number; rx: number; f: number; k?: number }> = ({ x, y, rx, f, k = 0 }) => rx <= 0 ? null : (
  <g>
    <ellipse cx={x} cy={y} rx={rx} ry={Math.max(2, rx * 0.11)} fill="#17130f" opacity={0.82} />
    <ellipse cx={x} cy={y} rx={rx} ry={Math.max(2, rx * 0.11)} fill="none" stroke={K.fuel} strokeWidth={1.6} opacity={0.75} />
    <ellipse cx={x - rx * 0.25 + Math.sin(f / 22 + k) * rx * 0.08} cy={y - rx * 0.02} rx={rx * 0.42} ry={Math.max(1, rx * 0.03)} fill={K.fuel2} opacity={0.5} />
  </g>
);

export const Ilustracao: React.FC<{ op?: number }> = ({ op = 0.5 }) => (
  <text x={1856} y={52} textAnchor="end" fill={C.cinza} fontFamily={MONO} fontSize={20} letterSpacing={4} opacity={op}>ILLUSTRATION · NOT TO SCALE</text>
);

// ---------- peças extras para as cenas 2 a 17 ----------
import { interpolateColors } from 'remotion';
import { SANS } from '../b52/lib';

export const mix = (t: number, a: string, b: string) => interpolateColors(Math.max(0, Math.min(1, t)), [0, 1], [a, b]);

// texto com contorno suave (para números e títulos em tela)
export const T: React.FC<{ x: number; y: number; s?: number; cor?: string; a?: 'start' | 'middle' | 'end'; w?: number; mono?: boolean; op?: number; ls?: number; children: React.ReactNode }> = ({ x, y, s = 40, cor = C.texto, a = 'start', w = 800, mono, op = 1, ls, children }) => (
  <text x={x} y={y} fill={cor} fontFamily={mono ? MONO : SANS} fontWeight={w} fontSize={s} textAnchor={a} letterSpacing={ls ?? (mono ? 3 : -0.5)} opacity={op} style={{ paintOrder: 'stroke' }} stroke="#000" strokeOpacity={0.45} strokeWidth={Math.max(4, s * 0.09)}>{children}</text>
);

// riscos de velocidade (o ar passando para a esquerda)
export const Riscos: React.FC<{ g: number; n?: number; op?: number; vel?: number; k?: string; y0?: number; y1?: number }> = ({ g, n = 60, op = 1, vel = 1, k = 'r', y0 = 0, y1 = 900 }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const sp = (50 + random(`${k}v${i}`) * 70) * vel, len = (100 + random(`${k}l${i}`) * 240) * Math.max(0.3, vel);
      const x = 2300 - ((g * sp + random(`${k}o${i}`) * 3000) % 2900), y = y0 + random(`${k}y${i}`) * (y1 - y0);
      return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke="#cfe8ff" strokeWidth={1.2 + random(`${k}w${i}`) * 1.6} strokeLinecap="round" opacity={0.1 + random(`${k}a${i}`) * 0.25} />;
    })}
  </g>
);

export const Painel: React.FC<{ x: number; y: number; w: number; h: number; op?: number; cor?: string; children?: React.ReactNode }> = ({ x, y, w, h, op = 1, cor = '#2c3743', children }) => (
  <g opacity={op}><rect x={x} y={y} width={w} height={h} rx={20} fill="rgba(13,20,28,.92)" stroke={cor} strokeWidth={3} />{children}</g>
);

// termômetro vertical: frac 0..1
export const Termo: React.FC<{ x: number; y: number; h?: number; frac: number; cor?: string }> = ({ x, y, h = 300, frac, cor }) => {
  const c = cor ?? mix(frac, C.azul, K.quente);
  return (
    <g>
      <rect x={x - 13} y={y - h} width={26} height={h + 10} rx={13} fill="#0f151c" stroke="#8f99a5" strokeWidth={3} />
      <circle cx={x} cy={y + 22} r={30} fill="#0f151c" stroke="#8f99a5" strokeWidth={3} />
      <circle cx={x} cy={y + 22} r={21} fill={c} />
      <rect x={x - 7} y={y - (h - 12) * frac} width={14} height={(h - 12) * frac + 14} rx={7} fill={c} />
      {[0.25, 0.5, 0.75, 1].map((q) => <line key={q} x1={x + 16} y1={y - (h - 12) * q} x2={x + 30} y2={y - (h - 12) * q} stroke="#8f99a5" strokeWidth={2.5} />)}
    </g>
  );
};

// emenda entre dois painéis da pele, em corte: folga em px, calor 0..1, combustível em cima
export const Emenda: React.FC<{ g: number; x: number; y: number; w?: number; folga: number; calor?: number; fuel?: number; pinga?: boolean; esp?: number; id?: string }> = ({ g, x, y, w = 520, folga, calor = 0, fuel = 0, pinga = true, esp = 46, id = 'em' }) => {
  const cor = mix(calor, '#59636e', '#c7532a'), cor2 = mix(calor, '#2b323a', '#7d2a18');
  const meio = x + w / 2;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cor} /><stop offset="1" stopColor={cor2} /></linearGradient></defs>
      {fuel > 0 && <g opacity={fuel}>
        <path d={`M${x},${y - 110} ${Array.from({ length: 14 }, (_, i) => `L${x + (w * i) / 13},${y - 110 + Math.sin(g / 9 + i) * 4}`).join(' ')} L${x + w},${y} L${x},${y} Z`} fill={K.fuel} opacity={0.4} />
        <T x={x + 22} y={y - 50} s={26} mono cor={K.fuel2}>FUEL</T>
      </g>}
      <rect x={x} y={y} width={w / 2 - folga / 2} height={esp} rx={5} fill={`url(#${id})`} stroke={K.borda} strokeWidth={2} />
      <rect x={meio + folga / 2} y={y} width={w / 2 - folga / 2} height={esp} rx={5} fill={`url(#${id})`} stroke={K.borda} strokeWidth={2} />
      {[0.12, 0.3, 0.7, 0.88].map((q) => <circle key={q} cx={x + w * q} cy={y + esp / 2} r={5} fill="#12161a" stroke="#9aa4af" strokeWidth={1.5} />)}
      {fuel > 0 && folga > 1.5 && <rect x={meio - folga / 2} y={y - 2} width={folga} height={esp + 4} fill={K.fuel} opacity={0.7 * fuel} />}
      {fuel > 0 && pinga && folga > 2.5 && <Gota g={g} ini={0} x={meio} y0={y + esp + 6} yg={y + esp + 190} per={24} esc={1.5} />}
    </g>
  );
};

// arco de cota (linha com duas pontas) e etiqueta
export const Cota: React.FC<{ x1: number; x2: number; y: number; txt: string; cor?: string; op?: number; s?: number }> = ({ x1, x2, y, txt, cor = C.texto, op = 1, s = 34 }) => (
  <g opacity={op}>
    <line x1={x1} y1={y} x2={x2} y2={y} stroke={cor} strokeWidth={3} />
    <line x1={x1} y1={y - 16} x2={x1} y2={y + 16} stroke={cor} strokeWidth={3} /><line x1={x2} y1={y - 16} x2={x2} y2={y + 16} stroke={cor} strokeWidth={3} />
    <T x={(x1 + x2) / 2} y={y + s + 14} s={s} a="middle" mono cor={cor}>{txt}</T>
  </g>
);

export const Chama: React.FC<{ x: number; y: number; s?: number; g: number; verde?: boolean; op?: number }> = ({ x, y, s = 1, g, verde, op = 1 }) => {
  const k = 6 * Math.sin(g / 2.6 + x);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
      <path d={`M0,${-70 - k} C40,-20 62,10 46,48 C36,76 -36,76 -46,48 C-58,18 -22,6 -18,-22 C-6,-10 4,-34 0,${-70 - k} Z`} fill={verde ? '#39e07a' : C.laranja} />
      <path d={`M0,${-6 - k * 0.5} C18,18 22,36 12,50 C4,60 -12,60 -16,48 C-22,32 -6,22 0,${-6 - k * 0.5} Z`} fill={verde ? '#eafff2' : '#ffe1a6'} />
    </g>
  );
};
