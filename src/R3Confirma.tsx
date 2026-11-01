// R3 (escuro) — "Confirmações de amanhã": 18h40, faltam 12 confirmações. A Thata manda as mensagens e os checks caem em cascata;
// quem pediu outro horário já sai remarcado, quem não respondeu ganha lembrete. A recepção apaga a luz e vai para casa.
// Simples: uma lista e um gesto repetido (o check). Profissional: cascata com ritmo, exceções tratadas, luz que apaga no fim.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Fecho, Narrada, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_R3 = 600;
// pacientes fictícios de amanhã
const AMANHA: [string, string][] = [
  ['08:00', 'Ana P.'], ['08:40', 'Bruno L.'], ['09:20', 'Carla M.'], ['10:00', 'Diego S.'], ['10:40', 'Elisa R.'], ['11:20', 'Fábio T.'],
  ['13:30', 'Gabi N.'], ['14:10', 'Hugo A.'], ['14:50', 'Íris C.'], ['15:30', 'João V.'], ['16:10', 'Karen D.'], ['16:50', 'Léo F.'],
];
const PEDIU = 4, SEM = 9;
const conf = (i: number) => 124 + i * 11;
const LY = 430, LDY = 80;

const Linha: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [h, nome] = AMANHA[i];
  const ent = mola(f, 24 + i * 2, { damping: 18, stiffness: 160, mass: 0.6 });
  let st: 'falta' | 'ok' | 'pediu' | 'remarcado' | 'sem' | 'lembrete' = 'falta';
  if (i === PEDIU) st = f >= 300 ? 'remarcado' : f >= 262 ? 'pediu' : 'falta';
  else if (i === SEM) st = f >= 330 ? 'lembrete' : f >= 262 ? 'sem' : 'falta';
  else if (f >= conf(i)) st = 'ok';
  const t0 = st === 'ok' ? conf(i) : st === 'pediu' || st === 'sem' ? 262 : st === 'remarcado' ? 300 : st === 'lembrete' ? 330 : 0;
  const s = t0 ? molaViva(f, t0) : 1;
  const verde = st === 'ok' || st === 'remarcado';
  const rot = { falta: 'confirmar', ok: 'confirmou', pediu: 'pediu outro horário', remarcado: 'remarcado p/ 15h', sem: 'sem resposta', lembrete: 'lembrete 2h antes' }[st];
  const cor = verde ? C.vivo : st === 'pediu' ? C.ambar : st === 'falta' ? C.fg3 : C.fg2;
  return (
    <div style={{ position: 'absolute', left: 110, width: 860, top: LY + i * LDY, height: LDY - 12, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px',
      background: verde ? 'rgba(27,195,113,.10)' : 'rgba(255,255,255,.035)', border: `1.5px solid ${verde ? 'rgba(95,227,161,.35)' : C.linha}`, opacity: Math.min(1, ent * 2), transform: `translateX(${(1 - ent) * 60}px)` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, border: `2.5px solid ${verde ? C.verde : C.linha2}`, background: verde ? C.verde : 'transparent', display: 'grid', placeItems: 'center', color: '#06100C', fontWeight: 700, fontSize: 24, transform: `scale(${verde ? s : 1})` }}>{verde ? '✓' : ''}</div>
      <span style={{ fontFamily: M, fontSize: 26, color: C.fg2, width: 86 }}>{st === 'remarcado' ? '15:00' : h}</span>
      <span style={{ fontFamily: G, fontWeight: 600, fontSize: 34, color: C.ink, letterSpacing: '-0.02em', flex: 1 }}>{nome}</span>
      <span style={{ fontFamily: M, fontSize: 24, color: cor, transform: `scale(${0.9 + 0.1 * s})` }}>{rot}</span>
    </div>
  );
};

export const R3: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const pDot = mola(f, 100, { damping: 11, stiffness: 140, mass: 0.7 });
  const ok = AMANHA.filter((_, i) => i !== PEDIU && i !== SEM && f >= conf(i)).length + (f >= 300 ? 1 : 0);
  const apaga = lerp(f, 352, 392, 0, 1, Easing.bezier(0.5, 0, 0.5, 1));
  const zoom = chaves(f, [[0, 1.05], [40, 1], [340, 1], [400, 0.94]]);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 300], [110, 420], [260, 900]])} brilho={chaves(f, [[0, 0.3], [100, 0.35], [118, 1], [352, 1], [392, 0.45]])} />
      <Fantasma t="AMANHÃ" ini={0} fim={250} y={1480} tam={360} />
      <Fantasma t="CONFIRMADO" ini={258} fim={486} y={1480} tam={320} vel={1.5} />

      {/* relógio e contador */}
      <div style={{ position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: saida(f, 404, 10) }}>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 130, letterSpacing: '-0.05em', color: C.ink, lineHeight: 1, transform: `scale(${0.9 + 0.1 * mola(f, 2)})` }}>{f < 380 ? '18:40' : '18:41'}</div>
        <div style={{ fontFamily: M, fontSize: 28, color: ok === 11 ? C.vivo : C.fg2 }}>{f < 112 ? 'confirmações de amanhã: 0 de 12' : `${ok} confirmados${f >= 330 ? ' · 1 lembrete agendado' : ''}`}</div>
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 900px', opacity: saida(f, 486, 10) }}>
        {AMANHA.map((_, i) => <Linha key={i} i={i} />)}
        {f >= 100 && <Ponto x={970} y={chaves(f, [[100, 60], [116, LY - 10]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}
      </div>

      {/* a luz da recepção apaga */}
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 540px 900px, rgba(0,0,0,0) 0%, rgba(2,6,5,.78) 70%)', opacity: apaga * saida(f, 486, 10), pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 1440, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg3, opacity: Math.min(lerp(f, 300, 312, 0, 1), saida(f, 486, 8)) }}>pacientes fictícios · exemplo ilustrativo</div>

      <div style={{ position: 'absolute', top: 120, left: 60, right: 60 }}>
        <Titulo t={'Pode ir pra casa.\n*Amanhã já está*\n*confirmado.*'} ini={410} fim={486} tam={80} />
      </div>

      <Narrada id="R3" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Agenda confirmada.\n*Recepção em paz.*'} /></div>}
    </AbsoluteFill>
  );
};
