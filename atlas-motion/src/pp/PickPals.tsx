import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

/* ---------- identidade Pick Pals ---------- */
export const C = {
  cream: '#FFF4DF', sky: '#BFE7FF', ink: '#2B2747', bo: '#3E9BFF', boLite: '#7CC0FF', kiwi: '#B07A45', kiwiLite: '#D7A671',
  mint: '#43D6A8', tomato: '#FF5B4E', sun: '#FFC83A', pink: '#FF8FB1', grape: '#8A63FF', white: '#FFFFFF', wood: '#E9A86A', woodDark: '#C47E44',
  sick: '#9BD36A',
};
const FONT = 'Fredoka';
export const Fonts: React.FC = () => (
  <style>{`
@font-face{font-family:Fredoka;font-weight:600;src:url(${staticFile('pp/Fredoka-600.ttf')})}
@font-face{font-family:Fredoka;font-weight:700;src:url(${staticFile('pp/Fredoka-700.ttf')})}`}</style>
);

type Beat = { t0: number; t1: number; txt: string; who: string };
type Dados = { dur: number; quadros: number; beats: Record<string, Beat> };

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (x: number) => Easing.bezier(0.33, 1, 0.68, 1)(cl(x));
const sp = (f: number, fps: number, at: number, damping = 11, mass = 0.7) =>
  spring({ frame: f - Math.round(at * fps), fps, config: { damping, mass, stiffness: 160 } });

