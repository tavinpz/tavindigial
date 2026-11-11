import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { Janela } from './Pipeline'

// Prospecção de negócios brasileiros fora do Brasil (EUA e Portugal): busca de leads e e-mail automático
export const BANDEIRA = { US: '🇺🇸', PT: '🇵🇹' }
export const horaLocal = (fuso) => {
  if (!fuso) return ''
  try { return new Date().toLocaleTimeString('pt-BR', { timeZone: fuso, hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}
// Horário bom para chamar: seg–sex, 9h às 19h no fuso do lead
export const bomHorario = (fuso) => {
  if (!fuso) return true
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: fuso, weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date()).map((x) => [x.type, x.value]))
    const h = Number(p.hour) % 24
    return !['Sat', 'Sun'].includes(p.weekday) && h >= 9 && h < 19
  } catch { return true }
}

export const CIDADES_GRINGA = [
  ['framingham', 'Framingham, MA', 'US'], ['boston', 'Boston, MA', 'US'], ['marlborough', 'Marlborough e Hudson, MA', 'US'],
  ['newark', 'Newark, NJ', 'US'], ['astoria', 'Astoria, NY', 'US'], ['danbury', 'Danbury, CT', 'US'],
  ['pompano', 'Pompano e Deerfield Beach, FL', 'US'], ['miami', 'Miami, FL', 'US'], ['orlando', 'Orlando e Kissimmee, FL', 'US'],
  ['atlanta', 'Marietta, GA (Atlanta)', 'US'], ['longbranch', 'Long Branch, NJ', 'US'], ['tampa', 'Tampa, FL', 'US'],
  ['charlotte', 'Charlotte, NC', 'US'], ['houston', 'Houston, TX', 'US'], ['dallas', 'Dallas, TX', 'US'], ['austin', 'Austin, TX', 'US'],
  ['phoenix', 'Phoenix, AZ', 'US'], ['losangeles', 'Los Angeles, CA', 'US'], ['lisboa', 'Lisboa', 'PT'], ['porto', 'Porto', 'PT'],
]

async function chamar(nome, body) {
  const { data, error } = await supabase.functions.invoke(nome, { body })
  if (error) {
    let msg = error.message
    try { msg = (await error.context?.json())?.erro || msg } catch { /* sem corpo */ }
    return { ok: false, erro: msg }
  }
  return data || { ok: false, erro: 'sem resposta' }
}

