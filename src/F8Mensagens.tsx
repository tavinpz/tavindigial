// F8 (claro) — Funcionalidade: Mensagens. Telas reais (dados fictícios): a Thata conversa no WhatsApp, você pausa a IA
// escolhendo quando ela volta, responde do mesmo lugar e a IA retoma sozinha no horário escolhido.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F8 = 600;
const D = 'telas/msg/';
const PASSOS: Passo[] = [
  { img: D + 'g1_conversa.png', ini: 0, fim: 170, cam: [[0, 1440, 900, 0.36], [66, 1440, 900, 0.36], [100, 2160, 1050, 0.74], [130, 2160, 1250, 0.74], [150, 2300, 700, 0.8]],
    cursor: [[132, 2000, 1200], [156, 2594, 352]], cliques: [162], realce: { box: [2484, 319, 220, 66], ini: 146, fim: 170 } },
  { img: D + 'g2_modal.png', ini: 170, fim: 215, cam: [[170, 1440, 900, 0.8], [190, 1440, 900, 1.1]],
    cursor: [[176, 1300, 1150], [198, 1619, 744]], cliques: [205], realce: { box: [1474, 727, 290, 34], ini: 192, fim: 215 } },
  { img: D + 'g3_escolhido.png', ini: 215, fim: 260, cam: [[215, 1440, 900, 1.1], [236, 1520, 1000, 1.1]],
    cursor: [[215, 1619, 744], [240, 1693, 1243]], cliques: [248], realce: { box: [1597, 1205, 193, 76], ini: 232, fim: 260 } },
  { img: D + 'g4_pausada.png', ini: 260, fim: 300, cam: [[260, 2120, 700, 0.74], [290, 2120, 560, 0.8]], realce: { box: [1592, 460, 1059, 80], ini: 272, fim: 300 } },
  { img: D + 'g5_digitado.png', ini: 300, fim: 350, cam: [[300, 2120, 1300, 0.78], [322, 2240, 1500, 0.82]],
    cursor: [[304, 2300, 1400], [330, 2703, 1660]], cliques: [338], realce: { box: [1670, 1621, 825, 78], ini: 306, fim: 330 } },
  { img: D + 'g6_enviado.png', ini: 350, fim: 600, cam: [[350, 2160, 1450, 0.8], [384, 2160, 1400, 0.8], [408, 2160, 700, 0.8], [440, 1440, 900, 0.36]],
    realce: { box: [1952, 1404, 770, 130], ini: 356, fim: 396 } },
];

export const F8: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Você assume a conversa\n*quando quiser.*'} ini={2} fim={70} tam={80} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="A Thata conversa sozinha" ini={72} fim={170} />
      <Etapa n="2" t="Pause e escolha quando ela volta" ini={170} fim={260} />
      <Etapa n="3" t="Responda do mesmo lugar" ini={260} fim={350} />
      <Etapa n="4" t="Na hora marcada, a IA volta" ini={350} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Você no controle.\n*A IA no resto.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/mensagens" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F8" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'A Thata atende.\n*Você assume quando quiser.*'} /></div>}
    </AbsoluteFill>
  );
};
