import React from 'react';
import { CenaProps } from './lib';
import { CenaAeroportos, CenaAposta, CenaCorcunda, CenaFios, CenaGigante, CenaNascimento, CenaProvisoria, CenaQuatro, CenaSupersonico, CenaTitulo } from './cenasA';
import { CenaCarga, CenaCheio, CenaFinal, CenaGemeos, CenaHoje, CenaIronia, CenaMotores, CenaRede, CenaVirada } from './cenasB';

export { CenaProvisoria };
export const CENAS03: Record<string, React.FC<CenaProps>> = {
  gigante: CenaGigante, titulo: CenaTitulo, nascimento: CenaNascimento, supersonico: CenaSupersonico, corcunda: CenaCorcunda,
  quatro: CenaQuatro, aposta: CenaAposta, aeroportos: CenaAeroportos, fios: CenaFios, motores: CenaMotores, gemeos: CenaGemeos,
  rede: CenaRede, cheio: CenaCheio, virada: CenaVirada, carga: CenaCarga, ironia: CenaIronia, hoje: CenaHoje, final: CenaFinal,
};
