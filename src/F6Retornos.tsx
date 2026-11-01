// F6 (claro) — Funcionalidade: retornos por procedimento. Telas reais (dados fictícios): novo retorno com prazo,
// calendário do mês com quem volta, e o mês anterior com quem recebeu, respondeu e agendou.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F6 = 600;
const D = 'telas/ret/', H = 2000;
const PASSOS: Passo[] = [
  { img: D + 't1_mes.png', ih: H, ini: 0, fim: 160, cam: [[0, 1700, 900, 0.55], [70, 1700, 900, 0.58], [104, 2420, 1150, 0.78]],
    cursor: [[96, 2000, 1500], [128, 2430, 1268]], cliques: [138], realce: { box: [2058, 1231, 744, 74], ini: 110, fim: 160 } },
  { img: D + 't2_novo.png', ih: H, ini: 160, fim: 260, cam: [[160, 2420, 1300, 0.7], [196, 2420, 1500, 0.85], [240, 2420, 1700, 0.8]],
    cursor: [[176, 2100, 1700], [204, 2560, 1569]], cliques: [212], realce: { box: [2504, 1536, 112, 66], ini: 200, fim: 260 } },
  { img: D + 't1_mes.png', ih: H, ini: 260, fim: 350, cam: [[260, 1500, 800, 0.6], [292, 1340, 680, 0.78]], realce: { box: [690, 300, 1290, 760], ini: 290, fim: 350 } },
  { img: D + 't3_outubro.png', ih: H, ini: 350, fim: 440, cam: [[350, 2430, 700, 0.62], [380, 2430, 640, 0.95], [420, 1340, 1650, 0.75]], realce: { box: [2040, 560, 780, 300], ini: 376, fim: 410 } },
  { img: D + 't3_outubro.png', ih: H, ini: 440, fim: 600, cam: [[440, 1340, 1500, 0.72], [486, 1700, 900, 0.58]] },
];

export const F6: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'O paciente volta\n*na hora certa.*'} ini={2} fim={70} tam={88} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Crie o retorno" ini={72} fim={160} />
      <Etapa n="2" t="Escolha o prazo" ini={160} fim={260} />
      <Etapa n="3" t="Quem volta neste mês" ini={260} fim={350} />
      <Etapa n="4" t="Quem recebeu, respondeu e agendou" ini={350} fim={440} />
      {f >= 440 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Retorno no automático,\n*resultado na tela.*'} ini={442} fim={486} tam={76} alinhar="left" linha={1.1} passo={3} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/retornos" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F6" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Volta na hora certa.\n*Sem ninguém lembrar.*'} /></div>}
    </AbsoluteFill>
  );
};
