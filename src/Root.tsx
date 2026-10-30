import React from 'react';
import { Composition } from 'remotion';
import { V1Previa, DUR_V1 } from './v/V1Previa';
import { V2Bio, DUR_V2 } from './v/V2Bio';
import { V3Edicao, DUR_V3 } from './v/V3Edicao';
import { V4Servicos, DUR_V4 } from './v/V4Servicos';

const soma = (a: number[]) => a.reduce((x, y) => x + y, 0);
const comp = (id: string, C: any, dur: number[]) => (
  <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={soma(dur)}
    defaultProps={{ dur }} calculateMetadata={({ props }: any) => ({ durationInFrames: soma(props.dur || dur) })} />
);
export const Root: React.FC = () => (
  <>
    {comp('V1Previa', V1Previa, DUR_V1)}
    {comp('V2Bio', V2Bio, DUR_V2)}
    {comp('V3Edicao', V3Edicao, DUR_V3)}
    {comp('V4Servicos', V4Servicos, DUR_V4)}
  </>
);
