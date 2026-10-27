import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { carregarMensagens } from './api'
import Hoje from './Hoje'
import Followups from './Followups'
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

const ABAS = [
  ['hoje', 'Hoje', Hoje],
  ['followups', 'Follow-ups', Followups],
  ['funil', 'Funil', Funil],
  ['leads', 'Leads', Leads],
  ['briefings', 'Briefings', Briefings],
  ['metricas', 'Métricas', Metricas],
  ['mensagens', 'Mensagens', Mensagens],
  ['conteudo', 'Conteúdo', Conteudo],
]

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
  const [leadAberto, setLeadAberto] = useState(null)
  const [aviso, setAviso] = useState('')
  const [versao, setVersao] = useState(0)

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
    supabase.rpc('is_admin').then(({ data }) => setAdmin(!!data))
  }, [sessao])

  const recarregarMensagens = useCallback(() => carregarMensagens().then(setMensagens).catch(() => {}), [])
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

  const Atual = (ABAS.find(([id]) => id === aba) || ABAS[0])[2]

  return (
    <Ctx.Provider value={{ mensagens, recarregarMensagens, abrirLead: setLeadAberto, avisar, versao, atualizar }}>
      <div className="p-app">
        <header className="p-topo">
          <strong>Tavin<span>.</span>Digital</strong>
          <nav className="p-abas" aria-label="Seções do painel">
            {ABAS.map(([id, nome]) => (
              <button key={id} className={id === aba ? 'ativa' : ''} onClick={() => setAba(id)} aria-current={id === aba ? 'page' : undefined}>
                {nome}
              </button>
            ))}
          </nav>
          <button className="p-sair" onClick={() => supabase.auth.signOut()}>Sair</button>
        </header>
        <main className="p-conteudo">
          <Atual key={`${aba}-${versao}`} />
        </main>
        {leadAberto && <LeadDrawer id={leadAberto} fechar={() => setLeadAberto(null)} />}
        {aviso && <div className="p-toast" role="status">{aviso}</div>}
      </div>
    </Ctx.Provider>
  )
}
