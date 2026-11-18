import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ALTURA, Balao, Carimbo, Fundo, MEIO, P, Partido, Peao, SANS, SLAB, Trofeu, tema, Lado } from './lib';

// Two Childhoods: thumbnails (1280x720, desenhadas em 1920x1080 e reduzidas). v = a | b | c
const Par: React.FC<{ l: Lado; x: number; idade: number; triste?: boolean; h?: number }> = ({ l, x, idade, triste, h }) => {
  const t = tema(l);
  return <Peao x={x} base={980} h={h || ALTURA[idade] * 1.9} cor={t.tinta} olho={t.fundo} olhar={triste ? [0.1, 0.9] : [0.2, -0.5]} incl={triste ? -4 : 3} oculos={idade >= 60} />;
};
const A: React.FC = () => (
  <>
    <Fundo chao={false} />
    <Par l="a" x={300} idade={6} h={430} /><Par l="b" x={MEIO + 660} idade={6} h={430} />
    <g transform="translate(40 -40) scale(1.75) translate(-150 -60)"><Balao x={520} y={318} linhas={["YOU'RE SO", 'SMART!']} ponta={[330, 470]} tam={50} dest={['SMART']} /></g>
    <g transform={`translate(${MEIO - 110} -40) scale(1.75) translate(-150 -60)`}><Balao x={450} y={318} linhas={['YOU WORKED', 'HARD!']} ponta={[640, 470]} tam={50} dest={['WORKED', 'HARD']} /></g>
    <rect x={MEIO - 400} y={850} width={720} height={150} rx={36} fill={P.creme} /><text x={MEIO - 50} y={956} textAnchor="end" fontFamily={SLAB} fontSize={92} fill={P.mar}>AGE 6</text><text x={MEIO + 90} y={956} fontFamily={SLAB} fontSize={92} fill={P.mar}>60</text>
    <path d={`M ${MEIO - 22} 924 l 76 0 m -28 -26 l 28 26 l -28 26`} fill="none" stroke={P.coral} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
  </>
);
const B: React.FC = () => (
  <>
    <Fundo chao={false} />
    <Partido esq="SMART" dir="TRYING" y={320} tam={196} folga={0.16} />
    <text x={MEIO - 40} y={110} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={56} fill={P.mar} letterSpacing={8}>PRAISED FOR BEING</text>
    <text x={MEIO + 40} y={110} fontFamily={SANS} fontWeight={900} fontSize={56} fill={P.amb} letterSpacing={8}>PRAISED FOR</text>
    <Par l="a" x={300} idade={60} h={560} triste /><Par l="b" x={MEIO + 480} idade={60} h={560} />
    <g transform="translate(690 980) scale(1.9)"><Trofeu x={0} lado="a" /><Trofeu x={64} lado="a" /></g>
    <Carimbo x={520} y={640} txt="STILL AFRAID" tam={62} rot={-6} />
    <Carimbo x={MEIO + 470} y={640} txt="STILL LEARNING" cor={P.mar} tam={58} rot={5} />
  </>
);
const C: React.FC = () => (
  <>
    <Fundo chao={false} />
    <g transform="translate(-330 -210) scale(1.55)"><Balao x={520} y={300} linhas={["“YOU'RE SO", 'SMART.”']} ponta={[640, 520]} tam={58} dest={['SMART']} /></g>
    <Par l="a" x={230} idade={6} h={300} /><Par l="a" x={680} idade={60} h={470} triste />
    <path d="M 370 850 L 480 850 M 450 820 L 482 850 L 450 880" fill="none" stroke={P.mar} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
    <text x={MEIO + 70} y={420} fontFamily={SLAB} fontSize={150} fill={P.amb}>50 YEARS</text>
    <text x={MEIO + 70} y={590} fontFamily={SLAB} fontSize={150} fill={P.creme}>LATER</text>
    <Carimbo x={MEIO + 400} y={800} txt="STILL AFRAID" tam={70} rot={-4} />
  </>
);
export const TCThumb: React.FC<{ v?: string }> = ({ v = 'a' }) => (
  <AbsoluteFill style={{ background: P.mar }}>
    <svg width={1280} height={720} viewBox="0 0 1920 1080">{v === 'a' ? <A /> : v === 'b' ? <B /> : <C />}</svg>
  </AbsoluteFill>
);
