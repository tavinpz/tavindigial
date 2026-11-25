import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Anel, Etiqueta, K, L, SANS, TIT, pop } from './lib';
import { Linha, Objetos, Rosto } from './Extra';

// Strong Not Big: motor do vídeo longo. Cada fala do tempos.json traz em `v` o que aparece na tela (ver snb01_roteiro.py).
// O estado da tela é acumulado dentro do bloco: a fala herda o `v` anterior, e chave com null apaga.
const W = 1920, H = 1080, BASE = 962, COL = 1050;
type V = Record<string, any>;
type Fala = { t: number; d: number; txt: string; v?: V };
type Bloco = { cena: string; et?: string | null; fonte?: string | null; ini: number; fim: number; falas: Fala[] };
export type TemposSNB = { total: number; blocos: Bloco[] };
const J = (x: any) => JSON.stringify(x ?? null);
const COR: Record<string, string> = { verm: K.verm, cinza: '#5b5852', verde: K.verde, ambar: K.ambar };

// palavras em MAIÚSCULA saem na cor de destaque
const Tx: React.FC<{ txt: string; cor?: string; dest?: string }> = ({ txt, cor = K.osso, dest = K.verm }) => (
  <>{txt.split(' ').map((p, i) => <tspan key={i} fill={p.length > 1 && p === p.toUpperCase() && /[A-Z]/.test(p) ? dest : cor}>{p + ' '}</tspan>)}</>
);
const entra = (g: number, ini: number) => ({ o: L(g, [ini, ini + 5], [0, 1]), s: Math.min(1.12, pop(g, ini)) });

const Pose: React.FC<{ g: number; ini: number; f: V; brilho?: string }> = ({ g, ini, f, brilho }) => {
  const k = f.a / 1772, { o } = entra(g, ini);
  const bob = f.anda ? Math.abs(Math.sin(g / 5.2)) * -9 : Math.sin(g / 17) * 1.6;
  const rot = f.anda ? Math.sin(g / 5.2) * 1.1 : 0;
  const tx = f.treme ? Math.sin(g * 2.1) * 3.5 * Math.max(0.25, 1 - (g - ini) / 40) : 0;
  const w = 1300 * k, h = 2260 * k, nome = f.p + (f.ambar ? '_ambar' : '');
  const src = staticFile(`snb/poses/${nome === 'farmer_carry_ambar' || !f.ambar ? nome : f.p}.png`);
  // brilho âmbar sobre o tronco ou o quadril (multiplica só onde há desenho claro)
  const b = brilho === 'tronco' ? { t: 0.36, a: 0.2 } : brilho === 'quadril' ? { t: 0.5, a: 0.13 } : null;
  return (
    <div style={{ position: 'absolute', left: f.x - 650 * k + tx, top: BASE - 2172 * k + bob + (1 - o) * 26, width: w, height: h, opacity: o, transform: `rotate(${rot}deg)`, transformOrigin: '50% 96%' }}>
      <Img src={src} style={{ width: w, height: h }} />
      {b && <div style={{ position: 'absolute', left: w * 0.32, top: h * b.t, width: w * 0.36, height: h * b.a, background: K.ambar, mixBlendMode: 'multiply', opacity: 0.55 + 0.3 * Math.sin(g / 5), borderRadius: '38%', filter: 'blur(14px)' }} />}
    </div>
  );
};

