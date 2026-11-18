import React from 'react';
import { Easing, interpolate } from 'remotion';
import '@fontsource/alfa-slab-one/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/jetbrains-mono/700.css';

// Two Childhoods: identidade do canal. Tudo em SVG, duas cores trocadas (âmbar x azul-marinho) e o peão da logo como personagem.
// Lado A (esquerda) = fundo âmbar com desenho marinho. Lado B (direita) = fundo marinho com desenho âmbar.
export const P = { amb: '#F2B441', mar: '#17304B', creme: '#FBF3E4', coral: '#E5533D', ambEsc: '#E0A02E', ambCla: '#F8CD74', marCla: '#234567', marMed: '#1D3B5C' };
export const SLAB = '"Alfa Slab One", "Inter", serif';
export const SANS = '"Inter", sans-serif';
export const MONO = '"JetBrains Mono", monospace';
export const W = 1920, H = 1080, MEIO = 960, CHAO = 800;
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const L = (f: number, a: number[], b: number[]) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

export type Lado = 'a' | 'b';
export const tema = (l: Lado) => l === 'a'
  ? { fundo: P.amb, tinta: P.mar, sombra: P.ambEsc, claro: P.ambCla }
  : { fundo: P.mar, tinta: P.amb, sombra: P.marMed, claro: P.marCla };

// Altura do peão por idade (a criança cresce de verdade na tela)
export const ALTURA: Record<number, number> = { 6: 190, 8: 215, 10: 235, 11: 245, 16: 300, 22: 325, 30: 330, 45: 328, 60: 318 };

// Peão: cabeça redonda + corpo trapezoidal, como na logo. `olhar` desloca os olhos (-1..1), `incl` inclina o corpo em graus.
export const Peao: React.FC<{ x: number; base?: number; h: number; cor: string; olho?: string; olhar?: [number, number]; incl?: number; contorno?: string; oculos?: boolean; op?: number; pisca?: number }> =
  ({ x, base = CHAO, h, cor, olho, olhar = [0, 0], incl = 0, contorno, oculos, op = 1, pisca = 0 }) => {
    const rh = h * 0.2, topo = rh * 1.72, hb = h - topo, wn = h * 0.2, wb = h * 0.44, r = h * 0.035;
    const corpo = `M ${-wn / 2} ${topo} Q 0 ${topo - wn * 0.42} ${wn / 2} ${topo} L ${wb / 2} ${h - r} Q ${wb / 2} ${h} ${wb / 2 - r} ${h} L ${-wb / 2 + r} ${h} Q ${-wb / 2} ${h} ${-wb / 2} ${h - r} Z`;
    const ex = olhar[0] * rh * 0.32, ey = olhar[1] * rh * 0.3, eo = rh * 0.34, er = rh * 0.13;
    const st = contorno ? { stroke: contorno, strokeWidth: 6, strokeLinejoin: 'round' as const } : {};
    return (
      <g transform={`translate(${x} ${base - h}) rotate(${incl} 0 ${h})`} opacity={op}>
        <path d={corpo} fill={cor} {...st} />
        <circle cx={0} cy={rh} r={rh} fill={cor} {...st} />
        {olho && <><ellipse cx={-eo + ex} cy={rh + ey} rx={er} ry={er * (1 - 0.85 * pisca)} fill={olho} /><ellipse cx={eo + ex} cy={rh + ey} rx={er} ry={er * (1 - 0.85 * pisca)} fill={olho} /></>}
        {olho && oculos && <g fill="none" stroke={olho} strokeWidth={rh * 0.09}><circle cx={-eo + ex} cy={rh + ey} r={er * 2.3} /><circle cx={eo + ex} cy={rh + ey} r={er * 2.3} /><path d={`M ${-eo + ex + er * 2.3} ${rh + ey} L ${eo + ex - er * 2.3} ${rh + ey}`} /></g>}
      </g>
    );
  };

// Braço simples: traço grosso do ombro até a mão
export const Braco: React.FC<{ de: [number, number]; ate: [number, number]; cor: string; l?: number }> = ({ de, ate, cor, l = 15 }) => (
  <path d={`M ${de[0]} ${de[1]} Q ${(de[0] + ate[0]) / 2} ${Math.max(de[1], ate[1]) + 14} ${ate[0]} ${ate[1]}`} fill="none" stroke={cor} strokeWidth={l} strokeLinecap="round" />
);

