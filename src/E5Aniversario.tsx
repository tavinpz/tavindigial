// E5 (escuro) — "Aniversário": a Thata dá parabéns e convida a voltar; a câmera recua e o mês inteiro tem aniversários.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Conversa, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_E5 = 580;
const W = 640;
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

const Confete: React.FC<{ ini: number }> = ({ ini }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const t = (f - ini) / 30;
        const ang = rnd(i, 1) * Math.PI * 2, v = 500 + rnd(i, 2) * 700;
        const x = 540 + Math.cos(ang) * v * t;
        const y = 860 + Math.sin(ang) * v * t + 500 * t * t;
        const r = 8 + rnd(i, 3) * 14;
        return <div key={i} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: i % 3 ? '50%' : 4, background: i % 4 === 0 ? C.ink : i % 2 ? C.luz : C.verde, opacity: Math.max(0, 1 - t * 0.9), transform: `rotate(${t * 300 * (i % 2 ? 1 : -1)}deg)` }} />;
      })}
    </>
  );
};

export const E5: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const mes = Math.min(lerp(f, 266, 296, 0, 1), saida(f, 466, 12));
  const s0 = mola(f, 0, { damping: 12, stiffness: 120, mass: 0.8 });
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 860], [260, 960]])} />
      {/* gancho: a folhinha */}
      <div style={{ position: 'absolute', left: 540 - 200, top: 560, width: 400, height: 440, borderRadius: 40, overflow: 'hidden', background: C.papel, border: `1.5px solid ${C.linha2}`, transform: `scale(${s0 * (1 - lerp(f, 80, 100, 0, 0.3))})`, opacity: saida(f, 100, 14), boxShadow: '0 40px 90px -40px rgba(0,0,0,.9)' }}>
        <div style={{ height: 110, background: C.verde, display: 'grid', placeItems: 'center', fontFamily: M, fontSize: 40, color: '#06100C' }}>NOVEMBRO</div>
        <div style={{ textAlign: 'center', fontFamily: G, fontWeight: 600, fontSize: 220, letterSpacing: '-0.06em', color: C.ink, lineHeight: 1.2 }}>12</div>
        <div style={{ textAlign: 'center', fontFamily: M, fontSize: 30, color: C.luz }}>quinta-feira</div>
      </div>
      <Confete ini={18} />
      <div style={{ position: 'absolute', top: 1110, left: 0, right: 0 }}>
        <Titulo t={'Hoje é aniversário\nda *Carla.*'} ini={20} fim={98} tam={80} />
      </div>

      {/* conversa */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, transform: `translateY(${(1 - mola(f, 96, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px) scale(${1 - lerp(f, 262, 292, 0, 0.6)})`, opacity: saida(f, 292, 16), transformOrigin: '50% 30%' }}>
        <Conversa w={W} nome="Carla M." sub="WhatsApp da clínica" tam={30} msgs={[
          { t: 'Parabéns, Carla! A equipe da Clínica Aurora deseja um ano incrível pra você.', f: 112, eu: true, ia: true, hora: '09:00' },
          { t: 'E faz 7 meses da sua última limpeza: quer aproveitar e já deixar marcada?', f: 150, eu: true, hora: '09:00' },
          { t: 'Que fofos, obrigada!! Quero sim', f: 200, hora: '09:14' },
          { t: 'Sexta, 15h, reservado. Parabéns de novo!', f: 232, eu: true, hora: '09:14' },
        ]} />
      </div>

      {/* o mês inteiro */}
      <AbsoluteFill style={{ opacity: mes }}>
        <div style={{ position: 'absolute', left: 60, right: 60, top: 470 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: G, fontWeight: 600, fontSize: 50, letterSpacing: '-0.04em', color: C.ink, marginBottom: 26 }}>
            Novembro <span style={{ fontFamily: M, fontWeight: 400, fontSize: 28, color: C.fg2, alignSelf: 'center' }}>aniversariantes</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {Array.from({ length: 35 }, (_, i) => {
              const dia = i - 6 + 1;
              const n = dia >= 1 && dia <= 30 ? Math.floor(rnd(i, 7) * 3.4) : 0;
              const hoje = dia === 12;
              const acende = 300 + i * 3;
              return (
                <div key={i} style={{ height: 150, borderRadius: 22, background: hoje ? C.menta : dia >= 1 && dia <= 30 ? C.papel : 'transparent', border: hoje ? `2px solid ${C.verde}` : dia >= 1 && dia <= 30 ? `1.5px solid ${C.linha}` : 'none', padding: 12, position: 'relative' }}>
                  {dia >= 1 && dia <= 30 && <div style={{ fontFamily: M, fontSize: 22, color: hoje ? C.luz : C.fg3 }}>{dia}</div>}
                  <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 6 }}>
                    {Array.from({ length: n }, (_, k) => {
                      const on = f >= acende + k * 4;
                      const s = on ? molaViva(f, acende + k * 4) : 1;
                      return <div key={k} style={{ width: 30, height: 30, borderRadius: 99, background: on ? C.verde : C.fg3, transform: `scale(${s})`, boxShadow: on ? '0 0 16px rgba(27,195,113,.6)' : 'none' }} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 30, marginTop: 34, fontFamily: G, fontWeight: 500, fontSize: 30, color: C.fg2, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 20, height: 20, borderRadius: 99, background: C.fg3 }} /> aniversariante</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 20, height: 20, borderRadius: 99, background: C.verde }} /> mensagem enviada</span>
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A Thata *lembra.*" ini={112} fim={256} tam={70} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'Todo dia tem alguém\nfazendo aniversário.'} ini={270} fim={370} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'E cada parabéns é um\n*motivo pra voltar.*'} ini={374} fim={466} tam={66} />
      </div>
      {f >= 462 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 462, 474, 0, 1) }}><Fecho ini={468} frase={'Lembrar do paciente\n*traz o paciente.*'} /></div>}
    </AbsoluteFill>
  );
};
