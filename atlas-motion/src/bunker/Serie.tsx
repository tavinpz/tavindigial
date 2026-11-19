import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import './fontes';
import { Ben, Sala, Defs, Lata, Humor } from './Teste';
import {
  W, H, CHAO, AB, GIZ, ip, pop, Etq, Nao, ISol, Prateleira, Barris, Caixote, Kurbel, Lousa, Quadro, Certo, Visor, Cama,
  Bateria, Bici, Cabo, Marder, MarderCara, Duto, GradeSolta, Garrafa, Saco, Balde, Prato, Livros, Riscos,
} from './Objetos';

// Bunker, episódios 2 em diante: o vídeo é montado a partir do tempos.json do episódio (public/bunker/vNN).
// Cada fala pode trazer uma diretiva visual `v` ({c: cena, ...parâmetros}); sem diretiva, a cena anterior continua.
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const HUM: Record<string, Humor> = { n: 'neutro', p: 'preocupado', c: 'cetico', m: 'medo', s: 'sorriso' };
const COR: Record<string, [string, string, string]> = { r: ['#fff', '#d63b2f', '#7d1f1a'], y: ['#22303a', '#f4c64d', '#3a2a1e'], b: ['#123f6e', '#f3ead8', '#123f6e'], g: ['#fff', '#3f9b5a', '#1f5a33'] };
type Ctx = { f: number; t0: number; tc: number; k: number; q: (x: number) => number; boca: number; p: any };

const Rot: React.FC<{ x: number; y: number; t?: string; tc?: string; s: number; fs?: number }> = ({ x, y, t, tc, s, fs = 76 }) => {
  if (!t) return null;
  const c = COR[tc || ''] || ['#22303a', '#f3ead8', '#3a2a1e'];
  return <Etq x={x} y={y} s={s} t={t} fs={t.length > 14 ? Math.max(40, fs * 14 / t.length) : fs} cor={c[0]} fundo={c[1]} borda={c[2]} rot={-3} />;
};

