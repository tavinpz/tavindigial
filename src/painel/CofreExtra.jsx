import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CANAIS, slugCanal } from './canais'
import { usePainel } from './Painel'
import { Janela } from './Pipeline'

// Duas abas do Cofre além das contas dos canais:
//  • E-mails para criar contas: o estoque de contas Google (criptografado como o resto do cofre),
//    com onde cada uma já está em uso (YouTube, TikTok, Instagram). Importa colando da planilha.
//  • Canais: cria um canal novo no painel (aparece no menu na hora) e puxa a foto do Instagram.
export const REDES_USO = ['YouTube', 'TikTok', 'Instagram']
export const livre = (e, r) => !String(e.usos?.[r] || '').trim()
const norm = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/^@/, '')
// Canal do painel que corresponde ao que foi escrito no uso (nome, id ou @ do canal)
export function canalDoUso(v) {
  const n = norm(v)
  if (!n) return null
  return CANAIS.find((c) => [c.nome, c.id, c.youtube, c.tiktok, c.instagram].some((x) => x && norm(x) === n)) || null
}
// Lista de canais do painel para o campo de uso (aparece ao digitar)
export function ListaCanais({ id, extras = [] }) {
  const nomes = [...new Set([...CANAIS.map((c) => c.nome), ...extras])]
  return <datalist id={id}>{nomes.map((n) => <option key={n} value={n} />)}</datalist>
}

// Linhas coladas da planilha (Google Sheets separa as colunas com TAB)
export function lerColagem(txt) {
  const corta = (l) => (/\t|;|\|| {2,}/.test(l) ? l.split(/\t|;|\|| {2,}/) : l.split(/ +/))
  const linhas = String(txt || '').split(/\r?\n/).map((l) => corta(l).map((c) => c.trim()).filter(Boolean)).filter((c) => c.length)
  const ok = [], fora = []
  for (const cel of linhas) {
    const i = cel.findIndex((c) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(c))
    if (i < 0) { if (cel.some((c) => /@|gmail/i.test(c)) || cel.length >= 2) fora.push(cel.join(' · ')); continue }
    const depois = cel.slice(i + 2)
    const duas = depois.find((c) => /^(sim|siim|não|nao)$/i.test(c))
    ok.push({
      email: cel[i].toLowerCase().replace('@gmial.com', '@gmail.com'),
      senha: cel[i + 1] && !/^(sim|siim|não|nao|feminino|masculino)$/i.test(cel[i + 1]) ? cel[i + 1] : '',
      rotulo: cel.slice(0, i).filter((c) => !/^\d+$/.test(c)).join(' ').replace(/^https?:\/\/(www\.)?/, '').slice(0, 60),
      perfil: (depois.find((c) => /^(feminino|masculino)$/i.test(c)) || '').toLowerCase(),
      duas_etapas: duas ? /^s/i.test(duas) : null,
    })
  }
  return { ok, fora: fora.filter((l) => !/^(e-?mail|senha|quantos|tik ?tok)/i.test(l)) }
}

function Copiavel({ valor, segredo }) {
  const [ver, setVer] = useState(false)
  const [ok, setOk] = useState(false)
  if (!valor) return <span className="ce-vazio">—</span>
  return (
    <span className="ce-copia">
      <span className={segredo && !ver ? 'cf-val--oculto' : ''}>{segredo && !ver ? '••••••••' : valor}</span>
      {segredo && <button type="button" onClick={() => setVer(!ver)}>{ver ? 'Esconder' : 'Ver'}</button>}
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(valor); setOk(true); setTimeout(() => setOk(false), 1300) } catch { /* sem clipboard */ } }}>{ok ? '✓' : 'Copiar'}</button>
    </span>
  )
}

