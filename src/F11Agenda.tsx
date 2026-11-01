// F11 (claro) — Funcionalidade: Calendário. Telas reais (dados fictícios): mês com os agendamentos da IA e manuais,
// horários por dia da semana, travar um dia (congresso) e o dia travado no calendário.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F11 = 600;
const D = 'telas/cal/';
const PASSOS: Passo[] = [
  { img: D + 'd1_mes.png', ini: 0, fim: 160, cam: [[0, 1440, 900, 0.36], [66, 1440, 900, 0.36], [98, 1780, 900, 0.6], [124, 2074, 870, 0.62]],
    cursor: [[138, 2300, 900], [154, 1410, 115]], cliques: [158], realce: { box: [2440, 760, 370, 640], ini: 126, fim: 150 } },
  { img: D + 'd2_editar.png', ini: 160, fim: 250, cam: [[160, 1440, 900, 0.62], [186, 1440, 1150, 0.9]], realce: { box: [920, 1170, 1040, 220], ini: 192, fim: 240 } },
  { img: D + 'd3_travar.png', ini: 250, fim: 310, cam: [[250, 1440, 900, 0.62], [272, 1440, 880, 0.9]],
    cursor: [[280, 1700, 700], [300, 1357, 899]], cliques: [306], realce: { box: [918, 708, 510, 82], ini: 272, fim: 296 } },
  { img: D + 'd3b_motivo.png', ini: 310, fim: 345, cam: [[310, 1440, 880, 0.9]],
    cursor: [[310, 1357, 899], [330, 1707, 1261]], cliques: [338], realce: { box: [1452, 1217, 510, 88], ini: 318, fim: 345 } },
  { img: D + 'd4_travado.png', ini: 345, fim: 600, cam: [[345, 1780, 900, 0.6], [370, 1700, 980, 1.0], [404, 1700, 980, 1.0], [424, 2255, 640, 0.8], [452, 1440, 900, 0.36]],
    realce: { box: [1518, 890, 172, 250], ini: 374, fim: 410 } },
];

export const F11: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Sua agenda,\n*sempre em dia.*'} ini={2} fim={70} tam={84} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Tudo que a Thata marca cai aqui" ini={72} fim={160} />
      <Etapa n="2" t="O horário de cada dia" ini={160} fim={250} />
      <Etapa n="3" t="Vai ter congresso? Trave o dia" ini={250} fim={345} />
      <Etapa n="4" t="Ninguém marca no dia travado" ini={345} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Simples\n*assim.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/calendario" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F11" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Sua agenda,\n*do seu jeito.*'} /></div>}
    </AbsoluteFill>
  );
};
