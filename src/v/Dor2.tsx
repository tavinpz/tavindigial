import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, D, B, Celular, Padrao, celulas, ease } from '../marca';
import { Linhas, Apoio, Palco, Cel3D, Brilho, Contador, Balao, Pastilha, Roteiro, CenaDef, pulso, BATIDA } from '../pro';
import { CtaPro } from './Dor1';

const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const Rotulo: React.FC<{ texto: string; ini: number; d: number; cor?: string }> = ({ texto, ini, d, cor = C.branco }) => (
  <Apoio texto={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: cor === C.branco ? C.rosa : C.el }} />{texto}</span>} ini={ini} tam={54} cor={cor} peso={800} fim={d} style={{ position: 'absolute', left: 80, top: 1440 }} />
);

// ═════════ V8 — Motion para a sua marca (vitrine, música) ═════════
const V8a: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Palco grade={false} pecas={false} />
      <Padrao cols={6} lins={11} lado={180} x={0} y={0} ini={0} fim={40} semente={71} />
      <div style={{ position: 'absolute', left: 80, top: 640, transform: `scale(${pulso(f, 0.02)})`, transformOrigin: 'left' }}>
        <Linhas linhas={['Esse vídeo foi', '**animado por nós.**']} ini={34} tam={122} fim={d} />
      </div>
    </AbsoluteFill>
  );
};
// Vinheta de uma marca fictícia: o círculo se desenha, os raios saem e o nome se espalha
const V8b: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const circ = 'M 0 -170 A 170 170 0 1 1 -0.1 -170';
  const ev = evolvePath(interpolate(f, [6, 34], [0, 1], { ...cl, easing: ease }), circ);
  const nome = 'CAFÉ AURORA';
  const fecha = interpolate(f, [d - 10, d], [1, 0], cl);
  return (
    <AbsoluteFill style={{ background: '#1A1210' }}>
      <AbsoluteFill style={{ background: `radial-gradient(50% 32% at 50% 40%, rgba(242,179,61,${0.12 + 0.1 * interpolate(f, [30, 50], [0, 1], cl)}), transparent 70%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: fecha }}>
        <g transform="translate(540 760)">
          <path d={circ} fill="none" stroke="#F2B33D" strokeWidth={14} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          {Array.from({ length: 12 }).map((_, i) => {
            const s = spring({ frame: f - 28 - i * 1.2, fps, config: { damping: 12, stiffness: 200 } });
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 200} y1={Math.sin(a) * 200} x2={Math.cos(a) * (200 + 60 * s)} y2={Math.sin(a) * (200 + 60 * s)} stroke="#F2B33D" strokeWidth={10} strokeLinecap="round" opacity={s} />;
          })}
          <path d="M -90 40 Q 0 -60 90 40 Z" fill="#F2B33D" transform={`scale(${spring({ frame: f - 36, fps, config: { damping: 12 } })})`} />
          <rect x={-130} y={40} width={260} height={14} rx={7} fill="#F2B33D" transform={`scale(${spring({ frame: f - 40, fps, config: { damping: 12 } })} 1)`} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: D, fontWeight: 900, fontSize: 96, color: '#F6EBD9', letterSpacing: `${interpolate(f, [44, 80], [0.6, 0.18], { ...cl, easing: ease })}em`, opacity: interpolate(f, [44, 56], [0, 1], cl) * fecha }}>
        {nome.split('').map((l, i) => <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - spring({ frame: f - 44 - i * 1.5, fps, config: { damping: 14 } })) * 60}px)` }}>{l === ' ' ? ' ' : l}</span>)}
        <div style={{ position: 'relative', width: 700, height: 4, margin: '24px auto 0', overflow: 'hidden' }}><Brilho em={64} dur={20} raio={0} /></div>
      </div>
      <Rotulo texto="Vinheta com a sua marca" ini={56} d={d} />
    </AbsoluteFill>
  );
};
// Promo cinética: uma palavra por batida, fundo troca de cor no tempo da música
const V8c: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const palavras = [['SÁBADO', C.el, C.branco], ['TEM', C.rosa, C.ink], ['PROMO', C.noite, C.rosa], ['DE', C.el, C.branco], ['VERÃO', C.branco, C.el]];
  const k = Math.min(palavras.length - 1, Math.floor(f / BATIDA));
  const local = f - k * BATIDA;
  const s = spring({ frame: local, fps, config: { damping: 11, stiffness: 260, mass: 0.5 } });
  const [w, bg, cor] = palavras[k] as string[];
  return (
    <AbsoluteFill style={{ background: bg }}>
      <Padrao cols={1} lins={1} lado={260} x={760} y={260} ini={0} semente={80 + k} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: D, fontWeight: 900, fontSize: 230, letterSpacing: '-0.05em', color: cor, transform: `scale(${2.2 - s * 1.2}) rotate(${(1 - s) * (k % 2 ? 8 : -8)}deg)`, opacity: Math.min(1, s * 2) }}>{w}</div>
      <Rotulo texto="Anúncios e promoções" ini={10} d={d} cor={bg === C.branco || bg === C.rosa ? C.ink : C.branco} />
    </AbsoluteFill>
  );
};
// Explicação animada: fluxo que se desenha (agenda → lembrete → cliente chega)
const V8d: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const nos = [[240, 640, 'Agenda'], [840, 900, 'Lembrete'], [300, 1200, 'Cliente chega']] as const;
  const caminho = 'M 240 640 C 600 640, 840 700, 840 900 S 300 1000, 300 1200';
  const ev = evolvePath(interpolate(f, [8, 70], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) }), caminho);
  return (
    <AbsoluteFill>
      <Palco seed={13} grade={false} />
      <div style={{ position: 'absolute', left: 80, top: 230 }}><Linhas linhas={['Seu serviço', 'explicado em **15 s.**']} ini={0} tam={90} fim={d} /></div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={caminho} fill="none" stroke={C.rosa} strokeWidth={10} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      </svg>
      {nos.map(([x, y, t], i) => {
        const s = spring({ frame: f - 8 - i * 28, fps, config: { damping: 12, stiffness: 180 } });
        const cel = celulas(1, 1, 90 + i)[0];
        return (
          <div key={t} style={{ position: 'absolute', left: x - 70, top: y - 70, display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${s})`, transformOrigin: '70px 70px' }}>
            <div style={{ width: 140, height: 140, borderRadius: 40, background: cel.fundo, border: `6px solid ${C.noite}`, boxShadow: `0 0 0 4px ${C.rosa}` }} />
            <span style={{ fontFamily: B, fontWeight: 800, fontSize: 48, color: C.branco, whiteSpace: 'nowrap', marginLeft: i === 1 ? -420 : 0, order: i === 1 ? -1 : 0 }}>{t}</span>
          </div>
        );
      })}
      <Rotulo texto="Explicações animadas" ini={30} d={d} />
    </AbsoluteFill>
  );
};
const V8e: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [10, d], [0, 1100], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Palco seed={15} />
      <Cel3D x={280} y={330} largura={540} ini={0} giro={-40} inclina={-10}><Celular src="telas/demo_tatuagem.png" imgLargura={780} largura={540} rolar={[[0, y]]} style={{ position: 'relative' }} /></Cel3D>
      <Pastilha texto="Fluxo do app" ini={18} style={{ position: 'absolute', left: 60, top: 520 }} semente={31} />
      <Pastilha texto="Telas reais" ini={34} style={{ position: 'absolute', right: 150, top: 900 }} semente={37} />
      <Pastilha texto="Câmera 3D" ini={50} style={{ position: 'absolute', left: 60, top: 1240 }} semente={41} />
      <Rotulo texto="Apresentação de site e app" ini={20} d={d} />
    </AbsoluteFill>
  );
};
export const CENAS_V8: CenaDef[] = [
  { C: V8a, d: 90 },
  { C: V8b, d: 105, entrada: 'zoom', logo: false },
  { C: V8c, d: 75, flash: true, logo: false },
  { C: V8d, d: 105, entrada: 'whip' },
  { C: V8e, d: 90, entrada: 'whip' },
  { C: (p) => <CtaPro {...p} linhas={['Vídeos em motion', 'para a **sua marca.**']} apoio="Reels, anúncios e vinhetas. Chama no direct." semente={53} />, d: 120, cortina: true, logo: false },
];

// ═════════ V9 — Post bonito não paga boleto (com voz) ═════════
const SlideMini: React.FC<{ tipo: 'capa' | 'texto' | 'cta'; titulo: string; w?: number; semente?: number }> = ({ tipo, titulo, w = 440, semente = 3 }) => {
  const h = w * 1350 / 1080; const k = w / 1080;
  const fundo = tipo === 'capa' ? C.noite : tipo === 'cta' ? C.el : C.papel;
  const cor = tipo === 'texto' ? C.ink : C.branco;
  return (
    <div style={{ width: w, height: h, background: fundo, borderRadius: 18, position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px -30px rgba(0,0,0,.7)' }}>
      {tipo === 'capa' && <Padrao cols={1} lins={9} lado={150 * k} x={w - 150 * k} y={0} ini={-40} semente={semente} vivo={false} />}
      {tipo === 'cta' && <Padrao cols={7} lins={1} lado={w / 7} x={0} y={h - w / 7} ini={-40} semente={semente} vivo={false} />}
      {tipo === 'texto' && <div style={{ position: 'absolute', left: 90 * k, top: 90 * k, fontFamily: D, fontWeight: 800, fontSize: 40 * k, color: C.el }}>02</div>}
      <div style={{ position: 'absolute', left: 90 * k, top: (tipo === 'texto' ? 260 : 380) * k, width: w - 300 * k, fontFamily: D, fontWeight: 800, fontSize: 92 * k, lineHeight: 1.06, color: cor, letterSpacing: '-0.02em' }}>{titulo}</div>
      {tipo === 'texto' && <div style={{ position: 'absolute', left: 90 * k, top: 640 * k, width: w - 180 * k }}>{[0, 1, 2].map((i) => <div key={i} style={{ height: 22 * k, borderRadius: 11 * k, background: '#DCD3E3', marginBottom: 26 * k, width: `${90 - i * 18}%` }} />)}</div>}
    </div>
  );
};
const V9a: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const cinza = interpolate(f, [40, 70], [0, 1], cl);
  return (
    <AbsoluteFill>
      <Palco seed={17} />
      <div style={{ position: 'absolute', left: 80, top: 760, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: 820, filter: `saturate(${1 - cinza * 0.9}) brightness(${1 - cinza * 0.3})`, opacity: 0.85 }}>
        {Array.from({ length: 9 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 14, background: `linear-gradient(${40 * i}deg, hsl(${(i * 47) % 360} 70% 70%), hsl(${(i * 47 + 60) % 360} 70% 55%))`, opacity: interpolate(f, [4 + i * 2, 12 + i * 2], [0, 1], cl) }} />)}
      </div>
      <div style={{ position: 'absolute', left: 80, top: 260 }}><Linhas linhas={['Post bonito', 'não **paga boleto.**']} ini={2} tam={124} fim={d} /></div>
    </AbsoluteFill>
  );
};
const V9b: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={19} />
    <div style={{ position: 'absolute', left: 80, top: 260 }}><Linhas linhas={['O que vende é o', 'post que **explica:**']} ini={0} tam={92} fim={d} /></div>
    <div style={{ position: 'absolute', left: 80, top: 660, display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'flex-start' }}>
      <Pastilha texto="o que você faz" ini={22} tam={58} semente={50} />
      <Pastilha texto="pra quem é" ini={42} tam={58} semente={54} />
      <Pastilha texto="como marcar" ini={62} tam={58} semente={58} />
    </div>
  </AbsoluteFill>
);
const V9c: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const slides: [('capa' | 'texto' | 'cta'), string][] = [['capa', '5 coisas que o cliente olha antes de te chamar'], ['texto', 'Preço, nem que seja "a partir de"'], ['cta', 'Quer uma página assim?']];
  return (
    <AbsoluteFill>
      <Palco seed={21} />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Carrosséis, artes', 'e Reels com a', '**sua marca.**']} ini={0} tam={84} fim={d} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, height: 700, perspective: 1600 }}>
        {slides.map(([t, tit], i) => {
          const s = spring({ frame: f - 10 - i * 12, fps, config: { damping: 16, stiffness: 120 } });
          const x = 540 + (i - 1) * 290; const rot = (i - 1) * -18;
          return <div key={i} style={{ position: 'absolute', left: x - 190, top: 0, transform: `translateY(${(1 - s) * 800}px) rotateY(${rot * s + Math.sin(f / 30 + i) * 3}deg) translateZ(${i === 1 ? 80 : 0}px)`, zIndex: i === 1 ? 2 : 1 }}><SlideMini tipo={t} titulo={tit} semente={70 + i} w={380} /></div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
const V9d: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tipos: ('capa' | 'texto' | 'cta')[] = ['capa', 'texto', 'cta', 'texto', 'capa', 'texto', 'cta', 'capa', 'texto'];
  return (
    <AbsoluteFill>
      <Palco seed={23} />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['**Todo mês.**']} ini={0} tam={120} fim={d} /></div>
      <Apoio texto="Você aprova. A gente programa." ini={14} tam={52} style={{ position: 'absolute', left: 80, top: 400 }} fim={d} />
      <div style={{ position: 'absolute', left: 120, top: 560, display: 'grid', gridTemplateColumns: 'repeat(3, 270px)', gap: 12 }}>
        {tipos.map((t, i) => {
          const s = spring({ frame: f - 10 - i * 4, fps, config: { damping: 14, stiffness: 200 } });
          return <div key={i} style={{ width: 270, height: 270, overflow: 'hidden', borderRadius: 14, transform: `scale(${s})` }}><div style={{ transform: 'scale(0.6136)', transformOrigin: 'top left' }}><SlideMini tipo={t} titulo={['Antes de te chamar', 'Fotos reais', 'Agende já', 'Avaliações', 'Seu Google', 'Horários', 'Quer uma assim?', 'Bio que vende', 'Preço à vista'][i]} semente={80 + i} /></div></div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
export const CENAS_V9: CenaDef[] = [
  { C: V9a, d: 90 },
  { C: V9b, d: 120, entrada: 'whip' },
  { C: V9c, d: 135, cortina: true },
  { C: V9d, d: 105, entrada: 'zoom' },
  { C: (p) => <CtaPro {...p} linhas={['Pede um **exemplo**', 'com a sua marca.']} apoio="Chama no direct." semente={63} />, d: 105, cortina: true, logo: false },
];
export const FALAS_V9 = [
  'Post bonito não paga boleto.',
  'O que vende é o post que explica o que você faz, pra quem é e como marcar.',
  'A gente cria carrosséis, artes e Reels com a sua marca.',
  'Todo mês. Você aprova e a gente programa.',
  'Me chama no direct e pede um exemplo com a sua marca.',
];

// ═════════ V10 — Google sem avaliações (com voz) ═════════
const Estrelas: React.FC<{ nota: number; tam?: number }> = ({ nota, tam = 70 }) => (
  <span style={{ position: 'relative', display: 'inline-block', fontSize: tam, letterSpacing: 6, color: '#4A4250' }}>
    ★★★★★
    <span style={{ position: 'absolute', left: 0, top: 0, width: `${(nota / 5) * 100}%`, overflow: 'hidden', color: '#F2B33D', whiteSpace: 'nowrap' }}>★★★★★</span>
  </span>
);
const V10a: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Palco seed={25} luz1="rgba(120,100,140,.25)" />
      <div style={{ position: 'absolute', left: 80, top: 300, display: 'flex', alignItems: 'baseline', gap: 26, opacity: interpolate(f, [0, 8], [0, 1], cl) }}>
        <span style={{ fontFamily: D, fontWeight: 900, fontSize: 220, color: C.branco, letterSpacing: '-0.05em' }}><Contador de={5} ate={4.1} ini={0} dur={24} casas={1} /></span>
        <Estrelas nota={interpolate(f, [0, 24], [5, 4.1], cl)} />
      </div>
      <Apoio texto="9 avaliações" ini={14} tam={56} style={{ position: 'absolute', left: 84, top: 560 }} fim={d} />
      <div style={{ position: 'absolute', left: 80, top: 900 }}><Linhas linhas={['O cliente', '**nem clica.**']} ini={30} tam={124} fim={d} /></div>
    </AbsoluteFill>
  );
};
const V10b: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Palco seed={27} />
    <div style={{ position: 'absolute', left: 80, top: 640 }}><Linhas linhas={['Ele escolhe quem', '**passa confiança.**']} ini={0} tam={104} fim={d} /></div>
  </AbsoluteFill>
);
const ITENS10 = ['Fotos do espaço', 'Horários certos', 'Serviços e preços', 'Link pra sua página'];
const V10c: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 16, stiffness: 130 } });
  return (
    <AbsoluteFill>
      <Palco seed={29} />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Perfil do Google', '**completo:**']} ini={0} tam={92} fim={d} /></div>
      <div style={{ position: 'absolute', left: 80, top: 520, width: 920, borderRadius: 36, background: C.branco, padding: '36px 40px', transform: `translateY(${(1 - s) * 300}px)`, opacity: Math.min(1, s), overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontFamily: D, fontWeight: 900, fontSize: 62, color: C.ink }}>Studio Bella</span>
          <span style={{ fontFamily: B, fontWeight: 800, fontSize: 44, color: C.ink }}><Contador de={4.1} ate={4.9} ini={70} dur={50} casas={1} /></span>
          <Estrelas nota={interpolate(f, [70, 120], [4.1, 4.9], cl)} tam={40} />
        </div>
        {ITENS10.map((t, i) => {
          const p = interpolate(f, [16 + i * 12, 26 + i * 12], [0, 1], { ...cl, easing: ease });
          return <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 22, fontFamily: B, fontWeight: 700, fontSize: 44, color: C.ink, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}><span style={{ width: 54, height: 54, borderRadius: 16, background: '#E6F4EC', color: '#1F7A4A', display: 'grid', placeItems: 'center', fontWeight: 900 }}>✓</span>{t}</div>;
        })}
        <Brilho em={110} raio={36} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 150, top: 1180 }}>
        <Balao texto="Que bom que gostou! Se puder, deixa sua avaliação aqui: [link]" lado="dir" cor="#1F8F55" ini={66} tam={42} hora="pedido automático" />
      </div>
    </AbsoluteFill>
  );
};
const PERG = 'Onde fazer unha em Moema?';
const V10d: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const n = Math.max(0, Math.min(PERG.length, Math.floor((f - 8) / 1.4)));
  const r = spring({ frame: f - 52, fps, config: { damping: 15, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Palco seed={31} luz1="rgba(254,168,255,.2)" />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Linhas linhas={['Pronto pra ser', '**recomendado.**']} ini={0} tam={100} fim={d} /></div>
      <div style={{ position: 'absolute', right: 150, top: 600, padding: '28px 38px', borderRadius: '40px 40px 10px 40px', background: C.el, color: C.branco, fontFamily: B, fontWeight: 700, fontSize: 48 }}>{PERG.slice(0, n) || ' '}</div>
      <div style={{ position: 'absolute', left: 80, top: 790, width: 840, padding: '34px 40px', borderRadius: '40px 40px 40px 10px', background: C.branco, transform: `translateY(${(1 - r) * 60}px)`, opacity: Math.min(1, r) }}>
        <div style={{ fontFamily: B, fontWeight: 600, fontSize: 36, color: C.fg2 }}>Uma opção bem avaliada é o</div>
        <div style={{ fontFamily: D, fontWeight: 900, fontSize: 68, color: C.ink, marginTop: 6 }}>Studio Bella</div>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 6 }}>★ 4,9 · agenda online · Moema</div>
      </div>
      <Apoio texto="exemplo ilustrativo" ini={70} tam={30} cor="#9A90A3" style={{ position: 'absolute', left: 84, top: 1190 }} />
    </AbsoluteFill>
  );
};
export const CENAS_V10: CenaDef[] = [
  { C: V10a, d: 90 },
  { C: V10b, d: 75, entrada: 'whip' },
  { C: V10c, d: 165, cortina: true },
  { C: V10d, d: 105, entrada: 'zoom' },
  { C: (p) => <CtaPro {...p} linhas={['Arruma seu Google', '**com a gente.**']} apoio="Chama no direct." semente={73} />, d: 105, cortina: true, logo: false },
];
export const FALAS_V10 = [
  'Nota quatro vírgula um, e só nove avaliações. O cliente nem clica.',
  'Ele escolhe quem passa mais confiança.',
  'A gente deixa o seu perfil do Google completo, com fotos, horários e serviços, e automatiza o pedido de avaliação depois de cada atendimento.',
  'E deixa o seu negócio pronto pra ser recomendado, até pelas IAs.',
  'Me chama no direct e arruma o seu Google com a gente.',
];

export const V8 = (p: any) => <Roteiro cenas={CENAS_V8} {...p} />;
export const V9 = (p: any) => <Roteiro cenas={CENAS_V9} {...p} />;
export const V10 = (p: any) => <Roteiro cenas={CENAS_V10} {...p} />;
