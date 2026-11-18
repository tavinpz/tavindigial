import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ALTURA, Balao, Braco, Carimbo, CHAO, Fundo, H, Idade, Janela, L, Lado, Livros, Luminaria, MEIO, Mesa, MONO, P, Papel, Partido, Peao, Prateleira, SANS, SLAB, tema, Topo, Trofeu, W } from './lib';

// Two Childhoods: motor do vídeo longo. Cada fala do tempos.json traz em `v` o que aparece na tela (ver tc01_roteiro.py).
// O estado acumula dentro do bloco: a fala herda o `v` anterior e chave com null apaga.
type V = Record<string, any>;
type Fala = { t: number; d: number; txt: string; v?: V; dest?: string[] };
type Bloco = { id: string; cena: string; idade?: number; cap?: { n: string; tit: string }; pre?: number; est?: any; ini: number; fim: number; falas: Fala[] };
export type TemposTC = { total: number; blocos: Bloco[] };
const IDADES = [6, 10, 16, 22, 30, 45, 60];
const J = (x: any) => JSON.stringify(x ?? null);
const pop = (g: number, t0: number, d = 10) => { const x = Math.min(1, Math.max(0, (g - t0) / d)); return x <= 0 ? 0 : 1 - Math.pow(1 - x, 3) + 0.14 * Math.sin(Math.PI * x); };
const Pop: React.FC<{ g: number; t0: number; cx: number; cy: number; children: React.ReactNode; d?: number }> = ({ g, t0, cx, cy, children, d }) => {
  const s = pop(g, t0, d); if (s <= 0) return null;
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`} opacity={Math.min(1, (g - t0) / 4)}>{children}</g>;
};
const COR: Record<string, string> = { coral: P.coral, mar: P.mar, amb: P.amb };

// ---------- objetos de cena ----------
const Violao: React.FC<{ x: number; cor: string; fundo: string }> = ({ x, cor, fundo }) => (
  <g transform={`translate(${x} ${CHAO}) rotate(-14)`}>
    <rect x={-9} y={-330} width={18} height={190} rx={6} fill={cor} /><rect x={-17} y={-362} width={34} height={44} rx={8} fill={cor} />
    <ellipse cx={0} cy={-150} rx={50} ry={46} fill={cor} /><ellipse cx={0} cy={-74} rx={68} ry={66} fill={cor} /><circle cx={0} cy={-96} r={20} fill={fundo} />
  </g>
);
const Laptop: React.FC<{ lado: Lado; tela?: string }> = ({ lado, tela }) => {
  const t = tema(lado);
  return (
    <g>
      <rect x={440} y={CHAO - 262} width={160} height={104} rx={8} fill={tela ? P.creme : t.claro} stroke={t.tinta} strokeWidth={7} /><rect x={420} y={CHAO - 160} width={200} height={10} rx={5} fill={t.tinta} />
      {tela === 'oferta' && <><text x={520} y={CHAO - 218} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={22} fill={P.mar} letterSpacing={1}>NEW ROLE</text><path d={`M 474 ${CHAO - 198} l 92 0 M 474 ${CHAO - 182} l 60 0`} stroke={P.mar} strokeWidth={5} strokeLinecap="round" opacity={0.35} /></>}
      {tela === 'email' && <><rect x={478} y={CHAO - 240} width={84} height={58} rx={6} fill="none" stroke={P.mar} strokeWidth={5} /><path d={`M 478 ${CHAO - 238} l 42 32 l 42 -32`} fill="none" stroke={P.mar} strokeWidth={5} strokeLinejoin="round" /></>}
    </g>
  );
};
const Caixa: React.FC<{ x: number; rot: string; lado: Lado; n: number; ativo: boolean; g: number }> = ({ x, rot, lado, n, ativo, g }) => {
  const t = tema(lado), y = CHAO - 150;
  return (
    <g>
      {ativo && <rect x={x - 62} y={y - 104} width={124} height={110} rx={16} fill="none" stroke={P.creme} strokeWidth={7} opacity={0.6 + 0.4 * Math.sin(g / 4)} />}
      <rect x={x - 50} y={y - 78} width={100} height={78} rx={10} fill={P.creme} stroke={t.tinta} strokeWidth={6} />
      {Array.from({ length: n }).map((_, i) => <rect key={i} x={x - 36 + (i % 3) * 26} y={y - 66 + Math.floor(i / 3) * 22} width={20} height={16} rx={4} fill={P.mar} opacity={0.8} />)}
      <text x={x} y={y - 92} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={20} fill={t.tinta} letterSpacing={3}>{rot}</text>
    </g>
  );
};
const Brilho: React.FC<{ x: number; y: number; r: number; cor: string; g: number }> = ({ x, y, r, cor, g }) => (
  <g transform={`translate(${x} ${y}) rotate(${g * 1.5})`}>{Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M 0 ${-r} l 0 ${-r * 0.32}`} transform={`rotate(${i * 45})`} stroke={cor} strokeWidth={7} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(g / 3 + i)} />)}</g>
);

