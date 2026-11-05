import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { K, SET, FT, LW, LH, marco, fmtL } from './tema';
import type { LProps } from './tema';
import { Mapa, quente } from './eua';
import gasEst from '../../public/l/lss001/estados.json';

import { prog, spr, wob, EO, EIO, lerp, clamp, rnd } from '../lib/anim';

/** tremida de câmera que decai depois de uma batida em `a` */
const tremor = (f: number, a: number, forca = 18) => {
  const d = f - a;
  if (d < 0 || d > 14) return { x: 0, y: 0 };
  const k = (1 - d / 14) * forca;
  return { x: Math.sin(d * 2.7) * k, y: Math.cos(d * 3.3) * k * 0.7 };
};
const Flash: React.FC<{ f: number; a: number; cor?: string; forca?: number }> = ({ f, a, cor = '#fff', forca = 0.35 }) => {
  const d = f - a;
  if (d < 0 || d > 6) return null;
  return <AbsoluteFill style={{ background: cor, opacity: forca * (1 - d / 6) }} />;
};

const Carta: React.FC<{ cor: string; nome: string; preco: string; w: number; x: number; y: number; rot: number; s?: number; brilho?: boolean }> = ({ cor, nome, preco, w, x, y, rot, s = 1, brilho }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.62, width: w, height: w * 1.25, borderRadius: 20, background: '#f3f1ea', transform: `rotate(${rot}deg) scale(${s})`, boxShadow: brilho ? `0 0 90px ${cor}, 0 30px 60px rgba(0,0,0,0.6)` : '0 30px 60px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
    <div style={{ height: w * 0.32, background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: w * 0.1, color: '#111', textAlign: 'center', padding: '0 12px', lineHeight: 1.05 }}>{nome}</div>
    <div style={{ position: 'absolute', bottom: w * 0.3, width: '100%', textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: w * 0.2, color: '#111' }}>{preco}</div>
  </div>
);

const Carimbo: React.FC<{ f: number; a: number; texto: string; cor?: string; x?: number; y?: number; tam?: number; rot?: number }> = ({ f, a, texto, cor = K.ruim, x = LW / 2, y = LH / 2, tam = 170, rot = -12 }) => {
  if (f < a) return null;
  const s = spr(f, a, { damping: 9, stiffness: 320, mass: 0.6 });
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${3 - 2 * s})`, opacity: clamp(s * 2), border: `12px solid ${cor}`, borderRadius: 18, padding: '6px 34px', fontFamily: FT.disp, fontWeight: 700, fontSize: tam, letterSpacing: 4, color: cor, background: 'rgba(13,16,22,0.35)' }}>{texto}</div>
  );
};

const Dado: React.FC<{ f: number; x: number; y: number; tam: number; seed: number; para: number; final: number }> = ({ f, x, y, tam, seed, para, final }) => {
  const rolando = f < para;
  const face = rolando ? 1 + Math.floor(rnd(Math.floor(f / 2) + seed) * 6) : final;
  const pos: Record<number, [number, number][]> = { 1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], 4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]], 5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]], 6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]] };
  const rot = rolando ? f * 37 + seed * 50 : 8 * (seed % 2 ? 1 : -1);
  const pulo = rolando ? Math.abs(Math.sin(f / 3 + seed)) * 40 : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y - pulo, width: tam, height: tam, borderRadius: tam * 0.18, background: '#f6f3ea', transform: `rotate(${rot}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
      {pos[face].map(([a, b], i) => <div key={i} style={{ position: 'absolute', left: a * tam - tam * 0.08, top: b * tam - tam * 0.08, width: tam * 0.16, height: tam * 0.16, borderRadius: '50%', background: '#16181f' }} />)}
    </div>
  );
};

const CORES8 = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue'];

