import React from 'react';
import { Easing, interpolate } from 'remotion';
import '@fontsource/alfa-slab-one/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/jetbrains-mono/700.css';

// Two Childhoods: identidade do canal (versão 2, 18/11/2026: mais cores, sombra e profundidade, a pedido do Tavin).
// Casa A (esquerda) = parede amarela quente. Casa B (direita) = parede azul clara. Móveis de madeira, janela com céu, tapete, planta.
// Personagens = o peão da logo, agora com pele, cabelo, roupa colorida, boca e sombra. Sam usa sempre a mesma roupa coral nas duas casas.
export const P = { amb: '#F2B441', mar: '#17304B', creme: '#FBF3E4', coral: '#E5533D', ambEsc: '#E0A02E', ambCla: '#F8CD74', marCla: '#234567', marMed: '#1D3B5C',
  azul: '#3F82C7', azulEsc: '#2A62A6', pele: '#F6CFA4', cabelo: '#5B3A22', grisalho: '#C9CBD1', madeira: '#9A6638', madeiraEsc: '#75492A', madeiraCla: '#C08A52',
  ouro: '#F4B91E', verde: '#4DA56D', verdeEsc: '#2F7D56', roxo: '#7B61B5', ceu: '#9AD6F7', noite: '#1D2C57' };
export const SLAB = '"Alfa Slab One", "Inter", serif';
export const SANS = '"Inter", sans-serif';
export const MONO = '"JetBrains Mono", monospace';
export const W = 1920, H = 1080, MEIO = 960, CHAO = 800;
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const L = (f: number, a: number[], b: number[]) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

export type Lado = 'a' | 'b';
// fundo = parede; tinta = traço/texto; claro e sombra = tons de apoio; acento = cor forte do lado
export const tema = (l: Lado) => l === 'a'
  ? { fundo: '#F7D77E', tinta: P.mar, sombra: '#E9BC52', claro: '#FCE9B4', acento: '#D8900C', chao: '#C58B56', chao2: '#AD7441', tapete: '#D8553F', roupaPai: '#3E9A78' }
  : { fundo: '#A9CCEC', tinta: P.mar, sombra: '#86B3DE', claro: '#D3E6F7', acento: P.azulEsc, chao: '#A47B58', chao2: '#8A6444', tapete: '#3E9A8F', roupaPai: P.roxo };

// Altura do peão por idade (a criança cresce de verdade na tela)
export const ALTURA: Record<number, number> = { 6: 190, 8: 215, 10: 235, 11: 245, 16: 300, 22: 325, 30: 330, 45: 328, 60: 318 };

