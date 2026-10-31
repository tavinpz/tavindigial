// T1 — "23:47": conversa no WhatsApp da clínica; a câmera recua e mostra a clínica fechada, luz apagada.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Ponto, Titulo, Mono, Camera, Fone, TopoChat, Bolha, Digitando, Check, Icone, Selo, Fecho, Surge, lerp, saida, mola , usaTema } from './kit';

export const DUR_T1 = 690;

const W = 620;

const Sala: React.FC<{ x: number; y: number; w: number; h: number; nome: string; noite: number; children?: React.ReactNode }> = ({ x, y, w, h, nome, noite, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `16px solid ${C.linha2}`, background: '#F7FAF8', borderRadius: 24 }}>
    {children}
    <div style={{ position: 'absolute', left: 50, top: 40, fontFamily: G, fontWeight: 600, fontSize: 92, letterSpacing: '-0.04em', color: C.fg }}>{nome}</div>
    <div style={{ position: 'absolute', left: 50, top: 150, fontFamily: M, fontSize: 64, color: C.fg3, opacity: noite }}>luz apagada</div>
  </div>
);

const Cadeira: React.FC<{ x: number; y: number; t?: number }> = ({ x, y, t = 120 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: t, height: t, borderRadius: t * 0.3, background: '#E4EBE7', border: `8px solid ${C.linha2}` }} />
);

