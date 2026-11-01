// S3 (escuro) — "A planilha esquecida" (Importar + Retornos): o arquivo de pacientes antigos, empoeirado; abre e os retornos
// aparecem vencidos em vermelho. O ponto cai, a lista entra na tela Retornos, cada procedimento ganha um prazo e a Thata chama no dia.
// Metáfora: a poeira sai da planilha e cada linha ganha uma data de volta.
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { C, G, M, Fundo, Fantasma, Titulo, Ponto, Fecho, Narrada, Bolha, Icone, Check, lerp, saida, mola, molaViva, chaves, usaTema } from './kit';

export const DUR_S3 = 600;
const ROWS: [string, string, string][] = [
  ['Ana P.', 'limpeza', 'há 8 meses'], ['Bruno L.', 'clareamento', 'há 1 ano'], ['Carla M.', 'manutenção', 'há 2 meses'],
  ['Diego S.', 'limpeza', 'há 7 meses'], ['Elisa R.', 'clareamento', 'há 13 meses'], ['Fábio T.', 'limpeza', 'há 9 meses'],
];
const REGRAS: [string, string][] = [['limpeza', 'a cada 6 meses'], ['clareamento', 'a cada 12 meses'], ['manutenção', 'a cada 1 mês']];
const venc = (i: number) => 104 + i * 15;
const chama = (i: number) => 288 + i * 11;
const RDY = 92;

const Poeira: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 26 }, (_, i) => {
        const x = 260 + ((i * 137) % 560), y0 = 620 + ((i * 89) % 560);
        const y = y0 - ((f * (0.6 + (i % 5) * 0.25)) % 260);
        return <div key={i} style={{ position: 'absolute', left: x + Math.sin(f / 20 + i) * 14, top: y, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, borderRadius: 99, background: C.fg3, opacity: 0.35 * saida(f, 80, 14) }} />;
      })}
    </>
  );
};

const Linha: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const [n, p, q] = ROWS[i];
  const ent = mola(f, 70 + i * 4, { damping: 18, stiffness: 160, mass: 0.6 });
  const v = f >= venc(i), ok = f >= chama(i);
  const s = ok ? molaViva(f, chama(i)) : v ? molaViva(f, venc(i)) : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: i * RDY, height: RDY - 14, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20, padding: '0 26px',
      background: ok ? 'rgba(27,195,113,.10)' : v ? C.alertaSuave : 'rgba(255,255,255,.035)', border: `1.5px solid ${ok ? 'rgba(95,227,161,.4)' : v ? 'rgba(255,107,107,.35)' : C.linha}`,
      opacity: Math.min(1, ent * 2), transform: `translateX(${(1 - ent) * 60}px)` }}>
      <span style={{ fontFamily: G, fontWeight: 600, fontSize: 32, color: C.ink, width: 190, letterSpacing: '-0.02em' }}>{n}</span>
      <span style={{ fontFamily: M, fontSize: 26, color: C.fg2, width: 210 }}>{p}</span>
      <span style={{ fontFamily: M, fontSize: 26, color: v && !ok ? C.alerta : C.fg2, flex: 1 }}>{q}</span>
      <span style={{ fontFamily: M, fontSize: 24, padding: '8px 16px', borderRadius: 99, whiteSpace: 'nowrap', transform: `scale(${0.85 + 0.15 * s})`,
        background: ok ? C.verde : v ? 'rgba(255,107,107,.18)' : 'transparent', color: ok ? '#06100C' : v ? C.alerta : C.fg3 }}>{ok ? 'chamado hoje' : v ? 'vencido' : '—'}</span>
    </div>
  );
};

