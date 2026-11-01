// P2 (escuro) — "Round 1": Thata contra a fila do WhatsApp, em HUD de luta (hits, combo, K.O.); depois o "sistema" em órbita.
// Referência: HUD de jogo + ícones 3D brilhantes + números de dano + diagrama de agente em órbita + legenda cinética.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Legenda, Obj3D, Icone, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_P2 = 600;
const HITS: [number, string, string][] = [[70, '-12 mensagens', '1 HIT'], [104, '-6 ligações', '2 HITS'], [136, '-9 remarcações', '3 HITS · COMBO'], [168, 'CRÍTICO -20 confirmações', '']];

const Barra: React.FC<{ nome: string; v: number; cor: string; dir?: boolean }> = ({ nome, v, cor, dir }) => (
  <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 10, alignItems: dir ? 'flex-end' : 'flex-start' }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: M, fontSize: 26, color: C.ink, letterSpacing: '0.06em' }}>{nome}</div>
    <div style={{ width: 440, height: 22, borderRadius: 6, background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.15)', overflow: 'hidden', display: 'flex', justifyContent: dir ? 'flex-end' : 'flex-start' }}>
      <div style={{ width: `${v}%`, height: '100%', background: `linear-gradient(90deg, ${cor}, ${cor}cc)`, boxShadow: `0 0 18px ${cor}` }} />
    </div>
  </div>
);

