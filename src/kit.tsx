// Kit da Thata: claro + verde. Assinatura: o ponto verde do logo, que pulsa e vira tudo
// (notificação, onda de voz, check, íris de transição). Texto sobe por máscara (corte limpo, sem desfoque).
import React from 'react';
import { AbsoluteFill, Easing, continueRender, delayRender, getInputProps, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { NARRA } from './narra';

const CLARO = {
  fundo: '#F3F7F5', pontos: 'rgba(11,20,17,.11)', tela: '#FFFFFF', moldura: '#FBFDFC', papel: '#FFFFFF', ink: '#0B1411', fg: '#27342F', fg2: '#5D6C66', fg3: '#93A19B', linha: '#E2E8E5', linha2: '#D2DBD7',
  verde: '#15A763', vivo: '#1BC371', luz: '#5FE3A1', menta: '#E6F6EE', prof: '#0B7A47', noite: '#0A1411',
  alerta: '#E5484D', alertaSuave: '#FDECEC', ambar: '#C98512', ambarSuave: '#FCF2E1', bolhaIn: '#F1F5F3', sobreInk: '#FFFFFF', bolhaEu: '#15A763', humano: '#E3EAF2',
};
const ESCURO: typeof CLARO = {
  fundo: '#08110E', pontos: 'rgba(95,227,161,.10)', tela: '#0E1A16', moldura: '#16251F',
  papel: '#101C18', ink: '#EEF4F1', fg: '#CBD8D2', fg2: '#8FA29A', fg3: '#5E716A', linha: 'rgba(255,255,255,.08)', linha2: 'rgba(255,255,255,.16)',
  verde: '#1BC371', vivo: '#5FE3A1', luz: '#5FE3A1', menta: 'rgba(27,195,113,.16)', prof: '#5FE3A1', noite: '#0A1411',
  alerta: '#FF6B6B', alertaSuave: 'rgba(229,72,77,.16)', ambar: '#F2B457', ambarSuave: 'rgba(242,180,87,.14)', bolhaIn: '#18291F', sobreInk: '#08110E', bolhaEu: '#0F8A4F', humano: '#26333D',
};
export const C = { ...CLARO };
export const escuro = () => C.fundo === ESCURO.fundo;
// cada composição chama no topo: o tema vale para todos os componentes do kit
export const usaTema = (t: 'claro' | 'escuro') => { Object.assign(C, t === 'escuro' ? ESCURO : CLARO); };
export const G = 'Geist, sans-serif';
export const M = '"Geist Mono", monospace';

const FONTES: [string, string, string][] = [
  ['Geist', 'Geist-Regular', '400'], ['Geist', 'Geist-Medium', '500'], ['Geist', 'Geist-SemiBold', '600'], ['Geist', 'Geist-Bold', '700'],
  ['Geist Mono', 'GeistMono-Regular', '400'], ['Geist Mono', 'GeistMono-Medium', '500'],
];
if (typeof window !== 'undefined' && !(window as any).__fontesThata) {
  (window as any).__fontesThata = true;
  const h = delayRender('fontes');
  Promise.all(FONTES.map(([f, arq, w]) => new FontFace(f, `url(${staticFile(`fonts/${arq}.woff2`)})`, { weight: w }).load().then((ff) => (document as any).fonts.add(ff))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}

export const io = Easing.bezier(0.65, 0, 0.35, 1);
export const sai = Easing.bezier(0.16, 1, 0.3, 1);
export const entra = Easing.bezier(0.55, 0, 0.8, 0.2);
export const lerp = (f: number, a: number, b: number, x: number, y: number, e = sai) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const chaves = (f: number, ks: [number, number][], e = io) =>
  ks.length === 1 ? ks[0][1] : interpolate(f, ks.map((k) => k[0]), ks.map((k) => k[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const mola = (f: number, ini: number, cfg: any = { damping: 16, stiffness: 140, mass: 0.8 }) => spring({ frame: f - ini, fps: 30, config: cfg });
export const molaViva = (f: number, ini: number) => spring({ frame: f - ini, fps: 30, config: { damping: 10, stiffness: 170, mass: 0.6 } });
export const saida = (f: number, fim?: number, dur = 10) => (fim === undefined ? 1 : lerp(f, fim - dur, fim, 1, 0, entra));

// ── Fundo: papel milimetrado claro + brilho verde que segue o ponto ──
export const Fundo: React.FC<{ gx?: number; gy?: number; brilho?: number; grade?: number; cor?: string }> = ({ gx = 540, gy = 960, brilho = 1, grade = 1, cor = C.fundo }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: cor, overflow: 'hidden' }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${C.pontos} 1.6px, transparent 1.8px)`, backgroundSize: '44px 44px', backgroundPosition: `${(f * 0.15) % 44}px 0px`, opacity: grade }} />
      <div style={{ position: 'absolute', left: gx - 700, top: gy - 700, width: 1400, height: 1400, borderRadius: '50%', background: escuro() ? 'radial-gradient(circle, rgba(27,195,113,.30), rgba(27,195,113,.08) 38%, transparent 66%)' : 'radial-gradient(circle, rgba(95,227,161,.38), rgba(95,227,161,.10) 38%, transparent 66%)', opacity: brilho, transform: `scale(${1 + Math.sin(f / 40) * 0.04})` }} />
      <div style={{ position: 'absolute', left: -300 + Math.sin(f / 70) * 40, top: 1500, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,195,113,.12), transparent 62%)' }} />
    </AbsoluteFill>
  );
};

// ── O ponto (assinatura) ──
export const Ponto: React.FC<{ x: number; y: number; r?: number; pulso?: boolean; cor?: string; o?: number }> = ({ x, y, r = 22, pulso = true, cor = C.verde, o = 1 }) => {
  const f = useCurrentFrame();
  const fase = (f % 45) / 45;
  return (
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: o }}>
      {pulso && <div style={{ position: 'absolute', inset: -r * 1.6 * fase, borderRadius: '50%', background: cor, opacity: 0.28 * (1 - fase) }} />}
      <div style={{ position: 'absolute', inset: -r * 0.55, borderRadius: '50%', background: cor, opacity: 0.16 }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${C.luz}, ${cor} 60%, ${C.prof})`, boxShadow: `0 ${r * 0.5}px ${r * 1.4}px -${r * 0.3}px rgba(21,167,99,.55)` }} />
    </div>
  );
};

// ── Íris: o ponto cresce e cobre a tela (troca de cena / virada) ──
export const Iris: React.FC<{ x: number; y: number; ini: number; fim: number; cor?: string; volta?: boolean }> = ({ x, y, ini, fim, cor = C.verde, volta = true }) => {
  const f = useCurrentFrame();
  if (f < ini || f > fim) return null;
  const meio = ini + (fim - ini) * 0.5;
  const r = f < meio ? lerp(f, ini, meio, 0, 2400, Easing.bezier(0.7, 0, 0.84, 0)) : volta ? lerp(f, meio, fim, 2400, 0, Easing.bezier(0.16, 1, 0.3, 1)) : 2400;
  return <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: cor, zIndex: 50 }} />;
};

