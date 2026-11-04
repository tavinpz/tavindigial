import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import Logo from '../site/Logo'

// Menu lateral organizado por frente de renda: itens fixos no topo e grupos que abrem e fecham (acordeão).
// Para uma frente nova, é só mandar mais um grupo em `grupos` (Painel.jsx).
// Canais: arrastar para mudar a ordem (ou "Organizar" → setas) e buscar quando tiver muitos.
// "Recolher menu" deixa só os ícones. Ordem, grupos abertos e menu recolhido ficam no banco (painel_prefs).
const Ico = ({ d, t = 17 }) => (
  <svg viewBox="0 0 24 24" width={t} height={t} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)
const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao } catch { return padrao } }
const guardar = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* sem storage */ }
  supabase.from('painel_prefs').upsert({ chave: k, valor: v, atualizado_em: new Date().toISOString() }, { onConflict: 'chave' }).then(() => {}, () => {})
}

function LogoCanal({ c }) {
  return c.logo ? <img className="m-canal-logo" src={c.logo} alt="" aria-hidden="true" /> : <span className="m-canal-sigla" style={{ '--c': c.cor }} aria-hidden="true">{c.sigla}</span>
}

const compacto = (n) => Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const n = (x) => Number(x || 0).toLocaleString('pt-BR')
const OLHO = 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'

