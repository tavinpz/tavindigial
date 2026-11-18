import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Balao, Braco, Carimbo, CHAO, Fundo, Janela, Livros, MEIO, Mesa, P, Papel, Peao, Planta, Prateleira, SANS, SLAB, Tapete, Trofeu } from './lib';

// Two Childhoods: thumbnails (1280x720, desenhadas em 1920x1080). v = a | b | c
// Fórmula do que já deu certo no nicho (capa do vídeo-modelo com 174 mil views): etiqueta AGE 6 → AGE 60, causa à esquerda,
// consequência à direita, uma frase curta embaixo de cada lado, uma palavra em cor de alerta.
const Tag: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
  <g><rect x={x + 8} y={y + 10} width={t.length * 62 + 60} height={130} rx={18} fill="#000" opacity={0.3} /><rect x={x} y={y} width={t.length * 62 + 60} height={130} rx={18} fill={P.ouro} stroke={P.mar} strokeWidth={8} /><text x={x + 30} y={y + 98} fontFamily={SLAB} fontSize={96} fill={P.mar}>{t}</text></g>
);
const Frase: React.FC<{ x: number; y: number; t: string; cor?: string; tam?: number; anc?: string }> = ({ x, y, t, cor = '#FFFFFF', tam = 118, anc = 'middle' }) => (
  <text x={x} y={y} textAnchor={anc as any} fontFamily={SANS} fontWeight={900} fontSize={tam} fill={cor} stroke={P.mar} strokeWidth={tam * 0.13} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-1}>{t}</text>
);
const Seta: React.FC<{ y: number }> = ({ y }) => (
  <g><path d={`M ${MEIO - 96} ${y - 34} l 96 0 l 0 -44 l 100 78 l -100 78 l 0 -44 l -96 0 Z`} fill={P.ouro} stroke={P.mar} strokeWidth={10} strokeLinejoin="round" /></g>
);
const Casa6: React.FC<{ l: 'a' | 'b'; fala?: string[] }> = ({ l, fala }) => (
  <g transform={`translate(${l === 'a' ? 0 : MEIO} 0)`}>
    <Janela x={640} y={250} lado={l} /><Tapete x={500} larg={470} lado={l} />
    <Peao x={640} h={470} tipo="pai" coque={l === 'a'} cor={l === 'a' ? '#3E9A78' : P.roxo} humor="feliz" olhar={[-0.9, 0.5]} incl={-3} />
    <Peao x={360} h={270} tipo="sam" cor={P.coral} humor="feliz" olhar={[0.8, -0.7]} />
    <Braco de={[390, CHAO - 150]} ate={[452, CHAO - 205]} cor={P.coral} l={20} /><Papel x={480} y={CHAO - 250} nota="10" rot={8} larg={110} />
    {fala && <g transform="translate(-10 30) scale(1.12)"><Balao x={290} y={330} linhas={fala} ponta={[560, 420]} tam={58} dest={['SMART', 'HARD']} /></g>}
  </g>
);
const Casa60: React.FC<{ l: 'a' | 'b'; feliz?: boolean; x?: number }> = ({ l, feliz, x = 470 }) => (
  <g transform={`translate(${l === 'a' ? 0 : MEIO} 0)`}>
    <Janela x={650} y={250} lado={l} noite /><Tapete x={x} larg={470} lado={l} />
    <Prateleira x={60} y={470} lado={l} larg={300}>{feliz ? <><Livros x={20} lado={l} n={5} /><Trofeu x={220} lado={l} /></> : <><Trofeu x={60} lado={l} /><Trofeu x={140} lado={l} /><Trofeu x={220} lado={l} /></>}</Prateleira>
    <Peao x={x} h={520} tipo="sam" cor={P.coral} velho oculos humor={feliz ? 'feliz' : 'triste'} olhar={feliz ? [0.3, -0.3] : [0.1, 0.9]} incl={feliz ? 3 : -4} />
  </g>
);
const A: React.FC = () => (
  <>
    <Fundo /><Casa6 l="a" fala={["YOU'RE SO", 'SMART!']} /><Casa60 l="b" x={700} />
    <g transform="translate(40 40) scale(1.1)"><Balao x={MEIO + 230} y={300} linhas={["WHAT IF", "I FAIL?"]} ponta={[MEIO + 520, 440]} tam={58} pensa dest={['FAIL']} /></g>
    <Tag x={40} y={36} t="AGE 6" /><Tag x={MEIO + 44} y={36} t="AGE 60" /><Seta y={520} />
    <Frase x={480} y={1010} t="CALLED SMART." tam={104} /><Frase x={MEIO + 480} y={1010} t="AFRAID TO TRY." cor="#FF6B55" tam={104} />
  </>
);
const B: React.FC = () => (
  <>
    <Fundo /><Casa60 l="a" /><Casa60 l="b" feliz />
    <g transform={`translate(${MEIO + 770} ${CHAO}) rotate(-14)`}><rect x={-9} y={-330} width={18} height={190} rx={6} fill={P.madeiraEsc} /><ellipse cx={0} cy={-150} rx={50} ry={46} fill="#D98A3A" /><ellipse cx={0} cy={-74} rx={68} ry={66} fill="#D98A3A" /><circle cx={0} cy={-96} r={20} fill="#3B2A20" /></g>
    <Frase x={MEIO} y={150} t="WHO KEPT TRYING?" tam={124} cor={P.ouro} />
    <circle cx={MEIO + 8} cy={552} r={170} fill="#000" opacity={0.3} /><circle cx={MEIO} cy={540} r={170} fill={P.mar} stroke={P.ouro} strokeWidth={12} />
    <text x={MEIO - 22} y={580} textAnchor="end" fontFamily={SLAB} fontSize={150} fill="#FF6B55">1</text><text x={MEIO + 14} y={580} fontFamily={SLAB} fontSize={150} fill={P.ouro}>10</text>
    <text x={MEIO} y={650} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#FFFFFF" letterSpacing={3}>HARD THINGS TRIED</text>
    <Frase x={480} y={1010} t="“SO SMART”" tam={104} /><Frase x={MEIO + 480} y={1010} t="“WORKED HARD”" tam={98} />
  </>
);
const C: React.FC = () => (
  <>
    <Fundo /><Casa6 l="a" fala={["YOU'RE SO", 'SMART!']} />
    <g transform={`translate(${MEIO} 0)`}>
      <Janela x={650} y={250} lado="b" noite /><Tapete x={380} larg={470} lado="b" /><Planta x={890} />
      <Mesa x={470} lado="b" larg={360} />
      <rect x={560} y={CHAO - 290} width={190} height={130} rx={10} fill="#39424F" /><rect x={571} y={CHAO - 279} width={168} height={106} rx={4} fill="#FFFFFF" /><text x={655} y={CHAO - 216} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={26} fill={P.mar}>NEW ROLE</text><rect x={530} y={CHAO - 162} width={250} height={14} rx={7} fill="#8894A3" />
      <Peao x={300} h={520} tipo="sam" cor={P.coral} humor="triste" olhar={[0.2, 0.9]} incl={-5} />
      <Carimbo x={640} y={640} txt="TURNED DOWN" tam={60} rot={-8} />
    </g>
        <Tag x={40} y={36} t="AGE 6" /><Tag x={MEIO + 44} y={36} t="AGE 30" /><Seta y={520} />
    <Frase x={480} y={1010} t="“GIFTED” KID." tam={104} /><Frase x={MEIO + 480} y={1010} t="SCARED ADULT." cor="#FF6B55" tam={104} />
  </>
);
export const TCThumb: React.FC<{ v?: string }> = ({ v = 'a' }) => (
  <AbsoluteFill style={{ background: P.mar }}>
    <svg width={1280} height={720} viewBox="0 0 1920 1080">{v === 'a' ? <A /> : v === 'b' ? <B /> : <C />}</svg>
  </AbsoluteFill>
);
