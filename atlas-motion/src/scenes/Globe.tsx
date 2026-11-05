import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { continueRender, delayRender, staticFile, interpolate, Easing } from 'remotion';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

// lat/lon -> ponto na esfera, no mesmo padrão de UV da SphereGeometry (u=0 em lon -180)
export const llToVec = (lat: number, lon: number, r = 1) => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
};

const useTextures = () => {
  const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
  const [handle] = useState(() => delayRender('texturas do globo'));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const nomes = { mapa: 'tex/earth-blue-marble.jpg', relevo: 'tex/earth-topology.png', agua: 'tex/earth-water.png', luzes: 'tex/earth-night.jpg', nuvens: 'tex/clouds.png' };
    const out: Record<string, THREE.Texture> = {};
    Promise.all(Object.entries(nomes).map(([k, f]) => new Promise<void>((res) => loader.load(staticFile(f), (t) => { t.colorSpace = k === 'mapa' || k === 'luzes' ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8; out[k] = t; res(); }))))
      .then(() => { setTex(out); continueRender(handle); });
  }, [handle]);
  return tex;
};

const atmosferaVert = `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 p = modelViewMatrix * vec4(position,1.0); vP = p.xyz; gl_Position = projectionMatrix * p; }`;
const atmosferaFrag = `varying vec3 vN; varying vec3 vP; uniform vec3 cor; uniform float forca; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 2.6); gl_FragColor = vec4(cor, 1.0) * f * forca; }`;

type Props = { f: number; lat: number; lon: number; inicio?: number; fim?: number; distIni?: number; distFim?: number; giro?: number; marcador?: boolean; luz?: number };

const Cena: React.FC<Props & { tex: Record<string, THREE.Texture> }> = ({ f: frame, lat, lon, tex, inicio = 0, fim = 90, distIni = 4.2, distFim = 1.55, giro = 70, marcador = true }) => {
  const p = interpolate(frame, [inicio, fim], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.25, 1) });
  const dist = distIni + (distFim - distIni) * p;
  const lonCam = lon - giro * (1 - p);
  const latCam = lat * (0.35 + 0.65 * p);
  const cam = llToVec(latCam, lonCam, dist);
  const alvo = llToVec(lat, lon, 1.0);
  const estrelas = useMemo(() => {
    const g = new THREE.BufferGeometry(); const n = 2500; const pos = new Float32Array(n * 3);
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < n; i++) { const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(40 + rnd() * 20); pos.set([v.x, v.y, v.z], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g;
  }, []);
  const anel = Math.max(0, (frame - fim + 10) / 20);
  return (
    <>
      <CameraLook pos={cam} alvo={new THREE.Vector3(0, 0, 0).lerp(alvo, 0.35 * p)} />
      <ambientLight intensity={0.35} />
      <directionalLight position={llToVec(latCam + 22, lonCam - 32, 10)} intensity={2.6} />
      <points geometry={estrelas}><pointsMaterial size={0.07} color="#9fb4c8" sizeAttenuation /></points>
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 192, 192]} />
        <meshPhongMaterial map={tex.mapa} bumpMap={tex.relevo} bumpScale={0.012} specularMap={tex.agua} specular={new THREE.Color('#3a5a7a')} shininess={14} emissiveMap={tex.luzes} emissive={new THREE.Color('#ffcf8a')} emissiveIntensity={0.18} />
      </mesh>
      <mesh rotation={[0, frame * 0.0012, 0]}>
        <sphereGeometry args={[1.008, 128, 128]} />
        <meshLambertMaterial map={tex.nuvens} transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={atmosferaVert} fragmentShader={atmosferaFrag} uniforms={{ cor: { value: new THREE.Color('#4aa8ff') }, forca: { value: 1.35 } }} side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </mesh>
      {marcador && anel > 0 && (
        <group position={llToVec(lat, lon, 1.003)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), llToVec(lat, lon, 1).normalize())}>
          {[0, 1, 2].map((k) => {
            const f = ((anel + k / 3) % 1);
            return <mesh key={k} scale={0.01 + f * 0.09}><ringGeometry args={[0.8, 1, 64]} /><meshBasicMaterial color="#f2b33d" transparent opacity={(1 - f) * Math.min(1, anel * 2)} side={THREE.DoubleSide} depthWrite={false} /></mesh>;
          })}
          <mesh scale={0.012}><circleGeometry args={[1, 32]} /><meshBasicMaterial color="#f2b33d" /></mesh>
        </group>
      )}
    </>
  );
};

const CameraLook: React.FC<{ pos: THREE.Vector3; alvo: THREE.Vector3 }> = ({ pos, alvo }) => {
  const { camera } = useThree();
  camera.position.copy(pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(alvo);
  camera.updateProjectionMatrix();
  return null;
};

export const Globe: React.FC<Props> = (props) => {
  const width = 1080, height = 1920;
  const tex = useTextures();
  if (!tex) return <div style={{ width, height, background: '#03070d' }} />;
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 32, near: 0.01, far: 200 }} style={{ background: 'radial-gradient(ellipse at 50% 60%, #0c1a2b 0%, #03070d 70%)' }}>
      <Cena {...props} tex={tex} />
    </ThreeCanvas>
  );
};
