import React from 'react';
import { Cota, M, P, Rot, SANS } from './lib';
import { Ctx, L, Txt, pop, rnd } from './base';

// Hard to Copy #04 (laser da TRUMPF): diagramas sob medida. Vermelho = o feixe do laser (infravermelho), violeta = a luz EUV, menta = a peça original.

// tiro: o laser acertando as gotas de estanho. Passo 1 um tiro por gota, 2 dois tiros (pré-pulso e pulso principal), 3 o contador.
const Tiro: React.FC<Ctx> = ({ g, a, q }) => {
  const fx = 1180, fy = 560, per = 18, f = g % per, dois = a(2, 1) > 0, pre = dois && f < 6, bate = dois ? (f < 6 ? L(f, [0, 2, 6], [0.55, 0.45, 0.1]) : L(f, [6, 8, per], [1, 0.9, 0.1])) : L(f, [0, 3, per], [1, 0.9, 0.12]), e3 = a(3, 10);
  return (
    <g>
      <line x1={fx} y1={150} x2={fx} y2={930} stroke={P.linha} strokeWidth={2} strokeDasharray="3 10" />
      {Array.from({ length: 7 }, (_, k) => { const y = 150 + ((k * 130 + g * (130 / per)) % 780), perto = Math.abs(y - fy) < 60; return y < fy - 4 ? <ellipse key={k} cx={fx} cy={y} rx={perto && dois ? 11 + (60 - Math.abs(y - fy)) * 0.25 : 11} ry={perto && dois ? 11 - (60 - Math.abs(y - fy)) * 0.09 : 11} fill={P.osso} /> : <circle key={k} cx={fx} cy={y} r={5} fill={P.osso} opacity={0.18} />; })}
      <Rot x={fx + 34} y={176} t="MOLTEN TIN DROPLETS" tam={20} /><Rot x={fx + 34} y={204} t="250 KM/H" tam={20} cor={P.ambar} peso={700} />
      <line x1={M} y1={fy} x2={fx - 16} y2={fy} stroke={P.verm} strokeWidth={pre ? 4 : 6 + 12 * bate} opacity={0.3 + 0.7 * bate} strokeLinecap="round" />
      <rect x={M} y={fy - 60} width={150} height={120} rx={10} fill={P.painel} stroke={P.verm} strokeWidth={4} /><Txt x={M + 75} y={fy + 14} textAnchor="middle" s={36} c={P.verm}>LASER</Txt>
      <circle cx={fx} cy={fy} r={(pre ? 40 : 90) + 70 * bate} fill={pre ? P.verm : P.luz} opacity={0.3 * bate} filter="url(#halo)" /><circle cx={fx} cy={fy} r={14 + (pre ? 8 : 26) * bate} fill={pre ? P.osso : P.luz} opacity={0.5 + 0.5 * bate} /><circle cx={fx} cy={fy} r={(pre ? 4 : 9) + 9 * bate} fill="#fff" opacity={bate} />
      {!pre && Array.from({ length: 14 }, (_, k) => { const an = (k / 14) * Math.PI * 2 + 0.2, ff = dois ? Math.max(0, f - 6) / (per - 6) : f / per, r1 = 70 + ff * 110, r2 = r1 + 44; return <line key={k} x1={fx + Math.cos(an) * r1} y1={fy + Math.sin(an) * r1} x2={fx + Math.cos(an) * r2} y2={fy + Math.sin(an) * r2} stroke={P.luz} strokeWidth={3.5} strokeLinecap="round" opacity={0.85 * (1 - ff)} />; })}
      <g opacity={a(2, 8)}>
        <rect x={420} y={fy - 150} width={170} height={52} rx={8} fill={pre ? P.osso : 'none'} stroke={P.osso} strokeWidth={3} /><Txt x={505} y={fy - 113} textAnchor="middle" s={30} c={pre ? P.fundo : P.osso}>SHOT 1</Txt>
        <rect x={610} y={fy - 150} width={170} height={52} rx={8} fill={!pre ? P.luz : 'none'} stroke={P.luz} strokeWidth={3} /><Txt x={695} y={fy - 113} textAnchor="middle" s={30} c={!pre ? P.fundo : P.luz}>SHOT 2</Txt>
      </g>
      <g opacity={e3} transform={`translate(${M},${760 + (1 - Math.min(1, pop(g, q(3)))) * 30})`}><Txt s={150} c={P.ambar} ls={-6} y={60}>50,000×</Txt><Rot x={6} y={104} t="EVERY SECOND · ALL DAY · FOR YEARS" tam={24} cor={P.ambar} peso={700} /></g>
      <Rot x={fx + 150} y={fy + 190} t="PLASMA → EUV LIGHT" cor={P.luz} peso={700} tam={20} />
    </g>
  );
};

