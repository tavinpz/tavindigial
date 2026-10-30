// L4 — "Motion design para a sua marca" (esferas brilhantes, líquido, tubo; só música)
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame, Easing } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { P, F, FundoRoxo, Texto, Esfera, Surge, Etiqueta, Fecho, lerp, chaves, mola, molaViva, saida, io } from './kit';

export const DUR_L4 = 570;
const BG = '#F1ECF5';
const TOPO = 1260; // superfície do líquido

// mede texto com a fonte real (espera as fontes carregarem)
let ctx: CanvasRenderingContext2D | null = null;
const medir = (t: string, tam: number, peso = 800) => {
  if (typeof document === 'undefined') return { w: t.length * tam * 0.55, a: tam * 0.7 };
  ctx = ctx || document.createElement('canvas').getContext('2d');
  ctx!.font = `${peso} ${tam}px Urbanist`;
  const m = ctx!.measureText(t);
  return { w: m.width, a: m.actualBoundingBoxAscent };
};
const useFontes = () => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('fontes-medir'));
  useEffect(() => { (document as any).fonts.ready.then(() => { setTimeout(() => { setOk(true); continueRender(h); }, 50); }); }, []);
  return ok;
};

// mergulho do líquido no centro (impacto em 26)
const mergulho = (f: number) => {
  if (f < 26) return 0;
  const t = f - 26;
  return 130 * Math.exp(-t / 14) * Math.sin(Math.min(Math.PI, (t / 16) * Math.PI) + (t > 16 ? (t - 16) / 5 : 0));
};
const Liquido: React.FC = () => {
  const f = useCurrentFrame();
  const desce = lerp(f, 46, 74, 0, 900, Easing.in(Easing.cubic));
  if (desce >= 899) return null;
  const A = mergulho(f);
  let d = `M-60 1920 L-60 ${TOPO}`;
  for (let x = -60; x <= 1140; x += 20) d += ` L${x} ${(TOPO + A * Math.exp(-(((x - 540) / 240) ** 2)) + Math.sin(x / 90 + f / 5) * 4 * Math.min(1, f / 26)).toFixed(1)}`;
  d += ' L1140 1920 Z';
  let borda = '';
  for (let x = -60; x <= 1140; x += 20) borda += `${x === -60 ? 'M' : 'L'}${x} ${(TOPO + 4 + A * Math.exp(-(((x - 540) / 240) ** 2)) + Math.sin(x / 90 + f / 5) * 4 * Math.min(1, f / 26)).toFixed(1)}`;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, transform: `translateY(${desce}px)` }}>
      <defs>
        <linearGradient id="liq" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor="#D7A6FB" /><stop offset=".45" stopColor="#9B3BEA" /><stop offset="1" stopColor="#4B0CA6" /></linearGradient>
        <linearGradient id="liq2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".0" /><stop offset=".9" stopColor="#2A0060" stopOpacity=".45" /></linearGradient>
      </defs>
      <path d={d} fill="url(#liq)" />
      <path d={d} fill="url(#liq2)" />
      <path d={borda} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

// grupos de esferas atrás das palavras: [x, y, r, cor]
type E = [number, number, number, any];
const GRUPO_A: E[] = [[330, 900, 150, 'vio'], [560, 860, 190, 'roxo'], [780, 960, 140, 'vio'], [470, 1060, 110, 'rosa'], [690, 1090, 90, 'lilas'], [230, 1040, 70, 'roxo']];
const GRUPO_B: E[] = [[260, 960, 120, 'roxo'], [450, 880, 160, 'vio'], [660, 980, 180, 'roxo'], [860, 900, 110, 'rosa'], [560, 1110, 100, 'lilas'], [880, 1080, 60, 'vio']];

const Grupo: React.FC<{ ini: number; troca: number; fim: number }> = ({ ini, troca, fim }) => {
  const f = useCurrentFrame();
  const t = lerp(f, troca, troca + 24, 0, 1, io);
  return (
    <>
      {GRUPO_A.map((a, i) => {
        const b = GRUPO_B[i];
        const s = molaViva(f, ini + i * 3) * (1 - lerp(f, fim - 14 + i * 2, fim + i * 2, 0, 1, Easing.in(Easing.back(2))));
        if (s <= 0.001) return null;
        const x = a[0] + (b[0] - a[0]) * t + Math.sin(f / 18 + i) * 8;
        const y = a[1] + (b[1] - a[1]) * t + Math.cos(f / 21 + i * 2) * 10;
        const r = (a[2] + (b[2] - a[2]) * t) * s;
        return <Esfera key={i} x={x} y={y} r={r} cor={a[3]} />;
      })}
    </>
  );
};

