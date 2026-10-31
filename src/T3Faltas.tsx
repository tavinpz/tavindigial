// T3 — "Volta 24 horas": a semana com 5 faltas rebobina; a Thata confirma, remarca e preenche; a agenda vira um check.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Mono, Bolha, Digitando, Fecho, Surge, Icone, lerp, saida, mola, molaViva, chaves , usaTema } from './kit';

export const DUR_T3 = 660;
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORAS = ['08h', '09h', '10h', '11h', '13h', '14h', '15h', '16h'];
const GX = 70, GY = 360, GW = 940, CX = 96, CW = (GW - 40 - CX) / 6, CH = 86;
const INIC = 'AMRJCLPBTSDHNKVGOIEF';
const RISCO: { c: number; r: number; nome: string; falta: number; ok: number }[] = [
  { c: 0, r: 1, nome: 'Carla M.', falta: 70, ok: 282 },
  { c: 3, r: 4, nome: 'Júlia R.', falta: 80, ok: 360 },
  { c: 0, r: 6, nome: 'Igor S.', falta: 90, ok: 398 },
  { c: 4, r: 2, nome: 'Renato O.', falta: 100, ok: 406 },
  { c: 5, r: 5, nome: 'Paula G.', falta: 110, ok: 414 },
];
const CHECK = new Set(['0,3', '0,4', '1,5', '1,4', '2,6', '2,5', '3,4', '3,5', '4,3', '4,2', '5,1', '5,0']);

const Celula: React.FC<{ c: number; r: number }> = ({ c, r }) => {
  const f = useCurrentFrame();
  const risco = RISCO.find((x) => x.c === c && x.r === r);
  const ini = INIC[(c * 7 + r * 3) % INIC.length] + INIC[(c * 3 + r * 5 + 4) % INIC.length];
  const entra = mola(f, 12 + c * 2 + r * 1.5, { damping: 16, stiffness: 160, mass: 0.6 });
  let fundo = '#E9EFEC', cor = C.fg2, borda = 'transparent', txt = ini, icone: string | null = null;
  if (risco) {
    const faltou = f >= risco.falta && f < 176;
    const emRisco = f >= 176 && f < risco.ok;
    if (faltou) { fundo = C.alertaSuave; cor = C.alerta; borda = C.alerta; txt = ''; icone = 'x'; }
    if (emRisco) { borda = C.ambar; fundo = C.ambarSuave; cor = C.ambar; }
    if (f >= risco.ok) { fundo = C.verde; cor = '#fff'; icone = 'ok'; txt = ''; }
  }
  // espera: a vaga da Júlia (remarcada) recebe alguém da lista de espera
  if (c === 3 && r === 4 && f >= 360 && f < 384) { fundo = '#fff'; borda = C.linha2; cor = C.fg3; txt = 'livre'; icone = null; }
  if (c === 3 && r === 4 && f >= 384) { fundo = C.verde; cor = '#fff'; txt = 'BK'; icone = null; }
  if (c === 4 && r === 6 && f >= 360) { fundo = C.verde; cor = '#fff'; txt = 'JR'; }
  // todo o resto confirma em cascata
  const cascata = 424 + (c + r) * 2;
  if (!risco && f >= cascata) { fundo = C.menta; cor = C.prof; }
  // o check
  const tChk = 486 + (CHECK.has(`${c},${r}`) ? c * 3 : 0);
  const chk = CHECK.has(`${c},${r}`);
  if (f >= 470) { fundo = chk && f >= tChk ? C.verde : '#E3F1EA'; cor = chk ? '#fff' : 'transparent'; borda = 'transparent'; icone = null; txt = chk ? '' : ''; }
  const pulso = risco && f >= risco.ok && f < risco.ok + 12 ? 1 + 0.12 * Math.sin(((f - risco.ok) / 12) * Math.PI) : 1;
  const pChk = chk && f >= tChk ? molaViva(f, tChk) : 1;
  return (
    <div style={{ position: 'absolute', left: GX + 20 + CX + c * CW + 5, top: GY + 120 + r * CH + 5, width: CW - 10, height: CH - 10, borderRadius: 16, background: fundo, border: `3px solid ${borda}`, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 26, color: cor, transform: `scale(${entra * pulso * (f >= 470 && chk ? 0.85 + 0.15 * pChk : 1)})`, opacity: entra }}>
      {icone ? <Icone n={icone} tam={34} cor={cor} traco={3} /> : txt}
    </div>
  );
};

