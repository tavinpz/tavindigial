// T5 — "Ninguém chamou": a lista de pacientes parados; a Thata chama um por um; as linhas viram as barras da agenda.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Bolha, Fecho, Num, lerp, saida, mola, chaves , usaTema } from './kit';

export const DUR_T5 = 620;
const NOMES = ['Carla Mendes', 'João Pires', 'Ana Lima', 'Rafael Souza', 'Beatriz Costa', 'Lucas Freitas', 'Helena Rocha', 'Diego Tavares', 'Sofia Nunes', 'Pedro Alves', 'Larissa Vidal', 'Bruno Kato', 'Camila Duarte', 'Igor Santos', 'Paula Gomes', 'Renato Oliva', 'Marina Assis', 'Otávio Brito', 'Júlia Ramos', 'Tiago Esteves', 'Vera Lopes', 'Hugo Prado'];
const N = 16;
const RY = (i: number) => 470 + i * 78;
// quem volta (índice da linha → quadro em que fica verde)
const VOLTA: Record<number, number> = { 2: 214, 7: 274, 11: 322 };
[0, 4, 5, 9, 13, 14, 15, 1].forEach((i, k) => (VOLTA[i] = 352 + k * 5));
const ALT = [0.55, 0.3, 0.8, 0.35, 0.62, 0.7, 0.28, 0.85, 0.4, 0.66, 0.3, 0.9, 0.45, 0.74, 0.78, 0.6];

