// R1 — "Enquanto você dormia" (3D real: quarto à noite; mergulho na tela; virada: o dono estava dormindo)
import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { P, F, FundoRoxo, Texto, Letras, Card, Surge, Toque, Botao, Digita, Check, Icone, Fecho, lerp, chaves } from '../leve/kit';
import { Cam, useTela, useFontesOk, rr, txt, cl, misturaCor } from './kit3';

export const DUR_R1 = 800;
const MERGULHO = 104;   // entra na tela
const VOLTA = 332;      // sai da tela
const MANHA = [520, 580];
const ROSA = '#FFD3FF';

type Notif = { f: number; app: string; cor: string; t: string };
const NOTIFS: Notif[] = [
  { f: 12, app: 'WhatsApp', cor: '#1DAA61', t: 'Oi! Tem horário sábado?' },
  { f: VOLTA, app: 'Agenda', cor: '#B600F6', t: 'Novo: Corte + barba · sáb 10:30' },
  { f: 440, app: 'Agenda', cor: '#B600F6', t: 'Novo: Barba · sáb 11:30' },
  { f: 474, app: 'Google', cor: '#F5A524', t: 'Nova avaliação ★★★★★' },
  { f: 504, app: 'Agenda', cor: '#B600F6', t: 'Novo: Corte · sáb 14:00' },
];

const hora = (f: number) => {
  if (f < MANHA[0]) return '02:47';
  const m = Math.round(cl(f, MANHA[0], MANHA[1], 2 * 60 + 47, 7 * 60, Easing.inOut(Easing.quad)));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

const Celular: React.FC<{ f: number; ok: boolean }> = ({ f, ok }) => {
  const manha = cl(f, MANHA[0], MANHA[1], 0, 1);
  const tex = useTela(540, 1166, (c) => {
    const acesa = f >= 10;
    if (!acesa) { rr(c, 0, 0, 540, 1166, 0, '#000'); return; }
    const g = c.createLinearGradient(0, 0, 0, 1166);
    g.addColorStop(0, misturaCor('#1B0533', '#3a1660', manha)); g.addColorStop(0.6, misturaCor('#4B0CA6', '#B44BD6', manha)); g.addColorStop(1, misturaCor('#9a2bd0', '#FFB98A', manha));
    rr(c, 0, 0, 540, 1166, 0, g);
    if (!ok) return;
    txt(c, 'sábado, 14 de novembro', 270, 150, 26, 600, 'rgba(255,255,255,.85)', 'center');
    txt(c, hora(f), 270, 300, 150, 800, '#fff', 'center');
    // notificações (mais nova em cima)
    const vis = NOTIFS.filter((n) => f >= n.f).reverse();
    if (manha > 0.6) {
      const a = Math.min(1, (manha - 0.6) / 0.3);
      c.globalAlpha = a;
      rr(c, 22, 380, 496, 170, 38, 'rgba(255,255,255,.92)');
      rr(c, 44, 412, 106, 106, 28, '#B600F6');
      txt(c, '3', 97, 490, 64, 800, '#fff', 'center');
      txt(c, 'Agenda', 172, 440, 26, 800, '#1B1322');
      txt(c, '3 novos agendamentos', 172, 480, 28, 700, '#2b2330');
      txt(c, 'enquanto você dormia', 172, 516, 24, 600, '#6F6679');
      c.globalAlpha = 1;
      return;
    }
    vis.forEach((n, i) => {
      const s = Math.min(1, (f - n.f) / 8);
      const y = 380 + i * 150 + (1 - s) * 60;
      if (y > 1100) return;
      c.globalAlpha = s;
      rr(c, 22, y, 496, 132, 34, 'rgba(255,255,255,.9)');
      rr(c, 42, y + 26, 80, 80, 22, n.cor);
      txt(c, n.app, 140, y + 56, 25, 800, '#1B1322');
      txt(c, 'agora', 498, y + 56, 21, 600, '#6F6679', 'right');
      txt(c, n.t, 140, y + 94, 25, 600, '#2b2330');
      c.globalAlpha = 1;
    });
  }, [f, ok]);
  const brilho = NOTIFS.reduce((a, n) => a + (f >= n.f ? Math.exp(-(f - n.f) / 10) : 0), 0);
  return (
    <group position={[0, 0.556, 0.03]} rotation={[-Math.PI / 2, 0, 0.18]}>
      <RoundedBox args={[0.075, 0.155, 0.009]} radius={0.004} smoothness={4} castShadow>
        <meshPhysicalMaterial color="#26232b" metalness={0.6} roughness={0.3} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0047]}>
        <planeGeometry args={[0.069, 0.149]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.12]} color="#c9a6ff" intensity={(f >= 10 ? 0.25 : 0) + brilho * 0.9} distance={1.6} decay={2} />
    </group>
  );
};