// ---------- uma casa (metade da tela) ----------
const Casa: React.FC<{ l: Lado; idade: number; v: V; g: number; desde: (k: string) => number; fala: Fala; gi: number }> = ({ l, idade, v, g, desde, fala, gi }) => {
  const t = tema(l), a = l === 'a', obj: string[] = v['o' + l] || [], f: V = v['f' + l] || {}, noite = idade >= 22, familia = idade === 6 || idade === 45;
  const tem = (k: string) => obj.find((o) => o === k || o.startsWith(k + ':'));
  const val = (k: string) => (tem(k) || '').split(':')[1];
  const pisca = (g + (a ? 0 : 37)) % 104 < 5 ? 1 : 0, bob = Math.sin(g / 17 + (a ? 0 : 1.3)) * 2.2;
  const pulo = f.pula ? -Math.abs(Math.sin((g - desde('f' + l)) / 5)) * 26 * Math.max(0, 1 - (g - desde('f' + l)) / 70) : 0;
  const foco = v.foco, olharFoco: [number, number] = f.triste ? [0.2, 0.9] : foco === l ? [0.6, -0.3] : [0.5, 0.1];
  const el: React.ReactNode[] = [];
  if (familia) {
    const samGrande = idade === 45, hS = samGrande ? ALTURA[45] : ALTURA[6];
    el.push(<Janela key="j" x={640} y={300} lado={l} noite={noite} />);
    el.push(<Prateleira key="p" x={90} y={470} lado={l} larg={230}><Livros x={20} lado={l} n={samGrande ? 5 : 4} />{samGrande && !a && <Trofeu x={180} lado={l} />}{samGrande && a && <><Trofeu x={160} lado={l} /><Trofeu x={206} lado={l} /></>}</Prateleira>);
    el.push(<Mesa key="m" x={80} lado={l} larg={250} />);
    if (tem('puzzles')) {
      const pg = val('pega');
      el.push(<Pop key="pz" g={g} t0={desde('o' + l)} cx={205} cy={CHAO - 190}><Caixa x={140} rot="EASY" lado={l} n={3} ativo={pg === 'facil'} g={g} /><Caixa x={270} rot="HARD" lado={l} n={9} ativo={pg === 'dificil'} g={g} /></Pop>);
    } else el.push(<Luminaria key="lu" x={130} lado={l} />);
    // grande (pai/mãe aos 6; o próprio Sam aos 45) e pequeno (Sam aos 6; o filho aos 45)
    const gy = samGrande ? pulo : 0, py = samGrande ? 0 : pulo;
    el.push(<g key="g" transform={`translate(0 ${bob * 0.6 + gy})`}><Peao x={610} h={samGrande ? hS : 350} cor={samGrande ? t.tinta : t.claro} contorno={samGrande ? undefined : t.tinta} olho={samGrande ? t.fundo : t.tinta} olhar={[-0.9, 0.5]} incl={-3} pisca={pisca} /></g>);
    el.push(<g key="k" transform={`translate(0 ${-bob + py})`}>
      <Peao x={410} h={190} cor={samGrande ? t.claro : t.tinta} contorno={samGrande ? t.tinta : undefined} olho={samGrande ? t.tinta : t.fundo} olhar={f.triste && !samGrande ? [0.2, 0.9] : [0.8, -0.7]} incl={a ? 0 : 2} pisca={(g + 50) % 120 < 5 ? 1 : 0} />
      {tem('nota') && <Pop g={g} t0={desde('o' + l)} cx={500} cy={CHAO - 186}><Braco de={[430, CHAO - 108]} ate={[478, CHAO - 150]} cor={samGrande ? t.tinta : t.tinta} /><Papel x={500} y={CHAO - 186} nota={val('nota')} rot={8 + Math.sin(g / 9) * 3} larg={84} /></Pop>}
    </g>);
    if (f.brilho) el.push(<Brilho key="br" x={samGrande ? 610 : 410} y={CHAO - (samGrande ? hS : 190) + 38 + py} r={samGrande ? 86 : 54} cor={P.creme} g={g} />);
  } else {
    const h = ALTURA[idade] || 320;
    el.push(<Janela key="j" x={690} y={250} lado={l} noite={noite} />);
    const nt = a ? (idade >= 60 ? 3 : idade >= 22 ? 2 : 1) : idade >= 30 ? 1 : 0, nl = a ? (idade >= 22 ? 2 : 3) : Math.min(5, 3 + Math.floor(idade / 20));
    el.push(<Prateleira key="p" x={385} y={500} lado={l} larg={270}>{a
      ? <>{Array.from({ length: nt }).map((_, i) => <Trofeu key={i} x={42 + i * 66} lado={l} />)}{nt < 3 && <Livros x={42 + nt * 66} lado={l} n={nl} />}</>
      : <><Livros x={14} lado={l} n={nl} />{nt > 0 && <Trofeu x={176} lado={l} />}{idade >= 22 && <Papel x={236} y={-40} nota="C" rot={5} larg={50} cor={P.coral} />}</>}</Prateleira>);
    el.push(<Mesa key="m" x={350} lado={l} larg={330} />);
    if (idade === 16) el.push(<g key="lv"><rect x={400} y={CHAO - 172} width={120} height={22} rx={5} fill={t.tinta} /><rect x={410} y={CHAO - 192} width={100} height={20} rx={5} fill={t.sombra} stroke={t.tinta} strokeWidth={4} /></g>);
    if (idade === 22 || idade === 30) el.push(<Laptop key="lp" lado={l} tela={tem('oferta') ? 'oferta' : tem('email') ? 'email' : undefined} />);
    if (idade === 60) el.push(<Luminaria key="lu" x={610} lado={l} />);
    if (tem('nota')) { const n = val('nota'); el.push(<Pop key={'n' + n} g={g} t0={desde('o' + l)} cx={600} cy={CHAO - 215}><Papel x={600} y={CHAO - 215} nota={n} rot={-7} larg={92} cor={n === 'F' ? P.coral : P.mar} /></Pop>); }
    if (tem('violao')) el.push(<Pop key="vi" g={g} t0={desde('o' + l)} cx={800} cy={CHAO - 150}><Violao x={800} cor={t.tinta} fundo={t.fundo} /></Pop>);
    if (tem('notas')) el.push(<g key="nt">{[0, 1, 2].map((i) => { const p = ((g + i * 30) % 90) / 90; return <text key={i} x={800 + i * 34 - 30 + Math.sin(g / 8 + i) * 10} y={CHAO - 380 - p * 130} fontSize={54} fontFamily={SANS} fontWeight={900} fill={t.tinta} opacity={Math.sin(p * Math.PI)}>♪</text>; })}</g>);
    if (tem('lista')) {
      const t0 = desde('o' + l), its = ['A language', 'A business', 'A hard conversation'], dur = Math.round(fala.d * 30);
      el.push(<Pop key="ls" g={g} t0={t0} cx={770} cy={640}><g transform="rotate(4 770 640)">
        <rect x={610} y={560} width={320} height={200} rx={12} fill={P.creme} stroke={P.mar} strokeWidth={5} />
        <text x={632} y={602} fontFamily={SANS} fontWeight={900} fontSize={24} fill={P.coral} letterSpacing={3}>NEVER TRIED</text>
        {its.map((s, i) => g >= t0 + dur * (0.5 + i * 0.16) && <text key={i} x={632} y={646 + i * 40} fontFamily={SANS} fontWeight={800} fontSize={28} fill={P.mar}>{'☐ ' + s}</text>)}
      </g></Pop>);
    }
    el.push(<g key="s" transform={`translate(0 ${bob + pulo})`}><Peao x={230} h={h} cor={t.tinta} olho={t.fundo} olhar={olharFoco} incl={f.triste ? -5 : a ? -1 : 3} oculos={idade >= 60} pisca={pisca} /></g>);
    const c1 = val('carimbo'), c2 = val('carimbo2');
    if (c1) el.push(<Pop key={'c' + c1} g={g} t0={desde('o' + l)} cx={515} cy={735} d={7}><Carimbo x={515} y={735} txt={c1} tam={30} /></Pop>);
    if (c2) el.push(<Pop key={'d' + c2} g={g} t0={desde('o' + l)} cx={515} cy={735} d={7}><Carimbo x={515} y={735} txt={c2} cor={P.mar} tam={30} rot={7} /></Pop>);
  }
  // balão
  const b = v['b' + l];
  if (b) {
    const dono = b.q === 'p', cx = familia ? (dono ? 500 : 290) : 330, cy = familia ? (dono ? 318 : 440) : 330;
    const ponta: [number, number] = familia ? (dono ? [608, 470] : [400, 612]) : [150, 470];
    el.push(<Pop key={'b' + J(b.t)} g={g} t0={desde('b' + l)} cx={cx} cy={cy + 60}><Balao x={cx} y={cy} linhas={b.t} ponta={ponta} tam={b.t.some((s: string) => s.length > 15) ? 38 : 44} pensa={!!b.pensa} dest={b.d || []} /></Pop>);
  }
  const apaga = foco && foco !== l ? L(g, [desde('foco'), desde('foco') + 8], [0, 0.46]) : 0;
  return <g transform={`translate(${a ? 0 : MEIO} 0)`}>{el}{apaga > 0 && <rect x={0} y={0} width={MEIO} height={H} fill="#06121f" opacity={apaga} />}</g>;
};