/* ---------- personagens ---------- */
type Mood = 'smile' | 'open' | 'wow' | 'sick' | 'grin' | 'munch' | 'happy';
export const Bo: React.FC<{ x: number; y: number; s?: number; mood?: Mood; look?: [number, number]; blink?: number; arm?: number; sq?: number; sick?: number; rot?: number; hold?: React.ReactNode }> = ({
  x, y, s = 1, mood = 'smile', look = [0, 0], blink = 1, arm = 0, sq = 0, sick = 0, rot = 0, hold,
}) => {
  const body = sick > 0 ? mix(C.bo, C.sick, sick) : C.bo;
  const lite = sick > 0 ? mix(C.boLite, '#C9EFA0', sick) : C.boLite;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + sq * 0.08)} ${s * (1 - sq * 0.08)})`}>
      <ellipse cx={0} cy={128} rx={96} ry={16} fill="#000" opacity={0.12} />
      {/* pés */}
      <ellipse cx={-48} cy={112} rx={34} ry={20} fill={C.ink} />
      <ellipse cx={48} cy={112} rx={34} ry={20} fill={C.ink} />
      {/* braços */}
      <g transform={`translate(-112 20) rotate(${-25 - arm * 70})`}><rect x={-16} y={-8} width={32} height={66} rx={16} fill={body} stroke={C.ink} strokeWidth={8} /></g>
      <g transform={`translate(112 20) rotate(${25 + arm * 70})`}><rect x={-16} y={-8} width={32} height={66} rx={16} fill={body} stroke={C.ink} strokeWidth={8} /></g>
      {/* broto (assinatura) */}
      <path d="M0 -118 C -4 -150 -10 -168 -6 -186" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M-6 -184 C 20 -214 58 -200 52 -176 C 30 -170 10 -172 -6 -184 Z" fill={C.mint} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <circle r={124} fill={body} stroke={C.ink} strokeWidth={9} />
      <ellipse cx={-40} cy={-58} rx={42} ry={26} fill={lite} opacity={0.7} transform="rotate(-25 -40 -58)" />
      <Face mood={mood} look={look} blink={blink} />
      {hold}
    </g>
  );
};

const Face: React.FC<{ mood: Mood; look: [number, number]; blink: number }> = ({ mood, look, blink }) => (
  <g>
    {[-44, 44].map((ex) => (
      <g key={ex} transform={`translate(${ex} -18) scale(1 ${mood === 'happy' ? 1 : Math.max(0.08, blink)})`}>
        {mood === 'happy' ? (
          <path d="M-24 6 Q 0 -22 24 6" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
        ) : (
          <>
            <ellipse rx={mood === 'wow' ? 33 : 29} ry={mood === 'wow' ? 40 : 35} fill={C.white} stroke={C.ink} strokeWidth={7} />
            <circle cx={look[0] * 10} cy={look[1] * 10 + 4} r={mood === 'wow' ? 13 : 16} fill={C.ink} />
            <circle cx={look[0] * 10 + 6} cy={look[1] * 10 - 4} r={5} fill={C.white} />
          </>
        )}
      </g>
    ))}
    <ellipse cx={-80} cy={28} rx={20} ry={12} fill={C.pink} opacity={0.75} />
    <ellipse cx={80} cy={28} rx={20} ry={12} fill={C.pink} opacity={0.75} />
    <Mouth mood={mood} />
  </g>
);

const Mouth: React.FC<{ mood: Mood }> = ({ mood }) => {
  const st = { stroke: C.ink, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (mood === 'open' || mood === 'wow')
    return (
      <g transform="translate(0 46)">
        <ellipse rx={mood === 'wow' ? 18 : 26} ry={mood === 'wow' ? 22 : 24} fill="#7A1E3A" {...st} />
        <ellipse cy={10} rx={12} ry={7} fill={C.pink} />
      </g>
    );
  if (mood === 'munch') return <g transform="translate(0 44)"><ellipse rx={30} ry={14} fill="#7A1E3A" {...st} /></g>;
  if (mood === 'sick') return <path d="M-30 56 q 10 -12 20 0 t 20 0 t 20 0" fill="none" {...st} />;
  if (mood === 'grin' || mood === 'happy')
    return <path d="M-38 34 Q 0 84 38 34 Z" fill="#7A1E3A" {...st} />;
  return <path d="M-28 38 Q 0 64 28 38" fill="none" {...st} />;
};

export const Kiwi: React.FC<{ x: number; y: number; s?: number; mood?: 'smile' | 'talk' | 'cheer'; talk?: number; arm?: number; rot?: number; flip?: boolean }> = ({
  x, y, s = 1, mood = 'smile', talk = 0, arm = 0, rot = 0, flip,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={150} rx={110} ry={16} fill="#000" opacity={0.12} />
    {/* pernas */}
    {[-40, 36].map((lx) => (
      <g key={lx}><rect x={lx - 7} y={95} width={14} height={50} rx={7} fill={C.sun} stroke={C.ink} strokeWidth={6} />
        <path d={`M${lx - 26} 148 h52`} stroke={C.ink} strokeWidth={14} strokeLinecap="round" /><path d={`M${lx - 22} 148 h44`} stroke={C.sun} strokeWidth={6} strokeLinecap="round" /></g>
    ))}
    {/* corpo */}
    <ellipse rx={128} ry={118} fill={C.kiwi} stroke={C.ink} strokeWidth={9} />
    <ellipse cx={18} cy={30} rx={76} ry={60} fill={C.kiwiLite} opacity={0.65} />
    {/* asa */}
    <g transform={`translate(-96 26) rotate(${-10 - arm * 80})`}><ellipse cx={-10} cy={20} rx={30} ry={48} fill={C.kiwi} stroke={C.ink} strokeWidth={8} /></g>
    {/* apito */}
    <path d="M-30 -10 Q 0 40 40 -6" stroke={C.ink} strokeWidth={4} fill="none" />
    <g transform="translate(36 30) rotate(-15)"><rect x={-20} y={-11} width={40} height={22} rx={8} fill={C.grape} stroke={C.ink} strokeWidth={5} /></g>
    {/* olhos */}
    {[ -2, 52 ].map((ex) => (
      <g key={ex} transform={`translate(${ex} -44)`}>
        {mood === 'cheer' ? <path d="M-16 4 Q 0 -14 16 4" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" /> :
          <><ellipse rx={18} ry={21} fill={C.white} stroke={C.ink} strokeWidth={6} /><circle cx={4} cy={3} r={9} fill={C.ink} /><circle cx={8} cy={-2} r={3} fill={C.white} /></>}
      </g>
    ))}
    {/* bico longo */}
    <g transform="translate(70 -14)">
      <path d={`M0 -14 L 118 ${-2 + talk * 4} L 0 6 Z`} fill={C.sun} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M0 6 L 112 ${8 + talk * 16} L 0 ${14 + talk * 12} Z`} fill="#F2A515" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    </g>
    {/* boné */}
    <g transform="translate(18 -96) rotate(-6)">
      <path d="M-74 10 Q -70 -62 8 -64 Q 80 -62 78 8 Z" fill={C.mint} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <path d="M40 4 Q 110 -2 132 14 Q 100 26 40 18 Z" fill={C.mint} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <circle cy={-60} r={10} fill={C.white} stroke={C.ink} strokeWidth={5} />
      <text x={2} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.white} stroke={C.ink} strokeWidth={2}>K</text>
    </g>
  </g>
);

