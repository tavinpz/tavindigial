import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import topo from './estados-simples.json';
import { K, FT, LW, LH, marco, fmtL, LOC } from './tema';
import type { LProps } from './tema';
import { prog, spr, wob, EO, EIO, lerp, clamp, fmt } from '../lib/anim';

const ESTADOS: any[] = (feature(topo as any, (topo as any).objects.states) as any).features.filter((f: any) => f.properties.name !== 'District of Columbia' && f.properties.name !== 'Puerto Rico');
const PATH = geoPath(null as any);
const D: Record<string, string> = {};
const CENTRO: Record<string, [number, number]> = {};
const CAIXA: Record<string, [[number, number], [number, number]]> = {};
ESTADOS.forEach((f) => { D[f.properties.name] = PATH(f) || ''; CENTRO[f.properties.name] = PATH.centroid(f) as any; CAIXA[f.properties.name] = PATH.bounds(f) as any; });

/** escala quente: 0 -> azul-acinzentado calmo, 1 -> vermelho alarme */
export const quente = (t: number) => {
  const st = [[70, 110, 150], [120, 130, 140], [230, 160, 60], [235, 70, 50], [190, 25, 40]];
  const x = clamp(t) * (st.length - 1);
  const i = Math.min(st.length - 2, Math.floor(x)), u = x - i;
  const c = st[i].map((v, k) => Math.round(v + (st[i + 1][k] - v) * u));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

type Est = { nome: string; v: number; rank: number };

/** mapa dos EUA (975x610 Albers) com câmera, coroplético e foco */
export const Mapa: React.FC<{ f: number; dados: Est[]; mostra: (e: Est) => number; foco?: string[]; zoom?: string; pZoom?: number; x?: number; y?: number; w?: number; min: number; max: number; rotulos?: boolean }> = ({ f, dados, mostra, foco, zoom, pZoom = 0, x = 100, y = 120, w = 1300, min, max, rotulos }) => {
  const esc = w / 975;
  let tx = 0, ty = 0, s = 1;
  if (zoom && CAIXA[zoom]) {
    const [[x0, y0], [x1, y1]] = CAIXA[zoom];
    const alvoS = Math.min(3.2, 0.55 * 975 / Math.max(x1 - x0, (y1 - y0) * 1.6));
    s = lerp(1, alvoS, pZoom);
    tx = lerp(0, 487 - (x0 + x1) / 2, pZoom); ty = lerp(0, 305 - (y0 + y1) / 2, pZoom);
  }
  const t = f / 30;
  const por: Record<string, Est> = {};
  dados.forEach((d) => (por[d.nome] = d));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 610 * esc }}>
      <svg width={w} height={610 * esc} viewBox="0 0 975 610" style={{ overflow: 'visible' }}>
        <g transform={`translate(487 305) scale(${s}) translate(${-487 + tx + wob(t * 0.3, 1) * 1.5} ${-305 + ty + wob(t * 0.25, 2) * 1.5})`}>
          {ESTADOS.map((ft) => {
            const n = ft.properties.name;
            const e = por[n];
            const p = e ? mostra(e) : 0;
            const cor = e ? quente((e.v - min) / (max - min)) : '#2a3346';
            const dim = foco && foco.length && !foco.includes(n) ? 0.28 : 1;
            return <path key={n} d={D[n]} fill={p > 0 ? cor : '#222a3a'} fillOpacity={p > 0 ? (0.25 + 0.75 * p) * dim : 0.9} stroke={foco && foco.includes(n) ? '#fff' : '#0d1016'} strokeWidth={(foco && foco.includes(n) ? 2.4 : 0.9) / s} />;
          })}
          {rotulos && dados.filter((e) => mostra(e) > 0.9 && (!foco || !foco.length || foco.includes(e.nome))).map((e) => (
            <text key={e.nome} x={CENTRO[e.nome][0]} y={CENTRO[e.nome][1] + 5} textAnchor="middle" fontFamily={FT.mono} fontWeight={700} fontSize={13 / s} fill="#fff" style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 3 / s }}>#{e.rank}</text>
          ))}
        </g>
      </svg>
    </div>
  );
};

const valores = (c: any): Est[] => c.estados;

