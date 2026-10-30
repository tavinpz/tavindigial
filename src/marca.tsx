import React from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

// ── Identidade Tavin Digital ──
export const C = {
  noite: '#120E15', noite2: '#1B1520', noite3: '#241C2A',
  el: '#B600F6', prof: '#5D0487', rosa: '#FEA8FF', cinza: '#2E2633',
  papel: '#F4F2F6', branco: '#FFFFFF', ink: '#18121C', fg2: '#6A6172',
};
export const D = 'Raleway, sans-serif';
export const B = 'Urbanist, sans-serif';

// fontes locais (woff2 do fontsource)
const FONTES: [string, string, string][] = [
  ['Raleway', 'raleway-latin-600-normal', '600'], ['Raleway', 'raleway-latin-800-normal', '800'], ['Raleway', 'raleway-latin-900-normal', '900'],
  ['Urbanist', 'urbanist-latin-500-normal', '500'], ['Urbanist', 'urbanist-latin-600-normal', '600'],
  ['Urbanist', 'urbanist-latin-700-normal', '700'], ['Urbanist', 'urbanist-latin-800-normal', '800'],
];
if (typeof window !== 'undefined' && !(window as any).__fontesTavin) {
  (window as any).__fontesTavin = true;
  const h = delayRender('fontes');
  Promise.all(FONTES.map(([f, arq, w]) => new FontFace(f, `url(${staticFile(`fonts/${arq}.woff2`)})`, { weight: w }).load().then((ff) => (document as any).fonts.add(ff))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const entra = (f: number, ini: number, dur = 14) => interpolate(f, [ini, ini + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const sai = (f: number, fim: number, dur = 10) => interpolate(f, [fim - dur, fim], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });

// ── Pattern da marca (quartos de círculo, meias-luas, triângulos, malha) ──
const CORES = [C.el, C.prof, C.rosa, C.cinza];
const FORMAS: Record<string, string> = {
  quarto: 'M0 0H1A1 1 0 0 1 0 1Z', meia: 'M0 1A0.5 0.5 0 0 1 1 1Z', tri: 'M0 0L1 0L0 1Z',
  circulo: 'M0 0.5A0.5 0.5 0 1 0 1 0.5A0.5 0.5 0 1 0 0 0.5Z',
  malha: Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 - i }, (_, j) => { const x = j / 4, y = i / 4, t = 0.25; return `M${x} ${y}L${x + t} ${y}L${x} ${y + t}Z`; }).join('')).join(''),
};
const TIPOS = ['quarto', 'quarto', 'meia', 'tri', 'circulo', 'malha', 'quarto', 'meia'];
function rnd(semente: number) { let s = semente >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function celulas(cols: number, lins: number, semente = 7) {
  const r = rnd(semente); const out: any[] = [];
  for (let lin = 0; lin < lins; lin++) for (let col = 0; col < cols; col++) {
    const fundo = CORES[Math.floor(r() * 4)]; let cor = CORES[Math.floor(r() * 4)];
    if (cor === fundo) cor = CORES[(CORES.indexOf(fundo) + 2) % 4];
    out.push({ col, lin, fundo, cor, forma: TIPOS[Math.floor(r() * TIPOS.length)], giro: Math.floor(r() * 4) * 90 });
  }
  return out;
}

// Bloco do pattern: cada célula cresce com atraso em diagonal; "giro" anima a forma girando
export const Padrao: React.FC<{ cols: number; lins: number; lado: number; semente?: number; ini?: number; fim?: number; x?: number; y?: number; vivo?: boolean; style?: React.CSSProperties }> = ({ cols, lins, lado, semente = 7, ini = 0, fim, x = 0, y = 0, vivo = true, style }) => {
  const f = useCurrentFrame();
  return (
    <svg width={cols * lado} height={lins * lado} style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}>
      {celulas(cols, lins, semente).map((c, i) => {
        const atraso = ini + (c.col + c.lin) * 2;
        let s = entra(f, atraso, 12);
        if (fim !== undefined) s *= sai(f, fim - (cols + lins - c.col - c.lin) * 1.5, 10);
        const g = c.giro + (vivo ? Math.sin((f + i * 13) / 40) * 6 : 0) + (1 - s) * 90;
        return (
          <g key={i} transform={`translate(${c.col * lado + lado / 2} ${c.lin * lado + lado / 2}) scale(${s}) rotate(${g}) translate(${-lado / 2} ${-lado / 2})`}>
            <rect width={lado + 0.6} height={lado + 0.6} fill={c.fundo} />
            <path d={FORMAS[c.forma]} transform={`scale(${lado})`} fill={c.cor} />
          </g>
        );
      })}
    </svg>
  );
};

// Troca de cena: o pattern cobre a tela e se desfaz (centro = frame do corte)
export const Cortina: React.FC<{ em: number; semente?: number }> = ({ em, semente = 3 }) => {
  const f = useCurrentFrame();
  if (f < em - 14 || f > em + 16) return null;
  const lado = 1080 / 6;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {celulas(6, 11, semente).map((c, i) => {
        const d = (c.col + c.lin) * 0.9;
        const cobre = interpolate(f, [em - 14 + d * 0.5, em - 4 + d * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
        const abre = interpolate(f, [em + d * 0.6, em + 9 + d * 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
        const s = Math.min(cobre, abre) * 1.02;
        return (
          <g key={i} transform={`translate(${c.col * lado + lado / 2} ${c.lin * lado + lado / 2}) scale(${s}) rotate(${c.giro}) translate(${-lado / 2} ${-lado / 2})`}>
            <rect width={lado + 1} height={lado + 1} fill={c.fundo} />
            <path d={FORMAS[c.forma]} transform={`scale(${lado})`} fill={c.cor} />
          </g>
        );
      })}
    </svg>
  );
};

// ── Logo: símbolo (máscara do PNG oficial) + TAVÍN digital ──
export const Logo: React.FC<{ cor?: string; tamanho?: number; nome?: boolean }> = ({ cor = C.branco, tamanho = 46, nome = true }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: tamanho * 0.42, color: cor }}>
    <div style={{ width: tamanho * 1.04, height: tamanho, background: cor, WebkitMaskImage: `url(${staticFile('logo.png')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
    {nome && <span style={{ fontFamily: D, fontWeight: 600, fontSize: tamanho * 0.78, letterSpacing: '0.32em' }}>TAVÍN</span>}
    {nome && <span style={{ fontFamily: B, fontWeight: 600, fontSize: tamanho * 0.52, letterSpacing: '0.08em', opacity: 0.65 }}>digital</span>}
  </div>
);

// ── Título cinético: palavra por palavra; *trecho* sai destacado com um traço que corre por baixo ──
export const Titulo: React.FC<{ texto: string; ini?: number; tam?: number; cor?: string; destaque?: string; peso?: number; passo?: number; alinhar?: 'left' | 'center'; largura?: number; fim?: number; linha?: number }> = ({ texto, ini = 0, tam = 112, cor = C.branco, destaque = C.rosa, peso = 900, passo = 3, alinhar = 'left', largura = 900, fim, linha = 1.02 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let em = false;
  const palavras = texto.split(' ').map((p) => {
    const abre = p.startsWith('*'); if (abre) { em = true; p = p.slice(1); }
    const fecha = p.endsWith('*') || p.endsWith('*.') || p.endsWith('*,') || p.endsWith('*?');
    const tok = { t: p.replace('*', ''), d: em };
    if (fecha) em = false;
    return tok;
  });
  const saida = fim !== undefined ? sai(f, fim, 10) : 1;
  return (
    <div style={{ fontFamily: D, fontWeight: peso, fontSize: tam, lineHeight: linha, letterSpacing: '-0.035em', color: cor, textAlign: alinhar, width: largura, display: 'flex', flexWrap: 'wrap', justifyContent: alinhar === 'center' ? 'center' : 'flex-start', columnGap: tam * 0.24, opacity: saida, transform: `translateY(${(1 - saida) * -30}px)` }}>
      {palavras.map((w, i) => {
        const s = spring({ frame: f - ini - i * passo, fps, config: { damping: 16, stiffness: 170, mass: 0.7 } });
        const traco = w.d ? interpolate(f - ini - i * passo, [6, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }) : 0;
        return (
          <span key={i} style={{ display: 'inline-block', position: 'relative', overflow: 'visible', color: w.d ? destaque : cor, transform: `translateY(${(1 - s) * tam * 0.55}px)`, opacity: Math.min(1, s * 1.4) }}>
            {w.t}
            {w.d && <span style={{ position: 'absolute', left: 0, right: 0, bottom: tam * 0.02, height: tam * 0.09, background: destaque, opacity: 0.35, transformOrigin: 'left', transform: `scaleX(${traco})`, borderRadius: 6 }} />}
          </span>
        );
      })}
    </div>
  );
};

// ── Celular com a tela real rolando (keyframes de rolagem em px da imagem já escalada) ──
export const Celular: React.FC<{ src?: string; largura?: number; imgLargura?: number; rolar?: [number, number][]; style?: React.CSSProperties; sombra?: boolean; children?: React.ReactNode }> = ({ src, largura = 600, imgLargura = 780, rolar = [[0, 0]], style, sombra = true, children }) => {
  const f = useCurrentFrame();
  const borda = largura * 0.034;
  const tela = largura - borda * 2;
  const altura = tela * 844 / 390;
  const qs = rolar.map((r) => r[0]); const ys = rolar.map((r) => r[1]);
  const y = rolar.length > 1 ? interpolate(f, qs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }) : ys[0];
  return (
    <div style={{ position: 'absolute', width: largura, height: altura + borda * 2, borderRadius: largura * 0.13, background: '#0B090D', padding: borda, boxShadow: sombra ? `0 ${largura * 0.08}px ${largura * 0.16}px -${largura * 0.06}px rgba(0,0,0,.55), 0 0 0 2px #3A3340` : undefined, ...style }}>
      <div style={{ width: tela, height: altura, borderRadius: largura * 0.105, overflow: 'hidden', position: 'relative', background: '#000' }}>
        {src ? <Img src={staticFile(src)} style={{ width: tela, position: 'absolute', left: 0, top: -y * (tela / imgLargura) }} /> : <div style={{ position: 'absolute', inset: 0, width: tela, height: altura }}>{children}</div>}
        <div style={{ position: 'absolute', top: tela * 0.03, left: '50%', width: tela * 0.3, height: tela * 0.085, marginLeft: -tela * 0.15, background: '#000', borderRadius: 99 }} />
      </div>
    </div>
  );
};

// Selo/etiqueta que entra com mola
export const Selo: React.FC<{ texto: string; ini: number; cor?: string; fundo?: string; tam?: number; fim?: number; icone?: string; style?: React.CSSProperties }> = ({ texto, ini, cor = C.ink, fundo = C.branco, tam = 40, fim, icone = '✓', style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - ini, fps, config: { damping: 13, stiffness: 190, mass: 0.6 } });
  const o = fim !== undefined ? sai(f, fim, 8) : 1;
  return (
    <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: tam * 0.4, padding: `${tam * 0.42}px ${tam * 0.7}px ${tam * 0.42}px ${tam * 0.45}px`, borderRadius: 999, background: fundo, color: cor, fontFamily: B, fontWeight: 800, fontSize: tam, whiteSpace: 'nowrap', boxShadow: '0 18px 40px -18px rgba(0,0,0,.55)', transform: `scale(${s})`, opacity: Math.min(1, s) * o, ...style }}>
      {icone && <span style={{ width: tam * 1.15, height: tam * 1.15, borderRadius: 99, background: C.el, color: C.branco, display: 'grid', placeItems: 'center', fontSize: tam * 0.62 }}>{icone}</span>}
      {texto}
    </div>
  );
};