export const P2: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const vidaFila = chaves(f, [[0, 100], [70, 100], [74, 78], [104, 78], [108, 58], [136, 58], [140, 34], [168, 34], [172, 0]], Easing.bezier(0.2, 0.8, 0.2, 1));
  const vidaThata = chaves(f, [[0, 99], [90, 99], [94, 96], [150, 96], [154, 95]]);
  const golpe = HITS.reduce((a, [t]) => a + (f >= t && f < t + 10 ? Math.sin(((f - t) / 10) * Math.PI) : 0), 0);
  const ko = f >= 176;
  const luta = saida(f, 226, 14);
  const orb = f >= 230;
  const ang = (f - 250) / 26;
  const ICONES: [string, string, number][] = [['fone', 'atende', 0], ['agenda', 'agenda', 1], ['ok', 'confirma', 2], ['volta', 'reativa', 3]];
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [240, 960]])} brilho={1} />
      {/* piso com grade em perspectiva */}
      <div style={{ position: 'absolute', left: -400, right: -400, top: 1100, height: 900, transform: 'perspective(700px) rotateX(62deg)', transformOrigin: '50% 0%', backgroundImage: 'linear-gradient(rgba(95,227,161,.10) 2px, transparent 2px), linear-gradient(90deg, rgba(95,227,161,.10) 2px, transparent 2px)', backgroundSize: '120px 120px', backgroundPosition: `0 ${f * 3}px`, opacity: 0.8 }} />

      {/* a luta */}
      <AbsoluteFill style={{ opacity: luta }}>
        <div style={{ position: 'absolute', top: 120, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', opacity: lerp(f, 4, 16, 0, 1) }}>
          <Barra nome="THATA" v={vidaThata} cor="#1BC371" />
          <div style={{ fontFamily: G, fontWeight: 700, fontSize: 64, color: C.ink, alignSelf: 'flex-end', marginBottom: -6 }}>{Math.round(vidaThata)}</div>
          <Barra nome="FILA DO WHATSAPP" v={vidaFila} cor="#FF5A5F" dir />
        </div>
        <div style={{ position: 'absolute', top: 380, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 700, fontSize: 150, letterSpacing: '-0.04em', color: C.ink, opacity: Math.min(lerp(f, 10, 18, 0, 1), saida(f, 64, 8)), transform: `scale(${1.3 - 0.3 * mola(f, 10)})` }}>ROUND 1</div>
        <Obj3D x={340 + golpe * 120} y={1000} tam={290} ini={6} cor={['#3BE08E', '#0B7A47']} ry={-20}>
          <div style={{ width: 90, height: 90, borderRadius: 99, background: '#fff', boxShadow: '0 0 30px rgba(255,255,255,.9)' }} />
        </Obj3D>
        {!ko || f < 200 ? (
          <div style={{ position: 'absolute', left: 0, top: 0, transform: ko ? `translate(${lerp(f, 176, 200, 0, 500)}px, ${lerp(f, 176, 200, 0, -300)}px) rotate(${lerp(f, 176, 200, 0, 60)}deg)` : `translateX(${golpe * 30}px)`, opacity: ko ? saida(f, 200, 20) : 1 }}>
            <Obj3D x={760} y={1000} tam={270} ini={12} cor={['#FF8A6B', '#C7303A']} ry={20} icone="chat" />
          </div>
        ) : null}
        {/* números de dano */}
        {HITS.map(([t, dano, combo], i) => f >= t && f < t + 40 && (
          <div key={i} style={{ position: 'absolute', left: dano.startsWith('CRÍTICO') ? 260 : i % 2 ? 560 : 520, top: 760 - (f - t) * 3, fontFamily: G, fontWeight: 700, fontSize: dano.startsWith('CRÍTICO') ? 64 : 54, color: dano.startsWith('CRÍTICO') ? '#FFD84D' : C.luz, opacity: saida(f, t + 40, 12), transform: `scale(${molaViva(f, t)}) rotate(-4deg)`, textShadow: '0 6px 20px rgba(0,0,0,.6)', whiteSpace: 'nowrap' }}>{dano}</div>
        ))}
        {HITS.map(([t, , combo], i) => combo && f >= t + 4 && f < t + 34 && (
          <div key={'c' + i} style={{ position: 'absolute', left: 90, top: 560, fontFamily: G, fontWeight: 700, fontSize: 56, color: '#FFD84D', fontStyle: 'italic', transform: `scale(${molaViva(f, t + 4)})`, opacity: saida(f, t + 34, 8) }}>{combo}</div>
        ))}
        {ko && (
          <div style={{ position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 700, fontSize: 260, letterSpacing: '-0.04em', color: '#FF5A5F', transform: `scale(${molaViva(f, 176) * (1 + Math.max(0, 1 - (f - 176) / 6) * 0.4)}) rotate(-6deg)`, textShadow: '0 16px 50px rgba(255,90,95,.5)', opacity: saida(f, 226, 12) }}>K.O.</div>
        )}
        {ko && Array.from({ length: 14 }, (_, i) => {
          const t = (f - 176) / 30, a = (i / 14) * Math.PI * 2;
          return <div key={i} style={{ position: 'absolute', left: 760 + Math.cos(a) * 600 * t, top: 1000 + Math.sin(a) * 600 * t + 400 * t * t, width: 30, height: 14, background: i % 2 ? '#FF5A5F' : '#FFD84D', transform: `rotate(${t * 400 + i * 40}deg)`, opacity: saida(f, 220, 16) }} />;
        })}
      </AbsoluteFill>

      {/* o sistema em órbita */}
      {orb && (
        <div style={{ position: 'absolute', left: 90, right: 90, top: 380, height: 1000, borderRadius: 44, background: 'rgba(16,28,24,.85)', border: `1.5px solid ${C.linha2}`, boxShadow: '0 60px 120px -60px rgba(0,0,0,.9)', opacity: Math.min(lerp(f, 230, 246, 0, 1), saida(f, 488, 12)), transform: `scale(${0.92 + 0.08 * mola(f, 230)})` }}>
          <div style={{ position: 'absolute', left: 36, top: 30, display: 'flex', alignItems: 'center', gap: 14, fontFamily: G, fontWeight: 600, fontSize: 34, color: C.ink }}>
            <div style={{ width: 16, height: 16, borderRadius: 99, background: C.verde }} /> Recepção da Thata
          </div>
          <div style={{ position: 'absolute', right: 36, top: 36, fontFamily: M, fontSize: 24, color: f > 300 ? C.luz : C.fg3 }}>{f > 300 ? '● rodando' : '○ pausado'}</div>
          {/* anel */}
          <svg style={{ position: 'absolute', left: 450 - 300, top: 470 - 300 }} width={600} height={600}>
            <circle cx={300} cy={300} r={260} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={4} />
            <circle cx={300} cy={300} r={260} fill="none" stroke={C.luz} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={`${lerp(f, 250, 300, 0, 100)} 100`} transform="rotate(-90 300 300)" style={{ filter: 'drop-shadow(0 0 10px rgba(95,227,161,.8))' }} />
          </svg>
          <Obj3D x={450} y={470} tam={200} ini={240} flutua={0.4}>
            <div style={{ width: 60, height: 60, borderRadius: 99, background: '#fff', boxShadow: '0 0 24px rgba(255,255,255,.9)' }} />
          </Obj3D>
          {ICONES.map(([ic, nome, k]) => {
            const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
            const ini = 262 + k * 10;
            if (f < ini) return null;
            const s = molaViva(f, ini);
            const aceso = Math.floor(Math.max(0, (f - 310) / 20)) % 4 === k && f > 310;
            return (
              <div key={nome} style={{ position: 'absolute', left: 450 + Math.cos(a) * 260 - 60, top: 470 + Math.sin(a) * 260 - 60, width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `scale(${s * (aceso ? 1.12 : 1)})` }}>
                <div style={{ width: 96, height: 96, borderRadius: 28, background: aceso ? C.verde : '#1E2E28', border: `1.5px solid ${aceso ? C.luz : C.linha2}`, display: 'grid', placeItems: 'center', boxShadow: aceso ? '0 0 40px rgba(95,227,161,.6)' : 'none' }}>
                  <Icone n={ic} tam={48} cor={aceso ? '#06100C' : C.ink} traco={2.2} />
                </div>
                <div style={{ fontFamily: G, fontWeight: 600, fontSize: 28, color: aceso ? C.luz : C.fg2, background: '#101C18', padding: '2px 12px', borderRadius: 10 }}>{nome}</div>
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 36, bottom: 34, display: 'flex', alignItems: 'center', gap: 16, fontFamily: G, fontWeight: 500, fontSize: 30, color: C.fg2 }}>
            Automático
            <div style={{ width: 84, height: 46, borderRadius: 99, background: f > 300 ? C.verde : 'rgba(255,255,255,.12)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 5, left: f > 300 ? 43 : 5, width: 36, height: 36, borderRadius: 99, background: '#fff', transition: 'none' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', right: 36, bottom: 40, fontFamily: M, fontSize: 26, color: C.fg2 }}>atendimentos hoje · <span style={{ color: C.luz }}>{Math.max(0, Math.floor((f - 300) / 4))}</span></div>
        </div>
      )}

      <Legenda frases={[
        [20, 100, 'Segunda de manhã contra a fila do WhatsApp'],
        [102, 176, 'mensagens, ligações, remarcações e confirmações'],
        [178, 228, 'nocaute no primeiro round'],
        [234, 320, 'porque a Thata não é um robô de resposta pronta'],
        [322, 410, 'ela atende, agenda, confirma e reativa'],
        [412, 488, 'no automático, o dia inteiro'],
      ]} y={1500} />
      {f >= 484 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 484, 496, 0, 1) }}><Fecho ini={490} frase={'Sua recepção\n*ganha todo round.*'} /></div>}
    </AbsoluteFill>
  );
};