export const S3: React.FC = () => {
  usaTema('escuro');
  const f = useCurrentFrame();
  const arq = mola(f, 0, { damping: 14, stiffness: 120, mass: 0.8 });
  const abre = lerp(f, 62, 84, 0, 1);
  const vencidos = ROWS.filter((_, i) => f >= venc(i) && f < chama(i)).length;
  const tabY = chaves(f, [[210, 470], [240, 820]]);
  const tabS = chaves(f, [[210, 1], [240, 0.9]]);
  const recua = lerp(f, 400, 424, 0, 1);
  const pDot = mola(f, 212, { damping: 11, stiffness: 140, mass: 0.7 });
  return (
    <AbsoluteFill>
      <Fundo gy={chaves(f, [[0, 900], [210, 300], [300, 900]])} brilho={chaves(f, [[0, 0.25], [210, 0.25], [226, 1]])} />
      <Fantasma t="ESQUECIDA" ini={0} fim={214} y={1440} tam={320} />
      <Fantasma t="RETORNO" ini={220} fim={486} y={1440} tam={330} vel={1.4} />

      {/* ato 1: o arquivo empoeirado */}
      {f < 90 && (
        <div style={{ position: 'absolute', left: 290, top: 560, width: 500, height: 600, borderRadius: 36, background: C.papel, border: `1.5px solid ${C.linha}`, padding: 40,
          opacity: Math.min(1, arq * 2) * (1 - abre), transform: `rotate(${-5 + 5 * abre}deg) scale(${(0.9 + 0.1 * arq) * (1 + abre * 0.3)})`, boxShadow: '0 50px 100px -40px rgba(0,0,0,.7)' }}>
          <Icone n="arquivo" tam={90} cor={C.fg2} traco={1.6} />
          <div style={{ fontFamily: M, fontSize: 30, color: C.fg, marginTop: 26 }}>pacientes_antigos</div>
          <div style={{ fontFamily: M, fontSize: 24, color: C.fg3, marginTop: 8 }}>planilha · editada há 1 ano</div>
          {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ height: 22, borderRadius: 6, background: C.linha, marginTop: 24, width: `${90 - (i % 3) * 18}%` }} />)}
        </div>
      )}
      {f < 90 && <Poeira />}

      {/* ato 2: o contador de vencidos */}
      <div style={{ position: 'absolute', top: 180, left: 0, right: 0, textAlign: 'center', opacity: Math.min(lerp(f, 96, 106, 0, 1), saida(f, 214, 10)) }}>
        <div style={{ fontFamily: G, fontWeight: 600, fontSize: 150, letterSpacing: '-0.05em', color: C.alerta, lineHeight: 1 }}>{vencidos}</div>
        <div style={{ fontFamily: M, fontSize: 28, color: C.fg2, marginTop: 12 }}>retornos vencidos · ninguém chamou</div>
      </div>

      {/* ato 3: a tela Retornos */}
      {f >= 210 && (
        <div style={{ position: 'absolute', left: 60, right: 60, top: 150, opacity: (1 - recua) * saida(f, 486, 10) }}>
          <div style={{ display: 'flex', gap: 14, opacity: lerp(f, 214, 226, 0, 1) }}>
            <div style={{ padding: '14px 28px', borderRadius: 99, background: C.verde, color: '#06100C', fontFamily: G, fontWeight: 600, fontSize: 32 }}>Procedimentos</div>
            <div style={{ padding: '14px 28px', borderRadius: 99, border: `1.5px solid ${C.linha2}`, color: C.fg2, fontFamily: G, fontWeight: 600, fontSize: 32 }}>Aniversários</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: M, fontSize: 26, color: C.fg2, alignSelf: 'center' }}>Retornos</div>
          </div>
          {REGRAS.map(([p, q], i) => {
            const s = mola(f, 226 + i * 14);
            const ok = f >= 240 + i * 14;
            return (
              <div key={i} style={{ marginTop: i ? 16 : 34, height: 100, borderRadius: 28, background: C.papel, border: `1.5px solid ${ok ? 'rgba(95,227,161,.4)' : C.linha}`, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px',
                opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px)` }}>
                <Icone n="volta" tam={44} cor={C.vivo} traco={2.2} />
                <span style={{ fontFamily: G, fontWeight: 600, fontSize: 38, color: C.ink, flex: 1, letterSpacing: '-0.02em' }}>{p}</span>
                <span style={{ fontFamily: M, fontSize: 28, color: C.vivo }}>{q}</span>
                <div style={{ width: 54 }}>{ok && <Check ini={240 + i * 14} tam={54} />}</div>
              </div>
            );
          })}
        </div>
      )}
      {f >= 210 && f < 236 && <Ponto x={540} y={chaves(f, [[212, 60], [230, 200]], Easing.bezier(0.55, 0, 0.9, 0.45))} r={26 * pDot} />}

      {/* a lista (ato 2 → 3: desce para baixo das regras) */}
      {f >= 68 && (
        <div style={{ position: 'absolute', left: 60, width: 960, top: tabY, height: ROWS.length * RDY, transform: `scale(${tabS - recua * 0.06})`, transformOrigin: '50% 0%', opacity: (1 - recua * 0.7) * saida(f, 486, 10), filter: recua > 0.02 ? `blur(${recua * 7}px)` : undefined }}>
          {ROWS.map((_, i) => <Linha key={i} i={i} />)}
        </div>
      )}

      {/* a mensagem que sai no dia */}
      {f >= 344 && f < 410 && (
        <div style={{ position: 'absolute', left: 90, right: 90, top: 1350, zIndex: 30, opacity: saida(f, 410, 8) }}>
          <Bolha t="Oi, Ana! Já faz 6 meses da sua limpeza. Vamos marcar a próxima?" ini={346} ia tam={34} max={900} />
        </div>
      )}

      {/* ato 4 */}
      {f >= 404 && (
        <>
          <div style={{ position: 'absolute', top: 640, left: 60, right: 60, zIndex: 30 }}>
            <Titulo t={'Retorno no\n*automático.*'} ini={408} fim={486} tam={120} linha={1.12} />
          </div>
          <div style={{ position: 'absolute', top: 1000, left: 0, right: 0, textAlign: 'center', fontFamily: M, fontSize: 26, color: C.fg3, zIndex: 30, opacity: Math.min(lerp(f, 420, 432, 0, 1), saida(f, 486, 8)) }}>pacientes fictícios · exemplo ilustrativo</div>
        </>
      )}

      <Narrada id="S3" />
      {f >= 486 && <div style={{ position: 'absolute', inset: 0, zIndex: 100, opacity: lerp(f, 486, 498, 0, 1) }}><Fecho ini={492} frase={'O paciente esquece.\n*A Thata não.*'} /></div>}
    </AbsoluteFill>
  );
};
