// Kit "leve": motion de produto (fundo claro/degradê, texto com desfoque, cards de interface, câmera contínua)
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { getLength, getPointAtLength } from '@remotion/paths';
import '../marca'; // carrega as fontes da marca

export const P = {
  fundo: '#F7F4FA', ink: '#1B1322', fg2: '#6F6679', fg3: '#A79EB0', el: '#B600F6', vio: '#7B2CF0', prof: '#5D0487',
  lilas: '#EEE3FB', lilas2: '#DCC6F7', rosa: '#FEA8FF', branco: '#FFFFFF', linha: '#E8E1EF', ok: '#16A86A', ambar: '#F5A524',
};
export const F = 'Urbanist, sans-serif';
export const FD = 'Raleway, sans-serif';

export const io = Easing.bezier(0.65, 0, 0.35, 1);
export const sai = Easing.bezier(0.16, 1, 0.3, 1);
export const entra = Easing.bezier(0.5, 0, 0.75, 0);
export const lerp = (f: number, a: number, b: number, x: number, y: number, e = sai) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const chaves = (f: number, ks: [number, number][], e = io) =>
  ks.length === 1 ? ks[0][1] : interpolate(f, ks.map((k) => k[0]), ks.map((k) => k[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const mola = (f: number, ini: number, fps = 30, cfg: any = { damping: 16, stiffness: 130, mass: 0.8 }) => spring({ frame: f - ini, fps, config: cfg });
export const molaViva = (f: number, ini: number) => spring({ frame: f - ini, fps: 30, config: { damping: 11, stiffness: 160, mass: 0.7 } });
// saída suave (1 → 0) terminando em "fim"
export const saida = (f: number, fim?: number, dur = 12) => (fim === undefined ? 1 : lerp(f, fim - dur, fim, 1, 0, entra));

// ── Fundos ──
export const FundoLuz: React.FC<{ base?: string; a?: string; b?: string; c?: string }> = ({ base = P.fundo, a = 'rgba(254,168,255,.55)', b = 'rgba(182,0,246,.16)', c = 'rgba(123,44,240,.10)' }) => {
  const f = useCurrentFrame();
  const m = (k: number, amp: number, v: number) => k + Math.sin(f / v) * amp;
  return (
    <AbsoluteFill style={{ background: base, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1300, height: 1300, left: m(380, 60, 70), top: m(1050, 50, 90), background: `radial-gradient(circle, ${a}, transparent 62%)` }} />
      <div style={{ position: 'absolute', width: 1200, height: 1200, left: m(-520, 70, 80), top: m(-380, 60, 65), background: `radial-gradient(circle, ${b}, transparent 60%)` }} />
      <div style={{ position: 'absolute', width: 900, height: 900, left: m(520, 50, 60), top: m(-240, 40, 75), background: `radial-gradient(circle, ${c}, transparent 60%)` }} />
    </AbsoluteFill>
  );
};

export const FundoRoxo: React.FC = () => {
  const f = useCurrentFrame();
  const x = 30 + Math.sin(f / 55) * 14, y = 72 + Math.cos(f / 70) * 8;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(162deg, #5A0FCB 0%, #8B1AEB 38%, #B65CF4 70%, #E2B9FA 100%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at ${x}% ${y}%, rgba(255,214,255,.55), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(55% 35% at ${100 - x}% ${18 + Math.sin(f / 60) * 5}%, rgba(70,0,160,.45), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

// ── Câmera: o "mundo" é um plano grande; a câmera passeia por ele (com desfoque de movimento) ──
export type Chave = { f: number; x: number; y: number; s?: number; r?: number };
export function camEm(f: number, ks: Chave[]) {
  const fs = ks.map((k) => k.f) as number[];
  const g = (sel: (k: Chave) => number) => (ks.length === 1 ? sel(ks[0]) : interpolate(f, fs, ks.map(sel), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: io }));
  return { x: g((k) => k.x), y: g((k) => k.y), s: g((k) => k.s ?? 1), r: g((k) => k.r ?? 0) };
}
export const Camera: React.FC<{ ks: Chave[]; children: React.ReactNode; borrar?: boolean }> = ({ ks, children, borrar = true }) => {
  const f = useCurrentFrame();
  const c = camEm(f, ks), c2 = camEm(f + 1, ks);
  const v = Math.hypot((c2.x - c.x) * c.s, (c2.y - c.y) * c.s) + Math.abs(c2.s - c.s) * 900;
  const blur = borrar ? Math.min(7, Math.max(0, v - 8) / 9) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${c.s}) rotate(${c.r}deg) translate(${-c.x}px, ${-c.y}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ── Texto que surge do desfoque, palavra a palavra (*trecho* = cor de acento) ──
type Tok = { t: string; a: boolean; br?: boolean };
function tokens(texto: string): Tok[] {
  let em = false; const out: Tok[] = [];
  texto.split(/(\s+)/).forEach((p) => {
    if (!p.trim()) { if (p.includes('\n')) out.push({ t: '', a: false, br: true }); return; }
    let w = p; if (w.startsWith('*')) { em = true; w = w.slice(1); }
    const fecha = /\*[.,!?:]?$/.test(w); w = w.replace('*', '');
    out.push({ t: w, a: em }); if (fecha) em = false;
  });
  return out;
}
export const Texto: React.FC<{ t: string; ini: number; tam?: number; peso?: number; cor?: string; acento?: string; alinhar?: 'left' | 'center' | 'right'; largura?: number; passo?: number; fim?: number; linha?: number; style?: React.CSSProperties; fonte?: string; tracking?: number }> = ({ t, ini, tam = 80, peso = 700, cor = P.ink, acento = P.el, alinhar = 'center', largura = 940, passo = 3, fim, linha = 1.08, style, fonte = F, tracking = -0.03 }) => {
  const f = useCurrentFrame();
  const toks = tokens(t);
  let i = -1;
  return (
    <div style={{ width: largura, fontFamily: fonte, fontWeight: peso, fontSize: tam, lineHeight: linha, letterSpacing: `${tracking}em`, color: cor, textAlign: alinhar, display: 'flex', flexWrap: 'wrap', justifyContent: alinhar === 'center' ? 'center' : alinhar === 'right' ? 'flex-end' : 'flex-start', columnGap: tam * 0.26, ...style }}>
      {toks.map((w, k) => {
        if (w.br) return <div key={k} style={{ flexBasis: '100%', height: 0 }} />;
        i++;
        const p = lerp(f, ini + i * passo, ini + i * passo + 22, 0, 1);
        const q = fim === undefined ? 1 : lerp(f, fim - 14 + i * 1.2, fim - 2 + i * 1.2, 1, 0, entra);
        const o = Math.min(p, q);
        return (
          <span key={k} style={{ display: 'inline-block', color: w.a ? acento : cor, opacity: o, filter: o < 0.99 ? `blur(${(1 - o) * 16}px)` : undefined, transform: `translateY(${(1 - p) * tam * 0.4 - (1 - q) * tam * 0.25}px) scale(${0.94 + 0.06 * p})` }}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

// Letra por letra (r3: "Looking for a vacation?")
export const Letras: React.FC<{ t: string; ini: number; tam?: number; peso?: number; cor?: string; passo?: number; fim?: number; style?: React.CSSProperties }> = ({ t, ini, tam = 56, peso = 600, cor = P.ink, passo = 1.1, fim, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: F, fontWeight: peso, fontSize: tam, color: cor, whiteSpace: 'pre', letterSpacing: '-0.01em', ...style }}>
      {t.split('').map((ch, i) => {
        const p = lerp(f, ini + i * passo, ini + i * passo + 16, 0, 1);
        const q = fim === undefined ? 1 : lerp(f, fim - 12 + i * 0.4, fim + i * 0.4, 1, 0, entra);
        const o = Math.min(p, q);
        const dy = ((i * 37) % 7 - 3) * 6;
        return <span key={i} style={{ display: 'inline-block', opacity: o, filter: o < 0.99 ? `blur(${(1 - o) * 12}px)` : undefined, transform: `translateY(${(1 - p) * dy}px)` }}>{ch}</span>;
      })}
    </div>
  );
};

// ── Card branco com sombra macia ──
export const Card: React.FC<{ x: number; y: number; w: number; h?: number; ini: number; fim?: number; raio?: number; children?: React.ReactNode; style?: React.CSSProperties; de?: 'baixo' | 'escala' | 'giro' | 'nada'; vidro?: boolean; z?: number }> = ({ x, y, w, h, ini, fim, raio = 34, children, style, de = 'baixo', vidro = false, z }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, 30, { damping: 18, stiffness: 120, mass: 0.9 });
  const o = Math.min(1, s * 1.6) * saida(f, fim, 12);
  const q = 1 - saida(f, fim, 12);
  const tr = de === 'baixo' ? `translateY(${(1 - s) * 90 - q * 30}px) scale(${0.94 + 0.06 * s - q * 0.04})`
    : de === 'escala' ? `scale(${0.6 + 0.4 * s - q * 0.08})`
      : de === 'giro' ? `perspective(1400px) rotateX(${(1 - s) * 40}deg) translateY(${(1 - s) * 120}px) scale(${0.9 + 0.1 * s})` : 'none';
  if (o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: raio, background: vidro ? 'rgba(255,255,255,.72)' : P.branco, backdropFilter: vidro ? 'blur(14px)' : undefined, boxShadow: '0 2px 4px rgba(60,20,90,.04), 0 24px 60px -18px rgba(76,22,120,.28), 0 60px 120px -40px rgba(120,40,180,.25)', opacity: o, transform: tr, filter: o < 0.98 ? `blur(${(1 - o) * 10}px)` : undefined, zIndex: z, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
};

// Surge com desfoque (genérico)
export const Surge: React.FC<{ ini: number; fim?: number; dy?: number; escala?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ ini, fim, dy = 30, escala = 0.96, children, style }) => {
  const f = useCurrentFrame();
  const p = lerp(f, ini, ini + 20, 0, 1); const q = saida(f, fim, 12);
  const o = Math.min(p, q);
  if (o <= 0.001) return null;
  return <div style={{ opacity: o, filter: o < 0.99 ? `blur(${(1 - o) * 12}px)` : undefined, transform: `translateY(${(1 - p) * dy}px) scale(${escala + (1 - escala) * p})`, ...style }}>{children}</div>;
};

// ── Toque do dedo (círculo) que anda entre pontos e aperta ──
export const Toque: React.FC<{ ks: { f: number; x: number; y: number }[]; toques: number[]; ini: number; fim: number; claro?: boolean }> = ({ ks, toques, ini, fim, claro = false }) => {
  const f = useCurrentFrame();
  if (f < ini || f > fim + 10) return null;
  const x = chaves(f, ks.map((k) => [k.f, k.x]), Easing.bezier(0.45, 0, 0.2, 1));
  const y = chaves(f, ks.map((k) => [k.f, k.y]), Easing.bezier(0.45, 0, 0.2, 1));
  const o = Math.min(lerp(f, ini, ini + 8, 0, 1), lerp(f, fim, fim + 10, 1, 0));
  let aperta = 1; let ondas: React.ReactNode[] = [];
  toques.forEach((t, k) => {
    const d = f - t;
    if (d > -6 && d < 14) aperta = Math.min(aperta, interpolate(d, [-6, 0, 10], [1, 0.72, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    if (d >= 0 && d < 22) {
      const r = lerp(d, 0, 22, 30, 110);
      ondas.push(<div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `3px solid ${claro ? 'rgba(255,255,255,.8)' : 'rgba(182,0,246,.45)'}`, opacity: lerp(d, 0, 22, 1, 0) }} />);
    }
  });
  return (
    <>
      {ondas}
      <div style={{ position: 'absolute', left: x - 38, top: y - 38, width: 76, height: 76, borderRadius: 999, background: claro ? 'rgba(255,255,255,.55)' : 'rgba(27,19,34,.22)', border: `3px solid ${claro ? '#fff' : 'rgba(255,255,255,.95)'}`, boxShadow: '0 10px 30px -6px rgba(40,10,70,.4)', opacity: o, transform: `scale(${aperta})`, backdropFilter: 'blur(4px)' }} />
    </>
  );
};

// Botão que afunda quando tocado
export const Botao: React.FC<{ texto: string; em?: number; w?: number; h?: number; cor?: string; corTexto?: string; tam?: number; icone?: React.ReactNode; style?: React.CSSProperties; feito?: string }> = ({ texto, em = 99999, w, h = 96, cor = P.el, corTexto = '#fff', tam = 36, icone, style, feito }) => {
  const f = useCurrentFrame();
  const d = f - em;
  const s = interpolate(d, [-4, 2, 12], [1, 0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const brilho = d >= 0 && d < 16 ? lerp(d, 0, 16, 0.35, 0) : 0;
  const ok = feito && d > 8;
  return (
    <div style={{ width: w, height: h, borderRadius: 999, background: ok ? P.ok : cor, color: corTexto, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: F, fontWeight: 700, fontSize: tam, transform: `scale(${s})`, boxShadow: `0 16px 36px -14px ${cor}`, position: 'relative', overflow: 'hidden', ...style }}>
      {icone}{ok ? feito : texto}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: brilho }} />
    </div>
  );
};

// Digitação com cursor piscando
export const Digita: React.FC<{ t: string; ini: number; vel?: number; cor?: string; tam?: number; peso?: number; cursor?: boolean; quebra?: boolean }> = ({ t, ini, vel = 2, cor = P.ink, tam = 38, peso = 600, cursor = true, quebra = false }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(t.length, Math.floor((f - ini) / vel)));
  const fim = ini + t.length * vel;
  const pisca = f < fim || Math.floor(f / 8) % 2 === 0;
  return (
    <span style={{ fontFamily: F, fontWeight: peso, fontSize: tam, color: cor, whiteSpace: quebra ? 'pre-wrap' : 'pre', lineHeight: 1.3 }}>
      {t.slice(0, n)}
      {cursor && f >= ini - 10 && f < fim + 40 && <span style={{ display: 'inline-block', width: 3, height: tam * 1.05, background: P.el, marginLeft: 3, verticalAlign: 'middle', opacity: pisca ? 1 : 0 }} />}
    </span>
  );
};
export const teclas = (t: string, ini: number, vel = 2) => Array.from({ length: t.length }, (_, i) => (ini + i * vel) / 30).filter((_, i) => t[i] !== ' ');

// ── Check de sucesso ──
export const Check: React.FC<{ ini: number; tam?: number; cor?: string; fim?: number }> = ({ ini, tam = 150, cor = P.el, fim }) => {
  const f = useCurrentFrame();
  const s = molaViva(f, ini);
  const d = lerp(f, ini + 6, ini + 20, 0, 1);
  const anel = lerp(f, ini + 4, ini + 30, 0, 1);
  const o = saida(f, fim, 10);
  if (f < ini) return null;
  return (
    <div style={{ position: 'relative', width: tam, height: tam, opacity: o }}>
      <div style={{ position: 'absolute', inset: -tam * 0.5 * anel, borderRadius: 999, border: `${3 * (1 - anel) + 0.5}px solid ${cor}`, opacity: 1 - anel }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: cor, transform: `scale(${s})`, boxShadow: `0 20px 50px -14px ${cor}` }} />
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
        <path d="M29 52 L44 66 L72 36" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - d)} />
      </svg>
    </div>
  );
};

// ── Caminho com ponto viajando (r1) ──
export const Caminho: React.FC<{ d: string; prog: [number, number][]; cor?: string; largura?: number; base?: string; ponto?: boolean; brilho?: string }> = ({ d, prog, cor = P.ink, largura = 6, base = 'rgba(27,19,34,.10)', ponto = true, brilho = P.el }) => {
  const f = useCurrentFrame();
  const L = getLength(d);
  const p = chaves(f, prog, Easing.bezier(0.45, 0, 0.25, 1));
  const pt = getPointAtLength(d, Math.max(0.01, Math.min(L - 0.01, L * p)));
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
      <path d={d} fill="none" stroke={base} strokeWidth={largura * 0.6} strokeLinecap="round" />
      <path d={d} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeDasharray={`${L * p} ${L}`} />
      {ponto && p > 0.001 && (
        <>
          <circle cx={pt.x} cy={pt.y} r={34} fill={brilho} opacity={0.16} />
          <circle cx={pt.x} cy={pt.y} r={16} fill={brilho} />
          <circle cx={pt.x} cy={pt.y} r={6} fill="#fff" />
        </>
      )}
    </svg>
  );
};
export const pontoNo = (d: string, p: number) => { const L = getLength(d); return getPointAtLength(d, L * p); };

// ── Esfera brilhante (r2) ──
const ESF: Record<string, string[]> = {
  roxo: ['#FBEAFF', '#DC86FF', '#B600F6', '#6E04A3', '#38005A'],
  rosa: ['#FFFFFF', '#FFD6FF', '#FEA8FF', '#E264E8', '#A2279F'],
  vio: ['#EFE4FF', '#A877FF', '#7B2CF0', '#4512A8', '#22075C'],
  lilas: ['#FFFFFF', '#F4ECFF', '#D9C3F7', '#B497E0', '#7E5CB0'],
  branca: ['#FFFFFF', '#FFFFFF', '#F1ECF6', '#D3C8DE', '#A497B2'],
  ambar: ['#FFFBEA', '#FFE08A', '#F5A524', '#C46F06', '#7A3D00'],
  noite: ['#B9AEC4', '#4A3F54', '#1E1724', '#0E0A12', '#000000'],
};
export const Esfera: React.FC<{ x: number; y: number; r: number; cor?: keyof typeof ESF; sombra?: boolean; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, r, cor = 'roxo', sombra = true, style, children }) => {
  const c = ESF[cor];
  return (
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle at 34% 28%, ${c[0]} 0%, ${c[1]} 13%, ${c[2]} 42%, ${c[3]} 80%, ${c[4]} 100%)`, boxShadow: sombra ? `inset ${-r * 0.12}px ${-r * 0.16}px ${r * 0.35}px rgba(20,0,40,.28), inset ${r * 0.06}px ${r * 0.08}px ${r * 0.2}px rgba(255,255,255,.25), 0 ${r * 0.35}px ${r * 0.7}px -${r * 0.25}px rgba(80,10,130,.45)` : undefined, ...style }}>
      <div style={{ position: 'absolute', left: '20%', top: '13%', width: '28%', height: '17%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,0))', transform: 'rotate(-28deg)' }} />
      {children}
    </div>
  );
};

// ── Ícones (traço) ──
const IC: Record<string, React.ReactNode> = {
  busca: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  insta: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  pagina: <><rect x="5" y="2.8" width="14" height="18.4" rx="3" /><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" /></>,
  site: <><rect x="2.8" y="4.5" width="18.4" height="15" rx="2.5" /><path d="M2.8 9h18.4" /><circle cx="6" cy="6.8" r=".5" fill="currentColor" /><circle cx="8" cy="6.8" r=".5" fill="currentColor" /></>,
  whats: <><path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8c-1-.5-1.6-1.1-2.1-2.1l.8-1-1-2z" /></>,
  agenda: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="M9 14.5l2 2 4-4" /></>,
  estrela: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" />,
  pino: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  play: <><rect x="3" y="4.5" width="18" height="15" rx="4" /><path d="M10 9v6l5-3z" fill="currentColor" /></>,
  imagem: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M20.5 16l-5-5-8.5 8.5" /></>,
  chat: <><path d="M4.5 18.5V7a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3H8z" /><path d="M8.5 9.5h7M8.5 12.5h4.5" /></>,
  ia: <><path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z" /><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  raio: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  grafico: <><path d="M4 20V4M4 20h16" /><path d="M7.5 15l4-4 3 3 5-6" /></>,
  sino: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  pessoa: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  tesoura: <><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="17.5" r="2.5" /><path d="M8.5 8L20 18M8.5 16L20 6" /></>,
  motion: <><circle cx="8" cy="12" r="4.5" /><path d="M14.5 7.5c2 1 3.5 2.6 3.5 4.5s-1.5 3.5-3.5 4.5M18 5c3 1.7 4 4.2 4 7s-1 5.3-4 7" /></>,
  globo: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z" /></>,
  relogio: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  coracao: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  dente: <path d="M7.5 3.8c-2.5 0-4 2-3.6 5 .4 3 1.4 4.6 1.8 7.6.3 2.4 1.2 3.8 2.3 3.8 1.6 0 1.4-4.6 4-4.6s2.4 4.6 4 4.6c1.1 0 2-1.4 2.3-3.8.4-3 1.4-4.6 1.8-7.6.4-3-1.1-5-3.6-5-1.8 0-2.6 1-4.5 1s-2.7-1-4.5-1z" />,
};
export const Icone: React.FC<{ n: keyof typeof IC | string; tam?: number; cor?: string; traco?: number }> = ({ n, tam = 40, cor = 'currentColor', traco = 1.8 }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={traco} strokeLinecap="round" strokeLinejoin="round" style={{ color: cor, flex: 'none', display: 'block' }}>{IC[n as string]}</svg>
);

// Ícone dentro de pastilha arredondada
export const Pastilha: React.FC<{ n: string; tam?: number; fundo?: string; cor?: string; raio?: number }> = ({ n, tam = 96, fundo = P.lilas, cor = P.el, raio }) => (
  <div style={{ width: tam, height: tam, borderRadius: raio ?? tam * 0.3, background: fundo, display: 'grid', placeItems: 'center', flex: 'none' }}><Icone n={n} tam={tam * 0.5} cor={cor} traco={2} /></div>
);

// Etiqueta pequena (pill)
export const Etiqueta: React.FC<{ t: string; fundo?: string; cor?: string; tam?: number; icone?: string; style?: React.CSSProperties }> = ({ t, fundo = P.lilas, cor = P.prof, tam = 28, icone, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: tam * 0.35, padding: `${tam * 0.38}px ${tam * 0.75}px`, borderRadius: 999, background: fundo, color: cor, fontFamily: F, fontWeight: 700, fontSize: tam, whiteSpace: 'nowrap', ...style }}>
    {icone && <Icone n={icone} tam={tam * 1.1} cor={cor} traco={2.2} />}{t}
  </div>
);

// Estrelas de avaliação
export const Estrelas: React.FC<{ n?: number; tam?: number; ini?: number }> = ({ n = 5, tam = 30, ini }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', gap: tam * 0.12 }}>
      {Array.from({ length: n }, (_, i) => {
        const s = ini === undefined ? 1 : molaViva(f, ini + i * 3);
        return <svg key={i} width={tam} height={tam} viewBox="0 0 24 24" style={{ transform: `scale(${s})` }}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill={P.ambar} /></svg>;
      })}
    </div>
  );
};

// Contador numérico
export const Num: React.FC<{ de: number; ate: number; ini: number; dur?: number; casas?: number; sep?: string }> = ({ de, ate, ini, dur = 30, casas = 0, sep = ',' }) => {
  const f = useCurrentFrame();
  const v = lerp(f, ini, ini + dur, de, ate, Easing.bezier(0.2, 0.7, 0.2, 1));
  return <>{v.toFixed(casas).replace('.', sep)}</>;
};

// ── Assinatura discreta (canto) e fecho com o logo ──
export const Marca: React.FC<{ cor?: string; tam?: number }> = ({ cor = P.ink, tam = 34 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: tam * 0.4 }}>
    <div style={{ width: tam * 1.04, height: tam, background: cor === P.ink ? P.el : cor, WebkitMaskImage: `url(${staticFile('logo.png')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
    <span style={{ fontFamily: FD, fontWeight: 600, fontSize: tam * 0.74, letterSpacing: '0.3em', color: cor }}>TAVÍN</span>
    <span style={{ fontFamily: F, fontWeight: 600, fontSize: tam * 0.5, letterSpacing: '0.06em', color: cor, opacity: 0.6, marginLeft: -tam * 0.15 }}>digital</span>
  </div>
);

export const Fecho: React.FC<{ ini: number; frase: string; acao?: string; claro?: boolean }> = ({ ini, frase, acao = 'Chama no direct', claro = true }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, 30, { damping: 14, stiffness: 110, mass: 1 });
  const cor = claro ? P.ink : '#fff';
  const g = lerp(f, ini, ini + 40, 0, 1);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 640, width: 260, height: 260, left: 410, borderRadius: 999, background: `radial-gradient(circle, ${claro ? 'rgba(182,0,246,.22)' : 'rgba(255,255,255,.35)'}, transparent 70%)`, transform: `scale(${0.5 + g * 1.6})`, opacity: 1 - g * 0.4 }} />
      <div style={{ position: 'absolute', top: 690, width: 168, height: 160, left: 456, background: claro ? `linear-gradient(140deg, ${P.el}, ${P.vio})` : '#fff', WebkitMaskImage: `url(${staticFile('logo.png')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', transform: `scale(${s}) rotate(${(1 - s) * -40}deg)`, opacity: Math.min(1, s * 1.5), filter: s < 0.95 ? `blur(${(1 - s) * 14}px)` : undefined }} />
      <div style={{ position: 'absolute', top: 900, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Surge ini={ini + 10}><div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 64, letterSpacing: '0.32em', color: cor, marginRight: -20 }}>TAVÍN</span>
          <span style={{ fontFamily: F, fontWeight: 600, fontSize: 40, letterSpacing: '0.06em', color: cor, opacity: 0.6 }}>digital</span>
        </div></Surge>
      </div>
      <div style={{ position: 'absolute', top: 1010, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Texto t={frase} ini={ini + 18} tam={44} peso={600} cor={claro ? P.fg2 : 'rgba(255,255,255,.85)'} largura={860} passo={2} />
      </div>
      <div style={{ position: 'absolute', top: 1150, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Surge ini={ini + 34} dy={40}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 40px', borderRadius: 999, background: claro ? P.ink : '#fff', color: claro ? '#fff' : P.prof, fontFamily: F, fontWeight: 700, fontSize: 38, boxShadow: '0 24px 50px -20px rgba(40,10,70,.6)' }}>
            <Icone n="insta" tam={42} cor={claro ? '#fff' : P.prof} traco={2} /> {acao} · @tavindigital
          </div>
        </Surge>
      </div>
    </AbsoluteFill>
  );
};

// ── Legenda da narração: pílula branca, palavra falada em roxo ──
export const Legenda: React.FC<{ falas: { ini: number; fim: number; texto: string }[]; y?: number; esconder?: [number, number][] }> = ({ falas, y = 1500, esconder = [] }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = f / fps;
  if (esconder.some(([a, b]) => f >= a && f < b)) return null;
  const fala = falas.find((x) => t >= x.ini - 0.05 && t < x.fim + 0.25);
  if (!fala) return null;
  const palavras = fala.texto.split(' ');
  const pesos = palavras.map((p) => p.length + 2); const total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0; const tempos = pesos.map((p) => { const i = fala.ini + (acum / total) * (fala.fim - fala.ini); acum += p; return i; });
  let atual = 0; tempos.forEach((tt, i) => { if (t >= tt) atual = i; });
  // blocos por largura (~26 caracteres)
  const blocos: number[][] = []; let cur: number[] = []; let len = 0;
  palavras.forEach((p, i) => { if (len + p.length > 24 && cur.length) { blocos.push(cur); cur = []; len = 0; } cur.push(i); len += p.length + 1; });
  if (cur.length) blocos.push(cur);
  const bloco = blocos.find((b) => b.includes(atual)) || blocos[0];
  const desde = tempos[bloco[0]];
  const o = lerp(t, desde, desde + 0.12, 0, 1, sai);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 14, padding: '18px 34px', borderRadius: 26, background: 'rgba(255,255,255,.92)', boxShadow: '0 20px 50px -20px rgba(60,20,100,.45)', fontFamily: F, fontWeight: 700, fontSize: 50, letterSpacing: '-0.01em', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
        {bloco.map((k) => <span key={k} style={{ color: k === atual ? P.el : k < atual ? P.ink : P.fg3 }}>{palavras[k]}</span>)}
      </div>
    </div>
  );
};

// ── Celular claro (moldura branca), com a tela como filho ──
export const Fone: React.FC<{ w?: number; children?: React.ReactNode; style?: React.CSSProperties; escuro?: boolean }> = ({ w = 520, children, style, escuro = false }) => {
  const b = w * 0.03; const tela = w - b * 2; const h = tela * 2.1;
  return (
    <div style={{ width: w, height: h + b * 2, borderRadius: w * 0.14, background: escuro ? '#141016' : '#fff', padding: b, boxShadow: '0 0 0 2px rgba(120,90,150,.10), 0 40px 90px -30px rgba(76,22,120,.45), 0 90px 160px -60px rgba(120,40,180,.35)', ...style }}>
      <div style={{ position: 'relative', width: tela, height: h, borderRadius: w * 0.11, overflow: 'hidden', background: '#F3F1F5' }}>
        {children}
        <div style={{ position: 'absolute', top: tela * 0.03, left: '50%', width: tela * 0.28, height: tela * 0.075, marginLeft: -tela * 0.14, background: '#0d0b0f', borderRadius: 99, zIndex: 9 }} />
      </div>
    </div>
  );
};

// Balão de anotação com ícone (✓ ou ×)
export const Nota: React.FC<{ t: string; ini: number; fim?: number; bom?: boolean; style?: React.CSSProperties; tam?: number }> = ({ t, ini, fim, bom = true, style, tam = 36 }) => {
  const f = useCurrentFrame();
  const s = molaViva(f, ini); const o = Math.min(1, s * 1.4) * saida(f, fim, 10);
  if (f < ini) return null;
  const cor = bom ? P.el : '#E4475B';
  return (
    <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 14, padding: `${tam * 0.42}px ${tam * 0.8}px ${tam * 0.42}px ${tam * 0.42}px`, borderRadius: 999, background: '#fff', fontFamily: F, fontWeight: 700, fontSize: tam, color: P.ink, whiteSpace: 'nowrap', boxShadow: '0 22px 50px -18px rgba(76,22,120,.45)', transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`, opacity: o, filter: o < 0.95 ? `blur(${(1 - o) * 8}px)` : undefined, zIndex: 20, ...style }}>
      <span style={{ width: tam * 1.25, height: tam * 1.25, borderRadius: 999, background: cor, display: 'grid', placeItems: 'center' }}>
        <svg width={tam * 0.8} height={tam * 0.8} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">{bom ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M7 7l10 10M17 7L7 17" />}</svg>
      </span>
      {t}
    </div>
  );
};
