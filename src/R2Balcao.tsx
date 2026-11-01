// R2 (claro) — "Quem está na frente": paciente no balcão, e telefone, WhatsApp e Direct puxando a atenção ao mesmo tempo.
// A Thata absorve as interrupções (os ícones voam para o ponto verde) e a recepção volta a olhar para quem chegou.
// Simples: uma pessoa no centro, quatro interrupções em volta, um ponto que resolve. Profissional: órbita, desaturação, foco que volta.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Obj3D, Bolha, Fecho, Narrada, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_R2 = 600;
const CX = 540, CY = 900;
// interrupções: ícone, rótulo, posição de órbita, quando chega, quando a Thata absorve
const INT: [string, string, number, number, number, number][] = [
  ['fone', 'ligação', 230, 470, 76, 222], ['chat', 'WhatsApp', 850, 450, 96, 236],
  ['insta', 'Direct', 230, 1440, 116, 250], ['fone', '2ª ligação', 850, 1450, 136, 264],
];
const PONTO_Y = 520;

const Pessoa: React.FC<{ foco: number }> = ({ foco }) => (
  <div style={{ position: 'absolute', left: CX - 170, top: 760, width: 340, height: 420, filter: `saturate(${0.3 + 0.7 * foco})`, opacity: 0.55 + 0.45 * foco }}>
    <div style={{ position: 'absolute', left: 105, top: 0, width: 130, height: 130, borderRadius: 99, background: 'linear-gradient(160deg, #CFEBDD, #9FD6BC)' }} />
    <div style={{ position: 'absolute', left: 20, top: 150, width: 300, height: 270, borderRadius: '150px 150px 30px 30px', background: 'linear-gradient(160deg, #1BC371, #0B7A47)' }} />
  </div>
);

export const R2: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const entra = mola(f, 2, { damping: 16, stiffness: 120, mass: 0.9 });
  const foco = chaves(f, [[60, 1], [90, 0.35], [200, 0.25], [270, 0.25], [300, 1]]);
  const pDot = mola(f, 206, { damping: 11, stiffness: 140, mass: 0.7 });
  const absorvidos = INT.filter((x) => f >= x[5] + 14).length;
  const vaiCanto = lerp(f, 290, 318, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const espera = Math.max(0, Math.min(f, 290) - 70) / 30 * 0.75; // minutos de espera (acelerado)
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [206, PONTO_Y], [320, 900]])} brilho={chaves(f, [[0, 0.5], [206, 0.4], [222, 1]])} />
      <Fantasma t="ESPERANDO" ini={70} fim={214} y={1500} tam={320} vel={1.6} />
      <Fantasma t="ATENÇÃO" ini={300} fim={486} y={1500} tam={340} />

      <div style={{ opacity: saida(f, 486, 10) }}>
        {/* balcão */}
        <div style={{ position: 'absolute', left: 90, right: 90, top: 1160, height: 70, borderRadius: 26, background: '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 30px 60px -30px rgba(11,20,17,.4)', zIndex: 5, transform: `translateY(${(1 - entra) * 200}px)` }} />
        <div style={{ transform: `translateY(${(1 - entra) * 300}px)` }}><Pessoa foco={foco} /></div>

        {/* o que a paciente diz e o tempo de espera */}
        <div style={{ position: 'absolute', left: 120, width: 520, top: 600, zIndex: 30 }}>
          {f < 300 ? <Bolha t={f < 150 ? 'Bom dia! Tenho horário às 9h.' : '…'} ini={10} tam={36} max={520} /> : <Bolha t="Obrigada!" ini={344} tam={36} max={520} />}
        </div>
        {f >= 300 && <div style={{ position: 'absolute', right: 110, width: 600, top: 470, zIndex: 30 }}><Bolha t="Bom dia, Lúcia! Pode sentar que já te chamo." ini={308} eu humano="Recepção" tam={36} max={600} /></div>}
        <div style={{ position: 'absolute', top: 1250, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 30, color: f < 290 ? C.alerta : C.fg2, opacity: Math.min(lerp(f, 80, 90, 0, 1), saida(f, 330, 10)), zIndex: 6 }}>
          esperando no balcão · {Math.floor(espera)}:{String(Math.floor((espera % 1) * 60)).padStart(2, '0')}
        </div>

        {/* interrupções em órbita, absorvidas pela Thata */}
        {INT.map(([ic, rot, x, y, t0, t1], i) => {
          if (f < t0) return null;
          const p = interpolate(f, [t1, t1 + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.6, 0, 0.9, 0.5) });
          if (p >= 1) return null;
          const xx = x + (CX - x) * p, yy = y + (PONTO_Y - y) * p;
          const treme = f < t1 ? Math.sin(f * 1.7 + i) * 5 : 0;
          return (
            <div key={i} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${treme}px, 0) scale(${1 - p * 0.8})`, transformOrigin: `${xx}px ${yy}px` }}>
              <Obj3D x={xx} y={yy} tam={170} ini={t0} icone={ic} cor={i % 2 ? ['#3BE08E', '#0B7A47'] : ['#2A3833', '#0B1411']} />
              <div style={{ position: 'absolute', left: xx + 50, top: yy - 110, minWidth: 52, height: 52, padding: '0 12px', borderRadius: 99, background: C.alerta, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 700, fontSize: 28, transform: `scale(${molaViva(f, t0 + 6)})`, zIndex: 25 }}>{i === 1 ? Math.min(6, 1 + Math.floor((f - t0) / 14)) : 1}</div>
              <div style={{ position: 'absolute', left: xx - 100, width: 200, top: yy + 104, textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg2 }}>{rot}</div>
            </div>
          );
        })}

        {/* o ponto: chega, absorve, vai para o canto como selo */}
        {f >= 206 && (
          <>
            <Ponto x={CX + (930 - CX) * vaiCanto} y={chaves(f, [[206, 80], [222, PONTO_Y], [290, PONTO_Y], [318, 250]], Easing.bezier(0.55, 0, 0.45, 1))} r={(34 + absorvidos * 4) * pDot * (1 - vaiCanto * 0.5)} />
            {f >= 300 && (
              <div style={{ position: 'absolute', right: 180, top: 226, padding: '12px 22px', borderRadius: 99, background: C.ink, color: '#fff', fontFamily: M, fontSize: 24, opacity: lerp(f, 312, 322, 0, 1), whiteSpace: 'nowrap' }}>
                Thata atendendo · 9 conversas
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ position: 'absolute', top: 1300, left: 60, right: 60 }}>
        <Titulo t={'Atenda quem está\n*na sua frente.*'} ini={404} fim={486} tam={88} />
      </div>
      <div style={{ position: 'absolute', top: 1590, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3, opacity: saida(f, 486, 8) }}>paciente fictícia · exemplo ilustrativo</div>

      <Narrada id="R2" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Atenção no balcão.\n*O resto, a Thata atende.*'} /></div>}
    </AbsoluteFill>
  );
};