// ── Texto por máscara: cada linha sobe de baixo de um corte; *trecho* em verde ──
type Tok = { t: string; a: boolean };
function linhas(texto: string): Tok[][] {
  return texto.split('\n').map((ln) => {
    let em = false; const out: Tok[] = [];
    ln.split(/\s+/).filter(Boolean).forEach((w) => {
      if (w.startsWith('*')) { em = true; w = w.slice(1); }
      const fecha = /\*[.,!?:]?$/.test(w); w = w.replace('*', '');
      out.push({ t: w, a: em }); if (fecha) em = false;
    });
    return out;
  });
}
export const Titulo: React.FC<{ t: string; ini: number; fim?: number; tam?: number; peso?: number; cor?: string; acento?: string; alinhar?: 'left' | 'center'; passo?: number; linha?: number; style?: React.CSSProperties; tracking?: number; fonte?: string }> = ({ t, ini, fim, tam = 96, peso = 600, cor = C.ink, acento = C.verde, alinhar = 'center', passo = 4, linha = 1.04, style, tracking = -0.045, fonte = G }) => {
  const f = useCurrentFrame();
  const ls = linhas(t);
  let k = -1;
  return (
    <div style={{ fontFamily: fonte, fontWeight: peso, fontSize: tam, letterSpacing: `${tracking}em`, lineHeight: linha, color: cor, textAlign: alinhar, ...style }}>
      {ls.map((ln, i) => (
        <div key={i} style={{ overflow: 'hidden', paddingBottom: tam * 0.12, marginBottom: -tam * 0.12, display: 'flex', justifyContent: alinhar === 'center' ? 'center' : 'flex-start', gap: tam * 0.24 }}>
          {ln.map((w, j) => {
            k++;
            const p = lerp(f, ini + k * passo, ini + k * passo + 18, 0, 1, Easing.bezier(0.2, 0.9, 0.25, 1));
            const q = fim === undefined ? 0 : lerp(f, fim - 12 + i * 2, fim + i * 2, 0, 1, entra);
            return <span key={j} style={{ display: 'inline-block', color: w.a ? acento : cor, transform: `translateY(${(1 - p) * 110 - q * 110}%)` }}>{w.t}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// Linha mono pequena (hora, rótulo de contexto)
export const Mono: React.FC<{ t: string; ini: number; fim?: number; tam?: number; cor?: string; style?: React.CSSProperties }> = ({ t, ini, fim, tam = 34, cor = C.fg2, style }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(t.length, Math.floor((f - ini) / 1.2)));
  const o = saida(f, fim, 8);
  return <div style={{ fontFamily: M, fontWeight: 500, fontSize: tam, color: cor, letterSpacing: '0.02em', whiteSpace: 'pre', opacity: o, ...style }}>{t.slice(0, n)}{f >= ini && n < t.length && <span style={{ color: C.verde }}>▌</span>}</div>;
};

// ── Câmera contínua sobre um "mundo" 1080x1920 ──
export type Chave = { f: number; x: number; y: number; s?: number; r?: number };
export function camEm(f: number, ks: Chave[]) {
  const fs = ks.map((k) => k.f);
  const g = (sel: (k: Chave) => number) => (ks.length === 1 ? sel(ks[0]) : interpolate(f, fs, ks.map(sel), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: io }));
  return { x: g((k) => k.x), y: g((k) => k.y), s: g((k) => k.s ?? 1), r: g((k) => k.r ?? 0) };
}
export const Camera: React.FC<{ ks: Chave[]; children: React.ReactNode; borrar?: boolean }> = ({ ks, children, borrar = true }) => {
  const f = useCurrentFrame();
  const c = camEm(f, ks), c2 = camEm(f + 1, ks);
  const v = Math.hypot((c2.x - c.x) * c.s, (c2.y - c.y) * c.s) + Math.abs(c2.s - c.s) * 700;
  const blur = borrar ? Math.min(6, Math.max(0, v - 10) / 10) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${c.s}) rotate(${c.r}deg) translate(${-c.x}px, ${-c.y}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ── Superfícies ──
export const sombra = '0 1px 2px rgba(11,20,17,.05), 0 24px 50px -24px rgba(11,20,17,.28), 0 70px 120px -60px rgba(21,167,99,.28)';
export const Cartao: React.FC<{ x: number; y: number; w: number; h?: number; ini: number; fim?: number; raio?: number; children?: React.ReactNode; style?: React.CSSProperties; de?: 'baixo' | 'escala' | 'nada'; z?: number }> = ({ x, y, w, h, ini, fim, raio = 36, children, style, de = 'baixo', z }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, { damping: 18, stiffness: 130, mass: 0.9 });
  const o = Math.min(1, s * 1.8) * saida(f, fim, 10);
  if (o <= 0.001) return null;
  const tr = de === 'baixo' ? `translateY(${(1 - s) * 80}px)` : de === 'escala' ? `scale(${0.7 + 0.3 * s})` : 'none';
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: raio, background: C.papel, boxShadow: sombra, border: `1.5px solid ${C.linha}`, opacity: o, transform: tr, zIndex: z, overflow: 'hidden', ...style }}>{children}</div>;
};

export const Surge: React.FC<{ ini: number; fim?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ ini, fim, dy = 30, children, style }) => {
  const f = useCurrentFrame();
  const p = mola(f, ini, { damping: 17, stiffness: 150, mass: 0.7 }); const q = saida(f, fim, 10);
  const o = Math.min(1, p * 1.6) * q;
  if (o <= 0.001) return null;
  return <div style={{ opacity: o, transform: `translateY(${(1 - p) * dy}px) scale(${0.96 + 0.04 * p})`, ...style }}>{children}</div>;
};

// ── Celular claro ──
export const Fone: React.FC<{ w?: number; children?: React.ReactNode; style?: React.CSSProperties; tela?: string }> = ({ w = 560, children, style, tela }) => {
  const b = w * 0.028; const tw = w - b * 2; const h = tw * 2.1;
  return (
    <div style={{ width: w, height: h + b * 2, borderRadius: w * 0.15, background: C.moldura, padding: b, boxShadow: `0 0 0 2px ${C.linha2}, 0 50px 100px -40px rgba(11,20,17,.45), 0 100px 160px -70px rgba(21,167,99,.4)`, ...style }}>
      <div style={{ position: 'relative', width: tw, height: h, borderRadius: w * 0.12, overflow: 'hidden', background: tela || C.tela }}>
        {children}
        <div style={{ position: 'absolute', top: tw * 0.032, left: '50%', width: tw * 0.27, height: tw * 0.074, marginLeft: -tw * 0.135, background: '#05090A', borderRadius: 99, zIndex: 9 }} />
      </div>
    </div>
  );
};

// Cabeçalho de conversa (genérico, não é o app oficial)
export const TopoChat: React.FC<{ nome: string; sub?: string; w: number; cor?: string }> = ({ nome, sub = 'online', w, cor = C.verde }) => (
  <div style={{ height: w * 0.29, padding: `${w * 0.13}px ${w * 0.05}px 0`, display: 'flex', alignItems: 'center', gap: w * 0.03, borderBottom: `1.5px solid ${C.linha}`, background: C.papel }}>
    <div style={{ width: w * 0.11, height: w * 0.11, borderRadius: '50%', background: C.menta, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: w * 0.05, color: cor }}>{nome[0]}</div>
    <div>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: w * 0.045, color: C.ink, letterSpacing: '-0.02em' }}>{nome}</div>
      <div style={{ fontFamily: G, fontWeight: 500, fontSize: w * 0.032, color: C.verde }}>{sub}</div>
    </div>
  </div>
);

// Balão de conversa: nasce da quina, com hora em mono
export const Bolha: React.FC<{ t: string; ini: number; eu?: boolean; hora?: string; tam?: number; max?: number; fim?: number; ia?: boolean; humano?: string }> = ({ t, ini, eu = false, hora, tam = 30, max = 400, fim, ia = false, humano }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = molaViva(f, ini); const o = Math.min(1, s * 2) * saida(f, fim, 8);
  return (
    <div style={{ display: 'flex', justifyContent: eu ? 'flex-end' : 'flex-start', opacity: o }}>
      <div style={{ maxWidth: max, padding: `${tam * 0.5}px ${tam * 0.68}px ${tam * 0.36}px`, borderRadius: tam * 0.8, borderBottomRightRadius: eu ? tam * 0.18 : tam * 0.8, borderBottomLeftRadius: eu ? tam * 0.8 : tam * 0.18,
        background: humano ? C.humano : eu ? C.bolhaEu : C.bolhaIn, color: eu && !humano ? '#fff' : C.ink, fontFamily: G, fontWeight: 500, fontSize: tam, lineHeight: 1.28, letterSpacing: '-0.01em',
        transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: eu ? '100% 100%' : '0% 100%', boxShadow: eu ? '0 10px 24px -14px rgba(21,167,99,.8)' : 'none' }}>
        {ia && <div style={{ fontFamily: M, fontSize: tam * 0.56, color: eu ? 'rgba(255,255,255,.75)' : C.verde, marginBottom: 4 }}>● Thata · IA</div>}
        {humano && <div style={{ fontFamily: M, fontSize: tam * 0.56, color: C.fg2, marginBottom: 4 }}>{humano}</div>}
        {t}
        {hora && <div style={{ fontFamily: M, fontSize: tam * 0.5, opacity: 0.6, textAlign: 'right', marginTop: 4 }}>{hora}</div>}
      </div>
    </div>
  );
};

export const Digitando: React.FC<{ ini: number; fim: number; tam?: number; eu?: boolean }> = ({ ini, fim, tam = 30, eu = false }) => {
  const f = useCurrentFrame();
  if (f < ini || f >= fim) return null;
  return (
    <div style={{ display: 'flex', justifyContent: eu ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', gap: tam * 0.25, padding: `${tam * 0.55}px ${tam * 0.7}px`, borderRadius: tam * 0.8, background: eu ? C.menta : C.bolhaIn }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: tam * 0.32, height: tam * 0.32, borderRadius: 99, background: eu ? C.verde : C.fg3, transform: `translateY(${Math.sin((f - ini) / 3.2 - i * 0.9) * tam * 0.12}px)`, opacity: 0.5 + 0.5 * Math.max(0, Math.sin((f - ini) / 3.2 - i * 0.9)) }} />)}
      </div>
    </div>
  );
};

// Onda de voz (barras arredondadas)
export const Onda: React.FC<{ w: number; h: number; n?: number; nivel?: number; cor?: string; semente?: number }> = ({ w, h, n = 28, nivel = 1, cor = C.verde, semente = 0 }) => {
  const f = useCurrentFrame();
  const bw = w / n * 0.55;
  return (
    <div style={{ width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {Array.from({ length: n }, (_, i) => {
        const env = Math.sin((i / (n - 1)) * Math.PI) ** 0.8;
        const v = 0.18 + 0.82 * Math.abs(Math.sin(f / 4.1 + i * 0.7 + semente) * Math.sin(f / 7.3 + i * 0.31 + semente * 2));
        const hh = Math.max(bw, h * env * v * nivel);
        return <div key={i} style={{ width: bw, height: hh, borderRadius: bw, background: cor }} />;
      })}
    </div>
  );
};

// Toque do dedo
export const Toque: React.FC<{ ks: { f: number; x: number; y: number }[]; toques: number[]; ini: number; fim: number }> = ({ ks, toques, ini, fim }) => {
  const f = useCurrentFrame();
  if (f < ini || f > fim + 10) return null;
  const x = chaves(f, ks.map((k) => [k.f, k.x]), Easing.bezier(0.45, 0, 0.2, 1));
  const y = chaves(f, ks.map((k) => [k.f, k.y]), Easing.bezier(0.45, 0, 0.2, 1));
  const o = Math.min(lerp(f, ini, ini + 8, 0, 1), lerp(f, fim, fim + 10, 1, 0));
  let aperta = 1; const ondas: React.ReactNode[] = [];
  toques.forEach((t, k) => {
    const d = f - t;
    if (d > -6 && d < 14) aperta = Math.min(aperta, interpolate(d, [-6, 0, 10], [1, 0.72, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    if (d >= 0 && d < 22) { const r = lerp(d, 0, 22, 30, 110); ondas.push(<div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `3px solid rgba(21,167,99,.5)`, opacity: lerp(d, 0, 22, 1, 0), zIndex: 40 }} />); }
  });
  return (<>{ondas}<div style={{ position: 'absolute', left: x - 36, top: y - 36, width: 72, height: 72, borderRadius: 999, background: 'rgba(11,20,17,.16)', border: '3px solid #fff', boxShadow: '0 10px 30px -6px rgba(11,20,17,.4)', opacity: o, transform: `scale(${aperta})`, zIndex: 40 }} /></>);
};

// Check de sucesso
export const Check: React.FC<{ ini: number; tam?: number; cor?: string; fim?: number }> = ({ ini, tam = 150, cor = C.verde, fim }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = molaViva(f, ini); const d = lerp(f, ini + 5, ini + 18, 0, 1); const anel = lerp(f, ini + 3, ini + 28, 0, 1);
  return (
    <div style={{ position: 'relative', width: tam, height: tam, opacity: saida(f, fim, 10) }}>
      <div style={{ position: 'absolute', inset: -tam * 0.5 * anel, borderRadius: 999, border: `${3 * (1 - anel) + 0.5}px solid ${cor}`, opacity: 1 - anel }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: cor, transform: `scale(${s})`, boxShadow: `0 20px 50px -14px ${cor}` }} />
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}><path d="M29 52 L44 66 L72 36" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - d)} /></svg>
    </div>
  );
};

export const Num: React.FC<{ de: number; ate: number; ini: number; dur?: number }> = ({ de, ate, ini, dur = 30 }) => {
  const f = useCurrentFrame();
  return <>{Math.round(lerp(f, ini, ini + dur, de, ate, Easing.bezier(0.2, 0.7, 0.2, 1))).toLocaleString('pt-BR')}</>;
};

// Ícones de traço
const IC: Record<string, React.ReactNode> = {
  fone: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />,
  chat: <><path d="M4.5 18.5V7a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3H8z" /><path d="M8.5 9.5h7M8.5 12.5h4.5" /></>,
  agenda: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  relogio: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  lua: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  pessoa: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  sino: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  x: <path d="M7 7l10 10M17 7L7 17" />,
  ok: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  volta: <><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v4.5h4.5" /></>,
  arquivo: <><rect x="3.5" y="4" width="17" height="5" rx="1.5" /><path d="M5 9v9.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" /></>,
  mao: <path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7a7 7 0 0 1-7 7 6 6 0 0 1-5-2.7L3.5 14a1.5 1.5 0 0 1 2.4-1.8L8 15" />,
  insta: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /></>,
};
export const Icone: React.FC<{ n: string; tam?: number; cor?: string; traco?: number }> = ({ n, tam = 40, cor = 'currentColor', traco = 1.9 }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={traco} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', display: 'block' }}>{IC[n]}</svg>
);

export const Selo: React.FC<{ t: string; icone?: string; fundo?: string; cor?: string; tam?: number; style?: React.CSSProperties }> = ({ t, icone, fundo = C.menta, cor = C.prof, tam = 30, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: tam * 0.35, padding: `${tam * 0.36}px ${tam * 0.72}px`, borderRadius: 999, background: fundo, color: cor, fontFamily: G, fontWeight: 600, fontSize: tam, letterSpacing: '-0.01em', whiteSpace: 'nowrap', ...style }}>
    {icone && <Icone n={icone} tam={tam * 1.05} cor={cor} traco={2.2} />}{t}
  </div>
);

// ── Marca: ponto + "thata AI" ──
export const Marca: React.FC<{ tam?: number; cor?: string }> = ({ tam = 40, cor = C.ink }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: tam * 0.32, fontFamily: G, fontWeight: 500, fontSize: tam, letterSpacing: '-0.03em', color: cor }}>
    <div style={{ position: 'relative', width: tam * 0.42, height: tam * 0.42 }}>
      <div style={{ position: 'absolute', inset: -tam * 0.14, borderRadius: '50%', background: C.verde, opacity: 0.2 }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.verde }} />
    </div>
    thata <span style={{ color: C.verde }}>AI</span>
  </div>
);

