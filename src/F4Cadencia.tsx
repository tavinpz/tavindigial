// F4 (claro) — Funcionalidade: cadência de follow-up. Telas reais (dados fictícios): IA responde na hora → mensagem só se não
// respondeu → ligação no dia 1 → mensagem no dia 3 → cadência montada.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F4 = 600;
const D = 'telas/cad/', H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'k1_vazio.png', ih: H, ini: 0, fim: 150, cam: [[0, 1700, 900, 0.55], [70, 1700, 900, 0.55], [100, 1300, 640, 0.75], [124, 1760, 860, 0.62]],
    cursor: [[96, 2200, 1200], [130, 1760, 880]], cliques: [138], realce: { box: [746, 491, 1004, 170], ini: 84, fim: 120 } },
  { img: D + 'k2_escolha.png', ih: H, ini: 150, fim: 220, cam: [[150, 1440, 1000, 0.62], [180, 1440, 1060, 0.78]],
    cursor: [[160, 1900, 1400], [194, 1300, 1060]], cliques: [202], realce: { box: [930, 990, 1020, 140], ini: 180, fim: 220 } },
  { img: D + 'k3_msg.png', ih: H, ini: 220, fim: 300, cam: [[220, 1440, 1150, 0.62], [256, 1440, 1450, 0.78]],
    cursor: [[236, 1900, 1300], [272, 1440, 1681]], cliques: [280], realce: { box: [1279, 1648, 321, 66], ini: 262, fim: 300 } },
  { img: D + 'k4_ligacao.png', ih: H, ini: 300, fim: 370, cam: [[300, 1440, 1000, 0.62], [330, 1440, 1040, 0.85]],
    cursor: [[312, 1900, 1300], [344, 1440, 1161]], cliques: [352], realce: { box: [946, 1112, 988, 98], ini: 336, fim: 370 } },
  { img: D + 'k5_pronta.png', ih: H, ini: 370, fim: 600, cam: [[370, 1760, 860, 0.62], [404, 1600, 1380, 0.75], [486, 1500, 1250, 0.66]],
    realce: { box: [746, 1271, 1330, 240], ini: 404, fim: 470 } },
];

export const F4: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Quem sumiu\n*recebe o follow-up.*'} ini={2} fim={70} tam={88} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="A IA responde na hora" ini={72} fim={150} />
      <Etapa n="2" t="Escolha a ação" ini={150} fim={220} />
      <Etapa n="3" t="Só se não respondeu" ini={220} fim={300} />
      <Etapa n="4" t="No dia seguinte, ligação" ini={300} fim={370} />
      <Etapa n="5" t="E mais uma no dia 3" ini={370} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Mensagem e ligação,\n*no dia certo.*'} ini={434} fim={486} tam={80} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/cadencias" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F4" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Ninguém esquecido.\n*A Thata insiste.*'} /></div>}
    </AbsoluteFill>
  );
};