/* ---------- objetos ---------- */
const PILLS = [C.tomato, C.sun, C.grape, C.mint, C.pink];
export const Bottle: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-46} y={-118} width={92} height={36} rx={10} fill={C.white} stroke={C.ink} strokeWidth={7} />
    <rect x={-58} y={-86} width={116} height={150} rx={22} fill="#FF9E3D" stroke={C.ink} strokeWidth={8} opacity={0.97} />
    <rect x={-44} y={-50} width={88} height={70} rx={10} fill={C.white} stroke={C.ink} strokeWidth={5} />
    <path d="M-10 -15 h20 M0 -25 v20" stroke={C.tomato} strokeWidth={9} strokeLinecap="round" />
    <rect x={-40} y={60 - 16} width={80} height={6} rx={3} fill="#E57E16" />
  </g>
);
export const Pill: React.FC<{ x: number; y: number; c: string; rot?: number; s?: number }> = ({ x, y, c, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-26} y={-12} width={52} height={24} rx={12} fill={C.white} stroke={C.ink} strokeWidth={5} />
    <path d="M0 -12 h14 a12 12 0 0 1 0 24 h-14 Z" fill={c} stroke={C.ink} strokeWidth={5} />
  </g>
);
const Candy: React.FC<{ x: number; y: number; c: string; s?: number }> = ({ x, y, c, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-44 -18 L -26 0 L -44 18 Z M44 -18 L 26 0 L 44 18 Z" fill={c} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle r={28} fill={c} stroke={C.ink} strokeWidth={6} />
    <path d="M-16 -10 Q 0 -24 14 -14" stroke={C.white} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
const Table: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 40} y={30} width={26} height={170} rx={8} fill={C.woodDark} stroke={C.ink} strokeWidth={7} />
    <rect x={w / 2 - 66} y={30} width={26} height={170} rx={8} fill={C.woodDark} stroke={C.ink} strokeWidth={7} />
    <rect x={-w / 2} y={0} width={w} height={44} rx={14} fill={C.wood} stroke={C.ink} strokeWidth={8} />
  </g>
);
const Room: React.FC<{ w: number; h: number; tone?: string; win?: boolean }> = ({ w, h, tone = C.sky, win = true }) => (
  <g>
    <rect width={w} height={h} fill={tone} />
    {Array.from({ length: 30 }).map((_, i) => (
      <circle key={i} cx={(i * 197) % w} cy={(i * 131) % (h * 0.7)} r={7} fill={C.white} opacity={0.35} />
    ))}
    <rect y={h * 0.72} width={w} height={h * 0.28} fill="#F8D9A8" />
    <rect y={h * 0.72} width={w} height={10} fill={C.ink} opacity={0.12} />
    {/* janela */}
    {win && <g transform={`translate(${w * 0.78} ${h * 0.2})`}>
      <rect x={-80} y={-70} width={160} height={140} rx={18} fill="#DFF5FF" stroke={C.ink} strokeWidth={7} />
      <path d="M0 -70 v140 M-80 0 h160" stroke={C.ink} strokeWidth={6} />
      <circle cx={-40} cy={-30} r={18} fill={C.sun} />
    </g>}
  </g>
);

/* ---------- texto ---------- */
const Txt: React.FC<{ x: number; y: number; size: number; fill?: string; stroke?: string; sw?: number; anchor?: 'middle' | 'start' | 'end'; children: React.ReactNode; s?: number; rot?: number; o?: number }> = ({
  x, y, size, fill = C.white, stroke = C.ink, sw, anchor = 'middle', children, s = 1, rot = 0, o = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <text textAnchor={anchor} fontFamily={FONT} fontWeight={700} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw ?? size * 0.16} strokeLinejoin="round" paintOrder="stroke" dominantBaseline="middle">{children}</text>
  </g>
);

function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * cl(t)).toString(16).padStart(2, '0')).join('');
}

/* ---------- legenda palavra a palavra ---------- */
const Captions: React.FC<{ beats: Beat[]; t: number }> = ({ beats, t }) => {
  const b = beats.find((x) => t >= x.t0 - 0.05 && t <= x.t1 + 0.25);
  if (!b) return null;
  const words = b.txt.split(' ');
  const tot = words.reduce((s, w) => s + w.length + 2, 0);
  let acc = 0;
  const cur = words.findIndex((w) => { acc += w.length + 2; return t < b.t0 + ((b.t1 - b.t0) * acc) / tot; });
  const pop = interpolate(t - b.t0, [0, 0.12], [0.85, 1], { extrapolateRight: 'clamp' });
  return (
    <g transform={`translate(500 1585) scale(${pop})`}>
      <text textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={70} dominantBaseline="middle" strokeLinejoin="round" paintOrder="stroke" stroke={C.ink} strokeWidth={14}>
        {words.map((w, i) => (
          <tspan key={i} fill={i === (cur < 0 ? words.length - 1 : cur) ? C.sun : C.white}>{w + (i < words.length - 1 ? ' ' : '')}</tspan>
        ))}
      </text>
    </g>
  );
};