// tubo rosa que passa pela palavra (r2)
const TUBO = 'M120 1010 C 220 840, 330 1180, 430 990 S 560 820, 600 1000 S 700 1200, 780 980 S 900 860, 960 1060';
const Tubo: React.FC<{ ini: number }> = ({ ini }) => {
  const f = useCurrentFrame();
  const cabeca = lerp(f, ini, ini + 34, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
  const cauda = lerp(f, ini + 40, ini + 70, 0, 1, Easing.bezier(0.6, 0, 0.4, 1));
  if (cabeca <= 0 || cauda >= 1) return null;
  const len = cabeca - cauda;
  const ev = (w: number) => ({ strokeDasharray: `0 ${cauda} ${len} 2`, pathLength: 1, strokeWidth: w } as any);
  void evolvePath;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 26px 30px rgba(120,20,120,.35))' }}>
      <defs><linearGradient id="tb" x1="0" x2="1"><stop offset="0" stopColor="#FFB8FF" /><stop offset="1" stopColor="#E25AE8" /></linearGradient></defs>
      <path d={TUBO} fill="none" stroke="#B83DBE" strokeLinecap="round" {...ev(58)} />
      <path d={TUBO} fill="none" stroke="url(#tb)" strokeLinecap="round" {...ev(46)} transform="translate(-3 -4)" />
      <path d={TUBO} fill="none" stroke="#fff" strokeOpacity={0.55} strokeLinecap="round" {...ev(10)} transform="translate(-9 -14)" />
    </svg>
  );
};

// palavra em SVG (sabemos onde fica o pingo do "i")
const Palavra: React.FC<{ t: string; ini: number; fim: number; branca: number; y?: number; tam?: number }> = ({ t, ini, fim, branca, y = 1030, tam = 190 }) => {
  const f = useCurrentFrame();
  const w0 = medir(t, tam).w; if (w0 > 880) tam = Math.floor(tam * 880 / w0);
  const { w } = medir(t, tam);
  const o = Math.min(lerp(f, ini, ini + 16, 0, 1), saida(f, fim, 12));
  const c = interpolate(branca, [0, 1], [0, 1]);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o, filter: o < 0.98 ? `blur(${(1 - o) * 14}px)` : undefined }}>
      <text x={540 - w / 2} y={y} fontFamily="Urbanist" fontWeight={800} fontSize={tam} letterSpacing={0} fill={P.el} opacity={1 - c}>{t}</text>
      <text x={540 - w / 2} y={y} fontFamily="Urbanist" fontWeight={800} fontSize={tam} letterSpacing={0} fill="#fff" opacity={c} style={{ filter: 'drop-shadow(0 6px 18px rgba(60,0,110,.35))' }}>{t}</text>
    </svg>
  );
};

// olho (máscara amendoada cheia de esferas) + íris que olha em volta
const Olho: React.FC<{ ini: number; zoom: number }> = ({ ini, zoom }) => {
  const f = useCurrentFrame();
  const abre = lerp(f, ini, ini + 18, 0, 1, Easing.bezier(0.3, 1.4, 0.5, 1));
  const olhar = chaves(f, [[ini + 18, 0], [ini + 32, -70], [ini + 50, -70], [ini + 62, 60], [ini + 76, 60], [ini + 86, 0]]);
  const z = lerp(f, zoom, zoom + 26, 1, 26, Easing.in(Easing.cubic));
  const px = 540 + olhar, py = 960;
  const meio = 300 * abre;
  const amendoa = `M100 960 Q 540 ${960 - meio * 1.55} 980 960 Q 540 ${960 + meio * 1.55} 100 960 Z`;
  const bolas: E[] = [[260, 900, 90, 'vio'], [380, 1050, 110, 'roxo'], [820, 880, 100, 'rosa'], [760, 1060, 120, 'vio'], [180, 980, 60, 'rosa'], [900, 990, 70, 'roxo'], [330, 830, 70, 'lilas'], [700, 820, 80, 'lilas'], [540, 1120, 70, 'rosa']];
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: `${px}px ${py}px`, transform: `scale(${z})` }}>
      <svg width={0} height={0}><defs><clipPath id="olho"><path d={amendoa} /></clipPath></defs></svg>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'url(#olho)', background: 'linear-gradient(160deg, #4B0CA6, #8B1AEB)' }}>
        {bolas.map((b, i) => <Esfera key={i} x={b[0] + Math.sin(f / 12 + i) * 14} y={b[1] + Math.cos(f / 14 + i * 2) * 16} r={b[2]} cor={b[3]} />)}
        <Esfera x={px} y={py} r={150} cor="branca" />
        <Esfera x={px + olhar * 0.25} y={py + 6} r={64} cor="roxo" />
      </div>
    </div>
  );
};

