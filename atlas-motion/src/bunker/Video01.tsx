import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import T from '../../public/bunker/v01/tempos.json';
import './fontes';
import { Ben, Sala, Defs, Lata, Proibido, Humor } from './Teste';
import {
  W, H, CHAO, AB, GIZ, ip, pop, Etq, Nao, ISol, IDucha, ITomada, Prateleira, Barris, Caixote, Kurbel, Lousa, Quadro, Certo, Visor, Cama, Mesa,
  Bateria, Bici, Cabo, Planta, Corte, Marder, Duto, GradeSolta, Armadilha, Garrafa, Saco, Balde, Prato, Livros, Riscos, Chave,
} from './Objetos';

// Bunker, vídeo 1: uma cena por bloco do roteiro (bunker/roteiro01.json), sincronizada pelos tempos de cada fala.
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const F = (T as any).falas as { id: string; ini: number; fim: number; t: string }[];
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const BUNKER01_FRAMES = fr((T as any).dur) + 75;

type C = { f: number; L: (n: number) => number; at: (n: number, q: number) => number; li: number; boca: number; ini: number; fim: number };
type Shot = [number, number, number, number, number]; // fala em que começa, zoom inicial, zoom final, foco x, foco y
type Bloco = { id: string; dia: (li: number) => number; shots: Shot[]; cena: (c: C) => React.ReactNode };