/** mapa com faixa de ranking revelada ao longo das falas */
export const EUA: React.FC<LProps> = ({ c, f, dur, marcos }) => {
  const est = valores(c);
  const [r0, r1]: [number, number] = c.faixa || [1, 50];
  const ent = (e: Est) => {
    if (e.rank < r0 || e.rank > r1) return c.mostrar_resto && (e.rank > r1 || c.resto_abaixo) ? 1 : c.fundo_todos ? 0.35 : 0;
    // revela do pior rank da faixa para o melhor (contagem regressiva)
    const ordem = c.ordem === 'sobe' ? e.rank - r0 : r1 - e.rank;
    const q = c.quando_rank && c.quando_rank[String(e.rank)];
    const a = q ? marco(marcos, q[0]) + q[1] : (c.inicio ?? 10) + ordem * (c.passo ?? 6);
    return prog(f, a, a + 14, EO);
  };
  const foco: string[] | undefined = c.foco_por_fala ? c.foco_por_fala[Math.max(0, marcos.filter((m) => m <= f).length - 1)] : c.foco;
  const zoomN: string | undefined = c.zoom;
  const pZ = zoomN ? prog(f, c.zoom_em ?? 10, (c.zoom_em ?? 10) + 40, EIO) : 0;
  return (
    <AbsoluteFill>
      <Mapa f={f} dados={est} mostra={ent} foco={foco} zoom={zoomN} pZoom={pZ} min={c.min} max={c.max} rotulos={c.rotulos} x={c.painel ? 60 : 300} y={c.painel ? 170 : 150} w={c.painel ? 1180 : 1320} />
      {c.titulo && (
        <div style={{ position: 'absolute', left: 110, top: 70, opacity: prog(f, 0, 14) }}>
          <div style={{ fontFamily: FT.mono, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: K.sinal }}>{c.sobre}</div>
          <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 54, color: K.texto }}>{c.titulo}</div>
        </div>
      )}
      {c.legenda !== false && (
        <div style={{ position: 'absolute', left: c.painel ? 120 : 360, bottom: 70, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.85 }}>
          <span style={{ fontFamily: FT.mono, fontSize: 20, color: K.mudo }}>{c.leg_min}</span>
          <div style={{ width: 360, height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map((t) => quente(t)).join(',')})` }} />
          <span style={{ fontFamily: FT.mono, fontSize: 20, color: K.mudo }}>{c.leg_max}</span>
        </div>
      )}
      {c.painel && <Painel c={c} f={f} marcos={marcos} />}
    </AbsoluteFill>
  );
};

/** painel lateral com a lista de estados revelados (rank, nome, valor) */
const Painel: React.FC<{ c: any; f: number; marcos: number[] }> = ({ c, f, marcos }) => {
  const est: Est[] = valores(c);
  const [r0, r1]: [number, number] = c.faixa;
  const lista = est.filter((e) => e.rank >= r0 && e.rank <= r1).sort((a, b) => (c.ordem === 'sobe' ? a.rank - b.rank : b.rank - a.rank));
  const max = c.max;
  const h = Math.min(74, 760 / lista.length);
  return (
    <div style={{ position: 'absolute', left: 1270, top: 170, width: 620 }}>
      {lista.map((e, k) => {
        const q = c.quando_rank && c.quando_rank[String(e.rank)];
        const a = q ? marco(marcos, q[0]) + q[1] : (c.inicio ?? 10) + k * (c.passo ?? 6);
        const p = prog(f, a, a + 16, EO);
        const destac = c.foco && c.foco.includes(e.nome);
        return (
          <div key={e.nome} style={{ display: 'flex', alignItems: 'center', height: h, opacity: clamp(p * 2) * (c.foco && c.foco.length && !destac ? 0.4 : 1), transform: `translateX(${(1 - p) * 40}px)` }}>
            <div style={{ width: 70, fontFamily: FT.mono, fontWeight: 700, fontSize: Math.min(28, h * 0.45), color: K.mudo }}>#{e.rank}</div>
            <div style={{ width: 290, fontFamily: FT.disp, fontWeight: 700, fontSize: Math.min(32, h * 0.5), color: K.texto, whiteSpace: 'nowrap' }}>{e.nome}</div>
            <div style={{ width: (e.v / max) * 120 * p, height: Math.min(20, h * 0.3), borderRadius: 4, background: quente((e.v - c.min) / (c.max - c.min)) }} />
            <div style={{ marginLeft: 12, fontFamily: FT.mono, fontWeight: 700, fontSize: Math.min(26, h * 0.4), color: K.texto }}>{fmtL(e.v, c.dec ?? 1)}{c.unid ?? '%'}</div>
          </div>
        );
      })}
    </div>
  );
};

/** um estado em destaque: zoom no mapa + ficha com números */
export const Estado: React.FC<LProps> = ({ c, f, marcos }) => {
  const est: Est[] = c.estados;
  const e = est.find((x) => x.nome === c.nome)!;
  const pZ = prog(f, 0, 36, EIO);
  const linhas: { r: string; v: string }[] = c.linhas;
  return (
    <AbsoluteFill>
      <Mapa f={f} dados={est} mostra={() => 1} foco={[c.nome]} zoom={c.nome} pZoom={pZ} min={c.min} max={c.max} x={0} y={110} w={1250} />
      <div style={{ position: 'absolute', left: 1000, top: 0, width: 920, height: LH, background: 'linear-gradient(90deg, rgba(13,16,22,0) 0%, rgba(13,16,22,0.88) 28%, rgba(13,16,22,0.96) 100%)' }} />
      <div style={{ position: 'absolute', left: 1220, top: 190, width: 640 }}>
        <div style={{ opacity: prog(f, 8, 22), fontFamily: FT.mono, fontWeight: 700, fontSize: 64, color: quente((e.v - c.min) / (c.max - c.min)) }}>#{e.rank}</div>
        <div style={{ opacity: prog(f, 12, 26), transform: `translateY(${(1 - prog(f, 12, 30, EO)) * 20}px)`, fontFamily: FT.disp, fontWeight: 700, fontSize: 84, color: K.texto, letterSpacing: -2, lineHeight: 1 }}>{c.nome}</div>
        {linhas.map((l, k) => {
          const a = k === 0 ? 26 : marco(marcos, Math.min(k, marcos.length - 1)) + (k >= marcos.length ? (k - marcos.length + 1) * 30 : 0);
          return (
            <div key={k} style={{ marginTop: 34, opacity: prog(f, a, a + 14), transform: `translateY(${(1 - prog(f, a, a + 18, EO)) * 18}px)` }}>
              <div style={{ fontFamily: FT.mono, fontSize: 24, letterSpacing: 2, color: K.mudo }}>{l.r.toUpperCase()}</div>
              <div style={{ fontFamily: FT.disp, fontWeight: 700, fontSize: 64, color: k === linhas.length - 1 ? K.sinal : K.texto }}>{l.v}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** dispersão: galões por pessoa (x) contra renda (y) */
export const Dispersao: React.FC<LProps> = ({ c, f, marcos }) => {
  const pts: { nome: string; ab: string; x: number; y: number; v: number }[] = c.pontos;
  const [x0, x1] = c.xr, [y0, y1] = c.yr;
  const L = 260, T = 200, W = 1180, H = 700;
  const px = (x: number) => L + ((x - x0) / (x1 - x0)) * W;
  const py = (y: number) => T + H - ((y - y0) / (y1 - y0)) * H;
  const m1 = marco(marcos, 1), m2 = marco(marcos, 2);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 110, top: 60, fontFamily: FT.disp, fontWeight: 700, fontSize: 50, color: K.texto, opacity: prog(f, 0, 14) }}>{c.titulo}</div>
      <svg width={LW} height={LH} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* canto perigoso */}
        <rect x={px(c.perigo[0])} y={py(c.perigo[1])} width={px(x1) - px(c.perigo[0])} height={py(y0) - py(c.perigo[1])} fill={K.ruim} opacity={0.12 * prog(f, m1, m1 + 20)} rx={10} />
        <text x={px(x1) - 20} y={py(y0) - 24} textAnchor="end" fontFamily={FT.mono} fontWeight={700} fontSize={26} fill={K.ruim} opacity={prog(f, m1 + 10, m1 + 26)}>{c.perigo_rotulo ?? 'MORE GAS · LESS MONEY'}</text>
        <line x1={L} y1={T + H} x2={L + W} y2={T + H} stroke={K.linha} strokeWidth={2} />
        <line x1={L} y1={T} x2={L} y2={T + H} stroke={K.linha} strokeWidth={2} />
        {c.xt.map((v: number) => <text key={v} x={px(v)} y={T + H + 36} textAnchor="middle" fontFamily={FT.mono} fontSize={22} fill={K.mudo}>{v}{c.xsuf || ''}</text>)}
        {c.yt.map((v: number) => <text key={v} x={L - 18} y={py(v) + 8} textAnchor="end" fontFamily={FT.mono} fontSize={22} fill={K.mudo}>{c.ysuf ? `${v}${c.ysuf}` : `$${v / 1000}k`}</text>)}
        <text x={L + W / 2} y={T + H + 80} textAnchor="middle" fontFamily={FT.mono} fontSize={24} fill={K.mudo}>{c.xl}</text>
        <text x={L - 60} y={T - 26} fontFamily={FT.mono} fontSize={22} fill={K.mudo}>{c.yl}</text>
        {pts.map((p, k) => {
          const a = 10 + k * 2;
          const s = spr(f, a, { damping: 14, stiffness: 200 });
          const destac = f > m2 && c.foco.includes(p.ab);
          const cor = quente((p.v - c.min) / (c.max - c.min));
          return (
            <g key={p.ab} opacity={f > m2 && !destac ? 0.35 : 1}>
              <circle cx={px(p.x)} cy={py(p.y)} r={(destac ? 17 : 12) * s} fill={cor} stroke="#0d1016" strokeWidth={2} />
              <text x={px(p.x) + 18} y={py(p.y) + 7} fontFamily={FT.mono} fontWeight={700} fontSize={destac ? 26 : 17} fill={destac ? '#fff' : K.mudo} opacity={s}>{p.ab}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** série temporal (preço da gasolina): linha que se desenha, marcos e linha-alvo */
export const Serie: React.FC<LProps> = ({ c, f, marcos }) => {
  const S: [string, number][] = c.serie;
  const L = 200, T = 170, W = 1560, H = 720;
  const t0 = Number(S[0][0].slice(0, 4)) + (Number(S[0][0].slice(5, 7)) - 1) / 12;
  const t1 = Number(S[S.length - 1][0].slice(0, 4)) + (Number(S[S.length - 1][0].slice(5, 7)) - 1) / 12;
  const anoX = (d: string) => L + ((Number(d.slice(0, 4)) + (Number(d.slice(5, 7)) - 1) / 12 - t0) / (t1 - t0)) * W;
  const y = (v: number) => T + H - (v / c.ymax) * H;
  const pDesenho = prog(f, 12, marco(marcos, 1) + 60, EIO);
  const n = Math.max(2, Math.floor(S.length * pDesenho));
  const d = S.slice(0, n).map((p, i) => `${i ? 'L' : 'M'}${anoX(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
  const ponta = S[n - 1];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 110, top: 60, fontFamily: FT.disp, fontWeight: 700, fontSize: 50, color: K.texto, opacity: prog(f, 0, 14) }}>{c.titulo}</div>
      <svg width={LW} height={LH} style={{ position: 'absolute', left: 0, top: 0 }}>
        {c.yt.map((v: number) => (
          <g key={v}><line x1={L} x2={L + W} y1={y(v)} y2={y(v)} stroke={K.grade} strokeWidth={1.5} /><text x={L - 18} y={y(v) + 8} textAnchor="end" fontFamily={FT.mono} fontSize={22} fill={K.mudo}>{c.ypre ?? '$'}{v}{c.ysuf || ''}</text></g>
        ))}
        {c.xt.map((a: number) => <text key={a} x={anoX(`${a}-01`)} y={T + H + 38} textAnchor="middle" fontFamily={FT.mono} fontSize={22} fill={K.mudo}>{a}</text>)}
        {/* linha dos $10 */}
        {(() => { const a = marco(marcos, c.alvo_fala); const p = prog(f, a, a + 30, EO); return (
          <g opacity={p}><line x1={L} x2={L + W * p} y1={y(c.alvo ?? 10)} y2={y(c.alvo ?? 10)} stroke={K.ruim} strokeWidth={4} strokeDasharray="14 10" />
            <text x={L + 10} y={y(c.alvo ?? 10) - 16} fontFamily={FT.disp} fontWeight={700} fontSize={38} fill={K.ruim}>{c.alvo_rotulo || '$10.00'}</text></g>); })()}
        <path d={d} fill="none" stroke={K.sinal} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={anoX(ponta[0])} cy={y(ponta[1])} r={8} fill={K.sinal} />
        {c.marcas.map((m: any, k: number) => {
          const a = marco(marcos, m.fala) + (m.atraso || 0);
          const p = prog(f, a, a + 16, EO);
          const x = anoX(m.data), yy = y(m.v);
          return (
            <g key={k} opacity={p}>
              <circle cx={x} cy={yy} r={12 * p} fill="none" stroke="#fff" strokeWidth={3} />
              <text x={x + (m.lado === 'e' ? -20 : 20)} y={yy - 26} textAnchor={m.lado === 'e' ? 'end' : 'start'} fontFamily={FT.disp} fontWeight={700} fontSize={36} fill={K.texto}>{m.rotulo}</text>
              {m.sub && <text x={x + (m.lado === 'e' ? -20 : 20)} y={yy + 8} textAnchor={m.lado === 'e' ? 'end' : 'start'} fontFamily={FT.mono} fontSize={22} fill={K.mudo}>{m.sub}</text>}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: L, bottom: 40, fontFamily: FT.mono, fontSize: 20, color: K.fraco }}>{c.fonte}</div>
    </AbsoluteFill>
  );
};
