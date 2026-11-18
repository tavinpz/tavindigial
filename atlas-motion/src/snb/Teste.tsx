import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Anel, CenaProps, Defs, Etiqueta, Fala, Figura, Fonte, Frase, K, L, SANS, TIT, pop } from './lib';

const W = 1920, H = 1080;
const Palco: React.FC<{ g: number; D: number; children: React.ReactNode }> = ({ g, D, children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}><Defs />
    <g transform={`translate(960,540) scale(${1 + 0.035 * Math.min(1, g / D)}) translate(-960,-540)`}>{children}</g>
  </svg>
);
const Barra: React.FC<{ x1: number; x2: number; y: number; op?: number }> = ({ x1, x2, y, op = 1 }) => (
  <g opacity={op}><rect x={x1} y={y - 8} width={x2 - x1} height={16} rx={8} fill={K.osso} /><rect x={x1 - 14} y={y - 26} width={22} height={52} rx={5} fill={K.cinza} /><rect x={x2 - 8} y={y - 26} width={22} height={52} rx={5} fill={K.cinza} /></g>
);

// 1. Gancho: metade do tamanho, mas aguenta 3 minutos pendurado
const CenaGancho: React.FC<CenaProps> = ({ g, D, ts }) => {
  const t2 = ts[1]; const k = L(g, [t2 - 4, t2 + 14], [0, 1]);
  const esc = 1.25 - 0.25 * k, x = 560 + 60 * k, y = 300 + 100 * k, barY = y - 200 * esc;
  const omb = 8 + 160 * k, bal = k * Math.sin(g / 13) * 1.5;
  const seg = Math.round(L(g, [t2 + 16, t2 + 100], [0, 180]));
  return (
    <Palco g={g} D={D}>
      <Etiqueta g={g} ini={6} txt="GRIP STRENGTH · AT HOME · NO GYM" />
      <Figura x={1130} y={262} esc={1.42} vol={1.6} cinza pose={{ ombE: 16, ombD: 16, cotE: 10, cotD: 10, pernaE: 7, pernaD: 7, pe: 'chao' }} op={L(g, [0, 10], [0, 1]) * (1 - L(g, [t2 - 4, t2 + 8], [0, 1]))} resp={Math.sin(g / 16)} />
      <Barra x1={390} x2={850} y={barY} op={k} />
      <g transform={`rotate(${bal} ${x} ${barY})`}>
        <Figura x={x} y={y} esc={esc} pose={{ ombE: omb, ombD: omb, cotE: 6 - 4 * k, cotD: 6 - 4 * k, pernaE: 4 - 2 * k, pernaD: 4 - 2 * k, pe: k > 0.5 ? 'solto' : 'chao', punho: k > 0.6 }} resp={Math.sin(g / 15)} tendao={k * (0.55 + 0.35 * Math.sin(g / 6))} op={L(g, [0, 10], [0, 1])} />
      </g>
      <Frase g={g} ini={22} fim={t2} x={1440} y={470} txt="HALF" tam={190} fam={TIT} />
      <Frase g={g} ini={30} fim={t2} x={1444} y={548} txt="the size" tam={66} />
      <Anel cx={1380} cy={450} r={170} p={seg / 180} rot={`${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`} sub="and counting" op={L(g, [t2 + 8, t2 + 18], [0, 1])} />
      <Frase g={g} ini={t2 + 26} x={1380} y={760} a="middle" txt="hangs for THREE minutes" tam={60} />
    </Palco>
  );
};

// 2. Estudo: força de pegada x pressão arterial
const CenaEstudo: React.FC<CenaProps> = ({ g, D, ts }) => {
  const t2 = ts[1]; const k = L(g, [t2 - 6, t2 + 10], [0, 1]);
  const n = Math.round(L(g, [4, 66], [0, 139691], (t) => 1 - Math.pow(1 - t, 3)));
  const linha = (i: number, ini: number, rot: string, forte: boolean) => {
    const s = pop(g, ini); if (s <= 0) return null;
    const y = 530 + i * 150;
    return (
      <g opacity={Math.min(1, s)} transform={`translate(${(1 - Math.min(1, s)) * 60},0)`}>
        <rect x={470} y={y} width={980} height={118} fill={forte ? '#1d1513' : K.painel} stroke={forte ? K.verm : '#2c2c31'} strokeWidth={forte ? 4 : 2} />
        <rect x={470} y={y} width={132} height={118} fill={forte ? K.verm : '#2c2c31'} />
        <text x={536} y={y + 84} textAnchor="middle" fontFamily={TIT} fontSize={76} fill={forte ? K.osso : K.cinza}>{`#${i + 1}`}</text>
        <text x={640} y={y + 84} fontFamily={TIT} fontSize={76} fill={forte ? K.osso : K.cinza} letterSpacing={2}>{rot}</text>
      </g>
    );
  };
  return (
    <Palco g={g} D={D}>
      <text x={960} y={500 - 240 * k} textAnchor="middle" fontFamily={TIT} fontSize={260 - 130 * k} fill={K.osso} letterSpacing={4} opacity={L(g, [0, 6], [0, 1])}>{n.toLocaleString('en-US')}</text>
      <text x={960} y={590 - 266 * k} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={50 - 12 * k} fill={K.cinza} opacity={L(g, [14, 24], [0, 1])}>people · 17 countries</text>
      <Frase g={g} ini={t2 + 14} x={960} y={470} a="middle" txt="predicted HOW LONG they lived" tam={50} />
      {linha(0, t2 + 4, 'GRIP STRENGTH', true)}
      {linha(1, t2 + 62, 'BLOOD PRESSURE', false)}
      <Fonte g={g} ini={10} txt="Leong et al. 2015 · The Lancet · 139,691 adults in 17 countries" />
    </Palco>
  );
};

