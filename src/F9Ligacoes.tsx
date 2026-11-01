// F9 (claro) — Funcionalidade: Ligações. Telas reais (dados fictícios): métricas e histórico de chamadas da Thata,
// detalhe com resultado e gravação, transcrição fala a fala e o resumo automático da IA.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F9 = 600;
const D = 'telas/lig/';
const PASSOS: Passo[] = [
  { img: D + 'k1_lista.png', ini: 0, fim: 160, cam: [[0, 1440, 900, 0.36], [70, 1440, 900, 0.36], [100, 1590, 880, 0.6], [122, 1590, 880, 0.6], [136, 1960, 880, 0.6], [150, 1700, 1000, 0.6]],
    cursor: [[132, 2300, 700], [150, 1300, 1000]], cliques: [156], realce: { box: [752, 270, 1500, 230], ini: 98, fim: 122 } },
  { img: D + 'k2_detalhe.png', ini: 160, fim: 250, cam: [[160, 1700, 700, 0.5], [184, 2265, 560, 0.9]],
    cursor: [[196, 2400, 1000], [222, 1836, 683]], cliques: [230], realce: { box: [1760, 540, 1020, 230], ini: 188, fim: 250 } },
  { img: D + 'k3_transcricao.png', ini: 250, fim: 340, cam: [[250, 2265, 1100, 0.9], [282, 2265, 1300, 0.9], [312, 2265, 1300, 0.9], [326, 2265, 1000, 0.9]],
    cursor: [[312, 2500, 1300], [330, 2046, 631]], cliques: [336], realce: { box: [1842, 1673, 932, 84], ini: 280, fim: 316 } },
  { img: D + 'k4_analise.png', ini: 340, fim: 600, cam: [[340, 2265, 1000, 0.9], [366, 2265, 1150, 0.9], [440, 1440, 900, 0.36]],
    realce: { box: [1760, 1250, 1020, 200], ini: 362, fim: 430 } },
];

export const F9: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Toda ligação da Thata,\n*num lugar só.*'} ini={2} fim={70} tam={80} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Números de todas as ligações" ini={72} fim={160} />
      <Etapa n="2" t="Abra e ouça a gravação" ini={160} fim={250} />
      <Etapa n="3" t="Leia a conversa fala a fala" ini={250} fim={340} />
      <Etapa n="4" t="A IA resume o combinado" ini={340} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Nenhuma ligação\n*se perde.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/ligacoes" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F9" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Cada ligação,\n*gravada e resumida.*'} /></div>}
    </AbsoluteFill>
  );
};
