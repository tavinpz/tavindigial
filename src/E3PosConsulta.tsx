// E3 (escuro) — "Dois dias depois": a Thata acompanha o pós-consulta; quando o paciente relata dor, chama a doutora.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Conversa, Fone, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_E3 = 600;
const W = 640;

export const E3: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const div = lerp(f, 262, 300, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const doutora = mola(f, 276, { damping: 17, stiffness: 110, mass: 1 });
  const voo = lerp(f, 300, 330, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const notif = molaViva(f, 330);
  // posições na tela
  const pX = 540 + div * -262, pS = 1 - div * 0.22;
  const dX = 540 + 262 + (1 - doutora) * 700;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 760], [260, 960]])} gx={chaves(f, [[300, 540], [340, 800], [400, 540]])} />
      {/* gancho */}
      <div style={{ position: 'absolute', top: 760, left: 0, right: 0, opacity: saida(f, 90, 12) }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}><Surge0 /></div>
        <Titulo t={'Dois dias depois\nda *extração.*'} ini={10} fim={90} tam={92} />
      </div>

      {/* celular da clínica (conversa com o paciente) */}
      <div style={{ position: 'absolute', left: pX - W / 2, top: 330, transformOrigin: '50% 0%', transform: `translateY(${(1 - mola(f, 84, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px) scale(${pS})` }}>
        <Conversa w={W} nome="Rafael T." sub="WhatsApp da clínica" tam={30} msgs={[
          { t: 'Oi, Rafael! Aqui é a Thata, da Clínica Aurora. Como você está depois da extração de segunda?', f: 100, eu: true, ia: true, hora: '10:00' },
          { t: 'Tá doendo um pouco ainda e inchou do lado', f: 156, hora: '10:03' },
          { t: 'Obrigada por avisar, Rafael. Já chamei a Dra. Paula pra olhar com você.', f: 206, eu: true, hora: '10:03' },
          { t: 'Oi, Rafael! Me manda uma foto do lado que inchou?', f: 392, eu: true, humano: 'Dra. Paula · equipe', hora: '10:05' },
        ]} />
      </div>

      {/* celular da doutora: tela bloqueada com o aviso */}
      {f >= 270 && (
        <div style={{ position: 'absolute', left: dX - W / 2, top: 330, transformOrigin: '50% 0%', transform: `scale(0.78)`, opacity: Math.min(1, doutora * 2) }}>
          <Fone w={W} tela={C.noite}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 0%, #133024, #06100C 70%)' }} />
            <div style={{ position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 500, fontSize: 150, letterSpacing: '-0.05em', color: '#EEF4F1' }}>10:04</div>
            <div style={{ position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 500, fontSize: 32, color: '#8FA29A' }}>quarta-feira, 4 de novembro</div>
            {f >= 330 && (
              <div style={{ position: 'absolute', left: 26, right: 26, top: 470, padding: '26px 28px', borderRadius: 34, background: 'rgba(238,244,241,.12)', border: '1.5px solid rgba(255,255,255,.12)', transform: `scale(${0.8 + 0.2 * notif}) translateY(${(1 - notif) * -60}px)`, opacity: Math.min(1, notif * 2) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: G, fontWeight: 600, fontSize: 26, color: '#EEF4F1' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: C.verde, display: 'grid', placeItems: 'center' }}><div style={{ width: 14, height: 14, borderRadius: 99, background: '#06100C' }} /></div>
                  Thata · Clínica Aurora <span style={{ marginLeft: 'auto', fontFamily: M, fontWeight: 400, fontSize: 22, color: '#8FA29A' }}>agora</span>
                </div>
                <div style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: '#EEF4F1', marginTop: 16, letterSpacing: '-0.02em' }}>Rafael T. precisa de você</div>
                <div style={{ fontFamily: G, fontWeight: 500, fontSize: 28, color: '#CBD8D2', marginTop: 6, lineHeight: 1.3 }}>Extração na segunda. Relatou dor e inchaço hoje. Toque para ver a conversa.</div>
              </div>
            )}
          </Fone>
        </div>
      )}
      {/* o ponto leva o aviso de um celular para o outro */}
      {f >= 300 && f < 336 && <Ponto x={lerp(voo, 0, 1, 278, 802, (x) => x)} y={760 - Math.sin(voo * Math.PI) * 260} r={26} />}

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A Thata *acompanha o pós.*" ini={100} fim={250} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'Quando precisa de gente,\n*ela chama gente.*'} ini={262} fim={470} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 1470, left: 0, right: 0, opacity: lerp(f, 396, 410, 0, 1) * saida(f, 470, 12) }}>
        <div style={{ textAlign: 'center', fontFamily: M, fontSize: 30, color: C.fg2 }}>a doutora assume a conversa</div>
      </div>
      {f >= 470 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 470, 482, 0, 1) }}><Fecho ini={476} frase={'Cuida antes, durante\n*e depois da consulta.*'} /></div>}
    </AbsoluteFill>
  );
};

const Surge0: React.FC = () => {
  const f = useCurrentFrame();
  return <div style={{ fontFamily: M, fontSize: 34, color: C.luz, opacity: lerp(f, 2, 14, 0, 1) }}>quarta · 10:00 · pós-consulta</div>;
};
