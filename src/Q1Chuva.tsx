// Q1 (escuro) — "Dia de chuva": às 7h chove forte e as desmarcações caem como gotas na agenda do dia.
// A Thata responde cada uma e remarca; cada linha vermelha vira (flip) remarcada, e a semana segue cheia.
// Padrões de estúdio: chuva em camadas com profundidade, objetos que "caem" com impacto, flip 3D, zoom-out de revelação, legenda cinética.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Legenda, Fantasma, NumGrande, Titulo, Mono, Ponto, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_Q1 = 600;
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

// pacientes fictícios
const LINHAS = [
  ['08:00', 'Ana P.', 'Limpeza'], ['08:40', 'Bruno L.', 'Avaliação'], ['09:20', 'Carla M.', 'Retorno'], ['10:00', 'Diego S.', 'Restauração'],
  ['10:40', 'Elisa R.', 'Clareamento'], ['11:20', 'Fábio T.', 'Avaliação'], ['14:00', 'Gabi N.', 'Limpeza'], ['14:40', 'Hugo A.', 'Retorno'],
];
const DESMARCA = [1, 2, 4, 5, 6, 7];
const NOVO = ['qui 10h', 'sex 9h', 'qui 15h', 'sex 14h', 'seg 8h', 'qua 16h'];
const MSGS = ['Vou ter que desmarcar', 'Tá alagado aqui', 'Não consigo sair de casa', 'Dá pra remarcar?', 'Ônibus parado 😩', 'Melhor outro dia'];
const Y0 = 650, DY = 96, X0 = 120, W = 840;
const cai = (j: number) => 96 + j * 20;    // a mensagem toca a linha
const vira = (j: number) => 270 + j * 18;  // a Thata remarca

