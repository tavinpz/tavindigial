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
import { B52 } from './b52/B52';
import { B52v2 } from './b52/B52v2';
import { Crosswind01 } from './b52/Crosswind01';
import { Thumb } from './b52/Thumbs';
import temposCW01 from '../public/b52/tempos.json';
import { Crosswind02 } from './sr71/Crosswind02';
import { Thumb02 } from './sr71/Thumbs02';
import { Crosswind03 } from './a380/Crosswind03';
import { Thumb03 } from './a380/Thumbs03';
import temposCW03 from '../public/a380/tempos.json';
import temposCW02 from '../public/sr71/tempos.json';
import marcasB52v2 from '../public/b52/marcas2.json';
import marcasB52 from '../public/b52/marcas.json';
import { PickPals, PPMarca } from './pp/PickPals';
import { PP3D } from './pp/PP3D';
import { ToonTest } from './pp/Toon';
import { ToonEp } from './pp/ToonEp';
import { KitEp } from './pp/Eps';
import { PPBrand } from './pp/Brand';
import { Superficie } from './arte/comum';
const Tex: React.FC<{ tipo: any }> = ({ tipo }) => <Superficie tema={null as any} px={0} py={0} tipo={tipo} bruta />;

type P = { id: string; semAudio?: boolean; pre3d?: boolean; dados?: Dados };
const LongoComp: React.FC<{ dados: LDados; semAudio?: boolean }> = ({ dados, semAudio }) => <Longo dados={dados} semAudio={semAudio} />;

const Comp: React.FC<P> = ({ dados, semAudio, pre3d }) => <Short dados={dados!} semAudio={semAudio} pre3d={pre3d} />;
const G3: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => <Globe f={useCurrentFrame()} lat={lat} lon={lon} {...GLOBO} />;
const S3: React.FC<{ dur: number }> = ({ dur }) => <Salao3D f={useCurrentFrame() - 8} dur={dur} />;

export const Root: React.FC = () => (
  <>
    <Composition id="CWThumb" component={Thumb as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: 'a' }} />
    <Composition id="Crosswind03" component={Crosswind03 as any} durationInFrames={Math.ceil(temposCW03.total * 30)} fps={30} width={1920} height={1080} defaultProps={{ tempos: temposCW03 }} />
    <Composition id="CWThumb03" component={Thumb03 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: 'a' }} />
    <Composition id="CWThumb02" component={Thumb02 as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: 'a' }} />
    <Composition id="Crosswind02" component={Crosswind02 as any} durationInFrames={Math.ceil(temposCW02.total * 30)} fps={30} width={1920} height={1080} defaultProps={{ tempos: temposCW02 }} />
    <Composition id="Crosswind01" component={Crosswind01 as any} durationInFrames={Math.ceil(temposCW01.total * 30)} fps={30} width={1920} height={1080} defaultProps={{ tempos: temposCW01 }} />
    <Composition id="B52v2" component={B52v2 as any} durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{ marcas: marcasB52v2 }} />
    <Composition id="B52" component={B52 as any} durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{ marcas: marcasB52 }} />
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
    <Composition id="TexArte" component={Tex as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ tipo: 'escuro' }} />
    <Composition id="Capa" component={Capa as any} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: 'a' }} />
    <Composition id="LogoTTR" component={MarcaTTR as any} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: 'logo' }} />
    <Composition id="BannerTTR" component={MarcaTTR as any} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ v: 'banner' }} />
    <Composition id="Globo3D" component={G3} durationInFrames={60} fps={30} width={1080} height={1920} defaultProps={{ lat: 9, lon: -79.7 }} />
    <Composition id="Salao3D" component={S3 as any} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ dur: 220 }}
      calculateMetadata={async ({ props }: any) => ({ durationInFrames: props.n || 300 })} />
    <Composition id="PickPals" component={PickPals as any} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{ id: 'ep001', semAudio: true }}
      calculateMetadata={async ({ props }: any) => {
        const dados = await fetch(staticFile(`pp/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: dados.quadros, props: { ...props, dados } };
      }} />
    <Composition id="PPLogo" component={PPMarca as any} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: 'logo' }} />
    <Composition id="PPFicha" component={PPMarca as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'ficha' }} />
    <Composition id="PP3D" component={PP3D as any} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{ id: 'ep001b', semAudio: false }}
      calculateMetadata={async ({ props }: any) => {
        const dados = await fetch(staticFile(`pp/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: dados.quadros, props: { ...props, dados } };
      }} />
    <Composition id="ToonTest" component={ToonTest} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="ToonEp" component={ToonEp as any} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{ id: 'ep001b', semAudio: false }}
      calculateMetadata={async ({ props }: any) => {
        const dados = await fetch(staticFile(`pp/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: dados.quadros, props: { ...props, dados } };
      }} />
    <Composition id="KitEp" component={KitEp as any} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{ id: 'ep002', semAudio: false }}
      calculateMetadata={async ({ props }: any) => {
        const dados = await fetch(staticFile(`pp/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: dados.quadros, props: { ...props, dados } };
      }} />
    <Composition id="PPLogo2" component={PPBrand as any} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: 'logo' }} />
    <Composition id="PPBanner" component={PPBrand as any} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ v: 'banner' }} />
  </>
);
