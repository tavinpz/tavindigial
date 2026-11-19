import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import T from '../../public/bunker/tempos.json';

// Canal de sobrevivência simulada (alemão). Teste curto de 30 s: personagem, bunker e voz.
const FPS = 30;
const W = 1920, H = 1080, CHAO = 800;
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const ip = (f: number, a: number, b: number, c: number, d: number, e?: (n: number) => number) =>
  interpolate(f, [a, b], [c, d], { ...cl, easing: e });
const pop = (f: number, a: number, dur = 10) => ip(f, a, a + dur, 0, 1, Easing.out(Easing.back(1.8)));
const fala = (id: string) => (T as any).falas.find((q: any) => q.id === id) as { ini: number; fim: number; t: string };
const fr = (seg: number) => Math.round(seg * FPS);
export const BUNKER_FRAMES = fr((T as any).dur) + 24;

const CORTE1 = fr(fala('b1').ini - 0.3);
const CORTE2 = fr(fala('c1').ini - 0.25);
const CORTE3 = fr(fala('d0').ini - 0.35);
const FIM = fr(fala('d2').fim + 0.55);

export type Humor = 'neutro' | 'preocupado' | 'cetico' | 'medo' | 'sorriso';

export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="parede" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6f8280" /><stop offset="0.62" stopColor="#566866" /><stop offset="1" stopColor="#465654" />
    </linearGradient>
    <linearGradient id="faixa" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3f5f5c" /><stop offset="1" stopColor="#2f4a48" />
    </linearGradient>
    <linearGradient id="piso" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3a4443" /><stop offset="1" stopColor="#1d2424" />
    </linearGradient>
    <radialGradient id="luzTeto" cx="0.5" cy="0" r="0.75">
      <stop offset="0" stopColor="#ffdc9e" stopOpacity="0.62" /><stop offset="0.5" stopColor="#ffc778" stopOpacity="0.18" /><stop offset="1" stopColor="#ffc778" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="pocaLuz" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffe2ad" stopOpacity="0.34" /><stop offset="1" stopColor="#ffe2ad" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vinheta" cx="0.5" cy="0.46" r="0.72">
      <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#020607" stopOpacity="0.62" />
    </radialGradient>
    <linearGradient id="aco" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#b9c4c6" /><stop offset="0.45" stopColor="#8a979a" /><stop offset="1" stopColor="#4d595b" />
    </linearGradient>
    <linearGradient id="acoEscuro" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5d696b" /><stop offset="1" stopColor="#2c3536" />
    </linearGradient>
    <linearGradient id="cano" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#c98a52" /><stop offset="0.35" stopColor="#a8683a" /><stop offset="1" stopColor="#5e3620" />
    </linearGradient>
    <linearGradient id="madeira" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#a8743f" /><stop offset="1" stopColor="#6e4724" />
    </linearGradient>
    <radialGradient id="pele" cx="0.62" cy="0.34" r="0.8">
      <stop offset="0" stopColor="#ffd9b4" /><stop offset="0.6" stopColor="#f0b98a" /><stop offset="1" stopColor="#cf8f62" />
    </radialGradient>
    <linearGradient id="macacao" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f29a45" /><stop offset="0.55" stopColor="#e27a2a" /><stop offset="1" stopColor="#a9511a" />
    </linearGradient>
    <linearGradient id="cabelo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#5a3d2a" /><stop offset="1" stopColor="#2a1a12" />
    </linearGradient>
    <linearGradient id="barril" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#1f5f9e" /><stop offset="0.3" stopColor="#3f8fd6" /><stop offset="0.55" stopColor="#2f78bd" /><stop offset="1" stopColor="#123f6e" />
    </linearGradient>
    <filter id="grao" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.12" />
    </filter>
    <filter id="manchas" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="3" seed="3" />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.34" />
    </filter>
    <filter id="suave"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="suave2"><feGaussianBlur stdDeviation="5" /></filter>
    <filter id="brilho"><feGaussianBlur stdDeviation="26" /></filter>
  </defs>
);

