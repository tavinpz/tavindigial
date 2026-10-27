import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { carregarMensagens } from './api'
import { marcarDono } from '../lib/fn'
import Logo from '../site/Logo'
import Inicio from './Inicio'
import Prospectar from './Prospectar'
import Crm from './Crm'
import Leads from './Leads'
import Briefings from './Briefings'
import Mensagens from './Mensagens'
import Conteudo from './Conteudo'
import Coleta from './Coleta'
import LeadDrawer from './LeadDrawer'
import '../styles/painel.css'

const Ctx = createContext(null)
export const usePainel = () => useContext(Ctx)

// Menu principal: o trabalho do dia. Rodapé: o que se mexe de vez em quando.
const ABAS = [
  ['inicio', 'Início', Inicio, 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['prospectar', 'Prospectar', Prospectar, 'm22 2-7 20-4-9-9-4 20-7Z'],
  ['crm', 'CRM', Crm, 'M4 4h5v16H4zM10 4h5v10h-5zM16 4h4v13h-4z'],
  ['leads', 'Leads', Leads, 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM21 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8'],
  ['conteudo', 'Carrosséis', Conteudo, 'M3 6h13v13H3zM19 4v13M22 2v13'],
]
const EXTRAS = [
  ['coleta', 'Coleta de leads', Coleta],
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
  const [aba, setAba] = useState(() => { try { const a = localStorage.getItem('p-aba'); return ['inicio', 'prospectar', 'crm', 'leads', 'conteudo', 'coleta', 'briefings', 'mensagens'].includes(a) ? a : 'inicio' } catch { return 'inicio' } })
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

  // ── Ao vivo: o que muda no celular aparece no computador (e vice-versa) sem recarregar ──
  const [aoVivo, setAoVivo] = useState(false)
  const [novaVersao, setNovaVersao] = useState(false)
  const ultimo = useRef(0)
  const timer = useRef(null)
  const sincronizar = useCallback(() => {
    // junta rajadas de mudanças (a coleta grava dezenas de leads de uma vez) num recarregamento só
    clearTimeout(timer.current)
    const espera = Math.max(800, 4000 - (Date.now() - ultimo.current))
    timer.current = setTimeout(() => { ultimo.current = Date.now(); setVersao((v) => v + 1); recarregarMensagens() }, espera)
  }, [recarregarMensagens])

  useEffect(() => {
    if (!admin) return
    const canal = supabase.channel('painel-ao-vivo')
    for (const t of ['leads', 'envios', 'eventos', 'negocios', 'briefings', 'coleta_buscas']) {
      canal.on('postgres_changes', { event: '*', schema: 'public', table: t }, sincronizar)
    }
    canal.on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens' }, () => recarregarMensagens())
    canal.subscribe((st) => setAoVivo(st === 'SUBSCRIBED'))
    return () => { supabase.removeChannel(canal) }
  }, [admin, sincronizar, recarregarMensagens])

  // Painel novo publicado: troca sozinho para a versão nova (o celular costuma guardar a antiga)
  const conferirVersao = useCallback(async () => {
    try {
      const r = await fetch(`/versao.json?t=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return
      const { versao: v } = await r.json()
      if (!v || v === __VERSAO__) return
      const digitando = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      let jaTentou = false
      try { jaTentou = sessionStorage.getItem('p-recarregou') === v; sessionStorage.setItem('p-recarregou', v) } catch { /* sem storage */ }
      // recarrega sozinho uma vez por versão; se não pegar (cache teimoso), mostra o botão
      if (!digitando && !jaTentou && !document.querySelector('.p-drawer, .p-rajada')) window.location.reload()
      else setNovaVersao(true)
    } catch { /* sem rede: tenta depois */ }
  }, [])

  // Voltou para a aba (ex.: depois de mandar no WhatsApp/Instagram) ou passou 1 minuto: busca de novo
  useEffect(() => {
    if (!admin) return
    const voltou = () => { if (document.visibilityState === 'visible') { sincronizar(); conferirVersao() } }
    document.addEventListener('visibilitychange', voltou)
    window.addEventListener('focus', voltou)
    window.addEventListener('online', voltou)
    const relogio = setInterval(() => { if (document.visibilityState === 'visible') sincronizar() }, 60000)
    const versaoRelogio = setInterval(conferirVersao, 5 * 60000)
    conferirVersao()
    return () => {
      document.removeEventListener('visibilitychange', voltou)
      window.removeEventListener('focus', voltou)
      window.removeEventListener('online', voltou)
      clearInterval(relogio); clearInterval(versaoRelogio)
    }
  }, [admin, sincronizar, conferirVersao])

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
    <Ctx.Provider value={{ mensagens, recarregarMensagens, abrirLead: (id, opcoes = {}) => setLeadAberto({ id, ...opcoes }), avisar, versao, atualizar, irPara }}>
      <div className={`p-app ${menuAberto ? 'menu-aberto' : ''}`}>
        <header className="p-topbar">
          <button className="p-hamb" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Ico d="M4 7h16M4 12h16M4 17h16" /></button>
          <strong className="p-logo"><Logo /></strong>
        </header>
        <div className="p-veu" onClick={() => setMenuAberto(false)} aria-hidden="true" />
        <aside className="p-lateral">
          <strong className="p-logo"><Logo /></strong>
          <nav className="p-menu" aria-label="Seções do painel">
            {ABAS.map(([id, nome, , ico]) => (
              <button key={id} className={id === aba ? 'ativa' : ''} onClick={() => { setAba(id); setMenuAberto(false) }} aria-current={id === aba ? 'page' : undefined}>
                <Ico d={ico} />{nome}
              </button>
            ))}
          </nav>
          <div className="p-lateral-pe">
            <span className={`p-vivo ${aoVivo ? 'on' : ''}`} title={aoVivo ? 'Atualizando sozinho' : 'Reconectando…'}>{aoVivo ? 'Ao vivo' : 'Reconectando…'}</span>
            {EXTRAS.map(([id, nome]) => (
              <button key={id} className={id === aba ? 'ativa' : ''} onClick={() => irPara(id)}>{nome}</button>
            ))}
            <a href="/" target="_blank" rel="noreferrer">Ver o site</a>
            <button onClick={() => supabase.auth.signOut()}>Sair</button>
          </div>
        </aside>
        <main className="p-conteudo">
          {prontas ? <Atual key={aba} /> : <p className="p-vazio">Carregando…</p>}
        </main>
        {leadAberto && <LeadDrawer key={leadAberto.id} id={leadAberto.id} iniciarPagamento={!!leadAberto.pagar} fechar={() => setLeadAberto(null)} />}
        {aviso && <div className="p-toast" role="status">{aviso}</div>}
        {novaVersao && (
          <button className="p-nova-versao" onClick={() => window.location.reload()}>Painel atualizado. Toque para carregar a versão nova</button>
        )}
      </div>
    </Ctx.Provider>
  )
}
