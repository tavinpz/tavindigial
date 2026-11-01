// F5 (claro) — Funcionalidade: confirmação e lembretes de consulta. Telas reais (dados fictícios): mensagem de confirmação,
// lembrete 24h antes por mensagem e outro por ligação da assistente, agenda do dia com quem recebeu, respondeu ou ficou em silêncio,
// e o "Cobrar agora" com a mensagem pronta.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F5 = 600;
const D = 'telas/lem/', H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'a1_dia.png', ih: H, ini: 0, fim: 74, cam: [[0, 1700, 900, 0.55], [74, 1700, 900, 0.6]] },
  { img: D + 'r1_confirma.png', ih: H, ini: 74, fim: 150, cam: [[74, 1700, 700, 0.6], [110, 1760, 560, 0.72]], realce: { box: [746, 436, 2028, 146], ini: 104, fim: 150 } },
  { img: D + 'r2_lembretes.png', ih: H, ini: 150, fim: 240, cam: [[150, 1500, 1150, 0.62], [190, 1450, 1250, 0.7], [226, 1600, 1800, 0.7]],
    realce: { box: [780, 960, 380, 100], ini: 170, fim: 210 } },
  { img: D + 'a1_dia.png', ih: H, ini: 240, fim: 330, cam: [[240, 1700, 900, 0.58], [272, 1600, 400, 0.85]], realce: { box: [1163, 310, 853, 126], ini: 268, fim: 330 } },
  { img: D + 'a2_silencio.png', ih: H, ini: 330, fim: 400, cam: [[330, 1300, 1300, 0.62], [356, 1250, 1600, 0.85]],
    cursor: [[364, 1800, 1900], [384, 1388, 1579]], cliques: [392], realce: { box: [958, 1651, 327, 47], ini: 348, fim: 400 } },
  { img: D + 'a3_modal.png', ih: H, ini: 400, fim: 446, cam: [[400, 1440, 1000, 0.62], [420, 1440, 1000, 0.95]], cursor: [[410, 1900, 1500], [430, 1615, 1316]], cliques: [438] },
  { img: D + 'a1_dia.png', ih: H, ini: 446, fim: 600, cam: [[446, 1500, 1100, 0.75], [486, 1700, 900, 0.6]] },
];

export const F5: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 74 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Confirmação e lembrete\n*no automático.*'} ini={2} fim={72} tam={84} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Confirma assim que marca" ini={74} fim={150} />
      <Etapa n="2" t="Lembra antes: mensagem ou ligação" ini={150} fim={240} />
      <Etapa n="3" t="Veja quem recebeu e respondeu" ini={240} fim={330} />
      <Etapa n="4" t="Quem ficou em silêncio" ini={330} fim={400} />
      <Etapa n="5" t="Cobre com um clique" ini={400} fim={446} />
      {f >= 446 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Quem vem, quem respondeu,\n*tudo na sua tela.*'} ini={448} fim={486} tam={72} alinhar="left" linha={1.1} passo={3} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/agenda-do-dia" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F5" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Quem vem,\n*você já sabe.*'} /></div>}
    </AbsoluteFill>
  );
};
