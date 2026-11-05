import React from 'react';
import { Composition, staticFile, useCurrentFrame } from 'remotion';
import { Globe } from './scenes/Globe';
import { Salao3D } from './scenes/Salao';
import { GLOBO } from './Short';
import { Short } from './Short';
import type { Dados } from './lib/types';

import { Longo } from './longo/Longo';
import { Capa, MarcaTTR } from './longo/Capa';
import type { LDados } from './longo/tema';
import { Arte } from './arte/Arte';

type P = { id: string; semAudio?: boolean; pre3d?: boolean; dados?: Dados };
const LongoComp: React.FC<{ dados: LDados; semAudio?: boolean }> = ({ dados, semAudio }) => <Longo dados={dados} semAudio={semAudio} />;

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
    <Composition
      id="Longo"
      component={LongoComp as any}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ id: 'ttr001', semAudio: true }}
      calculateMetadata={async ({ props }: any) => {
        const dados: LDados = await fetch(staticFile(`l/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: props.n || dados.quadros, props: { ...props, dados } };
      }}
    />
    <Composition
      id="Arte"
      component={Arte as any}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ id: 'lss001t', semAudio: true }}
      calculateMetadata={async ({ props }: any) => {
        const dados = await fetch(staticFile(`l/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: props.n || dados.quadros, props: { ...props, dados } };
      }}
    />
    <Composition id="Capa" component={Capa as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: 'a' }} />
    <Composition id="LogoTTR" component={MarcaTTR as any} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: 'logo' }} />
    <Composition id="BannerTTR" component={MarcaTTR as any} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ v: 'banner' }} />
    <Composition id="Globo3D" component={G3} durationInFrames={60} fps={30} width={1080} height={1920} defaultProps={{ lat: 9, lon: -79.7 }} />
    <Composition id="Salao3D" component={S3 as any} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ dur: 220 }}
      calculateMetadata={async ({ props }: any) => ({ durationInFrames: props.n || 300 })} />
  </>
);
