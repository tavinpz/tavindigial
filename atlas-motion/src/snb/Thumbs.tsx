import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { K, SANS, TIT } from './lib';

// Thumbs do Strong Not Big #01 (1280x720): uma imagem forte + 2 a 3 palavras gigantes. v = 'a' | 'b' | 'c'
const P: React.FC<{ p: string; x: number; a: number; base?: number }> = ({ p, x, a, base = 700 }) => {
  const k = a / 1772; return <Img src={staticFile(`snb/poses/${p}.png`)} style={{ position: 'absolute', left: x - 650 * k, top: base - 2172 * k, width: 1300 * k, height: 2260 * k }} />;
};
const T: React.FC<{ x: number; y: number; t: string; s: number; c?: string; a?: 'start' | 'middle' | 'end'; f?: string }> = ({ x, y, t, s, c = K.osso, a = 'start', f = TIT }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={f} fontWeight={900} fontSize={s} fill={c} stroke="#000" strokeWidth={s * 0.05} paintOrder="stroke" letterSpacing={f === TIT ? 2 : -1}>{t}</text>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', left: 0, top: 0 }}>{children}</svg>;
export const SNBThumb: React.FC<{ v: string }> = ({ v }) => (
  <AbsoluteFill style={{ background: K.fundo, overflow: 'hidden' }}>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 30% 55%, #26211c 0%, #0B0B0C 62%)' }} />
    {v === 'a' && <>
      <P p="academia_largou" x={235} a={530} base={704} /><P p="fazendeiro_saco" x={560} a={530} base={704} />
      <Svg>
        <T x={760} y={250} t="NEVER" s={170} /><T x={760} y={410} t="LIFTED" s={170} />
        <T x={760} y={560} t="STRONGER" s={128} c={K.verm} />
        <path d="M 610,690 L 690,690 L 650,640 Z" fill="none" />
        <rect x={470} y={34} width={186} height={62} fill={K.verm} /><text x={563} y={80} textAnchor="middle" fontFamily={TIT} fontSize={46} fill={K.osso}>FARMER</text>
        <rect x={132} y={34} width={206} height={62} fill="#2c2c31" /><text x={235} y={80} textAnchor="middle" fontFamily={TIT} fontSize={46} fill={K.osso}>GYM GUY</text>
      </Svg>
    </>}
    {v === 'b' && <>
      <P p="fazendeiro_saco" x={330} a={690} base={770} />
      <Svg>
        <T x={640} y={230} t="0 DAYS" s={190} c={K.verm} /><T x={646} y={300} t="in the gym" s={58} f={SANS} />
        <T x={640} y={500} t="STILL" s={170} /><T x={640} y={660} t="STRONGER" s={150} />
      </Svg>
    </>}
    {v === 'c' && <>
      <Img src={staticFile('snb/poses/mao_close.png')} style={{ position: 'absolute', left: -80, top: 150, width: 760 }} />
      <Svg>
        <T x={704} y={210} t="FARMER" s={168} /><T x={704} y={370} t="STRENGTH" s={136} c={K.verm} />
        <T x={708} y={460} t="is real. here's why." s={54} f={SANS} />
        <rect x={708} y={530} width={420} height={96} fill="none" stroke={K.ambar} strokeWidth={5} /><text x={918} y={598} textAnchor="middle" fontFamily={TIT} fontSize={62} fill={K.ambar} letterSpacing={2}>4 REASONS</text>
      </Svg>
    </>}
  </AbsoluteFill>
);
