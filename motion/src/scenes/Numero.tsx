import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, COR } from '../lib/theme';
import { prog, spr, EO, clamp, wob } from '../lib/anim';
import { Fundo, Titulo, Odometro, Poeira, Raios, Choque } from '../comp/base';
import { Mapa } from './Mapa';
import type { CenaProps } from '../lib/types';

const tamanho = (s: string) => (s.length <= 4 ? 260 : s.length <= 6 ? 230 : s.length <= 8 ? 190 : s.length <= 10 ? 160 : 130);

const Bloco: React.FC<{ f: number; ini: number; valor: number; dec?: number; prefixo?: string; sufixo?: string; label?: string; nota?: string; cor: string; y: number; escala?: number }> = ({ f, ini, valor, dec = 0, prefixo = '', sufixo = '', label, nota, cor, y, escala = 1 }) => {
  const txt = prefixo + valor.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + sufixo;
  const tam = tamanho(txt) * escala;
  const dc = 34;
  const s = spr(f, ini, { damping: 12, stiffness: 160 });
  const bate = spr(f, ini + dc, { damping: 8, stiffness: 260 });
  const pulso = f > ini + dc ? 1 + 0.07 * (1 - bate) : 1;
  const l = prog(f, ini + 10, ini + 24, EO);
  const n = prog(f, ini + 18, ini + 32, EO);
  return (
    <div style={{ position: 'absolute', left: 0, width: W, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ transform: `scale(${(0.55 + 0.45 * s) * pulso})`, opacity: clamp(s * 2) }}>
        <Odometro f={f} valor={valor} dec={dec} prefixo={prefixo} sufixo={sufixo} ini={ini} fim={ini + dc} tam={tam} cor={cor} />
      </div>
      {label && (
        <div style={{ overflow: 'hidden', marginTop: 18 * escala }}>
          <div style={{ transform: `translateY(${(1 - l) * 100}%)`, fontFamily: F.cond, fontWeight: 800, fontSize: 66 * escala, letterSpacing: 2, color: C.white, textTransform: 'uppercase', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>{label}</div>
        </div>
      )}
      {nota && <div style={{ marginTop: 12, opacity: n, transform: `translateY(${(1 - n) * 14}px)`, fontFamily: F.sans, fontWeight: 600, fontSize: 34, color: C.muted, textAlign: 'center', padding: '0 90px' }}>{nota}</div>}
    </div>
  );
};

export const Numero: React.FC<CenaProps> = (p) => {
  const { c, f, dur } = p;
  const cor = COR[c.cor || 'amber'] || C.amber;
  const seg = c.segundo;
  const iniSeg = Math.round(dur * 0.42);
  const sobe = seg ? prog(f, iniSeg - 6, iniSeg + 10, EO) : 0;
  const t = f / 30;
  return (
    <AbsoluteFill>
      {c.fundo ? (
        <AbsoluteFill style={{ opacity: 0.55, filter: 'saturate(0.8)' }}>
          <Mapa {...p} c={{ tipo: 'mapa', bbox: c.fundo, destaque: c.destaque, zoom: 0.12 }} />
        </AbsoluteFill>
      ) : (
        <Fundo f={f} tom={cor} />
      )}
      <AbsoluteFill style={{ background: c.fundo ? 'radial-gradient(ellipse 70% 40% at 50% 45%, rgba(5,12,21,0.72) 0%, rgba(5,12,21,0.35) 100%)' : undefined }} />
      <Raios f={f} cor={cor} y={42 - sobe * 8} forca={prog(f, -6, 20)} />
      <Poeira f={f} cor={cor} n={34} />
      <Choque f={f} ini={-3 + 34} x={540} y={800 - sobe * 150} cor={cor} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${wob(t * 0.7, 1) * 6}px, ${wob(t * 0.6, 2) * 6}px)` }}>
        <Bloco f={f} ini={-3} valor={c.valor} dec={c.decimais} prefixo={c.prefixo} sufixo={c.sufixo} label={c.label} nota={c.nota} cor={cor} y={640 - sobe * 230} escala={1 - sobe * 0.18} />
        {seg && f >= iniSeg - 2 && (
          <>
            <Choque f={f} ini={iniSeg + 34} x={540} y={1060} cor={COR[seg.cor] || C.water} />
            <Bloco f={f} ini={iniSeg} valor={seg.valor} dec={seg.decimais} prefixo={seg.prefixo} sufixo={seg.sufixo} label={seg.label} nota={seg.nota} cor={COR[seg.cor] || C.water} y={930} escala={0.85} />
          </>
        )}
      </div>
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};
