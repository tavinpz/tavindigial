import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { Cota, Defs, Fundo, H, M, MONO, P, Rot, SANS, TIT, Titulo, W } from './lib';
import DE from './alemanha.json';

// Hard to Copy: motor do vídeo longo. Cada fala do tempos.json traz em `v` o que aparece (ver hc001_roteiro.py):
// d = diagrama, n = passo do diagrama, k = frase de apoio, tit = título. O estado acumula dentro do bloco (chave null apaga).
type V = Record<string, any>;
type Fala = { t: number; d: number; txt: string; v?: V };
type Bloco = { cena: string; trava?: number | null; nome?: string | null; fonte?: string | null; ini: number; fim: number; falas: Fala[] };
export type TemposHTC = { total: number; blocos: Bloco[] };
const ease = Easing.bezier(0.3, 0, 0.15, 1);
const L = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
const pop = (f: number, ini: number) => (f < ini ? 0 : Math.min(1.15, spring({ frame: f - ini, fps: 30, config: { damping: 14, stiffness: 180 } })));
const J = (x: any) => JSON.stringify(x ?? null);
const COR: Record<string, string> = { menta: P.menta, ambar: P.ambar, osso: P.osso, verm: P.verm, luz: P.luz, cinza: P.cinza };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// contexto que cada diagrama recebe: g = quadro dentro do bloco; a(n) = 0→1 a partir do passo n; q(n) = quadro em que o passo n começou
type Ctx = { g: number; v: V; a: (n: number, dur?: number, atraso?: number) => number; q: (n: number) => number; t0: number; quando: (p: (e: V) => boolean) => number };
const Txt: React.FC<any> = ({ f = TIT, w = 700, s = 40, c = P.osso, ls, children, ...r }) => <text fontFamily={f} fontWeight={w} fontSize={s} fill={c} letterSpacing={ls ?? (f === TIT ? -s * 0.025 : f === MONO ? 2 : 0)} {...r}>{children}</text>;
const Hl: React.FC<{ t: string; cor?: string }> = ({ t, cor = P.menta }) => <>{t.split('*').map((p, k) => <tspan key={k} fill={k % 2 ? cor : undefined}>{p}</tspan>)}</>;

// ---------- diagramas
const Check: React.FC<Ctx> = ({ v, a, g, q }) => {
  const it: [string, number][] = v.it || [], passo = 132, y0 = 540 - ((it.length - 1) * passo) / 2 + (v.cab ? 40 : 0);
  const larg = Math.max(...it.map((x) => x[0].length)) * 44 + 110, x0 = 960 - Math.min(1640, larg) / 2, tam = Math.min(76, 1500 / (0.6 * Math.max(...it.map((x) => x[0].length))));
  return (
    <g>
      {v.cab && <Rot x={960} y={y0 - 120} t={v.cab} anc="middle" tam={24} cor={P.cinza} />}
      {it.map(([txt, ok], i) => {
        const o = a(i + 1, 8), s = pop(g, q(i + 1)); if (o <= 0) return null; const cor = ok ? P.menta : P.verm, y = y0 + i * passo;
        return (
          <g key={i} opacity={o} transform={`translate(${(1 - Math.min(1, s)) * 60},0)`}>
            <rect x={x0} y={y - 46} width={60} height={60} rx={8} fill={ok ? '#12251D' : '#2A1513'} stroke={cor} strokeWidth={3.5} />
            {ok ? <path d={`M ${x0 + 14},${y - 16} l 12,13 l 21,-25`} fill="none" stroke={cor} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - a(i + 1, 10, 4))} />
              : <path d={`M ${x0 + 16},${y - 30} l 28,28 M ${x0 + 44},${y - 30} l -28,28`} fill="none" stroke={cor} strokeWidth={7} strokeLinecap="round" opacity={a(i + 1, 6, 5)} />}
            <Txt x={x0 + 96} y={y + 4} s={tam} c={ok ? P.osso : P.verm}>{txt}</Txt>
          </g>
        );
      })}
    </g>
  );
};

const Big: React.FC<Ctx & { desdeT: number; desdeSub: number }> = ({ v, g, desdeT, desdeSub }) => {
  const t: string = v.t || '', cor = COR[v.cor] || P.osso, s = pop(g, desdeT), tam = Math.min(t.length <= 2 ? 420 : 250, 1560 / (0.6 * Math.max(2, t.length)));
  const y = 540 + tam * 0.3 - (v.sub ? 40 : 0);
  return (
    <g>
      {v.rot && <Rot x={960} y={y - tam * 0.92 - 10} t={v.rot} anc="middle" tam={28} cor={P.cinza} peso={700} esp={5} />}
      <Txt x={960} y={y + (1 - Math.min(1, s)) * 34} textAnchor="middle" s={tam * (0.9 + 0.1 * s)} c={cor} opacity={L(g, [desdeT, desdeT + 6], [0, 1])}>{t}</Txt>
      {v.sub && <Txt x={960} y={y + 96} textAnchor="middle" f={SANS} w={500} s={Math.min(46, 1500 / (0.5 * v.sub.length))} c={P.osso} opacity={L(g, [Math.max(desdeSub, desdeT + 6), Math.max(desdeSub, desdeT + 6) + 10], [0, 1])}>{v.sub}</Txt>}
    </g>
  );
};

const Alemanha: React.FC<Ctx> = ({ g, a }) => {
  const esc = 0.69, ox = 170, oy = 186, x0 = ox + DE.b[0][0] * esc, x1 = ox + DE.b[1][0] * esc, ym = oy + 520 * esc, cx = (x0 + x1) / 2;
  const al = a(2, 26), bx = 960, bw = 860, by = 700, e3 = a(3, 12);
  const barras = [{ n: 'HOUSEHOLD MIRROR', v: '5 m', log: 3.7, c: P.fantasma }, { n: 'SPACE TELESCOPE MIRROR', v: '2 cm', log: 1.3, c: P.cinza }, { n: 'EUV CHIP MIRROR', v: '0.1 mm', log: -1, c: P.menta }];
  return (
    <g>
      {/* passo 1: o espelho; passo 2: ele cresce até virar a Alemanha */}
      <g opacity={a(1, 12) * (1 - al)} transform={`translate(${cx},${ym}) scale(${1 + al * 2.2})`}>
        <ellipse cx={0} cy={0} rx={290} ry={100} fill={P.menta} opacity={0.16 + 0.06 * Math.sin(g / 7)} filter="url(#halo)" />
        <ellipse cx={0} cy={0} rx={270} ry={90} fill="#10231B" stroke={P.menta} strokeWidth={6} />
        <path d="M -180,-12 Q 0,40 180,-12" fill="none" stroke={P.osso} strokeWidth={3} opacity={0.6} />
        <ellipse cx={-110 + ((g * 7) % 260)} cy={-20} rx={60} ry={12} fill={P.osso} opacity={0.2} />
        <line x1={-420} y1={-330} x2={-420 + 420 * L(g, [4, 16], [0, 1])} y2={-330 + 330 * L(g, [4, 16], [0, 1])} stroke={P.luz} strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={420 * L(g, [16, 28], [0, 1])} y2={-330 * L(g, [16, 28], [0, 1])} stroke={P.luz} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        <circle cx={0} cy={0} r={L(g, [14, 20, 34], [0, 34, 12])} fill={P.luz} opacity={L(g, [14, 20, 60], [0, 0.9, 0.35])} />
      </g>
      <g opacity={a(1, 12) * (1 - al)}><Rot x={cx} y={ym + 160} t="ONE EUV MIRROR · ZEISS" anc="middle" cor={P.menta} peso={700} tam={24} /></g>
      <g opacity={al} transform={`translate(${cx},${ym}) scale(${0.25 + 0.75 * al}) translate(${-cx},${-ym})`}>
        <g transform={`translate(${ox},${oy}) scale(${esc})`}><path d={DE.d} fill={P.menta} fillOpacity={0.07} stroke={P.menta} strokeWidth={3 / esc} strokeLinejoin="round" /></g>
        <line x1={x0 + 40} y1={ym} x2={x0 + 40 + (x1 - x0 - 80) * a(2, 30, 16)} y2={ym} stroke={P.osso} strokeWidth={2} strokeDasharray="2 9" strokeLinecap="round" />
      </g>
      <g opacity={a(2, 12, 22)}><Cota x1={112} y1={oy} x2={112} y2={oy + 1000 * esc} t="GERMANY · 876 KM" /></g>
      <g opacity={e3}>
        <circle cx={x0 + 190} cy={ym} r={7 + 3 * Math.sin(g / 6)} fill={P.ambar} />
        <path d={`M ${x0 + 190},${ym - 14} L ${x0 + 190},${oy + 380 * esc} L ${x0 + 220},${oy + 380 * esc}`} fill="none" stroke={P.ambar} strokeWidth={2.5} />
        <Rot x={x0 + 232} y={oy + 380 * esc + 8} t="TALLEST BUMP" cor={P.ambar} peso={700} />
      </g>
      <g opacity={a(2, 12, 10)}><Rot x={bx} y={236} t="SCALE ONE MIRROR UP TO THE SIZE OF GERMANY" cor={P.cinza} tam={24} /></g>
      <g opacity={e3} transform={`translate(0,${(1 - e3) * 30})`}>
        <text x={bx - 12} y={500} fontFamily={TIT} fontWeight={700} fontSize={300} fill={P.menta} letterSpacing={-12}>0.1<tspan fontSize={150} dx={22} letterSpacing={-4}>mm</tspan></text>
        <text x={bx} y={578} fontFamily={SANS} fontWeight={500} fontSize={38} fill={P.osso}>Its tallest bump would be a tenth of a millimeter.</text>
      </g>
      <line x1={bx} y1={636} x2={bx + bw * a(4, 16)} y2={636} stroke={P.linha} strokeWidth={2} />
      {barras.map((b, i) => {
        const p = a(4 + i, 22), y = by + i * 78, l = ((b.log + 1.6) / 5.6) * bw * p; if (p <= 0) return null;
        return (
          <g key={i} opacity={Math.min(1, p * 4)}>
            <Rot x={bx} y={y} t={b.n} cor={i === 2 ? P.osso : P.cinza} tam={20} peso={i === 2 ? 700 : 500} />
            <rect x={bx} y={y + 14} width={Math.max(3, l)} height={18} rx={2} fill={b.c} />
            <text x={bx + l + 16} y={y + 31} fontFamily={MONO} fontWeight={700} fontSize={26} fill={i === 2 ? P.menta : P.osso}>{b.v}</text>
          </g>
        );
      })}
      <g opacity={a(4, 10, 8)}><Rot x={bx + bw} y={by - 28} t="SAME SCALING · LOG" cor={P.fantasma} tam={16} anc="end" /></g>
    </g>
  );
};

