import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { C, Fonts, Bottle, Pill } from './PickPals';
import { BoBunny, CoachKiwi, RoomBG } from './Toon';

/* Pick Pals v3: episódio em 2D ilustrado. Área segura: x 110–910, y 290–1250; legenda ~1180 */
type Beat = { t0: number; t1: number; txt: string; who: string };
type Dados = { dur: number; quadros: number; beats: Record<string, Beat>; boca: number[]; quem: string };
const FONT = 'Fredoka';
const CX = 510;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (x: number) => Easing.bezier(0.33, 1, 0.68, 1)(cl(x));
const eio = (x: number) => Easing.bezier(0.65, 0, 0.35, 1)(cl(x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sp = (f: number, fps: number, at: number, damping = 11) => spring({ frame: f - Math.round(at * fps), fps, config: { damping, mass: 0.7, stiffness: 170 } });
const PC = [C.tomato, C.sun, C.grape, C.mint, C.pink];

const Txt: React.FC<{ x: number; y: number; size: number; fill?: string; stroke?: string; sw?: number; children: React.ReactNode; s?: number; rot?: number; o?: number }> = ({
  x, y, size, fill = C.white, stroke = C.ink, sw, children, s = 1, rot = 0, o = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw ?? size * 0.16} strokeLinejoin="round" paintOrder="stroke" dominantBaseline="middle">{children}</text>
  </g>
);
const Chip: React.FC<{ y: number; s: number; children: React.ReactNode; w?: number; fill?: string }> = ({ y, s, children, w = 760, fill = C.white }) => (
  <g transform={`translate(${CX} ${y}) scale(${s})`} opacity={s > 0.02 ? 1 : 0}>
    <rect x={-w / 2} y={-62} width={w} height={124} rx={62} fill={fill} stroke={C.ink} strokeWidth={9} />
    <rect x={-w / 2 + 14} y={-52} width={w - 28} height={34} rx={17} fill="#fff" opacity={0.25} />
    {children}
  </g>
);
const CandyIcon: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = C.pink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-46 -18 L -26 0 L -46 18 Z M46 -18 L 26 0 L 46 18 Z" fill={c} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle r={28} fill={c} stroke={C.ink} strokeWidth={6} />
    <path d="M-14 -10 Q 0 -22 12 -13" stroke={C.white} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
const Table: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 380 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cy={250} rx={w * 0.55} ry={22} fill="#3A2340" opacity={0.14} />
    {[-w / 2 + 40, w / 2 - 40].map((lx) => <rect key={lx} x={lx - 14} y={20} width={28} height={230} rx={12} fill="#C47E44" stroke="#5B3A2A" strokeWidth={7} />)}
    <rect x={-w / 2} y={-6} width={w} height={44} rx={18} fill="#EBAA6C" stroke="#5B3A2A" strokeWidth={8} />
    <rect x={-w / 2 + 16} y={0} width={w - 32} height={12} rx={6} fill="#fff" opacity={0.3} />
  </g>
);
const Captions: React.FC<{ b?: Beat; t: number }> = ({ b, t }) => {
  if (!b) return null;
  const words = b.txt.split(' ');
  const tot = words.reduce((s, w) => s + w.length + 1, 0);
  let acc = 0;
  let cur = words.findIndex((w) => { acc += w.length + 1; return t < b.t0 + ((b.t1 - b.t0) * acc) / tot; });
  if (cur < 0) cur = words.length - 1;
  const lines: number[][] = [[]];
  let len = 0;
  words.forEach((w, i) => { if (len + w.length > 18 && lines[lines.length - 1].length) { lines.push([]); len = 0; } lines[lines.length - 1].push(i); len += w.length + 1; });
  const pop = interpolate(t - b.t0, [0, 0.1], [0.9, 1], { extrapolateRight: 'clamp' });
  const y0 = 1175 - (lines.length - 1) * 40;
  return (
    <g transform={`translate(${CX} 0) scale(${pop}) translate(${-CX} 0)`}>
      {lines.map((ln, li) => (
        <text key={li} x={CX} y={y0 + li * 80} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={700} fontSize={66}
          stroke={C.ink} strokeWidth={15} strokeLinejoin="round" paintOrder="stroke">
          {ln.map((i) => <tspan key={i} fill={i === cur ? C.sun : C.white}>{words[i] + ' '}</tspan>)}
        </text>
      ))}
    </g>
  );
};
const Stamp: React.FC<{ t: number; ok?: boolean; x: number; y: number }> = ({ t, ok, x, y }) => {
  const s = interpolate(t, [0, 0.14, 0.26], [2.6, 0.9, 1], { extrapolateRight: 'clamp' });
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${ok ? -8 : 8})`}>
      <circle r={66} fill={ok ? C.mint : C.tomato} stroke={C.ink} strokeWidth={8} />
      {ok ? <path d="M-30 2 L -8 24 L 34 -22" stroke={C.white} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M-25 -25 L 25 25 M25 -25 L -25 25" stroke={C.white} strokeWidth={17} strokeLinecap="round" />}
    </g>
  );
};
const Confetti: React.FC<{ t: number; x: number; y: number; n?: number }> = ({ t, x, y, n = 44 }) => {
  if (t < 0 || t > 2.2) return null;
  const cols = [C.tomato, C.sun, C.mint, C.grape, C.pink, C.bo];
  return <g>{Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2 + i * 0.37, v = 380 + ((i * 97) % 320);
    const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t * 0.8 + 760 * t * t;
    return <rect key={i} x={px} y={py} width={16} height={28} rx={6} fill={cols[i % 6]} transform={`rotate(${i * 40 + t * 600} ${px} ${py})`} opacity={cl(2.2 - t)} />;
  })}</g>;
};
const Sparkle: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t < 0 || t > 1) return null;
  const k = Math.sin(cl(t) * Math.PI) * s;
  return <path transform={`translate(${x} ${y}) scale(${k}) rotate(${t * 90})`} d="M0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill={C.sun} stroke={C.ink} strokeWidth={4} />;
};
/* câmera: foco (fx, fy) com zoom z */
const cam = (fx: number, fy: number, z: number, sx = 0) => `translate(${540 + sx} 960) scale(${z}) translate(${-fx} ${-fy})`;

export const ToonEp: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = ({ id, dados, semAudio }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const B = dados.beats;
  const at = (k: string, d = 0) => B[k].t0 + d;
  const q = Math.min(f, dados.boca.length - 1);
  const mouthOf = (who: string) => (dados.quem[q] === who ? dados.boca[q] : 0);
  const blink = (o = 0) => (((t + o) % 3.3) > 2.0 && ((t + o) % 3.3) < 2.12 ? 0.1 : 1);

  const tSplit = at('what') - 0.12, tKiwi = at('why') - 0.2, tNext = at('next') - 0.12;
  const ph = t < tSplit ? 1 : t < tKiwi ? 2 : t < tNext ? 3 : 4;
  const ans = at('ans');
  const done = t > ans - 0.05;
  const curBeat = Object.entries(B).find(([k, b]) => !['c3', 'c2', 'c1', 'stop'].includes(k) && t >= b.t0 - 0.05 && t <= b.t1 + 0.3)?.[1];

  const tStop = at('stop');
  const frozen = t >= tStop - 0.02 && t < at('q') - 0.05;
  const ta = frozen ? tStop : t;
  const shake = t > tStop && t < tStop + 0.3 ? Math.sin(t * 90) * 12 * (1 - (t - tStop) / 0.3) : 0;

  return (
    <AbsoluteFill style={{ background: '#BEE4FF' }}>
      <Fonts />
      {!semAudio && <Audio src={staticFile(`pp/${id}/audio.wav`)} />}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="grey"><feColorMatrix type="saturate" values="0.25" /></filter>
        </defs>
        {ph === 1 && <Fase1 t={t} ta={ta} f={f} fps={fps} at={at} blink={blink} mouthOf={mouthOf} frozen={frozen} shake={shake} />}
        {ph === 2 && <Fase2 t={t} f={f} fps={fps} at={at} blink={blink} mouthOf={mouthOf} done={done} ans={ans} />}
        {ph === 3 && <Fase3 t={t} f={f} fps={fps} at={at} blink={blink} mouthOf={mouthOf} t0={tKiwi} />}
        {ph === 4 && <Fase4 t={t} f={f} fps={fps} at={at} blink={blink} mouthOf={mouthOf} t0={tNext} />}
        <Captions b={curBeat} t={t} />
        {[tSplit, tKiwi, tNext].map((x, i) => <rect key={i} width={1080} height={1920} fill={C.white} opacity={cl(1 - Math.abs(t - x) * 8) * 0.85} />)}
      </svg>
    </AbsoluteFill>
  );
};

type FP = { t: number; f: number; fps: number; at: (k: string, d?: number) => number; blink: (o?: number) => number; mouthOf: (w: string) => number };

/* fase 1: Bo quase come o remédio -> STOP -> doce ou remédio? */
const Fase1: React.FC<FP & { ta: number; frozen: boolean; shake: number }> = ({ t, ta, f, fps, at, blink, mouthOf, frozen, shake }) => {
  const tStop = at('stop'), tq = at('q');
  const reach = ta < tStop ? ease(ta / 0.55) : 1 - ease((t - tq) / 0.5);
  const pull = eio((t - tq) / 1.1);
  const z = lerp(1.75, 1.0, pull) * (frozen ? 1 + 0.05 * ease((t - tStop) / 0.25) : 1);
  const fx = lerp(420, 560, pull), fy = lerp(1045, 1065, pull);
  const confused = t > tq + 0.2;
  return (
    <g>
      <g transform={cam(fx, fy, z, shake)} filter={frozen ? 'url(#grey)' : undefined}>
        <RoomBG />
        <Table x={740} y={1060} w={400} />
        <Bottle x={800} y={985} s={1.15} rot={-6} />
        {PC.map((c, i) => <Pill key={i} x={610 + i * 46} y={1046 - (i % 2) * 12} c={c} rot={i * 37} s={0.8} />)}
        <BoBunny x={380} y={1255} s={1.25} t={ta} mouth={mouthOf('b')} viseme={confused ? 'frown' : 'smile'} look={reach > 0.5 ? [0.8, -0.5] : confused ? [1, 0.3] : [0.6, 0]}
          blink={blink()} armR={lerp(0.05, 0.9, reach)} armL={0.05} headTilt={confused ? -8 + Math.sin(t * 2) * 2 : reach * -4} brow={confused ? 0.6 : 0.3}
          holdR={reach > 0.08 ? <Pill x={0} y={-12} c={C.tomato} s={1.3} rot={-30} /> : null} />
      </g>
      {/* textos */}
      {t < tStop && (
        <Chip y={340} s={sp(f, fps, -0.2, 12)} w={600}><CandyIcon x={-200} y={0} s={0.9} /><Txt x={40} y={4} size={64} fill={C.pink}>Yummy?</Txt></Chip>
      )}
      {frozen && (
        <g transform={`translate(${CX} 560) scale(${sp(f, fps, tStop, 6)}) rotate(-6)`}>
          <Txt x={0} y={0} size={250} fill={C.tomato} sw={34}>STOP!</Txt>
          <Txt x={0} y={170} size={60}>wait a second...</Txt>
        </g>
      )}
      {t >= tq - 0.05 && (
        <g>
          <Chip y={350} s={sp(f, fps, tq - 0.05, 10)} w={820}>
            <CandyIcon x={-330} y={0} s={0.8} /><Txt x={-165} y={4} size={60} fill={C.pink}>CANDY</Txt>
            <Txt x={-35} y={4} size={42} fill={C.ink} sw={0}>or</Txt><Txt x={185} y={4} size={60} fill={C.tomato}>MEDICINE?</Txt>
          </Chip>
          <g transform={`translate(330 ${640 + Math.sin(t * 5) * 10}) scale(${sp(f, fps, tq + 0.4, 8)})`}>
            <circle r={58} fill={C.white} stroke={C.ink} strokeWidth={8} /><Txt x={0} y={6} size={84} fill={C.tomato} sw={0}>?</Txt>
          </g>
        </g>
      )}
    </g>
  );
};

/* fase 2: A | B */
const PX = [110, 525], PY = 440, PW = 385, PH = 660;
const Fase2: React.FC<FP & { done: boolean; ans: number }> = ({ t, f, fps, at, blink, done, ans }) => {
  const aT = t - at('a'), bT = t - at('b');
  const eat = cl((aT - 0.2) / 0.45);
  const chew = aT > 0.65 && !done ? Math.abs(Math.sin(aT * 13)) : 0;
  const sick = done ? cl((t - ans) * 2) : 0;
  const walk = ease((bT - 0.15) / 1.3);
  const walking = walk > 0 && walk < 1;
  const tap = t > at('tap') - 0.1 && !done;
  const hi = tap ? Math.floor(t * 3) % 2 : -1;
  const cnt = ['c3', 'c2', 'c1'].findIndex((k, i, arr) => t >= at(k) - 0.05 && (i === 2 ? t < ans - 0.05 : t < at(arr[i + 1]) - 0.05));
  const kA = sp(f, fps, at('what') + 0.05, 13), kB = sp(f, fps, at('what') + 0.2, 13);
  const hop = done ? Math.max(0, Math.sin((t - ans) * 9)) * 40 : 0;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.cream} />
      {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={(i * 211) % 1080} cy={(i * 383) % 1920} r={40 + (i % 3) * 22} fill={[C.sky, '#FFE3A3', '#D9F7EC'][i % 3]} opacity={0.7} />)}
      {[0, 1].map((i) => hi === i && <rect key={i} x={PX[i] - 14} y={PY - 14} width={PW + 28} height={PH + 28} rx={50} fill={C.sun} />)}
      {done && <rect x={PX[1] - 16} y={PY - 16} width={PW + 32} height={PH + 32} rx={52} fill={C.sun} opacity={0.7 + 0.3 * Math.sin(t * 10)} />}
      <defs>{[0, 1].map((i) => <clipPath key={i} id={`pc${i}`}><rect x={PX[i]} y={PY} width={PW} height={PH} rx={40} /></clipPath>)}</defs>
      {/* painel A: come */}
      <g transform={`translate(${(1 - kA) * -900} 0)`}>
        <g clipPath="url(#pc0)">
          <svg x={PX[0]} y={PY} width={PW} height={PH} viewBox="150 560 600 1028" preserveAspectRatio="xMidYMid slice">
            <g filter={sick > 0 ? 'url(#grey)' : undefined}>
              <RoomBG />
              <Table x={640} y={1060} w={360} />
              <Bottle x={700} y={985} s={1.1} rot={-6} />
              <BoBunny x={380} y={1255} s={1.25} t={t} mouth={sick > 0 ? 0 : chew * 0.7} viseme={sick > 0 ? 'sick' : aT > 0 && aT < 0.65 ? 'o' : 'smile'} sick={sick}
                look={[0.6, eat > 0.5 ? -0.4 : 0]} blink={blink(0.4)} armR={aT > 0 ? lerp(0.1, 1.05, eat) : 0.05} headTilt={sick * 10 - chew * 3}
                holdR={aT > 0 && eat < 0.95 ? <Pill x={0} y={-12} c={C.tomato} s={1.3} rot={-30} /> : null} brow={sick > 0 ? 0.5 : 0.2} />
              {sick > 0 && [0, 1, 2].map((i) => <circle key={i} cx={380 + Math.cos(t * 4 + i * 2.1) * 120} cy={760 + Math.sin(t * 4 + i * 2.1) * 30} r={14} fill={C.sick} stroke={C.ink} strokeWidth={4} />)}
            </g>
          </svg>
        </g>
        <rect x={PX[0]} y={PY} width={PW} height={PH} rx={40} fill="none" stroke={C.ink} strokeWidth={9} />
      </g>
      {/* painel B: pede para o adulto */}
      <g transform={`translate(${(1 - kB) * 900} 0)`}>
        <g clipPath="url(#pc1)">
          <svg x={PX[1]} y={PY} width={PW} height={PH} viewBox="90 520 680 1166" preserveAspectRatio="xMidYMid slice">
            <RoomBG wall="#C9F0DF" wall2="#ECFBF4" />
            <CoachKiwi x={640} y={1290 - hop * 0.5} s={1.05} t={t} flip wing={done ? 0.8 + 0.25 * Math.sin(t * 12) : walk >= 1 ? 0.3 : 0} point={walk >= 1 && !done ? 0.3 : 0}
              blink={blink(0.9)} happyEyes={done} headTilt={walk >= 1 ? 6 : 0} viseme="smile" />
            <BoBunny x={lerp(230, 410, walk)} y={1290 - hop} s={1.05} t={t} walk={walking ? bT * 1.6 : 0} look={[1, 0]} blink={blink(1.3)} armR={0.35} armL={walking ? 0.1 : 0.05}
              happyEyes={done} viseme={done ? 'grin' : 'smile'} holdR={<Bottle x={18} y={-10} s={0.5} rot={-12} />} />
            {walk >= 1 && !done && <g transform={`translate(520 780) scale(${sp(f, fps, at('b') + 1.5, 8)})`}><circle r={44} fill="#fff" stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={50} fill={C.tomato} sw={0}>♥</Txt></g>}
          </svg>
        </g>
        <rect x={PX[1]} y={PY} width={PW} height={PH} rx={40} fill="none" stroke={C.ink} strokeWidth={9} />
      </g>
      <Chip y={350} s={sp(f, fps, at('what') - 0.1, 10)} w={800} fill={C.sun}><Txt x={0} y={4} size={64}>What should Bo do?</Txt></Chip>
      {[0, 1].map((i) => {
        const show = t > at(i ? 'b' : 'a') - 0.1;
        const k = sp(f, fps, at(i ? 'b' : 'a') - 0.1, 9);
        return show && (
          <g key={i} transform={`translate(${PX[i] + PW / 2} ${PY + PH - 70}) scale(${k})`}>
            <rect x={-170} y={-38} width={340} height={76} rx={38} fill={C.white} stroke={C.ink} strokeWidth={7} />
            <circle cx={-128} cy={0} r={30} fill={i ? C.bo : C.grape} stroke={C.ink} strokeWidth={5} />
            <Txt x={-128} y={3} size={38} sw={0}>{i ? 'B' : 'A'}</Txt>
            <Txt x={28} y={3} size={i ? 33 : 38} fill={C.ink} sw={0}>{i ? 'Ask a grown-up' : 'Eat it!'}</Txt>
          </g>
        );
      })}
      {cnt >= 0 && (
        <g transform={`translate(${CX} 760) scale(${sp(f, fps, at(['c3', 'c2', 'c1'][cnt]), 7)})`}>
          <circle r={100} fill={C.tomato} stroke={C.ink} strokeWidth={11} /><Txt x={0} y={8} size={130} sw={0}>{3 - cnt}</Txt>
        </g>
      )}
      {done && t < ans + 1.2 && (
        <g transform={`translate(${CX} 760) scale(${sp(f, fps, ans, 6)})`}>
          <circle r={110} fill={C.mint} stroke={C.ink} strokeWidth={11} /><Txt x={0} y={8} size={120} sw={0}>B!</Txt>
        </g>
      )}
      {done && <Stamp t={t - ans} x={PX[0] + PW - 70} y={PY + 70} />}
      {done && <Stamp t={t - ans} ok x={PX[1] + PW - 70} y={PY + 70} />}
      {done && <Confetti t={t - ans} x={PX[1] + PW / 2} y={PY + 200} />}
    </g>
  );
};

/* fase 3: Coach Kiwi explica */
const Fase3: React.FC<FP & { t0: number }> = ({ t, f, fps, at, blink, mouthOf, t0 }) => {
  const k = eio((t - t0) / 0.7);
  const got = t > at('got') - 0.05;
  const z = got ? lerp(1.15, 1.0, eio((t - at('got')) / 0.5)) : lerp(1.28, 1.15, k);
  const fx = got ? 540 : 590, fy = got ? 1010 : 1000;
  const km = mouthOf('k');
  return (
    <g>
      <g transform={cam(fx, fy, z)}>
        <RoomBG wall="#C9F0DF" wall2="#ECFBF4" />
        <CoachKiwi x={700} y={1290} s={1.2} t={t} flip mouth={km} viseme="smile" wing={0.2 + km * 0.5 * Math.abs(Math.sin(t * 4))} point={t > at('rule') && t < at('rule', 1.4) ? 0.6 : 0}
          blink={blink(0.5)} happyEyes={got} brow={km > 0.3 ? 0.6 : 0.2} headTilt={-4} />
        <BoBunny x={300} y={1300} s={1.1} t={t} mouth={mouthOf('b')} viseme={got ? 'grin' : 'smile'} look={[1, -0.5]} blink={blink(1.2)}
          armR={got ? 0.95 + 0.1 * Math.sin(t * 12) : 0.08} armL={0.05} headTilt={got ? 0 : Math.sin(t * 3) * 4} happyEyes={t > at('got', 0.7)} bounce={got ? Math.max(0, Math.sin(t * 8)) : 0} />
      </g>
      <g transform={`translate(${CX} 420) scale(${sp(f, fps, at('why'), 9)})`}>
        <rect x={-380} y={-125} width={760} height={250} rx={46} fill={C.white} stroke={C.ink} strokeWidth={10} />
        <Bottle x={-240} y={10} s={1.0} />
        <Pill x={-140} y={70} c={C.grape} rot={20} s={1.0} />
        <Txt x={0} y={6} size={150} fill={C.tomato} sw={20}>≠</Txt>
        <CandyIcon x={230} y={-10} s={1.5} />
      </g>
      {got && (
        <g transform={`translate(800 650) scale(${sp(f, fps, at('got'), 7)}) rotate(${(1 - sp(f, fps, at('got'), 7)) * 120})`}>
          <path d="M0 -84 L 24 -28 L 84 -24 L 38 15 L 52 75 L 0 43 L -52 75 L -38 15 L -84 -24 L -24 -28 Z" fill={C.sun} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <Txt x={0} y={10} size={38} fill={C.ink} sw={0}>+1</Txt>
        </g>
      )}
      {got && [0, 1, 2].map((i) => <Sparkle key={i} x={300 + i * 90} y={640 - i * 30} t={t - at('got') - i * 0.12} s={1.3} />)}
    </g>
  );
};

/* fase 4: gancho do próximo */
const Fase4: React.FC<FP & { t0: number }> = ({ t, f, fps, at, blink, mouthOf, t0 }) => {
  const z = lerp(1.25, 1.4, eio((t - t0) / 2));
  const jump = Math.max(0, Math.sin(t * 7)) * 40;
  return (
    <g>
      <g transform={cam(520, 900, z)}>
        <RoomBG wall="#DCD2FF" wall2="#F3EEFF" />
        <BoBunny x={520} y={1260 - jump} s={1.2} t={t} mouth={mouthOf('n') > 0 ? 0 : mouthOf('b')} viseme="grin" look={[0, -0.3]} blink={blink()}
          armL={0.95 + 0.12 * Math.sin(t * 12)} armR={0.95 + 0.12 * Math.sin(t * 12 + 1)} bounce={jump / 40} />
      </g>
      <Txt x={CX} y={360} size={84} s={sp(f, fps, t0, 9)}>NEXT ONE IS</Txt>
      <Txt x={CX} y={480} size={124} fill={C.sun} s={sp(f, fps, t0 + 0.15, 8)} rot={-4}>TRICKY!</Txt>
      <g transform={`translate(800 650) scale(${sp(f, fps, t0 + 0.6, 8)}) rotate(${Math.sin(t * 6) * 8})`}>
        <circle r={86} fill="#fff" stroke={C.ink} strokeWidth={8} />
        <g transform="rotate(-30) scale(0.55)">
          <path d="M-20 0 L 130 -26 L 130 -6 Z M-20 0 L 130 26 L 130 6 Z" fill="#C8D2E0" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <circle cx={-70} cy={-38} r={38} fill="none" stroke={C.tomato} strokeWidth={22} />
          <circle cx={-70} cy={38} r={38} fill="none" stroke={C.tomato} strokeWidth={22} />
        </g>
        <Txt x={60} y={-70} size={70} fill={C.tomato}>?</Txt>
      </g>
    </g>
  );
};
