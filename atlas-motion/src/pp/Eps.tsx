import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Fonts, Bottle, Pill } from './PickPals';
import { BoBunny, CoachKiwi, RoomBG } from './Toon';
import { Txt, Chip, CandyIcon, Table, Captions, Stamp, Confetti, Sparkle, cam, sp, ease, eio, lerp, cl, CX } from './ToonEp';

type Beat = { t0: number; t1: number; txt: string; who: string };
type Dados = { dur: number; quadros: number; beats: Record<string, Beat>; boca: number[]; quem: string };
const INK = C.ink;

/* ================= objetos ================= */
export const Scissors: React.FC<{ x?: number; y?: number; s?: number; rot?: number }> = ({ x = 0, y = 0, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-6 0 L 70 -14 L 72 -4 Z M-6 0 L 70 14 L 72 4 Z" fill="#D5DDE8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-28} cy={-16} r={16} fill="none" stroke={C.tomato} strokeWidth={10} />
    <circle cx={-28} cy={16} r={16} fill="none" stroke={C.tomato} strokeWidth={10} />
    <circle r={5} fill={INK} />
  </g>
);
const Cookie: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={34} fill="#E3A35E" stroke="#6B3E1F" strokeWidth={6} />
    {[[-12, -10], [10, -4], [-4, 12], [14, 14], [-16, 8]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={5} fill="#5A2E14" />)}
  </g>
);
const Germ: React.FC<{ x: number; y: number; t: number; s?: number; c?: string }> = ({ x, y, t, s = 1, c = '#7BD34A' }) => (
  <g transform={`translate(${x + Math.sin(t * 7 + x) * 6} ${y + Math.cos(t * 6 + y) * 6}) scale(${s}) rotate(${Math.sin(t * 5 + x) * 15})`}>
    {Array.from({ length: 7 }).map((_, i) => { const a = (i / 7) * Math.PI * 2; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 26} y2={Math.sin(a) * 26} stroke={INK} strokeWidth={4} strokeLinecap="round" />; })}
    <circle r={18} fill={c} stroke={INK} strokeWidth={4} />
    <circle cx={-6} cy={-3} r={4} fill="#fff" /><circle cx={6} cy={-3} r={4} fill="#fff" /><circle cx={-6} cy={-3} r={2} fill={INK} /><circle cx={6} cy={-3} r={2} fill={INK} />
    <path d="M-6 7 Q 0 3 6 7" stroke={INK} strokeWidth={3} fill="none" />
  </g>
);
const Sink: React.FC<{ x: number; y: number; t: number; on?: number }> = ({ x, y, t, on = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={0} width={340} height={260} rx={20} fill="#fff" stroke={INK} strokeWidth={7} />
    <rect x={-150} y={-20} width={300} height={60} rx={26} fill="#DDF2FF" stroke={INK} strokeWidth={7} />
    <path d="M30 -20 L 30 -110 Q 30 -130 10 -130 L -40 -130" stroke="#9FB2C6" strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M30 -20 L 30 -110 Q 30 -130 10 -130 L -40 -130" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
    {on > 0 && <rect x={-46} y={-122} width={14} height={110} rx={7} fill="#7CCBFF" opacity={0.8} />}
    <rect x={90} y={-46} width={56} height={30} rx={10} fill={C.pink} stroke={INK} strokeWidth={5} />
    {on > 0 && Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={-60 + ((i * 37) % 120)} cy={-30 - ((t * 80 + i * 40) % 160)} r={10 + (i % 3) * 5} fill="#fff" stroke="#9FD8FF" strokeWidth={3} opacity={0.9} />)}
  </g>
);
const Door: React.FC<{ x: number; y: number; open?: number }> = ({ x, y, open = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-540} width={300} height={540} rx={12} fill="#7A4A2A" stroke={INK} strokeWidth={8} />
    {open > 0 && <g><rect x={-140} y={-530} width={280} height={530} fill="#2E2850" />
      <g opacity={open}><ellipse cx={0} cy={-330} rx={70} ry={80} fill="#151229" /><rect x={-90} y={-260} width={180} height={260} rx={60} fill="#151229" /><circle cx={-22} cy={-340} r={9} fill="#fff" /><circle cx={22} cy={-340} r={9} fill="#fff" /></g></g>}
    <g transform={`scale(${1 - open * 0.85} 1)`} style={{ transformOrigin: '-150px 0px' }}>
      <rect x={-140} y={-530} width={280} height={530} rx={10} fill="#C9844E" stroke={INK} strokeWidth={6} />
      <rect x={-100} y={-480} width={200} height={190} rx={14} fill="none" stroke="#8E5530" strokeWidth={8} />
      <rect x={-100} y={-250} width={200} height={190} rx={14} fill="none" stroke="#8E5530" strokeWidth={8} />
      <circle cx={100} cy={-270} r={18} fill={C.sun} stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-400} r={14} fill="#2E2850" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);