const NOMES = [['THE LIGHT', 'Absorbed by air and glass'], ['THE COATING', '100 layers, nanometers thick'], ['THE SHAPE', 'Germany-sized, 0.1 mm bump'], ['THE MEASUREMENT', 'A ruler that had to be invented'], ['? ? ?', 'Not technology at all']];
const Travas: React.FC<Ctx> = ({ g, v, a, t0, quando }) => {
  const x = 1010, y0 = 196, p = 136, tl: string[] = v.tl || [], ab = v.ab || 0, at = v.at || 0;
  return (
    <g>
      <g opacity={a(1, 12)}><Titulo x={M} y={500 - (tl.length - 1) * 50} linhas={tl} tam={Math.min(104, 860 / (0.5 * Math.max(8, ...tl.map((l) => l.replace(/\*/g, '').length))))} /></g>
      {NOMES.map((t, i) => {
        const feito = i < ab, atual = i + 1 === at, cor = feito ? P.menta : atual ? P.ambar : P.fantasma, y = y0 + i * p, e = L(g, [t0 + 6 + i * 5, t0 + 16 + i * 5], [0, 1]);
        const tAb = quando((s) => (s.ab || 0) > i), flash = feito ? L(g, [tAb, tAb + 14], [1, 0]) : 0, grupo4 = i < 4 ? a(2, 10, i * 3) : 0, quinta = i === 4 ? a(3, 12) : 0;
        const mostraSub = feito || atual || (i === 4 && quinta > 0);
        return (
          <g key={i} opacity={e * (feito || atual || grupo4 > 0 || quinta > 0 ? 1 : 0.7)} transform={`translate(${(1 - e) * 60 + (atual ? Math.sin(g / 9) * 3 : 0)},0)`}>
            <rect x={x} y={y} width={814} height={p - 22} rx={10} fill={atual ? '#1B1A12' : feito ? '#101C17' : P.painel} stroke={i === 4 && quinta > 0 && !feito ? P.ambar : cor} strokeWidth={atual || quinta > 0 ? 4 : 2.5} strokeDasharray={feito || atual ? undefined : '10 9'} />
            <rect x={x} y={y} width={814} height={p - 22} rx={10} fill={P.menta} opacity={flash * 0.35} />
            <Txt x={x + 44} y={y + 80} s={64} c={i === 4 && quinta > 0 && !feito ? P.ambar : cor}>{i + 1}</Txt>
            <Txt x={x + 122} y={y + (mostraSub ? 58 : 76)} s={44} c={feito || atual ? P.osso : P.cinza} ls={-1}>{i === 4 && v.rev ? v.rev : t[0]}</Txt>
            {mostraSub && <Txt x={x + 122} y={y + 96} f={SANS} w={500} s={26} c={P.cinza}>{t[1]}</Txt>}
            <Rot x={x + 780} y={y + 68} t={feito ? 'OPEN' : atual ? 'NOW' : 'LOCKED'} cor={cor} tam={20} anc="end" peso={700} />
          </g>
        );
      })}
      <g opacity={a(2, 10) * (1 - a(3, 8))}>
        <path d={`M 990,${y0 + 6} h -22 v ${4 * p - 34} h 22`} fill="none" stroke={P.ambar} strokeWidth={3} />
        <text x={950} y={y0 + 2 * p - 10} transform={`rotate(-90 950 ${y0 + 2 * p - 10})`} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={P.ambar} letterSpacing={3}>PHYSICS + ENGINEERING</text>
      </g>
    </g>
  );
};

const Espectro: React.FC<Ctx> = ({ g, a }) => {
  const xa = 200, xb = 1720, y = 640, X = (nm: number) => xa + ((3 - Math.log10(nm)) / 2) * (xb - xa);
  const pts: string[] = []; let fase = g * 0.12;
  for (let x = xa; x <= xb; x += 3) { const nm = Math.pow(10, 3 - ((x - xa) / (xb - xa)) * 2), comp = 10 + (nm / 1000) * 190; fase += (3 / comp) * Math.PI * 2; pts.push(`${x},${y - 190 + Math.sin(fase) * 46}`); }
  const M2: React.FC<{ nm: number; t: string; s: string; cor: string; p: number; alto?: number }> = ({ nm, t, s, cor, p, alto = 0 }) => (
    <g opacity={p} transform={`translate(0,${(1 - p) * 20})`}>
      <line x1={X(nm)} y1={y - 18} x2={X(nm)} y2={y + 60 + alto} stroke={cor} strokeWidth={3} />
      <circle cx={X(nm)} cy={y} r={9} fill={cor} />
      <Txt x={X(nm)} y={y + 118 + alto} textAnchor="middle" s={56} c={cor}>{t}</Txt>
      <Rot x={X(nm)} y={y + 154 + alto} t={s} anc="middle" cor={P.cinza} tam={20} />
    </g>
  );
  return (
    <g>
      <polyline points={pts.join(' ')} fill="none" stroke={P.luz} strokeWidth={3.5} opacity={0.8} />
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={P.fantasma} strokeWidth={3} />
      {[1000, 100, 10].map((n) => <g key={n}><line x1={X(n)} y1={y - 10} x2={X(n)} y2={y + 10} stroke={P.cinza} strokeWidth={2.5} /><Rot x={X(n)} y={y - 22} t={`${n} nm`} anc="middle" tam={18} /></g>)}
      <Rot x={xa} y={y - 290} t="LONG WAVES · BIG FEATURES" tam={20} /><Rot x={xb} y={y - 290} t="SHORT WAVES · SMALL FEATURES" tam={20} anc="end" cor={P.luz} peso={700} />
      <g opacity={a(1, 12)}>
        <defs><linearGradient id="arco" x1="0" x2="1"><stop offset="0" stopColor="#E0483E" /><stop offset="0.35" stopColor="#E8C440" /><stop offset="0.6" stopColor="#4FC46A" /><stop offset="1" stopColor="#6B5BE8" /></linearGradient></defs>
        <rect x={X(800)} y={y - 12} width={(X(400) - X(800)) * a(1, 18)} height={24} rx={4} fill="url(#arco)" />
        <Txt x={(X(800) + X(400)) / 2} y={y + 118} textAnchor="middle" s={40} c={P.osso}>400–800 nm</Txt>
        <Rot x={(X(800) + X(400)) / 2} y={y + 154} t="VISIBLE LIGHT" anc="middle" tam={20} />
      </g>
      <M2 nm={193} t="193 nm" s="DEEP ULTRAVIOLET" cor={P.osso} p={a(2, 12)} />
      <M2 nm={13.5} t="13.5 nm" s="EXTREME ULTRAVIOLET" cor={P.luz} p={a(3, 12)} />
      <g opacity={a(4, 10)}><rect x={X(13.5) - 96} y={y - 104} width={192} height={64} rx={8} fill={P.luz} /><Txt x={X(13.5)} y={y - 58} textAnchor="middle" s={46} c={P.fundo}>EUV</Txt></g>
      <g opacity={a(3, 12, 14)}><path d={`M ${X(193) + 24},${y + 40} L ${X(13.5) - 150},${y + 40}`} stroke={P.ambar} strokeWidth={3} markerEnd="url(#setaA)" fill="none" /><Rot x={(X(193) + X(13.5)) / 2 - 60} y={y + 30} t="14× SHORTER" cor={P.ambar} anc="middle" peso={700} tam={20} /></g>
    </g>
  );
};