// Fecho: o ponto cai no centro, abre a marca, frase e endereço
export const Fecho: React.FC<{ ini: number; frase: string; sub?: string }> = ({ ini, frase, sub = 'thata.online' }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, { damping: 12, stiffness: 120, mass: 0.9 });
  const abre = lerp(f, ini + 14, ini + 34, 0, 1, Easing.bezier(0.2, 0.9, 0.25, 1));
  return (
    <AbsoluteFill>
      <Fundo gy={820} brilho={lerp(f, ini, ini + 30, 0, 1)} />
      <div style={{ position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.4 + 0.6 * s})`, opacity: Math.min(1, s * 2) }}>
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: G, fontWeight: 500, fontSize: 120, letterSpacing: '-0.045em', color: C.ink }}>
            <div style={{ position: 'relative', width: 52, height: 52, marginRight: 40 * abre + 0 }}>
              <div style={{ position: 'absolute', inset: -16 - Math.sin(f / 8) * 3, borderRadius: '50%', background: C.verde, opacity: 0.2 }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${C.luz}, ${C.verde} 60%)` }} />
            </div>
            <div style={{ overflow: 'hidden', maxWidth: 520 * abre, whiteSpace: 'nowrap' }}>thata <span style={{ color: C.verde }}>AI</span></div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 960, left: 60, right: 60 }}>
        <Titulo t={frase} ini={ini + 26} tam={58} peso={500} cor={C.fg2} acento={C.ink} tracking={-0.03} passo={2} />
      </div>
      <div style={{ position: 'absolute', top: 1160, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Surge ini={ini + 42} dy={40}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 44px', borderRadius: 999, background: C.ink, color: C.sobreInk, fontFamily: G, fontWeight: 500, fontSize: 40, letterSpacing: '-0.02em', boxShadow: '0 24px 50px -20px rgba(11,20,17,.6)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 99, background: C.luz, boxShadow: `0 0 0 ${6 + Math.sin(f / 6) * 3}px rgba(95,227,161,.25)` }} />{sub}
          </div>
        </Surge>
      </div>
    </AbsoluteFill>
  );
};