export const T5: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const rola = Math.floor(chaves(f, [[0, 0], [86, 120]], Easing.bezier(0.2, 0.8, 0.3, 1)));
  const vira = (i: number) => interpolate(f, [404 + i * 2, 444 + i * 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const cresce = lerp(f, 450, 520, 0, 1, Easing.bezier(0.2, 0.8, 0.2, 1));
  const pontoY = chaves(f, [[150, RY(0) + 34], [200, RY(2) + 34], [262, RY(7) + 34], [310, RY(11) + 34], [350, RY(11) + 34], [392, RY(15) + 60]]);
  return (
    <AbsoluteFill>
      <Fundo gy={pontoY} brilho={lerp(f, 140, 180, 0.3, 1)} />
      {/* cartão da lista */}
      <div style={{ position: 'absolute', left: 60, top: 330, width: 960, height: 1360, borderRadius: 48, background: '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 50px 100px -50px rgba(11,20,17,.4)', opacity: Math.min(mola(f, 0), saida(f, 430, 24)) }}>
        <div style={{ position: 'absolute', left: 40, top: 34, fontFamily: G, fontWeight: 600, fontSize: 36, letterSpacing: '-0.03em', color: C.ink }}>Pacientes sem retorno</div>
        <div style={{ position: 'absolute', right: 40, top: 40, fontFamily: M, fontSize: 26, color: C.fg3 }}>+ de 6 meses</div>
      </div>
      {/* linhas → barras */}
      {Array.from({ length: N }, (_, i) => {
        const v = vira(i);
        const volta = VOLTA[i] !== undefined && f >= VOLTA[i];
        const pv = volta ? mola(f, VOLTA[i]) : 0;
        const bx = 110 + i * 54, bw = 38, bh = (volta ? ALT[i] : ALT[i] * 0.3) * 760 * (0.2 + 0.8 * cresce) + 20;
        const x = interpolate(v, [0, 1], [100, bx]);
        const w = interpolate(v, [0, 1], [880, bw]);
        const h = interpolate(v, [0, 1], [64, bh]);
        const y = interpolate(v, [0, 1], [RY(i), 1460 - bh]);
        const nome = NOMES[(i + rola) % NOMES.length];
        const meses = 6 + ((i * 7 + rola) % 9);
        const entra = mola(f, 4 + i * 1.5);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: interpolate(v, [0, 1], [20, 12]), background: volta ? `rgba(21,167,99,${0.12 + 0.88 * Math.min(1, pv + v)})` : interpolate(v, [0, 1], [0, 1]) > 0.5 ? '#DCE5E0' : '#F3F6F4', display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', overflow: 'hidden', opacity: entra, transform: `translateX(${(1 - entra) * 40}px) scale(${1 + (volta && f < VOLTA[i] + 12 ? 0.03 * Math.sin(((f - VOLTA[i]) / 12) * Math.PI) : 0)})` }}>
            {v < 0.4 && (
              <>
                <div style={{ width: 40, height: 40, borderRadius: 99, background: volta ? C.verde : '#DCE5E0', flex: 'none', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 20, color: volta ? '#fff' : C.fg3, opacity: 1 - v * 2.5 }}>{nome[0]}</div>
                <div style={{ flex: 1, fontFamily: G, fontWeight: 600, fontSize: 30, letterSpacing: '-0.02em', color: volta ? C.prof : C.fg3, whiteSpace: 'nowrap', opacity: 1 - v * 2.5 }}>{nome}</div>
                <div style={{ fontFamily: M, fontSize: 24, color: volta ? C.verde : C.fg3, whiteSpace: 'nowrap', opacity: 1 - v * 2.5 }}>{volta ? 'voltou pra agenda' : `há ${meses} meses`}</div>
              </>
            )}
          </div>
        );
      })}
      {/* o ponto descendo a lista */}
      {f >= 140 && f < 410 && <Ponto x={74} y={pontoY} r={lerp(f, 140, 156, 0, 18)} o={saida(f, 410, 14)} />}
      {/* conversas */}
      {([[2, 168, 'Oi, Camila! Faz 8 meses da sua última limpeza. Quer que eu veja um horário essa semana?', 'Quero sim! Pode ser quinta?', 196], [7, 228, 'Oi, Otávio! Sua revisão do aparelho está atrasada. Te encaixo na terça às 18h?', 'Perfeito, obrigado!', 256], [11, 278, 'Oi, Hugo! Lembrei de você: o clareamento que você pediu orçamento. Ainda tem interesse?', 'Tenho! Me passa os horários', 304]] as [number, number, string, string, number][]).map(([i, ini, a, b, ib]) => (
        <div key={i} style={{ position: 'absolute', left: 120, right: 90, top: RY(i) + 84, opacity: Math.min(lerp(f, ini, ini + 8, 0, 1), saida(f, ib + 34, 10)), zIndex: 30, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Bolha t={a} ini={ini} eu ia tam={29} max={760} />
          <Bolha t={b} ini={ib} tam={29} max={600} />
        </div>
      ))}
      {/* eixo das barras */}
      <div style={{ position: 'absolute', left: 100, right: 100, top: 1470, height: 3, background: C.linha2, opacity: lerp(f, 440, 460, 0, 1) }} />
      <div style={{ position: 'absolute', left: 100, top: 1500, right: 100, display: 'flex', justifyContent: 'space-between', fontFamily: M, fontSize: 24, color: C.fg3, opacity: lerp(f, 450, 470, 0, 1) }}>
        <span>sem 1</span><span>sem 2</span><span>sem 3</span><span>sem 4</span>
      </div>

      <div style={{ position: 'absolute', top: 110, left: 0, right: 0 }}>
        <Titulo t={'Pacientes que\n*não voltaram.*'} ini={6} fim={88} tam={80} acento={C.fg3} />
      </div>
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0 }}>
        <Titulo t={'Eles não sumiram.\n*Só ninguém chamou.*'} ini={92} fim={196} tam={76} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="A Thata chama *um por um.*" ini={204} fim={396} tam={64} />
      </div>
      <div style={{ position: 'absolute', top: 1740, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(lerp(f, 340, 352, 0, 1), saida(f, 404, 10)) }}>
        <div style={{ padding: '16px 30px', borderRadius: 99, background: C.ink, color: '#fff', fontFamily: M, fontSize: 30 }}><Num de={3} ate={11} ini={350} dur={46} /> voltaram pra agenda</div>
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t={'Quem estava parado\n*volta pra agenda.*'} ini={430} fim={556} tam={78} />
      </div>
      {f >= 550 && <div style={{ position: 'absolute', inset: 0, opacity: lerp(f, 550, 562, 0, 1) }}><Fecho ini={556} frase={'Sua base parada\n*vira agenda.*'} /></div>}
    </AbsoluteFill>
  );
};
