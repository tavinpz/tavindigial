// N2 (escuro) — "Lead das 22:10": pediu orçamento no anúncio; a Thata liga em 41 segundos e marca; recua: as outras 3 clínicas nem responderam.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Titulo, Fone, Onda, Toque, Check, Fecho, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_N2 = 580;
const W = 600;

const Campo: React.FC<{ r: string; v: string; ini: number }> = ({ r, v, ini }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(v.length, Math.floor((f - ini) / 1.5)));
  return (
    <div style={{ border: `1.5px solid ${C.linha2}`, borderRadius: 18, padding: '14px 18px' }}>
      <div style={{ fontFamily: M, fontSize: 18, color: C.fg3 }}>{r}</div>
      <div style={{ fontFamily: G, fontWeight: 500, fontSize: 30, color: C.ink, minHeight: 38 }}>{v.slice(0, n)}</div>
    </div>
  );
};

const Fala: React.FC<{ t: string; ini: number; th?: boolean; fim?: number }> = ({ t, ini, th, fim }) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const n = Math.min(t.length, Math.floor((f - ini) * 1.8));
  return (
    <div style={{ opacity: saida(f, fim, 8), textAlign: th ? 'left' : 'right' }}>
      <div style={{ fontFamily: M, fontSize: 18, color: th ? C.luz : C.fg3 }}>{th ? '● Thata · IA' : 'Roberto'}</div>
      <div style={{ fontFamily: G, fontWeight: 500, fontSize: 27, lineHeight: 1.3, color: th ? C.ink : C.fg2 }}>{t.slice(0, n)}</div>
    </div>
  );
};

const Outra: React.FC<{ x: number; y: number; nome: string; st: string; ini: number }> = ({ x, y, nome, st, ini }) => {
  const f = useCurrentFrame();
  const s = mola(f, ini);
  return (
    <div style={{ position: 'absolute', left: x - 240, top: y, width: 480, padding: '40px 36px', borderRadius: 40, background: C.papel, border: `1.5px solid ${C.linha2}`, opacity: Math.min(1, s * 2) * 0.85, transform: `scale(${0.8 + 0.2 * s})` }}>
      <div style={{ fontFamily: G, fontWeight: 600, fontSize: 50, color: C.fg, letterSpacing: '-0.03em' }}>{nome}</div>
      <div style={{ fontFamily: M, fontSize: 30, color: C.fg3, marginTop: 8 }}>formulário recebido</div>
      <div style={{ marginTop: 22, padding: '16px 22px', borderRadius: 20, background: 'rgba(229,72,77,.12)', fontFamily: G, fontWeight: 600, fontSize: 38, color: C.alerta }}>{st}</div>
    </div>
  );
};

