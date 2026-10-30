import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, random } from 'remotion';
import { C, D, B, ease, celulas } from './marca';

// ── Kit "pro": tudo no tempo da música (120 bpm = 15 quadros por batida a 30 fps) ──
export const BATIDA = 15;
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// pulso que bate a cada tempo (para títulos e fundos "respirarem" com a música)
export const pulso = (f: number, forca = 0.025, cada = BATIDA) => 1 + forca * Math.exp(-((f % cada) / cada) * 6);

// Reduz o tamanho até a linha mais longa caber na largura (mede com a fonte de verdade)
let _ctx: CanvasRenderingContext2D | null = null;
export function ajustar(linhas: string[], tam: number, peso: number, largura: number, tracking = -0.04) {
  if (typeof document === 'undefined') return tam;
  _ctx = _ctx || document.createElement('canvas').getContext('2d');
  if (!_ctx) return tam;
  _ctx.font = `${peso} ${tam}px Raleway`;
  let maior = 0;
  for (const l of linhas) {
    const blocos = (l.match(/\*\*[^*]+\*\*/g) || []).length;
    const limpo = l.replace(/\*/g, '');
    const w = _ctx.measureText(limpo).width + limpo.length * tracking * tam + blocos * tam * 0.3;
    maior = Math.max(maior, w);
  }
  return maior > largura * 0.97 ? Math.floor(tam * (largura * 0.97) / maior) : tam;
}

