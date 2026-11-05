// Ten Thousand Runs — mesa de jogo de feltro, papel, cartas, dados e o "laboratório de simulação". Acento amarelo.
import React from 'react';
import { W, H, FA, Objeto, Fita, Emoji, rasgado, sp, conta, prog, clamp, EO } from './comum';
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

const Tabuleiro: React.FC<{ f: number; modo?: string; valor?: string }> = ({ f, modo, valor }) => {
  const L = 760, c = L / 13; // cantos ocupam 2 unidades
  const pos = (col: number) => (col === 0 ? 0 : col === 10 ? L - 2 * c : 2 * c + (col - 1) * c);
  const tam = (col: number) => (col === 0 || col === 10 ? 2 * c : c);
  const brilho = modo === 'jail' ? prog(f, 6, 30, EO) : 0;
  const cruz = modo === 'go' ? prog(f, 10, 26, EO) : 0;
  return (
    <div style={{ width: L, height: L, position: 'relative', background: '#e9e2cc', boxShadow: 'inset 0 0 0 4px #1d1a16', filter: 'url(#grao-papel)' }}>
      {Array.from({ length: 40 }, (_, i) => {
        const [cx, cy] = casa(i);
        const x = pos(cx), y = pos(cy), w = tam(cx), h = tam(cy);
        const g = G[i];
        const lado = cy === 10 ? 'top' : cy === 0 ? 'bottom' : cx === 0 ? 'right' : 'left';
        const faixa = g ? { [lado]: 0, ...(lado === 'top' || lado === 'bottom' ? { left: 0, right: 0, height: h * 0.24 } : { top: 0, bottom: 0, width: w * 0.24 }) } : null;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: '1.5px solid #1d1a16', boxSizing: 'border-box', background: i === 10 && brilho ? `rgba(255,210,63,${0.25 + 0.55 * brilho})` : undefined }}>
            {faixa && <div style={{ position: 'absolute', background: COR[g!], ...(faixa as any) }} />}
          </div>
        );
      })}
      {[['GO', 0], ['JAIL', 10], ['FREE\nPARKING', 20], ['GO TO\nJAIL', 30]].map(([t, i]) => {
        const [cx, cy] = casa(i as number);
        return <div key={t as string} style={{ position: 'absolute', left: pos(cx), top: pos(cy), width: 2 * c, height: 2 * c, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', whiteSpace: 'pre', fontFamily: FA.cond, fontSize: (t as string).length > 4 ? 22 : 40, color: TINTA, lineHeight: 1 }}>{t}</div>;
      })}
      <div style={{ position: 'absolute', left: 2 * c, top: 2 * c, right: 2 * c, bottom: 2 * c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FA.maq, fontSize: 28, color: '#4a4236', transform: 'rotate(-38deg)', letterSpacing: 4, textAlign: 'center', lineHeight: 1.5 }}>10,000 GAMES<br />4 PLAYERS</div>
      </div>
      {brilho > 0 && <div style={{ position: 'absolute', left: -30, top: L - 2 * c - 30, width: 2 * c + 60, height: 2 * c + 60, borderRadius: 30, boxShadow: `0 0 ${60 * brilho}px ${20 * brilho}px rgba(255,210,63,0.7)`, border: `6px solid rgba(255,210,63,${brilho})` }} />}
      {cruz > 0 && <svg width={2 * c} height={2 * c} style={{ position: 'absolute', left: L - 2 * c, top: L - 2 * c }}>
        <path d={`M12 12 L${12 + (2 * c - 24) * cruz} ${12 + (2 * c - 24) * cruz}`} stroke="#d93a2f" strokeWidth={14} strokeLinecap="round" />
        <path d={`M${2 * c - 12} 12 L${2 * c - 12 - (2 * c - 24) * clamp(cruz * 1.6 - 0.6)} ${12 + (2 * c - 24) * clamp(cruz * 1.6 - 0.6)}`} stroke="#d93a2f" strokeWidth={14} strokeLinecap="round" />
      </svg>}
    </div>
  );
};

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

