// Base da direção de arte "física" dos 3 canais: texturas procedurais, câmera, objetos que entram
// como coisas reais (papel caindo na mesa, adesivo colado, carimbo), legenda palavra por palavra.
import '@fontsource/anton/400.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/inter/600.css';
import React from 'react';
import { AbsoluteFill, Img, staticFile, spring, getInputProps } from 'remotion';
import { GRAO } from './grao';
const TESTE = ((getInputProps() as any).teste || '') as string;
import { clamp, rnd, EO, prog } from '../lib/anim';

export const W = 1920, H = 1080, FPS = 30;
export const FA = { cond: 'Anton', osw: 'Oswald', maq: '"Special Elite"', mao: '"Permanent Marker"', serif: '"Playfair Display"', ui: 'Inter' };

export type Pal = { w: string; t0: number; t1: number; b: number };
export type Vis = { tipo: string; [k: string]: any };
export type VProps = { f: number; dur: number; v: Vis; tema: Tema };
export type Tema = { canal: string; acento: string; tinta: string; papel: string; fundo: string; nome: string };

export const sp = (f: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  f <= 0 ? 0 : spring({ frame: f, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.9, ...cfg } });

/** ruído determinístico por semente, para polígonos rasgados e posições */
export const r = (i: number) => rnd(i);

/** borda de papel rasgado: polígono em % para clip-path */
export const rasgado = (seed: number, dente = 1.6, n = 26) => {
  const pts: string[] = [];
  const j = (k: number, i: number) => r(seed * 97 + k * 31 + i) * dente;
  for (let i = 0; i < n; i++) pts.push(`${(100 * i / n).toFixed(2)}% ${j(0, i).toFixed(2)}%`);
  for (let i = 0; i < n; i++) pts.push(`${(100 - j(1, i)).toFixed(2)}% ${(100 * i / n).toFixed(2)}%`);
  for (let i = 0; i < n; i++) pts.push(`${(100 - 100 * i / n).toFixed(2)}% ${(100 - j(2, i)).toFixed(2)}%`);
  for (let i = 0; i < n; i++) pts.push(`${j(3, i).toFixed(2)}% ${(100 - 100 * i / n).toFixed(2)}%`);
  return `polygon(${pts.join(',')})`;
};

/** filtros SVG reutilizáveis (definidos uma vez por quadro).
 * Padrão: ruído pré-gerado em ladrilho (feImage + feTile), mesmo visual e cerca de 2× mais rápido de renderizar.
 * teste='lento' volta ao feTurbulence original. */
const RAPIDO = !TESTE.includes('lento');
const Ruido: React.FC<{ r: string }> = ({ r }) => RAPIDO
  ? <><feImage href={GRAO} x={0} y={0} width={256} height={256} result={r + '0'} /><feTile in={r + '0'} result={r} /></>
  : null;
export const Filtros: React.FC = () => TESTE.includes('filtro') ? null : (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <filter id="grao-papel" x="0" y="0" width="100%" height="100%">
        {RAPIDO ? <Ruido r="n" /> : <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />}
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0" />
        <feComposite in2="SourceGraphic" operator="in" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
      <filter id="amassado" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={11} result="n" />
        <feDiffuseLighting in="n" surfaceScale={3.2} lightingColor="#fff" result="luz"><feDistantLight azimuth={225} elevation={52} /></feDiffuseLighting>
        <feComposite in="luz" in2="SourceGraphic" operator="arithmetic" k1={1.05} k2={0} k3={0} k4={0} />
      </filter>
      <filter id="tinta-borrada">{RAPIDO ? <Ruido r="n" /> : <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={5} result="n" />}<feDisplacementMap in="SourceGraphic" in2="n" scale={3} /></filter>
      <filter id="carimbo">{RAPIDO ? <Ruido r="n" /> : <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={8} result="n" />}
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.25 1.32" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" /></filter>
    </defs>
  </svg>
);

/** fundo físico do canal, em camadas com parallax (recebe deslocamento da câmera) */
export const SuperficiePronta: React.FC<{ px: number; py: number; tipo: string }> = ({ px, py, tipo }) => (
  <AbsoluteFill style={{ transform: `translate(${px * 0.35}px, ${py * 0.35}px) scale(1.12)` }}>
    <Img src={staticFile(`arte/tex/${tipo}.jpg`)} style={{ width: W, height: H }} />
  </AbsoluteFill>
);

