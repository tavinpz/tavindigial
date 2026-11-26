import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/anton/400.css';
import { Braco, P, Papel, Peao, Trofeu, Janela } from './lib';

// Two Childhoods capas v4 (26/11): molde exato do vídeo de 871 mil do Which One Are You ("Parents Who Yell vs Parents Who Ask"):
// cena de corpo inteiro (não só rosto), fundo chapado escuro (ameixa x azul-noite), AGE N pequeno no topo, seta amarela,
// e embaixo a história em 2 frases curtas: causa (branco) → consequência (vermelho). Um padrão só para o canal.
const AN = 'Anton, Impact, sans-serif';
const BASE = 930;
const Sala: React.FC<{ x: number; cor: string; cor2: string; noite?: boolean }> = ({ x, cor, cor2, noite }) => (
  <g>
    <rect x={x} y={0} width={960} height={1080} fill={cor} />
    <rect x={x} y={BASE} width={960} height={150} fill={cor2} />
    <rect x={x + 620} y={150} width={230} height={260} rx={10} fill={noite ? '#1c2a4a' : '#ffffff'} opacity={noite ? 0.9 : 0.12} />
    <path d={`M${x + 735} 150 v260 M${x + 620} 280 h230`} stroke={cor} strokeWidth={14} />
    {noite && <circle cx={x + 800} cy={210} r={26} fill="#f4e7b5" />}
  </g>
);
const Idade: React.FC<{ x: number; t: string }> = ({ x, t }) => (
  <g transform={`translate(${x} 40)`}><rect width={t.length * 52 + 50} height={110} rx={14} fill="#ffd21f" stroke="#111" strokeWidth={8} />
    <text x={(t.length * 52 + 50) / 2} y={88} textAnchor="middle" fontFamily={AN} fontSize={92} fill="#111">{t}</text></g>
);
const Frase: React.FC<{ x: number; t: string; cor: string }> = ({ x, t, cor }) => {
  const fs = Math.min(140, 900 / (t.length * 0.5));
  return <text x={x} y={1040} textAnchor="middle" fontFamily={AN} fontSize={fs} fill={cor} stroke="#111" strokeWidth={fs * 0.1} paintOrder="stroke" strokeLinejoin="round">{t}</text>;
};
const Seta: React.FC = () => (
  <g transform="translate(960 560)"><path d="M-120 -44 h110 v-56 l130 100 l-130 100 v-56 h-110 Z" fill="#ffd21f" stroke="#111" strokeWidth={12} strokeLinejoin="round" /></g>
);
const Fone: React.FC<{ x: number; y: number; t1: string; t2: string }> = ({ x, y, t1, t2 }) => (
  <g transform={`translate(${x} ${y}) rotate(-8)`}>
    <rect x={-80} y={-140} width={160} height={280} rx={24} fill="#111" />
    <rect x={-66} y={-120} width={132} height={240} rx={12} fill="#2b2f3a" />
    <text x={0} y={-10} textAnchor="middle" fontFamily={AN} fontSize={96} fill="#ff4a3d">{t1}</text>
    <text x={0} y={50} textAnchor="middle" fontFamily={AN} fontSize={38} fill="#ff4a3d">{t2}</text>
  </g>
);

