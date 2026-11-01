// F12 (claro) — Funcionalidade: importar a base de pacientes. Telas reais (dados fictícios): Leads → Importar,
// planilha, mapeamento sugerido pela IA, contexto da base, revisão e resultado (importados, já existiam, inválidos).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F12 = 600;
const D = 'telas/imp/', W = 1880, H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'j0_lista.png', iw: W, ih: H, ini: 0, fim: 100, cam: [[0, 940, 1000, 0.54], [66, 940, 1000, 0.54], [84, 1250, 700, 0.8]],
    cursor: [[72, 1000, 900], [90, 1423, 150]], cliques: [96] },
  { img: D + 'j1_upload.png', iw: W, ih: H, ini: 100, fim: 150, cam: [[100, 940, 1000, 0.54], [118, 940, 1100, 0.8]],
    cursor: [[104, 1300, 1500], [126, 940, 1170]], cliques: [134], realce: { box: [441, 899, 1000, 444], ini: 112, fim: 150 } },
  { img: D + 'j2_campos.png', iw: W, ih: H, ini: 150, fim: 240, cam: [[150, 940, 1000, 0.54], [172, 720, 700, 0.8], [200, 720, 700, 0.8], [216, 1200, 1300, 0.8]],
    cursor: [[210, 1300, 1400], [228, 1675, 1821]], cliques: [234], realce: { box: [90, 470, 640, 70], ini: 176, fim: 206 } },
  { img: D + 'j3_contexto.png', iw: W, ih: H, ini: 240, fim: 280, cam: [[240, 940, 1000, 0.54], [258, 700, 1000, 0.8]],
    cursor: [[244, 900, 1300], [264, 294, 906]], cliques: [272] },
  { img: D + 'j3b_escolhido.png', iw: W, ih: H, ini: 280, fim: 330, cam: [[280, 700, 1000, 0.8], [296, 940, 1100, 0.56]],
    cursor: [[300, 1000, 1000], [320, 1675, 1821]], cliques: [326], realce: { box: [120, 1060, 1640, 320], ini: 284, fim: 316 } },
  { img: D + 'j4_revisar.png', iw: W, ih: H, ini: 330, fim: 375, cam: [[330, 940, 1000, 0.54], [350, 940, 900, 0.58]], realce: { box: [97, 485, 1684, 176], ini: 350, fim: 375 } },
  { img: D + 'j4b_cadencia.png', iw: W, ih: H, ini: 375, fim: 405, cam: [[375, 1250, 1300, 0.8]],
    cursor: [[375, 1300, 1400], [394, 1594, 1821]], cliques: [400] },
  { img: D + 'j5_feito.png', iw: W, ih: H, ini: 405, fim: 600, cam: [[405, 940, 1000, 0.54], [470, 940, 1000, 0.54]], realce: { box: [97, 940, 1684, 235], ini: 412, fim: 470 } },
];

export const F12: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Importe seus pacientes\n*de uma vez.*'} ini={2} fim={70} tam={80} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Suba a planilha" ini={72} fim={150} />
      <Etapa n="2" t="A IA reconhece as colunas" ini={150} fim={240} />
      <Etapa n="3" t="Diga quem são essas pessoas" ini={240} fim={330} />
      <Etapa n="4" t="Revise e importe" ini={330} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Base inteira\n*dentro da Thata.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/lista" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F12" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Sua base,\n*pronta pra conversar.*'} /></div>}
    </AbsoluteFill>
  );
};