export const Superficie: React.FC<{ tema: Tema; px: number; py: number; tipo: 'escuro' | 'feltro' | 'velho'; bruta?: boolean }> = ({ tema, px, py, tipo, bruta }) => {
  if (!bruta) return <SuperficiePronta px={px} py={py} tipo={tipo} />;
  const base = tipo === 'feltro' ? '#1f5a3c' : tipo === 'velho' ? '#cdb78f' : '#26221e';
  return (
    <AbsoluteFill style={{ background: base }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id={`sup-${tipo}`} x="0" y="0" width="100%" height="100%">
            {tipo === 'feltro' ? (<>
              <feTurbulence type="fractalNoise" baseFrequency="1.6 1.1" numOctaves={3} seed={4} result="fibra" />
              <feColorMatrix in="fibra" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.30  0 0 0 0 0.18  0 0 0 1.1 -0.25" result="f2" />
              <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves={2} seed={9} result="mancha" />
              <feColorMatrix in="mancha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.15" result="m2" />
              <feMerge><feMergeNode in="f2" /><feMergeNode in="m2" /></feMerge>
            </>) : tipo === 'velho' ? (<>
              <feTurbulence type="fractalNoise" baseFrequency="0.010" numOctaves={5} seed={21} result="n" />
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.16  0 0 0 0.9 -0.25" result="mancha" />
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={2} result="g" />
              <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.35 0" result="g2" />
              <feMerge><feMergeNode in="mancha" /><feMergeNode in="g2" /></feMerge>
            </>) : (<>
              {/* papel amassado: vincos (turbulence) + relevo largo, iluminados de lado */}
              <feTurbulence type="turbulence" baseFrequency="0.0045 0.006" numOctaves={4} seed={14} result="vinco" />
              <feTurbulence type="fractalNoise" baseFrequency="0.0025" numOctaves={3} seed={31} result="largo" />
              <feComposite in="vinco" in2="largo" operator="arithmetic" k1={0} k2={0.7} k3={0.6} k4={0} result="alt" />
              <feDiffuseLighting in="alt" surfaceScale={9} diffuseConstant={1.1} lightingColor="#6e655b" result="luz"><feDistantLight azimuth={225} elevation={38} /></feDiffuseLighting>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={6} result="g" />
              <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 0" result="g2" />
              <feMerge><feMergeNode in="luz" /><feMergeNode in="g2" /></feMerge>
            </>)}
          </filter>
        </defs>
        <rect width={W} height={H} filter={`url(#sup-${tipo})`} opacity={tipo === 'escuro' ? 0.85 : 1} />
      </svg>
      {/* vinheta de luz: mesa iluminada de cima */}
      <AbsoluteFill style={{ background: tipo === 'velho'
        ? 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(255,240,210,0.25), rgba(60,35,10,0.55) 100%)'
        : tipo === 'feltro' ? 'radial-gradient(ellipse 70% 65% at 50% 42%, rgba(255,255,220,0.13), rgba(0,0,0,0.62) 100%)'
        : 'radial-gradient(ellipse 72% 68% at 50% 45%, rgba(255,230,200,0.10), rgba(0,0,0,0.70) 100%)' }} />
    </AbsoluteFill>
  );
};

/** câmera viva: empurra devagar, deriva como câmera na mão e dá um "soco" em cada troca */
export const camera = (g: number, socos: number[]) => {
  const t = g / FPS;
  let soco = 0;
  for (const s of socos) { const d = g - s; if (d >= 0 && d < 24) soco = Math.max(soco, Math.sin((d / 24) * Math.PI) * (1 - d / 24)); }
  const esc = 1.03 + 0.012 * Math.sin(t * 0.21) + soco * 0.018;
  const px = Math.sin(t * 0.33) * 14 + Math.sin(t * 0.91 + 1) * 4;
  const py = Math.cos(t * 0.27) * 9 + Math.sin(t * 1.13) * 3;
  const rot = Math.sin(t * 0.19) * 0.35;
  return { esc, px, py, rot };
};

