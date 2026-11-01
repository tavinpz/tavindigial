// P3 (claro) — "Enquanto você cuida": comercial de produto com objetos 3D flutuando, celular com notificações,
// lista de verbos, três telas de bloqueio (manhã/noite/manhã), gráfico subindo e fecho em verde cheio.
// Referência: comercial estilo banco digital (cor cheia na abertura e no fim, objetos de vidro, número contando).
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Obj3D, NumGrande, Icone, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_P3 = 620;

const Notif: React.FC<{ t: string; s: string; ini: number; fim?: number; x: number; y: number; w?: number }> = ({ t, s, ini, fim, x, y, w = 470 }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const p = molaViva(f, ini);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, padding: '20px 24px', borderRadius: 26, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(10px)', boxShadow: '0 24px 50px -24px rgba(11,20,17,.4)', border: `1.5px solid ${C.linha}`, display: 'flex', gap: 16, alignItems: 'center', opacity: Math.min(1, p * 2) * saida(f, fim, 8), transform: `translateX(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})`, zIndex: 30 }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: C.verde, display: 'grid', placeItems: 'center', flex: 'none' }}><Icone n="ok" tam={30} cor="#fff" traco={2.6} /></div>
      <div><div style={{ fontFamily: G, fontWeight: 600, fontSize: 28, color: C.ink, letterSpacing: '-0.02em' }}>{t}</div><div style={{ fontFamily: G, fontWeight: 500, fontSize: 22, color: C.fg2 }}>{s}</div></div>
    </div>
  );
};

