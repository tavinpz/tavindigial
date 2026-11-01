// P1 (claro) — "O funil": 47 mensagens por dia caem no funil da Thata; do outro lado só sai consulta marcada.
// Referência: legenda cinética + palavra-fantasma ao fundo + etiqueta de fita + objetos com profundidade.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Legenda, Fantasma, NumGrande, Icone, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_P1 = 600;
const TIPOS = [['Quanto custa?', 'chat'], ['Ligação perdida', 'fone'], ['Tem horário?', 'agenda'], ['Remarcar', 'volta'], ['Endereço?', 'chat'], ['Quero marcar', 'agenda']];
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

const Fita: React.FC<{ t: string; ini: number; fim?: number; x: number; y: number; rot?: number }> = ({ t, ini, fim, x, y, rot = -3 }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = molaViva(f, ini);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(-50%) rotate(${rot}deg) scale(${s})`, opacity: saida(f, fim, 8), zIndex: 70 }}>
      <div style={{ padding: '14px 26px', background: '#fff', boxShadow: '0 14px 30px -12px rgba(11,20,17,.45)', fontFamily: G, fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', color: C.ink, whiteSpace: 'nowrap', clipPath: 'polygon(1% 4%, 99% 0, 100% 95%, 0 100%)' }}>{t}</div>
    </div>
  );
};

const Mini: React.FC<{ i: number; x: number; y: number; s?: number; verde?: boolean }> = ({ i, x, y, s = 1, verde }) => {
  const [t, ic] = TIPOS[i % TIPOS.length];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 150 * s, height: 190 * s, borderRadius: 22 * s, background: verde ? C.verde : i % 5 === 2 ? C.ink : i % 3 === 0 ? '#E8EDEA' : '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 16px 30px -18px rgba(11,20,17,.45)', padding: 14 * s, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ width: 44 * s, height: 44 * s, borderRadius: 99, background: verde ? 'rgba(255,255,255,.25)' : i % 5 === 2 ? 'rgba(255,255,255,.12)' : C.menta, display: 'grid', placeItems: 'center' }}>
        <Icone n={verde ? 'ok' : ic} tam={24 * s} cor={verde || i % 5 === 2 ? '#fff' : C.verde} traco={2.4} />
      </div>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 20 * s, lineHeight: 1.15, color: verde || i % 5 === 2 ? '#fff' : C.ink }}>{verde ? 'Consulta marcada' : t}</div>
    </div>
  );
};

export const P1: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  // fase 1: grade de 24 cartões; fase 2: eles sobem e caem no funil; fase 3: saem 4 verdes e vão para a agenda
  const grade = Array.from({ length: 24 }, (_, i) => ({ i, gx: 120 + (i % 6) * 145, gy: 760 + Math.floor(i / 6) * 200 }));
  const FX = 540, FY = 900; // boca do funil
  const funil = mola(f, 196);
  const saem = [0, 1, 2, 3].map((k) => ({ k, ini: 300 + k * 14 }));
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [300, 1300], [400, 900]])} />
      <Fantasma t="MENSAGENS" ini={0} fim={196} y={560} />
      <Fantasma t="FILTRO" ini={196} fim={380} y={560} vel={1.6} />
      <Fantasma t="AGENDA" ini={380} fim={500} y={560} />

      {/* contador */}
      <div style={{ position: 'absolute', top: 420, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(lerp(f, 4, 14, 0, 1), saida(f, 200, 10)) }}>
        <NumGrande de={0} ate={47} ini={6} dur={70} tam={200} />
        <div style={{ fontFamily: M, fontSize: 30, color: C.fg2, marginTop: 6 }}>mensagens hoje · 10:42</div>
      </div>

      {/* cartões: grade → funil */}
      {grade.map(({ i, gx, gy }) => {
        const ent = mola(f, 24 + i * 2.5, { damping: 15, stiffness: 160, mass: 0.6 });
        if (ent <= 0.01) return null;
        const t0 = 206 + i * 3.4;
        const p = interpolate(f, [t0, t0 + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.55, 0, 0.3, 1) });
        const x = interpolate(p, [0, 1], [gx, FX - 30 + (rnd(i, 1) - 0.5) * 60]);
        const y = interpolate(p, [0, 1], [gy, FY + 120]) - Math.sin(p * Math.PI) * (420 + rnd(i, 2) * 200);
        const s = interpolate(p, [0, 0.7, 1], [0.92, 0.6, 0.2]);
        const o = p > 0.92 ? 0 : 1;
        return <div key={i} style={{ position: 'absolute', left: 0, top: 0, opacity: o * Math.min(1, ent * 2), transform: `translate(${x}px, ${y + (1 - ent) * 60}px) rotate(${(rnd(i, 3) - 0.5) * 30 * p}deg)`, zIndex: p > 0.5 ? 10 : 30 }}><Mini i={i} x={0} y={0} s={s} /></div>;
      })}

      {/* o funil */}
      {f >= 190 && (
        <div style={{ position: 'absolute', left: FX - 260, top: FY + 60, width: 520, height: 330, transform: `scale(${funil * (1 - lerp(f, 380, 400, 0, 0.3))})`, opacity: saida(f, 400, 18), transformOrigin: '50% 0%', zIndex: 20 }}>
          <svg width={520} height={330} viewBox="0 0 520 330">
            <defs><linearGradient id="fg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#14241D" /><stop offset="1" stopColor="#0B1411" /></linearGradient></defs>
            <path d="M0 0 H520 L310 210 V330 H210 V210 Z" fill="url(#fg)" />
            <path d="M0 0 H520" stroke={C.luz} strokeWidth={6} />
          </svg>
          <div style={{ position: 'absolute', left: 230, top: 60, width: 60, height: 60, borderRadius: 18, background: C.verde, display: 'grid', placeItems: 'center', boxShadow: `0 0 ${20 + Math.sin(f / 4) * 10}px rgba(95,227,161,.8)` }}>
            <div style={{ width: 20, height: 20, borderRadius: 99, background: '#fff' }} />
          </div>
        </div>
      )}

      {/* o que sai do funil */}
      {saem.map(({ k, ini }) => {
        if (f < ini) return null;
        const desce = mola(f, ini, { damping: 14, stiffness: 140, mass: 0.7 });
        const vaiAgenda = lerp(f, 392 + k * 6, 420 + k * 6, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
        const x0 = 150 + k * 205, y0 = 1330;
        const x1 = 250 + (k % 2) * 300, y1 = 850 + Math.floor(k / 2) * 230;
        const x = interpolate(desce, [0, 1], [FX - 75, x0]) * (1 - vaiAgenda) + x1 * vaiAgenda;
        const y = interpolate(desce, [0, 1], [FY + 300, y0]) * (1 - vaiAgenda) + y1 * vaiAgenda;
        return <div key={k} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px) scale(${0.6 + 0.4 * desce})`, zIndex: 40, opacity: saida(f, 492, 10) }}><Mini i={k} x={0} y={0} s={1.05} verde /></div>;
      })}

      {/* a agenda que recebe */}
      {f >= 386 && (
        <div style={{ position: 'absolute', left: 170, top: 700, width: 740, height: 620, borderRadius: 40, background: '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 50px 100px -50px rgba(11,20,17,.45)', opacity: Math.min(lerp(f, 386, 398, 0, 1), saida(f, 492, 10)), zIndex: 35 }}>
          <div style={{ padding: '30px 34px', fontFamily: G, fontWeight: 600, fontSize: 40, letterSpacing: '-0.035em', color: C.ink, display: 'flex', justifyContent: 'space-between' }}>Agenda de hoje <span style={{ fontFamily: M, fontWeight: 400, fontSize: 24, color: C.verde, alignSelf: 'center' }}>+4 novas</span></div>
        </div>
      )}

      <Fita t="Tudo cai no mesmo lugar" ini={60} fim={190} x={540} y={300} />
      <Fita t="Só o que vira consulta" ini={316} fim={384} x={540} y={300} rot={2} />
      <Fita t="Agenda cheia, recepção leve" ini={420} fim={492} x={540} y={420} rot={-2} />

      <Legenda frases={[
        [4, 60, 'Todo dia chegam dezenas de mensagens'],
        [62, 196, 'preço, horário, remarcação, ligação perdida e quem quer marcar'],
        [200, 300, 'A Thata responde cada uma, uma por uma'],
        [302, 386, 'e o que vira consulta cai direto na agenda'],
        [388, 492, 'sem ninguém da equipe parar o que está fazendo'],
      ]} y={1640} />
      {f >= 488 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 488, 500, 0, 1) }}><Fecho ini={494} frase={'Entra tudo.\n*Sai consulta.*'} /></div>}
    </AbsoluteFill>
  );
};
