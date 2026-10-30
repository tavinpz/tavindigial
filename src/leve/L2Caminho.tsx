// L2 — "O caminho do seu cliente" (linha contínua com ponto viajando; com voz)
import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, Easing } from 'remotion';
import { P, F, FundoLuz, Camera, Texto, Card, Surge, Icone, Etiqueta, Fecho, Legenda, lerp, chaves, mola, molaViva, saida } from './kit';
import { inicios, l2x, l2Chega, L2_FIM_X } from './fx';

export const FALAS_L2 = [
  'Seu cliente não chega do nada. Ele faz um caminho.',
  'Ele vê o seu post e clica no link da bio.',
  'Abre a sua página e confere os serviços e as avaliações.',
  'E chama no WhatsApp pra marcar o horário.',
  'Se uma dessas etapas falha, ele some no meio do caminho.',
  'A gente monta o caminho inteiro: artes, página, Google e atendimento. Tudo conectado.',
  'Me chama no direct que eu te mostro como fica o seu.',
];
export const DUR_L2 = [96, 96, 105, 90, 110, 160, 125];

const Y = (x: number) => 1000 + 95 * Math.sin(x / 360 + 0.4);
const trecho = (x0: number, x1: number) => {
  if (x1 <= x0) return '';
  let d = `M${x0} ${Y(x0).toFixed(1)}`;
  for (let x = x0 + 20; x < x1; x += 20) d += `L${x} ${Y(x).toFixed(1)}`;
  return d + `L${x1} ${Y(x1).toFixed(1)}`;
};
const PASSOS = [
  { x: 700, n: 'insta', t: 'Post no Instagram' },
  { x: 1350, n: 'link', t: 'Link da bio' },
  { x: 2000, n: 'pagina', t: 'Sua página' },
  { x: 2650, n: 'estrela', t: 'Avaliações' },
  { x: 3300, n: 'whats', t: 'WhatsApp' },
  { x: 3950, n: 'agenda', t: 'Horário marcado' },
];
const FIM_X = L2_FIM_X;
const QUEBRAS = [1, 3]; // trechos que "quebram" (entre passo 1→2 e 3→4)

