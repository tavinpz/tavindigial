import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, D, B, Titulo, Celular, Selo, Fundo, Padrao, Cortina, Logo, Assinatura, Legenda, entra, sai, ease } from '../marca';

// Vídeo 1 — "Prévia grátis": faço a página do seu negócio antes de você pagar
export const DUR_V1 = [90, 120, 240, 90, 120, 120];

const Gancho: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Fundo />
    <Padrao cols={3} lins={3} lado={120} x={720} y={1380} ini={18} fim={d} semente={11} />
    <div style={{ position: 'absolute', left: 80, top: 520 }}>
      <Titulo texto="Eu faço a página do seu negócio" ini={4} tam={124} fim={d} />
      <div style={{ height: 30 }} />
      <Titulo texto="*antes* de você pagar." ini={22} tam={124} fim={d} />
    </div>
  </AbsoluteFill>
);

const NOME = 'Navalha 13';
const Nome: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const n = Math.max(0, Math.min(NOME.length, Math.floor((f - 26) / 2.6)));
  const cursor = Math.floor(f / 8) % 2 === 0;
  const sobe = spring({ frame: f - 62, fps, config: { damping: 18, stiffness: 90 } });
  const caixa = entra(f, 12, 14);
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: 'absolute', left: 80, top: 240 }}><Titulo texto="Você me manda *só o nome*." ini={2} tam={84} /></div>
      <div style={{ position: 'absolute', left: 80, top: 470, width: 820, height: 128, borderRadius: 30, background: C.branco, display: 'flex', alignItems: 'center', padding: '0 40px', fontFamily: B, fontWeight: 700, fontSize: 60, color: C.ink, opacity: caixa, transform: `translateY(${(1 - caixa) * 40}px)`, boxShadow: `0 0 0 ${n === NOME.length ? 8 : 0}px rgba(182,0,246,.35)` }}>
        <span style={{ color: n ? C.ink : '#B7AEBF' }}>{n ? NOME.slice(0, n) : 'Nome do negócio'}</span>
        <span style={{ width: 5, height: 66, background: C.el, marginLeft: 6, opacity: cursor && n < NOME.length + 1 ? 1 : 0 }} />
      </div>
      <Celular src="telas/site_barbearia.png" imgLargura={700} largura={600} style={{ left: 240, top: 690 + (1 - sobe) * 1300 }} />
    </AbsoluteFill>
  );
};

const Tour: React.FC<{ d: number; voz?: boolean }> = ({ d, voz }) => {
  const f = useCurrentFrame();
  const sobe = interpolate(f, [0, 22], [690, 330], { extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill>
      <Fundo luz="rgba(254,168,255,.16)" />
      <Celular src="telas/site_barbearia.png" imgLargura={700} largura={640} style={{ left: 220, top: sobe }}
        rolar={[[0, 0], [24, 0], [58, 1180], [100, 1180], [134, 2380], [170, 2380], [200, 2700], [240, 2700]]} />
      {!voz && <Selo texto="Seus serviços com preço" ini={44} fim={104} tam={46} style={{ left: 60, top: 1500 }} />}
      {!voz && <Selo texto="Agenda pelo WhatsApp" ini={112} fim={168} tam={46} style={{ left: 60, top: 1500 }} />}
      {!voz && <Selo texto="Nota do Google" ini={176} fim={212} tam={46} style={{ left: 60, top: 1500 }} />}
      {!voz && <Selo texto="Como chegar" ini={210} fim={d} tam={46} style={{ left: 60, top: 1500 }} />}
    </AbsoluteFill>
  );
};

const Nichos: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tel = [['telas/demo_nail.png', 780, -16, 120], ['telas/site_estetica.png', 700, 0, 380], ['telas/demo_tatuagem.png', 780, 16, 640]] as const;
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: 'absolute', left: 80, top: 230 }}><Titulo texto="Pra *qualquer* tipo de negócio." ini={2} tam={92} fim={d} /></div>
      {tel.map(([src, w, rot, x], i) => {
        const s = spring({ frame: f - 8 - i * 6, fps, config: { damping: 15, stiffness: 120 } });
        return <Celular key={src} src={src} imgLargura={w} largura={400} rolar={[[0, 0], [d, 260]]} style={{ left: x - 40, top: 620 + (1 - s) * 900 + (i === 1 ? -60 : 0), transform: `rotate(${rot * s}deg)`, zIndex: i === 1 ? 2 : 1 }} />;
      })}
    </AbsoluteFill>
  );
};

