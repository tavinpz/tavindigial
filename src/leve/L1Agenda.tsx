// L1 — "Do Google ao horário marcado" (fluxo de interface, estilo app de viagem; só música)
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { P, F, FundoRoxo, Camera, Texto, Letras, Card, Surge, Toque, Botao, Digita, Check, Icone, Etiqueta, Estrelas, Fecho, lerp, io, chaves, saida } from './kit';

export const DUR_L1 = 800;
import { BUSCA_L1 as BUSCA } from './fx';
const ROSA = '#FFD3FF';


const Resultado: React.FC<{ y: number; ini: number; nome: string; nota: string; qtd: string; tags: [string, boolean][]; foto?: boolean; foco?: number }> = ({ y, ini, nome, nota, qtd, tags, foto, foco = 0 }) => {
  const f = useCurrentFrame();
  const destaque = foto ? lerp(f, foco, foco + 16, 0, 1) : 0;
  const apaga = !foto && foco ? lerp(f, foco, foco + 16, 1, 0.42) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: apaga, transformOrigin: `540px ${y + 140}px`, transform: `scale(${1 + destaque * 0.04 - (1 - apaga) * 0.05})` }}>
    <Card x={90} y={y} w={900} h={280} ini={ini} fim={310} de="giro" style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '0 36px', outline: destaque ? `${destaque * 5}px solid ${P.el}` : undefined }}>
      <div style={{ position: 'relative', width: 170, height: 170, borderRadius: 28, overflow: 'hidden', flex: 'none', background: foto ? '#16120e' : P.linha, display: 'grid', placeItems: 'center' }}>
        {foto ? <Img src={staticFile('telas/demo_barbearia.png')} style={{ position: 'absolute', width: 530, left: -180, top: -98 }} /> : <Icone n="imagem" tam={64} cor={P.fg3} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 44, color: P.ink, letterSpacing: '-0.02em' }}>{nome}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: F, fontWeight: 700, fontSize: 32, color: P.fg2 }}>
          <span style={{ color: P.ink }}>{nota}</span><Estrelas n={foto ? 5 : 4} tam={28} /><span>({qtd})</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {tags.map(([t, bom], i) => <Etiqueta key={i} t={t} tam={24} fundo={bom ? (i === 0 ? '#DDF6EA' : P.lilas) : '#F1EEF4'} cor={bom ? (i === 0 ? P.ok : P.prof) : P.fg3} />)}
        </div>
      </div>
    </Card>
    </div>
  );
};

const Campo: React.FC<{ rotulo: string; valor: string; ini: number; cheio?: boolean }> = ({ rotulo, valor, ini, cheio = true }) => (
  <div style={{ flex: cheio ? 1 : 'none', border: `2px solid ${P.linha}`, borderRadius: 22, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontFamily: F, fontWeight: 700, fontSize: 22, color: P.fg3, letterSpacing: '0.04em' }}>{rotulo}</span>
    <span style={{ minHeight: 42 }}><Digita t={valor} ini={ini} vel={2} tam={36} peso={700} cursor={false} /></span>
  </div>
);

