import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ALTURA, Aviso, Balao, Braco, Carimbo, CHAO, Fundo, H, Idade, Janela, Lado, Legenda, Livros, Luminaria, MEIO, Mesa, MONO, P, Papel, Partido, Peao, Prateleira, SANS, SLAB, tema, Topo, Trocado, Trofeu, W } from './lib';

// Two Childhoods: imagens paradas do padrão visual (para aprovação antes de qualquer vídeo).
// k = a (cena idade 6) | b (cartão de capítulo) | c (cena idade 30) | d (cartão do estudo) | e (a vida inteira, lado a lado)

const Casa: React.FC<{ lado: Lado; children: React.ReactNode }> = ({ lado, children }) => <g transform={`translate(${lado === 'a' ? 0 : MEIO} 0)`}>{children}</g>;

// A — idade 6: a mesma nota, dois elogios
const CenaA: React.FC = () => (
  <>
    <Fundo />
    {(['a', 'b'] as Lado[]).map((l) => {
      const t = tema(l);
      return (
        <Casa key={l} lado={l}>
          <Janela x={640} y={300} lado={l} />
          <Prateleira x={90} y={470} lado={l} larg={230}><Livros x={20} lado={l} n={4} /></Prateleira>
          <Mesa x={80} lado={l} larg={250} /><Luminaria x={130} lado={l} />
          {/* mãe/pai (claro, contorno) e a criança (cheia) */}
          <Peao x={610} h={350} cor={t.claro} contorno={t.tinta} olho={t.tinta} olhar={[-0.9, 0.5]} incl={-3} />
          <Peao x={410} h={ALTURA[6]} cor={t.tinta} olho={t.fundo} olhar={[0.8, -0.7]} incl={l === 'a' ? 0 : 2} />
          <Braco de={[430, CHAO - 108]} ate={[478, CHAO - 150]} cor={t.tinta} />
          <Papel x={500} y={CHAO - 186} nota="10" rot={8} larg={84} />
        </Casa>
      );
    })}
    <Balao x={520} y={318} linhas={["YOU'RE SO", 'SMART!']} ponta={[608, 470]} tam={46} dest={['SMART']} />
    <Balao x={MEIO + 500} y={318} linhas={['YOU WORKED', 'HARD ON THIS!']} ponta={[MEIO + 608, 470]} tam={46} dest={['WORKED', 'HARD']} />
    <Topo lado="a" titulo="“You're so smart.”" />
    <Topo lado="b" titulo="“You worked hard.”" />
    <Idade n={6} />
    <Legenda txt="Same kid. Same perfect score. One different sentence." dest={['sentence']} />
    <Aviso />
  </>
);

// B — cartão de capítulo: idade gigante com a cor trocada na emenda + linha da vida com os peões
const Linha: React.FC<{ atual: number; y: number }> = ({ atual, y }) => (
  <g>
    {[6, 16, 30, 60].map((n, i) => (
      (['a', 'b'] as Lado[]).map((l) => {
        const t = tema(l), x = (l === 'a' ? 250 : MEIO + 230) + i * 160, h = ALTURA[n] * 0.42, on = n === atual;
        return (
          <g key={l + n} opacity={on ? 1 : 0.38}>
            <Peao x={x} base={y} h={h} cor={t.tinta} />
            <text x={x} y={y + 40} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={26} fill={t.tinta}>{n}</text>
            {on && <rect x={x - 40} y={y + 54} width={80} height={8} rx={4} fill={t.tinta} />}
          </g>
        );
      })
    ))}
  </g>
);
const CenaB: React.FC = () => (
  <>
    <Fundo chao={false} />
    <Partido esq="CHAPTER" dir="TWO" y={250} tam={40} fam={SANS} peso={900} esp={16} folga={0.5} />
    <Partido esq="AGE" dir="16" y={560} tam={330} />
    <rect x={MEIO - 400} y={636} width={800} height={92} rx={20} fill={P.creme} />
    <text x={MEIO} y={700} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52} fill={P.mar} letterSpacing={5}>THE FIRST HARD CLASS</text>
    <Linha atual={16} y={930} />
  </>
);

