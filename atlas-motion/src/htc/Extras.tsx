import React from 'react';
import { D02 } from './D02';
import { D03 } from './D03';
import { D04 } from './D04';
import { D05 } from './D05';
// Diagramas feitos sob medida para cada vídeo (hc002 em diante). Cada arquivo D0N.tsx exporta o seu conjunto.
export const EXTRA: Record<string, React.FC<any>> = { ...D02, ...D03, ...D04, ...D05 };
