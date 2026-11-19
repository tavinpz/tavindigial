import React from 'react';
import { Easing } from 'remotion';
import { M, MONO, P, Rot, SANS, TIT } from './lib';
import { COR, Ctx, L, Txt, cabe, pop } from './base';

// Diagramas genéricos do Hard to Copy, guiados só pelos dados do roteiro (campo v de cada fala).
// Servem a qualquer vídeo: barras, cadeia, linhaT, par, rosca, grade, versus, pilha, comp.

// barras: it = [[rótulo, valor, texto do valor, cor?]]; passo i mostra a barra i. cab = legenda em cima.
const Barras: React.FC<Ctx> = ({ v, a }) => {
  const it: any[][] = v.it || [], n = it.length, passo = Math.min(132, 540 / n), y0 = 610 - (n * passo) / 2, max = Math.max(...it.map((x) => x[1])), xl = 600, bw = Math.min(880, 1180 - Math.max(...it.map((x) => String(x[2]).length)) * 30);
  return (
    <g>
      {v.cab && <g opacity={a(0, 10)}><Rot x={xl} y={y0 - 26} t={v.cab} tam={20} /></g>}
      {it.map((x, i) => {
        const p = a(i + 1, 26); if (p <= 0) return null; const cor = COR[x[3]] || P.fantasma, y = y0 + i * passo, l = Math.max(5, (x[1] / max) * bw * p), forte = cor !== P.fantasma;
        return (
          <g key={i} opacity={Math.min(1, p * 4)}>
            <Txt x={xl - 30} y={y + passo * 0.5 + 12} textAnchor="end" s={cabe(x[0], 470, 40)} c={forte ? P.osso : P.cinza}>{x[0]}</Txt>
            <rect x={xl} y={y + passo * 0.2} width={l} height={passo * 0.56} rx={4} fill={cor} />
            <Txt x={xl + l + 22} y={y + passo * 0.5 + 17} s={Math.min(54, passo * 0.46)} c={forte ? cor : P.osso}>{x[2]}</Txt>
          </g>
        );
      })}
    </g>
  );
};

// cadeia: it = [[linha1, linha2, cor?]] em fila com setas; passo i mostra a caixa i. x = índices riscados a partir do passo xn. leg = frase embaixo no passo ln.
const Cadeia: React.FC<Ctx> = ({ g, v, a, q }) => {
  const it: any[][] = v.it || [], n = it.length, vao = n > 4 ? 44 : 70, bw = Math.min(500, (1728 - (n - 1) * vao) / n), bh = 250, x0 = 960 - (n * bw + (n - 1) * vao) / 2, y = 450, xs: number[] = v.x || [], xn = v.xn || n + 1;
  return (
    <g>
      {it.map((x, i) => {
        const p = a(i + 1, 12), s = pop(g, q(i + 1)); if (p <= 0) return null; const cor = COR[x[2]] || P.fantasma, bx = x0 + i * (bw + vao), risc = xs.includes(i) ? a(xn, 10) : 0;
        return (
          <g key={i} opacity={p} transform={`translate(0,${(1 - Math.min(1, s)) * 30})`}>
            {i > 0 && <line x1={bx - vao + 8} y1={y + bh / 2} x2={bx - 12} y2={y + bh / 2} stroke={P.osso} strokeWidth={3} markerEnd="url(#seta)" strokeDasharray="8 8" strokeDashoffset={-g} />}
            <rect x={bx} y={y} width={bw} height={bh} rx={12} fill={P.painel} stroke={cor} strokeWidth={cor === P.fantasma ? 2.5 : 4} opacity={1 - 0.5 * risc} />
            <Txt x={bx + bw / 2} y={y + 70} textAnchor="middle" s={76} c={cor} opacity={0.22}>{i + 1}</Txt>
            <Txt x={bx + bw / 2} y={y + 146} textAnchor="middle" s={cabe(x[0], bw - 44, 64)} c={cor === P.fantasma ? P.osso : cor} opacity={1 - 0.5 * risc}>{x[0]}</Txt>
            {x[1] && <Rot x={bx + bw / 2} y={y + 198} t={x[1]} anc="middle" tam={Math.min(22, (bw - 30) / (0.66 * x[1].length))} esp={1} cor={P.osso} />}
            {risc > 0 && <path d={`M ${bx + 30},${y + 30} L ${bx + bw - 30},${y + bh - 30} M ${bx + bw - 30},${y + 30} L ${bx + 30},${y + bh - 30}`} stroke={P.verm} strokeWidth={9} strokeLinecap="round" opacity={risc} />}
          </g>
        );
      })}
      {v.leg && <g opacity={a(v.ln || n + 1, 12)}><Rot x={960} y={y + bh + 90} t={v.leg} anc="middle" cor={P.ambar} peso={700} tam={26} /></g>}
    </g>
  );
};

