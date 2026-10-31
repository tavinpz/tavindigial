// Kit "keynote": fundo preto, tipografia gigante, vidro, brilho de borda, celular com espessura
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { P, F, lerp, mola, saida } from '../leve/kit';

export const BATIDA = 15; // 120 bpm a 30 fps
export const GRAD = 'linear-gradient(100deg, #FFC4FF 0%, #E07BFF 30%, #B600F6 62%, #7B2CF0 100%)';
export const expo = Easing.bezier(0.16, 1, 0.3, 1);

export const Preto: React.FC<{ luz?: number }> = ({ luz = 1 }) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 80) * 10, y = 62 + Math.cos(f / 90) * 6;
  return (
    <AbsoluteFill style={{ background: '#050407' }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 38% at ${x}% ${y}%, rgba(140,20,220,${0.22 * luz}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.6))' }} />
    </AbsoluteFill>
  );
};

// Texto com gradiente da marca
export const Grad: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent', ...style }}>{children}</span>
);

// Palavra gigante que entra "no corte" (escala 1.12 → 1) e fica até "fim"
export const Corte: React.FC<{ t: string; ini: number; fim: number; tam?: number; grad?: boolean; cor?: string; y?: number; peso?: number; zoom?: number }> = ({ t, ini, fim, tam = 210, grad = false, cor = '#fff', y = 960, peso = 800, zoom = 1.12 }) => {
  const f = useCurrentFrame();
  if (f < ini || f >= fim) return null;
  const p = lerp(f, ini, ini + 10, 0, 1, expo);
  const s = zoom + (1 - zoom) * p + (f - ini) * 0.0012;
  const b = (1 - lerp(f, ini, ini + 4, 0, 1)) * 10;
  const txt = <span style={{ fontFamily: F, fontWeight: peso, fontSize: tam, letterSpacing: '-0.05em', lineHeight: 1, whiteSpace: 'nowrap', color: cor }}>{t}</span>;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - tam * 0.55, display: 'flex', justifyContent: 'center', transform: `scale(${s})`, filter: b > 0.3 ? `blur(${b}px)` : undefined }}>
      {grad ? <Grad style={{ fontFamily: F, fontWeight: peso, fontSize: tam, letterSpacing: '-0.05em', lineHeight: 1, whiteSpace: 'nowrap', paddingBottom: tam * 0.08 }}>{t}</Grad> : txt}
    </div>
  );
};

// Atravessa: começa enorme (a câmera "passa por dentro") e assenta
export const Atravessa: React.FC<{ children: React.ReactNode; ini: number; fim?: number; de?: number; dur?: number; style?: React.CSSProperties }> = ({ children, ini, fim, de = 14, dur = 16, style }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const p = lerp(f, ini, ini + dur, 0, 1, expo);
  const s = de * (1 - p) + p;
  const o = Math.min(lerp(f, ini, ini + 4, 0, 1), saida(f, fim, 10));
  return <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, opacity: o, filter: p < 0.85 ? `blur(${(1 - p) * 8}px)` : undefined, ...style }}>{children}</div>;
};

// Ladrilho de vidro escuro (bento)
export const Vidro: React.FC<{ x: number; y: number; w: number; h: number; ini: number; fim?: number; children?: React.ReactNode; style?: React.CSSProperties; raio?: number }> = ({ x, y, w, h, ini, fim, children, style, raio = 44 }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, 30, { damping: 20, stiffness: 110, mass: 1 });
  const q = 1 - saida(f, fim, 14);
  const o = Math.min(1, s * 1.5) * (1 - q);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: raio, overflow: 'hidden', background: 'linear-gradient(160deg, rgba(255,255,255,.085), rgba(255,255,255,.025))', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.10), inset 0 1.5px 0 rgba(255,255,255,.14), 0 40px 80px -30px rgba(0,0,0,.8)', opacity: o, transform: `perspective(1600px) translateZ(${(1 - s) * -400}px) translateY(${(1 - s) * 60}px) scale(${1 - q * 0.1})`, filter: o < 0.97 ? `blur(${(1 - o) * 12}px)` : undefined, ...style }}>
      {children}
    </div>
  );
};

// Brilho de borda girando (ao redor de um retângulo arredondado)
export const Aura: React.FC<{ w: number; h: number; raio: number; ini: number; fim?: number; espessura?: number; x?: number; y?: number }> = ({ w, h, raio, ini, fim, espessura = 16, x = 0, y = 0 }) => {
  const f = useCurrentFrame();
  const o = Math.min(lerp(f, ini, ini + 18, 0, 1), saida(f, fim, 16));
  if (o <= 0) return null;
  const g = `conic-gradient(from ${(f - ini) * 6}deg, #B600F6, #FEA8FF, #7B2CF0, #FF7AD9, #B600F6)`;
  const anel: React.CSSProperties = { position: 'absolute', inset: 0, borderRadius: raio, padding: espessura, background: g, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' as any };
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, pointerEvents: 'none' }}>
      <div style={{ ...anel, filter: 'blur(26px)', opacity: 0.9 }} />
      <div style={{ ...anel, filter: 'blur(5px)' }} />
    </div>
  );
};

// Brilho que varre o vidro (reflexo)
export const Reflexo: React.FC<{ ini: number; dur?: number }> = ({ ini, dur = 28 }) => {
  const f = useCurrentFrame();
  const p = lerp(f, ini, ini + dur, -0.6, 1.6, Easing.inOut(Easing.cubic));
  if (f < ini || f > ini + dur) return null;
  return <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${p * 100 - 18}%, rgba(255,255,255,.38) ${p * 100}%, transparent ${p * 100 + 18}%)`, pointerEvents: 'none', zIndex: 30 }} />;
};

// Celular com espessura real em 3D (moldura em camadas) — filho = tela
export const Fone3D: React.FC<{ w?: number; rx?: number; ry?: number; rz?: number; children?: React.ReactNode; cor?: string; borda?: string }> = ({ w = 560, rx = 0, ry = 0, rz = 0, children, cor = '#111014', borda = '#3A3640' }) => {
  const h = w * 2.08; const raio = w * 0.15; const esp = 22;
  const camadas = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div style={{ position: 'relative', width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
      {camadas.map((i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: raio, background: i === 0 ? '#1d1b21' : borda, transform: `translateZ(${-esp + (i * esp) / 10}px)`, boxShadow: i === 0 ? '0 80px 120px -40px rgba(0,0,0,.7)' : undefined }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, borderRadius: raio, background: cor, padding: w * 0.028, transform: 'translateZ(1px)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.12)' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: raio * 0.82, overflow: 'hidden', background: '#000' }}>
          {children}
          <div style={{ position: 'absolute', top: w * 0.03, left: '50%', width: w * 0.27, height: w * 0.075, marginLeft: -w * 0.135, background: '#000', borderRadius: 99, zIndex: 40 }} />
        </div>
      </div>
    </div>
  );
};

export const Centro: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...style }}>{children}</div>
);

// Flash de corte
export const Flash: React.FC<{ em: number; cor?: string; dur?: number }> = ({ em, cor = '#fff', dur = 8 }) => {
  const f = useCurrentFrame();
  if (f < em || f > em + dur) return null;
  return <AbsoluteFill style={{ background: cor, opacity: interpolate(f, [em, em + dur], [0.9, 0]) }} />;
};
export { P, F };