function EditarEmail({ e, salvar, fechar, remover, extras = [] }) {
  const [f, setF] = useState({ ...e, usos: { ...(e.usos || {}) } })
  const [apagar, setApagar] = useState(false)
  return (
    <Janela titulo={e.id ? 'Editar e-mail' : 'Novo e-mail'} sub={e.email || ''} fechar={fechar}
      rodape={<>
        {e.id && (apagar
          ? <button type="button" className="p-btn cf-perigo" onClick={() => remover(e.id)}>Apagar mesmo</button>
          : <button type="button" className="p-btn p-btn--fraco" onClick={() => setApagar(true)}>Apagar</button>)}
        <button type="button" className="p-btn p-btn--forte" onClick={() => salvar(f)} disabled={!f.email}>Salvar</button>
      </>}>
      <div className="cf-grade">
        <label className="p-campo">E-mail<input type="email" value={f.email || ''} onChange={(x) => setF({ ...f, email: x.target.value.trim().toLowerCase() })} /></label>
        <label className="p-campo">Senha<input value={f.senha || ''} onChange={(x) => setF({ ...f, senha: x.target.value })} autoComplete="off" /></label>
        <label className="p-campo">Perfil
          <select value={f.perfil || ''} onChange={(x) => setF({ ...f, perfil: x.target.value })}><option value="">—</option><option value="feminino">Feminino</option><option value="masculino">Masculino</option></select>
        </label>
        <label className="p-campo">Verificação em 2 etapas
          <select value={f.duas_etapas == null ? '' : f.duas_etapas ? 'sim' : 'nao'} onChange={(x) => setF({ ...f, duas_etapas: x.target.value === '' ? null : x.target.value === 'sim' })}><option value="">Não sei</option><option value="sim">Ligada</option><option value="nao">Desligada</option></select>
        </label>
        {REDES_USO.map((r) => {
          const c = canalDoUso(f.usos[r])
          return (
            <label key={r} className="p-campo">Em uso no {r} <small>(vazio = livre)</small>
              <input list="ce-canais" value={f.usos[r] || ''} onChange={(x) => setF({ ...f, usos: { ...f.usos, [r]: x.target.value } })} placeholder="Digite o canal" />
              {c ? <small className="ce-liga">Liga ao canal {c.nome}: entra em Contas dos canais</small> : f.usos[r] ? <small>Fora do painel (só anotado)</small> : null}
            </label>
          )
        })}
        <ListaCanais id="ce-canais" extras={extras} />
        <label className="p-campo cf-largo">Observações<textarea rows={2} value={f.notas || ''} onChange={(x) => setF({ ...f, notas: x.target.value })} placeholder="Ex.: pede verificação por SMS, telefone 4947" /></label>
      </div>
    </Janela>
  )
}

function Importar({ fechar, importar }) {
  const [txt, setTxt] = useState('')
  const [uso, setUso] = useState('')
  const [indo, setIndo] = useState(false)
  const lido = useMemo(() => lerColagem(txt), [txt])
  return (
    <Janela titulo="Importar e-mails e senhas" sub="Cole da planilha ou uma conta por linha: e-mail e senha. E-mail que já está no cofre só ganha a senha que falta." fechar={fechar} larga
      rodape={<button type="button" className="p-btn p-btn--forte" disabled={!lido.ok.length || indo} onClick={async () => { setIndo(true); await importar(lido.ok, uso); setIndo(false) }}>
        {indo ? 'Guardando…' : `Guardar ${lido.ok.length} no cofre`}</button>}>
      <label className="p-campo">Essas contas estão
        <select value={uso} onChange={(e) => setUso(e.target.value)}>
          <option value="">Livres (ainda não usadas em nada)</option>
          {REDES_USO.map((r) => <option key={r} value={r}>Já em uso no {r} (o nome na frente do e-mail vira o canal)</option>)}
        </select>
      </label>
      <label className="p-campo">Linhas da planilha<textarea rows={9} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={'conta1@gmail.com senha1\nconta2@gmail.com senha2\nCUTE PETS\tconta3@gmail.com\tsenha3\tNÃO'} /></label>
      {txt && (
        <p className="p-meta">{lido.ok.length} {lido.ok.length === 1 ? 'conta lida' : 'contas lidas'}{lido.fora.length ? ` · ${lido.fora.length} linha(s) sem e-mail ficaram de fora: ${lido.fora.slice(0, 3).join(' | ')}` : ''}. {lido.ok.filter((c) => c.senha).length} com senha. E-mail que já está no cofre só ganha a senha e o uso que faltam (nada é apagado nem trocado).</p>
      )}
      {lido.ok.length > 0 && (
        <ul className="ce-previa">{lido.ok.slice(0, 6).map((c) => <li key={c.email}><b>{c.email}</b>{c.rotulo ? ` · ${c.rotulo}` : ''}{c.perfil ? ` · ${c.perfil}` : ''}{c.senha ? ' · com senha' : ' · sem senha'}</li>)}{lido.ok.length > 6 && <li>e mais {lido.ok.length - 6}…</li>}</ul>
      )}
    </Janela>
  )
}