const Absorve: React.FC<Ctx> = ({ g, a }) => {
  const linhas = [{ n: 'GLASS', y: 400 }, { n: 'AIR', y: 530 }, { n: 'A LENS', y: 660 }], xa = 470, xm = 980, lw = 300;
  return (
    <g>
      {linhas.map((l, i) => {
        const p = a(i + 1, 24), morto = a(4, 14), base = a(0, 10, i * 5);
        return (
          <g key={i} opacity={base * (0.4 + 0.6 * Math.min(1, p * 5)) * (1 - 0.55 * morto)}>
            <Txt x={xa - 40} y={l.y + 16} textAnchor="end" s={48}>{l.n}</Txt>
            <defs><linearGradient id={`ab${i}`} x1="0" x2="1"><stop offset="0" stopColor={P.luz} /><stop offset={0.62} stopColor={P.luz} /><stop offset={0.9} stopColor={P.luz} stopOpacity={0} /></linearGradient></defs>
            <rect x={xa} y={l.y - 7} width={(xm + lw * 0.75 - xa) * p} height={14} rx={7} fill={`url(#ab${i})`} />
            {i === 2 ? <path d={`M ${xm + lw / 2},${l.y - 56} q 70,56 0,112 q -70,-56 0,-112 Z`} fill={P.osso} fillOpacity={0.08} stroke={P.osso} strokeWidth={3} />
              : <rect x={xm} y={l.y - 46} width={lw} height={92} rx={6} fill={i === 0 ? P.osso : 'none'} fillOpacity={0.08} stroke={P.osso} strokeWidth={3} strokeDasharray={i === 1 ? '4 10' : undefined} />}
            {i === 1 && Array.from({ length: 14 }, (_, k) => <circle key={k} cx={xm + 20 + rnd(k) * (lw - 40) + Math.sin(g / 14 + k) * 5} cy={l.y - 34 + rnd(k + 40) * 68} r={3} fill={P.osso} opacity={0.5} />)}
            <g opacity={L(p, [0.8, 1], [0, 1])}><path d={`M ${xm + lw + 54},${l.y - 16} l 32,32 M ${xm + lw + 86},${l.y - 16} l -32,32`} stroke={P.verm} strokeWidth={7} strokeLinecap="round" /><Rot x={xm + lw + 112} y={l.y + 10} t="ABSORBED" cor={P.verm} peso={700} tam={24} /></g>
          </g>
        );
      })}
      {(() => { const p = a(4, 26), y = 810; if (p <= 0) return null; const xb = 1130; return (
        <g opacity={Math.min(1, p * 5)}>
          <Txt x={xa - 40} y={y + 16} textAnchor="end" s={48} c={P.menta}>A MIRROR</Txt>
          <line x1={xa} y1={y} x2={xa + (xb - xa) * Math.min(1, p * 1.6)} y2={y} stroke={P.luz} strokeWidth={14} strokeLinecap="round" />
          <line x1={xb} y1={y} x2={xb - 250 * L(p, [0.6, 1], [0, 1])} y2={y - 96 * L(p, [0.6, 1], [0, 1])} stroke={P.luz} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          <path d={`M ${xb + 14},${y - 62} q -26,62 0,124`} fill="none" stroke={P.menta} strokeWidth={5} strokeLinecap="round" /><path d={`M ${xb + 14},${y - 62} q -26,62 0,124 l 26,0 l 0,-124 Z`} fill="url(#hach)" />
          <g opacity={L(p, [0.8, 1], [0, 1])}><path d={`M ${xb + 104},${y} l 14,15 l 26,-31`} fill="none" stroke={P.menta} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /><Rot x={xb + 170} y={y + 10} t="REFLECTED · IN A VACUUM" cor={P.menta} peso={700} tam={24} /></g>
        </g>); })()}
    </g>
  );
};

const Gota: React.FC<Ctx> = ({ g, a, q }) => {
  const cx = 520, cy = 570, per = 16, f = g % per, bate = L(f, [0, 3, per], [1, 0.9, 0.15], Easing.linear), on = a(1, 10);
  const Num: React.FC<{ i: number; t: string; s: string; cor?: string }> = ({ i, t, s, cor = P.ambar }) => { const p = a(i, 10), e = pop(g, q(i)); return (
    <g opacity={p} transform={`translate(${(1 - Math.min(1, e)) * 50},${300 + (i - 2) * 190})`}><Txt x={980} y={0} s={120} c={cor} ls={-5}>{t}</Txt><Rot x={984} y={44} t={s} tam={22} /></g>); };
  return (
    <g>
      <line x1={cx} y1={250} x2={cx} y2={890} stroke={P.linha} strokeWidth={2} strokeDasharray="3 10" />
      {Array.from({ length: 6 }, (_, k) => { const y = 250 + (((k * 110 + g * (110 / per)) % 660)); return y < cy - 6 || on < 1 ? <circle key={k} cx={cx} cy={y} r={9} fill={P.osso} opacity={y > cy ? 0.25 : 0.9} /> : null; })}
      <Rot x={cx + 30} y={270} t="MOLTEN TIN DROPLETS" tam={20} />
      <g opacity={on}>
        <line x1={110} y1={cy} x2={cx - 14} y2={cy} stroke={P.verm} strokeWidth={5 + 6 * bate} opacity={0.35 + 0.65 * bate} strokeLinecap="round" />
        <Rot x={110} y={cy - 26} t="LASER" cor={P.verm} peso={700} tam={22} />
        <circle cx={cx} cy={cy} r={70 + 60 * bate} fill={P.luz} opacity={0.3 * bate} filter="url(#halo)" /><circle cx={cx} cy={cy} r={16 + 22 * bate} fill={P.luz} opacity={0.5 + 0.5 * bate} /><circle cx={cx} cy={cy} r={8 + 8 * bate} fill="#fff" opacity={bate} />
        {Array.from({ length: 12 }, (_, k) => { const an = (k / 12) * Math.PI * 2 + 0.2, r1 = 60 + (f / per) * 90, r2 = r1 + 36; return <line key={k} x1={cx + Math.cos(an) * r1} y1={cy + Math.sin(an) * r1} x2={cx + Math.cos(an) * r2} y2={cy + Math.sin(an) * r2} stroke={P.luz} strokeWidth={3} strokeLinecap="round" opacity={0.8 * (1 - f / per)} />; })}
        <Rot x={cx + 110} y={cy + 150} t="PLASMA → EUV LIGHT" cor={P.luz} peso={700} tam={20} />
      </g>
      <Num i={2} t="60,000" s="TIN DROPLETS HIT EVERY SECOND" /><Num i={3} t="220,000 °C" s="PLASMA TEMPERATURE" /><Num i={4} t="40×" s="HOTTER THAN THE SUN'S SURFACE" cor={P.luz} />
    </g>
  );
};

const Feixe: React.FC<Ctx> = ({ g, a, q }) => {
  const n = 10, xa = 330, xb = 1500, yt = 470, yb = 800;
  const pts = Array.from({ length: n }, (_, i) => ({ x: xa + (i * (xb - xa)) / (n - 1), y: i % 2 ? yb : yt, r: Math.pow(0.7, i + 1) }));
  const ini = { x: 150, y: yb - 40 }, fim = { x: 1690, y: yt + 30 }, seg = [ini, ...pts, fim];
  // quantos trechos já foram percorridos: passo 1 → até o 1º espelho; passo 2 → até o 2º; passo 3 → até o 4º; passo 4 → até o chip
  const prog = L(g, [q(1), q(1) + 24], [0, 1.35]) + L(g, [q(2), q(2) + 30], [0, 0.65]) + L(g, [q(3), q(3) + 90], [0, 2]) + L(g, [q(4), q(4) + 70], [0, 7]);
  return (
    <g>
      <g opacity={a(1, 12, 10)}><text x={M} y={286} fontFamily={SANS} fontWeight={500} fontSize={34} fill={P.cinza}>Even the best mirror for this light reflects only up to 70% of it.</text></g>
      {seg.slice(0, -1).map((p0, i) => {
        const p = Math.max(0, Math.min(1, prog - i)); if (p <= 0) return null; const p1 = seg[i + 1], r = i === 0 ? 1 : pts[i - 1].r;
        return <line key={i} x1={p0.x} y1={p0.y} x2={p0.x + (p1.x - p0.x) * p} y2={p0.y + (p1.y - p0.y) * p} stroke={P.luz} strokeWidth={2 + 26 * r} strokeLinecap="round" opacity={0.35 + 0.65 * Math.sqrt(r)} />;
      })}
      {pts.map((p, i) => {
        const cima = i % 2 === 0, s = cima ? -1 : 1, on = prog >= i + 1, e = L(prog, [i + 1, i + 1.25], [0, 1], Easing.linear);
        return (
          <g key={i}>
            <path d={`M ${p.x - 62},${p.y + s * 4} Q ${p.x},${p.y + s * 22} ${p.x + 62},${p.y + s * 4} L ${p.x + 62},${p.y + s * 30} L ${p.x - 62},${p.y + s * 30} Z`} fill="url(#hach)" opacity={0.5 + 0.5 * e} />
            <path d={`M ${p.x - 62},${p.y + s * 4} Q ${p.x},${p.y + s * 22} ${p.x + 62},${p.y + s * 4}`} fill="none" stroke={P.menta} strokeWidth={4} strokeLinecap="round" opacity={0.45 + 0.55 * e} />
            {on && <text x={p.x} y={p.y + s * 74 + (cima ? 0 : 20)} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28 + 10 * (1 - e)} fill={i === n - 1 ? P.ambar : P.osso} opacity={e}>{(p.r * 100).toFixed(p.r < 0.1 ? 1 : 0)}%</text>}
          </g>
        );
      })}
      <circle cx={ini.x} cy={ini.y} r={36 + 5 * Math.sin(g / 5)} fill={P.luz} opacity={0.25} filter="url(#halo)" /><circle cx={ini.x} cy={ini.y} r={13} fill={P.luz} />
      <Rot x={ini.x} y={ini.y + 62} t="100%" cor={P.luz} tam={26} anc="middle" peso={700} /><Rot x={ini.x} y={ini.y + 92} t="SOURCE" cor={P.cinza} tam={18} anc="middle" />
      <rect x={fim.x - 6} y={fim.y - 70} width={12} height={140} rx={3} fill={P.osso} /><Rot x={fim.x + 26} y={fim.y - 44} t="CHIP" cor={P.cinza} tam={18} />
      {prog >= n + 0.9 && (() => { const s = pop(g, q(4) + 66); return <g transform={`translate(${fim.x + 22},${fim.y + 22}) scale(${0.7 + 0.3 * s})`}><text fontFamily={TIT} fontWeight={700} fontSize={64} fill={P.ambar} letterSpacing={-2}>2.8%</text><text x={4} y={34} fontFamily={MONO} fontWeight={700} fontSize={18} fill={P.ambar} letterSpacing={2}>ARRIVES</text></g>; })()}
    </g>
  );
};

