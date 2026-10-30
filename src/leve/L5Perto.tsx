// L5 — "Perto de mim" (mapa com pinos, ficha do negócio, pergunta para a IA; só música)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, Easing } from 'remotion';
import { P, F, FundoLuz, Texto, Card, Surge, Icone, Etiqueta, Estrelas, Botao, Digita, Fecho, lerp, chaves, mola, molaViva, saida, io } from './kit';

export const DUR_L5 = 630;
import { PERGUNTA_L5 as _P5 } from './fx';
export const PERGUNTA_L5 = _P5;

const CW = 920, CH = 1040; // cartão do mapa
const RUAS = [
  'M-20 300 L1240 192', 'M-20 640 L1240 718', 'M160 -20 L260 1060', 'M520 -20 L470 1060', 'M780 -20 L860 1060',
  'M-20 920 C 300 860, 600 1000, 1240 880', 'M260 300 L780 120',
];
const CONC = [[150, 250], [330, 560], [720, 330], [820, 780], [260, 860]]; // concorrentes
const NOS = { x: 640, y: 470 };
const VOCE = { x: 420, y: 650 };

const Mapa: React.FC = () => {
  const f = useCurrentFrame();
  const z = chaves(f, [[126, 1], [156, 1.35]]);
  const cx = chaves(f, [[126, CW / 2], [156, NOS.x]]), cy = chaves(f, [[126, CH / 2], [156, NOS.y + 140]]);
  const apaga = lerp(f, 120, 140, 1, 0.3);
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${CW / 2}px, ${CH / 2}px) scale(${z}) translate(${-cx}px, ${-cy}px)` }}>
      <svg width={CW + 320} height={CH + 200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <rect x={-300} y={-300} width={CW + 640} height={CH + 600} fill="#F3EFF7" />
        <path d="M600 760 C 700 700, 860 740, 900 820 C 930 900, 820 980, 700 950 C 600 930, 540 830, 600 760 Z" fill="#DDF1E4" opacity={lerp(f, 8, 30, 0, 1)} />
        <path d="M-20 40 C 200 90, 300 20, 520 60 L520 -20 L-20 -20 Z" fill="#DCE8FA" opacity={lerp(f, 8, 30, 0, 1)} />
        {RUAS.map((d, i) => {
          const p = lerp(f, 4 + i * 3, 34 + i * 3, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="#E2DAEA" strokeWidth={34} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
              <path d={d} fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
            </g>
          );
        })}
      </svg>
      {/* radar */}
      {[0, 1, 2].map((k) => {
        const t = ((f - 40 - k * 16) % 48) / 48;
        if (f < 40 + k * 16 || f > 150) return null;
        return <div key={k} style={{ position: 'absolute', left: VOCE.x - 300 * t, top: VOCE.y - 300 * t, width: 600 * t, height: 600 * t, borderRadius: 999, border: `3px solid ${P.vio}`, background: 'rgba(123,44,240,.06)', opacity: 1 - t }} />;
      })}
      <div style={{ position: 'absolute', left: VOCE.x - 22, top: VOCE.y - 22, width: 44, height: 44, borderRadius: 999, background: P.vio, border: '7px solid #fff', boxShadow: '0 6px 18px rgba(60,20,120,.4)', transform: `scale(${molaViva(f, 30)})` }} />
      {CONC.map(([x, y], i) => <Pino key={i} x={x} y={y} ini={52 + i * 5} cor={P.fg3} op={apaga} />)}
      <Pino x={NOS.x} y={NOS.y} ini={112} cor={P.el} grande />
      {/* rótulo do nosso pino */}
      <div style={{ position: 'absolute', left: NOS.x - 170, width: 340, justifyContent: 'center', top: NOS.y - 200, transform: `scale(${molaViva(f, 122)})`, transformOrigin: 'center bottom', padding: '14px 24px', borderRadius: 999, background: '#fff', boxShadow: '0 16px 36px -12px rgba(76,22,120,.4)', fontFamily: F, fontWeight: 800, fontSize: 32, color: P.ink, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10 }}>
        Studio Aurora <span style={{ color: P.ambar }}>★</span> 4,9
      </div>
    </div>
  );
};

const Pino: React.FC<{ x: number; y: number; ini: number; cor: string; grande?: boolean; op?: number }> = ({ x, y, ini, cor, grande, op = 1 }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini, 30, { damping: 9, stiffness: 160, mass: 0.7 });
  if (f < ini) return null;
  const t = grande ? 112 : 70;
  return (
    <div style={{ position: 'absolute', left: x - t / 2, top: y - t, width: t, height: t, opacity: Math.min(1, s * 2) * op, transform: `translateY(${(1 - s) * -160}px)` }}>
      <div style={{ position: 'absolute', left: t * 0.3, top: t * 0.92, width: t * 0.4, height: t * 0.12, borderRadius: 999, background: 'rgba(40,10,70,.25)', transform: `scale(${s})` }} />
      <svg width={t} height={t} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 6px 10px rgba(60,10,90,.35))' }}>
        <path d="M12 23s-8-6.7-8-13a8 8 0 0 1 16 0c0 6.3-8 13-8 13z" fill={cor} />
        <circle cx="12" cy="10" r="3.4" fill="#fff" />
      </svg>
    </div>
  );
};

const Ficha: React.FC = () => {
  const f = useCurrentFrame();
  const s = mola(f, 156, 30, { damping: 17, stiffness: 120, mass: 0.9 });
  if (f < 156) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: '#fff', borderRadius: '44px 44px 0 0', boxShadow: '0 -20px 50px -20px rgba(76,22,120,.35)', transform: `translateY(${(1 - s) * 600}px)`, padding: '26px 44px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ alignSelf: 'center', width: 90, height: 8, borderRadius: 9, background: P.linha }} />
      <div style={{ fontFamily: F, fontWeight: 800, fontSize: 52, color: P.ink }}>Studio Aurora</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: F, fontWeight: 700, fontSize: 32, color: P.fg2 }}>
        <span style={{ color: P.ink }}>4,9</span><Estrelas tam={30} ini={164} /><span>(231) · Estética · 600 m</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}><Etiqueta t="Aberto agora" tam={26} fundo="#DDF6EA" cor={P.ok} /><Etiqueta t="Agenda online" tam={26} /></div>
      <div style={{ fontFamily: F, fontWeight: 700, fontSize: 26, color: P.fg3, marginTop: 6 }}>SERVIÇOS</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {['Limpeza de pele', 'Drenagem', 'Peeling'].map((t, i) => (
          <div key={t} style={{ transform: `scale(${molaViva(f, 174 + i * 4)})` }}><Etiqueta t={t} tam={28} fundo="#F6F1FA" cor={P.ink} icone="coracao" /></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        {[['Rotas', 'pino'], ['Ligar', 'chat'], ['Site', 'site']].map(([t, n], i) => (
          <Surge key={t} ini={186 + i * 4}><div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 26px', borderRadius: 999, border: `2px solid ${P.linha}`, fontFamily: F, fontWeight: 700, fontSize: 28, color: P.prof }}><Icone n={n} tam={30} cor={P.prof} traco={2.2} />{t}</div></Surge>
        ))}
        <Surge ini={198}><Botao texto="Agendar" h={76} tam={28} w={190} /></Surge>
      </div>
    </div>
  );
};

const Pontinhos: React.FC<{ ini: number; fim: number }> = ({ ini, fim }) => {
  const f = useCurrentFrame();
  if (f < ini || f >= fim) return null;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '24px 30px', borderRadius: 30, background: P.lilas, alignSelf: 'flex-start' }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 99, background: P.vio, transform: `translateY(${Math.sin((f - ini) / 3 - i) * 6}px)`, opacity: 0.5 + 0.5 * Math.sin((f - ini) / 3 - i) }} />)}
    </div>
  );
};

export const L5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <FundoLuz />
      <Pos y={210}><Texto t={'Alguém procura\n*perto de você*.'} ini={4} tam={78} fim={74} /></Pos>
      <Pos y={210}><Texto t={'Quem aparece\n*primeiro*?'} ini={78} tam={78} fim={156} /></Pos>
      <Pos y={210}><Texto t={'Perfil completo\nvende *antes do clique*.'} ini={160} tam={74} fim={266} /></Pos>
      <Card x={(1080 - CW) / 2} y={430} w={CW} h={CH} ini={0} fim={266} raio={52} de="escala">
        <Mapa />
        <Ficha />
      </Card>

      {/* IA */}
      <Pos y={240}><Texto t={'E quando perguntam\n*pra IA*?'} ini={272} tam={78} fim={440} /></Pos>
      <Card x={80} y={520} w={920} h={700} ini={268} fim={440} raio={48} de="giro" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: `2px solid ${P.linha}` }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: `linear-gradient(140deg, ${P.el}, ${P.vio})`, display: 'grid', placeItems: 'center' }}><Icone n="ia" tam={42} cor="#fff" traco={2} /></div>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 38, color: P.ink }}>Assistente</div>
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: 680, padding: '24px 30px', borderRadius: '30px 30px 8px 30px', background: P.ink, color: '#fff', minHeight: 40, opacity: lerp(f, 282, 290, 0, 1) }}>
          <Digita t={PERGUNTA_L5} ini={290} vel={1} cor="#fff" tam={34} peso={600} cursor={false} quebra />
        </div>
        <Pontinhos ini={336} fim={352} />
        {f >= 352 && (
          <div style={{ alignSelf: 'flex-start', maxWidth: 760, padding: '26px 30px', borderRadius: '30px 30px 30px 8px', background: P.lilas, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Texto t="Uma opção bem avaliada é o *Studio Aurora*, em Moema: nota 4,9 e agendamento pelo WhatsApp." ini={352} tam={34} peso={600} alinhar="left" largura={700} passo={1} linha={1.3} acento={P.el} />
            <Surge ini={372}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 20, background: '#fff' }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: '#2A1630', color: '#F3C3E8', display: 'grid', placeItems: 'center', fontFamily: F, fontWeight: 600, fontSize: 24 }}>SA</div>
                <div style={{ fontFamily: F }}><div style={{ fontWeight: 800, fontSize: 28, color: P.ink }}>Studio Aurora</div><div style={{ fontWeight: 600, fontSize: 22, color: P.fg2 }}>Estética em Moema · site oficial</div></div>
              </div>
            </Surge>
          </div>
        )}
      </Card>

      {/* proposta */}
      <Pos y={640}><Texto t={'A gente deixa o seu negócio\npronto pra *ser encontrado*.'} ini={446} tam={72} fim={526} /></Pos>
      <div style={{ position: 'absolute', top: 870, left: 90, right: 90, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
        {[['Perfil no Google', 'pino'], ['Avaliações', 'estrela'], ['Página', 'pagina'], ['SEO para IAs', 'ia']].map(([t, n], i) => (
          <Surge key={t} ini={466 + i * 6} fim={526} dy={36}><Etiqueta t={t} icone={n} tam={34} fundo="#fff" cor={P.ink} style={{ boxShadow: '0 14px 34px -14px rgba(76,22,120,.35)' }} /></Surge>
        ))}
      </div>
      {f >= 522 && <Fecho ini={528} frase="Google, avaliações e SEO para IAs." />}
    </AbsoluteFill>
  );
};

const Pos: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>{children}</div>
);
