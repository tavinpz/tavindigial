// Ten Thousand Runs — mesa de jogo de feltro, papel, cartas, dados e o "laboratório de simulação". Acento amarelo.
import React from 'react';
import { W, H, FA, Objeto, Fita, Emoji, rasgado, sp, conta, prog, clamp, EO, Continua } from './comum';
import type { VProps } from './comum';

const AM = '#ffd23f', TINTA = '#1d1a16', CARTAO = '#f4efe2';
const COR: Record<string, string> = { brown: '#8a5a3c', lightblue: '#9fd3ef', pink: '#d9488f', orange: '#f08a24', red: '#d93a2f', yellow: '#f2d23a', green: '#2f9e55', darkblue: '#2b4fa3' };
// grupo de cada casa do tabuleiro (EUA), null = casa sem cor
const G: (string | null)[] = [null, 'brown', null, 'brown', null, null, 'lightblue', null, 'lightblue', 'lightblue', null, 'pink', null, 'pink', 'pink', null, 'orange', null, 'orange', 'orange',
  null, 'red', null, 'red', 'red', null, 'yellow', 'yellow', null, 'yellow', null, 'green', 'green', null, 'green', null, null, 'darkblue', null, 'darkblue'];

/** posição (coluna, linha) 0..10 da casa i, com GO no canto inferior direito */
const casa = (i: number): [number, number] => {
  if (i <= 10) return [10 - i, 10];
  if (i <= 20) return [0, 10 - (i - 10)];
  if (i <= 30) return [i - 20, 0];
  return [10, i - 30];
};

const Tabuleiro: React.FC<{ f: number; modo?: string; calor?: number[]; foco?: number[] }> = ({ f, modo, calor, foco = [] }) => {
  const L = 760, c = L / 13; // cantos ocupam 2 unidades
  const pos = (col: number) => (col === 0 ? 0 : col === 10 ? L - 2 * c : 2 * c + (col - 1) * c);
  const tam = (col: number) => (col === 0 || col === 10 ? 2 * c : c);
  const centro = (i: number): [number, number] => { const [cx, cy] = casa(i); return [pos(cx) + tam(cx) / 2, pos(cy) + tam(cy) / 2]; };
  const brilho = modo === 'jail' ? prog(f, 6, 30, EO) : 0;
  const cruz = modo === 'go' ? prog(f, 10, 26, EO) : 0;
  const pc = prog(f, 4, 36, EO); // aparição do mapa de calor
  const mx = calor ? Math.max(...calor.filter((_, i) => i !== 10)) : 1;
  const tinta = (i: number) => {
    if (modo === 'igual') return `rgba(255,210,63,${0.42 * pc})`;
    if (modo === 'calor' && calor) {
      const v = i === 10 ? 1 : Math.min(1, calor[i] / mx);
      const a = clamp(pc * 1.4 - (i / 40) * 0.4);
      return `rgba(${Math.round(255 - 30 * v)},${Math.round(225 - 150 * v)},${Math.round(120 - 90 * v)},${(0.08 + 0.8 * v * v) * a})`;
    }
    return undefined;
  };
  const sai = modo === 'saida' ? prog(f, 6, 40, EO) : 0;
  const j = centro(10);
  return (
    <div style={{ width: L, height: L, position: 'relative', background: '#e9e2cc', boxShadow: 'inset 0 0 0 4px #1d1a16' }}>
      {Array.from({ length: 40 }, (_, i) => {
        const [cx, cy] = casa(i);
        const x = pos(cx), y = pos(cy), w = tam(cx), h = tam(cy);
        const g = G[i];
        const lado = cy === 10 ? 'top' : cy === 0 ? 'bottom' : cx === 0 ? 'right' : 'left';
        const faixa = g ? { [lado]: 0, ...(lado === 'top' || lado === 'bottom' ? { left: 0, right: 0, height: h * 0.24 } : { top: 0, bottom: 0, width: w * 0.24 }) } : null;
        const fo = foco.includes(i) ? prog(f, 8, 22, EO) : 0;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: '1.5px solid #1d1a16', boxSizing: 'border-box',
            background: i === 10 && brilho ? `rgba(255,210,63,${0.25 + 0.55 * brilho})` : tinta(i), zIndex: fo ? 3 : 1,
            boxShadow: fo ? `0 0 0 ${5 * fo}px ${AM}, 0 0 ${30 * fo}px ${8 * fo}px rgba(255,210,63,0.65)` : undefined }}>
            {faixa && <div style={{ position: 'absolute', background: COR[g!], ...(faixa as any) }} />}
          </div>
        );
      })}
      {[['GO', 0], ['JAIL', 10], ['FREE\nPARKING', 20], ['GO TO\nJAIL', 30]].map(([t, i]) => {
        const [cx, cy] = casa(i as number);
        return <div key={t as string} style={{ position: 'absolute', zIndex: 4, left: pos(cx), top: pos(cy), width: 2 * c, height: 2 * c, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', whiteSpace: 'pre', fontFamily: FA.cond, fontSize: (t as string).length > 4 ? 22 : 40, color: TINTA, lineHeight: 1 }}>{t}</div>;
      })}
      <div style={{ position: 'absolute', left: 2 * c, top: 2 * c, right: 2 * c, bottom: 2 * c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FA.maq, fontSize: 28, color: '#4a4236', transform: 'rotate(-38deg)', letterSpacing: 4, textAlign: 'center', lineHeight: 1.5 }}>10,000 GAMES<br />4 PLAYERS</div>
      </div>
      {sai > 0 && <svg width={L} height={L} style={{ position: 'absolute', inset: 0, zIndex: 5, overflow: 'visible' }}>
        {[16, 17, 18, 19].map((alvo, k) => {
          const [x1, y1] = centro(alvo);
          const mxp = (j[0] + x1) / 2 + 120, myp = (j[1] + y1) / 2 + 40;
          const pk = clamp(sai * 1.6 - k * 0.18);
          return <path key={alvo} d={`M${j[0]} ${j[1]} Q${mxp} ${myp} ${x1} ${y1}`} fill="none" stroke={alvo === 17 ? '#6b6252' : AM} strokeWidth={alvo === 17 ? 4 : 7} strokeDasharray="14 10" pathLength={100} style={{ strokeDasharray: `${100 * pk} 100` }} strokeLinecap="round" />;
        })}
      </svg>}
      {brilho > 0 && <div style={{ position: 'absolute', zIndex: 6, left: -30, top: L - 2 * c - 30, width: 2 * c + 60, height: 2 * c + 60, borderRadius: 30, boxShadow: `0 0 ${60 * brilho}px ${20 * brilho}px rgba(255,210,63,0.7)`, border: `6px solid rgba(255,210,63,${brilho})` }} />}
      {cruz > 0 && <svg width={2 * c} height={2 * c} style={{ position: 'absolute', zIndex: 6, left: L - 2 * c, top: L - 2 * c }}>
        <path d={`M12 12 L${12 + (2 * c - 24) * cruz} ${12 + (2 * c - 24) * cruz}`} stroke="#d93a2f" strokeWidth={14} strokeLinecap="round" />
        <path d={`M${2 * c - 12} 12 L${2 * c - 12 - (2 * c - 24) * clamp(cruz * 1.6 - 0.6)} ${12 + (2 * c - 24) * clamp(cruz * 1.6 - 0.6)}`} stroke="#d93a2f" strokeWidth={14} strokeLinecap="round" />
      </svg>}
    </div>
  );
};