export const L1: React.FC = () => {
  const f = useCurrentFrame();
  // barra de busca: nasce pequena, cresce, sobe
  const bw = lerp(f, 90, 124, 140, 900);
  const by = chaves(f, [[192, 900], [214, 330]]);
  const bo = Math.min(lerp(f, 86, 96, 0, 1), saida(f, 318, 12));
  const conteudo = lerp(f, 108, 120, 0, 1);
  const rol = chaves(f, [[336, 0], [372, 0], [420, 980]]);
  return (
    <AbsoluteFill>
      <FundoRoxo />
      <Camera ks={[{ f: 0, x: 540, y: 960, s: 1.06 }, { f: 90, x: 540, y: 960, s: 1 }, { f: 250, x: 540, y: 960, s: 1 }, { f: 296, x: 540, y: 900, s: 1.05 }, { f: 312, x: 540, y: 960, s: 1 }]} borrar={false}>
        <div style={{ position: 'relative', width: 1080, height: 1920 }}>
          {/* 1 — gancho */}
          <div style={{ position: 'absolute', top: 760, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Letras t="Sábado, 9h12 da manhã." ini={4} tam={42} peso={600} cor="rgba(255,255,255,.75)" fim={92} />
          </div>
          <div style={{ position: 'absolute', top: 840, left: 70 }}>
            <Texto t={'Alguém perto de você\nprecisa de um *corte*.'} ini={20} tam={80} cor="#fff" acento={ROSA} largura={940} fim={94} />
          </div>

          {/* 2 — busca */}
          {bo > 0 && (
            <div style={{ position: 'absolute', left: 540 - bw / 2, top: by - 60, width: bw, height: 120, borderRadius: 999, background: '#fff', opacity: bo, boxShadow: '0 30px 70px -24px rgba(40,0,90,.6)', display: 'flex', alignItems: 'center', padding: '0 14px 0 40px', gap: 22, overflow: 'hidden' }}>
              <div style={{ opacity: conteudo, display: 'flex', alignItems: 'center', gap: 22, flex: 1, minWidth: 0 }}>
                <Icone n="busca" tam={44} cor={P.fg2} traco={2.2} />
                <Digita t={BUSCA} ini={112} vel={2} tam={40} peso={600} />
              </div>
              <div style={{ opacity: conteudo }}><Botao texto="Buscar" em={168} h={88} w={190} tam={32} /></div>
            </div>
          )}
          <Toque ks={[{ f: 146, x: 760, y: 1260 }, { f: 164, x: 850, y: 900 }]} toques={[168]} ini={146} fim={182} claro />

          {/* 3 — resultados */}
          <Resultado y={500} ini={206} nome="Barbearia do Centro" nota="3,9" qtd="11" tags={[['Sem site', false], ['Fecha 18h', false]]} foco={268} />
          <Resultado y={810} ini={214} nome="Navalha 13" nota="4,8" qtd="412" tags={[['Aberto agora', true], ['Site', true], ['Agenda', true]]} foto foco={268} />
          <Resultado y={1120} ini={222} nome="Corte Fino" nota="4,0" qtd="7" tags={[['Sem fotos', false]]} foco={268} />
          <Toque ks={[{ f: 272, x: 820, y: 1420 }, { f: 294, x: 560, y: 950 }]} toques={[300]} ini={272} fim={312} claro />
          <div style={{ position: 'absolute', top: 1450, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Texto t="Ele escolhe em *3 segundos*." ini={236} tam={58} cor="#fff" acento={ROSA} fim={312} />
          </div>

          {/* 4 — a página */}
          <div style={{ position: 'absolute', top: 200, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Texto t="Vê tudo *antes de chamar*." ini={330} tam={58} cor="#fff" acento={ROSA} fim={452} />
          </div>
          <Card x={130} y={330} w={820} h={1160} ini={310} fim={462} de="escala" raio={48} style={{ background: '#101a16' }}>
            <Img src={staticFile('telas/site_barbearia.png')} style={{ width: 820, position: 'absolute', left: 0, top: -rol * (820 / 700) }} />
            <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40 }}>
              <Surge ini={378} dy={60}>
                <Botao texto="Agendar pelo WhatsApp" em={432} h={110} tam={38} cor="#1DAA61" icone={<Icone n="whats" tam={44} cor="#fff" traco={2} />} />
              </Surge>
            </div>
          </Card>
          <Toque ks={[{ f: 404, x: 820, y: 1700 }, { f: 426, x: 560, y: 1395 }]} toques={[432]} ini={404} fim={446} claro />

          {/* 5 — agenda */}
          <div style={{ position: 'absolute', top: 380, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Texto t="E marca *sozinho*." ini={466} tam={64} cor="#fff" acento={ROSA} fim={572} />
          </div>
          <Card x={110} y={560} w={860} ini={458} fim={574} de="giro" raio={44} style={{ padding: 44, display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 150, height: 150, borderRadius: 30, overflow: 'hidden', background: '#16120e', flex: 'none' }}>
                <Img src={staticFile('telas/demo_barbearia.png')} style={{ position: 'absolute', width: 468, left: -159, top: -87 }} />
              </div>
              <div>
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 46, color: P.ink }}>Corte + barba</div>
                <div style={{ fontFamily: F, fontWeight: 600, fontSize: 32, color: P.fg2, marginTop: 6 }}>Navalha 13 · 50 min</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18 }}>
              <Campo rotulo="DIA" valor="Sáb, 14/11" ini={476} />
              <Campo rotulo="HORÁRIO" valor="10:30" ini={494} />
            </div>
            <Campo rotulo="NOME" valor="Rafael" ini={512} cheio={false} />
            <Botao texto="Confirmar horário" feito="Confirmado" em={548} h={112} tam={40} />
          </Card>
          <Toque ks={[{ f: 524, x: 840, y: 1560 }, { f: 542, x: 560, y: 1255 }]} toques={[548]} ini={524} fim={562} claro />

          {/* 6 — sucesso */}
          <div style={{ position: 'absolute', top: 700, left: 455 }}><Check ini={576} tam={170} cor="#fff" fim={646} /></div>
          <svg style={{ position: 'absolute', left: 455, top: 700, width: 170, height: 170, opacity: f >= 582 && f < 646 ? 1 : 0 }} viewBox="0 0 100 100">
            <path d="M29 52 L44 66 L72 36" fill="none" stroke={P.el} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - lerp(f, 582, 596, 0, 1))} />
          </svg>
          <div style={{ position: 'absolute', top: 920, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Texto t="Horário confirmado" ini={586} tam={66} cor="#fff" fim={646} />
          </div>
          <div style={{ position: 'absolute', top: 1012, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Texto t="Sáb, 14/11 · 10:30 · Navalha 13" ini={594} tam={36} peso={600} cor="rgba(255,255,255,.75)" fim={646} passo={2} />
          </div>

          {/* 7 — proposta */}
          <div style={{ position: 'absolute', top: 700, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <Texto t={'A gente monta esse caminho\npara o *seu* negócio.'} ini={650} tam={74} cor="#fff" acento={ROSA} fim={724} />
          </div>
          <div style={{ position: 'absolute', top: 930, width: 1080, display: 'flex', justifyContent: 'center', gap: 16 }}>
            {[['Google', 'pino'], ['Página', 'pagina'], ['Agenda', 'agenda']].map(([t, ic], i) => (
              <Surge key={t} ini={668 + i * 5} fim={724} dy={40}><Etiqueta t={t} icone={ic} tam={34} fundo="rgba(255,255,255,.18)" cor="#fff" style={{ border: '2px solid rgba(255,255,255,.35)' }} /></Surge>
            ))}
          </div>
        </div>
      </Camera>
      {f >= 720 && <Fecho ini={726} frase="Do Google ao horário marcado." claro={false} />}
    </AbsoluteFill>
  );
};
