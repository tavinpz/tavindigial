// Efeitos sonoros de cada vídeo (em quadros). Puro: sem React, para o node ler.
export const BUSCA_L1 = 'barbearia perto de mim';
type Fx = [string, number][];
const teclas = (t: string, ini: number, vel = 2): Fx => Array.from(t).map((c, i) => [c === ' ' ? '' : 'tecla', ini + i * vel] as [string, number]).filter((x) => x[0]);
export const inicios = (dur: number[]) => { let t = 0; return dur.map((d) => { const i = t; t += d; return i; }); };

export const FX: Record<string, (p: any) => Fx> = {
  L1: () => [
    ['pop', 90], ...teclas(BUSCA_L1, 112), ['toque', 168],
    ['swish', 200], ['pop', 208], ['pop', 216], ['pop', 224], ['toque', 300], ['swish', 306],
    ['pop', 380], ['toque', 432], ['swish', 460], ...teclas('Sáb, 14/11', 476), ...teclas('10:30', 494), ...teclas('Rafael', 512),
    ['toque', 548], ['chime', 576], ['swish', 648], ['sobe', 726], ['logo', 726],
  ],
};

// ── utilidades puras (iguais às do Remotion) ──
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a, B = (a: number, b: number) => 3 * b - 6 * a, C = (a: number) => 3 * a;
  const calc = (t: number, a: number, b: number) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x: number) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (calc(t, x1, x2) - x) / s; }
    let lo = 0, hi = 1; for (let i = 0; i < 20 && Math.abs(calc(t, x1, x2) - x) > 1e-5; i++) { if (calc(t, x1, x2) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return calc(t, y1, y2);
  };
}
export function interp(f: number, ks: [number, number][], e: (x: number) => number) {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (f <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return va + (vb - va) * e((f - a) / Math.max(1e-6, b - a)); }
  return ks[ks.length - 1][1];
}

// L2: posição do ponto e chegada em cada passo
export const L2_PASSOS_X = [700, 1350, 2000, 2650, 3300, 3950];
export const L2_FIM_X = 4300;
const eL2 = bezier(0.45, 0, 0.3, 1);
export function l2x(f: number, dur: number[]) {
  const I = inicios(dur);
  const ks: [number, number][] = [[I[0] + 16, 80], [I[0] + 40, 160], [I[1], 200], [I[2] - 8, 1460], [I[3] - 8, 2760], [I[4] - 10, 4080], [I[4] + 30, L2_FIM_X]];
  return interp(f, ks, eL2);
}
export function l2Chega(dur: number[]) {
  const fim = inicios(dur)[6];
  return L2_PASSOS_X.map((px) => { for (let q = 0; q < fim; q++) if (l2x(q, dur) >= px - 140) return q; return fim; });
}
FX.L2 = (p: any) => {
  const dur: number[] = p.dur; const I = inicios(dur);
  return [
    ['pop', I[0] + 14], ...l2Chega(dur).map((q) => ['pop', q] as [string, number]),
    ['swish', I[4] + 6], ['toque', I[4] + 44], ['toque', I[4] + 50], ['chime', I[5] + 14],
    ['swish', I[5] + 60], ['pop', I[5] + 82], ['pop', I[5] + 100], ['pop', I[5] + 118], ['pop', I[5] + 136],
    ['sobe', I[6]], ['logo', I[6]],
  ];
};
FX.L3 = (p: any) => {
  const I = inicios(p.dur);
  return [
    ['swish', 4], ['pop', I[1] + 20], ['pop', I[1] + 34], ['pop', I[1] + 48], ['sobe', I[2] + 30], ['swish', I[2] + 30],
    ['pop', I[3] + 10], ['pop', I[3] + 26], ['pop', I[3] + 42], ['chime', I[4] + 14], ['sobe', I[5] + 4], ['logo', I[5] + 4],
  ];
};
FX.L4 = () => [
  ['swish', 18], ['pop', 26], ['swish', 50], ['pop', 86], ['pop', 96], ['pop', 99], ['pop', 102], ['pop', 105], ['pop', 108], ['pop', 111],
  ['swish', 152], ['sobe', 176], ['swish', 182], ['swish', 248], ['pop', 256], ['sobe', 350], ['swish', 352], ['chime', 366],
  ['pop', 388], ['pop', 394], ['pop', 400], ['pop', 406], ['pop', 412], ['sobe', 468], ['logo', 468],
];
export const PERGUNTA_L5 = 'Onde fazer limpeza de pele perto de Moema?';
FX.L5 = () => [
  ['swish', 2], ['pop', 30], ['pop', 52], ['pop', 57], ['pop', 62], ['pop', 67], ['pop', 72], ['pop', 112], ['swish', 128],
  ['swish', 158], ['pop', 174], ['pop', 178], ['pop', 182], ['swish', 270], ...teclas(PERGUNTA_L5, 290, 1).filter((_, i) => i % 2 === 0),
  ['pop', 352], ['chime', 372], ['swish', 444], ['pop', 466], ['pop', 472], ['pop', 478], ['pop', 484], ['sobe', 528], ['logo', 528],
];

// ── lote 4 (keynote) ──
const passos = (ini: number, n: number, cada: number, tipo = 'pop'): Fx => Array.from({ length: n }, (_, i) => [tipo, ini + i * cada] as [string, number]);
FX.A1 = () => [['swish', 46], ...passos(62, 5, 6), ['vidro', 96], ['swish', 252], ['brilho', 262], ['swish', 306], ['grave', 366], ['sobe', 430], ['logo', 430]];
FX.A2 = () => [['swish', 2], ['vidro', 48], ...passos(96, 7, 15), ['swish', 210], ['brilho', 250], ['swish', 326], ['sobe', 340], ['logo', 340]];
FX.A3 = () => [['swish', 56], ...passos(60, 8, 15, 'toque'), ['grave', 195], ['brilho', 204], ['swish', 268], ['pop', 278], ['sobe', 398], ['logo', 398]];
FX.A4 = () => [['swish', 4], ['vidro', 62], ['swish', 122], ['brilho', 186], ...passos(186, 5, 6), ['swish', 262], ['toque', 324], ['chime', 330], ['sobe', 368], ['logo', 368]];
FX.A5 = () => [['pop', 12], ['pop', 18], ['swish', 58], ['grave', 98], ['vidro', 128], ...passos(186, 5, 4), ['swish', 214], ['toque', 296], ['toque', 306], ['toque', 316], ['swish', 360], ...passos(362, 4, 5), ['sobe', 448], ['logo', 448]];
