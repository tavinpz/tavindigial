import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W } from '../lib/theme';
import { prog, spr, EO, EIO, clamp, wob, corta, linha, lerp, fmt } from '../lib/anim';
import { Fundo, Titulo } from '../comp/base';
import type { CenaProps } from '../lib/types';

const TOP = 600, BOT = 1240, FUNDO = 2100;

const Navio: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <polygon points="-58,-4 58,-4 46,16 -48,16" fill="#e9eef3" />
    <rect x={-50} y={-30} width={22} height={26} fill={C.red} />
    <rect x={-26} y={-24} width={20} height={20} fill={C.amber} />
    <rect x={-4} y={-24} width={20} height={20} fill={C.water} />
    <rect x={18} y={-24} width={20} height={20} fill="#3ecf8e" />
    <rect x={40} y={-40} width={12} height={36} fill="#cfd8e0" />
  </g>
);

const Trem: React.FC<{ x: number; y: number; ang: number }> = ({ x, y, ang }) => (
  <g transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI})`}>
    <rect x={-150} y={-16} width={150} height={30} rx={8} fill="#dfe6ec" />
    <path d="M0,-16 L22,-16 Q46,-1 22,14 L0,14 Z" fill={C.amber} />
    {[-140, -110, -80, -50, -20].map((wx) => <rect key={wx} x={wx} y={-9} width={20} height={9} rx={2} fill="#21374b" />)}
    <circle cx={34} cy={0} r={34} fill="#ffe7a8" opacity={0.25} />
  </g>
);

export const Perfil: React.FC<CenaProps> = ({ c, f, dur }) => {
  const [y0, y1] = c.yrange;
  const X = (x: number) => x * W;
  const Y = (y: number) => BOT - ((y - y0) / (y1 - y0)) * (BOT - TOP);
  const t = f / 30;
  const P = (pts: [number, number][]) => pts.map(([x, y]) => [X(x), Y(y)] as [number, number]);

  const rev = prog(f, -9, 12, EIO);
  // objeto que anda (navio ou trem)
  const camPts = c.caminho ? P(c.caminho) : null;
  const pc = prog(f, 14, dur - 10, EIO);
  const obj = camPts ? corta(camPts, pc) : null;
  // câmera: segue o objeto quando há caminho; senão empurra devagar
  const z = obj ? 1.42 : 1 + 0.07 * prog(f, 0, dur, (x) => x);
  const fx = obj ? clamp(obj.ponta[0], W / 2 / z, W - W / 2 / z) : 540;
  const fy = obj ? clamp(obj.ponta[1], 900 - 300, 900 + 200) : 900;
  const camT = `translate(${540 + wob(t * 0.6, 1) * 5} ${900 + wob(t * 0.5, 2) * 5}) scale(${z}) translate(${-fx} ${-fy})`;

  const terreno = c.terreno ? P(c.terreno) : null;
  const agua = c.agua ? P(c.agua) : null;
  // superfície da água com ondas nos trechos horizontais
  const sup: [number, number][] = [];
  if (agua) {
    for (let i = 0; i < agua.length - 1; i++) {
      const [ax, ay] = agua[i], [bx, by] = agua[i + 1];
      if (Math.abs(ay - by) < 0.5) {
        for (let x = ax; x < bx; x += 10) sup.push([x, ay + Math.sin(x * 0.035 + f * 0.22) * 3 + Math.sin(x * 0.011 - f * 0.09) * 2]);
      } else sup.push([ax, ay]);
    }
    sup.push(agua[agua.length - 1]);
  }
  const corT = c.cor_terreno ? `rgb(${c.cor_terreno.join(',')})` : '#5d6774';
  const tun = c.tunel ? P(c.tunel) : null;
  const pt = prog(f, 10, Math.min(dur * 0.7, 80), EIO);
  const tunCut = tun ? corta(tun, pt) : null;

  return (
    <AbsoluteFill>
      <Fundo f={f} grade={false} />
      <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="pAgua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3aa0ec" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#13568f" />
            <stop offset="1" stopColor="#082a4a" />
          </linearGradient>
          <linearGradient id="pTerra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={corT} />
            <stop offset="0.35" stopColor={corT} stopOpacity="0.75" />
            <stop offset="1" stopColor="#0b1520" />
          </linearGradient>
          <clipPath id="pRev"><rect x={-200} y={0} width={(W + 400) * rev} height={2200} /></clipPath>
          {terreno && <clipPath id="pTerraClip"><polygon points={[...terreno, [X(1) + 400, FUNDO], [X(0) - 400, FUNDO]].map((p) => p.join(',')).join(' ')} /></clipPath>}
        </defs>
        <g transform={camT}>
          <g clipPath="url(#pRev)">
            {agua && (
              <>
                <polygon points={[...sup, [X(1), FUNDO], [X(0), FUNDO]].map((p) => p.join(',')).join(' ')} fill="url(#pAgua)" />
                <path d={linha(sup)} fill="none" stroke="#bfe6ff" strokeWidth={3} strokeOpacity={0.8} />
              </>
            )}
            {terreno && (
              <>
                <polygon points={[...terreno, [X(1) + 400, FUNDO], [X(0) - 400, FUNDO]].map((p) => p.join(',')).join(' ')} fill="url(#pTerra)" />
                <g clipPath="url(#pTerraClip)" opacity={0.18}>
                  {Array.from({ length: 40 }).map((_, k) => {
                    const yy = TOP - 300 + k * 34;
                    return <path key={k} d={`M-200,${yy} Q270,${yy + 14 * Math.sin(k)} 540,${yy} T1280,${yy}`} stroke="#000" strokeWidth={2} fill="none" />;
                  })}
                </g>
                <path d={linha(terreno)} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={3} />
              </>
            )}
            {(c.pocos || []).map((x: number, k: number) => {
              const p = prog(f, 14 + k * 5, 34 + k * 5, EO);
              const yA = Y(0), yB = Y(c.prof_pocos ?? -50);
              const enche = prog(f, dur * 0.45 + k * 4, dur * 0.75 + k * 4, EIO);
              return (
                <g key={k}>
                  <rect x={X(x) - 24} y={yA} width={48} height={(yB - yA) * p} fill="#0a121b" stroke={C.water} strokeWidth={3} />
                  <rect x={X(x) - 21} y={yB - (yB - yA) * enche * p} width={42} height={(yB - yA) * enche * p} fill={C.water} opacity={0.75} />
                </g>
              );
            })}
            {tunCut && (
              <>
                <path d={linha(tunCut.pts)} fill="none" stroke={C.amber} strokeWidth={46} strokeOpacity={0.2} strokeLinecap="round" style={{ filter: 'blur(10px)' }} />
                <path d={linha(tunCut.pts)} fill="none" stroke="#0a121b" strokeWidth={30} strokeLinecap="round" />
                <path d={linha(tunCut.pts)} fill="none" stroke={C.amber} strokeWidth={6} strokeLinecap="round" />
                {pt < 1 && (
                  <g transform={`translate(${tunCut.ponta[0]} ${tunCut.ponta[1]}) rotate(${f * 14})`}>
                    <circle r={22} fill="#2a3a4a" stroke={C.amber} strokeWidth={5} />
                    {[0, 60, 120].map((a) => <line key={a} x1={-18} x2={18} transform={`rotate(${a})`} stroke={C.amber} strokeWidth={4} />)}
                  </g>
                )}
              </>
            )}
          </g>
          {c.nivel_mar !== undefined && (
            <g opacity={prog(f, 16, 28)}>
              <line x1={-200} x2={W + 200} y1={Y(c.nivel_mar)} y2={Y(c.nivel_mar)} stroke="#fff" strokeWidth={3} strokeDasharray="18 12" strokeDashoffset={-f * 1.5} />
              <text x={34} y={Y(c.nivel_mar) - 16} fill="#fff" fontFamily={F.cond} fontWeight={700} fontSize={32} letterSpacing={2}>SEA LEVEL</text>
            </g>
          )}
          {obj && (c.tunel ? <Trem x={obj.ponta[0]} y={obj.ponta[1]} ang={obj.ang} /> : <Navio x={obj.ponta[0]} y={obj.ponta[1] - 12 + Math.sin(t * 3) * 2} />)}
        </g>
      </svg>
      {/* cotas e rótulos em espaço de tela (seguem a câmera) */}
      {(c.cotas || []).map(([x, ya, yb, lab]: [number, number, number, string], k: number) => {
        const tr = (px: number, py: number) => [540 + (px - fx) * z, 900 + (py - fy) * z];
        const [sx, sa] = tr(X(x), Y(ya));
        const [, sb] = tr(X(x), Y(yb));
        const p = prog(f, 22 + k * 10, 50 + k * 10, EO);
        const yb2 = lerp(sa, sb, p);
        const m = String(lab).match(/^([\d,.]+)(.*)$/);
        const txt = m ? fmt(parseFloat(m[1].replace(/,/g, '')) * p) + m[2] : lab;
        const dir = sb < sa ? -1 : 1;
        const naDireita = sx < 800;
        return (
          <React.Fragment key={k}>
            <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <line x1={sx} x2={sx} y1={sa} y2={yb2} stroke={C.amber} strokeWidth={6} />
              <line x1={sx - 22} x2={sx + 22} y1={sa} y2={sa} stroke={C.amber} strokeWidth={6} />
              {p > 0.02 && <polygon points={`${sx},${yb2} ${sx - 16},${yb2 - dir * 26} ${sx + 16},${yb2 - dir * 26}`} fill={C.amber} />}
              {p >= 1 && <line x1={sx - 22} x2={sx + 22} y1={sb} y2={sb} stroke={C.amber} strokeWidth={6} />}
            </svg>
            <div style={{ position: 'absolute', left: naDireita ? sx + 30 : undefined, right: naDireita ? undefined : W - sx + 30, top: (sa + yb2) / 2 - 50, opacity: clamp(p * 3), fontFamily: F.cond, fontWeight: 900, fontSize: /\d/.test(lab) ? 92 : 46, color: C.amber, textShadow: `0 0 30px ${C.amber}88, 0 4px 14px rgba(0,0,0,0.9)`, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{txt}</div>
          </React.Fragment>
        );
      })}
      {(c.rotulos || []).map(([x, y, lab]: [number, number, string], k: number) => {
        const sx = 540 + (X(x) - fx) * z, sy = 900 + (Y(y) - fy) * z;
        const s = spr(f, 20 + k * 8, { damping: 11, stiffness: 200 });
        return <div key={k} style={{ position: 'absolute', left: sx - 300, width: 600, top: sy - 26, textAlign: 'center', transform: `scale(${s})`, fontFamily: F.cond, fontWeight: 800, fontSize: 44, letterSpacing: 2, color: C.white, textTransform: 'uppercase', textShadow: '0 3px 14px rgba(0,0,0,0.95)' }}>{lab}</div>;
      })}
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};
