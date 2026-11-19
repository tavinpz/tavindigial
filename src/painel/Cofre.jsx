import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CANAIS } from './canais'
import { usePainel } from './Painel'
import { Janela } from './Pipeline'
import { CanaisCofre, EmailsDisponiveis, REDES_USO, canalDoUso, livre } from './CofreExtra'

// Cofre de acessos (cadeado no menu): logins, e-mails e senhas das contas de cada perfil.
// A senha mestra nunca sai deste navegador: dela sai a chave (PBKDF2) que criptografa cada acesso (AES-GCM).
// O banco só guarda texto embaralhado. Esqueceu a senha mestra = não tem como recuperar.
const TRANCA_MIN = 10
const VERIFICA = 'cofre-tavin-ok'
const REDES = ['Instagram', 'TikTok', 'YouTube', 'E-mail', 'Facebook', 'Kiwify', 'Outro']
const SLOTS = ['Instagram', 'TikTok', 'YouTube', 'E-mail']
const mesmo = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()
const VAZIO = { canal: '', rede: 'Instagram', conta: '', login: '', email: '', senha: '', telefone: '', recuperacao: '', notas: '' }
// @ que o painel já conhece de cada canal (preenche sozinho ao adicionar)
const CONHECIDAS = {
  'tavin-digital': { Instagram: '@tavindigital' }, thata: { Instagram: '@thata.ia' },
  'concrete-atlas': { Instagram: '@concreteatlas.labs', YouTube: '@concreteatlas.studio' },
  zerando: { Instagram: '@zerando.90' }, loadbearing: { Instagram: '@loadbearing.tv' }, pawslated: { Instagram: '@pawslated' },
  gusttacosta: { Instagram: '@gusttacosta', YouTube: '@eugustavocosta', TikTok: '@gusttacostar' },
}

// ── criptografia (Web Crypto, nativa do navegador) ──
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
async function chaveDe(senha, sal, iteracoes) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: deB64(sal), iterations: iteracoes, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
async function cifrar(chave, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chave, new TextEncoder().encode(JSON.stringify(obj)))
  return `${b64(iv)}.${b64(c)}`
}
async function decifrar(chave, txt) {
  const [iv, c] = txt.split('.')
  const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(iv) }, chave, deB64(c))
  return JSON.parse(new TextDecoder().decode(p))
}
function gerarSenha(n = 18) {
  const a = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?'
  const r = crypto.getRandomValues(new Uint32Array(n))
  return Array.from(r, (x) => a[x % a.length]).join('')
}

function Campo({ rotulo, segredo, valor }) {
  const [ver, setVer] = useState(false)
  const [copiado, setCopiado] = useState(false)
  if (!valor) return null
  const copiar = async () => { try { await navigator.clipboard.writeText(valor); setCopiado(true); setTimeout(() => setCopiado(false), 1400) } catch { /* sem clipboard */ } }
  return (
    <div className="cf-campo">
      <span className="cf-rot">{rotulo}</span>
      <span className={`cf-val ${segredo && !ver ? 'cf-val--oculto' : ''}`}>{segredo && !ver ? '••••••••••' : valor}</span>
      <span className="cf-botoes">
        {segredo && <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? `Esconder ${rotulo}` : `Mostrar ${rotulo}`}>{ver ? 'Esconder' : 'Ver'}</button>}
        <button type="button" onClick={copiar} aria-label={`Copiar ${rotulo}`}>{copiado ? 'Copiado ✓' : 'Copiar'}</button>
      </span>
    </div>
  )
}

