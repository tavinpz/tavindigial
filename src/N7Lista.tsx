// N7 (claro) — "A lista de segunda": o ponto desce a lista e risca tudo; sobra só o item que é da equipe: atender quem está na cadeira.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Icone, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_N7 = 580;
const ITENS = [
  'Responder 38 mensagens do WhatsApp',
  'Retornar 6 ligações perdidas',
  'Confirmar as consultas de amanhã',
  'Remarcar a Beatriz',
  'Dar parabéns aos aniversariantes',
  'Chamar quem não volta há meses',
  'Atender quem está na cadeira',
];
const Y0 = 560, DY = 150;
const tItem = (i: number) => 150 + i * 30;

export const N7: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const pY = chaves(f, ITENS.slice(0, 6).map((_, i) => [tItem(i), Y0 + i * DY + 50] as [number, number]).concat([[tItem(5) + 30, Y0 + 6 * DY + 50]]), Easing.bezier(0.5, 0, 0.3, 1));
  const ultimo = f >= 350;
  return (
    <AbsoluteFill>
      <Fundo gy={pY} brilho={f > 140 ? 1 : 0.4} />
      {/* a folha */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 330, bottom: 170, borderRadius: 34, background: '#FFFEF8', border: `1.5px solid ${C.linha}`, boxShadow: '0 60px 120px -60px rgba(11,20,17,.4)', backgroundImage: 'repeating-linear-gradient(transparent 0 149px, rgba(11,20,17,.06) 149px 151px)', backgroundPosition: '0 70px', opacity: mola(f, 0), transform: `translateY(${(1 - mola(f, 0)) * 200}px)` }}>
        <div style={{ position: 'absolute', left: 60, top: 70, fontFamily: G, fontWeight: 600, fontSize: 56, letterSpacing: '-0.04em', color: C.ink }}>Segunda · pra fazer</div>
      </div>
      {ITENS.map((t, i) => {
        const y = Y0 + i * DY;
        const ini = 16 + i * 10;
        const s = mola(f, ini);
        const eh = i === 6;
        const feito = !eh && f >= tItem(i) + 4;
        const risca = eh ? 0 : lerp(f, tItem(i) + 4, tItem(i) + 18, 0, 1);
        const pc = feito ? molaViva(f, tItem(i) + 4) : 1;
        const destaque = eh && ultimo ? lerp(f, 350, 370, 0, 1) : 0;
        return (
          <div key={i} style={{ position: 'absolute', left: 110, right: 110, top: y, height: 100, display: 'flex', alignItems: 'center', gap: 30, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 40}px) scale(${1 + destaque * 0.06})`, transformOrigin: '0% 50%', zIndex: eh ? 5 : 1 }}>
            <div style={{ width: 66, height: 66, borderRadius: 18, flex: 'none', border: `4px solid ${feito ? C.verde : eh && ultimo ? C.ink : C.fg3}`, background: feito ? C.verde : 'transparent', display: 'grid', placeItems: 'center', transform: `scale(${pc})` }}>
              {feito && <Icone n="ok" tam={40} cor="#fff" traco={3.2} />}
              {eh && ultimo && <div style={{ width: 22, height: 22, borderRadius: 99, background: C.alerta, transform: `scale(${molaViva(f, 356)})` }} />}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: G, fontWeight: eh ? 600 : 500, fontSize: 44, letterSpacing: '-0.025em', color: feito ? C.fg3 : C.ink, backgroundImage: `linear-gradient(${C.fg3}, ${C.fg3})`, backgroundRepeat: 'no-repeat', backgroundSize: `${risca * 100}% 4px`, backgroundPosition: '0 56%' }}>{t}</span>
              {feito && <div style={{ fontFamily: M, fontSize: 22, color: C.verde, marginTop: 4, opacity: lerp(f, tItem(i) + 10, tItem(i) + 20, 0, 1) }}>feito pela Thata · 08:{String(4 + i * 3).padStart(2, '0')}</div>}
              {eh && ultimo && <div style={{ fontFamily: M, fontSize: 24, color: C.alerta, marginTop: 4, opacity: lerp(f, 360, 372, 0, 1) }}>esse é com você</div>}
            </div>
          </div>
        );
      })}
      {f >= 140 && f < 346 && <Ponto x={150} y={pY} r={lerp(f, 140, 152, 0, 22)} o={saida(f, 346, 10)} />}

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A lista de *toda segunda.*" ini={6} fim={140} tam={70} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A Thata *risca tudo isso.*" ini={146} fim={344} tam={70} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'E deixa pra você\n*o que só você faz.*'} ini={350} fim={486} tam={70} />
      </div>
      {f >= 480 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 480, 492, 0, 1) }}><Fecho ini={486} frase={'Mais tempo pra quem\n*está na cadeira.*'} /></div>}
    </AbsoluteFill>
  );
};
