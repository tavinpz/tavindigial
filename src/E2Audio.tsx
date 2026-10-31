// E2 (escuro) — "Áudio de 2 minutos": o áudio vira texto, o texto vira 3 informações, e a Thata responde em segundos.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Conversa, Selo, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_E2 = 600;
const W = 640;
const FALA = [
  ['Oi, boa tarde, tudo bem? Então, é o Marcos, ', false],
  ['eu tô com uma ', false], ['dor no dente do siso', true], [' faz uns três dias, ', false],
  ['piora de noite, já tomei remédio e nada… ', false],
  ['eu trabalho de manhã, então ', false], ['só consigo à tarde', true], [', ', false],
  ['e queria saber se vocês atendem convênio, mas ', false],
  ['se não tiver tudo bem, ', false], ['pago particular', true], [' mesmo…', false],
] as const;
const ETIQ = ['Dor no siso', 'Só à tarde', 'Particular'];

export const E2: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const n = 46;
  const toca = lerp(f, 104, 200, 0, 1, (x) => x);
  const bY = chaves(f, [[0, 860], [90, 860], [110, 330]]);
  const bS = chaves(f, [[0, 1], [90, 1], [110, 0.84]]);
  const sumir = lerp(f, 286, 304, 0, 1);
  let car = 0;
  const total = FALA.reduce((a, [t]) => a + t.length, 0);
  const visiveis = Math.floor(lerp(f, 112, 196, 0, total, (x) => x));
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 860], [110, 700], [300, 960]])} />
      {/* o áudio gigante */}
      <div style={{ position: 'absolute', left: 50, right: 50, top: bY, transform: `scale(${bS * (1 - sumir * 0.3)})`, opacity: 1 - sumir, display: 'flex', alignItems: 'center', gap: 26, padding: '34px 40px', borderRadius: 48, borderBottomLeftRadius: 10, background: C.bolhaIn, border: `1.5px solid ${C.linha2}`, boxShadow: '0 40px 90px -40px rgba(0,0,0,.9)' }}>
        <div style={{ width: 100, height: 100, borderRadius: 99, background: C.verde, display: 'grid', placeItems: 'center', flex: 'none', transform: `scale(${mola(f, 4)})` }}>
          <svg width={40} height={40} viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="#06100C" /></svg>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, height: 110 }}>
          {Array.from({ length: n }, (_, i) => {
            const h = 14 + Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.45 + 1)) * 90;
            const cresce = lerp(f, 6 + i * 1.2, 16 + i * 1.2, 0, 1);
            return <div key={i} style={{ flex: 1, height: h * cresce, borderRadius: 6, background: i / n < toca ? C.luz : C.fg3 }} />;
          })}
        </div>
        <div style={{ fontFamily: M, fontSize: 40, color: C.fg }}>{toca > 0 ? `${Math.floor(toca * 134 / 60)}:${String(Math.floor(toca * 134) % 60).padStart(2, '0')}` : '2:14'}</div>
      </div>

      {/* transcrição */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 560, opacity: Math.min(lerp(f, 108, 120, 0, 1), 1 - sumir), fontFamily: G, fontWeight: 500, fontSize: 44, lineHeight: 1.42, letterSpacing: '-0.02em', color: C.fg }}>
        {FALA.map(([t, chave], k) => {
          const ini = car; car += t.length;
          const vis = t.slice(0, Math.max(0, Math.min(t.length, visiveis - ini)));
          if (!vis) return null;
          const real = chave ? lerp(f, 204 + k * 3, 216 + k * 3, 0, 1) : 0;
          const some = chave ? 0 : lerp(f, 232, 252, 0, 1);
          return (
            <span key={k} style={{ color: chave ? (real > 0 ? C.ink : C.fg) : C.fg, opacity: 1 - some * 0.85, background: chave ? `rgba(27,195,113,${0.35 * real})` : 'transparent', borderRadius: 10, padding: chave ? '0 6px' : 0, boxShadow: chave && real > 0 ? `inset 0 -4px 0 rgba(95,227,161,${real})` : 'none' }}>{vis}</span>
          );
        })}
      </div>
      {/* as 3 informações */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center', gap: 18, opacity: 1 - sumir }}>
        {ETIQ.map((t, i) => {
          const s = molaViva(f, 250 + i * 6);
          return f >= 250 + i * 6 && <div key={t} style={{ transform: `scale(${s}) translateY(${(1 - s) * 60}px)` }}><Selo t={t} tam={40} fundo={C.verde} cor="#06100C" /></div>;
        })}
      </div>

      {/* a resposta */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 310, transform: `translateY(${(1 - mola(f, 290, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px)`, opacity: saida(f, 486, 14) }}>
        <Conversa w={W} nome="Marcos V." sub="WhatsApp da clínica" tam={30} msgs={[
          { f: 0, audio: '2:14', hora: '14:31' },
          { t: 'Entendi, Marcos. Pra avaliar o siso, tenho quinta às 15h ou sexta às 16h30. Qual fica melhor?', f: 318, eu: true, ia: true, hora: '14:31' },
          { f: 352, eu: true, audio: '0:12', hora: '14:31', nota: '360,420' },
          { t: 'Quinta às 15h, perfeito', f: 420, hora: '14:33' },
          { t: 'Marcado! Quinta, 15h, avaliação do siso com a Dra. Lia.', f: 450, eu: true, hora: '14:33' },
        ]} />
        <div style={{ textAlign: 'center', marginTop: 26, fontFamily: M, fontSize: 26, color: C.fg2, opacity: lerp(f, 356, 370, 0, 1) }}>resposta em áudio · voz gerada por IA</div>
      </div>

      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'Ele manda um áudio\nde *2 minutos.*'} ini={8} fim={96} tam={80} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="A Thata ouve *até o fim.*" ini={108} fim={200} tam={62} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="E tira o que *importa.*" ini={204} fim={290} tam={62} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="Responde em *segundos.*" ini={304} fim={410} tam={62} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="Por texto ou *em áudio.*" ini={414} fim={488} tam={62} />
      </div>
      {f >= 484 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 484, 496, 0, 1) }}><Fecho ini={490} frase={'Ouve, entende\n*e responde.*'} /></div>}
    </AbsoluteFill>
  );
};
