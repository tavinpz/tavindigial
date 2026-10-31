// C1 (claro) — "Volto às 13h": recepção no almoço; a Thata responde a fila de conversas; a plaquinha vira e mostra o resumo.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Fone, Icone, Fecho, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_C1 = 590;
const W = 640;
const CONVERSAS = [
  { n: 'Ana L.', p: 'Tem horário pra sexta?', r: 'Sexta às 10h, reservado.', h: '12:04', ok: 150 },
  { n: 'João P.', p: 'Qual o endereço de vocês?', r: 'Mandei a localização.', h: '12:11', ok: 176 },
  { n: 'Beatriz C.', p: 'Preciso remarcar a de amanhã', r: 'Remarquei pra quinta, 14h.', h: '12:19', ok: 202 },
  { n: 'Lucas F.', p: 'Vocês fazem clareamento?', r: 'Avaliação marcada: seg, 9h.', h: '12:27', ok: 228 },
  { n: 'Helena R.', p: 'Aceitam cartão?', r: 'Respondido.', h: '12:40', ok: 254 },
  { n: 'Diego T.', p: 'Quero marcar limpeza pro meu filho', r: 'Ter às 16h, reservado.', h: '12:52', ok: 280 },
];

const Linha: React.FC<{ c: typeof CONVERSAS[0]; i: number }> = ({ c, i }) => {
  const f = useCurrentFrame();
  const chega = 100 + i * 10;
  const s = mola(f, chega);
  const ok = f >= c.ok;
  const pv = ok ? molaViva(f, c.ok) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '22px 26px', borderBottom: `1.5px solid ${C.linha}`, opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * -40}px)`, background: ok && f < c.ok + 16 ? `rgba(27,195,113,${0.12 * (1 - (f - c.ok) / 16)})` : 'transparent' }}>
      <div style={{ width: 70, height: 70, borderRadius: 99, background: C.menta, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 30, color: C.verde, flex: 'none' }}>{c.n[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: G, fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: '-0.02em' }}>{c.n}</span>
          <span style={{ fontFamily: M, fontSize: 20, color: ok ? C.verde : C.fg3 }}>{c.h}</span>
        </div>
        <div style={{ position: 'relative', height: 34, overflow: 'hidden', marginTop: 4 }}>
          <div style={{ transform: `translateY(${-Math.min(1, pv) * 34}px)`, fontFamily: G, fontWeight: 500, fontSize: 25, lineHeight: '34px' }}>
            <div style={{ color: C.fg2, whiteSpace: 'nowrap' }}>{c.p}</div>
            <div style={{ color: C.prof, whiteSpace: 'nowrap' }}>● Thata: {c.r}</div>
          </div>
        </div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 99, flex: 'none', display: 'grid', placeItems: 'center', background: ok ? C.verde : C.alerta, transform: `scale(${ok ? pv : 1})`, fontFamily: G, fontWeight: 600, fontSize: 22, color: '#fff' }}>
        {ok ? <Icone n="ok" tam={26} cor="#fff" traco={3} /> : 1}
      </div>
    </div>
  );
};

export const C1: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const vira = interpolate(f, [336, 372], [0, 180], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2) });
  const minutos = Math.round(chaves(f, [[90, 2], [300, 58], [336, 60]]));
  const hora = minutos >= 60 ? '13:00' : `12:${String(minutos).padStart(2, '0')}`;
  // placa: grande no começo, encolhe para o canto enquanto o celular trabalha, volta ao centro para virar
  const px = chaves(f, [[0, 540], [90, 540], [120, 860], [320, 860], [340, 540]]);
  const py = chaves(f, [[0, 900], [90, 900], [120, 1560], [320, 1560], [340, 900]]);
  const ps = chaves(f, [[0, 1], [90, 1], [120, 0.42], [320, 0.42], [340, 1.05]]);
  return (
    <AbsoluteFill>
      <Fundo gy={py} />
      {/* o celular com a fila de conversas */}
      <div style={{ position: 'absolute', left: 540 - W / 2 - 60, top: 300, opacity: saida(f, 336, 14), transform: `translateY(${(1 - mola(f, 88, { damping: 17, stiffness: 110, mass: 1 })) * 1400}px)` }}>
        <Fone w={W}>
          <div style={{ padding: '120px 30px 20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1.5px solid ${C.linha}` }}>
            <span style={{ fontFamily: G, fontWeight: 600, fontSize: 48, letterSpacing: '-0.04em', color: C.ink }}>Conversas</span>
            <span style={{ fontFamily: M, fontSize: 26, color: C.fg2 }}>{hora}</span>
          </div>
          {CONVERSAS.map((c, i) => <Linha key={i} c={c} i={i} />)}
        </Fone>
      </div>

      {/* a plaquinha de balcão */}
      <div style={{ position: 'absolute', left: px - 330, top: py - 220, width: 660, height: 440, transform: `scale(${ps})`, perspective: 2000, zIndex: 20 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${vira}deg) translateY(${(1 - mola(f, 0)) * 300}px)` }}>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 40, background: C.papel, border: `2px solid ${C.linha}`, boxShadow: '0 50px 90px -40px rgba(11,20,17,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <Icone n="relogio" tam={90} cor={C.verde} traco={1.6} />
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 104, letterSpacing: '-0.05em', color: C.ink }}>Volto às 13h</div>
            <div style={{ fontFamily: M, fontSize: 30, color: C.fg2 }}>recepção · almoço</div>
          </div>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 40, background: C.verde, boxShadow: '0 50px 90px -40px rgba(21,167,99,.7)', padding: '48px 54px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: M, fontSize: 28, opacity: 0.85 }}>enquanto você almoçava</div>
            <div style={{ display: 'flex', gap: 60, marginTop: 24 }}>
              <div><div style={{ fontFamily: G, fontWeight: 600, fontSize: 120, letterSpacing: '-0.05em', lineHeight: 1 }}>6</div><div style={{ fontFamily: G, fontWeight: 500, fontSize: 34 }}>conversas</div></div>
              <div><div style={{ fontFamily: G, fontWeight: 600, fontSize: 120, letterSpacing: '-0.05em', lineHeight: 1 }}>4</div><div style={{ fontFamily: G, fontWeight: 500, fontSize: 34 }}>consultas marcadas</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 30, fontFamily: G, fontWeight: 500, fontSize: 30 }}><div style={{ width: 14, height: 14, borderRadius: 99, background: '#fff' }} /> por Thata, IA da recepção</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 260, left: 0, right: 0 }}>
        <Titulo t={'12h02.\nHora do almoço.'} ini={8} fim={92} tam={92} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A recepção foi almoçar." ini={110} fim={214} tam={64} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A Thata *ficou.*" ini={218} fim={330} tam={72} />
      </div>
      <div style={{ position: 'absolute', top: 1260, left: 0, right: 0 }}>
        <Titulo t={'13h. A placa vira.'} ini={344} fim={480} tam={60} peso={500} cor={C.fg2} />
      </div>
      {f >= 474 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 474, 486, 0, 1) }}><Fecho ini={480} frase={'A recepção almoça.\n*A agenda, não.*'} /></div>}
    </AbsoluteFill>
  );
};