export const N2: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const z = chaves(f, [[0, 1], [290, 1], [340, 0.56], [460, 0.56]], Easing.bezier(0.65, 0, 0.35, 1));
  const cron = Math.max(0, Math.min(41, (f - 84) / 30 * (41 / 3.4)));
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [300, 960]])} />
      <AbsoluteFill style={{ transform: `scale(${z})`, opacity: saida(f, 470, 12) }}>
        {/* as outras clínicas (aparecem no recuo) */}
        {f >= 300 && <>
          <Outra x={-160} y={420} nome="Clínica Bem Estar" st="sem retorno" ini={306} />
          <Outra x={1240} y={420} nome="Sorriso Center" st="retorna em horário comercial" ini={314} />
          <Outra x={-160} y={1150} nome="Odonto Prime" st="visualizado" ini={322} />
          <Outra x={1240} y={1150} nome="Clínica Vida" st="sem retorno" ini={330} />
        </>}
        {/* o formulário do anúncio */}
        <div style={{ position: 'absolute', left: 540 - 380, top: 520, width: 760, padding: '44px 40px', borderRadius: 44, background: C.papel, border: `1.5px solid ${C.linha2}`, opacity: Math.min(mola(f, 0) * 2, saida(f, 96, 12)), transform: `translateY(${(1 - mola(f, 0)) * 200}px) scale(${1 - lerp(f, 84, 100, 0, 0.2)})` }}>
          <div style={{ fontFamily: M, fontSize: 22, color: C.fg3 }}>anúncio · patrocinado</div>
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 48, letterSpacing: '-0.04em', color: C.ink, marginTop: 8 }}>Avaliação de implante</div>
          <div style={{ fontFamily: G, fontWeight: 500, fontSize: 28, color: C.fg2, marginTop: 6 }}>Deixe seu contato e a gente te liga.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
            <Campo r="nome" v="Roberto Lima" ini={14} />
            <Campo r="WhatsApp" v="(11) 9 8123-4567" ini={34} />
          </div>
          <div style={{ marginTop: 24, height: 90, borderRadius: 99, background: f > 72 ? C.verde : C.ink, color: f > 72 ? '#06100C' : C.sobreInk, display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 34, transform: `scale(${f > 66 && f < 76 ? 0.94 : 1})` }}>{f > 72 ? 'Enviado' : 'Quero receber a ligação'}</div>
        </div>
        <Toque ks={[{ f: 50, x: 820, y: 1500 }, { f: 66, x: 560, y: 1150 }]} toques={[70]} ini={50} fim={84} />

        {/* a ligação */}
        <div style={{ position: 'absolute', left: 540 - W / 2, top: 330, transform: `translateY(${(1 - mola(f, 92, { damping: 17, stiffness: 110, mass: 1 })) * 1900}px)` }}>
          <Fone w={W}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 0%, #12301F, #08110E 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 140 }}>
              <div style={{ fontFamily: M, fontSize: 24, color: C.fg2 }}>{f < 122 ? 'chamada recebida' : 'em ligação'}</div>
              <div style={{ fontFamily: G, fontWeight: 600, fontSize: 50, letterSpacing: '-0.04em', color: C.ink, marginTop: 14 }}>Clínica Aurora</div>
              <div style={{ marginTop: 30 }}><Onda w={420} h={100} n={28} nivel={f < 122 ? 0.15 : 0.9} cor={C.luz} /></div>
              <div style={{ position: 'absolute', left: 34, right: 34, bottom: 46, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Fala th t="Oi, Roberto! Aqui é a Thata, assistente virtual da Clínica Aurora. Vi seu pedido sobre implante: posso marcar sua avaliação?" ini={126} fim={232} />
                <Fala t="Pode sim! Sábado de manhã dá?" ini={196} />
                <Fala th t="Dá! Sábado, 9h, marcado." ini={232} />
              </div>
            </div>
          </Fone>
          <div style={{ position: 'absolute', left: 0, right: 0, top: -90, display: 'flex', justifyContent: 'center', opacity: lerp(f, 96, 108, 0, 1) }}>
            <div style={{ padding: '14px 26px', borderRadius: 99, background: C.ink, color: C.sobreInk, fontFamily: M, fontSize: 30 }}>formulário → ligação · 00:{String(Math.floor(cron)).padStart(2, '0')}</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <Check ini={262} tam={70} />
            {f >= 266 && <div style={{ fontFamily: G, fontWeight: 600, fontSize: 40, color: C.ink, transform: `scale(${molaViva(f, 266)})` }}>Avaliação marcada</div>}
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: 'absolute', top: 150, left: 0, right: 0 }}>
        <Titulo t={'22:10. Ele pede orçamento\npelo *anúncio.*'} ini={4} fim={92} tam={68} />
      </div>
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0 }}>
        <Titulo t="Em 41 segundos, *o telefone toca.*" ini={104} fim={290} tam={58} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'Ele pediu orçamento\nem *5 clínicas.*'} ini={302} fim={384} tam={72} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0 }}>
        <Titulo t={'Só uma ligou\n*na hora.*'} ini={388} fim={470} tam={80} />
      </div>
      {f >= 466 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 466, 478, 0, 1) }}><Fecho ini={472} frase={'Quem liga primeiro,\n*marca primeiro.*'} /></div>}
    </AbsoluteFill>
  );
};
