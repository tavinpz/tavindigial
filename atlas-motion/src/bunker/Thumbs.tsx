import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/anton/400.css';
import './fontes';
import { Ben, Sala, Defs } from './Teste';
import { Visor, Duto, GradeSolta } from './Objetos';
import { Obj } from './Serie';

// Capas do Bunker (1280x720). Mesmo molde dos canais-modelo do formato: personagem grande e assustado de um lado,
// 2 a 3 palavras gigantes do outro (uma linha em amarelo) e a etiqueta "TEIL N". Desenho e texto próprios.
const TXT: React.FC<{ x: number; y: number; t: string; fs: number; cor?: string; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, t, fs, cor = '#fff', anchor = 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily="Anton, Impact, sans-serif" fontSize={fs} fill={cor} stroke="#000" strokeWidth={fs * 0.11} strokeLinejoin="round" paintOrder="stroke" letterSpacing={2} style={{ filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.55))' }}>{t}</text>
);
const Teil: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g transform={`translate(${x} ${y}) rotate(-3)`}>
    <rect x={-112} y={-44} width={224} height={88} rx={10} fill="#0d1313" stroke="#f4c64d" strokeWidth={7} />
    <text x={0} y={24} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={64} fill="#f4c64d" letterSpacing={3}>TEIL {n}</text>
  </g>
);
const Porta: React.FC = () => (
  <g transform="translate(1390 452)">
    <circle r={292} fill="#1c2424" /><circle r={278} fill="url(#acoEscuro)" stroke="#11191a" strokeWidth={8} />
    <circle r={240} fill="url(#aco)" stroke="#39444a" strokeWidth={10} /><circle r={186} fill="none" stroke="#56636a" strokeWidth={6} />
    {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={Math.cos((i / 16) * Math.PI * 2) * 214} cy={Math.sin((i / 16) * Math.PI * 2) * 214} r={9} fill="#47535a" stroke="#c9d3d8" strokeWidth={2} />)}
    {[0, 90, 180, 270].map((a) => <rect key={a} x={204} y={-15} width={62} height={30} rx={6} fill="#38444a" transform={`rotate(${a})`} />)}
    <circle r={94} fill="none" stroke="#c9432f" strokeWidth={20} />
    {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-8} y={-94} width={16} height={94} rx={7} fill="#b23a28" transform={`rotate(${a + 20})`} />)}
    <circle r={28} fill="#7d2a1c" stroke="#e86a53" strokeWidth={4} />
  </g>
);

