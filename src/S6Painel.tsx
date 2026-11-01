// S6 (claro) — "Segunda, oito da manhã" (Dashboard): "quantos a IA agendou essa semana?". Os números estão soltos, como peças
// com "?". O ponto cai, as peças voam e se encaixam num painel só; os contadores sobem e o gráfico da semana cresce.
// Metáfora: quebra-cabeça que se encaixa.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Fecho, Narrada, NumGrande, Icone, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_S6 = 600;
// [ícone, rótulo, valor, casas, sufixo, solta x, y, rot]
const PECAS: [string, string, number, number, string, number, number, number][] = [
  ['chat', 'conversas', 184, 0, '', 110, 640, -9],
  ['agenda', 'agendados', 37, 0, '', 590, 560, 7],
  ['seta', 'conversão', 20.1, 1, '%', 150, 1060, 6],
  ['fone', 'ligações', 52, 0, '', 600, 1130, -8],
];
const PX = 60, PY = 400, TW = 450, TH = 280, TG = 20;
const tx = (i: number) => PX + 30 + (i % 2) * (TW + TG);
const ty = (i: number) => PY + 130 + Math.floor(i / 2) * (TH + TG);
const DIAS = [4, 6, 5, 8, 7, 4, 3];
const encaixa = (i: number) => 222 + i * 7;

const Peca: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [ic, rot, v, casas, suf, sx, sy, sr] = PECAS[i];
  if (f < 74 + i * 7) return null;
  const ent = mola(f, 74 + i * 7, { damping: 12, stiffness: 120, mass: 0.8 });
  const m = lerp(f, encaixa(i), encaixa(i) + 26, 0, 1, Easing.bezier(0.6, 0, 0.2, 1));
  const flut = (1 - m) * Math.sin((f + i * 30) / 14) * 14;
  const x = sx + (tx(i) - sx) * m, y = sy + (ty(i) - sy) * m + flut;
  const r = sr * (1 - m) + Math.sin((f + i * 20) / 18) * 2 * (1 - m);
  const w = 380 + (TW - 380) * m, h = 210 + (TH - 210) * m;
  const pronto = f >= encaixa(i) + 22;
  const o = Math.min(1, ent * 2) * saida(f, 486, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 32, background: C.papel, border: `1.5px solid ${pronto ? 'rgba(21,167,99,.35)' : C.linha}`, padding: '26px 30px',
      boxShadow: m < 1 ? '0 40px 70px -30px rgba(11,20,17,.4)' : '0 6px 20px -14px rgba(11,20,17,.3)', transform: `rotate(${r}deg) scale(${0.7 + 0.3 * ent})`, opacity: o, zIndex: 20 + (m > 0 && m < 1 ? 10 : 0) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 58, height: 58, borderRadius: 18, background: C.menta, display: 'grid', placeItems: 'center' }}><Icone n={ic} tam={32} cor={C.verde} traco={2.2} /></div>
        <span style={{ fontFamily: G, fontWeight: 600, fontSize: 34, color: C.fg, letterSpacing: '-0.02em' }}>{rot}</span>
      </div>
      <div style={{ marginTop: 22 }}>
        {pronto ? <NumGrande de={0} ate={v} ini={encaixa(i) + 22} dur={36} tam={110} casas={casas} pos={suf} cor={i === 1 ? C.verde : C.ink} />
          : <div style={{ fontFamily: G, fontWeight: 600, fontSize: 110, color: C.alerta, lineHeight: 1, letterSpacing: '-0.05em', opacity: 0.85 }}>?</div>}
      </div>
    </div>
  );
};