// ── Conversa roteirizada num celular: [texto, quadro, de quem, extras] ──
export type Msg = { t?: string; f: number; eu?: boolean; hora?: string; ia?: boolean; audio?: string; local?: string; fim?: number; nota?: string; humano?: string };
export const BolhaAudio: React.FC<{ ini: number; dur: string; eu?: boolean; w?: number; tocando?: [number, number]; hora?: string }> = ({ ini, dur, eu = false, w = 420, tocando, hora }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = molaViva(f, ini);
  const prog = tocando ? lerp(f, tocando[0], tocando[1], 0, 1, (x) => x) : 0;
  const n = 34;
  return (
    <div style={{ display: 'flex', justifyContent: eu ? 'flex-end' : 'flex-start', opacity: Math.min(1, s * 2) }}>
      <div style={{ width: w, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 26, borderBottomLeftRadius: eu ? 26 : 6, borderBottomRightRadius: eu ? 6 : 26, background: eu ? C.bolhaEu : C.bolhaIn, transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: eu ? '100% 100%' : '0% 100%' }}>
        <div style={{ width: 52, height: 52, borderRadius: 99, background: eu ? 'rgba(255,255,255,.22)' : C.menta, display: 'grid', placeItems: 'center', flex: 'none' }}>
          <svg width={22} height={22} viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill={eu ? '#fff' : C.verde} /></svg>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, height: 44 }}>
          {Array.from({ length: n }, (_, i) => {
            const h = 8 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 34;
            const on = i / n < prog;
            return <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: eu ? (on ? '#fff' : 'rgba(255,255,255,.45)') : on ? C.verde : C.fg3 }} />;
          })}
        </div>
        <div style={{ fontFamily: M, fontSize: 22, color: eu ? 'rgba(255,255,255,.85)' : C.fg2 }}>{dur}{hora ? <div style={{ fontSize: 17, opacity: 0.7 }}>{hora}</div> : null}</div>
      </div>
    </div>
  );
};
export const Conversa: React.FC<{ w?: number; nome: string; sub?: string; msgs: Msg[]; tam?: number; digita?: number; children?: React.ReactNode }> = ({ w = 620, nome, sub, msgs, tam = 30, digita = 22, children }) => {
  const f = useCurrentFrame();
  return (
    <Fone w={w}>
      <TopoChat nome={nome} sub={sub} w={w - 34} />
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {msgs.map((m, k) => (m.fim !== undefined && f >= m.fim ? null : (
          <React.Fragment key={k}>
            {m.eu && !m.audio && !m.local && <Digitando ini={m.f - digita} fim={m.f} eu tam={tam * 0.9} />}
            {m.audio ? <BolhaAudio ini={m.f} dur={m.audio} eu={m.eu} w={w * 0.72} hora={m.hora} tocando={m.nota ? (m.nota.split(',').map(Number) as [number, number]) : undefined} />
              : m.local ? <Local ini={m.f} t={m.local} eu={m.eu} w={w * 0.74} />
                : <Bolha t={m.t || ''} ini={m.f} eu={m.eu} ia={m.ia} humano={m.humano} hora={m.hora} tam={tam} max={w * 0.76} />}
          </React.Fragment>
        )))}
      </div>
      {children}
    </Fone>
  );
};
export const Local: React.FC<{ ini: number; t: string; eu?: boolean; w?: number }> = ({ ini, t, eu = true, w = 440 }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = molaViva(f, ini);
  return (
    <div style={{ display: 'flex', justifyContent: eu ? 'flex-end' : 'flex-start', opacity: Math.min(1, s * 2) }}>
      <div style={{ width: w, borderRadius: 26, overflow: 'hidden', background: eu ? C.bolhaEu : C.bolhaIn, transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: '100% 100%' }}>
        <div style={{ height: 190, position: 'relative', background: escuro() ? '#13241D' : '#E4EFE9', backgroundImage: `linear-gradient(90deg, transparent 46%, ${escuro() ? '#1E3329' : '#fff'} 46% 54%, transparent 54%), linear-gradient(0deg, transparent 40%, ${escuro() ? '#1E3329' : '#fff'} 40% 50%, transparent 50%)`, backgroundSize: '120px 100%, 100% 90px' }}>
          <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-100%)' }}>
            <svg width={56} height={70} viewBox="0 0 24 30"><path d="M12 29s-10-9-10-17a10 10 0 0 1 20 0c0 8-10 17-10 17z" fill={C.alerta} /><circle cx="12" cy="12" r="4" fill="#fff" /></svg>
          </div>
        </div>
        <div style={{ padding: '14px 20px', fontFamily: G, fontWeight: 500, fontSize: 26, color: eu ? '#fff' : C.ink }}>{t}</div>
      </div>
    </div>
  );
};