function Acesso({ i, editar, apagar, setApagar, remover }) {
  if (i.quebrado) return <div className="cf-slot"><p className="p-erro">Este acesso foi salvo com outra senha do cofre e não abre.</p></div>
  return (
    <div className="cf-slot">
      <div className="cf-slot-cab">
        <span className="cf-slot-rede">{i.rede}</span>
        <span className="cf-item-acoes">
          <button type="button" onClick={editar}>Editar</button>
          {apagar === i.id
            ? <><button type="button" className="cf-perigo" onClick={() => remover(i.id)}>Apagar mesmo</button><button type="button" onClick={() => setApagar(null)}>Não</button></>
            : <button type="button" onClick={() => setApagar(i.id)} aria-label={`Apagar ${i.conta}`}>Apagar</button>}
        </span>
      </div>
      <b className="cf-slot-conta">{i.conta}</b>
      <Campo rotulo="Login" valor={i.login} />
      <Campo rotulo="E-mail" valor={i.email} />
      <Campo rotulo="Senha" valor={i.senha} segredo />
      <Campo rotulo="Telefone" valor={i.telefone} />
      <Campo rotulo="Recuperação" valor={i.recuperacao} segredo />
      {i.notas && <p className="cf-notas">{i.notas}</p>}
    </div>
  )
}

function Formulario({ inicial, salvar, cancelar, estoque = [] }) {
  const [f, setF] = useState({ ...VAZIO, ...inicial })
  const [verSenha, setVerSenha] = useState(!inicial?.senha)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <form className="cf-form" onSubmit={(e) => { e.preventDefault(); salvar(f) }} autoComplete="off">
      <div className="cf-grade">
        <label className="p-campo">Perfil
          <select value={f.canal} onChange={set('canal')}>
            <option value="">Outro / sem perfil</option>
            {CANAIS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label className="p-campo">Rede ou serviço
          <select value={f.rede} onChange={set('rede')}>{REDES.map((r) => <option key={r}>{r}</option>)}</select>
        </label>
        <label className="p-campo">Conta (@ ou nome)<input value={f.conta} onChange={set('conta')} placeholder="@zerando.90" required /></label>
        <label className="p-campo">Usuário / login<input value={f.login} onChange={set('login')} placeholder="zerando.90" /></label>
        <label className="p-campo">E-mail ligado
          <input type="email" list="cf-estoque" value={f.email} placeholder="conta@gmail.com" onChange={(e) => {
            const v = e.target.value
            const c = estoque.find((x) => mesmo(x.email, v))
            setF({ ...f, email: v, login: f.login || (c ? v : f.login), senha: f.senha || (c && f.rede === 'YouTube' ? c.senha || '' : f.senha) })
          }} />
          <datalist id="cf-estoque">{estoque.filter((x) => !REDES_USO.includes(f.rede) || livre(x, f.rede) || mesmo(x.email, f.email)).map((x) => <option key={x.id} value={x.email} />)}</datalist>
          {estoque.some((x) => mesmo(x.email, f.email)) && <small className="ce-liga">Do estoque: fica marcado como em uso neste canal</small>}
        </label>
        <label className="p-campo">Telefone ligado<input value={f.telefone} onChange={set('telefone')} placeholder="+55 …" /></label>
        <label className="p-campo cf-largo">Senha
          <span className="cf-senha">
            <input type={verSenha ? 'text' : 'password'} value={f.senha} onChange={set('senha')} autoComplete="new-password" />
            <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => setVerSenha(!verSenha)}>{verSenha ? 'Esconder' : 'Ver'}</button>
            <button type="button" className="p-btn p-btn--mini" onClick={() => { setF({ ...f, senha: gerarSenha() }); setVerSenha(true) }}>Gerar forte</button>
          </span>
        </label>
        <label className="p-campo cf-largo">Códigos de recuperação / 2FA<textarea rows={2} value={f.recuperacao} onChange={set('recuperacao')} /></label>
        <label className="p-campo cf-largo">Observações<textarea rows={2} value={f.notas} onChange={set('notas')} placeholder="Ex.: criada no celular do chip 4947, conta Meta Business X" /></label>
      </div>
      <div className="cf-form-pe">
        <button className="p-btn p-btn--forte">Salvar no cofre</button>
        <button type="button" className="p-btn p-btn--fraco" onClick={cancelar}>Cancelar</button>
      </div>
    </form>
  )
}

