// C5 (claro) — "Pavor de dentista": a linha do batimento acelerado vai acalmando a cada mensagem até virar um sorriso.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Conversa, Fecho, lerp, saida, mola, chaves, usaTema } from './kit';

export const DUR_C5 = 610;
const W = 600;

// batimento: amplitude e ritmo caem conforme a conversa avança
const Batimento: React.FC<{ y: number; nivel: number; sorriso: number; cor: string }> = ({ y, nivel, sorriso, cor }) => {
  const f = useCurrentFrame();
  const pts: string[] = [];
  const periodo = 120 + (1 - nivel) * 220;
  for (let x = 0; x <= 1080; x += 6) {
    const fase = ((x + f * (6 + nivel * 10)) % periodo) / periodo;
    let v = 0;
    if (fase > 0.4 && fase < 0.46) v = -1;
    else if (fase >= 0.46 && fase < 0.52) v = 1.6;
    else if (fase >= 0.52 && fase < 0.58) v = -0.5;
    v *= nivel;
    v += Math.sin(x / 90 + f / 20) * 0.04;
    const sorr = sorriso * Math.sin(((x - 290) / 500) * Math.PI) * (x > 290 && x < 790 ? 1 : 0);
    pts.push(`${x},${y - v * 130 * (1 - sorriso) + sorr * 90}`);
  }
  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
      <polyline points={pts.join(' ')} fill="none" stroke={cor} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" opacity={1 - sorriso * 0.0} />
    </svg>
  );
};

export const C5: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const nivel = chaves(f, [[0, 1], [150, 1], [210, 0.7], [250, 0.5], [300, 0.3], [340, 0.12], [380, 0.02]]);
  const bpm = Math.round(72 + 44 * nivel);
  const cor = nivel > 0.6 ? C.alerta : nivel > 0.25 ? C.ambar : C.verde;
  const sorriso = lerp(f, 386, 420, 0, 1);
  const lY = chaves(f, [[0, 960], [80, 960], [104, 210], [380, 210], [410, 860]]);
  const tela = Math.min(1, 1);
  return (
    <AbsoluteFill>
      <Fundo gy={lY} brilho={sorriso} />
      <Batimento y={lY} nivel={nivel} sorriso={sorriso} cor={cor} />
      <div style={{ position: 'absolute', right: 70, top: lY - 190, fontFamily: M, fontSize: 34, color: cor, opacity: saida(f, 400, 12) * tela }}>♥ {bpm} bpm</div>

      <div style={{ position: 'absolute', top: 1180, left: 0, right: 0 }}>
        <Titulo t={'Ela tem *pavor*\nde dentista.'} ini={10} fim={88} tam={92} acento={C.alerta} />
      </div>

      {/* conversa */}
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 420, transform: `translateY(${(1 - mola(f, 92, { damping: 17, stiffness: 110, mass: 1 })) * 1900 + lerp(f, 372, 400, 0, 1900)}px)` }}>
        <Conversa w={W} nome="Lívia R." sub="WhatsApp da clínica" tam={28} msgs={[
          { t: 'Oi… preciso tratar um dente, mas tenho pavor de dentista. Faz 5 anos que não vou', f: 104, hora: '19:40' },
          { t: 'Oi, Lívia, obrigada por contar. Isso é mais comum do que parece. Aqui a primeira consulta é só uma conversa com a Dra. Paula, sem procedimento.', f: 150, eu: true, ia: true, hora: '19:40', fim: 330 },
          { t: 'Sério? Sem mexer em nada?', f: 210, hora: '19:41' },
          { t: 'Sem mexer em nada. Ela explica tudo e você decide no seu tempo. Quer um horário tranquilo, no fim da tarde?', f: 246, eu: true, hora: '19:41' },
          { t: 'Pode ser… quinta?', f: 300, hora: '19:43' },
          { t: 'Quinta, 17h. Já avisei a Dra. que você prefere ir com calma.', f: 330, eu: true, hora: '19:43' },
        ]} />
      </div>

      {f >= 404 && <Ponto x={540} y={lY + 90 + 30} r={lerp(f, 404, 420, 0, 22)} o={saida(f, 486, 10)} />}
      <div style={{ position: 'absolute', top: 1180, left: 0, right: 0 }}>
        <Titulo t={'A Thata não empurra.\n*Acolhe.*'} ini={410} fim={488} tam={80} />
      </div>
      <div style={{ position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: lerp(f, 430, 444, 0, 1) * saida(f, 488, 10) }}>
        <div style={{ fontFamily: M, fontSize: 30, color: C.prof }}>quinta · 17:00 · primeira conversa</div>
      </div>
      {f >= 482 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 482, 494, 0, 1) }}><Fecho ini={488} frase={'Atendimento com\n*paciência de verdade.*'} /></div>}
    </AbsoluteFill>
  );
};