export const L2: React.FC<{ dur?: number[]; falas?: { ini: number; fim: number; texto: string }[] }> = ({ dur = DUR_L2, falas }) => {
  const f = useCurrentFrame();
  const I = inicios(dur);
  const fim = I[6];
  const dx = (q: number) => l2x(q, dur);
  const x = dx(f);
  const chega = useMemo(() => l2Chega(dur), [dur.join(',')]);
  const zoomOut = I[4] + 6;
  const cam = [
    { f: 0, x: 560, y: 1000, s: 1.06 }, { f: I[1], x: 560, y: 980, s: 0.92 },
    ...[I[1] + 4, I[2], I[3], I[4] - 10].map((q) => ({ f: q, x: Math.max(560, dx(q) - 20), y: 980, s: 0.92 })),
    { f: zoomOut + 34, x: 2190, y: 1010, s: 0.235 }, { f: I[5] + 60, x: 2190, y: 1010, s: 0.22 },
  ];
  const quebra = lerp(f, I[4] + 36, I[4] + 52, 0, 1);
  const conserta = lerp(f, I[5] + 6, I[5] + 30, 0, 1);
  const mundoO = saida(f, I[5] + 64, 16);
  const pontoO = 1 - lerp(f, I[4] + 30, I[4] + 44, 0, 1) + conserta;

  return (
    <AbsoluteFill>
      <FundoLuz />
      <div style={{ position: 'absolute', inset: 0, opacity: mundoO }}>
        <Camera ks={cam} borrar>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
            <path d={trecho(0, FIM_X)} fill="none" stroke="rgba(27,19,34,.09)" strokeWidth={4} strokeLinecap="round" />
            {[0, ...PASSOS.map((p) => p.x)].map((x0, k) => {
              const x1 = k < PASSOS.length ? PASSOS[k].x : FIM_X;
              const b = QUEBRAS.includes(k) ? quebra * (1 - conserta) : 0;
              const d = trecho(x0, Math.min(x1, x));
              if (!d) return null;
              return (
                <g key={k}>
                  <path d={d} fill="none" stroke={conserta > 0 ? P.el : P.ink} strokeWidth={9 + conserta * 3} strokeLinecap="round" opacity={1 - b} />
                  {b > 0 && <path d={d} fill="none" stroke="#C9BFD2" strokeWidth={7} strokeLinecap="round" strokeDasharray="4 26" opacity={b} />}
                </g>
              );
            })}
            {/* ponto */}
            {f > I[0] + 12 && (
              <g opacity={Math.min(1, pontoO)}>
                <circle cx={x} cy={Y(x)} r={40 + Math.sin(f / 6) * 4} fill={P.el} opacity={0.14} />
                <circle cx={x} cy={Y(x)} r={18 * molaViva(f, I[0] + 14)} fill={P.el} />
                <circle cx={x} cy={Y(x)} r={7} fill="#fff" />
              </g>
            )}
          </svg>
          {/* quebras: marcas de erro no meio dos trechos */}
          {QUEBRAS.map((k, i) => {
            const mx = (PASSOS[k - 1].x + PASSOS[k].x) / 2;
            const s = molaViva(f, I[4] + 44 + i * 6) * (1 - conserta);
            const ok = molaViva(f, I[5] + 14 + i * 6);
            return (
              <div key={k} style={{ position: 'absolute', left: mx - 110, top: Y(mx) - 110, width: 220, height: 220, borderRadius: 999, background: ok > 0.02 ? P.el : '#fff', border: `10px solid ${ok > 0.02 ? P.el : '#E4475B'}`, display: 'grid', placeItems: 'center', transform: `scale(${Math.max(s, ok)})`, boxShadow: '0 30px 60px -20px rgba(60,10,90,.35)' }}>
                <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={ok > 0.02 ? '#fff' : '#E4475B'} strokeWidth={3} strokeLinecap="round">
                  {ok > 0.02 ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
                </svg>
              </div>
            );
          })}
          {/* passos */}
          {PASSOS.map((p, i) => {
            const s = mola(f, chega[i], 30, { damping: 12, stiffness: 170, mass: 0.6 });
            const cima = i % 2 === 0;
            const y0 = Y(p.x);
            const ultimo = i === PASSOS.length - 1;
            return (
              <div key={i} style={{ position: 'absolute', left: p.x - 200, top: cima ? y0 - 350 : y0 + 64, width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * (cima ? 40 : -40)}px) scale(${0.7 + 0.3 * s})`, filter: s < 0.9 ? `blur(${(1 - s) * 8}px)` : undefined }}>
                {!cima && <div style={{ width: 3, height: 0 }} />}
                <div style={{ width: 184, height: 184, borderRadius: 54, background: ultimo ? P.el : '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 24px 50px -18px rgba(76,22,120,.35)' }}>
                  <Icone n={p.n} tam={92} cor={ultimo ? '#fff' : P.el} traco={1.9} />
                </div>
                <div style={{ fontFamily: F, fontWeight: 700, fontSize: 46, color: P.ink, whiteSpace: 'nowrap' }}>{p.t}</div>
              </div>
            );
          })}
        </Camera>
      </div>

      {/* títulos (tela) */}
      <Pos y={420}><Texto t={'O caminho do\n*seu cliente*'} ini={6} tam={92} fim={I[1] - 2} /></Pos>
      <Pos y={430}><Texto t="Começa no *post*." ini={I[1] + 4} tam={80} fim={I[2] - 2} /></Pos>
      <Pos y={430}><Texto t="Passa pela *página*." ini={I[2] + 4} tam={80} fim={I[3] - 2} /></Pos>
      <Pos y={430}><Texto t="E termina no *WhatsApp*." ini={I[3] + 4} tam={80} fim={I[4] + 6} /></Pos>
      <Pos y={440}><Texto t={'Uma etapa falha…\ne o cliente *some*.'} ini={I[4] + 30} tam={84} fim={I[5] + 6} /></Pos>
      <Pos y={440}><Texto t={'A gente monta\no *caminho inteiro*.'} ini={I[5] + 10} tam={84} fim={I[5] + 62} /></Pos>

      {/* cartão final: o caminho montado (estilo card de app) */}
      <Sequence from={I[5] + 60} durationInFrames={Math.max(1, I[6] - I[5] - 52)} layout="none">
        <Montado d={I[6] - I[5] - 60} />
      </Sequence>

      {f >= I[6] - 6 && <Fecho ini={I[6]} frase="Do post ao horário marcado, tudo conectado." />}
      {falas && <Legenda falas={falas} y={1520} />}
    </AbsoluteFill>
  );
};

const Pos: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>{children}</div>
);

const ETAPAS = [['insta', 'Artes'], ['pagina', 'Página'], ['pino', 'Google'], ['whats', 'Atendimento']];
const Montado: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const arco = lerp(f, 14, 70, 0, 1, Easing.bezier(0.45, 0, 0.3, 1));
  const fim = d - 2;
  const A = 'M120 300 Q 460 40 800 300';
  const t = arco; const bx = (1 - t) ** 2 * 120 + 2 * (1 - t) * t * 460 + t ** 2 * 800, by = (1 - t) ** 2 * 300 + 2 * (1 - t) * t * 40 + t ** 2 * 300;
  return (
    <AbsoluteFill>
      <Pos y={360}><Texto t="Tudo *conectado*." ini={2} tam={84} fim={fim} /></Pos>
      <Card x={80} y={600} w={920} h={640} ini={0} fim={fim} de="giro" raio={44}>
        <div style={{ position: 'absolute', left: 50, top: 44, fontFamily: F, fontWeight: 800, fontSize: 42, color: P.ink }}>Seu negócio</div>
        <div style={{ position: 'absolute', right: 44, top: 38 }}><Etiqueta t="No ar" icone="raio" tam={28} /></div>
        <svg style={{ position: 'absolute', left: 0, top: 30 }} width={920} height={420}>
          <path d={A} fill="none" stroke={P.linha} strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" />
          <path d={A} fill="none" stroke={P.el} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${arco} 1`} />
          <circle cx={bx} cy={by} r={16} fill={P.el} /><circle cx={bx} cy={by} r={6} fill="#fff" />
          <circle cx={120} cy={300} r={10} fill={P.ink} />
        </svg>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 440, height: 6, borderRadius: 9, background: P.linha }}>
          <div style={{ height: 6, borderRadius: 9, background: P.el, width: `${lerp(f, 20, 80, 0, 100)}%` }} />
        </div>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 388, display: 'flex', justifyContent: 'space-between' }}>
          {ETAPAS.map(([n, t], i) => {
            const on = f >= 22 + i * 18;
            const s = molaViva(f, 22 + i * 18);
            return (
              <div key={i} style={{ width: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 110, height: 110, borderRadius: 999, background: on ? P.el : '#fff', border: `4px solid ${on ? P.el : P.linha}`, display: 'grid', placeItems: 'center', transform: `scale(${on ? 0.85 + 0.15 * s : 0.85})` }}>
                  <Icone n={n} tam={54} cor={on ? '#fff' : P.fg3} traco={2} />
                </div>
                <div style={{ fontFamily: F, fontWeight: 700, fontSize: 32, color: on ? P.ink : P.fg3 }}>{t}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ position: 'absolute', top: 1290, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', padding: '0 80px' }}>
        {['Artes e Reels', 'Página da bio', 'Perfil no Google', 'WhatsApp'].map((t, i) => (
          <Surge key={t} ini={40 + i * 6} fim={fim} dy={30}><Etiqueta t={t} tam={30} fundo="#fff" cor={P.ink} style={{ boxShadow: '0 12px 30px -14px rgba(76,22,120,.35)' }} /></Surge>
        ))}
      </div>
    </AbsoluteFill>
  );
};
