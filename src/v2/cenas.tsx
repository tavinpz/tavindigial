// Cenas de motion dos vídeos v2: o problema (ilustrado), a comparação, os benefícios.
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, lerp, mola, saida, Icone, Obj3D, sombra } from '../kit';
import { MetaLogo, WhatsLogo } from './kit2';

const Pop: React.FC<{ ini: number; fim?: number; x: number; y: number; children: React.ReactNode; de?: number; z?: number }> = ({ ini, fim, x, y, children, de = 40, z = 10 }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = mola(f, ini, { damping: 13, stiffness: 160, mass: 0.7 });
  const o = Math.min(1, s * 1.8) * saida(f, fim, 8);
  return <div style={{ position: 'absolute', left: x, top: y, opacity: o, transform: `translateY(${(1 - s) * de}px) scale(${0.85 + 0.15 * s})`, zIndex: z }}>{children}</div>;
};
const Balao: React.FC<{ t: string; hora?: string; w?: number; eu?: boolean; apagado?: boolean }> = ({ t, hora, w = 620, eu, apagado }) => (
  <div style={{ maxWidth: w, padding: '22px 28px 16px', borderRadius: 30, borderBottomLeftRadius: eu ? 30 : 8, borderBottomRightRadius: eu ? 8 : 30, background: eu ? '#D9FDD3' : '#fff', boxShadow: sombra, border: `1.5px solid ${C.linha}`, fontFamily: G, fontSize: 36, color: apagado ? C.fg3 : C.ink, letterSpacing: '-0.01em' }}>
    {t}{hora && <div style={{ fontFamily: M, fontSize: 22, color: C.fg3, textAlign: 'right', marginTop: 6 }}>{hora}</div>}
  </div>
);
const Badge: React.FC<{ n: number; cor?: string; tam?: number }> = ({ n, cor = '#E5484D', tam = 70 }) => (
  <div style={{ minWidth: tam, height: tam, padding: `0 ${tam * 0.28}px`, borderRadius: 99, background: cor, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 700, fontSize: tam * 0.52, boxShadow: '0 14px 30px -10px rgba(229,72,77,.7)' }}>{n}</div>
);
const conta = (f: number, ini: number, dur: number, ate: number) => Math.round(interpolate(f, [ini, ini + dur], [0, ate], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1) }));

