// C3 (claro) — "Onde estaciona?": a Thata manda endereço, estacionamento e horário; o mapa do balão vira a tela e a paciente chega.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { getLength, getPointAtLength } from '@remotion/paths';
import { C, G, M, Fundo, Titulo, Conversa, Icone, Fecho, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_C3 = 600;
const W = 640;
const ROTA = 'M 160 1660 L 160 1300 L 420 1300 L 420 980 L 760 980 L 760 720 L 640 720';
const RUAS = [
  'M 0 1300 L 1080 1300', 'M 0 980 L 1080 980', 'M 0 720 L 1080 720', 'M 0 1580 L 1080 1580', 'M 0 460 L 1080 460',
  'M 160 0 L 160 1920', 'M 420 0 L 420 1920', 'M 760 0 L 760 1920', 'M 980 0 L 980 1920',
];

export const C3: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const mapa = lerp(f, 286, 320, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const L = getLength(ROTA);
  const pr = lerp(f, 340, 430, 0, 1, Easing.bezier(0.45, 0, 0.25, 1));
  const pt = getPointAtLength(ROTA, Math.max(0.01, L * pr));
  const desenha = lerp(f, 318, 344, 0, 1);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [280, 960]])} />
      {/* conversa */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, opacity: 1 - mapa, transform: `translateY(${(1 - mola(f, 70, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px) scale(${1 + mapa * 0.8})`, transformOrigin: '60% 70%' }}>
        <Conversa w={W} nome="Júlia A." sub="WhatsApp da clínica" tam={29} msgs={[
          { t: 'Oi! A consulta é amanhã às 9h, né? Onde fica e tem onde estacionar?', f: 90, hora: '18:20' },
          { t: 'Isso, Júlia, amanhã às 9h! Fica na Rua das Acácias, 120.', f: 140, eu: true, ia: true, hora: '18:20' },
          { f: 166, eu: true, local: 'Clínica Aurora · Rua das Acácias, 120' },
          { t: 'Tem estacionamento conveniado na esquina. Chegue uns 10 min antes pra fazer o cadastro.', f: 200, eu: true, hora: '18:21' },
          { t: 'Perfeito, obrigada!', f: 244, hora: '18:22' },
        ]} />
      </div>

      {/* o mapa ocupa a tela */}
      {f >= 286 && (
        <AbsoluteFill style={{ opacity: mapa, transform: `scale(${0.6 + 0.4 * mapa})`, background: '#EAF2EE' }}>
          {[[180, 1000, 220, 280], [440, 1000, 300, 280], [180, 740, 220, 220], [440, 480, 300, 220], [780, 1000, 180, 280], [780, 740, 180, 220], [180, 1320, 220, 240], [440, 1320, 300, 240], [780, 1320, 180, 240], [180, 480, 220, 220]].map(([x, y, w, h], i) => (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, background: i === 3 ? '#D7EEDF' : '#F7FAF8', border: `2px solid ${C.linha}` }} />
          ))}
          <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
            {RUAS.map((d, i) => <path key={i} d={d} stroke="#fff" strokeWidth={36} fill="none" />)}
            <path d={ROTA} stroke={C.verde} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * desenha} ${L}`} opacity={0.35} />
            <path d={ROTA} stroke={C.verde} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * pr} ${L}`} />
          </svg>
          {/* estacionamento */}
          <div style={{ position: 'absolute', left: 800, top: 540, width: 110, height: 110, borderRadius: 26, background: '#2D6CDF', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 700, fontSize: 70, transform: `scale(${molaViva(f, 330)})` }}>P</div>
          <div style={{ position: 'absolute', left: 780, top: 664, fontFamily: M, fontSize: 24, color: C.fg2, opacity: lerp(f, 340, 352, 0, 1) }}>conveniado</div>
          {/* clínica */}
          <div style={{ position: 'absolute', left: 640 - 44, top: 720 - 120, transform: `scale(${molaViva(f, 322)})`, transformOrigin: '50% 100%' }}>
            <svg width={88} height={120} viewBox="0 0 24 32"><path d="M12 31s-11-10-11-19a11 11 0 0 1 22 0c0 9-11 19-11 19z" fill={C.alerta} /><circle cx="12" cy="12" r="4.5" fill="#fff" /></svg>
          </div>
          <div style={{ position: 'absolute', left: 470, top: 530, padding: '14px 22px', borderRadius: 18, background: '#fff', boxShadow: '0 16px 36px -18px rgba(11,20,17,.4)', fontFamily: G, fontWeight: 600, fontSize: 28, color: C.ink, transform: `scale(${molaViva(f, 326)})`, transformOrigin: '50% 100%' }}>Clínica Aurora</div>
          {/* ela, chegando */}
          {f >= 334 && (
            <div style={{ position: 'absolute', left: pt.x - 34, top: pt.y - 34, width: 68, height: 68, borderRadius: 99, background: '#fff', border: `6px solid ${C.verde}`, display: 'grid', placeItems: 'center', boxShadow: '0 12px 30px -10px rgba(21,167,99,.7)', transform: `scale(${molaViva(f, 334)})` }}>
              <Icone n="pessoa" tam={32} cor={C.verde} traco={2.4} />
            </div>
          )}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1720, display: 'flex', justifyContent: 'center', opacity: lerp(f, 344, 356, 0, 1) * saida(f, 432, 8) }}>
            <div style={{ fontFamily: M, fontSize: 32, color: C.prof }}>08:42 · chegando · {Math.max(0, Math.round(8 * (1 - pr)))} min</div>
          </div>
        </AbsoluteFill>
      )}
      {/* chegou */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1630, display: 'flex', justifyContent: 'center' }}>
        <Surge ini={434} fim={490}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '24px 36px', borderRadius: 999, background: C.ink, color: '#fff', fontFamily: G, fontWeight: 600, fontSize: 36, letterSpacing: '-0.02em', boxShadow: '0 30px 60px -24px rgba(11,20,17,.6)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 99, background: C.luz }} /> Júlia chegou · 08:50 · 10 min antes
          </div>
        </Surge>
      </div>

      <div style={{ position: 'absolute', top: 760, left: 0, right: 0 }}>
        <Titulo t={'Primeira consulta.\nE ela *não conhece o caminho.*'} ini={6} fim={74} tam={76} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="Endereço, estacionamento, *horário.*" ini={96} fim={280} tam={60} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, zIndex: 10 }}>
        <Titulo t="No dia seguinte…" ini={300} fim={376} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, zIndex: 10 }}>
        <Titulo t="ela chega *sem se perder.*" ini={380} fim={490} tam={66} />
      </div>
      {f >= 484 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 484, 496, 0, 1) }}><Fecho ini={490} frase={'Do primeiro oi\n*até a cadeira.*'} /></div>}
    </AbsoluteFill>
  );
};