const Camadas: React.FC<Ctx> = ({ g, a, q }) => {
  const cx = 610, cy = 610, R = 290, nc = 22, hc = (2 * R) / nc, zoom = a(1, 22), feitas = a(2, 50) * nc, ruim = a(7, 30), cai = a(8, 14);
  const topo = cy - R + 96, yCam = (i: number) => topo + i * hc + ruim * (rnd(i) - 0.5) * 16, nRef = Math.round(a(5, 40) * 4), soma = a(6, 14);
  const conta = Math.round(a(2, 50) * 100);
  return (
    <g>
      <path d="M 120,410 Q 240,446 360,410" fill="none" stroke={P.menta} strokeWidth={4} strokeLinecap="round" /><path d="M 120,410 Q 240,446 360,410 L 360,440 L 120,440 Z" fill="url(#hach)" />
      <Rot x={120} y={380} t="THE MIRROR SURFACE" tam={18} />
      <g opacity={zoom}><circle cx={240} cy={428} r={11} fill="none" stroke={P.osso} strokeWidth={2.5} /><line x1={248} y1={436} x2={cx - R * 0.72} y2={cy - R * 0.7} stroke={P.osso} strokeWidth={2} strokeDasharray="3 8" /></g>
      <g transform={`translate(${cx},${cy}) scale(${0.2 + 0.8 * zoom}) translate(${-cx},${-cy})`} opacity={zoom}>
        <clipPath id="lupaV"><circle cx={cx} cy={cy} r={R} /></clipPath>
        <g clipPath="url(#lupaV)">
          <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill={P.painel} />
          {Array.from({ length: nc }, (_, i) => (nc - 1 - i < feitas ? <rect key={i} x={cx - R} y={yCam(i)} width={2 * R} height={hc - 3 + ruim * (rnd(i + 9) - 0.5) * 10} fill={i % 2 ? P.mentaEsc : P.menta} opacity={i % 2 ? 0.9 : 0.85} /> : null))}
          <g opacity={a(4, 8)}>
            <line x1={cx - 250} y1={cy - R} x2={cx - 250 + 220 * a(4, 14)} y2={cy - R + (96 + 7 * hc) * a(4, 14)} stroke={P.luz} strokeWidth={7} strokeLinecap="round" />
            {[0, 2, 4, 6].map((k, i) => {
              const y = topo + k * hc, x = cx - 250 + ((y - (cy - R)) / (96 + 7 * hc)) * 220, vis = i === 0 ? a(4, 10, 12) : i <= nRef ? 1 : 0; if (vis <= 0) return null;
              const desv = ruim * (rnd(i + 3) - 0.5) * 1.1;
              return <line key={k} x1={x} y1={y} x2={x + (y - (cy - R)) * (0.62 + desv)} y2={cy - R} stroke={cai > 0.5 ? P.verm : P.luz} strokeWidth={(i === 0 && nRef === 0 ? 2.5 : 5 - i * 0.8) * (1 - 0.6 * cai)} strokeLinecap="round" opacity={(0.95 - i * 0.14) * vis * (0.5 + 0.5 * Math.sin(g / 4 + i) * 0.3 + 0.35)} />;
            })}
          </g>
        </g>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={P.osso} strokeWidth={4} />
      </g>
      <g opacity={a(2, 10)}>
        <path d={`M ${cx + R + 30},${topo} h 22 v ${nc * hc - 96 - 3} h -22`} fill="none" stroke={P.ambar} strokeWidth={2.5} />
        <Rot x={cx + R + 84} y={cy - 122} t="UP TO" cor={P.ambar} tam={22} peso={700} />
        <text x={cx + R + 78} y={cy - 4} fontFamily={TIT} fontWeight={700} fontSize={128} fill={P.ambar} letterSpacing={-5}>{conta}</text>
        <text x={cx + R + 300} y={cy - 46} fontFamily={SANS} fontWeight={600} fontSize={36} fill={P.osso}>alternating</text><text x={cx + R + 300} y={cy - 2} fontFamily={SANS} fontWeight={600} fontSize={36} fill={P.osso}>layers.</text>
      </g>
      <g transform={`translate(${cx + R + 82},${cy + 70})`}>
        <g opacity={a(2, 10, 20)}><rect width={34} height={22} fill={P.menta} /><Rot x={50} y={19} t="MOLYBDENUM" cor={P.osso} tam={22} peso={700} /><rect y={40} width={34} height={22} fill={P.mentaEsc} /><Rot x={50} y={59} t="SILICON" cor={P.osso} tam={22} peso={700} /></g>
        <g opacity={a(3, 10)}><Rot x={0} y={118} t="EACH LAYER: A FEW NANOMETERS THICK" tam={22} cor={P.osso} /></g>
        <g opacity={a(4, 10) * (1 - a(5, 8))}><Rot x={0} y={154} t="ONE LAYER ALONE: ALMOST NOTHING COMES BACK." tam={22} /></g>
        <g opacity={a(5, 10) * (1 - a(7, 8))}><Rot x={0} y={154} t="RIGHT THICKNESS: EVERY REFLECTION LINES UP." tam={22} /></g>
        <g opacity={soma * (1 - a(7, 8))}><Rot x={0} y={190} t="STACKED RIGHT, THE BOUNCES ADD UP: 70%." cor={P.luz} tam={22} peso={700} /></g>
        <g opacity={a(7, 10)}><Rot x={0} y={154} t="THICKNESS OFF BY A FRACTION OF A NANOMETER:" cor={P.verm} tam={22} peso={700} /></g>
        <g opacity={cai}><Rot x={0} y={190} t="THE REFLECTION COLLAPSES." cor={P.verm} tam={22} peso={700} /></g>
      </g>
      {void q}
    </g>
  );
};