// linhaT: pts = [[ano, linha1, linha2?]]; passo i mostra o ponto i; passo pts.length+1 mostra o vão: vao = [texto grande, legenda].
const LinhaT: React.FC<Ctx> = ({ g, v, a, q }) => {
  const pts: any[][] = v.pts || [], n = pts.length, de = v.de ?? pts[0][0], ate = v.ate ?? pts[n - 1][0], xa = 260, xb = 1660, y = 560, X = (ano: number) => xa + ((ano - de) / (ate - de)) * (xb - xa);
  let fim = xa; pts.forEach((p, i) => { if (i > 0) fim += (X(p[0]) - X(pts[i - 1][0])) * a(i + 1, 26); else fim = X(p[0]); });
  const b = a(n + 1, 18), vao: string[] = v.vao || [];
  return (
    <g>
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={P.linha} strokeWidth={6} strokeLinecap="round" /><line x1={X(pts[0][0])} y1={y} x2={fim} y2={y} stroke={P.menta} strokeWidth={6} strokeLinecap="round" opacity={a(1, 8)} />
      {pts.map((p, i) => { const o = a(i + 1, 10), s = pop(g, q(i + 1)), baixo = i % 2 === 1 && n > 3 ? 128 : 0, anc = X(p[0]) < xa + 160 ? 'start' : X(p[0]) > xb - 160 ? 'end' : 'middle'; return (
        <g key={i} opacity={o}>
          {baixo > 0 && <line x1={X(p[0])} y1={y + 20} x2={X(p[0])} y2={y + baixo + 34} stroke={P.fantasma} strokeWidth={2} strokeDasharray="3 7" />}
          <circle cx={X(p[0])} cy={y} r={14 * Math.min(1.15, s)} fill={P.fundo} stroke={COR[p[3]] || P.menta} strokeWidth={5} />
          <Txt x={X(p[0])} y={y + 96 + baixo} textAnchor={anc} s={64} c={COR[p[3]] || P.osso}>{p[4] || String(p[0])}</Txt>
          <Rot x={X(p[0])} y={y + 134 + baixo} t={p[1]} anc={anc as any} tam={20} />{p[2] && <Rot x={X(p[0])} y={y + 162 + baixo} t={p[2]} anc={anc as any} tam={20} />}
        </g>); })}
      {vao.length > 0 && (
        <g opacity={b}>
          <path d={`M ${X(v.v0 ?? de)},${y - 56} v -30 h ${(X(v.v1 ?? ate) - X(v.v0 ?? de)) * b} v 30`} fill="none" stroke={P.ambar} strokeWidth={3.5} />
          <Txt x={(X(v.v0 ?? de) + X(v.v1 ?? ate)) / 2} y={y - 150} textAnchor="middle" s={cabe(vao[0], 1300, 150)} c={P.ambar}>{vao[0]}</Txt>
          {vao[1] && <Rot x={(X(v.v0 ?? de) + X(v.v1 ?? ate)) / 2} y={y - 108} t={vao[1]} anc="middle" tam={20} cor={P.ambar} peso={700} />}
        </g>
      )}
    </g>
  );
};