const Conversa: React.FC<{ ini: number; fim: number; nome: string; msgs: [string, number, boolean][] }> = ({ ini, fim, nome, msgs }) => {
  const f = useCurrentFrame();
  if (f < ini - 2 || f > fim + 2) return null;
  const s = mola(f, ini); const o = Math.min(1, s * 2) * saida(f, fim, 10);
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 1250, opacity: o, transform: `translateY(${(1 - s) * 60}px)` }}>
      <div style={{ background: '#fff', borderRadius: 40, padding: '28px 30px 32px', boxShadow: '0 40px 80px -36px rgba(11,20,17,.4)', border: `1.5px solid ${C.linha}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: G, fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: '-0.02em', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 99, background: C.menta, display: 'grid', placeItems: 'center', color: C.verde }}>{nome[0]}</div>{nome}
          <span style={{ marginLeft: 'auto', fontFamily: M, fontWeight: 400, fontSize: 22, color: C.fg3 }}>WhatsApp</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {msgs.map(([t, i, eu], k) => (
            <React.Fragment key={k}>
              {eu && <Digitando ini={i - 16} fim={i} eu tam={26} />}
              <Bolha t={t} ini={i} eu={eu} ia={eu && k === 0} tam={30} max={700} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export const T3: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const reb = f >= 150 && f < 214;
  const treme = reb ? Math.sin(f * 2.1) * lerp(f, 150, 170, 0, 6) * saida(f, 210, 20) : 0;
  const zoom = chaves(f, [[0, 1.08], [40, 1], [460, 1], [520, 1.06]]);
  const cardY = chaves(f, [[440, 0], [480, 160]]);
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 760], [470, 760], [520, 960]])} brilho={0.8} />
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${treme}px, ${cardY}px)` }}>
        {/* agenda da semana */}
        <div style={{ position: 'absolute', left: GX, top: GY, width: GW, height: 120 + CH * 8 + 30, borderRadius: 44, background: '#fff', boxShadow: '0 50px 100px -50px rgba(11,20,17,.4)', border: `1.5px solid ${C.linha}`, opacity: mola(f, 0) }}>
          <div style={{ position: 'absolute', left: 32, top: 26, fontFamily: G, fontWeight: 600, fontSize: 34, letterSpacing: '-0.03em', color: C.ink }}>Agenda · semana 46</div>
          <div style={{ position: 'absolute', right: 32, top: 30, fontFamily: M, fontSize: 26, color: reb ? C.ambar : f >= 214 ? C.prof : C.fg2 }}>
            {f < 150 ? 'sex · 18:00' : `${['sex', 'qui', 'qua', 'ter', 'seg', 'dom'][Math.round(lerp(f, 152, 206, 0, 5))]} · 18:00`}
          </div>
          {DIAS.map((d, i) => <div key={d} style={{ position: 'absolute', left: 20 + CX + i * CW, width: CW, top: 80, textAlign: 'center', fontFamily: M, fontSize: 22, color: C.fg3 }}>{d}</div>)}
          {HORAS.map((h, i) => <div key={h} style={{ position: 'absolute', left: 28, top: 120 + i * CH + 28, fontFamily: M, fontSize: 22, color: C.fg3 }}>{h}</div>)}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          {DIAS.map((_, c) => HORAS.map((__, r) => <Celula key={`${c}${r}`} c={c} r={r} />))}
        </div>
        {/* rebobinar: linhas de varredura */}
        {reb && <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(11,20,17,.05) 0 3px, transparent 3px 9px)', backgroundPosition: `0 ${f * 14}px`, opacity: Math.min(lerp(f, 150, 158, 0, 1), saida(f, 214, 10)) }} />}
      </AbsoluteFill>
      {reb && (
        <div style={{ position: 'absolute', top: 1320, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 120, color: C.ambar, letterSpacing: '-0.05em', opacity: saida(f, 214, 10) }}>
          <svg width={150} height={100} viewBox="0 0 30 20"><path d="M14 2 L2 10 L14 18 Z M28 2 L16 10 L28 18 Z" fill={C.ambar} /></svg>5 dias
        </div>
      )}

      <Conversa ini={222} fim={294} nome="Carla M." msgs={[['Oi, Carla! Confirmando sua consulta de amanhã, segunda, às 9h. Tudo certo?', 238, true], ['Tudo certo, vou sim!', 266, false]]} />
      <Conversa ini={298} fim={374} nome="Júlia R." msgs={[['Oi, Júlia! Sua consulta é quinta às 13h. Confirmo pra você?', 312, true], ['Não vou conseguir, surgiu um imprevisto.', 334, false], ['Sem problema! Remarquei pra sexta às 15h.', 356, true]]} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center' }}>
        <Surge ini={380} fim={436} dy={50}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '24px 36px', borderRadius: 999, background: '#fff', border: `1.5px solid ${C.linha}`, boxShadow: '0 30px 60px -30px rgba(11,20,17,.4)', fontFamily: G, fontWeight: 600, fontSize: 36, color: C.ink, letterSpacing: '-0.02em' }}>
            <Icone n="pessoa" tam={40} cor={C.verde} /> Bruno K., da lista de espera, ficou com a vaga
          </div>
        </Surge>
      </div>

      {/* textos */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t={'Sexta, 18h.\n*5 pacientes faltaram.*'} ini={20} fim={146} tam={72} acento={C.alerta} />
      </div>
      <div style={{ position: 'absolute', top: 1240, left: 0, right: 0 }}>
        <Titulo t={'Cada falta é uma\ncadeira vazia.'} ini={96} fim={146} tam={64} peso={500} cor={C.fg2} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="Agora volta *a semana.*" ini={154} fim={212} tam={72} acento={C.ambar} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="A Thata confirma *um por um.*" ini={222} fim={296} tam={64} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="Quem não pode, *remarca na hora.*" ini={300} fim={376} tam={64} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="E a vaga não fica vazia." ini={380} fim={440} tam={64} />
      </div>
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <Titulo t={'Mesma semana.\n*Zero cadeira vazia.*'} ini={448} fim={584} tam={80} />
      </div>
      <div style={{ position: 'absolute', top: 1600, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        {f >= 500 && <Mono t="confirmações automáticas · 24h e 4h antes" ini={506} fim={584} tam={30} cor={C.prof} />}
      </div>
      {f >= 578 && <div style={{ position: 'absolute', inset: 0, opacity: lerp(f, 578, 590, 0, 1) }}><Fecho ini={584} frase={'Cadeira vazia vira\n*consulta confirmada.*'} /></div>}
    </AbsoluteFill>
  );
};