// Sala do bunker: parede de concreto com textura, faixa pintada, canos, lâmpada com luz quente e piso em perspectiva.
export const Sala: React.FC<{ luz?: number; frio?: number; frente?: React.ReactNode; children?: React.ReactNode }> = ({ luz = 1, frio = 0, frente, children }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect width={W} height={CHAO} fill="url(#parede)" />
      <rect width={W} height={CHAO} filter="url(#manchas)" opacity={0.5} />
      <rect y={540} width={W} height={CHAO - 540} fill="url(#faixa)" />
      <rect y={536} width={W} height={7} fill="#e7b540" opacity={0.85} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <rect x={i * 320 - 2} y={0} width={4} height={CHAO} fill="#1c2626" opacity={0.35} />
          <rect x={i * 320 + 2} y={0} width={2} height={CHAO} fill="#a9bab8" opacity={0.18} />
          {[60, 300, 620].map((y) => <circle key={y} cx={i * 320 + 22} cy={y} r={5} fill="#3a4746" stroke="#8fa09e" strokeWidth={1.5} />)}
        </g>
      ))}
      {/* canos no teto */}
      <rect y={58} width={W} height={30} fill="url(#cano)" />
      <rect y={104} width={W} height={18} fill="url(#acoEscuro)" />
      {[220, 760, 1300, 1800].map((x) => <rect key={x} x={x} y={46} width={22} height={86} rx={5} fill="#39403f" />)}
      <rect y={88} width={W} height={10} fill="#000" opacity={0.22} />
      {/* piso */}
      <rect y={CHAO} width={W} height={H - CHAO} fill="url(#piso)" />
      {[-900, -500, -200, 0, 200, 500, 900].map((d) => (
        <line key={d} x1={W / 2 + d * 0.72} y1={CHAO} x2={W / 2 + d * 1.9} y2={H} stroke="#0e1414" strokeWidth={3} opacity={0.55} />
      ))}
      {[850, 930, 1040].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#0e1414" strokeWidth={2.5} opacity={0.4} />)}
      <rect y={CHAO - 10} width={W} height={20} fill="#000" opacity={0.3} filter="url(#suave2)" />
      {children}
      {/* luz quente do teto */}
      <g opacity={luz}>
        <rect width={W} height={H} fill="url(#luzTeto)" style={{ mixBlendMode: 'screen' }} />
        <ellipse cx={W / 2} cy={CHAO + 120} rx={760} ry={150} fill="url(#pocaLuz)" style={{ mixBlendMode: 'screen' }} />
      </g>
      {/* lâmpada */}
      <rect x={W / 2 - 5} y={0} width={10} height={70} fill="#222" />
      <path d={`M${W / 2 - 62} 112 Q${W / 2} 40 ${W / 2 + 62} 112 Z`} fill="#2b3433" />
      <ellipse cx={W / 2} cy={116} rx={36} ry={22} fill="#fff3d2" opacity={0.25 + 0.75 * luz} />
      <ellipse cx={W / 2} cy={116} rx={110} ry={70} fill="#ffdc9e" opacity={0.5 * luz} filter="url(#brilho)" />
      {/* poeira na luz */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 420 + random(`px${i}`) * 1080 + Math.sin((f + i * 40) / 70) * 22;
        const y = ((random(`py${i}`) * 700 + f * (0.25 + random(`pv${i}`) * 0.35)) % 700) + 120;
        return <circle key={i} cx={x} cy={y} r={1.6 + random(`pr${i}`) * 2.2} fill="#ffe9c4" opacity={(0.12 + random(`po${i}`) * 0.22) * luz} />;
      })}
      {/* noite fria */}
      <rect width={W} height={H} fill="#0a1830" opacity={frio} style={{ mixBlendMode: 'multiply' }} />
      {frente}
      <rect width={W} height={H} fill="url(#vinheta)" />
      <rect width={W} height={H} filter="url(#grao)" opacity={0.2} style={{ mixBlendMode: 'overlay' }} />
    </g>
  );
};

