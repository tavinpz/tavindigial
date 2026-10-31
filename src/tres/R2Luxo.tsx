// R2 — "Anúncio de luxo" (3D real: produto premium; virada: é o Reels de uma barbearia de bairro)
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { P, F, FD, FundoRoxo, Texto, Icone, Fecho, lerp, molaViva } from '../leve/kit';
import { Cam, useTela, useFontesOk, rr, txt, cl } from './kit3';

export const DUR_R2 = 540;
export const VIRADA_R2 = 228;
const OURO = '#E8C47A';

const Pote: React.FC<{ f: number; ok: boolean }> = ({ f, ok }) => {
  const rot = useTela(2048, 512, (c) => {
    rr(c, 0, 0, 2048, 512, 0, '#0c0a0d');
    if (!ok) return;
    c.strokeStyle = 'rgba(232,196,122,.55)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(560, 120); c.lineTo(1488, 120); c.moveTo(560, 392); c.lineTo(1488, 392); c.stroke();
    (c as any).letterSpacing = '28px';
    txt(c, 'NAVALHA 13', 1024, 270, 120, 600, OURO, 'center', 'Raleway');
    (c as any).letterSpacing = '14px';
    txt(c, 'POMADA MATTE · 100 g', 1024, 350, 44, 600, 'rgba(232,196,122,.8)', 'center', 'Urbanist');
    (c as any).letterSpacing = '0px';
  }, [ok]);
  const tampa = cl(f, 168, 192, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1));
  const giro = f * 0.012 + 0.4;
  return (
    <group position={[0, 0.3, 0]} rotation={[0, giro, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.52, 128, 1]} />
        <meshPhysicalMaterial map={rot} color="#ffffff" roughness={0.38} metalness={0.1} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <group position={[0, 0.36 + tampa * 0.32, 0]} rotation={[tampa * 0.25, tampa * 0.6, tampa * -0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.53, 0.53, 0.2, 128]} />
          <meshPhysicalMaterial color="#d6a74f" metalness={1} roughness={0.2} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.36, 0.012, 16, 128]} />
          <meshStandardMaterial color="#f5dc9c" metalness={1} roughness={0.15} />
        </mesh>
      </group>
      {/* pomada dentro (aparece quando a tampa sobe) */}
      <mesh position={[0, 0.262, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.47, 96]} />
        <meshPhysicalMaterial color="#cbb9a4" roughness={0.9} />
      </mesh>
    </group>
  );
};

const Poeira: React.FC<{ f: number }> = ({ f }) => {
  const base = useMemo(() => {
    const r = () => Math.random();
    let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; void r;
    return Array.from({ length: 420 }, () => [rnd() * 6 - 3, rnd() * 3.2 - 0.6, rnd() * 5 - 3.2, rnd()]);
  }, []);
  const pos = useMemo(() => new Float32Array(base.length * 3), []);
  base.forEach(([x, y, z, k], i) => {
    pos[i * 3] = x + Math.sin(f / 50 + k * 9) * 0.08;
    pos[i * 3 + 1] = ((y + f * 0.0025 * (0.5 + k) + 0.6) % 3.2) - 0.6;
    pos[i * 3 + 2] = z;
  });
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} count={base.length} itemSize={3} needsUpdate /></bufferGeometry>
      <pointsMaterial color="#f3d38c" size={0.012} sizeAttenuation transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

const Cena: React.FC<{ f: number; ok: boolean }> = ({ f, ok }) => {
  const varre = cl(f, 0, 70, -4, 4) + cl(f, 140, 200, 0, 8);
  return (
    <>
      <color attach="background" args={['#060407']} />
      <fog attach="fog" args={['#060407', 5, 12]} />
      <ambientLight intensity={0.12} />
      <spotLight position={[-2, 4.2, 2.4]} angle={0.4} penumbra={0.9} intensity={90} color="#ffe2b0" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[1.6, 1.2, -1.4]} intensity={30} color="#b600f6" distance={8} />
      <rectAreaLight position={[2.2, 0.6, 0.8]} rotation={[0, Math.PI / 2.4, 0]} width={0.4} height={2.4} intensity={18} color="#fff3dc" />
      <pointLight position={[-1.8, 0.8, -1.2]} intensity={22} color="#f3c27a" distance={8} />
      {/* pedestal */}
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.95, 1.0, 0.3, 128]} />
        <meshPhysicalMaterial color="#141016" roughness={0.25} metalness={0.3} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.008, 12, 160]} />
        <meshStandardMaterial color="#e8c47a" metalness={1} roughness={0.2} emissive="#5a3b10" />
      </mesh>
      <mesh position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[8, 64]} /><meshStandardMaterial color="#09070a" roughness={0.6} /></mesh>
      {/* cone de luz */}
      <mesh position={[-0.55, 1.6, 0.5]} rotation={[0.25, 0, -0.45]}>
        <coneGeometry args={[0.9, 3.4, 64, 1, true]} />
        <meshBasicMaterial color="#ffdca0" transparent opacity={0.035} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Pote f={f} ok={ok} />
      <Poeira f={f} />
      <Environment resolution={256} frames={Infinity}>
        <Lightformer form="rect" intensity={10} color="#fff1d6" position={[varre, 2, 3]} scale={[1.2, 5, 1]} />
        <Lightformer form="rect" intensity={3} color="#fff1d6" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#b600f6" position={[4, 1, -2]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#f3c27a" position={[-4, 2, -1]} scale={2} />
      </Environment>
    </>
  );
};

