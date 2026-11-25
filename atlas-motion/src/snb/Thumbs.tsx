import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import '@fontsource/nunito/800.css';
import { K } from './lib';

// Thumbs do Strong Not Big (1280x720), no padrão do nicho: fundo preto puro, personagem grande, UMA parte do corpo acesa,
// 2 a 3 palavras em letra redonda minúscula (uma em vermelho) e uma seta vermelha desenhada à mão apontando para a parte acesa.
// Regra do Tavin (18/11): as capas de um vídeo para o outro não podem repetir a mesma composição. Cada capa A tem cena própria.
// v = '<letra><número do vídeo>' (a1, b1, c1, a2, ...). 'a', 'b', 'c' sem número valem como as do vídeo 1.
const NUN = '"Nunito", "Inter", sans-serif';
// p = pose em public/snb/poses; x = centro; a = altura do corpo em px; base = y dos pés; w = largura da tela da pose (1300, ou 1700 na cruz)
const P: React.FC<{ p: string; x: number; a: number; base: number; w?: number; op?: number; dy?: number }> = ({ p, x, a, base, w = 1300, op = 1, dy = 0 }) => {
  const k = a / 1772; return <Img src={staticFile(`snb/poses/${p}.png`)} style={{ position: 'absolute', left: x - (w / 2) * k, top: base - 2172 * k + dy, width: w * k, height: 2260 * k, opacity: op }} />;
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
const Mao: React.FC = () => <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -150, top: 110, width: 1000 }} />;
const SetaMao = <Seta x1={1000} y1={280} x2={760} y2={470} c={-0.3} />;

