import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Balao, MEIO, P, Papel, Peao, SANS, SLAB } from './lib';

// Two Childhoods: thumbnails v3 (1280x720, desenhadas em 1920x1080). Tudo vem de cfg.thumbs do roteiro.
// Referências (18/11/2026): Which One Are You ("AGE 6 → AGE 60", causa x consequência, 174 mil views) e o canal de bonecos brancos
// ("STRICT vs CHILL", "PHONE AT 8?!"): rosto grande e expressivo, 2 a 3 palavras gigantes, fundo saturado com brilho, uma cor de alerta.
type T = Record<string, any>;
const Fundo: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="thA" cx="50%" cy="55%" r="75%"><stop offset="0%" stopColor="#FFE07A" /><stop offset="100%" stopColor="#F08C12" /></radialGradient>
      <radialGradient id="thB" cx="50%" cy="55%" r="75%"><stop offset="0%" stopColor="#57A8F5" /><stop offset="100%" stopColor="#0E2F6E" /></radialGradient>
      <radialGradient id="thV" cx="50%" cy="50%" r="72%"><stop offset="62%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.5" /></radialGradient>
      <linearGradient id="thBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.72" /></linearGradient>
    </defs>
    <rect x={0} y={0} width={MEIO} height={1080} fill="url(#thA)" /><rect x={MEIO} y={0} width={MEIO} height={1080} fill="url(#thB)" />
    {[480, 1440].map((cx) => <g key={cx} transform={`translate(${cx} 640)`}>{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M 0 0 L -70 -1400 L 70 -1400 Z" transform={`rotate(${i * 30})`} fill="#fff" opacity={0.07} />)}</g>)}
    <clipPath id="thE"><rect x={0} y={0} width={MEIO} height={1080} /></clipPath><clipPath id="thD"><rect x={MEIO} y={0} width={MEIO} height={1080} /></clipPath>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#thV)" />
  </g>
);
const Tag: React.FC<{ x: number; y: number; t: string; dir?: boolean }> = ({ x, y, t, dir }) => {
  const w = t.length * 66 + 70, x0 = dir ? x - w : x;
  return <g transform={`rotate(${dir ? 3 : -3} ${x0 + w / 2} ${y + 70})`}><rect x={x0 + 10} y={y + 12} width={w} height={140} rx={20} fill="#000" opacity={0.35} /><rect x={x0} y={y} width={w} height={140} rx={20} fill="#FFE14A" stroke={P.mar} strokeWidth={10} /><text x={x0 + w / 2} y={y + 104} textAnchor="middle" fontFamily={SLAB} fontSize={102} fill={P.mar}>{t}</text></g>;
};
const Frase: React.FC<{ x: number; y: number; t: string; cor?: string; tam?: number; larg?: number; uma?: boolean }> = ({ x, y, t, cor = '#FFFFFF', tam = 150, larg = 900, uma }) => {
  const pal = t.split(' '); let ls = [t];
  if (!uma && t.length * tam * 0.6 > larg && pal.length > 1) { let best = 1, d = 1e9; for (let i = 1; i < pal.length; i++) { const a = pal.slice(0, i).join(' ').length, b = pal.slice(i).join(' ').length; if (Math.abs(a - b) < d) { d = Math.abs(a - b); best = i; } } ls = [pal.slice(0, best).join(' '), pal.slice(best).join(' ')]; }
  const m = Math.max(...ls.map((s) => s.length)), f = Math.min(tam, larg / (m * 0.6));
  return <g>{ls.map((s, i) => <text key={i} x={x} y={y - (ls.length - 1 - i) * f * 1.0} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={f} fill={cor} stroke="#0B1730" strokeWidth={f * 0.16} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-2}>{s}</text>)}</g>;
};
const Brilho: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <><circle cx={x} cy={y} r={r * 1.5} fill="#fff" opacity={0.14} /><circle cx={x} cy={y} r={r} fill="#fff" opacity={0.2} /></>;
// personagem grande, cortado embaixo: o rosto ocupa a capa
const Rosto: React.FC<{ lado: 'e' | 'd'; x: number; h: number; p: T }> = ({ lado, x, h, p }) => (
  <g clipPath={`url(#th${lado.toUpperCase()})`}>
    <Brilho x={x} y={1210 - h + h * 0.2} r={h * 0.3} />
    <Peao x={x} base={1210} h={h} tipo={p.tipo || 'sam'} cor={p.cor || P.coral} velho={p.velho} oculos={p.velho} coque={p.coque} humor={p.humor || 'feliz'} olhao lagrima={p.lagrima} olhar={p.olhar || [0, 0]} incl={p.incl || 0} />
    {p.papel && <g transform={`translate(${x + h * 0.3} ${1210 - h * 0.42})`}><Papel x={0} y={0} nota={p.papel} rot={10} larg={h * 0.22} cor={p.papelCor === 'coral' ? P.coral : P.mar} /></g>}
  </g>
);
const Seta: React.FC<{ y: number; vs?: boolean }> = ({ y, vs }) => vs
  ? <g><circle cx={MEIO + 6} cy={y + 8} r={112} fill="#000" opacity={0.35} /><circle cx={MEIO} cy={y} r={112} fill="#E5322D" stroke="#fff" strokeWidth={12} /><text x={MEIO} y={y + 40} textAnchor="middle" fontFamily={SLAB} fontSize={112} fill="#fff">VS</text></g>
  : <g><path d={`M ${MEIO - 110} ${y - 40} l 104 0 l 0 -52 l 122 92 l -122 92 l 0 -52 l -104 0 Z`} fill="#000" opacity={0.35} transform="translate(8 10)" /><path d={`M ${MEIO - 110} ${y - 40} l 104 0 l 0 -52 l 122 92 l -122 92 l 0 -52 l -104 0 Z`} fill="#FFE14A" stroke={P.mar} strokeWidth={12} strokeLinejoin="round" /></g>;
const Emenda: React.FC = () => <rect x={MEIO - 5} y={0} width={10} height={1080} fill="#fff" />;

// a — antes x depois: AGE 6 → AGE 60, rosto feliz x rosto em choque, uma frase embaixo de cada lado
const A: React.FC<{ c: T }> = ({ c }) => (
  <>
    <Fundo /><Rosto lado="e" x={330} h={c.hE || 760} p={c.pE} /><Rosto lado="d" x={MEIO + 600} h={c.hD || 900} p={c.pD} />
    {c.falaE && <g transform="translate(60 -40) scale(1.3)"><Balao x={480} y={330} linhas={c.falaE} ponta={[330, 470]} tam={56} dest={c.dest || []} /></g>}
    {c.pensaD && <g transform={`translate(${MEIO - 140} -30) scale(1.25)`}><Balao x={330} y={330} linhas={c.pensaD} ponta={[520, 430]} tam={56} pensa dest={c.dest || []} /></g>}
    <rect x={0} y={700} width={1920} height={380} fill="url(#thBase)" /><Emenda />
    <Tag x={36} y={30} t={c.tagE} /><Tag x={1884} y={30} t={c.tagD} dir /><Seta y={560} />
    <Frase x={480} y={1030} t={c.txE} tam={c.txE.length > 14 ? 132 : 116} larg={c.txE.length > 14 ? 900 : 940} /><Frase x={MEIO + 480} y={1030} t={c.txD} cor="#FFE14A" tam={c.txD.length > 14 ? 132 : 116} larg={c.txD.length > 14 ? 900 : 940} />
  </>
);
// b — VS: duas palavras gigantes, dois rostos adultos, selo VS
const B: React.FC<{ c: T }> = ({ c }) => (
  <>
    <Fundo /><Rosto lado="e" x={470} h={c.hE || 840} p={c.pE} /><Rosto lado="d" x={MEIO + 490} h={c.hD || 840} p={c.pD} />
    <rect x={0} y={740} width={1920} height={340} fill="url(#thBase)" /><Emenda />
    <Frase x={480} y={230} t={c.palE} tam={230} larg={880} cor="#FFFFFF" /><Frase x={MEIO + 480} y={230} t={c.palD} tam={230} larg={880} cor="#FFE14A" />
    <Seta y={540} vs />
    <Frase x={480} y={1040} t={c.txE} tam={104} larg={900} /><Frase x={MEIO + 480} y={1040} t={c.txD} tam={104} larg={900} cor="#FFE14A" />
  </>
);
// c — pergunta + placar no meio
const C: React.FC<{ c: T }> = ({ c }) => (
  <>
    <Fundo /><Rosto lado="e" x={330} h={c.hE || 800} p={c.pE} /><Rosto lado="d" x={MEIO + 630} h={c.hD || 800} p={c.pD} />
    <rect x={0} y={760} width={1920} height={320} fill="url(#thBase)" /><Emenda />
    <Frase x={MEIO} y={190} t={c.perg} tam={170} larg={1800} cor="#FFE14A" uma />
    <circle cx={MEIO + 8} cy={590} r={236} fill="#000" opacity={0.35} /><circle cx={MEIO} cy={580} r={236} fill="#0B1730" stroke="#FFE14A" strokeWidth={16} />
    <text x={MEIO - 26} y={640} textAnchor="end" fontFamily={SLAB} fontSize={210} fill="#FF5A47">{c.placar[0]}</text><text x={MEIO + 26} y={640} fontFamily={SLAB} fontSize={c.placar[1].length > 1 ? 150 : 210} fill="#FFE14A">{c.placar[1]}</text>
    <rect x={MEIO - 5} y={480} width={10} height={170} rx={5} fill="#fff" opacity={0.5} />
    <text x={MEIO} y={736} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={Math.min(30, 400 / (c.rot.length * 0.66))} fill="#fff" letterSpacing={1}>{c.rot}</text>
    <Frase x={400} y={1040} t={c.txE} tam={110} larg={760} /><Frase x={MEIO + 560} y={1040} t={c.txD} tam={110} larg={760} cor="#FFE14A" />
  </>
);
export const TCThumb: React.FC<{ v?: string; c?: T }> = ({ v = 'a', c }) => (
  <AbsoluteFill style={{ background: P.mar }}>
    <svg width={1280} height={720} viewBox="0 0 1920 1080">{!c ? null : v === 'a' ? <A c={c} /> : v === 'b' ? <B c={c} /> : <C c={c} />}</svg>
  </AbsoluteFill>
);