const Copia: React.FC<Ctx> = ({ g, a }) => {
  const xa = 300, xb = 1620, y1 = 430, y2 = 690; let d = `M ${xa},${y2}`;
  for (let x = xa; x <= xb; x += 12) d += ` L ${x},${y2 + Math.sin(x / 38 + g / 16) * 20 + Math.sin(x / 13 - g / 9) * 9 + Math.sin(x / 90) * 14}`;
  const p = a(1, 30);
  return (
    <g>
      <line x1={xa} y1={y1} x2={xa + (xb - xa) * p} y2={y1} stroke={P.menta} strokeWidth={7} strokeLinecap="round" />
      <g opacity={p}><Rot x={xa} y={y1 - 44} t="THE ORIGINAL" cor={P.menta} tam={26} peso={700} /><Rot x={xb} y={y1 - 44} t="FLAT TO 0.1 MM ACROSS A COUNTRY" cor={P.cinza} tam={20} anc="end" /></g>
      <clipPath id="cpc"><rect x={xa - 10} y={y2 - 80} width={(xb - xa + 20) * a(1, 30, 14)} height={160} /></clipPath>
      <path d={d} fill="none" stroke={P.cinza} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" clipPath="url(#cpc)" />
      <g opacity={a(1, 12, 20)}><Rot x={xa} y={y2 + 96} t="THE COPY" cor={P.cinza} tam={26} peso={700} /></g>
      <g opacity={a(2, 12)}><rect x={xb - 420} y={y2 + 60} width={420} height={56} rx={6} fill="none" stroke={P.ambar} strokeWidth={2.5} /><Rot x={xb - 210} y={y2 + 97} t="MONTHS OF MACHINING · PER MIRROR" cor={P.ambar} tam={18} anc="middle" peso={700} esp={1} /></g>
    </g>
  );
};

const Lua: React.FC<Ctx> = ({ g, a }) => {
  const ex = 250, mx = 1650, y = 560, p = a(1, 50), alvo = a(2, 16);
  return (
    <g>
      <circle cx={ex} cy={y} r={110} fill={P.menta} fillOpacity={0.07} stroke={P.menta} strokeWidth={4} /><path d={`M ${ex - 70},${y - 40} q 40,-30 70,0 q 20,40 60,20 M ${ex - 80},${y + 40} q 50,20 90,-6`} fill="none" stroke={P.menta} strokeWidth={2.5} opacity={0.5} />
      <Rot x={ex} y={y + 160} t="EARTH" anc="middle" cor={P.osso} peso={700} />
      <circle cx={mx} cy={y} r={34} fill={P.osso} fillOpacity={0.12} stroke={P.osso} strokeWidth={3} /><Rot x={mx} y={y + 84} t="MOON" anc="middle" cor={P.osso} peso={700} />
      <line x1={ex + 110} y1={y + 150} x2={mx - 34} y2={y + 150} stroke={P.fantasma} strokeWidth={2} strokeDasharray="3 9" />
      <Cota x1={ex + 110} y1={y + 210} x2={mx - 34} y2={y + 210} t="≈ 390,000 KM" lado={-1} />
      <path d={`M ${ex + 96},${y - 30} q -14,30 0,60`} fill="none" stroke={P.osso} strokeWidth={5} strokeLinecap="round" /><g opacity={a(1, 8)}><Rot x={ex + 130} y={y - 60} t="ONE MIRROR" tam={18} /></g>
      <line x1={ex + 100} y1={y} x2={ex + 100 + (mx - 34 - ex - 100) * p} y2={y} stroke={P.verm} strokeWidth={4} strokeLinecap="round" opacity={a(1, 4)} />
      {p > 0 && p < 1 && <circle cx={ex + 100 + (mx - 34 - ex - 100) * p} cy={y} r={9} fill={P.verm} filter="url(#halo)" />}
      <g opacity={alvo} transform={`translate(${mx - 250},${y - 250}) scale(${0.6 + 0.4 * alvo})`}>
        <line x1={150} y1={150} x2={236} y2={236} stroke={P.osso} strokeWidth={2} strokeDasharray="3 8" />
        <circle cx={0} cy={0} r={150} fill={P.painel} stroke={P.ambar} strokeWidth={4} />
        <circle cx={0} cy={0} r={62} fill={P.osso} />{Array.from({ length: 14 }, (_, k) => <circle key={k} cx={Math.cos(k * 2.4) * (12 + (k % 4) * 11)} cy={Math.sin(k * 2.4) * (12 + (k % 4) * 11)} r={5} fill="#C9CEC8" opacity={0.9} />)}
        <circle cx={0} cy={0} r={18 + 4 * Math.sin(g / 5)} fill="none" stroke={P.verm} strokeWidth={4} /><circle cx={0} cy={0} r={5} fill={P.verm} />
        <Rot x={0} y={-176} t="TARGET: A GOLF BALL" anc="middle" cor={P.ambar} peso={700} tam={22} />
      </g>
    </g>
  );
};

const Cta: React.FC<Ctx> = ({ g, v, a, t0 }) => {
  const t: string[] = v.t || [], e = pop(g, t0), tam = Math.min(150, 1300 / (0.6 * Math.max(...t.map((x) => x.length))));
  return (
    <g transform={`translate(960,540) scale(${0.85 + 0.15 * Math.min(1, e)})`} opacity={Math.min(1, e)}>
      <rect x={-720} y={-290} width={1440} height={580} rx={26} fill={P.painel} stroke={P.ambar} strokeWidth={4} />
      <g transform={`translate(-676,-258) scale(0.75) rotate(${Math.sin(g / 12) * 3})`} stroke={P.ambar} strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {v.ic === 'env' ? <path d="M 0,40 L 110,0 L 76,110 L 54,62 Z M 54,62 L 110,0" /> : <path d="M 0,0 h 110 v 74 h -64 l -26,26 v -26 h -20 Z" />}
      </g>
      {t.map((l, i) => <Txt key={l} x={0} y={-10 + (i - (t.length - 1) / 2) * tam * 1.05 + tam * 0.3} textAnchor="middle" s={tam} c={i === t.length - 1 && t.length > 1 ? P.ambar : P.osso}>{l}</Txt>)}
      {v.s && <g opacity={a(2, 10)}><Rot x={0} y={236} t={String(v.s).toUpperCase()} anc="middle" cor={P.menta} peso={700} tam={28} esp={4} /></g>}
    </g>
  );
};

const Polir: React.FC<Ctx> = ({ g, a }) => {
  const xa = 300, xb = 1620, y = 560, alt = (x: number) => Math.sin(x / 61) * 26 + Math.sin(x / 23 + 1) * 12 + Math.sin(x / 140 + 2) * 18;
  const tool = xa + ((g * 5) % (xb - xa)), picos = [520, 905, 1290, 1480];
  let d = `M ${xa},${y - alt(xa)}`; for (let x = xa; x <= xb; x += 8) d += ` L ${x},${y - alt(x)}`;
  return (
    <g>
      <path d={`${d} L ${xb},${y + 150} L ${xa},${y + 150} Z`} fill="url(#hach)" opacity={0.6} /><path d={d} fill="none" stroke={P.menta} strokeWidth={4} strokeLinejoin="round" />
      <line x1={xa} y1={y + 44} x2={xb} y2={y + 44} stroke={P.osso} strokeWidth={2} strokeDasharray="2 9" /><Rot x={xb} y={y + 76} t="THE SHAPE YOU WANT" anc="end" tam={18} cor={P.osso} />
      <Rot x={xa} y={y - 110} t="THE SURFACE YOU HAVE (HEIGHT EXAGGERATED)" tam={18} />
      <g opacity={a(1, 10) * (1 - a(2, 10))} transform={`translate(${tool},${y - alt(tool) - 16})`}><rect x={-46} y={-40} width={92} height={40} rx={6} fill={P.painel} stroke={P.osso} strokeWidth={3} /><rect x={-10} y={-90} width={20} height={50} fill={P.osso} opacity={0.6} /><Rot x={0} y={-104} t="POLISH" anc="middle" tam={18} cor={P.osso} peso={700} /></g>
      {picos.map((px, i) => { const p = a(2, 8, i * 5); return <g key={i} opacity={p}><circle cx={px} cy={y - alt(px)} r={9 + 3 * Math.sin(g / 6 + i)} fill="none" stroke={P.ambar} strokeWidth={4} /><Rot x={px} y={y - alt(px) - 26} t="TOO HIGH?" anc="middle" cor={P.ambar} tam={18} peso={700} /></g>; })}
      <g opacity={a(3, 12)} transform={`translate(0,${(1 - a(3, 12)) * 30})`}>
        <rect x={xa} y={760} width={xb - xa} height={56} rx={4} fill={P.painel} stroke={P.ambar} strokeWidth={3} />
        {Array.from({ length: 67 }, (_, k) => <line key={k} x1={xa + k * 20} y1={760} x2={xa + k * 20} y2={760 + (k % 5 ? 14 : 28)} stroke={P.ambar} strokeWidth={2} />)}
        <Rot x={960} y={856} t="A RULER FINER THAN AN ATOM" anc="middle" cor={P.ambar} peso={700} tam={24} />
      </g>
      <g opacity={a(4, 6)} transform={`translate(960,788) rotate(-5) scale(${1.5 - 0.5 * a(4, 8)})`}><rect x={-330} y={-52} width={660} height={104} rx={8} fill={P.fundo} stroke={P.verm} strokeWidth={6} /><Txt x={0} y={24} textAnchor="middle" s={66} c={P.verm} ls={2}>NOBODY SELLS ONE</Txt></g>
    </g>
  );
};

const Camara: React.FC<Ctx> = ({ g, a, q }) => {
  const e = 96, x = 230, chao = 880, cw = 10 * e, ch = 5 * e, y = chao - ch - 30, per = 2 * (cw + ch), des = a(1, 40);
  const Num: React.FC<{ i: number; yy: number; t: string; s: string }> = ({ i, yy, t, s }) => { const p = a(i, 10), k = pop(g, q(i)); return <g opacity={p} transform={`translate(${x + cw + 190 + (1 - Math.min(1, k)) * 40},${yy})`}><Txt s={104} c={P.ambar} ls={-4}>{t}</Txt><Rot x={4} y={40} t={s} tam={20} /></g>; };
  return (
    <g>
      <line x1={M} y1={chao} x2={W - M} y2={chao} stroke={P.fantasma} strokeWidth={2.5} />
      <rect x={x} y={y} width={cw} height={ch} rx={ch / 2.6} fill={P.menta} fillOpacity={0.05 * des} stroke={P.menta} strokeWidth={4} strokeDasharray={per} strokeDashoffset={per * (1 - des)} />
      <g opacity={L(des, [0.6, 1], [0, 1])}>
        {[0.2, 0.4, 0.6, 0.8].map((k) => <line key={k} x1={x + cw * k} y1={y + (k === 0.2 || k === 0.8 ? 22 : 2)} x2={x + cw * k} y2={y + ch - (k === 0.2 || k === 0.8 ? 22 : 2)} stroke={P.menta} strokeWidth={2} opacity={0.3} />)}
        {[x + cw * 0.22, x + cw * 0.78].map((px) => <path key={px} d={`M ${px - 44},${chao} L ${px - 24},${y + ch - 12} L ${px + 24},${y + ch - 12} L ${px + 44},${chao} Z`} fill={P.painel} stroke={P.menta} strokeWidth={3} />)}
        <Rot x={x + 40} y={y + ch + 62} t="VACUUM CHAMBER" tam={18} cor={P.menta} peso={700} />
      </g>
      <g opacity={a(2, 12)}>
        <path d={`M ${x + cw * 0.74},${y + ch / 2 - 50} q -22,50 0,100`} fill="none" stroke={P.osso} strokeWidth={6} strokeLinecap="round" /><rect x={x + cw * 0.74 + 4} y={y + ch / 2 - 56} width={20} height={112} fill="url(#hachC)" />
        {[-44, 0, 44].map((dy, k) => <line key={k} x1={x + cw * 0.2} y1={y + ch / 2} x2={x + cw * 0.74 - 13} y2={y + ch / 2 + dy} stroke={P.luz} strokeWidth={2.5} opacity={0.45 + 0.4 * Math.sin(g / 5 + k * 2)} />)}
        <rect x={x + cw * 0.14} y={y + ch / 2 - 34} width={60} height={68} rx={6} fill={P.painel} stroke={P.osso} strokeWidth={3} />
        <Rot x={x + cw * 0.74 + 40} y={y + ch / 2 - 62} t="THE MIRROR" cor={P.osso} tam={18} peso={700} /><Rot x={x + cw * 0.74 + 40} y={y + ch / 2 - 36} t="≈ 1 M WIDE" tam={18} /><Rot x={x + cw * 0.74 + 40} y={y + ch / 2 - 10} t="100s OF KG" tam={18} />
      </g>
      <g opacity={a(3, 12)}>
        <Cota x1={x} y1={y - 34} x2={x + cw} y2={y - 34} t="10 M" /><Cota x1={x - 40} y1={y} x2={x - 40} y2={y + ch} t="5 M" />
        <g transform={`translate(${x + cw + 78},${chao})`} fill={P.osso}><circle cx={0} cy={-1.75 * e + 13} r={13} /><path d={`M -19,${-1.75 * e + 34} Q 0,${-1.75 * e + 24} 19,${-1.75 * e + 34} L 15,-78 L 11,0 L 2,0 L 0,-70 L -2,0 L -11,0 L -15,-78 Z`} /></g>
        <Rot x={x + cw + 78} y={chao + 34} t="1.75 M" tam={18} anc="middle" />
      </g>
      <Num i={4} yy={y + 60} t="150 t" s="THE WEIGHT OF THE MEASURING MACHINE" /><Num i={5} yy={y + 236} t="100,000+" s="PARTS" />
      <g opacity={a(6, 12)} transform={`translate(${x + cw + 190},${y + 360})`}><text fontFamily={SANS} fontWeight={600} fontSize={32} fill={P.osso}>Built for one job:</text><text y={44} fontFamily={SANS} fontWeight={600} fontSize={32} fill={P.menta}>checking a single mirror.</text></g>
    </g>
  );
};

const Nums: React.FC<Ctx> = ({ g, v, a, q }) => {
  const it: string[][] = v.it || [], n = it.length, larg = 1728 / n;
  return (
    <g>
      {it.map((x, i) => {
        const p = a(i + 1, 10), s = pop(g, q(i + 1)), cx = M + larg * (i + 0.5), tam = Math.min(n === 1 ? 330 : n === 2 ? 220 : 150, (larg - 60) / (0.58 * x[0].length));
        return (
          <g key={i} opacity={p} transform={`translate(0,${(1 - Math.min(1, s)) * 40})`}>
            <Txt x={cx} y={560} textAnchor="middle" s={tam} c={i === 0 ? P.ambar : P.osso} ls={-tam * 0.04}>{x[0]}</Txt>
            <Rot x={cx} y={636} t={x[1]} anc="middle" tam={n === 1 ? 30 : 24} cor={P.cinza} peso={700} />
            {i > 0 && <line x1={M + larg * i} y1={400} x2={M + larg * i} y2={660} stroke={P.linha} strokeWidth={2} />}
          </g>
        );
      })}
    </g>
  );
};

const Tres: React.FC<Ctx> = ({ g, a }) => {
  const cx = [460, 960, 1460], y = 500, nomes = [['THE CHIP MACHINE', 'ASML'], ['THE MIRROR', 'ZEISS'], ['THE MACHINE THAT', 'MEASURES THE MIRROR']];
  return (
    <g>
      {nomes.map((t, i) => { const p = L(g, [0, 1], [0, 0]) + (i === 0 ? Math.max(a(0, 12), a(3, 12, 30)) : a(3, 12, 30 + i * 55)); return (
        <g key={i} opacity={Math.min(1, p)} transform={`translate(0,${(1 - Math.min(1, p)) * 30})`}>
          <rect x={cx[i] - 210} y={y - 120} width={420} height={240} rx={12} fill={P.painel} stroke={i === 0 ? P.fantasma : i === 1 ? P.menta : P.ambar} strokeWidth={3.5} />
          <Txt x={cx[i]} y={y - 24} textAnchor="middle" s={104} c={i === 0 ? P.cinza : i === 1 ? P.menta : P.ambar} opacity={0.25}>{i + 1}</Txt>
          <Txt x={cx[i]} y={y + 22} textAnchor="middle" s={i === 2 ? 34 : 40}>{t[0]}</Txt>
          <Txt x={cx[i]} y={y + 70} textAnchor="middle" s={i === 2 ? 34 : 26} c={i === 2 ? P.osso : P.cinza} f={i === 2 ? TIT : MONO} w={700}>{t[1]}</Txt>
        </g>); })}
      <g opacity={a(4, 12)}>
        {[0, 1].map((i) => <g key={i}><line x1={cx[i] + 220} y1={y - 20} x2={cx[i + 1] - 226} y2={y - 20} stroke={P.osso} strokeWidth={3} markerEnd="url(#seta)" strokeDasharray="8 8" strokeDashoffset={-g} /><line x1={cx[i + 1] - 220} y1={y + 20} x2={cx[i] + 226} y2={y + 20} stroke={P.osso} strokeWidth={3} markerEnd="url(#seta)" strokeDasharray="8 8" strokeDashoffset={-g} /></g>)}
        <Rot x={960} y={y + 210} t="EACH ONE NEEDS THE OTHERS TO EXIST FIRST" anc="middle" cor={P.ambar} peso={700} tam={26} />
      </g>
    </g>
  );
};

const Linha: React.FC<Ctx> = ({ g, a, q }) => {
  const xa = 280, xb = 1640, y = 600, X = (ano: number) => xa + ((ano - 1995) / 23) * (xb - xa);
  const pts = [{ a: 1995, t: ['ZEISS HOSTS', 'THE EUV WORKSHOP'] }, { a: 2012, t: ['FIRST PRODUCTION', 'EUV OPTICS'] }, { a: 2018, t: ['FIRST PHONES', 'WITH EUV CHIPS'] }];
  const ate = xa + (X(2012) - xa) * a(2, 30) + (X(2018) - X(2012)) * a(3, 24), b = a(4, 18);
  return (
    <g>
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={P.linha} strokeWidth={6} strokeLinecap="round" /><line x1={xa} y1={y} x2={ate} y2={y} stroke={P.menta} strokeWidth={6} strokeLinecap="round" />
      {Array.from({ length: 24 }, (_, k) => <line key={k} x1={X(1995 + k)} y1={y + 14} x2={X(1995 + k)} y2={y + (k % 5 ? 24 : 34)} stroke={P.fantasma} strokeWidth={2} />)}
      {pts.map((p, i) => { const o = a(i + 1, 10), s = pop(g, q(i + 1)); return (
        <g key={i} opacity={o}>
          <circle cx={X(p.a)} cy={y} r={14 * Math.min(1.15, s)} fill={P.fundo} stroke={P.menta} strokeWidth={5} />
          <Txt x={X(p.a)} y={y + 110} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} s={76} c={P.osso}>{p.a}</Txt>
          {p.t.map((l, k) => <Rot key={k} x={X(p.a)} y={y + 150 + k * 30} t={l} anc={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} tam={20} />)}
        </g>); })}
      <g opacity={b}>
        <path d={`M ${xa},${y - 60} v -30 h ${(xb - xa) * b} v 30`} fill="none" stroke={P.ambar} strokeWidth={3.5} />
        <Txt x={960} y={y - 150} textAnchor="middle" s={150} c={P.ambar}>23 YEARS</Txt><Rot x={960} y={y - 112} t="FROM THE FIRST MEETING TO THE FIRST PRODUCT" anc="middle" tam={20} cor={P.ambar} peso={700} />
      </g>
      <g opacity={a(5, 12)}>
        {['NIKON', 'CANON'].map((n, i) => <g key={n} transform={`translate(${760 + i * 250},${y + 250})`}><rect x={-105} y={-40} width={210} height={62} rx={6} fill="none" stroke={P.cinza} strokeWidth={2.5} strokeDasharray="10 8" /><Txt x={-20} y={4} textAnchor="middle" s={36} c={P.cinza}>{n}</Txt><path d="M 60,-24 l 26,26 M 86,-24 l -26,26" stroke={P.verm} strokeWidth={5} strokeLinecap="round" /></g>)}
        <Rot x={1150} y={y + 256} t="NEVER SHIPPED AN EUV MACHINE" tam={20} cor={P.verm} peso={700} />
      </g>
    </g>
  );
};

