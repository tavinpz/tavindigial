// Composição "Arte": lê o mesmo data.json do pipeline longo (blocos, marcos por fala, palavras)
// e monta uma cena física por fala, com câmera contínua sobre a superfície do canal.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, getInputProps } from 'remotion';
const TESTE = ((getInputProps() as any).teste || '') as string;
import { Filtros, Superficie, camera, Legenda, Poeira, FA, W, Continua } from './comum';
import type { Tema, Vis, Pal } from './comum';
import { LSS } from './lss';
import { TTR } from './ttr';
import { QVD } from './qvd';

const CANAIS: Record<string, any> = { 'last-state-standing': LSS, 'ten-thousand-runs': TTR, 'quanto-voce-dura': QVD };
const TEMAS: Record<string, Tema> = {
  'last-state-standing': { canal: 'last-state-standing', acento: '#ff6b3d', tinta: '#1a120c', papel: '#efe3c8', fundo: '#26221e', nome: 'LAST STATE STANDING' },
  'ten-thousand-runs': { canal: 'ten-thousand-runs', acento: '#ffd23f', tinta: '#1d1a16', papel: '#f4efe2', fundo: '#1f5a3c', nome: 'TEN THOUSAND RUNS' },
  'quanto-voce-dura': { canal: 'quanto-voce-dura', acento: '#e9c46a', tinta: '#2a1d12', papel: '#efe2c4', fundo: '#cdb78f', nome: 'QUANTO VOCÊ DURA?' },
};
const LEAD = 5; // a cena entra um pouco antes da fala

type Bloco = { cena: { tipo: string; v?: Vis[] }; ini: number; fim: number; marcos: number[] };
type Item = { v: Vis; ini: number; fim: number };

const useFontes = () => {
  const [h] = useState(() => delayRender('fontes-arte'));
  useEffect(() => {
    const ps = ['400 40px Anton', '700 40px Oswald', '400 40px "Special Elite"', '400 40px "Permanent Marker"', '900 40px "Playfair Display"', '700 40px "Playfair Display"', '600 40px Inter'].map((s) => document.fonts.load(s));
    Promise.all(ps).then(() => document.fonts.ready).then(() => continueRender(h));
  }, [h]);
};

export const linhaDoTempo = (blocos: Bloco[], total: number): Item[] => {
  const out: Item[] = [];
  blocos.forEach((b) => (b.cena.v || []).forEach((v, k) => out.push({ v, ini: Math.max(0, b.ini + (b.marcos[k] ?? 0) - LEAD), fim: 0 })));
  out.forEach((it, i) => (it.fim = i + 1 < out.length ? out[i + 1].ini : total));
  return out;
};

const Marca: React.FC<{ tema: Tema }> = ({ tema }) => (
  <div style={{ position: 'absolute', top: 38, right: 50, zIndex: 70, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.88 }}>
    <div style={{ width: 16, height: 16, background: tema.acento, transform: 'rotate(45deg)' }} />
    <div style={{ fontFamily: tema.canal === 'quanto-voce-dura' ? FA.serif : FA.cond, fontWeight: tema.canal === 'quanto-voce-dura' ? 900 : 400, fontSize: 30, letterSpacing: 3,
      color: tema.canal === 'quanto-voce-dura' ? '#2a1d12' : '#f6f0e2', textShadow: tema.canal === 'quanto-voce-dura' ? 'none' : '0 2px 6px rgba(0,0,0,0.6)' }}>{tema.nome}</div>
  </div>
);

export const Arte: React.FC<{ dados: any; semAudio?: boolean }> = ({ dados, semAudio }) => {
  useFontes();
  const g = useCurrentFrame();
  const tema = TEMAS[dados.canalId] || TEMAS['ten-thousand-runs'];
  const C = CANAIS[tema.canal];
  const itens: Item[] = (dados as any)._it || ((dados as any)._it = linhaDoTempo(dados.blocos, dados.quadros));
  const cam0 = camera(g, itens.map((i) => i.ini + LEAD));
  const cam = TESTE.includes('cam') ? { esc: 1, px: 0, py: 0, rot: 0 } : cam0;
  return (
    <AbsoluteFill style={{ background: tema.fundo, overflow: 'hidden' }}>
      <Filtros />
      <AbsoluteFill style={{ transform: `scale(${cam.esc}) rotate(${cam.rot}deg)` }}>
        {!TESTE.includes('tex') && <Superficie tema={tema} px={cam.px} py={cam.py} tipo={C.superficie} />}
        <AbsoluteFill style={{ transform: `translate(${cam.px}px, ${cam.py}px)` }}>
          {itens.map((it, i) => {
            const f = g - it.ini;
            const dur = it.fim - it.ini;
            const ant = i > 0 && itens[i - 1].v.tipo === it.v.tipo && !!C.continua?.includes(it.v.tipo);
            const prox = i + 1 < itens.length && itens[i + 1].v.tipo === it.v.tipo && !!C.continua?.includes(it.v.tipo);
            if (f < 0 || f > dur + (prox ? 0 : 18)) return null;
            return <AbsoluteFill key={i} style={{ zIndex: i + 1 }}><Continua.Provider value={{ ant, prox }}><C.Cena f={f} dur={dur} v={it.v} tema={tema} /></Continua.Provider></AbsoluteFill>;
          })}
        </AbsoluteFill>
        {!TESTE.includes('poeira') && <Poeira g={g} px={cam.px} py={cam.py} cor={tema.canal === 'quanto-voce-dura' ? 'rgba(255,250,235,0.55)' : 'rgba(255,240,210,0.45)'} n={tema.canal === 'ten-thousand-runs' ? 14 : 24} />}
      </AbsoluteFill>
      {/* sombra suave nas bordas e embaixo, para a legenda ler sempre */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.42), rgba(0,0,0,0) 30%)', zIndex: 40 }} />
      {dados.palavras?.length > 0 && <Legenda g={g} pal={dados.palavras as Pal[]} tema={tema} estilo={C.legenda} />}
      <Marca tema={tema} />
      {!semAudio && <Audio src={staticFile(`l/${dados.id}/mix.wav`)} />}
    </AbsoluteFill>
  );
};