// Revelação por máscara, linha a linha. *trecho* = destaque (cor) e **trecho** = bloco elétrico atrás do texto
export const Linhas: React.FC<{ linhas: string[]; ini?: number; tam?: number; passo?: number; cor?: string; destaque?: string; peso?: number; fim?: number; alinhar?: 'left' | 'center'; largura?: number; entre?: number; bloco?: string; tracking?: number }> = ({ linhas, ini = 0, tam = 120, passo = 4, cor = C.branco, destaque = C.rosa, peso = 900, fim, alinhar = 'left', largura = 920, entre = 1.0, bloco = C.el, tracking = -0.04 }) => {
  const f = useCurrentFrame();
  const saida = fim !== undefined ? interpolate(f, [fim - 9, fim], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) : 0;
  tam = ajustar(linhas, tam, peso, largura, tracking);
  return (
    <div style={{ width: largura, textAlign: alinhar }}>
      {linhas.map((l, i) => {
        const p = interpolate(f, [ini + i * passo, ini + i * passo + 13], [0, 1], { ...cl, easing: ease });
        const blocoP = interpolate(f, [ini + i * passo + 8, ini + i * passo + 18], [0, 1], { ...cl, easing: ease });
        const partes = l.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).filter(Boolean);
        return (
          <div key={i} style={{ overflow: 'hidden', lineHeight: entre, paddingBottom: tam * 0.08, marginBottom: -tam * 0.04 }}>
            <div style={{ fontFamily: D, fontWeight: peso, fontSize: tam, letterSpacing: `${tracking}em`, color: cor, transform: `translateY(${(1 - p) * 110 - saida * 110}%) rotate(${(1 - p) * 3}deg)`, transformOrigin: 'left bottom', whiteSpace: 'pre' }}>
              {partes.map((pt, j) => {
                if (pt.startsWith('**')) return (
                  <span key={j} style={{ position: 'relative', display: 'inline-block', padding: `0 ${tam * 0.12}px`, margin: `0 ${tam * 0.02}px` }}>
                    <span style={{ position: 'absolute', inset: `${tam * 0.06}px 0 ${tam * 0.02}px`, background: bloco, transformOrigin: 'left', transform: `scaleX(${blocoP})`, borderRadius: tam * 0.08 }} />
                    <span style={{ position: 'relative', color: C.branco }}>{pt.slice(2, -2)}</span>
                  </span>
                );
                if (pt.startsWith('*')) return <span key={j} style={{ color: destaque }}>{pt.slice(1, -1)}</span>;
                return <span key={j}>{pt}</span>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Texto pequeno de apoio que sobe com fade
export const Apoio: React.FC<{ texto: React.ReactNode; ini: number; tam?: number; cor?: string; peso?: number; style?: React.CSSProperties; fim?: number }> = ({ texto, ini, tam = 46, cor = '#D9D0E0', peso = 600, style, fim }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [ini, ini + 12], [0, 1], { ...cl, easing: ease });
  const o = fim !== undefined ? interpolate(f, [fim - 8, fim], [1, 0], cl) : 1;
  return <div style={{ fontFamily: B, fontWeight: peso, fontSize: tam, color: cor, lineHeight: 1.3, opacity: p * o, transform: `translateY(${(1 - p) * 26}px)`, ...style }}>{texto}</div>;
};

// Fundo vivo: grade em perspectiva + duas luzes que se movem + peças do pattern flutuando
export const Palco: React.FC<{ cor?: string; luz1?: string; luz2?: string; grade?: boolean; pecas?: boolean; seed?: number }> = ({ cor = C.noite, luz1 = 'rgba(182,0,246,.30)', luz2 = 'rgba(254,168,255,.14)', grade = true, pecas = true, seed = 1 }) => {
  const f = useCurrentFrame();
  const a = 30 + Math.sin(f / 45) * 20, b = 25 + Math.cos(f / 55) * 12;
  const c = 70 + Math.cos(f / 40) * 20, d = 75 + Math.sin(f / 50) * 10;
  return (
    <AbsoluteFill style={{ background: cor, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(55% 35% at ${a}% ${b}%, ${luz1}, transparent 70%), radial-gradient(50% 30% at ${c}% ${d}%, ${luz2}, transparent 70%)` }} />
      {grade && (
        <div style={{ position: 'absolute', left: -540, right: -540, top: 1150, height: 1400, transform: 'perspective(900px) rotateX(62deg)', transformOrigin: 'top', backgroundImage: 'linear-gradient(rgba(254,168,255,.10) 2px, transparent 2px), linear-gradient(90deg, rgba(254,168,255,.10) 2px, transparent 2px)', backgroundSize: '120px 120px', backgroundPosition: `0 ${(f * 3) % 120}px`, maskImage: 'linear-gradient(transparent, #000 30%, transparent)', WebkitMaskImage: 'linear-gradient(#000, transparent 75%)' }} />
      )}
      {pecas && celulas(5, 1, 40 + seed).map((p, i) => {
        const x = random(`x${seed}${i}`) * 1080, y0 = random(`y${seed}${i}`) * 1920, vel = 0.4 + random(`v${seed}${i}`) * 0.8;
        const y = ((y0 - f * vel * 2) % 2100 + 2100) % 2100 - 100;
        const t = 40 + random(`t${seed}${i}`) * 50;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: t, height: t, background: p.fundo, opacity: 0.35, borderRadius: p.forma === 'circulo' ? 999 : p.forma === 'quarto' ? `0 0 ${t}px 0` : 6, transform: `rotate(${f * vel + i * 40}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

// Grão de filme + vinheta (por cima de tudo)
export const Acabamento: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('grao.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${random(`g${f}`) * 512}px ${random(`h${f}`) * 512}px`, opacity: 0.07, mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.45))' }} />
    </AbsoluteFill>
  );
};

// Entrada/saída de cena: whip (chicote lateral com borrão), zoom (atravessa a tela) ou nenhuma
export const Cena: React.FC<{ d: number; entrada?: 'whip' | 'zoom' | 'sobe' | 'nada'; saida?: 'whip' | 'zoom' | 'nada'; children: React.ReactNode }> = ({ d, entrada = 'nada', saida = 'nada', children }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 8], [1, 0], { ...cl, easing: ease });
  const s = interpolate(f, [d - 7, d], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  let tx = 0, sc = 1, blur = 0, op = 1, ty = 0;
  if (entrada === 'whip') { tx += e * 1080; blur += e * 22; }
  if (entrada === 'zoom') { sc *= 1 - e * 0.35; op *= 1 - e; blur += e * 10; }
  if (entrada === 'sobe') { ty += e * 300; op *= 1 - e; }
  if (saida === 'whip') { tx -= s * 1080; blur += s * 22; }
  if (saida === 'zoom') { sc *= 1 + s * 1.6; op *= 1 - s; blur += s * 12; }
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${sc})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined, opacity: op }}>{children}</AbsoluteFill>;
};

// Flash curto (corte com impacto)
export const Flash: React.FC<{ em: number; cor?: string }> = ({ em, cor = '#FFFFFF' }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [em - 1, em, em + 6], [0, 0.55, 0], cl);
  return o > 0 ? <AbsoluteFill style={{ background: cor, opacity: o, mixBlendMode: 'screen' }} /> : null;
};

// Celular em 3D: entra girando e fica "respirando"
export const Cel3D: React.FC<{ ini?: number; giro?: number; x: number; y: number; largura?: number; children: React.ReactNode; inclina?: number }> = ({ ini = 0, giro = 38, x, y, largura = 600, children, inclina = 8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - ini, fps, config: { damping: 18, stiffness: 80 } });
  const rotY = (1 - s) * giro - inclina + Math.sin(f / 40) * 3;
  const rotX = (1 - s) * 18 + 4 + Math.cos(f / 50) * 2;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: largura, perspective: 1800 }}>
      <div style={{ transform: `translateY(${(1 - s) * 900}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`, transformStyle: 'preserve-3d' }}>{children}</div>
    </div>
  );
};

