// N1 (claro) — "Cronômetro": quanto tempo a clínica leva pra responder; 2h17 e o paciente marcou em outro lugar; zera; com a Thata, 28 segundos.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Bolha, Fecho, Surge, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_N1 = 560;
const R = 330, CX = 540, CY = 900;

const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
};

export const N1: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const lento = lerp(f, 60, 190, 0, 8263, Easing.bezier(0.5, 0, 0.9, 0.6)); // 2:17:43
  const zera = f >= 214 && f < 236;
  const rapido = lerp(f, 240, 296, 0, 28, (x) => x);
  const fase2 = f >= 236;
  const seg = fase2 ? rapido : zera ? lerp(f, 214, 232, 8263, 0) : lento;
  const cor = fase2 ? C.verde : C.alerta;
  const voltas = fase2 ? seg / 60 : seg / 1800;
  const encolhe = lerp(f, 392, 430, 0, 1, Easing.bezier(0.7, 0, 0.3, 1));
  const r = R * (1 - encolhe) + 30 * encolhe;
  const circ = 2 * Math.PI * R;
  const NOTAS: [number, string, string][] = [[96, '10:02 · paciente pergunta horário', 'l'], [130, '10:15 · pergunta em outra clínica', 'r'], [164, '10:40 · marca na outra', 'l']];
  return (
    <AbsoluteFill>
      <Fundo gy={CY} brilho={fase2 ? 1 : 0.35} />
      {/* o cronômetro */}
      <div style={{ position: 'absolute', left: CX - r, top: CY - r, width: r * 2, height: r * 2, opacity: Math.min(lerp(f, 40, 56, 0, 1), saida(f, 440, 8)) }}>
        <svg width={r * 2} height={r * 2} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={r} cy={r} r={r - 16} fill={C.papel} stroke={C.linha} strokeWidth={24} />
          <circle cx={r} cy={r} r={r - 16} fill="none" stroke={cor} strokeWidth={24} strokeLinecap="round" strokeDasharray={`${(circ * (r - 16) / R) * (voltas % 1 || (voltas > 0 ? 0.999 : 0))} ${circ * 2}`} />
        </svg>
        {encolhe < 0.6 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 1 - encolhe * 1.6 }}>
            <div style={{ fontFamily: M, fontWeight: 500, fontSize: 104, color: fase2 ? C.ink : C.alerta, letterSpacing: '-0.03em' }}>{fmt(seg)}</div>
            <div style={{ fontFamily: G, fontWeight: 500, fontSize: 32, color: C.fg2, marginTop: 10 }}>{fase2 ? 'com a Thata' : 'sem resposta'}</div>
          </div>
        )}
      </div>
      {encolhe > 0.9 && <Ponto x={CX} y={CY} r={30} />}
      {/* o que aconteceu enquanto isso */}
      {NOTAS.map(([ini, t, lado], i) => (
        <div key={i} style={{ position: 'absolute', left: lado === 'l' ? 60 : undefined, right: lado === 'r' ? 60 : undefined, top: [1300, 1390, 1480][i], opacity: saida(f, 212, 10) }}>
          <Surge ini={ini}>
            <div style={{ padding: '18px 28px', borderRadius: 99, background: i === 2 ? C.alertaSuave : C.papel, border: `1.5px solid ${i === 2 ? C.alerta : C.linha}`, fontFamily: M, fontSize: 28, color: i === 2 ? C.alerta : C.fg }}>{t}</div>
          </Surge>
        </div>
      ))}
      {/* a resposta da Thata */}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 1310, display: 'flex', flexDirection: 'column', gap: 16, opacity: Math.min(lerp(f, 238, 248, 0, 1), saida(f, 392, 12)), background: C.papel, borderRadius: 40, padding: 30, border: `1.5px solid ${C.linha}`, boxShadow: '0 40px 80px -40px rgba(11,20,17,.35)' }}>
        <Bolha t="Oi! Tem horário pra limpeza essa semana?" ini={244} hora="10:02" tam={34} max={720} />
        <Bolha t="Oi, Paula! Tenho quinta às 10h ou sexta às 15h. Qual prefere?" ini={296} eu ia hora="10:02" tam={34} max={760} />
      </div>

      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t={'Quanto tempo a sua clínica\nleva pra *responder?*'} ini={4} fim={190} tam={72} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t={'2 horas depois,\nele *já marcou em outro lugar.*'} ini={180} fim={232} tam={68} acento={C.alerta} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t={'Agora, com a Thata:\n*28 segundos.*'} ini={240} fim={388} tam={72} />
      </div>
      <div style={{ position: 'absolute', top: 1200, left: 60, right: 60 }}>
        <Titulo t={'Paciente bem atendido\n*não procura outra clínica.*'} ini={420} fim={500} tam={66} />
      </div>
      {f >= 494 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 494, 506, 0, 1) }}><Fecho ini={500} frase={'Resposta na hora,\n*agenda cheia.*'} /></div>}
    </AbsoluteFill>
  );
};
