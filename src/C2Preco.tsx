// C2 (claro) — "Quanto custa?": a resposta seca faz o paciente sumir; rebobina; com a Thata a pergunta vira consulta.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Conversa, Icone, Fecho, Surge, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_C2 = 620;
const W = 640;
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const NUVEM = Array.from({ length: 22 }, (_, i) => ({ x: 70 + rnd(i, 1) * 700, y: 380 + rnd(i, 2) * 1260, r: (rnd(i, 3) - 0.5) * 14, ini: 6 + i * 3, s: 0.75 + rnd(i, 4) * 0.5 }));

const Pergunta: React.FC<{ x: number; y: number; r: number; s: number; ini: number; vira?: number; fim?: number }> = ({ x, y, r, s, ini, vira, fim }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const p = molaViva(f, ini);
  const v = vira !== undefined ? lerp(f, vira, vira + 12, 0, 1) : 0;
  const o = saida(f, fim, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `rotate(${r}deg) scale(${p * s})`, opacity: o, perspective: 800 }}>
      <div style={{ position: 'relative', transform: `rotateX(${v * 180}deg)`, transformStyle: 'preserve-3d' }}>
        <div style={{ backfaceVisibility: 'hidden', padding: '18px 28px', borderRadius: 28, borderBottomLeftRadius: 8, background: C.papel, border: `1.5px solid ${C.linha}`, boxShadow: '0 20px 40px -24px rgba(11,20,17,.45)', fontFamily: G, fontWeight: 600, fontSize: 36, color: C.ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Quanto custa?</div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 28, background: C.verde, fontFamily: G, fontWeight: 600, fontSize: 30, color: '#fff', whiteSpace: 'nowrap' }}>
          <Icone n="ok" tam={30} cor="#fff" traco={3} /> Consulta marcada
        </div>
      </div>
    </div>
  );
};

export const C2: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const reb = f >= 224 && f < 262;
  const nuvemFim = 92;
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 960], [240, 900]])} brilho={f > 224 && f < 262 ? 0.4 : 1} />
      {/* a nuvem de perguntas */}
      {NUVEM.map((b, i) => <Pergunta key={i} {...b} fim={nuvemFim + (i % 5)} />)}
      {f >= 444 && NUVEM.map((b, i) => <Pergunta key={'v' + i} {...b} ini={444 + i * 1.5} vira={462 + i * 2} fim={538} />)}

      {/* jeito comum */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, transform: `translateY(${(1 - mola(f, 92, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px)`, opacity: f < 262 ? 1 : 0, filter: reb ? 'grayscale(1)' : undefined }}>
        <Conversa w={W} nome="Renata S." sub="WhatsApp da clínica" tam={31} msgs={[
          { t: 'Oi! Quanto custa o implante?', f: 110, hora: '10:12' },
          { t: 'Só passando aqui pra avaliar.', f: 148, eu: true, hora: '11:47', fim: 250 },
        ]} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center' }}>
          <Surge ini={186} fim={226}><div style={{ fontFamily: M, fontSize: 28, color: C.fg3 }}>visto às 11:48 · sem resposta</div></Surge>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center' }}>
          <Surge ini={196} fim={226}><div style={{ padding: '18px 30px', borderRadius: 99, background: C.alertaSuave, color: C.alerta, fontFamily: G, fontWeight: 600, fontSize: 34 }}>Paciente sumiu</div></Surge>
        </div>
      </div>
      {reb && <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(11,20,17,.05) 0 3px, transparent 3px 9px)', backgroundPosition: `0 ${f * 14}px` }} />}
      {reb && (
        <div style={{ position: 'absolute', top: 1700, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontFamily: G, fontWeight: 600, fontSize: 90, color: C.ambar, letterSpacing: '-0.05em' }}>
          <svg width={120} height={80} viewBox="0 0 30 20"><path d="M14 2 L2 10 L14 18 Z M28 2 L16 10 L28 18 Z" fill={C.ambar} /></svg>de novo
        </div>
      )}

      {/* com a Thata */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, opacity: f >= 262 ? saida(f, 446, 12) : 0 }}>
        <Conversa w={W} nome="Renata S." sub="WhatsApp da clínica" tam={30} msgs={[
          { t: 'Oi! Quanto custa o implante?', f: 0, hora: '10:12' },
          { t: 'Oi, Renata! O valor depende de quantos dentes e do osso, por isso o primeiro passo é uma avaliação com o Dr. André, sem custo.', f: 282, eu: true, ia: true, hora: '10:12' },
          { t: 'E dá pra parcelar?', f: 330, hora: '10:13' },
          { t: 'Dá sim, em até 12x. Quer que eu veja um horário essa semana?', f: 360, eu: true, hora: '10:13' },
          { t: 'Quero!', f: 396, hora: '10:14' },
          { t: 'Quinta, 10h, reservado. Te mando o endereço na véspera.', f: 420, eu: true, hora: '10:14' },
        ]} />
      </div>

      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'A pergunta que mais chega\nno *WhatsApp da clínica.*'} ini={20} fim={96} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="A resposta seca…" ini={130} fim={186} tam={70} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="…e o paciente *some.*" ini={190} fim={226} tam={70} acento={C.alerta} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="Agora com a *Thata.*" ini={264} fim={350} tam={70} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t="A pergunta vira *conversa.*" ini={354} fim={440} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'E cada "quanto custa?"\nvira *consulta marcada.*'} ini={450} fim={538} tam={66} />
      </div>
      {f >= 532 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 532, 544, 0, 1) }}><Fecho ini={538} frase={'Do "quanto custa?"\n*à consulta marcada.*'} /></div>}
    </AbsoluteFill>
  );
};
