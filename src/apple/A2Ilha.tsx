// A2 — "O celular não para" (tela de bloqueio, ilha que expande, notificações empilhando; só música)
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { P, F, Texto, Icone, Estrelas, Fecho, lerp, chaves, mola } from '../leve/kit';
import { Preto, Fone3D, Aura, Centro, Reflexo } from './kitA';

export const DUR_A2 = 450;
const W = 580; const TW = W - W * 0.056; // largura da tela
const NOT = [
  { e: 96, ic: 'whats', cor: '#1DAA61', app: 'WhatsApp', t: 'Oi! Vocês têm horário amanhã?' },
  { e: 111, ic: 'estrela', cor: '#F5A524', app: 'Google', t: 'Nova avaliação', est: true },
  { e: 126, ic: 'agenda', cor: P.el, app: 'Agenda', t: '3 horários marcados hoje' },
  { e: 141, ic: 'chat', cor: '#E1306C', app: 'Instagram', t: 'Nova mensagem no direct' },
  { e: 156, ic: 'site', cor: P.vio, app: 'Seu site', t: '28 visitas hoje' },
  { e: 171, ic: 'whats', cor: '#1DAA61', app: 'WhatsApp', t: 'Quero agendar uma avaliação' },
  { e: 186, ic: 'agenda', cor: P.el, app: 'Agenda', t: 'Novo horário: sáb, 10:30' },
];
const H = 128;

const Tela: React.FC = () => {
  const f = useCurrentFrame();
  const ilha = mola(f, 46, 30, { damping: 14, stiffness: 150, mass: 0.8 }) * (1 - mola(f, 84, 30, { damping: 16, stiffness: 160, mass: 0.7 }));
  const iw = 152 + (TW - 40 - 152) * ilha, ih = 42 + (150 - 42) * ilha;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: F }}>
      {/* papel de parede */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #1B0533 0%, #4B0CA6 45%, #B600F6 80%, #FEA8FF 120%)' }} />
      <div style={{ position: 'absolute', width: 700, height: 700, left: -200 + Math.sin(f / 40) * 40, top: 620 + Math.cos(f / 50) * 40, borderRadius: 999, background: 'radial-gradient(circle, rgba(254,168,255,.55), transparent 65%)' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, left: 200 + Math.cos(f / 45) * 40, top: 120, borderRadius: 999, background: 'radial-gradient(circle, rgba(123,44,240,.6), transparent 65%)' }} />
      {/* hora */}
      <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,.85)', fontWeight: 600, fontSize: 26 }}>sábado, 14 de novembro</div>
      <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 168, letterSpacing: '-0.04em', lineHeight: 1 }}>08:12</div>
      {/* notificações */}
      {NOT.map((n, i) => {
        const s = mola(f, n.e, 30, { damping: 16, stiffness: 170, mass: 0.7 });
        if (f < n.e) return null;
        const idx = NOT.slice(i + 1).reduce((a, m) => a + mola(f, m.e, 30, { damping: 18, stiffness: 150, mass: 0.8 }), 0);
        const y = 420 + idx * (H + 14);
        if (y > 1250) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 16, right: 16, top: y, height: H, borderRadius: 34, background: 'rgba(245,240,252,.78)', backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', transform: `translateY(${(1 - s) * 90}px) scale(${0.9 + 0.1 * s})`, opacity: Math.min(1, s * 1.6), boxShadow: '0 14px 30px -12px rgba(0,0,0,.35)' }}>
            <div style={{ width: 66, height: 66, borderRadius: 18, background: n.cor, display: 'grid', placeItems: 'center', flex: 'none' }}><Icone n={n.ic} tam={40} cor="#fff" traco={2.1} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 25, color: P.ink }}><span>{n.app}</span><span style={{ fontWeight: 600, color: P.fg2, fontSize: 22 }}>agora</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 25, color: '#2b2330', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.t}{n.est && <Estrelas tam={24} />}</div>
            </div>
          </div>
        );
      })}
      {/* ilha dinâmica */}
      <div style={{ position: 'absolute', left: (TW - iw) / 2, top: W * 0.03, width: iw, height: ih, borderRadius: 26 + ilha * 24, background: '#000', zIndex: 50, display: 'flex', alignItems: 'center', gap: 18, padding: `0 ${26 * ilha}px`, overflow: 'hidden' }}>
        {ilha > 0.5 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: lerp(ilha, 0.5, 0.9, 0, 1) }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, background: `linear-gradient(140deg, ${P.el}, ${P.vio})`, display: 'grid', placeItems: 'center' }}><Icone n="agenda" tam={50} cor="#fff" traco={2} /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 30 }}>Novo agendamento</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontWeight: 600, fontSize: 25 }}>Corte + barba · sáb, 10:30</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const A2: React.FC = () => {
  const f = useCurrentFrame();
  const sobe = mola(f, 0, 30, { damping: 20, stiffness: 60, mass: 1.2 });
  const recua = chaves(f, [[208, 0], [236, 1]]);
  const sc = 1 - recua * 0.2;
  const fora = lerp(f, 324, 346, 0, 1, (t) => t * t * t);
  const ty = (1 - sobe) * 1400 + recua * 170 + fora * 1500;
  return (
    <AbsoluteFill>
      <Preto luz={1 + recua} />
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, perspective: 2400 }}>
        <div style={{ transform: `translateY(${ty}px) scale(${sc})`, transformOrigin: '50% 0%' }}>
          <Fone3D w={W} rx={(1 - sobe) * 35 + Math.sin(f / 50) * 2} ry={(1 - sobe) * -25 + Math.sin(f / 40) * 4} rz={(1 - sobe) * 6}>
            <Tela />
            <Reflexo ini={20} dur={34} />
            <Reflexo ini={240} dur={30} />
          </Fone3D>
          <Aura w={W} h={W * 2.08} raio={W * 0.15} ini={250} fim={340} espessura={10} />
        </div>
      </div>
      <Centro y={150}><Texto t={'Quando tudo está no lugar,\no celular *não para*.'} ini={214} tam={72} peso={800} cor="#fff" acento="#E07BFF" tracking={-0.04} fim={338} /></Centro>
      {f >= 334 && <Fecho ini={340} frase="Página, Google e WhatsApp trabalhando por você." claro={false} />}
    </AbsoluteFill>
  );
};
