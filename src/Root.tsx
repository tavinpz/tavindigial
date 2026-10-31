import React from 'react';
import { Composition } from 'remotion';
import { T1, DUR_T1 } from './T1Madrugada';
import { T2, DUR_T2 } from './T2Ligacoes';
import { T3, DUR_T3 } from './T3Faltas';
import { T4, DUR_T4 } from './T4Caos';
import { T5, DUR_T5 } from './T5Base';

import { E1, DUR_E1 } from './E1Domingo';
import { C1, DUR_C1 } from './C1Almoco';
import { E2, DUR_E2 } from './E2Audio';
import { C2, DUR_C2 } from './C2Preco';
import { E3, DUR_E3 } from './E3PosConsulta';
import { C3, DUR_C3 } from './C3Caminho';
import { E4, DUR_E4 } from './E4Transito';
import { C4, DUR_C4 } from './C4Ferias';
import { E5, DUR_E5 } from './E5Aniversario';
import { C5, DUR_C5 } from './C5Medo';
import { N1, DUR_N1 } from './N1Cronometro';
import { N2, DUR_N2 } from './N2Lead';
import { N3, DUR_N3 } from './N3Dicionario';
import { N4, DUR_N4 } from './N4Espera';
import { N5, DUR_N5 } from './N5Relogio';
import { N6, DUR_N6 } from './N6AntesDepois';
import { N7, DUR_N7 } from './N7Lista';
import { N8, DUR_N8 } from './N8Ingles';
const V = { fps: 30, width: 1080, height: 1920 };
export const Root: React.FC = () => (
  <>
    <Composition id="T1" component={T1} durationInFrames={DUR_T1} {...V} />
    <Composition id="T2" component={T2} durationInFrames={DUR_T2} {...V} />
    <Composition id="T3" component={T3} durationInFrames={DUR_T3} {...V} />
    <Composition id="T4" component={T4} durationInFrames={DUR_T4} {...V} />
    <Composition id="T5" component={T5} durationInFrames={DUR_T5} {...V} />
    <Composition id="E1" component={E1} durationInFrames={DUR_E1} {...V} />
    <Composition id="C1" component={C1} durationInFrames={DUR_C1} {...V} />
    <Composition id="E2" component={E2} durationInFrames={DUR_E2} {...V} />
    <Composition id="C2" component={C2} durationInFrames={DUR_C2} {...V} />
    <Composition id="E3" component={E3} durationInFrames={DUR_E3} {...V} />
    <Composition id="C3" component={C3} durationInFrames={DUR_C3} {...V} />
    <Composition id="E4" component={E4} durationInFrames={DUR_E4} {...V} />
    <Composition id="C4" component={C4} durationInFrames={DUR_C4} {...V} />
    <Composition id="E5" component={E5} durationInFrames={DUR_E5} {...V} />
    <Composition id="C5" component={C5} durationInFrames={DUR_C5} {...V} />
    <Composition id="N1" component={N1} durationInFrames={DUR_N1} {...V} />
    <Composition id="N2" component={N2} durationInFrames={DUR_N2} {...V} />
    <Composition id="N3" component={N3} durationInFrames={DUR_N3} {...V} />
    <Composition id="N4" component={N4} durationInFrames={DUR_N4} {...V} />
    <Composition id="N5" component={N5} durationInFrames={DUR_N5} {...V} />
    <Composition id="N6" component={N6} durationInFrames={DUR_N6} {...V} />
    <Composition id="N7" component={N7} durationInFrames={DUR_N7} {...V} />
    <Composition id="N8" component={N8} durationInFrames={DUR_N8} {...V} />
  </>
);
