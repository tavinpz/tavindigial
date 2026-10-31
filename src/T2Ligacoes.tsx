// T2 — "Ao mesmo tempo": uma ligação atendida e marcada; a câmera recua e são dezenas de ligações juntas.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Camera, Fone, Onda, Check, Icone, Fecho, Surge, lerp, saida, mola , usaTema } from './kit';

export const DUR_T2 = 640;
const W = 620;
const TW = W - 34;
const NOMES = ['Carla M.', 'João P.', 'Ana L.', 'Rafael S.', 'Beatriz C.', 'Lucas F.', 'Helena R.', 'Diego T.', 'Sofia N.', 'Pedro A.', 'Larissa V.', 'Bruno K.', 'Camila D.', 'Igor S.', 'Paula G.', 'Renato O.'];

const relogio = (seg: number) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(Math.floor(seg) % 60).padStart(2, '0')}`;

const Tela: React.FC<{ nome: string; ini: number; sem: number; nivel: number; base?: number; children?: React.ReactNode }> = ({ nome, ini, sem, nivel, base = 0, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #FFFFFF, #EEF7F2)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 150 }}>
      <div style={{ fontFamily: M, fontSize: 24, color: C.fg2 }}>ligação recebida · {relogio(base + Math.max(0, f - ini) / 30)}</div>
      <div style={{ width: 150, height: 150, borderRadius: '50%', background: C.menta, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 64, color: C.verde, marginTop: 36 }}>{nome[0]}</div>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 52, letterSpacing: '-0.04em', color: C.ink, marginTop: 22 }}>{nome}</div>
      <div style={{ marginTop: 40 }}><Onda w={TW - 120} h={120} n={30} nivel={nivel} semente={sem} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26, fontFamily: G, fontWeight: 500, fontSize: 26, color: C.prof, background: C.menta, padding: '10px 22px', borderRadius: 99 }}>
        <div style={{ width: 12, height: 12, borderRadius: 99, background: C.verde }} />Thata atendendo · IA
      </div>
      {children}
    </div>
  );
};

const Fala: React.FC<{ t: string; ini: number; thata?: boolean }> = ({ t, ini, thata }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const s = mola(f, ini);
  const n = Math.min(t.length, Math.floor((f - ini) * 1.6));
  return (
    <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 20}px)`, display: 'flex', flexDirection: 'column', alignItems: thata ? 'flex-start' : 'flex-end' }}>
      <div style={{ fontFamily: M, fontSize: 20, color: thata ? C.verde : C.fg3, marginBottom: 6 }}>{thata ? '● Thata' : 'paciente'}</div>
      <div style={{ maxWidth: 470, fontFamily: G, fontWeight: 500, fontSize: 30, lineHeight: 1.28, letterSpacing: '-0.01em', color: thata ? C.ink : C.fg2, textAlign: thata ? 'left' : 'right' }}>{t.slice(0, n)}</div>
    </div>
  );
};

const FALAS: [string, number, boolean][] = [
  ['Clínica Aurora, aqui é a Thata, assistente virtual. Como posso ajudar?', 104, true],
  ['Queria marcar uma avaliação de implante.', 158, false],
  ['Claro! Tenho amanhã às 10h ou quinta às 16h.', 200, true],
  ['Quinta às 16h.', 250, false],
  ['Marcado, Otávio. Te mando a confirmação no WhatsApp.', 272, true],
];

