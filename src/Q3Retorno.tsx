// Q3 (claro) — "Seis meses depois": "volte em 6 meses" e o calendário vira página por página; ninguém lembrou.
// A Thata passa a base inteira (scanner verde), manda a mensagem certa e os pacientes voltam para a agenda.
// Padrões de estúdio: flip de calendário em 3D, número grande com desfoque, scanner de luz, profundidade (lista recua e a conversa vem para a frente).
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Legenda, Fantasma, NumGrande, Titulo, Mono, Bolha, Obj3D, Fecho, sombra, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_Q3 = 600;
const MESES = ['ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO'];
const flip = (k: number) => 72 + k * 17;
// pacientes fictícios
const BASE = ['Carla M.', 'Rafael S.', 'Juliana T.', 'Marcos V.', 'Patrícia L.', 'Renato G.', 'Sofia B.', 'Thiago R.', 'Vanessa C.', 'Lucas F.'];
const VOLTOU = [0, 2, 3, 5, 7, 8];
const LY = 520, LDY = 92;
const passa = (i: number) => 252 + ((i + 0.5) / BASE.length) * 70;

const Pagina: React.FC<{ m: number; rot?: number; z?: number }> = ({ m, rot = 0, z = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `rotateX(${rot}deg)`, backfaceVisibility: 'hidden', zIndex: z, borderRadius: 40, overflow: 'hidden', background: '#fff', boxShadow: rot ? '0 40px 60px -30px rgba(11,20,17,.5)' : sombra, border: `1.5px solid ${C.linha}` }}>
    <div style={{ height: 150, background: m === 6 ? C.ink : C.verde, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 64, letterSpacing: '0.04em', color: '#fff' }}>{MESES[m]}</div>
    <div style={{ display: 'grid', placeItems: 'center', height: 400 }}>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 260, letterSpacing: '-0.06em', color: C.ink, lineHeight: 1 }}>14</div>
      <div style={{ fontFamily: M, fontSize: 30, color: C.fg2, marginTop: -40 }}>{m === 0 ? 'limpeza feita ✓' : m === 6 ? 'era o retorno' : ''}</div>
    </div>
  </div>
);

