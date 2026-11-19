import React from 'react';
import { Easing, interpolate, spring } from 'remotion';
import { MONO, P, TIT } from './lib';

// Peças comuns aos diagramas do Hard to Copy (mesmas do Video.tsx, separadas para os arquivos de diagramas novos).
export type V = Record<string, any>;
// g = quadro dentro do bloco; a(n) = 0→1 a partir do passo n; q(n) = quadro em que o passo n começou; t0 = quadro em que o diagrama entrou
export type Ctx = { g: number; v: V; a: (n: number, dur?: number, atraso?: number) => number; q: (n: number) => number; t0: number; quando: (p: (e: V) => boolean) => number };
export const ease = Easing.bezier(0.3, 0, 0.15, 1);
export const L = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const pop = (f: number, ini: number) => (f < ini ? 0 : Math.min(1.15, spring({ frame: f - ini, fps: 30, config: { damping: 14, stiffness: 180 } })));
export const COR: Record<string, string> = { menta: P.menta, ambar: P.ambar, osso: P.osso, verm: P.verm, luz: P.luz, cinza: P.cinza, fantasma: P.fantasma };
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const Txt: React.FC<any> = ({ f = TIT, w = 700, s = 40, c = P.osso, ls, children, ...r }) => <text fontFamily={f} fontWeight={w} fontSize={s} fill={c} letterSpacing={ls ?? (f === TIT ? -s * 0.025 : f === MONO ? 2 : 0)} {...r}>{children}</text>;
// tamanho de fonte que cabe numa largura (aproximação: 0.56 em por caractere no Space Grotesk 700)
export const cabe = (t: string, larg: number, max: number, k = 0.56) => Math.min(max, larg / (k * Math.max(1, t.length)));
