// Last State Standing — colagem de papel e mapa sobre papel escuro amassado. Acento laranja.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import topo from '../longo/estados-simples.json';
import { W, H, FA, Objeto, Fita, Emoji, rasgado, sp, conta, prog, clamp, EO } from './comum';
import type { VProps, Vis, Tema } from './comum';

const AB: Record<string, string> = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' };
const PEQ = new Set(['RI', 'DE', 'CT', 'NJ', 'MD', 'MA', 'NH', 'VT', 'DC']);
const PATH = geoPath(null as any);
const EST = ((feature(topo as any, (topo as any).objects.states) as any).features as any[])
  .filter((f) => AB[f.properties.name])
  .map((f) => ({ ab: AB[f.properties.name], d: PATH(f) || '', c: PATH.centroid(f) as [number, number], b: PATH.bounds(f) as [[number, number], [number, number]] }));
const POR: Record<string, (typeof EST)[0]> = {};
EST.forEach((e) => (POR[e.ab] = e));

const TINTA = '#2b2219', CREME = '#efe3c8', LAR = '#ff6b3d';

/** adesivo de papel rasgado */
export const Adesivo: React.FC<{ txt: string; tam?: number; cor?: string; tinta?: string; seed?: number; pad?: string; sub?: string }> = ({ txt, tam = 120, cor = LAR, tinta = '#1a120c', seed = 3, pad = '18px 42px 12px', sub }) => (
  // camada de fibra branca rasgada por trás + papel colorido por cima, com luz de vinco
  <div style={{ background: '#f1e7d3', clipPath: rasgado(seed + 50, 2.6, 22), padding: 7 }}>
    <div style={{ background: cor, clipPath: rasgado(seed, 2.2, 22), padding: pad, filter: 'url(#grao-papel)', textAlign: 'center',
      backgroundImage: 'linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0.10) 62%, rgba(255,255,255,0.08) 100%)' }}>
      <div style={{ fontFamily: FA.cond, fontSize: tam, lineHeight: 1, color: tinta, letterSpacing: 1, whiteSpace: 'nowrap' }}>{txt}</div>
      {sub && <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: tam * 0.26, letterSpacing: 4, color: tinta, opacity: 0.85, marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>}
    </div>
  </div>
);

/** nota de 1 dólar desenhada (papel verde), para rasgar a fatia da renda */
const Nota1: React.FC = () => (
  <div style={{ width: 900, height: 400, background: '#cfdcbf', border: '10px solid #f4f1e4', boxShadow: 'inset 0 0 0 4px #6f8a5d', position: 'relative', filter: 'url(#grao-papel)',
    backgroundImage: 'repeating-linear-gradient(45deg, rgba(60,90,50,0.08) 0 4px, transparent 4px 9px)' }}>
    <div style={{ position: 'absolute', left: 300, top: 60, width: 300, height: 260, borderRadius: '50%', border: '6px solid #6f8a5d', background: 'rgba(240,240,225,0.6)' }} />
    <div style={{ position: 'absolute', left: 30, top: 14, fontFamily: FA.cond, fontSize: 110, color: '#3f5a35' }}>1</div>
    <div style={{ position: 'absolute', right: 30, bottom: 6, fontFamily: FA.cond, fontSize: 110, color: '#3f5a35' }}>1</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center', fontFamily: FA.cond, fontSize: 120, color: '#3f5a35' }}>$1</div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: FA.osw, fontWeight: 700, fontSize: 34, letterSpacing: 10, color: '#3f5a35' }}>EVERY DOLLAR EARNED</div>
  </div>
);

/** etiqueta de fita preta com letra branca (nome em destaque) */
const FitaNome: React.FC<{ txt: string; tam?: number }> = ({ txt, tam = 64 }) => (
  <div style={{ background: '#151210', padding: '10px 30px 6px', clipPath: rasgado(9, 1.4, 18), boxShadow: '0 2px 0 rgba(255,255,255,0.05) inset' }}>
    <div style={{ fontFamily: FA.cond, fontSize: tam, color: '#fbf6ea', letterSpacing: 3, whiteSpace: 'nowrap' }}>{txt}</div>
  </div>
);