const FILTRO0 = { rede: '', sit: '', senha: '', perfil: '', duas: '', canal: '' }

function Chips({ rotulo, valor, opcoes, mudar }) {
  return (
    <div className="ce-grupo" role="group" aria-label={rotulo}>
      <span className="ce-grupo-rot">{rotulo}</span>
      {opcoes.map(([v, n, q]) => (
        <button key={v || 'todos'} type="button" className={valor === v ? 'on' : ''} aria-pressed={valor === v} onClick={() => mudar(valor === v && v ? '' : v)}>
          {n}{q != null && <small>{q}</small>}
        </button>
      ))}
    </div>
  )
}

function UsoChip({ v }) {
  const c = canalDoUso(v)
  if (!c) return <span className="ce-chip" title={v}>{v}</span>
  return (
    <span className="ce-chip ce-chip--canal" style={{ '--c': c.cor }} title={`Ligado ao canal ${c.nome}`}>
      {c.logo ? <img src={c.logo} alt="" /> : <i aria-hidden="true" />}{c.nome}
    </span>
  )
}

export function EmailsDisponiveis({ estoque, salvarVarios, salvarUm, remover }) {
  const { avisar } = usePainel() || { avisar: () => {} }
  const [fi, setFi] = useState(() => { try { return { ...FILTRO0, ...JSON.parse(localStorage.getItem('cofre-filtro') || '{}') } } catch { return FILTRO0 } })
  useEffect(() => { try { localStorage.setItem('cofre-filtro', JSON.stringify(fi)) } catch { /* sem storage */ } }, [fi])
  const muda = (k) => (v) => setFi({ ...fi, [k]: v })
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('az')
  const [editando, setEditando] = useState(null)
  const [importando, setImportando] = useState(false)
  const conta = (r) => estoque.filter((e) => livre(e, r)).length
  const tudo = estoque.filter((e) => REDES_USO.every((r) => livre(e, r))).length
  const t = busca.trim().toLowerCase()
  const redesDe = (r) => (r ? [r] : REDES_USO)
  const canaisDe = (e) => REDES_USO.map((r) => canalDoUso(e.usos?.[r])?.id).filter(Boolean)
  // chave de cada uso: canal do painel pelo id, o resto pelo nome escrito (assim aparece tudo, não só o que está no painel)
  const chaveUso = (v) => { const c = canalDoUso(v); return c ? c.id : `x:${norm(v)}` }
  const usosDe = (e) => REDES_USO.filter((r) => !livre(e, r)).map((r) => chaveUso(e.usos[r]))

  // cada filtro sozinho (para os números dos botões levarem em conta os outros filtros)
  const testa = {
    rede: () => true,
    sit: (e, f) => !f.sit || (f.sit === 'livre' ? redesDe(f.rede).every((r) => livre(e, r)) : redesDe(f.rede).some((r) => !livre(e, r))),
    senha: (e, f) => !f.senha || (f.senha === 'com' ? !!e.senha : !e.senha),
    perfil: (e, f) => !f.perfil || e.perfil === f.perfil,
    duas: (e, f) => !f.duas || (f.duas === 'sim' ? e.duas_etapas === true : e.duas_etapas !== true),
    canal: (e, f) => !f.canal || (f.canal === 'painel' ? canaisDe(e).length > 0 : f.canal === 'fora' ? usosDe(e).some((k) => k.startsWith('x:')) : usosDe(e).includes(f.canal)),
    busca: (e) => !t || [e.email, e.notas, ...Object.values(e.usos || {})].some((x) => String(x || '').toLowerCase().includes(t)),
  }
  const passa = (e, f, menos) => Object.entries(testa).every(([k, fn]) => k === menos || fn(e, f))
  const quantos = (k, v) => estoque.filter((e) => passa(e, { ...fi, [k]: v }, null)).length

  const peso = (e) => redesDe(fi.rede).filter((r) => !livre(e, r)).length
  const lista = estoque.filter((e) => passa(e, fi, null)).sort((a, b) =>
    ordem === 'uso' ? peso(b) - peso(a) || a.email.localeCompare(b.email)
      : ordem === 'livre' ? peso(a) - peso(b) || a.email.localeCompare(b.email)
        : a.email.localeCompare(b.email))
  const algumFiltro = Object.values(fi).some(Boolean) || t
  const semSenha = estoque.filter((e) => !e.senha).length
  // todos os canais que aparecem nas contas, com quantos e-mails cada um
  const todosCanais = (() => {
    const m = {}
    for (const e of estoque) for (const r of REDES_USO) {
      if (livre(e, r)) continue
      const v = String(e.usos[r]).trim(), c = canalDoUso(v), k = c ? c.id : `x:${norm(v)}`
      m[k] = m[k] || { k, nome: c ? c.nome : v, painel: !!c, emails: new Set() }
      m[k].emails.add(e.email)
    }
    return Object.values(m).sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
  })()

  async function importar(linhas, uso) {
    const porEmail = Object.fromEntries(estoque.map((e) => [e.email, e]))
    const mudados = {}
    for (const l of linhas) {
      const atual = mudados[l.email] || porEmail[l.email] || { tipo: 'estoque', email: l.email, senha: '', perfil: '', duas_etapas: null, usos: {}, notas: '' }
      const novo = { ...atual, usos: { ...(atual.usos || {}) } }
      if (l.senha && !novo.senha) novo.senha = l.senha
      if (l.perfil && !novo.perfil) novo.perfil = l.perfil
      if (l.duas_etapas != null && novo.duas_etapas == null) novo.duas_etapas = l.duas_etapas
      if (uso && !String(novo.usos[uso] || '').trim()) novo.usos[uso] = l.rotulo || 'em uso'
      mudados[l.email] = novo
    }
    const n = await salvarVarios(Object.values(mudados))
    avisar(`${n} ${n === 1 ? 'e-mail guardado' : 'e-mails guardados'} no cofre`)
    setImportando(false)
  }

  // pega o primeiro e-mail livre na rede escolhida e já abre para ligar ao canal
  function proximaLivre() {
    const r = fi.rede || 'YouTube'
    const e = estoque.filter((x) => livre(x, r) && x.senha).sort((a, b) => a.email.localeCompare(b.email))[0] || estoque.find((x) => livre(x, r))
    if (!e) { avisar(`Nenhum e-mail livre para ${r}`); return }
    setEditando(e)
  }

  const numOn = (rede, sit) => fi.rede === rede && fi.sit === sit
  return (
    <section className="ce">
      <div className="ce-topo">
        <div className="ce-nums">
          <button type="button" className={!algumFiltro ? 'on' : ''} onClick={() => { setFi(FILTRO0); setBusca('') }}><b>{estoque.length}</b><small>no estoque</small></button>
          <button type="button" className={numOn('', 'livre') ? 'on' : ''} onClick={() => setFi({ ...fi, rede: '', sit: 'livre' })}><b>{tudo}</b><small>livres em tudo</small></button>
          {REDES_USO.map((r) => <button key={r} type="button" className={numOn(r, 'livre') ? 'on' : ''} onClick={() => setFi({ ...fi, rede: r, sit: 'livre' })}><b>{conta(r)}</b><small>livres p/ {r}</small></button>)}
        </div>
        <div className="ce-acoes">
          <input className="cf-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar e-mail ou canal" aria-label="Buscar e-mail" />
          <button type="button" className="p-btn" onClick={proximaLivre}>Pegar próxima livre{fi.rede ? ` (${fi.rede})` : ''}</button>
          <button type="button" className="p-btn" onClick={() => setImportando(true)}>Importar e-mails e senhas</button>
          <button type="button" className="p-btn p-btn--forte" onClick={() => setEditando({ tipo: 'estoque', usos: {} })}>Novo e-mail</button>
        </div>
        <div className="ce-filtros">
          <Chips rotulo="Rede" valor={fi.rede} mudar={muda('rede')} opcoes={[['', 'Todas'], ...REDES_USO.map((r) => [r, r])]} />
          <Chips rotulo="Situação" valor={fi.sit} mudar={muda('sit')} opcoes={[['', 'Todas'], ['livre', 'Livre', quantos('sit', 'livre')], ['uso', 'Em uso', quantos('sit', 'uso')]]} />
          <Chips rotulo="Senha" valor={fi.senha} mudar={muda('senha')} opcoes={[['', 'Todas'], ['com', 'Com senha', quantos('senha', 'com')], ['sem', 'Sem senha', quantos('senha', 'sem')]]} />
          <Chips rotulo="Perfil" valor={fi.perfil} mudar={muda('perfil')} opcoes={[['', 'Todos'], ['feminino', 'Feminino', quantos('perfil', 'feminino')], ['masculino', 'Masculino', quantos('perfil', 'masculino')]]} />
          <Chips rotulo="2 etapas" valor={fi.duas} mudar={muda('duas')} opcoes={[['', 'Todas'], ['sim', 'Ligada', quantos('duas', 'sim')], ['nao', 'Desligada ou não sei', quantos('duas', 'nao')]]} />
          <div className="ce-grupo">
            <label className="ce-grupo-rot" htmlFor="ce-canal">Canal</label>
            <select id="ce-canal" value={fi.canal} onChange={(e) => muda('canal')(e.target.value)}>
              <option value="">Todos</option>
              <option value="painel">Ligados a um canal do painel</option>
              <option value="fora">Canais fora do painel</option>
              {todosCanais.some((c) => c.painel) && <optgroup label="No painel">{todosCanais.filter((c) => c.painel).map((c) => <option key={c.k} value={c.k}>{c.nome} ({c.emails.size})</option>)}</optgroup>}
              {todosCanais.some((c) => !c.painel) && <optgroup label="Fora do painel">{todosCanais.filter((c) => !c.painel).map((c) => <option key={c.k} value={c.k}>{c.nome} ({c.emails.size})</option>)}</optgroup>}
            </select>
            <label className="ce-grupo-rot" htmlFor="ce-ordem">Ordem</label>
            <select id="ce-ordem" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
              <option value="az">E-mail A–Z</option><option value="uso">Em uso primeiro</option><option value="livre">Livres primeiro</option>
            </select>
          </div>
        </div>
        <p className="p-meta ce-resumo">
          Mostrando {lista.length} de {estoque.length}
          {semSenha > 0 && <> · <button type="button" className="ce-link" onClick={() => setFi({ ...fi, senha: 'sem' })}>{semSenha} sem senha</button> (use "Importar e-mails e senhas" para preencher de uma vez)</>}
          {algumFiltro && <> · <button type="button" className="ce-link" onClick={() => { setFi(FILTRO0); setBusca('') }}>Limpar filtros</button></>}
        </p>
      </div>
      {estoque.length === 0 ? <p className="p-vazio">Nenhum e-mail ainda. Copie as colunas de e-mail e senha na planilha e clique em "Importar e-mails e senhas".</p> : (
        <div className="ce-tabela" role="table" aria-label="E-mails para criar contas">
          <div className="ce-linha ce-cab" role="row"><span>E-mail</span><span>Senha</span>{REDES_USO.map((r) => <span key={r} className={fi.rede === r ? 'ce-col-on' : ''}>{r}</span>)}<span /></div>
          {lista.map((e) => (
            <div key={e.id} className="ce-linha" role="row">
              <span className="ce-email"><Copiavel valor={e.email} />{(e.perfil || e.duas_etapas != null) && <small>{[e.perfil, e.duas_etapas === true ? '2 etapas ligada' : e.duas_etapas === false ? 'sem 2 etapas' : ''].filter(Boolean).join(' · ')}</small>}</span>
              <span>{e.senha ? <Copiavel valor={e.senha} segredo /> : <button type="button" className="ce-chip ce-chip--sem" onClick={() => setEditando(e)}>Sem senha · adicionar</button>}</span>
              {REDES_USO.map((r) => (
                <span key={r} className={fi.rede === r ? 'ce-col-on' : ''} data-rede={r}>
                  {livre(e, r) ? <span className="ce-chip ce-chip--livre">Livre</span> : <UsoChip v={e.usos[r]} />}
                </span>
              ))}
              <span><button type="button" className="ce-editar" onClick={() => setEditando(e)}>Editar</button></span>
            </div>
          ))}
          {lista.length === 0 && <p className="p-meta ce-nada">Nada com esses filtros.</p>}
        </div>
      )}
      {editando && <EditarEmail e={editando} extras={todosCanais.filter((c) => !c.painel).map((c) => c.nome)} fechar={() => setEditando(null)} salvar={async (f) => { await salvarUm(f); setEditando(null) }} remover={async (id) => { await remover(id); setEditando(null) }} />}
      {importando && <Importar fechar={() => setImportando(false)} importar={importar} />}
    </section>
  )
}