// alvo: a gota. Passo 1 o bico dispara, 2 o tamanho (contra um fio de cabelo), 3 a velocidade, 4 a quantidade.
const Alvo: React.FC<Ctx> = ({ g, a, q }) => {
  const cx = 430, top = 330, per = 14;
  const Num: React.FC<{ i: number; y: number; t: string; s: string; cor?: string }> = ({ i, y, t, s, cor = P.ambar }) => { const p = a(i, 10), e = pop(g, q(i)); return <g opacity={p} transform={`translate(${1010 + (1 - Math.min(1, e)) * 50},${y})`}><Txt s={112} c={cor} ls={-4}>{t}</Txt><Rot x={4} y={42} t={s} tam={22} /></g>; };
  return (
    <g>
      <rect x={150} y={300} width={600} height={580} rx={30} fill={P.menta} fillOpacity={0.04} stroke={P.mentaEsc} strokeWidth={4} /><Rot x={176} y={864} t="VACUUM CHAMBER" tam={18} cor={P.menta} peso={700} />
      <g opacity={a(1, 10)}><path d={`M ${cx - 46},${top - 30} h 92 l -26,60 h -40 Z`} fill={P.painel} stroke={P.osso} strokeWidth={4} /><Rot x={cx + 70} y={top + 6} t="NOZZLE" tam={20} cor={P.osso} peso={700} />
        {Array.from({ length: 8 }, (_, k) => { const y = top + 40 + ((k * 64 + g * (64 / per) * 2) % 500); return <circle key={k} cx={cx} cy={y} r={8} fill={P.osso} />; })}</g>
      <g opacity={a(2, 12)} transform={`translate(${cx + 40},${top + 120})`}>
        <line x1={-32} y1={150} x2={30} y2={60} stroke={P.osso} strokeWidth={2} strokeDasharray="3 8" />
        <circle cx={130} cy={150} r={130} fill={P.painel} stroke={P.ambar} strokeWidth={4} />
        <rect x={20} y={74} width={220} height={70} rx={4} fill="url(#hachC)" stroke={P.cinza} strokeWidth={3} /><Rot x={130} y={62} t="A HUMAN HAIR · ≈ 70" anc="middle" tam={16} cor={P.cinza} peso={700} esp={1} />
        <circle cx={130} cy={196} r={15} fill={P.osso} /><Cota x1={115} y1={236} x2={145} y2={236} t="30" lado={-1} tam={20} /><Rot x={170} y={202} t="THE DROPLET" tam={16} cor={P.osso} peso={700} esp={1} />
        <Rot x={130} y={308} t="THOUSANDTHS OF A MM" anc="middle" tam={16} cor={P.ambar} peso={700} esp={1} />
      </g>
      <Num i={2} y={420} t="0.03 mm" s="WIDTH OF ONE DROPLET" /><Num i={3} y={620} t="250 km/h" s="70 METERS PER SECOND" /><Num i={4} y={820} t="50,000" s="DROPLETS EVERY SECOND" cor={P.luz} />
      {void rnd}
    </g>
  );
};

