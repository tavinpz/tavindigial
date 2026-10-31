// A5 — "Identidade visual" (formas líquidas que se fundem → logo → cores → tipografia → identidade; só música)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, Easing } from 'remotion';
import { P, F, FD, Texto, Esfera, Fecho, lerp, chaves, mola, molaViva, saida } from '../leve/kit';
import { Centro } from './kitA';

export const DUR_A5 = 520;
const BG = '#F1ECF5';

// gotas que orbitam e se fundem (filtro "goo" + luz especular)
const Gotas: React.FC = () => {
  const f = useCurrentFrame();
  const junta = lerp(f, 56, 96, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const o = 1 - lerp(f, 104, 116, 0, 1);
  if (o <= 0) return null;
  const base = [
    { a: 0, d: 300, r: 150 }, { a: 2.1, d: 330, r: 120 }, { a: 4.2, d: 290, r: 170 }, { a: 1.1, d: 360, r: 90 }, { a: 3.3, d: 380, r: 100 },
  ];
  const cs = base.map((b, i) => {
    const ang = b.a + f / (40 + i * 6);
    const d = b.d * (1 - junta) + 40 * junta;
    const x = 540 + Math.cos(ang) * d, y = 1000 + Math.sin(ang) * d * 0.9;
    const r = b.r * (1 - junta) + (150 + 30 * Math.sin(f / 7 + i * 1.7)) * junta;
    return { x, y, r };
  });
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <defs>
        <linearGradient id="gg" gradientUnits="userSpaceOnUse" x1="240" y1="700" x2="840" y2="1300">
          <stop offset="0" stopColor="#FEA8FF" /><stop offset=".45" stopColor="#B600F6" /><stop offset="1" stopColor="#5A0FCB" />
        </linearGradient>
        <filter id="goo" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="24" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 42 -19" result="g" />
          <feGaussianBlur in="g" stdDeviation="16" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="9" specularConstant="1.1" specularExponent="28" lightingColor="#ffffff" result="spec">
            <fePointLight x="380" y="620" z="520" />
          </feSpecularLighting>
          <feComposite in="spec" in2="g" operator="in" result="specIn" />
          <feComposite in="g" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0" />
        </filter>
      </defs>
      <g filter="url(#goo)">
        {cs.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="url(#gg)" />)}
      </g>
    </svg>
  );
};

const CORES = [
  { c: '#B600F6', e: 'roxo', n: 'Elétrico' }, { c: '#7B2CF0', e: 'vio', n: 'Violeta' }, { c: '#FEA8FF', e: 'rosa', n: 'Rosa' },
  { c: '#D9C3F7', e: 'lilas', n: 'Lilás' }, { c: '#18121C', e: 'noite', n: 'Noite' },
];

