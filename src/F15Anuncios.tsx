// F15 (claro) — Funcionalidade: origem do anúncio (Meta Ads). Telas reais (dados fictícios): card Meta Ads conectado,
// selo de anúncio nas conversas, filtro por campanha e a aba Anúncio da ficha (criativo, campanha, conjunto).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F15 = 600;
const D = 'telas/ads/';
const PASSOS: Passo[] = [
  { img: D + 'v1_meta.png', ini: 0, fim: 150, cam: [[0, 1440, 900, 0.36], [66, 1440, 900, 0.36], [96, 1060, 1177, 0.85]], realce: { box: [720, 810, 520, 940], ini: 104, fim: 148 } },
  { img: D + 'v2_lista.png', ini: 150, fim: 240, cam: [[150, 1100, 900, 0.62], [172, 1000, 700, 0.85]],
    cursor: [[210, 1200, 900], [228, 1338, 528]], cliques: [234], realce: { box: [980, 795, 60, 50], ini: 176, fim: 212 } },
  { img: D + 'v3_menu.png', ini: 240, fim: 268, cam: [[240, 1550, 800, 0.85]],
    cursor: [[240, 1338, 528], [258, 1475, 697]], cliques: [264], realce: { box: [1296, 576, 636, 370], ini: 244, fim: 266 } },
  { img: D + 'v4_filtrado.png', ini: 268, fim: 330, cam: [[268, 1100, 800, 0.85]],
    cursor: [[296, 1300, 900], [316, 970, 870]], cliques: [324], realce: { box: [700, 650, 760, 70], ini: 274, fim: 312 } },
  { img: D + 'v5_ficha.png', ini: 330, fim: 352, cam: [[330, 1440, 900, 0.62]],
    cursor: [[330, 1200, 1100], [342, 882, 673]], cliques: [348] },
  { img: D + 'v6_anuncio.png', ini: 352, fim: 600, cam: [[352, 1440, 900, 0.62], [372, 1615, 1000, 0.85], [432, 1615, 1000, 0.85], [456, 1440, 900, 0.62]], realce: { box: [1110, 590, 1010, 850], ini: 376, fim: 430 } },
];

export const F15: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'De qual anúncio\n*veio cada paciente?*'} ini={2} fim={70} tam={80} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Conecte o Meta Ads" ini={72} fim={150} />
      <Etapa n="2" t="Lead de anúncio chega marcado" ini={150} fim={240} />
      <Etapa n="3" t="Filtre por campanha" ini={240} fim={330} />
      <Etapa n="4" t="A ficha mostra o anúncio" ini={330} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Agora você sabe\n*o que funciona.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F15" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Invista no anúncio\n*que traz paciente.*'} /></div>}
    </AbsoluteFill>
  );
};