/** gancho em batidas: uma por fala, cortes rápidos dentro de cada uma */
export const Gancho: React.FC<LProps> = ({ c, f, dur, marcos }) => {
  const m = (k: number) => marco(marcos, k);
  const b = marcos.filter((x) => x <= f).length - 1; // batida atual
  const ini = m(Math.max(0, b));
  const g = f - ini;
  const tr = tremor(f, ini + 2, b === 0 || b === 2 || b === 4 ? 22 : 10);
  let conteudo: React.ReactNode = null;

  if (b <= 0) {
    // 1) "Boardwalk is a trap." carta bate + carimbo
    const s = spr(g, 0, { damping: 11, stiffness: 260 });
    conteudo = (
      <>
        <Carta cor={SET.darkblue} nome="BOARDWALK" preco="$400" w={430} x={LW / 2} y={LH / 2 + 20} rot={lerp(-25, -4, s)} s={lerp(2.2, 1, s)} />
        <Carimbo f={g} a={16} texto="TRAP" tam={190} y={LH / 2 + 40} />
        <Flash f={g} a={16} cor={K.ruim} />
      </>
    );
  } else if (b === 1) {
    // 2) código + 10 mil partidas: dados rolando, peão correndo o anel, contador
    const n = Math.floor(10000 * prog(g, 6, (m(2) - m(1)) - 6, EIO));
    const t = g / 30;
    const ang = t * 5.2;
    const R = 300;
    const px = LW / 2 + Math.cos(ang) * R * 1.35, py = LH / 2 + 40 + Math.sin(ang) * R;
    conteudo = (
      <>
        <div style={{ position: 'absolute', left: LW / 2 - R * 1.35 - 40, top: LH / 2 + 40 - R - 40, width: R * 2.7 + 80, height: R * 2 + 80, borderRadius: 40, border: `3px solid ${K.linha}` }}>
          {CORES8.map((cc, i) => <div key={cc} style={{ position: 'absolute', left: 30 + (i % 4) * ((R * 2.7) / 4), top: i < 4 ? -14 : R * 2 + 66, width: 120, height: 22, borderRadius: 6, background: SET[cc], opacity: 0.85 }} />)}
        </div>
        {Array.from({ length: 10 }, (_, k) => {
          const a2 = ang - k * 0.06;
          return <div key={k} style={{ position: 'absolute', left: LW / 2 + Math.cos(a2) * R * 1.35 - 22, top: LH / 2 + 40 + Math.sin(a2) * R - 22, width: 44, height: 44, borderRadius: '50%', background: K.sinal, opacity: 0.5 * (1 - k / 10) }} />;
        })}
        <div style={{ position: 'absolute', left: px - 30, top: py - 30, width: 60, height: 60, borderRadius: '50%', background: K.sinal, boxShadow: `0 0 40px ${K.sinal}` }} />
        <Dado f={g} x={LW / 2 - 170} y={LH / 2 - 160} tam={150} seed={3} para={1e9} final={4} />
        <Dado f={g} x={LW / 2 + 20} y={LH / 2 - 140} tam={150} seed={8} para={1e9} final={3} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: LH / 2 + 60, textAlign: 'center' }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 150, color: K.texto, fontVariantNumeric: 'tabular-nums', textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>{fmtL(n)}</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 32, color: K.sinal, letterSpacing: 4 }}>GAMES PLAYED</div>
        </div>
      </>
    );
  } else if (b === 2) {
    // 3) metade das partidas: cartas laranja em leque + 50%
    const cartas = [['ST. JAMES', '$180', -18, -260], ['TENNESSEE', '$180', 0, 0], ['NEW YORK', '$200', 18, 260]] as const;
    conteudo = (
      <>
        {cartas.map(([nm, pr, rot, dx], k) => {
          const s = spr(g, k * 4, { damping: 12, stiffness: 240 });
          return <Carta key={nm} cor={SET.orange} nome={`${nm} AVE`.replace('JAMES AVE', 'JAMES PL')} preco={pr} w={300} x={520 + dx * s} y={LH / 2 + 40 + (1 - s) * 500} rot={rot * s} brilho={k === 1} />;
        })}
        <div style={{ position: 'absolute', left: 1080, top: 300, transform: `scale(${2.4 - 1.4 * spr(g, 14, { damping: 10, stiffness: 300 })}) translate(${tremor(g, 16, 14).x}px, 0)`, transformOrigin: 'left center', opacity: g >= 14 ? 1 : 0 }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 300, lineHeight: 0.9, color: SET.orange, letterSpacing: -10, textShadow: `0 0 60px ${SET.orange}88` }}>50%</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 40, color: K.texto, letterSpacing: 3, marginTop: 10 }}>OF ALL ITS GAMES</div>
        </div>
        <Flash f={g} a={16} cor={SET.orange} forca={0.25} />
      </>
    );
  } else if (b === 3) {
    // 4) prisão (grades batendo) e depois x2 na 3ª casa
    const meio = Math.round((m(4) - m(3)) * 0.5);
    if (g < meio) {
      conteudo = (
        <>
          {Array.from({ length: 9 }, (_, k) => {
            const s = spr(g, k * 1.2, { damping: 13, stiffness: 280 });
            return <div key={k} style={{ position: 'absolute', left: 260 + k * 175, top: -40 + (1 - s) * -1200, width: 34, height: LH + 80, borderRadius: 17, background: 'linear-gradient(90deg, #6b7488, #c8cfdc 45%, #5a6274)', boxShadow: '0 0 30px rgba(0,0,0,0.6)' }} />;
          })}
          <div style={{ position: 'absolute', left: 0, right: 0, top: LH / 2 - 150, textAlign: 'center', opacity: prog(g, 10, 16) }}>
            <div style={{ display: 'inline-block', background: 'rgba(13,16,22,0.88)', padding: '20px 50px', borderRadius: 20 }}>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 150, color: K.sinal, lineHeight: 1 }}>JAIL</div>
              <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 36, color: K.texto, marginTop: 6 }}>BUSIEST SQUARE ON THE BOARD</div>
            </div>
          </div>
        </>
      );
    } else {
      const h = g - meio;
      conteudo = (
        <>
          {[0, 1, 2].map((k) => {
            const s = spr(h, k * 5, { damping: 9, stiffness: 300 });
            return (
              <svg key={k} width={220} height={200} style={{ position: 'absolute', left: 520 + k * 250, top: 380 - (1 - s) * 400, opacity: clamp(s * 2) }}>
                <polygon points="110,10 210,90 190,90 190,190 30,190 30,90 10,90" fill={SET.green} stroke="#0d1016" strokeWidth={6} />
              </svg>
            );
          })}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: prog(h, 14, 18), transform: `scale(${2 - spr(h, 14, { damping: 9, stiffness: 300 })})` }}>
            <span style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 170, color: K.sinal }}>×2</span>
            <span style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 40, color: K.texto, marginLeft: 30 }}>AT THE 3RD HOUSE</span>
          </div>
          <Flash f={h} a={14} />
        </>
      );
    }
  } else if (b === 4) {
    // 5) o truque famoso perde: "PAY $50" + carimbo LOSES
    conteudo = (
      <>
        <div style={{ position: 'absolute', left: 0, right: 0, top: LH / 2 - 160, textAlign: 'center', transform: `scale(${1.6 - 0.6 * spr(g, 0)})` }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 40, color: K.mudo, letterSpacing: 4 }}>THE FAMOUS JAIL TRICK</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 170, color: K.texto }}>PAY $50, GET OUT</div>
        </div>
        <Carimbo f={g} a={Math.round((m(5) - m(4)) * 0.55)} texto="LOSES" tam={200} y={LH / 2 + 190} rot={-8} />
        <Flash f={g} a={Math.round((m(5) - m(4)) * 0.55)} cor={K.ruim} />
      </>
    );
  } else {
    // 6) promessa: 10,000 GAMES + "how to win your next game"
    const s = spr(g, 0, { damping: 14, stiffness: 180 });
    conteudo = (
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 30 }}>{CORES8.map((cc, k) => <div key={cc} style={{ width: 90, height: 26, borderRadius: 8, background: SET[cc], transform: `translateY(${(1 - spr(g, k * 2)) * 60}px)`, opacity: clamp(spr(g, k * 2) * 2) }} />)}</div>
        <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 120, color: K.texto, letterSpacing: -3, transform: `scale(${0.8 + 0.2 * s})`, opacity: clamp(s * 2), textAlign: 'center', lineHeight: 1 }}>How to win your<br /><span style={{ color: K.sinal }}>next game</span></div>
        <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.mudo, marginTop: 30, letterSpacing: 4, opacity: prog(g, 12, 24) }}>BACKED BY 10,000 SIMULATED GAMES</div>
      </AbsoluteFill>
    );
  }
  const cortes = marcos.slice(1);
  return (
    <AbsoluteFill style={{ transform: `translate(${tr.x}px, ${tr.y}px)` }}>
      {conteudo}
      {cortes.map((a, k) => <Flash key={k} f={f} a={a} forca={0.22} />)}
    </AbsoluteFill>
  );
};