function Entrada({ cfg, abrir }) {
  const [senha, setSenha] = useState('')
  const [conf, setConf] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const criar = !cfg
  async function enviar(e) {
    e.preventDefault(); setErro('')
    if (criar && senha.length < 10) { setErro('Use pelo menos 10 caracteres.'); return }
    if (criar && senha !== conf) { setErro('As duas senhas não batem.'); return }
    setOcupado(true)
    try { await abrir(senha) } catch (x) { setErro(x.message) }
    setOcupado(false); setSenha(''); setConf('')
  }
  return (
    <form className="cf-entrada" onSubmit={enviar}>
      <span className="cf-cadeado" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></span>
      <h2>{criar ? 'Crie a senha do cofre' : 'Cofre trancado'}</h2>
      <p>{criar
        ? 'Essa senha abre os acessos das contas. Ela não fica salva em lugar nenhum: se esquecer, não dá para recuperar o que estiver dentro.'
        : 'Digite a senha do cofre. Ele tranca sozinho depois de 10 minutos parado.'}</p>
      <label className="p-campo">Senha do cofre<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus autoComplete={criar ? 'new-password' : 'current-password'} required /></label>
      {criar && <label className="p-campo">Repita a senha<input type="password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" required /></label>}
      {erro && <p className="p-erro" role="alert">{erro}</p>}
      <button className="p-btn p-btn--forte" disabled={ocupado}>{ocupado ? 'Abrindo…' : criar ? 'Criar e abrir' : 'Abrir'}</button>
    </form>
  )
}