// 3. Promessa: dá para treinar em casa
const CenaPromessa: React.FC<CenaProps> = ({ g, D, ts }) => {
  const t2 = ts[1]; const barY = 235, esc = 0.95, x = 660, y = barY + 200 * esc;
  const s = pop(g, t2, 9); const trem = g > t2 && g < t2 + 8 ? Math.sin(g * 2.4) * (8 - (g - t2)) : 0;
  return (
    <Palco g={g} D={D}>
      <path d={`M 410,1010 L 410,150 L 910,150 L 910,1010`} fill="none" stroke={K.osso} strokeWidth={12} opacity={0.38 * L(g, [0, 12], [0, 1])} strokeLinejoin="round" />
      <path d={`M 440,1010 L 440,180 L 880,180 L 880,1010`} fill="none" stroke={K.osso} strokeWidth={4} opacity={0.2 * L(g, [0, 12], [0, 1])} />
      <Barra x1={424} x2={896} y={barY} op={L(g, [0, 10], [0, 1])} />
      <g transform={`rotate(${Math.sin(g / 13) * 1.4} ${x} ${barY})`}>
        <Figura x={x} y={y} esc={esc} pose={{ ombE: 168, ombD: 168, cotE: 2, cotD: 2, pernaE: 2, pernaD: 2, pe: 'solto', punho: true }} resp={Math.sin(g / 15)} tendao={0.6 + 0.35 * Math.sin(g / 6)} />
      </g>
      <Frase g={g} ini={26} x={1040} y={430} txt="at HOME" tam={170} fam={TIT} />
      <Frase g={g} ini={56} x={1044} y={512} txt="one bar · one doorway" tam={56} />
      <g opacity={L(g, [70, 82], [0, 1])}><rect x={1044} y={900} width={470} height={50} fill="none" stroke={K.ambar} strokeWidth={2.5} /><text x={1062} y={934} fontFamily={SANS} fontWeight={700} fontSize={25} fill={K.ambar}>BE SAFE · go slowly · stop if it hurts</text></g>
      {s > 0 && <text x={1040 + trem} y={740} fontFamily={TIT} fontSize={168 * (0.7 + 0.3 * Math.min(1.15, s))} fill={K.verm} letterSpacing={3}>HERE'S HOW</text>}
    </Palco>
  );
};

const CENAS: Record<string, React.FC<CenaProps>> = { gancho: CenaGancho, estudo: CenaEstudo, promessa: CenaPromessa };
type Bloco = { cena: string; ini: number; fim: number; falas: Fala[] };
export type TemposSNB = { total: number; blocos: Bloco[] };

export const SNBTeste: React.FC<{ tempos: TemposSNB }> = ({ tempos }) => {
  const f = useCurrentFrame(); const X = 8; const n = tempos.blocos.length;
  return (
    <AbsoluteFill style={{ background: K.fundo, overflow: 'hidden' }}>
      {tempos.blocos.map((b, i) => {
        const ini = Math.round(b.ini * 30), fim = i === n - 1 ? Math.ceil(tempos.total * 30) + 30 : Math.round(b.fim * 30);
        if (f < ini - X || f > fim + X) return null;
        const Comp = CENAS[b.cena];
        const op = L(f, [ini - X, ini + X], [0, 1]) * (i === n - 1 ? 1 : L(f, [fim - X, fim + X], [1, 0]));
        const ts = b.falas.map((x) => Math.round(x.t * 30) - ini);
        return <AbsoluteFill key={i} style={{ opacity: op }}><Comp g={Math.max(0, f - ini)} D={fim - ini} ts={ts} /></AbsoluteFill>;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay' }}><Img src={staticFile(`fx/grain${f % 4}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
      <AbsoluteFill style={{ background: '#000', opacity: L(f, [0, 8], [1, 0]) }} />
    </AbsoluteFill>
  );
};