export const S6: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const pDot = mola(f, 210, { damping: 11, stiffness: 140, mass: 0.7 });
  const painel = mola(f, 214, { damping: 18, stiffness: 120, mass: 0.9 });
  const recua = lerp(f, 400, 424, 0, 1);
  const zoom = chaves(f, [[0, 1.06], [40, 1]]);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 500], [210, 1000], [240, 900]])} brilho={chaves(f, [[0, 0.4], [206, 0.3], [222, 1]])} />
      <Fantasma t="NÚMEROS" ini={60} fim={486} y={1460} tam={330} vel={1.3} />

      {/* ato 1: segunda, 8h */}
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${zoom})`, opacity: saida(f, 84, 10) }}>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 170, letterSpacing: '-0.05em', color: C.ink, lineHeight: 1 }}>08:00</div>
        <div style={{ fontFamily: M, fontSize: 30, color: C.fg2, marginTop: 10 }}>segunda-feira</div>
      </div>
      <div style={{ position: 'absolute', top: 640, left: 60, right: 60 }}>
        <Titulo t={'Quantos a IA agendou\n*essa semana?*'} ini={4} fim={84} tam={84} linha={1.12} />
      </div>

      {/* ato 2: espalhados */}
      <div style={{ position: 'absolute', top: 300, left: 60, right: 60, textAlign: 'center', opacity: Math.min(lerp(f, 90, 102, 0, 1), saida(f, 212, 10)) }}>
        <Titulo t={'Cada número\nnum *lugar diferente.*'} ini={92} fim={212} tam={76} linha={1.12} />
      </div>

      {/* ato 3: o painel */}
      {f >= 210 && (
        <div style={{ position: 'absolute', left: PX, top: PY, width: 960, height: 1010, borderRadius: 40, background: C.papel, border: `1.5px solid ${C.linha}`,
          boxShadow: '0 1px 2px rgba(11,20,17,.05), 0 24px 50px -24px rgba(11,20,17,.28), 0 70px 120px -60px rgba(21,167,99,.32)',
          opacity: Math.min(1, painel * 2) * saida(f, 486, 10) * (1 - recua * 0.6), transform: `scale(${0.94 + 0.06 * painel - recua * 0.06})`, filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '34px 36px 0' }}>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 44, color: C.ink, letterSpacing: '-0.03em', flex: 1 }}>Painel</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 99, background: C.menta, fontFamily: M, fontSize: 24, color: C.prof }}><Icone n="agenda" tam={26} cor={C.prof} />últimos 7 dias</div>
          </div>
          {/* gráfico da semana */}
          <div style={{ position: 'absolute', left: 36, right: 36, bottom: 40, height: 230 }}>
            <div style={{ fontFamily: M, fontSize: 22, color: C.fg2, marginBottom: 14 }}>agendados por dia</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, height: 150 }}>
              {DIAS.map((d, k) => {
                const g = lerp(f, 300 + k * 6, 330 + k * 6, 0, 1, Easing.bezier(0.2, 0.9, 0.25, 1));
                return (
                  <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: '100%', height: (d / 8) * 120 * g, borderRadius: 12, background: k === 3 ? C.verde : 'rgba(21,167,99,.35)' }} />
                    <span style={{ fontFamily: M, fontSize: 20, color: C.fg3 }}>{'stqqssd'[k]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {f >= 206 && f < 230 && <Ponto x={540} y={chaves(f, [[206, 120], [222, 860]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - recua * 0.6, filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined, transform: `scale(${1 - recua * 0.06})`, transformOrigin: '540px 900px', zIndex: 20 }}>
        {PECAS.map((_, i) => <Peca key={i} i={i} />)}
      </div>
      {f >= 250 && <div style={{ position: 'absolute', top: 1430, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg3, opacity: Math.min(lerp(f, 250, 262, 0, 1), saida(f, 404, 8)), zIndex: 40 }}>exemplo ilustrativo</div>}

      {f >= 226 && f < 412 && <div style={{ position: 'absolute', top: 200, left: 60, right: 60 }}><Titulo t={'Tudo num *painel só.*'} ini={230} fim={404} tam={84} linha={1.12} /></div>}
      {/* ato 4 */}
      {f >= 404 && (
        <div style={{ position: 'absolute', top: 680, left: 60, right: 60, zIndex: 40 }}>
          <Titulo t={'Você decide\nolhando o *número.*'} ini={410} fim={486} tam={104} linha={1.12} />
        </div>
      )}

      <Narrada id="S6" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Menos achismo.\n*Mais decisão.*'} /></div>}
    </AbsoluteFill>
  );
};
