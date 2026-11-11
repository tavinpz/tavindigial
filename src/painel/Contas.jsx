import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { Janela } from './Pipeline'

// Várias contas no mesmo canal (ex.: 10 TikToks de cortes). O TikTok é lido sozinho a cada hora
// pela página pública: seguidores, vídeos e curtidas do dia entram na soma do canal no menu.
const REDES = { tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube' }
const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
const num = (n) => (n == null ? '–' : Number(n).toLocaleString('pt-BR'))

export default function Contas({ canal, fechar }) {
  const { avisar } = usePainel()
  const [contas, setContas] = useState(null)
  const [dias, setDias] = useState({})
  const [rede, setRede] = useState('tiktok')
  const [handle, setHandle] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function ler() {
    const { data } = await supabase.from('contas').select('id,rede,handle,apelido,ativo').eq('canal', canal.id).order('criado_em')
    setContas(data || [])
    const ids = (data || []).map((c) => c.id)
    if (!ids.length) return setDias({})
    const { data: d } = await supabase.from('contas_dia').select('conta,dia,seguidores,posts,curtidas_inicio,curtidas_atual').in('conta', ids).eq('dia', hoje())
    setDias(Object.fromEntries((d || []).map((x) => [x.conta, x])))
  }
  useEffect(() => { ler() }, [canal.id])

  async function adicionar(e) {
    e.preventDefault()
    const h = handle.trim().replace(/^https?:\/\/(www\.)?[^/]+\/@?/, '').replace(/^@/, '').replace(/[/?].*$/, '')
    if (!/^[A-Za-z0-9_.]{2,30}$/.test(h)) return avisar('Digite o @ da conta, sem espaços.')
    setSalvando(true)
    const { error } = await supabase.from('contas').insert({ canal: canal.id, rede, handle: h.toLowerCase() })
    setSalvando(false)
    if (error) return avisar(error.code === '23505' ? 'Essa conta já está no painel.' : 'Não consegui adicionar.')
    setHandle('')
    avisar(`@${h} adicionada. Os números aparecem na próxima leitura (até 1 hora).`)
    ler()
  }
  async function alternar(c) {
    await supabase.from('contas').update({ ativo: !c.ativo }).eq('id', c.id)
    ler()
  }
  async function remover(c) {
    if (!window.confirm(`Tirar @${c.handle} do painel? O histórico dela some junto.`)) return
    await supabase.from('contas').delete().eq('id', c.id)
    ler()
  }

  const total = Object.values(dias).reduce((s, d) => s + Math.max(0, (d.curtidas_atual || 0) - (d.curtidas_inicio || 0)), 0)

  return (
    <Janela titulo="Contas do canal" sub={`${canal.nome}: ${contas?.length || 0} conta${contas?.length === 1 ? '' : 's'}${total ? ` · ${num(total)} curtidas hoje` : ''}`} fechar={fechar} larga>
      <form className="ct-nova" onSubmit={adicionar}>
        <select value={rede} onChange={(e) => setRede(e.target.value)} aria-label="Rede">
          {Object.entries(REDES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@ da conta ou link do perfil" aria-label="@ da conta" />
        <button type="submit" className="p-btn p-btn--forte" disabled={salvando}>Adicionar</button>
      </form>
      {contas === null ? <p className="p-meta">Carregando…</p> : !contas.length ? (
        <p className="p-meta">Nenhuma conta extra ainda. Adicione as contas de cortes deste canal: cada uma é lida sozinha a cada hora.</p>
      ) : (
        <table className="ct-tabela">
          <thead><tr><th>Conta</th><th>Seguidores</th><th>Vídeos</th><th>Curtidas hoje</th><th /></tr></thead>
          <tbody>
            {contas.map((c) => {
              const d = dias[c.id]
              return (
                <tr key={c.id} className={c.ativo ? '' : 'ct-off'}>
                  <td><b>@{c.handle}</b><small>{REDES[c.rede]}{c.rede !== 'tiktok' ? ' · leitura automática em breve' : ''}</small></td>
                  <td>{num(d?.seguidores)}</td>
                  <td>{num(d?.posts)}</td>
                  <td>{d ? num(Math.max(0, (d.curtidas_atual || 0) - (d.curtidas_inicio || 0))) : '–'}</td>
                  <td className="ct-acoes">
                    <button type="button" className="crm-btn" onClick={() => alternar(c)}>{c.ativo ? 'Pausar' : 'Ativar'}</button>
                    <button type="button" className="crm-btn crm-btn--leve" onClick={() => remover(c)}>Tirar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <p className="p-meta">O TikTok público mostra curtidas, não views. Para ver as views de cada vídeo, cada conta precisa ser conectada pela API oficial do TikTok, que é o próximo passo.</p>
    </Janela>
  )
}
