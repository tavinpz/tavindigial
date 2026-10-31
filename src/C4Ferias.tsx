// C4 (claro) — "Joana de férias": a semana inteira de conversas passa em cartões; a Joana volta e encontra tudo em dia.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Icone, Num, Fecho, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_C4 = 600;
const DIAS = [
  { d: 'seg', p: 'Vocês têm horário pra amanhã?', r: 'Tenho às 14h. Reservo pra você?' },
  { d: 'ter', p: 'Preciso remarcar minha consulta', r: 'Remarquei pra quinta, 10h.' },
  { d: 'qua', p: 'Aceitam cartão?', r: 'Aceitamos, em até 12x.' },
  { d: 'qui', p: 'Que horas abrem sábado?', r: 'Das 8h às 12h. Quer marcar?' },
  { d: 'sex', p: 'Tô com dor, tem encaixe?', r: 'Encaixe hoje às 17h, reservado.' },
];

const CartaoDia: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const x = chaves(f, [[100, 1200 + i * 840], [300, 1200 + i * 840 - 4200]], Easing.bezier(0.4, 0, 0.6, 1));
  const c = DIAS[i];
  const foco = 1 - Math.min(1, Math.abs(x - 540) / 900);
  return (
    <div style={{ position: 'absolute', left: x - 380, top: 560, width: 760, padding: '40px 40px 44px', borderRadius: 44, background: C.papel, border: `1.5px solid ${C.linha}`, boxShadow: '0 50px 100px -50px rgba(11,20,17,.45)', transform: `scale(${0.86 + 0.14 * foco}) rotate(${(x - 540) / 120}deg)`, opacity: 0.4 + 0.6 * foco }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 64, letterSpacing: '-0.05em', color: C.ink }}>{c.d}</div>
        <div style={{ fontFamily: M, fontSize: 24, color: C.fg3 }}>joana de férias</div>
      </div>
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: 560, padding: '18px 24px', borderRadius: 26, borderBottomLeftRadius: 6, background: C.bolhaIn, fontFamily: G, fontWeight: 500, fontSize: 32, color: C.ink }}>{c.p}</div>
        <div style={{ alignSelf: 'flex-end', maxWidth: 560, padding: '18px 24px', borderRadius: 26, borderBottomRightRadius: 6, background: C.bolhaEu, fontFamily: G, fontWeight: 500, fontSize: 32, color: '#fff' }}>
          <div style={{ fontFamily: M, fontSize: 18, opacity: 0.75, marginBottom: 4 }}>● Thata · IA</div>{c.r}
        </div>
      </div>
    </div>
  );
};

export const C4: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const semana = interpolate(f, [100, 300], [0, 4.99], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const volta = mola(f, 318, { damping: 15, stiffness: 120, mass: 0.9 });
  const ITENS: [string, number, string][] = [['Conversas atendidas', 142, 'chat'], ['Consultas marcadas', 38, 'agenda'], ['Confirmações enviadas', 96, 'ok'], ['Pra você ver', 3, 'mao']];
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [320, 1000]])} />
      {/* gancho: o bilhete */}
      <div style={{ position: 'absolute', left: 540 - 300, top: 700, width: 600, height: 520, background: '#FFF6C8', borderRadius: 10, boxShadow: '0 40px 80px -40px rgba(11,20,17,.5)', transform: `rotate(-3deg) translateY(${(1 - mola(f, 0)) * 400}px) scale(${1 - lerp(f, 84, 104, 0, 0.4)})`, opacity: saida(f, 104, 14), padding: '70px 60px', fontFamily: '"Geist", sans-serif' }}>
        <div style={{ fontWeight: 600, fontSize: 70, letterSpacing: '-0.04em', color: '#3D3410', lineHeight: 1.05 }}>Joana de férias</div>
        <div style={{ fontWeight: 500, fontSize: 40, color: '#6B5E26', marginTop: 24 }}>volta dia 20.</div>
        <div style={{ fontFamily: M, fontSize: 28, color: '#8A7B3A', marginTop: 70 }}>recepção · 1 semana</div>
      </div>
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0 }}>
        <Titulo t={'A recepcionista\n*saiu de férias.*'} ini={8} fim={96} tam={84} />
      </div>

      {/* a semana passando */}
      {f >= 96 && f < 320 && DIAS.map((_, i) => <CartaoDia key={i} i={i} />)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center', gap: 16, opacity: Math.min(lerp(f, 100, 112, 0, 1), saida(f, 312, 10)) }}>
        {DIAS.map((d, i) => {
          const on = semana >= i;
          return <div key={d.d} style={{ width: 120, padding: '14px 0', textAlign: 'center', borderRadius: 99, background: on ? C.verde : C.papel, border: `1.5px solid ${on ? C.verde : C.linha}`, color: on ? '#fff' : C.fg3, fontFamily: M, fontSize: 26 }}>{d.d}</div>;
        })}
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t="A semana *não parou.*" ini={110} fim={312} tam={72} />
      </div>

      {/* a volta: o relatório no monitor */}
      {f >= 316 && (
        <div style={{ position: 'absolute', left: 80, right: 80, top: 470, transform: `translateY(${(1 - volta) * 300}px) scale(${0.9 + 0.1 * volta})`, opacity: Math.min(1, volta * 2) * saida(f, 486, 12) }}>
          <div style={{ background: C.papel, borderRadius: 48, border: `1.5px solid ${C.linha}`, boxShadow: '0 60px 120px -60px rgba(11,20,17,.5)', padding: '50px 48px' }}>
            <div style={{ fontFamily: M, fontSize: 26, color: C.fg2 }}>segunda · 08:00 · bem-vinda de volta, Joana</div>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 60, letterSpacing: '-0.045em', color: C.ink, marginTop: 10 }}>Sua semana, sem você</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 36 }}>
              {ITENS.map(([t, n, ic], i) => {
                const s = mola(f, 340 + i * 10);
                const ultimo = i === 3;
                return (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 28px', borderRadius: 28, background: ultimo ? C.ambarSuave : C.menta, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 60}px)` }}>
                    <div style={{ width: 66, height: 66, borderRadius: 20, background: '#fff', display: 'grid', placeItems: 'center' }}><Icone n={ic} tam={36} cor={ultimo ? C.ambar : C.verde} traco={2.2} /></div>
                    <div style={{ flex: 1, fontFamily: G, fontWeight: 500, fontSize: 36, color: C.ink, letterSpacing: '-0.02em' }}>{t}</div>
                    <div style={{ fontFamily: G, fontWeight: 600, fontSize: 64, letterSpacing: '-0.05em', color: ultimo ? C.ambar : C.prof }}><Num de={0} ate={n} ini={344 + i * 10} dur={40} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <Titulo t={'Segunda, a Joana volta\ne encontra *tudo em dia.*'} ini={326} fim={486} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 1580, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Surge ini={410} fim={486}><div style={{ fontFamily: M, fontSize: 28, color: C.fg2 }}>exemplo ilustrativo · clínica fictícia</div></Surge>
      </div>
      {f >= 480 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 480, 492, 0, 1) }}><Fecho ini={486} frase={'Férias pra equipe.\n*A agenda continua.*'} /></div>}
    </AbsoluteFill>
  );
};
