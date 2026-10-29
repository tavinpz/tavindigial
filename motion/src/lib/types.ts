export type Cena = Record<string, any> & { tipo: string };
export type Tempo = { ini: number; fala: number; dur_fala: number; fim: number };
export type Palavra = { w: string; t0: number; t1: number; cena: number };
export type Dados = {
  id: string;
  fps: number;
  total: number;
  quadros: number;
  titulo: string;
  cenas: Cena[];
  tempos: Tempo[];
  palavras: Palavra[];
  geo: Record<string, string>;
};

/** props que toda cena recebe */
export type CenaProps = { c: Cena; f: number; dur: number; id: string; idx: number; geo?: string; temGlobo?: boolean; pre3d?: boolean };