const mao = (x: number, y: number, k: number, a: number): [number, number] => [x + (108 + a * 96) * k, y + (-176 - a * 168) * k];
const vis = (f: number, a: number, b: number, d = 10) => (f >= b ? 0 : pop(f, a, d));
const Giz: React.FC<{ x: number; y: number; t: string; o?: number; fs?: number; cor?: string }> = ({ x, y, t, o = 1, fs = 84, cor }) => (
  <text x={x} y={y} fontSize={fs} opacity={o} fill={cor}>{t}</text>
);
const Deitado: React.FC<{ x: number; y: number; k?: number; humor?: Humor; dorme?: boolean; olhar?: number; olharY?: number; boca?: number; rot?: number }> = ({ x, y, k = 0.62, humor = 'neutro', dorme, olhar = 0, olharY = 0, boca = 0, rot = -76 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) translate(0 ${446 * k})`}><Ben x={0} y={0} k={k} soCabeca humor={humor} dorme={dorme} olhar={olhar} olharY={olharY} fala={boca} /></g>
);
const Sentado: React.FC<{ x: number; y: number; k?: number; humor?: Humor; olhar?: number; olharY?: number; boca?: number; maoCabeca?: boolean }> = ({ x, y, k = 1, humor, olhar, olharY, boca, maoCabeca }) => (
  <g>
    <Ben x={x} y={y - 24 * k + 150 * k} k={k} semPernas humor={humor} olhar={olhar} olharY={olharY} fala={boca} maoCabeca={maoCabeca} />
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-70} y={-58} width={270} height={50} rx={20} fill="#24344a" /><rect x={-84} y={-44} width={280} height={50} rx={20} fill="#2f4563" />
      <rect x={176} y={-82} width={44} height={88} rx={14} fill="#5b3b27" /><rect x={208} y={-82} width={12} height={88} rx={6} fill="#22140c" />
    </g>
  </g>
);
const Placa: React.FC<{ n: number }> = ({ n }) => (
  <g transform="translate(70 56)">
    <rect x={3} y={5} width={300} height={96} rx={12} fill="#000" opacity={0.4} />
    <rect width={300} height={96} rx={12} fill="#1d2626" stroke="#e7b540" strokeWidth={5} />
    {[14, 286].map((x) => [14, 82].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={4.5} fill="#e7b540" />))}
    <text x={150} y={68} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={54} fill="#f4c64d" letterSpacing={3}>TAG {n}</text>
  </g>
);
const Legenda: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const q = F.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.25);
  if (!q) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1380, textAlign: 'center', fontFamily: AB, fontWeight: 900, fontSize: 46, lineHeight: 1.18, color: '#fff', padding: '10px 26px', borderRadius: 14, background: 'rgba(8,12,12,0.62)', textShadow: '0 3px 0 #000' }}>{q.t}</div>
    </div>
  );
};
const Dor: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>{[0, 1, 2].map((i) => { const ph = ((f + i * 12) % 36) / 36; return <circle key={i} cx={x} cy={y} r={70 + ph * 90} fill="none" stroke="#ff4a36" strokeWidth={9} opacity={(1 - ph) * 0.7} />; })}</g>
);
const Estoque: React.FC<{ f: number; t0?: number; sorted?: boolean; lamp?: number }> = ({ f, t0, sorted, lamp = 1 }) => (
  <g><Prateleira f={f} t0={t0} sorted={sorted} /><Barris /><Caixote x={1730} y={CHAO + 40} /><Kurbel x={1730} y={CHAO - 90} f={f} glow={lamp} /></g>
);

// ---------- cenas ----------
const PortaCena: React.FC<{ f: number; a2: number; boca: number }> = ({ f, a2, boca }) => {
  const FECHA = 20;
  const portaX = ip(f, 2, FECHA, 0.16, 1, Easing.in(Easing.cubic));
  const tranco = f >= FECHA && f < FECHA + 12 ? Math.sin((f - FECHA) * 2.4) * (12 - (f - FECHA)) * 1.1 : 0;
  const volante = ip(f, FECHA + 4, FECHA + 54, 0, 560, Easing.out(Easing.cubic));
  const trava = ip(f, FECHA + 40, FECHA + 56, 0, 1, Easing.out(Easing.cubic));
  const vira = ip(f, a2 - 8, a2 + 6, 1, 0.15);
  return (
    <g transform={`translate(${tranco} 0)`}>
      <Sala>
        <g transform="translate(1390 452)">
          <circle r={292} fill="#1c2424" /><circle r={278} fill="url(#acoEscuro)" stroke="#11191a" strokeWidth={8} /><circle r={236} fill="#05090b" />
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
        <g transform={`translate(930 290) scale(${pop(f, a2 + 62) * 0.72})`}>
          <rect x={-208} y={-54} width={416} height={108} rx={14} fill="#10161a" stroke="#3c484e" strokeWidth={6} />
          <text x={0} y={30} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={82} fill="#ff4a36" letterSpacing={6} style={{ filter: 'drop-shadow(0 0 12px #ff3a26)' }}>365 TAGE</text>
        </g>
        <Ben x={640} y={900} k={1.12} humor={f < a2 - 4 ? 'neutro' : 'preocupado'} olhar={vira} fala={boca} inclina={f < a2 ? 0 : -3} />
      </Sala>
    </g>
  );
};

const gancho = ({ f, L, at, li, boca }: C) => {
  if (li <= 2) return <PortaCena f={f} a2={L(2)} boca={boca} />;
  if (li <= 4) return (
    <Sala>
      <Estoque f={f} t0={L(3) - 6} lamp={pop(f, at(3, 0.75), 14)} />
      <Etq x={500} y={200} s={pop(f, L(3) + 28)} t="400" fs={88} rot={-4} />
      <Etq x={1385} y={CHAO - 150} s={pop(f, at(3, 0.42))} t="2.000 L" cor="#123f6e" borda="#123f6e" rot={3} />
      {li === 4 && <rect width={W} height={H} fill="#000" opacity={0.3 * ip(f, L(4) - 2, L(4) + 6, 0, 1)} />}
      <Proibido x={1150} y={250} s={li === 4 ? pop(f, at(4, 0) + 2) : 0} tipo="janela" />
      <Proibido x={1390} y={250} s={li === 4 ? pop(f, at(4, 0.36)) : 0} tipo="celular" />
      <Proibido x={1630} y={250} s={li === 4 ? pop(f, at(4, 0.7)) : 0} tipo="rede" />
      <Ben x={1060} y={910} humor={li === 3 ? 'sorriso' : 'preocupado'} olhar={li === 3 ? -0.8 : 0.5} olharY={li === 3 ? 0 : -1} gesto={li === 3 ? 0.5 : 0} fala={boca} />
    </Sala>
  );
  if (li === 5) return <Sala><Ben x={820} y={1560} k={2.5} humor={f < at(5, 0.5) ? 'cetico' : 'sorriso'} inclina={4} gesto={0.9} apontar={0.3} fala={boca} /></Sala>;
  return (
    <Sala luz={0.4} frio={0.45} frente={<Ben x={720} y={1560} k={2.5} humor="preocupado" olhar={Math.sin(f / 13)} olharY={-0.4} fala={boca} />}>
      {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={1150 + random(`g${i}`) * 600 + Math.sin((f + i * 30) / 40) * 40} cy={250 + random(`h${i}`) * 400 - ((f * 0.5) % 60)} r={60 + random(`r${i}`) * 70} fill="#b9d4c9" opacity={0.07} filter="url(#suave)" />)}
      <Nao x={1420} y={430} s={li === 7 ? pop(f, L(7) + 14) * 2 : 0}><Lata x={0} y={34} cor="#d8453b" s={1} /></Nao>
    </Sala>
  );
};

const plano = ({ f, L, at, li, boca }: C) => {
  if (li === 1) return (
    <Sala>
      <Cama x={1420} y={CHAO + 50} />
      <Mesa x={420} y={CHAO + 40} s={0.9}><Lata x={-60} y={-176} cor="#3f9b5a" s={1} /><Garrafa x={60} y={-176} s={0.8} /></Mesa>
      <Ben x={900} y={910} humor="sorriso" gesto={0.75 + Math.sin(f / 4) * 0.18} apontar={f > at(1, 0.4) ? 0.35 : 0} fala={boca} />
    </Sala>
  );
  if (li <= 3) {
    const n2 = f < at(2, 0.34) ? 0 : f < at(2, 0.66) ? 1 : 2;
    const hl = li < 3 ? -1 : f < at(3, 0.2) ? 0 : f < at(3, 0.42) ? 1 : f < at(3, 0.62) ? 2 : 3;
    return (
      <Sala>
        <Planta x={1180} y={440} s={pop(f, L(2) - 6, 12)} d6={li > 2 ? 0.35 : n2 === 0 ? pop(f, L(2) + 6) : 0.35} d4={li > 2 ? 0.35 : n2 === 1 ? 1 : n2 > 1 ? 0.35 : 0} d25={li > 2 ? 0.35 : n2 === 2 ? 1 : 0} hl={hl} />
        <Ben x={360} y={910} humor="neutro" olhar={0.9} apontar={0.55} fala={boca} />
      </Sala>
    );
  }
  if (li === 4) return (
    <Sala>
      <Corte x={1180} y={440} s={pop(f, L(4) - 6, 12)} terra={ip(f, at(4, 0.12), at(4, 0.12) + 10, 0, 1)} />
      <Ben x={360} y={910} humor="preocupado" olhar={0.9} olharY={-0.6} apontar={0.7} fala={boca} />
    </Sala>
  );
  if (li <= 6) return (
    <Sala>
      <Quadro x={1150} y={430} w={900} h={540} titulo="DIE ERSTEN 7 TAGE" s={pop(f, L(5) - 6, 12)}>
        {[1, 2, 3, 4, 5, 6, 7].map((d, i) => (
          <g key={d} transform={`translate(${110 + i * 113} 210) scale(${pop(f, at(5, 0.3) + i * 4)})`}>
            <rect x={-46} y={-56} width={92} height={112} rx={10} fill="#22303a" /><rect x={-46} y={-56} width={92} height={30} rx={10} fill="#d63b2f" />
            <text x={0} y={36} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={58} fill="#f3ead8">{d}</text>
          </g>
        ))}
        {li === 6 && (
          <g>
            <g transform={`translate(230 420) scale(${pop(f, at(6, 0))})`}><Lata x={0} y={40} cor="#d8453b" s={1.5} /></g>
            <g transform={`translate(450 420) scale(${pop(f, at(6, 0.34))})`}><Garrafa x={0} y={46} s={1} /></g>
            <g transform={`translate(680 420) scale(${pop(f, at(6, 0.66))})`}><rect x={-80} y={0} width={160} height={26} rx={8} fill="#8a5a2c" /><rect x={-74} y={-22} width={148} height={26} rx={10} fill="#62784a" /><ellipse cx={-48} cy={-26} rx={26} ry={12} fill="#d9d4c4" /><text x={36} y={-40} fontFamily={AB} fontSize={40} fill="#22303a">Zz</text></g>
          </g>
        )}
      </Quadro>
      <Ben x={360} y={910} humor="sorriso" olhar={0.9} apontar={0.5} gesto={li === 6 ? 0.4 : 0} fala={boca} />
    </Sala>
  );
  return (
    <Sala luz={0.7} frio={0.2}>
      <g transform={`translate(1400 420) scale(${pop(f, at(7, 0.3)) * 1.5})`}>
        <path d="M0 -110 L104 70 L-104 70 Z" fill="#f4c64d" stroke="#22303a" strokeWidth={12} strokeLinejoin="round" />
        <rect x={-10} y={-50} width={20} height={66} rx={8} fill="#22303a" /><circle cx={0} cy={40} r={12} fill="#22303a" />
      </g>
      <Ben x={700} y={1560} k={2.5} humor="preocupado" olhar={0.3} fala={boca} inclina={-3} />
    </Sala>
  );
};

const comida = ({ f, L, at, li, boca }: C) => {
  if (li <= 3) return (
    <Sala>
      <Estoque f={f} />
      <Etq x={500} y={200} s={pop(f, L(2) + 4)} t="400" fs={88} rot={-4} />
      <Ben x={1060} y={910} humor={li === 3 ? 'sorriso' : 'neutro'} olhar={-0.8} olharY={li === 3 ? -0.6 : 0} gesto={li >= 2 ? 0.8 : 0.2} fala={boca} />
    </Sala>
  );
  if (li <= 6) return (
    <Sala>
      <Lousa>
        <Giz x={70} y={150} t="400 Dosen" o={ip(f, at(5, 0.02), at(5, 0.02) + 10, 0, 1)} fs={92} />
        <Giz x={70} y={270} t="÷ 365 Tage" o={ip(f, at(5, 0.42), at(5, 0.42) + 10, 0, 1)} fs={92} />
        <rect x={66} y={300} width={ip(f, L(6) - 4, L(6) + 8, 0, 560)} height={8} rx={4} />
        <Giz x={70} y={430} t="≈ 1,1 pro Tag" o={ip(f, L(6) + 12, L(6) + 22, 0, 1)} fs={92} cor="#ffd95e" />
      </Lousa>
      <Ben x={520} y={1560} k={2.5} humor={li === 4 ? 'cetico' : li === 5 ? 'neutro' : 'preocupado'} olhar={li === 4 ? 0 : 0.9} inclina={li === 4 ? 4 : 0} apontar={li === 4 ? 0 : 0.5} fala={boca} />
    </Sala>
  );
  if (li <= 8) return (
    <Sala>
      <Mesa x={1180} y={CHAO + 60} s={1.5}>
        <Prato x={-150} y={-190} s={0.62} t="FRÜHSTÜCK" /><Prato x={0} y={-190} s={0.62} t="MITTAG"><Lata x={0} y={-4} cor="#d8453b" s={pop(f, L(7) + 4) * 1.3} /></Prato><Prato x={150} y={-190} s={0.62} t="ABEND" />
      </Mesa>
      <Ben x={430} y={910} humor={li === 7 ? 'cetico' : 'preocupado'} olhar={0.9} olharY={0.4} gesto={li === 8 ? 0.7 : 0} apontar={li === 8 ? 0.2 : 0.4} fala={boca} />
    </Sala>
  );
  if (li === 9) return (
    <Sala>
      <Estoque f={f} />
      <Saco x={260} y={CHAO + 70} s={pop(f, at(9, 0.42)) * 1.25} t="REIS" /><Saco x={420} y={CHAO + 78} s={pop(f, at(9, 0.5)) * 1.25} t="REIS" />
      <Balde x={640} y={CHAO + 78} s={pop(f, at(9, 0.72)) * 1.25} t="HAFER" />
      <Ben x={1060} y={910} humor="sorriso" olhar={-0.9} olharY={0.8} gesto={0.5} fala={boca} />
    </Sala>
  );
  if (li <= 11) return (
    <Sala>
      <Quadro x={1160} y={430} w={860} h={560} titulo="ESSENSPLAN" s={pop(f, L(10) - 2, 12)}>
        {[['MORGENS', 'Haferflocken', 0.0], ['MITTAGS', 'Reis', 0.34], ['ABENDS', 'die Dose', 0.62]].map(([a, b, q], i) => {
          const s = li < 11 ? 0 : pop(f, at(11, q as number));
          return (
            <g key={i} transform={`translate(70 ${190 + i * 118}) scale(${s})`}>
              <rect width={720} height={96} rx={12} fill={i === 2 ? '#d8453b' : '#22303a'} />
              <text x={28} y={64} fontFamily={AB} fontWeight={900} fontSize={44} fill="#f4c64d">{a}</text>
              <text x={692} y={64} textAnchor="end" fontFamily={AB} fontWeight={900} fontSize={44} fill="#f3ead8">{b}</text>
            </g>
          );
        })}
      </Quadro>
      <Ben x={360} y={910} humor="neutro" olhar={0.9} apontar={li === 11 ? 0.6 : 0.2} gesto={li === 10 ? 0.5 : 0} fala={boca} />
    </Sala>
  );
  return (
    <Sala>
      <g transform="translate(1250 470)">
        <g opacity={li === 12 ? 1 : 0.5} transform={`rotate(${f * 0.6})`}>{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-9} y={-330} width={18} height={150} rx={9} fill="#ffe08a" opacity={0.5} transform={`rotate(${i * 30})`} />)}</g>
        <circle r={190} fill="#ffdc9e" opacity={0.35} filter="url(#brilho)" />
        <Lata x={0} y={150} cor={li === 12 ? '#d8453b' : '#f29a45'} s={pop(f, L(12) - 2) * 4.2} />
      </g>
      <Etq x={1250} y={170} s={li === 13 ? pop(f, at(13, 0.3)) : 0} t="NUR SONNTAGS" fs={60} cor="#f3ead8" fundo="#d63b2f" borda="#7d2a1c" rot={-4} />
      <Etq x={1250} y={470} s={li === 13 ? pop(f, L(13) + 4) : 0} t="Pfirsiche" fs={44} rot={2} />
      <Ben x={520} y={910} humor="sorriso" olhar={0.9} gesto={li === 12 ? 0.9 : 0.2} apontar={li === 12 ? 0.6 : 0} fala={boca} />
    </Sala>
  );
};

const agua = ({ f, L, at, li, boca }: C) => {
  if (li <= 2) return (
    <Sala>
      <Estoque f={f} />
      <Etq x={1385} y={CHAO - 150} s={pop(f, L(2) + 2)} t="2.000 L" cor="#123f6e" borda="#123f6e" rot={3} />
      <Ben x={1000} y={910} humor="sorriso" olhar={0.8} apontar={0.45} fala={boca} />
    </Sala>
  );
  if (li <= 4) return (
    <Sala>
      <Barris />
      <g transform={`translate(760 ${CHAO + 60}) scale(${pop(f, L(3) + 2)})`}>
        <rect x={-110} y={-250} width={220} height={250} rx={24} fill="#4aa3e0" stroke="#1f5f9e" strokeWidth={6} /><rect x={-40} y={-290} width={80} height={46} rx={10} fill="#1f5f9e" /><rect x={-90} y={-230} width={26} height={200} rx={12} fill="#fff" opacity={0.3} />
      </g>
      <Etq x={760} y={CHAO - 80} s={vis(f, L(3) + 24, L(4))} t="5,5 L" cor="#123f6e" borda="#123f6e" rot={-3} />
      {[0, 1, 2].map((i) => <Garrafa key={i} x={620 + i * 90} y={CHAO + 70} s={li === 4 ? pop(f, at(4, 0.05) + i * 5) * 1.5 : 0} />)}
      <g transform={`translate(960 ${CHAO + 70}) scale(${li === 4 ? pop(f, at(4, 0.5)) : 0})`}><rect x={-70} y={-80} width={140} height={80} rx={10} fill="#8a979a" stroke="#4d595b" strokeWidth={5} /><rect x={-104} y={-70} width={34} height={12} rx={5} fill="#22303a" /><rect x={70} y={-70} width={34} height={12} rx={5} fill="#22303a" /></g>
      <g transform={`translate(1130 ${CHAO + 70}) scale(${li === 4 ? pop(f, at(4, 0.72)) : 0})`}><path d="M-80 -50 Q-70 0 0 0 Q70 0 80 -50 Z" fill="#e9eef0" stroke="#8d989a" strokeWidth={5} /><ellipse cx={0} cy={-50} rx={80} ry={12} fill="#9fd0ef" stroke="#8d989a" strokeWidth={4} /></g>
      <Ben x={330} y={910} humor="neutro" olhar={0.9} apontar={0.5} fala={boca} />
    </Sala>
  );
  if (li <= 6) return (
    <Sala>
      <Nao x={1250} y={300} s={vis(f, L(5) + 6, L(6)) * 1.8}><IDucha /></Nao>
      <Mesa x={1250} y={CHAO + 60} s={1.3}>
        <g transform={`translate(-130 -176) scale(${li === 6 ? pop(f, at(6, 0.12)) : 0})`}><path d="M-60 0 Q-50 -34 -10 -30 Q30 -44 60 -10 L64 0 Z" fill="#e7b540" stroke="#8a6a14" strokeWidth={4} /></g>
        <g transform={`translate(10 -176) scale(${li === 6 ? pop(f, at(6, 0.36)) : 0})`}><path d="M-70 -50 Q-60 0 0 0 Q60 0 70 -50 Z" fill="#e9eef0" stroke="#8d989a" strokeWidth={5} /><ellipse cx={0} cy={-50} rx={70} ry={11} fill="#9fd0ef" stroke="#8d989a" strokeWidth={4} /></g>
        <Garrafa x={150} y={-176} s={li === 6 ? pop(f, at(6, 0.62)) * 1.1 : 0} />
      </Mesa>
      <Etq x={1500} y={CHAO - 330} s={li === 6 ? pop(f, at(6, 0.7)) : 0} t="0,5 L" fs={64} cor="#123f6e" borda="#123f6e" rot={4} />
      <Ben x={520} y={910} humor={li === 5 ? 'cetico' : 'neutro'} olhar={0.9} gesto={li === 5 ? 0.8 : 0} apontar={li === 5 ? 0.3 : 0.4} fala={boca} />
    </Sala>
  );
  return <Sala><Ben x={860} y={1560} k={2.5} humor="sorriso" gesto={0.8} apontar={0.3} inclina={3} fala={boca} /></Sala>;
};

const energia = ({ f, L, at, li, boca }: C) => {
  if (li <= 2) return (
    <Sala>
      <Nao x={1300} y={340} s={pop(f, L(2) + 4) * 1.9}><ITomada /></Nao>
      <Ben x={640} y={910} humor={li === 1 ? 'neutro' : 'preocupado'} olhar={li === 2 ? 0.9 : 0} olharY={li === 2 ? -0.5 : 0} gesto={li === 1 ? 0.5 : 0} apontar={li === 2 ? 0.5 : 0} fala={boca} />
    </Sala>
  );
  if (li <= 6) {
    const anda = li >= 4;
    const ang = anda ? (f - L(4)) * 0.3 : 0.6;
    const bx = 1080, by = CHAO + 70, s = 1.1;
    return (
      <Sala>
        <Cabo x1={bx + 160 * s} y1={by - 20} x2={1560} y2={by - 120} />
        <g transform={`translate(1640 ${by}) scale(${pop(f, at(3, 0.08))}) translate(-1640 ${-by})`}><Bateria x={1640} y={by} s={1.15} nivel={anda ? ip(f, L(4), L(7), 0.12, 0.95) : 0.12} /></g>
        <g transform={`translate(${bx} ${by}) scale(${pop(f, at(3, 0.42))}) translate(${-bx} ${-by})`}>
          <Bici x={bx} y={by} s={s} ang={ang} pernas={anda} />
          {anda && <Ben x={bx - 16 * s} y={by - 262 * s + 150 * 0.95} k={0.95} semPernas humor={li === 4 ? 'preocupado' : 'sorriso'} olhar={0.6} apontar={0.02} fala={boca} />}
        </g>
        {anda && <g opacity={ip(f, L(4), L(4) + 40, 0, 1)}><Kurbel x={420} y={420} s={1.6} f={f} gira={false} /></g>}
        <Etq x={420} y={560} s={vis(f, L(4) + 10, L(5))} t="1 Std" fs={70} rot={-3} />
        {!anda && <Ben x={500} y={910} humor="neutro" olhar={0.9} apontar={0.55} fala={boca} />}
      </Sala>
    );
  }
  if (li === 7) return <Sala><Ben x={860} y={1380} k={2.0} humor={f < at(7, 0.62) ? 'sorriso' : 'cetico'} gesto={f < at(7, 0.62) ? 1.1 : 0.2} apontar={f < at(7, 0.62) ? 0.75 : 0} inclina={f < at(7, 0.62) ? 0 : 5} fala={boca} /></Sala>;
  return (
    <Sala luz={0.22} frio={0.5} frente={<g><Kurbel x={1250} y={CHAO - 90} s={1.5} f={f} glow={pop(f, at(8, 0.55), 14)} /><Ben x={720} y={910} humor="preocupado" olhar={0.9} apontar={0.3} fala={boca} /></g>}>
      <Bateria x={1640} y={CHAO + 70} s={1.15} nivel={0.04} />
      <Caixote x={1250} y={CHAO + 40} s={1.2} />
    </Sala>
  );
};

const noite1 = ({ f, L, at, li, boca }: C) => {
  const cx = 1240, cy = CHAO + 110, s = 1.6;
  const olhar = li >= 5 && li <= 6 ? -1 : li === 7 ? -0.4 : 0;
  const susto = li === 6 ? 'medo' : li >= 4 && li <= 5 ? 'preocupado' : 'neutro';
  return (
    <Sala luz={0.1} frio={0.66} frente={
      <g>
        <ellipse cx={cx - 190 * s} cy={cy - 210 * s} rx={170} ry={130} fill="#bcd4ff" opacity={0.1} filter="url(#brilho)" />
        <Deitado x={cx - 196 * s} y={cy - 196 * s} k={0.62 * s} humor={susto as Humor} dorme={li === 8 && f > at(8, 0.3)} olhar={olhar} olharY={-0.4} boca={boca} />
        {li === 4 && <g transform={`translate(${cx + 20} ${cy - 330}) scale(${1 + (f % 26 < 5 ? 0.25 : 0)})`}><path d="M0 34 C-70 -20 -34 -70 0 -32 C34 -70 70 -20 0 34 Z" fill="#ff4a5a" /></g>}
        {li >= 6 && li <= 7 && [0, 1, 2].map((i) => <path key={i} d={`M${330 + i * 26 + (f % 6 < 3 ? 4 : 0)} ${430 + i * 6} l18 60`} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={li === 6 ? 0.85 : 0.3} />)}
        {li === 8 && f > at(8, 0.4) && <text x={cx - 60} y={cy - 420 - ((f / 2) % 30)} fontFamily={AB} fontSize={70} fill="#cfe0ff" opacity={0.8}>Zzz</text>}
      </g>
    }>
      <Duto x={420} y={300} f={li === 3 ? f : f * 0.6} />
      {li === 7 && <rect y={54} width={W} height={38} fill="#ffb060" opacity={0.5 + 0.2 * Math.sin(f / 5)} filter="url(#suave2)" />}
      <Cama x={cx} y={cy} s={s} />
    </Sala>
  );
};

const rotina = ({ f, L, at, li, boca }: C) => {
  if (li <= 3) return (
    <Sala>
      <Cama x={1480} y={CHAO + 50} />
      <Nao x={1180} y={320} s={vis(f, L(2) + 18, L(3)) * 1.9}><ISol /></Nao>
      <g transform={`translate(1180 320) scale(${li === 3 ? pop(f, L(3) + 4) * 1.5 : 0})`}>
        <circle r={110} fill="#f3ead8" stroke="#22303a" strokeWidth={12} />
        <rect x={-5} y={-80} width={10} height={84} rx={5} fill="#22303a" transform={`rotate(${f * 9})`} /><rect x={-6} y={-54} width={12} height={58} rx={6} fill="#d63b2f" transform={`rotate(${f * 2.3})`} /><circle r={10} fill="#22303a" />
      </g>
      <Ben x={640} y={910} humor="preocupado" olhar={li === 1 ? 0 : 0.8} olharY={-0.6} gesto={li === 3 ? 0.7 : 0} apontar={li === 3 ? 0.3 : 0} fala={boca} />
    </Sala>
  );
  if (li <= 5) return (
    <Sala>
      <Quadro x={1160} y={420} w={820} h={470} titulo="REGELN" s={pop(f, L(4) + 4, 12)}>
        {[['LICHT AN', '7:00', 0.0, '#e2a020'], ['LICHT AUS', '22:00', 0.5, '#22303a']].map(([a, b, q, cor], i) => (
          <g key={i} transform={`translate(60 ${180 + i * 130}) scale(${li < 5 ? 0 : pop(f, at(5, q as number))})`}>
            <rect width={700} height={104} rx={12} fill={cor as string} />
            <text x={28} y={70} fontFamily={AB} fontWeight={900} fontSize={50} fill="#f3ead8">{a}</text>
            <text x={672} y={72} textAnchor="end" fontFamily={AB} fontWeight={900} fontSize={60} fill="#fff">{b}</text>
          </g>
        ))}
      </Quadro>
      <Ben x={360} y={910} humor="neutro" olhar={0.9} apontar={0.55} fala={boca} />
    </Sala>
  );
  if (li === 6) return (
    <Sala>
      <Riscos x={1180} y={330} n={2} s={1.6} novo={ip(f, at(6, 0.4), at(6, 0.4) + 14, 0, 1)} />
      <Ben x={860} y={910} k={1.05} humor="neutro" olhar={0.9} olharY={-0.5} apontar={ip(f, at(6, 0.25), at(6, 0.45), 0.2, 0.95)} fala={boca} />
    </Sala>
  );
  if (li <= 8) {
    const bx = interpolate(f, [at(8, 0), at(8, 0.32)], [1740, 1100], cl);
    const andando = li === 8 && f < at(8, 0.32);
    return (
      <Sala>
        <Prateleira f={f} sorted={li === 8 && f > at(8, 0.36)} /><Riscos x={1500} y={250} n={3} s={0.9} />
        <Livros x={1560} y={CHAO + 70} s={li === 8 ? pop(f, at(8, 0.66)) * 1.3 : 0} />
        <Etq x={1560} y={CHAO - 170} s={li === 8 ? pop(f, at(8, 0.78)) : 0} t="1 / 12" fs={58} rot={4} />
        <Ben x={li === 7 ? 1740 : bx} y={910} humor="sorriso" olhar={li === 7 ? 0 : -0.8} anda={andando ? f * 0.42 : undefined} gesto={li === 8 && !andando ? 0.7 : 0} fala={boca} />
      </Sala>
    );
  }
  return <Sala><Ben x={860} y={1560} k={2.5} humor={li === 9 ? 'sorriso' : 'cetico'} gesto={li === 9 ? 0.6 : 0} inclina={li === 10 ? 5 : 0} olhar={li === 10 ? 0.6 : 0} fala={boca} /></Sala>;
};

const cabeca = ({ f, L, at, li, boca }: C) => {
  if (li <= 4) return (
    <Sala luz={0.62} frio={0.25}>
      <g transform={`translate(1330 360) scale(${pop(f, L(2) - 2, 12)})`}>
        <circle cx={-330} cy={250} r={22} fill="#f3ead8" /><circle cx={-270} cy={190} r={36} fill="#f3ead8" />
        <ellipse rx={330} ry={210} fill="#f3ead8" stroke="#22303a" strokeWidth={8} />
        {li <= 3 && <g transform={`rotate(${f * 4})`} opacity={0.85}><path d="M0 0 m-10 0 a10 10 0 1 1 20 0 a30 30 0 1 1 -60 0 a50 50 0 1 1 100 0 a70 70 0 1 1 -140 0 a90 90 0 1 1 180 0" stroke="#22303a" strokeWidth={12} fill="none" strokeLinecap="round" /></g>}
        {li === 4 && <text x={0} y={-36} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={86} fill="#22303a" opacity={f < at(4, 0.45) ? 1 : 0.25}>362 Tage</text>}
        {li === 4 && <text x={0} y={86} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={86} fill="#d63b2f" opacity={f < at(4, 0.45) ? 0 : 1}>8.000+ Std</text>}
      </g>
      <Ben x={560} y={1480} k={2.3} humor={li <= 1 ? 'neutro' : 'preocupado'} olhar={li >= 3 ? 0.7 : 0} olharY={li >= 3 ? -0.9 : 0} maoCabeca={li === 3} fala={boca} />
    </Sala>
  );
  if (li <= 6) return (
    <Sala luz={0.7} frio={0.2}>
      {li === 6 && (
        <g>
          <g transform={`translate(900 400) scale(${pop(f, at(6, 0)) * 1.5})`}><rect x={-70} y={-90} width={140} height={180} rx={10} fill="#7a4fa0" /><rect x={-70} y={-90} width={24} height={180} fill="#000" opacity={0.25} /><rect x={-30} y={-50} width={84} height={36} rx={4} fill="#f3ead8" /><rect x={30} y={-110} width={14} height={90} rx={4} fill="#e2b33c" transform="rotate(24 37 -65)" /></g>
          <Etq x={900} y={600} s={pop(f, at(6, 0) + 6)} t="Tagebuch" fs={42} rot={-2} />
          <g transform={`translate(1260 400) scale(${pop(f, at(6, 0.26)) * 1.5})`}><rect x={-90} y={-12} width={180} height={24} rx={8} fill="#8a979a" />{[-90, 70].map((x) => <g key={x}><rect x={x - 8} y={-58} width={36} height={116} rx={8} fill="#22303a" /></g>)}</g>
          <Etq x={1260} y={600} s={pop(f, at(6, 0.26) + 6)} t="20×" fs={64} rot={3} />
          <g transform={`translate(1620 390) scale(${pop(f, at(6, 0.66)) * 1.5})`}><path d="M-90 -70 h180 q20 0 20 20 v70 q0 20 -20 20 h-110 l-50 44 v-44 h-20 q-20 0 -20 -20 v-70 q0 -20 20 -20 Z" fill="#f3ead8" stroke="#22303a" strokeWidth={7} />{[-50, 0, 50].map((x, i) => <circle key={x} cx={x} cy={-16} r={10 + (Math.floor(f / 5) % 3 === i ? 5 : 0)} fill="#22303a" />)}</g>
        </g>
      )}
      <Ben x={430} y={910} humor={li === 5 ? 'neutro' : 'sorriso'} olhar={0.8} gesto={li === 5 ? 0.6 : 0.2} apontar={li === 6 ? 0.5 : 0.2} fala={boca} />
    </Sala>
  );
  return (
    <Sala luz={0.7} frio={0.2}>
      <Bateria x={1380} y={CHAO + 70} s={1.7} nivel={0.8} gisela={pop(f, at(7, 0.55))} f={f} />
      <Ben x={700} y={910} k={1.1} humor={li === 8 && f < at(8, 0.4) ? 'cetico' : 'sorriso'} olhar={li === 8 ? 0 : 0.9} gesto={li >= 8 ? 0.7 : 0.2} apontar={0.5} inclina={li === 9 ? 4 : 0} fala={boca} />
    </Sala>
  );
};

const pergunta = ({ f, L, at, li, boca }: C) => (
  <Sala>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${1140 + i * 250} 420) scale(${li >= 2 ? pop(f, at(2, 0.1 + i * 0.1)) : 0})`}>
        <rect x={-100} y={-100} width={200} height={200} rx={14} fill="url(#madeira)" stroke="#4b2f1f" strokeWidth={7} />
        <text x={0} y={44} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={130} fill="#f3ead8" transform={`rotate(${Math.sin((f + i * 20) / 9) * 5})`}>?</text>
        <circle cx={-70} cy={-70} r={28} fill="#f4c64d" /><text x={-70} y={-56} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={38} fill="#22303a">{i + 1}</text>
      </g>
    ))}
    <g transform={`translate(1390 700) scale(${li >= 3 ? pop(f, L(3) + 2) : 0})`}>
      <rect x={-330} y={-52} width={660} height={104} rx={18} fill="#22303a" stroke="#f4c64d" strokeWidth={6} />
      <text x={-20} y={22} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={56} fill="#f3ead8">KOMMENTARE</text>
      <path d={`M250 ${-18 + Math.sin(f / 4) * 8} v40 m-22 -20 l22 24 l22 -24`} stroke="#f4c64d" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <Ben x={520} y={1500} k={2.3} humor={li === 4 ? 'preocupado' : li === 3 ? 'sorriso' : 'neutro'} gesto={li === 2 ? 0.8 : 0} apontar={li === 3 ? 0.4 : 0} olhar={li === 4 ? -0.7 : 0.2} inclina={li === 4 ? -4 : 3} fala={boca} />
  </Sala>
);

