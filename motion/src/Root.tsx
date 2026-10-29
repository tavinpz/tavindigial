import React from 'react';
import { Composition, staticFile, useCurrentFrame } from 'remotion';
import { Globe } from './scenes/Globe';
import { Salao3D } from './scenes/Salao';
import { GLOBO } from './Short';
import { Short } from './Short';
import type { Dados } from './lib/types';

type P = { id: string; semAudio?: boolean; pre3d?: boolean; dados?: Dados };

const Comp: React.FC<P> = ({ dados, semAudio, pre3d }) => <Short dados={dados!} semAudio={semAudio} pre3d={pre3d} />;
const G3: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => <Globe f={useCurrentFrame()} lat={lat} lon={lon} {...GLOBO} />;
const S3: React.FC<{ dur: number }> = ({ dur }) => <Salao3D f={useCurrentFrame() - 8} dur={dur} />;

export const Root: React.FC = () => (
  <>
    <Composition
      id="Short"
      component={Comp}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ id: '002', semAudio: true } as P}
      calculateMetadata={async ({ props }) => {
        const dados: Dados = await fetch(staticFile(`v/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: dados.quadros, props: { ...props, dados } };
      }}
    />
    <Composition id="Globo3D" component={G3} durationInFrames={60} fps={30} width={1080} height={1920} defaultProps={{ lat: 9, lon: -79.7 }} />
    <Composition id="Salao3D" component={S3 as any} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ dur: 220 }}
      calculateMetadata={async ({ props }: any) => ({ durationInFrames: props.n || 300 })} />
  </>
);