// Cartão ao passar o mouse no canal: views de hoje rede por rede
function CartaoViews({ nome, v, pos }) {
  const r = v.por_rede || {}
  const hora = v.atualizado_em ? new Date(v.atualizado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
  const linhas = [
    ['instagram', 'Instagram', '#D62F8C', r.instagram != null ? n(r.instagram) : null],
    ['youtube', 'YouTube', '#E02424', r.youtube != null ? n(r.youtube) : null],
    ['tiktok', 'TikTok', '#25F4EE', v.curtidas ? `+${n(v.curtidas)} curtidas` : null],
  ].filter((l) => l[3] != null)
  return createPortal(
    <div className="m-cartao" role="tooltip" style={{ left: pos.x, top: pos.y }}>
      <span className="m-cartao-nome">{nome}</span>
      <span className="m-cartao-total"><b>{n(v.views)}</b> views hoje</span>
      {linhas.length > 0 && (
        <ul>{linhas.map(([k, rede, cor, txt]) => <li key={k}><i style={{ background: cor }} />{rede}<b>{txt}</b></li>)}</ul>
      )}
      <small>Contadas desde 00h. Atualiza a cada 30 min{hora ? ` (última às ${hora})` : ''}. Quem tem mais views fica em cima no menu.</small>
    </div>, document.body)
}

function Item({ id, nome, ico, canal, aba, ir, recolhido, v }) {
  const [pos, setPos] = useState(null)
  // quando as views sobem desde a última leitura, o número pisca e mostra quanto entrou
  const antes = useRef(v?.views ?? null)
  const [subiu, setSubiu] = useState(0)
  useEffect(() => {
    const atual = v?.views ?? null
    const ant = antes.current
    antes.current = atual
    if (ant == null || atual == null || atual <= ant) return undefined
    setSubiu(atual - ant)
    const t = setTimeout(() => setSubiu(0), 8000)
    return () => clearTimeout(t)
  }, [v?.views])
  const mostrar = (e) => { if (!canal || !v) return; const r = e.currentTarget.getBoundingClientRect(); setPos({ x: r.right + 10, y: r.top + r.height / 2 }) }
  return (
    <>
      <button className={`m-item ${canal ? 'm-canal' : ''} ${id === aba ? 'ativa' : ''}`} onClick={() => ir(id)} aria-current={id === aba ? 'page' : undefined}
        onMouseEnter={mostrar} onMouseLeave={() => setPos(null)} onFocus={mostrar} onBlur={() => setPos(null)}
        title={recolhido && !v ? nome : undefined} aria-label={v ? `${nome}, ${n(v.views)} views hoje` : undefined}>
        {canal ? <LogoCanal c={canal} /> : <Ico d={ico} />}<span className="m-txt">{nome}</span>
        {canal && v && !recolhido && (
          <span className={`m-views ${subiu ? 'm-views--subiu' : ''} ${v.views ? '' : 'm-views--zero'}`} aria-hidden="true">
            <Ico d={OLHO} t={11} />{subiu ? `+${compacto(subiu)}` : compacto(v.views)}
          </span>
        )}
      </button>
      {pos && <CartaoViews nome={nome} v={v} pos={pos} />}
    </>
  )
}

// Lista de canais: arrastar/setas para reordenar e busca
function Canais({ itens, aba, ir, recolhido, organizar, views = {} }) {
  const [ordem, setOrdem] = useState(() => ler('menu-ordem', []))
  const [busca, setBusca] = useState('')
  const [arrastando, setArrastando] = useState(null)
  const [sobre, setSobre] = useState(null)
  useEffect(() => {
    supabase.from('painel_prefs').select('valor').eq('chave', 'menu-ordem').maybeSingle().then(({ data }) => { if (Array.isArray(data?.valor)) setOrdem(data.valor) })
  }, [])
  const ordenados = useMemo(() => {
    const pos = (id) => { const i = ordem.indexOf(id); return i < 0 ? 1e6 + itens.findIndex((c) => c[4].id === id) : i }
    // quem tem mais views hoje fica em cima; empate (ex.: de manhã, tudo zerado) segue a ordem que você arrumou
    const vw = (id) => views[id]?.views || 0
    return [...itens].sort((a, b) => vw(b[4].id) - vw(a[4].id) || pos(a[4].id) - pos(b[4].id))
  }, [itens, ordem, views])
  const t = busca.trim().toLowerCase()
  const visiveis = t ? ordenados.filter(([, nome]) => nome.toLowerCase().includes(t)) : ordenados
  const salvar = (ids) => { setOrdem(ids); guardar('menu-ordem', ids) }
  const ids = () => ordenados.map((x) => x[4].id)
  function mover(id, d) {
    const l = ids(), i = l.indexOf(id), j = i + d
    if (j < 0 || j >= l.length) return
    ;[l[i], l[j]] = [l[j], l[i]]; salvar(l)
  }
  function soltar(alvo) {
    if (!arrastando || arrastando === alvo) return
    const l = ids().filter((x) => x !== arrastando)
    l.splice(l.indexOf(alvo), 0, arrastando); salvar(l)
  }
  return (
    <>
      {!recolhido && itens.length > 8 && <input className="m-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar canal" aria-label="Buscar canal" />}
      <ul className="m-lista">
        {visiveis.map(([id, nome, , , c], i) => (
          <li key={id} className={`${arrastando === c.id ? 'm-arrastando' : ''} ${sobre === c.id && arrastando && arrastando !== c.id ? 'm-sobre' : ''}`}
            draggable={!recolhido && !t}
            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.id); setArrastando(c.id) }}
            onDragEnd={() => { setArrastando(null); setSobre(null) }}
            onDragOver={(e) => { if (arrastando) { e.preventDefault(); if (sobre !== c.id) setSobre(c.id) } }}
            onDrop={(e) => { e.preventDefault(); soltar(c.id); setArrastando(null); setSobre(null) }}>
            <Item id={id} nome={nome} canal={c} aba={aba} ir={ir} recolhido={recolhido} v={views[c.id]} />
            {organizar && !recolhido && (
              <span className="m-setas">
                <button type="button" onClick={() => mover(c.id, -1)} disabled={i === 0} aria-label={`Subir ${nome}`}><Ico d="m6 15 6-6 6 6" t={13} /></button>
                <button type="button" onClick={() => mover(c.id, 1)} disabled={i === visiveis.length - 1} aria-label={`Descer ${nome}`}><Ico d="m6 9 6 6 6-6" t={13} /></button>
              </span>
            )}
          </li>
        ))}
        {t && visiveis.length === 0 && <li className="m-nada">Nenhum canal com "{busca}"</li>}
      </ul>
      {organizar && !recolhido && <p className="m-dica">Quem tem mais views hoje sobe sozinho. A sua ordem vale para os empates.</p>}
    </>
  )
}