const Duo: React.FC<{ b: Bloco; v: V; g: number; desde: (k: string) => number; fala: Fala; D: number }> = ({ b, v, g, desde, fala, D }) => {
  const idade = b.idade || 6, z = 1 + 0.03 * Math.min(1, g / Math.max(60, D));
  const conta = (l: Lado) => (v['c' + l] === undefined || v['c' + l] === null ? undefined : { rot: 'HARD THINGS TRIED', n: v['c' + l], prog: L(g, [desde('c' + l), desde('c' + l) + 10], [0, 1]) });
  const big = v.big, tb = big ? desde('big') : 0;
  return (
    <g>
      <g transform={`translate(${MEIO} 560) scale(${z}) translate(${-MEIO} -560)`}>
        <Fundo />
        <Casa l="a" idade={idade} v={v} g={g} desde={desde} fala={fala} gi={0} />
        <Casa l="b" idade={idade} v={v} g={g} desde={desde} fala={fala} gi={0} />
      </g>
      <Topo lado="a" titulo="“You're so smart.”" conta={conta('a')} />
      <Topo lado="b" titulo="“You worked hard.”" conta={conta('b')} />
      {v.conta && <g opacity={0.5 + 0.5 * Math.sin(g / 4)}><rect x={54} y={138} width={470} height={70} rx={14} fill="none" stroke={P.mar} strokeWidth={5} /><rect x={MEIO + 134} y={138} width={520} height={70} rx={14} fill="none" stroke={P.amb} strokeWidth={5} /></g>}
      <Idade n={idade} />
      {v.nota && <Pop g={g} t0={desde('nota')} cx={MEIO} cy={300}><rect x={MEIO - 290} y={266} width={580} height={68} rx={18} fill={P.creme} /><text x={MEIO} y={312} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={P.mar} letterSpacing={3}>{v.nota}</text></Pop>}
      {big && <g>
        <rect x={0} y={0} width={MEIO} height={H} fill={P.amb} opacity={L(g, [tb, tb + 7], [0, 0.9])} /><rect x={MEIO} y={0} width={MEIO} height={H} fill={P.mar} opacity={L(g, [tb, tb + 7], [0, 0.9])} />
        <Pop g={g} t0={tb + 2} cx={MEIO} cy={560}>
          <g transform={big.al ? `translate(${Math.sin(g * 1.7) * 4 * Math.max(0, 1 - (g - desde('big')) / 30)} 0)` : undefined}>
            <Partido esq={big.e} dir={big.d} y={600} tam={big.tam || 120} folga={0.22} corE={big.al ? P.coral : P.mar} />
          </g>
        </Pop>
      </g>}
      <text x={W - 60} y={1062} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={17} fill={P.amb} letterSpacing={2} opacity={0.6}>ILLUSTRATED STORY · BASED ON PUBLISHED RESEARCH</text>
    </g>
  );
};

