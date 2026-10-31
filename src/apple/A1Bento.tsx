// A1 — "Tudo que a sua marca precisa" (grade bento de keynote; só música)
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, Easing } from 'remotion';
import { P, F, Texto, Esfera, Estrelas, Icone, Num, Digita, Fecho, lerp, chaves, molaViva } from '../leve/kit';
import { Preto, Vidro, Grad, Centro, Aura } from './kitA';

export const DUR_A1 = 520;
const CINZA = '#9A93A3';
const Rot: React.FC<{ t: string; ic: string }> = ({ t, ic }) => (
  <div style={{ position: 'absolute', left: 34, top: 30, display: 'flex', alignItems: 'center', gap: 12, fontFamily: F, fontWeight: 700, fontSize: 30, color: CINZA }}>
    <Icone n={ic} tam={32} cor={CINZA} traco={2} />{t}
  </div>
);

const SAI = 352;
export const A1: React.FC = () => {
  const f = useCurrentFrame();
  const tituloY = chaves(f, [[44, 900], [66, 250]]);
  const tituloS = chaves(f, [[44, 1], [66, 0.66]]);
  // câmera: aproxima no ladrilho do Google e volta
  const z = chaves(f, [[90, 1], [250, 1.04], [272, 1.9], [306, 1.9], [326, 1]]);
  const cx = chaves(f, [[250, 540], [272, 294], [306, 294], [326, 540]]);
  const cy = chaves(f, [[250, 960], [272, 924], [306, 924], [326, 960]]);
  const barras = Array.from({ length: 16 }, (_, i) => 20 + Math.abs(Math.sin(f / 4 + i * 0.9)) * 60 * (0.5 + 0.5 * Math.sin(i)));
  const rol = chaves(f, [[110, 0], [230, 1400]]);
  return (
    <AbsoluteFill>
      <Preto />
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${z}) translate(${-cx}px, ${-cy}px)` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: tituloY - 110, display: 'flex', justifyContent: 'center', transform: `scale(${tituloS})`, opacity: lerp(f, SAI - 10, SAI + 4, 1, 0) }}>
          <Texto t={'Tudo que a sua marca\n*precisa*.'} ini={4} tam={94} peso={800} cor="#fff" acento="#E07BFF" tracking={-0.045} largura={1040} />
        </div>
        {/* Site */}
        <Vidro x={60} y={400} w={960} h={300} ini={62} fim={SAI}>
          <Rot t="Site" ic="site" />
          <div style={{ position: 'absolute', left: 34, top: 96, fontFamily: F, fontWeight: 800, fontSize: 58, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.03em' }}>Seu site<br /><Grad>no ar.</Grad></div>
          <div style={{ position: 'absolute', right: 30, top: 30, width: 500, height: 300, borderRadius: 22, overflow: 'hidden', background: '#1a1420', boxShadow: '0 20px 40px rgba(0,0,0,.5)' }}>
            <div style={{ height: 34, background: '#26202c', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 9, background: c }} />)}
            </div>
            <Img src={staticFile('telas/site_estetica.png')} style={{ position: 'absolute', top: 34 - rol * (500 / 700), left: 0, width: 500 }} />
          </div>
        </Vidro>
        {/* Google */}
        <Vidro x={60} y={724} w={468} h={400} ini={68} fim={SAI + 3}>
          <Rot t="Google" ic="pino" />
          <div style={{ position: 'absolute', left: 34, top: 110, fontFamily: F, fontWeight: 800, fontSize: 170, lineHeight: 1, color: '#fff', letterSpacing: '-0.05em' }}><Num de={0} ate={4.9} ini={80} dur={40} casas={1} /></div>
          <div style={{ position: 'absolute', left: 38, top: 292 }}><Estrelas tam={40} ini={96} /></div>
          <div style={{ position: 'absolute', left: 38, top: 346, fontFamily: F, fontWeight: 600, fontSize: 28, color: CINZA }}>231 avaliações</div>
        </Vidro>
        {/* Reels */}
        <Vidro x={552} y={724} w={468} h={400} ini={74} fim={SAI + 6}>
          <Rot t="Reels" ic="play" />
          <div style={{ position: 'absolute', left: 34, top: 96, width: 170, height: 270, borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(160deg, #7B2CF0, #B600F6 60%, #FEA8FF)' }}>
            <Esfera x={85 + Math.sin(f / 10) * 30} y={120 + Math.cos(f / 12) * 20} r={40} cor="rosa" />
            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 14, height: 6, borderRadius: 9, background: 'rgba(255,255,255,.3)' }}>
              <div style={{ width: `${((f % 90) / 90) * 100}%`, height: 6, borderRadius: 9, background: '#fff' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', left: 228, top: 120, fontFamily: F, fontWeight: 800, fontSize: 46, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Editados<br />com <Grad>ritmo.</Grad></div>
          <div style={{ position: 'absolute', left: 228, bottom: 40, display: 'flex', gap: 6, alignItems: 'flex-end', height: 90 }}>
            {barras.slice(0, 11).map((h, i) => <div key={i} style={{ width: 12, height: h, borderRadius: 6, background: i % 3 === 0 ? '#E07BFF' : 'rgba(255,255,255,.7)' }} />)}
          </div>
        </Vidro>
        {/* Artes */}
        <Vidro x={60} y={1148} w={468} h={330} ini={80} fim={SAI + 9}>
          <Rot t="Artes" ic="imagem" />
          {[0, 1, 2].map((i) => {
            const s = molaViva(f, 100 + i * 6);
            const giro = (i - 1) * 12 * s; const dx = (i - 1) * 110 * s;
            const cores = ['linear-gradient(150deg,#FEA8FF,#B600F6)', 'linear-gradient(150deg,#F4F2F6,#D9C3F7)', 'linear-gradient(150deg,#7B2CF0,#2A0C55)'];
            return (
              <div key={i} style={{ position: 'absolute', left: 234 - 85 + dx, top: 100, width: 170, height: 200, borderRadius: 18, background: cores[i], transform: `rotate(${giro}deg)`, transformOrigin: '50% 120%', boxShadow: '0 16px 30px rgba(0,0,0,.45)', zIndex: i === 1 ? 2 : 1, padding: 18 }}>
                <div style={{ width: '70%', height: 12, borderRadius: 6, background: i === 1 ? P.el : '#fff', opacity: 0.85 }} />
                <div style={{ width: '45%', height: 12, borderRadius: 6, background: i === 1 ? P.el : '#fff', opacity: 0.5, marginTop: 10 }} />
              </div>
            );
          })}
        </Vidro>
        {/* IA */}
        <Vidro x={552} y={1148} w={468} h={330} ini={86} fim={SAI + 12}>
          <Rot t="SEO para IAs" ic="ia" />
          <div style={{ position: 'absolute', left: 34, right: 34, top: 100, padding: '18px 22px', borderRadius: 22, background: 'rgba(255,255,255,.08)', fontFamily: F, fontWeight: 600, fontSize: 28, color: '#fff', lineHeight: 1.3, minHeight: 130 }}>
            <Digita t="Uma ótima opção perto de você é o Studio Aurora." ini={120} vel={2} cor="#fff" tam={28} peso={600} quebra />
          </div>
        </Vidro>
        <Aura x={60} y={724} w={468} h={400} raio={44} ini={262} fim={312} espessura={6} />
      </div>
      {/* fechamento */}
      <Centro y={760}><Texto t={'Um time.\n*Uma conversa.*'} ini={SAI + 14} tam={120} peso={800} cor="#fff" acento="#E07BFF" tracking={-0.05} fim={428} /></Centro>
      <Centro y={1060}><Texto t="Site, Google, Reels, artes e IA, falando a mesma língua." ini={SAI + 34} tam={40} peso={600} cor={CINZA} fim={428} largura={760} passo={1} /></Centro>
      {f >= 424 && <Fecho ini={430} frase="Tudo que a sua marca precisa, num lugar só." claro={false} />}
    </AbsoluteFill>
  );
};