// C — idade 30: a promoção difícil
const CenaC: React.FC = () => (
  <>
    <Fundo />
    {(['a', 'b'] as Lado[]).map((l) => {
      const t = tema(l), a = l === 'a';
      return (
        <Casa key={l} lado={l}>
          <Janela x={690} y={250} lado={l} noite />
          <Prateleira x={385} y={500} lado={l} larg={270}>
            {a ? <><Trofeu x={46} lado={l} /><Trofeu x={124} lado={l} /><Livros x={190} lado={l} n={2} /></> : <><Livros x={14} lado={l} n={5} /><Trofeu x={176} lado={l} /><Papel x={236} y={-40} nota="C" rot={5} larg={50} cor={P.coral} /></>}
          </Prateleira>
          <Mesa x={350} lado={l} larg={330} />
          {/* notebook */}
          <rect x={445} y={CHAO - 250} width={140} height={92} rx={8} fill={t.claro} stroke={t.tinta} strokeWidth={7} /><rect x={425} y={CHAO - 160} width={180} height={10} rx={5} fill={t.tinta} />
          <Peao x={230} h={ALTURA[30]} cor={t.tinta} olho={t.fundo} olhar={a ? [0.5, 0.9] : [0.9, -0.2]} incl={a ? -5 : 4} />
        </Casa>
      );
    })}
    <Balao x={330} y={330} linhas={["WHAT IF I'M NOT", 'SMART ENOUGH?']} ponta={[150, 470]} tam={38} pensa dest={['NOT']} />
    <Balao x={MEIO + 340} y={330} linhas={["I DON'T KNOW HOW", "YET. I'LL LEARN."]} ponta={[MEIO + 150, 470]} tam={38} pensa />
    <Carimbo x={515} y={735} txt="TURNED DOWN" tam={30} />
    <Carimbo x={MEIO + 515} y={735} txt="ACCEPTED" cor={P.mar} tam={30} rot={7} />
    <Topo lado="a" titulo="“You're so smart.”" conta={{ rot: 'HARD THINGS TRIED', n: 1 }} />
    <Topo lado="b" titulo="“You worked hard.”" conta={{ rot: 'HARD THINGS TRIED', n: 7 }} />
    <Idade n={30} />
    <Legenda txt="The harder job comes up. Only one of them takes it." dest={['one']} />
    <Aviso />
  </>
);

