// P5 (claro) — "A conta da recepção": um recibo imprime o tempo que a recepção gasta; a tesoura verde corta linha por linha;
// sobra só "atender quem está na cadeira". Referência: comercial de app com cor chapada, recibo, tesoura e número grande.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, NumGrande, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_P5 = 600;
const ITENS: [string, string, number][] = [
  ['Responder "qual o valor?"', '1h20', 80],
  ['Confirmar as consultas de amanhã', '1h05', 65],
  ['Retornar ligações perdidas', '50min', 50],
  ['Remarcar quem desmarcou', '40min', 40],
  ['Lembrar aniversários e retornos', '15min', 15],
];
const Y0 = 560, DY = 150;
const tCorte = (i: number) => 262 + i * 18;

const Tesoura: React.FC<{ x: number; y: number; abre: number; rot?: number; s?: number }> = ({ x, y, abre, rot = 0, s = 1 }) => (
  <div style={{ position: 'absolute', left: x - 160 * s, top: y - 160 * s, width: 320 * s, height: 320 * s, transform: `rotate(${rot}deg)`, zIndex: 60, filter: 'drop-shadow(0 24px 30px rgba(11,20,17,.35))' }}>
    <svg viewBox="0 0 320 320" width={320 * s} height={320 * s}>
      {[1, -1].map((k) => (
        <g key={k} transform={`rotate(${k * abre * 16} 160 160)`}>
          <path d={k === 1 ? 'M160 160 L310 140 L312 152 Z' : 'M160 160 L310 180 L312 168 Z'} fill="#D7DEDB" stroke="#AEB8B4" strokeWidth={2} />
          <ellipse cx={k === 1 ? 70 : 70} cy={k === 1 ? 110 : 210} rx={52} ry={38} fill="none" stroke={C.verde} strokeWidth={22} />
          <path d={k === 1 ? 'M110 128 L160 160' : 'M110 192 L160 160'} stroke={C.verde} strokeWidth={22} strokeLinecap="round" />
        </g>
      ))}
      <circle cx={160} cy={160} r={10} fill="#0B1411" />
    </svg>
  </div>
);

export const P5: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const abertura = f < 58;
  const imprime = lerp(f, 66, 200, 0, 1, (x) => x);
  const linhasVis = Math.floor(imprime * 7);
  const tesX = chaves(f, [[240, 1400], [258, 900], [350, 900], [370, 1500]]);
  const tesY = chaves(f, [[240, Y0 + 75], ...ITENS.map((_, i) => [tCorte(i), Y0 + i * DY + 75] as [number, number])]);
  const abre = Math.abs(Math.sin((f - 240) / 4.5));
  const final = f >= 380;
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.5} />
      {/* recibo */}
      {!abertura && (
        <div style={{ position: 'absolute', left: 110, width: 860, top: 420, opacity: saida(f, 380, 12) }}>
          <div style={{ height: 34, borderRadius: 20, background: '#0B1411', marginBottom: -14, position: 'relative', zIndex: 3 }} />
          <div style={{ position: 'relative', background: '#fff', padding: '40px 44px 70px', boxShadow: '0 50px 100px -50px rgba(11,20,17,.5)', clipPath: `inset(0 0 ${(1 - Math.min(1, imprime * 1.1)) * 100}% 0)`, fontFamily: M }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: C.fg3, borderBottom: '2px dashed #D2DBD7', paddingBottom: 18 }}><span>RECEPÇÃO · 1 DIA</span><span>terça</span></div>
            {ITENS.map(([t, h], i) => {
              const c = lerp(f, tCorte(i) + 2, tCorte(i) + 22, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.4));
              return (
                <div key={i} style={{ position: 'relative', height: DY, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 30, color: C.ink, opacity: i < linhasVis ? 1 - c : 0, transform: `translateY(${c * 400}px) rotate(${c * (i % 2 ? 14 : -12)}deg)`, borderBottom: '2px dashed #E2E8E5' }}>
                  <span style={{ fontFamily: G, fontWeight: 500, fontSize: 42, letterSpacing: '-0.02em' }}>{t}</span><span style={{ fontWeight: 500, fontSize: 36 }}>{h}</span>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 26, opacity: linhasVis >= 6 ? saida(f, 262, 10) : 0 }}>
              <span style={{ fontSize: 28, color: C.fg2 }}>TOTAL</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <NumGrande de={0} ate={4.2} ini={196} dur={40} tam={170} casas={1} pos="h" />
              </div>
            </div>
            <div style={{ fontSize: 20, color: C.fg3, marginTop: 10, opacity: linhasVis >= 6 ? saida(f, 262, 10) : 0 }}>estimativa ilustrativa · por dia</div>
          </div>
          <div style={{ height: 22, marginTop: -1, clipPath: `inset(0 0 ${imprime < 0.95 ? 100 : 0}% 0)`, background: 'linear-gradient(135deg, #fff 33%, transparent 33%) 0 0 / 30px 30px, linear-gradient(225deg, #fff 33%, transparent 33%) 0 0 / 30px 30px' }} />
        </div>
      )}
      {/* a tesoura */}
      {f >= 236 && f < 380 && <Tesoura x={tesX} y={tesY} abre={abre} rot={180} s={1.25} />}

      {/* o que sobra */}
      {final && (
        <AbsoluteFill style={{ opacity: saida(f, 492, 12) }}>
          <div style={{ position: 'absolute', left: 110, right: 110, top: 760, padding: '44px 44px', background: '#fff', borderRadius: 18, boxShadow: '0 50px 100px -50px rgba(11,20,17,.5)', transform: `scale(${molaViva(f, 384)})`, border: `3px solid ${C.verde}` }}>
            <div style={{ fontFamily: M, fontSize: 24, color: C.verde }}>FICA COM VOCÊ</div>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 56, letterSpacing: '-0.035em', color: C.ink, marginTop: 10 }}>Atender quem está na cadeira</div>
          </div>
          <div style={{ position: 'absolute', top: 1120, left: 0, right: 0 }}>
            <Titulo t={'O resto,\n*a Thata faz.*'} ini={404} tam={96} />
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: 'absolute', top: 170, left: 0, right: 0 }}>
        <Titulo t="Onde vai o dia da recepção?" ini={66} fim={232} tam={60} />
      </div>
      <div style={{ position: 'absolute', top: 170, left: 0, right: 0 }}>
        <Titulo t="Agora *corta.*" ini={238} fim={376} tam={88} />
      </div>

      {/* abertura em verde chapado */}
      {abertura && (
        <AbsoluteFill style={{ background: C.verde, display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: `inset(0 0 ${lerp(f, 46, 58, 0, 100, Easing.bezier(0.7, 0, 0.3, 1))}% 0)` }}>
          <Titulo t={'Quanto custa\n*a sua recepção*\npor dia?'} ini={2} tam={110} cor="#fff" acento="#06100C" />
        </AbsoluteFill>
      )}
      {f >= 488 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 488, 500, 0, 1) }}><Fecho ini={494} frase={'Fica o que importa.\n*O resto é com ela.*'} /></div>}
    </AbsoluteFill>
  );
};
