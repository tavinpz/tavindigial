// P4 (escuro) — "Ferramentas demais": colagem de telas soltas em profundidade (WhatsApp, planilha, caderno, telefone),
// número grande desfocado, e linhas que convergem para a Thata, com o painel do lado.
// Referência: comercial de software B2B (fundo preto, colagem com profundidade, linhas pontilhadas com faíscas).
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Flutua, NumGrande, Convergem, Icone, Fecho, Titulo, Toque, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_P4 = 600;

const Janela: React.FC<{ titulo: string; children?: React.ReactNode; h?: number; claro?: boolean }> = ({ titulo, children, h = 300, claro }) => (
  <div style={{ height: h, borderRadius: 22, overflow: 'hidden', background: claro ? '#F4F4F2' : '#141A18', border: '1.5px solid rgba(255,255,255,.12)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.9)' }}>
    <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: claro ? '#E6E6E2' : '#1C2421', fontFamily: G, fontWeight: 600, fontSize: 18, color: claro ? '#333' : '#AFC0B8' }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 99, background: claro ? '#C9C9C4' : '#2E3A36' }} />)}<span style={{ marginLeft: 8 }}>{titulo}</span>
    </div>
    <div style={{ padding: 14 }}>{children}</div>
  </div>
);

const Linhas: React.FC<{ n: number; claro?: boolean }> = ({ n, claro }) => (
  <>{Array.from({ length: n }, (_, i) => <div key={i} style={{ height: 14, borderRadius: 6, marginBottom: 12, width: `${60 + ((i * 37) % 35)}%`, background: claro ? '#DADAD5' : 'rgba(255,255,255,.08)' }} />)}</>
);

