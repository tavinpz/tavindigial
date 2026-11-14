import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { CANAIS } from './canais'

// Logins de visitantes: cada pessoa vê só os canais marcados, sem poder mexer em nada.
async function chamar(body) {
  const { data, error } = await supabase.functions.invoke('painel-acessos', { body })
  if (error) {
    let msg = 'Não consegui salvar'
    try { msg = (await error.context.json()).erro || msg } catch { /* sem corpo */ }
    throw new Error(msg)
  }
  return data
}

function Canais({ marcados, mudar }) {
  return (
    <div className="ac-canais">
      {CANAIS.map((c) => (
        <label key={c.id} className={`ac-canal ${marcados.includes(c.id) ? 'on' : ''}`} style={{ '--c': c.cor }}>
          <input type="checkbox" checked={marcados.includes(c.id)} onChange={(e) => mudar(e.target.checked ? [...marcados, c.id] : marcados.filter((x) => x !== c.id))} />
          {c.logo ? <img src={c.logo} alt="" /> : <span className="ac-sigla">{c.sigla}</span>}
          {c.nome}
        </label>
      ))}
    </div>
  )
}

export default function Acessos() {
  const { avisar } = usePainel()
  const [lista, setLista] = useState(null)
  const [novo, setNovo] = useState({ nome: '', email: '', senha: '', canais: [] })
  const [ocupado, setOcupado] = useState('')
  const [edit, setEdit] = useState({})
  const [apagar, setApagar] = useState(null)

  const carregar = () => supabase.from('painel_acessos').select('user_id,email,nome,canais,criado_em').order('criado_em')
    .then(({ data }) => setLista(data || []))
  useEffect(() => { carregar() }, [])

  async function criar(e) {
    e.preventDefault()
    if (!novo.canais.length) { avisar('Marque pelo menos um canal'); return }
    setOcupado('criar')
    try {
      await chamar({ acao: 'criar', ...novo })
      avisar(`Login criado para ${novo.email}`)
      setNovo({ nome: '', email: '', senha: '', canais: [] })
      carregar()
    } catch (err) { avisar(err.message, 4000) } finally { setOcupado('') }
  }
  async function salvar(a) {
    setOcupado(a.user_id)
    try { await chamar({ acao: 'editar', user_id: a.user_id, canais: edit[a.user_id] }); avisar('Canais atualizados'); setEdit((x) => { const y = { ...x }; delete y[a.user_id]; return y }); carregar() } catch (err) { avisar(err.message, 4000) } finally { setOcupado('') }
  }
  async function trocarSenha(a) {
    const senha = edit[`s:${a.user_id}`] || ''
    setOcupado(a.user_id)
    try { await chamar({ acao: 'senha', user_id: a.user_id, senha }); avisar('Senha trocada'); setEdit((x) => ({ ...x, [`s:${a.user_id}`]: undefined })) } catch (err) { avisar(err.message, 4000) } finally { setOcupado('') }
  }
  async function remover(a) {
    setOcupado(a.user_id)
    try { await chamar({ acao: 'remover', user_id: a.user_id }); avisar(`${a.email} removido`); setApagar(null); carregar() } catch (err) { avisar(err.message, 4000) } finally { setOcupado('') }
  }

  return (
    <section className="ac">
      <header className="ac-cab">
        <h1>Acessos</h1>
        <p>Crie logins para outras pessoas acompanharem os canais. Cada uma vê só os canais que você marcar e não consegue mudar nada.</p>
      </header>

      <form className="ac-bloco" onSubmit={criar}>
        <h2>Novo acesso</h2>
        <div className="ac-linha">
          <label className="p-campo">Nome<input id="ac-nome" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Ex.: Marina (roteiro)" /></label>
          <label className="p-campo">E-mail<input id="ac-email" type="email" required value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} placeholder="pessoa@email.com" /></label>
          <label className="p-campo">Senha<input id="ac-senha" type="text" required minLength={8} value={novo.senha} onChange={(e) => setNovo({ ...novo, senha: e.target.value })} placeholder="mínimo 8 caracteres" /></label>
        </div>
        <span className="ac-rot">Canais que essa pessoa pode ver</span>
        <Canais marcados={novo.canais} mudar={(canais) => setNovo({ ...novo, canais })} />
        <button className="p-btn p-btn--forte" disabled={ocupado === 'criar'}>{ocupado === 'criar' ? 'Criando…' : 'Criar acesso'}</button>
        <p className="ac-dica">Mande para a pessoa o endereço tavindigital.online/painel, o e-mail e a senha.</p>
      </form>

      <div className="ac-bloco">
        <h2>Quem tem acesso</h2>
        {lista === null ? <p className="p-vazio">Carregando…</p> : !lista.length ? <p className="p-vazio">Ninguém ainda.</p> : lista.map((a) => {
          const marcados = edit[a.user_id] || a.canais
          const mudou = !!edit[a.user_id]
          return (
            <article key={a.user_id} className="ac-pessoa">
              <div className="ac-pessoa-cab">
                <div><strong>{a.nome || a.email}</strong>{a.nome && <small>{a.email}</small>}</div>
                {apagar === a.user_id
                  ? <span className="ac-acoes"><button type="button" className="p-btn p-btn--mini cf-perigo" onClick={() => remover(a)} disabled={ocupado === a.user_id}>Remover mesmo</button><button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => setApagar(null)}>Não</button></span>
                  : <button type="button" className="p-btn p-btn--mini p-btn--fraco" onClick={() => setApagar(a.user_id)}>Remover</button>}
              </div>
              <Canais marcados={marcados} mudar={(c) => setEdit((x) => ({ ...x, [a.user_id]: c }))} />
              <div className="ac-acoes">
                {mudou && <button type="button" className="p-btn p-btn--mini p-btn--forte" onClick={() => salvar(a)} disabled={ocupado === a.user_id}>Salvar canais</button>}
                <input id={`ac-s-${a.user_id}`} className="ac-senha" type="text" placeholder="nova senha" value={edit[`s:${a.user_id}`] || ''} onChange={(e) => setEdit((x) => ({ ...x, [`s:${a.user_id}`]: e.target.value }))} />
                <button type="button" className="p-btn p-btn--mini" onClick={() => trocarSenha(a)} disabled={ocupado === a.user_id || (edit[`s:${a.user_id}`] || '').length < 8}>Trocar senha</button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
