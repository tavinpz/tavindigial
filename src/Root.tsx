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
import { P1, DUR_P1 } from './P1Funil';
import { P2, DUR_P2 } from './P2Round';
import { P3, DUR_P3 } from './P3Enquanto';
import { P4, DUR_P4 } from './P4Ferramentas';
import { P5, DUR_P5 } from './P5Recibo';
import { P6, DUR_P6 } from './P6Perfil';
import { Q1, DUR_Q1 } from './Q1Chuva';
import { Q2, DUR_Q2 } from './Q2Pergunta';
import { Q3, DUR_Q3 } from './Q3Retorno';
import { Q4, DUR_Q4 } from './Q4Luvas';
import { R1, DUR_R1 } from './R1PostIt';
import { R2, DUR_R2 } from './R2Balcao';
import { R3, DUR_R3 } from './R3Confirma';
import { S1, DUR_S1 } from './S1Bastidor';
import { S2, DUR_S2 } from './S2Lista';
import { S3, DUR_S3 } from './S3Planilha';
import { S4, DUR_S4 } from './S4Quadro';
import { S5, DUR_S5 } from './S5Origem';
import { S6, DUR_S6 } from './S6Painel';
import { F1, DUR_F1 } from './F1WhatsApp';
import { F2, DUR_F2 } from './F2Integracoes';
import { F3, DUR_F3 } from './F3Campanha';
import { F4, DUR_F4 } from './F4Cadencia';
import { F5, DUR_F5 } from './F5Lembretes';
import { F6, DUR_F6 } from './F6Retornos';
import { F7, DUR_F7 } from './F7Pipeline';
import { F8, DUR_F8 } from './F8Mensagens';
import { F9, DUR_F9 } from './F9Ligacoes';
import { F10, DUR_F10 } from './F10Assistente';
import { F11, DUR_F11 } from './F11Agenda';
import { F12, DUR_F12 } from './F12Importar';
import { F13, DUR_F13 } from './F13Equipe';
import { F14, DUR_F14 } from './F14Dashboard';
import { F15, DUR_F15 } from './F15Anuncios';
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
    <Composition id="P1" component={P1} durationInFrames={DUR_P1} {...V} />
    <Composition id="P2" component={P2} durationInFrames={DUR_P2} {...V} />
    <Composition id="P3" component={P3} durationInFrames={DUR_P3} {...V} />
    <Composition id="P4" component={P4} durationInFrames={DUR_P4} {...V} />
    <Composition id="P5" component={P5} durationInFrames={DUR_P5} {...V} />
    <Composition id="P6" component={P6} durationInFrames={DUR_P6} {...V} />
    <Composition id="Q1" component={Q1} durationInFrames={DUR_Q1} {...V} />
    <Composition id="Q2" component={Q2} durationInFrames={DUR_Q2} {...V} />
    <Composition id="Q3" component={Q3} durationInFrames={DUR_Q3} {...V} />
    <Composition id="Q4" component={Q4} durationInFrames={DUR_Q4} {...V} />
    <Composition id="R1" component={R1} durationInFrames={DUR_R1} {...V} />
    <Composition id="R2" component={R2} durationInFrames={DUR_R2} {...V} />
    <Composition id="R3" component={R3} durationInFrames={DUR_R3} {...V} />
    <Composition id="S1" component={S1} durationInFrames={DUR_S1} {...V} />
    <Composition id="S2" component={S2} durationInFrames={DUR_S2} {...V} />
    <Composition id="S3" component={S3} durationInFrames={DUR_S3} {...V} />
    <Composition id="S4" component={S4} durationInFrames={DUR_S4} {...V} />
    <Composition id="S5" component={S5} durationInFrames={DUR_S5} {...V} />
    <Composition id="S6" component={S6} durationInFrames={DUR_S6} {...V} />
    <Composition id="F1" component={F1} durationInFrames={DUR_F1} {...V} />
    <Composition id="F2" component={F2} durationInFrames={DUR_F2} {...V} />
    <Composition id="F3" component={F3} durationInFrames={DUR_F3} {...V} />
    <Composition id="F4" component={F4} durationInFrames={DUR_F4} {...V} />
    <Composition id="F5" component={F5} durationInFrames={DUR_F5} {...V} />
    <Composition id="F6" component={F6} durationInFrames={DUR_F6} {...V} />
    <Composition id="F7" component={F7} durationInFrames={DUR_F7} {...V} />
    <Composition id="F8" component={F8} durationInFrames={DUR_F8} {...V} />
    <Composition id="F9" component={F9} durationInFrames={DUR_F9} {...V} />
    <Composition id="F10" component={F10} durationInFrames={DUR_F10} {...V} />
    <Composition id="F11" component={F11} durationInFrames={DUR_F11} {...V} />
    <Composition id="F12" component={F12} durationInFrames={DUR_F12} {...V} />
    <Composition id="F13" component={F13} durationInFrames={DUR_F13} {...V} />
    <Composition id="F14" component={F14} durationInFrames={DUR_F14} {...V} />
    <Composition id="F15" component={F15} durationInFrames={DUR_F15} {...V} />
  </>
);
