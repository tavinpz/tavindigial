import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { C, D, B, Celular, Padrao, Logo, ease } from '../marca';
import { Linhas, Apoio, Palco, Cel3D, Brilho, Contador, Riscado, Balao, Pastilha, Roteiro, CenaDef, pulso, Flash } from '../pro';

const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// CTA comum (fundo elétrico, pattern na base)
export const CtaPro: React.FC<{ d: number; linhas: string[]; apoio: React.ReactNode; semente?: number }> = ({ d, linhas, apoio, semente = 23 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.el }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 40% at 50% ${30 + Math.sin(f / 30) * 6}%, rgba(254,168,255,.35), transparent 70%)` }} />
      <Padrao cols={6} lins={2} lado={180} x={0} y={1560} ini={6} semente={semente} />
      <div style={{ position: 'absolute', left: 80, top: 470, transform: `scale(${pulso(f, 0.012)})`, transformOrigin: 'left center' }}>
        <Linhas linhas={linhas} ini={4} tam={124} bloco={C.noite} destaque={C.noite} />
      </div>
      <Apoio texto={apoio} ini={30} tam={52} cor={C.branco} peso={700} style={{ position: 'absolute', left: 80, top: 1130 }} />
      <Apoio texto="@tavindigital" ini={42} tam={62} cor={C.noite} peso={800} style={{ position: 'absolute', left: 80, top: 1290, fontFamily: D }} />
    </AbsoluteFill>
  );
};

// ═════════ V5 — Cliente some no direct (com voz) ═════════
const V5a: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const msgs = ['quanto custa?', 'tem horário sábado?', 'onde fica?', 'aceita cartão?'];
  return (
    <AbsoluteFill>
      <Palco />
      <div style={{ position: 'absolute', left: 80, top: 230 }}>
        <Linhas linhas={['Cada "quanto custa?"', 'sem resposta é', '**um cliente a menos.**']} ini={2} tam={86} fim={d} />
      </div>
      <div style={{ position: 'absolute', right: 150, top: 690, display: 'flex', alignItems: 'center', gap: 16, fontFamily: B, fontWeight: 800, fontSize: 40, color: C.branco }}>
        Mensagens
        <span style={{ minWidth: 76, height: 76, borderRadius: 99, background: '#FF3B5C', display: 'grid', placeItems: 'center', fontSize: 40, transform: `scale(${pulso(f, 0.08, 10)})` }}>
          <Contador de={1} ate={27} ini={14} dur={70} />
        </span>
      </div>
      <div style={{ position: 'absolute', left: 80, right: 150, top: 800, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {msgs.map((m, i) => <Balao key={m} texto={m} ini={14 + i * 12} hora={`14:0${i}`} />)}
      </div>
    </AbsoluteFill>
  );
};
const V5b: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const voa = interpolate(f, [34, 52], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Palco luz1="rgba(120,100,140,.25)" />
      <div style={{ position: 'absolute', left: 80, top: 330 }}><Linhas linhas={['Ele não espera.']} ini={2} tam={120} fim={d} /></div>
      <div style={{ position: 'absolute', left: 80, right: 150, top: 760, transform: `translateX(${voa * 1200}px) rotate(${voa * 12}deg)`, opacity: 1 - voa }}>
        <Balao texto="quanto custa?" ini={6} hora="visto às 14:02" tam={56} />
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1080 }}><Linhas linhas={['Vai pro *próximo*', '*da lista.*']} ini={40} tam={96} fim={d} /></div>
    </AbsoluteFill>
  );
};
const V5c: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [16, 70, 100, 140], [0, 1180, 1180, 2300], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Palco seed={3} />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Com uma página,', 'ele **vê tudo**', 'sem perguntar.']} ini={0} tam={84} fim={d} /></div>
      <Cel3D x={300} y={640} largura={520} ini={4}><Celular src="telas/site_barbearia.png" imgLargura={700} largura={520} rolar={[[0, y]]} style={{ position: 'relative' }} /></Cel3D>
      <Pastilha texto="Serviços e preços" ini={30} style={{ position: 'absolute', left: 60, top: 920 }} semente={3} />
      <Pastilha texto="Horários livres" ini={70} style={{ position: 'absolute', left: 60, top: 1080 }} semente={8} />
      <Pastilha texto="Como chegar" ini={110} style={{ position: 'absolute', left: 60, top: 1240 }} semente={12} />
    </AbsoluteFill>
  );
};
const V5d: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={5} luz1="rgba(43,213,118,.18)" />
    <div style={{ position: 'absolute', left: 80, top: 300 }}><Linhas linhas={['E chega no WhatsApp', '**pronto pra marcar.**']} ini={0} tam={88} fim={d} /></div>
    <div style={{ position: 'absolute', left: 80, right: 150, top: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Balao texto="Oi! Quero marcar corte + barba no sábado, 14:30." lado="dir" cor="#1F8F55" ini={18} tam={52} hora="14:31" />
      <Balao texto="Fechado! Te espero sábado 14:30." ini={46} tam={52} hora="14:32" />
    </div>
  </AbsoluteFill>
);
export const CENAS_V5: CenaDef[] = [
  { C: V5a, d: 105 },
  { C: V5b, d: 90, entrada: 'whip' },
  { C: V5c, d: 150, cortina: true },
  { C: V5d, d: 105, entrada: 'whip' },
  { C: (p) => <CtaPro {...p} linhas={['Peça a prévia', '**grátis** da sua', 'página.']} apoio="Chama no direct." />, d: 120, cortina: true, logo: false },
];
export const FALAS_V5 = [
  'Cada quanto custa que fica sem resposta é um cliente a menos.',
  'Ele não espera. Ele vai pro próximo da lista.',
  'Com uma página, ele vê serviços, preços e horários sem precisar te perguntar nada.',
  'E chega no seu WhatsApp pronto pra marcar.',
  'Peça a prévia grátis da sua página. Me chama no direct.',
];

// ═════════ V6 — Concorrente parece melhor (música) ═════════
const CardBusca: React.FC<{ nome: string; nota: React.ReactNode; aval: React.ReactNode; tags: { t: string; ok: boolean; ini?: number }[]; destaque?: boolean; style?: React.CSSProperties; ini: number; brilho?: number }> = ({ nome, nota, aval, tags, destaque, style, ini, brilho }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - ini, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <div style={{ position: 'absolute', width: 920, borderRadius: 36, padding: '34px 40px', background: destaque ? C.branco : '#2A2230', color: destaque ? C.ink : '#B9AFC3', boxShadow: destaque ? '0 30px 80px -30px rgba(182,0,246,.7)' : 'none', transform: `translateY(${(1 - s) * 200}px) scale(${0.9 + s * 0.1})`, opacity: Math.min(1, s), overflow: 'hidden', ...style }}>
      <div style={{ fontFamily: D, fontWeight: 900, fontSize: 60, letterSpacing: '-0.03em' }}>{nome}</div>
      <div style={{ fontFamily: B, fontWeight: 700, fontSize: 40, marginTop: 8, display: 'flex', gap: 18, alignItems: 'center' }}>
        <span style={{ color: '#F2B33D' }}>★</span>{nota}<span style={{ opacity: 0.6 }}>·</span>{aval}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        {tags.map((t) => {
          const p = t.ini === undefined ? 1 : interpolate(f, [t.ini, t.ini + 8], [0, 1], cl);
          return <span key={t.t} style={{ fontFamily: B, fontWeight: 800, fontSize: 32, padding: '8px 18px', borderRadius: 999, background: t.ok ? '#E6F4EC' : 'rgba(255,90,110,.16)', color: t.ok ? '#1F7A4A' : '#FF8FA0', opacity: p, transform: `scale(${0.6 + p * 0.4})` }}>{t.ok ? '✓ ' : '✕ '}{t.t}</span>;
        })}
      </div>
      {brilho !== undefined && <Brilho em={brilho} raio={36} />}
    </div>
  );
};
const V6a: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Palco />
      <div style={{ position: 'absolute', left: 80, top: 640, transform: `scale(${pulso(f, 0.02)})`, transformOrigin: 'left' }}><Linhas linhas={['Seu concorrente', 'é *pior* que você.']} ini={2} tam={124} /></div>
    </AbsoluteFill>
  );
};
const V6b: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={2} />
    <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Mas no Google ele', '**parece melhor.**']} ini={0} tam={96} fim={d} /></div>
    <CardBusca nome="Seu negócio" nota="4,1" aval="9 avaliações" tags={[{ t: 'sem site', ok: false }, { t: 'sem fotos', ok: false }]} ini={14} style={{ left: 80, top: 640 }} />
    <CardBusca nome="O concorrente" nota="4,8" aval="312 avaliações" tags={[{ t: 'site com agenda', ok: true }, { t: 'fotos', ok: true }]} destaque ini={30} style={{ left: 80, top: 1000 }} brilho={50} />
  </AbsoluteFill>
);
const V6c: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={4} luz1="rgba(254,168,255,.2)" />
    <div style={{ position: 'absolute', left: 80, top: 560 }}><Linhas linhas={['Quem pesquisa', 'não conhece', 'o seu trabalho.']} ini={0} tam={112} fim={d} /></div>
    <Apoio texto={<>Conhece <b style={{ color: C.rosa }}>o que aparece.</b></>} ini={30} tam={60} style={{ position: 'absolute', left: 80, top: 1060 }} fim={d} />
  </AbsoluteFill>
);
const V6d: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={6} />
    <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['A gente arruma', 'a **sua vitrine.**']} ini={0} tam={100} fim={d} /></div>
    <CardBusca nome="Seu negócio" destaque ini={8} style={{ left: 80, top: 680 }} brilho={70}
      nota={<span style={{ color: C.ink }}><Contador de={4.1} ate={4.9} ini={20} dur={40} casas={1} /></span>}
      aval={<span><Contador de={9} ate={48} ini={20} dur={50} /> avaliações</span>}
      tags={[{ t: 'site com agenda', ok: true, ini: 34 }, { t: 'fotos novas', ok: true, ini: 46 }, { t: 'horários', ok: true, ini: 58 }]} />
    <Apoio texto="exemplo ilustrativo" ini={60} tam={30} cor="#9A90A3" style={{ position: 'absolute', left: 84, top: 1050 }} />
    <div style={{ position: 'absolute', left: 80, top: 1160, display: 'flex', gap: 14, flexWrap: 'wrap', width: 900 }}>
      {['Site', 'Google', 'Avaliações', 'Instagram'].map((t, i) => <Pastilha key={t} texto={t} ini={75 + i * 8} claro={false} semente={20 + i} />)}
    </div>
  </AbsoluteFill>
);
export const CENAS_V6: CenaDef[] = [
  { C: V6a, d: 60 },
  { C: V6b, d: 105, entrada: 'whip', flash: true },
  { C: V6c, d: 75, entrada: 'zoom' },
  { C: V6d, d: 120, cortina: true },
  { C: (p) => <CtaPro {...p} linhas={['Comece pela', '**prévia grátis.**']} apoio="Você vê pronto e só paga se gostar." semente={33} />, d: 105, cortina: true, logo: false },
];

// ═════════ V7 — No ar em 24 horas (música) ═════════
const Relogio: React.FC<{ ini: number; dur: number }> = ({ ini, dur }) => {
  const f = useCurrentFrame();
  const seg = interpolate(f, [ini, ini + dur], [24 * 3600, 0], { ...cl, easing: Easing.in(Easing.quad) });
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = Math.floor(seg % 60);
  const p = (n: number) => String(n).padStart(2, '0');
  return <span style={{ fontFamily: D, fontWeight: 900, fontSize: 190, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', color: C.branco }}>{p(h)}:{p(m)}<span style={{ color: C.rosa }}>:{p(s)}</span></span>;
};
const V7a: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Palco />
      <div style={{ position: 'absolute', left: 80, top: 360, transform: `scale(${pulso(f, 0.03)})`, transformOrigin: 'left center' }}><Relogio ini={6} dur={80} /></div>
      <div style={{ position: 'absolute', left: 80, top: 700 }}><Linhas linhas={['Do zero ao ar', 'em **24 horas.**']} ini={10} tam={124} fim={d} /></div>
    </AbsoluteFill>
  );
};
const PASSOS = [['0 h', 'Você manda o nome'], ['em horas', 'Prévia pronta no WhatsApp'], ['do seu jeito', 'Ajustes que você pedir'], ['24 h', 'No ar com o seu domínio']];
const V7b: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const linha = interpolate(f, [10, 10 + 30 * 3 + 10], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill>
      <Palco seed={7} />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Como funciona:']} ini={0} tam={90} fim={d} /></div>
      <div style={{ position: 'absolute', left: 118, top: 480, width: 8, height: 900, borderRadius: 8, background: 'rgba(255,255,255,.1)' }}>
        <div style={{ width: 8, height: `${linha * 100}%`, borderRadius: 8, background: `linear-gradient(${C.el}, ${C.rosa})` }} />
      </div>
      {PASSOS.map(([t, n], i) => {
        const s = spring({ frame: f - 10 - i * 30, fps, config: { damping: 14, stiffness: 160 } });
        return (
          <div key={n} style={{ position: 'absolute', left: 80, top: 450 + i * 240, display: 'flex', alignItems: 'center', gap: 36, opacity: Math.min(1, s), transform: `translateX(${(1 - s) * 140}px)` }}>
            <span style={{ width: 84, height: 84, borderRadius: 99, background: i === 3 ? C.rosa : C.el, color: i === 3 ? C.ink : C.branco, display: 'grid', placeItems: 'center', fontFamily: D, fontWeight: 900, fontSize: 40, boxShadow: `0 0 0 ${10 * s}px rgba(182,0,246,.18)` }}>{i + 1}</span>
            <div>
              <div style={{ fontFamily: B, fontWeight: 800, fontSize: 34, color: C.rosa }}>{t}</div>
              <div style={{ fontFamily: D, fontWeight: 900, fontSize: 64, color: C.branco, letterSpacing: '-0.03em' }}>{n}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const DOMINIO = 'studiobella.com.br';
const V7c: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(DOMINIO.length, Math.floor((f - 20) / 1.6)));
  const y = interpolate(f, [40, d], [0, 900], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Palco seed={9} luz1="rgba(43,213,118,.16)" />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Seu negócio', '**no ar.**']} ini={0} tam={110} fim={d} /></div>
      <div style={{ position: 'absolute', left: 300, top: 560, width: 520, height: 80, borderRadius: 999, background: C.branco, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', fontFamily: B, fontWeight: 700, fontSize: 36, color: C.ink, zIndex: 3, boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)' }}>
        <span style={{ width: 18, height: 18, borderRadius: 99, background: '#2BD576', boxShadow: `0 0 0 ${6 + Math.sin(f / 4) * 4}px rgba(43,213,118,.3)` }} />
        {DOMINIO.slice(0, n)}<span style={{ width: 3, height: 40, background: C.el, opacity: n < DOMINIO.length && Math.floor(f / 7) % 2 ? 1 : 0 }} />
      </div>
      <Cel3D x={290} y={680} largura={540} ini={2}><Celular src="telas/demo_nail.png" imgLargura={780} largura={540} rolar={[[0, y]]} style={{ position: 'relative' }} /></Cel3D>
    </AbsoluteFill>
  );
};
const V7d: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={11} />
    <div style={{ position: 'absolute', left: 80, top: 300 }}><Linhas linhas={['Sem:']} ini={0} tam={120} fim={d} /></div>
    <div style={{ position: 'absolute', left: 80, top: 560, display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Riscado texto="reunião de duas horas" ini={8} risca={30} tam={70} />
      <Riscado texto="briefing de 40 perguntas" ini={20} risca={45} tam={70} />
      <Riscado texto="esperar 30 dias" ini={32} risca={60} tam={70} />
    </div>
  </AbsoluteFill>
);
export const CENAS_V7: CenaDef[] = [
  { C: V7a, d: 90 },
  { C: V7b, d: 150, cortina: true },
  { C: V7c, d: 105, entrada: 'zoom', flash: true },
  { C: V7d, d: 90, entrada: 'whip' },
  { C: (p) => <CtaPro {...p} linhas={['Quer a sua', 'no ar **amanhã?**']} apoio="Prévia grátis. Chama no direct." semente={43} />, d: 105, cortina: true, logo: false },
];

export const V5 = (p: any) => <Roteiro cenas={CENAS_V5} {...p} />;
export const V6 = (p: any) => <Roteiro cenas={CENAS_V6} {...p} />;
export const V7 = (p: any) => <Roteiro cenas={CENAS_V7} {...p} />;