export const Continua = React.createContext<{ ant: boolean; prox: boolean }>({ ant: false, prox: false });

/** objeto físico: entra caindo/deslizando, assenta com mola e sai sendo puxado para fora */
export const Objeto: React.FC<{ f: number; dur: number; x: number; y: number; w?: number; rot?: number; entra?: 'cai' | 'esq' | 'dir' | 'baixo' | 'carimbo' | 'cola';
  atraso?: number; sai?: boolean; z?: number; sombra?: number; children: React.ReactNode; seed?: number; forma?: 'ret' | 'livre' }> = ({ f, dur, x, y, w, rot = 0, entra = 'cai', atraso = 0, sai = true, z = 1, sombra = 1, children, seed = 1, forma = 'ret' }) => {
  const cont = React.useContext(Continua);
  const fe = cont.ant && atraso === 0 ? f + 60 : f - atraso;
  if (fe < 0) return null;
  if (cont.prox) sai = false;
  const s = sp(fe, entra === 'carimbo' ? { damping: 11, stiffness: 260, mass: 0.6 } : entra === 'cola' ? { damping: 16, stiffness: 200 } : {});
  const saida = sai ? prog(f, dur, dur + 14, EO) : 0;
  let dx = 0, dy = 0, dr = 0, esc = 1, alt = 0;
  if (entra === 'cai') { dy = (1 - s) * -90; esc = 1 + (1 - s) * 0.22; dr = (1 - s) * (r(seed) > 0.5 ? 9 : -9); alt = 1 - s; }
  if (entra === 'esq') { dx = (1 - s) * -1500; dr = (1 - s) * -14; }
  if (entra === 'dir') { dx = (1 - s) * 1500; dr = (1 - s) * 14; }
  if (entra === 'baixo') { dy = (1 - s) * 1000; dr = (1 - s) * 8; }
  if (entra === 'carimbo') { esc = 1 + (1 - s) * 1.4; alt = (1 - s) * 1.6; }
  if (entra === 'cola') { esc = 0.6 + 0.4 * s; dr = (1 - s) * 18; }
  // saída: puxado para o lado (alterna pela semente)
  const lado = r(seed + 7) > 0.5 ? 1 : -1;
  dx += saida * lado * 1700; dr += saida * lado * 10; dy += saida * 80;
  const op = entra === 'cola' || entra === 'carimbo' ? clamp(s * 3) : 1;
  const sh = sombra * (1 + alt * 2.2);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w ?? 'max-content', zIndex: z, opacity: op,
      transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot + dr}deg) scale(${esc})`,
      // sombra barata: box-shadow no retângulo do objeto (papel, placa, carta); drop-shadow só em forma livre; carimbo é tinta, sem sombra
      ...(entra === 'carimbo' || sombra === 0 ? {} : forma === 'livre'
        ? { filter: `drop-shadow(${5 * sh}px ${10 * sh}px ${6 * sh}px rgba(0,0,0,${0.42 / (1 + alt)}))` }
        : { boxShadow: `${6 * sh}px ${14 * sh}px ${18 * sh}px rgba(0,0,0,${0.42 / (1 + alt)})` }) }}>
      {children}
    </div>
  );
};

/** fita adesiva semitransparente */
export const Fita: React.FC<{ x: number; y: number; rot?: number; w?: number; cor?: string }> = ({ x, y, rot = -8, w = 150, cor = 'rgba(235,225,190,0.62)' }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 42, background: cor, transform: `translate(-50%,-50%) rotate(${rot}deg)`,
    clipPath: rasgado(Math.round(x + y), 3, 8), boxShadow: '0 1px 2px rgba(0,0,0,0.15)', mixBlendMode: 'normal' }} />
);

export const Emoji: React.FC<{ n: string; tam: number; style?: React.CSSProperties }> = ({ n, tam, style }) => (
  <Img src={staticFile(`arte/emoji/${n}.svg`)} style={{ width: tam, height: tam, display: 'block', ...style }} />
);

/** legenda grande, palavra por palavra (3–4 palavras por vez), a palavra falada acende no acento */
export const Legenda: React.FC<{ g: number; pal: Pal[]; tema: Tema; estilo: 'cond' | 'serif' }> = ({ g, pal, tema, estilo }) => {
  const t = g / FPS;
  const bl = (pal as any)._bl || ((pal as any)._bl = (() => {
    const out: { ws: Pal[]; t0: number; t1: number }[] = [];
    let cur: Pal[] = [];
    const fecha = () => { if (cur.length) { out.push({ ws: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1 }); cur = []; } };
    pal.forEach((p) => {
      if (cur.length && cur[0].b !== p.b) fecha();
      cur.push(p);
      const letras = cur.reduce((s, x) => s + x.w.length, 0);
      if (/[.?!:;]$/.test(p.w) || (/,$/.test(p.w) && cur.length >= 2) || cur.length >= 4 || letras > 20) fecha();
    });
    fecha();
    return out;
  })());
  const i = bl.findIndex((b: any, k: number) => t >= b.t0 - 0.04 && t < (bl[k + 1] ? Math.min(bl[k + 1].t0 - 0.04, b.t1 + 0.35) : b.t1 + 0.45));
  if (i < 0) return null;
  const b = bl[i];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', gap: '0 22px', flexWrap: 'wrap', padding: '0 160px', pointerEvents: 'none', zIndex: 50 }}>
      {b.ws.map((w: Pal, k: number) => {
        const d = (t - w.t0) * FPS;
        const visto = d >= -1;
        const agora = t >= w.t0 - 0.03 && t < w.t1 + 0.02;
        const s = sp(d + 1, { damping: 12, stiffness: 300, mass: 0.5 });
        const num = /\d/.test(w.w);
        const txt = estilo === 'cond' ? w.w.toUpperCase().replace(/[,.:;]$/, '') : w.w.replace(/[,.:;]$/, '');
        return (
          <span key={k} style={{ display: 'inline-block', fontFamily: estilo === 'cond' ? FA.cond : FA.serif, fontWeight: estilo === 'cond' ? 400 : 900,
            fontSize: estilo === 'cond' ? (num ? 98 : 88) : (num ? 100 : 92), lineHeight: 1.08, letterSpacing: estilo === 'cond' ? 1 : 0,
            color: agora || (num && visto) ? tema.acento : '#fbf7ee', opacity: visto ? 1 : 0,
            transform: `translateY(${(1 - s) * 26}px) scale(${0.82 + 0.18 * s + (agora ? 0.04 : 0)})`,
            WebkitTextStroke: estilo === 'cond' ? '3px #141210' : '2px #1b120a', paintOrder: 'stroke fill',
            textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.45)' }}>{txt}</span>
        );
      })}
    </div>
  );
};

/** número que conta até o valor (texto pronto, ex.: "$6,220") */
export const conta = (txt: string, p: number) => {
  const m = txt.match(/[\d,.]+/);
  if (!m) return txt;
  const alvo = parseFloat(m[0].replace(/,/g, ''));
  const dec = (m[0].split('.')[1] || '').length;
  const v = alvo * clamp(p);
  const s = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const usaVirg = m[0].includes(',');
  return txt.replace(m[0], usaVirg ? s : s.replace(/,/g, ''));
};

/** poeira em suspensão na luz (camada da frente, parallax maior) */
export const Poeira: React.FC<{ g: number; px: number; py: number; cor?: string; n?: number }> = ({ g, px, py, cor = 'rgba(255,240,210,0.5)', n = 26 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', transform: `translate(${px * 1.4}px, ${py * 1.4}px)`, zIndex: 60 }}>
    {Array.from({ length: n }, (_, i) => {
      const t = g / FPS;
      const x = (r(i) * W + Math.sin(t * 0.3 + i) * 40 + t * (6 + r(i + 3) * 10)) % W;
      const y = (r(i + 9) * H + Math.cos(t * 0.25 + i * 2) * 30 - t * (4 + r(i + 5) * 6) + H * 4) % H;
      const s = 2 + r(i + 1) * 3;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: cor, opacity: 0.35 + 0.4 * Math.sin(t + i) ** 2, filter: 'blur(1px)' }} />;
    })}
  </AbsoluteFill>
);

export { prog, clamp, EO };
