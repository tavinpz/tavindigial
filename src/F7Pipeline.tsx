// F7 (claro) — Funcionalidade: pipeline de pacientes. Telas reais (dados fictícios): quadro com a temperatura de cada lead,
// ficha com resumo e etapa, card que muda de coluna e a automação da etapa Agendamento com a cadência ativa.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F7 = 600;
const D = 'telas/pipe/', W = 4400, H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'p1_quadro.png', iw: W, ih: H, ini: 0, fim: 160, cam: [[0, 1900, 900, 0.53], [70, 1900, 900, 0.55], [104, 1050, 760, 0.8]], realce: { box: [724, 380, 652, 220], ini: 104, fim: 160 } },
  { img: D + 'p2_lead.png', iw: W, ih: H, ini: 160, fim: 250, cam: [[160, 2200, 1000, 0.62], [196, 2300, 1150, 0.8]],
    cursor: [[206, 2900, 1500], [232, 2630, 1294]], cliques: [240], realce: { box: [1860, 1070, 1020, 120], ini: 190, fim: 228 } },
  { img: D + 'p3_movido.png', iw: W, ih: H, ini: 250, fim: 330, cam: [[250, 1500, 800, 0.6], [280, 1830, 720, 0.82]], realce: { box: [1504, 380, 656, 220], ini: 276, fim: 330 } },
  { img: D + 'p4_auto.png', iw: W, ih: H, ini: 330, fim: 432, cam: [[330, 2200, 900, 0.62], [356, 2200, 760, 0.9], [404, 2200, 1300, 0.9]], realce: { box: [1760, 820, 880, 110], ini: 352, fim: 400 } },
  { img: D + 'p3_movido.png', iw: W, ih: H, ini: 432, fim: 600, cam: [[432, 1800, 900, 0.7], [486, 2100, 900, 0.53]] },
];

export const F7: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Seu funil de pacientes,\n*num quadro só.*'} ini={2} fim={70} tam={84} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="A temperatura de cada lead" ini={72} fim={160} />
      <Etapa n="2" t="Abra a ficha e mude a etapa" ini={160} fim={250} />
      <Etapa n="3" t="O card muda de coluna" ini={250} fim={330} />
      <Etapa n="4" t="A automação da etapa começa" ini={330} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Sem planilha,\n*sem caderno.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/pipeline" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F7" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Cada paciente,\n*na etapa certa.*'} /></div>}
    </AbsoluteFill>
  );
};
