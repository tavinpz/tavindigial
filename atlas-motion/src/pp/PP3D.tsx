import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { C, Fonts } from './PickPals';

/* Pick Pals v2: 3D com luz de estúdio, boca sincronizada, layout na área segura (Shorts/Reels/TikTok)
   área segura comum: x 110–910, y 290–1250; legenda em ~1180 */
type Beat = { t0: number; t1: number; txt: string; who: string };
type Dados = { dur: number; quadros: number; beats: Record<string, Beat>; boca: number[]; quem: string };

const FONT = 'Fredoka';
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (x: number) => Easing.bezier(0.33, 1, 0.68, 1)(cl(x));
const eio = (x: number) => Easing.bezier(0.65, 0, 0.35, 1)(cl(x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sp = (f: number, fps: number, at: number, damping = 11) => spring({ frame: f - Math.round(at * fps), fps, config: { damping, mass: 0.7, stiffness: 170 } });

/* ================= 3D ================= */
const col = (h: string) => new THREE.Color(h);
const mixC = (a: string, b: string, t: number) => col(a).lerp(col(b), cl(t));

type BoP = { pos: [number, number, number]; rotY?: number; s?: number; mouth?: number; smile?: number; look?: [number, number]; blink?: number;
  armL?: number; armR?: number; hold?: 'pill' | 'bottle' | null; sick?: number; sq?: number; t: number; happyEyes?: boolean; tilt?: number };
const Bo3: React.FC<BoP> = ({ pos, rotY = 0, s = 1, mouth = 0, smile = 1, look = [0, 0], blink = 1, armL = 0, armR = 0, hold = null, sick = 0, sq = 0, t, happyEyes, tilt = 0 }) => {
  const body = mixC(C.bo, C.sick, sick);
  return (
    <group position={pos} rotation={[0, rotY, tilt]} scale={[s * (1 + sq * 0.07), s * (1 - sq * 0.07), s * (1 + sq * 0.07)]}>
      <mesh castShadow receiveShadow><sphereGeometry args={[1, 64, 48]} />
        <meshPhysicalMaterial color={body} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.3} /></mesh>
      {/* olhos */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.34, 0.2, 0.83]} rotation={[0, sd * 0.32, 0]} scale={[1, happyEyes ? 0.18 : Math.max(0.08, blink), 1]}>
          <mesh scale={[0.27, 0.33, 0.16]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color="#ffffff" roughness={0.15} /></mesh>
          <mesh position={[look[0] * 0.07, look[1] * 0.07 - 0.02, 0.13]} scale={[0.15, 0.17, 0.08]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#1b1830" roughness={0.1} /></mesh>
          <mesh position={[look[0] * 0.07 + 0.05, look[1] * 0.07 + 0.07, 0.19]} scale={0.045}><sphereGeometry args={[1, 12, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      {/* bochechas */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.6, -0.12, 0.76]} rotation={[0, sd * 0.65, 0]} scale={[0.16, 0.09, 0.04]}><sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={C.pink} transparent opacity={0.75} /></mesh>
      ))}
      {/* boca */}
      <group position={[0, -0.27, 0.95]} rotation={[-0.25, 0, 0]}>
        {mouth > 0.1 ? (
          <>
            <mesh scale={[0.2, 0.05 + mouth * 0.16, 0.06]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#6d1630" roughness={0.6} /></mesh>
            <mesh position={[0, -0.04 - mouth * 0.06, 0.03]} scale={[0.1, 0.04, 0.04]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={C.pink} /></mesh>
          </>
        ) : smile >= 0 ? (
          <mesh rotation={[0, 0, Math.PI]} position={[0, 0.06, 0]}><torusGeometry args={[0.15, 0.035, 12, 32, Math.PI]} /><meshStandardMaterial color="#2b2747" /></mesh>
        ) : (
          <mesh position={[0, -0.05, 0]}><torusGeometry args={[0.13, 0.032, 12, 32, Math.PI]} /><meshStandardMaterial color="#2b2747" /></mesh>
        )}
      </group>
      {/* broto */}
      <group position={[0, 0.98, 0]} rotation={[0, 0, Math.sin(t * 3) * 0.12]}>
        <mesh position={[0, 0.16, 0]} castShadow><cylinderGeometry args={[0.035, 0.045, 0.34, 10]} /><meshStandardMaterial color="#2b2747" /></mesh>
        <mesh position={[0.17, 0.36, 0]} rotation={[0, 0, 0.45 + Math.sin(t * 3 + 1) * 0.15]} scale={[0.24, 0.07, 0.14]} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={C.mint} roughness={0.4} /></mesh>
      </group>
      {/* pés */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.42, -0.93, 0.12]} scale={[0.32, 0.16, 0.4]} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color="#2b2747" roughness={0.5} /></mesh>
      ))}
      {/* braços (pivô no ombro) */}
      {[-1, 1].map((sd) => {
        const a = sd < 0 ? armL : armR;
        return (
          <group key={sd} position={[sd * 0.9, -0.08, 0.1]} rotation={[-a * 0.9, 0, sd * (0.35 + a * 1.4)]}>
            <mesh position={[0, -0.28, 0]} castShadow><capsuleGeometry args={[0.12, 0.34, 8, 16]} /><meshPhysicalMaterial color={body} roughness={0.32} clearcoat={0.7} /></mesh>
            {sd > 0 && hold === 'pill' && <group position={[0, -0.62, 0.15]} scale={2.2}><Pill3 c={C.tomato} /></group>}
            {sd > 0 && hold === 'bottle' && <group position={[0, -0.7, 0.12]} scale={0.6}><Bottle3 /></group>}
          </group>
        );
      })}
    </group>
  );
};

