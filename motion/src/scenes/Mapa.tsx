import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import { geoMercator, geoPath, geoGraticule } from 'd3-geo';
import { C, F, W, H, COR } from '../lib/theme';
import { prog, spr, wob, EO, EIO, lerp, clamp, amostra, corta, linha, rnd, fmt } from '../lib/anim';
import { useGeo } from '../lib/geo';
import { Titulo, Choque } from '../comp/base';
import type { CenaProps } from '../lib/types';

const VP: [number, number] = [540, 930];

const passoGrade = (w: number) => {
  const op = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 15, 20, 30];
  return op.find((s) => w / s <= 7) || 30;
};

const escalaBonita = (kmMax: number) => {
  const op = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
  let r = op[0];
  for (const o of op) if (o <= kmMax) r = o;
  return r;
};

const useSat = (src?: string) => {
  const [h] = useState(() => (src ? delayRender(`sat ${src}`) : null));
  useEffect(() => {
    if (!src || h === null) return;
    const im = new Image();
    im.src = src;
    im.decode().then(() => continueRender(h)).catch(() => continueRender(h));
  }, [src, h]);
};

export const Mapa: React.FC<CenaProps> = ({ c, f, dur, id, geo, temGlobo, idx }) => {
  const feats = useGeo(id, geo);
  const satSrc = c._sat ? staticFile(`v/${id}/${c._sat.arq}`) : undefined;
  useSat(satSrc);
  const [lon0, lon1, lat0, lat1] = c.bbox as number[];
  const proj = useMemo(() => {
    const p = geoMercator();
    p.fitExtent([[60, 440], [1020, 1420]], { type: 'MultiPoint', coordinates: [[lon0, lat0], [lon1, lat0], [lon1, lat1], [lon0, lat1]] } as any);
    return p;
  }, [lon0, lon1, lat0, lat1]);
  const path = useMemo(() => geoPath(proj), [proj]);
  const destaque: string[] = c.destaque || [];

  const camadas = useMemo(() => {
    if (!feats) return null;
    const terra: string[] = [], dest: string[] = [], lagos: string[] = [], rios: string[] = [];
    feats.forEach((ft) => {
      const d = path(ft.g as any);
      if (!d) return;
      if (ft.k === 'pais' || ft.k === 'ilha') (ft.a3 && destaque.includes(ft.a3) ? dest : terra).push(d);
      else if (ft.k === 'lago') lagos.push(d);
      else if (ft.k === 'rio') rios.push(d);
    });
    const step = passoGrade(Math.max(lon1 - lon0, lat1 - lat0) * 2.5);
    const grad = path(geoGraticule().step([step, step]).extent([[Math.max(-180, lon0 - 40), Math.max(-80, lat0 - 30)], [Math.min(180, lon1 + 40), Math.min(80, lat1 + 30)]])() as any) || '';
    return { terra: terra.join(''), dest: dest.join(''), lagos: lagos.join(''), rios: rios.join(''), grad };
  }, [feats, path, destaque.join(','), lon0, lon1, lat0, lat1]);

  // ---------- câmera ----------
  const g0 = temGlobo ? 40 : 0; // quando há globo antes, o mapa começa a aparecer no quadro ~40
  const fl = f - g0;
  const zoomOut = temGlobo ? (lon1 - lon0 > 60 ? 1.35 : 2.8) : 1.65;
  const pm = prog(fl, -8, Math.min(dur * 0.55, 60), EIO);
  const empurra = prog(fl, 0, dur - g0, (x) => x);
  const s = lerp(1 / zoomOut, 1, pm) * (1 + (c.zoom ?? 0.08) * empurra);
  const t = f / 30;
  const cx = lerp(VP[0] + 90, VP[0], pm) + wob(t * 0.6, 1) * 5;
  const cy = lerp(VP[1] - 140, VP[1], pm) + wob(t * 0.5, 2) * 5;
  const rot = lerp(-4, 0, pm) + wob(t * 0.4, 3) * 0.35;
  const scr = (lon: number, lat: number): [number, number] => {
    const p = proj([lon, lat])!;
    const x = (p[0] - cx) * s, y = (p[1] - cy) * s;
    const r = (rot * Math.PI) / 180;
    return [VP[0] + x * Math.cos(r) - y * Math.sin(r), VP[1] + x * Math.sin(r) + y * Math.cos(r)];
  };
  const camT = `translate(${VP[0]} ${VP[1]}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`;

  // ---------- tempos ----------
  const base = Math.max(0, g0) + 6;
  const rev = prog(fl, -6, 16, EO);
  const escuro = c.escuro ?? 0;

  // rotas (em coordenadas projetadas, densas)
  const rotas: [number, number][][] = useMemo(() => {
    const rs = c.rotas || (c.rota ? [c.rota] : []);
    return rs.map((r: [number, number][]) => amostra(r.map((p) => proj(p as any)! as [number, number]), 20));
  }, [proj, JSON.stringify(c.rotas || c.rota || [])]);
  const tempestade = c.estilo_rota === 'tempestade';
  const corRota = tempestade ? C.water : COR[c.cor_rota || 'water'] || C.water;
  const larg = (c.largura_rota ?? 20) * 0.45;

  const toScreenPts = (pp: [number, number][]) =>
    pp.map((p) => {
      const x = (p[0] - cx) * s, y = (p[1] - cy) * s;
      const r = (rot * Math.PI) / 180;
      return [VP[0] + x * Math.cos(r) - y * Math.sin(r), VP[1] + x * Math.sin(r) + y * Math.cos(r)] as [number, number];
    });

  // escala (km)
  const latc = (lat0 + lat1) / 2;
  const kmPorPx = (6371 * Math.cos((latc * Math.PI) / 180)) / (proj.scale() * s);
  const km = escalaBonita(kmPorPx * 200);
  const barra = km / kmPorPx;
  const centro = proj.invert!([cx, cy]) || [0, 0];

  const varre = prog(fl, 2, 34, EIO);
  const corPin = COR[c.cor_pin || 'amber'] || C.amber;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, #0c2338 0%, #081a2b 50%, #050f1a 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="gdest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd37a" />
            <stop offset="1" stopColor={C.amber2} />
          </linearGradient>
          <linearGradient id="gterra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34516b" />
            <stop offset="1" stopColor="#253c52" />
          </linearGradient>
        </defs>
        {camadas && (
          <g transform={camT} opacity={rev}>
            <path d={camadas.grad} fill="none" stroke={C.muted} strokeOpacity={0.1} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
            {/* sombra/relevo da costa */}
            <path d={camadas.terra} fill="#0a1826" transform={`translate(0 ${6 / s})`} opacity={0.8} />
            <path d={camadas.terra} fill="url(#gterra)" />
            {satSrc && (() => {
              const [a0, b0, a1, b1] = c._sat.b;
              const p0 = proj([a0, b1])!, p1 = proj([a1, b0])!;
              return (
                <>
                  <clipPath id={`terra${idx}`}><path d={camadas.terra + camadas.dest} /></clipPath>
                  <image href={satSrc} x={p0[0]} y={p0[1]} width={p1[0] - p0[0]} height={p1[1] - p0[1]} preserveAspectRatio="none" clipPath={`url(#terra${idx})`} opacity={0.62} style={{ filter: 'saturate(0.75) brightness(0.85) contrast(1.1)' }} />
                </>
              );
            })()}
            <path d={camadas.terra} fill="none" stroke="#7fa3c2" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
            <path d={camadas.terra} fill="none" stroke="#8fc3ff" strokeOpacity={0.18} strokeWidth={5} vectorEffect="non-scaling-stroke" />
            <path d={camadas.lagos} fill="#0d3150" stroke="#5f9fd0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <path d={camadas.rios} fill="none" stroke="#2f6f9f" strokeOpacity={0.55} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
            {camadas.dest && (
              <>
                {Array.from({ length: 9 }).map((_, k) => (
                  <path key={k} d={camadas.dest} fill={k < 8 ? '#7a4a0c' : '#a8660f'} transform={`translate(0 ${((9 - k) * 2.2 * prog(fl, 4, 26, EO)) / s})`} />
                ))}
                <path d={camadas.dest} fill="url(#gdest)" stroke="#ffe2a6" strokeWidth={1.6} vectorEffect="non-scaling-stroke" transform={`translate(0 ${(-2 * prog(fl, 4, 26, EO)) / s})`} />
              </>
            )}
          </g>
        )}
      </svg>
      {/* brilho do país em destaque */}
      {camadas?.dest && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, filter: 'blur(22px)', opacity: 0.55 * prog(fl, 6, 30) * (0.85 + 0.15 * Math.sin(t * 3)) }}>
          <g transform={camT}><path d={camadas.dest} fill={C.amber} /></g>
        </svg>
      )}
      {/* varredura de radar */}
      {varre > 0 && varre < 1 && (
        <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${varre * 140 - 30}%, rgba(120,200,255,0.16) ${varre * 140 - 12}%, transparent ${varre * 140}%)` }} />
      )}
      {escuro > 0 && <AbsoluteFill style={{ background: `rgba(5,12,21,${escuro})` }} />}

      {/* rotas */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {rotas.map((r, i) => {
          const ini = base + 8 + i * 18;
          const fim = Math.min(ini + 70, dur * 0.78);
          const p = prog(f, ini, fim, EIO);
          if (p <= 0) return null;
          const cut = corta(toScreenPts(r), p);
          const d = linha(cut.pts);
          const [hx, hy] = cut.ponta;
          const a = cut.ang;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={corRota} strokeWidth={larg * 3.2} strokeOpacity={0.22} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'blur(8px)' }} />
              <path d={d} fill="none" stroke={corRota} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#e8f6ff" strokeWidth={Math.max(2, larg * 0.28)} strokeLinecap="round" strokeDasharray="14 22" strokeDashoffset={-f * 2.2} strokeOpacity={0.85} />
              {tempestade ? (
                <polygon points={`${hx + Math.cos(a) * 46},${hy + Math.sin(a) * 46} ${hx + Math.cos(a + 2.5) * 40},${hy + Math.sin(a + 2.5) * 40} ${hx + Math.cos(a - 2.5) * 40},${hy + Math.sin(a - 2.5) * 40}`} fill={corRota} style={{ filter: `drop-shadow(0 0 14px ${corRota})` }} />
              ) : (
                p < 1 && <circle cx={hx} cy={hy} r={larg * 0.9 + 4} fill="#fff" style={{ filter: `drop-shadow(0 0 16px ${corRota}) drop-shadow(0 0 6px #fff)` }} />
              )}
            </g>
          );
        })}
        {/* lacuna (trecho sem estrada) */}
        {c.lacuna && (() => {
          const a = scr(c.lacuna[0][0], c.lacuna[0][1]), b = scr(c.lacuna[1][0], c.lacuna[1][1]);
          const p = prog(f, base + 14, base + 40, EO);
          const pisca = 0.6 + 0.4 * Math.sin(t * 9);
          const bx = lerp(a[0], b[0], p), by = lerp(a[1], b[1], p);
          return (
            <g opacity={p > 0 ? 1 : 0}>
              <line x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke={C.red} strokeWidth={26} strokeOpacity={0.25} style={{ filter: 'blur(6px)' }} />
              <line x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke={C.red} strokeWidth={11} strokeDasharray="22 16" strokeDashoffset={-f} opacity={pisca} strokeLinecap="round" />
            </g>
          );
        })()}
      </svg>

      {/* enxame de navios */}
      {c.enxame && (() => {
        const e = c.enxame;
        const [ex, ey] = scr(e.lon, e.lat);
        const n = Math.round(e.n * prog(f, base + 4, dur - 20, (x) => x));
        return (
          <AbsoluteFill>
            {Array.from({ length: n }).map((_, k) => {
              const ang = k * 2.39996;
              const r = (e.raio ?? 160) * 1.25 * Math.sqrt(k / e.n);
              const x = ex + Math.cos(ang) * r + wob(t + k, k) * 2;
              const y = ey + Math.sin(ang) * r * 0.8 + wob(t * 1.3 + k, k + 3) * 2;
              const pop = spr(f, base + 4 + (k / e.n) * (dur - 30), { damping: 10, stiffness: 300 });
              return <div key={k} style={{ position: 'absolute', left: x - 9, top: y - 3.5, width: 18, height: 7, borderRadius: 4, background: k % 7 === 0 ? '#ffd88a' : C.amber, transform: `rotate(${-35 + rnd(k) * 20}deg) scale(${pop})`, boxShadow: `0 0 8px ${C.amber}` }} />;
            })}
          </AbsoluteFill>
        );
      })()}

      {/* pinos */}
      {(c.pins || []).map((pin: any[], i: number) => {
        const [x, y] = scr(pin[0], pin[1]);
        const ini = base + 10 + i * 9;
        const s1 = spr(f, ini, { damping: 9, stiffness: 220 });
        if (f < ini) return null;
        const lado = pin[3] === 'l' ? -1 : 1;
        const card = prog(f, ini + 5, ini + 18, EO);
        const lab = String(pin[2] || '').toUpperCase();
        const cw = lab.length * 22 + 56;
        let lx = lado > 0 ? x + 34 : x - 34 - cw;
        lx = clamp(lx, 40, W - 40 - cw);
        return (
          <React.Fragment key={i}>
            {[0, 1, 2].map((k) => {
              const ph = ((f - ini) / 40 + k / 3) % 1;
              const r = 18 + ph * 70;
              return <div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${corPin}`, opacity: (1 - ph) * 0.8 * s1 }} />;
            })}
            <div style={{ position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: '50%', background: corPin, border: '4px solid #fff', transform: `scale(${s1})`, boxShadow: `0 0 24px ${corPin}, 0 4px 10px rgba(0,0,0,0.6)` }} />
            {lab && (
              <div style={{ position: 'absolute', left: lx, top: y - 34, height: 68, display: 'flex', alignItems: 'center', opacity: card, transform: `translateX(${(1 - card) * -lado * 40}px)` }}>
                <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px 0 22px', background: 'rgba(6,14,24,0.86)', borderRadius: 12, borderLeft: `6px solid ${corPin}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: F.cond, fontWeight: 800, fontSize: 40, letterSpacing: 1.5, color: C.white, whiteSpace: 'nowrap' }}>{lab}</div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {c.lacuna && (() => {
        const a = scr(c.lacuna[0][0], c.lacuna[0][1]), b = scr(c.lacuna[1][0], c.lacuna[1][1]);
        const p = spr(f, base + 36, { damping: 10, stiffness: 200 });
        return (
          <div style={{ position: 'absolute', left: (a[0] + b[0]) / 2 - 120, top: Math.min(a[1], b[1]) - 150, width: 240, textAlign: 'center', transform: `scale(${p})`, fontFamily: F.cond, fontWeight: 900, fontSize: 58, color: '#fff', background: C.red, borderRadius: 14, padding: '6px 0', boxShadow: `0 0 40px ${C.red}99` }}>NO ROAD</div>
        );
      })()}

      {/* número grande sobre o mapa */}
      {c.numero && (() => {
        const ini = base + 18;
        const sN = spr(f, ini, { damping: 10, stiffness: 180 });
        const cor = COR[c.cor || 'amber'] || C.amber;
        const m = String(c.numero).match(/^([^\d]*)([\d,.]+)(.*)$/);
        let txt = String(c.numero);
        if (m) {
          const alvo = parseFloat(m[2].replace(/,/g, ''));
          const v = alvo * prog(f, ini, ini + 26, EO);
          txt = m[1] + fmt(Math.round(v)) + m[3];
        }
        return (
          <>
            <Choque f={f} ini={ini + 26} x={540} y={640} cor={cor} />
            <div style={{ position: 'absolute', width: W, top: 560, textAlign: 'center', transform: `scale(${0.4 + 0.6 * sN})`, opacity: clamp(sN * 2), fontFamily: F.cond, fontWeight: 900, fontSize: 190, lineHeight: 1, color: cor, WebkitTextStroke: '10px rgba(5,12,21,0.9)', paintOrder: 'stroke fill', textShadow: `0 0 50px ${cor}99` }}>{txt}</div>
          </>
        );
      })()}

      {/* HUD: coordenadas e escala */}
      <div style={{ position: 'absolute', right: 44, top: 140, textAlign: 'right', fontFamily: F.cond, fontWeight: 600, fontSize: 28, letterSpacing: 2, color: C.muted, opacity: 0.85 * rev, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
        {Math.abs(centro[1]).toFixed(2)}° {centro[1] >= 0 ? 'N' : 'S'}&nbsp;&nbsp;{Math.abs(centro[0]).toFixed(2)}° {centro[0] >= 0 ? 'E' : 'W'}
      </div>
      <div style={{ position: 'absolute', right: 44, top: 182, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.8 * rev }}>
        <div style={{ fontFamily: F.cond, fontWeight: 700, fontSize: 26, color: C.white, letterSpacing: 1, marginBottom: 4 }}>{fmt(km, km < 1 ? 1 : 0)} km</div>
        <div style={{ width: barra, height: 8, borderLeft: '3px solid #fff', borderRight: '3px solid #fff', borderBottom: '3px solid #fff' }} />
      </div>

      <Titulo f={f} titulo={c.titulo} sub={c.sub} atraso={c.gancho ? 84 : Math.max(4, base - 2)} />
    </AbsoluteFill>
  );
};
