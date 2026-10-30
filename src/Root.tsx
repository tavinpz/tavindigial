import React from 'react';
import { Composition } from 'remotion';
import { V1Previa, DUR_V1 } from './v/V1Previa';
import { V2Bio, DUR_V2 } from './v/V2Bio';
import { V3Edicao, DUR_V3 } from './v/V3Edicao';
import { V4Servicos, DUR_V4 } from './v/V4Servicos';
import { V5, V6, V7, CENAS_V5, CENAS_V6, CENAS_V7 } from './v/Dor1';
import { V8, V9, V10, CENAS_V8, CENAS_V9, CENAS_V10 } from './v/Dor2';

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
    {comp('V5', V5, CENAS_V5.map((c) => c.d))}
    {comp('V6', V6, CENAS_V6.map((c) => c.d))}
    {comp('V7', V7, CENAS_V7.map((c) => c.d))}
    {comp('V8', V8, CENAS_V8.map((c) => c.d))}
    {comp('V9', V9, CENAS_V9.map((c) => c.d))}
    {comp('V10', V10, CENAS_V10.map((c) => c.d))}
  </>
);
