// R3 — "Loop" (3D real: bairro visto de cima → desce até a barbearia → entra pela vitrine → mergulha no celular
// cuja tela mostra o mesmo bairro: o fim emenda no começo)
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { RoundedBox, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { F, Texto, Marca } from '../leve/kit';
import { Cam, useTela, useTex, useFontesOk, rr, txt, cl, lin } from './kit3';

export const DUR_R3 = 600;
const ROSA = '#FFD3FF';
// tela do celular: 9:16 exato, para o último quadro ser igual ao primeiro
const TW = 0.072, TH = TW * 16 / 9;
const FONE = { x: 0.32, y: 1.032, z: -1.25 };

function rnd(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

const Cidade: React.FC<{ f: number }> = ({ f }) => {
  const r = useMemo(() => rnd(11), []);
  const predios = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number; h: number; c: string }[] = [];
    for (let i = -5; i <= 5; i++) for (let j = -7; j <= 5; j++) {
      const cx = i * 3.2, cz = j * 3.2;
      if (Math.abs(cx) < 2 && Math.abs(cz) < 2) continue; // quadra da barbearia
      for (let k = 0; k < 4; k++) {
        const w = 0.8 + r() * 0.5, d = 0.8 + r() * 0.5;
        out.push({ x: cx + (k % 2 ? 0.65 : -0.65), z: cz + (k > 1 ? 0.65 : -0.65), w, d, h: 0.8 + r() * r() * 5, c: ['#2a2236', '#30283e', '#241e2e', '#382d48'][Math.floor(r() * 4)] });
      }
    }
    return out;
  }, []);
  const janelas = useTela(256, 512, (c) => {
    rr(c, 0, 0, 256, 512, 0, '#1b1624');
    const rr2 = rnd(5);
    for (let y = 12; y < 512; y += 28) for (let x = 14; x < 256; x += 30) {
      const on = rr2() > 0.55;
      c.fillStyle = on ? (rr2() > 0.5 ? '#ffd79a' : '#cfa8ff') : '#2a2335'; c.fillRect(x, y, 16, 14);
    }
  }, []);
  janelas.wrapS = janelas.wrapT = THREE.RepeatWrapping;
  const chao = useTela(1024, 1024, (c) => {
    rr(c, 0, 0, 1024, 1024, 0, '#120e18');
    c.fillStyle = '#231c2c';
    for (let i = 0; i < 1024; i += 128) { c.fillRect(i, 0, 22, 1024); c.fillRect(0, i, 1024, 22); }
    c.fillStyle = 'rgba(255,214,140,.25)';
    for (let i = 0; i < 1024; i += 128) for (let k = 0; k < 1024; k += 24) { c.fillRect(i + 10, k, 2, 10); c.fillRect(k, i + 10, 10, 2); }
  }, []);
  chao.wrapS = chao.wrapT = THREE.RepeatWrapping; chao.repeat.set(5, 5); chao.offset.set(0.5 - 2.25 / 40, 0.5 - 2.25 / 40);
  const pinos = useMemo(() => {
    const rr3 = rnd(3);
    return Array.from({ length: 14 }, (_, i) => ({ x: (rr3() - 0.5) * 26, z: (rr3() - 0.6) * 30, t: 20 + i * 5 })).filter((p) => Math.hypot(p.x, p.z) > 3);
  }, []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial map={chao} roughness={0.9} /></mesh>
      {predios.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, p.z]} castShadow receiveShadow>
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshStandardMaterial color={p.c} roughness={0.8} emissive="#ffffff" emissiveMap={janelas} emissiveIntensity={0.55} />
        </mesh>
      ))}
      {pinos.map((p, i) => {
        const s = cl(f, p.t, p.t + 10, 0, 1, Easing.out(Easing.back(2)));
        const apaga = cl(f, 110, 130, 1, 0.35);
        return (
          <group key={i} position={[p.x, 3.4, p.z]} scale={s * 0.9}>
            <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.38, 24, 24]} /><meshStandardMaterial color="#8d8399" emissive="#8d8399" emissiveIntensity={0.3 * apaga} transparent opacity={apaga} /></mesh>
            <mesh rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.28, 0.7, 24]} /><meshStandardMaterial color="#8d8399" transparent opacity={apaga} /></mesh>
          </group>
        );
      })}
    </>
  );
};

