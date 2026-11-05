import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W } from '../lib/theme';
import { prog, spr, EO, EIO, clamp, wob, fmt, lerp } from '../lib/anim';
import { Fundo, Titulo, Poeira, Choque } from '../comp/base';
import type { CenaProps } from '../lib/types';

const Balao: React.FC<{ tam: number; cor?: string }> = ({ tam, cor = C.white }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth={3} />
  </svg>
);

/** Palpite: pergunta + opções A/B/C, contagem regressiva e (opcional) revelação da certa.
 *  O narrador pede para comentar o palpite antes da resposta: puxa comentários no meio do vídeo. */
export const Palpite: React.FC<CenaProps> = ({ c, f, dur }) => {
  const ops: string[] = c.opcoes || [];
  const letras = ['A', 'B', 'C', 'D'];
  const t = f / 30;
  const fimConta = c.revelar ? dur - 26 : dur - 4;
  const conta = prog(f, 24, fimConta, (x) => x);
  const n = Math.max(1, Math.ceil(3 - conta * 3));
  const rev = c.revelar ? prog(f, fimConta, fimConta + 10, EO) : 0;
  const sB = spr(f, -2, { damping: 9, stiffness: 220 });
  const pulsa = 1 + 0.06 * Math.sin(t * 7);
  return (
    <AbsoluteFill>
      <Fundo f={f} tom={C.amber} />
      <Poeira f={f} n={30} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${wob(t * 0.6, 1) * 5}px, ${wob(t * 0.5, 2) * 5}px)` }}>
        <div style={{ position: 'absolute', width: W, top: 270, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 30px 14px 22px', borderRadius: 999, background: C.amber, color: C.navy, transform: `scale(${sB * pulsa}) rotate(${(1 - sB) * -8}deg)`, boxShadow: `0 0 50px ${C.amber}88`, fontFamily: F.cond, fontWeight: 900, fontSize: 64, letterSpacing: 3 }}>
            <Balao tam={60} cor={C.navy} />{c.selo || 'GUESS IN THE COMMENTS'}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 70, width: W - 140, top: 430, textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ transform: `translateY(${(1 - prog(f, 2, 16, EO)) * 110}%)`, fontFamily: F.cond, fontWeight: 800, fontSize: 92, lineHeight: 1.0, color: C.white, textTransform: 'uppercase', textShadow: '0 6px 30px rgba(0,0,0,0.8)' }}>{c.pergunta}</div>
        </div>
        {ops.map((o, k) => {
          const s = spr(f, 8 + k * 6, { damping: 12, stiffness: 190 });
          const certa = c.revelar && k === c.certa;
          const apaga = c.revelar && k !== c.certa ? rev : 0;
          const y = 700 + k * 150;
          return (
            <div key={k} style={{ position: 'absolute', left: 120, width: W - 240, top: y, height: 124, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', borderRadius: 22, background: certa && rev > 0 ? `rgba(62,207,142,${0.18 + 0.2 * rev})` : 'rgba(8,18,30,0.82)', border: `3px solid ${certa && rev > 0 ? C.green : '#2a4157'}`, transform: `translateX(${(1 - s) * (k % 2 ? 380 : -380)}px) scale(${certa ? 1 + 0.06 * rev : 1})`, opacity: clamp(s * 2) * (1 - 0.65 * apaga), boxShadow: certa && rev > 0 ? `0 0 50px ${C.green}77` : '0 10px 30px rgba(0,0,0,0.4)' }}>
              <span style={{ width: 80, height: 80, flex: '0 0 80px', borderRadius: 40, display: 'grid', placeItems: 'center', background: certa && rev > 0 ? C.green : C.amber, color: C.navy, fontFamily: F.cond, fontWeight: 900, fontSize: 52 }}>{certa && rev > 0.5 ? '✓' : letras[k]}</span>
              <span style={{ fontFamily: F.cond, fontWeight: 800, fontSize: o.length > 16 ? 54 : 66, color: C.white, textTransform: 'uppercase', letterSpacing: 1 }}>{o}</span>
            </div>
          );
        })}
        {/* contagem regressiva */}
        {conta < 1 && f > 20 && (
          <div style={{ position: 'absolute', left: W / 2 - 70, top: 700 + ops.length * 150 + 10, width: 140, height: 140 }}>
            <svg width={140} height={140} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx={70} cy={70} r={60} stroke="#24384b" strokeWidth={10} fill="none" />
              <circle cx={70} cy={70} r={60} stroke={C.amber} strokeWidth={10} fill="none" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={2 * Math.PI * 60 * conta} strokeLinecap="round" />
            </svg>
            <div key={n} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: F.cond, fontWeight: 900, fontSize: 84, color: C.white, transform: `scale(${1.3 - 0.3 * ((conta * 3) % 1)})` }}>{n}</div>
          </div>
        )}
        {c.revelar && <Choque f={f} ini={fimConta} x={540} y={700 + (c.certa || 0) * 150 + 62} cor={C.green} tam={600} />}
      </div>
    </AbsoluteFill>
  );
};

/** Comparação de altura: silhuetas que crescem do chão, régua lateral e câmera que sobe junto */
const Silhueta: React.FC<{ forma: string; x: number; base: number; w: number; h: number; cor: string; lado: string }> = ({ forma, x, base, w, h, cor, lado }) => {
  if (h < 2) return null;
  const topo = base - h;
  if (forma === 'agulha') {
    // torre que afina em degraus até uma ponta (supertall genérico)
    // supertall em degraus (recuos) + agulha fina no topo
    const deg = 7, corpo = 0.8;
    const esq: number[][] = [], dir: number[][] = [];
    for (let k = 0; k < deg; k++) {
      const y0 = base - h * corpo * (k / deg), y1 = base - h * corpo * ((k + 1) / deg);
      const lw = w * (0.5 - k * 0.055);
      esq.push([x - lw, y0], [x - lw, y1]);
      dir.push([x + lw, y0], [x + lw, y1]);
    }
    const sp = w * 0.035;
    const pts = [...esq, [x - sp, base - h * corpo], [x - sp * 0.4, topo + h * 0.02], [x, topo], [x + sp * 0.4, topo + h * 0.02], [x + sp, base - h * corpo], ...dir.reverse()];
    return <g><polygon points={pts.map((p) => p.join(',')).join(' ')} fill={cor} />{Array.from({ length: Math.floor(h * corpo / 18) }).map((_, k) => <line key={k} x1={x - w * 0.12} x2={x + w * 0.12} y1={base - 10 - k * 18} y2={base - 10 - k * 18} stroke={lado} strokeWidth={3} opacity={0.35} />)}</g>;
  }
  if (forma === 'trelica') {
    // torre de treliça (tipo torre de observação): pernas abertas e ponta
    const d = `M${x - w / 2},${base} Q${x - w * 0.12},${topo + h * 0.45} ${x - w * 0.05},${topo + h * 0.12} L${x},${topo} L${x + w * 0.05},${topo + h * 0.12} Q${x + w * 0.12},${topo + h * 0.45} ${x + w / 2},${base} L${x + w * 0.22},${base} Q${x},${base - h * 0.2} ${x - w * 0.22},${base} Z`;
    return <path d={d} fill={cor} />;
  }
  if (forma === 'navio') {
    // casco em pé (comparação de comprimento na vertical)
    return <g><rect x={x - w * 0.22} y={topo} width={w * 0.44} height={h} rx={w * 0.2} fill={cor} />{Array.from({ length: Math.floor(h / 26) }).map((_, k) => <rect key={k} x={x - w * 0.16} y={topo + 20 + k * 26} width={w * 0.32} height={16} fill={lado} opacity={0.6} />)}</g>;
  }
  if (forma === 'ponte') {
    // cânion: duas encostas e o tabuleiro lá em cima (altura = do rio até o tabuleiro)
    const lw = w * 0.75;
    return (
      <g>
        <polygon points={`${x - lw * 1.3},${topo + 6} ${x - lw * 0.5},${topo + 6} ${x - lw * 0.12},${base} ${x - lw * 1.3},${base}`} fill="#2c3d4e" />
        <polygon points={`${x + lw * 1.3},${topo + 6} ${x + lw * 0.5},${topo + 6} ${x + lw * 0.12},${base} ${x + lw * 1.3},${base}`} fill="#2c3d4e" />
        <rect x={x - lw * 0.2} y={base - 8} width={lw * 0.4} height={8} fill={C.water} />
        <rect x={x - lw * 1.3} y={topo - 4} width={lw * 2.6} height={12} rx={3} fill={cor} />
        <rect x={x - lw * 0.62} y={topo - 70} width={8} height={70} fill={cor} />
        <rect x={x + lw * 0.62 - 8} y={topo - 70} width={8} height={70} fill={cor} />
        <path d={`M${x - lw * 0.62},${topo - 70} Q${x},${topo - 6} ${x + lw * 0.62},${topo - 70}`} stroke={cor} strokeWidth={3} fill="none" />
      </g>
    );
  }
  // bloco: prédio com janelas
  return (
    <g>
      <rect x={x - w / 2} y={topo} width={w} height={h} fill={cor} />
      {Array.from({ length: Math.floor(h / 22) }).map((_, k) => <rect key={k} x={x - w / 2 + 8} y={topo + 10 + k * 22} width={w - 16} height={6} fill={lado} opacity={0.5} />)}
    </g>
  );
};

export const Altura: React.FC<CenaProps> = ({ c, f, dur }) => {
  const itens: [string, number, boolean, string?][] = c.itens;
  const n = itens.length;
  const mx = Math.max(...itens.map((i) => i[1]));
  const base = 1160, alt = 640;
  const esp = (W - 200) / n;
  const t = f / 30;
  const sobe = prog(f, 0, dur * 0.6, EIO);
  const camY = -40 * (1 - sobe);
  return (
    <AbsoluteFill>
      <Fundo f={f} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${wob(t * 0.6, 1) * 5}px, ${camY + wob(t * 0.5, 2) * 4}px)` }}>
        <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {/* régua */}
          {[0.25, 0.5, 0.75, 1].map((k) => (
            <g key={k} opacity={prog(f, 0, 14) * 0.6}>
              <line x1={90} x2={W - 60} y1={base - alt * k} y2={base - alt * k} stroke={C.muted} strokeOpacity={0.14} strokeDasharray="6 10" />
              <text x={84} y={base - alt * k + 8} textAnchor="end" fill={C.muted} fontFamily={F.cond} fontWeight={700} fontSize={26}>{fmt(mx * k)}</text>
            </g>
          ))}
          <rect x={0} y={base} width={W} height={900} fill="#0d1a27" />
          <line x1={0} x2={W} y1={base} y2={base} stroke={C.muted} strokeOpacity={0.6} strokeWidth={3} />
          {itens.map(([lab, v, dest, forma], i) => {
            const s = spr(f, -2 + i * 9, { damping: 15, stiffness: 70, mass: 1.2 });
            const h = (v / mx) * alt * s;
            const x = 130 + esp * (i + 0.5);
            const w = Math.min(150, esp * 0.62);
            return (
              <g key={i}>
                {dest && <rect x={x - w} y={base - h - 30} width={w * 2} height={h + 30} fill={C.amber} opacity={0.12} style={{ filter: 'blur(26px)' }} />}
                <Silhueta forma={forma || 'bloco'} x={x} base={base} w={w} h={h} cor={dest ? C.amber : '#55728d'} lado={dest ? '#b97412' : '#2b4157'} />
                <line x1={x} x2={x} y1={base - h} y2={base - h - 26} stroke={dest ? C.amber : C.muted} strokeWidth={2} opacity={s} />
              </g>
            );
          })}
        </svg>
        {itens.map(([lab, v, dest, forma], i) => {
          const s = spr(f, -2 + i * 9, { damping: 15, stiffness: 70, mass: 1.2 });
          const h = (v / mx) * alt * s;
          const x = 130 + esp * (i + 0.5);
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: x - 140, width: 280, top: base - h - 100 - (forma === 'ponte' ? 70 : 0), textAlign: 'center', opacity: clamp(s * 2), fontFamily: F.cond, fontWeight: 900, fontSize: dest ? 72 : 56, color: dest ? C.amber : C.white, textShadow: dest ? `0 0 30px ${C.amber}88` : '0 4px 14px rgba(0,0,0,0.8)' }}>
                {fmt(v * prog(f, -2 + i * 9, 26 + i * 9, EO))}<span style={{ fontSize: dest ? 36 : 30, marginLeft: 4 }}>{c.unidade || 'm'}</span>
              </div>
              <div style={{ position: 'absolute', left: x - esp / 2, width: esp, top: base + 22, textAlign: 'center', opacity: prog(f, 4 + i * 9, 16 + i * 9), fontFamily: F.cond, fontWeight: 700, fontSize: n > 3 ? 30 : 36, lineHeight: 1.05, color: dest ? C.white : C.muted, textTransform: 'uppercase', padding: '0 6px' }}>{lab}</div>
            </React.Fragment>
          );
        })}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};

/** Lembrete no meio do vídeo (sobreposto): "Follow" com balão, aparece por ~2 s */
export const LembreteSeguir: React.FC<{ f: number; texto: string }> = ({ f, texto }) => {
  if (f < 0 || f > 70) return null;
  const s = spr(f, 0, { damping: 11, stiffness: 200 });
  const sai = prog(f, 56, 70, EO);
  return (
    <div style={{ position: 'absolute', left: 0, width: W, top: 1150, display: 'flex', justifyContent: 'center', opacity: 1 - sai, transform: `translateY(${(1 - s) * 60 + sai * 40}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px 12px 14px', borderRadius: 999, background: 'rgba(8,18,30,0.9)', border: `3px solid ${C.red}`, boxShadow: `0 0 30px ${C.red}66`, fontFamily: F.cond, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: 1 }}>
        <span style={{ background: C.red, color: '#fff', borderRadius: 999, padding: '4px 18px', fontWeight: 900 }}>FOLLOW</span>{texto}
      </div>
    </div>
  );
};