// par: duas caixas (A = [papel, nome, sub], B idem) e o que corre entre elas. elo (passo 1), fl = [[texto, dir]] (passos 2...), fala = linhas no passo fl.length+2.
const Par: React.FC<Ctx> = ({ g, v, a }) => {
  const ax = 150, bx = 1130, y = 360, cw = 640, ch = 250, fl: any[][] = v.fl || [], fala: string[] = v.fala || [];
  const Caixa: React.FC<{ x: number; d: string[]; at: number; cor: string }> = ({ x, d, at, cor }) => (
    <g opacity={L(g, [at, at + 12], [0, 1])} transform={`translate(0,${L(g, [at, at + 12], [30, 0])})`}>
      <rect x={x} y={y} width={cw} height={ch} rx={10} fill={P.painel} stroke={cor} strokeWidth={3.5} /><Rot x={x + 34} y={y + 52} t={d[0]} tam={18} />
      <text x={x + 34} y={y + 142} fontFamily={TIT} fontWeight={700} fontSize={cabe(d[1], cw - 68, 84)} fill={P.osso} letterSpacing={-2}>{d[1]}</text><Rot x={x + 34} y={y + 198} t={d[2] || ''} cor={cor} tam={20} peso={700} />
    </g>
  );
  const A = v.a || ['', '', ''], B = v.b || ['', '', ''], meio = (ax + cw + bx) / 2;
  return (
    <g>
      <Caixa x={ax} d={A} at={4} cor={COR[v.ca] || P.menta} /><Caixa x={bx} d={B} at={12} cor={COR[v.cb] || P.menta} />
      {v.elo && <g opacity={a(1, 12) * (1 - a(2, 8))}><line x1={ax + cw + 14} y1={y + ch / 2} x2={bx - 14} y2={y + ch / 2} stroke={P.menta} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-g} /><Rot x={meio} y={y + ch / 2 - 22} t={v.elo} cor={P.menta} tam={18} anc="middle" peso={700} esp={0.5} /></g>}
      {fl.map((f, i) => { const p = a(i + 2, 16), dy = 62 + i * 76, dir = f[1] ?? 1; return p <= 0 ? null : (
        <g key={i} opacity={Math.min(1, p * 3)}>
          {dir > 0 ? <line x1={ax + cw + 14} y1={y + dy} x2={ax + cw + 14 + (bx - 32 - ax - cw) * p} y2={y + dy} stroke={P.ambar} strokeWidth={3} markerEnd="url(#setaA)" />
            : <line x1={bx - 14} y1={y + dy} x2={bx - 14 - (bx - 32 - ax - cw) * p} y2={y + dy} stroke={P.ambar} strokeWidth={3} markerEnd="url(#setaA)" />}
          <Rot x={meio} y={y + dy - 14} t={f[0]} cor={P.ambar} tam={Math.min(18, 300 / (0.62 * f[0].length))} anc="middle" peso={700} esp={0} />
        </g>); })}
      {fala.length > 0 && (
        <g opacity={a(fl.length + 2, 14)} transform={`translate(960,${y + ch + 110})`}>
          {fala.map((l, i) => <text key={i} y={i * 56} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={cabe(l, 1600, 40, 0.5)} fill={i === 0 ? P.osso : P.ambar}>{l}</text>)}
        </g>
      )}
    </g>
  );
};

