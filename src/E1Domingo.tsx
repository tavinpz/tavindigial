// E1 (escuro) — "Domingo, 21:04": paciente com dor, clínica fechada; a Thata reserva o encaixe; vira segunda e a agenda já começou.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Conversa, Icone, Fecho, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_E1 = 590;
const W = 640;

const Digito: React.FC<{ de: string; para: string; ini: number }> = ({ de, para, ini }) => {
  const f = useCurrentFrame();
  const p = lerp(f, ini, ini + 14, 0, 1);
  return (
    <div style={{ position: 'relative', height: '1em', lineHeight: 1, overflow: 'hidden', width: '0.6em', textAlign: 'center' }}>
      <div style={{ transform: `translateY(${-p}em)`, lineHeight: 1 }}><div style={{ height: '1em' }}>{de}</div><div style={{ height: '1em' }}>{para}</div></div>
    </div>
  );
};

export const E1: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const sol = lerp(f, 330, 400, 0, 1);
  const linhas = [
    ['08:15', 'Encaixe · dor', 'Carlos M.', 'marcado dom 21:05', true],
    ['09:00', 'Limpeza', 'Ana L.', '', false],
    ['10:00', 'Avaliação', 'Pedro A.', '', false],
    ['11:30', 'Restauração', 'Sofia N.', '', false],
  ] as const;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 700], [300, 900], [400, 1500]])} brilho={1} />
      {/* nascer do dia */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent ${70 - sol * 40}%, rgba(27,195,113,${0.22 * sol}) 100%)` }} />

      {/* gancho */}
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, opacity: saida(f, 92, 12) }}>
        <Surge ini={2}><Icone n="lua" tam={110} cor={C.luz} traco={1.6} /></Surge>
        <div style={{ fontFamily: G, fontWeight: 500, fontSize: 200, letterSpacing: '-0.06em', color: C.ink, overflow: 'hidden' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${lerp(f, 6, 26, 110, 0)}%)` }}>21:04</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 900, left: 0, right: 0 }}>
        <Titulo t={'Domingo à noite.\n*Dor de dente.*'} ini={24} fim={92} tam={80} />
      </div>

      {/* conversa */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, transform: `translateY(${(1 - mola(f, 84, { damping: 17, stiffness: 110, mass: 1 })) * 1400 - lerp(f, 300, 330, 0, 1700)}px)` }}>
        <Conversa w={W} nome="Carlos M." sub="WhatsApp da clínica" tam={31} msgs={[
          { t: 'Boa noite, vocês abrem amanhã cedo? Tô com muita dor no dente', f: 104, hora: '21:04' },
          { t: 'Boa noite, Carlos! Sinto muito pela dor. Amanhã abrimos às 8h e tenho um encaixe às 8h15. Quer que eu reserve?', f: 150, eu: true, ia: true, hora: '21:04' },
          { t: 'Quero sim, por favor', f: 206, hora: '21:05' },
          { t: 'Reservado: segunda, 8h15, com o Dr. André. Se a dor piorar hoje, procure um pronto-socorro.', f: 246, eu: true, hora: '21:05' },
        ]} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A clínica está fechada." ini={100} fim={232} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="Mas o encaixe *já está marcado.*" ini={240} fim={312} tam={66} />
      </div>

      {/* o relógio vira */}
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: G, fontWeight: 500, fontSize: 230, letterSpacing: '-0.05em', color: C.ink, opacity: Math.min(lerp(f, 318, 330, 0, 1), 1), transform: `scale(${chaves(f, [[318, 1.2], [380, 1], [420, 0.42]])}) translateY(${chaves(f, [[380, 0], [420, -560]])}px)`, transformOrigin: '50% 0%' }}>
        {f >= 318 && <>
          <Digito de="2" para="0" ini={336} /><Digito de="1" para="8" ini={340} />
          <span style={{ width: '0.3em', textAlign: 'center' }}>:</span>
          <Digito de="0" para="0" ini={344} /><Digito de="4" para="0" ini={348} />
        </>}
      </div>
      <div style={{ position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(lerp(f, 352, 366, 0, 1), saida(f, 412, 10)) }}>
        <div style={{ fontFamily: M, fontSize: 40, color: C.luz }}>domingo → segunda</div>
      </div>

      {/* agenda de segunda */}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 520, opacity: Math.min(lerp(f, 410, 426, 0, 1), saida(f, 492, 12)), transform: `translateY(${(1 - mola(f, 410)) * 80}px)` }}>
        <div style={{ background: C.papel, borderRadius: 44, border: `1.5px solid ${C.linha2}`, padding: '40px 36px', boxShadow: '0 60px 120px -50px rgba(0,0,0,.9)' }}>
          <div style={{ fontFamily: M, fontSize: 26, color: C.fg2 }}>segunda · agenda</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {linhas.map(([h, p, n, q, dest], i) => {
              const s = mola(f, 420 + i * 6);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '22px 26px', borderRadius: 26, background: dest ? C.menta : 'rgba(255,255,255,.03)', border: dest ? `2px solid ${C.verde}` : `1.5px solid ${C.linha}`, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 60}px)` }}>
                  <div style={{ fontFamily: G, fontWeight: 600, fontSize: 40, letterSpacing: '-0.03em', color: dest ? C.luz : C.fg, width: 120 }}>{h}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: G, fontWeight: 600, fontSize: 34, color: C.ink, letterSpacing: '-0.02em' }}>{p}</div>
                    <div style={{ fontFamily: G, fontWeight: 500, fontSize: 26, color: C.fg2 }}>{n}</div>
                  </div>
                  {q && <div style={{ fontFamily: M, fontSize: 22, color: C.luz, textAlign: 'right', width: 150 }}>{q}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Surge ini={450}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 32px', borderRadius: 99, background: C.ink, color: C.sobreInk, fontFamily: G, fontWeight: 600, fontSize: 34, letterSpacing: '-0.02em', transform: `scale(${molaViva(f, 450)})` }}>
              <div style={{ width: 14, height: 14, borderRadius: 99, background: C.verde }} /> Carlos chegou · 08:09
            </div>
          </Surge>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1450, left: 0, right: 0 }}>
        <Titulo t={'Segunda, 8h.\n*A agenda já começou.*'} ini={430} fim={494} tam={74} />
      </div>
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Dor de dente não espera\n*segunda-feira.*'} /></div>}
    </AbsoluteFill>
  );
};