// ════════ Kit "estúdio" (referências: legenda cinética, palavra-fantasma, objetos 3D, número grande, linhas que convergem) ════════

// Legenda cinética: frases [início, fim, texto]; a palavra da vez ganha uma pílula
export const Legenda: React.FC<{ frases: [number, number, string][]; y?: number; tam?: number }> = ({ frases, y = 1560, tam = 46 }) => {
  const f = useCurrentFrame();
  const fr = frases.find(([a, b]) => f >= a && f < b);
  if (!fr) return null;
  const [a, b, t] = fr;
  const ps = t.split(' ');
  const pos = Math.min(ps.length - 1, Math.floor(((f - a) / Math.max(1, b - a - 6)) * ps.length));
  // blocos de até 4 palavras
  const ini = Math.floor(pos / 4) * 4;
  const bloco = ps.slice(ini, ini + 4);
  const o = Math.min(lerp(f, a, a + 4, 0, 1), saida(f, b, 4));
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: y, display: 'flex', justifyContent: 'center', gap: tam * 0.22, flexWrap: 'wrap', opacity: o, fontFamily: G, fontWeight: 600, fontSize: tam, letterSpacing: '-0.02em', zIndex: 60 }}>
      {bloco.map((w, i) => {
        const k = ini + i;
        const ativo = k === pos;
        const lido = k < pos;
        return (
          <span key={k} style={{ padding: `${tam * 0.06}px ${tam * 0.22}px`, borderRadius: tam * 0.3, background: ativo ? (escuro() ? C.verde : C.ink) : 'transparent', color: ativo ? (escuro() ? '#06100C' : '#fff') : lido ? C.ink : C.fg3, transform: `scale(${ativo ? 1.06 : 1})`, transition: 'none' }}>{w}</span>
        );
      })}
    </div>
  );
};

