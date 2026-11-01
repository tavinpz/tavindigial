// Q4 (claro) — "Com as luvas": no meio do procedimento o celular toca e ninguém pode atender (mão na luva).
// Rebobina: o mesmo toque, agora a Thata atende, conversa com legenda ao vivo e marca a avaliação, enquanto o procedimento segue.
// Padrões de estúdio: repetição com variação (antes/depois no mesmo plano), rebobinar com glitch, legenda ao vivo dentro da tela, objeto que sai da tela para o mundo.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Legenda, Fantasma, Titulo, Fone, Onda, Ponto, Icone, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_Q4 = 600;
const TOCA1 = 64, PERDE = 176, REB0 = 192, REB1 = 224, TOCA2 = 226, ATENDE = 248;

const Luva: React.FC<{ x: number; y: number; tam: number; rot?: number }> = ({ x, y, tam, rot = 0 }) => (
  <svg viewBox="0 0 200 270" width={tam} height={tam * 1.35} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 30px 30px rgba(11,20,17,.25))', zIndex: 30 }}>
    <defs><linearGradient id="luva" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#C4DBF7" /><stop offset="1" stopColor="#7EA7DD" /></linearGradient></defs>
    {[[42, 34, 100], [72, 14, 118], [102, 10, 122], [132, 28, 104]].map(([fx, fy, h], i) => <rect key={i} x={fx} y={fy} width={28} height={h} rx={14} fill="url(#luva)" />)}
    <rect x={8} y={104} width={34} height={92} rx={17} fill="url(#luva)" transform="rotate(-32 25 150)" />
    <rect x={40} y={96} width={122} height={124} rx={44} fill="url(#luva)" />
    <rect x={50} y={206} width={104} height={56} rx={10} fill="#9DBDE8" />
    <path d="M58 120 C 70 100, 100 96, 120 104" stroke="rgba(255,255,255,.6)" strokeWidth={6} fill="none" strokeLinecap="round" />
  </svg>
);

