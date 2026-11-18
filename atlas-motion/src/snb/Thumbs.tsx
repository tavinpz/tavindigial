import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import '@fontsource/nunito/800.css';
import { K } from './lib';

// Thumbs do Strong Not Big (1280x720), no padrão do nicho: fundo preto puro, personagem grande, UMA parte do corpo acesa,
// 2 a 3 palavras em letra redonda minúscula (uma em vermelho) e uma seta vermelha desenhada à mão apontando para a parte acesa.
const NUN = '"Nunito", "Inter", sans-serif';
const P: React.FC<{ p: string; x: number; a: number; base: number }> = ({ p, x, a, base }) => {
  const k = a / 1772; return <Img src={staticFile(`snb/poses/${p}.png`)} style={{ position: 'absolute', left: x - 650 * k, top: base - 2172 * k, width: 1300 * k, height: 2260 * k }} />;
};
// texto: palavras entre *asteriscos* saem em vermelho
const T: React.FC<{ x: number; y: number; t: string; s: number; a?: 'start' | 'middle' | 'end' }> = ({ x, y, t, s, a = 'middle' }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={NUN} fontWeight={800} fontSize={s} fill="#fff">
    {t.split(' ').map((w, i) => <tspan key={i} fill={w.startsWith('*') ? K.verm : '#fff'}>{w.replace(/\*/g, '') + ' '}</tspan>)}
  </text>
);
// seta curva: de (x1,y1) até (x2,y2), com a barriga para o lado `c`
const Seta: React.FC<{ x1: number; y1: number; x2: number; y2: number; c?: number }> = ({ x1, y1, x2, y2, c = 0.35 }) => {
  const mx = (x1 + x2) / 2 - (y2 - y1) * c, my = (y1 + y2) / 2 + (x2 - x1) * c;
  const ang = Math.atan2(y2 - my, x2 - mx), L = 46, ab = 0.55;
  const p = (d: number) => `${x2 - L * Math.cos(ang + d)},${y2 - L * Math.sin(ang + d)}`;
  return <g fill="none" stroke={K.verm} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round"><path d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`} /><path d={`M ${p(ab)} L ${x2},${y2} L ${p(-ab)}`} /></g>;
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', left: 0, top: 0 }}>{children}</svg>;
export const SNBThumb: React.FC<{ v: string }> = ({ v }) => (
  <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
    {v === 'a' && <>
      <P p="academia_saco" x={270} a={1040} base={1150} /><P p="fazendeiro_saco_ambar" x={1010} a={1040} base={1170} />
      <Svg><T x={590} y={130} t="*never* lifted" s={96} /><Seta x1={640} y1={185} x2={862} y2={606} c={0.28} /></Svg>
    </>}
    {v === 'b' && <>
      <P p="fazendeiro_saco_ambar" x={390} a={1180} base={1262} />
      <Svg><T x={930} y={250} t="*zero* days" s={112} /><T x={930} y={370} t="in the gym" s={112} /><Seta x1={900} y1={430} x2={610} y2={648} c={-0.25} /></Svg>
    </>}
    {v === 'a2' && <>
      <P p="pendurado" x={300} a={797} base={944} />
      <Svg><T x={900} y={330} t="can you" s={124} /><T x={900} y={465} t="*hang?*" s={124} /><Seta x1={690} y1={250} x2={450} y2={132} c={-0.22} /></Svg>
    </>}
    {v === 'b2' && <>
      <P p="farmer_carry_ambar" x={360} a={900} base={930} />
      <Svg><T x={920} y={270} t="only *3*" s={124} /><T x={920} y={400} t="tests" s={124} /><Seta x1={880} y1={450} x2={540} y2={545} c={-0.25} /></Svg>
    </>}
    {v === 'c2' && <>
      <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -150, top: 110, width: 1000 }} />
      <Svg><T x={880} y={130} t="beats" s={96} /><T x={880} y={235} t="*blood pressure*" s={96} /><Seta x1={1000} y1={275} x2={760} y2={470} c={-0.3} /></Svg>
    </>}
    {v === 'a3' && <>
      <P p="argolas" x={300} a={797} base={944} />
      <Svg><T x={900} y={330} t="zero" s={132} /><T x={900} y={470} t="*weights*" s={132} /><Seta x1={680} y1={250} x2={450} y2={150} c={-0.22} /></Svg>
    </>}
    {v === 'b3' && <>
      <P p="academia" x={250} a={900} base={930} /><P p="argolas" x={700} a={720} base={900} />
      <Svg><T x={1075} y={320} t="who's" s={88} /><T x={1075} y={425} t="*stronger?*" s={88} /><Seta x1={1040} y1={470} x2={850} y2={600} c={-0.3} /></Svg>
    </>}
    {v === 'c3' && <>
      <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -150, top: 110, width: 1000 }} />
      <Svg><T x={900} y={130} t="they *hold*" s={104} /><T x={900} y={240} t="you lift" s={104} /><Seta x1={1000} y1={280} x2={760} y2={470} c={-0.3} /></Svg>
    </>}
    {v === 'a4' && <>
      <P p="pai_saco" x={330} a={1100} base={1180} />
      <Svg><T x={920} y={270} t="*55* years old" s={104} /><T x={920} y={390} t="never trained" s={104} /><Seta x1={890} y1={440} x2={585} y2={640} c={-0.25} /></Svg>
    </>}
    {v === 'b4' && <>
      <P p="pai" x={270} a={1000} base={1090} /><P p="heroi" x={700} a={900} base={1010} />
      <Svg><T x={1050} y={300} t="dad" s={120} /><T x={1050} y={430} t="*wins*" s={120} /><Seta x1={930} y1={330} x2={450} y2={420} c={0.25} /></Svg>
    </>}
    {v === 'c4' && <>
      <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -150, top: 110, width: 1000 }} />
      <Svg><T x={900} y={130} t="old man" s={104} /><T x={900} y={240} t="*strength*" s={104} /><Seta x1={1000} y1={280} x2={760} y2={470} c={-0.3} /></Svg>
    </>}
    {v === 'a5' && <>
      <P p="academia_barra" x={330} a={760} base={900} />
      <Svg><T x={930} y={300} t="big," s={132} /><T x={930} y={440} t="*not strong*" s={118} /><Seta x1={760} y1={480} x2={520} y2={520} c={-0.3} /></Svg>
    </>}
    {v === 'b5' && <>
      <P p="academia" x={340} a={1000} base={1090} />
      <Svg><T x={930} y={270} t="*5* habits" s={124} /><T x={930} y={400} t="keep you weak" s={92} /><Seta x1={900} y1={450} x2={580} y2={520} c={-0.25} /></Svg>
    </>}
    {v === 'c5' && <>
      <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -150, top: 110, width: 1000 }} />
      <Svg><T x={900} y={130} t="lose the" s={104} /><T x={900} y={240} t="*straps*" s={104} /><Seta x1={1000} y1={280} x2={760} y2={470} c={-0.3} /></Svg>
    </>}
    {v === 'c' && <>
      <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -150, top: 110, width: 1000 }} />
      <Svg><T x={900} y={170} t="it's the *hands*" s={100} /><Seta x1={1000} y1={215} x2={760} y2={470} c={-0.3} /></Svg>
    </>}
  </AbsoluteFill>
);
