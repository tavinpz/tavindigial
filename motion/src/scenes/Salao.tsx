import React, { useMemo } from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { C, F, W } from '../lib/theme';
import { prog, spr, EO, EIO, clamp, lerp, fmt } from '../lib/anim';
import { Titulo } from '../comp/base';
import type { CenaProps } from '../lib/types';

/** Salão de pilares em 3D (G-Cans): câmera atravessa a nave entre os pilares */
const Cam: React.FC<{ p: number; t: number }> = ({ p, t }) => {
  const { camera } = useThree();
  const z = lerp(95, 10, p);
  camera.position.set(Math.sin(t * 0.4) * 2.5 + lerp(-6, 4, p), lerp(3.2, 7, p), z);
  camera.lookAt(lerp(4, -2, p), lerp(9, 11, p), z - 60);
  (camera as THREE.PerspectiveCamera).fov = 62;
  camera.updateProjectionMatrix();
  return null;
};

const Hall: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  const p = prog(f, -8, dur + 8, EIO);
  const pilares = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 15; i++) for (const x of [-28, -9.5, 9.5, 28]) out.push([x, 80 - i * 12]);
    return out.slice(0, 59);
  }, []);
  const feixes = [[-18, 50], [18, 26], [-18, 2], [18, -22], [0, -46]];
  return (
    <>
      <Cam p={p} t={f / 30} />
      <fog attach="fog" args={['#0b1118', 20, 140]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#9fb8d0', '#1a1410', 0.35]} />
      {feixes.map(([x, z], k) => (
        <React.Fragment key={k}>
          <pointLight position={[x, 22, z]} intensity={260} distance={70} decay={1.6} color="#ffd9a0" />
          <mesh position={[x, 12.7, z]}>
            <cylinderGeometry args={[2.2, 7, 25.4, 24, 1, true]} />
            <meshBasicMaterial color="#ffe2b0" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[78, 200]} />
        <meshStandardMaterial color="#2a2f33" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 25.4, 0]}>
        <planeGeometry args={[78, 200]} />
        <meshStandardMaterial color="#1d2227" roughness={0.9} />
      </mesh>
      {[-39, 39].map((x) => (
        <mesh key={x} position={[x, 12.7, 0]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[200, 25.4]} />
          <meshStandardMaterial color="#3a3f44" roughness={0.95} />
        </mesh>
      ))}
      {pilares.map(([x, z], k) => (
        <mesh key={k} position={[x, 12.7, z]}>
          <boxGeometry args={[2, 25.4, 7]} />
          <meshStandardMaterial color="#8c9197" roughness={0.85} />
        </mesh>
      ))}
      {/* faixa d'água no chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[78, 200]} />
        <meshStandardMaterial color="#1a3c56" transparent opacity={0.35} roughness={0.1} metalness={0.6} />
      </mesh>
    </>
  );
};

/** só a camada 3D (pré-renderizada à parte com WebGL) */
export const Salao3D: React.FC<{ f: number; dur: number }> = ({ f, dur }) => (
  <AbsoluteFill style={{ background: '#0b1118' }}>
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 62, near: 0.1, far: 400, position: [0, 4, 90] }}>
      <Hall f={f} dur={dur} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const Salao: React.FC<CenaProps> = ({ c, f, dur, id, pre3d }) => {
  const rot: [string, number, number][] = c.rotulos || [];
  return (
    <AbsoluteFill style={{ background: '#0b1118' }}>
      {pre3d ? <OffthreadVideo src={staticFile(`v/${id}/salao.mp4`)} muted /> : <Salao3D f={f} dur={dur} />}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,10,16,0.85) 0%, transparent 28%, transparent 70%, rgba(5,10,16,0.7) 100%)' }} />
      {rot.map(([lab, x, y], k) => {
        const ini = 22 + k * 30;
        const s = spr(f, ini, { damping: 11, stiffness: 180 });
        const m = lab.match(/^([\d,.]+)(.*)$/);
        const txt = m ? fmt(parseFloat(m[1]) * prog(f, ini, ini + 26, EO)) + m[2] : lab;
        return <div key={k} style={{ position: 'absolute', left: x - 400, width: 800, top: y - 50, textAlign: 'center', transform: `scale(${0.5 + 0.5 * s})`, opacity: clamp(s * 2), fontFamily: F.cond, fontWeight: 900, fontSize: 104, color: C.amber, textShadow: `0 0 40px ${C.amber}88, 0 6px 20px rgba(0,0,0,0.9)` }}>{txt}</div>;
      })}
      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={-3} />
    </AbsoluteFill>
  );
};
