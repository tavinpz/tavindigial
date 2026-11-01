// F3 (claro) — Funcionalidade: campanha com uma lista. Telas reais (dados fictícios): canal WhatsApp → sobe a planilha e
// confere as colunas → mensagem com {{nome}} → cadência de follow-up → previsão e criar → campanha rodando com os números.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F3 = 600;
const D = 'telas/camp/', H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'c2_canal.png', ih: H, ini: 0, fim: 140, cam: [[0, 1700, 700, 0.55], [70, 1700, 700, 0.55], [104, 1100, 660, 0.78]],
    cursor: [[80, 1700, 1300], [118, 1040, 700]], cliques: [126], realce: { box: [709, 409, 670, 502], ini: 104, fim: 140 } },
  { img: D + 'c5_mapear.png', ih: H, ini: 140, fim: 220, cam: [[140, 1720, 1200, 0.6], [180, 1720, 1500, 0.72]],
    cursor: [[160, 2300, 1400], [196, 1760, 1776]], cliques: [204], realce: { box: [1012, 1722, 1496, 108], ini: 180, fim: 220 } },
  { img: D + 'c7_msg.png', ih: H, ini: 220, fim: 290, cam: [[220, 1760, 900, 0.62], [262, 1760, 1120, 0.72]], realce: { box: [990, 1260, 1540, 220], ini: 250, fim: 290 } },
  { img: D + 'c8_agenda.png', ih: H, ini: 290, fim: 370, cam: [[290, 1760, 1000, 0.6], [324, 1760, 1450, 0.75]],
    cursor: [[304, 2300, 1200], [336, 1500, 1525]], cliques: [344], realce: { box: [998, 1478, 1524, 94], ini: 330, fim: 370 } },
  { img: D + 'c8b_criar.png', ih: H, ini: 370, fim: 432, cam: [[370, 1760, 1500, 0.6], [400, 1760, 1700, 0.68]],
    cursor: [[380, 2300, 1500], [410, 1760, 1942]], cliques: [418], realce: { box: [948, 1884, 1624, 116], ini: 404, fim: 432 } },
  { img: D + 'c9_criada.png', ih: H, ini: 432, fim: 600, cam: [[432, 2100, 560, 0.62], [462, 1214, 1340, 0.8], [486, 1214, 1340, 0.84]] },
];

export const F3: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Uma lista.\n*Uma campanha inteira.*'} ini={2} fim={70} tam={88} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Escolha o canal" ini={72} fim={140} />
      <Etapa n="2" t="Suba a planilha da lista" ini={140} fim={220} />
      <Etapa n="3" t="Escreva a mensagem" ini={220} fim={290} />
      <Etapa n="4" t="Ligue o follow-up" ini={290} fim={370} />
      <Etapa n="5" t="Confira e crie" ini={370} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Disparando,\n*com follow-up junto.*'} ini={434} fim={486} tam={80} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/campanhas" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F3" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Uma lista.\n*A Thata faz o resto.*'} /></div>}
    </AbsoluteFill>
  );
};
