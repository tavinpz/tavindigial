// F1 (claro) — Funcionalidade: conectar o WhatsApp. Telas reais da Thata publicada (dados fictícios):
// Conectar WhatsApp → API Não Oficial → nome, número e assistente → Criar Instância → código no celular → conectado.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F1 = 600;
const D = 'telas/wpp/';
const PASSOS: Passo[] = [
  { img: D + 'w1_vazio.png', ini: 0, fim: 140, cam: [[0, 1700, 900, 0.6], [62, 1640, 900, 0.6], [100, 1760, 1122, 0.78]],
    cursor: [[72, 2400, 1560], [112, 1760, 1122]], cliques: [120], realce: { box: [1535, 1076, 451, 92], ini: 100, fim: 140 } },
  { img: D + 'w2_escolha.png', ini: 140, fim: 215, cam: [[140, 1440, 900, 0.6], [168, 1440, 1060, 0.66]],
    cursor: [[150, 1900, 1400], [186, 1400, 1110]], cliques: [194], realce: { box: [1032, 1012, 812, 236], ini: 170, fim: 215 } },
  { img: D + 'w4_preenchido.png', ini: 215, fim: 285, cam: [[215, 1440, 560, 0.62], [270, 1440, 760, 0.62]],
    cursor: [[230, 1600, 1150], [256, 1192, 919]], cliques: [262], realce: { box: [954, 871, 476, 96], ini: 240, fim: 285 } },
  { img: D + 'w4b_criar.png', ini: 285, fim: 345, cam: [[285, 1440, 1250, 0.62], [310, 1690, 1520, 0.8]],
    cursor: [[292, 1300, 1350], [326, 1690, 1648]], cliques: [334], realce: { box: [1454, 1606, 472, 84], ini: 316, fim: 345 } },
  { img: D + 'w5_codigo.png', ini: 345, fim: 410, cam: [[345, 1440, 900, 0.58], [372, 1440, 830, 0.95]], realce: { box: [1134, 754, 612, 102], ini: 372, fim: 410 } },
  { img: D + 'w7_conectado.png', ini: 410, fim: 452, cam: [[410, 1440, 1000, 0.62], [452, 1440, 1000, 0.7]] },
  { img: D + 'w8_lista.png', ini: 452, fim: 600, cam: [[452, 1234, 734, 0.62], [486, 1234, 734, 0.72]] },
];

export const F1: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Conecte o WhatsApp\n*em poucos cliques.*'} ini={2} fim={70} tam={84} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Clique em Conectar WhatsApp" ini={72} fim={140} />
      <Etapa n="2" t="Escolha a conexão por código" ini={140} fim={215} />
      <Etapa n="3" t="Nome, número e quem responde" ini={215} fim={345} />
      <Etapa n="4" t="Digite o código no celular" ini={345} fim={410} />
      {f >= 410 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'WhatsApp *conectado.*\nA Thata já atende.'} ini={412} fim={486} tam={80} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/whatsapp" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F1" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Só o celular na mão.\n*A Thata atende.*'} /></div>}
    </AbsoluteFill>
  );
};
