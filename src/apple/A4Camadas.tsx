// A4 — "Cada detalhe" (celular gira, vira vista explodida em camadas e volta; só música)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, Easing } from 'remotion';
import { P, F, FundoLuz, Texto, Icone, Estrelas, Toque, Fecho, lerp, chaves } from '../leve/kit';
import { Centro, Reflexo } from './kitA';

export const DUR_A4 = 440;
const W = 500, H = 1040, R = 74;
const ROSA = '#F3C3E8';

// cada camada é um plano do tamanho da tela; "rot" = rótulo que aparece na vista explodida
const Camada: React.FC<{ z: number; children?: React.ReactNode; rot?: string; ry?: number; rotIni?: number; rotFim?: number; fundo?: string; ex?: number }> = ({ z, children, rot, ry = 500, rotIni = 0, rotFim = 0, fundo, ex = 0 }) => {
  const f = useCurrentFrame();
  const o = Math.min(lerp(f, rotIni, rotIni + 12, 0, 1), lerp(f, rotFim - 10, rotFim, 1, 0));
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, borderRadius: R, transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d', background: fundo ?? `rgba(58,14,78,${0.62 * ex})`, boxShadow: fundo ? undefined : `inset 0 0 0 ${3 * ex}px rgba(254,168,255,${0.7 * ex})` }}>
      {children}
      {false && rot && o > 0 && (
        <div style={{ position: 'absolute', left: W - 20, top: ry, display: 'flex', alignItems: 'center', opacity: o }}>
          <div style={{ width: 150 * o, height: 3, background: P.el }} />
          <div style={{ width: 16, height: 16, borderRadius: 9, background: P.el, marginLeft: -4 }} />
          <div style={{ marginLeft: 14, padding: '12px 22px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 30px -10px rgba(76,22,120,.4)', fontFamily: F, fontWeight: 800, fontSize: 34, color: P.ink, whiteSpace: 'nowrap' }}>{rot}</div>
        </div>
      )}
    </div>
  );
};

const rad = (d: number) => (d * Math.PI) / 180;
function projeta(x: number, y: number, z: number, rx: number, ry: number, rz: number, sc: number, ty: number) {
  let [a, b, c] = [x - W / 2, y - H / 2, z];
  [a, b] = [a * Math.cos(rad(rz)) - b * Math.sin(rad(rz)), a * Math.sin(rad(rz)) + b * Math.cos(rad(rz))];
  [a, c] = [a * Math.cos(rad(ry)) + c * Math.sin(rad(ry)), -a * Math.sin(rad(ry)) + c * Math.cos(rad(ry))];
  [b, c] = [b * Math.cos(rad(rx)) - c * Math.sin(rad(rx)), b * Math.sin(rad(rx)) + c * Math.cos(rad(rx))];
  a *= sc; b *= sc; c *= sc;
  const k = 2600 / (2600 - c);
  return { x: 540 + a * k, y: 1010 + b * k + ty };
}
const ROTULOS: [string, number, number, number][] = [ // texto, y na tela do celular, camada, início
  ['Fotos e identidade', 980, 0, 186], ['Sua marca', 190, 1, 192], ['Prova social', 445, 2, 198], ['Serviços claros', 640, 3, 204], ['Botão que agenda', 930, 4, 210],
];