export const A5: React.FC = () => {
  const f = useCurrentFrame();
  // ícone (logo)
  const ic = mola(f, 98, 30, { damping: 13, stiffness: 120, mass: 0.9 });
  const raio = lerp(f, 104, 136, 50, 26, Easing.bezier(0.6, 0, 0.3, 1));
  const icSai = lerp(f, 176, 192, 0, 1, Easing.in(Easing.cubic));
  const icTam = 420 * (0.92 + 0.08 * ic) * (1 - icSai * 0.7);
  // paleta
  const pal = (i: number) => molaViva(f, 186 + i * 4);
  const chip = lerp(f, 214, 236, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const palSai = saida(f, 268, 12);
  // tipografia
  const peso = f < 296 ? 500 : f < 306 ? 600 : f < 316 ? 700 : 800;
  const tipoO = Math.min(lerp(f, 270, 286, 0, 1), saida(f, 356, 12));
  // quadro de identidade
  const q = (i: number) => mola(f, 362 + i * 5, 30, { damping: 16, stiffness: 120, mass: 0.9 });
  const qSai = saida(f, 446, 14);
  const Logo = ({ t = 80 }: { t?: number }) => <span style={{ fontFamily: FD, fontWeight: 600, fontSize: t, color: '#fff', letterSpacing: '0.02em' }}>SA</span>;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Gotas />
      {/* títulos */}
      <Centro y={300}><Texto t="Toda marca começa" ini={10} tam={84} peso={800} fim={56} tracking={-0.045} /></Centro>
      <Centro y={300}><Texto t="com uma *forma*." ini={58} tam={84} peso={800} fim={112} tracking={-0.045} /></Centro>
      <Centro y={300}><Texto t="Seu *logo*." ini={118} tam={96} peso={800} fim={182} tracking={-0.045} /></Centro>
      <Centro y={300}><Texto t="Suas *cores*." ini={190} tam={96} peso={800} fim={268} tracking={-0.045} /></Centro>
      <Centro y={300}><Texto t="Sua *tipografia*." ini={274} tam={96} peso={800} fim={356} tracking={-0.045} /></Centro>
      <Centro y={230}><Texto t="Sua *identidade*." ini={360} tam={96} peso={800} fim={446} tracking={-0.045} /></Centro>
      {/* ícone */}
      {f >= 98 && icSai < 1 && (
        <div style={{ position: 'absolute', left: 540 - icTam / 2, top: 1000 - icTam / 2, width: icTam, height: icTam, borderRadius: `${raio}%`, background: 'linear-gradient(145deg, #FEA8FF 0%, #B600F6 45%, #5A0FCB 100%)', boxShadow: 'inset -20px -30px 60px rgba(30,0,60,.35), inset 14px 18px 40px rgba(255,255,255,.35), 0 50px 90px -30px rgba(90,15,160,.55)', display: 'grid', placeItems: 'center', opacity: lerp(f, 98, 110, 0, 1) * (1 - icSai), transform: `rotate(${(1 - ic) * -12}deg)` }}>
          <div style={{ position: 'absolute', left: '14%', top: '8%', width: '40%', height: '22%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,.7), transparent)', transform: 'rotate(-25deg)' }} />
          <div style={{ opacity: lerp(f, 126, 142, 0, 1), filter: `blur(${(1 - lerp(f, 126, 142, 0, 1)) * 10}px)` }}><Logo t={icTam * 0.36} /></div>
        </div>
      )}
      {/* paleta: gotas → fichas */}
      {f >= 184 && palSai > 0 && CORES.map((c, i) => {
        const s = pal(i);
        const x0 = 540 + (i - 2) * 180;
        const w = 120 + chip * 30, h = 120 + chip * 230;
        return (
          <div key={i} style={{ position: 'absolute', left: x0 - w / 2, top: 1000 - h / 2 + Math.sin(f / 9 + i) * 8 * (1 - chip), opacity: palSai, transform: `scale(${s})` }}>
            {chip < 0.05
              ? <Esfera x={w / 2} y={h / 2} r={60} cor={c.e as any} />
              : <div style={{ width: w, height: h, borderRadius: 60 - chip * 30, background: c.c, boxShadow: `inset 0 ${-h * 0.1}px ${h * 0.2}px rgba(0,0,0,.18), inset 0 12px 24px rgba(255,255,255,.3), 0 30px 50px -24px ${c.c}` }} />}
            <div style={{ position: 'absolute', top: h + 24, width: w, textAlign: 'center', fontFamily: F, opacity: chip }}>
              <div style={{ fontWeight: 800, fontSize: 26, color: P.ink }}>{c.n}</div>
              <div style={{ fontWeight: 600, fontSize: 21, color: P.fg2 }}>{c.c}</div>
            </div>
          </div>
        );
      })}
      {/* tipografia */}
      {tipoO > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: tipoO, filter: tipoO < 0.98 ? `blur(${(1 - tipoO) * 12}px)` : undefined }}>
          <Centro y={640}><span style={{ fontFamily: F, fontWeight: peso, fontSize: 420, lineHeight: 1, letterSpacing: '-0.05em', background: 'linear-gradient(120deg, #FEA8FF, #B600F6 55%, #5A0FCB)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Aa</span></Centro>
          <Centro y={1120}><span style={{ fontFamily: F, fontWeight: 700, fontSize: 40, color: P.ink }}>Urbanist <span style={{ color: P.fg3 }}>· {peso}</span></span></Centro>
          <Centro y={1190}><span style={{ fontFamily: F, fontWeight: 600, fontSize: 34, color: P.fg2, letterSpacing: '0.06em' }}>ABCDEFGHIJ abcdefghij 0123456789</span></Centro>
        </div>
      )}
      {/* quadro de identidade */}
      {f >= 360 && qSai > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: qSai }}>
          {/* post */}
          <div style={{ position: 'absolute', left: 80, top: 420, width: 440, height: 440, borderRadius: 36, background: 'linear-gradient(150deg, #FEA8FF, #B600F6 55%, #5A0FCB)', transform: `translateY(${(1 - q(0)) * 200}px) rotate(${(1 - q(0)) * -10}deg)`, opacity: Math.min(1, q(0) * 1.4), boxShadow: '0 40px 70px -30px rgba(90,15,160,.6)', padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Logo t={70} />
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 52, color: '#fff', lineHeight: 1.02, letterSpacing: '-0.03em' }}>Pele que<br />respira.</div>
          </div>
          {/* story */}
          <div style={{ position: 'absolute', left: 560, top: 420, width: 440, height: 780, borderRadius: 36, background: '#18121C', transform: `translateY(${(1 - q(1)) * 260}px) rotate(${(1 - q(1)) * 10}deg)`, opacity: Math.min(1, q(1) * 1.4), boxShadow: '0 40px 70px -30px rgba(20,0,40,.7)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 600, height: 600, left: -80, top: 300, borderRadius: 999, background: 'radial-gradient(circle, rgba(182,0,246,.7), transparent 65%)' }} />
            <div style={{ position: 'absolute', left: 40, top: 50, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 70, height: 70, borderRadius: 20, background: 'linear-gradient(145deg,#FEA8FF,#B600F6)', display: 'grid', placeItems: 'center' }}><Logo t={28} /></div>
              <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 30, color: '#fff' }}>Studio Aurora</span>
            </div>
            <div style={{ position: 'absolute', left: 40, right: 40, bottom: 60, fontFamily: F, fontWeight: 800, fontSize: 58, color: '#fff', lineHeight: 1.02, letterSpacing: '-0.03em' }}>Agenda de<br /><span style={{ color: '#FEA8FF' }}>novembro</span><br />aberta.</div>
          </div>
          {/* cartão de visita */}
          <div style={{ position: 'absolute', left: 80, top: 900, width: 440, height: 260, borderRadius: 26, background: '#fff', transform: `translateY(${(1 - q(2)) * 200}px) rotate(${(1 - q(2)) * -6 - 3}deg)`, opacity: Math.min(1, q(2) * 1.4), boxShadow: '0 30px 60px -26px rgba(76,22,120,.45)', padding: 34 }}>
            <div style={{ width: 70, height: 70, borderRadius: 20, background: 'linear-gradient(145deg,#FEA8FF,#B600F6 50%,#5A0FCB)', display: 'grid', placeItems: 'center' }}><Logo t={28} /></div>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 34, color: P.ink, marginTop: 22 }}>Studio Aurora</div>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 22, color: P.fg2, marginTop: 4 }}>Moema · São Paulo</div>
          </div>
          {/* paleta mini */}
          <div style={{ position: 'absolute', left: 80, top: 1200, display: 'flex', gap: 12, opacity: Math.min(1, q(3) * 1.4), transform: `translateY(${(1 - q(3)) * 120}px)` }}>
            {CORES.map((c) => <div key={c.c} style={{ width: 76, height: 76, borderRadius: 22, background: c.c, boxShadow: '0 12px 24px -12px rgba(0,0,0,.4)' }} />)}
          </div>
        </div>
      )}
      {f >= 442 && <Fecho ini={448} frase="Identidade visual com a cara do seu negócio." />}
    </AbsoluteFill>
  );
};