// ── Canais: criar canal novo e puxar a foto do Instagram ──
const CORES = ['#B600F6', '#15A763', '#F2B33D', '#FF4D00', '#2459B8', '#E02424', '#0E9F9A', '#2B2B2B']
export function CanaisCofre({ estoque, salvarUm }) {
  const { avisar, recarregarCanais } = usePainel() || { avisar: () => {}, recarregarCanais: () => {} }
  const [f, setF] = useState({ nome: '', tipo: 'shorts', cor: CORES[4], instagram: '', youtube: '', tiktok: '', email: '' })
  const [indo, setIndo] = useState(false)
  const [foto, setFoto] = useState(null)
  const [arquivados, setArquivados] = useState([])
  const lerArquivados = () => supabase.from('canais').select('id,nome,cor,sigla,logo').eq('ativo', false).order('nome').then(({ data }) => setArquivados(data || []))
  useEffect(() => { lerArquivados() }, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const id = slugCanal(f.nome)
  const existe = CANAIS.some((c) => c.id === id)
  const livres = estoque.filter((e) => REDES_USO.some((r) => livre(e, r)))

  async function criar(e) {
    e.preventDefault()
    if (!id || existe) return
    setIndo(true)
    const arroba = (x) => { const v = x.trim().replace(/^.*\.com\//, '').replace(/^@?/, '@'); return v === '@' ? null : v }
    const sigla = f.nome.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || f.nome.slice(0, 2).toUpperCase()
    const { error } = await supabase.from('canais').insert({ id, nome: f.nome.trim(), tipo: f.tipo, cor: f.cor, sigla, instagram: arroba(f.instagram), youtube: f.youtube.trim() || null, tiktok: arroba(f.tiktok) })
    if (error) { setIndo(false); avisar('Não criou o canal'); return }
    if (f.youtube.trim()) await supabase.rpc('salvar_youtube_canal', { p_canal: id, p_ref: f.youtube.trim() })
    if (f.tiktok.trim()) await supabase.rpc('salvar_tiktok_canal', { p_canal: id, p_handle: f.tiktok.trim() })
    await recarregarCanais()
    // marca no estoque que esse e-mail agora é deste canal (nas redes preenchidas) e liga em Contas dos canais
    const conta = estoque.find((x) => x.email === f.email)
    if (conta) {
      const usos = { ...(conta.usos || {}) }
      if (f.youtube.trim()) usos.YouTube = f.nome.trim()
      if (f.tiktok.trim()) usos.TikTok = f.nome.trim()
      if (f.instagram.trim()) usos.Instagram = f.nome.trim()
      await salvarUm({ ...conta, usos })
    }
    setIndo(false)
    setF({ nome: '', tipo: 'shorts', cor: CORES[4], instagram: '', youtube: '', tiktok: '', email: '' })
    avisar(`${f.nome.trim()} criado: já está no menu. Abra o canal → Integrações para ligar o Instagram.`)
  }

  async function puxarFoto(c) {
    setFoto(c.id)
    const { data, error } = await supabase.functions.invoke('foto-perfil', { body: { canal: c.id } })
    if (error || !data?.ok) { setFoto(null); avisar(`Não deu: ${data?.erro || 'erro'}`); return }
    await recarregarCanais(); setFoto(null); avisar(`Foto do ${data.de}${data.username ? ` (${data.username})` : ''} no painel`)
  }
  async function esconder(c) {
    await supabase.from('canais').update({ ativo: false }).eq('id', c.id)
    await recarregarCanais(); lerArquivados(); avisar(`${c.nome} arquivado (os vídeos continuam guardados)`)
  }
  async function desarquivar(c) {
    await supabase.from('canais').update({ ativo: true }).eq('id', c.id)
    await recarregarCanais(); lerArquivados(); avisar(`${c.nome} voltou para o menu`)
  }

  return (
    <section className="cc">
      <form className="cc-form" onSubmit={criar} autoComplete="off">
        <h2>Canal novo</h2>
        <div className="cc-grade">
          <label className="p-campo">Nome no painel<input value={f.nome} onChange={set('nome')} placeholder="Ex.: Papo de Mãe" required />{existe && <small className="p-erro">Já existe um canal com esse nome</small>}</label>
          <label className="p-campo">Tipo
            <select value={f.tipo} onChange={set('tipo')}><option value="shorts">Vídeos curtos</option><option value="marca">Marca (posts e carrosséis)</option><option value="longo">Vídeo longo (YouTube)</option></select>
          </label>
          <label className="p-campo">E-mail usado (do estoque)
            <select value={f.email} onChange={set('email')}>
              <option value="">—</option>
              {livres.map((e) => <option key={e.id} value={e.email}>{e.email}{e.perfil ? ` (${e.perfil})` : ''}</option>)}
            </select>
          </label>
          <label className="p-campo">@ do Instagram<input value={f.instagram} onChange={set('instagram')} placeholder="@perfil" /></label>
          <label className="p-campo">YouTube (@ ou link)<input value={f.youtube} onChange={set('youtube')} placeholder="@canal" /></label>
          <label className="p-campo">@ do TikTok<input value={f.tiktok} onChange={set('tiktok')} placeholder="@perfil" /></label>
          <div className="p-campo cc-largo">Cor
            <div className="cc-cores" role="radiogroup" aria-label="Cor do canal">
              {CORES.map((c) => <button key={c} type="button" role="radio" aria-checked={f.cor === c} aria-label={c} className={f.cor === c ? 'on' : ''} style={{ '--c': c }} onClick={() => setF({ ...f, cor: c })} />)}
            </div>
          </div>
        </div>
        <div className="cc-pe"><button className="p-btn p-btn--forte" disabled={indo || !id || existe}>{indo ? 'Criando…' : 'Criar canal'}</button></div>
      </form>

      <ul className="cc-lista">
        {CANAIS.map((c) => (
          <li key={c.id} style={{ '--c': c.cor }}>
            {c.logo ? <img src={c.logo} alt="" /> : <span className="p-canal-sigla" style={{ '--c': c.cor }}>{c.sigla}</span>}
            <span className="cc-nome"><b>{c.nome}</b><small>{[c.instagram, c.youtube, c.tiktok && `TT ${c.tiktok}`].filter(Boolean).join(' · ') || 'sem @ cadastrado'}</small></span>
            <button type="button" className="p-btn p-btn--mini" disabled={foto === c.id} onClick={() => puxarFoto(c)}>{foto === c.id ? 'Puxando…' : 'Puxar foto'}</button>
            <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => esconder(c)}>Arquivar</button>
          </li>
        ))}
      </ul>
      {arquivados.length > 0 && (
        <>
          <h2 className="cc-arq-tit">Arquivados</h2>
          <ul className="cc-lista cc-lista--arq">
            {arquivados.map((c) => (
              <li key={c.id} style={{ '--c': c.cor }}>
                {c.logo ? <img src={c.logo} alt="" /> : <span className="p-canal-sigla" style={{ '--c': c.cor }}>{c.sigla}</span>}
                <span className="cc-nome"><b>{c.nome}</b><small>fora do menu e das views</small></span>
                <button type="button" className="p-btn p-btn--mini" onClick={() => desarquivar(c)}>Desarquivar</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