const corDe = (c?: string) => (c && COR[c]) || c || '#888';

/** ficha datilografada do laboratório */
const Ficha: React.FC<{ titulo: string; linhas: [string, string][]; f: number }> = ({ titulo, linhas, f }) => (
  <div style={{ width: 1260, background: CARTAO, padding: '40px 54px 46px', fontFamily: FA.maq, color: '#2a251f', backgroundImage: 'repeating-linear-gradient(transparent 0 69px, rgba(70,110,170,0.22) 69px 71px)', filter: 'url(#grao-papel)' }}>
    <div style={{ fontSize: 40, letterSpacing: 3, color: '#b03a2e', borderBottom: '3px solid #b03a2e', paddingBottom: 8 }}>{titulo}</div>
    {linhas.map(([k, v], i) => (
      <div key={i} style={{ display: 'flex', gap: 24, fontSize: 50, marginTop: 20, opacity: clamp((f - 8 - i * 7) / 5) }}>
        <div style={{ width: 260, opacity: 0.65 }}>{k}</div><div style={{ flex: 1 }}>{v}</div>
      </div>
    ))}
  </div>
);

const Dado: React.FC<{ n: number; tam?: number; cor?: string; pip?: string }> = ({ n, tam = 170, cor, pip = '#1d1a16' }) => {
  const P: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  return (
    <div style={{ width: tam, height: tam, borderRadius: tam * 0.18, background: cor ? `linear-gradient(145deg,${cor},${cor}cc)` : 'linear-gradient(145deg,#fffdf6,#e3dccb)', boxShadow: `inset -6px -8px 0 rgba(0,0,0,0.12)`, position: 'relative' }}>
      {P[n].map(([x, y], i) => <div key={i} style={{ position: 'absolute', left: tam * (0.2 + x * 0.3) - tam * 0.08, top: tam * (0.2 + y * 0.3) - tam * 0.08, width: tam * 0.16, height: tam * 0.16, borderRadius: tam, background: pip }} />)}
    </div>
  );
};

