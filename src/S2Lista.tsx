// S2 (claro) — "A lista parada" (Campanhas): uma planilha de pacientes parados. Mandar uma a uma não dá.
// O ponto aperta "disparar campanha", as linhas ficam verdes em cascata, as respostas chegam e a Thata conversa e agenda.
// Metáfora: a lista cinza que vira agenda.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Fecho, Narrada, NumGrande, Toque, Icone, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_S2 = 600;
const NOMES = ['Ana P.', 'Bruno L.', 'Carla M.', 'Diego S.', 'Elisa R.', 'Fábio T.', 'Gabi N.', 'Hugo A.', 'Íris C.', 'João V.'];
const VISITA = ['ago/2025', 'jul/2025', 'set/2025', 'jun/2025', 'ago/2025', 'mai/2025', 'out/2025', 'jul/2025', 'set/2025', 'jun/2025'];
const RESP: Record<number, [string, number]> = { 1: ['"quero sim!"', 292], 3: ['"tem sábado?"', 304], 4: ['"qual o valor?"', 318], 7: ['"pode ser à tarde"', 330], 8: ['"oi, tudo bem?"', 342] };
const AG: Record<number, [string, number]> = { 1: ['agendado · qui 10h', 352], 4: ['agendado · seg 15h', 372], 8: ['agendado · ter 9h', 390] };
const TY = 470, HDR = 80, RDY = 84;
const enviado = (i: number) => 238 + i * 5;

const Linha: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const ent = mola(f, 8 + i * 3, { damping: 18, stiffness: 160, mass: 0.6 });
  let st = 'sem contato', cor = C.fg3, fundo = 'transparent', t0 = 0;
  if (i === 0 && f >= 96 && f < enviado(0)) { st = f < 150 ? 'digitando…' : 'enviada à mão'; cor = C.ambar; t0 = 96; }
  if (f >= enviado(i)) { st = 'mensagem enviada'; cor = C.verde; t0 = enviado(i); }
  if (RESP[i] && f >= RESP[i][1]) { st = `respondeu ${RESP[i][0]}`; cor = C.ink; fundo = C.menta; t0 = RESP[i][1]; }
  if (AG[i] && f >= AG[i][1]) { st = AG[i][0]; cor = '#fff'; fundo = C.verde; t0 = AG[i][1]; }
  const s = t0 ? molaViva(f, t0) : 1;
  const ag = AG[i] && f >= AG[i][1];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: HDR + i * RDY, height: RDY, display: 'flex', alignItems: 'center', padding: '0 34px', gap: 20, borderTop: `1.5px solid ${C.linha}`,
      opacity: Math.min(1, ent * 2), transform: `translateY(${(1 - ent) * 30}px)`, background: ag ? 'rgba(27,195,113,.06)' : 'transparent' }}>
      <div style={{ width: 18, height: 18, borderRadius: 99, background: f >= enviado(i) ? C.verde : C.linha2, transform: `scale(${f >= enviado(i) ? 0.7 + 0.3 * molaViva(f, enviado(i)) : 1})` }} />
      <span style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink, letterSpacing: '-0.02em', width: 200 }}>{NOMES[i]}</span>
      <span style={{ fontFamily: M, fontSize: 24, color: C.fg2, width: 150 }}>{VISITA[i]}</span>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: M, fontSize: 24, color: cor, background: fundo, padding: fundo === 'transparent' ? 0 : '8px 16px', borderRadius: 99, transform: `scale(${0.85 + 0.15 * s})`, whiteSpace: 'nowrap' }}>{st}</span>
      </div>
    </div>
  );
};

const Tile: React.FC<{ x: number; ini: number; ate: number; rot: string; dur?: number }> = ({ x, ini, ate, rot, dur = 60 }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini - 6);
  return (
    <div style={{ position: 'absolute', left: x, top: 190, width: 290, textAlign: 'center', opacity: Math.min(1, s * 2) * saida(f, 404, 10), transform: `translateY(${(1 - s) * 30}px)` }}>
      <NumGrande de={0} ate={ate} ini={ini} dur={dur} tam={110} cor={rot === 'agendados' ? C.verde : C.ink} />
      <div style={{ fontFamily: M, fontSize: 26, color: C.fg2, marginTop: 10 }}>{rot}</div>
    </div>
  );
};