// ---------- linha da vida ----------
const Linha: React.FC<{ atual?: number; y: number; g: number; marca?: number }> = ({ atual, y, g, marca }) => (
  <g>
    {IDADES.map((n, i) => (['a', 'b'] as Lado[]).map((l) => {
      const t = tema(l), x = (l === 'a' ? 150 : MEIO + 150) + i * 110, h = ALTURA[n] * 0.4, on = n === atual, s = pop(g, 4 + i * 3);
      return (
        <g key={l + n} opacity={(atual === undefined || on ? 1 : 0.36) * Math.min(1, s)}>
          <Peao x={x} base={y - (on ? Math.abs(Math.sin(g / 6)) * 8 : 0)} h={h * Math.min(1.05, s)} cor={t.tinta} />
          <text x={x} y={y + 38} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={24} fill={t.tinta}>{n}</text>
          {on && <rect x={x - 36} y={y + 50} width={72} height={8} rx={4} fill={t.tinta} />}
          {marca === n && <circle cx={x} cy={y - h / 2} r={h * 0.72 + Math.sin(g / 5) * 5} fill="none" stroke={P.coral} strokeWidth={7} />}
        </g>
      );
    }))}
  </g>
);

const Capitulo: React.FC<{ b: Bloco; g: number }> = ({ b, g }) => (
  <g>
    <Fundo chao={false} />
    <g opacity={L(g, [0, 6], [0, 1])}><Partido esq="CHAPTER" dir={b.cap!.n} y={250} tam={40} fam={SANS} peso={900} esp={16} folga={0.5} /></g>
    <Pop g={g} t0={3} cx={MEIO} cy={450} d={12}><Partido esq="AGE" dir={String(b.idade)} y={560} tam={330} /></Pop>
    <Pop g={g} t0={12} cx={MEIO} cy={682}>
      <rect x={MEIO - (b.cap!.tit.length * 36 + 90) / 2} y={636} width={b.cap!.tit.length * 36 + 90} height={92} rx={20} fill={P.creme} />
      <text x={MEIO} y={700} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52} fill={P.mar} letterSpacing={5}>{b.cap!.tit}</text>
    </Pop>
    <Linha atual={b.idade} y={930} g={g} />
  </g>
);