// duplo: os dois tiros em câmera lenta. Passo 1 a gota redonda (o feixe passa por fora), 2 o pré-pulso achata, 3 alvo largo, 4 pulso principal, 5 a luz EUV.
const Duplo: React.FC<Ctx> = ({ g, a }) => {
  const y = 560, xs = [380, 960, 1540], ach = a(2, 30), pl = a(4, 16), luz = a(5, 14), p1 = a(1, 14);
  const Quadro: React.FC<{ i: number; t: string; s: string; on: number; cor: string; children: React.ReactNode }> = ({ i, t, s, on, cor, children }) => (
    <g opacity={0.25 + 0.75 * on}>
      <rect x={xs[i] - 250} y={y - 200} width={500} height={400} rx={14} fill={P.painel} stroke={on > 0.5 ? cor : P.fantasma} strokeWidth={on > 0.5 ? 4 : 2.5} />
      <Rot x={xs[i] - 226} y={y - 160} t={t} tam={20} cor={on > 0.5 ? cor : P.cinza} peso={700} />{children}
      <text x={xs[i]} y={y + 250} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill={P.osso} opacity={on}>{s}</text>
    </g>
  );
  return (
    <g>
      <Quadro i={0} t="THE DROPLET" s="Round. Tiny. Most of the beam misses." on={p1 > 0 ? 1 : a(0, 10)} cor={P.osso}>
        {[-46, -23, 23, 46].map((dy) => <line key={dy} x1={xs[0] - 230} y1={y + dy} x2={xs[0] - 230 + 460 * p1} y2={y + dy} stroke={P.verm} strokeWidth={4} opacity={0.55} />)}
        <circle cx={xs[0]} cy={y} r={15} fill={P.osso} />
      </Quadro>
      <Quadro i={1} t="SHOT 1 · THE PRE PULSE" s="Weak. It flattens the droplet." on={a(2, 10)} cor={P.osso}>
        <line x1={xs[1] - 230} y1={y} x2={xs[1] - 30} y2={y} stroke={P.verm} strokeWidth={4} opacity={0.7 * (1 - a(3, 10))} />
        <ellipse cx={xs[1]} cy={y} rx={15 - 9 * ach} ry={15 + 105 * ach} fill={P.osso} />
        <g opacity={a(3, 10)}><Cota x1={xs[1] + 60} y1={y - 120} x2={xs[1] + 60} y2={y + 120} t="WIDE" lado={-1} tam={20} /><Rot x={xs[1] - 40} y={y + 160} t="AND THIN" tam={20} cor={P.ambar} peso={700} anc="end" /></g>
      </Quadro>
      <Quadro i={2} t="SHOT 2 · THE MAIN PULSE" s="Strong. It turns the disc into plasma." on={pl} cor={P.luz}>
        {[-80, -40, 0, 40, 80].map((dy) => <line key={dy} x1={xs[2] - 230} y1={y + dy} x2={xs[2] - 20} y2={y + dy} stroke={P.verm} strokeWidth={7} opacity={0.8 * pl} />)}
        <ellipse cx={xs[2]} cy={y} rx={6 + 60 * pl} ry={120} fill={P.luz} opacity={0.35 * pl} filter="url(#halo)" /><ellipse cx={xs[2]} cy={y} rx={6 + 20 * pl} ry={120 - 20 * pl} fill={P.luz} opacity={0.6 + 0.3 * Math.sin(g / 3)} /><ellipse cx={xs[2]} cy={y} rx={4 + 8 * pl} ry={90} fill="#fff" opacity={0.8 * pl} />
        {Array.from({ length: 9 }, (_, k) => { const an = -1.2 + (k / 8) * 2.4, r1 = 70 + ((g * 5 + k * 17) % 90), r2 = r1 + 30; return <line key={k} x1={xs[2] + 30 + Math.cos(an) * r1} y1={y + Math.sin(an) * r1 * 1.5} x2={xs[2] + 30 + Math.cos(an) * r2} y2={y + Math.sin(an) * r2 * 1.5} stroke={P.luz} strokeWidth={3.5} strokeLinecap="round" opacity={luz * 0.9} />; })}
        <g opacity={luz}><Rot x={xs[2] + 226} y={y + 176} t="EUV LIGHT" tam={20} cor={P.luz} peso={700} anc="end" /></g>
      </Quadro>
      {[0, 1].map((i) => <path key={i} d={`M ${xs[i] + 262},${y} h 46`} stroke={P.osso} strokeWidth={4} markerEnd="url(#seta)" opacity={a(i === 0 ? 2 : 4, 10)} />)}
    </g>
  );
};

