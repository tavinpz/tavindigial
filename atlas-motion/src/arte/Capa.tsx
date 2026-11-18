// Capa (thumbnail) no estilo dos vídeos: uma cena do próprio vídeo, já montada, com o título grande por cima.
// Renderiza em 1920x1080 (sai em 1280x720 com scale). Props: canal, v (visual de uma cena), f (quadro da cena),
// titulo (linhas), acento (índice da linha em cor de destaque), lado ('esq' | 'dir'), cena {x, y, s}, selo.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { Filtros, Superficie, FA } from './comum';
import type { Tema, Vis } from './comum';
import { LSS } from './lss';
import { TTR } from './ttr';
import { QVD } from './qvd';

const CANAIS: Record<string, any> = { 'last-state-standing': LSS, 'ten-thousand-runs': TTR, 'quanto-voce-dura': QVD };
const TEMAS: Record<string, Tema> = {
  'last-state-standing': { canal: 'last-state-standing', acento: '#ff6b3d', tinta: '#1a120c', papel: '#efe3c8', fundo: '#26221e', nome: 'LAST STATE STANDING' },
  'ten-thousand-runs': { canal: 'ten-thousand-runs', acento: '#ffd23f', tinta: '#1d1a16', papel: '#f4efe2', fundo: '#1f5a3c', nome: 'TEN THOUSAND RUNS' },
  'quanto-voce-dura': { canal: 'quanto-voce-dura', acento: '#e9c46a', tinta: '#2a1d12', papel: '#efe2c4', fundo: '#cdb78f', nome: 'QUANTO VOCÊ DURA?' },
};

type P = { canal: string; v: Vis; v2?: Vis; f?: number; titulo: string[]; acento?: number; lado?: 'esq' | 'dir'; cena?: { x?: number; y?: number; s?: number }; selo?: string; tam?: number };

export const ArteCapa: React.FC<P> = ({ canal, v, v2, f = 70, titulo, acento = -1, lado = 'dir', cena = {}, selo, tam }) => {
  const [h] = useState(() => delayRender('fontes-capa'));
  useEffect(() => {
    Promise.all(['400 40px Anton', '700 40px Oswald', '400 40px "Special Elite"', '400 40px "Permanent Marker"', '900 40px "Playfair Display"'].map((s) => document.fonts.load(s)))
      .then(() => document.fonts.ready).then(() => continueRender(h));
  }, [h]);
  const tema = TEMAS[canal];
  const C = CANAIS[canal];
  const qvd = canal === 'quanto-voce-dura';
  const maior = Math.max(...titulo.map((l) => l.length));
  const fs = tam || (qvd ? Math.min(200, Math.floor(1500 / Math.max(6, maior))) : Math.min(230, Math.floor(1350 / Math.max(5, maior))));
  const escuro = qvd ? 'rgba(20,12,4,0.82)' : 'rgba(0,0,0,0.78)';
  return (
    <AbsoluteFill style={{ background: tema.fundo, overflow: 'hidden' }}>
      <Filtros />
      <Superficie tema={tema} px={0} py={0} tipo={C.superficie} />
      <AbsoluteFill style={{ transform: `translate(${cena.x ?? (lado === 'dir' ? -330 : 330)}px, ${cena.y ?? 40}px) scale(${cena.s ?? 1.05})` }}>
        <C.Cena f={f} dur={400} v={v} tema={tema} />
      </AbsoluteFill>
      {v2 && <AbsoluteFill style={{ transform: `translate(${lado === 'dir' ? -60 : 60}px, 0px)` }}><C.Cena f={f} dur={400} v={v2} tema={tema} /></AbsoluteFill>}
      {/* lado do título escurece, para o texto ler em tamanho de celular */}
      <AbsoluteFill style={{ background: `linear-gradient(${lado === 'dir' ? 'to left' : 'to right'}, ${escuro} 0%, ${escuro.replace(/0\.\d+\)/, '0.55)')} 38%, rgba(0,0,0,0) 62%)` }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, [lado === 'dir' ? 'right' : 'left']: 80, width: 900, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: lado === 'dir' ? 'flex-end' : 'flex-start', textAlign: lado === 'dir' ? 'right' : 'left' }}>
        {titulo.map((l, i) => (
          <div key={i} style={{ fontFamily: qvd ? FA.serif : FA.cond, fontWeight: qvd ? 900 : 400, fontSize: fs, lineHeight: qvd ? 1.02 : 0.98, letterSpacing: qvd ? -2 : 1,
            color: i === acento ? tema.acento : '#fbf6ea', textTransform: qvd ? 'none' : 'uppercase',
            WebkitTextStroke: `${qvd ? 6 : 12}px #0d0a07`, paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.55)' }}>{l}</div>
        ))}
        {selo && <div style={{ marginTop: 26, display: 'inline-block', background: tema.acento, color: '#120d08', fontFamily: FA.osw, fontWeight: 700, fontSize: 54, letterSpacing: 3,
          padding: '10px 26px', transform: `rotate(${lado === 'dir' ? -2 : 2}deg)`, boxShadow: '0 8px 18px rgba(0,0,0,0.45)' }}>{selo}</div>}
      </div>
    </AbsoluteFill>
  );
};
