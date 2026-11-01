// S4 (claro) — "O quadro da recepção" (Pipeline): o caderno rabiscado ("quem marcou? quem veio?") vira um quadro de colunas.
// Quem chega entra em Novo; agendou com a Thata, o card anda sozinho para Agendamento; dali em diante quem move é a recepção.
// Metáfora: rabisco que vira trilho. Regra real da plataforma: a automação só move até Agendamento.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Fecho, Narrada, Toque, lerp, saida, mola, molaViva, chaves, usaTema, io } from './kit';

export const DUR_S4 = 600;
const COLS: [string, boolean][] = [['Novo', true], ['Agendamento', true], ['Compareceu', false], ['Ganho', false]];
const BX = 40, CW = 236, GAP = 12, BY = 520, SLOT0 = 150, SDY = 124;
const cx = (c: number) => BX + c * (CW + GAP);
const sy = (s: number) => BY + SLOT0 + s * SDY;
// [quadro, coluna, posição] — o card anda entre as chaves
type K = [number, number, number];
const CARDS: { n: string; ks: K[]; ini?: number; tag?: [number, number] }[] = [
  { n: 'Diego S.', ks: [[226, 0, 0]], ini: 226 },
  { n: 'Ana P.', ks: [[222, 0, 0], [236, 0, 1], [276, 0, 1], [300, 1, 2], [392, 1, 2], [404, 1, 1]], tag: [262, 300] },
  { n: 'Bruno L.', ks: [[222, 0, 1], [236, 0, 2], [296, 0, 2], [310, 0, 1], [332, 0, 1], [356, 1, 3], [392, 1, 3], [404, 1, 2]], tag: [318, 356] },
  { n: 'Elisa R.', ks: [[222, 0, 2], [236, 0, 3], [296, 0, 3], [310, 0, 2], [350, 0, 2], [364, 0, 1]] },
  { n: 'Carla M.', ks: [[366, 1, 0], [392, 2, 1]] },
  { n: 'Fábio T.', ks: [[392, 1, 1], [404, 1, 0]] },
  { n: 'Gabi N.', ks: [[0, 2, 0]] },
  { n: 'Hugo A.', ks: [[0, 3, 0]] },
];
const pos = (f: number, ks: K[]) => {
  if (ks.length === 1) return { x: cx(ks[0][1]), y: sy(ks[0][2]) };
  const fs = ks.map((k) => k[0]);
  const o = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: io };
  return { x: interpolate(f, fs, ks.map((k) => cx(k[1])), o), y: interpolate(f, fs, ks.map((k) => sy(k[2])), o) };
};

const Card: React.FC<{ k: number }> = ({ k }) => {
  const f = useCurrentFrame();
  const c = CARDS[k];
  const ent = c.ini !== undefined ? molaViva(f, c.ini) : mola(f, 210 + k * 3, { damping: 18, stiffness: 160, mass: 0.6 });
  if (c.ini !== undefined && f < c.ini) return null;
  const p = pos(f, c.ks);
  const dragging = k === 4 && f >= 360 && f < 394;
  const p1 = pos(f - 1, c.ks); const anda = Math.abs(p1.x - p.x) > 0.5;
  const tag = c.tag && f >= c.tag[0] && f < c.tag[1] + 30;
  const verde = tag || (c.tag && f >= c.tag[1]);
  const col = Math.round((p.x - BX) / (CW + GAP));
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, width: CW, height: SDY - 14, borderRadius: 22, background: C.papel, padding: '16px 18px',
      border: `1.5px solid ${verde ? 'rgba(21,167,99,.5)' : C.linha}`, boxShadow: dragging ? '0 40px 60px -24px rgba(11,20,17,.45)' : '0 10px 24px -16px rgba(11,20,17,.3)',
      opacity: Math.min(1, ent * 2), transform: `scale(${(c.ini !== undefined ? 0.6 + 0.4 * ent : 1) * (dragging ? 1.06 : 1)}) rotate(${dragging ? -3 : 0}deg)`, zIndex: dragging ? 40 : anda ? 30 : 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 99, background: verde || col >= 1 ? C.menta : C.bolhaIn, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 22, color: C.verde }}>{c.n[0]}</div>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: '-0.02em' }}>{c.n}</div>
      </div>
      <div style={{ fontFamily: M, fontSize: 19, marginTop: 10, color: tag ? C.verde : C.fg2, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {tag ? '● Thata agendou' : k === 0 ? 'nova mensagem' : col === 0 ? 'em conversa' : col === 1 ? 'consulta marcada' : col === 2 ? 'veio na consulta' : 'fechou tratamento'}
      </div>
    </div>
  );
};

const Rabisco: React.FC = () => {
  const f = useCurrentFrame();
  const P = ['M 220 760 C 520 640, 700 980, 880 860', 'M 860 720 C 600 900, 420 1120, 260 1010', 'M 240 1180 C 560 1080, 760 1290, 900 1150', 'M 300 900 L 820 1300'];
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
      {P.map((d, i) => <path key={i} d={d} fill="none" stroke={C.alerta} strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lerp(f, 86 + i * 24, 110 + i * 24, 0, 1)} />)}
    </svg>
  );
};