const Casamento: React.FC<Ctx> = ({ g, v, a }) => {
  const ax = 150, bx = 1130, y = 400, cw = 520, ch = 250, anos = [{ a: '2023', v: 3.33 }, { a: '2024', v: 3.95 }, { a: '2025', v: 4.41 }];
  const Caixa: React.FC<{ x: number; nome: string; sub: string; papel: string; at: number }> = ({ x, nome, sub, papel, at }) => (
    <g opacity={L(g, [at, at + 12], [0, 1])} transform={`translate(0,${L(g, [at, at + 12], [30, 0])})`}>
      <rect x={x} y={y} width={cw} height={ch} rx={10} fill={P.painel} stroke={P.menta} strokeWidth={3.5} /><Rot x={x + 34} y={y + 52} t={papel} tam={18} />
      <text x={x + 34} y={y + 142} fontFamily={TIT} fontWeight={700} fontSize={84} fill={P.osso} letterSpacing={-3}>{nome}</text><Rot x={x + 34} y={y + 198} t={sub} cor={P.menta} tam={22} peso={700} />
    </g>
  );
  const fl = [{ dy: 62, t: '24.9% STAKE · €1 BN (2016)', n: 2 }, { dy: 138, t: '€4.41 BN OF OPTICS IN 2025', n: 3 }, { dy: 214, t: '€1.91 BN IN LOANS, END 2025', n: 4 }];
  return (
    <g>
      <Caixa x={ax} nome="ASML" sub="VELDHOVEN · NETHERLANDS" papel="BUILDS THE MACHINE" at={4} /><Caixa x={bx} nome="ZEISS SMT" sub="OBERKOCHEN · GERMANY" papel="BUILDS EVERY MIRROR IN IT" at={12} />
      <g opacity={a(1, 12) * (1 - a(2, 8))}><line x1={ax + cw + 14} y1={y + ch / 2} x2={bx - 14} y2={y + ch / 2} stroke={P.menta} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-g} /><Rot x={(ax + cw + bx) / 2} y={y + ch / 2 - 22} t="PARTNERS SINCE THE 1980s" cor={P.menta} tam={20} anc="middle" peso={700} esp={0.5} /></g>
      {fl.map((f, i) => { const p = a(f.n, 16); return p <= 0 ? null : (
        <g key={i} opacity={Math.min(1, p * 3)}>
          <line x1={ax + cw + 14} y1={y + f.dy} x2={ax + cw + 14 + (bx - 32 - ax - cw) * p} y2={y + f.dy} stroke={P.ambar} strokeWidth={3} markerEnd="url(#setaA)" />
          <Rot x={(ax + cw + bx) / 2} y={y + f.dy - 14} t={f.t} cor={P.ambar} tam={18} anc="middle" peso={700} esp={0.5} />
        </g>); })}
      <g opacity={a(3, 12)}>
        <Rot x={ax} y={y + 346} t="WHAT ASML PAYS ZEISS SMT EACH YEAR" tam={20} />
        {anos.map((an, i) => { const p = a(3, 20, 6 + i * 8); return (
          <g key={i} transform={`translate(${ax},${y + 382 + i * 54})`}><Rot x={0} y={26} t={an.a} cor={P.osso} tam={22} peso={700} /><rect x={92} y={4} width={an.v * 150 * p} height={30} rx={2} fill={i === 2 ? P.ambar : P.fantasma} /><text x={92 + an.v * 150 * p + 16} y={28} fontFamily={MONO} fontWeight={700} fontSize={24} fill={i === 2 ? P.ambar : P.osso} opacity={p}>€{(an.v * p).toFixed(2)} bn</text></g>); })}
      </g>
      <g opacity={a(5, 14)} transform={`translate(${bx},${y + 372})`}>
        <text fontFamily={SANS} fontWeight={600} fontSize={30} fill={P.osso}><tspan x={0}>Without ZEISS, ASML says it would</tspan><tspan x={0} dy={42} fill={P.ambar}>"effectively cease to be able</tspan><tspan x={0} dy={42} fill={P.ambar}>to conduct our business."</tspan></text>
        <Rot x={0} y={138} t="THERE IS NO SECOND SUPPLIER." cor={P.menta} tam={22} peso={700} />
      </g>
    </g>
  );
};