const sintomas = ({ f, L, at, li, boca }: C) => {
  if (li <= 4) {
    const a = li === 4 ? ip(f, at(4, 0.55), at(4, 0.7), 0.2, 0.9) : 0;
    const [mx, my] = mao(700, 910, 1.1, a);
    return (
      <Sala luz={0.85}>
        <Cama x={1400} y={CHAO + 50} s={1.1} />
        <Etq x={1400} y={420} s={vis(f, at(3, 0.45), L(4))} t="9 Std" fs={70} rot={3} />
        <Ben x={700} y={910} k={1.1} humor="preocupado" maoCabeca={li <= 3} olharY={0.4} apontar={a} inclina={-4} fala={boca} />
        {li <= 3 && <Dor x={700} y={910 - 470 * 1.1} f={f} />}
        {li === 4 && f > at(4, 0.5) && <Garrafa x={mx} y={my + 30} s={1.2} />}
      </Sala>
    );
  }
  if (li === 6) {
    const para = at(6, 0.45);
    const ang = (Math.min(f, para) - L(6)) * 0.22;
    const bx = 1080, by = CHAO + 70, s = 1.1;
    return (
      <Sala luz={0.85}>
        <Cabo x1={bx + 160 * s} y1={by - 20} x2={1560} y2={by - 120} /><Bateria x={1640} y={by} s={1.15} nivel={0.5} />
        <Bici x={bx} y={by} s={s} ang={ang} pernas />
        <Ben x={bx - 16 * s} y={by - 262 * s + 150 * 0.95} k={0.95} semPernas humor="medo" olhar={0.4} olharY={0.6} apontar={0.02} inclina={8} fala={boca} />
        <Dor x={bx - 10} y={by - 262 * s - 270} f={f} />
        <Etq x={520} y={420} s={vis(f, L(6) + 30, 1e9)} t="10 min" fs={70} rot={-3} />
      </Sala>
    );
  }
  if (li <= 7) return (
    <Sala luz={0.8}>
      <Cama x={1450} y={CHAO + 50} s={1.1} />
      {li === 5 ? <Ben x={760} y={910} k={1.1} humor="preocupado" maoCabeca inclina={-5} fala={boca} /> : <Sentado x={760} y={CHAO + 70} k={1.25} humor="medo" olharY={0.5} boca={boca} />}
      {li === 5 && <Dor x={760} y={910 - 470 * 1.1} f={f} />}
    </Sala>
  );
  const fora = li === 10 && f > at(10, 0.25);
  return (
    <Sala luz={0.8}>
      <rect x={1700} y={150} width={220} height={650} fill="url(#acoEscuro)" /><rect x={1700} y={150} width={14} height={650} fill="#11191a" />
      <Visor x={1480} y={380} s={1} rotulo={fora ? 'DRAUSSEN' : 'CO₂'} valor={fora ? '0,04 %' : li >= 9 && f > at(9, 0.15) ? '2,8 %' : '-- %'} cor={fora ? '#4fd07a' : '#ff4a36'} />
      <Sentado x={640} y={CHAO + 70} k={1.25} humor="medo" olhar={0.9} olharY={-0.9} boca={boca} />
    </Sala>
  );
};