// ── visuais do problema (área ~ y 520..1500) ──
export const Visual: React.FC<{ v: string; ini: number; fim: number; txt?: string[]; num?: number }> = ({ v, ini, fim, txt = [], num = 0 }) => {
  const f = useCurrentFrame();
  const sai = saida(f, fim, 10);
  const wrap = (c: React.ReactNode) => <div style={{ position: 'absolute', inset: 0, opacity: sai }}>{c}</div>;
  if (v === 'mensagens') {
    // mensagens chegando, contador subindo, ninguém responde
    const n = conta(f, ini + 10, 60, num || 23);
    return wrap(<>
      {txt.slice(0, 3).map((t, i) => <Pop key={i} ini={ini + 8 + i * 12} x={70 + (i % 2) * 90} y={660 + i * 200}><Balao t={t} hora={['08:12', '08:40', '09:05', '09:31', '10:02'][i]} /></Pop>)}
      <Pop ini={ini + 14} x={800} y={540}><div style={{ position: 'relative' }}><div style={{ width: 180, height: 180, borderRadius: 50, background: 'linear-gradient(150deg,#3BE07A,#0FA958)', display: 'grid', placeItems: 'center', boxShadow: '0 30px 60px -24px rgba(15,169,88,.7)' }}><Icone n="chat" tam={100} cor="#fff" traco={2} /></div><div style={{ position: 'absolute', right: -24, top: -24 }}><Badge n={n} tam={84} /></div></div></Pop>
      <Pop ini={ini + 50} x={250} y={1500}><div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: M, fontSize: 32, color: '#C2410C' }}><span style={{ transform: `rotate(${(f - ini) * 6}deg)`, display: 'inline-flex' }}><Icone n="relogio" tam={44} cor="#C2410C" /></span>{txt[3] || 'ninguém respondeu ainda'}</div></Pop>
    </>);
  }
  if (v === 'anuncio') {
    // dinheiro entra no anúncio, chegam leads... e de onde veio cada um?
    const moedas = Array.from({ length: 7 }, (_, i) => i);
    return wrap(<>
      <div style={{ position: 'absolute', left: 540 - 160, top: 820 }}><MetaLogo ini={ini + 4} tam={200} /></div>
      {moedas.map((i) => { const t0 = ini + 10 + i * 9; const p = lerp(f, t0, t0 + 34, 0, 1, Easing.bezier(0.5, 0, 0.6, 1)); if (f < t0 || p >= 1) return null;
        return <div key={i} style={{ position: 'absolute', left: 80 + p * 340, top: 900 + Math.sin(p * Math.PI) * -160 + (i % 3) * 30, width: 74, height: 74, borderRadius: 99, background: 'linear-gradient(150deg,#FFD66B,#E9A600)', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 700, fontSize: 30, color: '#6B4A00', opacity: 1 - p * 0.3 }}>R$</div>; })}
      {[0, 1, 2, 3, 4].map((i) => <Pop key={i} ini={ini + 46 + i * 8} x={760 + (i % 2) * 120} y={640 + i * 150}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 86, height: 86, borderRadius: 99, background: C.menta, display: 'grid', placeItems: 'center' }}><Icone n="pessoa" tam={50} cor={C.prof} /></div><span style={{ fontFamily: G, fontWeight: 700, fontSize: 52, color: '#E5484D' }}>?</span></div></Pop>)}
      <Pop ini={ini + 70} x={140} y={1440}><div style={{ fontFamily: M, fontSize: 32, color: C.fg2 }}>qual anúncio trouxe cada paciente?</div></Pop>
    </>);
  }
  if (v === 'ciclo') {
    // anúncio da Meta -> WhatsApp -> a Thata atende e agenda -> o evento volta pra Meta
    const Y = (i: number) => 600 + i * 230;
    const itens: [React.ReactNode, string, string][] = [
      [<MetaLogo ini={ini + 10} tam={62} />, 'Anúncio na Meta', 'Facebook ou Instagram'],
      [<WhatsLogo ini={ini + 26} tam={96} />, 'Chama no WhatsApp', 'a Thata guarda a campanha'],
      [<div style={{ width: 96, height: 96, borderRadius: 28, background: C.menta, display: 'grid', placeItems: 'center' }}><Icone n="agenda" tam={56} cor={C.prof} /></div>, 'A IA atende e agenda', 'na hora, a qualquer hora'],
      [<div style={{ width: 96, height: 96, borderRadius: 28, background: '#E7F1FF', display: 'grid', placeItems: 'center' }}><Icone n="volta" tam={56} cor="#0081FB" /></div>, 'O resultado volta pra Meta', 'lead, agendou, fechou'],
    ];
    const arco = lerp(f, ini + 76, ini + 108, 0, 1, Easing.bezier(0.45, 0, 0.2, 1));
    const dotP = lerp(f, ini + 14, ini + 70, 0, 3);
    const dotY = Y(0) + 85 + dotP * 230;
    return wrap(<>
      <div style={{ position: 'absolute', left: 197, top: Y(0) + 85, width: 6, height: 3 * 230 * lerp(f, ini + 14, ini + 70, 0, 1), borderRadius: 3, background: `linear-gradient(${C.verde}, #0081FB)`, opacity: 0.5 }} />
      {f > ini + 14 && f < ini + 74 && <div style={{ position: 'absolute', left: 186, top: dotY - 14, width: 28, height: 28, borderRadius: 99, background: C.verde, boxShadow: '0 0 0 10px rgba(31,191,98,.18)', zIndex: 20 }} />}
      {itens.map(([ic, t, s], i) => <Pop key={i} ini={ini + 8 + i * 16} x={120} y={Y(i)}>
        <div style={{ width: 760, height: 170, borderRadius: 34, background: '#fff', boxShadow: sombra, border: `1.5px solid ${C.linha}`, display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px' }}>
          <div style={{ width: 120, display: 'grid', placeItems: 'center' }}>{ic}</div>
          <div><div style={{ fontFamily: G, fontWeight: 600, fontSize: 38, color: C.ink, letterSpacing: '-0.02em' }}>{t}</div>
            <div style={{ fontFamily: M, fontSize: 24, color: C.fg3, marginTop: 6 }}>{s}</div></div>
        </div></Pop>)}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
        <path d="M880 1375 C1040 1375 1040 685 880 685" fill="none" stroke="#0081FB" strokeWidth={6} strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - arco)} />
        {arco > 0.97 && <path d="M902 668 L878 685 L902 702" fill="none" stroke="#0081FB" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      <Pop ini={ini + 100} x={60} y={1540}><div style={{ width: 960, textAlign: 'center', fontFamily: M, fontSize: 30, color: '#0064E1' }}>a Meta recebe quem agendou e quem fechou</div></Pop>
    </>);
  }
  if (v === 'planilha') {
    const linhas = txt.length ? txt : ['Ana Beatriz · última visita 2024', 'Bruno Lima · 2023', 'Carla Rocha · 2024', 'Daniel Pires · 2023', 'Eduarda N. · 2024', 'Felipe A. · 2022'];
    return wrap(<Pop ini={ini + 6} x={110} y={560}>
      <div style={{ width: 860, borderRadius: 30, background: '#fff', boxShadow: sombra, border: `1.5px solid ${C.linha}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, padding: '20px 26px', background: '#107C41', color: '#fff', fontFamily: G, fontWeight: 600, fontSize: 30 }}><Icone n="arquivo" tam={36} cor="#fff" />pacientes_antigos.xlsx</div>
        {linhas.map((l, i) => { const apaga = lerp(f, ini + 30 + i * 8, ini + 46 + i * 8, 0, 1);
          return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 26px', borderTop: `1.5px solid ${C.linha}`, fontFamily: G, fontSize: 34, color: C.ink, opacity: 1 - apaga * 0.55, filter: `grayscale(${apaga})` }}>
            <span style={{ fontFamily: M, fontSize: 24, color: C.fg3, width: 36 }}>{i + 2}</span>{l}<span style={{ marginLeft: 'auto', fontFamily: M, fontSize: 24, color: '#C2410C', opacity: apaga }}>parado</span></div>; })}
      </div>
    </Pop>);
  }
  if (v === 'agenda') {
    const dias = ['seg', 'ter', 'qua', 'qui', 'sex'];
    const falta = [1, 4, 7, 10, 13];
    return wrap(<Pop ini={ini + 6} x={110} y={580}>
      <div style={{ width: 860, padding: 30, borderRadius: 34, background: '#fff', boxShadow: sombra, border: `1.5px solid ${C.linha}`, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {dias.map((d) => <div key={d} style={{ fontFamily: M, fontSize: 26, color: C.fg3, textAlign: 'center' }}>{d}</div>)}
        {Array.from({ length: 15 }, (_, i) => { const ruim = falta.includes(i); const p = lerp(f, ini + 30 + falta.indexOf(i) * 7, ini + 40 + falta.indexOf(i) * 7, 0, 1);
          return <div key={i} style={{ height: 150, borderRadius: 20, background: ruim && p > 0 ? `rgba(229,72,77,${0.12 * p})` : C.menta, border: `2px solid ${ruim && p > 0 ? '#E5484D' : 'transparent'}`, display: 'grid', placeItems: 'center' }}>
            {ruim && p > 0 ? <div style={{ transform: `scale(${p})` }}><Icone n="x" tam={60} cor="#E5484D" traco={3} /></div> : <Icone n="pessoa" tam={46} cor={C.prof} />}</div>; })}
      </div>
    </Pop>);
  }
  if (v === 'telefone') {
    const n = conta(f, ini + 10, 50, num || 6);
    return wrap(<>
      <Pop ini={ini + 4} x={380} y={560}><div style={{ position: 'relative', width: 320, height: 320, borderRadius: 999, background: C.menta, display: 'grid', placeItems: 'center' }}>
        <div style={{ transform: `rotate(${Math.sin(f / 2) * 12}deg)` }}><Icone n="fone" tam={150} cor={C.prof} traco={1.8} /></div>
        <div style={{ position: 'absolute', right: 0, top: 0 }}><Badge n={n} tam={90} /></div></div></Pop>
      {(txt.length ? txt : ['Chamada perdida · 08:14', 'Chamada perdida · 09:02', 'Chamada perdida · 11:47']).map((t, i) => <Pop key={i} ini={ini + 30 + i * 12} x={150} y={980 + i * 150}><div style={{ width: 780, display: 'flex', alignItems: 'center', gap: 20, padding: '24px 30px', borderRadius: 26, background: '#fff', boxShadow: sombra, fontFamily: G, fontSize: 34, color: C.ink }}><Icone n="fone" tam={40} cor="#E5484D" />{t}</div></Pop>)}
    </>);
  }
  if (v === 'caderno') {
    const notas = txt.length ? txt : ['Ana ligou?', 'remarcar Bruno', 'Carla: orçamento', 'quem veio ontem?', 'Diego sumiu'];
    return wrap(<>{notas.map((t, i) => <Pop key={i} ini={ini + 6 + i * 9} x={[90, 560, 160, 600, 330][i % 5]} y={[600, 640, 900, 950, 1200][i % 5]}>
      <div style={{ width: 380, padding: '40px 30px', background: ['#FFF3A6', '#FFD9E1', '#D5F5E3', '#FFE7C2', '#DCEBFF'][i % 5], boxShadow: '0 24px 40px -18px rgba(0,0,0,.35)', transform: `rotate(${[-6, 5, 3, -4, 7][i % 5] + Math.sin((f + i * 9) / 18) * 1.5}deg)`, fontFamily: '"Caveat", "Comic Sans MS", cursive', fontSize: 50, color: '#3A3320' }}>{t}</div></Pop>)}</>);
  }
  if (v === 'cadeado') {
    return wrap(<>
      {[0, 1, 2].map((i) => <Pop key={i} ini={ini + 6 + i * 10} x={150 + i * 280} y={640}><div style={{ width: 220, height: 220, borderRadius: 999, background: C.menta, display: 'grid', placeItems: 'center' }}><Icone n="pessoa" tam={120} cor={C.prof} /></div></Pop>)}
      <Pop ini={ini + 40} x={160} y={960}><div style={{ width: 760, display: 'flex', flexWrap: 'wrap', gap: 16 }}>{['Financeiro', 'Campanhas', 'Configurações', 'Assistentes', 'Todos os números', 'Toda a agenda'].map((t, i) => <div key={t} style={{ padding: '16px 26px', borderRadius: 99, background: '#FDECEC', color: '#B42318', fontFamily: G, fontWeight: 600, fontSize: 32, opacity: lerp(f, ini + 44 + i * 5, ini + 52 + i * 5, 0, 1) }}>{t}</div>)}</div></Pop>
      <Pop ini={ini + 76} x={170} y={1300}><div style={{ fontFamily: M, fontSize: 32, color: C.fg2 }}>todo mundo vendo tudo?</div></Pop>
    </>);
  }
  if (v === 'grafico') {
    const alt = [180, 320, 240, 400, 300, 460];
    return wrap(<>
      <Pop ini={ini + 4} x={130} y={620}><div style={{ width: 820, height: 620, borderRadius: 34, background: '#fff', boxShadow: sombra, padding: 40, display: 'flex', alignItems: 'flex-end', gap: 30 }}>
        {alt.map((h, i) => <div key={i} style={{ flex: 1, height: h * lerp(f, ini + 10 + i * 5, ini + 30 + i * 5, 0, 1), borderRadius: 16, background: i % 2 ? C.menta : '#E4EAE7' }} />)}</div></Pop>
      {['curtidas?', 'mensagens?', 'quanto agendou?'].map((t, i) => <Pop key={t} ini={ini + 40 + i * 12} x={[160, 560, 300][i]} y={[560, 700, 860][i]}><div style={{ padding: '18px 30px', borderRadius: 26, background: C.ink, color: '#fff', fontFamily: G, fontWeight: 600, fontSize: 36 }}>{t}</div></Pop>)}
    </>);
  }
  if (v === 'robo') {
    return wrap(<>
      <Pop ini={ini + 6} x={90} y={620}><Balao t={txt[0] || 'Oi! Vocês fazem implante? Quanto fica?'} hora="09:12" /></Pop>
      <Pop ini={ini + 30} x={300} y={860}><Balao eu t={txt[1] || 'Olá! Digite 1 para agendar, 2 para financeiro.'} hora="09:12" /></Pop>
      <Pop ini={ini + 54} x={90} y={1120}><Balao t={txt[2] || '...'} apagado hora="09:13" /></Pop>
      <Pop ini={ini + 70} x={200} y={1360}><div style={{ fontFamily: M, fontSize: 32, color: '#C2410C' }}>robô genérico não conhece a sua clínica</div></Pop>
    </>);
  }
  if (v === 'silencio') {
    const dia = Math.min(3, Math.floor(lerp(f, ini + 30, ini + 80, 0, 3.99)));
    return wrap(<>
      <Pop ini={ini + 6} x={90} y={620}><Balao t={txt[0] || 'Oi, quanto fica a avaliação?'} hora="seg 09:12" /></Pop>
      <Pop ini={ini + 18} x={300} y={860}><Balao eu t={txt[1] || 'Oi! Posso ver um horário pra você?'} hora="seg 09:12" /></Pop>
      <Pop ini={ini + 30} x={110} y={1140}><div style={{ display: 'flex', alignItems: 'center', gap: 22, fontFamily: G, fontWeight: 600, fontSize: 60, color: C.ink }}><Icone n="relogio" tam={80} cor="#C2410C" />{dia + 1} {dia ? 'dias' : 'dia'} depois... nada.</div></Pop>
    </>);
  }
  return null;
};

// ── comparação de dois caminhos (ex.: WhatsApp não oficial x API oficial) ──
export type Lado = { titulo: string; sub: string; logo: 'whats' | 'meta'; itens: string[]; cor?: string };
export const Compara: React.FC<{ a: Lado; b: Lado; ini: number; fim: number }> = ({ a, b, ini, fim }) => {
  const f = useCurrentFrame();
  const o = saida(f, fim, 10);
  const card = (l: Lado, i: number) => {
    const t0 = ini + 6 + i * 16;
    return (
      <Pop key={i} ini={t0} x={50 + i * 500} y={540} de={80}>
        <div style={{ width: 480, height: 820, borderRadius: 40, background: '#fff', boxShadow: sombra, border: `2px solid ${l.logo === 'meta' ? 'rgba(0,129,251,.35)' : 'rgba(27,195,113,.35)'}`, padding: '44px 34px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ height: 200, display: 'grid', placeItems: 'center' }}>{l.logo === 'meta' ? <MetaLogo ini={t0 + 4} tam={150} /> : <WhatsLogo ini={t0 + 4} tam={170} />}</div>
          <div style={{ fontFamily: G, fontWeight: 700, fontSize: 44, letterSpacing: '-0.03em', color: C.ink, marginTop: 24, textAlign: 'center' }}>{l.titulo}</div>
          <div style={{ fontFamily: M, fontSize: 24, color: l.logo === 'meta' ? '#0064E1' : C.prof, marginTop: 10, textAlign: 'center' }}>{l.sub}</div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 26, alignSelf: 'stretch' }}>
            {l.itens.map((it, k) => { const p = mola(f, t0 + 24 + k * 9, { damping: 15, stiffness: 160, mass: 0.6 });
              return <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: Math.min(1, p * 1.6), transform: `translateX(${(1 - p) * 30}px)` }}>
                <div style={{ width: 44, height: 44, borderRadius: 99, flex: 'none', background: l.logo === 'meta' ? 'rgba(0,129,251,.12)' : C.menta, display: 'grid', placeItems: 'center' }}><Icone n="ok" tam={28} cor={l.logo === 'meta' ? '#0064E1' : C.prof} traco={3} /></div>
                <div style={{ fontFamily: G, fontSize: 32, lineHeight: 1.22, color: C.ink }}>{it}</div></div>; })}
          </div>
        </div>
      </Pop>
    );
  };
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>{card(a, 0)}{card(b, 1)}</div>;
};

// ── benefícios: cartões com ícone 3D ──
export const Beneficios: React.FC<{ itens: [string, string, string?][]; ini: number; fim: number }> = ({ itens, ini, fim }) => {
  const f = useCurrentFrame();
  const o = saida(f, fim, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      {itens.map(([ic, t, sub], i) => {
        const t0 = ini + 10 + i * 14;
        const y = 560 + i * 300;
        return (
          <React.Fragment key={i}>
            <Pop ini={t0} x={60} y={y} de={60}>
              <div style={{ width: 960, height: 250, borderRadius: 40, background: '#fff', boxShadow: sombra, border: `1.5px solid ${C.linha}`, display: 'flex', alignItems: 'center', padding: '0 44px 0 230px' }}>
                <div>
                  <div style={{ fontFamily: G, fontWeight: 600, fontSize: 48, letterSpacing: '-0.03em', color: C.ink, lineHeight: 1.1 }}>{t}</div>
                  {sub && <div style={{ fontFamily: G, fontSize: 32, color: C.fg2, marginTop: 10, lineHeight: 1.2 }}>{sub}</div>}
                </div>
              </div>
            </Pop>
            <Obj3D x={175} y={y + 125} tam={150} ini={t0 + 4} icone={ic} flutua={0.5} />
          </React.Fragment>
        );
      })}
    </div>
  );
};