// rosca: pc = fatia (0 a 100) no passo 1; t/sub ao lado; linhas = frases extras nos passos 2...
const Rosca: React.FC<Ctx> = ({ g, v, a }) => {
  const cx = 520, cy = 590, r = 210, c = 2 * Math.PI * r, p = a(1, 40), pc = (v.pc || 0) * p, linhas: string[] = v.linhas || [], cor = COR[v.cor] || P.menta;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.linha} strokeWidth={64} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.fantasma} strokeWidth={64} strokeDasharray="6 10" opacity={0.6} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={64} strokeDasharray={`${(pc / 100) * c} ${c}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <Txt x={cx} y={cy + 40} textAnchor="middle" s={Number.isInteger(v.pc) ? 130 : 104} c={cor} ls={-5}>{(v.pre || '') + (Number.isInteger(v.pc) ? Math.round(pc) : pc.toFixed(1)) + '%'}</Txt>
      {v.resto && <g opacity={a(1, 10, 30)}><Rot x={cx} y={cy + r + 90} t={v.resto} anc="middle" tam={20} /></g>}
      <g opacity={a(1, 12, 10)}>
        <Txt x={900} y={470} s={cabe(v.t || '', 900, 84)} c={P.osso}>{v.t}</Txt>
        {v.sub && <text x={902} y={530} fontFamily={SANS} fontWeight={500} fontSize={cabe(v.sub, 900, 36, 0.5)} fill={P.cinza}>{v.sub}</text>}
      </g>
      {linhas.map((l, i) => <g key={i} opacity={a(i + 2, 12)} transform={`translate(${(1 - a(i + 2, 12)) * 30},0)`}><circle cx={912} cy={618 + i * 70} r={7 + (i === linhas.length - 1 ? 2 * Math.sin(g / 6) : 0)} fill={P.ambar} /><text x={940} y={630 + i * 70} fontFamily={SANS} fontWeight={600} fontSize={cabe(l, 860, 38, 0.5)} fill={P.osso}>{l}</text></g>)}
    </g>
  );
};

// grade: tot pontos (cada um = "cada"); passo 1 enche, passo 2 acende lit pontos. r1 = [número, rótulo], r2 = [número, rótulo].
const Grade: React.FC<Ctx> = ({ g, v, a }) => {
  const tot = v.tot || 900, cols = tot > 620 ? 50 : 45, lin = Math.ceil(tot / cols), px = 30, x0 = 960 - (cols * px) / 2 + 15, y0 = lin > 13 ? 262 : 560 - (lin * px) / 2 - 40, on = a(1, 40), lit = a(2, 40), nl = v.lit || 0, r1 = v.r1 || [0, ''], r2 = v.r2;
  return (
    <g>
      {Array.from({ length: tot }, (_, i) => {
        const cx = i % cols, cy = Math.floor(i / cols); if ((cx + cy * 1.5) / (cols + lin * 1.5) > on) return null;
        const aceso = i < nl && i / nl < lit;
        return <circle key={i} cx={x0 + cx * px} cy={y0 + cy * px} r={aceso ? 9 : 7} fill={aceso ? P.menta : P.fantasma} opacity={aceso ? 0.85 + 0.15 * Math.sin(g / 6 + i) : 0.8} />;
      })}
      {v.cada && <Rot x={x0 - 10} y={y0 + lin * px + 20} t={v.cada} tam={18} />}
      <g opacity={a(1, 10)}><Txt x={M + 150} y={y0 + lin * px + 110} s={90} c={P.osso}>{typeof r1[0] === 'number' ? Math.round(r1[0] * on).toLocaleString('en-US') + (r1[2] || '') : r1[0]}</Txt><Rot x={M + 150} y={y0 + lin * px + 150} t={r1[1]} tam={22} /></g>
      {r2 && <g opacity={a(2, 10)}><Txt x={1060} y={y0 + lin * px + 110} s={90} c={P.menta}>{typeof r2[0] === 'number' ? Math.round(r2[0] * lit).toLocaleString('en-US') + (r2[2] || '') : r2[0]}</Txt><Rot x={1060} y={y0 + lin * px + 150} t={r2[1]} tam={22} cor={P.menta} peso={700} /></g>}
    </g>
  );
};

// versus: cartão A (a cópia, tracejado cinza) e cartão B (o original, menta). a/b = título; la/lb = linhas; a linha i entra no passo i+1.
const Versus: React.FC<Ctx> = ({ g, v, a, q }) => {
  const la: string[] = v.la || [], lb: string[] = v.lb || [], n = Math.max(la.length, lb.length), h = 170 + n * 84, y = 590 - h / 2;
  const Cartao: React.FC<{ x: number; t: string; ls: string[]; orig: boolean; rot?: string }> = ({ x, t, ls, orig, rot }) => (
    <g>
      <rect x={x} y={y} width={780} height={h} rx={14} fill={orig ? '#101C17' : P.painel} stroke={orig ? P.menta : P.cinza} strokeWidth={orig ? 4 : 3} strokeDasharray={orig ? undefined : '12 10'} />
      {rot && <Rot x={x + 40} y={y + 50} t={rot} tam={18} cor={orig ? P.menta : P.cinza} peso={700} />}
      <Txt x={x + 40} y={y + 116} s={cabe(t, 700, 60)} c={orig ? P.menta : P.osso}>{t}</Txt>
      {ls.map((l, i) => { const p = a(i + 1, 10), s = pop(g, q(i + 1)); return <g key={i} opacity={p} transform={`translate(${(1 - Math.min(1, s)) * 30},0)`}><circle cx={x + 52} cy={y + 190 + i * 84} r={7} fill={orig ? P.menta : P.cinza} /><text x={x + 78} y={y + 202 + i * 84} fontFamily={SANS} fontWeight={600} fontSize={cabe(l, 660, 36, 0.5)} fill={P.osso}>{l}</text></g>; })}
    </g>
  );
  return (<g><Cartao x={150} t={v.a || ''} ls={la} orig={false} rot={v.ra} /><Cartao x={990} t={v.b || ''} ls={lb} orig rot={v.rb} /></g>);
};

// pilha: it = [[nome, nota, cor?]] de baixo para cima; a camada i entra no passo i+1. sai = índice que desliza para fora no passo sn (o resto fica de pé).
const Pilha: React.FC<Ctx> = ({ g, v, a, q }) => {
  const it: any[][] = v.it || [], n = it.length, h = Math.min(112, 580 / n), larg = 1100, x = 960 - larg / 2, yb = 600 + (n * h) / 2, sn = v.sn || n + 1;
  return (
    <g>
      {it.map((c, i) => {
        const esc = q(i + 1) === q(1) ? i * 4 : 0, p = a(i + 1, 12, esc), s = pop(g, q(i + 1) + esc); if (p <= 0) return null; const cor = COR[c[2]] || P.fantasma, y = yb - (i + 1) * h, fora = v.sai === i ? a(sn, 26) : 0, forte = cor !== P.fantasma;
        return (
          <g key={i} opacity={p * (1 - fora)} transform={`translate(${fora * 520},${-(1 - Math.min(1, s)) * 50 - fora * 40}) rotate(${fora * 9} ${x + larg} ${y})`}>
            <rect x={x} y={y + 5} width={larg} height={h - 10} rx={10} fill={forte ? '#101C17' : P.painel} stroke={cor} strokeWidth={forte ? 4 : 2.5} />
            <Txt x={x + 36} y={y + h / 2 + 18} s={Math.min(54, h * 0.5)} c={forte ? cor : P.osso}>{c[0]}</Txt>
            {c[1] && <Rot x={x + larg - 36} y={y + h / 2 + 8} t={c[1]} anc="end" tam={Math.min(22, 520 / (0.66 * c[1].length))} cor={P.cinza} esp={1} />}
          </g>
        );
      })}
      <line x1={x - 60} y1={yb + 4} x2={x + larg + 60} y2={yb + 4} stroke={P.fantasma} strokeWidth={2.5} />
    </g>
  );
};

// comp: quanto sobra depois de N passos seguidos, cada um com acerto "base". Passo 1 eixos, 2 curva da cópia, 3 resultado, 4 curva do original (base2).
const Comp: React.FC<Ctx> = ({ g, v, a, q }) => {
  const N = v.N || 1000, b1 = v.base || 0.999, b2 = v.base2 || 0.9999, xa = 250, xb = 1380, yb = 840, yt = 340, X = (k: number) => xa + (k / N) * (xb - xa), Y = (f: number) => yb - f * (yb - yt);
  const p1 = L(g, [q(2), q(2) + 80], [0, 1], Easing.inOut(Easing.quad)), p2 = L(g, [q(4), q(4) + 50], [0, 1], Easing.inOut(Easing.quad));
  const curva = (b: number, p: number) => { let d = ''; const ate = Math.round(N * p); for (let k = 0; k <= ate; k += Math.max(1, Math.round(N / 120))) d += `${k ? 'L' : 'M'} ${X(k)},${Y(Math.pow(b, k))} `; d += `L ${X(ate)},${Y(Math.pow(b, ate))}`; return d; };
  const k1 = Math.round(N * p1), f1 = Math.pow(b1, k1), fim1 = Math.pow(b1, N), fim2 = Math.pow(b2, N);
  return (
    <g>
      <g opacity={a(1, 12)}>
        <line x1={xa} y1={yb} x2={xb} y2={yb} stroke={P.fantasma} strokeWidth={3} /><line x1={xa} y1={yb} x2={xa} y2={yt - 20} stroke={P.fantasma} strokeWidth={3} />
        {[0, 0.5, 1].map((f) => <g key={f}><line x1={xa - 12} y1={Y(f)} x2={xb} y2={Y(f)} stroke={P.linha} strokeWidth={2} /><Rot x={xa - 24} y={Y(f) + 7} t={`${f * 100}%`} anc="end" tam={20} /></g>)}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => <Rot key={f} x={X(N * f)} y={yb + 40} t={Math.round(N * f).toLocaleString('en-US')} anc="middle" tam={20} />)}
        <Rot x={(xa + xb) / 2} y={yb + 78} t={v.ex || 'STEPS IN A ROW'} anc="middle" tam={20} cor={P.osso} peso={700} /><Rot x={xa} y={yt - 44} t={v.ey || 'CHIPS THAT STILL WORK'} tam={20} cor={P.osso} peso={700} />
      </g>
      {p1 > 0 && <path d={curva(b1, p1)} fill="none" stroke={P.cinza} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />}
      {p1 > 0 && p1 < 1 && <g><circle cx={X(k1)} cy={Y(f1)} r={10} fill={P.ambar} /><Rot x={X(k1) + 18} y={Y(f1) - 16} t={`STEP ${k1} · ${(f1 * 100).toFixed(0)}%`} cor={P.ambar} peso={700} tam={22} /></g>}
      {p2 > 0 && <path d={curva(b2, p2)} fill="none" stroke={P.menta} strokeWidth={7} strokeLinecap="round" />}
      <g opacity={a(2, 10)}><Rot x={1450} y={400} t={v.l1 || ''} cor={P.cinza} peso={700} tam={19} esp={0.5} /></g>
      <g opacity={a(3, 8)} transform={`translate(1450,${470 + (1 - Math.min(1, pop(g, q(3)))) * 30})`}><Txt s={150} c={P.ambar} y={70} ls={-6}>{(fim1 * 100).toFixed(0)}%</Txt><Rot x={4} y={112} t={v.f1 || 'OF THE CHIPS WORK'} tam={20} cor={P.ambar} peso={700} /></g>
      <g opacity={a(4, 10)}><Rot x={1450} y={660} t={v.l2 || ''} cor={P.menta} peso={700} tam={19} esp={0.5} /><g opacity={L(p2, [0.8, 1], [0, 1])}><Txt x={1450} y={790} s={150} c={P.menta} ls={-6}>{(fim2 * 100).toFixed(0)}%</Txt></g></g>
      {void MONO}
    </g>
  );
};

export const GEN: Record<string, React.FC<any>> = { barras: Barras, cadeia: Cadeia, linhaT: LinhaT, par: Par, rosca: Rosca, grade: Grade, versus: Versus, pilha: Pilha, comp: Comp };