const Relogio: React.FC<{ f: number; ok: boolean }> = ({ f, ok }) => {
  const tex = useTela(320, 160, (c) => {
    rr(c, 0, 0, 320, 160, 0, '#0b0710');
    if (ok) txt(c, hora(f), 160, 112, 96, 800, f < MANHA[0] ? '#d68cff' : '#ffb36b', 'center');
  }, [f, ok]);
  return (
    <group position={[0.2, 0.6, -0.1]} rotation={[0, -0.35, 0]}>
      <RoundedBox args={[0.17, 0.09, 0.07]} radius={0.015} smoothness={4} castShadow>
        <meshStandardMaterial color="#e9e2ee" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0352]}><planeGeometry args={[0.13, 0.065]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <pointLight position={[0, 0, 0.08]} color={f < MANHA[0] ? '#b45cff' : '#ffb36b'} intensity={0.08} distance={0.6} />
    </group>
  );
};

const Quarto: React.FC<{ f: number; ok: boolean }> = ({ f, ok }) => {
  const m = cl(f, MANHA[0], MANHA[1], 0, 1);
  const resp = 1 + Math.sin(f / 22) * 0.035;
  const madeira = '#4a3348', pele = '#c9927a';
  return (
    <>
      <ambientLight intensity={0.32 + m * 0.3} color={misturaCor('#6f6aa8', '#ffd7b0', m)} />
      <directionalLight position={[2.2, 2.6, -0.6]} intensity={2.2 + m * 1.8} color={misturaCor('#8f9cff', '#ffb36b', m)} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[-2, 1.5, 2.5]} intensity={0.35 + m * 0.3} color={misturaCor('#b600f6', '#ffe1c4', m)} />
      {/* chão e parede */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><meshStandardMaterial color={misturaCor('#1d1520', '#5a4048', m)} roughness={0.85} /></mesh>
      <mesh position={[0, 2, -1.2]} receiveShadow><planeGeometry args={[12, 6]} /><meshStandardMaterial color={misturaCor('#3a2f52', '#c89aa2', m)} roughness={0.95} /></mesh>
      {/* janela */}
      <group position={[1.9, 1.55, -1.19]}>
        <mesh><planeGeometry args={[1.0, 1.25]} /><meshBasicMaterial color={misturaCor('#2a3a8a', '#ffcf8a', m)} toneMapped={false} /></mesh>
        <mesh position={[0, 0, 0.01]}><boxGeometry args={[0.04, 1.25, 0.02]} /><meshStandardMaterial color="#1b1420" /></mesh>
        <mesh position={[0, 0, 0.01]}><boxGeometry args={[1.0, 0.04, 0.02]} /><meshStandardMaterial color="#1b1420" /></mesh>
        <mesh position={[0.22, 0.3, 0.005]}><circleGeometry args={[0.09, 40]} /><meshBasicMaterial color={misturaCor('#f2f0ff', '#fff3d0', m)} toneMapped={false} transparent opacity={1 - m} /></mesh>
      </group>
      {/* criado-mudo */}
      <RoundedBox args={[0.55, 0.55, 0.45]} radius={0.03} smoothness={4} position={[0, 0.275, -0.05]} castShadow receiveShadow>
        <meshStandardMaterial color={madeira} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.3, 0.176]}><boxGeometry args={[0.46, 0.006, 0.004]} /><meshStandardMaterial color="#2c1e2b" /></mesh>
      <mesh position={[0, 0.39, 0.18]}><sphereGeometry args={[0.018, 20, 20]} /><meshStandardMaterial color="#c9a26a" metalness={0.8} roughness={0.3} /></mesh>
      {/* abajur */}
      <group position={[-0.16, 0.55, -0.15]}>
        <mesh position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.07, 0.08, 0.04, 32]} /><meshStandardMaterial color="#e9e2ee" roughness={0.5} /></mesh>
        <mesh position={[0, 0.17, 0]} castShadow><cylinderGeometry args={[0.012, 0.012, 0.26, 16]} /><meshStandardMaterial color="#c9a26a" metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0, 0.34, 0]} castShadow><cylinderGeometry args={[0.09, 0.15, 0.17, 40, 1, true]} /><meshStandardMaterial color="#f3e6f6" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      </group>
      {/* cama */}
      <RoundedBox args={[1.6, 1.0, 0.08]} radius={0.03} position={[1.15, 0.62, -1.12]} castShadow receiveShadow><meshStandardMaterial color={madeira} roughness={0.7} /></RoundedBox>
      <RoundedBox args={[1.5, 0.32, 2.0]} radius={0.04} position={[1.15, 0.2, -0.08]} castShadow receiveShadow><meshStandardMaterial color="#efe9f2" roughness={0.9} /></RoundedBox>
      <RoundedBox args={[0.62, 0.14, 0.36]} radius={0.06} smoothness={5} position={[0.9, 0.43, -0.82]} castShadow receiveShadow><meshStandardMaterial color="#ffffff" roughness={0.95} /></RoundedBox>
      <RoundedBox args={[0.62, 0.14, 0.36]} radius={0.06} smoothness={5} position={[1.45, 0.43, -0.84]} rotation={[0, 0.05, 0]} castShadow receiveShadow><meshStandardMaterial color="#ffffff" roughness={0.95} /></RoundedBox>
      {/* pessoa dormindo */}
      <group position={[0.9, 0.56, -0.74]} rotation={[0.2, 0.5, 0.35]}>
        <mesh castShadow><sphereGeometry args={[0.115, 40, 40]} /><meshStandardMaterial color={pele} roughness={0.75} /></mesh>
        <mesh position={[-0.02, 0.03, -0.035]} scale={[1.05, 1, 1.02]} castShadow><sphereGeometry args={[0.112, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshStandardMaterial color="#1e1418" roughness={0.8} /></mesh>
      </group>
      {/* cobertor com o corpo respirando */}
      <mesh position={[1.0, 0.38, -0.12]} scale={[0.33, 0.12 * resp, 0.66]} castShadow receiveShadow><sphereGeometry args={[1, 48, 48]} /><meshPhysicalMaterial color="#6a2fa0" roughness={0.85} sheen={1} sheenColor="#ff9cff" /></mesh>
      <RoundedBox args={[1.52, 0.1, 1.45]} radius={0.05} smoothness={4} position={[1.15, 0.37, 0.22]} castShadow receiveShadow><meshPhysicalMaterial color="#5b2490" roughness={0.9} sheen={1} sheenColor="#ff9cff" /></RoundedBox>
      {/* planta */}
      <group position={[2.65, 0, -0.85]}>
        <mesh position={[0, 0.16, 0]} castShadow><cylinderGeometry args={[0.13, 0.1, 0.32, 32]} /><meshStandardMaterial color="#e9e2ee" roughness={0.6} /></mesh>
        {[[0, 0.48, 0, 0.17], [0.1, 0.62, 0.05, 0.13], [-0.09, 0.6, -0.03, 0.12], [0.02, 0.76, 0, 0.1]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 24, 24]} /><meshStandardMaterial color="#2f6b4f" roughness={0.8} /></mesh>
        ))}
      </group>
      <Celular f={f} ok={ok} />
      <Relogio f={f} ok={ok} />
    </>
  );
};