const Barbearia: React.FC<{ f: number; ok: boolean }> = ({ f, ok }) => {
  const placa = useTela(1024, 256, (c) => {
    rr(c, 0, 0, 1024, 256, 0, '#0e0b10');
    if (!ok) return;
    (c as any).letterSpacing = '30px';
    txt(c, 'NAVALHA 13', 527, 168, 120, 600, '#E8C47A', 'center', 'Raleway');
    (c as any).letterSpacing = '0px';
  }, [ok]);
  const listras = useTela(256, 256, (c) => {
    rr(c, 0, 0, 256, 256, 0, '#ffffff');
    c.save(); c.translate(0, 0);
    for (let i = -256; i < 512; i += 64) { c.fillStyle = '#c4243a'; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 24, 0); c.lineTo(i + 24 + 256, 256); c.lineTo(i + 256, 256); c.fill(); }
    for (let i = -224; i < 512; i += 64) { c.fillStyle = '#1f3c8c'; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 10, 0); c.lineTo(i + 10 + 256, 256); c.lineTo(i + 256, 256); c.fill(); }
    c.restore();
  }, []);
  listras.wrapS = listras.wrapT = THREE.RepeatWrapping; listras.repeat.set(1, 2); listras.offset.y = (f * 0.02) % 1;
  const pin = cl(f, 112, 128, 0, 1, Easing.out(Easing.back(2.2)));
  return (
    <group>
      {/* prédio oco: paredes, teto e fachada com vão da vitrine */}
      {[
        { p: [0, 3.15, -1.55], a: [2.4, 0.1, 1.6] },      // teto
        { p: [0, 1.6, -2.35], a: [2.4, 3.2, 0.05] },      // fundo
        { p: [-1.18, 1.6, -1.55], a: [0.05, 3.2, 1.6] },  // lado esq
        { p: [1.18, 1.6, -1.55], a: [0.05, 3.2, 1.6] },   // lado dir
        { p: [0, 2.6, -0.76], a: [2.4, 1.2, 0.05] },      // acima da vitrine
        { p: [-1.1, 1.0, -0.76], a: [0.2, 2.0, 0.05] },   // pilar esq
        { p: [0.5, 1.0, -0.76], a: [0.1, 2.0, 0.05] },    // pilar entre vitrine e porta
        { p: [1.1, 1.0, -0.76], a: [0.2, 2.0, 0.05] },    // pilar dir
        { p: [-0.27, 0.2, -0.76], a: [1.46, 0.4, 0.05] }, // mureta da vitrine
      ].map((m, i) => (
        <mesh key={i} position={m.p as any} castShadow receiveShadow><boxGeometry args={m.a as any} /><meshStandardMaterial color="#3a2e46" roughness={0.85} /></mesh>
      ))}
      <mesh position={[0, 2.35, -0.72]}><boxGeometry args={[2.2, 0.45, 0.06]} /><meshStandardMaterial map={placa} emissiveMap={placa} emissive="#ffffff" emissiveIntensity={0.9} /></mesh>
      <mesh position={[-0.27, 1.2, -0.765]}><planeGeometry args={[1.46, 1.6]} /><meshPhysicalMaterial color="#ffcf9a" transparent opacity={0.1} roughness={0.05} clearcoat={1} depthWrite={false} /></mesh>
      <mesh position={[0.8, 1.0, -0.76]}><planeGeometry args={[0.5, 2.0]} /><meshStandardMaterial color="#1a1420" /></mesh>
      <mesh position={[0, 0.03, -0.55]} receiveShadow><boxGeometry args={[2.6, 0.06, 0.5]} /><meshStandardMaterial color="#4a3c52" /></mesh>
      <mesh position={[0, 0.005, -1.55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.3, 1.55]} /><meshStandardMaterial color="#2c2230" roughness={0.6} /></mesh>
      {/* poste de barbeiro */}
      <group position={[1.12, 1.25, -0.6]}>
        <mesh><cylinderGeometry args={[0.07, 0.07, 0.7, 48]} /><meshStandardMaterial map={listras} emissiveMap={listras} emissive="#ffffff" emissiveIntensity={0.5} /></mesh>
        <mesh position={[0, 0.39, 0]}><sphereGeometry args={[0.085, 24, 24]} /><meshStandardMaterial color="#d6a74f" metalness={1} roughness={0.25} /></mesh>
        <mesh position={[0, -0.39, 0]}><sphereGeometry args={[0.085, 24, 24]} /><meshStandardMaterial color="#d6a74f" metalness={1} roughness={0.25} /></mesh>
      </group>
      {/* interior aquecido: balcão + celular */}
      <pointLight position={[-0.3, 1.9, -1.2]} intensity={6} color="#ffcf9a" distance={3} />
      <mesh position={[-0.0, 1.6, -2.32]}><planeGeometry args={[2.3, 3.1]} /><meshStandardMaterial color="#6b4446" roughness={0.9} /></mesh>
      <pointLight position={[0.3, 1.6, -1.0]} intensity={3} color="#ffd9b0" distance={2.5} />
      <mesh position={[-0.2, 0.5, -1.3]} castShadow receiveShadow><boxGeometry args={[1.4, 1.0, 0.5]} /><meshStandardMaterial color="#6e4a32" roughness={0.6} /></mesh>
      <mesh position={[-0.2, 1.015, -1.3]} receiveShadow><boxGeometry args={[1.5, 0.03, 0.6]} /><meshPhysicalMaterial color="#e8e2ea" roughness={0.3} clearcoat={1} /></mesh>
      {/* espelho e cadeira sugeridos */}
      <mesh position={[-0.9, 1.7, -2.28]}><planeGeometry args={[0.6, 0.9]} /><meshPhysicalMaterial color="#b7c2d6" metalness={1} roughness={0.08} /></mesh>
      {/* pino roxo com feixe */}
      <group position={[0, 4.2, -1.4]} scale={pin}>
        <mesh position={[0, 0.6, 0]}><sphereGeometry args={[0.5, 32, 32]} /><meshStandardMaterial color="#B600F6" emissive="#B600F6" emissiveIntensity={0.8} /></mesh>
        <mesh rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.36, 0.9, 32]} /><meshStandardMaterial color="#B600F6" emissive="#B600F6" emissiveIntensity={0.6} /></mesh>
        <mesh position={[0, 0.6, 0.0]}><sphereGeometry args={[0.2, 24, 24]} /><meshBasicMaterial color="#ffffff" /></mesh>
      </group>
      <mesh position={[0, 6, -1.4]}><cylinderGeometry args={[0.35, 0.8, 12, 32, 1, true]} /><meshBasicMaterial color="#d17bff" transparent opacity={0.08 * pin} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  );
};

