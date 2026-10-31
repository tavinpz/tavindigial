// Kit 3D real (three.js via @remotion/three): texturas, telas desenhadas por quadro, câmera por keyframes
import React, { useEffect, useMemo, useState } from 'react';
import { continueRender, delayRender, interpolate, staticFile, Easing } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import '../marca';

export const ioE = Easing.bezier(0.65, 0, 0.35, 1);
export const lin = (f: number, ks: [number, number][], e: (t: number) => number = ioE) =>
  ks.length === 1 ? ks[0][1] : interpolate(f, ks.map((k) => k[0]), ks.map((k) => k[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const cl = (f: number, a: number, b: number, x: number, y: number, e: (t: number) => number = ioE) =>
  interpolate(f, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

// textura de imagem (espera carregar)
export const useTex = (src: string) => {
  const [t, setT] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('tex ' + src));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile(src), (x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; setT(x); continueRender(h); }, undefined, () => continueRender(h));
  }, []);
  return t;
};

// espera as fontes antes de desenhar texto no canvas
export const useFontesOk = () => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('fontes-3d'));
  useEffect(() => { (document as any).fonts.ready.then(() => setTimeout(() => { setOk(true); continueRender(h); }, 60)); }, []);
  return ok;
};

// tela desenhada em canvas 2D a cada quadro → textura
export const useTela = (w: number, h: number, desenha: (c: CanvasRenderingContext2D) => void, deps: any[]) => {
  const { cv, tex } = useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return { cv, tex };
  }, []);
  const c = cv.getContext('2d')!;
  c.clearRect(0, 0, w, h);
  desenha(c);
  tex.needsUpdate = true;
  void deps;
  return tex;
};

// câmera por keyframes: [{f, p:[x,y,z], a:[alvo], fov, up}]
export type ChaveCam = { f: number; p: [number, number, number]; a: [number, number, number]; fov?: number; rolo?: number };
export const Cam: React.FC<{ f: number; ks: ChaveCam[]; e?: (t: number) => number; tremor?: number }> = ({ f, ks, e = ioE, tremor = 0 }) => {
  const { camera } = useThree();
  const g = (sel: (k: ChaveCam) => number) => lin(f, ks.map((k) => [k.f, sel(k)] as [number, number]), e);
  const p = [g((k) => k.p[0]), g((k) => k.p[1]), g((k) => k.p[2])];
  const a = [g((k) => k.a[0]), g((k) => k.a[1]), g((k) => k.a[2])];
  const rolo = g((k) => k.rolo ?? 0);
  const fov = g((k) => k.fov ?? 35);
  const tx = tremor * (Math.sin(f / 13) * 0.6 + Math.sin(f / 7.3) * 0.4), ty = tremor * Math.cos(f / 11) * 0.7;
  camera.position.set(p[0] + tx, p[1] + ty, p[2]);
  // "up" girado pelo rolo em torno do eixo de visão
  const dir = new THREE.Vector3(a[0] - p[0], a[1] - p[1], a[2] - p[2]).normalize();
  const base = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
  base.applyAxisAngle(dir, rolo);
  camera.up.copy(base);
  camera.lookAt(a[0] + tx, a[1] + ty, a[2]);
  (camera as THREE.PerspectiveCamera).fov = fov;
  camera.updateProjectionMatrix();
  return null;
};

// desenho: retângulo arredondado preenchido
export const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) => {
  c.beginPath(); (c as any).roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill();
};
export const txt = (c: CanvasRenderingContext2D, t: string, x: number, y: number, tam: number, peso: number, cor: string, alinhar: CanvasTextAlign = 'left', fonte = 'Urbanist') => {
  c.font = `${peso} ${tam}px ${fonte}`; c.fillStyle = cor; c.textAlign = alinhar; c.textBaseline = 'alphabetic'; c.fillText(t, x, y);
};
export const misturaCor = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t))).getHexString();