const lousaCo2 = ({ f, L, at, li, boca }: C) => {
  const o = (a: number) => ip(f, a, a + 10, 0, 1);
  if (li <= 7) return (
    <Sala luz={0.85}>
      <Lousa>
        {li === 2 && <g><Giz x={110} y={300} t="Sauerstoff" fs={110} /><rect x={90} y={262} width={ip(f, at(2, 0.55), at(2, 0.55) + 10, 0, 620)} height={12} rx={6} fill="#ff6a5a" /></g>}
        {li === 3 && <Giz x={220} y={320} t="CO₂" fs={190} cor="#ffd95e" o={o(at(3, 0.3))} />}
        {li === 4 && <g><Giz x={70} y={230} t="500 L" fs={150} cor="#ffd95e" o={o(at(4, 0.45))} /><Giz x={70} y={370} t="CO₂ pro Tag" fs={84} o={o(at(4, 0.6))} /></g>}
        {li === 5 && <g><Giz x={70} y={210} t="60 m³ Luft" fs={104} o={o(at(5, 0.15))} /><Giz x={70} y={370} t="= 60.000 L" fs={104} cor="#ffd95e" o={o(at(5, 0.6))} /></g>}
        {li >= 6 && <g><Giz x={70} y={170} t="500 L" fs={96} o={o(L(6) + 2)} /><Giz x={70} y={290} t="÷ 60.000 L" fs={96} o={o(at(6, 0.4))} /><rect x={66} y={322} width={li >= 7 ? ip(f, L(7), L(7) + 10, 0, 600) : 0} height={8} rx={4} /><Giz x={70} y={450} t="≈ +0,8 % pro Tag" fs={80} cor="#ffd95e" o={li >= 7 ? o(at(7, 0.5)) : 0} /></g>}
      </Lousa>
      {li === 3 && [0, 1, 2, 3].map((i) => { const ph = ((f + i * 14) % 56) / 56; return <circle key={i} cx={640 + ph * 330} cy={640 - ph * 120 + Math.sin(ph * 6 + i) * 20} r={18 + ph * 44} fill="#cfd8d6" opacity={(1 - ph) * 0.5} filter="url(#suave2)" />; })}
      <Ben x={520} y={1560} k={2.5} humor={li <= 3 ? 'cetico' : li === 7 ? 'preocupado' : 'neutro'} olhar={li === 1 ? 0 : 0.9} inclina={li === 1 ? 4 : 0} apontar={li >= 4 ? 0.5 : 0} fala={boca} />
    </Sala>
  );
  if (li <= 12) {
    const faixas: [string, string, string][] = [['7–10 %', 'bewusstlos', '#7d1f1a'], ['5 %', 'Puls rast', '#d63b2f'], ['2–3 %', 'Atemnot', '#e27a2a'], ['1 %', 'schläfrig', '#e2b33c']];
    return (
      <Sala luz={0.8} frio={li >= 11 ? 0.15 : 0}>
        <Quadro x={1250} y={430} w={980} h={600} titulo="CO₂ IN DER LUFT">
          {faixas.map(([p, s, cor], i) => {
            const n = 11 - i; // fala em que acende
            const aceso = li >= n;
            const atual = li === n || (li === 12 && i === 2);
            return (
              <g key={i} transform={`translate(60 ${150 + i * 106})`} opacity={aceso ? 1 : 0.16}>
                <rect width={860} height={90} rx={12} fill={cor} stroke={atual ? '#22303a' : 'none'} strokeWidth={8} transform={atual ? `translate(${-10} -3) scale(1.02 1.06)` : undefined} />
                <text x={30} y={62} fontFamily={AB} fontWeight={900} fontSize={56} fill="#fff">{aceso ? p : ''}</text>
                <text x={830} y={62} textAnchor="end" fontFamily={AB} fontWeight={900} fontSize={48} fill="#fff">{aceso ? s : ''}</text>
              </g>
            );
          })}
          {li === 12 && <g transform={`translate(${-150 + Math.sin(f / 5) * 10} 406) scale(${pop(f, L(12) + 4)})`}><path d="M0 -44 h130 v-30 l70 74 l-70 74 v-30 h-130 Z" fill="#22303a" stroke="#f4c64d" strokeWidth={6} /><text x={66} y={18} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={44} fill="#f4c64d">ICH</text></g>}
        </Quadro>
        <Ben x={330} y={910} k={1.0} humor={li >= 11 ? 'medo' : 'preocupado'} olhar={0.9} olharY={-0.3} apontar={li === 12 ? 0.3 : 0.6} fala={boca} />
      </Sala>
    );
  }
  return (
    <Sala luz={0.6} frio={0.25}>
      <g transform="translate(1330 400)">
        {li === 13 && <g transform={`scale(${pop(f, L(13) + 6)})`}><Etq x={0} y={0} t="360 Tage" fs={110} rot={-3} /><rect x={-330} y={-10} width={ip(f, at(13, 0.5), at(13, 0.5) + 10, 0, 660)} height={20} rx={10} fill="#d63b2f" transform="rotate(-9)" /></g>}
        {li === 14 && <Etq x={0} y={0} s={pop(f, at(14, 0.35)) * (1 + Math.sin(f / 5) * 0.03)} t="≈ 3 Tage" fs={130} cor="#fff" fundo="#d63b2f" borda="#7d1f1a" rot={-3} />}
      </g>
      <Ben x={560} y={1500} k={2.3} humor="medo" olhar={0.4} fala={boca} inclina={-3} />
    </Sala>
  );
};

