import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

export const LW = 1920;
export const LH = 1080;

export const K = {
  bg: '#0d1016',
  bg2: '#131824',
  painel: '#171d2b',
  linha: '#2a3346',
  grade: '#1d2433',
  texto: '#f1f3f7',
  mudo: '#8a94a8',
  fraco: '#566078',
  sinal: '#ffd23f', // amarelo de destaque da marca
  bom: '#3ddc97',
  ruim: '#ff5d5d',
};

export const SET: Record<string, string> = {
  brown: '#9a6034',
  lightblue: '#8fd0f3',
  pink: '#e2449e',
  orange: '#ff9324',
  red: '#ef3b32',
  yellow: '#ffe14d',
  green: '#22b863',
  darkblue: '#2f7fd6',
  rr: '#c7ccd6',
  util: '#9aa3b5',
  neutro: '#c7ccd6',
};

export const FT = {
  disp: '"Space Grotesk", "Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
  sans: '"Inter", sans-serif',
};

export type LCena = Record<string, any> & { tipo: string };
export type LDados = {
  id: string;
  quadros: number;
  titulo: string;
  canal: string;
  blocos: { cena: LCena; ini: number; fim: number; marcos: number[] }[];
  capitulos: { n: number; ini: number }[];
};
export type LProps = { c: LCena; f: number; dur: number; marcos: number[]; id: string };

/** quadro (relativo à cena) em que a fala k começa; passos além do fim -> infinito */
export const marco = (m: number[], k: number) => (k < m.length ? m[k] : 1e9);

export const LOC = { l: 'en-US', parte: 'PART' };
export const fmtL = (v: number, dec = 0) => v.toLocaleString(LOC.l, { minimumFractionDigits: dec, maximumFractionDigits: dec });
