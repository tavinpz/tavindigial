import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, D, B, Titulo, Fundo, Padrao, Cortina, Logo, Assinatura, entra, sai, ease } from '../marca';

// Vídeo 3 — Edição de vídeos e Reels (sem preço: chama no direct)
export const DUR_V3 = [90, 210, 180, 150];

const Gancho: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  // "corte seco" no meio do gancho: a tela dá um tranco, como um corte de edição
  const tranco = f >= 40 && f < 44 ? 1.08 : 1;
  return (
    <AbsoluteFill style={{ transform: `scale(${tranco})` }}>
      <Fundo />
      <Padrao cols={4} lins={1} lado={150} x={80} y={1240} ini={30} fim={d} semente={51} />
      <div style={{ position: 'absolute', left: 80, top: 520 }}>
        <Titulo texto="Seu vídeo é bom." ini={4} tam={128} fim={d} />
        <div style={{ height: 20 }} />
        <Titulo texto="*A edição* não." ini={40} tam={128} fim={d} />
      </div>
    </AbsoluteFill>
  );
};

// Linha do tempo de editor: as faixas vão sendo preenchidas e o preview mostra o efeito de cada uma
const FAIXAS = [
  { nome: 'Vídeo', cor: '#6E56CF', rotulo: 'Cortes no ritmo', clipes: [[0, 0.22], [0.24, 0.45], [0.47, 0.7], [0.72, 1]] },
  { nome: 'Legenda', cor: C.rosa, rotulo: 'Legendas animadas', clipes: [[0.02, 0.3], [0.33, 0.62], [0.65, 0.96]] },
  { nome: 'Motion', cor: C.el, rotulo: 'Títulos e motion', clipes: [[0.05, 0.2], [0.4, 0.58], [0.8, 0.95]] },
  { nome: 'Trilha', cor: '#2BD576', rotulo: 'Trilha e efeitos', clipes: [[0, 1]] },
];
const PREVIA = ['CORTE', 'LEGENDA', 'MOTION', 'SOM'];
const Linha: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const passo = 44;
  const atual = Math.min(3, Math.floor(Math.max(0, f - 20) / passo));
  const cabeca = interpolate(f, [20, d - 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const larg = 920;
  const local = f - 20 - atual * passo;
  const pal = spring({ frame: local, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: 'absolute', left: 80, top: 200 }}><Titulo texto="O que a gente faz no seu vídeo:" ini={0} tam={72} fim={d} largura={900} /></div>
      {/* preview 9:16 */}
      <div style={{ position: 'absolute', left: 330, top: 400, width: 420, height: 560, borderRadius: 28, background: '#0B090D', overflow: 'hidden', border: '3px solid #2E2633', opacity: entra(f, 4) }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(80% 60% at 50% 40%, ${FAIXAS[atual].cor}55, transparent 70%)` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: D, fontWeight: 900, fontSize: 84, color: C.branco, letterSpacing: '-0.03em', transform: `scale(${0.6 + pal * 0.4}) rotate(${(1 - pal) * -6}deg)`, opacity: Math.min(1, pal * 1.5) }}>
          {PREVIA[atual]}
        </div>
        {atual >= 1 && (
          <div style={{ position: 'absolute', left: 40, right: 40, bottom: 70, display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['assim', 'fica', 'melhor'].map((w, i) => (
              <span key={w} style={{ fontFamily: B, fontWeight: 800, fontSize: 34, padding: '2px 8px', borderRadius: 8, background: Math.floor(f / 10) % 3 === i ? C.rosa : 'transparent', color: Math.floor(f / 10) % 3 === i ? C.ink : C.branco }}>{w}</span>
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: `${cabeca * 100}%`, background: C.el }} />
      </div>
      {/* timeline */}
      <div style={{ position: 'absolute', left: 80, top: 1010, width: larg, borderRadius: 26, background: '#1B1520', border: '2px solid #2E2633', padding: '26px 26px 30px', opacity: entra(f, 8) }}>
        {FAIXAS.map((fx, i) => (
          <div key={fx.nome} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 74, marginTop: i ? 12 : 0 }}>
            <span style={{ width: 150, fontFamily: B, fontWeight: 700, fontSize: 30, color: '#B9AFC3' }}>{fx.nome}</span>
            <div style={{ position: 'relative', flex: 1, height: 62, borderRadius: 12, background: '#120E15' }}>
              {fx.clipes.map(([a, b], j) => {
                const s = spring({ frame: f - 20 - i * passo - j * 5, fps, config: { damping: 14, stiffness: 180 } });
                return <div key={j} style={{ position: 'absolute', left: `${a * 100}%`, width: `${(b - a) * 100}%`, top: 6, bottom: 6, borderRadius: 9, background: fx.cor, opacity: Math.min(1, s), transform: `translateY(${(1 - s) * -40}px)` }} />;
              })}
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', top: 14, bottom: 14, left: 26 + 166 + cabeca * (larg - 52 - 166), width: 4, background: C.branco, borderRadius: 4, boxShadow: '0 0 12px #fff' }} />
      </div>
      {FAIXAS.map((fx, i) => {
        const s = spring({ frame: f - 30 - i * passo, fps, config: { damping: 13, stiffness: 190 } });
        const vis = i === atual ? 1 : 0;
        return vis ? (
          <div key={fx.rotulo} style={{ position: 'absolute', left: 80, top: 1440, display: 'flex', alignItems: 'center', gap: 20, transform: `scale(${s})`, transformOrigin: 'left center' }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: fx.cor }} />
            <span style={{ fontFamily: D, fontWeight: 900, fontSize: 72, color: C.branco, letterSpacing: '-0.03em' }}>{fx.rotulo}</span>
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

const Pessoa: React.FC<{ cor: string; escala?: number }> = ({ cor, escala = 1 }) => (
  <svg width={440} height={780} viewBox="0 0 440 780" style={{ position: 'absolute', inset: 0, transform: `scale(${escala})`, transformOrigin: '50% 60%' }}>
    <circle cx={220} cy={330} r={92} fill={cor} />
    <path d="M60 780 C60 560 120 470 220 470 C320 470 380 560 380 780 Z" fill={cor} />
  </svg>
);

// Antes × depois: o mesmo trecho cru e editado
const AntesDepois: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const corte = interpolate(f, [30, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const pulso = 1 + Math.max(0, Math.sin(f / 7)) * 0.03;
  const palavras = ['3', 'erros', 'que', 'afastam', 'cliente'];
  const atual = Math.floor(Math.max(0, f - 60) / 9) % palavras.length;
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: 'absolute', left: 80, top: 210 }}><Titulo texto="Mesmo vídeo. *Outra* retenção." ini={0} tam={84} fim={d} /></div>
      {/* antes */}
      <div style={{ position: 'absolute', left: 80, top: 520, width: 440, height: 780, borderRadius: 30, background: 'linear-gradient(#5d5862, #3d3940)', overflow: 'hidden', opacity: entra(f, 4) }}>
        <Pessoa cor="#2C292F" />
        <div style={{ position: 'absolute', left: 30, right: 30, bottom: 120, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: 26, color: '#fff' }}>então hoje eu vou falar sobre três erros que...</div>
        <div style={{ position: 'absolute', top: 24, left: 24, fontFamily: B, fontWeight: 800, fontSize: 30, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 14px', borderRadius: 10 }}>Antes</div>
      </div>
      {/* depois */}
      <div style={{ position: 'absolute', left: 560, top: 520, width: 440, height: 780, borderRadius: 30, overflow: 'hidden', background: C.noite2, transform: `scale(${0.9 + corte * 0.1})`, opacity: corte, boxShadow: `0 0 0 4px ${C.el}` }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(90% 60% at 50% 35%, ${C.el}66, transparent 70%)`, transform: `scale(${pulso})` }} />
        <Pessoa cor="#0E0A11" escala={1.18 + Math.max(0, Math.sin(f / 9)) * 0.02} />
        <Padrao cols={3} lins={1} lado={146} x={0} y={0} ini={40} semente={61} />
        <div style={{ position: 'absolute', left: 30, right: 30, top: 230, fontFamily: D, fontWeight: 900, fontSize: 76, lineHeight: 1, color: C.branco, letterSpacing: '-0.03em' }}>3 ERROS<br /><span style={{ color: C.rosa }}>na sua bio</span></div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 120, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {palavras.map((w, i) => <span key={i} style={{ fontFamily: B, fontWeight: 800, fontSize: 38, padding: '2px 10px', borderRadius: 10, background: i === atual ? C.rosa : 'rgba(0,0,0,.4)', color: i === atual ? C.ink : C.branco }}>{w}</span>)}
        </div>
        <div style={{ position: 'absolute', left: 0, bottom: 0, height: 10, width: `${interpolate(f, [40, d], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`, background: C.rosa }} />
        <div style={{ position: 'absolute', top: 24, right: 24, fontFamily: B, fontWeight: 800, fontSize: 30, color: C.ink, background: C.rosa, padding: '4px 14px', borderRadius: 10 }}>Depois</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.el }}>
      <Padrao cols={6} lins={2} lado={180} x={0} y={1560} ini={4} semente={71} />
      <div style={{ position: 'absolute', left: 80, top: 300 }}><Logo tamanho={46} /></div>
      <div style={{ position: 'absolute', left: 80, top: 480 }}><Titulo texto="Manda o seu *vídeo cru* no direct." ini={4} tam={118} destaque={C.noite} /></div>
      <div style={{ position: 'absolute', left: 80, top: 1060, fontFamily: B, fontWeight: 700, fontSize: 52, color: C.branco, lineHeight: 1.35, opacity: entra(f, 30) }}>
        Reels, YouTube e anúncios.<br />Orçamento sem compromisso.
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1300, fontFamily: D, fontWeight: 800, fontSize: 60, color: C.noite, opacity: entra(f, 44) }}>@tavindigital</div>
    </AbsoluteFill>
  );
};

export const V3Edicao: React.FC<{ dur?: number[] }> = ({ dur = DUR_V3 }) => {
  const cenas = [Gancho, Linha, AntesDepois, Cta];
  let t = 0; const ini = dur.map((d) => { const i = t; t += d; return i; });
  return (
    <AbsoluteFill style={{ background: C.noite }}>
      {cenas.map((Cena, i) => <Sequence key={i} from={ini[i]} durationInFrames={dur[i]}><Cena d={dur[i]} /></Sequence>)}
      {ini.slice(1).map((em, i) => <Cortina key={i} em={em} semente={13 + i} />)}
      <Sequence from={0} durationInFrames={ini[3]}><Assinatura /></Sequence>
    </AbsoluteFill>
  );
};