// Pictogramas de lado para movimentos que o personagem (só de frente) não mostra: flexão e sentar/levantar do chão.
const Icone: React.FC<{ g: number; ini: number; tipo: string }> = ({ g, ini, tipo }) => {
  const { o } = entra(g, ini); const st = { fill: 'none', stroke: K.osso, strokeWidth: 30, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const chao = <rect x={130} y={842} width={760} height={6} fill={K.osso} opacity={0.3} />;
  let d: React.ReactNode;
  if (tipo === 'flexao') {
    const k = (1 - Math.cos(g / 11)) / 2, sy = 640 + 120 * k, hy = sy - 34;     // ombro desce e sobe
    d = <>{chao}<circle cx={792} cy={hy - 20} r={46} fill={K.osso} />
      <path d={`M 716,${sy} L 250,812`} {...st} strokeWidth={46} />
      <path d={`M 716,${sy} L ${716 - 60 * k},${(sy + 820) / 2 + 20 * k} L 716,820`} {...st} stroke={K.ambar} />
      <path d="M 250,812 L 206,826" {...st} /></>;
  } else if (tipo === 'flexao_baixo') {
    const tr = Math.sin(g * 1.7) * 2.2, sy = 760 + tr;     // parado embaixo, tremendo
    d = <>{chao}<circle cx={792} cy={sy - 54} r={46} fill={K.osso} />
      <path d={`M 716,${sy} L 250,812`} {...st} strokeWidth={46} />
      <path d={`M 716,${sy} L 656,${sy + 44} L 716,820`} {...st} stroke={K.ambar} />
      <path d="M 250,812 L 206,826" {...st} /></>;
  } else if (tipo === 'cruz') {
    const r = Math.sin(g / 14) * 1.2, y0 = 470;     // cruz de ferro, de frente, nas argolas
    d = <g transform={`rotate(${r} 520 ${y0})`}>
      <path d="M 250,120 L 250,440 M 790,120 L 790,440" {...st} strokeWidth={8} opacity={0.5} />
      <circle cx={250} cy={470} r={34} {...st} strokeWidth={14} /><circle cx={790} cy={470} r={34} {...st} strokeWidth={14} />
      <path d={`M 262,${y0} L 778,${y0}`} {...st} stroke={K.ambar} strokeWidth={34} />
      <circle cx={520} cy={y0 - 84} r={50} fill={K.osso} />
      <path d={`M 520,${y0 - 10} L 520,${y0 + 230}`} {...st} strokeWidth={54} />
      <path d={`M 506,${y0 + 230} L 500,${y0 + 430} M 534,${y0 + 230} L 540,${y0 + 430}`} {...st} strokeWidth={30} /></g>;
  } else if (tipo === 'prancha') {
    const b = Math.sin(g / 12) * 4;     // planche: corpo horizontal sobre os braços esticados
    d = <>{chao}<circle cx={742} cy={598 + b} r={46} fill={K.osso} />
      <path d={`M 660,${624 + b} L 240,${640 + b}`} {...st} strokeWidth={46} />
      <path d={`M 640,${630 + b} L 600,826`} {...st} stroke={K.ambar} strokeWidth={34} /></>;
  } else {
    const k = (1 - Math.cos(g / 26)) / 2, q = 500 + 290 * k, om = q - 250 + 20 * k;   // quadril desce até o chão
    d = <>{chao}<circle cx={520} cy={om - 76} r={50} fill={K.osso} />
      <path d={`M 520,${om} L 520,${q}`} {...st} strokeWidth={50} />
      <path d={`M 520,${q} L ${520 - 150 * k - 34},${q + (812 - q) * 0.5 - 40 * k} L ${520 + 120 * k - 30},812`} {...st} stroke={K.ambar} />
      <path d={`M 520,${q} L ${520 + 150 * k + 34},${q + (812 - q) * 0.5 - 40 * k} L ${520 - 120 * k + 30},812`} {...st} stroke={K.ambar} />
      <path d={`M 520,${om + 30} L ${440 - 30 * k},${om + 150} M 520,${om + 30} L ${600 + 30 * k},${om + 150}`} {...st} strokeWidth={24} /></>;
  }
  return <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: (1 - o) * 26, opacity: o }}>{d}</svg>;
};