// Ben: personagem com rosto expressivo, boca sincronizada com a voz, piscada e respiração.
export const Ben: React.FC<{ x: number; y: number; k?: number; humor?: Humor; olhar?: number; olharY?: number; apontar?: number; fala?: number; inclina?: number; gesto?: number; anda?: number; semPernas?: boolean; soCabeca?: boolean; dorme?: boolean; maoCabeca?: boolean }> = ({
  x, y, k = 1, humor = 'neutro', olhar = 0, olharY = 0, apontar = 0, fala: boca = 0, inclina = 0, gesto = 0, anda, semPernas = false, soCabeca = false, dorme = false, maoCabeca = false,
}) => {
  const f = useCurrentFrame();
  const resp = Math.sin(f / 16) * 3;
  const ciclo = f % 96;
  const pisca = dorme ? 1 : ciclo < 5 ? 1 - Math.abs(ciclo - 2) / 2.5 : 0;
  const medo = humor === 'medo';
  const abre = (medo ? 1.22 : 1) * (1 - 0.92 * Math.max(0, pisca));
  const sob = {
    neutro: [0, 0, 0, 0], preocupado: [-16, 16, -6, -6], cetico: [4, -14, 2, -16], medo: [-22, 22, -20, -20], sorriso: [6, -6, -2, -2],
  }[humor];
  const ox = olhar * 9, oy = olharY * 6;
  const maoD = { x: 108 + apontar * 96, y: -176 - apontar * 168 };
  const tremor = medo ? Math.sin(f * 1.9) * 1.6 : 0;
  const aberta = Math.min(1, boca * 1.5);
  const passo = anda === undefined ? 0 : Math.sin(anda) * 20;
  const quique = anda === undefined ? 0 : -Math.abs(Math.cos(anda)) * 7;
  const maoE = maoCabeca ? { x: -92, y: -512 } : { x: -112 - gesto * 50, y: -172 - gesto * 150 };
  const cotE = maoCabeca ? { x: -176, y: -400 } : { x: -128 - gesto * 34, y: -250 - gesto * 30 };
  return (
    <g transform={`translate(${x + tremor} ${y}) scale(${k})`}>
      {!soCabeca && <ellipse cx={0} cy={4} rx={130} ry={22} fill="#000" opacity={0.42} filter="url(#suave2)" />}
      {/* pernas e botas (com passo) */}
      {!soCabeca && !semPernas && (
        <g>
          <g transform={`rotate(${passo} -31 -158)`}>
            <rect x={-54} y={-158} width={46} height={150} rx={16} fill="#2b3c53" />
            <rect x={-66} y={-34} width={64} height={36} rx={14} fill="#5b3b27" /><rect x={-66} y={-10} width={64} height={12} rx={6} fill="#22140c" />
          </g>
          <g transform={`rotate(${-passo} 31 -158)`}>
            <rect x={8} y={-158} width={46} height={150} rx={16} fill="#24344a" />
            <rect x={2} y={-34} width={64} height={36} rx={14} fill="#4b2f1f" /><rect x={2} y={-10} width={64} height={12} rx={6} fill="#22140c" />
          </g>
        </g>
      )}
      <g transform={`translate(0 ${resp + quique})`}>
        {!soCabeca && (<g>
        {/* braço esquerdo */}
        <path d={`M-92 -304 Q${cotE.x} ${cotE.y} ${maoE.x} ${maoE.y + 14}`} stroke="#c9631f" strokeWidth={46} strokeLinecap="round" fill="none" />
        {!maoCabeca && <circle cx={maoE.x} cy={maoE.y} r={25} fill="url(#pele)" />}
        {/* tronco */}
        <path d="M-104 -326 Q-112 -340 -70 -344 L70 -344 Q112 -340 104 -326 L88 -150 Q0 -132 -88 -150 Z" fill="url(#macacao)" />
        <path d="M-104 -326 L-88 -150 Q-60 -144 -36 -141 L-50 -344 L-70 -344 Q-112 -340 -104 -326 Z" fill="#7a3a12" opacity={0.28} />
        <rect x={-90} y={-178} width={180} height={20} rx={6} fill="#3a2a1e" /><rect x={-16} y={-182} width={32} height={28} rx={5} fill="#d9b24a" />
        <line x1={0} y1={-340} x2={0} y2={-180} stroke="#8a4416" strokeWidth={4} />
        <rect x={24} y={-296} width={48} height={40} rx={6} fill="none" stroke="#8a4416" strokeWidth={4} />
        <path d="M-40 -344 L0 -306 L40 -344 L26 -356 L0 -332 L-26 -356 Z" fill="#b3591d" />
        {/* braço direito (aponta) */}
        <path d={`M92 -304 Q${130 + apontar * 30} ${-250 - apontar * 40} ${maoD.x} ${maoD.y + 14}`} stroke="#e27a2a" strokeWidth={46} strokeLinecap="round" fill="none" />
        <circle cx={maoD.x} cy={maoD.y} r={25} fill="url(#pele)" />
        {/* pescoço e cabeça */}
        <rect x={-26} y={-372} width={52} height={40} rx={14} fill="#d99a6c" />
        </g>)}
        <g transform={`rotate(${inclina + olhar * 3} 0 -360) translate(${olhar * 6} 0)`}>
          <circle cx={-100} cy={-438} r={22} fill="#e2a877" /><circle cx={100} cy={-438} r={22} fill="#eab586" />
          <rect x={-98} y={-548} width={196} height={204} rx={88} fill="url(#pele)" />
          <path d="M-98 -460 Q-98 -350 -10 -345 Q-72 -372 -74 -470 Z" fill="#a8663e" opacity={0.26} />
          {/* cabelo */}
          <path d="M-102 -470 Q-116 -566 -30 -574 Q26 -604 78 -566 Q118 -540 100 -468 Q88 -516 44 -522 Q-6 -500 -58 -520 Q-92 -512 -102 -470 Z" fill="url(#cabelo)" />
          <path d="M-20 -568 Q30 -592 74 -560" stroke="#8b674d" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
          {/* olhos */}
          {[-42, 42].map((ex, i) => (
            <g key={i}>
              <ellipse cx={ex} cy={-440} rx={27} ry={30 * abre} fill="#fff" />
              <ellipse cx={ex} cy={-440 + 30 * abre - 3} rx={27} ry={5} fill="#b9c7d6" opacity={0.35 * abre} />
              <g opacity={abre > 0.25 ? 1 : 0}>
                <circle cx={ex + ox} cy={-438 + oy} r={medo ? 12 : 15} fill="#6b4226" />
                <circle cx={ex + ox} cy={-438 + oy} r={medo ? 6 : 8} fill="#170d07" />
                <circle cx={ex + ox + 5} cy={-444 + oy} r={4} fill="#fff" />
              </g>
              <path d={`M${ex - 29} ${-440 - 30 * abre + 2} Q${ex} ${-440 - 40 * abre} ${ex + 29} ${-440 - 30 * abre + 2}`} stroke="#3a2418" strokeWidth={5} fill="none" strokeLinecap="round" />
              <rect x={ex - 30} y={-490 + sob[i + 2]} width={60} height={13} rx={6.5} fill="#33221a" transform={`rotate(${sob[i]} ${ex} ${-484 + sob[i + 2]})`} />
            </g>
          ))}
          <path d="M-4 -420 Q10 -396 -8 -390" stroke="#b7774c" strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={-62} cy={-398} rx={18} ry={11} fill="#f08f7a" opacity={0.3} /><ellipse cx={62} cy={-398} rx={18} ry={11} fill="#f08f7a" opacity={0.3} />
          {/* boca */}
          {aberta > 0.14 ? (
            <g>
              <ellipse cx={0} cy={-366} rx={21 + aberta * 5} ry={5 + aberta * 17} fill="#4a1616" />
              <ellipse cx={0} cy={-366 + aberta * 11} rx={13} ry={aberta * 7} fill="#d96b6b" />
              <rect x={-14} y={-366 - 5 - aberta * 13} width={28} height={6} rx={3} fill="#fff" opacity={aberta > 0.4 ? 1 : 0} />
            </g>
          ) : (
            <path
              d={humor === 'sorriso' ? 'M-26 -372 Q0 -350 26 -372' : humor === 'cetico' ? 'M-24 -362 Q4 -366 26 -374' : humor === 'neutro' ? 'M-20 -366 L20 -366' : 'M-24 -360 Q0 -374 24 -360'}
              stroke="#5a2018" strokeWidth={6} fill="none" strokeLinecap="round"
            />
          )}
          {maoCabeca && <circle cx={-96} cy={-520} r={25} fill="url(#pele)" />}
          {medo && <path d="M84 -500 q10 16 0 24 q-10 -8 0 -24" fill="#9fd4ff" opacity={0.85} transform={`translate(0 ${(f % 40) * 0.9})`} />}
        </g>
      </g>
    </g>
  );
};