const Celular: React.FC<{ f: number; tela: THREE.Texture | null }> = ({ f, tela }) => {
  const acende = cl(f, 380, 396, 0, 1);
  return (
    <group position={[FONE.x, FONE.y, FONE.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <RoundedBox args={[TW + 0.008, TH + 0.012, 0.008]} radius={0.005} smoothness={4} position={[0, 0, -0.0041]} castShadow>
        <meshPhysicalMaterial color="#18161c" metalness={0.6} roughness={0.3} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0001]}>
        <planeGeometry args={[TW, TH]} />
        <meshBasicMaterial map={tela} color={new THREE.Color().setScalar(0.08 + 0.92 * acende)} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const R3: React.FC<{ semCelular?: boolean }> = ({ semCelular }) => {
  const f = useCurrentFrame();
  const ok = useFontesOk();
  const tela = useTex(semCelular ? 'telas/demo_barbearia.png' : 'telas/r3_loop.png');
  // distância exata p/ a tela encher o quadro (fov 30 vertical)
  const dTela = TH / (2 * Math.tan((30 / 2) * Math.PI / 180));
  const ks = [
    { f: 0, p: [0, 26, 0.0001], a: [0, 0, 0], fov: 30, rolo: 0 },
    { f: 120, p: [1.5, 17, 6], a: [0, 1, -1], fov: 32, rolo: 0 },
    { f: 230, p: [3.6, 4.2, 6.5], a: [0, 1.6, -1], fov: 34 },
    { f: 300, p: [0.2, 1.45, 3.3], a: [-0.2, 1.25, -1], fov: 34 },
    { f: 390, p: [0.05, 1.32, -0.35], a: [FONE.x, FONE.y, FONE.z], fov: 32 },
    { f: 470, p: [FONE.x, FONE.y + 0.42, FONE.z + 0.0001], a: [FONE.x, FONE.y, FONE.z], fov: 30, rolo: 0 },
    { f: DUR_R3 - 1, p: [FONE.x, FONE.y + dTela + 0.0041 * 0, FONE.z + 0.0001], a: [FONE.x, FONE.y, FONE.z], fov: 30, rolo: 0 },
  ] as any;
  const e = Easing.bezier(0.55, 0, 0.35, 1);
  const g0 = lin(f, [[0, 0], [1, 0]]); void g0;
  return (
    <AbsoluteFill style={{ background: '#0b0810' }}>
      {ok && tela && (
        <ThreeCanvas width={1080} height={1920} shadows camera={{ position: [0, 26, 0.0001], fov: 30, near: 0.005, far: 80 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: true }}>
          <color attach="background" args={['#0b0810']} />
          <fog attach="fog" args={['#0b0810', 18, 45]} />
          <Cam f={f} ks={ks} e={e} />
          <ambientLight intensity={0.35} color="#9c8cff" />
          <directionalLight position={[8, 14, 6]} intensity={1.6} color="#c9b6ff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
          <hemisphereLight args={['#6b4bd6', '#1a0f20', 0.5]} />
          <Cidade f={f} />
          <Barbearia f={f} ok={ok} />
          {!semCelular && <Celular f={f} tela={tela} />}
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={3} color="#ffd6a0" position={[0, 6, 6]} scale={[10, 3, 1]} />
            <Lightformer form="rect" intensity={2} color="#b600f6" position={[-8, 3, 0]} scale={[3, 8, 1]} />
          </Environment>
        </ThreeCanvas>
      )}
      {/* textos (somem antes do fim para o loop emendar) */}
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'37 barbearias\nno seu bairro.'} ini={14} tam={92} peso={800} cor="#fff" fim={108} tracking={-0.045} /></div>
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'Por que ele escolheria\na *sua*?'} ini={112} tam={84} peso={800} cor="#fff" acento={ROSA} fim={220} tracking={-0.045} /></div>
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'Porque ela *aparece*.'} ini={228} tam={88} peso={800} cor="#fff" acento={ROSA} fim={300} tracking={-0.045} /></div>
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'E parece *a melhor*.'} ini={304} tam={88} peso={800} cor="#fff" acento={ROSA} fim={384} tracking={-0.045} /></div>
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'Google, página e vídeos\nque fazem *o cliente voltar*.'} ini={392} tam={70} peso={800} cor="#fff" acento={ROSA} fim={500} tracking={-0.04} /></div>
      {f >= 470 && f < 560 && (
        <div style={{ position: 'absolute', top: 1500, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(cl(f, 470, 486, 0, 1), cl(f, 540, 558, 1, 0)) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '22px 36px', borderRadius: 999, background: 'rgba(255,255,255,.94)', fontFamily: F, fontWeight: 700, fontSize: 36, color: '#1B1322' }}>
            <Marca tam={34} /> · chama no direct
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