// Objeto grande do lado direito da cena (centro em x=1320)
export const Obj: React.FC<{ o?: string; f: number; t0: number; p: any }> = ({ o, f, t0, p }) => {
  const s = pop(f, t0 + 3, 11);
  const X = 1320, CH = CHAO + 70;
  const G: React.FC<{ y?: number; children: React.ReactNode }> = ({ y = CH, children }) => <g transform={`translate(${X} ${y}) scale(${s}) translate(${-X} ${-y})`}>{children}</g>;
  switch (o) {
    case 'lata': return <G y={560}><circle cx={X} cy={520} r={200} fill="#ffdc9e" opacity={0.3} filter="url(#brilho)" /><Lata x={X} y={670} cor={p.cor2 || '#d8453b'} s={4.2} /></G>;
    case 'garrafa': return <G><Garrafa x={X} y={CH} s={3.4} /></G>;
    case 'barril': return <G><Barris /></G>;
    case 'vazio': return (
      <G>
        <Barris />
        <ellipse cx={1500} cy={CH + 6} rx={230} ry={26} fill="#4aa3e0" opacity={0.55} />
        <path d="M1520 620 l-14 40 l16 30 l-12 44" stroke="#0b1114" strokeWidth={6} fill="none" />
        {[0, 1, 2].map((i) => <circle key={i} cx={1514} cy={740 + ((f * 4 + i * 30) % 90)} r={7} fill="#7cc4f2" />)}
      </G>
    );
    case 'bateria': return <G><Bateria x={X} y={CH} s={1.9} nivel={p.nv ?? 0.6} f={f} /></G>;
    case 'gisela': return <G><Bateria x={X} y={CH} s={1.9} nivel={p.nv ?? 0.7} gisela={1} f={f} /></G>;
    case 'kurbel': return <G><Caixote x={X} y={CH - 20} s={1.4} /><Kurbel x={X} y={CH - 200} s={2} f={f} glow={p.glow ?? 1} /></G>;
    case 'cama': return <G><Cama x={X} y={CH - 10} s={1.2} olhos={p.olhos ? 1 : 0} /></G>;
    case 'livros': return <G><Livros x={X} y={CH} s={2} /></G>;
    case 'saco': return <G><Saco x={X - 130} y={CH} s={2} t={p.st || 'REIS'} /><Saco x={X + 150} y={CH + 8} s={2} t={p.st || 'REIS'} /></G>;
    case 'balde': return <G><Balde x={X} y={CH} s={2.1} t={p.st || 'HAFER'} /></G>;
    case 'marder': return <G><Marder x={X - 30} y={CH - 10} k={1.9} come={p.come ? (f % 14 < 7 ? 1 : 0.3) : 0} flip={!!p.flip} /></G>;
    case 'marderf': return <G y={450}><circle cx={X} cy={450} r={230} fill="#0a1011" stroke="#4a585b" strokeWidth={10} /><g transform={`translate(${X} 430)`}><MarderCara s={2.9} brilho={p.brilho ? 1 : 0} /></g></G>;
    case 'filhotes': return (
      <G>
        <Marder x={X - 150} y={CH - 10} k={1.5} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(0 ${-Math.abs(Math.sin((f + i * 9) / 5)) * 10})`}><Marder x={X + 170 + i * 130} y={CH + 10 - i * 4} k={0.55} flip={i === 1} /></g>)}
      </G>
    );
    case 'cabo': return (
      <G>
        <Bateria x={X + 180} y={CH} s={1.5} nivel={0.03} f={f} />
        <path d={`M${X - 420} ${CH - 60} Q${X - 300} ${CH + 20} ${X - 170} ${CH - 30}`} stroke="#11191a" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={`M${X - 110} ${CH - 44} Q${X - 40} ${CH - 10} ${X + 40} ${CH - 130}`} stroke="#11191a" strokeWidth={16} fill="none" strokeLinecap="round" />
        {[-170, -110].map((dx) => <g key={dx}>{[-8, 0, 8].map((a) => <line key={a} x1={X + dx} y1={CH - 36} x2={X + dx + (dx < -140 ? 16 : -16)} y2={CH - 36 + a} stroke="#c98a52" strokeWidth={4} />)}</g>)}
        {f % 10 < 5 && <path d={`M${X - 146} ${CH - 80} l-10 18 l18 -4 l-10 20`} stroke="#ffe08a" strokeWidth={6} fill="none" />}
      </G>
    );
    case 'relogio': return (
      <G y={450}><g transform={`translate(${X} 450) scale(1.9)`}><circle r={110} fill="#f3ead8" stroke="#22303a" strokeWidth={12} />{[0, 90, 180, 270].map((a) => <rect key={a} x={-4} y={-100} width={8} height={18} fill="#22303a" transform={`rotate(${a})`} />)}<rect x={-5} y={-80} width={10} height={84} rx={5} fill="#22303a" transform={`rotate(${f * (p.vel ?? 9)})`} /><rect x={-6} y={-54} width={12} height={58} rx={6} fill="#d63b2f" transform={`rotate(${f * (p.vel ?? 9) / 4})`} /><circle r={10} fill="#22303a" /></g></G>
    );
    case 'coracao': return <G y={450}><g transform={`translate(${X} 450) scale(${3.4 + (f % 26 < 5 ? 0.6 : 0)})`}><path d="M0 34 C-70 -20 -34 -70 0 -32 C34 -70 70 -20 0 34 Z" fill="#ff4a5a" /></g></G>;
    case 'sol': return <Nao x={X} y={450} s={s * 2.6}><ISol /></Nao>;
    case 'mofo': return (
      <G>
        <Saco x={X - 120} y={CH} s={2} t={p.st || 'REIS'} /><Saco x={X + 160} y={CH + 8} s={2} t={p.st || 'REIS'} />
        {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={X - 230 + random(`mx${i}`) * 520} cy={CH - 260 + random(`my${i}`) * 220} r={10 + random(`mr${i}`) * 22} fill={i % 3 ? '#3d5a3a' : '#1f2a22'} opacity={0.85 * pop(f, t0 + 10 + i * 2, 8)} />)}
        {Array.from({ length: 9 }).map((_, i) => <circle key={`w${i}`} cx={X - 300 + random(`wx${i}`) * 650} cy={220 + random(`wy${i}`) * 200} r={14 + random(`wr${i}`) * 26} fill="#22352a" opacity={0.55 * pop(f, t0 + 20 + i * 3, 8)} filter="url(#suave2)" />)}
      </G>
    );
    case 'gota': return (
      <G>
        <rect x={X - 320} y={300} width={640} height={44} rx={20} fill="url(#cano)" />
        {[-200, -60, 90, 230].map((dx, i) => <circle key={dx} cx={X + dx} cy={356 + ((f * 3 + i * 40) % 330)} r={9} fill="#7cc4f2" opacity={0.9} />)}
        {[-200, -60, 90, 230].map((dx) => <circle key={`c${dx}`} cx={X + dx} cy={350} r={10} fill="#bfe3fa" />)}
        <path d={`M${X - 260} ${CH - 90} Q${X - 240} ${CH} ${X} ${CH} Q${X + 240} ${CH} ${X + 260} ${CH - 90} Z`} fill="#e9eef0" stroke="#8d989a" strokeWidth={6} />
        <ellipse cx={X} cy={CH - 90} rx={260} ry={22} fill="#9fd0ef" stroke="#8d989a" strokeWidth={5} />
      </G>
    );
    case 'prato': return <G><g transform={`translate(${X} ${CH - 40}) scale(2.6)`}><Prato x={0} y={0} s={1}>{p.cheio !== 0 && <path d="M-46 -4 Q0 -40 46 -4 Z" fill={p.cor2 || '#efe6c8'} />}</Prato></g></G>;
    case 'visor': return <G y={450}><Visor x={X} y={450} s={2.1} rotulo={p.r || 'CO₂'} valor={p.val || '--'} cor={p.cor === 'g' ? '#4fd07a' : p.cor === 'y' ? '#f2a53a' : '#ff4a36'} /></G>;
    case 'diario': return <G y={470}><g transform={`translate(${X} 470) scale(2.4)`}><rect x={-70} y={-90} width={140} height={180} rx={10} fill="#7a4fa0" /><rect x={-70} y={-90} width={24} height={180} fill="#000" opacity={0.25} /><rect x={-30} y={-50} width={84} height={36} rx={4} fill="#f3ead8" /><rect x={30} y={-110} width={14} height={90} rx={4} fill="#e2b33c" transform="rotate(24 37 -65)" /></g></G>;
    case 'riscos': return <g opacity={s}><Riscos x={X - 22 * Math.min(14, p.nn || 5)} y={340} n={Math.min(14, p.nn || 5)} s={1.5} /></g>;
    case 'grade': return <G y={450}><Duto x={X} y={470} s={1.7} f={f} cano={false} ar={p.ar ? 1 : 0} fita={p.ar ? 1 : 0} /></G>;
    default: return null;
  }
};

const luzDe = (n?: number): [number, number] => (n === 2 ? [0.06, 0.78] : n === 1 ? [0.5, 0.35] : [1, 0]);

const CENAS: Record<string, (c: Ctx) => React.ReactNode> = {
  ben: ({ f, boca, p }) => {
    const [luz, frio] = luzDe(p.n);
    const b = <Ben x={p.x ?? 860} y={1560} k={2.5} humor={HUM[p.h] || 'neutro'} gesto={p.g ?? 0} apontar={p.a ?? 0} maoCabeca={!!p.m} olhar={p.ol ?? (p.n === 2 ? Math.sin(f / 11) : 0)} inclina={p.inc ?? 0} fala={boca} />;
    return <Sala luz={luz} frio={frio} frente={p.n ? b : undefined}>{p.n ? null : b}</Sala>;
  },
  obj: ({ f, t0, tc, boca, p }) => {
    const [luz, frio] = luzDe(p.n);
    const b = <Ben x={430} y={910} k={1.05} humor={HUM[p.h] || 'neutro'} olhar={0.9} apontar={p.a ?? 0.5} gesto={p.g ?? 0} maoCabeca={!!p.m} fala={boca} />;
    const cena = <g><Obj o={p.o} f={f} t0={tc} p={p} /><Rot x={1320} y={p.ty ?? 180} t={p.t} tc={p.tc} s={pop(f, t0 + 12)} /></g>;
    return <Sala luz={luz} frio={frio} frente={p.n ? <g>{p.n === 2 ? null : null}{b}{p.claro ? cena : null}</g> : undefined}>{p.claro && p.n ? null : cena}{p.n ? null : b}</Sala>;
  },
  lista: ({ f, t0, tc, k, q, boca, p }) => {
    const it: string[] = p.it || [];
    const qs: number[] | undefined = p.q;
    return (
      <Sala>
        <Quadro x={1180} y={430} w={900} h={170 + it.length * 112} titulo={p.tt} s={pop(f, tc + 2, 12)}>
          {it.map((t, i) => {
            const s = qs ? (k > 0 ? 1 : pop(f, q(qs[i] ?? 1))) : i <= k ? pop(f, i === 0 ? t0 + 10 : -99) : 0;
            const sim = t.startsWith('+'), nao = t.startsWith('-');
            const txt = sim || nao ? t.slice(1) : t;
            const [a, b] = txt.split('|');
            return (
              <g key={i} transform={`translate(70 ${150 + i * 112}) scale(${qs ? s : i <= k ? 1 : 0})`} opacity={qs ? 1 : i === k ? pop(f, t0 + 6) : 1}>
                <rect width={760} height={94} rx={12} fill={nao ? '#d63b2f' : '#22303a'} />
                <text x={28} y={63} fontFamily={AB} fontWeight={900} fontSize={a.length > 20 ? 36 : 46} fill="#f3ead8">{a}</text>
                {b && <text x={732} y={63} textAnchor="end" fontFamily={AB} fontWeight={900} fontSize={46} fill="#f4c64d">{b}</text>}
                {sim && <Certo x={704} y={47} s={0.95} />}
              </g>
            );
          })}
        </Quadro>
        <Ben x={330} y={910} humor={HUM[p.h] || 'neutro'} olhar={0.9} apontar={0.55} fala={boca} />
      </Sala>
    );
  },
  lousa: ({ f, t0, k, q, boca, p }) => {
    const it: string[] = p.it || [];
    const qs: number[] | undefined = p.q;
    return (
      <Sala luz={0.9}>
        <Lousa>
          {it.map((t, i) => {
            const o = qs ? (k > 0 ? 1 : ip(f, q(qs[i] ?? 1), q(qs[i] ?? 1) + 10, 0, 1)) : i < k ? 1 : i === k ? ip(f, t0 + 8, t0 + 18, 0, 1) : 0;
            const am = t.startsWith('=') || t.startsWith('≈');
            return <text key={i} x={70} y={150 + i * (it.length > 3 ? 104 : 130)} fontSize={t.length > 15 ? 68 : 90} opacity={o} fill={am ? '#ffd95e' : '#f2f0e4'}>{t}</text>;
          })}
        </Lousa>
        <Ben x={520} y={1560} k={2.5} humor={HUM[p.h] || 'neutro'} olhar={0.9} apontar={0.5} fala={boca} />
      </Sala>
    );
  },
  estoque: ({ f, t0, boca, p }) => (
    <Sala luz={p.n ? 0.6 : 1} frio={p.n ? 0.3 : 0}>
      <Prateleira f={f} falta={p.falta ?? -1} sorted={!!p.sorted} />
      {(p.vazias || []).map((i: number) => <rect key={i} x={166 + (i % 13) * 56 - 26} y={[310, 480, 650][Math.floor(i / 13)] - 66} width={52} height={66} fill="#566866" />)}
      {p.md && <g transform={`translate(0 ${-Math.abs(Math.sin(f / 6)) * 6})`}><Marder x={640} y={310} k={0.8} come={f % 16 < 8 ? 0.8 : 0.2} flip /></g>}
      {p.cai && <g transform="translate(446 310) rotate(84)"><Lata x={0} y={0} cor="#3b78c2" s={1} /></g>}
      <Barris /><Caixote x={1730} y={CHAO + 40} />
      <Rot x={1385} y={300} t={p.t} tc={p.tc} s={pop(f, t0 + 12)} />
      <Ben x={1060} y={910} humor={HUM[p.h] || 'neutro'} olhar={-0.8} olharY={p.md ? -0.8 : 0} gesto={p.g ?? 0.6} fala={boca} />
    </Sala>
  ),
  cama: ({ f, t0, boca, p }) => {
    const [luz, frio] = luzDe(p.n);
    const cx = 1240, cy = CHAO + 110, s = 1.6;
    const cab = p.de ? <g transform={`translate(${cx - 196 * s} ${cy - 196 * s}) rotate(-76) translate(0 ${446 * 0.62 * s})`}><Ben x={0} y={0} k={0.62 * s} soCabeca humor={HUM[p.h] || 'neutro'} dorme={!!p.zz} olhar={p.ol ?? 0} fala={boca} /></g> : null;
    const mx = interpolate(f, [t0 + 10, t0 + 70], [cx - 60, cx - 620], cl);
    return (
      <Sala luz={luz} frio={frio} frente={p.n ? <g>{cab}{!p.de && <Ben x={430} y={910} humor={HUM[p.h] || 'neutro'} olhar={0.9} olharY={0.6} fala={boca} />}{p.zz && <text x={cx - 60} y={cy - 420 - ((f / 2) % 30)} fontFamily={AB} fontSize={70} fill="#cfe0ff" opacity={0.8}>Zzz</text>}</g> : undefined}>
        {p.md && <Marder x={mx} y={cy + 6} k={1.25} flip anda={f * 0.7} />}
        <Cama x={cx} y={cy} s={s} olhos={p.olhos && !p.md ? 1 : 0}>{!p.n && p.de ? <g transform={`translate(-196 -196) rotate(-76) translate(0 ${446 * 0.62})`}><Ben x={0} y={0} k={0.62} soCabeca humor={HUM[p.h] || 'neutro'} dorme={!!p.zz} fala={boca} /></g> : null}</Cama>
        {!p.n && !p.de && <Ben x={430} y={910} humor={HUM[p.h] || 'neutro'} olhar={0.9} olharY={0.6} gesto={p.g ?? 0} fala={boca} />}
        <Rot x={700} y={260} t={p.t} tc={p.tc} s={pop(f, t0 + 12)} />
      </Sala>
    );
  },
  escuro: ({ f, t0, boca, p }) => (
    <Sala luz={p.k ? 0.12 : 0.03} frio={0.8} frente={
      <g>
        {p.k && <g><Caixote x={1250} y={CHAO + 40} s={1.2} /><Kurbel x={1250} y={CHAO - 116} s={1.6} f={f} glow={pop(f, t0 + 6, 14)} /></g>}
        <g opacity={p.k ? 0.95 : 0.6}><Ben x={p.k ? 620 : 860} y={p.k ? 910 : 1500} k={p.k ? 1.05 : 2.3} humor={HUM[p.h] || 'medo'} olhar={p.k ? 0.9 : Math.sin(f / 9)} apontar={p.k ? 0.3 : 0} fala={boca} /></g>
        {p.olhos && <g opacity={pop(f, t0 + 14)}><ellipse cx={1450} cy={700} rx={13} ry={9} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 10px #c8ff5a)' }} /><ellipse cx={1500} cy={700} rx={13} ry={9} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 10px #c8ff5a)' }} /></g>}
        <Rot x={1320} y={300} t={p.t} tc={p.tc || 'r'} s={pop(f, t0 + 12)} />
      </g>
    } />
  ),
  duto: ({ f, t0, boca, p }) => (
    <Sala luz={p.n ? 0.5 : 0.9} frio={p.n ? 0.3 : 0}>
      <Duto x={1400} y={470} s={1.2} f={f} grade={!p.aberto} ar={p.ar ? 1 : 0} fita={p.fita === undefined ? (p.ar ? 1 : -1) : p.fita} olhos={p.olhos ? 1 : 0} cara={p.cara ? 1 : 0} luzIn={p.cara ? 1 : 0} ninho={p.ninho ? 1 : 0} />
      {p.aberto && <GradeSolta x={1340} y={CHAO + 30} s={1.2} rot={78} />}
      <Rot x={900} y={240} t={p.t} tc={p.tc} s={pop(f, t0 + 12)} />
      <Ben x={1060} y={910} humor={HUM[p.h] || 'neutro'} olhar={0.9} olharY={-0.5} apontar={p.a ?? 0.9} fala={boca} />
    </Sala>
  ),
  bici: ({ f, t0, k, boca, p }) => {
    const bx = 1080, by = CHAO + 70, s = 1.1;
    const para = p.para ? t0 + p.para : 1e9;
    const ang = (Math.min(f, para) - t0) * (p.lento ? 0.18 : 0.3);
    return (
      <Sala luz={p.n ? 0.6 : 1} frio={p.n ? 0.25 : 0}>
        <Cabo x1={bx + 160 * s} y1={by - 20} x2={1560} y2={by - 120} />
        <Bateria x={1640} y={by} s={1.15} nivel={ip(f, t0, t0 + 240, p.nv0 ?? 0.2, p.nv1 ?? 0.9)} gisela={p.gis ? 1 : 0} f={f} />
        <Bici x={bx} y={by} s={s} ang={ang} pernas />
        <Ben x={bx - 16 * s} y={by - 262 * s + 150 * 0.95} k={0.95} semPernas humor={HUM[p.h] || 'sorriso'} olhar={0.6} apontar={0.02} fala={boca} />
        <Rot x={500} y={420} t={p.t} tc={p.tc} s={pop(f, t0 + 12)} />
      </Sala>
    );
  },
  agua: ({ f, t0, boca, p }) => (
    <Sala>
      <Obj o={p.vz ? 'vazio' : 'barril'} f={f} t0={-99} p={p} />
      <Rot x={1385} y={300} t={p.t} tc={p.tc || 'b'} s={pop(f, t0 + 12)} />
      <Ben x={760} y={910} k={1.05} humor={HUM[p.h] || 'neutro'} olhar={0.9} olharY={p.vz ? 0.7 : 0} apontar={0.5} gesto={p.g ?? 0} fala={boca} />
    </Sala>
  ),
  pergunta: ({ f, t0, boca, p }) => (
    <Sala>
      <g transform={`translate(1300 380) scale(${pop(f, t0 + 6, 12)})`}>
        <path d="M-380 -200 h760 q40 0 40 40 v240 q0 40 -40 40 h-460 l-140 120 v-120 h-160 q-40 0 -40 -40 v-240 q0 -40 40 -40 Z" fill="#f3ead8" stroke="#22303a" strokeWidth={10} />
        <text x={0} y={-10} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={170} fill="#22303a" transform={`rotate(${Math.sin(f / 9) * 4})`}>?</text>
      </g>
      <g transform={`translate(1300 760) scale(${pop(f, t0 + 30)})`}>
        <rect x={-330} y={-52} width={660} height={104} rx={18} fill="#22303a" stroke="#f4c64d" strokeWidth={6} />
        <text x={-20} y={22} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={56} fill="#f3ead8">KOMMENTARE</text>
        <path d={`M250 ${-18 + Math.sin(f / 4) * 8} v40 m-22 -20 l22 24 l22 -24`} stroke="#f4c64d" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Ben x={520} y={1500} k={2.3} humor={HUM[p.h] || 'neutro'} gesto={0.7} inclina={3} fala={boca} />
    </Sala>
  ),
  placar: ({ f, t0, boca, p }) => (
    <Sala>
      <g transform={`translate(1100 400) scale(${pop(f, t0 + 8, 12)})`}>
        <rect x={-520} y={-170} width={1040} height={340} rx={20} fill="#10161a" stroke="#e7b540" strokeWidth={10} />
        <text x={-260} y={-70} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={70} fill="#f3ead8">{p.a || 'MARDER'}</text>
        <text x={260} y={-70} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={70} fill="#f3ead8">{p.b || 'BEN'}</text>
        <text x={-260} y={110} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={170} fill="#4fd07a">{p.sa ?? 1}</text>
        <text x={0} y={100} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={140} fill="#f3ead8">:</text>
        <text x={260} y={110} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={170} fill="#ff4a36">{p.sb ?? 0}</text>
      </g>
      <Ben x={300} y={910} k={0.95} humor={HUM[p.h] || 'cetico'} olhar={0.9} gesto={0.8} inclina={5} fala={boca} />
    </Sala>
  ),
  fim: ({ f, t0, boca, p }) => (
    <Sala luz={0.5} frio={0.35} frente={
      <g>
        <text x={W / 2} y={380} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={190} fill="#f4c64d" letterSpacing={8} style={{ filter: 'drop-shadow(0 8px 0 #000)' }}>TEIL {p.teil} …</text>
        <g transform={`translate(${W / 2} 600) scale(${pop(f, t0 + 10) * (1 + Math.sin(f / 5) * 0.03)})`}>
          <rect x={-330} y={-70} width={660} height={140} rx={30} fill="#d63b2f" stroke="#7d1f1a" strokeWidth={8} />
          <text x={0} y={26} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={70} fill="#fff">ABONNIEREN</text>
        </g>
        <Marder x={1560} y={CHAO + 150} k={1.3} flip come={f % 30 < 6 ? 0.4 : 0} />
        <Ben x={330} y={CHAO + 200} k={1.15} humor="sorriso" gesto={0.9 + Math.sin(f / 4) * 0.15} olhar={0.5} fala={boca} />
      </g>
    } />
  ),
};

const Placa: React.FC<{ n: number }> = ({ n }) => (
  <g transform="translate(70 56)">
    <rect x={3} y={5} width={n > 99 ? 340 : 300} height={96} rx={12} fill="#000" opacity={0.4} />
    <rect width={n > 99 ? 340 : 300} height={96} rx={12} fill="#1d2626" stroke="#e7b540" strokeWidth={5} />
    <text x={n > 99 ? 170 : 150} y={68} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={54} fill="#f4c64d" letterSpacing={3}>TAG {n}</text>
  </g>
);
const FOCOS: [number, number][] = [[1000, 500], [1150, 480], [900, 520], [1100, 540]];

export const BunkerEp: React.FC<{ tempos: any }> = ({ tempos }) => {
  const f = useCurrentFrame();
  if (!tempos) return null;
  const F = tempos.falas as any[];
  const total = Math.ceil(tempos.total * FPS);
  const boca = (tempos.boca[f] ?? 0) * 0.6 + (tempos.boca[f + 1] ?? 0) * 0.4;
  // fala atual (a cena troca 6 quadros antes da fala)
  let li = 0;
  for (let i = 0; i < F.length; i++) if (f >= fr(F[i].ini) - 6) li = i;
  // diretiva em vigor e há quantas falas
  let di = li;
  while (di > 0 && !F[di].v) di--;
  const p = F[di].v || { c: 'ben' };
  const t0 = di === 0 ? 0 : fr(F[di].ini) - 6;
  let fimD = total;
  for (let i = di + 1; i < F.length; i++) if (F[i].v) { fimD = fr(F[i].ini) - 6; break; }
  // corte com fade só quando muda o tipo de cena
  let ci = di;
  while (ci > 0) { let a = ci - 1; while (a > 0 && !F[a].v) a--; const pv = F[a].v || {}; if (pv.c !== p.c || pv.o !== p.o || pv.tt !== p.tt || (pv.n || 0) !== (p.n || 0)) break; ci = a; }
  const tCorte = ci === 0 ? 0 : fr(F[ci].ini) - 6;
  const entra = tCorte === 0 ? 1 : interpolate(f, [tCorte, tCorte + 5], [0, 1], cl);
  const sai = interpolate(f, [total - 20, total - 2], [1, 0], cl);
  let dia = 1;
  for (let i = 0; i <= li; i++) if (F[i].d) dia = F[i].d;
  const foco = FOCOS[di % FOCOS.length];
  const z = interpolate(f, [t0, fimD], di % 2 ? [1.07, 1.02] : [1.02, 1.08], cl);
  const q = (x: number) => Math.round(fr(F[di].ini) + x * (fr(F[di].fim) - fr(F[di].ini)));
  const cena = CENAS[p.c] || CENAS.ben;
  const t = f / FPS;
  const leg = F.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.25);
  return (
    <AbsoluteFill style={{ background: '#050808' }}>
      <AbsoluteFill style={{ opacity: entra * sai }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <Defs />
          <g transform={`translate(${foco[0]} ${foco[1]}) scale(${z}) translate(${-foco[0]} ${-foco[1]})`}>{cena({ f, t0, tc: tCorte, k: li - di, q, boca, p })}</g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: sai }}><svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}><Placa n={dia} /></svg></AbsoluteFill>
      {leg && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 1380, textAlign: 'center', fontFamily: AB, fontWeight: 900, fontSize: 46, lineHeight: 1.18, color: '#fff', padding: '10px 26px', borderRadius: 14, background: 'rgba(8,12,12,0.62)', textShadow: '0 3px 0 #000' }}>{leg.t}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
