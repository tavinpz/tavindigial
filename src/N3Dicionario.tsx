// N3 (claro) — "Dicionário": o verbete "recepção" com definições que todo dono reconhece; elas são riscadas e entra a nova.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Fecho, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_N3 = 560;
const DEFS = [
  'Lugar onde o telefone toca enquanto alguém responde o WhatsApp.',
  'Lugar onde o WhatsApp acumula enquanto alguém atende o telefone.',
  'Fecha às 18h. Os pacientes, não.',
];

const Digita: React.FC<{ t: string; ini: number; vel?: number }> = ({ t, ini, vel = 1.6 }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(t.length, Math.floor((f - ini) * vel)));
  return <>{t.slice(0, n)}{f >= ini && n < t.length && <span style={{ color: C.verde }}>▌</span>}</>;
};

export const N3: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const recua = lerp(f, 402, 440, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const esc = 1 - recua * 0.45;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 700], [300, 1300]])} />
      <AbsoluteFill style={{ transform: `scale(${esc}) translateY(${-recua * 120}px)`, opacity: saida(f, 492, 12) }}>
        {/* página do dicionário */}
        <div style={{ position: 'absolute', left: 70, right: 70, top: 300, bottom: 300, borderRadius: 30, background: C.papel, border: `1.5px solid ${C.linha}`, boxShadow: '0 60px 120px -60px rgba(11,20,17,.4)', padding: '70px 64px', opacity: mola(f, 0) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: M, fontSize: 24, color: C.fg3, borderBottom: `1.5px solid ${C.linha}`, paddingBottom: 18 }}>
            <span>recebimento — recíproco</span><span>412</span>
          </div>
          <div style={{ marginTop: 50, fontFamily: G, fontWeight: 600, fontSize: 140, letterSpacing: '-0.055em', color: C.ink, lineHeight: 1 }}>
            <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}><span style={{ display: 'inline-block', transform: `translateY(${lerp(f, 6, 26, 110, 0)}%)` }}>re·cep·ção</span></span>
          </div>
          <div style={{ fontFamily: M, fontSize: 30, color: C.fg2, marginTop: 18, opacity: lerp(f, 24, 36, 0, 1) }}>/ʁe.sɛpˈsɐ̃w̃/ · substantivo feminino</div>
          <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 40 }}>
            {DEFS.map((d, i) => {
              const ini = 50 + i * 52;
              const risca = lerp(f, 236 + i * 10, 256 + i * 10, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
              return (
                <div key={i} style={{ display: 'flex', gap: 22, fontFamily: G, fontWeight: 500, fontSize: 52, lineHeight: 1.22, letterSpacing: '-0.02em', color: risca > 0.5 ? C.fg3 : C.fg, opacity: lerp(f, ini - 4, ini, 0, 1) }}>
                  <span style={{ fontFamily: M, fontSize: 32, color: C.fg3, paddingTop: 8 }}>{i + 1}.</span>
                  <span><span style={{ backgroundImage: `linear-gradient(${C.alerta}, ${C.alerta})`, backgroundRepeat: 'no-repeat', backgroundSize: `${risca * 100}% 5px`, backgroundPosition: '0 58%', WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' } as React.CSSProperties}>
                    <Digita t={d} ini={ini} />
                  </span></span>
                </div>
              );
            })}
            {/* a nova definição */}
            <div style={{ display: 'flex', gap: 22, fontFamily: G, fontWeight: 600, fontSize: 56, lineHeight: 1.2, letterSpacing: '-0.025em', color: C.prof, opacity: lerp(f, 286, 292, 0, 1), background: C.menta, margin: '0 -24px', padding: '24px 24px', borderRadius: 26 }}>
              <span style={{ fontFamily: M, fontSize: 32, color: C.verde, paddingTop: 8 }}>4.</span>
              <span><Digita t="Atende, liga, agenda e confirma. A qualquer hora, sem fila." ini={292} vel={1.4} /></span>
            </div>
            <div style={{ fontFamily: M, fontSize: 30, color: C.fg2, opacity: lerp(f, 352, 366, 0, 1) }}>ver também: <span style={{ color: C.verde }}>● Thata</span></div>
          </div>
        </div>
      </AbsoluteFill>
      {f >= 436 && <Ponto x={540} y={1560} r={lerp(f, 436, 452, 0, 26)} o={saida(f, 492, 10)} />}

      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="Todo dono de clínica *conhece.*" ini={40} fim={226} tam={62} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="Hora de *atualizar o dicionário.*" ini={232} fim={400} tam={62} />
      </div>
      <div style={{ position: 'absolute', top: 1640, left: 0, right: 0 }}>
        <Titulo t={'Recepção, *agora com IA.*'} ini={420} fim={494} tam={70} />
      </div>
      {f >= 488 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 488, 500, 0, 1) }}><Fecho ini={494} frase={'Sua recepção,\n*redefinida.*'} /></div>}
    </AbsoluteFill>
  );
};
