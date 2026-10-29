import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

export type Feat = { k: string; a3?: string; nome?: string; g: any };

const cache: Record<string, Feat[]> = {};

export const useGeo = (id: string, nome?: string) => {
  const chave = `${id}/${nome}`;
  const [dados, setDados] = useState<Feat[] | null>(nome ? cache[chave] || null : []);
  const [h] = useState(() => (nome && !cache[chave] ? delayRender(`geo ${chave}`) : null));
  useEffect(() => {
    if (!nome || cache[chave]) return;
    fetch(staticFile(`v/${id}/${nome}`))
      .then((r) => r.json())
      .then((j) => {
        cache[chave] = j;
        setDados(j);
        if (h !== null) continueRender(h);
      });
  }, [chave, h, id, nome]);
  return dados;
};