// Palavra gigante e fantasma ao fundo, que corre devagar
export const Fantasma: React.FC<{ t: string; ini: number; fim?: number; y?: number; tam?: number; vel?: number }> = ({ t, ini, fim, y = 780, tam = 340, vel = 1.2 }) => {
  const f = useCurrentFrame();
  if (f < ini - 2 || (fim !== undefined && f > fim + 2)) return null;
  const o = Math.min(lerp(f, ini, ini + 10, 0, 1), saida(f, fim, 10));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, overflow: 'hidden', opacity: o, pointerEvents: 'none' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: G, fontWeight: 700, fontSize: tam, letterSpacing: '-0.06em', lineHeight: 1, color: escuro() ? 'rgba(238,244,241,.05)' : 'rgba(11,20,17,.06)', transform: `translateX(${-((f - ini) * vel) % (tam * t.length * 0.6)}px)` }}>
        {`${t} ${t} ${t} ${t}`}
      </div>
    </div>
  );
};

// Objeto "3D": ladrilho brilhante com ícone, perspectiva, reflexo e sombra
export const Obj3D: React.FC<{ x: number; y: number; tam?: number; ini: number; fim?: number; icone?: string; cor?: [string, string]; rx?: number; ry?: number; flutua?: number; children?: React.ReactNode; raio?: number }> = ({ x, y, tam = 220, ini, fim, icone, cor = ['#3BE08E', '#0B7A47'], rx = 14, ry = -18, flutua = 1, children, raio }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = spring({ frame: f - ini, fps: 30, config: { damping: 12, stiffness: 120, mass: 0.9 } });
  const o = Math.min(1, s * 2) * saida(f, fim, 8);
  const fl = Math.sin((f - ini) / 22) * 10 * flutua;
  const gira = (1 - s) * 70;
  return (
    <div style={{ position: 'absolute', left: x - tam / 2, top: y - tam / 2 + fl, width: tam, height: tam, perspective: 900, opacity: o, zIndex: 20 }}>
      <div style={{ position: 'absolute', left: tam * 0.08, right: tam * 0.08, bottom: -tam * 0.22 - fl, height: tam * 0.16, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,.28), transparent)', filter: 'blur(6px)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: raio ?? tam * 0.26, transform: `rotateX(${rx + gira * 0.3}deg) rotateY(${ry + gira}deg) scale(${0.5 + 0.5 * s})`, background: `linear-gradient(145deg, ${cor[0]}, ${cor[1]})`, boxShadow: `inset 0 ${tam * 0.04}px ${tam * 0.06}px rgba(255,255,255,.45), inset 0 -${tam * 0.06}px ${tam * 0.1}px rgba(0,0,0,.25), 0 ${tam * 0.2}px ${tam * 0.35}px -${tam * 0.12}px rgba(11,40,25,.55)`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '-30%', top: '-60%', width: '90%', height: '120%', background: 'linear-gradient(120deg, rgba(255,255,255,.55), rgba(255,255,255,0) 60%)', transform: 'rotate(20deg)' }} />
        {icone && <Icone n={icone} tam={tam * 0.46} cor="#fff" traco={2.4} />}
        {children}
      </div>
    </div>
  );
};