const Luxo: React.FC<{ y: number; t: string; ini: number; fim: number; tam?: number; cor?: string; esp?: string }> = ({ y, t, ini, fim, tam = 40, cor = OURO, esp = '0.4em' }) => {
  const f = useCurrentFrame();
  const o = Math.min(lerp(f, ini, ini + 18, 0, 1), lerp(f, fim - 12, fim, 1, 0));
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: FD, fontWeight: 600, fontSize: tam, letterSpacing: esp, color: cor, opacity: o, filter: `blur(${(1 - o) * 8}px)`, paddingLeft: esp }}>{t}</div>;
};

const COMENT = [
  { f: 300, x: 40, y: 360, t: 'onde compra??', u: 'lucas.m' },
  { f: 318, x: 560, y: 520, t: 'parece propaganda de perfume kkkk', u: 'bia_rocha' },
  { f: 336, x: 60, y: 1180, t: 'vou passar aí sábado', u: 'dudu.cortes' },
  { f: 354, x: 520, y: 1330, t: 'quem fez esse vídeo?', u: 'ana.pinheiros' },
];

export const R2: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFontesOk();
  const ks = [
    { f: 0, p: [0.9, 0.95, 1.25], a: [0.35, 0.7, 0.25], fov: 24 },
    { f: 62, p: [1.9, 1.25, 3.0], a: [0, 0.4, 0], fov: 28 },
    { f: 140, p: [-2.5, 1.5, 3.4], a: [0, 0.38, 0], fov: 30 },
    { f: 200, p: [0, 1.05, 4.9], a: [0, 0.42, 0], fov: 30 },
    { f: VIRADA_R2 + 40, p: [0, 1.05, 5.1], a: [0, 0.42, 0], fov: 30 },
  ] as any;
  // virada: a imagem encolhe e vira o vídeo dentro de um celular
  const v = cl(f, VIRADA_R2, VIRADA_R2 + 30, 0, 1, Easing.bezier(0.7, 0, 0.2, 1));
  const W = 1080 - v * (1080 - 520), H = 1920 - v * (1920 - 1124);
  const x = (1080 - W) / 2, y = (1920 - H) / 2 + v * 40;
  const raio = v * 64;
  const tres = f < 472;
  const ui = cl(f, VIRADA_R2 + 22, VIRADA_R2 + 34, 0, 1);
  const curt = Math.round(cl(f, VIRADA_R2 + 30, VIRADA_R2 + 110, 120, 1248, Easing.out(Easing.cubic)));
  const sai = cl(f, 452, 470, 0, 1, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: '#060407' }}>
      {v > 0 && <AbsoluteFill style={{ opacity: v }}><FundoRoxo /></AbsoluteFill>}
      {/* moldura do celular */}
      {f < 472 && (
        <div style={{ position: 'absolute', left: x - v * 16, top: y - v * 16, width: W + v * 32, height: H + v * 32, borderRadius: raio + v * 14, background: v > 0 ? '#0d0b10' : 'transparent', boxShadow: v > 0 ? `0 0 0 ${v * 3}px #3a3640, 0 60px 120px -30px rgba(20,0,40,${0.7 * v})` : undefined, transform: `translateY(${sai * 1500}px) rotate(${v * -3 + sai * 8}deg)` }}>
          <div style={{ position: 'absolute', left: v * 16, top: v * 16, width: W, height: H, borderRadius: raio, overflow: 'hidden', background: '#060407' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `scale(${W / 1080}, ${H / 1920})` }}>
              {tres && ok && (
                <ThreeCanvas width={1080} height={1920} shadows camera={{ position: [0, 0.6, 2.4], fov: 30, near: 0.01, far: 40 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
                  <Cam f={f} ks={ks} tremor={0.004} />
                  <Cena f={f} ok={ok} />
                </ThreeCanvas>
              )}
              {/* textos do "comercial" */}
              <Luxo y={1500} t="FEITA À MÃO" ini={10} fim={64} />
              <Luxo y={1500} t="ACABAMENTO MATTE" ini={72} fim={136} />
              <Luxo y={1500} t="FIXAÇÃO DE 12 HORAS" ini={144} fim={196} />
              <Luxo y={220} t="NAVALHA 13" ini={196} fim={600} tam={92} cor={OURO} esp="0.32em" />
              <Luxo y={340} t="DISPONÍVEL AGORA" ini={206} fim={600} tam={34} cor="rgba(232,196,122,.75)" />
              {/* interface do Reels por cima (a virada) */}
              {ui > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: ui, fontFamily: F, color: '#fff' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 700, background: 'linear-gradient(transparent, rgba(0,0,0,.65))' }} />
                  <div style={{ position: 'absolute', top: 90, left: 60, fontWeight: 800, fontSize: 64 }}>Reels</div>
                  <div style={{ position: 'absolute', right: 50, bottom: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
                    {[['coracao', (curt / 1000).toFixed(1).replace('.', ',') + ' mil'], ['chat', '84'], ['seta', '211']].map(([n, t], i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ transform: `scale(${i === 0 ? 1 + 0.25 * Math.exp(-((f - (VIRADA_R2 + 44)) ** 2) / 40) : 1})` }}><Icone n={n} tam={96} cor={i === 0 && f > VIRADA_R2 + 44 ? '#ff3b6b' : '#fff'} traco={2} /></div>
                        <span style={{ fontWeight: 700, fontSize: 42 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ position: 'absolute', left: 60, bottom: 260, display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ width: 110, height: 110, borderRadius: 99, background: '#16120e', border: '4px solid #fff', display: 'grid', placeItems: 'center', color: OURO, fontFamily: FD, fontWeight: 700, fontSize: 40 }}>N1</div>
                    <span style={{ fontWeight: 800, fontSize: 52 }}>navalha13</span>
                    <span style={{ padding: '10px 26px', border: '3px solid #fff', borderRadius: 18, fontWeight: 700, fontSize: 38 }}>Seguir</span>
                  </div>
                  <div style={{ position: 'absolute', left: 60, right: 220, bottom: 150, fontWeight: 600, fontSize: 42, lineHeight: 1.3 }}>Pomada nova chegou. Corre que é pouca 🔥</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* comentários voando em volta */}
      {COMENT.map((c) => {
        const s = molaViva(f, c.f); const o = Math.min(1, s * 1.4) * (1 - sai);
        if (f < c.f) return null;
        return (
          <div key={c.u} style={{ position: 'absolute', left: c.x, top: c.y, maxWidth: 480, padding: '18px 24px', borderRadius: 28, background: '#fff', boxShadow: '0 20px 40px -16px rgba(40,0,80,.5)', fontFamily: F, opacity: o, transform: `scale(${s}) translateY(${Math.sin((f - c.f) / 20) * 6}px)`, zIndex: 5 }}>
            <div style={{ fontWeight: 800, fontSize: 24, color: P.fg2 }}>{c.u}</div>
            <div style={{ fontWeight: 700, fontSize: 32, color: P.ink }}>{c.t}</div>
          </div>
        );
      })}
      {/* textos da virada */}
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6 }}><Texto t="Parece marca de luxo?" ini={VIRADA_R2 + 34} tam={74} peso={800} cor="#fff" fim={VIRADA_R2 + 110} tracking={-0.04} /></div>
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6 }}><Texto t={'É uma barbearia\n*de bairro*.'} ini={VIRADA_R2 + 114} tam={80} peso={800} cor="#fff" acento="#FFD3FF" fim={452} tracking={-0.04} /></div>
      <div style={{ position: 'absolute', top: 1660, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6 }}><Texto t="Com vídeo de marca grande." ini={VIRADA_R2 + 130} tam={46} peso={700} cor="rgba(255,255,255,.9)" fim={452} /></div>
      <div style={{ position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6 }}><Texto t={'Imagina o que dá pra\nfazer com a *sua marca*.'} ini={462} tam={74} peso={800} cor="#fff" acento="#FFD3FF" fim={492} tracking={-0.04} /></div>
      {f >= 488 && <Fecho ini={494} frase="Vídeos em 3D e motion com cara de marca grande." claro={false} />}
    </AbsoluteFill>
  );
};