export const T1: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const noite = lerp(f, 440, 476, 1, 0);
  const brilhoFone = lerp(f, 300, 340, 0, 1) * noite;
  const novos = [
    ['Sex', '15:00', 'Limpeza', 'Marina A.', '23:48'],
    ['Qui', '10:30', 'Avaliação', 'Otávio B.', '01:12'],
    ['Seg', '09:00', 'Implante', 'Júlia R.', '06:40'],
  ];
  return (
    <AbsoluteFill>
      <Fundo gy={lerp(f, 0, 80, 760, 960)} brilho={saida(f, 330, 30)} />
      <Camera ks={[{ f: 0, x: 540, y: 960, s: 1 }, { f: 296, x: 540, y: 960, s: 1 }, { f: 380, x: 540, y: 980, s: 0.3 }, { f: 452, x: 560, y: 960, s: 0.3 }, { f: 500, x: 1850, y: 740, s: 1.18 }, { f: 590, x: 1850, y: 750, s: 1.24 }]}>
        <div style={{ position: 'relative', width: 1080, height: 1920 }}>
          {/* planta da clínica (só aparece no recuo) */}
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: lerp(f, 290, 320, 0, 1) }}>
            <div style={{ position: 'absolute', left: -1320, top: -1520, width: 3720, height: 4960, background: '#EDF2EF', border: `26px solid ${C.fg3}`, borderRadius: 40 }} />
            <Sala x={-1280} y={-1480} w={1040} h={2400} nome="Sala de espera" noite={noite}>
              {[0, 1, 2, 3].map((i) => <Cadeira key={i} x={90 + i * 220} y={1900} />)}
              {[0, 1, 2].map((i) => <Cadeira key={'b' + i} x={90 + i * 220} y={500} />)}
              <div style={{ position: 'absolute', left: 760, top: 1000, width: 200, height: 200, borderRadius: '50%', background: '#CFE7DA' }} />
            </Sala>
            <Sala x={-140} y={-1480} w={1360} h={1500} nome="Recepção" noite={noite}>
              <div style={{ position: 'absolute', right: 70, top: 60, display: 'flex', alignItems: 'center', gap: 20, fontFamily: M, fontSize: 80, color: C.fg2 }}>
                <Icone n="relogio" tam={90} cor={C.fg2} />{f < 460 ? '23:48' : '08:00'}
              </div>
            </Sala>
            <Sala x={1400} y={-1480} w={960} h={1600} nome="Consultório 1" noite={noite}>
              <div style={{ position: 'absolute', left: 260, top: 520, width: 300, height: 760, borderRadius: 150, background: '#E4EBE7', border: `10px solid ${C.linha2}` }} />
            </Sala>
            <Sala x={1400} y={1560} w={960} h={1800} nome="Consultório 2" noite={noite}>
              <div style={{ position: 'absolute', left: 260, top: 620, width: 300, height: 760, borderRadius: 150, background: '#E4EBE7', border: `10px solid ${C.linha2}` }} />
            </Sala>
            <Sala x={-1280} y={2120} w={2500} h={1240} nome="Copa" noite={noite} />
            {/* balcão da recepção, cadeira vazia */}
            <div style={{ position: 'absolute', left: 120, top: 200, width: 840, height: 1560, borderRadius: 70, background: '#fff', border: `12px solid ${C.linha2}` }} />
            <Cadeira x={-170} y={880} t={180} />
            <div style={{ position: 'absolute', left: -260, top: 1100, fontFamily: M, fontSize: 64, color: C.fg3, opacity: noite }}>vazia</div>
            {/* quadro da agenda no corredor */}
            <div style={{ position: 'absolute', left: 1470, top: 330, width: 760, height: 820, borderRadius: 44, background: '#fff', border: `3px solid ${C.linha}`, boxShadow: '0 30px 60px -30px rgba(11,20,17,.3)', padding: 44 }}>
              <div style={{ fontFamily: M, fontSize: 26, color: C.fg2 }}>quarta · 08:00</div>
              <div style={{ fontFamily: G, fontWeight: 600, fontSize: 52, letterSpacing: '-0.04em', color: C.ink, marginTop: 8 }}>Novos desde ontem</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 34 }}>
                {novos.map(([d, h, p, n, quando], i) => {
                  const s = mola(f, 488 + i * 16);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '22px 24px', borderRadius: 26, background: C.menta, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 80}px)` }}>
                      <div style={{ width: 96, textAlign: 'center' }}>
                        <div style={{ fontFamily: M, fontSize: 24, color: C.prof }}>{d}</div>
                        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 38, color: C.ink, letterSpacing: '-0.03em' }}>{h}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 34, color: C.ink, letterSpacing: '-0.03em' }}>{p}</div>
                        <div style={{ fontFamily: G, fontWeight: 500, fontSize: 26, color: C.fg2 }}>{n}</div>
                      </div>
                      <div style={{ fontFamily: M, fontSize: 22, color: C.verde, textAlign: 'right' }}>marcado<br />{quando}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ position: 'absolute', left: 44, right: 44, bottom: 44, display: 'flex', alignItems: 'center', gap: 14, fontFamily: G, fontWeight: 500, fontSize: 28, color: C.fg2, opacity: lerp(f, 540, 556, 0, 1) }}>
                <div style={{ width: 14, height: 14, borderRadius: 99, background: C.verde }} /> Todos marcados pela Thata
              </div>
            </div>
            {/* noite: véu azulado + brilho só no celular */}
            <div style={{ position: 'absolute', left: -1340, top: -1540, width: 3760, height: 5000, background: 'rgba(20,38,50,.36)', opacity: noite, borderRadius: 40 }} />
            <div style={{ position: 'absolute', left: 540 - 1100, top: 960 - 1100, width: 2200, height: 2200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(95,227,161,.55), rgba(95,227,161,.12) 40%, transparent 65%)', opacity: brilhoFone }} />
            {/* manhã: luz das janelas */}
            <div style={{ position: 'absolute', left: -1320, top: -1520, width: 3720, height: 4960, background: 'linear-gradient(160deg, rgba(255,236,190,.45), transparent 45%)', opacity: 1 - noite, borderRadius: 40 }} />
          </div>

          {/* gancho: 23●47 */}
          <div style={{ position: 'absolute', top: 650, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: G, fontWeight: 500, fontSize: 290, letterSpacing: '-0.06em', color: C.ink, opacity: saida(f, 84, 14), transform: `translateY(${lerp(f, 70, 84, 0, -60)}px)` }}>
            <div style={{ overflow: 'hidden' }}><span style={{ display: 'inline-block', transform: `translateY(${lerp(f, 2, 22, 110, 0)}%)` }}>23</span></div>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 18px' }}>{f >= 10 && <Ponto x={60} y={60} r={lerp(f, 10, 24, 0, 30)} />}</div>
            <div style={{ overflow: 'hidden' }}><span style={{ display: 'inline-block', transform: `translateY(${lerp(f, 6, 26, 110, 0)}%)` }}>47</span></div>
          </div>
          <div style={{ position: 'absolute', top: 1010, left: 0, right: 0 }}>
            <Titulo t={'Terça-feira.\nA clínica já fechou.'} ini={30} fim={86} tam={64} peso={500} cor={C.fg2} acento={C.ink} />
          </div>

          {/* o celular da clínica */}
          <div style={{ position: 'absolute', left: 540 - W / 2, top: 960 - 640, transform: `translateY(${(1 - mola(f, 76, { damping: 17, stiffness: 110, mass: 1 })) * 1300}px)` }}>
            <Fone w={W}>
              <TopoChat nome="Marina A." sub="WhatsApp da clínica" w={W - 34} />
              <div style={{ position: 'absolute', left: 26, right: 26, bottom: 40, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Bolha t="Oi! Vocês têm horário pra limpeza essa semana?" ini={104} hora="23:47" tam={30} max={430} />
                <Digitando ini={128} fim={160} eu />
                <Bolha t="Oi, Marina! Tenho quinta às 9h ou sexta às 15h. Qual fica melhor?" ini={160} eu ia hora="23:47" tam={30} max={450} />
                <Bolha t="Sexta às 15h" ini={204} hora="23:48" tam={30} />
                <Digitando ini={220} fim={246} eu />
                <Bolha t="Pronto! Sexta, 15h, com a Dra. Paula. Te lembro na véspera." ini={246} eu ia hora="23:48" tam={30} max={450} />
              </div>
            </Fone>
            {/* cartão de consulta marcada */}
            <div style={{ position: 'absolute', left: -60, right: -60, top: 300, display: 'flex', justifyContent: 'center', opacity: saida(f, 318, 12) }}>
              <Surge ini={274} dy={60}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '28px 40px 28px 28px', borderRadius: 40, background: '#fff', boxShadow: '0 40px 80px -30px rgba(11,20,17,.45)', border: `1.5px solid ${C.linha}` }}>
                  <Check ini={280} tam={92} />
                  <div>
                    <div style={{ fontFamily: G, fontWeight: 600, fontSize: 42, letterSpacing: '-0.035em', color: C.ink }}>Consulta marcada</div>
                    <div style={{ fontFamily: M, fontSize: 28, color: C.fg2, marginTop: 4 }}>sex · 15:00 · limpeza</div>
                  </div>
                </div>
              </Surge>
            </div>
          </div>
        </div>
      </Camera>

      {/* textos de tela */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 700, background: 'linear-gradient(rgba(243,247,245,0), rgba(243,247,245,.96) 55%)', opacity: Math.min(lerp(f, 330, 350, 0, 1), saida(f, 486, 14)) }} />
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="Uma paciente chama." ini={92} fim={196} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="E sai com *horário marcado.*" ini={232} fim={308} tam={66} />
      </div>
      <div style={{ position: 'absolute', top: 1500, left: 0, right: 0 }}>
        <Titulo t={'Mas a recepção\nfechou *às 18h.*'} ini={344} fim={412} tam={92} />
      </div>
      <div style={{ position: 'absolute', top: 1500, left: 0, right: 0 }}>
        <Titulo t={'Quem respondeu\nfui *eu.*'} ini={414} fim={476} tam={92} />
      </div>
      <div style={{ position: 'absolute', top: 1720, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Surge ini={428} fim={476}><Selo t="Thata · IA de voz e WhatsApp" fundo="#fff" cor={C.ink} tam={30} style={{ boxShadow: '0 12px 30px -16px rgba(11,20,17,.4)' }} /></Surge>
      </div>
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <Titulo t={'A equipe chega e a agenda\njá andou *sozinha.*'} ini={500} fim={590} tam={64} />
      </div>
      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        {f >= 330 && f < 452 && <Mono t="terça · 23:48" ini={332} fim={450} tam={34} cor={C.fg2} />}
        {f >= 452 && f < 492 && <Mono t="quarta · 08:00" ini={454} fim={492} tam={34} cor={C.prof} />}
      </div>
      {f >= 584 && <div style={{ position: 'absolute', inset: 0, opacity: lerp(f, 584, 598, 0, 1) }}><Fecho ini={594} frase={'Sua recepção,\n*funcionando sozinha.*'} /></div>}
    </AbsoluteFill>
  );
};
