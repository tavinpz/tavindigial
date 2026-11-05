import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { K, SET, FT } from './tema';
import { rnd } from '../lib/anim';
import { Img, staticFile } from 'remotion';
import { Mapa, quente } from './eua';
import gas from '../../public/l/lss001/estados.json';

const useFontes = () => {
  const [h] = useState(() => delayRender('fontes-capa'));
  useEffect(() => {
    Promise.all(['500', '700'].map((w) => document.fonts.load(`${w} 40px "Space Grotesk"`)).concat(document.fonts.load('700 40px "JetBrains Mono"'))).then(() => continueRender(h));
  }, [h]);
};

const Carta: React.FC<{ cor: string; nome: string; preco: string; w: number; rot: number; x: number; y: number; brilho?: boolean; x2?: boolean }> = ({ cor, nome, preco, w, rot, x, y, brilho, x2 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: w * 1.25, borderRadius: 18, background: '#f3f1ea', transform: `rotate(${rot}deg)`, boxShadow: brilho ? `0 0 80px ${cor}cc, 0 20px 50px rgba(0,0,0,0.6)` : '0 20px 50px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
    <div style={{ height: w * 0.32, background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: w * 0.105, color: '#111', textAlign: 'center', padding: '0 10px', lineHeight: 1.05 }}>{nome}</div>
    <div style={{ position: 'absolute', bottom: w * 0.3, width: '100%', textAlign: 'center', fontFamily: FT.disp, fontWeight: 700, fontSize: w * 0.2, color: '#111' }}>{preco}</div>
    {x2 && (
      <svg width={w} height={w * 1.25} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={w * 0.1} y1={w * 0.15} x2={w * 0.9} y2={w * 1.1} stroke={K.ruim} strokeWidth={w * 0.07} strokeLinecap="round" />
        <line x1={w * 0.9} y1={w * 0.15} x2={w * 0.1} y2={w * 1.1} stroke={K.ruim} strokeWidth={w * 0.07} strokeLinecap="round" />
      </svg>
    )}
  </div>
);

export const Capa: React.FC<{ v: string }> = ({ v }) => {
  useFontes();
  if (v.startsWith('lss')) {
    const est: any[] = gas as any;
    const mn = Math.min(...est.map((e) => e.v)), mx = Math.max(...est.map((e) => e.v));
    return (
      <AbsoluteFill style={{ background: K.bg }}>
        <Mapa f={0} dados={est} mostra={() => 1} foco={v === 'lss_b' ? ['Alabama', 'Mississippi'] : undefined} min={mn} max={mx} x={-40} y={70} w={950} />
        <div style={{ position: 'absolute', right: 40, top: 80, width: 470, textAlign: 'right' }}>
          {v === 'lss_a' ? (
            <>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 210, lineHeight: 0.9, color: '#ff6b3d', letterSpacing: -8 }}>$10</div>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 96, lineHeight: 1, color: K.texto }}>GAS</div>
              <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.mudo, marginTop: 24 }}>ALL 50 STATES RANKED</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 120, lineHeight: 0.95, color: K.texto, letterSpacing: -3 }}>BROKE</div>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 120, lineHeight: 0.95, color: '#ff4b3a', letterSpacing: -3 }}>FIRST</div>
              <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.mudo, marginTop: 24 }}>IF GAS HIT $10</div>
            </>
          )}
        </div>
      </AbsoluteFill>
    );
  }
  if (v.startsWith('qvd')) {
    const foto = v === 'qvd_a' ? 'bonde_virado_revolta_da_vacina_jpg.jpg' : 'na_noite_de_14_sucessos_lament_veis_jpg.jpg';
    return (
      <AbsoluteFill style={{ background: '#0c0a08' }}>
        <Img src={staticFile(`l/qvd001/${foto}`)} style={{ position: 'absolute', inset: 0, width: 1280, height: 720, objectFit: 'cover', filter: 'sepia(0.55) contrast(1.15) brightness(0.8)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.55) 48%, rgba(10,8,6,0) 75%)' }} />
        <div style={{ position: 'absolute', left: 50, top: 70, width: 640 }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 40, color: '#e9c46a', letterSpacing: 3 }}>RIO · 1904</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: v === 'qvd_a' ? 112 : 104, lineHeight: 0.98, color: '#f4ecdd', letterSpacing: -3, marginTop: 14 }}>{v === 'qvd_a' ? 'Você dura 1 semana?' : 'Vacina ou barricada?'}</div>
          <div style={{ marginTop: 34, width: 420, padding: '18px 22px', borderRadius: 14, background: 'rgba(12,10,8,0.85)', border: '1px solid rgba(233,196,106,0.4)' }}>
            {[['Saúde', 62, '#7bc47f'], ['Segurança', 8, '#e5484d']].map(([k, n, c]: any) => (
              <div key={k} style={{ marginTop: 8 }}>
                <div style={{ fontFamily: FT.sans, fontWeight: 600, fontSize: 26, color: '#efe6d6' }}>{k}</div>
                <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.12)', marginTop: 6 }}><div style={{ height: '100%', width: `${n}%`, borderRadius: 7, background: c }} /></div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  const fundo = <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 80% at 35% 50%, #1b2233 0%, ${K.bg} 75%)` }} />;
  if (v === 'a') {
    return (
      <AbsoluteFill>
        {fundo}
        <Carta cor={SET.orange} nome="ST. JAMES PLACE" preco="$180" w={250} rot={-12} x={70} y={190} />
        <Carta cor={SET.orange} nome="NEW YORK AVE" preco="$200" w={250} rot={10} x={330} y={190} />
        <Carta cor={SET.orange} nome="TENNESSEE AVE" preco="$180" w={290} rot={-1} x={190} y={140} brilho />
        <div style={{ position: 'absolute', right: 50, top: 120, textAlign: 'right' }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 290, lineHeight: 0.9, color: SET.orange, letterSpacing: -10, textShadow: '0 10px 50px rgba(0,0,0,0.7)' }}>50%</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 92, color: K.texto, marginTop: 10 }}>WIN RATE</div>
        </div>
        <div style={{ position: 'absolute', left: 60, bottom: 34, fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.sinal }}>10,000 GAMES</div>
      </AbsoluteFill>
    );
  }
  if (v === 'b') {
    return (
      <AbsoluteFill>
        {fundo}
        <Carta cor={SET.darkblue} nome="PARK PLACE" preco="$350" w={300} rot={-8} x={80} y={120} x2 />
        <Carta cor={SET.darkblue} nome="BOARDWALK" preco="$400" w={300} rot={6} x={330} y={150} x2 />
        <div style={{ position: 'absolute', right: 50, top: 150, width: 560, textAlign: 'right' }}>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: K.texto, letterSpacing: -4 }}>STOP</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: K.ruim, letterSpacing: -4 }}>BUYING</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 36, color: K.mudo, marginTop: 26 }}>WE RAN 10,000 GAMES</div>
        </div>
      </AbsoluteFill>
    );
  }
  // c: o mosaico das 10.000 partidas
  const cores = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue'];
  const peso = [1, 24, 36, 50, 30, 27, 14, 17];
  const tot = peso.reduce((a, b) => a + b, 0);
  const pick = (r: number) => { let a = 0; for (let i = 0; i < 8; i++) { a += peso[i] / tot; if (r < a) return cores[i]; } return 'orange'; };
  const cells = [];
  for (let i = 0; i < 64 * 36; i++) cells.push(pick(rnd(i * 3.1)));
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(64, 20px)', opacity: 0.95 }}>
        {cells.map((c, i) => <div key={i} style={{ width: 16, height: 16, margin: 2, borderRadius: 3, background: SET[c], opacity: c === 'orange' ? 1 : 0.16 }} />)}
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(13,16,22,0.92) 30%, rgba(13,16,22,0.2) 100%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 170, color: K.texto, letterSpacing: -6 }}>10,000</div>
        <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 110, color: SET.orange, marginTop: -6 }}>ONE WINNER</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MarcaTTR: React.FC<{ v: string }> = ({ v }) => {
  useFontes();
  const grade = (tam: number, gap: number) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${tam}px)`, gap }}>
      {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ width: tam, height: tam, borderRadius: tam * 0.18, background: i === 4 ? K.sinal : '#4a556e' }} />)}
    </div>
  );
  // Last State Standing: barras caídas e uma em pé
  const barras = (u: number) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: u * 0.28, height: u * 4.2 }}>
      {[0.9, 1.4, 0.7, 1.15, 4.2].map((h, i) => <div key={i} style={{ width: u, height: u * h, borderRadius: `${u * 0.22}px ${u * 0.22}px ${u * 0.08}px ${u * 0.08}px`, background: i === 4 ? '#ff6b3d' : '#4a556e' }} />)}
    </div>
  );
  // Quanto Você Dura?: ampulheta
  const ampulheta = (h: number) => (
    <svg width={h * 0.66} height={h} viewBox="0 0 200 300">
      <rect x="10" y="6" width="180" height="22" rx="8" fill="#e9c46a" />
      <rect x="10" y="272" width="180" height="22" rx="8" fill="#e9c46a" />
      <path d="M38 34 C38 120 92 130 92 150 C92 170 38 180 38 266 L162 266 C162 180 108 170 108 150 C108 130 162 120 162 34 Z" fill="none" stroke="#efe6d6" strokeWidth="10" strokeLinejoin="round" />
      <path d="M62 92 L138 92 C130 118 104 128 100 146 C96 128 70 118 62 92 Z" fill="#e9c46a" />
      <rect x="97" y="146" width="6" height="90" fill="#e9c46a" />
      <path d="M52 258 C70 214 130 214 148 258 Z" fill="#e5484d" />
    </svg>
  );
  if (v === 'lss_logo') return <AbsoluteFill style={{ background: K.bg, alignItems: 'center', justifyContent: 'center', paddingLeft: 10 }}>{barras(92)}</AbsoluteFill>;
  if (v === 'qvd_logo') return <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #2a2118 0%, #0c0a08 70%)', alignItems: 'center', justifyContent: 'center' }}>{ampulheta(520)}</AbsoluteFill>;
  if (v === 'lss_banner') {
    const est: any[] = gas as any;
    const mn = Math.min(...est.map((e) => e.v)), mx = Math.max(...est.map((e) => e.v));
    return (
      <AbsoluteFill style={{ background: K.bg }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}><Mapa f={0} dados={est} mostra={() => 1} min={mn} max={mx} x={330} y={-60} w={1900} /></div>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 42% 26% at 50% 50%, rgba(13,16,22,0.96) 55%, rgba(13,16,22,0) 100%)' }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 56 }}>
          {barras(30)}
          <div>
            <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 124, color: K.texto, letterSpacing: -3, lineHeight: 1 }}>Last State Standing</div>
            <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: '#ff6b3d', marginTop: 14, letterSpacing: 2 }}>ALL 50 STATES. REAL NUMBERS. ONE RANKING.</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (v === 'qvd_banner') {
    const fotos = ['cais_do_porto_2_acervo_do_instituto_more.jpg', 'bonde_virado_revolta_da_vacina_jpg.jpg', 'avenida_central_2_acervo_do_instituto_mo.jpg', 'na_noite_de_14_sucessos_lament_veis_jpg.jpg', 'canteiro_de_obras_pr_ximo_ao_largo_da_mi.jpg'];
    return (
      <AbsoluteFill style={{ background: '#0c0a08', flexDirection: 'row' }}>
        {fotos.map((a) => <Img key={a} src={staticFile(`l/qvd001/${a}`)} style={{ width: 512, height: 1440, objectFit: 'cover', filter: 'sepia(0.6) contrast(1.1) brightness(0.55)', borderRight: '6px solid #0c0a08' }} />)}
        <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(12,10,8,0) 22%, rgba(12,10,8,0.93) 40%, rgba(12,10,8,0.93) 60%, rgba(12,10,8,0) 78%)' }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 50 }}>
          {ampulheta(230)}
          <div>
            <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 132, color: '#f4ecdd', letterSpacing: -3, lineHeight: 1 }}>Quanto Você Dura?</div>
            <div style={{ fontFamily: FT.sans, fontWeight: 600, fontSize: 42, color: '#e9c46a', marginTop: 16 }}>Você acorda em outra época do Brasil. Quanto tempo sobrevive?</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (v === 'logo') {
    return <AbsoluteFill style={{ background: K.bg, alignItems: 'center', justifyContent: 'center' }}>{grade(150, 40)}</AbsoluteFill>;
  }
  // banner 2560x1440, área segura central 1546x423
  const cores = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue'];
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(128, 20px)', opacity: 0.5 }}>
        {Array.from({ length: 128 * 72 }, (_, i) => <div key={i} style={{ width: 14, height: 14, margin: 3, borderRadius: 3, background: rnd(i) > 0.93 ? SET[cores[Math.floor(rnd(i * 7) * 8)]] : '#1d2433' }} />)}
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 45% 30% at 50% 50%, rgba(13,16,22,0.97) 55%, rgba(13,16,22,0) 100%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 50 }}>
        {grade(46, 12)}
        <div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 120, color: K.texto, letterSpacing: -3, lineHeight: 1 }}>Ten Thousand Runs</div>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 34, color: K.sinal, marginTop: 14, letterSpacing: 2 }}>WE SIMULATE IT 10,000 TIMES SO YOU DON'T HAVE TO</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