// Balão de fala (creme, texto marinho). `ponta` = x,y de quem fala. `pensa` troca a ponta por bolinhas.
export const Balao: React.FC<{ x: number; y: number; linhas: string[]; ponta: [number, number]; tam?: number; pensa?: boolean; dest?: string[] }> = ({ x, y, linhas, ponta, tam = 40, pensa, dest = [] }) => {
  const larg = Math.max(...linhas.map((s) => s.length)) * tam * 0.635 + 64, alt = linhas.length * tam * 1.22 + 44;
  const bx = x - larg / 2, by = y - alt / 2, px = Math.max(bx + 50, Math.min(bx + larg - 50, x + (ponta[0] - x) * 0.3));
  return (
    <g>
      {pensa
        ? <><circle cx={px + (ponta[0] - px) * 0.35} cy={by + alt + 24} r={13} fill={P.creme} /><circle cx={px + (ponta[0] - px) * 0.7} cy={by + alt + 52} r={8} fill={P.creme} /></>
        : <path d={`M ${px - 24} ${by + alt - 4} L ${px + (ponta[0] - px) * 0.75} ${Math.min(ponta[1], by + alt + 62)} L ${px + 24} ${by + alt - 4} Z`} fill={P.creme} />}
      <rect x={bx} y={by} width={larg} height={alt} rx={pensa ? alt / 2.2 : 26} fill={P.creme} />
      {linhas.map((s, i) => (
        <text key={i} x={x} y={by + 22 + tam * 0.95 + i * tam * 1.22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={tam} fill={P.mar} letterSpacing={0.5}>
          {s.split(' ').map((p, k) => <tspan key={k} fill={dest.includes(p.replace(/[^A-Z']/g, '')) ? P.coral : P.mar}>{p + ' '}</tspan>)}
        </text>
      ))}
    </g>
  );
};

// Selo da idade na emenda: metade marinho, metade âmbar, com o texto em cor trocada
export const Idade: React.FC<{ n: number | string; y?: number; r?: number }> = ({ n, y = 136, r = 100 }) => (
  <g>
    <defs>
      <clipPath id="idE"><rect x={0} y={0} width={MEIO} height={H} /></clipPath>
      <clipPath id="idD"><rect x={MEIO} y={0} width={MEIO} height={H} /></clipPath>
    </defs>
    {[['idE', P.mar, P.amb], ['idD', P.amb, P.mar]].map(([clip, fundo, txt]) => (
      <g key={clip} clipPath={`url(#${clip})`}>
        <circle cx={MEIO} cy={y} r={r} fill={fundo} />
        <text x={MEIO + 3} y={y - r * 0.47} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={r * 0.25} fill={txt} letterSpacing={6}>AGE</text>
        <text x={MEIO} y={y + r * 0.56} textAnchor="middle" fontFamily={SLAB} fontSize={r * 0.88} fill={txt}>{n}</text>
      </g>
    ))}
  </g>
);

// Texto grande centrado na emenda, com a cor trocada em cada metade (assinatura do canal)
export const Trocado: React.FC<{ txt: string; y: number; tam: number; fam?: string; peso?: number; esp?: number; id: string }> = ({ txt, y, tam, fam = SLAB, peso = 400, esp = 0, id }) => (
  <g>
    <defs>
      <clipPath id={id + 'E'}><rect x={0} y={0} width={MEIO} height={H} /></clipPath>
      <clipPath id={id + 'D'}><rect x={MEIO} y={0} width={MEIO} height={H} /></clipPath>
    </defs>
    <text x={MEIO} y={y} textAnchor="middle" fontFamily={fam} fontWeight={peso} fontSize={tam} fill={P.mar} letterSpacing={esp} clipPath={`url(#${id}E)`}>{txt}</text>
    <text x={MEIO} y={y} textAnchor="middle" fontFamily={fam} fontWeight={peso} fontSize={tam} fill={P.amb} letterSpacing={esp} clipPath={`url(#${id}D)`}>{txt}</text>
  </g>
);

// Título partido na emenda, como na logo: esquerda termina na emenda, direita começa nela
export const Partido: React.FC<{ esq: string; dir: string; y: number; tam: number; fam?: string; peso?: number; esp?: number; folga?: number; corE?: string; corD?: string }> = ({ esq, dir, y, tam, fam = SLAB, peso = 400, esp = 0, folga = 0.09, corE = P.mar, corD = P.amb }) => (
  <g>
    <text x={MEIO - tam * folga} y={y} textAnchor="end" fontFamily={fam} fontWeight={peso} fontSize={tam} fill={corE} letterSpacing={esp}>{esq}</text>
    <text x={MEIO + tam * folga} y={y} textAnchor="start" fontFamily={fam} fontWeight={peso} fontSize={tam} fill={corD} letterSpacing={esp}>{dir}</text>
  </g>
);

// Fundo dividido + chão de cada casa
export const Fundo: React.FC<{ chao?: boolean }> = ({ chao = true }) => (
  <g>
    <rect x={0} y={0} width={MEIO} height={H} fill={P.amb} />
    <rect x={MEIO} y={0} width={MEIO} height={H} fill={P.mar} />
    {chao && <><rect x={0} y={CHAO} width={MEIO} height={H - CHAO} fill={P.ambEsc} /><rect x={MEIO} y={CHAO} width={MEIO} height={H - CHAO} fill={P.marMed} /></>}
  </g>
);

// Faixa do alto de cada lado: o que a criança ouviu + a contagem em risquinhos
export const Topo: React.FC<{ lado: Lado; titulo: string; conta?: { rot: string; n: number; prog?: number } }> = ({ lado, titulo, conta }) => {
  const t = tema(lado), x0 = lado === 'a' ? 70 : MEIO + 150;
  const riscos: React.ReactNode[] = [];
  if (conta) for (let i = 0; i < conta.n; i++) {
    const g = Math.floor(i / 5), k = i % 5, bx = x0 + g * 92;
    riscos.push(k < 4
      ? <path key={i} d={`M ${bx + k * 15} 150 l 0 44`} stroke={t.tinta} strokeWidth={6} strokeLinecap="round" strokeDasharray={80} strokeDashoffset={i === conta.n - 1 ? 80 * (1 - (conta.prog ?? 1)) : 0} />
      : <path key={i} d={`M ${bx - 9} 188 L ${bx + 54} 156`} stroke={t.tinta} strokeWidth={6} strokeLinecap="round" strokeDasharray={80} strokeDashoffset={i === conta.n - 1 ? 80 * (1 - (conta.prog ?? 1)) : 0} />);
  }
  return (
    <g>
      <text x={x0} y={74} fontFamily={SANS} fontWeight={800} fontSize={22} fill={t.tinta} letterSpacing={5} opacity={0.75}>{lado === 'a' ? 'HOME A · WAS TOLD' : 'HOME B · WAS TOLD'}</text>
      <text x={x0} y={122} fontFamily={SLAB} fontSize={44} fill={t.tinta}>{titulo}</text>
      {conta && <>
        {conta.n === 0 && <text x={x0} y={192} fontFamily={SLAB} fontSize={44} fill={t.tinta}>0</text>}
        {riscos}
        <text x={x0 + (conta.n === 0 ? 52 : Math.floor(conta.n / 5) * 92 + (conta.n % 5 ? (conta.n % 5) * 15 + 22 : 0))} y={184} fontFamily={SANS} fontWeight={800} fontSize={22} fill={t.tinta} letterSpacing={4} opacity={0.75}>{conta.rot}</text>
      </>}
    </g>
  );
};

// Legenda: tarja creme embaixo, palavra-chave com marca-texto âmbar
export const Legenda: React.FC<{ txt: string; dest?: string[] }> = ({ txt, dest = [] }) => (
  <foreignObject x={0} y={916} width={W} height={130}>
    <div style={{ width: W, height: 130, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: P.creme, borderRadius: 22, padding: '16px 40px', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: P.mar, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.14)' }}>
        {txt.split(' ').map((p, i) => {
          const d = dest.includes(p.replace(/[^a-zA-Z']/g, '').toLowerCase());
          return <span key={i} style={d ? { background: P.amb, borderRadius: 10, padding: '2px 10px', margin: '0 4px 0 -6px' } : {}}>{p}{d ? '' : ' '}</span>;
        })}
      </div>
    </div>
  </foreignObject>
);

// Aviso de ilustração (honestidade: a história é inventada, os estudos são reais)
export const Aviso: React.FC<{ txt?: string }> = ({ txt = 'ILLUSTRATED STORY · BASED ON PUBLISHED RESEARCH' }) => (
  <text x={W - 60} y={1058} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={17} fill={P.amb} letterSpacing={2} opacity={0.6}>{txt}</text>
);

// ---------- Móveis (desenho de linha na cor do lado) ----------
export const Janela: React.FC<{ x: number; y: number; lado: Lado; noite?: boolean }> = ({ x, y, lado, noite }) => {
  const t = tema(lado);
  return (
    <g>
      <rect x={x} y={y} width={230} height={250} rx={14} fill={t.claro} stroke={t.tinta} strokeWidth={8} />
      {noite
        ? <path d={`M ${x + 150} ${y + 70} a 38 38 0 1 0 28 62 a 30 30 0 1 1 -28 -62 Z`} fill={t.tinta} />
        : <circle cx={x + 160} cy={y + 90} r={34} fill={t.tinta} />}
      <path d={`M ${x + 115} ${y} l 0 250 M ${x} ${y + 125} l 230 0`} stroke={t.tinta} strokeWidth={8} />
      <rect x={x - 16} y={y + 250} width={262} height={16} rx={6} fill={t.tinta} />
    </g>
  );
};
export const Mesa: React.FC<{ x: number; lado: Lado; larg?: number }> = ({ x, lado, larg = 300 }) => {
  const t = tema(lado), y = CHAO - 150;
  return (
    <g>
      <rect x={x} y={y} width={larg} height={18} rx={8} fill={t.tinta} />
      <path d={`M ${x + 26} ${y + 18} l 0 132 M ${x + larg - 26} ${y + 18} l 0 132`} stroke={t.tinta} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};
export const Luminaria: React.FC<{ x: number; lado: Lado }> = ({ x, lado }) => {
  const t = tema(lado), y = CHAO - 150;
  return (
    <g>
      <path d={`M ${x} ${y} l 0 -70 l 46 -46`} fill="none" stroke={t.tinta} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${x + 28} ${y - 132} l 56 30 l -34 34 Z`} fill={t.tinta} />
      <rect x={x - 26} y={y - 10} width={52} height={10} rx={5} fill={t.tinta} />
    </g>
  );
};
export const Prateleira: React.FC<{ x: number; y: number; lado: Lado; larg?: number; children?: React.ReactNode }> = ({ x, y, lado, larg = 300, children }) => {
  const t = tema(lado);
  return <g><rect x={x} y={y} width={larg} height={14} rx={6} fill={t.tinta} /><g transform={`translate(${x} ${y})`}>{children}</g></g>;
};
export const Livros: React.FC<{ x: number; lado: Lado; n?: number }> = ({ x, lado, n = 3 }) => {
  const t = tema(lado), hs = [70, 88, 60, 80, 66];
  return <g>{Array.from({ length: n }).map((_, i) => <rect key={i} x={x + i * 24} y={-hs[i % 5]} width={19} height={hs[i % 5]} rx={3} fill={i % 2 ? t.sombra : t.tinta} stroke={t.tinta} strokeWidth={3} />)}</g>;
};
export const Trofeu: React.FC<{ x: number; lado: Lado }> = ({ x, lado }) => {
  const t = tema(lado);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M -24 -84 L 24 -84 L 18 -44 Q 0 -26 -18 -44 Z" fill={t.tinta} />
      <path d="M -24 -76 q -20 4 -8 26 M 24 -76 q 20 4 8 26" fill="none" stroke={t.tinta} strokeWidth={6} strokeLinecap="round" />
      <rect x={-5} y={-36} width={10} height={22} fill={t.tinta} /><rect x={-22} y={-14} width={44} height={14} rx={4} fill={t.tinta} />
    </g>
  );
};
export const Papel: React.FC<{ x: number; y: number; nota: string; rot?: number; larg?: number; cor?: string }> = ({ x, y, nota, rot = -6, larg = 96, cor = P.mar }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-larg / 2} y={-larg * 0.64} width={larg} height={larg * 1.28} rx={6} fill={P.creme} stroke={P.mar} strokeWidth={4} />
    <text x={0} y={larg * 0.08} textAnchor="middle" fontFamily={SLAB} fontSize={larg * 0.42} fill={cor}>{nota}</text>
    <path d={`M ${-larg * 0.3} ${larg * 0.3} l ${larg * 0.6} 0 M ${-larg * 0.3} ${larg * 0.44} l ${larg * 0.4} 0`} stroke={P.mar} strokeWidth={4} strokeLinecap="round" opacity={0.35} />
  </g>
);
export const Carimbo: React.FC<{ x: number; y: number; txt: string; cor?: string; rot?: number; tam?: number }> = ({ x, y, txt, cor = P.coral, rot = -9, tam = 40 }) => {
  const larg = txt.length * tam * 0.66 + 44;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-larg / 2} y={-tam * 0.85} width={larg} height={tam * 1.6} rx={10} fill={P.creme} stroke={cor} strokeWidth={7} />
      <text x={0} y={tam * 0.3} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={tam} fill={cor} letterSpacing={3}>{txt}</text>
    </g>
  );
};
