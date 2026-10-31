// E4 (escuro) — "Presa no trânsito": a paciente avisa o atraso; a Thata remarca o bloco e encaixa alguém da lista de espera no buraco.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Conversa, Fecho, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_E4 = 600;
const W = 640;
const MIN = 7, Y0 = 600; // 8:00 em y=470, 7px por minuto
const yDe = (h: number, m: number) => Y0 + ((h - 8) * 60 + m) * MIN;

const Bloco: React.FC<{ y: number; h: number; nome: string; proc: string; hora: string; cor?: 'base' | 'foco' | 'novo'; ini: number; style?: React.CSSProperties }> = ({ y, h, nome, proc, hora, cor = 'base', ini, style }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini);
  const bg = cor === 'foco' ? C.menta : cor === 'novo' ? C.verde : C.papel;
  const tx = cor === 'novo' ? '#06100C' : C.ink;
  return (
    <div style={{ position: 'absolute', left: 230, right: 80, top: y + 4, height: h - 8, borderRadius: 24, background: bg, border: `2px solid ${cor === 'foco' ? C.verde : C.linha2}`, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 20, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 80}px)`, overflow: 'hidden', ...style }}>
      <div style={{ fontFamily: M, fontSize: 26, color: cor === 'novo' ? '#06100C' : C.fg2, width: 150 }}>{hora}</div>
      <div>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 34, letterSpacing: '-0.02em', color: tx }}>{nome}</div>
        {h > 160 && <div style={{ fontFamily: G, fontWeight: 500, fontSize: 26, color: cor === 'novo' ? '#06100C' : C.fg2 }}>{proc}</div>}
      </div>
    </div>
  );
};

export const E4: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const desce = lerp(f, 318, 350, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const ySofia = yDe(9, 0) + desce * 20 * MIN;
  const agenda = Math.min(lerp(f, 268, 290, 0, 1), saida(f, 470, 12));
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 1100], [260, 900]])} />
      {/* gancho: lanternas do trânsito */}
      <AbsoluteFill style={{ opacity: saida(f, 92, 14) }}>
        {Array.from({ length: 18 }, (_, i) => {
          const fila = i % 3, col = Math.floor(i / 3);
          const x = 120 + col * 160 + (fila % 2) * 60 + Math.sin(f / 30 + i) * 6;
          const y = 1150 + fila * 150 + col * 12;
          const ac = 0.55 + 0.45 * Math.abs(Math.sin(f / 9 + i));
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 46, transform: `scale(${0.7 + fila * 0.2})` }}>
              {[0, 1].map((k) => <div key={k} style={{ width: 26, height: 14, borderRadius: 8, background: '#FF5A5F', boxShadow: `0 0 ${24 * ac}px ${8 * ac}px rgba(255,90,95,${0.45 * ac})` }} />)}
            </div>
          );
        })}
        <div style={{ position: 'absolute', top: 620, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 40, color: C.fg2 }}>08:47 · marginal, parado</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', top: 720, left: 0, right: 0 }}>
        <Titulo t={'A consulta é às 9h.\nE ela *não vai chegar.*'} ini={10} fim={92} tam={80} />
      </div>

      {/* conversa */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, transform: `translateY(${(1 - mola(f, 84, { damping: 17, stiffness: 110, mass: 1 })) * 1900 + lerp(f, 262, 290, 0, -1900, Easing.bezier(0.6, 0, 0.8, 0.4))}px)` }}>
        <Conversa w={W} nome="Sofia N." sub="WhatsApp da clínica" tam={30} msgs={[
          { t: 'Bom dia! Tô presa no trânsito, vou chegar uns 20 min atrasada, desculpa!', f: 100, hora: '08:47' },
          { t: 'Bom dia, Sofia! Sem problema. Consigo segurar seu horário até 9h20 ou passar pra 10h40. Qual prefere?', f: 146, eu: true, ia: true, hora: '08:47' },
          { t: '9h20, tô quase aí', f: 200, hora: '08:48' },
          { t: 'Combinado, já avisei a equipe. Vem com calma!', f: 228, eu: true, hora: '08:48' },
        ]} />
      </div>

      {/* a agenda do dia se reorganiza */}
      <AbsoluteFill style={{ opacity: agenda }}>
        {[8, 9, 10].map((h) => (
          <React.Fragment key={h}>
            <div style={{ position: 'absolute', left: 80, top: yDe(h, 0) - 16, fontFamily: M, fontSize: 28, color: C.fg3 }}>{String(h).padStart(2, '0')}:00</div>
            <div style={{ position: 'absolute', left: 200, right: 60, top: yDe(h, 0), height: 1.5, background: C.linha }} />
          </React.Fragment>
        ))}
        <Bloco y={yDe(8, 0)} h={40 * MIN} nome="Ana L." proc="Limpeza" hora="08:00" ini={272} />
        <Bloco y={yDe(8, 40)} h={20 * MIN} nome="Pedro A." proc="Retorno" hora="08:40" ini={276} />
        <Bloco y={ySofia} h={40 * MIN} nome="Sofia N." proc={desce > 0.5 ? 'Restauração · chega 9h20' : 'Restauração'} hora={desce > 0.5 ? '09:20' : '09:00'} cor={f > 300 ? 'foco' : 'base'} ini={280} style={{ zIndex: 3 }} />
        <Bloco y={yDe(10, 0)} h={40 * MIN} nome="Lucas F." proc="Avaliação" hora="10:00" ini={284} />
        {f >= 372 && <Bloco y={yDe(9, 0)} h={20 * MIN} nome="Bruno K. · encaixe" proc="" hora="09:00" cor="novo" ini={372} style={{ transform: `scale(${molaViva(f, 372)})` }} />}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1770, display: 'flex', justifyContent: 'center' }}>
          <Surge ini={410}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 32px', borderRadius: 99, background: C.ink, color: C.sobreInk, fontFamily: G, fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em' }}>
              <div style={{ width: 14, height: 14, borderRadius: 99, background: C.verde }} /> Equipe avisada · nada ficou vazio
            </div>
          </Surge>
        </div>
      </AbsoluteFill>

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="Ela avisa no WhatsApp." ini={100} fim={196} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="A Thata *ajusta na hora.*" ini={200} fim={290} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="Empurra o horário…" ini={300} fim={364} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'…e encaixa alguém\nda *lista de espera.*'} ini={368} fim={470} tam={66} />
      </div>
      {f >= 466 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 466, 478, 0, 1) }}><Fecho ini={472} frase={'Atraso não vira\n*buraco na agenda.*'} /></div>}
    </AbsoluteFill>
  );
};