// Faixa de luz que atravessa um elemento (brilho de "premium")
export const Brilho: React.FC<{ em: number; dur?: number; raio?: number }> = ({ em, dur = 22, raio = 40 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [em, em + dur], [-0.4, 1.4], cl);
  if (f < em || f > em + dur) return null;
  return <div style={{ position: 'absolute', inset: 0, borderRadius: raio, overflow: 'hidden', pointerEvents: 'none' }}><div style={{ position: 'absolute', top: -200, bottom: -200, width: 160, left: `${p * 100}%`, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)' }} /></div>;
};

// Contador que rola até o valor (formato brasileiro)
export const Contador: React.FC<{ de: number; ate: number; ini: number; dur?: number; casas?: number; prefixo?: string; sufixo?: string; style?: React.CSSProperties }> = ({ de, ate, ini, dur = 30, casas = 0, prefixo = '', sufixo = '', style }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [ini, ini + dur], [de, ate], { ...cl, easing: Easing.out(Easing.cubic) });
  return <span style={style}>{prefixo}{v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}{sufixo}</span>;
};

// Texto riscado (o risco corre sobre o texto)
export const Riscado: React.FC<{ texto: string; ini: number; risca: number; tam?: number; cor?: string }> = ({ texto, ini, risca, tam = 64, cor = '#D9D0E0' }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [ini, ini + 10], [0, 1], { ...cl, easing: ease });
  const r = interpolate(f, [risca, risca + 9], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: 'relative', display: 'inline-block', fontFamily: B, fontWeight: 800, fontSize: tam, color: cor, opacity: p * (1 - r * 0.55), transform: `translateX(${(1 - p) * -60}px)` }}>
      {texto}
      <span style={{ position: 'absolute', left: -6, right: -6, top: '54%', height: tam * 0.12, background: C.rosa, transformOrigin: 'left', transform: `scaleX(${r})`, borderRadius: 6 }} />
    </div>
  );
};

// Balão de conversa (direct / WhatsApp genérico, sem marca)
export const Balao: React.FC<{ texto: string; ini: number; lado?: 'esq' | 'dir'; cor?: string; corTexto?: string; tam?: number; style?: React.CSSProperties; hora?: string }> = ({ texto, ini, lado = 'esq', cor = '#2A2230', corTexto = C.branco, tam = 46, style, hora }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - ini, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  return (
    <div style={{ display: 'flex', justifyContent: lado === 'esq' ? 'flex-start' : 'flex-end', ...style }}>
      <div style={{ maxWidth: 760, padding: `${tam * 0.5}px ${tam * 0.7}px`, borderRadius: lado === 'esq' ? `${tam}px ${tam}px ${tam}px 10px` : `${tam}px ${tam}px 10px ${tam}px`, background: cor, color: corTexto, fontFamily: B, fontWeight: 600, fontSize: tam, lineHeight: 1.25, transform: `scale(${s})`, transformOrigin: lado === 'esq' ? 'left bottom' : 'right bottom', opacity: Math.min(1, s * 1.5) }}>
        {texto}
        {hora && <span style={{ display: 'block', textAlign: 'right', fontSize: tam * 0.5, opacity: 0.6, marginTop: 4 }}>{hora}</span>}
      </div>
    </div>
  );
};

