import React from 'react';
import { Composition } from 'remotion';
import { V1Previa, DUR_V1 } from './v/V1Previa';
import { V2Bio, DUR_V2 } from './v/V2Bio';
import { V3Edicao, DUR_V3 } from './v/V3Edicao';
import { V4Servicos, DUR_V4 } from './v/V4Servicos';
import { V5, V6, V7, CENAS_V5, CENAS_V6, CENAS_V7 } from './v/Dor1';
import { V8, V9, V10, CENAS_V8, CENAS_V9, CENAS_V10 } from './v/Dor2';
import { L1, DUR_L1 } from './leve/L1Agenda';
import { L2, DUR_L2 } from './leve/L2Caminho';
import { L3, DUR_L3 } from './leve/L3AntesDepois';
import { L4, DUR_L4 } from './leve/L4Motion';
import { L5, DUR_L5 } from './leve/L5Perto';
import { A1, DUR_A1 } from './apple/A1Bento';
import { A3, DUR_A3 } from './apple/A3Tipo';
import { A2, DUR_A2 } from './apple/A2Ilha';
import { A4, DUR_A4 } from './apple/A4Camadas';
import { A5, DUR_A5 } from './apple/A5Liquido';
import { Teste } from './tres/Teste';
import { R1, DUR_R1 } from './tres/R1Dormindo';
import { R2, DUR_R2 } from './tres/R2Luxo';
import { R3, DUR_R3 } from './tres/R3Loop';

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
    {comp('L2', L2, DUR_L2)}
    {comp('L3', L3, DUR_L3)}
    <Composition id="L4" component={L4} width={1080} height={1920} fps={30} durationInFrames={DUR_L4} />
    <Composition id="L5" component={L5} width={1080} height={1920} fps={30} durationInFrames={DUR_L5} />
    <Composition id="A1" component={A1} width={1080} height={1920} fps={30} durationInFrames={DUR_A1} />
    <Composition id="A3" component={A3} width={1080} height={1920} fps={30} durationInFrames={DUR_A3} />
    <Composition id="A2" component={A2} width={1080} height={1920} fps={30} durationInFrames={DUR_A2} />
    <Composition id="A4" component={A4} width={1080} height={1920} fps={30} durationInFrames={DUR_A4} />
    <Composition id="A5" component={A5} width={1080} height={1920} fps={30} durationInFrames={DUR_A5} />
    <Composition id="Teste" component={Teste} width={1080} height={1920} fps={30} durationInFrames={60} />
    <Composition id="R1" component={R1} width={1080} height={1920} fps={30} durationInFrames={DUR_R1} />
    <Composition id="R2" component={R2} width={1080} height={1920} fps={30} durationInFrames={DUR_R2} />
    <Composition id="R3" component={R3} width={1080} height={1920} fps={30} durationInFrames={DUR_R3} defaultProps={{ semCelular: false }} />
    <Composition id="L1" component={L1} width={1080} height={1920} fps={30} durationInFrames={DUR_L1} />
  </>
);
