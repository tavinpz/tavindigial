// A3 — "Pronta em 24h" (tipografia cinética no tempo da música; só música)
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, Easing } from 'remotion';
import { P, F, FundoLuz, Texto, Letras, Fone, Fecho, lerp, chaves, mola } from '../leve/kit';
import { Preto, Corte, Atravessa, Grad, Centro, Flash, GRAD, expo } from './kitA';

export const DUR_A3 = 480;
export const PALAVRAS_A3 = ['Design.', 'Textos.', 'Fotos.', 'Serviços.', 'Agenda.', 'WhatsApp.', 'Domínio.', 'Google.'];

export const A3: React.FC = () => {
  const f = useCurrentFrame();
  const branco = f >= 270;
  const anel = lerp(f, 200, 258, 0, 1, Easing.bezier(0.5, 0, 0.2, 1));
  const ponteiro = lerp(f, 200, 258, 0, 720 * 2, Easing.bezier(0.5, 0, 0.2, 1));
  const sobe = mola(f, 276, 30, { damping: 18, stiffness: 70, mass: 1.1 });
  const rol = chaves(f, [[300, 0], [380, 900]]);
  return (
    <AbsoluteFill>
      {!branco ? <Preto luz={f > 195 ? 1.6 : 0.6} /> : <FundoLuz base="#FBFAFC" a="rgba(254,168,255,.35)" b="rgba(182,0,246,.10)" />}
      {/* abertura */}
      <Centro y={890}><Letras t="Você manda o nome." ini={4} tam={64} peso={600} cor="#fff" fim={30} /></Centro>
      <Centro y={890}><Letras t="A gente faz o resto." ini={30} tam={64} peso={600} cor="rgba(255,255,255,.85)" fim={58} /></Centro>
      {/* rajada de palavras, uma por batida */}
      {PALAVRAS_A3.map((p, i) => <Corte key={p} t={p} ini={60 + i * 15} fim={75 + i * 15} tam={p.length > 8 ? 190 : 230} grad={i % 2 === 1} />)}
      {/* No ar em 24h */}
      <Centro y={400}><Texto t="No ar em" ini={180} tam={86} peso={700} cor="#fff" fim={268} /></Centro>
      <Atravessa ini={195} fim={268} de={16} dur={14}>
        <div style={{ position: 'relative', width: 800, height: 800, display: 'grid', placeItems: 'center' }}>
          <svg width={800} height={800} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <defs><linearGradient id="an" x1="0" x2="1"><stop offset="0" stopColor="#FFC4FF" /><stop offset=".5" stopColor="#B600F6" /><stop offset="1" stopColor="#7B2CF0" /></linearGradient></defs>
            <circle cx={400} cy={400} r={360} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={14} />
            <circle cx={400} cy={400} r={360} fill="none" stroke="url(#an)" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${anel} 1`} />
          </svg>
          <div style={{ position: 'absolute', left: 397, top: 70, width: 6, height: 330, borderRadius: 9, background: 'rgba(255,255,255,.35)', transformOrigin: '50% 100%', transform: `rotate(${ponteiro}deg)` }} />
          <Grad style={{ fontFamily: F, fontWeight: 800, fontSize: 330, letterSpacing: '-0.06em', lineHeight: 1, paddingBottom: 30 }}>24h</Grad>
        </div>
      </Atravessa>
      <Flash em={270} />
      {/* celular com a página pronta */}
      {branco && f < 400 && (
        <>
          <Centro y={170}><Texto t={'Sua página pronta.\n*Amanhã.*'} ini={278} tam={92} peso={800} fim={392} tracking={-0.045} /></Centro>
          <div style={{ position: 'absolute', left: 540 - 270, top: 470, perspective: 2000 }}>
            <div style={{ transform: `translateY(${(1 - sobe) * 1300}px) rotateX(${(1 - sobe) * 38 + 6}deg) rotateY(${-10 + sobe * 4 + Math.sin(f / 30) * 3}deg) rotateZ(${(1 - sobe) * -8}deg)` }}>
              <Fone w={540}>
                <Img src={staticFile('telas/demo_nail.png')} style={{ position: 'absolute', width: 508, left: 0, top: -rol * (508 / 780) }} />
              </Fone>
            </div>
          </div>
        </>
      )}
      {f >= 394 && <Fecho ini={398} frase="Peça a prévia grátis da sua página." />}
    </AbsoluteFill>
  );
};
