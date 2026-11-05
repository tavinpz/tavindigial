import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { K, FT, LW, marco, LOC } from './tema';
import type { LDados } from './tema';
import { TIPOS_LONGO, Fundo } from './cenas';
import { LegendaLonga } from './historia';
import { prog, EO, EIO, clamp } from '../lib/anim';
import { Grao } from '../comp/base';

const T = 14; // quadros de transição (cross-fade com leve zoom)

const useFontes = () => {
  const [h] = useState(() => delayRender('fontes-longo'));
  useEffect(() => {
    const pedidos = ['500', '700'].map((w) => document.fonts.load(`${w} 40px "Space Grotesk"`))
      .concat(['500', '700'].map((w) => document.fonts.load(`${w} 40px "JetBrains Mono"`)))
      .concat(['500', '600'].map((w) => document.fonts.load(`${w} 40px "Inter"`)));
    Promise.all(pedidos).then(() => document.fonts.ready).then(() => continueRender(h));
  }, [h]);
};

const Marca: React.FC<{ f: number; canal: string; icone: string }> = ({ f, canal, icone }) => (
  <div style={{ position: 'absolute', top: 40, right: 54, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.8 }}>
    {icone === 'grade' ? (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 9px)', gap: 3 }}>
      {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: i === 4 ? K.sinal : '#5a6580' }} />)}
    </div>) : (<div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30 }}>{[30, 22, 15, 9, 4].map((h, i) => <div key={i} style={{ width: 6, height: h, borderRadius: 1, background: i === 4 ? K.sinal : '#5a6580' }} />)}</div>)}
    <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: K.texto }}>{canal}</div>
  </div>
);

const Capitulos: React.FC<{ f: number; total: number; caps: { n: number; ini: number }[] }> = ({ f, total, caps }) => {
  const p = clamp(f / total);
  return (
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: LW, height: 6, background: 'rgba(255,255,255,0.05)' }}>
      <div style={{ height: '100%', width: `${p * 100}%`, background: K.sinal, opacity: 0.85 }} />
      {caps.map((c) => <div key={c.n} style={{ position: 'absolute', left: (c.ini / total) * LW - 1, top: -4, width: 3, height: 14, background: K.texto, opacity: 0.5 }} />)}
    </div>
  );
};

export const Longo: React.FC<{ dados: LDados; semAudio?: boolean }> = ({ dados, semAudio }) => {
  useFontes();
  K.sinal = (dados as any).acento || '#ffd23f';
  LOC.l = (dados as any).lang === 'pt-br' ? 'pt-BR' : 'en-US';
  LOC.parte = (dados as any).lang === 'pt-br' ? 'PARTE' : 'PART';
  const frame = useCurrentFrame();
  const bl = dados.blocos;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <Fundo f={frame} />
      {bl.map((b, i) => {
        const Comp = TIPOS_LONGO[b.cena.tipo];
        if (!Comp) return null;
        const de = Math.max(0, b.ini - T);
        const ate = i + 1 < bl.length ? bl[i + 1].ini + T : dados.quadros;
        return (
          <Sequence key={i} from={de} durationInFrames={ate - de} layout="none">
            <Bloco de={de} ini={b.ini} fim={b.fim} ultimo={i === bl.length - 1} primeiro={i === 0} render={(f, dur) => <Comp c={b.cena} f={f} dur={dur} marcos={b.marcos} id={dados.id} />} />
          </Sequence>
        );
      })}
      {(dados as any).palavras && (dados as any).palavras.length > 0 && <LegendaLonga f={frame} pal={(dados as any).palavras} />}
      <Marca f={frame} canal={dados.canal} icone={(dados as any).icone || 'grade'} />
      <Capitulos f={frame} total={dados.quadros} caps={dados.capitulos} />
      {!semAudio && <Audio src={staticFile(`l/${dados.id}/mix.wav`)} />}
    </AbsoluteFill>
  );
};

const Bloco: React.FC<{ de: number; ini: number; fim: number; primeiro: boolean; ultimo: boolean; render: (f: number, dur: number) => React.ReactNode }> = ({ de, ini, fim, primeiro, ultimo, render }) => {
  const g = useCurrentFrame() + de; // quadro global
  const f = g - ini;
  const dur = fim - ini;
  let op = 1, esc = 1, blur = 0;
  if (!primeiro && f < 0) { const p = prog(f, -T, 0, EO); op = p; esc = 1.04 - 0.04 * p; blur = (1 - p) * 8; }
  if (!ultimo && f > dur) { const p = prog(f, dur, dur + T, EIO); op = 1 - p; esc = 1 - 0.03 * p; blur = p * 8; }
  return <AbsoluteFill style={{ opacity: op, transform: esc !== 1 ? `scale(${esc})` : undefined }}>{render(Math.max(f, -T), dur)}</AbsoluteFill>;
};