const Bloqueio: React.FC<{ hora: string; dia: string; noite?: boolean; msg: string; ini: number; x: number; s?: number }> = ({ hora, dia, noite, msg, ini, x, s = 1 }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const p = mola(f, ini);
  const W = 400 * s, H = 820 * s;
  return (
    <div style={{ position: 'absolute', left: x - W / 2, top: 600 + (1 - p) * 200, width: W, height: H, borderRadius: 64 * s, padding: 12 * s, background: noite ? '#0B1411' : '#FBFDFC', boxShadow: '0 50px 100px -40px rgba(11,20,17,.55)', opacity: Math.min(1, p * 2) }}>
      <div style={{ position: 'absolute', inset: 12 * s, borderRadius: 54 * s, overflow: 'hidden', background: noite ? 'linear-gradient(180deg,#0E2A1E,#06100C)' : 'linear-gradient(180deg,#DDF6E8,#A9E9C6)' }}>
        <div style={{ position: 'absolute', top: 16 * s, left: '50%', width: 110 * s, height: 30 * s, marginLeft: -55 * s, borderRadius: 99, background: '#05090A' }} />
        <div style={{ position: 'absolute', top: 100 * s, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 500, fontSize: 22 * s, color: noite ? '#8FA29A' : '#0B7A47' }}>{dia}</div>
        <div style={{ position: 'absolute', top: 130 * s, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 600, fontSize: 104 * s, letterSpacing: '-0.05em', color: noite ? '#EEF4F1' : '#0B1411' }}>{hora}</div>
        <div style={{ position: 'absolute', left: 16 * s, right: 16 * s, top: 300 * s, padding: `${16 * s}px ${18 * s}px`, borderRadius: 24 * s, background: noite ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.75)', transform: `scale(${molaViva(f, ini + 10)})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 * s, fontFamily: G, fontWeight: 600, fontSize: 18 * s, color: noite ? '#EEF4F1' : '#0B1411' }}>
            <div style={{ width: 22 * s, height: 22 * s, borderRadius: 7 * s, background: C.verde }} /> Thata · agora
          </div>
          <div style={{ fontFamily: G, fontWeight: 500, fontSize: 20 * s, lineHeight: 1.3, marginTop: 6 * s, color: noite ? '#CBD8D2' : '#27342F' }}>{msg}</div>
        </div>
      </div>
    </div>
  );
};

export const P3: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const abre = lerp(f, 56, 76, 0, 1, Easing.bezier(0.7, 0, 0.3, 1)); // verde → branco (círculo que abre)
  const fecha = lerp(f, 530, 552, 0, 1, Easing.bezier(0.7, 0, 0.3, 1)); // branco → verde
  const VERBOS = ['Atende', 'Agenda', 'Confirma', 'Reativa'];
  const ativo = Math.min(3, Math.max(0, Math.floor((f - 186) / 20)));
  const barras = [22, 30, 28, 41, 47, 55, 62, 74, 81, 96];
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[80, 900], [300, 1000]])} />

      {/* 2. celular + objetos + notificações */}
      <AbsoluteFill style={{ opacity: saida(f, 176, 12) }}>
        <div style={{ position: 'absolute', left: 120, top: 620, width: 400, height: 820, borderRadius: 64, background: '#FBFDFC', boxShadow: '0 60px 120px -50px rgba(11,20,17,.55)', padding: 12, transform: `perspective(1600px) rotateY(${18 - mola(f, 70) * 8}deg) rotateX(6deg) translateY(${(1 - mola(f, 70)) * 400}px)` }}>
          <div style={{ position: 'absolute', inset: 12, borderRadius: 54, background: '#fff', overflow: 'hidden', padding: '70px 22px' }}>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: '-0.03em' }}>Hoje</div>
            {[['Ana L. · qui 10h', 'consulta marcada'], ['Pedro A. · confirmou', 'amanhã 9h'], ['Júlia R. · remarcou', 'sexta 15h'], ['Carlos M. · encaixe', 'seg 8h15']].map(([a, b], i) => (
              <div key={i} style={{ marginTop: 16, padding: '14px 16px', borderRadius: 18, background: f >= 96 + i * 12 ? C.menta : '#F3F6F5', opacity: lerp(f, 90 + i * 12, 100 + i * 12, 0, 1) }}>
                <div style={{ fontFamily: G, fontWeight: 600, fontSize: 21, color: C.ink }}>{a}</div>
                <div style={{ fontFamily: M, fontSize: 16, color: C.prof }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
        <Obj3D x={870} y={560} tam={150} ini={84} icone="agenda" />
        <Obj3D x={130} y={540} tam={110} ini={92} icone="chat" ry={18} />
        <Obj3D x={950} y={1430} tam={130} ini={100} icone="fone" rx={-10} />
        <Notif t="Consulta marcada" s="Ana L. · quinta, 10h" ini={108} x={560} y={760} />
        <Notif t="Confirmação recebida" s="Pedro A. · amanhã, 9h" ini={124} x={560} y={900} />
        <Notif t="Lembrete enviado" s="12 pacientes de amanhã" ini={140} x={560} y={1040} />
      </AbsoluteFill>

      {/* 3. lista de verbos + cartão que muda */}
      <AbsoluteFill style={{ opacity: Math.min(lerp(f, 178, 190, 0, 1), saida(f, 272, 10)) }}>
        <div style={{ position: 'absolute', left: 80, top: 780, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {VERBOS.map((v, i) => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: G, fontWeight: 600, fontSize: 96, letterSpacing: '-0.045em', color: i === ativo ? C.ink : 'rgba(11,20,17,.16)', transform: `translateX(${i === ativo ? 10 : 0}px)` }}>
              <div style={{ width: 16, height: 16, borderRadius: 99, background: i === ativo ? C.verde : 'transparent' }} />{v}
            </div>
          ))}
        </div>
        <div key={ativo} style={{ position: 'absolute', left: 590, top: 1300, width: 420, padding: 28, borderRadius: 32, background: '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 40px 80px -40px rgba(11,20,17,.45)', transform: `scale(${molaViva(f, 186 + ativo * 20)}) rotate(${2 - ativo}deg)` }}>
          <div style={{ fontFamily: M, fontSize: 20, color: C.fg3 }}>{['ligação · 00:48', 'agenda', 'WhatsApp', 'base parada'][ativo]}</div>
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 36, color: C.ink, letterSpacing: '-0.03em', marginTop: 10 }}>{['“Clínica Aurora, aqui é a Thata…”', 'Qui · 10:00 · Avaliação', '“Confirmo sim, até amanhã!”', 'Hugo voltou após 9 meses'][ativo]}</div>
          <div style={{ marginTop: 18, height: 10, borderRadius: 99, background: C.menta }}><div style={{ width: `${lerp(f, 186 + ativo * 20, 204 + ativo * 20, 0, 100)}%`, height: '100%', borderRadius: 99, background: C.verde }} /></div>
        </div>
      </AbsoluteFill>

      {/* 4. três telas de bloqueio */}
      <AbsoluteFill style={{ opacity: Math.min(lerp(f, 270, 280, 0, 1), saida(f, 368, 10)) }}>
        <Bloqueio hora="09:41" dia="terça, 4 de novembro" msg="Ana marcou avaliação pra quinta, 10h." ini={276} x={225} s={0.9} />
        <Bloqueio hora="23:14" dia="terça, 4 de novembro" noite msg="Encaixe reservado pra amanhã, 8h15." ini={292} x={540} s={1.08} />
        <Bloqueio hora="10:30" dia="sábado, 8 de novembro" msg="Hugo voltou: limpeza na segunda, 9h." ini={308} x={855} s={0.9} />
      </AbsoluteFill>

      {/* 5. gráfico */}
      <AbsoluteFill style={{ opacity: Math.min(lerp(f, 366, 378, 0, 1), saida(f, 452, 10)) }}>
        <div style={{ position: 'absolute', left: 90, top: 560, display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <NumGrande de={0} ate={128} ini={372} dur={50} tam={190} />
          <div style={{ fontFamily: G, fontWeight: 500, fontSize: 40, color: C.fg2 }}>consultas no mês</div>
        </div>
        <div style={{ position: 'absolute', left: 90, right: 90, top: 820, height: 560, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {barras.map((b, i) => (
            <div key={i} style={{ flex: 1, height: `${b * lerp(f, 376 + i * 3, 406 + i * 3, 0, 1, Easing.bezier(0.2, 0.8, 0.2, 1))}%`, borderRadius: 14, background: `linear-gradient(180deg, ${C.vivo}, ${C.verde} 60%, #DDF6E8)` }} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 90, top: 1400, fontFamily: M, fontSize: 24, color: C.fg3 }}>exemplo ilustrativo · clínica fictícia</div>
      </AbsoluteFill>

      {/* 6. enquanto você cuida… */}
      <AbsoluteFill style={{ opacity: Math.min(lerp(f, 452, 462, 0, 1), 1) }}>
        <div style={{ position: 'absolute', top: 820, left: 0, right: 0 }}>
          <Titulo t={'Enquanto você cuida\ndos *pacientes,*'} ini={456} tam={86} />
        </div>
        {[['Paciente na cadeira', 160, 640], ['Cirurgia às 9h', 640, 600], ['Café com a equipe', 560, 1180], ['Reunião com o protético', 120, 1220]].map(([t, x, y], i) => (
          <div key={t as string} style={{ position: 'absolute', left: x as number, top: y as number, padding: '14px 22px', borderRadius: 99, background: '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 16px 30px -16px rgba(11,20,17,.35)', fontFamily: G, fontWeight: 500, fontSize: 28, color: C.fg, transform: `scale(${molaViva(f, 470 + i * 6)}) translateY(${Math.sin((f + i * 20) / 20) * 8}px)`, opacity: f >= 470 + i * 6 ? 1 : 0 }}>{t}</div>
        ))}
        <div style={{ position: 'absolute', top: 1020, left: 0, right: 0 }}>
          <Titulo t="a Thata *cuida da agenda.*" ini={500} tam={64} peso={500} cor={C.fg2} acento={C.verde} />
        </div>
      </AbsoluteFill>

      {/* 1. abertura em verde cheio, que abre num círculo */}
      {f < 78 && (
        <AbsoluteFill style={{ background: C.verde, clipPath: `circle(${(1 - abre) * 150}% at 50% 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}>
          <div style={{ textAlign: 'center' }}>
            <Titulo t={'Sua recepção\n*trabalhou o dia todo.*'} ini={4} tam={100} cor="#fff" acento="#06100C" />
          </div>
        </AbsoluteFill>
      )}
      {/* 7. fecho em verde cheio */}
      {f >= 530 && (
        <AbsoluteFill style={{ background: C.verde, clipPath: `circle(${fecha * 150}% at 50% 55%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, zIndex: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: G, fontWeight: 500, fontSize: 150, letterSpacing: '-0.05em', color: '#fff', transform: `scale(${0.8 + 0.2 * mola(f, 544)})` }}>
            <div style={{ width: 62, height: 62, borderRadius: 99, background: '#fff', boxShadow: `0 0 0 ${16 + Math.sin(f / 6) * 4}px rgba(255,255,255,.25)` }} />thata
          </div>
          <Surge ini={562}><div style={{ fontFamily: G, fontWeight: 500, fontSize: 42, color: '#fff', textAlign: 'center' }}>IA de voz e WhatsApp para clínicas</div><div style={{ fontFamily: M, fontSize: 36, color: 'rgba(255,255,255,.8)', textAlign: 'center', marginTop: 16 }}>thata.online</div></Surge>
        </AbsoluteFill>
      )}

      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t="Ela marcou, confirmou e lembrou." ini={84} fim={176} tam={58} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t="Pelo telefone e pelo WhatsApp." ini={186} fim={272} tam={58} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t="De manhã, de noite, no sábado." ini={276} fim={368} tam={58} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t="E a agenda *só cresce.*" ini={372} fim={452} tam={64} />
      </div>
    </AbsoluteFill>
  );
};