const Kiwi3: React.FC<{ pos: [number, number, number]; rotY?: number; s?: number; mouth?: number; wing?: number; blink?: number; happy?: boolean; t: number; sq?: number }> = ({
  pos, rotY = 0, s = 1, mouth = 0, wing = 0, blink = 1, happy, t, sq = 0,
}) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={[s * (1 + sq * 0.06), s * (1 - sq * 0.06), s]}>
    <mesh castShadow receiveShadow scale={[1.08, 1, 1]}><sphereGeometry args={[1, 64, 48]} /><meshStandardMaterial color={C.kiwi} roughness={0.85} /></mesh>
    <mesh position={[0, -0.25, 0.62]} scale={[0.62, 0.55, 0.42]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={C.kiwiLite} roughness={0.9} /></mesh>
    {/* olhos */}
    {[-1, 1].map((sd) => (
      <group key={sd} position={[sd * 0.3, 0.32, 0.85]} rotation={[0, sd * 0.3, 0]} scale={[1, happy ? 0.2 : Math.max(0.08, blink), 1]}>
        <mesh scale={[0.18, 0.21, 0.1]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#fff" roughness={0.15} /></mesh>
        <mesh position={[0, -0.01, 0.08]} scale={[0.1, 0.11, 0.05]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#1b1830" /></mesh>
        <mesh position={[0.03, 0.05, 0.12]} scale={0.03}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#fff" /></mesh>
      </group>
    ))}
    {/* bico: superior fixo, inferior abre com a fala */}
    <group position={[0, 0.08, 0.92]}>
      <mesh rotation={[Math.PI / 2 - 0.12, 0, 0]} position={[0, 0, 0.42]} castShadow><coneGeometry args={[0.11, 0.9, 24]} /><meshStandardMaterial color={C.sun} roughness={0.35} /></mesh>
      <group rotation={[0.08 + mouth * 0.35, 0, 0]}>
        <mesh rotation={[Math.PI / 2 - 0.05, 0, 0]} position={[0, -0.08, 0.36]}><coneGeometry args={[0.075, 0.74, 20]} /><meshStandardMaterial color="#F2A515" roughness={0.4} /></mesh>
      </group>
    </group>
    {/* boné */}
    <group position={[0, 0.62, 0.05]} rotation={[-0.18, 0, 0.06]}>
      <mesh castShadow><sphereGeometry args={[0.72, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={C.mint} roughness={0.45} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.02, 0.72]} scale={[0.62, 0.05, 0.42]}><cylinderGeometry args={[1, 1, 1, 32]} /><meshStandardMaterial color={C.mint} roughness={0.45} /></mesh>
      <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial color="#fff" /></mesh>
    </group>
    {/* apito */}
    <mesh position={[0.18, -0.45, 0.93]} rotation={[0.3, 0.2, 0.4]} castShadow><capsuleGeometry args={[0.07, 0.16, 6, 12]} /><meshStandardMaterial color={C.grape} roughness={0.3} /></mesh>
    {/* asas */}
    {[-1, 1].map((sd) => (
      <group key={sd} position={[sd * 1.0, -0.05, 0.1]} rotation={[0, 0, sd * (0.25 + (sd > 0 ? wing : wing * 0.3) * 1.3)]}>
        <mesh position={[0, -0.3, 0]} scale={[0.22, 0.45, 0.35]} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={C.kiwi} roughness={0.85} /></mesh>
      </group>
    ))}
    {/* pernas */}
    {[-1, 1].map((sd) => (
      <group key={sd} position={[sd * 0.35, -0.95, 0.1]}>
        <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.06, 0.06, 0.45, 10]} /><meshStandardMaterial color={C.sun} /></mesh>
        <mesh position={[0, -0.42, 0.12]} scale={[0.2, 0.06, 0.28]} castShadow><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={C.sun} /></mesh>
      </group>
    ))}
  </group>
);

