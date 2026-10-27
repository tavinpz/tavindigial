import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { carregarMensagens } from './api'
import { marcarDono } from '../lib/fn'
import Hoje from './Hoje'
import Funil from './Funil'
import Leads from './Leads'
import Briefings from './Briefings'
import Mensagens from './Mensagens'
import Metricas from './Metricas'
import Conteudo from './Conteudo'
import LeadDrawer from './LeadDrawer'
import '../styles/painel.css'

const Ctx = createContext(null)
export const usePainel = () => useContext(Ctx)

// Menu principal: o trabalho do dia. Rodapé: o que se mexe de vez em quando.
const ABAS = [
  ['hoje', 'Hoje', Hoje, 'M4 12h4l3-8 4 16 3-8h2'],
  ['conversas', 'Conversas', Funil, 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z'],
  ['leads', 'Leads', Leads, 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM21 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8'],
  ['metricas', 'Métricas', Metricas, 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['conteudo', 'Carrosséis', Conteudo, 'M3 6h13v13H3zM19 4v13M22 2v13'],
]
const EXTRAS = [
  ['briefings', 'Briefings', Briefings],
  ['mensagens', 'Textos das mensagens', Mensagens],
]
const TODAS = [...ABAS, ...EXTRAS]

const Ico = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) setErro('E-mail ou senha incorretos.')
  }

  return (
    <main className="p-login">
      <form onSubmit={entrar}>
        <h1>Painel Tavin Digital</h1>
        <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required /></label>
        {erro && <p className="p-erro" role="alert">{erro}</p>}
        <button className="p-btn p-btn--forte" disabled={carregando}>{carregando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  )
}

export default function Painel() {
  const [sessao, setSessao] = useState(undefined)
  const [admin, setAdmin] = useState(null)
  const [aba, setAba] = useState(() => localStorage.getItem('p-aba') || 'hoje')
  const [mensagens, setMensagens] = useState([])
  const [prontas, setProntas] = useState(false)
  const [leadAberto, setLeadAberto] = useState(null)
  const [aviso, setAviso] = useState('')
  const [versao, setVersao] = useState(0)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    document.title = 'Painel · Tavin Digital'
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => { sub.subscription.unsubscribe(); meta.remove() }
  }, [])

  useEffect(() => {
    if (!sessao) { setAdmin(null); return }
    supabase.rpc('is_admin').then(({ data }) => { setAdmin(!!data); if (data) marcarDono() })
  }, [sessao])

  const recarregarMensagens = useCallback(() => carregarMensagens().then(setMensagens).catch(() => {}).finally(() => setProntas(true)), [])
  useEffect(() => { if (admin) recarregarMensagens() }, [admin, recarregarMensagens])

  useEffect(() => { try { localStorage.setItem('p-aba', aba) } catch { /* sem storage */ } }, [aba])

  const avisar = useCallback((t) => { setAviso(t); setTimeout(() => setAviso(''), 2600) }, [])
  const atualizar = useCallback(() => setVersao((v) => v + 1), [])

  if (sessao === undefined) return <div className="p-carregando">Carregando…</div>
  if (!sessao) return <Login />
  if (admin === null) return <div className="p-carregando">Verificando acesso…</div>
  if (!admin) {
    return (
      <main className="p-login"><form><h1>Sem acesso</h1><p>Este e-mail não tem permissão para o painel.</p>
        <button type="button" className="p-btn" onClick={() => supabase.auth.signOut()}>Sair</button></form></main>
    )
  }

  const Atual = (TODAS.find(([id]) => id === aba) || ABAS[0])[2]
  const irPara = (id) => { setAba(id); setMenuAberto(false) }

  return (
    <Ctx.Provider value={{ mensagens, recarregarMensagens, abrirLead: setLeadAberto, avisar, versao, atualizar, irPara }}>
      <div className={`p-app ${menuAberto ? 'menu-aberto' : ''}`}>
        <header className="p-barra">
          <button className="p-hamb" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Ico d="M4 7h16M4 12h16M4 17h16" /></button>
          <strong className="p-logo">Tavin<span>.</span>Digital</strong>
        </header>
        <div className="p-veu" onClick={() => setMenuAberto(false)} aria-hidden="true" />
        <aside className="p-lateral">
          <strong className="p-logo">Tavin<span>.</span>Digital</strong>
          <nav className="p-menu" aria-label="Seções do painel">
            {ABAS.map(([id, nome, , ico]) => (
              <button key={id} className={id === aba ? 'ativa' : ''} onClick={() => { setAba(id); setMenuAberto(false) }} aria-current={id === aba ? 'page' : undefined}>
                <Ico d={ico} />{nome}
              </button>
            ))}
          </nav>
          <div className="p-lateral-pe">
            {EXTRAS.map(([id, nome]) => (
              <button key={id} className={id === aba ? 'ativa' : ''} onClick={() => irPara(id)}>{nome}</button>
            ))}
            <a href="/" target="_blank" rel="noreferrer">Ver o site</a>
            <a href="https://api.thata.online/form/coleta-tavin" target="_blank" rel="noreferrer">Nova coleta de leads</a>
            <button onClick={() => supabase.auth.signOut()}>Sair</button>
          </div>
        </aside>
        <main className="p-conteudo">
          {prontas ? <Atual key={`${aba}-${versao}`} /> : <p className="p-vazio">Carregando…</p>}
        </main>
        {leadAberto && <LeadDrawer id={leadAberto} fechar={() => setLeadAberto(null)} />}
        {aviso && <div className="p-toast" role="status">{aviso}</div>}
      </div>
    </Ctx.Provider>
  )
}