const Bed: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-260} y={-260} width={40} height={260} rx={14} fill="#8E63D9" stroke={INK} strokeWidth={7} />
    <rect x={-240} y={-140} width={500} height={110} rx={30} fill="#fff" stroke={INK} strokeWidth={7} />
    <rect x={-120} y={-150} width={380} height={120} rx={30} fill="#7FB7FF" stroke={INK} strokeWidth={7} />
    <ellipse cx={-180} cy={-160} rx={60} ry={34} fill="#fff" stroke={INK} strokeWidth={6} />
    <rect x={-240} y={-40} width={30} height={40} fill="#8E63D9" stroke={INK} strokeWidth={6} /><rect x={230} y={-40} width={30} height={40} fill="#8E63D9" stroke={INK} strokeWidth={6} />
  </g>
);
export const Tooth: React.FC<{ x: number; y: number; s?: number; happy?: boolean; dirty?: number }> = ({ x, y, s = 1, happy = true, dirty = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 -50 C -70 -90 -20 -95 0 -75 C 20 -95 70 -90 60 -50 C 55 -10 50 30 40 60 C 34 80 20 74 16 50 C 12 30 -12 30 -16 50 C -20 74 -34 80 -40 60 C -50 30 -55 -10 -60 -50 Z"
      fill={dirty > 0.5 ? '#F2E6B8' : '#fff'} stroke={INK} strokeWidth={6} />
    <circle cx={-18} cy={-30} r={7} fill={INK} /><circle cx={18} cy={-30} r={7} fill={INK} />
    <path d={happy ? 'M-16 -8 Q 0 8 16 -8' : 'M-16 0 Q 0 -14 16 0'} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    {!happy && <path d="M-26 -18 q -4 14 0 22" stroke="#7CCBFF" strokeWidth={6} fill="none" strokeLinecap="round" />}
  </g>
);
const Toothbrush: React.FC<{ x?: number; y?: number; s?: number; rot?: number }> = ({ x = 0, y = 0, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-6} y={-90} width={16} height={110} rx={8} fill={C.mint} stroke={INK} strokeWidth={4} />
    <rect x={-10} y={-120} width={24} height={34} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
  </g>
);
const Bucket: React.FC<{ x: number; y: number; c: string; s?: number; rot?: number; label?: string }> = ({ x, y, c, s = 1, rot = 0, label }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-60 -60 L 60 -60 L 48 60 L -48 60 Z" fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-56 -40 L 56 -40 L 50 20 L -50 20 Z" fill={c} />
    <ellipse cy={-60} rx={60} ry={14} fill={c} stroke={INK} strokeWidth={6} />
    <path d="M-60 -60 Q 0 -150 60 -60" stroke={INK} strokeWidth={6} fill="none" />
    {label && <Txt x={0} y={100} size={40} fill={c}>{label}</Txt>}
  </g>
);
const Duck: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={60} ry={36} fill={C.sun} stroke={INK} strokeWidth={6} />
    <circle cx={34} cy={-30} r={30} fill={C.sun} stroke={INK} strokeWidth={6} />
    <path d="M58 -30 l 26 6 l -26 8 z" fill="#FF8A3D" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={42} cy={-38} r={5} fill={INK} />
  </g>
);
const Rock: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 20 C -70 -20 -30 -50 0 -46 C 40 -50 70 -20 62 16 C 56 44 -50 46 -60 20 Z" fill="#9AA3B2" stroke={INK} strokeWidth={6} />
    <ellipse cx={-14} cy={-18} rx={18} ry={8} fill="#fff" opacity={0.35} />
  </g>
);
const Apple: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -30 C 30 -50 60 -30 56 4 C 52 40 26 56 0 46 C -26 56 -52 40 -56 4 C -60 -30 -30 -50 0 -30 Z" fill={C.tomato} stroke={INK} strokeWidth={6} />
    <path d="M0 -30 L 4 -54" stroke="#6B3E1F" strokeWidth={6} strokeLinecap="round" />
    <path d="M6 -48 C 20 -64 38 -58 36 -48 C 24 -44 14 -44 6 -48 Z" fill={C.mint} stroke={INK} strokeWidth={4} />
    <ellipse cx={-22} cy={-12} rx={12} ry={7} fill="#fff" opacity={0.5} />
  </g>
);
const Stove: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={0} width={300} height={300} rx={18} fill="#E9EEF5" stroke={INK} strokeWidth={7} />
    <rect x={-110} y={60} width={220} height={150} rx={14} fill="#2E2850" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-14} width={300} height={22} rx={8} fill="#C9D2DE" stroke={INK} strokeWidth={6} />
    <path d="M-90 -14 Q -60 -40 -30 -14" stroke="#FF6B3D" strokeWidth={10} fill="none" />
    <rect x={-100} y={-110} width={150} height={96} rx={18} fill="#5B6B85" stroke={INK} strokeWidth={6} />
    <rect x={44} y={-92} width={60} height={16} rx={8} fill="#5B6B85" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${-70 + i * 40} -120 q -14 -${30} 0 -${60} q 14 -30 0 -60`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(t * 4 + i)} transform={`translate(0 ${-((t * 30 + i * 20) % 30)})`} />)}
  </g>
);
const Knife: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M0 -10 L 120 -14 Q 140 -4 120 10 L 0 10 Z" fill="#D5DDE8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-70} y={-14} width={74} height={28} rx={10} fill="#6B3E1F" stroke={INK} strokeWidth={5} />
  </g>
);
const Cleaner: React.FC<{ x: number; y: number; c: string; s?: number }> = ({ x, y, c, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-34} y={-70} width={68} height={110} rx={16} fill={c} stroke={INK} strokeWidth={6} />
    <rect x={-14} y={-104} width={28} height={36} rx={6} fill="#fff" stroke={INK} strokeWidth={5} />
    <path d="M0 -50 L 22 -10 L -22 -10 Z" fill={C.sun} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <Txt x={0} y={-24} size={26} fill={INK} sw={0}>!</Txt>
  </g>
);

/* ícones do gancho final */
export const Teaser: React.FC<{ kind: string; t: number }> = ({ kind, t }) => {
  if (kind === 'paint') return <g><Bucket x={-40} y={10} c={C.bo} s={0.55} rot={-10} /><Bucket x={40} y={10} c={C.sun} s={0.55} rot={10} /></g>;
  if (kind === 'water') return <g><rect x={-60} y={-40} width={120} height={90} rx={12} fill="#BFE6FF" stroke={INK} strokeWidth={6} /><Duck x={0} y={-30} s={0.45} /></g>;
  if (kind === 'germ') return <Germ x={0} y={0} t={t} s={1.6} />;
  if (kind === 'find') return <g><circle cx={-10} cy={-10} r={40} fill="#E8F6FF" stroke={INK} strokeWidth={10} /><path d="M18 18 L 52 52" stroke={INK} strokeWidth={16} strokeLinecap="round" /></g>;
  if (kind === 'door') return <g transform="scale(0.22) translate(0 270)"><Door x={0} y={0} /></g>;
  if (kind === 'moon') return <path d="M20 -50 A 56 56 0 1 0 50 30 A 44 44 0 1 1 20 -50 Z" fill={C.sun} stroke={INK} strokeWidth={7} />;
  if (kind === 'gift') return <g><rect x={-50} y={-30} width={100} height={80} rx={10} fill={C.tomato} stroke={INK} strokeWidth={6} /><rect x={-58} y={-50} width={116} height={28} rx={8} fill={C.tomato} stroke={INK} strokeWidth={6} /><rect x={-8} y={-50} width={16} height={100} fill={C.sun} /></g>;
  return <Scissors s={0.9} rot={-30} />;
};

/* ================= peças comuns ================= */
type Ctx = { t: number; f: number; fps: number; at: (k: string, d?: number) => number; blink: (o?: number) => number; mouthOf: (w: string) => number };
const useEp = (dados: Dados) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const B = dados.beats;
  const at = (k: string, d = 0) => B[k].t0 + d;
  const q = Math.min(f, dados.boca.length - 1);
  const mouthOf = (who: string) => (dados.quem[q] === who ? dados.boca[q] : 0);
  const blink = (o = 0) => (((t + o) % 3.3) > 2.0 && ((t + o) % 3.3) < 2.12 ? 0.1 : 1);
  return { f, fps, t, B, at, mouthOf, blink };
};
const capsOf = (B: Record<string, Beat>, t: number, skip: string[]) =>
  Object.entries(B).find(([k, b]) => !skip.includes(k) && t >= b.t0 - 0.05 && t <= b.t1 + 0.3)?.[1];

const Kiwi3: React.FC<Ctx & { from: number; sign: React.ReactNode; wall?: [string, string]; ruleKey?: string; gotKey?: string }> = ({ t, f, fps, at, blink, mouthOf, from, sign, wall = ['#C9F0DF', '#ECFBF4'], ruleKey = 'rule', gotKey = 'got' }) => {
  const k = eio((t - from) / 0.7);
  const got = t > at(gotKey) - 0.05;
  const z = got ? lerp(1.15, 1.0, eio((t - at(gotKey)) / 0.5)) : lerp(1.28, 1.15, k);
  const km = mouthOf('k');
  const hasRule = (() => { try { at(ruleKey); return true; } catch { return false; } })();
  return (
    <g>
      <g transform={cam(got ? 540 : 590, got ? 1010 : 1000, z)}>
        <RoomBG wall={wall[0]} wall2={wall[1]} />
        <CoachKiwi x={700} y={1290} s={1.2} t={t} flip mouth={km} viseme="smile" wing={0.2 + km * 0.5 * Math.abs(Math.sin(t * 4))}
          point={hasRule && t > at(ruleKey) && t < at(ruleKey, 1.4) ? 0.6 : 0} blink={blink(0.5)} happyEyes={got} brow={km > 0.3 ? 0.6 : 0.2} headTilt={-4} />
        <BoBunny x={300} y={1300} s={1.1} t={t} mouth={mouthOf('b')} viseme={got ? 'grin' : 'smile'} look={[1, -0.5]} blink={blink(1.2)}
          armR={got ? 0.95 + 0.1 * Math.sin(t * 12) : 0.08} armL={0.05} headTilt={got ? 0 : Math.sin(t * 3) * 4} happyEyes={t > at(gotKey, 0.7)} bounce={got ? Math.max(0, Math.sin(t * 8)) : 0} />
      </g>
      <g transform={`translate(${CX} 420) scale(${sp(f, fps, from + 0.15, 9)})`}>
        <rect x={-380} y={-125} width={760} height={250} rx={46} fill={C.white} stroke={INK} strokeWidth={10} />
        {sign}
      </g>
      {got && (
        <g transform={`translate(800 650) scale(${sp(f, fps, at(gotKey), 7)}) rotate(${(1 - sp(f, fps, at(gotKey), 7)) * 120})`}>
          <path d="M0 -84 L 24 -28 L 84 -24 L 38 15 L 52 75 L 0 43 L -52 75 L -38 15 L -84 -24 L -24 -28 Z" fill={C.sun} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <Txt x={0} y={10} size={38} fill={INK} sw={0}>+1</Txt>
        </g>
      )}
      {got && [0, 1, 2].map((i) => <Sparkle key={i} x={300 + i * 90} y={640 - i * 30} t={t - at(gotKey) - i * 0.12} s={1.3} />)}
    </g>
  );
};
const NextUp: React.FC<Ctx & { from: number; kind: string }> = ({ t, f, fps, blink, mouthOf, from, kind }) => {
  const z = lerp(1.25, 1.4, eio((t - from) / 2));
  const jump = Math.max(0, Math.sin(t * 7)) * 40;
  return (
    <g>
      <g transform={cam(520, 900, z)}>
        <RoomBG wall="#DCD2FF" wall2="#F3EEFF" />
        <BoBunny x={520} y={1260 - jump} s={1.2} t={t} mouth={mouthOf('b')} viseme="grin" look={[0, -0.3]} blink={blink()}
          armL={0.95 + 0.12 * Math.sin(t * 12)} armR={0.95 + 0.12 * Math.sin(t * 12 + 1)} bounce={jump / 40} />
      </g>
      <Txt x={CX} y={360} size={92} s={sp(f, fps, from, 9)}>NEXT UP...</Txt>
      <g transform={`translate(780 640) scale(${sp(f, fps, from + 0.4, 8)}) rotate(${Math.sin(t * 6) * 8})`}>
        <circle r={96} fill="#fff" stroke={INK} strokeWidth={9} />
        <Teaser kind={kind} t={t} />
        <Txt x={70} y={-80} size={70} fill={C.tomato}>?</Txt>
      </g>
    </g>
  );
};
const Flash: React.FC<{ t: number; at: number[] }> = ({ t, at }) => <>{at.map((x, i) => <rect key={i} width={1080} height={1920} fill={C.white} opacity={cl(1 - Math.abs(t - x) * 8) * 0.85} />)}</>;
const Shell: React.FC<{ id: string; semAudio?: boolean; children: React.ReactNode }> = ({ id, semAudio, children }) => (
  <AbsoluteFill style={{ background: '#BEE4FF' }}>
    <Fonts />
    {!semAudio && <Audio src={staticFile(`pp/${id}/audio.wav`)} />}
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs><filter id="grey"><feColorMatrix type="saturate" values="0.25" /></filter></defs>
      {children}
    </svg>
  </AbsoluteFill>
);
const Countdown: React.FC<{ f: number; fps: number; n: number; at: number; x?: number; y?: number }> = ({ f, fps, n, at, x = CX, y = 760 }) => (
  <g transform={`translate(${x} ${y}) scale(${sp(f, fps, at, 7)})`}>
    <circle r={100} fill={C.tomato} stroke={INK} strokeWidth={11} /><Txt x={0} y={8} size={130} sw={0}>{n}</Txt>
  </g>
);

/* ================= formato A/B ================= */
type PC = Ctx & { aT: number; res: number; ok: boolean };
type Kit = {
  right: 'A' | 'B'; labels: [string, string]; hookChip: React.ReactNode; qChip: React.ReactNode; wall?: [string, string];
  hook: (c: Ctx & { ta: number; reach: number; confused: boolean; pull: number }) => React.ReactNode;
  bad: (c: PC) => React.ReactNode; good: (c: PC) => React.ReactNode; sign: React.ReactNode; teaser: string;
};
const PX = [110, 525], PY = 440, PW = 385, PH = 660;
export const ABEp: React.FC<{ id: string; dados: Dados; semAudio?: boolean; kit: Kit }> = ({ id, dados, semAudio, kit }) => {
  const { f, fps, t, B, at, mouthOf, blink } = useEp(dados);
  const ctx = { t, f, fps, at, blink, mouthOf };
  const tSplit = at('what') - 0.12, tKiwi = at('why') - 0.2, tNext = at('next') - 0.12;
  const ph = t < tSplit ? 1 : t < tKiwi ? 2 : t < tNext ? 3 : 4;
  const ans = at('ans'), done = t > ans - 0.05;
  const tStop = at('stop'), tq = at('q');
  const frozen = t >= tStop - 0.02 && t < tq - 0.05;
  const ta = frozen ? tStop : t;
  const shake = t > tStop && t < tStop + 0.3 ? Math.sin(t * 90) * 12 * (1 - (t - tStop) / 0.3) : 0;
  const reach = ta < tStop ? ease(ta / 0.6) : 1 - ease((t - tq) / 0.5);
  const pull = eio((t - tq) / 1.1);
  const z = lerp(1.7, 1.0, pull) * (frozen ? 1 + 0.05 * ease((t - tStop) / 0.25) : 1);
  const goodI = kit.right === 'A' ? 0 : 1;
  const wall = kit.wall || ['#BEE4FF', '#E8F6FF'];
  return (
    <Shell id={id} semAudio={semAudio}>
      {ph === 1 && (
        <g>
          <g transform={cam(lerp(420, 560, pull), lerp(1045, 1065, pull), z, shake)} filter={frozen ? 'url(#grey)' : undefined}>
            {kit.hook({ ...ctx, ta, reach, confused: t > tq + 0.2, pull })}
          </g>
          {t < tStop && <Chip y={340} s={sp(f, fps, -0.2, 12)} w={640}>{kit.hookChip}</Chip>}
          {frozen && (
            <g transform={`translate(${CX} 560) scale(${sp(f, fps, tStop, 6)}) rotate(-6)`}>
              <Txt x={0} y={0} size={250} fill={C.tomato} sw={34}>STOP!</Txt>
              <Txt x={0} y={170} size={60}>wait a second...</Txt>
            </g>
          )}
          {t >= tq - 0.05 && <Chip y={350} s={sp(f, fps, tq - 0.05, 10)} w={860}>{kit.qChip}</Chip>}
          {t >= tq + 0.3 && <g transform={`translate(330 ${640 + Math.sin(t * 5) * 10}) scale(${sp(f, fps, tq + 0.4, 8)})`}><circle r={58} fill={C.white} stroke={INK} strokeWidth={8} /><Txt x={0} y={6} size={84} fill={C.tomato} sw={0}>?</Txt></g>}
        </g>
      )}
      {ph === 2 && (() => {
        const tap = t > at('tap') - 0.1 && !done;
        const hi = tap ? Math.floor(t * 3) % 2 : -1;
        const cnt = ['c3', 'c2', 'c1'].findIndex((k, i, arr) => t >= at(k) - 0.05 && (i === 2 ? t < ans - 0.05 : t < at(arr[i + 1]) - 0.05));
        const ks = [sp(f, fps, at('what') + 0.05, 13), sp(f, fps, at('what') + 0.2, 13)];
        const res = done ? cl((t - ans) * 2) : 0;
        return (
          <g>
            <rect width={1080} height={1920} fill={C.cream} />
            {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={(i * 211) % 1080} cy={(i * 383) % 1920} r={40 + (i % 3) * 22} fill={[C.sky, '#FFE3A3', '#D9F7EC'][i % 3]} opacity={0.7} />)}
            {[0, 1].map((i) => hi === i && <rect key={i} x={PX[i] - 14} y={PY - 14} width={PW + 28} height={PH + 28} rx={50} fill={C.sun} />)}
            {done && <rect x={PX[goodI] - 16} y={PY - 16} width={PW + 32} height={PH + 32} rx={52} fill={C.sun} opacity={0.7 + 0.3 * Math.sin(t * 10)} />}
            <defs>{[0, 1].map((i) => <clipPath key={i} id={`pc${i}`}><rect x={PX[i]} y={PY} width={PW} height={PH} rx={40} /></clipPath>)}</defs>
            {[0, 1].map((i) => {
              const ok = i === goodI;
              const aT = t - at(i ? 'b' : 'a');
              const c: PC = { ...ctx, aT, res, ok };
              return (
                <g key={i} transform={`translate(${(1 - ks[i]) * (i ? 900 : -900)} 0)`}>
                  <g clipPath={`url(#pc${i})`}>
                    <svg x={PX[i]} y={PY} width={PW} height={PH} viewBox="110 540 660 1131" preserveAspectRatio="xMidYMid slice">
                      <g filter={!ok && res > 0 ? 'url(#grey)' : undefined}>{ok ? kit.good(c) : kit.bad(c)}</g>
                    </svg>
                  </g>
                  <rect x={PX[i]} y={PY} width={PW} height={PH} rx={40} fill="none" stroke={INK} strokeWidth={9} />
                </g>
              );
            })}
            <Chip y={350} s={sp(f, fps, at('what') - 0.1, 10)} w={800} fill={C.sun}><Txt x={0} y={4} size={64}>What should Bo do?</Txt></Chip>
            {[0, 1].map((i) => t > at(i ? 'b' : 'a') - 0.1 && (
              <g key={i} transform={`translate(${PX[i] + PW / 2} ${PY + PH - 70}) scale(${sp(f, fps, at(i ? 'b' : 'a') - 0.1, 9)})`}>
                <rect x={-175} y={-38} width={350} height={76} rx={38} fill={C.white} stroke={INK} strokeWidth={7} />
                <circle cx={-133} cy={0} r={30} fill={i ? C.bo : C.grape} stroke={INK} strokeWidth={5} />
                <Txt x={-133} y={3} size={38} sw={0}>{i ? 'B' : 'A'}</Txt>
                <Txt x={26} y={3} size={kit.labels[i].length > 12 ? 31 : 37} fill={INK} sw={0}>{kit.labels[i]}</Txt>
              </g>
            ))}
            {cnt >= 0 && <Countdown f={f} fps={fps} n={3 - cnt} at={at(['c3', 'c2', 'c1'][cnt])} />}
            {done && t < ans + 1.2 && (
              <g transform={`translate(${CX} 760) scale(${sp(f, fps, ans, 6)})`}>
                <circle r={110} fill={C.mint} stroke={INK} strokeWidth={11} /><Txt x={0} y={8} size={120} sw={0}>{kit.right}!</Txt>
              </g>
            )}
            {done && <Stamp t={t - ans} x={PX[1 - goodI] + PW - 70} y={PY + 70} />}
            {done && <Stamp t={t - ans} ok x={PX[goodI] + PW - 70} y={PY + 70} />}
            {done && <Confetti t={t - ans} x={PX[goodI] + PW / 2} y={PY + 200} />}
          </g>
        );
      })()}
      {ph === 3 && <Kiwi3 {...ctx} from={tKiwi} sign={kit.sign} />}
      {ph === 4 && <NextUp {...ctx} from={tNext} kind={kit.teaser} />}
      <Captions b={capsOf(B, t, ['c3', 'c2', 'c1', 'stop'])} t={t} />
      <Flash t={t} at={[tSplit, tKiwi, tNext]} />
    </Shell>
  );
};