// D — cartão do estudo: fundo creme (quebra o padrão de propósito: aqui é pesquisa real, não história)
const Fila: React.FC<{ y: number; n: number; cor: string; rot: string; pct: string }> = ({ y, n, cor, rot, pct }) => (
  <g>
    <text x={1010} y={y - 96} fontFamily={SANS} fontWeight={800} fontSize={26} fill={P.mar} letterSpacing={3}>{rot}</text>
    {Array.from({ length: 12 }).map((_, i) => <Peao key={i} x={1030 + i * 50} base={y} h={74} cor={i < n ? cor : '#E4D8C2'} />)}
    <text x={1840} y={y - 4} textAnchor="end" fontFamily={SLAB} fontSize={92} fill={cor}>{pct}</text>
  </g>
);
const CenaD: React.FC = () => (
  <>
    <rect x={0} y={0} width={W} height={H} fill={P.creme} />
    <rect x={0} y={0} width={28} height={H / 2} fill={P.amb} /><rect x={0} y={H / 2} width={28} height={H / 2} fill={P.mar} />
    <rect x={110} y={120} width={250} height={62} rx={12} fill={P.mar} />
    <text x={235} y={163} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill={P.amb} letterSpacing={6}>THE STUDY</text>
    {['Praise for Intelligence', 'Can Undermine', "Children's Motivation", 'and Performance'].map((s, i) => <text key={i} x={110} y={290 + i * 84} fontFamily={SLAB} fontSize={68} fill={P.mar}>{s}</text>)}
    <rect x={110} y={610} width={120} height={8} rx={4} fill={P.amb} />
    <text x={110} y={680} fontFamily={SANS} fontWeight={800} fontSize={34} fill={P.mar}>Mueller &amp; Dweck · 1998</text>
    <text x={110} y={730} fontFamily={SANS} fontWeight={500} fontSize={28} fill={P.mar} opacity={0.8}>Journal of Personality and Social Psychology</text>
    <text x={110} y={776} fontFamily={SANS} fontWeight={500} fontSize={28} fill={P.mar} opacity={0.8}>128 fifth graders · Study 1 of 6</text>
    <path d="M 950 150 L 950 800" stroke={P.mar} strokeWidth={4} opacity={0.15} />
    <text x={1010} y={196} fontFamily={SANS} fontWeight={900} fontSize={38} fill={P.mar}>Picked the task that makes</text>
    <text x={1010} y={246} fontFamily={SANS} fontWeight={900} fontSize={38} fill={P.mar}>them look smart:</text>
    <Fila y={470} n={8} cor={P.coral} rot="TOLD “YOU MUST BE SMART”" pct="67%" />
    <Fila y={720} n={1} cor={P.mar} rot="TOLD “YOU MUST HAVE WORKED HARD”" pct="8%" />
    <text x={110} y={868} fontFamily={MONO} fontWeight={700} fontSize={20} fill={P.mar} letterSpacing={2} opacity={0.6}>REAL STUDY · FULL SOURCE IN THE DESCRIPTION</text>
    <Legenda txt="Two out of three chose to look smart." dest={['two', 'three']} />
  </>
);

// E — a vida inteira, lado a lado
const VIDA: [number, string, string][] = [[6, '“You\'re so smart.”', '“You worked hard.”'], [16, 'Drops the hard class.', 'Fails. Signs up again.'], [30, 'Stays where it\'s safe.', 'Takes the harder job.'], [60, 'Still wonders.', 'Still learning.']];
const CenaE: React.FC = () => (
  <>
    <Fundo chao={false} />
    <Partido esq="THE WHOLE LIFE," dir="SIDE BY SIDE" y={130} tam={64} folga={0.3} />
    {VIDA.map(([n, ea, eb], i) => {
      const y = 330 + i * 190;
      return (
        <g key={n}>
          <Peao x={MEIO - 150} base={y + 20} h={ALTURA[n] * 0.44} cor={P.mar} olho={P.amb} olhar={[0, 0.4]} oculos={n === 60} />
          <Peao x={MEIO + 150} base={y + 20} h={ALTURA[n] * 0.44} cor={P.amb} olho={P.mar} olhar={[0, -0.2]} oculos={n === 60} />
          <text x={MEIO - 250} y={y - 16} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={46} fill={P.mar}>{ea}</text>
          <text x={MEIO + 250} y={y - 16} textAnchor="start" fontFamily={SANS} fontWeight={800} fontSize={46} fill={P.amb}>{eb}</text>
          <circle cx={MEIO} cy={y - 34} r={46} fill={P.creme} /><text x={MEIO} y={y - 17} textAnchor="middle" fontFamily={SLAB} fontSize={44} fill={P.mar}>{n}</text>
        </g>
      );
    })}
    <Aviso />
  </>
);

export const TCStill: React.FC<{ k?: string }> = ({ k = 'a' }) => (
  <AbsoluteFill style={{ background: P.mar }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {k === 'a' ? <CenaA /> : k === 'b' ? <CenaB /> : k === 'c' ? <CenaC /> : k === 'd' ? <CenaD /> : <CenaE />}
    </svg>
  </AbsoluteFill>
);
