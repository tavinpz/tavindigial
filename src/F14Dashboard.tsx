// F14 (claro) — Funcionalidade: Dashboard. Telas reais (dados fictícios): filtro de período, KPIs (atendimentos,
// consultas, receita estimada), conversão da Thata com origem dos leads, gráfico semana a semana, melhor horário.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F14 = 600;
const D = 'telas/dash/', H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'y0_hoje.png', ih: H, ini: 0, fim: 150, cam: [[0, 1440, 1000, 0.53], [66, 1440, 1000, 0.53], [92, 1700, 757, 0.7]],
    cursor: [[104, 1500, 1100], [132, 1954, 714]], cliques: [140], realce: { box: [1902, 684, 105, 60], ini: 100, fim: 140 } },
  { img: D + 'y1_30d.png', ih: H, ini: 150, fim: 240, cam: [[150, 1700, 757, 0.7], [172, 2047, 700, 0.6]], realce: { box: [1760, 225, 1040, 380], ini: 178, fim: 236 } },
  { img: D + 'y1_30d.png', ih: H, ini: 240, fim: 330, cam: [[240, 2047, 700, 0.6], [258, 2213, 900, 0.75], [296, 2213, 900, 0.75], [312, 1500, 900, 0.6]],
    cursor: [[300, 1700, 1300], [318, 986, 855]], cliques: [325], realce: { box: [2240, 630, 600, 580], ini: 262, fim: 300 } },
  { img: D + 'y2_semanas.png', ih: H, ini: 330, fim: 432, cam: [[330, 1500, 900, 0.6], [352, 1455, 1145, 0.62]], realce: { box: [720, 900, 1480, 830], ini: 356, fim: 430 } },
  { img: D + 'y3_padroes.png', ih: H, ini: 432, fim: 600, cam: [[432, 1200, 1270, 0.62], [470, 1200, 1270, 0.62], [492, 1440, 1000, 0.53]], realce: { box: [680, 1040, 700, 460], ini: 440, fim: 486 } },
];
export const F14: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Seu painel,\n*com número de verdade.*'} ini={2} fim={70} tam={80} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Escolha o período" ini={72} fim={150} />
      <Etapa n="2" t="Atendimentos, consultas e receita" ini={150} fim={240} />
      <Etapa n="3" t="Quanto da conversa vira consulta" ini={240} fim={330} />
      <Etapa n="4" t="A evolução, semana a semana" ini={330} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'E o melhor\n*horário pra ligar.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/dashboard" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F14" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Decida olhando\n*o que importa.*'} /></div>}
    </AbsoluteFill>
  );
};