const Placa: React.FC<{ f: number }> = ({ f }) => (
  <g transform={`translate(70 56) scale(${pop(f, 4)})`}>
    <rect x={3} y={5} width={300} height={96} rx={12} fill="#000" opacity={0.4} />
    <rect width={300} height={96} rx={12} fill="#1d2626" stroke="#e7b540" strokeWidth={5} />
    {[14, 286].map((x) => [14, 82].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={4.5} fill="#e7b540" />))}
    <text x={150} y={68} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={54} fill="#f4c64d" letterSpacing={3}>TAG 1</text>
  </g>
);

export const Lata: React.FC<{ x: number; y: number; cor: string; s: number }> = ({ x, y, cor, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-62} width={44} height={62} rx={5} fill="#c7d0d2" />
    <rect x={-22} y={-50} width={44} height={36} fill={cor} />
    <rect x={-22} y={-62} width={11} height={62} rx={5} fill="#fff" opacity={0.28} />
    <rect x={10} y={-62} width={12} height={62} rx={5} fill="#000" opacity={0.22} />
    <ellipse cx={0} cy={-62} rx={22} ry={5} fill="#e4eaeb" stroke="#8d989a" strokeWidth={1.5} />
    <circle cx={0} cy={-32} r={8} fill="#fff" opacity={0.75} />
  </g>
);