// ---------- cartão do estudo ----------
const Fila: React.FC<{ y: number; n: number; de: number; cor: string; rot: string; pct: string; g: number; t0: number }> = ({ y, n, de, cor, rot, pct, g, t0 }) => {
  const passo = de > 12 ? 26 : 50, h = de > 12 ? 52 : 74;
  return (
    <g opacity={L(g, [t0, t0 + 6], [0, 1])}>
      <text x={1010} y={y - 96} fontFamily={SANS} fontWeight={800} fontSize={25} fill={P.mar} letterSpacing={2}>{rot}</text>
      {Array.from({ length: de }).map((_, i) => <Peao key={i} x={1030 + i * passo} base={y} h={h} cor={i < n && g >= t0 + 6 + i * 2 ? cor : '#E4D8C2'} />)}
      <Pop g={g} t0={t0 + 8 + n * 2} cx={1740} cy={y - 30}><text x={1840} y={y - 4} textAnchor="end" fontFamily={SLAB} fontSize={pct.length > 3 ? 78 : 92} fill={cor}>{pct}</text></Pop>
    </g>
  );
};
const Estudo: React.FC<{ b: Bloco; v: V; g: number; desde: (k: string) => number; fala: Fala }> = ({ b, v, g, desde, fala }) => {
  const e = b.est, d: V = v.dir || {}, t0 = desde('dir'), el: React.ReactNode[] = [];
  const cab = (ls: string[] = []) => ls.map((s, i) => <text key={'cab' + i} x={1010} y={196 + i * 50} fontFamily={SANS} fontWeight={900} fontSize={38} fill={P.mar} opacity={L(g, [t0, t0 + 6], [0, 1])}>{s}</text>);
  if (d.k === 'selo') el.push(<Pop key="selo" g={g} t0={t0} cx={1420} cy={470}>{d.t.map((s: string, i: number) => <text key={i} x={1010} y={(d.t.length > 2 ? 380 : 440) + i * 104} fontFamily={SLAB} fontSize={82} fill={i ? P.coral : P.mar}>{s}</text>)}</Pop>);
  if (d.k === 'nomes') el.push(<g key="nomes">{d.t.map((s: string, i: number) => <Pop key={i} g={g} t0={t0 + i * 16 + 40} cx={1300} cy={400 + i * 120}><Peao x={1060} base={440 + i * 120} h={110} cor={i ? P.amb : P.mar} olho={i ? P.mar : P.amb} /><text x={1140} y={420 + i * 120} fontFamily={SLAB} fontSize={66} fill={P.mar}>{s}</text></Pop>)}
    <text x={1010} y={660} fontFamily={MONO} fontWeight={700} fontSize={26} fill={P.mar} letterSpacing={3} opacity={L(g, [t0 + 20, t0 + 30], [0, 0.7])}>{d.s}</text></g>);
  if (d.k === 'num') {
    const n = Math.round(d.n * L(g, [t0, t0 + 26], [0, 1])), col = d.n > 200 ? 25 : 16, px = d.n > 200 ? 33 : 51, py = d.n > 200 ? 36 : 54, hh = d.n > 200 ? 28 : 42;
    el.push(<g key="num"><text x={1010} y={300} fontFamily={SLAB} fontSize={170} fill={P.mar}>{n}</text><text x={1010} y={356} fontFamily={SANS} fontWeight={900} fontSize={30} fill={P.mar} letterSpacing={5}>{d.rot}</text>
      {Array.from({ length: d.n }).map((_, i) => i < n && <Peao key={i} x={1026 + (i % col) * px} base={430 + Math.floor(i / col) * py + hh} h={hh} cor={i % 2 ? P.amb : P.mar} />)}</g>);
  }
  if (d.k === 'frases') {
    const fr = [['“You must be smart', 'at these problems.”', P.coral], ['“You must have worked hard', 'at these problems.”', P.mar]];
    el.push(<g key="fr">{cab(['Then each kid heard', 'one sentence.'])}{fr.map((f, i) => d.n > i && <Pop key={i} g={g} t0={t0} cx={1420} cy={420 + i * 230}>
      <rect x={1010} y={330 + i * 230} width={830} height={190} rx={22} fill="#FFFFFF" /><text x={1050} y={410 + i * 230} fontFamily={SLAB} fontSize={50} fill={f[2]}>{f[0]}</text><text x={1050} y={474 + i * 230} fontFamily={SLAB} fontSize={50} fill={f[2]}>{f[1]}</text></Pop>)}</g>);
  }
  if (d.k === 'escolha') el.push(<g key="esc">{cab(['Then came a choice.'])}{[['EASY TASK', '“You\'ll look smart.”', P.coral, 3], ['HARD TASK', '“You\'ll learn something.”', P.mar, 9]].map((c: any, i) => <Pop key={i} g={g} t0={t0 + 40 + i * 70} cx={1210 + i * 420} cy={480}>
    <rect x={1010 + i * 425} y={280} width={400} height={400} rx={26} fill="#FFFFFF" /><text x={1210 + i * 425} y={350} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill={c[2]} letterSpacing={4}>{c[0]}</text>
    {Array.from({ length: c[3] }).map((_, k) => <rect key={k} x={1120 + i * 425 + (k % 3) * 62} y={390 + Math.floor(k / 3) * 56} width={52} height={46} rx={10} fill={c[2]} opacity={0.85} />)}
    <text x={1210 + i * 425} y={640} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={P.mar}>{c[1]}</text></Pop>)}</g>);
  if (d.k === 'rows') el.push(<g key={'rows' + J(d.rows[0])}>{cab(d.cab)}{d.rows.map((r: any, i: number) => d.n > i && <Fila key={i} y={470 + i * 250} n={r[1]} de={r[2]} rot={r[0]} pct={r[3]} cor={COR[r[4]]} g={g} t0={i + 1 === d.n ? t0 : 0} />)}</g>);
  if (d.k === 'itens') { const dur = Math.round(fala.d * 30); el.push(<g key="it">{cab(d.cab)}{d.it.map((s: string, i: number) => { const ti = d.auto ? t0 + dur * (0.12 + i * 0.27) : 1e9; return d.n > i && g >= ti && <Pop key={i} g={g} t0={ti} cx={1300} cy={400 + i * 120}>
    <rect x={1010} y={350 + i * 120} width={830} height={96} rx={18} fill="#FFFFFF" /><text x={1044} y={414 + i * 120} fontFamily={SANS} fontWeight={900} fontSize={44} fill={P.coral}>✕</text><text x={1104} y={412 + i * 120} fontFamily={SANS} fontWeight={800} fontSize={40} fill={P.mar}>{s}</text></Pop>; })}</g>); }
  if (d.k === 'setas') { const dur = Math.round(fala.d * 30); el.push(<g key="set">{cab(d.cab)}{[['TOLD “SMART”', 'WORSE THAN BEFORE', P.coral, 1, 0.3], ['TOLD “WORKED HARD”', 'BETTER THAN BEFORE', P.mar, -1, 0.72]].map((c: any, i) => <Pop key={i} g={g} t0={t0 + dur * c[4]} cx={1210 + i * 425} cy={480}>
    <rect x={1010 + i * 425} y={280} width={400} height={420} rx={26} fill="#FFFFFF" /><text x={1210 + i * 425} y={346} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={28} fill={P.mar} letterSpacing={2}>{c[0]}</text>
    <g transform={`translate(${1210 + i * 425} ${490 + Math.sin(g / 6) * 8 * c[3]}) scale(1 ${c[3]})`}><path d="M -26 -90 L 26 -90 L 26 20 L 70 20 L 0 100 L -70 20 L -26 20 Z" fill={c[2]} /></g>
    <text x={1210 + i * 425} y={660} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={28} fill={c[2]} letterSpacing={1}>{c[1]}</text></Pop>)}</g>); }
  const rod = v.rod, tr = rod ? desde('rod') : 0;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={P.creme} />
      <rect x={110} y={120} width={250} height={62} rx={12} fill={P.mar} /><text x={235} y={163} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill={P.amb} letterSpacing={6}>{e.tag}</text>
      {e.titulo.map((s: string, i: number) => <text key={i} x={110} y={290 + i * 84} fontFamily={SLAB} fontSize={Math.min(68, Math.floor(1400 / Math.max(...e.titulo.map((x: string) => x.length))))} fill={P.mar} opacity={L(g, [4 + i * 4, 12 + i * 4], [0, 1])}>{s}</text>)}
      <rect x={110} y={290 + e.titulo.length * 84 - 16} width={120 * L(g, [16, 30], [0, 1])} height={8} rx={4} fill={P.amb} />
      {e.meta.map((s: string, i: number) => <text key={i} x={110} y={290 + e.titulo.length * 84 + 54 + i * 48} fontFamily={SANS} fontWeight={i ? 500 : 800} fontSize={i ? 28 : 34} fill={P.mar} opacity={(i ? 0.8 : 1) * L(g, [20 + i * 4, 30 + i * 4], [0, 1])}>{s}</text>)}
      <text x={110} y={868} fontFamily={MONO} fontWeight={700} fontSize={20} fill={P.mar} letterSpacing={2} opacity={0.6}>REAL STUDY · FULL SOURCE IN THE DESCRIPTION</text>
      <path d="M 950 150 L 950 800" stroke={P.mar} strokeWidth={4} opacity={0.15} />
      {el}
      {rod && <Pop g={g} t0={tr} cx={1425} cy={846}><rect x={1425 - (rod.length * 21 + 60) / 2} y={806} width={rod.length * 21 + 60} height={76} rx={16} fill={P.mar} /><text x={1425} y={858} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={32} fill={P.amb} letterSpacing={2}>{rod}</text></Pop>}
    </g>
  );
};

