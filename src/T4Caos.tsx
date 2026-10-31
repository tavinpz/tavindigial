// T4 — "Segunda, 8h01": chuva de mensagens e ligações; o ponto cai e organiza tudo; a câmera recua e é o painel da clínica.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Camera, Icone, Fecho, Num, Marca, lerp, saida, mola , usaTema } from './kit';

export const DUR_T4 = 640;
const NOMES = ['Carla M.', 'João P.', 'Ana L.', 'Rafael S.', 'Beatriz C.', 'Lucas F.', 'Helena R.', 'Diego T.', 'Sofia N.', 'Pedro A.', 'Larissa V.', 'Bruno K.', 'Camila D.', 'Igor S.', 'Paula G.', 'Renato O.', 'Marina A.', 'Otávio B.', 'Júlia R.', 'Tiago E.'];
const PREV = ['Tem horário hoje?', 'Quanto custa a avaliação?', 'Vocês aceitam convênio?', 'Preciso remarcar', 'Qual o endereço?', 'Tô com dor, tem encaixe?', 'Oi, bom dia!', 'Quero marcar limpeza', 'Funciona sábado?', 'Ligação perdida', 'Vi o anúncio de vocês', 'Posso levar meu filho?'];
const N = 30;
const COLS = [
  { t: 'Agendou', cor: C.verde, fundo: C.menta, txt: C.prof },
  { t: 'Respondido', cor: C.fg2, fundo: '#EEF2F0', txt: C.fg },
  { t: 'Pra equipe', cor: C.ambar, fundo: C.ambarSuave, txt: C.ambar },
];
const dest = (i: number) => (i % 7 === 2 || i === 17 ? 2 : i % 5 === 0 || i % 3 === 1 ? 0 : 1);
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

const CARDS = Array.from({ length: N }, (_, i) => {
  const tipo = i % 5 === 3 ? 'fone' : i % 9 === 4 ? 'insta' : 'chat';
  return { i, tipo, nome: NOMES[i % NOMES.length], prev: tipo === 'fone' ? 'Ligação perdida' : PREV[(i * 5) % PREV.length], hora: `08:0${i % 10}`, px: 60 + rnd(i, 1) * 560, py: 360 + rnd(i, 2) * 1180, rot: (rnd(i, 3) - 0.5) * 24, ini: 18 + i * 4.6, d: dest(i) };
});
const ordem = [0, 0, 0];
const SLOT = CARDS.map((c) => ordem[c.d]++);
const TOTAIS = [...ordem];

const ColW = 300, ColX = (k: number) => 60 + k * 330, RowY = (k: number) => 560 + k * 64;