export const L4: React.FC = () => {
  const f = useCurrentFrame();
  useFontes();
  // esfera que cai, quica e vira o pingo do "i"
  const tam = 190; const palavra = 'visual';
  const m = medir(palavra, tam); const v = medir('v', tam); const ii = medir('ı', tam); const iPt = medir('i', tam);
  const xi = 540 - m.w / 2 + v.w + ii.w / 2;
  const yi = 1030 - (iPt.a + ii.a) / 2 - (iPt.a - ii.a) * 0.12;
  let x = 540, y = -160, r = 110, sx = 1, sy = 1;
  if (f < 26) y = interpolate(f, [4, 26], [-160, TOPO - r], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) });
  else if (f < 44) { y = TOPO - r + mergulho(f) * 0.9; const k = Math.sin(Math.min(1, (f - 26) / 8) * Math.PI) * 0.16; sx = 1 + k; sy = 1 - k; }
  else {
    const s = mola(f, 44, 30, { damping: 13, stiffness: 90, mass: 1 });
    const enc = lerp(f, 64, 86, 0, 1, io);
    y = interpolate(s, [0, 1], [TOPO - r, 760]) * (1 - enc) + yi * enc;
    x = 540 * (1 - enc) + xi * enc;
    r = 110 * (1 - enc) + 30 * enc;
    const k = Math.max(0, 1 - (f - 44) / 10) * 0.18; sx = 1 - k; sy = 1 + k;
  }
  const esferaO = saida(f, 150, 10);
  const fundoRoxo = lerp(f, 352, 362, 0, 1);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Liquido />
      {/* grupo 1: visual → movimento */}
      <Grupo ini={96} troca={150} fim={246} />
      <Palavra t={palavra.replace('i', 'ı')} ini={78} fim={150} branca={lerp(f, 100, 116, 0, 1)} />
      <Palavra t="movimento" ini={152} fim={246} branca={1} tam={170} />
      <Tubo ini={168} />
      {esferaO > 0 && <div style={{ opacity: esferaO }}><Esfera x={x} y={y} r={r} cor="roxo" style={{ transform: `scale(${sx}, ${sy})`, transformOrigin: '50% 100%' }} /></div>}
      {/* olho: atenção */}
      {f >= 250 && f < 370 && <Olho ini={254} zoom={330} />}
      <div style={{ position: 'absolute', top: 1330, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Texto t="atenção" ini={262} tam={110} peso={800} fim={328} />
      </div>
      {/* final roxo */}
      {fundoRoxo > 0 && <div style={{ position: 'absolute', inset: 0, opacity: fundoRoxo }}><FundoRoxo /></div>}
      {f >= 352 && (
        <>
          <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <Texto t={'Motion design\npara a *sua marca*.'} ini={364} tam={96} peso={700} cor="#fff" acento="#FFD3FF" fim={466} />
          </div>
          <div style={{ position: 'absolute', top: 920, left: 90, right: 90, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
            {['Vinhetas', 'Anúncios', 'Explicativos', 'Lançamentos', 'Reels animados'].map((t, i) => (
              <Surge key={t} ini={388 + i * 6} fim={466} dy={36}><Etiqueta t={t} tam={36} fundo="rgba(255,255,255,.16)" cor="#fff" style={{ border: '2px solid rgba(255,255,255,.35)' }} /></Surge>
            ))}
          </div>
          {f >= 462 && <Fecho ini={468} frase="Esse vídeo foi animado pela Tavin." claro={false} />}
        </>
      )}
    </AbsoluteFill>
  );
};