/* ---------- confete ---------- */
const Confetti: React.FC<{ t: number; x: number; y: number; n?: number }> = ({ t, x, y, n = 36 }) => {
  if (t < 0 || t > 2.2) return null;
  const cols = [C.tomato, C.sun, C.mint, C.grape, C.pink, C.bo];
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + i * 0.37;
        const v = 420 + ((i * 97) % 300);
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t * 0.8 + 700 * t * t;
        return <rect key={i} x={px} y={py} width={18} height={30} rx={6} fill={cols[i % 6]} transform={`rotate(${i * 40 + t * 600} ${px} ${py})`} opacity={cl(2.2 - t)} />;
      })}
    </g>
  );
};

/* ---------- painel A/B ---------- */
const PW = 900, PH = 540;
const Panel: React.FC<{ x: number; y: number; letter: 'A' | 'B'; label: string; color: string; inT: number; t: number; fps: number; f: number; children: React.ReactNode; state?: 'right' | 'wrong' | null; stT?: number; dim?: number; showL?: boolean }> = ({
  x, y, letter, label, showL = true, color, inT, t, fps, f, children, state, stT = 0, dim = 0,
}) => {
  const k = sp(f, fps, inT, 13);
  const dx = (1 - k) * (letter === 'A' ? -1100 : 1100);
  const shake = state === 'wrong' ? Math.sin((t - stT) * 60) * 14 * Math.exp(-(t - stT) * 5) * (t > stT ? 1 : 0) : 0;
  const glow = state === 'right' ? cl((t - stT) * 4) : 0;
  const grey = state === 'wrong' ? cl((t - stT) * 3) * 0.45 : 0;
  return (
    <g transform={`translate(${x + dx + shake} ${y})`} opacity={k > 0.01 ? 1 : 0}>
      {glow > 0 && <rect x={-16} y={-16} width={PW + 32} height={PH + 32} rx={52} fill={C.sun} opacity={0.55 + 0.25 * Math.sin(t * 10)} />}
      <defs><clipPath id={`clip${letter}`}><rect width={PW} height={PH} rx={40} /></clipPath></defs>
      <g clipPath={`url(#clip${letter})`}>
        {children}
        <rect width={PW} height={PH} fill="#5A5870" opacity={grey + dim} />
      </g>
      <rect width={PW} height={PH} rx={40} fill="none" stroke={C.ink} strokeWidth={10} />
      {/* selo da letra */}
      <g transform="translate(70 70)">
        <circle r={52} fill={color} stroke={C.ink} strokeWidth={8} />
        <Txt x={0} y={4} size={64} sw={0}>{letter}</Txt>
      </g>
      {showL && <g transform={`translate(${PW / 2} ${PH - 56})`}>
        <rect x={-300} y={-40} width={600} height={80} rx={40} fill={C.white} stroke={C.ink} strokeWidth={7} />
        <Txt x={0} y={3} size={46} fill={C.ink} sw={0}>{label}</Txt>
      </g>}
      {state === 'right' && t > stT && <Stamp t={t - stT} ok />}
      {state === 'wrong' && t > stT && <Stamp t={t - stT} />}
    </g>
  );
};
const Stamp: React.FC<{ t: number; ok?: boolean }> = ({ t, ok }) => {
  const s = interpolate(t, [0, 0.14, 0.26], [2.4, 0.9, 1], { extrapolateRight: 'clamp' });
  return (
    <g transform={`translate(${PW - 120} 120) scale(${s}) rotate(${ok ? -8 : 8})`}>
      <circle r={78} fill={ok ? C.mint : C.tomato} stroke={C.ink} strokeWidth={9} />
      {ok ? <path d="M-36 2 L -10 28 L 40 -26" stroke={C.white} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M-30 -30 L 30 30 M30 -30 L -30 30" stroke={C.white} strokeWidth={20} strokeLinecap="round" />}
    </g>
  );
};

/* ---------- episódio ---------- */
export const PickPals: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = ({ id, dados, semAudio }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const B = dados.beats;
  const at = (k: string, d = 0) => B[k].t0 + d;
  const blink = (o = 0) => (((t + o) % 3.1) > 1.6 && ((t + o) % 3.1) < 1.72 ? 0.1 : 1);
  const tSplit = at('q') - 0.15;
  const tKiwi = at('why') - 0.25;
  const tNext = at('next') - 0.15;
  const scene = t < tSplit ? 1 : t < tKiwi ? 2 : t < tNext ? 3 : 4;
  const talkN = (k: string) => (t > B[k].t0 && t < B[k].t1 ? Math.abs(Math.sin(t * 22)) : 0);

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Fonts />
      {!semAudio && <Audio src={staticFile(`pp/${id}/audio.wav`)} />}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {scene === 1 && <Scene1 t={t} f={f} fps={fps} at={at} blink={blink} />}
        {scene === 2 && <Scene2 t={t} f={f} fps={fps} at={at} blink={blink} />}
        {scene === 3 && <Scene3 t={t} f={f} fps={fps} at={at} blink={blink} talk={talkN('why') + talkN('rule')} />}
        {scene === 4 && <Scene4 t={t} f={f} fps={fps} at={at} blink={blink} />}
        <Captions beats={Object.values(B).filter((b) => !['c3', 'c2', 'c1'].includes(Object.keys(B).find((k) => B[k] === b)!))} t={t} />
        <Brand t={t} />
        {/* flash de transição */}
        {[tSplit, tKiwi, tNext].map((x, i) => (
          <rect key={i} width={1080} height={1920} fill={C.white} opacity={cl(1 - Math.abs(t - x) * 7) * 0.8} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Brand: React.FC<{ t: number }> = () => (
  <g transform="translate(540 64) scale(0.8)">
    <rect x={-150} y={-34} width={300} height={68} rx={34} fill={C.white} stroke={C.ink} strokeWidth={6} opacity={0.95} />
    <circle cx={-108} cy={0} r={20} fill={C.bo} stroke={C.ink} strokeWidth={5} />
    <path d="M-108 -20 c 0 -8 -2 -12 0 -18" stroke={C.ink} strokeWidth={4} fill="none" />
    <path d="M-108 -36 c 10 -12 26 -8 24 2 c -10 2 -18 2 -24 -2 z" fill={C.mint} stroke={C.ink} strokeWidth={3} />
    <Txt x={12} y={3} size={40} fill={C.ink} sw={0}>Pick Pals</Txt>
  </g>
);

type SP = { t: number; f: number; fps: number; at: (k: string, d?: number) => number; blink: (o?: number) => number; talk?: number };

/* cena 1: Bo encontra o frasco */
const Scene1: React.FC<SP> = ({ t, f, fps, at, blink }) => {
  const kIn = sp(f, fps, -0.15, 9);
  const walk = ease((t - 0.25) / 1.1);
  const bx = interpolate(walk, [0, 1], [310, 410]);
  const hop = Math.abs(Math.sin(t * 9)) * 26 * (walk > 0 && walk < 1 ? 1 : 0);
  const wowT = at('bo1');
  const isWow = t > wowT - 0.05;
  const zoom = interpolate(t, [0, 3.2], [1.42, 1.55]);
  const tag = sp(f, fps, -0.2, 12);
  return (
    <g>
      <g transform={`translate(540 1060) scale(${zoom}) translate(-520 -1080)`}>
        <Room w={1080} h={1920} win={false} />
        <Table x={640} y={1180} w={600} />
        <Bottle x={700} y={1100} s={1.05} rot={-6} />
        {PILLS.map((c, i) => <Pill key={i} x={520 + i * 62} y={1162 - (i % 2) * 14} c={c} rot={i * 37} s={0.9} />)}
        <Bo x={bx} y={1180 - hop - (1 - kIn) * 500} s={1.15} mood={isWow ? 'open' : 'smile'} look={[1, isWow ? 0.4 : 0]} blink={blink()} arm={isWow ? 0.7 : 0} sq={Math.sin(t * 9) * 0.3 * (walk < 1 ? 1 : 0)} />
        {isWow && <g transform={`translate(${bx + 120} ${960}) scale(${sp(f, fps, wowT, 8)})`}>
          <circle r={64} fill={C.white} stroke={C.ink} strokeWidth={8} />
          <Txt x={0} y={4} size={86} fill={C.tomato} sw={0}>?</Txt>
        </g>}
        {isWow && [0, 1, 2].map((i) => <Sparkle key={i} x={620 + i * 90} y={980 - i * 40} t={t - wowT - i * 0.1} />)}
      </g>
      {/* rótulo do tema */}
      <g transform={`translate(540 ${300 - (1 - tag) * 400}) rotate(-3)`}>
        <rect x={-430} y={-150} width={860} height={300} rx={56} fill={C.white} stroke={C.ink} strokeWidth={10} />
        <Candy x={-330} y={-62} c={C.pink} s={1.1} />
        <Txt x={30} y={-62} size={100} fill={C.pink}>CANDY</Txt>
        <Txt x={300} y={-62} size={60} fill={C.ink} sw={0}>or</Txt>
        <Pill x={-330} y={64} c={C.grape} rot={-20} s={1.6} />
        <Txt x={60} y={64} size={100} fill={C.tomato}>MEDICINE?</Txt>
      </g>
    </g>
  );
};
const Sparkle: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t < 0 || t > 1) return null;
  const s = Math.sin(cl(t) * Math.PI) * 1.2;
  return <path transform={`translate(${x} ${y}) scale(${s}) rotate(${t * 90})`} d="M0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill={C.sun} stroke={C.ink} strokeWidth={4} />;
};

/* cena 2: A ou B + contagem + resposta */
const Scene2: React.FC<SP> = ({ t, f, fps, at, blink }) => {
  const title = sp(f, fps, at('q') - 0.1, 9);
  const ans = at('ans');
  const done = t > ans - 0.05;
  // painel A: Bo come o remédio
  const aT = t - at('a');
  const eat = cl((aT - 0.3) / 0.5);
  const chew = aT > 0.8 ? Math.abs(Math.sin(aT * 16)) : 0;
  const sickA = done ? cl((t - ans) * 2) : 0;
  // painel B: Bo leva o frasco ao Kiwi
  const bT = t - at('b');
  const walkB = ease((bT - 0.3) / 1.3);
  const cnt = ['c3', 'c2', 'c1'].findIndex((k, i, arr) => t >= at(k) - 0.05 && (i === 2 ? t < ans - 0.05 : t < at(arr[i + 1]) - 0.05));
  const pointing = t > at('point') - 0.1 && !done;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.cream} />
      {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={(i * 211) % 1080} cy={(i * 383) % 1920} r={40 + (i % 3) * 20} fill={[C.sky, '#FFE3A3', '#D9F7EC'][i % 3]} opacity={0.6} />)}
      {/* título */}
      <g transform={`translate(540 ${215}) scale(${title}) rotate(${(1 - title) * -8})`}>
        <rect x={-460} y={-82} width={920} height={164} rx={50} fill={C.sun} stroke={C.ink} strokeWidth={10} />
        <Txt x={0} y={6} size={84} fill={C.white} sw={15}>WHICH ONE IS RIGHT?</Txt>
      </g>
      <Panel x={90} y={350} letter="A" label="Eat them!" showL={t > at('a') - 0.1} color={C.grape} inT={at('q') + 0.15} t={t} fps={fps} f={f} state={done ? 'wrong' : null} stT={ans} dim={pointing && Math.floor(t * 3) % 2 === 1 ? 0.12 : 0}>
        <Room w={PW} h={PH} tone="#CDEBFF" />
        <Table x={560} y={360} w={420} />
        <Bottle x={640} y={290} s={0.7} rot={10} />
        <Bo x={310} y={330} s={0.85} mood={sickA > 0 ? 'sick' : aT > 0.8 ? (chew > 0.5 ? 'munch' : 'grin') : 'open'} sick={sickA} look={[0.6, 0]} blink={blink(0.4)} arm={eat}
          rot={sickA * -6} hold={eat < 1 && aT > 0 ? <Pill x={120 - eat * 120} y={20 - eat * 40} c={C.tomato} s={1.1} /> : null} />
        {sickA > 0 && <Txt x={310} y={120} size={56} fill={C.tomato} o={sickA}>OUCH!</Txt>}
      </Panel>
      <Panel x={90} y={950} letter="B" label="Ask a grown-up!" showL={t > at('b') - 0.1} color={C.bo} inT={at('q') + 0.3} t={t} fps={fps} f={f} state={done ? 'right' : null} stT={ans} dim={pointing && Math.floor(t * 3) % 2 === 0 ? 0.12 : 0}>
        <Room w={PW} h={PH} tone="#D7F6E9" />
        <Kiwi x={700} y={300} s={0.82} flip mood={done ? 'cheer' : 'smile'} arm={walkB > 0.9 ? 0.6 + 0.2 * Math.sin(t * 8) : 0} />
        <Bo x={180 + walkB * 230} y={340 - Math.abs(Math.sin(t * 9)) * 18 * (walkB > 0 && walkB < 1 ? 1 : 0)} s={0.8} mood={done ? 'happy' : 'smile'} look={[1, 0]} blink={blink(1.1)} arm={0.55}
          hold={<Bottle x={118} y={-10} s={0.45} rot={-12} />} />
        {walkB >= 1 && !done && <g transform={`translate(560 120) scale(${sp(f, fps, at('b') + 1.6, 8)})`}><circle r={40} fill={C.white} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={44} fill={C.mint} sw={0}>♥</Txt></g>}
        {done && <Confetti t={t - ans} x={450} y={200} />}
      </Panel>
      {/* seta pulsando no painel da vez */}
      {pointing && (
        <g transform={`translate(${985 + Math.sin(t * 9) * 12} ${Math.floor(t * 3) % 2 === 0 ? 620 : 1220})`}>
          <path d="M40 -46 L -34 0 L 40 46 Z" fill={C.sun} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
        </g>
      )}
      {/* contagem */}
      {cnt >= 0 && (
        <g transform={`translate(540 920) scale(${sp(f, fps, at(['c3', 'c2', 'c1'][cnt]), 7)})`}>
          <circle r={130} fill={C.tomato} stroke={C.ink} strokeWidth={12} />
          <Txt x={0} y={8} size={170} sw={0}>{3 - cnt}</Txt>
        </g>
      )}
      {done && t < ans + 1.4 && (
        <g transform={`translate(540 920) scale(${sp(f, fps, ans, 6)})`}>
          <circle r={140} fill={C.mint} stroke={C.ink} strokeWidth={12} />
          <Txt x={0} y={8} size={170} sw={0}>B!</Txt>
        </g>
      )}
    </g>
  );
};