// chuva: três camadas (perto = mais grossa, rápida e desfocada)
const Chuva: React.FC<{ forca: number }> = ({ forca }) => {
  const f = useCurrentFrame();
  if (forca <= 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', transform: 'rotate(12deg) scale(1.25)' }}>
      {Array.from({ length: 90 }, (_, i) => {
        const camada = i % 3; // 0 longe, 2 perto
        const vel = 38 + camada * 22 + rnd(i, 1) * 10;
        const comp = 60 + camada * 70;
        const x = rnd(i, 2) * 1300 - 110;
        const y = ((f * vel + rnd(i, 3) * 2400) % 2400) - 300;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 1.5 + camada * 1.2, height: comp, borderRadius: 4, background: `linear-gradient(transparent, rgba(160,240,200,${(0.10 + camada * 0.09) * forca}))`, filter: camada === 2 ? 'blur(1.5px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

const Linha: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [h, nome, proc] = LINHAS[i];
  const j = DESMARCA.indexOf(i);
  const ent = mola(f, 64 + i * 3, { damping: 18, stiffness: 160, mass: 0.6 });
  const vermelho = j >= 0 && f >= cai(j);
  const rot = j >= 0 ? lerp(f, vira(j), vira(j) + 16, 0, 180, Easing.bezier(0.5, 0, 0.3, 1)) : 0;
  const tremor = j >= 0 && f >= cai(j) && f < cai(j) + 8 ? Math.sin((f - cai(j)) * 2.4) * (8 - (f - cai(j))) : 0;
  const face = (verso: boolean): React.CSSProperties => ({
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: verso ? 'rotateX(180deg)' : undefined, borderRadius: 18,
    display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', fontFamily: G,
  });
  return (
    <div style={{ position: 'absolute', left: X0, top: Y0 + 90 + i * DY, width: W, height: DY - 12, perspective: 1200, opacity: Math.min(1, ent * 2), transform: `translate(${tremor}px, ${(1 - ent) * 40}px)` }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateX(${rot}deg)` }}>
        <div style={{ ...face(false), background: vermelho ? C.alertaSuave : 'rgba(255,255,255,.04)', border: `1.5px solid ${vermelho ? 'rgba(255,107,107,.5)' : C.linha}` }}>
          <span style={{ fontFamily: M, fontSize: 28, color: vermelho ? C.alerta : C.fg2, width: 92 }}>{h}</span>
          <span style={{ fontWeight: 600, fontSize: 36, color: vermelho ? C.fg3 : C.ink, letterSpacing: '-0.02em', textDecoration: vermelho ? 'line-through' : undefined, flex: 1 }}>{nome} <span style={{ fontWeight: 500, color: C.fg3, fontSize: 30 }}>· {proc}</span></span>
          {vermelho && <span style={{ fontFamily: M, fontSize: 24, color: C.alerta, transform: `scale(${molaViva(f, cai(j))})` }}>desmarcou</span>}
        </div>
        <div style={{ ...face(true), background: 'rgba(27,195,113,.14)', border: `1.5px solid rgba(95,227,161,.5)` }}>
          <span style={{ fontFamily: M, fontSize: 28, color: C.vivo, width: 92 }}>{h}</span>
          <span style={{ fontWeight: 600, fontSize: 36, color: C.ink, letterSpacing: '-0.02em', flex: 1 }}>{nome} <span style={{ fontWeight: 500, color: C.fg2, fontSize: 30 }}>→ {j >= 0 ? NOVO[j] : ''}</span></span>
          <span style={{ fontFamily: M, fontSize: 24, color: C.vivo }}>remarcado ✓</span>
        </div>
      </div>
    </div>
  );
};

// mensagem que cai como gota e bate na linha
const Gota: React.FC<{ j: number }> = ({ j }) => {
  const f = useCurrentFrame();
  const t1 = cai(j), t0 = t1 - 16;
  if (f < t0 || f > t1 + 14) return null;
  const i = DESMARCA[j];
  const p = interpolate(f, [t0, t1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.6, 0, 1, 0.8) });
  const yAlvo = Y0 + 90 + i * DY + 6;
  const x = 520 + (rnd(j, 5) - 0.5) * 260;
  const y = interpolate(p, [0, 1], [-140, yAlvo - 60]);
  const estica = 1 + (1 - Math.abs(p - 0.5) * 2) * 0.25;
  const respingo = lerp(f, t1, t1 + 14, 0, 1);
  return (
    <>
      {f < t1 + 2 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(-50%) scaleY(${estica})`, zIndex: 40, padding: '14px 26px', borderRadius: 30, borderBottomLeftRadius: 8, background: '#E9F1EC', color: '#0B1411', fontFamily: G, fontWeight: 600, fontSize: 32, whiteSpace: 'nowrap', boxShadow: '0 20px 40px -14px rgba(0,0,0,.6)' }}>{MSGS[j]}</div>
      )}
      {f >= t1 && <div style={{ position: 'absolute', left: x - 180 * respingo, top: yAlvo - 10 - 30 * respingo, width: 360 * respingo, height: 60 * respingo + 20, borderRadius: '50%', border: `3px solid ${C.alerta}`, opacity: 1 - respingo, zIndex: 41 }} />}
    </>
  );
};

// semana: aparece no zoom-out, com os remarcados caindo nos dias
const Semana: React.FC = () => {
  const f = useCurrentFrame();
  const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex'];
  const cheios = (d: number, h: number) => rnd(d * 9 + h, 7) < 0.55;
  const alvo: Record<string, number> = { '3-1': 0, '4-0': 1, '3-5': 2, '4-4': 3, '0-0': 4, '2-6': 5 };
  return (
    <div style={{ position: 'absolute', left: 140, top: 700, width: 800, opacity: Math.min(lerp(f, 404, 418, 0, 1), saida(f, 488, 10)) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {DIAS.map((d, di) => (
          <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: M, fontSize: 26, color: di === 1 ? C.alerta : C.fg2, textAlign: 'center', marginBottom: 6 }}>{d}{di === 1 ? ' · chuva' : ''}</div>
            {Array.from({ length: 8 }, (_, h) => {
              const k = alvo[`${di}-${h}`];
              const novo = k !== undefined;
              const s = novo ? molaViva(f, 424 + k * 7) : 1;
              const base = di === 1 ? (LINHAS[h] && !DESMARCA.includes(h)) : cheios(di, h);
              return (
                <div key={h} style={{ height: 62, borderRadius: 12, background: novo && f >= 424 + k * 7 ? C.verde : base ? 'rgba(238,244,241,.16)' : 'rgba(255,255,255,.04)', border: `1.5px solid ${C.linha}`, transform: novo ? `scale(${f >= 424 + k * 7 ? s : 1})` : undefined, boxShadow: novo && f >= 424 + k * 7 ? '0 0 30px rgba(27,195,113,.55)' : undefined }} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Q1: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const forca = chaves(f, [[0, 0.6], [40, 1], [250, 1], [300, 0.7], [420, 0.25], [480, 0]]);
  const flash = (t: number) => Math.max(0, 1 - Math.abs(f - t) / 3) * 0.35;
  const relampago = flash(52) + flash(57) * 0.6;
  const zoom = chaves(f, [[60, 1.06], [250, 1], [262, 1.04], [390, 1], [404, 0.88], [488, 0.88]]);
  const agendaOn = f >= 60 && f < 404;
  const remarcados = DESMARCA.filter((_, j) => f >= vira(j) + 8).length;
  const desmarcadas = DESMARCA.filter((_, j) => f >= cai(j)).length;
  const pDot = mola(f, 244, { damping: 11, stiffness: 120, mass: 0.8 });
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 300], [250, 1100], [480, 900]])} brilho={chaves(f, [[0, 0.2], [240, 0.25], [270, 1]])} />
      <Fantasma t="CHUVA" ini={0} fim={250} y={1500} tam={380} />
      <Fantasma t="REMARCADO" ini={262} fim={488} y={1500} tam={320} vel={1.6} />
      <Chuva forca={forca} />
      <AbsoluteFill style={{ background: '#DFF7EA', opacity: relampago, pointerEvents: 'none' }} />

      {/* abertura: hora e "Choveu." */}
      <div style={{ position: 'absolute', top: 780, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: saida(f, 66, 8) }}>
        <Mono t="terça · 07:12" ini={4} tam={36} />
        <Titulo t={'Choveu *forte.*'} ini={14} tam={150} />
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 1000px' }}>
        {/* agenda de hoje */}
        {agendaOn && (
          <>
            <div style={{ position: 'absolute', left: X0, top: Y0, width: W, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: Math.min(lerp(f, 60, 72, 0, 1), saida(f, 404, 10)) }}>
              <span style={{ fontFamily: G, fontWeight: 600, fontSize: 46, letterSpacing: '-0.035em', color: C.ink }}>Agenda de hoje</span>
              <span style={{ fontFamily: M, fontSize: 28, color: remarcados ? C.vivo : desmarcadas ? C.alerta : C.fg2 }}>
                {remarcados ? `${remarcados}/6 remarcados` : desmarcadas ? `${desmarcadas} desmarcaram` : '8 pacientes'}
              </span>
            </div>
            <div style={{ opacity: saida(f, 404, 12) }}>{LINHAS.map((_, i) => <Linha key={i} i={i} />)}</div>
            {DESMARCA.map((_, j) => <Gota key={j} j={j} />)}
          </>
        )}
        <Semana />
      </div>

      {/* contador do caos */}
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(lerp(f, 92, 104, 0, 1), saida(f, 244, 8)) }}>
        <NumGrande de={0} ate={6} ini={96} dur={110} tam={210} cor={C.alerta} />
        <div style={{ fontFamily: M, fontSize: 30, color: C.fg2, marginTop: 4 }}>desmarcações antes das 8h</div>
      </div>

      {/* a Thata entra: o ponto cai, onda verde */}
      {f >= 244 && f < 404 && (
        <>
          <Ponto x={540} y={chaves(f, [[244, 120], [262, 420]], Easing.bezier(0.5, 0, 0.9, 0.5))} r={30 * pDot} />
          {f >= 262 && <div style={{ position: 'absolute', left: 540 - lerp(f, 262, 300, 0, 900), top: 420 - lerp(f, 262, 300, 0, 900), width: lerp(f, 262, 300, 0, 1800), height: lerp(f, 262, 300, 0, 1800), borderRadius: '50%', border: `4px solid ${C.vivo}`, opacity: lerp(f, 262, 300, 0.8, 0), pointerEvents: 'none' }} />}
          <div style={{ position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: saida(f, 400, 8) }}>
            <div style={{ fontFamily: M, fontSize: 28, color: C.vivo, opacity: lerp(f, 268, 280, 0, 1) }}>● Thata respondendo e remarcando</div>
          </div>
        </>
      )}

      {/* revelação: a semana */}
      <div style={{ position: 'absolute', top: 300, left: 60, right: 60 }}>
        <Titulo t={'A semana *segue cheia.*'} ini={410} fim={486} tam={84} />
      </div>
      <div style={{ position: 'absolute', top: 1520, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3, opacity: Math.min(lerp(f, 420, 430, 0, 1), saida(f, 486, 8)) }}>clínica e pacientes fictícios · exemplo ilustrativo</div>

      <Legenda frases={[
        [70, 244, 'e as mensagens caem uma atrás da outra'],
        [262, 404, 'A Thata responde cada paciente e remarca na hora'],
        [404, 486, 'ninguém se perde no meio da chuva'],
      ]} y={1640} />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Chove lá fora.\n*A agenda segue cheia.*'} /></div>}
    </AbsoluteFill>
  );
};