/* ---------- kits A/B ---------- */
const run = (t: number, from: number, to: number, x0: number, x1: number) => lerp(x0, x1, cl((t - from) / (to - from)));

export const KITS: Record<string, Kit> = {
  ep002: {
    right: 'A', labels: ['Walk slowly', 'Run faster'], teaser: 'paint',
    hookChip: <><Scissors x={-200} s={1.1} rot={-30} /><Txt x={40} y={4} size={64} fill={C.tomato}>Wheee!</Txt></>,
    qChip: <><Scissors x={-330} s={0.9} rot={-30} /><Txt x={60} y={4} size={58} fill={C.tomato}>Running with scissors?</Txt></>,
    hook: ({ t, ta, mouthOf, blink, reach, confused }) => (
      <g>
        <RoomBG wall="#FFE2C6" wall2="#FFF4E8" />
        <Table x={790} y={1060} w={360} />
        <rect x={700} y={1010} width={160} height={50} rx={6} fill="#fff" stroke={INK} strokeWidth={5} transform="rotate(-6 780 1035)" />
        <BoBunny x={confused ? 420 : run(ta, 0, 1.1, 250, 420)} y={1255} s={1.25} t={ta} walk={!confused && ta < 1.1 ? ta * 3 : 0} mouth={mouthOf('b')} viseme={confused ? 'frown' : 'grin'}
          look={confused ? [1, 0.2] : [1, 0]} blink={blink()} armR={confused ? 0.3 : 0.85} armL={confused ? 0.05 : 0.6} headTilt={confused ? -8 : 8 * reach} brow={confused ? 0.6 : 0.2}
          holdR={<Scissors x={0} y={-10} s={1.2} rot={confused ? 90 : -80} />} />
        {!confused && [0, 1, 2].map((i) => <path key={i} d={`M${run(ta, 0, 1.1, 250, 420) - 160 - i * 30} ${900 + i * 50} h -60`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.8} />)}
      </g>
    ),
    bad: ({ t, aT, res, blink }) => (
      <g>
        <RoomBG wall="#FFE2C6" wall2="#FFF4E8" />
        <BoBunny x={res > 0 ? 470 : run(aT, 0.2, 1.4, 250, 470)} y={1255} s={1.1} t={t} walk={aT > 0.2 && res === 0 ? aT * 3.4 : 0} viseme={res > 0 ? 'frown' : 'grin'}
          headTilt={res > 0 ? 18 : 6} blink={blink(0.4)} look={[1, 0]} armR={0.85} armL={0.6} happyEyes={false} holdR={<Scissors s={1.1} rot={-80} />} />
        {res > 0 && [0, 1, 2].map((i) => <path key={i} transform={`translate(${470 + Math.cos(t * 5 + i * 2.1) * 110} ${770 + Math.sin(t * 5 + i * 2.1) * 26}) scale(0.9)`} d="M0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={C.sun} stroke={INK} strokeWidth={4} />)}
        {res > 0 && <Txt x={470} y={680} size={60} fill={C.tomato}>OUCH!</Txt>}
      </g>
    ),
    good: ({ t, aT, res, blink }) => (
      <g>
        <RoomBG wall="#FFE2C6" wall2="#FFF4E8" />
        <BoBunny x={run(aT, 0.2, 2.2, 260, 440)} y={1255 - (res > 0 ? Math.max(0, Math.sin(t * 9)) * 30 : 0)} s={1.1} t={t} walk={aT > 0.2 && aT < 2.2 ? aT * 1.4 : 0} viseme={res > 0 ? 'grin' : 'smile'}
          blink={blink(1.1)} look={[0.6, 0.3]} armR={0.12} happyEyes={res > 0} holdR={<Scissors s={1.1} rot={90} />} />
      </g>
    ),
    sign: <g><Scissors x={-230} y={0} s={1.6} rot={90} /><Txt x={60} y={-30} size={64} fill={C.mint}>WALK</Txt><Txt x={60} y={45} size={44} fill={INK} sw={0}>points down</Txt></g>,
  },
  ep005: {
    right: 'B', labels: ['Eat right now', 'Wash hands'], teaser: 'find',
    hookChip: <><Cookie x={-200} y={0} s={1.2} /><Txt x={40} y={4} size={64} fill="#C6782F">Snack!</Txt></>,
    qChip: <><Germ x={-340} y={0} t={0} s={1.2} /><Txt x={50} y={4} size={58} fill={C.tomato}>Super dirty hands!</Txt></>,
    hook: ({ t, ta, mouthOf, blink, reach, confused }) => (
      <g>
        <RoomBG />
        <Table x={760} y={1060} w={380} />
        <Cookie x={760} y={1020} s={1.3} /><Cookie x={830} y={1032} s={1.1} />
        <BoBunny x={420} y={1255} s={1.25} t={ta} mouth={mouthOf('b')} viseme={confused ? 'wow' : 'grin'} look={confused ? [0.6, 0.6] : [1, 0]} blink={blink()} hands="#8A5A33"
          armR={confused ? 0.55 : lerp(0.2, 0.75, reach)} armL={confused ? 0.55 : 0.05} headTilt={confused ? -6 : 0} brow={confused ? 0.7 : 0.2} />
        {Array.from({ length: 5 }).map((_, i) => <Germ key={i} x={430 + Math.cos(i * 1.3) * 150} y={1060 + Math.sin(i * 1.9) * 50} t={t} s={confused ? 1.1 : 0.8} />)}
      </g>
    ),
    bad: ({ t, aT, res, blink }) => {
      const eat = cl((aT - 0.2) / 0.5);
      return (
        <g>
          <RoomBG />
          <Table x={700} y={1060} w={340} />
          <BoBunny x={400} y={1255} s={1.1} t={t} hands="#8A5A33" mouth={res > 0 ? 0 : aT > 0.7 ? Math.abs(Math.sin(aT * 13)) * 0.7 : 0} viseme={res > 0 ? 'sick' : 'grin'} sick={res}
            armR={lerp(0.1, 1.05, eat)} blink={blink(0.4)} look={[0.4, -0.3]} headTilt={res * 10} holdR={eat < 0.95 ? <Cookie x={0} y={-10} s={0.9} /> : null} />
          {Array.from({ length: 4 }).map((_, i) => <Germ key={i} x={400 + Math.cos(t * 2 + i * 1.6) * (res > 0 ? 150 : 120)} y={900 + Math.sin(t * 2 + i) * 60} t={t} s={0.9} />)}
        </g>
      );
    },
    good: ({ t, aT, res, blink }) => {
      const wash = aT > 0.3;
      const clean = cl((aT - 0.8) / 1.0);
      return (
        <g>
          <RoomBG wall="#CDEBFF" />
          <Sink x={560} y={960} t={t} on={wash ? 1 : 0} />
          <BoBunny x={380} y={1255} s={1.1} t={t} hands={clean > 0.5 ? undefined : '#8A5A33'} viseme={res > 0 ? 'grin' : 'smile'} happyEyes={res > 0}
            armR={wash ? 0.45 + Math.sin(t * 16) * 0.08 : 0.1} armL={wash ? 0.35 + Math.cos(t * 16) * 0.08 : 0.05} blink={blink(1.1)} look={[1, 0.4]} />
          {clean < 0.5 && Array.from({ length: 3 }).map((_, i) => <Germ key={i} x={430 + i * 40} y={930 - clean * 400 - i * 20} t={t} s={0.7} />)}
          {res > 0 && [0, 1, 2].map((i) => <Sparkle key={i} x={300 + i * 110} y={820 - i * 30} t={((t * 1.2 + i * 0.3) % 1)} s={1.2} />)}
        </g>
      );
    },
    sign: <g><Germ x={-250} y={0} t={0} s={2} /><Txt x={-90} y={6} size={120} fill={C.tomato} sw={18}>→</Txt><g transform="translate(160 0)"><rect x={-80} y={-40} width={130} height={80} rx={24} fill={C.pink} stroke={INK} strokeWidth={7} /><circle cx={90} cy={-20} r={26} fill="#fff" stroke="#9FD8FF" strokeWidth={5} /><circle cx={120} cy={30} r={18} fill="#fff" stroke="#9FD8FF" strokeWidth={5} /></g></g>,
  },
  ep007: {
    right: 'A', labels: ['Get a grown-up', 'Open the door'], teaser: 'moon',
    hookChip: <><Txt x={-170} y={4} size={64} fill={C.grape}>Knock</Txt><Txt x={110} y={4} size={64} fill={C.grape}>knock?</Txt></>,
    qChip: <><Txt x={0} y={4} size={52} fill={C.tomato}>Someone Bo doesn't know!</Txt></>,
    hook: ({ t, ta, mouthOf, blink, reach, confused }) => (
      <g>
        <RoomBG wall="#FFE9C9" wall2="#FFF6E8" />
        <Door x={800} y={1250} />
        <BoBunny x={run(ta, 0, 1.0, 300, 520)} y={1255} s={1.25} t={ta} walk={ta < 1 && !confused ? ta * 3 : 0} mouth={mouthOf('b')} viseme={confused ? 'wow' : 'grin'} look={[1, -0.2]}
          blink={blink()} armR={confused ? 0.3 : lerp(0.2, 0.8, reach)} headTilt={confused ? -6 : 4} brow={confused ? 0.7 : 0.3} />
        {[0, 1].map((i) => <Txt key={i} x={880 + i * 50} y={720 + i * 40} size={44} fill={C.grape} o={cl(Math.sin(t * 6 + i))}>knock!</Txt>)}
      </g>
    ),
    bad: ({ t, aT, res, blink }) => (
      <g>
        <RoomBG wall="#FFE9C9" wall2="#FFF6E8" />
        <Door x={640} y={1250} open={cl((aT - 0.6) / 0.6)} />
        <BoBunny x={360} y={1255} s={1.1} t={t} viseme={aT > 1.0 ? 'wow' : 'smile'} armR={lerp(0.2, 0.8, cl(aT / 0.6))} blink={blink(0.4)} look={[1, -0.3]} brow={aT > 1 ? 0.8 : 0.2} headTilt={res * 6} />
        {aT > 1.1 && <Txt x={640} y={560} size={70} fill="#fff">?</Txt>}
      </g>
    ),
    good: ({ t, aT, res, blink }) => (
      <g>
        <RoomBG wall="#C9F0DF" wall2="#ECFBF4" />
        <CoachKiwi x={640} y={1290} s={1.0} t={t} flip wing={res > 0 ? 0.8 + 0.2 * Math.sin(t * 12) : aT > 1.4 ? 0.3 : 0} blink={blink(0.9)} happyEyes={res > 0} viseme="smile" />
        <BoBunny x={run(aT, 0.2, 1.4, 180, 400)} y={1290 - (res > 0 ? Math.max(0, Math.sin(t * 9)) * 30 : 0)} s={1.0} t={t} walk={aT > 0.2 && aT < 1.4 ? aT * 3 : 0} look={[1, 0]} blink={blink(1.3)}
          armR={0.6} viseme={res > 0 ? 'grin' : 'smile'} happyEyes={res > 0} />
      </g>
    ),
    sign: <g><g transform="translate(-230 90) scale(0.32)"><Door x={0} y={0} /></g><Txt x={20} y={6} size={110} fill={C.tomato} sw={16}>→</Txt><g transform="translate(220 80) scale(0.32)"><CoachKiwi x={0} y={0} t={0} viseme="smile" /></g></g>,
  },
  ep008: {
    right: 'B', labels: ['Go to bed', 'Brush teeth'], teaser: 'gift', wall: ['#4B4FA6', '#6E73C8'],
    hookChip: <><Txt x={0} y={4} size={64} fill={C.grape}>Yawn... bedtime!</Txt></>,
    qChip: <><CandyIcon x={-330} y={0} s={0.8} /><Txt x={50} y={4} size={54} fill={C.tomato}>Candy... and no brushing?</Txt></>,
    hook: ({ t, ta, mouthOf, blink, confused }) => (
      <g>
        <RoomBG wall="#4B4FA6" wall2="#6E73C8" />
        <Bed x={760} y={1250} />
        {[0, 1, 2].map((i) => <CandyIcon key={i} x={300 + i * 120} y={1300 + (i % 2) * 20} s={0.7} c={[C.pink, C.sun, C.mint][i]} />)}
        <BoBunny x={420} y={1255} s={1.25} t={ta} suit="#9B7BE8" mouth={mouthOf('b') || (ta < 1 ? 0 : 0)} viseme={confused ? 'frown' : 'o'} look={[0.8, 0]} blink={confused ? 1 : 0.5}
          armL={confused ? 0.05 : 0.9} armR={0.1} headTilt={confused ? -8 : -10} brow={confused ? 0.6 : 0.1} />
      </g>
    ),
    bad: ({ t, aT, res, blink }) => (
      <g>
        <RoomBG wall="#4B4FA6" wall2="#6E73C8" />
        <Bed x={480} y={1250} />
        <g transform={`translate(${aT > 0.6 ? 0 : 0} 0)`}>
          {aT > 0.6 && <g><ellipse cx={330} cy={1050} rx={70} ry={58} fill="#FFF3E2" stroke="#5B3A55" strokeWidth={7} /><path d="M300 1050 q 10 -8 20 0 M340 1050 q 10 -8 20 0" stroke="#5B3A55" strokeWidth={6} fill="none" /><Txt x={430} y={930} size={56} fill="#fff">z z z</Txt></g>}
          {aT <= 0.6 && <BoBunny x={300} y={1255} s={1.0} t={t} suit="#9B7BE8" viseme="o" blink={0.4} armL={0.8} />}
        </g>
        {aT > 1.0 && <g><Tooth x={600} y={800} s={1.2} happy={false} dirty={1} />{[0, 1, 2].map((i) => <Germ key={i} x={600 + Math.cos(t * 3 + i * 2.1) * 110} y={800 + Math.sin(t * 3 + i * 2.1) * 80} t={t} s={0.8} c="#B07BFF" />)}</g>}
      </g>
    ),
    good: ({ t, aT, res, blink }) => {
      const brushing = aT > 0.3;
      return (
        <g>
          <RoomBG wall="#BFE4FF" wall2="#E8F6FF" />
          <rect x={420} y={760} width={260} height={300} rx={26} fill="#DDF4FF" stroke={INK} strokeWidth={7} />
          <BoBunny x={420} y={1255} s={1.1} t={t} suit="#9B7BE8" viseme={res > 0 ? 'grin' : 'smile'} happyEyes={res > 0 || brushing} blink={blink(1.2)} look={[0.5, 0]}
            armR={brushing ? 0.78 + Math.sin(t * 18) * 0.06 : 0.1} holdR={brushing ? <Toothbrush s={0.8} rot={-100} /> : null} />
          {brushing && Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={470 + ((i * 37) % 90)} cy={870 - ((t * 60 + i * 30) % 120)} r={12 + (i % 3) * 6} fill="#fff" stroke="#9FD8FF" strokeWidth={3} />)}
          {res > 0 && <g><Tooth x={630} y={760} s={1.0} happy />{[0, 1].map((i) => <Sparkle key={i} x={580 + i * 100} y={690 + i * 30} t={((t * 1.3 + i * 0.4) % 1)} s={1.2} />)}</g>}
        </g>
      );
    },
    sign: <g><Toothbrush x={-240} y={60} s={1.3} rot={-30} /><Txt x={-90} y={6} size={110} fill={C.mint} sw={16}>+</Txt><Tooth x={120} y={10} s={1.4} happy /><Txt x={270} y={6} size={64} fill={C.sun}>✓</Txt></g>,
  },
};

/* ================= formato: que cor vai dar? ================= */
export const ColorEp: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = ({ id, dados, semAudio }) => {
  const { f, fps, t, B, at, mouthOf, blink } = useEp(dados);
  const ctx = { t, f, fps, at, blink, mouthOf };
  const tKiwi = at('why') - 0.2, tNext = at('next') - 0.12;
  const round2 = t > at('r2') - 0.1;
  const [c1, c2, res, label] = round2 ? [C.tomato, C.sun, '#FF9433', 'ORANGE'] : [C.bo, C.sun, '#3FBF5A', 'GREEN'];
  const aK = round2 ? 'ans2' : 'ans';
  const pour = cl((t - (at(aK) - 0.45)) / 0.5);
  const filled = t > at(aK) - 0.05;
  const opts = [['#3FBF5A', 'Green'], ['#9B5CF0', 'Purple'], ['#FF9433', 'Orange']];
  const cnt = !round2 ? ['c3', 'c2', 'c1'].findIndex((k, i, arr) => t >= at(k) - 0.05 && (i === 2 ? t < at('ans') - 0.05 : t < at(arr[i + 1]) - 0.05)) : -1;
  const cnt2 = round2 && t >= at('cnt2') && t < at('ans2') - 0.05 ? Math.min(2, Math.floor((t - at('cnt2')) / 0.45)) : -1;
  const ph = t < tKiwi ? 1 : t < tNext ? 3 : 4;
  return (
    <Shell id={id} semAudio={semAudio}>
      {ph === 1 && (
        <g>
          <g transform={cam(540, 1000, lerp(1.15, 1.0, eio(t / 1.2)))}>
            <RoomBG wall="#FFE2EF" wall2="#FFF4F9" />
            <BoBunny x={205} y={1280} s={0.95} t={t} mouth={mouthOf('b')} viseme={filled ? 'wow' : 'smile'} look={[1, -0.6]} blink={blink()} armR={filled ? 0.9 : 0.2} armL={filled ? 0.9 : 0.05} bounce={filled ? 1 : 0} />
          </g>
          {/* quadro */}
          <g transform={`translate(625 720) scale(0.74)`}>
            <rect x={-390} y={-330} width={780} height={640} rx={50} fill="#fff" stroke={INK} strokeWidth={10} />
            <Bucket x={-200} y={-140} c={c1} s={1.0} rot={-pour * 70} />
            <Txt x={0} y={-150} size={90} fill={INK} sw={0}>+</Txt>
            <Bucket x={200} y={-140} c={c2} s={1.0} rot={pour * 70} />
            {pour > 0 && pour < 1 && <><path d={`M-150 -150 Q -60 -40 -20 30`} stroke={c1} strokeWidth={24} fill="none" strokeLinecap="round" /><path d={`M150 -150 Q 60 -40 20 30`} stroke={c2} strokeWidth={24} fill="none" strokeLinecap="round" /></>}
            <path d="M-140 30 Q -140 170 0 170 Q 140 170 140 30 Z" fill={filled ? res : '#EEF2F7'} stroke={INK} strokeWidth={9} />
            <ellipse cy={30} rx={140} ry={26} fill={filled ? res : '#DDE4EE'} stroke={INK} strokeWidth={8} />
            {!filled && <Txt x={0} y={100} size={90} fill={C.tomato} sw={0}>?</Txt>}
            {filled && <Txt x={0} y={240} size={80} fill={res} s={sp(f, fps, at(aK), 7)}>{label}!</Txt>}
            {filled && [0, 1, 2].map((i) => <Sparkle key={i} x={-120 + i * 120} y={-10 - i * 20} t={t - at(aK) - i * 0.1} s={1.4} />)}
          </g>
          <Chip y={340} s={sp(f, fps, at('q') - 0.1, 10)} w={860} fill={C.sun}><Txt x={0} y={4} size={58}>What color will it make?</Txt></Chip>
          {/* opções da rodada 1 */}
          {!round2 && t > at('opts') - 0.1 && opts.map(([c, n], i) => {
            const k = sp(f, fps, at('opts') + i * 0.55, 9);
            const isR = filled && i === 0, isW = filled && i !== 0;
            return (
              <g key={i} transform={`translate(${455 + i * 170} 1030) scale(${k * (isR ? 1.15 : 1) * 0.85})`} opacity={isW ? 0.4 : 1}>
                <circle r={56} fill={c} stroke={INK} strokeWidth={8} />
                {isR && <path d="M-24 2 L -6 20 L 28 -18" stroke="#fff" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              </g>
            );
          })}
          {cnt >= 0 && <Countdown f={f} fps={fps} n={3 - cnt} at={at(['c3', 'c2', 'c1'][cnt])} x={830} y={560} />}
          {cnt2 >= 0 && <Countdown f={f} fps={fps} n={3 - cnt2} at={at('cnt2') + cnt2 * 0.45} x={830} y={560} />}
          {filled && <Confetti t={t - at(aK)} x={625} y={720} />}
        </g>
      )}
      {ph === 3 && <Kiwi3 {...ctx} from={tKiwi} ruleKey="why" sign={<g>{[C.bo, C.sun, '#3FBF5A'].map((c, i) => <g key={i}><circle cx={-240 + i * 240} cy={0} r={62} fill={c} stroke={INK} strokeWidth={8} />{i < 2 && <Txt x={-120 + i * 240} y={6} size={80} fill={INK} sw={0}>{i ? '=' : '+'}</Txt>}</g>)}</g>} />}
      {ph === 4 && <NextUp {...ctx} from={tNext} kind="water" />}
      <Captions b={capsOf(B, t, ['c3', 'c2', 'c1', 'cnt2'])} t={t} />
      <Flash t={t} at={[tKiwi, tNext]} />
    </Shell>
  );
};

/* ================= formato: afunda ou boia? ================= */
export const SinkEp: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = ({ id, dados, semAudio }) => {
  const { f, fps, t, B, at, mouthOf, blink } = useEp(dados);
  const ctx = { t, f, fps, at, blink, mouthOf };
  const tKiwi = at('why') - 0.2, tNext = at('next') - 0.12;
  const ph = t < tKiwi ? 1 : t < tNext ? 3 : 4;
  const items = [
    { k: '1', float: true, draw: (x: number, y: number) => <Duck x={x} y={y} s={0.9} /> },
    { k: '2', float: false, draw: (x: number, y: number) => <Rock x={x} y={y} s={0.9} /> },
    { k: '3', float: true, draw: (x: number, y: number) => <Apple x={x} y={y} s={0.9} /> },
  ];
  const waterY = 820, bottomY = 1020;
  const cur = items.reduce((a, it, i) => (t >= at('o' + it.k) - 0.1 ? i : a), -1);
  return (
    <Shell id={id} semAudio={semAudio}>
      {ph === 1 && (
        <g>
          <g transform={cam(540, 1000, lerp(1.2, 1.0, eio(t / 1.2)))}>
            <RoomBG wall="#CDEBFF" wall2="#EEF8FF" />
            <BoBunny x={190} y={1310} s={0.95} t={t} mouth={mouthOf('b')} viseme="smile" look={[1, -0.4]} blink={blink()} armR={0.3 + Math.max(0, Math.sin(t * 3)) * 0.2} />
          </g>
          {/* aquário */}
          <g>
            <rect x={250} y={640} width={600} height={430} rx={30} fill="#EAF7FF" stroke={INK} strokeWidth={10} />
            <rect x={262} y={waterY + Math.sin(t * 3) * 4} width={576} height={1070 - waterY - 12 - Math.sin(t * 3) * 4} rx={20} fill="#7CCBFF" opacity={0.75} />
            <path d={`M262 ${waterY} ${Array.from({ length: 12 }).map((_, i) => `Q ${286 + i * 48} ${waterY - 10 + Math.sin(t * 4 + i) * 6} ${310 + i * 48} ${waterY}`).join(' ')}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.8} />
            {items.map((it, i) => {
              if (i > cur) return null;
              const o = at('o' + it.k), r = at('r' + it.k);
              const xs = 380 + i * 170;
              const drop = cl((t - (r - 0.3)) / 0.5);
              const y0 = 560;
              const yEnd = it.float ? waterY - 10 + Math.sin(t * 3 + i) * 8 : bottomY - 40;
              const y = t < r - 0.3 ? y0 + Math.sin(t * 5) * 8 : lerp(y0, yEnd, it.float ? ease(drop) : drop * drop);
              const k = sp(f, fps, o - 0.1, 8);
              return <g key={i} transform={`translate(${xs} ${y}) scale(${k})`}>{it.draw(0, 0)}</g>;
            })}
            {items.map((it, i) => {
              const r = at('r' + it.k);
              if (i !== cur || t < r - 0.05) return null;
              return <Txt key={i} x={550} y={590} size={110} fill={it.float ? C.mint : C.tomato} s={sp(f, fps, r - 0.05, 6)} rot={-4}>{it.float ? 'FLOAT!' : 'SINK!'}</Txt>;
            })}
          </g>
          <Chip y={340} s={sp(f, fps, at('q') - 0.1, 10)} w={720} fill={C.sun}><Txt x={-150} y={4} size={64}>SINK</Txt><Txt x={0} y={4} size={44} fill={INK} sw={0}>or</Txt><Txt x={160} y={4} size={64}>FLOAT?</Txt></Chip>
          {items.map((it) => {
            const k0 = at('k' + it.k);
            if (t < k0 || t >= at('r' + it.k) - 0.05) return null;
            const n = Math.min(2, Math.floor((t - k0) / 0.45));
            return <Countdown key={it.k} f={f} fps={fps} n={3 - n} at={k0 + n * 0.45} x={850} y={520} />;
          })}
          {t > at('r3') && <Confetti t={t - at('r3')} x={720} y={760} />}
        </g>
      )}
      {ph === 3 && <Kiwi3 {...ctx} from={tKiwi} ruleKey="why" gotKey="next" sign={<g><Apple x={-200} y={0} s={1.6} /><Txt x={60} y={-30} size={64} fill={C.mint}>FLOATS!</Txt><Txt x={60} y={45} size={40} fill={INK} sw={0}>air inside</Txt></g>} />}
      {ph === 4 && <NextUp {...ctx} from={tNext} kind="germ" />}
      <Captions b={capsOf(B, t, ['k1', 'k2', 'k3', 'r1', 'r2', 'r3'])} t={t} />
      <Flash t={t} at={[tKiwi, tNext]} />
    </Shell>
  );
};

/* ================= formato: ache os 3 perigos ================= */
export const FindEp: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = ({ id, dados, semAudio }) => {
  const { f, fps, t, B, at, mouthOf, blink } = useEp(dados);
  const ctx = { t, f, fps, at, blink, mouthOf };
  const tKiwi = at('why') - 0.2, tNext = at('next') - 0.12;
  const ph = t < tKiwi ? 1 : t < tNext ? 3 : 4;
  const tStop = at('stop');
  const frozen = t >= tStop - 0.02 && t < at('q') - 0.05;
  const ta = frozen ? tStop : t;
  const pull = eio((t - at('q')) / 1.0);
  const spots = [['f1', 280, 860, 'HOT!'], ['f2', 650, 905, 'SHARP!'], ['f3', 820, 1150, 'YUCK!']] as const;
  const goT = at('go');
  const timer = t > goT + 0.5 && t < at('f1') - 0.2 ? cl((t - goT - 0.5) / 2.5) : -1;
  return (
    <Shell id={id} semAudio={semAudio}>
      {ph === 1 && (
        <g>
          <g transform={cam(lerp(420, 540, pull), lerp(1040, 1010, pull), lerp(1.6, 1.0, pull))} filter={frozen ? 'url(#grey)' : undefined}>
            <RoomBG wall="#FFF1C9" wall2="#FFF9E6" />
            {/* bancada */}
            <rect x={140} y={950} width={900} height={40} rx={12} fill="#EBAA6C" stroke="#5B3A2A" strokeWidth={8} />
            <rect x={160} y={990} width={860} height={300} rx={10} fill="#F6D7A8" stroke="#5B3A2A" strokeWidth={7} />
            <Stove x={300} y={950 - 0} t={ta} />
            <Knife x={600} y={935} rot={-6} />
            {/* armário aberto com produtos de limpeza */}
            <rect x={700} y={1020} width={240} height={250} rx={10} fill="#FFF7E6" stroke="#5B3A2A" strokeWidth={7} />
            <Cleaner x={770} y={1240} c={C.grape} s={0.9} /><Cleaner x={860} y={1240} c={C.mint} s={0.9} />
            <path d="M700 1020 L 640 1050 L 640 1300 L 700 1270" fill="#E9B97E" stroke="#5B3A2A" strokeWidth={7} />
            {/* biscoitos */}
            <rect x={470} y={860} width={90} height={92} rx={22} fill="#D6F0FF" stroke={INK} strokeWidth={6} /><Cookie x={515} y={905} s={0.8} />
            <BoBunny x={lerp(560, 540, pull)} y={1310} s={0.82} t={ta} mouth={mouthOf('b')} viseme={t > at('q') ? 'wow' : 'grin'} look={[1, -0.6]} blink={blink()} armR={t < tStop ? 0.8 : 0.2} />
            {spots.map(([k, x, y, lb]) => t > at(k) - 0.05 && (
              <g key={k}>
                <circle cx={x} cy={y} r={lerp(30, 110, sp(f, fps, at(k) - 0.05, 8))} fill="none" stroke={C.tomato} strokeWidth={14} />
                <Txt x={x} y={y - 140} size={52} fill={C.tomato} s={sp(f, fps, at(k), 8)}>{lb}</Txt>
              </g>
            ))}
          </g>
          {t < tStop && <Chip y={340} s={sp(f, fps, -0.2, 12)} w={600}><Cookie x={-200} y={0} s={1.1} /><Txt x={40} y={4} size={64} fill="#C6782F">Cookies!</Txt></Chip>}
          {frozen && <g transform={`translate(${CX} 560) scale(${sp(f, fps, tStop, 6)}) rotate(-6)`}><Txt x={0} y={0} size={240} fill={C.tomato} sw={32}>WAIT!</Txt></g>}
          {t >= at('q') - 0.05 && <Chip y={340} s={sp(f, fps, at('q') - 0.05, 10)} w={820} fill={C.sun}><Txt x={0} y={4} size={58}>Find 3 dangers!</Txt></Chip>}
          {timer >= 0 && (
            <g transform="translate(510 470)">
              <rect x={-300} y={-22} width={600} height={44} rx={22} fill="#fff" stroke={INK} strokeWidth={7} />
              <rect x={-292} y={-14} width={584 * (1 - timer)} height={28} rx={14} fill={timer > 0.7 ? C.tomato : C.mint} />
            </g>
          )}
          {t > at('f3') && <Confetti t={t - at('f3')} x={CX} y={760} />}
        </g>
      )}
      {ph === 3 && <Kiwi3 {...ctx} from={tKiwi} ruleKey="why" sign={<g><g transform="translate(-230 -30) scale(0.45)"><Stove x={0} y={0} t={t} /></g><Knife x={-30} y={20} rot={-10} /><g transform="translate(250 30)"><Cleaner x={0} y={0} c={C.grape} /></g></g>} />}
      {ph === 4 && <NextUp {...ctx} from={tNext} kind="door" />}
      <Captions b={capsOf(B, t, ['stop'])} t={t} />
      <Flash t={t} at={[tKiwi, tNext]} />
    </Shell>
  );
};

export const KitEp: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = (p) => {
  if (p.id === 'ep003') return <ColorEp {...p} />;
  if (p.id === 'ep004') return <SinkEp {...p} />;
  if (p.id === 'ep006') return <FindEp {...p} />;
  return <ABEp {...p} kit={KITS[p.id]} />;
};