// amp: de poucos watts a 40 kW. Passo 1 a semente, 2 os amplificadores, 3 o feixe atravessa e engrossa, 4 o fator, 5 a potência final.
const Amp: React.FC<Ctx> = ({ g, a, q }) => {
  const y = 560, x0 = 150, sw = 210, n = 5, aw = 190, vao = 46, xa = x0 + sw + 70, prog = L(g, [q(3), q(3) + 70], [0, n + 0.6]);
  return (
    <g>
      <g opacity={a(1, 12)}>
        <rect x={x0} y={y - 70} width={sw} height={140} rx={10} fill={P.painel} stroke={P.osso} strokeWidth={3.5} /><Txt x={x0 + sw / 2} y={y - 6} textAnchor="middle" s={44}>SEED</Txt><Rot x={x0 + sw / 2} y={y + 36} t="A FEW WATTS" anc="middle" tam={20} cor={P.ambar} peso={700} />
        <line x1={x0 + sw} y1={y} x2={xa - 6} y2={y} stroke={P.verm} strokeWidth={3} />
      </g>
      {Array.from({ length: n }, (_, i) => { const x = xa + i * (aw + vao), p = a(2, 10, i * 5), on = Math.max(0, Math.min(1, prog - i)), esp = 3 + (i + 1) * 9; return (
        <g key={i} opacity={p}>
          <rect x={x} y={y - 110} width={aw} height={220} rx={10} fill={on > 0 ? '#1B1512' : P.painel} stroke={on > 0 ? P.verm : P.fantasma} strokeWidth={on > 0 ? 4 : 2.5} />
          <Txt x={x + aw / 2} y={y - 60} textAnchor="middle" s={54} c={on > 0 ? P.verm : P.cinza} opacity={0.5}>{i + 1}</Txt>
          {i === 0 && <Rot x={x + aw / 2} y={y + 150} t="≈ 100 W" anc="middle" tam={20} cor={P.osso} peso={700} />}
          <line x1={x - vao + 4} y1={y} x2={x - vao + 4 + (aw + vao - 4) * on} y2={y} stroke={P.verm} strokeWidth={esp} opacity={0.5 + 0.5 * Math.sin(g / 3 + i) * 0.3 + 0.2} strokeLinecap="round" />
        </g>); })}
      <g opacity={a(2, 10, 30)}><Rot x={xa} y={y - 136} t="THE AMPLIFIER CHAIN · EACH STAGE ADDS ENERGY" tam={20} cor={P.osso} /></g>
      <g opacity={a(4, 10)} transform={`translate(${x0},${760 + (1 - Math.min(1, pop(g, q(4)))) * 30})`}><Txt s={104} c={P.ambar} ls={-4} y={60}>× 10,000+</Txt><Rot x={4} y={100} t="AMPLIFICATION, SEED TO OUTPUT" tam={20} cor={P.ambar} peso={700} /></g>
      <g opacity={a(5, 10)} transform={`translate(1010,${760 + (1 - Math.min(1, pop(g, q(5)))) * 30})`}><Txt s={130} c={P.verm} ls={-5} y={60}>40 kW</Txt><Rot x={4} y={100} t="AVERAGE POWER · PEAKS IN THE MEGAWATTS" tam={20} cor={P.verm} peso={700} /></g>
    </g>
  );
};

