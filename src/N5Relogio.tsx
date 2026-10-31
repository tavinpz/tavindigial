// N5 (claro) — "24 horas": um relógio de 24h dá a volta inteira; em cada hora, algo que a Thata resolveu; no fim o relógio vira o ponto.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Icone, Fecho, lerp, saida, molaViva, chaves, usaTema } from './kit';

export const DUR_N5 = 600;
const CX = 540, CY = 960, R = 390;
const T0 = 60, T1 = 420; // o ponteiro anda de 07:00 a 07:00
const EVENTOS: [number, string, string][] = [
  [7.0, 'Confirmações do dia enviadas', 'ok'],
  [8.5, 'Ligação atendida, avaliação marcada', 'fone'],
  [10.2, 'Áudio de 2 min respondido', 'chat'],
  [12.0, 'Fila do almoço zerada', 'relogio'],
  [14.6, 'Remarcação feita sozinha', 'agenda'],
  [16.0, '"Como você está?" pós-consulta', 'chat'],
  [18.0, 'Recepção fecha. A Thata segue.', 'lua'],
  [19.5, '"Quanto custa?" virou consulta', 'ok'],
  [21.1, 'Encaixe pra amanhã cedo', 'agenda'],
  [23.8, 'Paciente nova marcada', 'pessoa'],
  [3.2, 'Dúvida respondida às 3h', 'chat'],
  [6.0, 'Parabéns aos aniversariantes', 'sino'],
];
const hEm = (f: number) => 7 + lerp(f, T0, T1, 0, 24, Easing.bezier(0.3, 0, 0.7, 1));
const ang = (h: number) => ((h % 24) / 24) * Math.PI * 2 - Math.PI / 2;

export const N5: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const h = hEm(f);
  const prog = (h - 7) / 24;
  const fecha = lerp(f, 436, 470, 0, 1, Easing.bezier(0.7, 0, 0.3, 1));
  const r = R * (1 - fecha) + 30 * fecha;
  const hh = Math.floor(h % 24), mm = Math.floor((h % 1) * 60);
  const circ = 2 * Math.PI * (r - 14);
  // o último evento que apareceu fica em destaque embaixo
  const passados = EVENTOS.filter(([e]) => ((e - 7 + 24) % 24) / 24 <= prog + 0.001);
  const atual = passados[passados.length - 1];
  return (
    <AbsoluteFill>
      <Fundo gy={CY} brilho={0.6 + 0.4 * prog} />
      <div style={{ position: 'absolute', left: CX - r, top: CY - r, width: r * 2, height: r * 2, opacity: Math.min(lerp(f, 30, 48, 0, 1), fecha > 0.95 ? 0 : 1) }}>
        <svg width={r * 2} height={r * 2} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={r} cy={r} r={r - 14} fill={C.papel} stroke={C.linha} strokeWidth={22} />
          <circle cx={r} cy={r} r={r - 14} fill="none" stroke={C.verde} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${circ * prog} ${circ}`} transform={`rotate(${(7 / 24) * 360 - 90} ${r} ${r})`} />
          {/* marcas de hora */}
          {fecha < 0.3 && Array.from({ length: 24 }, (_, i) => {
            const a = ang(i); const r1 = r - 44, r2 = r - (i % 6 === 0 ? 70 : 56);
            return <line key={i} x1={r + Math.cos(a) * r1} y1={r + Math.sin(a) * r1} x2={r + Math.cos(a) * r2} y2={r + Math.sin(a) * r2} stroke={C.fg3} strokeWidth={i % 6 === 0 ? 4 : 2} strokeLinecap="round" />;
          })}
          {/* pontos dos eventos */}
          {fecha < 0.3 && EVENTOS.map(([e], i) => {
            const vis = ((e - 7 + 24) % 24) / 24 <= prog;
            const a = ang(e);
            return vis && <circle key={i} cx={r + Math.cos(a) * (r - 14)} cy={r + Math.sin(a) * (r - 14)} r={13} fill="#fff" stroke={C.verde} strokeWidth={6} />;
          })}
          {/* ponteiro */}
          {fecha < 0.3 && f >= T0 - 10 && <line x1={r} y1={r} x2={r + Math.cos(ang(h)) * (r - 90)} y2={r + Math.sin(ang(h)) * (r - 90)} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />}
        </svg>
        {fecha < 0.5 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 1 - fecha * 2 }}>
            <div style={{ fontFamily: M, fontWeight: 500, fontSize: 120, color: C.ink, letterSpacing: '-0.03em', background: C.papel, padding: '0 16px', borderRadius: 20 }}>{String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}</div>
            <div style={{ fontFamily: G, fontWeight: 500, fontSize: 30, color: (hh >= 18 || hh < 8) ? C.fg2 : C.verde, marginTop: 4 }}>{(hh >= 18 || hh < 8) ? 'clínica fechada' : 'clínica aberta'}</div>
          </div>
        )}
      </div>
      {fecha > 0.9 && <Ponto x={CX} y={CY} r={30} o={saida(f, 520, 10)} />}

      {/* o evento da vez */}
      {atual && f < 432 && (
        <div key={atual[1]} style={{ position: 'absolute', left: 0, right: 0, top: CY + R + 70, display: 'flex', justifyContent: 'center' }}>
          {(() => {
            const ini = Math.round(T0 + (((atual[0] - 7 + 24) % 24) / 24) * (T1 - T0));
            const s = molaViva(f, ini);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '22px 34px 22px 22px', borderRadius: 99, background: C.papel, border: `1.5px solid ${C.linha}`, boxShadow: '0 30px 60px -30px rgba(11,20,17,.4)', transform: `scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 30}px)`, opacity: Math.min(1, s * 2) }}>
                <div style={{ width: 64, height: 64, borderRadius: 99, background: C.menta, display: 'grid', placeItems: 'center' }}><Icone n={atual[2]} tam={34} cor={C.verde} traco={2.2} /></div>
                <span style={{ fontFamily: G, fontWeight: 600, fontSize: 38, letterSpacing: '-0.02em', color: C.ink }}>{atual[1]}</span>
              </div>
            );
          })()}
        </div>
      )}
      {/* contador de coisas resolvidas */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: CY - R - 130, display: 'flex', justifyContent: 'center', opacity: Math.min(lerp(f, 60, 72, 0, 1), saida(f, 436, 10)) }}>
        <div style={{ fontFamily: M, fontSize: 30, color: C.prof }}>{passados.length} de 12 momentos do dia</div>
      </div>

      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <Titulo t={'Um dia inteiro da recepção\nem *20 segundos.*'} ini={4} fim={236} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <Titulo t={'Inclusive quando\na clínica *está fechada.*'} ini={240} fim={432} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 1180, left: 0, right: 0 }}>
        <Titulo t={'24 horas.\n*Todo dia.*'} ini={448} fim={524} tam={92} />
      </div>
      {f >= 518 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 518, 530, 0, 1) }}><Fecho ini={524} frase={'Uma recepção que\n*não fecha.*'} /></div>}
    </AbsoluteFill>
  );
};