/** nota datilografada de fonte */
const Nota: React.FC<{ txt: string }> = ({ txt }) => (
  <div style={{ background: '#f3ecdc', padding: '12px 22px', fontFamily: FA.maq, fontSize: 26, color: '#3a2f24', clipPath: rasgado(5, 1.2, 16), filter: 'url(#grao-papel)', whiteSpace: 'nowrap' }}>{txt}</div>
);

/** mapa creme com siglas; destaque laranja; zoom num estado */
const MapaEUA: React.FC<{ f: number; dur: number; v: Vis }> = ({ f, dur, v }) => {
  const dest: string[] = v.destaque || (v.uf ? [v.uf] : []);
  let s = 1, tx = 0, ty = 0;
  const pz = v.uf ? prog(f, 6, 40, EO) : 0;
  if (v.uf && POR[v.uf]) {
    const [[x0, y0], [x1, y1]] = POR[v.uf].b;
    const alvo = Math.min(2.6, 0.5 * 975 / Math.max(x1 - x0, (y1 - y0) * 1.6));
    s = 1 + (alvo - 1) * pz; tx = (487 - (x0 + x1) / 2) * pz; ty = (305 - (y0 + y1) / 2) * pz;
  }
  const lenta = 1 + 0.02 * (f / Math.max(dur, 1));
  return (
    <svg viewBox="-20 -20 1015 650" width={1280} height={820} style={{ overflow: 'visible' }}>
      <g transform={`translate(487 305) scale(${s * lenta}) translate(${-487 + tx} ${-305 + ty})`}>
        {EST.map((e, i) => {
          const on = dest.includes(e.ab);
          // "todos": cada estado acende em sequência; "grade": carimbo de ordem rápida
          let fill = CREME, op = 1;
          if (v.todos) { const k = (i * 7) % 50; const a = clamp((f - 4 - k * 1.2) / 6); fill = a > 0 && a < 1 ? '#ffd2bf' : CREME; op = 1; if (f > 4 + k * 1.2) fill = (i + Math.floor(f / 7)) % 9 === 0 ? '#ffb39a' : CREME; }
          if (v.grade) { const k = (i * 13) % 50; const a = clamp((f - 2 - k * 0.9) / 5); fill = a > 0 ? `rgba(255,107,61,${0.12 + 0.5 * ((i * 37) % 50) / 50})` : CREME; }
          if (on) fill = LAR;
          return <path key={e.ab} d={e.d} fill={fill} stroke={TINTA} strokeWidth={on ? 2.4 / s : 1.1 / s} strokeLinejoin="round" opacity={op} />;
        })}
        {EST.filter((e) => !PEQ.has(e.ab)).map((e) => (
          <text key={e.ab} x={e.c[0]} y={e.c[1] + 5} textAnchor="middle" fontFamily={FA.osw} fontWeight={700} fontSize={14 / Math.sqrt(s)} fill={dest.includes(e.ab) ? '#1a120c' : TINTA} opacity={0.78}>{e.ab}</text>
        ))}
      </g>
    </svg>
  );
};

