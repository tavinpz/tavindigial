import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, D, B, Titulo, Celular, Selo, Fundo, Padrao, Cortina, Logo, Assinatura, entra, sai, ease } from '../marca';

// Vídeo 2 — "Seu link da bio está espantando cliente": lista de links × página da bio animada (R$ 147)
export const DUR_V2 = [90, 150, 180, 120, 150];

const Gancho: React.FC<{ d: number }> = ({ d }) => (
  <AbsoluteFill>
    <Fundo />
    <Padrao cols={2} lins={4} lado={130} x={800} y={1180} ini={16} fim={d} semente={31} />
    <div style={{ position: 'absolute', left: 80, top: 560 }}>
      <Titulo texto="Seu link da bio está *espantando* cliente." ini={4} tam={130} fim={d} />
    </div>
  </AbsoluteFill>
);

// Lista de links genérica (sem marca de nenhuma ferramenta)
const ListaLinks: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: '100%', height: '100%', background: '#E9E7EC', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 110, gap: 18, fontFamily: B }}>
      <div style={{ width: 130, height: 130, borderRadius: 99, background: '#C9C5CE' }} />
      <div style={{ fontSize: 34, fontWeight: 700, color: '#57525C', marginBottom: 20 }}>@seunegocio</div>
      {['WhatsApp', 'Instagram', 'Localização', 'Catálogo', 'Promoções'].map((t, i) => (
        <div key={t} style={{ width: '82%', height: 78, borderRadius: 18, background: '#FFFFFF', border: '2px solid #D6D2DA', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 700, color: '#57525C', opacity: entra(f, 6 + i * 4, 10) }}>{t}</div>
      ))}
    </div>
  );
};

const Lista: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <AbsoluteFill>
      <Fundo luz="rgba(120,110,130,.18)" />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Titulo texto="O que o cliente vê hoje:" ini={2} tam={80} fim={d} /></div>
      <Celular largura={470} style={{ left: 530, top: 400 + (1 - s) * 1200, filter: `saturate(${1 - entra(f, 60, 30) * 0.6})` }}><ListaLinks /></Celular>
      <Selo texto="Sem foto do seu trabalho" icone="✕" ini={44} fim={d} tam={40} style={{ left: 60, top: 720 }} />
      <Selo texto="Sem preço" icone="✕" ini={72} fim={d} tam={40} style={{ left: 60, top: 880 }} />
      <Selo texto="Igual a todo mundo" icone="✕" ini={100} fim={d} tam={40} style={{ left: 60, top: 1040 }} />
    </AbsoluteFill>
  );
};

const TELAS: [string, number][] = [['telas/demo_nail.png', 780], ['telas/demo_barbearia.png', 780], ['telas/demo_tatuagem.png', 780], ['telas/demo_hamburgueria.png', 780], ['telas/demo_pet.png', 780]];
const Troca: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  // primeira tela fica mais tempo; depois cortes rápidos no ritmo da música
  const marcos = [0, 66, 94, 122, 150];
  let k = 0; marcos.forEach((m, i) => { if (f >= m) k = i; });
  const local = f - marcos[k];
  const pulo = interpolate(local, [0, 6], [1.06, 1], { extrapolateRight: 'clamp', easing: ease });
  const [src, w] = TELAS[k];
  return (
    <AbsoluteFill>
      <Fundo luz="rgba(254,168,255,.2)" />
      <div style={{ position: 'absolute', left: 80, top: 220 }}><Titulo texto="O que ele *poderia* ver:" ini={2} tam={80} fim={d} /></div>
      <div style={{ position: 'absolute', left: 230, top: 420, transform: `scale(${pulo})`, transformOrigin: '310px 600px' }}>
        <Celular key={src} src={src} imgLargura={w} largura={620} rolar={k === 0 ? [[0, 0], [12, 0], [60, 420]] : [[0, 0], [28, 180]]} style={{ left: 0, top: 0 }} />
      </div>
    </AbsoluteFill>
  );
};

const ITENS = ['Seus serviços e preços', 'Botão que já abre o WhatsApp', 'Nota e avaliações do Google', 'Animada, com a sua marca'];
const Lista2: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{ position: 'absolute', left: 80, top: 300 }}><Titulo texto="Uma página *só sua*, com:" ini={2} tam={100} fim={d} /></div>
      {ITENS.map((t, i) => {
        const s = spring({ frame: f - 20 - i * 12, fps, config: { damping: 15, stiffness: 160 } });
        return (
          <div key={t} style={{ position: 'absolute', left: 80, top: 640 + i * 170, display: 'flex', alignItems: 'center', gap: 30, opacity: Math.min(1, s) * sai(f, d, 8), transform: `translateX(${(1 - s) * -200}px)` }}>
            <span style={{ width: 92, height: 92, borderRadius: 26, background: C.el, color: C.branco, display: 'grid', placeItems: 'center', fontSize: 52, fontWeight: 800, fontFamily: B }}>✓</span>
            <span style={{ fontFamily: B, fontWeight: 800, fontSize: 58, color: C.branco }}>{t}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Oferta: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 8, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ background: C.el }}>
      <Padrao cols={6} lins={2} lado={180} x={0} y={1560} ini={4} semente={41} />
      <div style={{ position: 'absolute', left: 80, top: 300 }}><Logo tamanho={46} /></div>
      <div style={{ position: 'absolute', left: 80, top: 470, width: 920, borderRadius: 44, background: C.noite, padding: '52px 56px', transform: `scale(${0.85 + s * 0.15})`, opacity: Math.min(1, s), transformOrigin: 'left top' }}>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 48, color: '#CFC6D6' }}>Página da bio</div>
        <div style={{ fontFamily: D, fontWeight: 900, fontSize: 170, letterSpacing: '-0.04em', color: C.branco, lineHeight: 1.05 }}>R$ 147</div>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 46, color: C.rosa }}>pronta em 24 horas</div>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1000 }}><Titulo texto="Você vê a *prévia grátis* antes de pagar." ini={22} tam={78} destaque={C.noite} largura={920} /></div>
      <div style={{ position: 'absolute', left: 80, top: 1300, fontFamily: B, fontWeight: 800, fontSize: 52, color: C.branco, opacity: entra(f, 50) }}>
        Chama no direct · <span style={{ color: C.noite }}>@tavindigital</span>
      </div>
    </AbsoluteFill>
  );
};

export const V2Bio: React.FC<{ dur?: number[] }> = ({ dur = DUR_V2 }) => {
  const cenas = [Gancho, Lista, Troca, Lista2, Oferta];
  let t = 0; const ini = dur.map((d) => { const i = t; t += d; return i; });
  return (
    <AbsoluteFill style={{ background: C.noite }}>
      {cenas.map((Cena, i) => <Sequence key={i} from={ini[i]} durationInFrames={dur[i]}><Cena d={dur[i]} /></Sequence>)}
      {ini.slice(1).map((em, i) => <Cortina key={i} em={em} semente={9 + i} />)}
      <Sequence from={0} durationInFrames={ini[4]}><Assinatura /></Sequence>
    </AbsoluteFill>
  );
};
