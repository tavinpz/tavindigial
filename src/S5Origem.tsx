// S5 (escuro) — "De qual anúncio veio?" (Origem do lead): um lead novo e quatro anúncios rodando, todos com "?".
// O ponto liga a conta de anúncios em Integrações, o card do lead vira e a aba Anúncio mostra campanha, conjunto, anúncio e criativo;
// um fio verde liga o lead ao criativo certo. Anúncios genéricos, sem marca de plataforma.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Fecho, Narrada, Icone, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_S5 = 600;
const CRI: [string, string, [string, string]][] = [
  ['Avaliação de implante', 'vídeo', ['#1BC371', '#0B5E3A']],
  ['Clareamento', 'imagem', ['#5B7CFA', '#24357A']],
  ['Limpeza e check-up', 'imagem', ['#F2B457', '#8A5A12']],
  ['Lentes de contato dental', 'vídeo', ['#E07AB8', '#6D2453']],
];
const GX = [70, 560], GY = [960, 1240], GW = 450, GH = 250;
const cxy = (i: number) => ({ x: GX[i % 2], y: GY[Math.floor(i / 2)] });
const CERTO = 0;
const LEAD = { x: 190, y: 380, w: 700, h: 470 };

const Criativo: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [t, tipo, cor] = CRI[i];
  const { x, y } = cxy(i);
  const ent = mola(f, 76 + i * 8, { damping: 16, stiffness: 140, mass: 0.7 });
  const achou = f >= 344;
  const certo = i === CERTO;
  const o = achou && !certo ? lerp(f, 344, 360, 1, 0.28) : 1;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: GW, height: GH, borderRadius: 30, overflow: 'hidden', opacity: Math.min(1, ent * 2) * o,
      transform: `translateY(${(1 - ent) * 60}px) scale(${certo && achou ? 1 + 0.04 * molaViva(f, 344) : 1})`, border: `2px solid ${certo && achou ? C.luz : 'rgba(255,255,255,.1)'}`,
      boxShadow: certo && achou ? '0 0 0 8px rgba(95,227,161,.18), 0 40px 80px -30px rgba(27,195,113,.7)' : '0 30px 60px -30px rgba(0,0,0,.7)', background: `linear-gradient(140deg, ${cor[0]}, ${cor[1]})` }}>
      <div style={{ position: 'absolute', right: -40, bottom: -60, width: 220, height: 220, borderRadius: 99, background: 'rgba(255,255,255,.14)' }} />
      <div style={{ position: 'absolute', left: 28, top: 24, fontFamily: M, fontSize: 22, color: 'rgba(255,255,255,.8)' }}>{`anúncio ${'ABCD'[i]} · ${tipo}`}</div>
      <div style={{ position: 'absolute', left: 28, bottom: 26, right: 90, fontFamily: G, fontWeight: 600, fontSize: 38, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05 }}>{t}</div>
      <div style={{ position: 'absolute', right: 22, top: 20, width: 56, height: 56, borderRadius: 99, display: 'grid', placeItems: 'center', background: certo && achou ? C.verde : 'rgba(0,0,0,.35)', color: '#fff', fontFamily: G, fontWeight: 700, fontSize: 32 }}>
        {certo && achou ? <Icone n="ok" tam={34} cor="#06100C" traco={3} /> : '?'}
      </div>
    </div>
  );
};