export default function MenuLateral({ topo, grupos, aba, ir, aoVivo, recolhido, setRecolhido, sair, views }) {
  const [abertos, setAbertos] = useState(() => ler('menu-grupos', Object.fromEntries(grupos.map((g) => [g.id, true]))))
  const [organizar, setOrganizar] = useState(false)

  useEffect(() => {
    supabase.from('painel_prefs').select('chave,valor').in('chave', ['menu-grupos', 'menu-recolhido']).then(({ data }) => {
      for (const r of data || []) {
        if (r.chave === 'menu-grupos' && r.valor && typeof r.valor === 'object') setAbertos(r.valor)
        if (r.chave === 'menu-recolhido') setRecolhido(!!r.valor)
      }
    })
  }, [])

  const aberto = (g) => abertos[g.id] !== false
  const alternar = (g) => { const v = { ...abertos, [g.id]: !aberto(g) }; setAbertos(v); guardar('menu-grupos', v); if (g.canais) setOrganizar(false) }
  const alternarMenu = () => { const v = !recolhido; setRecolhido(v); guardar('menu-recolhido', v); setOrganizar(false) }

  return (
    <aside className={`p-lateral m ${recolhido ? 'm--mini' : ''}`}>
      <div className="m-topo">
        {!recolhido && <strong className="p-logo"><Logo /></strong>}
        <button type="button" className="m-recolher" onClick={alternarMenu} aria-label={recolhido ? 'Abrir menu' : 'Recolher menu'} title={recolhido ? 'Abrir menu' : 'Recolher menu'}>
          <Ico d={recolhido ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} t={15} />
        </button>
      </div>

      <nav className="m-nav" aria-label="Seções do painel">
        {topo.map(([id, nome, , ico]) => <Item key={id} id={id} nome={nome} ico={ico} aba={aba} ir={ir} recolhido={recolhido} />)}

        {grupos.map((g) => {
          const ab = aberto(g)
          const temAtivo = g.itens.some(([id]) => id === aba)
          return (
            <section key={g.id} className={`m-grupo ${ab ? 'on' : ''}`}>
              <div className="m-grupo-cab">
                <button type="button" className="m-grupo-btn" onClick={() => alternar(g)} aria-expanded={ab} title={recolhido ? g.nome : undefined}>
                  <span className="m-txt">{g.nome}</span>
                  {!recolhido && <small>{g.itens.length}</small>}
                  {!recolhido && <span className="m-seta"><Ico d={ab ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} t={13} /></span>}
                </button>
                {g.canais && ab && !recolhido && (
                  <button type="button" className={`m-organizar ${organizar ? 'on' : ''}`} onClick={() => setOrganizar(!organizar)}>{organizar ? 'Pronto' : 'Organizar'}</button>
                )}
              </div>
              {(ab || recolhido)
                ? (g.canais
                  ? <Canais itens={g.itens} aba={aba} ir={ir} recolhido={recolhido} organizar={organizar} views={views} />
                  : <div className="m-lista">{g.itens.map(([id, nome, , ico]) => <Item key={id} id={id} nome={nome} ico={ico} aba={aba} ir={ir} recolhido={recolhido} />)}</div>)
                : temAtivo && (() => { const x = g.itens.find(([id]) => id === aba); return <div className="m-lista"><Item id={x[0]} nome={x[1]} ico={x[3]} canal={x[4]} aba={aba} ir={ir} recolhido={recolhido} /></div> })()}
            </section>
          )
        })}
      </nav>

      <div className="m-pe">
        <span className={`p-vivo m-vivo ${aoVivo ? 'on' : ''}`} title={aoVivo ? 'Atualizando sozinho' : 'Reconectando…'}><span className="m-txt">{aoVivo ? 'Ao vivo' : 'Reconectando…'}</span></span>
        {!recolhido && (
          <span className="m-pe-links">
            <a href="/" target="_blank" rel="noreferrer">Ver o site</a>
            <button type="button" onClick={sair}>Sair</button>
          </span>
        )}
      </div>
    </aside>
  )
}
