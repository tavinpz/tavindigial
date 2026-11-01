// F10 (escuro no print, fundo claro) — Funcionalidade: configurar a assistente. Telas reais do editor (dados fictícios):
// identidade, negócio, fluxo da conversa com condições, objeções e respostas, salvar.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F10 = 600;
const D = 'telas/ass/', W = 2400;
const PASSOS: Passo[] = [
  { img: D + 'h1_identidade.png', iw: W, ini: 0, fim: 150, cam: [[0, 1200, 900, 0.42], [66, 1200, 900, 0.42], [96, 1480, 800, 0.66], [124, 1480, 800, 0.66], [136, 950, 900, 0.62]],
    cursor: [[124, 1500, 1100], [142, 461, 540]], cliques: [148], realce: { box: [798, 765, 1364, 160], ini: 98, fim: 128 } },
  { img: D + 'h2_negocio.png', iw: W, ini: 150, fim: 232, cam: [[150, 950, 900, 0.62], [172, 1480, 700, 0.66], [204, 1480, 700, 0.66], [216, 950, 900, 0.62]],
    cursor: [[208, 1500, 1000], [222, 461, 658]], cliques: [229], realce: { box: [798, 779, 1364, 140], ini: 176, fim: 206 } },
  { img: D + 'h3_fluxo.png', iw: W, ini: 232, fim: 330, cam: [[232, 950, 900, 0.62], [256, 1480, 830, 1.2], [290, 1480, 1000, 1.2], [310, 950, 900, 0.62]],
    cursor: [[308, 1400, 1000], [322, 461, 776]], cliques: [328], realce: { box: [1212, 930, 540, 190], ini: 270, fim: 304 } },
  { img: D + 'h4_objecoes.png', iw: W, ini: 330, fim: 372, cam: [[330, 950, 900, 0.62], [350, 1480, 900, 0.66]],
    cursor: [[340, 1500, 1200], [360, 2072, 923]], cliques: [366] },
  { img: D + 'h4b_nova.png', iw: W, ini: 372, fim: 432, cam: [[372, 1480, 900, 0.66], [400, 1480, 800, 0.66]],
    cursor: [[372, 2072, 923], [412, 1952, 200]], cliques: [424], realce: { box: [828, 712, 1304, 214], ini: 378, fim: 410 } },
  { img: D + 'h5_salvo.png', iw: W, ini: 432, fim: 600, cam: [[432, 1480, 800, 0.66], [462, 1200, 900, 0.42]] },
];

export const F10: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Ensine a Thata\n*sobre a sua clínica.*'} ini={2} fim={70} tam={84} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Nome e primeira mensagem" ini={72} fim={150} />
      <Etapa n="2" t="O que a clínica faz e oferece" ini={150} fim={232} />
      <Etapa n="3" t="O caminho da conversa" ini={232} fim={330} />
      <Etapa n="4" t="Como responder às objeções" ini={330} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Salvou,\n*e pronto.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/assistentes" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F10" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Do jeito da sua clínica.\n*Sem programar nada.*'} /></div>}
    </AbsoluteFill>
  );
};