// Número grande que conta com desfoque de movimento
export const NumGrande: React.FC<{ de: number; ate: number; ini: number; dur?: number; pre?: string; pos?: string; tam?: number; cor?: string; casas?: number }> = ({ de, ate, ini, dur = 40, pre = '', pos = '', tam = 200, cor, casas = 0 }) => {
  const f = useCurrentFrame();
  const e = Easing.bezier(0.16, 1, 0.3, 1);
  const v = lerp(f, ini, ini + dur, de, ate, e);
  const v2 = lerp(f + 1, ini, ini + dur, de, ate, e);
  const vel = Math.abs(v2 - v) / Math.max(1, Math.abs(ate - de)) * dur;
  const txt = v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return (
    <div style={{ fontFamily: G, fontWeight: 600, fontSize: tam, letterSpacing: '-0.05em', color: cor || C.ink, lineHeight: 1, filter: vel > 0.05 ? `blur(${Math.min(10, vel * 6)}px)` : undefined, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {pre}{txt}{pos}
    </div>
  );
};

// Linhas que convergem para um ponto (com faíscas andando)
export const Convergem: React.FC<{ cx: number; cy: number; ini: number; n?: number; de?: 'esq' | 'dir'; cor?: string; comp?: number; abertura?: number }> = ({ cx, cy, ini, n = 14, de = 'esq', cor, comp = 520, abertura = 520 }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const desenha = lerp(f, ini, ini + 24, 0, 1);
  const lado = de === 'esq' ? -1 : 1;
  const c = cor || (escuro() ? '#5FE3A1' : '#15A763');
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 15 }} width={1} height={1}>
      {Array.from({ length: n }, (_, i) => {
        const yy = cy + (i / (n - 1) - 0.5) * abertura;
        const x0 = cx + lado * comp;
        const d = `M ${x0} ${yy} C ${cx + lado * comp * 0.45} ${yy}, ${cx + lado * comp * 0.35} ${cy}, ${cx + lado * 60} ${cy}`;
        const t = (((f - ini) / 40 + i * 0.13) % 1);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="3 7" pathLength={1} style={{ strokeDashoffset: 0 }} opacity={desenha} />
            <path d={d} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" pathLength={100} strokeDasharray={`3 100`} strokeDashoffset={-t * 100} opacity={desenha} />
          </g>
        );
      })}
    </svg>
  );
};

