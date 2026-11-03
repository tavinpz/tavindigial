import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CANAIS } from './canais'
import { usePainel } from './Painel'

// Cofre de acessos (cadeado no menu): logins, e-mails e senhas das contas de cada perfil.
// A senha mestra nunca sai deste navegador: dela sai a chave (PBKDF2) que criptografa cada acesso (AES-GCM).
// O banco só guarda texto embaralhado. Esqueceu a senha mestra = não tem como recuperar.
const TRANCA_MIN = 10
const VERIFICA = 'cofre-tavin-ok'
const REDES = ['Instagram', 'YouTube', 'TikTok', 'E-mail', 'Facebook', 'Kiwify', 'Outro']
const VAZIO = { canal: '', rede: 'Instagram', conta: '', login: '', email: '', senha: '', telefone: '', recuperacao: '', notas: '' }
const SUGESTOES = [
  ['tavin-digital', 'Instagram', '@tavindigital'], ['thata', 'Instagram', '@thata.ia'],
  ['concrete-atlas', 'Instagram', '@concreteatlas.labs'], ['concrete-atlas', 'YouTube', '@concreteatlas.studio'],
  ['zerando', 'Instagram', '@zerando.90'], ['loadbearing', 'Instagram', '@loadbearing.mind'], ['pawslated', 'Instagram', '@pawslated'],
]

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

function Formulario({ inicial, salvar, cancelar }) {
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
        <label className="p-campo">E-mail ligado<input type="email" value={f.email} onChange={set('email')} placeholder="conta@gmail.com" /></label>
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
    setChave(k); ultimo.current = Date.now(); await carregar(k)
  }

  async function salvar(f) {
    const { id, atualizado_em, quebrado, ...dados } = f
    const cif = await cifrar(chave, dados)
    const { error } = id
      ? await supabase.from('cofre').update({ dados: cif, atualizado_em: new Date().toISOString() }).eq('id', id)
      : await supabase.from('cofre').insert({ dados: cif })
    if (error) { avisar('Não salvou'); return }
    setEditando(null); avisar('Salvo no cofre'); carregar(chave)
  }

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

  const grupos = useMemo(() => {
    const t = busca.trim().toLowerCase()
    const l = itens.filter((i) => !t || [i.conta, i.login, i.email, i.rede, i.notas, CANAIS.find((c) => c.id === i.canal)?.nome].some((x) => String(x || '').toLowerCase().includes(t)))
    const ordem = [...CANAIS.map((c) => c.id), '']
    return ordem.map((id) => ({ canal: CANAIS.find((c) => c.id === id), itens: l.filter((i) => (i.canal || '') === id) })).filter((g) => g.itens.length)
  }, [itens, busca])
  const faltam = SUGESTOES.filter(([c, r, conta]) => !itens.some((i) => i.canal === c && i.rede === r && (i.conta || '').toLowerCase() === conta))

  if (cfg === undefined) return <p className="p-vazio">Carregando…</p>
  if (!chave) return <section className="cf"><Entrada cfg={cfg} abrir={abrir} /></section>

  return (
    <section className="cf">
      <div className="p-cab">
        <div><h1>Cofre</h1><p className="p-sub">{itens.length} {itens.length === 1 ? 'acesso guardado' : 'acessos guardados'}, criptografados com a senha do cofre.</p></div>
        <div className="cf-acoes">
          <button className="p-btn p-btn--forte" onClick={() => setEditando({})}>Novo acesso</button>
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

      {editando && <Formulario inicial={editando} salvar={salvar} cancelar={() => setEditando(null)} />}

      {itens.length > 3 && <input className="cf-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conta, e-mail, rede…" aria-label="Buscar no cofre" />}

      {faltam.length > 0 && !editando && (
        <div className="cf-sugestoes">
          <p>Contas que o painel já conhece e ainda não estão aqui. Clique para preencher:</p>
          <div>{faltam.map(([c, r, conta]) => (
            <button key={c + r} type="button" className="p-btn p-btn--mini" onClick={() => setEditando({ canal: c, rede: r, conta, login: conta.replace('@', '') })}>
              {CANAIS.find((x) => x.id === c)?.nome} · {r} {conta}
            </button>
          ))}</div>
        </div>
      )}

      {itens.length === 0 && !editando && <p className="p-vazio">O cofre está vazio. Comece por "Novo acesso" ou por uma das contas acima.</p>}

      {grupos.map(({ canal, itens: l }) => (
        <div key={canal?.id || 'outros'} className="cf-grupo">
          <h2>
            {canal ? (canal.logo ? <img src={canal.logo} alt="" /> : <span className="p-canal-sigla" style={{ '--c': canal.cor }}>{canal.sigla}</span>) : null}
            {canal?.nome || 'Outros acessos'}
          </h2>
          <ul>
            {l.map((i) => (
              <li key={i.id} className="cf-item">
                {i.quebrado ? <p className="p-erro">Este acesso foi salvo com outra senha do cofre e não abre.</p> : (
                  <>
                    <div className="cf-item-cab">
                      <b>{i.conta}</b><span className="cf-rede">{i.rede}</span>
                      <span className="cf-item-acoes">
                        <button type="button" onClick={() => setEditando(i)}>Editar</button>
                        {apagar === i.id
                          ? <><button type="button" className="cf-perigo" onClick={() => remover(i.id)}>Apagar mesmo</button><button type="button" onClick={() => setApagar(null)}>Não</button></>
                          : <button type="button" onClick={() => setApagar(i.id)}>Apagar</button>}
                      </span>
                    </div>
                    <Campo rotulo="Login" valor={i.login} />
                    <Campo rotulo="E-mail" valor={i.email} />
                    <Campo rotulo="Senha" valor={i.senha} segredo />
                    <Campo rotulo="Telefone" valor={i.telefone} />
                    <Campo rotulo="Recuperação" valor={i.recuperacao} segredo />
                    {i.notas && <p className="cf-notas">{i.notas}</p>}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
