import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { carregarMensagens } from './api'
import { marcarDono } from '../lib/fn'
import Logo from '../site/Logo'
import Inicio from './Inicio'
import MetricasGeral from './MetricasGeral'
import LeadsUnico from './LeadsUnico'
import Cofre from './Cofre'
import Crm from './Crm'
import Briefings from './Briefings'
import Videos from './Videos'
import Estudio from './Estudio'
import { CANAIS } from './canais'
import Coleta from './Coleta'
import LeadDrawer from './LeadDrawer'
import MenuLateral from './MenuLateral'
import Jogos from './Jogos'
import Mensagens from './Mensagens'
import '../styles/painel.css'

const Ctx = createContext(null)
export const usePainel = () => useContext(Ctx)

// Menu principal: o trabalho do dia. Rodapé: o que se mexe de vez em quando.
const ABAS = [
  ['inicio', 'Início', Inicio, 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['metricas', 'Métricas', MetricasGeral, 'M3 3v18h18M7 15l4-4 3 3 6-7'],
  ['prospectar', 'Leads', LeadsUnico, 'm22 2-7 20-4-9-9-4 20-7Z'],
  ['crm', 'CRM', Crm, 'M4 4h5v16H4zM10 4h5v10h-5zM16 4h4v13h-4z'],
  ['cofre', 'Cofre', Cofre, 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4'],
]
// Um item de menu por canal (o componente muda conforme o tipo do canal)
const ABAS_CANAIS = CANAIS.map((c) => [`canal:${c.id}`, c.nome, c.tipo === 'marca'
  ? () => <Estudio canal={c.id} nome={c.nome} />
  : () => <Videos canal={c.id} nome={c.nome} />, null, c])
const EXTRAS = [
  ['coleta', 'Coleta', Coleta, 'M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z'],
  ['briefings', 'Briefings', Briefings, 'M9 3h6l1 2h3v16H5V5h3zM9 12h6M9 16h4'],
  ['mensagens', 'Mensagens', Mensagens, 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
]
const JOGOS_ABAS = [['jogos', 'Todos os jogos', Jogos, 'M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-3.9 3.2L2 14.5a2.5 2.5 0 0 0 4.4 2L8 15h8l1.6 1.5a2.5 2.5 0 0 0 4.4-2l-.8-6.3A4 4 0 0 0 17.3 5Z']]
// Menu: fixos no topo + um grupo (acordeão) por frente de renda. Frente nova = mais um grupo aqui.
const TOPO = ABAS.filter(([id]) => ['inicio', 'metricas', 'cofre'].includes(id))
const GRUPOS = [
  { id: 'sites', nome: 'Sites', itens: [...ABAS.filter(([id]) => ['prospectar', 'crm'].includes(id)), ...EXTRAS] },
  { id: 'canais', nome: 'Canais', canais: true, itens: ABAS_CANAIS },
  { id: 'jogos', nome: 'Jogos', itens: JOGOS_ABAS },
]
const TODAS = [...ABAS, ...ABAS_CANAIS, ...EXTRAS, ...JOGOS_ABAS]
const ANTIGAS = { conteudo: 'canal:tavin-digital', videos: 'canal:concrete-atlas', leads: 'prospectar' }

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
  const [aba, setAba] = useState(() => {
    try { const a = ANTIGAS[localStorage.getItem('p-aba')] || localStorage.getItem('p-aba'); return TODAS.some(([id]) => id === a) ? a : 'inicio' } catch { return 'inicio' }
  })
  const [mensagens, setMensagens] = useState([])
  const [prontas, setProntas] = useState(false)
  const [leadAberto, setLeadAberto] = useState(null)
  const [aviso, setAviso] = useState('')
  const [versao, setVersao] = useState(0)
  const [menuAberto, setMenuAberto] = useState(false)
  const [recolhido, setRecolhido] = useState(() => { try { return JSON.parse(localStorage.getItem('menu-recolhido') || 'false') } catch { return false } })
  const [celular, setCelular] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const f = () => setCelular(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

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
  // resposta da extensão do WhatsApp (ex.: número sem WhatsApp)
  useEffect(() => {
    const ouvir = (e) => {
      if (e.source !== window || e.data?.tipo !== 'tavin-wa-resultado') return
      if (e.data.resultado === 'nao-tem-whatsapp') avisar('Esse número não tem WhatsApp')
      else if (e.data.resultado === 'aba-nova') avisar('Abri o WhatsApp Web numa aba nova: deixe ela aberta para as próximas')
    }
    window.addEventListener('message', ouvir)
    return () => window.removeEventListener('message', ouvir)
  }, [avisar])
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
    for (const t of ['leads', 'envios', 'eventos', 'negocios', 'briefings', 'coleta_buscas', 'videos', 'conteudo']) {
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
      <div className={`p-app ${menuAberto ? 'menu-aberto' : ''} ${recolhido && !celular ? 'menu-mini' : ''}`}>
        <header className="p-topbar">
          <button className="p-hamb" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Ico d="M4 7h16M4 12h16M4 17h16" /></button>
          <strong className="p-logo"><Logo /></strong>
        </header>
        <div className="p-veu" onClick={() => setMenuAberto(false)} aria-hidden="true" />
        <MenuLateral topo={TOPO} grupos={GRUPOS} aba={aba} ir={irPara} aoVivo={aoVivo}
          recolhido={recolhido && !celular} setRecolhido={setRecolhido} sair={() => supabase.auth.signOut()} />
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