const Dado: React.FC<{ n: number; tam?: number }> = ({ n, tam = 170 }) => {
  const P: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  return (
    <div style={{ width: tam, height: tam, borderRadius: tam * 0.18, background: 'linear-gradient(145deg,#fffdf6,#e3dccb)', boxShadow: `inset -6px -8px 0 rgba(0,0,0,0.12)`, position: 'relative' }}>
      {P[n].map(([x, y], i) => <div key={i} style={{ position: 'absolute', left: tam * (0.2 + x * 0.3) - tam * 0.08, top: tam * (0.2 + y * 0.3) - tam * 0.08, width: tam * 0.16, height: tam * 0.16, borderRadius: tam, background: '#1d1a16' }} />)}
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
      {valor && <div style={{ fontFamily: FA.cond, fontSize: 150, textAlign: 'center', color: TINTA, marginTop: 50 }}>{valor}</div>}
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
          <div style={{ fontFamily: FA.osw, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: AM, textAlign: 'center', marginBottom: 16 }}>GAMES PLAYED</div>
          <div style={{ display: 'flex', gap: 10 }}>{s.split('').map((ch, i) => (
            <div key={i} style={{ width: ch === ',' ? 40 : 128, height: 190, background: ch === ',' ? 'transparent' : '#f4efe2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FA.cond, fontSize: ch === ',' ? 120 : 170, color: ch === ',' ? '#f4efe2' : TINTA, boxShadow: ch === ',' ? undefined : 'inset 0 -6px 0 #cdbfa5' }}>{ch === ' ' ? '0' : ch}</div>
          ))}</div>
        </div>
      </Objeto>
      <Objeto f={f} dur={dur} x={W / 2 + 420} y={760} rot={6} entra="cola" atraso={14} seed={13}><Etiqueta txt="RUN #10,000" tam={80} seed={14} /></Objeto>
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
      <Objeto key={i} f={f} dur={dur} x={W / 2 - 300 + i * 120} y={420 + (i % 2) * 40} rot={-20 + i * 9} entra="cai" atraso={i * 3} seed={20 + i}><Emoji n="dinheiro" tam={300} /></Objeto>
    ))}
    <Objeto f={f} dur={dur} x={W / 2} y={760} rot={2} entra="cola" atraso={20} seed={27}><Etiqueta txt={v.txt} tam={78} seed={28} /></Objeto>
  </>);
  if (t === 'falencia') return (<>
    <Objeto f={f} dur={dur} x={W / 2} y={430} rot={-4} entra="cai" seed={30}><Carta cor="#2b4fa3" nome="PAY THE RENT" valor="✕" rot="nothing left to pay with" /></Objeto>
    <Objeto f={f} dur={dur} x={W / 2 + 30} y={460} rot={-14} entra="carimbo" atraso={10} seed={31}><div style={{ background: 'rgba(244,239,226,0.0)' }}><Carimbo txt="BANKRUPT" tam={130} /></div></Objeto>
  </>);
  if (t === 'tabuleiro') return (<>
    <div style={{ position: 'absolute', left: W / 2 - 380 + 60, top: 70, transform: `perspective(1600px) rotateX(18deg) rotateZ(${-6 + prog(f, 0, dur) * 2}deg)`, filter: 'drop-shadow(10px 24px 16px rgba(0,0,0,0.5))' }}>
      <div style={{ transform: 'scale(1.12)', transformOrigin: '50% 0' }}><Tabuleiro f={f} modo={v.modo} /></div>
    </div>
    {v.selo && <Objeto f={f} dur={dur} x={420} y={760} rot={-8} entra="carimbo" atraso={12} seed={33}><Etiqueta txt={v.selo} tam={110} sub={v.sub} seed={34} /></Objeto>}
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
  return null;
};

export const TTR = { Cena, superficie: 'feltro' as const, legenda: 'cond' as const };
