// N8 (escuro) — "In English": turista chama em inglês; a Thata responde no idioma dele e marca; a tela troca de idioma letra por letra.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Conversa, Fecho, Selo, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_N8 = 560;
const W = 620;
const ABC = 'abcdefghijklmnopqrstuvwxyzáéíóúãõç';

// troca o texto de A para B embaralhando as letras no meio
const Troca: React.FC<{ a: string; b: string; ini: number; dur?: number }> = ({ a, b, ini, dur = 26 }) => {
  const f = useCurrentFrame();
  const p = lerp(f, ini, ini + dur, 0, 1, (x) => x);
  if (p <= 0) return <>{a}</>;
  if (p >= 1) return <>{b}</>;
  const n = Math.max(a.length, b.length);
  let s = '';
  for (let i = 0; i < n; i++) {
    const lim = i / n;
    if (p > lim + 0.25) s += b[i] ?? '';
    else if (p > lim) s += (b[i] === ' ' || a[i] === ' ') ? ' ' : ABC[(i * 7 + Math.floor(f / 2)) % ABC.length];
    else s += a[i] ?? '';
  }
  return <>{s}</>;
};

export const N8: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const sai = lerp(f, 300, 330, 0, 1);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [300, 1000]])} />
      {/* gancho */}
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: saida(f, 92, 12) }}>
        <div style={{ transform: `scale(${mola(f, 4)})` }}><Selo t="EN · Hi! Do you speak English?" tam={46} fundo={C.papel} cor={C.ink} style={{ border: `1.5px solid ${C.linha2}`, padding: '24px 40px' }} /></div>
      </div>
      <div style={{ position: 'absolute', top: 820, left: 0, right: 0 }}>
        <Titulo t={'Paciente estrangeiro\nno *WhatsApp da clínica.*'} ini={14} fim={92} tam={74} />
      </div>

      {/* a conversa em inglês */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, transform: `translateY(${(1 - mola(f, 86, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px) scale(${1 - sai * 0.12})`, opacity: 1 - sai, transformOrigin: '50% 30%' }}>
        <Conversa w={W} nome="James W." sub="WhatsApp da clínica" tam={30} msgs={[
          { t: 'Hi! Do you have any appointment for a cleaning tomorrow? I’m only in town until Friday.', f: 100, hora: '09:12' },
          { t: 'Hi, James! Yes: tomorrow at 10am or 3pm. Which works best for you?', f: 150, eu: true, ia: true, hora: '09:12' },
          { t: '3pm, please!', f: 204, hora: '09:13' },
          { t: 'Booked: tomorrow, 3pm, with Dr. Paula. We’re 5 min from the beach. See you!', f: 236, eu: true, hora: '09:13' },
        ]} />
      </div>

      {/* a virada: o painel da clínica com as conversas do dia, em idiomas misturados */}
      <div style={{ position: 'absolute', left: 90, right: 90, top: 520, opacity: Math.min(lerp(f, 318, 336, 0, 1), saida(f, 474, 12)), transform: `translateY(${(1 - mola(f, 318)) * 120}px)` }}>
        <div style={{ background: C.papel, borderRadius: 44, border: `1.5px solid ${C.linha2}`, padding: '40px 36px', boxShadow: '0 60px 120px -50px rgba(0,0,0,.9)' }}>
          <div style={{ fontFamily: M, fontSize: 26, color: C.fg2 }}>conversas de hoje</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {([['James W.', 'Booked: tomorrow, 3pm.', 'EN'], ['Marina A.', 'Sexta às 15h, reservado.', 'PT'], ['Laura G.', 'Booked: Monday, 9am.', 'EN'], ['Pedro A.', 'Quinta, 10h, marcado.', 'PT']] as const).map(([n, t, l], i) => {
              const s = mola(f, 336 + i * 8);
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 26, background: 'rgba(255,255,255,.03)', border: `1.5px solid ${C.linha}`, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 60}px)` }}>
                  <div style={{ width: 60, height: 60, borderRadius: 99, background: C.menta, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 28, color: C.luz }}>{n[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink }}>{n}</div>
                    <div style={{ fontFamily: G, fontWeight: 500, fontSize: 26, color: C.fg2 }}>● Thata: {t}</div>
                  </div>
                  <div style={{ fontFamily: M, fontSize: 24, color: l === 'EN' ? C.luz : C.fg2, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${l === 'EN' ? C.verde : C.linha2}` }}>{l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        {f >= 96 && f < 300 && (
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 66, letterSpacing: '-0.045em', color: C.ink, textAlign: 'center', opacity: Math.min(lerp(f, 96, 110, 0, 1), saida(f, 300, 10)) }}>
            <Troca a="She answers in English." b="Ela responde em inglês." ini={190} />
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'Português ou inglês:\n*no idioma do paciente.*'} ini={326} fim={476} tam={70} />
      </div>
      {f >= 470 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 470, 482, 0, 1) }}><Fecho ini={476} frase={'Sua clínica atende\n*quem chegar.*'} /></div>}
    </AbsoluteFill>
  );
};