const Pill3: React.FC<{ c: string; rot?: [number, number, number]; pos?: [number, number, number] }> = ({ c, rot = [0, 0, Math.PI / 2], pos = [0, 0, 0] }) => (
  <group position={pos} rotation={rot}>
    <mesh position={[0, 0.05, 0]} castShadow><capsuleGeometry args={[0.07, 0.1, 8, 16]} /><meshPhysicalMaterial color={c} roughness={0.2} clearcoat={1} /></mesh>
    <mesh position={[0, -0.06, 0]} castShadow><capsuleGeometry args={[0.069, 0.08, 8, 16]} /><meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} /></mesh>
  </group>
);
const Bottle3: React.FC<{ pos?: [number, number, number]; rot?: [number, number, number] }> = ({ pos = [0, 0, 0], rot = [0, 0, 0] }) => (
  <group position={pos} rotation={rot}>
    <mesh castShadow><cylinderGeometry args={[0.3, 0.3, 0.72, 40]} /><meshPhysicalMaterial color="#FF9B33" roughness={0.15} clearcoat={1} transparent opacity={0.92} /></mesh>
    <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.32, 0.32, 0.2, 40]} /><meshStandardMaterial color="#ffffff" roughness={0.4} /></mesh>
    <mesh position={[0, 0.0, 0.301]}><planeGeometry args={[0.42, 0.34]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0, 0.0, 0.305]}><planeGeometry args={[0.16, 0.05]} /><meshStandardMaterial color={C.tomato} /></mesh>
    <mesh position={[0, 0.0, 0.306]}><planeGeometry args={[0.05, 0.16]} /><meshStandardMaterial color={C.tomato} /></mesh>
  </group>
);
const PCOL = [C.tomato, C.sun, C.grape, C.mint, C.pink];

const Room3: React.FC<{ wall?: string; table?: boolean; pills?: boolean; bottle?: boolean }> = ({ wall = '#BFE3FF', table = true, pills = true, bottle = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#F3C99A" roughness={0.8} /></mesh>
    <mesh position={[0, 4, -3.2]} receiveShadow><planeGeometry args={[40, 12]} /><meshStandardMaterial color={wall} emissive={wall} emissiveIntensity={0.35} roughness={0.95} /></mesh>
    {/* bolinhas na parede */}
    {Array.from({ length: 26 }).map((_, i) => (
      <mesh key={i} position={[-7 + ((i * 1.37) % 14), 0.2 + ((i * 0.83) % 5.5), -3.18]}><circleGeometry args={[0.09, 16]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.5} /></mesh>
    ))}
    {/* rodapé */}
    <mesh position={[0, -0.9, -3.15]}><boxGeometry args={[40, 0.3, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
    {/* janela */}
    <group position={[3.4, 2.3, -3.15]}>
      <mesh><boxGeometry args={[2.0, 1.7, 0.08]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[0, 0, 0.05]}><planeGeometry args={[1.8, 1.5]} /><meshBasicMaterial color="#DDF4FF" /></mesh>
      <mesh position={[-0.4, 0.3, 0.06]}><circleGeometry args={[0.22, 24]} /><meshBasicMaterial color={C.sun} /></mesh>
    </group>
    {/* planta */}
    <group position={[-3.6, -1.05, -2.2]}>
      <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.38, 0.3, 0.7, 24]} /><meshStandardMaterial color={C.tomato} roughness={0.6} /></mesh>
      {[[0, 1.1, 0, 0.5], [-0.35, 0.95, 0.1, 0.36], [0.35, 1.0, 0.05, 0.4], [0.05, 1.5, 0, 0.32]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 20, 14]} /><meshStandardMaterial color={C.mint} roughness={0.7} /></mesh>
      ))}
    </group>
    {/* tapete */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.6, -1.04, 0.6]} receiveShadow><circleGeometry args={[2.3, 48]} /><meshStandardMaterial color="#FFE08A" roughness={0.95} /></mesh>
    {table && (
      <group position={[1.35, 0, -0.2]}>
        <mesh position={[0, -0.02, 0]} castShadow receiveShadow><boxGeometry args={[2.4, 0.14, 1.3]} /><meshStandardMaterial color={C.wood} roughness={0.55} /></mesh>
        {[[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.55, z]} castShadow><cylinderGeometry args={[0.07, 0.07, 1.0, 12]} /><meshStandardMaterial color={C.woodDark} /></mesh>
        ))}
        {bottle && <Bottle3 pos={[0.45, 0.42, -0.1]} rot={[0, -0.3, 0.05]} />}
        {pills && PCOL.map((c, i) => <Pill3 key={i} c={c} pos={[-0.55 + i * 0.22, 0.12, 0.25 + (i % 2) * 0.12]} rot={[Math.PI / 2, 0, i * 0.9]} />)}
      </group>
    )}
  </group>
);