const DX = 1400, DY = 470, DS = 1.2;
const duto = ({ f, L, at, li, boca }: C) => {
  const close = li >= 7;
  const paraf = li < 8 ? 4 : li === 8 ? (f < at(8, 0.2) ? 4 : f < at(8, 0.5) ? 3 : 2) : li === 9 ? (f < at(9, 0.62) ? 2 : 1) : 1;
  const treme = li === 7 ? 0 : li === 8 ? (f < at(8, 0.2) ? 0 : f < at(8, 0.5) ? 1 : 2) : li === 9 && f < at(9, 0.62) ? 2 : -1;
  const caiu = li >= 10;
  const q = ip(f, L(10) + 2, L(10) + 16, 0, 1, Easing.in(Easing.quad));
  const bx = li === 6 ? interpolate(f, [L(6), at(6, 0.8)], [520, 1060], cl) : li <= 3 ? 820 : 1060;
  const ap = li === 4 || li === 5 ? 1 : li >= 6 ? 0.9 : li === 2 ? 0.6 : 0.2;
  const [mx, my] = mao(bx, 910, 1, ap);
  const luzIn = li === 11 ? ip(f, at(11, 0.45), at(11, 0.45) + 8, 0, 1) : li === 12 ? (f < at(12, 0.3) ? 1 : 0) : 0;
  return (
    <Sala luz={li >= 11 ? 0.45 : 0.85} frio={li >= 11 ? 0.3 : 0}>
      <Duto x={DX} y={DY} s={DS} f={f} paraf={paraf} treme={treme} grade={!caiu} fita={li >= 4 && li <= 9 ? 0 : -1} luzIn={luzIn} olhos={li === 12 ? ip(f, at(12, 0.42), at(12, 0.42) + 6, 0, 1) : 0} />
      {caiu && <GradeSolta x={DX - 60 * q} y={DY + q * (CHAO + 30 - DY)} s={DS} rot={q * 78} />}
      {li === 2 && <g><Etq x={1640} y={150} s={pop(f, at(2, 0.02))} t="Rohr" fs={46} rot={3} /><Etq x={1690} y={420} s={pop(f, at(2, 0.4))} t="Filter" fs={46} rot={-2} /><Etq x={1680} y={560} s={pop(f, at(2, 0.62))} t="Ventilator" fs={46} rot={2} /></g>}
      {li === 5 && <Etq x={1010} y={300} s={pop(f, L(5) + 4)} t="0" fs={120} cor="#d63b2f" rot={-4} />}
      {li >= 11 && <path d={`M${mx + 20} ${my - 40} L${DX - 150} ${DY - 110} L${DX - 150} ${DY + 110} Z`} fill="#ffe7a8" opacity={0.3 * luzIn} />}
      <Ben x={bx} y={910} humor={li >= 7 ? 'medo' : li >= 4 ? 'preocupado' : 'neutro'} olhar={0.9} olharY={-0.5} apontar={ap} anda={li === 6 && f < at(6, 0.8) ? f * 0.42 : undefined} gesto={li === 1 ? 0.5 : 0} fala={boca} />
      {li >= 6 && li <= 10 && <Chave x={mx + (close && li < 10 ? Math.sin(f * 1.9) * 4 : 0)} y={my} rot={li >= 7 ? 70 : 10} s={1} />}
      {li >= 11 && <g transform={`translate(${mx} ${my + 20}) rotate(60)`}><Kurbel x={0} y={0} s={0.8} f={f} glow={luzIn} /></g>}
    </Sala>
  );
};

