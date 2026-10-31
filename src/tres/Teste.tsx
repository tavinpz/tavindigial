import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { RoundedBox, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const useTex = (src: string) => {
  const [t, setT] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('tex ' + src));
  useEffect(() => { new THREE.TextureLoader().load(staticFile(src), (x) => { x.colorSpace = THREE.SRGBColorSpace; setT(x); continueRender(h); }, undefined, () => continueRender(h)); }, []);
  return t;
};

const Fone: React.FC<{ tex: THREE.Texture | null }> = ({ tex }) => {
  const f = useCurrentFrame();
  return (
    <group rotation={[0.15, -0.5 + f * 0.02, 0.05]}>
      <RoundedBox args={[1.6, 3.3, 0.16]} radius={0.2} smoothness={6}>
        <meshPhysicalMaterial color="#1a1720" metalness={0.9} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.082]}>
        <planeGeometry args={[1.48, 3.18]} />
        <meshBasicMaterial map={tex} color={tex ? '#fff' : '#f0f'} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Teste: React.FC = () => {
  const tex = useTex('telas/demo_barbearia.png');
  if (tex) { tex.repeat.set(1, 0.42); tex.offset.set(0, 0.58); }
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#1a0630,#050407)' }}>
      <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 7], fov: 35 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[4, 6, 6]} intensity={120} angle={0.5} penumbra={1} color="#ffd6ff" />
        <pointLight position={[-4, -2, 3]} intensity={40} color="#b600f6" />
        <Fone tex={tex} />
        <mesh position={[1.4, 1.6, -1]}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshPhysicalMaterial color="#b600f6" roughness={0.15} clearcoat={1} />
        </mesh>
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={4} position={[0, 4, 4]} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={2} color="#fea8ff" position={[-5, 0, 2]} scale={[2, 6, 1]} />
          <Lightformer form="ring" intensity={3} color="#b600f6" position={[5, 1, -2]} scale={3} />
        </Environment>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