/* cena 3: Coach Kiwi explica a regra */
const Scene3: React.FC<SP> = ({ t, f, fps, at, blink, talk = 0 }) => {
  const kIn = sp(f, fps, at('why') - 0.25, 10);
  const card = sp(f, fps, at('why'), 9);
  const rule = sp(f, fps, at('rule'), 10);
  const star = sp(f, fps, at('rule', 1.0), 7);
  return (
    <g>
      <Room w={1080} h={1920} tone="#D7F6E9" />
      {/* placa: remédio ≠ doce */}
      <g transform={`translate(540 ${420}) scale(${card})`}>
        <rect x={-430} y={-170} width={860} height={340} rx={50} fill={C.white} stroke={C.ink} strokeWidth={10} />
        <Bottle x={-250} y={20} s={0.95} />
        {PILLS.slice(0, 3).map((c, i) => <Pill key={i} x={-330 + i * 80} y={120} c={c} rot={i * 30} s={0.8} />)}
        <Txt x={0} y={10} size={170} fill={C.tomato} sw={20}>≠</Txt>
        <Candy x={250} y={-20} c={C.pink} s={1.4} />
        <Candy x={300} y={100} c={C.sun} s={0.9} />
        <Candy x={180} y={110} c={C.mint} s={0.8} />
      </g>
      <Txt x={540} y={700} size={78} fill={C.white} o={card}>NOT CANDY!</Txt>
      <Kiwi x={360} y={1150 + (1 - kIn) * 900} s={1.25} talk={talk} mood={t > at('rule', 1.0) ? 'cheer' : 'talk'} arm={0.4 + 0.3 * Math.sin(t * 5)} />
      <Bo x={820} y={1230} s={0.95} mood={t > at('rule', 1.0) ? 'happy' : 'smile'} look={[-1, -0.3]} blink={blink(0.7)} sq={Math.max(0, Math.sin(t * 6)) * 0.25} />
      {/* regra */}
      <g transform={`translate(540 ${1420}) scale(${rule})`} opacity={rule > 0.02 ? 1 : 0}>
        <rect x={-420} y={-54} width={840} height={108} rx={54} fill={C.mint} stroke={C.ink} strokeWidth={8} />
        <Txt x={0} y={4} size={44} sw={0}>Only a GROWN-UP gives medicine</Txt>
      </g>
      {/* estrela de segurança */}
      {t > at('rule', 1.0) && (
        <g transform={`translate(860 ${930}) scale(${star}) rotate(${(1 - star) * 90})`}>
          <path d="M0 -90 L 26 -30 L 90 -26 L 40 16 L 56 80 L 0 46 L -56 80 L -40 16 L -90 -26 L -26 -30 Z" fill={C.sun} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <Txt x={0} y={10} size={40} fill={C.ink} sw={0}>+1</Txt>
        </g>
      )}
      {t > at('rule', 1.0) && <Txt x={860} y={1060} size={38} fill={C.white} o={star}>SAFETY STAR</Txt>}
    </g>
  );
};