export const T4: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const painel = lerp(f, 372, 410, 0, 1);
  const tremor = f > 100 && f < 196 ? Math.sin(f * 1.7) * lerp(f, 100, 180, 0, 5) : 0;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves2(f)} brilho={lerp(f, 180, 220, 0.25, 1)} />
      <Camera ks={[{ f: 0, x: 540, y: 960, s: 1 }, { f: 372, x: 540, y: 960, s: 1 }, { f: 430, x: 420, y: 930, s: 0.78 }, { f: 540, x: 420, y: 940, s: 0.8 }]} borrar={false}>
        <div style={{ position: 'relative', width: 1080, height: 1920, transform: `translateX(${tremor}px)` }}>
          {/* moldura do painel (aparece na virada) */}
          <div style={{ position: 'absolute', left: -340, top: 300, width: 1430, height: 1340, borderRadius: 48, background: '#fff', border: `2px solid ${C.linha}`, boxShadow: '0 60px 140px -60px rgba(11,20,17,.45)', opacity: painel, transform: `scale(${0.96 + 0.04 * painel})` }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 340, background: '#F6F9F7', borderRight: `2px solid ${C.linha}`, borderRadius: '48px 0 0 48px', padding: '44px 36px' }}>
              <Marca tam={44} />
              <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Conversas', 'chat'], ['Pipeline', 'seta'], ['Agenda', 'agenda'], ['Ligações', 'fone']].map(([t, ic], i) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 20, background: i === 1 ? C.menta : 'transparent', color: i === 1 ? C.prof : C.fg2, fontFamily: G, fontWeight: 500, fontSize: 32 }}>
                    <Icone n={ic} tam={34} cor={i === 1 ? C.verde : C.fg3} />{t}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', left: 400, top: 50, fontFamily: G, fontWeight: 600, fontSize: 46, letterSpacing: '-0.04em', color: C.ink }}>Pipeline · hoje</div>
            <div style={{ position: 'absolute', right: 50, top: 60, fontFamily: M, fontSize: 26, color: C.fg3 }}>seg · 08:14</div>
          </div>

          {/* colunas */}
          {COLS.map((c, k) => {
            const o = lerp(f, 200 + k * 6, 220 + k * 6, 0, 1);
            return (
              <div key={k} style={{ position: 'absolute', left: ColX(k), top: 470, width: ColW, opacity: o, transform: `translateY(${(1 - o) * 30}px)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink, letterSpacing: '-0.03em' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 99, background: c.cor }} />{c.t}
                  <span style={{ marginLeft: 'auto', fontFamily: M, fontSize: 30, color: c.cor }}><Num de={0} ate={TOTAIS[k]} ini={210} dur={150} /></span>
                </div>
                <div style={{ position: 'absolute', left: -12, right: -12, top: 66, height: TOTAIS[k] * 64 + 20, borderRadius: 26, background: k === 2 ? `rgba(201,133,18,${0.06 + 0.1 * lerp(f, 470, 490, 0, 1) * saida(f, 560, 14)})` : 'rgba(11,20,17,.025)', border: k === 2 && f > 470 ? `3px solid rgba(201,133,18,${0.6 * saida(f, 560, 14)})` : 'none' }} />
              </div>
            );
          })}

          {/* os cartões: caem, empilham, são organizados */}
          {CARDS.map((c) => {
            const queda = mola(f, c.ini, { damping: 13, stiffness: 120, mass: 0.9 });
            if (queda <= 0.001) return null;
            const t0 = 212 + c.i * 4.2;
            const p = interpolate(f, [t0, t0 + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.6, 0, 0.2, 1) });
            const x = interpolate(p, [0, 1], [c.px, ColX(c.d)]);
            const y = interpolate(p, [0, 1], [-260 + (c.py + 260) * queda, RowY(SLOT[c.i])]);
            const w = interpolate(p, [0, 1], [400, ColW]);
            const h = interpolate(p, [0, 1], [118, 54]);
            const col = COLS[c.d];
            const arco = Math.sin(p * Math.PI) * -120;
            return (
              <div key={c.i} style={{ position: 'absolute', left: x, top: y + arco, width: w, height: h, borderRadius: interpolate(p, [0, 1], [28, 16]), background: p > 0.5 ? col.fundo : '#fff', border: `1.5px solid ${p > 0.5 ? 'transparent' : C.linha}`, boxShadow: p < 0.9 ? '0 18px 40px -20px rgba(11,20,17,.45)' : 'none', transform: `rotate(${c.rot * (1 - p)}deg)`, display: 'flex', alignItems: 'center', gap: 14, padding: `0 ${interpolate(p, [0, 1], [22, 16])}px`, overflow: 'hidden', zIndex: Math.round(p * 100) + c.i }}>
                <div style={{ width: interpolate(p, [0, 1], [64, 30]), height: interpolate(p, [0, 1], [64, 30]), borderRadius: 99, flex: 'none', background: c.tipo === 'fone' ? C.alertaSuave : C.menta, display: 'grid', placeItems: 'center' }}>
                  <Icone n={c.tipo} tam={interpolate(p, [0, 1], [34, 18])} cor={c.tipo === 'fone' ? C.alerta : C.verde} traco={2.2} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: G, fontWeight: 600, fontSize: interpolate(p, [0, 1], [30, 24]), color: p > 0.5 ? col.txt : C.ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{c.nome}</div>
                  {p < 0.6 && <div style={{ fontFamily: G, fontWeight: 500, fontSize: 26, color: C.fg2, whiteSpace: 'nowrap', opacity: 1 - p * 1.6 }}>{c.prev}</div>}
                </div>
                {p < 0.5 && <div style={{ fontFamily: M, fontSize: 22, color: C.fg3, opacity: 1 - p * 2 }}>{c.hora}</div>}
              </div>
            );
          })}
        </div>
      </Camera>

      {/* contador do caos */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t={'Segunda, 8h01.'} ini={4} fim={110} tam={86} />
      </div>
      <div style={{ position: 'absolute', top: 1720, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, opacity: Math.min(lerp(f, 30, 44, 0, 1), saida(f, 196, 10)) }}>
        <div style={{ padding: '14px 26px', borderRadius: 99, background: C.ink, color: '#fff', fontFamily: M, fontSize: 30 }}><Num de={0} ate={47} ini={30} dur={140} /> mensagens</div>
        <div style={{ padding: '14px 26px', borderRadius: 99, background: C.alerta, color: '#fff', fontFamily: M, fontSize: 30 }}><Num de={0} ate={6} ini={40} dur={120} /> ligações perdidas</div>
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t={'A recepção já começa\n*atrasada.*'} ini={112} fim={196} tam={72} acento={C.alerta} />
      </div>
      {/* o ponto cai */}
      {f >= 182 && f < 232 && <Ponto x={540} y={chaves2b(f)} r={lerp(f, 196, 206, 26, 40)} o={saida(f, 232, 14)} />}
      {f >= 196 && f < 212 && <div style={{ position: 'absolute', left: 540 - lerp(f, 196, 212, 40, 900), top: 960 - lerp(f, 196, 212, 40, 900), width: lerp(f, 196, 212, 80, 1800), height: lerp(f, 196, 212, 80, 1800), borderRadius: '50%', border: `6px solid ${C.verde}`, opacity: lerp(f, 196, 212, 0.8, 0) }} />}
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, opacity: 1 - painel }}>
        <Titulo t="A Thata *organiza tudo.*" ini={222} fim={368} tam={72} />
      </div>
      <div style={{ position: 'absolute', top: 1560, left: 0, right: 0 }}>
        <Titulo t={'Esse é o painel\nda *sua* clínica.'} ini={404} fim={466} tam={70} />
      </div>
      <div style={{ position: 'absolute', top: 1560, left: 0, right: 0 }}>
        <Titulo t={'Pra equipe, só o que\n*precisa da equipe.*'} ini={470} fim={566} tam={70} acento={C.ambar} />
      </div>
      {f >= 560 && <div style={{ position: 'absolute', inset: 0, opacity: lerp(f, 560, 572, 0, 1) }}><Fecho ini={566} frase={'Sua equipe cuida\n*de quem chegou.*'} /></div>}
    </AbsoluteFill>
  );
};

function chaves2(f: number) { return f < 196 ? 600 : 960; }
function chaves2b(f: number) {
  // cai do topo e quica no centro
  if (f < 196) return lerp(f, 182, 196, -60, 960, Easing.bezier(0.55, 0, 1, 0.45));
  return 960 - Math.abs(Math.sin(((f - 196) / 16) * Math.PI)) * 60 * Math.exp(-(f - 196) / 10);
}