export const BunkerThumb: React.FC<{ v?: string; g?: any }> = ({ v = 'a', g }) => {
  const S = 1280 / 1920;
  if (g) {
    // capa genérica dos episódios: Ben assustado à esquerda, objeto do episódio à direita, duas linhas de texto e TEIL N
    const [luz, frio] = g.n === 2 ? [0.25, 0.6] : g.n === 1 ? [0.5, 0.4] : [0.85, 0.2];
    return (
      <AbsoluteFill style={{ background: '#050808' }}>
        <svg viewBox="0 0 1280 720" width={1280} height={720}>
          <Defs />
          <g transform={`scale(${S})`}>
            <Sala luz={luz} frio={frio} frente={<g>
              <g transform={`translate(${g.o === 'filhotes' ? 1180 : g.o === 'cabo' ? 1240 : 1340} ${['relogio', 'diario', 'sol', 'visor', 'marderf', 'coracao'].includes(g.o) ? 880 : 640}) scale(1.3) translate(-1320 -640)`}><Obj o={g.o} f={40} t0={-99} p={g.p || {}} /></g>
              <Ben x={470} y={1640} k={2.75} humor={g.h || 'medo'} olhar={0.8} olharY={-0.2} fala={0.7} inclina={-4} />
            </g>} />
          </g>
          <TXT x={1230} y={140} t={g.t1} fs={g.t1.length > 10 ? 104 : 124} anchor="end" />
          <TXT x={1230} y={286} t={g.t2} fs={g.t2.length > 11 ? 112 : g.t2.length > 8 ? 132 : 150} cor="#ffd21f" anchor="end" />
          <Teil x={130} y={70} n={g.teil} />
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: '#050808' }}>
      <svg viewBox="0 0 1280 720" width={1280} height={720}>
        <Defs />
        {v === 'a' && (
          <g>
            <g transform={`scale(${S})`}>
              <Sala luz={0.7} frio={0.35} frente={<g><Visor x={1420} y={770} s={2.3} valor="2,8 %" /><Ben x={520} y={1640} k={2.75} humor="medo" olhar={0.8} olharY={-0.3} fala={0.75} inclina={-4} /></g>} />
            </g>
            <rect width={1280} height={720} fill="#ff2a1a" opacity={0.08} />
            <TXT x={1220} y={150} t="AM 5. TAG" fs={128} anchor="end" />
            <TXT x={1220} y={300} t="KEINE LUFT" fs={150} cor="#ffd21f" anchor="end" />
            <Teil x={130} y={70} n={1} />
          </g>
        )}
        {v === 'b' && (
          <g>
            <g transform={`scale(${S})`}>
              <Sala luz={0.3} frio={0.55} frente={<g><Duto x={470} y={720} s={2.5} f={7} grade={false} olhos={1} cano={false} /><GradeSolta x={760} y={980} s={1.6} rot={70} /><Ben x={1400} y={1640} k={2.75} humor="medo" olhar={-0.9} olharY={-0.2} fala={0.6} inclina={5} /></g>} />
            </g>
            <TXT x={60} y={150} t="1 JAHR IM BUNKER" fs={112} />
            <TXT x={60} y={292} t="NICHT ALLEIN" fs={150} cor="#ffd21f" />
            <Teil x={1150} y={650} n={1} />
          </g>
        )}
        {v === 'c' && (
          <g>
            <g transform={`scale(${S})`}>
              <Sala luz={0.85} frio={0.2} frente={<g><Ben x={470} y={1640} k={2.75} humor="preocupado" olhar={0.9} fala={0.5} inclina={-3} /></g>}>
                <g transform="translate(1390 452) scale(1.45) translate(-1390 -452) translate(30 110)"><Porta /></g>
              </Sala>
            </g>
            <TXT x={1230} y={150} t="365 TAGE" fs={150} anchor="end" />
            <TXT x={1230} y={292} t="EINGESPERRT" fs={132} cor="#ffd21f" anchor="end" />
            <Teil x={130} y={70} n={1} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// Marca do canal: logo 800x800 e banner 2560x1440 (área segura central de 1546x423).
export const BunkerMarca: React.FC<{ tipo?: string }> = ({ tipo = 'logo' }) => {
  if (tipo === 'logo') return (
    <AbsoluteFill style={{ background: '#0d1313' }}>
      <svg viewBox="0 0 800 800" width={800} height={800}>
        <Defs />
        <rect width={800} height={800} fill="#2f4a48" />
        <rect width={800} height={800} filter="url(#manchas)" opacity={0.5} />
        <circle cx={400} cy={400} r={372} fill="none" stroke="#f4c64d" strokeWidth={26} />
        <circle cx={400} cy={300} r={300} fill="#ffdc9e" opacity={0.35} filter="url(#brilho)" />
        <Ben x={400} y={1290} k={2.0} humor="sorriso" fala={0} />
      </svg>
    </AbsoluteFill>
  );
  const S = 2560 / 1920;
  return (
    <AbsoluteFill style={{ background: '#050808' }}>
      <svg viewBox="0 0 2560 1440" width={2560} height={1440}>
        <Defs />
        <g transform={`scale(${S})`}>
          <Sala luz={0.9} frio={0.15} frente={<g><Ben x={420} y={740} k={0.6} humor="sorriso" gesto={0.9} olhar={0.6} fala={0} /></g>} />
        </g>
        <text x={1280} y={730} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={190} fill="#fff" stroke="#000" strokeWidth={20} strokeLinejoin="round" paintOrder="stroke" letterSpacing={6}>BEN ÜBERLEBT</text>
        <text x={1280} y={840} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={60} fill="#ffd21f" stroke="#000" strokeWidth={10} strokeLinejoin="round" paintOrder="stroke" letterSpacing={4}>ÜBERLEBENSGESCHICHTEN · JEDE WOCHE EIN NEUER TEIL</text>
      </svg>
    </AbsoluteFill>
  );
};