const marta = ({ f, L, at, li, boca }: C) => {
  if (li <= 3) {
    const luzIn = li === 1 ? 0 : ip(f, L(2) - 4, L(2) + 6, 0, 1);
    return (
      <Sala luz={0.5} frio={0.25}>
        <Duto x={DX} y={DY} s={DS} f={f} grade={false} luzIn={luzIn} olhos={li === 1 ? 1 : 0} cara={luzIn} ninho={li >= 2 ? luzIn : 0} />
        <GradeSolta x={DX - 60} y={CHAO + 30} s={DS} rot={78} />
        {li === 3 && <g><Etq x={1130} y={600} s={pop(f, at(3, 0.42)) * 0.55} t="Laub" fs={60} rot={-4} /><Etq x={1400} y={640} s={pop(f, at(3, 0.58)) * 0.55} t="Dämmwolle" fs={60} rot={2} /><Etq x={1660} y={590} s={pop(f, at(3, 0.78)) * 0.55} t="Luftfilter" fs={60} rot={4} /></g>}
        <Ben x={1040} y={910} humor={li === 1 ? 'medo' : 'cetico'} olhar={0.9} olharY={-0.5} apontar={0.9} fala={boca} />
      </Sala>
    );
  }
  if (li === 4) return (
    <Sala luz={0.6} frio={0.2}>
      {[0, 1, 2].map((i) => <path key={i} d={`M${1250 + i * 60} ${300 + i * 12} l40 140`} stroke="#f2f0e4" strokeWidth={14} strokeLinecap="round" opacity={0.85 * pop(f, L(4) + 8 + i * 4)} />)}
      <Ben x={640} y={1560} k={2.5} humor="cetico" olhar={0.7} olharY={-0.6} gesto={0.8} inclina={4} fala={boca} />
    </Sala>
  );
  if (li === 5) return (
    <Sala>
      <g transform={`translate(1240 ${CHAO + 60})`}>
        <ellipse cx={0} cy={6} rx={470} ry={22} fill="#000" opacity={0.45} filter="url(#suave2)" />
        <path d="M-420 -40 Q-430 -210 -330 -220 L330 -220 Q430 -210 420 -40 Z" fill="#3b78c2" stroke="#1d3f6b" strokeWidth={8} />
        <rect x={-330} y={-200} width={660} height={130} rx={14} fill="#141c20" />
        <rect x={-250} y={-180} width={220} height={96} rx={10} fill="#5d696b" /><rect x={10} y={-170} width={130} height={80} rx={8} fill="#2b3840" /><circle cx={230} cy={-130} r={44} fill="#39444a" stroke="#8a979a" strokeWidth={6} />
        <path d="M-30 -150 Q10 -210 60 -176" stroke="#e0402f" strokeWidth={12} fill="none" strokeLinecap="round" /><path d="M96 -160 Q130 -150 150 -110" stroke="#e0402f" strokeWidth={12} fill="none" strokeLinecap="round" />
        {f % 8 < 4 && <path d="M78 -190 l-8 14 l14 -4 l-8 16" stroke="#ffe08a" strokeWidth={5} fill="none" />}
        <path d="M-440 -226 L-380 -520 L360 -560 L420 -510" stroke="#2f5f9a" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={-440} y={-60} width={880} height={50} rx={14} fill="#22303a" /><circle cx={-330} cy={-36} r={34} fill="#fff3d2" stroke="#8a979a" strokeWidth={5} /><circle cx={330} cy={-36} r={34} fill="#fff3d2" stroke="#8a979a" strokeWidth={5} />
        <g transform={`scale(${pop(f, at(5, 0.5))})`}><Marder x={-150} y={-200} k={1.15} come={f % 20 < 10 ? 0.5 : 0} /></g>
      </g>
      <Ben x={380} y={910} humor="cetico" olhar={0.9} gesto={0.6} apontar={0.5} fala={boca} />
    </Sala>
  );
  return (
    <Sala luz={0.6} frio={0.2}>
      <Corte x={1220} y={440} terra={0} marder={pop(f, L(6) + 20)} f={f} />
      <Ben x={380} y={910} humor="medo" olhar={0.9} olharY={-0.5} apontar={0.7} fala={boca} />
    </Sala>
  );
};

const conserto = ({ f, L, at, li, boca }: C) => {
  if (li >= 9 && li <= 10) {
    const v = li === 9 ? '2,1 %' : '0,6 %';
    return (
      <Sala luz={li === 10 ? 1 : 0.85}>
        <rect x={1700} y={150} width={220} height={650} fill="url(#acoEscuro)" /><rect x={1700} y={150} width={14} height={650} fill="#11191a" />
        <Visor x={1380} y={400} s={1.5} valor={f < (li === 9 ? at(9, 0.5) : at(10, 0.4)) && li === 9 ? '2,8 %' : li === 10 && f < at(10, 0.4) ? '2,1 %' : v} cor={li === 10 && f >= at(10, 0.4) ? '#4fd07a' : li === 9 && f >= at(9, 0.5) ? '#f2a53a' : li === 10 ? '#f2a53a' : '#ff4a36'} />
        <Ben x={640} y={1500} k={2.3} humor={li === 10 && f >= at(10, 0.4) ? 'sorriso' : 'preocupado'} olhar={0.9} olharY={-0.3} fala={boca} />
      </Sala>
    );
  }
  if (li === 11) return <Sala><Ben x={860} y={1560} k={2.5} humor="sorriso" gesto={0.9} apontar={0.3} fala={boca} /></Sala>;
  const aberto = li <= 4 || (li === 5 && f < at(5, 0.55));
  const fugiu = li > 4 || (li === 4 && f >= at(4, 0.2));
  const j = ip(f, at(4, 0.2), at(4, 0.52), 0, 1);
  const corre = ip(f, at(4, 0.52), at(4, 0.92), 0, 1);
  const mxr = li === 4 ? (j < 1 ? DX - j * 560 : DX - 560 - corre * 330) : 0;
  const myr = li === 4 ? (j < 1 ? DY + 60 + (CHAO + 70 - DY - 60) * j * j - Math.sin(j * Math.PI) * 40 : CHAO + 70) : 0;
  const bx = 1060;
  const ap = li === 3 || li === 6 ? 1 : li === 5 ? 0.9 : 0.3;
  const [mx, my] = mao(bx, 910, 1, ap);
  return (
    <Sala luz={li >= 7 ? 1 : 0.8}>
      <Duto x={DX} y={DY} s={DS} f={f} grade={!aberto} luzIn={aberto ? 0.9 : 0} cara={fugiu ? 0 : 1} ninho={li <= 2 ? 1 : li === 3 ? ip(f, at(3, 0.3), at(3, 0.95), 1, 0) : 0} filtro={li >= 5 ? ip(f, L(5) + 4, L(5) + 14, 0, 1) : 0} ar={li >= 7 ? 1 : 0} fita={li >= 6 ? (li >= 7 ? 1 : 0) : -1} />
      {aberto && <GradeSolta x={DX - 60} y={CHAO + 30} s={DS} rot={78} />}
      {li === 3 && [0, 1, 2, 3, 4].map((i) => { const t0 = at(3, 0.3 + i * 0.12); const q = ip(f, t0, t0 + 14, 0, 1, Easing.in(Easing.quad)); return f < t0 ? null : <g key={i} transform={`translate(${DX - 200 - i * 30} ${DY + 40 + q * (CHAO - DY + 10)}) rotate(${q * 140 + i * 40})`}>{i % 2 ? <circle r={24} fill="#efe6c8" /> : <ellipse rx={34} ry={12} fill="#8f6a2e" />}</g>; })}
      <Cama x={400} y={CHAO + 60} s={1.0} olhos={li > 4 ? 1 : li === 4 ? ip(f, at(4, 0.94), at(4, 1), 0, 1) : 0} />
      <Ben x={bx} y={910} humor={li <= 2 ? 'medo' : li === 4 ? 'medo' : li >= 7 ? 'sorriso' : 'preocupado'} olhar={li === 4 && j > 0.5 ? -0.9 : 0.9} olharY={li === 4 ? 0.4 : -0.5} apontar={ap} gesto={li === 2 ? 0.7 : li === 4 ? 0.9 : li >= 7 ? 0.6 : 0} inclina={li === 4 ? -8 : 0} fala={boca} />
      {li === 4 && j > 0 && corre < 1 && <Marder x={mxr} y={myr} k={1.0} flip anda={f * 0.9} />}
      {li === 3 && <g><rect x={mx - 6} y={my - 14} width={150} height={16} rx={7} fill="#c99558" transform={`rotate(-28 ${mx} ${my})`} /><circle cx={mx} cy={my} r={30} fill="#e2b33c" stroke="#8a6a14" strokeWidth={4} /></g>}
      {li === 1 && <g transform={`translate(520 330) scale(${pop(f, L(1) + 8) * 0.9})`}><rect x={-70} y={-20} width={140} height={110} rx={14} fill="#e7b540" stroke="#22303a" strokeWidth={8} /><path d="M-40 -20 v-36 a40 40 0 0 1 80 0 v36" stroke="#22303a" strokeWidth={14} fill="none" /><circle cx={0} cy={30} r={14} fill="#22303a" /></g>}
    </Sala>
  );
};