// seta do canal com contorno preto (para fundo colorido)
const SetaC: React.FC<{ x1: number; y1: number; x2: number; y2: number; c?: number; cor?: string }> = ({ x1, y1, x2, y2, c = 0.3, cor = K.verm }) => {
  const mx = (x1 + x2) / 2 - (y2 - y1) * c, my = (y1 + y2) / 2 + (x2 - x1) * c;
  const ang = Math.atan2(y2 - my, x2 - mx), L = 54, ab = 0.5;
  const p = (d: number) => `${x2 - L * Math.cos(ang + d)},${y2 - L * Math.sin(ang + d)}`;
  const d1 = `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`, d2 = `M ${p(ab)} L ${x2},${y2} L ${p(-ab)}`;
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={d1} stroke="#111" strokeWidth={30} /><path d={d2} stroke="#111" strokeWidth={30} /><path d={d1} stroke={cor} strokeWidth={16} /><path d={d2} stroke={cor} strokeWidth={16} /></g>;
};
const CAPAS: Record<string, React.ReactNode> = {
  // #01 Farmers: os dois com o saco
  a1: <><P p="academia_saco" x={270} a={1040} base={1150} /><P p="fazendeiro_saco_ambar" x={1010} a={1040} base={1170} />
    <Svg><T x={590} y={130} t="*never* lifted" s={96} /><Seta x1={640} y1={185} x2={862} y2={606} c={0.28} /></Svg></>,
  b1: <><P p="fazendeiro_saco_ambar" x={390} a={1180} base={1262} />
    <Svg><T x={930} y={250} t="*zero* days" s={112} /><T x={930} y={370} t="in the gym" s={112} /><Seta x1={900} y1={430} x2={610} y2={648} c={-0.25} /></Svg></>,
  c1: <><Mao /><Svg><T x={900} y={170} t="it's the *hands*" s={100} /><Seta x1={1000} y1={215} x2={760} y2={470} c={-0.3} /></Svg></>,
  // #02 Três testes: pendurado com o cronômetro
  a2: <><P p="pendurado" x={300} a={797} base={944} />
    <Svg>
      <circle cx={1020} cy={470} r={150} fill="none" stroke="#2a2a2e" strokeWidth={26} />
      <circle cx={1020} cy={470} r={150} fill="none" stroke={K.verde} strokeWidth={26} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 150 * 0.72} 2000`} transform="rotate(-90 1020 470)" />
      <text x={1020} y={506} textAnchor="middle" fontFamily={NUN} fontWeight={800} fontSize={104} fill="#fff">0:43</text>
      <T x={860} y={170} t="can you *hang?*" s={104} /><Seta x1={640} y1={215} x2={450} y2={140} c={-0.2} />
    </Svg></>,
  b2: <><P p="farmer_carry_ambar" x={360} a={900} base={930} />
    <Svg><T x={920} y={270} t="only *3*" s={124} /><T x={920} y={400} t="tests" s={124} /><Seta x1={880} y1={450} x2={540} y2={545} c={-0.25} /></Svg></>,
  c2: <><Mao /><Svg><T x={880} y={130} t="beats" s={96} /><T x={880} y={235} t="*blood pressure*" s={96} />{SetaMao}</Svg></>,
  // #03 Ginastas: cruz de ferro
  a3: <><P p="cruz" x={400} a={790} base={890} w={1700} />
    <Svg><T x={1010} y={330} t="zero" s={132} /><T x={1010} y={470} t="*weights*" s={132} /><Seta x1={850} y1={250} x2={620} y2={225} c={-0.3} /></Svg></>,
  b3: <><P p="academia" x={250} a={900} base={930} /><P p="argolas" x={700} a={720} base={900} />
    <Svg><T x={1075} y={320} t="who's" s={88} /><T x={1075} y={425} t="*stronger?*" s={88} /><Seta x1={1040} y1={470} x2={850} y2={600} c={-0.3} /></Svg></>,
  c3: <><P p="argolas" x={330} a={1300} base={1528} />
    <Svg><T x={930} y={300} t="straight" s={124} /><T x={930} y={440} t="*arms*" s={124} /><Seta x1={760} y1={330} x2={545} y2={200} c={-0.25} /></Svg></>,
  // #04 Old man strength: o pai de perto, antebraço aceso
  a4: <><P p="pai_ambar" x={360} a={1050} base={1080} />
    <Svg><T x={940} y={300} t="*55*" s={260} /><T x={940} y={420} t="never trained" s={92} /><Seta x1={900} y1={470} x2={580} y2={610} c={-0.25} /></Svg></>,
  b4: <><P p="pai" x={270} a={1000} base={1090} /><P p="heroi" x={700} a={900} base={1010} />
    <Svg><T x={1050} y={300} t="dad" s={120} /><T x={1050} y={430} t="*wins*" s={120} /><Seta x1={950} y1={210} x2={440} y2={170} c={0.2} /></Svg></>,
  c4: <><P p="pai_saco" x={330} a={1100} base={1180} />
    <Svg><T x={920} y={270} t="old man" s={112} /><T x={920} y={390} t="*strength*" s={112} /><Seta x1={890} y1={440} x2={585} y2={640} c={-0.25} /></Svg></>,
  // #05 Hábitos: barra subindo, com rastro
  a5: <><P p="academia_barra" x={330} a={760} base={900} op={0.16} dy={150} /><P p="academia_barra" x={330} a={760} base={900} op={0.3} dy={75} /><P p="academia_barra" x={330} a={760} base={900} />
    <Svg><T x={940} y={300} t="big," s={132} /><T x={940} y={440} t="*not strong*" s={118} /><Seta x1={770} y1={330} x2={560} y2={170} c={-0.25} /></Svg></>,
  b5: <><P p="academia" x={340} a={1000} base={1090} />
    <Svg><T x={930} y={270} t="*5* habits" s={124} /><T x={930} y={400} t="keep you weak" s={92} /><Seta x1={900} y1={450} x2={580} y2={520} c={-0.25} /></Svg></>,
  c5: <><Mao /><Svg><T x={900} y={130} t="lose the" s={104} /><T x={900} y={240} t="*straps*" s={104} />{SetaMao}</Svg></>,
  // #06 What If 2x mais forte (refeitas 25/11, 2ª versão): cor de fundo forte e diferente em cada capa, texto com contorno,
  // seta só na cor do canal (vermelha com contorno preto). A = amarelo · B = preto + vermelho · C = azul + amarelo.
  a6: <><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 45%, #FFE07A 0%, #FFC531 50%, #F2A900 100%)' }} />
    <P p="heroi_barra_dobra" x={360} a={600} base={800} />
    <P p="academia_choque" x={1060} a={700} base={980} />
    <Svg>
      <text x={900} y={130} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={108} fill="#111" stroke="#FFE9A8" strokeWidth={10} paintOrder="stroke">same <tspan fill={K.verm}>body</tspan></text>
      <SetaC x1={720} y1={190} x2={500} y2={330} c={0.28} />
    </Svg></>,
  b6: <><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, #3a0d08 0%, #120403 45%, #000 100%)' }} />
    <Img src={staticFile('snb/poses/rosto_dor.png')} style={{ position: 'absolute', left: 610, top: 30, width: 740 }} />
    <Svg>
      <circle cx={300} cy={520} r={190} fill={K.verm} opacity={0.28} />
      {/* tendão rompido: duas pontas grossas com as fibras soltas */}
      {[-1, 1].map((l) => <g key={l} transform={`translate(${300 + l * 40},520) scale(${l},1)`}>
        <path d="M 250,-30 Q 120,-50 30,-26 L 30,26 Q 120,50 250,30 Z" fill="#F1ECE2" stroke="#000" strokeWidth={6} />
        <path d="M 240,-14 Q 140,-22 40,-8 M 240,10 Q 140,18 40,8" stroke="#b9b1a2" strokeWidth={4} fill="none" />
        {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M 32,${-22 + k * 5.5} q ${-30 - (k % 3) * 14},${(k - 4) * 6} ${-46 - (k % 4) * 10},${(k - 4) * 14}`} stroke={k % 2 ? K.verm : '#F1ECE2'} strokeWidth={5} fill="none" strokeLinecap="round" />)}
      </g>)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = k * 0.785; return <path key={k} d={`M ${300 + 70 * Math.cos(a)},${520 + 70 * Math.sin(a)} L ${300 + 140 * Math.cos(a)},${520 + 140 * Math.sin(a)}`} stroke="#FFB020" strokeWidth={8} strokeLinecap="round" />; })}
      <text x={300} y={190} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={150} fill="#fff">it</text>
      <text x={300} y={340} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={170} fill={K.verm} stroke="#000" strokeWidth={8} paintOrder="stroke">snaps</text>
    </Svg></>,
  c6: <><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, #2F6BFF 0%, #1546C7 55%, #0B2A80 100%)' }} />
    <P p="academia_choque" x={760} a={540} base={720} />
    <P p="academia_choque" x={1150} a={540} base={720} />
    <P p="academia_choque" x={955} a={620} base={790} />
    <P p="heroi_barra_dobra" x={300} a={600} base={860} />
    <Svg>
      <text x={860} y={130} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={96} fill="#fff" stroke="#0B1E5C" strokeWidth={12} paintOrder="stroke">they're <tspan fill="#FFC531">weaker</tspan></text>
    </Svg></>,
};
export const SNBThumb: React.FC<{ v: string }> = ({ v }) => (
  <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>{CAPAS[v] || CAPAS[v + '1']}</AbsoluteFill>
);