type Cfg = { iE: string; iD: string; fE: string; fD: string; cena: (lado: 'e' | 'd') => React.ReactNode };
const ADULTO = '#2f6fb0', CRIANCA = P.coral;
const CFG: Record<string, Cfg> = {
  // tc001 Praised for Being Smart vs Praised for Trying
  '1': { iE: 'AGE 6', iD: 'AGE 60', fE: 'CALLED SMART.', fD: 'NEVER TRIED.', cena: (l) => l === 'e' ? (<>
    <Peao x={300} base={BASE} h={600} tipo="pai" cor={ADULTO} humor="riso" olhao olhar={[0.6, 0.3]} />
    <Braco de={[360, 640]} ate={[560, 560]} cor={ADULTO} l={34} />
    <Peao x={640} base={BASE} h={340} tipo="filho" cor={CRIANCA} humor="feliz" olhao olhar={[-0.5, -0.4]} />
    <Papel x={760} y={720} nota="A+" rot={10} larg={130} cor={P.coral} />
  </>) : (<>
    <Peao x={1420} base={BASE} h={600} tipo="sam" cor={CRIANCA} velho oculos humor="triste" olhao lagrima olhar={[0.4, 0.5]} />
    <Papel x={1700} y={760} nota="?" rot={-8} larg={150} cor={P.coral} />
  </>) },
  // tc002 Raised by Fear vs Raised by Respect
  '2': { iE: 'AGE 5', iD: 'AGE 60', fE: 'HE YELLED.', fD: 'NOW NOBODY CALLS.', cena: (l) => l === 'e' ? (<>
    <Peao x={330} base={BASE} h={640} tipo="pai" cor={ADULTO} humor="choque" olhao olhar={[0.7, 0.4]} incl={4} />
    <Braco de={[390, 650]} ate={[590, 520]} cor={ADULTO} l={34} />
    <Peao x={680} base={BASE} h={320} tipo="filho" cor={CRIANCA} humor="triste" olhao lagrima olhar={[-0.6, -0.5]} incl={-6} />
  </>) : (<>
    <Peao x={1380} base={BASE} h={600} tipo="pai" cor={ADULTO} velho oculos humor="triste" olhao olhar={[0.7, 0.4]} />
    <Fone x={1700} y={620} t1="0" t2="CALLS" />
  </>) },
  // tc003 Always Rescued vs Allowed to Fail
  '3': { iE: 'AGE 6', iD: 'AGE 30', fE: 'ALWAYS RESCUED.', fD: "CAN'T COPE.", cena: (l) => l === 'e' ? (<>
    <Peao x={320} base={BASE} h={620} tipo="pai" cor={ADULTO} humor="feliz" olhao olhar={[0.6, 0.5]} />
    <Braco de={[380, 650]} ate={[600, 700]} cor={ADULTO} l={34} />
    <Peao x={660} base={BASE} h={320} tipo="filho" cor={CRIANCA} humor="feliz" olhao olhar={[-0.6, -0.5]} />
  </>) : (<>
    <Peao x={1400} base={BASE} h={600} tipo="filho" cor={CRIANCA} humor="choque" olhao lagrima olhar={[0.6, 0.4]} />
    {[0, 1, 2].map((i) => <Papel key={i} x={1660 + i * 70} y={700 + i * 40} nota="BILL" rot={-14 + i * 12} larg={150} cor={P.coral} />)}
  </>) },
  // tc004 Paid for Every A vs Trusted to Learn
  '4': { iE: 'AGE 6', iD: 'AGE 60', fE: '$1 PER DRAWING.', fD: 'NEVER DREW AGAIN.', cena: (l) => l === 'e' ? (<>
    <Peao x={320} base={BASE} h={620} tipo="pai" cor={ADULTO} humor="feliz" olhao olhar={[0.6, 0.4]} />
    <Braco de={[380, 650]} ate={[560, 600]} cor={ADULTO} l={34} />
    <g transform="translate(560 590) rotate(-8)"><rect x={-70} y={-36} width={140} height={72} rx={8} fill="#8fd08a" stroke="#2f6b34" strokeWidth={6} /><text y={22} textAnchor="middle" fontFamily={AN} fontSize={60} fill="#2f6b34">$1</text></g>
    <Peao x={680} base={BASE} h={330} tipo="filho" cor={CRIANCA} humor="riso" olhao olhar={[-0.6, -0.5]} />
  </>) : (<>
    <Peao x={1400} base={BASE} h={600} tipo="filho" cor={CRIANCA} velho oculos humor="triste" olhao olhar={[0.6, 0.5]} />
    <Papel x={1700} y={740} nota="" rot={-8} larg={180} />
  </>) },
  // tc005 Loved for Winning vs Loved Anyway
  '5': { iE: 'AGE 6', iD: 'AGE 60', fE: 'LOVED IF HE WON.', fD: 'NEVER ENOUGH.', cena: (l) => l === 'e' ? (<>
    <Peao x={300} base={BASE} h={620} tipo="pai" cor={ADULTO} humor="riso" olhao olhar={[0.6, 0.4]} />
    <Peao x={650} base={BASE} h={330} tipo="filho" cor={CRIANCA} humor="feliz" olhao olhar={[-0.6, -0.5]} />
    <g transform="translate(780 700) scale(2.4)"><Trofeu x={0} lado="a" /></g>
  </>) : (<>
    <Peao x={1400} base={BASE} h={600} tipo="filho" cor={CRIANCA} velho oculos humor="triste" olhao lagrima olhar={[0.6, 0.5]} />
    <g transform="translate(1700 850) scale(2.4)" opacity={0.85}><Trofeu x={0} lado="a" /></g>
    <g transform="translate(1800 860) scale(2)" opacity={0.85}><Trofeu x={0} lado="a" /></g>
  </>) },
};

export const TCThumbV4: React.FC<{ v?: string }> = ({ v = '1' }) => {
  const c = CFG[v] || CFG['1'];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg viewBox="0 0 1920 1080" width={1280} height={720}>
        <defs>
          <clipPath id="cE"><rect width={960} height={1080} /></clipPath><clipPath id="cD"><rect x={960} width={960} height={1080} /></clipPath>
          <linearGradient id="bx" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></linearGradient>
        </defs>
        <Sala x={0} cor="#7a2f4c" cor2="#5e2239" />
        <Sala x={960} cor="#252848" cor2="#1a1c36" noite />
        <g clipPath="url(#cE)">{c.cena('e')}</g>
        <g clipPath="url(#cD)">{c.cena('d')}</g>
        <rect width={1920} height={1080} fill="url(#bx)" />
        <rect x={954} width={12} height={1080} fill="#111" />
        <Idade x={40} t={c.iE} /><Idade x={1000} t={c.iD} />
        <Seta />
        <Frase x={480} t={c.fE} cor="#ffffff" /><Frase x={1440} t={c.fD} cor="#ff4a3d" />
      </svg>
    </AbsoluteFill>
  );
};