/* cena 4: gancho para o próximo */
const Scene4: React.FC<SP> = ({ t, f, fps, at, blink }) => {
  const k = sp(f, fps, at('next') - 0.15, 9);
  const peek = sp(f, fps, at('next', 0.8), 8);
  return (
    <g>
      <rect width={1080} height={1920} fill={C.grape} />
      {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={(i * 173) % 1080} cy={(i * 307) % 1920} r={30 + (i % 4) * 14} fill={C.white} opacity={0.08} />)}
      <Txt x={540} y={430} size={96} s={k}>NEXT ONE IS</Txt>
      <Txt x={540} y={560} size={130} fill={C.sun} s={k} rot={-4}>TRICKY!</Txt>
      {/* tesoura misteriosa */}
      <g transform={`translate(540 ${920}) scale(${peek}) rotate(${Math.sin(t * 6) * 8})`}>
        <circle r={190} fill={C.white} stroke={C.ink} strokeWidth={10} />
        <g transform="rotate(-30)">
          <path d="M-20 0 L 130 -26 L 130 -6 Z M-20 0 L 130 26 L 130 6 Z" fill="#C8D2E0" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <circle cx={-70} cy={-38} r={38} fill="none" stroke={C.tomato} strokeWidth={20} />
          <circle cx={-70} cy={38} r={38} fill="none" stroke={C.tomato} strokeWidth={20} />
        </g>
        <Txt x={120} y={-140} size={110} fill={C.tomato}>?</Txt>
      </g>
      <Bo x={540} y={1320} s={1.05} mood="grin" look={[0, -0.5]} blink={blink()} arm={0.8 + 0.2 * Math.sin(t * 10)} sq={Math.max(0, Math.sin(t * 8)) * 0.3} />
    </g>
  );
};