export const Proibido: React.FC<{ x: number; y: number; s: number; tipo: 'janela' | 'celular' | 'rede' }> = ({ x, y, s, tipo }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={84} fill="#000" opacity={0.35} transform="translate(4 7)" />
    <circle r={80} fill="#f3ead8" stroke="#d63b2f" strokeWidth={13} />
    {tipo === 'janela' && <g><rect x={-36} y={-36} width={72} height={72} rx={6} fill="#8fd0f2" stroke="#3a3a3a" strokeWidth={7} /><line x1={0} y1={-36} x2={0} y2={36} stroke="#3a3a3a" strokeWidth={6} /><line x1={-36} y1={0} x2={36} y2={0} stroke="#3a3a3a" strokeWidth={6} /></g>}
    {tipo === 'celular' && <g><rect x={-24} y={-42} width={48} height={84} rx={9} fill="#2f3a45" /><rect x={-18} y={-32} width={36} height={56} rx={3} fill="#7fc3ee" /><circle cx={0} cy={33} r={4} fill="#aab4bd" /></g>}
    {tipo === 'rede' && <g fill="none" stroke="#2f3a45" strokeWidth={9} strokeLinecap="round"><path d="M-40 -8 Q0 -46 40 -8" /><path d="M-25 10 Q0 -14 25 10" /><circle cx={0} cy={30} r={7} fill="#2f3a45" stroke="none" /></g>}
    <line x1={-56} y1={56} x2={56} y2={-56} stroke="#d63b2f" strokeWidth={13} strokeLinecap="round" />
  </g>
);

const Legenda: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const q = (T as any).falas.find((x: any) => t >= x.ini - 0.05 && t <= x.fim + 0.25);
  if (!q) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1380, textAlign: 'center', fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 46, lineHeight: 1.18, color: '#fff', padding: '10px 26px', borderRadius: 14, background: 'rgba(8,12,12,0.62)', textShadow: '0 3px 0 #000' }}>{q.t}</div>
    </div>
  );
};

