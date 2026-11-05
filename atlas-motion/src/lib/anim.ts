import { Easing, interpolate, spring } from 'remotion';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const EO = Easing.bezier(0.16, 1, 0.3, 1); // expo-out
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
export const ESO = Easing.bezier(0.33, 0, 0.2, 1);

/** 0..1 entre os quadros a e b, com easing */
export const prog = (f: number, a: number, b: number, ease = ESO) =>
  b <= a ? (f >= a ? 1 : 0) : interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const spr = (f: number, delay = 0, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: f - delay, fps: 30, config: { damping: 13, stiffness: 150, mass: 0.8, ...cfg } });

/** ruído suave determinístico (soma de senos) para câmera na mão */
export const wob = (t: number, seed = 0) =>
  Math.sin(t * 0.83 + seed * 1.7) * 0.5 + Math.sin(t * 1.37 + seed * 3.1) * 0.3 + Math.sin(t * 2.11 + seed * 5.3) * 0.2;

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const fmt = (v: number, dec = 0) =>
  v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** catmull-rom -> path SVG com cúbicas */
export const curva = (pts: [number, number][], tens = 0.5) => {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]}L${pts[1][0]},${pts[1][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tens * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tens * 2];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tens * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tens * 2];
    d += `C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
};

/** amostra uma catmull-rom densa (para cortar por comprimento) */
export const amostra = (pts: [number, number][], n = 24): [number, number][] => {
  if (pts.length < 3) {
    const out: [number, number][] = [];
    for (let i = 0; i <= n * 2; i++) {
      const u = i / (n * 2);
      out.push([lerp(pts[0][0], pts[1][0], u), lerp(pts[0][1], pts[1][1], u)]);
    }
    return out;
  }
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

/** corta polilinha na fração p do comprimento; devolve pontos e a ponta */
export const corta = (pts: [number, number][], p: number) => {
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const alvo = L[L.length - 1] * clamp(p);
  const out: [number, number][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= alvo) out.push(pts[i]);
    else {
      const u = (alvo - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]);
      break;
    }
  }
  const a = out[Math.max(0, out.length - 2)], b = out[out.length - 1];
  return { pts: out, ponta: b, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), total: L[L.length - 1] };
};

export const linha = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