// Fundo noturno com luz que respira
export const Fundo: React.FC<{ cor?: string; luz?: string }> = ({ cor = C.noite, luz = 'rgba(182,0,246,.22)' }) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 50) * 18, y = 30 + Math.cos(f / 60) * 10;
  return <AbsoluteFill style={{ background: `radial-gradient(70% 45% at ${x}% ${y}%, ${luz}, transparent 70%), ${cor}` }} />;
};

// Rodapé fixo da marca (fica acima da área dos botões do Reels)
export const Assinatura: React.FC<{ cor?: string }> = ({ cor = C.branco }) => (
  <div style={{ position: 'absolute', left: 80, top: 96, opacity: 0.9 }}><Logo cor={cor} tamanho={38} /></div>
);

// Legenda da narração (versão com voz): bloco de até ~5 palavras, a palavra falada acende
export const Legenda: React.FC<{ falas: { ini: number; fim: number; texto: string }[] }> = ({ falas }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = f / fps;
  const fala = falas.find((x) => t >= x.ini && t < x.fim + 0.15);
  if (!fala) return null;
  const palavras = fala.texto.split(' ');
  const pesos = palavras.map((p) => p.length + 2); const total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0; const tempos = pesos.map((p) => { const ini = fala.ini + (acum / total) * (fala.fim - fala.ini); acum += p; return ini; });
  let atual = 0; tempos.forEach((tt, i) => { if (t >= tt) atual = i; });
  const bloco = Math.floor(atual / 5) * 5;
  return (
    <div style={{ position: 'absolute', left: 70, right: 150, bottom: 430, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 16px' }}>
      {palavras.slice(bloco, bloco + 5).map((p, i) => (
        <span key={i} style={{ fontFamily: B, fontWeight: 800, fontSize: 60, padding: '2px 10px', borderRadius: 12, color: bloco + i === atual ? C.ink : C.branco, background: bloco + i === atual ? C.rosa : 'rgba(18,14,21,.72)' }}>{p}</span>
      ))}
    </div>
  );
};