// Legenda da voz, estilo Reels: até 4 palavras, a palavra falada pula e acende
export const LegendaPro: React.FC<{ falas: { ini: number; fim: number; texto: string }[]; y?: number }> = ({ falas, y = 1490 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = f / fps;
  const fala = falas.find((x) => t >= x.ini && t < x.fim + 0.2);
  if (!fala) return null;
  const palavras = fala.texto.split(' ');
  const pesos = palavras.map((p) => p.length + 2); const total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0; const tempos = pesos.map((p) => { const ini = fala.ini + (acum / total) * (fala.fim - fala.ini); acum += p; return ini; });
  let atual = 0; tempos.forEach((tt, i) => { if (t >= tt) atual = i; });
  const bloco = Math.floor(atual / 4) * 4;
  return (
    <div style={{ position: 'absolute', left: 60, right: 140, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 18px' }}>
      {palavras.slice(bloco, bloco + 4).map((p, i) => {
        const k = bloco + i; const ativo = k === atual;
        const dt = Math.max(0, t - tempos[k]);
        const pop = ativo ? 1 + 0.12 * Math.exp(-dt * 14) : 1;
        return <span key={k} style={{ fontFamily: D, fontWeight: 900, fontSize: 70, letterSpacing: '-0.02em', color: ativo ? C.rosa : C.branco, opacity: k > atual ? 0.5 : 1, transform: `scale(${pop})`, display: 'inline-block', textShadow: '0 6px 24px rgba(0,0,0,.7), 0 0 2px rgba(0,0,0,.9)' }}>{p}</span>;
      })}
    </div>
  );
};

// Chip com ícone em pastilha do pattern
export const Pastilha: React.FC<{ texto: string; ini: number; tam?: number; claro?: boolean; style?: React.CSSProperties; semente?: number }> = ({ texto, ini, tam = 44, claro = true, style, semente = 5 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - ini, fps, config: { damping: 13, stiffness: 200, mass: 0.6 } });
  const c = celulas(1, 1, semente)[0];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: tam * 0.4, padding: `${tam * 0.32}px ${tam * 0.6}px ${tam * 0.32}px ${tam * 0.32}px`, borderRadius: 999, background: claro ? C.branco : 'rgba(255,255,255,.08)', border: claro ? 'none' : '2px solid rgba(255,255,255,.14)', color: claro ? C.ink : C.branco, fontFamily: B, fontWeight: 800, fontSize: tam, whiteSpace: 'nowrap', transform: `scale(${s})`, opacity: Math.min(1, s), ...style }}>
      <span style={{ width: tam * 1.2, height: tam * 1.2, borderRadius: tam * 0.34, background: c.fundo, position: 'relative', overflow: 'hidden', flex: 'none' }}>
        <span style={{ position: 'absolute', inset: 0, background: c.cor, clipPath: c.forma === 'tri' ? 'polygon(0 0,100% 0,0 100%)' : c.forma === 'meia' ? 'circle(50% at 50% 100%)' : c.forma === 'circulo' ? 'circle(38% at 50% 50%)' : 'circle(100% at 0 0)', transform: `rotate(${c.giro + f * 2}deg)` }} />
      </span>
      {texto}
    </div>
  );
};

// Tela de imagem (captura real) para usar dentro do Celular
export const Tela: React.FC<{ src: string; imgLargura: number; largura: number; y: number }> = ({ src, imgLargura, largura, y }) => (
  <Img src={staticFile(src)} style={{ width: largura, position: 'absolute', left: 0, top: -y * (largura / imgLargura) }} />
);

// ── Montagem de um vídeo a partir da lista de cenas ──
import { Sequence } from 'remotion';
import { Cortina, Logo } from './marca';
export type CenaDef = { C: React.FC<{ d: number }>; d: number; entrada?: 'whip' | 'zoom' | 'sobe' | 'nada'; saida?: 'whip' | 'zoom' | 'nada'; cortina?: boolean; flash?: boolean; logo?: boolean };
export const Roteiro: React.FC<{ cenas: CenaDef[]; dur?: number[]; falas?: { ini: number; fim: number; texto: string }[]; legendaY?: number }> = ({ cenas, dur, falas, legendaY }) => {
  const ds = cenas.map((c, i) => dur?.[i] ?? c.d);
  let t = 0; const ini = ds.map((d) => { const i = t; t += d; return i; });
  return (
    <AbsoluteFill style={{ background: C.noite }}>
      {cenas.map((c, i) => (
        <Sequence key={i} from={ini[i]} durationInFrames={ds[i]}>
          <Cena d={ds[i]} entrada={c.entrada} saida={c.saida}><c.C d={ds[i]} /></Cena>
          {c.logo !== false && <div style={{ position: 'absolute', left: 80, top: 96, opacity: 0.9 }}><Logo tamanho={36} /></div>}
        </Sequence>
      ))}
      {cenas.map((c, i) => (c.cortina && i > 0 ? <Cortina key={`c${i}`} em={ini[i]} semente={60 + i} /> : null))}
      {cenas.map((c, i) => (c.flash && i > 0 ? <Flash key={`f${i}`} em={ini[i]} /> : null))}
      {falas && <Sequence from={0} durationInFrames={ini[ini.length - 1]}><LegendaPro falas={falas} y={legendaY} /></Sequence>}
      <Acabamento />
    </AbsoluteFill>
  );
};