/** carta de propriedade (desenho próprio, sem o visual do jogo comercial) */
const Carta: React.FC<{ cor?: string; nome?: string; verso?: boolean; valor?: string; rot?: string }> = ({ cor, nome, verso, valor, rot }) => (
  <div style={{ width: 330, height: 460, borderRadius: 16, background: verso ? '#1d3b5e' : CARTAO, border: '8px solid #f4efe2', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.15)', overflow: 'hidden', position: 'relative' }}>
    {verso ? (
      <div style={{ position: 'absolute', inset: 14, border: '3px dashed rgba(255,210,63,0.6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FA.cond, fontSize: 170, color: AM }}>?</div>
    ) : (<>
      <div style={{ height: 120, background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FA.cond, fontSize: 34, color: '#fff', padding: '0 14px', letterSpacing: 1, lineHeight: 1.05 }}>{nome}</div>
      {valor && <div style={{ fontFamily: FA.cond, fontSize: valor.length > 5 ? 96 : valor.length > 3 ? 120 : 150, textAlign: 'center', color: TINTA, marginTop: 50, whiteSpace: 'nowrap' }}>{valor}</div>}
      {rot && <div style={{ fontFamily: FA.maq, fontSize: 26, textAlign: 'center', color: '#4a4236' }}>{rot}</div>}
    </>)}
  </div>
);

/** etiqueta amarela rasgada */
const Etiqueta: React.FC<{ txt: string; tam?: number; sub?: string; seed?: number }> = ({ txt, tam = 110, sub, seed = 3 }) => (
  <div style={{ background: AM, clipPath: rasgado(seed, 2.2, 22), padding: '16px 40px 10px', textAlign: 'center', filter: 'url(#grao-papel)' }}>
    <div style={{ fontFamily: FA.cond, fontSize: tam, lineHeight: 1, color: TINTA, whiteSpace: 'nowrap' }}>{txt}</div>
    {sub && <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: tam * 0.25, letterSpacing: 4, color: TINTA, marginTop: 6, whiteSpace: 'nowrap' }}>{sub}</div>}
  </div>
);

const Carimbo: React.FC<{ txt: string; cor?: string; tam?: number }> = ({ txt, cor = '#c0392b', tam = 90 }) => (
  <div style={{ border: `8px solid ${cor}`, borderRadius: 14, padding: '8px 28px', fontFamily: FA.cond, fontSize: tam, color: cor, letterSpacing: 4, filter: 'url(#carimbo)', whiteSpace: 'nowrap' }}>{txt}</div>
);


/** casinha verde (peça de casa) */
const Casa: React.FC<{ tam?: number; cor?: string }> = ({ tam = 34, cor = '#2f9e55' }) => (
  <svg width={tam} height={tam} viewBox="0 0 10 10" style={{ display: 'block', filter: 'drop-shadow(1px 2px 0 rgba(0,0,0,0.35))' }}><path d="M1 5 L5 1 L9 5 L9 9.5 L1 9.5 Z" fill={cor} stroke="#14361f" strokeWidth={0.6} /></svg>
);

/** pilha de fichas de pôquer na horizontal (barra física) */
const Pilha: React.FC<{ n: number; cor: string }> = ({ n, cor }) => (
  <div style={{ position: 'relative', height: 58, width: 22 + n * 15 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ position: 'absolute', left: i * 15, top: 0, width: 22, height: 58, borderRadius: 6, background: cor,
        boxShadow: 'inset -3px 0 0 rgba(0,0,0,0.25), inset 3px 0 0 rgba(255,255,255,0.25)', border: '2px solid rgba(0,0,0,0.35)',
        backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.75) 0 6px, transparent 6px 15px)' }} />
    ))}
  </div>
);

const Prancheta: React.FC<{ titulo: string; children: React.ReactNode; w?: number }> = ({ titulo, children, w = 760 }) => (
  <div style={{ width: w, background: '#a77b4f', borderRadius: 22, padding: '70px 26px 28px', position: 'relative', boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.2)' }}>
    <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 220, height: 70, background: 'linear-gradient(#d9d9d9,#8f8f8f)', borderRadius: 12, boxShadow: '0 4px 0 #555' }} />
    <div style={{ background: CARTAO, padding: '30px 34px 36px', minHeight: 260 }}>
      <div style={{ fontFamily: FA.maq, fontSize: 34, color: '#b03a2e', letterSpacing: 2, borderBottom: '3px solid #b03a2e', paddingBottom: 8, marginBottom: 18 }}>{titulo}</div>
      {children}
    </div>
  </div>
);