export const A4: React.FC = () => {
  const f = useCurrentFrame();
  const e = Easing.bezier(0.65, 0, 0.25, 1);
  const ry = chaves(f, [[0, -200], [56, -14], [120, -10], [150, 0], [262, 0], [296, -6]], e);
  const rx = chaves(f, [[0, 14], [56, 6], [120, 4], [150, 58], [262, 58], [296, 0]], e);
  const rz = chaves(f, [[120, 0], [150, -38], [262, -38], [296, 0]], e);
  const sc = chaves(f, [[0, 0.55], [56, 1], [120, 1], [150, 0.66], [262, 0.66], [296, 1]], e);
  const ex = chaves(f, [[150, 0], [186, 1], [246, 1], [270, 0]], e); // explosão
  const D = 230 * ex;
  const desce = ex * 300;
  const ok = f >= 330;
  const aperta = f >= 322 && f < 332 ? 0.93 : 1;
  const sai = lerp(f, 352, 372, 0, 1, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill>
      <FundoLuz base="#F6F4F8" a="rgba(254,168,255,.32)" b="rgba(182,0,246,.10)" />
      <Centro y={140}><Texto t="Cada detalhe" ini={60} tam={96} peso={800} fim={150} tracking={-0.045} /></Centro>
      <Centro y={140}><Texto t={'pensado pra\n*virar cliente*.'} ini={160} tam={96} peso={800} fim={300} tracking={-0.045} /></Centro>
      <Centro y={150}><Texto t={'Um toque.\n*Horário marcado.*'} ini={304} tam={96} peso={800} fim={366} tracking={-0.045} /></Centro>
      <div style={{ position: 'absolute', left: 540 - W / 2, top: 1010 - H / 2, width: W, height: H, perspective: 2600, opacity: 1 - sai }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateY(${sai * 300 + desce}px) scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
          {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ position: 'absolute', inset: -14, borderRadius: R + 12, background: i === 0 ? '#1b1a1f' : '#3a3640', transform: `translateZ(${-26 + i * 2.6}px)`, boxShadow: i === 0 ? '0 90px 120px -40px rgba(60,20,90,.45)' : undefined }} />)}
          <div style={{ position: 'absolute', inset: -14, borderRadius: R + 12, background: '#0f0e12', transform: 'translateZ(0px)' }} />
          <Camada z={1} fundo="linear-gradient(170deg, #2A0F33 0%, #5B1E5E 55%, #8C3A80 100%)" rot="Fotos e identidade" ry={120} rotIni={186} rotFim={250}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: R, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 520, height: 520, left: -120, top: -60, borderRadius: 999, background: 'radial-gradient(circle, rgba(254,168,255,.45), transparent 65%)' }} />
            </div>
          </Camada>
          <Camada z={1 + D} rot="Sua marca" ex={ex} ry={210} rotIni={192} rotFim={252}>
            <div style={{ position: 'absolute', top: 120, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 130, height: 130, borderRadius: 999, border: `5px solid ${ROSA}`, display: 'grid', placeItems: 'center', fontFamily: 'Raleway', fontWeight: 600, fontSize: 52, color: ROSA }}>SA</div>
              <div style={{ fontFamily: 'Raleway', fontWeight: 600, fontSize: 56, color: '#fff', letterSpacing: '0.02em' }}>Studio Aurora</div>
              <div style={{ fontFamily: F, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,.75)' }}>Pele, contorno e bem-estar</div>
            </div>
          </Camada>
          <Camada z={1 + D * 2} rot="Prova social" ex={ex} ry={430} rotIni={198} rotFim={254}>
            <div style={{ position: 'absolute', top: 415, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 999, background: 'rgba(255,255,255,.14)', border: '1.5px solid rgba(255,255,255,.25)', fontFamily: F, fontWeight: 800, fontSize: 28, color: '#fff' }}>4,9 <Estrelas tam={26} /> <span style={{ fontWeight: 600, opacity: 0.8 }}>231</span></div>
            </div>
          </Camada>
          <Camada z={1 + D * 3} rot="Serviços claros" ex={ex} ry={600} rotIni={204} rotFim={256}>
            {['Limpeza de pele', 'Drenagem', 'Peeling'].map((t, i) => (
              <div key={t} style={{ position: 'absolute', left: 28, right: 28, top: 520 + i * 112, height: 96, borderRadius: 24, background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', fontFamily: F, color: '#fff' }}>
                <Icone n="coracao" tam={32} cor={ROSA} traco={2.2} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 28 }}>{t}</div><div style={{ fontWeight: 500, fontSize: 21, opacity: 0.7 }}>{['60 min', '50 min', '40 min'][i]}</div></div>
                <Icone n="seta" tam={28} cor="rgba(255,255,255,.6)" traco={2.2} />
              </div>
            ))}
          </Camada>
          <Camada z={1 + D * 4} rot="Botão que agenda" ex={ex} ry={900} rotIni={210} rotFim={258}>
            <div style={{ position: 'absolute', left: 28, right: 28, top: 880, height: 104, borderRadius: 999, background: ok ? P.ok : ROSA, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: F, fontWeight: 800, fontSize: 32, color: ok ? '#fff' : '#3A1236', transform: `scale(${aperta})`, boxShadow: '0 16px 30px -12px rgba(0,0,0,.4)' }}>
              <Icone n={ok ? 'agenda' : 'whats'} tam={38} cor={ok ? '#fff' : '#3A1236'} traco={2.2} />{ok ? 'Agendado · sáb 10:30' : 'Agendar no WhatsApp'}
            </div>
          </Camada>
          <div style={{ position: 'absolute', inset: 0, borderRadius: R, overflow: 'hidden', transform: `translateZ(${2 + D * 5}px)`, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.12)' }}>
            <div style={{ position: 'absolute', top: 18, left: W / 2 - 70, width: 140, height: 40, borderRadius: 99, background: '#000', opacity: 1 - ex }} />
            <Reflexo ini={60} dur={36} />
            <Reflexo ini={300} dur={26} />
          </div>
        </div>
      </div>
      {ROTULOS.map(([t, yy, k, ini], i) => {
        const a = projeta(k === 4 ? W - 40 : 30, yy, 1 + D * k, rx, ry, rz, sc, desce);
        const o = Math.min(lerp(f, ini, ini + 12, 0, 1), lerp(f, 250, 262, 1, 0));
        if (o <= 0) return null;
        const lx = 50, ly = [1180, 860, 700, 540, 380][i];
        return (
          <React.Fragment key={t}>
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
              <path d={`M${lx + 300} ${ly + 30} L${a.x} ${a.y}`} stroke={P.el} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={`${o} 1`} />
              <circle cx={a.x} cy={a.y} r={10} fill={P.el} stroke="#fff" strokeWidth={4} />
            </svg>
            <div style={{ position: 'absolute', left: lx, top: ly, width: 300, display: 'flex', justifyContent: 'flex-end', opacity: o, transform: `translateX(${(1 - o) * -30}px)` }}>
              <div style={{ padding: '12px 22px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 30px -10px rgba(76,22,120,.4)', fontFamily: F, fontWeight: 800, fontSize: 32, color: P.ink, whiteSpace: 'nowrap' }}>{t}</div>
            </div>
          </React.Fragment>
        );
      })}
      <Toque ks={[{ f: 300, x: 820, y: 1620 }, { f: 318, x: 560, y: 1430 }]} toques={[324]} ini={300} fim={340} />
      {f >= 362 && <Fecho ini={368} frase="Páginas pensadas em cada detalhe." />}
    </AbsoluteFill>
  );
};