// ---------- a parte honesta ----------
const CARDS = [
  { ano: '2013', quem: 'Gunderson et al.', onde: 'Child Development', n: '53 families, filmed at home', t: ['More praise for effort', 'at ages 1 to 3', '= more “I can improve”', 'at ages 7 to 8.'], x: ['Praise for the person did', 'NOT predict the opposite.'], chip: 'SUPPORTS IT', cor: P.mar },
  { ano: '2019', quem: 'Li & Bates', onde: 'J. Exp. Psychology: General', n: '624 children', t: ['Repeated the original', 'experiment.', 'Did not find', 'the effect.'], x: [], chip: 'DID NOT REPLICATE', cor: P.coral },
  { ano: '2015', quem: 'Carol Dweck', onde: 'Education Week', n: 'her own correction', t: ['“...too much emphasis', 'on sheer effort.”', 'Empty “good try”', 'is not the point.'], x: [], chip: 'A WARNING', cor: '#B7791F' },
];
const Honesto: React.FC<{ v: V; g: number; desde: (k: string) => number }> = ({ v, g, desde }) => {
  const rod = v.rod, tr = rod ? desde('rod') : 0;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={P.creme} />
      <rect x={110} y={90} width={420} height={62} rx={12} fill={P.mar} /><text x={320} y={133} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill={P.amb} letterSpacing={6}>THE HONEST PART</text>
      {(v.n || 0) > 0 && <text x={570} y={138} fontFamily={SLAB} fontSize={50} fill={P.mar}>A sentence is not a spell.</text>}
      {!(v.n > 0) && <Pop g={g} t0={8} cx={MEIO} cy={500}><text x={MEIO} y={470} textAnchor="middle" fontFamily={SLAB} fontSize={120} fill={P.mar}>A sentence</text><text x={MEIO} y={610} textAnchor="middle" fontFamily={SLAB} fontSize={120} fill={P.coral}>is not a spell.</text></Pop>}
      {CARDS.map((c, i) => (v.n || 0) > i && <Pop key={i} g={g} t0={i + 1 === v.n ? desde('n') : 0} cx={380 + i * 580} cy={500}>
        <rect x={110 + i * 580} y={210} width={540} height={600} rx={26} fill="#FFFFFF" />
        <text x={150 + i * 580} y={310} fontFamily={SLAB} fontSize={88} fill={c.cor}>{c.ano}</text>
        <text x={150 + i * 580} y={366} fontFamily={SANS} fontWeight={900} fontSize={32} fill={P.mar}>{c.quem}</text>
        <text x={150 + i * 580} y={402} fontFamily={SANS} fontWeight={500} fontSize={24} fill={P.mar} opacity={0.75}>{c.onde}</text>
        <text x={150 + i * 580} y={434} fontFamily={SANS} fontWeight={500} fontSize={24} fill={P.mar} opacity={0.75}>{c.n}</text>
        {c.t.map((s, k) => <text key={k} x={150 + i * 580} y={500 + k * 44} fontFamily={SANS} fontWeight={800} fontSize={34} fill={P.mar}>{s}</text>)}
        {i === 0 && v.x && c.x.map((s, k) => <text key={'x' + k} x={150 + i * 580} y={684 + k * 34} fontFamily={SANS} fontWeight={800} fontSize={26} fill={P.coral} opacity={L(g, [desde('x'), desde('x') + 8], [0, 1])}>{s}</text>)}
        <rect x={150 + i * 580} y={742} width={c.chip.length * 17 + 44} height={46} rx={23} fill={c.cor} /><text x={172 + i * 580} y={774} fontFamily={SANS} fontWeight={900} fontSize={22} fill="#FFFFFF" letterSpacing={2}>{c.chip}</text>
      </Pop>)}
      {rod && <Pop g={g} t0={tr} cx={MEIO} cy={862}><rect x={MEIO - (rod.length * 23 + 70) / 2} y={824} width={rod.length * 23 + 70} height={78} rx={16} fill={P.mar} /><text x={MEIO} y={877} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill={P.amb} letterSpacing={2}>{rod}</text></Pop>}
    </g>
  );
};

