import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { C } from './lib/theme';
import { prog, EO, EIO } from './lib/anim';
import type { CenaProps, Dados } from './lib/types';
import { Grao } from './comp/base';
import { Gancho, Legenda, Marcas, blocos } from './comp/overlay';
import { Mapa } from './scenes/Mapa';
import { Numero } from './scenes/Numero';
import { Barras } from './scenes/Barras';
import { Perfil } from './scenes/Perfil';
import { Linha, Lista, Secao, Comportas, Portoes, Cta } from './scenes/Outras';
import { Salao } from './scenes/Salao';
import { Globe } from './scenes/Globe';

const TIPOS: Record<string, React.FC<CenaProps>> = {
  mapa: Mapa, numero: Numero, barras: Barras, perfil: Perfil, linha: Linha, lista: Lista,
  secao: Secao, comportas: Comportas, portoes: Portoes, cta: Cta, salao: Salao,
};

const T = 8; // quadros de transição
export const GLOBO = { inicio: 0, fim: 50, distIni: 6.8, distFim: 1.5, giro: 120, marcador: true };
const TRANS = ['zoom', 'whip', 'zoom', 'sobe', 'whip', 'zoom', 'whip', 'zoom'];

const useFontes = () => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    Promise.all(['600', '700', '800', '900'].map((w) => document.fonts.load(`${w} 40px "Barlow Condensed"`)).concat(['500', '600', '700'].map((w) => document.fonts.load(`${w} 40px "Inter"`))))
      .then(() => document.fonts.ready)
      .then(() => continueRender(h));
  }, [h]);
};

const Transicao: React.FC<{ f: number; dur: number; tipo: string; prox: string; primeira: boolean; ultima: boolean; children: React.ReactNode }> = ({ f, dur, tipo, prox, primeira, ultima, children }) => {
  let tr = '', blur = 0, op = 1;
  if (!primeira && f < 0) {
    const p = prog(f, -T, 0, EO);
    if (tipo === 'zoom') { tr = `scale(${0.72 + 0.28 * p})`; blur = (1 - p) * 18; op = p; }
    else if (tipo === 'whip') { tr = `translateX(${(1 - p) * 70}%) skewX(${(1 - p) * -8}deg)`; blur = (1 - p) * 22; }
    else { tr = `translateY(${(1 - p) * 60}%)`; blur = (1 - p) * 16; }
  }
  if (!ultima && f > dur - T) {
    const p = prog(f, dur - T, dur, EIO);
    if (prox === 'zoom') { tr += ` scale(${1 + 0.6 * p})`; blur = Math.max(blur, p * 20); op = 1 - p; }
    else if (prox === 'whip') { tr += ` translateX(${-p * 70}%) skewX(${p * 8}deg)`; blur = Math.max(blur, p * 22); }
    else { tr += ` translateY(${-p * 45}%)`; blur = Math.max(blur, p * 16); op = 1 - p * 0.6; }
  }
  return <AbsoluteFill style={{ transform: tr || undefined, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined, opacity: op }}>{children}</AbsoluteFill>;
};

export const Short: React.FC<{ dados: Dados; semAudio?: boolean; pre3d?: boolean }> = ({ dados, semAudio, pre3d }) => {
  useFontes();
  const frame = useCurrentFrame();
  const fps = 30;
  const bl = useMemo(() => blocos(dados.palavras), [dados]);
  const cenas = dados.cenas;
  const ini = dados.tempos.map((t) => Math.round(t.ini * fps));
  const fim = dados.tempos.map((t) => Math.round(t.fim * fps));
  const c0 = cenas[0];
  const temGlobo = c0.tipo === 'mapa' && !!c0.gancho;
  const alvo = c0.globo || (c0.bbox ? [(c0.bbox[2] + c0.bbox[3]) / 2, (c0.bbox[0] + c0.bbox[1]) / 2] : [0, 0]);
  const tipoDe = (i: number) => (i >= cenas.length ? 'zoom' : TRANS[i % TRANS.length]);
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {cenas.map((c, i) => {
        const de = i === 0 ? 0 : ini[i] - T;
        const dur = fim[i] - ini[i];
        const Comp = TIPOS[c.tipo];
        if (!Comp) return null;
        return (
          <Sequence key={i} from={de} durationInFrames={fim[i] - de} layout="none">
            <Interna de={de} ini={ini[i]} dur={dur} render={(f) => (
              <Transicao f={f} dur={dur} tipo={tipoDe(i)} prox={tipoDe(i + 1)} primeira={i === 0} ultima={i === cenas.length - 1}>
                <Comp c={c} f={f} dur={dur} id={dados.id} idx={i} geo={dados.geo[String(i)]} temGlobo={i === 0 && temGlobo} pre3d={pre3d} />
                {i === 0 && temGlobo && f < 60 && (
                  <AbsoluteFill style={{ opacity: 1 - prog(f, 34, 56), filter: f > 34 ? `blur(${prog(f, 34, 56) * 14}px)` : undefined, transform: `scale(${1 + prog(f, 30, 56, EIO) * 0.5})` }}>
                    {pre3d ? <OffthreadVideo src={staticFile(`v/${dados.id}/globo.mp4`)} muted /> : <Globe f={f} lat={alvo[0]} lon={alvo[1]} {...GLOBO} />}
                  </AbsoluteFill>
                )}
              </Transicao>
            )} />
          </Sequence>
        );
      })}
      {/* flash curto em cada corte */}
      {ini.slice(1).map((s, k) => (frame >= s - 2 && frame < s + 3 ? <AbsoluteFill key={k} style={{ background: '#fff', opacity: 0.16 * (1 - Math.abs(frame - s) / 3) }} /> : null))}
      {c0.gancho && <Gancho f={frame} texto={c0.gancho} />}
      <Legenda f={frame} bl={bl} />
      <Marcas f={frame} total={dados.quadros} />
      <Grao f={frame} />
      {!semAudio && <Audio src={staticFile(`v/${dados.id}/mix.wav`)} />}
    </AbsoluteFill>
  );
};

const Interna: React.FC<{ de: number; ini: number; dur: number; render: (f: number) => React.ReactNode }> = ({ de, ini, render }) => {
  const f = useCurrentFrame() + de - ini;
  return <>{render(f)}</>;
};
