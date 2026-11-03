import { useEffect, useMemo, useState } from 'react'
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

function Item({ id, nome, ico, canal, aba, ir, recolhido }) {
  return (
    <button className={`m-item ${canal ? 'm-canal' : ''} ${id === aba ? 'ativa' : ''}`} onClick={() => ir(id)} aria-current={id === aba ? 'page' : undefined} title={recolhido ? nome : undefined}>
      {canal ? <LogoCanal c={canal} /> : <Ico d={ico} />}<span className="m-txt">{nome}</span>
    </button>
  )
}

// Lista de canais: arrastar/setas para reordenar e busca
function Canais({ itens, aba, ir, recolhido, organizar }) {
  const [ordem, setOrdem] = useState(() => ler('menu-ordem', []))
  const [busca, setBusca] = useState('')
  const [arrastando, setArrastando] = useState(null)
  const [sobre, setSobre] = useState(null)
  useEffect(() => {
    supabase.from('painel_prefs').select('valor').eq('chave', 'menu-ordem').maybeSingle().then(({ data }) => { if (Array.isArray(data?.valor)) setOrdem(data.valor) })
  }, [])
  const ordenados = useMemo(() => {
    const pos = (id) => { const i = ordem.indexOf(id); return i < 0 ? 1e6 + itens.findIndex((c) => c[4].id === id) : i }
    return [...itens].sort((a, b) => pos(a[4].id) - pos(b[4].id))
  }, [itens, ordem])
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
            <Item id={id} nome={nome} canal={c} aba={aba} ir={ir} recolhido={recolhido} />
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
      {organizar && !recolhido && <p className="m-dica">Arraste ou use as setas.</p>}
    </>
  )
}

export default function MenuLateral({ topo, grupos, aba, ir, aoVivo, recolhido, setRecolhido, sair }) {
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
                  ? <Canais itens={g.itens} aba={aba} ir={ir} recolhido={recolhido} organizar={organizar} />
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
