import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, D, B, Titulo, Fundo, Padrao, Cortina, Logo, Assinatura, celulas, entra, sai, ease } from '../marca';

// Vídeo 4 — Tudo que o negócio precisa para ser encontrado: site, bio, artes, vídeo e SEO para Google e IAs
export const DUR_V4 = [90, 300, 150, 120];

const Gancho: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Fundo />
    <Padrao cols={3} lins={2} lado={130} x={620} y={1260} ini={18} fim={d} semente={81} />
    <div style={{ position: 'absolute', left: 80, top: 500 }}>
      <Titulo texto="Tudo que o seu negócio precisa pra ser *encontrado*." ini={4} tam={116} fim={d} />
    </div>
  </AbsoluteFill>
);

const SERVICOS = [
  ['Site completo', 'Serviços, agenda e mapa'],
  ['Página da bio', 'No lugar da lista de links'],
  ['Artes para posts', 'Carrosséis e estáticos com a sua marca'],
  ['Edição de vídeo', 'Reels, YouTube e anúncios'],
  ['SEO para Google e IAs', 'Fácil de achar e de recomendar'],
];
const Icone: React.FC<{ semente: number; s: number }> = ({ semente, s }) => {
  const c = celulas(1, 1, semente)[0];
  const F: Record<string, string> = { quarto: 'M0 0H1A1 1 0 0 1 0 1Z', meia: 'M0 1A0.5 0.5 0 0 1 1 1Z', tri: 'M0 0L1 0L0 1Z', circulo: 'M0 0.5A0.5 0.5 0 1 0 1 0.5A0.5 0.5 0 1 0 0 0.5Z', malha: 'M0 0L0.5 0L0 0.5ZM0.5 0L1 0L0.5 0.5ZM0 0.5L0.5 0.5L0 1Z' };
  return (
    <svg width={120} height={120} style={{ borderRadius: 26, flex: 'none' }}>
      <rect width={120} height={120} fill={c.fundo} />
      <g transform={`translate(60 60) rotate(${c.giro + (1 - s) * 180}) translate(-60 -60) scale(120)`}><path d={F[c.forma]} fill={c.cor} /></g>
    </svg>
  );
};
const Servicos: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const passo = 48;
  return (
    <AbsoluteFill>
      <Fundo />
      {SERVICOS.map(([t, sub], i) => {
        const s = spring({ frame: f - 8 - i * passo, fps, config: { damping: 15, stiffness: 150 } });
        const ativo = f >= 8 + i * passo && f < 8 + (i + 1) * passo;
        return (
          <div key={t} style={{ position: 'absolute', left: 80, top: 260 + i * 236, width: 920, height: 206, borderRadius: 36, background: ativo ? C.branco : C.noite3, display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', opacity: Math.min(1, s) * sai(f, d, 10), transform: `translateX(${(1 - s) * 900}px)` }}>
            <Icone semente={91 + i * 7} s={s} />
            <div>
              <div style={{ fontFamily: D, fontWeight: 900, fontSize: 60, letterSpacing: '-0.03em', color: ativo ? C.ink : C.branco }}>{t}</div>
              <div style={{ fontFamily: B, fontWeight: 600, fontSize: 38, color: ativo ? C.fg2 : '#B9AFC3', marginTop: 4 }}>{sub}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Busca/IA (exemplo ilustrativo): a pergunta e a resposta com o negócio bem apresentado
const PERGUNTA = 'Barbearia boa em Pinheiros?';
const Ia: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const n = Math.max(0, Math.min(PERGUNTA.length, Math.floor((f - 18) / 1.6)));
  const r = spring({ frame: f - 70, fps, config: { damping: 15, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Fundo luz="rgba(254,168,255,.18)" />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Titulo texto="Quando o cliente pergunta, *você aparece* bem." ini={0} tam={84} fim={d} largura={920} /></div>
      <div style={{ position: 'absolute', right: 80, top: 600, maxWidth: 760, padding: '30px 40px', borderRadius: '40px 40px 10px 40px', background: C.el, color: C.branco, fontFamily: B, fontWeight: 700, fontSize: 50, opacity: entra(f, 10) }}>
        {PERGUNTA.slice(0, n) || ' '}<span style={{ opacity: n < PERGUNTA.length && Math.floor(f / 7) % 2 ? 1 : 0 }}>|</span>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 800, width: 860, padding: '36px 40px', borderRadius: '40px 40px 40px 10px', background: C.branco, transform: `translateY(${(1 - r) * 60}px)`, opacity: Math.min(1, r) }}>
        <div style={{ fontFamily: B, fontWeight: 600, fontSize: 36, color: C.fg2 }}>Uma boa opção é a</div>
        <div style={{ fontFamily: D, fontWeight: 900, fontSize: 70, color: C.ink, letterSpacing: '-0.03em', marginTop: 6 }}>Navalha 13</div>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 8 }}>★ 4,8 · corte e barba · agenda online</div>
        <div style={{ marginTop: 22, display: 'inline-block', fontFamily: B, fontWeight: 800, fontSize: 34, color: C.el, background: '#F3E3FF', padding: '8px 20px', borderRadius: 14 }}>navalha13.com.br</div>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1290, fontFamily: B, fontWeight: 600, fontSize: 30, color: '#9A90A3', opacity: entra(f, 90) }}>Exemplo ilustrativo</div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.el }}>
      <Padrao cols={6} lins={2} lado={180} x={0} y={1560} ini={4} semente={101} />
      <div style={{ position: 'absolute', left: 80, top: 300 }}><Logo tamanho={46} /></div>
      <div style={{ position: 'absolute', left: 80, top: 500 }}><Titulo texto="Começa pela *prévia grátis*." ini={4} tam={126} destaque={C.noite} /></div>
      <div style={{ position: 'absolute', left: 80, top: 1000, fontFamily: B, fontWeight: 700, fontSize: 54, color: C.branco, lineHeight: 1.35, opacity: entra(f, 26) }}>
        Você vê pronto e só paga<br />se gostar.
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1260, fontFamily: D, fontWeight: 800, fontSize: 60, color: C.noite, opacity: entra(f, 40) }}>Chama no direct · @tavindigital</div>
    </AbsoluteFill>
  );
};

export const V4Servicos: React.FC<{ dur?: number[] }> = ({ dur = DUR_V4 }) => {
  const cenas = [Gancho, Servicos, Ia, Cta];
  let t = 0; const ini = dur.map((d) => { const i = t; t += d; return i; });
  return (
    <AbsoluteFill style={{ background: C.noite }}>
      {cenas.map((Cena, i) => <Sequence key={i} from={ini[i]} durationInFrames={dur[i]}><Cena d={dur[i]} /></Sequence>)}
      {ini.slice(1).map((em, i) => <Cortina key={i} em={em} semente={17 + i} />)}
      <Sequence from={0} durationInFrames={ini[3]}><Assinatura /></Sequence>
    </AbsoluteFill>
  );
};
