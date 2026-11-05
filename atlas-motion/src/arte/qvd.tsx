// Quanto Você Dura? — arquivo histórico: papel envelhecido, fotos de época com moldura, carimbos e mapa antigo.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import mundo from 'world-atlas/countries-110m.json';
import { W, H, FA, Objeto, Fita, Emoji, rasgado, sp, conta, prog, clamp, EO } from './comum';
import type { VProps } from './comum';

const OURO = '#e9c46a', TINTA = '#2a1d12', PAPEL = '#efe2c4', VERM = '#a8321f';

/** foto impressa com borda, fita e legenda datilografada; zoom lento dentro da moldura */
const Foto: React.FC<{ f: number; dur: number; arq: string; leg?: string; w?: number; ar?: number }> = ({ f, dur, arq, leg, w = 980, ar = 0.66 }) => {
  const z = 1.04 + 0.08 * clamp(f / Math.max(dur + 14, 1));
  return (
    <div style={{ background: '#f6efdf', padding: '26px 26px 0', width: w, boxShadow: 'inset 0 0 40px rgba(120,90,40,0.25)' }}>
      <div style={{ width: w - 52, height: (w - 52) * ar, overflow: 'hidden', background: '#2a2219' }}>
        <Img src={staticFile(`arte/qvd/${arq}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'sepia(0.55) contrast(1.08) brightness(0.96)' }} />
      </div>
      <div style={{ fontFamily: FA.maq, fontSize: 28, color: '#3b2c1d', padding: '16px 6px 20px', lineHeight: 1.25 }}>{leg}</div>
    </div>
  );
};

const Carimbo: React.FC<{ txt: string; cor?: string; tam?: number; sub?: string }> = ({ txt, cor = VERM, tam = 96, sub }) => (
  <div style={{ border: `9px double ${cor}`, borderRadius: 10, padding: '10px 34px', textAlign: 'center', color: cor, filter: 'url(#carimbo)' }}>
    <div style={{ fontFamily: FA.serif, fontWeight: 900, fontSize: tam, letterSpacing: 4, lineHeight: 1, whiteSpace: 'nowrap' }}>{txt}</div>
    {sub && <div style={{ fontFamily: FA.maq, fontSize: tam * 0.3, marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>}
  </div>
);

/** texto que aparece como se fosse datilografado */
const Datilo: React.FC<{ f: number; txt: string; ini?: number; cps?: number; style?: React.CSSProperties }> = ({ f, txt, ini = 0, cps = 1.6, style }) => {
  const n = Math.max(0, Math.floor((f - ini) * cps));
  return <div style={{ fontFamily: FA.maq, whiteSpace: 'pre-wrap', ...style }}>{txt.slice(0, n)}<span style={{ opacity: n < txt.length && Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span></div>;
};

const Folha: React.FC<{ w: number; children: React.ReactNode; pauta?: boolean }> = ({ w, children, pauta }) => (
  <div style={{ width: w, background: PAPEL, padding: '44px 56px 50px', clipPath: rasgado(7, 0.9, 30), filter: 'url(#grao-papel)', color: TINTA,
    backgroundImage: `radial-gradient(circle at 80% 20%, rgba(150,100,40,0.18), transparent 40%), radial-gradient(circle at 10% 90%, rgba(120,80,30,0.2), transparent 35%)${pauta ? ', repeating-linear-gradient(transparent 0 51px, rgba(90,60,30,0.18) 51px 53px)' : ''}` }}>
    {children}
  </div>
);

// mapa antigo do Brasil
const PAISES = (feature(mundo as any, (mundo as any).objects.countries) as any).features as any[];
const BR = PAISES.find((p) => p.id === '076');
const PROJ = geoMercator().fitExtent([[40, 40], [860, 820]], BR);
const PG = geoPath(PROJ);
const VIZ = PAISES.filter((p) => ['032', '068', '152', '170', '218', '254', '328', '600', '604', '740', '858', '862'].includes(p.id));
const ROTA: [number, number][] = [[-43.17, -22.9], [-39.5, -21], [-38.5, -13.5], [-35.2, -8.5], [-35.5, -5.2], [-41, -2.6], [-48.5, -1.4], [-51.5, -1.2], [-55, -2.3], [-60, -3.1], [-63, -4.4], [-66, -7.2], [-67.8, -9.97]];
const ROTA_P = ROTA.map((p) => PROJ(p) as [number, number]);

const MapaAntigo: React.FC<{ f: number; dur: number; txt: string }> = ({ f, dur, txt }) => {
  const p = prog(f, 10, Math.max(40, dur - 6), (x) => x);
  const comp = ROTA_P.reduce((s, q, i) => s + (i ? Math.hypot(q[0] - ROTA_P[i - 1][0], q[1] - ROTA_P[i - 1][1]) : 0), 0);
  // posição do navio ao longo da rota
  let alvo = comp * p, acc = 0, nav: [number, number] = ROTA_P[0];
  for (let i = 1; i < ROTA_P.length; i++) {
    const a = ROTA_P[i - 1], b = ROTA_P[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (acc + d >= alvo) { const u = (alvo - acc) / d; nav = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; break; }
    acc += d; nav = b;
  }
  const d = ROTA_P.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('');
  const rio = ROTA_P[0], acre = ROTA_P[ROTA_P.length - 1];
  return (
    <svg width={900} height={860}>
      <defs><pattern id="hach" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1={0} y1={0} x2={0} y2={8} stroke="rgba(90,60,30,0.35)" strokeWidth={1.4} /></pattern></defs>
      {VIZ.map((v) => <path key={v.id} d={PG(v) || ''} fill="url(#hach)" stroke="rgba(70,45,20,0.45)" strokeWidth={1.2} />)}
      <path d={PG(BR) || ''} fill="#e8d4a8" stroke={TINTA} strokeWidth={2.6} />
      <path d={d} fill="none" stroke={VERM} strokeWidth={4} strokeDasharray="12 10" strokeDashoffset={0} pathLength={1000}
        style={{ strokeDasharray: `${1000 * p} 1000` }} />
      <path d={d} fill="none" stroke={VERM} strokeWidth={4} strokeDasharray="10 12" opacity={0.0} />
      <circle cx={rio[0]} cy={rio[1]} r={11} fill={VERM} /><circle cx={acre[0]} cy={acre[1]} r={11} fill={VERM} opacity={clamp(p * 1.2 - 0.1)} />
      <text x={rio[0] + 18} y={rio[1] + 10} fontFamily={FA.serif} fontWeight={900} fontSize={38} fill={TINTA}>RIO</text>
      <text x={acre[0] - 10} y={acre[1] + 52} fontFamily={FA.serif} fontWeight={900} fontSize={38} fill={TINTA} opacity={clamp(p * 1.5)}>ACRE</text>
      <foreignObject x={nav[0] - 40} y={nav[1] - 66} width={80} height={80}><Emoji n="navio" tam={72} /></foreignObject>
      <text x={60} y={820} fontFamily={FA.maq} fontSize={22} fill="#5b4630">trajeto ilustrativo</text>
    </svg>
  );
};

const Cena: React.FC<VProps> = ({ f, dur, v }) => {
  const t = v.tipo;
  if (t === 'data') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={440} rot={-1.5} entra="cai" seed={1}>
      <Folha w={1300}>
        <div style={{ fontFamily: FA.maq, fontSize: 30, letterSpacing: 6, opacity: 0.7 }}>ARQUIVO · DOCUMENTO Nº 1</div>
        <div style={{ height: 3, background: TINTA, opacity: 0.6, margin: '14px 0 26px' }} />
        <Datilo f={f} txt={v.txt} ini={4} cps={1.3} style={{ fontSize: 116, lineHeight: 1.05 }} />
        <Datilo f={f} txt={v.sub} ini={18} cps={1.6} style={{ fontSize: 68, marginTop: 18 }} />
      </Folha>
    </Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 400} y={700} rot={-12} entra="carimbo" atraso={Math.round(dur * 0.55)} seed={2}><Carimbo txt="1904" tam={110} /></Objeto>
  </>);
  if (t === 'foto') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + (v.lado || 0)} y={450} rot={v.rot ?? -2.5} entra={v.entra || 'cai'} seed={v.seed || 3}>
      <Foto f={f} dur={dur} arq={v.arq} leg={v.leg} w={v.w || 1000} ar={v.ar || 0.62} />
    </Objeto>
    <Fita x={W / 2 + (v.lado || 0) - (v.w || 1000) / 2 + 30} y={130} rot={-38} w={170} /><Fita x={W / 2 + (v.lado || 0) + (v.w || 1000) / 2 - 30} y={130} rot={36} w={170} />
    {v.selo && <Objeto f={f} dur={dur} x={W / 2 + 470} y={700} rot={-9} entra="carimbo" atraso={Math.round(dur * (v.selo_em ?? 0.4))} seed={4}><Carimbo txt={v.selo} sub={v.selo_sub} tam={130} /></Objeto>}
  </>);
  if (t === 'bolso') return (<>
    <Objeto f={f} dur={dur} x={W / 2 - 200} y={440} rot={-6} entra="cai" seed={5}>
      <div style={{ background: '#f6efdf', padding: 40, clipPath: rasgado(5, 2.5, 16) }}><Emoji n="bolso" tam={300} style={{ filter: 'sepia(0.7)' }} /></div>
    </Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 330} y={360} rot={8} entra="carimbo" atraso={10} seed={6}><Carimbo txt="SEM DINHEIRO" tam={84} /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 300} y={560} rot={-5} entra="carimbo" atraso={Math.round(dur * 0.5)} seed={7}><Carimbo txt="SEM CONHECIDOS" tam={84} /></Objeto>
  </>);
  if (t === 'titulo') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={430} rot={-1} entra="cola" seed={8}>
      <div style={{ background: '#1f160e', padding: '36px 70px 40px', clipPath: rasgado(11, 1.6, 26), textAlign: 'center' }}>
        <div style={{ fontFamily: FA.serif, fontWeight: 900, fontSize: 150, lineHeight: 1.02, color: '#f6ead0', whiteSpace: 'pre-line' }}>{v.txt}</div>
        <div style={{ height: 8, background: OURO, margin: '24px auto 0', width: `${70 * prog(f, 6, 22, EO)}%` }} />
      </div>
    </Objeto>
  </>);
  if (t === 'documento') return (<>
    <Objeto f={f} dur={dur} x={W / 2 - 60} y={450} rot={1.5} entra="baixo" seed={9}>
      <Folha w={1200} pauta>
        <div style={{ fontFamily: FA.serif, fontWeight: 900, fontSize: 62, textAlign: 'center', lineHeight: 1.1 }}>{v.titulo}</div>
        <div style={{ height: 2, background: TINTA, margin: '20px 0 26px', opacity: 0.5 }} />
        <Datilo f={f} txt={v.txt} ini={10} cps={2.2} style={{ fontSize: 56, lineHeight: 1.45 }} />
      </Folha>
    </Objeto>
    {v.carimbo && <Objeto f={f} dur={dur} x={W / 2 + 330} y={680} rot={-14} entra="carimbo" atraso={Math.round(dur * 0.55)} seed={10}><Carimbo txt={v.carimbo} tam={110} /></Objeto>}
  </>);
  if (t === 'numero') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 60} y={430} rot={-2} entra="cai" seed={11}>
      <Folha w={820}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {v.icone && <Emoji n={v.icone} tam={200} style={{ filter: 'sepia(0.6)' }} />}
          <div style={{ fontFamily: FA.serif, fontWeight: 900, fontSize: 250, lineHeight: 1, color: VERM }}>{conta(v.txt, prog(f, 6, 30))}</div>
        </div>
        <div style={{ fontFamily: FA.maq, fontSize: 40, marginTop: 10 }}>{v.rotulo}</div>
      </Folha>
    </Objeto>
  </>);
  if (t === 'ficha') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={440} rot={-1.5} entra="cai" seed={12}>
      <Folha w={1000}>
        <div style={{ fontFamily: FA.maq, fontSize: 40, letterSpacing: 5 }}>REGISTRO DA REVOLTA</div>
        <div style={{ fontFamily: FA.maq, fontSize: 28, opacity: 0.7, marginBottom: 20 }}>{v.rodape}</div>
        {v.linhas.map(([k, n]: [string, string], i: number) => {
          const at = Math.round(dur * (0.12 + i * 0.26));
          return (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px dashed rgba(42,29,18,0.4)', padding: '10px 0', opacity: clamp((f - at) / 5) }}>
              <div style={{ fontFamily: FA.maq, fontSize: 52 }}>{k}</div>
              <div style={{ fontFamily: FA.serif, fontWeight: 900, fontSize: 96, color: VERM }}>{conta(n, prog(f, at, at + 18))}</div>
            </div>
          );
        })}
      </Folha>
    </Objeto>
  </>);
  if (t === 'mapa') return (<>
    <Objeto f={f} dur={dur} x={W / 2 - 60} y={480} rot={-2} entra="cai" seed={13}>
      <div style={{ background: '#ecdcb6', padding: 20, clipPath: rasgado(13, 1, 28), filter: 'url(#grao-papel)' }}><MapaAntigo f={f} dur={dur} txt={v.txt} /></div>
    </Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 610} y={430} rot={8} entra="carimbo" atraso={Math.round(dur * 0.35)} seed={14}><Carimbo txt={v.txt} sub={v.sub} tam={100} /></Objeto>
  </>);
  if (t === 'mesa') return (<>
    {v.fotos.map((a: string, i: number) => (
      <Objeto key={a} f={f} dur={dur} x={360 + i * 300} y={430 + (i % 2 ? 90 : -40)} rot={(i % 2 ? 7 : -6) + i} entra="cai" atraso={i * 6} seed={20 + i} sai={false}>
        <Foto f={f} dur={dur} arq={a} w={520} ar={0.7} />
      </Objeto>
    ))}
    <Objeto f={f} dur={dur} x={W / 2} y={170} rot={-2} entra="cola" atraso={34} seed={30} sai={false}><Carimbo txt={v.txt} tam={88} cor={TINTA} /></Objeto>
  </>);
  return null;
};

export const QVD = { Cena, superficie: 'velho' as const, legenda: 'serif' as const };
