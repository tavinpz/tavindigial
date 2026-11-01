// P6 (claro → escuro → verde) — "Segue a Thata": texto que nasce do desfoque, cartão de perfil, botão Seguir que vira pílula,
// e a cor varrendo a tela no fim. Referência: vinheta de perfil (texto desfocado, cartão, follow, wipe de cor).
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Toque, Icone, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_P6 = 420;

// palavra que nasce do desfoque (com acento opcional)
const Palavras: React.FC<{ t: string; ini: number; fim: number; tam?: number; acento?: string[] }> = ({ t, ini, fim, tam = 74, acento = [] }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: tam * 0.24, maxWidth: 900, fontFamily: G, fontWeight: 600, fontSize: tam, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
      {t.split(' ').map((w, i) => {
        const p = lerp(f, ini + i * 5, ini + i * 5 + 16, 0, 1);
        const q = lerp(f, fim - 10, fim, 1, 0);
        const o = Math.min(p, q);
        return <span key={i} style={{ opacity: o, filter: `blur(${(1 - o) * 18}px)`, transform: `translateY(${(1 - p) * 20}px)`, color: acento.includes(w) ? C.verde : '#0B1411' }}>{w}</span>;
      })}
    </div>
  );
};

export const P6: React.FC = () => {
  usaTema('claro');
  const f = useCurrentFrame();
  const cartao = mola(f, 150, { damping: 15, stiffness: 120, mass: 0.9 });
  const zoom = chaves(f, [[150, 0.6], [190, 1], [250, 1], [280, 1.35]], Easing.bezier(0.65, 0, 0.35, 1));
  const seguiu = f >= 262;
  const pilula = lerp(f, 290, 316, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const wipe = lerp(f, 330, 356, 0, 1, Easing.bezier(0.7, 0, 0.3, 1));
  const escuro = lerp(f, 286, 300, 0, 1);
  return (
    <AbsoluteFill style={{ background: '#E9ECEA' }}>
      <AbsoluteFill style={{ background: '#0B1411', opacity: escuro }} />
      {/* 1. frase que nasce do desfoque */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {f < 76 && <Palavras t="Uma recepção" ini={4} fim={76} tam={90} acento={['recepção']} />}
        {f >= 70 && f < 150 && <Palavras t="que atende, liga e agenda sozinha" ini={72} fim={150} tam={82} acento={['sozinha']} />}
      </AbsoluteFill>

      {/* 2. o cartão de perfil */}
      {f >= 146 && (
        <div style={{ position: 'absolute', left: 540, top: 900, transform: `translate(-50%, -50%) scale(${zoom * (0.7 + 0.3 * cartao)})`, opacity: Math.min(1, cartao * 2) * (1 - pilula) }}>
          <div style={{ width: 760, padding: '48px 48px 44px', borderRadius: 44, background: '#101C18', boxShadow: '0 60px 120px -40px rgba(0,0,0,.7)' }}>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 40, color: '#EEF4F1', letterSpacing: '-0.02em' }}>thata.ia</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 30 }}>
              <div style={{ width: 150, height: 150, borderRadius: 99, background: 'radial-gradient(circle at 35% 30%, #5FE3A1, #15A763 60%, #0B7A47)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 6px rgba(27,195,113,.25)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 99, background: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: 34 }}>
                {[['fone', 'ligação'], ['chat', 'WhatsApp'], ['agenda', 'agenda']].map(([n, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}><div style={{ width: 70, height: 70, margin: '0 auto', borderRadius: 22, background: '#1E2E28', display: 'grid', placeItems: 'center' }}><Icone n={n} tam={36} cor="#5FE3A1" traco={2.2} /></div><div style={{ fontFamily: G, fontWeight: 500, fontSize: 24, color: '#8FA29A', marginTop: 8 }}>{l}</div></div>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: '#EEF4F1', marginTop: 26 }}>Thata · IA para clínicas</div>
            <div style={{ fontFamily: G, fontWeight: 500, fontSize: 28, color: '#CBD8D2', marginTop: 6, lineHeight: 1.35 }}>Atende ligação e WhatsApp, agenda e confirma.<br />Recepção que não fecha.</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 30 }}>
              <div style={{ flex: 1, height: 74, borderRadius: 18, background: seguiu ? '#26333D' : '#1BC371', color: seguiu ? '#EEF4F1' : '#06100C', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 30, transform: `scale(${f > 256 && f < 266 ? 0.94 : 1})` }}>{seguiu ? 'Seguindo' : 'Seguir'}</div>
              <div style={{ flex: 1, height: 74, borderRadius: 18, background: '#26333D', color: '#EEF4F1', display: 'grid', placeItems: 'center', fontFamily: G, fontWeight: 600, fontSize: 30 }}>Mensagem</div>
            </div>
          </div>
        </div>
      )}
      <Toque ks={[{ f: 226, x: 900, y: 1500 }, { f: 252, x: 360, y: 1170 }]} toques={[258]} ini={226} fim={276} />

      {/* 3. vira pílula com avatar */}
      {f >= 288 && (
        <div style={{ position: 'absolute', left: 540, top: 900, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * pilula})`, opacity: Math.min(1, pilula * 2) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '18px 42px 18px 18px', borderRadius: 99, background: '#1BC371', boxShadow: '0 30px 60px -20px rgba(27,195,113,.6)' }}>
            <div style={{ width: 96, height: 96, borderRadius: 99, background: '#0B1411', display: 'grid', placeItems: 'center' }}><div style={{ width: 30, height: 30, borderRadius: 99, background: '#5FE3A1' }} /></div>
            <span style={{ fontFamily: G, fontWeight: 600, fontSize: 52, color: '#06100C', letterSpacing: '-0.03em' }}>@thata.ia</span>
          </div>
        </div>
      )}

      {/* 4. a cor varre a tela */}
      {f >= 330 && (
        <AbsoluteFill style={{ background: '#1BC371', clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
          <div style={{ fontFamily: G, fontWeight: 600, fontSize: 104, letterSpacing: '-0.05em', color: '#06100C', opacity: lerp(f, 352, 364, 0, 1), transform: `scale(${0.9 + 0.1 * mola(f, 352)})` }}>@thata.ia</div>
          <div style={{ fontFamily: G, fontWeight: 500, fontSize: 40, color: '#0B4D2E', opacity: lerp(f, 364, 376, 0, 1) }}>Segue pra ver a recepção do futuro.</div>
          <div style={{ fontFamily: M, fontSize: 32, color: '#0B4D2E', opacity: lerp(f, 372, 384, 0, 1), marginTop: 20 }}>thata.online</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