// eco: o laser fica no andar de baixo; o feixe sobe até a gota e parte dele volta. Passo 1 o porão, 2 o feixe sobe, 3 a gota é um espelho, 4 o eco volta, 5 o perigo e a proteção.
const Eco: React.FC<Ctx> = ({ g, a, q }) => {
  const piso = 620, lx = 170, ly = 690, lw = 620, lh = 170, gx = 1500, gy = 400, cam = [[lx + lw, ly + lh / 2], [1180, ly + lh / 2], [1180, gy], [gx - 18, gy]];
  const comp = cam.slice(1).map((p, i) => Math.hypot(p[0] - cam[i][0], p[1] - cam[i][1])), tot = comp.reduce((s, c) => s + c, 0);
  const pt = (t: number) => { let d = t * tot; for (let i = 0; i < comp.length; i++) { if (d <= comp[i]) return [cam[i][0] + ((cam[i + 1][0] - cam[i][0]) * d) / comp[i], cam[i][1] + ((cam[i + 1][1] - cam[i][1]) * d) / comp[i]]; d -= comp[i]; } return cam[cam.length - 1]; };
  const sobe = a(2, 40), volta = a(4, 50), perigo = a(5, 10), caminho = (t: number) => { let d = `M ${cam[0][0]},${cam[0][1]}`; for (let k = 0.02; k <= t + 0.001; k += 0.02) { const p = pt(Math.min(t, k)); d += ` L ${p[0]},${p[1]}`; } return d; };
  const eco = pt(1 - volta);
  return (
    <g>
      <line x1={M} y1={piso} x2={1824} y2={piso} stroke={P.fantasma} strokeWidth={5} /><Rot x={M} y={piso - 18} t="THE CLEANROOM · THE CHIP MACHINE" tam={18} /><Rot x={M} y={piso + 36} t="THE FLOOR BELOW" tam={18} cor={P.osso} peso={700} />
      <rect x={1290} y={300} width={460} height={250} rx={24} fill={P.menta} fillOpacity={0.04} stroke={P.mentaEsc} strokeWidth={4} /><Rot x={1310} y={332} t="VACUUM CHAMBER" tam={16} cor={P.menta} peso={700} />
      <circle cx={gx} cy={gy} r={13 + 3 * Math.sin(g / 5)} fill={P.osso} /><g opacity={a(3, 10)}><circle cx={gx} cy={gy} r={30 + 4 * Math.sin(g / 5)} fill="none" stroke={P.ambar} strokeWidth={4} /><Rot x={gx + 50} y={gy - 30} t="LIQUID METAL" tam={20} cor={P.ambar} peso={700} /><Rot x={gx + 50} y={gy - 2} t="= A MIRROR" tam={20} cor={P.ambar} peso={700} /></g>
      <g opacity={a(1, 12)}>
        <rect x={lx} y={ly} width={lw} height={lh} rx={12} fill={perigo > 0 ? '#2A1513' : P.painel} stroke={P.verm} strokeWidth={4} opacity={perigo > 0 ? 0.8 + 0.2 * Math.sin(g / 2) : 1} />
        <rect x={lx + 20} y={ly + 30} width={110} height={110} rx={8} fill={P.fundo} stroke={P.osso} strokeWidth={3} /><Rot x={lx + 75} y={ly + 92} t="SEED" anc="middle" tam={18} cor={P.osso} peso={700} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={lx + 160 + i * 112} y={ly + 30} width={92} height={110} rx={8} fill={P.fundo} stroke={P.verm} strokeWidth={2.5} />)}
        <Rot x={lx} y={ly + lh + 36} t="THE LASER · AMPLIFIER CHAIN" tam={20} cor={P.verm} peso={700} />
      </g>
      {sobe > 0 && <path d={caminho(sobe)} fill="none" stroke={P.verm} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />}
      <g opacity={a(2, 10, 30)}><Cota x1={1240} y1={gy} x2={1240} y2={ly + lh / 2} t="UP TO 30 M OF BEAM PATH" lado={-1} tam={18} /></g>
      {volta > 0 && <g><path d={caminho(1)} fill="none" stroke={P.ambar} strokeWidth={4} strokeDasharray="10 12" strokeDashoffset={g * 3} strokeLinecap="round" strokeLinejoin="round" /><circle cx={eco[0]} cy={eco[1]} r={16} fill={P.ambar} /><circle cx={eco[0]} cy={eco[1]} r={34} fill={P.ambar} opacity={0.3} filter="url(#halo)" /></g>}
      <g opacity={a(4, 10)}><Rot x={1010} y={gy - 26} t="THE ECHO COMES BACK" tam={20} cor={P.ambar} peso={700} anc="end" /></g>
      <g opacity={perigo}>
        <path d={`M ${lx + 144},${ly + 16} l 0,138`} stroke={P.menta} strokeWidth={9} strokeLinecap="round" /><Rot x={lx + 144} y={ly + lh + 70} t="↑ PROTECTION" anc="middle" tam={18} cor={P.menta} peso={700} />
        <Txt x={lx + lw + 40} y={ly + lh + 44} s={34} c={P.verm}>AMPLIFIERS MAKE THE ECHO STRONGER</Txt>
      </g>
      {void q}
    </g>
  );
};

export const D04: Record<string, React.FC<any>> = { tiro: Tiro, alvo: Alvo, duplo: Duplo, amp: Amp, eco: Eco };