// ---------- telas de texto, resumo, trocas e final ----------
const Texto: React.FC<{ v: V; g: number; desde: (k: string) => number }> = ({ v, g, desde }) => (
  <g>
    <Fundo chao={false} />
    {v.icone === 'share' && <Pop g={g} t0={2} cx={MEIO} cy={250}><circle cx={MEIO} cy={250} r={70} fill={P.creme} /><path d={`M ${MEIO - 26} 262 q 6 -40 44 -40 l 0 -22 l 36 36 l -36 36 l 0 -22 q -26 0 -44 12 Z`} fill={P.mar} /></Pop>}
    {v.big && <Pop g={g} t0={desde('big')} cx={MEIO} cy={440}><Partido esq={v.big.e} dir={v.big.d} y={v.linha !== undefined ? 400 : 480} tam={v.big.tam || 100} folga={0.24} /></Pop>}
    {v.chips && <g>{v.chips.map((c: string, i: number) => <Pop key={i} g={g} t0={desde('chips') + i * 22} cx={i ? MEIO + 330 : MEIO - 330} cy={650}>
      <rect x={(i ? MEIO + 330 : MEIO - 330) - 250} y={596} width={500} height={110} rx={55} fill={P.creme} /><text x={i ? MEIO + 330 : MEIO - 330} y={670} textAnchor="middle" fontFamily={SLAB} fontSize={54} fill={i ? P.mar : P.coral}>{c}</text></Pop>)}</g>}
    {v.sub && <Pop g={g} t0={desde('sub')} cx={MEIO} cy={v.chips ? 800 : v.linha !== undefined ? 530 : 620}>
      <rect x={MEIO - (v.sub.length * 24 + 80) / 2} y={(v.chips ? 800 : v.linha !== undefined ? 530 : 620) - 42} width={v.sub.length * 24 + 80} height={84} rx={20} fill={P.creme} />
      <text x={MEIO} y={(v.chips ? 800 : v.linha !== undefined ? 530 : 620) + 14} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={36} fill={P.mar} letterSpacing={4}>{v.sub}</text></Pop>}
    {v.linha !== undefined && <Linha y={820} g={g} marca={v.linha || undefined} />}
  </g>
);
const VIDA: [number, string, string][] = [[6, '“You\'re so smart.”', '“You worked hard.”'], [16, 'Drops the hard class.', 'Fails. Signs up again.'], [30, 'Stays where it\'s safe.', 'Takes the harder job.'], [60, 'Still wonders.', 'Still learning.']];
const Vida: React.FC<{ v: V; g: number; desde: (k: string) => number }> = ({ v, g, desde }) => (
  <g>
    <Fundo chao={false} />
    <Partido esq="THE WHOLE LIFE," dir="SIDE BY SIDE" y={130} tam={64} folga={0.3} />
    {VIDA.map(([n, ea, eb], i) => {
      const y = 330 + i * 180, on = (v.n || 0) > i, t0 = i + 1 === v.n ? desde('n') : 0;
      return on && (
        <g key={n}>
          <Pop g={g} t0={t0} cx={MEIO} cy={y - 34}><circle cx={MEIO} cy={y - 34} r={46} fill={P.creme} /><text x={MEIO} y={y - 17} textAnchor="middle" fontFamily={SLAB} fontSize={44} fill={P.mar}>{n}</text>
            <Peao x={MEIO - 150} base={y + 20} h={ALTURA[n] * 0.44} cor={P.mar} olho={P.amb} olhar={[0, 0.4]} oculos={n === 60} /><Peao x={MEIO + 150} base={y + 20} h={ALTURA[n] * 0.44} cor={P.amb} olho={P.mar} olhar={[0, -0.2]} oculos={n === 60} /></Pop>
          <text x={MEIO - 250 - (1 - L(g, [t0 + 4, t0 + 14], [0, 1])) * 60} y={y - 16} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={46} fill={P.mar} opacity={L(g, [t0 + 4, t0 + 14], [0, 1])}>{ea}</text>
          <text x={MEIO + 250 + (1 - L(g, [t0 + 30, t0 + 40], [0, 1])) * 60} y={y - 16} textAnchor="start" fontFamily={SANS} fontWeight={800} fontSize={46} fill={P.amb} opacity={L(g, [t0 + 30, t0 + 40], [0, 1])}>{eb}</text>
        </g>
      );
    })}
  </g>
);
const TROCAS = [['“You\'re so smart.”', '“Show me how you did that.”'], ['“You\'re a natural.”', '“That took practice.”'], ['“You\'re still smart.”', '“What would you try differently?”']];
const Trocas: React.FC<{ v: V; g: number; desde: (k: string) => number; fala: Fala }> = ({ v, g, desde, fala }) => {
  const dur = Math.round(fala.d * 30);
  return (
    <g>
      <Fundo chao={false} />
      {v.tit ? <Pop g={g} t0={2} cx={MEIO} cy={500}><Partido esq="NEVER" dir="TOO LATE" y={560} tam={150} folga={0.2} /></Pop> : <>
        <Partido esq="THREE" dir="SWAPS" y={150} tam={84} folga={0.22} />
        <text x={MEIO - 110} y={236} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={24} fill={P.mar} letterSpacing={5} opacity={0.7}>INSTEAD OF</text>
        <text x={MEIO + 110} y={236} fontFamily={SANS} fontWeight={900} fontSize={24} fill={P.amb} letterSpacing={5} opacity={0.7}>TRY</text>
        {TROCAS.map(([de, para], i) => {
          const y = 380 + i * 170, on = (v.n || 0) > i, t0 = i + 1 === v.n && !v.yet ? desde('n') : -200, t1 = t0 + dur * 0.5, larg = de.length * 27;
          return on && (
            <g key={i}>
              <text x={MEIO - 110} y={y} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={50} fill={P.mar} opacity={L(g, [t0, t0 + 8], [0, 1]) * (g > t1 ? 0.55 : 1)}>{de}</text>
              <rect x={MEIO - 110 - larg} y={y - 20} width={larg * L(g, [t1, t1 + 10], [0, 1])} height={7} rx={3} fill={P.coral} />
              <Pop g={g} t0={t1} cx={MEIO} cy={y - 16}><circle cx={MEIO} cy={y - 16} r={44} fill={P.creme} /><path d={`M ${MEIO - 20} ${y - 16} l 34 0 m -14 -15 l 15 15 l -15 15`} fill="none" stroke={P.mar} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></Pop>
              <text x={MEIO + 110} y={y} fontFamily={SANS} fontWeight={800} fontSize={para.length > 28 ? 44 : 50} fill={P.amb} opacity={L(g, [t1 + 4, t1 + 14], [0, 1])}>{para}</text>
            </g>
          );
        })}
      </>}
      {v.yet && (() => { const t0 = desde('yet') + Math.round(dur * 0.78); return g >= t0 && <g><rect x={0} y={0} width={MEIO} height={H} fill={P.amb} opacity={0.93} /><rect x={MEIO} y={0} width={MEIO} height={H} fill={P.mar} opacity={0.93} /><Pop g={g} t0={t0} cx={MEIO} cy={520}><Partido esq="NOT" dir="YET." y={600} tam={230} folga={0.16} /></Pop></g>; })()}
    </g>
  );
};
const Fim: React.FC<{ v: V; g: number; desde: (k: string) => number }> = ({ v, g, desde }) => (
  <g>
    <Fundo chao={false} />
    <g opacity={L(g, [0, 8], [0, 1])}><Partido esq="NEXT" dir="CHILDHOOD" y={170} tam={44} fam={SANS} peso={900} esp={14} folga={0.5} /></g>
    <Pop g={g} t0={6} cx={MEIO} cy={420}><Partido esq="RAISED BY" dir="RAISED BY" y={330} tam={70} folga={0.5} /><Partido esq="FEAR" dir="RESPECT" y={500} tam={170} folga={0.2} /></Pop>
    {(['a', 'b'] as Lado[]).map((l) => { const t = tema(l), x0 = l === 'a' ? 210 : MEIO + 520; return <g key={l} opacity={L(g, [16, 26], [0, 1])}><Peao x={x0 + 60} base={790 + Math.sin(g / 15) * 2} h={210} cor={t.claro} contorno={t.tinta} olho={t.tinta} olhar={[-0.8, 0.5]} /><Peao x={x0 - 70} base={790 - Math.sin(g / 15) * 2} h={120} cor={t.tinta} olho={t.fundo} olhar={[0.8, -0.6]} /></g>; })}
    {(v.n || 0) > 1 && <Pop g={g} t0={desde('n')} cx={MEIO} cy={690}><g transform={`translate(${MEIO} 690) scale(${1 + 0.04 * Math.sin(g / 5)}) translate(${-MEIO} -690)`}>
      <rect x={MEIO - 250} y={640} width={500} height={100} rx={50} fill={P.coral} /><text x={MEIO} y={706} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={46} fill="#FFFFFF" letterSpacing={6}>SUBSCRIBE</text></g></Pop>}
  </g>
);

