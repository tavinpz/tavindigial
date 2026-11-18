import React from 'react';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

// Hard to Copy: identidade do canal. Tudo em SVG, sem logotipo de empresa e sem imagem gerada.
// Regra de cor: menta = o original (a coisa de verdade); tracejado cinza = a cópia; âmbar = medida/número; violeta = luz EUV.
export const P = { fundo: '#0A0D0C', painel: '#111715', linha: '#1E2824', osso: '#ECEFEA', cinza: '#7F8B86', fantasma: '#55615C', menta: '#5BE3A6', mentaEsc: '#1E5A44', ambar: '#FFB84D', luz: '#BBA6FF', verm: '#FF5A4F' };
export const TIT = '"Space Grotesk", "Inter", sans-serif';
export const MONO = '"JetBrains Mono", monospace';
export const SANS = '"Inter", sans-serif';
export const W = 1920, H = 1080, M = 96;

export const Defs: React.FC = () => (
  <defs>
    <pattern id="pontos" width="48" height="48" patternUnits="userSpaceOnUse"><circle cx="24" cy="24" r="1.5" fill={P.osso} opacity="0.075" /></pattern>
    <radialGradient id="foco" cx="50%" cy="46%" r="70%"><stop offset="0" stopColor="#121A17" /><stop offset="1" stopColor={P.fundo} /></radialGradient>
    <pattern id="hach" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" stroke={P.menta} strokeWidth="2" opacity="0.35" /></pattern>
    <pattern id="hachC" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" stroke={P.cinza} strokeWidth="2" opacity="0.4" /></pattern>
    <filter id="halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
    <marker id="seta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={P.osso} /></marker>
    <marker id="setaM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={P.menta} /></marker>
    <marker id="setaA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={P.ambar} /></marker>
  </defs>
);

export const Fundo: React.FC = () => (<><rect width={W} height={H} fill="url(#foco)" /><rect width={W} height={H} fill="url(#pontos)" /></>);

// Cabeçalho e rodapé fixos: em qual trava estamos (1 a 5), a fonte do dado e a assinatura do canal.
export const Moldura: React.FC<{ trava?: number; nome?: string; fonte?: string; total?: number }> = ({ trava, nome, fonte, total = 5 }) => (
  <g>
    {trava != null && (
      <g transform={`translate(${M},70)`}>
        {Array.from({ length: total }, (_, i) => {
          const feito = i + 1 < trava, atual = i + 1 === trava;
          return <rect key={i} x={i * 30} y={0} width={20} height={20} rx={3} fill={feito ? P.menta : atual ? P.ambar : 'none'} stroke={feito ? P.menta : atual ? P.ambar : P.fantasma} strokeWidth={2.5} />;
        })}
        <text x={total * 30 + 14} y={17} fontFamily={MONO} fontWeight={700} fontSize={22} fill={P.osso} letterSpacing={2.5}>LOCK {trava}/{total}<tspan fill={P.cinza}>{nome ? '  ·  ' + nome : ''}</tspan></text>
      </g>
    )}
    {fonte && <text x={M} y={H - 54} fontFamily={MONO} fontWeight={500} fontSize={20} fill={P.cinza} letterSpacing={1.5}>SOURCE · {fonte}</text>}
    <text x={W - M} y={H - 54} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={20} fill={P.fantasma} letterSpacing={4}>HARD TO COPY</text>
  </g>
);

// Título: palavras entre *asteriscos* saem em menta.
export const Titulo: React.FC<{ x: number; y: number; linhas: string[]; tam?: number; anc?: 'start' | 'middle' | 'end'; cor?: string }> = ({ x, y, linhas, tam = 84, anc = 'start', cor = P.menta }) => (
  <text x={x} y={y} textAnchor={anc} fontFamily={TIT} fontWeight={700} fontSize={tam} fill={P.osso} letterSpacing={-tam * 0.028}>
    {linhas.map((l, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : tam * 1.08}>{l.split('*').map((p, k) => <tspan key={k} fill={k % 2 ? cor : P.osso}>{p}</tspan>)}</tspan>
    ))}
  </text>
);

export const Rot: React.FC<{ x: number; y: number; t: string; cor?: string; tam?: number; anc?: 'start' | 'middle' | 'end'; peso?: number; esp?: number }> = ({ x, y, t, cor = P.cinza, tam = 22, anc = 'start', peso = 500, esp = 2 }) => (
  <text x={x} y={y} textAnchor={anc} fontFamily={MONO} fontWeight={peso} fontSize={tam} fill={cor} letterSpacing={esp}>{t}</text>
);

// Linha de cota (desenho técnico): traço com batentes nas pontas e o valor no meio.
export const Cota: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: string; cor?: string; lado?: number; tam?: number }> = ({ x1, y1, x2, y2, t, cor = P.ambar, lado = 1, tam = 24 }) => {
  const vert = Math.abs(x2 - x1) < 1, b = 12;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g stroke={cor} strokeWidth={2.5} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vert ? (<><line x1={x1 - b} y1={y1} x2={x1 + b} y2={y1} /><line x1={x2 - b} y1={y2} x2={x2 + b} y2={y2} /></>) : (<><line x1={x1} y1={y1 - b} x2={x1} y2={y1 + b} /><line x1={x2} y1={y2 - b} x2={x2} y2={y2 + b} /></>)}
      {vert
        ? <text x={mx - lado * 22} y={my} transform={`rotate(-90 ${mx - lado * 22} ${my})`} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={tam} fill={cor} stroke="none" letterSpacing={2}>{t}</text>
        : <text x={mx} y={my - lado * 18 + (lado < 0 ? tam * 0.7 : 0)} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={tam} fill={cor} stroke="none" letterSpacing={2}>{t}</text>}
    </g>
  );
};