// Cartão de interface flutuante com profundidade (desfoca quando "longe")
export const Flutua: React.FC<{ x: number; y: number; w: number; ini: number; fim?: number; z?: number; rot?: number; children: React.ReactNode }> = ({ x, y, w, ini, fim, z = 0, rot = 0, children }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = spring({ frame: f - ini, fps: 30, config: { damping: 16, stiffness: 110, mass: 0.9 } });
  const o = Math.min(1, s * 2) * saida(f, fim, 8);
  const esc = 1 - z * 0.25;
  const dx = Math.sin((f + x) / 40) * 8, dy = Math.cos((f + y) / 50) * 8;
  return (
    <div style={{ position: 'absolute', left: x + dx, top: y + dy + (1 - s) * 80, width: w, opacity: o * (1 - z * 0.35), transform: `scale(${esc}) rotate(${rot}deg)`, filter: z > 0.1 ? `blur(${z * 7}px)` : undefined, zIndex: Math.round(30 - z * 20) }}>
      {children}
    </div>
  );
};

// Legenda da narração: usa os tempos reais da voz (props.narra, vindos do produzir3.py); no Studio, os tempos do roteiro.
// Mostra também o aviso discreto de que a voz é gerada por IA.
type FalaReal = { ini: number; fim: number; t: string; voz: string; leg: boolean };
export const Narrada: React.FC<{ id: string; y?: number; tam?: number; ate?: number }> = ({ id, y = 1640, tam = 46, ate = 486 }) => {
  const f = useCurrentFrame();
  const vindas = (getInputProps() as { narra?: FalaReal[] }).narra;
  const falas: FalaReal[] = vindas || (NARRA[id] || []).map(([ini, fim, t, voz, leg]) => ({ ini, fim, t, voz: voz || 'n', leg: leg !== false }));
  const frases = falas.filter((x) => x.leg && x.ini < ate).map((x) => [x.ini, Math.min(ate, x.fim + 10), x.t] as [number, number, string]);
  return (
    <>
      <Legenda frases={frases} y={y} tam={tam} />
      {falas.length > 0 && f < ate && <div style={{ position: 'absolute', top: 1846, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 20, color: C.fg3, opacity: 0.8, zIndex: 60 }}>narração gerada por IA</div>}
    </>
  );
};
