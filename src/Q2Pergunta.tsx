// Q2 (escuro) — "A mesma pergunta": "aceita convênio?" chega de 26 jeitos diferentes; as perguntas se juntam e desenham
// um ponto de interrogação gigante. O ponto verde da Thata vira o pingo do "?", e uma onda verde responde todas.
// Padrões de estúdio: tipografia cinética que se reorganiza numa forma, ritmo acelerando, onda de cor percorrendo um caminho, colapso para um elemento só.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Legenda, Fantasma, NumGrande, Titulo, Mono, Ponto, Bolha, Fecho, lerp, saida, mola, molaViva, chaves, usaTema, Narrada } from './kit';

export const DUR_Q2 = 600;
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const PERG = [
  'Aceita convênio?', 'aceita plano?', 'vcs pegam convênio', 'atende pelo plano?', 'convênio ou só particular?', 'meu plano cobre?',
  'tem reembolso?', 'aceita plano odonto?', 'pelo convênio fica quanto?', 'atende plano da empresa?', 'precisa de guia?', 'convenio??',
  'aceitam meu plano?', 'só particular?', 'plano cobre limpeza?', 'vcs são credenciados?', 'tem convênio aí?', 'aceita o meu?',
  'plano de saúde serve?', 'com plano pago algo?', 'convênio no sábado?', 'quais planos vcs aceitam?', 'aceita convenio', 'é pelo plano?',
  'cobre clareamento?', 'plano familiar serve?',
];
const N = PERG.length;
const surge = (i: number) => (i === 0 ? 6 : 44 + 150 * (1 - (1 - i / N) ** 2));

// o desenho do "?": arco por cima, curva para dentro e a haste; amostrado por comprimento
const CAMINHO = (() => {
  const pts: [number, number][] = [];
  for (let a = 205; a >= -35; a -= 2) { const r = (a * Math.PI) / 180; pts.push([540 + 240 * Math.cos(r), 690 - 240 * Math.sin(r)]); }
  const [x0, y0] = pts[pts.length - 1];
  for (let t = 0; t <= 1; t += 0.02) { const u = 1 - t; pts.push([u * u * x0 + 2 * u * t * 560 + t * t * 540, u * u * y0 + 2 * u * t * 960 + t * t * 1010]); }
  for (let y = 1010; y <= 1150; y += 4) pts.push([540, y]);
  const acum = [0];
  for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = acum[acum.length - 1];
  return Array.from({ length: N }, (_, k) => {
    const alvo = (k / (N - 1)) * tot;
    const i = acum.findIndex((d) => d >= alvo);
    return pts[Math.max(0, i)];
  });
})();
const PINGO: [number, number] = [540, 1290];