const Preco: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cards = [['Página da bio', 'R$ 147', 'pronta em 24 h'], ['Site completo', 'R$ 497', 'pronto em 48 h']];
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: 'absolute', left: 80, top: 300 }}><Titulo texto="Gostou? *Aí sim* você paga." ini={2} tam={104} fim={d} /></div>
      {cards.map(([t, p, z], i) => {
        const s = spring({ frame: f - 26 - i * 10, fps, config: { damping: 15, stiffness: 140 } });
        return (
          <div key={t} style={{ position: 'absolute', left: 80, top: 760 + i * 300, width: 820, height: 250, borderRadius: 40, background: i ? C.el : C.branco, color: i ? C.branco : C.ink, padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transform: `translateX(${(1 - s) * 1100}px)`, opacity: sai(f, d, 8) }}>
            <span style={{ fontFamily: B, fontWeight: 700, fontSize: 46, opacity: 0.8 }}>{t}</span>
            <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <b style={{ fontFamily: D, fontWeight: 900, fontSize: 104, letterSpacing: '-0.03em' }}>{p}</b>
              <span style={{ fontFamily: B, fontWeight: 700, fontSize: 40, opacity: 0.85 }}>{z}</span>
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.el }}>
      <Padrao cols={6} lins={2} lado={180} x={0} y={1560} ini={6} semente={23} />
      <div style={{ position: 'absolute', left: 80, top: 300 }}><Logo tamanho={46} /></div>
      <div style={{ position: 'absolute', left: 80, top: 520 }}>
        <Titulo texto="Peça a sua prévia *grátis*." ini={4} tam={128} destaque={C.noite} />
      </div>
      <div style={{ position: 'absolute', left: 80, top: 980, fontFamily: B, fontWeight: 700, fontSize: 54, color: C.branco, lineHeight: 1.3, opacity: entra(f, 26), transform: `translateY(${(1 - entra(f, 26)) * 30}px)` }}>
        Comente <b style={{ background: C.noite, padding: '4px 18px', borderRadius: 14 }}>PRÉVIA</b><br />ou chame no direct.
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1250, fontFamily: D, fontWeight: 800, fontSize: 60, color: C.noite, opacity: entra(f, 40) }}>@tavindigital</div>
    </AbsoluteFill>
  );
};

export const V1Previa: React.FC<{ dur?: number[]; falas?: { ini: number; fim: number; texto: string }[] }> = ({ dur = DUR_V1, falas }) => {
  const cenas: React.FC<{ d: number; voz?: boolean }>[] = [Gancho, Nome, Tour, Nichos, Preco, Cta];
  let t = 0;
  const inicios = dur.map((d) => { const i = t; t += d; return i; });
  return (
    <AbsoluteFill style={{ background: C.noite }}>
      {cenas.map((Cena, i) => (
        <Sequence key={i} from={inicios[i]} durationInFrames={dur[i]}><Cena d={dur[i]} voz={!!falas} /></Sequence>
      ))}
      {inicios.slice(1).filter((_, i) => i !== 1).map((em, i) => <Cortina key={i} em={em} semente={5 + i} />)}
      <Sequence from={0} durationInFrames={inicios[5]}><Assinatura /></Sequence>
      {falas && <Legenda falas={falas} />}
    </AbsoluteFill>
  );
};