const Aviso: React.FC<{ ini: number; fim?: number; x: number; y: number; ic: string; t: string; s: string; cor?: string }> = ({ ini, fim, x, y, ic, t, s, cor = '#FF5A5F' }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const p = molaViva(f, ini);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 520, display: 'flex', gap: 16, alignItems: 'center', padding: '18px 22px', borderRadius: 24, background: 'rgba(30,38,35,.92)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,.12)', boxShadow: '0 30px 60px -20px rgba(0,0,0,.9)', transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * -30}px)`, opacity: Math.min(1, p * 2) * saida(f, fim, 8), zIndex: 45 }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: cor, display: 'grid', placeItems: 'center', flex: 'none' }}><Icone n={ic} tam={28} cor="#fff" traco={2.4} /></div>
      <div><div style={{ fontFamily: G, fontWeight: 600, fontSize: 26, color: '#EEF4F1' }}>{t}</div><div style={{ fontFamily: G, fontWeight: 500, fontSize: 21, color: '#8FA29A' }}>{s}</div></div>
    </div>
  );
};

export const P4: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const caos = Math.min(saida(f, 214, 16), lerp(f, 158, 172, 1, 0.22));
  const camZ = chaves(f, [[0, 1.08], [200, 1], [214, 0.9]]);
  const painel = mola(f, 262);
  return (
    <AbsoluteFill>
      <Fundo gy={960} brilho={0.5} grade={0.6} />
      {/* 1. a colagem de ferramentas soltas */}
      <AbsoluteFill style={{ opacity: caos, transform: `scale(${camZ})` }}>
        <div style={{ position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', fontFamily: G, fontWeight: 500, fontSize: 44, color: C.fg, opacity: Math.min(lerp(f, 2, 12, 0, 1), saida(f, 50, 8)) }}>→ Sua recepção usa 6 ferramentas</div>
        <Flutua x={60} y={430} w={480} ini={8} z={0.1} rot={-3}><Janela titulo="WhatsApp Web"><Linhas n={6} /></Janela></Flutua>
        <Flutua x={560} y={520} w={460} ini={16} z={0.5} rot={2}><Janela titulo="planilha_pacientes.xlsx" claro h={260}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>{Array.from({ length: 30 }, (_, i) => <div key={i} style={{ height: 22, background: i % 7 === 3 ? '#FFE08A' : '#E6E6E2' }} />)}</div>
        </Janela></Flutua>
        <Flutua x={120} y={900} w={380} ini={24} z={0.35} rot={4}>
          <div style={{ height: 320, borderRadius: 14, background: '#F6EFD8', padding: 26, boxShadow: '0 40px 80px -30px rgba(0,0,0,.9)', backgroundImage: 'repeating-linear-gradient(transparent 0 38px, rgba(0,0,0,.08) 38px 40px)', fontFamily: G, fontWeight: 500, fontSize: 26, color: '#4A4130', lineHeight: '40px' }}>
            agenda — terça<br />9h Ana (limpeza)<br />10h ??? remarcar<br /><s>11h Pedro</s> → qui<br />ligar p/ Dona Marta
          </div>
        </Flutua>
        <Flutua x={560} y={880} w={420} ini={32} z={0.05} rot={-2}><Janela titulo="Instagram · Direct" h={280}><Linhas n={5} /></Janela></Flutua>
        <Flutua x={300} y={1260} w={480} ini={40} z={0.6} rot={1}><Janela titulo="Google Agenda" claro h={240}><Linhas n={4} claro /></Janela></Flutua>
        <Flutua x={40} y={1260} w={220} ini={48} z={0.2} rot={-6}>
          <div style={{ height: 220, borderRadius: 30, background: '#1E2623', display: 'grid', placeItems: 'center', boxShadow: '0 30px 60px -20px rgba(0,0,0,.9)' }}><Icone n="fone" tam={110} cor="#AFC0B8" traco={1.6} /></div>
        </Flutua>
        <Aviso ini={60} fim={214} x={420} y={760} ic="chat" t="23 mensagens não lidas" s="WhatsApp · há 2 horas" />
        <Aviso ini={84} fim={214} x={140} y={1120} ic="fone" t="3 ligações perdidas" s="Telefone fixo · 09:12" />
        <Aviso ini={108} fim={214} x={460} y={1410} ic="agenda" t="Conflito de horário" s="Planilha × Google Agenda" cor="#C98512" />
        <Toque ks={[{ f: 126, x: 900, y: 1700 }, { f: 146, x: 700, y: 820 }]} toques={[150]} ini={126} fim={170} />
      </AbsoluteFill>

      {/* 2. o número grande */}
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(lerp(f, 160, 172, 0, 1), saida(f, 252, 12)), zIndex: 50 }}>
        <div style={{ position: 'relative' }}>
          {f < 214 ? <NumGrande de={1} ate={6} ini={160} dur={30} tam={420} /> : <NumGrande de={6} ate={1} ini={214} dur={22} tam={420} cor={C.luz} />}
        </div>
        <div style={{ fontFamily: G, fontWeight: 500, fontSize: 44, color: C.fg2, marginTop: -10 }}>{f < 214 ? 'lugares pra olhar' : 'lugar só'}</div>
      </div>

      {/* 3. linhas que convergem para a Thata + painel */}
      {f >= 248 && (
        <AbsoluteFill style={{ opacity: saida(f, 492, 12) }}>
          <div style={{ position: 'absolute', left: 30, top: 760, display: 'flex', flexDirection: 'column', gap: 26 }}>
            {['chat', 'fone', 'agenda', 'insta', 'arquivo'].map((ic, i) => (
              <div key={ic} style={{ width: 64, height: 64, borderRadius: 18, background: '#1E2623', border: '1.5px solid rgba(255,255,255,.1)', display: 'grid', placeItems: 'center', transform: `scale(${molaViva(f, 250 + i * 4)})` }}><Icone n={ic} tam={32} cor="#AFC0B8" /></div>
            ))}
          </div>
          <Convergem cx={420} cy={960} ini={256} n={16} comp={330} abertura={420} />
          <div style={{ position: 'absolute', left: 420 - 120, top: 960 - 44, width: 240, height: 88, borderRadius: 26, background: '#101C18', border: `1.5px solid ${C.verde}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: G, fontWeight: 500, fontSize: 40, color: C.ink, boxShadow: `0 0 ${40 + Math.sin(f / 5) * 10}px rgba(27,195,113,.45)`, transform: `scale(${molaViva(f, 262)})`, zIndex: 30 }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: C.verde }} />thata
          </div>
          <Convergem cx={420 + 120} cy={960} ini={270} n={5} de="dir" comp={-90} abertura={30} />
          {/* o painel */}
          <div style={{ position: 'absolute', left: 570, top: 640, width: 490, height: 640, borderRadius: 30, background: '#101C18', border: '1.5px solid rgba(255,255,255,.1)', boxShadow: '0 60px 120px -40px rgba(0,0,0,.95)', transform: `translateX(${(1 - painel) * 300}px) perspective(1400px) rotateY(-9deg)`, opacity: Math.min(1, painel * 2), padding: 28, overflow: 'hidden' }}>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 30, color: C.ink }}>Bom dia, Clínica Aurora</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 22 }}>
              {[['Conversas', '23 resolvidas'], ['Ligações', '6 atendidas'], ['Agenda', '14 hoje'], ['Confirmadas', '12 de 14']].map(([a, b], i) => (
                <div key={a} style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.08)', opacity: lerp(f, 290 + i * 8, 300 + i * 8, 0, 1) }}>
                  <div style={{ fontFamily: M, fontSize: 18, color: C.fg3 }}>{a}</div>
                  <div style={{ fontFamily: G, fontWeight: 600, fontSize: 30, color: C.luz, marginTop: 6 }}>{b}</div>
                </div>
              ))}
            </div>
            <svg width={430} height={180} style={{ marginTop: 24 }} viewBox="0 0 500 180">
              <path d="M0 160 C 60 150, 90 120, 140 128 S 230 80, 280 86 S 380 30, 500 20" fill="none" stroke={C.luz} strokeWidth={5} pathLength={1} strokeDasharray={`${lerp(f, 300, 360, 0, 1)} 1`} />
            </svg>
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t={'Tudo espalhado.\n*Nada respondido.*'} ini={50} fim={156} tam={76} acento={C.alerta} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0 }}>
        <Titulo t={'Deixa a Thata\n*organizar a recepção.*'} ini={262} fim={492} tam={76} />
      </div>
      <div style={{ position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: lerp(f, 380, 392, 0, 1) * saida(f, 492, 10) }}>
        <div style={{ padding: '22px 40px', borderRadius: 99, border: `1.5px solid ${C.linha2}`, fontFamily: G, fontWeight: 500, fontSize: 36, color: C.ink, transform: `scale(${molaViva(f, 380)})` }}>Receber uma ligação da Thata →</div>
      </div>
      {f >= 488 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 488, 500, 0, 1) }}><Fecho ini={494} frase={'Seis ferramentas.\n*Uma recepção.*'} /></div>}
    </AbsoluteFill>
  );
};
