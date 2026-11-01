// R1 (claro) — "Post-its": segunda de manhã, a tela da recepção está coberta de recados. A Thata resolve um por um:
// cada post-it cai e vira uma linha verde de "resolvido" na tela limpa.
// Simples: um objeto (o monitor), uma ação repetida com ritmo (o recado cai), um contador. Profissional: peso, sombra, câmera viva.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, NumGrande, Titulo, Ponto, Fecho, Narrada, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_R1 = 600;
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
// recados (pacientes fictícios) e o que a Thata fez com cada um
const NOTAS: [string, string][] = [
  ['Ligar p/ Dona Marta', 'Dona Marta: retorno marcado'], ['Confirmar 14h', '14h confirmado'], ['Orçamento clareamento?', 'Orçamento enviado'],
  ['Remarcar Bruno', 'Bruno: remarcado p/ qui'], ['Responder o Insta', 'Direct respondido'], ['Quem ligou 12h10?', 'Ligação retornada'],
  ['Lembrar retorno Ana', 'Ana: lembrete enviado'], ['Tem horário sábado?', 'Sábado 9h agendado'],
];
const N = NOTAS.length;
const MX = 120, MY = 560, MW = 840, MH = 560; // tela do monitor
const chega = (i: number) => 24 + i * 16;
const cai = (i: number) => 214 + i * 20;
const CORES = ['#FCF2E1', '#E6F6EE', '#FFFFFF', '#FDECEC'];

const PostIt: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  if (f < chega(i)) return null;
  const s = molaViva(f, chega(i));
  const x = MX + 40 + (i % 3) * 262 + (rnd(i, 1) - 0.5) * 60;
  const y = MY + 40 + Math.floor(i / 3) * 170 + (rnd(i, 2) - 0.5) * 40;
  const r0 = (rnd(i, 3) - 0.5) * 14;
  const q = interpolate(f, [cai(i), cai(i) + 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0, 0.9, 0.6) });
  if (q >= 1) return null;
  const desc = q * q * 1300, gira = r0 + q * (rnd(i, 4) > 0.5 ? 70 : -70);
  const descola = f >= cai(i) - 4 && f < cai(i) ? Math.sin((f - cai(i)) * 3) * 4 : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y + desc, width: 240, height: 150, transform: `rotate(${gira + descola}deg) scale(${0.6 + 0.4 * s})`, transformOrigin: '50% 0%', opacity: Math.min(1, s * 2), zIndex: 20 + i,
      background: CORES[i % 4], borderRadius: 6, padding: '22px 20px', boxShadow: `0 ${8 + q * 30}px ${18 + q * 30}px -10px rgba(11,20,17,.35)`, fontFamily: G, fontWeight: 600, fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.02em', color: C.ink }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, background: 'rgba(11,20,17,.05)' }} />
      {NOTAS[i][0]}
    </div>
  );
};

export const R1: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const zoom = chaves(f, [[0, 1.08], [40, 1], [190, 1.04], [214, 1], [400, 1], [420, 0.96]]);
  const pDot = mola(f, 196, { damping: 11, stiffness: 140, mass: 0.7 });
  const feitos = NOTAS.filter((_, i) => f >= cai(i) + 14).length;
  const resto = N - NOTAS.filter((_, i) => f >= cai(i)).length;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 800], [200, 1000], [420, 840]])} brilho={chaves(f, [[0, 0.4], [196, 0.5], [214, 1]])} />
      <Fantasma t="RECADO" ini={0} fim={206} y={1450} tam={360} />
      <Fantasma t="RESOLVIDO" ini={214} fim={486} y={1450} tam={330} vel={1.5} />

      {/* contador */}
      <div style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: saida(f, 486, 8) }}>
        {f < 214
          ? <><NumGrande de={0} ate={N} ini={24} dur={130} tam={170} cor={C.ink} /><div style={{ fontFamily: M, fontSize: 28, color: C.fg2, marginTop: 4 }}>recados na tela · segunda, 8h</div></>
          : <><div style={{ fontFamily: G, fontWeight: 600, fontSize: 170, letterSpacing: '-0.05em', color: C.verde, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{resto}</div><div style={{ fontFamily: M, fontSize: 28, color: C.fg2, marginTop: 4 }}>{resto ? 'recados na tela' : 'nenhum recado · tudo resolvido'}</div></>}
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 860px', opacity: saida(f, 486, 10) }}>
        {/* o monitor */}
        <div style={{ position: 'absolute', left: MX - 24, top: MY - 24, width: MW + 48, height: MH + 48, borderRadius: 34, background: '#0B1411', boxShadow: '0 50px 90px -40px rgba(11,20,17,.6)' }} />
        <div style={{ position: 'absolute', left: 540 - 60, top: MY + MH + 24, width: 120, height: 110, background: 'linear-gradient(#1A2420, #0B1411)' }} />
        <div style={{ position: 'absolute', left: 540 - 190, top: MY + MH + 128, width: 380, height: 26, borderRadius: 13, background: '#0B1411' }} />
        <div style={{ position: 'absolute', left: MX, top: MY, width: MW, height: MH, borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: '26px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1.5px solid ${C.linha}` }}>
            <span style={{ fontFamily: G, fontWeight: 600, fontSize: 34, color: C.ink, letterSpacing: '-0.03em' }}>Recepção · hoje</span>
            <span style={{ fontFamily: M, fontSize: 22, color: f >= 214 ? C.verde : C.fg3 }}>{f >= 214 ? `● Thata · ${feitos} resolvidos` : 'sem tempo pra nada'}</span>
          </div>
          <div style={{ padding: '18px 30px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NOTAS.map(([, ok], i) => f >= cai(i) + 14 && (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: G, fontWeight: 500, fontSize: 31, color: C.ink, opacity: lerp(f, cai(i) + 14, cai(i) + 22, 0, 1), transform: `translateX(${(1 - mola(f, cai(i) + 14)) * -30}px)` }}>
                <span style={{ width: 34, height: 34, borderRadius: 99, background: C.verde, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, flex: 'none' }}>✓</span>{ok}
              </div>
            ))}
          </div>
        </div>
        {NOTAS.map((_, i) => <PostIt key={i} i={i} />)}
        {/* a Thata chega no canto da tela */}
        {f >= 196 && <Ponto x={MX + MW - 6} y={chaves(f, [[196, 120], [212, MY + 4]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}
      </div>

      <div style={{ position: 'absolute', top: 1310, left: 60, right: 60 }}>
        <Titulo t={'Nenhum recado\n*fica pra depois.*'} ini={410} fim={486} tam={84} />
      </div>
      <div style={{ position: 'absolute', top: 1520, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3, opacity: saida(f, 486, 8) }}>pacientes fictícios</div>

      <Narrada id="R1" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Menos recado na tela.\n*Mais paciente na cadeira.*'} /></div>}
    </AbsoluteFill>
  );
};