export const Cena: React.FC<{ f: number; ini: number; fim: number; zoom?: [number, number]; panX?: [number, number]; foco?: [number, number]; children: React.ReactNode }> = ({ f, ini, fim, zoom = [1.02, 1.07], panX = [0, 0], foco = [W / 2, H / 2], children }) => {
  if (f < ini || f >= fim) return null;
  const z = ip(f, ini, fim, zoom[0], zoom[1]);
  const px = ip(f, ini, fim, panX[0], panX[1]);
  const entra = ip(f, ini, ini + 5, 0, 1);
  return (
    <AbsoluteFill style={{ opacity: ini === 0 ? 1 : entra }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Defs />
        <g transform={`translate(${foco[0] + px} ${foco[1]}) scale(${z}) translate(${-foco[0]} ${-foco[1]})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

export const BunkerTeste: React.FC = () => {
  const f = useCurrentFrame();
  const boca = ((T as any).boca[f] ?? 0) * 0.6 + ((T as any).boca[f + 1] ?? 0) * 0.4;
  const a2 = fr(fala('a2').ini), b1 = fr(fala('b1').ini), b2 = fr(fala('b2').ini), c1 = fr(fala('c1').ini), c2 = fr(fala('c2').ini);
  const d0 = fr(fala('d0').ini), d1 = fr(fala('d1').ini), d2 = fr(fala('d2').ini);

  // cena 1: a porta fecha
  const FECHA = 20;
  const portaX = ip(f, 2, FECHA, 0.16, 1, Easing.in(Easing.cubic));
  const tranco = f >= FECHA && f < FECHA + 12 ? Math.sin((f - FECHA) * 2.4) * (12 - (f - FECHA)) * 1.1 : 0;
  const volante = ip(f, FECHA + 4, FECHA + 54, 0, 560, Easing.out(Easing.cubic));
  const trava = ip(f, FECHA + 40, FECHA + 56, 0, 1, Easing.out(Easing.cubic));
  const relogio = pop(f, a2 + 62);
  const vira = ip(f, a2 - 8, a2 + 6, 1, 0.15);

  // cena 4: luz piscando, ar caindo
  const pisca4 = f >= d0 && f < d1 + 20 ? (random(`fl${Math.floor(f / 2)}`) > 0.42 ? 1 : 0.12) : 1;
  const luz4 = f < d0 ? 0.85 : f < d1 + 20 ? pisca4 * 0.8 : 0.34;
  const agulha = ip(f, d1, d2 + 50, -62, 58, Easing.inOut(Easing.cubic));
  const alarme = f > d2 ? 0.5 + 0.5 * Math.sin((f - d2) / 3.2) : 0;
  const brilhoDuto = ip(f, d2 + 42, d2 + 62, 0, 1);

  return (
    <AbsoluteFill style={{ background: '#050808' }}>
      {/* CENA 1 */}
      <Cena f={f} ini={0} fim={CORTE1} zoom={[1.03, 1.1]} foco={[1150, 520]}>
        <g transform={`translate(${tranco} 0)`}>
          <Sala>
            {/* porta blindada */}
            <g transform="translate(1390 452)">
              <circle r={292} fill="#1c2424" />
              <circle r={278} fill="url(#acoEscuro)" stroke="#11191a" strokeWidth={8} />
              <circle r={236} fill="#05090b" />
              <ellipse cx={-40} cy={10} rx={150} ry={200} fill="#d8ecff" opacity={0.2 * (1 - portaX)} filter="url(#brilho)" />
              <g transform={`translate(236 0) scale(${portaX} 1) translate(-236 0)`}>
                <circle r={240} fill="url(#aco)" stroke="#39444a" strokeWidth={10} />
                <circle r={240} fill="none" stroke="#fff" strokeWidth={4} opacity={0.22} strokeDasharray="380 1200" transform="rotate(-120)" />
                <circle r={186} fill="none" stroke="#56636a" strokeWidth={6} />
                {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={Math.cos((i / 16) * Math.PI * 2) * 214} cy={Math.sin((i / 16) * Math.PI * 2) * 214} r={9} fill="#47535a" stroke="#c9d3d8" strokeWidth={2} />)}
                {[0, 90, 180, 270].map((a) => <rect key={a} x={150 + trava * 54} y={-15} width={62} height={30} rx={6} fill="#38444a" transform={`rotate(${a})`} />)}
                <g transform={`rotate(${volante})`}>
                  <circle r={94} fill="none" stroke="#c9432f" strokeWidth={20} />
                  <circle r={94} fill="none" stroke="#ff8f77" strokeWidth={5} opacity={0.5} strokeDasharray="120 600" />
                  {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-8} y={-94} width={16} height={94} rx={7} fill="#b23a28" transform={`rotate(${a})`} />)}
                  <circle r={28} fill="#7d2a1c" stroke="#e86a53" strokeWidth={4} />
                </g>
              </g>
              <rect x={266} y={-90} width={34} height={64} rx={8} fill="#2a3436" /><rect x={266} y={30} width={34} height={64} rx={8} fill="#2a3436" />
              <ellipse cx={0} cy={352} rx={300} ry={24} fill="#000" opacity={0.4} filter="url(#suave2)" />
              {f >= FECHA && f < FECHA + 26 && Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2, d = 250 + (f - FECHA) * 5;
                return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={16 - (f - FECHA) * 0.5} fill="#cfd8d6" opacity={0.42 * (1 - (f - FECHA) / 26)} filter="url(#suave2)" />;
              })}
            </g>
            {/* relógio de contagem */}
            <g transform={`translate(930 290) scale(${relogio * 0.72})`}>
              <rect x={-208} y={-54} width={416} height={108} rx={14} fill="#10161a" stroke="#3c484e" strokeWidth={6} />
              <text x={0} y={30} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={82} fill="#ff4a36" letterSpacing={6} style={{ filter: 'drop-shadow(0 0 12px #ff3a26)' }}>365 TAGE</text>
            </g>
            <Ben x={640} y={900} k={1.12} humor={f < a2 - 4 ? 'neutro' : 'preocupado'} olhar={vira} fala={boca} inclina={f < a2 ? 0 : -3} />
          </Sala>
        </g>
      </Cena>

      {/* CENA 2 */}
      <Cena f={f} ini={CORTE1} fim={CORTE2} zoom={[1.0, 1.05]} panX={[26, -26]}>
        <Sala>
          {/* prateleiras */}
          {[310, 480, 650].map((y) => (
            <g key={y}>
              <rect x={120} y={y} width={760} height={22} rx={4} fill="url(#madeira)" />
              <rect x={120} y={y + 22} width={760} height={12} fill="#000" opacity={0.3} />
            </g>
          ))}
          {[140, 500, 860].map((x) => <rect key={x} x={x - 9} y={180} width={18} height={620} fill="url(#acoEscuro)" />)}
          {[310, 480, 650].map((y, r) => Array.from({ length: 13 }).map((_, i) => (
            <Lata key={`${r}${i}`} x={166 + i * 56} y={y} cor={['#d8453b', '#3f9b5a', '#e2b33c', '#3b78c2', '#c7652c'][(i + r * 2) % 5]} s={pop(f, b1 + 10 + r * 4 + i * 1.3, 8)} />
          )))}
          <g transform={`translate(500 200) rotate(-4) scale(${pop(f, b1 + 34)})`}>
            <rect x={-150} y={-62} width={300} height={124} rx={12} fill="#f3ead8" stroke="#3a2a1e" strokeWidth={6} />
            <text x={0} y={30} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={88} fill="#22303a">400</text>
          </g>
          {/* barris de água */}
          {[1290, 1480].map((x, i) => (
            <g key={x} transform={`translate(${x} ${CHAO + 40})`}>
              <ellipse cx={0} cy={6} rx={100} ry={18} fill="#000" opacity={0.4} filter="url(#suave2)" />
              <rect x={-84} y={-300} width={168} height={300} rx={22} fill="url(#barril)" />
              {[-230, -150, -70].map((y) => <rect key={y} x={-88} y={y} width={176} height={14} rx={7} fill="#0f3257" opacity={0.75} />)}
              <rect x={-66} y={-290} width={22} height={280} rx={11} fill="#fff" opacity={0.2} />
              <ellipse cx={0} cy={-300} rx={84} ry={15} fill="#5aa6e6" stroke="#123f6e" strokeWidth={4} />
            </g>
          ))}
          <g transform={`translate(1385 ${CHAO - 150}) rotate(3) scale(${pop(f, b1 + 62)})`}><rect x={-150} y={-56} width={300} height={112} rx={12} fill="#f3ead8" stroke="#123f6e" strokeWidth={6} /><text x={0} y={30} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={78} fill="#123f6e">2.000 L</text></g>
          {/* caixote e lâmpada de manivela */}
          <g transform={`translate(1730 ${CHAO + 40})`}>
            <ellipse cx={0} cy={6} rx={110} ry={16} fill="#000" opacity={0.4} filter="url(#suave2)" />
            <rect x={-92} y={-130} width={184} height={130} rx={8} fill="url(#madeira)" stroke="#4b2f1f" strokeWidth={5} />
            <line x1={-92} y1={-130} x2={92} y2={0} stroke="#4b2f1f" strokeWidth={8} /><line x1={92} y1={-130} x2={-92} y2={0} stroke="#4b2f1f" strokeWidth={8} />
            <g transform="translate(0 -130)">
              <circle cx={0} cy={-76} r={150} fill="#ffd77a" opacity={0.42 * pop(f, b1 + 92, 14)} filter="url(#brilho)" />
              <rect x={-34} y={-30} width={68} height={30} rx={6} fill="#33403f" />
              <rect x={-26} y={-112} width={52} height={84} rx={14} fill="#fff1bf" stroke="#e7b540" strokeWidth={6} opacity={0.55 + 0.45 * pop(f, b1 + 92, 14)} />
              <path d="M-30 -112 Q0 -150 30 -112" stroke="#33403f" strokeWidth={9} fill="none" />
              <g transform={`translate(40 -16) rotate(${f * 14})`}><line x1={0} y1={0} x2={26} y2={0} stroke="#1f2928" strokeWidth={7} /><circle cx={26} cy={0} r={7} fill="#d8453b" /></g>
            </g>
          </g>
          {f >= b2 - 2 && <rect width={W} height={H} fill="#000" opacity={0.3 * ip(f, b2 - 2, b2 + 6, 0, 1)} />}
          <Proibido x={1150} y={250} s={pop(f, b2 + 2)} tipo="janela" />
          <Proibido x={1390} y={250} s={pop(f, b2 + 24)} tipo="celular" />
          <Proibido x={1630} y={250} s={pop(f, b2 + 46)} tipo="rede" />
          <Ben x={1060} y={910} k={1.0} humor={f < b2 ? 'sorriso' : 'preocupado'} olhar={f < b2 ? -0.8 : 0.5} olharY={f < b2 ? 0 : -1} apontar={-0} fala={boca} />
        </Sala>
      </Cena>

      {/* CENA 3 */}
      <Cena f={f} ini={CORTE2} fim={CORTE3} zoom={[1.04, 1.1]} foco={[900, 500]}>
        <Sala>
          {/* lousa */}
          <g transform="translate(1010 150)">
            <rect x={8} y={12} width={790} height={560} rx={14} fill="#000" opacity={0.4} filter="url(#suave2)" />
            <rect width={790} height={560} rx={14} fill="url(#madeira)" />
            <rect x={24} y={24} width={742} height={512} rx={6} fill="#27473c" />
            <rect x={24} y={24} width={742} height={512} rx={6} filter="url(#manchas)" opacity={0.35} />
            <g fontFamily="Comic Sans MS, Chalkboard SE, Arial, sans-serif" fontWeight={700} fill="#f2f0e4">
              <text x={70} y={150} fontSize={92} opacity={ip(f, c2 + 12, c2 + 22, 0, 1)}>400 Dosen</text>
              <text x={70} y={270} fontSize={92} opacity={ip(f, c2 + 30, c2 + 40, 0, 1)}>÷ 365 Tage</text>
              <rect x={66} y={300} width={ip(f, c2 + 44, c2 + 54, 0, 560)} height={8} rx={4} />
              <text x={70} y={430} fontSize={92} fill="#ffd95e" opacity={ip(f, c2 + 56, c2 + 66, 0, 1)}>≈ 1,1 pro Tag</text>
            </g>
            <rect x={60} y={536} width={670} height={20} rx={5} fill="#5d3c1f" />
            <rect x={600} y={524} width={60} height={14} rx={4} fill="#f2f0e4" />
          </g>
          <g transform={`translate(1730 ${CHAO + 60}) scale(${pop(f, c2 + 60)})`}>
            <ellipse cx={0} cy={0} rx={130} ry={22} fill="#dfe6e6" stroke="#8d989a" strokeWidth={4} />
            <Lata x={0} y={-4} cor="#d8453b" s={1.7} />
          </g>
          <Ben x={520} y={1560} k={2.5} humor={f < c2 ? 'cetico' : f < c2 + 56 ? 'neutro' : 'preocupado'} olhar={f < c2 ? 0 : 0.9} fala={boca} inclina={f < c2 ? 4 : 0} apontar={f < c2 + 8 ? 0 : 0.5} />
        </Sala>
      </Cena>

      {/* CENA 4 */}
      <Cena f={f} ini={CORTE3} fim={FIM} zoom={[1.02, 1.2]} foco={[1050, 470]}>
        <Sala luz={luz4} frio={f < d0 ? 0.3 : 0.5}>
          {/* duto de ventilação */}
          <g transform="translate(250 250)">
            <rect x={-130} y={-96} width={260} height={192} rx={12} fill="#11191a" stroke="#4a585b" strokeWidth={8} />
            {[-64, -32, 0, 32, 64].map((y) => <rect key={y} x={-112} y={y - 7} width={224} height={14} rx={6} fill="#2d3839" />)}
            <g opacity={brilhoDuto}>
              <ellipse cx={-34} cy={-4} rx={13} ry={9} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 10px #c8ff5a)' }} />
              <ellipse cx={34} cy={-4} rx={13} ry={9} fill="#d9ff7a" style={{ filter: 'drop-shadow(0 0 10px #c8ff5a)' }} />
            </g>
          </g>
          {/* medidor de ar */}
          <g transform="translate(1440 400)">
            <circle r={236} fill="#000" opacity={0.4} transform="translate(8 12)" filter="url(#suave2)" />
            <circle r={230} fill="url(#acoEscuro)" stroke="#11191a" strokeWidth={8} />
            <circle r={196} fill="#f1ead9" />
            <path d="M-150 60 A162 162 0 0 1 -60 -150" stroke="#3f9b5a" strokeWidth={34} fill="none" />
            <path d="M-60 -150 A162 162 0 0 1 80 -141" stroke="#e2b33c" strokeWidth={34} fill="none" />
            <path d="M80 -141 A162 162 0 0 1 150 60" stroke="#d8453b" strokeWidth={34} fill="none" />
            <text x={0} y={120} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={62} fill="#22303a" letterSpacing={4}>LUFT</text>
            <g transform={`rotate(${agulha + Math.sin(f / 2.2) * 1.4})`}>
              <path d="M-10 20 L0 -158 L10 20 Z" fill="#22303a" />
            </g>
            <circle r={20} fill="#22303a" /><circle r={8} fill="#8d989a" />
            <path d="M-150 -120 A196 196 0 0 1 20 -194" stroke="#fff" strokeWidth={10} fill="none" opacity={0.35} strokeLinecap="round" />
            <g transform="translate(0 -292)">
              <circle r={70} fill="#ff3a26" opacity={0.6 * alarme} filter="url(#brilho)" />
              <rect x={-30} y={18} width={60} height={22} rx={5} fill="#2d3839" />
              <path d="M-26 20 Q-26 -30 0 -30 Q26 -30 26 20 Z" fill={alarme > 0.5 ? '#ff5a45' : '#8f2a20'} stroke="#3a1410" strokeWidth={4} />
            </g>
          </g>
          <rect width={W} height={H} fill="#ff2a1a" opacity={0.1 * alarme} style={{ mixBlendMode: 'screen' }} />
          <Ben x={760} y={1250} k={1.9} humor={f < d0 + 14 ? 'neutro' : 'medo'} olhar={f < d1 ? 0 : f < d2 + 40 ? 0.9 : -1} olharY={f < d1 ? -1 : 0} fala={boca} inclina={f > d2 + 40 ? -4 : 0} />
        </Sala>
      </Cena>

      {/* fecho */}
      {f >= FIM && (
        <AbsoluteFill style={{ background: '#050808', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 150, color: '#f4c64d', letterSpacing: 8, opacity: ip(f, FIM + 3, FIM + 12, 0, 1) }}>TAG 2 …</div>
        </AbsoluteFill>
      )}
      {f < FIM && <AbsoluteFill><svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}><Placa f={f} /></svg></AbsoluteFill>}
      {f < FIM && <Legenda f={f} />}
    </AbsoluteFill>
  );
};