const Extra: React.FC<VProps> = ({ f, dur, v }) => {
  const t = v.tipo;
  if (t === 'capitulo') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={440} rot={-2} entra="cai" seed={70}>
      <div style={{ position: 'relative', width: 1300 }}>
        <div style={{ position: 'absolute', left: 60, top: -64, background: AM, padding: '12px 40px 8px', borderRadius: '14px 14px 0 0', fontFamily: FA.osw, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: TINTA }}>{v.n}</div>
        <div style={{ background: CARTAO, padding: '60px 70px 56px', backgroundImage: 'repeating-linear-gradient(transparent 0 67px, rgba(70,110,170,0.2) 67px 69px)' }}>
          <div style={{ fontFamily: FA.cond, fontSize: 150, lineHeight: 1, color: TINTA }}>{v.txt}</div>
          <div style={{ fontFamily: FA.maq, fontSize: 34, color: '#4a4236', marginTop: 20, letterSpacing: 4 }}>TEN THOUSAND RUNS · LAB NOTES</div>
        </div>
      </div>
    </Objeto>
  </>);
  if (t === 'numero') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={430} rot={-3} entra="carimbo" seed={71}><Etiqueta txt={/^\$?[\d.,]+%?$/.test(v.txt) ? conta(v.txt, prog(f, 2, 24)) : v.txt} tam={250} sub={v.rotulo} seed={72} /></Objeto>
  </>);
  if (t === 'cartas2') return (<>
    <Objeto f={f} dur={dur} x={W / 2 - 230} y={440} rot={-8} entra="esq" seed={73}><Carta cor="#f08a24" nome={v.a} valor="?" /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 230} y={440} rot={7} entra="dir" atraso={6} seed={74}><Carta cor="#2b79c2" nome={v.b} valor="!" /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2} y={790} rot={-2} entra="cola" atraso={14} seed={75}><Etiqueta txt={v.txt} tam={80} seed={76} /></Objeto>
  </>);
  if (t === 'carta') {
    const vira = prog(f, 6, 20, EO);
    return (<>
      <Objeto f={f} dur={dur} x={W / 2 - 120} y={450} rot={-4} entra="dir" seed={77}>
        <div style={{ transform: `scaleX(${Math.abs(Math.cos(vira * Math.PI))})` }}>{vira < 0.5 ? <Carta verso /> : <Carta cor={corDe(v.cor)} nome={v.nome} valor={v.valor} rot={v.rot} />}</div>
      </Objeto>
      {v.selo && <Objeto f={f} dur={dur} x={W / 2 + 330} y={470} rot={8} entra="carimbo" atraso={24} seed={78}><Etiqueta txt={v.selo} tam={110} seed={79} /></Objeto>}
    </>);
  }
  if (t === 'degraus') {
    const vals: string[] = v.vals || [];
    return (<>
      <Objeto f={f} dur={dur} x={W / 2} y={460} rot={-1.5} entra="cai" seed={80}>
        <div style={{ background: CARTAO, padding: '34px 46px 26px', display: 'flex', gap: 26, alignItems: 'flex-end' }}>
          {[0, 1, 2, 3, 4, 5].map((h) => {
            const on = h <= v.ate;
            const s = h <= (v.de ?? -1) ? 1 : sp(f - 6 - (h - (v.de ?? -1) - 1) * 5, { damping: 12, stiffness: 200 });
            const dest = h === 3 && v.ate >= 3;
            return (
              <div key={h} style={{ width: 170, textAlign: 'center', opacity: on ? 1 : 0.28 }}>
                {vals[h] && <div style={{ fontFamily: FA.cond, fontSize: dest ? 74 : 56, color: dest ? '#b03a2e' : TINTA, marginBottom: 10, transform: `scale(${on ? 0.8 + 0.2 * s : 1})` }}>${vals[h]}</div>}
                <div style={{ height: 150, display: 'flex', flexWrap: 'wrap-reverse', justifyContent: 'center', alignContent: 'flex-start', gap: 4 }}>
                  {h === 5 ? <Casa tam={92} cor="#c0392b" /> : Array.from({ length: h }, (_, k) => <div key={k} style={{ transform: `translateY(${on ? (1 - clamp(s * 2 - k * 0.3)) * -120 : 0}px)` }}><Casa tam={60} /></div>)}
                </div>
                <div style={{ height: 30, background: corDe(v.cor), marginTop: 8 }} />
                <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: 28, color: '#4a4236', marginTop: 8 }}>{h === 5 ? 'HOTEL' : `${h} HOUSE${h === 1 ? '' : 'S'}`}</div>
              </div>
            );
          })}
        </div>
      </Objeto>
      {v.selo && <Objeto f={f} dur={dur} x={W / 2 + 560} y={210} rot={8} entra="carimbo" atraso={14} seed={81}><Etiqueta txt={v.selo} tam={100} seed={82} /></Objeto>}
    </>);
  }
  if (t === 'fichas') {
    const it: { cor: string; nome: string; v: number }[] = v.itens || [];
    const mx = Math.max(...it.map((x) => x.v), v.linha || 0);
    const larg = 1000;
    return (<>
      <Objeto f={f} dur={dur} x={W / 2 + 40} y={455} rot={-1} entra="cai" seed={83} sombra={0.6}>
        <div style={{ background: 'rgba(15,40,25,0.55)', border: '3px solid rgba(255,210,63,0.35)', borderRadius: 20, padding: '26px 40px 30px', width: 1500 }}>
          <div style={{ fontFamily: FA.maq, fontSize: 32, color: AM, letterSpacing: 3, marginBottom: 12 }}>{v.rotulo}</div>
          <div style={{ position: 'relative' }}>
            {it.map((x, i) => {
              const on = i < (v.ate ?? it.length);
              const de = v.de ?? 0;
              const pr = !on ? 0 : i < de ? 1 : prog(f, 2 + (i - de) * 3, 24 + (i - de) * 3, EO);
              const n = Math.max(1, Math.round((x.v / mx) * (larg / 15)));
              return (
                <div key={x.nome} style={{ display: 'flex', alignItems: 'center', height: it.length > 5 ? 74 : 110, opacity: on ? 1 : 0.18 }}>
                  <div style={{ width: 250, fontFamily: FA.osw, fontWeight: 700, fontSize: 34, color: '#f4efe2', letterSpacing: 2 }}>{x.nome}</div>
                  <div style={{ width: larg + 30, overflow: 'hidden' }}><div style={{ width: `${pr * 100}%`, overflow: 'hidden' }}><Pilha n={n} cor={corDe(x.cor)} /></div></div>
                  <div style={{ fontFamily: FA.cond, fontSize: 52, color: on ? AM : '#f4efe2', marginLeft: 14 }}>{on ? `${v.pre || ''}${x.v}${v.suf ?? (v.pre ? '' : '%')}` : ''}</div>
                </div>
              );
            })}
            {v.linha > 0 && <div style={{ position: 'absolute', top: -10, bottom: -10, left: 250 + (v.linha / mx) * larg, borderLeft: '5px dashed #f4efe2', opacity: prog(f, 4, 14) }}>
              <div style={{ position: 'absolute', top: -46, left: -60, fontFamily: FA.cond, fontSize: 36, color: '#f4efe2', whiteSpace: 'nowrap' }}>FAIR {v.linha}%</div>
            </div>}
          </div>
        </div>
      </Objeto>
      {v.selo && <Objeto f={f} dur={dur} x={W - 330} y={150} rot={6} entra="carimbo" atraso={10} seed={84} sai><Etiqueta txt={v.selo} tam={90} seed={85} /></Objeto>}
    </>);
  }
  if (t === 'duelo') {
    const va = parseFloat(v.pa), vb = parseFloat(v.pb);
    const ga = !isNaN(va) && va > vb, gb = !isNaN(vb) && vb > va;
    return (<>
      <Objeto f={f} dur={dur} x={W / 2 - 400} y={430} rot={-6} entra="esq" seed={86}><div style={{ transform: `scale(${ga ? 1.08 : 1})` }}><Carta cor={COR[v.a]} nome={v.a.replace('light', 'LIGHT ').replace('dark', 'DARK ').toUpperCase()} valor={v.pa} /></div></Objeto>
      <Objeto f={f} dur={dur} x={W / 2 + 400} y={430} rot={6} entra="dir" atraso={4} seed={87}><div style={{ transform: `scale(${gb ? 1.08 : 1})`, opacity: ga ? 0.75 : 1 }}><Carta cor={COR[v.b]} nome={v.b.replace('light', 'LIGHT ').replace('dark', 'DARK ').toUpperCase()} valor={v.pb} /></div></Objeto>
      <Objeto f={f} dur={dur} x={W / 2} y={420} rot={-4} entra="carimbo" atraso={10} seed={88}><Carimbo txt="VS" tam={140} cor={AM} /></Objeto>
      {v.selo && <Objeto f={f} dur={dur} x={W / 2} y={800} rot={2} entra="cola" atraso={22} seed={89}><Etiqueta txt={v.selo} tam={86} seed={90} /></Objeto>}
    </>);
  }
  if (t === 'teste') {
    const pa = parseFloat(v.pa), pb = parseFloat(v.pb);
    const bloco = (lado: 'a' | 'b', x: number, seed: number) => (
      <Objeto f={f} dur={dur} x={x} y={470} rot={lado === 'a' ? -3 : 3} entra={lado === 'a' ? 'esq' : 'dir'} atraso={lado === 'a' ? 0 : 5} seed={seed}>
        <Prancheta titulo={lado === 'a' ? 'TEST A' : 'TEST B'} w={700}>
          <div style={{ fontFamily: FA.cond, fontSize: 70, color: TINTA, lineHeight: 1.05 }}>{lado === 'a' ? v.a : v.b}</div>
          <div style={{ fontFamily: FA.cond, fontSize: 140, color: v.vence === lado ? '#2f9e55' : '#b03a2e', marginTop: 10 }}>{lado === 'a' ? v.pa : v.pb}</div>
        </Prancheta>
      </Objeto>
    );
    return (<>
      {bloco('a', W / 2 - 400, 91)}{bloco('b', W / 2 + 400, 92)}
      {v.vence && <Objeto f={f} dur={dur} x={v.vence === 'a' ? W / 2 - 300 : W / 2 + 500} y={760} rot={-10} entra="carimbo" atraso={16} seed={93}><Carimbo txt="WINS MORE" tam={90} cor="#2f9e55" /></Objeto>}
    </>);
  }
  if (t === 'lista') {
    const it: string[] = v.itens || [];
    return (
      <Objeto f={f} dur={dur} x={W / 2} y={470} rot={-1.5} entra="cai" seed={94}>
        <Prancheta titulo={v.titulo} w={1150}>
          {it.length === 0 && <div style={{ fontFamily: FA.maq, fontSize: 40, color: '#8a8070' }}>...</div>}
          {it.map((x, i) => {
            const novo = i === it.length - 1;
            const a = novo ? prog(f, 6, 18, EO) : 1;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, fontFamily: FA.cond, fontSize: 58, color: TINTA, marginTop: 10, opacity: novo ? clamp(a * 2) : 1 }}>
                <div style={{ width: 52, height: 52, border: '5px solid #1d1a16', borderRadius: 8, position: 'relative' }}>
                  <svg width={60} height={60} style={{ position: 'absolute', left: -2, top: -12 }}><path d="M8 30 L24 46 L54 8" fill="none" stroke="#2f9e55" strokeWidth={9} strokeLinecap="round" pathLength={1} style={{ strokeDasharray: `${a} 1` }} /></svg>
                </div>
                <div>{i + 1}. {x}</div>
              </div>
            );
          })}
        </Prancheta>
      </Objeto>
    );
  }
  if (t === 'conta') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 120} y={450} rot={2} entra="baixo" seed={102}>
      <div style={{ width: 620, background: '#fbf8f1', padding: '40px 44px 50px', fontFamily: FA.maq, color: '#2d2722', clipPath: 'polygon(0 0,100% 0,100% 97%,95% 100%,90% 97%,85% 100%,80% 97%,75% 100%,70% 97%,65% 100%,60% 97%,55% 100%,50% 97%,45% 100%,40% 97%,35% 100%,30% 97%,25% 100%,20% 97%,15% 100%,10% 97%,5% 100%,0 97%)' }}>
        <div style={{ textAlign: 'center', fontSize: 30, letterSpacing: 4 }}>* LAB RECEIPT *</div>
        <div style={{ borderTop: '2px dashed #8a8175', margin: '20px 0' }} />
        <div style={{ fontSize: 42 }}>{v.linha}</div>
        <div style={{ borderTop: '2px dashed #8a8175', margin: '24px 0 14px' }} />
        <div style={{ fontSize: 30 }}>TOTAL</div>
        <div style={{ fontFamily: FA.cond, fontSize: 150, lineHeight: 1.05, color: TINTA }}>{conta(v.txt, prog(f, 8, 34))}</div>
        <div style={{ fontSize: 26, opacity: 0.75 }}>{v.rotulo}</div>
      </div>
    </Objeto>
    <Objeto f={f} dur={dur} x={W / 2 - 430} y={430} rot={-9} entra="cola" atraso={10} seed={103}><div style={{ background: CARTAO, padding: 24, clipPath: rasgado(103, 3, 14) }}><Casa tam={180} /></div></Objeto>
  </>);
  if (t === 'ampulheta') return (<>
    <Objeto f={f} dur={dur} x={W / 2 - 260} y={440} rot={-6} entra="cai" seed={95}><div style={{ background: CARTAO, padding: 34, clipPath: rasgado(95, 2, 16) }}><Emoji n="ampulheta" tam={260} style={{ transform: `rotate(${prog(f, 10, 40, EO) * 180}deg)` }} /></div></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 320} y={470} rot={4} entra="cola" atraso={12} seed={96}><Etiqueta txt={v.txt} tam={110} seed={97} /></Objeto>
  </>);
  if (t === 'fim') return (<>
    {[0, 1].map((k) => (
      <Objeto key={k} f={f} dur={dur} x={W / 2 + (k ? 380 : -380)} y={430} rot={k ? 2 : -2} entra={k ? 'dir' : 'esq'} atraso={k * 5} seed={98 + k} sai={false}>
        <div style={{ width: 640, height: 360, border: '6px dashed rgba(244,239,226,0.55)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FA.cond, fontSize: 60, color: 'rgba(244,239,226,0.75)' }}>NEXT RUN</div>
      </Objeto>
    ))}
    <Objeto f={f} dur={dur} x={W / 2} y={800} rot={-2} entra="carimbo" atraso={14} seed={100} sai={false}><Etiqueta txt="SUBSCRIBE · 10,000 RUNS AT A TIME" tam={78} seed={101} /></Objeto>
  </>);
  return null;
};

const Cena: React.FC<VProps> = ({ f, dur, v }) => {
  const t = v.tipo;
  if (t === 'ficha') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 120} y={470} rot={-2} entra="cai" seed={1}><Ficha titulo={v.titulo} linhas={v.linhas} f={f} /></Objeto>
    <Fita x={W / 2 + 120 - 380} y={150} rot={-20} /><Fita x={W / 2 + 120 + 380} y={150} rot={18} />
    {v.selo && <Objeto f={f} dur={dur} x={480} y={780} rot={-10} entra="carimbo" atraso={22} seed={2}><Carimbo txt={v.selo} tam={70} /></Objeto>}
  </>);
  if (t === 'icones') return (<>
    <Objeto f={f} dur={dur} x={620} y={430} rot={-4} entra="esq" seed={3}>
      <div style={{ background: CARTAO, padding: '30px 40px', clipPath: rasgado(4, 2, 18), display: 'flex', gap: 10, alignItems: 'flex-end' }}><Emoji n="casa" tam={220} /><Emoji n="saco" tam={180} /></div>
    </Objeto>
    <Objeto f={f} dur={dur} x={620} y={700} rot={2} entra="cola" atraso={10} seed={4}><Etiqueta txt="LANDLORDS: RICH" tam={70} seed={5} /></Objeto>
    <Objeto f={f} dur={dur} x={1310} y={430} rot={5} entra="dir" atraso={16} seed={6}>
      <div style={{ background: CARTAO, padding: '30px 40px', clipPath: rasgado(7, 2, 18) }}><Emoji n="bolso" tam={220} style={{ filter: 'grayscale(0.6)' }} /></div>
    </Objeto>
    <Objeto f={f} dur={dur} x={1310} y={700} rot={-3} entra="cola" atraso={26} seed={8}><Etiqueta txt="EVERYONE ELSE: BROKE" tam={70} seed={9} /></Objeto>
  </>);
  if (t === 'ano') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={430} rot={-3} entra="cai" seed={10}>
      <div style={{ width: 900, background: CARTAO, padding: '40px 0 30px', textAlign: 'center', filter: 'url(#grao-papel)', backgroundImage: 'repeating-linear-gradient(transparent 0 57px, rgba(70,110,170,0.2) 57px 59px)' }}>
        <div style={{ fontFamily: FA.cond, fontSize: 280, lineHeight: 1, color: TINTA }}>{Math.round((v.de || 1904) + (Number(v.ano) - (v.de || 1904)) * prog(f, 4, 30, EO))}</div>
        <div style={{ fontFamily: FA.maq, fontSize: 44, color: '#4a4236', letterSpacing: 6 }}>{v.txt}</div>
      </div>
    </Objeto>
    <Fita x={W / 2 - 380} y={190} rot={-14} /><Fita x={W / 2 + 380} y={190} rot={12} />
  </>);
  if (t === 'contador') {
    const p = prog(f, 6, Math.max(30, dur - 10), (x) => 1 - Math.pow(1 - x, 2.4));
    const n = Math.round(10000 * p);
    const s = n.toLocaleString('en-US').padStart(6, ' ');
    return (<>
      <Objeto f={f} dur={dur} x={W / 2} y={420} rot={-1} entra="cai" seed={12}>
        <div style={{ background: '#1d1a16', borderRadius: 22, padding: '34px 46px', border: '10px solid #3a352d', boxShadow: 'inset 0 0 30px #000' }}>
          <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: AM, textAlign: 'center', marginBottom: 16 }}>{v.txt || 'GAMES PLAYED'}</div>
          <div style={{ display: 'flex', gap: 10 }}>{s.split('').map((ch, i) => (
            <div key={i} style={{ width: ch === ',' ? 40 : 128, height: 190, background: ch === ',' ? 'transparent' : '#f4efe2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FA.cond, fontSize: ch === ',' ? 120 : 170, color: ch === ',' ? '#f4efe2' : TINTA, boxShadow: ch === ',' ? undefined : 'inset 0 -6px 0 #cdbfa5' }}>{ch === ' ' ? '0' : ch}</div>
          ))}</div>
        </div>
      </Objeto>
      <Objeto f={f} dur={dur} x={W / 2 + 420} y={760} rot={6} entra="cola" atraso={14} seed={13}><Etiqueta txt="RUN #10,000" tam={80} seed={14} /></Objeto>
    </>);
  }
  if (t === 'batalha') {
    // ataque (vermelho) x defesa (marfim): dados rolam, ordenam do maior ao menor e cada par se compara
    const A: number[] = [...v.ata].sort((x, y) => y - x), D: number[] = [...v.def].sort((x, y) => y - x);
    const cola = (fs: number[], k: number, atq: boolean) => {
      const p = sp(f - k * 3 - (atq ? 0 : 6), { damping: 16, stiffness: 70, mass: 1 });
      return p < 0.92 ? 1 + ((Math.floor(f / 3) + k * 2 + (atq ? 0 : 3)) % 6) : fs[k];
    };
    const pares = Math.min(A.length, D.length);
    const mostra = prog(f, 26, 34);
    return (<>
      <div style={{ position: 'absolute', left: 300, top: 150, fontFamily: FA.osw, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: '#ff8a7a' }}>ATTACK</div>
      <div style={{ position: 'absolute', left: 300, top: 560, fontFamily: FA.osw, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: '#f4efe2' }}>DEFENSE</div>
      {A.map((_, k) => {
        const p = sp(f - k * 3, { damping: 16, stiffness: 70, mass: 1 });
        return <div key={'a' + k} style={{ position: 'absolute', left: 560 + k * 290 + (1 - p) * -900, top: 200, transform: `rotate(${(1 - p) * 540 + (k - 1) * 4}deg)`, filter: 'drop-shadow(8px 14px 10px rgba(0,0,0,0.5))' }}>
          <Dado n={cola(A, k, true)} tam={210} cor="#c0392b" pip="#fbf6ea" /></div>;
      })}
      {D.map((_, k) => {
        const p = sp(f - k * 3 - 6, { damping: 16, stiffness: 70, mass: 1 });
        return <div key={'d' + k} style={{ position: 'absolute', left: 560 + k * 290 + (1 - p) * 900, top: 610, transform: `rotate(${(1 - p) * -540 + (k - 1) * 4}deg)`, filter: 'drop-shadow(8px 14px 10px rgba(0,0,0,0.5))' }}>
          <Dado n={cola(D, k, false)} tam={210} /></div>;
      })}
      {Array.from({ length: pares }, (_, k) => {
        const ganhaA = A[k] > D[k];
        return <div key={'p' + k} style={{ position: 'absolute', left: 560 + k * 290 + 60, top: 455, opacity: mostra, fontFamily: FA.cond, fontSize: 96, color: ganhaA ? '#ff8a7a' : '#f4efe2', textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>{ganhaA ? '▲' : '▼'}</div>;
      })}
      {v.txt && <Objeto f={f} dur={dur} x={W / 2 + 560} y={470} rot={-4} entra="cola" atraso={34} seed={17}><Etiqueta txt={v.txt} tam={74} seed={18} sub={v.sub} /></Objeto>}
    </>);
  }
  if (t === 'tropas') {
    // duas pilhas de exércitos (cubos), ataque x defesa, com o número em cima
    const pilha = (n: number, x: number, cor: string, atraso: number, nome: string) => (
      <Objeto f={f} dur={dur} x={x} y={470} entra="cai" atraso={atraso} seed={atraso + 40}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FA.cond, fontSize: 150, color: cor, WebkitTextStroke: '6px #111', paintOrder: 'stroke fill', lineHeight: 1 }}>{conta(String(n), prog(f, atraso + 4, atraso + 26))}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', width: 520, gap: 8, justifyContent: 'center', marginTop: 14 }}>
            {Array.from({ length: Math.min(n, 40) }, (_, i) => <div key={i} style={{ width: 52, height: 52, borderRadius: 8, background: cor, boxShadow: 'inset -5px -6px 0 rgba(0,0,0,0.25)', opacity: prog(f, atraso + 4 + i * 0.6, atraso + 8 + i * 0.6) }} />)}
          </div>
          <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: 40, letterSpacing: 5, color: '#f4efe2', marginTop: 16 }}>{nome}</div>
        </div>
      </Objeto>
    );
    return (<>
      {pilha(v.a, W / 2 - 420, '#d64535', 0, v.na || 'ATTACKER')}
      {pilha(v.b, W / 2 + 420, '#e8e1cf', 6, v.nb || 'DEFENDER')}
      <Objeto f={f} dur={dur} x={W / 2} y={380} rot={-4} entra="carimbo" atraso={14} seed={95}><Carimbo txt="VS" tam={120} cor={AM} /></Objeto>
      {v.selo && <Objeto f={f} dur={dur} x={W / 2} y={820} rot={2} entra="cola" atraso={24} seed={96}><Etiqueta txt={v.selo} tam={80} seed={97} /></Objeto>}
    </>);
  }
  if (t === 'dados') {
    const rola = (k: number) => {
      const p = sp(f - k * 3, { damping: 16, stiffness: 70, mass: 1 });
      const face = p < 0.92 ? 1 + ((Math.floor(f / 3) + k * 2) % 6) : v.faces[k];
      return { p, face };
    };
    return (<>{[0, 1].map((k) => {
      const { p, face } = rola(k);
      return <div key={k} style={{ position: 'absolute', left: W / 2 - 220 + k * 300 + (1 - p) * -900, top: 360 + k * 40 + Math.sin(p * Math.PI * 3) * (1 - p) * -120,
        transform: `rotate(${(1 - p) * 720 + k * 14 - 6}deg)`, filter: 'drop-shadow(8px 16px 10px rgba(0,0,0,0.5))', opacity: f > dur ? 1 - prog(f, dur, dur + 10) : 1 }}><Dado n={face} tam={260} /></div>;
    })}
      <Objeto f={f} dur={dur} x={W / 2 + 40} y={760} rot={-3} entra="cola" atraso={22} seed={15}><Etiqueta txt={v.txt} tam={78} seed={16} /></Objeto>
    </>);
  }
  if (t === 'dinheiro') return (<>
    {Array.from({ length: 6 }, (_, i) => (
      <Objeto key={i} f={f} dur={dur} x={W / 2 - 300 + i * 120} y={420 + (i % 2) * 40} rot={-20 + i * 9} entra="cai" atraso={i * 3} seed={20 + i} forma="livre"><Emoji n="dinheiro" tam={300} /></Objeto>
    ))}
    <Objeto f={f} dur={dur} x={W / 2} y={760} rot={2} entra="cola" atraso={20} seed={27}><Etiqueta txt={v.txt} tam={78} seed={28} /></Objeto>
  </>);
  if (t === 'falencia') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={430} rot={-4} entra="cai" seed={30}><Carta cor="#2b4fa3" nome="PAY THE RENT" valor="✕" rot="nothing left to pay with" /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 30} y={460} rot={-14} entra="carimbo" atraso={10} seed={31}><div style={{ background: 'rgba(244,239,226,0.0)' }}><Carimbo txt="BANKRUPT" tam={130} /></div></Objeto>
  </>);
  if (t === 'tabuleiro') return (<>
    <Objeto f={f} dur={dur} x={W / 2 + 70} y={470} rot={-4} entra="cai" seed={60} sombra={0.8}>
      <div style={{ transform: 'perspective(1600px) rotateX(16deg) scale(1.12)' }}><Tabuleiro f={f} modo={v.modo} calor={v.calor} foco={v.foco} /></div>
    </Objeto>
    {v.selo && <Objeto f={f} dur={dur} x={400} y={760} rot={-8} entra="carimbo" atraso={12} seed={33}><Etiqueta txt={v.selo} tam={110} sub={v.sub} seed={34} /></Objeto>}
  </>);
  if (t === 'cartas') {
    const vira = prog(f, 14, 30, EO);
    return (<>
      {v.modo === 'misterio' ? [0, 1, 2].map((k) => (
        <Objeto key={k} f={f} dur={dur} x={W / 2 - 380 + k * 380} y={450} rot={-6 + k * 6} entra="esq" atraso={k * 4} seed={40 + k}><Carta verso /></Objeto>
      )) : (
        <Objeto f={f} dur={dur} x={W / 2 - 160} y={450} rot={-5} entra="dir" seed={44}>
          <div style={{ transform: `scaleX(${Math.abs(Math.cos(vira * Math.PI))})` }}>{vira < 0.5 ? <Carta verso /> : <Carta cor={COR[v.cor]} nome={v.nome} valor={v.valor} rot={v.rot} />}</div>
        </Objeto>
      )}
      {v.selo && <Objeto f={f} dur={dur} x={v.modo === 'misterio' ? W / 2 + 40 : W / 2 + 330} y={v.modo === 'misterio' ? 780 : 470} rot={v.modo === 'misterio' ? -4 : 8} entra="carimbo" atraso={v.modo === 'misterio' ? 16 : 30} seed={46}><Etiqueta txt={v.selo} tam={v.modo === 'misterio' ? 96 : 120} sub={v.sub} seed={47} /></Objeto>}
    </>);
  }
  if (t === 'leque') {
    const ks = Object.keys(COR);
    return (<>
      {ks.map((k, i) => {
        const a = (i - (ks.length - 1) / 2) * 9;
        const s = sp(f - i * 2, { damping: 15, stiffness: 120 });
        return <div key={k} style={{ position: 'absolute', left: W / 2 - 165, top: 260, transformOrigin: '50% 140%', transform: `rotate(${a * s}deg) translateY(${(1 - s) * 400}px)`, filter: 'drop-shadow(4px 10px 8px rgba(0,0,0,0.45))' }}>
          <Carta cor={COR[k]} nome=" " valor="?" />
        </div>;
      })}
      <Objeto f={f} dur={dur} x={W / 2} y={170} rot={-2} entra="cola" atraso={18} seed={50}><Etiqueta txt={v.txt} tam={84} seed={51} /></Objeto>
    </>);
  }
  return <Extra f={f} dur={dur} v={v} tema={null as any} />;
};

export const TTR = { Cena, superficie: 'feltro' as const, legenda: 'cond' as const, continua: ['tabuleiro', 'fichas', 'degraus', 'lista', 'teste', 'leque'] };