export default function Cofre() {
  const { avisar } = usePainel() || { avisar: () => {} }
  const [cfg, setCfg] = useState(undefined)
  const [chave, setChave] = useState(null)
  const [itens, setItens] = useState([])
  const [editando, setEditando] = useState(null)
  const [busca, setBusca] = useState('')
  const [apagar, setApagar] = useState(null)
  const [trocar, setTrocar] = useState(false)
  const [aba, setAba] = useState(() => { try { return localStorage.getItem('cofre-aba') || 'contas' } catch { return 'contas' } })
  useEffect(() => { try { localStorage.setItem('cofre-aba', aba) } catch { /* sem storage */ } }, [aba])
  const ultimo = useRef(Date.now())

  useEffect(() => { supabase.from('cofre_config').select('*').maybeSingle().then(({ data }) => setCfg(data || null)) }, [])

  // tranca sozinho depois de X minutos sem mexer
  useEffect(() => {
    if (!chave) return
    const mexeu = () => { ultimo.current = Date.now() }
    const evs = ['pointerdown', 'keydown', 'scroll']
    evs.forEach((e) => window.addEventListener(e, mexeu, { passive: true }))
    const t = setInterval(() => { if (Date.now() - ultimo.current > TRANCA_MIN * 60000) trancar() }, 15000)
    return () => { evs.forEach((e) => window.removeEventListener(e, mexeu)); clearInterval(t) }
  }, [chave])

  function trancar() { setChave(null); setItens([]); setEditando(null); setTrocar(false) }

  async function carregar(k) {
    const { data, error } = await supabase.from('cofre').select('id,dados,atualizado_em').order('criado_em')
    if (error) { avisar('Não consegui ler o cofre'); return }
    const abertos = []
    for (const r of data || []) {
      try { abertos.push({ id: r.id, atualizado_em: r.atualizado_em, ...(await decifrar(k, r.dados)) }) } catch { abertos.push({ id: r.id, quebrado: true }) }
    }
    setItens(abertos)
    return abertos
  }

  // e-mails deixados na fila cofre_importar (sem senha): entram criptografados no estoque ao abrir o cofre
  async function puxarFila(k, abertos) {
    if (!abertos) return
    const { data } = await supabase.from('cofre_importar').select('email,perfil,duas_etapas,usos,notas')
    if (!data?.length) return
    const porEmail = Object.fromEntries((abertos || []).filter((i) => i.tipo === 'estoque').map((e) => [e.email, e]))
    let n = 0
    for (const p of data) {
      const atual = porEmail[p.email]
      const usos = { ...(p.usos || {}) }
      for (const [r, v] of Object.entries(atual?.usos || {})) if (String(v || '').trim()) usos[r] = v
      const notas = [atual?.notas, p.notas].filter(Boolean).filter((x, i, l) => l.indexOf(x) === i).join(' · ')
      const dados = { tipo: 'estoque', email: p.email, senha: atual?.senha || '', perfil: atual?.perfil || p.perfil || '', duas_etapas: atual?.duas_etapas ?? p.duas_etapas ?? null, usos, notas }
      const cif = await cifrar(k, dados)
      const { error } = atual
        ? await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', atual.id)
        : await supabase.from('cofre').insert({ dados: cif })
      if (!error) { n++; await supabase.from('cofre_importar').delete().eq('email', p.email) }
    }
    if (n) { avisar(`${n} e-mails entraram no estoque do cofre`); await carregar(k) }
  }

  // fila temporária cofre_fila (e-mails com senha e acessos vindos de planilha): criptografa aqui e apaga a linha
  async function puxarFilaCompleta(k) {
    const { data } = await supabase.from('cofre_fila').select('id,tipo,dados').order('id')
    if (!data?.length) return
    const abertos = (await carregar(k)) || []
    const porEmail = Object.fromEntries(abertos.filter((i) => i.tipo === 'estoque').map((e) => [String(e.email).toLowerCase(), e]))
    const acessos = abertos.filter((i) => i.tipo !== 'estoque' && !i.quebrado)
    let ne = 0, na = 0
    for (const { id: fid, tipo, dados: p } of data) {
      let r = { error: null }
      if (tipo === 'estoque') {
        const atual = porEmail[String(p.email).toLowerCase()]
        const usos = { ...(p.usos || {}) }
        for (const [rd, v] of Object.entries(atual?.usos || {})) if (String(v || '').trim()) usos[rd] = v
        const notas = [atual?.notas, p.notas].filter(Boolean).filter((x, i, l) => l.indexOf(x) === i).join(' · ')
        const d = { tipo: 'estoque', email: atual?.email || p.email, senha: atual?.senha || p.senha || '', perfil: atual?.perfil || p.perfil || '', duas_etapas: atual?.duas_etapas ?? p.duas_etapas ?? null, usos, notas }
        const cif = await cifrar(k, d)
        r = atual ? await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', atual.id) : await supabase.from('cofre').insert({ dados: cif })
        if (!r.error) { ne++; porEmail[String(d.email).toLowerCase()] = { ...d, id: atual?.id } }
      } else {
        const ja = acessos.find((i) => i.rede === p.rede && mesmo(i.login, p.login) && mesmo(i.conta, p.conta))
        if (!ja) { r = await supabase.from('cofre').insert({ dados: await cifrar(k, { ...VAZIO, ...p }) }); if (!r.error) { na++; acessos.push(p) } }
      }
      if (!r.error) await supabase.from('cofre_fila').delete().eq('id', fid)
    }
    avisar(`Planilha importada: ${ne} e-mails e ${na} acessos guardados no cofre`)
    await carregar(k)
  }

  async function abrir(senha) {
    if (!cfg) {
      const sal = b64(crypto.getRandomValues(new Uint8Array(16)))
      const k = await chaveDe(senha, sal, 310000)
      const verificador = await cifrar(k, VERIFICA)
      const { data, error } = await supabase.from('cofre_config').insert({ id: 1, sal, verificador, iteracoes: 310000 }).select().single()
      if (error) throw new Error('Não consegui criar o cofre.')
      setCfg(data); setChave(k); ultimo.current = Date.now(); setItens([])
      return
    }
    const k = await chaveDe(senha, cfg.sal, cfg.iteracoes)
    try { if ((await decifrar(k, cfg.verificador)) !== VERIFICA) throw new Error() } catch { throw new Error('Senha errada.') }
    setChave(k); ultimo.current = Date.now(); await puxarFila(k, await carregar(k)); await puxarFilaCompleta(k)
    // e-mails que já estavam marcados com um canal do painel ganham o acesso em "Contas dos canais"
    const abertos = await carregar(k)
    const faltam = acessosDoEstoque((abertos || []).filter((i) => i.tipo === 'estoque'), abertos || [])
    for (const a of faltam) {
      const { id, atualizado_em, quebrado, ...dados } = a
      const cif = await cifrar(k, dados)
      if (id) await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', id)
      else await supabase.from('cofre').insert({ dados: cif })
    }
    if (faltam.length) { avisar(`${faltam.length} ${faltam.length === 1 ? 'conta ligada' : 'contas ligadas'} aos canais pelo estoque de e-mails`); await carregar(k) }
  }

  async function salvar(f) {
    const { id, atualizado_em, quebrado, ...dados } = f
    const cif = await cifrar(chave, dados)
    const { error } = id
      ? await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', id)
      : await supabase.from('cofre').insert({ dados: cif })
    if (error) { avisar('Não salvou'); return }
    const c = CANAIS.find((x) => x.id === dados.canal)
    const e = c && REDES_USO.includes(dados.rede) && itens.find((x) => x.tipo === 'estoque' && mesmo(x.email, dados.email))
    if (e && livre(e, dados.rede)) {
      const novo = { ...e, usos: { ...(e.usos || {}), [dados.rede]: c.nome } }
      if (!novo.senha && dados.rede === 'YouTube' && dados.senha) novo.senha = dados.senha
      const { id: eid, atualizado_em: _a, quebrado: _q, ...resto } = novo
      await supabase.from('cofre').update({ dados: await cifrar(chave, resto), atualizado_em: new Date().toISOString() }).eq('id', eid)
    }
    setEditando(null); avisar(e ? `Salvo e ${dados.email} marcado como em uso no ${c.nome}` : 'Salvo no cofre'); carregar(chave)
  }

  // E-mail do estoque escrito como uso de um canal do painel → cria/atualiza o acesso em "Contas dos canais"
  function acessosDoEstoque(lista, base = itens) {
    const atuais = base.filter((i) => i.tipo !== 'estoque' && !i.quebrado)
    const saida = []
    for (const f of lista) {
      if (!f.email) continue
      for (const r of REDES_USO) {
        const c = canalDoUso(f.usos?.[r])
        if (!c) continue
        const ja = atuais.find((i) => i.canal === c.id && i.rede === r && mesmo(i.email, f.email))
          || atuais.find((i) => i.canal === c.id && i.rede === r && !i.email)
        const senha = r === 'YouTube' ? f.senha || '' : ''
        if (ja) {
          const novo = { ...ja, email: ja.email || f.email, login: ja.login || f.email, senha: ja.senha || senha }
          if (novo.email !== ja.email || novo.login !== ja.login || novo.senha !== ja.senha) saida.push(novo)
        } else {
          const handle = { YouTube: c.youtube, TikTok: c.tiktok, Instagram: c.instagram }[r] || CONHECIDAS[c.id]?.[r] || ''
          saida.push({ ...VAZIO, canal: c.id, rede: r, conta: handle || c.nome, login: f.email, email: f.email, senha,
            notas: r === 'YouTube' ? 'Ligado pelo estoque de e-mails (login Google)' : 'Ligado pelo estoque de e-mails. Senha da rede, se for diferente da do Google, colocar aqui.' })
        }
      }
    }
    return saida
  }

  // estoque de e-mails: vários de uma vez (importação) e um por vez (edição)
  async function salvarVarios(lista) {
    let n = 0
    const novos = []
    for (const a of acessosDoEstoque(lista)) {
      const { id, atualizado_em, quebrado, ...dados } = a
      const cif = await cifrar(chave, dados)
      if (id) await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', id)
      else await supabase.from('cofre').insert({ dados: cif })
    }
    for (const f of lista) {
      const { id, atualizado_em, quebrado, ...dados } = f
      const cif = await cifrar(chave, { ...dados, tipo: 'estoque' })
      if (id) { const { error } = await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', id); if (!error) n++ }
      else novos.push({ dados: cif })
    }
    for (let i = 0; i < novos.length; i += 100) {
      const { error } = await supabase.from('cofre').insert(novos.slice(i, i + 100))
      if (!error) n += Math.min(100, novos.length - i)
    }
    await carregar(chave)
    return n
  }
  async function salvarUm(f) { const n = await salvarVarios([f]); avisar(n ? 'Salvo no cofre' : 'Não salvou') }

  async function remover(id) {
    const { error } = await supabase.from('cofre').delete().eq('id', id)
    if (error) { avisar('Não apagou'); return }
    setApagar(null); carregar(chave)
  }

  async function trocarSenha(e) {
    e.preventDefault()
    const nova = e.target.nova.value, conf = e.target.conf.value
    if (nova.length < 10 || nova !== conf) { avisar(nova.length < 10 ? 'Use pelo menos 10 caracteres' : 'As duas senhas não batem'); return }
    const sal = b64(crypto.getRandomValues(new Uint8Array(16)))
    const k = await chaveDe(nova, sal, 310000)
    for (const it of itens.filter((i) => !i.quebrado)) {
      const { id, atualizado_em, ...dados } = it
      await supabase.from('cofre').update({ dados: await cifrar(k, dados) }).eq('id', id)
    }
    await supabase.from('cofre_config').update({ sal, verificador: await cifrar(k, VERIFICA), iteracoes: 310000, atualizado_em: new Date().toISOString() }).eq('id', 1)
    setCfg({ ...cfg, sal, verificador: await cifrar(k, VERIFICA), iteracoes: 310000 })
    setChave(k); setTrocar(false); avisar('Senha do cofre trocada')
  }

  const estoque = itens.filter((i) => i.tipo === 'estoque')
  const acessos = itens.filter((i) => i.tipo !== 'estoque')
  const casa = (i, t) => !t || [i.conta, i.login, i.email, i.rede, i.notas, CANAIS.find((c) => c.id === i.canal)?.nome].some((x) => String(x || '').toLowerCase().includes(t))
  const t = busca.trim().toLowerCase()
  const visiveis = acessos.filter((i) => casa(i, t))
  const preenchidos = CANAIS.reduce((a, c) => a + SLOTS.filter((r) => acessos.some((i) => i.canal === c.id && i.rede === r)).length, 0)
  const soltos = visiveis.filter((i) => !i.canal || !CANAIS.some((c) => c.id === i.canal))

  if (cfg === undefined) return <p className="p-vazio">Carregando…</p>
  if (!chave) return <section className="cf"><Entrada cfg={cfg} abrir={abrir} /></section>

  return (
    <section className="cf">
      <div className="p-cab">
        <div><h1>Cofre</h1><p className="p-sub">{acessos.length} {acessos.length === 1 ? 'acesso' : 'acessos'} e {estoque.length} {estoque.length === 1 ? 'e-mail' : 'e-mails'} no estoque, criptografados com a senha do cofre.</p></div>
        <div className="cf-acoes">
          {aba === 'contas' && <button className="p-btn p-btn--forte" onClick={() => setEditando({ rede: 'Instagram' })}>Novo acesso</button>}
          <button className="p-btn p-btn--fraco" onClick={() => setTrocar(!trocar)}>Trocar senha do cofre</button>
          <button className="p-btn" onClick={trancar}>Trancar</button>
        </div>
      </div>

      {trocar && (
        <form className="cf-form cf-trocar" onSubmit={trocarSenha} autoComplete="off">
          <label className="p-campo">Nova senha do cofre<input name="nova" type="password" autoComplete="new-password" required /></label>
          <label className="p-campo">Repita<input name="conf" type="password" autoComplete="new-password" required /></label>
          <button className="p-btn p-btn--forte">Trocar</button>
        </form>
      )}

      <div className="cf-abas" role="tablist" aria-label="Partes do cofre">
        {[['contas', 'Contas dos canais'], ['emails', `E-mails para criar contas (${estoque.length})`], ['canais', 'Canais']].map(([k, n]) => (
          <button key={k} type="button" role="tab" aria-selected={aba === k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{n}</button>
        ))}
      </div>

      {aba === 'emails' && <EmailsDisponiveis estoque={estoque} salvarVarios={salvarVarios} salvarUm={salvarUm} remover={remover} />}
      {aba === 'canais' && <CanaisCofre estoque={estoque} salvarUm={salvarUm} />}

      {editando && (
        <Janela titulo={editando.id ? 'Editar acesso' : 'Novo acesso'} sub={CANAIS.find((c) => c.id === editando.canal)?.nome || ''} fechar={() => setEditando(null)}>
          <Formulario inicial={editando} salvar={salvar} cancelar={() => setEditando(null)} estoque={estoque} />
        </Janela>
      )}

      {aba === 'contas' && <>
      <div className="cf-barra">
        <input className="cf-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conta, e-mail, rede…" aria-label="Buscar no cofre" />
        <span className="cf-progresso">{preenchidos} de {CANAIS.length * SLOTS.length} espaços preenchidos</span>
      </div>

      {CANAIS.filter((c) => !t || c.nome.toLowerCase().includes(t) || visiveis.some((i) => i.canal === c.id)).map((c) => {
        const doCanal = (t && !c.nome.toLowerCase().includes(t) ? visiveis : acessos).filter((i) => i.canal === c.id)
        const extras = doCanal.filter((i) => !SLOTS.includes(i.rede))
        return (
          <article key={c.id} className="cf-conta" style={{ '--c': c.cor }}>
            <header className="cf-conta-cab">
              {c.logo ? <img src={c.logo} alt="" /> : <span className="p-canal-sigla" style={{ '--c': c.cor }}>{c.sigla}</span>}
              <h2>{c.nome}</h2>
              <span className="cf-conta-n">{SLOTS.filter((r) => doCanal.some((i) => i.rede === r)).length}/{SLOTS.length}</span>
              <button type="button" className="cf-mais" onClick={() => setEditando({ canal: c.id, rede: 'Outro' })}>+ outro acesso</button>
            </header>
            <div className="cf-redes">
              {SLOTS.map((r) => {
                const l = doCanal.filter((i) => i.rede === r)
                if (!l.length) {
                  const conta = CONHECIDAS[c.id]?.[r] || ''
                  return (
                    <button key={r} type="button" className="cf-slot cf-slot--vazio" onClick={() => setEditando({ canal: c.id, rede: r, conta, login: conta.replace('@', '') })}>
                      <span className="cf-slot-rede">{r}</span>
                      <span>{conta ? `${conta} · ` : ''}+ adicionar</span>
                    </button>
                  )
                }
                return l.map((i) => <Acesso key={i.id} i={i} editar={() => setEditando(i)} apagar={apagar} setApagar={setApagar} remover={remover} />)
              })}
              {extras.map((i) => <Acesso key={i.id} i={i} editar={() => setEditando(i)} apagar={apagar} setApagar={setApagar} remover={remover} />)}
            </div>
          </article>
        )
      })}

      {(soltos.length > 0) && (
        <article className="cf-conta">
          <header className="cf-conta-cab"><h2>Outros acessos</h2></header>
          <div className="cf-redes">{soltos.map((i) => <Acesso key={i.id} i={i} editar={() => setEditando(i)} apagar={apagar} setApagar={setApagar} remover={remover} />)}</div>
        </article>
      )}
      </>}
    </section>
  )
}
