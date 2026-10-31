// N6 (escuro) — "Antes / depois": tela dividida, mesma clínica, mesmos momentos; a divisória varre a tela e o lado certo toma conta.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Icone, Fecho, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_N6 = 580;
const LINHAS: [string, string, string][] = [
  ['seg · 08:01', '23 mensagens esperando', 'todas respondidas'],
  ['12:00 · almoço', 'telefone tocando sozinho', 'atendido e marcado'],
  ['18:30 · fechou', 'paciente sem resposta', 'encaixe pra amanhã'],
  ['sexta · agenda', '3 faltas, 3 cadeiras vazias', 'confirmadas, sem buraco'],
];

const Linha: React.FC<{ i: number; lado: 'a' | 'b' }> = ({ i, lado }) => {
  const f = useCurrentFrame();
  const ini = 60 + i * 50 + (lado === 'b' ? 8 : 0);
  const s = mola(f, ini);
  const [quando, ruim, bom] = LINHAS[i];
  const b = lado === 'b';
  return (
    <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px)`, padding: '30px 30px', borderRadius: 30, background: b ? 'rgba(27,195,113,.12)' : 'rgba(255,107,107,.08)', border: `1.5px solid ${b ? 'rgba(95,227,161,.35)' : 'rgba(255,107,107,.25)'}` }}>
      <div style={{ fontFamily: M, fontSize: 24, color: C.fg3 }}>{quando}</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 99, flex: 'none', marginTop: 2, background: b ? C.verde : C.alerta, display: 'grid', placeItems: 'center' }}><Icone n={b ? 'ok' : 'x'} tam={24} cor={b ? '#06100C' : '#fff'} traco={3} /></div>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 36, lineHeight: 1.2, letterSpacing: '-0.025em', color: b ? C.ink : C.fg }}>{b ? bom : ruim}</div>
      </div>
    </div>
  );
};

export const N6: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const div = chaves(f, [[0, 540], [290, 540], [330, 640], [350, 420], [400, 0]], Easing.bezier(0.65, 0, 0.35, 1));
  const toma = lerp(f, 350, 400, 0, 1);
  return (
    <AbsoluteFill>
      <Fundo gx={div} gy={960} />
      {/* lado sem a Thata */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.max(0, div), overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 30, width: 480, top: 470, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 46, letterSpacing: '-0.035em', color: C.alerta, opacity: lerp(f, 30, 44, 0, 1) }}>Sem a Thata</div>
          {LINHAS.map((_, i) => <Linha key={i} i={i} lado="a" />)}
        </div>
      </div>
      {/* lado com a Thata (em 2 colunas depois que toma a tela) */}
      <div style={{ position: 'absolute', left: Math.max(0, div), right: 0, top: 0, bottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 30 + toma * 0, width: 480 + toma * 540, top: 470 - toma * 30, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 46 + toma * 14, letterSpacing: '-0.035em', color: C.luz, opacity: lerp(f, 30, 44, 0, 1) }}>Com a Thata</div>
          {LINHAS.map((_, i) => <Linha key={i} i={i} lado="b" />)}
        </div>
      </div>
      {/* a divisória com a alça */}
      {f < 410 && (
        <>
          <div style={{ position: 'absolute', left: div - 2, top: 380, bottom: 260, width: 4, background: 'rgba(238,244,241,.5)', opacity: lerp(f, 20, 34, 0, 1) }} />
          <div style={{ position: 'absolute', left: div - 44, top: 960 - 44, width: 88, height: 88, borderRadius: 99, background: C.ink, display: 'grid', placeItems: 'center', boxShadow: '0 10px 30px -6px rgba(0,0,0,.8)', opacity: lerp(f, 20, 34, 0, 1) }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.sobreInk} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
          </div>
        </>
      )}
      {f >= 400 && f < 470 && <Ponto x={540} y={1720} r={lerp(f, 400, 414, 0, 24)} o={saida(f, 470, 10)} />}

      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'Mesma clínica.\n*Mesma semana.*'} ini={4} fim={290} tam={80} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'Agora arrasta\npro *lado certo.*'} ini={296} fim={470} tam={80} />
      </div>
      {f >= 466 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 466, 478, 0, 1) }}><Fecho ini={472} frase={'Mesma clínica.\n*Outra recepção.*'} /></div>}
    </AbsoluteFill>
  );
};
