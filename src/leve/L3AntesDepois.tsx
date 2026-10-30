// L3 — "Antes e depois do link da bio" (comparação com divisor deslizante; com voz)
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, Easing } from 'remotion';
import { P, F, FundoLuz, Texto, Fone, Nota, Icone, Fecho, Legenda, lerp, chaves, mola, molaViva, saida } from './kit';
import { inicios } from './fx';

export const FALAS_L3 = [
  'Esse é o link da bio da maioria dos negócios.',
  'Quatro botões, nenhuma foto, nenhum preço. O cliente não entende o que você faz, e vai embora.',
  'Agora olha a mesma bio, feita pra vender.',
  'Serviços com preço, avaliações do Google e um botão direto pro WhatsApp.',
  'É a mesma pessoa visitando. Só que agora ela chama.',
  'Quer ver como fica a sua? A prévia é grátis. Me chama no direct.',
];
export const DUR_L3 = [80, 130, 80, 120, 90, 120];

const W = 520; const TELA = W - W * 0.06; // largura da tela
const Antes: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#EFEDF1', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 110, gap: 14, fontFamily: F }}>
    <div style={{ width: 130, height: 130, borderRadius: 999, background: '#D9D4DE', display: 'grid', placeItems: 'center', color: '#8D8496', fontWeight: 700, fontSize: 44 }}>SA</div>
    <div style={{ fontWeight: 700, fontSize: 30, color: '#4A4250', marginTop: 8 }}>@studio.aurora</div>
    <div style={{ fontWeight: 500, fontSize: 22, color: '#8D8496', marginBottom: 26 }}>estética 💆‍♀️ | agende pelo direct</div>
    {['Instagram', 'WhatsApp', 'Localização', 'Promoções'].map((t) => (
      <div key={t} style={{ width: TELA - 70, padding: '24px 0', borderRadius: 16, border: '2px solid #CFC8D6', textAlign: 'center', fontWeight: 600, fontSize: 26, color: '#6E6576', background: '#F7F6F8' }}>{t}</div>
    ))}
  </div>
);

export const L3: React.FC<{ dur?: number[]; falas?: { ini: number; fim: number; texto: string }[] }> = ({ dur = DUR_L3, falas }) => {
  const f = useCurrentFrame();
  const I = inicios(dur);
  const corte = lerp(f, I[2] + 8, I[2] + 46, 0, 1, Easing.bezier(0.7, 0, 0.25, 1)); // divisor: 0 = antes, 1 = depois
  const rol = chaves(f, [[I[3], 0], [I[3] + 60, 440], [I[4] - 4, 440], [I[4] + 10, 0]]);
  const ent = mola(f, 0, 30, { damping: 18, stiffness: 90, mass: 1 });
  const giro = Math.sin(f / 38) * 7 * (1 - lerp(f, I[2], I[2] + 10, 0, 1) + lerp(f, I[2] + 50, I[2] + 70, 0, 1));
  const foneO = saida(f, I[5] + 4, 14);
  const notif = mola(f, I[4] + 12, 30, { damping: 15, stiffness: 140, mass: 0.8 });
  const sx = TELA * corte;
  return (
    <AbsoluteFill>
      <FundoLuz />
      {/* celular */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 400, perspective: 1800, opacity: foneO * Math.min(1, ent * 1.5) }}>
        <div style={{ transform: `translateY(${(1 - ent) * 400}px) rotateY(${giro}deg) rotateX(${3 + (1 - ent) * 25}deg) scale(${1 - (1 - foneO) * 0.08})` }}>
          <Fone w={W}>
            <Antes />
            <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${TELA - sx}px 0 0)` }}>
              <Img src={staticFile('telas/demo_estetica.png')} style={{ position: 'absolute', width: TELA, left: 0, top: -rol * (TELA / 780) }} />
            </div>
            {corte > 0 && corte < 1 && (
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: sx - 2, width: 4, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,.25)', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: '50%', left: -36, width: 76, height: 76, marginTop: -38, borderRadius: 999, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={P.el} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>
                </div>
              </div>
            )}
            {/* notificação */}
            {f >= I[4] + 10 && (
              <div style={{ position: 'absolute', left: 14, right: 14, top: 20 + (1 - notif) * -200, padding: '20px 22px', borderRadius: 26, background: 'rgba(255,255,255,.94)', boxShadow: '0 20px 40px -14px rgba(0,0,0,.35)', display: 'flex', gap: 16, alignItems: 'center', zIndex: 10, opacity: Math.min(1, notif * 1.3) }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: '#1DAA61', display: 'grid', placeItems: 'center', flex: 'none' }}><Icone n="whats" tam={40} cor="#fff" traco={2} /></div>
                <div style={{ fontFamily: F, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 22, color: P.fg2 }}>WhatsApp · agora</div>
                  <div style={{ fontWeight: 700, fontSize: 25, color: P.ink, lineHeight: 1.25 }}>Oi! Tem horário pra limpeza de pele no sábado?</div>
                </div>
              </div>
            )}
          </Fone>
        </div>
      </div>
      {/* rótulos antes/depois */}
      <div style={{ position: 'absolute', left: 540 - W / 2 - 30, top: 1420, opacity: lerp(f, 20, 34, 0, 1) * (1 - corte) * foneO }}><Rotulo t="Antes" /></div>
      <div style={{ position: 'absolute', left: 540 + W / 2 - 150, top: 1420, opacity: corte * foneO * saida(f, I[4], 10) }}><Rotulo t="Depois" roxo /></div>

      {/* anotações */}
      <Nota t="Sem fotos" bom={false} ini={I[1] + 20} fim={I[2] + 10} style={{ left: 60, top: 640 }} />
      <Nota t="Sem preços" bom={false} ini={I[1] + 34} fim={I[2] + 10} style={{ right: 60, top: 860 }} />
      <Nota t="Sem avaliações" bom={false} ini={I[1] + 48} fim={I[2] + 10} style={{ left: 60, top: 1080 }} />
      <Nota t="Serviços e preços" ini={I[3] + 10} fim={I[4] + 4} style={{ right: 50, top: 650 }} />
      <Nota t="4,9 no Google" ini={I[3] + 26} fim={I[4] + 4} style={{ left: 60, top: 880 }} />
      <Nota t="Agenda no WhatsApp" ini={I[3] + 42} fim={I[4] + 4} style={{ right: 50, top: 1110 }} />

      {/* títulos */}
      <Pos y={190}><Texto t={'O link da bio\n*de sempre*.'} ini={8} tam={78} fim={I[1] + 2} /></Pos>
      <Pos y={190}><Texto t={'Não explica nada.\nO cliente *vai embora*.'} ini={I[1] + 6} tam={74} fim={I[2] + 2} /></Pos>
      <Pos y={190}><Texto t={'A mesma bio,\n*feita pra vender*.'} ini={I[2] + 6} tam={78} fim={I[4] + 2} /></Pos>
      <Pos y={190}><Texto t={'Mesma visita.\nAgora ela *chama*.'} ini={I[4] + 6} tam={78} fim={I[5] + 2} /></Pos>

      {f >= I[5] - 4 && <Fecho ini={I[5] + 4} frase="Peça a prévia grátis da sua página." />}
      {falas && <Legenda falas={falas} y={1530} />}
    </AbsoluteFill>
  );
};

const Rotulo: React.FC<{ t: string; roxo?: boolean }> = ({ t, roxo }) => (
  <div style={{ padding: '14px 30px', borderRadius: 999, background: roxo ? P.el : P.ink, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: 32 }}>{t}</div>
);
const Pos: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>{children}</div>
);