const Pontos: React.FC<Ctx> = ({ g, a, q }) => {
  const cols = 45, lin = 20, px = 30, x0 = 960 - (cols * px) / 2 + 15, y0 = 250, on = a(1, 40), lit = a(2, 40), c1 = Math.round(a(1, 40) * 9349), c2 = Math.round(lit * 2000);
  return (
    <g>
      {Array.from({ length: cols * lin }, (_, i) => {
        const cx = i % cols, cy = Math.floor(i / cols); if ((cx + cy * 1.5) / (cols + lin * 1.5) > on) return null;
        const aceso = i < 200 && (i / 200) < lit;
        return <circle key={i} cx={x0 + cx * px} cy={y0 + cy * px} r={aceso ? 9 : 7} fill={aceso ? P.menta : P.fantasma} opacity={aceso ? 0.85 + 0.15 * Math.sin(g / 6 + i) : 0.8} />;
      })}
      <Rot x={x0 - 10} y={y0 + lin * px + 20} t="EACH DOT = ABOUT 10 PEOPLE" tam={18} />
      <g opacity={a(1, 10)}><Txt x={M + 200} y={y0 + lin * px + 110} s={90} c={P.osso}>{c1.toLocaleString('en-US')}</Txt><Rot x={M + 540} y={y0 + lin * px + 104} t="ZEISS SMT EMPLOYEES" tam={22} /></g>
      <g opacity={a(2, 10)}><Txt x={1060} y={y0 + lin * px + 110} s={90} c={P.menta}>{c2.toLocaleString('en-US')}</Txt><Rot x={1310} y={y0 + lin * px + 104} t="ON THE NEWEST MIRRORS" tam={22} cor={P.menta} peso={700} /></g>
      {void q}
    </g>
  );
};

const Duas: React.FC<Ctx> = ({ g, v, a, q }) => {
  const l1: string = v.l1 || '', l2: string = v.l2 || '', t1 = Math.min(110, 1640 / (0.52 * l1.length)), t2 = Math.min(130, 1640 / (0.52 * Math.max(8, l2.length))), s = pop(g, q(2));
  return (
    <g>
      {v.rot && <Rot x={960} y={330} t={v.rot} anc="middle" tam={28} cor={P.ambar} peso={700} esp={6} />}
      <Txt x={960} y={l2 ? 480 : 560} textAnchor="middle" s={t1} c={l2 ? P.cinza : P.osso} opacity={a(1, 10)}>{l1}</Txt>
      {l2 && <Txt x={960} y={650 + (1 - Math.min(1, s)) * 30} textAnchor="middle" s={t2} c={P.menta} opacity={a(2, 8)}>{l2}</Txt>}
    </g>
  );
};

const Gargalo: React.FC<Ctx> = ({ g, a }) => {
  const y = 560, p2 = a(2, 20), n = 13;
  return (
    <g>
      <g opacity={a(1, 12)}>
        <Txt x={M + 30} y={330} s={54} c={P.osso}>AI DEMAND</Txt><Rot x={M + 34} y={368} t="MORE CHIPS, MORE MACHINES" tam={20} />
        {Array.from({ length: n }, (_, i) => { const yy = y - 150 + i * 25, alvo = y - 18 + (i - 6) * 3, passa = i >= 5 && i <= 7;
          return <g key={i}><path d={`M ${M + 30},${yy} L 760,${yy + (alvo - yy) * p2}${passa || p2 < 0.5 ? ` L 1180,${y + (i - 6) * 3 * (p2 > 0.5 ? 1 : 8.3)} L 1380,${y + (i - 6) * (p2 > 0.5 ? 3 : 25)}` : ''}`} fill="none" stroke={passa ? P.menta : P.luz} strokeWidth={5} strokeDasharray="22 14" strokeDashoffset={-g * 4} strokeLinecap="round" opacity={passa ? 1 : 0.7 - 0.3 * p2} /></g>; })}
        <rect x={1400} y={y - 110} width={410} height={220} rx={10} fill={P.painel} stroke={P.menta} strokeWidth={3.5} /><Rot x={1430} y={y - 62} t="FINISHED MACHINES" tam={18} /><Txt x={1430} y={y + 30} s={84}>ASML</Txt><Rot x={1430} y={y + 76} t="WANTS TO BUILD MORE" cor={P.menta} peso={700} tam={20} />
      </g>
      <g opacity={p2}>
        <path d={`M 780,${y - 190} L 900,${y - 30} L 1160,${y - 30} M 780,${y + 190} L 900,${y + 30} L 1160,${y + 30}`} fill="none" stroke={P.ambar} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <Txt x={920} y={y - 62} s={32} c={P.ambar}>ZEISS OPTICS CAPACITY</Txt>
        <Rot x={920} y={y + 82} t="OUTPUT IS LIMITED BY HOW MANY" cor={P.ambar} tam={18} peso={700} esp={1} /><Rot x={920} y={y + 110} t="OPTICS ZEISS CAN PRODUCE" cor={P.ambar} tam={18} peso={700} esp={1} />
      </g>
      <g opacity={a(3, 12)}><circle cx={1030} cy={y + 220} r={8 + 3 * Math.sin(g / 6)} fill={P.menta} /><Rot x={1052} y={y + 228} t="OBERKOCHEN, SOUTHERN GERMANY · EXPANDING" cor={P.menta} tam={22} peso={700} /></g>
    </g>
  );
};