const Pilula: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const t0 = surge(i);
  if (f < t0) return null;
  const s = molaViva(f, t0);
  // espalhada → no "?" → some no centro
  // grade com folga (a faixa do meio fica para a primeira pergunta), com um pouco de desordem
  const c = (i - 1) % 3, r0 = Math.floor((i - 1) / 3), r = r0 >= 4 ? r0 + 1 : r0;
  const sx = i === 0 ? 540 : 250 + c * 290 + (rnd(i, 1) - 0.5) * 70, sy = i === 0 ? 900 : (r < 4 ? 390 + r * 118 : 1060 + (r - 5) * 118) + (rnd(i, 2) - 0.5) * 30;
  const tam = i === 0 ? 64 : 26 + rnd(i, 3) * 12;
  const k = N - 1 - i; // a primeira pergunta fica perto do pingo
  const [px, py] = CAMINHO[k];
  const vai = lerp(f, 196 + rnd(i, 4) * 26, 238 + rnd(i, 4) * 26, 0, 1, Easing.bezier(0.7, 0, 0.2, 1));
  const verde = f >= 300 + i * 3;
  const junta = lerp(f, 372 + rnd(i, 6) * 14, 396, 0, 1, Easing.bezier(0.6, 0, 0.9, 0.4));
  const x = interpolate(vai, [0, 1], [sx, px]) * (1 - junta) + 540 * junta;
  const y = interpolate(vai, [0, 1], [sy, py]) * (1 - junta) + 900 * junta;
  const t = interpolate(vai, [0, 1], [tam, 22]) * (1 - junta * 0.8);
  const o = Math.min(1, s * 2) * (junta > 0.95 ? 0 : 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * s}) rotate(${(1 - vai) * (rnd(i, 5) - 0.5) * 10}deg)`, opacity: o, zIndex: 10 + i }}>
      <div style={{ padding: `${t * 0.42}px ${t * 0.66}px`, borderRadius: t, borderBottomLeftRadius: t * 0.2, background: verde ? C.verde : '#E9F1EC', color: verde ? '#06100C' : '#0B1411', fontFamily: G, fontWeight: 600, fontSize: t, letterSpacing: '-0.02em', whiteSpace: 'nowrap', boxShadow: verde ? `0 0 ${24 * (1 - lerp(f, 300 + i * 3, 330 + i * 3, 0, 1))}px rgba(95,227,161,.9)` : '0 14px 30px -14px rgba(0,0,0,.7)' }}>
        {verde && f < 372 ? '✓ ' : ''}{PERG[i]}
      </div>
    </div>
  );
};

export const Q2: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const zoom = chaves(f, [[0, 1.12], [44, 1], [196, 0.96], [250, 1], [372, 1.02], [400, 1]]);
  const quedaPingo = chaves(f, [[250, -100], [270, PINGO[1]]], Easing.bezier(0.55, 0, 0.9, 0.45));
  const pingo = mola(f, 250, { damping: 10, stiffness: 140, mass: 0.7 });
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [250, 1290], [300, 900]])} brilho={chaves(f, [[0, 0.15], [260, 0.2], [285, 1]])} />
      <Fantasma t="DE NOVO" ini={0} fim={250} y={1500} tam={360} vel={1.8} />
      <Fantasma t="RESPONDIDA" ini={290} fim={480} y={1500} tam={320} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 900px' }}>
        {PERG.map((_, i) => <Pilula key={i} i={i} />)}
        {f >= 250 && f < 400 && <Ponto x={PINGO[0]} y={quedaPingo} r={44 * Math.max(0.3, pingo) * (1 - lerp(f, 372, 396, 0, 1))} />}
        {f >= 270 && f < 330 && <div style={{ position: 'absolute', left: 540 - lerp(f, 270, 330, 0, 700), top: PINGO[1] - lerp(f, 270, 330, 0, 700), width: lerp(f, 270, 330, 0, 1400), height: lerp(f, 270, 330, 0, 1400), borderRadius: '50%', border: `4px solid ${C.vivo}`, opacity: lerp(f, 270, 330, 0.8, 0) }} />}
      </div>

      {/* contador */}
      <div style={{ position: 'absolute', top: 150, left: 70, opacity: Math.min(lerp(f, 50, 60, 0, 1), saida(f, 200, 8)) }}>
        <NumGrande de={1} ate={38} ini={50} dur={150} tam={150} pos="ª" />
        <div style={{ fontFamily: M, fontSize: 26, color: C.fg2, marginTop: 6 }}>vez no mês · exemplo ilustrativo</div>
      </div>
      <div style={{ position: 'absolute', top: 150, right: 70, opacity: saida(f, 44, 6) }}><Mono t="segunda · 08:03" ini={2} tam={30} /></div>

      <div style={{ position: 'absolute', top: 200, left: 60, right: 60 }}>
        <Titulo t={'A *mesma* pergunta.'} ini={214} fim={294} tam={92} />
      </div>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60 }}>
        <Titulo t={'Respondida. *Todas.*'} ini={300} fim={392} tam={92} />
      </div>

      {/* depois do colapso: uma conversa só, como a Thata responde */}
      {f >= 396 && (
        <div style={{ position: 'absolute', left: 110, right: 110, top: 620, display: 'flex', flexDirection: 'column', gap: 18, opacity: saida(f, 486, 10) }}>
          <Bolha t="Aceita convênio?" ini={398} tam={38} max={700} />
          <Bolha t="Aceitamos convênio e particular 🙂 Me diz qual é o seu plano que eu confiro e já vejo um horário pra você." ini={410} eu ia tam={38} max={760} />
          <Bolha t="É o plano da empresa" ini={432} tam={38} max={700} />
          <Bolha t="Esse a clínica atende! Tenho quinta 9h ou sexta 15h. Qual fica melhor?" ini={446} eu ia tam={38} max={760} />
        </div>
      )}
      <div style={{ position: 'absolute', top: 300, left: 60, right: 60 }}>
        <Titulo t={'Resposta certa, *na hora.*'} ini={400} fim={484} tam={80} />
      </div>
      <div style={{ position: 'absolute', top: 1500, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3, opacity: Math.min(lerp(f, 410, 420, 0, 1), saida(f, 484, 8)) }}>clínica fictícia · Thata é uma IA</div>

      <Narrada id="Q2" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Pergunta repetida?\n*Resposta na hora.*'} /></div>}
    </AbsoluteFill>
  );
};