const Linha: React.FC<{ i: number; nitida: number }> = ({ i, nitida }) => {
  const f = useCurrentFrame();
  const ent = mola(f, 236 + i * 2.5, { damping: 18, stiffness: 160, mass: 0.6 });
  const enviada = f >= passa(i);
  const k = VOLTOU.indexOf(i);
  const voltou = k >= 0 && f >= 414 + k * 8;
  return (
    <div style={{ position: 'absolute', left: 120, top: LY + i * LDY, width: 840, height: LDY - 14, borderRadius: 20, background: voltou ? C.menta : '#fff', border: `1.5px solid ${voltou ? 'rgba(21,167,99,.45)' : C.linha}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', opacity: Math.min(1, ent * 2) * (0.55 + 0.45 * nitida), transform: `translateY(${(1 - ent) * 40}px)` }}>
      <div style={{ width: 46, height: 46, borderRadius: 99, background: voltou ? C.verde : '#E8EDEA', color: voltou ? '#fff' : C.fg2, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 22 }}>{BASE[i][0]}</div>
      <span style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink, letterSpacing: '-0.02em', flex: 1 }}>{BASE[i]}</span>
      {voltou
        ? <span style={{ fontFamily: M, fontSize: 24, color: C.prof, transform: `scale(${molaViva(f, 414 + k * 8)})` }}>agendou ✓</span>
        : enviada ? <span style={{ fontFamily: M, fontSize: 24, color: C.verde }}>mensagem enviada</span>
          : <span style={{ fontFamily: M, fontSize: 24, color: C.fg3 }}>última visita: abril</span>}
    </div>
  );
};

export const Q3: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const kAtual = MESES.findIndex((_, k) => f < flip(k) + 17);
  const k = kAtual < 0 ? MESES.length - 1 : Math.min(kAtual, MESES.length - 1);
  const rot = k < MESES.length - 1 ? lerp(f, flip(k), flip(k) + 15, 0, -105, Easing.bezier(0.55, 0, 0.35, 1)) : 0;
  const cal = mola(f, 50, { damping: 15, stiffness: 120, mass: 0.9 });
  const calSai = lerp(f, 198, 216, 0, 1, Easing.bezier(0.6, 0, 0.9, 0.5));
  const listaOn = f >= 234 && f < 488;
  // a conversa vem para a frente; a lista recua
  const frente = Math.min(lerp(f, 322, 340, 0, 1), lerp(f, 398, 414, 1, 0));
  const scanY = lerp(f, 252, 322, LY - 30, LY + BASE.length * LDY, (x) => x);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [250, 600], [330, 1300], [420, 900]])} />
      <Fantasma t="DEPOIS" ini={60} fim={232} y={1420} tam={360} />
      <Fantasma t="DE VOLTA" ini={250} fim={488} y={1500} tam={330} vel={1.5} />

      {/* abertura */}
      {f < 70 && (
        <>
          <Obj3D x={540} y={600} tam={230} ini={2} fim={68} icone="ok" />
          <div style={{ position: 'absolute', top: 860, left: 60, right: 60, opacity: saida(f, 68, 8) }}>
            <Mono t="limpeza concluída · 14 de abril" ini={6} tam={32} style={{ textAlign: 'center' }} />
            <div style={{ height: 30 }} />
            <Titulo t={'Volte em *6 meses.*'} ini={16} tam={120} />
          </div>
        </>
      )}

      {/* calendário que vira */}
      {f >= 50 && f < 234 && (
        <div style={{ position: 'absolute', left: 260, top: 420, width: 560, height: 560, perspective: 1600, transform: `translate(${-calSai * 1300}px, ${(1 - cal) * 300}px) rotate(${calSai * -14}deg)`, opacity: Math.min(1, cal * 2) }}>
          {k + 1 < MESES.length && <Pagina m={k + 1} z={1} />}
          <Pagina m={k} rot={rot} z={2} />
          <div style={{ position: 'absolute', top: -26, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', zIndex: 3 }}>
            {[0, 1].map((x) => <div key={x} style={{ width: 22, height: 60, borderRadius: 11, background: C.ink }} />)}
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(lerp(f, 74, 86, 0, 1), saida(f, 206, 8)) }}>
        <NumGrande de={0} ate={183} ini={76} dur={120} tam={170} pos=" dias" />
        <div style={{ fontFamily: M, fontSize: 28, color: C.fg2, marginTop: 4 }}>desde a última limpeza</div>
      </div>

      <div style={{ position: 'absolute', top: 260, left: 60, right: 60 }}>
        <Titulo t={'E ninguém *lembrou.*'} ini={218} fim={300} tam={90} />
      </div>
      <div style={{ position: 'absolute', top: 260, left: 60, right: 60 }}>
        <Titulo t={'A Thata *lembrou.*'} ini={304} fim={402} tam={90} />
      </div>
      <div style={{ position: 'absolute', top: 260, left: 60, right: 60 }}>
        <Titulo t={'A base *vira agenda.*'} ini={408} fim={486} tam={90} />
      </div>

      {/* a base de pacientes */}
      {listaOn && (
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 - frente * 0.08})`, transformOrigin: '540px 980px', filter: frente > 0.02 ? `blur(${frente * 7}px)` : undefined, opacity: saida(f, 488, 10) }}>
          <div style={{ position: 'absolute', left: 124, top: LY - 56, fontFamily: M, fontSize: 26, color: C.fg2, opacity: lerp(f, 236, 246, 0, 1) }}>pacientes com retorno vencido</div>
          {BASE.map((_, i) => <Linha key={i} i={i} nitida={f >= passa(i) ? 1 : 0} />)}
          {f >= 250 && f < 330 && (
            <div style={{ position: 'absolute', left: 90, width: 900, top: scanY, height: 6, borderRadius: 6, background: C.vivo, boxShadow: `0 0 30px 8px rgba(27,195,113,.45)`, opacity: Math.min(lerp(f, 250, 256, 0, 1), lerp(f, 320, 330, 1, 0)) }}>
              <div style={{ position: 'absolute', right: -14, top: -14, width: 34, height: 34, borderRadius: 99, background: C.verde, boxShadow: '0 0 0 8px rgba(21,167,99,.2)' }} />
            </div>
          )}
          <div style={{ position: 'absolute', top: LY + BASE.length * LDY + 10, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 26, color: C.prof, opacity: Math.min(lerp(f, 424, 434, 0, 1), saida(f, 486, 8)) }}>
            {VOLTOU.filter((_, j) => f >= 414 + j * 8).length} de 10 voltaram · exemplo ilustrativo
          </div>
        </div>
      )}

      {/* a conversa na frente */}
      {frente > 0.01 && (
        <div style={{ position: 'absolute', left: 130, width: 820, top: 560, padding: '34px 30px', borderRadius: 40, background: '#fff', boxShadow: '0 60px 120px -40px rgba(11,20,17,.5)', border: `1.5px solid ${C.linha}`, opacity: frente, transform: `translateY(${(1 - frente) * 80}px) scale(${0.94 + 0.06 * frente})`, display: 'flex', flexDirection: 'column', gap: 16, zIndex: 50 }}>
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 34, color: C.ink, letterSpacing: '-0.02em', marginBottom: 6 }}>Carla M. <span style={{ fontFamily: M, fontWeight: 400, fontSize: 22, color: C.verde }}>WhatsApp</span></div>
          <Bolha t="Oi, Carla! Já faz 6 meses da sua limpeza 🙂 Quer que eu reserve um horário essa semana?" ini={330} eu ia tam={34} max={700} />
          <Bolha t="Nossa, verdade! Quinta de manhã dá?" ini={352} tam={34} max={640} />
          <Bolha t="Dá sim! Quinta 9h reservado pra você ✓" ini={370} eu ia tam={34} max={640} />
        </div>
      )}

      <Legenda frases={[
        [70, 214, 'o paciente sai com o retorno combinado e o tempo passa'],
        [252, 322, 'A Thata passa pela base inteira'],
        [326, 404, 'e manda a mensagem certa para cada um'],
        [408, 486, 'quem tinha sumido volta para a agenda'],
      ]} y={1640} />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Ela lembra.\n*O paciente volta.*'} /></div>}
    </AbsoluteFill>
  );
};