// ---------- legenda (palavra por palavra) ----------
const Legenda: React.FC<{ f: Fala; q: number }> = ({ f, q }) => {
  const pal = f.txt.split(' '), dur = f.d * 30, tot = pal.reduce((s, p) => s + p.length + 1.5, 0);
  let ac = 0; const ini = pal.map((p) => { const x = ac; ac += p.length + 1.5; return (x / tot) * dur; });
  const ng = Math.ceil(pal.length / 7), por = Math.ceil(pal.length / ng);
  let gi = 0; for (let k = 0; k < ng; k++) if (q >= ini[k * por] - 2) gi = k;
  const de = gi * por, ate = Math.min(pal.length, de + por), dest = (f.dest || []).map((s) => s.toLowerCase());
  return (
    <div style={{ position: 'absolute', left: 0, top: 916, width: W, height: 130, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: P.creme, borderRadius: 22, padding: '16px 40px', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: P.mar, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.14)' }}>
        {pal.slice(de, ate).map((p, i) => {
          const k = de + i, dito = q >= ini[k] - 1, d = dest.includes(p.replace(/[^a-zA-Z'-]/g, '').toLowerCase());
          return <span key={k} style={{ opacity: dito ? 1 : 0.3, ...(d && dito ? { background: P.amb, borderRadius: 10, padding: '2px 10px', margin: '0 -10px' } : {}) }}>{p}{i < ate - de - 1 ? ' ' : ''}</span>;
        })}
      </div>
    </div>
  );
};

export const TCVideo: React.FC<{ tempos: TemposTC }> = ({ tempos }) => {
  const q = useCurrentFrame();
  if (!tempos) return null;
  const bl = tempos.blocos;
  let bi = 0; for (let k = 0; k < bl.length; k++) if (q >= Math.round(bl[k].ini * 30)) bi = k;
  const b = bl[bi], ini = Math.round(b.ini * 30), g0 = q - ini, pre = Math.round((b.pre || 0) * 30), D = Math.round((b.fim - b.ini) * 30);
  const emCap = !!b.cap && g0 < pre - 4, g = Math.max(0, g0 - (b.cap ? pre - 4 : 0));
  const ts = b.falas.map((x) => Math.round(x.t * 30) - ini - (b.cap ? pre - 4 : 0));
  const est = React.useMemo(() => { const a: V[] = []; let s: V = {}; for (const f of b.falas) { s = { ...s, ...(f.v || {}) }; for (const k of Object.keys(s)) if (s[k] === null) delete s[k]; a.push(s); } return a; }, [b]);
  let i = 0; for (let k = 0; k < ts.length; k++) if (g >= ts[k]) i = k;
  const v = est[i], fala = b.falas[i];
  const desde = (ch: string) => { let j = i; while (j > 0 && J(est[j - 1][ch]) === J(v[ch])) j--; return Math.max(0, ts[j]); };
  const falando = !emCap && q >= Math.round(fala.t * 30) - 2 && q <= Math.round((fala.t + fala.d) * 30) + 8;
  const entra = Math.min(1, (emCap ? g0 : g) / 7 + 0.001);
  return (
    <AbsoluteFill style={{ background: P.mar }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Fundo chao={false} />
        <g opacity={entra}>
          {emCap ? <Capitulo b={b} g={g0} />
            : b.cena === 'duo' ? <Duo b={b} v={v} g={g} desde={desde} fala={fala} D={D} />
              : b.cena === 'estudo' ? <Estudo b={b} v={v} g={g} desde={desde} fala={fala} />
                : b.cena === 'honesto' ? <Honesto v={v} g={g} desde={desde} />
                  : b.cena === 'vida' ? <Vida v={v} g={g} desde={desde} />
                    : b.cena === 'trocas' ? <Trocas v={v} g={g} desde={desde} fala={fala} />
                      : b.cena === 'fim' ? <Fim v={v} g={g} desde={desde} />
                        : <Texto v={v} g={g} desde={desde} />}
        </g>
      </svg>
      {falando && <Legenda f={fala} q={q - Math.round(fala.t * 30)} />}
      <AbsoluteFill style={{ background: '#000', opacity: Math.max(0, 1 - q / 10) }} />
    </AbsoluteFill>
  );
};
