// F2 (claro) — Funcionalidade: integrações de agenda. Telas reais (dados fictícios): Clinicorp com usuário e token,
// ControleODONTO com usuário e senha (unidades aparecem), e o marketplace com Google, Clinicorp, Clínica Experts e ControleODONTO.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F2 = 600;
const D = 'telas/int/';
const PASSOS: Passo[] = [
  { img: D + 'i1_pagina.png', ini: 0, fim: 150, cam: [[0, 1700, 1050, 0.6], [70, 1650, 1100, 0.6], [104, 1500, 1450, 0.78]],
    cursor: [[80, 2300, 1700], [118, 1500, 1561]], cliques: [128], realce: { box: [1293, 1511, 413, 100], ini: 106, fim: 150 } },
  { img: D + 'i3_clinicorp_preenchido.png', ini: 150, fim: 230, cam: [[150, 1440, 1200, 0.62], [200, 1520, 1460, 0.8]],
    cursor: [[176, 1900, 1300], [212, 1800, 1700]], cliques: [220], realce: { box: [946, 1244, 988, 88], ini: 166, fim: 200 } },
  { img: D + 'i4_clinicorp_ok.png', ini: 230, fim: 300, cam: [[230, 1650, 1200, 0.6], [262, 1600, 1300, 0.85]], realce: { box: [1255, 1420, 620, 84], ini: 252, fim: 300 } },
  { img: D + 'i5_co_preenchido.png', ini: 300, fim: 370, cam: [[300, 1440, 1000, 0.62], [330, 1440, 1050, 0.82]],
    cursor: [[312, 1900, 1500], [346, 1440, 1253]], cliques: [354], realce: { box: [978, 1213, 924, 80], ini: 336, fim: 370 } },
  { img: D + 'i6_co_ok.png', ini: 370, fim: 432, cam: [[370, 1440, 900, 0.62], [396, 1440, 840, 0.82]], realce: { box: [980, 720, 920, 140], ini: 392, fim: 432 } },
  { img: D + 'i7_final.png', ini: 432, fim: 600, cam: [[432, 2000, 1150, 0.7], [486, 1820, 1150, 0.6]] },
];

export const F2: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Sua agenda\n*integrada à Thata.*'} ini={2} fim={70} tam={88} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Escolha a integração" ini={72} fim={150} />
      <Etapa n="2" t="Cole o usuário e o token" ini={150} fim={230} />
      <Etapa n="3" t="Clinicorp conectado" ini={230} fim={300} />
      <Etapa n="4" t="ControleODONTO: seu login" ini={300} fim={370} />
      <Etapa n="5" t="As unidades já aparecem" ini={370} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Google, Clinicorp,\nClínica Experts\ne *ControleODONTO.*'} ini={434} fim={486} tam={66} alinhar="left" linha={1.1} passo={3} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/integracoes" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F2" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Sem agenda dupla.\n*A Thata integra.*'} /></div>}
    </AbsoluteFill>
  );
};