const Fim: React.FC<Ctx> = ({ g, a, q }) => {
  const n = 7, lw = 230, x0 = 960 - ((n - 1) * 190) / 2, y = 400;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => { const e = L(g, [i * 4, i * 4 + 12], [0, 1]), esp = i === 3, prox = i === 4 && a(1, 10) > 0, cor = esp ? P.menta : prox ? P.ambar : P.fantasma; return (
        <g key={i} opacity={e} transform={`translate(${x0 + i * 190},${y + (i % 2 ? 12 : -12)}) rotate(${i % 2 ? 8 : -8})`}>
          <rect x={-lw / 2} y={-52} width={lw} height={104} rx={52} fill="none" stroke={cor} strokeWidth={esp || prox ? 12 : 9} />
          {!esp && <Txt x={0} y={18} textAnchor="middle" s={50} c={cor} opacity={0.9}>?</Txt>}
        </g>); })}
      <Rot x={x0 + 3 * 190} y={y + 120} t="THE MIRROR" anc="middle" cor={P.menta} peso={700} tam={22} />
      <g opacity={a(1, 10)}><Rot x={x0 + 4 * 190} y={y - 96} t="NEXT" anc="middle" cor={P.ambar} peso={700} tam={22} /></g>
      <g opacity={a(2, 8)} transform={`translate(960,690) scale(${0.8 + 0.2 * pop(g, q(2))})`}><rect x={-290} y={-62} width={580} height={124} rx={62} fill={P.osso} /><Txt x={0} y={22} textAnchor="middle" s={64} c={P.fundo} ls={3}>SUBSCRIBE</Txt></g>
      <g opacity={a(3, 10)}><Rot x={960} y={850} t="COMMENT: WHICH COMPANY SHOULD WE TAKE APART NEXT?" anc="middle" cor={P.menta} peso={700} tam={26} /></g>
    </g>
  );
};

const DIAG: Record<string, React.FC<any>> = { check: Check, alemanha: Alemanha, travas: Travas, espectro: Espectro, absorve: Absorve, gota: Gota, feixe: Feixe, camadas: Camadas, copia: Copia, lua: Lua, cta: Cta, polir: Polir, camara: Camara, nums: Nums, tres: Tres, linha: Linha, casamento: Casamento, pontos: Pontos, duas: Duas, gargalo: Gargalo, fim: Fim };

const Cena: React.FC<{ g: number; D: number; b: Bloco; ini: number; zero?: boolean }> = ({ g, D, b, ini, zero }) => {
  // zero: no 1º bloco do vídeo a imagem já entra no quadro 0, antes da voz (o começo não pode ficar parado no preto)
  const ts = b.falas.map((x, k) => (zero && k === 0 ? 0 : Math.round(x.t * 30) - ini));
  const est = React.useMemo(() => { const arr: V[] = []; let s: V = {}; for (const f of b.falas) { s = { ...s, ...(f.v || {}) }; for (const k of Object.keys(s)) if (s[k] === null) delete s[k]; arr.push(s); } return arr; }, [b]);
  let i = 0; for (let k = 0; k < ts.length; k++) if (g >= ts[k]) i = k;
  const v = est[i];
  const id = (e: V) => e.d + '|' + (e.d === 'check' || e.d === 'nums' ? J(e.it) : e.d === 'duas' ? e.l1 : '');
  let j0 = i; while (j0 > 0 && id(est[j0 - 1]) === id(v)) j0--;
  const t0 = Math.max(0, ts[j0]);
  const quando = (p: (e: V) => boolean) => { for (let j = j0; j <= i; j++) if (p(est[j])) return Math.max(0, ts[j]); return 1e9; };
  const q = (n: number) => (n <= 0 ? t0 : quando((e) => (e.n || 0) >= n));
  const a = (n: number, dur = 14, atraso = 0) => L(g, [q(n) + atraso, q(n) + atraso + dur], [0, 1]);
  const desde = (ch: string) => { let j = i; while (j > 0 && J(est[j - 1][ch]) === J(v[ch]) && id(est[j - 1]) === id(v)) j--; return Math.max(0, ts[j]); };
  const D0 = DIAG[v.d];
  const ctx: Ctx = { g, v, a, q, t0, quando };
  const punch = 1 + 0.01 * L(g, [ts[i], ts[i] + 9], [1, 0]), tk = v.k ? desde('k') : 0, tt = v.tit ? desde('tit') : 0;
  const eD = L(g, [t0, t0 + 8], [0, 1]);
  return (
    <AbsoluteFill style={{ transform: `scale(${(1 + 0.03 * Math.min(1, g / D)) * punch})` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs />
        {v.tit && <g opacity={L(g, [tt, tt + 10], [0, 1])} transform={`translate(0,${L(g, [tt, tt + 10], [16, 0])})`}><Titulo x={M} y={v.tit.length > 1 ? 210 : 220} linhas={v.tit} tam={v.tit.length > 1 ? 80 : Math.min(88, 1700 / (0.5 * v.tit[0].length))} cor={COR[v.cor] || P.menta} /></g>}
        <g opacity={eD}>
          {v.d === 'big' ? <Big {...ctx} desdeT={desde('t')} desdeSub={desde('sub')} /> : D0 ? <D0 {...ctx} /> : null}
        </g>
        {v.k && <text x={960} y={962 + L(g, [tk, tk + 8], [14, 0])} textAnchor="middle" fontFamily={TIT} fontWeight={500} fontSize={Math.min(46, 1640 / (0.5 * v.k.length))} fill={P.osso} opacity={L(g, [tk, tk + 8], [0, 1])} letterSpacing={-0.5}><Hl t={v.k} cor={P.ambar} /></text>}
      </svg>
    </AbsoluteFill>
  );
};

// cabeçalho (trava atual) e rodapé (fonte + assinatura), fixos por cima das cenas
const Fixos: React.FC<{ f: number; tempos: TemposHTC }> = ({ f, tempos }) => {
  let bi = 0; tempos.blocos.forEach((b, i) => { if (f >= Math.round(b.ini * 30)) bi = i; });
  const b = tempos.blocos[bi], ini = Math.round(b.ini * 30), ant = bi > 0 ? tempos.blocos[bi - 1] : null, total = 5;
  const mudouT = !ant || ant.trava !== b.trava || ant.nome !== b.nome, mudouF = !ant || ant.fonte !== b.fonte;
  const oT = mudouT ? L(f, [ini + 2, ini + 14], [0, 1]) : 1, oF = mudouF ? L(f, [ini + 6, ini + 18], [0, 1]) : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {b.trava != null && (
        <g transform={`translate(${M},70)`} opacity={oT}>
          {Array.from({ length: total }, (_, i) => { const feito = i + 1 < b.trava, atual = i + 1 === b.trava; return <rect key={i} x={i * 30} y={0} width={20} height={20} rx={3} fill={feito ? P.menta : atual ? P.ambar : 'none'} stroke={feito ? P.menta : atual ? P.ambar : P.fantasma} strokeWidth={2.5} opacity={atual ? 0.75 + 0.25 * Math.sin(f / 8) : 1} />; })}
          <text x={total * 30 + 14} y={17} fontFamily={MONO} fontWeight={700} fontSize={22} fill={P.osso} letterSpacing={2.5}>LOCK {b.trava}/{total}<tspan fill={P.cinza}>{b.nome ? '  ·  ' + b.nome : ''}</tspan></text>
        </g>
      )}
      {b.fonte && <text x={M} y={H - 54} fontFamily={MONO} fontWeight={500} fontSize={20} fill={P.cinza} letterSpacing={1.5} opacity={oF}>SOURCE · {b.fonte}</text>}
      <text x={W - M} y={H - 54} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={20} fill={P.fantasma} letterSpacing={4}>HARD TO COPY</text>
      <rect x={0} y={H - 5} width={(W * f) / Math.ceil(tempos.total * 30)} height={5} fill={P.menta} opacity={0.55} />
    </svg>
  );
};

export const HTCVideo: React.FC<{ tempos: TemposHTC }> = ({ tempos }) => {
  const f = useCurrentFrame(); const X = 6; const n = tempos.blocos.length, fimV = Math.ceil(tempos.total * 30);
  return (
    <AbsoluteFill style={{ background: P.fundo, overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${-((f * 0.25) % 48)}px, 0)` }}><Defs /><rect width={W + 48} height={H} fill="url(#foco)" /><rect width={W + 48} height={H} fill="url(#pontos)" /></svg>
      {tempos.blocos.map((b, i) => {
        const ini = i === 0 ? 0 : Math.round(b.ini * 30), fim = i === n - 1 ? fimV + 30 : Math.round(b.fim * 30);
        if (f < ini - X || f > fim + X) return null;
        const op = L(f, [ini - X, ini + X], [0, 1]) * (i === n - 1 ? 1 : L(f, [fim - X, fim + X], [1, 0]));
        return <AbsoluteFill key={i} style={{ opacity: i === 0 ? 1 : op }}><Cena g={Math.max(0, f - ini)} D={fim - ini} b={b} ini={ini} zero={i === 0} /></AbsoluteFill>;
      })}
      <Fixos f={f} tempos={tempos} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.045, mixBlendMode: 'overlay' }}><Img src={staticFile(`fx/grain${f % 4}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
      <AbsoluteFill style={{ background: '#000', opacity: Math.max(L(f, [0, 4], [1, 0]), L(f, [fimV - 20, fimV - 2], [0, 1])) }} />
    </AbsoluteFill>
  );
};
void Fundo; void Cota;