/* ---------- marca: logo e ficha ---------- */
export const PPMarca: React.FC<{ v: 'logo' | 'ficha' }> = ({ v }) => {
  if (v === 'logo')
    return (
      <AbsoluteFill style={{ background: C.sun }}><Fonts />
        <svg width={800} height={800} viewBox="0 0 800 800">
          <circle cx={400} cy={400} r={400} fill={C.sun} />
          {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={(i * 173) % 800} cy={(i * 241) % 800} r={26} fill={C.white} opacity={0.18} />)}
          <Bo x={400} y={372} s={1.55} mood="grin" look={[0.2, -0.2]} arm={0.8} />
          <g transform="translate(400 662) rotate(-4)">
            <rect x={-250} y={-62} width={500} height={124} rx={62} fill={C.tomato} stroke={C.ink} strokeWidth={10} />
            <Txt x={0} y={6} size={92} sw={15}>Pick Pals</Txt>
          </g>
        </svg>
      </AbsoluteFill>
    );
  const sw = [C.bo, C.mint, C.sun, C.tomato, C.grape, C.pink, C.kiwi, C.cream];
  return (
    <AbsoluteFill style={{ background: C.cream }}><Fonts />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <rect width={1920} height={1080} fill={C.cream} />
        <Txt x={960} y={110} size={120} fill={C.sun}>Pick Pals</Txt>
        <Txt x={960} y={205} size={44} fill={C.ink} sw={0}>Which one is right? Fun safety & good habits for kids</Txt>
        <Bo x={430} y={560} s={1.5} mood="grin" look={[0.5, 0]} arm={0.6} />
        <Txt x={430} y={850} size={64} fill={C.bo}>BO</Txt>
        <Txt x={430} y={915} size={34} fill={C.ink} sw={0}>curious, always picking</Txt>
        <Bo x={860} y={600} s={0.75} mood="wow" look={[0, 0]} />
        <Bo x={860} y={820} s={0.75} mood="sick" sick={1} />
        <Kiwi x={1400} y={580} s={1.45} mood="smile" arm={0.5} />
        <Txt x={1400} y={850} size={64} fill={C.kiwi}>COACH KIWI</Txt>
        <Txt x={1400} y={915} size={34} fill={C.ink} sw={0}>the safety coach (the grown-up)</Txt>
        {sw.map((c, i) => <g key={i} transform={`translate(${600 + i * 100} 1010)`}><circle r={36} fill={c} stroke={C.ink} strokeWidth={6} /></g>)}
      </svg>
    </AbsoluteFill>
  );
};