export const T2: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const falaAtual = [...FALAS].reverse().find(([, ini]) => f >= ini);
  const nivelMain = f < 96 ? 0.15 : falaAtual && falaAtual[2] && f < falaAtual[1] + falaAtual[0].length / 1.6 + 6 ? 1 : 0.32;
  const recolhe = lerp(f, 506, 548, 0, 1);
  const grade: React.ReactNode[] = [];
  for (let r = -3; r <= 3; r++) for (let c = -3; c <= 3; c++) {
    if (r === 0 && c === 0) continue;
    const d = Math.hypot(c, r * 1.4);
    const ini = 352 + d * 18;
    const s = mola(f, ini, { damping: 15, stiffness: 120, mass: 0.8 });
    if (s <= 0.01) continue;
    const k = ((r + 3) * 7 + (c + 3)) % NOMES.length;
    grade.push(
      <div key={`${r}_${c}`} style={{ position: 'absolute', left: 540 + c * 720 - W / 2, top: 960 + r * 1400 - 640, opacity: Math.min(1, s * 1.5), transform: `scale(${0.85 + 0.15 * s})` }}>
        <Fone w={W}><Tela nome={NOMES[k]} ini={ini} sem={r * 3.1 + c * 1.7} nivel={0.4 + 0.6 * Math.abs(Math.sin(f / 23 + r + c * 2))} base={(k * 17) % 140} /></Fone>
      </div>,
    );
  }
  return (
    <AbsoluteFill>
      <Fundo brilho={saida(f, 360, 30)} />
      <AbsoluteFill style={{ opacity: 1 - recolhe, transform: `scale(${1 - recolhe * 0.6})` }}>
        <Camera ks={[{ f: 0, x: 540, y: 960, s: 1.15 }, { f: 90, x: 540, y: 960, s: 1 }, { f: 330, x: 540, y: 980, s: 1.03 }, { f: 420, x: 540, y: 960, s: 0.36 }, { f: 470, x: 540, y: 960, s: 0.36 }, { f: 530, x: 540, y: 960, s: 0.15 }]}>
          <div style={{ position: 'relative', width: 1080, height: 1920 }}>
            {grade}
            {/* gancho: o ponto vira toque de chamada */}
            <div style={{ position: 'absolute', left: 0, top: 0, opacity: saida(f, 70, 12) }}>
              {[0, 1, 2].map((i) => {
                const fase = ((f + i * 15) % 45) / 45;
                return <div key={i} style={{ position: 'absolute', left: 540 - 60 - fase * 220, top: 900 - 60 - fase * 220, width: 120 + fase * 440, height: 120 + fase * 440, borderRadius: '50%', border: `4px solid ${C.verde}`, opacity: (1 - fase) * 0.6 }} />;
              })}
              <div style={{ position: 'absolute', left: 540 - 60, top: 900 - 60, width: 120, height: 120, borderRadius: '50%', background: C.verde, display: 'grid', placeItems: 'center', transform: `rotate(${Math.sin(f * 1.3) * 12}deg) scale(${mola(f, 4)})`, boxShadow: '0 20px 50px -14px rgba(21,167,99,.8)' }}>
                <Icone n="fone" tam={60} cor="#fff" traco={2.2} />
              </div>
            </div>
            {/* a ligação principal */}
            <div style={{ position: 'absolute', left: 540 - W / 2, top: 960 - 640, transform: `translateY(${(1 - mola(f, 64, { damping: 17, stiffness: 110, mass: 1 })) * 1300}px)` }}>
              <Fone w={W}>
                <Tela nome="Otávio B." ini={90} sem={0} nivel={nivelMain}>
                  <div style={{ position: 'absolute', left: 36, right: 36, bottom: 40, display: 'flex', flexDirection: 'column', gap: 22 }}>
                    {FALAS.map(([t, ini, th], i) => {
                      const prox = FALAS[i + 2];
                      const o = prox ? saida(f, prox[1] + 6, 8) : 1;
                      return o > 0 && <div key={i} style={{ opacity: o }}><Fala t={t} ini={ini} thata={th} /></div>;
                    })}
                  </div>
                </Tela>
              </Fone>
              <div style={{ position: 'absolute', left: -60, right: -60, top: 520, display: 'flex', justifyContent: 'center', opacity: saida(f, 350, 10) }}>
                <Surge ini={312} dy={60}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '28px 40px 28px 28px', borderRadius: 40, background: '#fff', boxShadow: '0 40px 80px -30px rgba(11,20,17,.45)', border: `1.5px solid ${C.linha}` }}>
                    <Check ini={318} tam={92} />
                    <div>
                      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 42, letterSpacing: '-0.035em', color: C.ink }}>Avaliação marcada</div>
                      <div style={{ fontFamily: M, fontSize: 28, color: C.fg2, marginTop: 4 }}>qui · 16:00 · implante</div>
                    </div>
                  </div>
                </Surge>
              </div>
            </div>
          </div>
        </Camera>
      </AbsoluteFill>
      {/* o ponto que sobra depois que tudo recolhe */}
      {f >= 520 && f < 590 && <Ponto x={540} y={960} r={lerp(f, 520, 548, 0, 40)} />}

      <div style={{ position: 'absolute', top: 1180, left: 0, right: 0 }}>
        <Titulo t={'Toca o telefone\nda clínica.'} ini={8} fim={70} tam={84} />
      </div>
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0 }}>
        <Titulo t="Ela atende, entende *e marca.*" ini={110} fim={344} tam={62} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 520, background: 'linear-gradient(rgba(243,247,245,.97) 45%, rgba(243,247,245,0))', opacity: Math.min(lerp(f, 380, 400, 0, 1), saida(f, 520, 14)) }} />
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t={'Enquanto isso,\n*mais 8 ligações.*'} ini={384} fim={452} tam={84} />
      </div>
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0 }}>
        <Titulo t="Todas *ao mesmo tempo.*" ini={456} fim={520} tam={76} />
      </div>
      <div style={{ position: 'absolute', top: 1060, left: 0, right: 0 }}>
        <Titulo t={'Uma Thata.\n*Todas as linhas.*'} ini={530} fim={584} tam={84} />
      </div>
      {f >= 578 && <div style={{ position: 'absolute', inset: 0, opacity: lerp(f, 578, 590, 0, 1) }}><Fecho ini={584} frase={'Atende, entende\n*e marca.*'} /></div>}
    </AbsoluteFill>
  );
};