const Cena: React.FC<{ g: number; D: number; b: Bloco; ini: number }> = ({ g, D, b, ini }) => {
  const ts = b.falas.map((x) => Math.round(x.t * 30) - ini);
  const est = React.useMemo(() => { const a: V[] = []; let s: V = {}; for (const f of b.falas) { s = { ...s, ...(f.v || {}) }; for (const k of Object.keys(s)) if (s[k] === null) delete s[k]; a.push(s); } return a; }, [b]);
  let i = 0; for (let k = 0; k < ts.length; k++) if (g >= ts[k]) i = k;
  const v = est[i];
  // quadro em que o valor atual da chave apareceu (para animar só o que é novo)
  const desde = (ch: string, sub?: (x: any) => any) => { const pega = (e: V) => J(sub ? sub(e[ch]) : e[ch]); let j = i; while (j > 0 && pega(est[j - 1]) === pega(v)) j--; return Math.max(0, ts[j]); };
  const figs: V[] = v.figs || [];
  const lado = figs.length > 0 || v.mao || v.icone; const centro = v.c || !lado;
  const fw = v.face ? (v.face.w || 760) : 0;
  const tx = v.face ? (v.face.lado === 'e' ? fw + 120 : 110) : centro ? 960 : (figs.length > 1 ? 1180 : COL), anc = v.face ? 'start' : centro ? 'middle' : 'start', larg = v.face ? W - fw - 260 : centro ? 1560 : W - tx - 120;
  const punch = 1 + 0.012 * L(g, [ts[i], ts[i] + 9], [1, 0]);
  const anda = figs.some((f) => f.anda);
  const el: React.ReactNode[] = [];

  if (v.big) {
    const t0 = desde('big'), { o, s } = entra(g, t0), tam = Math.min(v.bigy ? 150 : centro ? 250 : 220, larg / (0.52 * Math.max(2, v.big.length)));
    const y = v.bigy ? 935 : (v.sub ? 500 : 560) + tam * 0.18;
    el.push(<text key="big" x={tx} y={y + (1 - Math.min(1, s)) * 30} textAnchor={anc} fontFamily={TIT} fontSize={tam * (0.86 + 0.14 * s)} fill={K.osso} opacity={o} letterSpacing={2}><Tx txt={v.big} cor={K.osso} dest={K.osso} /></text>);
    if (v.sub) {
      const t1 = Math.max(desde('sub'), t0 + 5), e2 = entra(g, t1), ts2 = Math.min(58, larg / (0.54 * v.sub.length));
      el.push(<text key="sub" x={tx} y={y + 78 + (1 - Math.min(1, e2.s)) * 18} textAnchor={anc} fontFamily={SANS} fontWeight={800} fontSize={ts2} fill={K.osso} opacity={e2.o} letterSpacing={-0.5}><Tx txt={v.sub} /></text>);
    }
  }
  if (v.num) {
    const t0 = desde('num'), { o } = entra(g, t0), n = Math.round(L(g, [t0, t0 + Math.min(34, 10 + String(v.num.ate).length * 6)], [0, v.num.ate], (t) => 1 - Math.pow(1 - t, 3)));
    el.push(<text key="num" x={960} y={560} textAnchor="middle" fontFamily={TIT} fontSize={300} fill={K.osso} opacity={o} letterSpacing={4}>{n.toLocaleString('en-US')}<tspan fill={K.verm} fontSize={150}>{v.num.suf || ''}</tspan></text>);
    el.push(<text key="numr" x={960} y={660} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={48} fill={K.cinza} opacity={L(g, [t0 + 8, t0 + 18], [0, 1])}>{v.num.rot}</text>);
  }
  if (v.lista) {
    const t0 = desde('lista', (x) => x && x.it), it: string[] = v.lista.it, dur = Math.round(b.falas[i].d * 30);
    const x0 = v.lista.lado ? COL : 420, passo = Math.min(118, 560 / it.length), y0 = 540 - ((it.length - 1) * passo) / 2 + 20;
    // fala em que a lista entrou: itens automáticos se espalham pela duração dela
    let j = i; while (j > 0 && J(est[j - 1].lista && est[j - 1].lista.it) === J(it)) j--;
    const dj = Math.round(b.falas[j].d * 30);
    it.forEach((txt, n) => {
      const tn = v.lista.auto ? t0 + Math.round((n * dj * 0.92) / it.length) : (() => { let q = j; while (q < est.length - 1 && !((est[q].lista?.n ?? 0) > n)) q++; return (est[q].lista?.n ?? 0) > n ? ts[q] : 1e9; })();
      if (g < tn) return; const { o, s } = entra(g, tn); const tit = v.lista.tit && n === 0;
      const tam = Math.min(tit ? 74 : 62, (W - x0 - 150) / (0.56 * txt.length));
      const marca = v.lista.ok ? '✓' : v.lista.x ? '✕' : tit ? '' : '·';
      el.push(<g key={'li' + n} opacity={o} transform={`translate(${(1 - Math.min(1, s)) * 50},0)`}>
        {!tit && <text x={x0} y={y0 + n * passo} fontFamily={SANS} fontWeight={900} fontSize={tam} fill={v.lista.ok ? K.verde : K.verm}>{marca}</text>}
        <text x={x0 + (tit ? 0 : 62)} y={y0 + n * passo} fontFamily={tit ? TIT : SANS} fontWeight={800} fontSize={tam} fill={tit ? K.verm : K.osso} letterSpacing={tit ? 2 : -0.5}>{tit || txt === txt.toUpperCase() ? txt : <Tx txt={txt} />}</text>
      </g>);
    });
    void dur;
  }
  if (v.cart) {
    const t0 = desde('cart', (x) => x && x.it.map((c: string[]) => c[0]));
    (v.cart.it as string[][]).forEach((c, n) => {
      const { o, s } = entra(g, t0 + n * 7), x = 250 + n * 730, y = 260;
      let j = i; while (j > 0 && est[j - 1].cart && est[j - 1].cart.it[n] && est[j - 1].cart.it[n][2] === c[2]) j--;
      let j1 = i; while (j1 > 0 && est[j1 - 1].cart && est[j1 - 1].cart.it[n] && est[j1 - 1].cart.it[n][1] === c[1]) j1--;
      const r = entra(g, Math.max(0, ts[j])), r1 = entra(g, Math.max(0, ts[j1]));
      const bom = /SAME|JUST|SIMILAR|NO DROP|MORE|LOWER|ALL 3|STRONGER|4X|PEAK AT 35/.test(c[2]) && !/DROPPED|NO STRONGER/.test(c[2]);
      el.push(<g key={'c' + n} opacity={o} transform={`translate(0,${(1 - Math.min(1, s)) * 40})`}>
        <rect x={x} y={y} width={690} height={500} fill={K.painel} stroke="#2c2c31" strokeWidth={3} />
        <rect x={x} y={y} width={690} height={10} fill={n ? K.verm : K.cinza} />
        <text x={x + 345} y={y + 150} textAnchor="middle" fontFamily={TIT} fontSize={Math.min(120, 620 / (0.47 * c[0].length))} fill={K.osso} letterSpacing={2}>{c[0]}</text>
        {c[1] && <text x={x + 345} y={y + 240} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={Math.min(46, 640 / (0.54 * c[1].length))} fill={K.cinza} opacity={r1.o}>{c[1]}</text>}
        {c[2] && <g opacity={r.o} transform={`translate(${x + 345},${y + 380}) scale(${0.8 + 0.2 * r.s})`}>
          <rect x={-300} y={-62} width={600} height={104} fill={bom ? '#12281b' : '#2a1512'} stroke={bom ? K.verde : K.verm} strokeWidth={4} />
          <text x={0} y={14} textAnchor="middle" fontFamily={TIT} fontSize={Math.min(70, 560 / (0.47 * c[2].length))} fill={bom ? K.verde : K.verm} letterSpacing={2}>{c[2]}</text>
        </g>}
      </g>);
    });
  }
  if (v.rank) {
    const t0 = desde('rank'), it: string[] = v.rank.it, y0 = 540 - (it.length * 150) / 2 + 30;
    el.push(<text key="rt" x={960} y={y0 - 50} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={Math.min(50, 1300 / (0.56 * v.rank.tit.length))} fill={K.cinza} opacity={L(g, [t0, t0 + 8], [0, 1])} letterSpacing={2}>{v.rank.tit}</text>);
    it.forEach((txt, n) => {
      const s = pop(g, t0 + 8 + n * 22); if (s <= 0) return; const y = y0 + n * 150, forte = n === 0;
      el.push(<g key={'r' + n} opacity={Math.min(1, s)} transform={`translate(${(1 - Math.min(1, s)) * 60},0)`}>
        <rect x={420} y={y} width={1080} height={118} fill={forte ? '#1d1513' : K.painel} stroke={forte ? K.verm : '#2c2c31'} strokeWidth={forte ? 4 : 2} />
        <rect x={420} y={y} width={132} height={118} fill={forte ? K.verm : '#2c2c31'} />
        <text x={486} y={y + 84} textAnchor="middle" fontFamily={TIT} fontSize={76} fill={forte ? K.osso : K.cinza}>{`#${n + 1}`}</text>
        <text x={590} y={y + 84} fontFamily={TIT} fontSize={76} fill={forte ? K.osso : K.cinza} letterSpacing={2}>{txt}</text>
      </g>);
    });
  }
  if (v.barras) {
    const t0 = desde('barras', (x) => x && x.it), it: any[] = v.barras.it, mx = Math.max(...it.map((x) => x[1]));
    const x0 = v.barras.lado ? 820 : 360, wMax = v.barras.lado ? 760 : 900, y0 = 540 - (it.length * 190) / 2;
    it.forEach((x, n) => {
      const p = L(g, [t0 + n * 12, t0 + n * 12 + 22], [0, 1]), w = (wMax * x[1] * p) / mx, y = y0 + n * 190;
      el.push(<g key={'b' + n} opacity={L(g, [t0 + n * 12, t0 + n * 12 + 5], [0, 1])}>
        <text x={x0} y={y + 30} fontFamily={SANS} fontWeight={800} fontSize={40} fill={K.cinza} letterSpacing={2}>{x[0]}</text>
        <rect x={x0} y={y + 50} width={Math.max(4, w)} height={84} fill={COR[x[2]] || K.osso} />
        <text x={x0 + w + 24} y={y + 118} fontFamily={TIT} fontSize={88} fill={K.osso} letterSpacing={2}>{(Math.round(x[1] * p * 10) / 10).toFixed(x[1] % 1 ? 1 : 0)}<tspan fontSize={46} fill={K.cinza}>{v.barras.un}</tspan></text>
      </g>);
    });
    if (v.barras.nota) { const tn = desde('barras', (x) => x && x.nota), e = entra(g, Math.max(tn, t0 + 30)); el.push(<text key="bn" x={1700} y={y0 - 40} textAnchor="end" fontFamily={TIT} fontSize={170 * (0.8 + 0.2 * e.s)} fill={K.verm} opacity={e.o} letterSpacing={2}>{v.barras.nota}</text>); }
  }
  if (v.anel) {
    const t0 = desde('anel', (x) => x && x.seg), seg = Math.max(0, Math.floor((g - t0 - 10) / 30));
    el.push(<Anel key="an" cx={1380} cy={480} r={190} p={Math.min(1, (g - t0 - 10) / 30 / v.anel.seg)} rot={`0:${String(seg).padStart(2, '0')}`} sub="and counting" op={L(g, [t0, t0 + 10], [0, 1])} />);
    el.push(<text key="ant" x={1380} y={790} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={K.osso} opacity={L(g, [t0 + 14, t0 + 24], [0, 1])}><Tx txt={v.anel.txt || 'stand TALL · hold · time it'} /></text>);
  }
  if (v.aviso) {
    const t0 = desde('aviso');
    el.push(<g key="av" opacity={L(g, [t0 + 10, t0 + 22], [0, 1])} transform={`translate(0,${v.tl !== undefined ? 90 : 0})`}><rect x={1370} y={64} width={440} height={50} fill="none" stroke={K.ambar} strokeWidth={2.5} /><text x={1590} y={98} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={K.ambar}>BE SAFE · go slowly · stop if it hurts</text></g>);
  }
  const tm = v.mao ? desde('mao') : 0, em = entra(g, tm);
  // câmera (#06+): zoom e foco passam da fala anterior para a atual em 18 quadros
  const ant = i > 0 ? est[i - 1] : est[i], kz = L(g, [ts[i], ts[i] + 18], [0, 1]);
  const z0 = ant.zoom || 1, z1 = v.zoom || 1, f0 = ant.foco || [960, 540], f1 = v.foco || [960, 540];
  const zc = z0 + (z1 - z0) * kz, fx = f0[0] + (f1[0] - f0[0]) * kz, fy = f0[1] + (f1[1] - f0[1]) * kz;
  const imp = (b.falas[i].v || {}).imp ? g - ts[i] : 1e9, sh = imp >= 0 && imp < 8 ? (imp % 2 ? 1 : -1) * 9 * (1 - imp / 8) : 0;
  const objs: V[] = v.obj || [];
  const desdeObj = (n: number) => desde('obj', (x) => x && x[n]);
  const antesObj = (n: number) => { let j = i; while (j > 0 && J(est[j - 1].obj && est[j - 1].obj[n]) === J(v.obj && v.obj[n])) j--; return j > 0 ? (est[j - 1].obj || [])[n] : undefined; };
  return (<>
    <AbsoluteFill style={{ transformOrigin: `${fx}px ${fy}px`, transform: `translate(${sh}px,${sh * 0.6}px) scale(${zc * (1 + 0.035 * Math.min(1, g / D)) * punch})` }}>
      {objs.length > 0 && <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}><Objetos g={g} lista={objs} desde={desdeObj} antes={antesObj} /></svg>}
      {v.mao && <div style={{ position: 'absolute', left: 90 - (1 - em.o) * 40, top: 170 + Math.sin(g / 15) * 4, width: 800, opacity: em.o }}>
        <Img src={staticFile('snb/poses/mao_close.png')} style={{ width: 800, transform: `rotate(${Math.sin(g / 21) * 0.8}deg)` }} />
      </div>}
      {v.icone && <Icone g={g} ini={desde('icone')} tipo={v.icone} />}
      {figs.map((f, n) => <Pose key={f.p + f.x} g={g} ini={desde('figs', (x) => x && x[n] && [x[n].p, x[n].x])} f={f} brilho={n === 0 ? v.brilho : undefined} />)}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {anda && Array.from({ length: 9 }).map((_, n) => { const x = ((n * 150 - g * 9) % 1350 + 1350) % 1350 + 60; return <rect key={n} x={x} y={BASE + 22} width={70} height={5} fill={K.osso} opacity={0.22 * Math.min(1, x / 200, (1410 - x) / 200) * (lado && !centro ? 1 : 0.6)} />; })}
        {figs.length === 2 && figs[0].x < 600 && !v.cart && <text x={(figs[0].x + figs[1].x) / 2} y={600} textAnchor="middle" fontFamily={TIT} fontSize={64} fill={K.cinza} opacity={0.75 * L(g, [8, 18], [0, 1])}>VS</text>}
        {el}
        {b.et && v.tl === undefined && <Etiqueta g={g} ini={4} txt={b.et} />}
        {b.fonte && <text x={960} y={1034} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={25} fill={K.cinza} opacity={L(g, [10, 22], [0, 1])}>{b.fonte}</text>}
      </svg>
    </AbsoluteFill>
    {v.face && <Rosto g={g} t0={desde('face', (x) => x && x.p)} f={v.face} />}
    {v.tl !== undefined && <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}><Linha g={g} tl={v.tl} ini={desde('tl')} /></svg>}
    {imp >= 0 && imp < 10 && <AbsoluteFill style={{ background: K.verm, opacity: 0.32 * (1 - imp / 10), mixBlendMode: 'screen' }} />}
  </>);
};

export const SNBVideo: React.FC<{ tempos: TemposSNB }> = ({ tempos }) => {
  const f = useCurrentFrame(); const X = 6; const n = tempos.blocos.length, fimV = Math.ceil(tempos.total * 30);
  return (
    <AbsoluteFill style={{ background: K.fundo, overflow: 'hidden' }}>
      {tempos.blocos.map((b, i) => {
        const ini = Math.round(b.ini * 30), fim = i === n - 1 ? fimV + 30 : Math.round(b.fim * 30);
        if (f < ini - X || f > fim + X) return null;
        const op = L(f, [ini - X, ini + X], [0, 1]) * (i === n - 1 ? 1 : L(f, [fim - X, fim + X], [1, 0]));
        return <AbsoluteFill key={i} style={{ opacity: i === 0 ? 1 : op }}><Cena g={Math.max(0, f - ini)} D={fim - ini} b={b} ini={ini} /></AbsoluteFill>;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay' }}><Img src={staticFile(`fx/grain${f % 4}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
      <AbsoluteFill style={{ background: '#000', opacity: Math.max(L(f, [0, 8], [1, 0]), L(f, [fimV - 20, fimV - 2], [0, 1])) }} />
    </AbsoluteFill>
  );
};