export const S2: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const recua = lerp(f, 400, 424, 0, 1);
  const pDot = mola(f, 214, { damping: 11, stiffness: 140, mass: 0.7 });
  const slots = [0, 2, 3, 6, 7, 9, 11, 12, 13, 16, 18];
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 300], [210, 1450], [250, 800]])} brilho={chaves(f, [[0, 0.35], [210, 0.3], [228, 1]])} />
      <Fantasma t="LISTA" ini={0} fim={220} y={1440} tam={360} />
      <Fantasma t="CAMPANHA" ini={226} fim={486} y={1440} tam={320} vel={1.5} />

      {/* ato 1–2: o tamanho da lista e o jeito manual */}
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: saida(f, 214, 10) }}>
        {f < 90
          ? <NumGrande de={0} ate={300} ini={0} dur={40} tam={180} />
          : <div style={{ fontFamily: G, fontWeight: 600, fontSize: 120, letterSpacing: '-0.05em', color: C.alerta, lineHeight: 1 }}>{`${Math.min(3, 1 + Math.floor((f - 90) / 40))} de 300`}</div>}
        <div style={{ fontFamily: M, fontSize: 28, color: f < 90 ? C.fg2 : C.alerta, marginTop: 14 }}>{f < 90 ? 'pacientes parados há um ano · exemplo ilustrativo' : 'uma a uma, à mão · umas 5 horas (estimativa ilustrativa)'}</div>
      </div>

      {/* ato 3: contadores da campanha */}
      {f >= 236 && (
        <>
          <Tile x={60} ini={240} ate={300} rot="enviadas" dur={50} />
          <Tile x={395} ini={290} ate={42} rot="responderam" />
          <Tile x={730} ini={350} ate={11} rot="agendados" dur={50} />
          <div style={{ position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3, opacity: saida(f, 404, 10) }}>exemplo ilustrativo</div>
        </>
      )}

      {/* a planilha */}
      <div style={{ position: 'absolute', left: 60, width: 960, top: TY, height: HDR + NOMES.length * RDY, borderRadius: 36, background: C.papel, border: `1.5px solid ${C.linha}`, overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(11,20,17,.05), 0 24px 50px -24px rgba(11,20,17,.28), 0 70px 120px -60px rgba(21,167,99,.28)',
        transform: `scale(${chaves(f, [[0, 1.04], [40, 1]]) - recua * 0.08}) rotate(${f > 100 && f < 206 ? Math.sin(f / 2.2) * 0.25 : 0}deg)`, filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined, opacity: (1 - recua * 0.6) * saida(f, 486, 10), transformOrigin: '50% 40%' }}>
        <div style={{ height: HDR, display: 'flex', alignItems: 'center', padding: '0 34px', gap: 20, fontFamily: M, fontSize: 24, color: C.fg2 }}>
          <Icone n="arquivo" tam={30} cor={C.fg2} /><span style={{ width: 178 }}>paciente</span><span style={{ width: 150 }}>visita</span><span style={{ flex: 1, textAlign: 'right' }}>status</span>
        </div>
        {NOMES.map((_, i) => <Linha key={i} i={i} />)}
      </div>

      {/* o botão que a Thata aperta */}
      {f >= 206 && f < 270 && (
        <div style={{ position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(lerp(f, 206, 214, 0, 1), saida(f, 270, 10)) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 48px', borderRadius: 999, background: f >= 228 ? C.verde : C.ink, color: '#fff', fontFamily: G, fontWeight: 600, fontSize: 40, letterSpacing: '-0.02em', boxShadow: '0 24px 50px -20px rgba(21,167,99,.6)', transform: `scale(${f >= 228 && f < 240 ? 0.94 : 1})` }}>
            <Icone n="seta" tam={40} cor="#fff" traco={2.4} />disparar campanha
          </div>
        </div>
      )}
      {f >= 214 && f < 232 && <Ponto x={540} y={chaves(f, [[214, 900], [228, 1490]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}
      <Toque ks={[{ f: 218, x: 700, y: 1560 }, { f: 228, x: 600, y: 1490 }]} toques={[228]} ini={216} fim={240} />

      {/* ato 4: a agenda da semana */}
      {f >= 404 && (
        <>
          <div style={{ position: 'absolute', top: 160, left: 60, right: 60, zIndex: 30 }}>
            <Titulo t={'A lista virou\n*agenda.*'} ini={408} fim={486} tam={110} linha={1.12} />
          </div>
          <div style={{ position: 'absolute', left: 140, width: 800, top: 620, zIndex: 30, opacity: saida(f, 486, 10), transform: `scale(${0.9 + 0.1 * mola(f, 410)})` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, padding: 34, borderRadius: 36, background: C.papel, border: `1.5px solid ${C.linha}`, boxShadow: '0 40px 80px -40px rgba(21,167,99,.5)' }}>
              {['seg', 'ter', 'qua', 'qui', 'sex'].map((d) => <div key={d} style={{ fontFamily: M, fontSize: 24, color: C.fg2, textAlign: 'center' }}>{d}</div>)}
              {Array.from({ length: 20 }, (_, k) => {
                const n = slots.indexOf(k);
                const s = n >= 0 ? molaViva(f, 420 + n * 4) : 0;
                return <div key={k} style={{ height: 90, borderRadius: 18, background: n >= 0 && f >= 420 + n * 4 ? C.verde : C.bolhaIn, transform: `scale(${n >= 0 && f >= 420 + n * 4 ? 0.8 + 0.2 * s : 1})` }} />;
              })}
            </div>
            <div style={{ textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg3, marginTop: 24 }}>11 agendados pela campanha · exemplo ilustrativo</div>
          </div>
        </>
      )}

      <Narrada id="S2" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Lista parada\n*vira conversa.*'} /></div>}
    </AbsoluteFill>
  );
};
