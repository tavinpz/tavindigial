// S1 (escuro) — "Por trás da resposta": chega "tem horário sábado?"; a câmera mergulha no balão e o ponto passa por
// quatro estações (ficha, regras da clínica, agenda, escrita no tom da clínica) até sair a resposta.
// Metáfora: a mensagem atravessa os bastidores em quatro paradas.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Mono, Ponto, Fecho, Narrada, Conversa, Bolha, Icone, Check, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_S1 = 600;
const EST: [string, string, string, string][] = [
  ['pessoa', 'Ficha do paciente', 'Carla M. · já é paciente', 'prefere horário de manhã'],
  ['arquivo', 'Regras da clínica', 'sábado só até 12h', 'avaliação antes de orçamento'],
  ['agenda', 'Agenda', 'sáb 09:00 livre', 'sáb 10:30 livre'],
  ['chat', 'Escreve no tom da clínica', 'simpática e curta', 'sem termo técnico'],
];
const EY = 470, EDY = 230;
const chega = (i: number) => 236 + i * 42;

const Estacao: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [ic, tit, a, b] = EST[i];
  const ent = mola(f, 214 + i * 6, { damping: 18, stiffness: 150, mass: 0.7 });
  const on = f >= chega(i);
  const s = on ? mola(f, chega(i), { damping: 11, stiffness: 180, mass: 0.6 }) : 0;
  return (
    <div style={{ position: 'absolute', left: 190, width: 810, top: EY + i * EDY, height: 190, borderRadius: 36, padding: '28px 34px', display: 'flex', gap: 28, alignItems: 'center',
      background: on ? 'rgba(27,195,113,.10)' : C.papel, border: `1.5px solid ${on ? 'rgba(95,227,161,.45)' : C.linha}`, opacity: Math.min(1, ent * 2), transform: `translateX(${(1 - ent) * 80}px) scale(${1 + s * 0.02 - (on ? 0.02 : 0)})`,
      boxShadow: on ? '0 30px 60px -30px rgba(27,195,113,.6)' : 'none' }}>
      <div style={{ width: 96, height: 96, borderRadius: 28, background: on ? C.verde : C.menta, display: 'grid', placeItems: 'center', flex: 'none' }}>
        <Icone n={ic} tam={52} cor={on ? '#06100C' : C.vivo} traco={2.2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: M, fontSize: 24, color: C.fg2, marginBottom: 6 }}>{`passo ${i + 1}`}</div>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 44, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{tit}</div>
        <div style={{ fontFamily: M, fontSize: 26, color: on ? C.vivo : C.fg3, marginTop: 10, opacity: lerp(f, chega(i) + 4, chega(i) + 14, 0.35, 1) }}>{a} · {b}</div>
      </div>
      <div style={{ width: 70, height: 70, flex: 'none' }}>{on && <Check ini={chega(i) + 2} tam={70} />}</div>
    </div>
  );
};

export const S1: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  // celular: entra, depois a câmera mergulha no balão (escala sobe e some)
  const mergulho = lerp(f, 72, 150, 0, 1, Easing.bezier(0.5, 0, 0.75, 0.3));
  const foneS = chaves(f, [[0, 1.06], [40, 1]]) * (1 + mergulho * 3.2);
  const foneO = lerp(f, 132, 152, 1, 0);
  // fio vertical e ponto viajando pelas estações
  const fioY0 = EY + 95, fioY1 = EY + 3 * EDY + 95;
  const py = chaves(f, [[210, 150], [chega(0), fioY0], [chega(1), fioY0 + EDY], [chega(2), fioY0 + 2 * EDY], [chega(3), fioY1]], Easing.bezier(0.5, 0, 0.3, 1));
  const fioP = lerp(f, 214, chega(3), 0, 1, (x) => x);
  const recua = lerp(f, 400, 424, 0, 1);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 700], [210, 300], [380, 1200], [420, 900]])} brilho={chaves(f, [[0, 0.5], [150, 0.25], [214, 1]])} />
      <Fantasma t="BASTIDOR" ini={150} fim={486} y={1430} tam={300} vel={1.3} />

      {/* ato 1: a mensagem chega */}
      {f < 154 && (
        <div style={{ position: 'absolute', left: 540 - 310, top: 300, transform: `scale(${foneS})`, transformOrigin: '310px 1050px', opacity: foneO }}>
          <Conversa w={620} nome="Carla M." sub="online" msgs={[{ t: 'Oi! Tem horário sábado de manhã?', f: 4, hora: '14:02' }]} tam={32} />
        </div>
      )}
      <div style={{ position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: saida(f, 90, 10) }}>
        <Mono t="14:02 · nova mensagem na clínica" ini={4} tam={30} />
      </div>

      {/* ato 2: a pergunta */}
      <div style={{ position: 'absolute', top: 700, left: 60, right: 60 }}>
        <Titulo t={'O que acontece\n*nesses segundos?*'} ini={150} fim={212} tam={92} linha={1.14} />
      </div>

      {/* ato 3: as quatro estações */}
      <div style={{ position: 'absolute', inset: 0, opacity: saida(f, 486, 10) * (1 - recua * 0.7), transform: `scale(${1 - recua * 0.08})`, filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined, transformOrigin: '540px 900px' }}>
        <div style={{ position: 'absolute', top: 240, left: 0, right: 0, textAlign: 'center', opacity: lerp(f, 216, 230, 0, 1) }}>
          <div style={{ fontFamily: M, fontSize: 28, color: C.fg2 }}>antes de responder, a Thata:</div>
        </div>
        {f >= 214 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
            <line x1={110} y1={fioY0} x2={110} y2={fioY1} stroke={C.linha2} strokeWidth={4} strokeDasharray="4 10" strokeLinecap="round" />
            <line x1={110} y1={fioY0} x2={110} y2={fioY0 + (fioY1 - fioY0) * fioP} stroke={C.verde} strokeWidth={6} strokeLinecap="round" />
          </svg>
        )}
        {EST.map((_, i) => f >= 210 && <Estacao key={i} i={i} />)}
        {f >= 210 && f < 410 && <Ponto x={110} y={py} r={26} />}
      </div>

      {/* ato 4: a resposta */}
      {f >= 404 && (
        <>
          <div style={{ position: 'absolute', top: 200, left: 60, right: 60, zIndex: 30 }}>
            <Titulo t={'Tudo isso em\n*segundos.*'} ini={408} fim={486} tam={96} linha={1.14} />
          </div>
          <div style={{ position: 'absolute', top: 760, left: 110, right: 110, zIndex: 30, opacity: saida(f, 486, 10), transform: `scale(${1.25 - 0.25 * mola(f, 416)})`, transformOrigin: '50% 50%' }}>
            <Bolha t="Oi, Carla! Sábado tenho 9h ou 10h30. Qual fica melhor pra você?" ini={416} ia tam={40} max={860} hora="14:02" />
          </div>
          <div style={{ position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 24, color: C.fg3, zIndex: 30, opacity: Math.min(lerp(f, 426, 438, 0, 1), saida(f, 486, 8)) }}>paciente e clínica fictícias · exemplo ilustrativo</div>
        </>
      )}

      <Narrada id="S1" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Ela segue as suas regras.\n*Não as dela.*'} /></div>}
    </AbsoluteFill>
  );
};