export const S5: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const leadS = mola(f, 0, { damping: 14, stiffness: 120, mass: 0.8 });
  const sobe = lerp(f, 66, 96, 0, 1, Easing.bezier(0.5, 0, 0.2, 1));
  const ly = chaves(f, [[66, 640], [96, LEAD.y]]);
  const gira = lerp(f, 250, 284, 0, 180, Easing.bezier(0.6, 0, 0.3, 1));
  const lig = f >= 230;
  const pDot = mola(f, 212, { damping: 11, stiffness: 140, mass: 0.7 });
  const recua = lerp(f, 400, 424, 0, 1);
  const ROWS: [string, string][] = [['campanha', 'Implantes · novembro'], ['conjunto', 'região da clínica · 35+'], ['anúncio', 'Avaliação de implante'], ['criativo', 'vídeo · 15 s']];
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 700], [210, 260], [300, 1100]])} brilho={chaves(f, [[0, 0.35], [210, 0.3], [228, 1]])} />
      <Fantasma t="ORIGEM" ini={60} fim={486} y={1500} tam={340} vel={1.3} />

      <div style={{ position: 'absolute', top: 160, left: 60, right: 60, opacity: saida(f, 150, 10) }}>
        <Titulo t={'De qual anúncio\n*ela veio?*'} ini={2} fim={150} tam={96} linha={1.12} />
      </div>

      {/* integrações: a conta de anúncios */}
      {f >= 206 && (
        <div style={{ position: 'absolute', left: 140, right: 140, top: 210, height: 120, borderRadius: 30, background: C.papel, border: `1.5px solid ${lig ? 'rgba(95,227,161,.4)' : C.linha}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px',
          opacity: Math.min(lerp(f, 206, 218, 0, 1), saida(f, 404, 10)) }}>
          <Icone n="seta" tam={40} cor={C.vivo} traco={2.2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: M, fontSize: 22, color: C.fg2 }}>Integrações</div>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 36, color: C.ink, letterSpacing: '-0.02em' }}>Conta de anúncios</div>
          </div>
          <div style={{ fontFamily: M, fontSize: 24, color: lig ? C.vivo : C.fg3 }}>{lig ? 'conectada' : 'desligada'}</div>
          <div style={{ width: 96, height: 54, borderRadius: 99, background: lig ? C.verde : C.linha2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 5, left: lig ? 47 + 0 * molaViva(f, 230) : 5, width: 44, height: 44, borderRadius: 99, background: '#fff', transition: 'none' }} />
          </div>
        </div>
      )}
      {f >= 210 && f < 232 && <Ponto x={810} y={chaves(f, [[212, 40], [228, 270]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}

      {/* o card do lead, que vira */}
      <div style={{ position: 'absolute', left: LEAD.x, top: ly, width: LEAD.w, height: LEAD.h, perspective: 1800, opacity: Math.min(1, leadS * 2) * saida(f, 486, 10) * (1 - recua * 0.6),
        transform: `scale(${(0.9 + 0.1 * leadS) * (1 - sobe * 0.06) - recua * 0.06})`, filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined, zIndex: 20 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${gira}deg)` }}>
          {/* frente */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 36, background: C.papel, border: `1.5px solid ${C.linha}`, padding: 40, boxShadow: '0 50px 100px -40px rgba(0,0,0,.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 100, height: 100, borderRadius: 99, background: C.menta, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 46, color: C.vivo }}>C</div>
              <div>
                <div style={{ fontFamily: G, fontWeight: 600, fontSize: 52, color: C.ink, letterSpacing: '-0.03em' }}>Carla M.</div>
                <div style={{ fontFamily: M, fontSize: 26, color: C.fg2, marginTop: 4 }}>novo lead · 14:20</div>
              </div>
            </div>
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', borderRadius: 24, background: 'rgba(255,255,255,.04)', border: `1.5px dashed ${C.linha2}` }}>
              <span style={{ fontFamily: M, fontSize: 28, color: C.fg2, flex: 1 }}>origem</span>
              <span style={{ fontFamily: G, fontWeight: 600, fontSize: 64, color: C.alerta, transform: `scale(${1 + Math.sin(f / 5) * 0.06})` }}>?</span>
            </div>
            <div style={{ fontFamily: M, fontSize: 26, color: C.fg3, marginTop: 26, textAlign: 'center' }}>veio de um anúncio… mas qual?</div>
          </div>
          {/* verso: aba Anúncio */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 36, background: C.papel, border: '1.5px solid rgba(95,227,161,.4)', padding: '30px 36px', boxShadow: '0 50px 100px -40px rgba(27,195,113,.6)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontFamily: G, fontWeight: 600, fontSize: 36, color: C.ink, flex: 1, letterSpacing: '-0.02em' }}>Carla M.</div>
              <div style={{ padding: '8px 18px', borderRadius: 99, fontFamily: G, fontWeight: 600, fontSize: 24, color: C.fg2, border: `1.5px solid ${C.linha2}` }}>Conversa</div>
              <div style={{ padding: '8px 18px', borderRadius: 99, fontFamily: G, fontWeight: 600, fontSize: 24, background: C.verde, color: '#06100C' }}>Anúncio</div>
            </div>
            {ROWS.map(([k, v], i) => {
              const s = mola(f, 288 + i * 12);
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', height: 78, borderTop: `1.5px solid ${C.linha}`, marginTop: i ? 0 : 22, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 40}px)` }}>
                  <span style={{ fontFamily: M, fontSize: 24, color: C.fg2, width: 170 }}>{k}</span>
                  <span style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink, letterSpacing: '-0.02em', flex: 1 }}>{v}</span>
                  {i === 3 && <div style={{ width: 84, height: 54, borderRadius: 12, background: `linear-gradient(140deg, ${CRI[0][2][0]}, ${CRI[0][2][1]})` }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* os criativos e os fios */}
      <div style={{ position: 'absolute', inset: 0, opacity: saida(f, 486, 10) * (1 - recua * 0.6), transform: `scale(${1 - recua * 0.06})`, filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined }}>
        {f >= 90 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
            {CRI.map((_, i) => {
              const { x, y } = cxy(i); const tx = x + GW / 2, ty = y;
              const d = `M 540 ${LEAD.y + LEAD.h - 20} C 540 ${LEAD.y + LEAD.h + 60}, ${tx} ${ty - 60}, ${tx} ${ty}`;
              const duvida = f < 344;
              if (!duvida && i !== CERTO) return null;
              return <path key={i} d={d} fill="none" stroke={duvida ? C.alerta : C.vivo} strokeOpacity={duvida ? 0.25 + 0.25 * Math.abs(Math.sin(f / 6 + i)) : 1} strokeWidth={duvida ? 4 : 8} strokeDasharray={duvida ? '6 14' : undefined} strokeLinecap="round"
                pathLength={duvida ? undefined : 1} strokeDashoffset={duvida ? 0 : 1 - lerp(f, 334, 348, 0, 1)} {...(duvida ? {} : { strokeDasharray: 1 })} />;
            })}
          </svg>
        )}
        {CRI.map((_, i) => <Criativo key={i} i={i} />)}
      </div>

      {/* ato 4 */}
      {f >= 404 && (
        <>
          <div style={{ position: 'absolute', top: 640, left: 60, right: 60, zIndex: 30 }}>
            <Titulo t={'Agora você sabe\n*onde investir.*'} ini={408} fim={486} tam={100} linha={1.12} />
          </div>
          <div style={{ position: 'absolute', top: 920, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 26, color: C.fg3, zIndex: 30, opacity: Math.min(lerp(f, 420, 432, 0, 1), saida(f, 486, 8)) }}>anúncios e lead fictícios · exemplo ilustrativo</div>
        </>
      )}

      <Narrada id="S5" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Cada paciente\n*com a origem na ficha.*'} /></div>}
    </AbsoluteFill>
  );
};