const Cam: React.FC<{ p: [number, number, number]; at: [number, number, number]; fov?: number }> = ({ p, at, fov = 30 }) => {
  const { camera } = useThree();
  camera.position.set(...p);
  camera.lookAt(...at);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.updateProjectionMatrix();
  return null;
};
const Lights: React.FC = () => (
  <>
    <hemisphereLight args={['#ffffff', '#ffcf9e', 1.25]} />
    <directionalLight position={[3, 6, 5]} intensity={2.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
      shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-radius={6} shadow-bias={-0.0004} />
    <directionalLight position={[-4, 3, 2]} intensity={0.6} color="#cfe6ff" />
    <directionalLight position={[0, 3, -5]} intensity={0.9} color="#ffffff" />
  </>
);
const Stage: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <ThreeCanvas width={w} height={h} shadows camera={{ fov: 30, near: 0.1, far: 100, position: [0, 1, 8] }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
    <color attach="background" args={['#BFE3FF']} />
    <Lights />
    {children}
  </ThreeCanvas>
);

/* ================= 2D por cima ================= */
const Txt: React.FC<{ x: number; y: number; size: number; fill?: string; stroke?: string; sw?: number; children: React.ReactNode; s?: number; rot?: number; o?: number }> = ({
  x, y, size, fill = C.white, stroke = C.ink, sw, children, s = 1, rot = 0, o = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <text textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw ?? size * 0.16} strokeLinejoin="round" paintOrder="stroke" dominantBaseline="middle">{children}</text>
  </g>
);
const CX = 510; // centro da área segura (botões ficam à direita)

const Captions: React.FC<{ b?: Beat; t: number }> = ({ b, t }) => {
  if (!b) return null;
  const words = b.txt.split(' ');
  const tot = words.reduce((s, w) => s + w.length + 1, 0);
  let acc = 0;
  let cur = words.findIndex((w) => { acc += w.length + 1; return t < b.t0 + ((b.t1 - b.t0) * acc) / tot; });
  if (cur < 0) cur = words.length - 1;
  // quebra em até 2 linhas de ~20 caracteres
  const lines: number[][] = [[]];
  let len = 0;
  words.forEach((w, i) => { if (len + w.length > 18 && lines[lines.length - 1].length) { lines.push([]); len = 0; } lines[lines.length - 1].push(i); len += w.length + 1; });
  const pop = interpolate(t - b.t0, [0, 0.1], [0.9, 1], { extrapolateRight: 'clamp' });
  const y0 = 1170 - (lines.length - 1) * 40;
  return (
    <g transform={`translate(${CX} 0) scale(${pop}) translate(${-CX} 0)`}>
      {lines.map((ln, li) => (
        <text key={li} x={CX} y={y0 + li * 80} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={700} fontSize={66}
          stroke={C.ink} strokeWidth={15} strokeLinejoin="round" paintOrder="stroke">
          {ln.map((i) => <tspan key={i} fill={i === cur ? C.sun : C.white}>{words[i] + ' '}</tspan>)}
        </text>
      ))}
    </g>
  );
};
const Stamp: React.FC<{ t: number; ok?: boolean; x: number; y: number }> = ({ t, ok, x, y }) => {
  const s = interpolate(t, [0, 0.14, 0.26], [2.6, 0.9, 1], { extrapolateRight: 'clamp' });
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${ok ? -8 : 8})`}>
      <circle r={66} fill={ok ? C.mint : C.tomato} stroke={C.ink} strokeWidth={8} />
      {ok ? <path d="M-30 2 L -8 24 L 34 -22" stroke={C.white} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M-25 -25 L 25 25 M25 -25 L -25 25" stroke={C.white} strokeWidth={17} strokeLinecap="round" />}
    </g>
  );
};
const Confetti: React.FC<{ t: number; x: number; y: number; n?: number }> = ({ t, x, y, n = 44 }) => {
  if (t < 0 || t > 2.2) return null;
  const cols = [C.tomato, C.sun, C.mint, C.grape, C.pink, C.bo];
  return <g>{Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2 + i * 0.37, v = 380 + ((i * 97) % 320);
    const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t * 0.8 + 760 * t * t;
    return <rect key={i} x={px} y={py} width={16} height={28} rx={6} fill={cols[i % 6]} transform={`rotate(${i * 40 + t * 600} ${px} ${py})`} opacity={cl(2.2 - t)} />;
  })}</g>;
};
const Chip: React.FC<{ y: number; s: number; children: React.ReactNode; w?: number; fill?: string }> = ({ y, s, children, w = 760, fill = C.white }) => (
  <g transform={`translate(${CX} ${y}) scale(${s})`} opacity={s > 0.02 ? 1 : 0}>
    <rect x={-w / 2} y={-62} width={w} height={124} rx={62} fill={fill} stroke={C.ink} strokeWidth={9} />
    {children}
  </g>
);
const PillIcon: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -25 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-30} y={-14} width={60} height={28} rx={14} fill={C.white} stroke={C.ink} strokeWidth={5} />
    <path d="M0 -14 h16 a14 14 0 0 1 0 28 h-16 Z" fill={C.tomato} stroke={C.ink} strokeWidth={5} />
  </g>
);
const CandyIcon: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = C.pink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-46 -18 L -26 0 L -46 18 Z M46 -18 L 26 0 L 46 18 Z" fill={c} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle r={28} fill={c} stroke={C.ink} strokeWidth={6} />
    <path d="M-14 -10 Q 0 -22 12 -13" stroke={C.white} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

/* ================= episódio ================= */
export const PP3D: React.FC<{ id: string; dados: Dados; semAudio?: boolean }> = ({ id, dados, semAudio }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const B = dados.beats;
  const at = (k: string, d = 0) => B[k].t0 + d;
  const q = Math.min(f, dados.boca.length - 1);
  const mouthOf = (who: string) => (dados.quem[q] === who ? dados.boca[q] : 0);
  const blink = (o = 0) => (((t + o) % 3.3) > 2.0 && ((t + o) % 3.3) < 2.12 ? 0.1 : 1);

  const tSplit = at('what') - 0.12, tKiwi = at('why') - 0.2, tNext = at('next') - 0.12;
  const ph = t < tSplit ? 1 : t < tKiwi ? 2 : t < tNext ? 3 : 4;
  const ans = at('ans');
  const done = t > ans - 0.05;
  const curBeat = Object.entries(B).find(([k, b]) => !['c3', 'c2', 'c1', 'stop'].includes(k) && t >= b.t0 - 0.05 && t <= b.t1 + 0.3)?.[1];

  // ---------- fase 1: gancho STOP ----------
  const tStop = at('stop');
  const frozen = t >= tStop - 0.02 && t < at('q') - 0.05;
  const ta = frozen ? tStop : t; // tempo da animação 3D (congela no STOP)
  const reach = ph === 1 ? (ta < tStop ? ease(ta / 0.6) : 1 - ease((ta - at('q')) / 0.6)) : 0;
  const pull = eio((t - at('q')) / 1.2);
  const punch = frozen ? 1 + 0.06 * ease((t - tStop) / 0.25) : 1;
  const shake = t > tStop && t < tStop + 0.3 ? Math.sin(t * 90) * 10 * (1 - (t - tStop) / 0.3) : 0;

  return (
    <AbsoluteFill style={{ background: '#BFE3FF' }}>
      <Fonts />
      {!semAudio && <Audio src={staticFile(`pp/${id}/audio.wav`)} />}

      {ph === 1 && (
        <AbsoluteFill style={{ transform: `translate(${shake}px,0) scale(${punch})`, filter: frozen ? 'saturate(0.35) brightness(0.92)' : 'none' }}>
          <Stage w={1080} h={1920}>
            <Cam p={[lerp(-0.4, 0.45, pull), lerp(0.55, 1.5, pull), lerp(5.6, 10.5, pull)]} at={[lerp(-0.35, 0.45, pull), lerp(-0.5, -0.65, pull), 0]} fov={50} />
            <Room3 />
            <Bo3 t={ta} pos={[-0.5, 0, 0.5]} rotY={0.25 - pull * 0.1} mouth={mouthOf('b')} look={reach > 0.5 ? [0.6, -0.3] : [0.3 + pull * 0.4, 0]} blink={blink()}
              armR={reach * 0.9} hold={reach > 0.05 ? 'pill' : null} sq={Math.max(0, Math.sin(ta * 7)) * 0.25 * (ta < tStop ? 1 : 0)} tilt={pull > 0.3 ? Math.sin(t * 2) * 0.06 : 0} />
          </Stage>
        </AbsoluteFill>
      )}

      {ph === 2 && <Split t={t} f={f} fps={fps} at={at} done={done} ans={ans} mouthOf={mouthOf} blink={blink} />}

      {ph === 3 && (
        <AbsoluteFill>
          <Stage w={1080} h={1920}>
            {(() => {
              const kTalk = t < at('got') - 0.1;
              const k = eio((t - tKiwi) / 0.6);
              return kTalk
                ? <Cam p={[lerp(1.0, 0.4, k), 0.7, lerp(11, 9.2, k)]} at={[0.2, -0.55, 0]} fov={45} />
                : <Cam p={[0, 0.6, 10.8]} at={[0, -0.55, 0]} fov={45} />;
            })()}
            <Room3 wall="#CFF3E4" pills={false} bottle={false} table={false} />
            <Kiwi3 t={t} pos={[0.95, 0.3, 0]} rotY={-0.35} s={1.05} mouth={mouthOf('k')} wing={0.3 + 0.3 * Math.sin(t * 5) * (mouthOf('k') > 0 ? 1 : 0.2)} blink={blink(0.5)} happy={t > at('got')} />
            <Bo3 t={t} pos={[-1.15, -0.2, 0.6]} rotY={0.5} s={0.82} mouth={mouthOf('b')} look={[0.8, 0.3]} blink={blink(1.2)} armL={t > at('got') ? 0.8 + 0.2 * Math.sin(t * 10) : 0}
              sq={Math.max(0, Math.sin(t * 6)) * 0.2} happyEyes={t > at('got') + 0.6} />
          </Stage>
        </AbsoluteFill>
      )}

      {ph === 4 && (
        <AbsoluteFill>
          <Stage w={1080} h={1920}>
            <Cam p={[0, 0.4, lerp(7.5, 6.2, eio((t - tNext) / 2))]} at={[0, -0.75, 0]} fov={45} />
            <Room3 wall="#E1D6FF" pills={false} bottle={false} table={false} />
            <Bo3 t={t} pos={[0, -0.15 + Math.max(0, Math.sin(t * 7)) * 0.25, 0.4]} s={1} mouth={mouthOf('b')} smile={1} look={[0, 0.1]} blink={blink()}
              armL={0.9 + 0.15 * Math.sin(t * 12)} armR={0.9 + 0.15 * Math.sin(t * 12 + 1)} sq={Math.max(0, Math.sin(t * 7)) * 0.3} />
          </Stage>
        </AbsoluteFill>
      )}

      {/* ---------- camada 2D ---------- */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {ph === 1 && t < tStop && (
          <Chip y={340} s={sp(f, fps, -0.2, 12)} w={640}>
            <Txt x={30} y={4} size={64} fill={C.pink}>Yummy?</Txt><CandyIcon x={-220} y={0} s={0.9} />
          </Chip>
        )}
        {frozen && (
          <g transform={`translate(${CX} 560) scale(${sp(f, fps, tStop, 6)}) rotate(-6)`}>
            <Txt x={0} y={0} size={250} fill={C.tomato} sw={34}>STOP!</Txt>
            <g transform="translate(0 170)"><Txt x={0} y={0} size={60} fill={C.white}>✋ wait a second...</Txt></g>
          </g>
        )}
        {ph === 1 && t >= at('q') - 0.05 && (
          <g>
            <Chip y={360} s={sp(f, fps, at('q') - 0.05, 10)} w={820}>
              <CandyIcon x={-330} y={0} s={0.8} />
              <Txt x={-165} y={4} size={60} fill={C.pink}>CANDY</Txt>
              <Txt x={-35} y={4} size={42} fill={C.ink} sw={0}>or</Txt>
              <Txt x={185} y={4} size={60} fill={C.tomato}>MEDICINE?</Txt>
            </Chip>
            <g transform={`translate(330 ${700 + Math.sin(t * 5) * 10}) scale(${sp(f, fps, at('q', 0.4), 8)})`}>
              <circle r={58} fill={C.white} stroke={C.ink} strokeWidth={8} /><Txt x={0} y={6} size={84} fill={C.tomato} sw={0}>?</Txt>
            </g>
          </g>
        )}
        {ph === 3 && (
          <g>
            <g transform={`translate(${CX} 420) scale(${sp(f, fps, at('why'), 9)})`}>
              <rect x={-380} y={-125} width={760} height={250} rx={46} fill={C.white} stroke={C.ink} strokeWidth={10} />
              <PillIcon x={-250} y={-20} s={1.6} />
              <PillIcon x={-200} y={60} s={1.0} rot={20} />
              <Txt x={0} y={6} size={150} fill={C.tomato} sw={20}>≠</Txt>
              <CandyIcon x={230} y={-10} s={1.5} />
            </g>
            {t > at('got') && (
              <g transform={`translate(780 ${700}) scale(${sp(f, fps, at('got'), 7)}) rotate(${(1 - sp(f, fps, at('got'), 7)) * 120})`}>
                <path d="M0 -84 L 24 -28 L 84 -24 L 38 15 L 52 75 L 0 43 L -52 75 L -38 15 L -84 -24 L -24 -28 Z" fill={C.sun} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
                <Txt x={0} y={10} size={38} fill={C.ink} sw={0}>+1</Txt>
              </g>
            )}
          </g>
        )}
        {ph === 4 && (
          <g>
            <Txt x={CX} y={360} size={84} s={sp(f, fps, tNext, 9)}>NEXT ONE IS</Txt>
            <Txt x={CX} y={480} size={124} fill={C.sun} s={sp(f, fps, tNext + 0.15, 8)} rot={-4}>TRICKY!</Txt>
          </g>
        )}
        <Captions b={curBeat} t={t} />
        {[tSplit, tKiwi, tNext].map((x, i) => <rect key={i} width={1080} height={1920} fill={C.white} opacity={cl(1 - Math.abs(t - x) * 8) * 0.85} />)}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- fase 2: escolha A | B ---------- */
const PX = [110, 525], PY = 440, PW2 = 385, PH2 = 660;
const Split: React.FC<{ t: number; f: number; fps: number; at: (k: string, d?: number) => number; done: boolean; ans: number; mouthOf: (w: string) => number; blink: (o?: number) => number }> = ({
  t, f, fps, at, done, ans, mouthOf, blink,
}) => {
  const aT = t - at('a'), bT = t - at('b');
  const eat = cl((aT - 0.25) / 0.45);
  const chew = aT > 0.7 && !done ? Math.abs(Math.sin(aT * 14)) : 0;
  const sick = done ? cl((t - ans) * 2) : 0;
  const walk = ease((bT - 0.2) / 1.2);
  const tap = t > at('tap') - 0.1 && !done;
  const hi = tap ? Math.floor(t * 3) % 2 : -1;
  const cnt = ['c3', 'c2', 'c1'].findIndex((k, i, arr) => t >= at(k) - 0.05 && (i === 2 ? t < ans - 0.05 : t < at(arr[i + 1]) - 0.05));
  const kA = sp(f, fps, at('what') + 0.05, 13), kB = sp(f, fps, at('what') + 0.2, 13);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={(i * 211) % 1080} cy={(i * 383) % 1920} r={40 + (i % 3) * 22} fill={[C.sky, '#FFE3A3', '#D9F7EC'][i % 3]} opacity={0.7} />)}
        {[0, 1].map((i) => hi === i && <rect key={i} x={PX[i] - 14} y={PY - 14} width={PW2 + 28} height={PH2 + 28} rx={50} fill={C.sun} />)}
        {done && <rect x={PX[1] - 16} y={PY - 16} width={PW2 + 32} height={PH2 + 32} rx={52} fill={C.sun} opacity={0.7 + 0.3 * Math.sin(t * 10)} />}
      </svg>
      {/* painel A */}
      <div style={{ position: 'absolute', left: PX[0] + (1 - kA) * -900, top: PY, width: PW2, height: PH2, borderRadius: 40, overflow: 'hidden', border: `9px solid ${C.ink}`, boxSizing: 'border-box',
        filter: done ? `saturate(${1 - sick * 0.6}) brightness(${1 - sick * 0.15})` : 'none' }}>
        <Stage w={PW2} h={PH2}>
          <Cam p={[0.3, 0.9, 8.6]} at={[0.3, -0.35, 0]} fov={40} />
          <Room3 />
          <Bo3 t={t} pos={[-0.25, 0, 0.5]} rotY={0.2} s={0.95} mouth={sick > 0 ? 0 : aT > 0.7 ? chew * 0.6 : aT > 0 ? 0.5 : 0} smile={sick > 0 ? -1 : 1} sick={sick}
            look={[0.5, eat > 0.5 ? -0.3 : 0]} blink={blink(0.4)} armR={aT > 0 ? eat * 0.9 : 0} hold={aT > 0 && eat < 1 ? 'pill' : null} tilt={sick * 0.12} sq={chew * 0.15} />
        </Stage>
      </div>
      {/* painel B */}
      <div style={{ position: 'absolute', left: PX[1] + (1 - kB) * 900, top: PY, width: PW2, height: PH2, borderRadius: 40, overflow: 'hidden', border: `9px solid ${C.ink}`, boxSizing: 'border-box' }}>
        <Stage w={PW2} h={PH2}>
          <Cam p={[0.1, 1.0, 10.5]} at={[0.1, -0.3, 0]} fov={40} />
          <Room3 wall="#D2F4E6" table={false} />
          <Kiwi3 t={t} pos={[1.45, 0.2, -0.3]} rotY={-0.5} s={0.9} wing={done ? 0.8 + 0.2 * Math.sin(t * 12) : walk > 0.9 ? 0.4 : 0} blink={blink(0.9)} happy={done} />
          <Bo3 t={t} pos={[lerp(-1.6, 0.0, walk), Math.abs(Math.sin(t * 9)) * 0.2 * (walk > 0 && walk < 1 ? 1 : 0) + (done ? Math.max(0, Math.sin(t * 9)) * 0.25 : 0), 0.6]} rotY={0.5} s={0.82}
            mouth={0} look={[0.8, 0.1]} blink={blink(1.3)} armR={0.5} hold="bottle" happyEyes={done} />
        </Stage>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <Chip y={350} s={sp(f, fps, at('what') - 0.1, 10)} w={800} fill={C.sun}><Txt x={0} y={4} size={64}>What should Bo do?</Txt></Chip>
        {[0, 1].map((i) => {
          const show = t > at(i ? 'b' : 'a') - 0.1;
          const k = sp(f, fps, at(i ? 'b' : 'a') - 0.1, 9);
          return show && (
            <g key={i} transform={`translate(${PX[i] + PW2 / 2} ${PY + PH2 - 70}) scale(${k})`}>
              <rect x={-170} y={-38} width={340} height={76} rx={38} fill={C.white} stroke={C.ink} strokeWidth={7} />
              <circle cx={-128} cy={0} r={30} fill={i ? C.bo : C.grape} stroke={C.ink} strokeWidth={5} />
              <Txt x={-128} y={3} size={38} sw={0}>{i ? 'B' : 'A'}</Txt>
              <Txt x={28} y={3} size={i ? 33 : 38} fill={C.ink} sw={0}>{i ? 'Ask a grown-up' : 'Eat it!'}</Txt>
            </g>
          );
        })}
        {cnt >= 0 && (
          <g transform={`translate(${CX} 730) scale(${sp(f, fps, at(['c3', 'c2', 'c1'][cnt]), 7)})`}>
            <circle r={100} fill={C.tomato} stroke={C.ink} strokeWidth={11} /><Txt x={0} y={8} size={130} sw={0}>{3 - cnt}</Txt>
          </g>
        )}
        {done && t < ans + 1.2 && (
          <g transform={`translate(${CX} 730) scale(${sp(f, fps, ans, 6)})`}>
            <circle r={110} fill={C.mint} stroke={C.ink} strokeWidth={11} /><Txt x={0} y={8} size={120} sw={0}>B!</Txt>
          </g>
        )}
        {done && <Stamp t={t - ans} x={PX[0] + PW2 - 70} y={PY + 70} />}
        {done && <Stamp t={t - ans} ok x={PX[1] + PW2 - 70} y={PY + 70} />}
        {done && <Confetti t={t - ans} x={PX[1] + PW2 / 2} y={PY + 200} />}
      </svg>
    </AbsoluteFill>
  );
};
