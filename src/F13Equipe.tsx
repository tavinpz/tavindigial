// F13 (claro) — Funcionalidade: equipe e permissões. Telas reais (dados fictícios): Configurações → Equipe,
// novo usuário, páginas que pode abrir, agendas e WhatsApps que enxerga, acesso criado.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fundo, Titulo, Fecho, Narrada, lerp, usaTema } from './kit';
import { Janela, Etapa, Passo } from './tela';

export const DUR_F13 = 600;
const D = 'telas/eq/', W = 2200, H = 2000;
const PASSOS: Passo[] = [
  { img: D + 'u1_lista.png', iw: W, ih: H, ini: 0, fim: 150, cam: [[0, 1250, 1000, 0.53], [66, 1250, 1000, 0.53], [92, 1380, 700, 0.66]],
    cursor: [[110, 1600, 1000], [136, 1053, 583]], cliques: [144], realce: { box: [884, 548, 339, 70], ini: 100, fim: 140 } },
  { img: D + 'u2_vazio.png', iw: W, ih: H, ini: 150, fim: 180, cam: [[150, 1380, 700, 0.66]] },
  { img: D + 'u3_dados.png', iw: W, ih: H, ini: 180, fim: 240, cam: [[180, 1380, 700, 0.66]], realce: { box: [700, 610, 1420, 140], ini: 186, fim: 236 } },
  { img: D + 'u4_paginas.png', iw: W, ih: H, ini: 240, fim: 335, cam: [[240, 1380, 900, 0.66]], realce: { box: [705, 640, 1400, 460], ini: 252, fim: 330 } },
  { img: D + 'u4b_criar.png', iw: W, ih: H, ini: 335, fim: 380, cam: [[335, 1380, 1300, 0.66]],
    cursor: [[340, 1200, 1500], [362, 828, 1913]], cliques: [372] },
  { img: D + 'u5_criado.png', iw: W, ih: H, ini: 380, fim: 600, cam: [[380, 1380, 800, 0.66], [440, 1380, 800, 0.66], [462, 1250, 1000, 0.53]],
    realce: { box: [705, 610, 1410, 520], ini: 386, fim: 432 } },
];

export const F13: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo gy={1000} brilho={0.7} />
      {f < 72 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Cada pessoa da equipe,\n*com o acesso certo.*'} ini={2} fim={70} tam={76} alinhar="left" linha={1.1} /></div>}
      <Etapa n="1" t="Adicione um usuário" ini={72} fim={150} />
      <Etapa n="2" t="Nome, função e e-mail" ini={150} fim={240} />
      <Etapa n="3" t="Escolha o que ela pode abrir" ini={240} fim={335} />
      <Etapa n="4" t="Pronto: o acesso dela" ini={335} fim={432} />
      {f >= 432 && <div style={{ position: 'absolute', top: 150, left: 60, right: 60 }}><Titulo t={'Mudou aqui,\n*muda na hora.*'} ini={434} fim={486} tam={84} alinhar="left" linha={1.1} /></div>}
      <Janela passos={PASSOS} ini={0} fim={486} url="thata.online/configuracoes" />
      <div style={{ position: 'absolute', top: 1552, left: 0, right: 0, textAlign: 'center', fontFamily: '"Geist Mono", monospace', fontSize: 22, color: '#93A19B', opacity: lerp(f, 20, 30, 0, 1) * (f < 486 ? 1 : 0) }}>tela real da Thata · dados fictícios</div>
      <Narrada id="F13" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'Sua equipe,\n*cada um no seu lugar.*'} /></div>}
    </AbsoluteFill>
  );
};