// Busca de leads por cidade. O pedido vai para uma fila (o OpenStreetMap atende um por vez)
// e cada cidade leva de 20 s a 2 min. A janela acompanha a fila sozinha.
export function JanelaBusca({ fechar, depois }) {
  const { avisar } = usePainel()
  const [pedidos, setPedidos] = useState([])
  const [enviando, setEnviando] = useState(false)

  const ler = () => supabase.from('gringa_pedidos').select('id,cidade,status,erro,resultado,criado_em').order('id', { ascending: false }).limit(80)
    .then(({ data }) => setPedidos(data || []))
  const rodando = pedidos.filter((p) => p.status === 'pendente' || p.status === 'gravando')
  useEffect(() => { ler() }, [])
  useEffect(() => {
    if (!rodando.length) return undefined
    const t = setInterval(ler, 5000)
    return () => clearInterval(t)
  }, [rodando.length])
  const antes = useRef(0)
  useEffect(() => { if (antes.current && !rodando.length) { avisar('Busca concluída'); depois?.() } antes.current = rodando.length }, [rodando.length])

  async function buscar(ids) {
    setEnviando(true)
    const r = await chamar('coletar-gringa', { cidades: ids })
    setEnviando(false)
    if (!r.ok) return avisar(r.erro || 'Não consegui pedir a busca')
    ler()
  }
  // Google Places (EUA): americanos em inglês ou brasileiros, 2 cidades por vez (cada uma leva ~40 s)
  const [gPublico, setGPublico] = useState('en')
  const [gCidades, setGCidades] = useState([])
  const [gRodando, setGRodando] = useState(false)
  async function buscarGoogle() {
    setGRodando(true)
    const r = await chamar('coletar-gringa', { acao: 'google', publico: gPublico, cidades: gCidades })
    setGRodando(false)
    if (!r.ok) return avisar(r.erro || 'Não consegui buscar no Google')
    avisar(`${r.gravados} leads novos${r.erro ? ` (aviso: ${r.erro})` : ''}`)
    depois?.()
  }
  const ultimo = (id) => pedidos.find((p) => p.cidade === id)
  const texto = (p) => {
    if (!p) return 'ainda não buscada'
    if (p.status === 'pendente') return 'na fila do OpenStreetMap…'
    if (p.status === 'gravando') return 'gravando os leads…'
    if (p.status === 'erro') return `não deu: ${p.erro || 'erro'}`
    const r = p.resultado || {}
    return `${r.gravados ?? 0} novos de ${r.encontrados ?? 0} encontrados · ${new Date(p.criado_em).toLocaleDateString('pt-BR')}`
  }

  return (
    <Janela titulo="Buscar leads gringos" sub="Negócios brasileiros nos EUA e negócios de Portugal, com telefone ou e-mail. Quem já está no painel não volta." fechar={fechar} larga
      rodape={<button type="button" className="p-btn p-btn--forte" disabled={enviando || rodando.length > 0} onClick={() => buscar(CIDADES_GRINGA.map(([id]) => id))}>{rodando.length ? `Buscando (${rodando.length} na fila)…` : 'Buscar em todas as cidades'}</button>}>
      <ul className="gr-cidades">
        {CIDADES_GRINGA.map(([id, nome, pais]) => {
          const p = ultimo(id)
          const ocupada = p && (p.status === 'pendente' || p.status === 'gravando')
          return (
            <li key={id}>
              <span className="gr-cid-nome">{BANDEIRA[pais]} {nome}</span>
              <small className={p?.status === 'erro' ? 'gr-erro' : ''}>{texto(p)}</small>
              <button type="button" className="p-btn p-btn--mini" disabled={enviando || ocupada} onClick={() => buscar([id])}>{ocupada ? 'Buscando…' : p ? 'Buscar de novo' : 'Buscar'}</button>
            </li>
          )
        })}
      </ul>
      <div className="gr-google">
        <h3>Google (EUA): os melhores leads</h3>
        <p className="p-meta">Só traz quem não tem site bom, tem telefone e já tem 5+ avaliações. Uma cidade por vez (leva cerca de 1 minuto).</p>
        <div className="crm-gfiltros">
          <button type="button" className={`crm-chip ${gPublico === 'en' ? 'on' : ''}`} onClick={() => setGPublico('en')}>Americanos (inglês)</button>
          <button type="button" className={`crm-chip ${gPublico === 'br' ? 'on' : ''}`} onClick={() => setGPublico('br')}>Brasileiros nos EUA</button>
        </div>
        <div className="crm-gfiltros">
          {CIDADES_GRINGA.filter((c) => c[2] === 'US').map(([id, nome]) => {
            const on = gCidades.includes(id)
            return <button key={id} type="button" className={`crm-chip ${on ? 'on' : ''}`} aria-pressed={on}
              onClick={() => setGCidades((g) => (on ? g.filter((x) => x !== id) : [id]))}>{nome}</button>
          })}
        </div>
        <button type="button" className="p-btn p-btn--forte" disabled={gRodando || !gCidades.length} onClick={buscarGoogle}>{gRodando ? 'Buscando no Google (cerca de 1 min)…' : 'Buscar no Google'}</button>
      </div>
      <p className="p-meta">Fonte da lista acima: OpenStreetMap (grátis). Depois de gravar, o painel visita o site de quem tem um e procura o e-mail de contato para a sequência de e-mail.</p>
    </Janela>
  )
}

const PADRAO = { host: 'smtp.gmail.com', porta: 465, usuario: '', senha: '', nome: 'Gustavo · Tavin Digital', email: '', endereco: '', limite_dia: 40, assinatura: '' }