// ── trecho 2D dentro da tela: o cliente agenda sozinho ──
const Fluxo: React.FC = () => {
  const f = useCurrentFrame(); // local
  const rol = chaves(f, [[14, 0], [62, 980]]);
  const ent = lerp(f, 0, 10, 1.18, 1);
  return (
    <AbsoluteFill style={{ transform: `scale(${ent})` }}>
      <FundoRoxo />
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t="Alguém achou a *sua página*." ini={4} tam={62} cor="#fff" acento={ROSA} fim={76} /></div>
      <Card x={130} y={330} w={820} h={1160} ini={0} fim={80} de="escala" raio={48} style={{ background: '#101a16' }}>
        <Img src={staticFile('telas/site_barbearia.png')} style={{ width: 820, position: 'absolute', left: 0, top: -rol * (820 / 700) }} />
        <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40 }}>
          <Surge ini={40} dy={60}><Botao texto="Agendar horário" em={70} h={110} tam={38} icone={<Icone n="agenda" tam={42} cor="#fff" traco={2} />} /></Surge>
        </div>
      </Card>
      <Toque ks={[{ f: 50, x: 820, y: 1700 }, { f: 66, x: 560, y: 1395 }]} toques={[70]} ini={50} fim={80} claro />
      <div style={{ position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t="Escolheu o *horário*." ini={88} tam={62} cor="#fff" acento={ROSA} fim={168} /></div>
      <Card x={110} y={540} w={860} ini={82} fim={170} de="giro" raio={44} style={{ padding: 44, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 46, color: P.ink }}>Corte + barba</div>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 30, color: P.fg2, marginTop: -16 }}>Navalha 13 · 50 min</div>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Sex', 'Sáb', 'Dom'].map((d, i) => <div key={d} style={{ flex: 1, padding: '20px 0', textAlign: 'center', borderRadius: 22, fontFamily: F, fontWeight: 800, fontSize: 32, background: f >= 104 && i === 1 ? P.el : '#F3EEF7', color: f >= 104 && i === 1 ? '#fff' : P.ink }}>{d}</div>)}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {['09:00', '10:30', '11:30'].map((h, i) => <div key={h} style={{ flex: 1, padding: '20px 0', textAlign: 'center', borderRadius: 22, fontFamily: F, fontWeight: 800, fontSize: 32, background: f >= 122 && i === 1 ? P.el : '#F3EEF7', color: f >= 122 && i === 1 ? '#fff' : P.ink }}>{h}</div>)}
        </div>
        <div style={{ border: `2px solid ${P.linha}`, borderRadius: 22, padding: '18px 24px', fontFamily: F }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: P.fg3 }}>NOME</div>
          <div style={{ minHeight: 42 }}><Digita t="Rafael" ini={130} vel={2} tam={36} peso={700} cursor={false} /></div>
        </div>
        <Botao texto="Confirmar horário" feito="Confirmado" em={152} h={108} tam={38} />
      </Card>
      <Toque ks={[{ f: 92, x: 800, y: 1500 }, { f: 102, x: 540, y: 865 }, { f: 118, x: 540, y: 990 }, { f: 146, x: 540, y: 1340 }]} toques={[104, 122, 152]} ini={92} fim={166} claro />
      <div style={{ position: 'absolute', top: 760, left: 455 }}><Check ini={172} tam={170} cor="#fff" fim={226} /></div>
      <svg style={{ position: 'absolute', left: 455, top: 760, width: 170, height: 170, opacity: f >= 178 && f < 226 ? 1 : 0 }} viewBox="0 0 100 100">
        <path d="M29 52 L44 66 L72 36" fill="none" stroke={P.el} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - lerp(f, 178, 192, 0, 1))} />
      </svg>
      <div style={{ position: 'absolute', top: 980, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t="Marcou *sozinho*." ini={180} tam={72} cor="#fff" acento={ROSA} fim={226} /></div>
    </AbsoluteFill>
  );
};