/** placa de preço de posto, com dígitos de virar */
const Placa: React.FC<{ f: number; preco: string; de?: string; rotulo: string }> = ({ f, preco, de = '3.00', rotulo }) => {
  const [int, cent] = preco.split('.');
  const dig = (int + (cent || '')).split('');
  const ant = (de.split('.')[0] + (de.split('.')[1] || '')).padEnd(dig.length, '0').split('');
  return (
    <div style={{ width: 720, background: '#1b1a19', borderRadius: 18, padding: '26px 30px 30px', border: '6px solid #3a3734', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }}>
      <div style={{ fontFamily: FA.cond, fontSize: 46, color: '#f2efe6', letterSpacing: 8, textAlign: 'center' }}>REGULAR</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 10, marginTop: 14 }}>
        <div style={{ fontFamily: FA.cond, fontSize: 120, color: '#f2efe6', lineHeight: 1.6, marginRight: 6 }}>$</div>
        {dig.map((d, i) => {
          const ponto = i === int.length;
          const mini = i >= int.length + 2;
          const p = clamp(sp(f - 6 - i * 5, { damping: 18, stiffness: 120 }));
          const mostra = p > 0.5 ? d : ant[i] || '0';
          const altura = mini ? 110 : 220;
          return (
            <React.Fragment key={i}>
              {ponto && <div style={{ width: 22, height: 22, borderRadius: 11, background: '#f2efe6', alignSelf: 'flex-end', marginBottom: 26 }} />}
              <div style={{ width: mini ? 86 : 150, height: altura, background: '#f7f3e8', borderRadius: 10, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 0 #b9b2a2' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FA.cond, fontSize: mini ? 96 : 200, color: '#151210',
                  transform: `scaleY(${Math.abs(Math.cos(p * Math.PI))})` }}>{mostra}</div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, background: 'rgba(0,0,0,0.25)' }} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: '#cfc7b6', textAlign: 'center', marginTop: 20 }}>{rotulo}</div>
    </div>
  );
};

/** placa de madeira pendurada por cordas, balançando */
const Madeira: React.FC<{ f: number; titulo: string; txt: string }> = ({ f, titulo, txt }) => {
  const bal = Math.sin(f / 9) * 3.2 * Math.exp(-f / 40);
  return (
    <div style={{ position: 'relative', width: 980, transformOrigin: '50% -260px', transform: `rotate(${bal}deg)` }}>
      <svg width={980} height={260} style={{ position: 'absolute', top: -260, left: 0 }}>
        <path d="M160 0 L240 258" stroke="#8a6d4a" strokeWidth={8} /><path d="M820 0 L740 258" stroke="#8a6d4a" strokeWidth={8} />
      </svg>
      <svg width={980} height={300} style={{ display: 'block', borderRadius: 14 }}>
        <defs>
          <filter id="veio" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves={4} seed={12} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.27  0 0 0 0 0.14  0 0 0 0 1" result="base" />
            <feColorMatrix in="n" type="matrix" values="0.6 0 0 0 0  0.4 0 0 0 0  0.2 0 0 0 0  0 0 0 0.7 0" result="veios" />
            <feBlend in="veios" in2="base" mode="multiply" />
          </filter>
        </defs>
        <rect width={980} height={300} rx={14} filter="url(#veio)" />
        <rect x={6} y={6} width={968} height={288} rx={10} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={6} />
        <circle cx={240} cy={30} r={10} fill="#2a1e12" /><circle cx={740} cy={30} r={10} fill="#2a1e12" />
        <text x={490} y={150} textAnchor="middle" fontFamily={FA.cond} fontSize={124} fill="#f6ead2" letterSpacing={6} style={{ filter: 'url(#tinta-borrada)' }}>{titulo}</text>
        <text x={490} y={232} textAnchor="middle" fontFamily={FA.osw} fontWeight={700} fontSize={44} fill="#f6ead2" opacity={0.92}>{txt}</text>
      </svg>
    </div>
  );
};

/** recibo saindo da máquina */
const Recibo: React.FC<{ f: number; linha: string; txt: string; rotulo: string }> = ({ f, linha, txt, rotulo }) => {
  const p = prog(f, 0, 34, EO);
  return (
    <div style={{ width: 620, height: 720, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 30, right: 30, top: (1 - p) * 700, background: '#fbf8f1', padding: '40px 40px 60px', fontFamily: FA.maq, color: '#2d2722',
        clipPath: 'polygon(0 0,100% 0,100% 96%,95% 100%,90% 96%,85% 100%,80% 96%,75% 100%,70% 96%,65% 100%,60% 96%,55% 100%,50% 96%,45% 100%,40% 96%,35% 100%,30% 96%,25% 100%,20% 96%,15% 100%,10% 96%,5% 100%,0 96%)' }}>
        <div style={{ textAlign: 'center', fontSize: 30, letterSpacing: 4 }}>* GAS RECEIPT *</div>
        <div style={{ borderTop: '2px dashed #8a8175', margin: '22px 0' }} />
        <div style={{ fontSize: 40 }}>{linha}</div>
        <div style={{ fontSize: 28, opacity: 0.7, marginTop: 8 }}>1 person · 1 year</div>
        <div style={{ borderTop: '2px dashed #8a8175', margin: '26px 0 18px' }} />
        <div style={{ fontSize: 30 }}>TOTAL</div>
        <div style={{ fontFamily: FA.cond, fontSize: 150, lineHeight: 1.05, color: '#1a120c' }}>{conta(txt, prog(f, 20, 50))}</div>
        <div style={{ fontSize: 24, opacity: 0.75 }}>{rotulo}</div>
      </div>
    </div>
  );
};