// Caixa de e-mail (SMTP) e números da sequência
export function JanelaEmail({ fechar }) {
  const { avisar } = usePainel()
  const [f, setF] = useState(null)
  const [st, setSt] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState(false)

  const ler = () => {
    supabase.rpc('ver_email_smtp').then(({ data }) => setF({ ...PADRAO, ...(data || {}), senha: '' }))
    chamar('email-prospeccao', { acao: 'status' }).then(setSt)
  }
  useEffect(ler, [])
  const campo = (k) => ({ value: f?.[k] ?? '', onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) })

  async function salvar() {
    setSalvando(true)
    const { senha, tem_senha: _t, ...resto } = f
    const { error } = await supabase.rpc('salvar_email_smtp', { p: { ...resto, porta: Number(resto.porta) || 465, limite_dia: Number(resto.limite_dia) || 40, ...(senha ? { senha } : {}) } })
    setSalvando(false)
    if (error) return avisar('Não consegui salvar. Tente de novo.')
    avisar('Caixa de e-mail salva'); ler()
  }
  async function testar() {
    setTestando(true)
    const r = await chamar('email-prospeccao', { acao: 'teste', para: f.email })
    setTestando(false)
    avisar(r.ok ? `E-mail de teste enviado para ${f.email}` : r.erro)
  }

  return (
    <Janela titulo="E-mail automático" sub="3 e-mails por lead (dia 0, 3 e 7), em horário comercial de lá, e para sozinho quando ele responde ou pede para sair." fechar={fechar} larga
      rodape={<>
        <button type="button" className="p-btn" disabled={!f || testando || !st?.configurado} onClick={testar}>{testando ? 'Enviando…' : 'Mandar teste para mim'}</button>
        <button type="button" className="p-btn p-btn--forte" disabled={!f || salvando} onClick={salvar}>{salvando ? 'Salvando…' : 'Salvar'}</button>
      </>}>
      {st && (
        <div className="gr-email-nums">
          <div><b>{st.pendentes ?? 0}</b><small>na fila</small></div>
          <div><b>{st.ultimas_24h ?? 0}</b><small>enviados em 24h</small></div>
          <div><b>{st.enviados ?? 0}</b><small>enviados no total</small></div>
          <div><b>{st.erros ?? 0}</b><small>com erro</small></div>
          <div><b>{st.descadastros ?? 0}</b><small>pediram para sair</small></div>
        </div>
      )}
      {st && !st.configurado && <p className="p-aviso-txt">Falta configurar a caixa: sem ela nada é enviado.</p>}
      {!f ? <p className="p-meta">Carregando…</p> : (
        <div className="gr-form">
          <label>Servidor<input {...campo('host')} placeholder="smtp.gmail.com" /></label>
          <label>Porta<input {...campo('porta')} inputMode="numeric" placeholder="465" /></label>
          <label>Usuário (login da caixa)<input {...campo('usuario')} autoComplete="off" placeholder="prospeccao@tavindigital.online" /></label>
          <label>Senha de app<input type="password" {...campo('senha')} autoComplete="new-password" placeholder={f.tem_senha ? 'Salva. Preencha só para trocar' : 'Senha de app (não a senha normal)'} /></label>
          <label>Nome que aparece<input {...campo('nome')} /></label>
          <label>E-mail que envia<input type="email" {...campo('email')} placeholder="prospeccao@tavindigital.online" /></label>
          <label className="gr-form-largo">Endereço comercial (a lei dos EUA exige no rodapé)<input {...campo('endereco')} placeholder="Rua, número, cidade, estado, país" /></label>
          <label>Máximo por dia<input {...campo('limite_dia')} inputMode="numeric" /></label>
          <label>Assinatura (opcional)<input {...campo('assinatura')} placeholder="Gustavo · Tavin Digital · tavindigital.online" /></label>
        </div>
      )}
      <details className="gr-ajuda">
        <summary>Como pegar a senha de app (Gmail ou Google Workspace)</summary>
        <ol>
          <li>Na conta Google do e-mail de prospecção, ative a verificação em duas etapas.</li>
          <li>Abra myaccount.google.com/apppasswords, crie uma senha com o nome "Painel" e copie os 16 caracteres.</li>
          <li>Cole aqui em "Senha de app". Servidor smtp.gmail.com, porta 465.</li>
        </ol>
        <p>Comece com 30 a 40 por dia numa caixa nova e suba aos poucos: caixa que dispara muito no primeiro dia cai no spam.</p>
      </details>
    </Janela>
  )
}

export const iniciarEmails = (ids) => chamar('email-prospeccao', { acao: 'enfileirar', ids })