export const R1: React.FC = () => {
  const f = useCurrentFrame();
  const ok = useFontesOk();
  const ks = [
    { f: 0, p: [0, 1.0, 0.04], a: [0, 0.556, 0.03], fov: 34, rolo: 0.18 },
    { f: 70, p: [0, 0.9, 0.04], a: [0, 0.556, 0.03], fov: 34, rolo: 0.18 },
    { f: MERGULHO + 8, p: [0, 0.63, 0.032], a: [0, 0.556, 0.03], fov: 34, rolo: 0.18 },
    { f: VOLTA - 2, p: [0, 0.63, 0.032], a: [0, 0.556, 0.03], fov: 34, rolo: 0.18 },
    { f: VOLTA + 40, p: [0.06, 0.98, 0.32], a: [0.05, 0.556, 0.0], fov: 36, rolo: 0.05 },
    { f: 450, p: [-0.35, 1.45, 2.9], a: [0.65, 0.42, -0.35], fov: 42, rolo: 0 },
    { f: 600, p: [-0.15, 1.35, 2.75], a: [0.65, 0.42, -0.35], fov: 42, rolo: 0 },
    { f: 700, p: [0.05, 1.05, 1.5], a: [0.25, 0.5, -0.2], fov: 38, rolo: 0 },
    { f: DUR_R1, p: [0.05, 0.95, 1.2], a: [0.25, 0.5, -0.2], fov: 38, rolo: 0 },
  ] as any;
  const tres = f < MERGULHO + 10 || f >= VOLTA - 4;
  const o3 = Math.min(cl(f, MERGULHO, MERGULHO + 10, 1, 0), 1) + cl(f, VOLTA - 4, VOLTA + 8, 0, 1);
  const escuro = cl(f, 694, 712, 0, 0.72);
  return (
    <AbsoluteFill style={{ background: '#07050a' }}>
      {tres && ok && (
        <AbsoluteFill style={{ opacity: Math.min(1, o3) }}>
          <ThreeCanvas width={1080} height={1920} shadows camera={{ position: [0, 1, 0], fov: 34, near: 0.01, far: 50 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
            <color attach="background" args={[misturaCor('#07050a', '#3a2830', cl(f, MANHA[0], MANHA[1], 0, 1))]} />
            <Cam f={f} ks={ks} tremor={0.002} />
            <Quarto f={f} ok={ok} />
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      <Sequence from={MERGULHO} durationInFrames={VOLTA - MERGULHO + 6}>
        <AbsoluteFill style={{ opacity: Math.min(cl(f, MERGULHO, MERGULHO + 10, 0, 1), cl(f, VOLTA - 4, VOLTA + 6, 1, 0)) }}><Fluxo /></AbsoluteFill>
      </Sequence>
      {/* textos sobre o 3D */}
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Letras t="Sábado, 02:47." ini={20} tam={64} peso={700} cor="#fff" fim={98} /></div>
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t="E o dono?" ini={382} tam={86} peso={800} cor="#fff" fim={432} /></div>
      <div style={{ position: 'absolute', top: 240, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'Tava *dormindo*.'} ini={436} tam={110} peso={800} cor="#fff" acento={ROSA} fim={524} tracking={-0.045} /></div>
      <div style={{ position: 'absolute', top: 240, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'Acordou com a\n*agenda cheia*.'} ini={584} tam={92} peso={800} cor="#fff" acento={ROSA} fim={690} tracking={-0.045} /></div>
      <AbsoluteFill style={{ background: '#07050a', opacity: escuro }} />
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Texto t={'Sua página atende, mostra e agenda.\n*24 horas por dia.*'} ini={700} tam={60} peso={800} cor="#fff" acento={ROSA} fim={746} largura={980} /></div>
      {f >= 742 && <Fecho ini={748} frase="Enquanto você dorme, ela trabalha." claro={false} />}
    </AbsoluteFill>
  );
};