const armadilha = ({ f, L, at, li, boca }: C) => {
  const TX = 1320, TY = CHAO + 40, CAMA = 420;
  if (li === 5) return (
    <Sala>
      <g transform="translate(1320 520)"><circle r={190} fill="#ffdc9e" opacity={0.3} filter="url(#brilho)" /><Lata x={0} y={140} cor="#d8453b" s={4} /></g>
      <Etq x={1320} y={250} s={pop(f, L(5) + 6)} t="RAVIOLI" fs={64} rot={-3} />
      <Ben x={560} y={1500} k={2.3} humor="preocupado" olhar={0.8} gesto={0.6} inclina={-4} fala={boca} />
    </Sala>
  );
  if (li === 13) return (
    <Sala>
      <g transform={`translate(1100 400) scale(${pop(f, L(13) + 8, 12)})`}>
        <rect x={-520} y={-170} width={1040} height={340} rx={20} fill="#10161a" stroke="#e7b540" strokeWidth={10} />
        <text x={-260} y={-70} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={70} fill="#f3ead8">MARDER</text>
        <text x={260} y={-70} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={70} fill="#f3ead8">BEN</text>
        <text x={-260} y={110} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={170} fill="#4fd07a" style={{ filter: 'drop-shadow(0 0 12px #4fd07a)' }}>1</text>
        <text x={0} y={100} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={140} fill="#f3ead8">:</text>
        <text x={260} y={110} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={170} fill="#ff4a36" style={{ filter: 'drop-shadow(0 0 12px #ff3a26)' }}>0</text>
      </g>
      <Ben x={300} y={910} k={0.95} humor="cetico" olhar={0.9} gesto={0.8} inclina={5} fala={boca} />
    </Sala>
  );
  if (li === 14) return (
    <Sala>
      <Prateleira f={f} falta={30} />
      <Etq x={1330} y={400} s={pop(f, at(14, 0.4))} t="– 1 Löffel" fs={84} cor="#fff" fundo="#d63b2f" borda="#7d1f1a" rot={-4} />
      <Ben x={1060} y={910} humor="preocupado" olhar={-0.8} gesto={0.6} fala={boca} />
    </Sala>
  );
  const deitado = li >= 6 && li <= 12;
  const montada = li >= 4;
  const p4 = (q: number) => (li < 4 ? 0 : li > 4 ? 1 : pop(f, at(4, q)));
  const caida = li < 11 ? 0 : ip(f, at(11, 0.25), at(11, 0.25) + 7, 0, 1, Easing.in(Easing.quad));
  // marta: sai debaixo da cama (8), vai até a isca (9), come (9-11), olha, pega o último e volta (12)
  let mx = 600, come = 0, mvis = false, flip = false, anda: number | undefined;
  if (li === 8) { mx = interpolate(f, [at(8, 0.4), at(8, 1)], [560, 760], cl); mvis = true; }
  if (li === 9) { mx = interpolate(f, [L(9), at(9, 0.4)], [760, TX - 150], cl); mvis = true; anda = f < at(9, 0.4) ? f * 0.8 : undefined; come = f > at(9, 0.7) ? (f % 14 < 7 ? 1 : 0.4) : f > at(9, 0.45) ? 0.5 : 0; }
  if (li === 10 || li === 11) { mx = TX - 150; mvis = true; come = f % 14 < 7 ? 1 : 0.4; }
  if (li === 12) { mvis = true; const volta = at(12, 0.62); mx = interpolate(f, [volta, at(12, 0.98)], [TX - 150, 520], cl); flip = f >= volta; anda = f >= volta ? f * 0.6 : undefined; come = f > at(12, 0.3) && f < volta ? (f % 14 < 7 ? 1 : 0.4) : 0; }
  const tempo = li === 7 ? (f < at(7, 0.3) ? '10 min' : f < at(7, 0.62) ? '20 min' : '1 Std') : '';
  return (
    <Sala>
      {mvis && <Marder x={mx} y={TY - 10} k={0.95} flip={flip} anda={anda} come={come} />}
      <Cama x={CAMA} y={CHAO + 60} s={1.0} olhos={mvis ? 0 : 1}>
        {deitado && <Deitado x={-196} y={-196} k={0.62} humor={li >= 11 ? 'cetico' : li >= 8 ? 'medo' : 'neutro'} olhar={0.9} boca={boca} rot={-70} />}
      </Cama>
      {(montada || li === 3) && <Armadilha x={TX} y={TY} caixa={li === 3 ? 0 : p4(0.02)} graveto={p4(0.24)} corda={p4(0.44)} isca={li === 12 && f > at(12, 0.55) ? 0 : p4(0.72)} caida={caida} cordaAte={deitado ? [CAMA + 60 - TX, CHAO - 110 - TY] : [-520, 0]} tensa={li === 10} />}
      {li === 7 && <Etq x={1000} y={300} s={1} t={tempo} fs={84} rot={-3} />}
      {!deitado && <Ben x={li >= 3 ? 760 : 860} y={910} humor={li <= 2 ? 'cetico' : 'neutro'} olhar={li <= 2 ? -0.8 : 0.9} olharY={li <= 2 ? 0.8 : 0.4} gesto={li === 1 ? 0.3 : li === 2 ? 0.7 : 0} apontar={li >= 3 ? 0.4 : 0} fala={boca} />}
    </Sala>
  );
};

