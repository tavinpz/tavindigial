import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/anton/400.css';
import './fontes';
import { Ben, Sala, Defs } from './Teste';
import { Visor, Bateria, Marder, Garrafa, Barris, Saco, Duto } from './Objetos';

// Capas v2 do Ben überlebt (26/11). Modeladas nos vencedores do formato (Galactic Highway "Bunker Survival 1 Year" 2,2 mi;
// Leo no Fim do Mundo "1 ANO" 757 mil): fundo claro, personagem grande, 1 a 2 palavras gigantes pretas, número da parte enorme.
const S = 1280 / 1920;
const AN = 'Anton, Impact, sans-serif';
const T: React.FC<{ x: number; y: number; t: string; fs: number; cor?: string; borda?: string; anchor?: 'start' | 'middle' | 'end'; sw?: number }> = ({ x, y, t, fs, cor = '#111', borda, anchor = 'end', sw }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={AN} fontSize={fs} fill={cor} stroke={borda || 'none'} strokeWidth={borda ? (sw ?? fs * 0.09) : 0} strokeLinejoin="round" paintOrder="stroke" letterSpacing={1}>{t}</text>
);

// Exterior: campo claro com a escotilha aberta e o Ben saindo dela.
const Campo: React.FC<{ children?: React.ReactNode; tarde?: boolean }> = ({ children, tarde }) => (
  <g>
    <defs>
      <linearGradient id="ceu2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={tarde ? '#f3c98b' : '#bfe2f8'} /><stop offset="1" stopColor={tarde ? '#fbe9cf' : '#f2f9ff'} />
      </linearGradient>
      <linearGradient id="grama2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8cc063" /><stop offset="1" stopColor="#4f8a3e" />
      </linearGradient>
      <radialGradient id="sol2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff7d6" /><stop offset="0.35" stopColor="#ffe9a3" stopOpacity="0.8" /><stop offset="1" stopColor="#ffe9a3" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#ceu2)" />
    <circle cx={1560} cy={560} r={300} fill="url(#sol2)" />
    <path d="M0 690 Q300 610 640 660 T1300 640 T1920 650 V760 H0 Z" fill="#a7cf8a" />
    <path d="M0 720 Q500 680 960 710 T1920 700 V1080 H0 Z" fill="url(#grama2)" />
    {Array.from({ length: 60 }).map((_, i) => {
      const x = (i * 211) % 1920, y = 760 + ((i * 97) % 300);
      return <path key={i} d={`M${x} ${y} l6 -22 l6 22 l6 -16 l5 16`} stroke="#3f7432" strokeWidth={4} fill="none" opacity={0.6} />;
    })}
    {children}
  </g>
);
const Tampa: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-12)`}>
    <ellipse cx={14} cy={18} rx={170} ry={262} fill="#000" opacity={0.25} />
    <ellipse rx={170} ry={262} fill="url(#acoEscuro)" stroke="#20292b" strokeWidth={10} />
    <ellipse rx={140} ry={222} fill="url(#aco)" stroke="#3b4649" strokeWidth={8} />
    <ellipse rx={66} ry={104} fill="none" stroke="#c9432f" strokeWidth={16} />
    {[0, 60, 120].map((a) => <rect key={a} x={-7} y={-104} width={14} height={208} rx={7} fill="#b23a28" transform={`scale(0.64 1) rotate(${a})`} />)}
    <circle r={18} fill="#7d2a1c" />
  </g>
);
const Luke: React.FC<{ x: number; y: number; ben: React.ReactNode }> = ({ x, y, ben }) => (
  <g>
    <ellipse cx={x} cy={y} rx={340} ry={100} fill="#8d9799" stroke="#4d5759" strokeWidth={8} />
    <ellipse cx={x} cy={y} rx={276} ry={74} fill="#0d1112" />
    <clipPath id="acimaLuke"><path d={`M0 0 H1920 V${y} H${x + 276} A276 74 0 0 1 ${x - 276} ${y} H0 Z`} /></clipPath>
    <g clipPath="url(#acimaLuke)">{ben}</g>
    <path d={`M${x - 276} ${y} A276 74 0 0 0 ${x + 276} ${y}`} stroke="#6e787a" strokeWidth={14} fill="none" />
  </g>
);
const Teil: React.FC<{ n: number; x: number; y: number; claro?: boolean }> = ({ n, x, y, claro }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-128} y={-50} width={256} height={100} rx={12} fill={claro ? '#111' : '#ffd21f'} />
    <text y={34} textAnchor="middle" fontFamily={AN} fontSize={80} fill={claro ? '#ffd21f' : '#111'} letterSpacing={3}>TEIL {n}</text>
  </g>
);

// Interior claro: sala do bunker com luz cheia + objeto do episódio grande.
const Dentro: React.FC<{ escuro?: number; children: React.ReactNode }> = ({ escuro = 0, children }) => (
  <g>
    <Sala luz={1} frio={escuro} frente={children} />
    <rect width={1920} height={1080} fill="#fff4dc" opacity={escuro ? 0.06 : 0.2} style={{ mixBlendMode: 'screen' }} />
  </g>
);

const Foco: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    <ellipse cx={1380} cy={860} rx={420} ry={300} fill="#ffe2ad" opacity={0.28} filter="url(#brilho)" />
    <g transform="translate(1380 1000) scale(1.35) translate(-1420 -900)">{children}</g>
  </g>
);

const CFG: Record<string, () => React.ReactElement> = {
  // TEIL 1 — capa principal: a escotilha (o "1 YEAR" do vencedor)
  '1a': () => (<>
    <g transform={`scale(${S})`}><Campo>
      <Tampa x={250} y={760} s={0.95} />
      <Luke x={560} y={950} ben={<Ben x={560} y={1450} k={2.05} humor="preocupado" olhar={0.7} olharY={-0.1} fala={0.15} />} />
    </Campo></g>
    <T x={1250} y={260} t="1 JAHR" fs={270} />
    <T x={1246} y={360} t="IM BUNKER" fs={92} cor="#e0231b" />
    <Teil n={1} x={1110} y={640} claro />
  </>),
  // TEIL 1 — alternativa: o perigo do episódio (falta de ar)
  '1b': () => (<>
    <g transform={`scale(${S})`}><Dentro><Foco>
      <Visor x={1420} y={700} s={2.6} valor="2,8 %" /></Foco>
      <Ben x={480} y={1420} k={2.25} humor="medo" olhar={0.8} olharY={-0.3} fala={0.8} inclina={-4} />
    </Dentro></g>
    <rect width={1280} height={720} fill="#ff2a1a" opacity={0.1} />
    <T x={1250} y={180} t="TAG 5" fs={170} cor="#fff" borda="#000" />
    <T x={1250} y={300} t="KEINE LUFT" fs={120} cor="#ffd21f" borda="#000" />
    <Teil n={1} x={150} y={70} />
  </>),
  '2a': () => (<>
    <g transform={`scale(${S})`}><Dentro escuro={0.62}><Foco>
      <Bateria x={1400} y={900} s={2.4} nivel={0.02} f={0} /></Foco>
      <Ben x={480} y={1420} k={2.25} humor="medo" olhar={0.85} olharY={0.1} fala={0.7} inclina={-3} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 2" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="LICHT AUS" fs={120} cor="#ffd21f" borda="#000" />
  </>),
  '2b': () => (<>
    <g transform={`scale(${S})`}><Dentro><Foco>
      <Saco x={1270} y={880} s={2.2} t="REIS" />
      <Marder x={1500} y={900} k={2.3} come={1} flip /></Foco>
      <Ben x={470} y={1420} k={2.25} humor="medo" olhar={0.9} fala={0.9} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 2" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="ER FRISST ALLES" fs={104} cor="#ffd21f" borda="#000" />
  </>),
  '3a': () => (<>
    <g transform={`scale(${S})`}><Dentro><Foco>
      <g transform="translate(1380 880) scale(1.25) translate(-1500 -870)"><Barris /></g>
      <ellipse cx={1420} cy={960} rx={330} ry={40} fill="#4aa3e0" opacity={0.6} /></Foco>
      <Ben x={470} y={1420} k={2.25} humor="medo" olhar={0.9} olharY={0.3} fala={0.8} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 3" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="WASSER WEG" fs={120} cor="#ffd21f" borda="#000" />
  </>),
  '3b': () => (<>
    <g transform={`scale(${S})`}><Dentro><Foco>
      <Garrafa x={1430} y={920} s={4.2} /></Foco>
      <Ben x={470} y={1420} k={2.25} humor="preocupado" olhar={0.9} fala={0.3} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 3" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="NUR 2,6 LITER" fs={112} cor="#ffd21f" borda="#000" />
  </>),
  '4a': () => (<>
    <g transform={`scale(${S})`}><Dentro escuro={0.45}><Foco>
      <g transform="translate(1420 720)">
        <circle r={250} fill="#f4efe4" stroke="#2b3433" strokeWidth={22} />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-6} y={-226} width={12} height={36} rx={5} fill="#2b3433" transform={`rotate(${i * 30})`} />)}
        <rect x={-10} y={-180} width={20} height={190} rx={8} fill="#c9432f" />
        <rect x={-8} y={-130} width={16} height={140} rx={7} fill="#2b3433" transform="rotate(120)" />
        <circle r={20} fill="#2b3433" />
      </g></Foco>
      <Ben x={470} y={1420} k={2.25} humor="medo" olhar={0.9} olharY={-0.2} fala={0.6} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 4" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="3 TAGE WEG?" fs={120} cor="#ffd21f" borda="#000" />
  </>),
  '4b': () => (<>
    <g transform={`scale(${S})`}><Dentro escuro={0.45}><Foco>
      <g transform="translate(1420 720)">
        <rect x={-240} y={-200} width={480} height={360} rx={16} fill="#e9e2cf" stroke="#2b3433" strokeWidth={14} />
        {[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3, 4].map((c) => <path key={`${r}${c}`} d={`M${-200 + c * 82} ${-150 + r * 52} v38 m14 -38 v38 m14 -38 v38 m14 -38 v38 m-58 -6 l64 -26`} stroke="#2b3433" strokeWidth={5} opacity={r * 5 + c < 28 ? 1 : 0} />))}
        <text x={150} y={150} textAnchor="middle" fontFamily={AN} fontSize={90} fill="#c9432f">?</text>
      </g></Foco>
      <Ben x={470} y={1420} k={2.25} humor="preocupado" olhar={0.9} fala={0.4} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 4" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="TAG 31 ODER 28?" fs={100} cor="#ffd21f" borda="#000" />
  </>),
  '5a': () => (<>
    <g transform={`scale(${S})`}><Dentro><Foco>
      <Saco x={1260} y={900} s={2.3} t="REIS" /><Saco x={1560} y={910} s={2.3} t="REIS" />
      {Array.from({ length: 26 }).map((_, i) => <circle key={i} cx={1180 + ((i * 137) % 480)} cy={700 + ((i * 71) % 200)} r={10 + (i % 4) * 7} fill="#3d6b2f" opacity={0.8} />)}</Foco>
      <Ben x={470} y={1420} k={2.25} humor="medo" olhar={0.9} olharY={0.2} fala={0.8} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 5" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="SCHIMMEL" fs={130} cor="#ffd21f" borda="#000" />
  </>),
  '5b': () => (<>
    <g transform={`scale(${S})`}><Dentro><Foco>
      <Marder x={1250} y={900} k={1.7} />
      {[0, 1, 2, 3].map((i) => <Marder key={i} x={1460 + i * 120} y={915} k={0.6} flip={i % 2 === 1} />)}</Foco>
      <Ben x={470} y={1420} k={2.25} humor="medo" olhar={0.9} olharY={0.2} fala={0.9} inclina={-4} />
    </Dentro></g>
    <T x={1250} y={190} t="TEIL 5" fs={190} cor="#fff" borda="#000" />
    <T x={1250} y={310} t="WIR SIND ZU FÜNFT" fs={92} cor="#ffd21f" borda="#000" />
  </>),
};

export const BunkerThumbV2: React.FC<{ v?: string }> = ({ v = '1a' }) => (
  <AbsoluteFill style={{ background: '#050808' }}>
    <svg viewBox="0 0 1280 720" width={1280} height={720}>
      <Defs />
      {(CFG[v] || CFG['1a'])()}
    </svg>
  </AbsoluteFill>
);
