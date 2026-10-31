// N4 (escuro) — "Aguarde na linha": 4min32 de musiquinha e o paciente desliga; as notas caem e viram a onda da voz da Thata, que atende no primeiro toque.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Fone, Onda, Check, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_N4 = 580;
const W = 600;
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const NOTAS = Array.from({ length: 16 }, (_, i) => ({ x: 120 + rnd(i, 1) * 840, y0: 1500 + rnd(i, 2) * 300, v: 1.6 + rnd(i, 3) * 1.8, s: 0.7 + rnd(i, 4) * 0.7, ch: ['♪', '♫', '♩', '♬'][i % 4] }));

const Fala: React.FC<{ t: string; ini: number; th?: boolean }> = ({ t, ini, th }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const n = Math.min(t.length, Math.floor((f - ini) * 1.8));
  return (
    <div style={{ textAlign: th ? 'left' : 'right' }}>
      <div style={{ fontFamily: M, fontSize: 18, color: th ? C.luz : C.fg3 }}>{th ? '● Thata · IA' : 'paciente'}</div>
      <div style={{ fontFamily: G, fontWeight: 500, fontSize: 28, lineHeight: 1.3, color: th ? C.ink : C.fg2 }}>{t.slice(0, n)}</div>
    </div>
  );
};

export const N4: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const espera = lerp(f, 20, 150, 0, 272, Easing.bezier(0.4, 0, 0.9, 0.6));
  const caiu = f >= 156;
  const cai = lerp(f, 176, 214, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const atende = f >= 222;
  const tSeg = atende ? Math.floor((f - 222) / 30) : 0;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [220, 960]])} brilho={atende ? 1 : 0.35} />
      {/* tela da ligação */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 300, transform: `translateY(${(1 - mola(f, 0, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px)` }}>
        <Fone w={W}>
          <div style={{ position: 'absolute', inset: 0, background: atende ? 'radial-gradient(120% 70% at 50% 0%, #12301F, #08110E 70%)' : 'radial-gradient(120% 70% at 50% 0%, #1E2422, #0A0E0D 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 150 }}>
            <div style={{ fontFamily: M, fontSize: 26, color: caiu && !atende ? C.alerta : C.fg2 }}>{atende ? `em ligação · 00:0${Math.min(9, tSeg)}` : caiu ? 'chamada encerrada' : `aguardando · ${Math.floor(espera / 60)}:${String(Math.floor(espera % 60)).padStart(2, '0')}`}</div>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 52, letterSpacing: '-0.04em', color: C.ink, marginTop: 16 }}>Clínica {atende ? 'Aurora' : 'Exemplo'}</div>
            {!atende && (
              <div style={{ marginTop: 50, width: 420, textAlign: 'center', fontFamily: G, fontWeight: 500, fontSize: 32, lineHeight: 1.35, color: C.fg2, fontStyle: 'italic', opacity: caiu ? 0.3 : 1 }}>
                “Sua ligação é muito importante para nós. Por favor, aguarde.”
              </div>
            )}
            {!atende && (
              <div style={{ marginTop: 60, width: 420 }}>
                <div style={{ fontFamily: M, fontSize: 20, color: C.fg3, marginBottom: 10 }}>paciência do paciente</div>
                <div style={{ height: 14, borderRadius: 99, background: 'rgba(255,255,255,.08)' }}>
                  <div style={{ height: '100%', width: `${100 - (espera / 272) * 100}%`, borderRadius: 99, background: espera > 180 ? C.alerta : C.ambar }} />
                </div>
              </div>
            )}
            {atende && <div style={{ marginTop: 40 }}><Onda w={440} h={110} n={28} nivel={0.9} cor={C.luz} /></div>}
            {atende && (
              <div style={{ position: 'absolute', left: 34, right: 34, bottom: 48, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Fala th t="Clínica Aurora, aqui é a Thata, assistente virtual. Como posso ajudar?" ini={232} />
                <Fala t="Queria marcar uma limpeza." ini={290} />
                <Fala th t="Claro! Amanhã às 14h ou sexta às 9h?" ini={318} />
              </div>
            )}
          </div>
          {caiu && !atende && <div style={{ position: 'absolute', left: '50%', bottom: 120, marginLeft: -60, width: 120, height: 120, borderRadius: 99, background: C.alerta, display: 'grid', placeItems: 'center', transform: `scale(${molaViva(f, 156)}) rotate(135deg)` }}>
            <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" /></svg>
          </div>}
        </Fone>
        {atende && <div style={{ position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '14px 26px', borderRadius: 99, background: C.ink, color: C.sobreInk, fontFamily: M, fontSize: 30, transform: `scale(${molaViva(f, 224)})`, opacity: saida(f, 346, 8) }}>atendeu no 1º toque</div>
        </div>}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <Check ini={350} tam={66} />
          {f >= 354 && <div style={{ fontFamily: G, fontWeight: 600, fontSize: 38, color: C.ink, transform: `scale(${molaViva(f, 354)})` }}>Limpeza marcada · amanhã 14h</div>}
        </div>
      </div>

      {/* notas da musiquinha subindo; depois caem e viram a onda */}
      {f < 222 && NOTAS.map((n, i) => {
        const y = n.y0 - Math.max(0, Math.min(f, 176) - i * 4) * n.v * 3;
        const yy = y + cai * (630 - y);
        const xx = n.x + cai * (330 + (i / 15) * 400 - n.x);
        return <div key={i} style={{ position: 'absolute', left: xx, top: yy, fontSize: 70 * n.s * (1 - cai * 0.6), color: cai > 0.5 ? C.luz : C.fg3, opacity: f < 30 ? lerp(f, 20, 30, 0, 1) : 0.85, transform: `rotate(${Math.sin(f / 10 + i) * 14 * (1 - cai)}deg)`, fontFamily: 'serif' }}>{n.ch}</div>;
      })}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t={'4 minutos e 32 segundos\nouvindo *musiquinha.*'} ini={20} fim={152} tam={66} acento={C.ambar} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="E ele *desligou.*" ini={156} fim={214} tam={80} acento={C.alerta} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t={'Com a Thata,\n*ninguém espera na linha.*'} ini={224} fim={460} tam={66} />
      </div>
      {f >= 456 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 456, 468, 0, 1) }}><Fecho ini={462} frase={'Sem musiquinha.\n*Sem espera.*'} /></div>}
    </AbsoluteFill>
  );
};