// a tela do celular: chamada entrando, perdida, ou atendida pela Thata (com legenda ao vivo)
const Tela: React.FC<{ w: number }> = ({ w }) => {
  const f = useCurrentFrame();
  const tw = w * 0.944, th = tw * 2.1;
  const fase = f < PERDE ? 'toca' : f < REB1 ? 'perdida' : f < ATENDE ? 'toca' : 'thata';
  const anel = ((f % 30) / 30);
  const LEG: [number, string, boolean][] = [
    [266, 'Clínica, boa tarde! Aqui é a Thata, assistente virtual.', true],
    [302, 'Queria marcar uma avaliação.', false],
    [330, 'Tenho quarta 9h ou quinta 14h. Qual prefere?', true],
    [358, 'Quarta 9h.', false],
    [378, 'Pronto, agendado ✓ Te mando a confirmação.', true],
  ];
  if (fase === 'thata') {
    const vis = LEG.filter(([t]) => f >= t).slice(-3);
    return (
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.verde}, #0B7A47)`, color: '#fff', fontFamily: G, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${th * 0.09}px ${tw * 0.07}px 0` }}>
        <div style={{ fontFamily: M, fontSize: tw * 0.042, opacity: 0.85 }}>● Thata · IA atendendo</div>
        <div style={{ fontWeight: 600, fontSize: tw * 0.08, letterSpacing: '-0.03em', marginTop: 8 }}>Paciente</div>
        <div style={{ fontFamily: M, fontSize: tw * 0.04, opacity: 0.8, marginTop: 4 }}>{`00:${String(Math.max(0, Math.floor((f - ATENDE) / 30))).padStart(2, '0')}`}</div>
        <div style={{ marginTop: th * 0.04 }}><Onda w={tw * 0.6} h={tw * 0.16} n={22} cor="#fff" nivel={0.9} /></div>
        <div style={{ marginTop: th * 0.05, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vis.map(([t, s, ia]) => (
            <div key={t} style={{ alignSelf: ia ? 'flex-start' : 'flex-end', maxWidth: '88%', padding: '12px 16px', borderRadius: 18, background: ia ? 'rgba(255,255,255,.18)' : '#fff', color: ia ? '#fff' : C.ink, fontWeight: 500, fontSize: tw * 0.062, lineHeight: 1.25, opacity: lerp(f, t, t + 6, 0, 1), transform: `translateY(${(1 - mola(f, t)) * 16}px)` }}>{s}</div>
          ))}
        </div>
      </div>
    );
  }
  const perdida = fase === 'perdida';
  return (
    <div style={{ position: 'absolute', inset: 0, background: perdida ? '#1A1214' : '#0E1A16', color: '#fff', fontFamily: G, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: th * 0.14 }}>
      <div style={{ fontFamily: M, fontSize: tw * 0.045, color: perdida ? '#FF8A8A' : 'rgba(255,255,255,.7)' }}>{perdida ? 'ligação perdida' : 'chamada recebida'}</div>
      <div style={{ fontWeight: 600, fontSize: tw * 0.09, letterSpacing: '-0.03em', marginTop: 10 }}>Paciente</div>
      <div style={{ fontFamily: M, fontSize: tw * 0.045, opacity: 0.6, marginTop: 6 }}>(11) 9 ••••-••••</div>
      {perdida ? (
        <div style={{ marginTop: th * 0.12, display: 'flex', flexDirection: 'column', gap: 12, width: '84%' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ padding: '16px 18px', borderRadius: 18, background: 'rgba(255,107,107,.14)', color: '#FFB3B3', fontSize: tw * 0.048, fontWeight: 500, opacity: lerp(f, PERDE + 4 + i * 5, PERDE + 10 + i * 5, 0, 1) }}>
              <Icone n="fone" tam={tw * 0.05} cor="#FF8A8A" /> Ligação perdida · {['14:02', '14:09', '14:21'][i]}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: 'absolute', bottom: th * 0.1, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
          {['#E5484D', '#1BC371'].map((c, i) => (
            <div key={c} style={{ position: 'relative', width: tw * 0.2, height: tw * 0.2 }}>
              {i === 1 && <div style={{ position: 'absolute', inset: -tw * 0.06 * anel, borderRadius: 99, background: c, opacity: 0.4 * (1 - anel) }} />}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 99, background: c, display: 'grid', placeItems: 'center' }}><Icone n={i ? 'fone' : 'x'} tam={tw * 0.09} cor="#fff" traco={2.4} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Q4: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const W = 480;
  const tocando = (f >= TOCA1 && f < PERDE) || (f >= TOCA2 && f < ATENDE);
  const vib = tocando && Math.floor(f / 3) % 6 < 3 ? Math.sin(f * 2.6) * 7 : 0;
  const foneIn = mola(f, 50, { damping: 16, stiffness: 120, mass: 0.9 });
  const foneOut = lerp(f, 404, 420, 0, 1, Easing.bezier(0.6, 0, 0.9, 0.5));
  const reb = f >= REB0 && f < REB1;
  const glitch = reb ? Math.sin(f * 7.3) * 18 : 0;
  // relógio do procedimento: corre, volta na rebobinada, segue correndo
  const seg = 32 * 60 + 10 + (f < REB0 ? f / 30 : f < REB1 ? lerp(f, REB0, REB1, REB0 / 30, TOCA1 / 30) : TOCA1 / 30 + (f - REB1) / 30);
  const relogio = `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(Math.floor(seg % 60)).padStart(2, '0')}`;
  const luvaY = chaves(f, [[60, 1500], [90, 1130], [150, 1100], [170, 1180], [REB1, 1180], [260, 1250]]);
  const luvaX = 640 + (f >= 110 && f < 170 ? Math.sin((f - 110) / 3) * 10 : 0);
  const pDot = mola(f, ATENDE - 14, { damping: 11, stiffness: 140, mass: 0.7 });
  const agenda = mola(f, 386, { damping: 13, stiffness: 120, mass: 0.8 });
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 500], [ATENDE, 1000], [420, 900]])} brilho={chaves(f, [[0, 0.6], [REB1, 0.5], [ATENDE, 1]])} />
      <Fantasma t="TOCANDO" ini={TOCA1} fim={REB0} y={1480} tam={330} vel={1.8} />
      <Fantasma t="ATENDIDO" ini={ATENDE} fim={486} y={1480} tam={330} />

      {/* abertura: a luz do consultório e a frase */}
      <div style={{ position: 'absolute', left: 540 - 420, top: -360 + (1 - lerp(f, 0, 30, 0, 1)) * -200, width: 840, height: 840, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.95), rgba(255,255,255,.4) 40%, transparent 70%)', opacity: saida(f, 70, 14) }} />
      <div style={{ position: 'absolute', top: 760, left: 60, right: 60, opacity: saida(f, 62, 8) }}>
        <Titulo t={'Mão na *luva.*'} ini={8} tam={150} />
      </div>

      {/* relógio do procedimento (continua em todo o vídeo) */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(lerp(f, 30, 40, 0, 1), saida(f, 420, 8)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderRadius: 999, background: '#fff', boxShadow: '0 20px 40px -24px rgba(11,20,17,.4)', border: `1.5px solid ${C.linha}`, fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink, transform: `translateX(${glitch}px)` }}>
          <span style={{ width: 14, height: 14, borderRadius: 99, background: C.alerta, opacity: Math.floor(f / 15) % 2 ? 1 : 0.4 }} />
          Na cadeira <span style={{ fontFamily: M, fontWeight: 500, color: C.fg2 }}>{relogio}</span>
        </div>
      </div>

      {/* o celular */}
      {f >= 50 && (
        <div style={{ position: 'absolute', left: 540 - W / 2 + vib + glitch - foneOut * 900, top: 330 + (1 - foneIn) * 1300, transform: `rotate(${-4 + vib * 0.3 - foneOut * 20}deg)`, zIndex: 20 }}>
          <Fone w={W}><Tela w={W} /></Fone>
          {tocando && [0, 1].map((k) => {
            const a = ((f + k * 15) % 30) / 30;
            return <div key={k} style={{ position: 'absolute', inset: -40 * a, borderRadius: 80, border: `3px solid ${f >= TOCA2 ? C.verde : C.alerta}`, opacity: 0.5 * (1 - a) }} />;
          })}
        </div>
      )}

      {/* a mão enluvada que não pode atender */}
      {f >= 60 && f < 420 && <Luva x={luvaX} y={luvaY} tam={300} rot={-18} />}
      {f >= 118 && f < 170 && <div style={{ position: 'absolute', left: 70, top: 1330, fontFamily: G, fontWeight: 700, fontSize: 40, color: C.alerta, transform: `rotate(-6deg) scale(${molaViva(f, 118)})`, zIndex: 31 }}>não dá pra atender</div>}

      {/* o ponto da Thata cai no botão verde */}
      {f >= ATENDE - 14 && f < ATENDE + 8 && <Ponto x={540 + 100} y={chaves(f, [[ATENDE - 14, 200], [ATENDE, 1140]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}

      {/* rebobinar */}
      {reb && (
        <AbsoluteFill style={{ zIndex: 60, pointerEvents: 'none' }}>
          {Array.from({ length: 14 }, (_, i) => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: ((i * 137 + f * 41) % 1920), height: 6 + (i % 3) * 8, background: 'rgba(21,167,99,.18)' }} />)}
          <div style={{ position: 'absolute', top: 1380, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '18px 36px', borderRadius: 999, background: C.ink, fontFamily: M, fontSize: 52, color: C.luz }}>◀◀ de novo, com a Thata</div></div>
        </AbsoluteFill>
      )}

      {/* a avaliação sai do celular e vai para a agenda */}
      {f >= 386 && (
        <div style={{ position: 'absolute', left: 140, right: 140, top: 1240 - agenda * 120, opacity: Math.min(1, agenda * 2) * saida(f, 486, 10), transform: `scale(${0.7 + 0.3 * agenda})`, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', borderRadius: 30, background: '#fff', border: `2px solid ${C.verde}`, boxShadow: '0 40px 80px -30px rgba(21,167,99,.5)' }}>
            <div style={{ width: 70, height: 70, borderRadius: 22, background: C.verde, display: 'grid', placeItems: 'center' }}><Icone n="agenda" tam={40} cor="#fff" traco={2.3} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: G, fontWeight: 600, fontSize: 40, color: C.ink, letterSpacing: '-0.03em' }}>Avaliação · qua 9h</div>
              <div style={{ fontFamily: M, fontSize: 24, color: C.verde, marginTop: 4 }}>marcada pela Thata, durante o procedimento</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 360, left: 60, right: 60 }}>
        <Titulo t={'Você não tira *a luva.*'} ini={420} fim={486} tam={96} />
      </div>
      <div style={{ position: 'absolute', top: 1590, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3, opacity: Math.min(lerp(f, 270, 280, 0, 1), saida(f, 486, 8)), zIndex: 41 }}>paciente fictício · a Thata se apresenta como assistente virtual</div>

      <Legenda frases={[
        [64, 176, 'o telefone toca no meio do procedimento'],
        [176, 192, 'e mais uma ligação perdida'],
        [ATENDE, 386, 'A Thata atende, conversa e marca'],
        [386, 486, 'enquanto você segue no paciente'],
      ]} y={1640} />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Você segue no paciente.\n*Ela atende o telefone.*'} /></div>}
    </AbsoluteFill>
  );
};