const Cena: React.FC<VProps> = ({ f, dur, v }) => {
  const t = v.tipo;
  if (t === 'data') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={430} rot={-3} entra="cola" seed={2}><Adesivo txt={v.txt} tam={190} seed={4} /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 120} y={640} rot={2} atraso={8} seed={5}><Nota txt={v.sub} /></Objeto>
  </>);
  if (t === 'bomba') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 80} y={430} rot={-1.5} entra={v.de ? 'cai' : 'baixo'} seed={7}><Placa f={f} preco={v.preco} de={v.de} rotulo={v.rotulo} /></Objeto>
    <Objeto f={f} dur={dur} x={470} y={520} rot={-12} entra="cola" atraso={10} seed={8}><div style={{ background: '#f5ecd6', padding: 22, clipPath: rasgado(14, 3, 14) }}><Emoji n="bomba" tam={190} /></div></Objeto>
    {v.selo && <Objeto f={f} dur={dur} x={1300} y={760} rot={6} entra="carimbo" atraso={18} seed={9}><Adesivo txt={v.selo} tam={64} seed={10} /></Objeto>}
    {v.fonte && <Objeto f={f} dur={dur} x={1350} y={180} rot={3} atraso={14} seed={11}><Nota txt={v.fonte} /></Objeto>}
  </>);
  if (t === 'mapa') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={470} rot={-1} entra="cai" seed={12} sombra={0.7}>
      <div style={{ background: '#e6d7b8', padding: 22, clipPath: rasgado(3, 0.8, 30), filter: 'url(#grao-papel)' }}><MapaEUA f={f} dur={dur} v={v} /></div>
    </Objeto>
    {v.sticker && <Objeto f={f} dur={dur} x={v.sticker.uf ? 560 : W / 2 + 380} y={v.sticker.uf ? 560 : 260} rot={-6} entra="cola" atraso={16} seed={13}><Adesivo txt={v.sticker.txt} tam={120} seed={15} /></Objeto>}
    {v.pergunta && <Objeto f={f} dur={dur} x={W / 2} y={160} rot={1.5} entra="cola" atraso={10} seed={16}><FitaNome txt={v.pergunta} tam={78} /></Objeto>}
    {v.misterio && <Objeto f={f} dur={dur} x={W / 2 - 120} y={520} rot={4} entra="carimbo" atraso={6} seed={17}><div style={{ fontFamily: FA.cond, fontSize: 340, color: LAR, WebkitTextStroke: '8px #1a120c', paintOrder: 'stroke fill' }}>?</div></Objeto>}
    <Fita x={W / 2 - 700} y={90} rot={-28} /><Fita x={W / 2 + 700} y={90} rot={26} />
  </>);
  if (t === 'numero') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={440} rot={-4} entra="carimbo" seed={20}><Adesivo txt={v.txt} tam={360} seed={21} pad="10px 70px 0" sub={v.rotulo} /></Objeto>
  </>);
  if (t === 'placa') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={470} entra="cai" seed={22}><Madeira f={f} titulo={v.titulo} txt={v.txt} /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 280} y={720} rot={-3} atraso={14} seed={23}><Nota txt={v.fonte} /></Objeto>
  </>);
  if (t === 'rank') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 170} y={470} rot={1} entra="cai" seed={24} sombra={0.7}>
      <div style={{ background: '#e6d7b8', padding: 18, clipPath: rasgado(6, 0.8, 30), filter: 'url(#grao-papel)', transform: 'scale(0.78)' }}><MapaEUA f={f} dur={dur} v={v} /></div>
    </Objeto>
    <Objeto f={f} dur={dur} x={420} y={380} rot={-7} entra="carimbo" atraso={10} seed={25}><Adesivo txt={v.pos} tam={230} seed={26} /></Objeto>
    <Objeto f={f} dur={dur} x={470} y={620} rot={3} entra="cola" atraso={18} seed={27}><FitaNome txt={v.nome} tam={84} /></Objeto>
    {v.sub && <Objeto f={f} dur={dur} x={470} y={740} rot={-2} atraso={24} seed={28}><Nota txt={v.sub} /></Objeto>}
  </>);
  if (t === 'galoes') {
    const n = v.barris as number; // barris de 42 galões
    return (<>
      <Objeto f={f} dur={dur} x={W / 2} y={250} rot={-2} entra="cola" seed={30}><Adesivo txt={conta(`${v.n}`, prog(f, 2, 30))} tam={200} seed={31} sub={v.rotulo} /></Objeto>
      <div style={{ position: 'absolute', left: W / 2 - (Math.ceil(n) * 184) / 2, top: 520, display: 'flex', gap: 14 }}>
        {Array.from({ length: Math.ceil(n) }, (_, i) => {
          const s = sp(f - 10 - i * 4, { damping: 10, stiffness: 220 });
          const parte = i + 1 > n ? n - i : 1;
          return <div key={i} style={{ width: 170, height: 170, overflow: 'hidden', transform: `translateY(${(1 - s) * -200}px) rotate(${(1 - s) * 30}deg)`, opacity: clamp(s * 2), clipPath: `inset(${(1 - parte) * 100}% 0 0 0)` }}><Emoji n="tambor" tam={170} /></div>;
        })}
      </div>
      <Objeto f={f} dur={dur} x={W / 2 + 330} y={800} rot={2} atraso={30} seed={32}><Nota txt={v.nota} /></Objeto>
    </>);
  }
  if (t === 'conta') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 180} y={470} rot={2} entra="baixo" seed={33}><Recibo f={f} linha={v.linha} txt={v.txt} rotulo={v.rotulo} /></Objeto>
    <Objeto f={f} dur={dur} x={560} y={460} rot={-9} entra="cola" atraso={12} seed={34}><div style={{ background: '#f5ecd6', padding: 20, clipPath: rasgado(18, 3, 14) }}><Emoji n="bomba" tam={170} /></div></Objeto>
  </>);
  if (t === 'nota-rasgada') {
    const pr = prog(f, 14, 36, EO);
    const xc = 100 - v.pct;
    const borda = Array.from({ length: 22 }, (_, i) => [xc + (((i * 53) % 7) - 3) * 0.45, (i / 21) * 100]);
    const esq = `polygon(0 0, ${borda.map(([x, y]) => `${x}% ${y}%`).join(',')}, 0 100%)`;
    const dir = `polygon(100% 0, ${borda.map(([x, y]) => `${x}% ${y}%`).join(',')}, 100% 100%)`;
    return (<>
      <Objeto f={f} dur={dur} x={W / 2 - 40} y={420} rot={-2} entra="cai" seed={36}>
        <div style={{ position: 'relative', width: 920, height: 420 }}>
          <div style={{ position: 'absolute', inset: 0, clipPath: esq }}><Nota1 /></div>
          <div style={{ position: 'absolute', inset: 0, clipPath: dir, transform: `translate(${pr * 190}px, ${pr * 90}px) rotate(${pr * 16}deg)`, transformOrigin: '95% 50%' }}><Nota1 /></div>
        </div>
      </Objeto>
      <Objeto f={f} dur={dur} x={W / 2 + 470} y={760} rot={7} entra="carimbo" atraso={30} seed={37}><Adesivo txt={v.txt} tam={120} seed={38} sub={v.rotulo} /></Objeto>
    </>);
  }
  return null;
};

export const LSS = { Cena, superficie: 'escuro' as const, legenda: 'cond' as const };