/** gancho do Last State Standing: bomba de gasolina, mapa, contrastes, Wyoming, promessa */
export const GanchoGas: React.FC<LProps> = ({ f, marcos }) => {
  const m = (k: number) => marco(marcos, k);
  const b = marcos.filter((x) => x <= f).length - 1;
  const g = f - m(Math.max(0, b));
  const est: any[] = gasEst as any;
  const mn = Math.min(...est.map((e) => e.v)), mx = Math.max(...est.map((e) => e.v));
  const tr = tremor(f, m(Math.max(0, b)) + 2, b === 1 || b === 3 ? 20 : 8);
  let c: React.ReactNode = null;
  if (b <= 0) {
    // bomba: dígitos rolando até 10.00
    const p = prog(g, 4, 34, EIO);
    const v = lerp(4.15, 10, p);
    c = (
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#0a0c10', border: '6px solid #2a3346', borderRadius: 30, padding: '40px 80px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', transform: `scale(${1.15 - 0.15 * prog(g, 0, 20, EO)})` }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.mudo, letterSpacing: 6 }}>REGULAR · PER GALLON</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 260, lineHeight: 1, color: p >= 1 ? K.ruim : '#ffb347', textShadow: `0 0 40px ${p >= 1 ? K.ruim : '#ffb347'}aa`, fontVariantNumeric: 'tabular-nums' }}>${v.toFixed(2)}</div>
        </div>
        <Flash f={g} a={34} cor={K.ruim} />
      </AbsoluteFill>
    );
  } else if (b === 1 || b === 2) {
    const foco = b === 1 ? ['Alabama', 'Mississippi'] : ['New York'];
    const num = b === 1 ? '10.6%' : '2.9%';
    const cor = b === 1 ? quente(1) : quente(0);
    const s = spr(g, 12, { damping: 9, stiffness: 300 });
    c = (
      <>
        <Mapa f={f} dados={est} mostra={() => 1} foco={foco} min={mn} max={mx} x={60} y={160} w={1180} />
        <div style={{ position: 'absolute', left: 1260, top: 330, opacity: clamp(s * 2), transform: `scale(${2.2 - 1.2 * s})`, transformOrigin: 'left center' }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 210, lineHeight: 0.9, color: cor, letterSpacing: -6 }}>{num}</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.texto, letterSpacing: 3, marginTop: 10 }}>{b === 1 ? 'OF INCOME. JUST TO DRIVE.' : 'IN NEW YORK'}</div>
        </div>
        <Flash f={g} a={12} cor={b === 1 ? K.ruim : '#5aa0ff'} forca={0.2} />
      </>
    );
  } else if (b === 3) {
    c = (
      <>
        <Mapa f={f} dados={est} mostra={() => 1} foco={['Wyoming']} zoom="Wyoming" pZoom={prog(g, 0, 26, EIO)} min={mn} max={mx} x={0} y={110} w={1250} />
        <div style={{ position: 'absolute', left: 1180, top: 300, width: 680 }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 90, color: K.texto, opacity: prog(g, 6, 16) }}>Wyoming?</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 32, color: K.mudo, marginTop: 10, opacity: prog(g, 10, 20) }}>MOST GAS PER PERSON, #2 IN AMERICA</div>
        </div>
        <Carimbo f={g} a={Math.round((m(4) - m(3)) * 0.55)} texto="ONLY #19" cor={K.sinal} tam={120} x={1500} y={820} rot={-8} />
      </>
    );
  } else {
    const p = prog(g, 0, 40, EIO);
    c = (
      <>
        <Mapa f={f} dados={est} mostra={(e) => prog(g, (50 - e.rank) * 0.6, (50 - e.rank) * 0.6 + 10)} min={mn} max={mx} x={300} y={150} w={1320} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: prog(g, 4, 14) }}>
          <span style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 80, color: K.texto }}>All 50 states. </span>
          <span style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 80, color: K.sinal }}>Ranked.</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: FT.mono, fontWeight: 700, fontSize: 30, color: K.mudo, letterSpacing: 4, opacity: p }}>OFFICIAL DATA · EIA + BEA</div>
      </>
    );
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${tr.x}px, ${tr.y}px)` }}>
      {c}
      {marcos.slice(1).map((a, k) => <Flash key={k} f={f} a={a} forca={0.2} />)}
    </AbsoluteFill>
  );
};


/** gancho do Quanto Você Dura?: fotos de época em cortes rápidos, números batendo, painel caindo, escolha */
export const GanchoRio: React.FC<LProps> = ({ f, marcos, id }) => {
  const m = (k: number) => marco(marcos, k);
  const b = marcos.filter((x) => x <= f).length - 1;
  const g = f - m(Math.max(0, b));
  const tr = tremor(f, m(Math.max(0, b)) + 2, 16);
  const foto = (arq: string, esc: number, filtro = 'sepia(0.5) contrast(1.15) brightness(0.75)') => (
    <Img src={staticFile(`l/${id}/${arq}`)} style={{ position: 'absolute', inset: 0, width: LW, height: LH, objectFit: 'cover', transform: `scale(${esc})`, filter: filtro }} />
  );
  let c: React.ReactNode = null;
  if (b <= 0) {
    c = (
      <>
        {foto('bonde_virado_revolta_da_vacina_jpg.jpg', lerp(1.35, 1.12, prog(g, 0, 60, EO)))}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', transform: `scale(${2 - spr(g, 6, { damping: 10, stiffness: 280 })})`, opacity: prog(g, 6, 10) }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 40, color: '#e9c46a', letterSpacing: 8 }}>RIO DE JANEIRO</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 170, color: '#f4ecdd', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>NOVEMBRO, 1904</div>
        </div>
        <Flash f={g} a={6} />
      </>
    );
  } else if (b === 1) {
    const itens = [['30', 'MORTOS'], ['945', 'PRESOS'], ['461', 'MANDADOS PARA O ACRE']];
    const dur = m(2) - m(1);
    const fotos = ['na_noite_de_14_sucessos_lament_veis_jpg.jpg', 'canteiro_de_obras_pr_ximo_ao_largo_da_mi.jpg', 'ba_a_de_guanabara_vista_da_ilha_das_cobr.jpg'];
    const k = Math.min(2, Math.floor(g / (dur / 3)));
    const gk = g - k * (dur / 3);
    c = (
      <>
        {foto(fotos[k], lerp(1.25, 1.1, prog(gk, 0, dur / 3)), 'sepia(0.6) contrast(1.2) brightness(0.55)')}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', transform: `scale(${2.2 - 1.2 * spr(gk, 2, { damping: 9, stiffness: 320 })}) translate(${tremor(gk, 4, 14).x}px, 0)` }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 240, color: k === 2 ? '#e5484d' : '#f4ecdd', lineHeight: 1, textShadow: '0 10px 50px rgba(0,0,0,0.9)' }}>{itens[k][0]}</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 46, color: '#e9c46a', letterSpacing: 6 }}>{itens[k][1]}</div>
        </div>
        <Flash f={gk} a={2} forca={0.3} />
      </>
    );
  } else if (b === 2) {
    const barras: [string, number, number][] = [['Saúde', 80, 62], ['Dinheiro', 35, 10], ['Segurança', 60, 8]];
    c = (
      <>
        {foto('cais_do_porto_2_acervo_do_instituto_more.jpg', lerp(1.05, 1.15, prog(g, 0, 90)), 'sepia(0.5) contrast(1.1) brightness(0.5)')}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 760, transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * spr(g, 0)})`, padding: '36px 44px', borderRadius: 22, background: 'rgba(12,10,8,0.88)', border: '2px solid rgba(233,196,106,0.5)' }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 30, color: '#e9c46a', letterSpacing: 3, marginBottom: 18 }}>VOCÊ · DIA 1</div>
          {barras.map(([k2, de, ate], i) => {
            const v = lerp(de, ate, prog(g, 18 + i * 6, 50 + i * 6, EIO));
            const cor = v > 55 ? '#7bc47f' : v > 25 ? '#e9c46a' : '#e5484d';
            return (
              <div key={k2} style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FT.sans, fontWeight: 600, fontSize: 36, color: '#efe6d6' }}><span>{k2}</span><span style={{ fontFamily: FT.mono }}>{Math.round(v)}</span></div>
                <div style={{ height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.1)', marginTop: 8 }}><div style={{ height: '100%', width: `${v}%`, borderRadius: 9, background: cor }} /></div>
              </div>
            );
          })}
        </div>
      </>
    );
  } else {
    const s1 = spr(g, 0, { damping: 12, stiffness: 240 }), s2 = spr(g, 8, { damping: 12, stiffness: 240 });
    c = (
      <>
        <div style={{ position: 'absolute', left: 0, top: 0, width: LW / 2, height: LH, overflow: 'hidden', transform: `translateX(${(1 - s1) * -LW / 2}px)` }}>
          <Img src={staticFile(`l/${id}/man_with_clayton_disinfector_wellcome_l0.jpg`)} style={{ width: LW / 2, height: LH, objectFit: 'cover', filter: 'sepia(0.5) brightness(0.6)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 130, color: '#7bc47f', textShadow: '0 8px 30px rgba(0,0,0,0.9)' }}>VACINA</div>
        </div>
        <div style={{ position: 'absolute', left: LW / 2, top: 0, width: LW / 2, height: LH, overflow: 'hidden', transform: `translateX(${(1 - s2) * LW / 2}px)` }}>
          <Img src={staticFile(`l/${id}/bonde_virado_revolta_da_vacina_jpg.jpg`)} style={{ width: LW / 2, height: LH, objectFit: 'cover', filter: 'sepia(0.5) brightness(0.6)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 130, color: '#e5484d', textShadow: '0 8px 30px rgba(0,0,0,0.9)' }}>BARRICADA</div>
        </div>
        <div style={{ position: 'absolute', left: LW / 2 - 70, top: LH / 2 - 70, width: 140, height: 140, borderRadius: '50%', background: '#0c0a08', border: '4px solid #e9c46a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 60, color: '#e9c46a', opacity: prog(g, 16, 22), transform: `scale(${spr(g, 16)})` }}>OU</div>
      </>
    );
  }
  return (
    <AbsoluteFill style={{ background: '#0c0a08', transform: `translate(${tr.x}px, ${tr.y}px)` }}>
      {c}
      {marcos.slice(1).map((a, k) => <Flash key={k} f={f} a={a} forca={0.25} />)}
    </AbsoluteFill>
  );
};

/** gancho genérico do Last State Standing: cada fala é uma batida descrita no spec (contador, foco, zoom, todos) */
export const GanchoLSS: React.FC<LProps> = ({ c, f, marcos }) => {
  const m = (k: number) => marco(marcos, k);
  const b = Math.max(0, marcos.filter((x) => x <= f).length - 1);
  const g = f - m(b);
  const dur = (b + 1 < marcos.length ? m(b + 1) : m(b) + 120) - m(b);
  const B = c.batidas[Math.min(b, c.batidas.length - 1)];
  const est: any[] = c.estados;
  const cor = (k?: string) => (k === 'bom' ? quente(0) : k === 'ruim' ? K.ruim : k === 'quente' ? quente(1) : K.sinal);
  const tr = tremor(f, m(b) + 2, B.forte ? 22 : 9);
  let el: React.ReactNode = null;
  if (B.t === 'contador') {
    const p = prog(g, 4, B.rapido ? 18 : 30, EIO);
    const v = lerp(B.de ?? 0, B.ate, p);
    el = (
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {B.acima && <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.mudo, letterSpacing: 5, marginBottom: 10, opacity: prog(g, 0, 10) }}>{B.acima}</div>}
        <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: B.tam || 300, lineHeight: 1, color: p >= 1 ? cor(B.cor) : K.texto, letterSpacing: -8, fontVariantNumeric: 'tabular-nums', transform: `scale(${1.2 - 0.2 * prog(g, 0, 16, EO)})`, textShadow: p >= 1 ? `0 0 50px ${cor(B.cor)}88` : 'none' }}>
          {B.pre || ''}{fmtL(v, B.dec || 0)}{B.suf || ''}
        </div>
        <div style={{ fontFamily: FT.disp, fontWeight: 600, fontSize: 48, color: K.texto, marginTop: 12, opacity: prog(g, 8, 18), textAlign: 'center', maxWidth: 1400 }}>{B.rotulo}</div>
        <Flash f={g} a={B.rapido ? 18 : 30} cor={cor(B.cor)} forca={0.22} />
        {B.carimbo && <Carimbo f={g} a={Math.round(dur * 0.55)} texto={B.carimbo} cor={cor(B.cor)} tam={110} x={1540} y={830} rot={-9} />}
      </AbsoluteFill>
    );
  } else if (B.t === 'foco') {
    const s = spr(g, 10, { damping: 9, stiffness: 300 });
    el = (
      <>
        <Mapa f={f} dados={est} mostra={() => 1} foco={B.estados} min={c.min} max={c.max} x={60} y={160} w={1180} />
        <div style={{ position: 'absolute', left: 1250, top: 300, width: 640, opacity: clamp(s * 2), transform: `scale(${2.2 - 1.2 * s})`, transformOrigin: 'left center' }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 200, lineHeight: 0.9, color: cor(B.cor), letterSpacing: -6 }}>{B.num}</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 32, color: K.texto, letterSpacing: 2, marginTop: 14, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{B.rotulo}</div>
        </div>
        <Flash f={g} a={10} cor={cor(B.cor)} forca={0.18} />
      </>
    );
  } else if (B.t === 'zoom') {
    el = (
      <>
        <Mapa f={f} dados={est} mostra={() => 1} foco={[B.estado]} zoom={B.estado} pZoom={prog(g, 0, 26, EIO)} min={c.min} max={c.max} x={0} y={110} w={1250} />
        <div style={{ position: 'absolute', left: 1180, top: 290, width: 700 }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 92, color: K.texto, opacity: prog(g, 6, 16) }}>{B.titulo}</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 30, color: K.mudo, marginTop: 10, opacity: prog(g, 10, 20), lineHeight: 1.35 }}>{B.sub}</div>
        </div>
        {B.carimbo && <Carimbo f={g} a={Math.round(dur * 0.5)} texto={B.carimbo} cor={K.sinal} tam={120} x={1500} y={820} rot={-8} />}
      </>
    );
  } else {
    el = (
      <>
        <Mapa f={f} dados={est} mostra={(e) => prog(g, (50 - e.rank) * 0.6, (50 - e.rank) * 0.6 + 10)} min={c.min} max={c.max} x={300} y={150} w={1320} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: prog(g, 4, 14) }}>
          <span style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 80, color: K.texto }}>{B.titulo || 'All 50 states. '}</span>
          <span style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 80, color: K.sinal }}>{B.destaque || 'Ranked.'}</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FT.mono, fontWeight: 700, fontSize: 26, color: K.mudo, letterSpacing: 4, opacity: prog(g, 20, 40) }}>{B.fonte}</div>
      </>
    );
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${tr.x}px, ${tr.y}px)` }}>
      {el}
      {marcos.slice(1).map((a, k) => <Flash key={k} f={f} a={a} forca={0.2} />)}
    </AbsoluteFill>
  );
};

/** gancho genérico do Quanto Você Dura?: batidas descritas no spec (titulo, numeros, hud, escolha) */
export const GanchoQVD: React.FC<LProps> = ({ c: cena, f, marcos, id }) => {
  const m = (k: number) => marco(marcos, k);
  const b = Math.max(0, marcos.filter((x) => x <= f).length - 1);
  const g = f - m(b);
  const dur = (b + 1 < marcos.length ? m(b + 1) : m(b) + 150) - m(b);
  const B = cena.batidas[Math.min(b, cena.batidas.length - 1)];
  const tr = tremor(f, m(b) + 2, 16);
  const foto = (arq: string, esc: number, filtro = 'sepia(0.5) contrast(1.15) brightness(0.75)') => (
    <Img src={staticFile(`l/${id}/${arq}`)} style={{ position: 'absolute', inset: 0, width: LW, height: LH, objectFit: 'cover', transform: `scale(${esc})`, filter: filtro }} />
  );
  let c: React.ReactNode = null;
  if (B.t === 'titulo') {
    c = (
      <>
        {foto(B.foto, lerp(1.35, 1.12, prog(g, 0, 60, EO)))}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', transform: `scale(${2 - spr(g, 6, { damping: 10, stiffness: 280 })})`, opacity: prog(g, 6, 10) }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 40, color: '#e9c46a', letterSpacing: 8 }}>{B.acima}</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: B.tam || 170, color: '#f4ecdd', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>{B.titulo}</div>
        </div>
        <Flash f={g} a={6} />
      </>
    );
  } else if (B.t === 'numeros') {
    const n = B.itens.length;
    const k = Math.min(n - 1, Math.floor(g / (dur / n)));
    const gk = g - k * (dur / n);
    c = (
      <>
        {foto(B.fotos[k % B.fotos.length], lerp(1.25, 1.1, prog(gk, 0, dur / n)), 'sepia(0.6) contrast(1.2) brightness(0.5)')}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', transform: `scale(${2.2 - 1.2 * spr(gk, 2, { damping: 9, stiffness: 320 })}) translate(${tremor(gk, 4, 14).x}px, 0)` }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 240, color: k === B.vermelho ? '#e5484d' : '#f4ecdd', lineHeight: 1, textShadow: '0 10px 50px rgba(0,0,0,0.9)' }}>{B.itens[k][0]}</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 46, color: '#e9c46a', letterSpacing: 6 }}>{B.itens[k][1]}</div>
        </div>
        <Flash f={gk} a={2} forca={0.3} />
      </>
    );
  } else if (B.t === 'hud') {
    c = (
      <>
        {foto(B.foto, lerp(1.05, 1.15, prog(g, 0, 90)), 'sepia(0.5) contrast(1.1) brightness(0.5)')}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 760, transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * spr(g, 0)})`, padding: '36px 44px', borderRadius: 22, background: 'rgba(12,10,8,0.88)', border: '2px solid rgba(233,196,106,0.5)' }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 30, color: '#e9c46a', letterSpacing: 3, marginBottom: 18 }}>{B.rotulo}</div>
          {B.barras.map(([k2, de, ate]: [string, number, number], i: number) => {
            const v = lerp(de, ate, prog(g, 18 + i * 6, 50 + i * 6, EIO));
            const cor = v > 55 ? '#7bc47f' : v > 25 ? '#e9c46a' : '#e5484d';
            return (
              <div key={k2} style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FT.sans, fontWeight: 600, fontSize: 36, color: '#efe6d6' }}><span>{k2}</span><span style={{ fontFamily: FT.mono }}>{Math.round(v)}</span></div>
                <div style={{ height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.1)', marginTop: 8 }}><div style={{ height: '100%', width: `${v}%`, borderRadius: 9, background: cor }} /></div>
              </div>
            );
          })}
        </div>
      </>
    );
  } else {
    const s1 = spr(g, 0, { damping: 12, stiffness: 240 }), s2 = spr(g, 8, { damping: 12, stiffness: 240 });
    const lado = (L: any, x: number, s: number, dir: number) => (
      <div style={{ position: 'absolute', left: x, top: 0, width: LW / 2, height: LH, overflow: 'hidden', transform: `translateX(${(1 - s) * dir * LW / 2}px)` }}>
        <Img src={staticFile(`l/${id}/${L.foto}`)} style={{ width: LW / 2, height: LH, objectFit: 'cover', filter: 'sepia(0.5) brightness(0.6)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: L.tam || 130, color: L.cor, textShadow: '0 8px 30px rgba(0,0,0,0.9)' }}>{L.texto}</div>
      </div>
    );
    c = (
      <>
        {lado(B.a, 0, s1, -1)}
        {lado(B.b, LW / 2, s2, 1)}
        <div style={{ position: 'absolute', left: LW / 2 - 70, top: LH / 2 - 70, width: 140, height: 140, borderRadius: '50%', background: '#0c0a08', border: '4px solid #e9c46a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: 60, color: '#e9c46a', opacity: prog(g, 16, 22), transform: `scale(${spr(g, 16)})` }}>OU</div>
      </>
    );
  }
  return (
    <AbsoluteFill style={{ background: '#0c0a08', transform: `translate(${tr.x}px, ${tr.y}px)` }}>
      {c}
      {marcos.slice(1).map((a, k) => <Flash key={k} f={f} a={a} forca={0.25} />)}
    </AbsoluteFill>
  );
};