const fim = ({ f, L, at, li, boca }: C) => {
  if (li <= 3) return (
    <Sala>
      <Riscos x={1180} y={250} n={7} s={1.3} novo={ip(f, L(1) + 4, L(1) + 16, 0, 1)} />
      {li >= 2 && [0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${1230 + i * 200} 560) scale(${pop(f, at(2, [0.22, 0.5, 0.78][i]))})`}>
          <circle r={84} fill="#f3ead8" stroke="#22303a" strokeWidth={8} />
          {i === 0 && <Lata x={0} y={34} cor="#d8453b" s={1.1} />}{i === 1 && <Garrafa x={0} y={50} s={0.95} />}
          {i === 2 && <g stroke="#3b78c2" strokeWidth={10} fill="none" strokeLinecap="round"><path d="M-44 -18 q30 -24 60 0 q20 14 34 -6" /><path d="M-44 18 q30 -24 60 0 q20 14 34 -6" /></g>}
          <Certo x={58} y={58} s={0.8} />
        </g>
      ))}
      <Ben x={640} y={910} k={1.05} humor="sorriso" olhar={li === 2 ? 0.8 : 0} gesto={li === 1 ? 0.9 : 0.3} apontar={li === 2 ? 0.5 : 0} fala={boca} />
    </Sala>
  );
  if (li <= 5) return <Sala luz={0.75} frio={0.15}><Ben x={860} y={1560} k={2.5} humor={li === 4 ? 'neutro' : 'preocupado'} gesto={li === 5 ? 0.7 : 0} inclina={-2} fala={boca} /></Sala>;
  if (li === 6) return (
    <Sala>
      <Quadro x={1180} y={430} w={760} h={580} titulo="JEDEN MORGEN" s={pop(f, L(6) - 2, 12)}>
        {['LUFT', 'WASSER', 'VORRÄTE'].map((t, i) => (
          <g key={t} transform={`translate(70 ${180 + i * 122}) scale(${pop(f, at(6, [0.52, 0.68, 0.84][i]))})`}>
            <rect width={620} height={100} rx={12} fill="#22303a" /><text x={30} y={68} fontFamily={AB} fontWeight={900} fontSize={54} fill="#f3ead8">{t}</text><Certo x={556} y={50} s={1} />
          </g>
        ))}
      </Quadro>
      <Ben x={360} y={910} humor="neutro" olhar={0.9} apontar={0.6} fala={boca} />
    </Sala>
  );
  if (li <= 8) return (
    <Sala luz={0.7} frio={0.2}>
      {li === 8 && f > at(8, 0.5) && <Marder x={interpolate(f, [at(8, 0.5), at(8, 0.8)], [560, 740], cl)} y={CHAO + 150} k={1.2} />}
      <Cama x={520} y={CHAO + 160} s={1.5} olhos={li === 8 && f > at(8, 0.5) ? 0 : 1} />
      <Ben x={1380} y={910} k={1.05} humor="preocupado" olhar={-0.9} olharY={0.8} gesto={0.5} fala={boca} />
    </Sala>
  );
  if (li === 9) return (
    <Sala luz={0.6} frio={0.3}>
      <Prateleira f={f} falta={5} />
      <g transform="translate(446 310) rotate(84)"><Lata x={0} y={0} cor="#3b78c2" s={1} /></g>
      <g transform={`translate(0 ${-Math.abs(Math.sin(f / 6)) * 6})`}><Marder x={640} y={310} k={0.8} come={f % 16 < 8 ? 0.8 : 0.2} flip /></g>
      <Etq x={1380} y={400} s={pop(f, L(9) + 4) * 1.2} t="TEIL 2" fs={110} cor="#22303a" fundo="#f4c64d" rot={-4} />
    </Sala>
  );
  if (li === 10) return (
    <Sala luz={0.03} frio={0.82} frente={
      <g>
        <g opacity={0.55}><Ben x={760} y={1500} k={2.3} humor="medo" olhar={Math.sin(f / 9)} fala={boca} /></g>
        <Etq x={1380} y={400} s={pop(f, at(10, 0.25)) * 1.2} t="TAG 12" fs={110} cor="#fff" fundo="#d63b2f" borda="#7d1f1a" rot={-3} />
      </g>
    } />
  );
  return (
    <Sala luz={0.5} frio={0.35} frente={
      <g>
        <text x={W / 2} y={380} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={190} fill="#f4c64d" letterSpacing={8} style={{ filter: 'drop-shadow(0 8px 0 #000)' }}>TEIL 2 …</text>
        <g transform={`translate(${W / 2} 600) scale(${pop(f, L(11) + 10) * (1 + Math.sin(f / 5) * 0.03)})`}>
          <rect x={-330} y={-70} width={660} height={140} rx={30} fill="#d63b2f" stroke="#7d1f1a" strokeWidth={8} />
          <text x={0} y={26} textAnchor="middle" fontFamily={AB} fontWeight={900} fontSize={70} fill="#fff">ABONNIEREN</text>
        </g>
        <Marder x={1560} y={CHAO + 150} k={1.3} flip come={f % 30 < 6 ? 0.4 : 0} />
        <Ben x={330} y={CHAO + 200} k={1.15} humor="sorriso" gesto={0.9 + Math.sin(f / 4) * 0.15} olhar={0.5} fala={boca} />
      </g>
    } />
  );
};

const S = (...s: Shot[]) => s;
const BLOCOS: Bloco[] = [
  { id: 'gancho', dia: () => 1, cena: gancho, shots: S([1, 1.03, 1.1, 1150, 520], [3, 1.0, 1.05, 960, 540], [5, 1.04, 1.1, 900, 500], [6, 1.02, 1.1, 960, 500]) },
  { id: 'plano', dia: () => 1, cena: plano, shots: S([1, 1.0, 1.05, 960, 540], [2, 1.02, 1.07, 1100, 480], [4, 1.02, 1.08, 1100, 480], [5, 1.0, 1.06, 1000, 500], [7, 1.04, 1.1, 900, 480]) },
  { id: 'comida', dia: () => 1, cena: comida, shots: S([1, 1.0, 1.05, 700, 520], [4, 1.04, 1.1, 900, 500], [7, 1.25, 1.33, 1100, 600], [9, 1.12, 1.2, 520, 700], [10, 1.0, 1.06, 1000, 500], [12, 1.03, 1.1, 1100, 500]) },
  { id: 'agua', dia: () => 1, cena: agua, shots: S([1, 1.03, 1.1, 1300, 520], [3, 1.0, 1.06, 900, 560], [5, 1.0, 1.06, 960, 520], [7, 1.04, 1.1, 900, 480]) },
  { id: 'energia', dia: () => 1, cena: energia, shots: S([1, 1.0, 1.05, 960, 520], [3, 1.0, 1.06, 1150, 560], [5, 1.08, 1.16, 1150, 520], [7, 1.03, 1.08, 860, 480], [8, 1.02, 1.1, 1100, 560]) },
  { id: 'noite1', dia: () => 1, cena: noite1, shots: S([1, 1.0, 1.06, 960, 520], [3, 1.5, 1.7, 420, 300], [4, 1.1, 1.2, 1100, 600], [5, 1.0, 1.08, 800, 480], [8, 1.1, 1.2, 1050, 600]) },
  { id: 'rotina', dia: (li) => (li >= 7 ? 3 : 2), cena: rotina, shots: S([1, 1.0, 1.05, 960, 520], [4, 1.02, 1.07, 1100, 460], [6, 1.06, 1.14, 1150, 430], [7, 1.0, 1.05, 960, 540], [9, 1.04, 1.1, 900, 480]) },
  { id: 'cabeca', dia: () => 3, cena: cabeca, shots: S([1, 1.03, 1.08, 800, 480], [3, 1.02, 1.08, 1100, 420], [5, 1.5, 1.6, 430, 560], [6, 1.0, 1.06, 1000, 480], [7, 1.02, 1.1, 1200, 560]) },
  { id: 'comentario', dia: () => 3, cena: pergunta, shots: S([1, 1.08, 1.12, 700, 480], [2, 1.0, 1.06, 1100, 500], [4, 1.08, 1.16, 700, 460]) },
  { id: 'problema', dia: (li) => (li >= 5 ? 5 : 4), cena: sintomas, shots: S([1, 1.03, 1.08, 800, 480], [4, 1.02, 1.06, 900, 520], [5, 1.02, 1.06, 900, 500], [6, 1.02, 1.08, 1100, 540], [7, 1.02, 1.08, 900, 600], [8, 1.0, 1.1, 1100, 480], [9, 1.7, 2.0, 1480, 380]) },
  { id: 'explica', dia: () => 5, cena: lousaCo2, shots: S([1, 1.04, 1.08, 900, 500], [4, 1.04, 1.1, 1000, 480], [6, 1.04, 1.1, 1000, 480], [8, 1.0, 1.05, 1100, 500], [11, 1.03, 1.1, 1150, 480], [13, 1.03, 1.1, 950, 460]) },
  { id: 'investiga', dia: () => 5, cena: duto, shots: S([1, 1.0, 1.05, 1100, 480], [3, 1.6, 1.75, DX, DY], [4, 1.05, 1.12, 1200, 520], [6, 1.0, 1.05, 1000, 540], [7, 1.75, 1.95, DX - 40, DY], [10, 1.15, 1.25, DX - 60, 600], [11, 1.2, 1.35, DX - 100, DY + 20], [12, 1.7, 2.3, DX, DY]) },
  { id: 'revela', dia: () => 5, cena: marta, shots: S([1, 2.0, 2.3, DX, DY], [2, 2.0, 2.2, DX, DY], [3, 1.5, 1.6, DX, DY + 40], [4, 1.03, 1.08, 900, 480], [5, 1.0, 1.06, 1000, 540], [6, 1.02, 1.08, 1050, 480]) },
  { id: 'resolve', dia: () => 5, cena: conserto, shots: S([1, 1.0, 1.05, 1000, 500], [3, 1.3, 1.4, 1250, 520], [4, 1.0, 1.03, 960, 560], [5, 1.4, 1.5, 1300, 480], [7, 1.15, 1.25, 1200, 480], [9, 1.05, 1.15, 1200, 440], [11, 1.04, 1.1, 900, 480]) },
  { id: 'armadilha', dia: () => 6, cena: armadilha, shots: S([1, 1.0, 1.05, 800, 560], [3, 1.12, 1.2, 1150, 620], [5, 1.03, 1.08, 1000, 480], [6, 1.0, 1.04, 900, 600], [8, 1.5, 1.7, 650, 740], [9, 1.3, 1.4, 1200, 720], [10, 1.05, 1.1, 900, 640], [11, 1.3, 1.36, 1350, 720], [12, 1.4, 1.5, 1200, 720], [13, 1.0, 1.06, 960, 480]) },
  { id: 'fecho', dia: () => 7, cena: fim, shots: S([1, 1.0, 1.05, 960, 520], [4, 1.04, 1.1, 900, 480], [6, 1.02, 1.07, 1100, 460], [7, 1.0, 1.08, 800, 640], [9, 1.02, 1.08, 800, 480], [10, 1.03, 1.1, 960, 480], [11, 1.0, 1.03, 960, 540]) },
];
const TEMPOS = BLOCOS.map((b, i) => {
  const fs = F.filter((q) => q.id.startsWith(b.id + '_'));
  return { ini: i === 0 ? 0 : fr(fs[0].ini - 0.3), L: fs.map((q) => fr(q.ini)), E: fs.map((q) => fr(q.fim)) };
});

export const Bunker01: React.FC = () => {
  const f = useCurrentFrame();
  const boca = ((T as any).boca[f] ?? 0) * 0.6 + ((T as any).boca[f + 1] ?? 0) * 0.4;
  let bi = 0;
  for (let i = 0; i < BLOCOS.length; i++) if (f >= TEMPOS[i].ini) bi = i;
  const b = BLOCOS[bi], t = TEMPOS[bi];
  const fimBloco = bi + 1 < BLOCOS.length ? TEMPOS[bi + 1].ini : BUNKER01_FRAMES;
  let li = 1;
  for (let n = 0; n < t.L.length; n++) if (f >= t.L[n] - 6) li = n + 1;
  const L = (n: number) => t.L[Math.min(n, t.L.length) - 1];
  const at = (n: number, q: number) => { const i = Math.min(n, t.L.length) - 1; return Math.round(t.L[i] + q * (t.E[i] - t.L[i])); };
  // plano de câmera atual
  let si = 0;
  for (let i = 0; i < b.shots.length; i++) if (li >= b.shots[i][0]) si = i;
  const sh = b.shots[si];
  const sIni = si === 0 ? t.ini : t.L[sh[0] - 1] - 6;
  const sFim = si + 1 < b.shots.length ? t.L[b.shots[si + 1][0] - 1] - 6 : fimBloco;
  const z = interpolate(f, [sIni, sFim], [sh[1], sh[2]], cl);
  const entra = sIni === 0 ? 1 : interpolate(f, [sIni, sIni + 5], [0, 1], cl);
  const sai = bi === BLOCOS.length - 1 ? interpolate(f, [BUNKER01_FRAMES - 20, BUNKER01_FRAMES - 2], [1, 0], cl) : 1;
  const c: C = { f, L, at, li, boca, ini: t.ini, fim: fimBloco };
  return (
    <AbsoluteFill style={{ background: '#050808' }}>
      <AbsoluteFill style={{ opacity: entra * sai }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <Defs />
          <g transform={`translate(${sh[3]} ${sh[4]}) scale(${z}) translate(${-sh[3]} ${-sh[4]})`}>{b.cena(c)}</g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: sai }}><svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}><Placa n={b.dia(li)} /></svg></AbsoluteFill>
      <Legenda f={f} />
    </AbsoluteFill>
  );
};
export const BLOCOS_INFO = BLOCOS.map((b, i) => ({ id: b.id, ini: TEMPOS[i].ini, L: TEMPOS[i].L }));