export const S4: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const vira = lerp(f, 200, 222, 0, 1, Easing.bezier(0.7, 0, 0.3, 1));
  const zoom = chaves(f, [[210, 1.04], [240, 1], [404, 1], [440, 0.92]]);
  const pDot = mola(f, 210, { damping: 11, stiffness: 140, mass: 0.7 });
  const cardX = (c: number) => cx(c) + CW / 2;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [210, 400], [300, 900]])} brilho={chaves(f, [[0, 0.3], [206, 0.3], [222, 1]])} />
      <Fantasma t="CADERNO" ini={0} fim={210} y={1440} tam={330} />
      <Fantasma t="ETAPA" ini={216} fim={486} y={1440} tam={360} vel={1.4} />

      {/* ato 1–2: o caderno */}
      {f < 224 && (
        <>
          <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}>
            <Titulo t={'Quem marcou?\nQuem veio?\n*Quem sumiu?*'} ini={2} fim={206} tam={88} passo={5} linha={1.1} />
          </div>
          <div style={{ position: 'absolute', left: 120, top: 600, width: 840, height: 760, borderRadius: 36, background: '#FFFDF6', border: `1.5px solid ${C.linha}`, padding: '50px 60px',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 79px, rgba(21,120,200,.14) 79px 81px)', backgroundPosition: '0 30px',
            transform: `rotate(${-2 + Math.sin(f / 3) * (f > 90 ? 0.4 : 0)}deg) scale(${(0.94 + 0.06 * mola(f, 0)) * (1 - vira * 0.4)})`, opacity: 1 - vira, boxShadow: '0 40px 80px -40px rgba(11,20,17,.35)' }}>
            {['Ana — marcou?', 'Bruno ligou 2x, retornar', 'Carla ??', 'Diego — veio quinta?', 'Elisa remarcar (qual dia?)', 'Fábio orçamento'].map((t, i) => (
              <div key={i} style={{ height: 80, display: 'flex', alignItems: 'flex-end', paddingBottom: 12, fontFamily: G, fontStyle: 'italic', fontWeight: 500, fontSize: 40, color: '#2A3A55', opacity: lerp(f, 6 + i * 6, 14 + i * 6, 0, 1), transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)` }}>{t}</div>
            ))}
          </div>
          <div style={{ opacity: 1 - vira }}><Rabisco /></div>
          <div style={{ position: 'absolute', top: 1385, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg3, opacity: Math.min(lerp(f, 90, 100, 0, 1), 1 - vira) }}>anotações soltas · exemplo ilustrativo</div>
        </>
      )}
      {f >= 200 && f < 226 && <Ponto x={540} y={chaves(f, [[200, 1000], [214, 980]])} r={26 * pDot + vira * 30} />}

      {/* ato 3–4: o quadro */}
      {f >= 206 && (
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 900px', opacity: Math.min(lerp(f, 206, 222, 0, 1), saida(f, 486, 10)) }}>
          {COLS.map(([n, auto], c) => (
            <div key={c} style={{ position: 'absolute', left: cx(c) - 6, top: BY, width: CW + 12, height: 790, borderRadius: 30, background: escuroCol(c), border: `1.5px solid ${C.linha}` }}>
              <div style={{ padding: '22px 14px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: G, fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: '-0.03em' }}>{n}</div>
                <div style={{ display: 'inline-block', marginTop: 10, padding: '6px 14px', borderRadius: 99, fontFamily: M, fontSize: 19, background: auto ? C.menta : 'rgba(11,20,17,.06)', color: auto ? C.prof : C.fg2 }}>{auto ? 'automático' : 'a clínica decide'}</div>
              </div>
            </div>
          ))}
          {/* seta automática entre Novo e Agendamento */}
          <div style={{ position: 'absolute', left: cx(1) - 27, top: BY + 104, width: 42, height: 42, borderRadius: 99, background: C.verde, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: G, fontWeight: 700, fontSize: 24, zIndex: 20, transform: `scale(${mola(f, 240)})` }}>→</div>
          {CARDS.map((_, k) => <Card key={k} k={k} />)}
          <Toque ks={[{ f: 354, x: cardX(1) + 60, y: sy(0) + 140 }, { f: 362, x: cardX(1), y: sy(0) + 50 }, { f: 366, x: cardX(1), y: sy(0) + 50 }, { f: 392, x: cardX(2), y: sy(1) + 50 }]} toques={[362]} ini={352} fim={396} />
          {f >= 360 && f < 400 && <div style={{ position: 'absolute', left: chaves(f, [[366, cardX(1) - 70], [392, cardX(2) - 70]]), top: chaves(f, [[366, sy(0) - 40], [392, sy(1) - 40]]), zIndex: 45, fontFamily: M, fontSize: 22, color: '#fff', background: C.ink, padding: '6px 14px', borderRadius: 99, opacity: saida(f, 400, 8) }}>recepção</div>}
        </div>
      )}

      {f >= 222 && f < 412 && <div style={{ position: 'absolute', top: 300, left: 60, right: 60, opacity: Math.min(lerp(f, 224, 236, 0, 1), saida(f, 412, 8)) }}>
        <Titulo t={'O quadro da *recepção*'} ini={226} tam={72} linha={1.12} />
        <div style={{ textAlign: 'center', fontFamily: M, fontSize: 26, color: C.fg2, marginTop: 14 }}>pipeline da Thata</div>
      </div>}
      {/* ato 4 */}
      {f >= 404 && (
        <div style={{ position: 'absolute', top: 170, left: 60, right: 60, zIndex: 30 }}>
          <Titulo t={'Cada paciente\n*no seu lugar.*'} ini={410} fim={486} tam={96} linha={1.12} />
        </div>
      )}
      {f >= 404 && <div style={{ position: 'absolute', top: 1340, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg3, zIndex: 30, opacity: Math.min(lerp(f, 420, 432, 0, 1), saida(f, 486, 8)) }}>pacientes fictícios · exemplo ilustrativo</div>}

      <Narrada id="S4" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Você bate o olho\n*e sabe tudo.*'} /></div>}
    </AbsoluteFill>
  );
};
const escuroCol = (c: number) => (c < 2 ? 'rgba(21,167,99,.05)' : 'rgba(11,20,17,.03)');