// Peão. tipo 'icone' = pictograma de uma cor só (gráficos). 'sam' | 'pai' | 'filho' = personagem com pele, cabelo, roupa, boca e sombra.
// `olhar` desloca os olhos (-1..1), `incl` inclina, `humor` = feliz | triste | neutro, `velho` = cabelo grisalho.
export type TipoPeao = 'icone' | 'sam' | 'pai' | 'filho';
export const Peao: React.FC<{ x: number; base?: number; h: number; cor: string; olho?: string; olhar?: [number, number]; incl?: number; contorno?: string; oculos?: boolean; op?: number; pisca?: number; tipo?: TipoPeao; humor?: string; velho?: boolean; coque?: boolean }> =
  ({ x, base = CHAO, h, cor, olho, olhar = [0, 0], incl = 0, contorno, oculos, op = 1, pisca = 0, tipo = 'icone', humor = 'neutro', velho, coque }) => {
    const rh = h * 0.2, topo = rh * 1.72, wn = h * 0.2, wb = h * 0.44, r = h * 0.035;
    const corpo = `M ${-wn / 2} ${topo} Q 0 ${topo - wn * 0.42} ${wn / 2} ${topo} L ${wb / 2} ${h - r} Q ${wb / 2} ${h} ${wb / 2 - r} ${h} L ${-wb / 2 + r} ${h} Q ${-wb / 2} ${h} ${-wb / 2} ${h - r} Z`;
    const meio = `M 0 ${topo - wn * 0.2} L ${wn / 2} ${topo} L ${wb / 2} ${h - r} Q ${wb / 2} ${h} ${wb / 2 - r} ${h} L 0 ${h} Z`;
    const ex = olhar[0] * rh * 0.32, ey = olhar[1] * rh * 0.3, eo = rh * 0.34, er = rh * 0.13;
    if (tipo === 'icone') {
      const st = contorno ? { stroke: contorno, strokeWidth: 6, strokeLinejoin: 'round' as const } : {};
      return (
        <g transform={`translate(${x} ${base - h}) rotate(${incl} 0 ${h})`} opacity={op}>
          <path d={corpo} fill={cor} {...st} /><circle cx={0} cy={rh} r={rh} fill={cor} {...st} />
          {olho && <><ellipse cx={-eo + ex} cy={rh + ey} rx={er} ry={er * (1 - 0.85 * pisca)} fill={olho} /><ellipse cx={eo + ex} cy={rh + ey} rx={er} ry={er * (1 - 0.85 * pisca)} fill={olho} /></>}
        </g>
      );
    }
    const cab = velho ? P.grisalho : tipo === 'pai' ? '#3B2A20' : P.cabelo, tinta = '#2A1E18', my = rh * 1.42 + ey * 0.3, m = rh * 0.26;
    return (
      <g opacity={op}>
        <ellipse cx={x + h * 0.05} cy={base + 4} rx={wb * 0.72} ry={h * 0.045} fill="#000" opacity={0.2} />
        <g transform={`translate(${x} ${base - h}) rotate(${incl} 0 ${h})`}>
          <path d={corpo} fill={cor} /><path d={meio} fill="#000" opacity={0.13} />
          <path d={`M ${-wn * 0.34} ${topo + rh * 0.05} Q 0 ${topo + rh * 0.5} ${wn * 0.34} ${topo + rh * 0.05}`} fill="none" stroke="#fff" strokeWidth={rh * 0.1} opacity={0.35} strokeLinecap="round" />
          {coque && <circle cx={0} cy={-rh * 0.12} r={rh * 0.42} fill={cab} />}
          <circle cx={0} cy={rh} r={rh} fill={P.pele} />
          <path d={`M 0 0 A ${rh} ${rh} 0 0 1 0 ${rh * 2} A ${rh * 1.25} ${rh} 0 0 0 0 0 Z`} fill="#000" opacity={0.07} />
          <path d={`M ${-rh * 0.99} ${rh * 0.88} A ${rh} ${rh} 0 0 1 ${rh * 0.99} ${rh * 0.88} Q ${rh * 0.55} ${rh * 0.3} ${-rh * 0.1} ${rh * 0.5} Q ${-rh * 0.65} ${rh * 0.62} ${-rh * 0.99} ${rh * 0.88} Z`} fill={cab} />
          <circle cx={-eo * 1.55} cy={rh * 1.3} r={rh * 0.15} fill="#F08A7A" opacity={0.5} /><circle cx={eo * 1.55} cy={rh * 1.3} r={rh * 0.15} fill="#F08A7A" opacity={0.5} />
          <ellipse cx={-eo + ex} cy={rh * 1.05 + ey} rx={er} ry={er * 1.15 * (1 - 0.85 * pisca)} fill={tinta} /><ellipse cx={eo + ex} cy={rh * 1.05 + ey} rx={er} ry={er * 1.15 * (1 - 0.85 * pisca)} fill={tinta} />
          {humor === 'triste' && <><path d={`M ${-eo - er * 1.6 + ex} ${rh * 0.78 + ey} l ${er * 2.6} ${-er * 0.9}`} stroke={tinta} strokeWidth={rh * 0.07} strokeLinecap="round" /><path d={`M ${eo + er * 1.6 + ex} ${rh * 0.78 + ey} l ${-er * 2.6} ${-er * 0.9}`} stroke={tinta} strokeWidth={rh * 0.07} strokeLinecap="round" /></>}
          <path d={humor === 'feliz' ? `M ${-m + ex * 0.5} ${my} Q ${ex * 0.5} ${my + m * 0.95} ${m + ex * 0.5} ${my}` : humor === 'triste' ? `M ${-m * 0.8 + ex * 0.5} ${my + m * 0.4} Q ${ex * 0.5} ${my - m * 0.3} ${m * 0.8 + ex * 0.5} ${my + m * 0.4}` : `M ${-m * 0.7 + ex * 0.5} ${my + m * 0.2} Q ${ex * 0.5} ${my + m * 0.45} ${m * 0.7 + ex * 0.5} ${my + m * 0.2}`} fill="none" stroke={tinta} strokeWidth={rh * 0.085} strokeLinecap="round" />
          {oculos && <g fill="none" stroke={tinta} strokeWidth={rh * 0.07}><circle cx={-eo + ex} cy={rh * 1.05 + ey} r={er * 2.2} fill="#fff" fillOpacity={0.25} /><circle cx={eo + ex} cy={rh * 1.05 + ey} r={er * 2.2} fill="#fff" fillOpacity={0.25} /><path d={`M ${-eo + ex + er * 2.2} ${rh * 1.05 + ey} L ${eo + ex - er * 2.2} ${rh * 1.05 + ey}`} /></g>}
        </g>
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
        ? <><circle cx={px + (ponta[0] - px) * 0.35} cy={by + alt + 24} r={13} fill="#FFFFFF" /><circle cx={px + (ponta[0] - px) * 0.7} cy={by + alt + 52} r={8} fill="#FFFFFF" /></>
        : <path d={`M ${px - 24} ${by + alt - 4} L ${px + (ponta[0] - px) * 0.75} ${Math.min(ponta[1], by + alt + 62)} L ${px + 24} ${by + alt - 4} Z`} fill="#FFFFFF" />}
      <rect x={bx + 6} y={by + 10} width={larg} height={alt} rx={pensa ? alt / 2.2 : 26} fill="#000" opacity={0.16} />
      <rect x={bx} y={by} width={larg} height={alt} rx={pensa ? alt / 2.2 : 26} fill="#FFFFFF" />
      {linhas.map((s, i) => (
        <text key={i} x={x} y={by + 22 + tam * 0.95 + i * tam * 1.22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={tam} fill={P.mar} letterSpacing={0.5}>
          {s.split(' ').map((p, k) => <tspan key={k} fill={dest.includes(p.replace(/[^A-Z']/g, '')) ? P.coral : P.mar}>{p + ' '}</tspan>)}
        </text>
      ))}
    </g>
  );
};

// Selo da idade na emenda: disco branco com sombra, metade do aro amarela e metade azul
export const Idade: React.FC<{ n: number | string; y?: number; r?: number }> = ({ n, y = 136, r = 100 }) => (
  <g>
    <circle cx={MEIO + 5} cy={y + 9} r={r} fill="#000" opacity={0.2} />
    <path d={`M ${MEIO} ${y - r} A ${r} ${r} 0 0 0 ${MEIO} ${y + r} Z`} fill={P.amb} /><path d={`M ${MEIO} ${y - r} A ${r} ${r} 0 0 1 ${MEIO} ${y + r} Z`} fill={P.azul} />
    <circle cx={MEIO} cy={y} r={r - 13} fill="#FFFFFF" />
    <text x={MEIO + 3} y={y - r * 0.4} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={r * 0.22} fill={P.mar} letterSpacing={6}>AGE</text>
    <text x={MEIO} y={y + r * 0.5} textAnchor="middle" fontFamily={SLAB} fontSize={r * 0.82} fill={P.mar}>{n}</text>
  </g>
);

// Título partido na emenda, como na logo: esquerda (marinho sobre amarelo) termina na emenda, direita (branco sobre azul) começa nela
export const Partido: React.FC<{ esq: string; dir: string; y: number; tam: number; fam?: string; peso?: number; esp?: number; folga?: number; corE?: string; corD?: string }> = ({ esq, dir, y, tam, fam = SLAB, peso = 400, esp = 0, folga = 0.09, corE = P.mar, corD = '#FFFFFF' }) => {
  const so = Math.max(3, tam * 0.045);
  return (
    <g>
      <text x={MEIO - tam * folga + so} y={y + so} textAnchor="end" fontFamily={fam} fontWeight={peso} fontSize={tam} fill="#000" opacity={0.16} letterSpacing={esp}>{esq}</text>
      <text x={MEIO + tam * folga + so} y={y + so} textAnchor="start" fontFamily={fam} fontWeight={peso} fontSize={tam} fill="#000" opacity={0.28} letterSpacing={esp}>{dir}</text>
      <text x={MEIO - tam * folga} y={y} textAnchor="end" fontFamily={fam} fontWeight={peso} fontSize={tam} fill={corE} letterSpacing={esp}>{esq}</text>
      <text x={MEIO + tam * folga} y={y} textAnchor="start" fontFamily={fam} fontWeight={peso} fontSize={tam} fill={corD} letterSpacing={esp}>{dir}</text>
    </g>
  );
};

// Fundo. chao=true: as duas casas (parede com luz, rodapé, piso de madeira). chao=false: cartão (amarelo quente | azul), com luz e bolinhas.
export const Fundo: React.FC<{ chao?: boolean; noite?: boolean }> = ({ chao = true, noite }) => {
  const A = tema('a'), B = tema('b'), k = chao ? 'c' : 'k';
  return (
    <g>
      <defs>
        <radialGradient id={"tcLuzA" + k} cx="38%" cy="34%" r="80%"><stop offset="0%" stopColor={chao ? '#FDEBB5' : '#FFDE7E'} /><stop offset="100%" stopColor={chao ? '#F2C860' : '#F0AC2E'} /></radialGradient>
        <radialGradient id={"tcLuzB" + k} cx="62%" cy="34%" r="80%"><stop offset="0%" stopColor={chao ? '#C7E0F6' : '#5BA2E2'} /><stop offset="100%" stopColor={chao ? '#8DB6E0' : '#2A62A6'} /></radialGradient>
        <linearGradient id={"tcChaoA" + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.chao} /><stop offset="100%" stopColor={A.chao2} /></linearGradient>
        <linearGradient id={"tcChaoB" + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={B.chao} /><stop offset="100%" stopColor={B.chao2} /></linearGradient>
        <pattern id="tcBol" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="5" fill="#fff" opacity="0.1" /><circle cx="48" cy="48" r="5" fill="#fff" opacity="0.1" /></pattern>
        <linearGradient id="tcEmenda" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.22" /></linearGradient>
      </defs>
      <rect x={0} y={0} width={MEIO} height={H} fill={`url(#tcLuzA${k})`} /><rect x={MEIO} y={0} width={MEIO} height={H} fill={`url(#tcLuzB${k})`} />
      {!chao && <rect x={0} y={0} width={W} height={H} fill="url(#tcBol)" />}
      {chao && <>
        {noite && <rect x={0} y={0} width={W} height={CHAO} fill="#1B2550" opacity={0.2} />}
        <rect x={0} y={CHAO - 26} width={MEIO} height={26} fill="#FFF7E4" /><rect x={MEIO} y={CHAO - 26} width={MEIO} height={26} fill="#F1F6FB" />
        <rect x={0} y={CHAO - 26} width={W} height={5} fill="#000" opacity={0.08} />
        <rect x={0} y={CHAO} width={MEIO} height={H - CHAO} fill={`url(#tcChaoA${k})`} /><rect x={MEIO} y={CHAO} width={MEIO} height={H - CHAO} fill={`url(#tcChaoB${k})`} />
        {[0, 1, 2].map((i) => <rect key={i} x={0} y={CHAO + 70 + i * 86} width={W} height={3} fill="#000" opacity={0.1} />)}
        {Array.from({ length: 12 }).map((_, i) => <rect key={'t' + i} x={90 + i * 160 + (i % 2) * 40} y={CHAO + (i % 3) * 86 + (i % 3 ? 73 : 0)} width={3} height={i % 3 ? 86 : 70} fill="#000" opacity={0.08} />)}
        <rect x={0} y={CHAO} width={W} height={14} fill="#000" opacity={0.12} />
        {noite && <rect x={0} y={CHAO} width={W} height={H - CHAO} fill="#1B2550" opacity={0.22} />}
      </>}
      <rect x={MEIO - 40} y={0} width={40} height={H} fill="url(#tcEmenda)" /><rect x={MEIO - 3} y={0} width={6} height={H} fill="#FFFFFF" opacity={0.9} />
    </g>
  );
};

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
      <rect x={x0 - 22} y={46} width={conta ? 590 : 500} height={conta ? 176 : 104} rx={20} fill="#000" opacity={0.12} />
      <rect x={x0 - 28} y={38} width={conta ? 590 : 500} height={conta ? 176 : 104} rx={20} fill="#FFFFFF" opacity={0.92} />
            <text x={x0} y={74} fontFamily={SANS} fontWeight={800} fontSize={22} fill={t.acento} letterSpacing={5}>{lado === 'a' ? 'HOME A · WAS TOLD' : 'HOME B · WAS TOLD'}</text>
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

// ---------- Móveis (madeira, vidro, tecido; cada um com sombra) ----------
export const Janela: React.FC<{ x: number; y: number; lado: Lado; noite?: boolean }> = ({ x, y, lado, noite }) => {
  const a = lado === 'a', cort = a ? '#E8674F' : '#3E9A8F', id = 'tcCeu' + lado + (noite ? 'n' : 'd');
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={noite ? '#16224A' : '#7CC8F5'} /><stop offset="100%" stopColor={noite ? '#34467E' : '#D6F0FD'} /></linearGradient></defs>
      <rect x={x - 6} y={y + 4} width={254} height={262} rx={16} fill="#000" opacity={0.14} />
      <rect x={x - 12} y={y - 12} width={254} height={274} rx={16} fill="#FFFFFF" />
      <rect x={x} y={y} width={230} height={250} rx={8} fill={`url(#${id})`} />
      {noite
        ? <><path d={`M ${x + 150} ${y + 60} a 38 38 0 1 0 28 62 a 30 30 0 1 1 -28 -62 Z`} fill="#FFF2B8" />{[[40, 50], [84, 150], [30, 190], [190, 190], [100, 40]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={y + dy} r={3.5} fill="#fff" opacity={0.85} />)}</>
        : <><circle cx={x + 165} cy={y + 78} r={32} fill="#FFD95A" /><circle cx={x + 165} cy={y + 78} r={46} fill="#FFD95A" opacity={0.3} /><ellipse cx={x + 70} cy={y + 150} rx={48} ry={18} fill="#fff" opacity={0.9} /><ellipse cx={x + 104} cy={y + 138} rx={34} ry={18} fill="#fff" opacity={0.9} />
          <path d={`M ${x} ${y + 250} L ${x} ${y + 212} Q ${x + 60} ${y + 180} ${x + 120} ${y + 210} Q ${x + 180} ${y + 186} ${x + 230} ${y + 214} L ${x + 230} ${y + 250} Z`} fill="#6FBF73" /></>}
      <path d={`M ${x + 115} ${y} l 0 250 M ${x} ${y + 125} l 230 0`} stroke="#FFFFFF" strokeWidth={10} />
      <path d={`M ${x - 14} ${y - 8} Q ${x + 40} ${y + 110} ${x - 8} ${y + 262} L ${x - 30} ${y + 262} L ${x - 30} ${y - 8} Z`} fill={cort} /><path d={`M ${x + 244} ${y - 8} Q ${x + 190} ${y + 110} ${x + 238} ${y + 262} L ${x + 260} ${y + 262} L ${x + 260} ${y - 8} Z`} fill={cort} />
      <rect x={x - 44} y={y - 26} width={318} height={16} rx={8} fill={P.madeiraEsc} />
      <rect x={x - 22} y={y + 256} width={274} height={18} rx={6} fill="#FFFFFF" /><rect x={x - 22} y={y + 270} width={274} height={5} fill="#000" opacity={0.12} />
    </g>
  );
};
export const Mesa: React.FC<{ x: number; lado: Lado; larg?: number }> = ({ x, larg = 300 }) => {
  const y = CHAO - 150;
  return (
    <g>
      <ellipse cx={x + larg / 2 + 10} cy={CHAO + 6} rx={larg * 0.56} ry={14} fill="#000" opacity={0.18} />
      <rect x={x + 20} y={y + 18} width={16} height={134} fill={P.madeiraEsc} /><rect x={x + larg - 36} y={y + 18} width={16} height={134} fill={P.madeiraEsc} />
      <rect x={x + 20} y={y + 18} width={larg - 40} height={26} fill={P.madeiraEsc} opacity={0.85} />
      <rect x={x} y={y} width={larg} height={22} rx={8} fill={P.madeira} /><rect x={x} y={y} width={larg} height={8} rx={4} fill={P.madeiraCla} />
    </g>
  );
};
export const Luminaria: React.FC<{ x: number; lado: Lado; acesa?: boolean }> = ({ x, acesa = true }) => {
  const y = CHAO - 150;
  return (
    <g>
      {acesa && <path d={`M ${x + 40} ${y - 108} L ${x + 150} ${y} L ${x - 40} ${y} Z`} fill="#FFE27A" opacity={0.32} />}
      <path d={`M ${x} ${y} l 0 -70 l 46 -46`} fill="none" stroke="#3B4A5E" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${x + 28} ${y - 132} l 56 30 l -34 34 Z`} fill="#E5533D" /><circle cx={x + 62} cy={y - 96} r={9} fill="#FFE27A" />
      <rect x={x - 28} y={y - 12} width={56} height={12} rx={6} fill="#3B4A5E" />
    </g>
  );
};
export const Prateleira: React.FC<{ x: number; y: number; lado: Lado; larg?: number; children?: React.ReactNode }> = ({ x, y, larg = 300, children }) => (
  <g><rect x={x + 6} y={y + 12} width={larg} height={16} rx={6} fill="#000" opacity={0.14} /><g transform={`translate(${x} ${y})`}>{children}</g><rect x={x} y={y} width={larg} height={18} rx={6} fill={P.madeira} /><rect x={x} y={y} width={larg} height={6} rx={3} fill={P.madeiraCla} />
    <path d={`M ${x + 30} ${y + 18} l 0 26 l 22 -26 Z M ${x + larg - 30} ${y + 18} l 0 26 l -22 -26 Z`} fill={P.madeiraEsc} /></g>
);
const CORES_LIVRO = ['#E5533D', '#3F82C7', '#4DA56D', '#F4B91E', '#7B61B5', '#EC8A3C'];
export const Livros: React.FC<{ x: number; lado: Lado; n?: number }> = ({ x, n = 3 }) => {
  const hs = [70, 88, 60, 80, 66];
  return <g>{Array.from({ length: n }).map((_, i) => <g key={i}><rect x={x + i * 25} y={-hs[i % 5]} width={21} height={hs[i % 5]} rx={3} fill={CORES_LIVRO[(i + Math.round(x)) % 6]} /><rect x={x + i * 25 + 15} y={-hs[i % 5]} width={6} height={hs[i % 5]} rx={2} fill="#000" opacity={0.15} /><rect x={x + i * 25 + 3} y={-hs[i % 5] + 10} width={15} height={4} fill="#fff" opacity={0.6} /></g>)}</g>;
};
export const Trofeu: React.FC<{ x: number; lado: Lado }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M -24 -76 q -20 4 -8 26 M 24 -76 q 20 4 8 26" fill="none" stroke="#D99A12" strokeWidth={6} strokeLinecap="round" />
    <path d="M -24 -84 L 24 -84 L 18 -44 Q 0 -26 -18 -44 Z" fill={P.ouro} /><path d="M 4 -84 L 24 -84 L 18 -44 Q 10 -34 4 -32 Z" fill="#000" opacity={0.12} /><path d="M -16 -78 l 4 28" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    <rect x={-5} y={-36} width={10} height={22} fill="#D99A12" /><rect x={-22} y={-14} width={44} height={14} rx={4} fill={P.madeiraEsc} />
  </g>
);
// Tapete, planta e quadro: enchem a casa de cor
export const Tapete: React.FC<{ x: number; larg: number; lado: Lado }> = ({ x, larg, lado }) => { const t = tema(lado); return <g><ellipse cx={x} cy={CHAO + 70} rx={larg / 2} ry={46} fill={t.tapete} /><ellipse cx={x} cy={CHAO + 70} rx={larg / 2 - 22} ry={32} fill="none" stroke="#fff" strokeWidth={5} opacity={0.5} /></g>; };
export const Planta: React.FC<{ x: number; g?: number }> = ({ x, g = 0 }) => (
  <g transform={`translate(${x} ${CHAO})`}>
    <ellipse cx={4} cy={4} rx={44} ry={9} fill="#000" opacity={0.18} />
    {[-34, -14, 8, 30].map((r, i) => <path key={i} d="M 0 -60 Q -26 -130 0 -200 Q 26 -130 0 -60 Z" transform={`rotate(${r + Math.sin(g / 28 + i) * 2.2} 0 -60)`} fill={i % 2 ? P.verde : P.verdeEsc} />)}
    <path d="M -36 -70 L 36 -70 L 28 0 L -28 0 Z" fill="#D9743F" /><rect x={-40} y={-80} width={80} height={16} rx={6} fill="#EC8A53" /><path d="M 8 -64 L 36 -70 L 28 0 L 8 0 Z" fill="#000" opacity={0.12} />
  </g>
);
export const Quadro: React.FC<{ x: number; y: number; cor?: string }> = ({ x, y, cor = '#F28B66' }) => (
  <g><rect x={x + 5} y={y + 8} width={110} height={90} rx={6} fill="#000" opacity={0.14} /><rect x={x} y={y} width={110} height={90} rx={6} fill="#FFFFFF" /><rect x={x + 10} y={y + 10} width={90} height={70} fill={cor} /><path d={`M ${x + 10} ${y + 80} l 30 -34 l 22 22 l 16 -14 l 22 26 Z`} fill="#fff" opacity={0.7} /><circle cx={x + 80} cy={y + 30} r={9} fill="#fff" opacity={0.8} /></g>
);
export const Papel: React.FC<{ x: number; y: number; nota: string; rot?: number; larg?: number; cor?: string }> = ({ x, y, nota, rot = -6, larg = 96, cor = P.mar }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-larg / 2 + 5} y={-larg * 0.64 + 7} width={larg} height={larg * 1.28} rx={6} fill="#000" opacity={0.18} />
    <rect x={-larg / 2} y={-larg * 0.64} width={larg} height={larg * 1.28} rx={6} fill="#FFFFFF" stroke={P.mar} strokeWidth={4} />
    <text x={0} y={larg * 0.08} textAnchor="middle" fontFamily={SLAB} fontSize={larg * 0.42} fill={cor}>{nota}</text>
    <path d={`M ${-larg * 0.3} ${larg * 0.3} l ${larg * 0.6} 0 M ${-larg * 0.3} ${larg * 0.44} l ${larg * 0.4} 0`} stroke={P.mar} strokeWidth={4} strokeLinecap="round" opacity={0.35} />
  </g>
);
export const Carimbo: React.FC<{ x: number; y: number; txt: string; cor?: string; rot?: number; tam?: number }> = ({ x, y, txt, cor = P.coral, rot = -9, tam = 40 }) => {
  const larg = txt.length * tam * 0.66 + 44;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-larg / 2 + 5} y={-tam * 0.85 + 8} width={larg} height={tam * 1.6} rx={10} fill="#000" opacity={0.2} />
      <rect x={-larg / 2} y={-tam * 0.85} width={larg} height={tam * 1.6} rx={10} fill="#FFFFFF" stroke={cor} strokeWidth={7} />
      <text x={0} y={tam * 0.3} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={tam} fill={cor} letterSpacing={3}>{txt}</text>
    </g>
  );
};
